---
id: delete-merchant-account
title: Delete Merchant Account
sidebar_position: 2
---

# Delete Merchant Account

#### Executive Summary
This project aims to outline the process for deleting0 a merchant account within the ecommerce platform. Deleting a merchant account involves several steps to ensure proper handling of outstanding balances, data retention, and account restoration if needed. The process includes validation checks, disabling account credentials, unpublishing pages, scheduling data deletion, and providing options for account restoration by both the merchant and system administrator.
#### Background
*   Since the Balances and Withdrawals are implemented, the system should make sure that the merchant settles all of their outstanding balances before they can exit the platform.
*   Introduce the account restoration feature to help merchants restore their account data
#### Business Objective
The primary objective is to define a clear and structured process for deleting merchant accounts while ensuring that outstanding balances are resolved, data is securely handled, and options for account restoration are available within a specified timeframe.
#### Scope of Solution
The scope includes defining the steps and requirements for deleting a merchant account, handling outstanding balances, disabling account access, scheduling data deletion, and providing options for account restoration by both the merchant and system administrator.
#### Business Requirements

| **BR ID** | **Category** | **Business Requirement** |
| ---| ---| --- |
| **BR-01** | Validation of Outstanding Balances | The system must verify that the merchant's loan balance is zero and their available balance is not negative before initiating the account deletion process. |
| **BR-02** | Error Handling for Outstanding Balances | If the merchant has outstanding balances, the system will cancel the deletion process until outstanding balances are resolved. |
| **BR-03** | Account Deletion Process – Disabling Credentials | Upon confirmation to delete their account, the system must disable the merchant's account credentials to prevent further login access. |
| **BR-04** | Account Deletion Process – Unpublishing Pages | All pages associated with the merchant account must be unpublished and made inaccessible to customers. |
| **BR-05** | Account Deletion Process – Scheduling Data Deletion | All merchant data must be scheduled for deletion within **30 days**. After the expiration of the 30-day period, the data will be transferred to a non-connected database. |
| **BR-06** | Account Restoration – Merchant Initiated | Merchants can request account restoration within the 30-day window by contacting the support team. The support team will handle the restoration request. |
| **BR-07** | Account Restoration – Admin Initiated | The system administrator can restore the merchant's account through the admin control platform. |
| **BR-08** | Account Status Updates – Archived | The merchant account status will be set to **"Archived"** once it is scheduled for deletion. |
| **BR-09** | Account Status Updates – Deleted | After the complete deletion of the merchant account, the account status will be updated to **"Deleted"**. |
| **BR-10** | Account Status Updates – Restored | Once the restoration of the account is completed, the account status will be updated to **"Active"**. |

#### Stakeholder Analysis
Stakeholders include merchants, system administrators, support team members, and potentially regulatory compliance officers. Each stakeholder has specific roles and responsibilities within the account deletion and restoration process.

#### **User Flow Diagram**
Archive Account
![](https://t7537039.p.clickup-attachments.com/t7537039/27908206-f8db-4095-a95e-6c09c7d05856/image.png)
Delete Account
![](https://t7537039.p.clickup-attachments.com/t7537039/fdd3b291-2bed-455e-bc38-c583f0197138/image.png)
Restore Account
![](https://t7537039.p.clickup-attachments.com/t7537039/3194b08b-3e6b-4252-9eb0-0ad1b4270c08/image.png)
#### **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 01** | System | Archive Merchant Account | To allow merchants to archive their accounts in the system. | **HIGH** |
| **UC 02**<br /> | System | Schedule Deletion of Account | To schedule the deletion of a merchant's account after it has been archived. | **HIGH** |
| **UC 03**<br /> | Admin | Schedule Deletion of Account | To schedule the deletion of a merchant's account after it has been archived. | **HIGH** |
| **UC 04**<br /> | Admin | Admin Control-View Deleted Merchant Account | To enable admins to view deleted merchant accounts and prevent them from accessing certain modules. | **HIGH** |
| **UC 05**<br /> | Admin<br /> | Admin Control-Restore Merchant Account<br /> | To enable admins to restore a merchant account that has been archived. | **HIGH**<br /> |

### **Use Case Description Tables**
#### UC 01 | Archive Merchant Account

| Column | Description | Notes |
| ---| ---| --- |
| Use Case ID | UC01 |  |
| Prepared By | Frances Ramos |  |
| Last Updated | February 28, 2024 |  |
| Objectives | To allow merchants to archive their accounts in the system. |  |
| Actor | Merchant |  |
| Preconditions | Merchant is logged in to P1 and is in the My Account page ([https://p1.prosperna.com/home/my-account)](https://p1.prosperna.com/home/my-account)) |  |
| Conditions | \- Condition 1: Merchant has outstanding balances, a remaining loan balance, or active subscriptions in billing and marketplace |  |
|  | \- Condition 2: Merchant's available balance is zero, and loan balance is zero. |  |
| Steps |  |  |
| Condition 1: |  |  |
|  | 1\. Merchant logs in to P1. |  |
|  | 2\. Merchant is in the Dashboard. |  |
|  | 3\. Merchant clicks on the Account Profile dropdown. |  |
|  | 4\. Merchant clicks on My Account. |  |
|  | 5\. System redirects merchant to the My Account page. |  |
|  | 6\. Merchant can view their Profile Picture, Personal Information, and Author Profile (if applicable). |  |
|  | 7\. Merchant clicks on "Delete Account". |  |
|  | 8\. System displays modal: "Delete Account. Before you delete your account, You must settle your outstanding balances and loan, Cancel all of your active subscriptions to make sure you don’t receive unexpected charges, Fulfill all of your orders.". |  |
|  | 9\. Merchant clicks Continue button. |  |
|  | 10\. System checks the following:<br />\- a remaining loan balance<br />\- a negative available balance in balances and withdrawals<br />\- active subscriptions in the marketplace<br />\- active subscription plan in billing |  |
| _If loan balance > 0:_ | 11\. System displays modal: "You must settle your remaining loan in Loans first before you can delete your account.". | for next phase when Loans will be implemented |
|  | \- If merchant clicks "Go to Loans", system redirects to Loans page. |
| _If negative available balance:_ | 12\. System displays modal: "You must settle your outstanding balance in Balances first before you can delete your account.". |  |
|  | \- If merchant clicks "Go to Balances", system redirects to Balances page. |  |
| _If merchant is subscribed to a paid plan:_ | 11\. System displays modal: "You must cancel your subscription plan first before you can delete your account.". |  |
|  | \- If merchant clicks "Go to Billing", system redirects to Billing page. |  |
| _If paid subscriptions in marketplace > 0:_ | 11\. System displays modal: "You must cancel your subscriptions in the marketplace first before you can delete your account." |  |
|  | \- If merchant clicks "Go to Marketplace", system redirects to Marketplace > My Apps page. Merchant should be able to view their activated/currently subscribed apps. |  |
| _If both loan balance > 0 and negative available balance:_ | 15\. System displays modal: "You must settle your outstanding balances in Loans and Balances first before you can delete your account.". |  |
|  | \- If merchant clicks "View your remaining loan balance", system redirects to Loans page. |  |
|  | \- If merchant clicks "View your outstanding balance in Balances", system redirects to Balances page. |  |
| Condition 2: |  |  |
|  | Steps 1-9 are the same as Condition 1. |  |
|  | 10\. System checks if merchant has remaining loan balance or negative available balance: |  |
| _If loan balance = 0 and available balance = 0:_ | 11\. System displays pop-up modal: "Delete Account. Are you sure you want to delete your account? Deleting would automatically archive your account and remove your access to the system. Your account will be scheduled for deletion 30 days from now. You can restore your account within those 30 days by sending an email to [support@prosperna.com](mailto:support@prosperna.com). Type “DELETE” in the field below to confirm.". |  |
|  | 12\. Merchant inputs "DELETE" and clicks Delete button. |  |
|  | 13\. System displays success message: "Successfully deleted account." |  |
|  | 14\. System proceeds to log out merchant and redirects to the login page. |  |
|  | 15\. System sends email notification to merchant confirming account deletion. |  |
|  | 16\. System performs the following actions:<br />\- disables merchant's access to P1<br />\- sets account status to "Archived"<br />\- unpublishes merchant's pages. Customers should not be able to access all merchant's pages.<br />\- starts the 30-day counter. |  |
| Postconditions | Merchant's account is successfully archived in the system. |  |
| Business Trigger | Merchant wants to archive their account due to various reasons. |  |
| Acceptance Criteria | \- Merchant can successfully initiate the account archiving process. |  |
|  | \- System properly handles cases where the merchant has outstanding balances or remaining loan balances. |  |
| Estimates | Implementation time may vary depending on the integration complexity with the system's financial features. |  |
| Error Messages | \- "Error: Unable to delete account due to outstanding balances. Please settle all balances before proceeding." |  |
|  | \- "Error: Unable to delete account due to remaining loan balance. Please settle your loan before proceeding." |  |
|  | \- "Error: Unable to delete account. Please try again later." If the system encounters any issues during the process. |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br /> |
 - Merchant cannot delete their account if:<br />    
    - If a merchant has a remaining loan balance that they need to pay<br />
    - If Available Balance in Balances is a negative amount<br />
    - A negative available balance is a result of shipping fee surcharges that were deducted from the merchant's available balance<br />
    - Store domain cannot be accessed anymore. An error page will be displayed.<br />
    - For custom domains, if they are subscribed to the 1-year free trial, the subscription will continue until the merchant manually cancels subscription with crazydomains (refer to [Free .store Domain for 1 Year BRD](https://prosperna.larksuite.com/docx/UnIyd5GuOo611Rx6MWyuRfcLsQd))<br />
    - When deleting, no refund will be given to cancelled subscriptions.<br />
    - Admin Control can still access merchant's account through CSLA<br />
    - Admin Control can still perform Actions to the archived account<br /> 


| Identify impacted modules (amend if there is something missing)<br /> |
| --- |
    - My Account Page<br />
    - Admin Control<br />
    - Balances<br />
    - Loans<br />
    - Login Page<br /> 

#### UC 02 | Schedule Deletion of Account

| Column | Description |
| ---| --- |
| Use Case ID | UC02 |
| Prepared By | Frances Ramos |
| Last Updated | February 28, 2024 |
| Objectives | To schedule the deletion of a merchant's account after it has been archived. |
| Actor | System |
| Preconditions | Merchant's Account Status is set to "Archived". |
| Conditions | None |
| Steps |  |
|  | 1\. The system monitors the 30-day counter for the archived merchant's account. |
|  | 2\. When the 30-day counter expires: |
|  | \- The system transfers all merchant's data from the following modules to a CSV file: |
|  | \- Login: the user's credentials (email, first name, last name) |
|  | \- Leads<br />\- Orders<br />\- Inventory<br />\- Categories<br />\- Add-ons<br />\- Announcements<br />\- Coupons<br />\- Blogs<br />\- Balances<br />\- All Pages<br />\- Menu Builder<br />\- Media Library<br />\- Marketplace<br />\- Settings<br />\- My Account<br />\- Billing |
|  | \- Activity Log<br />\- Billing Verification<br />\- Transactions |
|  | \- The system transfers the CSV file from the main database to a non-connected database. |
|  | \- The system changes the merchant's account status to "Deleted". |
|  | \- System renames the merchant name in the database as: "<Merchant Name> + "No Longer Exists" + <timestamp>" |
| Postconditions | Merchant's account is successfully scheduled for deletion from the system. |
| Business Trigger | The 30-day counter for archiving the merchant's account expires. |
| Acceptance Criteria | \- System properly monitors and executes the deletion process after the specified 30-day period. |
| Estimates | Implementation time may vary based on the system's architecture and the volume of data to be transferred. |
| Error Messages | \- "Error: Unable to schedule account deletion. Please try again later." If the system encounters any issues. |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br /> |
- User details and store are permanently transferred to a non-connected database<br />
- Once the merchant's data has been moved to a non-connected database, the email address can be reused to create a new merchant account.<br />In Admin Control > Customer Transactions,<br />
- Admins should still be able to filter the table and view the deleted merchant account as `<Merchant Name> + "No Longer Exists"`<br />

| Identify impacted modules (amend if there is something missing)<br /> |
| --- |
    - My Account Page<br />
    - Admin Control<br />
    - Balances<br />
    - Loans<br />
    - Login Page<br /> 

#### UC 03 | Admin Control-Filter Accounts by Status

| Column | Description |
| ---| --- |
| Use Case ID | UC03 |
| Prepared By | Frances Ramos |
| Last Updated | February 28, 2024 |
| Objectives | To filter merchant accounts by their status for better management. |
| Actor | Merchant |
| Preconditions | Merchant is logged in and navigated to the Admin Control > Accounts page. |
| Conditions | None |
| Steps |  |
|  | 1\. Merchant is in the Admin Control > Accounts page. |
|  | 2\. Merchant views the Accounts table displaying various merchant account details. |
|  | 3\. The table includes a column for "Account Status" indicating whether the account is Active, Archived, or Deleted. |
|  | 4\. The default Filter by dropdown is set to "All", displaying all merchant accounts with statuses "Active", "Archived", and "Deleted". |
|  | 5\. Merchant clicks on the Filter by dropdown. |
|  | 6\. Merchant selects "Active" from the dropdown. |
|  | \- System displays only active accounts. |
|  | 7\. Merchant selects "Archived" from the dropdown. |
|  | \- System displays accounts scheduled for deletion (archived). |
|  | \- System displays the "Scheduled Deletion Date" column, indicating the date when the account will be deleted. |
|  | 8\. Merchant selects "Deleted" from the dropdown. |
|  | \- System displays deleted accounts only. |
| Postconditions | Merchant accounts are successfully filtered based on their status. |
| Business Trigger | Merchant needs to view accounts based on their status for management purposes. |
| Acceptance Criteria | \- The system correctly displays accounts based on the selected filter. |
|  | \- The "Scheduled Deletion Date" column is visible only when filtering by "Archived" accounts. |
| Estimates | Implementation time may vary based on the complexity of the filtering mechanism and the size of the database. |
| Error Messages | \- "Error: Unable to retrieve account data. Please try again later." If the system encounters any issues. |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br /> |
- These are the following Account Statuses:<br />
    - **Active**: Merchant is currently using their account and they have access to their account<br />
    - **Archived**: Merchant account is scheduled for deletion. Merchant no longer has access to their account.<br />
    - **Deleted**: Merchant account is deleted.<br />
- Merchant can filter accounts by Status<br />
- The system will display the Scheduled Deletion Date column only when the table is filtered by status, where Status = Archived.<br />
    - If Filter by = Active or Deleted, system will hide the Scheduled Deletion Date column<br />

| Identify impacted modules (amend if there is something missing)<br /> |
| --- |
    - My Account Page<br />
    - Admin Control<br />
    - Balances<br />
    - Loans<br />
    - Login Page<br /> 

#### UC 04 | Admin Control-View Deleted Merchant Account

| Column | Description |
| ---| --- |
| Use Case ID | UC04 |
| Prepared By | Frances Ramos |
| Last Updated | February 28, 2024 |
| Objectives | To enable admins to view deleted merchant accounts and prevent them from accessing certain modules. |
| Actor | Admin |
| Preconditions | Admin is logged in to the Admin Control. |
| Conditions | Merchant account status = Deleted. |
| Steps |  |
|  | 1\. System successfully deletes the merchant account. |
|  | 2\. The system removes the deleted merchant account from the Billing Verification and Address Verification tables. |
|  | 3\. The system removes the deleted merchant account from the Rewards module. |
|  | 4\. In the Accounts module, the system displays the deleted merchant's name as "<Merchant Name> + 'No Longer Exists' + <timestamp>". |
|  | 5\. In the Merchant Withdrawals and Customer Transactions table, the system displays the deleted merchant's name as "<Merchant Name> + 'No Longer Exists' + <timestamp>". |
| Acceptance Criteria | \- Admin can view the deleted merchant account in the Accounts module as "<Merchant Name> + 'No Longer Exists' + <timestamp>". |
|  | \- Admin can view the deleted merchant account in the Merchant Withdrawals and Customer Transactions table as "<Merchant Name> + 'No Longer Exists' + <timestamp>". |
|  | \- Admin cannot view the deleted merchant account in the Billing Verification and Address Verification tables. |
|  | \- Admin cannot view the deleted merchant account in the Rewards module. |
| Estimates | Implementation time may vary based on system complexity and database size. |
| Error Messages | \- "Error: Unable to retrieve deleted merchant account information. Please try again later." If there are any issues. |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />- Admin should not be able to view the deleted merchant account in the following modules:<br />     - Billing Verification table<br />     - Address Verification table<br />     - Rewards<br />- Admin should be able to view the deleted merchant account in the following modules as `<Merchant Name> + "No Longer Exists" + <timestamp>`:<br />     - Accounts<br />- Once merchant account is deleted, Actions menu will be disabled. Merchant can no longer perform any actions to the account.<br />     - Merchant Withdrawals and Customer Transactions table<br />- After merchant account has been deleted, and there is still pending balance from the merchant's account, admin can still withdraw the pending balance and send it to merchant.<br />

| Identify impacted modules (amend if there is something missing)<br /> |
| --- |
    - My Account Page<br />
    - Admin Control<br />
    - Balances<br />
    - Loans<br />
    - Login Page<br /> 

#### UC 05 | Admin Control-Restore Merchant Account

| Column | Description |
| ---| --- |
| Use Case ID | UC05 |
| Prepared By | Frances Ramos |
| Last Updated | February 28, 2024 |
| Objectives | To enable admins to restore a merchant account that has been archived. |
| Actor | Admin/Support |
| Preconditions | Merchant account status = Archived. |
|  | Support/Admin received an email from the merchant to restore their account. |
|  | Admin checks if the 30-day counter for the archived account has not expired. |
| Conditions | Support/Admin has access to Admin Control. |
| Steps |  |
|  | 1\. Support/Admin logs in to Admin Control. |
|  | 2\. Support/Admin navigates to the Accounts page. |
|  | 3\. Support/Admin selects the merchant's account from the list. |
|  | 4\. In the Actions column, Support/Admin clicks the three dots. |
|  | 5\. System displays the Actions menu. |
|  | 6\. Support/Admin clicks Restore. |
|  | 7\. System removes the 30-day counter for the archived account. |
|  | 8\. System proceeds to restore the merchant's login credentials. |
|  | 9\. System sets the account status to Active. |
|  | 10\. Merchant receives an email notifying them that their account has been restored. |
|  | 11\. Merchant goes to the login page. |
|  | 12\. Merchant logs in to P1. |
|  | 13\. Merchant is redirected to the dashboard. |
| Acceptance Criteria | \- Support/Admin can successfully restore the merchant account. |
|  | \- The merchant receives an email notification about the restoration of their account. |
| Estimates | Implementation time may vary based on system complexity and database size. |
| Error Messages | \- "Error: Unable to restore the merchant account. Please try again later." If there are any issues. |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />- They should still be verified. expire the verification of the account once it is deleted.<br />- Merchant's pages will remain unpublished. Merchant needs to manually publish their pages in order for them to be accessible to customer<br />

| Identify impacted modules (amend if there is something missing)<br /> |
| --- |
    - My Account Page<br />
    - Admin Control<br />
    - Balances<br />
    - Loans<br />
    - Login Page<br /> 

### **Nonfunctional Requirements**

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | Efficient account deletion process should execute without causing delays or system disruptions. | High |
|  | Data scheduled for deletion must be fully processed within 30 days to comply with regulations. | High |
| **Security Requirements** | Merchant data must be securely handled and transferred to a non-connected database post-deletion. | High |
|  | Proper access controls must be in place to prevent unauthorized restoration of deleted accounts. | High |
| **Usability Requirements** | Provide clear communication to merchants about the deletion process, restoration options, and status updates. | Medium |
|  | Restoration process must be straightforward and user-friendly for merchants. | Medium |
| **Reliability Requirements** | Account status (archived, deleted, active) must be accurately reflected in the system at all times. | High |
| **Scalability Requirements** | System must handle data deletion efficiently as the number of merchant accounts scales. | High |
| **Maintenance & Supportability Requirements** | Provide support for merchants requesting restoration within the allowed timeframe. | Medium |
|  | Monitoring mechanisms must track account deletion and restoration processes with admin oversight. | Medium |
| **Compatibility Requirements** | Account deletion and restoration must be compatible with devices and operating systems used by merchants and administrators. | High |
| **Regulatory & Compliance Requirements** | Ensure account deletion and restoration processes comply with data privacy laws (e.g., GDPR, CCPA). | High |

### Constraints and Assumptions
30-Day Restoration Window: Assume a 30-day window for merchants to request account restoration, after which data deletion is irreversible.
### Acceptance Criteria

| **AC ID** | **Linked BR ID** | **Acceptance Criteria** |
| ---| ---| --- |
| **AC-01** | BR-01 | The system verifies loan balance = 0 and available balance ≥ 0 before account deletion can proceed. |
| **AC-02** | BR-02 | If the merchant has an outstanding loan balance or negative available balance, the deletion request is blocked, and an error message is displayed: **“Account deletion cannot proceed until outstanding balances are resolved.”** |
| **AC-03** | BR-03 | When account deletion is confirmed, the merchant’s login credentials are disabled immediately, preventing further access. |
| **AC-04** | BR-04 | All published pages associated with the merchant are unpublished and become inaccessible to customers upon deletion scheduling. |
| **AC-05** | BR-05 | The system schedules all merchant data for deletion within **30 days**. After 30 days, data is transferred to a non-connected database. |
| **AC-06** | BR-06 | Merchants can submit a request to restore their account within 30 days via support. If approved, the account is restored with previous data intact. |
| **AC-07** | BR-07 | An administrator can restore a merchant account from the admin platform within the 30-day deletion window. |
| **AC-08** | BR-08 | Once an account is scheduled for deletion, its status changes to **“Archived”** in the system. |
| **AC-09** | BR-09 | After data deletion is complete (post-30 days), the merchant account status is updated to **“Deleted.”** |
| **AC-10** | BR-10 | If a merchant account is restored, the system updates the account status to **“Active.”** |

### **Wireframes**

[Merchant Side](https://www.figma.com/file/YBhF7WvFuormZFkhpVfsuU/Prosperna-Wireframe-copy?type=design&node-id=976-10946&mode=design&t=rvMTA1LCWMckQIcV-4)

[Admin Control](https://www.figma.com/file/YBhF7WvFuormZFkhpVfsuU/Prosperna-Wireframe-copy?type=design&node-id=976-10947&mode=design&t=rvMTA1LCWMckQIcV-4)

### **Figma Design File ℅ UX UI Designer**
[Figma Design File](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=15503%3A2119&mode=design&t=nhajzhARDXEZktgW-1)
![](https://t7537039.p.clickup-attachments.com/t7537039/9db3b92a-8e98-4efa-b6a7-dd7cdca7abd7/delete%20merchant%20-%20merchant.png)
![](https://t7537039.p.clickup-attachments.com/t7537039/161a29e6-c84a-4fcc-957d-fdd75256e164/delete%20merchant%20-%20admin%20control.png)
###   

### **Clickup Task**
[Clickup Task](https://app.clickup.com/t/865d2j48p)
### Related Docs
[My Account](https://prosperna.larksuite.com/docx/doxusRHktrq2ZZg1D0Zv6khFOMg)
[Admin Control](https://prosperna.larksuite.com/docx/doxusotIITkypXcEjWZDDOxJ5Vc)
### Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE | Approved | March 12, 2024 |
| Frances Ramos | BA | Completed | February 28, 2024 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Name** | **Action** | **Use Case** | **Reason** | **Date** | **Related Docs** |
| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |