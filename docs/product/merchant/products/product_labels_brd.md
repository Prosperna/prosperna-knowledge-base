---
id: product-labels-brd
title: Product Labels BRD
sidebar_label: Product Labels
sidebar_position: 1
---

# Product Labels BRD  
**Business Requirements Document (BRD)**



# Executive Summary
The Product Label is a feature that provides merchants with the ability to attach label tags to their product images in their product listing, which is then visible to customers. This helps merchants relay information about their products in an engaging way.

# Background
Prosperna recognizes the significance of providing merchants with an edge in the E-commerce industry. The Product Label feature enhances the visual presentation of products, allowing standard or custom labels to differentiate products and create a more engaging shopping experience.

# Business Objectives
- Improve visual appeal of online stores using standard or custom product labels.
- Foster a more engaging shopping experience by enabling merchants to creatively label products.
- Introduce product labeling as a premium feature in Plus, Pro, and Premium plans.
- Attract new merchants by showcasing innovative features.
- Empower merchants to highlight key products, promotions, or offerings.
- Position Prosperna as a cutting-edge E-commerce solution.
- Enhance overall user satisfaction and retention.
- Provide merchants tools to implement effective marketing strategies.

# Scope of Solution
**In-Scope:**
- Custom product label creation.
- Customization options: text, layout, appearance, position, margin, tooltip.
- View, edit, delete functionality for labels.
- Assigning/disassociating labels with products.
- Integration with Prosperna page builder.
- Admin site label management.
- Compliance with Prosperna security standards.
- Robust database handling of label data.

**Out-of-Scope:**
- Advanced graphic design, animations, or offline editing.
- Integration with external design tools.
- Cross-platform/browser beyond standard requirements.
- Automated label generation or ML-based suggestions.
- Detailed analytics or reporting.
- Extensive localization or printable label design.

# Business Requirements

## 1. Product Label Creation and Customization
### 1.1 Standard Labels
- Predefined, uneditable, undeletable, viewable by merchants.

### 1.2 Custom Labels
- Merchants can add, edit, and delete custom labels.

### 1.3 Label Customization
- Customize text, layout, background, font, size, color, font family, height, width, border radius, position, margin, tooltip.

## 2. Label Management
### 2.1 Viewing and Deleting
- View list of all labels.
- Delete custom labels.

### 2.2 Assignment and Removal
- Assign/unassign labels to products.

## 3. Dashboard Integration
- Dedicated Product Labels section in admin site.

## 4. Database Handling
- Secure storage of labels, settings, and associations.
- Ensure data integrity.

# Stakeholder Analysis
| Stakeholder | Role |
|------------|------|
| Project CEO | Overall project management |
| Head of Engineering | Department coordination |
| Prosperna Product Team | Development & implementation oversight |
| Prosperna Sales & Marketing | Platform promotion |
| Merchants | Create/manage products |
| Customers | Purchase products |

# User Classes and Characteristics
- **Merchants:** Business account holders, manage products.  
- **Customers:** Visit merchant pages to explore products.

