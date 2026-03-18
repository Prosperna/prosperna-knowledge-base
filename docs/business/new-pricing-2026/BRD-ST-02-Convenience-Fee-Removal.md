---
id: st-02-convenience-fee-removal
title: BRD. ST-02 Convenience Fee Removal
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
- Priority: HIGH

---

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform that has historically monetized through a transaction-level "convenience fee" — a percentage charged on every customer order. This fee was split between the merchant (seller portion deducted from their disbursement) and the customer (buyer portion added to the checkout total). A separate but analogous mechanism existed for US merchants: a 1% `application_fee_amount` charged through Stripe on every checkout session.

As Prosperna shifts its strategic focus to US SMBs and transitions its revenue model to subscription-based tiers with usage limits, the convenience fee is no longer aligned with its competitive positioning. The fee creates checkout friction for customers and conflicts with Prosperna's core value proposition: **"Bring Your Own Payment Gateway"** — merchants keep 100% of their transaction revenue. The fee is deeply embedded across multiple platforms, services, and data models and must be systematically removed.

---

## Goals

1. Eliminate the Prosperna-charged convenience fee on all new customer orders — universally across all plan tiers, countries, and payment methods.
2. Remove the 1% `application_fee_amount` from Stripe checkout session creation for US merchants.
3. Remove all UI surfaces where the convenience fee is visible or configurable (Convenience Fee Splitter in Store Settings and MyPay).
4. Remove the "Convenience Fee" line item from the customer-facing checkout order summary.
5. Neutralize all backend convenience fee computation functions to always return 0.
6. Remove the hardcoded store exemption list (`CONVENIENCE_FEE_EXCLUDED_STORE_IDS`).
7. Remove the convenience fee deduction from the merchant disbursement formula.
8. Disable the `PUT /store/update/convenience-fee` API endpoint.
9. Preserve all historical order data — pre-migration orders retain their original convenience fee values unchanged.

---

## Non-Goals

1. Dropping convenience fee database fields from the schema (fields are retained for backward compatibility and historical data).
2. Retroactively zeroing out convenience fee values on pre-migration orders.
3. Modifying admin report layouts, columns, or filtering behavior.
4. Merchant communication or notification about the fee removal (handled by ST-16: Existing Merchant Migration).
5. Subscription billing changes (handled by ST-01: Subscription Billing Restructuring).
6. Usage limits or enforcement as the replacement revenue model (handled by ST-06).
7. Removing admin-facing transaction report columns for convenience fees.

---

## Stakeholders

| Role | Involvement |
|---|---|
| Product Owner | Decision authority; initiated Prosperna Pricing Restructuring v3 |
| Business Analyst | Author; defines scope, requirements, and acceptance criteria |
| Frontend Engineering (prosperna1) | Removes ConvenienceFeeSplitter components and utility functions from Merchant Dashboard |
| Frontend Engineering (p1-customer) | Removes convenience fee line from checkout order summary |
| Backend Engineering (orders-service-api) | Neutralizes computation functions, removes disbursement deduction, removes exemption list |
| Backend Engineering (business-profile-api) | Disables the store convenience fee update endpoint |
| Backend Engineering (payment-integration-api) | Removes application_fee_amount from Stripe checkout sessions |
| QA | Validates all changes across all platforms, including historical data preservation |
| Prosperna Admins | Users of the Admin Control Platform — will see $0 for new orders in transaction reports |
| Merchants | Primary beneficiaries — increased net income per order; simplified settings UI |
| Customers (End-Users) | Simplified checkout with no convenience fee line item or charge |

---

## Personas

| Persona | Description |
|---|---|
| **Merchant** | A business owner on Prosperna's Merchant Dashboard. Previously configured a buyer/seller split for the convenience fee. After this change, no fee is deducted from their disbursements. Net income per order increases. The Store Settings and MyPay pages no longer contain any fee configuration. |
| **Customer (End-User)** | A shopper on a Prosperna-powered online store. Previously saw a "Convenience Fee" line item added to their checkout total. After this change, the checkout is cleaner and cheaper. |
| **Prosperna Admin** | Internal staff using the Admin Control Platform for transaction auditing. For pre-migration orders, all convenience fee columns display original amounts. For new orders, convenience fee columns display $0. No UI changes are needed in the admin platform — the database drives the display. |

---

## Business Value

| Value | Detail |
|---|---|
| **Competitive differentiation** | Removes all Prosperna-charged transaction fees. Merchants keep 100% of revenue minus payment gateway fees (Xendit/Stripe). Directly addresses the "Shopify Payments lock-in" problem. |
| **Cleaner customer checkout** | Removing the convenience fee line item eliminates unexpected checkout fees, reducing potential cart abandonment. |
| **Strategic alignment** | Positions Prosperna's monetization model entirely on subscription tiers + usage limits (ST-01, ST-06), decoupling revenue from transaction volume. |
| **Technical debt reduction** | Removes a complex, cross-service fee computation system spanning 3 services, 2 frontends, and multiple database models. |
| **Merchant retention / acquisition** | Fee-free transactions are a strong selling point for US SMB merchants evaluating ecommerce platforms. |

---

## Scope

### In Scope

**Frontend — Merchant Dashboard (prosperna1)**
- Remove `ConvenienceFeeSplitter` component from Store Settings page
- Remove `ConvenienceFeeSplitter` component from MyPay page
- Remove `GetConveniencePercentPerPlan()` utility function from `src/utils/userUtil.js`
- Remove `UpdateConvenienceFeePercentHandler` from `src/utils/userUtil.js`
- Conditionally hide the Convenience Fee line in Order Details when value is 0 (new orders); continue displaying for historical orders where value is non-zero

**Frontend — Online Store (p1-customer)**
- Remove "Convenience Fee" line item from checkout order summary (`Summary.tsx`)
- Remove convenience fee from checkout total calculation (`SingleCheckoutMain.tsx`)

**Backend — orders-service-api**
- Neutralize `getFlatConvenienceFee()` in `computations.service.ts` to return 0
- Neutralize `computeTotalConvenienceFee()`, `computeConsumerConvenienceFee()`, `computeMerchantConvenienceFee()` in `formulas/index.ts` to return 0
- Remove `CONVENIENCE_FEE_EXCLUDED_STORE_IDS` constant from `computations.service.ts`
- Remove convenience fee component from `cost_of_sales` in `disbursements.service.ts`
- Ensure all new orders are created with `convenience_fee = 0`, `convenience_fee_customer = 0`, `convenience_fee_merchant = 0`

**Backend — business-profile-api**
- Disable `PUT /store/update/convenience-fee` endpoint (return `410 Gone` with descriptive message)
- Deprecate `convenienceFeeSeller` and `convenienceFeeBuyer` fields on Store model — keep in schema, default to 0, no longer read by business logic

**Backend — payment-integration-api**
- Remove `application_fee_amount` parameter from Stripe checkout session creation in `stripe.service.ts`

### Out of Scope

- Database schema migrations (no fields added, removed, or retyped)
- Retroactive modification of pre-migration order data
- Admin Control Platform UI changes
- Merchant notification/communication (ST-16)
- Subscription billing (ST-01)
- Usage limits (ST-06)

---

## Assumptions

1. The convenience fee removal is universal — no plan tier, merchant country, payment method, or store configuration retains any Prosperna-charged transaction fee.
2. Historical orders (created before migration) must never have their convenience fee fields modified, even to 0.
3. The `CONVENIENCE_FEE_EXCLUDED_STORE_IDS` list can be safely removed because universal zero-fee makes all exemptions redundant.
4. Returning `410 Gone` from `PUT /store/update/convenience-fee` is an acceptable deprecation signal to any residual callers.
5. No external clients depend on the `application_fee_amount` being non-zero in the Stripe integration — Stripe allows its omission.
6. Keeping convenience fee functions as stubs returning 0 (rather than deleting them) is safer than full deletion, as it avoids breaking unexpected callers within the service.
7. Conditional hiding of the Convenience Fee line in Order Details (when value is 0) is the preferred UX approach over always showing "₱0.00".

---

## Dependencies

| Dependency | Type | Blocking? | Note |
|---|---|---|---|
| ST-01 (Subscription Billing Restructuring) | Sibling subtask | No | Operates on a separate billing system. Fully parallel. |
| ST-06 (Usage Limits & Enforcement) | Sibling subtask | No | Implements the replacement revenue model. Fully parallel. |
| ST-16 (Existing Merchant Migration) | Downstream | No | Handles merchant communication. ST-02 must ship before ST-16 communications go out. |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Residual callers of `PUT /store/update/convenience-fee` receive 410 and surface errors | Low | Low | Return descriptive 410 response body. Monitor API error logs post-release. |
| Computation function stubs break a downstream caller not identified in audit | Low | Medium | Keep all function signatures intact. Return 0 with deprecation comments. Audit all call sites before release. |
| Historical order convenience fee data is lost or retroactively zeroed | Low | High | Strict rule: no data migration, no retroactive updates. QA must explicitly test historical order display. |
| `application_fee_amount` removal causes Stripe API rejection | Very Low | High | Stripe treats this as optional — omitting it is valid. Verify in Stripe staging before production. |
| Convenience fee bypass misses a code path in order creation | Medium | Medium | Full audit of all order creation flows. Integration tests asserting `convenience_fee = 0` on all post-migration orders. |
| Disbursement formula regression affects merchant net income calculation | Low | High | Unit and integration tests for disbursement formula before and after change. |

---

## Compliance and Privacy Notes

- No personally identifiable information (PII) is added, removed, or modified by this change.
- Historical financial data is fully preserved for audit and reconciliation.
- No changes to data retention policies.
- No regulatory reporting impact — convenience fee was internal Prosperna revenue; its removal does not affect tax or compliance obligations on merchants or customers.

---

## Success Metrics

| Metric | Target |
|---|---|
| All new orders created post-migration have `convenience_fee = 0` | 100% |
| No `application_fee_amount` transmitted to Stripe on any new US checkout session | 100% |
| ConvenienceFeeSplitter component absent from Store Settings and MyPay pages | Verified by QA |
| "Convenience Fee" line absent from checkout order summary for new orders | Verified by QA |
| Historical (pre-migration) orders display their original convenience fee values accurately | Verified by QA |
| `PUT /store/update/convenience-fee` returns 410 Gone with descriptive message | Verified by QA |
| Merchant net income per order reflects the removal of the seller-portion convenience fee deduction | Verified by QA |
| Zero critical production bugs related to order total, disbursement, or Stripe checkout post-release | 0 |
