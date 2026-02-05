---
id: custom-delivery-date
title: Custom Delivery Date
sidebar_label: Custom Delivery Date BRD
sidebar_position: 1
---
---
title: "Prosperna One | Custom Delivery Date"
author: "Prosperna One Team"
date: "2025-11-28"
status: "Draft"
plans: ["PRO", "PREMIUM"]
---

# Summary
This document is focused on the **Custom Delivery Date** feature for Merchants, wherein the Merchant can set the availability of their products and let customers select the available time slots for their preferred delivery.  

**Availability:** PRO and PREMIUM Plan Users only.

# Problem Statement
Some products require a definite preparation date and specific available delivery time, which is essential for industries like Food and Beverages.

# Scope
- Available only to PRO and PREMIUM Plan users.
- Monthly Subscription: **PhP 495 / Month (Prorated)** for Bronze (Bronze Subscription for now).
- Limitations: Applicable **ONLY to Physical Products**.

# Research
- [YouTube: GeGWP_QKJAE](https://www.youtube.com/watch?v=GeGWP_QKJAE)  
- [YouTube: EAOwrPIE1VE](https://www.youtube.com/watch?v=EAOwrPIE1VE)

# Functional Requirements

| Use Case ID | Actor | Use Case Name | Short Description | Priority |
|-------------|-------|---------------|-----------------|---------|
| UC 01 | Prosperna One Merchant | Marketplace: Custom Delivery Date | Merchant adds the Custom Delivery Date feature to their Merchant Account | HIGH |
| UC 02 | Prosperna One Merchant | Custom Delivery Date Setup | Merchant can create, update, and delete Custom Delivery dates for their products | HIGH |
| UC 03 | Prosperna One Merchant | Shipping Settings: Scheduled Delivery - Lalamove | Merchant enables Scheduled Delivery with Custom Delivery Date | HIGH |
| UC 04 | Prosperna One Merchant | Create a Product: Product Tags | Merchant can assign Product Tags to each product to apply Custom Delivery Date | HIGH |
| UC 05 | Prosperna One Customer | Customer Side: Custom Delivery Date | Customer can settle payment for orders with products having Custom Delivery Date | HIGH |
| UC 06 | Prosperna One Merchant | In-App Notifications for Due Date of Orders | Merchant receives In-App Notifications regarding nearing due date for pending deliveries | HIGH |

## Use Case Description Tables

### UC01 | Marketplace: Custom Delivery Date
**Actor:** Prosperna One Merchant  
**Preconditions:** Merchant account is active and subscribed to PRO or PREMIUM plan.  
**Main Flow:**
1. Merchant logs into Marketplace dashboard.
2. Navigate to the Custom Delivery Date section.
3. Click "Enable Custom Delivery Date" toggle.
4. System verifies subscription level.
5. System confirms feature activation.
6. Merchant receives a confirmation message in-app.  
**Alternative Flows:**
- If merchant is not PRO/PREMIUM, display subscription upgrade prompt.  
**Postconditions:** Custom Delivery Date feature enabled for the merchant.  
**Business Rules:** Only PRO and PREMIUM users; impacts modules: Order, Store Settings, Shipping, Online Store.  
**Notes/References:** Lazada Integration BRD Phase 1.


### UC02 | Custom Delivery Date Setup
**Actor:** Prosperna One Merchant  
**Preconditions:** UC01 completed; Merchant has active products.  
**Main Flow:**
1. Navigate to Store Settings → Custom Delivery Date.
2. Click "Add New Delivery Date."
3. Select applicable products.
4. Choose date(s) and time slots.
5. Save settings.
6. System validates date/time availability.
7. System confirms the setup.  
**Alternative Flows:**
- Update: Merchant edits an existing date/time slot.
- Delete: Merchant deletes a previously assigned date/time.  
**Postconditions:** Products now have associated Custom Delivery Dates.  
**Business Rules:** Only for PRO/PREMIUM users; impacted modules: Order, Store Settings, Shipping, Online Store.


### UC03 | Shipping Settings: Scheduled Delivery - Lalamove
**Actor:** Prosperna One Merchant  
**Preconditions:** UC02 completed; Merchant uses Lalamove integration.  
**Main Flow:**
1. Navigate to Shipping Settings → Scheduled Delivery.
2. Enable Lalamove Scheduled Delivery toggle.
3. Select products that require scheduled delivery.
4. Assign Custom Delivery Dates to products.
5. Save settings.
6. System confirms scheduled delivery setup.  
**Alternative Flows:**
- Lalamove integration inactive → display setup guide.
- Invalid product selection → error message.  
**Postconditions:** Scheduled delivery enabled for selected products.  
**Business Rules:** PRO/PREMIUM only; impacted modules: Order, Store Settings, Shipping, Online Store.


### UC04 | Create Product: Product Tags
**Actor:** Prosperna One Merchant  
**Preconditions:** UC01 completed; Product exists.  
**Main Flow:**
1. Navigate to Add/Edit Product page.
2. Select Product Tags field.
3. Assign "Custom Delivery Date" tag.
4. Save product details.
5. System confirms tag assignment.  
**Alternative Flows:**  
- Tag already assigned → display warning.  
**Postconditions:** Product tagged for Custom Delivery Date.  
**Business Rules:** PRO/PREMIUM only; impacted modules: Inventory, Store Settings, Shipping, Online Store.


### UC05 | Customer Side: Custom Delivery Date
**Actor:** Prosperna One Customer  
**Preconditions:** UC02 completed; Product has Custom Delivery Date.  
**Main Flow:**
1. Customer adds product to cart.
2. Select preferred delivery date/time within available slots.
3. System validates date is within 30 days.
4. Proceed to checkout.
5. Customer completes payment.
6. Order confirmed with selected delivery date.  
**Alternative Flows:**
- Selected date exceeds 30 days → system restricts and shows valid range.
- International store location → calendar/time slot disabled.  
**Postconditions:** Order scheduled with Custom Delivery Date.  
**Business Rules:** PRO/PREMIUM only; impacts: Cart, Shipping, Online Store.

### UC06 | In-App Notifications for Due Date of Orders
**Actor:** Prosperna One Merchant  
**Preconditions:** UC05 completed; Orders exist with Custom Delivery Dates.  
**Main Flow:**
1. Merchant receives notification for pending order nearing delivery date.
2. Click "View Now" → redirected to Order Summary page.
3. Merchant takes necessary actions to prepare and ship.
4. System logs notification read status.  
**Alternative Flows:**  
- Click notification inside bell → redirected to Order Summary.
- Multiple store locations → notifications distinguished by location.  
**Postconditions:** Merchant notified and aware of upcoming deliveries.  
**Business Rules:** PRO/PREMIUM only; impacted modules: Order, Notifications.

# Nonfunctional Requirements

| Name | Description | Priority |
|------|-------------|---------|
| Responsiveness | Website displays correctly on any screen dimension without compromising interface | HIGH |
| System Performance | System should generate output within 3 seconds | HIGH |

# Wireframes
- [Custom Delivery Date - Invision](https://dennisvelasco229503.invisionapp.com/freehand/Custom-Delivery-Date-EtN2U5lBm?projectId=cln3xunpczejw01578661gyce)  
- [In-App Notification with Store Name - Figma](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/Prosperna-Wireframe-copy?node-id=2280-9335&t=9wxgcAmgOwbJQCaF-4)  

**Figma Designs**  
- Marketplace: [Link](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=12401-3518&mode=design&t=Twq9RcXpsqPenvpd-0)  
- Orders: [Link](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=12401-10318&mode=design&t=Y2TSqfqGZrqUJSZn-0)  
- Store Settings: [Link](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=12412-26728&mode=design&t=TVrcUQUFeqCIpnQ6-0)  
- Add Product Tags: [Link](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=12415-33347&mode=design&t=9vfJwvoFvdjWYrA9-0)  
- Shipping Settings: [Link](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=12412-33193&mode=design&t=MAHlCbxPHt0K3IaK-0)  
- Consumer Cart: [Link](https://www.figma.com/file/ofRyeNDkeAFr3i8Fwg7DrN/Prosperna---Consumer?type=design&node-id=2225-738&mode=design&t=WFZB5kcT2iNN3YqI-0)  
- Consumer Checkout: [Link](https://www.figma.com/file/ofRyeNDkeAFr3i8Fwg7DrN/Prosperna---Consumer?type=design&node-id=2225-2207&mode=design&t=wWVRmYYgZhlq4XBL-0)  
- In-App Notification with Store Name: [Link](https://www.figma.com/design/XQZ6TwOZcYNtyfTINm7ahN/Prosperna----User-Flows?node-id=21887-1904&t=uZKTCYWJcEolLbXn-4)

# ClickUp Task
- [Custom Delivery Date Task](https://app.clickup.com/t/860t5c4e2)

# Test Documentation
- Custom Delivery Date  
  - Use Cases UC 01-06: Test Documentation for Custom Delivery Date

# Future Enhancements
- UC 06 In-App Notifications:
  - Test Scenario 2: Clicking "View Now" redirects to Order Summary page  
  - Test Scenario 4: Clicking notification inside bell redirects to Order Summary page  

# Signed Off Stakeholders

| Stakeholder | Role | Status | Date |
|------------|------|--------|------|
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Jomari | BA | Completed (Updated) | December 20, 2024 |
| Mark Anthony | QA | Completed | February 06, 2024 |
| Frances Ramos | BA | Completed | June 18, 2024 |
| Adrianne Berida | BA | Completed | November 12, 2024 |
| Christian | PM |  |  |

# Logs

| Name | Action | Description | Date | Related Docs |
|------|--------|-------------|------|--------------|
| Frances Ramos (CR-1001) | Updated UC 06 | Added location-based notifications for phase 2 | June 18, 2024 | [ClickUp](https://app.clickup.com/t/865d52v27) |
| Adrianne Berida (CR-1002) | Updated UC 02 & UC 05 | Added validations for International Store Locations and Calendar/Time picker | November 12, 2024 | [ClickUp](https://app.clickup.com/t/86eqex5q8) |
| Jomari Adornado (CR-1003) | Updated UC 02 | Relocated Store Location dropdown and added How-To Guide feature | December 20, 2024 | [ClickUp](https://app.clickup.com/t/86eqmuquj) |
