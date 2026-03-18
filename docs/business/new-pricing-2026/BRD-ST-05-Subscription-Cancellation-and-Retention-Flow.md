---
id: st-05-subscription-cancellation-and-retention-flow
title: BRD. ST-05 Subscription Cancellation and Retention Flow
sidebar_label: ST-05 Subscription Cancellation and Retention Flow
sidebar_position: 5
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft

---

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform. Merchants subscribe to one of three paid plans — Launch ($29/mo), Grow ($59/mo), or Scale ($149/mo) — to power their online stores.

Today, when a merchant cancels their subscription, the system immediately reverts them to the Free Plan via `revertToFreePlan()`. This creates two critical problems:

1. **No retention mechanism.** The platform makes no attempt to understand why a merchant is leaving, nor to present alternatives (downgrade offers, feature tips, usage stats). Every cancellation is treated as a lost cause when many could be saved.

2. **The Free Plan is being removed.** As part of the Prosperna Pricing Restructuring initiative, the Free Plan no longer exists. The `revertToFreePlan()` function must be replaced entirely. After the restructuring, a cancelled subscription means the merchant's account will eventually enter the Suspended state — their store goes offline. This is a significant change in behavior that requires a clear, fair, and well-communicated cancellation experience.

Additionally, there is currently no formal downgrade flow. Merchants who want to move to a lower-tier plan have no structured path — they must cancel and re-subscribe, which is disruptive and contributes to unnecessary churn.

---

## Goals

1. **Retain merchants who can be saved.** Present a targeted retention flow (reason selection → counter-offer) before processing any cancellation.
2. **Make cancellation fair and transparent.** Merchants should retain full access until their billing period ends — not lose their store on the day they cancel.
3. **Allow cancellation to be reversed.** Merchants who change their mind can void their pending cancellation at any point before the billing period ends.
4. **Provide a formal downgrade path.** Replace the informal "cancel and re-subscribe at a lower plan" pattern with a structured, scheduled downgrade flow.
5. **Capture cancellation analytics.** Record cancellation reasons, counter-offer acceptance rates, and resubscription rates to inform product and pricing decisions.
6. **Ensure correct system state transitions.** Replace `revertToFreePlan()` with `cancelPlan()` that schedules suspension via the ST-04 Suspended Account State infrastructure.

---

## Non-Goals

- **Pause subscription.** The "Not using it enough" counter-offer mentions the concept of a pause, but no pause mechanism is built in this subtask.
- **Prorated refunds.** Merchants keep access to the end of their billing period — no partial refunds on cancellation.
- **Post-cancellation survey via email.** The cancellation reason is captured in the flow itself. A separate email survey is deferred.
- **Predictive churn prevention (AI/ML).** Proactive outreach to at-risk merchants is a future initiative.
- **Automatic downgrade suggestions based on usage.** The current approach is reactive (offer shown during cancellation only).
- **Win-back email content.** Win-back emails (T+7, T+30 after suspension) are owned by ST-08.
- **Bulk cancellation.** Cancellation is always merchant-initiated. Admin-initiated bulk cancellation is not in scope.
- **Free Plan merchant migration cancellation (ST-16).** Existing Free Plan merchants migrated on Migration Day go through a bulk suspension path, not this cancellation flow.

---

## Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| **Merchants** | Primary users | Clear, fair, and reversible cancellation experience |
| **Prosperna Product Team** | Feature owner | Reduce churn, increase retention counter-offer acceptance |
| **Prosperna Finance** | Business stakeholder | Ensure gateway cancellations are synchronized correctly |
| **Prosperna Engineering** | Delivery team | Replace `revertToFreePlan()` correctly, integrate with ST-01 and ST-04 |
| **Prosperna Admins** | Internal platform operators | View cancellation analytics, perform manual overrides |
| **ST-12 Admin Platform Team** | Downstream consumer | Receives cancellation analytics data for admin dashboards |
| **ST-14 Email Templates Team** | Downstream consumer | Email triggers from this feature |
| **ST-15 Background Jobs Team** | Downstream consumer | `cancellation-processor` job definition |

---

## Personas

| Persona | Description |
|---|---|
| **Active Paid Merchant** | A merchant on Launch, Grow, or Scale who is considering cancellation or a plan downgrade. This is the primary persona for this feature. |
| **Pending-Cancellation Merchant** | A merchant who has confirmed cancellation but whose billing period has not yet ended. Full dashboard access, persistent cancellation banner visible. |
| **Prosperna Admin** | An internal operator who monitors cancellation analytics and can manually override cancellation states on individual merchant accounts. |

---

## Business Value

| Value Driver | Description |
|---|---|
| **Churn reduction** | The retention flow (reason + counter-offer) is a proven SaaS pattern used by Shopify, Netflix, and Spotify. A >20% counter-offer acceptance rate is the initial target. |
| **Higher lifetime value** | Merchants who downgrade (rather than cancel) continue generating subscription revenue at a lower tier. |
| **Product intelligence** | Cancellation reason data directly informs the product roadmap, pricing decisions, and support priorities. |
| **Compliance with new pricing structure** | Without this subtask, the platform has no legal or functional path to handle cancellations once the Free Plan is removed. This is a mandatory blocker for the pricing restructuring initiative. |
| **Merchant trust** | A transparent "keep your access until [date]" approach is standard SaaS practice and reduces negative support interactions. |

---

## Scope

### In Scope

