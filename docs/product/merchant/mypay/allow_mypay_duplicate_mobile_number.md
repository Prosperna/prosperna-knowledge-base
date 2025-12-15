---
id: allow-duplicate-mobile-number
title: Allow Duplicate Mobile Number in myPay PRD
sidebar_label: Allow Duplicate Mobile Number
sidebar_position: 1
---

Agile-focused PRD documenting the removal of duplicate mobile number restrictions in Prosperna's myPay application process, enabling merchants to create multiple accounts using the same mobile number while maintaining security through OTP-based verification.

## Document Control

| Item           | Details                                |
| -------------- | -------------------------------------- |
| Document Title | Allow Duplicate Mobile Number in myPay |
| Version        | 1.0                                    |
| Date           | December 14, 2025                      |
| Prepared by    | Business Analyst                       |
| Reviewed by    | To be assigned                         |
| Approved by    | To be assigned                         |
| Status         | For Review                             |
| Related BRD    | To be created                          |

---

## Revision History

| Version | Date         | Author           | Change Description                                                  |
| ------- | ------------ | ---------------- | ------------------------------------------------------------------- |
| 1.0     | Dec 14, 2025 | Business Analyst | Initial draft - Remove mobile number uniqueness constraint in myPay |

---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements and acceptance criteria (using BDD/Gherkin) for removing the duplicate mobile number restriction in Prosperna's myPay application process. The enhancement allows merchants to create multiple Prosperna accounts using the same mobile number, while maintaining security and fraud prevention through OTP verification at transaction time rather than registration-time blocking.

### 1.2 Feature Vision

Enable Prosperna to support legitimate multi-store ownership and franchise operations by allowing merchants to use the same mobile number across multiple myPay accounts. This aligns Prosperna with industry best practices from Stripe, Shopify Payments, and Adyen, where mobile numbers serve as verification methods rather than unique identifiers, while Store ID remains the primary account identifier.

### 1.3 Success Criteria

**User Adoption & Usage:**

- 100% of myPay applications with duplicate mobile numbers successfully process to Step 2 and beyond (zero blocks)
- 80% reduction in support tickets related to "mobile number already in use" errors
- Successful launch of USA Lifetime Deals program with multi-account support

**Technical Performance:**

- myPay application submission completes in less than 5 seconds regardless of mobile number duplication
- Zero bypass of Store ID uniqueness constraint (primary account identifier remains enforced)
- Backend API response time less than 2 seconds for Step 1 validation

**Business Impact:**

- Enable franchise groups and multi-store owners to operate multiple Prosperna accounts
- Support USA market expansion with Lifetime Deals offering (multiple accounts per customer)
- Maintain fraud detection capability through velocity monitoring without blocking legitimate users
- Enable legitimate multi-store business models aligned with industry standards

### 1.4 Related Documents

