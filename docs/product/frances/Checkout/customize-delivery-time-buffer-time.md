---
id: customize-delivery-time-buffer-time
title: Customize Buffer Time
sidebar_label: Customize Buffer Time
sidebar_position: 3
---

# Store Settings | Custom Order Processing Time (Preparation/Buffer Time)

## **Executive Summary**
This feature allows merchants on Pro and Premium plans to customize the preparation and delivery time for orders, enabling more accurate scheduling for consumers during checkout. Merchants can define the processing time in days, hours, or minutes, and the system uses this duration to calculate the next available delivery or pickup time.
* * *
#### **Background**
Currently, the default processing time for all shipping methods is set to 30 minutes. Merchants on higher-tier plans (Pro and Premium) often require greater flexibility to align preparation and delivery times with their operational workflows. By enabling custom order processing time, merchants can enhance operational efficiency and provide more accurate delivery/pickup time windows for consumers.
* * *
#### **Business Objective**
*   Enhance scheduling accuracy by allowing merchants to define custom processing times.
*   Improve merchant satisfaction by providing control over order handling times.
*   Enhance the consumer checkout experience by aligning available delivery/pickup times with realistic preparation timelines.
* * *
#### **Scope of Solution**
**Feature Availability**:
*    Only available to merchants subscribed to Pro and Premium plans.
*    Default preparation time for all plans is 30 minutes.

**Applicable Shipping Methods**:
*   Same Day Delivery
*   Manual Shipping by Merchant
*   Manual Shipping by Customer
*   Store Pickup

**Functionality**:
*   **Configuration**:
        *   Merchants can set a custom processing time in days, hours, or minutes via the Store Settings.
*   **System Consideration**:
        *   The custom preparation time is factored into the calculation of the next available delivery/pickup time during checkout.

**UI Integration**:
*  Access and configuration of processing time settings via the **Store Settings** page.
* * *
#### **Out of Scope**
* Customization of preparation time:
    *   Per product
    *   Per shipping method
    *   Per branch/store location
* Consideration of shipping address location or distance for processing time calculations.
* Standard Delivery (Delivery Date is automatically set by J&T).
* Scheduled Delivery/Custom Delivery Date (already has a preparation time mechanism).
* * *
#### **Business Requirements**

| **BR ID** | **Category** | **Business Requirement** |
| ---| ---| --- |
| **BR-01** | Merchant-Side Configuration | Pro and Premium merchants can access and edit the **custom preparation time** in Store Settings. |
| **BR-02** | Merchant-Side Configuration | Default preparation time is set to **30 minutes** for all plans. |
| **BR-03** | Consumer Checkout Experience | The system dynamically adjusts the **next available delivery/pickup time** based on the custom preparation time defined by the merchant. |
| **BR-04** | Default Behavior | For **Basic plan** merchants, the preparation time is fixed at **30 minutes** and cannot be changed. |
| **BR-05** | Default Behavior | If **Pro/Premium merchants** do not configure a custom time, the system defaults to **30 minutes**. |
| **BR-06** | Validation | The system must ensure the **time entered** by the merchant is in a valid format (days, hours, or minutes). |
| **BR-07** | Error Handling | Display **error messages** if merchants input invalid values. |
| **BR-08** | Error Handling | Display **error messages** if merchants leave required fields blank. |

* * *
#### **Stakeholder Analysis**
*   **Merchants**: Gain flexibility in managing order processing times, leading to better alignment with operational needs.
*   **Consumers**: Benefit from more accurate delivery/pickup time predictions during checkout.
*   **Development Team**: Implement dynamic scheduling logic that integrates seamlessly with existing shipping and checkout workflows.
*   **Customer Support**: Provide assistance with feature setup and troubleshooting for merchants.
* * *

