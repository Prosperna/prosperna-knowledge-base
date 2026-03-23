---
id: st-14-billing-subscription-email-templates
title: PRD. ST-14 Billing Subscription Email Templates
sidebar_label: ST-14 Billing Subscription Email Templates
sidebar_position: 14
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft
- Feature Slug: billing-subscription-email-templates
- Subtask Reference: ST-14 (Pricing Restructuring Initiative)

---

## Summary

This PRD covers all implementation requirements for ST-14: updating the Prosperna billing email system to align with the v3 pricing restructuring. The work spans Handlebars template changes in `email-service-api`, new HTTP endpoints in the billing email API, and trigger mechanism changes in `payment-integration-api` (Agenda job + cron).

The core behavioral shift is: **subscriptions that expire or fail to pay no longer revert the merchant to a Free Plan — they suspend the merchant's store.** Every piece of email communication must reflect this new reality. Additionally, 11 new templates must be created to cover lifecycle events that did not previously exist.

---

## User Journey

### Happy Path

**Scenario: Merchant with active GROW subscription approaching renewal**

1. Merchant is on the GROW plan ($59/mo). Their renewal date is 7 days away.
2. `SCHEDULE_BILLING_EMAILS_NOTIFICATION` job fires → sends `updated-plan-expiring7.hbs` with suspension warning language and renewal CTA.
3. 3 days before expiry → sends `updated-plan-expiring3.hbs`.
4. 1 day before expiry → sends `updated-plan-expiring1.hbs`.
5. On renewal date → Xendit processes recurring charge successfully → `updated-plan-renewal.hbs` is sent. Expiry countdown stops.
6. Merchant receives renewal confirmation with new plan limits reset notice.

**Scenario: Merchant cancels, then reactivates**

1. Merchant cancels their GROW subscription from the dashboard.
2. `cancellation-confirmed.hbs` is sent immediately — "your plan stays active until [end date], your store will go offline after."
3. Billing period ends → `cancellation-processor` job fires → `post-cancellation-suspended.hbs` sent → store suspended.
4. Merchant clicks "Reactivate My Store" → selects SCALE plan → pays → `reactivateMerchant()` fires.
5. `reactivation-confirmation.hbs` sent — "your store is live again on SCALE."

### Alternate and Failure Paths

**Subscription expiry — payment not made:**
1. Countdown emails (7/3/1 day) fire as above.
2. Day 0: `SCHEDULE_BILLING_EMAILS_NOTIFICATION` job fires → sends `updated-plan-expired.hbs` → calls `suspendMerchant(store_id, 'payment_failed')`.
3. Merchant receives "your store is now offline" email with plan selection CTA.

**Renewal payment fails (recurring charge):**
1. Xendit or Stripe webhook fires `recurring.cycle.failed` event.
2. `createUpcomingInvoices()` cron detects unpaid renewal past due → calls `suspendMerchant(store_id, 'payment_failed')` → sends `payment-failed-suspended.hbs`.
3. No grace period, no retry sequence. One email, immediate suspension.
4. Merchant updates payment method, reactivates → `reactivation-confirmation.hbs` sent.

**Usage limits hit:**
1. Merchant reaches 80% of orders limit → `usage-warning-80.hbs` sent (celebratory tone).
2. Merchant reaches 95% → `usage-urgent-95.hbs` sent (informative, mild urgency).
3. Merchant reaches 100% → `usage-grace-100.hbs` sent (48-hour grace period starts). Options: upgrade, accept overages, wait for reset.
4. During grace → daily `usage-grace-reminder.hbs` sent.
5. Grace expires or 125% hit → `usage-hard-limit-125.hbs` sent (orders queuing).
6. If merchant accepts overages → end of billing period → `overage-invoice.hbs` sent.

**Duplicate suspension guard:**
- If plan expiry and payment failure happen on the same day, `suspendMerchant()` is idempotent — only one suspension email is sent.

---

## Functional Requirements

### Template Updates — Existing Templates

**FR-1: Update `billing/activate-trial.hbs` — Trial Activation**
- Subject must change to: `"Welcome to Prosperna — Your 14-day free trial starts now"`
- Remove all references to "Premium Trial" and `PREMIUM_TRIAL` plan identifier.
- Replace with "14-day free trial" and "Scale-tier access."
- All pricing references must use USD: Launch ($29/mo), Grow ($59/mo), Scale ($149/mo).
- Expiry language must state: "Your trial ends on [TRIAL_END_DATE]. After that, your store will go offline unless you choose a plan."
- Upgrade CTA must list three plans: Launch / Grow / Scale with USD prices.
- Template variable `trialEndDate` must be supported.
- Coordinate with ST-08 — if ST-08's `trial/welcome.hbs` covers this event, this template may be deprecated. Until confirmed, keep this template active.

**FR-2: Update `billing/plan-upgrade.hbs` and `billing/updated-plan-upgrade.hbs` — Upgrade Notification**
- Subject must change to: `"You've upgraded to Prosperna [PLAN] — new limits are active"`
- All plan name references must use LAUNCH, GROW, or SCALE.
- All pricing must be USD.
- Add a new section showing the new plan's limits: orders/month, bandwidth (GB), storage (GB), SKUs, admin users, store locations.
- Add proration line (conditional): `"A prorated charge of $[PRORATED_AMOUNT] has been applied for the remainder of your billing period."` — only shown when `proratedAmount` is present.

**FR-3: Update `billing/plan-downgrade.hbs` — Downgrade Notification**
- Subject must change to: `"Your plan will change to Prosperna [PLAN] on [EFFECTIVE_DATE]"`
- All plan name references must use LAUNCH, GROW, or SCALE.
- Must clearly communicate: current plan access continues until end of billing period.
- Add effective date: `"Your current [OLD_PLAN] access continues until [BILLING_PERIOD_END]. On that date, your plan will change to [NEW_PLAN]."`
- Add new limits section showing the incoming plan's limits.
- Add excess handling note: `"If your current usage exceeds [NEW_PLAN] limits, excess items may be hidden from your storefront but will not be deleted."`

**FR-4: Update `billing/updated-plan-renewal.hbs` — Renewal Confirmation**
- Subject must change to: `"Your Prosperna [PLAN] subscription has been renewed"`
- All plan names → LAUNCH, GROW, SCALE. All amounts → USD.
- Add payment gateway field: `"Paid via [PAYMENT_GATEWAY]"` (Stripe or Xendit).
- Add usage reset line: `"Your usage limits have been reset for the new billing period."`
- Retain next renewal date.

**FR-5: Update `billing/updated-plan-expiring7.hbs`, `updated-plan-expiring3.hbs`, `updated-plan-expiring1.hbs`, `updated-plan-expiring.hbs` — Expiry Countdown**
- Subjects:
  - 7-day: `"Your Prosperna [PLAN] subscription expires in 7 days"`
  - 3-day: `"Your Prosperna [PLAN] subscription expires in 3 days"`
  - 1-day: `"Your Prosperna [PLAN] subscription expires tomorrow"`
  - Generic: `"Your Prosperna [PLAN] subscription is expiring soon"`
- Consequence language must change from "reverted to Free Plan" to: `"Your store will go offline and your account will be suspended. All your data will be preserved."`
- Primary CTA: `"Renew Now"` linking to `invoiceUrl`.
- All plan names → LAUNCH, GROW, SCALE. All pricing → USD.
- Never reference the Free Plan.

**FR-6: Update `billing/updated-plan-expired.hbs` — Subscription Expired (Major Change)**
- Subject must change to: `"Your Prosperna subscription has ended — your store is offline"`
- Body must state: `"Your store is now offline. All your data, products, and settings are safely preserved. Choose a plan to bring your store back online."`
- Must list plan options with USD prices: Launch ($29/mo), Grow ($59/mo), Scale ($149/mo).
- Must include data safety reassurance: `"All your data is safe. Your products, store design, order history, and customer information are preserved indefinitely."`
- Primary CTA: `"Choose a Plan"` linking to `planSelectionUrl`.
- **Trigger mechanism**: The calling Agenda job must call `suspendMerchant(store_id, reason)` instead of `changePlan(FREE)` when this email fires. (See FR-19.)

**FR-7: Update `billing/updated-plan-change.hbs` and `billing/plan-notice.hbs` — Generic Plan Notices**
- Remove all references to FREE, PLUS, PRO, PREMIUM plan names.
- Replace with LAUNCH, GROW, SCALE where plan name is referenced.
- Replace all PHP pricing with USD.
- Remove any "Free Plan" or "downgraded to Free" language.
- These serve as fallback/general-purpose templates.

---

### New Templates

**FR-8: Create `billing/cancellation-confirmed.hbs` — Cancellation Confirmation**
- Triggered immediately when merchant confirms voluntary cancellation.
- Subject: `"Your Prosperna cancellation is confirmed"`
- Must include:
  - Active until date: `"Your [PLAN] plan remains active until [BILLING_PERIOD_END_DATE]. You have full access to everything until then."`
  - Post-period status: `"After [BILLING_PERIOD_END_DATE], your store will go offline. All your data, products, and settings will be preserved."`
  - Reversal option: `"Changed your mind? You can cancel your cancellation anytime before [BILLING_PERIOD_END_DATE] from your dashboard."`
- Primary CTA: `"Keep My Plan"` linking to `dashboardUrl`.
- Secondary CTA: `"View Dashboard"` linking to `dashboardUrl`.
- Required variables: `merchantName`, `planType`, `billingPeriodEndDate`, `dashboardUrl`.

**FR-9: Create `billing/post-cancellation-suspended.hbs` — Post-Cancellation Suspension**
- Triggered when billing period ends after merchant cancellation (fired by `cancellation-processor` job).
- Must NOT be sent if merchant resubscribed before billing period ended.
- Subject: `"Your Prosperna store is now offline"`
- Must include:
  - `"As of today, your Prosperna [PLAN] subscription has ended and your store is offline."`
  - Data safety: `"Your data is safe and waiting for you. Whenever you're ready to sell again, you can reactivate in under 2 minutes."`
- Primary CTA: `"Reactivate My Store"` linking to `planSelectionUrl`.
- Required variables: `merchantName`, `previousPlan`, `planSelectionUrl`.

**FR-10: Create `billing/payment-failed-suspended.hbs` — Payment Failure Suspension**
- Triggered once when subscription renewal payment fails and `suspendMerchant()` is called.
- No grace period, no retry sequence — one email, immediate suspension.
- Subject: `"Your Prosperna subscription payment failed — your store is offline"`
- Must include:
  - `"We were unable to process your subscription payment of $[AMOUNT] for Prosperna [PLAN]."`
  - `"Your store is now offline. Your customers cannot access your store until you reactivate."`
  - Data safety: `"All your data, products, and settings are safely preserved. Nothing has been deleted."`
  - Recovery steps: `"Log in to your dashboard → Update your payment method → Choose a plan → Your store will be back online instantly."`
- Primary CTA: `"Reactivate My Store"` linking to `planSelectionUrl`.
- Required variables: `merchantName`, `planType`, `amount`, `currency`, `paymentGateway`, `planSelectionUrl`.

**FR-11: Create `billing/usage-warning-80.hbs` — Usage Warning at 80%**
- Triggered when merchant hits 80% of any single usage limit (orders, bandwidth, or storage).
- Tone: Celebratory — framed as growth milestone, not a penalty.
- Subject: `"You're crushing it! [USAGE_COUNT] [RESOURCE_TYPE] this month!"`
- Must include:
  - Celebration: `"Amazing news — you've processed [USAGE_COUNT] [RESOURCE_TYPE] this month on Prosperna [PLAN]!"`
  - Status: `"You're at 80% of your [LIMIT] monthly [RESOURCE_TYPE] limit. At your current pace, you'll reach your limit around [ESTIMATED_DATE]."`
  - Upgrade pitch with next plan details and USD pricing.
- Primary CTA: `"Upgrade Now"` linking to `upgradeUrl`.
- Secondary CTA: `"View Usage Dashboard"` linking to `usageDashboardUrl`.
- Required variables: `merchantName`, `planType`, `resourceType`, `usageCount`, `usageLimit`, `usagePercentage`, `estimatedLimitDate`, `nextPlan`, `nextPlanPrice`, `nextPlanLimits`, `upgradeUrl`, `usageDashboardUrl`.

**FR-12: Create `billing/usage-urgent-95.hbs` — Usage Urgent at 95%**
- Triggered when merchant hits 95% of any usage limit.
- Tone: Informative with mild urgency.
- Subject: `"Heads up! [REMAINING] [RESOURCE_TYPE] left this month"`
- Must include:
  - `"You've used [USAGE_COUNT] of your [LIMIT] [RESOURCE_TYPE] this month. You have [REMAINING] remaining (about [DAYS_AT_PACE] days at current pace)."`
  - What happens at 100%: orders process normally for 48-hour grace period, then queue with 15-minute delay.
- Primary CTA: `"Upgrade to [NEXT_PLAN] — $[NEXT_PRICE]/mo"` linking to `upgradeUrl`.
- Required variables: `merchantName`, `planType`, `resourceType`, `usageCount`, `usageLimit`, `remaining`, `daysAtCurrentPace`, `nextPlan`, `nextPlanPrice`, `upgradeUrl`.

**FR-13: Create `billing/usage-grace-100.hbs` — Usage At 100% (Grace Period Start)**
- Triggered when merchant hits 100% of any usage limit; 48-hour grace period begins.
- Subject: `"You've hit your limit! Here's what happens next"`
- Must present three options clearly:
  1. Upgrade to [NEXT_PLAN] — best for continued growth.
  2. Accept Overage Charges — ~$[ESTIMATED_OVERAGE] this month — best for one-time spikes.
  3. Wait for Reset — resets in [DAYS_UNTIL_RESET] days — orders will queue after 48 hours.
- Grace period callout: `"Grace Period Active: Your orders will continue processing normally for the next 48 hours (until [GRACE_EXPIRY_DATE])."`
- Primary CTA: `"Upgrade Now"` linking to `upgradeUrl`.
- Secondary CTA: `"Accept Overages"` linking to `overageAcceptUrl`.
- Required variables: `merchantName`, `planType`, `resourceType`, `usageLimit`, `graceExpiryDate`, `nextPlan`, `nextPlanPrice`, `estimatedOverage`, `daysUntilReset`, `upgradeUrl`, `overageAcceptUrl`.

**FR-14: Create `billing/usage-grace-reminder.hbs` — Grace Period Daily Reminder**
- Triggered daily during the 48-hour grace period.
- Subject: `"Grace period ending in [HOURS_REMAINING] hours — what's your plan?"`
- Must show: current status, estimated overage, grace expiry time, three CTAs (Upgrade / Accept Overages / Manage Queue).
- Required variables: `merchantName`, `hoursRemaining`, `graceExpiryDate`, `usageCount`, `usageLimit`, `estimatedOverage`, `upgradeUrl`, `overageAcceptUrl`.

**FR-15: Create `billing/usage-hard-limit-125.hbs` — Hard Limit at 125%**
- Triggered when merchant hits 125% of usage limit OR grace period expires.
- Tone: Direct but not alarming.
- Subject: `"Orders now queuing — action needed"`
- Must include:
  - `"Your orders are now being queued due to reaching your plan limits. Orders are processing with a 15-minute delay."`
  - Three options: Upgrade (instant activation), Pay overage fees ($[RATE]/order), Wait for billing reset ([DAYS] days).
- Primary CTA: `"Upgrade Now"` linking to `upgradeUrl`.
- Required variables: `merchantName`, `planType`, `usageCount`, `usageLimit`, `nextPlan`, `nextPlanPrice`, `overageRate`, `daysUntilReset`, `upgradeUrl`, `overageAcceptUrl`.

