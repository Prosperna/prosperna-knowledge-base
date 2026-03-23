---
id: st-12-admin-control-platform-updates
title: PRD. ST-12 Admin Control Platform Updates
sidebar_label: ST-12 Admin Control Platform Updates
sidebar_position: 12
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Summary

ST-12 updates Prosperna's Admin Control Platform to support the pricing restructuring initiative. It covers five existing admin screens that require changes and introduces four manual override tools accessible from the Accounts List page. Three new dashboards (Migration Tracking, Enforcement, Cancellation Analytics) are **deferred** to a future release.

The updates are delivered as a single cohesive feature within the `prosperna1` React SPA (admin `/` routes), backed by `admin-service-api`, `business-profile-api`, `payment-integration-api`, and `orders-service-api`.

---

## User Journey

### Happy Path

**Scenario: Finance admin reconciles Stripe invoices for a specific merchant**

1. Finance admin navigates to `/admin/accounts` and searches for a merchant by name.
2. Admin sees the updated table with Plan Type (`LAUNCH`), Status (`Active`), and Payment Gateway (`Stripe`) columns.
3. Admin clicks `...` → Invoices to open `/admin/accounts/:accountId/invoices`.
4. Admin toggles the currency selector to **USD** — only USD invoices are shown.
5. Admin sees the **Payment Gateway** column (`Stripe`) in the Billing Invoices tab.
6. Admin exports CSV — the export includes the Payment Gateway column.
7. Admin cross-references the exported data with the Stripe Dashboard for reconciliation.

**Scenario: Support admin extends a trial for a merchant**

1. Support admin navigates to `/admin/accounts` and filters by **Status: Trial**.
2. Admin finds the merchant and opens the `...` menu — sees **Extend Trial** action (visible only because `payPlanType === 'TRIAL'`).
3. Admin clicks Extend Trial — a modal opens showing the current trial end date.
4. Admin enters `14` in the Extension (Days) field; the computed New Trial End Date updates automatically.
5. Admin types a reason: "Merchant requested more time for onboarding."
6. Admin clicks Confirm — the API call is made; the trial end date is updated; background jobs are rescheduled.
7. An audit log entry is written. The Accounts List row reflects the new Trial Expiry Date.

**Scenario: Operations admin creates a new promo code for LAUNCH plan**

1. Operations admin navigates to `/admin/rewards`.
2. Admin clicks **Create Promo Code** in the right panel.
3. In the **Assignment Subscription Tier** dropdown, the admin sees: `ALL`, `LAUNCH`, `GROW`, `SCALE` (old names are not shown for new creation).
4. Admin selects `LAUNCH`, fills in the code name, type, value, and validity dates.
5. Admin saves — the promo code is created and appears in the listing with tier `LAUNCH`.

---

### Alternate and Failure Paths

| Path | Trigger | Behavior |
|---|---|---|
| Extend Trial — missing reason | Admin submits modal without a reason | Form validation error: "Reason is required." API call blocked. |
| Extend Trial — non-TRIAL merchant | Admin attempts Extend Trial on Active/Suspended merchant | Action not visible in `...` menu (conditional rendering guard). |
| Reactivate — non-Super Admin tries Bypass Payment | Admin without `merchants.bypass_payment` permission opens the Reactivate modal | **Bypass Payment toggle is not rendered**. Server also rejects if param is sent without permission. |
| Reactivate — no bypass, merchant declined payment | Admin reactivates without bypass; merchant payment link bounces | Subscription remains pending; admin can retry or use bypass (Super Admin only). |
| Reset Usage — merchant on Trial/Suspended | Admin attempts Reset Usage on non-paid-plan merchant | Action not visible in `...` menu (conditional rendering guard). |
| Apply Promo — tier mismatch, no override | Admin selects a promo with a tier that doesn't match the merchant's plan | Validation error displayed in modal: "Promo tier does not match merchant plan. Enable Override Tier Check to proceed." |
| Unified transactions — payment_gateway field absent | Legacy order record has no `payment_gateway` field | Payment Gateway column displays "N/A" for that row. |
| Promo code listing — old tier record | Admin views existing promo created before migration | Tier column shows original value (e.g., `PRO`); this is read-only and expected. |
| CSV export — currency mismatch | Finance admin exports while currency toggle is on USD | Export contains only USD-currency rows. PHP rows excluded. |

---

## Functional Requirements

### Accounts List Page

**FR-1** — Update the Plan Type filter dropdown to include new values: `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED`. Retain `FREE`, `PLUS`, `PRO`, `PREMIUM`, `PREMIUM_TRIAL` as selectable filter options for the duration of the migration window (they persist indefinitely for historical records).

**FR-2** — Add a separate **Status** filter dropdown with values: `All`, `Trial`, `Active`, `Suspended`. This filter is independent of the Plan Type filter.

**FR-3** — Add the following new columns to the Accounts List table:

| Column | Source | Visibility Rule |
|---|---|---|
| Status | Derived from `payPlanType` | Always visible |
| Trial Expiry Date | `merchant_trial_info.trial_end_date` | Shown only when `payPlanType === 'TRIAL'`; null/hidden otherwise |
| Payment Gateway | `plan_subscriptions.payment_gateway` | Always visible; displays "N/A" for trial/suspended/missing |
| Suspension Reason | `stores.suspendedReason` | Shown only when `payPlanType === 'SUSPENDED'`; hidden otherwise |
| Suspended Date | `stores.suspendedAt` | Shown only when `payPlanType === 'SUSPENDED'`; hidden otherwise |

**FR-4** — Add the following conditional row actions to the `...` menu on each account row:

| Action | Visibility Condition |
|---|---|
| Extend Trial | `payPlanType === 'TRIAL'` only |
| Reactivate Account | `payPlanType === 'SUSPENDED'` only |
| Reset Usage Limits | `payPlanType` is one of `LAUNCH`, `GROW`, `SCALE` |
| Apply Promo Code | Always visible |

---

### Account Invoices Page

**FR-5** — Add a **Payment Gateway** column to all three invoice tabs (Billing Invoices, Marketplace Invoices, Top-Up Invoices). Source: `plansubscriptioninvoices.payment_gateway`. Display "N/A" when the field is absent on legacy records.

**FR-6** — The Plan Type column on the Billing Invoices tab must display both legacy values (`PLUS`, `PRO`, `PREMIUM`) for historical records and new values (`LAUNCH`, `GROW`, `SCALE`) for new records. No retroactive renaming.

**FR-7** — Apply the existing currency toggle to the invoice list. When currency is set to **USD**, show only USD-currency invoice records. When set to **PHP**, show only PHP-currency records. No conversion is performed.

---

### Admin Transactions Page

**FR-8** — Add an explicit **Payment Gateway** column to the transactions table, showing `Stripe` or `Xendit` per row. Display "N/A" when the field is absent on legacy records.

**FR-9** — Add a **Payment Gateway** filter above the transactions table with values: `All`, `Stripe`, `Xendit`. This filter is independent of the existing Country filter (PH/US).

**FR-10** — The transactions list must aggregate data from both Stripe and Xendit as a unified dataset. Sorting and server-side pagination must work correctly across the unified dataset. CSV export must include the Payment Gateway column.

**FR-11** — The three convenience fee columns (**Convenience Fee**, **Convenience Fee (Customer)**, **Convenience Fee (Merchant)**) remain in the table. For new orders created post-migration, all three columns display `$0.00`. For historical (pre-migration) orders, columns display original values. No column is removed.

---

### Transaction Report (Detail) Page

**FR-12** — The three convenience fee fields remain in the detail view. For new orders post-migration, all three display `$0.00`. For historical orders, original values are preserved.

**FR-13** — The **Prosperna Earning** field calculation is updated: for new orders post-migration, this field displays `$0.00` (platform revenue shifts to subscriptions/overages). For historical orders, the original calculation is preserved. The Stripe `application_fee_amount` field also shows `$0.00` for new US orders.

**FR-14** — Add a **Payment Gateway** field in the detail header, showing `Stripe` or `Xendit`. Displays "N/A" for legacy records without the field.

---

### Rewards / Promo Codes Page

**FR-15** — For **creating new promo codes**, the Assignment Subscription Tier dropdown must only present: `ALL`, `LAUNCH`, `GROW`, `SCALE`. Old values (`FREE`, `PLUS`, `PRO`, `PREMIUM`) must not be selectable during new promo creation.

**FR-16** — In the promo code **listing table**, the Tier column retains original values for historical records (e.g., `PRO`, `PREMIUM`). These are read-only display values and are not retroactively renamed.

**FR-17** — Update the **left panel Merchant Plan Filter** from: `ALL`, `FREE`, `PLUS`, `PRO`, `PREMIUM` → to: `ALL`, `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED`.

**FR-18** — Update the promo validation logic in `getPlanPricingBreakdown()` to support new plan names (`LAUNCH`, `GROW`, `SCALE`) and USD pricing. Update `associateStoreWithAutoRewards()` AUTO assignment matching to use new tier names.

---

### Manual Override Tools

**FR-19 — Extend Trial**

Available from `...` menu when `payPlanType === 'TRIAL'`. Modal fields:

| Field | Type | Behavior |
|---|---|---|
| Current Trial End Date | Read-only | Shows `merchant_trial_info.trial_end_date` |
| Extension (Days) | Number input | Required; positive integer |
| New Trial End Date | Read-only computed | Current end date + extension days; updates live |
| Reason | Text input | Required; minimum 10 characters |

On confirm: `POST /admin/merchants/:id/extend-trial` → backend updates `trial_end_date`, reschedules expiry background job and drip email campaign. Audit log entry written.

**FR-20 — Reactivate Suspended Account**

Available from `...` menu when `payPlanType === 'SUSPENDED'`. Modal fields:

| Field | Type | Behavior |
|---|---|---|
| Suspension Reason | Read-only | Shows `stores.suspendedReason` |
| Suspended Since | Read-only | Shows `stores.suspendedAt` |
| Last Active Plan | Read-only | Shows `stores.lastActivePlan` |
| Reactivate To Plan | Dropdown | Required; options: `LAUNCH`, `GROW`, `SCALE` |
| Bypass Payment | Toggle | **Only rendered for admins with `merchants.bypass_payment` permission (Super Admin only)** |
| Reason | Text input | Required; minimum 10 characters |

On confirm: `POST /admin/merchants/:id/reactivate`. If Bypass Payment enabled: calls `reactivateMerchant()` directly. If not: creates pending subscription and sends payment link. Audit log entry written.

**FR-21 — Apply Promo Code**

Available from `...` menu on any account row (always visible). Modal fields:

| Field | Type | Behavior |
|---|---|---|
| Store Name | Read-only | The merchant's store name |
| Current Plan | Read-only | The merchant's current plan |
| Promo Code | Dropdown/Search | Required; select from existing active promo codes |
| Override Tier Check | Toggle | Optional; if enabled, bypasses tier-plan match validation |
| Reason | Text input | Required; minimum 10 characters |

On confirm: `POST /v1/admin/rewards/:id/assign`. If override tier check enabled: tier validation is skipped. Audit log entry written.

**FR-22 — Reset Usage Limits**

Available from `...` menu when `payPlanType` is one of `LAUNCH`, `GROW`, `SCALE`. Modal fields:

| Field | Type | Behavior |
|---|---|---|
| Current Usage | Read-only table | Orders count/limit, bandwidth used/limit, storage used/limit |
| Enforcement State | Read-only | Current state: Normal, Warning, Urgent, Grace, Throttled |
| Reset To | Read-only notice | "All counters will be reset to 0. Enforcement state will be set to Normal." |
| Reason | Text input | Required; minimum 10 characters |

On confirm: `POST /admin/merchants/:id/reset-usage` → backend resets `merchant_usage` counters to 0 for current billing period; resets `merchant_enforcement_state` to `normal`; clears all stage timestamps. Audit log entry written.

**FR-23** — All four override actions must produce an audit log entry containing: `adminUserId`, `timestamp` (ISO 8601), `actionType`, `targetMerchantId`, and `reason`.

**FR-24** — The **Bypass Payment** toggle in the Reactivate modal must only be rendered for admin users with the `merchants.bypass_payment` CASL permission, which is exclusively assigned to the Super Admin role. The corresponding API endpoint must also enforce this permission server-side.

---

## Non-Functional Requirements

**NFR-1** — API response times for list endpoints (Accounts List, Invoice List, Transactions List) must follow the project's global performance standards. No custom SLA is defined for ST-12.

**NFR-2** — Paginated list endpoints must return stable, consistent results across pages when a sort order is applied (i.e., no items skipped or duplicated due to pagination cursor drift).

**NFR-3** — CSV exports from the Admin Transactions and Account Invoices views must include all visible table columns, including the new Payment Gateway column.

**NFR-4** — All override action endpoints must be safe to retry without unintended side effects (idempotent or guarded by state checks).

**NFR-5** — Audit log entries for all override actions must be persisted to the backend log. No admin-facing log viewer UI is required for v1.

**NFR-6** — All new CASL permissions (`merchants.extend_trial`, `merchants.reactivate`, `merchants.reset_usage`, `merchants.bypass_payment`, `rewards.assign`) must be enforced **server-side** in addition to client-side UI gating.

**NFR-7** — The Payment Gateway field must display "N/A" gracefully when the field is absent (legacy records, trial merchants, suspended merchants without a subscription).

**NFR-8** — The unified transaction and invoice views must work correctly when records from both Stripe and Xendit are present in the same paginated result set.

---

## UX Notes

- **Conditional column visibility** on the Accounts List: Trial Expiry Date, Suspension Reason, and Suspended Date columns should be hidden (not just blank) for rows where they do not apply, to avoid visual clutter. Alternatively, use a secondary row detail/drawer approach if the column count becomes unwieldy.
- **Bypass Payment toggle**: Even for Super Admin users, consider placing a warning label next to the toggle: "This action bypasses payment collection. Use only for verified support cases."
- **Override modals**: All four modals should have a two-step confirmation pattern — "Review → Confirm" — to reduce accidental submissions.
- **Reason field**: Minimum 10-character validation should show a character count hint (e.g., "8/10 min characters").
- **New Trial End Date**: The computed date field in the Extend Trial modal should update debounced (250ms) as the user types in the Extension field to avoid jank.
- **Currency toggle**: Apply the same toggle component currently used in the existing invoice/transaction views. Ensure it is visible and labeled clearly (e.g., "Show: USD | PHP").
- **Legacy plan name labels**: In filter dropdowns that still include old plan names for historical access, consider grouping them under an "Legacy Plans" optgroup or appending "(Legacy)" to avoid confusion with new plan names.

---

## Data Model Notes

### Fields consumed from upstream subtasks (ST-01, ST-03, ST-04)

| Field | Collection/Document | Source Subtask | Usage in ST-12 |
|---|---|---|---|
| `payment_gateway` | `plansubscriptioninvoices` | ST-01 | Payment Gateway column on invoices and transactions |
| `payPlanType` | `stores` | ST-01/ST-03/ST-04 | Status display, conditional row action visibility |
| `trial_end_date` | `merchant_trial_info` | ST-03 | Trial Expiry Date column; Extend Trial modal read-only field |
| `suspendedReason` | `stores` | ST-04 | Suspension Reason column; Reactivate modal read-only field |
| `suspendedAt` | `stores` | ST-04 | Suspended Date column; Reactivate modal read-only field |
| `lastActivePlan` | `stores` | ST-04 | Reactivate modal read-only field |
| `merchant_usage` | `merchant_usage` | ST-06 | Reset Usage modal current usage display |
| `merchant_enforcement_state` | `merchant_enforcement_state` | ST-06 | Reset Usage modal enforcement state display |

### Fields written by ST-12 (via override tools)

| Field | Collection | Written By |
|---|---|---|
| `trial_end_date` | `merchant_trial_info` | Extend Trial endpoint |
| `payPlanType` | `stores` | Reactivate endpoint |
| Promo code assignment record | `store_rewards` (or equivalent) | Apply Promo Code endpoint |
| `merchant_usage` counters | `merchant_usage` | Reset Usage endpoint |
| `merchant_enforcement_state` | `merchant_enforcement_state` | Reset Usage endpoint |
| Audit log entry | `admin_audit_log` (new or existing) | All four override endpoints |

---

## Integrations and APIs

| Integration | Type | Purpose |
|---|---|---|
| `business-profile-api` | REST (internal) | Extend Trial, Reactivate Account, Merchant account data |
| `payment-integration-api` | REST (internal) | Unified invoice list, unified transaction list, subscription gateway data |
| `admin-service-api` | REST (internal) | Rewards/promo CRUD, promo code assignment |
| `orders-service-api` | REST (internal) | Reset Usage Limits, `merchant_usage` and `merchant_enforcement_state` |
| CASL (frontend permission system) | Library | Permission checks for override tool visibility |
| Existing currency toggle component | Frontend | Reused for invoice and transaction currency filtering |

---

## Error Handling

| Error Case | User-Facing Message | Technical Handling |
|---|---|---|
| Override API call fails (5xx) | "An error occurred. Please try again." | Display generic error in modal footer; do not close modal |
| Override API call fails — insufficient permission (403) | "You do not have permission to perform this action." | Display in modal; log to console for debugging |
| Override API call fails — merchant not found (404) | "Merchant record not found. Refresh and try again." | Display in modal |
| Override API call fails — invalid state (409) | "This action is not valid for the merchant's current state." | Display in modal; e.g., trying to extend trial on non-TRIAL merchant |
| Reason field too short | "Reason must be at least 10 characters." | Inline validation before API call |
| Unified transaction list — query timeout | "Results are taking longer than expected. Try narrowing your date range." | Show in table empty state area |
| Payment gateway field absent | Display "N/A" | No error; graceful fallback |

---

## Telemetry and Analytics

| Event | Trigger | Properties |
|---|---|---|
| `admin.extend_trial.submitted` | Admin confirms Extend Trial | `merchantId`, `extensionDays`, `newEndDate`, `adminId` |
| `admin.reactivate_account.submitted` | Admin confirms Reactivate | `merchantId`, `targetPlan`, `bypassPayment`, `adminId` |
| `admin.apply_promo.submitted` | Admin confirms Apply Promo | `merchantId`, `promoCodeId`, `overrideTierCheck`, `adminId` |
| `admin.reset_usage.submitted` | Admin confirms Reset Usage | `merchantId`, `adminId` |
| `admin.accounts_list.filtered` | Admin applies Status or Plan Type filter | `filterType`, `filterValue` |
| `admin.invoices.gateway_filter_applied` | Admin filters invoices by Payment Gateway | `gatewayValue`, `merchantId` |
| `admin.transactions.gateway_filter_applied` | Admin filters transactions by Payment Gateway | `gatewayValue` |

---

## Rollout Plan

1. **Phase 1 — Screen updates (no blocking dependencies):** Deploy Accounts List column and filter updates (using only existing data), Rewards/Promo tier dropdown changes, and convenience fee zero-out behavior. These changes do not require ST-01/03/04 to be complete.
2. **Phase 2 — Payment Gateway visibility (depends on ST-01):** Deploy Payment Gateway columns and filters on Account Invoices, Admin Transactions, and Transaction Report Detail after ST-01 delivers the `payment_gateway` field.
3. **Phase 3 — Override tools (depends on ST-03, ST-04, ST-06):** Deploy all four override tools after their respective dependent subtasks have delivered the required collections and service functions.
4. **Phase 4 — Post-migration:** Monitor audit logs for override tool usage patterns. Deferred dashboards (Migration Tracking, Enforcement, Cancellation Analytics) to follow in a subsequent release.

---

## Open Questions

| ID | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Should the Accounts List table hide conditional columns (Trial Expiry Date, Suspension Reason, Suspended Date) entirely when not applicable to a row, or show them as blank/dash? | Product/UX | Open |
| OQ-2 | Is there a requirement to surface the audit log entries in the admin UI in a future release, or is backend-only sufficient long-term? | Product | Open |
| OQ-3 | For the Reactivate override — should admins be able to choose a billing type (Monthly/Annual) in addition to plan tier, or default to Monthly? | Product | Open |
| OQ-4 | Should the old plan name filter values (`FREE`, `PLUS`, `PRO`, `PREMIUM`) be labeled as "(Legacy)" in the filter dropdown to distinguish them from new values? | Product/UX | Open |
| OQ-5 | Is there a max extension limit for Extend Trial (e.g., max 30 days per extension, max 3 extensions per merchant)? | Product | Open |

---

# Gherkin User Stories

## Feature: ST-12 Admin Control Platform Updates

---

### FR-1, FR-2: Accounts List — Updated Filters

```gherkin
Feature: Accounts List Plan and Status Filters

  Scenario: Admin filters accounts by new plan type LAUNCH
    Given I am logged in as an admin
    And I am on the Accounts List page
    When I open the Plan Type filter dropdown
    Then I should see "TRIAL", "LAUNCH", "GROW", "SCALE", "SUSPENDED" as selectable options
    And I should also see "FREE", "PLUS", "PRO", "PREMIUM", "PREMIUM_TRIAL" as selectable options for historical access
    When I select "LAUNCH"
    Then only merchant accounts with payPlanType "LAUNCH" should be displayed in the table

  Scenario: Admin filters accounts by status Suspended
    Given I am logged in as an admin
    And I am on the Accounts List page
    When I open the Status filter dropdown
    Then I should see "All", "Trial", "Active", "Suspended" as options
    When I select "Suspended"
    Then only merchant accounts with payPlanType "SUSPENDED" should be displayed

  Scenario: Admin applies both Plan Type and Status filters simultaneously
    Given I am logged in as an admin
    And I am on the Accounts List page
    When I select Plan Type "LAUNCH" and Status "Active"
    Then only merchants matching both criteria should be displayed
    And the filters operate independently of each other

  Scenario: Admin filters by legacy plan type FREE to find pre-migration merchants
    Given there are merchants with payPlanType "FREE" in the system (pre-migration)
    And I am on the Accounts List page
    When I select Plan Type "FREE" from the filter
    Then merchants with payPlanType "FREE" should be displayed
```

---

### FR-3: Accounts List — New Columns

```gherkin
Feature: Accounts List New Columns

  Scenario: Status column reflects merchant payPlanType correctly
    Given I am on the Accounts List page
    When I view a merchant with payPlanType "LAUNCH"
    Then the Status column for that merchant should display "Active"
    When I view a merchant with payPlanType "TRIAL"
    Then the Status column should display "Trial"
    When I view a merchant with payPlanType "SUSPENDED"
    Then the Status column should display "Suspended"

  Scenario: Trial Expiry Date column visible for trial merchants only
    Given I am on the Accounts List page
    When I view a merchant with payPlanType "TRIAL"
    Then the Trial Expiry Date column should show the value of merchant_trial_info.trial_end_date
    When I view a merchant with payPlanType "LAUNCH"
    Then the Trial Expiry Date column should be hidden or display no value for that row

  Scenario: Payment Gateway column shows correct gateway
    Given I am on the Accounts List page
    When I view a merchant with an active Stripe subscription
    Then the Payment Gateway column should display "Stripe"
    When I view a merchant with an active Xendit subscription
    Then the Payment Gateway column should display "Xendit"
    When I view a trial merchant with no subscription
    Then the Payment Gateway column should display "N/A"
    When I view a legacy record without a payment_gateway field
    Then the Payment Gateway column should display "N/A"

  Scenario: Suspension Reason and Suspended Date visible for suspended merchants only
    Given I am on the Accounts List page
    When I view a merchant with payPlanType "SUSPENDED"
    Then the Suspension Reason column should show stores.suspendedReason
    And the Suspended Date column should show stores.suspendedAt
    When I view an active merchant with payPlanType "GROW"
    Then Suspension Reason and Suspended Date should be hidden or empty for that row
```

---

### FR-4: Accounts List — Conditional Row Actions

```gherkin
Feature: Accounts List Conditional Row Actions

  Scenario: Extend Trial action only visible for trial merchants
    Given I am on the Accounts List page
    When I open the "..." menu for a merchant with payPlanType "TRIAL"
    Then I should see "Extend Trial" in the action menu
    When I open the "..." menu for a merchant with payPlanType "LAUNCH"
    Then I should NOT see "Extend Trial" in the action menu

  Scenario: Reactivate Account action only visible for suspended merchants
    Given I am on the Accounts List page
    When I open the "..." menu for a merchant with payPlanType "SUSPENDED"
    Then I should see "Reactivate Account" in the action menu
    When I open the "..." menu for a merchant with payPlanType "GROW"
    Then I should NOT see "Reactivate Account" in the action menu

  Scenario: Reset Usage Limits action visible only for paid plan merchants
    Given I am on the Accounts List page
    When I open the "..." menu for a merchant with payPlanType "SCALE"
    Then I should see "Reset Usage Limits" in the action menu
    When I open the "..." menu for a merchant with payPlanType "TRIAL"
    Then I should NOT see "Reset Usage Limits" in the action menu
    When I open the "..." menu for a merchant with payPlanType "SUSPENDED"
    Then I should NOT see "Reset Usage Limits" in the action menu

  Scenario: Apply Promo Code action always visible
    Given I am on the Accounts List page
    When I open the "..." menu for any merchant regardless of plan type
    Then I should see "Apply Promo Code" in the action menu
```

---

### FR-5, FR-6, FR-7: Account Invoices — Payment Gateway Column and Currency Toggle

```gherkin
Feature: Account Invoices Payment Gateway and Currency

  Scenario: Payment Gateway column appears on Billing Invoices tab
    Given I am viewing invoices for a merchant
    When I am on the "Billing Invoices" tab
    Then a "Payment Gateway" column should be present in the table
    And rows with Stripe invoices should show "Stripe"
    And rows with Xendit invoices should show "Xendit"
    And legacy rows without a payment_gateway field should show "N/A"

  Scenario: Legacy plan names preserved on historical invoice records
    Given a merchant has historical invoices with plan type "PRO"
    When I view the Billing Invoices tab
    Then the Plan Type column should display "PRO" for those historical records
    And new invoices for the same merchant show "GROW"
    And both values coexist in the same table

  Scenario: Currency toggle filters invoices to USD only
    Given a merchant has both PHP historical invoices and USD new invoices
    When I toggle the currency selector to "USD"
    Then only USD-currency invoices should be displayed
    And PHP invoices should not appear

  Scenario: Currency toggle filters invoices to PHP only
    Given a merchant has both PHP and USD invoices
    When I toggle the currency selector to "PHP"
    Then only PHP-currency invoices should be displayed
    And USD invoices should not appear
```

---

### FR-8, FR-9, FR-10: Admin Transactions — Unified View and Payment Gateway

```gherkin
Feature: Admin Transactions Unified View

  Scenario: Payment Gateway column displays on transactions table
    Given I am on the Admin Transactions page
    Then a "Payment Gateway" column should be visible in the transactions table
    And Stripe transactions should display "Stripe"
    And Xendit transactions should display "Xendit"
    And legacy records without the field should display "N/A"

  Scenario: Admin filters transactions by Payment Gateway Stripe
    Given I am on the Admin Transactions page
    When I select "Stripe" from the Payment Gateway filter
    Then only transactions processed through Stripe should be displayed
    And the Country filter remains independently operable

  Scenario: Admin filters transactions by Payment Gateway Xendit
    Given I am on the Admin Transactions page
    When I select "Xendit" from the Payment Gateway filter
    Then only transactions processed through Xendit should be displayed

  Scenario: Unified dataset includes both Stripe and Xendit transactions
    Given there are transactions from both Stripe and Xendit in the system
    When I am on the Admin Transactions page with filter set to "All"
    Then both Stripe and Xendit transactions should appear in the same list
    And pagination and sorting should work correctly across the unified dataset

  Scenario: CSV export includes Payment Gateway column
    Given I am on the Admin Transactions page
    When I click the CSV export button
    Then the exported file should contain a "Payment Gateway" column
    And the column values should match what is displayed in the UI
```

---

### FR-11: Admin Transactions — Convenience Fee Behavior

```gherkin
Feature: Admin Transactions Convenience Fee Columns

  Scenario: New post-migration orders show zero convenience fees
    Given an order was created after the pricing migration date
    When I view that order on the Admin Transactions page
    Then the "Convenience Fee" column should display "$0.00"
    And the "Convenience Fee (Customer)" column should display "$0.00"
    And the "Convenience Fee (Merchant)" column should display "$0.00"

  Scenario: Historical pre-migration orders show original convenience fees
    Given an order was created before the pricing migration date
    When I view that order on the Admin Transactions page
    Then the convenience fee columns should display the original historical values
    And the columns are not removed from the table

  Scenario: Convenience fee columns always present in table structure
    Given I am on the Admin Transactions page
    Then the table should always contain columns for "Convenience Fee", "Convenience Fee (Customer)", and "Convenience Fee (Merchant)"
    Regardless of whether the displayed orders are pre- or post-migration
```

---

### FR-12, FR-13, FR-14: Transaction Report Detail — Updated Fields

```gherkin
Feature: Transaction Report Detail Updated Fields

  Scenario: New order detail shows zero convenience fees and Prosperna Earning
    Given I click on a post-migration order from the Admin Transactions page
    When the Transaction Report detail page loads
    Then Convenience Fee should display "$0.00"
    And Convenience Fee (Customer portion) should display "$0.00"
    And Convenience Fee (Merchant portion) should display "$0.00"
    And Prosperna Earning should display "$0.00"

  Scenario: Historical order detail preserves original values
    Given I click on a pre-migration order
    When the Transaction Report detail page loads
    Then convenience fee fields should display their original historical values
    And Prosperna Earning should display the original calculated value

  Scenario: Payment Gateway field appears in detail header
    Given I am viewing any Transaction Report detail page
    Then a "Payment Gateway" field should be visible in the detail header
    And it should show "Stripe" or "Xendit" based on the order record
    And legacy records without the field should show "N/A"
```

---

### FR-15, FR-16, FR-17: Rewards / Promo Codes — Tier Updates

```gherkin
Feature: Rewards Promo Code Tier Dropdown Updates

  Scenario: New promo code creation shows only new tier names
    Given I am on the Rewards / Promo Codes page
    When I open the Create Promo Code form
    And I open the "Assignment Subscription Tier" dropdown
    Then I should see: "ALL", "LAUNCH", "GROW", "SCALE"
    And I should NOT see: "FREE", "PLUS", "PRO", "PREMIUM"

  Scenario: Existing promo codes in listing retain original tier labels
    Given there are promo codes created before migration with tier "PRO"
    When I view the promo code listing table
    Then the Tier column for those historical records should display "PRO"
    And this value is read-only and not retroactively changed

  Scenario: Left panel merchant filter uses new plan values
    Given I am on the Rewards / Promo Codes page
    When I open the Plan filter in the left merchant panel
    Then I should see: "ALL", "TRIAL", "LAUNCH", "GROW", "SCALE", "SUSPENDED"
    And old values "FREE", "PLUS", "PRO", "PREMIUM" should not appear in this filter
```

---

### FR-18: Promo Validation with New Tier Names

```gherkin
Feature: Promo Code Validation with New Plan Names

  Scenario: AUTO assignment associates promo correctly for LAUNCH merchants
    Given a promo code is configured with Assignment Type "AUTO" and Tier "LAUNCH"
    When a merchant with payPlanType "LAUNCH" subscribes
    Then the associateStoreWithAutoRewards function should match the promo to that merchant

  Scenario: Promo pricing breakdown supports USD for new plans
    Given a promo code offers 50% off with tier "GROW"
    When getPlanPricingBreakdown is called for a GROW plan merchant in USD
    Then the discount is calculated correctly against the USD GROW plan price
    And no PHP-specific pricing logic is applied
```

---

### FR-19: Extend Trial Override

```gherkin
Feature: Extend Trial Override Tool

  Scenario: Admin successfully extends a trial merchant's end date
    Given I am on the Accounts List page
    And there is a merchant with payPlanType "TRIAL" and trial_end_date "2026-04-01"
    When I open the "..." menu and click "Extend Trial"
    Then a modal opens showing Current Trial End Date as "2026-04-01"
    When I enter "14" in the Extension (Days) field
    Then New Trial End Date should automatically show "2026-04-15"
    When I enter "Merchant requested more time for onboarding." as reason
    And I click Confirm
    Then a POST /admin/merchants/:id/extend-trial request is made with extension_days: 14 and the reason
    And the modal closes
    And the Accounts List row shows Trial Expiry Date "2026-04-15"
    And an audit log entry is written with adminUserId, timestamp, actionType: "extend_trial", merchantId, and reason

  Scenario: Admin cannot confirm Extend Trial without providing a reason
    Given the Extend Trial modal is open
    When I enter extension days but leave the Reason field empty
    And I click Confirm
    Then the form shows "Reason is required."
    And no API call is made

  Scenario: Reason field enforces minimum character length
    Given the Extend Trial modal is open
    When I enter "too short" (9 characters) in the Reason field
    And I click Confirm
    Then the form shows a minimum character validation error
    And no API call is made

  Scenario: Extend Trial is not available for non-trial merchants
    Given a merchant has payPlanType "GROW"
    When I open the "..." menu for that merchant
    Then "Extend Trial" should not appear in the action list
```

---

### FR-20: Reactivate Suspended Account

```gherkin
Feature: Reactivate Suspended Account Override

  Scenario: Admin reactivates a suspended merchant without bypass
    Given there is a merchant with payPlanType "SUSPENDED", suspendedReason "migration", and lastActivePlan "FREE"
    When I open "Reactivate Account" from the "..." menu
    Then a modal opens showing Suspension Reason, Suspended Since, and Last Active Plan as read-only fields
    When I select "LAUNCH" from the Reactivate To Plan dropdown
    And I enter a reason with at least 10 characters
    And I click Confirm
    Then a POST /admin/merchants/:id/reactivate request is made with plan: "LAUNCH" and bypass_payment: false
    And a pending subscription is created and a payment link is sent to the merchant
    And an audit log entry is written

  Scenario: Super Admin sees and can use Bypass Payment toggle
    Given I am logged in as a Super Admin with merchants.bypass_payment permission
    When I open the Reactivate Account modal
    Then the "Bypass Payment" toggle is visible
    When I enable Bypass Payment and confirm
    Then the API is called with bypass_payment: true
    And the merchant is directly reactivated without a payment step

  Scenario: Non-Super Admin does not see Bypass Payment toggle
    Given I am logged in as a standard admin without merchants.bypass_payment permission
    When I open the Reactivate Account modal
    Then the "Bypass Payment" toggle should NOT be rendered
    And if the API is called with bypass_payment: true programmatically
    Then the server should return 403 Forbidden

  Scenario: Reactivate Account not available for active merchant
    Given a merchant has payPlanType "SCALE"
    When I open the "..." menu
    Then "Reactivate Account" should not appear
```

---

### FR-21: Apply Promo Code Override

```gherkin
Feature: Apply Promo Code Override

  Scenario: Admin successfully applies a matching promo code
    Given a merchant is on the LAUNCH plan
    And there is a promo code with tier "LAUNCH"
    When I open "Apply Promo Code" from the "..." menu
    Then a modal shows Store Name and Current Plan as read-only
    When I select the LAUNCH-tier promo code from the dropdown
    And I enter a reason with at least 10 characters
    And I click Confirm
    Then a POST /v1/admin/rewards/:id/assign request is made
    And an audit log entry is written

  Scenario: Admin applies a promo with tier mismatch and no override
    Given a merchant is on the GROW plan
    And I select a promo code with tier "SCALE"
    And Override Tier Check is disabled
    When I click Confirm
    Then a validation error appears: "Promo tier does not match merchant plan. Enable Override Tier Check to proceed."
    And no API call is made

  Scenario: Admin uses Override Tier Check to bypass tier validation
    Given a merchant is on the GROW plan
    And I select a promo code with tier "SCALE"
    And I enable the Override Tier Check toggle
    And I enter a reason
    When I click Confirm
    Then the API call is made with the override flag
    And tier validation is skipped server-side
    And an audit log entry is written

  Scenario: Apply Promo Code is always visible regardless of plan
    Given a merchant with any payPlanType (TRIAL, LAUNCH, GROW, SCALE, SUSPENDED)
    When I open the "..." menu
    Then "Apply Promo Code" should always be present
```

---

### FR-22: Reset Usage Limits Override

```gherkin
Feature: Reset Usage Limits Override

  Scenario: Admin successfully resets usage limits for a paid plan merchant
    Given a merchant with payPlanType "GROW" is in "Warning" enforcement state
    When I open "Reset Usage Limits" from the "..." menu
    Then a modal opens showing current orders/bandwidth/storage usage and "Warning" enforcement state
    And a notice reads "All counters will be reset to 0. Enforcement state will be set to Normal."
    When I enter a reason with at least 10 characters
    And I click Confirm
    Then a POST /admin/merchants/:id/reset-usage request is made
    And the merchant's usage counters are reset to 0
    And the enforcement state is set to "normal"
    And an audit log entry is written

  Scenario: Reset Usage Limits not available for trial merchant
    Given a merchant with payPlanType "TRIAL"
    When I open the "..." menu
    Then "Reset Usage Limits" should not appear

  Scenario: Reset Usage Limits not available for suspended merchant
    Given a merchant with payPlanType "SUSPENDED"
    When I open the "..." menu
    Then "Reset Usage Limits" should not appear
```

---

### FR-23, FR-24: Audit Logging and Permission Enforcement

```gherkin
Feature: Override Action Audit Logging

  Scenario: Every override action writes an audit log entry
    Given any admin performs any override action (Extend Trial, Reactivate, Apply Promo, Reset Usage)
    When the action is confirmed and the API responds with success
    Then an audit log entry is written containing:
      | field           | value                          |
      | adminUserId     | the performing admin's user ID |
      | timestamp       | current ISO 8601 datetime      |
      | actionType      | the action performed           |
      | targetMerchantId| the affected merchant ID       |
      | reason          | the admin-provided reason text |

  Scenario: Bypass Payment is rejected server-side for non-Super Admin
    Given an admin without the merchants.bypass_payment CASL permission
    When a POST /admin/merchants/:id/reactivate request includes bypass_payment: true
    Then the server should return 403 Forbidden
    And the reactivation should not proceed
    And no audit log entry is written for the failed attempt
```

---

# Traceability Map

| Requirement | Gherkin Scenario(s) | Notes |
|---|---|---|
| FR-1 | Accounts List Plan and Status Filters — S1, S3, S4 | Plan Type filter with new and legacy values |
| FR-2 | Accounts List Plan and Status Filters — S2, S3 | Separate Status filter |
| FR-3 | Accounts List New Columns — S1, S2, S3, S4 | Five new columns with conditional visibility |
| FR-4 | Accounts List Conditional Row Actions — S1, S2, S3, S4 | Four conditional row actions |
| FR-5 | Account Invoices Payment Gateway — S1 | Payment Gateway column on all tabs |
| FR-6 | Account Invoices Payment Gateway — S2 | Legacy plan names preserved |
| FR-7 | Account Invoices Payment Gateway — S3, S4 | Currency toggle filtering |
| FR-8 | Admin Transactions Unified View — S1 | Payment Gateway column |
| FR-9 | Admin Transactions Unified View — S2, S3 | Payment Gateway filter |
| FR-10 | Admin Transactions Unified View — S4, S5 | Unified dataset, CSV export |
| FR-11 | Admin Transactions Convenience Fee Columns — S1, S2, S3 | Zero-out new orders, preserve historical |
| FR-12 | Transaction Report Detail — S1, S2 | Convenience fee fields in detail |
| FR-13 | Transaction Report Detail — S1, S2 | Prosperna Earning zero-out |
| FR-14 | Transaction Report Detail — S3 | Payment Gateway field in header |
| FR-15 | Rewards Promo Code Tier — S1 | New tier names for new promos only |
| FR-16 | Rewards Promo Code Tier — S2 | Legacy labels preserved in listing |
| FR-17 | Rewards Promo Code Tier — S3 | Left panel merchant filter updated |
| FR-18 | Promo Code Validation — S1, S2 | AUTO assignment and USD pricing |
| FR-19 | Extend Trial Override — S1, S2, S3, S4 | Happy path, validation, guard |
| FR-20 | Reactivate Suspended Account — S1, S2, S3, S4 | Happy path, bypass, permission guard |
| FR-21 | Apply Promo Code Override — S1, S2, S3, S4 | Happy path, tier mismatch, override |
| FR-22 | Reset Usage Limits Override — S1, S2, S3 | Happy path, guards |
| FR-23 | Override Action Audit Logging — S1 | Audit log for all four actions |
| FR-24 | Override Action Audit Logging — S2 | Bypass Payment server-side permission |
