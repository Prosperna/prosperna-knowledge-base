---
id: gift-note-brd
title: Dedication/Gift Note BRD
sidebar_label: Gift Note
sidebar_position: 1
---

# Prosperna One | Dedication/Gift Note

## Summary
This document is focused on adding a Dedication/Gift Note section on the Shopping Cart section up to the whole consumer checkout process.

## Problem Statement
There are customers who want to order products from an Online Store and send it as a gift to their preferred recipient and adding a gift note pertaining to the products ordered.

## Scope
- This feature is available to ALL plans. (FREE, PLUS, PRO and PREMIUM)  
- **PRICE:** 249.00 PhP / Month

## Comparative Analysis
- https://www.amazon.in/ – Checkout and Gifting Process

## Research Proper
*(if applicable)*

---

# Functional Requirements

## Use Cases

| Use Case ID | Actor | Use Case Name | Short Description | Priority |
|-------------|--------|----------------|-------------------|----------|
| UC 01 | Prosperna One Merchant | Marketplace: Gift Note | Enable the Merchant to subscribe to the Gift Note feature via Marketplace | HIGH |
| UC 02 | Prosperna One Customer | Customer: Checkout Process for Dedication/Gift Note | Enable the Customer to add a Dedication/Gift Note to any products in their Shopping Cart | HIGH |
| UC 03 | Prosperna One Customer | Email Notifications for Products with Dedication/Gift Note | Enable the Customer and the Recipient to receive Email Notifications regarding orders with Dedication/Gift Note | HIGH |

---

# Use Case Description Tables

---

## UC 01 — Marketplace: Gift Note

| Column | Description |
|--------|-------------|
| **Use Case ID** | UC 01 |
| **Prepared By** | Jomari |
| **Last Updated** | |
| **Objectives** | To enable Merchants to subscribe to the Gift Note |
| **Actor** | Merchant |
| **Preconditions** | Merchant has activated their myPay; Customer is on the Marketplace Page |
| **Steps** | 1. User hovers through the Gift Note add-on titled Gift Note with description. 2. User clicks Learn More. 3. System loads the modal with price, availability, overview. 4. User clicks Subscribe Now. 5. System displays Marketplace checkout containing the add-on. 6. User selects payment type. 7. User ticks acknowledgment checkbox. 8. User clicks Pay Now. 9. User is redirected to appropriate payment channel. 10. System validates payment. 11. System displays confirmation modal. |
| **Additional Notes** | User can use a valid promo code for discounts. Credit card requires credential entry. |
| **Postconditions** | User successfully subscribed to the Gift Note add-on; System adds Gift Note feature to Customer Cart Page |
| **Business Trigger** | Customers want to send a product as a Gift with a Gift Note |
| **Acceptance Criteria** | System will add Gift Note as part of the Product and Order Fulfillment Process |
| **Estimates** | To be determined |
| **Error** | If myPay not activated → show activation modal. Invalid promo code → “Sorry! The promo code does not exist.” |

---

## UC 02 — Customer: Checkout Process for Dedication/Gift Note

| Column | Description |
|--------|-------------|
| **Use Case ID** | UC 02 |
| **Prepared By** | Jomari |
| **Last Updated** | |
| **Objectives** | Customer placed an order with a Dedication/Gift Note |
| **Actor** | Customer |
| **Preconditions** | Merchant is subscribed to Gift Note; Customer is on the Online Store Product Listing Page |
| **Steps** | 1. System loads Product Listing Page. 2. User selects product and clicks Add to Cart. 3. System adds product to Cart. 4. User goes to Cart. 5. System loads Cart Page. 6. User ticks “This product is a gift”. 7. System shows Gift Note section with Add Recipient, Gift Note, From fields. 8. User reviews notes and continues to checkout. 9. System loads Billing, Shipping, Payment Info. 10. Order Summary shows Edit Gift Note or Add Gift Note. 11. User completes payment. |
| **Postconditions** | User successfully placed an order with a Gift Note |
| **Business Trigger** | Customer wants to send a product as a Gift with a Gift Note |
| **Acceptance Criteria** | System adds Gift Note into Order Fulfillment Process |
| **Estimates** | To be determined |
| **Error** | — |

---

## UC 03 — Email Notifications for Products with Dedication/Gift Note

| Column | Description |
|--------|-------------|
| **Use Case ID** | UC 03 |
| **Prepared By** | Jomari |
| **Last Updated** | |
| **Objectives** | System sends additional Email Content for Orders with Gift Notes |
| **Actor** | Customer |
| **Preconditions** | Customer placed an order with a Gift Note |
| **Steps** | Upon placing an order, system sends email notifications to Recipient, Customer, and Merchant. The Recipient receives the Gift Note email with designs from Figma, and receives ongoing Order Status updates (Delivery, Completion, Cancellation). Merchant and Customer also receive updated Email Content versions. |
| **Postconditions** | All parties successfully receive the appropriate Gift Note–related emails |
| **Business Trigger** | Merchant wants to send updated order details to involved parties |
| **Acceptance Criteria** | System sends all necessary notifications with Gift Note details |
| **Estimates** | To be determined |
| **Error** | — |

---

# Business Rules / Desired Behavior

## For UC 01
- Available only for FREE, PLUS, PRO, PREMIUM plans  
- Impacted Modules: Marketplace, Online Store

## For UC 02
- Available to ALL Plans  
- Impacted Modules: Online Store

## For UC 03
- Available to ALL Plans  
- Impacted Modules: Online Store

---

# Nonfunctional Requirements

| Name | Description | Priority |
|------|-------------|----------|
| Responsiveness | Website must be fully responsive and not compromise UI | HIGH |
| System Performance | Output generation within 3 seconds | HIGH |

---

# Success Criteria
- Available to ALL plans  
- Once Merchant subscribes, feature applies automatically  
- Gift Note automatically appears in Cart Page once products are added  

---

# Wireframes
- https://www.figma.com/design/qBkujzywAdH1pGXcDDV4a9/Wireframe---Jomari?node-id=418-1578

# Figma Design File
- https://www.figma.com/design/XQZ6TwOZcYNtyfTINm7ahN/Prosperna----User-Flows?node-id=26187-823

# Demo Video
- https://watch.prosperna.com/share/nim5v12vs0sgke4cs6t34blec0ccjize  
- Enhancement: https://t7537039.p.clickup-attachments.com/t7537039/9ca78350-7fe6-4331-a49a-539f6ec91d61/Gift%20Note.mp4

---

# ClickUp Task
- https://app.clickup.com/t/86epbfydf  
- Enhancement: https://app.clickup.com/t/86erpam2n  

# Test Documentation (QA)
- Dedication Gift/Note Testing Documentation  
- https://app.clickup.com/t/86epbfydf  

---

# Future Enhancements
*(Filed by QA)*

- Customer Side | Carts | Simplify Gift Note UI  
  https://app.clickup.com/t/86erau2pw  

- Orders | Reference Number Logic  
  https://app.clickup.com/t/86eraugdv  

- Carts | Add Gift Notes Validation Logic  
  https://app.clickup.com/t/86eraub17  

- My Account | Missing Gift Note section  
  https://app.clickup.com/t/86eraubez  

- Merchant Side | Orders | Missing Gift Note section  
  https://app.clickup.com/t/86eraub61  

---

# Signed Off

| Stakeholder | Role | Status | Date |
|-------------|--------|--------|-------|
| Dennis | CEO | | |
| Ruel | HoE | | |
| Jomari | BA | Completed | |
| Christian | PM | | |

---

# Logs

| Name | Action | Description | Date | Related Docs |
|------|---------|-------------|--------|----------------|
| Jomari Adornado | Added Dedication/Gift Note as a Marketplace Add-on | Dedication/Gift Note will be available in the Marketplace | March 7, 2025 | https://prosperna.larksuite.com/docx/GTUldKuxxoUHM1x92Qvueox2ste |


