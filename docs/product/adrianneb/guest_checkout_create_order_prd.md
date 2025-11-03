---
id: guest-checkout-create-order
title: Guest Checkout - Create Order PRD
sidebar_label: Guest Checkout - Create Order PRD
sidebar_position: 3
---

## Guest Checkout - Create Order Enhancement

Agile-focused PRD documenting the enhancement to Prosperna's Create Order feature, enabling merchants to create orders for both Registered and Unregistered customers without requiring email verification as a prerequisite.

---

## Document Control

| Item           | Details                                   |
| -------------- | ----------------------------------------- |
| Document Title | Guest Checkout - Create Order Enhancement |
| Version        | 0.1                                       |
| Date           | November 03, 2025                         |
| Prepared by    | Business Analyst                          |
| Reviewed by    | To be assigned                            |
| Approved by    | To be assigned                            |
| Status         | For Review                                |
| Related BRD    | To be created                             |

---

## Revision History

| Version | Date         | Author           | Change Description                                |
| ------- | ------------ | ---------------- | ------------------------------------------------- |
| 1.0     | Nov 03, 2025 | Business Analyst | Initial draft - Guest checkout flow specification |

---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements, acceptance criteria (using BDD/Gherkin), and technical specifications for enhancing Prosperna's Create Order feature to support creating orders for **both Registered and Unregistered customers**. The enhancement removes the email verification barrier that currently prevents merchants from creating orders for Unregistered leads, while maintaining all data collection requirements (name, email, phone, address).

### 1.2 Feature Vision

Enable merchants like Harbour City to seamlessly process orders for all customers in their leads database—whether Registered (email verified) or Unregistered (email not yet verified)—by allowing newly created customer records to immediately appear in the "Order For" dropdown with clear visual status badges, eliminating the current pain point of waiting for email verification before order creation.

### 1.3 Success Criteria

**User Adoption & Usage:**

- 90% of merchants create at least one order for an Unregistered customer within 30 days of feature launch
- Unregistered customer orders represent at least 40% of manually created orders in first month
- 60% reduction in support tickets related to "customer not showing in Order For dropdown"

**Technical Performance:**

- Order creation for Unregistered customers completes in less than 5 seconds (P95)
- 99.5% successful order creation rate for both Registered and Unregistered customers
- Zero data loss during order processing
- "Create New Customer" modal creates customer and populates dropdown in less than 2 seconds

**Business Impact:**

- 50% reduction in time from customer record creation to order placement
- 70% increase in manual order volume from call-in/walk-in channels
- 30% conversion rate from Unregistered to Registered customers within 30 days (via email verification)
- Merchant satisfaction score of 4.7/5 for enhanced order creation workflow

**User Satisfaction:**

- NPS +12 points for merchants using the enhanced Create Order feature
- Less than 3% support tickets related to Registered/Unregistered customer confusion
- 85% task success rate in usability testing for creating orders for new Unregistered customers

### 1.4 Related Documents

