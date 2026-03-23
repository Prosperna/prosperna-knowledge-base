---
id: st-10-promo-code-system-updates
title: BRD. ST-10 Promo Code System Updates
sidebar_label: ST-10 Promo Code System Updates
sidebar_position: 10
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-22
- Status: Draft
- Parent Initiative: Prosperna Pricing Restructuring v3
- Subtask ID: ST-10
- Priority: HIGH

---

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform. Its **Promo Code / Rewards system** allows Prosperna admins to create discount codes that reduce the price of merchant subscription plans. These promo codes are distinct from merchant-facing product discount codes — they apply exclusively to merchant billing for core subscriptions, marketplace add-ons (Lazada/Shopee), and AI Credits.

The Pricing Restructuring initiative (v3) introduces three structural changes that render the current promo code system incompatible with the new platform:

1. **Plan tier renaming:** The current plan names (FREE/PLUS/PRO/PREMIUM) are being replaced with TRIAL/LAUNCH/GROW/SCALE. The `assignment_subscription_tier` field on promo codes currently only accepts the old names, making AUTO assignment non-functional for merchants on new plan tiers.

2. **Currency migration from PHP to USD:** All core subscription pricing is transitioning to USD. Flat-amount promo code values are currently interpreted as Philippine Pesos, which will produce incorrect discounts once the pricing table changes.

3. **Payment gateway abstraction:** Stripe and Xendit are being unified under a Payment Abstraction Layer (PAL). The promo code "already-used" check currently queries gateway-specific tables (`xenditrecurringplans`, `plansubscriptions`), which will not capture subscriptions created via Stripe or the PAL's unified records.

Additionally, the migration of existing Free Plan merchants to the new paid plan structure (ST-16) requires a special "OG Merchant" promo code with automated bulk assignment and timed expiry logic that the current system does not support.

---

## Goals

1. Update `assignment_subscription_tier` to accept new plan tier values (LAUNCH, GROW, SCALE) while preserving backward compatibility for existing records using legacy values.
2. Update the promo code validation logic (`getPlanPricingBreakdown()`) to use the new USD pricing table and recognize new plan type names.
3. Update the `associateStoreWithAutoRewards()` function to correctly match new plan types against promo tier eligibility.
4. Update the already-used check to query the unified `plan_subscriptions` collection from the Payment Abstraction Layer.
5. Update the Admin UI tier dropdown and merchant plan filter to reflect new plan names.
6. Update currency display in the Admin Rewards UI from PHP (₱) to USD ($).
7. Support the "OG Merchant" migration promo code — a time-limited, auto-assigned discount for migrating Free Plan merchants.
8. Implement a daily background job to auto-expire promo codes whose `valid_until` date has passed.

---

## Non-Goals

1. Redesigning the overall Rewards page layout or interaction model (split-panel CRUD + assignment remains unchanged).
2. Promo code stacking (multiple promos on one subscription) — not supported, not changing.
3. Merchant-facing promo code entry UI redesign (covered by ST-11).
4. Product discount / coupon codes for merchant storefronts (entirely separate system).
5. Promo code analytics or redemption dashboards (deferred).
6. Proactive conversion or migration of existing PHP flat promo codes to USD — admins must recreate them.
7. Migration email templates referencing the OG Merchant promo (covered by ST-16).

---

## Stakeholders

| Role | Name/Team | Interest |
|---|---|---|
| Product Owner | Prosperna Product Team | Maintain promo code functionality through pricing restructuring |
| Engineering Lead | Backend & Frontend Teams | Implementation across admin-service-api, payment-integration-api, prosperna1 |
| Business Analyst | BA Team | Requirements and documentation |
| Prosperna Admins | Admin Control Platform Users | Uninterrupted ability to create and assign promo codes |
| Finance/Accounting | Prosperna Finance | Correct discount calculations in USD; accurate billing |
| Customer Support | Support Team | Handle merchant queries about changed promo codes during migration |

---

## Personas

### Persona 1 — Prosperna Admin (Promo Manager)
- Creates and manages promo codes for merchant subscription billing.
- Currently limited to old plan tier names when creating AUTO promo codes.
- Post-change: can create promos targeting LAUNCH/GROW/SCALE tiers with USD flat values.

### Persona 2 — Migrating Free Plan Merchant (Suspended State)
- Was on the Free plan; now in Suspended state pending migration (ST-04/ST-16).
- Eligible for the "OG Merchant" promo (50% off first 3 billing cycles).
- Promo is auto-assigned at T-60; merchant sees it when selecting a plan and completing checkout.

### Persona 3 — Existing Paid Merchant (PLUS/PRO/PREMIUM → LAUNCH/GROW/SCALE)
- Has an active subscription under legacy plan names.
- Existing promo codes tied to legacy tiers remain valid until the promo expires or the subscription renews under new naming.

### Persona 4 — New Merchant (Post-Restructuring)
- Subscribes for the first time to LAUNCH, GROW, or SCALE.
- AUTO promo codes configured for the new tier names are correctly auto-associated during checkout.

---

## Business Value

| Value | Metric |
|---|---|
| Unblocks Pricing Restructuring | Without ST-10, AUTO promo assignment and discount calculations fail for all new plan tiers |
| Migration retention | OG Merchant promo (50% off × 3 cycles) reduces churn risk among ~X migrating Free merchants |
| Correct billing | USD-aware flat discount calculations prevent over- or under-discounting post-migration |
| Reduced tech debt | Unified subscription state query replaces fragile dual-gateway lookup |

---

## Scope

### In Scope

- `rewards` model: extend `assignment_subscription_tier` enum to include LAUNCH, GROW, SCALE while preserving FREE, PLUS, PRO, PREMIUM for legacy records.
- `associateStoreWithAutoRewards()`: accept new plan type values and match correctly against both new and legacy tier values.
- `getPlanPricingBreakdown()`: replace PHP pricing table with USD table; recognize new plan names; update already-used check.
- Admin UI (prosperna1 Rewards page): update tier dropdown, merchant list plan filter, and currency labels.
- OG Merchant promo code: define the promo record and bulk-assignment trigger at T-60.
- `migration-promo-expiry` daily background job: auto-soft-delete promo codes past their `valid_until` date.

### Out of Scope

- Product discount/coupon codes for merchant storefronts.
- Merchant-facing promo code entry UI (ST-11).
- Proactive refunds or credits for existing merchants whose PHP promo codes become invalid.
- Promo code analytics dashboards.
- Promo code stacking.

---

## Assumptions

1. The Payment Abstraction Layer's unified `plan_subscriptions` collection is the single source of truth for active subscriptions at the time ST-10 ships.
2. Existing promo codes with old tier values (FREE/PLUS/PRO/PREMIUM) will not be automatically migrated — admins will recreate them with new tier values if still needed.
3. The "OG Merchant" promo code data is seeded or created manually by an admin prior to T-60.
4. T-0 (migration day) and T-60 are defined in the ST-16 migration plan and communicated to the engineering team implementing the bulk assignment trigger.
5. The `migration-promo-expiry` job runs on `payment-integration-api` (or `admin-service-api`) using the existing Agenda/cron infrastructure.
6. Percent-type promo codes require no currency changes — percentages are currency-agnostic.
7. TRIAL plan merchants are eligible for promos with `assignment_subscription_tier = 'ALL'` only.

---

## Dependencies

| Dependency | Subtask | Why |
|---|---|---|
| Payment Abstraction Layer | ST-01 | Already-used check must query the PAL's unified `plan_subscriptions` records |
| New USD Pricing Constants | ST-01 | `getPlanPricingBreakdown()` needs the new pricing table |
| New Plan Tier Definitions | ST-01 | LAUNCH/GROW/SCALE plan names and types must be finalized |
| Suspended Account State | ST-04 | Migrating merchants enter Suspended state; TRIAL plan type context is from ST-04 |
| Existing Merchant Migration | ST-16 | Consumes ST-10 — OG Merchant promo must be ready before bulk assignment at T-60 |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Existing AUTO promo codes stop matching merchants after tier rename | High | High | Keep legacy tier values valid in model; update matching logic to handle both old and new values during transition |
| Flat promo code values (PHP) produce wrong discounts against USD pricing | High | High | Admin must recreate flat promos with USD values; document deprecation; log warning if old PHP promo applied post-migration |
| PAL `plan_subscriptions` not yet available when ST-10 ships | Medium | Medium | Feature-flag the updated already-used check; fall back to old query if PAL not available |
| OG Merchant promo bulk assignment at T-60 fails silently | Medium | High | Add job monitoring and alerting; log failed assignments; provide admin re-trigger mechanism |
| Migration promo expiry job not registered or fails | Low | Medium | Register job in CI checklist; add health check endpoint for scheduled jobs |

---

## Compliance and Privacy Notes

- Promo code discount records are retained (soft delete only) for audit and accounting purposes.
- The `store_to_rewards` join table preserves the history of which merchants received which promos — do not hard delete.
- USD pricing values must be consistent across all services — no mixed-currency calculations.

---

## Success Metrics

| Metric | Target |
|---|---|
| AUTO promo auto-assignment success rate for LAUNCH/GROW/SCALE merchants | 100% (no failed matches post-deployment) |
| Correct USD discount calculation on first payment post-migration | 100% (zero billing errors) |
| OG Merchant promo redemption rate among eligible migrating merchants | >30% within 90 days of migration |
| Expired promo codes cleaned up within 24 hours of `valid_until` | 100% (via daily job) |
| Admin UI correctly shows new tier options with no legacy options selectable | 100% |
