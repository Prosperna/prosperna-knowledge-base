---
id: st-05-subscription-cancellation-and-retention-flow
title: PRD. ST-05 Subscription Cancellation and Retention Flow
sidebar_label: ST-05 Subscription Cancellation and Retention Flow
sidebar_position: 5
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft

---

## Summary

This PRD covers the full implementation of the Subscription Cancellation & Retention Flow for the Prosperna Merchant Dashboard. It replaces the existing `revertToFreePlan()` behavior with a scheduled cancellation system that retains merchant access until the billing period ends, presents a multi-step retention flow before processing cancellation, allows merchants to void a pending cancellation at any time, and provides a formal voluntary downgrade path.

Key behaviors:
- Cancellation is **scheduled** (not immediate) — merchant retains full access until billing period ends
- A **retention flow** (reason selection + conditional counter-offer) runs before any cancellation is confirmed
- Merchants can **resubscribe** (void cancellation) before the billing period ends
- Downgrade to a lower plan is **scheduled** for the end of the billing period with excess resource handling
- All cancellation data is captured for analytics

---

## User Journey

### Happy Path — Full Cancellation

1. Merchant on an active paid plan (Launch/Grow/Scale) navigates to Billing page (`/home/billing`)
2. Merchant clicks the "Cancel Subscription" link/button
3. Modal opens — **Step 1:** Merchant selects a cancellation reason from radio group; clicks "Continue with Cancellation"
4. **Step 1b (conditional):** Counter-offer is shown based on the selected reason
5. Merchant dismisses the counter-offer and clicks "Continue with Cancellation"
6. **Step 2:** Confirmation modal shows what will happen — plan stays active until `[BILLING_PERIOD_END_DATE]`, store goes offline after that, data preserved, can resubscribe
7. Merchant clicks "Confirm Cancellation"
8. Success toast: "Your subscription has been cancelled. Your plan remains active until [DATE]."
9. Dashboard shows persistent pending cancellation banner on all pages
10. "Cancellation Confirmed" email sent to merchant
11. At billing period end: `cancellation-processor` job calls `suspendMerchant()` → store goes offline → "Post-Cancellation Suspended" email sent

### Happy Path — Resubscription (Void Cancellation)

1. Merchant in pending cancellation state clicks "[Resubscribe]" in the dashboard banner
2. Confirmation dialog: "Would you like to keep your [PLAN_NAME] plan?"
3. Merchant clicks "Yes, Keep My Plan"
4. Cancellation voided — payment gateway re-activated via `PaymentGatewayService.reactivateSubscription()`
5. Banner disappears. Billing page restored to normal state.
6. Success toast: "Welcome back! Your [PLAN_NAME] plan will continue as normal."

### Happy Path — Voluntary Downgrade

1. Merchant on Grow or Scale clicks "Change Plan" → selects a lower plan
2. System checks resources against new plan limits; generates excess resource warnings if applicable
3. Downgrade confirmation modal shows: plan change date, new limits, and any resource warnings
4. Merchant clicks "Confirm Downgrade"
5. Downgrade scheduled for end of billing period
6. Success toast: "Your plan will change to [NEW_PLAN] on [DATE]."
7. "Downgrade Confirmed" email sent
8. At billing period end: plan tier is lowered, new limits take effect, excess resources handled per type

### Alternate and Failure Paths

| Scenario | Behavior |
|---|---|
| Merchant clicks "Keep My Plan" at any step | Modal closes, no state change |
| Merchant selects "Business closing" reason | Counter-offer step is skipped — proceeds directly to Step 2 confirmation (empathetic message only) |
| Merchant accepts counter-offer (downgrade) | Downgrade is scheduled (Section 8 flow) → modal closes → toast "Your plan will change to [plan] on [date]" |
| Merchant submits feature request counter-offer | Feature request is recorded → merchant STILL on cancellation flow → proceeds to Step 2 |
| Counter-offer dismissed; merchant continues | Second counter-offer is NOT shown — goes straight to confirmation |
| Merchant tries to downgrade while cancellation is pending | Action blocked — merchant must void the cancellation first |
| Merchant upgrades while cancellation is pending | Upgrade proceeds; cancellation record updated with `resubscribed = true`; banner removed |
| `cancelSubscription()` gateway call fails | Internal state rolls back; error shown: "Something went wrong. Please try again or contact support." |
| `cancellation-processor` fails for a merchant | Error logged; retry on next job run; ops alert if failure count > 5 |
| Merchant cancels on last day of billing period | `effective_date` = end of today; processor runs early next morning; merchant has hours of pending state — acceptable |

---

## Functional Requirements

**FR-1: Cancel Subscription Button Visibility**
The "Cancel Subscription" button/link is visible only to merchants on active paid plans (LAUNCH, GROW, SCALE). It is NOT shown to merchants on TRIAL or in SUSPENDED state.

**FR-2: Cancellation Flow Modal — Step 1 (Reason Selection)**
On clicking "Cancel Subscription", a modal opens with:
- Title: "We're sorry to see you go!"
- Required radio button group with 6 options: `too_expensive` / `not_using_enough` / `missing_features` / `switching_platform` / `business_closing` / `other`
- When "Other" is selected, a text input field appears: "Please tell us more..." (optional but encouraged)
- Two action buttons: "Continue with Cancellation" and "Keep My Plan"
- Merchant cannot proceed without selecting a reason (required field validation)

**FR-3: Conditional Counter-Offer Presentation (Step 1b)**
After reason selection and clicking "Continue with Cancellation", a counter-offer screen is shown (within the same modal) based on the reason:

| Reason | Counter-Offer Content |
|---|---|
| `too_expensive` | Downgrade offer to the next lower plan (or "You're already on our most affordable plan" if on Launch). Shows plan comparison with pricing. CTA: "Downgrade to [Plan]" |
| `not_using_enough` | Display recent usage stats (orders, products, store visits). Show 2–3 feature tips. Prompt: "Would a pause help? You can come back anytime." Proceeds to Step 2. |
| `missing_features` | Feature request text area. "Submit Feature Request" button (submitting does NOT cancel). "Continue with Cancellation" button. |
| `switching_platform` | Quick 2-question survey. Export data help link. Proceeds to Step 2. |
| `business_closing` | Empathetic message only. No counter-offer. Proceeds directly to Step 2. |
| `other` | Generic retention message. "Contact Support" link. Proceeds to Step 2. |

Counter-offers are shown ONCE per cancellation attempt. If dismissed, the merchant goes directly to Step 2 — no repeated offers.

**FR-4: Cancellation Confirmation Modal (Step 2)**
Confirmation modal shows:
- Title: "Are you sure you want to cancel?"
- Bullet list: plan stays active until `[BILLING_PERIOD_END_DATE]`, store goes offline after that, data preserved, can resubscribe before that date
- Two buttons: "Confirm Cancellation" (danger-styled) and "Keep My Plan" (primary-styled)

**FR-5: Cancellation Scheduling (Not Immediate)**
On "Confirm Cancellation":
1. Create `subscription_cancellations` record with `effective_date` = billing period end date
2. Call `PaymentGatewayService.cancelSubscription()`:
   - Stripe: `cancel_at_period_end: true`
   - Xendit: schedule deactivation for period end (or immediate if Xendit does not support `cancel_at_period_end` — coordinate with payment team)
3. Update internal subscription state to `cancelled`
4. Return `effective_date` to frontend
5. Trigger "Cancellation Confirmed" email

**FR-6: Pending Cancellation Dashboard State**
After cancellation is confirmed:
- **Persistent banner** at the top of every dashboard page: "Your plan has been cancelled. Your store will go offline on [DATE]. [Resubscribe]"
  - Not dismissable
  - "[Resubscribe]" is a clickable link to the resubscription confirmation dialog
  - Disappears only when (a) merchant resubscribes or (b) billing period ends and account is suspended
- **Billing page:** Current plan card shows "Cancellation Pending" badge (yellow/orange). "Cancel Subscription" button replaced by "Resubscribe" button. "Change Plan" link hidden or disabled.
- **Full access:** Merchant retains complete access to all dashboard features and usage limits during pending cancellation — no restrictions until the billing period ends.

**FR-7: Resubscription Flow (Void Cancellation)**
Entry points: "[Resubscribe]" in pending cancellation banner, or "Resubscribe" button on Billing page.
Flow:
1. Confirmation dialog: "Would you like to keep your [PLAN_NAME] plan? Your subscription will continue as normal."
2. On "Yes, Keep My Plan":
   - Update `subscription_cancellations` record: `resubscribed = true`, `resubscription_date = now`
   - Call `PaymentGatewayService.reactivateSubscription()`:
     - Stripe: `cancel_at_period_end: false`
     - Xendit: re-activate recurring plan (or create new one if old was deactivated)
   - Update internal subscription state to `active`
   - Remove pending cancellation banner
   - Restore "Cancel Subscription" button on billing page
   - Show toast: "Welcome back! Your [PLAN_NAME] plan will continue as normal."
3. Billing cycle is preserved — no new charge, no cycle restart

**FR-8: Voluntary Downgrade Flow**
Triggered when merchant selects a lower-tier plan from the plan selection UI.
- Downgrade is scheduled for the end of the current billing period — not immediate
- Confirmation modal shows: current plan, new plan, effective date, and new limits
- If resources exceed new plan limits: excess resource warning section added to modal (see FR-9)
- On confirm: record pending plan change, trigger "Downgrade Confirmed" email, show toast
- "Cannot downgrade while cancellation is pending" validation: block downgrade if `subscription_cancellations` record exists with `resubscribed = false` and `effective_date` in the future

**FR-9: Excess Resource Handling on Downgrade (at effective date)**
When the downgrade takes effect at billing period end:

| Resource | If Exceeds New Plan Limit | Handling |
|---|---|---|
| Product SKUs | Yes | Excess products HIDDEN from storefront (not deleted). Merchant warned with count. |
| Storage | Yes | Upload NEW files blocked (existing files NOT purged). Merchant warned to free up space. |
| Admin users | Yes | Overflow admins ARCHIVED using existing 30-day deletion logic. Merchant warned before confirmation. |
| Store locations | Yes | Excess locations handled per existing location downgrade logic. Merchant warned before confirmation. |
| Orders/Bandwidth | N/A | Resets with new billing cycle — no carryover. |

Pre-downgrade warning shown in confirmation modal if any resource would exceed the new limit.

**FR-10: cancellation-processor Background Job**
- Schedule: daily at 2:00 AM UTC (recommended)
- Query: `subscription_cancellations` where `effective_date <= now`, `resubscribed = false`, merchant NOT already in SUSPENDED state
- For each match: call `suspendMerchant(store_id, 'cancelled')`, send "Post-Cancellation Suspended" email, log event
- Must be idempotent — safe to re-run without double-suspending
- Error handling: log individual failures, continue processing others, alert ops if failure count > 5 in a single run

**FR-11: Payment Gateway Synchronization**
All cancellation and reactivation events must be synchronized with the payment gateway via the Payment Abstraction Layer (ST-01). Internal state must not diverge from gateway state. On gateway call failure: roll back internal state, surface error to the user.

**FR-12: Email Notifications**

| Email | Trigger | Template |
|---|---|---|
| Cancellation Confirmed | Merchant clicks "Confirm Cancellation" | `billing/cancellation-confirmed.hbs` |
| Post-Cancellation Suspended | `cancellation-processor` suspends the account | `billing/post-cancellation-suspended.hbs` |
| Downgrade Confirmed | Merchant confirms downgrade | `billing/downgrade-confirmed.hbs` |

**FR-13: Cancellation Analytics Capture**
Every `subscription_cancellations` record must capture: `cancellation_reason`, `cancellation_reason_detail` (for "other"), `counter_offer_shown`, `counter_offer_accepted`, `resubscribed`, `resubscription_date`. All fields used by the admin analytics dashboard (ST-12).

**FR-14: Admin Platform — Cancellation Analytics View**
Provides data for ST-12 to display:
- Total cancellations (month, 30-day, all time)
- Cancellation reasons breakdown (chart)
- Counter-offer acceptance rate
- Resubscription rate
- Win-back rate (30-day post-suspension)

**FR-15: Admin Platform — Merchant Account Detail**
Individual merchant account views must surface:
- If pending cancellation: "Cancellation Pending — effective [DATE]"
- If suspended due to cancellation: "Suspended (Cancelled) since [DATE]"
- Action buttons: "Void Cancellation" (manual override), "Reactivate Account" (routes to ST-04)

---

## Non-Functional Requirements

**NFR-1: Idempotency**
The `cancellation-processor` job must be idempotent. Re-running the job must not suspend an already-suspended merchant or send duplicate suspension emails.

**NFR-2: Auditability**
All cancellation events (confirmation, resubscription, gateway call outcomes) must be logged with timestamp, merchant ID, store ID, and action type. Audit logs must be queryable by the ops team.

**NFR-3: Performance**
- `POST /api/v1/subscription/cancel` and `POST /api/v1/subscription/resubscribe` must respond within 500ms at p95 (exclusive of external gateway latency).
- Cancellation flow modal must open within 200ms of button click.

**NFR-4: Security and Authorization**
- Merchants can only cancel or resubscribe their own subscription. Requests are validated against the authenticated merchant's `store_id`.
- Admin void and reactivation actions require admin role authorization.
- Cancellation reason data is not exposed in any public-facing API.

**NFR-5: Data Retention**
Per ST-04 policy: all merchant data is preserved indefinitely on cancellation. The `subscription_cancellations` record must never be deleted — it is an audit and analytics record.

**NFR-6: Gateway Consistency**
Internal cancellation state and payment gateway state must remain consistent. On any gateway API failure, internal state must be rolled back. Alert on divergence.

**NFR-7: Graceful Degradation**
If the gateway call during cancellation times out or returns an error, the operation must fail cleanly. The merchant must NOT be left in a partially-cancelled state (e.g., internal state = cancelled but gateway = active).

---

## UX Notes

- **Tone matters.** The cancellation flow must be respectful and non-manipulative. No guilt-tripping language. No "are you sure you REALLY want to leave?" patterns. The "Keep My Plan" exit is always visible and prominent.
- **Counter-offers are shown once.** No repeated offer on the same cancellation attempt. Merchants who click through the counter-offer to confirmation are committed — do not interrupt again.
- **Danger styling for "Confirm Cancellation".** The final confirmation button should be styled with a danger color (red or muted red) to signal irreversibility of the intent, while "Keep My Plan" is styled as primary to make the retention path visually easier.
- **The billing page in pending cancellation** must visually communicate the pending state clearly (badge, changed buttons) without alarming the merchant — they still have full access.
- **Downgrade excess resource warnings** must be specific: show exact counts ("1,300 of your products will be hidden"). Vague warnings cause support tickets.

---

## Data Model Notes

### New Collection: `subscription_cancellations` (in `payment-integration-api` database)

```
{
  _id: ObjectId,
  merchant_id: ObjectId (ref stores),
  store_id: String,
  previous_plan: String,              // 'LAUNCH' | 'GROW' | 'SCALE'
  cancellation_reason: String,        // 'too_expensive' | 'not_using_enough' | 'missing_features' | 'switching_platform' | 'business_closing' | 'other'
  cancellation_reason_detail: String, // free text (for 'other' or feature request text)
  cancellation_date: Date,            // when merchant clicked "Confirm Cancellation"
  effective_date: Date,               // billing period end date — suspension trigger date
  counter_offer_shown: String,        // 'downgrade' | 'usage_stats' | 'feature_request' | 'survey' | 'empathetic' | 'generic' | null
  counter_offer_accepted: Boolean,    // default: false
  resubscribed: Boolean,              // default: false
  resubscription_date: Date,          // nullable
  resubscribed_plan: String,          // nullable
  created_at: Date,
  updated_at: Date
}
```

Indexes:
- `{ merchant_id: 1, effective_date: 1 }` — for the `cancellation-processor` job
- `{ cancellation_reason: 1, created_at: 1 }` — for analytics queries

### Store Model (no new fields in ST-05)
The cancellation state is tracked in `subscription_cancellations`. The `suspendedAt`, `suspendedReason`, and `lastActivePlan` fields (from ST-04) are populated when suspension takes effect.

### Service Functions (in `business-profile-api/src/services/store-plan.service.ts`)

**New: `cancelPlan(store_id, reason, reason_detail, counter_offer_data)`** — Replaces `revertToFreePlan()`. Validates active paid plan, calculates effective date, creates cancellation record, calls gateway, updates subscription state, triggers email.

**New: `resubscribePlan(store_id)`** — Reverses pending cancellation. Validates pending cancellation exists and is not expired. Updates record, reactivates gateway, updates subscription state.

**New: `schedulePlanDowngrade(store_id, target_plan)`** — Validates current plan > target plan, checks resource limits, records downgrade, triggers email with resource warnings.

---

## Integrations and APIs

| Integration | Used for |
|---|---|
| **ST-01: PaymentGatewayService.cancelSubscription()** | Stripe `cancel_at_period_end: true`; Xendit deactivation |
| **ST-01: PaymentGatewayService.reactivateSubscription()** | Stripe `cancel_at_period_end: false`; Xendit re-activation |
| **ST-04: suspendMerchant(store_id, reason)** | Called by `cancellation-processor` at billing period end |
| **Email Service** | Sends cancellation confirmed, post-cancellation suspended, downgrade confirmed emails |
| **Product Team Feature Request Channel** | Receives feature request text from "Missing features" counter-offer (destination TBD: DB collection, Slack, or ClickUp) |

---

## Error Handling

