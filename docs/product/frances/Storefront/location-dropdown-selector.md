---
id: location-dropdown-selector
title: Select Your Store Location via Mega Menu 
sidebar_position: 2
---

# Store Locations | Mega Menu | Domain | Fix Store Location Selector and Redirection

## **Executive Summary**
The **Mega Menu Store Location Feature** enhances the navigation experience for customers by integrating a store location dropdown into the primary and secondary menus. This feature ensures that users can select a store location, and the system will display products and cart items based on their selected location.
## **Background**
The consumer encountered issues with the store location dropdown in the mega menu
*   When the consumer changes the location in the dropdown, the products are not updating/appearing in the product listing page
*   When the consumer changes the location, the system is not remembering the location. When the consumer goes back to previous page or goes to a new page, the system does not load the correct products/content based on the location
References:
Private ([https://app.clickup.com/t/86er1a3wc](https://app.clickup.com/t/86er1a3wc))
Private ([https://app.clickup.com/t/86erd97x4](https://app.clickup.com/t/86erd97x4))

## **Business Objective**
*   Improve user navigation by enabling a **store location selector** in the mega menu.
*   Ensure that products and cart items update dynamically based on selected store location.
*   Provide merchants with flexibility in displaying the store location dropdown in **both primary and secondary menus**.
*   Ensure store location information is remembered across sessions.
## **Scope of Solution**
*   **Mega Menu:**
    *   Display a **store location dropdown** in the **mega menu** for the following pages only:
        *   products page [storename.prosperna.com/products](http://storename.prosperna.com/products)
        *   single product page [storename.prosperna.com/ph/locationname/products/product-name](http://storename.prosperna.com/ph/locationname/products/product-name)
        *   cart page [storename.prosperna.com/ph/locationname/cart](http://storename.prosperna.com/ph/locationname/cart)
        *   checkout page (hide dropdown and display label for the store location name only) [storename.prosperna.com/ph/locationname/checkout](http://storename.prosperna.com/ph/locationname/checkout)
    *   Allow merchants to enable/disable store location selection for both **primary and secondary menus**.
*   **Store Location Identifier:**
    *   Persist store location selection using URL parameters, local storage, or cookies.
    *   Automatically update store location dropdown and domain when a user selects a new location.
## **Business Requirements**

| **ID** | **Requirement** |
| ---| --- |
| BR-001 | The store location dropdown should be available in both primary and secondary menus. |
| BR-002 | The store location dropdown should update dynamically when a user selects a different location. |
| BR-003 | If a user enters the store via `/ph/location-name` or query parameter `?locationname=`, the system should extract the store location. |
| BR-004 | If no URL-based location exists, the system should use the stored location from **local storage or cookies**. |
| BR-005 | The system should remember the last selected store location when navigating between pages. |
| BR-006 | The store location dropdown should not appear on pages where location-based product filtering is not required (e.g., About Us, Contact Us). |
| BR-007 | The system should display products based on the selected store location in the **product listing** and **single product pages**. |
| BR-008 | The cart should contain products from only one store location at a time. |
| BR-009 | The checkout page should display the selected store location as a label. |
| BR-010 | If the store location selector is disabled, the system should default to the merchant’s main store location. |

## **Stakeholder Analysis**

| **Stakeholder** | **Role** | **Impact** |
| ---| ---| --- |
| Merchant | Configures the store location dropdown in the menu builder. | High |
| Customer | Selects a store location and views products accordingly. | High |
| System Administrator | Ensures smooth operation of the store location dropdown functionality. | Medium |

## **Research**
Related tasks:
Private ([https://app.clickup.com/t/86er1a3wc](https://app.clickup.com/t/86er1a3wc))
Private ([https://app.clickup.com/t/86ercvafj](https://app.clickup.com/t/86ercvafj))
Private ([https://app.clickup.com/t/86erd97x4](https://app.clickup.com/t/86erd97x4))
Private ([https://app.clickup.com/t/86er8gau6](https://app.clickup.com/t/86er8gau6))

Sample local websites with multilocation:
*   [Shop SM](https://www.shopsm.com/stores/smmarkets/collections/markets-default-660-fresh-meat-&-seafood)
*   [Apple](https://www.apple.com/sg/shop/bag)
## **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 01** | System | Display/Hide Store Location Dropdown based on Page Type<br> | Ensure the store location dropdown is visible in the navigation bar only on applicable pages. | **HIGH** |
| **UC 02** | System | Display/Hide Store Location Dropdown from Primary or Secondary Menu<br> | Allow merchants to enable or disable the store location dropdown in their menu settings. | **HIGH** |
| **UC 03** | System | Remember Selected Store Location Between Location Selector, Products Page and Other Pages | System must remember the location name selected by the consumer in the select store location page ([`storename.prosperna.com/locations`](http://storename.prosperna.com/locations)) or store location dropdown in the mega menu<br>Ensure that the selected store location persists when navigating between the **Products Page, Single Product Page or Other Pages**, while handling redirection and the back button properly.<br> | **HIGH** |

### **Use Case Description Tables**
#### UC 01 | Display/Hide Store Location Dropdown based on Page Type

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-001 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | March 28, 2025 |
| **Objectives** | Ensure the store location dropdown is visible in the navigation bar only on applicable pages. |
| **Actor** | System |
| **Preconditions** | \- Merchant has configured store location settings in the system.<br>\- The consumer is accessing the merchant’s store via Google search results or a direct URL link. |
| **Conditions** | \- Condition 1: Store location dropdown is enabled on applicable pages.<br>\- Condition 2: Store location dropdown is disabled on non-applicable pages. |
| **Steps** | **Condition 1: Store Location Dropdown is Enabled (Applicable Pages)**<br>1\. Consumer accesses the merchant’s online store through Google search results or a direct URL.<br>2\. System loads the merchant's store.<br>4\. System checks if the current page allows the store location dropdown.<br>5\. If the page is applicable, the system proceeds to next step<br>6\. System checks if the store location dropdown is enabled in the mega menu<br>if no, system hides store location dropdown<br>if yes, system displays the store location dropdown in the navigation bar.<br><br>**Condition 2: Store Location Dropdown is Disabled (Non-Applicable Pages)**<br>1\. Consumer accesses a store page where the dropdown is not applicable.<br>2\. System does not display the store location dropdown. |
|  | **Applicable Pages (Dropdown Visible)**<br>**Free Plan Pages:**<br>\- Product Listing<br>\- Single Product<br>\- Cart<br><br>**Non-Applicable Pages (Dropdown Not Visible)**<br>**Free Plan Pages:**<br>\- Checkout (Store Location Name is shown as a label only)<br>\- Thank You<br>\- Error<br><br>**Paid Plan Pages:** (Pages are the same across all store locations)<br>\- Home<br>\- Maintenance<br>\- About Us<br>\- Terms of Service<br>\- Privacy Policy<br>\- Return Policy<br>\- Contact Us<br>\- Blogs |
| **Postconditions** | \- If enabled, the store location dropdown is visible only on applicable pages.<br>\- If disabled or not applicable, the dropdown is hidden. |
| **Business Trigger** | Consumer visits the merchant’s online store. |
| **Acceptance Criteria** | \- The store location dropdown is displayed only on specified pages.<br>\- The dropdown is hidden on all non-applicable pages. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br>System displays the store location dropdown selector in the mega menu only on the following pages:<br>Product Listing<br>Single Product<br>Cart<br>System hides the dropdown from the rest of the pages<br>**Free Plan Pages:**<br>Checkout (Store Location Name is shown as a label only)<br>Thank You<br>Error<br>**Paid Plan Pages:**<br>Home (Homepage is the same across all store locations)<br>Maintenance<br>About Us<br>Terms of Service<br>Privacy Policy<br>Return Policy<br>Contact Us<br>Blogs<br>Identify impacted modules (amend if there is something missing)<br>Page Builder<br>Pages<br>Locations<br>Mega Menu<br> |

#### UC 02 | Display/Hide Store Location Dropdown from Primary or Secondary Menu

| **Current** | **To-be** | **Result** |
| ---| ---| --- |
| System automatically disables checkbox for Function > Store Location dropdown for Secondary Menu<br> | System automatically enables checkbox for Function > Store Location dropdown for Secondary Menu | Merchant can add Store Location dropdown in both Primary and Secondary Menu |
| 2\. System automatically enables checkbox for Function > Store Location dropdown for Primary Menu only | System automatically enables checkbox for Function > Store Location dropdown in both Primary and Secondary Menu | Merchant can add Store Location dropdown in both Primary and Secondary Menu |
| 3\. System automatically ticks/selects store location dropdown for Primary Menu by default | Retain. No changes needed. | System automatically displays store location dropdown in Primary Menu |
| 4\. System automatically unticks/deselects store location dropdown for Secondary Menu by default | Retain. No changes needed. | System automatically hides dropdown from Secondary Menu |

| **Use Case ID** | UC-002 |
| ---| --- |
| **Use Case Name** | Display/Hide Store Location Dropdown from Primary or Secondary Menu |
| **Objective** | Allow merchants to enable or disable the store location dropdown in their menu settings. |
| **Prepared By** | Frances Ramos |
| **Last Updated** | March 28, 2025 |
| **Actor** | Merchant, System |
| **Preconditions** | \- Merchant is **logged into P1**.<br>\- Merchant is on the **Menu Builder page**.<br>\- Merchant is subscribed to a **paid plan**. |
| **Steps** | **Merchant Accesses Menu Builder:**<br>1\. Merchant **logs in**.<br>2\. Merchant navigates to **Page Builder > Menu Builder**.<br>3\. System detects that the merchant is on a **paid plan**.<br>4\. System displays **Menu Builder**.<br>5\. Merchant selects either **Primary Menu** or **Secondary Menu**.<br>6\. Merchant navigates to the **Menu Structure tab**.<br>7\. Merchant sees the **Menu Presets dropdown** and selects one of the following:<br>\- **Default Preset for Primary Menu**<br>\- **Default Preset for Secondary Menu**<br>\- **Custom Preset for Primary/Secondary Menu**<br><br>**Condition 1: Default Preset for Primary Menu**<br>8\. Merchant selects **Default Preset for Primary Menu**.<br>9\. Merchant goes to the **Functions accordion** and expands it.<br>10\. Merchant sees the **Store Location** accordion.<br>11\. System displays **Store Location** checkbox as **enabled**.<br>12\. Checkbox is ticked/selected by **default**.<br><br>**Condition 2: Default Preset for Secondary Menu**<br>13\. Merchant selects **Default Preset for Secondary Menu**.<br>14\. Merchant goes to the **Functions accordion** and expands it.<br>15\. Merchant sees the **Store Location** accordion.<br>16\. System displays **Store Location** checkbox as **enabled**.<br>17\. Checkbox is unticked/deselected by **default**.<br><br>**Condition 3: Customization by Merchant**<br>18\. Merchant ticks/unticks the **checkbox** for Store Location.<br><br>**Final Steps for All Conditions:**<br>19\. Merchant clicks **Save Changes**.<br>20\. System updates the menu based on the checkbox state:<br>\- If **ticked**, system **displays** the store location dropdown.<br>\- If **unticked**, system **hides** the store location dropdown. |
| **Postconditions** | \- Store Location dropdown is **visible or hidden** based on merchant settings.<br>\- Menu updates are **saved and reflected on the website**. |
| **Business Rules** | \- Merchants must be on a **paid plan** to access **Menu Builder**.<br>\- Default presets have **predefined checkbox states** (Primary: ticked, Secondary: unticked).<br>\- Custom presets allow merchants to **manually enable or disable** Store Location. |
| **Acceptance Criteria** | \- **Store Location checkbox is visible** in Menu Builder settings.<br>\- **Checkbox behaves correctly** based on menu type (Primary: ticked, Secondary: unticked).<br>\- **Store Location dropdown appears/disappears** based on the checkbox selection. |
| **Error Messages** | _None required, as merchants can manually toggle the checkbox._ |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br>System will allow merchant to add/display the store location dropdown for both primary and secondary menu<br>System will enable the checkbox of the store location dropdown in the Functions accordion, which means the merchant can tick/untick the checkbox in either primary or secondary menu<br>System will display the store location dropdown in the Primary Menu by default<br>System will hide the store location dropdown in the Secondary Menu by default<br>Identify impacted modules (amend if there is something missing)<br>Page Builder<br>Pages<br>Locations<br>Mega Menu<br> |

#### **UC 03 | Remember Selected Store Location Between Location Selector, Products Page and Other Pages**

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-003 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | March 31, 2025 |
| **Objectives** | System must remember the location name selected by the consumer in the select store location page ([`storename.prosperna.com/locations`](http://storename.prosperna.com/locations)) or store location dropdown in the mega menu<br>Ensure that the selected store location persists when navigating between the **Products Page, Single Product Page or Other Pages**, while handling redirection and the back button properly.<br> |
| **Actor** | System |
| **Preconditions** | Consumer is browsing the merchant's store.<br>Consumer is on a page that contains `/ph/location-name` in their domain URL or<br>Consumer is in a page that contains a store location dropdown in the mega menu or<br>Consumer is in select store location page (`storename.prosperna.com/locations`)<br> |
| **Conditions** | 1\. Consumer navigates to other pages<br>2\. Consumer clicks the back button or goes to a previous page<br>3\. Consumer changes location via the store location dropdown and clicks the back button<br>4\. Consumer accesses the page for the first time |
| **Steps** | **For All Conditions:**<br>1\. Consumer goes to the merchant’s store (root - [`storename.prosperna.com`](http://storename.prosperna.com)).<br>2\. System checks if the **store location selector page** is enabled. [`storename.prosperna.com/locations`](http://storename.prosperna.com/locations)<br>**If disabled:**<br>3\. System checks if the merchant has a **custom homepage**.<br>a. If yes, system redirects to the custom homepage ([`storename.prosperna.com`](http://storename.prosperna.com)).<br>i. System **hides** the store location dropdown from the mega menu navbar.<br>b. If no, system displays the **product listing page**.<br>i. System displays the store location dropdown in the mega menu navbar.<br>ii. System checks and sets the **default location** of the merchant.<br>iii. System saves the location selected by default.<br>**If enabled:**<br>4\. Consumer selects a location.<br>5\. Consumer clicks **Continue**.<br>6\. System saves the selected location.<br>7\. System checks if the merchant has a custom homepage. (similar to step #3 above)<br>8\. System redirects to the appropriate homepage. (custom homepage or product listing) |
| **Steps for Condition 1:** Consumer navigates to other pages | 1\. Consumer navigates to another page in the same tab:<br>Product Listing page<br>Single Product page<br>Cart page<br>Checkout page<br>Thank You page (when consumer successfully checks out<br>Consumer clicks "Continue Shopping" button<br>System loads Product Listing page<br>Home page<br>About Us page<br>Terms of Service page<br>Privacy Policy page<br>Return Policy page<br>Contact Us page<br>Blogs page<br>Custom Pages<br>2\. System loads the new page.<br>3\. System remembers the **location** of the **previous page.**<br>4\. System sets the location of the previous page as the location of the **current page**.<br>5\. If the page contains products, cart, or checkout, the system updates the products/contents/data based on the location.<br>6\. System updates the **store location dropdown** with location name (if displayed).<br>7\. System updates the location name in the **domain** (if domain contains `/ph/location-name`). |
| **Steps for Condition 2:** Consumer clicks the back button or goes to a previous page | 1\. Consumer clicks the **back** button.<br>2\. System remembers the **previous location**.<br>3\. System sets the previous location as the **current location**.<br>4\. System updates the **store location dropdown** (if displayed).<br>5\. System updates the location name in the **domain** (if applicable).<br>6\. System updates the products/contents/data based on the location. |
| **Steps for Condition 3:** Consumer changes location via the store location dropdown and clicks the back button | 1\. Consumer is on a page with a **store location dropdown**<br>Product Listing<br>Single Product<br>Cart<br>2\. Consumer selects a different location from the dropdown.<br>3\. System detects the **new location**.<br>4\. System saves the new location.<br>5\. System updates the products/contents/data based on the new location.<br>6\. Consumer clicks the back button.<br>7\. System remembers the saved location in step #4<br>8\. System sets the location as the **current location**.<br>9\. System updates the **store location dropdown** (if displayed).<br>10\. System updates the location name in the **domain** (if applicable).<br>11\. System loads the page and updates the products/contents/data based on the location. |
| **Steps for Condition 4:** Consumer accesses the page for the first time | Consumer accesses a page for the first time Product Listing page<br>Single Product page<br>Cart page<br>Checkout page<br>Thank You page<br>Home page<br>About Us page<br>Terms of Service page<br>Privacy Policy page<br>Return Policy page<br>Contact Us page<br>Blogs page<br>Custom Pages<br>2\. System checks the **default location** of the merchant.<br>3\. System sets the default location as the location of the **current page**.<br>4\. System updates the **store location dropdown** in the mega menu navbar.<br>5\. System saves the location selected by default. |
| **Postconditions** | \- System successfully remembers and applies the last selected location for the consumer. |
| **Business Trigger** | \- Consumer navigates to a different page, clicks the back button, or changes location via the store location dropdown. |
| **Acceptance Criteria** | \- System correctly updates the consumer's location when navigating pages or changing the store location.<br>\- Location selection persists even when navigating back or reloading pages.<br>\- Store content updates according to the selected location. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br>Consumer access the page for the first time (if "select store location" page is disabled [`storename.prosperna.com/locations`](http://storename.prosperna.com/locations)):<br>System sets **default location** as the store location of the current page<br>Consumer closes previous session and opens a new tab:<br>System sets **default location** as the store location of the current page<br>Consumer goes to a new page in the same tab:<br>System sets the **stored location** from the following:<br>  - **Session Storage** (`sessionStorage.setItem('selectedLocation', 'location-name')`)<br>  - **OR a Cookie** (`document.cookie = "location=location-name; path=/;"`)<br>  - **OR a URL parameter** (`?location=location-name`).<br>Consumer goes to a previous page<br>System sets the **stored location** from the following:<br>  - **Session Storage** (`sessionStorage.setItem('selectedLocation', 'location-name')`)<br>  - **OR a Cookie** (`document.cookie = "location=location-name; path=/;"`)<br>  - **OR a URL parameter** (`?location=location-name`).<br>Consumer changes store location in store location dropdown in mega menu and goes to a previous page<br>system saves new location<br>system loads previous page<br>System sets the **stored location** from the following:<br>  - **Session Storage** (`sessionStorage.setItem('selectedLocation', 'location-name')`)<br>  - **OR a Cookie** (`document.cookie = "location=location-name; path=/;"`)<br>  - **OR a URL parameter** (`?location=location-name`).<br><br>Sample Scenario #1: Remember store location from products page to single product page and vice versa<br>1\. Consumer selects a store location from the dropdown on the **Products Page**.<br>2\. System stores the selected location using:<br>  - **Session Storage** (`sessionStorage.setItem('selectedLocation', 'location-name')`)<br>  - **OR a Cookie** (`document.cookie = "location=location-name; path=/;"`)<br>  - **OR a URL parameter** (`?location=location-name`).<br>3\. Consumer clicks on a product, and the system redirects them to `/ph/location-name/product-name`.<br>4\. On the **Single Product Page**, the system retrieves the stored location and updates the page accordingly.<br>5\. Consumer clicks back button<br>6\. System goes back to Products page<br>7\. System checks for the selected location in:<br>  - **Session Storage** (`sessionStorage.getItem('selectedLocation')`).<br>  - **OR Cookies** (read stored value).<br>  - **OR URL Parameters** (if present).<br>8\. If a location is found, the **Products Page** updates the store location dropdown in the mega menu and product listing accordingly.<br><br>Sample Scenario #2: Retaining Store Location After "Back" Navigation<br>1\. Consumer is in the Products page<br>2\. Consumer adds a product to the cart<br>3\. Consumer proceeds to Cart page<br>4\. Consumer clicks the browser back button.<br>5\. System checks for the selected location in:<br>  - **Session Storage** (`sessionStorage.getItem('selectedLocation')`).<br>  - **OR Cookies** (read stored value).<br>  - **OR URL Parameters** (if present).<br>6\. If a location is found, the **Products Page** updates the store location dropdown in the mega menu and product listing accordingly.<br><br>Identify impacted modules (amend if there is something missing)<br>Page Builder<br>Pages<br>System-Generated Pages<br>Custom Pages<br>Locations<br>Mega Menu<br> |

## **Nonfunctional Requirements**

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | Store location dropdown must load within 1 second. | High |
|  | Product listings must update in real-time when the location changes. | High |
|  | Cart updates must happen instantly when the location changes. | High |
| **Security Requirements** | Store location data must be securely stored. | High |
|  | Unauthorized changes to store location must be prevented. | High |
| **Usability Requirements** | Store location dropdown must be easy to locate in the mega menu. | Medium |
|  | Switching store locations must be intuitive and seamless. | Medium |
| **Reliability Requirements** | The system must remember the last selected store location across sessions. | High |
|  | Dropdown must always display the correct store location. | High |
| **Scalability Requirements** | Must handle thousands of store location changes without performance issues. | High |
|  | Must support future geolocation-based store selection. | Medium |
| **Maintenance & Supportability Requirements** | Configuration changes must be merchant-friendly via menu builder. | Medium |
|  | Updates must not impact other site functionalities. | High |
| **Compatibility Requirements** | Must be compatible with Chrome, Firefox, Safari, and Edge. | High |
|  | Must be fully responsive across mobile, tablet, and desktop. | High |
| **Regulatory & Compliance Requirements** | Must comply with GDPR for cookie storage of location selection. | High |
|  | Must comply with local eCommerce regulations. | High |
| **Constraints** | Location selection must not interfere with checkout functionality. | High |
|  | Merchants can only have one active location selection per session. | High |
| **Assumptions** | Users understand product availability depends on store location. | Medium |
|  | Store location dropdown will not affect static pages. | Medium |

### **Acceptance Criteria**

| **ID** | **Criteria** |
| ---| --- |
| AC-001 | Store location dropdown should be visible in **primary and secondary menus** if enabled. |
| AC-002 | Dropdown should dynamically update based on **selected location**. |
| AC-003 | System should **store the selected location** in cookies/local storage. |
| AC-004 | System should **display only products from the selected store location**. |
| AC-005 | Store location should persist when navigating to product listing, cart, and checkout pages. |
| AC-006 | The checkout page should display the **store location name** as a label. |
| AC-007 | Store location dropdown should not appear on non-relevant pages like About Us, Privacy Policy, etc. |
| AC-008 | If no location is selected, system should **default to the merchant’s main store**. |
| AC-009 | System should remember the previous store location if the user returns later. |

* * *
## **Wireframes**
[Wireframe Link](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=13697-18928&t=Na9LDX0lGKvqalUf-4)
## **Figma Design File ℅ UX UI Designer**
N/A
## **Clickup Task**
Private ([https://app.clickup.com/t/86er37j7z](https://app.clickup.com/t/86er37j7z))
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed | April 2, 2025 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |