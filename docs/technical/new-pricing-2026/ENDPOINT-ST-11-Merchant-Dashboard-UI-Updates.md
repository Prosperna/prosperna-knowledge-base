---
id: st-11-merchant-dashboard-ui-updates
title: Endpoint Document. ST-11 Merchant Dashboard UI Updates
sidebar_label: ST-11 Merchant Dashboard UI Updates
sidebar_position: 11
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-22
- Status: Draft

---

## Linked Documents
- BRD: BRD-ST-11-Merchant-Dashboard-UI-Updates.md
- PRD: PRD-ST-11-Merchant-Dashboard-UI-Updates.md

---

## Public API Overview

ST-11 is a front-end subtask. It does not introduce new backend API endpoints. Instead, it integrates with APIs owned by five other subtasks: ST-01 (Payment Abstraction Layer), ST-03 (14-Day Trial System), ST-04 (Suspended Account State), ST-05 (Cancellation & Retention Flow), and ST-06 (Usage Limits Enforcement).

This document defines the exact API contracts that the ST-11 frontend depends on — the request shapes, response shapes, error codes, and consumer guard rails that the ST-11 implementation team must treat as a contract. Any change to these contracts by the owning subtask must be communicated to the ST-11 team before deployment.

---

## Audience and Use Cases

**Primary audience:** ST-11 frontend engineers implementing the Merchant Dashboard UI changes.

**Use cases:**
- Route guard that reads `payPlanType` and `suspendedReason` to determine routing behavior.
- Trial Countdown Banner reading `merchant_trial_info.trial_end_date` and `onboarding_steps_completed`.
- Usage Dashboard Widget displaying live usage vs plan limits.
- Plan selection flow initiating or modifying a subscription.
- CancelPlanModal calling the subscription cancellation endpoint.
- Payment Gateway Selector reading the list of available gateways.

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `http://localhost:3001` | Local development | May point to mocked or seeded data |
| Staging | `https://api-staging.prosperna.com` | Integration testing | Live data with test merchants; all subtask APIs deployed here |
| Production | `https://api.prosperna.com` | Live | All subtasks released simultaneously |

---

## API Versioning and Compatibility

- All endpoints follow the `/api/v1/` versioning prefix.
- ST-11 must not be released against an API version older than the one specified in this document.
- The owning subtask team must maintain backward compatibility for any field consumed by ST-11 for a minimum of one release cycle after any deprecation notice.

---

## Protocol and Data Format Standards

- Transport: HTTPS only (HTTP redirects to HTTPS in all environments).
- Data format: JSON (`Content-Type: application/json`, `Accept: application/json`).
- Dates: ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`).
- Currency: All monetary amounts are in USD, represented as numbers (e.g., `29.00`). Currency code is `"USD"`.
- Enum values: All plan type values are uppercase strings: `"TRIAL"`, `"LAUNCH"`, `"GROW"`, `"SCALE"`, `"SUSPENDED"`.
- Gateway identifiers: Lowercase strings: `"stripe"`, `"xendit"`.

---

## Authentication and Authorization

All ST-11 API calls are authenticated using a Cognito-issued JWT Bearer token managed by `aws-amplify`. The token is obtained at login and refreshed automatically by the Amplify SDK.

```
Authorization: Bearer <cognito_jwt_token>
```

- Token expiry: 1 hour (access token). Amplify refreshes automatically using the refresh token.
- If the access token is expired and refresh fails, Amplify redirects to the Cognito login page.
- No API key or service-to-service token is used by the frontend. All requests are user-scoped.

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| Authenticated Merchant | Read own store document, trial info, usage data; create, upgrade, downgrade, cancel own subscription; read available gateways | Cannot read or modify other merchants' data |
| Unauthenticated | None | All endpoints require a valid Bearer token |

---

## Ownership and Data Access Rules

- All ST-11 API calls are scoped to the authenticated merchant's own store. The store ID is inferred from the JWT — no explicit `storeId` parameter is required or accepted in merchant-facing endpoints.
- Merchants cannot modify subscription state of other merchants.
- Subscription creation, upgrade, and cancellation are gated by the merchant's current `payPlanType`. Attempting an operation inconsistent with the current state (e.g., creating a subscription when one is already active) returns a 409 Conflict.

---

## Request Conventions

- All query parameters use `camelCase`.
- All request body fields use `camelCase`.
- `Content-Type: application/json` must be set on all `POST`, `PUT`, and `PATCH` requests with a body.
- All requests must include a `X-Request-ID` header (UUID v4) for traceability. ST-11 should generate this per request.

```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## Response Conventions

- All successful responses return HTTP 2xx with a JSON body.
- All error responses return HTTP 4xx or 5xx with the global error model (see below).
- Timestamps in responses are ISO 8601 UTC strings.
- Collections are returned as `{ "data": [...], "meta": { "total": N } }`.
- Single resources are returned as `{ "data": { ... } }`.

---

## Global Guard Rails (Consumer Safety)

1. **Retry on 5xx only** — do not retry on 4xx responses. Retrying a 4xx will not change the outcome.
2. **Idempotency** — subscription creation (`POST /api/v1/subscriptions`) accepts an `Idempotency-Key` header. ST-11 must send a stable UUID per subscription creation attempt (e.g., derived from merchant ID + plan + timestamp) to prevent duplicate subscriptions on network retry.
3. **Request timeout** — all API calls from ST-11 should have a client-side timeout of 10 seconds. Show an error state if the timeout is exceeded.
4. **No polling** — ST-11 does not poll any endpoint. Data is fetched on page load or on explicit user action. The exception is the post-payment redirect flow, which reads the updated store `payPlanType` once after redirect.
5. **Skeleton on load** — never display stale data from a previous render. Always show a skeleton loader until the API response resolves.
6. **Never cache subscription state client-side** — `payPlanType` must be re-fetched from the server on each authenticated page load. Do not read it from localStorage or sessionStorage.

---

## Rate Limits and Abuse Controls

| Endpoint Group | Rate Limit | Window | Action on Breach |
|---|---|---|---|
| Store / merchant document reads | 60 requests | per minute per merchant | HTTP 429 — retry after value in `Retry-After` header |
| Subscription creation / modification | 10 requests | per minute per merchant | HTTP 429 — display "Too many attempts. Please wait a moment and try again." |
| Usage API reads | 30 requests | per minute per merchant | HTTP 429 — show cached data if available, otherwise error state |
| Gateway list reads | 60 requests | per minute per merchant | HTTP 429 |

---

## Global Error Model

All error responses from APIs consumed by ST-11 use this structure:

```json
{
  "error": {
    "httpStatus": 422,
    "code": "VALIDATION_ERROR",
    "type": "validation",
    "message": "The request body contains invalid values.",
    "details": [
      {
        "field": "planType",
        "issue": "invalid_value",
        "expected": "LAUNCH | GROW | SCALE",
        "actual": "PREMIUM"
      }
    ],
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-03-22T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/VALIDATION_ERROR"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| GET_STORE | GET | `/api/v1/store` | Merchant JWT | Read authenticated merchant's store document including payPlanType, suspendedReason, marketCountry, merchant_trial_info | Store reads | FR-3, FR-4, FR-5, FR-6, FR-7 |
| GET_USAGE | GET | `/api/v1/usage` | Merchant JWT | Read current-month usage counts and plan limits for orders, storage, and bandwidth | Usage reads | FR-19 |
| GET_GATEWAYS | GET | `/api/v1/subscriptions/gateways` | Merchant JWT | List available payment gateways for subscription billing | Gateway reads | FR-10 |
| CREATE_SUBSCRIPTION | POST | `/api/v1/subscriptions` | Merchant JWT | Create a new subscription for a merchant selecting a plan from trial, suspended, or unsubscribed state | Subscription writes | FR-5, FR-8, FR-10 |
| UPDATE_SUBSCRIPTION | PUT | `/api/v1/subscriptions/{subscriptionId}` | Merchant JWT | Upgrade or downgrade an existing active subscription | Subscription writes | FR-12 |
| CANCEL_SUBSCRIPTION | POST | `/api/v1/subscriptions/{subscriptionId}/cancel` | Merchant JWT | Request cancellation of an active subscription at end of billing period | Subscription writes | FR-14 |

> **Note on exact paths:** The paths above are assumed based on the ST-11 context document and ST-01 design patterns. Paths marked with `(TBD)` in the Open Questions section of the PRD must be confirmed with the ST-01 team before ST-11 integration begins.

---

## Endpoint Reference (Public Consumer Format)

---

### 1. GET_STORE — Read Merchant Store Document

**Operation ID:** `GET_STORE`
**Purpose:** Returns the authenticated merchant's store document. This is the primary data source for the route guard, Trial Countdown Banner, Suspended Lock Screen, and PaymentGatewaySelector default. Must be called on every authenticated page load — result must not be cached client-side.
**Method:** GET
**Path:** `/api/v1/store`
**Auth:** Bearer token (Cognito JWT)
**Owner Subtask:** ST-03 (trial fields), ST-04 (suspended fields), ST-01 (plan type)

#### Parameters
| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| Authorization | Header | string | Yes | Bearer JWT | Cognito access token |
| X-Request-ID | Header | string (UUID v4) | Yes | Valid UUID | Per-request tracing identifier |

#### Request Example
```bash
curl -X GET "https://api.prosperna.com/api/v1/store" \
  -H "Authorization: Bearer eyJra..." \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Accept: application/json"
```

#### Success Response (200 OK)
```json
{
  "data": {
    "storeId": "store_abc123",
    "storeName": "Jane's Boutique",
    "marketCountry": "US",
    "payPlanType": "TRIAL",
    "suspendedReason": null,
    "merchant_trial_info": {
      "trial_start_date": "2026-03-08T00:00:00Z",
      "trial_end_date": "2026-03-22T00:00:00Z",
      "onboarding_steps_completed": 3,
      "prompt_dismissals": {
        "day5": false,
        "day7": false,
        "day12": false,
        "day13": false
      }
    },
    "currentSubscription": null
  }
}
```

**For a suspended merchant:**
```json
{
  "data": {
    "storeId": "store_def456",
    "storeName": "Miguel's Shop",
    "marketCountry": "PH",
    "payPlanType": "SUSPENDED",
    "suspendedReason": "payment_failed",
    "merchant_trial_info": null,
    "currentSubscription": {
      "subscriptionId": "sub_xyz789",
      "planType": "GROW",
      "gateway": "xendit",
      "billingCycle": "monthly",
      "status": "suspended"
    }
  }
}
```

**For a paid merchant:**
```json
{
  "data": {
    "storeId": "store_ghi789",
    "storeName": "Maria's Store",
    "marketCountry": "PH",
    "payPlanType": "GROW",
    "suspendedReason": null,
    "merchant_trial_info": null,
    "currentSubscription": {
      "subscriptionId": "sub_abc321",
      "planType": "GROW",
      "gateway": "xendit",
      "billingCycle": "monthly",
      "nextBillingDate": "2026-04-22T00:00:00Z",
      "status": "active"
    }
  }
}
```

#### Error Path Table
| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | JWT missing, expired, or invalid | Amplify handles automatic token refresh; if refresh fails, redirect to login |
| 403 | `FORBIDDEN` | Token valid but merchant account access denied | Display "Access denied. Please contact support." |
| 404 | `STORE_NOT_FOUND` | No store document found for the authenticated user | Redirect to onboarding flow or display "Store not found" error |
| 500 | `INTERNAL_ERROR` | Server error | Show full-screen error state: "Unable to load account status. Please refresh." with retry button. After 3 retries, show contact-support message |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily down | Same as 500 treatment; retry after 3 seconds (once only) |

#### Error Response Example
```json
{
  "error": {
    "httpStatus": 401,
    "code": "UNAUTHORIZED",
    "type": "authentication",
    "message": "The provided token is expired or invalid.",
    "details": [],
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-03-22T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/UNAUTHORIZED"
  }
}
```

#### Guard Rails
- **Do not cache** `payPlanType` in localStorage or sessionStorage. Always re-fetch on page load.
- **Timeout:** 10 seconds. On timeout, show "Unable to load account status. Please refresh."
- **No retry on 4xx.** Only retry on 5xx or timeout (maximum 1 automatic retry, then show error).
- **Critical path:** This is the most critical API call in ST-11. The route guard cannot proceed until this call resolves. Show a full-screen skeleton loader until it completes.

---

### 2. GET_USAGE — Read Monthly Usage Data

**Operation ID:** `GET_USAGE`
**Purpose:** Returns the authenticated merchant's current-month usage counts and plan limits for orders, storage, and bandwidth. Used by the Usage Dashboard Widget on `/home`.
**Method:** GET
**Path:** `/api/v1/usage`
**Auth:** Bearer token (Cognito JWT)
**Owner Subtask:** ST-06

#### Parameters
| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| Authorization | Header | string | Yes | Bearer JWT | Cognito access token |
| X-Request-ID | Header | string (UUID v4) | Yes | Valid UUID | Per-request tracing identifier |

#### Request Example
```bash
curl -X GET "https://api.prosperna.com/api/v1/usage" \
  -H "Authorization: Bearer eyJra..." \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440001" \
  -H "Accept: application/json"
```

#### Success Response (200 OK)
```json
{
  "data": {
    "period": {
      "start": "2026-03-01T00:00:00Z",
      "end": "2026-03-31T23:59:59Z"
    },
    "orders": {
      "current": 160,
      "limit": 200,
      "unit": "orders"
    },
    "storage": {
      "current_gb": 3.2,
      "limit_gb": 10,
      "unit": "GB"
    },
    "bandwidth": {
      "current_gb": 5.1,
      "limit_gb": 25,
      "unit": "GB"
    }
  }
}
```

#### Error Path Table
| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | JWT expired or invalid | Amplify refreshes token; if fail, redirect to login |
| 404 | `USAGE_NOT_FOUND` | No usage record for the current period | Treat as zero usage — render widget with 0/limit values |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests | Show cached data if available; otherwise show error state |
| 500 | `INTERNAL_ERROR` | Server error | Show Usage Widget error state: "Usage data unavailable." Keep "View Usage Details →" link active |

#### Guard Rails
- **Fetch on page load only** — do not poll. Usage data is point-in-time and does not change during a single session in a way that requires live updates.
- **Non-blocking** — the Usage Widget failing must not block any other page content from rendering. The widget is isolated in a card container.
- **Progress bar calculation:** `Math.min((current / limit) * 100, 100)`. Cap at 100% to avoid overflow rendering. Color thresholds: green at < 80%, amber at 80–94%, red at ≥ 95%.
- **Timeout:** 10 seconds. On timeout, show the error state as above.

---

### 3. GET_GATEWAYS — List Available Payment Gateways

**Operation ID:** `GET_GATEWAYS`
**Purpose:** Returns the list of payment gateways available for the authenticated merchant's subscription billing. Used by the PaymentGatewaySelector component to render the correct options.
**Method:** GET
**Path:** `/api/v1/subscriptions/gateways`
**Auth:** Bearer token (Cognito JWT)
**Owner Subtask:** ST-01

#### Parameters
| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| Authorization | Header | string | Yes | Bearer JWT | Cognito access token |
| X-Request-ID | Header | string (UUID v4) | Yes | Valid UUID | Per-request tracing identifier |

#### Request Example
```bash
curl -X GET "https://api.prosperna.com/api/v1/subscriptions/gateways" \
  -H "Authorization: Bearer eyJra..." \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440002" \
  -H "Accept: application/json"
```

#### Success Response (200 OK)
```json
{
  "data": [
    {
      "id": "stripe",
      "displayName": "Stripe",
      "description": "Pay with credit/debit card via Stripe",
      "supportedCountries": ["US", "GB", "AU", "SG"],
      "isDefault": false
    },
    {
      "id": "xendit",
      "displayName": "Xendit",
      "description": "Pay with eWallet, credit card, or bank transfer via Xendit",
      "supportedCountries": ["PH", "ID"],
      "isDefault": false
    }
  ]
}
```

#### Error Path Table
| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | JWT expired or invalid | Amplify refreshes token; redirect to login on failure |
| 500 | `INTERNAL_ERROR` | Server error | Fall back to hardcoded gateway list (Stripe and Xendit) with a logged warning. Do not block the plan selection flow. |

#### Guard Rails
- **Fallback to static list:** If this endpoint is unavailable, the PaymentGatewaySelector must not block the user. Fall back to rendering Stripe and Xendit as static options.
- **Auto-selection logic resides in the frontend:** The `isDefault` field from the API is informational. The frontend applies the market-country-based auto-selection rule (US → Stripe, PH → Xendit, other → Stripe) independently of this field.
- **Cache permitted:** This list is configuration data. ST-11 may cache the gateway list for the duration of the session (in React state, not localStorage).

---

### 4. CREATE_SUBSCRIPTION — Create New Subscription

**Operation ID:** `CREATE_SUBSCRIPTION`
**Purpose:** Creates a new subscription for a merchant who is subscribing for the first time (from TRIAL state) or reactivating (from SUSPENDED state). Returns a redirect URL to the gateway's hosted payment page or a client secret for an embedded payment form.
**Method:** POST
**Path:** `/api/v1/subscriptions`
**Auth:** Bearer token (Cognito JWT)
**Owner Subtask:** ST-01

#### Parameters
| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| Authorization | Header | string | Yes | Bearer JWT | Cognito access token |
| X-Request-ID | Header | string (UUID v4) | Yes | Valid UUID | Per-request tracing identifier |
| Idempotency-Key | Header | string (UUID v4) | Yes | Stable per attempt | Prevents duplicate subscriptions on retry |

#### Request Body Schema Notes
- `planType`: must be one of `"LAUNCH"`, `"GROW"`, `"SCALE"`.
- `gateway`: must be one of `"stripe"`, `"xendit"`.
- `billingCycle`: must be one of `"monthly"`, `"quarterly"`, `"annual"`.
- `promoCode`: optional string; if provided, the backend validates and applies the discount.
- `successUrl` and `cancelUrl`: the frontend-provided redirect URLs for the gateway hosted payment page.

#### Full Request Example
```bash
curl -X POST "https://api.prosperna.com/api/v1/subscriptions" \
  -H "Authorization: Bearer eyJra..." \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440003" \
  -H "Idempotency-Key: a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "GROW",
    "gateway": "stripe",
    "billingCycle": "monthly",
    "promoCode": null,
    "successUrl": "https://app.prosperna.com/home/payment-success",
    "cancelUrl": "https://app.prosperna.com/home/billing"
  }'
```

#### Success Response (201 Created)
```json
{
  "data": {
    "subscriptionId": "sub_new_xyz123",
    "status": "pending_payment",
    "planType": "GROW",
    "gateway": "stripe",
    "billingCycle": "monthly",
    "amountDue": 59.00,
    "currency": "USD",
    "promoApplied": null,
    "paymentUrl": "https://checkout.stripe.com/pay/cs_test_abc123",
    "expiresAt": "2026-03-22T10:30:00Z"
  }
}
```

> **ST-11 behavior on success:** Redirect the merchant to `data.paymentUrl`. The gateway handles payment collection. On success, the gateway redirects to the `successUrl` provided in the request. ST-11 then calls `GET /api/v1/store` to confirm `payPlanType` has transitioned to the paid plan type before rendering the Payment Success page.

#### Error Path Table
| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid planType, gateway, or billingCycle | Display inline validation error on the plan selection form |
| 401 | `UNAUTHORIZED` | JWT expired or invalid | Amplify refreshes; redirect to login on failure |
| 409 | `SUBSCRIPTION_ALREADY_ACTIVE` | Merchant already has an active subscription | Do not create a duplicate. Navigate to `/home/billing` and show current subscription state |
| 422 | `INVALID_PROMO_CODE` | Promo code provided but not valid | Inline error below promo code field: "Promo code not valid or expired." |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many subscription attempts | Display: "Too many attempts. Please wait a moment and try again." |
| 500 | `INTERNAL_ERROR` | Server error | Display: "Something went wrong. Please try again." with a retry CTA |

#### Error Response Example
```json
{
  "error": {
    "httpStatus": 422,
    "code": "INVALID_PROMO_CODE",
    "type": "validation",
    "message": "The provided promo code is not valid or has expired.",
    "details": [
      {
        "field": "promoCode",
        "issue": "invalid_or_expired",
        "expected": "a valid, active promo code",
        "actual": "SAVE50"
      }
    ],
    "requestId": "550e8400-e29b-41d4-a716-446655440003",
    "timestamp": "2026-03-22T10:05:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/INVALID_PROMO_CODE"
  }
}
```

#### Guard Rails
- **Idempotency-Key is mandatory.** Generate a UUID per subscription attempt. On network retry, re-send the same Idempotency-Key to prevent duplicate subscriptions.
- **Do not retry on 4xx.** Only retry on 5xx (maximum 1 automatic retry with the same Idempotency-Key).
- **Confirm plan state after redirect.** After the gateway redirects the merchant back to the `successUrl`, call `GET /api/v1/store` once to confirm the `payPlanType` has updated before rendering the success message.
- **`paymentUrl` expiry.** If the merchant does not complete payment before `expiresAt`, the payment URL expires. ST-11 does not need to handle this explicitly — the gateway will show an expiry page. The merchant can restart the flow from `/home/billing`.
- **Timeout:** 10 seconds. On timeout, show "Something went wrong. Please try again."

---

### 5. UPDATE_SUBSCRIPTION — Upgrade or Downgrade Subscription

**Operation ID:** `UPDATE_SUBSCRIPTION`
**Purpose:** Modifies an existing active subscription to a different plan (upgrade or downgrade). For upgrades, returns a prorated charge amount. For downgrades, the plan change takes effect at the end of the current billing period.
**Method:** PUT
**Path:** `/api/v1/subscriptions/{subscriptionId}`
**Auth:** Bearer token (Cognito JWT)
**Owner Subtask:** ST-01

#### Parameters
| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| Authorization | Header | string | Yes | Bearer JWT | Cognito access token |
| X-Request-ID | Header | string (UUID v4) | Yes | Valid UUID | Per-request tracing identifier |
| subscriptionId | Path | string | Yes | Valid subscription ID | The ID of the subscription to modify (from `currentSubscription.subscriptionId` in store document) |

#### Request Body Schema Notes
- `planType`: target plan — `"LAUNCH"`, `"GROW"`, or `"SCALE"`.
- `gateway`: optional; include only if the merchant is switching gateways. If omitted, the existing gateway is retained.
- `billingCycle`: optional; include only if the merchant is changing billing cycle.

#### Full Request Example
```bash
curl -X PUT "https://api.prosperna.com/api/v1/subscriptions/sub_abc321" \
  -H "Authorization: Bearer eyJra..." \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440004" \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "SCALE",
    "gateway": "stripe"
  }'
```

#### Success Response (200 OK)
```json
{
  "data": {
    "subscriptionId": "sub_abc321",
    "previousPlanType": "GROW",
    "newPlanType": "SCALE",
    "gateway": "stripe",
    "billingCycle": "monthly",
    "changeType": "upgrade",
    "proratedCharge": {
      "amount": 45.00,
      "currency": "USD",
      "description": "Prorated charge for remaining 15 days of current billing period"
    },
    "effectiveDate": "2026-03-22T10:10:00Z",
    "nextBillingDate": "2026-04-22T00:00:00Z",
    "paymentUrl": "https://checkout.stripe.com/pay/cs_test_prorate_xyz"
  }
}
```

> **For downgrades:** `changeType` is `"downgrade"`, `proratedCharge` is `null`, and `effectiveDate` is the end of the current billing period. No payment URL is returned for downgrades.

#### Error Path Table
| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid planType or field value | Display inline validation error in ChangePlanModal |
| 401 | `UNAUTHORIZED` | JWT expired | Amplify refreshes; redirect to login on failure |
| 404 | `SUBSCRIPTION_NOT_FOUND` | subscriptionId does not exist or belongs to another merchant | Log error; display "Unable to update plan. Please contact support." |
| 409 | `SAME_PLAN_CONFLICT` | Merchant attempts to change to the same plan they are currently on | Display "You are already on this plan." in the ChangePlanModal |
| 409 | `USAGE_LIMIT_EXCEEDED` | Downgrade target plan limits are violated by current usage | Re-render ChangePlanModal with updated warning items even if already shown |
| 500 | `INTERNAL_ERROR` | Server error | Display: "Something went wrong. Please try again." with retry CTA in ChangePlanModal |

#### Guard Rails
- **Confirm effectiveDate for downgrades.** Display the effective date in the ChangePlanModal: "Your plan will change to [Plan] on [effectiveDate]."
- **For upgrades with `paymentUrl`:** redirect merchant to `paymentUrl` to complete the prorated charge. Apply the same post-redirect confirmation flow as CREATE_SUBSCRIPTION.
- **Timeout:** 10 seconds.
- **No idempotency key required** for `PUT` operations — they are naturally idempotent on the same `subscriptionId` and `planType` combination.

---

### 6. CANCEL_SUBSCRIPTION — Cancel Active Subscription

**Operation ID:** `CANCEL_SUBSCRIPTION`
**Purpose:** Requests cancellation of the authenticated merchant's active subscription. The subscription remains active until the end of the current billing period, after which the account transitions to SUSPENDED state.
**Method:** POST
**Path:** `/api/v1/subscriptions/{subscriptionId}/cancel`
**Auth:** Bearer token (Cognito JWT)
**Owner Subtask:** ST-01 / ST-05

#### Parameters
| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| Authorization | Header | string | Yes | Bearer JWT | Cognito access token |
| X-Request-ID | Header | string (UUID v4) | Yes | Valid UUID | Per-request tracing identifier |
| subscriptionId | Path | string | Yes | Valid subscription ID | The ID of the active subscription to cancel |

#### Request Body Schema Notes
- `reason`: optional string — maps to exit survey category collected in CancelPlanModal (handled by ST-05). ST-11 passes this through to the API.

#### Full Request Example
```bash
curl -X POST "https://api.prosperna.com/api/v1/subscriptions/sub_abc321/cancel" \
  -H "Authorization: Bearer eyJra..." \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440005" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "too_expensive"
  }'
```

#### Success Response (200 OK)
```json
{
  "data": {
    "subscriptionId": "sub_abc321",
    "status": "pending_cancellation",
    "planType": "GROW",
    "activeUntil": "2026-04-22T00:00:00Z",
    "suspensionDate": "2026-04-22T00:00:00Z",
    "message": "Your subscription will remain active until 2026-04-22. After that date, your store will go offline."
  }
}
```

> **ST-11 behavior on success:** The CancelPlanModal displays the `activeUntil` date and the message from the response. The merchant's `payPlanType` remains at `GROW` (or current plan) until the `suspensionDate`. No redirect is needed.

#### Error Path Table
| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | JWT expired | Amplify refreshes; redirect to login on failure |
| 404 | `SUBSCRIPTION_NOT_FOUND` | No active subscription to cancel | Display "No active subscription found." and close the CancelPlanModal |
| 409 | `ALREADY_CANCELLED` | Subscription already in pending_cancellation state | Display "Your subscription is already scheduled for cancellation on [date]." |
| 500 | `INTERNAL_ERROR` | Server error | Display: "Something went wrong. Please try again." with retry CTA |

#### Guard Rails
- **No idempotency key needed.** Cancellation of the same subscription is idempotent — a second call returns 409 ALREADY_CANCELLED with the cancellation date.
- **No immediate suspension.** The account is not suspended until `suspensionDate`. The merchant retains full dashboard access and must not see any suspension UI until that date passes.
- **Timeout:** 10 seconds.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <jwt>` | Cognito JWT access token for the authenticated merchant |
| `X-Request-ID` | Header | string | Yes | UUID v4 | Per-request identifier for traceability and debugging |
| `Idempotency-Key` | Header | string | Conditional | UUID v4; required for CREATE_SUBSCRIPTION | Prevents duplicate subscription creation on network retry |
| `planType` | Body | string | Yes (subscription ops) | `LAUNCH \| GROW \| SCALE` | Target subscription plan |
| `gateway` | Body | string | Yes (create); Optional (update) | `stripe \| xendit` | Payment gateway for subscription billing |
| `billingCycle` | Body | string | Yes (create); Optional (update) | `monthly \| quarterly \| annual` | Subscription billing frequency |
| `promoCode` | Body | string | No | Max 50 chars | Optional discount promo code |
| `successUrl` | Body | string | Yes (create) | Valid HTTPS URL | Redirect URL on successful gateway payment |
| `cancelUrl` | Body | string | Yes (create) | Valid HTTPS URL | Redirect URL if merchant cancels on the gateway page |
| `subscriptionId` | Path | string | Yes (update, cancel) | Valid subscription ID | The subscription to modify or cancel |
| `reason` | Body | string | No | Max 100 chars | Optional cancellation reason for analytics |

---

## Request/Response Contract Notes

- ST-11 must not assume `merchant_trial_info` is always present in the store response. It may be `null` for non-trial merchants. Always null-check before accessing nested fields.
- `suspendedReason` may be `null` for merchants whose `payPlanType` is not `SUSPENDED`. Always null-check.
- `currentSubscription` may be `null` for merchants who have never subscribed (new trial merchants).
- The `paymentUrl` in subscription creation and upgrade responses expires at `expiresAt`. If the merchant leaves and returns after expiry, they must restart the plan selection flow.
- All amounts in subscription responses are in USD with two decimal places (`59.00`, not `59`).

---

## Idempotency and Concurrency Notes

- **CREATE_SUBSCRIPTION** is the only endpoint requiring an Idempotency-Key. The key should be a UUID generated per distinct subscription creation attempt. If the merchant changes the plan type or gateway and retries, a new Idempotency-Key must be generated.
- **UPDATE_SUBSCRIPTION (PUT)** is idempotent by design — repeated identical requests return the same result without side effects.
- **CANCEL_SUBSCRIPTION** is idempotent — a second cancellation request returns a 409 with the existing cancellation date.
- **Concurrent tab scenario:** If a merchant has the billing page open in two tabs and subscribes in one, the other tab must re-fetch store data before showing a stale "subscribe" state. ST-11 should handle this by re-fetching `GET /api/v1/store` on tab focus.

---

## Security and Privacy Notes

- All payment credential handling (card numbers, bank account details) is performed entirely by the Stripe or Xendit hosted payment pages. The ST-11 frontend never sees, stores, or transmits payment credentials.
- The `paymentUrl` returned by CREATE_SUBSCRIPTION and UPDATE_SUBSCRIPTION is a single-use, time-limited URL provided by the payment gateway. ST-11 must redirect to this URL immediately — do not store it in state beyond the redirect.
- JWT tokens must not be logged in the browser console or sent to third-party error monitoring services.
- `X-Request-ID` values may be logged for debugging purposes as they contain no PII.

---

## Domain Events and Webhooks

ST-11 does not subscribe to any webhooks. All state changes (plan activation, suspension) are detected by re-fetching `GET /api/v1/store` at the appropriate time (on page load, and once after payment gateway redirect).

---

## SDK and Integration Examples

ST-11 uses React Query (`@tanstack/react-query`) for all API calls. Recommended patterns:

**Store document fetch (route guard):**
```javascript
const { data: storeData, isLoading, isError } = useQuery({
  queryKey: ['store'],
  queryFn: () => apiClient.get('/api/v1/store'),
  staleTime: 0,          // Never serve stale data for plan state
  cacheTime: 0,          // Do not cache between sessions
  retry: 1,              // One automatic retry on failure
  retryDelay: 0,         // Immediate retry
});
```

**Usage widget fetch (non-critical):**
```javascript
const { data: usageData, isLoading, isError } = useQuery({
  queryKey: ['usage'],
  queryFn: () => apiClient.get('/api/v1/usage'),
  staleTime: 5 * 60 * 1000,   // 5 minutes — usage data doesn't need to be real-time
  retry: 1,
  retryDelay: 2000,
});
```

**Subscription creation (mutation):**
```javascript
const createSubscription = useMutation({
  mutationFn: (payload) => apiClient.post('/api/v1/subscriptions', payload, {
    headers: { 'Idempotency-Key': generateIdempotencyKey() }
  }),
  onSuccess: (data) => {
    window.location.href = data.data.paymentUrl;
  },
  onError: (error) => {
    handleSubscriptionError(error);
  },
});
```

---

## How to Use This API Safely

1. **Always re-fetch `payPlanType` on page load.** Do not trust any locally cached plan state for routing decisions.
2. **Use Idempotency-Key for CREATE_SUBSCRIPTION** every time. Generate it fresh per attempt but reuse it on network-level retries of the same attempt.
3. **Never block the UI on non-critical API calls.** Usage widget, gateway list, and promo code validation failures must not block plan selection or route guard resolution.
4. **Handle `null` fields defensively.** `merchant_trial_info`, `suspendedReason`, and `currentSubscription` can all be `null` — always null-check before accessing nested properties.
5. **Set a 10-second timeout on all API calls** and show an appropriate error state when it is exceeded.
6. **After payment gateway redirect, call `GET /api/v1/store` once** to confirm the plan state before rendering the success page. Do not assume the plan changed — verify it.

---

## Change Impact

Any change to the following will require ST-11 frontend updates:

| Change | Impact on ST-11 |
|---|---|
| `payPlanType` enum values added or renamed | Route guard logic, utility functions (`isOnTrial`, `isSuspended`), `getPlanDisplayName` |
| `merchant_trial_info` schema changed | Trial Countdown Banner, In-App Prompts, Day calculation logic |
| `suspendedReason` values added | Suspended Lock Screen contextual heading logic |
| `GET /api/v1/usage` response schema changed | Usage Dashboard Widget data binding |
| Subscription API path or request schema changed | Plan selection flow (create, upgrade, downgrade, cancel) |
| New payment gateway added | PaymentGatewaySelector options |

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Confirm exact path for subscription creation endpoint. Assumed `POST /api/v1/subscriptions`. | ST-01 team | Open |
| OQ-2 | Confirm exact path for available gateways list. Assumed `GET /api/v1/subscriptions/gateways`. | ST-01 team | Open |
| OQ-3 | Is `merchant_trial_info` nested inside the `GET /api/v1/store` response, or is it a separate API call? Affects caching strategy and waterfall load behavior in the route guard. | ST-03 team | Open |
| OQ-4 | What is the exact field name for per-prompt dismissal flags? Assumed `merchant_trial_info.prompt_dismissals.{day5\|day7\|day12\|day13}` as boolean flags. | ST-03 team | Open |
| OQ-5 | Does the `UPDATE_SUBSCRIPTION` endpoint also handle gateway switching (cancel old + create new via the abstraction layer)? Or is gateway switching a separate operation? | ST-01 team | Open |
