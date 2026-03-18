---
id: st-04-suspended-account-state
title: PRD. ST-04 Suspended Account State
sidebar_label: ST-04 Suspended Account State
sidebar_position: 4
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-17
- Status: Draft
- Subtask ID: ST-04
- Initiative: Prosperna Pricing Restructuring

---

## Summary

The Suspended Account State introduces `SUSPENDED` as a new, first-class account status for Prosperna merchants. When a merchant's subscription lapses — via trial expiry, subscription cancellation (period end), payment failure, or Free Plan migration — the system calls `suspendMerchant()` to lock the merchant dashboard behind a full-screen plan selection paywall and replace the customer-facing storefront with a dedicated suspension page. All merchant data is preserved indefinitely. Reactivation is instant upon successful plan selection and payment.

---

## User Journey

### Happy Path

**Suspended Merchant Reactivating:**

1. Merchant's subscription lapses (any of the four triggers fires `suspendMerchant()`).
2. `payPlanType` is set to `'SUSPENDED'`; `isSuspended` set to `true`.
3. Merchant logs into their dashboard — route guard detects `payPlanType === 'SUSPENDED'` and redirects to `/suspended`.
4. Merchant sees the lock screen: context-specific heading based on `suspendedReason`, reassurance message ("All your data, products, and settings are safe"), three plan cards (Launch $29/mo, Grow $59/mo, Scale $149/mo), and a payment gateway selector.
5. Merchant selects a plan card and confirms payment gateway (auto-selected by `marketCountry`, overridable).
6. Payment flow initiates via Payment Abstraction Layer (Stripe or Xendit).
7. Payment succeeds → `reactivateMerchant(store_id, new_plan)` is called.
8. `payPlanType` updated to selected plan; `isSuspended` set to `false`.
9. Merchant is redirected from `/suspended` to dashboard home — full access restored.
10. Storefront goes live instantly — suspension page removed, normal store restored.
11. Reactivation confirmation email sent to merchant.

**Customer Visiting a Suspended Store:**

1. Customer navigates to any URL under the merchant's store domain.
2. Storefront middleware checks `isSuspended` flag — `true`.
3. Server returns HTTP `503 Service Temporarily Unavailable`.
4. `SuspensionPage` is rendered: warning icon, "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT" heading, body text, and merchant contact info (email, phone).
5. Customer sees the merchant's contact details and can reach out directly.

### Alternate and Failure Paths

| Scenario | Behavior |
|---|---|
| **Payment fails on reactivation attempt** | Payment Abstraction Layer (ST-01) handles the failure. Merchant remains on `/suspended`. Error shown on the lock screen payment flow. Merchant can retry. |
| **Merchant closes browser and comes back later** | Next login → route guard detects `SUSPENDED` → redirected to `/suspended` again. No change. |
| **Merchant manually types a dashboard URL (e.g., `/home/products`)** | Route guard intercepts and redirects to `/suspended`. No dashboard content rendered. |
| **Backend API call from suspended merchant** | `mustBeOnPaidPlan` middleware returns 403 with `ACCOUNT_SUSPENDED` error code. |
| **Customer visits a specific product page URL on suspended store** | All routes return 503 + SuspensionPage. No product content rendered. |
| **Merchant has `isTemporaryCloseEnabled = true` when suspended** | `isSuspended` takes priority. Customers see SuspensionPage, not StoreClosedModal. On reactivation, `isTemporaryCloseEnabled` remains as-is (not auto-cleared). |
| **Merchant contact info missing on suspension page** | Show only fields that exist. If both email and phone are missing, omit the "please contact" section entirely. |
| **Merchant reactivates after media moved to cold storage (> 6 months)** | Dashboard and storefront restore instantly. Media restoration runs in background (up to 24 hours). Merchant shown: "Some images are being restored and may take up to 24 hours to appear." |
| **`suspendMerchant()` called on already-suspended account** | Idempotent — no-op or updates reason if different. No duplicate processing. |

---

## Functional Requirements

### Suspension

| ID | Requirement |
|---|---|
| FR-1 | The system must support `'SUSPENDED'` as a valid value of `payPlanType` on the Store model. |
| FR-2 | The system must add the following nullable fields to the Store model: `isSuspended` (Boolean, default `false`), `suspendedAt` (Date), `suspendedReason` (String), `lastActivePlan` (String), `dataRetentionDeadline` (Date). |
| FR-3 | `suspendMerchant(store_id, reason)` must atomically: set `payPlanType` to `'SUSPENDED'`; set `isSuspended` to `true`; record `suspendedAt` as current timestamp; set `suspendedReason` to the provided reason; capture `lastActivePlan` from the current `payPlanType` before overwriting; compute `dataRetentionDeadline` as `suspendedAt + 6 months`; deactivate all marketplace add-ons; fire a suspension event to the analytics/audit log; trigger the relevant suspension email (via ST-14). |
| FR-4 | `suspendMerchant()` must accept exactly four reason values: `'trial_expired'`, `'cancelled'`, `'payment_failed'`, `'migration'`. |
| FR-5 | `suspendMerchant()` must NOT delete any data, must NOT disable the merchant's Cognito account, and must NOT set `isTemporaryCloseEnabled`. |
| FR-6 | `suspendMerchant()` must be idempotent — calling it on an already-suspended account must be a no-op (or update the reason field if different) without re-firing emails or events. |

### Merchant Dashboard Lock Screen

| ID | Requirement |
|---|---|
| FR-7 | The Merchant Dashboard (`prosperna1`) must implement a route guard on all authenticated routes that checks `payPlanType`. If `payPlanType === 'SUSPENDED'`, the merchant must be redirected to `/suspended`. |
| FR-8 | The `/suspended` route must render a full-screen lock page that is the only accessible page for a suspended merchant — no other dashboard route may be accessed. |
| FR-9 | The lock screen must display a context-specific heading based on `suspendedReason`: `trial_expired` → "Your trial has ended."; `cancelled` → "Your subscription has been cancelled."; `payment_failed` → "Your subscription payment failed."; `migration` → "The Free Plan has been retired." |
| FR-10 | The lock screen must display the reassurance message: "All your data, products, and settings are safe." |
| FR-11 | The lock screen must display three plan selection cards: Launch ($29/mo), Grow ($59/mo), Scale ($149/mo), each showing key limits (orders/month, SKUs, bandwidth, storage) and a "Select Plan" CTA button. |
| FR-12 | The lock screen must include a "Compare Plans in Detail" link that opens the plan comparison view (same component used in the trial flow, ST-03). |
| FR-13 | The lock screen must display a payment gateway selector showing all available gateways (currently Stripe and Xendit) with auto-selection based on `marketCountry` (US → Stripe, PH → Xendit). The merchant may override the selection. |
| FR-14 | On "Select Plan" click, the payment flow must initiate via the Payment Abstraction Layer (ST-01). On successful payment, `reactivateMerchant()` must be called. |

### Reactivation

| ID | Requirement |
|---|---|
| FR-15 | `reactivateMerchant(store_id, new_plan)` must atomically: set `payPlanType` to `new_plan`; set `isSuspended` to `false`; clear `suspendedAt`, `suspendedReason`, and `dataRetentionDeadline` to `null`; re-enable all native marketplace add-ons; reset all usage counters (orders, bandwidth, storage) to 0; start a new billing cycle from the reactivation date; remove SEO protections (noindex, 503, robots.txt Disallow); fire a reactivation event; trigger the "store is back online" confirmation email (ST-14). |
| FR-16 | `new_plan` must be one of: `'LAUNCH'`, `'GROW'`, `'SCALE'`. |
| FR-17 | After reactivation, the merchant must be redirected from `/suspended` to their dashboard home with full access restored within seconds. |
| FR-18 | Third-party paid marketplace add-ons (e.g., Lazada, Shopee) must NOT be auto-reactivated. The merchant must resubscribe manually. |
| FR-19 | If the merchant had `isTemporaryCloseEnabled = true` before suspension, that flag must remain unchanged after reactivation (not auto-cleared). |

### Customer-Facing Storefront

| ID | Requirement |
|---|---|
| FR-20 | The `p1-customer` storefront middleware must check `isSuspended` FIRST on every inbound request. If `isSuspended === true`, render the `SuspensionPage` and return HTTP 503. |
| FR-21 | The `SuspensionPage` component must render: a red warning icon; the heading "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT" (all uppercase, static); body text as specified; the merchant's `store.email` and `store.phone` in the contact section (if available). |
| FR-22 | If `store.email` is missing, the email line must be hidden. If `store.phone` is missing, the phone line must be hidden. If both are missing, the entire "please contact" section must be omitted. |
| FR-23 | Every URL under the suspended merchant's store domain must return HTTP 503 and render the SuspensionPage — no product, category, cart, or checkout pages may be accessible. |
| FR-24 | The `noindex, nofollow` meta tag must be injected into the SuspensionPage `<head>` when a store is suspended. |
| FR-25 | The `robots.txt` handler must dynamically return `Disallow: /` for all suspended stores. |
| FR-26 | When a store is reactivated, all SEO protections (503, noindex, robots.txt Disallow) must be removed immediately. |
| FR-27 | The `isSuspended` flag must take priority over `isTemporaryCloseEnabled`. Only if `isSuspended === false` should the storefront proceed to check `isTemporaryCloseEnabled` for the `StoreClosedModal`. |

### Backend Access Control

| ID | Requirement |
|---|---|
| FR-28 | The `mustBeOnPaidPlan` middleware must reject API requests from merchants where `payPlanType === 'SUSPENDED'`. Allowed values are: `['TRIAL', 'LAUNCH', 'GROW', 'SCALE']`. |
| FR-29 | The following endpoints must remain accessible to suspended merchants: authentication (login/logout); `GET /api/v1/suspension/status`; `POST /api/v1/subscription/reactivate`; store document read (to populate the lock screen). |
| FR-30 | `POST /api/v1/orders/create` must check `isSuspended` and reject with 403 if true (no new orders on suspended stores). |

### Data Retention

| ID | Requirement |
|---|---|
| FR-31 | All merchant data (products, orders, store design, customer data, marketplace add-on configs, account credentials) must be preserved indefinitely during suspension — no automatic deletion due to suspension alone. |
| FR-32 | The `media-cold-storage-mover` background job must run weekly, find all stores where `isSuspended === true` AND `dataRetentionDeadline < now`, and move their media files to cold storage. |
| FR-33 | Analytics data for suspended stores must be archived (not deleted) after 12 months from suspension. |
| FR-34 | On reactivation after cold storage migration, the system must trigger media restoration (up to 24 hours) and notify the merchant of the restoration window. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Performance.** Reactivation must complete (dashboard unlocked, store live) within 5 seconds of successful payment confirmation. |
| NFR-2 | **Availability.** The `/suspended` lock screen and `SuspensionPage` must be available 24/7 — a suspended merchant must always be able to reach the paywall to reactivate. |
| NFR-3 | **Idempotency.** Both `suspendMerchant()` and `reactivateMerchant()` must be idempotent — safe to call multiple times without side effects. |
| NFR-4 | **Atomicity.** State changes in `suspendMerchant()` and `reactivateMerchant()` must be transactional — a partial write must not leave the store in an inconsistent state. |
| NFR-5 | **Security.** The route guard in `prosperna1` and the `mustBeOnPaidPlan` middleware in the API are both required. Neither alone is sufficient — defense in depth. |
| NFR-6 | **SEO — 503 not 404.** Suspended stores must return HTTP 503 (not 200, 301, or 404) on all routes to preserve search engine indexing equity. |
| NFR-7 | **Audit trail.** Every suspension and reactivation event must be logged with `store_id`, `reason`, `timestamp`, and acting entity (background job name or user ID). |
| NFR-8 | **Scalability.** The `media-cold-storage-mover` job must handle batch processing — avoid loading all suspended stores into memory at once. Process in pages of ≤ 100 records. |
| NFR-9 | **Observability.** Suspension and reactivation events must emit structured logs consumable by the Prosperna monitoring stack. Alert on anomalies (e.g., mass suspension spike). |

---

## UX Notes

- The lock screen is a **full-page view** at `/suspended`, not a modal or overlay. It replaces the entire dashboard shell.
- The heading is the first thing the merchant reads — it must be specific to why they were suspended, not generic.
- The reassurance message ("All your data, products, and settings are safe") must appear on every lock screen, regardless of reason.
- Plan cards follow the same visual design as the trial-to-paid conversion page (ST-03) for visual consistency.
- The "RECOMMENDED" badge appears on the plan card most appropriate for the merchant's usage; logic TBD with stakeholders (defaults to `lastActivePlan` tier or next tier up).
- The payment gateway selector must clearly show which gateway is auto-selected and why (e.g., a subtle "Recommended for your region" label).
- The SuspensionPage on the storefront must use a dark background with a white card — visually distinct from the merchant's brand to make it clear this is a system message, not merchant content.
- "Powered by Prosperna" appears in the footer of both the lock screen and the SuspensionPage.

---

## Data Model Notes

### Store Model Updates (`business-profile-api/src/models/Store.model.ts`)

**New fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `isSuspended` | Boolean | `false` | Primary flag; storefront checks this first |
| `suspendedAt` | Date (nullable) | `null` | Timestamp of suspension |
| `suspendedReason` | String (nullable) | `null` | `'trial_expired'` \| `'cancelled'` \| `'payment_failed'` \| `'migration'` |
| `lastActivePlan` | String (nullable) | `null` | `payPlanType` value before suspension |
| `dataRetentionDeadline` | Date (nullable) | `null` | `suspendedAt + 6 months` — triggers media cold storage |

**Modified fields:**

| Field | Change |
|---|---|
| `payPlanType` | Add `'SUSPENDED'` to allowed enum values |

### New Collection — `subscription_cancellations` (`payment-integration-api`)

| Field | Type | Description |
|---|---|---|
| `merchant_id` | ObjectId | Reference to store |
| `store_id` | String | Store identifier |
| `previous_plan` | String | Plan before cancellation |
| `cancellation_reason` | String | Reason selected during cancellation |
| `cancellation_reason_detail` | String | Free-text detail (if "Other" selected) |
| `cancellation_date` | Date | When cancellation was confirmed |
| `effective_date` | Date | End of billing period — when suspension triggers |
| `counter_offer_shown` | String (nullable) | What counter-offer was presented |
| `counter_offer_accepted` | Boolean | Whether counter-offer was accepted |
| `resubscribed` | Boolean | Whether merchant voided cancellation |
| `resubscription_date` | Date (nullable) | When they resubscribed (if applicable) |
| `resubscribed_plan` | String (nullable) | Plan they resubscribed to |

---

## Integrations and APIs

| Integration | Direction | Purpose |
|---|---|---|
| **Payment Abstraction Layer (ST-01)** | Lock screen → PAL | Initiates Stripe or Xendit payment flow on plan selection |
| **ST-01 Webhook Handler** | PAL → `suspendMerchant()` | `invoice.payment_failed` (Stripe) or failure callback (Xendit) triggers suspension |
| **Email Notification Service (ST-14)** | `suspendMerchant()` / `reactivateMerchant()` → Email | Triggers suspension and reactivation email templates |
| **Media Service API** | `media-cold-storage-mover` → Cold Storage | Moves merchant media files to cold storage after 6-month suspension |
| **Cognito (AWS)** | Auth remains active | Suspended merchant Cognito accounts must remain active so merchants can log in |
| **Analytics / Audit Log** | `suspendMerchant()` / `reactivateMerchant()` → Analytics | Emits structured events for monitoring and reporting |

---

## Error Handling

| Scenario | Error Code | HTTP Status | Behavior |
|---|---|---|---|
| Suspended merchant calls protected API endpoint | `ACCOUNT_SUSPENDED` | 403 | Return error with message directing merchant to reactivate |
| Order creation attempted on suspended store | `STORE_SUSPENDED` | 403 | Reject order; store is offline |
| Customer visits suspended store URL | — | 503 | Return SuspensionPage; no error code in body |
| Payment fails during reactivation attempt | Delegated to PAL | 402 / 422 | Show error on lock screen payment UI; merchant remains on `/suspended` |
| `suspendMerchant()` called with invalid reason | `INVALID_SUSPENSION_REASON` | 400 | Log and reject; do not suspend |
| `reactivateMerchant()` called with invalid plan | `INVALID_PLAN` | 400 | Log and reject; do not reactivate |
| `suspendMerchant()` called on non-existent store | `STORE_NOT_FOUND` | 404 | Log and reject |

---

## Telemetry and Analytics

| Event | Trigger | Properties |
|---|---|---|
| `merchant_suspended` | `suspendMerchant()` completes | `store_id`, `reason`, `previous_plan`, `timestamp` |
| `merchant_reactivated` | `reactivateMerchant()` completes | `store_id`, `new_plan`, `previous_reason`, `days_suspended`, `timestamp` |
| `lock_screen_viewed` | Merchant hits `/suspended` route | `store_id`, `suspension_reason`, `session_id` |
| `plan_selected_on_lock_screen` | Merchant clicks "Select Plan" | `store_id`, `selected_plan`, `selected_gateway` |
| `lock_screen_payment_succeeded` | Payment success on lock screen | `store_id`, `plan`, `gateway`, `amount` |
| `lock_screen_payment_failed` | Payment failure on lock screen | `store_id`, `plan`, `gateway`, `error_code` |
| `suspension_page_viewed` | Customer hits suspended store URL | `store_id`, `url_path`, `referrer` |
| `media_cold_storage_moved` | `media-cold-storage-mover` job processes a store | `store_id`, `file_count`, `bytes_moved`, `timestamp` |

---

## Rollout Plan

| Phase | Scope | Notes |
|---|---|---|
| **Phase 1 — Backend foundation** | Implement `suspendMerchant()` and `reactivateMerchant()`, Store model schema changes, `mustBeOnPaidPlan` middleware update, new API endpoints | Can be deployed behind a feature flag; no visible change until frontend integrates |
| **Phase 2 — Merchant Dashboard lock screen** | `/suspended` route and lock screen UI in `prosperna1`, route guard | Requires Phase 1 backend and ST-01 PAL |
| **Phase 3 — Customer storefront** | `SuspensionPage` component, storefront middleware, SEO protections in `p1-customer` | Can be deployed independently of Phase 2 |
| **Phase 4 — Integration and E2E testing** | End-to-end: trigger suspension via test account → see lock screen → reactivate → verify restore | Requires Phase 1, 2, and 3 complete |
| **Phase 5 — Background jobs** | `media-cold-storage-mover` job | Can be deployed after Phase 1 with dry-run verification first |
| **Migration** | ST-16 bulk job calls `suspendMerchant('migration')` for all Free Plan merchants on Migration Day | Depends on this subtask being fully deployed |

---

## Open Questions

| ID | Question | Owner | Status |
|---|---|---|---|
| OQ-01 | What is the exact logic for the "RECOMMENDED" badge on plan cards during suspension? Default to `lastActivePlan` or next tier up? | Product / Stakeholders | Open |
| OQ-02 | Should suspended merchants receive in-app notifications (push/banner) in addition to email on suspension? | Product | Open |
| OQ-03 | Does the lock screen need a "contact support" link for merchants who believe their suspension is in error? | Product / Legal | Open |
| OQ-04 | Are there any scenarios where a suspended merchant should be able to access balance withdrawal (e.g., regulatory requirement)? | Legal / Finance | Open — stakeholder decision is currently "no" but legal review recommended |
| OQ-05 | Should the `subscription_cancellations` collection be created in `payment-integration-api` or `business-profile-api`? | Engineering | Open |

---

# Gherkin User Stories

## Feature: Suspended Account State

### Scenario: Merchant dashboard redirects to lock screen when account is suspended
```gherkin
Feature: Suspended Account State

  Scenario: Suspended merchant is redirected to lock screen on login
    Given a merchant account with payPlanType "SUSPENDED"
    When the merchant authenticates and attempts to access any dashboard route
    Then the merchant is redirected to "/suspended"
    And the lock screen is the only page rendered
    And no other dashboard route is accessible
```

### Scenario: Lock screen displays correct heading by suspension reason
```gherkin
  Scenario Outline: Lock screen shows context-specific heading
    Given a merchant account is suspended with suspendedReason "<reason>"
    When the merchant views the "/suspended" lock screen
    Then the heading displayed is "<expected_heading>"
    And the message "All your data, products, and settings are safe." is visible

    Examples:
      | reason          | expected_heading                                    |
      | trial_expired   | Your trial has ended.                               |
      | cancelled       | Your subscription has been cancelled.               |
      | payment_failed  | Your subscription payment failed.                   |
      | migration       | The Free Plan has been retired.                     |
```

### Scenario: Lock screen shows three plan cards with correct pricing
```gherkin
  Scenario: Lock screen displays all three plan cards
    Given a suspended merchant is on the "/suspended" lock screen
    Then the lock screen shows plan cards for "Launch", "Grow", and "Scale"
    And the "Launch" card shows "$29/mo", 200 orders, 500 SKUs, 25 GB bandwidth, 10 GB storage
    And the "Grow" card shows "$59/mo", 750 orders, 2000 SKUs, 75 GB bandwidth, 30 GB storage
    And the "Scale" card shows "$149/mo", 2500 orders, 10000 SKUs, 150 GB bandwidth, 100 GB storage
    And each card has a "Select Plan" button
```

### Scenario: Successful reactivation unlocks dashboard and restores storefront
```gherkin
  Scenario: Merchant reactivates by selecting a plan and paying
    Given a suspended merchant is on the "/suspended" lock screen
    When the merchant selects the "Grow" plan
    And the merchant selects "Stripe" as the payment gateway
    And payment is completed successfully
    Then reactivateMerchant() is called with new_plan "GROW"
    And payPlanType is updated to "GROW"
    And isSuspended is set to false
    And suspendedAt is null
    And suspendedReason is null
    And the merchant is redirected to the dashboard home
    And the merchant has full dashboard access
    And the merchant's store is live on the storefront
    And a reactivation confirmation email is sent
```

### Scenario: Failed payment on reactivation keeps merchant on lock screen
```gherkin
  Scenario: Payment fails during reactivation attempt
    Given a suspended merchant is on the "/suspended" lock screen
    When the merchant selects the "Launch" plan and initiates payment
    And the payment fails
    Then the merchant remains on the "/suspended" lock screen
    And an error message is displayed
    And the merchant can retry payment
```

### Scenario: API call from suspended merchant is rejected
```gherkin
  Scenario: Suspended merchant's API call is blocked by middleware
    Given a merchant account has payPlanType "SUSPENDED"
    When the merchant's client makes a request to a protected API endpoint
    Then the API returns HTTP 403
    And the response error code is "ACCOUNT_SUSPENDED"
```

### Scenario: Customer visits a suspended store
```gherkin
  Scenario: Customer visits any URL on a suspended store
    Given a merchant's store has isSuspended set to true
    When a customer visits any URL under the merchant's store domain
    Then the response HTTP status is 503
    And the SuspensionPage is rendered
    And the heading "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT" is visible
    And the merchant's contact email is displayed (if present)
    And the merchant's contact phone is displayed (if present)
    And no product, category, cart, or checkout content is accessible
```

### Scenario: Customer visits suspended store with missing contact info
```gherkin
  Scenario Outline: SuspensionPage contact info fallback
    Given a merchant's store has isSuspended set to true
    And store.email is "<email_value>"
    And store.phone is "<phone_value>"
    When a customer visits the store
    Then the contact section renders as "<contact_section_result>"

    Examples:
      | email_value    | phone_value      | contact_section_result              |
      | test@email.com | +63 912 345 6789 | Shows both email and phone          |
      | test@email.com | (empty)          | Shows email only, no phone line     |
      | (empty)        | +63 912 345 6789 | Shows phone only, no email line     |
      | (empty)        | (empty)          | Contact section omitted entirely    |
```

### Scenario: Suspension page SEO protections are applied
```gherkin
  Scenario: SEO protections are active on suspended store
    Given a merchant's store has isSuspended set to true
    When a web crawler requests any URL under the store domain
    Then the HTTP response status is 503
    And the page <head> contains <meta name="robots" content="noindex, nofollow">
    And the robots.txt returns "Disallow: /"
```

### Scenario: SEO protections removed on reactivation
```gherkin
  Scenario: SEO protections are removed when store is reactivated
    Given a merchant's store was suspended (isSuspended was true)
    When the merchant successfully reactivates via plan selection and payment
    Then the storefront returns HTTP 200 for store routes
    And the noindex meta tag is removed from page <head>
    And robots.txt returns normal allow rules
```

### Scenario: Suspension takes priority over Temporary Close
```gherkin
  Scenario: isSuspended overrides isTemporaryCloseEnabled
    Given a merchant's store has isSuspended set to true
    And isTemporaryCloseEnabled is set to true
    When a customer visits the store
    Then the SuspensionPage is rendered (not the StoreClosedModal)
    And the HTTP status is 503
```

### Scenario: isTemporaryCloseEnabled not cleared on reactivation
```gherkin
  Scenario: Reactivation does not alter isTemporaryCloseEnabled
    Given a merchant's store has isSuspended true AND isTemporaryCloseEnabled true
    When the merchant reactivates successfully
    Then isSuspended is set to false
    And isTemporaryCloseEnabled remains true (unchanged)
    And the merchant must manually disable Temporary Close
```

### Scenario: Native add-ons auto-reactivate on reactivation
```gherkin
  Scenario: Native marketplace add-ons are auto-enabled on reactivation
    Given a suspended merchant had native add-ons (blog, order-scheduling) active before suspension
    When the merchant reactivates
    Then all native marketplace add-ons are automatically re-enabled
    And third-party paid add-ons (Lazada, Shopee) remain deactivated
    And the merchant must manually resubscribe to paid add-ons
```

### Scenario: suspendMerchant is idempotent
```gherkin
  Scenario: Calling suspendMerchant on already-suspended account is a no-op
    Given a merchant account is already suspended with suspendedReason "payment_failed"
    When suspendMerchant() is called again for the same store with reason "payment_failed"
    Then no duplicate events are fired
    And no duplicate emails are sent
    And the store's suspended state is unchanged
```

### Scenario: Media cold storage restoration after long suspension
```gherkin
  Scenario: Media files are restored when merchant reactivates after cold storage move
    Given a merchant's store has been suspended for more than 6 months
    And the media-cold-storage-mover has moved their files to cold storage
    When the merchant reactivates
    Then the dashboard and storefront are restored immediately
    And media restoration begins in the background
    And the merchant receives a notification: "Some images are being restored and may take up to 24 hours to appear."
```

### Scenario: Merchant with unfulfilled orders is suspended
```gherkin
  Scenario: Merchant cannot fulfill orders while suspended
    Given a merchant has 3 unfulfilled orders
    And the merchant's account is suspended (trial expiry)
    When the suspended merchant attempts to access the orders dashboard
    Then the merchant is redirected to "/suspended"
    And the unfulfilled orders remain in the system (data preserved)
    And the merchant must reactivate to access and fulfill the orders
```

### Scenario: Usage counters and billing cycle reset on reactivation
```gherkin
  Scenario: New billing cycle starts on reactivation
    Given a merchant reactivates to the "Scale" plan
    Then the billing cycle start date is the reactivation date
    And order usage counter is reset to 0
    And bandwidth usage counter is reset to 0
    And storage usage counter is reset to 0
    And usage is NOT carried over from any previous billing period
```

---

# Traceability Map

| Functional Requirement | Gherkin Scenario(s) |
|---|---|
| FR-1 (`SUSPENDED` enum value) | Merchant dashboard redirects to lock screen when account is suspended |
| FR-2 (Store model new fields) | Successful reactivation unlocks dashboard; Media cold storage restoration |
| FR-3 (`suspendMerchant()` steps) | Merchant dashboard redirects; Merchant with unfulfilled orders; suspendMerchant is idempotent |
| FR-4 (Valid reason values) | Lock screen displays correct heading by suspension reason |
| FR-5 (suspendMerchant must-NOT rules) | Lock screen accessible → merchant can log in; suspension page SEO |
| FR-6 (suspendMerchant idempotent) | suspendMerchant is idempotent |
| FR-7 (Route guard — all routes) | Merchant dashboard redirects; Merchant with unfulfilled orders |
| FR-8 (`/suspended` only accessible route) | Merchant dashboard redirects; API call from suspended merchant is rejected |
| FR-9 (Context-specific heading) | Lock screen displays correct heading by suspension reason |
| FR-10 (Reassurance message) | Lock screen displays correct heading by suspension reason |
| FR-11 (Plan cards with limits) | Lock screen shows three plan cards with correct pricing |
| FR-12 (Compare Plans link) | Lock screen shows three plan cards with correct pricing |
| FR-13 (Payment gateway selector) | Successful reactivation unlocks dashboard |
| FR-14 (Plan selection → PAL → reactivation) | Successful reactivation; Failed payment on reactivation |
| FR-15 (`reactivateMerchant()` steps) | Successful reactivation unlocks dashboard; SEO protections removed; Usage counters reset |
| FR-16 (Valid new_plan values) | Successful reactivation unlocks dashboard |
| FR-17 (Redirect to home on reactivation) | Successful reactivation unlocks dashboard |
| FR-18 (Paid add-ons not auto-reactivated) | Native add-ons auto-reactivate on reactivation |
| FR-19 (isTemporaryCloseEnabled unchanged) | isTemporaryCloseEnabled not cleared on reactivation |
| FR-20 (Storefront middleware checks isSuspended first) | Customer visits suspended store; Suspension takes priority over Temporary Close |
| FR-21 (SuspensionPage content) | Customer visits a suspended store |
| FR-22 (Contact info fallback) | Customer visits suspended store with missing contact info |
| FR-23 (All routes → 503 + SuspensionPage) | Customer visits a suspended store (any URL) |
| FR-24 (noindex meta tag) | Suspension page SEO protections are applied |
| FR-25 (robots.txt Disallow) | Suspension page SEO protections are applied |
| FR-26 (SEO protections removed on reactivation) | SEO protections removed on reactivation |
| FR-27 (isSuspended > isTemporaryCloseEnabled) | Suspension takes priority over Temporary Close |
| FR-28 (`mustBeOnPaidPlan` middleware) | API call from suspended merchant is rejected |
| FR-29 (Accessible endpoints while suspended) | Successful reactivation unlocks dashboard; Merchant can reach lock screen |
| FR-30 (Order creation blocked) | Customer visits suspended store; Merchant with unfulfilled orders |
| FR-31 (Data preserved indefinitely) | Merchant with unfulfilled orders; Media cold storage restoration |
| FR-32 (`media-cold-storage-mover` job) | Media cold storage restoration after long suspension |
| FR-33 (Analytics archival at 12 months) | (Covered by NFR-7 audit trail — no direct scenario; internal job) |
| FR-34 (Cold storage restoration notification) | Media cold storage restoration after long suspension |
