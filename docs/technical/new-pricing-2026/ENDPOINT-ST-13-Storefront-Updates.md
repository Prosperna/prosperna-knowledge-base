---
id: st-13-storefront-updates
title: Endpoint Document. ST-13 Storefront Updates
sidebar_label: ST-13 Storefront Updates
sidebar_position: 13
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Linked Documents
- BRD: BRD-ST-13-Storefront-Updates.md
- PRD: PRD-ST-13-Storefront-Updates.md

---

## Public API Overview

ST-13 is primarily a frontend change — it does not introduce new backend API endpoints. However, the `p1-customer` storefront interacts with existing API contracts in new ways, and one internal route is added or updated (`robots.txt` dynamic handler). This document covers:

1. **Store Metadata API** — The existing endpoint that `p1-customer` uses to resolve store data. ST-13 adds consumption of the new `isSuspended` field (added by ST-04) and the merchant contact fields (`email`, `phone`) from this response.
2. **Order Creation API** (`orders-service-api`) — The existing endpoint for creating orders at checkout. ST-13 adds frontend handling for a new suspension-related rejection response.
3. **Dynamic robots.txt route** — An internal Next.js route handler in `p1-customer` that must now return a conditional response based on `store.isSuspended`.

There are no new public REST endpoints introduced by ST-13.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Frontend engineers (`p1-customer`) | Understand which fields to read from the store metadata response and how to handle suspension-related API errors |
| Backend engineers (`api-aggregator`, `orders-service-api`) | Understand what fields must be present in API responses for ST-13 to function correctly |
| QA engineers | Know the API contracts to validate — correct HTTP status codes, correct field presence, correct error responses |
| Future implementors / LLMs reading this document | Have a clear contract reference to implement or test ST-13 behavior without needing to reverse-engineer existing code |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Local development | `http://localhost:3000` | `p1-customer` dev server | Store resolved by subdomain or dev override |
| Staging | `https://{subdomain}.staging.prosperna.com` | Pre-release integration testing | Must point to staging `api-aggregator` |
| Production | `https://{subdomain}.prosperna.com` or custom domain | Live merchant storefronts | Multi-tenant; store resolved by subdomain/custom domain |

> `{subdomain}` is the merchant's store subdomain. All storefront routes are scoped to a single resolved store per request.

---

## API Versioning and Compatibility

- ST-13 consumes existing API responses — no API version changes are introduced by this subtask.
- The `isSuspended` field is a non-breaking addition to the store metadata response (new field, backward-compatible). Existing consumers that do not read this field are unaffected.
- The suspension-related rejection from `orders-service-api` introduces a new error code. The frontend must handle it; other consumers of the orders API are unaffected.

---

## Protocol and Data Format Standards

- Transport: HTTPS
- Data format: JSON (`application/json`)
- All API requests and responses use UTF-8 encoding
- Dates: ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
- Monetary values: Decimal number with 2 decimal places (e.g., `228.00`); currency is PHP (Philippine Peso)

---

## Authentication and Authorization

| API | Auth Mechanism | Notes |
|---|---|---|
| Store Metadata API | No customer auth required — store metadata is public per subdomain/domain | Multi-tenancy resolved by subdomain, not by auth token |
| Order Creation API | Customer auth (session/cookie or bearer token via `next-auth`) | Customer must be identified for order association |
| Dynamic robots.txt | No auth — publicly accessible | Standard robots.txt behavior |

---

## Permissions and Scopes

| Role / Scope | Allowed Operations | Restrictions |
|---|---|---|
| Unauthenticated customer | Read store metadata; view robots.txt; visit Suspension Page | Cannot create orders without auth |
| Authenticated customer | All above + submit orders | Order submission rejected if store is suspended |
| Search engine crawler | Fetch robots.txt; attempt to index pages | Suspended stores return 503 + noindex; robots.txt returns Disallow: / |

---

## Ownership and Data Access Rules

- `isSuspended` is set and cleared exclusively by the backend suspension/reactivation functions (ST-04). `p1-customer` is a read-only consumer of this flag — it never writes to it.
- Merchant contact fields (`email`, `phone`) are read-only in this context — the storefront only displays them.
- Customer cart data persists in the customer's browser and is not read or written by the storefront's suspension logic.

---

## Request Conventions

