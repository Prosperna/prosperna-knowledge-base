---
id: display-deliver-now-or-later
title: View Delivery Time 
sidebar_label: View Delivery Time
sidebar_position: 1
---

# Merchant Side | Orders | View Delivery Time in Email and Order Dashboard

## Executive **Summary**
This feature introduces a **Delivery Time field** across key order-related touchpoints:
*   Orders Table (Customer-facing and Merchant-facing)
*   Merchant’s Order Confirmation Email
The enhancement ensures customers, merchants, and admins consistently view the chosen delivery time (“Now”, “Later”, or “NA”), improving transparency, order tracking, and reducing operational inefficiencies.

## Business Objective
*   To **display the Delivery Time column** in the Orders Table for customers and merchants.
*   To **include Delivery Time in the Order Confirmation Email sent to merchants** after successful checkout and payment.
*   To maintain consistency of delivery time data across **Invoices, Orders Table, and Emails**.
*   
## **Scope of Solution**
### In Scope
*   Add Delivery Time column in Orders Tables (Customer + Merchant views).
*   Add Delivery Time field to **Merchant Order Confirmation Email**.
*   Display rules for “Now,” “Later,” and “NA.”
### Out of Scope
*   Editing or updating delivery time after checkout.
*   Email template redesign (only addition of Delivery Time field).
## Business Requirements

| **BR ID** | **Business Requirement** |
| ---| --- |
| BR-18-01 | Add a **Delivery Time column** to the Customer My Orders table. |
| BR-18-02 | Add a **Delivery Time column** to the Merchant Orders Table. |
| BR-18-03 | System must display **“Deliver Now”** when immediate delivery is selected. |
| BR-18-04 | System must display **scheduled delivery time** in the format: MMM DD, YYYY | hh:mm am/pm. |
| BR-18-05 | System must display **“NA”** if shipping method is Book My Own or Store Pickup. |
| BR-18-06 | Delivery Time must be included in the **Merchant Order Confirmation Email**. |
| BR-18-07 | Delivery Time must remain consistent across Orders Table, Invoice, and Merchant Confirmation Email. |
| BR-18-08 | If delivery time data is missing/corrupted, fallback text: **“Delivery Time not available.”** |

## **Functional Requirement**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 018** | System | **Display Delivery Time Column in Orders Table** | Display delivery time in the orders table | **HIGH** |
| **UC 019** | System | **Display Delivery Time in Email for Order Confirmation**<br /> | Ensure that the **Delivery Time** field in the order confirmation email sent to the merchant correctly displays either "Deliver Now" or the specific scheduled time based on the consumer’s selection during checkout. | **HIGH** |

### **Use Case 18 | Display Delivery Time Column in Orders Table**

| **Column** | Description |
| ---| --- |
| **Use Case ID** | UC-018 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | January 25, 2024 |
| **Objectives** | Display delivery time in the orders table |
| **Actor** | System |
| **Preconditions** | \- Merchant is in the orders page |
| **Conditions** | 1\. Customer wants their order delivered "Now" |
|  | 2\. Customer wants their order delivered "Later" or on a scheduled time |
|  | 3\. Shipping Method is Manual Shipping by Customer, Manual Shipping by Merchant, or Store Pickup |
| **Steps** | Condition 1: |
|  | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Standard Delivery or Same Day as the Shipping Method |
|  | 4\. Customer selects "Now" as the time of delivery |
|  | 5\. Customer proceeds to pay for the order |
|  | 6\. Merchant receives a new order notification |
|  | 7\. Merchant views the new order in the orders page |
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
|  | 7\. Merchant receives a new order notification |
|  | 8\. Merchant views the new order in the orders page |
|  | 9\. Merchant can view the Delivery Time column |
|  | 10\. System displays the preferred delivery time as the Delivery Time of the order in the format: "MMM DD, YYYY | hh:mm am/pm" |
|  | Condition 3: |
|  | 1\. Customer adds a product to the cart |
|  | 2\. Customer proceeds to checkout |
|  | 3\. Customer selects Manual Shipping by Customer, Manual Shipping by Merchant, or Store Pickup as the Shipping Method |
|  | 4\. Customer proceeds to pay for the order |
|  | 5\. Merchant receives a new order notification |
|  | 6\. Merchant views the new order in the orders page |
|  | 7\. Merchant can view the Delivery Time column |
|  | 8\. System displays "NA" as the Delivery Time of the order |
| **Postconditions** | Delivery time is displayed in the orders table for the new order |
| **Business Trigger** | Merchant should be able to view the time the order needs to be delivered to the customer at first glance, without viewing each single order page |
| **Acceptance Criteria** | Delivery time is accurately displayed as expected |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | N/A |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br />- Orders<br />- Email |

#### Use Case 19 | Display Delivery Time in Email for Order Confirmation

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-019 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 27, 2025 |
| **Objectives** | Ensure that the **Delivery Time** field in the order confirmation email sent to the merchant correctly displays either "Deliver Now" or the specific scheduled time based on the consumer’s selection during checkout. |
| **Actor** | System |
| **Preconditions** | \- Consumer has successfully checked out and completed payment.<br />\- Consumer selected a shipping method that supports delivery time options.<br />\- System can send order confirmation emails to the merchant. |
| **Steps** | 1\. Consumer proceeds to checkout.<br />2\. Consumer selects a shipping method that supports delivery scheduling (e.g., Standard Delivery, Same Day Delivery, Manual Shipping by Merchant, etc.).<br />3\. System displays the **Delivery Time** options: **Now** or **Later**.<br />4\. Consumer selects one of the following:<br />  • **Now** tab → Deliver Now.<br />  • **Later** tab → Opens date and time picker.<br />5\. If **Later** is selected, consumer chooses a specific date and time.<br />6\. Consumer completes checkout and payment.<br />7\. System creates the order and prepares the order confirmation email for the merchant.<br />8\. System checks the consumer’s delivery time selection:<br />  • If **Now** → System inserts `"Deliver Now"` in the Delivery Time field.<br />  • If **Later** → System inserts the selected date and time in the format: \`MMM DD, YYYY |
| **Postconditions** | \- Merchant receives the order confirmation email with the Delivery Time field displaying the correct value ("Deliver Now" or scheduled date/time). |
| **Business Trigger** | Consumer places an order and completes checkout. |
| **Acceptance Criteria** | \- If consumer selects **Now**, merchant email shows: `Delivery Time: Deliver Now`.<br />\- If consumer selects **Later**, merchant email shows: \`Delivery Time: Nov 30, 2024 |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If delivery time cannot be determined → System displays `"Delivery Time: Not Available"` in the email (fallback). |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br />- Orders<br />- Email |

## Acceptance Criteria

| **AC ID** | **Linked BR ID** | **Acceptance Criteria** |
| ---| ---| --- |
| AC-18-01 | BR-18-01 | Orders Table (Customer view) displays a Delivery Time column. |
| AC-18-02 | BR-18-02 | Orders Table (Merchant view) displays a Delivery Time column. |
| AC-18-03 | BR-18-03 | If customer selects “Now,” Delivery Time displays **“Deliver Now.”** |
| AC-18-04 | BR-18-04 | If customer selects “Later,” Delivery Time displays scheduled time in **MMM DD, YYYY | hh:mm am/pm.** |
| AC-18-05 | BR-18-05 | If shipping method is Book My Own or Store Pickup, Delivery Time displays **“N/A.”** |
| AC-18-06 | BR-18-06 | Merchant Order Confirmation Email includes Delivery Time under shipping method section. |
| AC-18-07 | BR-18-07 | Delivery Time value matches Invoice data and Orders Table value. |
| AC-18-08 | BR-18-08 | If delivery time data is missing, fallback message **“Delivery Time not available”** is displayed. |

## **Wireframe**
[Wireframe](https://dennisvelasco229503.invisionapp.com/freehand/-Web----Checkout---Lalamove-Same-Day-Delivery-Enhancements-ekKrJ5cBM)
## **Figma Design File ℅ UX UI Designer**
[Figma Design File](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=12994-6283&mode=design&t=aD1vhVE8ggcNfixW-4)
## **Clickup Task**
[Clickup Link](https://app.clickup.com/t/86enh2twx)
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed |  |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br /> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |