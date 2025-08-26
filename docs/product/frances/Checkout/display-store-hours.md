---
id: display-store-hours
title: Display Store Hours
sidebar_label: Display Store Hours
sidebar_position: 2
---

# Checkout | Display Store Hours

## Executive **Summary**
This feature introduces the display of **store operating hours** and **store status (open/closed)** in the **Store Details section of the Checkout page**. It allows consumers to make informed decisions about placing an order based on store availability.
## Background
Currently, consumers do not have visibility into a store’s operating hours at checkout. This can lead to confusion, failed expectations, or abandoned carts when orders are placed outside store hours. By displaying store hours and real-time status, the system provides clarity and improves customer experience.
## Business Objective
*   To **increase transparency** by showing store operating hours during checkout.
*   To **reduce failed or misaligned orders** by ensuring consumers know if the store is open or closed.
*   To **build consumer trust** with clear communication of store availability.
## **Scope of Solution**
### In-Scope
*   Display store hours and status (Open/Closed) on the Checkout page under Store Details.
*   Dynamic status check based on current system time vs. configured store hours.
*   Status tags:
    *   **Open (green)** when current time is within store hours.
    *   **Closed (red)** when current time is before/after store hours.
### Out of Scope
*   Preventing checkout during closed hours (consumer may still proceed).
*   Integration with external calendars or schedules.
*   Advanced logic for holidays or exceptions (handled separately).
## Business Requirements

| **ID** | **Business Requirement** | **Description / Logic** |
| ---| ---| --- |
| **BR-001** | Store Hours Configuration | Store hours must be set by the merchant in Locations Settings. |
| **BR-002** | Display Store Hours | Checkout must display store hours in the format: `(Opening Time) - (Closing Time)`. |
| **BR-003** | Display Store Status | Checkout must display a dynamic status tag (Open/Closed) based on comparison of current time with store hours. |
| **BR-004** | Open Tag Display | If current time is within store hours → Show **“Open”** in green tag. |
| **BR-005** | Closed Tag Display | If current time is before opening time or after closing time → Show **“Closed”** in red tag. |

## **User Flow Diagram**
![](https://t7537039.p.clickup-attachments.com/t7537039/94fa5294-ac1e-4b2b-853d-be7dcac56f31/image.png)
## **Functional Requirement**
#### UC 01 | Display Store Hours in Checkout

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-001 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | August 25, 2025 |
| **Objectives** | To display store hours and store status (open/closed) in the **Store Details** section of the checkout page so consumers are aware of the store’s operating hours before placing an order. |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is on the checkout page.<br />\- Merchant has set store hours in the **Store Settings**. |
| **Conditions** | \- Store is **Open** (current time within store hours).<br />\- Store is **Closed** (current time before or after store hours). |
| **Steps** | **Step 1**: Consumer adds a product to the cart.<br />**Step 2**: Consumer proceeds to the **Cart page**.<br />**Step 3**: Consumer clicks the **Checkout button**.<br />**Step 4**: System displays the **Checkout page**.<br />**Step 5**: Consumer fills out required fields (contact and delivery/pickup info).<br />**Step 6**: Consumer selects a shipping method from the available options:<br />  - Standard Delivery (not included since store hours does not affect delivery)<br />  - Same Day Delivery<br />  - Manual Shipping by Customer<br />  - Manual Shipping by Merchant<br />  - Store Pickup<br />  - Scheduled Delivery<br />**Step 7**: System displays the **Delivery Information / Pickup Instructions** section.<br />  - Includes custom/default text for instructions.<br />  - Includes **Store Details (with Store Hours)**.<br />**Step 8**: Consumer views the **Store Details** section within the instructions box.<br />**Step 9**: System checks the **Store Hours** set by the merchant in **Store Settings**.<br />**Step 10**: System compares the **current time** with store hours.<br />**Step 11**: System displays store hours in the following format (see design):<br />  • **Store Hours:** `(Opening Time) - (Closing Time)`<br />  • **Status Tag:**<br />    - If current time is **within store hours** → Display “**Open**” (green tag).<br />    - If current time is **before or after store hours** → Display “**Closed**” (red tag).<br />**Example:**<br />\- Store Hours: 8:00 AM – 9:00 PM<br />\- Status: **Open** (if within hours)<br />\- Status: **Closed** (if outside hours) |
| **Postconditions** | \- Store hours and status (open/closed) are visible to the consumer at checkout.<br />\- Consumer can make an informed decision on whether to proceed with checkout based on store availability. |
| **Business Trigger** | Consumer proceeds to checkout and selects a shipping/pickup method. |
| **Acceptance Criteria** | \- Store hours must be displayed correctly in the set format.<br />\- Status tag must dynamically reflect “Open” or “Closed” based on current time.<br />\- If store hours are not configured by the merchant, system should display default text (e.g., “Store Hours not available”). |
| **Estimates** | \[To be determined by development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />\- Display store hours for shipping methods that require consumers to set the delivery time in P1 or through a 3rd party app<br />  * Same Day - Lalamove<br />* Scheduled Delivery - Lalamove<br />* Manual Shipping by Consumer and Merchant - 3rd party app<br />* Store Pickup<br />Identify impacted modules (amend if there is something missing)<br />- Checkout Page<br />- Shipping Information<br />- Delivery Date and Time<br />- Shipping<br />- Shipping Method<br />- Multilocation<br />- Store Hours<br /> |

## Nonfunctional Requirements

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | Store status must load instantly alongside the checkout page. | High |
| **Security Requirements** | No sensitive data should be exposed in the status display. | High |
| **Usability Requirements** | Hours and status must be clearly visible, with appropriate color tags for readability. | Medium |
| **Reliability Requirements** | System must always display the correct status based on server time. | High |
| **Scalability Requirements** | Must support thousands of stores without performance degradation or lag. | High |
| **Compatibility Requirements** | Must work seamlessly across both web and mobile checkout flows. | High |
| **Regulatory & Compliance Requirements** | No compliance concerns identified. | Low |

## Constraints
*   Relies on accurate store hours being configured by merchant.
*   Relies on system/server time accuracy.
## Assumptions
*   Store hours are always in local timezone of store.
*   Merchants will input valid opening and closing times.
## Acceptance Criteria

| **AC ID** | **Linked BR ID** | **Acceptance Criteria** |
| ---| ---| --- |
| **AC-001** | BR-001 | Merchant must be able to configure store hours in Store Settings. |
| **AC-002** | BR-002 | System must display store hours in format `(Opening Time) - (Closing Time)` in checkout Store Details section. |
| **AC-003** | BR-003 | System must compare current time with store hours to determine status. |
| **AC-004** | BR-004 | If current time is within store hours, show **Open** with a green tag. |
| **AC-005** | BR-005 | If current time is outside store hours, show **Closed** with a red tag. |

## **Wireframes**
[Wireframe](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=4757-12452&t=6ji6uGHYVm2yucFZ-4)
## **Figma Design File ℅ UX UI Designer**
[Figma File](https://www.figma.com/design/XQZ6TwOZcYNtyfTINm7ahN/Prosperna----User-Flows?node-id=24785-7291&t=qoImxpFaSJ7WsATV-1)
![](https://t7537039.p.clickup-attachments.com/t7537039/eb248194-f9b1-45d9-bceb-6937cac07fc5/image.png)
![](https://t7537039.p.clickup-attachments.com/t7537039/80d89054-a1f5-4a11-b1f7-8d31ac6e2845/image.png)
## **Clickup Task**
[Parent task](https://app.clickup.com/t/86ep7kprh)<br />
[Main task](https://app.clickup.com/t/86eqpr02u)
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed | August 26, 2025 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br /> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |