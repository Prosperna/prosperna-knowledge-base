---
id: location-popup-selector
title: View and Select Your Store Location
sidebar_position: 1
---

# Store Location | Pop-up Modal Selector & Tooltip

## **Executive Summary**
This feature introduces a sticky pop-up tooltip/marker that notifies consumers of their current store location when visiting key store pages. It improves location awareness, ensures product availability visibility, and enhances multi-location shopping experiences.
## Background
Currently, consumers can select a store location manually, but there is no persistent visual indicator reminding them which location they are shopping in unless they check the dropdown manually. As aligned with Account Manager, this results to additional shipping costs and refund since the default location might be farther from the consumer's shipping address. Merchants with multiple locations require a consistent experience where consumers are notified and can change store locations easily.
## Business Objective
*   Improve consumer navigation experience in multi-location stores.
*   Reduce purchase confusion and additional shipping costs when inventory and warehouse location differs per store.
*   Encourage consumers to validate their selected store location before proceeding to add product to cart or checkout.
## **Scope of Solution**
#### **In Scope**
*   Available for **paid plans** only.
    *   Available for **merchants with multiple store locations** only.
    *   Display sticky pop-up on specific pages:
        *   Root domain ([storename.prosperna.com](http://storename.prosperna.com) or custom domain)
        *   Homepage
        *   Product Listing page
        *   Single Product page
        *   Cart page
*   Display pop-up on the first page visit, new browser tab session or session inactivity
    *   Display pop-up with the following content [(see design)](https://app.clickup.com/7537039/docs/760cf-58518/760cf-25798?block=block-cd247141-50a3-4d86-b737-a8dca9ffaccd):
        *   Close button
        *   Location icon
        *   Location name
        *   Full address (City, Region, etc.)
        *   “Change” link
*   Allow consumer to change location via the "Change" link
    *   Persist pop-up across navigations/pages until manually closed.
#### **Out of Scope**
*   Pages where no pop-up will be shown upon first page visit, new browser tab session, session inactivity:
*   My Account, My Orders
*   About Us, Terms of Service, Privacy Policy, Return Policy, Contact Us
*   Blogs
*   Custom Pages (Page Builder)
*   Checkout, Thank You, Error, Maintenance Pages
## Business Requirements

| **BR ID** | **Business Requirement** |
| ---| --- |
| **BR-01** | Show sticky store location pop-up only for merchants with multiple store locations. |
| **BR-02** | Detect device type and adjust pop-up placement: **Mobile** → topmost, **Desktop/Tablet** → below mega menu. |
| **BR-03** | Display pop-up only if **Select Store Location modal/page is turned OFF**. |
| **BR-04** | Auto-display pop-up after **full page load** on applicable pages. |
| **BR-05** | Update pop-up if the consumer changes the store location. |
| **BR-06** | Persist pop-up across pages unless manually closed by the consumer. |
| **BR-07** | Clicking **“Change”** redirects the consumer to the **Select Store Location page**. |
| **BR-08** | **Close button** hides pop-up and disables it until the session ends or the tab is refreshed. |

## Stakeholder Analysis

| **Stakeholder** | **Responsibility** |
| ---| --- |
| Merchants (Paid Plans, Multi-location) | Enable smooth store location awareness and switching |
| Consumers | See and verify selected store location |
| Dev Team | Build tooltip logic, detection mechanisms, and UI display |
| QA Team | Validate first-visit behavior, session persistence, responsiveness |
| Product Team | Define UX/UI behavior, ensure functionality alignment with multi-location goals |


## **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 01** | System | Display/Hide Pop-up for Current Store Location Upon First Visit/New Browser Session | Display a tooltip or pop-up for the current store location based on page type, device type, session status, and store location settings. | **HIGH** |
| **UC 02** | Consumer | Display Sticky Store Location Pop-up When Changing Location or Visiting a Different Page | Display a sticky store location pop-up when changing location or visiting a different page | **HIGH** |

### **Use Case Description Tables**
#### UC 01 | Display/Hide Pop-up for Current Store Location Upon First Visit/New Browser Session/Inactive Session
![](https://t7537039.p.clickup-attachments.com/t7537039/80e104bd-7bd3-41b2-9bcb-4f23081061de/image.png)

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-01 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | 4/28/2025 |
| **Objectives** | Display a tooltip or pop-up for the current store location based on page type, device type, session status, and store location settings. |
| **Actor** | Consumer |
| **Preconditions** | Consumer is visiting a merchant’s store.<br />Merchant is on a paid plan<br />Merchant has multiple store locations.<br /> |
| **Conditions** | \- Check page type (root/homepage/product listing/single product page/cart).<br />\- Check if "Select Store Location" page is enabled/disabled.<br />\- Check if first-time visit or new tab session or session inactivity.<br />\- Check consumer’s device type (mobile/tablet/desktop). |
| **Steps** | 1\. Consumer visits the merchant’s store.<br />2\. Consumer visits either of the following pages:<br />Root ([storename.prosperna.com](http://storename.prosperna.com) or custom domain)<br />Homepage<br />Product Listing<br />Single Product Page<br />Cart<br />3\. System detects that the merchant has multiple store locations.<br /><br />Geolocation:<br />4\. System checks if **geolocation** is ON:<br />  - If yes:<br />    - System detects consumer’s location.<br />    - System calculates and sets nearest store location.<br />    - System saves/sets location across pages.<br />  - If no:<br />    - System proceeds to next step.<br /><br />Page Type<br />5\. System checks **page type** if page is = Root/Homepage/Product Listing/Single Product Page:<br />If yes, system checks if "Select Store Location" page is ON:<br />    - If ON:<br />      • System displays Select Store Location page.<br />      • Consumer selects location.<br />      • System saves location across all pages.<br />      • System redirects back to previous page.<br />    - If OFF:<br />      • System loads the page.<br />if no, (page type = cart page)<br />System displays cart page<br /><br />Session Status<br />6\. System detects if first-time visit or new tab session:<br />        - If no (**active session**), system does not display pop-up.<br />        - If yes (**new session** or **long inactivity**):<br />          • System displays tooltip/pop-up after full page load so that pop-up is prominent on the page and easily visible.<br />          • System checks device type:<br />            - **Mobile**: System displays sticky popup at top [(see design)](https://app.clickup.com/7537039/docs/760cf-58518/760cf-25798?block=block-cd247141-50a3-4d86-b737-a8dca9ffaccd).<br />            - **Tablet/Desktop**: System displays sticky popup below mega menu store selector [(see design)](https://app.clickup.com/7537039/docs/760cf-58518/760cf-25798?block=block-cd247141-50a3-4d86-b737-a8dca9ffaccd).<br /><br />Pop-up design<br />System displays pop-up with the following content (see design):<br />            - Close **(x)** Icon<br />            - Location **Icon**<br />            - **Location Name**<br />            - **Address** (City, Region, etc.)<br />            - "**Change**" link.<br /><br />Consumer interaction with pop-up:<br />7\. Consumer checks if they are in the right store location/branch<br />  - If correct location,<br />consumer clicks **Close** icon.<br />system hides pop-up<br />  - If wrong location, consumer clicks "**Change**" link:<br />    - System redirects to **Select Store Location** page.<br />    - Consumer selects new location.<br />    - Consumer clicks **Continue**.<br />    - System redirects back to previous page.<br />    - System saves new location across all pages.<br />    - System updates products and store location dropdown in mega menu. |
| **Postconditions** | \- Consumer’s store location is correctly set and remembered across pages.<br />\- Correct store location is displayed in dropdown and product lists. |
| **Business Trigger** | \- Consumer opens the merchant’s store on a mobile device.<br />\- Consumer initiates a first-time visit or a new tab session.<br />\- Location management is needed for accurate product display. |
| **Acceptance Criteria** | \- Tooltip/pop-up is shown only when applicable.<br />\- Pop-up displays correct store location and options.<br />\- Consumer can easily confirm or change their location.<br />\- Location is applied across all pages.<br />\- No pop-up appears if location already set within active session. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br /> |
- If merchant has a single location, system will not display tooltip. System will only display tooltip when merchant has multiple locations.<br />
- System will display the pop up location in the following pages where the consumer selects/adds products to cart<br />
    - Root ([storename.prosperna.com](http://storename.prosperna.com) or custom domain)<br />
    - Homepage<br />
    - Product Listing<br />
    - Single Product Page<br />
    - Cart<br />System displays popup as sticky<br />
- If consumer does not click the close icon, and they navigate to a different page, system will continuously force display the popup until consumer clicks close icon<br />

 
| Identify impacted modules (amend if there is something missing)<br /> |
| --- |
| - Store Location<br />- Multilocation<br />- Marketplace <br />- Page Builder<br />- All Pages<br />- Billing/Subscription<br /> |

#### UC 02 | Display Sticky Store Location Pop-up When Changing Location or Visiting a Different Page
![](https://t7537039.p.clickup-attachments.com/t7537039/7a40d9d6-2ac6-47c8-bbe5-02e511c9c82b/image.png)

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-02 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | 4/28/2025 |
| **Objectives** | Display a sticky store location pop-up when changing location or visiting a different page |
| **Actor** | Consumer (store visitor) |
| **Preconditions** | \- Merchant's store has multiple store locations<br />\- "Select Store Location" page is OFF<br />\- Consumer is visiting the page for the first time, opened a new browser session, or returning after inactivity |
| **Conditions** | \- Condition 1: Consumer changes store location<br />\- Condition 2: Consumer visits a different page<br />\- Condition 3: Product not available for selected location |
| **Steps** | Steps for all:<br />1\. Consumer visits the merchant’s store.<br />Consumer visits either of the following pages:<br />Root ([storename.prosperna.com](http://storename.prosperna.com/) or custom domain)<br />Homepage<br />Product Listing<br />Single Product Page<br />Cart<br />2\. System detects multiple store locations.<br />3\. System displays page content normally.<br />System detects first-time visit/new tab session/inactive session for a while<br />4\. System displays **sticky store location pop-up** after full page load [(see design)](https://app.clickup.com/7537039/docs/760cf-58518/760cf-25798?block=block-cd247141-50a3-4d86-b737-a8dca9ffaccd).<br /><br />Condition 1: Consumer changes store location<br />5\. Consumer changes store location via:<br />    - Mega menu store location **dropdown**<br />Consumer selects a different location from the options<br />    - **Domain** URL<br />Consumer changes the "/ph/location-name" in the domain to a different location<br />    - **Product error page** (future phase)<br />Consumer selects a different location from the store location dropdown in the page<br />6\. System saves location across all pages<br />7\. System reloads page with content for the new location (products, etc.).<br />System persistently displays pop-up<br />8\. System updates sticky pop-up with the new store location [(see design)](https://app.clickup.com/7537039/docs/760cf-58518/760cf-25798?block=block-cd247141-50a3-4d86-b737-a8dca9ffaccd).<br />9\. Consumer clicks the close icon.<br />10\. System closes the pop-up.<br /><br />Condition 2: Consumer visits a different page<br />1\. Consumer visits a different page (e.g., About Us, Contact Us).<br />2\. System loads the new page.<br />3\. System retains sticky store location pop-up.<br />4\. Consumer clicks the close icon.<br />5\. System closes the pop-up.<br /><br />Condition 3: Product not available for selected location<br />1\. Consumer is on a single product page.<br />2\. System detects the product is not available for the selected location.<br />3\. System displays a **product error page**.<br />4\. System displays a store location **dropdown** for product availability.<br />5\. Consumer selects a different store location from the dropdown.<br />6\. System reloads page with content for the new selected location.<br />7\. System updates sticky store location pop-up.<br />8\. Consumer clicks the close icon.<br />9\. System closes the pop-up. |
| **Postconditions** | \- New store location is applied across all pages<br />\- Pop-up closes after consumer action |
| **Business Trigger** | Consumer either changes store location, navigates to a different page, or encounters a product unavailable at the selected location |
| **Acceptance Criteria** | \- Pop-up displays correctly after page load<br />\- Pop-up updates store location after change<br />\- Pop-up stays visible until manually closed<br />\- Product availability updates after location change |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br /> |
- If consumer changes location via the following, system will retain and still display the pop-up on the page, unless manually closed by consumer<br />
    - When store location changes in mega menu dropdown or product error page dropdown<br />
    - When store location changes in select store location page<br />
    - When store location changes in domain URL<br />
- System displays popup as sticky<br />
    - If consumer does not click the close icon, and they navigate to a different page, system will continuously force display the popup until consumer clicks close icon<br />

 
| Identify impacted modules (amend if there is something missing)<br /> |
| --- |
| - Store Location<br />- Multilocation<br />- Marketplace <br />- Page Builder<br />- All Pages<br />- Billing/Subscription<br /> |

## **Nonfunctional Requirements**

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | Pop-up must appear within 500ms after the page fully loads. | High |
|  | Pop-up must not cause noticeable delay in page transitions. | High |
| **Security Requirements** | Only publicly available location info (Location name and City/Region) may be displayed. | High |
|  | No sensitive data should be exposed in the pop-up. | High |
| **Usability Requirements** | Pop-up must be fully mobile responsive. | High |
|  | “Close” and “Change” options must be clearly visible. | Medium |
|  | “Change” option must redirect immediately to the store selector page. | Medium |
| **Reliability Requirements** | Pop-up must always display under the correct conditions. | High |
|  | Pop-up must not crash or fail to dismiss when clicking “Close.” | High |
| **Scalability Requirements** | Support for future dynamic promotional messages within the pop-up. | Medium |
|  | Support for different location display styles per merchant. | Medium |
| **Compatibility Requirements** | Must be compatible with Desktop, Tablet, and Mobile devices. | High |
|  | Must work across all themes and custom designs. | High |
| **Regulatory & Compliance Requirements** | Must comply with accessibility requirements (e.g., screen reader labels, contrast ratios). | High |

###  Constraints & Assumptions
*   Merchant must have **multiple store locations**.
*   **Paid plan** subscription is required.
*   Session, cookie, or local storage is used to remember store location selection.
*   Pop-up does not appear on restricted pages.
## Acceptance Criteria

| **AC ID** | **Requirement** | **Acceptance Criteria** |
| ---| ---| --- |
| AC-001 | Pop-up Availability | Pop-up only appears if merchant is on a paid plan and has multiple locations |
| AC-002 | Device Responsive | Pop-up displays at top for Mobile and below mega menu for Desktop/Tablet |
| AC-003 | Pages Check | Pop-up only appears on root, homepage, product listing, single product page, cart |
| AC-004 | Session Check | Pop-up appears on first page load or new browser session |
| AC-005 | Close Behavior | Clicking the close button hides the pop-up until tab/session ends |
| AC-006 | Change Behavior | Clicking "Change" redirects to Select Store Location page |
| AC-007 | Location Switching | Pop-up updates after selecting new store location |
| AC-008 | Sticky Behavior | Pop-up remains across navigation unless manually closed |

## **Wireframes**
[Wireframe](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=13973-19489&t=C3NsCJvr75BdKAkJ-4)
## **Figma Design File ℅ UX UI Designer**
[Figma Design File](https://www.figma.com/design/yv5o8s8p95oLRQcXFIBkUj/Store-Location-%7C-Tooltip-Marker-for-Current-Location?node-id=0-1&t=Og0X9MIZM0p4b1oh-1)<br /><br />
**Mobile vs Desktop/Tablet**
*   System displays pop-up at the top of the page for mobile view.
*   System displays pop-up below the mega menu store location dropdown for desktop and tablet view.
![](https://t7537039.p.clickup-attachments.com/t7537039/d81e47ef-4ef9-4807-bd90-6e6c3d93081e/image.png)
## **Clickup Task**
[Clickup Task](https://app.clickup.com/t/86ercvafj)
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed | April 28, 2025 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br /> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |