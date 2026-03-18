---
id: st-06-usage-limits-enforcement-system
title: BRD. ST-06 Usage Limits & Enforcement System
sidebar_label: ST-06 Usage Limits & Enforcement System
sidebar_position: 6
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-18
- Status: Draft
- Feature Slug: usage-limits-enforcement
- Parent Initiative: Prosperna Pricing Restructuring (v3)
- Subtask ID: ST-06

---

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform transitioning from a transaction-fee revenue model to a flat-rate subscription model. Under the old model, convenience fees (a percentage of every order) scaled automatically with merchant growth, protecting infrastructure costs. Under the new model (v3 pricing restructuring), Prosperna charges $0 in transaction fees — "Bring Your Own Payment Gateway" — and relies entirely on tiered plan subscriptions ($29/mo Launch, $59/mo Grow, $149/mo Scale).

Without usage limits, a merchant on a $29/month Launch plan could process $300,000 in annual sales volume, consuming significant server resources (bandwidth, storage, processing), while Prosperna collects only $348/year. This creates a structural revenue gap that threatens the business model's sustainability.

The Usage Limits & Enforcement System closes this gap by introducing resource caps on each plan tier. When merchants grow beyond their plan's capacity, they are nudged — then enforced — to upgrade to a higher tier. This replaces the implicit scaling of the old convenience fee revenue with an explicit plan-based upgrade path.

Today, no usage limits exist on any plan. This feature is entirely new infrastructure.

---

## Goals

1. Protect Prosperna's infrastructure costs by limiting resource consumption per subscription tier.
2. Drive upgrade conversions at natural growth inflection points (80%, 95%, 100% of limits).
3. Celebrate merchant success rather than penalize it — all enforcement communications frame limit hits as growth milestones.
4. Prevent sudden merchant disruption by providing a 4-stage graduated enforcement model with at least 48 hours of notice before service degradation begins.
5. Provide merchants with actionable choices at every stage: upgrade, accept overages, or wait for reset.
6. Provide Prosperna admins with monitoring, override tools, and analytics on enforcement events.

---

## Non-Goals

- This feature does not handle subscription billing, payment method management, or subscription payment failures — those are handled by ST-01 (Payment Abstraction Layer) and ST-04 (Suspended Account State).
- This feature does not manage trial plan setup or trial expiration logic — that is handled by ST-03 (14-Day Trial).
- This feature does not cover enterprise or custom pricing plans beyond the three standard paid tiers.
- This feature does not charge merchants in real time as they consume resources — overages are billed as a lump sum at end of billing period.
- This feature does not apply to the convenience fee calculation (removed in ST-02).

---

## Stakeholders

| Role | Name / Team | Responsibility |
|---|---|---|
| Product Owner | Prosperna Product Team | Define limit values, enforcement thresholds, and overage rates |
| Engineering | Backend Team | Implement metering, enforcement logic, background jobs, APIs |
| Engineering | Frontend Team | Merchant dashboard usage page, enforcement banners, admin dashboard |
| Finance / Billing | Prosperna Finance | Validate overage billing rules, invoice generation, revenue projections |
| Customer Success | Support Team | Handle merchant complaints, use admin override tools, follow support playbook |
| Prosperna Admins | Ops Team | Monitor enforcement dashboard, apply manual overrides |
| Merchants | All paying merchants (Launch, Grow, Scale) | Primary subject of enforcement; target of upgrade conversion |
| End Customers | Shoppers on merchant storefronts | Indirectly impacted during throttling or hard block events |

---

## Personas

| Persona | Profile | Relevance |
|---|---|---|
| **Launch Merchant** | Small business, $29/mo, 200 orders/month limit. Most likely to hit limits. Primary upgrade conversion target. | Receives all 4 enforcement stages. Highest frequency of limit interactions. |
| **Grow Merchant** | Growing SMB, $59/mo, 750 orders/month limit. Hits limits during growth spurts. | Same enforcement model, higher thresholds. |
| **Scale Merchant** | Larger business, $149/mo, 2,500 orders/month limit. Rarely hits limits. If exceeded, next step is custom/enterprise pricing. | Lowest enforcement frequency. |
| **Trial Merchant** | 14-day trial, Scale-tier limits. Practically inert enforcement during trial period. | Usage dashboard visible; enforcement technically active but unlikely to trigger. |
| **End Customer** | Shopper on a merchant's online store. Does not interact with Prosperna directly. | Experiences order queue delay (15 min) or generic rejection error during enforcement. Never told the merchant has hit a plan limit. |
| **Prosperna Admin** | Internal ops team member. Has access to admin platform. | Monitors enforcement states, uses override tools, reviews fraud alerts. |
| **Prosperna Support** | Customer-facing support agent. | Handles merchant inquiries about limits, uses admin tools to assist, follows support playbook. |

