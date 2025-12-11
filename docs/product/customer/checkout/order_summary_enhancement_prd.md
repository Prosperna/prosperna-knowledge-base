---
id: checkout-order-summary-enhancement
title: Checkout - Order Summary Enhancement PRD
sidebar_label: Order Summary Enhancement
sidebar_position: 1
---

Agile-focused PRD documenting the enhancement of Prosperna's Order Summary section on the Checkout Page, enabling customers to modify cart items (add quantity, reduce quantity, remove items) directly during checkout without navigating back to the cart page.

**Demo Recording:**
[Checkout - Order Summary Enhancement Demo](https://sharing.clickup.com/clip/p/t7537039/199acbf9-836e-456a-93c4-a77622f8cbd4/199acbf9-836e-456a-93c4-a77622f8cbd4.webm?filename=Checkout%3A%20Edit%20Cart%20Items.webm)

## Document Control

| Item           | Details                                  |
| -------------- | ---------------------------------------- |
| Document Title | Checkout - Order Summary Enhancement PRD |
| Version        | 1.0                                      |
| Date           | December 08, 2025                        |
| Prepared by    | Business Analyst                         |
| Reviewed by    | To be assigned                           |
| Approved by    | To be assigned                           |
| Status         | For Review                               |
| Related BRD    | To be created                            |

---

## Revision History

| Version | Date         | Author           | Change Description                                      |
| ------- | ------------ | ---------------- | ------------------------------------------------------- |
| 1.0     | Dec 08, 2025 | Business Analyst | Initial draft - Order Summary Enhancement specification |

---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements, acceptance criteria (using BDD/Gherkin), and technical specifications for enhancing the Order Summary section on Prosperna's Checkout Page. The enhancement transforms the Order Summary from a read-only display into an interactive component where customers can modify item quantities (increase, decrease) and remove items without leaving the checkout flow, providing a streamlined shopping experience.

### 1.2 Feature Vision

Transform the checkout experience by enabling customers to make last-minute cart adjustments directly from the Order Summary section on the Checkout Page. Customers can increase item quantities, decrease item quantities, or remove items entirely, with all pricing calculations (Sub Total, Shipping Fee, Additional Fees, Customer Convenience Fee, Grand Total) updating in real-time. This eliminates the need to navigate back to the Cart Page for modifications, reducing friction and improving conversion rates.

### 1.3 Success Criteria

**User Adoption & Usage:**

- 70% of customers who modify cart items during checkout use the Order Summary controls instead of returning to Cart Page within 60 days of launch
- 50% reduction in checkout-to-cart-back navigation flows

**Technical Performance:**

- Debounced updates: 500ms delay after last user interaction before backend processing
- Backend processing completes within 2 seconds for cart updates
- Order Summary enters loading state during backend synchronization
- Empty cart detection and modal display within 100ms
- Zero calculation errors across all price components (Sub Total, Shipping Fee, Additional Fee, Customer Convenience Fee, Grand Total)
- Stock quantity validation prevents exceeding available inventory

**Business Impact:**

- 8% increase in average order value due to convenient quantity increases
- 40% reduction in "back to cart" navigation during checkout
- 20% decrease in checkout time for customers who modify quantities

### 1.4 Related Documents

- [Order Summary Enhancement Wireframe](https://p1-ba-pocs.vercel.app/edit-checkout)
- [Competitor Analysis | Checkout UX](https://pkb.prosperna.ph/docs/product/competitor-analysis/checkout-ux)

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

Prosperna's Checkout Page currently displays the Order Summary as a read-only section. Once customers reach the checkout stage, they cannot modify their cart contents through the Order Summary interface. If a customer wants to:

- Change the quantity of any item
- Remove an item they no longer want
- Add more quantity of an existing item

They must navigate back to either the Cart Page or use the Floating Cart overlay to make these changes, then return to the Checkout Page. This creates unnecessary friction in the checkout process.

**Step-by-step illustration of the current problematic workflow:**

1. Customer fills out checkout form (Contact, Delivery Address, Shipping Method, Payment Method)
2. Customer reviews Order Summary and realizes they want to change quantity or remove an item
3. Customer must click "Back to Shopping Cart" button or navigate to Cart Page
4. Customer makes modifications on Cart Page
5. Customer returns to Checkout Page
6. **All previously entered checkout information is lost**
7. Customer must re-enter or re-select Contact, Delivery, Shipping, and Payment information
8. Customer completes checkout with modified cart

**Impact of Current Limitations:**

- **Increased Friction:** Multi-step navigation required for simple quantity adjustments creates frustration
- **Form Data Loss Risk:** Customers may lose entered shipping/payment information when navigating away from checkout
- **Checkout Abandonment:** 15-20% of customers abandon checkout when they realize modifications require leaving the page
- **Reduced Conversion:** Customers who want to increase quantities but don't want to lose form progress settle for lower quantities
- **Time Inefficiency:** Average 2-3 minutes additional time spent navigating back and forth between Cart and Checkout

### 2.2 Current State

**Current Order Summary Behavior on Checkout Page:**

1. **Display Components:**

   - Product image
   - Product name
   - Product variant (if applicable)
   - Quantity and unit price (e.g., "1 x ₱ 299.00")
   - Line item total (quantity × unit price)
   - Sub Total (sum of all line items)
   - Shipping Fee
   - Additional Fee
   - Customer Convenience Fee
   - Grand Total

2. **Read-Only Nature:**

   - No interactive controls for quantity adjustment
   - No remove/delete button for items
   - Quantity displayed as static text
   - Cart modifications require navigating away from Checkout Page

3. **Customer Actions Limited To:**

   - View item details (name, variant, price, quantity)
   - View total calculations
   - Apply promo code
   - Proceed to payment or go back to cart

4. **Modification Workflow:**
   - Customer must click "Back to Shopping Cart" button
   - System navigates to Cart Page
   - Customer modifies items on Cart Page
   - Customer clicks "Checkout" to return
   - Customer re-enters/re-selects checkout form information

**Current Limitations:**

- Zero interactivity in Order Summary item list
- No quantity adjustment controls (+ / - buttons)
- No item removal capability from Order Summary
- Requires full page navigation for any cart modification
- Creates unnecessary checkout friction and potential abandonment

### 2.3 Desired Future State

**Enhanced Order Summary with Inline Editing Capabilities:**

1. **Quantity Controls for Each Item:**

   - **Minus (-) Button:**

     - Decreases item quantity by 1
     - Positioned to the left of quantity display
     - Minimum quantity: 1 unit
     - Disabled (grayed out) when quantity equals 1
     - Enabled when quantity is greater than 1
     - Border and icon color change to indicate disabled state

   - **Quantity Display:**

     - Shows current item quantity in non-editable numeric display
     - Centered between minus and plus buttons
     - Bordered container matching button style
     - Updates in real-time as quantity changes

   - **Plus (+) Button:**
     - Increases item quantity by 1
     - Positioned to the right of quantity display
     - Maximum quantity limit depends on stock availability

2. **Item Removal Control:**

   - **Remove Button:**
     - Allows customer to remove item entirely from cart
     - Displayed as a Trash icon in red color (#dc3545)
     - Positioned in the top-right of each item
     - Clicking triggers removal logic
     - If last item in cart: displays "Empty Cart Warning" modal
     - If not last item: removes item immediately with real-time total updates

3. **Real-Time Calculation Updates:**

   - **Sub Total Recalculation:**

     - Automatically updates when any quantity changes
     - Formula: Sum of (quantity × unit price) for all items
     - Updates within 200ms of quantity change

   - **Additional Fees Recalculation:**

     - Customer Convenience Fee recalculates based on new Sub Total
     - All dependent fees update in sync

   - **Grand Total Recalculation:**
     - Formula: Sub Total + Shipping Fee + Additional Fee + Customer Convenience Fee
     - Updates immediately after any cart modification
     - Displays with 2 decimal places (₱ format)

4. **Empty Cart Detection and Handling:**

   - **Last Item Removal Trigger:**

     - When customer attempts to remove the final item in cart
     - System detects cartItems.length `===` 1 condition
     - Displays "Empty Cart Warning" modal before proceeding

   - **Warning Modal Content:**

     - **Title:** "Warning"
     - **Message:** "You are about to empty your cart. If you wish to proceed, the system will clear out your shopping cart and redirect you back to the product listing. Do you wish to proceed?"
     - **Actions:**
       - "Cancel" button: Closes modal, preserves item in cart
       - "Confirm" button: Executes cart clearing and redirects

   - **Post-Confirmation Actions:**
     - Cart cleared (cartItems set to empty array)
     - Modal closes
     - Success toast displays: "Successfully cleared shopping cart."
     - Customer redirected to Product Listing Page
     - Toast auto-dismisses

**Benefits After Implementation:**

- **Seamless Checkout Flow:** Customers can adjust cart without leaving checkout page, preserving entered form data
- **Increased Convenience:** Last-minute quantity changes handled inline without navigation
- **Reduced Abandonment:** 15-20% expected reduction in checkout abandonment due to friction elimination
- **Higher Average Order Value:** Easier quantity increases lead to higher cart values (estimated 8% increase)
- **Improved Conversion:** Customers complete purchase faster with fewer steps
- **Time Savings:** Average checkout time reduced by 2-3 minutes for customers who modify quantities
- **Data Preservation:** Checkout form data remains intact during cart modifications

### 2.4 Target Users

| User Segment               | Description                                            | Use Case                                                                 | Frequency                |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------ |
| Last-Minute Adjusters      | Customers who review cart at checkout and want changes | Realize they want more/less quantity after entering shipping information | High (40-50% of users)   |
| Budget-Conscious Customers | Customers monitoring total price                       | Adjust quantities to meet budget without restarting checkout             | Medium (30% of users)    |
| Mobile Shoppers            | Customers shopping on mobile devices                   | Need easy, inline controls due to limited screen space and navigation    | High (50-60% of traffic) |
| Repeat Customers           | Customers familiar with the store                      | Want quick quantity adjustments without interrupting checkout flow       | High (frequent buyers)   |
| Impulse Buyers             | Customers adding items quickly                         | Increase quantities for items they like while reviewing final order      | Medium (20-30% of users) |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**

- Enhancement scope limited to Order Summary section only
- Other checkout elements (Contact, Delivery, Shipping, Payment sections) remain unchanged
- Must maintain existing checkout form data when quantities are modified
- Real-time calculation updates required (no page reload)
- Must work with existing cart state management system
- Mobile responsive design required for all quantity controls
- Empty cart detection must be fail-safe (prevent orphaned checkout pages)

**Business Constraints:**

- Cannot disrupt existing checkout completion rate during rollout
- Must maintain calculation accuracy for all fee components
- Performance must not degrade (quantity updates in less than 500ms)
- Must comply with existing order processing workflows
- Cannot introduce new bugs to checkout form submission
- Must work with all existing payment methods and shipping options

**Key Assumptions:**

- Customers will use inline quantity controls when available rather than navigating back to cart
- Enabling inline editing will reduce checkout abandonment
- Customers understand standard e-commerce quantity controls (+ / - buttons)
- Empty cart scenario during checkout is rare but must be handled gracefully
- Mobile users will benefit equally from inline controls
- Quantity increase functionality will drive higher average order values
- Customers will complete checkout faster with inline editing capability

**User Experience Assumptions:**

- Customers expect immediate visual feedback when adjusting quantities
- Red color for remove button clearly indicates deletion action
- Disabled minus button at quantity `=` 1 is intuitive (prevents going below 1)
- Warning modal for last item removal prevents accidental cart clearing
- Success toast after cart clearing provides adequate feedback
- Redirect to Product Listing after cart clearing is expected behavior

---

## 3. Functional Requirements & BDD Scenarios

---

### Feature F-01: Quantity Increase Control

#### 3.1.1 Feature Context

Enable customers to increase item quantities directly from the Order Summary on the Checkout Page using a plus (+) button, with real-time recalculation of line item totals, Sub Total, dependent fees, and Grand Total.

#### 3.1.2 Business Rules

**BR-01: Plus Button Behavior**

- Plus (+) button increases quantity by 1 unit when clicked
- Button is disabled (grayed out) when cart item quantity equals available stock quantity
- Button styled with border, transparent background

**BR-02: Debounced Backend Synchronization**

- System waits 500ms of no user activity before processing changes
- Multiple rapid clicks within 500ms window: only final state is processed
- After 500ms delay, backend API called to update cart and recalculate totals
- Example: Customer clicks "+" 5 times in 2 seconds → system waits 500ms after last click, then sends single update request

**BR-03: Optimistic UI Updates**

- Quantity display updates immediately in UI (optimistic update) when button clicked
- Price totals (Sub Total, Customer Convenience Fee, Grand Total) remain unchanged during debounce period
- Totals only update after backend processing completes successfully
- Quantity shown reflects pending change, prices reflect last confirmed state

**BR-04: Loading State During Backend Processing**

- After 500ms debounce period ends, Order Summary section enters loading state
- Loading state visual indicators:
  - Loading spinner displayed in Order Summary section
  - Entire Order Summary section grayed out (opacity reduced)
  - All quantity controls (+, -, Remove buttons) disabled
  - Customer cannot interact with any controls during loading
- Checkout form sections (Contact, Delivery, Shipping, Payment) remain enabled and interactive
- Loading state ends when backend returns updated data

**BR-05: Post-Loading Updates**

- After backend processing completes, loading state removed
- Price totals update with backend-calculated values:
  - Line item total `=` confirmed quantity × unit price
  - Sub Total `=` sum of all line item totals
  - Grand Total `=` Sub Total + Shipping Fee + Additional Fee + Customer Convenience Fee
- All calculations display with 2 decimal places in ₱ format
- Controls re-enabled, customer can make additional changes
- No page reload or navigation required

**BR-06: Stock Quantity Validation**

- System tracks available stock quantity for each product in cart
- Plus (+) button disabled when cart quantity equals available stock
- Disabled state persists until stock is replenished or item removed
- System prevents customer from exceeding available inventory

#### 3.1.3 Scenarios

##### Scenario 1: Customer increases quantity by 1 using plus button

```gherkin
Given a customer is on the Checkout Page
And the Order Summary displays "Prosperna Burger" with quantity "1" and unit price "₱ 299.00"
And the current line item total is "₱ 299.00"
And the current Sub Total is "₱ 999.00"
And the current Customer Convenience Fee is "₱ 9.99"
And the current Grand Total is "₱ 1,058.99"
When the customer clicks the plus (+) button for "Prosperna Burger"
Then the quantity display updates from "1" to "2" within 200ms
And the line item total updates to "₱ 598.00" (2 × 299.00)
And the Sub Total recalculates to "₱ 1,298.00"
And the Customer Convenience Fee recalculates to "₱ 12.98"
And the Grand Total updates to "₱ 1,360.98"
And all updates occur simultaneously without page reload
And the checkout form data remains unchanged (email, address, payment info preserved)
```

##### Scenario 2: Customer increases quantity multiple times in succession

```gherkin
Given a customer is on the Checkout Page
And "Zarks Mac & Cheese Burger" has quantity "1" and unit price "₱ 320.00"
And the current line item total is "₱ 320.00"
When the customer clicks the plus (+) button once
Then the quantity updates to "2"
And the line item total updates to "₱ 640.00"
When the customer clicks the plus (+) button again
Then the quantity updates to "3"
And the line item total updates to "₱ 960.00"
When the customer clicks the plus (+) button a third time
Then the quantity updates to "4"
And the line item total updates to "₱ 1,280.00"
And all totals (Sub Total, Customer Convenience Fee, Grand Total) recalculate after each click
And each update completes within 500ms
```

##### Scenario 3: Plus button disabled when cart quantity equals stock quantity

```gherkin
Given a customer is on the Checkout Page
And "Prosperna Burger" has quantity "5" and unit price "₱ 299.00"
And the available stock quantity for "Prosperna Burger" is "5"
When the customer views the quantity controls
Then the plus (+) button is disabled (grayed out)
And the button has light gray border
And the plus icon has light gray color
And the cursor shows "not-allowed" on hover
When the customer attempts to click the disabled plus (+) button
Then no action occurs (click is prevented)
And the quantity remains at "5"
And no backend call is triggered
```

##### Scenario 4: Customer rapidly clicks plus button, debounced to single backend call

```gherkin
Given a customer is on the Checkout Page
And "Prosperna Burger" has quantity "1" and unit price "₱ 299.00"
And the current Sub Total is "₱ 999.00"
And the current Grand Total is "₱ 1,058.99"
When the customer clicks the plus (+) button 5 times rapidly within 2 seconds
Then the quantity display updates optimistically to "6" immediately
And the Sub Total remains "₱ 999.00" (unchanged during debounce)
And the Grand Total remains "₱ 1,058.99" (unchanged during debounce)
And the system starts a 500ms debounce timer after the last click
When 500ms pass with no additional clicks
Then the Order Summary section enters loading state
And a loading spinner is displayed
And the Order Summary is grayed out (reduced opacity)
And all quantity controls (+, -, Remove buttons) are disabled
And a single backend API call is made with quantity "6"
When the backend returns the updated cart data (within 2 seconds)
Then the loading state is removed
And the Sub Total updates to "₱ 1,794.00" (6 × 299)
And the Customer Convenience Fee updates to "₱ 17.94"
And the Grand Total updates to "₱ 1,861.94"
And all controls are re-enabled
```

##### Scenario 5: Loading state does not affect checkout form sections

```gherkin
Given a customer is on the Checkout Page
And the customer has partially filled out the checkout form
And the Order Summary contains items
When the customer increases an item quantity
And 500ms pass triggering the loading state in Order Summary
Then the Order Summary section shows loading spinner and is grayed out
And the Order Summary controls are disabled
But the Contact section remains enabled and editable
And the Delivery section remains enabled and editable
And the Shipping section remains enabled and selectable
And the Payment section remains enabled and selectable
And the customer can continue filling out the checkout form
And all entered form data is preserved
```

##### Scenario 6: Quantity increase with multiple items in cart

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains 3 items:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 1        | ₱ 299.00   | ₱ 299.00   |
  | Zarks Mac & Cheese Burger   | 1        | ₱ 320.00   | ₱ 320.00   |
  | Zarks Tombstone Burger      | 1        | ₱ 380.00   | ₱ 380.00   |
And the Sub Total is "₱ 999.00"
When the customer clicks the plus (+) button for "Zarks Tombstone Burger"
Then the "Zarks Tombstone Burger" quantity updates to "2"
And the "Zarks Tombstone Burger" line total updates to "₱ 760.00"
And the Sub Total recalculates to "₱ 1,379.00" (299 + 320 + 760)
And the other items' quantities and line totals remain unchanged
And the Customer Convenience Fee recalculates based on new Sub Total
And the Grand Total updates accordingly
```

---

### Feature F-02: Quantity Decrease Control

#### 3.2.1 Feature Context

Enable customers to decrease item quantities from the Order Summary using a minus (-) button, with debounced backend synchronization and loading state during processing. The minus button enforces a minimum quantity of 1 (cannot reduce below 1), at which point it becomes disabled.

#### 3.2.2 Business Rules

**BR-07: Minus Button Behavior**

- Minus (-) button decreases quantity by 1 unit when clicked
- Minimum quantity: 1 unit (cannot go below 1)
- Button is disabled (grayed out) when quantity equals 1
- Button is enabled when quantity is greater than 1
- Enabled state styling: border and icon color (dark gray), cursor "pointer"

**BR-08: Quantity Decrease with Debouncing**

- Minus button follows same 500ms debounce logic as plus button
- Quantity display updates optimistically (immediately shows new value)
- Price totals remain unchanged until backend processing completes
- Multiple rapid decreases within 500ms: only final state processed
- After debounce period, Order Summary enters loading state
- Backend calculates new totals and returns updated data

**BR-09: Minimum Quantity Enforcement**

- When quantity equals 1, minus button becomes disabled
- Clicking disabled minus button produces no action
- Quantity cannot decrease below 1
- To remove item entirely, customer must use Remove button
- Minus button re-enables when quantity increases above 1 via plus button

#### 3.2.3 Scenarios

##### Scenario 1: Customer decreases quantity from 2 to 1

```gherkin
Given a customer is on the Checkout Page
And "Prosperna Burger" has quantity "2" and unit price "₱ 299.00"
And the current line item total is "₱ 598.00"
And the current Sub Total is "₱ 1,298.00"
And the minus (-) button is enabled (not grayed out)
When the customer clicks the minus (-) button for "Prosperna Burger"
Then the quantity display updates from "2" to "1" within 200ms
And the line item total updates to "₱ 299.00" (1 × 299.00)
And the Sub Total recalculates to "₱ 999.00"
And the Customer Convenience Fee recalculates to "₱ 9.99"
And the Grand Total updates accordingly
And the minus (-) button becomes disabled (grayed out) because quantity is now 1
And the button border and icon change to light gray color
And the cursor changes to "not-allowed" on hover
```

##### Scenario 2: Minus button is disabled at quantity 1 by default

```gherkin
Given a customer is on the Checkout Page
And "Zarks Mac & Cheese Burger" has quantity "1" and unit price "₱ 320.00"
When the customer views the quantity controls for this item
Then the minus (-) button is disabled (grayed out)
And the button has light gray border
And the minus icon has light gray color
And the cursor shows "not-allowed" on hover
When the customer attempts to click the disabled minus (-) button
Then no action occurs (click is prevented)
And the quantity remains at "1"
And no totals are recalculated
```

##### Scenario 3: Quantity decrease with multiple items preserves other items' states

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 3        | ₱ 299.00   | ₱ 897.00   |
  | Zarks Mac & Cheese Burger   | 1        | ₱ 320.00   | ₱ 320.00   |
  | Zarks Tombstone Burger      | 2        | ₱ 380.00   | ₱ 760.00   |
And the Sub Total is "₱ 1,977.00"
When the customer clicks the minus (-) button for "Prosperna Burger"
Then the "Prosperna Burger" quantity updates to "2"
And the "Prosperna Burger" line total updates to "₱ 598.00"
And the Sub Total recalculates to "₱ 1,678.00" (598 + 320 + 760)
And the "Zarks Mac & Cheese Burger" quantity remains "1" (minus button still disabled)
And the "Zarks Tombstone Burger" quantity remains "2" (minus button still enabled)
And only the "Prosperna Burger" line item and totals are updated
And the Customer Convenience Fee and Grand Total recalculate based on new Sub Total
```

---

### Feature F-03: Item Removal Control

#### 3.3.1 Feature Context

Enable customers to remove items entirely from the Order Summary during checkout using a Remove button. When removing the last item, display a warning modal to confirm cart clearing and redirect to Product Listing.

#### 3.3.2 Business Rules

**BR-10: Remove Button Behavior**

- Remove button displayed as Trash icon in red color
- Positioned in the top-right of each item in Order Summary
- Clicking triggers removal logic with 500ms debounce
- If not the last item: triggers debounced backend removal process
- If last item (cartItems.length `===` 1): displays "Empty Cart Warning" modal immediately (no debounce)

**BR-11: Item Removal with Debouncing (Not Last Item)**

- When Remove button clicked, 500ms debounce timer starts
- If customer clicks Remove on another item within 500ms, both removals batched
- After 500ms of no activity, Order Summary enters loading state
- Backend API called to remove item(s) and recalculate totals
- Item visually marked for removal (grayed out) during debounce period
- After backend confirms removal:
  - Item removed from Order Summary display
  - Sub Total decreases by removed item's line total
  - Customer Convenience Fee recalculates based on new Sub Total
  - Grand Total updates accordingly
- Remaining items stay intact with unchanged quantities

**BR-12: Last Item Removal Warning**

- When customer clicks Remove button on the last remaining item in cart:
  - System detects cartItems.length `===` 1
  - "Empty Cart Warning" modal displays immediately
  - Checkout page remains visible in background (modal overlay)
- **Modal Content:**
  - Title: "Warning"
  - Message: "You are about to empty your cart. If you wish to proceed, the system will clear out your shopping cart and redirect you back to the product listing. Do you wish to proceed?"
  - Actions:
    - "Cancel" button: Closes modal, item remains in cart
    - "Confirm" button: Proceeds with cart clearing

**BR-13: Post-Confirmation Actions (Empty Cart Flow)**

- When customer clicks "Confirm" in Empty Cart Warning modal:
  1. Order Summary enters loading state
  2. Backend API called to clear cart
  3. After backend confirmation:
     - Cart cleared (cartItems set to empty array)
     - Modal closes
     - Success toast displays: "Successfully cleared shopping cart."
     - Customer redirected to Product Listing Page
     - Toast auto-dismisses
- Customer cannot remain on Checkout Page with empty cart (orphaned checkout state prevented)

**BR-14: Cancel Empty Cart Flow**

- When customer clicks "Cancel" in Empty Cart Warning modal:
  - Modal closes immediately
  - No cart clearing occurs
  - Last item remains in cart
  - Customer remains on Checkout Page
  - All checkout form data preserved

#### 3.3.3 Scenarios

##### Scenario 1: Customer removes non-last item from Order Summary

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains 3 items:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 1        | ₱ 299.00   | ₱ 299.00   |
  | Zarks Mac & Cheese Burger   | 1        | ₱ 320.00   | ₱ 320.00   |
  | Zarks Tombstone Burger      | 1        | ₱ 380.00   | ₱ 380.00   |
And the Sub Total is "₱ 999.00"
And the Customer Convenience Fee is "₱ 9.99"
And the Grand Total is "₱ 1,058.99"
When the customer clicks the Remove button for "Zarks Mac & Cheese Burger"
Then "Zarks Mac & Cheese Burger" is removed from Order Summary
And no confirmation modal is displayed
And the Order Summary now displays only 2 items:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 1        | ₱ 299.00   | ₱ 299.00   |
  | Zarks Tombstone Burger      | 1        | ₱ 380.00   | ₱ 380.00   |
And the Sub Total recalculates to "₱ 679.00" (299 + 380)
And the Customer Convenience Fee recalculates to "₱ 6.79"
And the Grand Total updates to "₱ 735.79"
And the customer remains on the Checkout Page
And all checkout form data is preserved
```

##### Scenario 2: Customer attempts to remove last item, modal displays

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains only 1 item:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 1        | ₱ 299.00   | ₱ 299.00   |
When the customer clicks the Remove button for "Prosperna Burger"
Then the "Empty Cart Warning" modal displays immediately
And the modal has the title "Warning"
And the modal message reads "You are about to empty your cart. If you wish to proceed, the system will clear out your shopping cart and redirect you back to the product listing. Do you wish to proceed?"
And the modal displays two buttons: "Cancel" and "Confirm"
And the Checkout Page is visible in the background with modal overlay
And the item is NOT removed yet (still in cart)
```

##### Scenario 3: Customer confirms empty cart, redirected to Product Listing

```gherkin
Given the "Empty Cart Warning" modal is displayed
And the customer has clicked Remove button on the last item
When the customer clicks the "Confirm" button in the modal
Then the cart is cleared (cartItems set to empty array)
And the modal closes
And a success toast appears at the top of the page
And the toast message reads "Successfully cleared shopping cart."
And the customer is redirected to the Product Listing Page
And the Product Listing Page displays available products
And the toast auto-dismisses
And the customer cannot navigate back to the empty Checkout Page
```

##### Scenario 4: Customer cancels empty cart, item remains

```gherkin
Given the "Empty Cart Warning" modal is displayed
And the customer has clicked Remove button on the last item "Zarks Tombstone Burger"
When the customer clicks the "Cancel" button in the modal
Then the modal closes immediately
And no cart clearing occurs
And "Zarks Tombstone Burger" remains in the Order Summary
And the quantity is still "1"
And the Sub Total, Customer Convenience Fee, and Grand Total remain unchanged
And the customer remains on the Checkout Page
And all checkout form data is preserved (email, address, payment info intact)
```

##### Scenario 5: Item removal with debouncing and loading state

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains 3 items
And the current Sub Total is "₱ 999.00"
When the customer clicks Remove button for "Zarks Mac & Cheese Burger"
Then the item is visually marked for removal (grayed out)
And the 500ms debounce timer starts
And the Sub Total remains "₱ 999.00" (unchanged during debounce)
When 500ms pass with no additional actions
Then the Order Summary section enters loading state
And a loading spinner is displayed
And all quantity controls are disabled
And the backend API is called to remove the item
When the backend confirms removal (within 2 seconds)
Then the loading state is removed
And "Zarks Mac & Cheese Burger" disappears from Order Summary
And the Order Summary now displays only 2 items
And the Sub Total updates to "₱ 679.00"
And the Customer Convenience Fee recalculates to "₱ 6.79"
And the Grand Total updates to "₱ 735.79"
And all controls are re-enabled
```

##### Scenario 6: Customer removes multiple items within debounce window (batched)

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains 3 items:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 1        | ₱ 299.00   | ₱ 299.00   |
  | Zarks Mac & Cheese Burger   | 1        | ₱ 320.00   | ₱ 320.00   |
  | Zarks Tombstone Burger      | 1        | ₱ 380.00   | ₱ 380.00   |
And the current Sub Total is "₱ 999.00"
When the customer clicks Remove button for "Prosperna Burger"
Then "Prosperna Burger" is marked for removal
And the 500ms debounce timer starts
When the customer clicks Remove button for "Zarks Mac & Cheese Burger" within 500ms
Then "Zarks Mac & Cheese Burger" is also marked for removal
And the debounce timer resets to 500ms
When 500ms pass with no additional actions
Then the Order Summary enters loading state
And a single backend API call is made to remove both items
When the backend confirms both removals
Then the loading state is removed
And both "Prosperna Burger" and "Zarks Mac & Cheese Burger" disappear
And only "Zarks Tombstone Burger" remains
And the Sub Total updates to "₱ 380.00"
And the Customer Convenience Fee updates to "₱ 3.80"
And the Grand Total updates accordingly
```

##### Scenario 7: Customer removes multiple items sequentially

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains 3 items:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 2        | ₱ 299.00   | ₱ 598.00   |
  | Zarks Mac & Cheese Burger   | 1        | ₱ 320.00   | ₱ 320.00   |
  | Zarks Tombstone Burger      | 1        | ₱ 380.00   | ₱ 380.00   |
And the Sub Total is "₱ 1,298.00"
When the customer clicks Remove button for "Prosperna Burger"
Then "Prosperna Burger" is removed without modal
And the Order Summary now has 2 items
And the Sub Total recalculates to "₱ 700.00" (320 + 380)
When the customer clicks Remove button for "Zarks Mac & Cheese Burger"
Then "Zarks Mac & Cheese Burger" is removed without modal
And the Order Summary now has 1 item: "Zarks Tombstone Burger"
And the Sub Total recalculates to "₱ 380.00"
When the customer clicks Remove button for "Zarks Tombstone Burger" (the last item)
Then the "Empty Cart Warning" modal displays
And the customer must confirm or cancel to proceed
```

---

### Feature F-04: Backend Total Recalculation with Loading States

#### 3.4.1 Feature Context

Automatically recalculate and update all monetary totals in the Order Summary (Sub Total, Customer Convenience Fee, Grand Total) via backend processing whenever cart modifications occur (quantity increase, quantity decrease, item removal). Updates are debounced (500ms) and processed through backend API calls with loading state indicators.

#### 3.4.2 Business Rules

**BR-15: Backend Total Calculation**

- All price calculations performed by backend API, not client-side
- Backend calculates:
  - Sub Total `=` sum of (quantity × unit price) for all items
  - Grand Total `=` Sub Total + Shipping Fee + Additional Fee + Customer Convenience Fee
- All calculations use proper decimal precision (2 decimal places)
- Displays with 2 decimal places in ₱ format (e.g., "₱ 999.00")

**BR-16: Debounced Calculation Trigger**

- Price totals do NOT update immediately when quantity buttons clicked
- System waits 500ms of no user activity before triggering backend calculation
- During debounce period: quantity display shows new value, but prices remain unchanged
- After 500ms: loading state activates, backend API called
- Multiple changes within 500ms batched into single backend request

**BR-17: Loading State During Calculation**

- After debounce period ends, Order Summary enters loading state
- Loading indicators:
  - Spinner displayed
  - Order Summary section grayed out (reduced opacity)
  - All controls (+, -, Remove buttons) disabled
- Checkout form sections remain enabled during Order Summary loading
- Loading state persists until backend returns calculated totals

**BR-18: Post-Calculation Updates**

- After backend processing completes (typically within 2 seconds):
  - Loading state removed
  - All price totals update simultaneously with backend-calculated values
  - Controls re-enabled for additional modifications
  - No page reload or navigation required
- Updates are synchronous (all totals update at once)
- No flickering or visual glitches during recalculation

**BR-19: Calculation Accuracy**

- Backend calculations must use proper decimal precision (2 decimal places)
- Rounding follows standard financial rounding rules (round half up)
- Zero calculation errors tolerated (100% accuracy required)
- Totals must always balance: Grand Total `=` Sub Total + all fees
- No floating-point arithmetic errors in displayed values

#### 3.4.3 Scenarios

##### Scenario 1: Sub Total recalculates after quantity increase

```gherkin
Given a customer is on the Checkout Page
And the Order Summary contains:
  | Item                        | Quantity | Unit Price | Line Total |
  | Prosperna Burger            | 1        | ₱ 299.00   | ₱ 299.00   |
  | Zarks Mac & Cheese Burger   | 1        | ₱ 320.00   | ₱ 320.00   |
  | Zarks Tombstone Burger      | 1        | ₱ 380.00   | ₱ 380.00   |
And the current Sub Total is "₱ 999.00"
When the customer clicks the plus (+) button for "Prosperna Burger"
Then the "Prosperna Burger" line total updates to "₱ 598.00" (2 × 299.00)
And the Sub Total recalculates
And the new Sub Total is "₱ 1,298.00" (598 + 320 + 380)
And the update occurs without page reload
```

##### Scenario 2: Grand Total updates after all dependent calculations

```gherkin
Given a customer is on the Checkout Page
And the current totals are:
  | Sub Total                  | ₱ 999.00   |
  | Shipping Fee               | ₱ 0.00     |
  | Additional Fee             | ₱ 50.00    |
  | Customer Convenience Fee   | ₱ 9.99     |
  | Grand Total                | ₱ 1,058.99 |
When the customer increases "Zarks Mac & Cheese Burger" quantity from 1 to 3
Then the "Zarks Mac & Cheese Burger" line total updates to "₱ 960.00" (3 × 320.00)
And the Sub Total recalculates to "₱ 1,639.00"
And the Customer Convenience Fee recalculates to "₱ 16.39"
And the Grand Total recalculates to "₱ 1,705.39" (1639 + 0 + 50 + 16.39)
And the Shipping Fee (₱ 0.00) and Additional Fee (₱ 50.00) remain unchanged
```

---

### Feature F-05: Checkout Form Data Preservation

#### 3.5.1 Feature Context

Ensure all checkout form data (Contact, Delivery, Shipping, Payment sections) remains intact and unchanged when customers modify cart items via the Order Summary, preventing data loss and eliminating the need to re-enter information.

#### 3.5.2 Business Rules

**BR-20: Form Data Persistence During Cart Modifications**

- All cart modifications (quantity increase, decrease, item removal) occur without page navigation
- Checkout form fields retain entered values during Order Summary loading states:
  - Contact: Email Address
  - Delivery: First Name, Last Name, Phone, Address Line, State/Province, Town/City, Barangay, Zip/Postal Code, Landmark
  - Shipping: Selected shipping method
  - Payment: Selected payment method (E-Wallets, Credit/Debit Card, Over the Counter, Cash on Delivery, Bank Transfer)
  - Order Notes: Any entered notes
- Checkout form sections remain enabled and editable during Order Summary loading
- Form state managed in memory, not reset during quantity updates or item removals

**BR-21: No Page Reload or Navigation**

- All Order Summary interactions occur via API calls to backend
- No page refresh required for quantity changes or removals
- No navigation away from Checkout Page unless emptying cart
- Only Order Summary section shows loading state, rest of page remains interactive

**BR-22: Exception - Empty Cart Flow**

- When customer confirms emptying the cart via "Empty Cart Warning" modal:
  - Cart cleared and customer redirected to Product Listing Page
  - Form data is lost in this scenario (expected behavior)
  - Customer cannot return to Checkout Page with empty cart
- All other scenarios preserve form data

#### 3.5.3 Scenarios

##### Scenario 1: Form data preserved after quantity increase

```gherkin
Given a customer is on the Checkout Page
And the customer has filled out the checkout form:
  | Field                | Value                       |
  | Email                | test@prosperna.com          |
  | First Name           | Juan                        |
  | Last Name            | Dela Cruz                   |
  | Phone                | +63 (912) 345 6789          |
  | Address Line         | 123 Main Street             |
  | State/Province       | Metro Manila                |
  | Town/City            | Makati                      |
  | Barangay             | Poblacion                   |
  | Zip/Postal Code      | 1210                        |
  | Shipping Method      | Manual Shipping by Merchant |
  | Payment Method       | E-Wallets (GCash)           |
When the customer increases "Prosperna Burger" quantity from 1 to 3
Then the quantity updates to 3 in the Order Summary
And the Sub Total and Grand Total recalculate
And all form fields retain their original values:
  | Field                | Value                       |
  | Email                | test@prosperna.com          |
  | First Name           | Juan                        |
  | Last Name            | Dela Cruz                   |
  | Phone                | +63 (912) 345 6789          |
  | Address Line         | 123 Main Street             |
  | State/Province       | Metro Manila                |
  | Town/City            | Makati                      |
  | Barangay             | Poblacion                   |
  | Zip/Postal Code      | 1210                        |
  | Shipping Method      | Manual Shipping by Merchant |
  | Payment Method       | E-Wallets (GCash)           |
And no re-entry of information is required
```

##### Scenario 2: Form data preserved through multiple cart modifications

```gherkin
Given a customer is on the Checkout Page
And the customer has filled out all checkout form sections
And the customer has entered email, shipping address, and selected payment method
When the customer performs the following actions in sequence:
  1. Increases "Prosperna Burger" quantity from 1 to 2
  2. Decreases "Zarks Tombstone Burger" quantity from 2 to 1
  3. Removes "Zarks Mac & Cheese Burger"
  4. Increases "Prosperna Burger" quantity from 2 to 4
Then after all 4 modifications are complete
And all checkout form fields still contain the originally entered values
And the customer does not need to re-enter or re-select any information
And the customer can proceed directly to "Pay Now" without additional form filling
```

##### Scenario 3: Form data lost only when emptying cart (expected behavior)

```gherkin
Given a customer is on the Checkout Page
And the customer has filled out the checkout form completely
And the Order Summary contains only 1 item
When the customer clicks Remove button on the last item
And the "Empty Cart Warning" modal displays
And the customer clicks "Confirm" to empty the cart
Then the cart is cleared
And the customer is redirected to the Product Listing Page
And the previously entered checkout form data is lost (not preserved)
And if the customer adds items and returns to Checkout
Then the checkout form is empty/default state (requires re-entry)
And this data loss is expected behavior for the empty cart scenario
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement                            | Metric                                                       | Measurement Method              |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| Debounce delay                         | 500ms after last user interaction before backend call        | Timer measurement               |
| Optimistic UI update                   | Less than 50ms from click to quantity display update         | Frontend performance monitoring |
| Backend processing time                | Less than 2 seconds for cart update and recalculation        | API response time monitoring    |
| Loading state activation               | Immediate upon debounce completion (less than 50ms)          | UI rendering metrics            |
| Total update after backend response    | Less than 100ms to update all totals after data received     | State update timing             |
| Modal display time (last item removal) | Less than 100ms from click to modal appearance (no debounce) | UI rendering metrics            |
| Redirect time after cart clearing      | Less than 500ms from backend confirmation to Product Listing | Page navigation timing          |
| Stock quantity validation              | Real-time check on every page load (less than 200ms)         | API response time               |
| No UI lag or flickering                | 60 FPS maintained during loading states                      | Browser frame rate monitoring   |

### 4.2 Scalability

| Requirement                      | Target                                                         | Validation Method        |
| -------------------------------- | -------------------------------------------------------------- | ------------------------ |
| Cart size support                | Handle 100+ items in Order Summary without lag                 | Stress testing           |
| Rapid quantity changes           | Debounce handles 50+ rapid clicks, single backend call         | User interaction testing |
| Concurrent users modifying carts | Backend supports 10,000+ simultaneous cart update API requests | Load testing             |
| Memory management                | No memory leaks during extended checkout sessions              | Browser memory profiling |
| Batched operations               | Support removing/modifying up to 20 items in single API call   | Backend load testing     |

### 4.3 Reliability

| Requirement                        | Target                                             | Monitoring                  |
| ---------------------------------- | -------------------------------------------------- | --------------------------- |
| Backend calculation accuracy       | 100% accurate backend calculations (zero errors)   | Automated calculation tests |
| State synchronization reliability  | Zero state corruption between frontend and backend | State integrity testing     |
| Empty cart detection accuracy      | 100% correct detection of last item removal        | Edge case testing           |
| Form data preservation reliability | 100% retention of form data during loading states  | Data persistence testing    |
| Debounce timer accuracy            | 100% reliable 500ms delay implementation           | Timer accuracy testing      |
| Stock validation accuracy          | 100% accurate stock quantity checks on page load   | Inventory sync testing      |

### 4.4 Security

| Requirement                 | Implementation                                              | Validation            |
| --------------------------- | ----------------------------------------------------------- | --------------------- |
| Backend validation          | All quantity changes validated on backend before processing | Security testing      |
| Stock quantity enforcement  | Backend prevents cart quantity exceeding available stock    | Inventory logic tests |
| Prevent negative quantities | Minus button disabled at quantity `=` 1, backend validates  | Boundary testing      |
| API authentication          | Cart update API requires valid session/authentication       | Security audit        |
| Rate limiting               | Prevent abuse of rapid cart update API calls                | Load testing          |
| Input sanitization          | Backend sanitizes all quantity values before database write | Security testing      |
| CSRF protection             | Cart update API protected against CSRF attacks              | Security audit        |

### 4.5 Usability

| Requirement                      | Target                                                   | Measurement       |
| -------------------------------- | -------------------------------------------------------- | ----------------- |
| Quantity control discoverability | 95% users understand + / - buttons immediately           | Usability testing |
| Remove button clarity            | 90% users understand Remove button function without help | User testing      |
| Empty cart modal comprehension   | 95% users understand warning message and consequences    | User testing      |
| Total update visibility          | 90% users notice real-time total updates                 | Eye tracking      |
| Mobile usability                 | 85% task success rate on mobile devices                  | Mobile testing    |

### 4.6 Compatibility

| Requirement           | Standard                                      | Validation            |
| --------------------- | --------------------------------------------- | --------------------- |
| Browser support       | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Cross-browser testing |
| Mobile responsiveness | Full functionality on 375px+ width screens    | Responsive testing    |
| Touch device support  | Quantity controls work on touch screens       | Mobile device testing |
| Accessibility         | Buttons have proper ARIA labels               | Accessibility testing |

---

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: Customer Increases Quantity in Order Summary**

```
┌─────────────────────────────────────────────────┐
│  Customer on Checkout Page                      │
│  Order Summary displays items with qty controls │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Customer clicks Plus (+) button for item       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Quantity display updates (+1)                  │
│  Line item total recalculates                   │
│  Sub Total recalculates                         │
│  Customer Convenience Fee recalculates          │
│  Grand Total updates                            │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Customer reviews updated totals                │
│  Checkout form data preserved                   │
│  Customer can continue to payment               │
└─────────────────────────────────────────────────┘
```

**Alternative Flow: Customer Decreases Quantity to Minimum**

```
┌─────────────────────────────────────────────────┐
│  Item has quantity greater than 1               │
│  Minus (-) button is enabled                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Customer clicks Minus (-) button repeatedly    │
│  Quantity decreases by 1 each click             │
│  Totals recalculate after each decrease         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Quantity reaches 1                             │
│  Minus (-) button becomes disabled (grayed out) │
│  Button border/icon color changes to light gray │
│  Cursor changes to "not-allowed" on hover       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Customer cannot decrease below 1               │
│  To remove item: must use Remove button         │
└─────────────────────────────────────────────────┘
```

**Error Flow: Customer Removes Last Item (Empty Cart)**

```
┌─────────────────────────────────────────────────┐
│  Order Summary contains only 1 item             │
│  Customer clicks Remove button                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  System detects cartItems.length === 1          │
│  "Empty Cart Warning" modal displays            │
│  Background: Checkout Page with modal overlay   │
└─────────────────┬───────────────────────────────┘
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
┌──────────────────┐  ┌──────────────────┐
│ Customer clicks  │  │ Customer clicks  │
│ "Cancel" button  │  │ "Confirm" button │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────────────────┐
│ Modal closes     │  │ Cart cleared (cartItems = [])│
│ Item remains     │  │ Modal closes                 │
│ Customer stays   │  │ Success toast displays       │
│ on Checkout Page │  │ Redirect to Product Listing  │
└──────────────────┘  │ Toast auto-dismisses         │
                      └──────────────────────────────┘
```

### 5.2 UI Mockups & Wireframes

[Order Summary Enhancement Final Design](https://www.figma.com/design/vZggo9p6hHAdT3RPoEIRyo/Ability-to-edit-upon-items-Upon-Checkout?node-id=0-1&p=f&t=1OnBY3UPSO3TuMZx-0)<br />
[Order Summary Enhancement Wireframe](https://p1-ba-pocs.vercel.app/edit-checkout)

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Prosperna Frontend                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Checkout Page Component                     │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Checkout Form Section (Contact, Delivery, etc) │  │  │
│  │  │  • Email Address input                          │  │  │
│  │  │  • Name, Phone, Address fields                  │  │  │
│  │  │  • Shipping method selection                    │  │  │
│  │  │  • Payment method selection                     │  │  │
│  │  │  • Order Notes textarea                         │  │  │
│  │  │  [OUT OF SCOPE - No changes]                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Order Summary Component [ENHANCED]             │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  Cart Items List                         │   │  │  │
│  │  │  │  • Product image, name, variant          │   │  │  │
│  │  │  │  • Quantity controls component           │   │  │  │
│  │  │  │  • Remove button component               │   │  │  │
│  │  │  │  • Line item total display               │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  Quantity Controls Component             │   │  │  │
│  │  │  │  • Minus (-) button with disabled state  │   │  │  │
│  │  │  │  • Quantity display (non-editable)       │   │  │  │
│  │  │  │  • Plus (+) button                       │   │  │  │
│  │  │  │  • updateQuantity() handler              │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  Remove Button Component                 │   │  │  │
│  │  │  │  • Trash icon (red color)                │   │  │  │
│  │  │  │  • removeItem() handler                  │   │  │  │
│  │  │  │  • Last item detection logic             │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  Totals Calculation Component            │   │  │  │
│  │  │  │  • Sub Total calculation                 │   │  │  │
│  │  │  │  • Customer Convenience Fee calculation  │   │  │  │
│  │  │  │  • Grand Total calculation               │   │  │  │
│  │  │  │  • Real-time recalculation on updates    │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Empty Cart Warning Modal Component             │  │  │
│  │  │  • Conditional rendering (last item only)       │  │  │
│  │  │  • Warning message display                      │  │  │
│  │  │  • Cancel button (close modal)                  │  │  │
│  │  │  • Confirm button (clear cart, redirect)        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Success Toast Component                        │  │  │
│  │  │  • Displays after cart clearing                 │  │  │
│  │  │  • Auto-dismiss                                 │  │  │
│  │  │  • Message: "Successfully cleared shopping cart"│  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 State Management Layer                      │
│  • cartItems state (array of cart item objects)             │
│  • stockQuantities state (map of product ID to stock qty)   │
│  • formData state (checkout form fields)                    │
│  • showEmptyCartModal state (boolean)                       │
│  • isLoading state (boolean - loading state active)         │
│  • itemToRemove state (item ID for last item removal)       │
│  • pendingChanges state (queue of debounced changes)        │
│  • debounceTimer state (500ms timer reference)              │
│  • showSuccessToast state (boolean)                         │
│  • updateQuantityOptimistic(id, newQuantity) function       │
│  • removeItemOptimistic(id) function                        │
│  • syncWithBackend() function (after debounce)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API Integration Layer                  │
│  • POST /api/cart/update-quantity                           │
│    - Payload: {item_id, quantity, stock_validation}         │
│    - Returns: {updated_cart, totals, stock_quantities}      │
│  • POST /api/cart/remove-item                               │
│    - Payload: {item_id or [item_ids]}                       │
│    - Returns: {updated_cart, totals}                        │
│  • POST /api/cart/clear                                     │
│    - Payload: {}                                            │
│    - Returns: {success: true}                               │
│  • GET /api/cart/stock-check                                │
│    - Returns: {stock_quantities: {product_id: qty}}         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Routing / Navigation Layer                     │
│  • Redirect to Product Listing on cart empty                │
│  • Preserve Checkout Page route during modifications        │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Data Flow Diagram

**Quantity Increase Flow with Debouncing:**

```
User clicks Plus (+) button
         │
         ▼
Check: cart quantity < stock quantity?
         │
         ├── NO ─> Button disabled, no action
         │
         └── YES ─> updateQuantityOptimistic(itemId, currentQuantity + 1)
                 │
                 ▼
         Quantity display updates immediately (optimistic)
         Prices remain unchanged (waiting for backend)
                 │
                 ▼
         debounceTimer starts/resets (500ms)
                 │
                 ▼
         [User can click again, timer resets]
                 │
                 ▼
         500ms pass with no activity
                 │
                 ▼
         setIsLoading(true)
         Order Summary enters loading state:
         - Spinner displayed
         - Section grayed out
         - All controls disabled
                 │
                 ▼
         POST /api/cart/update-quantity
         Payload: {item_id, quantity: newQuantity}
                 │
                 ▼
         Backend processes:
         - Updates cart in database
         - Recalculates Sub Total
         - Recalculates Customer Convenience Fee
         - Recalculates Grand Total
         - Checks stock quantities
                 │
                 ▼
         Backend returns:
         {updated_cart, totals, stock_quantities}
                 │
                 ▼
         setIsLoading(false)
         Update state with backend data:
         - cartItems updated
         - stockQuantities updated
         - totals updated
                 │
                 ▼
         React re-renders Order Summary
         - Quantity confirmed
         - Line total updated
         - Sub Total updated
         - Customer Convenience Fee updated
         - Grand Total updated
         - Controls re-enabled
         - Plus button disabled if qty = stock
```

**Item Removal Flow (Last Item):**

```
User clicks Remove button
         │
         ▼
Check: cartItems.length === 1?
         │
         ├─> YES (last item) ─ NO DEBOUNCE
         │   │
         │   ▼
         │   setShowEmptyCartModal(true)
         │   setItemToRemove(itemId)
         │   │
         │   ▼
         │   Modal displays immediately
         │   │
         │   ├─> User clicks "Cancel"
         │   │   │
         │   │   ▼
         │   │   setShowEmptyCartModal(false)
         │   │   Item remains in cart
         │   │
         │   └─> User clicks "Confirm"
         │       │
         │       ▼
         │       setIsLoading(true)
         │       │
         │       ▼
         │       POST /api/cart/clear
         │       │
         │       ▼
         │       Backend clears cart
         │       │
         │       ▼
         │       setCartItems([])
         │       setShowEmptyCartModal(false)
         │       setIsLoading(false)
         │       setShowSuccessToast(true)
         │       │
         │       ▼
         │       Redirect to Product Listing Page
         │       │
         │       ▼
         │       Toast auto-dismisses
         │
         └─> NO (not last item) ─ WITH DEBOUNCE
             │
             ▼
             Item visually marked for removal (grayed out)
             │
             ▼
             debounceTimer starts/resets (500ms)
             │
             ▼
             [User can remove more items, batched]
             │
             ▼
             500ms pass with no activity
             │
             ▼
             setIsLoading(true)
             Order Summary enters loading state
             │
             ▼
             POST /api/cart/remove-item
             Payload: {item_ids: [id1, id2, ...]}
             │
             ▼
             Backend processes removal(s)
             Recalculates totals
             │
             ▼
             Backend returns updated cart data
             │
             ▼
             setIsLoading(false)
             Update cartItems state
             │
             ▼
             React re-renders Order Summary
             Items removed, totals updated
             Controls re-enabled
```

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type           | Coverage Target                                             | Responsibility | Tools                       |
| ------------------- | ----------------------------------------------------------- | -------------- | --------------------------- |
| Unit Tests          | Greater than 90% code coverage for quantity/removal logic   | Dev Team       | Jest, React Testing Library |
| Integration Tests   | Order Summary interactions with state management            | Dev Team       | Jest, React Testing Library |
| BDD Scenario Tests  | All Gherkin scenarios in Features F-01 through F-05         | QA Team        | Cucumber, Playwright        |
| Regression Tests    | Existing checkout flow (form submission, payment) unchanged | QA Team        | Automated test suite        |
| Visual Tests        | Quantity controls, button states, modal appearance          | QA Team        | Percy, Chromatic            |
| Performance Tests   | Real-time calculation speed, UI update responsiveness       | QA Team        | Lighthouse, WebPageTest     |
| Accessibility Tests | Keyboard navigation, screen reader support for controls     | QA Team        | axe, WAVE, NVDA             |
| UAT                 | End-to-end customer checkout with cart modifications        | Product + QA   | Manual testing              |

### 7.2 BDD Test Automation

**All Gherkin scenarios in sections 3.1 through 3.5 must be automated as executable tests.**

**Test Structure:**

```
/tests
  /features
    /editable-order-summary
      /quantity-increase.feature
      /quantity-decrease.feature
      /item-removal.feature
      /total-recalculation.feature
      /form-data-preservation.feature
  /step-definitions
    /quantity-controls-steps.js
    /removal-steps.js
    /calculation-steps.js
    /modal-steps.js
  /support
    /hooks.js
    /test-data.js
    /calculation-helpers.js
```

### 7.3 Critical Test Scenarios

**High Priority (P0 - Blocker):**

1. Plus button disabled when cart quantity equals stock quantity
2. Plus button increases quantity optimistically (immediate display update)
3. Minus button decreases quantity optimistically (immediate display update)
4. Minus button disabled at quantity `=` 1
5. Debounce timer: 500ms delay enforced after last user action
6. Rapid clicking: multiple clicks batched into single backend call
7. Loading state activates after debounce period ends
8. Loading state: spinner displayed, section grayed out, controls disabled
9. Checkout form sections remain enabled during Order Summary loading
10. Backend API returns updated cart data and recalculated totals
11. Totals update only after backend response (not during debounce)
12. Remove button triggers debounced removal for non-last items
13. Remove button on last item displays modal immediately (no debounce)
14. Confirm in modal triggers backend cart clear and redirects
15. Cancel in modal preserves item without backend call
16. Stock quantities fetched on page load and plus button disabled accordingly
17. Backend calculation accuracy: 100% correct Sub Total, Fees, Grand Total
18. Checkout form data preserved during all loading states
19. Controls re-enabled after backend processing completes

**Medium Priority (P1 - Critical):**

20. Multiple items: quantity changes affect only modified item
21. Multiple items removed within debounce window batched correctly
22. Empty cart flow: success toast displays and auto-dismisses
23. Backend processing completes within 2 seconds
24. Optimistic updates rolled back if backend returns error
25. Line item totals update accurately after backend confirmation
26. No page reload occurs during any cart modification
27. Modal backdrop displays correctly behind warning modal
28. Stock quantity updates after each backend response
29. Debounce timer resets correctly on subsequent user actions
30. Loading state removed immediately after backend response received

**Lower Priority (P2 - Important):**

31. Mobile responsiveness for quantity controls on 375px+ screens
32. Touch device compatibility for + / - buttons during loading states
33. Keyboard navigation works for all controls
34. Screen reader announces loading states and quantity changes
35. High quantity values (100+) handled without UI issues
36. Backend calculation accuracy maintained with decimal prices
37. No memory leaks during extended checkout sessions with multiple modifications
38. Product Listing Page displays correctly after cart clearing
39. Debounce timer persists across component re-renders
40. API timeout handling: display error if backend takes `>` 5 seconds

---

## 8. Risks & Mitigations

| Risk                                                | Impact | Mitigation                                                                                                                                                                    |
| --------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend API failures or timeouts**                | High   | Implement retry logic with exponential backoff; display user-friendly error messages; rollback optimistic updates on failure; timeout after 5 seconds with error notification |
| **Stock quantity data stale or out of sync**        | High   | Fetch stock quantities on page load and after each cart update; implement cache invalidation strategy; add timestamp to stock data                                            |
| **Performance degradation with many items in cart** | Medium | Optimize backend queries; implement pagination for large carts; performance testing with 100+ items                                                                           |

---

## 9. Future Enhancements

1. **Bulk Quantity Update** - Allow selecting multiple items and applying same quantity change

---

## Approval and Sign-off

| Stakeholder       | Role | Status    | Date Signed       |
| ----------------- | ---- | --------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending | ---               |
| Ruel Nopal        | HoE  | ☐ Pending | ---               |
| Rian Froille Alde | QA   | ☐ Pending | ---               |
| [Backend Lead]    | BE   | ☐ Pending | ---               |
| [Frontend Lead]   | FE   | ☐ Pending | ---               |
| Adrianne Berida   | BA   | ☐ Pending | December 08, 2025 |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for enhancing Prosperna's Order Summary section on the Checkout Page to support inline cart editing (quantity increase, decrease, item removal) with real-time total recalculation and seamless checkout form data preservation.
