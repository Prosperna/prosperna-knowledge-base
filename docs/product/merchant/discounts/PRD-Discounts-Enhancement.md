---
id: discounts-enhancement
title: PRD. Discounts Enhancement
sidebar_label: Discounts Enhancement
sidebar_position: 1
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-04
- Status: Draft

---

## Summary

This PRD defines the product requirements for five targeted improvements to the Prosperna Discounts feature, triggered by a support ticket exposing a broken discount application logic and missing UI transparency around discount cap behavior. Changes span the backend engine, the Merchant Dashboard (Create Discount modal and Order Details), and the Online Store Website (checkout page).

---

## User Journey

### Happy Path

#### Merchant — Creating a Flat Amount (Once Per Order) Discount

1. Merchant navigates to Merchant Dashboard `>` Marketing `>` Discounts.
2. Merchant clicks "Create Discount."
3. Merchant selects Discount Type = `Flat Amount`.
4. The form shows a **HOW DO YOU WANT TO APPLY THE DISCOUNT?** radio group:
   - ◉ Customer saves money on the order subtotal — with example text
   - ○ Customer saves money on every eligible item — with example text
5. Merchant selects mode, fills remaining fields (name, value, products, locations, minimum requirements, dates, combine toggles).
6. **If Discount Type = Flat Amount AND Minimum Purchase Amount < Discount Value:** An inline warning appears beneath the Minimum Requirements amount field (non-blocking).
7. Merchant saves the discount. No interruption.

#### Customer — Applying the Discount at Checkout

1. Customer adds items to cart on the Online Store Website.
2. Customer proceeds to checkout.
3. For Automatic discounts: system evaluates eligibility and applies automatically.
4. For Coupon Code discounts: customer enters the discount name and clicks Apply.
5. Eligible items show a discount tag badge with the discount name.
6. For Flat Amount (Once Per Order) discounts: hovering (desktop) or tapping (mobile) the discount tag shows tooltip: *"This discount applies to your order subtotal."*
7. The discount is deducted from the order subtotal.

#### Merchant — Reviewing an Order with a Capped Discount

1. Merchant navigates to Dashboard `>` Orders `>` [Order Detail].
2. The Discount line shows:
   - If no cap triggered: `(Discount Name / ₱100)  ₱100.00` — unchanged.
   - If cap triggered: `Discount: [?]  (Discount Name / ₱82.00 of ₱100)  ₱82.00`
3. Hovering the `?` icon shows tooltip: *"Discount capped at order subtotal."*

### Alternate and Failure Paths

| Scenario | Behavior |
|---|---|
| Cart has no eligible items for an Automatic discount | Discount is not applied; no tag shown |
| Coupon code entered does not match any active discount | "Invalid promo code" or no application; discount not applied |
| Coupon code entered is valid but store location does not match | Discount not applied |
| Coupon code entered is valid but minimum purchase amount not met | Discount not applied |
| Flat Amount (Once Per Order) discount value `>` order subtotal | Discount is capped at the order subtotal; order total becomes ₱0.00 |
| Merchant sets minimum purchase amount ≥ discount value (no cap risk) | Warning does not appear |
| Merchant changes minimum amount to ≥ discount value after warning appeared | Warning auto-dismisses |
| End date is in the past | Discount is inactive; not applied at checkout |
| Discount combine toggles off and another discount is already applied | Second discount blocked; only first applies |

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | When a Flat Amount (Once Per Order) discount is applied to a cart, the system MUST apply the discount to the order subtotal. |
| FR-2 | If the order subtotal is less than the configured discount value, the deduction MUST be capped at the order subtotal (subtotal → ₱0.00; no negative totals). |
| FR-3 | The Create Discount modal MUST replace the "Only apply discount once per order" checkbox with a radio button group labeled "HOW DO YOU WANT TO APPLY THE DISCOUNT?" when Discount Type = Flat Amount. |
| FR-4 | The radio button group MUST display two options: "Customer saves money on the highest-priced item" with a supporting example, and "Customer saves money on every eligible item" with a supporting example. |
| FR-5 | The Create Discount modal MUST display an inline, non-blocking warning when: Discount Type = Flat Amount (either mode) AND Minimum Requirements = Minimum Purchase Amount AND the entered Amount is less than the entered Discount Value. |
| FR-6 | The cap scenario warning MUST update dynamically as the merchant edits the discount value or minimum purchase amount fields, and MUST auto-dismiss when the minimum amount ≥ discount value. |
| FR-7 | In the Merchant Dashboard Order Details view, when the actual applied discount amount equals the configured discount value (no cap), the discount line MUST display as currently: `(Discount Name / ₱X)  ₱X.XX`. |
| FR-8 | In the Merchant Dashboard Order Details view, when the actual applied discount amount is less than the configured discount value (cap triggered), the discount line MUST display as: `Discount: [?]  (Discount Name / ₱actual of ₱configured)  ₱actual`. |
| FR-9 | The `?` icon in the Order Details discount line MUST only appear when a cap is triggered. On hover, it MUST display the tooltip text: *"Discount capped at order subtotal."* |
| FR-10 | On the Online Store Website checkout page, discount tags for Flat Amount (Once Per Order) discounts MUST display a tooltip on hover (desktop) and on tap (mobile) with the text: *"This discount applies to your order subtotal."* |
| FR-11 | The checkout discount tag tooltip (FR-10) MUST NOT appear for Flat Amount (Per Eligible Item), Discount (%), or Free Shipping discount types. |
| FR-12 | All existing discount behaviors not listed in scope MUST remain unchanged (cap floor-at-zero, tax computed post-discount, additional fee not discounted, no. of transactions counter, combine toggles, scheduling rules). |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The discount application logic change (FR-1) MUST NOT increase discount calculation latency by more than 50ms under normal cart sizes (≤ 50 line items). |
| NFR-2 | The cap scenario warning (FR-5, FR-6) MUST render in real time with no perceptible delay (`<` 100ms) as the merchant types values into the form fields. |
| NFR-3 | All UI changes MUST be accessible (WCAG 2.1 AA): radio buttons must be keyboard navigable; tooltips must be accessible via keyboard focus as well as hover/tap. |
| NFR-4 | The checkout tooltip (FR-10) MUST be responsive and function on both desktop and mobile viewports. |
| NFR-5 | Cap detection in Order Details (FR-8, FR-9) MUST be performant — the comparison between configured and actual discount values MUST be done server-side and returned in the Order Details API response; no additional client-side network call is required. |
| NFR-6 | No changes to existing data schemas. The configured vs. actual discount amounts are already stored per order; the backend derives cap status from this existing data. |

---

## UX Notes

- **Radio button group (FR-3, FR-4):** Both options appear simultaneously. The currently-selected option is pre-filled to match the previous checkbox state for any existing merchant session flow. Default for new discounts: option 1 (Once Per Order / order subtotal).
- **Cap warning (FR-5):** Styled as a yellow/amber advisory banner (`⚠️`). Not red (not an error). Positioned directly beneath the Minimum Requirements amount field.
- **Order Details `?` icon (FR-9):** Inline, positioned immediately after the `Discount:` label text, before the discount name. Standard `?` tooltip icon or `ℹ` icon per design system. Only rendered when cap applies.
- **Checkout tooltip (FR-10):** Tooltip style matches existing design system tooltips. On mobile, tap-to-show, tap-outside-to-dismiss. Tooltip text is concise (one sentence).

---

## Data Model Notes

No new tables or columns required. Existing order data already stores:
- `discount.configuredValue` — the value the merchant set
- `discount.appliedAmount` — the actual amount deducted

Cap detection: `appliedAmount < configuredValue` → cap was triggered.

The item selection sort (FR-1) is a runtime computation at discount application time; no persistence change required.

---

## Integrations and APIs

| Integration | Change Required |
|---|---|
| Discount application engine (backend) | Sort eligible items by unit price descending before applying Once Per Order discount |
| Order Details API | Return `discountCapTriggered: boolean`, `configuredValue`, and `appliedAmount` in discount line data |
| Checkout API / discount resolution service | Return `discountType` (e.g., `FLAT_ONCE`, `FLAT_PER_ITEM`, `PERCENT`, `FREE_SHIPPING`) in the discount metadata response so the checkout frontend can conditionally render the tooltip |
| Merchant Dashboard frontend | Consume cap flag from Order Details API; render conditional UI |
| Online Store frontend | Consume discount type from checkout API; render conditional tooltip |

---

## Error Handling

| Scenario | Handling |
|---|---|
| Order Details API returns missing cap data | Default to no-cap display (FR-7); do not show `?` icon |
| Checkout API returns no discount type | Default to no tooltip; fail silently |
| Item selection sort fails (empty eligible items list) | No discount applied; existing fallback behavior retained |
| Cap warning fields not yet filled in by merchant | Warning does not render until both fields have values |

---

## Telemetry and Analytics

| Event | Trigger | Properties |
|---|---|---|
| `discount_cap_warning_shown` | Cap scenario warning renders in Create modal | `discount_value`, `min_purchase_amount`, `merchant_id` |
| `discount_cap_warning_dismissed` | Warning auto-dismisses after merchant corrects values | `merchant_id` |
| `checkout_discount_tooltip_viewed` | User hovers/taps the Once Per Order discount tag tooltip | `discount_id`, `discount_type`, `session_id` |
| `order_details_cap_tooltip_viewed` | Merchant hovers `?` icon on Order Details discount line | `order_id`, `discount_id`, `merchant_id` |

---

## Rollout Plan

| Phase | Action |
|---|---|
| Phase 1 | Backend: Deploy algorithm fix (FR-1, FR-2) and Order Details API cap flag. Dark-deploy behind feature flag. |
| Phase 2 | Frontend: Deploy Create Discount modal radio group (FR-3, FR-4) and cap warning (FR-5, FR-6). |
| Phase 3 | Frontend: Deploy Order Details cap display (FR-7, FR-8, FR-9). |
| Phase 4 | Frontend (Online Store): Deploy checkout tooltip (FR-10, FR-11). |
| Phase 5 | Remove feature flags. Monitor CS ticket volume and telemetry for 30 days. |

---

## Open Questions

| # | Question | Assumption |
|---|---|---|
| OQ-1 | Does the backend already store per-item discount deduction breakdown per order, or only the order-level total? | Assumed: order-level totals are stored; per-item breakdown may require a schema addition. To be confirmed with Engineering. |
| OQ-2 | What is the exact API field name for discount type returned by the checkout API? | Assumed: `discountType` with enum values `FLAT_ONCE`, `FLAT_PER_ITEM`, `PERCENT`, `FREE_SHIPPING`. |
| OQ-3 | Should the default selection on the new radio group for existing merchants be "Once Per Order" or preserve the previous state if editing a draft? | Assumed: defaults to "Once Per Order" for new discounts; edit mode pre-selects based on saved value. |
| OQ-4 | Is the `?` tooltip icon in Order Details clickable (for mobile) or hover-only? | Assumed: hover for desktop; tap-to-show for mobile touch devices. |

---

# Gherkin User Stories

## Feature: Discounts Enhancement

---

### FR-1 — Order Subtotal Application (Once Per Order)

```gherkin
Feature: Flat Amount Once Per Order — Subtotal Application

  Scenario: Discount applied to order subtotal
    Given a merchant has a Flat Amount Once Per Order discount of ₱100
    And the discount applies to All Products with No minimum requirement
    And a customer's cart contains:
      | item                      | price   |
      | Jumbo Cheeseburger        | ₱101.00 |
      | The Milk Shake            | ₱125.00 |
      | Jumbo Double Cheeseburger | ₱2.00   |
    When the discount is applied at checkout
    Then the discount MUST be applied to the order subtotal (₱228.00)
    And the subtotal after discount is ₱128.00 (₱228 - ₱100)
    And individual item prices remain unchanged
    And the total discount shown is ₱100.00

  Scenario: Discount applied when only one product is eligible
    Given a merchant has a Flat Amount Once Per Order discount of ₱200
    And the discount applies to Specific Product: Jumbo Double Cheeseburger only
    And a customer's cart contains:
      | item                      | price  |
      | Jumbo Double Cheeseburger | ₱2.00  |
    When the discount is applied at checkout
    Then the discount is applied to the eligible item subtotal (₱2.00)
    And the subtotal is capped at ₱0.00 (not negative)
    And the total discount shown is ₱2.00 (capped, not ₱200)
```

---

### FR-2 — Cap Behavior (Floor at Zero)

```gherkin
Feature: Flat Amount Discount Cap

  Scenario: Flat amount exceeds item price — cap applied
    Given a Flat Amount Per Eligible Item discount of ₱50
    And a customer's cart includes Jumbo Double Cheeseburger at ₱2.00
    When the discount is applied at checkout
    Then the Jumbo Double Cheeseburger price becomes ₱0.00
    And only ₱2.00 is deducted for that item (not ₱50)

  Scenario: Flat amount does not exceed item price — no cap
    Given a Flat Amount Per Eligible Item discount of ₱50
    And a customer's cart includes The Milk Shake at ₱125.00
    When the discount is applied at checkout
    Then the Milk Shake price becomes ₱75.00
    And ₱50.00 is deducted (no cap applied)

  Scenario: Order subtotal below discount value
    Given a Flat Amount Once Per Order discount of ₱100
    And a customer's cart subtotal of eligible items is ₱45.00
    When the discount is applied at checkout
    Then the discount is applied to the order subtotal
    And the subtotal becomes ₱0.00
    And the total discount is ₱45.00 (capped at subtotal)
```

---

### FR-3, FR-4 — Create Modal Flat Amount Radio Group

```gherkin
Feature: Create Discount Modal — "HOW DO YOU WANT TO APPLY THE DISCOUNT?" Radio Group

  Scenario: Radio group appears when Discount Type is Flat Amount
    Given a merchant is on the Create Discount modal
    When the merchant selects Discount Type = Flat Amount
    Then a "HOW DO YOU WANT TO APPLY THE DISCOUNT?" radio group appears
    And it shows two options:
      | Option | Label                                   | Example Text |
      | 1      | Customer saves money on the order subtotal | e.g. Cart has 3 items that cost 150, 75, 25. The ₱X discount is applied to the cart subtotal of ₱250. |
      | 2      | Customer saves money on every eligible item     | e.g. Cart has 3 items. The discount is applied to each one individually. |

  Scenario: Radio group does not appear for non-Flat Amount types
    Given a merchant is on the Create Discount modal
    When the merchant selects Discount Type = Discount (%)
    Then no "HOW DO YOU WANT TO APPLY THE DISCOUNT?" radio group is shown

  Scenario: Radio group does not appear for Free Shipping
    Given a merchant is on the Create Discount modal
    When the merchant selects Discount Type = Free Shipping
    Then no "HOW DO YOU WANT TO APPLY THE DISCOUNT?" radio group is shown

  Scenario: View modal label unchanged when option 1 is selected
    Given a merchant creates a Flat Amount discount with radio option 1 selected
    When the merchant views the discount in the View Discount Modal
    Then the Discount Type label shows "Flat Amount (Once Per Order)"

  Scenario: View modal label unchanged when option 2 is selected
    Given a merchant creates a Flat Amount discount with radio option 2 selected
    When the merchant views the discount in the View Discount Modal
    Then the Discount Type label shows "Flat Amount (Per Eligible Item)"
```

---

### FR-5, FR-6 — Cap Scenario Warning

```gherkin
Feature: Create Discount Modal — Cap Scenario Warning

  Scenario: Warning appears when minimum purchase amount is less than discount value
    Given a merchant is on the Create Discount modal
    And Discount Type = Flat Amount
    And Minimum Requirements = Minimum Purchase Amount
    When the merchant enters Discount Value = ₱100
    And the merchant enters Minimum Purchase Amount = ₱80
    Then an inline warning appears beneath the Minimum Purchase Amount field:
      """
      ⚠️ Your minimum purchase amount (₱80) is less than your discount value (₱100).
         If the order subtotal is less than ₱100, the discount will be capped at the order subtotal.
      """

  Scenario: Warning does not appear when minimum purchase amount equals discount value
    Given a merchant is on the Create Discount modal
    And Discount Type = Flat Amount
    And Minimum Requirements = Minimum Purchase Amount
    When the merchant enters Discount Value = ₱100
    And the merchant enters Minimum Purchase Amount = ₱100
    Then no warning is displayed

  Scenario: Warning auto-dismisses when merchant corrects the minimum amount
    Given the cap scenario warning is currently visible
    When the merchant updates the Minimum Purchase Amount to be ≥ Discount Value
    Then the warning disappears automatically without page refresh

  Scenario: Warning updates dynamically when discount value changes
    Given the cap scenario warning is currently showing ₱80 vs ₱100
    When the merchant changes the Discount Value to ₱70
    And the Minimum Purchase Amount is still ₱80
    Then the warning disappears (₱80 ≥ ₱70)

  Scenario: Warning is non-blocking — merchant can still save
    Given the cap scenario warning is currently visible
    When the merchant clicks Save
    Then the discount is saved successfully
    And no error is thrown

  Scenario: Warning does not appear when Minimum Requirements = None
    Given Discount Type = Flat Amount and Discount Value = ₱100
    And Minimum Requirements = None
    Then no warning is shown regardless of discount value

  Scenario: Warning does not appear for Discount (%) type
    Given Discount Type = Discount (%)
    And Minimum Requirements = Minimum Purchase Amount
    And Percentage Value = 50%
    And Minimum Purchase Amount = ₱30
    Then no warning is shown (warning is Flat Amount-only)
```

---

### FR-7, FR-8, FR-9 — Order Details Discount Line Display

```gherkin
Feature: Merchant Order Details — Discount Line Conditional Display

  Scenario: No cap — discount line displays as normal
    Given an order where the configured discount value is ₱100
    And the actual applied discount amount is ₱100 (no cap)
    When the merchant views the Order Details
    Then the discount line shows: "(Delivery Discount / ₱100)  ₱100.00"
    And no ? icon is displayed

  Scenario: Cap triggered — discount line shows partial amount with tooltip icon
    Given an order where the configured discount value is ₱100
    And the actual applied discount amount is ₱82 (cap triggered)
    When the merchant views the Order Details
    Then the discount line shows: "Discount: [?]  (Delivery Discount / ₱82.00 of ₱100)  ₱82.00"
    And a ? icon is displayed inline after "Discount:"

  Scenario: Hovering ? icon shows tooltip
    Given the ? icon is visible on the discount line
    When the merchant hovers over the ? icon
    Then a tooltip appears with text: "Discount capped at item price."

  Scenario: ? icon only appears when cap is triggered
    Given two orders — one with cap, one without
    Then the ? icon appears only on the order where the cap was triggered

  Scenario: Edge case — configured value equals applied amount with rounding
    Given a Discount (%) that results in the same configured and applied amount
    When the merchant views the Order Details
    Then no ? icon appears (no cap triggered for percentage types under normal conditions)
```

---

### FR-10, FR-11 — Checkout Discount Tag Tooltip

```gherkin
Feature: Online Store Checkout — Discount Tag Tooltip

  Scenario: Tooltip appears on hover for Flat Amount Once Per Order tag (desktop)
    Given a customer is on the checkout page
    And a Flat Amount (Once Per Order) discount is applied
    And the discount tag badge is shown on the order
    When the customer hovers over the discount tag
    Then a tooltip appears with text: "This discount applies to your order subtotal."

  Scenario: Tooltip appears on tap for Flat Amount Once Per Order tag (mobile)
    Given a customer is on the checkout page on a mobile device
    And a Flat Amount (Once Per Order) discount is applied
    When the customer taps the discount tag badge
    Then a tooltip appears with text: "This discount applies to your order subtotal."
    And tapping outside the tooltip dismisses it

  Scenario: Tooltip does NOT appear for Flat Amount Per Eligible Item
    Given a Flat Amount (Per Eligible Item) discount is applied
    When the customer hovers over the discount tag
    Then no tooltip is shown

  Scenario: Tooltip does NOT appear for Discount (%) type
    Given a Discount (%) discount is applied
    When the customer hovers over the discount tag
    Then no tooltip is shown

  Scenario: Tooltip does NOT appear for Free Shipping type
    Given a Free Shipping discount is applied
    When the customer hovers over the discount tag
    Then no tooltip is shown

  Scenario: Multiple items in cart — discount tag shown at cart level
    Given a cart with 3 items and a Flat Amount Once Per Order discount
    And the discount tag is shown at the cart/subtotal level
    When the customer hovers over the discount badge
    Then the tooltip appears with text: "This discount applies to your order subtotal."
    And no item-level discount tags are shown
```

---

### FR-12 — Unchanged Existing Behaviors (Regression Guard)

```gherkin
Feature: Existing Discount Behaviors — Regression Guard

  Scenario: Additional Fee is never discounted
    Given an order with a discount applied and an Additional Fee of ₱50
    When the order total is computed
    Then the Additional Fee remains ₱50 regardless of discount type or amount

  Scenario: Tax is computed on post-discount item prices
    Given an item priced at ₱100 with a 10% tax rate
    And a ₱20 flat discount is applied to that item
    When the order total is computed
    Then the tax is computed on ₱80 (not ₱100)

  Scenario: No. of Transactions counter increments on successful discount use
    Given a discount with 5 transactions recorded
    When a new order successfully applies this discount
    Then the No. of Transactions count becomes 6

  Scenario: Automatic discount applied without coupon code entry
    Given an Automatic discount that matches all cart conditions
    When the customer reaches checkout
    Then the discount is applied automatically
    And no promo code input is required from the customer

  Scenario: Coupon Code discount requires exact name entry
    Given a Coupon Code discount named "HABIBI"
    When the customer enters "HABIBI" and clicks Apply
    Then the discount is applied
    When the customer enters "habibi" and clicks Apply
    Then the outcome depends on case sensitivity behavior (open question — see OQ-1 equivalent)
```

---

# Traceability Map

| FR | Requirement Summary | Gherkin Scenario(s) |
|---|---|---|
| FR-1 | Order subtotal receives Once Per Order discount | "Discount applied to order subtotal", "Discount applied when only one product is eligible" |
| FR-2 | Cap at order subtotal; floor at zero | "Flat amount exceeds item price — cap applied", "Flat amount does not exceed item price — no cap", "Order subtotal below discount value" |
| FR-3 | Radio button group replaces checkbox when Discount Type = Flat Amount | "Radio group appears when Discount Type is Flat Amount", "Radio group does not appear for non-Flat Amount types", "Radio group does not appear for Free Shipping" |
| FR-4 | Two radio options with labels and examples | Covered by "Radio group appears when Discount Type is Flat Amount" |
| FR-5 | Inline warning when min purchase `<` discount value | "Warning appears when minimum purchase amount is less than discount value", "Warning does not appear when minimum purchase amount equals discount value", "Warning does not appear when Minimum Requirements = None", "Warning does not appear for Discount (%) type" |
| FR-6 | Warning is dynamic and auto-dismisses | "Warning auto-dismisses when merchant corrects the minimum amount", "Warning updates dynamically when discount value changes", "Warning is non-blocking — merchant can still save" |
| FR-7 | No-cap order details display unchanged | "No cap — discount line displays as normal" |
| FR-8 | Cap-triggered order details shows partial amount format | "Cap triggered — discount line shows partial amount with tooltip icon" |
| FR-9 | `?` icon with tooltip only when cap triggered | "Hovering ? icon shows tooltip", "? icon only appears when cap is triggered", "Edge case — configured value equals applied amount with rounding" |
| FR-10 | Checkout tooltip on hover/tap for Once Per Order tags | "Tooltip appears on hover for Flat Amount Once Per Order tag (desktop)", "Tooltip appears on tap for Flat Amount Once Per Order tag (mobile)", "Multiple items in cart — discount tag shown at cart level" |
| FR-11 | Tooltip NOT shown for other discount types | "Tooltip does NOT appear for Flat Amount Per Eligible Item", "Tooltip does NOT appear for Discount (%) type", "Tooltip does NOT appear for Free Shipping type" |
| FR-12 | Existing behaviors preserved | "Additional Fee is never discounted", "Tax is computed on post-discount item prices", "No. of Transactions counter increments on successful discount use", "Automatic discount applied without coupon code entry", "Coupon Code discount requires exact name entry" |