| Error | User-Facing Message | System Action |
|---|---|---|
| Gateway `cancelSubscription()` fails | "Something went wrong processing your cancellation. Please try again or contact support." | Roll back internal state; log error |
| Gateway `reactivateSubscription()` fails | "Something went wrong restoring your subscription. Please try again or contact support." | Log error; keep internal state as cancelled (no false-positive restore) |
| Cancellation reason not selected | Inline validation: "Please select a reason to continue." | Block form submission |
| Merchant not on active paid plan (guard) | (Should not occur — UI hides cancel button; backend validates) | Return 403 with `INVALID_PLAN_STATE` |
| Downgrade blocked by pending cancellation | "You have a pending cancellation. Please resubscribe first to change your plan." | Return 409 |
| `cancellation-processor` individual merchant failure | (Not user-facing) | Log error, continue processing, retry next run, alert ops if >5 failures |

---

## Telemetry and Analytics

| Event | When | Properties |
|---|---|---|
| `cancellation_flow_opened` | Merchant clicks "Cancel Subscription" | `merchant_id`, `store_id`, `plan` |
| `cancellation_reason_selected` | Merchant selects a reason | `merchant_id`, `reason` |
| `counter_offer_shown` | Counter-offer step is displayed | `merchant_id`, `reason`, `counter_offer_type` |
| `counter_offer_accepted` | Merchant accepts counter-offer | `merchant_id`, `reason`, `counter_offer_type` |
| `counter_offer_dismissed` | Merchant clicks "Continue with Cancellation" from counter-offer | `merchant_id`, `reason`, `counter_offer_type` |
| `cancellation_confirmed` | Merchant clicks "Confirm Cancellation" | `merchant_id`, `store_id`, `plan`, `effective_date` |
| `cancellation_voided` | Merchant resubscribes | `merchant_id`, `store_id`, `plan`, `days_since_cancellation` |
| `downgrade_confirmed` | Merchant confirms downgrade | `merchant_id`, `store_id`, `from_plan`, `to_plan`, `effective_date` |
| `account_suspended_cancellation` | `cancellation-processor` suspends account | `merchant_id`, `store_id`, `previous_plan` |
| `feature_request_submitted` | Merchant submits feature request in counter-offer | `merchant_id`, `feature_request_text` (anonymized for analytics) |

---

## Rollout Plan

1. **Deploy ST-01 (Payment Abstraction Layer) and ST-04 (Suspended Account State) first** — ST-05 depends on both.
2. **Deploy `cancelPlan()` service function** behind a feature flag. `revertToFreePlan()` remains active until the Free Plan removal is complete.
3. **Enable the cancellation flow UI** behind a feature flag for internal testing.
4. **Run `cancellation-processor` in dry-run mode** first — log what it would do without calling `suspendMerchant()`.
5. **Full rollout** after migration day (ST-16) when the Free Plan is removed.
6. **Decommission `revertToFreePlan()`** after confirming no active references in production.

---

## Open Questions

| ID | Question | Assumption |
|---|---|---|
| OQ-1 | Does Xendit support `cancel_at_period_end` natively? | Assumed: if not, the Xendit adapter will schedule a deactivation job to run at period end, or deactivate immediately. To be confirmed with payment team. |
| OQ-2 | Where do feature requests from "Missing features" counter-offer get routed? | Assumed: stored in a `feature_requests` DB collection for now. Product team to define final routing (Slack, ClickUp, etc.). |
| OQ-3 | When excess SKUs are hidden on downgrade, are they sorted by most recently updated or by creation date? | Assumed: most recently updated SKUs are kept visible first. To be confirmed with product team. |
| OQ-4 | Should upgrading while in pending cancellation state require explicit confirmation that it voids the cancellation? | Assumed: yes — upgrade flow should show a brief "This will cancel your pending cancellation" notice before processing. |
| OQ-5 | What is the exact admin role permission required for "Void Cancellation" in the admin panel? | Assumed: same role as other ST-04 manual override actions. To be confirmed with ST-12 team. |

---

# Gherkin User Stories

## Feature: ST-05 Subscription Cancellation and Retention Flow

### FR-1 / FR-2: Cancel Subscription Button and Reason Selection

