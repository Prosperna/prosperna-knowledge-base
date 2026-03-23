---
id: st-16-existing-merchant-migration
title: BRD. ST-16 Existing Merchant Migration
sidebar_label: ST-16 Existing Merchant Migration
sidebar_position: 16
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Background and Problem

Prosperna is transitioning its subscription model from a four-tier PHP-priced structure (Free / Plus / Pro / Premium) to a three-tier USD-priced structure (Launch / Grow / Scale) with a new 14-day Trial onboarding flow and a Suspended state for inactive/non-paying accounts.

The Free Plan currently allows merchants to operate a live store indefinitely without paying. This attracts non-serious users, dilutes platform quality, and conflicts with Prosperna's US SMB market positioning. The convenience fee model (1–2% per transaction) is being replaced with usage-based subscription tiers, removing friction for high-volume merchants.

All existing merchants must be transitioned in a single coordinated migration event ("Migration Day" = T-0) with a structured advance communication campaign to minimize churn and maximize voluntary conversion before the cutover.

---

## Goals

1. Migrate 100% of existing merchants from old plan names to new plan names on T-0.
2. Transition Free Plan merchants to Suspended state with data fully preserved, giving them a clear reactivation path.
3. Transition paid merchants (Plus/Pro/Premium) to equivalent new plans (Launch/Grow/Scale) transparently, with new USD pricing applying at next renewal.
4. Minimize involuntary churn through a multi-touchpoint communication campaign (T-60 through T-0) and a 50%-off "OG Merchant" promo code valid for 90 days post-T-0.
5. Ensure all data is preserved; no merchant data is deleted.
6. Complete the bulk migration job with a >99% success rate and zero unrecoverable failures.

---

## Non-Goals

- Migrating new merchant sign-ups (handled by ST-03 Trial system).
- Enforcing usage limits during migration (handled by ST-06; shadow mode only for 4 weeks post-T-0).
- Removing convenience fees (handled by ST-02; coordinated timing).
- Activating free native Marketplace add-ons (handled by ST-09).
- Building the Payment Abstraction Layer (handled by ST-01; must be deployed before T-0).
- Grandfathering any merchant on old PHP pricing.

---

## Stakeholders

| Role | Name / Team | Interest |
|---|---|---|
| Product Owner | Prosperna Product Team | Feature delivery and quality |
| Engineering Lead | Backend / Frontend Engineering | Implementation scope and timeline |
| Support Team | Customer Success | Handling merchant inquiries during migration |
| Finance / Revenue | Finance Team | Revenue impact, MRR transition monitoring |
| Marketing | Growth / CRM Team | Email campaign execution and promo code strategy |
| Merchants (All) | Existing merchant base | Continuity, data safety, pricing fairness |
| Prosperna Admins | Internal admin users | Migration monitoring and override tooling |

---

## Personas

**Persona 1 — Active Free Merchant (Segment A)**
A merchant actively using their Prosperna free store (placed orders in the last 30 days). Invested in the platform; likely to convert if offered a good deal and given enough notice.

**Persona 2 — Inactive Free Merchant (Segment C)**
A merchant who signed up but hasn't logged in for 60+ days. Unlikely to notice the migration but deserves respectful communication and data preservation.

**Persona 3 — Active Paid Merchant (Plus / Pro / Premium)**
A merchant on a paid plan with active billing. Needs to understand their plan is changing name and pricing — but their store experience should be uninterrupted.

**Persona 4 — Premium Trial Merchant (Segment D)**
A Free Plan merchant currently enjoying a 14-day Premium Trial. Their trial should continue uninterrupted, and they should receive the OG Merchant promo code.

**Persona 5 — Prosperna Admin**
Internal Prosperna staff responsible for monitoring migration progress, handling escalations, and using override tools.

---

## Business Value

1. **Revenue model transformation:** Moving from convenience fees to subscription tiers increases predictability and scales better with merchant growth.
2. **Platform quality:** Retiring the Free Plan removes non-committed users, improving platform metrics and support load ratios.
3. **US SMB positioning:** USD pricing and a usage-based model align with international SaaS norms, improving acquisition and retention in the US market.
4. **Merchant trust:** Generous notice period (60/45 days), data preservation guarantees, and 50% off introductory pricing demonstrate commitment to existing merchant relationships.

---

## Scope

### In Scope

- Bulk migration of all existing merchants on Free, Plus, Pro, and Premium plans.
- Pre-migration 60-day and 45-day communication campaign for Free and Paid plan merchants respectively.
- "OG Merchant" 50%-off promo code auto-assignment and tracking.
- Suspended state implementation: dashboard lock screen, storefront suspension page.
- New plan enum values (`LAUNCH`, `GROW`, `SCALE`, `SUSPENDED`, `TRIAL`) added to Store model.
- New schema fields: `suspendedAt`, `suspendedReason`, `lastActivePlan`, `isSuspended`, `dataRetentionDeadline`.
- New `migration_audit_log` collection for idempotency and compliance tracking.
- Admin migration tracking dashboard and manual override tools.
- Background jobs: `migration-bulk-executor`, `migration-communication-sender`, `migration-promo-applicator`, `migration-promo-expiry`, `migration-win-back-sender`.
- 14 migration email templates.
- In-app migration banner (T-60) and modal (T-30) for Free Plan merchants.
- Route guards for suspended merchants.
- 4-week usage limit shadow period for migrated paid merchants.
- Post-migration win-back campaign (T+7, T+30).
- Rollback script for emergency reversion.

### Out of Scope

- New merchant sign-up flow (ST-03).
- Convenience fee removal (ST-02).
- Usage limit enforcement (ST-06).
- Native Marketplace add-on free activation (ST-09).
- Payment Abstraction Layer (ST-01) — must be deployed before T-0.
- Stripe subscription billing for existing merchants (handled within ST-01).
- Any changes to orders, products, pages, or storefront content beyond the suspension page.

---

## Assumptions

1. All prerequisite subtasks (ST-01, ST-03, ST-04, ST-05, ST-10, ST-14) are deployed and verified in production before T-0.
2. The "OG Merchant" promo code can be configured and auto-assigned through the existing `admin-service-api` rewards system.
3. Quarterly and annual USD pricing uses the same multiplier logic as the current PHP pricing (3× monthly; annual = 12× with 1 month free = 13 months).
4. Cognito accounts are NOT disabled for suspended merchants; merchants can log in to see the lock screen.
5. Free Plan merchants' storefront data (products, pages, orders) is preserved indefinitely in its current storage tier.
6. The bulk migration job runs during a low-traffic maintenance window with on-call engineering available.
7. Email delivery infrastructure can handle sending to all active Free and Paid Plan merchants within the same day.

---

## Dependencies

| Dependency | Subtask | Required By |
|---|---|---|
| Payment Abstraction Layer (Stripe + Xendit) | ST-01 | T-0 — new billing must route through abstraction layer |
| Trial System | ST-03 | T-0 — Premium Trial merchants' expiry handled by trial system |
| Suspended Account State | ST-04 | T-0 — `suspendMerchant()` function, lock screen, storefront page |
| Plan Cancellation → Suspend | ST-05 | T-0 — `revertToFreePlan()` replaced by `suspendMerchant()` |
| Promo Code System Updates | ST-10 | T-60 — OG Merchant promo code creation and assignment |
| Billing Email Templates | ST-14 | T-0 — email templates for migration communications |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Migration job fails partway through | Medium | High | Idempotent job design; independent per-merchant transactions; failure threshold halts at >10% errors; rollback script available |
| Mass merchant churn from Free Plan retirement | Medium | High | 60-day notice; 50%-off OG Merchant promo; win-back campaign at T+7 and T+30 |
| Paid merchant backlash over USD pricing | Low | Medium | 45-day notice; clear value messaging (all features included, zero convenience fees); no mid-cycle price change (only at renewal) |
| Active Premium Trial merchants disrupted | Low | High | Trial protection rule: never shorten active trials; trial continues to natural expiry |
| Promo code system unable to handle bulk auto-assignment | Low | Medium | Test with production-like data in staging before T-60 |
| Support ticket surge on T-0 | High | Medium | Support team trained in advance; FAQ published; temporary expanded support on T-0 |
| Legacy plan values break existing data queries | Medium | Medium | Keep legacy values in schema for backward compatibility; deprecate only, do not delete |

---

## Compliance and Privacy Notes

- Merchant data (products, orders, pages, customer data) must be preserved indefinitely post-suspension. No merchant data is deleted as part of migration.
- `dataRetentionDeadline` field (`suspendedAt + 6 months`) flags when media files may transition to cold storage — this is a cost management measure, not a data deletion step. Actual deletion policy TBD with legal/compliance.
- Migration audit log records are compliance artifacts and must be retained.
- Cognito accounts remain active (merchants retain login access to see the lock screen and select a plan).

---

## Success Metrics

| Metric | Target | Measurement Window |
|---|---|---|
| Free Plan → Paid Conversion Rate | >30% of active Free merchants | Within 90 days of T-0 |
| Migration Promo Redemption Rate | >40% of converting Free merchants | Within 90 days of T-0 |
| Free Plan Churn (Lost, never reactivate) | <50% of inactive Free merchants | 90 days post-T-0 |
| Paid Plan Migration Satisfaction | >90% positive or neutral | Survey after T-0 |
| Bulk Migration Job Success Rate | >99% | T-0 execution |
| Migration-Related Support Tickets | <500 tickets in first 2 weeks | T-0 through T+14 |
| Email Delivery Rate | >95% for all migration emails | Each scheduled send |