- [Competitor Analysis: Payment Platform KYB Policies](https://pkb.prosperna.ph/docs/product/competitor-analysis/kyb-duplicate-mobile)
- [Shopify Payments Documentation](https://help.shopify.com/en/manual/payments/shopify-payments)
- [Stripe Connect Best Practices](https://stripe.com/docs/connect)

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

Prosperna's myPay application system currently enforces a hard uniqueness constraint on mobile numbers across all myPay records. When a merchant attempts to submit a myPay application using a mobile number that already exists in another approved or pending myPay record, the system blocks progression to Step 2 of the application with an error toast, effectively preventing legitimate business operations:

**Franchise/Multi-Store Scenario:**

1. Merchant wants to purchase Lifetime Deals for USA market (3-5 stores in advance)
2. Merchant submits first myPay application with mobile number +1-555-123-4567 → Success
3. Merchant submits second myPay application (different Store ID, different business) with same number
4. **System blocks Step 2:** "This mobile number is already in use"
5. Merchant cannot complete myPay setup for remaining stores
6. Lifetime Deals program cannot launch as planned

**Legacy Fraud Prevention Rationale:**
The duplicate mobile number block was originally implemented during "myChat days" to prevent fraud. However:

- **Ineffective Fraud Prevention:** Simply blocking duplicate numbers does NOT prevent fraud; fraudsters can easily obtain multiple phone numbers
- **True Fraud Prevention:** OTP verification at withdrawal/transaction time is the actual security mechanism
- **Industry Misalignment:** Prosperna is more restrictive than Stripe, Shopify Payments, and Adyen (industry leaders)

**Impact of Current Limitations:**

- **Blocked Multi-Store Operations:** Legitimate merchants cannot operate multiple stores with same contact number
- **Business Model Limitation:** Prevents USA Lifetime Deals launch and franchise group support
- **Competitive Disadvantage:** 8/10 payment platforms allow mobile number reuse across accounts
- **Support Burden:** Multiple escalations from merchants unable to manage multiple businesses

### 2.2 Current State

**Current myPay Application Flow:**

1. **Step 1: Personal Information**

   - Merchant enters personal details including mobile number (prefilled from My Account)
   - Mobile number field is pre-populated
   - Frontend validation: phone format check (Philippine: +63 + 10 digits)
   - **Backend validation on "Next" button click:**
     - Check if mobile number exists in `mypay_records` table
     - If duplicate found → Return error response + Display error toast
     - Block progression to Step 2
     - "Next" button remains non-functional despite repeated clicks

2. **Current Database Constraints:**

   - `mypay_records.mobile_number` has UNIQUE constraint (or application-level uniqueness check)
   - Store ID serves as primary key but mobile number also enforced as unique
   - No mechanism to track which Store IDs share a mobile number

**Current Limitations:**

- Binary enforcement: `unique number = allowed`, `duplicate number = blocked` (no exceptions)
- No merchant-facing UI to view/edit myPay record post-approval
- OTP verification tied to immutable mobile number in myPay record

### 2.3 Desired Future State

**Enhanced myPay Application with Duplicate Mobile Number Support:**

1. **Step 1: Personal Information (Merchant Side) - Validation Removed:**

   - **Current Behavior Removed:**

     - Backend duplicate mobile number check REMOVED
     - Error toast "This mobile number is already in use" REMOVED
     - Blocking of "Next" button based on duplicate number REMOVED

   - **New Behavior:**

     - Merchant uses duplicate mobile number (prefilled from My Account)
     - Frontend validation: phone format check only (no duplicate check)
     - Merchant clicks "Next" button
     - System allows progression to Step 2 regardless of mobile number duplication
     - All other validations remain intact (required fields, format, etc.)

   - **Edge Case Handling:**
     - Same merchant resubmitting: Still prevented by Store ID + existing myPay record status (not by mobile number)
     - Merchant with rejected application: Can resubmit with same or different mobile number
     - Merchant with pending application: Still prevented from duplicate submission (by Store ID)

2. **Legitimate Use Case Scenarios:**

   - **Franchise Group Scenario:**

     - Franchisee submits myPay for Store A (mobile: +639171234567)
     - Franchisee submits myPay for Store B (same mobile: +639171234567)
     - Both applications process successfully without blocking
     - Franchisee can complete all 5 steps for each store independently

   - **Lifetime Deals Scenario (USA Market):**

     - Customer purchases 5-store Lifetime Deal package
     - Customer submits myPay for all 5 stores using mobile: +1-555-123-4567
     - All applications process sequentially without duplicate number errors
     - Customer completes myPay setup for all purchased stores

**Benefits After Implementation:**

- **Multi-Store Enablement:** Merchants can operate multiple Prosperna accounts with same mobile number
- **USA Launch Readiness:** Lifetime Deals program can proceed as planned
- **Fraud Prevention Maintained:** OTP verification at withdrawal time remains the true security layer
- **Industry Alignment:** Prosperna policy matches Stripe, Shopify Payments, and Adyen best practices
- **Improved Merchant Experience:** Seamless myPay application process without artificial blocking

### 2.4 Target Users

| User Segment                 | Description                                       | Use Case                                                          | Frequency                   |
| ---------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- | --------------------------- |
| Multi-Store Merchants        | Operate 2-5 Prosperna stores, separate businesses | Submit myPay for each store using primary business contact number | Per new store setup         |
| Franchise Groups             | Multiple franchise locations under common owner   | Submit myPay for each franchise using franchisor contact          | Per franchise onboarding    |
| USA Lifetime Deals Customers | Purchase multiple accounts in advance             | Submit myPay for 3-5+ stores using personal mobile number         | One-time (package purchase) |
| Existing Multi-Store Owners  | Already operate multiple stores, need myPay       | Retroactively apply for myPay on all existing stores              | Migration to myPay          |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**

- Must remove UNIQUE constraint on `mypay_records.mobile_number` (database or application-level)
- Backend API changes must not affect existing myPay application flow

**Business Constraints:**

- Cannot compromise KYB compliance or regulatory requirements (Philippines BSP, SEC)
- Must maintain audit trail for all myPay applications
- Support team must be trained on new multi-store policies before launch
- Clear communication to merchants about Store ID as primary identifier

**Key Assumptions:**

- Merchants understand Store ID is the actual unique identifier (email + Store ID combination)
- Merchants with multiple stores are willing to provide full KYB documentation per store
- OTP verification to shared mobile number is acceptable UX (user receives multiple OTPs if withdrawing from multiple stores)
- Fraud detection handled through separate admin review processes (out of scope for this PRD)

**Data Assumptions:**

- Less than 5% of myPay applications will have duplicate mobile numbers initially
- Duplicate mobile number usage will increase to 15-20% after USA Lifetime Deals launch
- Average merchant operates 1-3 stores (not 10+), so OTP volume per number is manageable

---

## 3. Functional Requirements & BDD Scenarios

---

### Feature F-01: Remove Duplicate Mobile Number Validation in myPay Application

#### 3.1.1 Feature Context

Remove the backend validation that blocks myPay application progression when a merchant enters a mobile number that already exists in another myPay record. This enables merchants to use the same mobile number across multiple Prosperna accounts (Store IDs) for legitimate multi-store operations.

#### 3.1.2 Business Rules

**BR-01: Mobile Number Uniqueness Removed**

- Backend API NO LONGER checks for duplicate mobile numbers in `mypay_records` table
- Merchants can enter any mobile number regardless of existing usage
- Progression from Step 1 to Step 2 is NOT blocked by duplicate mobile number
- Error toast "This mobile number is already in use" is REMOVED from codebase

**BR-02: Store ID Remains Unique Identifier**

- Store ID + email combination remains the primary account identifier
- Merchants CANNOT create multiple myPay applications for the same Store ID
- Existing prevention logic for duplicate Store ID submissions remains UNCHANGED
- Example: Store ID "ABC123" can only have ONE myPay record (pending or approved)

**BR-03: Other Validations Remain Intact**

- Mobile number format validation: still enforced (e.g., +63 + 10 digits for Philippines)
- Required field validation: mobile number field still required (cannot be empty)
- All other Step 1 validations remain: name, email, address, ID uploads, etc.
- Rejected applications: merchants can still resubmit with same or different mobile number

**BR-04: Existing myPay Records Unaffected**

- No data migration required for existing approved myPay records
- Merchants with approved myPay continue to use their current mobile numbers
- New applications process independently of existing records (except by Store ID)

#### 3.1.3 Scenarios

##### Scenario 1: Merchant submits myPay with unique mobile number (baseline behavior)

```gherkin
Given a merchant is on myPay Step 1 (Personal Information)
And the merchant enters mobile number "+639171234567"
And this mobile number does NOT exist in any other myPay record
When the merchant fills all required fields correctly
And clicks the "Next" button
Then the system validates all fields (format, required, etc.)
And the system does NOT check for duplicate mobile number
And the merchant progresses to Step 2 (Business Information)
And no error toast is displayed
```

##### Scenario 2: Merchant submits myPay with duplicate mobile number (previously blocked, now allowed)

```gherkin
Given a merchant is on myPay Step 1 (Personal Information)
And Store ID "STORE-001" has an approved myPay with mobile number "+639171234567"
And the current merchant has Store ID "STORE-002" (different store)
When the merchant enters mobile number "+639171234567" (same as STORE-001)
And fills all other required fields correctly
And clicks the "Next" button
Then the system validates all fields (format, required)
And the system does NOT display error toast about duplicate mobile number
And the merchant successfully progresses to Step 2
And the application continues through all steps normally
```

##### Scenario 3: Multiple stores, same owner, same mobile number (franchise scenario)

```gherkin
Given a franchise owner operates 3 stores: STORE-A, STORE-B, STORE-C
And all stores are under the same owner with mobile number "+639211234567"
When the owner submits myPay application for STORE-A with mobile "+639211234567"
Then the application processes successfully
When the owner submits myPay application for STORE-B with mobile "+639211234567"
Then the application also processes successfully (no blocking)
When the owner submits myPay application for STORE-C with mobile "+639211234567"
Then the application also processes successfully (no blocking)
And all 3 applications appear in admin review queue independently
And each application shows the same mobile number "+639211234567"
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement                        | Metric                                               | Measurement Method            |
| ---------------------------------- | ---------------------------------------------------- | ----------------------------- |
| myPay Step 1 to Step 2 progression | Less than 2 seconds (without duplicate number check) | Frontend + Backend API timing |
| Backend API response time          | Less than 500ms for validation checks                | API performance monitoring    |
| Database write operation           | Less than 1 second for myPay record creation         | Database performance metrics  |

### 4.2 Scalability

| Requirement                     | Target                                                  | Validation Method           |
| ------------------------------- | ------------------------------------------------------- | --------------------------- |
| myPay application submissions   | Handle 100,000+ myPay records without query degradation | Database indexing + testing |
| Concurrent merchant submissions | Support 1000+ concurrent myPay submissions              | Load testing                |
| Database constraint validation  | Store ID uniqueness check less than 100ms               | Database performance test   |

### 4.3 Reliability

| Requirement                     | Target                               | Monitoring                |
| ------------------------------- | ------------------------------------ | ------------------------- |
| Application submission accuracy | 100% successful submissions          | Automated testing         |
| Store ID uniqueness enforcement | Zero bypasses of Store ID constraint | Database constraint audit |

### 4.4 Security

| Requirement          | Implementation                                          | Validation          |
| -------------------- | ------------------------------------------------------- | ------------------- |
| Data encryption      | Mobile numbers encrypted at rest and in transit         | Security audit      |
| API input validation | All inputs sanitized before database operations         | Security testing    |
| OTP verification     | Withdrawal OTP remains sole transaction security        | Security testing    |
| Store ID enforcement | Store ID uniqueness cannot be bypassed programmatically | Penetration testing |

### 4.5 Usability

| Requirement                   | Target                                                           | Measurement       |
| ----------------------------- | ---------------------------------------------------------------- | ----------------- |
| Error message clarity         | 95% merchants understand validation error messages               | Usability testing |
| Application form flow         | 90% merchants complete myPay application without confusion       | User testing      |
| Mobile number field usability | 95% merchants successfully enter mobile number in correct format | User testing      |

### 4.6 Compatibility

| Requirement     | Standard                                      | Validation            |
| --------------- | --------------------------------------------- | --------------------- |
| Browser support | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Cross-browser testing |
| Mobile devices  | Fully functional on mobile browsers           | Mobile testing        |

---

## 5. User Experience & Design

**N/A**

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**

```
┌─────────────────────────────────────────────────────────────┐
│              Prosperna Merchant Dashboard                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         myPay Application Form Component              │  │
│  │  Step 1: Personal Information                         │  │
│  │  • Mobile number input (format validation only)       │  │
│  │  • NO duplicate check on "Next" button                │  │
│  │  • Progression to Step 2 allowed                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway / Backend Services              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         myPay Application Service                     │  │
│  │  • Remove duplicate mobile number validation          │  │
│  │  • Accept application with any mobile number          │  │
│  │  • Store ID uniqueness still enforced                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼

┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         mypay_records Table                           │  │
│  │  • Remove UNIQUE constraint on mobile_number          │  │
│  │  • Store ID remains primary unique identifier         │  │
│  │  • Index on mobile_number for potential future use    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Data Model Changes

**Before (Current State):**

```sql
Table: mypay_records
Columns:
  - id (Primary Key)
  - store_id (Unique)
  - mobile_number (Unique) ← Remove this constraint
  - email
  - name
  - status (Pending, Approved, Rejected)
  - ... other KYB fields
```

**After (Desired State):**

```sql
Table: mypay_records
Columns:
  - id (Primary Key)
  - store_id (Unique) ← Remains unique
  - mobile_number (Indexed, NOT Unique) ← Constraint removed
  - email
  - name
  - status (Pending, Approved, Rejected)
  - ... other KYB fields

Index on mobile_number for potential future admin queries
```

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type          | Coverage Target                                       | Responsibility | Tools                      |
| ------------------ | ----------------------------------------------------- | -------------- | -------------------------- |
| Unit Tests         | Greater than 85% coverage for duplicate check removal | Dev Team       | Jest, PHPUnit              |
| Integration Tests  | myPay submission flow with duplicate numbers          | Dev Team       | Postman, Supertest         |
| BDD Scenario Tests | All Gherkin scenarios automated                       | QA Team        | Cucumber, Playwright       |
| Regression Tests   | Existing myPay flow with unique numbers still works   | QA Team        | Automated regression suite |
| Database Tests     | UNIQUE constraint removal and index performance       | Dev Team       | Database testing tools     |
| UAT                | Merchant multi-store workflow                         | Product + QA   | Manual testing             |

### 7.2 Critical Test Scenarios

**High Priority:**

1. Merchant submits myPay with duplicate mobile number → progresses to Step 2 successfully
2. Store ID uniqueness constraint still prevents duplicate Store ID submissions
3. Mobile number format validation still enforces correct format
4. Rejected application resubmission with same number allowed
5. Multiple stores with same mobile number all process successfully
6. Backend API response time less than 2 seconds

**Medium Priority:**

7. Database UNIQUE constraint successfully removed from mobile_number column
8. Existing myPay records remain unaffected after constraint removal
9. Error toast "This mobile number is already in use" no longer appears
10. All 5 myPay application steps complete successfully with duplicate mobile number

---

## 8. Risks & Mitigations

| Risk                                           | Impact | Mitigation                                                             |
| ---------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| Fraud rings exploit duplicate number allowance | Medium | Separate admin control PRD for fraud detection and velocity monitoring |

---

## 9. Future Enhancements

1. **myPay Record Post-Approval Updates** - Allow merchants to update mobile numbers in approved myPay records
2. **Merchant-Facing myPay View UI** - Create interface for merchants to view their myPay record details
3. **Admin Control Platform Enhancements** - Separate PRD for duplicate mobile number visibility, fraud detection flags, velocity monitoring, and admin review tools
4. **Backup Authentication Methods** - Implement recovery codes or alternate verification for mobile number changes
5. **Bulk Multi-Store Onboarding** - Streamlined process for franchise groups to submit multiple myPay applications at once

---

## Approval and Sign-off

| Stakeholder       | Role | Status      | Date Signed       |
| ----------------- | ---- | ----------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---               |
| Ruel Nopal        | HoE  | ☐ Pending   | ---               |
| Rian Froille Alde | QA   | ☐ Pending   | ---               |
| [Backend Lead]    | BE   | ☐ Pending   | ---               |
| [Frontend Lead]   | FE   | ☐ Pending   | ---               |
| Adrianne Berida   | BA   | ☐ Completed | December 15, 2025 |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for removing duplicate mobile number restrictions in Prosperna's myPay application process (merchant-side only), enabling multi-store operations while maintaining security through OTP-based transaction verification.
