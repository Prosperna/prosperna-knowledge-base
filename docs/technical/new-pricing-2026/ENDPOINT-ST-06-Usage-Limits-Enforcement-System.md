---
id: st-06-usage-limits-enforcement-system
title: Endpoint Document. ST-06 Usage Limits & Enforcement System
sidebar_label: ST-06 Usage Limits & Enforcement System
sidebar_position: 6
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-18
- Status: Draft
- Feature Slug: usage-limits-enforcement
- Parent Initiative: Prosperna Pricing Restructuring (v3)
- Subtask ID: ST-06

## Linked Documents
- BRD: BRD-Usage-Limits-Enforcement-System.md
- PRD: PRD-Usage-Limits-Enforcement-System.md

---

## Public API Overview

The Usage Limits & Enforcement API provides endpoints for merchants to view their real-time resource consumption and act on enforcement states (upgrade plan, accept overage charges), and for Prosperna administrators to monitor, manage, and override enforcement states across all merchants.

This document covers all 5 HTTP endpoints introduced by ST-06:

| Surface | Operation | Endpoint |
|---|---|---|
| Merchant | Get current usage and enforcement state | `GET /api/v1/usage` |
| Merchant | Upgrade to a higher plan | `POST /api/v1/upgrade` |
| Merchant | Accept overage charges for current period | `POST /api/v1/overage/accept` |
| Admin | Get enforcement state for a specific merchant | `GET /admin/api/v1/merchants/:id/enforcement` |
| Admin | Manually reset merchant usage and enforcement state | `POST /admin/api/v1/merchants/:id/reset-limits` |
| Admin | Get enforcement summary dashboard data | `GET /admin/api/v1/enforcement/dashboard` |

---

## Audience and Use Cases

| Consumer | Use Case |
|---|---|
| **Merchant Dashboard (ST-11)** | Fetches usage data to render the Usage Dashboard page, enforcement banners, and estimated date-to-limit. |
| **Upgrade Flow UI (ST-11)** | Submits plan upgrade request and reads confirmation to update banner/badge state. |
| **Overage Acceptance UI (ST-11)** | Submits overage acceptance and reads estimated charges for display. |
| **Admin Platform (ST-12)** | Reads enforcement states across all merchants for dashboard; calls reset/override endpoints. |
| **Background Jobs (ST-15)** | `usage-threshold-checker` writes enforcement state; these endpoints serve reads. |
| **Mobile / Future Integrations** | Any future mobile app reading merchant usage state. |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Production | `https://api.prosperna.com` | Live merchant and admin traffic | Full rate limits apply |
| Staging | `https://api-staging.prosperna.com` | Pre-release testing | Rate limits relaxed |
| Development | `https://api-dev.prosperna.com` | Internal dev testing | No rate limits; mock payment gateway |

---

## API Versioning and Compatibility

- Current version: **v1** (path prefix: `/api/v1/` for merchant, `/admin/api/v1/` for admin).
- Breaking changes increment the version (`/api/v2/`). Non-breaking additions are backwards compatible.
- Deprecated endpoints are supported for a minimum of 6 months after deprecation notice.
- Version header optional: `API-Version: 1`. When omitted, the latest stable version is used.

---

## Protocol and Data Format Standards

- Transport: HTTPS only. HTTP is rejected with `301 Moved Permanently`.
- Data format: JSON. All request bodies and response bodies are `application/json`.
- Date/time: ISO 8601 with UTC timezone (`2026-03-18T00:00:00Z`).
- Currency: All monetary values are in USD as decimal numbers (e.g., `15.00`).
- Boolean: JSON `true` / `false`.
- Null fields: Omitted when null unless semantically significant.

---

## Authentication and Authorization

| Endpoint Group | Auth Method | Token Source |
|---|---|---|
| Merchant endpoints (`/api/v1/*`) | Bearer token (JWT) | Issued at merchant login via Prosperna Auth service |
| Admin endpoints (`/admin/api/v1/*`) | Bearer token (JWT) + Admin role claim | Issued at admin login; requires `role: admin` claim in JWT |

**Request header for all endpoints:**
```
Authorization: Bearer <jwt_token>
```

Tokens expire after 1 hour. Use the Auth service refresh endpoint to renew.

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| Authenticated Merchant | `GET /api/v1/usage`, `POST /api/v1/upgrade`, `POST /api/v1/overage/accept` | Can only access their own merchant record (enforced by JWT subject claim) |
| Prosperna Admin | All `/admin/api/v1/*` endpoints | Can access any merchant's enforcement data; cannot modify subscription billing (ST-01) |
| Unauthenticated | None | All endpoints return `401 Unauthorized` |

---

## Ownership and Data Access Rules

- A merchant JWT identifies the authenticated merchant via the `sub` (subject) claim. All merchant endpoints automatically scope data to that merchant. Merchants cannot query other merchants' usage data.
- Admin endpoints require an `admin` role claim in the JWT. The `:id` path parameter specifies the target merchant.
- Enforcement event logs are immutable — no endpoint exposes a DELETE or UPDATE on `enforcement_event_log`.

---

## Request Conventions

- All request bodies must include `Content-Type: application/json`.
- Path parameters are URL-encoded.
- Optional query parameters are documented per endpoint.
- Idempotency key header (`Idempotency-Key: <uuid>`) is required for all `POST` endpoints to prevent duplicate actions on network retry.

---

## Response Conventions

- Success responses: `200 OK` for reads, `200 OK` or `201 Created` for writes (documented per endpoint).
- All responses include: `Content-Type: application/json`.
- All responses include a `requestId` field in the top-level body for tracing.
- Empty collections return `{ "data": [], "requestId": "..." }` — not 404.
- Pagination: Endpoints that return collections use cursor-based pagination with `nextCursor` and `limit` fields.

---

## Global Guard Rails (Consumer Safety)

1. **Always set a request timeout**: 10 seconds recommended for read endpoints; 30 seconds for write endpoints (upgrade involves payment processing).
2. **Retry on `503 Service Unavailable` and `429 Too Many Requests`**: Use exponential backoff starting at 1 second, max 3 retries.
3. **Do NOT retry on `4xx` errors** (except 429): These indicate client-side issues that won't resolve on retry.
4. **Use Idempotency-Key on all `POST` requests**: Prevents duplicate upgrades or double-acceptance of overages.
5. **Cache the `GET /api/v1/usage` response** for up to 30 seconds in the merchant dashboard. Do not poll more frequently than every 30 seconds.
6. **Handle `overage_accepted: false` defensively**: Always check the current enforcement state before showing the accept overages CTA.

---

## Rate Limits and Abuse Controls

| Endpoint | Rate Limit | Window | Bucket Key |
|---|---|---|---|
| `GET /api/v1/usage` | 60 requests | Per minute | Per merchant |
| `POST /api/v1/upgrade` | 5 requests | Per hour | Per merchant |
| `POST /api/v1/overage/accept` | 10 requests | Per hour | Per merchant |
| `GET /admin/api/v1/merchants/:id/enforcement` | 120 requests | Per minute | Per admin |
| `POST /admin/api/v1/merchants/:id/reset-limits` | 10 requests | Per hour | Per admin |
| `GET /admin/api/v1/enforcement/dashboard` | 30 requests | Per minute | Per admin |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1742300400
```

---

## Global Error Model

All error responses use this structure:

```json
{
  "error": {
    "httpStatus": 422,
    "code": "USAGE_LIMIT_EXCEEDED",
    "type": "business_rule_violation",
    "message": "You've reached your plan's 200 order limit.",
    "details": [
      {
        "field": "orders_count",
        "issue": "limit_exceeded",
        "expected": "≤ 200",
        "actual": "200"
      }
    ],
    "requestId": "req_01HV9XM4N5ZTPQW8FRKE3N6JP",
    "timestamp": "2026-03-18T12:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/usage-limits"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `GetMerchantUsage` | GET | `/api/v1/usage` | Merchant JWT | Real-time usage, limits, percentages, enforcement state | merchant-read | FR-1, FR-2, FR-4 |
| `UpgradePlan` | POST | `/api/v1/upgrade` | Merchant JWT | Upgrade plan with prorated charge | merchant-write | FR-6 |
| `AcceptOverages` | POST | `/api/v1/overage/accept` | Merchant JWT | Accept overage charges for current billing period | merchant-write | FR-7 |
| `GetAdminMerchantEnforcement` | GET | `/admin/api/v1/merchants/:id/enforcement` | Admin JWT | Enforcement state + history for a specific merchant | admin-read | FR-12 |
| `AdminResetLimits` | POST | `/admin/api/v1/merchants/:id/reset-limits` | Admin JWT | Manually reset usage counters and enforcement state | admin-write | FR-12 |
| `GetAdminEnforcementDashboard` | GET | `/admin/api/v1/enforcement/dashboard` | Admin JWT | Summary of all merchants by enforcement stage | admin-read | FR-12 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. GetMerchantUsage

**Operation ID:** `GetMerchantUsage`
**Purpose:** Returns the authenticated merchant's real-time resource usage, plan limits, enforcement state, and estimated date to limit for all tracked resources. Used by the merchant dashboard to render the Usage Dashboard page and enforcement banners.

**Method / Path:** `GET /api/v1/usage`

**Auth:** Bearer JWT (merchant). Merchant identity resolved from JWT `sub` claim.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Merchant JWT |
| `Idempotency-Key` | Header | string | No | UUID v4 | Not required for GET |

**Request Body:** None

**Request Example:**
```bash
curl -X GET https://api.prosperna.com/api/v1/usage \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Accept: application/json"
```

**Success Response (200 OK):**
```json
{
  "requestId": "req_01HV9XM4N5ZTPQW8FRKE3N6JP",
  "merchant": {
    "id": 12345,
    "plan": "grow",
    "planDisplayName": "Grow",
    "planPriceUsd": 59.00
  },
  "billingPeriod": {
    "start": "2026-03-01T00:00:00Z",
    "end": "2026-04-01T00:00:00Z",
    "daysRemaining": 14
  },
  "enforcementState": {
    "status": "warning",
    "activeResource": "orders_month",
    "gracePeriodExpiresAt": null,
    "overageAccepted": false,
    "overageAcceptanceDate": null
  },
  "resources": [
    {
      "resourceType": "orders_month",
      "displayName": "Orders This Month",
      "current": 612,
      "limit": 750,
      "percentageUsed": 81.6,
      "remaining": 138,
      "status": "warning",
      "resetAt": "2026-04-01T00:00:00Z",
      "estimatedLimitDate": "2026-03-26T00:00:00Z"
    },
    {
      "resourceType": "orders_year",
      "displayName": "Orders This Year",
      "current": 4820,
      "limit": 9000,
      "percentageUsed": 53.6,
      "remaining": 4180,
      "status": "normal",
      "resetAt": "2026-12-01T00:00:00Z",
      "estimatedLimitDate": null
    },
    {
      "resourceType": "sales_volume_year_usd",
      "displayName": "Sales Volume This Year (USD)",
      "current": 54200.00,
      "limit": 110000.00,
      "percentageUsed": 49.3,
      "remaining": 55800.00,
      "status": "normal",
      "resetAt": "2026-12-01T00:00:00Z",
      "estimatedLimitDate": null
    },
    {
      "resourceType": "bandwidth_month_gb",
      "displayName": "Bandwidth This Month",
      "current": 42.5,
      "limit": 75.0,
      "percentageUsed": 56.7,
      "remaining": 32.5,
      "status": "normal",
      "resetAt": "2026-04-01T00:00:00Z",
      "estimatedLimitDate": null
    },
    {
      "resourceType": "storage_gb",
      "displayName": "Storage Used",
      "current": 18.2,
      "limit": 30.0,
      "percentageUsed": 60.7,
      "remaining": 11.8,
      "status": "normal",
      "resetAt": null,
      "estimatedLimitDate": null
    },
    {
      "resourceType": "product_skus",
      "displayName": "Product SKUs",
      "current": 1240,
      "limit": 2000,
      "percentageUsed": 62.0,
      "remaining": 760,
      "status": "normal",
      "resetAt": null,
      "estimatedLimitDate": null
    }
  ],
  "nextPlanComparison": {
    "planName": "Scale",
    "planDisplayName": "Scale",
    "planPriceUsd": 149.00,
    "ordersMonthLimit": 2500,
    "currentOrdersAsPercentOfNextPlan": 24.5
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate and retry |
| 403 | `FORBIDDEN` | JWT does not have merchant scope | Use correct merchant credentials |
| 429 | `RATE_LIMIT_EXCEEDED` | > 60 requests/min | Back off, retry after `X-RateLimit-Reset` |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry with exponential backoff; report if persistent |
| 503 | `SERVICE_UNAVAILABLE` | Downstream dependency down | Retry with exponential backoff |

**Error Response Example (401):**
```json
{
  "error": {
    "httpStatus": 401,
    "code": "UNAUTHORIZED",
    "type": "authentication_error",
    "message": "Invalid or expired JWT token.",
    "details": [],
    "requestId": "req_01HV9AB2C3DEFGH4IJKLMN5OP",
    "timestamp": "2026-03-18T12:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/authentication"
  }
}
```

**Guard Rails:**
- Cache this response for up to 30 seconds. Do not poll more frequently.
- `estimatedLimitDate` is null if there is insufficient daily usage history (< 7 days) or if the resource is below 50% usage.
- `resetAt` is null for cumulative resources (storage, SKUs) that do not reset.
- `status` per resource is one of: `normal`, `warning`, `urgent`, `grace_period_active`, `throttled`, `blocked`.

---

### 2. UpgradePlan

**Operation ID:** `UpgradePlan`
**Purpose:** Initiates a plan upgrade for the authenticated merchant. Calculates a prorated charge for the remaining billing period, processes payment via the Payment Abstraction Layer, instantly activates the new plan limits, clears enforcement state, and forgives current-period overages.

**Method / Path:** `POST /api/v1/upgrade`

**Auth:** Bearer JWT (merchant).

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Merchant JWT |
| `Idempotency-Key` | Header | string | Yes | UUID v4 | Prevents duplicate upgrades on retry |

**Request Body Schema:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `targetPlan` | string | Yes | `"grow"` or `"scale"` | The plan to upgrade to |
| `paymentMethodId` | string | Yes | Non-empty string | Payment method ID from the Payment Abstraction Layer |
| `confirmedProratedChargeUsd` | number | Yes | ≥ 0 | Client-confirmed prorated charge. Server validates this matches the server-calculated amount (±$0.01 tolerance). |

**Full Request Example:**
```bash
curl -X POST https://api.prosperna.com/api/v1/upgrade \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "targetPlan": "grow",
    "paymentMethodId": "pm_1OqxLKJH7hLrXXXX",
    "confirmedProratedChargeUsd": 15.00
  }'
```

**Success Response (200 OK):**
```json
{
  "requestId": "req_01HV9XM4N5ZTPQW8FRKE3N6JP",
  "success": true,
  "upgrade": {
    "fromPlan": "launch",
    "toPlan": "grow",
    "proratedChargeUsd": 15.00,
    "paymentConfirmationId": "ch_1OqxLKJH7hLrXXXX",
    "activatedAt": "2026-03-18T12:05:00Z",
    "overagesForgivenUsd": 2.40,
    "newLimits": {
      "ordersMonth": 750,
      "ordersYear": 9000,
      "salesVolumeYearUsd": 110000.00,
      "bandwidthMonthGb": 75,
      "storageGb": 30,
      "maxFileSizeMb": 10,
      "productSkus": 2000
    }
  },
  "enforcementState": {
    "status": "normal",
    "clearedAt": "2026-03-18T12:05:00Z"
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_TARGET_PLAN` | `targetPlan` is not a valid upgrade (e.g., downgrade, same plan, or invalid value) | Show error to merchant; prompt re-selection |
| 400 | `PRORATED_CHARGE_MISMATCH` | Client-provided `confirmedProratedChargeUsd` does not match server-calculated amount | Re-fetch the calculated amount and prompt re-confirmation |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 409 | `DUPLICATE_REQUEST` | Same `Idempotency-Key` was already processed successfully | Return the original response (idempotent success) |
| 422 | `PAYMENT_FAILED` | Payment Abstraction Layer rejected the payment | Show payment failure message; do not change plan |
| 429 | `RATE_LIMIT_EXCEEDED` | > 5 upgrade attempts/hour | Tell merchant to wait and try again |
| 500 | `INTERNAL_ERROR` | Server error during upgrade | Retry once; report if persistent |

**Error Response Example (422 Payment Failed):**
```json
{
  "error": {
    "httpStatus": 422,
    "code": "PAYMENT_FAILED",
    "type": "payment_error",
    "message": "Payment failed. Your plan was not changed. Please try again.",
    "details": [
      {
        "field": "paymentMethodId",
        "issue": "payment_declined",
        "expected": "successful_charge",
        "actual": "card_declined"
      }
    ],
    "requestId": "req_01HV9ABXXX",
    "timestamp": "2026-03-18T12:05:00Z",
    "retryable": true,
    "docsUrl": "https://docs.prosperna.com/api/upgrade"
  }
}
```

**Guard Rails:**
- Always include `Idempotency-Key` to prevent double charges on network retries.
- The server re-calculates the prorated charge. The `confirmedProratedChargeUsd` in the request is the client's confirmation that they saw and accepted the amount. Server returns `400 PRORATED_CHARGE_MISMATCH` if they differ by more than $0.01 (protects against race conditions where the billing period rolled over between "confirm" and "submit").
- Set timeout to 30 seconds — payment processing may take up to 10 seconds.
- On `200 OK`, the `activatedAt` field confirms the exact moment the new limits took effect.

---

### 3. AcceptOverages

**Operation ID:** `AcceptOverages`
**Purpose:** Records the authenticated merchant's acceptance of overage charges for the current billing period. After acceptance, orders and other resources process normally regardless of how far over the plan limit the merchant goes. Overages are billed as a lump sum at end of period.

**Method / Path:** `POST /api/v1/overage/accept`

**Auth:** Bearer JWT (merchant).

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Merchant JWT |
| `Idempotency-Key` | Header | string | Yes | UUID v4 | Prevents double-acceptance |

**Request Body Schema:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `confirmedEstimatedOverageUsd` | number | Yes | ≥ 0 | Client-confirmed estimated overage amount. Server validates within 10% tolerance (estimate may change as usage grows). |
| `billingPeriodStart` | string | Yes | ISO 8601 date | Must match the current billing period start date. Prevents accepting overages for a wrong period. |

**Full Request Example:**
```bash
curl -X POST https://api.prosperna.com/api/v1/overage/accept \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 7a1b2c3d-4e5f-6789-abcd-ef0123456789" \
  -d '{
    "confirmedEstimatedOverageUsd": 2.40,
    "billingPeriodStart": "2026-03-01T00:00:00Z"
  }'
```

**Success Response (200 OK):**
```json
{
  "requestId": "req_01HV9YZ1234567890ABCDEFGH",
  "success": true,
  "overageAcceptance": {
    "acceptedAt": "2026-03-18T12:10:00Z",
    "billingPeriodStart": "2026-03-01T00:00:00Z",
    "billingPeriodEnd": "2026-04-01T00:00:00Z",
    "estimatedOverageUsd": 2.40,
    "overageRates": {
      "perOrderOverLimit": 0.20,
      "perGbBandwidthOverLimit": 0.20,
      "perGbStorageOverLimit": 0.50
    },
    "message": "Overage charges accepted. Orders will process normally. You'll be billed for excess usage at the end of your billing period.",
    "autoRenews": false
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `OVERAGE_NOT_AVAILABLE` | Merchant is below 100% on all resources (overage acceptance not available below 100%) | Do not show the CTA; re-check enforcement state |
| 400 | `BILLING_PERIOD_MISMATCH` | `billingPeriodStart` does not match current period | Re-fetch usage data and resubmit |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 409 | `ALREADY_ACCEPTED` | Overage already accepted for this billing period | Return current acceptance state; no duplicate action needed |
| 409 | `DUPLICATE_REQUEST` | Same `Idempotency-Key` already processed | Return original response (idempotent) |
| 429 | `RATE_LIMIT_EXCEEDED` | > 10 attempts/hour | Retry after `X-RateLimit-Reset` |
| 500 | `INTERNAL_ERROR` | Server error | Retry once |

**Guard Rails:**
- The estimated overage shown to the merchant is a snapshot estimate. Actual billing at period end will reflect true usage. `confirmedEstimatedOverageUsd` is just the client's acknowledgment they saw the estimate.
- Overage acceptance does not auto-renew (`"autoRenews": false`). Each billing period requires explicit acceptance.
- After a `409 ALREADY_ACCEPTED`, re-fetch `GET /api/v1/usage` to confirm `overage_accepted: true` and update UI accordingly.
- Only show the Accept Overages CTA when `enforcementState.status` is `grace_period_active`, `throttled`, or `blocked`.

---

### 4. GetAdminMerchantEnforcement

**Operation ID:** `GetAdminMerchantEnforcement`
**Purpose:** Returns the full enforcement state and recent enforcement event history for a specific merchant. Used by admin platform for merchant detail view.

**Method / Path:** `GET /admin/api/v1/merchants/:id/enforcement`

**Auth:** Bearer JWT with `role: admin` claim.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `id` | Path | integer | Yes | > 0 | Merchant ID |
| `Authorization` | Header | string | Yes | Admin JWT | Admin JWT with `role: admin` claim |
| `historyLimit` | Query | integer | No | Default: 50, Max: 200 | Number of enforcement events to return |
| `historyOffset` | Query | integer | No | Default: 0 | Offset for pagination |

**Request Example:**
```bash
curl -X GET "https://api.prosperna.com/admin/api/v1/merchants/12345/enforcement?historyLimit=20" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Accept: application/json"
```

**Success Response (200 OK):**
```json
{
  "requestId": "req_01HVADMIN1234567890ABCDEF",
  "merchant": {
    "id": 12345,
    "storeName": "Sample Store",
    "plan": "launch",
    "planDisplayName": "Launch"
  },
  "currentEnforcementState": {
    "status": "grace_period_active",
    "warningResource": "orders_month",
    "warningSentAt": "2026-03-10T08:00:00Z",
    "warningPercentage": 81.2,
    "urgentResource": "orders_month",
    "urgentSentAt": "2026-03-14T14:30:00Z",
    "urgentPercentage": 95.5,
    "gracePeriodStartedAt": "2026-03-17T09:00:00Z",
    "gracePeriodHours": 48,
    "graceExpiresAt": "2026-03-19T09:00:00Z",
    "graceResource": "orders_month",
    "graceReminderSentCount": 1,
    "overageAccepted": false,
    "lastResetAt": "2026-03-01T00:00:00Z"
  },
  "currentUsage": {
    "ordersCount": 201,
    "ordersLimit": 200,
    "bandwidthGb": 14.2,
    "bandwidthLimitGb": 25,
    "storageGb": 6.8,
    "storageLimitGb": 10,
    "productSkuCount": 312,
    "productSkuLimit": 500,
    "billingPeriodStart": "2026-03-01T00:00:00Z",
    "billingPeriodEnd": "2026-04-01T00:00:00Z"
  },
  "enforcementHistory": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "events": [
      {
        "id": 9876,
        "eventType": "grace_started",
        "resourceType": "orders_month",
        "usageCount": 200,
        "usageLimit": 200,
        "usagePercentage": 100.0,
        "metadata": { "gracePeriodHours": 48 },
        "createdAt": "2026-03-17T09:00:00Z"
      },
      {
        "id": 9875,
        "eventType": "urgent",
        "resourceType": "orders_month",
        "usageCount": 191,
        "usageLimit": 200,
        "usagePercentage": 95.5,
        "metadata": {},
        "createdAt": "2026-03-14T14:30:00Z"
      }
    ]
  },
  "adminActions": {
    "canResetLimits": true,
    "canExtendGrace": true,
    "graceExtendableHours": 72
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 403 | `FORBIDDEN` | JWT does not have `role: admin` claim | Use admin credentials |
| 404 | `MERCHANT_NOT_FOUND` | No merchant with given `:id` | Verify merchant ID |
| 429 | `RATE_LIMIT_EXCEEDED` | > 120 requests/min | Back off and retry |
| 500 | `INTERNAL_ERROR` | Server error | Retry with backoff |

**Guard Rails:**
- Use `historyLimit` and `historyOffset` to paginate large enforcement histories.
- `graceExpiresAt` is null if no grace period is active.
- `adminActions.canExtendGrace` is false if no grace period is active.

---

### 5. AdminResetLimits

**Operation ID:** `AdminResetLimits`
**Purpose:** Allows a Prosperna admin to manually reset a merchant's usage counters and enforcement state. Used for billing errors, data corrections, or merchant support scenarios. All reset actions are immutably logged.

**Method / Path:** `POST /admin/api/v1/merchants/:id/reset-limits`

**Auth:** Bearer JWT with `role: admin` claim.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `id` | Path | integer | Yes | > 0 | Merchant ID |
| `Authorization` | Header | string | Yes | Admin JWT | Admin JWT with `role: admin` claim |
| `Idempotency-Key` | Header | string | Yes | UUID v4 | Prevents duplicate resets |

**Request Body Schema:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `resetType` | string | Yes | `"full"` or `"enforcement_only"` | `full` resets usage counters + enforcement state. `enforcement_only` clears only enforcement flags (use for support goodwill without changing usage counts). |
| `reason` | string | Yes | 10–500 characters | Mandatory reason for audit log. |
| `extendGracePeriodHours` | integer | No | 1–168 (1 week max) | If provided and a grace period is active, extends it by this many hours instead of resetting. |

**Full Request Example:**
```bash
curl -X POST https://api.prosperna.com/admin/api/v1/merchants/12345/reset-limits \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: d4e5f6a7-b8c9-0123-def4-567890abcdef" \
  -d '{
    "resetType": "full",
    "reason": "Platform outage from 2026-03-17 00:00-06:00 incorrectly counted 45 orders due to a processing bug. Orders are being reversed."
  }'
```

**Success Response (200 OK):**
```json
{
  "requestId": "req_01HVADMIN9876543210FEDCBA",
  "success": true,
  "reset": {
    "merchantId": 12345,
    "resetType": "full",
    "performedAt": "2026-03-18T13:00:00Z",
    "performedByAdminId": 99,
    "reason": "Platform outage from 2026-03-17 00:00-06:00 incorrectly counted 45 orders due to a processing bug.",
    "previousState": {
      "ordersCount": 201,
      "status": "grace_period_active"
    },
    "newState": {
      "ordersCount": 0,
      "status": "normal"
    },
    "eventLogId": 10001
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_RESET_TYPE` | `resetType` not `full` or `enforcement_only` | Fix request body |
| 400 | `REASON_TOO_SHORT` | `reason` is under 10 characters | Provide a meaningful reason |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 403 | `FORBIDDEN` | JWT does not have `role: admin` claim | Use admin credentials |
| 404 | `MERCHANT_NOT_FOUND` | No merchant with given `:id` | Verify merchant ID |
| 409 | `DUPLICATE_REQUEST` | Same `Idempotency-Key` already processed | Return original response |
| 429 | `RATE_LIMIT_EXCEEDED` | > 10 resets/hour per admin | Slow down; verify need |
| 500 | `INTERNAL_ERROR` | Server error | Retry once |

**Guard Rails:**
- Always include `Idempotency-Key` to prevent duplicate resets in case of network failure.
- `reason` is mandatory and immutably stored in `enforcement_event_log`. It will be visible in audit reviews.
- `enforcement_only` is the safer option for goodwill support scenarios — it clears enforcement flags without altering usage data.
- After reset, re-fetch merchant enforcement state to confirm the new state before closing the support ticket.

---

### 6. GetAdminEnforcementDashboard

**Operation ID:** `GetAdminEnforcementDashboard`
**Purpose:** Returns a summary of all merchants by enforcement stage plus a paginated merchant detail table. Used by the admin platform's Enforcement Dashboard page (`/admin/enforcement-dashboard`).

**Method / Path:** `GET /admin/api/v1/enforcement/dashboard`

**Auth:** Bearer JWT with `role: admin` claim.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | Admin JWT | Admin JWT |
| `status` | Query | string | No | `normal`, `warning`, `urgent`, `grace_period_active`, `throttled`, `blocked`, or omit for all | Filter by enforcement status |
| `plan` | Query | string | No | `launch`, `grow`, `scale`, `trial` | Filter by plan |
| `limit` | Query | integer | No | Default: 50, Max: 200 | Page size |
| `cursor` | Query | string | No | Cursor token | Cursor for next page (from previous response) |

**Request Example:**
```bash
curl -X GET "https://api.prosperna.com/admin/api/v1/enforcement/dashboard?status=grace_period_active&limit=25" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Accept: application/json"
```

**Success Response (200 OK):**
```json
{
  "requestId": "req_01HVADMINDASH1234567890AB",
  "summary": {
    "totalActiveMerchants": 1840,
    "byStage": {
      "normal": 1612,
      "warning": 142,
      "urgent": 58,
      "grace_period_active": 19,
      "throttled": 7,
      "blocked": 2
    }
  },
  "merchants": {
    "total": 19,
    "limit": 25,
    "nextCursor": null,
    "items": [
      {
        "merchantId": 12345,
        "storeName": "Sample Store",
        "plan": "launch",
        "status": "grace_period_active",
        "triggerResource": "orders_month",
        "usageCount": 201,
        "usageLimit": 200,
        "usagePercentage": 100.5,
        "graceExpiresAt": "2026-03-19T09:00:00Z",
        "graceHoursRemaining": 21.0,
        "lastContactedAt": "2026-03-18T09:00:00Z",
        "overageAccepted": false
      }
    ]
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 403 | `FORBIDDEN` | JWT lacks `role: admin` | Use admin credentials |
| 400 | `INVALID_STATUS_FILTER` | `status` query param is not a valid stage | Fix query parameter |
| 429 | `RATE_LIMIT_EXCEEDED` | > 30 requests/min | Back off |
| 500 | `INTERNAL_ERROR` | Server error | Retry with backoff |

**Guard Rails:**
- `summary.byStage` is always returned regardless of filter. The `merchants.items` array is filtered by the query params, but the summary counts reflect all merchants.
- Use cursor-based pagination via the `nextCursor` token. When `nextCursor` is null, there are no more pages.
- Cache the summary counts for up to 60 seconds. Do not poll more than once per minute.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes on all endpoints | `Bearer <jwt>` | JWT for authentication |
| `Idempotency-Key` | Header | string | Yes on all POST endpoints | UUID v4 | Prevents duplicate operations on retry |
| `Content-Type` | Header | string | Yes on POST with body | `application/json` | Body format indicator |
| `targetPlan` | Body | string | Yes (UpgradePlan) | `"grow"` or `"scale"` | Upgrade target plan |
| `paymentMethodId` | Body | string | Yes (UpgradePlan) | Non-empty | Payment method from ST-01 |
| `confirmedProratedChargeUsd` | Body | number | Yes (UpgradePlan) | ≥ 0 | Client's confirmed prorated charge |
| `confirmedEstimatedOverageUsd` | Body | number | Yes (AcceptOverages) | ≥ 0 | Client's confirmed overage estimate |
| `billingPeriodStart` | Body | string | Yes (AcceptOverages) | ISO 8601 | Current billing period start |
| `:id` | Path | integer | Yes (admin endpoints) | > 0 | Target merchant ID |
| `resetType` | Body | string | Yes (AdminResetLimits) | `full` or `enforcement_only` | Scope of reset |
| `reason` | Body | string | Yes (AdminResetLimits) | 10–500 chars | Audit reason |
| `extendGracePeriodHours` | Body | integer | No (AdminResetLimits) | 1–168 | Hours to extend grace |
| `status` | Query | string | No (Dashboard) | Valid stage value | Filter by enforcement status |
| `plan` | Query | string | No (Dashboard) | Valid plan value | Filter by plan tier |
| `limit` | Query | integer | No (list endpoints) | 1–200, default 50 | Page size |
| `cursor` | Query | string | No (list endpoints) | Cursor token | Pagination cursor |
| `historyLimit` | Query | integer | No (admin merchant) | 1–200, default 50 | Enforcement history page size |
| `historyOffset` | Query | integer | No (admin merchant) | ≥ 0, default 0 | History offset |

---

## Request/Response Contract Notes

- The `confirmedProratedChargeUsd` in `UpgradePlan` and `confirmedEstimatedOverageUsd` in `AcceptOverages` are client-side confirmations that the merchant saw and agreed to an amount. The server independently calculates the actual amounts. These fields protect against stale UI state (e.g., billing period rolled over between page load and form submission).
- Proration tolerance: ±$0.01 (rounding). Larger discrepancies return `400 PRORATED_CHARGE_MISMATCH`.
- All `createdAt`, `updatedAt`, `activatedAt`, and timestamp fields are ISO 8601 UTC.
- The `enforcement_event_log` backing `enforcementHistory` is append-only. Events are never updated or deleted.
- `resourceType` values across all endpoints: `orders_month`, `orders_year`, `sales_volume_year_usd`, `bandwidth_month_gb`, `storage_gb`, `product_skus`, `max_file_size_mb`.

---

## Idempotency and Concurrency Notes

- All `POST` endpoints require an `Idempotency-Key` header (UUID v4).
- Idempotency keys are stored for 24 hours. Requests with the same key within 24 hours return the original response.
- If the same key is used for a different operation (different endpoint + body), the server returns `409 Conflict`.
- The `UpgradePlan` endpoint uses database-level locking to prevent concurrent upgrades for the same merchant. If two requests arrive simultaneously, the second returns `409 DUPLICATE_REQUEST`.
- The `AcceptOverages` endpoint is idempotent by nature — accepting overages twice for the same period has no additional effect (`409 ALREADY_ACCEPTED` on second call).

---

## Security and Privacy Notes

- All endpoints require HTTPS. No HTTP traffic is accepted.
- Merchant JWTs are scoped to a single merchant. A merchant cannot query or modify another merchant's data — enforced at the application layer by resolving merchant identity from the JWT `sub` claim.
- Admin JWTs require the `role: admin` claim and are issued only to verified Prosperna staff accounts.
- Enforcement event logs contain financial and operational data (usage counts, overage estimates). Access is restricted to admins.
- Customer-facing error messages (e.g., order rejection during hard block) must never include plan information, overage rates, or any billing details about the merchant's account. These are internal business matters.
- Overage estimates and invoice amounts are financial data. Responses containing these must not be cached in insecure client storage (localStorage, client-side cookies without Secure/HttpOnly flags).

---

## Domain Events and Webhooks

The following internal events are emitted when enforcement state changes. These events drive the email notification system (ST-14) and analytics pipeline:

| Event | Trigger | Consumers |
|---|---|---|
| `usage.threshold_crossed` | Any resource crosses 80%, 95%, 100%, or 125% | Email system (ST-14), analytics |
| `enforcement.upgraded` | Merchant upgrade confirmed | Email system, dashboard (clear banners), analytics |
| `enforcement.overage_accepted` | Merchant accepts overages | Email system, enforcement state update, analytics |
| `enforcement.reset` | Admin resets limits | Audit log, analytics |
| `enforcement.grace_extended` | Admin extends grace period | Audit log, dashboard refresh |

No external webhooks are exposed in v1. Webhook support may be added in a future version for merchant integrations.

---

## SDK and Integration Examples

### JavaScript (Merchant Dashboard — Fetch Usage)

```javascript
async function getMerchantUsage(jwtToken) {
  const response = await fetch('https://api.prosperna.com/api/v1/usage', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(10000) // 10-second timeout
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error.code}`);
  }

  return response.json();
}
```

### JavaScript (Merchant — Accept Overages)

```javascript
const { randomUUID } = require('crypto');

async function acceptOverages(jwtToken, estimatedOverageUsd, billingPeriodStart) {
  const idempotencyKey = randomUUID();

  const response = await fetch('https://api.prosperna.com/api/v1/overage/accept', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify({
      confirmedEstimatedOverageUsd: estimatedOverageUsd,
      billingPeriodStart: billingPeriodStart
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (response.status === 409) {
    // Already accepted — treat as success
    return { success: true, alreadyAccepted: true };
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Overage acceptance failed: ${error.error.message}`);
  }

  return response.json();
}
```

---

## How to Use This API Safely

1. **Merchant dashboard**: Poll `GET /api/v1/usage` every 30 seconds (not more). Cache results client-side for the 30-second window.
2. **Upgrade flow**: Re-fetch usage state immediately before presenting the upgrade confirmation to ensure the prorated charge is current. Use `Idempotency-Key` to prevent double charges on network failure.
3. **Overage acceptance**: Only show the "Accept Overages" CTA when `enforcementState.status` is `grace_period_active`, `throttled`, or `blocked`. Hide it at all other times.
4. **Admin dashboard**: Cache the summary counts for 60 seconds. Real-time polling is not needed for the summary view.
5. **Admin reset**: Always provide a meaningful `reason`. The reason is immutable after submission. Review the `previousState` and `newState` in the response to confirm the reset had the expected effect.
6. **Error handling**: Handle `401`, `403`, `429`, and `5xx` errors in all API consumers. Never silently swallow errors — at minimum, log them with the `requestId` for debugging.

---

## Change Impact

| Change | Impact on This Document |
|---|---|
| ST-01 (Payment Abstraction Layer) adds new payment method types | `UpgradePlan.paymentMethodId` validation rules may need updating |
| ST-03 (Trial) changes trial plan limits | `GetMerchantUsage` response limits for trial merchants change; plan comparison panel changes |
| Adding a new plan tier (e.g., "Enterprise") | `UpgradePlan.targetPlan` enum expands; `GetAdminEnforcementDashboard.plan` filter expands |
| Changing overage rates | `AcceptOverages` response `overageRates` updates; PRD FR-7.2 table updates |
| Adding new resource types (e.g., API calls/month) | `GetMerchantUsage` `resources` array gains new entries; threshold checker gains new resource type |

---

## Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-1 | Should overage invoice payment failure trigger a new endpoint call to ST-04, or should the overage processor handle suspension directly? | May require a new admin endpoint for overage invoice management |
| OQ-2 | Should `GET /api/v1/usage` include per-file-size and per-SKU enforcement state, or are these handled purely at upload/publish time? | Would affect the `resources` array structure and `enforcementState` fields |
| OQ-3 | Should `extendGracePeriodHours` be a standalone endpoint (`POST /admin/api/v1/merchants/:id/extend-grace`) rather than a field on `AdminResetLimits`? | Would improve API clarity and simplify rate limiting |
