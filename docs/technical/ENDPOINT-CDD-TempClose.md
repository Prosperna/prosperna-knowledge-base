---
id: cdd-temporarily-close-integration
title: Endpoint Document. CDD × Temporarily Close Integration
sidebar_label: CDD × Temporarily Close Integration
sidebar_position: 2
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-26
- Status: Draft

---

## Linked Documents
- BRD: [BRD-CDD-TempClose.md](https://pkb.prosperna.ph/docs/business/cdd-temporarily-close-integration)
- PRD: [PRD-CDD-TempClose.md](https://pkb.prosperna.ph/docs/product/merchant/settings/store-settings/cdd-temporarily-close-integration)

---

## Public API Overview

This document covers the **two existing API endpoints** that are consumed by the CDD × Temporarily Close Integration. No new endpoints are introduced by this change. The feature fix is achieved entirely by routing already-fetched data through the component tree on the frontend.

The two endpoints covered here are:

1. **GET** `GET /v1/store-temporary-close/details` — Fetch the Temporarily Close schedule for a store location. Already called by `Main.tsx`; the response is now also forwarded to `<CustomDeliveryDatePicker>` as a prop.
2. **POST** `/v1/orders/cart/{cart_id}/custom-delivery-date` — Save the customer's selected delivery date to the cart. Called unchanged after the customer selects a valid (non-closure-overlapping) date and time slot.

Both endpoints are owned by the `p1-customer` service layer. Contract changes in this document reflect correctness guarantees introduced by the frontend fix — the endpoints themselves are unchanged.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Frontend engineers (`p1-customer`) | Understand the data contract for `temporaryCloseDetails` so it can be safely threaded as a prop and used in closure-filtering logic |
| QA engineers | Understand request/response shape to write mocks and test fixtures for closure-aware date picker scenarios |
| Backend engineers (`business-profile-api`) | Reference document for the existing temporary close details API; no backend changes required |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `http://localhost:{port}` | Local development and unit testing | Port varies by service configuration |
| Staging | `https://api-staging.prosperna.com` | QA and integration testing | Mirrors production data model |
| Production | `https://api.prosperna.com` | Live customer traffic | Standard production SLA applies |

---

## API Versioning and Compatibility

- All endpoints are versioned under `/v1/`.
- No version changes are introduced by this feature.
- Both endpoints follow Prosperna's existing versioning policy: breaking changes require a new `/v2/` path; backward-compatible additions are released in-place.

---

## Protocol and Data Format Standards

- **Transport:** HTTPS only. HTTP is rejected in staging and production.
- **Data format:** JSON. All request bodies must set `Content-Type: application/json`. All responses are returned as `application/json`.
- **Datetime format:** ISO 8601 with timezone (`YYYY-MM-DDTHH:mm:ss.sssZ`). The `closeFrom` and `closeTo` fields in the temporary close details response are full ISO datetime strings.
- **Encoding:** UTF-8.
- **Null vs. absent:** Absent fields and `null` fields are treated equivalently by consuming code. Consumers must guard against both.

---

## Authentication and Authorization

| Endpoint | Auth Mechanism | Required |
|---|---|---|
| GET `/v1/store-temporary-close/details` | Session cookie or bearer token identifying the browsing customer or an anonymous store visitor | Required — scoped to the requesting store context |
| POST `/v1/orders/cart/{cart_id}/custom-delivery-date` | Session cookie or bearer token identifying the authenticated customer | Required — `customer_id` in query param must match the authenticated session |

- All endpoints reject unauthenticated requests with `401 Unauthorized`.
- All endpoints reject requests where the `storeId` or `store_location_id` does not belong to the requesting context with `403 Forbidden`.

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| Authenticated Customer | Read temporary close details; Submit cart delivery date | Can only read details for the store they are browsing; Can only submit to their own cart |
| Anonymous Store Visitor | Read temporary close details (public store data) | Cannot submit delivery date (requires authentication) |
| Merchant | Not a consumer of these endpoints on the customer-facing store | Merchant reads/writes via separate `business-profile-api` endpoints |

---

## Ownership and Data Access Rules

- `GET /v1/store-temporary-close/details` returns data scoped to `storeId` + `store_location_id`. A consumer cannot retrieve closure data for a store location they are not currently browsing.
- `POST /v1/orders/cart/{cart_id}/custom-delivery-date` operates on a cart that is scoped to a `customer_id` + `store_id`. A consumer cannot write a delivery date to another customer's cart.

---

## Request Conventions

- Query parameters must be URL-encoded.
- `storeId` and `store_location_id` are MongoDB ObjectId strings (24-character hex).
- `cart_id` is a MongoDB ObjectId string.
- `customer_id` is a MongoDB ObjectId string.
- No request body is required for GET requests.
- POST request body must be valid JSON with `Content-Type: application/json`.

---

## Response Conventions

- Success responses return HTTP `200 OK` (GET) or `200 OK` / `201 Created` (POST).
- Error responses follow the Global Error Model defined below.
- Response bodies are always JSON objects, never raw arrays at the top level.
- Timestamps in responses are ISO 8601 strings in UTC.

---

## Global Guard Rails (Consumer Safety)

- **Always guard `temporaryCloseDetails?.dates?.length` before iterating closure ranges.** The `dates` field is optional in the response and may be absent or empty.
- **Never block the date picker on a failed closure fetch.** Fail-open: if `temporaryCloseDetails` is null or the request errors, skip all closure filtering.
- **Do not cache `temporaryCloseDetails` across sessions.** Merchants can update closure schedules at any time; always use the freshly fetched value from the current cart page load.
- **Do not call `GET /v1/store-temporary-close/details` if `isTemporaryCloseEnabled` is `false`.** The `Main.tsx` hook is already gated on this flag; consumers must not bypass this gate.

---

## Rate Limits and Abuse Controls

| Endpoint | Rate Limit | Burst Allowance | Notes |
|---|---|---|---|
| GET `/v1/store-temporary-close/details` | Standard read tier (as defined by platform-wide policy) | Standard | Called once per cart page load; not a high-frequency endpoint |
| POST `/v1/orders/cart/{cart_id}/custom-delivery-date` | Standard write tier | Standard | Called once per checkout attempt; idempotent by design (overwrite semantics) |

> Specific rate limit numbers (requests per minute/hour) are governed by the platform-wide API gateway policy and are outside the scope of this document.

---

## Global Error Model

All error responses use this structure:

```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "validation",
    "message": "Human-readable description of the error.",
    "details": [
      {
        "field": "store_location_id",
        "issue": "missing",
        "expected": "24-character hex ObjectId string",
        "actual": "undefined"
      }
    ],
    "requestId": "req_01HXZ4KQPQW8ZY3NB9T7D2M5GF",
    "timestamp": "2026-03-26T08:00:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | FR Mapping |
|---|---|---|---|---|---|
| `GET_TEMP_CLOSE_DETAILS` | GET | `/v1/store-temporary-close/details` | Store visitor (authenticated or anonymous) | Fetch the Temporarily Close schedule for a store location | FR-1, FR-6, FR-8, FR-10 |
| `POST_CART_DELIVERY_DATE` | POST | `/v1/orders/cart/{cart_id}/custom-delivery-date` | Authenticated customer | Save the customer's selected delivery date to their cart | FR-7 (only valid, non-closure-overlapping dates reach this call) |

---

## Endpoint Reference

---

### 1. GET_TEMP_CLOSE_DETAILS — Fetch Temporary Close Schedule

#### Purpose and When to Use

Fetch the complete Temporarily Close schedule for a specific store location, including all `closeFrom`/`closeTo` date-time pairs and the customer-facing banner description. Called by `Main.tsx` on every cart page load when `isTemporaryCloseEnabled` is `true`. The response is forwarded as the `temporaryCloseDetails` prop to `<CustomDeliveryDatePicker>` as part of this feature fix.

#### Method and Path

```
GET /v1/store-temporary-close/details
```

#### Required Auth and Scope

Session cookie or bearer token for the browsing context. Requests without valid auth return `401`. Requests for a store the caller is not authorized to view return `403`.

#### Parameters

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `storeId` | query | string | Yes | 24-char hex ObjectId | The merchant's store ID |
| `store_location_id` | query | string | Yes | 24-char hex ObjectId | The specific store location ID |

#### Request Body

None.

#### Full Request Example

```bash
curl -X GET \
  "https://api.prosperna.com/v1/store-temporary-close/details?storeId=64a1f3c2b4e5d9001e2f3456&store_location_id=64a1f3c2b4e5d9001e2f3457" \
  -H "Authorization: Bearer <customer_session_token>" \
  -H "Accept: application/json"
```

#### Success Response Example

```json
{
  "storeId": "64a1f3c2b4e5d9001e2f3456",
  "storeLocationId": "64a1f3c2b4e5d9001e2f3457",
  "bannerStripDescription": "We are closed for the holiday. Thank you for your patience!",
  "dates": [
    {
      "_id": "64b2e4d3c5f6e0002f3g4568",
      "closeFrom": "2026-04-03T12:00:00.000Z",
      "closeTo": "2026-04-03T17:00:00.000Z"
    },
    {
      "_id": "64b2e4d3c5f6e0002f3g4569",
      "closeFrom": "2026-04-05T07:00:00.000Z",
      "closeTo": "2026-04-05T23:59:00.000Z"
    }
  ],
  "createdAt": "2026-03-01T08:00:00.000Z",
  "updatedAt": "2026-03-20T10:30:00.000Z",
  "id": "64a9c1b2d3e4f5006a7b8901"
}
```

#### Notes on Response Fields

| Field | Type | Notes |
|---|---|---|
| `storeId` | string | Matches request `storeId` |
| `storeLocationId` | string | Matches request `store_location_id` |
| `bannerStripDescription` | string | Customer-facing banner text; max 200 chars |
| `dates` | array (optional) | May be absent or empty if no closure ranges are configured; guard with `?.dates?.length` |
| `dates[].closeFrom` | string (ISO datetime) | Full datetime — closures can be partial-day |
| `dates[].closeTo` | string (ISO datetime) | Full datetime — must be strictly after `closeFrom` |
| `dates[]._id` | string | MongoDB ObjectId of the closure range entry |

#### Error Path Table

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or malformed `storeId` or `store_location_id` | Verify query parameter format and retry |
| 401 | `UNAUTHORIZED` | Request lacks valid auth token | Re-authenticate and retry |
| 403 | `FORBIDDEN` | Store or location does not belong to caller's context | Do not retry; surface as unexpected error in monitoring |
| 404 | `NOT_FOUND` | No Temporarily Close record exists for this location | Treat as no closure configured; proceed with fail-open behavior |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Fail-open: proceed as if no closure data exists; log for investigation |

#### Error Response Example

```json
{
  "error": {
    "httpStatus": 404,
    "code": "NOT_FOUND",
    "type": "resource",
    "message": "No Temporarily Close record found for this store location.",
    "details": [],
    "requestId": "req_01HXZ5RQWXY9AB2NC0T8E3N6HP",
    "timestamp": "2026-03-26T09:15:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

#### Guard Rails and Safe Usage Notes

- **Fail-open on any error:** A 404, 500, or network timeout must not block the date picker. Treat all error responses the same as `null` — skip closure filtering and show all dates/slots.
- **Do not call if `isTemporaryCloseEnabled` is `false`:** This endpoint is gated on the feature flag in `Main.tsx`; bypass is incorrect and wastes a request.
- **Do not retry on 4xx errors (except transient network issues):** A 400 or 401 requires a code or auth fix, not a retry.
- **Idempotency:** GET requests are safe and idempotent; retry on transient 5xx or timeout with standard exponential backoff (max 2 retries, 1s/2s delays).
- **No pagination:** The `dates[]` array is returned in full; it is not paginated. Typical size is < 30 entries.

---

### 2. POST_CART_DELIVERY_DATE — Save Selected Delivery Date

#### Purpose and When to Use

Save the customer's chosen delivery date (and, for `per_day` mode, the time slot encoded in the datetime) to their cart. Called by `<CustomDeliveryDatePicker>` after the customer confirms a valid date and time slot. As of this feature fix, only dates and slots that passed the closure filter can reach this call — no closure-blocked slots will ever be submitted.

#### Method and Path

```
POST /v1/orders/cart/{cart_id}/custom-delivery-date
```

#### Required Auth and Scope

Bearer token for the authenticated customer. The `customer_id` in the query param must match the authenticated session. Unauthenticated requests return `401`.

#### Parameters

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `cart_id` | path | string | Yes | 24-char hex ObjectId | The cart to update |
| `customer_id` | query | string | Yes | 24-char hex ObjectId | The authenticated customer's ID |
| `store_id` | query | string | Yes | 24-char hex ObjectId | The store the cart belongs to |

#### Request Body Schema Notes

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `setup_id` | string | Yes | 24-char hex ObjectId | The CDD setup ID matching the cart's product tag |
| `selected_delivery_date` | string | Yes | ISO 8601 datetime | The selected delivery date (and time for `per_day` mode) |

#### Full Request Example

```bash
curl -X POST \
  "https://api.prosperna.com/v1/orders/cart/64c3f5e6d7a8b9003c4d5678/custom-delivery-date?customer_id=64a1f3c2b4e5d9001e2f3456&store_id=64a1f3c2b4e5d9001e2f3400" \
  -H "Authorization: Bearer <customer_session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "setup_id": "64b2e4d3c5f6e0002f3g4560",
    "selected_delivery_date": "2026-04-03T08:00:00.000Z"
  }'
```

#### Success Response Example

```json
{
  "cartId": "64c3f5e6d7a8b9003c4d5678",
  "customerId": "64a1f3c2b4e5d9001e2f3456",
  "selectedDeliveryDate": "2026-04-03T08:00:00.000Z",
  "setupId": "64b2e4d3c5f6e0002f3g4560",
  "updatedAt": "2026-03-26T09:00:00.000Z"
}
```

#### Error Path Table

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or malformed body fields | Inspect `details[]` in error response for field-level issues |
| 401 | `UNAUTHORIZED` | Missing or expired auth token | Re-authenticate and retry |
| 403 | `FORBIDDEN` | `customer_id` does not match session or cart does not belong to customer | Do not retry; surface as auth error |
| 404 | `NOT_FOUND` | `cart_id` or `setup_id` not found | Verify IDs; do not retry blindly |
| 409 | `CONFLICT` | A delivery date is already set and conflicts with the update | Re-fetch cart state and retry with correct values |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry once with exponential backoff; surface error if persistent |

#### Error Response Example

```json
{
  "error": {
    "httpStatus": 400,
    "code": "VALIDATION_ERROR",
    "type": "validation",
    "message": "selected_delivery_date must be a valid ISO 8601 datetime string.",
    "details": [
      {
        "field": "selected_delivery_date",
        "issue": "invalid_format",
        "expected": "ISO 8601 datetime string",
        "actual": "2026-04-03"
      }
    ],
    "requestId": "req_01HXZ6SQZYZ0BC3ND1U9F4O7IQ",
    "timestamp": "2026-03-26T09:20:00.000Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors"
  }
}
```

#### Guard Rails and Safe Usage Notes

- **Only submit after closure filtering:** This endpoint must only be called after the customer has selected a date/slot that survived all closure filters. The frontend is the primary enforcement layer for this guarantee.
- **Idempotency:** Submitting the same `selected_delivery_date` for the same `cart_id` is safe — the backend overwrites the existing value. No deduplication token is required.
- **Timeout:** Apply a 10-second client timeout. On timeout, allow the customer to retry via the normal checkout flow.
- **Do not retry on 4xx errors:** These indicate client-side issues (bad params, auth problems) that a retry will not resolve.
- **Retry on 500:** One retry with a 1-second delay is acceptable. If the second attempt also fails, surface an error to the customer.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `storeId` | query | string | Yes | 24-char hex ObjectId | Merchant store ID — used to scope the closure details fetch |
| `store_location_id` | query | string | Yes | 24-char hex ObjectId | Store location ID — closures are per-location |
| `cart_id` | path | string | Yes | 24-char hex ObjectId | Cart to save the delivery date on |
| `customer_id` | query | string | Yes | 24-char hex ObjectId | Authenticated customer ID — must match session |
| `store_id` | query | string | Yes | 24-char hex ObjectId | Store context for the cart delivery date POST |
| `setup_id` | body | string | Yes | 24-char hex ObjectId | CDD setup ID matching the cart's product tag |
| `selected_delivery_date` | body | string | Yes | ISO 8601 datetime | Customer-selected delivery datetime |

---

## Request/Response Contract Notes

- The `temporaryCloseDetails` response (`dates[].closeFrom`, `dates[].closeTo`) uses full ISO datetime strings — partial-day closures are first-class data. Consumers must not assume closures are full-day blocks.
- The `selected_delivery_date` in the POST body encodes both date and time slot selection. For `date_range` mode (no time picker), the time component is zeroed or set to midnight.
- `dates` in the GET response is optional. Consumers must guard: `temporaryCloseDetails?.dates?.length` before iterating.
- No pagination cursor or `limit`/`offset` parameters exist on either endpoint.

---

## Idempotency and Concurrency Notes

- `GET /v1/store-temporary-close/details`: Safe and idempotent. Multiple parallel calls return the same result. No concurrency concern.
- `POST /v1/orders/cart/{cart_id}/custom-delivery-date`: Write-once semantics with overwrite behavior. If a race condition causes two submissions for the same cart, the last write wins. No idempotency key is needed; the cart model holds a single `selectedDeliveryDate` value.

---

## Security and Privacy Notes

- No PII is introduced or modified by either endpoint.
- `temporaryCloseDetails` contains only merchant-configured schedule data (datetime ranges and a banner description). No customer data is present.
- `selected_delivery_date` is a datetime string tied to an order; it is covered by the platform's standard order data retention policy.
- All requests must use HTTPS. Plaintext requests are rejected at the gateway.

---

## Domain Events and Webhooks

No domain events or webhooks are emitted by these endpoints in the context of this feature fix. The delivery date save (`POST_CART_DELIVERY_DATE`) may trigger downstream order-processing events per the existing order lifecycle, but these are outside the scope of this document.

---

## SDK and Integration Examples

### Using `StoreAPI.useGetStoreTemporaryCloseDetails()` in `Main.tsx`

```typescript
const isTemporaryCloseEnabled = currentStoreLocation?.isTemporaryCloseEnabled ?? false;

const { data: temporaryCloseDetails } = StoreAPI.useGetStoreTemporaryCloseDetails({
  storeId: storeID,
  store_location_id,
  enabled: isTemporaryCloseEnabled,  // Gate: only fetch when feature is on
});

// Thread to CustomDeliveryDatePicker — no new fetching needed
<CustomDeliveryDatePicker
  {...existingProps}
  temporaryCloseDetails={temporaryCloseDetails ?? null}
  isTemporaryCloseEnabled={isTemporaryCloseEnabled}
/>
```

### Using `timeslotOverlapsClosure()` in `CustomDeliveryDatePicker.tsx`

```typescript
import moment from 'moment';

function timeslotOverlapsClosure(
  slotStart: string,   // "HH:mm" — 24-hour format
  slotEnd: string,     // "HH:mm" — 24-hour format
  closeFrom: string,   // ISO datetime string
  closeTo: string,     // ISO datetime string
  date: Date,          // calendar date being evaluated
): boolean {
  const dateStr = moment(date).format('YYYY-MM-DD');
  const slotStartDt = moment(`${dateStr} ${slotStart}`, 'YYYY-MM-DD HH:mm');
  const slotEndDt   = moment(`${dateStr} ${slotEnd}`,   'YYYY-MM-DD HH:mm');
  const closureFrom = moment(closeFrom);
  const closureTo   = moment(closeTo);

  // Half-open interval: slot overlaps closure if start < closureTo AND end > closureFrom
  // Strict comparison — slot ending exactly when closure starts is NOT an overlap
  return slotStartDt.isBefore(closureTo) && slotEndDt.isAfter(closureFrom);
}
```

---

## How to Use This API Safely

1. **Always check `isTemporaryCloseEnabled` before using closure data.** If `false`, skip all closure filtering.
2. **Guard `temporaryCloseDetails?.dates?.length` before iterating.** The field is optional and may be absent.
3. **Fail-open on any fetch error.** A failed `GET /v1/store-temporary-close/details` must not block the date picker.
4. **Apply closure filtering before showing the time picker.** Filter slots in `handleChange()` after the existing same-day cutoff filter and before calling `setTimeList()`.
5. **Apply calendar-level blocking before slot-level filtering.** `isWeekday()` runs first; only dates with at least one valid slot are selectable. `handleChange()` runs second; only valid slots are shown. These two layers are complementary, not redundant.
6. **Use strict `isBefore`/`isAfter` for the overlap formula.** Do not use `isSameOrBefore`/`isSameOrAfter` in `timeslotOverlapsClosure()` — doing so would incorrectly block slots at exact boundaries.

---

## Change Impact

| Area | Impact | Notes |
|---|---|---|
| `Main.tsx` | Low | Two additional props passed to `<CustomDeliveryDatePicker>`; no new fetching |
| `ICustomDeliveryDatePicker` interface | Low | Two optional props added; no existing call sites broken |
| `CustomDeliveryDatePicker.tsx` — `isWeekday()` | Medium | New closure-checking branches for both `per_day` and `date_range` modes |
| `CustomDeliveryDatePicker.tsx` — `handleChange()` | Medium | New slot filter block after existing filters |
| `CustomDeliveryDatePicker.tsx` — `renderDayContents` | Low | New prop; tooltip only; no functional state change |
| `storeClosureUtils.ts` | Low | New exported utility function `timeslotOverlapsClosure()` |
| Backend / API contracts | None | No backend changes; no contract modifications |

---

## Open Questions

None. All questions resolved during the BA interview session on 2026-03-26.