**FR-16: Create `billing/overage-invoice.hbs` — Overage Invoice**
- Triggered at end of billing period when merchant had usage above limits and accepted overages.
- Subject: `"Your Prosperna overage invoice — $[TOTAL]"`
- Must include line-item table: Resource / Overage Amount / Rate / Charge.
- Must show total overage charge and payment due date.
- Must include upgrade suggestion to avoid future overages.
- Primary CTA: `"Pay Invoice"` linking to `invoiceUrl`.
- Secondary CTA: `"Upgrade Plan"` linking to `upgradeUrl`.
- Required variables: `merchantName`, `planType`, `periodStart`, `periodEnd`, `orderOverage`, `orderRate`, `orderCharge`, `bandwidthOverage`, `bandwidthRate`, `bandwidthCharge`, `storageOverage`, `storageRate`, `storageCharge`, `totalOverageCharge`, `dueDate`, `invoiceUrl`, `nextPlan`, `nextPlanPrice`, `upgradeUrl`.

**FR-17: Create `billing/upgrade-confirmation.hbs` — Upgrade Confirmation**
- Triggered when merchant successfully upgrades from one paid plan to another via the Payment Abstraction Layer.
- Subject: `"Welcome to Prosperna [NEW_PLAN] — your upgrade is complete"`
- Must include:
  - Confirmation: `"You've successfully upgraded from [OLD_PLAN] to [NEW_PLAN]."`
  - New plan limits table.
  - Proration line (conditional on `proratedAmount`).
  - Enforcement cleared notice (conditional on `enforcementCleared`): `"Your usage limits have been updated and any previous enforcement states have been cleared."`
- Primary CTA: `"Go to Dashboard"` linking to `dashboardUrl`.
- Required variables: `merchantName`, `oldPlan`, `newPlan`, `newPlanPrice`, `proratedAmount`, `newLimits`, `dashboardUrl`, `enforcementCleared`.

**FR-18: Create `billing/reactivation-confirmation.hbs` — Reactivation Confirmation**
- Triggered when a suspended merchant selects a plan and successfully pays; `reactivateMerchant()` completes.
- Subject: `"Welcome back! Your Prosperna store is live again"`
- Must include:
  - `"Your store is back online on Prosperna [PLAN]."`
  - What's restored: `"All your products, store design, order history, and settings have been restored exactly as you left them."`
  - Plan details and next renewal date.
  - Add-ons note: free Marketplace add-ons reactivated automatically; paid third-party add-ons may need manual reactivation from Marketplace page.
- Primary CTA: `"Go to Dashboard"` linking to `dashboardUrl`.
- Required variables: `merchantName`, `planType`, `planPrice`, `planLimits`, `nextPaymentDate`, `dashboardUrl`.

---

### Trigger Mechanism Changes

**FR-19: Update `SCHEDULE_BILLING_EMAILS_NOTIFICATION` Agenda Job — Day 0 Behavior**
- File: `payment-integration-api/src/jobs/index.ts`
- Current Day 0 behavior: sends `updated-plan-expired.hbs` AND calls `changePlan(FREE)`.
- New Day 0 behavior: sends updated `updated-plan-expired.hbs` AND calls **`suspendMerchant(store_id, 'payment_failed')`**.
- Days 7, 3, and 1 behavior: send updated countdown templates with new plan names and suspension language — no functional change to job logic.

**FR-20: Update `createUpcomingInvoices()` Cron — Unpaid Renewal Behavior**
- File: `payment-integration-api/src/utils/cron.ts`
- Current behavior on unpaid renewal past due: calls `changePlan(FREE)` silently.
- New behavior: calls **`suspendMerchant(store_id, 'payment_failed')`** AND calls `POST /v1/billing/payment-failure` to send `payment-failed-suspended.hbs`.
- No grace period, no retry. One event, one email, immediate suspension.

**FR-21: Remove Grace Period Email Templates**
- Templates `billing/payment-failure-day0.hbs`, `billing/payment-failure-day3.hbs`, `billing/payment-failure-day5.hbs`, `billing/payment-failure-day7-suspended.hbs` are never to be created.
- These were v2 spec artifacts. ST-07 (grace period) was removed from the pricing restructuring. Any code references to these template paths must be removed.

---

## Non-Functional Requirements

**NFR-1: Email Delivery SLA**
- All transactional billing emails must be delivered to AWS SES within 5 seconds (P95) of the triggering event.
- SES is responsible for SMTP delivery to the recipient's mail server (standard SES SLAs apply).

**NFR-2: Retry and Failure Handling**
- On AWS SES API call failure (non-5xx): do not retry — log the error and alert Ops.
- On AWS SES API call failure (5xx / throttle): retry up to 3 times with exponential backoff (1s, 2s, 4s).
- After 3 failed retries: log hard failure to CloudWatch with full payload; trigger SNS alert to Ops team.
- Do not surface delivery failures to the merchant via UI — these are background operations.

**NFR-3: Idempotency**
- Each threshold crossing email (80%, 95%, 100%, 125%) must be sent at most once per billing period per resource type per merchant.
- Idempotency is enforced by the calling service (ST-06 usage limits system) — the email API does not deduplicate.
- `suspendMerchant()` is idempotent — calling it on an already-suspended account must not trigger a duplicate suspension email.

**NFR-4: Language**
- All billing email templates are English only. No i18n or locale variants.

**NFR-5: Branding**
- All billing emails use Prosperna's own branding: Prosperna logo, Prosperna brand colors, `billing@prosperna.com` sender address.
- Merchant custom email branding settings (logo, header color, footer toggle) do not apply to billing emails.

