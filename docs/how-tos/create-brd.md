---
id: create-brd
title: How to Create a Business Requirements Document
sidebar_position: 1
---

# How to Create a Business Requirements Document

A Business Requirements Document captures the business needs that drive a project. It aligns stakeholders on purpose, scope, and success criteria. A clear BRD prevents scope creep and miscommunication.

## Steps to create a BRD

### 1. Draft the Executive Summary
Summarize the project’s purpose in a few paragraphs. Highlight the main goals and expected benefits.  
**Sample:**  
> **Project:** Online Payment Integration  
> **Purpose:** Enable users to pay with credit cards within the app  
> **Goals:**  
> - Increase payment success rate to 98%  
> - Reduce abandoned carts by 15%

### 2. Define Business Objectives  
List measurable targets the project must meet.  
**Sample:**  
- Achieve 10,000 successful transactions in the first month  
- Decrease payment processing time to under 2 seconds  

### 3. Determine Scope  
Describe features and functions in scope. Identify out-of-scope items.  
**Sample In-Scope:**  
- Integrate Stripe API  
- Support Visa, Mastercard, and Amex  
**Sample Out-of-Scope:**  
- Support for PayPal  

### 4. Identify Stakeholders  
Specify roles, responsibilities, and contact information.  
**Sample Table:**

| Role             | Name           | Responsibility                |
| ---------------- | -------------- | ----------------------------- |
| Business Analyst | Ana Santos     | Gather requirements           |
| Project Sponsor  | Juan Dela Cruz | Approve objectives and budget |
| Tech Lead        | Mark Lee       | Oversee technical design      |

### 5. Document Functional Requirements  
Break requirements into user stories or use cases.  
**Sample User Story:**  
> As a **user**, I want to **save my credit card** so that **I can checkout faster**.

### 6. Document Non-functional Requirements  
List performance, security, and compliance standards.  
**Sample:**  
- Payment response time ≤ 2s  
- PCI DSS level 1 compliance  

### 7. List Assumptions and Constraints  
Record assumptions and limitations.  
**Sample:**  
- Assumes existing user authentication  
- Budget capped at $10K  

### 8. Specify Deliverables  
Detail tangible outputs and formats.  
**Sample:**  
- Figma prototype of checkout flow (PDF)  
- API integration test report (Excel)  

### 9. Set Timeline and Milestones  
Create a timeline chart or table.  
**Sample Milestones:**  
- Requirements sign-off: 2025-05-20  
- Prototype review: 2025-05-27  
- UAT completion: 2025-06-10

### 10. Establish Approval and Sign-off Process  
Provide signature fields and version control notes.  
**Sample Template:**  
```
| Name           | Role            | Signature | Date       |
| -------------- | --------------- | --------- | ---------- |
| Ana Santos     | Business Analyst|           |            |
| Juan Dela Cruz | Project Sponsor |           |            |
```

## BRD Audience

### Business Analysts  
Lead requirement gathering. Facilitate workshops and interviews.

### Project Sponsors  
Validate objectives and benefits. Approve scope and budget.

### Product Owners  
Prioritize features. Guide sprint planning.

### Development Team  
Convert requirements into technical designs.

### Quality Assurance Team  
Derive test cases. Log defects against requirement IDs.

### Operations and Support  
Plan deployment and maintenance activities.