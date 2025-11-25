---
id: my-account-mobile-number-verification
title: Mobile Number Verification Enhancement PRD
sidebar_label: Mobile Number Verification
sidebar_position: 1
---

Agile-focused PRD documenting the enhancement to Prosperna's My Account module, focusing on mobile number field security improvements, OTP verification enforcement, and input validation for Philippine mobile numbers.

**Demo Recording:**
[Mobile Number Enhancement Demo - To be created]

## Document Control

| Item           | Details                                |
| -------------- | -------------------------------------- |
| Document Title | Mobile Number Verification Enhancement |
| Version        | 1.0                                    |
| Date           | November 20, 2025                      |
| Prepared by    | Business Analyst                       |
| Reviewed by    | To be assigned                         |
| Approved by    | To be assigned                         |
| Status         | For Review                             |
| Related BRD    | To be created                          |

---

## Revision History

| Version | Date              | Author           | Change Description                                     |
| ------- | ----------------- | ---------------- | ------------------------------------------------------ |
| 1.0     | November 20, 2025 | Business Analyst | Initial draft - Mobile number verification enhancement |

---

## 1. Introduction

### 1.1 Document Purpose

This PRD outlines the enhancement to the My Account module's mobile number field to address critical security vulnerabilities, improve data integrity, and enforce consistent input validation for Philippine mobile numbers.

### 1.2 Feature Vision

To provide merchants with a secure, user-friendly mobile number management experience that prevents unauthorized changes, reduces SMS abuse, and ensures data accuracy through proper OTP verification and input validation.

### 1.3 Success Criteria

**User Adoption & Usage:**

- 100% of mobile number updates require successful OTP verification before saving
- Zero instances of mobile numbers saved without OTP confirmation
- Reduction in OTP spam requests through rate limiting implementation
- Consistent mobile number format (+639XXXXXXXXX) for all Philippine numbers
- Improved merchant trust in account security

**Technical Performance:**

- OTP modal displays in less than 500ms after clicking Save
- OTP verification completes in less than 2 seconds (P95)
- Input validation responds in real-time (less than 100ms)
- Rate limiting enforced with 100% accuracy
- Zero bypass attempts succeed

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

The current mobile number field in the My Account module has three critical issues: (1) it accepts inconsistent formats (+63 09XXXXXXXXX and +63 9XXXXXXXXX), causing merchant confusion, (2) merchants can bypass OTP verification by refreshing the page after clicking Save, creating a security vulnerability, and (3) there is no rate limiting on OTP requests, making the system vulnerable to abuse and unnecessary SMS costs.

### 2.2 Current State

**Current My Account Flow:**

1. Merchant navigates to My Account page from user menu
2. Clicks edit (pencil icon) on mobile number field
3. Field converts to input mode with country code selector + number
4. Merchant can edit the mobile number:
   - System accepts both "+63 09XXXXXXXXX" and "+63 9XXXXXXXXX" for Philippines
   - No validation on input format consistency
5. Merchant clicks Save button
6. OTP input field appears inline below mobile number
7. OTP is sent to the inputted number
8. **Critical Issue:** If merchant refreshes page without entering OTP:
   - New mobile number is saved anyway
   - No verification actually required

**Current Limitations:**

- Binary bypass: Refresh page results to skip verification
- No format enforcement for Philippine numbers
- No rate limiting protection
- Inconsistent user experience (sometimes verified, sometimes not)
- No clear visual feedback on verification status

### 2.3 Desired Future State

**Enhanced Mobile Number Management with Security:**

1. **Input Validation for Philippines (+63):**

   - Accepts ONLY +639XXXXXXXXX format (exactly 10 digits after +63)
   - Real-time validation displays error: "Invalid mobile number format"
   - Red border on input field when validation fails
   - Cannot proceed to OTP without valid format

2. **OTP Verification Modal (Required):**

   - Click Save button triggers modal (not inline field)
   - Modal displays:
     - OTP input field (6 digits)
     - "Resend Code" button with cooldown timer
   - Modal cannot be closed without completing verification or canceling
   - Page refresh does NOT save number without verification

3. **Rate Limiting Implementation:**

   - All OTP requests: 2-minute cooldown enforced
   - First request (clicking Save): immediate send, starts cooldown timer
   - "Resend Code" button disabled during cooldown
   - Countdown timer displayed (e.g., "1:45")
   - Cooldown persists across page refreshes and modal close/reopen
   - If merchant closes modal during cooldown and reopens, cooldown continues
   - Error toast displayed if Save clicked during active cooldown: "Please try again after [X] minutes"

4. **Save Prevention Without Verification:**

   - Mobile number changes are NOT saved to database until OTP verified
   - Closing modal without verification discards changes
   - Navigating away from page discards changes
   - Page refresh does NOT save unverified changes
   - Only successful OTP entry triggers database update

5. **Clear User Feedback:**
   - Real-time input validation with error messages
   - Modal UI provides clear verification workflow
   - Success confirmation after verification
   - Error handling for incorrect OTP codes
   - Clear indication of cooldown timers

**Benefits After Implementation:**

- **Security Guarantee:** 100% of mobile number changes require OTP verification
- **Data Quality:** Consistent +639XXXXXXXXX format for all Philippine numbers
- **User Clarity:** Modal-based verification provides clear workflow
- **Audit Trail:** Complete record of verification attempts and successes

### 2.4 Target Users

| User Segment               | Description                              | Use Case                                       | Frequency                 |
| -------------------------- | ---------------------------------------- | ---------------------------------------------- | ------------------------- |
| Active Prosperna Merchants | Merchants managing their account details | Update mobile number when changing phone       | Occasional (few times/yr) |
| New Prosperna Merchants    | Recently signed up merchants             | Set initial mobile number during account setup | One-time (signup)         |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**

- Must maintain compatibility with existing SMS/OTP service infrastructure
- OTP delivery time assumed to be within 30-60 seconds under normal conditions
- Enhancement limited to Philippines country code (+63) only
- Other country codes remain unchanged (out of scope)
- Must work on existing My Account page without major architecture changes
- Modal UI must be responsive (mobile and desktop)

**Business Constraints:**

- Cannot compromise user experience with overly restrictive validation
- Must maintain reasonable OTP cooldown times (not too restrictive)
- Enhancement must not break existing user workflows
- SMS cost reduction balanced against user convenience

**Key Assumptions:**

- Merchants have access to mobile device receiving OTP
- SMS delivery is reliable (95%+ success rate)
- Merchants understand need for verification (security awareness)
- 2-minute cooldown is acceptable wait time for most users
- Modal-based verification is familiar UX pattern
- Existing phone numbers can be migrated to new format

**Regulatory Assumptions:**

- OTP verification meets security compliance requirements
- SMS-based verification is acceptable authentication method
- Rate limiting does not violate user access rights
- Data protection requirements met by OTP verification

---

## 3. Functional Requirements & BDD Scenarios

---

### Feature F-01: Mobile Number Input Validation (Philippines +63)

#### 3.1.1 Feature Context

Enforce strict format validation for Philippine mobile numbers to ensure data consistency and prevent invalid formats from being accepted. Validation occurs in real-time as merchants edit the mobile number field.

#### 3.1.2 Business Rules

**BR-01: Format Validation for Philippines**

- When Philippines (+63) is selected as country code:
  - Accept ONLY +639XXXXXXXXX format
  - Exactly 10 digits required after +63
  - First digit after +63 must be "9" (not "0")
- Validation triggers on input change and blur events
- Invalid format displays inline error + red border

**BR-02: Error Display Rules**

- Error message: "Invalid mobile number format"
- Error displays below input field in red text
- Input field shows red border when error active
- Error clears automatically when valid format entered
- Save button becomes disabled when validation error is active
- Save button becomes disabled when mobile number is incomplete (less than 10 digits)
- Save button re-enables only when valid format entered (exactly 10 digits after +63, starts with 9)

**BR-03: Input Restrictions**

- +63 prefix is autopopulated when Philippines is selected but can be manually deleted
- If +63 is deleted, validation error triggers immediately
- Cannot enter "0" immediately after +63
- Cannot enter less than 10 digits after +63
- Cannot enter more than 10 digits after +63
- Only numeric characters allowed after +63

**BR-04: Validation Trigger Points**

- On input change (real-time)
- On blur (field loses focus)
- Before Save button action (pre-OTP modal)
- Does NOT validate on initial page load

#### 3.1.3 Scenarios

##### Scenario 1: Merchant enters valid mobile number

```gherkin
Given a merchant is on the "My Account" page
And "Philippines" is selected in the country code selector
And the mobile number field is in edit mode
When the merchant types "9123456789" after "+63"
Then the input field displays "+63 9123456789"
And no validation error is shown
And the input field border remains normal (not red)
And the "Save" button remains enabled
```

##### Scenario 2: Merchant enters "0" immediately after "+63"

```gherkin
Given a merchant is on the "My Account" page
And "Philippines" is selected in the country code selector
And the mobile number field is in edit mode
When the merchant types "0912345678" (starting with "0")
And clicks outside the input field (blur event)
Then a validation error appears below the field
And the error message reads "Invalid mobile number format"
And the input field border turns red
And the "Save" button remains enabled but will trigger validation
```

##### Scenario 3: Merchant enters less than 10 digits after "+63"

```gherkin
Given a merchant is on the "My Account" page
And "Philippines" is selected in the country code selector
And the mobile number field is in edit mode
When the merchant types "912345678" (only 9 digits)
And clicks outside the input field (blur event)
Then a validation error appears below the field
And the error message reads "Invalid mobile number format"
And the input field border turns red
```

##### Scenario 4: Merchant manually removes "+63" prefix

```gherkin
Given a merchant is on the "My Account" page
And "Philippines" is selected in the country code selector
And the mobile number field is in edit mode with "+63" autopopulated
When the merchant deletes the "+63" prefix
Then the prefix is removed from the input field
And a validation error appears immediately
And the error message reads "Invalid mobile number format"
And the input field border turns red
And the "Save" button becomes disabled
When the merchant types "9123456789" (without +63)
Then the validation error remains
And the "Save" button remains disabled
```

##### Scenario 5: Merchant clicks Save with incomplete number

```gherkin
Given a merchant is on the "My Account" page
And "Philippines" is selected in the country code selector
And the mobile number field shows "+63 91234567" (only 8 digits)
And a validation error is displayed
And the "Save" button is disabled (grayed out, not clickable)
When the merchant attempts to click the "Save" button
Then nothing happens (button is not clickable)
And the validation error remains visible
And the input field border remains red
And the OTP modal does NOT open
```

##### Scenario 6: Merchant corrects invalid format to valid format

```gherkin
Given a merchant has entered "+63 09123456789" (invalid - has "0")
And a validation error is displayed
And the input field has red border
When the merchant corrects the number to "+63 9123456789" (valid)
And clicks outside the input field
Then the validation error disappears
And the input field border returns to normal
And the "Save" button can now proceed to OTP verification
```

---

### Feature F-02: OTP Verification Modal (Required)

#### 3.2.1 Feature Context

Implement a modal-based OTP verification flow that prevents mobile number changes from being saved until the merchant successfully enters the correct OTP code. The modal replaces the current inline OTP field and provides a more secure, user-friendly verification experience.

#### 3.2.2 Business Rules

**BR-05: OTP Modal Trigger**

- Modal opens ONLY when:
  - Save button is clicked
  - Mobile number passes format validation
  - Mobile number is different from current saved number
- Modal does NOT open if number unchanged
- Modal displays immediately after validation passes

**BR-06: OTP Modal Content**

- Modal displays:
  - Title: "Verify Your Mobile Number"
  - Message: "Please enter the verification code sent to your mobile phone."
  - OTP input field (6 digits)
  - "Submit" button
  - "Resend Code" button (with cooldown timer)
  - Close button (X icon in top-right corner)
- Modal cannot be dismissed by clicking outside
- Modal can only be closed via Close button (X) or successful verification

**BR-07: OTP Verification Logic**

- OTP is 6 digits numeric
- OTP valid for 2 minutes after generation
- Correct OTP entry triggers:
  - Mobile number saved to database
  - Modal closes
  - Success toast: "Successfully updated mobile number."
  - Field returns to read-only mode with new number
- Incorrect OTP entry displays:
  - Error message: "Invalid code. Please try again."
  - OTP input field clears
  - Modal remains open
  - Merchant can retry or request resend

**BR-08: Save Prevention Rules**

- Mobile number is NOT saved to database until OTP verified
- Closing modal via Cancel button discards changes
- Refreshing page while modal open discards changes
- Navigating away from page discards changes
- Number reverts to original value if verification not completed

#### 3.2.3 Scenarios

##### Scenario 1: Merchant clicks Save with valid number, OTP modal opens

```gherkin
Given a merchant is on the "My Account" page
And "Philippines" is selected in the country code selector
And the mobile number field shows "+63 9123456789" (valid format)
And this number is different from the currently saved number
And no validation errors exist
When the merchant clicks the "Save" button
Then the OTP verification modal opens immediately
And the modal displays:
  | Element       | Content                                                      |
  | Title         | Verify Your Mobile Number                                    |
  | Message       | Please enter the verification code sent to your mobile phone.|
  | OTP Field     | Empty input field (6 digits)                                 |
  | Submit Button | Submit (disabled until 6 digits entered)                     |
  | Resend Button | Resend Code (enabled)                                        |
  | Close Button  | X icon (top-right corner)                                    |
And an OTP SMS is sent to +63 9123456789
And the mobile number is NOT yet saved to database
```

##### Scenario 2: Merchant enters correct OTP code

```gherkin
Given the OTP verification modal is open
And the merchant has received OTP "123456" via SMS
When the merchant types "123456" in the OTP input field
Then the "Submit" button becomes enabled
When the merchant clicks the "Submit" button
Then the system validates the OTP code
And the OTP code matches the sent code
Then the modal closes
And the mobile number "+63 9123456789" is saved to the database
And a success toast notification displays: "Successfully updated mobile number."
And the mobile number field returns to read-only mode
And displays the new number "+63 9123456789"
```

##### Scenario 3: Merchant enters incorrect OTP code

```gherkin
Given the OTP verification modal is open
And the correct OTP is "123456"
When the merchant types "654321" (incorrect code) in the OTP field
And clicks the "Submit" button
Then the system validates the OTP code
And the OTP code does NOT match
Then an error message displays below the OTP field
And the error message reads "Invalid code. Please try again."
And the OTP input field is cleared (becomes empty)
And the "Submit" button becomes disabled again
And the modal remains open
And the merchant can try again or click "Resend Code"
And the mobile number is still NOT saved to database
```

##### Scenario 4: Merchant clicks Cancel button in OTP modal

```gherkin
Given the OTP verification modal is open
And the merchant has not yet entered the OTP
When the merchant clicks the "Close" button (X icon)
Then the modal closes immediately
And the mobile number change is discarded
And the mobile number field reverts to read-only mode
And displays the original mobile number (before edit)
And no changes are saved to the database
```

##### Scenario 5: Merchant refreshes page while OTP modal is open

```gherkin
Given the OTP verification modal is open
And the merchant has entered a new mobile number "+63 9123456789"
And OTP has been sent but not yet verified
When the merchant refreshes the page (F5 or browser refresh)
Then the page reloads
And the OTP modal does NOT reappear
And the mobile number field displays the original number (not the new one)
And the new mobile number is NOT saved to database
And the merchant must start the edit process again if they want to update
```

##### Scenario 6: OTP expires before merchant enters code

```gherkin
Given the OTP verification modal is open
And OTP "123456" was generated 2 minutes ago
And the OTP has now expired (2-minute validity)
When the merchant enters "123456" in the OTP field
And clicks the "Submit" button
Then the system validates the OTP
And detects the OTP has expired
Then an error message displays: "Code expired. Please request a new code."
And the "Resend Code" button is highlighted/pulsing
And the merchant must click "Resend Code" to receive a new OTP
And the mobile number is NOT saved
```

---

### Feature F-03: OTP Rate Limiting & Resend Functionality

#### 3.3.1 Feature Context

Implement rate limiting on OTP requests to prevent abuse, reduce SMS costs, and provide a better user experience. The "Resend Code" button includes a cooldown timer that enforces waiting periods between requests, with escalating delays for repeated attempts.

#### 3.3.2 Business Rules

**BR-09: Rate Limiting Rules**

- **All OTP requests:** 2-minute cooldown enforced (no escalation)
- **First OTP request:** Immediate send when Save button clicked, cooldown timer starts immediately
- **Subsequent requests:** 2-minute cooldown before next request allowed
- Cooldown timer displays remaining time (e.g., "Resend in 1:45")
- Cooldown persists across page refreshes (session-based)
- Cooldown persists if merchant closes OTP modal and reopens
- If merchant clicks Save during active cooldown: OTP modal does NOT open, no OTP sent, error toast displays "Please try again after [X] minutes"

**BR-10: Resend Button Behavior**

- **Enabled state:** Blue button, clickable, text "Resend Code"
- **Disabled state (during cooldown):**
  - Grayed out, not clickable
  - Text shows: "Resend in X:XX"
  - Countdown timer updates every second
- When cooldown expires:
  - Button returns to enabled state
  - Text changes back to "Resend Code"

**BR-11: Cooldown Persistence Logic**

- Track last OTP request timestamp per merchant session
- Every OTP request triggers a 2-minute cooldown (regardless of attempt count)
- Cooldown timestamp stored in session and persists across:
  - Page refreshes
  - Modal close/reopen actions
  - Navigation within My Account page
- If merchant requests OTP, closes modal, and attempts to request again (clicks Save) within cooldown:
  - System checks remaining cooldown time
  - OTP modal does NOT open
  - No OTP sent to mobile number
  - Error toast displays: "Please try again after [X] minutes" (where X shows remaining minutes)

**BR-12: OTP Resend Success**

- Clicking "Resend Code" (when enabled):
  - New OTP generated and sent via SMS
  - Success toast displays: "New code sent to +63 9XXXXXXXXX"
  - Previous OTP invalidated
  - Cooldown timer restarts (2 minutes)
  - Last request timestamp updated

#### 3.3.3 Scenarios

##### Scenario 1: Merchant clicks Resend Code for the first time

```gherkin
Given the OTP verification modal is open
And the initial OTP was sent when Save button was clicked
And 30 seconds have passed
And the "Resend Code" button is enabled
When the merchant clicks the "Resend Code" button
Then a new OTP is generated and sent via SMS
And a success toast displays: "New code sent to +63 9123456789"
And the "Resend Code" button becomes disabled
And the button text changes to "Resend in 2:00"
And a countdown timer starts (2:00, 1:59, 1:58, ...)
And the last OTP request timestamp is updated
```

##### Scenario 2: Merchant attempts to click Resend during cooldown

```gherkin
Given the OTP verification modal is open
And the "Resend Code" button is in cooldown state
And the button shows "Resend in 1:23"
When the merchant attempts to click the button
Then nothing happens (button is disabled, not clickable)
And the cursor shows "not-allowed" icon on hover
And the countdown continues (1:22, 1:21, ...)
```

##### Scenario 3: Cooldown timer expires and button re-enables

```gherkin
Given the OTP verification modal is open
And the "Resend Code" button shows "Resend in 0:05"
And the countdown is at 5 seconds remaining
When the countdown reaches 0:00
Then the button text changes to "Resend Code"
And the button becomes enabled (blue color, clickable)
And the countdown timer is no longer displayed
And the merchant can click to request another OTP
```

##### Scenario 4: Merchant closes modal during cooldown and attempts Save again

```gherkin
Given the OTP verification modal is open
And the merchant has clicked "Resend Code"
And the "Resend Code" button shows "Resend in 1:30" (90 seconds remaining)
When the merchant clicks the "Close" button (X icon)
Then the modal closes
And the mobile number change is discarded
And the cooldown timer continues in the background (session-based)
When the merchant edits the mobile number again
And enters a new number "+63 9123456789"
And clicks the "Save" button
Then the system checks for active cooldown
And detects 1 minute 20 seconds remaining (approximately, accounting for elapsed time)
And the OTP modal does NOT open
And no OTP is sent to the mobile number
And an error toast displays: "Please try again after 1 minute"
When the merchant waits for the cooldown to expire
And clicks the "Save" button again
Then the OTP modal opens
And a new OTP is sent to +63 9123456789
```

##### Scenario 5: Merchant refreshes page during cooldown, cooldown persists

```gherkin
Given the OTP verification modal is open
And the "Resend Code" button shows "Resend in 1:30" (90 seconds remaining)
When the merchant refreshes the page (F5)
Then the page reloads
And the mobile number field reverts to original value
And the OTP modal does NOT reappear
And the cooldown timer continues in the background (session-based)
When the merchant edits the number again
And clicks the "Save" button within the cooldown period
Then the system checks for active cooldown
And detects approximately 1 minute 20 seconds remaining
And the OTP modal does NOT open
And no OTP is sent
And an error toast displays: "Please try again after 1 minute"
When the cooldown expires and the merchant clicks "Save" again
Then the OTP modal opens
And a new OTP is sent to the mobile number
```

##### Scenario 6: Multiple resend attempts all have 2-minute cooldown

```gherkin
Given the OTP verification modal is open
And the merchant has already clicked "Resend Code" twice
And each resend triggered a 2-minute cooldown
And the current cooldown has expired
When the merchant clicks "Resend Code" again (third time)
Then a new OTP is generated and sent via SMS
And a success toast displays: "New code sent to +63 9123456789"
And the "Resend Code" button becomes disabled
And the button text changes to "Resend in 2:00"
And a 2-minute countdown timer starts (same duration as all previous attempts)
And the cooldown remains 2 minutes regardless of how many times "Resend Code" is clicked
```

##### Scenario 7: Merchant attempts to click Save during active cooldown

```gherkin
Given a merchant is on the "My Account" page
And the merchant previously requested an OTP 1 minute ago
And the 2-minute cooldown is still active (1 minute remaining)
And the merchant has closed the OTP modal or refreshed the page
When the merchant edits the mobile number field
And enters a valid number "+63 9123456789"
And clicks the "Save" button
Then the system checks for active cooldown
And detects 1 minute remaining on the cooldown timer
And the OTP modal does NOT open
And no OTP is sent to the mobile number
And an error toast displays: "Please try again after 1 minute"
And the mobile number field remains in edit mode
When the merchant waits for 1 minute for the cooldown to expire
And clicks the "Save" button again
Then the cooldown has expired
And the OTP modal opens
And a new OTP is sent to +63 9123456789
```

---

### Feature F-04: Mobile Number Save Prevention Without OTP Verification

#### 3.4.1 Feature Context

Ensure that mobile number changes are never saved to the database without successful OTP verification, eliminating the current security vulnerability where page refreshes bypass verification.

#### 3.4.2 Business Rules

**BR-13: Save Prevention Rules**

- Mobile number changes stored in temporary state ONLY
- Changes NOT written to database until OTP verified
- Temporary state discarded on:
  - Modal cancel
  - Page refresh
  - Navigation away from page
  - Session timeout
- Database update occurs ONLY after successful OTP verification

**BR-14: Verification State Management**

- Edit mode stores: originalNumber, newNumber, verificationPending
- verificationPending flag set to true when OTP modal opens
- Flag remains true until OTP verified or verification canceled
- Flag cleared on modal close (cancel) or page refresh
- Database query checks verificationPending flag before save

**BR-15: User Feedback on Discard**

- No explicit confirmation dialog for cancel/refresh
- User understands modal close results to discard changes
- Field reverts to original number on discard
- No data loss because original number preserved in database

**BR-16: Audit Trail**

- Log all OTP verification attempts (success/failure)
- Log all mobile number change attempts (verified/discarded)
- Track verification timestamps
- Monitor for suspicious patterns (frequent failed verifications)

#### 3.4.3 Scenarios

##### Scenario 1: Merchant verifies OTP successfully, number saves to database

```gherkin
Given the OTP verification modal is open
And the merchant entered new number "+63 9123456789"
And the original number was "+63 9171234567"
And OTP "123456" was sent to the new number
When the merchant enters correct OTP "123456"
And clicks the "Submit" button
Then the system validates the OTP
And the OTP is correct
Then the mobile number "+63 9123456789" is written to the database
And the originalNumber is updated to "+63 9123456789"
And the verificationPending flag is cleared
And the modal closes
And the field displays "+63 9123456789" in read-only mode
And a success toast displays: "Successfully updated mobile number."
```

##### Scenario 2: Merchant cancels OTP modal, number NOT saved

```gherkin
Given the OTP verification modal is open
And the merchant entered new number "+63 9123456789"
And the original number in database is "+63 9171234567"
And OTP has been sent but not yet entered
When the merchant clicks the "Close" button (X icon)
Then the modal closes immediately
And the newNumber "+63 9123456789" is discarded from temporary state
And the database STILL contains the original number "+63 9171234567"
And the mobile number field returns to read-only mode
And displays the original number "+63 9171234567"
And NO database update occurs
```

##### Scenario 3: Merchant refreshes page before OTP verification, number NOT saved

```gherkin
Given the OTP verification modal is open
And the merchant entered new number "+63 9123456789"
And the original number in database is "+63 9171234567"
And OTP "123456" was sent but merchant has not entered it yet
When the merchant refreshes the browser page (F5 or Ctrl+R)
Then the page reloads completely
And the temporary state (newNumber, verificationPending) is cleared
And the mobile number field displays the original number "+63 9171234567"
And the database STILL contains "+63 9171234567"
And NO database update occurred
And the merchant must start the edit process again
```

##### Scenario 4: Merchant navigates away from page before verification, number NOT saved

```gherkin
Given the OTP verification modal is open
And the merchant entered new number "+63 9123456789"
And the original number in database is "+63 9171234567"
When the merchant clicks on a different navigation item (e.g., "Dashboard", "Orders")
Then the system navigates to the selected page
And the temporary state is cleared
And the mobile number in database remains "+63 9171234567"
And NO database update occurred
And if the merchant returns to My Account page later
Then the mobile number field displays "+63 9171234567" (original)
```

##### Scenario 5: Merchant enters incorrect OTP multiple times, number NOT saved

```gherkin
Given the OTP verification modal is open
And the correct OTP is "123456"
And the merchant entered new number "+63 9123456789"
And the original number in database is "+63 9171234567"
When the merchant enters incorrect OTP "111111"
And clicks "Submit"
Then error message displays: "Invalid code. Please try again."
And the database STILL contains "+63 9171234567"
When the merchant enters incorrect OTP "222222"
And clicks "Submit"
Then error message displays again
And the database STILL contains "+63 9171234567"
When the merchant clicks "Close" (X icon) after multiple failed attempts
Then the modal closes
And the number reverts to "+63 9171234567"
And NO database update occurred at any point
```

##### Scenario 6: OTP expires before verification, number NOT saved

```gherkin
Given the OTP verification modal is open
And OTP "123456" was generated 2 minutes ago
And the merchant entered new number "+63 9123456789"
And the original number in database is "+63 9171234567"
When the merchant enters the expired OTP "123456"
And clicks "Submit"
Then error message displays: "Code expired. Please request a new code."
And the database STILL contains "+63 9171234567"
And the modal remains open
And the merchant must click "Resend Code" to get a new OTP
And the number is NOT saved until a valid, non-expired OTP is verified
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement                        | Metric                                       | Measurement Method          |
| ---------------------------------- | -------------------------------------------- | --------------------------- |
| OTP modal display speed            | Less than 500ms after Save button clicked    | Frontend performance timing |
| OTP verification response time     | Less than 2 seconds (P95) after Verify click | API response monitoring     |
| Input validation response time     | Less than 100ms for real-time validation     | UI event handling timing    |
| Rate limiting enforcement accuracy | 100% cooldown enforcement, zero bypasses     | Backend validation logs     |
| SMS delivery time                  | 95% delivered within 60 seconds              | SMS provider metrics        |
| Page load impact                   | Less than 200ms additional load time         | Lighthouse performance test |

### 4.2 Scalability

| Requirement                     | Target                                      | Validation Method             |
| ------------------------------- | ------------------------------------------- | ----------------------------- |
| Concurrent OTP requests         | Support 1,000+ simultaneous OTP generations | Load testing                  |
| Rate limiting tracking          | Handle 10,000+ active merchant sessions     | Session management testing    |
| Database writes on verification | Process 500+ verifications per minute       | Database performance testing  |
| SMS provider capacity           | Support burst of 2,000+ SMS per minute      | SMS provider capacity testing |

### 4.3 Reliability

| Requirement                   | Target                             | Monitoring                |
| ----------------------------- | ---------------------------------- | ------------------------- |
| OTP verification success rate | Greater than 99.5% when code valid | Verification success logs |
| Save prevention accuracy      | 100% (zero bypasses)               | Security audit logs       |
| Rate limiting accuracy        | 100% cooldown enforcement          | Rate limiting logs        |
| SMS delivery success rate     | Greater than 95%                   | SMS provider metrics      |

### 4.4 Security

| Requirement                   | Implementation                                 | Validation            |
| ----------------------------- | ---------------------------------------------- | --------------------- |
| OTP code generation           | Cryptographically secure random 6-digit codes  | Security audit        |
| OTP transmission              | Encrypted SMS delivery                         | SMS provider security |
| Session-based rate limiting   | Server-side enforcement, no client bypass      | Security testing      |
| Verification state protection | Backend validation, immune to client tampering | Penetration testing   |
| Audit logging                 | All verification attempts logged               | Log review            |

### 4.5 Usability

| Requirement                 | Target                                        | Measurement       |
| --------------------------- | --------------------------------------------- | ----------------- |
| OTP modal comprehension     | 95% users understand verification requirement | Usability testing |
| Error message clarity       | 90% users understand format validation errors | User testing      |
| Resend code discoverability | 95% users find Resend button immediately      | User testing      |
| Cooldown timer clarity      | 90% users understand countdown meaning        | User testing      |
| Overall task completion     | 90% successful mobile number updates          | Task timing       |

### 4.6 Compatibility

| Requirement           | Standard                                      | Validation            |
| --------------------- | --------------------------------------------- | --------------------- |
| Browser support       | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Cross-browser testing |
| Mobile responsiveness | Fully functional on 375px+ width screens      | Responsive testing    |
| Modal accessibility   | Screen reader compatible, keyboard navigable  | Accessibility testing |
| SMS provider support  | Compatible with existing SMS service          | Integration testing   |

---

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: Successful Mobile Number Update**

[To be created: Flowchart showing Edit → Validate → Save → OTP Modal → Enter OTP → Verify → Success]

**Alternative Flow: OTP Resend with Cooldown**

[To be created: Flowchart showing OTP Modal → Resend Code → Cooldown → Wait → Resend → Enter OTP → Verify]

**Error Flow: Invalid Format Validation**

[To be created: Flowchart showing Edit → Enter Invalid Format → Validation Error → Correct Format → Proceed to OTP]

**Error Flow: Incorrect OTP Entry**

[To be created: Flowchart showing OTP Modal → Enter Wrong OTP → Error → Retry or Resend]

### 5.2 UI Mockups & Wireframes

**My Account Page - Mobile Number Edit State:**

- Initial state: Read-only field with Edit (pencil) icon
- Edit state: Input field with country selector + number, Cancel/Save buttons
- Validation error state: Red border, error message below field

**OTP Verification Modal:**

- Modal overlay (centered, cannot dismiss by outside click)
- Title: "Verify Mobile Number"
- Message: "We've sent a 6-digit code to +63 9XXXXXXXXX"
- OTP input: 6-digit field with clear visual separation
- Resend Code button: Shows countdown timer during cooldown
- Cancel button: Secondary styling
- Verify button: Primary styling, disabled until 6 digits entered

**Cooldown Timer States:**

- Enabled: "Resend Code" (blue button)
- Cooldown: "Resend in 1:45" (grayed out)
- Escalated: "Resend in 5:00" (grayed out, warning color)

[Mockup links to be added]

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Prosperna Frontend                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           My Account Page Component                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Mobile Number Field Component                  │  │  │
│  │  │  • Read-only display with Edit button           │  │  │
│  │  │  • Edit mode with country selector + input      │  │  │
│  │  │  • Real-time validation (Philippines +63)       │  │  │
│  │  │  • Error display (inline, red text/border)      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  OTP Verification Modal Component               │  │  │
│  │  │  • 6-digit OTP input field                      │  │  │
│  │  │  • Resend Code button with cooldown timer       │  │  │
│  │  │  • Cancel / Verify buttons                      │  │  │
│  │  │  • Error/success message display                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Rate Limiting Service (Frontend)               │  │  │
│  │  │  • Track OTP request timestamps                 │  │  │
│  │  │  • Calculate cooldown timers                    │  │  │
│  │  │  • Disable/enable Resend button                 │  │  │
│  │  │  • Display countdown (MM:SS format)             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway / Backend Services              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Merchant Account Service                    │  │
│  │  • Retrieve merchant account details                  │  │
│  │  • Validate mobile number format                      │  │
│  │  • Temporary state management (newNumber)             │  │
│  │  • Database write ONLY on OTP verification            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           OTP Service                                 │  │
│  │  • Generate secure 6-digit OTP codes                  │  │
│  │  • Store OTP with 2-minute expiration                 │  │
│  │  • Validate OTP codes (match + not expired)           │  │
│  │  • Invalidate OTP after successful verification       │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Rate Limiting Service                       │  │
│  │  • Track OTP requests per merchant session            │  │
│  │  • Enforce 2-minute cooldown (normal)                 │  │
│  │  • Return cooldown remaining time to frontend         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           SMS Service Integration                     │  │
│  │  • Send OTP via SMS to mobile number                  │  │
│  │  • Track delivery status                              │  │
│  │  • Handle SMS provider responses                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Audit Logging Service                       │  │
│  │  • Log all OTP generation events                      │  │
│  │  • Log all verification attempts (success/failure)    │  │
│  │  • Log mobile number change attempts                  │  │
│  │  • Track rate limiting escalations                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Merchant Accounts Table                     │  │
│  │  • mobile_number (string, Philippine format +639...)  │  │
│  │  • mobile_number_verified_at (timestamp)              │  │
│  │  • Updated ONLY after OTP verification                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           OTP Codes Table                             │  │
│  │  • otp_code (encrypted)                               │  │
│  │  • merchant_id                                        │  │
│  │  • mobile_number                                      │  │
│  │  • created_at, expires_at (2 min TTL)                 │  │
│  │  • verified_at (null until verified)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Rate Limiting Tracking Table                │  │
│  │  • merchant_id                                        │  │
│  │  • request_count                                      │  │
│  │  • first_request_at (sliding window start)            │  │
│  │  • last_request_at                                    │  │
│  │  • cooldown_expires_at                                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Audit Logs Table                            │  │
│  │  • merchant_id, action_type, timestamp                │  │
│  │  • old_value, new_value                               │  │
│  │  • verification_success (boolean)                     │  │
│  │  • ip_address, user_agent                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**

1. Merchant edits mobile number → Frontend validates format
2. Merchant clicks Save → Backend generates OTP → SMS sent
3. OTP modal opens → Merchant enters code → Backend validates
4. If valid → Database updated → Modal closes → Success message
5. Rate limiting enforced on each OTP request (2 or 5 min cooldown)

### 6.2 Data Model (ER Diagram)

[To be created: ER diagram showing relationships between Merchant Accounts, OTP Codes, Rate Limiting Tracking, and Audit Logs tables]

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type          | Coverage Target                                               | Responsibility | Tools                       |
| ------------------ | ------------------------------------------------------------- | -------------- | --------------------------- |
| Unit Tests         | Greater than 90% code coverage for validation logic           | Dev Team       | Jest, React Testing Library |
| Integration Tests  | OTP generation → SMS send → verification flow                 | Dev Team       | Jest, Supertest             |
| BDD Scenario Tests | All Gherkin scenarios in Features F-01 through F-04 automated | QA Team        | Cucumber, Playwright        |
| API Tests          | OTP endpoints, rate limiting, verification logic              | QA Team        | Postman, Newman             |
| Security Tests     | Bypass attempts, rate limiting enforcement, OTP security      | Security Team  | OWASP ZAP, Burp Suite       |
| Usability Tests    | OTP modal UX, error message clarity, cooldown understanding   | QA Team        | User testing sessions       |
| Performance Tests  | OTP modal display speed, validation response time             | QA Team        | Lighthouse, k6              |
| Regression Tests   | Existing My Account functionality remains intact              | QA Team        | Automated test suite        |

### 7.2 BDD Test Automation

**All Gherkin scenarios in sections 3.1 through 3.4 must be automated as executable tests.**

**Test Structure:**

```
/tests
  /features
    /mobile-number-verification
      /input-validation.feature
      /otp-modal-verification.feature
      /rate-limiting-resend.feature
      /save-prevention.feature
  /step-definitions
    /validation-steps.js
    /otp-modal-steps.js
    /rate-limiting-steps.js
    /save-prevention-steps.js
  /support
    /hooks.js
    /test-data.js
    /otp-helpers.js
