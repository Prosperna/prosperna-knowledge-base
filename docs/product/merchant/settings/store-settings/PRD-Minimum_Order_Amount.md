---
id: minimum-order-amount
title: PRD. Minimum Order Amount
sidebar_label: Minimum Order Amount
sidebar_position: 4
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-31
- Status: Draft

---

## Summary

The Minimum Order Amount feature enables merchants to set a cart subtotal floor that customers must reach before proceeding to checkout. When enabled, the Online Store enforces this minimum in real time on the cart page (primary) and as a failsafe on the checkout page. The Merchant Dashboard provides a simple toggle + currency input in Store Settings. The minimum applies globally across all store locations and is checked against the pre-coupon product subtotal only.

---

## User Journey

### Happy Path

**Merchant — Configuring the Minimum**

1. Merchant navigates to Merchant Dashboard → Store Settings → Checkout / Order Settings.
2. Merchant finds the "Minimum Order Amount" section.
3. Merchant toggles the switch ON — the amount input field becomes active.
4. Merchant enters a positive currency amount (e.g., ₱500.00).
5. Merchant clicks Save.
6. A toast notification confirms the save. The minimum is now active on the Online Store immediately.

**Customer — Cart Below Minimum**

1. Customer visits the merchant's Online Store and adds items to the cart.
2. Customer navigates to the cart page. Cart subtotal is ₱300.00, minimum is ₱500.00.
3. A notice bar is displayed: *"Minimum order of ₱500.00 required to checkout. You need ₱200.00 more."*
4. The Checkout button is visually disabled. Hovering shows a tooltip: *"Add more items to meet the minimum order requirement."*
5. Customer adds more items. Cart subtotal reaches ₱500.00.
6. Notice bar disappears. Checkout button activates. Customer proceeds normally.

**Customer — Cart Meets or Exceeds Minimum**

1. Customer adds items totaling ₱600.00 (minimum is ₱500.00).
2. No notice bar is shown. Checkout button is active. No friction added to the flow.

### Alternate and Failure Paths

| Scenario | Path |
|---|---|
| Merchant toggles OFF without saving | Changes are discarded on navigation away — no minimum is enforced (consistent with existing save behavior) |
| Merchant enters ₱0 or leaves field blank when toggle is ON | Validation rejects save — field is required when toggle is ON |
| Merchant enters a negative value | Validation rejects — must be a positive number greater than zero |
| Merchant enters > ₱50,000 | Soft warning is shown: *"Are you sure? This may prevent most customers from checking out."* Save is still permitted |
| Customer applies a coupon that drops post-coupon total below minimum | No block — minimum is checked against pre-coupon product subtotal; coupon does not affect eligibility |
| Customer navigates directly to checkout URL with subtotal below minimum | Checkout page shows inline error banner and disables the place-order button; customer is directed back to cart |
| Customer removes item in checkout, dropping below minimum | `filteredCartData` change is detected; checkout button is disabled; error banner is shown |
| Feature is disabled mid-session by merchant | Customer's active checkout session is not disrupted; minimum is read at page load time |
| Free item (₱0) in cart | Contributes ₱0 to subtotal; does not help satisfy the minimum |
| Guest (non-logged-in) customer | Minimum enforcement applies equally to guests |
| Cart contains both physical and digital products | Minimum applies to combined pre-coupon subtotal across all selected cart items |

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Merchants must be able to enable or disable the Minimum Order Amount feature via a toggle in Store Settings |
| FR-2 | The amount input field must be disabled when the toggle is OFF and active when the toggle is ON, in real time without requiring a save |
| FR-3 | The amount input field must accept only positive numeric values greater than zero |
| FR-4 | A soft warning must be displayed in the Merchant Dashboard when the entered amount exceeds ₱50,000; the warning is non-blocking |
| FR-5 | The Save button must be disabled when no changes have been made from the last saved state |
| FR-6 | On successful save, a toast notification must confirm the operation |
| FR-7 | After a successful save, the new minimum must take effect on the Online Store immediately |
| FR-8 | The minimum applies globally to all of the merchant's store locations — no per-location configuration |
| FR-9 | On the cart page, when `is_minimum_order_enabled` is true and `cartSubtotal < minimumOrderAmount`, a notice bar must be displayed showing the configured minimum and the shortfall amount |
| FR-10 | The Checkout button must be visually disabled (not hidden) when the cart subtotal is below the configured minimum |
| FR-11 | When hovering or tapping the disabled Checkout button, a tooltip must be shown: *"Add more items to meet the minimum order requirement."* |
| FR-12 | The notice bar and Checkout button state must update in real time as the customer adds, removes, or changes the quantity of items in the cart |
| FR-13 | On the checkout page, if the filtered cart subtotal is below the configured minimum, an inline error banner must be shown and the place-order button must be disabled |
| FR-14 | The minimum order check must always use the pre-coupon product subtotal (`item_sub_total` per cart item); coupon or promo code deductions do not affect eligibility |
| FR-15 | When `is_minimum_order_enabled` is false or `minimumOrderAmount` is 0, no enforcement must occur at any touchpoint |
| FR-16 | Backend must optionally enforce the minimum as a server-side guard on order creation (`POST /v1/computations/`), rejecting orders where the cart subtotal is below the configured minimum |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The cart page notice bar and button state change must re-render within 200ms of a cart item change (React state update — no additional network call required) |
| NFR-2 | The merchant save operation must complete within 3 seconds under normal network conditions |
| NFR-3 | The feature toggle and amount field must be accessible (WCAG 2.1 AA): proper label associations, disabled state announced by screen readers, tooltip accessible via keyboard focus |
| NFR-4 | All currency amounts displayed to customers must use the existing `ToStandardNumberFormat()` utility and the `CURRENCY` constant for consistent formatting |
| NFR-5 | API changes are additive only — no breaking changes to existing fields or response shapes |
| NFR-6 | The minimum order amount value is stored server-side and not solely in browser state, ensuring it survives page refresh |
| NFR-7 | Merchant configuration changes do not require a deployment — the feature is fully runtime-configurable |