---

## Business Value

| Value Driver | Detail |
|---|---|
| **Revenue protection** | Prevents merchants from consuming Scale-tier resources at Launch-tier pricing. Creates natural upgrade triggers at 200, 750, and 2,500 orders/month. |
| **Upgrade conversion** | Progressive enforcement (80% → 95% → 100% → 125%) creates 4 touchpoints to drive plan upgrades, each with clear upgrade CTAs. Target: 75–85% of merchants upgrade before hitting hard limit. |
| **Merchant retention** | Graduated model prevents shocking merchants with sudden shutdowns. Celebratory framing at 80% reduces churn risk. Target: churn due to limits < 5%. |
| **Infrastructure cost control** | Bandwidth and storage caps prevent unbounded resource consumption by high-growth merchants on low-tier plans. |
| **Overage revenue** | Merchants who exceed limits and choose overages contribute per-unit revenue during their over-limit period. Not a primary revenue target — upgrades are preferred. |
| **Pricing validation** | Shadow mode (Phase A) collects 4 weeks of real usage data before enforcement goes live, allowing threshold validation and adjustment before merchants are affected. |

---

## Scope

### In Scope

- **Usage tracking** for 7 resource types: orders/month, orders/year, sales volume/year (USD), bandwidth GB/month, storage GB (cumulative), max file size (MB), product SKUs.
- **4-stage enforcement model** for resources with progressive limits: Warning (80%), Urgent (95%), Grace Period (100%), Hard Limit (125% or grace expired). Applies to: orders/month, orders/year, sales volume/year, bandwidth/month, storage.
- **Hard gate enforcement** (no 4-stage model) for: max file size (rejected at upload time), product SKUs (rejected at publish time).
- **Merchant dashboard** — new Usage Dashboard page showing real-time progress bars, percentages, remaining amounts, enforcement status, and estimated date to limit.
- **Enforcement banners** — persistent banners on all merchant dashboard pages based on current enforcement stage.
- **One-click upgrade flow** — prorated charge calculation and instant activation via Payment Abstraction Layer (ST-01).
- **Overage acceptance flow** — merchant confirms overage charges for current billing period; orders process normally past the limit.
- **Overage billing** — end-of-period batch job calculates excess usage × overage rate and generates invoice.
- **Email notification system** — 7 email types: Warning (80%), Urgent (95%), Grace Started (100%), Grace Reminder (daily), Hard Limit (125%), Overage Acceptance Confirmation, Overage Invoice, Upgrade Confirmation.
- **Admin enforcement dashboard** — summary view, merchant detail table, and override tools (reset limits, extend grace, view audit log).
- **Fraud detection** — 10× daily average spike detection, temporary throttle, and ops alert.
- **Billing cycle reset** — automated reset of per-period counters and enforcement state at each billing cycle start.
- **Shadow mode rollout** — 4-week Phase A where tracking is active but enforcement is disabled.
- **Gradual enforcement rollout** — Phase B at 10% → 50% → 100% of merchants over 3 weeks.
- **Order queue** — 15-minute soft throttle queue for orders during hard limit stage.
- **Background jobs** — `usage-threshold-checker`, `queued-order-processor`, `end-of-month-overage-processor`.

### Out of Scope

- Subscription payment failure handling (ST-04).
- Trial setup and expiration (ST-03).
- Custom or enterprise plan pricing beyond Scale tier.
- Real-time overage invoicing (overages are billed at end of period, not per event).
- Per-item billing (e.g., charging per order as it happens).
- Merchant ability to set custom alert thresholds.
- Retroactive billing for usage before the enforcement system goes live.
- Overage invoice payment failure resolution details (open question — pending stakeholder confirmation on whether to trigger ST-04 suspension).

---

## Assumptions

| # | Assumption |
|---|---|
| A-1 | ST-01 (Payment Abstraction Layer) is complete and available before the upgrade flow and overage billing can be implemented. |
| A-2 | ST-03 (Trial) defines the plan context that the usage system reads for limit calculations on trial merchants. |
| A-3 | Trial merchants use Scale-tier limits and are extremely unlikely to hit limits during the 14-day trial period. |
| A-4 | Overage invoice payment failure follows the same immediate suspension rule as subscription payment failure (per v3 decision), pending explicit stakeholder confirmation. |
| A-5 | All billing amounts are in USD, regardless of merchant country or payment gateway. |
| A-6 | Bandwidth tracking is asynchronous and does not block the request being served. |
| A-7 | Storage limit breaches prevent new uploads but do not delete existing files. |
| A-8 | The 80% and 95% warning notifications are sent once per resource per billing period (idempotent). |
| A-9 | Upgrading during grace period forgives all current-period overages — this is intentional incentive design. |
| A-10 | Overage acceptance does not auto-renew between billing periods. |
| A-11 | Grace period is extended by the duration of any platform downtime that occurs during it. |
| A-12 | Shadow mode (Phase A) runs for exactly 4 weeks before enforcement goes live. Thresholds may be adjusted based on data collected. |

---

## Dependencies

| Dependency | Subtask | Nature |
|---|---|---|
| Payment Abstraction Layer | ST-01 | Upgrade flow payment processing, prorated charge calculation, overage invoice collection |
| Convenience Fee Removal | ST-02 | Root cause of the pricing restructuring that necessitates this feature |
| 14-Day Trial | ST-03 | Trial plan context and Scale-tier limit assignment for trial merchants |
| Suspended Account State | ST-04 | Invoked if overage invoice payment fails (pending stakeholder confirmation) |
| Merchant Dashboard UI | ST-11 | Usage Dashboard page, enforcement banners, upgrade/overage flow UI |
| Admin Platform Updates | ST-12 | Enforcement dashboard, override tools, monitoring |
| Email Templates | ST-14 | All 7+ email templates for usage notifications, overage invoicing, and upgrade confirmation |
| Background Jobs | ST-15 | Registration and scheduling of `usage-threshold-checker`, `queued-order-processor`, `end-of-month-overage-processor` |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Merchants churn due to limit enforcement | Medium | High | 4-stage graduated model with 48-hour grace; celebratory framing; shadow mode to validate thresholds before enforcement goes live |
| Thresholds set too low — too many merchants hit limits in first month | Medium | High | Shadow mode (Phase A) collects 4 weeks of real usage data; Prosperna can adjust limits before enforcement activates |
| Order loss during throttle/block | Low | Very High | Soft throttle uses a queue (15-min delay), not rejection. Hard block only at 125% without overage acceptance. Orders in queue are never dropped. |
| Fraud/bot attacks consume merchant order quota | Low | Medium | Fraud detection at 10× daily average triggers temporary throttle + ops alert |
| Overage invoice payment failure — unclear handling | Medium | Medium | Open question raised with stakeholders; assumption documented (A-4); resolution required before billing goes live |
| Platform downtime affects merchant grace period unfairly | Low | Medium | Grace period auto-extends by downtime duration; incident logged and merchant notified |
| Bandwidth tracking adds latency to order processing | Low | High | Tracking is async (does not block serving); NFR target: < 50 ms added latency |
| Customer-facing error messages reveal internal plan limits | Medium | Medium | Error messages to customers during hard block are generic; merchant plan details are internal only |

---

## Compliance and Privacy Notes

- Overage billing involves financial transactions and must be auditable. `enforcement_event_log` provides an immutable audit trail for all enforcement events.
- All billing is in USD. Currency conversion for non-USD store orders happens at order creation time.
- Merchant-facing enforcement communications must be clear about what data is tracked and what triggers notifications.
- Customer-facing messages during hard block must never reveal the merchant's plan or financial relationship with Prosperna.
- Sales volume tracking (summing order totals) constitutes financial data processing and must comply with applicable data protection regulations.

---

## Success Metrics

### Upgrade Conversion
| Metric | Target |
|---|---|
| Merchants who upgrade before hitting hard limit | 75–85% |
| Churn due to limits | < 5% |
| Negative reviews mentioning limits | < 2% |

### System Reliability
| Metric | Target |
|---|---|
| Merchants receive warning at 80% | 100% |
| Merchants receive urgent at 95% | 100% |
| Merchants receive 48-hour grace at 100% | 100% |
| Orders lost during enforcement | 0% (queue only, no drops) |
| Time from upgrade click to limit increase | < 30 seconds |

### Performance
| Metric | Target |
|---|---|
| Usage tracking latency added to order processing | < 50 ms |
| Usage dashboard page load | < 2 seconds |
| Threshold check execution time | < 100 ms |
| Queued orders processed within promised window | 100% within 15 min ± 1 min |

### Business Health
| Metric | Target |
|---|---|
| Gross margins maintained | 40–60% |
| Overage acceptance rate | Tracked (no target; upgrade preferred) |
| Revenue from overages vs upgrades | Tracked for pricing optimization |
