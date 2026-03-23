---
id: st-10-promo-code-system-updates
title: Endpoint Document. ST-10 Promo Code System Updates
sidebar_label: ST-10 Promo Code System Updates
sidebar_position: 10
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-22
- Status: Draft

## Linked Documents
- BRD: BRD-ST-10-Promo-Code-System-Updates.md
- PRD: PRD-ST-10-Promo-Code-System-Updates.md

---

## Public API Overview

The ST-10 Promo Code API covers the lifecycle of merchant subscription discount codes managed by Prosperna Admins via the Admin Control Platform. This document covers:

1. **CRUD endpoints** (create, read, update, soft-delete) on the `rewards` collection — served by `admin-service-api`.
2. **Assignment endpoints** — MANUAL assignment of promo codes to specific merchant stores.
3. **Promo code validation endpoint** — used by `payment-integration-api` to look up a promo code by name during subscription checkout.
4. **Mark-as-used endpoint** — called after successful subscription payment.
5. **Merchant list endpoint** — used by the Admin Rewards UI to list merchants with their current plan and assigned promo.

No new endpoints are introduced by ST-10. The existing endpoints are updated to accept new plan tier values and return USD-denominated pricing.

---

## Audience and Use Cases

| Consumer | Use Case |
|---|---|
| `prosperna1` (Admin Frontend) | CRUD on promo codes; assign promos to merchants; filter merchants by plan |
| `payment-integration-api` | Validate a promo code during merchant subscription checkout |
| `payment-integration-api` | Mark a promo code as used after successful payment |
| ST-10 bulk assignment script | Bulk-insert store_to_rewards for OG Merchant promo at T-60 |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Local | `http://localhost:3001/v1/admin/rewards` | Development | admin-service-api default port |
| Staging | `https://api-staging.prosperna.com/v1/admin/rewards` | QA and integration testing | Proxied via api-aggregator |
| Production | `https://api.prosperna.com/v1/admin/rewards` | Live | Proxied via api-aggregator |

---

## API Versioning and Compatibility

- Current API version: `v1` (path prefix `/v1/`).
- No version bump is required for ST-10 changes. The existing endpoints are updated in-place.
- New plan tier values (`LAUNCH`, `GROW`, `SCALE`) are additive — existing callers passing legacy values continue to work during transition.
- Clients should not hardcode tier values — use the dropdown values returned from the Admin UI configuration or a shared constants reference.

---

## Protocol and Data Format Standards

- Transport: HTTPS (REST over HTTP/1.1)
- Request format: `application/json`
- Response format: `application/json`
- Date format: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
- Currency: All flat promo values are in **USD** post-ST-10 deployment. No currency field is stored — consumers must be aware of the active currency based on deployment version.
- MongoDB ObjectIds are returned as 24-character hex strings.

---

## Authentication and Authorization

All endpoints require a valid Prosperna session token (JWT) issued by the Auth Service.

| Context | Auth Mechanism | Notes |
|---|---|---|
| Admin Control Platform calls | `Authorization: Bearer <jwt>` in request header | JWT must contain `role: admin` or `role: superadmin` |
| `payment-integration-api` internal calls | Service-to-service token (internal bearer) | Injected by api-aggregator; not exposed to browser clients |

Unauthenticated requests return `401 Unauthorized`. Authenticated non-admin requests return `403 Forbidden`.

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| `admin` | List, Get, Create, Update, Delete promo codes; Assign to merchants; View associated stores | Cannot set `is_featured` on another promo without unsetting the current featured promo |
| `superadmin` | All admin operations | None |
| `payment-integration-api` (internal) | GET promo by name; POST mark-as-used | Read-only lookup + mark-used only; cannot create or delete |
| Merchant (unauthenticated to this API) | None | Merchants interact with promo codes only through the Merchant Dashboard, which calls payment-integration-api — not this API directly |

---

## Ownership and Data Access Rules

- Promo codes are platform-wide resources — not scoped to individual admin accounts.
- `store_to_rewards` records are scoped per `store_id` — only the owning store's subscription flow can mark the promo as used for that store.
- Soft-deleted (`is_trashed: true`) records are excluded from all list and lookup queries.

---

## Request Conventions

- `Content-Type: application/json` must be set on all POST and PATCH requests.
- Partial updates use PATCH — only include fields to change.
- `ObjectId` values are passed as strings in request bodies and path parameters.
- Query parameters use `camelCase` (e.g., `?planType=LAUNCH`).

---

## Response Conventions

- Successful responses return `2xx` status codes.
- List endpoints return an array of objects (no envelope wrapper unless paginated).
- Single resource endpoints return the resource object directly.
- All timestamps are ISO 8601.
- Soft-deleted records are never returned in list or lookup responses.

---

## Global Guard Rails (Consumer Safety)

- **Never hardcode tier values** — reference the shared constants. Valid new values: `ALL`, `LAUNCH`, `GROW`, `SCALE`.
- **Never hardcode PHP pricing** — all base prices are now USD. Reference the shared `PLAN_PRICING_USD` constants.
- **Do not create hard deletes** — always use the soft-delete endpoint (`DELETE /rewards/:id` sets `is_trashed: true`).
- **Idempotency on assignment** — the assign endpoint (`POST /rewards/:id/assign`) must be safe to call multiple times for the same store.
- **Promo validation is not idempotent by nature** — `POST /rewards/use/:id?storeId=X` should only be called once per successful subscription payment. Duplicate calls are guarded by the `used` flag.

---

## Rate Limits and Abuse Controls

| Endpoint Group | Rate Limit | Notes |
|---|---|---|
| Admin CRUD endpoints | 200 req/min per admin session | Admin-only; low volume expected |
| Promo lookup by name (internal) | 1000 req/min per service token | Called on every subscription checkout |
| Mark-as-used | 500 req/min per service token | Called once per successful payment |
| Bulk assignment (T-60 script) | Batched internally; no external rate limit | Internal script; not an HTTP endpoint |

---

## Global Error Model

```json
{
  "error": {
    "httpStatus": 400,
    "code": "PROMO_ALREADY_USED",
    "type": "validation_error",
    "message": "This promo code has already been used by this store.",
    "details": [
      {
        "field": "promo_code_name",
        "issue": "already_redeemed",
        "expected": "unused promo code",
        "actual": "promo code LAUNCH50 already used by store 64abc123def456"
      }
    ],
    "requestId": "req_9f3a12bc",
    "timestamp": "2026-03-22T08:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/rewards#errors"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `listPromos` | GET | `/v1/admin/rewards/` | admin | List all non-trashed promo codes | admin-crud | FR-1, FR-6 |
| `getPromoByName` | GET | `/v1/admin/rewards/promo-code` | internal | Look up a single promo by exact name | promo-lookup | FR-3, FR-5 |
| `createPromo` | POST | `/v1/admin/rewards/` | admin | Create a new promo code | admin-crud | FR-1, FR-6, FR-8 |
| `updatePromo` | PATCH | `/v1/admin/rewards/:id` | admin | Update fields on an existing promo code | admin-crud | FR-1, FR-6, FR-8 |
| `deletePromo` | DELETE | `/v1/admin/rewards/:id` | admin | Soft-delete a promo code | admin-crud | — |
| `assignPromo` | POST | `/v1/admin/rewards/:id/assign` | admin | Manually assign promo to one or more stores | admin-crud | FR-10 |
| `listAssociatedStores` | GET | `/v1/admin/rewards/:id/associated` | admin | List all stores associated with a promo | admin-crud | — |
| `removeStoreAssociation` | DELETE | `/v1/admin/rewards/:id/:store_id` | admin | Remove a store's association with a promo | admin-crud | — |
| `listMerchants` | GET | `/v1/admin/rewards/merchants` | admin | List merchants for admin assignment UI | admin-crud | FR-7 |
| `markPromoUsed` | POST | `/v1/admin/rewards/use/:id` | internal | Mark a promo as used by a store after payment | mark-used | FR-4 |

---

## Endpoint Reference (Public Consumer Format)

---

### 1. List Promo Codes

**Operation ID:** `listPromos`
**Purpose:** Returns all non-trashed promo codes. Used by the Admin Rewards page right panel to display the promo code list and support search.

**Method/Transport:** `GET /v1/admin/rewards/`

**Required Auth:** Bearer token (admin role)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `search` | query | string | No | Max 100 chars | Filter by promo_code_name (partial match) |

**Request Example:**
```bash
curl -X GET \
  "https://api.prosperna.com/v1/admin/rewards/?search=LAUNCH" \
  -H "Authorization: Bearer <admin_jwt>"
```

**Success Response (200):**
```json
[
  {
    "_id": "64abc123def456789012",
    "promo_code_name": "LAUNCH50",
    "promo_code_type": "percent",
    "promo_code_value": 50,
    "assignment_type": "AUTO",
    "assignment_subscription_tier": "LAUNCH",
    "apply_to": ["Core Subscriptions"],
    "cycle_duration": 3,
    "valid_from": null,
    "valid_until": "2026-12-31T00:00:00Z",
    "is_featured": false,
    "is_permanent": false,
    "is_trashed": false
  }
]
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 403 | `FORBIDDEN` | Non-admin role | Escalate permissions |

**Guard Rails:**
- Trashed promos (`is_trashed: true`) are never returned.
- Legacy tier values (FREE/PLUS/PRO/PREMIUM) may appear in existing records — display as-is.

---

### 2. Get Promo Code by Name

**Operation ID:** `getPromoByName`
**Purpose:** Looks up a single promo code by its exact name. Called by `payment-integration-api` during subscription checkout validation. This is the critical path endpoint for promo discount application.

**Method/Transport:** `GET /v1/admin/rewards/promo-code`

**Required Auth:** Internal service token

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `name` | query | string | Yes | Exact match, case-sensitive | The promo code name as entered by the merchant |

**Request Example:**
```bash
curl -X GET \
  "https://api.prosperna.com/v1/admin/rewards/promo-code?name=OGMERCHANT50" \
  -H "Authorization: Bearer <internal_service_token>"
```

**Success Response (200):**
```json
{
  "_id": "64abc123def456789099",
  "promo_code_name": "OGMERCHANT50",
  "promo_code_type": "percent",
  "promo_code_value": 50,
  "assignment_type": "AUTO",
  "assignment_subscription_tier": "ALL",
  "apply_to": ["Core Subscriptions"],
  "cycle_duration": 3,
  "valid_from": null,
  "valid_until": "2026-06-20T00:00:00Z",
  "is_featured": false,
  "is_permanent": false,
  "is_trashed": false
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `PROMO_NOT_FOUND` | No matching non-trashed promo by that name | Return "Invalid promo code" to merchant |
| 401 | `UNAUTHORIZED` | Missing or invalid service token | Fix service auth configuration |

**Error Response Example:**
```json
{
  "error": {
    "httpStatus": 400,
    "code": "PROMO_NOT_FOUND",
    "type": "not_found",
    "message": "Promo code 'BADCODE' does not exist or has been deactivated.",
    "details": [],
    "requestId": "req_8b2c1d",
    "timestamp": "2026-03-22T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/rewards#errors"
  }
}
```

**Guard Rails:**
- Never returns trashed promos — treat a 400 as "promo does not exist."
- Case-sensitive exact match — merchants must enter the code exactly as configured.
- Do not cache this response for more than 30 seconds — expiry job may trash a promo at any time.

---

### 3. Create Promo Code

**Operation ID:** `createPromo`
**Purpose:** Creates a new promo code record. Used by the Admin Rewards page Create modal.

**Method/Transport:** `POST /v1/admin/rewards/`

**Required Auth:** Bearer token (admin role)

**Parameters:** None (all fields in request body)

**Request Body Schema:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `promo_code_name` | string | Yes | Unique, max 100 chars | The code string merchants enter |
| `promo_code_type` | string | Yes | `"flat"` or `"percent"` | Discount type |
| `promo_code_value` | number | Yes | > 0; for percent: ≤ 100 | Discount amount (USD for flat, percentage for percent) |
| `image` | mixed | Yes | File upload or URL | Admin display image |
| `assignment_type` | string | Yes | `"AUTO"` or `"MANUAL"` | Assignment mechanism |
| `assignment_subscription_tier` | string | Req if AUTO | `"ALL"`, `"LAUNCH"`, `"GROW"`, `"SCALE"` | Target tier |
| `apply_to` | string[] | No | Subset of `["Core Subscriptions", "Add-on Subscriptions", "AI Credits"]`; AI Credits cannot combine | Applicable billing contexts |
| `cycle_duration` | number | No | ≥ 0; default 0 | Billing cycles the discount applies |
| `valid_from` | string (ISO 8601) | No | — | Start of validity window |
| `valid_until` | string (ISO 8601) | No | > valid_from if both set | End of validity window |
| `is_permanent` | boolean | No | Default false | Ignore valid_until if true |

**Request Example:**
```bash
curl -X POST \
  "https://api.prosperna.com/v1/admin/rewards/" \
  -H "Authorization: Bearer <admin_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "promo_code_name": "GROW30",
    "promo_code_type": "percent",
    "promo_code_value": 30,
    "assignment_type": "AUTO",
    "assignment_subscription_tier": "GROW",
    "apply_to": ["Core Subscriptions"],
    "cycle_duration": 1,
    "valid_until": "2026-12-31T00:00:00Z",
    "is_permanent": false
  }'
```

**Success Response (201):**
```json
{
  "_id": "64newid000000000000001",
  "promo_code_name": "GROW30",
  "promo_code_type": "percent",
  "promo_code_value": 30,
  "assignment_type": "AUTO",
  "assignment_subscription_tier": "GROW",
  "apply_to": ["Core Subscriptions"],
  "cycle_duration": 1,
  "valid_until": "2026-12-31T00:00:00Z",
  "is_featured": false,
  "is_permanent": false,
  "is_trashed": false
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 422 | `INVALID_TIER_VALUE` | `assignment_subscription_tier` is not one of the allowed new values | Use: ALL, LAUNCH, GROW, SCALE |
| 422 | `DUPLICATE_PROMO_NAME` | `promo_code_name` already exists | Choose a unique name |
| 422 | `INVALID_APPLY_TO` | AI Credits combined with other apply_to values | Select AI Credits alone or without it |
| 422 | `INVALID_PERCENT_VALUE` | `promo_code_value` > 100 for percent type | Set value between 1 and 100 |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT | Re-authenticate |
| 403 | `FORBIDDEN` | Non-admin role | Escalate permissions |

**Guard Rails:**
- `assignment_subscription_tier` only accepts new values (ALL, LAUNCH, GROW, SCALE) on create — legacy values will be rejected.
- For flat type: `promo_code_value` is in USD. Do not pass PHP amounts.

---

### 4. Update Promo Code

**Operation ID:** `updatePromo`
**Purpose:** Partially updates an existing promo code. Used by the Admin Rewards page edit form.

**Method/Transport:** `PATCH /v1/admin/rewards/:id`

**Required Auth:** Bearer token (admin role)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `id` | path | string | Yes | Valid ObjectId | The promo code's `_id` |

**Request Body:** Same fields as `createPromo`; include only fields to update.

**Request Example:**
```bash
curl -X PATCH \
  "https://api.prosperna.com/v1/admin/rewards/64abc123def456789012" \
  -H "Authorization: Bearer <admin_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "valid_until": "2026-09-30T00:00:00Z"
  }'
```

**Success Response (200):** Updated promo code object (same shape as createPromo response).

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `PROMO_NOT_FOUND` | No non-trashed promo with given ID | Verify the ID |
| 422 | `INVALID_TIER_VALUE` | Setting tier to a legacy value on update | Use: ALL, LAUNCH, GROW, SCALE |
| 401 | `UNAUTHORIZED` | Missing/invalid JWT | Re-authenticate |

---

### 5. Soft-Delete Promo Code

**Operation ID:** `deletePromo`
**Purpose:** Sets `is_trashed: true` on a promo code. The record is preserved for audit purposes.

**Method/Transport:** `DELETE /v1/admin/rewards/:id`

**Required Auth:** Bearer token (admin role)

**Parameters:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string | Yes | Valid ObjectId of the promo code |

**Request Example:**
```bash
curl -X DELETE \
  "https://api.prosperna.com/v1/admin/rewards/64abc123def456789012" \
  -H "Authorization: Bearer <admin_jwt>"
```

**Success Response (200):**
```json
{ "message": "Promo code deleted successfully." }
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `PROMO_NOT_FOUND` | ID not found or already trashed | Verify ID |
| 401 | `UNAUTHORIZED` | Missing/invalid JWT | Re-authenticate |

**Guard Rails:** This is a soft delete — no data is permanently removed. Hard deletes are not supported.

---

### 6. Assign Promo Code to Stores (MANUAL Assignment)

**Operation ID:** `assignPromo`
**Purpose:** Creates `store_to_rewards` records linking one or more merchant stores to a promo code. This is MANUAL assignment triggered by an admin. Also used by the T-60 bulk assignment script for OG Merchant promo.

**Method/Transport:** `POST /v1/admin/rewards/:id/assign`

**Required Auth:** Bearer token (admin role) or internal service token (for bulk assignment)

**Parameters:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string | Yes | The promo code's `_id` |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `store_ids` | string[] | Yes | Array of store ObjectIds to associate |

**Request Example:**
```bash
curl -X POST \
  "https://api.prosperna.com/v1/admin/rewards/64abc123def456789012/assign" \
  -H "Authorization: Bearer <admin_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "store_ids": ["64store1", "64store2", "64store3"]
  }'
```

**Success Response (200):**
```json
{
  "assigned": 3,
  "skipped": 0,
  "message": "3 store(s) successfully assigned to promo code."
}
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `PROMO_NOT_FOUND` | Promo ID not found or trashed | Verify promo ID |
| 422 | `EMPTY_STORE_LIST` | `store_ids` array is empty | Provide at least one store ID |
| 401 | `UNAUTHORIZED` | Missing/invalid JWT | Re-authenticate |

**Guard Rails:**
- Idempotent: re-assigning a store that is already associated must be a no-op (skipped count increments, no duplicate record, no error).
- Maximum 500 store IDs per request. Use batching for bulk assignment at T-60.

---

### 7. Mark Promo Code as Used

**Operation ID:** `markPromoUsed`
**Purpose:** Sets `used: true` on the `store_to_rewards` record for a specific store, indicating the merchant has successfully redeemed the promo. Called by `payment-integration-api` after successful subscription payment confirmation.

**Method/Transport:** `POST /v1/admin/rewards/use/:id`

**Required Auth:** Internal service token

**Parameters:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string | Yes | The promo code's `_id` |
| `storeId` | query | string | Yes | The store's ObjectId |

**Request Example:**
```bash
curl -X POST \
  "https://api.prosperna.com/v1/admin/rewards/use/64abc123def456789012?storeId=64store1" \
  -H "Authorization: Bearer <internal_service_token>"
```

**Success Response (200):**
```json
{ "message": "Promo code marked as used." }
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `ASSOCIATION_NOT_FOUND` | No store_to_rewards record for this promo + store | Verify promo was assigned to this store |
| 400 | `ALREADY_USED` | Promo already marked used for this store | Do not retry; investigate duplicate payment event |
| 401 | `UNAUTHORIZED` | Missing/invalid service token | Fix service auth |

**Guard Rails:**
- Call this endpoint exactly once per successful payment. Do not call on payment failure or pending states.
- Idempotency key recommended: include the payment event ID in request headers for deduplication.

---

### 8. List Merchants (Admin Assignment UI)

**Operation ID:** `listMerchants`
**Purpose:** Returns merchants for display in the Admin Rewards page left panel. Supports filtering by new plan types.

**Method/Transport:** `GET /v1/admin/rewards/merchants`

**Required Auth:** Bearer token (admin role)

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `search` | query | string | No | Max 100 chars | Filter by store name |
| `planType` | query | string | No | `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED` | Filter by current plan type |

**Request Example:**
```bash
curl -X GET \
  "https://api.prosperna.com/v1/admin/rewards/merchants?planType=LAUNCH&search=store" \
  -H "Authorization: Bearer <admin_jwt>"
```

**Success Response (200):**
```json
[
  {
    "store_id": "64store1",
    "store_name": "Sample Store PH",
    "plan_type": "LAUNCH",
    "assigned_promo_code": "LAUNCH50"
  },
  {
    "store_id": "64store2",
    "store_name": "My Online Store",
    "plan_type": "LAUNCH",
    "assigned_promo_code": null
  }
]
```

**Error Path Table:**

| Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 422 | `INVALID_PLAN_TYPE` | `planType` is not one of the allowed values | Use: TRIAL, LAUNCH, GROW, SCALE, SUSPENDED |
| 401 | `UNAUTHORIZED` | Missing/invalid JWT | Re-authenticate |

**Guard Rails:**
- Valid `planType` values post-ST-10: `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED`. Do not pass legacy values (FREE, PLUS, PRO, PREMIUM).

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `id` | path | string | Varies | 24-char hex (ObjectId) | Promo code document ID |
| `store_id` | path | string | Varies | 24-char hex (ObjectId) | Store document ID |
| `storeId` | query | string | Yes (markPromoUsed) | 24-char hex (ObjectId) | Store for mark-used |
| `name` | query | string | Yes (getPromoByName) | Exact match | Promo code name string |
| `search` | query | string | No | Max 100 chars | Partial name search |
| `planType` | query | string | No | Enum | Plan type filter for merchant list |
| `store_ids` | body | string[] | Yes (assignPromo) | Non-empty, max 500 | Stores to assign |

---

## Request/Response Contract Notes

- All request bodies must be `application/json`.
- `promo_code_value` for flat-type promos represents **USD** post-ST-10. No currency field is stored — convention is inferred from deployment version.
- `assignment_subscription_tier` for new promos accepts: `ALL`, `LAUNCH`, `GROW`, `SCALE`. Legacy values may appear in GET responses for old records.
- `apply_to` array: `"AI Credits"` is mutually exclusive with `"Core Subscriptions"` and `"Add-on Subscriptions"`.

---

## Idempotency and Concurrency Notes

| Endpoint | Idempotency | Notes |
|---|---|---|
| `assignPromo` | Yes | Re-assigning existing store is a no-op |
| `markPromoUsed` | No (guard by `used` flag) | Check `ALREADY_USED` error before retrying |
| `deletePromo` | Yes | Deleting an already-trashed promo returns 404 |
| `createPromo` | No | Duplicate names return 422 |
| `getPromoByName` | Yes (GET) | Safe to retry |
| Expiry job | Yes | Re-running on already-trashed promos is a no-op |

---

## Security and Privacy Notes

- Promo code names are non-sensitive but must not be exposed to merchant-facing clients via admin API — merchants interact with promo codes only through the checkout flow in `payment-integration-api`.
- Admin JWT tokens must be validated server-side for role on every request.
- Internal service tokens must be rotated per standard secret management policy.
- `store_to_rewards` records must never be hard-deleted — required for audit trail.

---

## Domain Events and Webhooks

No external webhooks are emitted by the Promo Code / Rewards system. Internal events:

| Event | Emitter | Consumers | Trigger |
|---|---|---|---|
| `promo.used` | `payment-integration-api` (POST mark-used) | Billing audit log | After successful payment confirmation |
| `promo.expired` | `migration-promo-expiry` job | Admin notification (optional) | Daily when `valid_until` has passed |
| `og_merchant.bulk_assigned` | T-60 assignment job | Logging/monitoring | Once at T-60 |

---

## SDK and Integration Examples

### Validate and Apply Promo Code (payment-integration-api internal call)

```typescript
// Step 1: Look up the promo code
const promoResponse = await axios.get(
  `${ADMIN_SERVICE_URL}/v1/admin/rewards/promo-code?name=${promoCodeName}`,
  { headers: { Authorization: `Bearer ${INTERNAL_SERVICE_TOKEN}` } }
);
const promo = promoResponse.data;

// Step 2: Compute discounted price (within getPlanPricingBreakdown)
const basePriceUSD = PLAN_PRICING_USD[planType][billingType]; // e.g., 29.00
let finalPrice = basePriceUSD;
if (promo.promo_code_type === 'flat') {
  finalPrice = Math.max(0, basePriceUSD - promo.promo_code_value);
} else if (promo.promo_code_type === 'percent') {
  finalPrice = basePriceUSD - (basePriceUSD * promo.promo_code_value / 100);
}

// Step 3: Mark as used after successful payment
await axios.post(
  `${ADMIN_SERVICE_URL}/v1/admin/rewards/use/${promo._id}?storeId=${storeId}`,
  {},
  { headers: { Authorization: `Bearer ${INTERNAL_SERVICE_TOKEN}` } }
);
```

### Bulk Assignment Script (T-60)

```typescript
const BATCH_SIZE = 500;
const storeIds = await getAllFreeplanStoreIds(); // returns string[]
for (let i = 0; i < storeIds.length; i += BATCH_SIZE) {
  const batch = storeIds.slice(i, i + BATCH_SIZE);
  await axios.post(
    `${ADMIN_SERVICE_URL}/v1/admin/rewards/${OG_MERCHANT_PROMO_ID}/assign`,
    { store_ids: batch },
    { headers: { Authorization: `Bearer ${INTERNAL_SERVICE_TOKEN}` } }
  );
}
```

---

## How to Use This API Safely

1. **Always check the promo code via `getPromoByName`** before applying a discount — never compute discounts client-side based on cached promo data.
2. **Use the exact promo code name** as entered by the merchant — the lookup is case-sensitive.
3. **Do not assume PHP pricing** — flat promo values are USD post-ST-10.
4. **Handle 400 on `getPromoByName` gracefully** — show the merchant "Invalid promo code" without exposing internal error details.
5. **Call `markPromoUsed` only on confirmed payment success** — not on pending, not on failure.
6. **Batch bulk assignments** — never send more than 500 store IDs per `assignPromo` call.
7. **Do not cache promo lookup responses for more than 30 seconds** — the daily expiry job may invalidate promos at any time.
8. **TRIAL plan type maps to `ALL` tier promos only** — do not attempt to match TRIAL to specific tier promos.

---

## Change Impact

| Component | Change | Breaking? |
|---|---|---|
| `rewards` model `assignment_subscription_tier` | New values added (LAUNCH/GROW/SCALE); legacy values preserved | No (additive) |
| `associateStoreWithAutoRewards()` | New plan type inputs accepted | No (additive) |
| `getPlanPricingBreakdown()` | PHP pricing replaced with USD; plan name inputs extended | Yes — flat promo values are now USD; callers must not pass PHP amounts |
| `listMerchants` `planType` filter | New valid values; legacy plan types may no longer return results | Behavioral change — update all callers to use new plan type values |
| Already-used check | Queries `plan_subscriptions` instead of `xenditrecurringplans` + `plansubscriptions` | Requires PAL `plan_subscriptions` to be live before deployment |

---

## Open Questions

| # | Question | Assumption |
|---|---|---|
| OQ-1 | Is the `getPromoByName` lookup case-sensitive? | Assumed yes — based on exact-match MongoDB query. To confirm with backend team. |
| OQ-2 | Should `markPromoUsed` be idempotent (return 200 if already used)? | Assumed: return 400 `ALREADY_USED` on duplicate call to prevent silent double-marking |
| OQ-3 | Does `listMerchants` need pagination? | Assumed no — current volume is manageable without. Add if merchant count > 10,000. |
| OQ-4 | Should the expiry job also clean up `store_to_rewards` records for expired promos? | Assumed: optional/deferred. Primary requirement is to trash the promo code itself. |
| OQ-5 | What is the exact internal service token mechanism for payment-integration-api → admin-service-api calls? | Assumed: shared bearer token via environment config. Confirm with infra. |
