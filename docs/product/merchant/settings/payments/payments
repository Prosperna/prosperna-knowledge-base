---
id: payments-module
title: Payments Module
sidebar_label: Payments Module BRD
sidebar_position: 1
---
# Prosperna One | Payments Page

## Summary
Prosperna myPay accepts a wide range of payment methods that will help increase sales, save money and provide a better customer experience.  
Merchants can submit their personal and business documentation to activate Prosperna Payments and offer a wide range of payment options for their customers.

## Problem Statement
Payments page will be developed in Prosperna One. This feature exists on myChat but has no documentation for developers reference.

## Scope
This will only cover the payments page under Settings.

## Use Cases

### UC01 | Payments Registration
**Actor:** Prosperna One User  
**Objective:** Users should be able to submit a payment registration  
**Preconditions:** User is on the dashboard  
**Post Conditions:** User has successfully submitted a payment registration  
**Business Trigger:** User wants to submit a payment registration for online store  

**Main Path / Flow:**
1. System loads dropdown menu (Store, Payments, Shipping, Email, SMS, Sales Channel, myStore, Team, Tags, Users)  
2. User clicks "Marketplace" → "Payments"  
3. System loads Payments Page with fields: Payment Cards, Activate Button, myPay services (E-Wallets, Credit/Debit Cards, Bank Transfers (temporarily unavailable), Over the Counter)  
4. User clicks "Learn More" → "Activate Now"  
5. System loads modal: Overview, Features, Activate Button, Close Icon, message redirecting to marketplace  
6. User clicks "Go to Marketplace" → Overview and Features tabs  
7. User clicks "Activate" button → System verifies email & mobile  
8. If verified, system loads modal redirecting to Payments Page; if not, prompt to verify  
9. User fills in Personal Information (First Name, Last Name, Address, Province, City, Barangay, Zipcode, Primary ID, Secondary ID)  
10. User uploads IDs  
11. User fills in Business Information (based on type: Individual, Sole Proprietor, Partnership, Corporation)  
12. User fills in Business Details (Social Media Page, Nature of Business)  
13. User fills in Banking Details (Bank/E-wallet, Bank Type, Account Info)  
14. User reads Statement of Authorization, signs and clicks Agree  
15. System loads Thank You Page → Back to Dashboard

**Business Rules / Desired Behavior:**
- New merchants activate myPay in Marketplace → My Apps tab  
- Default grayed out if not activated; redirects to marketplace  
- "Learn More" replaced with "Manage" once approved  
- Activate → Deactivate toggle after activation  
- Email & mobile verification required  
- ID uploads: .jpg/.png, max 25MB  

---

### UC02 | Approve Payments
**Actor:** Admin  
**Objective:** Admin should be able to approve payments registration  
**Preconditions:** Merchant has submitted registration; Admin is on homepage  
**Post Conditions:** Admin has successfully approved payment registration  

**Main Path / Flow:**
1. Admin clicks Billing Verification tab  
2. Select Pending tab  
3. Click action button → Approve  
4. Confirm approval → system checks required data  
5. Display success message → request approved  

**Business Rules / Desired Behavior:**
- Approved applications status → "Approved", moved to Approved tab  

---

### UC03 | Reject Payments
**Actor:** Admin  
**Objective:** Admin should be able to reject payments registration  
**Preconditions:** Merchant has submitted registration; Admin is on homepage  
**Post Conditions:** Admin has successfully rejected payment registration  

**Main Path / Flow:**
1. Admin clicks Billing Verification tab → Pending tab  
2. Click action button → Reject  
3. Fill Reason → Reject → system displays success message  
4. If no reason, error message displayed  

**Business Rules / Desired Behavior:**
- Rejected applications status → "Rejected", moved to Rejected tab  

---

### UC04 | Deactivate Payments
**Actor:** Prosperna One User  
**Objective:** Users should be able to deactivate payments  
**Preconditions:** User has approved billing; on dashboard  
**Post Conditions:** User has successfully deactivated payments  

**Main Path / Flow:**
1. Marketplace → My Apps → Manage myPay  
2. Click Deactivate → Confirm → system deactivates  
3. Close modal → success  

**Business Rules / Desired Behavior:**
- Payment methods unavailable  
- Related shipping toggles disabled  

---

### UC05 | Notification Bell - myPay Activation
**Actor:** System  
**Objective:** Notify users when myPay registration approved and activated  
**Preconditions:** User logged in; on dashboard  
**Post Conditions:** User receives notification and can navigate to Payments Page  

