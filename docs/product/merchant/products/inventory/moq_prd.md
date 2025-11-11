---
id: minimum-order-quantity
title: Minimum Order Quantity (MOQ) PRD
sidebar_label: Minimum Order Quantity PRD
sidebar_position: 1
---

## Minimum Order Quantity (MOQ) Feature

Agile-focused PRD documenting the implementation of Minimum Order Quantity (MOQ) feature for Prosperna's merchant dashboard and storefront, enabling merchants to set minimum purchase requirements per product and automatically enforce these rules during customer checkout.

---

## Document Control

| Item           | Details                              |
| -------------- | ------------------------------------ |
| Document Title | Minimum Order Quantity (MOQ) Feature |
| Version        | 0.1                                  |
| Date           | November 10, 2025                    |
| Prepared by    | Business Analyst                     |
| Reviewed by    | To be assigned                       |
| Approved by    | To be assigned                       |
| Status         | For Review                           |
| Related BRD    | To be created                        |

---

## Revision History

| Version | Date         | Author           | Change Description                |
| ------- | ------------ | ---------------- | --------------------------------- |
| 0.1     | Nov 10, 2025 | Business Analyst | Initial draft - MOQ specification |

---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements, acceptance criteria (using BDD/Gherkin), and technical specifications for implementing Minimum Order Quantity (MOQ) functionality in Prosperna's merchant dashboard and storefront. The feature enables merchants to set minimum purchase quantities per product and automatically enforce these rules during the customer shopping experience, from product browsing through checkout completion.

### 1.2 Feature Vision

Enable Prosperna merchants to define and enforce minimum order quantities for their products, allowing them to optimize inventory management, reduce fulfillment costs, and implement business rules that require customers to purchase products in specific minimum quantities. The feature seamlessly integrates into both the merchant dashboard (for configuration) and the customer-facing storefront (for enforcement and validation), providing clear feedback and preventing purchases below specified thresholds.

### 1.3 Success Criteria

**User Adoption & Usage:**

- 40% of merchants enable MOQ on at least one product within 60 days of feature launch
- 70% of merchants with wholesale business models adopt MOQ within 30 days
- MOQ-enabled products represent at least 25% of total product catalog for adopting merchants
- 80% reduction in support tickets related to "customer ordered less than minimum quantity"

**Technical Performance:**

- MOQ validation completes in less than 500ms at cart and checkout levels
- 99.9% successful MOQ rule enforcement (zero bypasses)
- MOQ settings save and propagate to storefront in less than 3 seconds
- Cart validation with MOQ rules processes in less than 1 second for carts with 50+ items
- Product page loads with MOQ indicators in less than 2 seconds (P95)

**Business Impact:**

- 30% reduction in unprofitable small-quantity orders for merchants using MOQ
- 25% increase in average order value (AOV) for products with MOQ enabled
- 60% reduction in manual order cancellations due to quantity constraints
- 15% improvement in inventory turnover for bulk/wholesale products
- Merchant satisfaction score of 4.5/5 for MOQ feature usability

**User Satisfaction:**

- NPS +10 points for merchants using MOQ feature
- Less than 5% support tickets related to MOQ configuration confusion
- 90% task success rate in usability testing for setting up MOQ rules
- 85% customer understanding of MOQ requirements based on storefront messaging
- Less than 2% cart abandonment attributed directly to MOQ enforcement

### 1.4 Related Documents

