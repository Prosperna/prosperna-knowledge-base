---
id: st-03-14-day-premium-trial-system
title: PRD. ST-03 14-Day Premium Trial System
sidebar_label: ST-03 14-Day Premium Trial System
sidebar_position: 3
---

**Version:** 1.0
**Date:** 2026-03-17
**Status:** Draft
**Prepared by:** Business Analyst Agent

---

## Table of Contents

1. [Functional Requirements](#1-functional-requirements)
2. [Non-Functional Requirements](#2-non-functional-requirements)
3. [System States & Transitions](#3-system-states--transitions)
4. [Flows](#4-flows)
5. [Gherkin User Stories](#5-gherkin-user-stories)
6. [Telemetry Events](#6-telemetry-events)
7. [Rollout Plan](#7-rollout-plan)
8. [Traceability Map](#8-traceability-map)
9. [Open Questions & Assumptions](#9-open-questions--assumptions)

---

## 1. Functional Requirements

### FR-1 — New Signup Provisioned as TRIAL

On successful new merchant registration, the system must create the Store document with `payPlanType = 'TRIAL'` (changed from `'FREE'`).

- `StorePlanTypes.TRIAL` is a new enum value.
- `isStoreEnabled = true` — trial stores can go live immediately.
- The `alreadyClaimedFreeTrial` field must not be set or checked for new signups.
- **File:** `user-service-api/src/routes/v1/users/signup.ts`

---

### FR-2 — merchant_trial_info Record Created at Signup

At the same time the Store document is created, the system must insert a `merchant_trial_info` record.

| Field | Value at Creation |
|---|---|
| `merchant_id` | Reference to the new Store `_id` |
| `trial_start_date` | Current UTC timestamp (signup moment) |
| `trial_end_date` | `trial_start_date + 14 days` |
| `trial_plan_tier` | `'SCALE'` |
| `converted_to_paid` | `false` |
| `conversion_date` | `null` |
| `converted_plan` | `null` |
| `suspension_date` | `null` |
| `reactivation_date` | `null` |
| `reactivated_plan` | `null` |
| `migration_promo_code` | `null` |
| `migration_promo_expires_at` | `null` |
| `onboarding_steps_completed` | `[]` |

**Required indexes:**
- Unique index on `merchant_id`
- Index on `trial_end_date`
- Index on `converted_to_paid`

- **File:** `business-profile-api/src/models/MerchantTrialInfo.model.ts` (new)

---

### FR-3 — Trial Plan Provides Scale-Tier Access and Limits

During the trial, all access controls and usage limit checks must treat `TRIAL` plan merchants identically to `SCALE` plan merchants.

| Limit | Value |
|---|---|
| Product SKUs | 10,000 |
| Orders/month | 2,500 |
| Orders/year | 30,000 |
| Sales volume/year (USD) | $360,000 |
| Bandwidth GB/month | 150 |
| Storage GB | 100 |
| Max file size MB | 15 |
| Admin users | Unlimited |
| Store locations | Unlimited |
| Visitors | Unlimited |

- **File:** `business-profile-api/src/utils/merchant-billing.utils.ts` — `StorePlanProducts.TRIAL = -1`

---

### FR-4 — mustBeOnPaidPlan Middleware Updated

The `mustBeOnPaidPlan` middleware used across `business-profile-api` and `products-service-api` must be updated to include `'TRIAL'` in the list of allowed plan types.

```
const allowedPlanTypes = ['TRIAL', 'LAUNCH', 'GROW', 'SCALE'];
// SUSPENDED returns HTTP 403
```

- **Files:** `business-profile-api` route middleware, `products-service-api` route middleware

---

### FR-5 — Admin User Limit for TRIAL

The store admin user limit for `TRIAL` plan merchants is **unlimited**, matching Scale-tier.

- **File:** `user-service-api/src/services/store-admins.service.ts`

---

### FR-6 — Trial Banner on Merchant Dashboard

A persistent, non-dismissable, full-width banner must appear at the top of every Merchant Dashboard page for all merchants with `payPlanType === 'TRIAL'`.

The banner has three visual states determined by the number of calendar days remaining (`trial_end_date - now`):

| State | Days Remaining | Background | Message |
|---|---|---|---|
| **Standard** | 14 – 8 | Info blue | "You're on your 14-day free trial! [X] days remaining. [Choose a Plan →]" |
| **Urgency** | 7 – 3 | Warning yellow | "[X] days left on your free trial. Choose a plan to keep your store live. [Choose a Plan →]" |
| **Critical** | 2 – 1 | Danger red | "Your trial ends [tomorrow / today]! Your store will go offline unless you subscribe. [Choose a Plan Now →]" |

**Banner rules:**
- Days remaining is calculated dynamically on each page load: `ceil((trial_end_date - now) / 86400000)`.
- The banner is not dismissable. No close or hide control is rendered.
- The "Choose a Plan" / "Choose a Plan Now" button navigates to the plan comparison and selection page.
- The banner is hidden once `payPlanType` changes from `'TRIAL'` to a paid plan.
- The banner is not shown for suspended merchants (they see the ST-04 lock screen instead).
- **Component:** `prosperna1/src/components/TrialBanner.tsx` (new)

---

### FR-7 — Onboarding Checklist

A 6-step onboarding checklist card must appear on the main Merchant Dashboard page for merchants with `payPlanType === 'TRIAL'`.

| Step # | Step ID | Label | Completion Criteria | Navigation Target |
|---|---|---|---|---|
| 1 | `store_setup` | Set up your store | Store name, logo, and domain configured | Store Settings |
| 2 | `first_product` | Add your first product | At least 1 product created | Products > Add Product |
| 3 | `page_builder` | Customize your storefront | Page Builder opened and saved at least once | Page Builder |
| 4 | `payment_gateway` | Configure payment gateway | Customer-facing payment gateway connected | Payment Settings |
| 5 | `kyb` | Complete KYB verification | KYB form submitted | KYB Section |
| 6 | `store_published` | Publish your store | Store set to published/live state | Store Settings > Publish |

**Checklist rules:**
- Completed steps show a green checkmark and strikethrough text.
- Incomplete steps show an empty circle and are clickable (navigate to the relevant section).
- A progress indicator shows `{N} of 6 completed`.
- Completion state is persisted in `merchant_trial_info.onboarding_steps_completed` as an array of step IDs.
- The checklist is only rendered for `payPlanType === 'TRIAL'`.
- The checklist is not shown for suspended merchants.
- **Component:** `prosperna1/src/components/OnboardingChecklist.tsx` (new)

---

### FR-8 — In-App Conversion Prompts

Four scheduled in-app conversion prompts must appear during the trial at specific milestones.

| Prompt | Day | Trigger | Type | Message | Dismissable? |
|---|---|---|---|---|---|
| P-1 | Day 5 | `onboarding_steps_completed.length >= 3` | Subtle card/banner below checklist | "You're making great progress! Ready to go all-in? [Choose a Plan]" | No |
| P-2 | Day 7 | Automatic on dashboard load | Dashboard nudge banner | "7 days left — choose the plan that fits your business. [Compare Plans →]" | No |
| P-3 | Day 12 | Automatic on dashboard load | Prominent overlay card | "Your trial ends in 2 days. Choose a plan to keep your store live and your customers shopping. [Choose My Plan Now →] [Maybe Later]" | Yes — session only |
| P-4 | Day 13 | Automatic on dashboard load | Prominent overlay card | "Your trial ends tomorrow. Your store will go offline unless you subscribe. [Choose My Plan Now →]" | Yes — session only |

**Prompt rules:**
- Day count is calculated from `trial_start_date`. Day 1 = signup day.
- "Day N" means the merchant is on the Nth day of their trial (e.g., Day 5 = `floor((now - trial_start_date) / 86400000) + 1 === 5`).
- P-1 only appears if `onboarding_steps_completed.length >= 3`. If not met, it does not appear.
- P-2, P-3, P-4 appear automatically regardless of onboarding progress.
- P-3 and P-4 "Maybe Later" dismissal hides the prompt for the current browser session only. It reappears on next login or page refresh.
- All prompts link to the plan comparison and selection page.
- All prompts cease immediately when `payPlanType` changes from `'TRIAL'` to a paid plan.
- **Component:** `prosperna1/src/components/ConversionPrompt.tsx` (new)

---

### FR-9 — Plan Comparison & Selection Page

The plan comparison and selection page must be updated to show the new USD-priced plans.

**Route:** `/home/billing` (updated) or `/choose-plan` (new route — TBD by frontend team).

**Plan cards:**

| Plan | Monthly Price | Badge | SKUs | Orders/mo | Bandwidth | Storage | Admins | Locations |
|---|---|---|---|---|---|---|---|---|
| Launch | $29 USD | — | 500 | 200 | 25 GB | 10 GB | 2 | 2 |
| Grow | $59 USD | RECOMMENDED | 2,000 | 750 | 75 GB | 30 GB | 5 | 5 |
| Scale | $149 USD | — | 10,000 | 2,500 | 150 GB | 100 GB | Unlimited | Unlimited |

- The **Grow plan always displays the "RECOMMENDED" badge** regardless of merchant usage data. There is no dynamic recommendation engine in v1.
- All plans include: all native features, zero transaction fees.
- Each card has a "Select Plan" button.
- A "Compare All Features in Detail" expandable section may be present (out of scope for this PRD).

---

### FR-10 — Payment Gateway Selection

After the merchant selects a plan, a payment gateway selection step must be shown.

- Both Stripe and Xendit are shown to all merchants regardless of country.
- The default auto-selected gateway is determined by the Store document's `marketCountry`:
  - `'US'` → Stripe auto-selected
  - `'PH'` → Xendit auto-selected
  - Any other value → Stripe auto-selected
- The merchant can override the auto-selection to any available gateway.
- The selected gateway is passed to the ST-01 Payment Abstraction Layer during subscription creation.

---

### FR-11 — Billing Cycle Selection

After gateway selection, the merchant must be shown billing cycle options.

| Cycle | Multiplier | Display Example (Grow) |
|---|---|---|
| Monthly | 1× monthly price | "$59/mo" |
| Quarterly | 3× monthly price | "$177/quarter" |
| Annual | 12× monthly price (13 months for the price of 12) | "$708/year (1 month free!)" |

- The billing cycle is passed to the ST-01 Payment Abstraction Layer as `billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'`.

---

### FR-12 — Excess SKU Warning Before Payment

If the merchant's current published product count exceeds the selected plan's SKU limit, a warning must be displayed before proceeding to payment.

**Warning message:**
> "Your current product count ([N]) exceeds the [Plan Name] plan limit ([limit]). [N - limit] products will be hidden from your storefront. You can upgrade later to make them visible again."

- This warning appears as a modal or prominent alert before the payment step.
- The merchant must acknowledge the warning before proceeding.
- After conversion, excess SKUs are hidden from the storefront (not deleted). This uses the same logic as a plan downgrade (ST-05).

---

### FR-13 — Plan Conversion via Payment Abstraction Layer

After the merchant confirms their plan, gateway, and billing cycle selection (and acknowledges any excess SKU warning), the system must:

1. Call the ST-01 Payment Abstraction Layer with:
   - `merchantId`
   - `planId`: `'LAUNCH' | 'GROW' | 'SCALE'`
   - `billingCycle`: `'MONTHLY' | 'QUARTERLY' | 'ANNUAL'`
   - `gateway`: `'STRIPE' | 'XENDIT'`

2. The payment flow is entirely handled by ST-01 and the respective payment gateway.

3. On **payment failure**, the system must:
   - Display a clear error message.
   - Preserve `payPlanType = 'TRIAL'` — the trial is not ended on payment failure.
   - Allow the merchant to retry or select a different gateway.

---

### FR-14 — Post-Conversion State Updates

On successful payment confirmation (via the unified webhook handler from ST-01):

1. `Store.payPlanType` updated from `'TRIAL'` to the selected plan (`'LAUNCH'` / `'GROW'` / `'SCALE'`).
2. `merchant_trial_info` updated:
   - `converted_to_paid = true`
   - `conversion_date = now`
   - `converted_plan = selectedPlan`
3. Billing cycle starts from `conversion_date` (not from `trial_start_date`).
4. Plan usage limits are adjusted to the selected plan (may be lower than Scale-tier trial limits).
5. Trial drip email scheduling is cancelled (signal sent to ST-08).
6. Confirmation email sent (via ST-08).
7. Merchant is redirected to the dashboard with a success confirmation.

---

### FR-15 — trial-expiry-checker Background Job

An Agenda job named `trial-expiry-checker` must run **every hour**.

**Logic:**
1. Query `merchant_trial_info` where:
   - `trial_end_date` is within the next 24 hours from now
   - `converted_to_paid === false`
   - Notification for this threshold not already sent (tracked by a field on `merchant_trial_info` or by idempotency key)
2. For each matching merchant, emit a trigger to ST-08 to send the Day 13 final warning email.
3. The job also handles earlier-day drip triggers by being called at each trial lifecycle milestone.

**Idempotency:** Each notification threshold (Day 1, 3, 7, 10, 12, 13) must only trigger once per merchant per threshold.

---

### FR-16 — trial-expiry-processor Background Job

An Agenda job named `trial-expiry-processor` must run **every hour**.

**Logic:**
1. Query `merchant_trial_info` where:
   - `trial_end_date < now`
   - `converted_to_paid === false`
2. Cross-reference the Store document to confirm `payPlanType === 'TRIAL'` (not already suspended — idempotency guard).
3. For each matching merchant:
   - Call `suspendMerchant(store_id, 'trial_expired')` from ST-04.
   - Update `merchant_trial_info.suspension_date = now`.
   - Emit trigger to ST-08 to send the trial-expired email.
   - Schedule ST-08 win-back emails for `T+7` and `T+30`.

**Idempotency:** The `payPlanType === 'TRIAL'` check ensures re-running the job on an already-suspended merchant is a no-op.

---

### FR-17 — Frontend Route Guards Updated

React route guards in `prosperna1` must recognize `TRIAL` as an active, authorized plan type.

- `TRIAL` plan type must not redirect to the suspended lock screen.
- `TRIAL` plan type must cause the trial banner and onboarding checklist to render.
- `SUSPENDED` plan type must redirect to the ST-04 lock screen.

---

### FR-18 — GET /api/v1/trial/status Endpoint

A new authenticated REST endpoint must be created to return the merchant's current trial status.

**Method:** `GET`
**Path:** `/api/v1/trial/status`

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `is_on_trial` | Boolean | `true` if `payPlanType === 'TRIAL'` |
| `days_remaining` | Integer | `ceil((trial_end_date - now) / 86400000)`. Returns `0` if expired. |
| `trial_end_date` | ISO 8601 datetime | The UTC datetime when the trial expires |
| `onboarding_steps_completed` | String[] | Array of completed step IDs |
| `recommended_plan` | String | Always `'GROW'` in v1 |

---

### FR-19 — Signup Endpoint Updated

The `POST /v1/users/signup` endpoint must be updated so that on new store creation:
- `payPlanType` defaults to `'TRIAL'` instead of `'FREE'`.
- A `merchant_trial_info` record is created (FR-2).

---

### FR-20 — Merchant Status Endpoint Updated

The `GET /api/v1/merchant/status` endpoint must return `'trial'` as a valid status value alongside `'active'`, `'suspended'`, and `'deactivated'`.

---

### FR-21 — Legacy System Deprecations

The following components must be deprecated or removed as part of this feature:

| Component | File | Action |
|---|---|---|
| `subscribeToTrialPlan()` | `business-profile-api` | Remove entirely |
| `alreadyClaimedFreeTrial` field | Store model | Stop setting or checking this field. Do not delete the field from existing documents — leave as deprecated. |
| `PREMIUM_TRIAL` enum assignment | `StorePlanTypes` | Never assign to new accounts. Retain as a readable legacy value for existing documents. |
| `changePlan('FREE')` on trial expiry | `store-plan.service.ts`, Agenda jobs | Replace with `suspendMerchant('trial_expired')` call |
| Premium Trial warning cron | `business-profile-api/src/utils/cron.ts` | Replace with `trial-expiry-checker` job |
| Free Plan as default signup | `user-service-api/src/routes/v1/users/signup.ts` | Change default from `'FREE'` to `'TRIAL'` |
| Old plan comparison UI (Free, Plus, Pro, Premium, PHP pricing) | `prosperna1/src/pages/billing` | Replace with new Launch/Grow/Scale USD plan cards |

---

### FR-22 — One Trial Per Email (Anti-Abuse)

The system must prevent a merchant from starting a new trial using an email address already registered in Cognito.

- This is enforced by the existing Cognito duplicate-email check at the signup API level.
- No additional action is required in v1 beyond ensuring the signup endpoint returns a clear error for duplicate email registration attempts.

---

## 2. Non-Functional Requirements

### NFR-1 — Trial Status API Performance

The `GET /api/v1/trial/status` endpoint must respond within:
- p95 < 300ms
- p99 < 500ms

under normal load (up to 500 concurrent authenticated requests).

This is achievable with the `merchant_trial_info` indexed on `merchant_id`, avoiding cross-collection joins on the hot path.

### NFR-2 — Trial Expiry Processing SLA

The `trial-expiry-processor` job must process all expired, unconverted trials within **1 hour** of their `trial_end_date`.

Since the job runs hourly, the maximum delay between trial expiry and account suspension is 1 hour (plus job execution time). This is acceptable.

### NFR-3 — Background Job Idempotency

Both `trial-expiry-checker` and `trial-expiry-processor` must be idempotent. Re-running either job against the same merchant must produce no duplicate side effects (no duplicate emails, no double suspensions).

### NFR-4 — Database Index Compliance

The `merchant_trial_info` collection must have the following indexes before the feature goes live:
- Unique index on `merchant_id`
- Index on `trial_end_date` (for expiry job query efficiency)
- Index on `converted_to_paid` (for analytics queries)

### NFR-5 — Feature Flag / Deployment Guard

The change to default `payPlanType = 'TRIAL'` on signup must be protected by a deployment guard or environment variable (`TRIAL_SIGNUP_ENABLED = true`). This prevents accidental application to staging or pre-production environments during development.

### NFR-6 — Backward Compatibility

The introduction of `StorePlanTypes.TRIAL` must not break any existing plan-check logic. All services that check `payPlanType` must explicitly handle `'TRIAL'` by either:
- Treating it as equivalent to `'SCALE'` (for feature access), or
- Including it in the `allowedPlanTypes` array (for middleware checks).

Any service that would default to denying access for unknown plan types must be audited.

### NFR-7 — React Component Performance

The `TrialBanner`, `OnboardingChecklist`, and `ConversionPrompt` React components must:
- Not block the initial dashboard render (lazy-loaded or client-side only).
- Not make redundant API calls. The trial status data from `GET /api/v1/trial/status` must be fetched once and shared via React context or state management.

### NFR-8 — Data Preservation on Suspension

All merchant data (products, orders, customers, settings, media) must be fully preserved when an account transitions from `TRIAL` to `SUSPENDED`. No data deletion or archiving occurs during suspension.

---

## 3. System States & Transitions

```
[NEW SIGNUP]
     |
     v
  [TRIAL]  ──── paymentSuccess ──→  [LAUNCH / GROW / SCALE]
     |
     | trial_end_date < now AND converted_to_paid = false
     v
 [SUSPENDED]  ──── paymentSuccess (reactivation) ──→  [LAUNCH / GROW / SCALE]
```

| From State | Event | To State | Handler |
|---|---|---|---|
| *(none)* | New signup | `TRIAL` | `user-service-api` signup endpoint |
| `TRIAL` | Merchant selects and pays for a plan | `LAUNCH` / `GROW` / `SCALE` | ST-01 webhook → `business-profile-api` |
| `TRIAL` | `trial_end_date` passes without conversion | `SUSPENDED` | `trial-expiry-processor` job |
| `SUSPENDED` | Merchant selects and pays for a plan (reactivation) | `LAUNCH` / `GROW` / `SCALE` | ST-04 + ST-01 |

**Invalid transitions:**
- `TRIAL` → `FREE`: Not allowed. Deprecated.
- `TRIAL` → `PREMIUM_TRIAL`: Not allowed. Deprecated.
- A payment failure does not change state. The merchant remains on `TRIAL`.

---

## 4. Flows

### 4.1 New Signup Flow

1. Merchant submits registration form (email, password, business info).
2. `POST /v1/users/signup` called.
3. Cognito user created.
4. Store document created with `payPlanType = 'TRIAL'`, `isStoreEnabled = true`.
5. `merchant_trial_info` record created with `trial_start_date = now`, `trial_end_date = now + 14d`.
6. Merchant is redirected to Merchant Dashboard.
7. Dashboard renders: trial banner (standard state), onboarding checklist (0 of 6 complete).

### 4.2 Plan Conversion Flow (During Trial)

1. Merchant clicks "Choose a Plan" from trial banner, prompt, or checklist CTA.
2. Plan comparison page loads.
3. Merchant sees Launch / Grow (RECOMMENDED) / Scale cards.
4. Merchant selects a plan.
5. If merchant's current SKU count > selected plan's SKU limit → excess SKU warning modal shown.
6. Merchant acknowledges warning (or is not shown it if no excess).
7. Payment gateway selection step shown. Gateway auto-selected per `marketCountry`; merchant can override.
8. Billing cycle selection shown (Monthly / Quarterly / Annual).
9. Merchant confirms → ST-01 Payment Abstraction Layer called.
10. Merchant redirected to payment flow (Stripe or Xendit hosted page / embedded element).
11. On payment success webhook:
    - `Store.payPlanType` updated to selected plan.
    - `merchant_trial_info` updated (`converted_to_paid = true`, `conversion_date`, `converted_plan`).
    - Trial drip cancelled (ST-08 signal).
    - Confirmation email sent (ST-08 signal).
    - Merchant redirected to dashboard with success toast.
12. Trial banner and checklist no longer render (plan type is no longer `TRIAL`).

### 4.3 Trial Expiry Flow

1. `trial-expiry-processor` job runs hourly.
2. Queries `merchant_trial_info` for `trial_end_date < now AND converted_to_paid = false`.
3. Cross-references Store: `payPlanType === 'TRIAL'` (idempotency).
4. For each matching merchant:
   - Calls `suspendMerchant(store_id, 'trial_expired')` (ST-04).
   - Updates `merchant_trial_info.suspension_date = now`.
   - Signals ST-08: send trial-expired email, schedule win-back T+7, T+30.
5. ST-04 sets `payPlanType = 'SUSPENDED'`, `isSuspended = true`, `suspendedReason = 'trial_expired'`.
6. Next merchant dashboard visit → ST-04 lock screen shown.

### 4.4 Payment Failure Flow

1. Merchant completes plan/gateway/billing selection and is redirected to payment page.
2. Payment fails (card declined, gateway error, etc.).
3. ST-01 webhook (or redirect callback) signals failure.
4. `Store.payPlanType` remains `'TRIAL'`. No state change.
5. Merchant is shown a clear error message with retry option.
6. Merchant can retry payment or return to the plan selection page to choose a different gateway.

---

## 5. Gherkin User Stories

### Feature: New Merchant Signup — TRIAL Plan Provisioning

```gherkin
Feature: New Merchant Signup starts a 14-day TRIAL plan

  Scenario: Successful new signup provisioned as TRIAL
    Given a new user submits the registration form with a unique email and valid business info
    When the signup API processes the request
    Then a Store document is created with payPlanType equal to "TRIAL"
    And isStoreEnabled is true
    And a merchant_trial_info record is created with trial_start_date equal to now
    And trial_end_date is 14 days after trial_start_date
    And trial_plan_tier is "SCALE"
    And converted_to_paid is false
    And onboarding_steps_completed is an empty array

  Scenario: Duplicate email prevented from starting a new trial
    Given an email address that is already registered in Cognito
    When a new user attempts to sign up with that same email
    Then the signup API returns a 409 Conflict error
    And no new Store document or merchant_trial_info record is created
    And the existing merchant's trial is not affected

  Scenario: TRIAL plan merchant is not redirected to suspension lock screen
    Given a merchant with payPlanType equal to "TRIAL" and a non-expired trial
    When the merchant navigates to any page on the Merchant Dashboard
    Then the page renders normally
    And the trial banner is displayed
    And the onboarding checklist is displayed
    And the ST-04 suspension lock screen is not shown
```

---

### Feature: Trial Banner Display

```gherkin
Feature: Trial Banner shows countdown and adapts state by days remaining

  Scenario Outline: Trial banner renders correct state based on days remaining
    Given a trial merchant with <days_remaining> days remaining on their trial
    When the merchant loads any Merchant Dashboard page
    Then the trial banner is visible
    And the banner background is <background_color>
    And the banner message contains <message_fragment>
    And a "Choose a Plan" CTA button is present

    Examples:
      | days_remaining | background_color | message_fragment                              |
      | 14             | info blue        | "You're on your 14-day free trial!"           |
      | 8              | info blue        | "8 days remaining"                            |
      | 7              | warning yellow   | "7 days left on your free trial"              |
      | 3              | warning yellow   | "3 days left on your free trial"              |
      | 2              | danger red       | "Your trial ends tomorrow"                    |
      | 1              | danger red       | "Your trial ends today"                       |

  Scenario: Trial banner is not dismissable
    Given a trial merchant with 10 days remaining
    When the merchant views the Merchant Dashboard
    Then the trial banner has no close or dismiss control
    And the banner remains visible on page navigation

  Scenario: Trial banner disappears after plan conversion
    Given a trial merchant who has just completed a plan subscription payment
    When the merchant returns to the Merchant Dashboard
    Then the trial banner is not rendered
    And payPlanType is no longer "TRIAL"

  Scenario: Trial banner not shown to suspended merchants
    Given a merchant with payPlanType equal to "SUSPENDED"
    When the merchant attempts to navigate to the Merchant Dashboard
    Then the ST-04 suspension lock screen is shown
    And the trial banner is not rendered
```

---

### Feature: Onboarding Checklist

```gherkin
Feature: Onboarding Checklist tracks trial merchant setup progress

  Scenario: Checklist is visible on dashboard for trial merchants
    Given a merchant with payPlanType equal to "TRIAL"
    When the merchant loads the main dashboard page
    Then the onboarding checklist card is visible
    And the progress indicator shows "0 of 6 completed"
    And all 6 steps show empty circle status icons

  Scenario: Completing a step updates the checklist and persists
    Given a trial merchant with onboarding_steps_completed equal to []
    When the merchant creates their first product
    Then the system updates onboarding_steps_completed to include "first_product"
    And when the merchant reloads the dashboard
    Then the "Add your first product" step shows a green checkmark
    And the progress indicator shows "1 of 6 completed"

  Scenario: Clicking an incomplete step navigates to the correct section
    Given a trial merchant with the "first_product" step incomplete
    When the merchant clicks the "Add your first product" step in the checklist
    Then the merchant is navigated to the Products > Add Product page

  Scenario: Checklist not shown for converted merchants
    Given a merchant who has converted from TRIAL to a paid plan
    When the merchant loads the dashboard
    Then the onboarding checklist card is not rendered
```

---

### Feature: In-App Conversion Prompts

```gherkin
Feature: Conversion prompts appear at key trial milestones

  Scenario: Day 5 prompt appears when 3 or more onboarding steps are complete
    Given a trial merchant on Day 5 of their trial
    And onboarding_steps_completed contains 3 or more step IDs
    When the merchant loads the dashboard
    Then the Day 5 subtle CTA card is visible below the checklist

  Scenario: Day 5 prompt does not appear when fewer than 3 steps are complete
    Given a trial merchant on Day 5 of their trial
    And onboarding_steps_completed contains fewer than 3 step IDs
    When the merchant loads the dashboard
    Then the Day 5 subtle CTA card is not rendered

  Scenario: Day 7 prompt appears automatically
    Given a trial merchant on Day 7 of their trial
    When the merchant loads the dashboard
    Then the Day 7 dashboard nudge banner is visible regardless of onboarding progress

  Scenario Outline: Day 12 and Day 13 prompts are dismissable per session
    Given a trial merchant on <day> of their trial
    When the merchant loads the dashboard
    Then the <prompt_type> overlay card is visible
    When the merchant clicks "Maybe Later"
    Then the prompt is hidden for the current browser session
    When the merchant opens a new browser session and loads the dashboard
    Then the <prompt_type> overlay card is visible again

    Examples:
      | day    | prompt_type                     |
      | Day 12 | 2-days-remaining overlay card   |
      | Day 13 | final-warning overlay card      |

  Scenario: All prompts cease after plan conversion
    Given a trial merchant who has converted to a paid plan
    When the merchant loads the dashboard on what would have been Day 12
    Then no conversion prompts are rendered
```

---

### Feature: Plan Comparison and Selection

```gherkin
Feature: Merchant selects a plan during or after trial

  Scenario: Grow plan always shows RECOMMENDED badge
    Given a trial merchant on the plan comparison page
    When the merchant views the three plan cards
    Then the Grow plan card displays a "RECOMMENDED" badge
    And the Launch and Scale plan cards do not display a "RECOMMENDED" badge

  Scenario: Payment gateway auto-selects based on marketCountry
    Given a trial merchant with marketCountry equal to "PH"
    When the merchant reaches the payment gateway selection step
    Then Xendit is auto-selected
    And Stripe is also displayed and selectable

  Scenario: Merchant overrides the auto-selected gateway
    Given a trial merchant with Xendit auto-selected
    When the merchant selects Stripe manually
    Then the subscription creation call is sent to ST-01 with gateway equal to "STRIPE"

  Scenario: Excess SKU warning shown before payment for lower-tier plan
    Given a trial merchant with 800 published products
    When the merchant selects the Launch plan (500 SKU limit)
    Then a warning modal is shown before the payment step
    And the warning states that 300 products will be hidden from the storefront
    When the merchant acknowledges the warning
    Then the payment flow proceeds

  Scenario: Excess SKU warning not shown when SKU count is within plan limits
    Given a trial merchant with 400 published products
    When the merchant selects the Launch plan (500 SKU limit)
    Then no excess SKU warning modal is shown
    And the payment flow proceeds directly

  Scenario: Annual billing shows correct pricing
    Given a trial merchant on the billing cycle selection step for the Grow plan ($59/mo)
    When the merchant views the Annual option
    Then the displayed price is "$708/year"
    And the label says "1 month free!"

  Scenario Outline: All three plans can be selected and payment initiated
    Given a trial merchant on the plan comparison page
    When the merchant clicks "Select Plan" on the <plan> card
    And selects <gateway> as the payment gateway
    And selects Monthly billing
    And confirms
    Then the ST-01 Payment Abstraction Layer is called with planId <plan_id>, gateway <gateway>, billingCycle "MONTHLY"

    Examples:
      | plan   | plan_id | gateway |
      | Launch | LAUNCH  | STRIPE  |
      | Grow   | GROW    | XENDIT  |
      | Scale  | SCALE   | STRIPE  |
```

---

### Feature: Successful Plan Conversion State Updates

```gherkin
Feature: Post-payment state is correctly updated on successful conversion

  Scenario: Trial merchant converts to Grow plan on Day 8
    Given a trial merchant on Day 8 of their trial
    When the merchant completes a successful Grow plan payment via Stripe
    And the ST-01 payment success webhook fires
    Then Store.payPlanType is updated to "GROW"
    And merchant_trial_info.converted_to_paid is true
    And merchant_trial_info.conversion_date is approximately now
    And merchant_trial_info.converted_plan is "GROW"
    And the trial drip email schedule is cancelled
    And a confirmation email is triggered via ST-08
    And the merchant is redirected to the dashboard with a success message
    And the trial banner is no longer rendered

  Scenario: Payment failure does not end the trial
    Given a trial merchant who attempts to pay for the Launch plan
    When the payment gateway returns a failure response
    Then Store.payPlanType remains "TRIAL"
    And merchant_trial_info.converted_to_paid remains false
    And a payment error message is displayed to the merchant
    And the merchant can retry or choose a different gateway

  Scenario: Trial merchant converts on Day 1 (same-day conversion)
    Given a trial merchant who has just signed up
    When the merchant immediately selects and pays for the Scale plan
    Then Store.payPlanType is updated to "SCALE"
    And merchant_trial_info.conversion_date equals today
    And the billing cycle starts from today's date
    And no further trial drip emails are sent
```

---

### Feature: Trial Expiry and Suspension

```gherkin
Feature: Expired trial accounts are suspended by the background job

  Scenario: trial-expiry-processor suspends an expired, unconverted trial
    Given a trial merchant whose trial_end_date is in the past
    And converted_to_paid is false
    And Store.payPlanType is "TRIAL"
    When the trial-expiry-processor job runs
    Then suspendMerchant is called with the merchant's store_id and reason "trial_expired"
    And Store.payPlanType is updated to "SUSPENDED"
    And merchant_trial_info.suspension_date is set to now
    And the trial-expired email is triggered via ST-08
    And the win-back emails at T+7 and T+30 are scheduled via ST-08

  Scenario: trial-expiry-processor is idempotent on already-suspended accounts
    Given a trial merchant already in SUSPENDED state
    When the trial-expiry-processor job runs again
    Then suspendMerchant is NOT called a second time
    And no duplicate emails are sent

  Scenario: Merchant with unfulfilled orders is suspended at trial expiry
    Given a trial merchant with 5 orders, 2 of which are unfulfilled
    And the trial has expired
    When the trial-expiry-processor job runs
    Then the account is suspended
    And the 2 unfulfilled orders remain in the system, preserved
    And the merchant must reactivate to fulfill those orders

  Scenario: Suspended trial merchant reactivates by selecting a paid plan
    Given a merchant in SUSPENDED state with suspendedReason "trial_expired"
    When the merchant logs in and is shown the ST-04 lock screen
    And the merchant selects the Grow plan and completes payment
    Then the account is reactivated
    And Store.payPlanType is updated to "GROW"
    And merchant_trial_info.reactivation_date is set to now
    And merchant_trial_info.reactivated_plan is "GROW"
```

---

### Feature: Scale-Tier Access During Trial

```gherkin
Feature: Trial merchants have Scale-tier feature access and limits

  Scenario: Trial merchant can publish their store and accept orders
    Given a trial merchant with payPlanType equal to "TRIAL"
    When the merchant publishes their store
    Then isStoreEnabled is true
    And the storefront is accessible to customers
    And customers can place and complete orders normally

  Scenario: TRIAL plan is allowed by mustBeOnPaidPlan middleware
    Given a trial merchant attempting to access a route guarded by mustBeOnPaidPlan
    When the request is made with a TRIAL plan token
    Then the request is permitted with HTTP 200

  Scenario: SUSPENDED plan is blocked by mustBeOnPaidPlan middleware
    Given a merchant with payPlanType equal to "SUSPENDED" attempting to access a guarded route
    When the request is made
    Then the middleware returns HTTP 403 Forbidden
```

---

## 6. Telemetry Events

The following analytics events must be emitted to the telemetry pipeline:

| Event Name | Trigger | Key Properties |
|---|---|---|
| `trial_started` | New signup provisioned as TRIAL | `merchant_id`, `trial_start_date`, `trial_end_date` |
| `trial_banner_cta_clicked` | Merchant clicks "Choose a Plan" on trial banner | `merchant_id`, `days_remaining`, `banner_state` |
| `onboarding_step_completed` | Any checklist step marked complete | `merchant_id`, `step_id`, `steps_completed_count`, `days_into_trial` |
| `conversion_prompt_shown` | A conversion prompt is rendered | `merchant_id`, `prompt_day`, `prompt_type` |
| `conversion_prompt_dismissed` | Merchant clicks "Maybe Later" | `merchant_id`, `prompt_day` |
| `plan_selection_started` | Merchant reaches the plan comparison page | `merchant_id`, `days_remaining`, `source` (banner / prompt / sidebar) |
| `plan_selected` | Merchant clicks "Select Plan" on a plan card | `merchant_id`, `plan_id`, `days_remaining` |
| `gateway_selected` | Merchant confirms gateway choice | `merchant_id`, `gateway`, `was_auto_selected` |
| `billing_cycle_selected` | Merchant confirms billing cycle | `merchant_id`, `billing_cycle` |
| `trial_conversion_completed` | ST-01 payment success webhook processed | `merchant_id`, `plan_id`, `billing_cycle`, `gateway`, `days_into_trial` |
| `trial_conversion_failed` | Payment failure received | `merchant_id`, `plan_id`, `gateway`, `error_code` |
| `trial_expired` | trial-expiry-processor suspends an account | `merchant_id`, `trial_start_date`, `trial_end_date` |

---

## 7. Rollout Plan

| Phase | Scope | Criteria |
|---|---|---|
| **Phase 1 — Internal testing** | Staging environment, internal Prosperna accounts only | All FRs pass QA. Background jobs verified idempotent. Legacy deprecations verified not to affect existing Free Plan records. |
| **Phase 2 — Canary (5% new signups)** | 5% of new signups routed to TRIAL default. Existing accounts unaffected. | Monitor trial-expiry-processor error rate (<0.1%). Monitor conversion rate baseline. ST-08 email triggers firing correctly. |
| **Phase 3 — Full rollout (100% new signups)** | All new signups receive TRIAL plan. Existing Free Plan merchants unchanged. | Canary metrics stable. No regressions in existing plan operations. ST-01 integration confirmed stable. |
| **Phase 4 — ST-16 migration** | Existing Free Plan merchants migrated (separate initiative) | Out of scope for this PRD. |

**Rollout guard:** The `TRIAL_SIGNUP_ENABLED` environment variable must be `true` in production for the TRIAL default to activate. Default is `false` during development and staging phases.

---

## 8. Traceability Map

| FR | Gherkin Scenario(s) |
|---|---|
| FR-1 (TRIAL on signup) | "Successful new signup provisioned as TRIAL" |
| FR-2 (merchant_trial_info created) | "Successful new signup provisioned as TRIAL" |
| FR-3 (Scale-tier access) | "Trial merchant can publish their store and accept orders", "TRIAL plan is allowed by mustBeOnPaidPlan middleware" |
| FR-4 (mustBeOnPaidPlan updated) | "TRIAL plan is allowed by mustBeOnPaidPlan middleware", "SUSPENDED plan is blocked by mustBeOnPaidPlan middleware" |
| FR-5 (admin user limit for TRIAL) | Covered by FR-3 scenarios (Scale-tier access). Explicit admin-limit scenario deferred to ST-05/integration test. |
| FR-6 (trial banner) | "Trial banner renders correct state based on days remaining", "Trial banner is not dismissable", "Trial banner disappears after plan conversion", "Trial banner not shown to suspended merchants" |
| FR-7 (onboarding checklist) | "Checklist is visible on dashboard for trial merchants", "Completing a step updates the checklist and persists", "Clicking an incomplete step navigates to the correct section", "Checklist not shown for converted merchants" |
| FR-8 (conversion prompts) | "Day 5 prompt appears when 3 or more steps complete", "Day 5 prompt does not appear when fewer than 3 steps complete", "Day 7 prompt appears automatically", "Day 12 and Day 13 prompts are dismissable per session", "All prompts cease after plan conversion" |
| FR-9 (plan comparison page) | "Grow plan always shows RECOMMENDED badge", "All three plans can be selected and payment initiated" |
| FR-10 (gateway selection) | "Payment gateway auto-selects based on marketCountry", "Merchant overrides the auto-selected gateway" |
| FR-11 (billing cycle selection) | "Annual billing shows correct pricing", "All three plans can be selected and payment initiated" |
| FR-12 (excess SKU warning) | "Excess SKU warning shown before payment for lower-tier plan", "Excess SKU warning not shown when SKU count is within plan limits" |
| FR-13 (conversion via ST-01) | "All three plans can be selected and payment initiated" |
| FR-14 (post-conversion state updates) | "Trial merchant converts to Grow plan on Day 8", "Trial merchant converts on Day 1 (same-day conversion)" |
| FR-15 (trial-expiry-checker job) | Covered operationally — direct Gherkin deferred to integration test suite. Expiry outcomes covered by FR-16 scenarios. |
| FR-16 (trial-expiry-processor job) | "trial-expiry-processor suspends an expired, unconverted trial", "trial-expiry-processor is idempotent on already-suspended accounts", "Merchant with unfulfilled orders is suspended at trial expiry" |
| FR-17 (frontend route guards) | "TRIAL plan merchant is not redirected to suspension lock screen", "Trial banner not shown to suspended merchants" |
| FR-18 (GET /api/v1/trial/status) | Covered by endpoint doc contract. Integration scenario: response fields validated in Phase 1 QA. |
| FR-19 (signup endpoint updated) | "Successful new signup provisioned as TRIAL" |
| FR-20 (merchant status endpoint updated) | Covered by endpoint doc contract. |
| FR-21 (legacy deprecations) | "Successful new signup provisioned as TRIAL" (no PREMIUM_TRIAL or FREE default), "trial-expiry-processor suspends..." (not changePlan FREE). |
| FR-22 (one trial per email) | "Duplicate email prevented from starting a new trial" |

---

## 9. Open Questions & Assumptions

| # | Item | Type | Detail |
|---|---|---|---|
| OQ-1 | Plan comparison page route | Open Question | Final decision on `/home/billing` vs `/choose-plan` is owned by the frontend team. Either route is acceptable; this PRD is route-agnostic. |
| OQ-2 | Day counting in prompts | Assumption | Day N is calculated as `floor((now - trial_start_date) / 86400000) + 1`. Day 1 = the signup day regardless of the time of signup. |
| OQ-3 | "Maybe Later" session storage | Assumption | Prompt dismissal is tracked in `sessionStorage` (React), keyed by `prompt_day`. Clears on tab close / new session. |
| OQ-4 | Email trigger idempotency | Assumption | The `trial-expiry-checker` tracks already-sent notifications per merchant per threshold via a `notified_days` array field on `merchant_trial_info` (to be confirmed with ST-08 team on the handshake contract). |
| OQ-5 | Checklist post-conversion visibility | Assumption | The onboarding checklist component conditionally renders only when `payPlanType === 'TRIAL'`. No additional state cleanup is required on conversion. |
