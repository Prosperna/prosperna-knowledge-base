---
id: st-09-marketplace-addons-native-free
title: Endpoint Document. ST-09 Marketplace Add-Ons — Native Apps Become Free
sidebar_label: ST-09 Marketplace Add-Ons — Native Apps Become Free
sidebar_position: 9
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-22
- Status: Draft

## Linked Documents
- BRD: BRD-ST-09-Marketplace-Addons-Native-Free.md
- PRD: PRD-ST-09-Marketplace-Addons-Native-Free.md

---

## Public API Overview

This document covers the **Marketplace API changes** introduced by ST-09. The primary services affected are:

- `payment-integration-api` — Marketplace subscription and billing lifecycle
- `business-profile-api` — Marketplace app activation state on a store

**Key behavioral change:** The existing `POST /v1/payments/marketplace/{appKey}/subscribe` endpoint gains conditional logic. When `appKey` is NOT in `PAID_MARKETPLACE_APP_KEYS`, the endpoint skips all payment processing and calls `business-profile-api` directly to activate the app. When `appKey` IS in `PAID_MARKETPLACE_APP_KEYS` (lazada, shopee), the existing paid flow is unchanged.

A new dedicated endpoint `POST /v1/payments/marketplace/{appKey}/activate` is introduced to expose the free activation path explicitly for frontend clarity and testability.

All other endpoints (unsubscribe, checkout, apps list) remain structurally unchanged with minor behavioral updates noted below.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Merchant Dashboard Frontend (`prosperna1`) | Activating/deactivating native marketplace apps; subscribing to Lazada/Shopee; displaying app status |
| Backend Migration Script | Bulk cancellation of existing paid native app subscriptions |
| Admin Control Platform | Querying historical marketplace invoices per merchant |
| Internal Agenda Jobs | Processing subscription renewals and expirations — updated to skip native apps |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Production | `https://api.prosperna.com` | Live merchant traffic | Requires valid merchant session token |
| Staging | `https://api-staging.prosperna.com` | Pre-release testing | Xendit test mode — no real charges |
| Local Development | `http://localhost:3000` | Developer local environment | Mock Xendit webhook supported |

---

## API Versioning and Compatibility

- All endpoints follow the `/v1/` prefix convention.
- This change introduces **no breaking changes** to existing endpoint contracts.
- The `subscribe` endpoint behavior changes conditionally based on `appKey`. Consumers that call subscribe for native apps will now receive an activation response (no payment step) instead of a payment URL/invoice response. Frontend must handle this new response shape.
- New endpoint `POST /v1/payments/marketplace/{appKey}/activate` is additive — no existing consumers are broken.

---

## Protocol and Data Format Standards

- **Transport:** HTTPS only. HTTP redirects to HTTPS.
- **Data format:** JSON (`Content-Type: application/json`, `Accept: application/json`).
- **Character encoding:** UTF-8.
- **Date/time format:** ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) in all request and response bodies.
- **Empty responses:** Use `204 No Content` with no body.
- **Error responses:** Use the Global Error Model defined in this document.

---

## Authentication and Authorization

| Mechanism | Detail |
|---|---|
| **Session Token** | All Marketplace endpoints require a valid merchant session token passed as `Authorization: Bearer {token}` in the request header. |
| **Store Ownership** | The authenticated merchant must own the store being operated on. The API resolves `store_id` from the session — merchants cannot activate/deactivate apps on other stores. |
| **Plan Gate** | Native app activation is blocked for FREE plan merchants. The API returns `403` if the merchant's current plan is FREE. |
| **Suspension Gate** | Suspended merchants cannot reach marketplace endpoints — they are redirected to the lock screen at the dashboard layer (ST-04). |
| **Admin Endpoints** | Admin invoice query endpoint requires an admin session token (separate auth scope). |

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| Merchant (TRIAL/LAUNCH/GROW/SCALE) | Activate/deactivate native apps; subscribe/unsubscribe Lazada/Shopee; view own app status | Cannot operate on other merchants' stores |
| Merchant (FREE plan) | View Marketplace listing | Cannot activate any apps |
| Merchant (Suspended) | None | Locked out at dashboard layer |
| Prosperna Admin | Read marketplace invoices for any store | Cannot activate/deactivate apps on behalf of merchants |
| Migration Script (Internal) | Cancel subscriptions; update subscription status; trigger notification emails | Internal use only — not exposed publicly |

---

## Ownership and Data Access Rules

- A merchant may only activate, deactivate, subscribe to, or unsubscribe from apps on **their own store**.
- `store_id` is always resolved from the authenticated session — it is never a caller-supplied parameter in public-facing endpoints.
- Admins query marketplace invoices by `store_id` path parameter — this is restricted to admin auth scope.

---

## Request Conventions

- All request bodies are JSON.
- `appKey` path parameter is a string matching the app's registered key (e.g., `blogs`, `wholesale`, `lazada`).
- Optional query parameters use `camelCase` (e.g., `?status=active`).
- Requests with invalid JSON bodies return `400 Bad Request`.

---

## Response Conventions

- Successful responses: `200 OK` with JSON body, or `204 No Content`.
- Created resources: `201 Created` with JSON body containing the resource.
- All error responses follow the Global Error Model (see below).
- Response bodies include a top-level `data` key for resource payloads.
- Pagination (where applicable) uses `meta.page`, `meta.pageSize`, `meta.total`.

---

## Global Guard Rails (Consumer Safety)

1. **Never retry a subscribe or activate request without checking the app's current status first.** Duplicate activation calls are idempotent (return current state), but duplicate subscribe calls for paid apps may create duplicate invoices.
2. **Always handle the new `activate` response from the `subscribe` endpoint** for native apps — it returns an activation result, not a payment URL. Check `response.type === 'activation'` vs `response.type === 'payment'`.
3. **Do not cache app status** for more than 30 seconds in the frontend — suspension and reactivation events can change status externally.
4. **For paid apps (Lazada, Shopee), always wait for the Xendit webhook** before displaying "Active" status. Do not optimistically mark as active after the subscribe call returns.
5. **Migration script:** Never send a notification before confirming the Xendit plan cancellation completed successfully.

---

## Rate Limits and Abuse Controls

| Bucket | Limit | Scope | Notes |
|---|---|---|---|
| `marketplace.activate` | 10 requests/minute | Per store | Prevents activation spam |
| `marketplace.subscribe` | 5 requests/minute | Per store | Prevents invoice creation spam |
| `marketplace.unsubscribe` | 5 requests/minute | Per store | |
| `marketplace.list` | 60 requests/minute | Per store | Read-heavy — higher limit |
| `admin.invoices` | 30 requests/minute | Per admin user | |

Rate limit exceeded responses: `429 Too Many Requests` with `Retry-After` header.

---

## Global Error Model

Use this standard structure for all error responses:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "MARKETPLACE_APP_NOT_FOUND",
    "type": "validation_error",
    "message": "The specified app key does not exist in the marketplace registry.",
    "details": [
      {
        "field": "appKey",
        "issue": "invalid_value",
        "expected": "A registered marketplace app key",
        "actual": "invalid-app-key"
      }
    ],
    "requestId": "req_01HXYZ1234567890",
    "timestamp": "2026-03-22T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/marketplace/errors"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `marketplace.activate` | POST | `/v1/payments/marketplace/{appKey}/activate` | Merchant session | Activate a native free marketplace app | `marketplace.activate` | FR-3, FR-4, FR-5, FR-6 |
| `marketplace.subscribe` | POST | `/v1/payments/marketplace/{appKey}/subscribe` | Merchant session | Subscribe to a paid marketplace app (Lazada/Shopee); conditionally routes to activate for native apps | `marketplace.subscribe` | FR-3, FR-9 |
| `marketplace.unsubscribe` | POST | `/v1/payments/marketplace/{appKey}/unsubscribe` | Merchant session | Cancel a paid marketplace app subscription (Lazada/Shopee only) | `marketplace.unsubscribe` | FR-15 |
| `marketplace.deactivate` | POST | `/v1/payments/marketplace/{appKey}/deactivate` | Merchant session | Deactivate a native free marketplace app | `marketplace.activate` | FR-8 |
| `marketplace.checkout` | POST | `/v1/payments/marketplace/checkout` | Merchant session | Complete marketplace payment (paid apps only) | `marketplace.subscribe` | FR-9 |
| `marketplace.list` | GET | `/v1/payments/marketplace/apps/list` | Merchant session | List merchant's marketplace subscriptions and activation statuses | `marketplace.list` | FR-11, FR-12, FR-13 |
| `admin.marketplace.invoices` | GET | `/v1/payments/xenditrecurringplaninvoices/store/{store_id}` | Admin session | List marketplace invoices for a store (admin view) | `admin.invoices` | FR-28 |

---

## Endpoint Reference

---

### 1. Activate Native Marketplace App

**Operation ID:** `marketplace.activate`

**Purpose:** Activates a natively built marketplace app on the merchant's store without any payment flow. This endpoint is the direct activation path for apps NOT in `PAID_MARKETPLACE_APP_KEYS`. It calls `business-profile-api` to set the app as active on the store.

**When to use:** Call this endpoint when the merchant clicks "Free — Activate" on a native marketplace app card.

**Method:** `POST`
**Path:** `/v1/payments/marketplace/{appKey}/activate`

**Required Auth:** Merchant session token (`Authorization: Bearer {token}`)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `appKey` | Path | string | Yes | Must be a registered app key NOT in `PAID_MARKETPLACE_APP_KEYS` | The marketplace app to activate |

**Request Body:** None required.

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/payments/marketplace/blogs/activate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response — 200 OK:**

```json
{
  "data": {
    "appKey": "blogs",
    "appName": "Blogs",
    "status": "active",
    "activatedAt": "2026-03-22T10:15:00Z",
    "storeId": "store_01HXYZ1234",
    "type": "activation"
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MARKETPLACE_APP_IS_PAID` | `appKey` is in `PAID_MARKETPLACE_APP_KEYS` (use subscribe instead) | Redirect to subscribe endpoint |
| 400 | `MARKETPLACE_APP_NOT_FOUND` | `appKey` is not a registered marketplace app | Verify app key; do not retry with the same key |
| 400 | `MARKETPLACE_APP_ALREADY_ACTIVE` | App is already active on this store | Show "Active" status; no action needed |
| 401 | `UNAUTHORIZED` | Missing or invalid session token | Re-authenticate and retry |
| 403 | `PLAN_UPGRADE_REQUIRED` | Merchant is on FREE plan | Show plan upgrade prompt |
| 500 | `ACTIVATION_FAILED` | `business-profile-api` returned an error | Show error state; allow retry |

**Error Response Example — 403:**

```json
{
  "error": {
    "httpStatus": 403,
    "code": "PLAN_UPGRADE_REQUIRED",
    "type": "authorization_error",
    "message": "Native marketplace app activation requires a paid plan (TRIAL, LAUNCH, GROW, or SCALE).",
    "details": [],
    "requestId": "req_01HXYZ9876543210",
    "timestamp": "2026-03-22T10:15:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/marketplace/errors#PLAN_UPGRADE_REQUIRED"
  }
}
```

**Guard Rails:**
- Idempotent: If the app is already active, returns `400 MARKETPLACE_APP_ALREADY_ACTIVE`. Frontend should handle gracefully (show "Active" state).
- Timeout: Set client-side timeout to 5 seconds. If no response, check app status via `GET /v1/payments/marketplace/apps/list` before retrying.
- No retry on `400` errors — these are permanent failures.
- Retry on `500` errors with exponential backoff: 1s, 2s, 4s (max 3 attempts).

---

### 2. Subscribe to Marketplace App (Modified — Conditional Routing)

**Operation ID:** `marketplace.subscribe`

**Purpose:** Subscribe to a paid marketplace app (Lazada or Shopee) OR activate a native free app (conditional routing). After ST-09, this endpoint checks `appKey` against `PAID_MARKETPLACE_APP_KEYS`:
- If NOT in `PAID_MARKETPLACE_APP_KEYS` → delegates to free activation path (same as `marketplace.activate`)
- If IN `PAID_MARKETPLACE_APP_KEYS` → existing paid flow (Xendit invoice creation)

Frontend should prefer calling `/activate` directly for native apps to avoid ambiguity.

**Method:** `POST`
**Path:** `/v1/payments/marketplace/{appKey}/subscribe`

**Required Auth:** Merchant session token

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `appKey` | Path | string | Yes | Registered marketplace app key | The app to subscribe to or activate |
| `billingCycle` | Body | string | Conditional | `monthly`, `quarterly`, `annual` | Required only for paid apps (lazada, shopee) |
| `promoCode` | Body | string | No | Max 50 chars | Promo code — only applicable to paid apps |
| `paymentMethod` | Body | string | Conditional | `ewallet`, `credit_card` | Required only for paid apps |

**Request Body (Paid App — Lazada/Shopee):**

```json
{
  "billingCycle": "monthly",
  "promoCode": "PROMO123",
  "paymentMethod": "credit_card"
}
```

**Request Body (Native App — No body required):**

```bash
# No body needed — or empty JSON {}
```

**Request Example (Native App):**

```bash
curl -X POST https://api.prosperna.com/v1/payments/marketplace/wholesale/subscribe \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response — Native App — 200 OK:**

```json
{
  "data": {
    "appKey": "wholesale",
    "appName": "Wholesale",
    "status": "active",
    "activatedAt": "2026-03-22T10:20:00Z",
    "storeId": "store_01HXYZ1234",
    "type": "activation"
  }
}
```

**Success Response — Paid App (Lazada/Shopee) — 200 OK:**

```json
{
  "data": {
    "appKey": "lazada",
    "appName": "Lazada Integration",
    "status": "pending_payment",
    "invoiceId": "inv_01HXYZ5678",
    "paymentUrl": "https://checkout.xendit.co/web/...",
    "billingCycle": "monthly",
    "amount": 799.00,
    "currency": "PHP",
    "type": "payment"
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MARKETPLACE_APP_NOT_FOUND` | Unknown app key | Do not retry |
| 400 | `BILLING_CYCLE_REQUIRED` | Paid app with no billingCycle provided | Provide billingCycle |
| 400 | `INVALID_PROMO_CODE` | Promo code not valid for this app or expired | Remove promo code or use different one |
| 401 | `UNAUTHORIZED` | Missing/invalid session | Re-authenticate |
| 403 | `PLAN_UPGRADE_REQUIRED` | FREE plan merchant | Show upgrade prompt |
| 409 | `MARKETPLACE_APP_ALREADY_SUBSCRIBED` | Active subscription already exists for this paid app | Show current subscription details |
| 500 | `SUBSCRIPTION_CREATION_FAILED` | Xendit or internal error during invoice creation | Retry with backoff; show error if persists |

**Guard Rails:**
- Response `type` field distinguishes activation (`"type": "activation"`) from payment flow (`"type": "payment"`). Frontend MUST check this field to determine next step.
- For paid apps: do NOT mark the app as "Active" until the Xendit webhook confirms payment. Poll app status or wait for webhook-driven status update.
- Idempotency key: For paid app subscribe, include `Idempotency-Key: {uuid}` header to prevent duplicate invoice creation on retry.

---

### 3. Deactivate Native Marketplace App

**Operation ID:** `marketplace.deactivate`

**Purpose:** Deactivates a native free marketplace app on the merchant's store. No billing action is taken. For paid app cancellation, use `/unsubscribe`.

**Method:** `POST`
**Path:** `/v1/payments/marketplace/{appKey}/deactivate`

**Required Auth:** Merchant session token

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `appKey` | Path | string | Yes | Must be a registered native app key NOT in `PAID_MARKETPLACE_APP_KEYS` | The app to deactivate |

**Request Body:** None.

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/payments/marketplace/wholesale/deactivate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response — 200 OK:**

```json
{
  "data": {
    "appKey": "wholesale",
    "appName": "Wholesale",
    "status": "inactive",
    "deactivatedAt": "2026-03-22T10:30:00Z",
    "storeId": "store_01HXYZ1234"
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MARKETPLACE_APP_IS_PAID` | `appKey` is a paid app — use unsubscribe instead | Redirect to unsubscribe |
| 400 | `MARKETPLACE_APP_ALREADY_INACTIVE` | App is already inactive | Show inactive state; no action needed |
| 401 | `UNAUTHORIZED` | Missing/invalid session | Re-authenticate |
| 500 | `DEACTIVATION_FAILED` | `business-profile-api` error | Retry with backoff |

---

### 4. Unsubscribe from Paid Marketplace App (Lazada/Shopee — Unchanged)

**Operation ID:** `marketplace.unsubscribe`

**Purpose:** Cancel a paid marketplace app subscription (Lazada or Shopee only). Cancels Xendit recurring plan, stops future billing, and deactivates the app on the store.

**Method:** `POST`
**Path:** `/v1/payments/marketplace/{appKey}/unsubscribe`

**Required Auth:** Merchant session token

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `appKey` | Path | string | Yes | Must be in `PAID_MARKETPLACE_APP_KEYS` | The paid app to unsubscribe from |

**Request Body:** None.

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/payments/marketplace/lazada/unsubscribe \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response — 200 OK:**

```json
{
  "data": {
    "appKey": "lazada",
    "appName": "Lazada Integration",
    "status": "inactive",
    "unsubscribedAt": "2026-03-22T10:35:00Z",
    "billingCancelledAt": "2026-03-22T10:35:00Z",
    "storeId": "store_01HXYZ1234"
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MARKETPLACE_APP_IS_FREE` | Attempting to unsubscribe a native app | Use deactivate endpoint instead |
| 400 | `NO_ACTIVE_SUBSCRIPTION` | No active paid subscription found | No action needed |
| 401 | `UNAUTHORIZED` | Missing/invalid session | Re-authenticate |
| 502 | `XENDIT_CANCELLATION_FAILED` | Xendit API returned error | Retry; contact support if persists |

---

### 5. Marketplace Checkout (Paid Apps — Unchanged)

**Operation ID:** `marketplace.checkout`

**Purpose:** Complete payment for a marketplace app subscription. Called after subscribe initiates the payment flow for Lazada or Shopee.

**Method:** `POST`
**Path:** `/v1/payments/marketplace/checkout`

**Required Auth:** Merchant session token

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `invoiceId` | Body | string | Yes | Valid marketplace invoice ID | The invoice to complete payment for |
| `paymentMethodDetails` | Body | object | Conditional | Required for eWallet path | Payment method details |

**Request Body:**

```json
{
  "invoiceId": "inv_01HXYZ5678",
  "paymentMethodDetails": {
    "ewallet": "GCASH",
    "mobileNumber": "+63917XXXXXXX"
  }
}
```

**Success Response — 200 OK:**

```json
{
  "data": {
    "invoiceId": "inv_01HXYZ5678",
    "status": "pending",
    "paymentUrl": "https://checkout.xendit.co/web/...",
    "message": "Redirect to payment URL to complete transaction."
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVOICE_NOT_FOUND` | Invalid or expired invoice ID | Start subscription flow from beginning |
| 400 | `INVOICE_ALREADY_PAID` | Invoice has already been settled | Show "Active" app status |
| 400 | `INVALID_PAYMENT_METHOD` | Unsupported payment method for this merchant | Select a supported method |
| 401 | `UNAUTHORIZED` | Missing/invalid session | Re-authenticate |
| 502 | `XENDIT_ERROR` | Xendit API error | Retry; if persists, show support contact |

---

### 6. List Marketplace Apps and Subscriptions

**Operation ID:** `marketplace.list`

**Purpose:** Returns the merchant's marketplace apps with their current activation and subscription status. Used by the Marketplace listing page to determine button states (Activate, Active/Deactivate, Subscribe).

**Method:** `GET`
**Path:** `/v1/payments/marketplace/apps/list`

**Required Auth:** Merchant session token

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `status` | Query | string | No | `active`, `inactive`, `all` (default: `all`) | Filter apps by activation status |

**Request Example:**

```bash
curl -X GET "https://api.prosperna.com/v1/payments/marketplace/apps/list?status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response — 200 OK:**

```json
{
  "data": {
    "apps": [
      {
        "appKey": "blogs",
        "appName": "Blogs",
        "category": "native",
        "isPaid": false,
        "status": "active",
        "activatedAt": "2026-03-22T09:00:00Z",
        "subscription": null
      },
      {
        "appKey": "lazada",
        "appName": "Lazada Integration",
        "category": "third_party",
        "isPaid": true,
        "status": "active",
        "activatedAt": "2026-01-15T12:00:00Z",
        "subscription": {
          "subscriptionId": "sub_01HXYZ9999",
          "billingCycle": "monthly",
          "nextRenewalDate": "2026-04-15T00:00:00Z",
          "status": "active"
        }
      },
      {
        "appKey": "wholesale",
        "appName": "Wholesale",
        "category": "native",
        "isPaid": false,
        "status": "inactive",
        "activatedAt": null,
        "subscription": null
      }
    ],
    "meta": {
      "total": 3,
      "activeCount": 2,
      "inactiveCount": 1
    }
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid session | Re-authenticate |
| 500 | `LIST_FETCH_FAILED` | Internal error | Retry with backoff |

**Guard Rails:**
- Do not cache this response for more than 30 seconds — app status can change due to suspension/reactivation events.
- Use `isPaid` field to determine which CTA to show on each app card.

---

### 7. Admin — List Marketplace Invoices for Store

**Operation ID:** `admin.marketplace.invoices`

**Purpose:** Retrieves historical and current marketplace invoices for a specific merchant store. Used by Prosperna Admins in the Admin Control Platform. After ST-09, new invoices only appear for Lazada/Shopee; historical invoices for now-free native apps remain visible.

**Method:** `GET`
**Path:** `/v1/payments/xenditrecurringplaninvoices/store/{store_id}`

**Required Auth:** Admin session token

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `store_id` | Path | string | Yes | Valid store ID | The store to query invoices for |
| `invoice_type` | Query | string | Yes | `marketplace` | Filter to marketplace invoices only |
| `page` | Query | integer | No | Default: 1 | Pagination page |
| `pageSize` | Query | integer | No | Default: 20, max: 100 | Results per page |

**Request Example:**

```bash
curl -X GET "https://api.prosperna.com/v1/payments/xenditrecurringplaninvoices/store/store_01HXYZ1234?invoice_type=marketplace&page=1&pageSize=20" \
  -H "Authorization: Bearer {admin_token}"
```

**Success Response — 200 OK:**

```json
{
  "data": {
    "invoices": [
      {
        "invoiceId": "inv_01HBLG1234",
        "appKey": "blogs",
        "appName": "Blogs",
        "status": "paid",
        "amount": 495.00,
        "currency": "PHP",
        "billingCycle": "monthly",
        "paymentGateway": "xendit",
        "paidAt": "2025-12-01T08:00:00Z",
        "note": "Historical invoice — Blogs is now free as of 2026-03-22"
      },
      {
        "invoiceId": "inv_01HXYZ5678",
        "appKey": "lazada",
        "appName": "Lazada Integration",
        "status": "paid",
        "amount": 799.00,
        "currency": "PHP",
        "billingCycle": "monthly",
        "paymentGateway": "xendit",
        "paidAt": "2026-03-15T09:00:00Z",
        "note": null
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 2
    }
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid admin token | Re-authenticate with admin credentials |
| 403 | `FORBIDDEN` | Non-admin session used | Use admin session token |
| 404 | `STORE_NOT_FOUND` | Invalid store_id | Verify store ID |
| 500 | `INVOICE_FETCH_FAILED` | Internal error | Retry |

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `appKey` | Path | string | Yes (most endpoints) | Registered marketplace app key | Identifies the marketplace app. Valid values: `jnt`, `lalamove`, `myPay`, `additionalFee`, `blogs`, `order-scheduling`, `announcements`, `customDeliveryDate`, `customFonts`, `wholesale`, `qrMenu`, `menuView`, `geolocation`, `lazada`, `shopee` |
| `billingCycle` | Body | string | Conditional (paid apps only) | `monthly`, `quarterly`, `annual` | Billing frequency for paid app subscriptions |
| `promoCode` | Body | string | No | Max 50 chars, alphanumeric + hyphens | Promo code for paid app discount |
| `paymentMethod` | Body | string | Conditional (paid apps) | `ewallet`, `credit_card` | Xendit payment method |
| `status` | Query | string | No | `active`, `inactive`, `all` | Filter parameter for list endpoint |
| `invoice_type` | Query | string | Yes (admin invoices) | `marketplace` | Invoice category filter |
| `store_id` | Path | string | Yes (admin endpoint) | Valid store ID | Target store for admin invoice query |
| `page` | Query | integer | No | Min 1 | Pagination page number |
| `pageSize` | Query | integer | No | Min 1, max 100 | Results per page |
| `Idempotency-Key` | Header | string | Recommended (subscribe) | UUID v4 | Prevents duplicate invoice creation on retry |

---

## Request/Response Contract Notes

| Contract | Detail |
|---|---|
| `subscribe` response — `type` field | `"activation"` for native apps; `"payment"` for paid apps. Frontend must branch on this value. |
| `list` response — `isPaid` field | `false` for all native apps; `true` for lazada, shopee. Drives CTA rendering. |
| `list` response — `subscription` field | `null` for native apps (no subscription record created). Object with subscription details for active paid apps. |
| `list` response — app `status` | `"active"` or `"inactive"`. Suspended merchants never reach this endpoint. |
| Historical invoices — `note` field | May contain `"Historical invoice — [App Name] is now free as of [date]"` for invoices predating the ST-09 migration. |

---

## Idempotency and Concurrency Notes

| Endpoint | Idempotency | Notes |
|---|---|---|
| `marketplace.activate` | Idempotent | Returns `400 MARKETPLACE_APP_ALREADY_ACTIVE` if already active. Safe to retry. |
| `marketplace.deactivate` | Idempotent | Returns `400 MARKETPLACE_APP_ALREADY_INACTIVE` if already inactive. Safe to retry. |
| `marketplace.subscribe` (native) | Idempotent | Same as activate. |
| `marketplace.subscribe` (paid) | Requires `Idempotency-Key` header | Without idempotency key, duplicate calls may create duplicate Xendit invoices. Always send `Idempotency-Key: {uuid}`. |
| `marketplace.unsubscribe` | Idempotent | Returns `400 NO_ACTIVE_SUBSCRIPTION` if already unsubscribed. |
| `marketplace.checkout` | Not idempotent | Do not retry without checking invoice status. |

---

## Security and Privacy Notes

| Concern | Implementation |
|---|---|
| Session scoping | `store_id` resolved from authenticated session — merchants cannot manipulate other stores. |
| Admin endpoint access | Admin invoice endpoint requires separate admin auth scope. Not accessible with merchant tokens. |
| No PII in URLs | `store_id` in admin endpoint is an opaque identifier, not a merchant name or email. |
| Migration script | Internal use only. Not exposed via public API. Requires ops-level access. |
| Audit log | Migration produces a per-merchant, per-app audit log stored in internal logging system. |

---

## Domain Events and Webhooks

| Event | Producer | Consumers | Payload Summary |
|---|---|---|---|
| `marketplace.app.activated` | `payment-integration-api` / `business-profile-api` | Analytics, Agenda jobs | `store_id`, `app_key`, `activated_at` |
| `marketplace.app.deactivated` | `business-profile-api` | Analytics | `store_id`, `app_key`, `deactivated_at` |
| `marketplace.subscription.migrated` | Migration script | Analytics, audit log | `store_id`, `app_key`, `subscription_id`, `reason: "migrated_to_free"` |
| `xendit.invoice.paid` (inbound) | Xendit → `payment-integration-api` | Activates Lazada/Shopee on payment confirmation | Invoice ID, amount, external_id (prefix distinguishes marketplace vs. plan) |
| `marketplace.suspension.applied` | `business-profile-api` | Dashboard lock screen | `store_id`, `app_keys_deactivated[]` |
| `marketplace.reactivation.applied` | `business-profile-api` | Dashboard | `store_id`, `native_apps_restored[]`, `paid_apps_pending_resubscription[]` |

---

## SDK and Integration Examples

### Frontend — Activating a Native App (prosperna1)

```javascript
// Check if app is native (not paid)
const isNativeApp = !PAID_MARKETPLACE_APP_KEYS.includes(appKey);

if (isNativeApp) {
  const response = await fetch(`/v1/payments/marketplace/${appKey}/activate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    },
  });

  const { data } = await response.json();

  if (data.status === 'active') {
    // Update UI to show "Active" state
    setAppStatus(appKey, 'active');
  }
} else {
  // Use subscribe flow for paid apps (Lazada/Shopee)
}
```

### Frontend — Handling subscribe response type

```javascript
const response = await subscribeToApp(appKey, billingOptions);
const { data } = response;

if (data.type === 'activation') {
  // Native app — already active
  setAppStatus(appKey, 'active');
} else if (data.type === 'payment') {
  // Paid app — redirect to Xendit checkout
  window.location.href = data.paymentUrl;
}
```

### Migration Script — Cancel Native App Subscriptions (Internal)

```javascript
// Pseudocode for migration script
const nativeAppKeys = PREVIOUSLY_PAID_NATIVE_APP_KEYS; // blogs, wholesale, etc.

for (const subscription of activeNativeAppSubscriptions) {
  try {
    // 1. Cancel Xendit recurring plan
    await xenditClient.cancelRecurringPlan(subscription.xenditPlanId);

    // 2. Preserve app activation status (do NOT deactivate)
    // business-profile-api app state is untouched

    // 3. Update subscription record
    await db.marketplaceSubscriptions.updateOne(
      { _id: subscription._id },
      { status: 'INACTIVE', reason: 'migrated_to_free', migratedAt: new Date() }
    );

    // 4. Send notification email
    await emailService.sendMarketplaceMigrationNotification({
      storeId: subscription.storeId,
      appKey: subscription.appKey,
      appName: APP_NAMES[subscription.appKey],
    });

    // 5. Audit log
    auditLog.record({ storeId, appKey, result: 'success' });

  } catch (error) {
    auditLog.record({ storeId, appKey, result: 'failed', error: error.message });
    // Continue to next subscription
  }
}
```

---

## How to Use This API Safely

1. **Always check `isPaid` from the list endpoint** before deciding which CTA to render. Do not hardcode app key lists in the frontend — the backend is the source of truth via `PAID_MARKETPLACE_APP_KEYS`.

2. **For native apps, prefer `/activate` over `/subscribe`** to avoid ambiguity in response handling.

3. **For paid apps (Lazada/Shopee), always include `Idempotency-Key`** on subscribe calls to prevent duplicate invoices on network retry.

4. **Never optimistically mark a paid app as "Active"** after a subscribe call. Wait for the `marketplace.app.activated` domain event or poll the list endpoint.

5. **Do not cache the app list** for more than 30 seconds — suspension/reactivation can change status externally without a direct frontend action.

6. **Migration script must be idempotent** — check for `reason: 'migrated_to_free'` before attempting to cancel a subscription again.

7. **For Announcements paywall**: after migration, new activations must not create limited-quota paywall records. Verify this behavior before running migration on production.

---

## Change Impact

| Area | Impact | Action Required |
|---|---|---|
| Frontend `prosperna1` | App card CTA logic changes for native apps | Update Marketplace listing and detail components |
| `payment-integration-api` subscribe endpoint | Conditional routing added | Add native/paid branch logic; update tests |
| `payment-integration-api` constants | `PAID_MARKETPLACE_APP_KEYS` reduced | Update constant; verify all usages compile |
| `payment-integration-api` Agenda jobs | Skip native apps for expiry/renewal | Update job guards; add unit tests |
| `orders-service-api` | Announcements paywall → unlimited | Update paywall creation logic for Announcements |
| `business-profile-api` | Called directly for native activation | Verify no payment-only guards block direct calls |
| `email-service-api` | New migration notification template | Add email template; test delivery |
| Admin Control Platform | No UI change; historical invoices remain | Verify existing invoice query returns historical records |
| Storefront `p1-customer` | No changes | Verify no impact — features work based on activation state only |

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Exact geolocation app key in codebase — must be verified before `PAID_MARKETPLACE_APP_KEYS` update | Backend Dev | Open |
| OQ-2 | Does `business-profile-api` have any payment-gate middleware that would block direct activation calls from `payment-integration-api`? | Backend Dev | Open — verify before implementation |
| OQ-3 | What is the Announcements "Gold tier" constant in `orders-service-api`? Is it `null` allocation, `0`, or a specific tier string? | Backend Dev | Open |
| OQ-4 | Should the `subscribe` endpoint be deprecated for native apps in a future version, keeping only `/activate` and `/deactivate`? | Product/Backend | Open — not in scope for ST-09 but should be tracked |
| OQ-5 | Is there a Xendit-side webhook that fires when a recurring plan is cancelled — and does it trigger any Prosperna logic that needs guarding? | Backend Dev | Open — verify webhook routing before migration |
