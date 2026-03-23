---
id: st-10-promo-code-system-updates
title: PRD. ST-10 Promo Code System Updates
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

---

## Summary

ST-10 updates Prosperna's internal Promo Code / Rewards system to remain functional after the Pricing Restructuring v3 rollout. The changes span three backend services (`admin-service-api`, `payment-integration-api`) and the admin frontend (`prosperna1`). The primary outcomes are: promo codes correctly target new plan tiers (LAUNCH/GROW/SCALE), flat discount values are interpreted in USD, the already-used check queries the unified subscription state, and the OG Merchant migration promo is supported with automated bulk assignment and expiry.

---

## User Journey

### Happy Path — Admin Creates a New AUTO Promo Code for GROW Plan

1. Admin navigates to `/admin/rewards` (Rewards page).
2. Admin clicks **Create Promo Code**.
3. Admin fills in:
   - Promo Code Name: `GROW50`
   - Type: Percent
   - Value: `50`
   - Assignment Type: `AUTO`
   - Assignment Subscription Tier: `GROW` ← (new option, not PRO)
   - Apply To: Core Subscriptions
   - Valid Until: 2026-06-30
4. Admin saves. Promo code is created in the `rewards` collection with `assignment_subscription_tier: 'GROW'`.
5. When a merchant on the GROW plan enters the subscription flow, `associateStoreWithAutoRewards('GROW', storeId)` is called.
6. The function matches the promo (tier = 'GROW') and creates a `store_to_rewards` record.
7. Merchant sees the promo at checkout, applies it, gets 50% off.

### Happy Path — Migrating OG Merchant Applies Migration Promo

1. At T-60, bulk assignment job runs: `store_to_rewards` records are created for all Free Plan merchants linking them to the OG Merchant promo code.
2. Merchant receives migration notification (ST-16).
3. Merchant (now in Suspended state) logs into the Merchant Dashboard and selects the LAUNCH plan.
4. During checkout, `associateStoreWithAutoRewards('TRIAL', storeId)` runs (or the bulk record already exists).
5. Merchant applies the OG Merchant promo code → `getPlanPricingBreakdown()` computes: `$29.00 - ($29.00 × 50 / 100) = $14.50`.
6. Merchant pays $14.50/mo for the first 3 billing cycles.
7. On cycle 4, `cycle_duration` check triggers → full price $29.00/mo charged.

### Happy Path — Merchant Attempts Reuse of Already-Used Promo

1. Merchant with an active LAUNCH subscription (using promo `LAUNCH50`) attempts to apply `LAUNCH50` again on renewal.
2. `getPlanPricingBreakdown()` queries `plan_subscriptions` (unified PAL collection).
3. Finds an active subscription for this store using `LAUNCH50`.
4. Returns error: promo code already redeemed.
5. Merchant sees "This promo code has already been used" message.

### Alternate Path — Admin Creates Flat Promo in USD

1. Admin creates a flat promo: Name `LAUNCH29OFF`, Type: Flat, Value: `29` (USD).
2. Merchant on LAUNCH ($29/mo monthly) applies it → `$29.00 - $29.00 = $0.00`.
3. Final price is $0 → subscription activated immediately without payment.

### Failure Path — Merchant on Wrong Tier Applies AUTO Promo

1. AUTO promo `GROW50` has `assignment_subscription_tier: 'GROW'`.
2. Merchant currently on LAUNCH plan applies `GROW50`.
3. `getPlanPricingBreakdown()` validates tier: merchant's plan is LAUNCH, promo's tier is GROW → mismatch.
4. Returns error: promo code is not valid for this plan.
5. Merchant sees "Promo code not valid for your plan" message.

### Failure Path — Expired Promo Applied

1. Admin created promo with `valid_until: 2026-03-01`.
2. Daily expiry job ran on 2026-03-02 → set `is_trashed: true`.
3. Merchant attempts to apply this promo on 2026-03-15.
4. `GET /v1/admin/rewards/promo-code?name=X` returns 404 (trashed codes excluded from query).
5. Merchant sees "Invalid promo code" message.

---

## Functional Requirements

### FR-1 — Extend `assignment_subscription_tier` Enum

The `rewards` model must accept the following values for `assignment_subscription_tier`:

**New values (selectable in admin UI for new promos):** `ALL`, `LAUNCH`, `GROW`, `SCALE`

**Legacy values (preserved for existing records, not selectable for new promos):** `FREE`, `PLUS`, `PRO`, `PREMIUM`

Validation on create/update must allow new values only. Legacy values must not be rejected on read or existing records.

**File:** `admin-service-api/src/collections/rewards/rewards.model.ts`

---

### FR-2 — Update `associateStoreWithAutoRewards()` for New Plan Types

The function must accept `LAUNCH`, `GROW`, `SCALE`, and `TRIAL` as valid `planType` inputs.

Matching logic:
- `TRIAL` → matches promo codes with `assignment_subscription_tier = 'ALL'` only.
- `LAUNCH` → matches `'ALL'` or `'LAUNCH'`.
- `GROW` → matches `'ALL'` or `'GROW'`.
- `SCALE` → matches `'ALL'` or `'SCALE'`.
- Legacy plan types (`PLUS`, `PRO`, `PREMIUM`) → continue to match their respective legacy tier values and `'ALL'` during transition.

**File:** `admin-service-api/src/collections/rewards/rewards.repository.ts`

---

### FR-3 — Update `getPlanPricingBreakdown()` — USD Pricing Table

Replace the PHP plan pricing table with the USD pricing table:

| Plan | Monthly | Quarterly | Annual |
|---|---|---|---|
| LAUNCH | $29.00 | $87.00 | $377.00 |
| GROW | $59.00 | $177.00 | $767.00 |
| SCALE | $149.00 | $447.00 | $1,937.00 |

The function must recognize `LAUNCH`, `GROW`, `SCALE`, and `TRIAL` as valid `plan_type` inputs. Legacy plan type recognition (`PLUS`, `PRO`, `PREMIUM`) may remain during the transition period to handle any in-flight subscriptions.

**File:** `payment-integration-api/src/utils/helper.ts`

---

### FR-4 — Update Already-Used Check to Query Unified Subscription Records

The already-used check in `getPlanPricingBreakdown()` must query the PAL's unified `plan_subscriptions` collection instead of querying `xenditrecurringplans` and `plansubscriptions` separately.

The check must return "already used" if any active `plan_subscriptions` record exists for the store using the same promo code.

**File:** `payment-integration-api/src/utils/helper.ts`

---

### FR-5 — Update Tier Matching Logic for AUTO Promos in Validation

Within `getPlanPricingBreakdown()`, the AUTO promo tier validation must use the same matching rules as FR-2:
- `TRIAL` → only `'ALL'` tier promos are valid.
- `LAUNCH` → `'ALL'` or `'LAUNCH'`.
- `GROW` → `'ALL'` or `'GROW'`.
- `SCALE` → `'ALL'` or `'SCALE'`.
- Legacy plan types match their legacy tier values for transition compatibility.

**File:** `payment-integration-api/src/utils/helper.ts`

---

### FR-6 — Admin UI: Update Tier Dropdown for Promo Creation/Edit

The `Assignment Subscription Tier` dropdown in the Promo Code create/edit form must show only: `ALL`, `LAUNCH`, `GROW`, `SCALE`.

Existing promo codes with old tier values (FREE/PLUS/PRO/PREMIUM) continue to display their stored value in read-only view, but cannot be selected for new promos.

**File:** `prosperna1/src/pages/admin/Rewards/` (create/edit modal component)

---

### FR-7 — Admin UI: Update Merchant List Plan Filter

The Plan Filter dropdown in the Merchant List panel must show: `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED`.

**File:** `prosperna1/src/pages/admin/Rewards/` (merchant list panel component)

---

### FR-8 — Admin UI: Update Currency Display to USD

All currency labels in the Admin Rewards UI must display `$` (USD) instead of `₱` (PHP). This includes:
- The value field label/prefix/suffix in the create/edit promo code form.
- Any currency symbols shown in the promo code list table (Flat type rows).

**File:** `prosperna1/src/pages/admin/Rewards/`

---

### FR-9 — OG Merchant Migration Promo Code Definition

An "OG Merchant" promo code must be created (by admin or seed script) with the following configuration:

| Field | Value |
|---|---|
| `promo_code_name` | `OGMERCHANT50` (or admin-configured) |
| `promo_code_type` | `percent` |
| `promo_code_value` | `50` |
| `assignment_type` | `AUTO` |
| `assignment_subscription_tier` | `ALL` |
| `cycle_duration` | `3` |
| `apply_to` | `['Core Subscriptions']` |
| `valid_until` | T-0 + 90 days |
| `is_permanent` | `false` |

---

### FR-10 — OG Merchant Bulk Assignment at T-60

At T-60 (60 days before migration day T-0), a one-time job or admin-triggered script must bulk-insert `store_to_rewards` records linking all Free Plan merchant stores to the OG Merchant promo code.

The bulk assignment must be idempotent — re-running it must not create duplicate records.

**File:** New one-time migration script or admin-service-api bulk assignment endpoint

---

### FR-11 — Migration Promo Expiry Background Job

A daily background job named `migration-promo-expiry` must:

1. Query the `rewards` collection for records where `valid_until < NOW()` and `is_trashed = false`.
2. For each matched record, set `is_trashed = true`.
3. Optionally: set `is_trashed = true` on associated `store_to_rewards` records where `used = false` for the expired promo.

The job must be idempotent and log the count of records processed per run.

**File:** `payment-integration-api/src/jobs/index.ts` (or equivalent cron registration file)

---

## Non-Functional Requirements

| ID | Requirement | Detail |
|---|---|---|
| NFR-1 | Backward compatibility | Legacy plan tier values in existing `rewards` documents must not be rejected or modified during migration |
| NFR-2 | Idempotency | Bulk assignment (FR-10) and expiry job (FR-11) must be safe to re-run without side effects |
| NFR-3 | Data integrity | Soft delete only — no hard deletion of `rewards` or `store_to_rewards` records |
| NFR-4 | Observability | Expiry job must log count of records expired per run; bulk assignment must log success/failure per store |
| NFR-5 | Performance | Expiry job query must use indexed fields (`valid_until`, `is_trashed`) to avoid collection scans |
| NFR-6 | Consistency | USD pricing values must be defined in a single constants file shared across all services — no hardcoded per-file pricing |
| NFR-7 | Transition safety | During migration, both old and new plan type names must be resolvable in validation — no hard cutover |

---

## UX Notes

- The Rewards page layout (split panel) does not change.
- Tier dropdown change is a simple option list update — no design changes required.
- Currency symbol swap (`₱` → `$`) is a label update only.
- Merchant plan filter dropdown update is a simple option list update.
- No new modals, pages, or interaction patterns are introduced.

---

## Data Model Notes

### `rewards` collection changes

- `assignment_subscription_tier` enum extended to include: `LAUNCH`, `GROW`, `SCALE`.
- Legacy values (`FREE`, `PLUS`, `PRO`, `PREMIUM`) remain in the enum for backward compatibility.
- No new fields are added to `rewards` for ST-10. The `valid_until` + `is_trashed` pattern is sufficient for expiry.

### `store_to_rewards` collection — no schema changes

The existing schema handles OG Merchant bulk assignment without modification.

### New USD Pricing Constants

A shared pricing map (in constants or a config service) should define:
```ts
const PLAN_PRICING_USD = {
  LAUNCH: { MONTHLY: 29, QUARTERLY: 87, ANNUAL: 377 },
  GROW:   { MONTHLY: 59, QUARTERLY: 177, ANNUAL: 767 },
  SCALE:  { MONTHLY: 149, QUARTERLY: 447, ANNUAL: 1937 },
};
```

---

## Integrations and APIs

| Integration | Direction | Purpose |
|---|---|---|
| `admin-service-api` → MongoDB | Read/Write | `rewards` and `store_to_rewards` CRUD |
| `payment-integration-api` → `admin-service-api` | HTTP GET | Promo code lookup by name during validation |
| `payment-integration-api` → MongoDB | Read | Unified `plan_subscriptions` already-used check |
| `payment-integration-api` → Agenda/cron | Schedule | `migration-promo-expiry` daily job registration |
| `prosperna1` → `api-aggregator` → `admin-service-api` | HTTP | Admin Rewards CRUD and merchant list |

---

## Error Handling

| Scenario | Error Message | HTTP Status |
|---|---|---|
| Promo code not found by name | `"Invalid promo code"` | 400 |
| Promo code already used by this merchant | `"This promo code has already been used"` | 400 |
| Promo code not valid for merchant's plan tier | `"Promo code not valid for your plan"` | 400 |
| Promo code outside valid date range | `"This promo code has expired or is not yet active"` | 400 |
| MANUAL promo not assigned to this merchant | `"You are not eligible for this promo code"` | 403 |
| Invalid `assignment_subscription_tier` value on create | `"Invalid tier value"` | 422 |

---

## Telemetry and Analytics

| Event | Trigger | Properties |
|---|---|---|
| `promo_applied` | Merchant applies promo during checkout | `promo_code_name`, `plan_type`, `billing_type`, `discount_type`, `discount_value`, `final_price`, `store_id` |
| `promo_rejected` | Promo validation fails | `promo_code_name`, `reason`, `store_id`, `plan_type` |
| `promo_expired_by_job` | Expiry job soft-deletes a promo | `promo_id`, `promo_code_name`, `valid_until`, `job_run_date` |
| `og_merchant_promo_bulk_assigned` | T-60 bulk assignment completes | `total_stores`, `success_count`, `failure_count`, `job_run_date` |

---

## Rollout Plan

1. **Pre-deploy:** Admin creates the OG Merchant promo code in production admin UI (or via seed script).
2. **Deploy ST-10 backend changes** (rewards model, associateStoreWithAutoRewards, getPlanPricingBreakdown, expiry job).
3. **Deploy ST-10 frontend changes** (tier dropdown, plan filter, currency labels).
4. **Verify:** Smoke test AUTO promo creation for GROW tier; verify USD pricing in discount calculation.
5. **T-60:** Trigger OG Merchant bulk assignment job.
6. **T-0:** Migration day. OG Merchant promo is active and ready for migrating merchants.
7. **Post-T-0:** Monitor redemption rates; expiry job runs daily.

---

## Open Questions

| # | Question | Assumption |
|---|---|---|
| OQ-1 | What is the exact promo code name for the OG Merchant promo? | Assumed `OGMERCHANT50`; admin can configure before T-60 |
| OQ-2 | What is T-0 (migration day)? | Defined by ST-16; not yet confirmed. ST-10 must ship before T-60. |
| OQ-3 | Should `is_expired` be a separate flag from `is_trashed` to distinguish admin-deleted vs. system-expired promos? | Assumed: use `is_trashed` for now; can add `is_expired` in a future iteration |
| OQ-4 | Does the expiry job need to run on `admin-service-api` or `payment-integration-api`? | Assumed: `payment-integration-api` (where Agenda is registered); confirm with infra team |
| OQ-5 | During transition, should old PHP flat promo codes be automatically marked as invalid? | Assumed: no automatic invalidation; admins recreate them. Log a warning when PHP-valued promos are applied post-migration |

---

# Gherkin User Stories

## Feature: ST-10 Promo Code System Updates

### FR-1: Extend `assignment_subscription_tier` Enum

```gherkin
Scenario: Admin creates a promo code with new LAUNCH tier
  Given I am logged in as a Prosperna Admin on the Rewards page
  When I open the Create Promo Code modal
  And I set Assignment Type to "AUTO"
  And I open the Assignment Subscription Tier dropdown
  Then I should see the options: ALL, LAUNCH, GROW, SCALE
  And I should not see: FREE, PLUS, PRO, PREMIUM as selectable options

Scenario: Legacy promo code with PRO tier displays correctly in read-only view
  Given there is an existing promo code with assignment_subscription_tier "PRO"
  When I view this promo code's details in the admin Rewards page
  Then I should see the tier displayed as "PRO"
  And the system should not throw a validation error for the legacy value
```

### FR-2: `associateStoreWithAutoRewards()` for New Plan Types

```gherkin
Scenario: GROW plan merchant gets auto-associated with GROW-tier promo
  Given a promo code exists with assignment_type "AUTO" and tier "GROW"
  And a merchant store has plan type "GROW"
  When the merchant enters the subscription flow
  Then associateStoreWithAutoRewards is called with planType "GROW" and the store's ID
  And a store_to_rewards record is created linking the merchant to the promo

Scenario: TRIAL plan merchant only gets auto-associated with ALL-tier promos
  Given a promo code exists with assignment_type "AUTO" and tier "GROW"
  And another promo code exists with assignment_type "AUTO" and tier "ALL"
  And a merchant store has plan type "TRIAL"
  When associateStoreWithAutoRewards is called with planType "TRIAL"
  Then only the "ALL" tier promo is associated with the merchant

Scenario: LAUNCH plan merchant is associated with ALL and LAUNCH tier promos
  Given promos exist for tiers "ALL", "LAUNCH", "GROW", "SCALE"
  And a merchant has plan type "LAUNCH"
  When associateStoreWithAutoRewards is called with planType "LAUNCH"
  Then only the "ALL" and "LAUNCH" promos are associated with the merchant
```

### FR-3: USD Pricing Table in `getPlanPricingBreakdown()`

```gherkin
Scenario: Flat promo correctly reduces LAUNCH monthly price in USD
  Given the LAUNCH monthly plan price is $29.00
  And a flat promo code exists with value 10 (USD)
  When a merchant on LAUNCH monthly applies the promo code
  Then the final price returned is $19.00

Scenario: Percent promo correctly reduces GROW monthly price
  Given the GROW monthly plan price is $59.00
  And a percent promo code exists with value 50
  When a merchant on GROW monthly applies the promo code
  Then the final price returned is $29.50

Scenario: 100% flat promo activates LAUNCH subscription for free
  Given the LAUNCH monthly plan price is $29.00
  And a flat promo code exists with value 29 (USD)
  When a merchant on LAUNCH monthly applies the promo code
  Then the final price returned is $0.00
  And the subscription is activated without creating a payment invoice

Scenario: Final price cannot be negative
  Given the LAUNCH monthly plan price is $29.00
  And a flat promo code exists with value 100 (USD)
  When a merchant on LAUNCH monthly applies the promo code
  Then the final price returned is $0.00
```

### FR-4: Already-Used Check Queries Unified `plan_subscriptions`

```gherkin
Scenario: Merchant with active subscription cannot reuse the same promo
  Given a merchant has an active plan_subscriptions record using promo code "LAUNCH50"
  When the merchant attempts to apply "LAUNCH50" to a new subscription
  Then getPlanPricingBreakdown returns an error
  And the error message is "This promo code has already been used"

Scenario: Merchant with no active subscription can use a promo code
  Given no plan_subscriptions record exists for the merchant using promo "LAUNCH50"
  And the promo code "LAUNCH50" is valid and assigned to the merchant
  When the merchant applies "LAUNCH50" during checkout
  Then getPlanPricingBreakdown returns the discounted price successfully
```

### FR-5: Tier Matching in Validation

```gherkin
Scenario: Merchant on GROW plan cannot use SCALE-tier AUTO promo
  Given a promo code exists with assignment_type "AUTO" and tier "SCALE"
  And the merchant's current plan is "GROW"
  When the merchant applies this promo code during checkout
  Then getPlanPricingBreakdown returns an error
  And the error message indicates the promo is not valid for their plan

Scenario: Merchant on LAUNCH plan can use ALL-tier AUTO promo
  Given a promo code exists with assignment_type "AUTO" and tier "ALL"
  And the merchant's current plan is "LAUNCH"
  When the merchant applies this promo code
  Then getPlanPricingBreakdown returns the discounted price successfully
```

### FR-6 & FR-7: Admin UI Dropdown Updates

```gherkin
Scenario: Tier dropdown in create form shows only new tier values
  Given I am on the Admin Rewards page
  When I open the Create Promo Code modal
  And I set Assignment Type to "AUTO"
  Then the Tier dropdown shows: ALL, LAUNCH, GROW, SCALE
  And does not show: FREE, PLUS, PRO, PREMIUM

Scenario: Merchant list plan filter shows new plan names
  Given I am on the Admin Rewards page
  When I view the merchant list panel
  Then the Plan Filter dropdown shows: TRIAL, LAUNCH, GROW, SCALE, SUSPENDED

Scenario: Filtering merchants by LAUNCH plan shows only LAUNCH merchants
  Given merchants exist with plan types TRIAL, LAUNCH, GROW, SCALE
  When I select "LAUNCH" in the plan filter
  Then only LAUNCH plan merchants are shown in the merchant list
```

### FR-8: Currency Display Updated to USD

```gherkin
Scenario: Create promo form shows USD currency symbol
  Given I am on the Admin Rewards page
  When I open the Create Promo Code modal
  And I select promo type "Flat"
  Then the value field is labeled with "$" (USD) not "₱" (PHP)

Scenario: Promo list table shows USD for flat promo values
  Given a flat promo code exists with value 29
  When I view the promo code list on the Rewards page
  Then the value is displayed as "$29" not "₱29"
```

### FR-9 & FR-10: OG Merchant Promo and Bulk Assignment

```gherkin
Scenario: OG Merchant promo auto-assigns to migrating Free merchant
  Given the OG Merchant promo code exists with tier "ALL", type "percent", value 50, cycle_duration 3
  And the merchant was on the Free plan (Suspended state)
  And the bulk assignment job ran at T-60
  When the merchant selects the LAUNCH plan during checkout
  Then the OG Merchant promo is pre-associated in store_to_rewards
  And applying the promo yields a 50% discount

Scenario: OG Merchant promo applies correct price for first 3 cycles
  Given the merchant is on LAUNCH monthly with OG Merchant promo applied
  When billing cycle 1 invoice is generated
  Then the invoice amount is $14.50 (50% off $29)
  When billing cycle 3 invoice is generated
  Then the invoice amount is $14.50
  When billing cycle 4 invoice is generated
  Then the invoice amount is $29.00 (full price, promo expired)

Scenario: Bulk assignment is idempotent
  Given the bulk assignment job ran once for storeId "ABC"
  When the bulk assignment job runs again for storeId "ABC"
  Then no duplicate store_to_rewards record is created
```

### FR-11: Migration Promo Expiry Background Job

```gherkin
Scenario: Daily job soft-deletes promo codes past their valid_until date
  Given a promo code exists with valid_until "2026-03-01" and is_trashed false
  And today is 2026-03-22
  When the migration-promo-expiry job runs
  Then the promo code's is_trashed field is set to true

Scenario: Job does not affect promos that have not yet expired
  Given a promo code exists with valid_until "2026-12-31" and is_trashed false
  When the migration-promo-expiry job runs today (2026-03-22)
  Then the promo code's is_trashed field remains false

Scenario: Job is idempotent — re-running does not produce errors
  Given a promo code was already expired (is_trashed true) by a previous job run
  When the migration-promo-expiry job runs again
  Then no errors occur and the record is not modified again

Scenario: Job logs count of records expired per run
  Given 5 promo codes have valid_until dates in the past
  When the migration-promo-expiry job runs
  Then the job log contains "Expired 5 promo codes"
```

---

# Traceability Map

| FR | Gherkin Scenario(s) | Notes |
|---|---|---|
| FR-1 | "Admin creates a promo code with new LAUNCH tier", "Legacy promo code with PRO tier displays correctly" | Enum extension + UI |
| FR-2 | "GROW plan merchant gets auto-associated", "TRIAL plan merchant only gets ALL-tier promos", "LAUNCH plan merchant is associated with ALL and LAUNCH" | associateStoreWithAutoRewards logic |
| FR-3 | "Flat promo reduces LAUNCH monthly price", "Percent promo reduces GROW monthly price", "100% flat promo activates for free", "Final price cannot be negative" | USD pricing table |
| FR-4 | "Merchant with active subscription cannot reuse promo", "Merchant with no active subscription can use promo" | Unified plan_subscriptions query |
| FR-5 | "Merchant on GROW cannot use SCALE-tier promo", "Merchant on LAUNCH can use ALL-tier promo" | Tier matching in validation |
| FR-6 | "Tier dropdown shows only new tier values", "Filtering merchants by LAUNCH plan" | Admin UI tier dropdown |
| FR-7 | "Merchant list plan filter shows new plan names" | Admin UI plan filter |
| FR-8 | "Create promo form shows USD symbol", "Promo list shows USD for flat values" | Currency label updates |
| FR-9 | "OG Merchant promo auto-assigns to migrating merchant", "OG Merchant promo applies correct price for first 3 cycles" | OG Merchant promo definition |
| FR-10 | "Bulk assignment is idempotent" | T-60 bulk assignment |
| FR-11 | "Daily job soft-deletes expired promos", "Job does not affect unexpired promos", "Job is idempotent", "Job logs count" | Expiry background job |
