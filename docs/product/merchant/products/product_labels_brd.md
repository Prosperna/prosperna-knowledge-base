---
id: product-labels-brd
title: Product Labels BRD
sidebar_label: Product Labels
sidebar_position: 1
---

# Product Labels BRD  
**Business Requirements Document (BRD)**

---

## Executive Summary
The **Product Label** is a feature that provides merchants with the ability to attach label tags to their product images in product listings, visible to their customers.  
This helps merchants relay information about their products through short texts presented in an engaging way.

---

## Background
Prosperna recognizes the importance of providing merchants with a competitive edge in the eCommerce industry.  
The proposed **Product Label** feature aims to enhance the visual presentation of merchants' products, allowing them to use standard or custom labels to differentiate products and create a more engaging shopping experience.

---

## Business Objective
The primary goal of implementing the Product Label feature is to improve the visual appeal of online stores by enabling merchants to use standard or custom product labels, enriching the overall presentation of products.

### Specific Objectives
- Foster a more engaging shopping experience by enabling merchants to creatively label their products.
- Introduce the product labeling feature as a **premium offering** within the Plus, Pro, and Premium subscription plans.
- Attract new merchants by showcasing Prosperna’s innovative customization options.
- Empower merchants to strategically label and highlight key products, promotions, or unique offerings.
- Position Prosperna as a cutting-edge eCommerce solution through a feature-rich product labeling system.
- Improve overall user satisfaction and retention by enhancing merchants’ creative control.
- Provide a tool for merchants to implement effective marketing strategies through product labels.

---

## Scope of Solution
The **scope** of the Product Label feature includes:
- Development of a feature allowing merchants to create **custom product labels**.
- Customization options for text, layout, visual appearance, position, margin, and tooltip.
- View, edit, and delete functionalities for product labels.
- Association and disassociation of labels with individual products.
- Seamless integration with **Prosperna’s page builder**.
- Inclusion of a **Product Labels** section in the merchant’s admin site.
- Compliance with Prosperna’s overall **security standards**.
- Database setup for storing product label information, settings, and associations.

---

## Out of Scope
- Advanced customization (e.g., intricate design elements or animations).  
- Integration with external tools or design services.  
- Compatibility beyond Prosperna’s standard browser requirements.  
- Offline editing capabilities.  
- Automated label generation (e.g., via AI or predefined criteria).  
- Detailed analytics and reporting (e.g., click-through rates).  
- Localization or multilingual label translation.  
- Printable label generation.

---

## Business Requirements

### 1. Product Label Creation and Customization
**1.1 Standard Labels**
- The system shall provide predefined standard product labels.
- Standard labels shall be **uneditable** and **undeletable**, but viewable by merchants.

**1.2 Custom Labels**
- Merchants shall be able to create new custom product labels.
- Custom labels shall be **editable** and **deletable**.

**1.3 Label Customization**
- Merchants can customize:
  - Text, layout, background color, font size, font color, font family  
  - Height, width, border radius, position, margin, tooltip

---

### 2. Label Management
**2.1 Viewing and Deleting**
- Merchants can view all product labels.
- Merchants can delete **custom** labels.

**2.2 Assignment and Removal**
- Merchants can assign a label to a specific product.
- Merchants can remove a label from a product.

---

### 3. Dashboard Integration
**3.1 Product Labels Section**
- A dedicated section shall be added to the merchant’s **admin site** for easy access and management of product labels.

---

### 4. Database Handling
**4.1 Data Storage**
- The system shall securely store all product label data, settings, and associations.

**4.2 Data Integrity**
- Ensure data integrity and consistency in storing and retrieving product label information.

---

## Stakeholder Analysis
- **Project CEO** – Oversees overall project.  
- **Head of Engineering** – Coordinates across departments.  
- **Product Team** – Oversees development and implementation.  
- **Sales & Marketing Team** – Promotes the feature to potential merchants.  
- **Merchants** – Create, publish, and manage products.  
- **Customers** – Browse and order products.

---

## User Classes and Characteristics

### Merchants
- Have a business account on Prosperna.
- Manage and publish their products.

### Customers
- Visit merchant pages to explore and purchase products.

---

