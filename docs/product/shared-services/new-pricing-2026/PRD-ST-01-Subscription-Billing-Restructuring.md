---
id: st-01-subscription-billing-restructuring
title: PRD. ST-01 Subscription Billing Restructuring
sidebar_label: ST-01 Subscription Billing Restructuring
sidebar_position: 1
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft
- Related Context: `my-tasks/subscription-restructuring/ST-01-context-document.md`

---

## Summary

ST-01 restructures Prosperna's subscription billing system from a single-gateway (Xendit-only), PHP-denominated system into a gateway-agnostic, USD-denominated platform billing foundation. The key deliverables are:

1. A **Payment Abstraction Layer** — a `PaymentGatewayService` interface with Stripe and Xendit adapters, a factory, and a unified webhook handler.
2. **New plan structure** — Trial, Launch ($29/mo), Grow ($59/mo), Scale ($149/mo) in USD. The Free Plan is removed.
3. **Dual-gateway support** — Stripe and Xendit are both available to all merchants. Gateway is auto-defaulted by `marketCountry` but can be overridden.
4. **Prosperna DB as single source of truth** — subscription status is never read from the gateway at runtime.
5. **Immediate suspension on payment failure** — no grace period, no retry, no Free Plan fallback.

---

## User Journey

### Happy Path

**New merchant — first-time plan selection (Stripe example)**

1. Merchant completes 14-day trial (or trial expires). Account is suspended.
2. Merchant logs in → sees suspended/trial-ended lock screen with plan selection CTA.
3. Merchant views Plan Comparison Page: Launch ($29/mo), Grow ($59/mo), Scale ($149/mo).
4. Merchant selects billing cycle (Monthly / Quarterly / Annual). Prices update dynamically.
5. Merchant clicks "Select" on chosen plan → Payment Gateway Selector appears.
6. Gateway is pre-selected based on `marketCountry` (US → Stripe, PH → Xendit). Merchant can override.
7. Merchant completes payment on selected gateway's UI (Stripe checkout or Xendit invoice/eWallet).
8. Gateway fires success webhook → `UnifiedWebhookHandler` processes → internal subscription state set to `active` → `payPlanType` updated → account unlocked.
9. Merchant sees Payment Success page: plan name, price, billing cycle, next renewal date, "Go to Dashboard" CTA.
10. Confirmation email sent (handled by ST-14).

**Renewal (background, no merchant action)**

1. Billing period ends.
2. Gateway automatically charges the merchant (Stripe subscription auto-renews; Xendit recurring plan fires).
3. Success webhook → `UnifiedWebhookHandler` → subscription stays `active` → billing period extended.

### Alternate and Failure Paths

**Upgrade mid-cycle**
1. Merchant navigates to Billing → clicks "Upgrade" on a higher plan.
2. System calculates prorated charge: `(new_monthly_price - current_monthly_price) × (days_remaining / days_in_period)`.
3. Payment collected via current gateway through the abstraction layer.
4. On success: internal subscription updated, `payPlanType` updated, new limits take effect immediately.

**Downgrade**
1. Merchant selects a lower plan.
2. System records the pending downgrade. Merchant keeps current plan access.
3. At end of current billing period: new lower-tier plan and limits take effect.
4. Excess resources handled: excess products hidden (not deleted), excess storage blocked for new uploads, excess admin users archived, excess locations handled per existing logic.

**Gateway switch**
1. Merchant goes to Billing Settings → "Change Payment Gateway".
2. System calls `XenditPaymentAdapter.cancelSubscription()` on old subscription.
3. System calls `StripePaymentAdapter.createSubscription()` on new gateway.
4. Internal subscription record updated: new `payment_gateway`, new `gateway_subscription_ref`.
5. No service interruption. Billing cycle reset/carry-over behavior TBD with stakeholders.

**Initial payment failure (not a renewal)**
1. Merchant attempts plan selection → payment is declined.
2. Payment Failure Page shown: "Payment could not be processed", "Try Again" CTA, "Choose a Different Payment Method" link.
3. No suspension triggered (suspension is only for renewal failures).
4. Merchant can retry with the same or different gateway.

**Renewal payment failure → Immediate Suspension**
1. Gateway fires `invoice.payment_failed` (Stripe) or payment failure callback (Xendit).
2. `UnifiedWebhookHandler` calls `suspendMerchant(merchantId, 'payment_failed')`.
3. Store goes offline immediately. Merchant's dashboard locked.
4. Single email sent: "Your subscription payment failed. Your store is now offline. Please update your payment method and select a plan to restore your store."
5. Merchant logs in → sees suspended lock screen → selects plan → pays → reactivated.

**Promo code applied**
1. Merchant arrives at plan selection with a promo code (auto-applied or manually entered).
2. Discounted price calculated at Prosperna level: `discounted_amount = base_price × (1 - discount_rate)`.
3. Discounted amount passed to gateway. Promo code tracked on subscription record.
4. First N invoices at discounted price; subsequent invoices at full price.

**Gateway outage during plan selection**
1. Gateway is temporarily unavailable.
2. System shows: "This payment method is temporarily unavailable. Please try another option."
3. Alternative gateway remains available and functional.

---

## Functional Requirements

**FR-1 — New Plan Structure**
The system must support four plan states: Trial (14-day, Scale-tier access, no payment required), Launch ($29/mo USD), Grow ($59/mo USD), Scale ($149/mo USD). The legacy Free Plan, Plus, Pro, and Premium plans must be removed from the plan selection flow. Legacy plan type values must be retained in the database model for backward compatibility with existing records only.

**FR-2 — USD Pricing**
All subscription plan prices, invoices, and gateway charges must be denominated in USD regardless of merchant country or selected gateway. The pricing constants in `payment-integration-api/src/utils/helper.ts` must be updated to: `p1PlanMonthlyPricing: { LAUNCH: 29, GROW: 59, SCALE: 149 }`, with quarterly and annual tables as specified.

**FR-3 — Payment Abstraction Layer**
The system must implement a `PaymentGatewayService` interface with the following methods: `createSubscription()`, `cancelSubscription()`, `upgradeSubscription()`, `downgradeSubscription()`, `handleWebhook()`, `retryPayment()`, `getPaymentMethods()`. All return types must be Prosperna-internal types, not gateway-specific objects.

**FR-4 — StripePaymentAdapter**
The system must implement `StripePaymentAdapter` as a concrete implementation of `PaymentGatewayService` that translates Prosperna billing method calls to Stripe API calls: `stripe.customers.create()`, `stripe.subscriptions.create()`, `stripe.subscriptions.update()` (for upgrade/downgrade/cancel), and `stripe.subscriptions.cancel()`.

**FR-5 — XenditPaymentAdapter**
The system must implement `XenditPaymentAdapter` as a concrete implementation of `PaymentGatewayService` that translates Prosperna billing method calls to Xendit API calls using USD pricing and new plan names (LAUNCH, GROW, SCALE).

**FR-6 — PaymentGatewayFactory**
The system must implement `PaymentGatewayFactory` with `getAdapter(gateway: 'STRIPE' | 'XENDIT')` and `getAdapterForMerchant(merchantId)` methods. All billing logic must use the factory to obtain a gateway adapter — no billing logic may call Stripe or Xendit APIs directly.

**FR-7 — UnifiedWebhookHandler**
The system must implement `UnifiedWebhookHandler` that processes webhook events from both Stripe and Xendit and maps them to internal subscription state transitions: payment succeeded → `active`, payment failed → `expired` + `suspendMerchant()`, subscription cancelled externally → `cancelled`.

**FR-8 — Webhook Idempotency**
The `UnifiedWebhookHandler` must implement idempotency. Each webhook event ID must be recorded upon processing. If the same event ID is received again, the handler must skip processing without producing any state change or side effect.

**FR-9 — Webhook Signature Verification**
The Stripe webhook endpoint must verify the Stripe-Signature header using the Stripe webhook signing secret. The Xendit webhook endpoint must verify the callback token. Webhooks failing signature verification must be rejected with HTTP 400 and must not trigger any state changes.

**FR-10 — Internal Subscription State**
The system must maintain an `subscription_status` field on the `plan_subscriptions` collection with values: `active`, `pending_payment`, `cancelled`, `expired`. All platform logic (access control, feature gating, plan checks) must read from this internal field only. No runtime queries to Stripe or Xendit APIs to determine subscription status.

**FR-11 — Gateway Selection UI**
The plan selection flow must present a Payment Gateway Selector after the merchant selects a plan. The selector must show both Stripe and Xendit options. The default must be pre-selected based on `marketCountry`: US → Stripe, PH → Xendit, other/unknown → Stripe. The merchant must be able to override the default.

**FR-12 — Gateway Persisted on Subscription**
The merchant's selected gateway must be stored as `payment_gateway` on the `plan_subscriptions` record. All subsequent renewal charges must use the stored `payment_gateway` — it must not be inferred at runtime from `marketCountry`.

**FR-13 — Stripe Subscription Flow**
When a merchant selects Stripe, the system must: (1) create a Stripe Customer if none exists, (2) create a Stripe Subscription with the correct plan price and billing cycle, (3) provide payment UI (hosted checkout or embedded Payment Element), (4) process the `invoice.paid` webhook to activate the subscription.

**FR-14 — Xendit Subscription Flow**
When a merchant selects Xendit, the system must: (1) determine eWallet or credit card path, (2) create the appropriate Xendit invoice or recurring plan with USD pricing and new plan name, (3) redirect merchant to Xendit payment UI, (4) process the success callback to activate the subscription.

**FR-15 — Upgrade Flow**
When a merchant upgrades mid-cycle, the system must calculate a prorated charge for the remaining billing period and collect it via the merchant's current gateway through the abstraction layer. New plan limits must take effect immediately upon payment success. If the merchant was in a usage grace period, overages for the current period must be forgiven.

**FR-16 — Downgrade Flow**
When a merchant selects a lower plan, the downgrade must be recorded and scheduled to take effect at the end of the current billing period. The merchant must retain current-tier access until then. At period end, the lower-tier price must apply for the next cycle, and excess resources must be handled (hidden/blocked/archived — not deleted).

**FR-17 — Gateway Switching**
The system must support gateway switching. When a merchant changes gateway, the system must cancel the existing subscription on the old gateway and create a new subscription on the new gateway. The internal subscription record must be updated with the new `payment_gateway` and `gateway_subscription_ref`. There must be no service interruption.

**FR-18 — Immediate Suspension on Renewal Failure**
When a renewal payment failure webhook is received from either gateway, the system must immediately call `suspendMerchant(merchantId, 'payment_failed')` and send a single payment failure suspension email. No grace period. No retry attempts. Stripe Smart Retries must be disabled. Xendit dunning must be ignored.

**FR-19 — Database Schema: plan_subscriptions**
The `plan_subscriptions` model must be updated to include: `payment_gateway` (String, `'XENDIT' | 'STRIPE'`), `currency` (String, default `'USD'`), `stripe_customer_id` (String, nullable), `stripe_subscription_id` (String, nullable), `subscription_status` (String, enum), `gateway_subscription_ref` (String, nullable). The `plan_type` field must accept new values: `'LAUNCH' | 'GROW' | 'SCALE' | 'TRIAL'`.

**FR-20 — Database Schema: plan_subscription_invoices**
The `plan_subscription_invoices` model must be updated to: change `payment_gateway` from hardcoded `'XENDIT'` to dynamic `'XENDIT' | 'STRIPE'`, add `currency` (default `'USD'`), `stripe_subscription_id` (nullable), `stripe_invoice_id` (nullable).

**FR-21 — New Subscription API Endpoints**
The system must expose: `POST /v1/payments/stripe/subscription-webhook`, `POST /v1/subscriptions/create`, `POST /v1/subscriptions/upgrade`, `POST /v1/subscriptions/downgrade`, `POST /v1/subscriptions/switch-gateway`, `GET /v1/subscriptions/status`.

**FR-22 — Modified Endpoints**
The existing `POST /v1/payments/xendit/subscription-webhook` must be refactored to route through `UnifiedWebhookHandler`. The `GET /v1/merchant/billing` response must return new plan names, USD pricing, current gateway, and `subscription_status`. Plan change endpoints in `business-profile-api` must call the abstraction layer and replace `revertToFreePlan()` with `suspendMerchant()`.

**FR-23 — Billing Cycles**
The system must retain the three billing cycles: Monthly (1× monthly price), Quarterly (3× monthly price), Annual (12× monthly price for 13 months). The `p1ValidBillingTypesMonthCount` constant (`MONTHLY: 1, QUARTERLY: 3, ANNUAL: 13`) must be retained.

**FR-24 — Promo Code Support**
Promo code discounts must be calculated at the Prosperna level and applied before passing the charge amount to the gateway. Promo logic must be gateway-agnostic. The applied promo code must be tracked on the subscription record.

---

## Non-Functional Requirements

**NFR-1 — Webhook Processing Latency**
Subscription status must be updated within 30 seconds of webhook receipt at the p95 percentile under normal operating conditions.

**NFR-2 — Idempotency**
Processing the same webhook event twice must produce zero duplicate state changes, zero duplicate suspensions, and zero duplicate activations.

**NFR-3 — Gateway Isolation**
A failure in one gateway adapter must not affect processing of webhooks or subscription actions for the other gateway.

**NFR-4 — Webhook Security**
All webhook endpoints must reject requests that fail gateway signature verification with HTTP 400. Failure to verify must never result in a subscription state change.

**NFR-5 — Audit Logging**
All subscription state transitions (pending_payment → active, active → expired, etc.) and all webhook events received must be logged with: event ID, gateway type, merchant ID, old state, new state, timestamp. Logs must be retained for a minimum of 12 months.

**NFR-6 — No Gateway Runtime Dependency**
Subscription status checks must never make a live API call to Stripe or Xendit. All status decisions must be made from the internal `subscription_status` field in Prosperna's DB.

**NFR-7 — Backward Compatibility**
The database model changes must preserve all existing records. New fields must be nullable or have appropriate defaults. Legacy plan type values (FREE, PLUS, PRO, PREMIUM, PREMIUM_TRIAL) in existing records must not be corrupted.

**NFR-8 — Stripe Configuration**
Stripe Smart Retries must be configured to 0 retries before the Stripe webhook goes live. Stripe Products and Prices for all plan + billing cycle combinations must exist before the subscription creation endpoint is called.

**NFR-9 — Test Coverage**
All adapter methods must have unit tests with mocked gateway responses. `UnifiedWebhookHandler` must have integration tests covering all event types, idempotency, and failure paths. Proration calculation must have unit tests comparing expected vs. actual for both adapters.

---

## UX Notes

- Plan Comparison Page shows three plan cards side-by-side (Launch, Grow, Scale) with billing cycle selector. Prices update dynamically.
- "Recommended" badge on one plan (logic owned by ST-03 based on trial usage data).
- "Compare Plans" link for detailed feature/limit table.
- Annual billing discount callout ("13th month free").
- Payment Gateway Selector is a section within the payment flow — not a separate page. Shows gateway logos, descriptions, and pre-selects based on `marketCountry`.
- Payment Success Page: plan name, price, billing cycle, next renewal date, "Go to Dashboard" CTA.
- Payment Failure Page (initial selection only): error message, "Try Again" CTA, "Choose a Different Payment Method" link. No suspension for initial failures.
- Gateway unavailability: show inline error message. Do not disable the other gateway.

---

## Data Model Notes

**plan_subscriptions (updated fields)**
```
plan_type: 'LAUNCH' | 'GROW' | 'SCALE' | 'TRIAL' (+ legacy values)
payment_gateway: 'XENDIT' | 'STRIPE'           — new
currency: String (default 'USD')               — new
stripe_customer_id: String | null              — new
stripe_subscription_id: String | null          — new
subscription_status: 'active' | 'pending_payment' | 'cancelled' | 'expired'  — new
gateway_subscription_ref: String | null        — new (generic ref for either gateway)
```

**plan_subscription_invoices (updated fields)**
```
payment_gateway: 'XENDIT' | 'STRIPE'           — changed from hardcoded 'XENDIT'
currency: String (default 'USD')               — new
stripe_subscription_id: String | null          — new
stripe_invoice_id: String | null               — new
```

**Plan Pricing Constants (updated)**
```
p1PlanMonthlyPricing:   { LAUNCH: 29,  GROW: 59,  SCALE: 149  }  (USD)
p1PlanQuarterlyPricing: { LAUNCH: 87,  GROW: 177, SCALE: 447  }  (USD)
p1PlanAnnualPricing:    { LAUNCH: 377, GROW: 767, SCALE: 1937 }  (USD)
p1ValidBillingTypesMonthCount: { MONTHLY: 1, QUARTERLY: 3, ANNUAL: 13 }  (retained)
```

---

## Integrations and APIs

| Integration | Direction | Purpose |
|---|---|---|
| Stripe API | Outbound | Create customers, subscriptions, handle proration, cancel subscriptions |
| Stripe Webhooks | Inbound | `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` |
| Xendit API | Outbound | Create invoices, recurring plans, deactivate recurring plans |
| Xendit Callbacks | Inbound | Payment success callback, payment failure callback |
| `business-profile-api` | Internal | Read/write `payPlanType` on Store document, call `suspendMerchant()` |
| ST-04 `suspendMerchant()` | Internal | Called on renewal payment failure |
| ST-14 Email Service | Internal | Triggered for payment failure suspension email and plan activation confirmation |

---

## Error Handling

| Error Case | Behavior |
|---|---|
| Webhook signature verification fails | Reject with HTTP 400. Log. Do not update subscription state. Alert ops. |
| Webhook arrives but subscription not found | Log warning. Return HTTP 200 to gateway (prevent redelivery storm). Alert ops. |
| Duplicate webhook event | Idempotency check fires. Skip. Return HTTP 200. No state change. |
| Stripe API unavailable during subscription creation | Return error to UI. Show gateway unavailability message. Do not create partial subscription record. |
| Xendit API unavailable during subscription creation | Return error to UI. Show gateway unavailability message. Allow merchant to switch to Stripe. |
| Subscription remains in `pending_payment` beyond threshold | Ops alert. No automatic resolution — merchant must retry. |
| Stripe Smart Retries not disabled | Pre-launch validation required. If a retry succeeds, the second `invoice.paid` webhook is idempotent. If a retry fails, the second `invoice.payment_failed` webhook is idempotent. |
| Promo code applied but gateway charge is wrong amount | Prosperna calculates the discounted amount before passing to gateway. Gateway receives the final charge amount only. |

---

## Telemetry and Analytics

| Event | When Fired | Properties |
|---|---|---|
| `subscription.created` | New subscription created | `merchantId`, `planType`, `billingCycle`, `gateway`, `currency`, `amount` |
| `subscription.activated` | Webhook confirms payment success | `merchantId`, `planType`, `gateway`, `webhookEventId` |
| `subscription.upgraded` | Upgrade payment confirmed | `merchantId`, `fromPlan`, `toPlan`, `proratedAmount`, `gateway` |
| `subscription.downgrade_scheduled` | Downgrade requested | `merchantId`, `fromPlan`, `toPlan`, `effectiveDate` |
| `subscription.downgraded` | Downgrade takes effect at period end | `merchantId`, `fromPlan`, `toPlan` |
| `subscription.payment_failed` | Payment failure webhook received | `merchantId`, `gateway`, `webhookEventId`, `failureReason` |
| `subscription.suspended` | `suspendMerchant()` called due to payment failure | `merchantId`, `reason: 'payment_failed'` |
| `subscription.gateway_switched` | Gateway switch completed | `merchantId`, `fromGateway`, `toGateway` |
| `webhook.received` | Any webhook received | `gateway`, `eventType`, `webhookEventId`, `merchantId` |
| `webhook.duplicate_skipped` | Duplicate webhook detected | `gateway`, `webhookEventId` |
| `webhook.signature_failed` | Webhook signature verification failed | `gateway`, `endpoint` |

---

## Rollout Plan

1. **Pre-development:** Confirm Xendit USD support for PH merchants. Confirm quarterly/annual pricing with stakeholders. Create Stripe Products and Prices in sandbox.
2. **Development Phase 1:** Payment Abstraction Layer (interface, adapters, factory). Unit tests.
3. **Development Phase 2:** UnifiedWebhookHandler with idempotency. Integration tests with both gateway sandbox environments.
4. **Development Phase 3:** Database schema migrations. API endpoint updates. `business-profile-api` changes.
5. **Development Phase 4:** Merchant Dashboard UI — Plan Comparison Page, Payment Gateway Selector, Success/Failure pages.
6. **QA:** Full end-to-end tests in staging: new US merchant via Stripe, new PH merchant via Xendit, upgrade, downgrade, gateway switch, payment failure suspension, duplicate webhook.
7. **Pre-launch checklist:** Disable Stripe Smart Retries. Configure Stripe webhook endpoint. Configure Xendit callback URL. Verify Stripe Products/Prices exist. Run smoke tests.
8. **Launch:** Deploy with feature flag if possible. Monitor `subscription.created`, `subscription.activated`, and `subscription.suspended` events closely for the first 48 hours.
9. **Post-launch:** Coordinate with ST-16 for migration of existing merchants to new plan structure.

---

## Open Questions

| ID | Question | Status |
|---|---|---|
| OQ-1 | Does Xendit support USD invoicing for PH merchants? If not, what is the fallback? | Open — must be resolved before development |
| OQ-2 | What is the exact quarterly and annual pricing in USD? (Current assumption: same multiplier logic as before.) | Open — pending stakeholder confirmation |
| OQ-3 | On gateway switch, does the billing cycle reset or carry over? | Open — TBD with stakeholders |
| OQ-4 | Should the Stripe Payment Element be embedded or hosted? | Open — implementation team decision |
| OQ-5 | What is the ops alert threshold for subscriptions stuck in `pending_payment`? | Open — to be agreed with ops team |

---

# Gherkin User Stories

## Feature: ST-01 Subscription Billing Restructuring

```gherkin
Feature: ST-01 Subscription Billing Restructuring
  As a Prosperna merchant
  I want to subscribe to a plan using my preferred payment gateway
  So that my store remains live and fully functional

  # ─────────────────────────────────────────────────────────────────
  # FR-1, FR-2, FR-11, FR-13  Happy Path — US Merchant via Stripe
  # ─────────────────────────────────────────────────────────────────

  Scenario: US merchant subscribes to Launch plan via Stripe
    Given I am a US merchant with marketCountry "US"
    And my 14-day trial has expired
    And my account is suspended
    When I log in and navigate to the plan selection page
    Then I see three plan cards: Launch at $29/mo, Grow at $59/mo, Scale at $149/mo
    When I select the Launch plan with Monthly billing cycle
    Then a Payment Gateway Selector appears
    And Stripe is pre-selected as the default gateway
    When I complete payment on the Stripe checkout page
    And Stripe fires an invoice.paid webhook
    Then the UnifiedWebhookHandler processes the webhook
    And my internal subscription_status is set to "active"
    And my store payPlanType is set to "LAUNCH"
    And my account is unlocked
    And I see the Payment Success page with my plan details

  # ─────────────────────────────────────────────────────────────────
  # FR-11, FR-14  Happy Path — PH Merchant via Xendit
  # ─────────────────────────────────────────────────────────────────

  Scenario: PH merchant subscribes to Grow plan via Xendit eWallet
    Given I am a PH merchant with marketCountry "PH"
    And I am on a 14-day trial with 4 days remaining
    When I click "Choose a Plan" from the trial banner
    And I select the Grow plan with Monthly billing cycle
    Then a Payment Gateway Selector appears
    And Xendit is pre-selected as the default gateway
    When I complete payment via GCash on the Xendit invoice page
    And Xendit fires a payment success callback
    Then the UnifiedWebhookHandler processes the callback
    And my internal subscription_status is set to "active"
    And my store payPlanType is set to "GROW"
    And my trial ends early and I am now a Grow subscriber

  # ─────────────────────────────────────────────────────────────────
  # FR-11  Gateway Override
  # ─────────────────────────────────────────────────────────────────

  Scenario: PH merchant overrides default gateway and selects Stripe
    Given I am a PH merchant with marketCountry "PH"
    When I reach the Payment Gateway Selector
    Then Xendit is pre-selected
    When I click the Stripe option
    Then Stripe becomes the selected gateway
    And the Xendit payment form is hidden
    And the Stripe payment form is displayed

  # ─────────────────────────────────────────────────────────────────
  # FR-15  Upgrade Flow
  # ─────────────────────────────────────────────────────────────────

  Scenario: Active Launch merchant upgrades to Scale mid-cycle via Stripe
    Given I am a Launch subscriber on Stripe
    And I have 15 days remaining in my monthly billing period
    When I navigate to Billing and click Upgrade on the Scale plan
    Then the system calculates a prorated charge of $60.00
    And I see the prorated amount on the confirmation screen
    When I confirm the upgrade
    And Stripe processes the prorated payment
    And Stripe fires an invoice.paid webhook
    Then my subscription is updated to Scale
    And my payPlanType is set to "SCALE"
    And Scale plan limits take effect immediately

  # ─────────────────────────────────────────────────────────────────
  # FR-16  Downgrade Flow
  # ─────────────────────────────────────────────────────────────────

  Scenario: Scale merchant downgrades to Grow
    Given I am a Scale subscriber
    And I have 10 days remaining in my monthly billing period
    When I navigate to Billing and select the Grow plan as a downgrade
    Then the system records a pending downgrade to Grow
    And I see a message: "Your plan will change to Grow at the end of your current billing period"
    And I continue to have Scale access for the remaining 10 days
    When the billing period ends
    Then my plan changes to Grow
    And Grow limits and pricing take effect for the next billing cycle
    And excess products are hidden from the storefront but not deleted

  # ─────────────────────────────────────────────────────────────────
  # FR-17  Gateway Switching
  # ─────────────────────────────────────────────────────────────────

  Scenario: Merchant switches from Xendit to Stripe
    Given I am a Launch subscriber on Xendit
    When I navigate to Billing Settings and select "Change Payment Gateway"
    And I select Stripe and complete Stripe onboarding
    Then the system calls XenditPaymentAdapter.cancelSubscription()
    And the system calls StripePaymentAdapter.createSubscription()
    And my subscription record is updated with payment_gateway "STRIPE" and new stripe_subscription_id
    And I have no service interruption
    And my next renewal will be charged via Stripe

  # ─────────────────────────────────────────────────────────────────
  # FR-18  Payment Failure — Immediate Suspension
  # ─────────────────────────────────────────────────────────────────

  Scenario: Grow merchant's renewal payment fails — immediate suspension
    Given I am an active Grow subscriber via Stripe
    When my monthly renewal date arrives
    And Stripe attempts to charge $59 but the card is declined
    And Stripe fires an invoice.payment_failed webhook
    Then the UnifiedWebhookHandler calls suspendMerchant(merchantId, "payment_failed")
    And my store goes offline immediately
    And my subscription_status is set to "expired"
    And I receive a single payment failure suspension email
    And there is no grace period and no retry attempt

  Scenario: Merchant reactivates after payment failure
    Given my account is suspended due to a failed renewal payment
    When I log in and see the suspended lock screen
    And I update my payment method
    And I select the Grow plan again and complete payment
    And the payment success webhook is processed
    Then my subscription_status is set to "active"
    And my store goes online

  # ─────────────────────────────────────────────────────────────────
  # FR-8  Webhook Idempotency
  # ─────────────────────────────────────────────────────────────────

  Scenario: Duplicate Stripe webhook event is safely ignored
    Given Stripe fires an invoice.paid webhook with eventId "evt_abc123"
    And the UnifiedWebhookHandler has already processed eventId "evt_abc123"
    When the same webhook is delivered a second time
    Then the handler detects the duplicate via the idempotency check
    And no subscription state change occurs
    And no duplicate activation or suspension is triggered
    And the handler returns HTTP 200 to Stripe

  # ─────────────────────────────────────────────────────────────────
  # FR-9  Webhook Signature Failure
  # ─────────────────────────────────────────────────────────────────

  Scenario: Webhook with invalid Stripe signature is rejected
    Given a POST request arrives at /v1/payments/stripe/subscription-webhook
    And the Stripe-Signature header does not match the signing secret
    Then the endpoint rejects the request with HTTP 400
    And no subscription state change occurs
    And the event is logged as a signature verification failure

  # ─────────────────────────────────────────────────────────────────
  # FR-11, FR-12  Gateway Persisted on Subscription
  # ─────────────────────────────────────────────────────────────────

  Scenario: PH merchant's subscription renews via Stripe after initial selection
    Given I am a PH merchant who selected Stripe at subscription creation
    And my subscription record has payment_gateway "STRIPE"
    When my monthly renewal date arrives
    Then the system uses payment_gateway "STRIPE" from the subscription record
    And does not re-derive the gateway from my marketCountry "PH"
    And the renewal charge is processed via Stripe

  # ─────────────────────────────────────────────────────────────────
  # FR-18  No Suspension for Initial Payment Failure
  # ─────────────────────────────────────────────────────────────────

  Scenario: Initial plan selection payment fails — no suspension
    Given I am a merchant selecting a plan for the first time
    When I complete the payment form and the payment is declined
    Then I see the Payment Failure page with "Payment could not be processed"
    And I see a "Try Again" button and a "Choose a Different Payment Method" link
    And my account is NOT suspended
    And no subscription record is created

  # ─────────────────────────────────────────────────────────────────
  # FR-24  Promo Code Applied
  # ─────────────────────────────────────────────────────────────────

  Scenario Outline: Promo code discounts are gateway-agnostic
    Given I am a merchant with a promo code for <discount>% off
    When I select the Launch plan at $29/mo
    Then the system calculates the discounted amount as $<discounted_price>
    And the gateway is charged $<discounted_price> regardless of whether I select Stripe or Xendit
    And the promo code is stored on the subscription record

    Examples:
      | discount | discounted_price |
      | 50       | 14.50            |
      | 20       | 23.20            |
      | 10       | 26.10            |

  # ─────────────────────────────────────────────────────────────────
  # FR-3, FR-6  Payment Abstraction Layer — Factory Returns Correct Adapter
  # ─────────────────────────────────────────────────────────────────

  Scenario Outline: PaymentGatewayFactory returns the correct adapter
    Given a billing action is requested for a merchant with payment_gateway "<gateway>"
    When PaymentGatewayFactory.getAdapter("<gateway>") is called
    Then the returned adapter is an instance of <expected_adapter>

    Examples:
      | gateway | expected_adapter       |
      | STRIPE  | StripePaymentAdapter   |
      | XENDIT  | XenditPaymentAdapter   |

  # ─────────────────────────────────────────────────────────────────
  # FR-21, FR-10  GET /v1/subscriptions/status reads internal state only
  # ─────────────────────────────────────────────────────────────────

  Scenario: Subscription status endpoint reads from internal DB, not gateway
    Given I am an active Scale subscriber
    When I call GET /v1/subscriptions/status
    Then the response contains subscription_status "active" from the internal DB
    And no API call is made to Stripe or Xendit

  # ─────────────────────────────────────────────────────────────────
  # Edge Case — Gateway Outage During Plan Selection
  # ─────────────────────────────────────────────────────────────────

  Scenario: Selected gateway is unavailable during plan selection
    Given Stripe is temporarily unavailable
    And I have selected Stripe as my payment gateway
    When I attempt to proceed to payment
    Then I see: "This payment method is temporarily unavailable. Please try another option."
    And the Xendit option remains available and functional
    And no partial subscription record is created

  # ─────────────────────────────────────────────────────────────────
  # Edge Case — Webhook Arrives Before Merchant Redirected Back
  # ─────────────────────────────────────────────────────────────────

  Scenario: Webhook activates subscription before merchant returns to success page
    Given I have completed payment on Stripe's hosted checkout page
    And I have not yet been redirected back to Prosperna
    When Stripe fires invoice.paid before my browser redirect
    Then the UnifiedWebhookHandler processes the webhook and sets subscription_status to "active"
    When I am redirected back to Prosperna
    Then the success page checks the current subscription_status
    And displays the Payment Success page correctly

  # ─────────────────────────────────────────────────────────────────
  # Edge Case — Merchant Already on a Plan Tries to Select New Plan
  # ─────────────────────────────────────────────────────────────────

  Scenario: Active merchant navigates to plan selection — shown upgrade/downgrade flow
    Given I am an active Grow subscriber
    When I navigate to the plan selection page
    Then I am shown the upgrade/downgrade flow
    And I am not shown the new subscription creation flow
```