## **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 01** | System<br /> | Display Order Processing Time Settings in Store Settings | Enable merchants to view and configure Preparation Time Settings in the Store Settings section of P1. | **HIGH** |
| **UC 02** | Merchant | Set Custom Order Processing Time | Allow merchants to configure Preparation Time/Buffer Time for order scheduling. | **HIGH** |
| **UC 03** | System | Add Custom Processing Time to Current Time during Order Scheduling in Checkout | Ensure accurate delivery times by adding a buffer to the selected delivery time and displaying available time slots appropriately. | **HIGH** |

### **Use Case Description Tables**
#### **UC 01 | Display Order Processing Time Settings in Store Settings**

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-001 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | November 26, 2024 |
| **Objectives** | Enable merchants to view and configure Preparation Time Settings in the Store Settings section of P1. |
| **Actor** | System |
| **Preconditions** | \- Merchant has a registered account on P1 and is logged in.<br />\- Merchant has access to **Settings > Store** in the platform.<br />\- Merchant is a Pro or Premium user. |
| **Conditions** | \- Condition 1: Merchant with Free/Plus Plan.<br />\- Condition 2: Merchant with Pro or Premium Plan. |
| **Steps** | **Common Steps**:<br />1\. Merchant logs in to P1.<br />2\. Merchant navigates to **Settings > Store**.<br />3\. System displays the **Store Settings** page with the following sections:<br />  • Business Operations<br />  • Temporary Close<br />  • Custom Delivery Date<br />  • **Order Processing Time**<br />  • Locations<br />  • Region<br />  • Facebook Pixel<br />  • Domain<br />  • Scripts & Analytics<br />  • Search Results<br />  • Additional Fee<br />  • Convenience Fee<br />  • Shipping Fee<br />  • Single Product<br /><br />4\. Merchant clicks on **Order Processing Time** in the left sidebar or scrolls to the section.<br />5\. System displays the **Order Processing Time** section with:<br />  • A **Text box** with up/down arrows, default value "30".<br />  • A **Dropdown** for selecting time units (default "Minutes").<br />  • A **Save button**.<br /><br />**Condition 1: Free/Plus Plan**<br />6\. System displays a Crown Icon beside "Order Processing Time", showing it’s an upgrade feature.<br />7\. If merchant clicks Save, system prompts: “Upgrade Now. Step up your game.”<br /><br />**Condition 2: Pro or Premium Plan**<br />6\. System hides the Crown Icon.<br />7\. Merchant can update the Processing Time value and unit.<br />8\. Merchant clicks **Save**.<br />9\. System saves the new Processing Time successfully. |
| **Postconditions** | \- Merchants can view and interact with the Order Processing Time settings.<br />\- Save button behavior depends on merchant’s subscription plan. |
| **Business Trigger** | Merchant navigates to the Order Processing Time section in Store Settings. |
| **Acceptance Criteria** | \- The Order Processing Time section is displayed correctly.<br />\- Save button changes behavior based on subscription level.<br />\- Merchants on Pro/Premium can successfully update values. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- Condition 1 (Free/Plus): “Upgrade Now. Step up your game.”<br />\- Condition 2 (Pro/Premium): \[System error if save fails – e.g., “Unable to save changes. Please try again.”\] |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br /> - tool tip: "Set the amount of time it takes to prepare and deliver an order."<br /> - The order Processing time feature is available for pro and premium plans only<br /> - Default value of processing time for all plans is 30 minutes.<br />Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping Method<br />- Store Hours<br />- Location<br /> |

#### **UC 02 | Set Custom Order Processing Time**

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-002 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | November 26, 2024 |
| **Objectives** | Allow merchants to configure Preparation Time/Buffer Time for order scheduling. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant has a registered account and is logged in to P1.<br />\- Merchant has access to **Settings > Store**. |
| **Conditions** | \- Condition 1: Merchant with Free/Plus Plan.<br />\- Condition 2: Merchant with Pro/Premium Plan. |
| **Steps** | **Common Steps**:<br />1\. Merchant logs in to P1.<br />2\. Merchant navigates to **Settings > Store**.<br />3\. System displays the **Store Settings** page.<br />4\. Merchant goes to the **Order Processing Time** section.<br />5\. Merchant clicks the **Dropdown** for time units.<br />6\. System displays options:<br />  • Minutes<br />  • Hours<br />  • Days<br /><br />**Step Validation Based on Selected Unit**:<br />7\. Merchant selects a unit (Minutes, Hours, Days).<br />8\. Merchant inputs a value in the **Text Box** or uses arrows.<br />9\. System validates input:<br />  • If **Minutes** → Only 0–60 allowed.<br />  • If **Hours** → Only 0–24 allowed.<br />  • If **Days** → Only 0–3 allowed.<br /><br />**Condition 1: Free/Plus Plan**<br />10\. Merchant clicks **Save**.<br />11\. If input is valid, system checks plan.<br />12\. System displays the **Upgrade Now Modal**.<br /><br />**Condition 2: Pro/Premium Plan**<br />10\. Merchant clicks **Save**.<br />11\. If input is invalid → System displays error: “\* Required.”<br />12\. If input is valid → System saves the selected unit/value as preparation/buffer time.<br />13\. System confirms: “Successfully saved Order Processing Time.” |
| **Postconditions** | \- Preparation/buffer time is successfully stored for Pro/Premium plans.<br />\- The buffer time is applied during checkout scheduling when consumers select delivery/pickup. |
| **Business Trigger** | Merchant configures preparation/buffer time in **Store Settings > Preparation Time Settings**. |
| **Acceptance Criteria** | \- The system validates input values based on the selected unit.<br />\- The system shows error if the Text Box is empty.<br />\- The system shows **Upgrade Now** for Free/Plus plans.<br />\- The system saves preparation/buffer time for Pro/Premium plans. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- Empty input: “\* Required.”<br />\- Free/Plus plan: “Upgrade Now. Step up your game.”<br />\- Pro/Premium save failure: “Unable to save changes. Please try again.” |

| **Business Rules/Desired Behavior** |
| --- |
| - Merchant can set the unit of time for the buffer time to Days/Hours/Minutes<br /> - Limits Minutes: 0-60 minutes Hours: 0-24 hours Days: 0-3 days<br /><br />  | 
| Can you checkout after store hours?<br /> - Standard Delivery: Yes because earliest date available for schedule is 8 days from now<br /> - Same Day: No because store is closed and delivery is only available within the day. Yes if schedule next day delivery is on in location settings<br /> - Manual shipping by customer: Yes, you can schedule pickup for later (max 3 days)<br />- Manual shipping by merchant: Yes, you can schedule delivery for later (max 3 days)<br />- Store Pickup: Yes, you can schedule pickup for later (max 3 days)<br /><br /> | 
| If your prep time is 2 days, can a customer checkout after store hours?<br /> - Standard: Not affected due to 8-day lead time<br />- Same Day: No since you can only schedule your order max next day. Should be disabled if prep time is 2 days<br />- Manual shipping by customer: Yes since max 3 days<br />- Manual shipping by merchant: Yes since max 3 days<br />- Store Pickup: Yes since max 3 days<br /><br /> |
| Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping Method<br />- Store Hours<br />- Location<br /> |

#### UC | Add Custom Processing Time to Current Time during Order Scheduling in Checkout
![](https://t7537039.p.clickup-attachments.com/t7537039/c9ae1957-e93e-4006-8fc5-26c9aeb51e3c/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-010 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | November, 2024 |
| **Objectives** | Ensure accurate delivery times by adding a buffer to the selected delivery time and displaying available time slots appropriately. |
| **Actor** | System |
| **Preconditions** | \- Consumer is in **Checkout page > Shipping Method**.<br />\- Consumer selects one of the following shipping methods:<br />  • Same Day Delivery (Lalamove)<br />  • Manual Shipping by Customer<br />  • Manual Shipping by Merchant<br />  • Store Pickup<br />\- Consumer selects **“Later”** as their preferred delivery time. |
| **Conditions** | 1\. Unit of time = Days<br />2\. Unit of time = Hours<br />3\. Unit of time = Minutes |
| **Steps** | 1\. Consumer is in **Checkout page > Shipping Method**.<br />2\. Consumer selects one of the following:<br />  • Delivery tab > Same Day Delivery<br />  • Delivery tab > Manual Shipping by Customer<br />  • Delivery tab > Manual Shipping by Merchant<br />  • Store Pickup tab<br />3\. System displays the **Delivery/Pickup Time** section.<br />4\. Consumer clicks on **“Later”** button.<br />5\. System displays the **Date and Time Picker**.<br />6\. System detects the **current time**.<br />7\. System detects that the merchant saved a **custom buffer/preparation time** in Store Settings:<br />  • System detects the **unit of time** (Days/Hours/Minutes).<br />  • System detects the **value of buffer/preparation time**.<br />  • System adds the custom buffer/preparation time to the current time.<br />8\. Consumer sees the **placeholder** of the date/time picker showing:<br />  Format → _MMM, DD, YYYY HH:MM AM/PM + custom buffer time_ (see Business Rules).<br />9\. Consumer clicks on the **Date and Time Picker**.<br />10\. System displays the **Date and Time Modal**.<br />11\. System:<br />  • Enables the available dates based on buffer time.<br />  • Displays available times from \[**current time + buffer time**\] to \[**closing time**\].<br />12\. Consumer selects a date/time.<br />13\. System saves the selected time as the **Delivery/Pickup Time**. |
| **Postconditions** | \- The selected delivery/pickup time, with buffer added, is saved and displayed accurately. |
| **Business Trigger** | Consumer selects a shipping method requiring a specific delivery/pickup time during checkout. |
| **Acceptance Criteria** | \- The system correctly applies the merchant’s custom buffer (e.g., 30 minutes) to the current time.<br />\- The Delivery Time Picker displays only valid available time slots.<br />\- The selected delivery/pickup time is saved and displayed correctly on order details. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If system fails to fetch buffer settings → “Unable to load delivery time slots. Please try again.”<br />\- If selected time is invalid (earlier than buffer) → “Selected time is not available. Please choose another slot.” |

| **Business Rules/Desired Behavior** |
| --- |
| **Buffer Time Calculation**: The system adds the custom buffer time to the current time to ensure adequate preparation time for the delivery/pickup.<br />**Date and** **Time Format**: Delivery time should be displayed in the format: MMM, DD, YYYY HH:MM AM/PM.<br />**Available Dates and Times**:<br />- The system should only display available dates based on the buffer time saved<br />- The system should display the time options from \[current time + buffer time>\] to the store's closing time.<br />**Affected Shipping Methods:**<br />- Same Day Delivery - Lalamove,<br />- Manual Booking for Customer and Merchant<br />- Store Pickup<br /><br /> | 
 **Sample Scenarios:**<br />**Example:**<br />     - Order Processing time = 2 Days<br />     - Store Hours: 8 AM - 5 PM <br /><br />**Scenario #1:** before opening<br />- Current date and time: July 8, 2024<br />- Disable July 8-9<br />- Enable July 10<br />- Next available delivery date is July 10<br />- Placeholder = July 10, 2024 \[opening hour\]<br />See illustration below:<br />![](https://t7537039.p.clickup-attachments.com/t7537039/aa520926-521a-4ec5-903c-987282552edb/image.png)<br /><br />**Scenario #2:** after opening<br />Current time: July 8, 2024 8:01 AM<br />Add buffer time of 30 mins to opening hour<br />Since next available time (8:31 AM) exceeds 8:30 AM, next available delivery time is 8:45 AM<br />Hide 8 AM - 8:30 AM and display 8:45 AM as the next available time of delivery<br />Placeholder = \[Date\] 8:45 AM<br /><br />**Scenario #3:** before closing<br />Current time: July 8, 2024 4:32 PM<br />Add buffer time of 30 mins<br />Since next available time (5:02 PM) exceeds closing time, consumer can no longer select Later as the preferred delivery time<br />Disable “Later” button<br /><br />**Scenario #4:** before closing<br />Current time: July 8, 2024 4:30 PM<br />Add buffer time of 30 mins<br />Next available delivery time is 5 PM which is the last available option since it is the closing time<br />Hide 8 AM - 4:30 PM and display 5 PM as the next and only available time of delivery<br />Placeholder = \[Date\] 5:00 PM<br /><br /> | 
 Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping Method<br />- Store Hours<br />- Location<br /> |

## **Nonfunctional Requirements**

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | Processing time calculations must not delay checkout and must complete in under 1 second. | High |
| **Security Requirements** | Only authenticated Pro and Premium merchants can access and modify preparation time settings. | High |
| **Usability Requirements** | Preparation time configuration UI must be intuitive and clearly labeled in Store Settings. | Medium |
| **Reliability Requirements** | Preparation time logic must apply consistently across all eligible shipping methods. | High |
| **Scalability Requirements** | System should support future expansions (e.g., per-product or per-location customization). | Medium |
| **Compatibility Requirements** | Must be compatible with existing checkout and shipping modules. | High |

## Constraints
*   Preparation time applies universally across all orders and shipping methods for a given merchant.
*   Limited to the shipping methods and plans outlined in the scope.
## Assumptions
* Pro and Premium plan merchants have access to the Store Settings page to configure preparation times.
* All shipping methods listed in the scope are integrated with the checkout scheduling system.
* Preparation time is a global setting applied across all products, shipping methods, and store locations.
* Default 30-minute preparation time is pre-configured for all plans.
## Acceptance Criteria

| **AC ID** | **Use Case (UC)** | **Acceptance Criteria** |
| ---| ---| --- |
| **AC-01-01** | UC 01 | The **Order Processing Time** section is displayed correctly. |
| **AC-01-02** | UC 01 | The **Save** button changes behavior based on subscription level. |
| **AC-01-03** | UC 01 | Merchants on **Pro/Premium** plans can successfully update values. |
| **AC-02-01** | UC 02 | The system validates **input values** based on the selected unit (e.g., minutes, hours). |
| **AC-02-02** | UC 02 | The system shows an **error message** if the text box is empty. |
| **AC-02-03** | UC 02 | The system shows **“Upgrade Now”** for merchants on **Free/Plus** plans. |
| **AC-02-04** | UC 02 | The system saves **preparation/buffer time** successfully for **Pro/Premium** plans. |
| **AC-03-01** | UC 03 | The system correctly applies the merchant’s **custom buffer time** (e.g., 30 minutes) to the current time. |
| **AC-03-02** | UC 03 | The **Delivery Time Picker** displays only valid available time slots. |
| **AC-03-03** | UC 03 | The selected **delivery/pickup time** is saved and displayed correctly on **order details**. |

## **Wireframes**
[Wireframe](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=11142-15933&t=9iA7eYhVqOYGe8Vm-4)

## **Figma Design File ℅ UX UI Designer**
[Figma File](https://www.figma.com/design/jFexzvVAwl7eVVIl69oI2q/Custom-Order-Processing-Time-(Preparation%2FBuffer-Time)?node-id=0-1&t=t6pxAIjn3Ps1msvu-1)
![](https://t7537039.p.clickup-attachments.com/t7537039/70397106-e553-4238-a01d-c84f0d237ca4/image.png)
## **Clickup Task**
[Clickup Link](https://app.clickup.com/t/86eqqfmv1)
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed | November 26, 2024 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br /> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |