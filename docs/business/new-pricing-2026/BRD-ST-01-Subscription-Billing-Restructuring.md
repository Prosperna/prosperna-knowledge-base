---
id: st-01-subscription-billing-restructuring
title: BRD. ST-01 Subscription Billing Restructuring
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

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform serving merchants in the United States and the Philippines. Its current subscription billing system has three critical limitations:

1. **Single gateway lock-in.** All subscription billing goes through Xendit, including US merchants who would naturally prefer Stripe or card-based payments. There is no mechanism for merchants to choose a payment method that suits them.

2. **Outdated plan structure and currency.** Plans are priced in Philippine Peso (PHP) with names (Free, Plus, Pro, Premium) that do not reflect the platform's current market positioning. A USD-based, internationally coherent pricing structure is required.

3. **Weak failure handling.** When a subscription payment fails, the merchant's store is silently reverted to the Free Plan and remains live. Stakeholders explicitly require that unpaid subscriptions result in immediate account suspension — there is no Free Plan safety net in the new model.

Additionally, Xendit API calls are scattered throughout the codebase, making it difficult to add new gateways, audit billing behavior, or confidently test the system. A Payment Abstraction Layer is needed to decouple billing logic from gateway-specific implementations.

---

## Goals

1. Replace the four-tier PHP plan structure (Free/Plus/Pro/Premium) with a three-tier USD plan structure (Launch/Grow/Scale) plus a non-paid Trial.
2. Introduce a Payment Abstraction Layer so that Prosperna's billing logic is gateway-agnostic.
3. Make both Stripe and Xendit available to all merchants for subscription billing, with smart defaults based on merchant country.
4. Establish Prosperna's internal database as the single source of truth for subscription status — no runtime dependency on gateway APIs to determine whether a merchant's subscription is active.
5. Enforce immediate account suspension when a subscription renewal payment fails, replacing the current Free Plan fallback.
6. Ensure all subscription transactions are denominated in USD regardless of merchant country or selected gateway.

---

## Non-Goals

- Customer checkout payment flow changes (how customers pay merchants for products) — this is entirely separate from subscription billing.
- Configurable dunning / retry policies — the initial release policy is immediate suspension with no retries. Future enhancement only.
- Additional payment gateways beyond Stripe and Xendit.
- Marketing website pricing page updates.
- Convenience fee removal (handled by ST-02).
- Subscription analytics / reporting dashboards (handled by ST-12).
- Trial system implementation (handled by ST-03 — this subtask provides the billing layer ST-03 calls).
- Suspended state screen implementation (handled by ST-04 — this subtask triggers suspension, ST-04 owns the lock screen).
- Email template creation (handled by ST-14 — this subtask triggers sends, ST-14 owns templates).
- Billing cycle reset vs. carry-over behavior on gateway switch (TBD with stakeholders).

---

## Stakeholders

| Role | Name / Team | Responsibility |
|---|---|---|
| Product Owner | Prosperna Product Team | Final approval on plan structure, pricing, gateway behavior |
| Engineering Lead | Platform Engineering | Architecture and implementation decisions |
| Merchant (External) | Prosperna Merchants | Primary affected user — selects plans, makes payments |
| Prosperna Admin | Admin Control Platform Team | Views and manages merchant subscriptions (ST-12) |
| Finance / Revenue | Prosperna Finance | Pricing confirmation, reconciliation, USD policy |
| Stripe | External | Payment gateway for subscription billing |
| Xendit | External | Payment gateway for subscription billing |

---

## Personas

**Persona 1: US Merchant (New Subscriber)**
A business owner in the United States completing a 14-day trial. Comfortable with credit card payments, expects Stripe as the default. Wants a fast, familiar checkout experience.

**Persona 2: PH Merchant (New Subscriber)**
A business owner in the Philippines completing a 14-day trial. Prefers local payment methods (GCash, Maya) via Xendit. May switch to Stripe if eWallet is unavailable.

**Persona 3: Existing Xendit Subscriber**
A merchant who already has an active Xendit-based subscription. Must migrate to the new plan structure without service interruption.

**Persona 4: Upgrading Merchant**
An active subscriber who wants to move to a higher plan tier mid-cycle. Expects proration and immediate access to upgraded limits.

**Persona 5: Downgrading Merchant**
An active subscriber who wants to move to a lower plan tier. Expects the downgrade to take effect at the end of the current billing period.

---

## Business Value

| Value Driver | Description |
|---|---|
| Revenue clarity | USD pricing eliminates currency conversion confusion and aligns pricing with international SaaS norms |
| Market expansion | Making Stripe available to all merchants (not just Xendit) reduces payment friction for US merchants and globally card-preferring PH merchants |
| Platform resilience | The abstraction layer means Prosperna can add a third gateway in the future with no changes to billing logic |
| Revenue protection | Immediate suspension on payment failure removes the current loophole where failed-payment merchants continue operating on Free Plan indefinitely |
| Developer confidence | Gateway-specific code is fully isolated in adapters — billing logic is testable without gateway API calls |

---

## Scope

### In Scope

- New plan structure: Trial (14-day, Scale-tier access), Launch ($29/mo USD), Grow ($59/mo USD), Scale ($149/mo USD)
- Removal of the permanent Free Plan
- Payment Abstraction Layer: `PaymentGatewayService` interface, `StripePaymentAdapter`, `XenditPaymentAdapter`, `PaymentGatewayFactory`, `UnifiedWebhookHandler`
- Gateway selection UI: Merchant chooses Stripe or Xendit at plan selection, with auto-default by `marketCountry`
- Stripe subscription flow (new): customer creation, subscription creation, hosted or embedded checkout
- Xendit subscription flow (updated): route through adapter, USD pricing, new plan names
- Upgrade flow: prorated charge, immediate effect via current gateway
- Downgrade flow: scheduled for end of billing period, resource handling on downgrade
- Gateway switching flow: cancel on old gateway, create on new gateway, no service interruption
- Payment failure handling: immediate suspension via `suspendMerchant()`, single notification email
- Unified Webhook Handler: idempotent processing of Stripe and Xendit events, internal state machine transitions
- Database schema changes: `plan_subscriptions` and `plan_subscription_invoices` model updates
- Pricing constant updates in `payment-integration-api/src/utils/helper.ts`
- New and modified API endpoints (see Section 7 of context document)
- Billing cycles retained: Monthly (1×), Quarterly (3×), Annual (13 months for price of 12)
- Promo code support: gateway-agnostic discount calculation
- All subscription transactions in USD

### Out of Scope

See Non-Goals above.

---

## Assumptions

| ID | Assumption |
|---|---|
| A-1 | Xendit supports USD invoicing for PH merchants. If not, the team must configure the Xendit account or document a display-only conversion note. This must be resolved before launch. |
| A-2 | Quarterly and Annual USD prices follow the same multiplier logic as current: 3× monthly for quarterly, 12× monthly for annual (13th month free). Final prices: Launch $87/$377, Grow $177/$767, Scale $447/$1,937. Subject to stakeholder confirmation. |
| A-3 | Stripe Smart Retries will be disabled (set to 0 retries) in the Stripe Dashboard before the subscription webhook is live. |
| A-4 | Existing Xendit subscribers will be migrated to the new plan structure as part of ST-16 (Migration). ST-01 does not perform data migration — it only ensures new subscriptions use the new model. |
| A-5 | The `suspendMerchant()` function and its behavior are owned by ST-04. ST-01 only calls it with reason `'payment_failed'`. |
| A-6 | Both Stripe-hosted checkout and embedded Stripe Payment Element are supported by the abstraction layer. The implementation team decides which UX to deliver. |
| A-7 | Billing cycle reset vs. carry-over on gateway switch will be resolved with stakeholders before the gateway switching flow is implemented. |
| A-8 | Stripe Products and Prices for all plan + billing cycle combinations will be created in the Stripe Dashboard by the team before going live. |

---

## Dependencies