**Main Path / Flow:**
1. User sees red dot on notification bell → myPay activation message  
2. Click notification → redirected to Payments Page  

**Business Rules / Desired Behavior:**
- Payment methods available  
- Activate → Deactivate toggle  
- Notifications behave like standard notification bell  

---

### UC05 | Notification Bell - Rejected myPay Registration
**Actor:** System  
**Objective:** Notify users when myPay registration rejected  
**Preconditions:** User logged in; on dashboard  
**Post Conditions:** User receives notification and can resubmit myPay registration  

**Main Path / Flow:**
1. User sees red dot on notification bell → myPay rejection message with reason  
2. Click notification → redirected to myPay Registration  

**Business Rules / Desired Behavior:** Same as above  

---

### UC06 | Use Different Email for myPay Account Verification
**Actor:** Prosperna One Merchant  
**Objective:** Use different email for myPay activation  
**Business Rules / Desired Behavior:**
- OTP valid for 2 minutes  
- Merchant cannot reuse email from another account/store  
**Impacted Modules:** myPay, Email Verification, Mobile Number Verification
  
---
functional_requirements:
  use_cases:
    - id: UC01
      actor: Prosperna One User
      name: Payments Registration
      description: Users should be able to register payments
      priority: HIGH
    - id: UC02
      actor: Admin
      name: Approve Payments
      description: Admin should be able to approve payments registration
      priority: HIGH
    - id: UC03
      actor: Admin
      name: Reject Payments
      description: Admin should be able to reject payments registration
      priority: HIGH
    - id: UC04
      actor: Prosperna One User
      name: Activate Payments
      description: Users should be able to activate payments
      priority: HIGH
    - id: UC05
      actor: Prosperna One User
      name: Deactivate Payments
      description: User should be able to deactivate payments
      priority: HIGH
    - id: UC06
      actor: Prosperna One Merchant
      name: Use Different Email for myPay Account Verification
      description: To use a different email for myPay activation
      priority: HIGH
nonfunctional_requirements:
  - name: Responsiveness
    description: Website display can be resized to any screen dimension without compromising interface.
    priority: HIGH
  - name: System Performance
    description: System should generate output within 3 seconds
    priority: HIGH
wireframes:
  UC06: "https://www.figma.com/file/YBhF7WvFuormZFkhpVfsuU/Prosperna-Wireframe-copy?type=design&node-id=1-3244&mode=design&t=nceSjk2xQ6hoQgN7-4"
  Bank_Transfer: "https://www.figma.com/file/YBhF7WvFuormZFkhpVfsuU/Prosperna-Wireframe-copy?type=design&node-id=1484-7963&mode=design&t=iEw3F7Oolpk3NGuu-4"
figma_design_file: "https://www.figma.com/file/OGFDstVvBL0Ax426SC8OPe/myChat-Web?node-id=6502%3A6297"
clickup_task: "https://app.clickup.com/t/3e6btfb"
logs:
  - CR_number: CR-1001
    name: Frances
    action: Added Use Case 06 | Use Different Email for myPay Account Verification
    use_case: UC06
    date: "March 5, 2024"
    related_doc: "https://app.clickup.com/t/865bvcdkr"
  - CR_number: CR-1002
    name: Frances
    action: Bank Transfers card should have a coming soon message & appear unavailable
    use_case: UC01
    date: "April 5, 2024"
    related_doc: "https://app.clickup.com/t/86enkcfvt"
  - CR_number: CR-1003
    name: Adrianne
    action: Added note below Payments page for editing myPay information
    use_case: UC01
    date: "May 10, 2024"
    related_doc: "https://app.clickup.com/t/860t5vk59"
testing_documentation:
  - name: myPay Activation | Use Different Email
    description: Involves changes on UC06
    clickup_task: "https://app.clickup.com/t/865bvcdkr"
    test_cases: myPay Activation | Use Different Email
signed_off:
  - name: Dennis
    role: CEO
    status: Signed off
  - name: Ruel
    role: HoE
    status: Signed off
  - name: Frances
    role: BA
    status: Completed (CR-1001)
    date: "March 5, 2024"
  - name: Diane
    role: QA
    status: Passed (UC06)
    date: "June 6, 2024"
  - name: Frances
    role: BA
    status: Completed (CR-1002)
    date: "April 5, 2024"
  - name: Adrianne
    role: BA
    status: Completed (CR-1003)
    date: "May 10, 2024"
  - name: Christian
    role: PM
    ---