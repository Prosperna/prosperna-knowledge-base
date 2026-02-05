---
id: minimum-order-quantity
title: Minimum Order Quantity PRD
sidebar_label: Minimum Order Quantity PRD
sidebar_position: 1
---

Agile-focused PRD with 64 scenarios documenting the implementation of Minimum Order Quantity (MOQ) feature for Prosperna's merchant dashboard and storefront, enabling merchants to set minimum purchase requirements per product and automatically enforce these rules during customer checkout.

**Demo Recording:**

[Set Minimum Order Quantity Demo](https://sharing.clickup.com/clip/p/t7537039/e896aeff-bb84-4caa-b491-27f785faafbb/e896aeff-bb84-4caa-b491-27f785faafbb.webm?filename=Set%20Minimum%20Order%20Quantity%20Demo)

## Document Control

| Item           | Details                              |
| -------------- | ------------------------------------ |
| Document Title | Minimum Order Quantity (MOQ) Feature |
| Version        | 1.0                                  |
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
| 1.0     | Nov 10, 2025 | Business Analyst | Initial draft - MOQ specification |

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

- [Competitor Research - Minimum Order Quantity](https://pkb.prosperna.ph/docs/product/competitor-analysis/minimum-order-quantity)
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
     - Frontend always displays "2" as default value (both when toggle OFF and when first enabled)
     - Database stores null until product is saved with toggle ON
     - Minimum enforced: 2 units (input auto-corrects values < 2 to 2 on blur)
     - Maximum allowed: 100 units
     - Field is disabled (grayed out) when toggle is OFF
     - Field becomes active when toggle is ON
     - **No custom message field** in initial implementation
     - Settings save via "Save" button at bottom of page

2. **Storefront - Product Page with MOQ Enforcement:**

   - **Quantity Selector Behavior:**

     - When MOQ is disabled: quantity selector defaults to 1
     - When MOQ is enabled: quantity selector defaults to MOQ value
     - Input field shows current quantity value
     - Minus (-) button behavior:
       - Enabled when quantity is greater than MOQ
       - Disabled when quantity is less than or equal to MOQ (visual indication: grayed out)
     - Plus (+) button: always enabled, allows increasing beyond MOQ
     - Manual input field:
       - Accepts numeric input
       - Validates on change/blur
       - If user enters value < MOQ: shows inline validation error

   - **Validation Error Display:**

     - Error message appears below quantity selector
     - Format: "Minimum order of (x) units is required"
     - Styling: Red text, small font size
     - Error clears when quantity is greater than or equal to MOQ
     - Input field shows red border when error is active

   - **Add to Cart Behavior:**
     - "Add to Cart" button is disabled when validation error exists
     - Button shows normal state when quantity is greater than or equal to MOQ
     - Clicking Add to Cart when quantity < MOQ: no action (button disabled)
     - When quantity is valid: product added to cart successfully

3. **Storefront - Floating Cart Overlay:**

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
     - Product Type: badge showing "Physical" or "Digital"
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

     - On single product page: before Add to Cart
     - In floating cart: on quantity change
     - In cart page: on quantity change
     - Before checkout: final validation check

   - **Validation Behavior:**

     - Quantity < MOQ: show error, disable checkout
     - Quantity is greater than or equal to MOQ: clear error, enable checkout
     - Error persists until quantity corrected or item removed

   - **Edge Cases:**
     - If MOQ changes while item in cart: re-validate all cart items
     - If MOQ is disabled: remove all validations (treat as MOQ equals 1)
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

Allow merchants to enable and configure Minimum Order Quantity (MOQ) settings for products in the Price section of the edit product page. This provides merchants with control over minimum purchase requirements to align with their business model and product economics.

#### 3.1.2 Business Rules

**BR-01: MOQ Toggle Control**

- MOQ feature is disabled by default for all products (existing and new)
- Toggle switch controls whether MOQ is active for the product
- When toggle is OFF: MOQ input field is disabled and grayed out
- When toggle is ON: MOQ input field becomes active and editable
- Toggle state persists after save

**BR-02: MOQ Value Input Validation**

- MOQ value must be a positive integer
- Minimum enforced value: 2 units (values below 2 auto-correct to 2 on blur)
- Maximum allowed value: 100 units
- Input field shows "units" suffix for clarity
- Input field is numeric-only (no decimals, letters, or special characters)
- Empty field when enabled requires merchant to enter value before saving
- Values less than 2 (e.g., 0, 1) automatically convert to 2 on blur event (no error displayed)

**BR-02A: MOQ Field Default Display Behavior**

- Frontend always displays a value in the MOQ input field
- When toggle is OFF and no value saved in database: Display "2" (disabled, grayed)
- When toggle is OFF and value exists in database: Display saved value (disabled, grayed)
- When toggle is ON and no value saved in database: Display "2" (active, editable)
- When toggle is ON and value exists in database: Display saved value (active, editable)
- Database only stores MOQ value when product is saved with toggle ON and valid value entered

**BR-02B: Toggle OFF Behavior with Unsaved Changes**

- When MOQ toggle is turned OFF without saving:
  - If field has a previously saved value: Field displays last saved value (disabled/grayed)
  - If field has never had a saved value: Field displays "2" as default (disabled/grayed)
  - Any unsaved changes (empty field, modified values) are discarded
  - Any validation errors are cleared
- This implements "cancel current edit" behavior - unsaved changes don't persist

**BR-03: MOQ Settings Persistence**

- MOQ settings save when merchant clicks "Save" button at bottom of page
- Settings persist to database and propagate to storefront immediately
- Changes take effect for new cart additions after save
- Existing cart items are re-validated against new MOQ settings

**BR-04: MOQ Display Rules**

- MOQ setting only affects storefront when toggle is ON and value is greater than or equal to 2
- When toggle is OFF: product behaves as standard (no MOQ enforcement)
- MOQ validation applies to single product page, floating cart, and cart page

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
Then the input field value automatically changes to "2"
And no validation error message is displayed
And the input field border remains normal (not red)
And the merchant can proceed to save
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
And clicking the "Save" button will trigger the system to not save the changes + display error toast "Please complete all the required fields."
```

##### Scenario 6: Merchant saves MOQ settings successfully

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field shows a valid value of "6"
And there are no validation errors
When the merchant clicks the "Save" button at the bottom of the page
Then the system saves the MOQ settings to the database
And a success toast notification appears (e.g., "Successfully updated product.")
And the MOQ value "6" is now active for this product on the storefront
```

##### Scenario 7: Merchant leaves MOQ field empty when toggle is ON

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field is empty
When the merchant clicks on the MOQ input field
And then clicks outside the input field (blur event)
Then a validation error appears below the MOQ field
And the error message reads "Required*"
And the input field border turns red
```

##### Scenario 8: Merchant corrects empty MOQ field

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field has a validation error showing "Required*"
And the input field border is red
When the merchant types a valid value (e.g., "5") into the MOQ input field
Then the validation error "Required*" disappears
And the input field border returns to normal (no red border)
And the merchant can proceed to save
```

##### Scenario 9: Merchant attempts to save with empty MOQ field showing validation error

```gherkin
Given a merchant is on the "Price" section for a product
And the "Minimum Order Quantity" toggle is ON
And the MOQ input field is empty with validation error "Required*" displayed
And the input field border is red
When the merchant clicks the "Save" button
Then the product settings are NOT saved
And an error toast notification appears
And the error toast reads "Please complete all the required fields."
And the merchant remains on the product edit page
And the MOQ field validation error remains visible
```

##### Scenario 10: Merchant empties MOQ field then disables toggle (with previous saved value)

```gherkin
Given a merchant is on the "Price" section for a product
And the product has a previously saved MOQ value of "10" in the database
And the "Minimum Order Quantity" toggle is currently ON
And the MOQ input field shows "10"
When the merchant clears the MOQ input field (makes it empty)
And clicks outside the input field (blur event)
Then a validation error "Required*" appears below the field
And the input field border turns red
When the merchant clicks the MOQ toggle to turn it OFF (without saving)
Then the toggle switches to OFF state (gray color)
And the validation error "Required*" disappears
And the MOQ input field becomes disabled and grayed out
And the field displays "10" (the last saved value from database, not "2")
And no MOQ validation will apply to this product on the storefront
```

##### Scenario 11: Editing product that never had MOQ enabled

```gherkin
Given a merchant is editing a product in the "Price" section
And the product has never had MOQ enabled (database value is null)
And the "Minimum Order Quantity" toggle is OFF
Then the MOQ input field is disabled and grayed out
And the field displays "2" (default frontend value)
And the merchant understands "2" will be the starting value if they enable MOQ
```

##### Scenario 12: Merchant applies MOQ on product variants

```gherkin
Given the merchant is editing a product
And enables the Product Variants toggle (turned ON)
And the Product Variants section expands
And the Price section becomes hidden
And the "Minimum Order Quantity" toggle + input field appears in the Product Variants section
When the merchant enables MOQ on the Product Variants section
And adds a value on the MOQ input field
And saves the product
Then all logic and validation from scenarios 1-11 of this feature should also be applicable
And the MOQ is applied to all variants of the product
And MOQ validations will take effect on the storefront for that variant product
When customer selects any variant on the storefront single product page
Then the same MOQ will apply
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
  - Enabled when current quantity is greater than MOQ
  - Disabled (grayed out) when current quantity is less than or equal to MOQ
  - Cannot reduce quantity below MOQ
- Manual input field allows direct numeric entry
- Input validates on change and blur events

**BR-07: Quantity Validation Rules**

- If user enters quantity < MOQ: show inline error below quantity selector
- Error message format: "Minimum order of (x) units is required"
- Error styling: red text, red input border
- Error clears automatically when quantity is greater than or equal to MOQ
- Quantity input accepts only positive integers

**BR-08: Add to Cart Button State**

- "Add to Cart" button disabled when validation error exists (quantity < MOQ)
- "Add to Cart" button enabled when quantity is greater than or equal to MOQ
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
And the minus (-) button remains enabled (quantity still greater than MOQ)
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
And the "Add to Cart" button (and Buy Now button) becomes disabled
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
And the current quantity is "10" (valid, is greater than MOQ)
And no validation errors exist
When the customer clicks the "Add to Cart" button
Then the product is added to the cart with quantity "10"
And a success toast notification appears (e.g., "Successfully added item to cart.")
```

##### Scenario 9: Customer attempts to add product to cart with quantity below MOQ

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

Validate MOQ requirements in the floating cart overlay that appears after adding items to cart. Customers can view cart items, adjust quantities, and proceed to checkout, but must maintain MOQ compliance for all items.

#### 3.3.2 Business Rules

**BR-09: Floating Cart Display**

- Floating cart overlay shows all cart items with: image, name, price, quantity controls, subtotal
- Displays total item count in cart icon badge
- Shows cart total (sum of all items)
- Provides "Continue Shopping" and "Checkout" buttons

**BR-10: Quantity Editing in Floating Cart**

- Each cart item has quantity controls: minus (-), input field, plus (+)
- Minus (-) button decreases quantity by 1 (minimum is equal to MOQ for that product)
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
And all items have quantities greater than or equal to their respective MOQ values
When the customer opens the floating cart overlay
Then all cart items are displayed
And no validation errors are shown
And the "Checkout" button is enabled
And the "Continue Shopping" button is enabled
```

##### Scenario 2: Customer increases item quantity in floating cart

```gherkin
Given the floating cart is displayed
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
Given the floating cart is displayed
And an item has MOQ of "5" and current quantity of "7"
When the customer clicks the minus (-) button twice
Then the quantity decreases to "5"
And no validation error is shown
And the "Checkout" button remains enabled
```

##### Scenario 4: Customer manually enters quantity below MOQ in floating cart

```gherkin
Given the floating cart is displayed
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
Given the floating cart is displayed
And an item has a validation error (quantity "3", MOQ "5")
And the "Checkout" button is disabled
When the customer changes the quantity to "5"
Then the validation error disappears
And the input field border returns to normal
And the "Checkout" button becomes enabled
```

##### Scenario 6: Customer removes item with validation error from floating cart

```gherkin
Given the floating cart is displayed
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
Given the floating cart is displayed
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
Given the floating cart is displayed
And there may or may not be validation errors
When the customer clicks "Continue Shopping" button
Then the floating cart overlay closes
And the customer redirects to the product listing page
And cart items and validation states are preserved
```

##### Scenario 9: Customer proceeds to checkout from floating cart with valid items

```gherkin
Given the floating cart is displayed
And all cart items have valid quantities (greater than or equal to MOQ)
And the "Checkout" button is enabled
When the customer clicks the "Checkout" button
Then the floating cart closes
And the customer is navigated to the full cart page
```

##### Scenario 10: Customer attempts to checkout with MOQ violations

```gherkin
Given the floating cart is displayed
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
- Error clears when quantity becomes greater than or equal to MOQ
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
And all items have quantities greater than or equal to their respective MOQs
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
Then the customer is redirected to the product listing page
And cart contents and validation states are preserved
```

##### Scenario 8: Customer proceeds to checkout from cart page with valid items

```gherkin
Given a customer is on the cart page
And all cart items have valid quantities (greater than or equal to their MOQs)
And the "Checkout" button is enabled
When the customer clicks the "Checkout" button
Then the customer is navigated to the checkout page
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

##### Scenario 10: Customer places or updates order via QR menu

```gherkin
Given a merchant is subscribed to the QR menu add-on
And has configured the QR menu settings
And the customer is on the cart page from scanning the merchant's QR menu
And the customer has added items to cart with MOQ enabled
And the CTA button is not "Checkout" but "Place Order" (or "Update Order")
When the customer views and interacts with the cart
Then all logic and validation from scenarios 1-9 of this feature should also be applicable
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
- Items with quantity greater than or equal to new MOQ remain valid

**BR-21: MOQ Value Changed Scenario**

- When merchant changes MOQ value (e.g., from 5 to 10): all cart items re-validated
- Items previously valid may become invalid if quantity < new MOQ
- Items invalid may become valid if quantity becomes greater than or equal to new lower MOQ

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
And the validation error disappears (7 is greater than 5)
And if no other errors exist, the checkout button becomes enabled
```

---

### Feature F-06: MOQ Behavior on Product Listing Page

#### 3.6.1 Feature Context

Control the visibility and behavior of "Add to Cart" and "Buy Now" buttons on product cards in the product listing page when MOQ is enabled. This ensures customers are directed to the single product page where they can properly configure the minimum quantity before adding to cart.

#### 3.6.2 Business Rules

**BR-22: Product Card Button Visibility with MOQ**

- When MOQ is enabled for a product: "Buy Now" button is always hidden on product card (regardless of merchant settings)
- When MOQ is enabled for a product: "Add to Cart" button remains visible but behavior changes
- When MOQ is disabled: both buttons follow normal merchant configuration (show/hide based on toggle)

**BR-23: Add to Cart Button Behavior with MOQ on Product Listing**

- When MOQ is disabled: "Add to Cart" button adds product to cart immediately (normal behavior)
- When MOQ is enabled: "Add to Cart" button redirects customer to single product page (same as products with variants)
- Redirect allows customer to configure proper quantity that meets MOQ requirements
- No product is added to cart until customer completes action on single product page

**BR-24: Buy Now Button Behavior with MOQ**

- "Buy Now" button is hidden when MOQ is enabled (to prevent MOQ validation conflicts)
- Button remains hidden even if merchant has "Buy Now" enabled in store settings
- Other products without MOQ continue to show "Buy Now" button normally

#### 3.6.3 Scenarios

##### Scenario 1: Customer views product listing with MOQ-enabled product (Add to Cart only)

```gherkin
Given a merchant has enabled "Add to Cart" button for product cards
And a product has MOQ enabled with value "5"
And the merchant has disabled "Buy Now" button
When a customer views the product listing page
Then the product card displays the "Add to Cart" button
And the "Buy Now" button is not visible (as configured)
And clicking "Add to Cart" redirects to the single product page
And no product is added to cart yet
```

##### Scenario 2: Customer views product listing with MOQ-enabled product (both buttons enabled)

```gherkin
Given a merchant has enabled both "Add to Cart" and "Buy Now" buttons for product cards
And a product has MOQ enabled with value "5"
When a customer views the product listing page
Then the product card displays only the "Add to Cart" button
And the "Buy Now" button is hidden (due to MOQ enforcement)
And clicking "Add to Cart" redirects to the single product page
```

##### Scenario 3: Customer clicks Add to Cart on MOQ-enabled product from listing

```gherkin
Given a customer is on the product listing page
And a product has MOQ enabled with value "5"
And the product card shows "Add to Cart" button
When the customer clicks the "Add to Cart" button
Then the customer is redirected to the single product page
And the quantity selector on the product page defaults to "5"
And no product has been added to cart yet
And the customer can now adjust quantity and add to cart properly
```

##### Scenario 4: Product listing with mixed MOQ and non-MOQ products

```gherkin
Given the product listing page displays multiple products
And Product A has MOQ enabled with value "5"
And Product B has MOQ disabled
And both products have "Add to Cart" and "Buy Now" buttons enabled by merchant
When a customer views the product listing page
Then Product A displays only "Add to Cart" button (Buy Now hidden)
And Product B displays both "Add to Cart" and "Buy Now" buttons
And clicking Product A's "Add to Cart" redirects to single product page
And clicking Product B's "Add to Cart" adds product to cart immediately
```

### Feature F-07: MOQ Enforcement in Create Order Module

#### 3.7.1 Feature Context

Enforce minimum order quantity rules in the merchant dashboard's Create Order module, where merchants manually create orders on behalf of customers (for walk-in purchases, phone orders, or assisted sales). The MOQ feature ensures that even merchant-created orders comply with product quantity requirements, maintaining consistency across all order creation methods.

#### 3.7.2 Business Rules

**BR-25: Create Order Module MOQ Validation**

- MOQ rules apply to all products added via the Create Order module
- Validation occurs when merchant clicks "Add" button to add product to order
- MOQ validation applies to products in the Order Summary section
- All MOQ validation logic mirrors storefront behavior (same rules, same error messages)

**BR-26: Product Modal Quantity Controls in Create Order**

- When merchant clicks "Add" on a product with MOQ enabled: product modal opens
- Modal displays product details, images, and quantity selector
- Quantity selector defaults to MOQ value (not 1) when MOQ is enabled
- Minus (-) button disabled when quantity is less than or equal to MOQ
- Plus (+) button always enabled for incrementing quantity
- Manual input field validates on change and blur events

**BR-27: Order Summary MOQ Validation**

- Order Summary displays all added products with quantity controls
- Each line item shows: product image, name, variant, addons, quantity controls (-, input, +), price, remove button
- Quantity can be adjusted directly in Order Summary
- Real-time MOQ validation on quantity changes in Order Summary
- "Proceed to Checkout" button disabled when any item violates MOQ

**BR-28: Create Order Checkout Enforcement**

- "Proceed to Checkout" button validates all items against MOQ before allowing checkout
- Button disabled (non-clickable) when validation errors exist
- Button enabled only when all items meet or exceed MOQ requirements
- Validation errors persist until quantities corrected or items removed

#### 3.7.3 Scenarios

##### Scenario 1: Merchant opens product modal for MOQ-enabled product

```gherkin
Given a merchant is on the Create Order page
And a product has MOQ enabled with value of "6"
When the merchant clicks the "Add" button for that product
Then a product modal opens displaying product details
And the quantity selector defaults to "6" (the MOQ value)
And the minus (-) button is disabled (grayed out)
And the plus (+) button is enabled
And the "Add to Order" button is enabled
And no validation error is displayed
```

##### Scenario 2: Merchant increases quantity in product modal

```gherkin
Given the product modal is open for a product with MOQ of "6"
And the current quantity is "6"
When the merchant clicks the plus (+) button
Then the quantity increases to "7"
And the minus (-) button becomes enabled
And no validation error is shown
And the "Add to Order" button remains enabled
```

##### Scenario 3: Merchant manually enters quantity below MOQ in product modal

```gherkin
Given the product modal is open for a product with MOQ of "6"
And the current quantity is "6"
When the merchant clicks the quantity input field
And types "3"
And clicks outside the input field (blur event)
Then a validation error appears below the quantity selector
And the error message reads "Minimum order of 6 units is required"
And the input field border turns red
And the "Add to Order" button becomes disabled
```

##### Scenario 4: Merchant corrects invalid quantity in product modal

```gherkin
Given the product modal is open for a product with MOQ of "6"
And the merchant has entered "3" causing a validation error
And the "Add to Order" button is disabled
When the merchant changes the quantity to "6"
Then the validation error disappears
And the input field border returns to normal
And the "Add to Order" button becomes enabled
```

##### Scenario 5: Merchant successfully adds product to order with valid quantity

```gherkin
Given the product modal is open for a product with MOQ of "6"
And the current quantity is "10" (valid, is greater than MOQ)
And no validation errors exist
When the merchant clicks the "Add to Order" button
Then the product is added to the Order Summary with quantity "10"
And the product modal closes
And the product appears in the Order Summary section on the right side
And the order totals update to reflect the added product
```

##### Scenario 6: Merchant attempts to add product with quantity below MOQ

```gherkin
Given the product modal is open for a product with MOQ of "6"
And the merchant has manually entered quantity "4"
And a validation error is displayed
And the "Add to Order" button is disabled
When the merchant attempts to click the "Add to Order" button
Then no action occurs (button is disabled)
And the product is NOT added to Order Summary
And the validation error remains visible
And the product modal remains open
```

##### Scenario 7: Merchant adjusts quantity in Order Summary above MOQ

```gherkin
Given a product with MOQ of "6" is in the Order Summary
And the current quantity is "6"
When the merchant clicks the plus (+) button in the Order Summary
Then the quantity increases to "7"
And the line item total recalculates
And the order totals update
And no validation error is shown
And the "Proceed to Checkout" button remains enabled
```

##### Scenario 8: Merchant manually enters quantity below MOQ in Order Summary

```gherkin
Given a product with MOQ of "6" is in the Order Summary
And the current quantity is "6"
When the merchant clicks the quantity input field
And types "4"
And clicks outside the input field
Then a validation error appears below the quantity controls for that item
And the error reads "Minimum order of 6 units is required"
And the input field shows red border
And the "Proceed to Checkout" button becomes disabled
```

##### Scenario 9: Merchant corrects invalid quantity in Order Summary

```gherkin
Given a product in Order Summary has a validation error (quantity "4", MOQ "6")
And the "Proceed to Checkout" button is disabled
When the merchant changes the quantity to "6"
Then the validation error disappears
And the input field border returns to normal
And if no other items have errors, the "Proceed to Checkout" button becomes enabled
And the line item total and order totals update
```

##### Scenario 10: Merchant removes product with validation error from Order Summary

```gherkin
Given a product in Order Summary has a validation error (quantity below MOQ)
And the "Proceed to Checkout" button is disabled
When the merchant clicks the remove (trash) icon for that item
Then the item is removed from Order Summary
And the validation error disappears (along with the item)
And if no other items have errors, the "Proceed to Checkout" button becomes enabled
And the order totals update (excluding removed item)
```

##### Scenario 11: Multiple products with MOQ violations in Order Summary

```gherkin
Given the Order Summary contains 4 products
And 2 products have quantities below their respective MOQs
When the merchant views the Order Summary
Then each invalid item displays its own validation error
And each error shows the specific MOQ requirement for that product
And the "Proceed to Checkout" button is disabled
And the merchant can still adjust quantities or remove items
```

##### Scenario 12: Merchant proceeds to checkout with valid quantities

```gherkin
Given the Order Summary contains multiple products
And all products have valid quantities (greater than or equal to their MOQs)
And the "Proceed to Checkout" button is enabled
When the merchant clicks the "Proceed to Checkout" button
Then the order proceeds to the checkout step
And all products with valid quantities are included in the order
```

##### Scenario 13: Merchant attempts checkout with MOQ violations

```gherkin
Given the Order Summary contains products
And at least one product has quantity < MOQ
And validation errors are displayed for invalid items
And the "Proceed to Checkout" button is disabled
When the merchant attempts to click the "Proceed to Checkout" button
Then no action occurs (button is not clickable)
And the merchant remains on the Create Order page
And validation errors remain visible
And the merchant must correct quantities before proceeding
```

##### Scenario 14: Product with variants and MOQ in Create Order

```gherkin
Given a product has variants enabled
And MOQ is enabled on the Product Variants section with value "12"
When the merchant clicks "Add" for that product in Create Order
Then the product modal opens
And the variant selector is displayed
When the merchant selects any variant
Then all logic and validation from scenarios 1-6 of this feature are applicable
And the quantity selector defaults to "12" (the MOQ value)
And MOQ validation applies consistently across all variants
```

##### Scenario 15: MOQ validation consistency across order creation methods

```gherkin
Given a product has MOQ enabled with value "6"
And the same product is available in both:
  - Customer-facing storefront (single product page, cart, checkout)
  - Merchant dashboard (Create Order module)
Then all validation logic from Features F-02, F-03, and F-04 are applicable to Feature F-07
And the validation rules, error messages, and enforcement mechanisms are identical
And merchants and customers receive the same MOQ requirements and feedback
And no order (customer-created or merchant-created) can bypass MOQ validation
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

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: Merchant Enables MOQ for Product**

![Primary Flow: Merchant Enables MOQ for Product](/product/user-flows/primary_flow_moq.png)

**Alternative Flow: Customer Purchases Product with MOQ (Valid Quantity)**

![Alternative Flow: Customer Purchases Product with MOQ (Valid Quantity)](/product/user-flows/alternative_flow_moq.png)

**Error Flow: Customer Enters Quantity Below MOQ**

![Error Flow: Customer Enters Quantity Below MOQ](/product/user-flows/error_flow_moq.png)

**Cart Flow: MOQ Validation in Floating Cart**

![Cart Flow: MOQ Validation in Floating Cart](/product/user-flows/cart_flow_moq.png)

**Cart Page Flow: Full Cart Review with MOQ Validation**

![Cart Page Flow: Full Cart Review with MOQ Validation](/product/user-flows/cart_page_flow_moq.png)

**MOQ Re-validation Flow: Settings Change Impact**

![MOQ Re-validation Flow: Settings Change Impact](/product/user-flows/revalidation_flow_moq.png)

### 5.2 UI Mockups & Wireframes

[Minimum Order Quantity Prototype](https://www.figma.com/proto/MDSZPqc0ZrAJMfWEyMytOT/Minimum-Order-Quantity-Feature?page-id=0%3A1&node-id=1-2389&t=cVULHjoUpKFbfge7-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1%3A2389)
[Minimum Order Quantity Wireframe](https://p1-ba-pocs.vercel.app/moq)

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Prosperna Frontend                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Product Page Component                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Quantity Selector with MOQ Enforcement         │  │  │
│  │  │  • Default value is equal to MOQ (if enabled)   │  │  │
│  │  │  • Minus button disabled at MOQ threshold       │  │  │
│  │  │  • Real-time validation on input change         │  │  │
│  │  │  • Inline error display                         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Add to Cart Button                             │  │  │
│  │  │  • Disabled when quantity < MOQ                 │  │  │
│  │  │  • Enabled when quantity is greater than MOQ    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Floating Cart Overlay Component             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Cart Items with Quantity Controls              │  │  │
│  │  │  • Inline MOQ validation per item               │  │  │
│  │  │  • Error messages below quantity controls       │  │  │
│  │  │  • Red border on invalid input                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Checkout Button State Manager                  │  │  │
│  │  │  • Disabled: any item violates MOQ              │  │  │
│  │  │  • Enabled: all items valid                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Cart Page Component                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Cart Table with MOQ Validation                 │  │  │
│  │  │  • Numeric input per line item                  │  │  │
│  │  │  • Real-time validation on change               │  │  │
│  │  │  • Error display per invalid item               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Order Summary & Checkout Controls              │  │  │
│  │  │  • Total calculations                           │  │  │
│  │  │  • Checkout button state management             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Product Listing Component                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Product Card Button Control                    │  │  │
│  │  │  • Hide "Buy Now" when MOQ enabled              │  │  │
│  │  │  • "Add to Cart" redirects to product page      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Create Order Module Component               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Product Modal with MOQ Controls                │  │  │
│  │  │  • Quantity selector (defaults to MOQ)          │  │  │
│  │  │  • Validation before adding to Order Summary    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Order Summary with MOQ Validation              │  │  │
│  │  │  • Line item quantity editing                   │  │  │
│  │  │  • Real-time MOQ validation                     │  │  │
│  │  │  • Checkout enforcement                         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway / Backend Services              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Product Service                             │  │
│  │  • Retrieve MOQ settings per product                  │  │
│  │  • Update MOQ configuration                           │  │
│  │  • Validate MOQ input (2-100 range)                   │  │
│  │  • Cache MOQ data for performance                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Cart Service                                │  │
│  │  • Add items to cart with MOQ validation              │  │
│  │  • Update cart quantities with MOQ checks             │  │
│  │  • Real-time cart validation                          │  │
│  │  • Cart-level validation before checkout              │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Validation Service                          │  │
│  │  • Centralized MOQ validation logic                   │  │
│  │  • Multi-item batch validation                        │  │
│  │  • Re-validation on MOQ settings change               │  │
│  │  • Error message generation                           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Order Service                               │  │
│  │  • Final MOQ validation at checkout                   │  │
│  │  • Prevent order placement with MOQ violations        │  │
│  │  • Order creation via Create Order module             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Event / Notification Service                │  │
│  │  • Broadcast MOQ setting changes                      │  │
│  │  • Trigger cart re-validation events                  │  │
│  │  • Update active customer sessions                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Products Table                              │  │
│  │  • MOQ enabled flag (boolean)                         │  │
│  │  • MOQ value (integer, nullable)                      │  │
│  │  • Indexed for fast lookups                           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Cart Items Table                            │  │
│  │  • Product reference with MOQ metadata                │  │
│  │  • Current quantity                                   │  │
│  │  • Validation status cache                            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Orders Table                                │  │
│  │  • Order line items with quantities                   │  │
│  │  • MOQ compliance audit trail                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Caching Layer (Redis)                       │
│  • Product MOQ settings cache                               │
│  • Active cart validation state cache                       │
│  • 99% cache hit rate target                                │
│  • TTL: 5 minutes (auto-refresh on updates)                 │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**

![MOQ Data Flow](/product/data-flows/data_flow_moq.png)

### 6.2 Data Model (ER Diagram)

![MOQ Data Model](/product/data-models/data_model_moq.png)

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type                  | Coverage Target                                                 | Responsibility | Tools                              |
| -------------------------- | --------------------------------------------------------------- | -------------- | ---------------------------------- |
| Unit Tests                 | Greater than 90% code coverage for MOQ validation logic         | Dev Team       | Jest, React Testing Library        |
| Integration Tests          | MOQ settings save → storefront propagation flow                 | Dev Team       | Jest, Supertest, Postman           |
| BDD Scenario Tests         | All Gherkin scenarios in Features F-01 through F-07 automated   | QA Team        | Cucumber, Playwright, Cypress      |
| API Tests                  | MOQ validation endpoints, cart operations, checkout enforcement | QA Team        | Postman, Newman, REST Assured      |
| Regression Tests           | Existing product/cart/checkout flows remain functional          | QA Team        | Automated regression test suite    |
| Visual Tests               | MOQ UI elements, error messages, button states                  | QA Team        | Percy, Chromatic, Applitools       |
| Performance Tests          | MOQ validation speed, cart operations, database queries         | QA Team        | JMeter, k6, Lighthouse             |
| Load Tests                 | Concurrent MOQ validations, bulk cart re-validation             | QA Team        | JMeter, Gatling, LoadRunner        |
| Accessibility Tests        | MOQ controls, error messages, keyboard navigation               | QA Team        | axe, WAVE, NVDA screen reader      |
| Security Tests             | MOQ bypass attempts, API manipulation, input injection          | Security Team  | OWASP ZAP, Burp Suite, Manual pen  |
| Cross-browser Tests        | MOQ functionality across Chrome, Firefox, Safari, Edge          | QA Team        | BrowserStack, Sauce Labs           |
| Mobile Responsiveness      | MOQ controls on mobile devices (375px+ screens)                 | QA Team        | Device lab, BrowserStack           |
| Database Transaction Tests | MOQ data integrity, cart re-validation consistency              | Dev Team       | Database testing frameworks        |
| UAT                        | Merchant MOQ configuration and customer shopping experience     | Product + QA   | Manual testing with real merchants |

### 7.2 BDD Test Automation

**All Gherkin scenarios in sections 3.1 through 3.7 must be automated as executable tests.**

**Test Structure:**

```
/tests
  /features
    /moq-configuration
      /merchant-dashboard-toggle.feature
      /moq-value-validation.feature
      /moq-settings-persistence.feature
    /moq-enforcement
      /product-page-validation.feature
      /floating-cart-validation.feature
      /cart-page-validation.feature
      /product-listing-behavior.feature
      /create-order-module.feature
    /moq-revalidation
      /settings-change-revalidation.feature
  /step-definitions
    /moq-configuration-steps.js
    /product-page-steps.js
    /cart-validation-steps.js
    /create-order-steps.js
    /revalidation-steps.js
  /support
    /hooks.js
    /test-data.js
    /moq-helpers.js
    /validation-helpers.js
  /fixtures
    /products-with-moq.json
    /cart-test-data.json
    /validation-scenarios.json
```

### 7.3 Critical Test Scenarios

**High Priority (P0 - Blocker):**

1. MOQ toggle enables/disables correctly in merchant dashboard
2. MOQ value validation (min 2, max 100, auto-correct < 2)
3. Product page quantity selector defaults to MOQ when enabled
4. Minus button disabled at MOQ threshold on product page
5. Add to Cart button disabled when quantity < MOQ
6. Inline validation error displays correctly when quantity < MOQ
7. Floating cart displays validation errors for items < MOQ
8. Checkout button disabled in floating cart when any item violates MOQ
9. Cart page validates quantities and shows errors correctly
10. Checkout button disabled on cart page with MOQ violations
11. Final checkout API validation prevents orders with MOQ violations
12. Create Order module enforces MOQ in product modal and Order Summary
13. MOQ re-validation triggers when merchant changes settings
14. Cart items re-validated correctly after MOQ setting changes
15. Product listing "Add to Cart" redirects to product page when MOQ enabled

**Medium Priority (P1 - Critical):**

16. MOQ field displays "2" as default when toggle OFF (no saved value)
17. MOQ field displays last saved value when toggle OFF (with saved value)
18. Turning toggle OFF with unsaved changes discards changes correctly
19. Empty MOQ field shows "Required\*" error when toggle ON
20. Save button blocked when MOQ field invalid or empty
21. MOQ value greater than 100 shows max value error
22. Quantity selector plus button always enabled
23. Quantity selector minus button state changes correctly
24. Manual quantity input validates on change and blur events
25. Validation errors clear when quantity corrected
26. Multiple items with MOQ violations show individual errors
27. Removing item with MOQ violation updates checkout button state
28. Buy Now button hidden on product listing when MOQ enabled
29. MOQ applies to all variants when Product Variants toggle enabled
30. Order Summary quantity controls validate MOQ in Create Order module

**Lower Priority (P2 - Important):**

31. MOQ settings save and propagate within 3 seconds
32. Cart validation completes in < 500ms for 50+ items
33. Product page loads with MOQ in < 2 seconds (P95)
34. MOQ validation adds < 200ms to product page operations
35. Real-time validation responds in < 100ms
36. Cache hit rate for MOQ lookups greater than 99%
37. Concurrent validation supports 10,000+ simultaneous carts
38. Mobile responsiveness for MOQ controls on 375px+ screens
39. Keyboard navigation works for all MOQ controls
40. Screen reader announces validation errors correctly
41. Color contrast for error messages meets WCAG AA
42. MOQ controls work on touch devices
43. RTL language support for MOQ UI
44. Error message text centralized and configurable
45. MOQ validation consistent across all order creation methods

---

## 8. Risks & Mitigations

### High-Impact Risks Requiring Attention

| Risk                                                        | Probability | Impact | Mitigation                                                                     | Residual Concern                                                                                       |
| ----------------------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Cart abandonment increases significantly due to MOQ barrier | High        | High   | Early MOQ disclosure on product cards; clear messaging; suggest alternatives   | Cannot fully control customer price sensitivity; may lose price-conscious customers who won't meet MOQ |
| Merchants set unrealistic MOQ values harming conversion     | High        | Medium | Provide recommended ranges and impact warnings; analytics showing abandonment  | Cannot prevent poor merchant decisions; may require intervention/education after launch                |
| Performance degradation with large-scale cart re-validation | Medium      | High   | Batch processing and rate limiting; background jobs                            | Under extreme load (MOQ changes affecting 10,000+ active carts), delays of 5-30 seconds possible       |
| Customer confusion about MOQ requirements                   | High        | High   | Extensive usability testing; clear UI/error messages; help resources           | First-time users may still struggle; requires ongoing message optimization based on support feedback   |
| MOQ conflicts with existing promotional/discount logic      | Medium      | High   | Thorough integration testing; clear precedence rules                           | Complex edge cases may surface post-launch requiring hotfixes                                          |
| Support volume spike overwhelming team                      | High        | Medium | Comprehensive training; self-service documentation; dedicated MOQ support tier | Initial 2-4 weeks post-launch will likely see 3-5x normal support volume                               |

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

| Stakeholder       | Role | Status      | Date Signed |
| ----------------- | ---- | ----------- | ----------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---         |
| Ruel Nopal        | HoE  | ☐ Pending   | ---         |
| Rian Froille Alde | QA   | ☐ Pending   | ---         |
| ---               | BE   | ☐ Pending   | ---         |
| ---               | FE   | ☐ Pending   | ---         |
| Adrianne Berida   | BA   | ☐ Completed | ---         |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for implementing Minimum Order Quantity (MOQ) functionality in Prosperna's merchant dashboard and storefront, enabling merchants to enforce quantity requirements while maintaining excellent customer experience through clear communication and multi-level validation.