- Store resolution: `p1-customer` resolves the current store by subdomain or custom domain on every request. The resolved store's data is fetched via `api-aggregator` early in the rendering lifecycle.
- All `p1-customer` internal API calls to `api-aggregator` or `orders-service-api` use the aggregator's base URL configured in the application's environment variables (not hardcoded).
- The `isSuspended` check is performed on the resolved store object in memory — not as a separate API call.

---

## Response Conventions

- Successful store metadata responses: HTTP 200 with JSON body
- Suspended store page responses (all routes): HTTP 503
- Normal store page responses: HTTP 200
- Order creation success: HTTP 200 or 201 with order object
- Order creation rejection (suspended store): HTTP 4xx/5xx with error body (see Global Error Model below)
- robots.txt (suspended): HTTP 200, `Content-Type: text/plain`, body: `User-agent: *\nDisallow: /`
- robots.txt (active): HTTP 200, `Content-Type: text/plain`, normal content

---

## Global Guard Rails (Consumer Safety)

1. **Never use HTTP 404 for suspended stores.** 404 signals permanent removal to search engines. Always use 503.
2. **Never show the convenience fee line at ₱0.00.** The line must not render if the fee is zero or absent.
3. **Never allow order creation to proceed silently on a suspended store.** The frontend must catch and handle the suspension rejection error explicitly.
4. **Never write to `isSuspended` from the frontend.** This flag is backend-owned.
5. **Never render store content (nav, products, cart, theme) on a suspended store route.** The Suspension Page is the only content shown.

---

## Rate Limits and Abuse Controls

ST-13 does not introduce new endpoints subject to rate limiting. Existing rate limits on `api-aggregator` and `orders-service-api` apply unchanged. The dynamic robots.txt route is a lightweight in-memory check with no external calls — no rate limit concern.

---

## Global Error Model

All error responses from `api-aggregator` and `orders-service-api` follow this structure:

```json
{
  "error": {
    "httpStatus": 503,
    "code": "STORE_SUSPENDED",
    "type": "store_unavailable",
    "message": "This store is currently suspended due to non-payment.",
    "details": [],
    "requestId": "req_abc123",
    "timestamp": "2026-03-23T10:00:00Z",
    "retryable": false,
    "docsUrl": ""
  }
}
```

> Note: The exact `code` and `type` values for suspension rejection from `orders-service-api` must be confirmed with the backend team (see Open Questions OQ-3 in the PRD). The frontend must key its detection on whatever code the backend returns.

---

## Endpoint Catalog

| Operation ID | Method / Transport | Path or Handler | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `GET_STORE_METADATA` | GET / HTTP | `api-aggregator` — store resolution endpoint (existing) | None (public) | Resolves store by subdomain/domain; returns store object including `isSuspended`, `email`, `phone`, `payPlanType` | Existing | FR-1, FR-2, FR-7, FR-16 |
| `CREATE_ORDER` | POST / HTTP | `orders-service-api` — order creation endpoint (existing) | Customer session | Creates a new order; returns rejection if store is suspended | Existing | FR-10, FR-12, FR-13 |
| `GET_ROBOTS_TXT` | GET / HTTP | `/robots.txt` in `p1-customer` (updated handler) | None (public) | Returns dynamic robots.txt based on `store.isSuspended` | None | FR-5 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. GET_STORE_METADATA — Store Metadata Resolution

**Purpose and when to use:**
Called automatically by `p1-customer` at the start of every request to resolve which merchant store to render, and to read the store's configuration including subscription state, plan type, and contact information. ST-13 adds consumption of the `isSuspended`, `email`, and `phone` fields.

**Method / Path:**
- This is an existing call in `p1-customer` to `api-aggregator`. The exact path is internal — developers should refer to the existing store resolution service call in the codebase.
- For ST-13 purposes, the key requirement is that the response object includes the fields documented below.

**Auth:** None required. Store metadata is resolved by subdomain/domain, not by customer identity.

**Key fields in response relevant to ST-13:**

| Field | Type | Nullable | Description |
|---|---|---|---|
| `isSuspended` | `boolean` | No (defaults `false`) | Set by ST-04. True when the merchant's subscription is suspended. |
| `email` | `string` | Yes | Merchant's registered store contact email. Used by SuspensionPage. |
| `phone` or `contactNumber` | `string` | Yes | Merchant's registered store contact phone. Used by SuspensionPage. Field name TBC — see OQ-1. |
| `payPlanType` | `string` | No | Current plan type. One of: `TRIAL`, `LAUNCH`, `GROW`, `SCALE`. Used by homepage logic. |
| `isTemporaryCloseEnabled` | `boolean` | No | Existing field. Used by existing StoreClosedModal logic. Priority below `isSuspended`. |

**Success response example (abbreviated):**
```json
{
  "id": "store_xyz",
  "subdomain": "mystore",
  "payPlanType": "TRIAL",
  "isSuspended": false,
  "isTemporaryCloseEnabled": false,
  "email": "owner@mystore.com",
  "phone": "+63 912 345 6789",
  "customHomepage": { "published": true }
}
```

**Suspended store response example:**
```json
{
  "id": "store_xyz",
  "subdomain": "mystore",
  "payPlanType": "SCALE",
  "isSuspended": true,
  "isTemporaryCloseEnabled": false,
  "email": "owner@mystore.com",
  "phone": "+63 912 345 6789"
}
```

**Error paths:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `STORE_NOT_FOUND` | Subdomain does not resolve to a store | Show generic "store not found" page (existing behavior) |
| 503 | `SERVICE_UNAVAILABLE` | `api-aggregator` is down | Show generic error; do not attempt to render store content |

**Guard rails:**
- If `isSuspended` is absent from the response (field not yet deployed), treat as `false` — do not break rendering.
- If `email` or `phone` are absent or null, render Suspension Page without contact section — do not throw.

---

### 2. CREATE_ORDER — Order Creation (Checkout)

**Purpose and when to use:**
Called by `p1-customer` when a customer submits their order at checkout. ST-13 requires that the frontend explicitly handles the case where this call is rejected because the merchant's store is suspended.

**Method / Path:**
- POST to `orders-service-api` order creation endpoint (existing endpoint; path is internal — refer to existing codebase).

**Auth:** Customer session required.

**Request body example (abbreviated):**
```json
{
  "storeId": "store_xyz",
  "items": [
    { "productId": "prod_123", "quantity": 2 }
  ],
  "billing": { "name": "Juan dela Cruz", "phone": "+63 912 000 0000" },
  "shipping": { "address": "123 Main St, Manila" },
  "paymentMethod": "gcash"
}
```

**Success response example:**
```json
{
  "orderId": "order_abc",
  "status": "placed",
  "total": 310.34,
  "items": [ ... ]
}
```

> Note: ST-02 ensures the backend no longer includes a `convenienceFee` amount in the total computation. The order response may still include a `convenienceFee` field — if so, it will be `0`. ST-13 removes the display of this field in the checkout summary, not in the order response itself.

**Suspension rejection error response:**
```json
{
  "error": {
    "httpStatus": 403,
    "code": "STORE_SUSPENDED",
    "type": "store_unavailable",
    "message": "This store is currently suspended. Orders cannot be placed.",
    "details": [],
    "requestId": "req_xyz789",
    "timestamp": "2026-03-23T10:05:00Z",
    "retryable": false,
    "docsUrl": ""
  }
}
```

> The exact HTTP status code (403, 422, or 503) and `code` value for suspension rejection must be confirmed with the `orders-service-api` team (see OQ-3 in PRD).

**Error paths:**

| Status | Code | Condition | Consumer Action (Frontend — ST-13) |
|---|---|---|---|
| 403 / 422 / 503 | `STORE_SUSPENDED` (TBC) | Store is suspended at time of order submission | **Redirect customer to Suspension Page.** Do not display generic error. |
| 400 | `VALIDATION_ERROR` | Invalid order payload | Display inline validation errors (existing behavior) |
| 401 | `UNAUTHORIZED` | Customer not authenticated | Redirect to login (existing behavior) |
| 500 | `INTERNAL_ERROR` | Unexpected backend error | Display generic error message (existing behavior) |

**Guard rails:**
- The frontend must distinguish suspension rejection from other errors using the error `code` field
- On suspension rejection: do not retry; redirect to Suspension Page immediately
- On other errors: use existing error handling behavior

---

### 3. GET_ROBOTS_TXT — Dynamic robots.txt Handler

**Purpose and when to use:**
An internal Next.js route handler in `p1-customer` that serves the store's `robots.txt`. ST-13 updates this handler to return `Disallow: /` when `store.isSuspended === true`, preventing search engines from crawling suspended stores.

**Method / Path:**
- GET `/robots.txt` on the storefront domain
- Implementation: Next.js route handler at `app/robots.txt/route.ts` (or equivalent in the existing project structure)

**Auth:** None — publicly accessible.

**Parameters:** None. The handler resolves the current store from context (same as all other routes).

**Success response (store active):**
```
HTTP 200
Content-Type: text/plain

User-agent: *
Allow: /
Sitemap: https://{subdomain}.prosperna.com/sitemap.xml
```
> Exact content of the normal robots.txt is determined by existing implementation. ST-13 only adds the conditional suspension branch.

**Success response (store suspended):**
```
HTTP 200
Content-Type: text/plain

User-agent: *
Disallow: /
```

**Curl example (suspended store):**
```bash
curl -I https://mystore.prosperna.com/robots.txt
# Expected: HTTP 200, body contains "Disallow: /"
```

**Error paths:**

| Status | Condition | Consumer Action |
|---|---|---|
| 200 (Allow: /) | Handler fails to read store suspension status | Serve safe fallback (allow all) — do not 500 |

**Guard rails:**
- If store data is unavailable (store not found, API error), serve default `Allow: /` as a safe fallback — never error out on robots.txt
- robots.txt must respond quickly; it is fetched by crawlers frequently

**Idempotency:** Safe — GET request, read-only.

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `isSuspended` | Store metadata response body | `boolean` | Yes (after ST-04) | `true` or `false` | Determines whether storefront renders SuspensionPage |
| `email` | Store metadata response body | `string` | No | Max 255 chars | Merchant contact email shown on SuspensionPage |
| `phone` / `contactNumber` | Store metadata response body | `string` | No | Max 50 chars | Merchant contact phone shown on SuspensionPage |
| `payPlanType` | Store metadata response body | `string` | Yes | One of: `TRIAL`, `LAUNCH`, `GROW`, `SCALE` | Determines homepage rendering logic |
| `convenienceFee` | Order creation response body | `number` | No | `>= 0` | Value from backend after ST-02 is always `0`; frontend does not display the line regardless |

---

## Request/Response Contract Notes

- **`isSuspended` field dependency:** The `isSuspended` field must be present in the store metadata response before ST-13's suspension logic can function. This field is added by ST-04. If ST-04 has not deployed, the field will be absent and the frontend treats it as `false` (store is active).
- **Convenience fee field:** The order response from `orders-service-api` may still include a `convenienceFee` field after ST-02 (set to `0`). ST-13's frontend change ignores this field in the checkout UI — it does not need to be removed from the API response for ST-13 to work correctly.
- **Order detail pages:** The order history API response for historical orders may include a non-zero `convenienceFee`. The frontend renders this conditionally (`> 0` only). No API changes are needed for this behavior.

---

## Idempotency and Concurrency Notes

- **Store metadata fetch:** Idempotent GET. Multiple concurrent requests resolve the same store state.
- **robots.txt:** Idempotent GET. Response changes only when `isSuspended` changes.
- **Order creation:** Not inherently idempotent. Existing idempotency handling for order creation is unchanged by ST-13. The suspension check is purely a rejection — no side effects.
- **Race condition (store suspended mid-checkout):** If the store is suspended between the time the customer loads the checkout page and the time they submit the order, the frontend will see the suspension rejection from the backend (FR-10 coverage). The Suspension Page renders on the next navigation. The storefront will also detect `isSuspended = true` on the next SSR/ISR re-render.

---

## Security and Privacy Notes

- Merchant contact info (`email`, `phone`) displayed on the Suspension Page is business contact information — appropriate for public display on the merchant's storefront.
- No customer PII is collected or exposed by the Suspension Page, robots.txt handler, or convenience fee removal.
- The frontend never writes the `isSuspended` flag. It is a read-only consumer. The flag can only be set or cleared by authenticated backend processes (ST-04).
- HTTP 503 with `noindex` and `Disallow: /` prevents unauthorized data harvesting of suspended store product/customer data via crawlers.

---

## Domain Events and Webhooks

ST-13 does not produce or consume domain events or webhooks. The `isSuspended` state change events are owned by ST-04.

---

## SDK and Integration Examples

### Reading `isSuspended` and rendering SuspensionPage (conceptual)

