---
id: st-01-subscription-billing-restructuring
title: Endpoint Document. ST-01 Subscription Billing Restructuring
sidebar_label: ST-01 Subscription Billing Restructuring
sidebar_position: 1
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft

## Linked Documents
- BRD: `BRD-ST-01-Subscription-Billing-Restructuring.md`
- PRD: `PRD-ST-01-Subscription-Billing-Restructuring.md`

---

## Public API Overview

This document describes the subscription billing API for Prosperna's ST-01 Payment Abstraction Layer. It covers:

- Subscription lifecycle endpoints: create, upgrade, downgrade, switch gateway, status
- Webhook receiver endpoints for Stripe and Xendit subscription events

All subscription billing is gateway-agnostic at the API level. Callers specify the desired gateway at subscription creation; all subsequent operations use the stored gateway value.

All subscription charges are in USD.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Merchant Dashboard (prosperna1) | Create subscriptions, check status, upgrade/downgrade, switch gateway |
| Stripe (external webhook sender) | Deliver subscription lifecycle events |
| Xendit (external webhook sender) | Deliver payment success/failure callbacks |
| Internal services (business-profile-api, ST-04) | Read subscription status, trigger suspension flows |
| QA / Integration tests | Validate end-to-end billing scenarios in sandbox |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Production | `https://api.prosperna.com` | Live merchant billing | Real Stripe + Xendit production keys |
| Staging | `https://api-staging.prosperna.com` | Integration testing | Stripe test mode + Xendit sandbox |
| Local development | `http://localhost:3000` | Developer testing | Use Stripe test keys and Xendit sandbox |

All endpoints are under the `/v1` path prefix.

---

## API Versioning and Compatibility

- Current version: `v1` (embedded in URL path)
- Breaking changes will increment the version: `/v2/...`
- Non-breaking additions (new optional fields, new endpoints) may be added without a version bump
- Deprecated fields will be documented with a removal timeline before removal

---

## Protocol and Data Format Standards

- **Protocol:** HTTPS only. HTTP is not supported in production.
- **Data format:** JSON. All request bodies and response bodies are `application/json`.
- **Encoding:** UTF-8.
- **Dates and timestamps:** ISO 8601 format — `2026-03-17T10:30:00Z`.
- **Monetary amounts:** Integer cents (e.g., `2900` = $29.00 USD) or decimal string (e.g., `"29.00"`). See per-endpoint notes.
- **IDs:** String identifiers. Do not assume numeric.

---

## Authentication and Authorization

- All endpoints (except inbound webhooks) require a valid merchant session JWT or internal service API key in the `Authorization` header.
- **Format:** `Authorization: Bearer <token>`
- Webhook endpoints use gateway-provided signature verification instead of session auth:
  - Stripe: `Stripe-Signature` header verified against the Stripe webhook signing secret
  - Xendit: Callback token in the `X-CALLBACK-TOKEN` header verified against the configured Xendit callback token
- Expired or missing tokens: HTTP 401
- Valid token but insufficient permissions: HTTP 403

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| Merchant (authenticated session) | `POST /v1/subscriptions/create`, `POST /v1/subscriptions/upgrade`, `POST /v1/subscriptions/downgrade`, `POST /v1/subscriptions/switch-gateway`, `GET /v1/subscriptions/status` | Can only operate on their own subscription |
| Internal Service (API key) | All subscription endpoints, read status | Used by `business-profile-api`, ST-04, ST-06 |
| Stripe (webhook) | `POST /v1/payments/stripe/subscription-webhook` | Requires valid Stripe-Signature |
| Xendit (webhook) | `POST /v1/payments/xendit/subscription-webhook` | Requires valid X-CALLBACK-TOKEN |
| Prosperna Admin | `GET /v1/subscriptions/status` (any merchant) | Read-only, via Admin Control Platform |

---

## Ownership and Data Access Rules

- A merchant can only read and modify their own subscription.
- Internal services access subscriptions by `merchantId` with API key auth.
- Webhook endpoints are public-facing (no merchant auth) but secured by gateway signature verification.
- `subscriptionId` is scoped to the merchant — a merchant cannot reference another merchant's subscriptionId.

---

## Request Conventions

- `Content-Type: application/json` required on all POST requests with a body.
- `merchantId` is typically inferred from the JWT for merchant-authenticated calls.
- For internal service calls, `merchantId` is provided in the request body.
- Boolean values: `true` / `false` (not `"true"` / `"false"`).
- Enum values: uppercase string (e.g., `"STRIPE"`, `"LAUNCH"`, `"MONTHLY"`).

---

## Response Conventions

- All successful responses: HTTP 2xx with a JSON body.
- `201 Created` for resource creation (`POST /v1/subscriptions/create`).
- `200 OK` for updates, reads, and webhook acknowledgements.
- All error responses use the Global Error Model defined below.
- Webhook endpoints always return `200 OK` to the gateway after acknowledgement (even for duplicates) to prevent redelivery storms.

---

## Global Guard Rails (Consumer Safety)

- **Idempotency keys:** Include `Idempotency-Key: <uuid>` on `POST /v1/subscriptions/create` and `POST /v1/subscriptions/upgrade` to safely retry on network failure. The same key with the same request body returns the same response without creating duplicate records.
- **Timeouts:** Set client timeout to at least 30 seconds for subscription creation endpoints (gateway API calls are involved).
- **Retries:** On HTTP 5xx from non-webhook endpoints, retry with exponential backoff. Maximum 3 retries. Do NOT retry on HTTP 4xx.
- **Do not poll status:** Use webhooks or the `GET /v1/subscriptions/status` endpoint for status changes. Do not poll in tight loops.
- **Pagination:** The status endpoint returns a single object. No pagination.
- **Webhook redelivery:** Return HTTP 200 promptly (within 5 seconds). Do not perform heavy processing in the webhook handler synchronously if it risks timeouts — queue for async processing and return 200.

---

## Rate Limits and Abuse Controls

| Bucket | Limit | Window | Applies To |
|---|---|---|---|
| Subscription create | 10 requests | 1 minute | Per merchantId |
| Upgrade / downgrade | 20 requests | 1 minute | Per merchantId |
| Status read | 60 requests | 1 minute | Per merchantId |
| Switch gateway | 5 requests | 1 minute | Per merchantId |
| Stripe webhook | 1,000 events | 1 minute | Per endpoint (global) |
| Xendit webhook | 1,000 events | 1 minute | Per endpoint (global) |

Rate limit exceeded: HTTP 429. `Retry-After` header provided with seconds until the window resets.

---

## Global Error Model

All error responses use this structure:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "validation",
    "message": "The request body contains invalid or missing fields.",
    "details": [
      {
        "field": "gateway",
        "issue": "invalid_value",
        "expected": "STRIPE | XENDIT",
        "actual": "PAYPAL"
      }
    ],
    "requestId": "req_7f3a2b1c9e4d",
    "timestamp": "2026-03-17T10:30:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/subscriptions"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `subscription.create` | POST | `/v1/subscriptions/create` | Merchant JWT | Create a new subscription via selected gateway | subscription-create | FR-21, FR-13, FR-14 |
| `subscription.upgrade` | POST | `/v1/subscriptions/upgrade` | Merchant JWT | Upgrade to a higher plan with proration | upgrade-downgrade | FR-21, FR-15 |
| `subscription.downgrade` | POST | `/v1/subscriptions/downgrade` | Merchant JWT | Schedule a downgrade for end of billing period | upgrade-downgrade | FR-21, FR-16 |
| `subscription.switchGateway` | POST | `/v1/subscriptions/switch-gateway` | Merchant JWT | Switch payment gateway on active subscription | switch-gateway | FR-21, FR-17 |
| `subscription.getStatus` | GET | `/v1/subscriptions/status` | Merchant JWT / Internal | Get current subscription status from internal DB | status-read | FR-21, FR-10 |
| `webhook.stripe` | POST | `/v1/payments/stripe/subscription-webhook` | Stripe-Signature | Receive and process Stripe subscription webhook events | stripe-webhook | FR-21, FR-7, FR-8, FR-9 |
| `webhook.xendit` | POST | `/v1/payments/xendit/subscription-webhook` | X-CALLBACK-TOKEN | Receive and process Xendit subscription callback events | xendit-webhook | FR-22, FR-7, FR-8, FR-9 |

---

## Endpoint Reference

---

### 1. Create Subscription

**Operation ID:** `subscription.create`
**Purpose:** Creates a new subscription for a merchant using the specified payment gateway and plan. Returns a payment redirect URL or an embedded checkout token depending on the gateway.
**When to use:** Call this when a merchant selects a plan for the first time (after trial expiry or account suspension), or when reactivating after suspension.

**Method:** POST
**Path:** `/v1/subscriptions/create`
**Auth:** `Authorization: Bearer <merchant_jwt>` or internal API key

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Idempotency-Key` | Header | UUID string | Recommended | Unique per attempt | Prevents duplicate subscriptions on retry |
| `Authorization` | Header | string | Required | `Bearer <token>` | Merchant JWT or internal API key |

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `merchantId` | string | Required (service calls) | Non-empty | Merchant identifier. Inferred from JWT for merchant calls. |
| `planType` | string | Required | `LAUNCH \| GROW \| SCALE` | The plan to subscribe to |
| `billingCycle` | string | Required | `MONTHLY \| QUARTERLY \| ANNUAL` | Billing frequency |
| `gateway` | string | Required | `STRIPE \| XENDIT` | Payment gateway to use |
| `promoCode` | string | Optional | Max 50 chars | Promo code to apply. Prosperna validates and calculates discount. |

**Request Example**

```bash
curl -X POST https://api.prosperna.com/v1/subscriptions/create \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -d '{
    "planType": "LAUNCH",
    "billingCycle": "MONTHLY",
    "gateway": "STRIPE",
    "promoCode": "WELCOME50"
  }'
```

**Success Response — 201 Created**

```json
{
  "subscriptionId": "sub_p1_abc123",
  "planType": "LAUNCH",
  "billingCycle": "MONTHLY",
  "gateway": "STRIPE",
  "currency": "USD",
  "amountDue": 1450,
  "status": "pending_payment",
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "expiresAt": "2026-03-17T11:30:00Z",
  "createdAt": "2026-03-17T10:30:00Z"
}
```

> `amountDue` is in cents (USD). `1450` = $14.50 (after 50% promo discount on $29.00).
> `paymentUrl` is the Stripe-hosted checkout page URL. For Xendit, this is the Xendit invoice page URL.
> `status` is `pending_payment` until the payment webhook confirms the transaction.

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or invalid `planType`, `billingCycle`, or `gateway` | Fix the request body |
| 400 | `INVALID_PROMO_CODE` | Promo code does not exist or is expired | Remove or replace promo code |
| 409 | `SUBSCRIPTION_ALREADY_EXISTS` | Merchant already has an active subscription | Use upgrade or downgrade endpoint instead |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 403 | `FORBIDDEN` | JWT belongs to a different merchantId | Use the correct JWT |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many create requests | Wait for `Retry-After` seconds |
| 503 | `GATEWAY_UNAVAILABLE` | Selected gateway API is unavailable | Retry with the other gateway or retry after delay |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry with idempotency key; if persistent, contact support |

**Error Response Example**

```json
{
  "error": {
    "httpStatus": 409,
    "code": "SUBSCRIPTION_ALREADY_EXISTS",
    "type": "conflict",
    "message": "This merchant already has an active subscription. Use the upgrade or downgrade endpoint to change plans.",
    "details": [],
    "requestId": "req_9f3b2c4d",
    "timestamp": "2026-03-17T10:30:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/subscriptions/create"
  }
}
```

**Guard Rails**
- Include `Idempotency-Key` on every create call to safely retry on network failure without creating duplicate subscriptions.
- A `pending_payment` subscription expires if not confirmed by webhook. Do not re-call create if status is `pending_payment` — wait for the webhook or the expiry.
- Set client timeout to 30 seconds minimum. Gateway API calls add latency.

---

### 2. Upgrade Subscription

**Operation ID:** `subscription.upgrade`
**Purpose:** Upgrades the merchant's active subscription to a higher plan with prorated billing for the remaining billing period. New limits take effect immediately upon payment success.
**When to use:** When a merchant selects a higher plan tier mid-cycle.

**Method:** POST
**Path:** `/v1/subscriptions/upgrade`
**Auth:** `Authorization: Bearer <merchant_jwt>`

**Parameters**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `Idempotency-Key` | Header | UUID string | Recommended | Prevents duplicate upgrades on retry |
| `Authorization` | Header | string | Required | Merchant JWT |

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `newPlanType` | string | Required | `GROW \| SCALE` | The target plan. Must be higher than current plan. |

**Request Example**

```bash
curl -X POST https://api.prosperna.com/v1/subscriptions/upgrade \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: b2c3d4e5-f6a7-8901-bcde-f12345678901" \
  -d '{
    "newPlanType": "SCALE"
  }'
```

**Success Response — 200 OK**

```json
{
  "subscriptionId": "sub_p1_abc123",
  "previousPlanType": "LAUNCH",
  "newPlanType": "SCALE",
  "proratedAmount": 6000,
  "currency": "USD",
  "status": "pending_payment",
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_upgrade_...",
  "effectiveAt": null,
  "createdAt": "2026-03-17T10:30:00Z"
}
```

> `proratedAmount` in cents. `6000` = $60.00. `effectiveAt` is `null` until webhook confirms payment. After confirmation, `effectiveAt` is set to the confirmation timestamp.

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `newPlanType` is missing or same as current plan | Provide a valid higher plan |
| 400 | `INVALID_UPGRADE` | Target plan is lower than or equal to current plan | Use the downgrade endpoint instead |
| 404 | `SUBSCRIPTION_NOT_FOUND` | Merchant has no active subscription | Use create endpoint first |
| 409 | `UPGRADE_IN_PROGRESS` | A previous upgrade is still pending payment | Wait for the pending upgrade to complete or cancel it |
| 503 | `GATEWAY_UNAVAILABLE` | Gateway API unavailable | Retry later or switch gateway first |

---

### 3. Downgrade Subscription

**Operation ID:** `subscription.downgrade`
**Purpose:** Schedules a plan downgrade to take effect at the end of the current billing period. Merchant retains current plan access until the period ends.
**When to use:** When a merchant selects a lower plan tier.

**Method:** POST
**Path:** `/v1/subscriptions/downgrade`
**Auth:** `Authorization: Bearer <merchant_jwt>`

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `newPlanType` | string | Required | `LAUNCH \| GROW` | The target plan. Must be lower than current plan. |

**Request Example**

```bash
curl -X POST https://api.prosperna.com/v1/subscriptions/downgrade \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "newPlanType": "GROW"
  }'
```

**Success Response — 200 OK**

```json
{
  "subscriptionId": "sub_p1_abc123",
  "currentPlanType": "SCALE",
  "scheduledPlanType": "GROW",
  "effectiveAt": "2026-04-17T00:00:00Z",
  "status": "active",
  "message": "Your plan will change to GROW at the end of your current billing period."
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_DOWNGRADE` | Target plan is higher than or equal to current | Use the upgrade endpoint instead |
| 400 | `DOWNGRADE_ALREADY_SCHEDULED` | A downgrade is already scheduled | Cancel the existing scheduled downgrade first |
| 404 | `SUBSCRIPTION_NOT_FOUND` | No active subscription | Use create endpoint |

---

### 4. Switch Gateway

**Operation ID:** `subscription.switchGateway`
**Purpose:** Switches the merchant's active subscription from one payment gateway to another. Cancels the old gateway subscription and creates a new one on the new gateway. No service interruption.
**When to use:** When a merchant wants to change their preferred payment method.

**Method:** POST
**Path:** `/v1/subscriptions/switch-gateway`
**Auth:** `Authorization: Bearer <merchant_jwt>`

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `newGateway` | string | Required | `STRIPE \| XENDIT` | The target gateway. Must differ from current gateway. |

**Request Example**

```bash
curl -X POST https://api.prosperna.com/v1/subscriptions/switch-gateway \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "newGateway": "STRIPE"
  }'
```

**Success Response — 200 OK**

```json
{
  "subscriptionId": "sub_p1_abc123",
  "previousGateway": "XENDIT",
  "newGateway": "STRIPE",
  "status": "pending_payment",
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_switch_...",
  "message": "Your old Xendit subscription has been cancelled. Complete payment on Stripe to activate billing on the new gateway."
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `SAME_GATEWAY` | `newGateway` is the same as the current gateway | No action needed |
| 404 | `SUBSCRIPTION_NOT_FOUND` | No active subscription | Use create endpoint |
| 503 | `GATEWAY_UNAVAILABLE` | New gateway is unavailable | Retry later |

---

### 5. Get Subscription Status

**Operation ID:** `subscription.getStatus`
**Purpose:** Returns the merchant's current subscription details from Prosperna's internal database. This endpoint never queries Stripe or Xendit at runtime.
**When to use:** To check whether a merchant's subscription is active, suspended, or pending. Use by frontend gating logic and internal services.

**Method:** GET
**Path:** `/v1/subscriptions/status`
**Auth:** `Authorization: Bearer <merchant_jwt>` or internal API key (with `merchantId` query param)

**Parameters**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `merchantId` | Query | string | Required for internal calls | Merchant identifier. Inferred from JWT for merchant calls. |

**Request Example**

```bash
curl -X GET "https://api.prosperna.com/v1/subscriptions/status" \
  -H "Authorization: Bearer eyJ..."
```

**Success Response — 200 OK**

```json
{
  "subscriptionId": "sub_p1_abc123",
  "merchantId": "merchant_xyz789",
  "planType": "GROW",
  "billingCycle": "MONTHLY",
  "gateway": "STRIPE",
  "currency": "USD",
  "status": "active",
  "currentPeriodStart": "2026-03-01T00:00:00Z",
  "currentPeriodEnd": "2026-04-01T00:00:00Z",
  "scheduledDowngrade": null,
  "promoCode": null,
  "createdAt": "2026-03-01T09:00:00Z",
  "updatedAt": "2026-03-01T09:45:00Z"
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `SUBSCRIPTION_NOT_FOUND` | No subscription record found for merchantId | Merchant has not subscribed yet |
| 401 | `UNAUTHORIZED` | Invalid or missing token | Re-authenticate |

---

### 6. Stripe Subscription Webhook

**Operation ID:** `webhook.stripe`
**Purpose:** Receives Stripe subscription lifecycle events and routes them to `UnifiedWebhookHandler` for internal state processing.
**When to use:** This endpoint is configured in the Stripe Dashboard as the webhook destination. Do not call this endpoint directly.

**Method:** POST
**Path:** `/v1/payments/stripe/subscription-webhook`
**Auth:** `Stripe-Signature` header (webhook signing secret verification)

**Events Processed**

| Stripe Event | Internal Action |
|---|---|
| `invoice.paid` | Set `subscription_status = 'active'`, update `payPlanType` |
| `invoice.payment_failed` | Set `subscription_status = 'expired'`, call `suspendMerchant('payment_failed')`, send suspension email |
| `customer.subscription.updated` | Update subscription record fields if plan or cycle changed externally |
| `customer.subscription.deleted` | Set `subscription_status = 'cancelled'` or `'expired'` depending on context |

**Request Example (from Stripe)**

```bash
POST /v1/payments/stripe/subscription-webhook HTTP/1.1
Host: api.prosperna.com
Stripe-Signature: t=1710678600,v1=abc123...
Content-Type: application/json

{
  "id": "evt_1Nx2y3z4",
  "type": "invoice.paid",
  "data": {
    "object": {
      "subscription": "sub_stripe_xyz",
      "customer": "cus_stripe_abc",
      "amount_paid": 2900,
      "currency": "usd",
      "status": "paid"
    }
  }
}
```

**Success Response — 200 OK**

```json
{
  "received": true
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `SIGNATURE_VERIFICATION_FAILED` | `Stripe-Signature` header does not match signing secret | Stripe will retry. Check signing secret configuration. |
| 200 | _(duplicate skipped)_ | Event ID already processed (idempotency) | No action. Event safely ignored. Returns 200. |
| 200 | _(subscription not found)_ | No subscription record matches the Stripe event | Logged as warning. Returns 200 to prevent Stripe retry storm. Alert ops. |

**Guard Rails**
- Always return HTTP 200 promptly (within 5 seconds) to avoid Stripe marking the webhook as failed.
- Stripe will retry failed deliveries with exponential backoff for up to 72 hours. Idempotency ensures retries are safe.
- Verify that the Stripe webhook signing secret environment variable is set before deploying to production.
- Disable Stripe Smart Retries in the Stripe Dashboard before going live. The idempotency check handles duplicate `invoice.payment_failed` events, but relying on Stripe retries contradicts the immediate-suspension policy.

---

### 7. Xendit Subscription Webhook

**Operation ID:** `webhook.xendit`
**Purpose:** Receives Xendit subscription payment callbacks and routes them to `UnifiedWebhookHandler` for internal state processing. This is a refactored version of the existing Xendit webhook endpoint.
**When to use:** This endpoint is configured in the Xendit Dashboard as the payment callback URL. Do not call this endpoint directly.

**Method:** POST
**Path:** `/v1/payments/xendit/subscription-webhook`
**Auth:** `X-CALLBACK-TOKEN` header (Xendit callback token verification)

**Events Processed**

| Xendit Callback Type | Internal Action |
|---|---|
| Payment success callback | Set `subscription_status = 'active'`, update `payPlanType` |
| Payment failure callback | Set `subscription_status = 'expired'`, call `suspendMerchant('payment_failed')`, send suspension email |

**Request Example (from Xendit)**

```bash
POST /v1/payments/xendit/subscription-webhook HTTP/1.1
Host: api.prosperna.com
X-CALLBACK-TOKEN: xendit_callback_token_abc
Content-Type: application/json

{
  "id": "xendit_event_789",
  "event": "payment.succeeded",
  "data": {
    "recurring_plan_id": "rp_xendit_xyz",
    "invoice_id": "inv_xendit_abc",
    "amount": 29,
    "currency": "USD",
    "status": "PAID",
    "merchant_reference": "merchant_xyz789"
  }
}
```

**Success Response — 200 OK**

```json
{
  "received": true
}
```

**Error Path Table**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `SIGNATURE_VERIFICATION_FAILED` | `X-CALLBACK-TOKEN` does not match | Xendit will retry. Check callback token configuration. |
| 200 | _(duplicate skipped)_ | Event ID already processed | No action. Returns 200. |
| 200 | _(subscription not found)_ | No subscription record found | Logged as warning. Returns 200 to prevent retry storm. Alert ops. |

**Guard Rails**
- Return HTTP 200 promptly to prevent Xendit from treating the callback as failed and retrying.
- Idempotency covers Xendit retry storms for the same event.
- Verify that the `X-CALLBACK-TOKEN` environment variable matches the Xendit Dashboard callback token before deploying.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `planType` | Body | string | Varies | `LAUNCH \| GROW \| SCALE` | Target subscription plan |
| `billingCycle` | Body | string | Required on create | `MONTHLY \| QUARTERLY \| ANNUAL` | Billing frequency |
| `gateway` | Body | string | Required on create | `STRIPE \| XENDIT` | Payment gateway |
| `newPlanType` | Body | string | Required on upgrade/downgrade | See constraints per endpoint | Target plan for upgrade or downgrade |
| `newGateway` | Body | string | Required on switch | `STRIPE \| XENDIT` | Target gateway for switch |
| `promoCode` | Body | string | Optional | Max 50 chars | Discount code |
| `merchantId` | Body/Query | string | Required for service calls | Non-empty | Merchant identifier |
| `Idempotency-Key` | Header | UUID | Recommended on create/upgrade | Valid UUID v4 | Prevents duplicate operations on retry |
| `Authorization` | Header | string | Required | `Bearer <token>` | JWT or API key |
| `Stripe-Signature` | Header | string | Required on Stripe webhook | Stripe format | Webhook signature verification |
| `X-CALLBACK-TOKEN` | Header | string | Required on Xendit webhook | Configured token | Callback token verification |

---

## Request/Response Contract Notes

- `amountDue` and `proratedAmount` are in integer cents (USD). Divide by 100 to get the decimal dollar value.
- `status` on subscription responses reflects the **internal** `subscription_status` from Prosperna's DB, not a live query to the gateway.
- `paymentUrl` is only present in responses where the merchant needs to be redirected to complete payment (create, upgrade where gateway requires redirect, switch gateway).
- `effectiveAt` on upgrade responses is `null` until the payment webhook confirms success.
- Legacy plan types (FREE, PLUS, PRO, PREMIUM, PREMIUM_TRIAL) may appear in `planType` for historical subscription records but are not valid inputs to any endpoint.

---

## Idempotency and Concurrency Notes

- Use `Idempotency-Key` on `POST /v1/subscriptions/create` and `POST /v1/subscriptions/upgrade`.
- The server stores idempotency keys for 24 hours. Retrying with the same key and the same request body within 24 hours returns the cached response.
- Retrying with the same key but a different request body returns HTTP 422.
- Webhook idempotency is internal — `UnifiedWebhookHandler` tracks event IDs independently of the HTTP layer.
- Concurrent requests for the same merchant and the same operation (e.g., two simultaneous create calls) are protected by a database-level lock on the subscription record. The second call returns `409 SUBSCRIPTION_ALREADY_EXISTS` if the first succeeded.

---

## Security and Privacy Notes

- Card details and wallet credentials are never processed or stored by Prosperna. All payment credential handling is delegated to Stripe (PCI-DSS Level 1) and Xendit.
- `stripe_customer_id` and `stripe_subscription_id` stored in Prosperna's DB are opaque reference IDs. They contain no PII or payment credentials.
- Webhook signature verification is mandatory. A compromised webhook endpoint could trigger spurious account suspensions — protect the signing secret.
- All API communication over HTTPS. TLS 1.2+ required.
- JWT tokens must have a short expiry. Do not log JWT values.

---

## Domain Events and Webhooks

These are **outbound** internal domain events emitted by the subscription service. They are consumed by other Prosperna services (not by external callers).

| Event | When Emitted | Consumers |
|---|---|---|
| `subscription.activated` | Payment webhook confirmed success | ST-04 (unlock screen), ST-03 (end trial), frontend |
| `subscription.payment_failed` | Payment failure webhook received | ST-04 (`suspendMerchant()`), ST-14 (suspension email) |
| `subscription.downgrade_scheduled` | Downgrade endpoint called | ST-06 (usage limits), ST-11 (dashboard UI) |
| `subscription.downgraded` | Downgrade takes effect at period end | ST-06 (enforce lower limits), `business-profile-api` |
| `subscription.gateway_switched` | Gateway switch complete | ST-12 (reporting) |

---

## SDK and Integration Examples

**JavaScript (Node.js) — Create subscription via Stripe**

```javascript
const response = await fetch('https://api.prosperna.com/v1/subscriptions/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${merchantJwt}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID()
  },
  body: JSON.stringify({
    planType: 'LAUNCH',
    billingCycle: 'MONTHLY',
    gateway: 'STRIPE'
  })
});

const data = await response.json();
if (response.ok) {
  // Redirect merchant to Stripe checkout
  window.location.href = data.paymentUrl;
} else {
  console.error('Subscription creation failed:', data.error);
}
```

**JavaScript — Poll subscription status after redirect back**

```javascript
const status = await fetch('https://api.prosperna.com/v1/subscriptions/status', {
  headers: { 'Authorization': `Bearer ${merchantJwt}` }
}).then(r => r.json());

if (status.status === 'active') {
  showSuccessPage(status);
} else if (status.status === 'pending_payment') {
  // Webhook hasn't fired yet — show a loading state, re-check after a short delay
  setTimeout(pollStatus, 3000);
}
```

---

## How to Use This API Safely

1. **Always include an Idempotency-Key** on `create` and `upgrade` calls. This is the primary protection against duplicate subscriptions caused by network retries.
2. **Do not use the subscription status endpoint to drive real-time payment confirmation.** Use it to display current state. Payment confirmation comes via webhook asynchronously.
3. **Set client timeout to 30 seconds** for create and upgrade endpoints. These involve external gateway API calls.
4. **Webhook consumers must return 200 quickly.** If your webhook handler performs slow operations, process asynchronously and return 200 immediately.
5. **Test in Stripe test mode and Xendit sandbox** before going live. Use Stripe's test card numbers and Xendit's sandbox environment.
6. **Verify gateway configuration before deploying:** Stripe Smart Retries disabled, Stripe webhook signing secret set, Xendit callback token set, Stripe Products/Prices created.
7. **Do not derive subscription status from `marketCountry`.** Always read `payment_gateway` and `subscription_status` from the subscription record.

---

## Change Impact

| Area Changed | Impact |
|---|---|
| New endpoints added | Consumers should verify endpoint availability in staging before relying on them |
| `payment_gateway` field added to `plan_subscriptions` | Any code reading subscription records must handle the new field. Existing records will have `null` until migrated (ST-16). |
| `subscription_status` field added | All access control and plan-gating logic should migrate from reading `payPlanType` alone to also reading `subscription_status`. |
| `payment_gateway` on `plan_subscription_invoices` changed from hardcoded `'XENDIT'` to dynamic | Invoice filtering by gateway will now work correctly for Stripe invoices |
| `revertToFreePlan()` removed from `business-profile-api` | Any caller must be updated to use `suspendMerchant()` logic. No Free Plan fallback exists. |
| Xendit webhook endpoint refactored | Existing Xendit webhook integration should be regression-tested. Behavior is the same but implementation routes through `UnifiedWebhookHandler`. |

---

## Open Questions

| ID | Question | Status |
|---|---|---|
| OQ-1 | Does Xendit support USD invoicing for PH merchants? This affects the Xendit webhook payload currency field and the `amountDue` on Xendit create responses. | Open |
| OQ-2 | What is the confirmed quarterly and annual pricing in USD? | Open |
| OQ-3 | On gateway switch, does the billing period reset or carry over? This affects the `currentPeriodEnd` field returned by the switch-gateway endpoint. | Open |
| OQ-4 | What is the subscription `pending_payment` timeout threshold? After what duration should ops be alerted? | Open |
