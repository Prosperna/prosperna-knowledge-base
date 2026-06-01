---
id: discounts-enhancement
title: Endpoint Document. Discounts Enhancement
sidebar_label: Discounts Enhancement
sidebar_position: 1
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-04
- Status: Draft

---

## Linked Documents
- BRD: BRD-Discounts-Enhancement.md
- PRD: PRD-Discounts-Enhancement.md

---

## Public API Overview

This document describes the API contract changes required to support the Discounts Enhancement feature. Three API areas are affected:

1. **Discount creation endpoint** — Updated request body to support the new Flat Amount application mode field (radio button).
2. **Order Details endpoint** — Updated response to include cap detection metadata (`discountCapTriggered`, `configuredValue`, `appliedAmount`).
3. **Checkout discount resolution endpoint** — Updated response to include `discountType` enum so the Online Store frontend can conditionally render the Once Per Order tooltip.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Merchant Dashboard frontend | Reads Order Details API to conditionally render `?` icon and cap label |
| Online Store Website frontend | Reads checkout discount resolution response to conditionally render checkout tooltip |
| Merchant Dashboard frontend | Sends updated discount creation payload with new `applicationMode` field |
| QA / test engineers | Uses this document to validate request/response contracts end-to-end |
| Backend engineers | Implements algorithm change and response field additions per this spec |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `https://api-dev.prosperna.com/v1` | Local and integration testing | Feature-flagged |
| Staging | `https://api-staging.prosperna.com/v1` | QA and UAT | Feature-flagged |
| Production | `https://api.prosperna.com/v1` | Live merchant traffic | Rolled out per phase plan |

- Note: Exact base URLs are illustrative. Confirm with Engineering.

---

## API Versioning and Compatibility

- All changes are **additive** (new fields in response bodies; new field in request body).
- Existing consumers that do not read the new fields are unaffected.
- The `applicationMode` field in discount creation is **required** when `discountType = FLAT_AMOUNT` after the release date. Prior to release, the existing `oncePerOrder` boolean remains the fallback.
- Breaking change: None. All changes are backward-compatible.

---

## Protocol and Data Format Standards

- Protocol: HTTPS REST
- Data format: JSON (`Content-Type: application/json`)
- Authentication: Bearer token (JWT)
- Character encoding: UTF-8
- Monetary amounts: Decimal string (e.g., `"100.00"`) in PHP (Philippine Peso)
- Dates/times: ISO 8601 (`2026-03-04T10:00:00+08:00`)

---

## Authentication and Authorization

All endpoints require a valid merchant JWT Bearer token issued by the Prosperna authentication service.

```
Authorization: Bearer <merchant_jwt_token>
```

Tokens are scoped to a single merchant account. Cross-merchant access is not permitted.

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| Merchant (authenticated) | Create, view, update, delete own discounts; view own order details | Cannot access other merchants' discounts or orders |
| Customer (checkout context) | Trigger discount resolution at checkout | Read-only; cannot create or modify discounts |
| Prosperna Admin | All merchant discount and order operations | Platform-level access; not surfaced in this feature scope |

---

## Ownership and Data Access Rules

- Discounts are owned by the merchant who created them. Merchant JWT must match the `merchantId` on the discount.
- Order details are accessible only by the owning merchant.
- Checkout discount resolution is scoped to the active cart session; customer identity is not required for Automatic discounts, but session or cart token is required.

---

## Request Conventions

- All requests must include `Content-Type: application/json` for bodies.
- `merchantId` is derived from the JWT; do not include it as a query parameter.
- Monetary values in request bodies must be numeric strings with two decimal places (e.g., `"100.00"`).
- Boolean fields: `true` / `false`.

---

## Response Conventions

- All responses return JSON.
- HTTP 2xx indicates success.
- HTTP 4xx indicates a client error (see Global Error Model).
- HTTP 5xx indicates a server error.
- All monetary amounts in responses are returned as decimal strings with two decimal places.
- All datetimes in responses are ISO 8601 with timezone offset.

---

## Global Guard Rails (Consumer Safety)

- Always validate that `discountType` is `FLAT_AMOUNT` before reading `applicationMode` from the discount creation payload.
- Always check `discountCapTriggered` before rendering the `?` icon and partial amount format — do not rely on comparing amounts client-side due to floating point risk.
- The `discountType` enum in checkout responses is the authoritative source for tooltip gating — do not infer type from other fields.
- Do not cache discount resolution responses at the checkout layer; discounts are time-sensitive and state-dependent.

---

## Rate Limits and Abuse Controls

| Endpoint | Limit | Window | Action on Breach |
|---|---|---|---|
| POST /discounts | 60 requests | per merchant per hour | HTTP 429 |
| GET /orders/`{orderId}` | 300 requests | per merchant per hour | HTTP 429 |
| POST /checkout/discount-resolve | 120 requests | per session per hour | HTTP 429 |

---

## Global Error Model

Use this standard structure for all error responses:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "client_error",
    "message": "One or more fields failed validation.",
    "details": [
      {
        "field": "applicationMode",
        "issue": "required",
        "expected": "ONCE_PER_ORDER | PER_ELIGIBLE_ITEM",
        "actual": null
      }
    ],
    "requestId": "req_abc123xyz",
    "timestamp": "2026-03-04T10:00:00+08:00",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/discounts"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `createDiscount` | POST | `/discounts` | Merchant JWT | Create a new discount with updated Flat Amount application mode field | 60/hr per merchant | FR-3, FR-4 |
| `getOrderDetails` | GET | `/orders/{orderId}` | Merchant JWT | Retrieve order details including cap-aware discount line data | 300/hr per merchant | FR-7, FR-8, FR-9 |
| `resolveCheckoutDiscount` | POST | `/checkout/discount-resolve` | Cart session token | Resolve applicable discounts for a checkout cart; returns discount type for frontend tooltip gating | 120/session/hr | FR-10, FR-11, FR-1, FR-2 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. createDiscount

**Operation ID:** `createDiscount`
**Purpose:** Creates a new discount for a merchant. When `discountType` is `FLAT_AMOUNT`, the `applicationMode` field is required to specify whether the discount applies once per order (applied to the order subtotal) or per eligible item.

**Method:** POST
**Path:** `/discounts`
**Auth:** Bearer merchant JWT

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <token>` | Merchant JWT |
| `Content-Type` | Header | string | Yes | `application/json` | — |

**Request Body Schema Notes:**
- `discountType`: enum — `FLAT_AMOUNT`, `PERCENT`, `FREE_SHIPPING`
- `applicationMode`: enum — `ONCE_PER_ORDER`, `PER_ELIGIBLE_ITEM`. **Required when `discountType = FLAT_AMOUNT`.** Ignored for other types.
- `discountValue`: decimal string. Required for `FLAT_AMOUNT` and `PERCENT`. Omitted for `FREE_SHIPPING`.
- `minimumRequirement`: object — `{ type: "NONE" | "MIN_PURCHASE" | "MIN_QUANTITY", value: decimal string | integer }`
- `productScope`: enum — `ALL_PRODUCTS`, `SPECIFIC_CATEGORIES`, `SPECIFIC_PRODUCTS`
- `productIds` / `categoryIds`: arrays of IDs, required when `productScope` is not `ALL_PRODUCTS`
- `storeLocations`: array of store location IDs, or `["ALL"]`
- `startAt`: ISO 8601 datetime
- `endAt`: ISO 8601 datetime or `null` (no expiry)
- `combineWithProductDiscounts`: boolean
- `combineWithShippingDiscounts`: boolean

**Full Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/discounts \
  -H "Authorization: Bearer <merchant_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SUMMER100",
    "discountType": "FLAT_AMOUNT",
    "applicationMode": "ONCE_PER_ORDER",
    "discountValue": "100.00",
    "productScope": "ALL_PRODUCTS",
    "storeLocations": ["ALL"],
    "minimumRequirement": {
      "type": "MIN_PURCHASE",
      "value": "80.00"
    },
    "startAt": "2026-03-05T00:00:00+08:00",
    "endAt": null,
    "combineWithProductDiscounts": false,
    "combineWithShippingDiscounts": false
  }'
```

**Success Response (201 Created):**

```json
{
  "discountId": "disc_abc123",
  "name": "SUMMER100",
  "discountType": "FLAT_AMOUNT",
  "applicationMode": "ONCE_PER_ORDER",
  "discountValue": "100.00",
  "productScope": "ALL_PRODUCTS",
  "storeLocations": ["ALL"],
  "minimumRequirement": {
    "type": "MIN_PURCHASE",
    "value": "80.00"
  },
  "startAt": "2026-03-05T00:00:00+08:00",
  "endAt": null,
  "combineWithProductDiscounts": false,
  "combineWithShippingDiscounts": false,
  "status": "ACTIVE",
  "createdAt": "2026-03-04T10:00:00+08:00",
  "transactionCount": 0
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `applicationMode` missing when `discountType = FLAT_AMOUNT` | Provide `applicationMode` |
| 400 | `VALIDATION_ERROR` | `discountValue` missing when `discountType = FLAT_AMOUNT` or `PERCENT` | Provide `discountValue` |
| 400 | `VALIDATION_ERROR` | `endAt` is before `startAt` | Correct date range |
| 401 | `UNAUTHORIZED` | JWT missing or expired | Re-authenticate |
| 403 | `FORBIDDEN` | Merchant does not own this resource context | Check merchant account |
| 429 | `RATE_LIMIT_EXCEEDED` | 60 requests/hr exceeded | Back off and retry after `Retry-After` header value |

**Error Response Example:**

```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "client_error",
    "message": "applicationMode is required when discountType is FLAT_AMOUNT.",
    "details": [
      {
        "field": "applicationMode",
        "issue": "required",
        "expected": "ONCE_PER_ORDER | PER_ELIGIBLE_ITEM",
        "actual": null
      }
    ],
    "requestId": "req_xyz789",
    "timestamp": "2026-03-04T10:01:00+08:00",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/discounts"
  }
}
```

**Guard Rails:**
- Do not retry on 400 (client validation errors) — fix the request first.
- `applicationMode` is ignored if `discountType` is not `FLAT_AMOUNT`; no need to send it for other types.
- `discountValue` must be a positive decimal greater than zero for `FLAT_AMOUNT` and `PERCENT`.

---

### 2. getOrderDetails

**Operation ID:** `getOrderDetails`
**Purpose:** Retrieves full order details for a merchant, including a cap-aware discount line. When a discount cap was triggered on this order, the response includes `discountCapTriggered: true`, `configuredValue`, and `appliedAmount` to enable conditional UI rendering on the Merchant Dashboard.

**Method:** GET
**Path:** `/orders/{orderId}`
**Auth:** Bearer merchant JWT

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | Yes | `Bearer <token>` | Merchant JWT |
| `orderId` | Path | string | Yes | Non-empty | The unique order identifier |

**Request Example:**

```bash
curl -X GET https://api.prosperna.com/v1/orders/ord_699e9d14 \
  -H "Authorization: Bearer <merchant_jwt>"
```

**Success Response (200 OK) — relevant discount section:**

```json
{
  "orderId": "ord_699e9d14",
  "discount": {
    "discountId": "disc_abc123",
    "name": "Delivery Discount",
    "configuredValue": "100.00",
    "appliedAmount": "82.00",
    "discountCapTriggered": true,
    "discountType": "FLAT_AMOUNT",
    "applicationMode": "ONCE_PER_ORDER"
  },
  "subtotal": "146.00",
  "additionalFee": "50.00",
  "convenienceFee": "10.00",
  "taxes": "18.72",
  "grandTotal": "224.72",
  "netIncome": "180.00"
}
```

**No-Cap Example (same endpoint):**

```json
{
  "orderId": "ord_699e9d15",
  "discount": {
    "discountId": "disc_abc456",
    "name": "NYET",
    "configuredValue": "100.00",
    "appliedAmount": "100.00",
    "discountCapTriggered": false,
    "discountType": "PERCENT",
    "applicationMode": null
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | JWT missing or expired | Re-authenticate |
| 403 | `FORBIDDEN` | Order does not belong to this merchant | Verify order ownership |
| 404 | `NOT_FOUND` | `orderId` does not exist | Check the order ID |
| 429 | `RATE_LIMIT_EXCEEDED` | 300 requests/hr exceeded | Back off per `Retry-After` |

**Error Response Example:**

```json
{
  "error": {
    "httpStatus": 404,
    "code": "NOT_FOUND",
    "type": "client_error",
    "message": "Order not found.",
    "details": [],
    "requestId": "req_aaa111",
    "timestamp": "2026-03-04T10:05:00+08:00",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/orders"
  }
}
```

**Guard Rails:**
- Use `discountCapTriggered` (boolean) as the authoritative signal to show the `?` icon — do not compare `configuredValue` and `appliedAmount` client-side due to floating point precision risk.
- If `discount` is `null` on the order, no discount was applied — do not render any discount line.
- If `discountCapTriggered` is `false` or `null`, render the standard discount line with no `?` icon.

---

### 3. resolveCheckoutDiscount

**Operation ID:** `resolveCheckoutDiscount`
**Purpose:** Evaluates which discounts apply to the current checkout cart and returns the applied discount(s) with their type metadata. The `discountType` field enables the Online Store frontend to conditionally render the "Once per order" tooltip on eligible discount tags.

**Method:** POST
**Path:** `/checkout/discount-resolve`
**Auth:** Cart session token (anonymous or authenticated customer session)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `X-Cart-Session` | Header | string | Yes | Active session token | Cart session identifier |
| `Content-Type` | Header | string | Yes | `application/json` | — |

**Request Body Schema Notes:**
- `cartId`: string — active cart identifier
- `storeLocationId`: string — the store location for this checkout
- `promoCode`: string or `null` — coupon code entered by customer (null for Automatic-only resolution)
- `items`: array of `{ productId, quantity, unitPrice }` — current cart items

**Full Request Example:**

```bash
curl -X POST https://api.prosperna.com/v1/checkout/discount-resolve \
  -H "X-Cart-Session: sess_customer_abc" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "cart_xyz999",
    "storeLocationId": "loc_alabang",
    "promoCode": null,
    "items": [
      { "productId": "prod_001", "quantity": 1, "unitPrice": "125.00" },
      { "productId": "prod_002", "quantity": 1, "unitPrice": "101.00" },
      { "productId": "prod_003", "quantity": 1, "unitPrice": "2.00" }
    ]
  }'
```

**Success Response (200 OK):**

```json
{
  "cartId": "cart_xyz999",
  "appliedDiscounts": [
    {
      "discountId": "disc_abc123",
      "name": "Delivery Discount",
      "discountType": "FLAT_AMOUNT",
      "applicationMode": "ONCE_PER_ORDER",
      "method": "AUTOMATIC",
      "targetItemProductId": null,
      "configuredValue": "100.00",
      "appliedAmount": "100.00",
      "discountCapTriggered": false,
      "itemBreakdown": null
    }
  ],
  "totalDiscount": "100.00",
  "subtotalBeforeDiscount": "228.00",
  "subtotalAfterDiscount": "128.00"
}
```

**No Applied Discounts (valid response):**

```json
{
  "cartId": "cart_xyz999",
  "appliedDiscounts": [],
  "totalDiscount": "0.00",
  "subtotalBeforeDiscount": "228.00",
  "subtotalAfterDiscount": "228.00"
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `cartId` missing or empty | Provide a valid cart ID |
| 400 | `INVALID_PROMO_CODE` | Coupon code entered does not match any active discount | Notify customer: "Invalid promo code." |
| 400 | `PROMO_CODE_NOT_ELIGIBLE` | Code exists but conditions not met (wrong store, min req not met, expired) | Notify customer: "Promo code is not applicable to this order." |
| 401 | `UNAUTHORIZED` | Cart session token missing or invalid | Re-initialize cart session |
| 429 | `RATE_LIMIT_EXCEEDED` | 120 requests/session/hr exceeded | Back off per `Retry-After` |

**Error Response Example (invalid promo code):**

```json
{
  "error": {
    "httpStatus": 400,
    "code": "INVALID_PROMO_CODE",
    "type": "client_error",
    "message": "The promo code entered does not match any active discount.",
    "details": [
      {
        "field": "promoCode",
        "issue": "no_match",
        "expected": "A valid active discount name",
        "actual": "BADCODE123"
      }
    ],
    "requestId": "req_bbb222",
    "timestamp": "2026-03-04T10:10:00+08:00",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/checkout"
  }
}
```

**Guard Rails:**
- Do not cache the response from `resolveCheckoutDiscount`. Cart state (items, quantities, promo codes) changes frequently.
- Use `discountType = "FLAT_AMOUNT"` AND `applicationMode = "ONCE_PER_ORDER"` to gate the checkout tooltip rendering — both conditions must be true.
- For `ONCE_PER_ORDER` mode, `targetItemProductId` is `null` — the discount is applied at the cart subtotal level, not to a specific item. Do not attempt to render an item-level discount tag for this mode.
- Treat `appliedDiscounts: []` as a valid success — no discount applies; suppress discount UI.
- Do not show tooltip if `appliedDiscounts` is empty or `discountType` is absent.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `discountType` | Request body (createDiscount) | string enum | Yes | `FLAT_AMOUNT`, `PERCENT`, `FREE_SHIPPING` | The type of discount |
| `applicationMode` | Request body (createDiscount) | string enum | Conditional | `ONCE_PER_ORDER`, `PER_ELIGIBLE_ITEM`; required when `discountType = FLAT_AMOUNT` | Flat Amount application scope |
| `discountValue` | Request body (createDiscount) | decimal string | Conditional | Positive number; omit for FREE_SHIPPING | The discount amount or percentage |
| `minimumRequirement.type` | Request body (createDiscount) | string enum | Yes | `NONE`, `MIN_PURCHASE`, `MIN_QUANTITY` | Minimum threshold type |
| `minimumRequirement.value` | Request body (createDiscount) | decimal string or integer | Conditional | Required when type ≠ NONE | Threshold value |
| `orderId` | Path (getOrderDetails) | string | Yes | Non-empty | Unique order identifier |
| `discountCapTriggered` | Response body (getOrderDetails, resolveCheckoutDiscount) | boolean | — | Read-only | Whether the discount was capped on this order |
| `configuredValue` | Response body | decimal string | — | Read-only | The discount value as configured by merchant |
| `appliedAmount` | Response body | decimal string | — | Read-only | The actual amount deducted (may be less than configuredValue if cap triggered) |
| `targetItemProductId` | Response body (resolveCheckoutDiscount) | string or null | — | `null` for ONCE_PER_ORDER (subtotal-based) mode; present for PER_ELIGIBLE_ITEM mode if applicable | The product ID of the item that received the discount; null when discount is applied at subtotal level |

---

## Request/Response Contract Notes

- `applicationMode` in `createDiscount` is a **new required field** for `discountType = FLAT_AMOUNT`. Consumers sending the old `oncePerOrder: boolean` field during the transition period will be supported via a deprecation shim until the field is removed (date TBD).
- `discountCapTriggered`, `configuredValue`, and `appliedAmount` are **new fields** in `getOrderDetails` and `resolveCheckoutDiscount` — existing consumers that do not read these fields are unaffected.
- `targetItemProductId` is new in `resolveCheckoutDiscount` for `ONCE_PER_ORDER` mode; `null` for other modes.

---

## Idempotency and Concurrency Notes

- `createDiscount` is **not idempotent** — submitting the same payload twice creates two discounts. Clients should implement duplicate detection before submission.
- `getOrderDetails` is safe to retry (idempotent GET).
- `resolveCheckoutDiscount` should be called at checkout render time and before payment submission. Not idempotent in the sense that cart state may change between calls.

---

## Security and Privacy Notes

- All endpoints require HTTPS. HTTP requests are rejected.
- Merchant JWT scope prevents cross-merchant data access at the API gateway level.
- No PII is introduced by the new fields (`discountCapTriggered`, `applicationMode`, `configuredValue`, `appliedAmount`).
- Cart session tokens for `resolveCheckoutDiscount` are short-lived (session duration only).

---

## Domain Events and Webhooks

No new webhooks are introduced by this feature. The following existing events fire when discounts are applied at checkout (no change):

| Event | Trigger |
|---|---|
| `order.created` | A new order is placed, including discount metadata in payload |
| `discount.applied` | A discount is successfully applied to an order |

---

## SDK and Integration Examples

No SDK changes are required. The new fields are additive and will be accessible via standard JSON parsing in existing SDK clients.

---

## How to Use This API Safely

1. **Creating discounts:** Always provide `applicationMode` when `discountType = FLAT_AMOUNT` to avoid validation errors.
2. **Rendering cap UI:** Use `discountCapTriggered` from `getOrderDetails` as the only signal to render the `?` icon. Never compare monetary amounts client-side.
3. **Checkout tooltip:** Gate the tooltip on `discountType === "FLAT_AMOUNT"` AND `applicationMode === "ONCE_PER_ORDER"` from `resolveCheckoutDiscount`.
4. **Error handling:** Handle `INVALID_PROMO_CODE` and `PROMO_CODE_NOT_ELIGIBLE` separately so you can surface the right customer-facing message.
5. **Do not cache checkout resolution:** Call `resolveCheckoutDiscount` fresh at checkout render time and again before payment confirmation.

---

## Change Impact

| Change | Impacted Endpoint | Impact Type | Backward Compatible |
|---|---|---|---|
| New `applicationMode` field in create discount request | `POST /discounts` | Additive — new required field for FLAT_AMOUNT type only | Yes (existing FLAT_AMOUNT discounts use deprecation shim) |
| New `discountCapTriggered`, `configuredValue`, `appliedAmount` in order details response | `GET /orders/{orderId}` | Additive — new response fields | Yes |
| New `discountType`, `applicationMode`, `targetItemProductId`, `discountCapTriggered`, `appliedAmount` in checkout resolve response | `POST /checkout/discount-resolve` | Additive — new response fields | Yes |
| Discount application change (order subtotal for ONCE_PER_ORDER) | Backend only — no API signature change | Behavioral — discount now applied to order subtotal instead of a specific item | N/A (backend behavior change) |

---

## Open Questions

| # | Question | Assumption |
|---|---|---|
| OEQ-1 | Does the existing Order Details API response already include `configuredValue` and `appliedAmount` separately, or only the net discount line? | Assumed: net only today; separate fields are new additions. |
| OEQ-2 | What is the exact cart session token mechanism — is it a cookie, a header, or a JWT? | Assumed: `X-Cart-Session` header with a short-lived session token. |
| OEQ-3 | Does the checkout resolve endpoint already exist under this path, or is this a new endpoint? | Assumed: existing discount resolution logic exists; this extends its response. |
| OEQ-4 | Are monetary values currently returned as strings or numbers in the API? | Assumed: decimal strings (e.g., `"100.00"`) for precision; confirm with Engineering. |
| OEQ-5 | Is there a deprecation timeline for the old `oncePerOrder: boolean` field? | Assumed: supported until the next major API version. TBD with Engineering. |