- [Competitor Research - Minimum Order Quantity](https://pkb.prosperna.ph/docs/product/competitor-analysis/Minimum%20Order%20Quantity)
- [MOQ Feature Prototype](https://p1-ba-pocs.vercel.app/moq)

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

Prosperna merchants, particularly those operating wholesale businesses, selling bulk products, or managing specialty items with specific packaging/production requirements, are unable to enforce minimum purchase quantities on their products. Currently, the platform defaults to allowing customers to purchase any product at a quantity of 1, regardless of the merchant's business model or product economics.

This creates critical operational and financial challenges:

1. **Manual Intervention Required:** Merchant receives order for 3 units of a product that must be sold in cases of 12
2. **No Automated Enforcement:** System allows order to proceed through checkout
3. **Post-Purchase Communication:** Merchant must contact customer to explain minimum quantity requirement
4. **Order Modification/Cancellation:** Merchant must either manually adjust order or cancel and refund
5. **Customer Dissatisfaction:** Customer frustrated by delayed fulfillment or unexpected requirement
6. **Revenue Loss:** Customer may abandon order rather than increase quantity
7. **Operational Inefficiency:** Merchant wastes time on manual corrections and customer service

### 2.2 Current State

**Current Product Quantity Behavior:**

1. **Merchant Dashboard - Product Configuration:**

   - Product creation form includes basic quantity fields (stock quantity)
   - NO field for setting minimum order quantity

2. **Storefront - Product Page:**

   - Quantity selector defaults to 1
   - Customers can select any quantity from 1 to stock availability
   - NO visual indication of minimum quantity requirements
   - NO validation preventing quantity below merchant's desired minimum
   - Plus (+) and Minus (-) buttons allow any positive integer

3. **Storefront - Cart:**

   - Customers can freely modify quantities
   - Quantity can be reduced to 1 or increased up to stock limit
   - NO validation checking minimum quantity requirements
   - NO warning messages about quantity constraints

4. **Storefront - Checkout:**

   - Order proceeds with any quantity customer has added
   - NO final validation against minimum requirements
   - System processes order regardless of merchant's business rules

5. **Post-Order Processing:**
   - Merchant receives order notification
   - Merchant manually reviews each order
   - Merchant contacts customer if quantity below internal threshold
   - Manual order adjustment or cancellation required

### 2.3 Desired Future State

**Enhanced Product Configuration with MOQ Support:**

1. **Merchant Dashboard - Product Settings (Price Section):**

   - **New "Minimum Order Quantity" Section** within Price page
   - Section includes:
     - **Heading:** "Minimum Order Quantity"
     - **Description text:** "Enabling this switch will require customers to purchase at least the specified quantity. The quantity field will default to this amount, and customers cannot add fewer items to their cart."
     - **Toggle switch** (default: OFF, gray; when enabled: green)
   - **MOQ Input Field:**
     - Label: "Minimum quantity per order:"
     - Numeric input field with "units" suffix
     - Default value when enabled: Empty (merchant must enter value)
     - Minimum allowed: 2 units
     - Maximum allowed: 100 units
     - Field is disabled (grayed out) when toggle is OFF
     - Field becomes active when toggle is ON
   - **No custom message field** in initial implementation
   - Settings save via "Save" button at bottom of page

2. **Storefront - Product Page with MOQ Enforcement:**

   - **Quantity Selector Behavior:**

     - When MOQ is disabled (or = 1): quantity selector defaults to 1
     - When MOQ is enabled: quantity selector defaults to MOQ value
     - Input field shows current quantity value
     - Minus (-) button behavior:
       - Enabled when quantity > MOQ
       - Disabled when quantity = MOQ (visual indication: grayed out)
     - Plus (+) button: always enabled, allows increasing beyond MOQ
     - Manual input field:
       - Accepts numeric input
       - Validates on change/blur
       - If user enters value < MOQ: shows inline validation error

   - **Validation Error Display:**

     - Error message appears below quantity selector
     - Format: "Minimum order of (x) units is required"
     - Styling: Red text, small font size
     - Error clears when quantity >= MOQ
     - Input field shows red border when error is active

   - **Add to Cart Behavior:**
     - "Add to Cart" button is disabled when validation error exists
     - Button shows normal state when quantity >= MOQ
     - Clicking Add to Cart when quantity < MOQ: no action (button disabled)
     - When quantity is valid: product added to cart successfully

3. **Storefront - Floating Cart Panel:**

   - **Cart Item Display:**

     - Shows product image, name, price, quantity
     - Displays quantity controls: minus (-), input field, plus (+)
     - Shows individual item total and cart total
     - Delete icon (trash) to remove item

   - **Quantity Editing in Cart:**

     - Quantity input field allows direct numeric entry
     - Minus (-) button to decrease quantity
     - Plus (+) button to increase quantity
     - Real-time validation on quantity change

   - **MOQ Validation in Cart:**

     - If item quantity < MOQ: inline error appears below quantity controls
     - Error message: "Minimum order of (x) units is required"
     - Error styling: red text
     - Input field shows red border when violating MOQ

   - **Checkout Button State:**
     - "Checkout" button disabled when any cart item has MOQ violation
     - Button enabled only when all items meet MOQ requirements
     - "Continue Shopping" button always available

4. **Storefront - Cart Page (Full Cart View):**

   - **Cart Table Layout:**

     - Columns: Product, Product Type, Price, Quantity, Total, Actions
     - Each row shows one cart item
     - Product column: image + name
     - Product Type: badge showing "Physical"
     - Price: unit price
     - Quantity: numeric input field (not increment/decrement buttons on table)
     - Total: calculated total for that line item
     - Actions: trash icon to remove item

   - **Quantity Validation:**

     - Input field accepts direct numeric entry
     - Real-time validation on change
     - If quantity < MOQ: error message displays below input
     - Error format: "Minimum order of (x) units is required"
     - Input field shows red border on validation error

   - **Cart Actions:**

     - "Continue Shopping" button: returns to product browsing
     - "Checkout" button: proceeds to checkout
     - Checkout button disabled when any item violates MOQ
     - Remove item button (trash icon): removes item from cart

   - **Order Summary Sidebar:**
     - Shows "Total" and "Grand Total"
     - Calculates sum of all valid cart items

5. **Validation Logic & Rules:**

   - **MOQ Check Timing:**

     - On product page: before Add to Cart
     - In floating cart: on quantity change
     - In cart page: on quantity change
     - Before checkout: final validation check

   - **Validation Behavior:**

     - Quantity < MOQ: show error, disable checkout
     - Quantity >= MOQ: clear error, enable checkout
     - Error persists until quantity corrected or item removed

   - **Edge Cases:**
     - If MOQ changes while item in cart: re-validate all cart items
     - If MOQ is disabled: remove all validations (treat as MOQ = 1)
     - Empty cart: no validation needed

**Benefits After Implementation:**

- **Automated Enforcement:** Zero manual intervention needed for quantity requirement enforcement
- **Clear Customer Communication:** Customers see minimum requirements before attempting purchase
- **Reduced Order Issues:** 95% reduction in below-minimum quantity orders
- **Time Savings:** Merchants save 10-15 minutes per avoided order correction
- **Improved Customer Experience:** Clear expectations set upfront, no post-purchase surprises
- **Business Model Enablement:** Merchants can confidently implement wholesale/bulk strategies
- **Revenue Protection:** Prevents unprofitable small orders from entering fulfillment pipeline

### 2.4 Target Users

| User Segment                          | Description                          | Use Case                                                    | MOQ Typical Range   |
| ------------------------------------- | ------------------------------------ | ----------------------------------------------------------- | ------------------- |
| Wholesale Merchants                   | B2B sales, bulk orders               | Enforce case/pack quantities (6, 12, 24, 48)                | 6-100 units         |
| Food & Beverage Vendors               | Packaged goods, perishables          | Sell by case/box due to packaging and shipping requirements | 6-24 units          |
| Manufacturing Supply Merchants        | Industrial components, raw materials | Minimum production run quantities                           | 12-500 units        |
| Print-on-Demand Businesses            | Custom printed items                 | Minimum order to justify setup/production costs             | 10-50 units         |
| Specialty/Handcrafted Product Sellers | Artisan goods, custom items          | Minimum quantity to cover labor and material costs          | 3-12 units          |
| Event/Party Supply Merchants          | Bulk party supplies, decorations     | Sell in party-sized quantities                              | 12-100 units        |
| Beauty/Cosmetics Wholesalers          | Skincare, makeup, personal care      | Distributor requirements and sample sets                    | 6-24 units          |
| Agricultural Product Sellers          | Fresh produce, bulk grains           | Minimum shipping quantities for freshness                   | 5-50 units (kg/lbs) |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**

- MOQ feature must work with existing product and variant data structures
- Validation must occur at multiple levels: frontend (UX), backend API (security), checkout (final enforcement)
- Must support both simple products and products with multiple variants
- MOQ settings must be backward compatible
- Cart and checkout APIs must validate MOQ without performance degradation
- Mobile responsive design required for all MOQ UI elements
- Must integrate with existing inventory management and stock validation systems

**Business Constraints:**

- Cannot break existing merchant workflows or product configurations
- Must maintain current cart/checkout conversion rates for non-MOQ products
- Should not increase page load times beyond 200ms for MOQ-enabled products
- Must comply with Philippine ecommerce regulations regarding product disclosures
- Error messaging must be clear and non-technical for end customers
- Implementation must allow for future expansion (max quantity, step quantities, cart-level MOQ)

**Key Assumptions:**

- Merchants understand their own minimum quantity requirements based on business economics
- Merchants will set realistic MOQ values that don't significantly harm conversion rates
- Customers are willing to purchase minimum quantities when clearly communicated
- MOQ validation at multiple touchpoints prevents bypasses and manipulation
- Default MOQ messaging is sufficient
- Merchants will test MOQ settings before enabling on live products
- Most merchants will apply MOQ to subset of products (not entire catalog)

**User Experience Assumptions:**

- Customers expect to see minimum quantity requirements before attempting purchase
- Inline validation errors are more effective than checkout-level blocking
- Resetting quantity selector to MOQ default reduces customer frustration
- Customers prefer clear error messages over silent cart failures

**Data & Performance Assumptions:**

- Average products per cart: 3-8 items
- MOQ validation adds less than 100ms to cart operations
- Less than 15% of products in catalog will have MOQ enabled
- MOQ rules checked on every cart modification (add, update, remove)
- Database queries for MOQ settings can be cached and optimized

---

## 3. Functional Requirements & BDD Scenarios

---

### Feature F-01: MOQ Configuration in Merchant Dashboard

#### 3.1.1 Feature Context

Allow merchants to enable and configure Minimum Order Quantity (MOQ) settings for products in the Price section of the product edit page. This provides merchants with control over minimum purchase requirements to align with their business model and product economics.

#### 3.1.2 Business Rules

**BR-01: MOQ Toggle Control**

- MOQ feature is disabled by default for all products (existing and new)
- Toggle switch controls whether MOQ is active for the product
- When toggle is OFF: MOQ input field is disabled and grayed out
- When toggle is ON: MOQ input field becomes active and editable
- Toggle state persists after save

**BR-02: MOQ Value Input Validation**

- MOQ value must be a positive integer
- Minimum allowed value: 2 units
- Maximum allowed value: 100 units
- Input field shows "units" suffix for clarity
- Input field is numeric-only (no decimals, letters, or special characters)
- Empty field when enabled requires merchant to enter value before saving
- Value of 1 is not allowed (use toggle OFF instead)

**BR-03: MOQ Settings Persistence**

- MOQ settings save when merchant clicks "Save" button at bottom of page
- Settings persist to database and propagate to storefront immediately
- Changes take effect for new cart additions after save
- Existing cart items are re-validated against new MOQ settings

**BR-04: MOQ Display Rules**

- MOQ setting only affects storefront when toggle is ON and value >= 2
- When toggle is OFF or value = 1: product behaves as standard (no MOQ enforcement)
- MOQ validation applies to product page, floating cart, cart page, and checkout

#### 3.1.3 Scenarios

##### Scenario 1: Merchant enables MOQ toggle

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is currently OFF
And the MOQ input field is disabled and grayed out
When the merchant clicks the MOQ toggle switch
Then the toggle switches to ON state (green color)
And the MOQ input field becomes enabled (no longer grayed out)
And the input field is ready to accept numeric input
And the cursor focus moves to the MOQ input field
```

##### Scenario 2: Merchant disables MOQ toggle

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is currently ON
And the MOQ input field shows a value of "5"
When the merchant clicks the MOQ toggle switch
Then the toggle switches to OFF state (gray color)
And the MOQ input field becomes disabled and grayed out
And the previously entered value "5" is preserved but inactive
And MOQ validation will not apply to this product on the storefront
```

##### Scenario 3: Merchant enters valid MOQ value

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field is empty and active
When the merchant types "12" into the MOQ input field
Then the field displays "12"
And the "units" suffix appears after the number
And no validation error is shown
And the merchant can proceed to save
```

##### Scenario 4: Merchant enters MOQ value below minimum (less than 2)

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field is empty and active
When the merchant types "1" into the MOQ input field
And the merchant clicks outside the input field (blur event)
Then a validation error message appears below the input field
And the error message reads "Minimum value must be at least 2 units"
And the input field border turns red
And the "Save" button may be disabled or show warning
```

##### Scenario 5: Merchant enters MOQ value above maximum (more than 100)

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field is empty and active
When the merchant types "150" into the MOQ input field
And the merchant clicks outside the input field (blur event)
Then a validation error message appears below the input field
And the error message reads "Maximum value cannot exceed 100 units"
And the input field border turns red
And the "Save" button may be disabled or show warning
```

##### Scenario 6: Merchant saves MOQ settings successfully

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field shows a valid value of "6"
And there are no validation errors
When the merchant clicks the "Save" button at the bottom of the page
Then the system saves the MOQ settings to the database
And a success toast notification appears (e.g., "Product settings saved successfully")
And the MOQ value "6" is now active for this product on the storefront
And the page remains on the product edit view
```

##### Scenario 7: Merchant attempts to save with empty MOQ field when toggle is ON

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field is empty
When the merchant clicks the "Save" button
Then a validation error appears for the MOQ field
And the error message reads "Please enter a minimum quantity value"
And the save operation is blocked
And the merchant must enter a valid value before saving
```

---

### Feature F-02: MOQ Enforcement on Product Page

#### 3.2.1 Feature Context

Enforce minimum order quantity rules on the product page by controlling the quantity selector default value, button states, and validation feedback. This ensures customers understand and comply with MOQ requirements before adding items to cart.

#### 3.2.2 Business Rules

**BR-05: Quantity Selector Initial State**

- When MOQ is disabled: quantity selector defaults to 1
- When MOQ is enabled: quantity selector defaults to MOQ value
- Quantity selector shows numeric input field with increment/decrement buttons
- Default quantity value loads immediately when page loads

**BR-06: Quantity Increment/Decrement Controls**

- Plus (+) button: always enabled, increases quantity by 1
- Minus (-) button:
  - Enabled when current quantity > MOQ
  - Disabled (grayed out) when current quantity = MOQ
  - Cannot reduce quantity below MOQ
- Manual input field allows direct numeric entry
- Input validates on change and blur events

**BR-07: Quantity Validation Rules**

- If user enters quantity < MOQ: show inline error below quantity selector
- Error message format: "Minimum order of (x) units is required"
- Error styling: red text, red input border
- Error clears automatically when quantity >= MOQ
- Quantity input accepts only positive integers

**BR-08: Add to Cart Button State**

- "Add to Cart" button disabled when validation error exists (quantity < MOQ)
- "Add to Cart" button enabled when quantity >= MOQ
- Clicking disabled button has no effect
- When enabled and clicked: product added to cart with specified quantity

#### 3.2.3 Scenarios

##### Scenario 1: Product page loads with MOQ enabled

```gherkin
Given a product has MOQ enabled with value of "5"
When a customer navigates to the product page
Then the quantity selector defaults to "5"
And the minus (-) button is disabled (grayed out)
And the plus (+) button is enabled
And the "Add to Cart" button is enabled
And no validation error is displayed
```

##### Scenario 2: Product page loads without MOQ (disabled)

```gherkin
Given a product has MOQ disabled
When a customer navigates to the product page
Then the quantity selector defaults to "1"
And the minus (-) button is disabled (cannot go below 1)
And the plus (+) button is enabled
And the "Add to Cart" button is enabled
And no validation error is displayed
```

##### Scenario 3: Customer increases quantity using plus button

```gherkin
Given a customer is on a product page
And the product has MOQ of "5"
And the current quantity is "5"
When the customer clicks the plus (+) button
Then the quantity increases to "6"
And the minus (-) button becomes enabled (no longer grayed out)
And the plus (+) button remains enabled
And no validation error is shown
And the "Add to Cart" button remains enabled
```

##### Scenario 4: Customer decreases quantity using minus button (above MOQ)

```gherkin
Given a customer is on a product page
And the product has MOQ of "5"
And the current quantity is "8"
When the customer clicks the minus (-) button
Then the quantity decreases to "7"
And the minus (-) button remains enabled (quantity still > MOQ)
And no validation error is shown
And the "Add to Cart" button remains enabled
```

##### Scenario 5: Customer attempts to decrease quantity below MOQ using minus button

```gherkin
Given a customer is on a product page
And the product has MOQ of "5"
And the current quantity is "5"
When the customer clicks the minus (-) button
Then the quantity remains at "5" (no change)
And the minus (-) button remains disabled (grayed out)
And no validation error is shown
And the "Add to Cart" button remains enabled
```

##### Scenario 6: Customer manually enters quantity below MOQ

```gherkin
Given a customer is on a product page
And the product has MOQ of "5"
And the current quantity is "5"
When the customer clicks the quantity input field
And types "3"
And clicks outside the input field (blur event)
Then a validation error appears below the quantity selector
And the error message reads "Minimum order of 5 units is required"
And the input field border turns red
And the "Add to Cart" button becomes disabled
```

##### Scenario 7: Customer corrects quantity from below MOQ to valid amount

```gherkin
Given a customer is on a product page
And the product has MOQ of "5"
And the customer has entered "3" causing a validation error
And the "Add to Cart" button is disabled
When the customer changes the quantity to "5"
And clicks outside the input field
Then the validation error disappears
And the input field border returns to normal (no red border)
And the "Add to Cart" button becomes enabled
```

##### Scenario 8: Customer successfully adds product to cart with valid quantity

```gherkin
Given a customer is on a product page
And the product has MOQ of "5"
And the current quantity is "10" (valid, >= MOQ)
And no validation errors exist
When the customer clicks the "Add to Cart" button
Then the product is added to the cart with quantity "10"
And a success notification may appear (e.g., "Product added to cart")
And the floating cart panel may automatically open showing the added item
```

##### Scenario 9: Customer attempts to add product with quantity below MOQ

```gherkin
Given a customer is on a product page
And the product has MOQ of "5"
And the customer has manually entered quantity "2"
And a validation error is displayed
And the "Add to Cart" button is disabled
When the customer attempts to click the "Add to Cart" button
Then no action occurs (button is disabled)
And the product is NOT added to cart
And the validation error remains visible
```

---

### Feature F-03: MOQ Validation in Floating Cart

#### 3.3.1 Feature Context

Validate MOQ requirements in the floating cart panel that appears after adding items to cart. Customers can view cart items, adjust quantities, and proceed to checkout, but must maintain MOQ compliance for all items.

#### 3.3.2 Business Rules

**BR-09: Floating Cart Display**

- Floating cart panel appears on right side of screen when customer adds item or clicks cart icon
- Shows all cart items with: image, name, price, quantity controls, subtotal
- Displays total item count in cart icon badge
- Shows cart total (sum of all items)
- Provides "Continue Shopping" and "Checkout" buttons

**BR-10: Quantity Editing in Floating Cart**

- Each cart item has quantity controls: minus (-), input field, plus (+)
- Minus (-) button decreases quantity by 1 (minimum = MOQ for that product)
- Plus (+) button increases quantity by 1 (no maximum in floating cart)
- Input field allows direct numeric entry
- Real-time validation on every quantity change

**BR-11: MOQ Validation in Floating Cart**

- If item quantity < MOQ: display inline error below quantity controls
- Error message: "Minimum order of (x) units is required"
- Error styling: red text, red input border
- Validation error persists until quantity corrected or item removed
- Multiple items can have validation errors simultaneously

**BR-12: Checkout Button State in Floating Cart**

- "Checkout" button disabled when any cart item violates MOQ
- "Checkout" button enabled only when all items meet MOQ requirements
- "Continue Shopping" button always available regardless of validation state
- Disabled checkout button has visual indication (grayed out)

#### 3.3.3 Scenarios

##### Scenario 1: Floating cart opens with valid item quantities

```gherkin
Given a customer has added products to cart
And all items have quantities >= their respective MOQ values
When the customer opens the floating cart panel
Then all cart items are displayed
And no validation errors are shown
And the "Checkout" button is enabled
And the "Continue Shopping" button is enabled
```

##### Scenario 2: Customer increases item quantity in floating cart

```gherkin
Given the floating cart is open
And an item has MOQ of "5" and current quantity of "5"
When the customer clicks the plus (+) button for that item
Then the quantity increases to "6"
And the item subtotal updates to reflect new quantity
And the cart total updates
And no validation error is shown
And the "Checkout" button remains enabled
```

##### Scenario 3: Customer decreases item quantity to MOQ threshold

```gherkin
Given the floating cart is open
And an item has MOQ of "5" and current quantity of "7"
When the customer clicks the minus (-) button twice
Then the quantity decreases to "5"
And no validation error is shown
And the "Checkout" button remains enabled
```

##### Scenario 4: Customer manually enters quantity below MOQ in floating cart

```gherkin
Given the floating cart is open
And an item has MOQ of "5" and current quantity of "5"
When the customer clicks the quantity input field
And types "3"
And clicks outside the input field
Then a validation error appears below the quantity controls for that item
And the error reads "Minimum order of 5 units is required"
And the input field shows red border
And the "Checkout" button becomes disabled
```

##### Scenario 5: Customer corrects invalid quantity in floating cart

```gherkin
Given the floating cart is open
And an item has a validation error (quantity "3", MOQ "5")
And the "Checkout" button is disabled
When the customer changes the quantity to "5"
Then the validation error disappears
And the input field border returns to normal
And the "Checkout" button becomes enabled
```

##### Scenario 6: Customer removes item with validation error from floating cart

```gherkin
Given the floating cart is open
And an item has a validation error (quantity below MOQ)
And the "Checkout" button is disabled
When the customer clicks the trash icon to remove that item
Then the item is removed from the cart
And the validation error disappears (along with the item)
And if no other items have errors, the "Checkout" button becomes enabled
And the cart total updates
```

##### Scenario 7: Multiple items with MOQ violations in floating cart

```gherkin
Given the floating cart is open
And there are 3 items in cart
And 2 items have quantities below their respective MOQs
When the customer views the floating cart
Then validation errors are shown for both invalid items
And each error displays the specific MOQ requirement for that product
And the "Checkout" button is disabled
And the "Continue Shopping" button is enabled
```

##### Scenario 8: Customer clicks Continue Shopping from floating cart

```gherkin
Given the floating cart is open
And there may or may not be validation errors
When the customer clicks "Continue Shopping" button
Then the floating cart panel closes
And the customer returns to the previous page (product or category page)
And cart items and validation states are preserved
```

##### Scenario 9: Customer proceeds to checkout from floating cart with valid items

```gherkin
Given the floating cart is open
And all cart items have valid quantities (>= MOQ)
And the "Checkout" button is enabled
When the customer clicks the "Checkout" button
Then the floating cart closes
And the customer is navigated to the full cart page
```

##### Scenario 10: Customer attempts to checkout with MOQ violations

```gherkin
Given the floating cart is open
And at least one item has quantity < MOQ
And the "Checkout" button is disabled (grayed out)
When the customer attempts to click the "Checkout" button
Then no action occurs (button is not clickable)
And the customer remains on the floating cart view
And validation errors remain visible
```

---

### Feature F-04: MOQ Validation in Full Cart Page

#### 3.4.1 Feature Context

Enforce MOQ requirements on the full cart page where customers review all items before proceeding to checkout. The cart page displays items in a table format with quantity controls and validation, ensuring all MOQ rules are satisfied before allowing checkout.

#### 3.4.2 Business Rules

**BR-13: Cart Page Layout**

- Cart items displayed in table with columns: Product, Product Type, Price, Quantity, Total, Actions
- Each row represents one cart item
- Product column shows image and name
- Product Type shows badge (e.g., "Physical")
- Price shows unit price
- Quantity shows numeric input field (no increment/decrement buttons in table)
- Total shows calculated line item total
- Actions column shows trash icon for item removal

**BR-14: Cart Page Quantity Editing**

- Quantity input field accepts direct numeric entry only
- Real-time validation on input change
- No increment/decrement buttons in cart table (different from product page and floating cart)
- Customer must type new quantity directly

**BR-15: Cart Page MOQ Validation**

- If quantity < MOQ: error message displays below quantity input
- Error format: "Minimum order of (x) units is required"
- Input field shows red border when validation error exists
- Error clears when quantity becomes >= MOQ
- Validation runs on every quantity change

**BR-16: Cart Page Checkout Controls**

- "Continue Shopping" button: always enabled, returns to product browsing
- "Checkout" button: disabled when any item violates MOQ, enabled when all valid
- "Checkout" button proceeds to checkout/payment process
- Remove item button (trash icon): always available for each item

**BR-17: Order Summary Display**

- Order summary sidebar shows "Total" and "Grand Total"
- Totals calculated from all cart items regardless of validation status
- Totals update in real-time as quantities change

#### 3.4.3 Scenarios

##### Scenario 1: Customer arrives at cart page with valid quantities

```gherkin
Given a customer has items in their cart
And all items have quantities >= their respective MOQs
When the customer navigates to the cart page
Then all cart items are displayed in the table
And no validation errors are shown
And the "Checkout" button is enabled
And the "Continue Shopping" button is enabled
And the order summary shows correct totals
```

##### Scenario 2: Customer changes quantity to valid amount on cart page

```gherkin
Given a customer is on the cart page
And an item has MOQ of "6" and current quantity of "6"
When the customer clicks the quantity input field
And types "10"
And clicks outside the input field
Then the quantity updates to "10"
And the line item total recalculates (unit price × 10)
And the order summary totals update
And no validation error is shown
And the "Checkout" button remains enabled
```

##### Scenario 3: Customer enters quantity below MOQ on cart page

```gherkin
Given a customer is on the cart page
And an item has MOQ of "6" and current quantity of "6"
When the customer clicks the quantity input field
And types "4"
And clicks outside the input field
Then a validation error appears below the quantity input
And the error reads "Minimum order of 6 units is required"
And the input field border turns red
And the "Checkout" button becomes disabled
```

##### Scenario 4: Customer corrects invalid quantity on cart page

```gherkin
Given a customer is on the cart page
And an item has a validation error (quantity "4", MOQ "6")
And the "Checkout" button is disabled
When the customer changes the quantity to "6"
And clicks outside the input field
Then the validation error disappears
And the input field border returns to normal
And if no other items have errors, the "Checkout" button becomes enabled
And the line item total recalculates
```

##### Scenario 5: Customer removes item from cart page

```gherkin
Given a customer is on the cart page
And an item is in the cart
When the customer clicks the trash icon for that item
Then the item is removed from the cart table
And the order summary totals update (excluding removed item)
And if the removed item had a validation error, that error is removed
And if no other items have errors, the "Checkout" button becomes enabled
```

##### Scenario 6: Multiple items with MOQ violations on cart page

```gherkin
Given a customer is on the cart page
And there are 4 items in cart
And 2 items have quantities below their MOQs
When the customer views the cart
Then each invalid item displays its own validation error
And each error shows the specific MOQ for that product
And the "Checkout" button is disabled
And the "Continue Shopping" button remains enabled
```

##### Scenario 7: Customer continues shopping from cart page

```gherkin
Given a customer is on the cart page
And there may or may not be validation errors
When the customer clicks "Continue Shopping" button
Then the customer is redirected to the previous page or product catalog
And cart contents and validation states are preserved
```

##### Scenario 8: Customer proceeds to checkout from cart page with valid items

```gherkin
Given a customer is on the cart page
And all cart items have valid quantities (>= their MOQs)
And the "Checkout" button is enabled
When the customer clicks the "Checkout" button
Then the customer is navigated to the checkout/payment page
And all cart items are included in the checkout
```

##### Scenario 9: Customer attempts checkout with MOQ violations on cart page

```gherkin
Given a customer is on the cart page
And at least one item has quantity < MOQ
And the "Checkout" button is disabled
When the customer attempts to click the "Checkout" button
Then no action occurs (button is not clickable)
And the customer remains on the cart page
And validation errors remain visible
```

##### Scenario 10: Cart page displays correct order summary

```gherkin
Given a customer is on the cart page
And the cart contains multiple items with varying quantities
When the page loads or quantities change
Then the order summary sidebar displays
And "Total" shows the sum of all line item totals
And "Grand Total" shows the same value as Total (in this implementation)
And totals update in real-time as quantities change
```

---

### Feature F-05: MOQ Re-validation on Settings Change

#### 3.5.1 Feature Context

When a merchant changes MOQ settings for a product (enables MOQ, disables MOQ, or changes MOQ value) while customers have that product in their carts, the system must re-validate all affected cart items and update validation states accordingly.

#### 3.5.2 Business Rules

**BR-18: Real-time MOQ Updates**

- When merchant saves MOQ changes, settings propagate to storefront immediately
- All customer carts containing the affected product are re-validated
- Validation errors appear or clear based on new MOQ settings
- Checkout button states update across all cart views

**BR-19: MOQ Disabled Scenario**

- When merchant disables MOQ (toggle OFF): all MOQ validations for that product are removed
- Existing cart items with that product become valid regardless of quantity
- Customers can reduce quantity to 1 or any positive integer

**BR-20: MOQ Enabled Scenario**

- When merchant enables MOQ with specific value: all cart items validated against new MOQ
- Items with quantity < new MOQ show validation errors
- Items with quantity >= new MOQ remain valid

**BR-21: MOQ Value Changed Scenario**

- When merchant changes MOQ value (e.g., from 5 to 10): all cart items re-validated
- Items previously valid may become invalid if quantity < new MOQ
- Items invalid may become valid if quantity >= new lower MOQ

#### 3.5.3 Scenarios

##### Scenario 1: Merchant enables MOQ while customers have items in cart

```gherkin
Given a product currently has MOQ disabled
And a customer has 3 units of this product in their cart
And the cart has no validation errors
When the merchant enables MOQ with value "5" and saves
Then the customer's cart item (quantity 3) is re-validated
And a validation error appears for that item
And the error reads "Minimum order of 5 units is required"
And the checkout button becomes disabled
```

##### Scenario 2: Merchant disables MOQ while customers have validation errors

```gherkin
Given a product has MOQ of "6"
And a customer has 4 units in cart (causing validation error)
And the checkout button is disabled
When the merchant disables MOQ (toggle OFF) and saves
Then the validation error for that item disappears
And the cart item (quantity 4) becomes valid
And if no other errors exist, the checkout button becomes enabled
```

##### Scenario 3: Merchant increases MOQ value

```gherkin
Given a product has MOQ of "5"
And a customer has 8 units in cart (valid)
When the merchant changes MOQ to "10" and saves
Then the customer's cart item (quantity 8) is re-validated
And a validation error appears
And the error reads "Minimum order of 10 units is required"
And the checkout button becomes disabled
```

##### Scenario 4: Merchant decreases MOQ value

```gherkin
Given a product has MOQ of "10"
And a customer has 7 units in cart (causing validation error)
When the merchant changes MOQ to "5" and saves
Then the customer's cart item (quantity 7) is re-validated
And the validation error disappears (7 >= 5)
And if no other errors exist, the checkout button becomes enabled
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement                            | Metric                                                        | Measurement Method               |
| -------------------------------------- | ------------------------------------------------------------- | -------------------------------- |
| MOQ validation speed (product page)    | Less than 200ms response time for validation check            | Frontend performance monitoring  |
| MOQ validation speed (cart operations) | Less than 500ms for cart-level validation with multiple items | API response time monitoring     |
| MOQ settings save time                 | Less than 3 seconds from save click to storefront propagation | End-to-end timing                |
| Product page load with MOQ             | Less than 2 seconds (P95) including MOQ data                  | Page load performance metrics    |
| Cart page load with MOQ validation     | Less than 2.5 seconds (P95) for carts with 50+ items          | Page performance monitoring      |
| Real-time validation response          | Less than 100ms for inline validation feedback                | Frontend event handling timing   |
| Multiple item validation in cart       | Less than 1 second for validating 20+ items simultaneously    | Cart validation performance test |
| MOQ setting retrieval from database    | Less than 50ms for single product MOQ lookup                  | Database query performance       |
| Checkout button state update           | Less than 100ms after validation state change                 | UI state update timing           |

### 4.2 Scalability

| Requirement                            | Target                                                 | Validation Method         |
| -------------------------------------- | ------------------------------------------------------ | ------------------------- |
| Concurrent MOQ validations             | Support 10,000+ simultaneous cart validations          | Load testing              |
| Products with MOQ enabled              | Support 100,000+ products with MOQ without degradation | Database scalability test |
| Cart size with MOQ items               | Handle carts with 100+ items with MOQ validation       | Stress testing            |
| MOQ setting updates                    | Process 1,000+ merchant MOQ changes per minute         | System load testing       |
| Customer carts affected by MOQ changes | Re-validate 10,000+ active carts within 5 seconds      | Background job testing    |
| Database query optimization            | MOQ lookups cached with 99% hit rate                   | Cache performance metrics |

### 4.3 Reliability

| Requirement                      | Target                                                 | Monitoring                 |
| -------------------------------- | ------------------------------------------------------ | -------------------------- |
| MOQ validation accuracy          | 100% correct validation (no false positives/negatives) | Automated validation tests |
| MOQ enforcement consistency      | Zero bypasses of MOQ rules at checkout                 | Security audit logs        |
| Data integrity on MOQ changes    | 100% cart re-validation success rate                   | Database transaction logs  |
| Validation error message display | 99.9% uptime for error messaging system                | Frontend error tracking    |
| Checkout button state accuracy   | 100% correlation with validation state                 | State management testing   |

### 4.4 Security

| Requirement                  | Implementation                                       | Validation          |
| ---------------------------- | ---------------------------------------------------- | ------------------- |
| MOQ settings access control  | Only product owner can modify MOQ settings           | Authorization tests |
| Cart manipulation prevention | Server-side validation prevents client-side bypasses | Security testing    |
| API endpoint protection      | MOQ validation APIs require authentication           | API security audit  |
| Input sanitization           | MOQ numeric inputs sanitized against injection       | Security scanning   |
| MOQ data encryption          | MOQ values stored with standard database encryption  | Encryption audit    |

### 4.5 Usability

| Requirement                            | Target                                                  | Measurement       |
| -------------------------------------- | ------------------------------------------------------- | ----------------- |
| MOQ toggle clarity                     | 95% merchants understand toggle function immediately    | Usability testing |
| MOQ input field discoverability        | 90% merchants find MOQ field within 30 seconds          | User testing      |
| Error message comprehension            | 90% customers understand MOQ error messages             | User testing      |
| Quantity selector ease of use          | 95% customers successfully adjust quantity on first try | User testing      |
| Checkout button disabled state clarity | 90% users understand why checkout is disabled           | User testing      |
| MOQ value input speed                  | Average 10 seconds to enable MOQ and enter value        | Task timing       |

### 4.6 Compatibility

| Requirement           | Standard                                      | Validation            |
| --------------------- | --------------------------------------------- | --------------------- |
| Browser support       | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Cross-browser testing |
| Mobile responsiveness | Full functionality on 375px+ width screens    | Responsive testing    |
| Touch device support  | MOQ controls work on touch screens            | Mobile device testing |
| Screen reader support | Validation errors announced to screen readers | Accessibility testing |
| Keyboard navigation   | All MOQ controls accessible via keyboard      | Accessibility testing |
| RTL language support  | MOQ UI works with right-to-left languages     | Internationalization  |

### 4.7 Maintainability

| Requirement                     | Standard                                        | Validation           |
| ------------------------------- | ----------------------------------------------- | -------------------- |
| Code modularity                 | MOQ logic isolated in reusable components       | Code review          |
| Validation logic centralization | Single source of truth for MOQ validation       | Architecture review  |
| Error message management        | Centralized error message configuration         | Code structure audit |
| MOQ settings migration          | Database schema supports backward compatibility | Migration testing    |
| API versioning                  | MOQ APIs versioned for future updates           | API design review    |

### 4.8 Accessibility (WCAG 2.1 Level AA Compliance)

| Requirement            | Standard                                          | Validation             |
| ---------------------- | ------------------------------------------------- | ---------------------- |
| Error message contrast | 4.5:1 minimum contrast ratio for error text       | Color contrast testing |
| Form label association | MOQ input properly labeled for screen readers     | Accessibility audit    |
| Focus indicators       | Visible focus on MOQ input and buttons            | Keyboard testing       |
| Error announcement     | Validation errors announced via ARIA live regions | Screen reader testing  |
| Button disabled state  | Disabled buttons have aria-disabled attribute     | Accessibility testing  |

---

## 9. Future Enhancements

1. Maximum Order Quantity Limits
2. Quantity Step/Increment Rules
3. Quantity Range Requirements
4. Customer Segmentation-Based MOQ
5. Cart-Level Quantity Rules
6. Geographic & Market Controls
7. Tiered Pricing Based on Quantity (partially implemented)
8. Bundle & Upsell Integration: (in product roadmap)

---

## Approval and Sign-off

| Stakeholder       | Role | Status        | Date Signed |
| ----------------- | ---- | ------------- | ----------- |
| Dennis Velasco    | CEO  | ☐ Pending     | ---         |
| Ruel Nopal        | HoE  | ☐ Pending     | ---         |
| Rian Froille Alde | QA   | ☐ Pending     | ---         |
| ---               | BE   | ☐ Pending     | ---         |
| ---               | FE   | ☐ Pending     | ---         |
| Adrianne Berida   | BA   | ☐ In Progress | ---         |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for implementing Minimum Order Quantity (MOQ) functionality in Prosperna's merchant dashboard and storefront, enabling merchants to enforce quantity requirements while maintaining excellent customer experience through clear communication and multi-level validation.