- **Cancellation flow UI:** Multi-step modal — reason selection → conditional counter-offer → confirmation.
- **Cancellation scheduling:** Cancellation is scheduled for the end of the billing period, not immediate.
- **Pending cancellation state:** Persistent banner on all dashboard pages; billing page badge and resubscribe button.
- **Resubscription (void cancellation):** Merchant can reverse cancellation at any time before the billing period ends.
- **Voluntary downgrade flow:** Formal UI for scheduling a plan tier change to the end of the billing period.
- **Excess resource handling on downgrade:** Products hidden, storage upload blocked, admin users archived, locations handled.
- **cancellation-processor background job:** Daily job that detects elapsed effective dates and calls `suspendMerchant()`.
- **Payment gateway synchronization:** Cancel and reactivate via Payment Abstraction Layer (ST-01); Stripe `cancel_at_period_end`, Xendit deactivation.
- **Email notifications:** Cancellation confirmed, post-cancellation suspended, downgrade confirmed.
- **Cancellation analytics capture:** Reason, counter-offer shown/accepted, resubscription flag.
- **Admin platform data:** Cancellation analytics view and per-merchant cancellation status in account detail.
- **`cancelPlan()` service function:** Replaces `revertToFreePlan()` entirely.

### Out of Scope

- Pause subscription mechanism
- Prorated refunds
- Post-cancellation email survey
- Predictive churn detection (AI/ML)
- Automatic usage-based downgrade suggestions
- Win-back email content and templates (ST-08)
- Bulk admin-initiated cancellation
- Free Plan merchant migration on Migration Day (ST-16)

---

## Assumptions

1. ST-04 (Suspended Account State) is delivered and the `suspendMerchant(store_id, reason)` function is available when this subtask is deployed.
2. ST-01 (Payment Abstraction Layer) is delivered and `PaymentGatewayService.cancelSubscription()` and `PaymentGatewayService.reactivateSubscription()` are available.
3. Xendit supports a `cancel_at_period_end` equivalent, or the payment team will clarify whether immediate deactivation is acceptable for Xendit.
4. The `billing_period_end_date` is reliably accessible for each merchant's current subscription record.
5. The new plan tiers (Launch, Grow, Scale) and their limits (SKUs, storage, admin users, locations) are defined and accessible from the subscription service before this subtask is deployed.
6. The Free Plan is removed before or simultaneously with this subtask going live.
7. Feature request data from the "Missing features" counter-offer will be routed to a product team-defined destination (database collection, Slack notification, or ClickUp). The exact destination is an open question.

---

## Dependencies

| Dependency | Type | What It Provides |
|---|---|---|
| **ST-04: Suspended Account State** | Hard dependency (upstream) | `suspendMerchant(store_id, reason)` function; Suspended state UX |
| **ST-01: Payment Abstraction Layer** | Hard dependency (upstream) | `PaymentGatewayService.cancelSubscription()`, `reactivateSubscription()`; Stripe and Xendit adapters |
| **ST-12: Admin Platform Updates** | Soft dependency (downstream) | Consumes cancellation analytics data |
| **ST-14: Email Templates** | Soft dependency (downstream) | Implements email templates triggered by this subtask |
| **ST-15: Background Jobs** | Soft dependency (downstream) | Registers the `cancellation-processor` job |
| **ST-08: Win-back Emails** | Soft dependency (downstream) | Win-back email sequences triggered by the suspension event this subtask initiates |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Xendit does not support `cancel_at_period_end`** | Medium | High | Design the Xendit adapter to schedule deactivation as a job, or deactivate immediately and record access end date independently. Coordinate with payment team early. |
| **cancellation-processor fails silently for some merchants** | Low | High | Log all failures. Alert ops if failure count exceeds threshold (>5 per run). Job must be idempotent — safe to re-run. |
| **Merchant cancels on the exact day billing period ends** | Medium | Medium | The `effective_date` is set to the billing period end. If the job has already run that morning, the next renewal may have charged. In this case, the cancellation applies to the new period — merchant gets one full additional period of access. This is acceptable and must be communicated clearly. |
| **Simultaneous cancel + upgrade attempt** | Low | Medium | Upgrade should automatically void a pending cancellation. The upgrade flow must check for and clear a pending cancellation record on the same transaction. |
| **Gateway and internal state diverge** | Low | High | Cancellation and reactivation calls to the gateway must be atomic with internal DB updates. On failure, internal state rolls back. Alert and log on any divergence. |
| **Excess resource handling on downgrade causes data loss** | Low | Critical | Products are HIDDEN, not deleted. Storage is BLOCKED (no new uploads), not purged. Admin users are ARCHIVED, not deleted. Downgrade confirmation modal must clearly warn the merchant before they confirm. |

---

## Compliance and Privacy Notes

- **Cancellation reason data** is business-sensitive merchant data. It must be stored in the `subscription_cancellations` collection and accessible only to authorized internal roles.
- **Free-text "Other" reason and feature request text** may contain sensitive business information from merchants. Do not expose these in analytics dashboards unless redacted or summarized.
- **Data retention:** Per ST-04 policy, all merchant data (including cancelled/suspended accounts) is preserved indefinitely. There is no automatic data deletion on cancellation.
- **Payment data:** No payment method data is stored by this subtask. All payment interactions go through the Payment Abstraction Layer (ST-01).

---

## Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| **Voluntary Cancellation Rate** | <5% monthly | Cancellations / total active paid merchants per month |
| **Counter-Offer Acceptance Rate** | >20% | Merchants who accepted a counter-offer / merchants shown a counter-offer |
| **Resubscription Rate (during pending period)** | >10% | Merchants who voided cancellation / total confirmed cancellations |
| **Reactivation Rate (30-day post-suspension)** | >15% | Suspended merchants who reactivated within 30 days / total suspended from cancellation |
| **Top Cancellation Reason** | Tracked, no target | Most common reason — informs product and pricing decisions |
| **Feature Request Volume from Cancellation** | Tracked, no target | Feature requests submitted via the "Missing features" counter-offer |