---

# Traceability Map

| FR | Scenario(s) |
|---|---|
| FR-1 (New Plan Structure) | US merchant subscribes to Launch plan via Stripe; PH merchant subscribes to Grow plan via Xendit |
| FR-2 (USD Pricing) | US merchant subscribes to Launch plan via Stripe; Promo code Scenario Outline |
| FR-3 (Payment Abstraction Layer) | PaymentGatewayFactory returns the correct adapter |
| FR-4 (StripePaymentAdapter) | US merchant subscribes to Launch plan via Stripe; Active Launch merchant upgrades to Scale mid-cycle |
| FR-5 (XenditPaymentAdapter) | PH merchant subscribes to Grow plan via Xendit eWallet |
| FR-6 (PaymentGatewayFactory) | PaymentGatewayFactory returns the correct adapter |
| FR-7 (UnifiedWebhookHandler) | US merchant subscribes to Launch plan via Stripe; Grow merchant's renewal payment fails |
| FR-8 (Webhook Idempotency) | Duplicate Stripe webhook event is safely ignored |
| FR-9 (Webhook Signature Verification) | Webhook with invalid Stripe signature is rejected |
| FR-10 (Internal Subscription State) | GET /v1/subscriptions/status reads from internal DB; Grow merchant's renewal payment fails |
| FR-11 (Gateway Selection UI) | US merchant subscribes to Launch plan via Stripe; PH merchant overrides default gateway |
| FR-12 (Gateway Persisted on Subscription) | PH merchant's subscription renews via Stripe after initial selection |
| FR-13 (Stripe Subscription Flow) | US merchant subscribes to Launch plan via Stripe |
| FR-14 (Xendit Subscription Flow) | PH merchant subscribes to Grow plan via Xendit eWallet |
| FR-15 (Upgrade Flow) | Active Launch merchant upgrades to Scale mid-cycle via Stripe |
| FR-16 (Downgrade Flow) | Scale merchant downgrades to Grow |
| FR-17 (Gateway Switching) | Merchant switches from Xendit to Stripe |
| FR-18 (Immediate Suspension on Renewal Failure) | Grow merchant's renewal payment fails; No suspension for initial payment failure |
| FR-19 (DB Schema: plan_subscriptions) | PH merchant's subscription renews via Stripe (gateway stored on record); Grow merchant's renewal payment fails (subscription_status field) |
| FR-20 (DB Schema: plan_subscription_invoices) | US merchant subscribes to Launch plan via Stripe (invoice created with STRIPE gateway) |
| FR-21 (New API Endpoints) | GET /v1/subscriptions/status reads from internal DB |
| FR-22 (Modified Endpoints) | PH merchant's subscription renews via Stripe; Grow merchant's renewal payment fails |
| FR-23 (Billing Cycles) | US merchant subscribes to Launch plan via Stripe (Monthly cycle) |
| FR-24 (Promo Code Support) | Promo code discounts are gateway-agnostic |
