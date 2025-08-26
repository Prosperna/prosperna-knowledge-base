---
id: schedule-next-day-delivery
title: Schedule Next Day Delivery
sidebar_label: Schedule Next Day Delivery
sidebar_position: 1
---

# Checkout | Delivery Time | Schedule Next Day Delivery

## Executive **Summary**
The **Schedule Next Day Delivery** feature enables merchants to offer consumers more flexible delivery and pickup options. It ensures that when stores are **closed**, customers can still schedule their orders for the **following day**, improving both operational efficiency and customer satisfaction. Consumers can schedule deliveries or pickups during checkout using a date and time picker with 15-minute intervals and a **30-minute preparation buffer**. This enhancement improves the overall delivery experience, operational efficiency, and customer satisfaction.
## Background
Merchants can already configure **store hours** per location in Location Settings. However, when the store is closed, consumers cannot schedule an order for later on the same day — the **“Later”** tab is disabled in the checkout page, preventing them from placing an order.
This causes a loss of sales opportunities when customers visit the store outside of business hours but still want to schedule a delivery or pickup.
The **Schedule Next Day Delivery** feature solves this by allowing customers to:
*   Click on the **“Later”** tab, even if the store is closed.
*   Select a delivery/pickup time for the **next available day**.
*   See the current date disabled in the date picker when store hours have ended.
This ensures customers can always place orders, even after store hours, while giving merchants enough lead time to prepare.
## Business Objective
*   Allow customers to **schedule next-day orders**, even outside store hours.
*   Prevent loss of orders due to disabled “Deliver Later” option when store is closed.
*   Give merchants more flexibility while maintaining operational efficiency with **buffer times and intervals**.
*   Improve **customer convenience**, leading to higher order completion rates and satisfaction.
## **Scope of Solution**
### In Scope
1. **Location Settings (Merchant)**
    *   Add a **toggle switch** in each store location’s settings to enable/disable Schedule Next Day Delivery.
    *   Per shipping method, merchant can enable/disable next day delivery:
        *   Same-day delivery
        *   Manual shipping (customer & merchant)
        *   Scheduled delivery
        *   Store pickup
2. **Checkout Page (Consumer)**
    *   Display **Now** and **Later** tabs.
    *   If store is **open**, “Later” tab shows available time slots for the same day.
    *   If store is **closed** and schedule next day delivery is enabled, “Later” tab remains enabled but:
        *   Current day is disabled in the **date picker**.
        *   Consumer can only select the **next available day**.
    *   Show **date & time picker** (15-min intervals, **30-min buffer**).
    *   Show **error note** if store is closed and schedule next day delivery is enabled to inform consumer that the store is closed, and they can schedule their order for the next available day.
3. **Order Management & Notifications**
    *   Order details in merchant dashboard display:
        *   Delivery time or pickup time (label changes depending on shipping method).
    *   Invoices and email confirmations include:
        *   Scheduled delivery/pickup time.
    *   Dashboard table adds Due Date column for scheduled orders.
### Out of Scope
*   Standard Delivery (J&T) due to 8-day lead time.
## Scenarios
*   **Buffer Time Calculation**: The system adds 30 minutes to the current time to ensure adequate preparation time for the delivery.
    *   **Time Format**: Delivery time should be displayed in the format: HH:MM AM/ or PM.
    *   **Available Times**: The system should only display delivery times from `current time + 30 minutes` to the store's closing time.
    *   **Affected Shipping Methods:** Same Day Delivery - Lalamove, Manual Booking for Merchant (for future enhancement), Scheduled Delivery - Lalamove
*   **Sample Scenarios:**
    *   **Example: For Same Day** Store Hours: 8 AM - 5 PM
        *   **Scenario #1:** before opening
            *   Current date and time: July 8, 2024 7:45 AM
            *   Add buffer time of 30 mins to opening hour
            *   Next available delivery time is 8:30 AM
            *   Hide 8 AM - 8:15 AM and display 8:30 AM as the next available time of delivery
            *   Placeholder = MMM DD, YYYY 8:30 AM
            *   See illustration below:
            *   ![](https://t7537039.p.clickup-attachments.com/t7537039/66a5a2b5-36ca-48f0-9952-484ad0f1bf2e/image.png)

*   *    *  **Scenario #2:** after opening
            *   Current time: July 8, 2024 8:01 AM
            *   Add buffer time of 30 mins to opening hour
            *   Since next available time (8:31 AM) exceeds 8:30 AM, next available delivery time is 8:45 AM
            *   Hide 8 AM - 8:30 AM and display 8:45 AM as the next available time of delivery
            *   Placeholder = MMM DD, YYYY 8:45 AM

*   *    *  **Scenario #3:** before closing
            *   Current time: July 8, 2024 4:32 PM
            *   Add buffer time of 30 mins
            *   Since next available time (5:02 PM) exceeds closing time, consumer can no longer select Later as the preferred delivery time
            *   Disable “Later” button

*   *    *  **Scenario #4:** before closing
            *   Current time: July 8, 2024 4:30 PM
            *   Add buffer time of 30 mins
            *   Next available delivery time is 5 PM which is the last available option since it is the closing time
            *   Hide 8 AM - 4:30 PM and display 5 PM as the next and only available time of delivery
            *   Placeholder = MMM DD, YYYY 5:00 PM

*   *   **Example: For Scheduled Delivery** Store Hours: 8 AM - 5 PM
        *   **Scenario #1:** before closing
            *   Current time: July 8, 2024 4:32 PM
            *   Add buffer time of 30 mins
            *   Since next available time (5:02 PM) exceeds closing time, consumer can no longer select a time slot for the current date
            *   Consumer can choose a different date
            *   Placeholder should display the next available date and time
            *   Placeholder = MMM DD, YYYY 8:30 AM
## Userflow
Buffer Time to Delivery Time
![](https://t7537039.p.clickup-attachments.com/t7537039/c847237b-decf-4242-bf73-36e80145fdb7/image.png)
## Business Requirements

| **ID** | **Business Requirement** | **Description / Logic** |
| ---| ---| --- |
| **BR-001** | Location Settings Control | The system must provide merchants with a **toggle switch** in the Location Settings of each store location to enable/disable the **Schedule Next Day Delivery** feature. |
| **BR-002** | Shipping Methods Affected | **Schedule Next Day Delivery** is available for Same-day delivery, Manual shipping (customer & merchant managed), Scheduled delivery, Store pickup. |
| **BR-003** | Deliver Now vs Later Options in Checkout | Checkout must display the delivery time section with the **Now** and **Later** tabs |
| **BR-004** | Store Open Handling | If the store is **open**, consumers may select same-day slots from the date/time picker.<br />• 30-minute buffer applies<br />• Time slots shown in 15-min intervals |
| **BR-005** | Store Closed Handling | If the store is **closed** and **Schedule Next Day Delivery** is enabled, the **Later** tab must remain accessible but:<br />• Current date disabled in date picker<br />• Only **next available day** can be selected |
| **BR-006** | Store Closed Handling | If the store is **closed** and **Schedule Next Day Delivery** is disabled, the **Later** tab must be disabled. Consumer cannot schedule their order for a later date and time.<br /> |
| **BR-007** | Error Messaging After Hours | If consumers attempt scheduling during closed hours: show error note → _“Note: The store is currently closed. You can still schedule your order for delivery by selecting a date and time."_ |
| **BR-008** | Time Slot Buffer Rule | Enforce a **30-minute buffer** after the current time before the earliest time slot can be scheduled. |
| **BR-009** | Time Slot Interval Rule | Provide selectable slots in **15-minute intervals** for all delivery time picker. |
| **BR-010** | Order Dashboard Enhancements | Merchant and consumer order dashboards must display scheduled **delivery or pickup time**, labeled correctly (Delivery Time vs Pickup Time). |
| **BR-011** | Invoices & Notifications Update | Invoices, order emails, and notifications must display scheduled time with proper labels (Delivery Time vs Pickup Time). |
| **BR-012** | Due Date Column in Orders Table | Orders dashboard must include a **Due Date column** for quick visibility of scheduled orders. |

## **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 01** | Merchant | Enable / Disable Consumer to Schedule Next Day Delivery/Pickup<br /> | To allow the merchant to enable or disable consumers from scheduling delivery/pickup for the next day when checkout occurs beyond store closing hours. | **HIGH** |
| **UC 02** | System | **Display Delivery Date & Time Picker in Checkout Page** | To allow consumers to select delivery date and time during checkout depending on merchant location settings. | **HIGH** |
| **UC 03** | Consumer | **Select Delivery Date for Standard Delivery** | To allow the consumer to select a delivery date for Standard Delivery, ensuring only valid dates starting from the 8th day after the current date are available. | **HIGH** |
| **UC 04** | Consumer | **Select Delivery Time for Same Day Delivery**<br /> | To allow the consumer to select a valid delivery date and time for Same Day Delivery, depending on store hours and location settings. | **HIGH** |
| **UC 05** | Consumer | **Select Pickup Time for Manual Shipping by Customer**<br /> | To allow the consumer to select a valid delivery date and time when opting for Manual Shipping (customer arranges delivery). | **HIGH** |
| **UC 06** | Consumer | **Select Delivery Time for Manual Shipping by Merchant**<br /> | To allow the consumer to select a valid delivery date and time when the merchant is manually handling shipping. | **HIGH** |
| **UC 07** | Consumer | **Select Pickup Time for Store Pickup**<br /> | To allow the consumer to schedule a valid **pickup date & time** when merchant is handling store pickup manually. | **HIGH** |
| **UC 08** | Consumer | **Checkout and Schedule Delivery Date & Time of Order** | To allow consumers to checkout, schedule a delivery/pickup date and time, complete payment, and create an order in the system. | **HIGH** |
| **UC 09** | System | **Display Delivery Time vs Pickup Time field in Order Details and Invoice** | To ensure that the system displays the correct label ("Delivery Time" or "Pickup Time") across consumer and merchant dashboards, notifications, and invoices based on the selected shipping method. | **HIGH** |

### **Use Case Description Tables**
### Store Locations Settings > Schedule Next Day Delivery
#### UC 01 | Enable / Disable Consumer to Schedule Next Day Delivery/Pickup
![](https://t7537039.p.clickup-attachments.com/t7537039/13d0445c-9716-4d65-8cc8-e2bc63216595/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-001 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 26, 2025 |
| **Objectives** | To allow the merchant to enable or disable consumers from scheduling delivery/pickup for the next day when checkout occurs beyond store closing hours. |
| **Actor** | Merchant (primary), Consumer (secondary) |
| **Preconditions** | \- Merchant is logged in to the system.<br />\- Merchant is in the **Location Settings** page. |
| **Conditions** | \- **Condition 1**: Merchant turns **ON** the next-day delivery/pickup toggle switch.<br />\- **Condition 2**: Merchant turns **OFF** the next-day delivery/pickup toggle switch. |
| **Steps** | **Condition 1: Merchant turns ON the toggle switch**<br />1\. Merchant is in the **Location Settings** page.<br />2\. Merchant either **adds** or **edits** a location.<br />  • System displays a **modal window**.<br />  • Merchant sees the toggle switch for **Schedule Next-Day Delivery/Pickup** (see design).<br />3\. Merchant turns the toggle switch **ON**.<br />  • System enables the option for consumers to schedule next-day delivery/pickup during checkout.<br />4\. Consumer goes to **Checkout page > Shipping Info**.<br />  • Consumer selects a shipping method:<br />    - Same Day Delivery<br />    - Manual Shipping by Merchant<br />    - Manual Shipping by Customer<br />    - Store Pickup<br />5\. System checks the **current time against merchant’s closing hours**:<br />  - **If yes (beyond closing hours):**<br />    • System displays a note: _“The store is currently closed. You can schedule your delivery/pickup for the next available day.”_ (see design).<br />    • Consumer clicks the **Later** button.<br />    • System displays the **Delivery/Pickup Time Scheduler**.<br />    • System enables the **next available date** in the date picker and automatically selects it.<br />    • Consumer sees the **current date disabled**.<br />    • System enables the consumer to select a time slot from the **opening to closing hours** of the store.<br />  - **If no (within store hours):**<br />    • Consumer can still use “Now” or schedule for **Later today** (standard flow).<br /><br />**Condition 2: Merchant turns OFF the toggle switch**<br />1\. Merchant is in the **Location Settings** page.<br />2\. Merchant either **adds** or **edits** a location.<br />  • System displays a **modal window**.<br />  • Merchant sees the toggle switch for **Next-Day Delivery/Pickup** (see design).<br />3\. Merchant turns the toggle switch **OFF**.<br />4\. System disables the option to schedule next-day delivery for consumers.<br />5\. System disables the **Later** button for scheduling future delivery/pickup.<br />6\. Consumer can **only choose “Now”** (if within store hours).<br /><br />**Tooltip for Merchants:**<br />\- When hovering over the tooltip, the system displays:<br />_“For the following shipping methods that support scheduled delivery: Same Day Delivery, Manual Shipping by Customer or Merchant, Store Pickup — if a customer checks out after your closing hours, you can allow them to schedule the delivery/pickup of their order on the next available date and time. If the current time is beyond closing hours, they can select a delivery/pickup time on the following day.”_ |
| **Postconditions** | \- If toggle is ON, consumers can schedule delivery/pickup for the next day after closing hours.<br />\- If toggle is OFF, consumers cannot schedule next-day delivery/pickup. |
| **Business Trigger** | Merchant configures location settings by enabling or disabling **Next-Day Delivery/Pickup**. |
| **Acceptance Criteria** | \- System must correctly enable/disable the **Later** option based on merchant’s toggle setting.<br />\- Consumers must only see available scheduling options depending on store hours and toggle status.<br />\- The next available date must auto-populate when the store is closed and toggle is ON. |
| **Estimates** | \[To be determined by development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- Checkout<br />\- Store Settings<br />\- Locations Settings<br /> |

### Checkout Page
#### **UC 02 | Display Delivery Date & Time Picker in Checkout Page**

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-002 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 23, 2025 |
| **Objectives** | To allow consumers to select delivery date and time during checkout depending on merchant location settings. |
| **Actor** | System |
| **Preconditions** | \- Consumer is on the Checkout page<br />\- Consumer has selected **Delivery** or **Store Pickup** option<br />\- Consumer has filled in the required contact and delivery details |
| **Conditions** | \- **Condition 1:** "Schedule delivery/pickup for next day" is **turned OFF** in location settings<br />\- **Condition 2:** "Schedule delivery/pickup for next day" is **turned ON** and current time is **after closing time**<br />\- **Condition 3:** "Schedule delivery/pickup for next day" is **turned ON** and current time is **before closing time** |
| **Steps** | Consumer is in Checkout page<br />2\. Consumer selects either Delivery or Store Pickup<br />3\. Consumer fills in required fields<br />4\. Consumer selects a shipping method from the list:<br />Standard Delivery<br />Same Day Delivery<br />Manual Shipping by Customer<br />Manual Shipping by Merchant<br />Store Pickup<br />Schedule Delivery (if Custom Delivery Date is enabled in store settings)<br />5\. System expands the accordion for that shipping method and displays the delivery date & time section with two tabs:<br />**Now**<br />**Later**<br />6\. Consumer can see that the **Later** tab is enabled.<br />5\. Consumer clicks the **Later** tab.<br />6\. System displays the **date and time picker section**, allowing the consumer to choose their preferred delivery date and time (if applicable), with the format: `Month Day, Year HH:MM AM/PM`<br />e.g. August 25, 2023 12:52 PM<br /> |
| **Postconditions** | Consumer can either:<br />\- Proceed with **Now** (immediate delivery)<br />\- Or proceed with **Later** (scheduled delivery), if enabled. |
| **Business Trigger** | Consumer selects a shipping method during checkout. |
| **Acceptance Criteria** | \- The **Now** tab must always be displayed.<br />\- The **Later** tab should be enabled<br />\- The system should only allow valid dates and times in the picker. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />- Consumer can select a delivery date and time for all shipping methods so merchant can ensure timely delivery of orders<br />Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping<br />- Orders<br /> |

#### **UC 03 | Select Delivery Date for Standard Delivery**
![](https://t7537039.p.clickup-attachments.com/t7537039/9ef783fa-d9a2-4e3a-bcda-7baff80a0e75/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-003 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 23, 2025 |
| **Objectives** | To allow the consumer to select a delivery date for Standard Delivery, ensuring only valid dates starting from the 8th day after the current date are available. |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is on the Checkout page<br />\- Consumer has selected **Delivery** option<br />\- Consumer has filled in all required contact and delivery details |
| **Conditions** | \- Condition 1: Consumer chooses **Standard Delivery** as the shipping method |
| **Steps** | **Condition 1 (Standard Delivery):**<br />1\. Consumer is on the Checkout page.<br />2\. Consumer selects **Delivery** as the order fulfillment method.<br />3\. Consumer fills in the required contact and shipping details fields.<br />4\. Consumer selects **Standard Delivery** as the shipping method.<br />5\. System expands the accordion for Standard Delivery and displays the delivery date & time section with two tabs: **Now** and **Later**.<br />6\. System ensures the **Later** tab is enabled.<br />7\. Consumer clicks the **Later** tab.<br />8\. System displays the **date picker**.<br />9\. System detects the current date and time.<br />10\. System automatically highlights/selects the **current date** in the date picker.<br />11\. Consumer views the placeholder of the delivery date field showing the **current date**.<br />12\. Consumer clicks on the date picker to choose another date.<br />13\. System enforces the date restriction rule: only dates **starting from the 8th day after the current date** are enabled/selectable; all earlier dates are disabled.<br />14\. Consumer selects a preferred date (must be more than or 8 days after today).<br />15\. System updates the placeholder to display the **selected delivery date**. |
| **Postconditions** | Consumer successfully selects a valid delivery date for Standard Delivery, which will be used in order fulfillment. |
| **Business Trigger** | Consumer chooses **Standard Delivery** as shipping method during checkout. |
| **Acceptance Criteria** | \- The **Later** tab must always be enabled for Standard Delivery.<br />\- The **date picker** must automatically highlight the current date when opened.<br />\- The system must only allow dates starting **8 days after the current date**.<br />\- The selected date must be displayed in the delivery date placeholder after selection. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- "Please select a valid delivery date (available from \[Date+8\] onwards)."<br />\- "Selected date is not available for Standard Delivery." |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping<br />- Orders<br /> |

#### **UC 04 | Select Delivery Time for Same Day Delivery**
![](https://t7537039.p.clickup-attachments.com/t7537039/7893d124-306b-4c90-b665-e87621b6eea2/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-004 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 23, 2025 |
| **Objectives** | To allow the consumer to select a valid delivery date and time for Same Day Delivery, depending on store hours and location settings. |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is on the Checkout page<br />\- Consumer has selected **Delivery** option<br />\- Consumer has filled in all required contact and delivery details |
| **Conditions** | \- Condition 1: Store is **open** and current time is **before closing hours**<br />\- Condition 2: Store is **closed**, but **Schedule Next Day Delivery** toggle is ON<br />\- Condition 3: Store is **closed**, and **Schedule Next Day Delivery** toggle is OFF |
| **Steps** | **Condition 1 (Store open, before closing hours):**<br />1\. Consumer is on the Checkout page.<br />2\. Consumer selects **Delivery** as order fulfillment.<br />3\. Consumer fills in required contact and delivery details.<br />4\. Consumer selects **Same Day Delivery** as shipping method.<br />5\. System expands accordion and displays **Now** and **Later** tabs.<br />6\. System detects that store is open and current time is before closing → Later tab is enabled.<br />7\. Consumer clicks **Later** tab.<br />8\. System displays the **date & time picker**.<br />9\. System detects current date and current time + 30 minutes (buffer).<br />10\. Placeholder shows today’s date and **current time + 30 minutes**.<br />11\. Consumer clicks on date & time picker.<br />12\. System enables only the current date, disabling future dates.<br />13\. System displays available time slots in **15-minute intervals**, starting from current time + 30 minutes until closing.<br />14\. Consumer selects preferred date and time.<br />15\. System updates placeholder with selected **date and time**.<br /><br />**Condition 2 (Store closed, Schedule Next Day Delivery ON):**<br />1\. Steps 1–4 same as above.<br />2\. System expands accordion and displays **Now** and **Later** tabs.<br />3\. Since store is closed, system checks **Schedule Next Day Delivery** toggle.<br />4\. Toggle is ON → Later tab is enabled.<br />5\. Consumer clicks **Later** tab.<br />6\. System displays the **date & time picker**.<br />7\. System displays an error message: **"Note: The store is currently closed. You can still schedule your order for delivery by selecting a date and time."** (see design)<br />8\. System automatically selects the **next day** and **store opening hour** as default placeholder.<br />9\. Consumer clicks date & time picker.<br />10\. System enables **next day only**, and disables other dates.<br />11\. System shows available time slots in **15-minute intervals**, starting from store opening time.<br />12\. Consumer selects preferred date and time.<br />13\. System updates placeholder with selected **date and time**.<br /><br />**Condition 3 (Store closed, Schedule Next Day Delivery OFF):**<br />1\. Steps 1–4 same as above.<br />2\. System expands accordion and displays **Now** and **Later** tabs.<br />3\. Since store is closed and toggle is OFF → System disables Later tab.<br />4\. Consumer cannot schedule for next day → only **Now** option is available. |
| **Postconditions** | Consumer successfully selects a valid date and time (if allowed by store hours and toggle settings) for Same Day Delivery. |
| **Business Trigger** | Consumer selects **Same Day Delivery** as shipping method during checkout. |
| **Acceptance Criteria** | \- **Later tab** must follow rules for store hours and toggle status.<br />\- If store is open, system allows same-day scheduling with **current date only**.<br />\- If store is closed but toggle is ON, system defaults to **next day opening time**.<br />\- If store is closed and toggle is OFF, Later tab is disabled.<br />\- Time slots must always be displayed in **15-minute intervals**. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping<br />- Orders<br /> |

#### **UC 05 | Select Pickup Time for Manual Shipping by Customer**
![](https://t7537039.p.clickup-attachments.com/t7537039/6498e97e-b600-43e7-b2f2-3d4fb8c7ade4/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-005 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 23, 2025 |
| **Objectives** | To allow the consumer to select a valid delivery date and time when opting for Manual Shipping (customer arranges delivery). |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is on the **Checkout page**<br />\- Consumer has selected **Delivery** option<br />\- Consumer has filled in all required contact and delivery details |
| **Conditions** | \- Condition 1: Store is **open** and current time is **before closing hours**<br />\- Condition 2: Store is **closed**, but **Schedule Next Day Delivery** toggle is ON<br />\- Condition 3: Store is **closed**, and **Schedule Next Day Delivery** toggle is OFF |
| **Steps** | **Condition 1 (Store open, before closing hours):**<br />1\. Consumer is on Checkout page.<br />2\. Consumer selects **Delivery**.<br />3\. Consumer fills required contact and delivery details.<br />4\. Consumer selects **Manual Shipping by Customer** as shipping method.<br />5\. System expands accordion and displays **Now** and **Later** tabs.<br />6\. System detects store is open and current time before closing → Later tab enabled.<br />7\. Consumer clicks **Later** tab.<br />8\. System displays **date & time picker**.<br />9\. System detects current date and current time + 30 minutes (buffer).<br />10\. System sets placeholder = **today’s date** + **current time + 30 minutes**.<br />11\. Consumer clicks picker.<br />12\. System enables only the **current date** (future dates disabled).<br />13\. System shows time slots in **15-min intervals** until store closing.<br />14\. Consumer selects preferred date & time.<br />15\. System updates placeholder with selected values.<br /><br />**Condition 2 (Store closed, Schedule Next Day Delivery ON):**<br />1\. Steps 1–4 same as above.<br />2\. System expands accordion → shows **Now** and **Later** tabs.<br />3\. Since store is closed, system checks **Schedule Next Day Delivery** toggle.<br />4\. Toggle is ON → Later tab enabled.<br />5\. Consumer clicks **Later** tab.<br />6\. System shows **date & time picker**.<br />7\. System displays an error message: **"Note: The store is currently closed. You can still schedule your order for delivery by selecting a date and time."** (see design)<br />8\. System automatically selects the **next day** and **store opening hour** as default placeholder.<br />9\. Consumer clicks date & time picker.<br />10\. System enables **next day only**, and disables other dates.<br />11\. System shows available time slots in **15-minute intervals**, starting from store opening time.<br />12\. Consumer selects preferred date and time.<br />13\. System updates placeholder with selected **date and time**.<br /><br />**Condition 3 (Store closed, Schedule Next Day Delivery OFF):**<br />1\. Steps 1–4 same as above.<br />2\. System expands accordion → shows **Now** and **Later** tabs.<br />3\. Store is closed + toggle OFF → Later tab disabled.<br />4\. Consumer cannot schedule → only **Now** option available. |
| **Postconditions** | \- Consumer selects a valid date & time for Manual Shipping<br />\- Selection is stored and displayed in checkout summary |
| **Business Trigger** | Consumer selects **Manual Shipping by Customer** as delivery method during checkout. |
| **Acceptance Criteria** | \- Later tab behavior must match store status and toggle rules.<br />\- Buffer time of +30 minutes applies when store is open.<br />\- Next day scheduling only available if toggle is ON.<br />\- Time slots shown in **15-min intervals**. |
| **Estimates** | \[To be determined by dev team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping<br />- Orders<br /> |

#### **UC 06 | Select Delivery Time for Manual Shipping by Merchant**
![](https://t7537039.p.clickup-attachments.com/t7537039/69b2b462-79e2-4e60-a4ea-7e05d3ad4997/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-006 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 23, 2025 |
| **Objectives** | To allow the consumer to select a valid delivery date and time when the merchant is manually handling shipping. |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is on the **Checkout page**<br />\- Consumer has selected **Delivery** option<br />\- Consumer has filled in all required contact and delivery details |
| **Conditions** | \- Condition 1: Store is **open** and current time is **before closing hours**<br />\- Condition 2: Store is **closed**, but **Schedule Next Day Delivery** toggle is ON<br />\- Condition 3: Store is **closed**, and **Schedule Next Day Delivery** toggle is OFF |
| **Steps** | **Condition 1 (Store open, before closing hours):**<br />1\. Consumer is on Checkout page.<br />2\. Consumer selects **Delivery**.<br />3\. Consumer fills in contact and delivery details.<br />4\. Consumer selects **Manual Shipping by Merchant** as shipping method.<br />5\. System expands accordion and displays **Now** and **Later** tabs.<br />6\. System detects store is open and time is before closing → Later tab enabled.<br />7\. Consumer clicks **Later** tab.<br />8\. System displays **date & time picker**.<br />9\. System detects current date and adds 30 minutes buffer to current time.<br />10\. Placeholder shows **today’s date + buffered time**.<br />11\. Consumer clicks picker.<br />12\. System only enables **current date** (future dates disabled).<br />13\. System shows available times in **15-min intervals** until closing.<br />14\. Consumer selects preferred date & time.<br />15\. System updates placeholder with selected values.<br /><br />**Condition 2 (Store closed, Schedule Next Day Delivery ON):**<br />1\. Steps 1–4 same as above.<br />2\. System expands accordion → shows **Now** and **Later** tabs.<br />3\. Store is closed, system checks **Schedule Next Day Delivery toggle**.<br />4\. Toggle ON → Later tab enabled.<br />5\. Consumer clicks **Later** tab.<br />6\. System shows **date & time picker**.<br />7\. System displays an error message: **"Note: The store is currently closed. You can still schedule your order for delivery by selecting a date and time."** (see design)<br />8\. System automatically selects the **next day** and **store opening hour** as default placeholder.<br />9\. Consumer clicks date & time picker.<br />10\. System enables **next day only**, and disables other dates.<br />11\. System shows available time slots in **15-minute intervals**, starting from store opening time.<br />12\. Consumer selects preferred date and time.<br />13\. System updates placeholder with selected **date and time**.<br /><br />**Condition 3 (Store closed, Schedule Next Day Delivery OFF):**<br />1\. Steps 1–4 same as above.<br />2\. System expands accordion → shows **Now** and **Later** tabs.<br />3\. Store closed + toggle OFF → Later tab disabled.<br />4\. Consumer can only select **Now** option (immediate processing). |
| **Postconditions** | \- Consumer’s chosen delivery date & time is stored and displayed in checkout summary<br />\- Merchant receives the order with selected delivery schedule |
| **Business Trigger** | Consumer selects **Manual Shipping by Merchant** during checkout. |
| **Acceptance Criteria** | \- Delivery date & time scheduling follows store hours and toggle settings.<br />\- Buffer time of +30 minutes applied when store is open.<br />\- Next day scheduling allowed only if toggle is ON.<br />\- Time slots shown in **15-min intervals**. |
| **Estimates** | \[To be determined by dev team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping<br />- Orders<br /> |

#### **UC 07 | Select Pickup Time for Store Pickup**
![](https://t7537039.p.clickup-attachments.com/t7537039/b73f443e-f5b8-401d-9591-762f6580e51d/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-007 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 23, 2025 |
| **Objectives** | To allow the consumer to schedule a valid **pickup date & time** when merchant is handling store pickup manually. |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is on the **Checkout page**<br />\- Consumer has selected **Store Pickup** option<br />\- Consumer has filled in all required contact details |
| **Conditions** | \- **Condition 1:** Store is **open** and current time is **before closing hours**<br />\- **Condition 2:** Store is **closed**, but **Schedule Next Day Delivery/Pickup** toggle is ON<br />\- **Condition 3:** Store is **closed**, and **Schedule Next Day Delivery/Pickup** toggle is OFF |
| **Steps** | **Condition 1 (Store open, before closing hours):**<br />1\. Consumer is on Checkout page.<br />2\. Consumer selects **Store Pickup**.<br />3\. Consumer fills in required details.<br />4\. System shows **Pickup Date & Time** section with **Now** and **Later** tabs.<br />5\. System detects store is open and time is before closing → Later tab enabled.<br />6\. Consumer clicks **Later** tab.<br />7\. System displays an error message: **"Note: The store is currently closed. You can still schedule your order for delivery by selecting a date and time."** (see design)<br />8\. System automatically selects the **next day** and **store opening hour** as default placeholder.<br />9\. Consumer clicks date & time picker.<br />10\. System enables **next day only**, and disables other dates.<br />11\. System shows available time slots in **15-minute intervals**, starting from store opening time.<br />12\. Consumer selects preferred date and time.<br />13\. System updates placeholder with selected **date and time**.<br /><br />**Condition 2 (Store closed, Schedule Next Day Delivery/Pickup ON):**<br />1\. Steps 1–3 same as above.<br />2\. System expands accordion → shows **Now** and **Later** tabs.<br />3\. Store is closed, system checks **Schedule Next Day Delivery/Pickup toggle**.<br />4\. Toggle ON → Later tab enabled.<br />5\. Consumer clicks **Later** tab.<br />6\. System shows **date & time picker**.<br />7\. Default placeholder = **next day + store opening hour**.<br />8\. Consumer clicks picker.<br />9\. System enables **next day only**, disables further dates.<br />10\. System shows available time slots in **15-min intervals** starting from store opening.<br />11\. Consumer selects preferred slot.<br />12\. System updates placeholder with selected values.<br /><br />**Condition 3 (Store closed, Schedule Next Day Pickup OFF):**<br />1\. Steps 1–3 same as above.<br />2\. System expands accordion → shows **Now** and **Later** tabs.<br />3\. Store closed + toggle OFF → Later tab disabled.<br />4\. Consumer can only select **Now** option (immediate pickup once store opens). |
| **Postconditions** | \- Consumer’s chosen **pickup date & time** is stored and displayed in checkout summary<br />\- Merchant receives order with scheduled pickup details |
| **Business Trigger** | Consumer selects **Store Pickup** option during checkout. |
| **Acceptance Criteria** | \- Pickup scheduling follows store hours and toggle settings.<br />\- Buffer time of +30 minutes applied when store is open.<br />\- Next day scheduling allowed only if toggle is ON.<br />\- Time slots shown in **15-min intervals**. |
| **Estimates** | \[To be determined by dev team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping<br />- Orders<br /> |

#### **UC 08 | Checkout and Schedule Delivery Date & Time of Order**
![](https://t7537039.p.clickup-attachments.com/t7537039/79093714-56e5-40e1-9c84-c01e0063552d/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-008 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 26, 2025 |
| **Objectives** | To allow consumers to checkout, schedule a delivery/pickup date and time, complete payment, and create an order in the system. |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is logged in or has provided necessary contact details.<br />\- Store has at least one shipping method enabled.<br />\- Payment methods are set up in the store. |
| **Conditions** | \- Condition 1: Consumer selects **Delivery**.<br />\- Condition 2: Consumer selects **Store Pickup**.<br />\- Condition 3: Shipping method is **Same Day Delivery** with Lalamove as courier (payment restricted).<br />\- Condition 4: Shipping method is **Standard Delivery, Manual Shipping, or Schedule Delivery**. |
| **Steps** | **Common Steps for All Conditions:**<br />1\. Consumer adds a product to the cart.<br />2\. Consumer clicks the **Checkout** button.<br />3\. System redirects to the **Checkout Page**.<br />4\. Consumer selects either **Delivery** or **Store Pickup**.<br />5\. Consumer fills in required fields (contact, address, pickup info).<br />6\. Consumer selects a **shipping method** (Standard Delivery, Same Day Delivery, Manual Shipping by Customer, Manual Shipping by Merchant, Store Pickup, Schedule Delivery).<br />7\. System expands accordion and shows **Delivery/Pickup Time options**: **Now** and **Later**.<br />8\. Consumer sees that **Later tab is enabled**.<br />9\. Consumer selects **Later** tab.<br />10\. System displays the **date & time picker**.<br />11\. Consumer clicks on the picker and selects a **date & time**.<br />12\. Consumer optionally inputs **order notes**.<br /><br />**Condition 1 (Lalamove Delivery – Same Day or Scheduled Delivery):**<br />13\. Consumer selects **Payment Method**.<br />14\. System expands accordion for payment details.<br />15\. If **Same Day or Schedule Delivery** with **Lalamove courier**:<br />  • System only shows **GCash** and **Credit/Debit Card** as available methods.<br />  • Consumer selects one.<br />  • System starts a **5-minute countdown timer** and displays it.<br />16\. Consumer enters payment details.<br />17\. Consumer clicks **Pay Now / Place Order or other CTA button**.<br /><br />**Condition 2 (Store Pickup or Delivery - Standard, Manual Shipping):**<br />13\. Consumer selects payment method (all available ones).<br />14\. Consumer enters payment details<br />15\. Consumer clicks **Pay Now / Place Order or other CTA button**.<br /><br />**Post Payment (All Conditions):**<br />18\. System saves the selected delivery/pickup time.<br />If consumer selected = "Now", system saves current time as delivery/pickup time<br />If consumer selected = "Later", system saves selected time as delivery/pickup time<br />19\. System creates an order in Merchant’s Order Dashboard.<br />20\. Consumer completes payment process.<br />21\. System confirms payment success and redirects to **Thank You Page**.<br />22\. System sends **order confirmation email + SMS** to consumer.<br />23\. System sends **email, SMS, and in-app notifications** to merchant.<br />24\. System creates an **order entry** in **My Account > My Orders** and generates invoice.<br />25\. System displays Delivery Time or Pickup Time in the email, and order details<br />Merchant Side<br />New Order Email, Status Update Email (see design)<br />Orders Table > Due Date column<br />Single Order Details page (see design)<br />Consumer Side<br />New Order Email, Status Update Email<br />My Account > My Orders Table<br />Invoice (see design)<br /> |
| **Postconditions** | \- Consumer’s order is placed with selected delivery/pickup schedule.<br />\- Merchant sees the order in their dashboard with correct delivery/pickup time. |
| **Business Trigger** | Consumer initiates checkout after adding items to cart. |
| **Acceptance Criteria** | \- Consumer can select valid delivery/pickup date & time.<br />\- System enforces courier/payment restrictions (e.g., Lalamove → only GCash & Card).<br />\- System correctly saves schedule in the order record.<br />\- Notifications are sent to both consumer and merchant. |
| **Estimates** | \[To be determined by dev team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Store Settings<br />- Shipping<br />- Orders<br /> |

### Delivery Time Field
#### UC 09 | **Display Delivery Time vs Pickup Time field in Order Details and Invoice**
![](https://t7537039.p.clickup-attachments.com/t7537039/f6e9a76d-b419-4daf-b6f4-73445a79fca0/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-009 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 26, 2025 |
| **Objectives** | To ensure that the system displays the correct label ("Delivery Time" or "Pickup Time") across consumer and merchant dashboards, notifications, and invoices based on the selected shipping method. |
| **Actor** | Consumer, Merchant, System |
| **Preconditions** | \- Consumer is logged in or proceeding as a guest.<br />\- Merchant has enabled relevant shipping methods in store settings.<br />\- System can generate notifications, invoices, and order records. |
| **Conditions** | \- **Condition 1**: Order is for Pickup (Store Pickup or Manual Shipping by Customer).<br />\- **Condition 2**: Order is for Delivery (Manual Shipping by Merchant, Standard Delivery, Same Day Delivery, Scheduled Delivery). |
| **Steps** | **Common Steps**:<br />1\. Consumer adds a product to the cart.<br />2\. Consumer proceeds to Checkout and fills in billing information.<br />3\. Consumer selects a shipping method.<br />4\. Consumer selects "Later" as the pickup or delivery time.<br />5\. Consumer selects a time using the time picker.<br />6\. Consumer proceeds to Payment and completes the payment process.<br />7\. System confirms successful payment and displays the Thank You page.<br />8\. System sends notifications (email and SMS) to both consumer and merchant regarding the new order.<br />9\. System creates an order entry in consumer’s **My Orders** section and merchant’s **Orders** page.<br />10\. Consumer and merchant can view the scheduled time in order details and invoice.<br /><br />**Condition 1 (Pickup):**<br />1\. Consumer selects **Store Pickup** or **Manual Shipping by Customer**.<br />2\. System saves the selected time as **Pickup Time**.<br />3\. Consumer sees “Pickup Time” in email notification, My Orders section, and Invoice.<br />4\. Merchant sees “Pickup Time” in email notification and Order Details page.<br /><br />**Condition 2 (Delivery):**<br />1\. Consumer selects **Manual Shipping by Merchant, Standard Delivery, Same Day Delivery, or Scheduled Delivery**.<br />2\. System saves the selected time as **Delivery Time**.<br />3\. Consumer sees “Delivery Time” in email notification, My Orders section, and Invoice.<br />4\. Merchant sees “Delivery Time” in email notification and Order Details page. |
| **Postconditions** | \- System correctly labels the scheduled time as either **Pickup Time** or **Delivery Time**.<br />\- Consumers and merchants view consistent and accurate labels across notifications, dashboards, and invoices. |
| **Business Trigger** | Triggered when a consumer places an order with a scheduled delivery or pickup time. |
| **Acceptance Criteria** | \- The system must display **Pickup Time** when Store Pickup or Manual Shipping by Customer is chosen.<br />\- The system must display **Delivery Time** when Manual Shipping by Merchant, Standard Delivery, Same Day Delivery, or Scheduled Delivery is chosen.<br />\- Both merchant and consumer must see the correct label in order details, email notifications, and invoices. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- **Condition 1 (Pickup)**: If pickup time fails to save → “Pickup time could not be saved. Please try again.”<br />\- **Condition 2 (Delivery)**: If delivery time fails to save → “Delivery time could not be saved. Please try again.” |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />- Display either Pickup Time or Delivery Time to all affected notifications, tables, invoices in the following modules:<br />       **1. Merchant Side**<br />           * New Order Email, Status Update Email (see design)<br />           * Orders Table > Due Date column<br />           * Single Order Details page (see design)<br />       **2. Consumer Side**<br />           * New Order Email, Status Update Email<br />           * My Account > My Orders Table<br />           * Invoice (see design)<br />- If shipping method requires order to be delivered directly to consumer (e.g. Manual Shipping by Merchant)<br />   - System displays "Delivery Time" label for the delivery time selected during checkout<br />   - If shipping method requires consumer to manually pickup order from store (e.g. Store Pickup and Manual Shipping by Customer - the driver will be the one to pickup in the store)<br />   - System displays "Pickup Time" label for the pickup time selected during checkout<br />Identify impacted modules (amend if there is something missing)<br />- Checkout<br />- Locations > Store Hours<br />- Shipping Method<br /> |

# **Nonfunctional Requirements**

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | Date/time picker must load within 1 second. | High |
| **Security Requirements** | Only authenticated customers can schedule deliveries. | High |
| **Usability Requirements** | Provide clear tabs (Deliver Now / Deliver Later) with an intuitive date/time picker. | Medium |
| **Reliability Requirements** | Scheduled delivery time must persist after page refresh or customer re-login. | High |
| **Scalability Requirements** | System must support scheduling for multiple store locations. | High |
| **Maintenance & Supportability Requirements** | Must be configurable via admin panel with low maintenance overhead. | Medium |
| **Compatibility Requirements** | Must function seamlessly on both mobile and desktop platforms. | High |
| **Regulatory & Compliance Requirements** | Must comply with SMS/email notification regulations for scheduled deliveries. | High |

# Constraints
*   J&T Standard Delivery excluded (8-day fixed lead time).
*   Scheduling only works for enabled shipping methods.
# Assumptions
*   Merchant has at least one store location configured.
*   Merchant sets proper business hours.
*   System clock is accurate for buffer enforcement.
# Acceptance Criteria

| **ID** | **Requirement** | **Acceptance Criteria** |
| ---| ---| --- |
| AC-001 | Enable/Disable Toggle in Location Settings | Merchant can enable/disable **Schedule Next Day Delivery** per store location in Location Settings. |
| AC-002 | Shipping Methods | Schedule next day delivery is available for all shipping methods (same-day, manual shipping, scheduled delivery, store pickup), except for standard delivery (J&T) |
| AC-003 | Deliver Now/Later Tabs | Checkout shows **Now** and **Later** tabs to schedule delivery time |
| AC-004 | Store Open – Later Tab | If store is open, consumer can select same-day delivery slots with 30-min buffer and 15-min intervals. |
| AC-005 | Store Closed – Later Tab | If store is closed and schedule next day delivery is enabled, the **Later** tab is still accessible. Current date is disabled in the date picker, and the consumer can only select the **next available day**. |
| AC-006 | Error Messaging – Store Closed | When consumer tries to order after hours and schedule next day delivery is enabled, system shows error note: _“Note: The store is currently closed. You can still schedule your order for delivery by selecting a date and time."_ |
| AC-007 | Buffer Time | System enforces 30-min buffer from current time before earliest available slot. |
| AC-008 | Time Intervals | Time slots are displayed in 15-min intervals. |
| AC-009 | Order Dashboard | Merchant and consumer order dashboards display scheduled delivery/pickup time with correct labels. |
| AC-010 | Invoices & Notifications | Invoices and email notifications display correct delivery/pickup schedule. |
| AC-011 | Due Date Column | Merchant and consumer order table includes a “Due Date” column for scheduled orders. |

# **Wireframes**
[Delivery Time](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=10074-13243&t=I3svXbxSnX16bUa8-4)<br />
[Schedule Next Day Delivery](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=4757-12452&t=I3svXbxSnX16bUa8-4)
# **Figma Design File ℅ UX UI Designer**
[Figma File](https://www.figma.com/design/jHbUt2DsH45DpQe4M9ZIVd/Prosperna-User-Flows-3.0?node-id=96-2017&t=jdRRItZzlRgU68HU-4)

| Title | Design |
| ---| --- |
| [Enable / Disable Consumer to Schedule Next Day Delivery/Pickup](https://www.figma.com/design/jHbUt2DsH45DpQe4M9ZIVd/Prosperna-User-Flows-3.0?node-id=96-2017&t=jdRRItZzlRgU68HU-4) | ![](https://t7537039.p.clickup-attachments.com/t7537039/a43aed82-61c4-4a4a-b9bb-3dd964415c1d/image.png) |
| [Select Delivery Time/Pickup Time](https://www.figma.com/design/jHbUt2DsH45DpQe4M9ZIVd/Prosperna-User-Flows-3.0?node-id=96-2017&t=99jQ7URUYXgRXLWL-4) | ![](https://t7537039.p.clickup-attachments.com/t7537039/88a905f6-98bc-4235-9874-a13123bf4570/image.png) |
| [Display Pickup/Delivery Time field in](https://www.figma.com/design/jHbUt2DsH45DpQe4M9ZIVd/Prosperna-User-Flows-3.0?node-id=96-2017&t=99jQ7URUYXgRXLWL-4)<br />Email Notification<br />Display either "Delivery Time" or "Pickup Time"<br /> | ![](https://t7537039.p.clickup-attachments.com/t7537039/61c70791-68c6-4741-9a86-16eac3714873/image.png) |
| [Display Pickup/Delivery Time field in](https://www.figma.com/design/jHbUt2DsH45DpQe4M9ZIVd/Prosperna-User-Flows-3.0?node-id=96-2017&t=99jQ7URUYXgRXLWL-4)<br />My Orders > Invoice<br />Display either "Scheduled Date of Pickup" or "Scheduled Date of Arrival"<br /> | ![](https://t7537039.p.clickup-attachments.com/t7537039/9f2d5959-0862-4887-b73b-986ad5135383/image.png) |
| [Display Pickup/Delivery Time field in](https://www.figma.com/design/jHbUt2DsH45DpQe4M9ZIVd/Prosperna-User-Flows-3.0?node-id=96-2017&t=99jQ7URUYXgRXLWL-4)<br />Single Order Details Page<br />Display either "Delivery Time" or "Pickup Time"<br /> | ![](https://t7537039.p.clickup-attachments.com/t7537039/d9431c55-05c2-4875-9f4c-345fd79b5e80/image.png) |
| [Disabled "Later" button](https://www.figma.com/design/ofRyeNDkeAFr3i8Fwg7DrN/Prosperna---Consumer?node-id=3838-595&t=unHml8owCbX1w7vt-4) | ![](https://t7537039.p.clickup-attachments.com/t7537039/13d894b5-13b7-42be-b5b4-6ce9137101a7/image.png) |

# **Clickup Task**

| Feature | Use Cases Affected | Main Task | Parent Task |
| ---| ---| ---| --- |
| Schedule Next Day Delivery feature | UC 01-09 | [Clickup Link](https://app.clickup.com/t/86eqpr0h7) | [Clickup Link](https://app.clickup.com/t/86ep7kprh) |
| 30-minute Buffer Time feature: | UC 03-07: Select Delivery Date and Time for (Shipping Method) | [Clickup Link](https://app.clickup.com/t/86eumaw0f) |
| Add Delivery Time to Store Pickup and Manual Shipping enhancement | UC 02: Display Delivery Date and Time Picker<br />UC 05-07: Select Delivery Date and Time for Manual Shipping and Store Pickup<br /> | <br />[Clickup Link](https://app.clickup.com/t/86eqqg02f) |

# Signed off

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