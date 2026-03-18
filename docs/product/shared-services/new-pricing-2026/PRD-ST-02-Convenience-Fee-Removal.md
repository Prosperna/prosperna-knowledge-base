---
id: st-02-convenience-fee-removal
title: PRD. ST-02 Convenience Fee Removal
sidebar_label: ST-02 Convenience Fee Removal
sidebar_position: 2
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft
- Parent Initiative: Prosperna Pricing Restructuring v3
- Subtask ID: ST-02

---

## Summary

This subtask removes all Prosperna-charged transaction-level convenience fees from the platform. The removal is universal — no plan tier, country, payment method, or merchant configuration retains any form of Prosperna platform fee on customer orders. It covers frontend UI removal (Store Settings, MyPay, checkout order summary), backend computation neutralization, disbursement formula update, Stripe integration update, and API endpoint deprecation. Historical order data is fully preserved. No database schema changes are required.

---

## User Journey

### Happy Path

#### Journey 1 — Customer Checkout (PH Merchant, Post-Migration)
1. Customer browses a Prosperna-powered online store and adds products to cart.
2. Customer proceeds to checkout.
3. Order summary displays: Sub Total, Shipping Fee, Additional Fee (if any), Tax, Total.
4. **No "Convenience Fee" line item is rendered.**
5. Customer completes payment via Xendit.
6. Order is created with `convenience_fee = 0`, `convenience_fee_customer = 0`, `convenience_fee_merchant = 0`.
7. Merchant's balance/disbursement reflects full order amount minus only Xendit processing fee, shipping, and taxes.

#### Journey 2 — Customer Checkout (US Merchant via Stripe, Post-Migration)
1. Customer proceeds to checkout on a US merchant's store.
2. Order summary displays: Sub Total, Shipping Fee, Additional Fee (if any), Tax, Total.
3. **No "Convenience Fee" line item is rendered.**
4. Stripe checkout session is created with **no `application_fee_amount`**.
5. Customer completes payment via Stripe.
6. Full payment (minus Stripe's own processing fee) routes to the merchant's connected Stripe account.
7. Prosperna receives $0 platform fee from this transaction.

#### Journey 3 — Merchant Views Store Settings (Post-Migration)
1. Merchant navigates to Merchant Dashboard → Store Settings.
2. The Convenience Fee Splitter section is **absent** — no fee configuration is displayed.
3. All other settings are unaffected.

#### Journey 4 — Merchant Views MyPay (Post-Migration)
1. Merchant navigates to Merchant Dashboard → MyPay.
2. The Convenience Fee Splitter section is **absent**.
3. Balance, withdrawal, and payout features work as normal.

#### Journey 5 — Merchant Views Order Details for a New Order (Post-Migration)
1. Merchant opens an order created after the migration.
2. Financial breakdown conditionally **hides** the Convenience Fee line (value is 0).
3. Deductions section shows Convenience Fee Total as hidden (value is 0).
4. Net Income is higher than pre-migration because no convenience fee is deducted.

#### Journey 6 — Admin Views Transaction Report for a New Order (Post-Migration)
1. Admin navigates to Admin Control Platform → Transaction Reports.
2. Finds a newly created order.
3. Convenience fee columns show **$0 / ₱0**.
4. All other financial columns are accurate.

### Alternate and Failure Paths

#### Alt Path 1 — Merchant Views Order Details for a Historical (Pre-Migration) Order
1. Merchant opens an order created before the migration.
2. Financial breakdown shows the original Convenience Fee amount (e.g., ₱7.98).
3. Deductions section shows original Convenience Fee Total (e.g., ₱15.96).
4. Values are historically accurate — **no retroactive changes**.

#### Alt Path 2 — Admin Views a Historical (Pre-Migration) Order in Transaction Reports
1. Admin finds an order created before the migration.
2. Convenience fee columns show **original amounts** (e.g., ₱7.98 buyer, ₱7.98 seller).
3. Historical accuracy is maintained.

#### Failure Path 1 — Legacy Client Calls `PUT /store/update/convenience-fee`
1. Any client (web, mobile, or integration) calls `PUT /store/update/convenience-fee`.
2. Server responds with `410 Gone` and a message: `"Convenience fees have been removed from the platform."`
3. No data is written or changed.

#### Failure Path 2 — Order Creation with Non-Zero Convenience Fee Attempted (Edge Case)
1. Any code path attempts to compute a non-zero convenience fee for a new order.
2. Neutralized functions return 0 regardless of input.
3. Order is created with `convenience_fee = 0`.

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Remove the `ConvenienceFeeSplitter` component from the Store Settings page in `prosperna1`. The section must not be rendered. If it was the sole content of its parent section, the parent section must also be removed to prevent an empty container. |
| FR-2 | Remove the `ConvenienceFeeSplitter` component from the MyPay page in `prosperna1`. |
| FR-3 | Remove the "Convenience Fee" line item from the checkout order summary in `p1-customer` (`Summary.tsx`). The line must not be rendered — it must not appear as ₱0.00. |
| FR-4 | Remove convenience fee from the checkout total computation in `p1-customer` (`SingleCheckoutMain.tsx`). The checkout total must not include any convenience fee amount. |
| FR-5 | Remove `GetConveniencePercentPerPlan()` utility function from `prosperna1/src/utils/userUtil.js`. |
| FR-6 | Remove `UpdateConvenienceFeePercentHandler` from `prosperna1/src/utils/userUtil.js`. |
| FR-7 | Neutralize `getFlatConvenienceFee()` in `orders-service-api/src/collections/computations/computations.service.ts` to always return 0. Add a deprecation comment. Do not remove the function signature. |
| FR-8 | Neutralize `computeTotalConvenienceFee()`, `computeConsumerConvenienceFee()`, and `computeMerchantConvenienceFee()` in `orders-service-api/src/formulas/index.ts` to always return 0. Add deprecation comments. |
| FR-9 | Remove the `CONVENIENCE_FEE_EXCLUDED_STORE_IDS` constant from `orders-service-api/src/collections/computations/computations.service.ts`. |
| FR-10 | Remove the convenience fee component from the merchant disbursement formula in `orders-service-api/src/collections/disbursements/disbursements.service.ts`. The new formula: `Net Income = Order Total - Payment Gateway Fee - Actual Shipping Fee - Taxes`. |
| FR-11 | All new orders (created after migration) must have `convenience_fee = 0`, `convenience_fee_customer = 0`, and `convenience_fee_merchant = 0` persisted to the Orders model. |
| FR-12 | Disable the `PUT /store/update/convenience-fee` endpoint in `business-profile-api`. The endpoint must return `410 Gone` with response body: `{ "message": "Convenience fees have been removed from the platform." }`. |
| FR-13 | Deprecate `convenienceFeeSeller` and `convenienceFeeBuyer` fields on the Store model in `business-profile-api`. Fields must remain in the schema with default value `0`. No business logic may read or write these fields going forward. |
| FR-14 | Remove the `application_fee_amount` parameter from Stripe checkout session creation in `payment-integration-api/src/collections/stripe/stripe.service.ts`. The parameter must be omitted entirely (not set to 0). |
| FR-15 | In the Merchant Dashboard Order Details view, conditionally hide the Convenience Fee line item (both in the financial breakdown and in the Deductions section) when the value is 0. Display it when the value is non-zero (historical orders). |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Zero schema migrations.** No database fields are added, removed, or retyped. All changes are code-level only. |
| NFR-2 | **Historical data integrity.** Pre-migration orders must never have their `convenience_fee`, `convenience_fee_customer`, or `convenience_fee_merchant` values modified. |
| NFR-3 | **Backward compatibility.** The Store model fields `convenienceFeeSeller` and `convenienceFeeBuyer` must remain in the schema. Existing documents retain whatever values they had — these values are simply ignored by all new logic. |
| NFR-4 | **Performance.** Neutralized computation functions return 0 immediately with no computation. Order creation performance must not regress. |
| NFR-5 | **Auditability.** Deprecation comments must be added to all neutralized functions explaining the change and the date of the pricing restructuring. |
| NFR-6 | **No silent failures.** The disabled `PUT /store/update/convenience-fee` endpoint must return a clear, machine-readable `410 Gone` response — not a silent 200 no-op. |
| NFR-7 | **Stripe API safety.** The `application_fee_amount` removal must be tested in a Stripe staging environment before production release to confirm no API-level rejection. |

---

## UX Notes

- **Checkout page:** The Convenience Fee line must be completely absent — not shown as ₱0.00. Conditional rendering: `{convenienctFee > 0 && <ConvenienceFeeLine />}`.
- **Order Details (new orders):** Conditional hide when `convenience_fee === 0`. Show when non-zero (historical).
- **Store Settings / MyPay:** Full component removal. If the ConvenienceFeeSplitter was the only item in a section group, remove the group header/container as well.
- **Admin transaction reports:** No UI changes — the data ($0 for new orders) drives the display automatically.

---

## Data Model Notes

### Store Model (`business-profile-api/src/models/Store.model.ts`)

| Field | Status | Change |
|---|---|---|
| `convenienceFeeSeller` | Deprecated | Keep in schema. Default to 0. No longer read or written by any business logic. |
| `convenienceFeeBuyer` | Deprecated | Keep in schema. Default to 0. No longer read or written by any business logic. |

### Orders Model (`orders-service-api/src/domain/v1/orders.model.ts`)

| Field | Status | Change |
|---|---|---|
| `convenience_fee` | Retained | Always set to 0 for new orders. Historical orders retain original values. |
| `convenience_fee_customer` | Retained | Always set to 0 for new orders. Historical orders retain original values. |
| `convenience_fee_merchant` | Retained | Always set to 0 for new orders. Historical orders retain original values. |

> No schema migrations are required. All changes are behavioral (code logic), not structural (schema).

---

## Integrations and APIs

| Integration | Service | Change |
|---|---|---|
| Xendit (PH checkout) | orders-service-api | No direct change to Xendit API calls. The convenience fee was computed and stored independently of the Xendit transaction. With computation neutralized, `convenience_fee = 0` is stored on order creation. |
| Stripe (US checkout) | payment-integration-api | Remove `application_fee_amount` from `stripe.checkout.sessions.create()` call. |
| `PUT /store/update/convenience-fee` | business-profile-api | Disabled. Returns `410 Gone`. |

---

## Error Handling

| Scenario | Handling |
|---|---|
| Legacy client calls `PUT /store/update/convenience-fee` | Return `410 Gone` with message: `"Convenience fees have been removed from the platform."` |
| Stripe rejects a checkout session without `application_fee_amount` | Not expected — Stripe treats it as optional. If Stripe returns an error, log the error and surface it to the checkout flow as a generic payment failure. |
| Order creation flow invokes a neutralized convenience fee function | Function returns 0. Order creation proceeds normally. No error state. |
| Historical order missing convenience fee fields (edge case) | Display logic must handle null/undefined values the same as 0 — hide the line item. |

---

## Telemetry and Analytics

| Event | Trigger | Properties | Purpose |
|---|---|---|---|
| `order.created.convenience_fee_zero` | Every new order post-migration | `orderId`, `merchantId`, `orderTotal` | Confirm 100% of new orders have zero convenience fee |
| `stripe.checkout.no_platform_fee` | Every Stripe checkout session creation post-migration | `merchantId`, `sessionId`, `orderTotal` | Confirm no `application_fee_amount` is sent |
| `api.convenience_fee_endpoint.410` | Every call to `PUT /store/update/convenience-fee` | `requestingUserId`, `timestamp` | Monitor for residual callers needing migration |

---

## Rollout Plan

1. **Pre-release:** Full regression test suite covering order creation (PH and US), disbursement calculation, checkout page rendering, Order Details display, Store Settings and MyPay UI.
2. **Staging validation:** Deploy to staging; create test orders via PH (Xendit) and US (Stripe) flows; confirm `convenience_fee = 0` on all new orders; confirm no Stripe `application_fee_amount`.
3. **Production release:** Deploy all services and frontends together (atomic release). No staged rollout needed — changes are purely subtractive with no new behavior introduced.
4. **Post-release monitoring:** Monitor API logs for `410` responses on the deprecated endpoint. Verify `convenience_fee = 0` on production orders via database spot-checks for 48 hours post-release.

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Should the `PUT /store/update/convenience-fee` endpoint be fully removed from the router in a future cleanup release, or kept indefinitely returning 410? | Engineering Lead | Open |
| OQ-2 | Should neutralized convenience fee functions (`getFlatConvenienceFee`, etc.) be fully deleted in a subsequent clean-up release after a 30-day burn-in period? | Engineering Lead | Open |
| OQ-3 | Is there any external integration (webhook, third-party app, or merchant API client) that currently reads the `convenienceFeeSeller`/`convenienceFeeBuyer` fields from the Store API response? | Engineering Lead | Open |

---

# Gherkin User Stories

## Feature: ST-02 Convenience Fee Removal

---

### FR-1, FR-2 — Convenience Fee Splitter Removed from UI

```gherkin
Feature: Convenience Fee Splitter Removal

  Scenario: Merchant views Store Settings and ConvenienceFeeSplitter is absent
    Given the merchant is authenticated on the Merchant Dashboard
    When the merchant navigates to Store Settings
    Then the Convenience Fee Splitter section is not rendered on the page
    And no convenience fee configuration control is visible

  Scenario: Merchant views MyPay and ConvenienceFeeSplitter is absent
    Given the merchant is authenticated on the Merchant Dashboard
    When the merchant navigates to the MyPay page
    Then the Convenience Fee Splitter section is not rendered on the page
    And no convenience fee configuration control is visible

  Scenario: Store Settings page does not show an empty container after component removal
    Given the ConvenienceFeeSplitter was the only element in its parent section group
    When the merchant views Store Settings
    Then the parent section header and container are also not rendered
```

---

### FR-3, FR-4 — Convenience Fee Line Removed from Checkout

```gherkin
Feature: Convenience Fee Removal at Checkout

  Scenario: Customer on a PH merchant store sees no convenience fee at checkout
    Given the customer has items in their cart on a PH merchant's online store
    When the customer proceeds to the checkout page
    Then the order summary does not contain a "Convenience Fee" line item
    And the order total equals Sub Total + Shipping Fee + Additional Fee + Tax

  Scenario: Customer on a US merchant store sees no convenience fee at checkout
    Given the customer has items in their cart on a US merchant's online store
    When the customer proceeds to the checkout page
    Then the order summary does not contain a "Convenience Fee" line item
    And the order total equals Sub Total + Shipping Fee + Additional Fee + Tax

  Scenario: Convenience Fee line is not rendered as zero — it is absent entirely
    Given convenience fees have been removed
    When the customer views the checkout order summary
    Then no "Convenience Fee" row appears even as "₱0.00"
    And only Sub Total, Shipping Fee, Additional Fee (if applicable), Tax, and Total lines are shown
```

---

### FR-7, FR-8, FR-9, FR-11 — Backend Computation Returns Zero for New Orders

```gherkin
Feature: Convenience Fee Computation Neutralized

  Scenario: New PH order is created with zero convenience fee
    Given a customer completes checkout on a PH merchant's store post-migration
    When the order is created in the system
    Then the order record has convenience_fee equal to 0
    And the order record has convenience_fee_customer equal to 0
    And the order record has convenience_fee_merchant equal to 0

  Scenario: New US order via Stripe is created with zero convenience fee
    Given a customer completes checkout on a US merchant's store via Stripe post-migration
    When the order is created in the system
    Then the order record has convenience_fee equal to 0
    And the order record has convenience_fee_customer equal to 0
    And the order record has convenience_fee_merchant equal to 0

  Scenario: getFlatConvenienceFee always returns zero
    Given the getFlatConvenienceFee function is called with any input parameters
    When the function executes
    Then it returns 0

  Scenario: computeTotalConvenienceFee always returns zero
    Given the computeTotalConvenienceFee function is called with any input
    When the function executes
    Then it returns 0

  Scenario: computeConsumerConvenienceFee always returns zero
    Given the computeConsumerConvenienceFee function is called with any input
    When the function executes
    Then it returns 0

  Scenario: computeMerchantConvenienceFee always returns zero
    Given the computeMerchantConvenienceFee function is called with any input
    When the function executes
    Then it returns 0
```

---

### FR-10 — Disbursement Formula Updated

```gherkin
Feature: Disbursement Formula Excludes Convenience Fee

  Scenario: Merchant disbursement for a new order does not deduct convenience fee
    Given an order is created post-migration with a subtotal of ₱500
    And the payment gateway fee is ₱20
    And shipping is ₱50
    And taxes are ₱0
    When the merchant's net income is calculated
    Then the net income equals ₱430 (₱500 - ₱20 gateway fee - ₱50 shipping)
    And no convenience fee amount is deducted

  Scenario: Merchant net income is higher post-migration compared to pre-migration
    Given an identical order exists from before and after migration with the same subtotal
    When net income is compared
    Then the post-migration order net income is higher by the amount of the previously deducted seller convenience fee
```

---

### FR-12 — Deprecated Endpoint Returns 410

```gherkin
Feature: PUT /store/update/convenience-fee Endpoint Disabled

  Scenario: Any client calling the deprecated endpoint receives 410 Gone
    Given the PUT /store/update/convenience-fee endpoint has been disabled
    When a client sends a PUT request to /store/update/convenience-fee
    Then the response status is 410 Gone
    And the response body contains the message "Convenience fees have been removed from the platform."
    And no data is written to the database

  Scenario: Authenticated merchant calling deprecated endpoint receives 410
    Given a merchant is authenticated
    When they call PUT /store/update/convenience-fee with a valid payload
    Then the response status is 410 Gone

  Scenario: Unauthenticated caller receives 410 not 401
    Given an unauthenticated request
    When it calls PUT /store/update/convenience-fee
    Then the response status is 410 Gone
    And no authentication challenge is issued
```

---

### FR-14 — Stripe application_fee_amount Removed

```gherkin
Feature: Stripe Checkout Session Has No Platform Fee

  Scenario: US merchant checkout session is created without application_fee_amount
    Given a customer is checking out on a US merchant's store
    When the Stripe checkout session is created
    Then the session creation request does not include application_fee_amount
    And the full payment amount routes to the merchant's connected Stripe account

  Scenario: Prosperna receives no platform fee from a US Stripe transaction post-migration
    Given a customer completes a $100 Stripe payment on a US merchant's store
    When the payment is processed
    Then Prosperna receives $0 in platform fees from this transaction
    And the merchant receives the full amount minus Stripe's own processing fee only
```

---

### FR-13 — Store Model Fields Deprecated

```gherkin
Feature: Store Model Convenience Fee Fields Deprecated

  Scenario: Store API response still includes convenienceFeeSeller and convenienceFeeBuyer
    Given a store document exists in the database
    When the store configuration is fetched via the API
    Then the response includes convenienceFeeSeller and convenienceFeeBuyer fields
    And their values default to 0 for any store created post-migration

  Scenario: No business logic reads convenienceFeeSeller or convenienceFeeBuyer for fee computation
    Given a store has existing convenienceFeeSeller and convenienceFeeBuyer values
    When a new order is created for that store
    Then the convenience fee is still 0
    And the stored split ratio values are ignored entirely
```

---

### FR-15 — Historical Data Preservation

```gherkin
Feature: Historical Order Data Preserved

  Scenario: Historical order retains original convenience fee in Order Details
    Given an order was created before the migration with convenience_fee of 15.96
    When a merchant views that order in Order Details
    Then the Convenience Fee line displays ₱15.96
    And the Convenience Fee line in Deductions shows ₱15.96

  Scenario: Historical order retains original convenience fee in Admin Transaction Reports
    Given an order was created before the migration with convenience_fee of 15.96
    When an admin views that order in Transaction Reports
    Then the convenience fee columns display the original amounts

  Scenario: New order hides Convenience Fee line in Order Details when value is zero
    Given an order was created after the migration with convenience_fee of 0
    When a merchant views that order in Order Details
    Then the Convenience Fee line is not rendered in the financial breakdown
    And the Convenience Fee line is not rendered in the Deductions section

  Scenario: Database convenience_fee fields on historical orders are never modified
    Given orders exist in the database with non-zero convenience fee values
    When the migration is applied
    Then all historical order convenience fee values remain unchanged in the database
```

---

# Traceability Map

| FR | Gherkin Scenario(s) |
|---|---|
| FR-1 | Merchant views Store Settings and ConvenienceFeeSplitter is absent; Store Settings page does not show an empty container after component removal |
| FR-2 | Merchant views MyPay and ConvenienceFeeSplitter is absent |
| FR-3 | Customer on a PH merchant store sees no convenience fee at checkout; Convenience Fee line is not rendered as zero — it is absent entirely |
| FR-4 | Customer on a US merchant store sees no convenience fee at checkout; Convenience Fee line is not rendered as zero — it is absent entirely |
| FR-5 | (Covered implicitly by FR-1 and FR-3 — utility function removal is a prerequisite to passing those scenarios) |
| FR-6 | (Covered implicitly by FR-2 and FR-3 — utility function removal is a prerequisite to passing those scenarios) |
| FR-7 | getFlatConvenienceFee always returns zero; New PH order is created with zero convenience fee |
| FR-8 | computeTotalConvenienceFee always returns zero; computeConsumerConvenienceFee always returns zero; computeMerchantConvenienceFee always returns zero |
| FR-9 | CONVENIENCE_FEE_EXCLUDED_STORE_IDS removed (covered by: New PH order is created with zero convenience fee — no exemption can produce a non-zero result) |
| FR-10 | Merchant disbursement for a new order does not deduct convenience fee; Merchant net income is higher post-migration |
| FR-11 | New PH order is created with zero convenience fee; New US order via Stripe is created with zero convenience fee |
| FR-12 | Any client calling the deprecated endpoint receives 410 Gone; Authenticated merchant calling deprecated endpoint receives 410; Unauthenticated caller receives 410 not 401 |
| FR-13 | Store API response still includes fields; No business logic reads convenienceFeeSeller or convenienceFeeBuyer for fee computation |
| FR-14 | US merchant checkout session is created without application_fee_amount; Prosperna receives no platform fee from a US Stripe transaction post-migration |
| FR-15 | Historical order retains original convenience fee in Order Details; Historical order retains original convenience fee in Admin Transaction Reports; New order hides Convenience Fee line when value is zero; Database convenience_fee fields on historical orders are never modified |