## UI Mockups
- **Low-Fidelity Wireframe:** [InVision Freehand](https://dennisvelasco229503.invisionapp.com/freehand/Web---Product-Label-Tags-ykfh1aX5s)  
- **High-Fidelity Wireframe:** [Figma Design](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=10974-6196&mode=design)

---

## Data Flow Diagram
*(Insert product data flow and system architecture diagrams here.)*

---

## Functional Requirements Specification (FRS)

### Use Case List
1. Create Standard Product Labels  
2. Create a New (Custom) Product Label  
3. View a Product Label  
4. Edit a Product Label  
5. Delete a Product Label  
6. Assign a Product Label to a Product  
7. Remove a Product Label from a Product  

---

### Use Case Tables
| Use Case ID | Use Case Name |
|--------------|----------------|
| UC01 | Create Standard Product Labels |
| UC02 | Create New (Custom) Product Label |
| UC03 | View Product Label |
| UC04 | Edit Product Label |
| UC05 | Delete Product Label |
| UC06 | Assign Product Label to Product |
| UC07 | Remove Product Label from Product |

---

## Business Rules / Desired Behavior
- Product label form should be **scrollable**, while the preview remains fixed.  
- All product labels should have:
  - Minimum **10px internal padding**
  - **20px margin** from the product container border
- If the label style is **Ribbon**, disable the following position options:
  - *Upper Center*, *Middle Left*, *Middle Center*, *Middle Right*, *Bottom Center*

---

## Non-Functional Requirements Specification (NFRS)

### 1. Performance
- Response time ≤ _X seconds_ per operation.  
- Scalable for growing number of merchants and products.  
- Minimal impact on page load times.

### 2. Security
- Role-based access control for authorized users only.  
- Data must be stored and transmitted securely with encryption.  
- System must resist **SQL injection** and **XSS** attacks.

### 3. Scalability
- Database should support **horizontal scaling**.  
- Must accommodate growth in users, merchants, and admins.

### 4. Compatibility
- Compatible with major browsers: Chrome, Firefox, Safari, Edge.  
- Responsive across mobile, tablet, and desktop devices.

### 5. Reliability
- Must include robust **error handling** and meaningful user feedback.  
- High uptime with minimal downtime.

### 6. Usability
- Interface should be **intuitive and user-friendly**.  
- Real-time preview in page builder must reflect actual label display.

---

## Test Plan
1. **Unit Testing** – Validate functionality of individual components.  
2. **Integration Testing** – Ensure communication between module, DB, and builder.  
3. **System Testing** – Verify end-to-end functionality.  
4. **Performance Testing** – Assess under varying loads.  
5. **Security Testing** – Confirm compliance with Prosperna’s security standards.  
6. **User Acceptance Testing (UAT)** – Validate user expectations and business alignment.  
7. **Compatibility Testing** – Confirm performance across browsers and devices.

---

## Testing Documentation
- **Feature:** Product Image Label  
- **ClickUp Task:** [https://app.clickup.com/t/865c35yde](https://app.clickup.com/t/865c35yde)  
- **Test Cases:** UC01–UC06  
- **Enhancements for UC06:**  
  1. System should allow up to **5 product labels per product**.  
  2. Labels must also display on **Page Builder → Products component** when added or edited.

---

## Change Request Log

### **Change Request ID:** CR-1001
| Field | Details |
|--------|----------|
| **Date Requested** | February 27, 2025 |
| **Requested By** | Jomari Adornado |
| **Description** | Add enable/disable button to auto-display Product Label when Sale Price > 0 |
| **Business Justification** | Add option to automatically display label for discounted products |
| **Impact Analysis** | Affects Products and Product Label modules (automation) |
| **Priority** | High |
| **Status** | Completed |
| **Approval Status** | For Approval (Ruel) |
| **Date Approved** | — |
| **Date Completed** | February 27, 2025 |
| **Assigned To** | Jomari Adornado |
| **Comments** | — |

---

## Sign-Offs

| Stakeholder | Role | Status | Date Signed |
|--------------|------|--------|--------------|
| Dennis Velasco | CEO | Approved | Dec. 11, 2023 |
| Ruel Nopal | HoE | Approved | Nov. 29, 2023 |
| Adrianne Berida | BA | Completed | — |
| (Bam) Mark Anthony | QA | Passed (UC01–07) | July 10, 2024 |
| Jomari Adornado | PM / BA | Enhancement | Feb. 25, 2025 |

---

_This document serves as the official BRD for the Product Labels feature in Prosperna One._