---

## UX Notes

- **Merchant Dashboard**
  - The MinimumOrderAmount component is modeled on the existing `OrderSettings` component: same card layout (`SectionCard`), same toggle pattern (`Form.Check` type="switch"), same save/toast pattern (`MyNotification`).
  - Helper text below the amount input (always visible when toggle is ON): *"Customers will not be able to proceed to checkout if their cart total is below this amount."*
  - The amount input uses currency formatting (₱) consistent with `CurrencyFormatter`.
  - The soft high-value warning (> ₱50,000) appears inline below the amount field — not as a modal or blocking dialog.

- **Online Store — Cart Page**
  - Notice bar position: top of cart page or immediately above the Checkout button section — whichever is more prominent in the existing layout.
  - Notice bar message: *"Minimum order of ₱[amount] required to checkout. You need ₱[shortfall] more."*
  - The Checkout button uses the existing `showDisabledButton` pattern. The minimum order condition is an additional input to this existing boolean state — no new button variants needed.
  - The notice bar must disappear (not fade) the moment the subtotal meets the minimum. Transitions should be fast and non-distracting.

- **Online Store — Checkout Page**
  - Inline error banner at the top of the checkout page: *"Your order does not meet the minimum order amount of ₱[amount]. Please go back and add more items."*
  - The banner must include the exact configured amount and a clear call to action (go back to cart).
  - The place-order button uses the existing `checkoutButtonDisabled` state. The minimum order check is an additional condition — no new button variants needed.

---

## Data Model Notes

Two new fields are added at the merchant (business) level — not per-location:

| Field | Type | Default | Description |
|---|---|---|---|
| `is_minimum_order_enabled` | Boolean | `false` | Whether the minimum order amount feature is active for the merchant |
| `minimum_order_amount` | Number (decimal) | `0` | The configured minimum cart subtotal in the merchant's currency (₱) |

These fields are stored alongside existing order settings in the backend. No new database table or collection is required — they extend the existing order settings data structure.

**Subtotal calculation (pre-coupon product subtotal):**
```
cartSubtotal = sum of item_sub_total across all selected cart items
shortfall    = minimumOrderAmount − cartSubtotal   (only when cartSubtotal < minimumOrderAmount)
```

---

## Integrations and APIs

| Integration | Change | Direction |
|---|---|---|
| `GET /business-profile/order/settings` | Return `is_minimum_order_enabled` and `minimum_order_amount` | Backend → Merchant Dashboard |
| `PUT /business-profile/order/update/settings` | Accept and persist `is_minimum_order_enabled` and `minimum_order_amount` | Merchant Dashboard → Backend |
| `GET /v1/store-business-profile/details/public` | Include `is_minimum_order_enabled` and `minimum_order_amount` in public store payload | Backend → Online Store |
| `POST /v1/computations/` (optional) | Reject order creation if cart subtotal < configured minimum (server-side guard) | Online Store → Backend |

