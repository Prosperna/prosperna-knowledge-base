---
id: st-04-suspended-account-state
title: Endpoint Document. ST-04 Suspended Account State
sidebar_label: ST-04 Suspended Account State
sidebar_position: 4
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft
- Subtask ID: ST-04
- Initiative: Prosperna Pricing Restructuring

## Linked Documents
- BRD: BRD-Suspended Account State.md
- PRD: PRD-Suspended Account State.md

---

## Public API Overview

This document describes the API surface introduced and modified by the Suspended Account State feature (ST-04). The feature introduces two new endpoints for suspension status retrieval and merchant reactivation, and modifies three existing endpoints to handle the `SUSPENDED` account state. It also documents middleware behavior and the `mustBeOnPaidPlan` enforcement layer that protects all other API endpoints.

The core principle: suspended merchants are locked out of all API operations except authentication, suspension status retrieval, and reactivation. Every other protected endpoint rejects suspended merchants with HTTP 403.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| **Merchant Dashboard frontend (`prosperna1`)** | Fetch suspension status and reason to populate the lock screen; initiate reactivation after plan selection and payment |
| **Customer Storefront frontend (`p1-customer`)** | Fetch store status to determine whether to render the SuspensionPage or normal store content |
| **Internal background jobs** | Call `suspendMerchant()` and `reactivateMerchant()` indirectly through job logic; monitor audit logs |
| **Admin Control Platform (ST-12)** | Use merchant status and reactivation endpoints for manual override tools |
| **Payment Abstraction Layer (ST-01)** | Trigger suspension on payment failure webhook; trigger reactivation on successful payment |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Production | `https://api.prosperna.com` | Live traffic | mTLS + JWT required |
| Staging | `https://api-staging.prosperna.com` | Pre-release testing | Same auth, isolated data |
| Development | `http://localhost:3000` | Local development | Auth bypass available via `X-Dev-Auth` header |

> All endpoints are prefixed with `/api/v1/` unless otherwise noted.

---

## API Versioning and Compatibility

- Current version: `v1`
- Version is embedded in the URL path: `/api/v1/...`
- Breaking changes require a new version prefix (`/api/v2/...`)
- Non-breaking additions (new optional fields, new enum values) may be applied to the current version with changelog notice
- Clients must tolerate unknown fields in responses (forward compatibility)

---

## Protocol and Data Format Standards

| Standard | Value |
|---|---|
| Protocol | HTTPS (TLS 1.2+) |
| Data format | JSON (`application/json`) |
| Date/time format | ISO 8601 (`2026-03-17T08:00:00.000Z`) |
| IDs | String (MongoDB ObjectId format) |
| Boolean | JSON boolean (`true` / `false`, not `"true"` / `"1"`) |
| Nullable fields | JSON `null` (not empty string `""`) |
| Envelope | `{ "data": {...} }` for success; `{ "error": {...} }` for failure |

---

## Authentication and Authorization

All endpoints (except storefront public routes) require authentication via JWT Bearer token issued by AWS Cognito.

```
Authorization: Bearer <cognito_id_token>
```

**Key rule:** Suspended merchants can still authenticate and receive a valid JWT. Their JWT is not revoked on suspension. The `mustBeOnPaidPlan` middleware — applied at the API layer — is what blocks access to protected endpoints, not the token itself.

**Storefront endpoints** (`GET /api/v1/store/:slug`) do not require authentication — they are public. The `isSuspended` check is performed server-side by the storefront middleware.

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| `SUSPENDED` merchant | `GET /api/v1/suspension/status`, `POST /api/v1/subscription/reactivate`, authentication endpoints, store read | All other endpoints blocked by `mustBeOnPaidPlan` (403) |
| `TRIAL` merchant | All plan-gated endpoints | Subject to trial limits |
| `LAUNCH` / `GROW` / `SCALE` merchant | All plan-gated endpoints | Subject to plan limits |
| Background job (internal service) | Internal call to `suspendMerchant()` / `reactivateMerchant()` | Must use service account credentials; not exposed externally |
| Prosperna Admin | All merchant endpoints (read + write) | Requires admin role claim in JWT |

---

## Ownership and Data Access Rules

- A merchant may only read and write their own store's data.
- `GET /api/v1/suspension/status` is scoped to the authenticated merchant's store — it does not accept a `store_id` parameter that would allow reading another merchant's suspension state.
- `POST /api/v1/subscription/reactivate` is scoped to the authenticated merchant's store.
- Admins may call these endpoints on behalf of any merchant (ST-12 scope).

---

## Request Conventions

- All request bodies must be `application/json`.
- `Content-Type: application/json` header is required on all `POST`/`PUT`/`PATCH` requests.
- IDs must be passed as strings, not numbers.
- Boolean parameters must be JSON booleans (`true`/`false`), not strings.
- Optional parameters may be omitted from the request body entirely.

---

## Response Conventions

**Success envelope:**
```json
{
  "data": { ... }
}
```

**Error envelope:**
```json
{
  "error": {
    "httpStatus": 403,
    "code": "ACCOUNT_SUSPENDED",
    "type": "AUTHORIZATION_ERROR",
    "message": "This account is suspended. Please reactivate to access this feature.",
    "details": [],
    "requestId": "req_abc123",
    "timestamp": "2026-03-17T08:00:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/ACCOUNT_SUSPENDED"
  }
}
```

---

## Global Guard Rails (Consumer Safety)

| Guard Rail | Guidance |
|---|---|
| **Idempotency** | `POST /api/v1/subscription/reactivate` should be retried with the same payment reference if a network timeout occurs. The endpoint is idempotent per payment reference. |
| **Retry on 503** | If you receive a 503 from the storefront API (suspended store), do NOT retry — it is intentional. Respect the `Retry-After` header if present. |
| **Retry on 5xx (server errors)** | Use exponential backoff: 1s, 2s, 4s, 8s — maximum 3 retries. |
| **Do not retry on 4xx** | 400, 403, 404, 409, 422 indicate client-side errors. Fix the request before retrying. |
| **Timeout** | Set a request timeout of 10 seconds. The reactivation endpoint involves payment processing — allow up to 30 seconds for this endpoint specifically. |
| **Token expiry** | JWT tokens expire. If you receive a 401, refresh the token before retrying. |
| **Pagination** | Not applicable to the endpoints in this document. |

---

## Rate Limits and Abuse Controls

| Endpoint | Rate Limit | Bucket | Notes |
|---|---|---|---|
| `GET /api/v1/suspension/status` | 60 req/min per merchant | per-merchant | Polling the lock screen status is fine but cap is enforced |
| `POST /api/v1/subscription/reactivate` | 5 req/min per merchant | per-merchant | Prevent abuse of payment initiation |
| `GET /api/v1/merchant/status` | 120 req/min per merchant | per-merchant | Standard status polling |
| `GET /api/v1/store/:slug` (storefront) | 300 req/min per IP | per-IP | Public endpoint; DDoS protection at CDN level |

Rate limit exceeded responses:
- HTTP 429 Too Many Requests
- Response header: `Retry-After: <seconds>`
- Error code: `RATE_LIMIT_EXCEEDED`

---

## Global Error Model

Use this standard structure for all error responses:

```json
{
  "error": {
    "httpStatus": 403,
    "code": "ACCOUNT_SUSPENDED",
    "type": "AUTHORIZATION_ERROR",
    "message": "This account is suspended. Please reactivate to access this feature.",
    "details": [
      {
        "field": "payPlanType",
        "issue": "invalid_value",
        "expected": "TRIAL | LAUNCH | GROW | SCALE",
        "actual": "SUSPENDED"
      }
    ],
    "requestId": "req_abc123xyz",
    "timestamp": "2026-03-17T08:00:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/ACCOUNT_SUSPENDED"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `GET_SUSPENSION_STATUS` | GET | `/api/v1/suspension/status` | JWT (merchant or admin) | Returns suspension details for the authenticated merchant's account | per-merchant, 60/min | FR-9, FR-13, FR-29 |
| `POST_REACTIVATE` | POST | `/api/v1/subscription/reactivate` | JWT (merchant or admin) | Validates plan selection and initiates payment via PAL; on success, calls reactivateMerchant() | per-merchant, 5/min | FR-14, FR-15, FR-16 |
| `GET_MERCHANT_STATUS` | GET | `/api/v1/merchant/status` | JWT (merchant or admin) | Returns current account status; now includes `'suspended'` as a possible value | per-merchant, 120/min | FR-1, FR-8 |
| `GET_STORE_SLUG` | GET | `/api/v1/store/:slug` | None (public) | Returns store content or suspension data; checks isSuspended first; returns 503 if suspended | per-IP, 300/min | FR-20, FR-23 |
| `POST_ORDER_CREATE` | POST | `/api/v1/orders/create` | JWT (customer or merchant) | Creates a new order; rejects with 403 if store is suspended | per-merchant, varies | FR-30 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. GET Suspension Status

**Operation ID:** `GET_SUSPENSION_STATUS`

**Purpose and when to use:**
Call this endpoint to retrieve the suspension details for the authenticated merchant's account. The Merchant Dashboard lock screen calls this on load to populate the context-specific heading and any other suspension metadata. Do not call this endpoint for active (non-suspended) merchants — it will return an empty suspended state.

**Method:** `GET`
**Path:** `/api/v1/suspension/status`
**Auth:** Bearer JWT (merchant or Prosperna Admin role)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | String | Yes | `Bearer <token>` | Cognito JWT token |

**Request body:** None

**Sample request:**
```bash
curl -X GET https://api.prosperna.com/api/v1/suspension/status \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

**Success response (200) — account is suspended:**
```json
{
  "data": {
    "isSuspended": true,
    "suspendedAt": "2026-03-10T00:00:00.000Z",
    "suspendedReason": "trial_expired",
    "lastActivePlan": "TRIAL",
    "dataRetentionDeadline": "2026-09-10T00:00:00.000Z",
    "availablePlans": [
      {
        "planKey": "LAUNCH",
        "displayName": "Launch",
        "monthlyPriceUsd": 29,
        "limits": {
          "ordersPerMonth": 200,
          "skus": 500,
          "bandwidthGb": 25,
          "storageGb": 10
        },
        "recommended": false
      },
      {
        "planKey": "GROW",
        "displayName": "Grow",
        "monthlyPriceUsd": 59,
        "limits": {
          "ordersPerMonth": 750,
          "skus": 2000,
          "bandwidthGb": 75,
          "storageGb": 30
        },
        "recommended": true
      },
      {
        "planKey": "SCALE",
        "displayName": "Scale",
        "monthlyPriceUsd": 149,
        "limits": {
          "ordersPerMonth": 2500,
          "skus": 10000,
          "bandwidthGb": 150,
          "storageGb": 100
        },
        "recommended": false
      }
    ]
  }
}
```

**Success response (200) — account is NOT suspended:**
```json
{
  "data": {
    "isSuspended": false,
    "suspendedAt": null,
    "suspendedReason": null,
    "lastActivePlan": null,
    "dataRetentionDeadline": null,
    "availablePlans": []
  }
}
```

**Error path table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Refresh token and retry |
| 403 | `FORBIDDEN` | Token is valid but does not have access to this merchant's data | Check that the correct account is authenticated |
| 429 | `RATE_LIMIT_EXCEEDED` | Exceeded 60 req/min | Wait for `Retry-After` value |
| 500 | `INTERNAL_ERROR` | Server error | Retry with exponential backoff (max 3 attempts) |

**Error response example:**
```json
{
  "error": {
    "httpStatus": 401,
    "code": "UNAUTHORIZED",
    "type": "AUTHENTICATION_ERROR",
    "message": "Authentication token is missing or invalid.",
    "details": [],
    "requestId": "req_def456",
    "timestamp": "2026-03-17T08:01:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/UNAUTHORIZED"
  }
}
```

**Guard rails:**
- Cache this response for up to 5 seconds on the client to avoid excessive polling during lock screen render.
- Do not use this endpoint to poll for reactivation completion — poll `GET /api/v1/merchant/status` instead, which updates immediately after `reactivateMerchant()` completes.

---

### 2. POST Reactivate Subscription

**Operation ID:** `POST_REACTIVATE`

**Purpose and when to use:**
Call this endpoint when a suspended merchant has selected a plan and is ready to pay. The endpoint validates the plan selection, routes the payment through the Payment Abstraction Layer (PAL), and on successful payment calls `reactivateMerchant()`. On success, the merchant's account is immediately restored to the selected plan.

**Method:** `POST`
**Path:** `/api/v1/subscription/reactivate`
**Auth:** Bearer JWT (suspended merchant or Prosperna Admin role)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | String | Yes | `Bearer <token>` | Cognito JWT token |
| `Content-Type` | Header | String | Yes | `application/json` | Required for POST body |

**Request body schema:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `planKey` | String | Yes | `LAUNCH` \| `GROW` \| `SCALE` | The plan the merchant is subscribing to |
| `paymentGateway` | String | Yes | `stripe` \| `xendit` | Payment gateway selected by the merchant |
| `paymentReference` | String | Yes | Non-empty string | Payment reference token or ID from the PAL payment flow (Stripe payment intent ID or Xendit payment reference) |

**Full request example:**
```bash
curl -X POST https://api.prosperna.com/api/v1/subscription/reactivate \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "planKey": "GROW",
    "paymentGateway": "stripe",
    "paymentReference": "pi_3Qz1AbCd1234567890"
  }'
```

**Success response (200):**
```json
{
  "data": {
    "reactivated": true,
    "newPlanKey": "GROW",
    "newPlanDisplayName": "Grow",
    "billingCycleStart": "2026-03-17T10:30:00.000Z",
    "billingCycleEnd": "2026-04-17T10:30:00.000Z",
    "storeUrl": "https://myshop.prosperna.com",
    "dashboardRedirectUrl": "/home",
    "mediaRestorationPending": false,
    "message": "Your store is back online!"
  }
}
```

**Success response (200) — cold storage media restoration pending:**
```json
{
  "data": {
    "reactivated": true,
    "newPlanKey": "LAUNCH",
    "newPlanDisplayName": "Launch",
    "billingCycleStart": "2026-03-17T10:30:00.000Z",
    "billingCycleEnd": "2026-04-17T10:30:00.000Z",
    "storeUrl": "https://myshop.prosperna.com",
    "dashboardRedirectUrl": "/home",
    "mediaRestorationPending": true,
    "mediaRestorationMessage": "Some images are being restored and may take up to 24 hours to appear.",
    "message": "Your store is back online!"
  }
}
```

**Error path table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_PLAN` | `planKey` is not one of `LAUNCH`, `GROW`, `SCALE` | Fix the plan key and retry |
| 400 | `INVALID_PAYMENT_GATEWAY` | `paymentGateway` is not `stripe` or `xendit` | Fix the gateway value and retry |
| 400 | `MISSING_PAYMENT_REFERENCE` | `paymentReference` is empty or missing | Ensure PAL flow completes and provides a reference before calling this endpoint |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Refresh token and retry |
| 402 | `PAYMENT_FAILED` | Payment reference invalid or payment declined by PAL | Show error to merchant; allow retry with new payment |
| 403 | `ACCOUNT_NOT_SUSPENDED` | Account is not in `SUSPENDED` state (already active) | Do not call this endpoint for active accounts |
| 409 | `REACTIVATION_IN_PROGRESS` | A reactivation for this account is already being processed | Wait and poll `GET /api/v1/merchant/status` for completion |
| 422 | `PAYMENT_REFERENCE_ALREADY_USED` | The payment reference has already been applied | Idempotency check: if the reference was used successfully, query status; if failed, get a new reference |
| 429 | `RATE_LIMIT_EXCEEDED` | Exceeded 5 req/min | Wait for `Retry-After` value |
| 500 | `INTERNAL_ERROR` | Server error during reactivation | Retry with exponential backoff (max 3 attempts); contact support if persists |

**Error response example (402):**
```json
{
  "error": {
    "httpStatus": 402,
    "code": "PAYMENT_FAILED",
    "type": "PAYMENT_ERROR",
    "message": "Payment was declined. Please check your payment method and try again.",
    "details": [
      {
        "field": "paymentReference",
        "issue": "payment_declined",
        "expected": "valid_completed_payment",
        "actual": "payment_declined_by_gateway"
      }
    ],
    "requestId": "req_ghi789",
    "timestamp": "2026-03-17T08:05:00.000Z",
    "retryable": true,
    "docsUrl": "https://docs.prosperna.com/api/errors/PAYMENT_FAILED"
  }
}
```

**Guard rails:**
- This endpoint is idempotent per `paymentReference`. If a network timeout occurs, retrying with the same `paymentReference` is safe — the server will detect the reference has already been applied and return the success response without double-processing.
- Do not call this endpoint before the PAL payment flow completes. The `paymentReference` must represent a completed (or at least authorized) payment.
- Set a 30-second timeout on this call — it involves payment gateway verification.
- After a successful response, redirect the merchant to `dashboardRedirectUrl` from the response body.

---

### 3. GET Merchant Status (Modified)

**Operation ID:** `GET_MERCHANT_STATUS`

**Purpose and when to use:**
Returns the current account status of the authenticated merchant. This endpoint now returns `'suspended'` as a possible `status` value alongside `'trial'`, `'active'`, and `'deactivated'`. The Merchant Dashboard route guard calls this endpoint (or reads from the store document cache) to determine whether to redirect to `/suspended`.

**Method:** `GET`
**Path:** `/api/v1/merchant/status`
**Auth:** Bearer JWT (merchant or Prosperna Admin role)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | String | Yes | `Bearer <token>` | Cognito JWT token |

**Request body:** None

**Sample request:**
```bash
curl -X GET https://api.prosperna.com/api/v1/merchant/status \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

**Success response (200) — suspended merchant:**
```json
{
  "data": {
    "status": "suspended",
    "payPlanType": "SUSPENDED",
    "isSuspended": true,
    "suspendedReason": "payment_failed",
    "suspendedAt": "2026-03-15T12:00:00.000Z"
  }
}
```

**Success response (200) — active merchant:**
```json
{
  "data": {
    "status": "active",
    "payPlanType": "GROW",
    "isSuspended": false,
    "suspendedReason": null,
    "suspendedAt": null
  }
}
```

**Error path table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Refresh token and retry |
| 429 | `RATE_LIMIT_EXCEEDED` | Exceeded 120 req/min | Wait for `Retry-After` value |
| 500 | `INTERNAL_ERROR` | Server error | Retry with exponential backoff |

**Guard rails:**
- Poll this endpoint after calling `POST /api/v1/subscription/reactivate` to confirm the status has changed from `'suspended'` to `'active'`.
- Do not poll more frequently than once per second. Use a maximum of 10 polling attempts before showing a "taking longer than expected" message.

---

### 4. GET Store by Slug — Storefront (Modified)

**Operation ID:** `GET_STORE_SLUG`

**Purpose and when to use:**
Returns store content for the customer-facing storefront. This endpoint is **modified** by ST-04: it now checks `isSuspended` first. If the store is suspended, it returns HTTP 503 and the suspension data payload (used to render the `SuspensionPage`) instead of normal store content.

**Method:** `GET`
**Path:** `/api/v1/store/:slug`
**Auth:** None (public endpoint)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `slug` | Path | String | Yes | URL-safe store slug | The merchant's unique store slug |

**Request body:** None

**Sample request (active store):**
```bash
curl -X GET https://api.prosperna.com/api/v1/store/myshop
```

**Success response (200) — active store:**
```json
{
  "data": {
    "isSuspended": false,
    "isTemporaryCloseEnabled": false,
    "storeContent": { "...": "normal store data" }
  }
}
```

**Suspension response (503) — suspended store:**

HTTP Status: `503 Service Temporarily Unavailable`
Response headers include:
```
Retry-After: 3600
X-Robots-Tag: noindex, nofollow
```

```json
{
  "data": {
    "isSuspended": true,
    "suspensionPage": {
      "heading": "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT",
      "bodyText": "If you are the owner of this site and believe this is an error, or if you wish to restore service, please contact our billing department or log in to your account to resolve the outstanding balance.",
      "contactSection": {
        "show": true,
        "email": "merchant@example.com",
        "phone": "+63 912 345 6789"
      },
      "footer": "Powered by Prosperna"
    }
  }
}
```

**Suspension response (503) — no contact info:**
```json
{
  "data": {
    "isSuspended": true,
    "suspensionPage": {
      "heading": "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT",
      "bodyText": "If you are the owner of this site and believe this is an error, or if you wish to restore service, please contact our billing department or log in to your account to resolve the outstanding balance.",
      "contactSection": {
        "show": false,
        "email": null,
        "phone": null
      },
      "footer": "Powered by Prosperna"
    }
  }
}
```

**Error path table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `STORE_NOT_FOUND` | No store with this slug exists | Show a standard 404 page |
| 503 | — (see above) | Store is suspended | Render the SuspensionPage using `data.suspensionPage` |
| 429 | `RATE_LIMIT_EXCEEDED` | Exceeded 300 req/min per IP | Wait for `Retry-After` value; implement CDN-level caching |
| 500 | `INTERNAL_ERROR` | Server error | Retry with exponential backoff; show generic error page |

**Guard rails:**
- On a 503 response, do NOT retry automatically. The 503 is intentional and indicates the store is suspended.
- The `Retry-After` header on 503 is set to `3600` (1 hour) — it is advisory; do not poll this endpoint for the store to come back online.
- Implement CDN-level edge caching for active store responses. Do NOT cache 503 suspension responses at the CDN — they must reflect real-time state.

---

### 5. POST Create Order (Modified — Suspension Check)

**Operation ID:** `POST_ORDER_CREATE`

**Purpose and when to use:**
This endpoint now rejects order creation if the target store is in a suspended state. The check is performed server-side even if the storefront is already blocking the checkout UI.

**Method:** `POST`
**Path:** `/api/v1/orders/create`
**Auth:** Bearer JWT (customer or merchant)

**Change from previous behavior:** Suspended store check added. If `isSuspended === true` on the target store, return 403 `STORE_SUSPENDED`.

**Error response for suspended store (403):**
```json
{
  "error": {
    "httpStatus": 403,
    "code": "STORE_SUSPENDED",
    "type": "AUTHORIZATION_ERROR",
    "message": "This store is currently unavailable. No orders can be placed at this time.",
    "details": [],
    "requestId": "req_jkl012",
    "timestamp": "2026-03-17T08:10:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/STORE_SUSPENDED"
  }
}
```

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `planKey` | Body | String | Yes (for reactivate) | `LAUNCH` \| `GROW` \| `SCALE` | Target subscription plan |
| `paymentGateway` | Body | String | Yes (for reactivate) | `stripe` \| `xendit` | Payment gateway for the reactivation charge |
| `paymentReference` | Body | String | Yes (for reactivate) | Non-empty; alphanumeric + underscores | PAL payment reference (Stripe payment intent ID or Xendit ref) |
| `slug` | Path | String | Yes (for store lookup) | URL-safe, lowercase, hyphens allowed | Unique merchant store slug |
| `Authorization` | Header | String | Yes (authenticated endpoints) | `Bearer <jwt>` | Cognito JWT token |

---

## Request/Response Contract Notes

- `suspendedReason` is always one of: `trial_expired`, `cancelled`, `payment_failed`, `migration`. Clients must handle all four values when displaying the lock screen heading.
- `availablePlans` in the suspension status response always contains all three plans (Launch, Grow, Scale) in that order. The `recommended` field is boolean — at most one plan will have `recommended: true`.
- `mediaRestorationPending: true` in the reactivation response means the store is live but media files are being restored asynchronously. Show the restoration message to the merchant.
- The `contactSection.show: false` in the storefront 503 response means both `email` and `phone` are null — the client must suppress the "please contact" section entirely.
- `billingCycleStart` and `billingCycleEnd` in the reactivation response are ISO 8601 timestamps in UTC.

---

## Idempotency and Concurrency Notes

| Endpoint | Idempotency Mechanism | Notes |
|---|---|---|
| `POST /api/v1/subscription/reactivate` | `paymentReference` field | Submitting the same `paymentReference` twice is safe — the second call returns the same success response without re-processing payment or re-firing events |
| `suspendMerchant()` (internal) | `store_id` + `isSuspended` state check | Calling on an already-suspended store is a no-op |
| `reactivateMerchant()` (internal) | `store_id` + `payPlanType` state check | Calling on an already-active store is a no-op |

**Concurrency note:** If a merchant's account is being suspended and reactivated nearly simultaneously (e.g., rapid payment failure + immediate resubscription), the system must ensure the final state reflects the last completed operation. Use optimistic locking or a database-level transaction with version checking on the Store document.

---

## Security and Privacy Notes

| Topic | Note |
|---|---|
| **JWT not revoked on suspension** | Merchant JWT tokens remain valid during suspension. The `mustBeOnPaidPlan` middleware is the enforcement layer — not token revocation. This allows the merchant to reach the lock screen without re-authenticating. |
| **Contact info on suspension page** | The merchant's `store.email` and `store.phone` are surfaced publicly on the SuspensionPage without authentication. Confirm with legal that these fields were consented to be public-facing at account creation. |
| **Payment reference exposure** | The `paymentReference` sent in the reactivation body is a token, not raw payment credentials. Raw card numbers or bank account details must never be sent through this endpoint — they are handled entirely by the PAL (Stripe or Xendit). |
| **Audit logging** | Every suspension and reactivation must be logged with acting entity, timestamp, and state change. Logs are retained for a minimum of 12 months for compliance and dispute resolution. |
| **Rate limiting on reactivation** | 5 req/min on `POST /api/v1/subscription/reactivate` prevents brute-force payment attempts. |

---

## Domain Events and Webhooks

| Event | Payload | Subscriber(s) | Trigger |
|---|---|---|---|
| `merchant.suspended` | `{ store_id, reason, previous_plan, timestamp }` | Analytics, Email Service (ST-14), Admin Dashboard | `suspendMerchant()` completes |
| `merchant.reactivated` | `{ store_id, new_plan, previous_reason, days_suspended, timestamp }` | Analytics, Email Service (ST-14), Admin Dashboard | `reactivateMerchant()` completes |
| `store.suspension_page.viewed` | `{ store_id, url_path, referrer, timestamp }` | Analytics | Customer hits a suspended store URL |
| `media.cold_storage.moved` | `{ store_id, file_count, bytes_moved, timestamp }` | Analytics, Media Service | `media-cold-storage-mover` processes a store |

---

## SDK and Integration Examples

### Checking suspension status and redirecting (JavaScript / TypeScript)
```typescript
async function checkAndRedirectSuspended(authToken: string): Promise<void> {
  const res = await fetch('/api/v1/merchant/status', {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const { data } = await res.json();

  if (data.status === 'suspended') {
    window.location.href = '/suspended';
  }
}
```

### Initiating reactivation after PAL payment completes (JavaScript / TypeScript)
```typescript
async function reactivate(
  authToken: string,
  planKey: 'LAUNCH' | 'GROW' | 'SCALE',
  paymentGateway: 'stripe' | 'xendit',
  paymentReference: string
): Promise<void> {
  const res = await fetch('/api/v1/subscription/reactivate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ planKey, paymentGateway, paymentReference })
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error.message);
  }

  const { data } = await res.json();

  if (data.mediaRestorationPending) {
    showBanner(data.mediaRestorationMessage);
  }

  window.location.href = data.dashboardRedirectUrl;
}
```

### Storefront middleware (Node.js / Express pattern)
```javascript
async function storefrontMiddleware(req, res, next) {
  const store = await getStoreBySlug(req.params.slug);

  if (!store) {
    return res.status(404).render('not-found');
  }

  if (store.isSuspended) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Retry-After', '3600');
    return res.status(503).json({
      data: {
        isSuspended: true,
        suspensionPage: buildSuspensionPagePayload(store)
      }
    });
  }

  if (store.isTemporaryCloseEnabled) {
    return res.render('store-closed');
  }

  next();
}
```

---

## How to Use This API Safely

1. **Always check merchant status before rendering dashboard routes.** The route guard in `prosperna1` must call `GET /api/v1/merchant/status` (or read from the JWT claims) and redirect to `/suspended` if status is `'suspended'`.

2. **Never assume a 200 from the storefront API means the store is live.** Check `data.isSuspended` in the response body. A 200 with `isSuspended: true` should not happen (the endpoint should return 503), but defensive checks are good practice.

3. **Use the `paymentReference` for idempotency.** If the reactivation call times out, retry with the same reference — do not start a new payment flow.

4. **Do not cache suspension state for more than 5 seconds.** Suspension and reactivation happen in real time. Stale cache can show a live store to customers when it should show the suspension page, or vice versa.

5. **Handle all four `suspendedReason` values.** New values will not be added without a version bump, but always implement a fallback for unknown values.

6. **Respect the `Retry-After` header on 503 responses.** Do not aggressively retry suspended store requests — the state will not change until the merchant reactivates.

---

## Change Impact

| Component | Change Type | Impact |
|---|---|---|
| `Store.model.ts` | Additive — new fields | Low risk; new nullable fields with safe defaults |
| `payPlanType` enum | Additive — new value `SUSPENDED` | Clients must handle the new value; no existing values changed |
| `mustBeOnPaidPlan` middleware | Restrictive — blocks `SUSPENDED` | Existing active merchants unaffected; only `SUSPENDED` accounts are blocked |
| `GET /api/v1/merchant/status` | Additive — new possible `status` value | Clients must handle `'suspended'`; existing values unchanged |
| `GET /api/v1/store/:slug` | Conditional — new 503 response path | Clients that assumed this endpoint only returns 200 must handle 503 |
| `POST /api/v1/orders/create` | Restrictive — new 403 path | Only affects order creation on suspended stores; active stores unaffected |

---

## Open Questions

| ID | Question | Owner | Status |
|---|---|---|---|
| OQ-01 | Should `GET /api/v1/suspension/status` be accessible by the customer storefront (unauthenticated), or only by authenticated merchants? Currently defined as authenticated-only — storefront uses `GET /api/v1/store/:slug` instead. | Engineering | Open |
| OQ-02 | What is the `Retry-After` value to return on 503 suspension responses? Currently proposed as `3600` (1 hour). Should it be dynamic based on how recently suspended? | Engineering / Product | Open |
| OQ-03 | Should `merchant.suspended` and `merchant.reactivated` events be exposed as webhooks to 3rd-party integrators, or internal-only? | Platform / Product | Open |
| OQ-04 | Does the reactivation endpoint need to support annual billing as a plan option, or monthly only? Current spec is monthly only. | Product | Open |
