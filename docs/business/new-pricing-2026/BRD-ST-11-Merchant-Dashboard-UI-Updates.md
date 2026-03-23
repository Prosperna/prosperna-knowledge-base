---
id: st-11-merchant-dashboard-ui-updates
title: BRD. ST-11 Merchant Dashboard UI Updates
sidebar_label: ST-11 Merchant Dashboard UI Updates
sidebar_position: 11
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-22
- Status: Draft

---

## Background and Problem

Prosperna is executing a full pricing restructuring under the v3 initiative, transitioning from a PHP-denominated four-tier subscription model (FREE / PLUS / PRO / PREMIUM) to a USD-denominated three-tier model (LAUNCH / GROW / SCALE) with a new 14-day trial entry point, a formal suspended account state, and zero transaction fees across all plans.

The Merchant Dashboard — the primary interface used daily by all paying and trial merchants — currently displays outdated plan names, PHP pricing, and a convenience fee differentiation model that will no longer exist post-transition. Without updating the dashboard, merchants will see inconsistent or incorrect information about their subscription, limits, billing amounts, and account status, eroding trust and increasing support load.

Two new merchant lifecycle states also have no current UI representation: the 14-day trial (requiring a persistent countdown banner and milestone-based conversion prompts) and the suspended state (requiring a full-screen paywall that blocks all dashboard access until a plan is selected and payment is made). These states require entirely new screens, route guards, and persistent UI components.

ST-11 is the front-end consolidation subtask that updates every affected Merchant Dashboard screen to reflect the new pricing model, plan names, account states, usage limits, and payment gateway options. It does not introduce new backend services — it consumes the API outputs of ST-01, ST-03, ST-04, and ST-06.

---

## Goals

1. Replace all UI references to old plan names (FREE, PLUS, PRO, PREMIUM) with the new plan names (Trial, Launch, Grow, Scale) or remove them entirely.
2. Replace all PHP pricing with USD pricing across all plan-related screens.
3. Implement the Suspended Lock Screen that completely blocks dashboard access for suspended merchants, with a clear path to reactivation.
4. Implement the Trial Countdown Banner and milestone-based conversion prompts to drive trial-to-paid conversion before trial expiry.
5. Implement the Payment Gateway Selector so merchants can choose between Stripe and Xendit when subscribing, upgrading, or reactivating.
6. Remove the Convenience Fee Splitter UI from Store Settings and MyPay, consistent with the zero-convenience-fee policy.
7. Add the Usage Dashboard Widget to the Dashboard Home for merchants on paid plans, providing visibility into usage vs limits.
8. Update the Onboarding Flow to reference the 14-day trial context instead of the deprecated Free Plan experience.
9. Update all frontend utility functions and plan constants to reflect the new plan structure.

---

## Non-Goals

- Admin Control Platform UI changes — covered by ST-12.
- Customer-facing Online Store changes, including suspension messaging and checkout fee removal — covered by ST-13.
- Email template updates for billing, trial expiry, and migration notifications — covered by ST-14.
- Usage limits enforcement banners (80% / 95% / 100% / 125% usage warnings and overage acceptance flows) — covered by ST-06.
- Cancellation retention flow including exit survey, counter-offers, and pending cancellation state — covered by ST-05.
- Backend schema changes, plan constants, and API business logic — covered by ST-01, ST-03, ST-04.
- Promo code auto-apply UX for migrated merchants.
- Marketing website pricing page.
- Mobile application changes (no mobile app in scope).

---

## Stakeholders

| Role | Party | Involvement |
|---|---|---|
| Product Owner | Prosperna Product Team | Approves scope and acceptance criteria |
| Frontend Engineering Lead | Prosperna Frontend Team | Implements all ST-11 changes in `prosperna1` |
| Backend Engineering | ST-01 / ST-03 / ST-04 / ST-06 owners | Provides finalized API contracts consumed by ST-11 |
| QA | Prosperna QA Team | Validates all screen changes, route guard logic, and component behavior |
| Merchant Success | Prosperna Support Team | Informed of new merchant UI flows for support readiness before launch |
| Design | Prosperna Design Team | Reviews new components (Trial Banner, Suspended Lock Screen, Usage Widget, Gateway Selector) |

---

## Personas

**Persona 1 — New Trial Merchant (US)**
Signed up post-restructuring. Enters on a 14-day trial, uses the full dashboard during the trial period, and encounters countdown banners and milestone conversion prompts. Stripe is auto-selected as the default payment gateway.

**Persona 2 — Trial Merchant Who Did Not Convert**
Reached Day 14 without subscribing. On next login, is redirected to the Suspended Lock Screen with the heading "Your trial has ended." Must select a plan and complete payment to regain access.

**Persona 3 — Existing Paid Merchant (PH, Migrated from PRO to Grow)**
Migrated from the PRO plan to Grow at $59/mo. Encounters the updated Billing page with the Grow plan in USD, Xendit as their payment gateway (carried over), and the Usage Dashboard Widget on the Dashboard Home.

**Persona 4 — Suspended Merchant (Payment Failed)**
A Grow plan merchant whose subscription renewal failed and was immediately suspended. On login, is redirected to the Suspended Lock Screen with the heading "Your subscription payment failed." Cannot access orders, products, or any dashboard section.

**Persona 5 — Migrated Free Plan Merchant**
A legacy FREE plan merchant suspended at migration. Encounters the lock screen with the heading "The Free Plan has been retired" and must select a paid plan to continue.

---

## Business Value

| Benefit | Detail |
|---|---|
| Trial-to-paid conversion uplift | Structured countdown banner and Day 5 / 7 / 12 / 13 prompts create an urgency-driven funnel from trial to paid subscription |
| Reduced merchant confusion | Consistent plan names, USD pricing, and updated feature descriptions eliminate discrepancies between the billing page and actual account state |
| Global expansion readiness | USD pricing and Stripe gateway support remove barriers for international merchants who cannot or prefer not to use Xendit |
| Cleaner monetization model | Usage-limit-based differentiation replaces convenience fee tiers, which is simpler to communicate, easier to support, and more scalable |
| Clear suspended account recovery | A focused, no-distraction lock screen removes ambiguity about what a suspended merchant must do to restore access, reducing time-to-reactivation |
| Proactive usage awareness | The Usage Dashboard Widget surfaces limit proximity before merchants hit caps, enabling plan upgrades before enforcement kicks in and reducing reactive support tickets |

---

## Scope

### In Scope

- Billing / Pricing Page (`/home/billing`) — major overhaul with new plan cards, USD pricing, usage limits, gateway selector, and trial banner
- Plan Selection / Comparison Component — reusable component used on billing page, suspended lock screen, and trial CTA modal
- Suspended Lock Screen (`/suspended`) — new full-screen paywall with contextual headings and plan selection
- Trial Countdown Banner — persistent component rendered in the dashboard layout for TRIAL merchants
- In-App Trial Conversion Prompts — Day 5, 7, 12, 13 milestone prompts
- Payment Gateway Selector — Stripe / Xendit radio group with auto-selection by market country
- ChangePlanModal — updated plan names, USD pricing, downgrade limit warnings, gateway selector
- UpgradeModal — updated plan name messaging, suppressed for TRIAL merchants
- CancelPlanModal — updated to reference period-end behavior, no "revert to Free" messaging
- Payment Success Page (`/home/payment-success`) — updated plan names, USD, gateway, reactivation message
- Payment Failed Page (`/home/payment-failed`) — updated plan names, USD, switch-gateway option
- Expired Invoice / eWallet Payment Failed Page (`/home/ewallet-payment-failed`) — updated plan names, USD
- Onboarding Flow (all `/dashboard/*-onboarding` routes) — trial context messaging
- Onboarding Survey (`/onboarding-survey`) and AI Onboarding Chat (`/ai-onboarding/chat`) — trial context messaging
- Dashboard Home (`/home`) — Setup Guide updated, trial prompts, Usage Dashboard Widget added
- Store Settings and MyPay — ConvenienceFeeSplitter component removed
- Frontend route guard logic — SUSPENDED redirect, TRIAL banner render, legacy plan failsafe
- `prosperna1/src/constants/plans.js` — PLAN_UPGRADE_LIST updated
- `prosperna1/src/utils/userUtil.js` — update `isOnPaidPlan()`, remove `GetConveniencePercentPerPlan()`, add `isOnTrial()`, `isSuspended()`, `getTrialDaysRemaining()`, `getPlanDisplayName()`

### Out of Scope

All items listed under Non-Goals above.

---

## Assumptions

1. ST-01, ST-02, ST-03, ST-04, and ST-06 will be deployed simultaneously with ST-11 — no feature flags or phased enablement are required.
2. The `payPlanType` field on the store document is the authoritative source of plan state for all frontend routing and rendering decisions.
3. `merchant_trial_info` (including `trial_end_date` and `onboarding_steps_completed`) is available on the store or merchant API response whenever `payPlanType === 'TRIAL'`.
4. `suspendedReason` is available on the store document whenever `payPlanType === 'SUSPENDED'`, with the values: `trial_expired`, `cancelled`, `payment_failed`, `migration`.
5. The available payment gateways list is returned by the ST-01 subscription API — the frontend does not hardcode the list, though Stripe and Xendit are the known values at launch.
6. Legacy plan types (FREE, PLUS, PRO, PREMIUM, PREMIUM_TRIAL) will not occur for active sessions post-migration. If encountered, the frontend treats them as SUSPENDED as a failsafe.
7. Dismissal state for in-app trial conversion prompts is persisted backend-side (via `merchant_trial_info` or a separate flag) — the frontend does not manage this via localStorage alone.
8. The Usage Dashboard Widget data refresh interval is decided by the ST-06 API caching policy — the widget fetches on page load only (no polling).
9. Promo code auto-apply for the migrated Free Plan merchant scenario is handled by ST-10 and is out of scope for ST-11 UI work.

---

## Dependencies

| Dependency | What ST-11 Needs | Notes |
|---|---|---|
| ST-01 (Payment Abstraction Layer) | Subscription creation API, upgrade/downgrade API, cancel subscription API, available gateways endpoint | API contracts must be finalized before ST-11 begins integration |
| ST-02 (Convenience Fee Removal) | Backend confirmation that convenience fee is zeroed at the data layer | ST-11 removes the UI; backend must be deployed simultaneously to avoid a UI-exists-but-backend-ignores-it state |
| ST-03 (14-Day Trial System) | `payPlanType === 'TRIAL'` on store, `merchant_trial_info.trial_end_date`, `merchant_trial_info.onboarding_steps_completed` | Backend deployed before or simultaneously with ST-11 |
| ST-04 (Suspended Account State) | `payPlanType === 'SUSPENDED'` on store, `suspendedReason` field | Backend deployed before or simultaneously with ST-11 |
| ST-06 (Usage Limits) | `GET /api/v1/usage` response with orders, bandwidth, and storage counts and limits | API contract must be finalized for Usage Dashboard Widget integration |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| One or more dependent subtask APIs not ready at rollout | Medium | High | Coordinate simultaneous deployment; ST-11 implements graceful loading and error states so widgets and banners degrade without crashing the page |
| Legacy plan type encountered post-migration | Low | Medium | Route guard treats all legacy plan types as SUSPENDED — merchant is redirected to the lock screen rather than seeing stale or broken plan data |
| Trial info API unavailable at login | Low | Medium | Trial banner renders a fallback state ("Your trial is active — choose a plan to continue") without days-remaining count |
| Usage API (`GET /api/v1/usage`) unavailable | Low | Low | Usage widget renders a skeleton/error state; the "View Usage Details" link to the ST-06 usage page remains functional |
| Breaking change in ST-01 API contract after ST-11 integration begins | Low | High | Lock API contract (request/response schema) before ST-11 integration starts; validate with contract tests |
| Merchant attempts to access `/suspended` while on a paid plan | Low | Low | Route guard redirects non-suspended merchants away from `/suspended` to `/home` — no content is exposed |

---

## Compliance and Privacy Notes

- Payment data (card numbers, payment credentials, bank details) is handled entirely by Stripe and Xendit hosted payment flows. ST-11 frontend never touches, stores, or transmits payment credentials.
- Subscription API calls from ST-11 pass only plan type, gateway identifier, billing cycle, and optional promo code — no PCI-sensitive data.
- No new personal data is collected by ST-11 UI components beyond what is already present in the merchant's store document.
- GDPR / Data Privacy: No new data collection is introduced by ST-11. Plan selection and promo code data are processed and stored by ST-01 backend.

---

## Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Trial-to-paid conversion rate | Measurable improvement over baseline (pre-restructuring free-to-paid rate) | Backend subscription records: trial start to paid conversion within 14 days |
| Merchant support tickets related to plan or billing confusion | Reduction post-launch compared to pre-launch baseline | Support ticket tagging by category |
| Sessions with legacy `payPlanType` post-migration | 0 | Backend monitoring and alerting on deprecated plan type usage |
| Suspended merchant reactivation rate | Tracked and reported post-launch | Backend: SUSPENDED → paid reactivation within 7 days of suspension |
| Usage widget load error rate | Less than 1% of page loads | Frontend error logging / monitoring |
| Trial banner CLS contribution | CLS ≤ 0.1 per Web Vitals | Lighthouse / field data |