---

## Error Handling

| Error Scenario | Surface | Handling |
|---|---|---|
| Merchant saves with toggle ON and empty amount | Merchant Dashboard | Inline field validation error: *"Please enter a valid minimum order amount."* Save is blocked. |
| Merchant enters zero or negative amount | Merchant Dashboard | Inline validation: *"Amount must be greater than zero."* Save is blocked. |
| Merchant save request fails (network/server error) | Merchant Dashboard | Error toast notification consistent with existing error handling pattern |
| Customer attempts checkout below minimum (UI) | Cart page | Button disabled + notice bar (no error — informative UX) |
| Customer reaches checkout page below minimum | Checkout page | Inline error banner + disabled place-order button |
| Backend rejects order creation below minimum (optional guard) | API response | `400 Bad Request` with error code `MINIMUM_ORDER_NOT_MET` and message including the configured minimum |

---

## Telemetry and Analytics

| Event | Trigger | Properties |
|---|---|---|
| `minimum_order_enabled` | Merchant toggles ON and saves | `merchant_id`, `minimum_order_amount` |
| `minimum_order_disabled` | Merchant toggles OFF and saves | `merchant_id` |
| `minimum_order_amount_changed` | Merchant changes the amount and saves | `merchant_id`, `old_amount`, `new_amount` |
| `minimum_order_notice_shown` | Cart page notice bar renders for a customer | `merchant_id`, `store_id`, `cart_subtotal`, `minimum_order_amount`, `shortfall` |
| `minimum_order_checkout_blocked` | Customer reaches checkout page with subtotal below minimum | `merchant_id`, `store_id`, `cart_subtotal`, `minimum_order_amount` |
| `minimum_order_met` | Cart subtotal crosses minimum threshold (notice bar disappears) | `merchant_id`, `store_id`, `cart_subtotal`, `minimum_order_amount` |

---

## Rollout Plan

1. Backend changes deployed first: extend order settings model and public store profile endpoint.
2. Merchant Dashboard component released (feature is off by default — no customer impact until a merchant enables it).
3. Online Store enforcement logic deployed (no effect until backend returns a non-zero minimum for a given merchant).
4. Merchants can self-enable at any time via Store Settings after release.
5. No phased rollout or feature flag required beyond the per-merchant toggle.

---

## Open Questions

| ID | Question | Assumption |
|---|---|---|
| OQ-1 | What is the exact parent navigation section for the MinimumOrderAmount component in Merchant Dashboard — Checkout Settings or Order Rules? | Assumed to be within `Store Settings` page, co-located with `OrderSettings`. Confirm during implementation. |
| OQ-2 | Should the server-side guard on `POST /v1/computations/` be part of the initial release or a follow-up? | Assumed optional for the initial release; treat as a recommended follow-up if resourcing allows. |
| OQ-3 | Is the ₱50,000 high-value warning threshold the correct value, or should it be configurable? | Assumed fixed at ₱50,000 for initial release. |
| OQ-4 | Should the analytics events be emitted on the frontend or backend? | Assumed frontend for customer-facing events and backend for merchant configuration events, consistent with existing patterns. |

---

# Gherkin User Stories

## Feature: Minimum Order Amount

---

### Scenario: Merchant enables minimum order amount

```gherkin
Feature: Minimum Order Amount — Merchant Configuration

  Scenario: Merchant enables the minimum order amount with a valid amount
    Given the merchant is logged in to the Merchant Dashboard
    And the merchant navigates to Store Settings > Checkout / Order Settings
    And the Minimum Order Amount toggle is currently OFF
    When the merchant toggles the Minimum Order Amount switch ON
    Then the amount input field becomes active and editable
    When the merchant enters "500" in the amount field
    And the merchant clicks Save
    Then a toast notification confirms "Settings saved successfully"
    And the minimum order amount is now active on the Online Store
```

---

### Scenario: Merchant disables minimum order amount

```gherkin
  Scenario: Merchant disables the minimum order amount
    Given the merchant is logged in to the Merchant Dashboard
    And the Minimum Order Amount toggle is currently ON with amount ₱500.00
    When the merchant toggles the Minimum Order Amount switch OFF
    And the merchant clicks Save
    Then a toast notification confirms "Settings saved successfully"
    And no minimum order enforcement occurs on the Online Store
```

---

### Scenario: Merchant attempts to save with toggle ON and empty amount

