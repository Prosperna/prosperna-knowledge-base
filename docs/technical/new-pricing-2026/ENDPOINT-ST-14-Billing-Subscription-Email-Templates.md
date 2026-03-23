---
id: st-14-billing-subscription-email-templates
title: Endpoint Document. ST-14 Billing Subscription Email Templates
sidebar_label: ST-14 Billing Subscription Email Templates
sidebar_position: 14
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft
- Feature Slug: billing-subscription-email-templates
- Subtask Reference: ST-14 (Pricing Restructuring Initiative)

## Linked Documents
- BRD: BRD-Billing-Subscription-Email-Templates.md
- PRD: PRD-Billing-Subscription-Email-Templates.md

---

## Public API Overview

The `email-service-api` provides a set of internal HTTP endpoints for sending transactional billing and subscription emails to Prosperna merchants. These endpoints are not public-facing — they are called exclusively by internal Prosperna services (`payment-integration-api`, `business-profile-api`, and usage limit services).

ST-14 updates three existing billing email endpoints and adds five new endpoints to support new lifecycle events introduced by the pricing restructuring (v3). All endpoints accept JSON request bodies, render the appropriate Handlebars template server-side, and dispatch via AWS SES.

**New endpoints added by ST-14:**
- `POST /v1/billing/cancellation`
- `POST /v1/billing/payment-failure`
- `POST /v1/billing/usage-notification`
- `POST /v1/billing/overage-invoice`
- `POST /v1/billing/reactivation`

**Existing endpoints updated by ST-14 (extended variable contracts):**
- `POST /v1/billing/notifications`
- `POST /v1/billing/plan-change`
- `POST /v1/billing/plan-expiration`

---

## Audience and Use Cases

This document is written for **internal Prosperna backend engineers** integrating with the `email-service-api` billing endpoints. It is not a public API document.

**Callers:**
| Service | Endpoints Called | Trigger Mechanism |
|---|---|---|
| `payment-integration-api` | `/notifications`, `/plan-change`, `/plan-expiration`, `/payment-failure` | Agenda jobs, cron tasks, Xendit/Stripe webhook handlers |
| `business-profile-api` | `/notifications` (trial activation) | `changePlan()` or trial processor |
| ST-05 cancellation flow service | `/cancellation` | Cancellation confirmation flow; `cancellation-processor` job |
| ST-06 usage limits service | `/usage-notification` | `usage-threshold-checker`; `end-of-month-overage-processor` |
| ST-01 Payment Abstraction Layer | `/plan-change`, `/payment-failure` | Payment event handlers (upgrade, payment failure webhook) |
| ST-04 reactivation flow | `/reactivation` | `reactivateMerchant()` completion |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `http://localhost:4003` | Local development | Uses mock SES (no real sends) |
| Staging | `https://email-service.staging.prosperna.com` | QA testing and validation | Real SES sends to test inboxes |
| Production | `https://email-service.prosperna.com` | Live platform | Real SES sends to merchant emails |

---

## API Versioning and Compatibility

- All endpoints are versioned under `/v1/`.
- ST-14 does not introduce breaking changes to existing endpoint paths. Existing callers updating to new variable contracts must update their payloads.
- New endpoints (`/cancellation`, `/payment-failure`, `/usage-notification`, `/overage-invoice`, `/reactivation`) are additive — they do not affect existing callers.
- Version `v2` is not planned. Versioning will be introduced if breaking changes to request/response contracts are required.

---

## Protocol and Data Format Standards

- **Protocol:** HTTPS (TLS 1.2 minimum)
- **Method:** HTTP POST for all email-send operations
- **Content-Type:** `application/json` (request and response)
- **Character Encoding:** UTF-8
- **Date Format:** ISO 8601 for all date/time fields in request bodies (e.g., `"2026-04-15T00:00:00Z"`). Templates display human-readable dates — formatting is the caller's responsibility.
- **Currency:** All monetary values are pre-formatted strings passed by the caller (e.g., `"$59.00"`). The email service does not perform currency formatting.

---

## Authentication and Authorization

- **Auth mechanism:** Internal service-to-service JWT Bearer token issued by the Prosperna API Gateway / Auth Service.
- All requests must include: `Authorization: Bearer <internal-service-jwt>`
- JWT claims must include: `service_id` (identifying the calling service) and `scope: billing:email:send`
- Tokens expire after 1 hour. Callers must refresh before expiry.
- No per-merchant auth is required — the email service acts on behalf of the platform.

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| `billing:email:send` | All billing email endpoints (send) | Internal services only; not accessible externally |
| `billing:email:admin` | All send operations + delivery status query (future) | Reserved for Prosperna Admins (not yet implemented) |
| Merchant | None | Merchants cannot call these endpoints directly |
| Public | None | No public access |

---

## Ownership and Data Access Rules

- The email service does not store or persist merchant data. All merchant data (name, email, plan, usage) is passed by the caller per request.
- The email service does not maintain a subscriber list or suppress list — SES handles bounce and complaint suppression.
- Merchant email addresses must be sourced from the authoritative merchant account record by the calling service immediately before the API call.

---

## Request Conventions

- All request bodies are JSON objects.
- Required fields: documented per endpoint. Missing required fields return HTTP 400.
- Optional fields: omitted if not applicable (e.g., `proratedAmount` only sent when a proration applies).
- No pagination — these are fire-and-forget send operations.
- `Content-Type: application/json` header required on all requests.

---

## Response Conventions

- **Success:** HTTP 200 with JSON body `{ "status": "sent", "messageId": "<ses-message-id>" }`
- **Validation Error:** HTTP 400 with global error model (see below)
- **Auth Error:** HTTP 401 (missing/invalid token) or HTTP 403 (valid token, insufficient scope)
- **Server Error:** HTTP 500 or HTTP 502 on SES delivery failure after retries
- All responses include `Content-Type: application/json`

---

## Global Guard Rails (Consumer Safety)

1. **Do not retry on HTTP 400.** A 400 means the request payload is invalid. Fix the payload before retrying.
2. **Retry on HTTP 500/502 with exponential backoff.** Use: 1s → 2s → 4s, max 3 retries. After 3 failures, alert Ops — do not retry indefinitely.
3. **Do not retry on HTTP 401/403.** Auth failures are not transient. Refresh the service JWT before retrying.
4. **Do not call concurrently for the same merchant and same event.** Callers are responsible for ensuring at-most-once delivery at the application layer. The email service does not deduplicate.
5. **Always include `merchantId` in request.** Used for logging and operational tracing in CloudWatch.
6. **Set request timeout to 10 seconds.** SES calls should complete well within this window. Alert Ops on timeout.
7. **Do not expose SES message IDs to merchants.** These are operational identifiers for internal use only.

---

## Rate Limits and Abuse Controls

| Bucket | Limit | Window | Applied To |
|---|---|---|---|
| Per-endpoint global | 500 req/min | Rolling 1 minute | Each billing endpoint |
| Per-merchant | 10 emails/hour | Rolling 1 hour | Per `merchantId` across all billing endpoints |
| Usage notifications | 5 emails/day | Calendar day | Per `merchantId` for usage threshold endpoints only |

> These limits are enforced at the API Gateway layer. Exceeding limits returns HTTP 429 with `Retry-After` header.

> **Note:** The per-merchant hourly limit is a safety rail. Normal lifecycle events will not approach this limit. If a bug in a calling service causes rapid-fire requests for the same merchant, this limit prevents merchant inbox flooding.

---

## Global Error Model

Use this standard structure for all error responses:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "MISSING_REQUIRED_FIELD",
    "type": "validation_error",
    "message": "One or more required fields are missing from the request body.",
    "details": [
      {
        "field": "resourceType",
        "issue": "missing",
        "expected": "one of: orders, bandwidth, storage",
        "actual": "undefined"
      }
    ],
    "requestId": "req_abc123xyz",
    "timestamp": "2026-03-23T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.internal.prosperna.com/email-service-api/billing"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `SEND_TRIAL_ACTIVATION` | POST | `/v1/billing/notifications` | `billing:email:send` | Trial activation email | Per-endpoint global | FR-1 |
| `SEND_PLAN_CHANGE` | POST | `/v1/billing/plan-change` | `billing:email:send` | Upgrade, downgrade, renewal emails | Per-endpoint global | FR-2, FR-3, FR-4, FR-7 |
| `SEND_PLAN_EXPIRATION` | POST | `/v1/billing/plan-expiration` | `billing:email:send` | Expiry countdown (7/3/1 day) and expired emails | Per-endpoint global | FR-5, FR-6, FR-19 |
| `SEND_CANCELLATION` | POST | `/v1/billing/cancellation` | `billing:email:send` | Cancellation confirmation and post-cancellation suspension | Per-endpoint global | FR-8, FR-9 |
| `SEND_PAYMENT_FAILURE` | POST | `/v1/billing/payment-failure` | `billing:email:send` | Payment failure → immediate suspension email | Per-endpoint global | FR-10, FR-20 |
| `SEND_USAGE_NOTIFICATION` | POST | `/v1/billing/usage-notification` | `billing:email:send` | Usage threshold warnings (80%, 95%, 100%, grace, 125%) | Usage notifications bucket | FR-11–FR-15 |
| `SEND_OVERAGE_INVOICE` | POST | `/v1/billing/overage-invoice` | `billing:email:send` | End-of-period overage invoice email | Per-endpoint global | FR-16 |
| `SEND_REACTIVATION` | POST | `/v1/billing/reactivation` | `billing:email:send` | Store reactivation confirmation | Per-endpoint global | FR-18 |

> Note: `upgrade-confirmation.hbs` (FR-17) is triggered via `POST /v1/billing/plan-change` with `type: "upgrade_confirmation"`.

---

## Endpoint Reference

---

### 1. `SEND_TRIAL_ACTIVATION` — POST /v1/billing/notifications

**Purpose:** Send the trial activation welcome email when a new merchant starts their 14-day free trial. Updated by ST-14 to use new trial language, USD pricing, and suspension consequence language.

**When to use:** Call immediately after a merchant's trial is activated.

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `type` | Body | String | Yes | Must be `"trial_activation"` |
| `merchantId` | Body | String | Yes | Merchant UUID — used for logging |
| `merchantName` | Body | String | Yes | Merchant's full name |
| `email` | Body | String | Yes | Recipient email address |
| `trialEndDate` | Body | String | Yes | ISO 8601 date: trial end date |
| `planSelectionUrl` | Body | String | Yes | URL to plan selection page |

**Request example:**
```bash
curl -X POST https://email-service.prosperna.com/v1/billing/notifications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "trial_activation",
    "merchantId": "m_abc123",
    "merchantName": "John Dela Cruz",
    "email": "john@delacruzstore.com",
    "trialEndDate": "2026-04-06T23:59:59Z",
    "planSelectionUrl": "https://app.prosperna.com/plans"
  }'
```

