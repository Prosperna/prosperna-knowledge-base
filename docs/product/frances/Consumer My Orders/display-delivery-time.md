---
id: display-delivery-time
title: View Delivery Time
sidebar_label: View Delivery Time
sidebar_position: 1
---

# Consumer Side | View Delivery Time in Email and Invoice

## Executive Summary
The feature ensures that customers can view their delivery time preferences across key touchpoints — in the **order invoice (email/My Account)** and the **My Orders table**. This improves transparency, reduces confusion, and ensures accurate communication of order delivery schedules.
## Objectives
*   To display the delivery time in the **Order Invoice** sent via email and in **My Account > My Orders** page.
*   To ensure that the delivery time is dynamically shown or hidden based on the chosen **shipping method** and delivery preference (“Now” or “Later”).
*   To allow customers and merchants to consistently see accurate delivery information.
## Scope
### In Scope
*   Order Invoice (email & My Orders > Order details page).
*   My Orders page (delivery time column).
*   Dynamic rendering based on delivery method and time selection.
### Out of Scope
*   Delivery time validation logic (already handled during checkout).
*   Editing delivery time post-purchase.
## Business Requirements

| **BR ID** | **Business Requirement** |
| ---| --- |
| BR-01 | The system must display the **delivery time field** in the Order Invoice (email & My Account > Order Details). |
| BR-02 | The system must display the **delivery time column** in the My Orders table. |
| BR-03 | For “Deliver Now” orders, the system must display **“Deliver Now”** as the delivery time. |
| BR-04 | For scheduled deliveries, the system must display the delivery time in the format **MMM DD, YYYY | hh:mm am/pm**. |
| BR-05 | For “Book My Own” or “Store Pickup” shipping methods, the system must **hide delivery time** in invoice and display **“NA”** in the My Orders table. |
| BR-06 | The system must ensure delivery time data is stored in the order object so it can be consistently displayed in invoices, My Orders, and dashboards. |
| BR-07 | If delivery time data is missing or corrupted, the system must display fallback text: **“Delivery Time not available”**. |

## **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 02** | System | **Display Delivery Time in Order Invoice** | Display delivery time in order invoice | **HIGH** |
| **UC 03** | Consumer | **View Delivery Time Column**<br /> | Display delivery time in the my orders table | **HIGH** |

### **Use Case Description Tables**
#### **UC 02 | Display Delivery Time in Order Invoice**

| **Column** | Description |
| ---| --- |
| **Use Case ID** | UC-02 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | January 25, 2024 |
| **Objectives** | Display delivery time in order invoice |
| **Actor** | Customer |
| **Preconditions** | \- The consumer successfully confirmed payment of the |
|  | order upon checkout |
|  | \- The consumer received the order invoice via email |
|  | \- The consumer can view the order invoice in their My |
|  | Account > My Orders page |
| **Conditions** | 1\. Customer wants their order delivered "Now" |
|  | 2\. Customer wants their order delivered "Later" or on |
|  | a scheduled time |
|  | 3\. Shipping Method is Book My Own or Store Pickup |
| **Steps** | Condition 1: |
|  | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Standard Delivery or Same Day |
|  | Delivery as the Shipping Method |
|  | 4\. Customer selects "Now" as the time of delivery |
|  | 5\. Customer proceeds to pay for the order |
|  | 6\. Customer receives an email notification |
|  | 7\. Customer views the email containing the order |
|  | invoice |
|  | 8\. Customer can view the Delivery Time field |
|  | 9\. System displays "Deliver Now" as the Delivery Time |
|  | of the order |
| **Condition 2:** | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Standard Delivery or Same Day |
|  | Delivery as the Shipping Method |
|  | 4\. Customer selects "Later" as the time of delivery |
|  | 5\. Customer selects their preferred delivery time in |
|  | the time picker |
|  | 6\. Customer proceeds to pay for the order |
|  | 7\. Customer receives an email notification |
|  | 8\. Customer views the email containing the order |
|  | invoice |
|  | 9\. Customer can view the Delivery Time field |
|  | 10\. System displays the preferred delivery time as the |
|  | Delivery Time of the order in the format: "MMM DD, |
|  | YYYY |
| **Condition 3:** | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Book My Own or Store Pickup as the |
|  | Shipping Method |
|  | 4\. Customer proceeds to pay for the order |
|  | 5\. Customer receives an email notification |
|  | 6\. Customer views the email containing the order |
|  | invoice |
|  | 7\. System hides the Delivery Time field |
|  | 8\. Customer should not be able to view the Delivery |
|  | Time field |
| **Steps for All:** | Consumer can view the Invoice via the following:<br>Email Notification<br>Consumer's My Orders Dashboard<br> |
| **Postconditions** | Delivery time is displayed in the order invoice for |
|  | the new order |
| **Business Trigger** | Customer should be able to view the time they want their order to be delivered |
| **Acceptance Criteria** | Delivery time is accurately displayed as expected in |
|  | the order invoice |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | N/A |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br /> - My orders<br /> - Email |

#### **UC 03 | View Delivery Time Column**

| **Column** | Description |
| ---| --- |
| **Use Case ID** | UC-03 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | January 29, 2024 |
| **Objectives** | Display delivery time in the my orders table |
| **Actor** | Customer |
| **Preconditions** | \- Customer is in the my orders page |
| **Conditions** | 1\. Customer wants their order delivered "Now" |
|  | 2\. Customer wants their order delivered "Later" or on a scheduled time |
|  | 3\. Shipping Method is Book My Own or Store Pickup |
| **Steps** | Condition 1: |
|  | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Standard Delivery or Same Day as the Shipping Method |
|  | 4\. Customer selects "Now" as the time of delivery |
|  | 5\. Customer proceeds to pay for the order |
|  | 6\. Customer logs in to their My Account |
|  | 7\. Customer views the My Orders page |
|  | 8\. Merchant can view the Delivery Time column |
|  | 9\. System displays "Deliver Now" as the Delivery Time |
|  | of the order |
|  | Condition 2: |
|  | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Standard Delivery or Same Day as the Shipping Method |
|  | 4\. Customer selects "Later" as the time of delivery |
|  | 5\. Customer selects their preferred delivery time in the time picker |
|  | 6\. Customer proceeds to pay for the order |
|  | 6\. Customer logs in to their My Account |
|  | 7\. Customer views the My Orders page |
|  | 9\. Merchant can view the Delivery Time column |
|  | 10\. System displays the preferred delivery time as the Delivery Time of the order in the format: "MMM DD, YYYY | hh:mm am/pm" |
|  | Condition 3: |
|  | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Book My Own or Store Pickup as the Shipping Method |
|  | 4\. Customer proceeds to pay for the order |
|  | 5\. Customer logs in to their My Account |
|  | 6\. Customer views the My Orders page |
|  | 7\. Merchant can view the Delivery Time column |
|  | 8\. System displays "NA" as the Delivery Time of the order |
| **Postconditions** | Delivery time is displayed in the My Orders table for the new order |
| **Business Trigger** | Customer should be able to view the time their order will be delivered to them |
| **Acceptance Criteria** | Delivery time is accurately displayed as expected |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | N/A |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br /> - Consumer be able to see the store details in the invoice<br />Identify impacted modules (amend if there is something missing)<br /> - My orders<br /> - Email |

## Acceptance Criteria

| **AC ID** | **Linked BR ID** | **Acceptance Criteria** |
| ---| ---| --- |
| AC-01 | BR-01 | Order invoice must contain a **Delivery Time field** when order is placed. |
| AC-02 | BR-02 | My Orders table must include a **Delivery Time column** visible for all orders. |
| AC-03 | BR-03 | If the customer selected “Deliver Now,” system must show **“Deliver Now”** in both invoice and My Orders. |
| AC-04 | BR-04 | If the customer selected “Later,” system must display the chosen delivery time in format **MMM DD, YYYY | hh:mm am/pm**. |
| AC-05 | BR-05 | If shipping method = Book My Own or Store Pickup, system must **hide delivery time** in invoice and display **“NA”** in My Orders. |
| AC-06 | BR-06 | Delivery time data must be retrieved from order object and displayed consistently across invoice, My Orders, and merchant dashboard. |
| AC-07 | BR-01 | The system must display the **delivery time field** in the Order Invoice (email & My Account > Order Details). |

## **Wireframes**
[Wireframe Link](https://www.figma.com/file/YBhF7WvFuormZFkhpVfsuU/Prosperna-Wireframe-copy?type=design&node-id=640-7844&mode=design&t=JDbYsku3MUL3vq5X-4)
## **Figma Design File ℅ UX UI Designer**
[Design Link](https://www.figma.com/design/XQZ6TwOZcYNtyfTINm7ahN/Prosperna----User-Flows?node-id=12994-6283&t=mO0rrntNVcuj663t-0)
## **Clickup Task**
[Clickup Link](https://app.clickup.com/t/86enh2n4t)
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances | BA | Completed (UC 01) | November 9, 2023 |
| Frances | BA | Completed (UC 02) | January 25, 2024 |
| Diane | QA | Passed (UC 01) | May 14, 2024 |
|  | PM |  |  |