- [Analysis of Competitor POS Systems](https://app.clickup.com/7537039/docs/760cf-69038/760cf-32218)
- [Enhanced Create Order UX Prototype](https://p1-ba-pocs.vercel.app/create-order)

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

Merchants like Harbour City frequently receive orders through various channels (phone calls, walk-in customers, social media messages) and need to manually create orders on behalf of these customers. However, the current Create Order feature has a critical limitation:

**Only customers with "Registered" status (email verified) appear in the "Order For" dropdown.**

This creates the following workflow bottlenecks:

1. Merchant receives order request from customer (via phone/walk-in)
2. Merchant asks for customer details (name, email, phone, address)
3. Merchant creates customer record in "Create New Customer" modal
4. System creates lead with "Unregistered" status
5. **System sends email verification to customer**
6. **Merchant CANNOT create order yet—customer doesn't appear in dropdown**
7. **Merchant must wait for customer to verify email** (often happens hours or days later, or never)
8. Customer record changes to "Registered" status after email verification
9. Only then can merchant create the order

**Impact of Current Limitations:**

- **Lost Sales:** Customers waiting on phone/at counter cannot complete purchase if they don't immediately verify email
- **Poor Customer Experience:** Customers frustrated by delay between providing details and order confirmation
- **Merchant Inefficiency:** Average 5-7 minute wait time per order creation, with manual follow-up required
- **Workarounds Creating Data Issues:** Merchants use fake emails or ask customers to verify email while waiting, disrupting sales flow
- **Competitive Disadvantage:** 8/10 competitors allow immediate order creation without email verification requirement

**Business Context:**

- Harbour City and similar merchants report 60% of manual orders are for customers who haven't registered yet
- Average time from customer record creation to email verification: 4-6 hours (if verified at all)
- 35% of Unregistered leads never verify email, but still want to place orders
- Merchants report turning away 15-20% of walk-in customers who refuse to wait for email verification

### 2.2 Current State

**Current Create Order Flow:**

1. Merchant navigates to Create Order page (from Orders or Leads module)
2. **"Order For" dropdown ONLY shows customers with "Registered" status**
3. If merchant tries to create order for Unregistered lead:
   - Lead doesn't appear in dropdown
   - Clicking "Create New Order" from Leads module for Unregistered lead shows "Lead is not registered" modal
   - Modal offers to "Send Registration Link" but still blocks order creation
4. Merchant must wait for customer to verify email before proceeding
5. No visibility into why certain customers appear in dropdown vs others
6. No way to distinguish Registered vs Unregistered customers in the interface

**Current "Create New Customer" Modal Behavior:**

When merchant creates a new customer:

- **"Send Email Request to Create an Account" checkbox UNCHECKED:**
  - Customer record created with status "Unregistered"
  - NO email sent
  - Customer does NOT appear in "Order For" dropdown → **Cannot create order**
- **"Send Email Request to Create an Account" checkbox CHECKED:**
  - Customer record created with status "Unregistered"
  - Email verification sent
  - Customer still does NOT appear in "Order For" dropdown until email is verified
  - Must wait for customer to click link and complete registration

**Current Limitations:**

- Binary system: Registered = can order, Unregistered = cannot order
- No visual indication of registration status in any UI elements
- Merchants have no option to bypass email verification for order creation
- Call-in customers who need immediate order confirmation cannot be serviced efficiently
- Walk-in customers at physical stores experience unnecessary delays

### 2.3 Desired Future State

**Enhanced Create Order with Registered/Unregistered Support:**

1. **"Order For" Dropdown Enhancement:**

   - Dropdown displays **BOTH Registered AND Unregistered** customers/leads
   - Each option shows clear visual badge:
     - **Blue "Registered" badge** for email-verified customers
     - **Red "Unregistered" badge** for customers pending email verification
   - Badge appears inline with customer name in dropdown options
   - Merchant can select either type of customer to create an order

2. **"Create New Customer" Modal Enhancement:**

   - Merchant fills all customer details (name, email, phone, etc.) as usual
   - **"Send Email Request to Create an Account" checkbox behavior:**
     - **UNCHECKED:** Customer created as "Unregistered", NO email sent, **immediately visible in dropdown**
     - **CHECKED:** Customer created as "Unregistered", email sent, **still immediately visible in dropdown**
   - **Critical Change:** After clicking "Create" button, newly created customer **immediately appears in "Order For" dropdown** with appropriate badge, regardless of checkbox state
   - Merchant can proceed to create order without waiting for email verification

3. **Order Creation Flow:**

   - Merchant selects order type: "Delivery" or "Store Pickup"
   - **For Delivery Orders:**
     - Merchant selects customer (Registered or Unregistered) from dropdown
     - Merchant enters/selects complete shipping address (all fields required as per current implementation)
     - Merchant selects shipping method (all methods work for both customer types)
     - Merchant selects payment method (all methods work for both customer types)
     - Merchant adds products to cart
     - Order is created successfully for both Registered and Unregistered customers
   - **For Store Pickup Orders:**
     - Merchant selects customer (Registered or Unregistered) from dropdown
     - NO shipping address or shipping method required (hidden from UI)
     - Merchant selects payment method
     - Merchant adds products to cart
     - Order is created successfully

4. **Post-Order Email Verification:**

   - If customer was created with "Send Email Request" checked, verification email is sent
   - Customer can verify email at their convenience (hours or days later)
   - Upon email verification, customer status updates from "Unregistered" to "Registered"
   - All existing orders remain linked to customer record
   - Badge in future dropdown selections updates to blue "Registered"
   - No impact on already-created orders

5. **Order Record:**
   - Order shows customer name (not "Guest")
   - Order links to customer record (whether Registered or Unregistered)
   - Order history visible in customer profile
   - Merchant can view customer's registration status on order details page

**Benefits After Implementation:**

- **Immediate Order Processing:** Walk-in and call-in customers can have orders created instantly after providing details
- **No Email Verification Bottleneck:** Merchants don't need to wait for customer email verification before order creation
- **Clear Status Visibility:** Badges show registration status at a glance throughout the system
- **Improved Data Quality:** Merchants collect complete customer information (no fake emails needed)
- **Customer Convenience:** Customers can verify email later without blocking their purchase
- **Merchant Efficiency:** Estimated 80% reduction in time from customer intake to order creation
- **Conversion Opportunity:** Unregistered customers can be converted to Registered over time through email verification

### 2.4 Target Users

| User Segment                       | Description                                         | Use Case                                                                          | Frequency                         |
| ---------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| Retail Merchants (Walk-in Heavy)   | Physical store + online presence, high foot traffic | Create orders for walk-in customers who provide details but don't verify email    | Daily (10-50 orders/day)          |
| Phone Order Merchants              | Primarily phone-based orders                        | Create orders during phone calls for customers who want immediate confirmation    | Daily (5-30 orders/day)           |
| Event/Pop-up Merchants             | Temporary retail setups                             | Rapid order processing at events for customers who may not have email access      | Event-based (20-100 orders/event) |
| High-Volume Manual Order Merchants | High transaction volume                             | Streamline manual order entry for new customers without email verification delays | Daily (50+ orders/day)            |
| Social Media Order Merchants       | Orders via Facebook, Instagram, etc.                | Create orders for customers contacted through social channels                     | Daily (10-40 orders/day)          |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**

- Must maintain all existing data collection requirements (name, email, phone, complete address for delivery)
- Email field remains mandatory in customer creation (for future verification purposes)
- Complete shipping address still required for delivery orders (no minimal address support)
- Existing order processing logic and fulfillment workflows must remain unchanged
- Database schema must support registration status tracking
- Existing "Registered customer" flow must remain unchanged

**Business Constraints:**

- Cannot compromise data quality requirements for reporting and analytics
- Must maintain compliance with data privacy regulations (GDPR, Philippine Data Privacy Act)
- Must not increase support burden with unclear registration status indicators
- Must preserve ability to track customer registration conversion rates
- Email verification process remains unchanged (just timing relative to order creation changes)

**Key Assumptions:**

- Merchants will collect all required customer information (name, email, phone, address) before creating customer record
- Complete address is necessary for order fulfillment regardless of registration status
- Customers are willing to provide email address even if not verifying immediately
- Unregistered customers will eventually verify email to access customer portal features
- Registration status will be clearly visible to merchants through badge system
- Merchants understand the difference between Registered and Unregistered customers

**Regulatory Assumptions:**

- Philippine regulatory environment allows order creation before email verification
- Data retention policies apply equally to Registered and Unregistered customer orders
- Email address collection is sufficient for compliance even if not verified
- Order fulfillment can proceed with unverified email address

---

## 3. Functional Requirements & BDD Scenarios

---

### Feature F-01: Order Type Selection (Delivery vs Store Pickup)

#### 3.1.1 Feature Context

Allow merchants to choose between "Delivery" and "Store Pickup" order types at the start of order creation, which determines whether shipping address and shipping method sections are displayed. This enhances the Create Order workflow for walk-in/counter orders where shipping information is unnecessary.

#### 3.1.2 Business Rules

**BR-01: Order Type Selection**

- Merchant must select order type before proceeding with order creation
- Two mutually exclusive options: "Delivery" or "Store Pickup"
- Selection determines subsequent form fields and validation requirements
- Order type can be changed before adding products to cart
- Works identically for both Registered and Unregistered customers

**BR-02: Delivery Order Requirements**

- Requires customer selection (Registered or Unregistered) from dropdown
- Requires complete shipping address (Address Line, City, Province, Barangay, Postal Code, Map Pin)
- Requires shipping method selection
- Requires payment method selection
- All fields mandatory regardless of customer registration status

**BR-03: Store Pickup Requirements**

- Requires customer selection (Registered or Unregistered) from dropdown
- No shipping address required (section hidden from UI)
- No shipping method selection required (section hidden from UI)
- Requires payment method selection only

**BR-04: Order Type Persistence and Data Preservation**

- Selected order type persists throughout order creation session
- Changing order type preserves ALL form data (shipping address, shipping method, customer selection)
- Shipping-related data is hidden (not cleared) when switching to Store Pickup
- Shipping-related data reappears with preserved values when switching back to Delivery
- Only the active order type's data is submitted when placing order
- Order type is saved with order record for fulfillment routing
- Order type selection independent of customer registration status

#### 3.1.3 Scenarios

##### Scenario 1: Merchant selects Delivery order type

```gherkin
Given a merchant is on the "Create New Order" page
And no order type has been selected yet
And the page displays two order type tabs: "Delivery" and "Store Pickup"
When the merchant clicks on the "Delivery" tab
Then the "Delivery" tab becomes visually active (blue border, highlighted background)
And the "Store Pickup" tab becomes inactive (grey border, white background)
And the page displays "Order For" customer selection section
And the page displays "Shipping Address" section
And the page displays "Shipping Method" section
And the page displays "Payment Method" section
And the page displays "Products" section
And the system sets orderType state to "Delivery"
```

##### Scenario 2: Merchant selects Store Pickup order type

```gherkin
Given a merchant is on the "Create New Order" page
And no order type has been selected yet
When the merchant clicks on the "Store Pickup" tab
Then the "Store Pickup" tab becomes visually active (blue border, highlighted background)
And the "Delivery" tab becomes inactive (grey border, white background)
And the page displays "Order For" customer selection section
And the "Shipping Address" section is hidden (not displayed)
And the "Shipping Method" section is hidden (not displayed)
And the page displays "Payment Method" section
And the page displays "Products" section
And the system sets orderType state to "Store Pickup"
```

##### Scenario 3: Merchant switches from Delivery to Store Pickup with data preservation

```gherkin
Given a merchant is on the "Create New Order" page
And "Delivery" order type is currently selected
And merchant has selected a customer (Unregistered customer "Maria Santos")
And merchant has entered complete shipping address:
  | Address Line | 123 Main Street        |
  | City         | Cebu City              |
  | Province     | Cebu                   |
  | Barangay     | Lahug                  |
  | Postal Code  | 6000                   |
And merchant has selected shipping method "Standard Delivery"
And merchant has selected payment method "Cash on Delivery"
When the merchant clicks on the "Store Pickup" tab
Then the order type changes to "Store Pickup" immediately (no confirmation dialog)
And the "Store Pickup" tab becomes visually active (blue border, highlighted background)
And the "Delivery" tab becomes inactive (grey border, white background)
And the "Shipping Address" section is hidden from view
And the "Shipping Method" section is hidden from view
And the customer selection "Maria Santos" with red "Unregistered" badge is preserved
And the payment method selection "Cash on Delivery" is preserved
And the shipping address data is preserved in form state (not cleared, just hidden)
And the shipping method selection is preserved in form state (not cleared, just hidden)
And the "Payment Method" section remains visible
And the "Products" section remains visible
And no confirmation dialog is displayed
And no data loss occurs
```

##### Scenario 4: Merchant switches back from Store Pickup to Delivery and data reappears

```gherkin
Given a merchant had "Delivery" selected initially
And had configured:
  | Customer        | Maria Santos (Unregistered) |
  | Shipping Address| 123 Main Street, Cebu City  |
  | Shipping Method | Standard Delivery           |
  | Payment Method  | Cash on Delivery            |
And then switched to "Store Pickup" tab
And the shipping sections are now hidden
When the merchant clicks on the "Delivery" tab again
Then the order type changes back to "Delivery" immediately (no confirmation dialog)
And the "Delivery" tab becomes visually active (blue border, highlighted background)
And the "Store Pickup" tab becomes inactive (grey border, white background)
And the "Shipping Address" section becomes visible again
And the "Shipping Method" section becomes visible again
And the shipping address fields display the previously entered data:
  | Address Line | 123 Main Street |
  | City         | Cebu City       |
  | Province     | Cebu            |
  | Barangay     | Lahug           |
  | Postal Code  | 6000            |
And the shipping method "Standard Delivery" is still selected
And the customer selection "Maria Santos" with red badge is preserved
And the payment method "Cash on Delivery" is preserved
And the merchant can proceed with either Delivery or Store Pickup order
```

##### Scenario 5: Store Pickup order creation for Unregistered customer completes successfully

```gherkin
Given a merchant has "Store Pickup" order type selected
And merchant has selected Unregistered customer "Juan Cruz" from "Order For" dropdown
And the customer badge shows red "Unregistered" status
And the "Shipping Address" and "Shipping Method" sections are hidden
When the merchant selects "Cash on Pickup" as payment method
And the merchant adds "Jumbo Burger" to cart
And the merchant clicks "Proceed to Checkout"
Then the "Confirm Order" modal displays
And the modal shows Order For: "Juan Cruz" with "Unregistered" badge
And the modal shows "Order Type: Store Pickup"
And the modal shows "Pickup Location: [Merchant's Store Address]"
And the modal shows "Payment Method: Cash on Pickup"
And the modal shows order items
When the merchant clicks "Place Order"
Then the order is created successfully
And the "New order created!" modal displays
And the order is linked to Unregistered customer "Juan Cruz"
And the order can be fulfilled via store pickup workflow
```

---

### Feature F-02: Enhanced "Order For" Dropdown with Registration Status Badges

#### 3.2.1 Feature Context

Enhance the "Order For" dropdown to display both Registered and Unregistered customers with clear visual status badges (blue "Registered" or red "Unregistered"), enabling merchants to create orders for any customer in their leads database regardless of email verification status.

#### 3.2.2 Business Rules

**BR-05: Dropdown Population**

- Dropdown displays ALL customers/leads from the Leads module (both Registered and Unregistered)
- Each dropdown option shows: Customer Name, Email, Phone, Registration Status Badge
- Badge colors: Blue for "Registered", Red for "Unregistered"
- Dropdown is searchable by name, email, or phone number
- Search includes both Registered and Unregistered customers

**BR-06: Registration Status Badge Display**

- Badge appears inline next to customer name in each dropdown option
- Badge text: "Registered" or "Unregistered"
- Badge styling:
  - Registered: Blue background (#DBEAFE), blue text (#3871e0), small rounded pill
  - Unregistered: Red background (#FEE2E2), red text (#F42F1F), small rounded pill
- Badge is non-interactive (display only, not clickable)

**BR-07: Customer Selection Behavior**

- Merchant can select ANY customer (Registered or Unregistered) from dropdown
- Upon selection, customer name displays with badge in the "Order For" field
- Selected customer's details are used for order creation
- All downstream order creation steps work identically regardless of registration status

**BR-08: New Customer Creation Integration**

- "Create New Customer" button positioned next to "Order For" dropdown
- After creating new customer in modal, customer automatically populates in "Order For" field
- New customer shows with appropriate badge (Red "Unregistered" initially)
- Customer is auto-selected, no need for merchant to open dropdown and manually select
- Merchant can immediately proceed with order creation after customer creation

#### 3.2.3 Scenarios

##### Scenario 1: Dropdown displays both Registered and Unregistered customers

```gherkin
Given a merchant is on the "Create New Order" page
And the leads database contains:
  | Name          | Email                  | Phone          | Status       |
  | Clint Barton  | adrianne@prosperna.com | +639062417893  | Registered   |
  | Maria Santos  | maria@email.com        | +639171234567  | Unregistered |
  | Juan Cruz     | juan@email.com         | +639181234567  | Unregistered |
When the merchant clicks on the "Order For" dropdown
Then the dropdown opens and displays all 3 customers
And "Clint Barton" option shows blue "Registered" badge
And "Maria Santos" option shows red "Unregistered" badge
And "Juan Cruz" option shows red "Unregistered" badge
And each option displays: [Name] [Badge] [Email] | [Phone] | [Number of Orders] | [Amount Spent]
And the dropdown is scrollable if more customers exist
```

##### Scenario 2: Merchant selects Unregistered customer from dropdown

```gherkin
Given the "Order For" dropdown is open
And the dropdown shows:
  - Clint Barton (Blue "Registered")
  - Maria Santos (Red "Unregistered")
  - Juan Cruz (Red "Unregistered")
When the merchant clicks on "Maria Santos" with red "Unregistered" badge
Then the dropdown closes
And the "Order For" field displays "Maria Santos" with red "Unregistered" badge inline
And a small "×" button appears to clear the selection
And the rest of the form becomes enabled (Shipping Address, etc.)
And the system loads Maria's existing information (if any saved addresses)
And the merchant can proceed with order creation
```

##### Scenario 3: Merchant searches for Unregistered customer by phone

```gherkin
Given the "Order For" dropdown is open with 50+ customers (Registered and Unregistered mixed)
When the merchant types "9171234567" in the search field
Then the dropdown filters in real-time
And only "Maria Santos" with red "Unregistered" badge is displayed
When the merchant clears the search
Then all customers (Registered and Unregistered) are displayed again
```

##### Scenario 4: Newly created Unregistered customer auto-populates in Order For field

```gherkin
Given a merchant clicks "Create New Customer" button
And the "Create New Customer" modal opens
When the merchant fills all fields:
  | Field          | Value                    |
  | First Name     | Pedro                    |
  | Last Name      | Dela Cruz                |
  | Email          | pedro.delacruz@email.com |
  | Mobile Number  | 9051234567               |
  | Customer Type  | Individual               |
And the "Send Email Request to Create an Account" checkbox is UNCHECKED
And the merchant clicks "Create Customer" button
Then the modal closes
And a success message displays: "Successfully added lead."
And the customer "Pedro Dela Cruz" is created with status "Unregistered"
And NO email is sent to pedro.delacruz@email.com
And the "Order For" field automatically populates with "Pedro Dela Cruz" (with red "Unregistered" badge)
And the newly created customer is auto-selected (no need to open dropdown)
And the merchant can immediately proceed with filling shipping address and other order details
When the merchant opens the "Order For" dropdown (optional)
Then "Pedro Dela Cruz" is visible in the dropdown list
And shows red "Unregistered" badge
```

##### Scenario 5: Customer created with email request auto-populates and email is sent

```gherkin
Given a merchant clicks "Create New Customer" button
When the merchant fills all customer fields
And the "Send Email Request to Create an Account" checkbox is CHECKED
And the merchant clicks "Create Customer" button
Then the customer "Ana Garcia" is created with status "Unregistered"
And a verification email IS sent to ana.garcia@email.com
And a success message displays: "Successfully added lead. Verification email sent."
And the "Order For" field automatically populates with "Ana Garcia" (with red "Unregistered" badge)
And the newly created customer is auto-selected (no need to open dropdown)
And the merchant can immediately proceed to create an order RIGHT NOW
And the order creation proceeds without waiting for email verification
```

##### Scenario 6: Merchant clears selected customer and reselects different one

```gherkin
Given the "Order For" field shows "Maria Santos" with red "Unregistered" badge
And shipping address has been partially filled
When the merchant clicks the "×" clear button next to the customer name
Then the customer selection is cleared
And the "Order For" field returns to empty/placeholder state
And the shipping address fields are cleared
And the form returns to initial state
When the merchant opens the dropdown and selects "Clint Barton" (blue "Registered")
Then "Clint Barton" displays with blue "Registered" badge in the field
And Clint's saved default address auto-populates (if he has one)
And the merchant can proceed with order for the new customer
```

##### Scenario 7: Customer verifies email after order creation, badge updates in future

```gherkin
Given an order was created for Unregistered customer "Maria Santos" yesterday
When Maria receives the verification email (sent during customer creation)
And Maria clicks the verification link
And Maria completes the account registration (sets password)
Then Maria's customer record status updates from "Unregistered" to "Registered"
When the merchant creates a NEW order the next day
And opens the "Order For" dropdown
Then "Maria Santos" now shows blue "Registered" badge in the dropdown
And the merchant selects Maria for the new order
And the new order shows "Maria Santos" with blue "Registered" badge
```

---

### Feature F-03: Store Pickup Orders for Registered and Unregistered Customers

#### 3.3.1 Feature Context

Enable merchants to create store pickup orders for walk-in or counter customers (both Registered and Unregistered) without requiring shipping address or shipping method input, streamlining the order creation process for in-store transactions.

#### 3.3.2 Business Rules

**BR-09: Store Pickup Order Requirements**

- Customer selection (Registered or Unregistered) is required from "Order For" dropdown
- Shipping Address section is completely hidden when "Store Pickup" is selected
- Shipping Method section is completely hidden when "Store Pickup" is selected
- Payment Method selection is required
- At least one product must be added to cart
- All standard order validation applies (except shipping-related fields)

**BR-10: Store Pickup Customer Types**

- Both Registered and Unregistered customers can place store pickup orders
- Customer registration status has NO impact on store pickup order creation flow
- Customer provides all standard information (name, email, phone) during customer creation
- No address information required for store pickup orders

**BR-11: Pickup Location Handling**

- Merchant cannot change pickup location during order creation (uses default store)
- Pickup location displayed in order confirmation modal and order details
- Multiple store locations (if applicable) handled by merchant settings, not order creation flow

**BR-12: Payment Methods for Store Pickup**

- All payment methods available for store pickup orders
- "Cash on Pickup" is suggested as default payment method
- E-wallet/card payment methods generate payment links for customer to pay
- Payment must be completed before or at pickup
- Payment status tracked separately from pickup status

**BR-13: Order Fulfillment**

- Store pickup orders bypass shipping/delivery workflows
- Order status: "Open" → "Ready for Pickup" → "Completed"
- Merchant can mark order as "Ready for Pickup" from order details page
- Customer notified via email/SMS when order ready

#### 3.3.3 Scenarios

##### Scenario 1: Create store pickup order for Unregistered customer

```gherkin
Given a merchant is on the "Create New Order" page
When the merchant selects "Store Pickup" order type tab
Then the "Store Pickup" tab becomes active (blue highlight)
And the "Delivery" tab becomes inactive
When the merchant opens "Order For" dropdown
And selects "Juan Cruz" with red "Unregistered" badge
Then "Juan Cruz [Unregistered]" displays in the "Order For" field
And the "Shipping Address" section is NOT displayed (hidden)
And the "Shipping Method" section is NOT displayed (hidden)
And the "Payment Method" section is displayed and enabled
And the "Products" section is displayed
When the merchant selects "Cash on Pickup" as payment method
And adds "Jumbo Burger" (₱150) to cart
And clicks "Proceed to Checkout"
Then the "Confirm Order" modal opens
And displays:
  | Field           | Value                           |
  | Order For       | Juan Cruz (Unregistered badge)  |
  | Order Type      | Store Pickup                    |
  | Pickup Location | Harbour City Main Store, Cebu   |
  | Payment Method  | Cash on Pickup                  |
  | Items           | 1x Jumbo Burger - ₱150          |
  | Total           | ₱150.00                         |
When the merchant clicks "Place Order"
Then the order is created successfully
And the "New order created!" success modal displays
And shows Order ID and Customer Name "Juan Cruz"
And the order is linked to Unregistered customer "Juan Cruz"
```

##### Scenario 2: Create store pickup order for Registered customer

```gherkin
Given a merchant has "Store Pickup" order type selected
When the merchant selects "Clint Barton" with blue "Registered" badge from dropdown
Then "Clint Barton [Registered]" displays in "Order For" field
And the "Shipping Address" section is hidden
And the "Shipping Method" section is hidden
And the "Payment Method" section is enabled
When the merchant selects "E-Wallets - GCash"
And adds products to cart
And proceeds to checkout
Then the order creation completes successfully
And a payment link/QR code is generated for GCash payment
And the customer can pay via GCash before/during pickup
```

##### Scenario 3: Switch from Delivery to Store Pickup preserves all data seamlessly

```gherkin
Given a merchant has "Delivery" selected
And has selected Unregistered customer "Maria Santos"
And has filled complete shipping address
And has selected shipping method "Standard Delivery"
And has selected payment method "E-Wallet - GCash"
When the merchant switches to "Store Pickup" tab
Then the order type changes to "Store Pickup" immediately
And no confirmation dialog is displayed
And the customer selection "Maria Santos [Unregistered]" is PRESERVED
And the payment method "E-Wallet - GCash" is PRESERVED
And the shipping address data is PRESERVED (hidden but not cleared)
And the shipping method selection is PRESERVED (hidden but not cleared)
And the "Shipping Address" section is hidden
And the "Shipping Method" section is hidden
And the "Payment Method" section remains visible
When the merchant switches back to "Delivery" tab
Then the "Shipping Address" section reappears with all previously entered data
And the "Shipping Method" section reappears with "Standard Delivery" still selected
And the merchant can continue with delivery order with all original data intact
```

##### Scenario 4: Create new Unregistered customer and immediately create store pickup order

```gherkin
Given a merchant has "Store Pickup" order type selected
And clicks "Create New Customer" button
When the merchant creates customer "Rosa Martinez":
  | First Name          | Rosa                  |
  | Last Name           | Martinez              |
  | Email               | rosa.martinez@email.com |
  | Phone               | +639191234567         |
  | Send Email Request  | Unchecked             |
And clicks "Create Customer"
Then the customer "Rosa Martinez" is created with "Unregistered" status
And the modal closes
And the "Order For" field automatically populates with "Rosa Martinez" (with red "Unregistered" badge)
And the newly created customer is auto-selected
And the "Shipping Address" and "Shipping Method" sections remain hidden (Store Pickup mode)
When the merchant selects payment method "Cash on Pickup"
And adds products to cart
And completes checkout
Then the store pickup order is created for Unregistered customer "Rosa Martinez"
And Rosa does not need to verify email to have this order processed
```

##### Scenario 5: Validation prevents checkout without required fields for Store Pickup

```gherkin
Given a merchant has "Store Pickup" selected
And has NOT selected any customer yet
When the merchant tries to select a payment method
Then the payment method section is disabled
And a validation message displays: "Please select a customer first"
When the merchant selects customer "Maria Santos [Unregistered]"
Then the payment method section becomes enabled
When the merchant tries to add products without selecting payment method
Then the products section remains enabled (products can be added)
But the "Proceed to Checkout" button remains disabled
And a tooltip on hover shows: "Please select payment method"
When the merchant selects payment method
And adds at least 1 product to cart
Then the "Proceed to Checkout" button becomes enabled
```

---

### Feature F-04: Validation & Error Handling for Registered/Unregistered Orders

#### 3.4.1 Feature Context

Comprehensive validation rules and error handling to ensure data quality and provide clear guidance to merchants when creating orders for both Registered and Unregistered customers across Delivery and Store Pickup order types.

#### 3.4.2 Business Rules

**BR-14: Universal Validation Rules (All Order Types)**

- Customer selection is ALWAYS required (Registered or Unregistered)
- Registration status does NOT affect validation rules
- Payment method selection is ALWAYS required
- At least one product must be in cart
- Validation runs on field blur and before "Proceed to Checkout"

**BR-15: Delivery-Specific Validation**

- Complete shipping address required (Address Line, City, Province, Barangay, Postal Code)
- Map pin location required for address
- Shipping method selection required
- All delivery validation applies equally to Registered and Unregistered customers

**BR-16: Store Pickup Validation**

- NO shipping address validation (fields hidden)
- NO shipping method validation (fields hidden)
- Only customer, payment method, and cart validation apply

**BR-17: Customer Creation Validation**

- All fields in "Create New Customer" modal are validated
- Email format validation (standard email regex)
- Phone number format validation (Philippine: +63 + 10 digits)
- Duplicate email check (warning if email exists)
- New customer immediately available in dropdown

**BR-18: Error Display Hierarchy**

- Inline errors: Display immediately below relevant field (red text, red border)
- Modal errors: Display within modal for modal-specific validations
- Tooltip errors: Display on hover for disabled buttons explaining why

#### 3.4.3 Scenarios

##### Scenario 1: Merchant attempts to proceed without selecting customer

```gherkin
Given a merchant is on the "Create New Order" page
And "Delivery" order type is selected
And NO customer has been selected from "Order For" dropdown
And shipping method and payment method sections are visible but disabled
When the merchant tries to click on the "Shipping Method" section
Then the section remains disabled (greyed out)
When the merchant selects a customer (Registered or Unregistered) from dropdown
Then the "Shipping Method" section becomes enabled
And the "Payment Method" section becomes enabled
```

##### Scenario 2: Validation for incomplete shipping address (Delivery order)

```gherkin
Given a merchant has selected Unregistered customer "Maria Santos"
And "Delivery" order type is active
And the "Shipping Address" section is displayed
When the merchant fills only partial address:
  | Field         | Value |
  | Address Line  | 123 Main St |
  | City          | Cebu        |
  | Province      | (empty)     |
  | Barangay      | (empty)     |
  | Postal Code   | (empty)     |
And the merchant moves focus away from Province field (blur)
Then the Province field shows red border
And inline error displays below field: "Required*"
When the merchant attempts to select shipping method
Then the shipping method section is disabled
When the merchant completes all required address fields
Then all red borders clear
And inline errors disappear
And the shipping method section becomes enabled
```

##### Scenario 3: Merchant attempts checkout with empty cart

```gherkin
Given a merchant has completed all selections:
  | Field           | Value                  |
  | Order Type      | Delivery               |
  | Customer        | Juan Cruz (Unregistered) |
  | Shipping Method | Standard Delivery      |
  | Payment Method  | Cash on Delivery       |
And the cart is EMPTY (no products added)
When the merchant looks at "Proceed to Checkout" button
Then the button is visually disabled (greyed out, opacity 0.5)
And cursor shows "not-allowed" icon on hover
And a tooltip displays: "Add at least one product to proceed"
When the merchant clicks the disabled button
Then nothing happens (click is prevented)
When the merchant adds "Jumbo Burger" to cart
Then the "Proceed to Checkout" button becomes enabled (blue, full opacity)
And the cursor changes to "pointer" on hover
```

##### Scenario 4: Create New Customer modal validation

```gherkin
Given the "Create New Customer" modal is open
When the merchant enters invalid data:
  | Field         | Value        | Issue               |
  | First Name    | (empty)      | Required field      |
  | Email         | invalid-email | Invalid format      |
  | Mobile Number | 123          | Too short           |
And clicks "Create Customer" button
Then the modal does NOT close
And inline errors display below each invalid field:
  - First Name: "Required*"
  - Email: "Please enter a valid email."
  - Mobile Number: "Invalid phone format for this country."
And the "Create Customer" button remains enabled (can retry)
When the merchant corrects all fields
And clicks "Create Customer" again
Then validation passes
And the customer is created with "Unregistered" status
And the modal closes
And the new customer appears in "Order For" dropdown
```

##### Scenario 5: Store Pickup skips shipping validation entirely

```gherkin
Given a merchant has "Store Pickup" order type selected
And has selected customer "Rosa Martinez [Unregistered]"
And the "Shipping Address" and "Shipping Method" sections are HIDDEN
When the merchant selects payment method
And adds products to cart
And clicks "Proceed to Checkout"
Then NO shipping-related validation errors display
And the "Confirm Order" modal opens successfully
And the order can be placed without any shipping information
```

##### Scenario 6: Duplicate email error in Create New Customer modal

```gherkin
Given the "Create New Customer" modal is open
When the merchant enters email "maria@email.com"
And this email already exists for customer "Maria Santos" in the database
And the merchant fills all other required fields correctly
And clicks "Create Customer"
Then the system detects the duplicate email
And an error toast displays: "Email already exists. Please try again."
And the toast appears at the top of the page with red background
And the modal remains open (does NOT close)
And all input fields retain their current values
And the email field is highlighted with red border
And the merchant can correct the email and try again
When the merchant changes the email to "maria.new@email.com"
And clicks "Create Customer" again
Then validation passes
And the customer is created successfully
And the modal closes
And the new customer appears in "Order For" dropdown
```

##### Scenario 7: Registration status does NOT affect validation

```gherkin
Given a merchant is creating two orders back-to-back:
  - Order 1 for Registered customer "Clint Barton"
  - Order 2 for Unregistered customer "Maria Santos"
When the merchant creates Order 1 (Registered)
Then all validation rules apply:
  - Customer required
  - Shipping address required (if Delivery)
  - Payment method required
  - Products required
When the merchant creates Order 2 (Unregistered)
Then EXACTLY THE SAME validation rules apply:
  - Customer required
  - Shipping address required (if Delivery)
  - Payment method required
  - Products required
And NO additional or different validation based on "Unregistered" status
And both orders are created successfully with identical validation flow
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement                                | Metric                                                          | Measurement Method                  |
| ------------------------------------------ | --------------------------------------------------------------- | ----------------------------------- |
| Order creation for Unregistered customers  | P95 less than 5 seconds from submission to success modal        | APM monitoring (Backend API timing) |
| "Create New Customer" modal responsiveness | Customer created and appears in dropdown in less than 2 seconds | Frontend + Backend timing           |
| Dropdown rendering with badges             | Less than 500ms to render 100+ customers with badges            | React rendering performance         |
| Order type switching                       | Less than 300ms transition between Delivery/Store Pickup        | UI state change timing              |
| Badge display performance                  | No visible lag when opening dropdown with 500+ entries          | Frontend performance testing        |
| Page load time                             | Less than 2 seconds initial load of Create Order page           | Browser performance metrics         |

### 4.2 Scalability

| Requirement                             | Target                                                  | Validation Method             |
| --------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| Dropdown performance with large dataset | Support 10,000+ customers without lag                   | Load testing with sample data |
| Concurrent order creation               | Support 1,000+ merchants creating orders simultaneously | Load testing                  |
| Badge rendering                         | Render badges for 1,000 customers in less than 1 second | Frontend optimization testing |
| Database queries                        | Customer lookup by registration status less than 100ms  | Database query optimization   |

### 4.3 Reliability

| Requirement                 | Target                                                  | Monitoring                      |
| --------------------------- | ------------------------------------------------------- | ------------------------------- |
| Order creation success rate | Greater than 99.5% for both Registered and Unregistered | Order creation logs             |
| Badge display accuracy      | 100% accuracy in showing correct status                 | Automated UI testing            |
| Data consistency            | Zero data loss on order creation failures               | Database transaction monitoring |
| Customer status updates     | Email verification updates status within 2 min          | Status update monitoring        |

### 4.4 Security

| Requirement           | Implementation                                 | Validation            |
| --------------------- | ---------------------------------------------- | --------------------- |
| Customer data privacy | All customer data encrypted at rest            | Encryption audit      |
| Email protection      | Email addresses stored encrypted               | Security scanning     |
| Access control        | Only merchant can view their customers         | Authorization testing |
| Input sanitization    | All inputs sanitized for XSS/injection         | Security testing      |
| Badge tampering       | Registration status badge is read-only display | Frontend security     |

### 4.5 Usability

| Requirement                          | Target                                                  | Measurement       |
| ------------------------------------ | ------------------------------------------------------- | ----------------- |
| Badge distinction clarity            | 95% users correctly identify Registered vs Unregistered | Usability testing |
| Order creation time (Unregistered)   | Less than 3 minutes average for complete order          | User testing      |
| Dropdown search effectiveness        | 90% users find customer in less than 10 seconds         | User testing      |
| Store Pickup workflow understanding  | 85% users understand when to use Store Pickup           | User testing      |
| Registration status badge visibility | 100% users notice badge in dropdown options             | Eye tracking      |

### 4.6 Compatibility

| Requirement           | Standard                                      | Validation            |
| --------------------- | --------------------------------------------- | --------------------- |
| Browser support       | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Cross-browser testing |
| Mobile responsiveness | Fully functional on 375px+ width screens      | Responsive testing    |
| Badge color contrast  | WCAG AA compliance for blue and red badges    | Accessibility audit   |
| Screen reader support | Badge status announced correctly              | Accessibility testing |

---

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: Create Order for Unregistered Customer (Delivery)**

![Primary Flow - Guest Checkout on Create Order](/static/primary_flow_guestCreateOrder.png)

**Alternative Flow: Store Pickup for Unregistered Customer**

![Alternative Flow - Guest Checkout on Create Order](/static/alternative_flow_guestCreateOrder.png)

**Post-Order Flow: Customer Email Verification**

![Post-Order Flow - Guest Checkout on Create Order](/static/post_order_flow_guestCreatOrder.png)

### 5.2 UI Mockups & Wireframes

[Enhanced Create Order UX Prototype](https://p1-ba-pocs.vercel.app/create-order)

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Prosperna Frontend                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Create Order Page Component                 │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Order Type Selector (Delivery / Store Pickup)   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Order For Dropdown Component                    │ │  │
│  │  │  • Displays Registered (Blue Badge) Customers    │ │  │
│  │  │  • Displays Unregistered (Red Badge) Customers   │ │  │
│  │  │  • Searchable by name, email, phone              │ │  │
│  │  │  • Create New Customer Button                    │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Shipping Address Component                      │ │  │
│  │  │  • Visible for Delivery orders                   │ │  │
│  │  │  • Hidden for Store Pickup orders                │ │  │
│  │  │  • Complete address required                     │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Shipping Method Component                       │ │  │
│  │  │  • Visible for Delivery orders                   │ │  │
│  │  │  • Hidden for Store Pickup orders                │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Payment Method Component                        │ │  │
│  │  │  • Always visible and required                   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Products & Cart Component                       │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Order Summary Sidebar                           │ │  │
│  │  │  [Proceed to Checkout Button]                    │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Data Model (ER Diagram)

![Data Model - Guest Checkout on Create Order](/static/data_model_guestCreateOrder.png)

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type          | Coverage Target                                               | Responsibility | Tools                       |
| ------------------ | ------------------------------------------------------------- | -------------- | --------------------------- |
| Unit Tests         | Greater than 85% code coverage for badge display and dropdown | Dev Team       | Jest, React Testing Library |
| Integration Tests  | Customer creation → dropdown population flow                  | Dev Team       | Jest, Supertest             |
| BDD Scenario Tests | All Gherkin scenarios automated                               | QA Team        | Cucumber, Playwright        |
| Regression Tests   | Existing Registered customer flow unchanged                   | QA Team        | Automated test suite        |
| Visual Tests       | Badge colors and positioning                                  | QA Team        | Percy, Chromatic            |
| Accessibility      | Badge contrast and screen reader support                      | QA Team        | axe, WAVE                   |
| UAT                | Merchant end-to-end workflows                                 | Product + QA   | Manual testing              |

### 7.2 BDD Test Automation

**All Gherkin scenarios in sections 3.1-3.4 must be automated as executable tests.**

**Test Structure:**

```
/tests
  /features
    /unregistered-customer-support
      /order-type-selection.feature
      /dropdown-with-badges.feature
      /store-pickup-orders.feature
      /validation-errors.feature
  /step-definitions
    /order-type-steps.js
    /customer-dropdown-steps.js
    /validation-steps.js
  /support
    /hooks.js
    /test-data.js
    /badge-helpers.js
```

### 7.3 Critical Test Scenarios

**High Priority:**

1. Unregistered customer appears in dropdown immediately after creation
2. Blue vs Red badge displays correctly for Registered vs Unregistered
3. Store Pickup hides shipping sections correctly
4. Order creation succeeds for both Registered and Unregistered customers
5. Email verification updates status from Unregistered to Registered
6. Dropdown search includes both customer types

**Medium Priority:**

7. Order type switching preserves customer selection
8. Validation errors display correctly for both customer types
9. Complete address required for Delivery (both customer types)
10. Create New Customer modal checkbox behavior
11. Badge styling matches specifications

**Lower Priority:**

12. Badge accessibility (screen reader announcements)
13. Badge color contrast passes WCAG AA
14. Dropdown performance with 1000+ customers
15. Mobile responsiveness of badges

---

## 8. Risks & Mitigations

### Technical Risks

| Risk                               | Impact | Mitigation                             |
| ---------------------------------- | ------ | -------------------------------------- |
| Badge rendering performance issues | Medium | Lazy loading, virtualized lists        |
| Customer status sync delays        | Medium | Real-time status updates via WebSocket |
| Dropdown lag with large datasets   | Medium | Pagination, search optimization        |

### Business Risks

| Risk                                     | Impact | Mitigation                             |
| ---------------------------------------- | ------ | -------------------------------------- |
| Merchant confusion about badge colors    | High   | Clear onboarding, tooltip explanations |
| Low Unregistered → Registered conversion | Medium | Email verification reminders           |
| Data quality issues with Unregistered    | Medium | Validation enforcement, data audits    |

### User Experience Risks

| Risk                                  | Impact | Mitigation                              |
| ------------------------------------- | ------ | --------------------------------------- |
| Badge visibility on mobile            | Medium | Responsive design testing               |
| Color blindness accessibility concern | Low    | Icon + text labels in addition to color |

---

## 9. Future Enhancements

1. **Optional Customer Email Input** during checkout.
2. **Order Creation Without Customer Association** (no lead or customer record requirement).
3. **Optional Shipping Method/Address Input** for local or pickup orders.
4. **Anonymous Order Creation** for walk-in or non-digital customers.
5. **Streamlined Discount Application** for faster promo usage.
6. **Product Category Filters** for simplified product lookup.
7. **QR Menu Integration** for KOT (Kitchen Order Ticket) generation, table assignment, and management.
8. **Drag-and-Drop Quick Action Builder** for configuring the “Create Order” module layout, optimized for tablet interfaces.
9. **Full POS System Expansion** to complement existing eCommerce and in-store workflows.

---

## Approval and Sign-off

| Stakeholder       | Role | Status      | Date Signed      |
| ----------------- | ---- | ----------- | ---------------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---              |
| Ruel Nopal        | HoE  | ☐ Pending   | ---              |
| Rian Froille Alde | QA   | ☐ Pending   | ---              |
| ---               | BE   | ☐ Pending   | ---              |
| ---               | FE   | ☐ Pending   | ---              |
| Adrianne Berida   | BA   | ☐ Completed | November 3, 2025 |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for enhancing Prosperna's Create Order feature to support both Registered and Unregistered customers, removing the email verification barrier while maintaining complete data collection and order processing workflows.
