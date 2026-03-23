---
id: st-11-merchant-dashboard-ui-updates
title: PRD. ST-11 Merchant Dashboard UI Updates
sidebar_label: ST-11 Merchant Dashboard UI Updates
sidebar_position: 11
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-22
- Status: Draft

---

## Summary

ST-11 delivers all Merchant Dashboard front-end changes required for the Prosperna Pricing Restructuring v3. It updates every merchant-facing screen that references plan names, pricing, billing flows, or account state. It introduces three new screens / persistent components (Suspended Lock Screen, Trial Countdown Banner, Usage Dashboard Widget) and removes the Convenience Fee Splitter. The changes consume API outputs from ST-01, ST-03, ST-04, and ST-06. No new backend services are introduced by this subtask.

Tech stack: React 18 + Vite (JSX), `react-router-dom`, Redux + React Query, `aws-amplify` (Cognito auth), Bootstrap.

---

## User Journey

### Happy Path — New Trial Merchant Converts Before Expiry

1. Merchant signs up → `payPlanType` is set to `TRIAL` → lands on Dashboard Home.
2. Trial Countdown Banner is visible at the top: "You're on your 14-day free trial! 14 days remaining. [Choose a Plan →]"
3. Merchant completes onboarding steps (store setup, product upload, payment gateway, KYB, publish).
4. Day 5: after completing 3+ onboarding steps, a subtle inline CTA appears on Dashboard Home.
5. Day 7: a mid-trial banner appears below the countdown banner.
6. Day 8: merchant clicks "Choose a Plan" → Billing page opens with Launch / Grow / Scale cards in USD, Stripe auto-selected (US merchant), billing cycle defaults to Monthly.
7. Merchant selects Grow → ChangePlanModal confirms → payment completes via Stripe.
8. `payPlanType` updated to `GROW` → Trial Countdown Banner disappears → dashboard transitions to paid plan experience.
9. Usage Dashboard Widget appears on Dashboard Home showing 0/750 orders, 0/30 GB storage, 0/75 GB bandwidth.

### Alternate Path — Merchant Logs In While Suspended

1. Merchant logs in → route guard reads `payPlanType === 'SUSPENDED'`.
2. Route guard redirects all routes to `/suspended` — no other content is accessible.
3. Suspended Lock Screen renders with contextual heading based on `suspendedReason`.
4. Merchant selects a plan → completes payment → `payPlanType` transitions to paid plan type.
5. Route guard allows access to full dashboard → merchant lands on Dashboard Home.

### Alternate Path — Merchant Downgrades and Usage Exceeds New Plan Limits

1. Merchant on Grow ($59/mo) navigates to Billing → clicks "Downgrade" to Launch.
2. ChangePlanModal appears with downgrade warnings: excess SKUs will be hidden (not deleted), excess admin users will be archived.
3. Merchant confirms → plan changes to LAUNCH → products and users above the limit are handled per backend logic.

### Failure Path — Payment Fails on Plan Selection

1. Merchant completes plan selection → payment fails → redirected to `/home/payment-failed`.
2. Page shows plan name (Launch / Grow / Scale), USD price, failure message.
3. Merchant has two CTAs: "Try again" (re-initiates same payment flow) and "Try a different payment method" (opens gateway selector to switch between Stripe and Xendit).

### Failure Path — Trial Expires Without Conversion

1. Day 14 ends → backend suspends merchant → `payPlanType` becomes `SUSPENDED`, `suspendedReason` becomes `trial_expired`.
2. Merchant attempts to access any dashboard route → route guard redirects to `/suspended`.
3. Suspended Lock Screen shows: "Your trial has ended. All your data, products, and settings are safe. Choose a plan to bring your store back online."

---

## Functional Requirements

**FR-1 — Plan Constants Update**
The `PLAN_UPGRADE_LIST` constant in `prosperna1/src/constants/plans.js` is updated from `['PLUS', 'PLUS_TRIAL', 'PRO', 'PREMIUM', 'PREMIUM_TRIAL']` to `['LAUNCH', 'GROW', 'SCALE']`.

**FR-2 — Utility Function Updates**
In `prosperna1/src/utils/userUtil.js`:
- `isOnPaidPlan()` is updated to check `LAUNCH`, `GROW`, `SCALE` (and `TRIAL` where applicable).
- `GetConveniencePercentPerPlan()` is removed entirely.
- `isOnTrial()` is added — returns `true` if `payPlanType === 'TRIAL'`.
- `isSuspended()` is added — returns `true` if `payPlanType === 'SUSPENDED'`.
- `getTrialDaysRemaining()` is added — returns the integer number of days between the current date and `merchant_trial_info.trial_end_date`. Returns 0 if past the end date.
- `getPlanDisplayName(planType)` is added — maps internal plan type enum to display name: `LAUNCH` → `"Launch"`, `GROW` → `"Grow"`, `SCALE` → `"Scale"`, `TRIAL` → `"Trial"`, `SUSPENDED` → `"Suspended"`. Returns the original value unchanged for any unrecognized type.

**FR-3 — Route Guard: Suspended State**
The authenticated route wrapper (`src/routes/` or `src/App.jsx`) enforces the following:
- When `payPlanType === 'SUSPENDED'`: every authenticated route redirects to `/suspended`. No dashboard routes are accessible — no exceptions.
- Legacy plan types (FREE, PLUS, PRO, PREMIUM, PREMIUM_TRIAL) are treated as SUSPENDED and redirect to `/suspended`.
- The `/suspended` route is not accessible to non-suspended merchants: if a merchant with a non-suspended plan navigates directly to `/suspended`, they are redirected to `/home`.

**FR-4 — Route Guard: Trial State**
When `payPlanType === 'TRIAL'`:
- All dashboard routes are accessible without restriction.
- The Trial Countdown Banner is rendered in the authenticated layout, above all page content.
- Applicable milestone prompts (FR-7) are evaluated and rendered.