```

### 7.3 Critical Test Scenarios

**High Priority (P0 - Blocker):**

1. Mobile number with "0" after +63 triggers validation error
2. Mobile number with less than 10 digits triggers validation error
3. Save button with invalid format does NOT open OTP modal
4. OTP modal opens on Save with valid format
5. Correct OTP entry saves mobile number to database
6. Incorrect OTP entry does NOT save mobile number
7. Cancel button closes modal and discards changes
8. Page refresh during OTP modal does NOT save number
9. Rate limiting enforces 2-minute cooldown on Resend
10. 3 requests within 15 minutes escalates to 5-minute cooldown

**Medium Priority (P1 - Critical):**

11. Real-time validation displays error on input change
12. Validation error clears when valid format entered
13. OTP expiration (2 min) prevents verification
14. Resend Code generates new OTP and invalidates old one
15. Cooldown timer displays accurate countdown
16. Modal cannot be dismissed by clicking outside
17. Verify button disabled until 6 digits entered
18. Database audit logs capture all verification attempts
19. SMS delivery success rate monitored
20. Session-based rate limiting persists across page refreshes

**Lower Priority (P2 - Important):**

21. OTP modal displays within 500ms
22. Verification completes within 2 seconds
23. Input validation responds within 100ms
24. Mobile responsiveness of OTP modal
25. Keyboard navigation within modal
26. Screen reader announces validation errors
27. Error messages meet WCAG AA contrast standards
28. SMS provider capacity supports burst requests
29. Rate limiting handles 10,000+ active sessions
30. Audit logs support forensic analysis

---

## 8. Risks & Mitigations

### High-Impact Risks

| Risk                                                                            | Probability | Impact | Mitigation                                                                                           | Residual Concern                                                    |
| ------------------------------------------------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| SMS delivery failures prevent legitimate verifications                          | Medium      | High   | Fallback to email verification; 95% SMS delivery SLA with provider; retry logic on delivery failures | 5% of verifications may require manual support intervention         |
| Rate limiting too restrictive frustrates users                                  | Medium      | Medium | 2-minute normal cooldown balanced for UX; escalation only after 3 requests; usability testing first  | Power users may find cooldown annoying; some support tickets likely |
| Existing merchants with invalid formats cannot update                           | Low         | Medium | Migration script to convert +63 09XXX to +63 9XXX; grace period with warnings before enforcement     | Small % of edge cases may require manual data cleanup               |
| OTP modal UX confuses users unfamiliar with 2FA                                 | Medium      | Medium | Clear messaging in modal; contextual help text; comprehensive user testing                           | First-time users may need support; onboarding documentation needed  |
| Performance degradation with OTP generation under high load                     | Low         | High   | SMS provider capacity testing; caching OTP codes; rate limiting inherently reduces load              | Under extreme conditions (1000+ requests/min), delays possible      |
| Security: Session-based rate limiting bypassable with multiple browsers/devices | Low         | Medium | Track rate limiting by merchant ID + phone number (not just session); monitor for abuse patterns     | Sophisticated attackers with multiple IPs could still abuse         |

---

## 9. Future Enhancements

1. **To follow**

---

## Approval and Sign-off

| Stakeholder       | Role | Status        | Date Signed       |
| ----------------- | ---- | ------------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending     | ---               |
| Ruel Nopal        | HoE  | ☐ Pending     | ---               |
| Rian Froille Alde | QA   | ☐ Pending     | ---               |
| ---               | BE   | ☐ Pending     | ---               |
| ---               | FE   | ☐ Pending     | ---               |
| Adrianne Berida   | BA   | ☐ In Progress | November 20, 2025 |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for enhancing Prosperna's My Account module mobile number field with security improvements, OTP verification enforcement, rate limiting, and input validation for Philippine mobile numbers.