**Success response (200):**
```json
{
  "status": "sent",
  "messageId": "ses-msg-0101abc"
}
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | `type`, `email`, or `trialEndDate` missing | Fix request payload |
| 400 | `INVALID_TYPE` | `type` value not recognized | Use `"trial_activation"` |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Refresh service token |
| 403 | `FORBIDDEN` | Token lacks `billing:email:send` scope | Contact platform team |
| 429 | `RATE_LIMIT_EXCEEDED` | Per-endpoint limit hit | Back off; check `Retry-After` header |
| 502 | `EMAIL_SEND_FAILED` | SES delivery failure after retries | Alert Ops; check CloudWatch |

**Error response example:**
```json
{
  "error": {
    "httpStatus": 400,
    "code": "MISSING_REQUIRED_FIELD",
    "type": "validation_error",
    "message": "Required field 'trialEndDate' is missing.",
    "details": [{ "field": "trialEndDate", "issue": "missing", "expected": "ISO 8601 date string", "actual": "undefined" }],
    "requestId": "req_xyz789",
    "timestamp": "2026-03-23T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.internal.prosperna.com/email-service-api/billing"
  }
}
```

**Guard rails:**
- Do not call this endpoint more than once per merchant per trial activation event.
- If ST-08's `trial/welcome.hbs` is confirmed to cover trial activation, this endpoint call should be removed from the calling service (OQ-1).

---

### 2. `SEND_PLAN_CHANGE` — POST /v1/billing/plan-change

**Purpose:** Send plan change emails: upgrade, downgrade, renewal, and upgrade confirmation. The `type` field selects the template.

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `type` | Body | String | Yes | Enum | `"upgrade"`, `"upgrade_confirmation"`, `"downgrade"`, `"renewal"`, `"plan_change"` |
| `merchantId` | Body | String | Yes | UUID | Merchant identifier |
| `merchantName` | Body | String | Yes | — | Merchant's full name |
| `email` | Body | String | Yes | Valid email | Recipient address |
| `planType` | Body | String | Yes | LAUNCH, GROW, SCALE | Current/new plan |
| `previousPlan` | Body | String | Conditional | LAUNCH, GROW, SCALE | Required for `"upgrade"`, `"upgrade_confirmation"`, `"downgrade"` |
| `amount` | Body | String | Conditional | USD string | Required for `"renewal"` and `"upgrade_confirmation"` |
| `currency` | Body | String | Conditional | `"USD"` | Required when `amount` is present |
| `paymentGateway` | Body | String | Conditional | `"Stripe"`, `"Xendit"` | Required for `"renewal"` |
| `nextPaymentDate` | Body | String | Conditional | ISO 8601 | Required for `"renewal"` |
| `billingPeriodEndDate` | Body | String | Conditional | ISO 8601 | Required for `"downgrade"` |
| `proratedAmount` | Body | String | Optional | USD string | For mid-cycle upgrades |
| `newLimits` | Body | Object | Conditional | See schema | Required for `"upgrade"` and `"upgrade_confirmation"` |
| `enforcementCleared` | Body | Boolean | Optional | — | For upgrades during enforcement state |
| `dashboardUrl` | Body | String | Yes | Full URL | Dashboard link for CTA |
| `invoiceUrl` | Body | String | Conditional | Full URL | Required for `"renewal"` |

**`newLimits` object schema:**
```json
{
  "ordersPerMonth": 2000,
  "bandwidthGb": 100,
  "storageGb": 50,
  "maxSkus": 2000,
  "adminUsers": 5,
  "storeLocations": 3
}
```

**Request example — renewal:**
```bash
curl -X POST https://email-service.prosperna.com/v1/billing/plan-change \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "renewal",
    "merchantId": "m_abc123",
    "merchantName": "John Dela Cruz",
    "email": "john@delacruzstore.com",
    "planType": "GROW",
    "amount": "$59.00",
    "currency": "USD",
    "paymentGateway": "Xendit",
    "nextPaymentDate": "2026-04-23T00:00:00Z",
    "invoiceUrl": "https://checkout.xendit.co/inv123",
    "dashboardUrl": "https://app.prosperna.com/dashboard"
  }'
```

**Request example — upgrade confirmation (mid-cycle, prorated):**
```json
{
  "type": "upgrade_confirmation",
  "merchantId": "m_abc123",
  "merchantName": "John Dela Cruz",
  "email": "john@delacruzstore.com",
  "planType": "GROW",
  "previousPlan": "LAUNCH",
  "amount": "$59.00",
  "currency": "USD",
  "proratedAmount": "$29.50",
  "newLimits": {
    "ordersPerMonth": 2000,
    "bandwidthGb": 100,
    "storageGb": 50,
    "maxSkus": 2000,
    "adminUsers": 5,
    "storeLocations": 3
  },
  "enforcementCleared": true,
  "dashboardUrl": "https://app.prosperna.com/dashboard"
}
```

**Success response (200):**
```json
{ "status": "sent", "messageId": "ses-msg-0202abc" }
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | `type`, `email`, `planType`, or `dashboardUrl` missing | Fix payload |
| 400 | `INVALID_TYPE` | Unrecognized `type` value | Use valid enum |
| 400 | `INVALID_PLAN` | `planType` or `previousPlan` not in LAUNCH/GROW/SCALE | Update plan name to new tier system |
| 401 | `UNAUTHORIZED` | Invalid JWT | Refresh token |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit hit | Back off |
| 502 | `EMAIL_SEND_FAILED` | SES failure | Alert Ops |

---

### 3. `SEND_PLAN_EXPIRATION` — POST /v1/billing/plan-expiration

**Purpose:** Send subscription expiry countdown emails (7/3/1 day warnings and Day 0 expired). The Day 0 `expired` email must only be called after `suspendMerchant()` has been called by the Agenda job.

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `type` | Body | String | Yes | Enum | `"expiring_7"`, `"expiring_3"`, `"expiring_1"`, `"expiring"`, `"expired"` |
| `merchantId` | Body | String | Yes | UUID | Merchant identifier |
| `merchantName` | Body | String | Yes | — | Merchant's full name |
| `email` | Body | String | Yes | Valid email | Recipient address |
| `planType` | Body | String | Yes | LAUNCH, GROW, SCALE | Current plan |
| `daysRemaining` | Body | Number | Conditional | 0–7 | Required for countdown types |
| `invoiceUrl` | Body | String | Conditional | Full URL | Required for expiring types (CTA: Renew Now) |
| `planSelectionUrl` | Body | String | Conditional | Full URL | Required for `"expired"` (CTA: Choose a Plan) |
| `amount` | Body | String | Optional | USD string | Renewal amount for CTA context |

**Request example — Day 0 expired:**
```bash
curl -X POST https://email-service.prosperna.com/v1/billing/plan-expiration \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expired",
    "merchantId": "m_abc123",
    "merchantName": "John Dela Cruz",
    "email": "john@delacruzstore.com",
    "planType": "LAUNCH",
    "planSelectionUrl": "https://app.prosperna.com/suspended"
  }'
```

**Success response (200):**
```json
{ "status": "sent", "messageId": "ses-msg-0303abc" }
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | Required field missing | Fix payload |
| 400 | `INVALID_TYPE` | Unknown expiration type | Use valid enum |
| 400 | `INVALID_PLAN` | Plan name not in new tier system | Update to LAUNCH/GROW/SCALE |
| 502 | `EMAIL_SEND_FAILED` | SES failure | Alert Ops |

**Guard rails:**
- **Always call `suspendMerchant()` before calling this endpoint with `type: "expired"`.** The email assumes suspension has already occurred. Sending the email before suspension creates a misleading communication.
- Do not send `type: "expired"` if the merchant has already received a payment-failure suspension email for the same event.

---

### 4. `SEND_CANCELLATION` — POST /v1/billing/cancellation *(New — ST-14)*

**Purpose:** Send cancellation lifecycle emails. `"cancellation_confirmed"` is sent immediately on cancellation; `"post_cancellation_suspended"` is sent when the billing period ends and suspension occurs.

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `type` | Body | String | Yes | Enum | `"cancellation_confirmed"`, `"post_cancellation_suspended"` |
| `merchantId` | Body | String | Yes | UUID | Merchant identifier |
| `merchantName` | Body | String | Yes | — | Merchant's full name |
| `email` | Body | String | Yes | Valid email | Recipient address |
| `planType` | Body | String | Conditional | LAUNCH, GROW, SCALE | Required for `"cancellation_confirmed"` |
| `previousPlan` | Body | String | Conditional | LAUNCH, GROW, SCALE | Required for `"post_cancellation_suspended"` |
| `billingPeriodEndDate` | Body | String | Conditional | ISO 8601 | Required for `"cancellation_confirmed"` |
| `dashboardUrl` | Body | String | Conditional | Full URL | Required for `"cancellation_confirmed"` |
| `planSelectionUrl` | Body | String | Conditional | Full URL | Required for `"post_cancellation_suspended"` |

**Request example — cancellation confirmed:**
```bash
curl -X POST https://email-service.prosperna.com/v1/billing/cancellation \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cancellation_confirmed",
    "merchantId": "m_abc123",
    "merchantName": "Maria Santos",
    "email": "maria@msantosstore.com",
    "planType": "SCALE",
    "billingPeriodEndDate": "2026-04-30T23:59:59Z",
    "dashboardUrl": "https://app.prosperna.com/dashboard"
  }'
```

**Request example — post-cancellation suspension:**
```json
{
  "type": "post_cancellation_suspended",
  "merchantId": "m_abc123",
  "merchantName": "Maria Santos",
  "email": "maria@msantosstore.com",
  "previousPlan": "SCALE",
  "planSelectionUrl": "https://app.prosperna.com/suspended"
}
```

**Success response (200):**
```json
{ "status": "sent", "messageId": "ses-msg-0404abc" }
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | Required field missing | Fix payload |
| 400 | `INVALID_TYPE` | Unknown cancellation type | Use valid enum |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit hit | Back off |
| 502 | `EMAIL_SEND_FAILED` | SES failure | Alert Ops |

**Guard rails:**
- `"post_cancellation_suspended"` must only be called after `suspendMerchant()` has completed.
- The `cancellation-processor` job must check whether the merchant resubscribed before calling this endpoint — do not send if merchant is active.

---

### 5. `SEND_PAYMENT_FAILURE` — POST /v1/billing/payment-failure *(New — ST-14)*

**Purpose:** Send the single payment failure suspension email. This email must only be sent once per suspension event. No grace period, no sequence.

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `merchantId` | Body | String | Yes | UUID | Merchant identifier |
| `merchantName` | Body | String | Yes | — | Merchant's full name |
| `email` | Body | String | Yes | Valid email | Recipient address |
| `planType` | Body | String | Yes | LAUNCH, GROW, SCALE | Failed plan |
| `amount` | Body | String | Yes | USD string | Amount that failed (e.g., `"$59.00"`) |
| `currency` | Body | String | Yes | `"USD"` | Currency |
| `paymentGateway` | Body | String | Yes | `"Stripe"`, `"Xendit"` | Gateway that failed |
| `planSelectionUrl` | Body | String | Yes | Full URL | Reactivation/plan selection URL |

**Request example:**
```bash
curl -X POST https://email-service.prosperna.com/v1/billing/payment-failure \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "m_abc123",
    "merchantName": "John Dela Cruz",
    "email": "john@delacruzstore.com",
    "planType": "GROW",
    "amount": "$59.00",
    "currency": "USD",
    "paymentGateway": "Stripe",
    "planSelectionUrl": "https://app.prosperna.com/suspended"
  }'
```

**Success response (200):**
```json
{ "status": "sent", "messageId": "ses-msg-0505abc" }
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | Any required field missing | Fix payload |
| 400 | `INVALID_PLAN` | Plan not in new tier system | Update to LAUNCH/GROW/SCALE |
| 400 | `INVALID_GATEWAY` | Gateway not Stripe or Xendit | Check payment integration |
| 401 | `UNAUTHORIZED` | Invalid JWT | Refresh token |
| 502 | `EMAIL_SEND_FAILED` | SES failure | Alert Ops |

**Guard rails:**
- **Always call `suspendMerchant()` before calling this endpoint.** The email assumes suspension has occurred.
- Do not call if the merchant already received a plan expiration `"expired"` suspension email for the same event on the same day.
- Do not retry this endpoint on HTTP 200 — idempotency at the caller level is the caller's responsibility.

---

### 6. `SEND_USAGE_NOTIFICATION` — POST /v1/billing/usage-notification *(New — ST-14)*

**Purpose:** Send usage limit threshold emails. The `type` field determines which template is rendered (80%, 95%, 100%, grace reminder, 125%).

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `type` | Body | String | Yes | Enum | `"warning_80"`, `"urgent_95"`, `"grace_100"`, `"grace_reminder"`, `"hard_limit_125"` |
| `merchantId` | Body | String | Yes | UUID | Merchant identifier |
| `merchantName` | Body | String | Yes | — | Merchant's full name |
| `email` | Body | String | Yes | Valid email | Recipient address |
| `planType` | Body | String | Yes | LAUNCH, GROW, SCALE | Current plan |
| `resourceType` | Body | String | Yes | `"orders"`, `"bandwidth"`, `"storage"` | Limit type being reported |
| `usageCount` | Body | Number | Yes | ≥ 0 | Current period usage |
| `usageLimit` | Body | Number | Yes | > 0 | Plan limit for resource |
| `usagePercentage` | Body | Number | Conditional | 0–200+ | Required for `"warning_80"` |
| `remaining` | Body | Number | Conditional | ≥ 0 | Required for `"urgent_95"` |
| `daysAtCurrentPace` | Body | Number | Conditional | ≥ 0 | Required for `"urgent_95"` |
| `estimatedLimitDate` | Body | String | Conditional | ISO 8601 | Required for `"warning_80"` |
| `nextPlan` | Body | String | Yes | GROW, SCALE | Next upgrade tier |
| `nextPlanPrice` | Body | String | Yes | USD string | Next plan price |
| `nextPlanLimits` | Body | Object | Conditional | See schema | Required for `"warning_80"` |
| `graceExpiryDate` | Body | String | Conditional | ISO 8601 | Required for `"grace_100"`, `"grace_reminder"` |
| `hoursRemaining` | Body | Number | Conditional | > 0 | Required for `"grace_reminder"` |
| `estimatedOverage` | Body | String | Conditional | USD string | Required for `"grace_100"`, `"grace_reminder"`, `"hard_limit_125"` |
| `overageRate` | Body | String | Conditional | USD string | Required for `"hard_limit_125"` |
| `daysUntilReset` | Body | Number | Conditional | ≥ 0 | Required for `"grace_100"`, `"hard_limit_125"` |
| `upgradeUrl` | Body | String | Yes | Full URL | Upgrade flow URL |
| `overageAcceptUrl` | Body | String | Conditional | Full URL | Required for `"grace_100"`, `"grace_reminder"`, `"hard_limit_125"` |
| `usageDashboardUrl` | Body | String | Conditional | Full URL | Required for `"warning_80"` |

**Request example — 80% warning:**
```bash
curl -X POST https://email-service.prosperna.com/v1/billing/usage-notification \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "warning_80",
    "merchantId": "m_abc123",
    "merchantName": "John Dela Cruz",
    "email": "john@delacruzstore.com",
    "planType": "LAUNCH",
    "resourceType": "orders",
    "usageCount": 400,
    "usageLimit": 500,
    "usagePercentage": 80,
    "estimatedLimitDate": "2026-03-28T00:00:00Z",
    "nextPlan": "GROW",
    "nextPlanPrice": "$59.00",
    "nextPlanLimits": {
      "ordersPerMonth": 2000,
      "bandwidthGb": 100,
      "storageGb": 50,
      "maxSkus": 2000,
      "adminUsers": 5,
      "storeLocations": 3
    },
    "upgradeUrl": "https://app.prosperna.com/upgrade",
    "usageDashboardUrl": "https://app.prosperna.com/usage"
  }'
```

**Success response (200):**
```json
{ "status": "sent", "messageId": "ses-msg-0606abc" }
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | Required field missing for the given type | Fix payload |
| 400 | `INVALID_TYPE` | Unknown usage notification type | Use valid enum |
| 400 | `INVALID_RESOURCE_TYPE` | `resourceType` not orders/bandwidth/storage | Fix resource type |
| 429 | `RATE_LIMIT_EXCEEDED` | Usage notification daily limit hit | Back off; check `Retry-After` |
| 502 | `EMAIL_SEND_FAILED` | SES failure | Alert Ops |

**Guard rails:**
- **Idempotency is the caller's responsibility (ST-06).** The email service does not deduplicate usage notifications. If ST-06 calls this endpoint twice for the same threshold, two emails will be sent.
- Rate limit: 5 usage emails per merchant per calendar day. At most one email per threshold type per billing period per resource.

---

### 7. `SEND_OVERAGE_INVOICE` — POST /v1/billing/overage-invoice *(New — ST-14)*

**Purpose:** Send end-of-billing-period overage invoice email when a merchant accepted overages and exceeded plan limits.

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `merchantId` | Body | String | Yes | Merchant UUID |
| `merchantName` | Body | String | Yes | Merchant's full name |
| `email` | Body | String | Yes | Recipient address |
| `planType` | Body | String | Yes | Current plan: LAUNCH, GROW, SCALE |
| `periodStart` | Body | String | Yes | ISO 8601 billing period start |
| `periodEnd` | Body | String | Yes | ISO 8601 billing period end |
| `orderOverage` | Body | Number | Yes | Order units over limit (0 if none) |
| `orderRate` | Body | String | Yes | Per-order overage rate (e.g., `"$0.15"`) |
| `orderCharge` | Body | String | Yes | Total order overage charge |
| `bandwidthOverage` | Body | Number | Yes | Bandwidth GB over limit |
| `bandwidthRate` | Body | String | Yes | Per-GB rate |
| `bandwidthCharge` | Body | String | Yes | Total bandwidth charge |
| `storageOverage` | Body | Number | Yes | Storage GB over limit |
| `storageRate` | Body | String | Yes | Per-GB rate |
| `storageCharge` | Body | String | Yes | Total storage charge |
| `totalOverageCharge` | Body | String | Yes | Total invoice amount (e.g., `"$12.45"`) |
| `dueDate` | Body | String | Yes | ISO 8601 payment due date |
| `invoiceUrl` | Body | String | Yes | Full URL to hosted invoice |
| `nextPlan` | Body | String | Yes | Upgrade suggestion tier |
| `nextPlanPrice` | Body | String | Yes | Next plan USD price |
| `upgradeUrl` | Body | String | Yes | Full URL to upgrade flow |

**Request example:**
```json
{
  "merchantId": "m_abc123",
  "merchantName": "John Dela Cruz",
  "email": "john@delacruzstore.com",
  "planType": "LAUNCH",
  "periodStart": "2026-03-01T00:00:00Z",
  "periodEnd": "2026-03-31T23:59:59Z",
  "orderOverage": 45,
  "orderRate": "$0.15",
  "orderCharge": "$6.75",
  "bandwidthOverage": 0,
  "bandwidthRate": "$0.10",
  "bandwidthCharge": "$0.00",
  "storageOverage": 5,
  "storageRate": "$0.05",
  "storageCharge": "$0.25",
  "totalOverageCharge": "$7.00",
  "dueDate": "2026-04-07T00:00:00Z",
  "invoiceUrl": "https://checkout.xendit.co/ovr123",
  "nextPlan": "GROW",
  "nextPlanPrice": "$59.00",
  "upgradeUrl": "https://app.prosperna.com/upgrade"
}
```

**Success response (200):**
```json
{ "status": "sent", "messageId": "ses-msg-0707abc" }
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | Any required field missing | Fix payload |
| 400 | `INVALID_PLAN` | Plan not in new tier system | Update plan name |
| 502 | `EMAIL_SEND_FAILED` | SES failure | Alert Ops |

---

### 8. `SEND_REACTIVATION` — POST /v1/billing/reactivation *(New — ST-14)*

**Purpose:** Send the store reactivation confirmation email after a suspended merchant successfully pays and `reactivateMerchant()` completes.

**Auth:** `Authorization: Bearer <token>`, scope `billing:email:send`

**Parameters:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `merchantId` | Body | String | Yes | Merchant UUID |
| `merchantName` | Body | String | Yes | Merchant's full name |
| `email` | Body | String | Yes | Recipient address |
| `planType` | Body | String | Yes | Reactivated plan: LAUNCH, GROW, SCALE |
| `planPrice` | Body | String | Yes | Plan price (e.g., `"$59.00/mo"`) |
| `planLimits` | Body | Object | Yes | Plan limits object (see schema above) |
| `nextPaymentDate` | Body | String | Yes | ISO 8601 next renewal date |
| `dashboardUrl` | Body | String | Yes | Full URL to merchant dashboard |

**Request example:**
```bash
curl -X POST https://email-service.prosperna.com/v1/billing/reactivation \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "m_abc123",
    "merchantName": "Maria Santos",
    "email": "maria@msantosstore.com",
    "planType": "GROW",
    "planPrice": "$59.00/mo",
    "planLimits": {
      "ordersPerMonth": 2000,
      "bandwidthGb": 100,
      "storageGb": 50,
      "maxSkus": 2000,
      "adminUsers": 5,
      "storeLocations": 3
    },
    "nextPaymentDate": "2026-04-23T00:00:00Z",
    "dashboardUrl": "https://app.prosperna.com/dashboard"
  }'
```

**Success response (200):**
```json
{ "status": "sent", "messageId": "ses-msg-0808abc" }
```

**Error path table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_FIELD` | Required field missing | Fix payload |
| 400 | `INVALID_PLAN` | Plan not in new tier system | Update plan name |
| 502 | `EMAIL_SEND_FAILED` | SES failure | Alert Ops |

**Guard rails:**
- Always call after `reactivateMerchant()` has successfully completed and the merchant's store status is `ACTIVE`.
- Do not call speculatively before payment is confirmed.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `type` | Body | String | Varies | Per-endpoint enum | Selects the email template to render |
| `merchantId` | Body | String | Yes (all) | UUID | Used for logging and tracing |
| `merchantName` | Body | String | Yes (all) | Non-empty | Displayed in email greeting |
| `email` | Body | String | Yes (all) | Valid RFC 5321 email | Recipient address |
| `planType` | Body | String | Varies | LAUNCH, GROW, SCALE | Current or new plan — new tier names only |
| `previousPlan` | Body | String | Varies | LAUNCH, GROW, SCALE | Plan before change |
| `amount` | Body | String | Varies | USD formatted string | Pre-formatted by caller |
| `currency` | Body | String | Varies | `"USD"` | Always USD |
| `paymentGateway` | Body | String | Varies | `"Stripe"` or `"Xendit"` | Payment processor name |
| `planSelectionUrl` | Body | String | Varies | Full HTTPS URL | Suspended lock screen / plan selection |
| `dashboardUrl` | Body | String | Varies | Full HTTPS URL | Merchant dashboard |
| `upgradeUrl` | Body | String | Varies | Full HTTPS URL | Upgrade flow |
| `invoiceUrl` | Body | String | Varies | Full HTTPS URL | Hosted payment invoice |
| `overageAcceptUrl` | Body | String | Varies | Full HTTPS URL | Accept overage charges |
| `usageDashboardUrl` | Body | String | Varies | Full HTTPS URL | Usage tracking page |
| `resourceType` | Body | String | Varies | `"orders"`, `"bandwidth"`, `"storage"` | Resource being tracked |
| `planLimits` / `newLimits` | Body | Object | Varies | See schema | Plan limits object |

---

## Request/Response Contract Notes

- **Old plan names are rejected.** If `planType` or `previousPlan` contains FREE, PLUS, PRO, PREMIUM, or PREMIUM_TRIAL, the API returns HTTP 400 with code `INVALID_PLAN`. Calling services must be updated before ST-14 launches.
- **All monetary values are strings.** The email service does not format numbers. Pass `"$59.00"`, not `59`.
- **All dates are ISO 8601.** Templates handle human-readable formatting server-side.
- **All URLs must be fully qualified HTTPS URLs.** Relative paths are rejected.
- **`planLimits` / `newLimits` object fields:** `ordersPerMonth` (Number), `bandwidthGb` (Number), `storageGb` (Number), `maxSkus` (Number), `adminUsers` (Number), `storeLocations` (Number). All required if the object is required.

---

## Idempotency and Concurrency Notes

- The email service is **not idempotent** — identical requests result in duplicate emails. Callers are responsible for call-once guarantees.
- For threshold emails: ST-06 must track sent state per threshold per resource per merchant per billing period in a persistent store (e.g., Redis or database flag) before calling the email API.
- For suspension emails: `suspendMerchant()` from ST-04 is idempotent and will not trigger duplicate suspension if called twice. The email service call should be gated on whether `suspendMerchant()` actually transitioned state (check return value).
- For Agenda jobs: use Agenda's built-in job uniqueness to prevent duplicate job creation for the same merchant-event pair.

---

## Security and Privacy Notes

- All endpoints require internal JWT authentication. No public exposure.
- Merchant email addresses are passed per request and not stored by the email service.
- No merchant personal data is logged beyond `merchantId` and `template_name` in CloudWatch.
- SES configuration set must be tagged as `TransactionalEmail` to bypass suppression list for legitimate transactional sends.
- All billing emails are sent from `billing@prosperna.com` — Prosperna's verified SES sender domain. SPF, DKIM, and DMARC must be configured for this domain.
- No tracking pixels or click-tracking URLs in any billing email templates.

---

## Domain Events and Webhooks

The email service does not emit events or webhooks. It is a consumer of events from upstream services.

The following upstream events trigger email API calls (documented for reference):

| Upstream Event | Source | Email Endpoint Called | Template |
|---|---|---|---|
| Trial activated | `business-profile-api` / ST-03 | `POST /v1/billing/notifications` | `activate-trial.hbs` |
| Plan upgraded | Payment Abstraction Layer / ST-01 | `POST /v1/billing/plan-change` | `upgrade-confirmation.hbs` |
| Plan downgraded | Payment Abstraction Layer | `POST /v1/billing/plan-change` | `plan-downgrade.hbs` |
| `recurring.cycle.succeeded` (Xendit/Stripe) | Webhook handler | `POST /v1/billing/plan-change` | `updated-plan-renewal.hbs` |
| Subscription expiring (7/3/1 day) | Agenda job | `POST /v1/billing/plan-expiration` | `expiring-N.hbs` |
| Subscription expired (Day 0) | Agenda job | `POST /v1/billing/plan-expiration` | `updated-plan-expired.hbs` |
| Cancellation confirmed | ST-05 cancellation flow | `POST /v1/billing/cancellation` | `cancellation-confirmed.hbs` |
| Billing period ended (post-cancel) | ST-05 `cancellation-processor` | `POST /v1/billing/cancellation` | `post-cancellation-suspended.hbs` |
| `recurring.cycle.failed` (Xendit/Stripe) | Webhook handler | `POST /v1/billing/payment-failure` | `payment-failed-suspended.hbs` |
| Usage threshold crossed (80/95/100/125%) | ST-06 threshold checker | `POST /v1/billing/usage-notification` | Threshold-specific template |
| Grace period daily reminder | ST-06 scheduler | `POST /v1/billing/usage-notification` | `usage-grace-reminder.hbs` |
| Overage period ended | ST-06 end-of-month processor | `POST /v1/billing/overage-invoice` | `overage-invoice.hbs` |
| `reactivateMerchant()` completed | ST-04 reactivation | `POST /v1/billing/reactivation` | `reactivation-confirmation.hbs` |

---

## SDK and Integration Examples

No dedicated SDK. Callers use standard HTTP clients with the JSON contracts above.

**Node.js example (payment-integration-api / Agenda job):**
```javascript
const axios = require('axios');

async function sendPlanExpiredEmail(merchant) {
  // IMPORTANT: suspendMerchant() must be called BEFORE this
  const response = await axios.post(
    `${process.env.EMAIL_SERVICE_URL}/v1/billing/plan-expiration`,
    {
      type: 'expired',
      merchantId: merchant.id,
      merchantName: merchant.name,
      email: merchant.email,
      planType: merchant.planType, // e.g., 'LAUNCH'
      planSelectionUrl: `${process.env.APP_URL}/suspended`,
    },
    {
      headers: {
        Authorization: `Bearer ${await getServiceJwt()}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    }
  );
  return response.data;
}
```

---

## How to Use This API Safely

1. **Always suspend before emailing.** For suspension events, call `suspendMerchant()` and confirm success before calling the email endpoint. Never send a suspension email speculatively.
2. **Validate payloads before sending.** Check all required fields are present and all plan names use the new tier system before making the API call.
3. **Handle 400 errors immediately.** A 400 means a code bug — log the error with full request context and alert engineering. Do not retry.
4. **Retry 5xx errors with backoff.** Use exponential backoff (1s, 2s, 4s), max 3 retries. Log each retry attempt.
5. **Set a 10-second timeout.** If the email service does not respond in 10 seconds, treat it as a failure and follow retry/alert logic.
6. **Track threshold sends in your service.** The email API does not deduplicate usage notifications. Maintain a sent-state record in ST-06's data store.
7. **Never log merchant email addresses.** Log `merchantId` and `template_name` only in your service logs.

---

## Change Impact

### Impact on Calling Services (required changes before ST-14 launch)

| Service | Change Required |
|---|---|
| `payment-integration-api` jobs/index.ts | Update Day 0 behavior: call `suspendMerchant()` + new plan expiration payload (new plan names) |
| `payment-integration-api` cron.ts | Update unpaid renewal: call `suspendMerchant()` + call `POST /v1/billing/payment-failure` |
| ST-01 Payment Abstraction Layer | Call `POST /v1/billing/plan-change` with `type: "upgrade_confirmation"` on upgrade success |
| ST-05 Cancellation flow | Call `POST /v1/billing/cancellation` with `type: "cancellation_confirmed"` on cancellation |
| ST-05 `cancellation-processor` job | Call `POST /v1/billing/cancellation` with `type: "post_cancellation_suspended"` on billing period end |
| ST-06 Usage threshold checker | Call `POST /v1/billing/usage-notification` at each threshold crossing |
| ST-06 Grace period scheduler | Call `POST /v1/billing/usage-notification` with `type: "grace_reminder"` daily during grace |
| ST-06 End-of-month processor | Call `POST /v1/billing/overage-invoice` on overage period close |
| ST-04 Reactivation flow | Call `POST /v1/billing/reactivation` after `reactivateMerchant()` completes |

---

## Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-1 | Should `POST /v1/billing/notifications` `type: "trial_activation"` be deprecated in favor of ST-08's `trial/welcome.hbs`? | If yes, remove the Agenda job call; coordinate before launch |
| OQ-2 | CAN-SPAM / GDPR: Is the SES configuration set currently tagged as TransactionalEmail? Does it bypass the suppression list? | If not, billing emails may be incorrectly suppressed for bounced merchants |
| OQ-3 | What is the exact URL format for `planSelectionUrl` in the suspended state? Is the suspended lock screen URL from ST-04 static or merchant-specific? | Affects CTA links in `payment-failed-suspended.hbs`, `post-cancellation-suspended.hbs`, `updated-plan-expired.hbs` |
| OQ-4 | Is the overage invoice payment processed via a separate Xendit/Stripe invoice, or bundled into the next renewal? Affects `invoiceUrl` structure in `overage-invoice.hbs` | ST-06 / Billing Engineering to confirm |