# UI Mockups
- [Low-Fidelity Wireframe](https://dennisvelasco229503.invisionapp.com/freehand/Web---Product-Label-Tags-ykfh1aX5s)  
- [High-Fidelity Wireframe](https://www.figma.com/file/XQZ6TwOZcYNtyfTINm7ahN/Prosperna---Merchant?type=design&node-id=10974-6196&mode=design)

# Data Flow Diagram
- Product Data Flow: TBD

# System Architecture Diagram
- TBD

# Functional Requirements Specification (FRS)

## Use Cases

### UC-01: Create Standard Product Labels
**Actor:** System  
**Objectives:** Create three standard labels usable by all merchants.  
**Steps:**  
1. Create labels:  
   - **New:** Rounded, green (#2DA94F), white font  
   - **Sale:** Circle, red (#F53C3C), white font  
   - **Best Seller:** Rounded, blue (#3F71D7), white font  
2. Display in Products > Product Labels.  
3. Standard labels: view only, no edit/delete.  
4. Table columns: Preview, Name, Text, Show Discounted Products Automatically (toggle), Date Created, Date Updated, Actions.

**Acceptance Criteria:** Standard labels are available for all merchants.  
**Postconditions:** Three standard labels created successfully.

---

### UC-02: Create New (Custom) Product Label
**Actor:** Merchant (paid plan)  
**Preconditions:** Merchant must have a paid plan.  
**Steps:**  
1. Navigate: Products > Product Labels > Add Product Label. Free-plan merchants see Upgrade modal.  
2. Fill out form:  
   - **Details:** Name (30 char), Text (12 char), Hover Text (optional), Active Dates, Start/End Time  
   - **Colors & Style:** Label Style, Background Color, Position, Height, Width  
   - **Text:** Font Family, Font Size, Font Color  
   - **Margins:** Up, Down, Left, Right  

> Notes: Label text must be centered horizontally/vertically.  
> Checkbox: "Show Discounted Products Automatically" applies Sale label if price >0.

3. Click Save or Cancel.  
**Success Message:** "Successfully created product label."  
**Error Messages:** "Please complete all required fields."  
**Postconditions:** Custom label created and visible in Product Labels page.

---

### UC-03: View a Product Label
**Actor:** Merchant  
**Steps:**  
1. Navigate to Products > Product Labels, click **View**.  
2. See preview and details: Name, Text, Hover Text, Active Dates, Start Time, Date Created, Date Updated.  
3. Edit button visible only for custom labels.

**Acceptance Criteria:** Label preview and details visible.  

---

### UC-04: Edit a Product Label
**Actor:** Merchant (paid plan)  
**Preconditions:** Merchant must have a paid plan.  
**Steps:**  
1. Navigate: Products > Product Labels > View > Edit (not for standard labels).  
2. Edit details: Name, Text, Hover Text, Active Dates, Start/End Time, Colors & Style, Text, Margins.  
3. Save or Cancel.  

**Success Message:** "Successfully updated product label."  
**Error Messages:** "Please complete all required fields."  
**Postconditions:** Product label updated successfully.

---

### UC-05: Delete a Product Label
**Actor:** Merchant  
**Steps:**  
1. Navigate: Products > Product Labels > Delete (custom labels only).  
2. Confirm deletion in modal.  
3. System deletes label and shows success message.  

**Success Message:** "Successfully deleted product label."  
**Error Messages:** "Something went wrong. Please try again."  

---

### UC-06: Assign a Product Label to a Product
**Actor:** All Registered Merchants  
**Steps:**  
1. Navigate: Products > Inventory > Product Labels section.  
2. Assign label(s) from dropdown (from Product Labels page). Max 2 labels per product.  
3. Save or Cancel.  
4. Display assigned labels in product listing and Page Builder.

**Success Message:** "Successfully created/updated product."  
**Error Messages:** Empty required fields or failure: "Please complete all required fields." / "Something went wrong. Please try again."

---

### UC-07: Remove a Product Label from a Product
**Actor:** All Registered Merchants  
**Steps:**  
1. Navigate: Products > Inventory > Product Labels section.  
2. Remove label by clicking X.  
3. Save or Cancel.  

**Success Message:** "Successfully updated product."  
**Error Messages:** "Something went wrong. Please try again."  

---

# Non-Functional Requirements (NFRs)
- **Performance:** Response time within [X] seconds, scalable.  
- **Security:** Role-based access, encrypted data, XSS/SQL safe.  
- **Scalability:** Database and feature handle growth.  
- **Compatibility:** Chrome, Firefox, Safari, Edge; responsive UI.  
- **Reliability:** Robust error-handling, high uptime.  
- **Usability:** Intuitive UI, real-time preview.

# Test Plan
- Unit Testing  
- Integration Testing  
- System Testing  
- Performance Testing  
- Security Testing  
- UAT  
- Compatibility Testing

# Testing Documentation
- Clickup Task: [Product Image Label](https://app.clickup.com/t/865c35yde)  
- Test Cases: UC 01-06

# QA Requested Enhancements
- UC-06: Max 5 labels per product.  
- Assigned labels visible in Page Builder for assigned products.

# Change Request Log
| ID | Date | Requested By | Description | Status |
|----|------|--------------|-------------|--------|
| CR-1001 | 2025-02-27 | Jomari Adornado | Enable/disable automatic display of Sale label | Completed |

# Signed Off
| Stakeholder | Role | Status | Date |
|------------|------|-------|------|
| Dennis Velasco | CEO | - | - |
| Ruel Nopal | HoE | Approved | Dec 11, 2023 |
| Adrianne Berida | BA | Completed | Nov 29, 2023 |
| Mark Anthony (Bam) | QA | Passed (UC 01-07) | Jul 10, 2024 |
| Jomari Adornado | BA | Enhancement | Feb 25, 2025 |

---

_This document serves as the official BRD for the Product Labels feature in Prosperna One._