```gherkin
  Scenario: Save blocked when toggle is ON but amount is blank
    Given the merchant has toggled Minimum Order Amount ON
    And the amount input field is empty
    When the merchant clicks Save
    Then an inline validation error is shown: "Please enter a valid minimum order amount."
    And the save request is not submitted
```

---

### Scenario: Merchant enters zero or negative amount

```gherkin
  Scenario: Save blocked for zero or negative amount
    Given the merchant has toggled Minimum Order Amount ON
    When the merchant enters "0" in the amount field
    And the merchant clicks Save
    Then an inline validation error is shown: "Amount must be greater than zero."
    And the save request is not submitted

  Scenario: Save blocked for negative amount
    Given the merchant has toggled Minimum Order Amount ON
    When the merchant enters "-100" in the amount field
    Then the field rejects the negative input
    And the save request is not submitted
```

---

### Scenario: Merchant enters an unusually high amount

```gherkin
  Scenario: Soft warning shown for high minimum amount
    Given the merchant has toggled Minimum Order Amount ON
    When the merchant enters "60000" in the amount field
    Then a soft warning is displayed: "Are you sure? This may prevent most customers from checking out."
    And the Save button remains enabled
    When the merchant clicks Save
    Then the amount ₱60,000.00 is saved successfully
    And a toast notification confirms the save
```

---

### Scenario: Amount field is disabled when toggle is OFF

```gherkin
  Scenario: Amount field is disabled when toggle is off
    Given the merchant is on the Minimum Order Amount configuration section
    And the toggle is in the OFF state
    Then the amount input field is visually greyed out and not editable
    When the merchant toggles the switch ON
    Then the amount input field becomes immediately active without a page reload
```

---

### Scenario: Save button is disabled when there are no changes

```gherkin
  Scenario: Save button disabled when no changes have been made
    Given the merchant opens the Minimum Order Amount section
    And the current saved state is: toggle ON, amount ₱500.00
    And the merchant has not changed any values
    Then the Save button is disabled
    When the merchant changes the amount to ₱600.00
    Then the Save button becomes enabled
```

---

### Scenario: Customer sees notice bar when cart is below minimum

```gherkin
Feature: Minimum Order Amount — Cart Page Enforcement

  Scenario: Notice bar is shown when cart subtotal is below minimum
    Given the merchant has set a minimum order amount of ₱500.00
    And the customer is on the cart page with a cart subtotal of ₱300.00
    Then a notice bar is displayed: "Minimum order of ₱500.00 required to checkout. You need ₱200.00 more."
    And the Checkout button is visually disabled
```

---

### Scenario: Checkout button has tooltip when disabled due to minimum

```gherkin
  Scenario: Tooltip shown on hover of disabled Checkout button
    Given the customer's cart subtotal is below the minimum order amount
    When the customer hovers over or taps the disabled Checkout button
    Then a tooltip is displayed: "Add more items to meet the minimum order requirement."
```

---

### Scenario: Notice bar disappears when cart subtotal meets minimum

```gherkin
  Scenario: Real-time update when cart subtotal meets minimum
    Given the customer is on the cart page
    And the notice bar is displayed because cart subtotal is ₱300.00 and minimum is ₱500.00
    When the customer adds an item worth ₱200.00 to the cart
    Then the cart subtotal becomes ₱500.00
    And the notice bar disappears immediately
    And the Checkout button becomes active
```

---

### Scenario: Notice bar reappears when cart subtotal drops below minimum

```gherkin
  Scenario: Real-time update when cart subtotal drops below minimum
    Given the customer is on the cart page
    And the Checkout button is active because cart subtotal is ₱500.00 and minimum is ₱500.00
    When the customer removes an item worth ₱100.00
    Then the cart subtotal drops to ₱400.00
    And the notice bar reappears: "Minimum order of ₱500.00 required to checkout. You need ₱100.00 more."
    And the Checkout button becomes disabled
```

---

### Scenario: No enforcement when minimum order is disabled

```gherkin
  Scenario: No minimum enforcement when feature is disabled
    Given the merchant has the Minimum Order Amount toggle set to OFF
    And the customer has a cart subtotal of ₱50.00
    When the customer views the cart page
    Then no notice bar is displayed
    And the Checkout button is active (subject only to other existing conditions)
```

---

### Scenario: Coupon does not allow bypassing minimum

