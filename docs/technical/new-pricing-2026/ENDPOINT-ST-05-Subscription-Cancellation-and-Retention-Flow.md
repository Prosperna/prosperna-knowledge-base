---
id: st-05-subscription-cancellation-and-retention-flow
title: Endpoint Document. ST-05 Subscription Cancellation and Retention Flow
sidebar_label: ST-05 Subscription Cancellation and Retention Flow
sidebar_position: 5
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft

---

## Linked Documents
- BRD: BRD-ST-05-Subscription-Cancellation-and-Retention-Flow.md
- PRD: PRD-ST-05-Subscription-Cancellation-and-Retention-Flow.md

---

## Public API Overview

This document describes the API surface for the Subscription Cancellation and Retention Flow (ST-05). It covers four new endpoints and one modified endpoint exposed by the Prosperna platform to support:

- Initiating and confirming a voluntary subscription cancellation
- Voiding a pending cancellation (resubscription)
- Scheduling a voluntary plan downgrade
- Querying the current cancellation status of a subscription

All endpoints operate within the `business-profile-api` service and integrate with the Payment Abstraction Layer (ST-01) and the Suspended Account State infrastructure (ST-04).

---

## Audience and Use Cases

| Consumer | Use Case |
|---|---|
| **Merchant Dashboard (frontend)** | Drive the cancellation flow modal, display pending cancellation state, enable resubscription, render downgrade confirmation |
| **Admin Control Platform** | Read cancellation status per merchant; trigger manual void/reactivation (via admin-scoped variants) |
| **cancellation-processor background job** | Query pending cancellations; this job calls `suspendMerchant()` directly via service function — not via HTTP endpoint |
| **Internal services** | Read cancellation status as part of merchant state resolution |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Production | `https://api.prosperna.com` | Live merchant traffic | mTLS required for service-to-service |
| Staging | `https://api.staging.prosperna.com` | Pre-production testing | Same auth scheme as production |
| Development | `https://api.dev.prosperna.com` | Developer testing | Auth tokens accepted; test gateway adapters active |

All endpoints are prefixed with `/api/v1`.

---

## API Versioning and Compatibility

- Current API version: **v1**
- Versioning is path-based: `/api/v1/...`
- Non-breaking additions (new optional fields, new response properties) do not increment the version
- Breaking changes (removed fields, changed semantics) will increment to `/api/v2/...` with a deprecation notice and migration window
- Consumers should treat unrecognized response fields as ignorable (forward-compatible design)

---

## Protocol and Data Format Standards

- **Transport:** HTTPS only. HTTP requests are rejected with `301 Moved Permanently`.
- **Format:** JSON (`Content-Type: application/json`, `Accept: application/json`)
- **Encoding:** UTF-8
- **Datetime format:** ISO 8601 — `YYYY-MM-DDTHH:mm:ssZ` (UTC)
- **IDs:** MongoDB ObjectId strings (24-character hex)
- **Null fields:** Nullable fields are included in responses with `null` value (not omitted)
- **Boolean:** Lowercase `true` / `false`

---

## Authentication and Authorization

All endpoints require a valid **JWT Bearer token** issued by the Prosperna auth service.

```
Authorization: Bearer <jwt_token>
```

- Tokens are issued on merchant login and carry the `merchant_id`, `store_id`, and `role` claims
- Token expiry: 1 hour (access token); 30 days (refresh token)
- Admin-scoped operations require a token with `role: admin`
- Requests without a valid token receive `401 Unauthorized`
- Requests with a valid token but insufficient role receive `403 Forbidden`

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| `merchant` | Cancel own subscription, resubscribe own subscription, downgrade own plan, query own cancellation status | Can only operate on their own `store_id` — cross-merchant operations return 403 |
| `admin` | All merchant operations + read any merchant's cancellation status + void any pending cancellation + manual reactivation | Must pass `store_id` of target merchant explicitly |
| `service` (internal) | Read cancellation status, internal job triggers | Service-to-service via mTLS; not exposed publicly |

---

## Ownership and Data Access Rules

- A merchant can only cancel, resubscribe, or downgrade their own subscription
- The `store_id` in the JWT token is validated against the request body or path parameter on every write operation
- Admin tokens may specify any `store_id` but the action is audit-logged with the admin's identity
- Cancellation reason data and free-text fields are never returned in any public-facing API — analytics endpoints are internal-only

---

## Request Conventions

- **Content-Type:** `application/json` on all POST requests
- **Idempotency:** `POST /cancel` and `POST /downgrade` accept an optional `Idempotency-Key` header (UUID v4). Requests with the same key within 24 hours return the cached response without re-processing.
- **Correlation ID:** Include `X-Request-ID` header (UUID v4) for distributed tracing. Echoed in all responses as `X-Request-ID`.
- **Body size limit:** 8 KB maximum

---

## Response Conventions

- All successful responses return `2xx` with a JSON body
- All error responses return `4xx` or `5xx` with the Global Error Model (see below)
- Response envelope for successful operations:

```json
{
  "success": true,
  "data": { ... },
  "requestId": "uuid-v4",
  "timestamp": "2026-03-17T08:00:00Z"
}
```

---

## Global Guard Rails (Consumer Safety)

| Guard Rail | Detail |
|---|---|
| **Retry with backoff** | On `429 Too Many Requests` or `5xx`, retry with exponential backoff: 1s, 2s, 4s. Max 3 retries. |
| **Idempotency key** | Always use `Idempotency-Key` on `POST /cancel` and `POST /downgrade` to prevent duplicate state changes on network retries. |
| **Timeout** | Set client timeout to 10 seconds. Gateway calls may add 3–5 seconds of latency. |
| **Do not poll cancellation status** | Use the response of `POST /cancel` for the `effective_date`. Only call `GET /cancellation-status` on initial page load — not in a polling loop. |
| **Handle 409 gracefully** | A `409 Conflict` means the operation is invalid given the current subscription state. Read the `code` field to determine the exact conflict before showing UI. |
| **Forward compatibility** | Ignore unknown fields in responses. New fields may be added without version bumps. |

---

## Rate Limits and Abuse Controls

| Endpoint | Rate Limit | Window | Limit Bucket |
|---|---|---|---|
| `POST /subscription/cancel` | 5 requests | Per merchant, per hour | `cancel_write` |
| `POST /subscription/resubscribe` | 10 requests | Per merchant, per hour | `resubscribe_write` |
| `POST /subscription/downgrade` | 5 requests | Per merchant, per hour | `downgrade_write` |
| `GET /subscription/cancellation-status` | 60 requests | Per merchant, per minute | `subscription_read` |
| `GET /merchant/status` | 120 requests | Per merchant, per minute | `merchant_read` |

Rate limit responses return `429 Too Many Requests` with headers:
- `X-RateLimit-Limit`: the limit for the bucket
- `X-RateLimit-Remaining`: requests remaining in the window
- `X-RateLimit-Reset`: Unix timestamp when the window resets
- `Retry-After`: seconds until the merchant may retry

---

## Global Error Model

All error responses use this structure:

```json
{
  "error": {
    "httpStatus": 422,
    "code": "INVALID_PLAN_STATE",
    "type": "business_rule_violation",
    "message": "Merchant is not on an active paid plan and cannot initiate a cancellation.",
    "details": [
      {
        "field": "store_id",
        "issue": "invalid_state",
        "expected": "LAUNCH | GROW | SCALE",
        "actual": "TRIAL"
      }
    ],
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-03-17T08:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/v1/subscription/cancel"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `cancel-subscription` | POST | `/api/v1/subscription/cancel` | `merchant` / `admin` | Initiate and confirm a voluntary cancellation | `cancel_write` | FR-5, FR-11, FR-12, FR-13 |
| `resubscribe-subscription` | POST | `/api/v1/subscription/resubscribe` | `merchant` / `admin` | Void a pending cancellation | `resubscribe_write` | FR-7, FR-11 |
| `downgrade-subscription` | POST | `/api/v1/subscription/downgrade` | `merchant` / `admin` | Schedule a plan downgrade | `downgrade_write` | FR-8, FR-9, FR-12 |
| `get-cancellation-status` | GET | `/api/v1/subscription/cancellation-status` | `merchant` / `admin` | Check if merchant has a pending cancellation | `subscription_read` | FR-6, FR-8 |
| `get-merchant-status` | GET | `/api/v1/merchant/status` | `merchant` / `admin` | Get full merchant status (modified to include cancellation fields) | `merchant_read` | FR-6 |

---

## Endpoint Reference

---

### 1. POST /api/v1/subscription/cancel

**Operation ID:** `cancel-subscription`

**Purpose and when to use**
Call this endpoint when a merchant has completed the cancellation flow modal (selected reason, seen counter-offer, confirmed). This endpoint schedules the cancellation for the end of the current billing period, records the cancellation data, and notifies the payment gateway. Do NOT call this on reason selection or counter-offer steps — only on final confirmation.

**Method:** POST
**Path:** `/api/v1/subscription/cancel`
**Auth:** Bearer JWT, `merchant` or `admin` scope

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Authenticated merchant JWT |
| `Idempotency-Key` | Header | string | No | UUID v4 | Prevents duplicate cancellations on retry |
| `X-Request-ID` | Header | string | No | UUID v4 | Correlation ID for distributed tracing |

**Request Body Schema**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `reason` | string | Yes | Enum: `too_expensive`, `not_using_enough`, `missing_features`, `switching_platform`, `business_closing`, `other` | Cancellation reason selected by merchant |
| `reason_detail` | string | No | Max 1000 chars | Free-text detail (for "other" or feature request text) |
| `counter_offer_shown` | string | No | Enum: `downgrade`, `usage_stats`, `feature_request`, `survey`, `empathetic`, `generic`, `null` | Which counter-offer was displayed |
| `counter_offer_accepted` | boolean | No | Default: `false` | Whether the merchant accepted the counter-offer |

**Request Example**

```bash
curl -X POST https://api.prosperna.com/api/v1/subscription/cancel \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 7f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c" \
  -H "X-Request-ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -d '{
    "reason": "too_expensive",
    "reason_detail": null,
    "counter_offer_shown": "downgrade",
    "counter_offer_accepted": false
  }'
```

**Success Response — 200 OK**

```json
{
  "success": true,
  "data": {
    "cancellation_id": "507f1f77bcf86cd799439011",
    "effective_date": "2026-04-15T23:59:59Z",
    "message": "Your subscription has been cancelled. Your plan remains active until April 15, 2026."
  },
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-03-17T08:00:00Z"
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | `reason` not provided | Validate request before sending |
| 400 | `INVALID_REASON_VALUE` | `reason` is not a valid enum value | Validate enum against the allowed list |
| 401 | `UNAUTHORIZED` | Missing or expired JWT | Re-authenticate and retry |
| 403 | `FORBIDDEN` | Token `store_id` does not match subscription owner | Do not retry — authorization error |
| 409 | `CANCELLATION_ALREADY_PENDING` | Merchant already has a pending cancellation | Show "You already have a pending cancellation" — do not re-submit |
| 422 | `INVALID_PLAN_STATE` | Merchant is not on an active paid plan (LAUNCH/GROW/SCALE) | Do not show cancel button for TRIAL or SUSPENDED merchants |
| 502 | `GATEWAY_ERROR` | Payment gateway call failed | Rollback completed — safe to retry after a delay; show error to merchant |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many cancel attempts | Retry after `Retry-After` seconds |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry once; if persists, surface error and log `requestId` for support |

**Error Response Example — 409 Conflict**

```json
{
  "error": {
    "httpStatus": 409,
    "code": "CANCELLATION_ALREADY_PENDING",
    "type": "conflict",
    "message": "This merchant already has a pending cancellation scheduled for 2026-04-15.",
    "details": [
      {
        "field": "store_id",
        "issue": "duplicate_cancellation",
        "expected": "no_pending_cancellation",
        "actual": "pending_cancellation_exists"
      }
    ],
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-03-17T08:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/v1/subscription/cancel"
  }
}
```

**Guard Rails and Safe Usage**
- Always include `Idempotency-Key` to prevent duplicate cancellations on network retries
- Do not call this endpoint on reason selection or counter-offer steps — only on final "Confirm Cancellation" click
- On `502 GATEWAY_ERROR`, the internal state has been rolled back — retrying is safe with the same `Idempotency-Key`
- Client timeout: 10 seconds (gateway latency may reach 5 seconds)

---

### 2. POST /api/v1/subscription/resubscribe

**Operation ID:** `resubscribe-subscription`

**Purpose and when to use**
Call this endpoint when a merchant with a pending cancellation confirms they want to void the cancellation and keep their plan. Reverses the payment gateway state and restores the internal subscription to `active`. The billing cycle is preserved — no new charge.

**Method:** POST
**Path:** `/api/v1/subscription/resubscribe`
**Auth:** Bearer JWT, `merchant` or `admin` scope

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Authenticated merchant JWT |
| `Idempotency-Key` | Header | string | No | UUID v4 | Prevents duplicate resubscription on retry |
| `X-Request-ID` | Header | string | No | UUID v4 | Correlation ID |

**Request Body**
Empty JSON object `{}` — no body fields required. The merchant's subscription is resolved from the JWT token.

**Request Example**

```bash
curl -X POST https://api.prosperna.com/api/v1/subscription/resubscribe \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 9c8b7a6d-5e4f-3a2b-1c0d-ef9876543210" \
  -d '{}'
```

**Success Response — 200 OK**

```json
{
  "success": true,
  "data": {
    "plan": "GROW",
    "status": "active",
    "message": "Welcome back! Your GROW plan will continue as normal."
  },
  "requestId": "b2c3d4e5-f6a7-8901-bcde-f01234567891",
  "timestamp": "2026-03-25T14:30:00Z"
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or expired JWT | Re-authenticate and retry |
| 403 | `FORBIDDEN` | Token `store_id` mismatch | Do not retry |
| 404 | `NO_PENDING_CANCELLATION` | No active pending cancellation found for this merchant | Do not show resubscribe option if no pending cancellation |
| 409 | `CANCELLATION_ALREADY_EFFECTIVE` | The billing period has already ended — merchant is now SUSPENDED | Cannot resubscribe via this endpoint; direct to plan selection / reactivation flow (ST-04) |
| 502 | `GATEWAY_ERROR` | Payment gateway reactivation failed | Internal state NOT changed — safe to retry with same `Idempotency-Key` |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many resubscribe attempts | Retry after `Retry-After` seconds |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry once; surface error if persists |

**Error Response Example — 404 Not Found**

```json
{
  "error": {
    "httpStatus": 404,
    "code": "NO_PENDING_CANCELLATION",
    "type": "not_found",
    "message": "No pending cancellation found for this merchant. Nothing to resubscribe.",
    "details": [],
    "requestId": "b2c3d4e5-f6a7-8901-bcde-f01234567891",
    "timestamp": "2026-03-25T14:30:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/v1/subscription/resubscribe"
  }
}
```

**Guard Rails and Safe Usage**
- Use `Idempotency-Key` to prevent double reactivation on retry
- On `409 CANCELLATION_ALREADY_EFFECTIVE`: the billing period has closed. Direct the merchant to the plan selection and reactivation path (ST-04), not this endpoint.
- On `502 GATEWAY_ERROR`: the internal state was NOT modified — safe to show error and retry

---

### 3. POST /api/v1/subscription/downgrade

**Operation ID:** `downgrade-subscription`

**Purpose and when to use**
Call this endpoint when a merchant confirms a voluntary plan downgrade. The downgrade is scheduled for the end of the current billing period. The response includes the `effective_date` and any `resource_warnings` the frontend must display to the merchant.

**Method:** POST
**Path:** `/api/v1/subscription/downgrade`
**Auth:** Bearer JWT, `merchant` or `admin` scope

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Authenticated merchant JWT |
| `Idempotency-Key` | Header | string | No | UUID v4 | Prevents duplicate downgrade scheduling |
| `X-Request-ID` | Header | string | No | UUID v4 | Correlation ID |

**Request Body Schema**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `target_plan` | string | Yes | Enum: `LAUNCH`, `GROW` | The lower-tier plan to downgrade to. Must be lower than the merchant's current plan. |

**Request Example**

```bash
curl -X POST https://api.prosperna.com/api/v1/subscription/downgrade \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 3f2e1d0c-9b8a-7c6d-5e4f-3a2b1c0d9e8f" \
  -d '{
    "target_plan": "LAUNCH"
  }'
```

**Success Response — 200 OK**

```json
{
  "success": true,
  "data": {
    "current_plan": "SCALE",
    "new_plan": "LAUNCH",
    "effective_date": "2026-04-15T23:59:59Z",
    "resource_warnings": [
      {
        "resource": "product_skus",
        "current_count": 3500,
        "new_limit": 500,
        "excess_count": 3000,
        "action": "hidden_from_storefront",
        "message": "3,000 products will be hidden from your storefront. They remain in your dashboard."
      },
      {
        "resource": "storage_gb",
        "current_usage_gb": 45,
        "new_limit_gb": 10,
        "action": "upload_blocked",
        "message": "You will be unable to upload new files until storage is reduced below 10 GB."
      },
      {
        "resource": "admin_users",
        "current_count": 3,
        "new_limit": 2,
        "excess_count": 1,
        "action": "archived",
        "message": "1 admin account will be archived using the existing 30-day deletion process."
      }
    ],
    "message": "Your plan will change to LAUNCH on April 15, 2026."
  },
  "requestId": "c3d4e5f6-a7b8-9012-cdef-012345678902",
  "timestamp": "2026-03-17T08:00:00Z"
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | `target_plan` not provided | Validate before sending |
| 400 | `INVALID_PLAN_VALUE` | `target_plan` is not a valid enum | Validate against enum list |
| 401 | `UNAUTHORIZED` | Missing or expired JWT | Re-authenticate |
| 403 | `FORBIDDEN` | Token `store_id` mismatch | Do not retry |
| 409 | `NOT_A_DOWNGRADE` | `target_plan` is equal to or higher than current plan | Show an upgrade path instead |
| 409 | `CANCELLATION_PENDING` | Merchant has a pending cancellation — must resubscribe first | Show: "Resubscribe to change your plan" |
| 409 | `DOWNGRADE_ALREADY_SCHEDULED` | A downgrade is already scheduled for this billing period | Show current scheduled downgrade details |
| 422 | `INVALID_PLAN_STATE` | Merchant is not on an active paid plan | Validate plan state before showing downgrade UI |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many downgrade attempts | Retry after `Retry-After` |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry once; surface error if persists |

**Error Response Example — 409 Conflict**

```json
{
  "error": {
    "httpStatus": 409,
    "code": "CANCELLATION_PENDING",
    "type": "conflict",
    "message": "This merchant has a pending cancellation and cannot schedule a downgrade. Void the cancellation first.",
    "details": [
      {
        "field": "subscription_state",
        "issue": "conflicting_state",
        "expected": "active_no_pending_cancellation",
        "actual": "cancellation_pending"
      }
    ],
    "requestId": "c3d4e5f6-a7b8-9012-cdef-012345678902",
    "timestamp": "2026-03-17T08:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/v1/subscription/downgrade"
  }
}
```

**Guard Rails and Safe Usage**
- Always display `resource_warnings` from the response to the merchant in the confirmation modal before the downgrade is submitted — warnings inform the merchant what will happen at period end
- Note: `resource_warnings` in the `GET /cancellation-status` pre-check can also be used to show warnings BEFORE the confirmation step
- Use `Idempotency-Key` on all downgrade submissions
- Do not call `POST /downgrade` speculatively — only after the merchant clicks "Confirm Downgrade"

---

### 4. GET /api/v1/subscription/cancellation-status

**Operation ID:** `get-cancellation-status`

**Purpose and when to use**
Use this endpoint on page load to determine whether the merchant has a pending cancellation. Drive the dashboard banner, billing page badge, and button state based on the response. Do not poll — read on page load only.

**Method:** GET
**Path:** `/api/v1/subscription/cancellation-status`
**Auth:** Bearer JWT, `merchant` or `admin` scope

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Authenticated merchant JWT |
| `X-Request-ID` | Header | string | No | UUID v4 | Correlation ID |

**Request Example**

```bash
curl -X GET https://api.prosperna.com/api/v1/subscription/cancellation-status \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "X-Request-ID: d4e5f6a7-b8c9-0123-defa-b01234567893"
```

**Success Response — 200 OK (pending cancellation)**

```json
{
  "success": true,
  "data": {
    "pending": true,
    "cancellation_id": "507f1f77bcf86cd799439011",
    "effective_date": "2026-04-15T23:59:59Z",
    "reason": "too_expensive",
    "cancellation_date": "2026-03-17T08:00:00Z"
  },
  "requestId": "d4e5f6a7-b8c9-0123-defa-b01234567893",
  "timestamp": "2026-03-17T10:00:00Z"
}
```

**Success Response — 200 OK (no pending cancellation)**

```json
{
  "success": true,
  "data": {
    "pending": false,
    "effective_date": null,
    "reason": null,
    "cancellation_date": null
  },
  "requestId": "d4e5f6a7-b8c9-0123-defa-b01234567894",
  "timestamp": "2026-03-17T10:00:00Z"
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or expired JWT | Re-authenticate |
| 403 | `FORBIDDEN` | Token `store_id` mismatch | Do not retry |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many status reads | Back off and retry after `Retry-After` |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry once with backoff |

**Guard Rails and Safe Usage**
- Read this endpoint once per page load to initialize UI state — do not poll
- The `reason` field in the response is sanitized: only the enum value is returned, not the free-text `reason_detail`
- If `pending: true` and `effective_date` is in the past, the `cancellation-processor` may not have run yet. Show the banner as normal — suspension will take effect on the next job run.

---

### 5. GET /api/v1/merchant/status (Modified)

**Operation ID:** `get-merchant-status`

**Purpose and when to use**
Existing endpoint modified to include cancellation-related fields. Returns full merchant status including plan, suspension state, and (new) pending cancellation indicators. Used on dashboard load to resolve all top-level merchant state.

**Method:** GET
**Path:** `/api/v1/merchant/status`
**Auth:** Bearer JWT, `merchant` or `admin` scope

**New Fields Added in ST-05 (delta from prior version)**

| Field | Type | Nullable | Description |
|---|---|---|---|
| `cancellation_pending` | boolean | No | `true` if merchant has an active pending cancellation |
| `cancellation_effective_date` | string (ISO 8601) | Yes | Date the cancellation takes effect; `null` if no pending cancellation |

**Request Example**

```bash
curl -X GET https://api.prosperna.com/api/v1/merchant/status \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "X-Request-ID: e5f6a7b8-c9d0-1234-efab-c12345678904"
```

**Success Response — 200 OK (with pending cancellation)**

```json
{
  "success": true,
  "data": {
    "store_id": "abc123store",
    "plan": "GROW",
    "status": "active",
    "is_suspended": false,
    "trial_active": false,
    "cancellation_pending": true,
    "cancellation_effective_date": "2026-04-15T23:59:59Z",
    "next_billing_date": "2026-04-15T23:59:59Z"
  },
  "requestId": "e5f6a7b8-c9d0-1234-efab-c12345678904",
  "timestamp": "2026-03-17T10:00:00Z"
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or expired JWT | Re-authenticate |
| 403 | `FORBIDDEN` | Token mismatch | Do not retry |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many status reads | Retry after `Retry-After` |
| 500 | `INTERNAL_ERROR` | Server error | Retry once |

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | JWT access token |
| `Idempotency-Key` | Header | string | No | UUID v4, 36 chars | Deduplication key for write operations |
| `X-Request-ID` | Header | string | No | UUID v4, 36 chars | Distributed tracing correlation ID |
| `reason` | Body | string | Yes (cancel) | Enum (6 values) | Cancellation reason |
| `reason_detail` | Body | string | No | Max 1000 chars | Free-text reason detail |
| `counter_offer_shown` | Body | string | No | Enum (7 values incl. null) | Counter-offer type displayed |
| `counter_offer_accepted` | Body | boolean | No | Default: false | Whether counter-offer was accepted |
| `target_plan` | Body | string | Yes (downgrade) | `LAUNCH` or `GROW` | Target plan for downgrade |

---

## Request/Response Contract Notes

- The `effective_date` returned by `POST /cancel` and `POST /downgrade` is always the merchant's current billing period end date. The frontend must display this date in human-readable format (e.g., "April 15, 2026") — not the raw ISO 8601 string.
- `resource_warnings` in the downgrade response is an array. An empty array `[]` means no resources exceed the target plan limits — the modal should still show the plan change summary.
- The `reason` field in `GET /cancellation-status` returns the enum value only (e.g., `"too_expensive"`) — never the free-text `reason_detail`. Map enum values to display labels on the frontend.
- The modified `GET /merchant/status` is additive — existing consumers that ignore `cancellation_pending` and `cancellation_effective_date` fields are unaffected.

---

## Idempotency and Concurrency Notes

- `POST /cancel`: Idempotent per `Idempotency-Key`. A second call with the same key within 24 hours returns the cached `200` response without re-processing. Without a key, duplicate calls within the same second may result in `409 CANCELLATION_ALREADY_PENDING`.
- `POST /resubscribe`: Idempotent per `Idempotency-Key`. If already resubscribed (state = active), returns `200` with the current active plan.
- `POST /downgrade`: Idempotent per `Idempotency-Key`. If the same downgrade is already scheduled, returns `200` with the existing scheduled downgrade details.
- **Concurrency:** Internal state updates use optimistic locking on the `subscription_cancellations` record. Concurrent cancel + resubscribe requests for the same merchant are serialized at the service layer. The last writer wins is not acceptable — cancellation and resubscription are mutually exclusive transitions.

---

## Security and Privacy Notes

- `reason_detail` (free-text from merchants) is stored in the `subscription_cancellations` collection. It must never be returned in API responses — it is for internal analytics only.
- All write operations (`POST /cancel`, `POST /resubscribe`, `POST /downgrade`) are audit-logged with merchant ID, admin ID (if applicable), action type, timestamp, and request ID.
- Cancellation analytics endpoints (ST-12) are admin-only and are separate from the merchant-facing endpoints documented here.
- Rate limiting protects against abuse of the cancel/resubscribe cycle (e.g., rapidly alternating to probe gateway behavior).

---

## Domain Events and Webhooks

The following internal domain events are emitted as a result of these endpoints. These events are consumed by background jobs, email triggers, and analytics pipelines:

| Event | Trigger | Payload |
|---|---|---|
| `subscription.cancellation_confirmed` | `POST /cancel` succeeds | `{ merchant_id, store_id, plan, effective_date, reason, counter_offer_shown, counter_offer_accepted }` |
| `subscription.cancellation_voided` | `POST /resubscribe` succeeds | `{ merchant_id, store_id, plan, resubscription_date }` |
| `subscription.downgrade_scheduled` | `POST /downgrade` succeeds | `{ merchant_id, store_id, from_plan, to_plan, effective_date, resource_warnings }` |
| `subscription.cancellation_effective` | `cancellation-processor` job runs | `{ merchant_id, store_id, previous_plan }` — consumed by ST-04 (suspend) and ST-08 (win-back) |

---

## SDK and Integration Examples

### JavaScript / Node.js (Fetch)

```javascript
// Cancel a subscription
const cancelSubscription = async (jwt, reason, counterOfferData) => {
  const response = await fetch('https://api.prosperna.com/api/v1/subscription/cancel', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      reason,
      reason_detail: counterOfferData?.reasonDetail ?? null,
      counter_offer_shown: counterOfferData?.shown ?? null,
      counter_offer_accepted: counterOfferData?.accepted ?? false,
    }),
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cancel failed: ${error.error.code} — ${error.error.message}`);
  }

  return response.json();
};

// Check cancellation status on page load
const getCancellationStatus = async (jwt) => {
  const response = await fetch('https://api.prosperna.com/api/v1/subscription/cancellation-status', {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'X-Request-ID': crypto.randomUUID(),
    },
    signal: AbortSignal.timeout(5000),
  });
  return response.json();
};
```

---

## How to Use This API Safely

1. **Initialize UI state on page load.** Call `GET /merchant/status` on dashboard load. If `cancellation_pending: true`, show the persistent cancellation banner and update the billing page UI immediately — do not wait for user interaction.

2. **Gate the cancel button correctly.** Only render "Cancel Subscription" when `plan` is `LAUNCH`, `GROW`, or `SCALE` and `is_suspended: false` and `cancellation_pending: false`. A pending cancellation should show "Resubscribe" instead.

3. **Use `Idempotency-Key` on all write requests.** Generate a UUID v4 at the time the user clicks the confirm button. Store it in component state. If the request times out and you retry, use the SAME key — this prevents double-processing.

4. **Handle 502 gateway errors gracefully.** A `502 GATEWAY_ERROR` on `POST /cancel` means the gateway call failed and the internal state was rolled back. It is safe to show an error and let the merchant try again. The merchant is not in a partial state.

5. **Do not assume `effective_date` matches the next billing date.** While they are usually the same, display the `effective_date` returned from the API — do not compute it client-side from the billing cycle start date.

6. **Respect the `resource_warnings` array before downgrade confirmation.** Call `GET /subscription/cancellation-status?check_downgrade=<target_plan>` (or use the warnings from `POST /downgrade` response) to pre-populate warnings in the confirmation modal.

7. **On `409 CANCELLATION_ALREADY_EFFECTIVE`** (resubscribe endpoint): the billing period has closed. Do not show a resubscription UI — redirect to the plan selection / reactivation path (ST-04).

---

## Change Impact

This endpoint document introduces four new endpoints and modifies one existing endpoint:

| Change | Impact on Existing Consumers |
|---|---|
| `POST /subscription/cancel` (new) | None — new endpoint |
| `POST /subscription/resubscribe` (new) | None — new endpoint |
| `POST /subscription/downgrade` (new) | None — new endpoint |
| `GET /subscription/cancellation-status` (new) | None — new endpoint |
| `GET /merchant/status` (modified — additive) | **Non-breaking.** Two new optional fields added: `cancellation_pending` (boolean) and `cancellation_effective_date` (nullable string). Existing consumers that do not read these fields are unaffected. Consumers who rely on strict JSON schema validation must update their schemas to allow these new fields. |

---

## Open Questions

| ID | Question | Assumption |
|---|---|---|
| OQ-1 | Does Xendit support `cancel_at_period_end` natively, or must it be simulated? | Assumed: if unsupported, the Xendit adapter will immediately deactivate and record access end date independently. Gateway-specific behavior is abstracted behind `PaymentGatewayService`. |
| OQ-2 | Should `GET /subscription/cancellation-status` support a `?check_downgrade=<target_plan>` query param to return projected `resource_warnings` before the merchant submits the downgrade? | Assumed: currently, `resource_warnings` are returned in the `POST /downgrade` response. A pre-check param could improve UX but is deferred unless product requests it. |
| OQ-3 | Is a dedicated admin endpoint needed for `void_cancellation` and `reactivate_account`, or are these actions handled by passing the merchant's `store_id` to the existing endpoints with an admin token? | Assumed: admin operations use the same endpoints with an admin-scoped token and explicit `store_id` in the request. A dedicated admin endpoint is not required. |
| OQ-4 | What is the format and destination for feature request data submitted via the "Missing features" counter-offer? Does it need its own endpoint? | Assumed: `reason_detail` on `POST /cancel` captures this data. No separate endpoint unless the product team requires real-time routing to an external tool. |
