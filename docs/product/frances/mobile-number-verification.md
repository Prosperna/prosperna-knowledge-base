---
id: mobile_number_verification
title: Mobile Number Verification
sidebar_position: 2
---

# Merchant & Consumer | Mobile Number Verification

## **Executive Summary**
This BRD defines the requirements for mobile number verification across the **Prosperna One Consumer My Account**, **Merchant Dashboard My Account**, and **Checkout.**
The goal is to allow both merchants and consumers to securely store and verify mobile numbers through an OTP sent via SMS, improve communication, and add a merchant-configurable verification requirement for guest checkout mode.
## Background
Currently, consumers can store mobile numbers without verification, which poses security and communication reliability risks. Merchants can verify their mobile number, but cannot resend the verification code once it expires. Merchants also lack tools to manage mobile number verification requirements for guest checkout orders. This enhancement introduces OTP verification, a resend feature, countdown timer, and verified tag visibility, as well as an option for merchants to enforce verification during guest checkout.
## Business Objective
*   To enable merchants and consumers to securely link and verify a mobile number to their Prosperna One account, improving identity assurance, communication reach, and compliance with potential future authentication policies.
*   To enable merchants to require their customers to verify their mobile number upon checkout
## **Scope of Solution**
1. **Features:**
    1. **Resend Verification Code Feature**
        *   Ability to resend OTP code via SMS.
    2. **Countdown Timer for Verification Code Validity**
        *   OTP code validity is **2 minutes only**.
    3. **Verified Tag**
        *   System displays a **Verified** tag when mobile number has been successfully verified.
    4. **Enable/Disable Mobile Number Verification During Guest Checkout**
        *   Merchant can toggle a setting to require customers to verify their mobile numbers before payment if using guest checkout mode.
2. **In Scope:**
    *   Available for all plans
    *   Built-in features
    *   Merchant **My Account** and Consumer **My Profile**/Account
        *   OTP generation, sending via SMS, and verification.
        *   Validation for format, duplication, and expiry.
        *   Resend OTP functionality with timer reset.
        *   “Verified” tag display after success.
    *   **Guest Checkout Mode**
        *   OTP generation, sending via SMS, and verification.
        *   Validation for format, duplication, and expiry.
        *   Resend OTP functionality with timer reset.
3. **Out of Scope:**
    *   Multi-factor authentication login using OTP.
    *   Email OTP verification (already existing).
4. **Requirements per Feature**
    *   **Countdown Timer**
        *   Starts once OTP code has been sent to the mobile number via SMS.
        *   Displays countdown in real-time and resets when **"Resend Code"** is triggered.
    *   **Resend Code**
        *   Button is disabled if OTP is still valid and unexpired.
        *   Button is enabled once OTP expires or timer reaches **0**.
        *   System resends OTP to the mobile number via SMS.
    *   **Error and Success Messages**
        *   **Toast messages displayed when:**
            1. OTP code sent successfully.
            2. Invalid or expired OTP code.
            3. Mobile number already registered.
            4. Successful mobile number verification.
        *   **Error message** if invalid mobile number format for selected/set country code.
## Business Requirements

| **BR ID** | **Area** | **Business Requirement** |
| ---| ---| --- |
| **Merchant My Account** |
| BR-M01 | Merchant My Account | Allow merchants to view their registered mobile number. |
| BR-M02 | Merchant My Account | Allow merchants to edit their mobile number. |
| BR-M03 | Merchant My Account | Validate mobile number format per country code before sending OTP. |
| BR-M04 | Merchant My Account | Prevent duplicate mobile numbers across accounts. |
| BR-M05 | Merchant My Account | Send OTP via SMS when merchant updates mobile number. |
| BR-M06 | Merchant My Account | OTP expires after 2 minutes. |
| BR-M07 | Merchant My Account | Show countdown timer until OTP expiry. |
| BR-M08 | Merchant My Account | Enable “Resend Code” button after OTP expiry. |
| BR-M09 | Merchant My Account | Resend OTP resets countdown to 2 minutes. |
| BR-M10 | Merchant My Account | Show “Verified” tag after successful OTP verification. |
| BR-M11 | Merchant My Account | Display toast messages for OTP events (sent, verified, failed). |
| **Consumer My Account** |
| BR-C01 | Consumer My Account | Allow consumers to add or edit mobile number in My Account. |
| BR-C02 | Consumer My Account | Validate mobile number format per country code before sending OTP. |
| BR-C03 | Consumer My Account | Prevent duplicate mobile numbers across accounts. |
| BR-C04 | Consumer My Account | Send OTP via SMS when consumer updates mobile number. |
| BR-C05 | Consumer My Account | OTP expires after 2 minutes. |
| BR-C06 | Consumer My Account | Show countdown timer until OTP expiry. |
| BR-C07 | Consumer My Account | Enable “Resend Code” button after OTP expiry. |
| BR-C08 | Consumer My Account | Resend OTP resets countdown to 2 minutes. |
| BR-C09 | Consumer My Account | Show “Verified” tag after successful OTP verification. |
| BR-C10 | Consumer My Account | Display toast messages for OTP events (sent, verified, failed). |
| **Guest Checkout Mode** |
| BR-G01 | Guest Checkout | Allow merchant to toggle mobile number verification requirement for guest checkout. |
| BR-G02 | Guest Checkout | Enforce OTP verification during guest checkout if toggle is ON. |
| BR-G03 | Guest Checkout | Validate mobile number format before sending OTP. |
| BR-G04 | Guest Checkout | Prevent duplicate mobile numbers across accounts. |
| BR-G05 | Guest Checkout | OTP expires after 2 minutes. |
| BR-G06 | Guest Checkout | Show countdown timer until OTP expiry. |
| BR-G07 | Guest Checkout | Enable “Resend Code” button after OTP expiry. |
| BR-G08 | Guest Checkout | Resend OTP resets countdown to 2 minutes. |
| BR-G09 | Guest Checkout | Show “Verified” tag after successful OTP verification. |
| BR-G10 | Guest Checkout | Display toast messages for OTP events (sent, verified, failed). |

## **Functional Requirements**
### **Use Case Description Tables**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| Consumer My Account |
| **UC 01** | Consumer | Verify Mobile Number in Consumer My Account | To allow a Prosperna One Consumer to add their mobile number to their account and verify it via OTP. | **HIGH** |
| **UC 02** | System | Display Countdown Timer for Verification Code Validity | To allow a Prosperna One Consumer to add their mobile number to their account and verify it via OTP. | **HIGH** |
| **UC 03** | System | Resend OTP Verification Code in Consumer My Account | To display a "Verified" tag beside the mobile number of a Prosperna One Consumer in the My Account page when the number has been successfully verified. | **HIGH** |
| **UC 04** | System | Display Verified Tag for Consumer's Mobile Number | To display a "Verified" tag beside the mobile number of a Prosperna One Consumer in the My Account page when the number has been successfully verified. | **HIGH** |
| Merchant My Account |
| **UC 05** | Merchant | Verify Mobile Number in Merchant My Account | To allow a merchant to update and verify their mobile number in the My Account page. | **HIGH** |
| **UC 06** | System | Display Countdown Timer for Verification Code Validity | Display Countdown Timer for Verification Code Validity | **HIGH** |
| **UC 07** | Merchant | Resend OTP Verification Code in Merchant My Account | To allow the Prosperna One Merchant to resend the OTP verification code for mobile number verification. | **HIGH** |
| **UC 08** | System | Display Verified Tag for Merchant's Mobile Number | To display a "Verified" tag beside the mobile number of a Prosperna One Merchant in the My Account page when the number has been successfully verified. | **HIGH** |
| Consumer Checkout |
| **UC 09** | Merchant | Enable/Disable Mobile Number Verification in Guest Checkout Mode | To allow the merchant to enable or disable mobile number verification during guest checkout, with visibility rules based on the Guest Checkout setting | **HIGH** |
| **UC 10** | Consumer | Verify Mobile Number during Guest Checkout Mode | To verify the consumer’s mobile number during guest checkout when Guest Checkout Verification is enabled | **HIGH** |