```gherkin
Feature: Minimum Order Amount — Coupon Interaction

  Scenario: Coupon does not cause below-minimum cart to be blocked or unblocked differently
    Given the merchant has set a minimum order amount of ₱300.00
    And the customer has a cart pre-coupon subtotal of ₱350.00
    And the customer applies a coupon for ₱100.00 off, making the post-coupon total ₱250.00
    When the customer views the cart page
    Then no notice bar is displayed (pre-coupon subtotal ₱350.00 >= ₱300.00)
    And the Checkout button is active

  Scenario: Below-minimum cart is still blocked even with a coupon applied
    Given the merchant has set a minimum order amount of ₱300.00
    And the customer has a cart pre-coupon subtotal of ₱250.00
    And the customer applies a coupon for ₱100.00 off
    When the customer views the cart page
    Then the notice bar is displayed (pre-coupon subtotal ₱250.00 < ₱300.00)
    And the Checkout button is disabled
```

---

### Scenario: Checkout page failsafe blocks order placement

```gherkin
Feature: Minimum Order Amount — Checkout Page Failsafe

  Scenario: Checkout page shows error banner and disables submit when subtotal is below minimum
    Given the merchant has set a minimum order amount of ₱500.00
    And the customer is on the checkout page with a filtered cart subtotal of ₱300.00
    Then an inline error banner is displayed: "Your order does not meet the minimum order amount of ₱500.00. Please go back and add more items."
    And the place-order button is disabled
```

---

### Scenario: Guest customer is subject to minimum enforcement

```gherkin
  Scenario: Minimum order enforcement applies to guest customers
    Given the merchant has set a minimum order amount of ₱500.00
    And a guest (non-logged-in) customer has a cart subtotal of ₱200.00
    When the customer views the cart page
    Then the notice bar is displayed with the correct minimum and shortfall
    And the Checkout button is disabled
```

---

### Scenario: Free items do not satisfy minimum

```gherkin
  Scenario: Free products do not count toward minimum amount
    Given the merchant has set a minimum order amount of ₱500.00
    And the customer's cart contains only free items (₱0 each) totaling ₱0.00
    When the customer views the cart page
    Then the notice bar is displayed: "Minimum order of ₱500.00 required to checkout. You need ₱500.00 more."
    And the Checkout button is disabled
```

---

### Scenario: Mixed product types — combined subtotal is used

```gherkin
  Scenario: Minimum applies to combined subtotal of physical and digital products
    Given the merchant has set a minimum order amount of ₱300.00
    And the customer's cart contains a physical product worth ₱200.00 and a digital product worth ₱150.00
    Then the combined pre-coupon subtotal is ₱350.00
    And no notice bar is displayed
    And the Checkout button is active
```

---

# Traceability Map

| FR | Requirement Summary | Gherkin Scenario(s) |
|---|---|---|
| FR-1 | Merchants can enable/disable via toggle | Merchant enables minimum; Merchant disables minimum |
| FR-2 | Amount field disabled/enabled mirrors toggle in real time | Amount field is disabled when toggle is OFF |
| FR-3 | Amount must be positive number > 0 | Save blocked for zero or negative amount |
| FR-4 | Soft warning for amounts > ₱50,000 | Soft warning shown for high minimum amount |
| FR-5 | Save button disabled when no changes | Save button disabled when no changes have been made |
| FR-6 | Toast notification on successful save | Merchant enables minimum; Merchant disables minimum; High amount save |
| FR-7 | New minimum takes effect immediately after save | Merchant enables minimum (implied — enforcement is immediate) |
| FR-8 | Global across all store locations | (covered by architecture — no per-location scenario needed) |
| FR-9 | Notice bar shown on cart page when below minimum | Notice bar shown; Real-time reappears |
| FR-10 | Checkout button visually disabled (not hidden) when below minimum | Notice bar shown; Real-time reappears |
| FR-11 | Tooltip on hover of disabled Checkout button | Tooltip shown on hover |
| FR-12 | Real-time update of notice bar and button state | Real-time disappears; Real-time reappears |
| FR-13 | Checkout page failsafe: error banner + disabled submit | Checkout page failsafe blocks order placement |
| FR-14 | Minimum checked against pre-coupon product subtotal | Coupon does not bypass minimum; Below-minimum blocked with coupon |
| FR-15 | No enforcement when feature is disabled or amount is 0 | No enforcement when minimum is disabled |
| FR-16 | Optional backend guard on order creation | (covered by ENDPOINT doc — backend rejects below-minimum orders) |
