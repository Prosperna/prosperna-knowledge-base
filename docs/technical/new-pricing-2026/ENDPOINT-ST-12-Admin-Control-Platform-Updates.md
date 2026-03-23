---
id: st-12-admin-control-platform-updates
title: Endpoint Document. ST-12 Admin Control Platform Updates
sidebar_label: ST-12 Admin Control Platform Updates
sidebar_position: 12
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Linked Documents
- BRD: BRD-ST-12-Admin-Control-Platform-Updates.md
- PRD: PRD-ST-12-Admin-Control-Platform-Updates.md

---

## Public API Overview

This document covers all API endpoints required to support the Admin Control Platform Updates defined in ST-12. It includes:

1. **New override tool endpoints** — four new endpoints for Extend Trial, Reactivate Suspended Account, Reset Usage Limits, and Apply Promo Code (updated existing endpoint).
2. **New unified reporting endpoints** — unified invoice list and unified transaction list aggregating Stripe and Xendit data.
3. **Updated existing endpoints** — rewards/promo endpoints and invoice endpoint that require support for new plan tier names and Payment Gateway fields.

All endpoints are internal-facing admin APIs. They are not exposed to merchants or end-customers.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Admin Control Platform frontend (`prosperna1`, `/admin/` routes) | Consuming all endpoints to power admin screens |
| Internal backend services | `business-profile-api`, `payment-integration-api`, `admin-service-api`, `orders-service-api` as implementors |
| Finance team (indirect) | CSV exports via Admin Transactions and Account Invoices UI |
| Support team (indirect) | Override tool actions via Accounts List UI |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `http://localhost:{port}` | Local development | Port varies per service |
| Staging | `https://api-staging.prosperna.com` | Pre-production testing | Mirrors production services |
| Production | `https://api.prosperna.com` | Live environment | All admin routes behind admin auth |

---

## API Versioning and Compatibility

- All new endpoints follow the `/v1/` prefix convention used by existing Prosperna backend services.
- Existing endpoints are updated in-place (backward-compatible changes only: new optional fields, new accepted enum values).
- Breaking changes to existing contracts require a new version prefix (none required for ST-12).
- Old plan tier values (`FREE`, `PLUS`, `PRO`, `PREMIUM`) continue to be returned by read endpoints for historical records. New write endpoints do not accept old values for new records.

---

## Protocol and Data Format Standards

- **Protocol:** HTTPS, RESTful JSON over HTTP/1.1
- **Request Content-Type:** `application/json`
- **Response Content-Type:** `application/json`
- **Date/Time format:** ISO 8601 (`2026-03-23T10:00:00.000Z`)
- **Currency amounts:** Decimal string with 2 decimal places (e.g., `"29.00"`) with a `currency` field (`"USD"` or `"PHP"`)
- **Pagination:** Cursor-based or offset-based, consistent with existing Prosperna API patterns
- **Enveloped responses:** All list responses wrapped in `{ "data": [...], "meta": { "total": N, "page": N, "pageSize": N } }`

---

## Authentication and Authorization

- All admin endpoints require a valid **admin session token** issued by the Prosperna admin authentication service.
- Token is passed via `Authorization: Bearer <token>` header.
- **CASL-based permission checks** are enforced server-side on every admin endpoint.
- The frontend enforces permission-based UI gating additionally, but server-side enforcement is authoritative.
- Admin tokens expire per the platform's session policy. Expired tokens receive `401 Unauthorized`.

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| `Admin` (any authenticated admin) | GET all list/detail endpoints; POST Apply Promo Code | Cannot use Bypass Payment on Reactivate |
| `merchants.extend_trial` | POST Extend Trial | Required CASL permission |
| `merchants.reactivate` | POST Reactivate Account | Required CASL permission |
| `merchants.reset_usage` | POST Reset Usage Limits | Required CASL permission |
| `merchants.bypass_payment` | Use `bypass_payment: true` on Reactivate | **Super Admin only**; server-side enforced |
| `rewards.assign` | POST Apply Promo Code | Existing permission; may require update |
| `Super Admin` | All operations including Bypass Payment | Unrestricted access to all override tools |

---

## Ownership and Data Access Rules

- Admin endpoints are scoped globally — admins can act on any merchant's data.
- Merchant-level data access is not further restricted by region or team within the admin context.
- The `bypass_payment` permission is not assignable to individual admin users directly — it is exclusively tied to the Super Admin role.

---

## Request Conventions

- `Content-Type: application/json` is required on all POST requests.
- `Authorization: Bearer <admin_token>` is required on all requests.
- Path parameters use camelCase IDs matching the existing Prosperna routing convention (e.g., `:merchantId`, `:id`).
- Query parameters use camelCase (e.g., `paymentGateway`, `planType`, `currency`).
- Boolean fields in request bodies use lowercase `true`/`false`.

---

## Response Conventions

- **200 OK** — Successful read or list operation.
- **201 Created** — Successful resource creation (not applicable for override tools; they return 200).
- **200 OK** — Successful override action execution (consistent with existing Prosperna API style for action endpoints).
- **400 Bad Request** — Validation failure (missing required fields, invalid enum values, insufficient reason length).
- **401 Unauthorized** — Missing or expired admin token.
- **403 Forbidden** — Admin lacks required CASL permission for the operation.
- **404 Not Found** — Target merchant or resource does not exist.
- **409 Conflict** — Action is not valid for the merchant's current state (e.g., Extend Trial on non-TRIAL merchant).
- **500 Internal Server Error** — Unexpected server error.

---

## Global Guard Rails (Consumer Safety)

1. **Never call override endpoints without a non-empty `reason` string** (min 10 characters). Requests without it will be rejected with 400.
2. **Never send `bypass_payment: true`** unless the admin is confirmed to have `merchants.bypass_payment` permission. The server enforces this but the client should not attempt it for unauthorized users.
3. **Check merchant `payPlanType` before calling conditional override endpoints.** Extend Trial requires `TRIAL`; Reactivate requires `SUSPENDED`; Reset Usage requires `LAUNCH`/`GROW`/`SCALE`. Sending to a wrong-state merchant returns 409.
4. **Pagination:** Always include `page` and `pageSize` parameters on list endpoints. Do not attempt to fetch all records in a single request.
5. **Idempotency:** Override endpoints are not guaranteed idempotent. Avoid duplicate submissions; implement client-side loading state during API calls.
6. **Currency filter:** Always pass `currency` query parameter when fetching invoice/transaction lists to avoid mixed-currency result sets.
7. **Payment Gateway filter:** Use `paymentGateway` query parameter to scope unified list results when performing gateway-specific reconciliation.

---

## Rate Limits and Abuse Controls

- Override action endpoints (`extend-trial`, `reactivate`, `reset-usage`, apply promo): **30 requests per minute per admin user** to prevent accidental bulk submission.
- List endpoints (`/admin/invoices`, `/admin/transactions`): follow global platform rate limits.
- No additional rate limits are defined beyond the global platform defaults for ST-12.

---

## Global Error Model

Use this standard structure for all error responses:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "validation",
    "message": "Request validation failed.",
    "details": [
      {
        "field": "reason",
        "issue": "min_length",
        "expected": "10",
        "actual": "5"
      }
    ],
    "requestId": "req_01HZ5XKG3MFPV9A0B4N7YDQCR",
    "timestamp": "2026-03-23T10:00:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/admin-api/errors"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Service | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|---|
| `admin.extendTrial` | POST | `/v1/business-profile/admin/merchants/:merchantId/extend-trial` | business-profile-api | `merchants.extend_trial` | Extend a trial merchant's end date | override-actions | FR-19, FR-23 |
| `admin.reactivateAccount` | POST | `/v1/business-profile/admin/merchants/:merchantId/reactivate` | business-profile-api | `merchants.reactivate` | Reactivate a suspended merchant to a paid plan | override-actions | FR-20, FR-23, FR-24 |
| `admin.resetUsage` | POST | `/v1/orders/admin/merchants/:merchantId/reset-usage` | orders-service-api | `merchants.reset_usage` | Reset usage counters and enforcement state to normal | override-actions | FR-22, FR-23 |
| `admin.applyPromoCode` | POST | `/v1/admin/rewards/:rewardId/assign` | admin-service-api | `rewards.assign` | Assign a promo code to a merchant (updated: new tiers, audit log) | override-actions | FR-21, FR-23 |
| `admin.listInvoices` | GET | `/v1/payments/admin/invoices` | payment-integration-api | `admin` | Unified invoice list across Stripe and Xendit with filters | default | FR-5, FR-6, FR-7 |
| `admin.listTransactions` | GET | `/v1/payments/admin/transactions` | payment-integration-api | `admin` | Unified transaction list across Stripe and Xendit with filters | default | FR-8, FR-9, FR-10, FR-11 |
| `admin.getMerchantInvoices` | GET | `/v1/payments/admin/merchants/:merchantId/invoices` | payment-integration-api | `admin` | Invoice list for a specific merchant (updated: payment_gateway field) | default | FR-5, FR-6, FR-7 |
| `rewards.create` | POST | `/v1/admin/rewards` | admin-service-api | `admin` | Create a promo code (updated: new tier values accepted) | default | FR-15, FR-18 |
| `rewards.list` | GET | `/v1/admin/rewards` | admin-service-api | `admin` | List promo codes (existing; returns legacy + new tier values) | default | FR-16 |
| `rewards.merchantsList` | GET | `/v1/admin/rewards/merchants` | admin-service-api | `admin` | Merchant list for promo assignment panel (updated: new plan types) | default | FR-17 |

---

## Endpoint Reference

---

### 1. Extend Trial

**Operation ID:** `admin.extendTrial`
**Purpose:** Extends a trial merchant's trial end date by a specified number of days. Backend reschedules the trial expiry background job and drip email campaign. Writes an audit log entry.

**Method:** `POST`
**Path:** `/v1/business-profile/admin/merchants/:merchantId/extend-trial`
**Auth:** Bearer admin token + `merchants.extend_trial` CASL permission

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | path | string | Yes | Valid merchant ID | Target merchant's ID |

**Request Body:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `extensionDays` | integer | Yes | Min: 1 | Number of days to extend the trial |
| `reason` | string | Yes | Min length: 10 | Admin-provided reason for audit log |

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/business-profile/admin/merchants/merchant_01HZ/extend-trial \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "extensionDays": 14,
    "reason": "Merchant requested additional time for onboarding evaluation."
  }'
```

**Success Response (200 OK):**

```json
{
  "data": {
    "merchantId": "merchant_01HZ",
    "previousTrialEndDate": "2026-04-01T23:59:59.000Z",
    "newTrialEndDate": "2026-04-15T23:59:59.000Z",
    "extensionDays": 14,
    "auditLogId": "audit_01HZ5XKG"
  }
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `extensionDays` missing, zero, or negative | Fix request body |
| 400 | `VALIDATION_ERROR` | `reason` missing or fewer than 10 characters | Fix request body |
| 401 | `UNAUTHORIZED` | Missing or expired admin token | Re-authenticate |
| 403 | `FORBIDDEN` | Admin lacks `merchants.extend_trial` permission | Check admin permissions |
| 404 | `MERCHANT_NOT_FOUND` | `merchantId` does not exist | Verify merchant ID |
| 409 | `INVALID_MERCHANT_STATE` | Merchant is not in TRIAL state | Do not call for non-TRIAL merchants |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry once; escalate if persists |

**Error Response Example:**

```json
{
  "error": {
    "httpStatus": 409,
    "code": "INVALID_MERCHANT_STATE",
    "type": "conflict",
    "message": "Merchant is not in TRIAL state. Extend Trial is only valid for TRIAL merchants.",
    "details": [
      {
        "field": "merchantId",
        "issue": "wrong_state",
        "expected": "TRIAL",
        "actual": "LAUNCH"
      }
    ],
    "requestId": "req_01HZ5XKG3M",
    "timestamp": "2026-03-23T10:00:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/admin-api/errors"
  }
}
```

**Guard Rails:**
- Verify merchant `payPlanType === 'TRIAL'` before calling this endpoint to avoid 409 errors.
- Do not retry on 409 (state mismatch) — investigate the merchant's current state first.
- Retry on 500 with exponential backoff (max 2 retries).
- This endpoint is **not idempotent** — calling it twice extends the date twice. Implement client-side loading state.

---

### 2. Reactivate Suspended Account

**Operation ID:** `admin.reactivateAccount`
**Purpose:** Manually reactivates a suspended merchant to a chosen paid plan. If Bypass Payment is enabled (Super Admin only), the merchant is reactivated immediately. If not, a pending subscription is created and a payment link is sent to the merchant. Writes an audit log entry.

**Method:** `POST`
**Path:** `/v1/business-profile/admin/merchants/:merchantId/reactivate`
**Auth:** Bearer admin token + `merchants.reactivate` CASL permission. `bypassPayment: true` additionally requires `merchants.bypass_payment`.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | path | string | Yes | Valid merchant ID | Target suspended merchant's ID |

**Request Body:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `plan` | string | Yes | One of: `LAUNCH`, `GROW`, `SCALE` | Target plan to reactivate onto |
| `bypassPayment` | boolean | No | Default: `false`; requires `merchants.bypass_payment` if `true` | Skip payment requirement |
| `reason` | string | Yes | Min length: 10 | Admin-provided reason for audit log |

**Request Example (standard reactivation):**

```bash
curl -X POST https://api.prosperna.com/v1/business-profile/admin/merchants/merchant_01HZ/reactivate \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "LAUNCH",
    "bypassPayment": false,
    "reason": "Merchant confirmed intent to subscribe after migration suspension."
  }'
```

**Request Example (Super Admin bypass):**

```bash
curl -X POST https://api.prosperna.com/v1/business-profile/admin/merchants/merchant_01HZ/reactivate \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "GROW",
    "bypassPayment": true,
    "reason": "VIP merchant verified offline; bypass authorized by VP Operations."
  }'
```

**Success Response (200 OK):**

```json
{
  "data": {
    "merchantId": "merchant_01HZ",
    "previousPlanType": "SUSPENDED",
    "newPlanType": "LAUNCH",
    "bypassPayment": false,
    "paymentLinkSent": true,
    "paymentLink": "https://checkout.xendit.co/...",
    "auditLogId": "audit_01HZ5XKH"
  }
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `plan` is missing or not in allowed values | Fix plan value |
| 400 | `VALIDATION_ERROR` | `reason` missing or < 10 characters | Fix reason |
| 401 | `UNAUTHORIZED` | Invalid or expired admin token | Re-authenticate |
| 403 | `FORBIDDEN` | Admin lacks `merchants.reactivate` | Check permissions |
| 403 | `FORBIDDEN` | Admin sends `bypassPayment: true` without `merchants.bypass_payment` | Remove bypass or use Super Admin token |
| 404 | `MERCHANT_NOT_FOUND` | `merchantId` does not exist | Verify ID |
| 409 | `INVALID_MERCHANT_STATE` | Merchant is not SUSPENDED | Do not call for non-SUSPENDED merchants |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry once; escalate |

**Guard Rails:**
- Only call with `bypassPayment: true` from Super Admin context. The server enforces this, but the client must not render the toggle for non-Super Admins.
- Verify `payPlanType === 'SUSPENDED'` before calling to avoid 409.
- Not idempotent — do not retry on success responses.

---

### 3. Reset Usage Limits

**Operation ID:** `admin.resetUsage`
**Purpose:** Resets a merchant's usage counters (`orders`, `bandwidth`, `storage`) to zero for the current billing period and sets the enforcement state back to `normal`. Writes an audit log entry.

**Method:** `POST`
**Path:** `/v1/orders/admin/merchants/:merchantId/reset-usage`
**Auth:** Bearer admin token + `merchants.reset_usage` CASL permission

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | path | string | Yes | Valid merchant ID | Target paid-plan merchant's ID |

**Request Body:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `reason` | string | Yes | Min length: 10 | Admin-provided reason for audit log |

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/orders/admin/merchants/merchant_01HZ/reset-usage \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Merchant hit limit due to a data import batch job; authorized by Account Manager."
  }'
```

**Success Response (200 OK):**

```json
{
  "data": {
    "merchantId": "merchant_01HZ",
    "previousEnforcementState": "warning",
    "newEnforcementState": "normal",
    "countersReset": {
      "orders": true,
      "bandwidth": true,
      "storage": true
    },
    "auditLogId": "audit_01HZ5XKI"
  }
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `reason` missing or < 10 characters | Fix reason |
| 401 | `UNAUTHORIZED` | Invalid or expired token | Re-authenticate |
| 403 | `FORBIDDEN` | Lacks `merchants.reset_usage` | Check permissions |
| 404 | `MERCHANT_NOT_FOUND` | Merchant does not exist | Verify ID |
| 409 | `INVALID_MERCHANT_STATE` | Merchant not on LAUNCH/GROW/SCALE | Only valid for paid plan merchants |
| 500 | `INTERNAL_ERROR` | Unexpected error | Retry once |

**Guard Rails:**
- Only call for merchants with `payPlanType` in `['LAUNCH', 'GROW', 'SCALE']`. Returns 409 otherwise.
- Not idempotent in the sense that calling it after a reset has no harmful effect (usage is already 0), but avoid unnecessary duplicate calls.

---

### 4. Apply Promo Code (Updated)

**Operation ID:** `admin.applyPromoCode`
**Purpose:** Assigns an existing promo code to a merchant. Optionally bypasses tier-plan match validation via `overrideTierCheck`. Writes an audit log entry. This is an update to the existing `/v1/admin/rewards/:id/assign` endpoint to add `overrideTierCheck` and audit logging.

**Method:** `POST`
**Path:** `/v1/admin/rewards/:rewardId/assign`
**Auth:** Bearer admin token + `rewards.assign` CASL permission

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `rewardId` | path | string | Yes | Valid reward ID | The promo code to assign |

**Request Body:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `storeId` | string | Yes | Valid store/merchant ID | Target merchant |
| `overrideTierCheck` | boolean | No | Default: `false` | Skip tier-plan validation if `true` |
| `reason` | string | Yes | Min length: 10 | Admin-provided reason for audit log |

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/admin/rewards/reward_01HZ/assign \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store_01HZ",
    "overrideTierCheck": false,
    "reason": "Manual assignment per sales team request for new LAUNCH merchant."
  }'
```

**Success Response (200 OK):**

```json
{
  "data": {
    "rewardId": "reward_01HZ",
    "storeId": "store_01HZ",
    "assignedAt": "2026-03-23T10:00:00.000Z",
    "overrideTierCheck": false,
    "auditLogId": "audit_01HZ5XKJ"
  }
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `storeId` missing | Fix request |
| 400 | `VALIDATION_ERROR` | `reason` missing or < 10 characters | Fix reason |
| 400 | `TIER_MISMATCH` | Merchant plan doesn't match promo tier and `overrideTierCheck` is false | Enable override or choose a matching promo |
| 401 | `UNAUTHORIZED` | Invalid token | Re-authenticate |
| 403 | `FORBIDDEN` | Lacks `rewards.assign` permission | Check permissions |
| 404 | `REWARD_NOT_FOUND` | `rewardId` does not exist | Verify ID |
| 404 | `MERCHANT_NOT_FOUND` | `storeId` does not exist | Verify ID |
| 409 | `ALREADY_ASSIGNED` | Promo already assigned to this merchant | No action needed or check if re-assignment is intended |
| 500 | `INTERNAL_ERROR` | Unexpected error | Retry once |

**Guard Rails:**
- If `overrideTierCheck` is false, the server validates that the merchant's plan matches the promo's `assignment_subscription_tier`. A mismatch returns 400 `TIER_MISMATCH`.
- Use `overrideTierCheck: true` only when explicitly authorized by an account manager or support lead (document in `reason`).
- Not idempotent — a promo already assigned returns 409. Check before calling if uncertainty exists.

---

### 5. List Unified Invoices

**Operation ID:** `admin.listInvoices`
**Purpose:** Returns a paginated, filtered list of all invoices across both Stripe and Xendit gateways. Supports filtering by merchant, payment gateway, plan type, currency, date range, and invoice status.

**Method:** `GET`
**Path:** `/v1/payments/admin/invoices`
**Auth:** Bearer admin token

**Query Parameters:**

| Parameter | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `merchantId` | string | No | Valid merchant ID | Filter to a specific merchant |
| `paymentGateway` | string | No | `Stripe`, `Xendit` | Filter by gateway |
| `planType` | string | No | Any valid plan name | Filter by plan type (legacy or new) |
| `currency` | string | No | `USD`, `PHP` | Filter by invoice currency |
| `status` | string | No | `PAID`, `PENDING`, `FAILED`, `EXPIRED` | Filter by invoice status |
| `dateFrom` | string | No | ISO 8601 date | Start of date range |
| `dateTo` | string | No | ISO 8601 date | End of date range |
| `page` | integer | No | Default: 1 | Page number |
| `pageSize` | integer | No | Default: 20, Max: 100 | Records per page |
| `sortBy` | string | No | `date`, `amount` | Sort field |
| `sortOrder` | string | No | `asc`, `desc` | Sort direction |

**Request Example:**

```bash
curl -G https://api.prosperna.com/v1/payments/admin/invoices \
  -H "Authorization: Bearer <admin_token>" \
  -d "paymentGateway=Stripe" \
  -d "currency=USD" \
  -d "dateFrom=2026-01-01" \
  -d "dateTo=2026-03-31" \
  -d "page=1" \
  -d "pageSize=50"
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "invoiceId": "inv_01HZ",
      "merchantId": "merchant_01HZ",
      "storeName": "Doe's Shop",
      "status": "PAID",
      "amount": "29.00",
      "currency": "USD",
      "planType": "LAUNCH",
      "billingType": "MONTHLY",
      "paymentGateway": "Stripe",
      "description": "Launch Plan - Monthly",
      "date": "2026-03-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 243,
    "page": 1,
    "pageSize": 50
  }
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid filter parameter values | Fix query params |
| 401 | `UNAUTHORIZED` | Invalid token | Re-authenticate |
| 500 | `INTERNAL_ERROR` | Query error | Retry with narrowed date range |

**Guard Rails:**
- Always pass `currency` filter when performing reconciliation exports to avoid mixing PHP and USD records.
- Always use `dateFrom`/`dateTo` for large exports — unbounded queries may time out.
- Maximum `pageSize` is 100. Paginate through all pages for full exports rather than increasing page size beyond the maximum.
- `paymentGateway` field returns `null` for legacy records without the field — treat `null` the same as "N/A" in the UI.

---

### 6. List Unified Transactions

**Operation ID:** `admin.listTransactions`
**Purpose:** Returns a paginated, filtered, unified list of all customer-to-merchant order transactions across both Stripe and Xendit gateways. Includes the Payment Gateway column and convenience fee fields.

**Method:** `GET`
**Path:** `/v1/payments/admin/transactions`
**Auth:** Bearer admin token

**Query Parameters:**

| Parameter | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `paymentGateway` | string | No | `Stripe`, `Xendit` | Filter by gateway |
| `country` | string | No | `PH`, `US` | Country filter (independent of gateway) |
| `status` | string | No | Order payment status values | Filter by order status |
| `dateFrom` | string | No | ISO 8601 date | Start of date range |
| `dateTo` | string | No | ISO 8601 date | End of date range |
| `page` | integer | No | Default: 1 | Page number |
| `pageSize` | integer | No | Default: 20, Max: 100 | Records per page |
| `sortBy` | string | No | `date`, `amount` | Sort field |
| `sortOrder` | string | No | `asc`, `desc` | Sort direction |

**Request Example:**

```bash
curl -G https://api.prosperna.com/v1/payments/admin/transactions \
  -H "Authorization: Bearer <admin_token>" \
  -d "paymentGateway=Xendit" \
  -d "dateFrom=2026-03-01" \
  -d "dateTo=2026-03-31" \
  -d "page=1" \
  -d "pageSize=20"
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "orderId": "ORD-01HZ",
      "storeName": "Doe's Shop",
      "customer": "Jane Doe",
      "amount": "1500.00",
      "currency": "PHP",
      "paymentType": "eWallet",
      "paymentGateway": "Xendit",
      "status": "PAID",
      "convenienceFee": "0.00",
      "convenienceFeeCustomer": "0.00",
      "convenienceFeeMerchant": "0.00",
      "paymentGatewayFee": "22.50",
      "date": "2026-03-15T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1540,
    "page": 1,
    "pageSize": 20
  }
}
```

**Notes on `convenienceFee` fields:**
- For orders created **post-migration**: all three convenience fee fields return `"0.00"`.
- For **historical (pre-migration)** orders: return the original values.
- `paymentGateway` returns `null` for legacy records without the field.

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid filter values | Fix query params |
| 401 | `UNAUTHORIZED` | Invalid token | Re-authenticate |
| 500 | `INTERNAL_ERROR` | Query timeout or error | Narrow date range and retry |

**Guard Rails:**
- Use `dateFrom`/`dateTo` for all production use — unbounded queries over large datasets will time out.
- `country` and `paymentGateway` filters are independent; a PH merchant may theoretically switch gateways, so do not assume `country=PH` always means `paymentGateway=Xendit`.
- Sorting must be stable across pages — do not change sort parameters between paginated requests.

---

### 7. Get Merchant Invoice List (Updated)

**Operation ID:** `admin.getMerchantInvoices`
**Purpose:** Returns invoices for a specific merchant across all tabs (Billing, Marketplace, Top-Up). Updated to include `paymentGateway` field and support `currency` filter. Existing endpoint; backward-compatible update.

**Method:** `GET`
**Path:** `/v1/payments/admin/merchants/:merchantId/invoices`
**Auth:** Bearer admin token

**Query Parameters:**

| Parameter | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `tab` | string | No | `billing`, `marketplace`, `topup` | Filter by invoice tab |
| `currency` | string | No | `USD`, `PHP` | Filter by currency |
| `paymentGateway` | string | No | `Stripe`, `Xendit` | Filter by gateway |
| `page` | integer | No | Default: 1 | Page number |
| `pageSize` | integer | No | Default: 20, Max: 100 | Records per page |

**Request Example:**

```bash
curl -G https://api.prosperna.com/v1/payments/admin/merchants/merchant_01HZ/invoices \
  -H "Authorization: Bearer <admin_token>" \
  -d "tab=billing" \
  -d "currency=USD" \
  -d "page=1"
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "invoiceId": "inv_01HZ",
      "status": "PAID",
      "amount": "29.00",
      "currency": "USD",
      "planType": "LAUNCH",
      "billingType": "MONTHLY",
      "paymentGateway": "Stripe",
      "description": "Launch Plan - Monthly",
      "date": "2026-03-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "pageSize": 20
  }
}
```

**Guard Rails:**
- `paymentGateway` returns `null` for legacy Xendit records that predate the `payment_gateway` field — render as "N/A" in the UI.
- `planType` may return legacy values (`PLUS`, `PRO`, `PREMIUM`) for historical invoices — these are valid read values, not errors.

---

### 8. Create Promo Code (Updated)

**Operation ID:** `rewards.create`
**Purpose:** Creates a new promo code. Updated to accept new tier values (`LAUNCH`, `GROW`, `SCALE`) for `assignmentSubscriptionTier`. Old values (`FREE`, `PLUS`, `PRO`, `PREMIUM`) are no longer accepted for new promo creation.

**Method:** `POST`
**Path:** `/v1/admin/rewards`
**Auth:** Bearer admin token

**Request Body (relevant updated fields):**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `assignmentSubscriptionTier` | string | Yes | One of: `ALL`, `LAUNCH`, `GROW`, `SCALE` | Target tier for new promos |
| All other existing fields | — | — | Unchanged | See existing API docs |

**Error Path (updated):**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_TIER` | `assignmentSubscriptionTier` is `FREE`, `PLUS`, `PRO`, or `PREMIUM` | Use new tier values only |

**Guard Rails:**
- Old tier values are rejected for new promo creation. Existing promos with old tiers are not affected — they remain valid and readable.

---

### 9. List Merchants for Promo Assignment (Updated)

**Operation ID:** `rewards.merchantsList`
**Purpose:** Returns paginated merchant list for the promo assignment left panel. Updated to return and filter by new plan type values.

**Method:** `GET`
**Path:** `/v1/admin/rewards/merchants`
**Auth:** Bearer admin token

**Query Parameters (updated):**

| Parameter | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `planType` | string | No | `ALL`, `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED` | Filter merchants by plan |
| `search` | string | No | — | Search by store name or email |
| `page` | integer | No | Default: 1 | Page number |
| `pageSize` | integer | No | Default: 20 | Records per page |

**Guard Rails:**
- Old plan type values are no longer accepted as filter values on this endpoint. Pass only new plan type values.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | path | string | Yes (context-dependent) | Valid MongoDB ObjectId or Prosperna merchant ID | Target merchant for override actions |
| `rewardId` | path | string | Yes (context-dependent) | Valid reward/promo ID | Target promo code |
| `extensionDays` | body | integer | Yes (Extend Trial) | Min: 1 | Days to extend trial |
| `plan` | body | string | Yes (Reactivate) | `LAUNCH`, `GROW`, `SCALE` | Target plan for reactivation |
| `bypassPayment` | body | boolean | No | Default: false | Skip payment on reactivation (Super Admin only) |
| `storeId` | body | string | Yes (Apply Promo) | Valid store ID | Target store for promo assignment |
| `overrideTierCheck` | body | boolean | No | Default: false | Skip tier validation on promo assignment |
| `reason` | body | string | Yes (all override actions) | Min 10 characters | Audit log reason |
| `paymentGateway` | query | string | No | `Stripe`, `Xendit` | Filter invoices/transactions by gateway |
| `currency` | query | string | No | `USD`, `PHP` | Filter by invoice currency |
| `planType` | query | string | No | Any plan name | Filter by plan type |
| `dateFrom` | query | string | No | ISO 8601 | Start of date range filter |
| `dateTo` | query | string | No | ISO 8601 | End of date range filter |
| `page` | query | integer | No | Default: 1 | Pagination page number |
| `pageSize` | query | integer | No | Max: 100 | Records per page |

---

## Request/Response Contract Notes

- `paymentGateway` field on invoice and transaction responses: returns `"Stripe"` or `"Xendit"` as string values; returns `null` for legacy records where the field was not stored. Frontend renders `null` as "N/A".
- `planType` on invoice responses: can return both legacy values (`PLUS`, `PRO`, `PREMIUM`) and new values (`LAUNCH`, `GROW`, `SCALE`). Both are valid; frontend must display whichever is returned.
- `convenienceFee` fields on transaction responses: new post-migration orders return `"0.00"`; historical orders return original values. The field is always present in the response.
- `reason` on override action requests: treated as a free-text audit field. Backend stores it verbatim. No PII redaction is applied in v1.
- `assignmentSubscriptionTier` on reward create/update: only `ALL`, `LAUNCH`, `GROW`, `SCALE` accepted for new records. Old values are rejected with 400.

---

## Idempotency and Concurrency Notes

- **Extend Trial, Reactivate, Reset Usage, Apply Promo:** None of these endpoints are idempotent. Implement client-side loading/disabled states immediately upon form submission to prevent duplicate API calls.
- **Extend Trial:** Calling twice in succession with the same `extensionDays` will extend the date twice (additive). Guards against this must be implemented in the frontend (disable confirm button after first call).
- **Apply Promo:** Returns 409 `ALREADY_ASSIGNED` if the promo is already assigned to the merchant. This is not an error state — treat as success in the UI if the intended outcome (promo assigned) is already achieved.
- **Unified list endpoints:** These are read-only and inherently idempotent.

---

## Security and Privacy Notes

- All override endpoints write audit log entries server-side. Log entries are immutable (no update/delete operations on audit log).
- `bypassPayment` is a sensitive financial operation. Server-side permission check is the authoritative guard — do not rely on frontend-only gating.
- Admin tokens should not be stored in localStorage. Use memory or HttpOnly cookies per platform security policy.
- Invoice and transaction data contains merchant financial information. Do not log full response bodies in client-side logging.
- `reason` field on override actions is stored verbatim. Instruct admins not to include merchant PII (personal names, IDs) in the reason text.

---

## Domain Events and Webhooks

No webhooks are exposed by ST-12 endpoints. The following internal domain events are emitted by backend services upon successful override actions (consumed by other internal services, e.g., email/notification service):

| Event | Emitter | Trigger | Consumers |
|---|---|---|---|
| `merchant.trial_extended` | business-profile-api | Extend Trial success | Email drip reschedule service (ST-15) |
| `merchant.reactivated` | business-profile-api | Reactivate success (bypass) | Notification service |
| `merchant.reactivation_pending` | business-profile-api | Reactivate success (no bypass) | Payment link email service |
| `merchant.usage_reset` | orders-service-api | Reset Usage success | Enforcement state service (ST-06) |

---

## SDK and Integration Examples

The Admin Control Platform frontend (`prosperna1`) consumes these endpoints via the existing internal Axios-based API client. No public SDK is provided for admin-only endpoints.

**Frontend usage pattern (React, existing `useAdminApi` hook style):**

```js
// Extend Trial
const extendTrial = async (merchantId, extensionDays, reason) => {
  const response = await adminApi.post(
    `/v1/business-profile/admin/merchants/${merchantId}/extend-trial`,
    { extensionDays, reason }
  );
  return response.data;
};

// Unified invoice list with filters
const fetchInvoices = async (filters) => {
  const response = await adminApi.get('/v1/payments/admin/invoices', {
    params: {
      paymentGateway: filters.gateway,
      currency: filters.currency,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      page: filters.page,
      pageSize: filters.pageSize,
    },
  });
  return response.data;
};
```

---

## How to Use This API Safely

1. **Always check merchant state before calling override endpoints.** Use the Accounts List data already loaded in the UI to confirm `payPlanType` before opening a modal — this avoids 409 errors.
2. **Use the `reason` field meaningfully.** Audit logs are the only trail for override actions. Vague reasons like "test" or "fix" provide no value. Train admins to write at least one sentence explaining why the override is needed.
3. **Use date range filters on list endpoints.** Unbounded queries on large datasets (`admin/transactions`, `admin/invoices`) can result in timeouts. Always scope exports to a date range.
4. **Do not use `overrideTierCheck` by default.** Only enable it when explicitly directed by a team lead or account manager — and document that authorization in the `reason` field.
5. **Handle `null` payment gateway gracefully.** Legacy records will return `null` for `paymentGateway`. Always treat `null` as "N/A" in display — do not treat it as an error.

---

## Change Impact

| Existing Endpoint | Change Type | Impact |
|---|---|---|
| `POST /v1/admin/rewards` | Additive — new tier values accepted; old values rejected for new records | Breaking for consumers trying to create promos with old tier names |
| `POST /v1/admin/rewards/:id/assign` | Additive — new `overrideTierCheck` and `reason` fields; `reason` is now required | Breaking for callers that omit `reason` (previously optional or absent) |
| `GET /v1/admin/rewards/merchants` | Additive — new `planType` filter values accepted | Non-breaking; old values no longer valid as filter input |
| `GET /v1/payments/admin/merchants/:merchantId/invoices` (existing or approximate path) | Additive — new `paymentGateway` and `currency` query params; `paymentGateway` field added to response | Non-breaking; consumers that ignore new fields are unaffected |

---

## Open Questions

| ID | Question | Owner | Status |
|---|---|---|---|
| OEQ-1 | Confirm the exact existing path for the merchant invoice endpoint — is it `/xenditrecurringplaninvoices/store/:store_id` or a different admin path? Needs verification against `payment-integration-api` router. | Engineering | Open |
| OEQ-2 | Is `orders-service-api` the correct service to own Reset Usage Limits, or should it be a dedicated `usage-service`? To be confirmed during ST-06 design. | Engineering | Open |
| OEQ-3 | Should the `reason` field on override actions have a maximum character length to prevent abuse or oversized audit log entries? | Product | Open |
| OEQ-4 | What is the correct audit log collection name and schema? Is there an existing `admin_audit_log` collection, or does it need to be created? | Engineering | Open |
| OEQ-5 | For Reactivate without bypass: which payment gateway is used for the new subscription? Should the admin select the gateway, or should it default to the merchant's country (Stripe for US, Xendit for PH)? | Product | Open |