### Consumer My Account
![](https://t7537039.p.clickup-attachments.com/t7537039/a48b9713-d343-4ff5-9f67-1af1179505c8/Flowchart%20(7).jpg)
#### UC 01 | Verify Mobile Number in Consumer My Account

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-01 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | April 21, 2023<br />August 12, 2025 by Frances Ramos |
| **Objectives** | To allow a Prosperna One Consumer to add their mobile number to their account and verify it via OTP. |
| **Actor** | Prosperna One Consumer |
| **Preconditions** | \- Customer is logged into the store.<br />\- Customer is on the My Account page. |
| **Conditions** | \- Condition 1: Consumer adds mobile number.<br />\- Condition 2: Consumer verifies mobile number via OTP. |
| **Steps** | **Condition 1: Add Mobile Number**<br />1\. Consumer logs in to their account in merchant's store [https://store.prosperna.com/account/login](https://cafeblissteststore.prosperna.com/account/login)<br />Consumer clicks on the Edit button in Personal Information.<br />2\. System displays a pop-up modal with fields:<br />\- First Name\*<br />\- Last Name\*<br />\- Email\*<br />\- Send Verification Code button<br />\- **Mobile Number\***<br />\- Save button<br />\- Close button<br />3\. Consumer can see mobile number field<br />System displays default country code based on consumer's default shipping address (e.g. if shipping address is in Philippines, system displays Philippine flag in country code selector)<br />Consumer inputs their mobile number or edits the existing one.<br />4\. If input is in wrong format, system displays error message in red font color below the mobile number field: **_"_****Invalid phone format for this country.****_"_**<br />5\. Consumer clicks Save button.<br />6\. If mobile number is already used, system displays error toast message: **"Mobile number is already used and registered."**<br />7\. If valid and unique, system proceeds to send verification code via SMS.<br /><br />**Condition 2: Verify Mobile Number**<br />1\. System sends verification SMS with sender name **"Prosperna"** and message: **"Your Prosperna verification code is: \_\_\_\_"**.<br />2\. System displays the following below the mobile number field:<br />\- Code\* text box<br />\- Verify button<br />\- Resend Code button (disabled)<br />\- OTP Timer (2 minutes)<br />\- Message under text box: **"Your OTP Code will expire in 2 minutes"**<br /><br />3\. System sends success toast message: **"Enter the confirmation code that we sent to your mobile number."**<br />Consumer enters confirmation code and clicks **Verify**.<br />4\. System checks the validity of the verification code and displays the corresponding toast messages:<br />If incorrect code entered,<br />System displays error toast message: **"Invalid code provided. Enter the confirmation code that we sent to your mobile number."**<br />If code expired,<br />System displays error toast message: **"OTP Code is expired. Click Resend Code and try again."**<br />If correct and valid,<br />System saves mobile number, displays success toast message **"Successfully verified mobile number."**, and adds a **"Verified"** tag beside the mobile number. (see design)<br />5\. Consumer clicks **Save**<br />6\. System displays success toast message: **"Successfully updated personal information."**<br />7\. System saves changes to database |
| **Postconditions** | \- Mobile number is saved and marked as verified in the customer’s account. |
| **Business Trigger** | Customer wants to add their mobile number to their account for verification. |
| **Acceptance Criteria** | \- Mobile number format validation works correctly.<br />\- Duplicate mobile numbers are not allowed.<br />\- OTP is sent and can be resent with timer reset.<br />\- Mobile number is saved only after successful verification.<br />\- “Verified” tag is displayed after success. |
| **Estimates** | To be determined by the development team. |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />\- Mobile number should be:<br />     - Numbers with 10 characters<br />     - +63 (default)<br />     - format: xxx xxxx xxx<br />\- OTP Code is valid for 2 minutes<br />Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

####   

#### UC 02 | Display Countdown Timer for Verification Code Validity

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-02 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 14, 2025 |
| **Objectives** | To display a countdown timer indicating the validity period (2 minutes) for a mobile verification code once it is sent to the user. |
| **Actor** | Consumer |
| **Preconditions** | \- Consumer is logged in to their account.<br />\- Consumer is in My Account/Profile page > Update Personal Information modal<br />\- Consumer is in mobile number section of the modal<br />\- Consumer has initiated mobile number verification (new or updated number).<br />\- System has sent an OTP to the user’s mobile number. |
| **Conditions** | \- Condition 1: User enters OTP within 2 minutes.<br />\- Condition 2: OTP timer expires before user enters OTP. |
| **Steps** | **Condition 1: OTP Entered Within Time Limit**<br />1\. System sends verification code via SMS to the consumer’s mobile number.<br />2\. System displays countdown timer (see design)<br />3\. System starts countdown timer from 120 (equivalent to 2 minutes) to 0.<br />4\. Consumer enters OTP before timer reaches zero.<br />5\. System validates OTP.<br />6\. If correct, system confirms verification and displays success message.<br /><br />**Condition 2: OTP Timer Expired**<br />1\. Countdown timer reaches zero without valid OTP entered.<br />2\. System displays error toast message: _"OTP Code is expired. Click Resend Code and try again."_<br />3\. Consumer clicks **Resend Code**.<br />4\. System sends a new OTP, resets timer to 2 minutes, and displays success toast message: _"Enter the confirmation code that we sent to your mobile number."_ |
| **Postconditions** | \- Consumer either successfully verifies within the time limit or must request a new OTP after expiry.<br />\- Timer resets each time a new OTP is sent. |
| **Business Trigger** | Consumer has initiated mobile number verification and system has sent OTP. |
| **Acceptance Criteria** | \- Countdown timer is visible immediately after OTP is sent.<br />\- Timer counts down from 2 minutes to 0.<br />\- Once expired, OTP cannot be validated.<br />\- Resend Code button resets timer to 2 minutes with a new OTP. |
| **Estimates** | To be determined by development team. |
| **Error Messages** | \- _"OTP Code is expired. Click Resend Code and try again."_ |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

####   

#### UC 03 | Resend OTP Verification Code in Consumer My Account

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-03 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 13, 2025 |
| **Objectives** | To allow the Prosperna One Consumer to resend the OTP verification code for mobile number verification. |
| **Actor** | Prosperna One Merchant |
| **Preconditions** | \- Consumer is logged into the store.<br />\- Consumer is on the My Account page.<br />\- Consumer has initiated mobile number verification.<br />\- Consumer is on the verification screen with the confirmation code input field visible. |
| **Conditions** | \- Condition 1: Consumer tries to click “Resend Code” before OTP expiration.<br />\- Condition 2: Consumer clicks “Resend Code” after OTP expiration. |
| **Steps** | **Condition 1: Resend Before Expiration**<br />1\. Consumer is on the OTP verification screen.<br />2\. System detects that timer is still valid and ongoing<br />3\. System detects that verification code is still valid and not yet expired<br />3\. System disables **Resend Code** button.<br /><br />**Condition 2: Resend After Expiration**<br />1\. Consumer is on the OTP verification screen and the OTP timer has expired.<br />2\. System enables the Resend Code button<br />3\. Consumer clicks the **Resend Code** button.<br />4\. System sends a new OTP to the consumer’s registered mobile number.<br />5\. System resets OTP timer to 2 minutes.<br />6\. System displays a success toast message: _"Enter the confirmation code that we sent to your mobile number."_<br /> |
| **Postconditions** | \- Consumer receives a new OTP via SMS.<br />\- OTP timer is reset to 2 minutes. |
| **Business Trigger** | Consumer requests a new OTP by clicking **Resend Code** during mobile number verification. |
| **Acceptance Criteria** | \- OTP is resent successfully to the registered mobile number.<br />\- OTP timer is reset to 2 minutes.<br />\- Notification message is displayed to the Merchant.<br />\- OTP is valid only for the set time duration. |
| **Estimates** | To be determined by the development team. |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

#### UC 04 | Display Verified Tag for Consumer's Mobile Number

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-04 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 13, 2025 |
| **Objectives** | To display a "Verified" tag beside the mobile number of a Prosperna One Consumer in the My Account page when the number has been successfully verified. |
| **Actor** | System |
| **Preconditions** | \- Consumer is logged into the store.<br />\- Consumer is on the My Account page.<br />\- Consumer’s mobile number has been successfully verified via OTP. |
| **Conditions** | \- Condition 1: Display verified tag for verified numbers. |
| **Steps** | **Condition 1: Verified Number**<br />1\. Consumer logs into their store account.<br />2\. Consumer navigates to the My Account page.<br />3\. System checks the verification status of the stored mobile number.<br />4\. If status is “**Verified**,” system displays a "Verified" tag beside the mobile number field. (see design)<br />5\. "Verified" tag is styled according to design specs (e.g., green text in tag form). |
| **Postconditions** | \- Verified mobile numbers are clearly marked for the consumer in the My Account page. |
| **Business Trigger** | Consumer has completed mobile number verification and views their My Account page. |
| **Acceptance Criteria** | \- "Verified" tag is displayed only for verified mobile numbers.<br />\- No tag is shown for unverified numbers.<br />\- Tag styling matches approved design specs. |
| **Estimates** | To be determined by the development team. |
| **Error Messages** | N/A – Display-only functionality. |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

### Merchant My Account
![](https://t7537039.p.clickup-attachments.com/t7537039/a48b9713-d343-4ff5-9f67-1af1179505c8/Flowchart%20(7).jpg)

#### UC 05 | Verify Mobile Number in Merchant My Account

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-05 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 13, 2025 |
| **Objectives** | To allow a merchant to update and verify their mobile number in the My Account page. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is logged in to the dashboard.<br />\- Merchant has access to My Account page.<br />\- Merchant’s mobile number is not yet verified or needs to be updated. |
| **Conditions** | \- Condition 1: Merchant enters valid and unique mobile number.<br />\- Condition 2: Merchant enters an invalid mobile number format.<br />\- Condition 3: Merchant enters a mobile number that is already registered.<br />\- Condition 4: Merchant enters incorrect or expired OTP code. |
| **Steps** | **Condition 1: Valid & Unique Number**<br />1\. Merchant logs in<br />   - Merchant clicks Profile Icon at the navigation bar<br />   - System loads the dropdown menu with options: My Account, Billing, Refer & Earn, Get Help, "Get it on Google Play" button, Log Out.<br />2\. Merchant clicks **My Account**.<br />3\. System loads account page showing:<br />   - Profile Pic<br />       - Edit<br />   - Personal Information tab (default)<br />       - Name<br />       - Email<br />       - **Mobile Number**<br />       - Legal<br />       - Terms of Service<br />       - Privacy Policy<br />       - Delete Account<br />   - My Author Profile tab<br />4\. Merchant clicks **Edit** button beside **Mobile Number**.<br />5\. System displays modal with fields:<br />   - Mobile Number\*<br />   - Cancel button<br />   - Save button<br />6\. System displays default country code based on merchant's store location address (e.g. if shipping address is in Philippines, system displays Philippine flag in country code selector)<br />7\. Merchant inputs a new number or edits their existing one<br />   - If mobile number is invalid, system displays error message in red font color below the mobile number field: **_"_****Invalid phone format for this country.****_"_**<br />   - Merchant clicks **Save**.<br />8\. System validates format, uniqueness, and that number is not already registered.<br />If mobile number is already used, system displays error toast message: **"Mobile number is already used and registered."**<br />If valid and unique, system proceeds to send verification code via SMS.<br />9\. System sends verification SMS from sender **"Prosperna"** with message: **"Your Prosperna verification code is: \_\_\_".**<br />10\. System displays the following fields:<br />   - Confirmation Code\* text box<br />   - Resend Code button (disabled)<br />   - OTP timer (2 minutes)<br />   - Cancel button<br />   - Save button<br />11\. System displays success toast message: **"Enter the confirmation code that we sent to your mobile number."**<br />12\. Merchant enters OTP and clicks **Save**.<br />13\. System validates OTP and updates mobile number if correct.<br />14\. System displays success message: **"Successfully verified mobile number."** and shows **Verified** tag beside number.<br /><br />**Condition 2: Invalid Number Format**<br />1\. Merchant enters mobile number in incorrect format.<br />2\. System displays error: _"Invalid phone format for this country."_<br /><br />**Condition 3: Number Already Registered**<br />1\. Merchant enters mobile number that exists in system.<br />2\. System displays error: _"Mobile number is already used and registered."_<br /><br />**Condition 4: Incorrect or Expired OTP**<br />1\. Merchant enters incorrect OTP.<br />2\. System displays error: **"Invalid code provided. Enter the confirmation code that we sent to your mobile number."**<br />3\. If OTP is expired, system displays: **"OTP Code is expired. Click Resend Code and try again."**<br />4\. Merchant clicks **Resend Code** and system sends new OTP, resets timer, and displays pop-up notification. |
| **Postconditions** | \- Merchant’s mobile number is updated and verified.<br />\- **Verified** tag is shown beside mobile number in My Account. |
| **Business Trigger** | Merchant wants to edit and verify their mobile number. |
| **Acceptance Criteria** | \- Merchant can update mobile number only if format is valid.<br />\- Mobile number must be unique in the system.<br />\- OTP verification is required before saving.<br />\- Verified tag is shown once verification is successful. |
| **Estimates** | To be determined by development team. |
| **Error Messages** | \- _"Invalid phone format for this country."_<br />\- _"Mobile number is already used and registered."_<br />\- _"Invalid code provided. Enter the confirmation code that we sent to your mobile number."_<br />\- _"OTP Code is expired. Click Resend Code and try again."_ |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

#### UC 06 | Display Countdown Timer for Verification Code Validity

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-06 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 14, 2025 |
| **Objectives** | To display a countdown timer indicating the validity period (2 minutes) for a mobile verification code once it is sent to the user. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is logged in to their account.<br />\- Merchant is in My Account > Personal Information tab<br />\- Merchant is in the mobile number section of the page<br />\- Merchant has initiated mobile number verification (new or updated number).<br />\- System has sent an OTP to the user’s mobile number. |
| **Conditions** | \- Condition 1: Merchant enters OTP within 2 minutes.<br />\- Condition 2: OTP timer expires before user enters OTP. |
| **Steps** | **Condition 1: OTP Entered Within Time Limit**<br />1\. System sends verification code via SMS to the merchant's mobile number.<br />2\. System displays countdown timer (see design)<br />3\. System starts countdown timer from 120 (equivalent to 2 minutes) to 0.<br />4\. Merchant enters OTP before timer reaches zero.<br />5\. System validates OTP.<br />6\. If correct, system confirms verification and displays success message.<br /><br />**Condition 2: OTP Timer Expired**<br />1\. Countdown timer reaches zero without valid OTP entered.<br />2\. System displays error toast message: _"OTP Code is expired. Click Resend Code and try again."_<br />3\. Merchant clicks **Resend Code**.<br />4\. System sends a new OTP, resets timer to 2 minutes, and displays success toast message: _"Enter the confirmation code that we sent to your mobile number."_ |
| **Postconditions** | \- Merchant either successfully verifies within the time limit or must request a new OTP after expiry.<br />\- Timer resets each time a new OTP is sent. |
| **Business Trigger** | Merchant has initiated mobile number verification and system has sent OTP. |
| **Acceptance Criteria** | \- Countdown timer is visible immediately after OTP is sent.<br />\- Timer counts down from 2 minutes to 0.<br />\- Once expired, OTP cannot be validated.<br />\- Resend Code button resets timer to 2 minutes with a new OTP. |
| **Estimates** | To be determined by development team. |
| **Error Messages** | \- _"OTP Code is expired. Click Resend Code and try again."_ |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

####   

#### UC 07 | Resend OTP Verification Code in Merchant My Account

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-07 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 13, 2025 |
| **Objectives** | To allow the Prosperna One Merchant to resend the OTP verification code for mobile number verification. |
| **Actor** | Prosperna One Merchant |
| **Preconditions** | \- Merchant is logged into the store.<br />\- Merchant is on the My Account page.<br />\- Merchant has initiated mobile number verification.<br />\- Merchant is on the verification screen with the confirmation code input field visible. |
| **Conditions** | \- Condition 1: Merchant tries to click “Resend Code” before OTP expiration.<br />\- Condition 2: Merchant clicks “Resend Code” after OTP expiration. |
| **Steps** | **Condition 1: Resend Before Expiration**<br />1\. Merchant is on the OTP verification screen.<br />2\. System detects that timer is still valid and ongoing<br />3\. System detects that verification code is still valid and not yet expired<br />3\. System disables **Resend Code** button.<br /><br />**Condition 2: Resend After Expiration**<br />1\. Merchant is on the OTP verification screen and the OTP timer has expired.<br />2\. System enables the Resend Code button<br />3\. Merchant clicks the **Resend Code** button.<br />4\. System sends a new OTP to the consumer’s registered mobile number.<br />5\. System resets OTP timer to 2 minutes.<br />6\. System displays a success toast message: _"Enter the confirmation code that we sent to your mobile number."_<br /> |
| **Postconditions** | \- Merchant receives a new OTP via SMS.<br />\- OTP timer is reset to 2 minutes. |
| **Business Trigger** | Merchant requests a new OTP by clicking **Resend Code** during mobile number verification. |
| **Acceptance Criteria** | \- OTP is resent successfully to the registered mobile number.<br />\- OTP timer is reset to 2 minutes.<br />\- Notification message is displayed to the Merchant.<br />\- OTP is valid only for the set time duration. |
| **Estimates** | To be determined by the development team. |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

#### UC 08 | Display Verified Tag for Merchant's Mobile Number

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-08 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 13, 2025 |
| **Objectives** | To display a "Verified" tag beside the mobile number of a Prosperna One Merchant in the My Account page when the number has been successfully verified. |
| **Actor** | System |
| **Preconditions** | \- Merchant is logged into the store.<br />\- Merchant is on the My Account page.<br />\- Merchant's mobile number has been successfully verified via OTP. |
| **Conditions** | \- Condition 1: Display verified tag for verified numbers. |
| **Steps** | **Condition 1: Verified Number**<br />1\. Merchant logs into their account.<br />2\. Merchant navigates to the My Account page.<br />3\. System checks the verification status of the stored mobile number.<br />4\. If status is “**Verified**,” system displays a "Verified" tag beside the mobile number field. (see design)<br />5\. "Verified" tag is styled according to design specs (e.g., green text in tag form). |
| **Postconditions** | \- Verified mobile numbers are clearly marked for the Merchant in the My Account page. |
| **Business Trigger** | Merchant has completed mobile number verification and views their My Account page. |
| **Acceptance Criteria** | \- "Verified" tag is displayed only for verified mobile numbers.<br />\- No tag is shown for unverified numbers.<br />\- Tag styling matches approved design specs. |
| **Estimates** | To be determined by the development team. |
| **Error Messages** | N/A – Display-only functionality. |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br />\- My Account<br />\- SMS<br /> |

### Consumer Checkout
![](https://t7537039.p.clickup-attachments.com/t7537039/8574c5c3-5c38-43bd-ad36-18fb6f0f338b/Flowchart%20(9).jpg)
#### UC 09 | Enable/Disable Mobile Number Verification in Guest Checkout Mode

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-09 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 15, 2025 |
| **Objectives** | To allow the merchant to enable or disable mobile number verification during guest checkout, with visibility rules based on the Guest Checkout setting |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is on the **Shipping Settings** page |
| **Conditions** | \- Condition 1: Guest Checkout toggle is ON and Guest Checkout Verification toggle is OFF (Enable flow)<br />\- Condition 2: Guest Checkout toggle is ON and Guest Checkout Verification toggle is ON (Disable flow)<br />\- Condition 3: Guest Checkout toggle is OFF (Guest Checkout Verification toggle should be hidden) |
| **Steps** | **Condition 1 – Enable Guest Checkout Verification:**<br />1\. System loads the Shipping Settings page with the following fields:<br /> - Guest Checkout<br />  - Tool Tip<br />  - Switch ON/OFF<br /> - Guest Checkout Verification<br />  - Tool Tip<br />  - Switch ON/OFF<br />   - Standard Delivery<br />   - Same Day Delivery<br />   - Manual Shipping by Customer<br />   - Manual Shipping by Merchant<br />   - Store Pickup<br />   - Scheduled Delivery<br />2\. Merchant clicks on the "Guest Checkout Verification" toggle switch and turns it ON.<br />3\. System enables mobile number verification for guest checkout.<br /><br />**Condition 2 – Disable Guest Checkout Verification:**<br />1\. System loads the Shipping Settings page with the same fields as above.<br />2\. Merchant clicks on the "Guest Checkout Verification" toggle switch and turns it OFF.<br />3\. System disables the mobile number verification requirement during guest checkout.<br /><br />**Condition 3 – Guest Checkout Disabled:**<br />1\. Merchant turns the "Guest Checkout" toggle switch to OFF.<br />2\. System hides the "Guest Checkout Verification" toggle from the Shipping Settings page.<br />3\. Guest checkout verification feature is automatically disabled if it was previously ON. |
| **Postconditions** | \- Guest Checkout Verification setting is updated successfully.<br />\- Visibility of Guest Checkout Verification toggle follows the state of the Guest Checkout toggle.<br />\- If Guest Checkout is OFF, verification feature is automatically OFF and hidden. |
| **Business Trigger** | Merchant wants to configure mobile number verification behavior for guest checkout. |
| **Acceptance Criteria** | \- "Guest Checkout" toggle must be ON for "Guest Checkout Verification" toggle to appear.<br />\- Guest Checkout Verification toggle changes state correctly based on merchant’s selection.<br />\- If "Guest Checkout" is OFF, the Guest Checkout Verification toggle is hidden and disabled. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If "Guest Checkout" toggle is OFF, the "Guest Checkout Verification" toggle is hidden and cannot be toggled. |
| **UI Behavior Notes** | \- When Guest Checkout is turned OFF, the Guest Checkout Verification toggle is automatically turned OFF (if previously ON).<br />\- When Guest Checkout is turned back ON, the Guest Checkout Verification toggle should **default to OFF** (merchant must re-enable manually).<br />\- Toggle states should persist per merchant account settings and should be saved in real time upon interaction. |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br /> \- Checkout<br /> \- Shipping<br /> \- SMS<br /> |

#### UC 10 | Verify Mobile Number during Guest Checkout Mode

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-10 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 15, 2025 |
| **Objectives** | To verify the consumer’s mobile number during guest checkout when Guest Checkout Verification is enabled |
| **Actor** | Consumer (Guest Checkout) |
| **Preconditions** | \- Consumer is checking out as a guest<br />\- "Guest Checkout" toggle is ON in Shipping Settings<br />\- "Guest Checkout Verification" toggle is ON in Shipping Settings |
| **Conditions** | \- Condition 1: Consumer enters a valid verification code within the allowed time<br />\- Condition 2: Consumer enters an invalid verification code<br />\- Condition 3: Verification code expires before consumer submits |
| **Steps** | **Condition 1 – Successful Verification:**<br />1\. Consumer checks out via guest checkout.<br />2\. Consumer fills in required checkout fields (including mobile number).<br />3\. Consumer clicks **Pay Now** button.<br />4\. System detects consumer is a guest.<br />5\. System detects "Guest Checkout Verification" is enabled in Shipping Settings.<br />6\. System displays modal with:<br /> - Text field for verification code<br /> - Submit button<br /> - Resend Code button (disabled initially)<br /> - Countdown timer for code validity<br />7\. System sends verification code to consumer’s mobile number.<br />8\. System displays success toast message: _"Verification code sent to your mobile number."_<br />9\. System starts countdown timer (2 minutes).<br />10\. Consumer inputs verification code in text field.<br />11\. Consumer clicks **Submit**.<br />12\. System verifies the code is valid and not expired.<br />13\. System displays success toast message: _"Mobile number verified successfully."_<br />14\. Consumer proceeds through the payment process.<br /><br />**Condition 2 – Invalid Code:**<br />1–11. Same as above until submission.<br />12\. System detects invalid code.<br />13\. System displays error toast message: _"Invalid code provided. Please check and try again."_<br />14\. Consumer can re-enter the code or request resend once Resend Code is enabled.<br /><br />**Condition 3 – Expired Code:**<br />1–11. Same as above until submission.<br />12\. System detects code is expired.<br />13\. System displays error toast message: _"OTP Code is expired. Click Resend Code and try again."_ |
| **Postconditions** | \- Mobile number is verified successfully before payment process starts.<br />\- If verification fails, consumer cannot proceed with payment until verification is completed. |
| **Business Trigger** | Consumer initiates guest checkout and mobile verification is required per merchant settings. |
| **Acceptance Criteria** | \- Verification modal appears only when "Guest Checkout Verification" is enabled.<br />\- Timer starts automatically when code is sent.<br />\- Resend Code button becomes active only after timer expires.<br />\- Error messages are displayed for invalid or expired codes.<br />\- Payment process only continues after successful verification. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- _"Invalid code provided. Please check and try again."_<br />\- _"OTP Code is expired. Click Resend Code and try again."_ |

| **Business Rules/Desired Behavior** |
| --- |
| Identify impacted modules (amend if there is something missing)<br /> \- Checkout<br /> \- Shipping<br /> \- SMS<br /> |

## **Nonfunctional Requirements**

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | OTP SMS must be delivered to user within 5 seconds. | High |
|  | Verification process (checking OTP) must complete within 2 seconds. | High |
| **Security Requirements** | OTP must be generated randomly to prevent predictability. | High |
|  | Limit OTP resend attempts to reduce spam and brute force risks. | Medium |
|  | Encrypt stored mobile numbers to protect sensitive data. | High |
| **Usability Requirements** | Display clear, step-by-step instructions for the user. | Medium |
|  | Show a prominent countdown timer for OTP expiration. | Medium |
| **Reliability Requirements** | OTP service must maintain 99.9% uptime availability. | High |
| **Scalability Requirements** | Support at least 500 concurrent OTP sends during peak traffic. | High |
| **Maintenance & Supportability Requirements** | Define monitoring, logging, and error-handling mechanisms for OTP service. | Medium |
| **Compatibility Requirements** | Ensure support for all modern browsers and mobile devices. | High |
| **Regulatory & Compliance Requirements** | Must comply with local telecom and privacy regulations (e.g., GDPR, DPA). | High |

## Constraints
*   Limited to one verified mobile number per account.
*   SMS delivery dependent on third-party provider uptime.
## Assumptions
*   Customer has access to a valid mobile number and can receive SMS.
*   SMS provider is integrated and operational.
## Acceptance Criteria

| **AC ID** | **Area** | **Description** |
| ---| ---| --- |
| **Merchant My Account** |
| AC-M01 | Merchant My Account | Countdown starts immediately after OTP is sent. |
| AC-M02 | Merchant My Account | Countdown resets when “Resend Code” is clicked. |
| AC-M03 | Merchant My Account | “Resend Code” disabled while OTP is valid. |
| AC-M04 | Merchant My Account | OTP expires exactly after 2 minutes. |
| AC-M05 | Merchant My Account | “Verified” tag shown upon OTP match. |
| AC-M06 | Merchant My Account | System rejects duplicate mobile numbers. |
| AC-M07 | Merchant My Account | Error shown for invalid mobile number format. |
| AC-M08 | Merchant My Account | Success toast shown when OTP is sent. |
| AC-M09 | Merchant My Account | Error toast shown for expired/invalid OTP. |
| **Consumer My Account** |
| AC-C01 | Consumer My Account | Countdown starts immediately after OTP is sent. |
| AC-C02 | Consumer My Account | Countdown resets when “Resend Code” is clicked. |
| AC-C03 | Consumer My Account | “Resend Code” disabled while OTP is valid. |
| AC-C04 | Consumer My Account | OTP expires exactly after 2 minutes. |
| AC-C05 | Consumer My Account | “Verified” tag shown upon OTP match. |
| AC-C06 | Consumer My Account | System rejects duplicate mobile numbers. |
| AC-C07 | Consumer My Account | Error shown for invalid mobile number format. |
| AC-C08 | Consumer My Account | Success toast shown when OTP is sent. |
| AC-C09 | Consumer My Account | Error toast shown for expired/invalid OTP. |
| **Guest Checkout Mode** |
| AC-G01 | Guest Checkout | OTP verification enforced when toggle is ON. |
| AC-G02 | Guest Checkout | Countdown starts immediately after OTP is sent. |
| AC-G03 | Guest Checkout | Countdown resets when “Resend Code” is clicked. |
| AC-G04 | Guest Checkout | “Resend Code” disabled while OTP is valid. |
| AC-G05 | Guest Checkout | OTP expires exactly after 2 minutes. |
| AC-G06 | Guest Checkout | “Verified” tag shown upon OTP match. |
| AC-G07 | Guest Checkout | System rejects duplicate mobile numbers. |
| AC-G08 | Guest Checkout | Error shown for invalid mobile number format. |
| AC-G09 | Guest Checkout | Success toast shown when OTP is sent. |
| AC-G10 | Guest Checkout | Error toast shown for expired/invalid OTP. |

## **Wireframes**
[Figma file](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=14977-23035&t=orIXDTeSuPUmXnNL-4)
## **Figma Design File ℅ UX UI Designer**
Prototype: [Prototype file](https://www.figma.com/proto/JWhZF9UHb30MheP34cNAJs/Mobile-Number-Verification-v2?page-id=9%3A2415&node-id=22-5035&viewport=393%2C146%2C0.03&t=83LulSFTdVN5O18Y-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=21%3A2171&show-proto-sidebar=1)<br />
Design: [Figma file](https://www.figma.com/design/JWhZF9UHb30MheP34cNAJs/Mobile-Number-Verification-v2?node-id=1-2&p=f&t=8cTXDlFcgPlSX2Qo-0)

| **Title** | **Design** |
| ---| --- |
| **Consumer My Account** |
| Display send verification code button | ![](https://t7537039.p.clickup-attachments.com/t7537039/65585304-f6f6-4105-957b-f8af4c11f297/image.png) |
| Display error toast message when mobile number is already registered | ![](https://t7537039.p.clickup-attachments.com/t7537039/6c12d8db-3c35-4d7d-bd74-d651f6d388e6/image.png) |
| Display code text box, OTP timer, resend code button, verify button<br />Display success toast message when verification code has been successfully sent to mobile number<br /><br /> | ![](https://t7537039.p.clickup-attachments.com/t7537039/54d35bbd-500e-43f3-ac4b-8c316062a782/image.png) |
| Display error toast message when code is invalid | ![](https://t7537039.p.clickup-attachments.com/t7537039/90ec1e95-d607-4d9a-924c-fa790454df1f/image.png) |
| Display success toast message when mobile number has been verified | ![](https://t7537039.p.clickup-attachments.com/t7537039/64bac5d9-1f5b-4adf-8eee-2ca73dd8f951/image.png) |
| Add "Verified" tag to mobile number | ![](https://t7537039.p.clickup-attachments.com/t7537039/01adab03-433b-412d-bd32-980812c8f0fc/image.png) |
| **Merchant My Account** |
| Display error toast message when mobile number is already registered | ![](https://t7537039.p.clickup-attachments.com/t7537039/831c1a3c-f78f-4276-ad36-ee6b0facbef8/image.png) |
| Display code text box, OTP timer, resend code button, verify button<br />Display success toast message when verification code has been successfully sent to mobile number<br /> | ![](https://t7537039.p.clickup-attachments.com/t7537039/47f9ef4c-c4f5-4aee-bccb-f933593a39c5/image.png) |
| Display error toast message when code is invalid | ![](https://t7537039.p.clickup-attachments.com/t7537039/d1e8ce24-0c42-4515-85a2-4dde67f9ed73/image.png) |
| Display error toast message when code is expired | ![](https://t7537039.p.clickup-attachments.com/t7537039/e0fcb131-e7a6-4371-8858-985df466cf88/image.png) |
| Display success toast message when mobile number has been verified | ![](https://t7537039.p.clickup-attachments.com/t7537039/15aa14a0-bf75-450c-829e-e6b076a787ec/image.png) |
| Add "Verified" tag to mobile number | ![](https://t7537039.p.clickup-attachments.com/t7537039/327580f1-d595-4e3f-99c8-8165770eb721/image.png) |
| **Consumer Checkout** |
| Display toggle switch to enable/disable mobile number verification in guest checkout mode | ![](https://t7537039.p.clickup-attachments.com/t7537039/28bc8a77-fe10-4d7e-bf40-fcbc866416c3/image.png) |
| Display verify mobile number modal<br />Display success toast message when verification code has been successfully sent to mobile number<br /> | ![](https://t7537039.p.clickup-attachments.com/t7537039/d89c7caa-b065-44c0-b899-1da422e53ea3/image.png) |
| Display error toast message when code is invalid | ![](https://t7537039.p.clickup-attachments.com/t7537039/3adb60fb-a03b-4e7c-91af-f232ceaa1fb1/image.png) |
| Display error toast message when code is expired | ![](https://t7537039.p.clickup-attachments.com/t7537039/0acaef64-daa7-48aa-9707-a3a60a42342d/image.png) |
| Display success toast message when mobile number has been verified | ![](https://t7537039.p.clickup-attachments.com/t7537039/9965f746-8860-42cf-9238-36c3cb50450a/image.png) |

## **Clickup Task**
[Consumer My Account (UC 01-04)](https://app.clickup.com/t/865buut3y)<br />
[Merchant My Account (UC 05-08)](https://app.clickup.com/t/865buuqgr)<br />
[Consumer Checkout (UC 09-10)](https://app.clickup.com/t/865butynz)<br />
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed | August 15, 2025 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br /> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |