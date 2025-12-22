---
id: enhanced-create-order-page
title: Enhanced Create Order Page PRD
sidebar_label: Enhanced Create Order Page
sidebar_position: 2
---

Agile-focused PRD documenting the enhancement to Prosperna's Create Order feature, enabling merchants to create orders for walk-in Guest customers without requiring Lead records, select store locations for order fulfillment, and manage isolated carts per store location.

**Demo Recording:**
[Enhanced Create Order Page Demo](URL_TO_DEMO)

## Document Control

| Item           | Details                    |
| -------------- | -------------------------- |
| Document Title | Enhanced Create Order Page |
| Version        | 1.0                        |
| Date           | December 22, 2025          |
| Prepared by    | Business Analyst           |
| Reviewed by    | To be assigned             |
| Approved by    | To be assigned             |
| Status         | For Review                 |
| Related BRD    | To be created              |

---

## Revision History

| Version | Date         | Author           | Change Description                                              |
| ------- | ------------ | ---------------- | --------------------------------------------------------------- |
| 1.0     | Dec 22, 2025 | Business Analyst | Initial draft - Guest checkout and store location specification |

---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements, acceptance criteria (using BDD/Gherkin), and technical specifications for enhancing Prosperna's Create Order feature in the Merchant Dashboard. The enhancement introduces two major capabilities: (1) Guest Customer checkout for walk-in customers without requiring Lead records, and (2) Store Location selection for multi-location order fulfillment with isolated cart management per store.

These enhancements enable merchants operating physical stores, cafes, and restaurants to efficiently process walk-in orders while maintaining accurate inventory tracking and order routing across multiple locations.

### 1.2 Feature Vision

Enable Prosperna merchants to seamlessly process orders for any customer scenario—from known Leads to anonymous walk-ins—while maintaining full control over which store location fulfills each order. Merchants can quickly capture walk-in customer details with minimal required information (name only), optionally collect contact details for future marketing, and automatically build their customer database when complete information is provided. The store location selection with isolated carts ensures accurate inventory management and order routing for merchants with multiple physical locations.

### 1.3 Success Criteria

**User Adoption & Usage:**

- 80% of merchants with physical stores use Guest Customer checkout within 30 days of feature launch
- 60% of walk-in orders created using Guest Customer path (vs creating Lead first)
- 90% of multi-location merchants actively use store location selection for order creation
- 50% reduction in time from customer arrival to order placement for walk-in transactions

**Technical Performance:**

- Tab switching between customer paths completes in less than 200ms
- Store location change with cart isolation completes in less than 500ms
- Guest order creation completes in less than 3 seconds (P95)
- Automatic Lead creation from Guest checkout completes in less than 2 seconds
- Product list filtering by store location completes in less than 1 second

**Business Impact:**

- 40% increase in walk-in order volume for merchants with physical stores
- 30% increase in Lead database growth through automatic Lead creation from Guest checkouts
- 25% reduction in order fulfillment errors for multi-location merchants
- 35% improvement in inventory accuracy through store-specific cart isolation

**User Satisfaction:**

- NPS +15 points for merchants using Guest Customer checkout
- Less than 3% support tickets related to Guest checkout confusion
- 90% task success rate in usability testing for creating Guest orders
- 85% merchant satisfaction with store location selection workflow

### 1.4 Related Documents

- [Guest Checkout - Create Order PRD](guest_checkout_create_order_prd.md)
- [Enhanced Create Order UX Prototype](https://p1-ba-pocs.vercel.app/enhanced-create-order)

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

Prosperna merchants operating physical stores, cafes, and restaurants frequently serve walk-in customers who want to make purchases without creating accounts or providing extensive personal information. The current Create Order feature requires merchants to either:

1. Select an existing Lead (Registered or Unregistered) from the database, OR
2. Create a new Lead record before creating an order

This creates significant friction for walk-in transactions:

1. **Mandatory Lead Creation:** Merchant receives walk-in customer wanting quick purchase
2. **Data Collection Barrier:** Merchant must collect email, phone, and other details to create Lead
3. **Customer Reluctance:** Many walk-in customers refuse to provide contact information for simple purchases
4. **Workflow Delay:** Creating Lead record adds 1-2 minutes to each transaction
5. **Abandoned Sales:** Customers leave rather than provide personal details
6. **Workaround Issues:** Merchants create fake Lead records to bypass requirements, polluting database

Additionally, merchants with multiple store locations face challenges:

1. **Single Location Assumption:** Current Create Order always assumes orders are fulfilled from default store
2. **Inventory Mismatch:** Products shown may not be available at intended fulfillment location
3. **Manual Tracking:** Merchants manually track which location should fulfill each order
4. **Reporting Inaccuracy:** Order reports don't reflect true per-location performance

**Impact of Current Limitations:**

- **Lost Sales:** Estimated 20-30% of walk-in customers abandon purchase due to data collection requirements
- **Slow Service:** Average 3-4 minutes per walk-in order vs industry standard of 1-2 minutes
- **Data Quality Issues:** Fake Lead records created as workarounds corrupt customer database
- **Inventory Errors:** Orders fulfilled from wrong location cause stock discrepancies
- **Operational Inefficiency:** Staff spend time on data entry instead of customer service

**Business Context:**

- Harbour City and similar F&B merchants report 70% of orders are walk-in customers
- Average walk-in customer provides name only, refuses email/phone collection
- Multi-location merchants report 15% order routing errors due to lack of location selection
- Competitor POS systems allow anonymous/guest orders with minimal required fields

### 2.2 Current State

**Current Create Order Customer Selection:**

1. **Order For Dropdown:**

   - Only displays Leads from the Leads module
   - Requires Lead record to exist before order creation
   - Shows Registered (blue badge) and Unregistered (red badge) Leads
   - "Create Customer" button opens modal to create new Lead

2. **Lead Creation Requirements:**

   - First Name, Last Name required
   - Email required (for account creation)
   - Mobile Number required
   - Full Lead record created before order can proceed

3. **No Guest/Anonymous Option:**
   - Cannot create order without Lead record
   - No way to process walk-in customer who refuses to provide contact details
   - Merchants forced to create placeholder Lead records

**Current Store Location Handling:**

1. **Single Default Location:**

   - All orders assume fulfillment from merchant's default (first) store location
   - No dropdown or selection for store location
   - Products displayed regardless of location assignment

2. **No Cart Isolation:**

   - Single cart for all products
   - No separation of inventory by location
   - Cannot prepare orders for different locations simultaneously

3. **Manual Location Tracking:**
   - Merchants manually note fulfillment location in order notes
   - No system-level tracking of order-to-location association
   - Reports don't segment by store location

### 2.3 Desired Future State

**Enhanced Customer Selection with Guest Path:**

1. **Tab-Based Customer Path Selection:**

   - Two tabs: "Existing/New Customer" and "Guest Customer"
   - "Existing/New Customer" tab: Current Lead selection behavior (dropdown + Create Customer)
   - "Guest Customer" tab: Inline form for walk-in customers
   - Switching tabs clears data from the other path (no retention)

2. **Guest Customer Form:**

   - Required fields: First Name, Last Name
   - Optional fields: Email, Mobile Number
   - No Lead record created upfront
   - Minimal friction for quick walk-in transactions

3. **Automatic Lead Creation (Conditional):**

   - If Guest provides ALL four fields (First Name, Last Name, Email, Mobile Number): Lead created automatically on successful checkout
   - If ANY contact field missing: No Lead created, order remains anonymous
   - Newly created Lead has "Unregistered" status
   - Order links to Lead when created

4. **Order Record Handling:**
   - All Guest orders create order records (regardless of Lead creation)
   - Order displays Guest name (First Name + Last Name)
   - Missing contact fields display "N/A" on order record
   - Order history not accessible from Lead page if no Lead created

**Enhanced Store Location Selection:**

1. **Store Location Dropdown:**

   - Displayed in "Select Products" section
   - Populated with all merchant's configured store locations
   - Default store location pre-selected on page load
   - Changeable at any time during order creation

2. **Product Filtering by Location:**

   - Product list filters to show only products assigned to selected location
   - Stock quantities reflect inventory for selected location
   - Products not assigned to location are hidden

3. **Cart Isolation per Store Location:**

   - Each store location maintains separate cart
   - Switching location displays that location's cart
   - Other location carts preserved when switching
   - Checkout processes only current location's cart

4. **Order Fulfillment Routing:**
   - Order associated with selected store location
   - Store location recorded on order record
   - Store location displayed in Confirm Order modal (read-only)
   - For Store Pickup: selected location = pickup point

**Benefits After Implementation:**

- **Faster Walk-in Service:** Reduce order creation time from 3-4 minutes to under 1 minute
- **Increased Conversion:** Capture sales from customers who refuse to provide contact details
- **Clean Data:** No more fake Lead records polluting customer database
- **Optional Lead Building:** Automatically build Lead database when customers willingly provide info
- **Accurate Inventory:** Products and stock levels accurate per store location
- **Proper Order Routing:** Orders correctly associated with fulfillment location
- **Isolated Cart Management:** Prepare multiple orders for different locations without conflicts
- **Better Reporting:** Order analytics segmented by store location

### 2.4 Target Users

| User Segment              | Description                           | Use Case                                           | Frequency                  |
| ------------------------- | ------------------------------------- | -------------------------------------------------- | -------------------------- |
| Cafe/Restaurant Merchants | F&B businesses with counter service   | Quick walk-in orders with minimal data collection  | 50-200 orders/day          |
| Retail Store Merchants    | Physical retail with walk-in traffic  | Process walk-in purchases without account creation | 20-100 orders/day          |
| Multi-Location Merchants  | Businesses with 2+ physical locations | Route orders to correct fulfillment location       | Daily across locations     |
| Pop-up/Event Merchants    | Temporary retail setups               | Rapid anonymous order processing                   | Event-based (50-500/event) |
| Quick Service Restaurants | Fast food and quick service           | High-volume walk-in with speed priority            | 100-500 orders/day         |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**

- Must maintain backward compatibility with existing Lead-based order creation
- Guest Customer form must validate in real-time (on blur)
- Cart isolation must persist during session (no data loss on location switch)
- Store location filtering must not degrade product list performance
- Automatic Lead creation must not block order completion (async if needed)
- Must work with existing order processing and fulfillment workflows

**Business Constraints:**

- Cannot remove existing Lead selection functionality
- Must maintain all existing validation rules for Delivery orders (address, shipping method)
- Payment method restrictions remain unchanged (Credit Cards, E-Wallets, COD/COP only)
- Standard Delivery shipping method still requires mobile number
- E-Wallets payment method still requires mobile number
- Order records must be created regardless of Lead creation status

**Key Assumptions:**

- Merchants understand the difference between Lead customers and Guest customers
- Walk-in customers are willing to provide at least their name for order tracking
- Merchants have already configured store locations in Settings > Store Settings > Location Settings
- Products are already assigned to appropriate store locations with inventory set
- Merchants will use Guest Customer path for true walk-ins, not as workaround for data entry
- Tab switching behavior (clearing data) is acceptable UX tradeoff for clean state management

**Data & Privacy Assumptions:**

- Guest orders with only name are compliant with data privacy regulations
- "N/A" display for missing contact fields is acceptable for order records
- Automatic Lead creation with Unregistered status follows existing Lead creation patterns
- Order records without linked Leads are acceptable for reporting purposes

---

## 3. Functional Requirements & BDD Scenarios

## Feature F-01: Customer Path Selection (Tab-Based)

### 3.1.1 Feature Context

Allow merchants to choose between selecting an existing Lead (Registered/Unregistered) from the database or creating a Guest order for walk-in customers via tab selection. This provides flexibility for merchants to handle both known customers and anonymous walk-in transactions.

### 3.1.2 Business Rules

**BR-01: Tab Selection Options**

- Two mutually exclusive tabs: "Existing/New Customer" and "Guest Customer"
- "Existing/New Customer" tab is selected by default on page load
- Only one tab can be active at a time
- Tab selection determines which customer input method is displayed

**BR-02: Existing/New Customer Tab Behavior**

- Displays "Order For" dropdown populated with all Leads (Registered and Unregistered)
- Displays "Create Customer" button to add new Lead via modal
- Dropdown is searchable by name, email, or phone number
- Selected Lead displays with appropriate status badge (Registered: blue, Unregistered: red)

**BR-03: Guest Customer Tab Behavior**

- Displays inline Guest Customer form with fields: First Name*, Last Name*, Email (optional), Mobile Number (optional)
- No Lead record is referenced or created at this stage
- Form is always editable while Guest Customer tab is active

**BR-04: Tab Switching Data Clearing**

- Switching from "Existing/New Customer" to "Guest Customer" clears any selected Lead
- Switching from "Guest Customer" to "Existing/New Customer" clears all Guest form fields
- Data is not retained when switching back to a previously visited tab
- This prevents data conflicts and ensures clean state for each customer path

### 3.1.3 Scenarios

##### Scenario 1: Merchant selects Existing/New Customer tab and Lead dropdown displays

```gherkin
Given a merchant is on the Create Order page
And the "Existing/New Customer" tab is selected by default
When the merchant views the "Order For" section
Then the "Order For" dropdown is displayed
And the dropdown contains all Leads from the Leads module
And each Lead option displays: Name, Email, Phone, and Status Badge
And Registered Leads display a green "Registered" badge
And Unregistered Leads display a red "Unregistered" badge
And the "Create Customer" button is displayed next to the dropdown
```

##### Scenario 2: Merchant selects Guest Customer tab and Guest form displays

```gherkin
Given a merchant is on the Create Order page
And the "Existing/New Customer" tab is currently selected
When the merchant clicks on the "Guest Customer" tab
Then the "Guest Customer" tab becomes active
And the "Existing/New Customer" tab becomes inactive
And the "Order For" dropdown is hidden
And the "Create Customer" button is hidden
And the Guest Customer form is displayed with the following fields:
  | Field Name    | Required | Field Type   |
  | First Name    | Yes      | Text Input   |
  | Last Name     | Yes      | Text Input   |
  | Email         | No       | Email Input  |
  | Mobile Number | No       | Phone Input  |
And all form fields are empty and editable
```

##### Scenario 3: Switching between tabs clears previously entered data on the other tab

```gherkin
Given a merchant is on the Create Order page
And the merchant has selected Lead "Maria Santos" from the "Order For" dropdown
When the merchant clicks on the "Guest Customer" tab
Then the Guest Customer form displays with all fields empty
When the merchant enters the following Guest details:
  | Field Name    | Value          |
  | First Name    | Juan           |
  | Last Name     | Dela Cruz      |
  | Email         | juan@email.com |
  | Mobile Number | 9171234567     |
And the merchant clicks on the "Existing/New Customer" tab
Then the "Order For" dropdown displays with no Lead selected
And the placeholder text "Search Customer by Name, Email or Phone" is shown
When the merchant clicks on the "Guest Customer" tab again
Then the Guest Customer form displays with all fields empty
And previously entered Guest details are not retained
```

---

## Feature F-02: Guest Customer Form and Validation

### 3.2.1 Feature Context

Enable merchants to capture walk-in customer details through a streamlined form with required name fields and optional contact information. The form validates input to ensure data quality while allowing flexibility for customers who prefer not to share contact details.

### 3.2.2 Business Rules

**BR-05: Required Guest Fields**

- First Name is required (cannot be empty or whitespace only)
- Last Name is required (cannot be empty or whitespace only)
- Both fields must be completed before proceeding to checkout

**BR-06: Optional Guest Fields**

- Email is optional but must be valid format if provided
- Mobile Number is optional but must be valid Philippine format (+63 + 10 digits) if provided
- Optional fields can be left empty without validation errors

**BR-07: Guest Form Validation Timing**

- Required field validation occurs on blur (when field loses focus)
- Required field validation occurs on checkout attempt
- Format validation for Email and Mobile Number occurs on blur
- Validation errors display inline below the respective field

**BR-08: Guest Form Error Display**

- Required field error message: "Required\*"
- Invalid email error message: "Please enter a valid email address"
- Invalid mobile number error message: "Please enter a valid mobile number"
- Error fields display with red border
- Errors clear when field is corrected

### 3.2.3 Scenarios

##### Scenario 1: Guest Customer form requires First Name and Last Name

```gherkin
Given a merchant is on the Create Order page
And the "Guest Customer" tab is selected
And the Guest Customer form is displayed
When the merchant fills in the following details:
  | Field Name | Value     |
  | First Name | Pedro     |
  | Last Name  | Garcia    |
And the merchant leaves Email and Mobile Number fields empty
Then no validation errors are displayed
And the merchant can proceed with order creation
And the Guest is identified as "Pedro Garcia" throughout the order flow
```

##### Scenario 2: Guest Customer form accepts optional Email and Mobile Number

```gherkin
Given a merchant is on the Create Order page
And the "Guest Customer" tab is selected
When the merchant fills in the following details:
  | Field Name    | Value              |
  | First Name    | Ana                |
  | Last Name     | Reyes              |
  | Email         | ana.reyes@email.com |
  | Mobile Number | 9181234567         |
Then no validation errors are displayed
And the Email field displays "ana.reyes@email.com"
And the Mobile Number field displays "+63 9181234567"
And the merchant can proceed with order creation
```

##### Scenario 3: Validation error displays for missing required Guest fields

```gherkin
Given a merchant is on the Create Order page
And the "Guest Customer" tab is selected
And the Guest Customer form is displayed with all fields empty
When the merchant clicks on the First Name field
And the merchant clicks outside the First Name field without entering a value (blur event)
Then a validation error "Required*" displays below the First Name field
And the First Name field border turns red
When the merchant clicks on the Last Name field
And the merchant clicks outside the Last Name field without entering a value (blur event)
Then a validation error "Required*" displays below the Last Name field
And the Last Name field border turns red
When the merchant attempts to proceed to checkout
Then the checkout is blocked
And a validation toast displays: "Please complete all required fields"
And the validation errors remain visible on First Name and Last Name fields
```

##### Scenario 4: Validation error displays for invalid Email or Mobile Number format

```gherkin
Given a merchant is on the Create Order page
And the "Guest Customer" tab is selected
When the merchant fills in the following details:
  | Field Name    | Value           |
  | First Name    | Carlos          |
  | Last Name     | Mendoza         |
  | Email         | invalid-email   |
  | Mobile Number | 123             |
And the merchant clicks outside the Email field (blur event)
Then a validation error "Please enter a valid email address" displays below the Email field
And the Email field border turns red
When the merchant clicks outside the Mobile Number field (blur event)
Then a validation error "Please enter a valid mobile number" displays below the Mobile Number field
And the Mobile Number field border turns red
When the merchant corrects the Email to "carlos@email.com"
Then the Email validation error disappears
And the Email field border returns to normal
When the merchant corrects the Mobile Number to "9171234567"
Then the Mobile Number validation error disappears
And the Mobile Number field border returns to normal
And the merchant can proceed with order creation
```

---

## Feature F-03: Store Location Selection and Cart Isolation

### 3.3.1 Feature Context

Allow merchants to select which store location fulfills the order, with each store location maintaining its own dedicated cart. This enables accurate inventory management, order routing, and supports merchants with multiple physical locations.

### 3.3.2 Business Rules

**BR-09: Store Location Dropdown**

- Store Location dropdown is displayed in the "Select Products" section
- Dropdown is populated with all store locations configured by the merchant
- Default store location (first/main store) is pre-selected on page load
- Merchant can change store location at any time during order creation

**BR-10: Product Filtering by Store Location**

- Products list displays only products assigned to the selected store location
- Product stock quantities reflect inventory for the selected store location
- Products not assigned to the selected store location are not displayed
- Changing store location refreshes the product list accordingly

**BR-11: Cart Isolation per Store Location**

- Each store location maintains its own separate cart
- Adding products to cart associates items with the currently selected store location
- Switching store location displays the cart for the newly selected location
- Previously added items in other store location carts are preserved but not visible
- Cart state persists when switching between store locations

**BR-12: Checkout Store Location Context**

- Checkout processes only items from the currently selected store location's cart
- Order is associated with and fulfilled from the selected store location
- Store location is recorded on the order record for fulfillment routing
- Other store location carts remain intact after successful checkout

### 3.3.3 Scenarios

##### Scenario 1: Default store location is pre-selected on page load

```gherkin
Given a merchant has configured the following store locations:
  | Store Name       | Is Default |
  | Main Branch      | Yes        |
  | Mall Branch      | No         |
  | Downtown Branch  | No         |
And the merchant navigates to the Create Order page
When the page finishes loading
Then the Store Location dropdown in the "Select Products" section displays "Main Branch"
And the product list displays products assigned to "Main Branch"
And the cart is empty for "Main Branch"
```

##### Scenario 2: Merchant changes store location and product list filters accordingly

```gherkin
Given a merchant is on the Create Order page
And "Main Branch" is currently selected in the Store Location dropdown
And the product list displays the following products for "Main Branch":
  | Product Name | Stock |
  | Product A    | 50    |
  | Product B    | 30    |
  | Product C    | 20    |
When the merchant clicks on the Store Location dropdown
And selects "Mall Branch"
Then the Store Location dropdown displays "Mall Branch"
And the product list refreshes
And the product list displays only products assigned to "Mall Branch":
  | Product Name | Stock |
  | Product A    | 25    |
  | Product D    | 40    |
And "Product B" and "Product C" are not displayed (not assigned to Mall Branch)
And the stock quantities reflect "Mall Branch" inventory
```

##### Scenario 3: Each store location maintains its own separate cart

```gherkin
Given a merchant is on the Create Order page
And "Main Branch" is selected in the Store Location dropdown
And the cart for "Main Branch" is empty
When the merchant adds "Product A" (quantity: 2) to cart
And the merchant adds "Product B" (quantity: 1) to cart
Then the Order Summary displays:
  | Product   | Quantity |
  | Product A | 2        |
  | Product B | 1        |
And the cart total reflects 3 items
When the merchant changes the Store Location to "Mall Branch"
Then the Order Summary displays an empty cart
And the empty cart message "Your cart is empty!" is displayed
And the items added for "Main Branch" are not visible
```

##### Scenario 4: Switching store location displays that location's cart (preserving other carts)

```gherkin
Given a merchant is on the Create Order page
And the merchant has added items to multiple store location carts:
  | Store Location | Products in Cart       |
  | Main Branch    | Product A (2), Product B (1) |
  | Mall Branch    | Product D (3)          |
And "Mall Branch" is currently selected
And the Order Summary displays "Product D" (quantity: 3)
When the merchant changes the Store Location to "Main Branch"
Then the Order Summary displays:
  | Product   | Quantity |
  | Product A | 2        |
  | Product B | 1        |
And "Product D" is not displayed in the cart
When the merchant changes the Store Location back to "Mall Branch"
Then the Order Summary displays:
  | Product   | Quantity |
  | Product D | 3        |
And the cart for "Mall Branch" was preserved during the switch
```

##### Scenario 5: Checkout only processes items from currently selected store location's cart

```gherkin
Given a merchant is on the Create Order page
And the merchant has items in multiple store location carts:
  | Store Location | Products in Cart       | Cart Total |
  | Main Branch    | Product A (2)          | ₱200.00    |
  | Mall Branch    | Product D (3)          | ₱450.00    |
And "Mall Branch" is currently selected
And the Order Summary displays "Product D" (quantity: 3) with total ₱450.00
When the merchant completes customer selection and payment method
And the merchant clicks "Proceed to Checkout"
Then the Confirm Order modal displays:
  | Field          | Value       |
  | Store Location | Mall Branch |
  | Items          | Product D (3) |
  | Total          | ₱450.00     |
And items from "Main Branch" cart are NOT included in the order
When the merchant clicks "Place Order"
Then the order is created successfully for "Mall Branch" only
And the "Mall Branch" cart is cleared
When the merchant changes the Store Location to "Main Branch"
Then the Order Summary displays "Product A" (quantity: 2)
And the "Main Branch" cart was preserved and not affected by the checkout
```

---

## Feature F-04: Guest Customer Order Creation

### 3.4.1 Feature Context

Enable merchants to create orders for walk-in Guest customers with appropriate requirements based on order type. Store Pickup orders require only customer name, while Delivery orders require complete shipping address information.

### 3.4.2 Business Rules

**BR-13: Guest with Store Pickup Requirements**

- Only First Name and Last Name are required
- Email and Mobile Number are optional
- Shipping Address section is hidden (not required)
- Shipping Method section is hidden (not required)
- Selected Store Location serves as the pickup point

**BR-14: Guest with Delivery Requirements**

- First Name and Last Name are required
- Email and Mobile Number are optional
- Complete Shipping Address is required (Address Line, Province, City, Barangay, Postal Code)
- Shipping Method selection is required
- Landmark field is optional

**BR-15: Guest Order Display in Confirm Modal**

- Confirm Order modal displays Guest name (First Name + Last Name)
- Confirm Order modal displays Store Location as read-only field
- For Store Pickup: displays pickup location (same as Store Location)
- For Delivery: displays complete shipping address
- Payment Method and order items are displayed as normal

### 3.4.3 Scenarios

##### Scenario 1: Guest with Store Pickup requires only First Name and Last Name (no address)

```gherkin
Given a merchant is on the Create Order page
And the merchant selects "Store Pickup" as the order type
And the merchant selects the "Guest Customer" tab
When the merchant fills in the Guest Customer form:
  | Field Name | Value   |
  | First Name | Roberto |
  | Last Name  | Cruz    |
And the merchant leaves Email and Mobile Number fields empty
Then no validation errors are displayed
And the "Shipping Address" section is not visible
And the "Shipping Method" section is not visible
When the merchant selects "Main Branch" as the Store Location
And the merchant adds "Product A" to cart
And the merchant selects "Cash on Pickup" as the payment method
And the merchant clicks "Proceed to Checkout"
Then the Confirm Order modal displays successfully
And the modal shows "Order For: Roberto Cruz"
And the modal shows "Order Type: Store Pickup"
And the modal shows "Store Location: Main Branch"
And the modal shows "Pickup Location: Main Branch"
And no shipping address is displayed
```

##### Scenario 2: Guest with Delivery requires First Name, Last Name, and complete shipping address

```gherkin
Given a merchant is on the Create Order page
And the merchant selects "Delivery" as the order type
And the merchant selects the "Guest Customer" tab
When the merchant fills in the Guest Customer form:
  | Field Name | Value    |
  | First Name | Isabella |
  | Last Name  | Santos   |
And the merchant leaves Email and Mobile Number fields empty
Then the "Shipping Address" section is visible below the Guest Customer form
When the merchant attempts to proceed to checkout without filling the shipping address
Then the checkout is blocked
And validation errors display on required shipping address fields
When the merchant fills in the complete shipping address:
  | Field       | Value              |
  | Address Line| 456 Rizal Avenue   |
  | Province    | Cebu               |
  | City        | Cebu City          |
  | Barangay    | Lahug              |
  | Postal Code | 6000               |
And the merchant selects "Manual Shipping by Merchant" as the shipping method
And the merchant adds "Product B" to cart
And the merchant selects "Cash on Delivery" as the payment method
And the merchant clicks "Proceed to Checkout"
Then the Confirm Order modal displays successfully
And the modal shows "Order For: Isabella Santos"
And the modal shows "Order Type: Delivery"
And the modal shows the complete shipping address
And the modal shows "Shipping Method: Manual Shipping by Merchant"
```

##### Scenario 3: Confirm Order modal displays Guest details and Store Location

```gherkin
Given a merchant is on the Create Order page
And the merchant has completed a Guest Customer order with:
  | Field          | Value                           |
  | Order Type     | Store Pickup                    |
  | First Name     | Miguel                          |
  | Last Name      | Reyes                           |
  | Email          | miguel.reyes@email.com          |
  | Mobile Number  | 9181234567                      |
  | Store Location | Downtown Branch                 |
  | Payment Method | Cash on Pickup                  |
  | Cart Items     | Product C (2), Product D (1)    |
When the merchant clicks "Proceed to Checkout"
Then the Confirm Order modal displays with the following information:
  | Section         | Details                                    |
  | Order For       | Miguel Reyes                               |
  | Contact         | miguel.reyes@email.com, +63 9181234567     |
  | Order Type      | Store Pickup                               |
  | Store Location  | Downtown Branch (read-only)                |
  | Pickup Location | Downtown Branch                            |
  | Payment Method  | Cash on Pickup                             |
  | Order Items     | Product C (×2), Product D (×1)             |
  | Order Total     | [calculated total]                         |
And the Store Location field is displayed as read-only (not editable)
And the "Place Order" button is enabled
And the "Back" button is available to return to the order form
```

---

## Feature F-05: Automatic Lead Creation for Guest Customers

### 3.5.1 Feature Context

Automatically create a Lead record when a Guest customer provides complete contact information (First Name, Last Name, Email, AND Mobile Number) upon successful checkout. This enables merchants to build their customer database from walk-in transactions while respecting customer privacy when contact details are not provided.

### 3.5.2 Business Rules

**BR-16: Lead Creation Trigger Conditions**

- Lead is created automatically ONLY when ALL four fields are provided:
  - First Name (required for checkout)
  - Last Name (required for checkout)
  - Email (must be provided)
  - Mobile Number (must be provided)
- Lead creation occurs after successful order placement
- If ANY of the four fields is missing, no Lead is created

**BR-17: Lead Creation Exclusions**

- Guest with First Name + Last Name only → No Lead created
- Guest with First Name + Last Name + Email only → No Lead created
- Guest with First Name + Last Name + Mobile Number only → No Lead created
- Partial contact information does not trigger Lead creation

**BR-18: Newly Created Lead Properties**

- Lead status is set to "Unregistered" (email not yet verified)
- Lead record contains: First Name, Last Name, Email, Mobile Number
- Lead appears in the Leads module immediately after creation
- Order is linked to the newly created Lead record

**BR-19: Order Record for Guest Without Lead**

- Order record is created regardless of Lead creation
- Order displays Guest name (First Name + Last Name)
- Missing Email field displays "N/A" on order record
- Missing Mobile Number field displays "N/A" on order record
- Order is not linked to any Lead record

### 3.5.3 Scenarios

##### Scenario 1: Successful checkout with complete Guest info (Name + Email + Mobile) creates Lead automatically

```gherkin
Given a merchant is on the Create Order page
And the merchant selects the "Guest Customer" tab
And the merchant fills in complete Guest information:
  | Field Name    | Value                  |
  | First Name    | Carmen                 |
  | Last Name     | Dela Rosa              |
  | Email         | carmen.delarosa@email.com |
  | Mobile Number | 9171234567             |
And the merchant completes order setup with Store Pickup
And the merchant adds products to cart and selects payment method
When the merchant clicks "Proceed to Checkout"
And the Confirm Order modal displays
And the merchant clicks "Place Order"
Then the order is created successfully
And the "Order Created" success modal displays
And a new Lead record is automatically created with:
  | Field         | Value                       |
  | First Name    | Carmen                      |
  | Last Name     | Dela Rosa                   |
  | Email         | carmen.delarosa@email.com   |
  | Mobile Number | +63 9171234567              |
  | Status        | Unregistered                |
And the order record is linked to the newly created Lead
When the merchant navigates to the Leads module
Then "Carmen Dela Rosa" appears in the Leads list
And the Lead displays a red "Unregistered" badge
```

##### Scenario 2: Successful checkout with incomplete Guest contact info does not create Lead

```gherkin
Given a merchant is on the Create Order page
And the merchant selects the "Guest Customer" tab
When the merchant fills in Guest information with Email only:
  | Field Name    | Value              |
  | First Name    | Antonio            |
  | Last Name     | Villanueva         |
  | Email         | antonio@email.com  |
  | Mobile Number | (empty)            |
And the merchant completes order setup and places the order
Then the order is created successfully
And NO Lead record is created for "Antonio Villanueva"
When the merchant navigates to the Leads module
Then "Antonio Villanueva" does NOT appear in the Leads list

When the merchant creates another order for a Guest with Mobile only:
  | Field Name    | Value        |
  | First Name    | Beatriz      |
  | Last Name     | Gonzales     |
  | Email         | (empty)      |
  | Mobile Number | 9181234567   |
And the merchant completes order setup and places the order
Then the order is created successfully
And NO Lead record is created for "Beatriz Gonzales"
When the merchant navigates to the Leads module
Then "Beatriz Gonzales" does NOT appear in the Leads list
```

##### Scenario 3: Order record displays "N/A" for missing contact fields when no Lead created

```gherkin
Given a merchant is on the Create Order page
And the merchant creates a Guest order with only required fields:
  | Field Name    | Value      |
  | First Name    | Eduardo    |
  | Last Name     | Ramos      |
  | Email         | (empty)    |
  | Mobile Number | (empty)    |
And the merchant completes order setup and places the order
Then the order is created successfully
When the merchant navigates to the Orders module
And opens the order details for the newly created order
Then the order record displays:
  | Field          | Value        |
  | Customer Name  | Eduardo Ramos |
  | Email          | N/A          |
  | Mobile Number  | N/A          |
And the order is NOT linked to any Lead record
```

##### Scenario 4: Newly created Lead from Guest checkout appears in Leads module with Unregistered status

```gherkin
Given a merchant has just completed an order for Guest customer:
  | Field Name    | Value                |
  | First Name    | Lucia                |
  | Last Name     | Fernandez            |
  | Email         | lucia.f@email.com    |
  | Mobile Number | 9191234567           |
And the order was placed successfully
And the system automatically created a Lead record
When the merchant navigates to the Leads module
Then "Lucia Fernandez" appears in the Leads list
And the Lead row displays:
  | Column        | Value              |
  | Name          | Lucia Fernandez    |
  | Email         | lucia.f@email.com  |
  | Phone         | +63 9191234567     |
  | Status        | Unregistered (red) |
  | Total Orders  | 1                  |
When the merchant clicks on "Lucia Fernandez" to view Lead details
Then the Single Lead Page displays the Lead information
And the Order History section shows the order created from Guest checkout
And the Lead status badge displays "Unregistered" in red
```

---

## Feature F-06: Checkout Validation and Order Completion

### 3.6.1 Feature Context

Validate all required fields and order components before allowing checkout, then process the order and provide appropriate feedback upon successful completion. Validation rules differ based on order type (Delivery vs Store Pickup) and customer path (Lead vs Guest).

### 3.6.2 Business Rules

**BR-20: Universal Checkout Requirements**

- Customer must be identified (Lead selected OR Guest with First Name + Last Name)
- Payment method must be selected
- At least one product must be in the cart for the current store location
- Store location must be selected (defaults to main store)

**BR-21: Delivery-Specific Checkout Requirements**

- Complete shipping address is required (Address Line, Province, City, Barangay, Postal Code)
- Shipping method must be selected
- All universal requirements also apply

**BR-22: Store Pickup Checkout Requirements**

- No shipping address required
- No shipping method required
- Only universal requirements apply
- Store location serves as pickup point

**BR-23: Checkout Button State**

- "Proceed to Checkout" button is disabled until all requirements are met
- Button displays tooltip on hover when disabled, indicating missing requirements
- Button becomes enabled when all validation passes

**BR-24: Successful Order Completion**

- "Order Created" success modal displays with order ID and customer name
- Cart for the current store location is cleared
- Carts for other store locations remain intact
- Order record is created and visible in Orders module
- If Guest with complete contact info, Lead is created (per F-05 rules)

**BR-25: Standard Delivery Requires Mobile Number for Guest**

- Standard Delivery shipping method requires mobile number
- If Guest Customer form has no mobile number and merchant selects Standard Delivery:
  - Error toast displays: "Please add a mobile number for this shipping method."
  - Standard Delivery option is not selected
  - Shipping Method field remains empty
- Once mobile number is provided, Standard Delivery can be selected successfully

**BR-26: E-Wallets Payment Method Requires Mobile Number for Guest**

- E-Wallets payment method requires mobile number
- If Guest Customer form has no mobile number and merchant selects E-Wallets:
  - Error toast displays: "Please add a mobile number for this payment method."
  - E-Wallets option is not selected
  - Payment Method field remains empty
- Once mobile number is provided, E-Wallets can be selected successfully

### 3.6.3 Scenarios

##### Scenario 1: Checkout requires customer (Lead or Guest with name), payment method, and at least one cart item

```gherkin
Given a merchant is on the Create Order page
And "Store Pickup" order type is selected
And no customer has been selected or entered
And the cart is empty
And no payment method is selected
When the merchant views the "Proceed to Checkout" button
Then the button is disabled
And hovering over the button displays tooltip: "Please complete all required fields"

When the merchant selects Lead "Clint Barton" from the Order For dropdown
Then the "Proceed to Checkout" button remains disabled

When the merchant adds "Product A" to cart
Then the "Proceed to Checkout" button remains disabled

When the merchant selects "Cash on Pickup" as payment method
Then the "Proceed to Checkout" button becomes enabled
And the button is clickable

When the merchant clicks "Proceed to Checkout"
Then the Confirm Order modal displays successfully
```

##### Scenario 2: Delivery checkout additionally requires complete shipping address and shipping method

```gherkin
Given a merchant is on the Create Order page
And "Delivery" order type is selected
And the merchant has selected Guest Customer tab
And the merchant has entered:
  | Field Name | Value  |
  | First Name | Paolo  |
  | Last Name  | Santos |
And the merchant has added "Product B" to cart
And the merchant has selected "Cash on Delivery" as payment method
When the merchant views the "Proceed to Checkout" button
Then the button is disabled
And the shipping address fields show validation errors for required fields

When the merchant fills in partial shipping address:
  | Field        | Value           |
  | Address Line | 123 Main Street |
  | Province     | Metro Manila    |
  | City         | (empty)         |
  | Barangay     | (empty)         |
  | Postal Code  | (empty)         |
Then the "Proceed to Checkout" button remains disabled

When the merchant completes all shipping address fields:
  | Field        | Value           |
  | Address Line | 123 Main Street |
  | Province     | Metro Manila    |
  | City         | Makati City     |
  | Barangay     | Poblacion       |
  | Postal Code  | 1210            |
Then the "Proceed to Checkout" button remains disabled (shipping method not selected)

When the merchant selects "Manual Shipping by Merchant" as shipping method
Then the "Proceed to Checkout" button becomes enabled

When the merchant clicks "Proceed to Checkout"
Then the Confirm Order modal displays with all order details including shipping information
```

##### Scenario 3: Successful order creation displays Order Created modal with order details

```gherkin
Given a merchant has completed all order requirements:
  | Field           | Value                        |
  | Order Type      | Store Pickup                 |
  | Customer        | Guest - Rosa Martinez        |
  | Store Location  | Main Branch                  |
  | Payment Method  | Cash on Pickup               |
  | Cart Items      | Product A (2), Product C (1) |
  | Order Total     | ₱350.00                      |
And the merchant has clicked "Proceed to Checkout"
And the Confirm Order modal is displayed
When the merchant clicks "Place Order"
Then the system processes the order
And the Confirm Order modal closes
And the "Order Created" success modal displays with:
  | Element       | Content                              |
  | Icon          | Green checkmark                      |
  | Title         | New order created!                   |
  | Message       | You have successfully created a new customer order. |
  | Customer Name | Rosa Martinez                        |
  | Order ID      | [Generated Order ID]                 |
And two action buttons are displayed: "Prepare Order" and "Close"
When the merchant clicks "Close"
Then the success modal closes
And the Create Order page resets to initial state
```

##### Scenario 4: Cart clears for current store location only after successful checkout

```gherkin
Given a merchant is on the Create Order page
And the merchant has items in multiple store location carts:
  | Store Location  | Cart Contents              |
  | Main Branch     | Product A (2), Product B (1) |
  | Mall Branch     | Product D (3)              |
And "Main Branch" is currently selected
And the Order Summary displays "Product A" and "Product B"
And the merchant has completed all order requirements
When the merchant clicks "Proceed to Checkout"
And the Confirm Order modal displays order for "Main Branch"
And the merchant clicks "Place Order"
Then the order is created successfully
And the "Order Created" success modal displays

When the merchant clicks "Close" on the success modal
Then the Create Order page resets
And the Store Location defaults to "Main Branch"
And the cart for "Main Branch" is now empty
And the Order Summary displays "Your cart is empty!"

When the merchant changes Store Location to "Mall Branch"
Then the Order Summary displays "Product D" (quantity: 3)
And the "Mall Branch" cart was NOT affected by the previous checkout
And the merchant can proceed to create another order for "Mall Branch"
```

##### Scenario 5: Standard Delivery shipping method requires Guest mobile number

```gherkin
Given a merchant is on the Create Order page
And "Delivery" order type is selected
And the merchant selects the "Guest Customer" tab
And the merchant fills in Guest details without mobile number:
  | Field Name    | Value              |
  | First Name    | Ricardo            |
  | Last Name     | Bautista           |
  | Email         | ricardo@email.com  |
  | Mobile Number | (empty)            |
And the merchant fills in complete shipping address
And the merchant adds products to cart
When the merchant selects "Standard Delivery" as the shipping method
Then an error toast displays: "Please add a mobile number for this shipping method."
And the "Standard Delivery" option is not selected
And the Shipping Method field remains empty
When the merchant enters Mobile Number "9171234567" in the Guest Customer form
And the merchant selects "Standard Delivery" as the shipping method again
Then "Standard Delivery" is successfully selected
And no error toast is displayed
```

##### Scenario 6: E-Wallets payment method requires Guest mobile number

```gherkin
Given a merchant is on the Create Order page
And "Store Pickup" order type is selected
And the merchant selects the "Guest Customer" tab
And the merchant fills in Guest details without mobile number:
  | Field Name    | Value             |
  | First Name    | Daniela           |
  | Last Name     | Reyes             |
  | Email         | daniela@email.com |
  | Mobile Number | (empty)           |
And the merchant selects "Main Branch" as the Store Location
And the merchant adds products to cart
When the merchant selects "E-Wallets" as the payment method
Then an error toast displays: "Please add a mobile number for this payment method."
And the "E-Wallets" option is not selected
And the Payment Method field remains empty
When the merchant enters Mobile Number "9181234567" in the Guest Customer form
And the merchant selects "E-Wallets" as the payment method again
Then "E-Wallets" is successfully selected
And no error toast is displayed
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement              | Metric                                                      | Measurement Method              |
| ------------------------ | ----------------------------------------------------------- | ------------------------------- |
| Tab switching response   | Less than 200ms for customer path tab switch                | Frontend performance monitoring |
| Store location change    | Less than 500ms for location switch with cart isolation     | UI state change timing          |
| Product list filtering   | Less than 1 second to filter products by store location     | API response time monitoring    |
| Guest order creation     | Less than 3 seconds (P95) from Place Order to success modal | End-to-end timing               |
| Automatic Lead creation  | Less than 2 seconds after successful checkout               | Background job monitoring       |
| Cart state persistence   | Zero data loss when switching store locations               | State management testing        |
| Form validation response | Less than 100ms for inline validation feedback              | Frontend event handling timing  |
| Dropdown rendering       | Less than 500ms to render store location dropdown           | UI rendering performance        |

### 4.2 Scalability

| Requirement                  | Target                                                           | Validation Method         |
| ---------------------------- | ---------------------------------------------------------------- | ------------------------- |
| Concurrent Guest orders      | Support 1,000+ merchants creating Guest orders simultaneously    | Load testing              |
| Store locations per merchant | Support up to 50 store locations without performance degradation | Configuration testing     |
| Cart isolation memory        | Handle 10 isolated carts per session without memory issues       | Memory profiling          |
| Product filtering            | Filter 10,000+ products by location in less than 1 second        | Query performance testing |
| Lead creation queue          | Process 1,000+ automatic Lead creations per minute               | Background job testing    |

### 4.3 Reliability

| Requirement                       | Target                                                           | Monitoring               |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------ |
| Guest order creation success rate | Greater than 99.5% successful order creation                     | Order creation logs      |
| Cart state integrity              | Zero cart data loss during location switching                    | State integrity testing  |
| Automatic Lead creation accuracy  | 100% Lead creation when conditions met                           | Lead creation audit logs |
| Form data preservation            | Zero data loss during tab switching (intentional clear excepted) | UI state testing         |
| Order-location association        | 100% orders correctly linked to selected store location          | Order record validation  |

### 4.4 Security

| Requirement            | Implementation                                                   | Validation               |
| ---------------------- | ---------------------------------------------------------------- | ------------------------ |
| Guest data handling    | Guest information processed with same security as Lead data      | Security audit           |
| Session cart isolation | Cart data isolated per session, not shared across users          | Session security testing |
| Input sanitization     | All Guest form inputs sanitized against XSS/injection            | Security scanning        |
| Order record access    | Only merchant can view their Guest order records                 | Authorization testing    |
| Lead creation security | Automatic Lead creation follows existing Lead security protocols | Security review          |

### 4.5 Usability

| Requirement                              | Target                                                 | Measurement       |
| ---------------------------------------- | ------------------------------------------------------ | ----------------- |
| Tab selection clarity                    | 95% merchants understand tab purpose on first use      | Usability testing |
| Guest form completion time               | Less than 30 seconds for name-only Guest entry         | Task timing       |
| Store location selection discoverability | 90% merchants find location dropdown within 10 seconds | User testing      |
| Cart isolation understanding             | 85% merchants understand per-location cart behavior    | User testing      |
| Error message comprehension              | 90% users understand validation error messages         | User testing      |

### 4.6 Compatibility

| Requirement           | Standard                                         | Validation            |
| --------------------- | ------------------------------------------------ | --------------------- |
| Browser support       | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+    | Cross-browser testing |
| Mobile responsiveness | Full functionality on 375px+ width screens       | Responsive testing    |
| Touch device support  | Tab selection and forms work on touch screens    | Mobile device testing |
| Keyboard navigation   | All form fields and tabs accessible via keyboard | Accessibility testing |
| Screen reader support | Form labels and errors announced correctly       | Accessibility testing |

---

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: Guest Customer with Store Pickup**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Create Order   │────▶│  Select "Guest  │────▶│  Enter First &  │
│  Page Load      │     │  Customer" Tab  │     │  Last Name      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Place Order    │◀────│  Select Payment │◀────│  Add Products   │
│  Success        │     │  Method         │     │  to Cart        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Alternative Flow: Guest Customer with Delivery**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Create Order   │────▶│  Select "Guest  │────▶│  Enter Guest    │
│  Page Load      │     │  Customer" Tab  │     │  Details        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Enter Shipping │────▶│  Select Store   │────▶│  Add Products   │
│  Address        │     │  Location       │     │  to Cart        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Place Order    │◀────│  Select Payment │◀────│  Select Shipping│
│  Success        │     │  Method         │     │  Method         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Store Location Cart Isolation Flow**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Select Store   │────▶│  Add Products   │────▶│  Cart A has     │
│  Location A     │     │  to Cart        │     │  items          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Cart B empty   │◀────│  Switch to      │     │  Cart A         │
│  (isolated)     │     │  Store Loc B    │     │  preserved      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Checkout only  │◀────│  Add Products   │────▶│  Cart B has     │
│  Cart B items   │     │  to Cart B      │     │  different items│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 5.2 UI Mockups & Wireframes

[Enhanced Create Order UX Prototype](https://p1-ba-pocs.vercel.app/enhanced-create-order)

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Prosperna Frontend                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Create Order Page Component                     │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Customer Path Tabs                                 │  │  │
│  │  │  • "Existing/New Customer" Tab                      │  │  │
│  │  │  • "Guest Customer" Tab                             │  │  │
│  │  │  • Tab switching clears other tab's data            │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Existing/New Customer Section                      │  │  │
│  │  │  • Order For Dropdown (Leads with badges)           │  │  │
│  │  │  • Create Customer Button + Modal                   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Guest Customer Section                             │  │  │
│  │  │  • First Name* / Last Name* fields                  │  │  │
│  │  │  • Email (optional) / Mobile Number (optional)      │  │  │
│  │  │  • Inline validation                                │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Select Products Section                            │  │  │
│  │  │  • Store Location Dropdown (default pre-selected)   │  │  │
│  │  │  • Product List (filtered by location)              │  │  │
│  │  │  • Category Filter                                  │  │  │
│  │  │  • Search Products                                  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Cart State Manager (per Store Location)            │  │  │
│  │  │  • Isolated cart per store location                 │  │  │
│  │  │  • Cart persistence during location switching       │  │  │
│  │  │  • Only active location cart visible                │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Order Summary Sidebar                              │  │  │
│  │  │  • Current location cart items                      │  │  │
│  │  │  • Order totals                                     │  │  │
│  │  │  • Proceed to Checkout button                       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 API Gateway / Backend Services                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Order Service                                   │  │
│  │  • Create order for Lead or Guest                         │  │
│  │  • Associate order with store location                    │  │
│  │  • Validate order requirements by type                    │  │
│  │  • Process Guest order without Lead                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Lead Service                                    │  │
│  │  • Automatic Lead creation from Guest checkout            │  │
│  │  • Trigger: Name + Email + Mobile all provided            │  │
│  │  • New Lead status: Unregistered                          │  │
│  │  • Link order to newly created Lead                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Store Location Service                          │  │
│  │  • Retrieve merchant's store locations                    │  │
│  │  • Identify default store location                        │  │
│  │  • Filter products by store location                      │  │
│  │  • Get inventory per store location                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Product Service                                 │  │
│  │  • Retrieve products assigned to store location           │  │
│  │  • Get stock levels per store location                    │  │
│  │  • Product availability by location                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Validation Service                              │  │
│  │  • Guest form validation (name required, email/phone fmt) │  │
│  │  • Shipping method mobile requirement validation          │  │
│  │  • Payment method mobile requirement validation           │  │
│  │  • Order completeness validation by order type            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Layer                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Orders Table                                    │  │
│  │  • Order record (created for all orders incl. Guest)      │  │
│  │  • Customer name (Guest or Lead name)                     │  │
│  │  • Customer email (value or "N/A")                        │  │
│  │  • Customer mobile (value or "N/A")                       │  │
│  │  • Store location ID (fulfillment location)               │  │
│  │  • Lead ID (nullable - null for Guest without Lead)       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Leads Table                                     │  │
│  │  • Lead record (created automatically or manually)        │  │
│  │  • Status: Registered / Unregistered                      │  │
│  │  • First Name, Last Name, Email, Mobile                   │  │
│  │  • Created via: Manual / Guest Checkout                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Store Locations Table                           │  │
│  │  • Store location records per merchant                    │  │
│  │  • Is Default flag (first/main location)                  │  │
│  │  • Location name, address                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Product-Location Assignment Table               │  │
│  │  • Product-to-location mapping                            │  │
│  │  • Stock quantity per location                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Model (ER Diagram)

```
┌─────────────────────┐       ┌─────────────────────┐
│      Merchants      │       │    Store Locations  │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │──────<│ id (PK)             │
│ name                │       │ merchant_id (FK)    │
│ ...                 │       │ name                │
└─────────────────────┘       │ address             │
                              │ is_default          │
                              │ created_at          │
                              └─────────────────────┘
                                        │
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│      Products       │       │  Product_Locations  │       │       Orders        │
├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │──────<│ product_id (FK)     │       │ id (PK)             │
│ merchant_id (FK)    │       │ location_id (FK)    │>──────│ store_location_id   │
│ name                │       │ stock_quantity      │       │ lead_id (FK, null)  │
│ price               │       └─────────────────────┘       │ customer_first_name │
│ ...                 │                                     │ customer_last_name  │
└─────────────────────┘                                     │ customer_email      │
                                                            │ customer_mobile     │
                                                            │ order_type          │
┌─────────────────────┐                                     │ order_status        │
│       Leads         │                                     │ total_amount        │
├─────────────────────┤                                     │ created_at          │
│ id (PK)             │<────────────────────────────────────│ ...                 │
│ merchant_id (FK)    │                                     └─────────────────────┘
│ first_name          │
│ last_name           │
│ email               │
│ mobile_number       │
│ status              │  (Registered / Unregistered)
│ created_via         │  (Manual / Guest Checkout)
│ created_at          │
└─────────────────────┘
```

**Key Relationships:**

- **Orders.lead_id** is nullable: NULL for Guest orders without automatic Lead creation
- **Orders.store_location_id** is required: Every order must be associated with a store location
- **Orders** stores customer details directly (not just FK to Lead) to support Guest orders
- **Product_Locations** enables many-to-many relationship with stock per location

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type              | Coverage Target                                                      | Responsibility | Tools                       |
| ---------------------- | -------------------------------------------------------------------- | -------------- | --------------------------- |
| Unit Tests             | Greater than 85% code coverage for tab switching and form validation | Dev Team       | Jest, React Testing Library |
| Integration Tests      | Customer path selection → order creation flow                        | Dev Team       | Jest, Supertest             |
| BDD Scenario Tests     | All 25 Gherkin scenarios automated                                   | QA Team        | Cucumber, Playwright        |
| API Tests              | Guest order creation, automatic Lead creation endpoints              | QA Team        | Postman, Newman             |
| Regression Tests       | Existing Lead-based order creation unchanged                         | QA Team        | Automated test suite        |
| State Management Tests | Cart isolation, tab data clearing                                    | Dev Team       | Jest, React Testing Library |
| Performance Tests      | Tab switching, location change, product filtering                    | QA Team        | Lighthouse, k6              |
| Cross-browser Tests    | All functionality across Chrome, Firefox, Safari, Edge               | QA Team        | BrowserStack                |
| Mobile Responsiveness  | Guest form and location selection on mobile devices                  | QA Team        | Device lab testing          |
| UAT                    | End-to-end merchant workflows for walk-in orders                     | Product + QA   | Manual testing              |

### 7.2 BDD Test Automation

**Test Structure:**

```
/tests
  /features
    /customer-path-selection
      /tab-selection.feature
      /tab-data-clearing.feature
    /guest-customer
      /guest-form-validation.feature
      /guest-order-creation.feature
      /automatic-lead-creation.feature
    /store-location
      /location-selection.feature
      /cart-isolation.feature
      /product-filtering.feature
    /checkout
      /checkout-validation.feature
      /order-completion.feature
  /step-definitions
    /customer-path-steps.js
    /guest-form-steps.js
    /store-location-steps.js
    /checkout-steps.js
  /support
    /hooks.js
    /test-data.js
    /cart-helpers.js
```

### 7.3 Critical Test Scenarios

**High Priority (P0 - Blocker):**

1. Guest Customer tab displays form with required name fields
2. Switching tabs clears data from other tab
3. Guest order creation succeeds with name only (Store Pickup)
4. Guest order creation succeeds with name + address (Delivery)
5. Store location pre-selects default on page load
6. Cart isolation works when switching store locations
7. Checkout processes only current location's cart
8. Automatic Lead creation triggers with complete Guest info
9. Order record created with "N/A" for missing contact fields
10. Standard Delivery blocks without mobile number
11. E-Wallets blocks without mobile number

**Medium Priority (P1 - Critical):**

12. Guest form validation errors display correctly
13. Store location change filters product list
14. Other location carts preserved after checkout
15. Confirm Order modal shows store location
16. Newly created Lead appears in Leads module
17. Order links to Lead when auto-created

**Lower Priority (P2 - Important):**

18. Tab switching performance under 200ms
19. Store location change under 500ms
20. Mobile responsiveness of Guest form
21. Keyboard navigation for tabs and form

---

## 8. Risks & Mitigations

| Risk                                                                                                                           | Impact | Likelihood | Mitigation Strategy                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Anonymous orders complicate customer service** - Guest orders without contact info make follow-up difficult for order issues | Medium | Medium     | • Encourage optional contact collection via UI hints<br>• Order confirmation display reminds merchant to collect phone for callbacks<br>• Accept that some orders will be truly anonymous<br>• Provide order ID as primary reference for customer service |

---

## 9. Future Enhancements

1. **Guest Order History Lookup** - Allow merchants to search past Guest orders by name or order ID for returning walk-in customers
2. **Quick Reorder for Guests** - Enable merchants to quickly recreate previous Guest orders for returning customers
3. **Guest to Lead Conversion Prompt** - Prompt merchants to collect contact info from repeat Guest customers for Lead creation
4. **Multi-Location Cart Checkout** - Allow checkout of multiple store location carts in single transaction (for transfer orders)
5. **Store Location Quick Switch** - Add keyboard shortcut or quick-access button for rapid location switching
6. **Guest Order Analytics** - Dashboard showing Guest vs Lead order ratios, conversion rates, and average order values
7. **Offline Guest Orders** - Enable Guest order creation when internet connectivity is limited (sync when online)
8. **Guest Customer Loyalty** - Track repeat Guest customers by name matching and offer loyalty benefits

---

## Approval and Sign-off

| Stakeholder       | Role | Status      | Date Signed       |
| ----------------- | ---- | ----------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---               |
| Ruel Nopal        | HoE  | ☐ Pending   | ---               |
| Rian Froille Alde | QA   | ☐ Pending   | ---               |
| Back-end Lead     | BE   | ☐ Pending   | ---               |
| Front-end Lead    | FE   | ☐ Pending   | ---               |
| Adrianne Berida   | BA   | ☐ Completed | December 22, 2025 |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for enhancing Prosperna's Create Order feature to support Guest Customer checkout for walk-in transactions and Store Location selection for multi-location order fulfillment, enabling merchants to efficiently process orders for any customer scenario while maintaining accurate inventory and order routing.
