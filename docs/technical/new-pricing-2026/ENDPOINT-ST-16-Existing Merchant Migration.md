---
id: st-16-existing-merchant-migration
title: Endpoint Document. ST-16 Existing Merchant Migration
sidebar_label: ST-16 Existing Merchant Migration
sidebar_position: 16
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Linked Documents
- BRD: BRD-Existing Merchant Migration.md
- PRD: PRD-Existing Merchant Migration.md

---

## Public API Overview

This document covers the API surface introduced and modified by the Existing Merchant Migration feature (ST-16). It spans four internal services:

| Service | Scope |
|---|---|
| `business-profile-api` | New migration admin endpoints; modified plan subscribe/cancel endpoints |
| `payment-integration-api` | Modified pricing breakdown endpoint; updated billing cron behavior |
| `admin-service-api` | Modified rewards/promo code endpoint |
| `email-service-api` | New migration email templates (template-only, no new HTTP endpoints) |

All endpoints are internal to the Prosperna platform. There are no public third-party API endpoints in this feature.

---

## Audience and Use Cases

| Audience | Use Case |
|---|---|
| Prosperna Admins | Trigger and monitor the bulk migration job; view audit logs; manually reactivate merchants |
| Merchant Dashboard frontend (`prosperna1`) | Subscribe to a new plan from the suspended lock screen; check pricing breakdown with promo |
| Background job runners (cron) | Execute migration communication, promo assignment, and win-back campaigns |
| Engineering / on-call | Monitor migration health; execute rollback if needed |

---

## Environments and Base URLs

| Environment | Base URL | Purpose | Notes |
|---|---|---|---|
| Production | `https://api.prosperna.com` | Live migration operations | Bulk migration job and admin endpoints |
| Staging | `https://staging-api.prosperna.com` | Pre-migration testing | Full dry-run before T-0 |
| Local | `http://localhost:{port}` | Development and unit testing | Port varies per service |

---

## API Versioning and Compatibility

All endpoints follow the existing Prosperna versioning convention. New migration endpoints are introduced under `/admin/migration/` and are versioned independently of merchant-facing endpoints. Existing endpoints modified by ST-16 are backward-compatible — no breaking changes to existing request/response contracts for merchants already using those endpoints.

---

## Protocol and Data Format Standards

- Protocol: HTTPS / REST
- Data format: JSON (`Content-Type: application/json`)
- Date format: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
- IDs: MongoDB ObjectId strings or `P1-PLAN-{ObjectId}` formatted strings

---

## Authentication and Authorization

| Endpoint Group | Auth Mechanism | Scope Required |
|---|---|---|
| `POST /admin/migration/execute` | Admin JWT (Cognito) | `admin:migration:write` |
| `GET /admin/migration/stats` | Admin JWT (Cognito) | `admin:migration:read` |
| `POST /admin/migration/rollback` | Admin JWT (Cognito) | `admin:migration:write` + explicit confirmation token |
| `GET /admin/migration/audit-log` | Admin JWT (Cognito) | `admin:migration:read` |
| `POST /billing/plans/subscribe/:store_id` | Merchant JWT (Cognito) | Merchant's own store only |
| `POST /billing/plans/cancel/:store_id` | Merchant JWT (Cognito) | Merchant's own store only |
| `GET /plansubscriptions/pricing/:plan` | Merchant JWT or Admin JWT | Own store or admin scope |
| `POST /rewards/` | Admin JWT (Cognito) | `admin:rewards:write` |

---

## Permissions and Scopes

| Role/Scope | Allowed Operations | Restrictions |
|---|---|---|
| Prosperna Admin | All migration admin endpoints; all rewards endpoints | Cannot operate on behalf of another admin |
| Merchant | Subscribe to plan; cancel plan; view pricing breakdown for own store | Cannot trigger migration; cannot view other merchants' data |
| Background job (service account) | Communication sender; promo applicator; win-back sender | Machine-to-machine auth; no JWT required if internal service call |
| On-call Engineer | Same as Prosperna Admin | Rollback requires explicit confirmation token |

---

## Ownership and Data Access Rules

- Merchants may only subscribe to or cancel plans for their own `store_id`. The `store_id` in the URL path must match the authenticated merchant's store.
- Admin migration endpoints are restricted to internal admin users. No merchant can call `/admin/migration/*`.
- The `migration_audit_log` is append-only from the merchant and job perspective. Only admin users can query it.

---

## Request Conventions

- All request bodies must be `Content-Type: application/json`.
- All timestamps in request bodies must be ISO 8601.
- Store IDs and plan names are case-sensitive. Use uppercase for plan names: `LAUNCH`, `GROW`, `SCALE`.
- Admin endpoints require a valid admin Bearer JWT in the `Authorization` header.

---

## Response Conventions

- All responses return `Content-Type: application/json`.
- Success responses: HTTP 200 or 201.
- All error responses follow the Global Error Model below.
- Paginated list responses include `{ data: [], total: N, page: N, pageSize: N }`.

---

## Global Guard Rails (Consumer Safety)

- Never call `POST /admin/migration/execute` more than once concurrently. The job has an internal lock — a second call while the job is running returns HTTP 409.
- `POST /admin/migration/rollback` requires a confirmation token generated by a prior `GET /admin/migration/rollback-confirm-token` call. This token expires in 5 minutes.
- Verify merchant `isSuspended === true` before displaying the plan selection lock screen.
- When calling `GET /plansubscriptions/pricing/:plan`, always pass the `store_id` query parameter to get personalized pricing with any applicable promo codes.

---

## Rate Limits and Abuse Controls

| Endpoint | Rate Limit | Notes |
|---|---|---|
| `POST /admin/migration/execute` | 1 request per 24 hours per admin | Job lock prevents concurrent execution |
| `GET /admin/migration/stats` | 60 req/min per admin user | Polling-safe; use server-sent events for real-time if needed |
| `GET /admin/migration/audit-log` | 60 req/min per admin user | Paginate results; max pageSize: 500 |
| `POST /billing/plans/subscribe/:store_id` | 10 req/min per store | Prevent accidental duplicate subscriptions |
| `GET /plansubscriptions/pricing/:plan` | 120 req/min per store | Lightweight; used on plan selection screens |
| `POST /rewards/` | 30 req/min per admin user | — |

---

## Global Error Model

```json
{
  "error": {
    "httpStatus": 400,
    "code": "INVALID_PLAN_NAME",
    "type": "validation_error",
    "message": "The plan name provided is not valid.",
    "details": [
      {
        "field": "plan",
        "issue": "invalid_value",
        "expected": "LAUNCH | GROW | SCALE",
        "actual": "FREE"
      }
    ],
    "requestId": "req_abc123xyz",
    "timestamp": "2026-03-23T10:00:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/INVALID_PLAN_NAME"
  }
}
```

---

## Endpoint Catalog

| Operation ID | Method | Path | Auth Scope | Description | Rate Limit Bucket | FR Mapping |
|---|---|---|---|---|---|---|
| `migration.execute` | POST | `/admin/migration/execute` | `admin:migration:write` | Trigger the bulk migration job | 1/day | FR-5 |
| `migration.stats` | GET | `/admin/migration/stats` | `admin:migration:read` | Get real-time migration progress stats | 60/min | FR-23 |
| `migration.rollback` | POST | `/admin/migration/rollback` | `admin:migration:write` | Emergency rollback of migration changes | 1/day | FR-8 |
| `migration.auditLog` | GET | `/admin/migration/audit-log` | `admin:migration:read` | Query migration audit log with filters | 60/min | FR-3, FR-5 |
| `billing.subscribe` | POST | `/billing/plans/subscribe/:store_id` | merchant | Subscribe merchant to a new plan | 10/min | FR-20 |
| `billing.cancel` | POST | `/billing/plans/cancel/:store_id` | merchant | Cancel merchant subscription | 10/min | FR-7 |
| `pricing.breakdown` | GET | `/plansubscriptions/pricing/:plan` | merchant or admin | Get pricing breakdown with promo code applied | 120/min | FR-17 |
| `rewards.create` | POST | `/rewards/` | `admin:rewards:write` | Create or update a promo code | 30/min | FR-14, FR-28 |

---

## Endpoint Reference

---

### 1. Execute Bulk Migration Job

**Operation ID:** `migration.execute`
**Purpose:** Triggers the `migration-bulk-executor` job which migrates all existing merchants from legacy plan names to new plan names. Must only be called once on T-0. An internal job lock prevents concurrent executions.

**Method:** `POST`
**Path:** `/admin/migration/execute`
**Auth:** Admin Bearer JWT. Scope: `admin:migration:write`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `dry_run` | body | boolean | No | — | If `true`, run the migration logic without writing to the database. Useful for final pre-T-0 validation. Default: `false`. |
| `batch_size` | body | integer | No | 1–500 | Number of merchants to process per batch. Default: 100. |
| `failure_threshold_pct` | body | number | No | 0–100 | Halt if this percentage of a batch fails. Default: 10. |

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/admin/migration/execute \
  -H "Authorization: Bearer {admin_jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "dry_run": false,
    "batch_size": 100,
    "failure_threshold_pct": 10
  }'
```

**Success Response (HTTP 202 Accepted):**

```json
{
  "job_id": "migration-20260323-001",
  "status": "started",
  "dry_run": false,
  "estimated_merchants": 12450,
  "started_at": "2026-03-23T08:00:00Z",
  "monitor_url": "/admin/migration/stats"
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 409 | `JOB_ALREADY_RUNNING` | A migration job is already in progress | Check `/admin/migration/stats` for current job status |
| 403 | `INSUFFICIENT_SCOPE` | Caller does not have `admin:migration:write` | Contact your Prosperna admin for permission grant |
| 400 | `INVALID_PARAMETER` | `batch_size` or `failure_threshold_pct` out of range | Correct the parameter values and retry |

**Error Response Example:**

```json
{
  "error": {
    "httpStatus": 409,
    "code": "JOB_ALREADY_RUNNING",
    "type": "conflict_error",
    "message": "A migration job is already in progress. Monitor its status before starting another.",
    "details": [],
    "requestId": "req_xyz789",
    "timestamp": "2026-03-23T08:01:00Z",
    "retryable": false,
    "docsUrl": "https://docs.prosperna.com/api/errors/JOB_ALREADY_RUNNING"
  }
}
```

**Guard Rails:**
- This endpoint should only be called once. Use `dry_run: true` for all test runs before T-0.
- Monitor progress via `GET /admin/migration/stats` after calling this endpoint.
- Ensure all prerequisite subtasks (ST-01, ST-03, ST-04, ST-05, ST-10, ST-14) are verified before calling.

---

### 2. Get Migration Stats

**Operation ID:** `migration.stats`
**Purpose:** Returns real-time progress statistics for the running or most recently completed migration job. Intended for the admin migration tracking dashboard.

**Method:** `GET`
**Path:** `/admin/migration/stats`
**Auth:** Admin Bearer JWT. Scope: `admin:migration:read`

**Parameters:** None

**Request Example:**

```bash
curl -X GET https://api.prosperna.com/admin/migration/stats \
  -H "Authorization: Bearer {admin_jwt}"
```

**Success Response (HTTP 200):**

```json
{
  "job_id": "migration-20260323-001",
  "status": "running",
  "started_at": "2026-03-23T08:00:00Z",
  "completed_at": null,
  "total_merchants": 12450,
  "processed": 4200,
  "succeeded": 4188,
  "failed": 8,
  "skipped": 4,
  "failure_rate_pct": 0.19,
  "halted": false,
  "by_migration_type": {
    "free_to_suspended": 2900,
    "plus_to_launch": 750,
    "pro_to_grow": 420,
    "premium_to_scale": 118,
    "trial_skipped": 4
  },
  "by_segment": {
    "segment_a": 380,
    "segment_b": 820,
    "segment_c": 1700,
    "segment_d": 4
  }
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `NO_MIGRATION_JOB` | No migration job has been executed yet | Trigger the job first via `POST /admin/migration/execute` |
| 403 | `INSUFFICIENT_SCOPE` | Missing `admin:migration:read` scope | Request appropriate permissions |

---

### 3. Emergency Rollback

**Operation ID:** `migration.rollback`
**Purpose:** Reverts migration changes for merchants. Only for emergency use after a catastrophic T-0 failure. Requires a time-limited confirmation token obtained separately.

**Method:** `POST`
**Path:** `/admin/migration/rollback`
**Auth:** Admin Bearer JWT. Scope: `admin:migration:write`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `confirmation_token` | body | string | Yes | 5-minute expiry | Token obtained from `GET /admin/migration/rollback-confirm-token` |
| `scope` | body | string | No | `all` \| `store_ids` | Rollback all merchants or a specific list. Default: `all`. |
| `store_ids` | body | array of strings | Conditional | Required if scope = `store_ids` | Specific store IDs to rollback. Max 1000 per request. |

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/admin/migration/rollback \
  -H "Authorization: Bearer {admin_jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "confirmation_token": "eyJhbGciOi...",
    "scope": "all"
  }'
```

**Success Response (HTTP 202 Accepted):**

```json
{
  "rollback_job_id": "rollback-20260323-001",
  "status": "started",
  "scope": "all",
  "started_at": "2026-03-23T08:45:00Z"
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_CONFIRMATION_TOKEN` | Token is missing, invalid, or expired | Obtain a new token and retry within 5 minutes |
| 400 | `STORE_IDS_REQUIRED` | `scope: store_ids` specified but no IDs provided | Include the `store_ids` array |
| 409 | `JOB_ALREADY_RUNNING` | A rollback or migration job is in progress | Wait for current job to complete |
| 403 | `INSUFFICIENT_SCOPE` | Caller lacks required scope | Request permissions from platform administrator |

**Guard Rails:**
- This endpoint should ONLY be used in genuine emergencies.
- A confirmation token is required and expires in 5 minutes to prevent accidental rollbacks.
- The rollback is partial for `scope: store_ids` — verify you have the correct store IDs before triggering.
- Running a rollback does not delete audit log records. All rollback operations are themselves logged.

---

### 4. Query Migration Audit Log

**Operation ID:** `migration.auditLog`
**Purpose:** Returns paginated migration audit log records filtered by any combination of store ID, migration type, status, or date range.

**Method:** `GET`
**Path:** `/admin/migration/audit-log`
**Auth:** Admin Bearer JWT. Scope: `admin:migration:read`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `store_id` | query | string | No | — | Filter by specific store ID |
| `status` | query | string | No | `success` \| `failed` \| `skipped` | Filter by migration status |
| `migration_type` | query | string | No | See values below | Filter by migration type |
| `from` | query | ISO 8601 date | No | — | Filter by `migrated_at >= from` |
| `to` | query | ISO 8601 date | No | — | Filter by `migrated_at <= to` |
| `page` | query | integer | No | Min 1 | Page number. Default: 1. |
| `page_size` | query | integer | No | 1–500 | Records per page. Default: 100. |

Valid `migration_type` values: `free_to_suspended`, `plus_to_launch`, `pro_to_grow`, `premium_to_scale`, `trial_skipped`

**Request Example:**

```bash
curl -X GET "https://api.prosperna.com/admin/migration/audit-log?status=failed&page=1&page_size=50" \
  -H "Authorization: Bearer {admin_jwt}"
```

**Success Response (HTTP 200):**

```json
{
  "data": [
    {
      "store_id": "store_abc123",
      "merchant_name": "Maria's Shop",
      "old_plan": "FREE",
      "new_plan": "SUSPENDED",
      "migration_type": "free_to_suspended",
      "status": "failed",
      "error_message": "Database write timeout on suspendedAt field",
      "promo_code_applied": false,
      "migrated_at": "2026-03-23T08:05:33Z"
    }
  ],
  "total": 8,
  "page": 1,
  "page_size": 50
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_DATE_RANGE` | `from` is after `to` | Correct the date range |
| 400 | `INVALID_STATUS` | Status value not one of the valid enum | Use `success`, `failed`, or `skipped` |
| 403 | `INSUFFICIENT_SCOPE` | Missing `admin:migration:read` scope | Request appropriate permissions |

---

### 5. Subscribe to Plan (Modified for New Plan Names)

**Operation ID:** `billing.subscribe`
**Purpose:** Creates a new subscription for a merchant. Modified by ST-16 to accept new plan names (`LAUNCH`, `GROW`, `SCALE`) and route payments through the Payment Abstraction Layer (ST-01). Used by merchants on the `/suspended` lock screen to reactivate.

**Method:** `POST`
**Path:** `/billing/plans/subscribe/:store_id`
**Auth:** Merchant Bearer JWT. Merchant's own `store_id` only.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `store_id` | path | string | Yes | Must match authenticated merchant | The store to subscribe |
| `plan` | body | string | Yes | `LAUNCH` \| `GROW` \| `SCALE` | The plan to subscribe to |
| `billing_type` | body | string | Yes | `MONTHLY` \| `QUARTERLY` \| `ANNUAL` | Billing cycle |
| `payment_gateway` | body | string | No | `STRIPE` \| `XENDIT` | Gateway to use. Auto-selected by `marketCountry` if omitted. |
| `promo_code` | body | string | No | — | Promo code to apply (e.g., "OG-MERCHANT-2026") |

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/billing/plans/subscribe/store_abc123 \
  -H "Authorization: Bearer {merchant_jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "LAUNCH",
    "billing_type": "MONTHLY",
    "payment_gateway": "STRIPE",
    "promo_code": "OG-MERCHANT-2026"
  }'
```

**Success Response (HTTP 201):**

```json
{
  "subscription_id": "P1-PLAN-abc123",
  "store_id": "store_abc123",
  "plan": "LAUNCH",
  "billing_type": "MONTHLY",
  "payment_gateway": "STRIPE",
  "amount_due": 14.50,
  "currency": "USD",
  "promo_applied": {
    "code": "OG-MERCHANT-2026",
    "discount_pct": 50,
    "cycles_remaining": 3
  },
  "next_payment_due_date": "2026-04-23T00:00:00Z",
  "payment_url": "https://checkout.stripe.com/pay/cs_live_abc123"
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_PLAN_NAME` | Plan name not one of `LAUNCH`, `GROW`, `SCALE` | Use a valid plan name; legacy names (FREE, PLUS, etc.) are no longer accepted |
| 400 | `INVALID_PROMO_CODE` | Promo code does not exist or is expired | Proceed without promo, or contact support |
| 403 | `STORE_ACCESS_DENIED` | Authenticated merchant does not own this `store_id` | Use the correct `store_id` for the authenticated merchant |
| 409 | `ACTIVE_SUBSCRIPTION_EXISTS` | Merchant already has an active subscription | Cancel or modify the existing subscription first |

**Guard Rails:**
- Always call `GET /plansubscriptions/pricing/:plan?store_id={store_id}` first to show the merchant the exact amount they will be charged before calling this endpoint.
- Store the returned `payment_url` and redirect the merchant to complete payment. Do not poll — use the payment webhook to confirm subscription activation.

---

### 6. Cancel Plan (Modified: Suspends Instead of Reverts to Free)

**Operation ID:** `billing.cancel`
**Purpose:** Cancels a merchant's active subscription. Modified by ST-16 — after cancellation, when the billing period ends, the merchant is suspended (`suspendMerchant()` is called) instead of being reverted to the Free Plan.

**Method:** `POST`
**Path:** `/billing/plans/cancel/:store_id`
**Auth:** Merchant Bearer JWT. Merchant's own `store_id` only.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `store_id` | path | string | Yes | Must match authenticated merchant | The store to cancel |
| `reason` | body | string | No | Max 500 chars | Optional cancellation reason from merchant |

**Request Example:**

```bash
curl -X POST https://api.prosperna.com/billing/plans/cancel/store_abc123 \
  -H "Authorization: Bearer {merchant_jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Switching to a different platform"
  }'
```

**Success Response (HTTP 200):**

```json
{
  "store_id": "store_abc123",
  "status": "cancelled",
  "access_until": "2026-04-23T00:00:00Z",
  "suspension_date": "2026-04-23T00:00:00Z",
  "message": "Your plan has been cancelled. You will retain full access until 2026-04-23. After that date, your account will be suspended. You can reactivate at any time."
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 404 | `NO_ACTIVE_SUBSCRIPTION` | Merchant has no active subscription to cancel | Nothing to cancel |
| 403 | `STORE_ACCESS_DENIED` | Authenticated merchant does not own this `store_id` | Use the correct `store_id` |

**Guard Rails:**
- After cancellation, the merchant retains full access until `access_until`. The suspension is triggered by the `createUpcomingInvoices()` cron when the billing period ends.
- Inform the merchant clearly: there is no Free Plan fallback after cancellation. The account will be suspended.

---

### 7. Get Plan Pricing Breakdown (Modified: New Plans, USD Pricing, Promo)

**Operation ID:** `pricing.breakdown`
**Purpose:** Returns the full pricing breakdown for a given plan and billing type, including any promo code discount applicable to the merchant. Used on plan selection and billing pages.

**Method:** `GET`
**Path:** `/plansubscriptions/pricing/:plan`
**Auth:** Merchant Bearer JWT or Admin Bearer JWT.

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `plan` | path | string | Yes | `LAUNCH` \| `GROW` \| `SCALE` | The plan to price |
| `store_id` | query | string | No | — | If provided, applies any active auto-promo codes for this merchant |
| `billing_type` | query | string | No | `MONTHLY` \| `QUARTERLY` \| `ANNUAL` | Billing cycle. Default: `MONTHLY`. |
| `promo_code` | query | string | No | — | Explicit promo code to apply |

**Request Example:**

```bash
curl -X GET "https://api.prosperna.com/plansubscriptions/pricing/LAUNCH?store_id=store_abc123&billing_type=MONTHLY" \
  -H "Authorization: Bearer {merchant_jwt}"
```

**Success Response (HTTP 200):**

```json
{
  "plan": "LAUNCH",
  "billing_type": "MONTHLY",
  "currency": "USD",
  "base_price": 29.00,
  "promo_applied": {
    "code": "OG-MERCHANT-2026",
    "type": "percent",
    "value": 50,
    "discount_amount": 14.50,
    "cycles_applicable": 3,
    "expires_at": "2026-06-21T00:00:00Z"
  },
  "amount_due_this_cycle": 14.50,
  "amount_due_after_promo": 29.00,
  "next_renewal_date": "2026-04-23T00:00:00Z"
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_PLAN_NAME` | Plan is not one of `LAUNCH`, `GROW`, `SCALE` | Use a valid new plan name |
| 400 | `INVALID_PROMO_CODE` | Supplied `promo_code` is expired or invalid | Remove the promo_code parameter or use a valid code |
| 404 | `STORE_NOT_FOUND` | `store_id` provided but does not exist | Verify the store ID |

---

### 8. Create / Update Promo Code (Modified: New Tier Values)

**Operation ID:** `rewards.create`
**Purpose:** Creates or updates a promo code in the rewards system. Modified by ST-16 to accept new `assignment_subscription_tier` values: `LAUNCH`, `GROW`, `SCALE`. Used to create the "OG Merchant" migration promo.

**Method:** `POST`
**Path:** `/rewards/`
**Auth:** Admin Bearer JWT. Scope: `admin:rewards:write`

**Parameters:**

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `promo_code_name` | body | string | Yes | Max 100 chars | Human-readable promo code name |
| `promo_code_type` | body | string | Yes | `flat` \| `percent` | Discount type |
| `promo_code_value` | body | number | Yes | > 0 | Discount amount (flat: USD amount; percent: 0–100) |
| `assignment_type` | body | string | Yes | `AUTO` \| `MANUAL` | How the promo is assigned |
| `assignment_subscription_tier` | body | string | Yes | `ALL` \| `FREE` \| `PLUS` \| `PRO` \| `PREMIUM` \| `LAUNCH` \| `GROW` \| `SCALE` | Which plan tier this promo applies to |
| `apply_to` | body | array of strings | Yes | See values | Where the promo applies: `Core Subscriptions`, `Add-on Subscriptions`, `AI Credits` |
| `cycle_duration` | body | integer | No | ≥ 1 | How many billing cycles the promo applies. Omit for one-time. |
| `valid_from` | body | ISO 8601 date | Yes | — | Promo start date |
| `valid_until` | body | ISO 8601 date | Yes | After `valid_from` | Promo end date |

**Request Example (OG Merchant Promo):**

```bash
curl -X POST https://api.prosperna.com/rewards/ \
  -H "Authorization: Bearer {admin_jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "promo_code_name": "OG-MERCHANT-2026",
    "promo_code_type": "percent",
    "promo_code_value": 50,
    "assignment_type": "AUTO",
    "assignment_subscription_tier": "ALL",
    "apply_to": ["Core Subscriptions"],
    "cycle_duration": 3,
    "valid_from": "2026-01-22T00:00:00Z",
    "valid_until": "2026-06-21T00:00:00Z"
  }'
```

**Success Response (HTTP 201):**

```json
{
  "reward_id": "reward_og2026",
  "promo_code_name": "OG-MERCHANT-2026",
  "promo_code_type": "percent",
  "promo_code_value": 50,
  "assignment_type": "AUTO",
  "assignment_subscription_tier": "ALL",
  "apply_to": ["Core Subscriptions"],
  "cycle_duration": 3,
  "valid_from": "2026-01-22T00:00:00Z",
  "valid_until": "2026-06-21T00:00:00Z",
  "status": "active",
  "created_at": "2026-01-22T07:30:00Z"
}
```

**Error Path Table:**

| HTTP Status | Code | Condition | Consumer Action |
|---|---|---|---|
| 400 | `INVALID_TIER_VALUE` | `assignment_subscription_tier` is not a valid enum value | Use one of the documented values |
| 400 | `INVALID_DATE_RANGE` | `valid_from` is after `valid_until` | Correct the date range |
| 400 | `PROMO_CODE_EXISTS` | A promo with this name already exists | Use a different name or update the existing promo |
| 403 | `INSUFFICIENT_SCOPE` | Caller does not have `admin:rewards:write` | Request appropriate permissions |

---

## Parameter Reference

| Parameter | Location | Type | Required | Constraints | Description |
|---|---|---|---|---|---|
| `store_id` | path or query | string | Varies | MongoDB ObjectId string | Prosperna store identifier |
| `plan` | path or body | string | Varies | `LAUNCH` \| `GROW` \| `SCALE` | New plan names only (post-migration) |
| `billing_type` | body or query | string | Varies | `MONTHLY` \| `QUARTERLY` \| `ANNUAL` | Subscription billing cycle |
| `payment_gateway` | body | string | No | `STRIPE` \| `XENDIT` | Payment gateway for new subscriptions |
| `promo_code` | body or query | string | No | — | Promotional discount code |
| `dry_run` | body | boolean | No | — | Execute without writing to DB |
| `batch_size` | body | integer | No | 1–500 | Merchant batch size for migration job |
| `confirmation_token` | body | string | Yes (rollback only) | 5-min expiry | Safety token for destructive operations |
| `page` | query | integer | No | ≥ 1 | Pagination page number |
| `page_size` | query | integer | No | 1–500 | Pagination records per page |

---

## Request/Response Contract Notes

- The `plan` field now only accepts new plan names (`LAUNCH`, `GROW`, `SCALE`). Passing legacy plan names (`FREE`, `PLUS`, `PRO`, `PREMIUM`) will return HTTP 400 `INVALID_PLAN_NAME` on all new subscription endpoints.
- All pricing amounts in responses are in USD. There are no PHP amounts in the new billing system.
- The `promo_applied` object in pricing and subscription responses is `null` if no promo is active.
- `payment_url` in the subscribe response is only present for payment flows that require a redirect (Xendit invoice, Stripe Checkout). For direct debit flows, it may be absent.

---

## Idempotency and Concurrency Notes

- `POST /admin/migration/execute`: Protected by an internal job lock. Calling while a job is running returns HTTP 409. Safe to retry after job completion (idempotency guard is built into the job itself — already-migrated merchants are skipped).
- `POST /billing/plans/subscribe/:store_id`: Not idempotent by default. Callers should check for an `ACTIVE_SUBSCRIPTION_EXISTS` error before retrying.
- `POST /rewards/`: Not idempotent by name — calling with the same `promo_code_name` twice returns `PROMO_CODE_EXISTS`. Use `PUT /rewards/:reward_id` to update.
- `migration_audit_log` writes: Each migration operation writes exactly one audit record. Re-runs of the migration job do not overwrite existing audit records; they add a new record for the re-run.

---

## Security and Privacy Notes

- All migration admin endpoints must validate the admin JWT on every request. No caching of authorization decisions.
- The `migration_audit_log` contains `merchant_name` and `store_id`. Access is restricted to admin users only.
- The rollback confirmation token must be short-lived (5 minutes) and single-use.
- `isSuspended`, `suspendedAt`, and `suspendedReason` are internal fields and must not be exposed in public-facing merchant APIs beyond what is necessary for the lock screen.
- The `SuspensionPage` on the storefront must not expose internal system fields (e.g., `store_id`, `suspendedReason`) to end customers.

---

## Domain Events and Webhooks

| Event | Trigger | Payload Fields |
|---|---|---|
| `merchant.suspended` | `suspendMerchant()` called | `store_id`, `reason`, `suspended_at`, `last_active_plan` |
| `merchant.reactivated` | Successful plan subscription after suspension | `store_id`, `plan`, `gateway`, `reactivated_at` |
| `migration.job.started` | `migration-bulk-executor` begins | `job_id`, `started_at`, `dry_run` |
| `migration.job.completed` | `migration-bulk-executor` finishes | `job_id`, `completed_at`, `total`, `succeeded`, `failed`, `skipped` |
| `migration.job.halted` | Failure rate exceeds threshold | `job_id`, `failure_rate_pct`, `halted_at` |
| `subscription.created` | New subscription created via `billing.subscribe` | `store_id`, `plan`, `gateway`, `amount_due`, `promo_applied` |
| `subscription.cancelled` | Cancellation confirmed | `store_id`, `access_until`, `suspension_date` |

---

## SDK and Integration Examples

### Check if merchant is suspended (Merchant Dashboard route guard)

```js
const store = await businessProfileApi.getStore(storeId);
if (store.payPlanType === 'SUSPENDED' || store.isSuspended) {
  router.replace('/suspended');
  return;
}
```

### Get pricing with promo before showing plan selection

```js
const pricing = await paymentApi.getPlanPricingBreakdown('LAUNCH', {
  store_id: storeId,
  billing_type: 'MONTHLY',
});
// pricing.promo_applied?.code → "OG-MERCHANT-2026"
// pricing.amount_due_this_cycle → 14.50
```

### Subscribe suspended merchant to plan

```js
const result = await billingApi.subscribe(storeId, {
  plan: 'LAUNCH',
  billing_type: 'MONTHLY',
  payment_gateway: 'STRIPE',
  promo_code: promoCode,
});
// Redirect merchant to result.payment_url to complete payment
window.location.href = result.payment_url;
```

### Trigger migration job (admin, T-0)

```js
// Dry run first
const dryRun = await adminApi.executeMigration({ dry_run: true });
console.log('Estimated merchants:', dryRun.estimated_merchants);

// Execute for real
const job = await adminApi.executeMigration({ dry_run: false, batch_size: 100 });
console.log('Monitor at:', job.monitor_url);
```

---

## How to Use This API Safely

1. **Before T-0:** Always run `POST /admin/migration/execute` with `dry_run: true` to estimate scope without making any changes.
2. **Monitor actively:** Poll `GET /admin/migration/stats` every 30 seconds during T-0 execution, or use server-sent events if available.
3. **Plan selection UX:** Always call `GET /plansubscriptions/pricing/:plan?store_id=...` before presenting plan selection to merchants so they see accurate pricing with any applicable promo codes.
4. **Promo code timing:** Create the OG Merchant promo code before running `migration-promo-applicator` at T-60. Verify the promo is active and correctly configured.
5. **Rollback token:** Generate the rollback confirmation token only when needed; it expires in 5 minutes. Do not generate proactively.
6. **Idempotency:** It is safe to re-run the migration job if it fails partway through. The job skips already-migrated merchants automatically.

---

## Change Impact

| Component | Nature of Change | Risk Level |
|---|---|---|
| `Store.payPlanType` enum | Additive (new values added; legacy values kept) | Low |
| `Store` model | Additive (new fields: `suspendedAt`, `suspendedReason`, `lastActivePlan`, `isSuspended`, `dataRetentionDeadline`) | Low |
| `POST /billing/plans/subscribe/:store_id` | Modified (new plan names accepted; routes through Payment Abstraction Layer) | Medium |
| `POST /billing/plans/cancel/:store_id` | Behavior change (suspends instead of reverts to Free) | High — existing callers must be aware |
| `GET /plansubscriptions/pricing/:plan` | Modified (new plan names; USD pricing) | Medium |
| `createUpcomingInvoices()` cron | Behavior change (suspension instead of free revert on payment failure) | High |
| `revertToFreePlan()` | Removed/replaced by `suspendMerchant()` | High — all callers must be updated before T-0 |
| `POST /rewards/` | Additive (new tier values accepted) | Low |

---

## Open Questions

| ID | Question | Assumption |
|---|---|---|
| OEQ-1 | What is the exact `valid_from` date (T-60) and `valid_until` date (T-0 + 90 days) for the OG Merchant promo? | Placeholder: `valid_from = 2026-01-22`, `valid_until = 2026-06-21`. Must be replaced with actual T-0 date once confirmed. |
| OEQ-2 | Should `POST /admin/migration/execute` be a synchronous or asynchronous operation? | Assumed asynchronous — returns HTTP 202 immediately, job runs in background, progress via stats endpoint. |
| OEQ-3 | Does `GET /plansubscriptions/pricing/:plan` need to support legacy plan names for analytics dashboards that may still query old plans? | Assumed no — legacy plan names are not valid for new pricing queries. Separate analytics endpoints should be used for historical data. |
| OEQ-4 | Should the `migration_audit_log` expose a webhook or streaming endpoint for real-time monitoring, or is polling sufficient? | Assumed polling is sufficient for the T-0 window; SSE/webhook can be added in a future iteration. |