```gherkin
Feature: Cancellation Flow Entry and Reason Selection

  Scenario: Active paid merchant sees cancel button on billing page
    Given a merchant is authenticated and on an active GROW plan
    When the merchant navigates to /home/billing
    Then a "Cancel Subscription" button or link is visible
    And the button is styled as a de-emphasized secondary action

  Scenario: Trial merchant does not see cancel button
    Given a merchant is authenticated and on a TRIAL plan
    When the merchant navigates to /home/billing
    Then no "Cancel Subscription" button is visible

  Scenario: Suspended merchant does not see cancel button
    Given a merchant is authenticated and in SUSPENDED state
    When the merchant navigates to /home/billing
    Then no "Cancel Subscription" button is visible

  Scenario: Merchant opens cancellation modal and must select a reason
    Given a merchant is on an active paid plan
    And the merchant is on the billing page
    When the merchant clicks "Cancel Subscription"
    Then a modal opens titled "We're sorry to see you go!"
    And a required radio button group with 6 cancellation reasons is displayed
    And a "Continue with Cancellation" button and a "Keep My Plan" button are visible

  Scenario: Merchant cannot proceed without selecting a reason
    Given the cancellation modal is open on Step 1
    When the merchant clicks "Continue with Cancellation" without selecting a reason
    Then an inline validation message appears: "Please select a reason to continue."
    And the modal does not advance

  Scenario: "Other" reason shows a free-text field
    Given the cancellation modal is open on Step 1
    When the merchant selects "Other"
    Then a text input field appears: "Please tell us more..."
    And the field is optional

  Scenario: Merchant closes the modal without cancelling
    Given the cancellation modal is open
    When the merchant clicks "Keep My Plan"
    Then the modal closes
    And no cancellation is initiated
    And the billing page is unchanged
```

### FR-3: Conditional Counter-Offer Presentation

```gherkin
Feature: Counter-Offer Presentation by Cancellation Reason

  Scenario: "Too expensive" reason shows downgrade offer
    Given the merchant has selected "Too expensive" and clicked "Continue with Cancellation"
    When the counter-offer step is displayed
    Then the modal shows a downgrade offer to the next lower plan
    And a plan comparison with pricing is shown
    And a "Downgrade to [Plan]" CTA is visible

  Scenario: Merchant already on lowest plan sees affordability message
    Given the merchant is on the LAUNCH plan
    And the merchant selected "Too expensive"
    When the counter-offer step is displayed
    Then the modal shows "You're already on our most affordable plan at $29/mo"

  Scenario: "Missing features" reason shows feature request form
    Given the merchant selected "Missing features"
    When the counter-offer step is displayed
    Then a text area for feature description is shown
    And a "Submit Feature Request" button is visible
    And a "Continue with Cancellation" button is also visible

  Scenario: Submitting a feature request does not cancel the subscription
    Given the "Missing features" counter-offer is displayed
    When the merchant fills in the feature request and clicks "Submit Feature Request"
    Then the feature request is recorded
    And the merchant remains on the cancellation flow
    And the "Continue with Cancellation" button is still available

  Scenario: "Business closing" reason skips counter-offer
    Given the merchant selected "Business closing"
    When the merchant clicks "Continue with Cancellation"
    Then an empathetic message is displayed
    And no counter-offer is shown
    And the modal proceeds directly to Step 2 (confirmation)

  Scenario: Counter-offer is shown only once per cancellation attempt
    Given the merchant selected a reason and dismissed the counter-offer
    When the merchant clicks "Continue with Cancellation" from the counter-offer step
    Then the modal advances directly to Step 2 (confirmation)
    And no second counter-offer is presented
```

### FR-4 / FR-5: Cancellation Confirmation and Scheduling

```gherkin
Feature: Cancellation Confirmation and Scheduling

  Scenario: Confirmation modal shows correct effective date
    Given the merchant is on Step 2 of the cancellation modal
    When the modal is displayed
    Then the effective date shown matches the merchant's billing period end date
    And the date is in a human-readable format (e.g., "March 30, 2026")

  Scenario: Merchant confirms cancellation successfully
    Given the merchant is on Step 2 confirmation
    When the merchant clicks "Confirm Cancellation"
    Then a subscription_cancellations record is created
    And the effective_date is set to the billing period end date
    And PaymentGatewayService.cancelSubscription() is called
    And the internal subscription state is updated to "cancelled"
    And a success toast appears: "Your subscription has been cancelled. Your plan remains active until [DATE]."
    And the modal closes
    And a "Cancellation Confirmed" email is sent to the merchant

  Scenario: Cancellation fails due to gateway error
    Given the merchant clicks "Confirm Cancellation"
    And the PaymentGatewayService.cancelSubscription() call returns an error
    When the error is received
    Then the internal subscription state is NOT changed
    And an error message is shown: "Something went wrong processing your cancellation. Please try again or contact support."
    And the modal remains open on Step 2
```

### FR-6: Pending Cancellation Dashboard State

