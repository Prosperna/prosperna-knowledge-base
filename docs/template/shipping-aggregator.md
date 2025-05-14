---
id: sample-brd-shipping-aggregator
title: Sample BRD for Shipping Aggregator Integration
sidebar_position: 2
---

# Business Requirements Document

> Integration of Lalamove, Angkas, Joyride, J&T and others  
> Real-time quotes, auto-booking and notifications

---

## Document Control

| Item           | Details                                  |
| -------------- | ---------------------------------------- |
| Document Title | Sample BRD for Shipping Aggregator       |
| Project Name   | Shipping Aggregator Integration          |
| Version        | 1.0                                      |
| Date           | 2025-05-12                               |
| Prepared by    | *Name, Business Analyst*                 |
| Reviewed by    | *Name, Technical Lead*                   |
| Approved by    | *Name, Project Sponsor*                  |

---

## Revision History

| Version | Date       | Author       | Change Description               |
| ------- | ---------- | ------------ | -------------------------------- |
| 1.0     | 2025-05-12 | *Analyst*    | Initial draft                    | 

---

## 1. Executive Summary

Integrate multiple shipping providers.  
When a customer enters pickup and delivery addresses, the system:  
- Queries all provider APIs for rates  
- Selects the highest quote  
- Adds shipping fee to the order total  
- On payment, auto-books across providers  
- Sends email/SMS notifications at each stage (order placed, preparing, pickup, delivery)

---

## 2. Business Objectives

| ID   | Description                                             | Metric                            |
| ---- | ------------------------------------------------------- | --------------------------------- |
| BO-01| Provide rate comparison within 2 seconds                | 95% of quotes returned < 2s       |
| BO-02| Auto-book to first accepting provider                   | 90% success on first acceptance   |
| BO-03| Notify merchant & customer reliably at each stage       | 99% message delivery rate         |
| BO-04| Support retries on API failures                         | Retry up to 3 times before skip   |

---

## 3. Scope

### In-Scope  
- Customer address entry and validation  
- Real-time rate queries to Lalamove, Angkas, Joyride, J&T, etc.  
- Automatic selection of highest rate  
- Shipping fee calculation and display  
- Post-payment booking across all providers  
- Cancellation of pending bookings after first acceptance  
- Email and SMS notifications at key events  

### Out-of-Scope  
- Provider account management UI  
- Manual override of provider selection  
- Payment gateway implementation details  

---

## 4. Stakeholders

| Role               | Name         | Responsibility                            |
| ------------------ | ------------ | ----------------------------------------- |
| Business Analyst   | Ana Santos   | Define requirements and scenarios         |
| Product Owner      | Juan Dela Cruz | Prioritize features                     |
| Tech Lead          | Mark Lee     | Oversee technical design                  |
| QA Lead            | Eva Reyes    | Validate all functional and error flows   |
| Operations Manager | Liza Tan     | Monitor system health and notifications   |

---

## 5. Functional Requirements

| ID    | Requirement                                                                 | Priority |
| ----- | --------------------------------------------------------------------------- | -------- |
| FR-01 | Query rate from all provider APIs using merchant & customer addresses       | High     |
| FR-02 | Display highest shipping quote                                              | High     |
| FR-03 | Add shipping fee to order total                                             | High     |
| FR-04 | Trigger booking request to all providers after payment                      | High     |
| FR-05 | Cancel other bookings when one provider accepts                             | High     |
| FR-06 | Send email & SMS at: order placed, preparing, pickup, delivery               | High     |
| FR-07 | Retry API calls on timeout up to 3 times                                    | Medium   |
| FR-08 | Log all API requests and responses                                          | Medium   |

### 5.1 Use Case Diagram

![Use Case Diagram](</whiteboard_exported_image.png>)
> Place `use-case-diagram.png` in `static/assets/` for site builds.

### 5.2 Use Case Scenarios

#### Perfect Scenario
1. Customer enters valid addresses.  
2. System queries all providers.  
3. System returns highest rate < 2s.  
4. Customer pays order + shipping.  
5. System sends booking requests.  
6. First provider accepts; others auto-cancel.  
7. Merchant & customer receive “order placed” notification.  
8. Merchant marks “package ready”; system notifies customer.  
9. System books pickup; provider accepts.  
10. Merchant & customer get “picked up” notification.  
11. Provider delivers; both receive “delivered” notification.

#### Error Scenarios
- **Provider API timeout**: Retry up to 3 times; if still failing, skip provider and log error.  
- **No providers respond**: Show “No shipping options available” error.  
- **Payment failure**: Abort booking; notify customer to retry payment.  
- **Invalid address**: Prompt customer to correct address.  
- **Notification failure**: Fallback to email if SMS fails; log delivery failures.  
- **Provider rejects booking**: Attempt next available provider.  
- **Multiple accept race**: Ensure first acceptance wins; cancel extras.  
- **Merchant cancels order**: Cancel booking; notify provider and customer.  
- **Customer cancels post-booking**: Trigger cancellation API; notify merchant and provider.  

---

## 6. Non-functional Requirements

- **Performance:** Quote response time ≤ 2 s under 100 req/s  
- **Reliability:** 99.9% uptime  
- **Scalability:** Handle peak of 200 req/s  
- **Security:** Encrypt API keys; use TLS for all calls  
- **Compliance:** Adhere to local data privacy laws  

---

## 7. Data Requirements

| Entity       | Description                       | Source             | Format     | Frequency    |
| ------------ | --------------------------------- | ------------------ | ---------- | ------------ |
| Order        | Customer & merchant details       | Front-end UI       | JSON       | On each order|
| Quote        | Rates & timestamps                | Provider APIs      | JSON       | Real-time    |
| Notification | Email/SMS logs                    | Notification service| DB log     | On each event|

---

## 8. Interface Requirements

| Interface    | Description                          | Protocol / Format |
| ------------ | ------------------------------------ | ----------------- |
| Customer UI  | Checkout page with rate display      | React, REST       |
| Merchant UI  | Order dashboard                      | React, WebSocket  |
| Admin Console| Monitor API health & logs            | REST, JSON        |

---

## 9. Assumptions and Constraints

- **Assumptions:**  
  - All provider APIs documented and accessible.  
  - Customers and merchants have valid contact details.  
- **Constraints:**  
  - Budget capped at PHP 100K.  
  - Must comply with local courier regulations.  

---

## 10. Risk Analysis

| Risk ID | Description                             | Impact   | Probability | Mitigation                     |
| ------- | --------------------------------------- | -------- | ----------- | ------------------------------- |
| R-01    | Provider API downtime                   | High     | Medium      | Retry logic; switch to fallback|
| R-02    | SMS/email delivery failures             | Medium   | Medium      | Alternate channel; alert ops   |
| R-03    | Invalid address format                  | Medium   | Low         | Front-end validation           |
| R-04    | Multiple providers accept simultaneously| Low      | Low         | Auto-cancel extras             |

---

## 11. Deliverables

| ID   | Description                            | Format         | Owner           |
| ---- | -------------------------------------- | -------------- | --------------- |
| D-01 | Final BRD document                     | Markdown, PDF  | Business Analyst|
| D-02 | Functional test report                 | Excel          | QA Lead         |
| D-03 | API integration logs                   | JSON           | DevOps Engineer |

---

## 12. Timeline and Milestones

| Milestone ID | Description               | Date         | Owner           |
| ------------ | ------------------------- | ------------ | --------------- |
| M-01         | Requirements sign-off     | 2025-05-20   | Project Sponsor |
| M-02         | Development complete      | 2025-06-10   | Dev Lead        |
| M-03         | UAT complete              | 2025-06-20   | QA Lead         |
| M-04         | Production release        | 2025-06-30   | Ops Manager     |

---

## 13. Approval and Sign-off

| Name               | Role             | Signature | Date       |
| ------------------ | ---------------- | --------- | ---------- |
| *Business Analyst* | Business Analyst |           |            |
| *Project Sponsor*  | Project Sponsor  |           |            |
| *Technical Lead*   | Technical Lead   |           |            |