| Dependency | Type | Description |
|---|---|---|
| ST-03 (14-Day Trial) | Downstream | Calls the Payment Abstraction Layer for plan selection at trial end |
| ST-04 (Account Suspension) | Downstream | Owns `suspendMerchant()` — ST-01 calls it |
| ST-05 (Cancellation & Retention) | Downstream | Uses abstraction layer for gateway-level subscription cancellation |
| ST-06 (Usage Limits) | Downstream | Uses abstraction layer for upgrade flow and overage invoicing |
| ST-09 (Marketplace Add-Ons) | Downstream | Billing system for paid 3rd-party apps |
| ST-10 (Promo Codes) | Downstream | New plan pricing required for discount calculation |
| ST-11 (Dashboard UI) | Downstream | New plan names, prices, gateway selector |
| ST-12 (Admin Platform) | Downstream | Unified reporting across both gateways |
| ST-14 (Email Templates) | Downstream | Owns templates for payment failure emails triggered by ST-01 |
| ST-16 (Migration) | Downstream | Migrates existing merchants to new plan structure |
| Stripe API | External | Required for `StripePaymentAdapter` |
| Xendit API | External | Required for `XenditPaymentAdapter` |
| `business-profile-api` | Internal | `StorePlanTypes` enum, `changePlan()`, `revertToFreePlan()` replacement |
| `payment-integration-api` | Internal | Primary service where the abstraction layer lives |
| `prosperna1` (Merchant Dashboard) | Internal | Plan selection UI, gateway selector UI |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Xendit does not support USD invoicing for PH merchants | Medium | High | Verify with Xendit account team before development. If unsupported, explore USD-denominated Xendit accounts or add a currency display note. |
| Webhook delivery failure (Stripe or Xendit) leaves subscription in `pending_payment` | Medium | High | Implement webhook retry monitoring and an ops alert when a subscription remains in `pending_payment` beyond a configurable threshold. |
| Stripe Smart Retries not disabled before go-live | Low | High | Include disabling Smart Retries as a pre-launch checklist item. Validate via Stripe Dashboard before flipping the live webhook. |
| Existing Xendit subscribers disrupted during migration | Medium | High | ST-01 does not migrate data — ST-16 is responsible. Ensure ST-16 has a tested rollback plan. |
| Duplicate webhook events trigger duplicate suspensions or activations | Low | Medium | `UnifiedWebhookHandler` implements idempotency via event ID tracking. Cover with integration tests. |
| Proration calculation discrepancy between Stripe and Xendit adapters | Low | Medium | Standardize proration formula at the abstraction layer level. Document the formula. Add unit tests comparing proration results for both adapters. |
| Gateway outage during plan selection | Medium | Low | Show gateway-specific error message. Other gateway remains available. Design the UI to handle gateway unavailability gracefully. |

---

## Compliance and Privacy Notes

- All subscription payment data (card details, wallet tokens) is processed and stored exclusively by Stripe and Xendit — Prosperna does not store raw payment credentials.
- Stripe Customer IDs and Xendit recurring plan IDs stored in Prosperna's DB are reference identifiers only, not payment credentials.
- PCI-DSS compliance is delegated to Stripe and Xendit per their respective agreements.
- Webhook payloads must be validated using gateway-provided signature verification (Stripe webhook signing secret, Xendit callback token) before processing.
- Audit logs of all subscription state transitions and webhook events must be retained for a minimum of 12 months.
- USD-only pricing eliminates the need to handle currency-specific tax regulations at the subscription billing layer.

---

## Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Stripe subscription creation success rate | ≥ 98% | Payment integration API logs |
| Xendit subscription creation success rate | ≥ 97% | Payment integration API logs |
| Webhook processing latency (receipt to state update) | ≤ 30 seconds (p95) | Internal webhook handler telemetry |
| Duplicate webhook events resulting in duplicate state changes | 0 | Idempotency key audit |
| Subscription state accuracy (internal DB vs. gateway) | 100% | Reconciliation job (ST-12) |
| Time to implement new payment gateway adapter | Baseline established for future reference | Architecture review |
| Payment failure suspension triggering correctly | 100% of failure webhooks | QA integration test coverage |
