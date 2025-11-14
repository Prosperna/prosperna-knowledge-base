---
title: "Prosperna One | Dedication/Gift Note BRD"
version: "1.0"
date_created: "2025-11-14"
author: "Jomari"
stakeholders:
  - Dennis: CEO
  - Ruel: HoE
  - Jomari: BA
  - Christian: PM
plans_available: ["FREE", "PLUS", "PRO", "PREMIUM"]
price_per_month: 249.00
links:
  comparative_analysis: "https://www.amazon.in/"
  wireframes: "https://www.figma.com/design/qBkujzywAdH1pGXcDDV4a9/Wireframe---Jomari?node-id=418-1578&t=p1pqcUAKpLF2IpVO-4"
  design_file: "https://www.figma.com/design/XQZ6TwOZcYNtyfTINm7ahN/Prosperna----User-Flows?node-id=26187-823&node-type=canvas&t=xRxDtRi9b67hhIDN-0"
  demo_video: "https://watch.prosperna.com/share/nim5v12vs0sgke4cs6t34blec0ccjize"
  enhancement_video: "https://t7537039.p.clickup-attachments.com/t7537039/9ca78350-7fe6-4331-a49a-539f6ec91d61/Gift%20Note.mp4?open=true"
  clickup_tasks:
    main_task: "https://app.clickup.com/t/86epbfydf"
    enhancement: "https://app.clickup.com/t/86erpam2n"
    qa_testing: "https://app.clickup.com/t/86epbfydf"
---
# Prosperna One | Dedication/Gift Note BRD

## Summary
This document focuses on adding a **Dedication/Gift Note** section in the Shopping Cart through the entire consumer checkout process.

## Problem Statement
Some customers want to order products as gifts and include a **gift note** for the recipient.

## Scope
- Available to **ALL plans**: FREE, PLUS, PRO, PREMIUM
- Price: **249.00 PhP / Month**

## Comparative Analysis
Checkout and gifting process example: [Amazon.in](https://www.amazon.in/)

## Functional Requirements

### Use Cases

| Use Case ID | Actor | Use Case Name | Short Description | Priority |
|------------|-------|---------------|-----------------|---------|
| UC 01 | Prosperna One Merchant | Marketplace: Gift Note | Enable Merchant to subscribe to Gift Note via Marketplace | HIGH |
| UC 02 | Prosperna One Customer | Checkout Process for Dedication/Gift Note | Enable Customer to add a Dedication/Gift Note to products in Cart | HIGH |
| UC 03 | Prosperna One Customer | Email Notifications for Products with Dedication/Gift Note | Enable Customer and Recipient to receive email notifications for orders with Gift Note | HIGH |

---

### UC 01 | Marketplace: Gift Note

**Prepared By:** Jomari  
**Objectives:** Enable Merchants to subscribe to Gift Note  
**Actor:** Merchant  
**Preconditions:** Merchant has activated **myPay**, customer is on Marketplace Page  

**Steps:**
1. Hover on Gift Note add-on (Title: Gift Note, Description: Let your customers add a gift message and send it via email)  
2. Click **Learn More**  
3. System loads modal with:  
   - Price: 249.00 PhP / Month  
   - Overview of the feature and benefits  
4. Click **Subscribe Now**  
5. Marketplace checkout displays Gift Note  
6. Select Payment Type  
   - If Credit Card, user enters credentials  
7. Tick acknowledgement checkbox regarding plan expiry  
8. Click **Pay Now**  
9. System redirects to payment channel  
10. Validate payment  
11. Display modal: *"Payment successful! Gift Note add-on added..."*  
   - Promo codes can apply discounts  

**Postconditions:**
- User subscribed to Gift Note add-on  
- Feature added to Customer’s Cart Page  

**Business Trigger:** Customer wants to send a gift with a note  

**Acceptance Criteria:** Gift Note integrated in Product and Order Fulfillment  

**Error Handling:**
- Show myPay activation modal if not active  
- Invalid promo code: "Sorry! The promo code does not exist."  

**Impacted Modules:** Marketplace, Online Store  

---

### UC 02 | Customer: Checkout Process for Dedication/Gift Note

**Prepared By:** Jomari  
**Objectives:** Customer places order with Dedication/Gift Note  
**Actor:** Customer  
**Preconditions:** Merchant subscribed to Gift Note  

**Steps:**
1. Load Product Listing Page  
2. Add preferred product to Cart  
3. Click **Cart**  
4. Load Cart Page  
5. Tick **"This product is a gift"** checkbox  
6. Gift Note section displays: Add Recipient, Gift Note, From {{Customer Name}}  
   - Recipient Email shows if **Add Recipient** clicked  
   - Customer Name autopopulated  
   - Max 150 characters in Gift Note  
   - Checkbox auto-ticked if Gift Note added  
7. Click **Checkout** and complete Billing, Shipping, Payment  
8. Edit Gift Note in Order Summary or **Add Gift Note** from product  

**Postconditions:**
- Order placed with Gift Note  

**Business Trigger:** Customer wants to send a gift with note  

**Acceptance Criteria:** Gift Note integrated in Product and Order Fulfillment  

**Impacted Modules:** Online Store  

---

### UC 03 | Email Notifications for Products with Dedication/Gift Note

**Prepared By:** Jomari  
**Objectives:** Send additional email content for Gift Note orders  
**Actor:** Customer  
**Preconditions:** Order with Gift Note placed  

**Steps:**
1. Send email to Recipient, Customer, Merchant  
   - Recipient receives Gift Note email & Order Status notifications  
   - Customer & Merchant receive updated email content  

**Postconditions:**
- Recipient, Customer, Merchant successfully receive emails  

**Business Trigger:** Merchant wants updated communication for Gift Note orders  

**Acceptance Criteria:** Customers can receive order notifications with Gift Notes  

**Impacted Modules:** Online Store  

---

## Nonfunctional Requirements

| Name | Description | Priority |
|------|-------------|---------|
| Responsiveness | Website resizes without interface compromise | HIGH |
| System Performance | Outputs generated within 3 seconds | HIGH |

---

## Success Criteria
- Add-on available for all plans  
- Automatically applies to Merchant’s account  
- Gift Note visible on Cart Page when products added  

---

## Wireframes & Designs
- [Wireframes](https://www.figma.com/design/qBkujzywAdH1pGXcDDV4a9/Wireframe---Jomari?node-id=418-1578&t=p1pqcUAKpLF2IpVO-4)  
- [Figma Design File](https://www.figma.com/design/XQZ6TwOZcYNtyfTINm7ahN/Prosperna----User-Flows?node-id=26187-823&node-type=canvas&t=xRxDtRi9b67hhIDN-0)  
- [Demo Video](https://watch.prosperna.com/share/nim5v12vs0sgke4cs6t34blec0ccjize)  
- [Enhancement Video](https://t7537039.p.clickup-attachments.com/t7537039/9ca78350-7fe6-4331-a49a-539f6ec91d61/Gift%20Note.mp4?open=true)  

---

## Future Enhancements
- Simplify UI/UX for Gift Note in Cart  
- Add Gift Note in My Account - Orders  
- Add validation logic for Gift Note button  
- Include Gift Note section in Merchant Orders Page  

---

## Signed Off
| Stakeholder | Role | Status |
|------------|------|-------|
| Dennis | CEO | - |
| Ruel | HoE | - |
| Jomari | BA | Completed |
| Christian | PM | - |

---

## Logs
| Name | Action | Description | Date | Related Docs |
|------|--------|------------|------|--------------|
| Jomari Adornado | Added Dedication/Gift Note as Marketplace Add-on | Available in Marketplace for 249.00 PhP / Month | March 7, 2025 | [Link](https://prosperna.larksuite.com/docx/GTUldKuxxoUHM1x92Qvueox2ste) |
