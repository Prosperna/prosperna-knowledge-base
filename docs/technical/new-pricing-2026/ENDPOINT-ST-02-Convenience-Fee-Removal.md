---
id: st-02-convenience-fee-removal
title: Endpoint Document. ST-02 Convenience Fee Removal
sidebar_label: ST-02 Convenience Fee Removal
sidebar_position: 2
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft

---

## Linked Documents
- BRD: BRD-ST-02-Convenience-Fee-Removal.md
- PRD: PRD-ST-02-Convenience-Fee-Removal.md

---

## Public API Overview

This document covers the API contract changes resulting from the ST-02 Convenience Fee Removal. Two endpoint contracts are affected:

1. **`PUT /store/update/convenience-fee`** (`business-profile-api`) — **Deprecated.** This endpoint previously allowed merchants to update their convenience fee split ratio (seller/buyer percentage). It is now disabled and returns `410 Gone`. No data is written. This is the only publicly accessible API change in ST-02.

2. **Stripe Checkout Session Creation** (`payment-integration-api`) — **Internal integration change.** The `application_fee_amount` parameter is removed from the Stripe `checkout.sessions.create()` call. This is an internal service-to-Stripe API change, not a public API endpoint. It is documented here for completeness and consumer awareness.

All other changes in ST-02 (computation function neutralization, disbursement formula update, UI removals) are implementation-level and do not affect the public API surface.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Merchant Dashboard frontend (`prosperna1`) | Previously called `PUT /store/update/convenience-fee` when the merchant adjusted the Convenience Fee Splitter. This endpoint is now disabled. The Splitter UI has been removed — this call should no longer be made. |
| Any legacy integration or script | Any integration that calls `PUT /store/update/convenience-fee` will receive `410 Gone`. Must be updated to remove the call. |
| Payment integration engineers | Must remove `application_fee_amount` from Stripe checkout session creation logic in `payment-integration-api`. |
| QA and test automation | Must update test suites to assert `410 Gone` on `PUT /store/update/convenience-fee` and assert no `application_fee_amount` in Stripe session creation. |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Development | `http://localhost:{port}` | Local development | Port varies per service |
| Staging | `https://api-staging.prosperna.com` | Pre-production testing | Use for Stripe `application_fee_amount` removal validation |
| Production | `https://api.prosperna.com` | Live environment | All changes deployed atomically |

---

## API Versioning and Compatibility

- All Prosperna REST endpoints use URL path versioning: `/v1/`.
- The `PUT /store/update/convenience-fee` endpoint predates strict versioning and is hosted under `/v1/` in `business-profile-api`.
- Returning `410 Gone` is the chosen deprecation signal — it is permanent and indicates the resource/operation no longer exists (unlike `404 Not Found`, which implies a missing resource, or `501 Not Implemented`, which implies future intent).
- No new API version is created for this change. The deprecated endpoint simply returns 410 until it is fully removed in a future cleanup release.

---

## Protocol and Data Format Standards

- **Transport:** HTTPS (REST)
- **Data format:** JSON (`Content-Type: application/json`)
- **Authentication:** Bearer token (JWT) in `Authorization` header
- **HTTP methods:** The deprecated endpoint is `PUT`. The 410 response is returned regardless of method for the same path.
- **Character encoding:** UTF-8
- **Date/time format:** ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)

---

## Authentication and Authorization

| Endpoint | Auth Required | Auth Type | Notes |
|---|---|---|---|
| `PUT /store/update/convenience-fee` | No (returns 410 before auth check) | N/A | The endpoint returns 410 for all callers, authenticated or not, since the operation is gone entirely. |
| Stripe checkout session creation | Internal service | Stripe secret key | Service-to-Stripe API. Merchants do not call this directly. |

> **Note:** The 410 response takes precedence over authentication. This prevents the endpoint from returning 401/403 (which would imply the operation exists but access is denied), instead clearly signaling the operation is permanently gone.

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| Merchant (authenticated) | None — `PUT /store/update/convenience-fee` is disabled | Returns 410 for all callers |
| Prosperna Admin | None | Same as above |
| Unauthenticated | None | Same as above |
| Internal services (payment-integration-api) | Stripe checkout session creation without platform fee | No `application_fee_amount` may be included |

---

## Ownership and Data Access Rules

- No data is written by the deprecated `PUT /store/update/convenience-fee` endpoint (it returns 410 before any processing).
- The `convenienceFeeSeller` and `convenienceFeeBuyer` fields on the Store model are retained in the schema but are now read-only in the sense that no API endpoint writes to them going forward.
- Historical Store documents may still have non-zero values for these fields; they are ignored by all new business logic.

---

## Request Conventions

- Standard JSON request body with `Content-Type: application/json`.
- `Authorization: Bearer {token}` header for authenticated endpoints.
- For the deprecated `PUT /store/update/convenience-fee`, any valid or invalid request body will result in `410 Gone` — the body is not processed.

---

## Response Conventions

- All responses use JSON.
- HTTP status codes follow standard semantics.
- `410 Gone` is used for the deprecated endpoint.
- Error responses use the Global Error Model (see below).

---

## Global Guard Rails (Consumer Safety)

- **Do not call `PUT /store/update/convenience-fee`.** The endpoint permanently returns `410 Gone`. Remove all calls from client code.
- **Do not include `application_fee_amount` in Stripe checkout sessions.** Internal services must not re-introduce this parameter.
- **Do not attempt to set `convenienceFeeSeller` or `convenienceFeeBuyer` via any API.** These fields have no update endpoint. Any direct database writes would be non-standard and are prohibited.
- **Treat `410 Gone` as a permanent signal**, not a transient error. Do not retry a `410` response.

---

## Rate Limits and Abuse Controls

| Endpoint | Rate Limit | Notes |
|---|---|---|
| `PUT /store/update/convenience-fee` | Inherits service-level limits | Returns 410 before rate limit logic applies — effectively zero throughput on this operation |
| Stripe session creation | Per Stripe API limits | No change from existing rate limit behavior |

---

## Global Error Model

```json
{
  "error": {
    "httpStatus": 410,
    "code": "CONVENIENCE_FEE_REMOVED",
    "type": "GONE",
    "message": "Convenience fees have been removed from the platform.",
    "details": [],
    "requestId": "req_abc123",
    "timestamp": "2026-03-17T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/deprecations/convenience-fee"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `store.updateConvenienceFee` | PUT | `/v1/store/update/convenience-fee` | (deprecated — 410 regardless) | **DEPRECATED.** Previously updated merchant's convenience fee split ratio. Now permanently returns 410 Gone. | service-default | FR-12 |
| `stripe.createCheckoutSession` | POST (internal) | Stripe API | Stripe secret key (internal) | Creates Stripe checkout session. `application_fee_amount` removed. Not a public endpoint. | Stripe API limits | FR-14 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. `store.updateConvenienceFee` — DEPRECATED

#### Name and Operation ID
- **Name:** Update Store Convenience Fee Split (DEPRECATED)
- **Operation ID:** `store.updateConvenienceFee`

#### Purpose and When to Use
**Do not use.** This endpoint has been permanently disabled as part of Prosperna Pricing Restructuring ST-02. Convenience fees no longer exist on the platform. Any call to this endpoint will receive `410 Gone`.

This endpoint previously allowed merchants to configure the buyer/seller split ratio for the Prosperna convenience fee. As all convenience fees have been removed, this configuration no longer has any purpose.

#### Method and Path
```
PUT /v1/store/update/convenience-fee
```

#### Required Auth and Scope
None — the endpoint returns 410 before any authentication or authorization check.

#### Parameters

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `Authorization` | Header | string | No | N/A | Ignored — 410 returned before auth check |
| (any body) | Body | any | No | N/A | Ignored — not processed |

#### Request Body Schema Notes
Not applicable. The request body is not read or validated. Any payload will result in `410 Gone`.

#### Full Request Example

```bash
# This call will return 410 Gone
curl -X PUT https://api.prosperna.com/v1/store/update/convenience-fee \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"convenienceFeeSeller": 50, "convenienceFeeBuyer": 50}'
```

#### Success Response Example
**None.** This endpoint never returns a success response.

#### Error Path Table

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| `410 Gone` | `CONVENIENCE_FEE_REMOVED` | All requests to this endpoint | Remove this API call from client code. Convenience fees no longer exist. |

#### Error Response Example

```json
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "error": {
    "httpStatus": 410,
    "code": "CONVENIENCE_FEE_REMOVED",
    "type": "GONE",
    "message": "Convenience fees have been removed from the platform.",
    "details": [],
    "requestId": "req_abc123",
    "timestamp": "2026-03-17T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/deprecations/convenience-fee"
  }
}
```

#### Guard Rails and Safe Usage Notes
- **Do not retry `410 Gone`.** It is a permanent response — retrying will not produce a different result.
- **Remove this call from all client code.** The Convenience Fee Splitter UI has been removed from the Merchant Dashboard; there should be no user-initiated trigger for this call.
- **Do not set a timeout or backoff for this call.** It returns immediately.

---

### 2. Stripe Checkout Session Creation — Internal Change Note

#### Name and Operation ID
- **Name:** Create Stripe Checkout Session (Internal)
- **Operation ID:** `stripe.createCheckoutSession` (internal)

#### Purpose and When to Use
Internal service operation executed by `payment-integration-api` when a US merchant's customer initiates checkout. This is not a public endpoint — it is documented here because ST-02 removes the `application_fee_amount` parameter from this call.

#### Change Description
**Before ST-02:**
```javascript
const session = await stripe.checkout.sessions.create({
  // ...other params...
  application_fee_amount: Math.round(orderTotal * 0.01), // 1% Prosperna platform fee
  // ...
});
```

**After ST-02:**
```javascript
const session = await stripe.checkout.sessions.create({
  // ...other params...
  // application_fee_amount: REMOVED — no Prosperna platform fee on transactions
});
```

The parameter is **omitted entirely** (not set to 0), to make the intent explicit and avoid any ambiguity in Stripe's handling.

#### Impact
- Prosperna receives $0 platform fee from US Stripe transactions post-migration.
- The full payment amount (minus Stripe's own processing fee) routes to the merchant's connected Stripe account.
- No Stripe API error is expected — `application_fee_amount` is an optional parameter.

#### File Reference
- `payment-integration-api/src/collections/stripe/stripe.service.ts`

#### Guard Rails
- Must be validated in Stripe staging environment before production release.
- Internal service logs should confirm `application_fee_amount` is absent from all session creation calls post-deployment.
- If Stripe returns any `invalid_request_error` related to this change, escalate immediately — do not silently swallow.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `convenienceFeeSeller` | Body (deprecated endpoint) | integer | No | 0–100 | Previously: seller's % of the convenience fee split. Now ignored. |
| `convenienceFeeBuyer` | Body (deprecated endpoint) | integer | No | 0–100 | Previously: buyer's % of the convenience fee split. Now ignored. |
| `application_fee_amount` | Stripe session body (internal) | integer | Removed | N/A | Previously: 1% of order total in cents. Now removed entirely from the Stripe call. |

---

## Request/Response Contract Notes

- The deprecated `PUT /store/update/convenience-fee` endpoint has no valid request/response contract. All calls receive `410 Gone`.
- The Stripe checkout session creation contract is otherwise unchanged — only the `application_fee_amount` parameter is removed. All other session parameters (line items, customer, success/cancel URLs, payment methods) remain the same.
- The Store model's `convenienceFeeSeller` and `convenienceFeeBuyer` fields are no longer part of any active write contract. Read contracts (GET store configuration) may still return these fields with value `0`.

---

## Idempotency and Concurrency Notes

- The deprecated endpoint is not idempotent in any meaningful sense — it returns 410 for every call.
- No idempotency key is required or accepted.
- Stripe session creation retains its existing idempotency behavior via the `Idempotency-Key` header. The removal of `application_fee_amount` does not affect this.

---

## Security and Privacy Notes

- No PII is exposed or affected by these endpoint changes.
- The 410 response on the deprecated endpoint does not leak any sensitive information (no session data, store config, or internal identifiers are included in the response body).
- The Stripe secret key used by `payment-integration-api` is unchanged. The `application_fee_amount` removal does not affect key rotation or security posture.
- Historical store documents with `convenienceFeeSeller`/`convenienceFeeBuyer` values are retained but are not surfaced through any updated API write path.

---

## Domain Events and Webhooks

| Event | Trigger | Consumers | Notes |
|---|---|---|---|
| `store.convenience_fee_config.deprecated` | One-time internal event at migration | Internal monitoring | Not a customer-facing webhook |
| `order.created` | Every new order post-migration | Existing order event consumers | `convenience_fee = 0` will be included in the event payload. No schema change — field was always present. |

> No new webhooks are introduced by ST-02.

---

## SDK and Integration Examples

### Detecting the Deprecated Endpoint (Client-Side Migration)

If your integration checks for this endpoint, handle `410 Gone` as a permanent signal to remove the call:

```javascript
try {
  const response = await api.put('/v1/store/update/convenience-fee', payload);
} catch (err) {
  if (err.status === 410) {
    // Convenience fee API has been permanently removed.
    // Remove this call from your integration.
    console.warn('Convenience fee endpoint is deprecated. Remove this API call.');
  }
}
```

### Verifying Stripe Session Has No Platform Fee (Integration Test)

```javascript
// In test: assert application_fee_amount is absent from Stripe session creation
const stripeCreateSpy = jest.spyOn(stripe.checkout.sessions, 'create');

await createCheckoutSessionForUSMerchant(order);

const callArgs = stripeCreateSpy.mock.calls[0][0];
expect(callArgs.application_fee_amount).toBeUndefined();
```

---

## How to Use This API Safely

1. **Remove all calls to `PUT /store/update/convenience-fee`** from your client code immediately. This endpoint is permanently gone.
2. **Do not expect any convenience fee data in new order payloads.** The `convenience_fee`, `convenience_fee_customer`, and `convenience_fee_merchant` fields will always be `0` for orders created after the migration.
3. **If you read `convenienceFeeSeller` or `convenienceFeeBuyer` from the Store API,** treat these as deprecated fields. They may return `0` or legacy non-zero values for old stores. Do not use them to compute any fee logic.
4. **For historical orders,** convenience fee fields retain their original values. Display logic should handle non-zero values correctly.
5. **Never re-introduce `application_fee_amount` in Stripe calls.** The removal of this parameter reflects a permanent policy change, not a temporary override.

---

## Change Impact

| Area | Impact | Notes |
|---|---|---|
| `PUT /store/update/convenience-fee` | Breaking change for any caller | All callers receive 410. Must remove the API call from client code. |
| Stripe checkout session creation | Internal change | `application_fee_amount` removed. No impact on Stripe session behavior beyond Prosperna no longer collecting a platform fee. |
| Store GET API responses | Minor | `convenienceFeeSeller` and `convenienceFeeBuyer` fields still appear in response with value `0`. No breaking change for readers. |
| Order event payloads (`order.created`) | Non-breaking | `convenience_fee` field still present in payload; always `0` for new orders. |
| Admin transaction report API | Non-breaking | Convenience fee columns still returned; data is $0 for new orders. |

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Should a `docsUrl` be established at `https://docs.prosperna.com/api/deprecations/convenience-fee` pointing to this document? | Engineering/Docs | Open |
| OQ-2 | Should the `PUT /store/update/convenience-fee` route be fully removed from the router in a follow-up cleanup release (post-burn-in period)? | Engineering Lead | Open |
| OQ-3 | Are there any third-party integrations or merchant API clients that call `PUT /store/update/convenience-fee` directly (outside the Merchant Dashboard frontend)? | Engineering Lead | Open — must audit before release |
| OQ-4 | Should a Stripe webhook handler be added to log/alert if `application_fee_amount` unexpectedly appears in any session post-migration? | Engineering (payments) | Open |