**NFR-6: Transactional Classification**
- All billing emails are transactional. No unsubscribe link is required.
- AWS SES configuration set must classify these emails as transactional to exclude them from suppression list enforcement.

**NFR-7: Staging Validation**
- All 23 templates (12 updated + 11 new) must be validated by QA via real SES sends in the staging environment before production deployment.
- Validation criteria: correct subject line, all template variables populated with realistic test data, no rendering errors, correct CTA links, correct consequence language.

**NFR-8: No Analytics Tracking**
- No open tracking pixels, click tracking, or engagement metrics on billing emails.

**NFR-9: Template Engine**
- All templates use Handlebars (`.hbs`) compiled server-side by `email-service-api`.
- No client-side rendering. No dynamic template fetching from external sources.

**NFR-10: Variable Validation**
- The email API must validate that all required variables are present in the request payload before rendering. If required variables are missing, return HTTP 400 with a clear error listing the missing fields. Never send a partially-rendered email.

---

## UX Notes

- **One primary CTA per email.** Every template has exactly one primary call-to-action button. Secondary CTAs are text links only.
- **Tone guidelines:**
  - Usage 80%: Celebratory ("You're crushing it!")
  - Usage 95%: Informative, mild urgency
  - Usage 100%/125%: Direct, solution-oriented (never threatening)
  - Payment failure, expiry, suspension: Factual, empathetic, data safety reassurance always present
  - Cancellation confirmation: Warm, leaves door open
  - Reactivation: Welcoming ("Welcome back!")
- **Data safety is non-negotiable:** Every suspension-related email (post-cancellation, payment failure, plan expired) must include an explicit reassurance that all merchant data is preserved.
- **Template width:** Standard responsive email layout (600px max-width), single column for readability on mobile.

---

## Data Model Notes

All template variables are injected at send time by the calling service. The email service does not persist variable data. Key variable contracts:

| Variable | Type | Notes |
|---|---|---|
| `merchantName` | String | Merchant's full name |
| `storeName` | String | Store name |
| `email` | String | Merchant's email (used as recipient) |
| `planType` | String | Enum: LAUNCH, GROW, SCALE |
| `previousPlan` | String | Plan before change/suspension |
| `newPlan` | String | Target plan name |
| `billingType` | String | Enum: MONTHLY, QUARTERLY, ANNUAL |
| `amount` | String | Pre-formatted USD string (e.g., `"$59.00"`) |
| `currency` | String | Always `"USD"` |
| `paymentGateway` | String | `"Stripe"` or `"Xendit"` |
| `nextPaymentDate` | String | Human-readable date (e.g., `"April 15, 2026"`) |
| `billingPeriodEndDate` | String | Human-readable date |
| `proratedAmount` | String | Optional — pre-formatted USD string |
| `invoiceUrl` | String | Full URL to Xendit or Stripe hosted invoice |
| `planLimits` | Object | `{ ordersPerMonth, bandwidthGb, storageGb, maxSkus, adminUsers, storeLocations }` |
| `newLimits` | Object | Same structure as `planLimits` |
| `resourceType` | String | `"orders"`, `"bandwidth"`, or `"storage"` |
| `usageCount` | Number | Current period usage count |
| `usageLimit` | Number | Plan limit for the resource |
| `usagePercentage` | Number | Integer 0–125+ |
| `remaining` | Number | Units remaining |
| `graceExpiryDate` | String | ISO 8601 or human-readable grace period end |
| `hoursRemaining` | Number | Hours left in grace period |
| `estimatedOverage` | String | Pre-formatted USD string |
| `dashboardUrl` | String | Full URL to merchant dashboard |
| `planSelectionUrl` | String | Full URL to plan selection page (suspended lock screen) |
| `upgradeUrl` | String | Full URL to upgrade flow |
| `overageAcceptUrl` | String | Full URL to accept overage charges |

---

## Integrations and APIs

| Integration | Direction | Purpose |
|---|---|---|
| AWS SES | email-service-api → SES | Transactional email delivery |
| payment-integration-api | caller → email-service-api | Triggers billing notification, plan-change, plan-expiration, payment-failure, reactivation emails |
| ST-01 Payment Abstraction Layer | caller → email-service-api | Triggers upgrade-confirmation, payment-failed-suspended on payment events |
| ST-04 Suspension System | payment-integration-api → business-profile-api | `suspendMerchant()` and `reactivateMerchant()` called before email is triggered |
| ST-05 Cancellation Flow | cancellation-processor → email-service-api | Triggers cancellation-confirmed and post-cancellation-suspended |
| ST-06 Usage Limits System | usage-threshold-checker → email-service-api | Triggers all usage threshold emails; overage processor triggers overage-invoice |
| ST-15 Background Jobs | job registration | New triggers registered as Agenda jobs |

---

## Error Handling

| Error Condition | Behavior |
|---|---|
| Missing required template variable in request | Return HTTP 400; do not send email; include list of missing fields in error response |
| Unknown template type requested | Return HTTP 400 |
| SES API 5xx / throttle | Retry up to 3 times with exponential backoff |
| SES API non-retryable error | Log to CloudWatch; SNS alert to Ops; return HTTP 502 to caller |
| `suspendMerchant()` unavailable when Day 0 job fires | Fail fast; alert Ops; do not send suspension email without confirming suspension |
| Duplicate threshold email attempt | Idempotency enforced by ST-06 caller; email API sends if called |

---

## Telemetry and Analytics

Not in scope. No open tracking, click tracking, or engagement metrics on billing emails per product decision.

Server-side: All send attempts (success and failure) are logged to CloudWatch with `merchant_id`, `template_name`, `timestamp`, and `success/failure` status. This is for operational monitoring only, not product analytics.

---

## Rollout Plan

- All 23 templates release **simultaneously** with the pricing restructuring (ST-01 through ST-16 combined launch).
- No feature flag, no phased rollout.
- Pre-launch checklist:
  1. All 23 templates QA-approved via staging real-send testing.
  2. Trigger mechanism updates (FR-19, FR-20) verified in staging.
  3. ST-04 `suspendMerchant()` confirmed production-ready.
  4. ST-08 coordination complete — `activate-trial.hbs` status (keep or deprecate) confirmed.
  5. All calling services updated to pass new required variables.

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Should `billing/activate-trial.hbs` be deprecated in favor of ST-08's `trial/welcome.hbs` on trial activation? Duplicate welcome email risk. | Product / ST-08 team | Open |
| OQ-2 | CAN-SPAM and GDPR handling: does AWS SES configuration set handle bounce/complaint suppression automatically, or does application layer need additional controls? | Engineering / Legal | Open — Assumption: SES handles this at infrastructure level |
| OQ-3 | What is the `planSelectionUrl` value in the suspended state? Is this the lock screen URL from ST-04, or a separate plan selection page? | ST-04 Engineering | Open |
| OQ-4 | Is the `overage-invoice.hbs` payment handled via Xendit/Stripe as a separate invoice, or is it added to the next subscription renewal? | ST-06 / Billing Engineering | Open |

---

# Gherkin User Stories

## Feature: Billing & Subscription Email Template Updates

```gherkin
Feature: Billing Email — Subscription Expiry Countdown and Suspension

  Background:
    Given the pricing restructuring v3 is active
    And plan tiers are LAUNCH, GROW, and SCALE
    And no Free Plan exists
    And all billing is in USD

  # --- FR-5, FR-6: Expiry countdown and suspension ---

  Scenario: Merchant receives 7-day expiry warning with suspension language
    Given a merchant "John Dela Cruz" is on the GROW plan at $59/month
    And their subscription expires in 7 days
    When the SCHEDULE_BILLING_EMAILS_NOTIFICATION job fires for this merchant
    Then an email is sent to the merchant's registered email address
    And the email subject is "Your Prosperna GROW subscription expires in 7 days"
    And the email body contains "your store will go offline and your account will be suspended"
    And the email body contains "All your data will be preserved"
    And the email body does NOT contain "Free Plan"
    And the email body does NOT contain "₱"
    And the email contains a "Renew Now" CTA linking to the merchant's invoice URL

  Scenario: Merchant receives 3-day and 1-day expiry warnings
    Given a merchant is on the SCALE plan at $149/month
    When the expiry countdown job fires at 3 days remaining
    Then an email is sent with subject "Your Prosperna SCALE subscription expires in 3 days"
    When the expiry countdown job fires at 1 day remaining
    Then an email is sent with subject "Your Prosperna SCALE subscription expires tomorrow"

  Scenario: Subscription expires on Day 0 — store is suspended
    Given a merchant's LAUNCH subscription has expired (0 days remaining)
    When the SCHEDULE_BILLING_EMAILS_NOTIFICATION job fires on Day 0
    Then suspendMerchant() is called with reason 'payment_failed'
    And an email is sent with subject "Your Prosperna subscription has ended — your store is offline"
    And the email body contains "Your store is now offline"
    And the email body contains "All your data is safe"
    And the email lists plan options: Launch ($29/mo), Grow ($59/mo), Scale ($149/mo)
    And the email contains a "Choose a Plan" CTA linking to the plan selection URL
    And changePlan(FREE) is NOT called

  Scenario: Renewal payment succeeds — no suspension
    Given a merchant's GROW subscription is due for renewal
    When Xendit processes the recurring charge successfully
    Then suspendMerchant() is NOT called
    And an email is sent with subject "Your Prosperna GROW subscription has been renewed"
    And the email shows the amount in USD
    And the email shows the payment gateway as "Xendit"
    And the email states "Your usage limits have been reset for the new billing period"

  # --- FR-10, FR-20: Payment failure → immediate suspension ---

  Scenario: Renewal payment fails — immediate suspension with single email
    Given a merchant's GROW subscription renewal payment fails via Stripe
    When the createUpcomingInvoices cron detects the unpaid renewal
    Then suspendMerchant() is called with reason 'payment_failed'
    And exactly one email is sent with subject "Your Prosperna subscription payment failed — your store is offline"
    And the email body contains "We were unable to process your subscription payment of $59.00 for Prosperna GROW"
    And the email body contains "Paid via Stripe"
    And the email contains a "Reactivate My Store" CTA
    And no additional payment failure emails are sent for this suspension event

  Scenario: Payment fails and plan expiry occur on the same day
    Given a merchant's subscription is both expired and has a failed payment on the same day
    When the system processes both events
    Then suspendMerchant() is called exactly once (idempotent)
    And exactly one suspension email is sent to the merchant

  # --- FR-8, FR-9: Cancellation flow ---

  Scenario: Merchant cancels their subscription
    Given a merchant "Maria Santos" is on the SCALE plan with billing period ending April 30, 2026
    When Maria confirms cancellation from the dashboard
    Then an email is sent immediately with subject "Your Prosperna cancellation is confirmed"
    And the email states "Your SCALE plan remains active until April 30, 2026"
    And the email states "After April 30, 2026, your store will go offline"
    And the email contains a "Keep My Plan" CTA
    And the email contains an option to undo the cancellation before April 30, 2026

  Scenario: Merchant resubscribes before billing period ends — no suspension email
    Given Maria cancelled her SCALE subscription (billing period ends April 30, 2026)
    And she resubscribes on April 20, 2026
    When the cancellation-processor job runs on April 30, 2026
    Then the post-cancellation-suspended email is NOT sent

  Scenario: Billing period ends after cancellation — store suspended
    Given Maria did not resubscribe before April 30, 2026
    When the cancellation-processor job runs on April 30, 2026
    Then suspendMerchant() is called
    And an email is sent with subject "Your Prosperna store is now offline"
    And the email body contains "your Prosperna SCALE subscription has ended"
    And the email contains a "Reactivate My Store" CTA

  # --- FR-11 through FR-15: Usage limit notifications ---

  Scenario: Merchant hits 80% of orders limit — celebratory email
    Given a merchant is on the LAUNCH plan with a 500 orders/month limit
    When the merchant processes their 400th order this month (80%)
    Then an email is sent with subject "You're crushing it! 400 orders this month!"
    And the email tone is celebratory (no warning language)
    And the email shows an upgrade CTA to the GROW plan

  Scenario: Merchant hits 95% of orders limit — urgency email
    Given a merchant on LAUNCH has processed 475 orders (95% of 500)
    When the threshold detection fires at 95%
    Then an email is sent with subject "Heads up! 25 orders left this month"
    And the email explains the 48-hour grace period behavior
    And the email shows time at current pace: approximately how many days of headroom remain

  Scenario: Same threshold email not sent twice in one billing period
    Given a merchant received the 80% usage warning on March 10, 2026
    And their usage dropped briefly below 80% (hypothetically)
    When their usage crosses 80% again in the same billing period
    Then the 80% warning email is NOT sent again

  Scenario: Usage limit emails stop after upgrade
    Given a merchant received the 95% usage warning
    When the merchant upgrades from LAUNCH to GROW
    Then no further usage warning emails are sent for the previous LAUNCH limits
    And an upgrade confirmation email is sent

  Scenario: Usage hits 100% — grace period starts
    Given a merchant's orders reach 500 (100% of LAUNCH limit)
    When the threshold detection fires at 100%
    Then an email is sent with subject "You've hit your limit! Here's what happens next"
    And the email clearly states the grace period expiry date and time
    And the email presents three options: Upgrade / Accept Overages / Wait for Reset
    And the email does NOT say the store is going offline

  Scenario: Orders queuing at 125%
    Given the merchant's 48-hour grace period has expired
    When the threshold detection fires (grace expired / 125% reached)
    Then an email is sent with subject "Orders now queuing — action needed"
    And the email states "Orders are processing with a 15-minute delay"

  # --- FR-16: Overage invoice ---

  Scenario: Merchant receives overage invoice at end of billing period
    Given a merchant accepted overage charges at 100% threshold
    And the billing period ends with 45 orders over the limit
    When the end-of-month overage processor runs
    Then an email is sent with subject "Your Prosperna overage invoice — $6.75"
    And the email contains a line-item table showing resource, overage amount, rate, and charge
    And the email contains a "Pay Invoice" CTA

  # --- FR-17: Upgrade confirmation ---

  Scenario: Merchant upgrades mid-billing-cycle
    Given a merchant upgrades from LAUNCH to GROW on March 15, 2026 (mid-cycle)
    When the Payment Abstraction Layer processes the upgrade successfully
    Then an email is sent with subject "Welcome to Prosperna GROW — your upgrade is complete"
    And the email shows "You've successfully upgraded from LAUNCH to GROW"
    And the email shows the new GROW plan limits table
    And the email shows a prorated charge

  Scenario: Merchant upgrades during enforcement state
    Given a merchant is being throttled (orders queuing) on LAUNCH
    When they upgrade to GROW
    Then the upgrade confirmation email states "any previous enforcement states have been cleared"

  # --- FR-18: Reactivation confirmation ---

  Scenario: Suspended merchant successfully reactivates
    Given a merchant's store has been suspended
    When the merchant selects the GROW plan and pays successfully
    And reactivateMerchant() completes
    Then an email is sent with subject "Welcome back! Your Prosperna store is live again"
    And the email states "Your store is back online on Prosperna GROW"
    And the email reassures the merchant that all data has been restored
    And the email notes that free Marketplace add-ons are reactivated automatically

  # --- NFR-3, NFR-10: Idempotency and validation ---

  Scenario: Email API rejects request with missing required variables
    Given the usage-warning-80 email is triggered
    When the request payload is missing the 'resourceType' field
    Then the email API returns HTTP 400
    And the error response lists 'resourceType' as a missing required field
    And no email is sent

  Scenario: Template does not reference old plan names
    Given any billing email is sent post ST-14 launch
    Then the rendered email body does NOT contain "PLUS", "PRO", "PREMIUM", "PREMIUM_TRIAL", or "FREE PLAN"
    And the rendered email body does NOT contain "₱"
    And the rendered email body does NOT contain "changePlan(FREE)"

  # --- NFR-5: Branding ---

  Scenario: Billing emails use Prosperna branding, not merchant branding
    Given a merchant has customized their store email with a blue header and custom logo
    When any billing email is sent to that merchant
    Then the email header uses Prosperna's logo and brand colors
    And the merchant's custom header color is NOT applied
    And the sender address is billing@prosperna.com

  # --- NFR-7: Staging validation ---

  Scenario Outline: All templates validated in staging before production
    Given the staging environment has verified SES sender credentials
    When QA sends a test email for <template_name> with complete test variable payload
    Then the email is delivered to the test inbox within 5 seconds
    And all template variables are rendered with test values (no blank or undefined fields)
    And the email subject matches the specification
    And all CTA links are valid URLs

    Examples:
      | template_name                      |
      | activate-trial                     |
      | plan-upgrade                       |
      | plan-downgrade                     |
      | updated-plan-renewal               |
      | updated-plan-expiring7             |
      | updated-plan-expiring3             |
      | updated-plan-expiring1             |
      | updated-plan-expiring              |
      | updated-plan-expired               |
      | updated-plan-change                |
      | plan-notice                        |
      | updated-plan-upgrade               |
      | cancellation-confirmed             |
      | post-cancellation-suspended        |
      | payment-failed-suspended           |
      | usage-warning-80                   |
      | usage-urgent-95                    |
      | usage-grace-100                    |
      | usage-grace-reminder               |
      | usage-hard-limit-125               |
      | overage-invoice                    |
      | upgrade-confirmation               |
      | reactivation-confirmation          |
```

---

# Traceability Map

| FR | Requirement | Gherkin Scenario(s) |
|---|---|---|
| FR-1 | Update activate-trial.hbs | Staging validation: activate-trial |
| FR-2 | Update plan-upgrade.hbs + updated-plan-upgrade.hbs | Staging validation: plan-upgrade, updated-plan-upgrade; Merchant upgrades mid-billing-cycle |
| FR-3 | Update plan-downgrade.hbs | Staging validation: plan-downgrade |
| FR-4 | Update updated-plan-renewal.hbs | Renewal payment succeeds — no suspension; Staging validation: updated-plan-renewal |
| FR-5 | Update expiry countdown templates (7/3/1/generic) | Merchant receives 7-day expiry warning with suspension language; Merchant receives 3-day and 1-day expiry warnings |
| FR-6 | Update updated-plan-expired.hbs — major change | Subscription expires on Day 0 — store is suspended |
| FR-7 | Update updated-plan-change.hbs and plan-notice.hbs | Template does not reference old plan names; Staging validation: updated-plan-change, plan-notice |
| FR-8 | Create cancellation-confirmed.hbs | Merchant cancels their subscription |
| FR-9 | Create post-cancellation-suspended.hbs | Merchant resubscribes before billing period ends — no suspension email; Billing period ends after cancellation — store suspended |
| FR-10 | Create payment-failed-suspended.hbs | Renewal payment fails — immediate suspension with single email; Payment fails and plan expiry occur on same day |
| FR-11 | Create usage-warning-80.hbs | Merchant hits 80% of orders limit — celebratory email; Same threshold email not sent twice in one billing period |
| FR-12 | Create usage-urgent-95.hbs | Merchant hits 95% of orders limit — urgency email; Usage limit emails stop after upgrade |
| FR-13 | Create usage-grace-100.hbs | Usage hits 100% — grace period starts |
| FR-14 | Create usage-grace-reminder.hbs | Staging validation: usage-grace-reminder |
| FR-15 | Create usage-hard-limit-125.hbs | Orders queuing at 125% |
| FR-16 | Create overage-invoice.hbs | Merchant receives overage invoice at end of billing period |
| FR-17 | Create upgrade-confirmation.hbs | Merchant upgrades mid-billing-cycle; Merchant upgrades during enforcement state |
| FR-18 | Create reactivation-confirmation.hbs | Suspended merchant successfully reactivates |
| FR-19 | Update SCHEDULE_BILLING_EMAILS_NOTIFICATION job — Day 0 | Subscription expires on Day 0 — store is suspended (suspendMerchant called, not changePlan) |
| FR-20 | Update createUpcomingInvoices cron — unpaid renewal | Renewal payment fails — immediate suspension with single email |
| FR-21 | Remove grace period email templates | Payment fails and plan expiry occur on same day (only one email sent) |
| NFR-1 | Delivery SLA < 5 seconds P95 | Staging validation: all templates delivered within 5 seconds |
| NFR-2 | Retry and failure handling | Email API rejects request with missing required variables (no send on error) |
| NFR-3 | Idempotency — threshold emails | Same threshold email not sent twice in one billing period; Payment fails and plan expiry occur on same day |
| NFR-4 | English only | Template does not reference old plan names (all English content verified) |
| NFR-5 | Prosperna branding | Billing emails use Prosperna branding, not merchant branding |
| NFR-6 | Transactional classification | Staging validation: all templates verified in staging environment |
| NFR-7 | Staging validation | Staging validation: all templates (Scenario Outline) |
| NFR-8 | No analytics tracking | Open Questions OQ-2 (tracking excluded by design) |
| NFR-9 | Handlebars template engine | Staging validation: template renders without errors |
| NFR-10 | Variable validation — reject missing fields | Email API rejects request with missing required variables |