**FR-5 — Suspended Lock Screen**
A new screen is rendered at the `/suspended` route. Content:
- Contextual heading based on `suspendedReason`:
  - `trial_expired` → "Your trial has ended"
  - `cancelled` → "Your subscription has been cancelled"
  - `payment_failed` → "Your subscription payment failed"
  - `migration` → "The Free Plan has been retired"
- Subheading: "All your data, products, and settings are safe."
- Body: "Choose a plan to bring your store back online:"
- Plan selection cards (Launch / Grow / Scale) — same reusable component as FR-9.
- Payment Gateway Selector (FR-10).
- Billing cycle selector (Monthly / Quarterly / Annual) with dynamic price updates.
- Promo code input with Apply button.
- Expandable "Compare Plans" detail link.
- No secondary navigation links: no "Withdraw Balance", no "Export Data", no "View Dashboard".

**FR-6 — Trial Countdown Banner**
A persistent banner is rendered in the authenticated dashboard layout when `payPlanType === 'TRIAL'`. Requirements:
- Content: "You're on your 14-day free trial! **[X] days remaining.** [Choose a Plan →]"
- `[X]` is the value returned by `getTrialDaysRemaining()`.
- The "Choose a Plan" CTA navigates to `/home/billing` or opens the plan selection modal.
- When `getTrialDaysRemaining()` returns a value > 3: banner uses informational styling (blue / green accent).
- When `getTrialDaysRemaining()` returns 2 or 3: banner uses warning styling (amber / orange).
- When `getTrialDaysRemaining()` returns 0 or 1: banner uses danger styling (red).
- Styling transitions between states must use CSS transitions (no jarring state changes).
- The banner must not cause Cumulative Layout Shift (CLS ≥ 0.1) — it must be reserved in the layout at all times during the trial period, not injected after content renders.
- The banner disappears once `payPlanType` transitions to a paid plan type.
- The banner is visible across all dashboard routes during the trial.

**FR-7 — In-App Trial Conversion Prompts**
Contextual prompts are shown at specific trial milestones:

| Trigger | Condition | Prompt Type | Content |
|---|---|---|---|
| Day 5 | `getTrialDaysRemaining() === 9` AND `onboarding_steps_completed >= 3` | Inline CTA on Dashboard Home | "You've made great progress! Choose a plan to keep your store live after your trial." |
| Day 7 | `getTrialDaysRemaining() === 7` | Banner below trial countdown | "You're halfway through your trial. 7 days left — choose the plan that fits your business." |
| Day 12 | `getTrialDaysRemaining() === 2` | Strong banner + subtle modal on login | "Your trial ends in 2 days. Your store will go offline unless you subscribe." |
| Day 13 | `getTrialDaysRemaining() === 1` | Modal on dashboard login | "Your trial ends tomorrow. Choose a plan now to keep your store live without interruption." |

Each prompt:
- Is shown at most once per merchant (persistence via backend flag in `merchant_trial_info` or a dedicated dismissal field).
- Does not reappear after the merchant dismisses it.
- Is cancelled entirely if the merchant selects a paid plan at any point.
- Is not shown if the merchant has already visited `/home/billing` during the current session.

**FR-8 — Billing Page: Plan Cards Update**
The Billing / Pricing page (`/home/billing`) is updated as follows:
- Plan cards display Launch ($29/mo), Grow ($59/mo), Scale ($149/mo) in USD.
- Each card displays usage limits: orders/month, SKUs, bandwidth GB/month, storage GB, admin users, store locations.
- A "Zero transaction fees ✓" line and an "All native features ✓" line appear on every card.
- A "★ POPULAR" badge is always displayed on the Grow card.
- Convenience fee rates are removed entirely — no rate is displayed on any card.
- A universal "Zero transaction fees on all plans" banner is displayed above the plan cards.
- Billing cycle selector (Monthly / Quarterly / Annual) updates plan card prices dynamically.
- Promo code input field remains; when applied, the original price is shown with strikethrough and the discounted price is shown.
- "Current Plan" badge is shown on the merchant's active plan card.
- Other plan cards show "Upgrade" or "Downgrade" based on comparison with the current plan.
- If `payPlanType === 'TRIAL'`: a prominent banner is shown at the top of the page ("You're on your 14-day free trial. [X] days remaining. Choose a plan below to keep your store live.").

**FR-9 — Plan Comparison Component (Reusable)**
A single shared `PlanComparisonCard` component is used in all contexts where a merchant selects a plan:
- `/home/billing` (upgrade/subscribe flow)
- `/suspended` (lock screen)
- Trial banner "Choose a Plan" CTA (modal)

The component accepts `currentPlanType`, `trialInfo`, and `marketCountry` as props and renders plan cards accordingly.

**FR-10 — Payment Gateway Selector**
A `PaymentGatewaySelector` component is implemented as a radio button group. It is shown in all plan selection contexts (billing, lock screen, trial modal). Requirements:
- Options: "Stripe — Pay with credit/debit card via Stripe" and "Xendit — Pay with eWallet, credit card, or bank transfer via Xendit."
- Default selection is determined by `store.marketCountry`:
  - `US` → Stripe pre-selected.
  - `PH` → Xendit pre-selected.
  - All other countries → Stripe pre-selected.
- Merchant can select either option regardless of their market country.
- The selected gateway identifier is passed as a parameter to the subscription creation or upgrade API call (FR-17).

**FR-11 — Billing Page: Recommended Badge for Trial Merchants**
When `payPlanType === 'TRIAL'` and usage data is available, a "Recommended" badge is displayed on the plan card matching the merchant's current usage:
- Current SKU count < 100 AND orders are minimal → Recommend Launch.
- Current SKU count 100–500 AND moderate order activity → Recommend Grow.
- Current SKU count > 500 OR high order activity → Recommend Scale.
If usage data is unavailable, the Recommended badge is not shown (no error state for this case).

**FR-12 — ChangePlanModal Updates**
The ChangePlanModal is updated as follows:
- Plan names updated to Launch / Grow / Scale; pricing shown in USD.
- For upgrades: prorated charge for the remaining billing period is shown.
- For downgrades: warnings are shown for each usage limit that the merchant currently exceeds on the target plan:
  - "Your current SKU count ([X]) exceeds the [Plan] plan limit ([limit]). Excess products will be hidden from your storefront (not deleted)."
  - "Your current admin user count ([X]) exceeds the [Plan] plan limit ([limit]). Excess admins will be archived."
  - Similar warnings for storage and locations if applicable.
- Payment Gateway Selector (FR-10) is included for upgrade flows.
- All references to convenience fee rate comparisons are removed.

**FR-13 — UpgradeModal Updates**
The UpgradeModal (`src/Partials/UpgradeModal/`) is updated as follows:
- Message updated to reference new plan names: "Upgrade to Launch, Grow, or Scale to unlock this feature."
- For TRIAL merchants: the UpgradeModal is suppressed entirely — trial merchants have full Scale-tier feature access.
- For SUSPENDED merchants: the UpgradeModal does not apply (they cannot reach any gated feature screen).

**FR-14 — CancelPlanModal Updates**
The CancelPlanModal is updated as follows:
- The confirmation message references the billing period end date: "Your plan will remain active until [date]. After that date, your store will go offline. Your data will be preserved."
- All references to "reverting to Free Plan" are removed — the Free Plan concept no longer exists.
- The cancellation API call is updated from the direct Xendit endpoint (`POST /v1/payments/xendit/recurring-plan/deactivate`) to the Payment Abstraction Layer's cancel subscription operation (ST-01).

**FR-15 — Payment Success Page Update**
`/home/payment-success` is updated as follows:
- Plan name displayed using `getPlanDisplayName()`.
- Pricing shown in USD.
- Message: "Welcome to Prosperna [Plan]! Your store is now live."
- If reactivating from suspended state: "Welcome back! Your store is live again on Prosperna [Plan]."
- Next billing date and selected payment gateway are shown.

**FR-16 — Payment Failed Page Update**
`/home/payment-failed` is updated as follows:
- Plan name displayed using `getPlanDisplayName()`.
- Pricing shown in USD.
- Primary CTA: "Try again" — re-initiates the payment flow via the Payment Abstraction Layer.
- Secondary CTA: "Try a different payment method" — opens the Payment Gateway Selector to switch between Stripe and Xendit.
- No reference to a grace period (none exists — suspension is immediate on payment failure).

**FR-17 — Onboarding Flow and AI Onboarding Updates**
All onboarding route screens (`/dashboard/*-onboarding`, `/onboarding-survey`, `/ai-onboarding/chat`) are updated:
- All references to "Free Plan" replaced with "14-day free trial."
- All references to "Claim your free trial" or "Start your Premium Trial" are removed.
- Onboarding checklist items updated to reflect the trial-era flow:
  1. Set up your store (name, logo, domain)
  2. Add your first product
  3. Customize your storefront (Page Builder)
  4. Configure payment gateway (Bring Your Own)
  5. Complete KYB verification
  6. Publish your store
- "Choose a Plan" CTA is introduced after 3+ steps are completed (coordinates with Day 5 prompt in FR-7).

**FR-18 — Dashboard Home and Setup Guide Updates**
The Dashboard Home (`/home`) is updated:
- Setup Guide checklist updated to match the trial-context onboarding flow (same as FR-17).
- All "Upgrade from Free" prompts are removed and replaced with trial-context prompts.
- If `payPlanType === 'TRIAL'`: Trial Countdown Banner is rendered (FR-6); Day 5 conversion prompt is rendered if conditions are met (FR-7).
- If `payPlanType` is in `['LAUNCH', 'GROW', 'SCALE']`: "Current Plan: [Plan Name]" badge is visible in the sidebar or header.

**FR-19 — Usage Dashboard Widget**
A Usage Dashboard Widget is added to the Dashboard Home (`/home`) under the following conditions:
- Visible only when `payPlanType` is `LAUNCH`, `GROW`, or `SCALE`.
- Not shown for `TRIAL` merchants (trial limits are generous and unlikely to be reached).
- Widget content:
  - Orders: `[current] / [limit]` this month, with a horizontal progress bar.
  - Storage: `[current] GB / [limit] GB`, with a progress bar.
  - Bandwidth: `[current] GB / [limit] GB`, with a progress bar.
- Progress bar color rules:
  - 0–79% utilization → green.
  - 80–94% utilization → amber (warning).
  - 95%+ utilization → red (urgent).
- "View Usage Details →" link navigates to the full usage page (built by ST-06).
- Data source: `GET /api/v1/usage`.
- On load: skeleton loader is shown until data resolves.
- On error: error state is shown with "View Usage Details →" link still active.

**FR-20 — Convenience Fee Splitter Removal**
The following are removed entirely with no replacement:
- `prosperna1/src/pages/home/StoreSettings/components/ConvenienceFeeSplitter/index.jsx` (506 lines)
- `prosperna1/src/pages/home/MyPay/components/ConvenienceFeeSplitter/index.jsx` (284 lines)
- `useConvenienceFeeSplitter.js` custom hook
- `UpdateConvenienceFeePercentHandler` API call in `prosperna1/src/api/StoreSettings/index.js`

The Store Settings and MyPay pages render correctly without the removed component. No replacement UI is needed.

---

## Non-Functional Requirements

**NFR-1 — Page Load Performance**
`/suspended` (Suspended Lock Screen) and `/home/billing` must achieve a Time to Interactive (TTI) of ≤ 3 seconds when measured on a simulated 4G connection in Chrome DevTools Lighthouse. These are the two highest-stakes screens in the new subscription flow.

**NFR-2 — Layout Stability**
The Trial Countdown Banner must be reserved in the layout at component mount time — it must not be injected after page content renders. The banner's CLS contribution to the overall page must remain at or below 0.1 as measured by the Web Vitals `cls` metric.

**NFR-3 — Transition Quality**
All state-driven visual changes must use CSS transitions:
- Banner color urgency state changes (blue → amber → red): 200ms ease transition on background-color and color.
- Plan card selection highlight: 150ms ease.
- Modal open/close: 200–300ms ease-in-out.
- Progress bar fill animations on widget load: 300ms ease-out.
No jarring or instantaneous state changes are permitted on any of these elements.

**NFR-4 — Browser Support**
All new and updated components must function correctly on the latest 2 major versions of Chrome, Firefox, Safari, and Edge. No support for Internet Explorer or legacy Chromium-based browsers.

**NFR-5 — Error and Loading States**
All components that depend on async API data must implement:
- **Loading state**: skeleton loader using the global component library's skeleton pattern.
- **Error state**: inline error message following the global component library's error pattern, with the option to retry where applicable.
No component may crash or render blank on API failure.

**NFR-6 — Accessibility (Nice to Have)**
New components (Suspended Lock Screen, Trial Countdown Banner, Usage Dashboard Widget, Payment Gateway Selector) should target WCAG 2.1 AA compliance:
- Plan selection modals must be keyboard-navigable with visible focus indicators.
- Radio buttons in the Payment Gateway Selector must have proper `aria-label` attributes.
- Progress bars in the Usage Widget must include `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes.
- Color alone must not be the only means of conveying urgency (progress bar colors must be accompanied by text labels or icons).

---

## UX Notes

- **Plan card layout**: Three-column layout on desktop; single-column stacked layout on mobile. The Grow card (center) is visually distinguished with the "★ POPULAR" badge and may use a slightly elevated card elevation.
- **Suspended Lock Screen**: Full viewport height, centered content, no dashboard navigation visible. The Prosperna logo is shown at the top. No footer, no sidebar.
- **Trial Countdown Banner**: Fixed height, no collapse/expand behavior. CTA ("Choose a Plan →") styled as a link-button, not a full button, to avoid visual weight competition with the page content.
- **Payment Gateway Selector**: Two-option radio group. Each option shows the gateway name as a label and a one-line description of accepted payment methods as a sublabel.
- **Dynamic pricing**: When the billing cycle selector changes, plan card prices update in-place without a full page reload. The price update should use a brief fade-in (150ms) to signal the change without being distracting.
- **Promo code**: Applied discount is shown as `~~$29~~ $14.50/mo` (strikethrough original, discounted price in full weight).
- **Downgrade warnings in ChangePlanModal**: Each limit violation is shown as a distinct warning item with an icon (e.g., ⚠️). The confirm button is not disabled — the merchant proceeds with full knowledge.

---

## Data Model Notes

ST-11 does not introduce new data models. It reads the following fields from existing models:

**From the Store document:**
- `payPlanType` — `TRIAL | LAUNCH | GROW | SCALE | SUSPENDED` (and legacy types as failsafe)
- `suspendedReason` — `trial_expired | cancelled | payment_failed | migration`
- `marketCountry` — ISO country code (used for gateway auto-selection)
- `merchant_trial_info.trial_end_date` — ISO 8601 date
- `merchant_trial_info.onboarding_steps_completed` — integer

**From the Usage API (`GET /api/v1/usage`):**
- `orders.current`, `orders.limit`
- `storage.current_gb`, `storage.limit_gb`
- `bandwidth.current_gb`, `bandwidth.limit_gb`

---

## Integrations and APIs

All API integrations in ST-11 are consumptions of other subtasks' outputs. ST-11 introduces no new backend endpoints.

| API | Owner Subtask | Used By |
|---|---|---|
| Store / merchant document (`payPlanType`, `suspendedReason`, `marketCountry`, `merchant_trial_info`) | ST-03, ST-04 | Route guard, Trial Banner, Suspended Lock Screen |
| Subscription creation API | ST-01 | Plan selection → payment flow |
| Subscription upgrade/downgrade API | ST-01 | ChangePlanModal confirm action |
| Cancel subscription API | ST-01 / ST-05 | CancelPlanModal confirm action |
| Available gateways API | ST-01 | PaymentGatewaySelector component |
| `GET /api/v1/usage` | ST-06 | Usage Dashboard Widget |

See ENDPOINT document for full API contract details.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `payPlanType` missing or null on store document | Route guard treats as unresolved — show full-screen skeleton loader. After 5s timeout with no resolution, redirect to an error page with "Unable to load account status. Please refresh." |
| Trial info API returns error | Trial banner shows fallback: "Your trial is active. [Choose a Plan →]" — no days-remaining count. No error message displayed to merchant. |
| Usage API (`GET /api/v1/usage`) returns error | Usage Widget shows error state: "Usage data unavailable." with a "View Usage Details →" link that still works. |
| Subscription creation / upgrade API returns error | Payment flow shows error state: "Something went wrong. Please try again." with a retry CTA. If the error is a gateway-specific failure (e.g., Stripe card declined), the message mirrors the gateway's error description. |
| Promo code invalid | Inline error below the promo code field: "Promo code not valid or expired." Discounted price is not applied. |
| Downgrade API returns 409 (usage limit violation) | ChangePlanModal re-renders with updated warning state explaining which limits are violated, even if warnings were already shown before confirmation. |

---

## Telemetry and Analytics

No analytics or telemetry events are tracked in ST-11. This is an explicit decision — event tracking can be added in a future iteration.

---

## Rollout Plan

All ST-11 changes are deployed simultaneously with ST-01, ST-02, ST-03, ST-04, and ST-06. There is no phased rollout, no feature flag, and no canary deployment. The release is a single coordinated cut-over for all pricing restructuring subtasks.

Pre-launch checklist:
- [ ] All five dependent subtasks (ST-01, ST-02, ST-03, ST-04, ST-06) have confirmed API readiness.
- [ ] ST-11 integration tests pass against all consumed API contracts.
- [ ] Route guard logic tested for all plan states: TRIAL, LAUNCH, GROW, SCALE, SUSPENDED, and all legacy types.
- [ ] Trial Countdown Banner CLS measured at ≤ 0.1 in Lighthouse.
- [ ] Suspended Lock Screen TTI ≤ 3s and Billing Page TTI ≤ 3s in Lighthouse (simulated 4G).

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | What is the exact API path and response shape for the subscription creation endpoint (ST-01)? Assumed `POST /api/v1/subscriptions` — to be confirmed. | ST-01 team | Open |
| OQ-2 | What is the exact API path for the available gateways list (ST-01)? Assumed `GET /api/v1/subscriptions/gateways` — to be confirmed. | ST-01 team | Open |
| OQ-3 | Is `merchant_trial_info` a nested object inside the store document, or returned from a separate API call? Affects how the route guard and Trial Banner fetch this data. | ST-03 team | Open |
| OQ-4 | What is the exact field name and location of the per-prompt dismissal flag for in-app trial conversion prompts? Assumed it lives in `merchant_trial_info` as a set of flags. | ST-03 team | Open |
| OQ-5 | Quarterly and Annual USD pricing (LAUNCH: $87/$377, GROW: $177/$767, SCALE: $447/$1,937) are listed as pending stakeholder confirmation. Are these values finalized? | Product Owner | Open |

---

# Gherkin User Stories

## Feature: ST-11 Merchant Dashboard UI Updates

---

### FR-1: Plan Constants Update

```gherkin
Scenario: PLAN_UPGRADE_LIST contains only new plan types
  Given the plans.js constants file is loaded
  Then PLAN_UPGRADE_LIST equals ["LAUNCH", "GROW", "SCALE"]
  And PLAN_UPGRADE_LIST does not contain "PLUS"
  And PLAN_UPGRADE_LIST does not contain "PRO"
  And PLAN_UPGRADE_LIST does not contain "PREMIUM"
  And PLAN_UPGRADE_LIST does not contain "PREMIUM_TRIAL"
  And PLAN_UPGRADE_LIST does not contain "PLUS_TRIAL"
```

---

### FR-2: Utility Function Updates

```gherkin
Scenario: isOnTrial returns true for TRIAL merchants
  Given a merchant has payPlanType equal to "TRIAL"
  When isOnTrial() is called
  Then the result is true

Scenario: isOnTrial returns false for non-TRIAL merchants
  Given a merchant has payPlanType equal to "LAUNCH"
  When isOnTrial() is called
  Then the result is false

Scenario: isSuspended returns true for SUSPENDED merchants
  Given a merchant has payPlanType equal to "SUSPENDED"
  When isSuspended() is called
  Then the result is true

Scenario: getTrialDaysRemaining returns correct integer
  Given a merchant has trial_end_date 5 days from today
  When getTrialDaysRemaining() is called
  Then the result is 5

Scenario: getTrialDaysRemaining returns 0 when trial has expired
  Given a merchant has trial_end_date 2 days in the past
  When getTrialDaysRemaining() is called
  Then the result is 0

Scenario Outline: getPlanDisplayName maps internal types to display names
  Given a plan type of "<internal_type>"
  When getPlanDisplayName(planType) is called
  Then the result is "<display_name>"

  Examples:
    | internal_type | display_name |
    | LAUNCH        | Launch       |
    | GROW          | Grow         |
    | SCALE         | Scale        |
    | TRIAL         | Trial        |
    | SUSPENDED     | Suspended    |

Scenario: GetConveniencePercentPerPlan no longer exists
  Given the userUtil.js module is loaded
  Then GetConveniencePercentPerPlan is not a defined export
```

---

### FR-3: Route Guard — Suspended State

```gherkin
Scenario: Suspended merchant is redirected to lock screen
  Given a merchant is authenticated
  And the merchant's payPlanType is "SUSPENDED"
  When the merchant navigates to "/home"
  Then the browser redirects to "/suspended"

Scenario: Suspended merchant cannot access any other dashboard route
  Given a merchant is authenticated
  And the merchant's payPlanType is "SUSPENDED"
  When the merchant navigates to "/home/orders"
  Then the browser redirects to "/suspended"

Scenario: Legacy FREE plan merchant is treated as suspended
  Given a merchant is authenticated
  And the merchant's payPlanType is "FREE"
  When the merchant navigates to "/home"
  Then the browser redirects to "/suspended"

Scenario Outline: All legacy plan types redirect to /suspended
  Given a merchant is authenticated
  And the merchant's payPlanType is "<legacy_type>"
  When the merchant navigates to any dashboard route
  Then the browser redirects to "/suspended"

  Examples:
    | legacy_type    |
    | FREE           |
    | PLUS           |
    | PRO            |
    | PREMIUM        |
    | PREMIUM_TRIAL  |
```

---

### FR-3 Edge Case: Non-Suspended Merchant Cannot Access /suspended

```gherkin
Scenario: Paid merchant navigating to /suspended is redirected to /home
  Given a merchant is authenticated
  And the merchant's payPlanType is "GROW"
  When the merchant navigates directly to "/suspended"
  Then the browser redirects to "/home"

Scenario: Trial merchant navigating to /suspended is redirected to /home
  Given a merchant is authenticated
  And the merchant's payPlanType is "TRIAL"
  When the merchant navigates directly to "/suspended"
  Then the browser redirects to "/home"
```

---

### FR-4: Route Guard — Trial State

```gherkin
Scenario: Trial merchant has full dashboard access
  Given a merchant is authenticated
  And the merchant's payPlanType is "TRIAL"
  When the merchant navigates to "/home/orders"
  Then the orders page renders successfully
  And no redirect occurs

Scenario: Trial Countdown Banner is rendered for trial merchant
  Given a merchant is authenticated
  And the merchant's payPlanType is "TRIAL"
  When the merchant navigates to any dashboard route
  Then the Trial Countdown Banner is visible above all page content
```

---

### FR-5: Suspended Lock Screen

```gherkin
Scenario: Lock screen shows "Your trial has ended" for trial_expired suspension
  Given a merchant's payPlanType is "SUSPENDED"
  And the merchant's suspendedReason is "trial_expired"
  When the merchant views the /suspended screen
  Then the heading reads "Your trial has ended"
  And the subheading reads "All your data, products, and settings are safe."
  And plan cards for Launch, Grow, and Scale are displayed
  And no dashboard navigation links are rendered

Scenario: Lock screen shows "The Free Plan has been retired" for migration suspension
  Given a merchant's payPlanType is "SUSPENDED"
  And the merchant's suspendedReason is "migration"
  When the merchant views the /suspended screen
  Then the heading reads "The Free Plan has been retired"

Scenario: Lock screen shows "Your subscription payment failed" for payment_failed suspension
  Given a merchant's payPlanType is "SUSPENDED"
  And the merchant's suspendedReason is "payment_failed"
  When the merchant views the /suspended screen
  Then the heading reads "Your subscription payment failed"

Scenario: Lock screen shows "Your subscription has been cancelled" for cancelled suspension
  Given a merchant's payPlanType is "SUSPENDED"
  And the merchant's suspendedReason is "cancelled"
  When the merchant views the /suspended screen
  Then the heading reads "Your subscription has been cancelled"
```

---

### FR-6: Trial Countdown Banner

```gherkin
Scenario: Banner shows correct days remaining for trial merchant
  Given a merchant's payPlanType is "TRIAL"
  And getTrialDaysRemaining() returns 10
  When the merchant views any dashboard page
  Then the Trial Countdown Banner displays "10 days remaining"

Scenario: Banner uses informational styling when more than 3 days remain
  Given a merchant's payPlanType is "TRIAL"
  And getTrialDaysRemaining() returns 8
  When the Trial Countdown Banner is rendered
  Then the banner uses informational (blue/green) styling

Scenario: Banner uses warning styling when 2 or 3 days remain
  Given a merchant's payPlanType is "TRIAL"
  And getTrialDaysRemaining() returns 3
  When the Trial Countdown Banner is rendered
  Then the banner uses warning (amber/orange) styling

Scenario: Banner uses danger styling when 0 or 1 day remains
  Given a merchant's payPlanType is "TRIAL"
  And getTrialDaysRemaining() returns 1
  When the Trial Countdown Banner is rendered
  Then the banner uses danger (red) styling

Scenario: Banner does not cause layout shift on render
  Given the dashboard layout is rendered with payPlanType "TRIAL"
  When the page is measured for Cumulative Layout Shift
  Then the CLS contribution of the banner is less than or equal to 0.1

Scenario: Banner disappears after merchant selects a paid plan
  Given a merchant's payPlanType changes from "TRIAL" to "GROW"
  When the dashboard re-renders
  Then the Trial Countdown Banner is no longer visible
```

---

### FR-7: In-App Trial Conversion Prompts

```gherkin
Scenario: Day 7 banner appears when trial has 7 days remaining
  Given a merchant's payPlanType is "TRIAL"
  And getTrialDaysRemaining() returns 7
  And the Day 7 prompt has not been dismissed
  When the merchant views the Dashboard Home
  Then a Day 7 mid-trial banner is displayed below the Trial Countdown Banner

Scenario: Day 13 modal appears on login when 1 day remains
  Given a merchant's payPlanType is "TRIAL"
  And getTrialDaysRemaining() returns 1
  And the Day 13 prompt has not been dismissed
  When the merchant logs in to the dashboard
  Then a modal is shown with the message "Your trial ends tomorrow. Choose a plan now to keep your store live without interruption."

Scenario: Conversion prompt is not shown after it has been dismissed
  Given a merchant dismissed the Day 7 prompt
  And getTrialDaysRemaining() returns 7 on the next session
  When the merchant views the Dashboard Home
  Then the Day 7 prompt is not displayed

Scenario: No conversion prompt shown if merchant visited billing page this session
  Given a merchant's payPlanType is "TRIAL"
  And the merchant visited "/home/billing" earlier in the session
  And getTrialDaysRemaining() returns 7
  When the merchant views the Dashboard Home
  Then no Day 7 conversion prompt is shown

Scenario: All conversion prompts cancelled after merchant subscribes
  Given a merchant's payPlanType transitions from "TRIAL" to "LAUNCH"
  When any dashboard page is rendered
  Then no trial conversion prompts are displayed
```

---

### FR-8 and FR-11: Billing Page Plan Cards

```gherkin
Scenario: Billing page displays Launch, Grow, and Scale plan cards in USD
  Given a merchant navigates to "/home/billing"
  When the page renders
  Then a plan card for Launch is shown with price "$29/mo"
  And a plan card for Grow is shown with price "$59/mo"
  And a plan card for Scale is shown with price "$149/mo"
  And all prices are denominated in USD
  And no PHP (₱) prices are displayed

Scenario: Billing page shows usage limits on plan cards
  Given a merchant navigates to "/home/billing"
  When the page renders
  Then the Launch card shows "200 orders/mo", "500 SKUs", "25 GB bandwidth", "10 GB storage"
  And the Grow card shows "750 orders/mo", "2,000 SKUs", "75 GB bandwidth", "30 GB storage"
  And the Scale card shows "2,500 orders/mo", "10,000 SKUs", "150 GB bandwidth", "100 GB storage"

Scenario: Grow card always has the POPULAR badge
  Given a merchant navigates to "/home/billing"
  When the page renders
  Then the Grow plan card displays a "★ POPULAR" badge

Scenario: No convenience fee rates are shown on any plan card
  Given a merchant navigates to "/home/billing"
  When the page renders
  Then no convenience fee percentage is displayed on any plan card

Scenario: Recommended badge shown for trial merchant based on usage
  Given a merchant's payPlanType is "TRIAL"
  And the merchant's current SKU count is 80
  And the merchant's order activity is minimal
  When the merchant navigates to "/home/billing"
  Then the Launch plan card displays a "Recommended" badge

Scenario: Billing cycle selector updates prices dynamically
  Given a merchant navigates to "/home/billing"
  When the merchant selects "Annual" from the billing cycle selector
  Then all plan card prices update to their annual equivalents without a full page reload

Scenario: Promo code application shows strikethrough pricing
  Given a merchant navigates to "/home/billing"
  And the merchant enters a valid promo code that applies 50% off Launch
  When the merchant clicks "Apply"
  Then the Launch card shows "~~$29~~ $14.50/mo"
```

---

### FR-9: Plan Comparison Component (Reusable)

```gherkin
Scenario: Same plan cards render on /suspended as on /home/billing
  Given a merchant is on the /suspended screen
  When the lock screen renders
  Then the Launch, Grow, and Scale plan cards are displayed with the same content as on the billing page

Scenario: Plan comparison component is rendered in trial modal
  Given a trial merchant clicks "Choose a Plan →" on the Trial Countdown Banner
  When the modal opens
  Then the same plan cards are rendered as on the billing page
```

---

### FR-10: Payment Gateway Selector

```gherkin
Scenario: Stripe is auto-selected for US merchants
  Given a merchant's store.marketCountry is "US"
  When the Payment Gateway Selector renders
  Then the Stripe option is selected by default

Scenario: Xendit is auto-selected for PH merchants
  Given a merchant's store.marketCountry is "PH"
  When the Payment Gateway Selector renders
  Then the Xendit option is selected by default

Scenario: Stripe is auto-selected for merchants from all other countries
  Given a merchant's store.marketCountry is "SG"
  When the Payment Gateway Selector renders
  Then the Stripe option is selected by default

Scenario: Merchant can override the auto-selected gateway
  Given a merchant's store.marketCountry is "PH"
  And the Payment Gateway Selector renders with Xendit selected
  When the merchant clicks the Stripe option
  Then the Stripe option becomes selected

Scenario: Selected gateway is passed to the subscription API
  Given a merchant selects "Stripe" in the Payment Gateway Selector
  When the merchant confirms a plan selection
  Then the subscription creation API is called with gateway parameter equal to "stripe"
```

---

### FR-12: ChangePlanModal Downgrade Warnings

```gherkin
Scenario: ChangePlanModal warns when SKU count exceeds target plan limit
  Given a merchant currently has 800 SKUs
  And the merchant attempts to downgrade to the Launch plan (500 SKU limit)
  When the ChangePlanModal is shown
  Then a warning reads "Your current SKU count (800) exceeds the Launch plan limit (500). Excess products will be hidden from your storefront (not deleted)."

Scenario: ChangePlanModal warns when admin user count exceeds target plan limit
  Given a merchant currently has 4 admin users
  And the merchant attempts to downgrade to the Launch plan (2 admin user limit)
  When the ChangePlanModal is shown
  Then a warning reads "Your current admin user count (4) exceeds the Launch plan limit (2). Excess admins will be archived."

Scenario: ChangePlanModal shows no warnings when within limits
  Given a merchant currently has 100 SKUs and 1 admin user
  And the merchant attempts to downgrade to the Launch plan
  When the ChangePlanModal is shown
  Then no usage limit warnings are displayed

Scenario: ChangePlanModal displays USD pricing for all plans
  Given a merchant opens the ChangePlanModal
  When the modal renders
  Then all prices are shown in USD
  And no PHP prices are displayed
```

---

### FR-13: UpgradeModal Updates

```gherkin
Scenario: UpgradeModal shows updated plan names
  Given a merchant on a paid plan tries to access a plan-gated feature
  When the UpgradeModal is shown
  Then the message contains "Launch, Grow, or Scale"
  And the message does not contain "Plus", "Pro", or "Premium"

Scenario: UpgradeModal is not shown for TRIAL merchants
  Given a merchant's payPlanType is "TRIAL"
  When the merchant accesses any feature that previously triggered the UpgradeModal for FREE merchants
  Then the UpgradeModal is not displayed
  And the feature is accessible
```

---

### FR-14: CancelPlanModal Updates

```gherkin
Scenario: CancelPlanModal shows period-end behavior without Free Plan reference
  Given a merchant opens the CancelPlanModal
  When the modal renders
  Then the modal contains "Your plan will remain active until"
  And the modal contains "After that date, your store will go offline"
  And the modal contains "Your data will be preserved"
  And the modal does not contain "Free Plan"
  And the modal does not contain "revert"
```

---

### FR-15: Payment Success Page

```gherkin
Scenario: Payment Success shows new plan name and USD price
  Given a merchant successfully subscribes to the Grow plan via Stripe
  When the /home/payment-success page renders
  Then the heading reads "Welcome to Prosperna Grow! Your store is now live."
  And the price "$59/mo" is displayed in USD
  And the payment gateway "Stripe" is displayed

Scenario: Payment Success shows reactivation message for suspended merchant
  Given a merchant was previously suspended
  And the merchant successfully subscribes to a plan
  When the /home/payment-success page renders
  Then the heading reads "Welcome back! Your store is live again on Prosperna [Plan]."
```

---

### FR-16: Payment Failed Page

```gherkin
Scenario: Payment Failed shows new plan name and USD price
  Given a merchant's payment fails for the Grow plan
  When the /home/payment-failed page renders
  Then the plan name "Grow" and price "$59" are displayed
  And a "Try again" CTA is present
  And a "Try a different payment method" CTA is present

Scenario: Payment Failed allows switching payment gateway
  Given the /home/payment-failed page is rendered
  When the merchant clicks "Try a different payment method"
  Then the Payment Gateway Selector is displayed
  And the merchant can choose between Stripe and Xendit
```

---

### FR-17: Onboarding Flow Updates

```gherkin
Scenario: Onboarding step references trial, not Free Plan
  Given a new merchant is on the /dashboard/update-store-branding-onboarding route
  When the page renders
  Then the page references "14-day free trial"
  And the page does not contain "Free Plan"
  And the page does not contain "Start your Premium Trial"
  And the page does not contain "Claim your free trial"
```

---

### FR-18: Dashboard Home Updates

```gherkin
Scenario: Dashboard Home shows "Current Plan" badge for paid merchant
  Given a merchant's payPlanType is "GROW"
  When the merchant navigates to "/home"
  Then a "Current Plan: Grow" badge is visible in the sidebar or header

Scenario: Dashboard Home shows no "Upgrade from Free" prompts
  Given any merchant is authenticated
  When the merchant navigates to "/home"
  Then no "Upgrade from Free" UI element is rendered
```

---

### FR-19: Usage Dashboard Widget

```gherkin
Scenario: Usage Widget is shown for paid plan merchants
  Given a merchant's payPlanType is "LAUNCH"
  When the merchant navigates to "/home"
  Then the Usage Dashboard Widget is visible
  And it displays orders, storage, and bandwidth progress bars

Scenario: Usage Widget is not shown for trial merchants
  Given a merchant's payPlanType is "TRIAL"
  When the merchant navigates to "/home"
  Then the Usage Dashboard Widget is not rendered

Scenario: Usage Widget progress bar is green at low utilization
  Given a merchant has used 50% of their order limit
  When the Usage Widget renders
  Then the orders progress bar is green

Scenario: Usage Widget progress bar is amber at 80-94% utilization
  Given a merchant has used 85% of their order limit
  When the Usage Widget renders
  Then the orders progress bar is amber

Scenario: Usage Widget progress bar is red at 95%+ utilization
  Given a merchant has used 96% of their order limit
  When the Usage Widget renders
  Then the orders progress bar is red

Scenario: Usage Widget shows error state when API is unavailable
  Given the GET /api/v1/usage call returns a server error
  When the Usage Widget renders
  Then the widget shows "Usage data unavailable."
  And the "View Usage Details →" link is still active

Scenario: Usage Widget shows skeleton loader while data loads
  Given the GET /api/v1/usage call is in progress
  When the Usage Widget renders
  Then skeleton placeholder elements are shown for each progress bar
```

---

### FR-20: Convenience Fee Splitter Removal

```gherkin
Scenario: ConvenienceFeeSplitter is not rendered in Store Settings
  Given a merchant navigates to "/home/settings/store"
  When the Store Settings page renders
  Then the ConvenienceFeeSplitter section is not present in the DOM
  And the page renders correctly without it

Scenario: ConvenienceFeeSplitter is not rendered in MyPay
  Given a merchant navigates to the MyPay section
  When the MyPay page renders
  Then the ConvenienceFeeSplitter section is not present in the DOM

Scenario: No API call to UpdateConvenienceFeePercentHandler
  Given any merchant is authenticated
  When any dashboard page renders
  Then no HTTP request is made to the convenience fee update endpoint
```

---

# Traceability Map

| Requirement | Gherkin Scenario(s) |
|---|---|
| FR-1 — Plan Constants Update | PLAN_UPGRADE_LIST contains only new plan types |
| FR-2 — Utility Function Updates | isOnTrial returns true/false; isSuspended returns true; getTrialDaysRemaining returns correct integer / 0 on expiry; getPlanDisplayName maps internal types; GetConveniencePercentPerPlan no longer exists |
| FR-3 — Route Guard: Suspended State | Suspended merchant redirected to lock screen; Cannot access any other route; Legacy FREE/PLUS/PRO/PREMIUM/PREMIUM_TRIAL redirect to /suspended; Non-suspended merchant redirected from /suspended to /home; Trial merchant redirected from /suspended to /home |
| FR-4 — Route Guard: Trial State | Trial merchant has full dashboard access; Trial Countdown Banner rendered for trial merchant |
| FR-5 — Suspended Lock Screen | Lock screen shows contextual headings for trial_expired / migration / payment_failed / cancelled; Plan cards displayed; No dashboard navigation links |
| FR-6 — Trial Countdown Banner | Banner shows correct days remaining; Informational/warning/danger styling by days; CLS ≤ 0.1; Banner disappears after paid plan selected |
| FR-7 — In-App Trial Conversion Prompts | Day 7 banner on 7 days remaining; Day 13 modal on 1 day remaining; Dismissed prompt not reshown; No prompt if billing page visited this session; All prompts cancelled after subscribing |
| FR-8 — Billing Page Plan Cards | USD pricing on cards; Usage limits on cards; POPULAR badge on Grow; No convenience fee rates; Billing cycle selector updates dynamically; Promo code shows strikethrough |
| FR-9 — Plan Comparison Component (Reusable) | Same cards on /suspended and /home/billing; Same cards in trial modal |
| FR-10 — Payment Gateway Selector | Stripe auto-selected for US; Xendit auto-selected for PH; Stripe default for all others; Merchant can override; Selected gateway passed to API |
| FR-11 — Recommended Badge | Recommended badge on Launch for low-usage trial merchant |
| FR-12 — ChangePlanModal Updates | SKU count warning on downgrade; Admin user warning on downgrade; No warning when within limits; USD pricing in modal |
| FR-13 — UpgradeModal Updates | Updated plan names in message; Not shown for TRIAL merchants |
| FR-14 — CancelPlanModal Updates | Period-end messaging; No "Free Plan" or "revert" language |
| FR-15 — Payment Success Page | New plan name and USD price shown; Reactivation message for previously suspended merchant |
| FR-16 — Payment Failed Page | New plan name and USD price; Try again CTA; Switch payment method opens gateway selector |
| FR-17 — Onboarding Flow Updates | Trial context messaging; No Free Plan / Premium Trial references |
| FR-18 — Dashboard Home Updates | Current Plan badge for paid merchants; No "Upgrade from Free" prompts |
| FR-19 — Usage Dashboard Widget | Shown for paid plans; Not shown for TRIAL; Green/amber/red progress bars by utilization; Error state on API failure; Skeleton loader while loading |
| FR-20 — Convenience Fee Splitter Removal | Not in Store Settings DOM; Not in MyPay DOM; No API call to convenience fee endpoint |