The following illustrates the intended logic. Exact implementation depends on the existing `p1-customer` store resolution pattern (middleware, root layout, or server component).

```typescript
// Conceptual — adapt to actual store resolution pattern in p1-customer

const store = await resolveStore(subdomain); // existing call

if (store.isSuspended) {
  // Set HTTP 503 header
  // Render <SuspensionPage merchantEmail={store.email} merchantPhone={store.phone} />
  // Return — do not proceed to route-specific rendering
}

if (store.isTemporaryCloseEnabled) {
  // Existing StoreClosedModal behavior
}

// Normal rendering continues...
```

### Handling suspension rejection at checkout (conceptual)

```typescript
// Conceptual — adapt to existing order submission handler in p1-customer

try {
  const order = await createOrder(payload);
  router.push(`/checkout/thank-you?orderId=${order.orderId}`);
} catch (error) {
  if (error.code === 'STORE_SUSPENDED') { // exact code TBC — see OQ-3
    router.push('/suspended'); // or trigger full-page Suspension Page render
  } else {
    // Existing error handling
    showErrorMessage(error.message);
  }
}
```

### Dynamic robots.txt handler (conceptual)

```typescript
// app/robots.txt/route.ts — Next.js App Router route handler

import { NextResponse } from 'next/server';
import { resolveStore } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const store = await resolveStore(request);
    if (store.isSuspended) {
      return new NextResponse('User-agent: *\nDisallow: /', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    // Return normal robots.txt content
    return new NextResponse('User-agent: *\nAllow: /\nSitemap: ...', {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch {
    // Safe fallback — never error on robots.txt
    return new NextResponse('User-agent: *\nAllow: /', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
```

---

## How to Use This API Safely

1. **Always check `isSuspended` before rendering any store content.** Insert the check as early as possible in the rendering lifecycle — middleware or root layout server component are the recommended insertion points.
2. **Never use `isSuspended` as a UI toggle within an existing store page.** It must replace the entire page, not conditionally hide content within a normal store layout.
3. **Always return HTTP 503 for suspended stores at the page level.** This is different from the store metadata API (which returns 200 with the store data) — the page response itself must be 503.
4. **Test both the `isSuspended = true` and `isSuspended = false` paths** for every route type: homepage, product page, cart, checkout, customer account, blog.
5. **Confirm the suspension rejection error code with the backend team** before implementing the checkout error handler (OQ-3). Hard-coding an assumed error code risks silent failures.
6. **Conditionally render the convenience fee line based on value > 0** to correctly handle both new orders (no line) and historical orders (preserve original amount).

---

## Change Impact

| Area | Change | Impact Level |
|---|---|---|
| `p1-customer` root layout / middleware | New `isSuspended` check inserted at highest rendering level | High — affects all routes universally |
| `SuspensionPage` component | New component introduced | Additive — no existing code modified |
| `app/robots.txt/route.ts` | Handler updated to conditionally serve `Disallow: /` | Low — isolated change |
| `Summary.tsx` | Convenience fee row removed | Low — isolated UI change |
| `SingleCheckoutMain.tsx` | `convenienceFee` state removed / ignored | Low — isolated state cleanup |
| `app/(routes)/page.tsx` | Plan type list updated; TRIAL added | Low — string comparison logic change |
| Checkout error handler | New suspension rejection path added | Low — additive error branch |
| Store metadata API response | Consumers of `api-aggregator` now read `isSuspended` | Low — new field, backward-compatible |

---

## Open Questions

| # | Question | Owner | Assumption Used |
|---|---|---|---|
| OQ-1 | What is the exact field name for merchant phone in the store metadata response — `phone` or `contactNumber`? | Backend / ST-04 team | Assumed `phone` — implementation team to confirm |
| OQ-2 | Does the existing store metadata response include `email` and `phone`? Or do they need to be explicitly added to the api-aggregator response shape? | Backend / api-aggregator team | Assumed included — if not, backend team must add them before ST-13 goes live |
| OQ-3 | What is the exact HTTP status code and error `code` value returned by `orders-service-api` when an order is rejected because the store is suspended? | Backend / orders-service-api team | Used `STORE_SUSPENDED` as placeholder — must be confirmed before implementing FR-10 |
| OQ-4 | Does a `robots.txt` route handler already exist in `p1-customer`? | Frontend team | Assumed it either exists or is straightforward to create — implementation team to verify |
