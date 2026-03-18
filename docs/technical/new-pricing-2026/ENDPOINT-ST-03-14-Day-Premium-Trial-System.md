---
id: st-03-14-day-premium-trial-system
title: Endpoint Document. ST-03 14-Day Premium Trial System
sidebar_label: ST-03 14-Day Premium Trial System
sidebar_position: 3
---

**Version:** 1.0
**Date:** 2026-03-17
**Status:** Draft
**Prepared by:** Business Analyst Agent

---

## Table of Contents

1. [Global API Conventions](#1-global-api-conventions)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Endpoint Catalog](#3-endpoint-catalog)
   - 3.1 [GET /api/v1/trial/status](#31-get-apiv1trialstatus)
   - 3.2 [POST /v1/users/signup — Modified](#32-post-v1userssignup--modified)
   - 3.3 [GET /api/v1/merchant/status — Modified](#33-get-apiv1merchantstatus--modified)
   - 3.4 [PATCH /api/v1/trial/onboarding-step — Internal](#34-patch-apiv1trialonboarding-step--internal)
4. [Background Job Contracts](#4-background-job-contracts)
   - 4.1 [trial-expiry-checker](#41-trial-expiry-checker)
   - 4.2 [trial-expiry-processor](#42-trial-expiry-processor)
5. [Cross-Service Integration Reference](#5-cross-service-integration-reference)
6. [Error Model](#6-error-model)
7. [Guard Rails for Consumers](#7-guard-rails-for-consumers)

---

## 1. Global API Conventions

### Base URLs

| Service | Base URL | Owns |
|---|---|---|
| `user-service-api` | `https://api.prosperna.com/v1/users` | Signup, authentication |
| `business-profile-api` | `https://api.prosperna.com/api/v1` | Merchant profile, trial status, plan state |
| `payment-integration-api` | `https://api.prosperna.com/api/v1/payments` | Background jobs, subscription webhooks |

### API Versioning

- All endpoints are versioned via the URL path (`/v1/`, `/api/v1/`).
- Breaking changes are introduced under a new version segment (e.g., `/v2/`).
- Non-breaking additions (new optional response fields) do not require a version bump.

### Request Format

- All request bodies use `application/json`.
- All dates and timestamps are **ISO 8601 UTC** (e.g., `"2026-03-17T08:00:00.000Z"`).
- String enum values are **uppercase** where specified (e.g., `"TRIAL"`, `"GROW"`, `"STRIPE"`).

### Response Format

All successful responses return JSON with HTTP 2xx. All error responses use the standard error envelope:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description.",
    "details": {}
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded. |
| `201 Created` | Resource created. |
| `400 Bad Request` | Validation error — client sent invalid data. |
| `401 Unauthorized` | Missing or invalid authentication token. |
| `403 Forbidden` | Authenticated but not authorized (e.g., SUSPENDED plan). |
| `404 Not Found` | Resource does not exist. |
| `409 Conflict` | Duplicate resource (e.g., email already registered). |
| `422 Unprocessable Entity` | Business rule violation (e.g., trial already active). |
| `429 Too Many Requests` | Rate limit exceeded. |
| `500 Internal Server Error` | Unexpected server error. |
| `503 Service Unavailable` | Downstream dependency unavailable. |

---

## 2. Authentication & Authorization

### Authentication

All endpoints (except `POST /v1/users/signup`) require a valid **JWT Bearer token** issued by AWS Cognito.

```
Authorization: Bearer <cognito_id_token>
```

Tokens expire after **1 hour**. Clients must refresh using the Cognito refresh token flow before expiry.

### Authorization Scopes

| Scope | Description |
|---|---|
| `merchant` | Standard merchant — can read/write their own trial data |
| `admin` | Prosperna internal admin — can read trial data for any merchant |

### Plan-Level Authorization

The `mustBeOnPaidPlan` middleware is applied to most merchant data routes. As of ST-03, the following plan types pass the middleware:

| Plan Type | Passes Middleware? |
|---|---|
| `TRIAL` | Yes |
| `LAUNCH` | Yes |
| `GROW` | Yes |
| `SCALE` | Yes |
| `SUSPENDED` | No — returns `403 Forbidden` |
| `FREE` (legacy) | Yes (legacy support — not assigned to new accounts) |

---

## 3. Endpoint Catalog

---

### 3.1 GET /api/v1/trial/status

**Service:** `business-profile-api`
**Auth required:** Yes — Bearer token (merchant scope)
**Plan gate:** None — accessible to all authenticated merchants (including SUSPENDED, to support reactivation UI)

#### Purpose

Returns the current trial status for the authenticated merchant. Used by the Merchant Dashboard frontend (`prosperna1`) to render the trial banner, onboarding checklist, and conversion prompts. This endpoint should be called **once per dashboard session** and the result shared via React context.

#### Parameters

None. The merchant is identified from the JWT token's `sub` claim.

#### Request

```http
GET /api/v1/trial/status
Authorization: Bearer <token>
```

No request body.

#### Success Response — 200 OK

```json
{
  "success": true,
  "data": {
    "is_on_trial": true,
    "days_remaining": 9,
    "trial_end_date": "2026-03-31T08:00:00.000Z",
    "onboarding_steps_completed": ["store_setup", "first_product"],
    "recommended_plan": "GROW"
  }
}
```

#### Response Field Definitions

| Field | Type | Description |
|---|---|---|
| `is_on_trial` | Boolean | `true` if the merchant's `payPlanType === 'TRIAL'` and the trial has not expired. `false` for all other plan types. |
| `days_remaining` | Integer | `ceil((trial_end_date - now) / 86400000)`. Returns `0` if the trial has expired but the processor has not yet run. Never negative. |
| `trial_end_date` | ISO 8601 datetime | The UTC datetime when the trial expires. `null` if the merchant is not and has never been on trial. |
| `onboarding_steps_completed` | String[] | Array of completed step IDs. Possible values: `store_setup`, `first_product`, `page_builder`, `payment_gateway`, `kyb`, `store_published`. Empty array if none completed. |
| `recommended_plan` | String | Always `"GROW"` in v1. |

#### Non-Trial Merchant Response — 200 OK

```json
{
  "success": true,
  "data": {
    "is_on_trial": false,
    "days_remaining": 0,
    "trial_end_date": null,
    "onboarding_steps_completed": [],
    "recommended_plan": "GROW"
  }
}
```

#### Error Responses

| HTTP Status | Error Code | Condition | Consumer Action |
|---|---|---|---|
| `401 Unauthorized` | `UNAUTHORIZED` | Missing or expired Bearer token | Redirect to login. Refresh Cognito token before retrying. |
| `404 Not Found` | `MERCHANT_NOT_FOUND` | No Store document found for the authenticated user | Log the error. This should not occur in normal operation — escalate to support. |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Unexpected server error | Do not retry immediately. Wait 5s and retry once. If persistent, show a fallback UI without the trial banner. |

#### Error Response Example (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or has expired.",
    "details": {}
  }
}
```

#### Performance Contract

- p95 response time < 300ms
- p99 response time < 500ms
- The endpoint reads from `merchant_trial_info` (indexed on `merchant_id`) and the Store document. No joins to external services on the hot path.

---

### 3.2 POST /v1/users/signup — Modified

**Service:** `user-service-api`
**Auth required:** No (public endpoint)
**Plan gate:** N/A

#### Purpose

Creates a new Prosperna merchant account. This endpoint is modified as part of ST-03 to provision the Store document with `payPlanType = 'TRIAL'` instead of `'FREE'`, and to create the `merchant_trial_info` record.

#### Parameters

None (path parameters).

#### Request Body

```json
{
  "email": "merchant@example.com",
  "password": "SecureP@ss1!",
  "store_name": "My Awesome Shop",
  "business_type": "retail"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | String | Yes | Valid email format. Must be unique in Cognito. |
| `password` | String | Yes | Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character (Cognito policy). |
| `store_name` | String | Yes | 1–100 characters. |
| `business_type` | String | Yes | Valid business type enum value. |

#### Success Response — 201 Created

```json
{
  "success": true,
  "data": {
    "merchant_id": "64a1f2b3c4d5e6f7a8b9c0d1",
    "store_id": "64a1f2b3c4d5e6f7a8b9c0d2",
    "email": "merchant@example.com",
    "pay_plan_type": "TRIAL",
    "trial_end_date": "2026-03-31T08:00:00.000Z",
    "access_token": "<cognito_access_token>",
    "id_token": "<cognito_id_token>",
    "refresh_token": "<cognito_refresh_token>"
  }
}
```

**ST-03 changes in this response vs. prior behavior:**
- `pay_plan_type` is now `"TRIAL"` (was `"FREE"`).
- `trial_end_date` is now returned to allow the client to initialize the banner without an extra API call.

#### Error Responses

| HTTP Status | Error Code | Condition | Consumer Action |
|---|---|---|---|
| `400 Bad Request` | `VALIDATION_ERROR` | Missing or invalid fields | Show field-level validation errors to the user. Do not retry without correcting the input. |
| `409 Conflict` | `EMAIL_ALREADY_EXISTS` | Email is already registered in Cognito | Show "An account with this email already exists" message. Direct user to login. |
| `500 Internal Server Error` | `SIGNUP_FAILED` | Cognito user created but Store or `merchant_trial_info` creation failed | Rare. Log and alert. The orphaned Cognito user must be cleaned up by the ops team. |
| `503 Service Unavailable` | `DEPENDENCY_UNAVAILABLE` | Cognito or MongoDB unavailable | Show generic error. Do not retry automatically on the client side. |

#### Error Response Example (409)

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email address already exists.",
    "details": {
      "field": "email"
    }
  }
}
```

---

### 3.3 GET /api/v1/merchant/status — Modified

**Service:** `business-profile-api`
**Auth required:** Yes — Bearer token (merchant or admin scope)
**Plan gate:** None

#### Purpose

Returns the overall status of the authenticated merchant's account. Modified by ST-03 to include `'trial'` as a valid status value.

#### Parameters

None.

#### Request

```http
GET /api/v1/merchant/status
Authorization: Bearer <token>
```

#### Success Response — 200 OK

```json
{
  "success": true,
  "data": {
    "merchant_id": "64a1f2b3c4d5e6f7a8b9c0d1",
    "status": "trial",
    "pay_plan_type": "TRIAL",
    "is_store_enabled": true,
    "trial_end_date": "2026-03-31T08:00:00.000Z"
  }
}
```

#### Valid `status` Values

| Value | Condition |
|---|---|
| `"trial"` | `payPlanType === 'TRIAL'` and trial is active (not expired) |
| `"active"` | Merchant is on a paid plan (`LAUNCH`, `GROW`, `SCALE`) |
| `"suspended"` | `payPlanType === 'SUSPENDED'` |
| `"deactivated"` | Account manually deactivated by admin |

**Note:** `trial_end_date` is only populated when `status === 'trial'`. It is `null` for all other statuses.

#### Error Responses

| HTTP Status | Error Code | Condition | Consumer Action |
|---|---|---|---|
| `401 Unauthorized` | `UNAUTHORIZED` | Missing or expired token | Re-authenticate. |
| `404 Not Found` | `MERCHANT_NOT_FOUND` | No Store document found | Escalate. Should not occur in normal flow. |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Server error | Retry once after 5s. |

---

### 3.4 PATCH /api/v1/trial/onboarding-step — Internal

**Service:** `business-profile-api`
**Auth required:** Yes — Bearer token (merchant scope)
**Plan gate:** `TRIAL` only — returns `403` if not on trial

#### Purpose

Marks an onboarding checklist step as completed for the authenticated merchant. Called internally by the frontend when the system detects a step completion event (product created, store published, etc.). This is an **internal endpoint** not intended for third-party consumers.

#### Request Body

```json
{
  "step_id": "first_product"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `step_id` | String | Yes | Must be one of: `store_setup`, `first_product`, `page_builder`, `payment_gateway`, `kyb`, `store_published`. |

#### Success Response — 200 OK

```json
{
  "success": true,
  "data": {
    "onboarding_steps_completed": ["store_setup", "first_product"],
    "steps_completed_count": 2
  }
}
```

**Idempotency:** If `step_id` is already in `onboarding_steps_completed`, the call is a no-op and returns the current state with `200 OK`.

#### Error Responses

| HTTP Status | Error Code | Condition | Consumer Action |
|---|---|---|---|
| `400 Bad Request` | `INVALID_STEP_ID` | `step_id` is not a valid enum value | Fix the `step_id` value. |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing or expired token | Re-authenticate. |
| `403 Forbidden` | `NOT_ON_TRIAL` | Merchant is not on `TRIAL` plan | Do not call this endpoint for non-trial merchants. Guard on the frontend. |
| `500 Internal Server Error` | `INTERNAL_ERROR` | MongoDB write failure | Retry once after 2s. |

---

## 4. Background Job Contracts

Background jobs are not HTTP endpoints, but their inputs, outputs, and integration contracts are documented here for implementation clarity.

---

### 4.1 trial-expiry-checker

**Service:** `payment-integration-api`
**Scheduler:** Agenda (registered job)
**Schedule:** Every 1 hour (`0 * * * *`)
**Type:** Internal job — not HTTP-accessible

#### Purpose

Identifies trial merchants approaching expiry and emits email trigger signals to ST-08. Also serves as the recurring scheduler for all trial lifecycle drip email triggers.

#### Input Query (MongoDB)

```javascript
// merchant_trial_info collection
{
  trial_end_date: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  converted_to_paid: false
}
```

#### Idempotency Mechanism

Each notification threshold is tracked in a `notified_days` array on `merchant_trial_info`. Before emitting a trigger for a given day threshold, the job checks if the threshold is already in the array. If so, it skips.

```javascript
// Before emitting Day 13 notification:
if (record.notified_days.includes(13)) return; // skip
// After emitting:
await MerchantTrialInfo.updateOne({ merchant_id }, { $push: { notified_days: 13 } });
```

#### ST-08 Trigger Signal (emitted for each relevant merchant)

```json
{
  "event": "trial_notification",
  "merchant_id": "64a1f2b3c4d5e6f7a8b9c0d1",
  "day_threshold": 13,
  "trial_end_date": "2026-03-31T08:00:00.000Z",
  "merchant_email": "merchant@example.com",
  "store_name": "My Awesome Shop"
}
```

#### Error Handling

- If MongoDB query fails, job logs the error, increments an error counter, and alerts (Slack/PagerDuty) if error count > 3 consecutive runs.
- Individual merchant processing failures must not stop the batch — use `try/catch` per merchant with error logging.

---

### 4.2 trial-expiry-processor

**Service:** `payment-integration-api`
**Scheduler:** Agenda (registered job)
**Schedule:** Every 1 hour (`0 * * * *`)
**Type:** Internal job — not HTTP-accessible

#### Purpose

Suspends all trial merchants whose `trial_end_date` has passed and who have not converted to a paid plan.

#### Input Query (MongoDB)

```javascript
// merchant_trial_info collection
{
  trial_end_date: { $lt: new Date() },
  converted_to_paid: false
}
// Cross-reference: Store.payPlanType === 'TRIAL' (idempotency guard)
```

#### Processing Logic Per Matched Merchant

```
1. Fetch Store document: confirm payPlanType === 'TRIAL'
   → If payPlanType !== 'TRIAL': skip (already suspended or converted — no-op)

2. Call suspendMerchant(store_id, 'trial_expired') → ST-04

3. Update merchant_trial_info:
   - suspension_date = now

4. Emit to ST-08:
   - event: 'trial_expired_email'  → trigger trial-expired email
   - event: 'schedule_winback'     → schedule win-back at T+7 and T+30

5. Log: { merchant_id, action: 'suspended', reason: 'trial_expired', timestamp: now }
```

#### ST-04 Call Contract

```javascript
suspendMerchant(store_id: ObjectId, reason: 'trial_expired'): Promise<void>
```

This function is owned by ST-04. ST-03 is a caller only. The function sets:
- `Store.payPlanType = 'SUSPENDED'`
- `Store.isSuspended = true`
- `Store.suspendedAt = now`
- `Store.suspendedReason = 'trial_expired'`
- `Store.lastActivePlan = 'TRIAL'`

#### ST-08 Signal (emitted after successful suspension)

```json
{
  "event": "trial_expired_email",
  "merchant_id": "64a1f2b3c4d5e6f7a8b9c0d1",
  "trial_end_date": "2026-03-31T08:00:00.000Z",
  "merchant_email": "merchant@example.com",
  "store_name": "My Awesome Shop",
  "winback_schedule": ["T+7", "T+30"]
}
```

#### Error Handling

- `suspendMerchant()` failures must be caught per merchant. The job must not halt on one failure.
- If `suspendMerchant()` fails, log the error and leave `merchant_trial_info.suspension_date` unset. The next hourly run will retry.
- Alert if error rate > 5% of batch in a single run.

#### SLA

The `trial-expiry-processor` must complete processing for all expired trials within **1 hour** of `trial_end_date`. Maximum observed suspension delay is: `trial_end_date + (time until next hourly run) + (job execution time)`. For large batches, the job must be optimized to process concurrently (e.g., `Promise.allSettled` with batching).

---

## 5. Cross-Service Integration Reference

ST-03 integrates with several other subtasks. The contracts below describe ST-03's obligations as a **caller**.

### 5.1 ST-01 — Payment Abstraction Layer (Plan Conversion)

**Called when:** Merchant confirms plan, gateway, and billing cycle selection.

**Call:**

```javascript
// POST /api/v1/subscriptions/create (ST-01 internal endpoint)
{
  "merchant_id": "64a1f2b3c4d5e6f7a8b9c0d1",
  "plan_id": "GROW",
  "billing_cycle": "MONTHLY",
  "gateway": "STRIPE"
}
```

**ST-03 expectations from ST-01:**
- ST-01 handles all gateway routing (Stripe / Xendit), payment UI redirect, and webhook receipt.
- ST-01's success webhook triggers ST-03's post-conversion state update (FR-14).
- ST-01's failure callback must leave ST-03's `payPlanType` unchanged.
- ST-03 does not implement any payment processing logic.

### 5.2 ST-04 — Suspended Account State

**Called when:** `trial-expiry-processor` determines a trial has expired.

**Call:**

```javascript
suspendMerchant(store_id: ObjectId, reason: 'trial_expired'): Promise<void>
```

ST-03 does not own or implement the suspension lock screen. That is entirely ST-04's responsibility. ST-03 only triggers the suspension event.

### 5.3 ST-08 — Trial Email Drip Campaign

**Called when:** Trial lifecycle milestones are reached (Day 1, 3, 7, 10, 12, 13, expiry, win-back).

ST-03 emits event signals (JSON payloads) to ST-08's event handler. ST-08 owns all email content, template rendering, and delivery scheduling. ST-03 is not responsible for email delivery success or failure.

ST-03 must ensure that:
- Email triggers are emitted at most once per threshold per merchant (idempotency via `notified_days`).
- Triggers are cancelled when `converted_to_paid = true` (no further trial emails after conversion).

---

## 6. Error Model

### Common Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Bearer token missing, expired, or invalid. |
| `FORBIDDEN` | 403 | Authenticated merchant does not have permission (e.g., SUSPENDED plan hitting a plan-gated route). |
| `MERCHANT_NOT_FOUND` | 404 | No Store or `merchant_trial_info` document found for the authenticated merchant ID. |
| `EMAIL_ALREADY_EXISTS` | 409 | Signup attempted with an email already in Cognito. |
| `INVALID_STEP_ID` | 400 | `step_id` in onboarding-step PATCH is not a recognized enum value. |
| `NOT_ON_TRIAL` | 403 | A trial-only endpoint was called by a merchant not on the TRIAL plan. |
| `VALIDATION_ERROR` | 400 | One or more request body fields failed validation. `details` will contain field-level errors. |
| `INTERNAL_ERROR` | 500 | Unexpected server-side error. |
| `DEPENDENCY_UNAVAILABLE` | 503 | A downstream service (Cognito, MongoDB, ST-01) is unavailable. |

### Validation Error Detail Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        {
          "field": "email",
          "message": "Must be a valid email address."
        },
        {
          "field": "password",
          "message": "Must be at least 8 characters and include uppercase, lowercase, digit, and special character."
        }
      ]
    }
  }
}
```

---

## 7. Guard Rails for Consumers

### Retry Strategy

| Scenario | Recommended Retry |
|---|---|
| `5xx` responses from any ST-03 endpoint | Exponential backoff: 1s, 2s, 4s. Max 3 attempts. |
| `401 Unauthorized` | Refresh Cognito token once, then retry once. If still 401, redirect to login. |
| `409 Conflict` (signup) | Do not retry. Show error to user and redirect to login. |
| `503 Service Unavailable` | Wait 30s, retry once. If still unavailable, show maintenance message. |
| Background jobs (internal) | Agenda handles retries. Default: 3 retries with 1-minute backoff. |

### Idempotency

- `PATCH /api/v1/trial/onboarding-step`: Idempotent. Calling with the same `step_id` multiple times is safe.
- `POST /v1/users/signup`: **Not idempotent.** Submitting the same email twice returns `409`. Do not retry on success.
- `GET` endpoints: Fully idempotent. Safe to retry without side effects.
- Background jobs: Idempotent by design (FR-15, FR-16 specify idempotency guards).

### Rate Limits

| Endpoint | Rate Limit | Scope |
|---|---|---|
| `POST /v1/users/signup` | 10 requests/minute | Per IP address |
| `GET /api/v1/trial/status` | 60 requests/minute | Per authenticated merchant |
| `PATCH /api/v1/trial/onboarding-step` | 30 requests/minute | Per authenticated merchant |
| `GET /api/v1/merchant/status` | 60 requests/minute | Per authenticated merchant |

When rate-limited, the API returns `429 Too Many Requests` with a `Retry-After` header indicating the seconds to wait.

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 30 seconds.",
    "details": { "retry_after_seconds": 30 }
  }
}
```

### Pagination

No ST-03 endpoints return paginated lists. The `onboarding_steps_completed` array is bounded to 6 items maximum and does not require pagination.

### Timeouts

| Endpoint | Recommended Client Timeout |
|---|---|
| `GET /api/v1/trial/status` | 5 seconds |
| `PATCH /api/v1/trial/onboarding-step` | 5 seconds |
| `GET /api/v1/merchant/status` | 5 seconds |
| `POST /v1/users/signup` | 15 seconds (Cognito provisioning may take longer) |

### React / Frontend Consumer Notes

- Call `GET /api/v1/trial/status` **once on dashboard mount**. Store the result in a React context (e.g., `TrialContext`). Do not call it on every component render.
- The trial banner, onboarding checklist, and conversion prompts must all consume from `TrialContext` — no individual components should make redundant calls to the trial status endpoint.
- When `is_on_trial: false`, suppress all trial UI components entirely (do not render empty containers).
- Session-dismissed prompts (Day 12 / Day 13 "Maybe Later") must be tracked in `sessionStorage`, not in the API. The API is the source of truth for trial state; session dismissal is a UI-only concern.
- The trial banner countdown (`days_remaining`) reflects the server-computed value from `GET /api/v1/trial/status`. Do not compute it independently on the client to avoid clock skew.

### Security Notes

- The `PATCH /api/v1/trial/onboarding-step` endpoint is authenticated and plan-gated. It must not be callable by unauthenticated clients or by merchants not on the `TRIAL` plan.
- Signup `POST /v1/users/signup` must validate email format server-side even if client-side validation is present. Never trust client-only validation.
- The `merchant_id` must always be resolved from the JWT token's `sub` claim, not from a client-supplied parameter. Clients must never pass `merchant_id` in the request body for authenticated endpoints.
