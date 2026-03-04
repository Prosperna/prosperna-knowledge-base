---
id: discounts-enhancement
title: BRD. Discounts Enhancement
sidebar_label: Discounts Enhancement
sidebar_position: 1
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-04
- Status: Draft

---

## Background and Problem

A support ticket (Order 699e9d141182c5c2d9891e33 — Merchant: I Want Dimsum / Harbour City) exposed two compounding issues in the Discounts feature:

1. A "Flat Amount – Once Per Order" discount configured at ₱100 only deducted ₱82 from the order. The UI showed no explanation for the discrepancy, causing confusion for CS staff and the merchant.
2. The discount badge tag appearing on only one item in a multi-item cart felt arbitrary, with no contextual label to explain why.

Root cause analysis identified three underlying problems:
- **(a) Suboptimal item selection algorithm** — the system applied the discount to a low-priced item instead of the highest-priced eligible item, causing a cap to be triggered unnecessarily and reducing the customer's actual savings.
- **(b) No UI communication when cap behavior is triggered** — both the merchant order details and the checkout page were silent on cap events.
- **(c) No contextual label on single-item discount tags** — customers and CS staff had no way to understand why only one item showed a discount tag.

All proposed improvements are validated against global ecommerce industry standards (Shopify, BigCommerce, Salesforce Commerce Cloud, WooCommerce, Magento, Wix, PrestaShop).

---

## Goals

1. Fix the item selection algorithm so "Flat Amount – Once Per Order" discounts always maximize customer savings by targeting the highest-priced eligible item first.
2. Surface clear, contextual UI communication whenever a discount cap is triggered (both merchant-side and customer-side).
3. Replace the ambiguous checkbox UI for Flat Amount application mode with a self-documenting radio button group to reduce merchant misconfiguration.
4. Add a proactive cap-risk warning during discount creation when minimum purchase amount is less than the discount value.
5. Reduce CS support ticket volume related to discount mismatches and unexplained deductions.

---

## Non-Goals

- Discount performance / analytics report
- Approaching-threshold messaging at checkout
- Partial-use voucher generation
- Discount name vs. coupon code field separation
- Recurring / scheduled discount windows
- Class-based stacking rules (Shopify model)
- Configurable item selection strategy (merchant can control which item receives the discount)
- "Discount Applied To: [Item Name]" line in order details

---

## Stakeholders

| Role | Responsibility |
|---|---|
| Product Manager | Feature owner and sign-off |
| Business Analyst | Requirements and documentation |
| Backend Engineering | Item selection algorithm fix |
| Frontend Engineering (Merchant Dashboard) | Create Discount modal and Order Details UI changes |
| Frontend Engineering (Online Store) | Checkout discount tag tooltip |
| QA | Test coverage across all 5 changes |
| Customer Support | Primary beneficiary of merchant-facing transparency improvements |
| Merchants | Users of the Create Discount modal; benefit from clearer UI |
| Customers (end-users) | Benefit from clearer checkout discount tags |

---

## Personas

### Persona 1 — Merchant
A Prosperna merchant managing their ecommerce store. They create and configure discounts via the Merchant Dashboard. They may not fully understand cap behavior or how Flat Amount mode options differ. They rely on the platform to guide them away from misconfiguration.

### Persona 2 — Customer (End-User)
A shopper on the merchant's Online Store Website. They see discount tags on cart items at checkout. They expect clarity on why a discount applies to only one item and not others.

### Persona 3 — Customer Support (CS) Staff
A Prosperna CS team member investigating an order with a discount discrepancy. They use the merchant-facing Order Details view to trace what happened. They need the UI to explain cap events without requiring a backend investigation.

---

## Business Value

| Benefit | Detail |
|---|---|
| Reduced CS ticket volume | Cap disclosure and algorithm fix eliminate the primary source of "why is my discount different?" tickets |
| Merchant trust and retention | Transparent UI builds merchant confidence in the platform's accuracy |
| Customer trust | Checkout tooltip prevents shopper confusion about partial discount application |
| Industry differentiation | Cap warning during creation and conditional cap disclosure in order details are not offered by any major competitor (Shopify, BigCommerce, WooCommerce, Magento, Wix) — positions Prosperna ahead of the market |
| Fewer merchant misconfiguration errors | Radio button group replaces ambiguous checkbox, reducing accidental wrong configuration |

---

## Scope

### In Scope

1. **Backend — Item Selection Algorithm Fix**
   Flat Amount (Once Per Order) discounts apply to the highest-priced eligible item first (descending sort by unit price). Floor-at-zero cap rule unchanged.

2. **Merchant Dashboard — Create Discount Modal — Flat Amount Application Mode UI**
   Replace the "Only apply discount once per order" checkbox with a labeled radio button group with supporting example text for each option.

3. **Merchant Dashboard — Order Details — Discount Line Conditional Display**
   When the cap is triggered (actual deduction `<` configured value), update the discount label to `/ ₱X.XX of ₱Y` and add a `?` tooltip icon with text "Discount capped at item price."

4. **Online Store Website — Checkout — Discount Tag Tooltip**
   Add hover (desktop) / tap (mobile) tooltip on discount tags for Flat Amount (Once Per Order) discounts: *"This discount applies to one item per order."*

5. **Merchant Dashboard — Create Discount Modal — Cap Scenario Warning**
   Display a non-blocking inline warning when Discount Type = Flat Amount AND Minimum Purchase Amount `<` Discount Value. Warning updates dynamically and auto-dismisses when the condition is resolved.

### Out of Scope

See Non-Goals above.

---

## Assumptions

1. The discount cap (floor-at-zero) existing behavior remains unchanged — only the item selection order changes.
2. The View Discount Modal labels (`Flat Amount (Once Per Order)`, `Flat Amount (Per Eligible Item)`) are not changed — only the Create modal UI changes.
3. The cap scenario warning applies to both Flat Amount modes (Once Per Order and Per Eligible Item).
4. Tooltip display on checkout is scoped to `Flat Amount (Once Per Order)` only — not other discount types.
5. Coupon code case sensitivity behavior is out of scope for this enhancement.
6. All timestamps and amounts are stored and displayed in Philippine Peso (₱) unless otherwise stated.
7. The backend knows whether a cap was triggered on a given order and can surface this to the Order Details view.

---

## Dependencies

| Dependency | Detail |
|---|---|
| Backend capability to flag cap events | Order Details UI change (Change 3) requires the API to return whether a cap was triggered and the configured vs. actual discount amounts |
| Discount type metadata in checkout API | Checkout tooltip (Change 4) requires the checkout page to know the discount type (`Flat Amount Once Per Order`) |
| Existing discount data model | No schema changes expected — cap status derived from configured value vs. applied value comparison |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regression in existing Flat Amount (Per Eligible Item) behavior from algorithm change | Medium | High | Scope algorithm change strictly to Once Per Order mode; add regression test suite |
| Cap tooltip appears on wrong discount types at checkout | Low | Medium | Type-gated by discount type = `FLAT_ONCE`; strict conditional check |
| Warning banner causes merchant friction during discount creation | Low | Low | Warning is non-blocking and advisory only; no save restriction |
| Backward compatibility of existing discounts configured with checkbox | Low | Low | Radio button maps directly to the same underlying flag; no migration needed |

---

## Compliance and Privacy Notes

- No personally identifiable information (PII) is exposed by these changes.
- Cap warning and tooltip display are purely presentational — no new data is collected.
- No changes to payment processing or tax computation logic.

---

## Success Metrics

| Metric | Target |
|---|---|
| CS tickets related to discount amount mismatch | Reduce by ≥ 50% within 60 days of release |
| Merchant misconfiguration rate (wrong Flat Amount mode) | Reduce by ≥ 30% (tracked via support tickets and discount config audit) |
| No regression on existing discount types | 0 regression bugs in QA |
| Checkout tooltip interaction rate | Measured for 30 days; used for future UX iteration |
