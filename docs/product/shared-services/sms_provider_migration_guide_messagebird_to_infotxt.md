---
id: sms-provider-migration-messagebird-infotxt
title: SMS Provider Migration Guide - MessageBird to InfoTxt
sidebar_label: SMS Provider Migration Guide
sidebar_position: 1
---

## Table of Contents

1. [Current Implementation Analysis](#1-current-implementation-analysis)
2. [Migration Requirements](#2-migration-requirements)
3. [Step-by-Step Implementation Guide](#3-step-by-step-implementation-guide)
4. [Testing Strategy](#4-testing-strategy)
5. [Deployment Plan](#5-deployment-plan)

---

## 1. Current Implementation Analysis

### 1.1 Files/Modules Using MessageBird

#### Orders Service API (`orders-service-api`)

**Core Implementation Files:**

- `src/utils/messagebird.ts` - Main MessageBird SMS sending utility
- `src/utils/sms/service.ts` - SMS service wrapper using MessageBird
- `src/utils/sms/index.ts` - Re-exports MessageBird utility
- `src/domain/v1/orders.service.ts` - Uses MessageBird for order status notifications

**Documentation:**

- `docs/sms/README.md` - SMS service documentation

**Test Files:**

- `src/test/domain/v1/services/orders.email.service.test.ts` - Contains MessageBird mocks

#### Payment Integration API (`payment-integration-api`)

**Core Implementation Files:**

- `src/collections/balances/withdraw/otp/platforms/messagebird.ts` - OTP generation and verification
- `src/collections/balances/withdraw/sms/messagebird.ts` - SMS notification sending
- `src/collections/balances/balances.service.ts` - Uses MessageBird OTP platform
- `src/collections/balances/webhook/withdrawwebhook.service.ts` - Uses MessageBird SMS platform

**Test Files:**

- `src/collections/balances/test/webhook.balances.test.ts`
- `src/collections/balances/test/admin.balances.test.ts`
- `src/collections/balances/test/merchant.balances.test.ts`

#### User Service API (`user-service-api`)

**Core Implementation Files:**

- `src/utils/messagebird.ts` - MessageBird SDK initialization
- `src/routes/v1/users/merchant.ts` - Merchant OTP verification endpoints

**Dependencies:**

- `messagebird` package (v4.0.1) in `package.json`

### 1.2 Current SMS Flows

#### Flow 1: Order Status Notifications (Orders Service)

**Purpose:** Send SMS notifications to customers when order status changes

**Implementation:**

```typescript
export const sendMessageBirdSMS = async (
  mobile_number: string,
  message: string,
) => {
  try {
    const { data } = await axios.post(
      `${process.env.MESSAGEBIRD_API}/messages`,
      {
        originator: 'Prosperna',
        recipients: [mobile_number],
        body: message,
      },
      {
        headers: {
          Authorization: `AccessKey ${
            process.env.NODE_ENV === 'production'
              ? process.env.MESSAGEBIRD_API_KEY_LIVE
              : process.env.MESSAGEBIRD_API_KEY_DEV
          }`,
        },
      },
    );
    // ... error handling
  }
}
```

**Usage Locations:**

- `src/domain/v1/orders.service.ts` (line 1605) - Active usage
- Multiple commented-out locations (lines 340, 3198, 3208, 3516, 3985)

**Supported Order Statuses:**

- Open, Accepted, Declined, Processing, Ready for Pickup, Shipped, Out for delivery, Completed, Delivery Cancelled, Returned

**Payment Types:**

- COD (Cash on Delivery)
- COP (Cash on Pickup)
- ONLINE_PAYMENTS (EWALLET, CREDIT_CARD, BANK_TRANSFER, OVER_THE_COUNTER)

#### Flow 2: OTP Verification for Withdrawals (Payment Integration API)

**Purpose:** Generate and verify OTP codes for withdrawal requests

**OTP Generation:**

```typescript
async generateOTP(mobile_number: string): Promise<OTPDetails> {
  try {
    const { data } = await axios.post(
      `${process.env.MESSAGEBIRD_API}/verify`,
      {
        recipient: mobile_number,
        originator: 'Prosperna',
        Reference: '',
        type: 'sms',
        template:
          'Your verification code for your withdrawal request is %token. Please enter within 2 minutes. Do not share this code with anyone.',
        dataCoding: '',
        timeout: '120', // 2 minutes
        tokenLength: '6',
      },
      {
        headers: {
          Authorization: `AccessKey ${process.env.MESSAGEBIRD_API_KEY_LIVE}`,
        },
      },
    );

    return {
      otp_id: data.id,
      valid_until: new Date(data.validUntilDatetime),
      mobile_number,
    };
  }
}
```

**OTP Verification:**

```typescript
async verifyOTP(
  otp: number,
  options?: VerifyOTPOptions,
): Promise<VerifyOTPDetails> {
  try {
    const data = await axios.get(
      `${process.env.MESSAGEBIRD_API}/verify/${options?.otp_id}?token=${otp}`,
      {
        headers: {
          Authorization: `AccessKey ${process.env.MESSAGEBIRD_API_KEY_LIVE}`,
        },
      },
    );

    return {
      is_verified: data.data.status === 'verified',
      mobile_number: options?.mobile_number ?? '',
    };
  }
}
```

#### Flow 3: SMS Notifications for Withdrawals (Payment Integration API)

**Purpose:** Send SMS notifications for withdrawal-related events

**Implementation:**

```typescript
async sendSMS(
  mobile_numbers: string[],
  options?: MessagebirdSMSSendingOptions,
) {
  try {
    const sms_payload = {
      originator: 'Prosperna',
      recipients: mobile_numbers,
      body: options?.body,
    };

    await axios.post(`${process.env.MESSAGEBIRD_API}/messages`, sms_payload, {
      headers: {
        Authorization: `AccessKey ${process.env.MESSAGEBIRD_API_KEY_LIVE}`,
      },
    });

    return {
      mobile_numbers,
    };
  }
}
```

#### Flow 4: Merchant OTP Verification (User Service API)

**Purpose:** Verify merchant phone numbers during registration/update

**OTP Generation:**

```typescript
messagebird.verify.create(
  mobile_number,
  {
    template: "Your Prosperna verification code is: %token.",
    originator: "Prosperna",
    type: "sms",
    timeout: OTP_CODE_VALIDITY_IN_SECONDS,
  },
  async (err, result) => {
    // ... error handling and database updates
  }
);
```

**OTP Verification:**

```typescript
messagebird.verify.verify(
  mobile_verification_id,
  otp_code,
  async (err, result) => {
    // ... verification logic
  }
);
```

### 1.3 MessageBird API Endpoints Currently in Use

| Endpoint                   | Method | Purpose           | Used In                                   |
| -------------------------- | ------ | ----------------- | ----------------------------------------- |
| `/messages`                | POST   | Send SMS messages | Orders Service, Payment Integration API   |
| `/verify`                  | POST   | Generate OTP code | Payment Integration API, User Service API |
| `/verify/{id}?token={otp}` | GET    | Verify OTP code   | Payment Integration API, User Service API |

### 1.4 Configuration Files and Environment Variables

#### Environment Variables

**All Services:**

- `MESSAGEBIRD_API` - Base API URL (default: `https://rest.messagebird.com`)
- `MESSAGEBIRD_API_KEY_LIVE` - Production API key
- `MESSAGEBIRD_API_KEY_DEV` - Development API key (Note: Currently not working, live key used for testing)

**Service-Specific:**

- `NODE_ENV` - Used to determine which API key to use (production vs development)

#### Configuration Patterns

**Orders Service:**

- Uses environment-based key selection
- Originator: "Prosperna"
- Supports dry-run and log-only modes

**Payment Integration API:**

- Always uses `MESSAGEBIRD_API_KEY_LIVE`
- OTP timeout: 120 seconds (2 minutes)
- OTP length: 6 digits

**User Service API:**

- Uses MessageBird SDK (not direct axios calls)
- Always uses `MESSAGEBIRD_API_KEY_LIVE`
- Uses callback-based API

---

## 2. Migration Requirements

### 2.1 Required InfoTxt API Credentials and Configuration

**Required Environment Variables:**

```env
# InfoTxt API Configuration
INFOTXT_API_URL=https://api.myinfotxt.com
INFOTXT_USER_ID=<your_assigned_infotxt_user_id>
INFOTXT_API_KEY=<your_assigned_infotxt_api_key>

# Optional: For development environment (if separate credentials provided)
INFOTXT_USER_ID_DEV=<dev_user_id_if_available>
INFOTXT_API_KEY_DEV=<dev_api_key_if_available>
```

**Key Configuration Notes:**

- InfoTxt uses **query parameters** for authentication (UserID and ApiKey), NOT headers
- Base API URL: `https://api.myinfotxt.com`
- All endpoints support both GET and POST methods
- Mobile numbers must be in Philippine format: `09xxXXXxxxx`
- Dedicated SIM number will be used as sender: `0917.587.2020` (no custom originator support)

### 2.2 InfoTxt API Endpoints and MessageBird Comparison

#### Complete API Mapping Table

| Feature                  | MessageBird                                  | InfoTxt                                                          | Changes Required                                                     |
| ------------------------ | -------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Send SMS (Single)**    | `POST /messages`                             | `GET/POST /v2/send.php`                                          | Change endpoint, auth method, mobile format                          |
| **Send SMS (Bulk)**      | Multiple POST calls to `/messages`           | `GET/POST /v2/send-bulk.php`                                     | Use bulk endpoint for multiple recipients                            |
| **Generate OTP**         | `POST /verify`                               | `GET/POST /v2/otp-send.php`                                      | Change endpoint, auth method, response structure                     |
| **Verify OTP**           | `GET /verify/{id}?token={token}`             | `GET/POST /v2/otp-check.php?OTPID={id}&OTP={token}`              | Change endpoint, add OTPID parameter, handle otpstatus values        |
| **Check SMS Status**     | Via message ID query or webhooks             | `GET/POST /v2/status.php?smsid={id}`                             | New capability to implement                                          |
| **Authentication**       | Header: `Authorization: AccessKey {key}`     | Query params: `UserID={id}&ApiKey={key}`                         | Complete auth mechanism change                                       |
| **Mobile Number Format** | International with country code (+639...)    | Philippine format (09...)                                        | Add transformation function                                          |
| **Sender ID**            | Custom originator (e.g., "Prosperna")        | Fixed dedicated SIM: `0917.587.2020`                             | Remove originator parameter                                          |
| **Response Structure**   | JSON with `id`, `recipients`, etc.           | JSON with `status` code and `smsid` or `error`                   | Update response parsing logic                                        |
| **OTP Response**         | Returns `id`, `validUntilDatetime`, `status` | Returns `status`, `otpid`, `otp` (actual token value)            | Update OTP storage (store otpid, not otp value)                      |
| **OTP Verification**     | Returns `status`: `verified` or other        | Returns `otpstatus`: `VALID`, `INVALID`, `EXPIRED`, or `REPEAT`  | Handle 4 different statuses instead of 2                             |
| **Error Handling**       | HTTP status codes + error objects            | Always 200 OK with `status` field (`00`=success, `01-07`=errors) | Parse status codes in success responses                              |
| **OTP Storage**          | MessageBird stores internally                | InfoTxt stores internally (no custom storage needed)             | No Redis needed - InfoTxt handles OTP storage similar to MessageBird |
| **Message Priority**     | Not supported                                | Optional `Priority` parameter (0=low, 1=normal, 2=high)          | Optional: Can add priority for API sends                             |
| **Rate Limiting**        | 500 req/s for POST                           | Not specified in docs (to be confirmed with provider)            | Monitor and implement if needed                                      |

#### InfoTxt Status Codes Reference

**SMS Sending Status Codes:**

- `00` - Success (smsid returned)
- `01` - Invalid mobile number
- `02` - Empty SMS body
- `03` - Empty UserID
- `04` - Empty Hash (ApiKey)
- `05` - UserID not found
- `06` - Invalid Hash (ApiKey)
- `07` - UserID expired

**SMS Delivery Status Codes (via status.php):**

- `0` - Queued (pending)
- `1` - Sent (delivered successfully)
- `2` - Failed

**OTP Verification Status Values:**

- `VALID` - OTP is correct and within validity period
- `INVALID` - OTP code is incorrect
- `EXPIRED` - OTP validity period has passed
- `REPEAT` - OTP has already been used (duplicate verification attempt)

### 2.3 Code Files Requiring Modification

#### Orders Service API

**Files to Modify:**

1. **`src/utils/messagebird.ts`** → Create new `src/utils/infotxt.ts`

   - Replace MessageBird SMS sending logic with InfoTxt
   - Update authentication mechanism
   - Add mobile number formatting
   - Update response parsing

2. **`src/utils/sms/service.ts`**

   - Update import to use InfoTxt utility
   - Add feature flag logic for gradual migration

3. **`src/utils/sms/index.ts`**

   - Update re-exports to include InfoTxt utility
   - Maintain backward compatibility during migration

4. **`src/domain/v1/orders.service.ts`**
   - No direct changes needed if using service wrapper
   - Verify error handling matches InfoTxt response structure

**Test Files to Update:**

- `src/test/domain/v1/services/orders.email.service.test.ts` - Update mocks for InfoTxt

#### Payment Integration API

**Files to Modify:**

1. **`src/collections/balances/withdraw/otp/platforms/messagebird.ts`** → Create `infotxt.ts`

   - Replace OTP generation logic
   - Replace OTP verification logic
   - Update response structure handling
   - Handle 4 OTP statuses (VALID, INVALID, EXPIRED, REPEAT)

2. **`src/collections/balances/withdraw/sms/messagebird.ts`** → Create `infotxt.ts`

   - Replace SMS sending logic
   - Consider using bulk SMS endpoint for multiple recipients
   - Update mobile number formatting

3. **`src/collections/balances/balances.service.ts`**

   - Update OTP platform import
   - Add feature flag logic

4. **`src/collections/balances/webhook/withdrawwebhook.service.ts`**
   - Update SMS platform import
   - Add feature flag logic

**Test Files to Update:**

- `src/collections/balances/test/webhook.balances.test.ts`
- `src/collections/balances/test/admin.balances.test.ts`
- `src/collections/balances/test/merchant.balances.test.ts`

#### User Service API

**Files to Modify:**

1. **`src/utils/messagebird.ts`** → Create new `src/utils/infotxt.ts`

   - Replace SDK-based implementation with axios
   - Convert callback-based to promise-based
   - Implement OTP generation and verification

2. **`src/routes/v1/users/merchant.ts`**
   - Replace MessageBird SDK calls with InfoTxt utility
   - Update error handling
   - Handle new OTP status values

**Dependencies to Update:**

- Remove `messagebird` package from `package.json`
- Add `axios` if not already present (likely already installed)

### 2.4 Database Schema Changes

**No database schema changes required.**

InfoTxt handles OTP storage internally, similar to MessageBird. The existing database fields for storing `otp_id` (or equivalent) remain valid - just store the `otpid` returned by InfoTxt.

---

## 3. Step-by-Step Implementation Guide

### 3.1 Pre-Migration Checklist

- [ ] Obtain InfoTxt credentials (UserID and ApiKey)
- [ ] Verify access to InfoTxt API documentation
- [ ] Confirm dedicated SIM number: `0917.587.2020`
- [ ] Test InfoTxt API endpoints manually (using Postman/curl)
- [ ] Review current SMS usage volumes
- [ ] Backup current MessageBird configuration
- [ ] Create feature flag in configuration system
- [ ] Set up monitoring for new provider

### 3.2 Implementation Steps by Service

#### Step 1: Create InfoTxt Utility Module (All Services)

**File:** `src/utils/infotxt.ts`

```typescript
import axios from "axios";

/**
 * InfoTxt API Configuration
 */
const INFOTXT_CONFIG = {
  apiUrl: process.env.INFOTXT_API_URL || "https://api.myinfotxt.com",
  userId: process.env.INFOTXT_USER_ID,
  apiKey: process.env.INFOTXT_API_KEY,
};

/**
 * Formats mobile number to InfoTxt required format (09xxXXXxxxx)
 * Handles international format (+63) and local format (63, 09)
 */
export const formatMobileNumber = (mobile: string): string => {
  // Remove spaces and dashes
  let cleaned = mobile.replace(/[\s-]/g, "");

  // Handle +63 prefix
  if (cleaned.startsWith("+63")) {
    return "0" + cleaned.substring(3);
  }

  // Handle 63 prefix
  if (cleaned.startsWith("63")) {
    return "0" + cleaned.substring(2);
  }

  // Already in 09 format
  if (cleaned.startsWith("09")) {
    return cleaned;
  }

  // Handle 9xxxxxxxxx format
  if (cleaned.length === 10 && cleaned.startsWith("9")) {
    return "0" + cleaned;
  }

  // Return as-is if format is unclear (validation will fail at API level)
  return cleaned;
};

/**
 * Send SMS using InfoTxt API
 */
export const sendInfoTxtSMS = async (
  mobile_number: string,
  message: string,
  options?: {
    priority?: 0 | 1 | 2; // 0=low, 1=normal (default), 2=high
  }
): Promise<{ success: boolean; smsid?: string; error?: string }> => {
  try {
    const formattedMobile = formatMobileNumber(mobile_number);

    const response = await axios.get(`${INFOTXT_CONFIG.apiUrl}/v2/send.php`, {
      params: {
        UserID: INFOTXT_CONFIG.userId,
        ApiKey: INFOTXT_CONFIG.apiKey,
        Mobile: formattedMobile,
        SMS: message,
        ...(options?.priority && { Priority: options.priority }),
      },
    });

    const { status, smsid, error } = response.data;

    if (status === "00") {
      return { success: true, smsid };
    } else {
      return {
        success: false,
        error: error || `Unknown error (status: ${status})`,
      };
    }
  } catch (error) {
    console.error("InfoTxt SMS Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Send Bulk SMS using InfoTxt API
 * More efficient for multiple recipients
 */
export const sendInfoTxtBulkSMS = async (
  mobile_numbers: string[],
  message: string,
  options?: {
    priority?: 0 | 1 | 2;
  }
): Promise<{ success: boolean; smsids?: string[]; error?: string }> => {
  try {
    const formattedMobiles = mobile_numbers.map(formatMobileNumber);

    const response = await axios.get(
      `${INFOTXT_CONFIG.apiUrl}/v2/send-bulk.php`,
      {
        params: {
          UserID: INFOTXT_CONFIG.userId,
          ApiKey: INFOTXT_CONFIG.apiKey,
          Mobile: formattedMobiles.join(","),
          SMS: message,
          ...(options?.priority && { Priority: options.priority }),
        },
      }
    );

    const { status, smsid, error } = response.data;

    if (status === "00") {
      // smsid is comma-separated for bulk
      const smsids = smsid.split(",");
      return { success: true, smsids };
    } else {
      return {
        success: false,
        error: error || `Unknown error (status: ${status})`,
      };
    }
  } catch (error) {
    console.error("InfoTxt Bulk SMS Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Check SMS delivery status
 */
export const checkInfoTxtSMSStatus = async (
  smsid: string
): Promise<{ status: 0 | 1 | 2; smsid: string }> => {
  try {
    const response = await axios.get(`${INFOTXT_CONFIG.apiUrl}/v2/status.php`, {
      params: { smsid },
    });

    return {
      status: parseInt(response.data.status),
      smsid: response.data.smsid,
    };
    // Status: 0=queued, 1=sent, 2=failed
  } catch (error) {
    console.error("InfoTxt Status Check Error:", error);
    throw error;
  }
};

/**
 * Generate OTP and send via SMS
 */
export const generateInfoTxtOTP = async (
  mobile_number: string
): Promise<{
  success: boolean;
  otpid?: string;
  error?: string;
  validUntil?: Date;
}> => {
  try {
    const formattedMobile = formatMobileNumber(mobile_number);

    const response = await axios.get(
      `${INFOTXT_CONFIG.apiUrl}/v2/otp-send.php`,
      {
        params: {
          UserID: INFOTXT_CONFIG.userId,
          ApiKey: INFOTXT_CONFIG.apiKey,
          Mobile: formattedMobile,
        },
      }
    );

    const { status, otpid, error } = response.data;

    if (status === "00") {
      // InfoTxt returns the actual OTP value, but we should NOT store it
      // Only store the otpid for later verification
      // InfoTxt OTP is valid for a default period (typically 5-10 minutes)
      const validUntil = new Date(Date.now() + 10 * 60 * 1000); // Assume 10 minutes

      return { success: true, otpid, validUntil };
    } else {
      return {
        success: false,
        error: error || `Unknown error (status: ${status})`,
      };
    }
  } catch (error) {
    console.error("InfoTxt OTP Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Verify OTP code
 */
export const verifyInfoTxtOTP = async (
  otpid: string,
  otp: string
): Promise<{
  success: boolean;
  status: "VALID" | "INVALID" | "EXPIRED" | "REPEAT" | "ERROR";
  error?: string;
}> => {
  try {
    const response = await axios.get(
      `${INFOTXT_CONFIG.apiUrl}/v2/otp-check.php`,
      {
        params: {
          UserID: INFOTXT_CONFIG.userId,
          ApiKey: INFOTXT_CONFIG.apiKey,
          OTPID: otpid,
          OTP: otp,
        },
      }
    );

    const { status, otpstatus, error } = response.data;

    if (status === "00") {
      return {
        success: otpstatus === "VALID",
        status: otpstatus,
      };
    } else {
      return {
        success: false,
        status: "ERROR",
        error: error || `Unknown error (status: ${status})`,
      };
    }
  } catch (error) {
    console.error("InfoTxt OTP Verification Error:", error);
    return {
      success: false,
      status: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Map InfoTxt error status codes to human-readable messages
 */
export const getInfoTxtErrorMessage = (statusCode: string): string => {
  const errorMessages: Record<string, string> = {
    "01": "Invalid mobile number",
    "02": "Empty SMS body",
    "03": "Empty UserID",
    "04": "Empty ApiKey",
    "05": "UserID not found",
    "06": "Invalid ApiKey",
    "07": "UserID expired",
    "08": "Empty OTPID",
    "09": "Empty OTP",
  };

  return errorMessages[statusCode] || `Unknown error (status: ${statusCode})`;
};
```

#### Step 2: Update Orders Service API

**File:** `src/utils/sms/service.ts`

```typescript
import { sendMessageBirdSMS } from "../messagebird";
import { sendInfoTxtSMS } from "../infotxt";

/**
 * Feature flag to determine which SMS provider to use
 */
const shouldUseInfoTxt = (): boolean => {
  return process.env.USE_INFOTXT === "true";
};

/**
 * Send SMS with provider abstraction
 */
export const sendSMS = async (
  mobile_number: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (shouldUseInfoTxt()) {
      // Use InfoTxt
      const result = await sendInfoTxtSMS(mobile_number, message, {
        priority: 1, // Normal priority for order notifications
      });
      return result;
    } else {
      // Use MessageBird (existing implementation)
      await sendMessageBirdSMS(mobile_number, message);
      return { success: true };
    }
  } catch (error) {
    console.error("SMS Sending Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
```

**No changes needed in `src/domain/v1/orders.service.ts`** - it will use the updated service wrapper.

#### Step 3: Update Payment Integration API

**File:** `src/collections/balances/withdraw/otp/platforms/infotxt.ts` (NEW FILE)

```typescript
import {
  generateInfoTxtOTP,
  verifyInfoTxtOTP,
} from "../../../../../utils/infotxt";

interface OTPDetails {
  otp_id: string;
  valid_until: Date;
  mobile_number: string;
}

interface VerifyOTPOptions {
  otp_id: string;
  mobile_number: string;
}

interface VerifyOTPDetails {
  is_verified: boolean;
  mobile_number: string;
  verification_status?: "VALID" | "INVALID" | "EXPIRED" | "REPEAT";
}

export class InfoTxtOTPPlatform {
  async generateOTP(mobile_number: string): Promise<OTPDetails> {
    const result = await generateInfoTxtOTP(mobile_number);

    if (result.success && result.otpid) {
      return {
        otp_id: result.otpid,
        valid_until: result.validUntil || new Date(Date.now() + 10 * 60 * 1000),
        mobile_number,
      };
    } else {
      throw new Error(result.error || "Failed to generate OTP");
    }
  }

  async verifyOTP(
    otp: number,
    options?: VerifyOTPOptions
  ): Promise<VerifyOTPDetails> {
    if (!options?.otp_id) {
      throw new Error("OTP ID is required for verification");
    }

    const result = await verifyInfoTxtOTP(options.otp_id, otp.toString());

    return {
      is_verified: result.success,
      mobile_number: options.mobile_number,
      verification_status: result.status,
    };
  }
}
```

**File:** `src/collections/balances/withdraw/sms/infotxt.ts` (NEW FILE)

```typescript
import { sendInfoTxtSMS, sendInfoTxtBulkSMS } from "../../../../utils/infotxt";

interface InfoTxtSMSSendingOptions {
  body: string;
}

export class InfoTxtSMSPlatform {
  async sendSMS(
    mobile_numbers: string[],
    options?: InfoTxtSMSSendingOptions
  ): Promise<{ mobile_numbers: string[] }> {
    if (!options?.body) {
      throw new Error("SMS body is required");
    }

    // Use bulk SMS if multiple recipients
    if (mobile_numbers.length > 1) {
      const result = await sendInfoTxtBulkSMS(mobile_numbers, options.body, {
        priority: 2, // High priority for withdrawal notifications
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send SMS");
      }
    } else if (mobile_numbers.length === 1) {
      const result = await sendInfoTxtSMS(mobile_numbers[0], options.body, {
        priority: 2, // High priority for withdrawal notifications
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send SMS");
      }
    }

    return { mobile_numbers };
  }
}
```

**File:** `src/collections/balances/balances.service.ts`

```typescript
// Add imports
import { InfoTxtOTPPlatform } from "./withdraw/otp/platforms/infotxt";
import { MessageBirdOTPPlatform } from "./withdraw/otp/platforms/messagebird"; // existing

// Add feature flag check
const shouldUseInfoTxt = (): boolean => {
  return process.env.USE_INFOTXT === "true";
};

// Update OTP platform selection
const getOTPPlatform = () => {
  if (shouldUseInfoTxt()) {
    return new InfoTxtOTPPlatform();
  } else {
    return new MessageBirdOTPPlatform();
  }
};

// Use in your existing code:
// const otpPlatform = getOTPPlatform();
// await otpPlatform.generateOTP(mobile_number);
```

**File:** `src/collections/balances/webhook/withdrawwebhook.service.ts`

```typescript
// Add imports
import { InfoTxtSMSPlatform } from "../withdraw/sms/infotxt";
import { MessageBirdSMSPlatform } from "../withdraw/sms/messagebird"; // existing

// Add feature flag check
const shouldUseInfoTxt = (): boolean => {
  return process.env.USE_INFOTXT === "true";
};

// Update SMS platform selection
const getSMSPlatform = () => {
  if (shouldUseInfoTxt()) {
    return new InfoTxtSMSPlatform();
  } else {
    return new MessageBirdSMSPlatform();
  }
};

// Use in your existing code:
// const smsPlatform = getSMSPlatform();
// await smsPlatform.sendSMS(mobile_numbers, { body: message });
```

#### Step 4: Update User Service API

**File:** `src/utils/infotxt.ts`

(Use the same utility file created in Step 1 - copy it to this service)

**File:** `src/routes/v1/users/merchant.ts`

```typescript
// Add imports at the top
import {
  generateInfoTxtOTP,
  verifyInfoTxtOTP,
  formatMobileNumber,
} from "../../utils/infotxt";

// Feature flag
const shouldUseInfoTxt = (): boolean => {
  return process.env.USE_INFOTXT === "true";
};

// Replace MessageBird OTP generation (around line 383-422)
// OLD CODE:
/*
messagebird.verify.create(
  mobile_number,
  {
    template: 'Your Prosperna verification code is: %token.',
    originator: 'Prosperna',
    type: 'sms',
    timeout: OTP_CODE_VALIDITY_IN_SECONDS,
  },
  async (err, result) => {
    // ... error handling and database updates
  },
);
*/

// NEW CODE:
if (shouldUseInfoTxt()) {
  // InfoTxt implementation
  try {
    const result = await generateInfoTxtOTP(mobile_number);

    if (result.success && result.otpid) {
      // Update database with OTP ID
      await updateMerchantMobileVerification({
        mobile_number,
        mobile_verification_id: result.otpid,
        mobile_verified: false,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || "Failed to send OTP",
      });
    }
  } catch (error) {
    console.error("InfoTxt OTP Generation Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
} else {
  // MessageBird implementation (existing code)
  messagebird.verify.create(
    mobile_number,
    {
      template: "Your Prosperna verification code is: %token.",
      originator: "Prosperna",
      type: "sms",
      timeout: OTP_CODE_VALIDITY_IN_SECONDS,
    },
    async (err, result) => {
      // ... existing error handling and database updates
    }
  );
}

// Replace MessageBird OTP verification (around line 484-489)
// OLD CODE:
/*
messagebird.verify.verify(
  mobile_verification_id,
  otp_code,
  async (err, result) => {
    // ... verification logic
  },
);
*/

// NEW CODE:
if (shouldUseInfoTxt()) {
  // InfoTxt implementation
  try {
    const result = await verifyInfoTxtOTP(mobile_verification_id, otp_code);

    if (result.success && result.status === "VALID") {
      // OTP is valid - update database
      await updateMerchantMobileVerification({
        mobile_number,
        mobile_verified: true,
      });

      return res.status(200).json({
        success: true,
        message: "Mobile number verified successfully",
      });
    } else if (result.status === "EXPIRED") {
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new code.",
      });
    } else if (result.status === "REPEAT") {
      return res.status(400).json({
        success: false,
        error: "OTP has already been used. Please request a new code.",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP code",
      });
    }
  } catch (error) {
    console.error("InfoTxt OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
} else {
  // MessageBird implementation (existing code)
  messagebird.verify.verify(
    mobile_verification_id,
    otp_code,
    async (err, result) => {
      // ... existing verification logic
    }
  );
}
```

### 3.3 Configuration Changes

#### Environment Variables Setup

**Development Environment (`.env.development`):**

```env
# Feature Flag
USE_INFOTXT=true

# InfoTxt Configuration
INFOTXT_API_URL=https://api.myinfotxt.com
INFOTXT_USER_ID=<your_dev_user_id>
INFOTXT_API_KEY=<your_dev_api_key>

# Keep MessageBird as fallback (optional)
MESSAGEBIRD_API=https://rest.messagebird.com
MESSAGEBIRD_API_KEY_LIVE=<existing_key>
MESSAGEBIRD_API_KEY_DEV=<existing_key>
```

**Staging Environment (`.env.staging`):**

```env
# Feature Flag - start disabled
USE_INFOTXT=false
INFOTXT_ROLLOUT_PERCENTAGE=0

# InfoTxt Configuration
INFOTXT_API_URL=https://api.myinfotxt.com
INFOTXT_USER_ID=<your_staging_user_id>
INFOTXT_API_KEY=<your_staging_api_key>

# MessageBird (keep active)
MESSAGEBIRD_API=https://rest.messagebird.com
MESSAGEBIRD_API_KEY_LIVE=<existing_key>
```

**Production Environment (`.env.production`):**

```env
# Feature Flag - start disabled
USE_INFOTXT=false
INFOTXT_ROLLOUT_PERCENTAGE=0

# InfoTxt Configuration
INFOTXT_API_URL=https://api.myinfotxt.com
INFOTXT_USER_ID=<your_production_user_id>
INFOTXT_API_KEY=<your_production_api_key>

# MessageBird (keep active during migration)
MESSAGEBIRD_API=https://rest.messagebird.com
MESSAGEBIRD_API_KEY_LIVE=<existing_key>
```

#### Dependency Updates

**All services `package.json`:**

```json
{
  "dependencies": {
    "axios": "^1.6.0" // Ensure axios is installed (likely already present)
    // Remove or keep messagebird during migration:
    // "messagebird": "^4.0.1" // Can be removed after full migration
  }
}
```

### 3.4 Unit Tests

#### Test File: `src/utils/__tests__/infotxt.test.ts`

```typescript
import axios from "axios";
import {
  formatMobileNumber,
  sendInfoTxtSMS,
  generateInfoTxtOTP,
  verifyInfoTxtOTP,
} from "../infotxt";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("InfoTxt Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.INFOTXT_API_URL = "https://api.myinfotxt.com";
    process.env.INFOTXT_USER_ID = "test_user_id";
    process.env.INFOTXT_API_KEY = "test_api_key";
  });

  describe("formatMobileNumber", () => {
    it("should convert +63 format to 09 format", () => {
      expect(formatMobileNumber("+639171234567")).toBe("09171234567");
    });

    it("should convert 63 format to 09 format", () => {
      expect(formatMobileNumber("639171234567")).toBe("09171234567");
    });

    it("should keep 09 format as-is", () => {
      expect(formatMobileNumber("09171234567")).toBe("09171234567");
    });

    it("should convert 9xxxxxxxxx to 09xxxxxxxxx", () => {
      expect(formatMobileNumber("9171234567")).toBe("09171234567");
    });

    it("should remove spaces and dashes", () => {
      expect(formatMobileNumber("+63 917 123 4567")).toBe("09171234567");
      expect(formatMobileNumber("0917-123-4567")).toBe("09171234567");
    });
  });

  describe("sendInfoTxtSMS", () => {
    it("should send SMS successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "00", smsid: "12345" },
      });

      const result = await sendInfoTxtSMS("09171234567", "Test message");

      expect(result.success).toBe(true);
      expect(result.smsid).toBe("12345");
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.myinfotxt.com/v2/send.php",
        {
          params: {
            UserID: "test_user_id",
            ApiKey: "test_api_key",
            Mobile: "09171234567",
            SMS: "Test message",
          },
        }
      );
    });

    it("should handle API errors", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "01", error: "Invalid mobile number" },
      });

      const result = await sendInfoTxtSMS("invalid", "Test message");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid mobile number");
    });

    it("should handle network errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

      const result = await sendInfoTxtSMS("09171234567", "Test message");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("generateInfoTxtOTP", () => {
    it("should generate OTP successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "00", otpid: "otp123", otp: "123456" },
      });

      const result = await generateInfoTxtOTP("09171234567");

      expect(result.success).toBe(true);
      expect(result.otpid).toBe("otp123");
      expect(result.validUntil).toBeInstanceOf(Date);
    });

    it("should handle OTP generation errors", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "01", error: "Invalid mobile number" },
      });

      const result = await generateInfoTxtOTP("invalid");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid mobile number");
    });
  });

  describe("verifyInfoTxtOTP", () => {
    it("should verify valid OTP", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "00", otpstatus: "VALID" },
      });

      const result = await verifyInfoTxtOTP("otp123", "123456");

      expect(result.success).toBe(true);
      expect(result.status).toBe("VALID");
    });

    it("should handle invalid OTP", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "00", otpstatus: "INVALID" },
      });

      const result = await verifyInfoTxtOTP("otp123", "999999");

      expect(result.success).toBe(false);
      expect(result.status).toBe("INVALID");
    });

    it("should handle expired OTP", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "00", otpstatus: "EXPIRED" },
      });

      const result = await verifyInfoTxtOTP("otp123", "123456");

      expect(result.success).toBe(false);
      expect(result.status).toBe("EXPIRED");
    });

    it("should handle repeated OTP", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: "00", otpstatus: "REPEAT" },
      });

      const result = await verifyInfoTxtOTP("otp123", "123456");

      expect(result.success).toBe(false);
      expect(result.status).toBe("REPEAT");
    });
  });
});
```

#### Update Existing Test Mocks

**Orders Service:** `src/test/domain/v1/services/orders.email.service.test.ts`

```typescript
// Add InfoTxt mock
jest.mock("../../../utils/infotxt", () => ({
  sendInfoTxtSMS: jest.fn().mockResolvedValue({
    success: true,
    smsid: "mock_sms_id",
  }),
}));

// Update tests to handle both MessageBird and InfoTxt
describe("Order SMS Notifications", () => {
  it("should send SMS via InfoTxt when feature flag is enabled", async () => {
    process.env.USE_INFOTXT = "true";
    // ... test implementation
  });

  it("should send SMS via MessageBird when feature flag is disabled", async () => {
    process.env.USE_INFOTXT = "false";
    // ... test implementation
  });
});
```

**Payment Integration API:** Update all three test files similarly

```typescript
// Mock both platforms
jest.mock("../withdraw/otp/platforms/infotxt");
jest.mock("../withdraw/otp/platforms/messagebird");
jest.mock("../withdraw/sms/infotxt");
jest.mock("../withdraw/sms/messagebird");
```

### 3.5 Integration Tests

#### Test Script: `scripts/test-infotxt-integration.ts`

```typescript
import {
  sendInfoTxtSMS,
  sendInfoTxtBulkSMS,
  generateInfoTxtOTP,
  verifyInfoTxtOTP,
  checkInfoTxtSMSStatus,
  formatMobileNumber,
} from "../src/utils/infotxt";

/**
 * Integration test script for InfoTxt API
 * Run with: ts-node scripts/test-infotxt-integration.ts
 */
async function runIntegrationTests() {
  console.log("🧪 Starting InfoTxt Integration Tests...\n");

  // Test 1: Mobile number formatting
  console.log("Test 1: Mobile Number Formatting");
  const testNumbers = [
    "+639171234567",
    "639171234567",
    "09171234567",
    "9171234567",
  ];
  testNumbers.forEach((num) => {
    console.log(`  ${num} → ${formatMobileNumber(num)}`);
  });
  console.log("✅ Formatting test complete\n");

  // Test 2: Send single SMS
  console.log("Test 2: Send Single SMS");
  const smsResult = await sendInfoTxtSMS(
    process.env.TEST_MOBILE_NUMBER || "09171234567",
    "Test message from Prosperna integration test"
  );
  console.log("  Result:", smsResult);
  console.log(smsResult.success ? "✅ SMS sent" : "❌ SMS failed", "\n");

  if (smsResult.success && smsResult.smsid) {
    // Test 3: Check SMS status
    console.log("Test 3: Check SMS Status");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    const statusResult = await checkInfoTxtSMSStatus(smsResult.smsid);
    console.log("  Status:", statusResult);
    console.log("✅ Status check complete\n");
  }

  // Test 4: Send bulk SMS
  console.log("Test 4: Send Bulk SMS");
  const bulkResult = await sendInfoTxtBulkSMS(
    [
      process.env.TEST_MOBILE_NUMBER || "09171234567",
      process.env.TEST_MOBILE_NUMBER_2 || "09181234567",
    ],
    "Bulk test message from Prosperna"
  );
  console.log("  Result:", bulkResult);
  console.log(
    bulkResult.success ? "✅ Bulk SMS sent" : "❌ Bulk SMS failed",
    "\n"
  );

  // Test 5: Generate OTP
  console.log("Test 5: Generate OTP");
  const otpResult = await generateInfoTxtOTP(
    process.env.TEST_MOBILE_NUMBER || "09171234567"
  );
  console.log("  Result:", otpResult);
  console.log(otpResult.success ? "✅ OTP generated" : "❌ OTP failed", "\n");

  if (otpResult.success && otpResult.otpid) {
    // Test 6: Verify OTP (will fail as we don't have the actual code)
    console.log("Test 6: Verify OTP");
    console.log("  ⚠️  Manual verification required");
    console.log(`  OTP ID: ${otpResult.otpid}`);
    console.log("  Please check your SMS and verify manually\n");

    // Example verification (will fail with wrong code)
    const verifyResult = await verifyInfoTxtOTP(otpResult.otpid, "999999");
    console.log("  Test with wrong code:", verifyResult);
    console.log("  Expected: status should be INVALID\n");
  }

  console.log("🎉 Integration tests complete!\n");
}

// Run tests
runIntegrationTests()
  .then(() => {
    console.log("All tests executed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
```

**Run integration tests:**

```bash
# Set environment variables
export INFOTXT_API_URL=https://api.myinfotxt.com
export INFOTXT_USER_ID=your_user_id
export INFOTXT_API_KEY=your_api_key
export TEST_MOBILE_NUMBER=09171234567

# Run tests
npm run test:integration:infotxt
# or
ts-node scripts/test-infotxt-integration.ts
```

---

## 4. Testing Strategy

### 4.1 Test Plan Overview

**Testing Phases:**

1. Unit Testing - Test individual functions
2. Integration Testing - Test InfoTxt API endpoints
3. Service-Level Testing - Test each microservice
4. End-to-End Testing - Test complete user flows
5. Load Testing - Verify performance under load
6. Regression Testing - Ensure no broken functionality

### 4.2 Test Cases by Flow

#### Test Cases: Order Status Notifications (Orders Service)

**Test Case 1: Single Order SMS Notification**

- [ ] **Setup:** Create test order with valid Philippine mobile number
- [ ] **Action:** Update order status to "Shipped"
- [ ] **Expected:** SMS sent successfully via InfoTxt
- [ ] **Verify:** Check logs for smsid, verify mobile number format conversion
- [ ] **Success Criteria:** SMS delivered, customer receives notification

**Test Case 2: Mobile Number Format Handling**

- [ ] **Test Data:**
  - International format: +639171234567
  - Local with country code: 639171234567
  - Standard format: 09171234567
  - Without leading zero: 9171234567
- [ ] **Action:** Send SMS to each format
- [ ] **Expected:** All formats converted to 09xxxxxxxxx successfully
- [ ] **Verify:** Check formatMobileNumber function output

**Test Case 3: Invalid Mobile Number**

- [ ] **Setup:** Order with invalid mobile number
- [ ] **Action:** Attempt to send SMS
- [ ] **Expected:** Error handled gracefully, status code '01' returned
- [ ] **Verify:** Error logged, order processing continues without crash

**Test Case 4: API Failure Handling**

- [ ] **Setup:** Temporarily invalid API credentials
- [ ] **Action:** Attempt to send order notification
- [ ] **Expected:** Error caught, logged, order still processed
- [ ] **Verify:** Fallback mechanism works (if implemented)

**Test Case 5: Feature Flag Toggle**

- [ ] **Setup:** Set USE_INFOTXT=false
- [ ] **Action:** Send order notification
- [ ] **Expected:** MessageBird used instead of InfoTxt
- [ ] **Verify:** MessageBird API called, not InfoTxt

**Test Case 6: All Order Status Transitions**

Test SMS for each status:

- [ ] Open → Accepted
- [ ] Accepted → Processing
- [ ] Processing → Ready for Pickup
- [ ] Processing → Shipped
- [ ] Shipped → Out for delivery
- [ ] Out for delivery → Completed
- [ ] Any status → Delivery Cancelled
- [ ] Any status → Returned
- [ ] Any status → Declined

**Test Case 7: Bulk Order Processing**

- [ ] **Setup:** Process 10 orders simultaneously
- [ ] **Action:** Update all to "Shipped" status
- [ ] **Expected:** All 10 SMS sent successfully
- [ ] **Verify:** No rate limiting issues, all smsids returned

#### Test Cases: OTP Generation (Payment Integration & User Service)

**Test Case 8: Generate OTP for Withdrawal**

- [ ] **Setup:** Merchant initiates withdrawal request
- [ ] **Action:** Call OTP generation endpoint
- [ ] **Expected:** OTP sent via InfoTxt, otpid stored in database
- [ ] **Verify:** Database updated with otpid, SMS received by merchant

**Test Case 9: OTP Verification - Valid Code**

- [ ] **Setup:** Generate OTP, retrieve actual code from test phone
- [ ] **Action:** Submit correct OTP code
- [ ] **Expected:** Verification returns otpstatus='VALID', withdrawal proceeds
- [ ] **Verify:** Database updated, withdrawal processed

**Test Case 10: OTP Verification - Invalid Code**

- [ ] **Setup:** Generate OTP
- [ ] **Action:** Submit incorrect code (e.g., 999999)
- [ ] **Expected:** Verification returns otpstatus='INVALID'
- [ ] **Verify:** Withdrawal not processed, error message shown to merchant

**Test Case 11: OTP Verification - Expired Code**

- [ ] **Setup:** Generate OTP
- [ ] **Action:** Wait for expiration period (10+ minutes), then submit code
- [ ] **Expected:** Verification returns otpstatus='EXPIRED'
- [ ] **Verify:** Appropriate error message, prompt to request new OTP

**Test Case 12: OTP Verification - Repeated Use**

- [ ] **Setup:** Generate OTP, verify successfully once
- [ ] **Action:** Attempt to use same OTP code again
- [ ] **Expected:** Verification returns otpstatus='REPEAT'
- [ ] **Verify:** Second verification rejected, appropriate error message

**Test Case 13: Merchant Phone Verification**

- [ ] **Setup:** New merchant registration
- [ ] **Action:** Request phone verification OTP
- [ ] **Expected:** OTP sent via InfoTxt
- [ ] **Verify:** Merchant receives SMS, can verify and complete registration

**Test Case 14: Multiple OTP Requests**

- [ ] **Setup:** Merchant requests OTP
- [ ] **Action:** Request new OTP before first expires
- [ ] **Expected:** New OTP generated, old one invalidated
- [ ] **Verify:** Only latest OTP works

#### Test Cases: SMS Notifications (Payment Integration)

**Test Case 15: Withdrawal Success Notification**

- [ ] **Setup:** Complete withdrawal request
- [ ] **Action:** System sends success notification
- [ ] **Expected:** SMS sent via InfoTxt to merchant
- [ ] **Verify:** Merchant receives notification with transaction details

**Test Case 16: Bulk Withdrawal Notifications**

- [ ] **Setup:** Multiple merchants with approved withdrawals
- [ ] **Action:** Send notifications to all
- [ ] **Expected:** Bulk SMS endpoint used, all notifications sent
- [ ] **Verify:** All merchants receive SMS, efficient API usage

**Test Case 17: Withdrawal Failure Notification**

- [ ] **Setup:** Withdrawal request fails
- [ ] **Action:** System sends failure notification
- [ ] **Expected:** SMS sent explaining failure reason
- [ ] **Verify:** Merchant informed of issue

### 4.3 Error Handling Test Cases

**Test Case 18: Network Timeout**

- [ ] **Setup:** Simulate slow network
- [ ] **Action:** Attempt SMS/OTP operation
- [ ] **Expected:** Timeout handled gracefully
- [ ] **Verify:** Appropriate error message, retry logic works

**Test Case 19: Invalid API Credentials**

- [ ] **Setup:** Use wrong UserID or ApiKey
- [ ] **Action:** Attempt any InfoTxt operation
- [ ] **Expected:** Status '05' or '06' returned, error handled
- [ ] **Verify:** Clear error message logged

**Test Case 20: Empty Message Body**

- [ ] **Setup:** Attempt to send SMS with empty message
- [ ] **Action:** Call sendInfoTxtSMS with empty string
- [ ] **Expected:** Status '02' returned, validation prevents send
- [ ] **Verify:** Error caught before API call

**Test Case 21: API Rate Limiting**

- [ ] **Setup:** Send high volume of requests rapidly
- [ ] **Action:** Monitor API responses
- [ ] **Expected:** Rate limits respected (if any)
- [ ] **Verify:** No API account suspension, queuing works

### 4.4 Load Testing Scenarios

**Scenario 1: Peak Order Volume**

- [ ] **Load:** 100 orders per minute updating status
- [ ] **Duration:** 15 minutes
- [ ] **Expected:** All SMS sent successfully, no degradation
- [ ] **Metrics:** Track success rate, latency, error rate

**Scenario 2: Concurrent OTP Requests**

- [ ] **Load:** 50 simultaneous OTP generation requests
- [ ] **Duration:** 5 minutes
- [ ] **Expected:** All OTPs generated and sent
- [ ] **Metrics:** Track response time, queue depth

**Scenario 3: Bulk Withdrawal Processing**

- [ ] **Load:** 200 withdrawal notifications sent at once
- [ ] **Duration:** Single batch
- [ ] **Expected:** Bulk SMS endpoint handles efficiently
- [ ] **Metrics:** Track total time, success rate

### 4.5 Rollback Test Cases

**Test Case 22: Feature Flag Disable**

- [ ] **Setup:** InfoTxt active in production
- [ ] **Action:** Set USE_INFOTXT=false
- [ ] **Expected:** System immediately switches to MessageBird
- [ ] **Verify:** No downtime, SMS continue working

**Test Case 23: Gradual Rollback**

- [ ] **Setup:** InfoTxt at 100% rollout
- [ ] **Action:** Reduce INFOTXT_ROLLOUT_PERCENTAGE from 100 → 50 → 0
- [ ] **Expected:** Traffic gradually shifts back to MessageBird
- [ ] **Verify:** No messages lost during transition

### 4.6 Monitoring and Logging Tests

**Test Case 24: Success Logging**

- [ ] **Action:** Send successful SMS via InfoTxt
- [ ] **Expected:** Log entry with smsid, mobile number (masked), timestamp
- [ ] **Verify:** Logs searchable and useful for debugging

**Test Case 25: Error Logging**

- [ ] **Action:** Trigger various error conditions
- [ ] **Expected:** Detailed error logs with status codes, error messages
- [ ] **Verify:** Logs include enough context for troubleshooting

**Test Case 26: Metrics Collection**

- [ ] **Setup:** Configure monitoring dashboard
- [ ] **Action:** Send various SMS/OTP requests
- [ ] **Expected:** Metrics updated in real-time
- [ ] **Verify:** Track success rate, error rate, latency

### 4.7 Test Execution Checklist

**Pre-Testing:**

- [ ] All test environments set up (dev, staging)
- [ ] Test data prepared (valid/invalid phone numbers)
- [ ] Test accounts created
- [ ] InfoTxt API credentials configured
- [ ] Monitoring tools ready

**During Testing:**

- [ ] Execute unit tests: `npm test`
- [ ] Execute integration tests: `npm run test:integration`
- [ ] Execute manual test cases (use checklist above)
- [ ] Monitor logs for errors
- [ ] Track metrics in dashboard
- [ ] Document any issues found

**Post-Testing:**

- [ ] All test cases passed or issues documented
- [ ] Test report generated
- [ ] Issues triaged and prioritized
- [ ] Fixes implemented and re-tested
- [ ] Sign-off from QA team

### 4.8 Success Criteria

**Must Pass:**

- [ ] 100% of unit tests pass
- [ ] 100% of critical path test cases pass (order notifications, OTP flows)
- [ ] 95%+ success rate in integration tests
- [ ] Zero data loss during migration
- [ ] Feature flag toggle works reliably
- [ ] Rollback procedure verified

**Performance Targets:**

- [ ] SMS delivery time < 10 seconds (90th percentile)
- [ ] OTP generation time < 5 seconds
- [ ] API error rate < 2%
- [ ] System handles peak load without degradation

---

## 5. Deployment Plan

### 5.1 Phased Rollout Strategy

#### Phase 1: Development Environment (Week 1)

**Goal:** Validate InfoTxt integration in dev

- [ ] Deploy InfoTxt code with feature flag `USE_INFOTXT=false`
- [ ] Test InfoTxt manually with `USE_INFOTXT=true` in dev
- [ ] Verify all SMS flows work correctly
- [ ] Fix any issues found

**Success Criteria:**

- All test cases pass
- Manual testing successful
- No critical errors in logs

#### Phase 2: Staging Environment (Week 2)

**Goal:** Test in production-like environment

- [ ] Deploy to staging with `USE_INFOTXT=false`
- [ ] Enable for 10% of traffic using feature flag logic
- [ ] Monitor metrics for 48 hours
- [ ] Gradually increase to 50%, then 100%
- [ ] Compare InfoTxt vs MessageBird metrics

**Feature Flag Logic Example:**

```typescript
const shouldUseInfoTxt = (): boolean => {
  if (process.env.USE_INFOTXT === "true") {
    return true;
  }

  // Percentage-based rollout
  const rolloutPercentage = parseInt(
    process.env.INFOTXT_ROLLOUT_PERCENTAGE || "0"
  );
  const random = Math.random() * 100;
  return random < rolloutPercentage;
};
```

**Success Criteria:**

- Success rate ≥ 95%
- Error rate < 2%
- No increase in customer complaints
- Delivery time acceptable

#### Phase 3: Production - Canary Deployment (Week 3)

**Goal:** Gradual production rollout

**Day 1-2: 5% Traffic**

- [ ] Deploy to production with `USE_INFOTXT=false`
- [ ] Enable for 5% of SMS sends
- [ ] Monitor closely for 24 hours

**Day 3-4: 25% Traffic**

- [ ] Increase to 25% if metrics are good
- [ ] Monitor for 24 hours

**Day 5-6: 50% Traffic**

- [ ] Increase to 50%
- [ ] Monitor for 24 hours

**Day 7: 100% Traffic**

- [ ] Enable for all traffic
- [ ] Keep MessageBird as fallback for 1 week

**Success Criteria:**

- Success rate ≥ 98%
- No increase in support tickets
- All critical flows working

#### Phase 4: Full Migration (Week 4)

**Goal:** Complete migration and cleanup

- [ ] Remove MessageBird code (or keep as fallback)
- [ ] Remove feature flags
- [ ] Update documentation
- [ ] Archive MessageBird credentials
- [ ] Update monitoring dashboards

### 5.2 Environment-Specific Deployment Order

#### Development → Staging → Production

**Deployment Checklist:**

**Development:**

- [ ] Deploy InfoTxt code
- [ ] Set `USE_INFOTXT=true` in `.env.development`
- [ ] Test all flows manually
- [ ] Run automated tests
- [ ] Code review approval

**Staging:**

- [ ] Deploy from development branch
- [ ] Set `USE_INFOTXT=true` in `.env.staging`
- [ ] Run smoke tests
- [ ] Monitor for 24-48 hours
- [ ] Get stakeholder approval

**Production:**

- [ ] Create release branch
- [ ] Deploy during low-traffic window
- [ ] Start with feature flag disabled
- [ ] Enable gradually (5% → 25% → 50% → 100%)
- [ ] Monitor closely for first 72 hours

### 5.3 Deployment Scripts

**Example Deployment Script:**

```bash
#!/bin/bash
# deploy-infotxt.sh

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy-infotxt.sh [dev|staging|prod]"
  exit 1
fi

echo "Deploying InfoTxt migration to $ENVIRONMENT..."

# Build
npm run build

# Run tests
npm test

# Deploy (adjust based on your deployment method)
if [ "$ENVIRONMENT" == "prod" ]; then
  echo "⚠️  Production deployment - enabling gradual rollout"
  # Set initial rollout percentage
  export INFOTXT_ROLLOUT_PERCENTAGE=5
else
  export USE_INFOTXT=true
fi

# Deploy commands (adjust based on your setup)
# pm2 restart orders-service-api
# pm2 restart payment-integration-api
# pm2 restart user-service-api

echo "Deployment complete. Monitor logs for issues."
```

### 5.4 Communication Plan

**Stakeholder Communication:**

- [ ] Notify team 1 week before deployment
- [ ] Schedule deployment during low-traffic hours
- [ ] Prepare rollback plan communication
- [ ] Set up war room for deployment day
- [ ] Post-deployment status update

**Customer Communication (if needed):**

- [ ] Monitor for customer complaints
- [ ] Prepare FAQ if issues arise
- [ ] No customer-facing changes expected

---

## 6. Additional Considerations

### 6.1 Cost Analysis

**Before Migration:**

- [ ] Document current MessageBird costs
- [ ] Get InfoTxt pricing information
- [ ] Calculate expected cost difference
- [ ] Get budget approval if needed

### 6.2 Compliance and Security

- [ ] Verify InfoTxt compliance with data protection regulations
- [ ] Review InfoTxt security practices
- [ ] Update privacy policy if needed
- [ ] Ensure OTP storage is secure (InfoTxt handles internally)
- [ ] Review rate limiting to prevent abuse

### 6.3 Documentation Updates

**Update the following:**

- [ ] API documentation
- [ ] Developer guides
- [ ] Runbooks for operations team
- [ ] Architecture diagrams
- [ ] Incident response procedures

### 6.4 Training

**Team Training:**

- [ ] InfoTxt API overview session
- [ ] New error codes and handling
- [ ] Monitoring and alerting setup
- [ ] Troubleshooting guide
- [ ] Rollback procedures

---

## 7. Critical Notes and Key Differences

> **✅ CORRECTED:** InfoTxt provides built-in OTP management
>
> **InfoTxt Approach:** InfoTxt generates, stores, and manages OTPs server-side (similar to MessageBird)
> **Implementation:** Use `/v2/otp-send.php` and `/v2/otp-check.php` endpoints
> **No Custom Storage Needed:** InfoTxt handles OTP storage internally - no Redis required

> **⚠️ CRITICAL:** API authentication is completely different
>
> **MessageBird:** Uses `Authorization: AccessKey` header
> **InfoTxt:** Uses query parameters `UserID` and `ApiKey` > **Impact:** All API calls must be updated to use query parameter authentication

> **⚠️ CRITICAL:** Mobile number format requirements
>
> **MessageBird:** Accepts international format (+639...)
> **InfoTxt:** Requires Philippine format (09...)
> **Impact:** Must implement formatMobileNumber() for all mobile numbers

> **⚠️ CRITICAL:** No custom sender ID support
>
> **MessageBird:** Supports custom originator (e.g., "Prosperna")
> **InfoTxt:** Uses dedicated SIM number `0917.587.2020` as sender
> **Impact:** Remove originator parameter, customers will see phone number instead of brand name

> **⚠️ CRITICAL:** OTP verification has 4 statuses instead of 2
>
> **MessageBird:** Returns `verified` or `failed` > **InfoTxt:** Returns `VALID`, `INVALID`, `EXPIRED`, or `REPEAT` > **Impact:** Update verification logic to handle all 4 statuses appropriately

> **⚠️ CRITICAL:** Response structure is completely different
>
> **MessageBird:** Standard HTTP status codes with error objects
> **InfoTxt:** Always returns 200 OK with status field (`00`=success, `01-07`=error codes)
> **Impact:** Update all response parsing logic to check status field

> **⚠️ NOTE:** InfoTxt uses GET or POST for all endpoints
>
> **Recommended:** Use GET with query parameters for consistency and simplicity
> **Alternative:** POST is also supported if preferred

> **💡 NEW CAPABILITY:** Bulk SMS support
>
> **InfoTxt Feature:** `/v2/send-bulk.php` endpoint for multiple recipients
> **Benefit:** More efficient than multiple single SMS calls
> **Recommendation:** Use for withdrawal notifications and bulk operations

> **💡 NEW CAPABILITY:** SMS status checking
>
> **InfoTxt Feature:** `/v2/status.php` endpoint to check delivery status
> **Benefit:** Can verify message delivery without webhooks
> **Use Case:** Troubleshooting failed deliveries

---

## 8. Checklist Summary

### Pre-Implementation

- [ ] Review InfoTxt API documentation thoroughly
- [ ] Obtain API credentials (UserID and ApiKey)
- [ ] Test API endpoints manually using Postman/curl
- [ ] Verify dedicated SIM number functionality
- [ ] Create feature flag configuration
- [ ] Backup current configuration
- [ ] Set up monitoring for InfoTxt metrics

### Implementation

- [ ] Create InfoTxt utility modules (`src/utils/infotxt.ts`)
- [ ] Implement mobile number formatting function
- [ ] Update Orders Service SMS sending
- [ ] Update Payment Integration OTP platform
- [ ] Update Payment Integration SMS platform
- [ ] Update User Service OTP implementation
- [ ] Update environment variables for all environments
- [ ] Remove/update MessageBird dependencies
- [ ] Write unit tests for all new functions
- [ ] Write integration tests
- [ ] Update documentation

### Testing

- [ ] Run all unit test suites
- [ ] Execute integration tests
- [ ] Manual testing in dev environment
- [ ] Test all order status notification flows
- [ ] Test OTP generation and verification
- [ ] Test all 4 OTP status values (VALID, INVALID, EXPIRED, REPEAT)
- [ ] Test mobile number format conversion
- [ ] Test error handling for all error codes
- [ ] Load testing for peak volumes
- [ ] Security review
- [ ] Feature flag toggle testing

### Deployment

- [ ] Deploy to development environment
- [ ] Deploy to staging with gradual rollout (0% → 10% → 50% → 100%)
- [ ] Monitor staging for 48 hours
- [ ] Get stakeholder approval
- [ ] Deploy to production with canary deployment (5% → 25% → 50% → 100%)
- [ ] Monitor production metrics closely
- [ ] Complete full migration
- [ ] Clean up old MessageBird code (optional)
- [ ] Remove feature flags (optional)
- [ ] Update all documentation

---

## 9. Support and Resources

### InfoTxt Resources

- **API Base URL:** https://api.myinfotxt.com
- **API Documentation:** Infotxt Cloud APIv2.4 Guide
- **Inbox API Documentation:** Infotxt Cloud Inbox API
- **Product Information:** InfoTxt Product Brief
- **FAQ:** https://api.myinfotxt.com/faq
- **Pancake Guide:** https://api.myinfotxt.com/pancake
- **Support Contact:** [To be confirmed with InfoTxt team]

### API Endpoints Quick Reference

| Endpoint            | Purpose               | Method     | Key Parameters                                   |
| ------------------- | --------------------- | ---------- | ------------------------------------------------ |
| `/v2/send.php`      | Send single SMS       | GET / POST | UserID, ApiKey, Mobile, SMS, Priority (optional) |
| `/v2/send-bulk.php` | Send bulk SMS         | GET / POST | UserID, ApiKey, Mobile (comma-separated), SMS    |
| `/v2/status.php`    | Check SMS status      | GET / POST | smsid                                            |
| `/v2/otp-send.php`  | Generate and send OTP | GET / POST | UserID, ApiKey, Mobile                           |
| `/v2/otp-check.php` | Verify OTP code       | GET / POST | UserID, ApiKey, OTPID, OTP                       |

### Internal Resources

- **Migration Guide:** This document
- **Code Repositories:**
  - `orders-service-api`
  - `payment-integration-api`
  - `user-service-api`
- **Monitoring Dashboard:** [Dashboard URL to be configured]
- **Incident Response:** [Runbook URL to be configured]
- **Team Contacts:**
  - Backend Lead: [Name]
  - DevOps Lead: [Name]
  - QA Lead: [Name]

### Troubleshooting Guide

**Common Issues and Solutions:**

1. **"Invalid mobile number" error (status: 01)**

   - **Cause:** Mobile number not in 09xxXXXxxxx format
   - **Solution:** Verify formatMobileNumber() is being called

2. **"Invalid ApiKey" error (status: 06)**

   - **Cause:** Wrong API credentials or environment variable not set
   - **Solution:** Check INFOTXT_API_KEY in environment variables

3. **OTP status returns "EXPIRED"**

   - **Cause:** User took too long to enter OTP (>10 minutes typically)
   - **Solution:** Prompt user to request a new OTP

4. **OTP status returns "REPEAT"**

   - **Cause:** Same OTP code used multiple times
   - **Solution:** Generate new OTP for additional verification attempts

5. **SMS not received**
   - **Cause:** Various (network issues, invalid number, etc.)
   - **Solution:** Check status using `/v2/status.php` with smsid

---

## 10. Migration Completion Criteria

**The migration is considered complete when:**

- [ ] All three services (Orders, Payment Integration, User Service) use InfoTxt
- [ ] All test cases pass with 95%+ success rate
- [ ] Production runs at 100% InfoTxt for 1 week without issues
- [ ] No increase in customer support tickets related to SMS
- [ ] Monitoring dashboards updated and showing healthy metrics
- [ ] Documentation fully updated
- [ ] Team trained on InfoTxt operations
- [ ] MessageBird code removed or archived (if decided)
- [ ] Cost savings verified and reported
- [ ] Post-migration review completed

---

## 11. Rollback Plan

**If issues occur during migration:**

### Immediate Rollback (< 5 minutes)

1. Set `USE_INFOTXT=false` in environment variables
2. Restart affected services
3. Verify MessageBird functionality restored
4. Monitor for normal operation

### Gradual Rollback

1. Reduce `INFOTXT_ROLLOUT_PERCENTAGE` from current value to 0 in steps
2. Monitor at each step (e.g., 100% → 50% → 25% → 10% → 0%)
3. Verify message delivery continues without issues
4. Keep InfoTxt code in place for future retry

### Rollback Triggers

**Immediate rollback if:**

- Error rate > 5%
- Complete API failure
- Critical bug discovered
- Data integrity issues

**Gradual rollback if:**

- Error rate between 2-5%
- Performance degradation
- Increased customer complaints
- Intermittent issues

---

**Document Version:** 2.0
**Last Updated:** December 02, 2025  
**Author:** Business Analyst  
**Review Status:** Corrected based on InfoTxt API v2.4 documentation  
**Critical Changes:** Authentication method, OTP implementation, mobile number formatting, response structure, error handling

---

## Appendix A: InfoTxt Error Codes Reference

| Status Code | Error Message         | Description                             | Resolution                                  |
| ----------- | --------------------- | --------------------------------------- | ------------------------------------------- |
| 00          | Success               | Operation completed successfully        | N/A                                         |
| 01          | Invalid mobile number | Mobile number format is incorrect       | Use formatMobileNumber() function           |
| 02          | Empty SMS body        | Message content is missing              | Validate message before sending             |
| 03          | Empty UserID          | UserID parameter not provided           | Check INFOTXT_USER_ID environment variable  |
| 04          | Empty Hash (ApiKey)   | ApiKey parameter not provided           | Check INFOTXT_API_KEY environment variable  |
| 05          | UserID not found      | UserID does not exist in InfoTxt system | Verify credentials with InfoTxt             |
| 06          | Invalid Hash (ApiKey) | ApiKey is incorrect                     | Verify API key, check for typos             |
| 07          | UserID expired        | Account has expired                     | Contact InfoTxt to renew account            |
| 08          | Empty OTPID           | OTPID parameter missing in verification | Ensure otpid is stored and passed correctly |
| 09          | Empty OTP             | OTP code not provided for verification  | Validate user input before API call         |

---

## Appendix B: Comparison of Key Differences

| Aspect               | MessageBird                            | InfoTxt                                           | Migration Action Required                      |
| -------------------- | -------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| **Base URL**         | https://rest.messagebird.com           | https://api.myinfotxt.com                         | Update INFOTXT_API_URL                         |
| **Authentication**   | Header: Authorization: AccessKey {key} | Query params: UserID={id}&ApiKey={key}            | Rewrite all API calls                          |
| **SMS Endpoint**     | POST /messages                         | GET/POST /v2/send.php                             | Update endpoint and method                     |
| **OTP Generation**   | POST /verify                           | GET/POST /v2/otp-send.php                         | Update endpoint                                |
| **OTP Verification** | GET /verify/{id}?token={token}         | GET/POST /v2/otp-check.php                        | Update endpoint and parameter names            |
| **Mobile Format**    | +639xxxxxxxxx                          | 09xxxxxxxxx                                       | Implement formatMobileNumber()                 |
| **Sender ID**        | Custom (e.g., "Prosperna")             | Fixed SIM: 0917.587.2020                          | Remove originator parameter                    |
| **OTP Storage**      | MessageBird server-side                | InfoTxt server-side                               | No custom storage needed (same as MessageBird) |
| **OTP Verification** | Returns: status (verified/failed)      | Returns: otpstatus (VALID/INVALID/EXPIRED/REPEAT) | Handle 4 statuses instead of 2                 |
| **Success Response** | HTTP 200 with id field                 | HTTP 200 with status="00" and smsid               | Parse status field first                       |
| **Error Response**   | HTTP 4xx/5xx with error object         | HTTP 200 with status="01-09" and error field      | Check status field in all responses            |
| **Bulk SMS**         | Multiple POST calls                    | Single call to /v2/send-bulk.php                  | Optional: Use bulk endpoint for efficiency     |
| **Status Checking**  | Via webhooks or GET /messages/{id}     | GET/POST /v2/status.php                           | Optional: Implement status checking            |
| **Priority**         | Not supported                          | Optional Priority parameter (0/1/2)               | Optional: Add priority for urgent messages     |

---

## Appendix C: Testing Phone Numbers

**For testing purposes, use the following guidelines:**

**Valid Test Numbers:**

- Format: 09xxxxxxxxx
- Example: 09171234567
- Ensure SIM is active and can receive SMS

**Test Data for Development:**

```typescript
const TEST_NUMBERS = {
  valid: "09171234567",
  validInternational: "+639171234567",
  validWithCountryCode: "639171234567",
  validWithoutZero: "9171234567",
  invalid: "invalid_number",
  tooShort: "091234567",
  tooLong: "091712345678",
};
```

**Environment Variables for Testing:**

```env
# .env.test
TEST_MOBILE_NUMBER=09171234567
TEST_MOBILE_NUMBER_2=09181234567
TEST_MOBILE_NUMBER_INVALID=invalid
```

---

**End of Migration Guide**