```gherkin
Feature: Pending Cancellation Dashboard Banner and Billing Page State

  Scenario: Pending cancellation banner appears on every dashboard page
    Given a merchant has confirmed cancellation and the billing period has not ended
    When the merchant navigates to any dashboard page
    Then a persistent warning banner is displayed at the top of the page
    And the banner reads "Your plan has been cancelled. Your store will go offline on [DATE]. [Resubscribe]"
    And the banner cannot be dismissed by the merchant

  Scenario: Billing page shows cancellation pending state
    Given a merchant is in pending cancellation state
    When the merchant navigates to /home/billing
    Then the plan card shows a "Cancellation Pending" badge in yellow/orange
    And a "Resubscribe" button replaces the "Cancel Subscription" button
    And the "Change Plan" option is hidden or disabled

  Scenario: Merchant retains full access during pending cancellation
    Given a merchant has a pending cancellation
    When the merchant accesses any dashboard feature (products, orders, store settings)
    Then access is granted as if no cancellation were pending
    And no usage limits are reduced
```

### FR-7: Resubscription (Void Cancellation)

```gherkin
Feature: Resubscription — Voiding a Pending Cancellation

  Scenario: Merchant resubscribes via the banner link
    Given a merchant has a pending cancellation
    When the merchant clicks "[Resubscribe]" in the pending cancellation banner
    Then a confirmation dialog appears: "Would you like to keep your [PLAN_NAME] plan? Your subscription will continue as normal."

  Scenario: Merchant confirms resubscription
    Given the resubscription confirmation dialog is open
    When the merchant clicks "Yes, Keep My Plan"
    Then the subscription_cancellations record is updated with resubscribed = true and resubscription_date = now
    And PaymentGatewayService.reactivateSubscription() is called
    And the internal subscription state is updated to "active"
    And the pending cancellation banner disappears from all pages
    And the billing page restores the "Cancel Subscription" button
    And a success toast appears: "Welcome back! Your [PLAN_NAME] plan will continue as normal."

  Scenario: Resubscription preserves the existing billing cycle
    Given a merchant resubscribes during the pending cancellation period
    When resubscription is confirmed
    Then no new charge is made
    And no new billing cycle is started
    And the billing period continues as before cancellation

  Scenario: Merchant declines resubscription dialog
    Given the resubscription confirmation dialog is open
    When the merchant clicks "No, Continue with Cancellation"
    Then the dialog closes
    And the pending cancellation state is unchanged
```

### FR-8 / FR-9: Voluntary Downgrade

```gherkin
Feature: Voluntary Downgrade Flow

  Scenario: Merchant schedules a downgrade without excess resources
    Given a merchant is on SCALE plan with resources within GROW plan limits
    When the merchant selects GROW from the plan change interface
    Then a downgrade confirmation modal shows the plan change details and effective date
    And no excess resource warning is shown
    When the merchant clicks "Confirm Downgrade"
    Then the downgrade is scheduled for the billing period end date
    And a success toast appears: "Your plan will change to [NEW_PLAN] on [DATE]."
    And a "Downgrade Confirmed" email is sent

  Scenario: Downgrade confirmation modal shows excess resource warnings
    Given a merchant on SCALE has 3,500 SKUs, 45 GB storage, and 3 admin users
    When the merchant attempts to downgrade to LAUNCH (500 SKU, 10 GB, 2 admin limit)
    Then the confirmation modal shows an excess resource warning section
    And the warning specifies that 3,000 products will be hidden from the storefront
    And the warning specifies that storage upload will be blocked
    And the warning specifies that 1 admin account will be archived
    And the warning states that no data will be deleted

  Scenario: Excess products are hidden (not deleted) on downgrade
    Given a merchant has 3,500 SKUs and downgraded to LAUNCH (500 SKU limit)
    When the downgrade effective date is reached
    Then the first 500 SKUs (sorted by most recently updated) remain visible in the storefront
    And 3,000 excess SKUs are hidden from the storefront
    And all 3,500 SKUs remain editable in the merchant dashboard

  Scenario: Downgrade blocked if cancellation is pending
    Given a merchant has a pending cancellation
    When the merchant attempts to select a lower plan
    Then an error is shown: "You have a pending cancellation. Please resubscribe first to change your plan."
    And the downgrade is not initiated

  Scenario Outline: Downgrade scheduling for all valid plan transitions
    Given a merchant is on <current_plan>
    When the merchant selects <target_plan>
    Then a downgrade confirmation modal is shown with the correct effective date and new limits

    Examples:
      | current_plan | target_plan |
      | SCALE        | GROW        |
      | SCALE        | LAUNCH      |
      | GROW         | LAUNCH      |
```

