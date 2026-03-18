---
id: st-08-trial-email-drip-campaign
title: Endpoint Document. ST-08 Trial Email Drip Campaign
sidebar_label: ST-08 Trial Email Drip Campaign
sidebar_position: 8
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-18
- Status: Draft
- Feature Slug: trial-email-drip-campaign

## Linked Documents
- BRD: BRD-Trial Email Drip Campaign.md
- PRD: PRD-Trial Email Drip Campaign.md

---

## Public API Overview

The Trial Email Drip Campaign exposes a set of **internal service APIs** consumed by other Prosperna microservices. These are not publicly accessible to merchants or third parties — they are authenticated service-to-service contracts. The campaign has no merchant-facing or admin-facing REST API surface for v3.

The APIs fall into two categories:

1. **REST endpoints** on `payment-integration-api` (which owns Agenda.js) that manage drip email scheduling, cancellation, and rescheduling.
2. **Background job contracts** for the daily `win-back-email-sender` job.

> **Note on the Day 14 expired email:** The `trial-expiry-processor` (ST-03) calls `POST /api/v1/trial-drip/send-expired` directly at the moment it suspends an account. This is a synchronous internal call, not a pre-scheduled Agenda job.

---

## Audience and Use Cases

| Consumer | Use Case |
|---|---|
| `user-service-api` or `business-profile-api` (sign-up handler, via ST-03) | Calls `POST /api/v1/trial-drip/schedule` after a new trial merchant is created. |
| `trial-expiry-processor` (ST-03) | Calls `POST /api/v1/trial-drip/send-expired` when suspending a trial-expired account. |
| Plan activation handler (ST-01) | Calls `DELETE /api/v1/trial-drip/{merchantId}` when a merchant converts to a paid plan. |
| Unsubscribe handler (email-service-api or business-profile-api) | Calls `DELETE /api/v1/trial-drip/{merchantId}?reason=unsubscribed` when a merchant clicks unsubscribe. |
| Account deletion handler (user-service-api) | Calls `DELETE /api/v1/trial-drip/{merchantId}?reason=account_deleted` when an account is deleted. |
| Admin trial extension handler (ST-12) | Calls `PUT /api/v1/trial-drip/{merchantId}/reschedule` when an admin updates `trial_end_date`. |
| `win-back-email-sender` (internal Agenda daily job) | No external API call — this is an internal Agenda job contract documented as a scheduled job spec. |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `http://localhost:3004` | Local development and unit testing | Email sending disabled; Agenda jobs logged only |
| Staging | `https://staging-api.prosperna.com/payment-integration` | Integration testing | Email sends routed to catch-all test inbox |
| Production | `https://api.prosperna.com/payment-integration` | Live system | Full email sending active |

> All endpoints in this document are hosted on `payment-integration-api` (port 3004 in development).

---

## API Versioning and Compatibility

- All endpoints are versioned under `/api/v1/`.
- Breaking changes require a version bump (e.g., `/api/v2/`).
- Additive changes (new optional fields, new query parameters) are backwards-compatible and do not require a version bump.
- Consumers must not rely on undocumented fields in response bodies.

---

## Protocol and Data Format Standards

- **Protocol:** HTTPS (TLS 1.2+) for all non-development environments
- **Data format:** JSON (`application/json`) for all request and response bodies
- **Date format:** ISO 8601 (`2026-03-18T00:00:00.000Z`) for all date/time fields
- **Character encoding:** UTF-8
- **HTTP methods:** POST, PUT, DELETE as documented per endpoint

---

## Authentication and Authorization

All endpoints require **service-to-service authentication** using an internal API key or service token:

- **Header:** `Authorization: Bearer <internal-service-token>`
- Tokens are provisioned per service via the Prosperna internal secrets management system.
- No merchant-facing JWT or session token is accepted on these endpoints.
- All calls must originate from within the Prosperna internal network (VPC-restricted in production).

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| Internal service (ST-03, ST-01, ST-12, email handlers) | Schedule, cancel, send expired, reschedule | Must provide valid service token |
| Agenda job runner (win-back-email-sender) | Internal only — no REST call | Runs inside Agenda; reads MongoDB directly |
| Merchant (end user) | Unsubscribe via link only | Unsubscribe link calls the handler indirectly via a separate unsubscribe endpoint |
| Admin | None directly | Admin trial extension routes through ST-12 which calls the reschedule endpoint |
| Public / unauthenticated | None | All endpoints are VPC-internal |

---

## Ownership and Data Access Rules

- Each operation on `/api/v1/trial-drip/{merchantId}` is scoped to the `merchantId` path parameter.
- A calling service cannot cancel or reschedule drip jobs for a `merchantId` it did not originate.
- The `win-back-email-sender` job only queries merchants where `suspendedReason === 'trial_expired'` — it must not process merchants suspended for other reasons.

---

## Request Conventions

- All `merchantId` values are MongoDB ObjectId strings (24 hex characters).
- Optional query parameters use snake_case (e.g., `?reason=unsubscribed`).
- Request bodies are JSON with snake_case field names.
- All timestamps in request bodies must be ISO 8601.
- Omitting optional fields is acceptable; the server will use defaults or existing values.

---

## Response Conventions

- **Success responses:** `200 OK` for GET/PUT, `201 Created` for POST, `204 No Content` for DELETE.
- **Error responses:** Always use the Global Error Model defined below.
- All response bodies include a `requestId` field for traceability.
- Empty `204` responses have no body.

---

## Global Guard Rails (Consumer Safety)

1. **Idempotency:** `POST /schedule` is idempotent — calling it multiple times for the same `merchantId` will not create duplicate Agenda jobs (checked via `drip_emails_sent` and existing job presence in Agenda queue).
2. **Cancellation safety:** `DELETE /{merchantId}` is safe to call multiple times — cancelling already-cancelled or non-existent jobs returns `204` without error.
3. **Reschedule guard:** `PUT /{merchantId}/reschedule` will not reschedule emails already present in `drip_emails_sent`.
4. **Service timeout:** Callers should set a 5-second timeout on all requests to this API.
5. **Retry on 5xx:** Callers may retry on `500` and `503` responses with exponential backoff (max 3 retries). Do NOT retry `400` or `409` responses.
6. **Do not poll:** These are fire-and-forget scheduling calls. Do not poll for completion status.

---

## Rate Limits and Abuse Controls

| Bucket | Limit | Window | Applies To |
|---|---|---|---|
| Schedule | 100 requests | 1 minute | `POST /schedule` |
| Cancel | 100 requests | 1 minute | `DELETE /{merchantId}` |
| Reschedule | 50 requests | 1 minute | `PUT /{merchantId}/reschedule` |
| Send Expired | 200 requests | 1 minute | `POST /send-expired` |

> Rate limits are per calling service token, not per merchant. These limits are generous by design — the calling services are trusted internal consumers.

---

## Global Error Model

Use this standard structure for all error responses:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "TRIAL_DRIP_INVALID_MERCHANT",
    "type": "VALIDATION_ERROR",
    "message": "The provided merchantId does not correspond to a valid trial merchant.",
    "details": [
      {
        "field": "merchantId",
        "issue": "NOT_FOUND",
        "expected": "A valid ObjectId of a merchant in TRIAL payPlanType",
        "actual": "507f1f77bcf86cd799439099"
      }
    ],
    "requestId": "req_7f3a2b1c9d4e",
    "timestamp": "2026-03-18T08:00:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.internal.prosperna.com/trial-drip"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `scheduleDrip` | POST | `/api/v1/trial-drip/schedule` | Internal service token | Schedule all 6 drip email Agenda jobs for a new trial merchant | Schedule | FR-9 |
| `cancelDrip` | DELETE | `/api/v1/trial-drip/{merchantId}` | Internal service token | Cancel all pending drip email jobs; reason determines field update | Cancel | FR-13, FR-16, FR-19 |
| `sendExpired` | POST | `/api/v1/trial-drip/send-expired` | Internal service token | Immediately send the Day 14 trial expired email | Send Expired | FR-10 |
| `rescheduleDrip` | PUT | `/api/v1/trial-drip/{merchantId}/reschedule` | Internal service token | Cancel and reschedule remaining unsent drip emails to a new trial end date | Reschedule | FR-24, FR-25, FR-26 |
| `winBackEmailSender` | — | Agenda daily job (internal) | Internal Agenda runner | Scans for T+7 and T+30 eligible merchants and sends win-back emails | — | FR-11, FR-12 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. Schedule Drip Campaign

**Operation ID:** `scheduleDrip`

**Purpose:** Called by the trial sign-up flow (via ST-03) when a new trial merchant is created. Schedules 6 Agenda jobs for the drip email sequence. Idempotent — safe to call if jobs are already scheduled.

**Method:** `POST`
**Path:** `/api/v1/trial-drip/schedule`
**Auth:** Bearer internal service token

#### Parameters

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | Body | String (ObjectId) | Yes | 24-char hex | The merchant's unique identifier |
| `trialStartDate` | Body | String (ISO 8601) | Yes | Must be a valid date, not in the past by more than 1 day | The merchant's trial start timestamp |
| `trialEndDate` | Body | String (ISO 8601) | Yes | Must be `trialStartDate + 14 days` | The merchant's trial end timestamp |

#### Request Body Schema

```json
{
  "merchantId": "string (ObjectId)",
  "trialStartDate": "string (ISO 8601 datetime)",
  "trialEndDate": "string (ISO 8601 datetime)"
}
```

#### Request Example

```bash
curl -X POST https://api.prosperna.com/payment-integration/api/v1/trial-drip/schedule \
  -H "Authorization: Bearer <internal-service-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "507f1f77bcf86cd799439011",
    "trialStartDate": "2026-03-18T00:00:00.000Z",
    "trialEndDate": "2026-04-01T00:00:00.000Z"
  }'
```

#### Success Response — `201 Created`

```json
{
  "requestId": "req_abc123",
  "merchantId": "507f1f77bcf86cd799439011",
  "scheduledJobs": [
    { "emailType": "welcome",       "fireAt": "2026-03-18T00:01:00.000Z" },
    { "emailType": "check-in",      "fireAt": "2026-03-21T00:00:00.000Z" },
    { "emailType": "mid-trial",     "fireAt": "2026-03-25T00:00:00.000Z" },
    { "emailType": "urgency",       "fireAt": "2026-03-28T00:00:00.000Z" },
    { "emailType": "strong-nudge",  "fireAt": "2026-03-30T00:00:00.000Z" },
    { "emailType": "final-warning", "fireAt": "2026-03-31T00:00:00.000Z" }
  ],
  "idempotent": false
}
```

> When the call is idempotent (jobs already exist and `drip_emails_sent` already has entries), the response returns `200 OK` with `"idempotent": true` and the existing schedule.

#### Error Path Table

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `TRIAL_DRIP_INVALID_MERCHANT` | `merchantId` is not a valid ObjectId or merchant not found | Fix the merchantId and retry |
| 400 | `TRIAL_DRIP_INVALID_DATE` | `trialStartDate` or `trialEndDate` is missing, invalid, or inconsistent | Verify date values |
| 409 | `TRIAL_DRIP_ALREADY_SCHEDULED` | All 6 jobs are already scheduled and no emails have been sent yet | No action needed — jobs exist |
| 500 | `TRIAL_DRIP_SCHEDULE_FAILED` | Agenda failed to enqueue jobs | Retry with exponential backoff (max 3) |
| 503 | `TRIAL_DRIP_SERVICE_UNAVAILABLE` | payment-integration-api is unavailable | Retry after a brief delay |

#### Error Response Example

```json
{
  "error": {
    "httpStatus": 400,
    "code": "TRIAL_DRIP_INVALID_DATE",
    "type": "VALIDATION_ERROR",
    "message": "trialEndDate must be exactly 14 days after trialStartDate.",
    "details": [
      {
        "field": "trialEndDate",
        "issue": "INVALID_VALUE",
        "expected": "2026-04-01T00:00:00.000Z",
        "actual": "2026-03-25T00:00:00.000Z"
      }
    ],
    "requestId": "req_abc124",
    "timestamp": "2026-03-18T08:00:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.internal.prosperna.com/trial-drip"
  }
}
```

#### Guard Rails

- **Idempotency:** Safe to call multiple times. The endpoint checks `drip_emails_sent` and existing Agenda jobs before scheduling.
- **Timeout:** Set a 5-second timeout. If the Agenda queue is slow, retry once after 2 seconds.
- **Do not retry 409:** A `409` means jobs are already scheduled. No action needed.

---

### 2. Cancel Drip Campaign

**Operation ID:** `cancelDrip`

**Purpose:** Cancels all pending `send-trial-email:*` Agenda jobs for a merchant. Called on plan conversion, unsubscribe, or account deletion. The `reason` query parameter determines which fields are updated on `merchant_trial_info`.

**Method:** `DELETE`
**Path:** `/api/v1/trial-drip/{merchantId}`
**Auth:** Bearer internal service token

#### Parameters

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | Path | String (ObjectId) | Yes | 24-char hex | The merchant's unique identifier |
| `reason` | Query | String (enum) | Yes | One of: `converted`, `unsubscribed`, `account_deleted` | Reason for cancellation; determines which fields are written to `merchant_trial_info` |
| `convertedPlan` | Query | String | Conditional | Required if `reason=converted`. One of: `launch`, `grow`, `scale` | The plan the merchant converted to |

#### Request Example — Conversion

```bash
curl -X DELETE "https://api.prosperna.com/payment-integration/api/v1/trial-drip/507f1f77bcf86cd799439011?reason=converted&convertedPlan=grow" \
  -H "Authorization: Bearer <internal-service-token>"
```

#### Request Example — Unsubscribe

```bash
curl -X DELETE "https://api.prosperna.com/payment-integration/api/v1/trial-drip/507f1f77bcf86cd799439011?reason=unsubscribed" \
  -H "Authorization: Bearer <internal-service-token>"
```

#### Success Response — `204 No Content`

No body. All pending drip Agenda jobs for the merchant have been cancelled and `merchant_trial_info` has been updated.

#### Fields Updated by Reason

| Reason | Fields Written to `merchant_trial_info` |
|---|---|
| `converted` | `converted_to_paid = true`, `conversion_date = now`, `converted_plan = convertedPlan param` |
| `unsubscribed` | `unsubscribed = true`, `unsubscribed_at = now` |
| `account_deleted` | `account_deleted = true`, `account_deleted_at = now` |

#### Error Path Table

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `TRIAL_DRIP_INVALID_REASON` | `reason` param is missing or not one of the valid enum values | Fix the reason param |
| 400 | `TRIAL_DRIP_MISSING_PLAN` | `reason=converted` but `convertedPlan` is missing | Provide the `convertedPlan` param |
| 400 | `TRIAL_DRIP_INVALID_MERCHANT` | `merchantId` is not a valid ObjectId | Fix the merchantId |
| 404 | `TRIAL_DRIP_MERCHANT_NOT_FOUND` | No trial record exists for this merchantId | Verify merchantId; may already be deleted |
| 500 | `TRIAL_DRIP_CANCEL_FAILED` | Agenda failed to cancel jobs | Retry up to 3 times |

#### Guard Rails

- **Idempotency:** Safe to call multiple times. Cancelling already-cancelled or non-existent jobs returns `204` without error.
- **Do not retry 404:** The merchant record is not found. Do not loop.
- **Timeout:** 5-second timeout.

---

### 3. Send Trial Expired Email

**Operation ID:** `sendExpired`

**Purpose:** Immediately renders and sends the Day 14 trial expired email (`trial/expired.hbs`) to the merchant. Called synchronously by `trial-expiry-processor` at the exact moment it suspends a trial-expired account. Not a pre-scheduled Agenda job.

**Method:** `POST`
**Path:** `/api/v1/trial-drip/send-expired`
**Auth:** Bearer internal service token

#### Parameters

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | Body | String (ObjectId) | Yes | 24-char hex | The merchant's unique identifier |
| `suspendedAt` | Body | String (ISO 8601) | Yes | Must be now or very recent (within 60 seconds) | The exact suspension timestamp |

#### Request Body Schema

```json
{
  "merchantId": "string (ObjectId)",
  "suspendedAt": "string (ISO 8601 datetime)"
}
```

#### Request Example

```bash
curl -X POST https://api.prosperna.com/payment-integration/api/v1/trial-drip/send-expired \
  -H "Authorization: Bearer <internal-service-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "507f1f77bcf86cd799439011",
    "suspendedAt": "2026-04-01T00:05:42.000Z"
  }'
```

#### Success Response — `200 OK`

```json
{
  "requestId": "req_exp789",
  "merchantId": "507f1f77bcf86cd799439011",
  "emailType": "expired",
  "sentAt": "2026-04-01T00:05:43.120Z",
  "idempotent": false
}
```

> If `expired` is already in `drip_emails_sent` (idempotent call), returns `200 OK` with `"idempotent": true`. Email is not re-sent.

#### Error Path Table

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `TRIAL_DRIP_INVALID_MERCHANT` | Invalid merchantId | Fix and retry |
| 400 | `TRIAL_DRIP_NOT_SUSPENDED` | Merchant is not in SUSPENDED state | Do not retry; investigate suspension state |
| 409 | `TRIAL_DRIP_ALREADY_SENT` | `expired` already in `drip_emails_sent` | No action needed — email was already sent |
| 422 | `TRIAL_DRIP_CONVERTED_MERCHANT` | Merchant has `converted_to_paid = true` | Do not send — merchant converted. No action needed. |
| 422 | `TRIAL_DRIP_UNSUBSCRIBED` | Merchant has `unsubscribed = true` | Do not send — merchant unsubscribed. No action needed. |
| 500 | `TRIAL_DRIP_SEND_FAILED` | Nodemailer/SMTP error | Retry once after 2 seconds. If still fails, log and proceed (do not block suspension). |

#### Guard Rails

- **Idempotency:** Safe to call multiple times. If `expired` is already logged in `drip_emails_sent`, the email is not re-sent.
- **Non-blocking:** A failed send should NOT block or roll back the account suspension. The account suspension (ST-03) must proceed regardless of email send outcome. Log the failure and surface via telemetry.
- **Timeout:** Set a 5-second timeout. If it times out, log and proceed — do not block the suspension flow.
- **Suppression checks:** The endpoint checks `converted_to_paid` and `unsubscribed` before sending.

---

### 4. Reschedule Drip Campaign

**Operation ID:** `rescheduleDrip`

**Purpose:** Called when an admin extends a merchant's trial (via ST-12). Cancels all remaining unsent drip email Agenda jobs and reschedules them relative to the new `trial_end_date`. Already-sent emails (in `drip_emails_sent`) are not re-sent.

**Method:** `PUT`
**Path:** `/api/v1/trial-drip/{merchantId}/reschedule`
**Auth:** Bearer internal service token

#### Parameters

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | Path | String (ObjectId) | Yes | 24-char hex | The merchant's unique identifier |
| `newTrialEndDate` | Body | String (ISO 8601) | Yes | Must be in the future | The new trial end date after admin extension |

#### Request Body Schema

```json
{
  "newTrialEndDate": "string (ISO 8601 datetime)"
}
```

#### Request Example

```bash
curl -X PUT https://api.prosperna.com/payment-integration/api/v1/trial-drip/507f1f77bcf86cd799439011/reschedule \
  -H "Authorization: Bearer <internal-service-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "newTrialEndDate": "2026-04-08T00:00:00.000Z"
  }'
```

#### Success Response — `200 OK`

```json
{
  "requestId": "req_res456",
  "merchantId": "507f1f77bcf86cd799439011",
  "newTrialEndDate": "2026-04-08T00:00:00.000Z",
  "cancelledJobs": ["strong-nudge", "final-warning"],
  "rescheduledJobs": [
    { "emailType": "strong-nudge",  "fireAt": "2026-04-06T00:00:00.000Z" },
    { "emailType": "final-warning", "fireAt": "2026-04-07T00:00:00.000Z" }
  ],
  "skippedAlreadySent": ["welcome", "check-in", "mid-trial", "urgency"]
}
```

#### Error Path Table

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `TRIAL_DRIP_INVALID_MERCHANT` | Invalid merchantId | Fix and retry |
| 400 | `TRIAL_DRIP_INVALID_DATE` | `newTrialEndDate` is in the past or missing | Provide a future date |
| 404 | `TRIAL_DRIP_MERCHANT_NOT_FOUND` | No trial record found for this merchantId | Verify merchantId |
| 422 | `TRIAL_DRIP_CONVERTED_MERCHANT` | Merchant has already converted — no active drip to reschedule | No action needed |
| 500 | `TRIAL_DRIP_RESCHEDULE_FAILED` | Agenda failed to cancel or re-enqueue jobs | Retry up to 3 times with exponential backoff |

#### Guard Rails

- **Already-sent protection:** The endpoint reads `drip_emails_sent` and excludes those email types from rescheduling.
- **Atomicity:** Cancel all pending jobs before re-scheduling. If re-scheduling fails after cancellation, retry the reschedule step (cancellation is idempotent).
- **Timeout:** 5-second timeout.

---

### 5. Win-Back Email Sender Job (Internal Agenda Job Contract)

**Operation ID:** `winBackEmailSender`
**Type:** Agenda.js daily job (not a REST endpoint)
**Registered by:** ST-15

**Purpose:** Runs daily to find eligible suspended merchants and send T+7 or T+30 win-back emails. Applies all suppression checks before sending.

#### Job Trigger

Runs once per day at a configured time (e.g., 08:00 UTC). Registered in Agenda as a recurring job by ST-15.

#### Processing Logic

For each execution, the job runs two passes:

**Pass 1 — T+7 Win-Back:**
1. Query `stores` collection for merchants where `suspendedReason === 'trial_expired'` AND `suspendedAt` is between `now - 7 days 23h 59m` and `now - 7 days` (to handle the daily job window).
2. For each matching merchant:
   a. Check `converted_to_paid === false` — skip if true.
   b. Check `unsubscribed === false` — skip if true.
   c. Check account exists and `account_deleted !== true` — skip if deleted.
   d. Check `drip_emails_sent` does not include `"win-back-7"` — skip if already sent (idempotency).
   e. Assemble context: `firstName`, `productsCount`, `pagesCount`, `ordersCount`, `planSelectionUrl`.
   f. Render and send `trial/win-back-7.hbs`.
   g. Append `"win-back-7"` to `drip_emails_sent`.
   h. Emit `trial_drip_email_sent` telemetry event.
3. If suppressed for any reason, emit `trial_drip_winback_suppressed` event with reason.

**Pass 2 — T+30 Win-Back:** Same logic but `suspendedAt` is 30 days ago and email type is `"win-back-30"` using `trial/win-back-30.hbs`.

#### Suppression Conditions (all must pass for email to be sent)

| Condition | Check | Suppression Reason |
|---|---|---|
| Not converted | `converted_to_paid === false` | `converted` |
| Not unsubscribed | `unsubscribed === false` | `unsubscribed` |
| Account exists | Account record found in DB | `account_deleted` |
| Account not deleted | `account_deleted !== true` | `account_deleted` |
| Not already sent | Email type not in `drip_emails_sent` | `already_sent` |
| Correct suspension reason | `suspendedReason === 'trial_expired'` | `wrong_suspension_reason` |

#### Personalization Context for Win-Back Emails

| Variable | Source | Fallback |
|---|---|---|
| `firstName` | `users.firstName` | `"there"` (e.g., "Hi there,") |
| `productsCount` | Count from products-service-api by `store_id` | `0` |
| `pagesCount` | Count from business-profile-api by `store_id` | `0` |
| `ordersCount` | Count from orders-service-api by `store_id` | `0` |
| `planSelectionUrl` | Constructed as `/suspended` | `/suspended` |

#### Error Handling

| Error | Behaviour |
|---|---|
| Downstream service unavailable (personalization fetch) | Use fallback values; proceed with send |
| Nodemailer SMTP failure | Retry per Agenda retry policy; mark failed after exhaustion; continue to next merchant |
| Single merchant processing failure | Log error; continue processing remaining merchants in batch |
| Job execution failure (critical) | Agenda marks job as failed; ST-15 monitors Agenda job health |

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` (path) | Path | String | Yes | 24-char hex ObjectId | Identifies the merchant |
| `merchantId` (body) | Body | String | Yes | 24-char hex ObjectId | Identifies the merchant (in POST bodies) |
| `trialStartDate` | Body | String ISO 8601 | Yes (schedule only) | Not in past by >1 day | Trial start timestamp |
| `trialEndDate` | Body | String ISO 8601 | Yes (schedule only) | = `trialStartDate + 14 days` | Trial end timestamp |
| `newTrialEndDate` | Body | String ISO 8601 | Yes (reschedule only) | Must be in the future | New trial end after admin extension |
| `suspendedAt` | Body | String ISO 8601 | Yes (send-expired only) | Within 60 seconds of now | Suspension timestamp |
| `reason` | Query | String enum | Yes (cancel only) | `converted`, `unsubscribed`, `account_deleted` | Cancellation reason |
| `convertedPlan` | Query | String | Conditional | Required if `reason=converted` | Plan selected at conversion |

---

## Request/Response Contract Notes

- `merchantId` is always a 24-character MongoDB ObjectId hex string. Do not pass UUID formats.
- Dates must be ISO 8601 with timezone offset (UTC `Z` suffix preferred). Dates without timezone are rejected.
- The `reason` enum for `DELETE` is strictly validated. Unknown values return `400 TRIAL_DRIP_INVALID_REASON`.
- `scheduledJobs` in the `POST /schedule` response reflects actual Agenda job fire times in UTC — these may differ slightly from the exact `trialStartDate + N days` offset due to job processing time.
- Win-back job processing is eventual — the job runs daily and processes merchants in batch. There is no real-time guarantee that T+7 fires exactly at the 7-day mark; it will fire within 24 hours of the 7-day mark.

---

## Idempotency and Concurrency Notes

| Endpoint | Idempotency Key | Behaviour |
|---|---|---|
| `POST /schedule` | `merchantId` + Agenda job presence + `drip_emails_sent` state | Returns `200` with `idempotent: true` if jobs already exist |
| `DELETE /{merchantId}` | Any number of calls for same merchantId and reason | Always returns `204`; duplicate cancellations are no-ops |
| `POST /send-expired` | `merchantId` + `drip_emails_sent` contains `"expired"` | Returns `200` with `idempotent: true`; email not re-sent |
| `PUT /{merchantId}/reschedule` | `merchantId` + `drip_emails_sent` for already-sent guard | Already-sent emails are excluded from rescheduling |
| Win-back job | `drip_emails_sent` contains `"win-back-7"` or `"win-back-30"` | Skips send if already sent |

**Concurrency:** If two callers simultaneously call `POST /schedule` for the same `merchantId`, the second call will detect existing Agenda jobs and return `200 idempotent: true`. MongoDB-level check should use an upsert or findOneAndUpdate with a condition guard to prevent race conditions.

---

## Security and Privacy Notes

- All endpoints are VPC-internal. They must not be exposed on any public-facing gateway.
- Service tokens must be rotated per the Prosperna secrets management rotation policy.
- Merchant PII (first name, store name, counts) is only fetched at send time and is not stored in the Agenda job payload. The job payload contains only `merchantId` and `emailType`.
- No payment or financial data appears in any email or API response from this service.
- Log redaction: `firstName` and `email` must be redacted or masked in error logs and Agenda job logs.

---

## Domain Events and Webhooks

The Trial Email Drip Campaign emits the following internal events (via the Prosperna internal event bus or direct telemetry calls):

| Event | Trigger | Payload Fields |
|---|---|---|
| `trial_drip_scheduled` | `POST /schedule` succeeds | `merchantId`, `scheduledJobs[]` |
| `trial_drip_email_sent` | Any drip email successfully delivered | `merchantId`, `emailType`, `sentAt`, `variant` |
| `trial_drip_email_failed` | All retries exhausted for a send | `merchantId`, `emailType`, `errorCode`, `retryCount` |
| `trial_drip_cancelled` | `DELETE /{merchantId}` succeeds | `merchantId`, `reason`, `cancelledJobCount`, `cancelledAt` |
| `trial_drip_rescheduled` | `PUT /{merchantId}/reschedule` succeeds | `merchantId`, `newTrialEndDate`, `rescheduledJobs[]` |
| `trial_drip_winback_suppressed` | Win-back job suppresses a send | `merchantId`, `emailType`, `suppressionReason` |
| `trial_drip_duplicate_detected` | Idempotency guard fires | `merchantId`, `emailType`, `detectedAt` |

---

## SDK and Integration Examples

### Calling from Node.js (user-service-api or ST-03 sign-up handler)

```javascript
// After ST-03 creates merchant_trial_info
const axios = require('axios');

async function scheduleTrialDrip(merchantId, trialStartDate, trialEndDate) {
  const response = await axios.post(
    `${process.env.PAYMENT_API_BASE_URL}/api/v1/trial-drip/schedule`,
    { merchantId, trialStartDate, trialEndDate },
    {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}` },
      timeout: 5000,
    }
  );
  return response.data;
}
```

### Calling cancel on plan conversion (ST-01 plan activation handler)

```javascript
async function cancelTrialDripOnConversion(merchantId, convertedPlan) {
  await axios.delete(
    `${process.env.PAYMENT_API_BASE_URL}/api/v1/trial-drip/${merchantId}`,
    {
      params: { reason: 'converted', convertedPlan },
      headers: { Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}` },
      timeout: 5000,
    }
  );
}
```

### Calling reschedule from ST-12 admin trial extension

```javascript
async function rescheduleTrialDrip(merchantId, newTrialEndDate) {
  const response = await axios.put(
    `${process.env.PAYMENT_API_BASE_URL}/api/v1/trial-drip/${merchantId}/reschedule`,
    { newTrialEndDate },
    {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}` },
      timeout: 5000,
    }
  );
  return response.data;
}
```

---

## How to Use This API Safely

1. **Always set timeouts.** All callers must set a 5-second timeout. These are internal calls and should be fast. If they're not, something is wrong.
2. **Retry 5xx with backoff, not 4xx.** `400`, `404`, `409`, and `422` indicate caller-side issues — retrying won't help.
3. **Trust idempotency.** You can safely call `/schedule` more than once for the same merchant. The endpoint handles duplicates.
4. **Cancel before you reschedule.** `PUT /reschedule` handles its own cancellation internally — do not manually cancel and then reschedule in two separate calls.
5. **Do not block suspension on email failure.** The `POST /send-expired` call must never block the account suspension flow. Call it fire-and-style if needed; the suspension must proceed.
6. **Let the win-back job do its own filtering.** Do not manually call any win-back endpoint. The `win-back-email-sender` Agenda job applies all suppression checks internally and is the authoritative sender.

---

## Change Impact

| Change | Impacted Endpoints | Required Action |
|---|---|---|
| Plan pricing changes | All templates (hard-coded amounts) | Update template `.hbs` files; no API change |
| New email added to sequence | `POST /schedule` (add new job), `DELETE` (add new cancellable job) | Update scheduling and cancellation logic; bump version if breaking |
| `merchant_trial_info` field name change | All endpoints that write to it | Update field references; coordinate with ST-03 |
| Agenda.js replaced with different job queue | All endpoints | Internal change; API contract unchanged |
| `suspendedReason` enum adds new value | Win-back job filter | Ensure new values do not accidentally match `trial_expired` filter |
| New suppression condition for win-back | Win-back job | Add condition to both T+7 and T+30 passes |

---

## Open Questions

| # | Question | Assumption Used |
|---|---|---|
| OEQ-1 | What is the exact Agenda retry count (N) for failed email sends, and what is the retry backoff strategy? | Assumed Agenda built-in retry with exponential backoff; exact N to be confirmed with engineering. |
| OEQ-2 | Should `POST /send-expired` be synchronous (waits for Nodemailer delivery) or fire-and-forget (enqueues a one-time Agenda job)? | Assumed synchronous; but fire-and-forget with a one-time Agenda job is acceptable if latency is a concern. |
| OEQ-3 | What is the exact daily run time for `win-back-email-sender`? Is it configurable by environment? | Assumed 08:00 UTC daily; configurable via ST-15 cron registration. |
| OEQ-4 | What is the exact `suspendedAt` window the win-back job uses for "exactly 7 days ago" — is it a 24-hour rolling window or a strict date equality? | Assumed a 24-hour rolling window (`suspendedAt >= now - 8 days AND suspendedAt < now - 7 days`) to handle daily job timing drift. |
| OEQ-5 | Are there rate limits on the downstream services (products-service-api, orders-service-api) for count queries used in win-back personalization? | Assumed internal service calls have no rate limits within VPC; to be verified with service owners. |
