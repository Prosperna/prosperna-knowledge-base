---
id: minimum-order-amount
title: Endpoint Document. Minimum Order Amount
sidebar_label: Minimum Order Amount
sidebar_position: 3
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-31
- Status: Draft

---

## Linked Documents
- BRD: [BRD-Minimum_Order_Amount.md](https://pkb.prosperna.ph/docs/business/minimum-order-amount)
- PRD: [PRD-Minimum_Order_Amount.md](https://pkb.prosperna.ph/docs/product/merchant/settings/store-settings/minimum-order-amount)

---

## Public API Overview

The Minimum Order Amount feature introduces two new fields (`is_minimum_order_enabled`, `minimum_order_amount`) to existing Prosperna API endpoints. No new endpoints are created. The changes are:

1. **Merchant-facing (authenticated):** Read and write via order settings endpoints.
2. **Customer-facing (public):** Read via public store profile endpoint (used by the Online Store).
3. **Order creation guard (optional):** Server-side enforcement on the computations endpoint.

All changes are additive. Existing consumers that do not reference the new fields are unaffected.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Merchant Dashboard frontend (`prosperna1`) | Read current minimum order settings on page load; write updated settings on save |
| Online Store frontend (`p1-customer`) | Read merchant's minimum order configuration from public store profile to enforce cart and checkout rules |
| Backend order computation service | Optionally reject order creation when cart subtotal is below the configured minimum |
| QA and integration testers | Validate that configuration changes propagate correctly to enforcement surfaces |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `https://api-dev.prosperna.com` | Local development and feature testing | Use test merchant credentials |
| Staging | `https://api-staging.prosperna.com` | QA and integration testing | Mirrors production data model |
| Production | `https://api.prosperna.com` | Live traffic | Requires production credentials |

---

## API Versioning and Compatibility

- All endpoints follow Prosperna's existing versioning conventions.
- The new fields (`is_minimum_order_enabled`, `minimum_order_amount`) are additive — no existing fields are modified or removed.
- Consumers that do not read the new fields will continue to function without changes.
- The public store profile endpoint (`/v1/...`) follows the existing `v1` versioning contract.

---

## Protocol and Data Format Standards

- **Protocol:** HTTPS only. HTTP requests are rejected.
- **Data format:** JSON (`Content-Type: application/json`).
- **Character encoding:** UTF-8.
- **Decimal handling:** `minimum_order_amount` is a JSON Number with up to 2 decimal places (e.g., `500.00`). Do not use string-encoded decimals.
- **Boolean handling:** `is_minimum_order_enabled` is a JSON Boolean (`true`/`false`). Do not use string-encoded booleans (`"true"`, `"false"`).
- **Date/time:** ISO 8601 (`2026-03-31T00:00:00Z`) where applicable.

---

## Authentication and Authorization

| Endpoint | Auth Required | Auth Type | Notes |
|---|---|---|---|
| `GET /business-profile/order/settings` | Yes | Bearer token (Merchant JWT) | Merchant must be authenticated; returns data scoped to the authenticated merchant |
| `PUT /business-profile/order/update/settings` | Yes | Bearer token (Merchant JWT) | Merchant can only update their own settings |
| `GET /v1/store-business-profile/details/public` | No | None | Public endpoint; read-only; scoped to a specific merchant store by path/query parameter |
| `POST /v1/computations/` | Depends | Varies (may require customer session or store context) | Optional guard; auth requirements follow existing computations endpoint policy |

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| Authenticated Merchant | Read own order settings; Write own order settings | Cannot read or modify another merchant's settings |
| Admin (Prosperna internal) | No involvement in this feature | Admin Control Platform is out of scope |
| Customer (public) | Read public store profile (minimum order config) | Read-only; cannot modify any settings |
| Guest (unauthenticated customer) | Read public store profile | Same as authenticated customer for this feature |

---

## Ownership and Data Access Rules

- `is_minimum_order_enabled` and `minimum_order_amount` are owned by and scoped to the merchant (business) entity.
- These values are stored at the merchant level — not per-location, not per-product.
- The public store profile endpoint exposes these values to the Online Store for customer-facing enforcement only.
- Merchants can read and write only their own order settings. Cross-merchant access is prohibited.

---

## Request Conventions

- All authenticated requests must include: `Authorization: Bearer <merchant_jwt>`
- `Content-Type: application/json` must be set on all `PUT` requests.
- The `PUT` endpoint accepts the full order settings payload. Consumers should send all existing order settings fields alongside the two new fields to avoid unintended field clearing.
- Field names follow snake_case convention consistent with existing Prosperna API conventions.

---

## Response Conventions

- Successful responses return HTTP `200 OK` with a JSON body.
- Created resources are not applicable here — all changes update existing records.
- Error responses follow the Global Error Model defined below.
- Timestamps in responses are ISO 8601 UTC.
- Null vs. absent: if `minimum_order_amount` has never been set, the field returns `0` (not `null`). If `is_minimum_order_enabled` has never been set, it returns `false`.

---

## Global Guard Rails (Consumer Safety)

1. **Always send the full settings payload on PUT.** Partial updates are not guaranteed — omitting existing fields may reset them to defaults on some implementations.
2. **Always read before writing.** Fetch `GET /business-profile/order/settings` before submitting a PUT to avoid overwriting fields that have changed since the page loaded.
3. **Validate on the client before submitting.** Check that `is_minimum_order_enabled = true` and `minimum_order_amount > 0` before allowing save — do not rely solely on server validation.
4. **Handle `is_minimum_order_enabled = false` explicitly.** When this field is false, the `minimum_order_amount` value must be ignored — do not enforce any minimum regardless of what the amount field contains.
5. **Do not cache the public store profile indefinitely.** The minimum order amount can be changed by the merchant at any time. The Online Store should respect the TTL of the public store profile query (via TanStack React Query's `staleTime` configuration).
6. **Treat `minimum_order_amount = 0` as no minimum.** A zero value, regardless of the enabled flag, means no minimum is enforced.

---

## Rate Limits and Abuse Controls

| Endpoint | Rate Limit | Bucket | Notes |
|---|---|---|---|
| `GET /business-profile/order/settings` | Follow existing merchant API rate limits | Per merchant | No change from current policy |
| `PUT /business-profile/order/update/settings` | Follow existing merchant API rate limits | Per merchant | No change from current policy |
| `GET /v1/store-business-profile/details/public` | Follow existing public endpoint rate limits | Per IP / per store | Cached by CDN; high traffic is expected |
| `POST /v1/computations/` | Follow existing computations rate limits | Per session / per store | No change from current policy |

---

## Global Error Model

All error responses use this standard structure:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "client_error",
    "message": "minimum_order_amount must be greater than zero.",
    "details": [
      {
        "field": "minimum_order_amount",
        "issue": "out_of_range",
        "expected": "value > 0",
        "actual": "0"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2026-03-31T08:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `GetOrderSettings` | GET | `/business-profile/order/settings` | Merchant JWT | Fetch merchant order settings including minimum order configuration | Per merchant | FR-1, FR-2, FR-5 |
| `UpdateOrderSettings` | PUT | `/business-profile/order/update/settings` | Merchant JWT | Save updated order settings including minimum order amount fields | Per merchant | FR-1, FR-3, FR-6, FR-7, FR-8 |
| `GetPublicStoreProfile` | GET | `/v1/store-business-profile/details/public` | None (public) | Fetch public store profile including minimum order config for Online Store enforcement | Per IP/store | FR-9, FR-10, FR-12, FR-13, FR-14, FR-15 |
| `CreateOrderComputation` (optional guard) | POST | `/v1/computations/` | Session/store context | Compute order; optionally rejects if cart subtotal is below minimum | Per session | FR-16 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. GetOrderSettings

**Purpose and when to use**
Retrieves the authenticated merchant's full order settings, including the two new minimum order amount fields. Call this when the Merchant Dashboard loads the Store Settings page to populate the MinimumOrderAmount component with the current saved values.

**Method / Path**
```
GET /business-profile/order/settings
```

**Auth**
- Required: Yes
- Type: Bearer token (Merchant JWT)
- Header: `Authorization: Bearer <token>`

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | String | Yes | Valid merchant JWT | Bearer token for the authenticated merchant |

**Request Body**
None. This is a GET request.

**Request Example**
```bash
curl -X GET "https://api.prosperna.com/business-profile/order/settings" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

**Success Response (200 OK)**
```json
{
  "data": {
    "order_settings": {
      "convenience_fee_enabled": false,
      "convenience_fee_amount": 0,
      "additional_fee_enabled": false,
      "additional_fee_amount": 0,
      "is_minimum_order_enabled": true,
      "minimum_order_amount": 500.00
    }
  }
}
```

**Error Path Table**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid Bearer token | Re-authenticate and retry |
| 403 | `FORBIDDEN` | Token is valid but does not belong to this merchant | Do not retry; investigate token |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error | Retry with exponential backoff; report if persistent |

**Error Response Example**
```json
{
  "error": {
    "httpStatus": 401,
    "code": "UNAUTHORIZED",
    "type": "auth_error",
    "message": "Authentication token is missing or invalid.",
    "details": [],
    "requestId": "req_xyz789",
    "timestamp": "2026-03-31T08:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

**Guard Rails**
- Always display the returned `is_minimum_order_enabled` and `minimum_order_amount` values as-is.
- If `minimum_order_amount` returns `0` and `is_minimum_order_enabled` returns `false`, the feature is off and no minimum is enforced.
- Do not infer state from one field alone — always check both fields together.

---

### 2. UpdateOrderSettings

**Purpose and when to use**
Saves the merchant's updated order settings. Called when the merchant clicks Save on the MinimumOrderAmount section. The request body must include all order settings fields, not only the minimum order amount fields, to avoid unintended resets.

**Method / Path**
```
PUT /business-profile/order/update/settings
```

**Auth**
- Required: Yes
- Type: Bearer token (Merchant JWT)
- Header: `Authorization: Bearer <token>`

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | String | Yes | Valid merchant JWT | Bearer token for the authenticated merchant |
| `Content-Type` | Header | String | Yes | Must be `application/json` | Request body format declaration |

**Request Body Schema Notes**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `is_minimum_order_enabled` | Boolean | Yes | `true` or `false` | Whether the minimum order amount feature is active |
| `minimum_order_amount` | Number | Conditional | Required and > 0 when `is_minimum_order_enabled` is `true`; must be >= 0 when `false` | The configured minimum cart subtotal in ₱ |
| (other order settings fields) | Various | Yes | Per existing contract | All existing fields must be included to avoid unintended resets |

**Request Example**
```bash
curl -X PUT "https://api.prosperna.com/business-profile/order/update/settings" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "convenience_fee_enabled": false,
    "convenience_fee_amount": 0,
    "additional_fee_enabled": false,
    "additional_fee_amount": 0,
    "is_minimum_order_enabled": true,
    "minimum_order_amount": 500.00
  }'
```

**Success Response (200 OK)**
```json
{
  "data": {
    "message": "Order settings updated successfully.",
    "order_settings": {
      "convenience_fee_enabled": false,
      "convenience_fee_amount": 0,
      "additional_fee_enabled": false,
      "additional_fee_amount": 0,
      "is_minimum_order_enabled": true,
      "minimum_order_amount": 500.00
    }
  }
}
```

**Error Path Table**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `is_minimum_order_enabled` is `true` and `minimum_order_amount` is `<= 0` | Show inline validation error; do not retry as-is |
| 400 | `VALIDATION_ERROR` | `minimum_order_amount` is not a valid number | Show inline validation error |
| 401 | `UNAUTHORIZED` | Missing or invalid Bearer token | Re-authenticate and retry |
| 403 | `FORBIDDEN` | Token does not belong to this merchant | Do not retry; investigate token |
| 409 | `CONFLICT` | Concurrent update conflict (if optimistic locking is in use) | Re-fetch current state and retry |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error | Retry with exponential backoff; show error toast |

**Error Response Example — Validation**
```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "client_error",
    "message": "minimum_order_amount must be greater than zero when is_minimum_order_enabled is true.",
    "details": [
      {
        "field": "minimum_order_amount",
        "issue": "out_of_range",
        "expected": "value > 0",
        "actual": "0"
      }
    ],
    "requestId": "req_def456",
    "timestamp": "2026-03-31T08:01:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

**Guard Rails**
- Always send the complete order settings payload. Partial PUT may clear unincluded fields.
- Validate `minimum_order_amount > 0` on the client before submitting when `is_minimum_order_enabled` is `true`.
- Do not retry on `400` — fix the payload before resubmitting.
- Idempotency: sending the same payload twice produces the same result. Safe to retry on network failure with a `500` response.

---

### 3. GetPublicStoreProfile

**Purpose and when to use**
Fetches the public store profile for a specific merchant store. Used by the Online Store (`p1-customer`) to read the minimum order amount configuration for cart and checkout enforcement. No authentication required. Called on cart page load and checkout page load.

**Method / Path**
```
GET /v1/store-business-profile/details/public
```

**Auth**
- Required: No
- Type: None (public endpoint)

**Parameters**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `store_slug` or `store_id` | Query / Path | String | Yes | Valid store identifier | Identifies the merchant's store whose profile to return. Follow existing parameter convention. |

**Request Body**
None. This is a GET request.

**Request Example**
```bash
curl -X GET "https://api.prosperna.com/v1/store-business-profile/details/public?store_slug=example-store" \
  -H "Content-Type: application/json"
```

**Success Response (200 OK)**
```json
{
  "data": {
    "store": {
      "id": "store_abc123",
      "name": "Example Store",
      "currency": "PHP",
      "isMinimumOrderEnabled": true,
      "minimumOrderAmount": 500.00,
      "... (other existing store fields) ...": "..."
    }
  }
}
```

> **Note on field naming:** The public store profile uses camelCase (`isMinimumOrderEnabled`, `minimumOrderAmount`) consistent with the existing public profile response shape. The backend order settings model uses snake_case (`is_minimum_order_enabled`, `minimum_order_amount`). The API layer is responsible for the mapping.

**Error Path Table**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or invalid store identifier | Correct the store slug/ID and retry |
| 404 | `NOT_FOUND` | No store found for the given identifier | Do not retry; log the issue |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error | Retry with exponential backoff |

**Error Response Example**
```json
{
  "error": {
    "httpStatus": 404,
    "code": "NOT_FOUND",
    "type": "client_error",
    "message": "No store found for the given identifier.",
    "details": [
      {
        "field": "store_slug",
        "issue": "not_found",
        "expected": "valid store slug",
        "actual": "nonexistent-store"
      }
    ],
    "requestId": "req_ghi012",
    "timestamp": "2026-03-31T08:02:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

**Guard Rails**
- Check both `isMinimumOrderEnabled` and `minimumOrderAmount` before enforcing — do not enforce if either is missing or `isMinimumOrderEnabled` is `false`.
- Treat `minimumOrderAmount = 0` as no minimum, regardless of `isMinimumOrderEnabled`.
- Use TanStack React Query's `staleTime` appropriately — this data can change when a merchant updates their settings. A stale time of 1–5 minutes is recommended for balance between freshness and performance.
- This endpoint is public — do not include merchant authentication tokens in requests from the customer-facing Online Store.

---

### 4. CreateOrderComputation (Optional Minimum Order Guard)

**Purpose and when to use**
Computes order totals and optionally enforces the minimum order amount as a server-side safety net. If the authenticated merchant has `is_minimum_order_enabled = true` and the cart subtotal is below `minimum_order_amount`, the endpoint rejects the computation request with `400 MINIMUM_ORDER_NOT_MET`. This prevents order creation even if the client-side enforcement was bypassed.

**Method / Path**
```
POST /v1/computations/
```

**Auth**
- Required: Per existing policy (customer session or store context)
- Type: Per existing policy

**Parameters**
Follow the existing `POST /v1/computations/` parameter contract. No new parameters are introduced. The minimum order check is a server-side validation added to existing order creation logic.

**Request Example**
```bash
curl -X POST "https://api.prosperna.com/v1/computations/" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "store_abc123",
    "cart_items": [
      { "product_id": "prod_1", "quantity": 1, "item_sub_total": 200.00 }
    ],
    "... (other existing computation fields) ...": "..."
  }'
```

**Success Response (200 OK)**
Standard existing computations response. No change.

**Error Path Table — New Entry**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `MINIMUM_ORDER_NOT_MET` | Cart subtotal (sum of `item_sub_total`) is below the merchant's configured `minimum_order_amount` | Do not retry with the same cart; redirect the customer to add more items |
| (other existing errors) | (existing codes) | (existing conditions) | (existing actions) |

**Error Response Example — Minimum Not Met**
```json
{
  "error": {
    "httpStatus": 400,
    "code": "MINIMUM_ORDER_NOT_MET",
    "type": "client_error",
    "message": "Your order does not meet the minimum order amount of ₱500.00. Please add more items.",
    "details": [
      {
        "field": "cart_subtotal",
        "issue": "below_minimum",
        "expected": "value >= 500.00",
        "actual": "200.00"
      }
    ],
    "requestId": "req_jkl345",
    "timestamp": "2026-03-31T08:03:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

**Guard Rails**
- The client-side enforcement (cart page + checkout page) is the primary defense. This server-side guard is a safety net, not the primary mechanism.
- The guard checks the pre-coupon `item_sub_total` sum — not the post-discount total.
- Do not retry on `MINIMUM_ORDER_NOT_MET` — the customer must add more items first.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | String | Conditional | Valid Merchant JWT | Required for authenticated merchant endpoints |
| `Content-Type` | Header | String | Yes (on PUT/POST) | `application/json` | Must be set on all write requests |
| `is_minimum_order_enabled` | Request body | Boolean | Yes (on PUT) | `true` or `false` | Enables or disables the minimum order amount feature |
| `minimum_order_amount` | Request body | Number | Conditional | > 0 when enabled; >= 0 otherwise | Minimum pre-coupon cart subtotal in ₱ required to check out |
| `isMinimumOrderEnabled` | Response body | Boolean | — | `true` or `false` | camelCase form returned by public store profile |
| `minimumOrderAmount` | Response body | Number | — | >= 0 | camelCase form returned by public store profile |
| `store_slug` / `store_id` | Query | String | Yes (GetPublicStoreProfile) | Valid store identifier | Identifies the store whose profile to return |

---

## Request/Response Contract Notes

- `minimum_order_amount` persists to 2 decimal places. Clients should send values like `500.00`, not `500` or `500.000`.
- The backend maps snake_case fields (internal model) to camelCase (public profile response). The Merchant Dashboard reads snake_case; the Online Store reads camelCase.
- When `is_minimum_order_enabled` is `false`, `minimum_order_amount` may still be present in the response with its last saved value — consumers must check the enabled flag before using the amount.

---

## Idempotency and Concurrency Notes

- `PUT /business-profile/order/update/settings` is idempotent for the same payload. Retrying with the same data produces the same result.
- If two Merchant Dashboard sessions save different amounts simultaneously, the last write wins. No optimistic concurrency control is required for the initial release.
- `GET /v1/store-business-profile/details/public` is safe to call multiple times. CDN caching applies.

---

## Security and Privacy Notes

- No PII is transmitted or stored by these endpoints in relation to this feature.
- `minimum_order_amount` is a merchant configuration value — it is not sensitive but should not be exposed to unauthorized parties in write contexts.
- The public store profile endpoint intentionally exposes the minimum order amount to the public (customers need it to understand why checkout is blocked). This is by design.
- All authenticated endpoints require HTTPS. HTTP requests must be rejected at the network level.
- Merchant JWT tokens must be short-lived and refreshed following existing Prosperna token policies.

---

## Domain Events and Webhooks

No new webhooks or domain events are introduced in the initial release. If future monitoring or integrations require it, the following events could be added:

| Event | Trigger |
|---|---|
| `merchant.order_settings.updated` | Any save to order settings (including minimum order fields) |
| `order.minimum_not_met` | Order computation rejected due to minimum order guard |

---

## SDK and Integration Examples

**Merchant Dashboard — Reading settings on mount (React + TanStack React Query)**

```typescript
import { useGetOrderSettings } from '@/api/StoreOrderSettings';

const { data } = useGetOrderSettings();
const isMinimumOrderEnabled = data?.order_settings?.is_minimum_order_enabled ?? false;
const minimumOrderAmount = data?.order_settings?.minimum_order_amount ?? 0;
```

**Merchant Dashboard — Saving settings (Formik + mutation)**

```typescript
const payload = {
  ...existingOrderSettings,
  is_minimum_order_enabled: values.isMinimumOrderEnabled,
  minimum_order_amount: values.minimumOrderAmount,
};
await updateOrderSettings(payload);
```

**Online Store — Enforcing minimum on cart page (React + publicStoreData)**

```typescript
const minimumOrderAmount = publicStoreData?.data?.store?.minimumOrderAmount ?? 0;
const isMinimumOrderEnabled = publicStoreData?.data?.store?.isMinimumOrderEnabled ?? false;
const cartSubtotal = _.sumBy(cartData?.available_items ?? [], (o) => o.item_sub_total);

const isBelowMinimum = isMinimumOrderEnabled && cartSubtotal < minimumOrderAmount;
const shortfall = isBelowMinimum ? minimumOrderAmount - cartSubtotal : 0;
```

---

## How to Use This API Safely

1. **Always fetch before write.** Call `GetOrderSettings` before submitting `UpdateOrderSettings` to ensure your payload reflects the current server state.
2. **Send the full payload on PUT.** Include all existing order settings fields alongside the new minimum order fields.
3. **Validate client-side first.** Check `minimum_order_amount > 0` and `is_minimum_order_enabled` is a valid boolean before submitting.
4. **Check both fields together.** Never enforce a minimum based on `minimumOrderAmount` alone — always check `isMinimumOrderEnabled` first.
5. **Use the pre-coupon subtotal.** Always sum `item_sub_total` across cart items. Do not use post-discount or post-shipping totals for the minimum check.
6. **Respect stale times.** The public store profile is cacheable but should not be served indefinitely stale. Configure `staleTime` in TanStack React Query appropriately.
7. **Handle errors gracefully.** On `MINIMUM_ORDER_NOT_MET` (400), do not retry — redirect the customer to add more items to their cart.

---

## Change Impact

| Component | Change Type | Impact |
|---|---|---|
| `GET /business-profile/order/settings` | Additive (two new response fields) | Existing consumers unaffected; Merchant Dashboard reads two new fields |
| `PUT /business-profile/order/update/settings` | Additive (two new accepted fields) | Existing consumers unaffected if they do not send the new fields (fields default to `false`/`0`) |
| `GET /v1/store-business-profile/details/public` | Additive (two new response fields) | Existing consumers unaffected; Online Store reads two new fields |
| `POST /v1/computations/` (optional) | New validation logic | Existing consumers may receive a new `400 MINIMUM_ORDER_NOT_MET` error; consumers should handle this gracefully |

---

## Open Questions

| ID | Question | Assumption |
|---|---|---|
| OQ-1 | Does `PUT /business-profile/order/update/settings` support partial updates or require the full payload? | Assumed full payload required. Confirm with backend team before implementation. |
| OQ-2 | Should the optional computations guard be in scope for the initial release? | Assumed optional / follow-up. Backend team to confirm. |
| OQ-3 | What is the exact store identifier parameter name on `GET /v1/store-business-profile/details/public` — query param or path segment? | Assumed query parameter `store_slug` consistent with existing usage. Confirm with backend team. |
| OQ-4 | Is there a CDN or API gateway cache on the public store profile endpoint that must be invalidated when the merchant updates their settings? | Assumed existing caching policy applies. If cache TTL is > 5 minutes, consider a cache invalidation hook on the PUT endpoint. |