### FR-10: cancellation-processor Background Job

```gherkin
Feature: cancellation-processor Background Job

  Scenario: Job suspends merchant when effective date has passed
    Given a subscription_cancellations record exists with effective_date <= now
    And the record has resubscribed = false
    And the merchant is not already in SUSPENDED state
    When the cancellation-processor job runs
    Then suspendMerchant(store_id, 'cancelled') is called
    And a "Post-Cancellation Suspended" email is sent to the merchant
    And the event is logged

  Scenario: Job is idempotent — does not double-suspend
    Given a merchant has already been suspended from a previous job run
    When the cancellation-processor job runs again
    Then suspendMerchant() is NOT called for that merchant again
    And no duplicate emails are sent

  Scenario: Job skips resubscribed cancellations
    Given a subscription_cancellations record has resubscribed = true
    When the cancellation-processor job runs
    Then that record is skipped
    And no suspension is triggered

  Scenario: Job continues processing after individual failure
    Given 10 pending cancellations are due
    And the suspendMerchant() call fails for merchant #3
    When the cancellation-processor job runs
    Then merchants #1, #2, #4–#10 are processed successfully
    And the failure for merchant #3 is logged
    And the job does not abort

  Scenario: Ops alert triggered when failure count exceeds threshold
    Given 6 or more individual merchant failures occur in a single job run
    When the job completes
    Then an ops alert is triggered
```

### Edge Cases

```gherkin
Feature: Cancellation Edge Cases

  Scenario: Merchant upgrades plan while cancellation is pending
    Given a merchant on GROW has a pending cancellation
    When the merchant initiates an upgrade to SCALE
    Then a notice is shown: "This will cancel your pending cancellation."
    When the merchant confirms the upgrade
    Then the upgrade proceeds via the Payment Abstraction Layer
    And the subscription_cancellations record is updated with resubscribed = true
    And the pending cancellation banner is removed

  Scenario: Multiple cancel/resubscribe cycles create independent records
    Given a merchant has previously cancelled (record 1, resubscribed = true) and resubscribed
    When the merchant cancels again
    Then a new subscription_cancellations record (record 2) is created
    And record 1 is unchanged
    And the new effective_date is calculated from the current billing period

  Scenario: Merchant on LAUNCH selects "too_expensive" — sees affordability message
    Given the merchant is on the LAUNCH plan
    And the merchant selected "Too expensive" as their cancellation reason
    When the counter-offer step is displayed
    Then the system shows "You're already on our most affordable plan. Would you like to continue at $29/mo?"
    And no downgrade option is shown (LAUNCH is the lowest paid tier)
```

---

# Traceability Map

| Requirement | Scenario(s) |
|---|---|
| FR-1 | Active paid merchant sees cancel button; Trial merchant does not; Suspended merchant does not |
| FR-2 | Merchant opens modal and must select a reason; Cannot proceed without reason; "Other" shows free-text field; Merchant closes without cancelling |
| FR-3 | "Too expensive" shows downgrade offer; Merchant on LAUNCH sees affordability message; "Missing features" shows feature request form; Submitting feature request does not cancel; "Business closing" skips counter-offer; Counter-offer shown only once |
| FR-4 | Confirmation modal shows correct effective date |
| FR-5 | Merchant confirms cancellation successfully; Cancellation fails due to gateway error |
| FR-6 | Pending banner on every page; Billing page pending state; Full access retained |
| FR-7 | Resubscribe via banner; Confirm resubscription; Billing cycle preserved; Decline dialog |
| FR-8 | Schedule downgrade without excess; Downgrade blocked if cancellation pending; Downgrade scheduling for all plan transitions |
| FR-9 | Confirmation modal shows excess warnings; Excess products hidden on downgrade |
| FR-10 | Job suspends on effective date; Idempotent; Skips resubscribed; Continues after failure; Ops alert |
| FR-11 | Cancellation fails due to gateway error; Resubscription fails (covered in error handling) |
| FR-12 | Merchant confirms cancellation successfully (email); Post-suspension (job scenario); Downgrade confirmed (email in downgrade scenario) |
| FR-13 | All Gherkin scenarios that confirm cancellation capture the data fields |
| FR-14 | Cancellation analytics — data captured in FR-13 informs ST-12 queries |
| FR-15 | Pending cancellation state visible in admin; ST-12 scope |
