---
id: st-09-marketplace-addons-native-free
title: PRD. ST-09 Marketplace Add-Ons — Native Apps Become Free
sidebar_label: ST-09 Marketplace Add-Ons — Native Apps Become Free
sidebar_position: 9
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-22
- Status: Draft
- Parent Initiative: Prosperna Pricing Restructuring v3
- Subtask ID: ST-09

---

## Summary

This document specifies the product and technical requirements to transition all natively built Prosperna Marketplace add-ons from paid subscriptions to free one-click activations. Only 3rd-party integrations (Lazada, Shopee) retain their paid subscription model. The change covers: a backend constant update, a payment-flow bypass for native apps, Marketplace UI changes, a one-time migration for existing paid subscribers, Agenda job updates, suspension/reactivation behavior, and an order paywall update for Announcements.

---

## User Journey

### Happy Path — New Merchant Activates a Native App

1. Merchant (LAUNCH/GROW/SCALE/TRIAL plan) logs into the Merchant Dashboard.
2. Navigates to **Left Sidebar → Marketplace**.
3. Sees a grid of apps. Native apps (Blogs, Wholesale, etc.) display **"Free — Activate"** with no pricing tiers shown.
4. Merchant clicks **"Free — Activate"** on Blogs.
5. No payment form is shown. No invoice is created. No subscription record is created.
6. `business-profile-api` activates the Blogs app key on the store document.
7. Merchant sees the app card update to **"Active"** with a Deactivate option.
8. Blog management features appear in the dashboard. Blog pages render on the merchant's online store.

### Happy Path — Merchant Subscribes to Lazada (Unchanged Flow)

1. PH Merchant (GROW plan) navigates to **Marketplace → Lazada**.
2. Sees Lazada pricing tiers (Monthly/Quarterly/Annual) and a **"Subscribe"** button.
3. Selects Monthly, proceeds to Xendit payment (eWallet or Credit Card).
4. Payment succeeds → Xendit webhook → Lazada activated on store.
5. Marketplace invoice generated. Paywall quota assigned.

### Happy Path — Merchant Deactivates a Free Native App

1. Merchant navigates to **Marketplace → Wholesale** (currently active).
2. Clicks **"Deactivate"**.
3. No billing action occurs (there is no subscription to cancel).
4. Wholesale features disappear from dashboard and storefront.
5. Merchant can reactivate at any time with one click.

### Happy Path — One-Time Migration (Existing Paid Native Subscriber)

1. Migration script runs (scheduled or manually triggered by ops).
2. For each merchant with an active paid subscription for a native app:
   a. Xendit recurring plan is cancelled (no further charges).
   b. App activation status on the store is preserved (app stays enabled).
   c. Subscription record is updated to `INACTIVE` with reason `migrated_to_free`.
3. Notification email is sent: "Great news! [App Name] is now free. Your subscription has been cancelled and you won't be charged again. The feature remains active."
4. Merchant's next expected renewal date passes with no charge and no invoice.

### Happy Path — Suspended Merchant Reactivation

1. Merchant's account is suspended (failed payment on core plan).
2. Suspension logic deactivates all marketplace apps — both native (Blogs, Wholesale, etc.) and paid (Lazada, Shopee).
3. Merchant selects a new plan and pays.
4. Dashboard unlocks. Native apps that were active before suspension are **auto-reactivated**.
5. Lazada/Shopee show "Subscribe" — merchant must manually resubscribe.

---

### Alternate and Failure Paths

| Scenario | Trigger | System Behavior |
|---|---|---|
| Merchant on FREE plan attempts to activate a native app | Merchant is on FREE (no paid plan) | Activation blocked — display plan upgrade prompt |
| Merchant attempts to use promo code on native app | Promo code entry attempted on native app | Not applicable — there is no payment form for native apps |
| Xendit cancellation fails during migration | Xendit API error or timeout | Log failure per merchant per app; skip to next; flagged for manual retry. App remains active regardless. |
| Native app activation API call fails | `business-profile-api` error | Return error to frontend; show failure message; do not show "Active" status |
| Merchant deactivates Lazada mid-subscription cycle | Merchant clicks Deactivate on Lazada | Existing paid subscription unsubscribe flow executed (FR-15); paywall quota records cleared |
| `additionalFee` activation on FREE plan | Merchant without paid plan tries to activate | Blocked by `mustBeOnPaidPlan` middleware — 403 error returned |
| Suspended merchant tries to activate any app | Merchant is suspended (locked out of dashboard) | Dashboard lock screen displayed (ST-04) — no app action possible |

---

## Functional Requirements

### Classification and Constants

**FR-1** — The system shall maintain a constant `PAID_MARKETPLACE_APP_KEYS` in `payment-integration-api/src/constants/marketplace.ts` that contains only `['lazada', 'shopee']`. All other app keys shall be treated as free.

**FR-2** — The system shall determine whether a marketplace app requires a paid subscription exclusively by checking membership in `PAID_MARKETPLACE_APP_KEYS`. No other code-level classification mechanism shall be introduced.

### Native App Activation (Free Path)

**FR-3** — When a merchant activates a native app (app key NOT in `PAID_MARKETPLACE_APP_KEYS`), the system shall skip all payment flow steps: no Xendit invoice creation, no Stripe invoice creation, no promo code validation, no subscription record creation, no invoice record creation.

**FR-4** — On native app activation, the system shall call `business-profile-api` to add the app key to the store's active marketplace apps configuration, completing activation immediately.

**FR-5** — On native app activation, the system shall return a success response to the frontend. No payment receipt, no billing confirmation — only an activation confirmation.

**FR-6** — Native app activation shall be available to merchants on TRIAL, LAUNCH, GROW, and SCALE plans. FREE plan merchants are blocked.

**FR-7** — The `additionalFee` app shall continue to require a paid plan (`mustBeOnPaidPlan` middleware) and shall not be affected by this change (it was already free before this subtask).

### Native App Deactivation (Free Path)

**FR-8** — When a merchant deactivates a native app, the system shall call `business-profile-api` to remove the app key from the store's active marketplace apps. No billing action shall occur.

### 3rd-Party App Subscription (Paid Path — Unchanged)

**FR-9** — For app keys in `PAID_MARKETPLACE_APP_KEYS` (lazada, shopee), the existing paid subscription flow via **Xendit only** shall remain unchanged. This includes: pricing tier display, payment collection (eWallet or Credit Card), invoice generation, subscription record creation, Xendit recurring plan setup, and renewal logic.

**FR-10** — Promo codes with `apply_to: 'Add-on Subscriptions'` shall only be applicable during checkout for Lazada and Shopee (the only remaining paid marketplace apps). No code change is required — promo code validation naturally occurs only in the payment flow which native apps bypass.

### Marketplace UI

**FR-11** — The Marketplace listing page shall display native apps (app keys NOT in `PAID_MARKETPLACE_APP_KEYS`) with a **"Free — Activate"** button (or "Activate" button with a "Free" badge). No pricing tier information shall be shown for native apps.

**FR-12** — The Marketplace listing page shall display Lazada and Shopee with their existing **"Subscribe"** CTA and pricing tiers unchanged.

**FR-13** — If a native app is already active on the store, the app card shall display an "Active" status with a **"Deactivate"** option instead of the "Free — Activate" button.

**FR-14** — The `CancelAddonSubscriptionModal` component shall be conditionally hidden or replaced for native apps, since there is no subscription to cancel for a free native app.

### 3rd-Party App Unsubscription

**FR-15** — The existing unsubscribe flow for Lazada and Shopee shall remain unchanged: cancels Xendit subscription, deactivates app, stops billing.

### One-Time Migration

**FR-16** — A one-time migration script shall identify all merchants with active paid subscriptions for native apps (app keys that were in the old `PAID_MARKETPLACE_APP_KEYS` but are not `lazada` or `shopee`).

**FR-17** — For each identified subscription, the migration script shall: (a) cancel the Xendit recurring plan or invoice cycle so no further charges occur; (b) preserve the app's active status on the store — the feature must not be interrupted; (c) update the marketplace subscription record status to `INACTIVE` with reason `migrated_to_free`.

**FR-18** — The migration shall NOT delete historical invoice records or subscription records.

**FR-19** — For each affected merchant, the migration shall trigger a notification email via `email-service-api` informing them: the named app is now free, their subscription is cancelled, no future charges will occur, and the feature remains active.

### Agenda Jobs

**FR-20** — The `SCHEDULE_ADDON_EXPIRED_INTEGRATION` Agenda job shall be updated to skip processing for app keys NOT in `PAID_MARKETPLACE_APP_KEYS`. Free native apps do not expire.

**FR-21** — The `SCHEDULE_ADDON_EXPIRE_BELL_NOTIF` Agenda job shall be updated to skip sending expiry notifications for app keys NOT in `PAID_MARKETPLACE_APP_KEYS`. Free native apps do not have renewal cycles.

**FR-22** — The `UPDATE_ADDON_SUBSCRIPTION_STATUS` Agenda job shall be reviewed and updated to reflect new plan name references (LAUNCH/GROW/SCALE instead of PLUS/PRO/PREMIUM) per ST-01, and to correctly skip status updates for now-free native apps.

### Order Paywall

**FR-23** — The Announcements app (currently tracked by the Order Paywall system) shall be transitioned to an unlimited quota upon becoming free. Existing paywall records for Announcements shall be updated to the equivalent "Gold" tier (unlimited). New Announcements activations shall not generate quota-limited paywall records.

### Suspension and Reactivation

**FR-24** — On account suspension (per ST-04), ALL marketplace apps on the store — both native (free) and 3rd-party (paid) — shall be deactivated. The set of apps active at suspension time shall be recorded for potential restoration.

**FR-25** — On reactivation from suspension (merchant selects a new plan and pays), all native marketplace apps that were active prior to suspension shall be **automatically reactivated** without requiring payment.

**FR-26** — On reactivation from suspension, 3rd-party marketplace apps (Lazada, Shopee) shall NOT be auto-reactivated. The merchant must manually resubscribe. The Marketplace page shall indicate that these apps require a new subscription.

**FR-27** — The merchant shall receive a notification upon reactivation listing which apps were auto-restored and which require manual resubscription.

### Admin and Historical Data

**FR-28** — Historical marketplace invoices for now-free native apps shall remain visible in the Admin Control Platform's **Marketplace Invoices** tab (Admin → Accounts → [Merchant] → Invoices). The existing tab and API endpoint remain unchanged.

**FR-29** — No new marketplace invoices shall be generated for native app activations going forward.

---

## Non-Functional Requirements

**NFR-1** — **Data Preservation**: No historical marketplace invoice records, subscription records, Xendit recurring plan records, or order paywall records shall be deleted during or after migration.

**NFR-2** — **Availability during migration**: The migration shall be designed to run without downtime. App activation status must be preserved throughout. If any step fails for a merchant, it shall be logged and retried without affecting other merchants.

**NFR-3** — **Activation latency**: Native app activation (FR-3–FR-5) shall complete and return a response to the frontend in under 2 seconds under normal load.

**NFR-4** — **Migration idempotency**: The migration script shall be idempotent — running it twice for the same merchant shall not result in double-notification or double-cancellation.

**NFR-5** — **Notification delivery**: Merchant notification emails (FR-19, FR-27) shall achieve ≥ 95% delivery rate. Failed deliveries shall be logged.

**NFR-6** — **Backward compatibility**: The `PAID_MARKETPLACE_APP_KEYS` constant change shall not require any database schema migration. All changes are behavioral.

**NFR-7** — **No regression on paid flow**: The Lazada and Shopee paid subscription flow (FR-9) shall produce zero regressions. Verified by automated smoke tests post-deployment.

**NFR-8** — **Audit trail**: The migration script shall produce a per-merchant, per-app audit log including: app key, subscription ID, Xendit plan ID, billing cancellation status, app activation status preserved flag, and notification sent flag.

---

## UX Notes

| Area | Guideline |
|---|---|
| Native app card — inactive state | Show "Free — Activate" button. Remove pricing tier display entirely. Consider a small "Free" badge or label near the button for quick scannability. |
| Native app card — active state | Show "Active" label with green indicator. Show "Deactivate" secondary action. No billing information shown. |
| 3rd-party app card (Lazada, Shopee) | No change. Retain pricing tiers and "Subscribe" CTA. |
| Cancel Add-On Subscription modal | For native apps: this modal is not applicable. Either hide or replace with a plain "Deactivate" confirmation dialog (no billing language). |
| Reactivation notification | Post-suspension reactivation: in-app or email list of auto-restored apps and a prompt to resubscribe to Lazada/Shopee if previously active. |
| Migration email | Positive, benefit-forward copy: "Great news! [App Name] is now free for all Prosperna merchants..." — not a cancellation notice framing. |

---

## Data Model Notes

**No database schema changes required.** All changes are behavioral.

| Collection | Service | Change |
|---|---|---|
| `PAID_MARKETPLACE_APP_KEYS` constant | `payment-integration-api` | Reduced to `['lazada', 'shopee']` |
| Marketplace subscription records | `payment-integration-api` | Status set to `INACTIVE`, reason `migrated_to_free` for migrated native subs. No schema change. |
| Marketplace invoice records | `payment-integration-api` | Read-only after migration. No new records for native apps. No deletion. |
| Store marketplace app config | `business-profile-api` | Native app keys added/removed via existing activation/deactivation logic. No schema change. |
| Order paywall records | `orders-service-api` | Announcements paywall updated to unlimited quota. Lazada/Shopee paywall unchanged. |
| Xendit recurring plan records | `payment-integration-api` | Existing records preserved; plan deactivated in Xendit via API; DB record kept. |

---

## Integrations and APIs

| Integration | Purpose | Change |
|---|---|---|
| `payment-integration-api` | Marketplace subscription, invoice, and billing lifecycle | Major — adds free-path bypass for native apps; migration logic; Agenda job updates |
| `business-profile-api` | Marketplace app activation/deactivation on store | Minor — called directly for native app activation (previously called only via payment webhook callback) |
| `orders-service-api` | Order Paywall quota management | Minor — Announcements quota updated to unlimited |
| `email-service-api` | Transactional email | Minor — new migration notification email template |
| Xendit | Payment processing and recurring billing | Migration — cancel recurring plans for native apps. No change to Lazada/Shopee Xendit integration. |
| `admin-service-api` (Rewards) | Promo code validation | No change needed — promo codes are not encountered in native app flow |

---

## Error Handling

| Scenario | Error Type | Behavior |
|---|---|---|
| `business-profile-api` activation fails | Service error | Return 500 to frontend; display error state on app card; do not mark app as active |
| Xendit API failure during migration | External API error | Log failure (merchant ID, app key, error); skip to next record; queue for retry; do not block rest of migration |
| Merchant on FREE plan activates native app | Authorization error | 403 Forbidden; frontend shows plan upgrade prompt |
| Agenda job processes native app (mistakenly) | Logic guard | Job exits early with no action; logs a warning; no deactivation or notification sent |
| Native app activation requested by suspended merchant | Access control | Merchant is blocked at dashboard level (ST-04 lock screen); activation endpoint never reached |

---

## Telemetry and Analytics

| Event | Trigger | Data Points |
|---|---|---|
| `marketplace.native_app.activated` | Merchant activates a native app | `store_id`, `app_key`, `plan`, `timestamp` |
| `marketplace.native_app.deactivated` | Merchant deactivates a native app | `store_id`, `app_key`, `timestamp` |
| `marketplace.paid_app.subscribed` | Merchant subscribes to Lazada or Shopee | `store_id`, `app_key`, `billing_cycle`, `amount`, `timestamp` |
| `marketplace.migration.subscription_cancelled` | Migration cancels a native app subscription | `store_id`, `app_key`, `subscription_id`, `timestamp` |
| `marketplace.migration.notification_sent` | Migration notification email sent | `store_id`, `app_key`, `email`, `timestamp` |
| `marketplace.suspension.apps_deactivated` | All apps deactivated on suspension | `store_id`, `app_keys[]`, `timestamp` |
| `marketplace.reactivation.apps_restored` | Native apps auto-restored on reactivation | `store_id`, `app_keys[]`, `timestamp` |

---

## Rollout Plan

| Phase | Activity | Owner |
|---|---|---|
| Pre-deployment | Update `PAID_MARKETPLACE_APP_KEYS` constant and deploy to staging | Backend |
| Pre-deployment | Update Agenda jobs (FR-20–FR-22) and deploy to staging | Backend |
| Pre-deployment | Update Marketplace UI (FR-11–FR-14) and deploy to staging | Frontend |
| Pre-deployment | Update order paywall for Announcements (FR-23) | Backend |
| Pre-deployment | Update suspension/reactivation logic (FR-24–FR-27, ST-04) | Backend |
| QA | Smoke test all native app activation/deactivation scenarios | QA |
| QA | Smoke test Lazada/Shopee paid flow — zero regression | QA |
| QA | Dry-run migration script on staging with test merchants | Backend/QA |
| Deployment | Deploy all backend and frontend changes to production | DevOps |
| Post-deployment | Run migration script in production (batch processing) | Backend/Ops |
| Post-deployment | Verify notification email delivery report | Ops |
| Post-deployment | Monitor error rates, activation success rates | DevOps |
| Post-deployment | Support team briefed on expected merchant inquiries | Support |

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | What is the exact app key for Geolocation in the codebase? (Not found in codebase discovery report) | Backend Dev | Open — verify before migration |
| OQ-2 | Should US merchants who previously could not subscribe to native apps receive a notification? (They were never charged, but may benefit from awareness.) | Product | Open |
| OQ-3 | What is the Announcements paywall "Gold tier" equivalent in the codebase — is it a specific constant or null allocation? | Backend Dev | Open — verify in `orders-service-api` |
| OQ-4 | Should the migration notification email be sent before or after the billing is cancelled? (Sequencing affects merchant experience if a charge lands between email and cancellation.) | Product/Backend | Open — recommendation: cancel first, then notify |

---

# Gherkin User Stories

## Feature: ST-09 Marketplace Add-Ons — Native Apps Become Free

---

### Scenario 1: New merchant activates a native marketplace app — happy path

```gherkin
Feature: Native Marketplace App Free Activation

  Background:
    Given a merchant on the LAUNCH plan is logged into the Merchant Dashboard
    And the merchant navigates to the Marketplace section
    And "Blogs" is a native app NOT in PAID_MARKETPLACE_APP_KEYS

  Scenario: Merchant activates a free native app
    When the merchant clicks "Free — Activate" on the Blogs app card
    Then no payment form is displayed
    And no Xendit invoice is created
    And no marketplace subscription record is created
    And the Blogs app is activated on the merchant's store in business-profile-api
    And the Blogs app card displays "Active" status
    And blog management features are accessible in the dashboard
    And blog pages render on the merchant's online store
```

---

### Scenario 2: Native app activation is blocked for FREE plan merchant

```gherkin
Feature: Plan Gate for Native App Activation

  Scenario: FREE plan merchant cannot activate native app
    Given a merchant on the FREE plan is logged into the Merchant Dashboard
    When the merchant attempts to activate a native marketplace app
    Then the system returns a 403 Forbidden response
    And the frontend displays a plan upgrade prompt
    And the app is not activated on the merchant's store
```

---

### Scenario 3: Paid subscription flow is preserved for Lazada

```gherkin
Feature: Lazada Paid Subscription Flow Unchanged

  Scenario: PH merchant subscribes to Lazada integration
    Given a PH merchant on the GROW plan is logged into the Merchant Dashboard
    And "lazada" is in PAID_MARKETPLACE_APP_KEYS
    When the merchant navigates to Marketplace → Lazada
    Then pricing tiers (Monthly, Quarterly, Annual) are displayed
    And a "Subscribe" button is displayed
    When the merchant selects Monthly billing and completes Xendit payment
    Then a marketplace invoice is generated
    And a marketplace subscription record is created
    And a Xendit recurring plan is created
    And the Lazada integration is activated on the merchant's store
    And order paywall records are assigned for the billing cycle
```

---

### Scenario 4: One-time migration cancels billing and preserves app activation

```gherkin
Feature: Migration — Cancel Billing, Keep App Active

  Background:
    Given a merchant has an active paid subscription for the "wholesale" app
    And the Xendit recurring plan for this subscription is active

  Scenario: Migration transitions merchant to free native app
    When the migration script processes this merchant's Wholesale subscription
    Then the Xendit recurring plan is cancelled in Xendit
    And no further charges are scheduled
    And the Wholesale app remains active on the merchant's store
    And the marketplace subscription record status is set to "INACTIVE"
    And the subscription record reason is set to "migrated_to_free"
    And historical invoice records for Wholesale are preserved
    And a notification email is sent to the merchant

  Scenario: Migration is idempotent — running twice does not double-notify
    When the migration script is run a second time for the same merchant
    Then no duplicate notification email is sent
    And the subscription record is not modified again
```

---

### Scenario 5: Merchant deactivates a free native app

```gherkin
Feature: Native App Deactivation — No Billing Action

  Scenario: Merchant deactivates an active free native app
    Given a merchant has the Wholesale app activated (free, native)
    When the merchant clicks "Deactivate" on the Wholesale app card
    Then no subscription cancellation is triggered
    And no Xendit API call is made
    And the Wholesale app is deactivated on the merchant's store in business-profile-api
    And Wholesale features disappear from the dashboard and storefront
    And the merchant can re-activate Wholesale at any time with one click
```

---

### Scenario 6: Account suspension deactivates all marketplace apps

```gherkin
Feature: Suspension Deactivates All Marketplace Apps

  Background:
    Given a merchant has Blogs (native, active) and Lazada (paid, active) on their store
    And the merchant's account is suspended due to failed core plan payment

  Scenario: All marketplace apps are deactivated on suspension
    When the suspension logic runs for this merchant
    Then the Blogs app is deactivated on the merchant's store
    And the Lazada integration is deactivated on the merchant's store
    And the set of previously-active apps is recorded for potential restoration
    And the merchant sees the plan selection lock screen upon login
```

---

### Scenario 7: Reactivation auto-restores native apps but not paid apps

```gherkin
Feature: Reactivation Auto-Restores Native Apps

  Background:
    Given a suspended merchant selects a new LAUNCH plan and completes payment
    And prior to suspension, the merchant had Blogs (native) and Lazada (paid) active

  Scenario: Native apps are auto-restored; paid apps require manual resubscription
    When the merchant's account is reactivated
    Then the Blogs app is automatically reactivated on the merchant's store
    And no payment is required for Blogs reactivation
    And the Lazada integration is NOT automatically reactivated
    And the Marketplace shows Lazada with a "Subscribe" prompt
    And the merchant receives a notification listing auto-restored apps and apps requiring resubscription
```

---

### Scenario 8: Promo code cannot be applied to a free native app

```gherkin
Feature: Promo Codes Not Applicable to Free Native Apps

  Scenario: Merchant attempts to use a promo code on a native app
    Given a valid promo code exists with apply_to including "Add-on Subscriptions"
    When the merchant navigates to a native marketplace app (e.g., Blogs)
    Then no payment form is displayed
    And there is no promo code input field
    And the promo code is never validated or applied
    And the app is activated for free without any discount step
```

---

### Scenario 9: Agenda job skips expiry processing for native app

```gherkin
Feature: Agenda Jobs Skip Native Apps

  Scenario: SCHEDULE_ADDON_EXPIRED_INTEGRATION skips a free native app
    Given the SCHEDULE_ADDON_EXPIRED_INTEGRATION job runs
    And it processes a subscription record for the "blogs" app key
    And "blogs" is NOT in PAID_MARKETPLACE_APP_KEYS
    Then the job exits early without deactivating the app
    And no expiry notification is sent
    And a warning is logged indicating the app is now free and skipped

  Scenario: SCHEDULE_ADDON_EXPIRE_BELL_NOTIF skips expiry notification for native app
    Given the SCHEDULE_ADDON_EXPIRE_BELL_NOTIF job is scheduled to run
    And the target app key is NOT in PAID_MARKETPLACE_APP_KEYS
    Then no expiry bell notification is sent to the merchant
```

---

### Scenario 10: Edge case — Announcements paywall set to unlimited after becoming free

```gherkin
Feature: Announcements Order Paywall Set to Unlimited

  Scenario: Existing Announcements paywall records updated to unlimited quota
    Given the migration runs
    And there are existing order paywall records for "announcements" with limited quotas
    When the migration processes the Announcements paywall update
    Then all existing Announcements paywall records are updated to the Gold tier (unlimited quota)
    And new Announcements activations do not generate quota-limited paywall records

  Scenario: New Announcements activation does not create quota-limited paywall
    Given a merchant activates the Announcements app (now free)
    When the activation completes
    Then no order paywall record with a limited allocation is created for Announcements
```

---

### Scenario 11: Edge case — Migration for merchant with no active native paid subscriptions

```gherkin
Feature: Migration Handles Merchants With No Active Paid Native Subscriptions

  Scenario: Migration script skips merchants with no native app subscriptions
    Given a merchant has no active paid subscriptions for any native marketplace app
    When the migration script runs for this merchant
    Then no Xendit cancellations are attempted
    And no notification email is sent
    And the migration audit log records "no action required" for this merchant
```

---

# Traceability Map

| FR | Requirement Summary | Gherkin Scenario(s) |
|---|---|---|
| FR-1 | `PAID_MARKETPLACE_APP_KEYS` reduced to `['lazada', 'shopee']` | S3 (lazada in list), S8 (blogs not in list) |
| FR-2 | App classification by `PAID_MARKETPLACE_APP_KEYS` only | S1, S3 |
| FR-3 | Native app: skip payment flow entirely | S1 |
| FR-4 | Native app: call `business-profile-api` directly | S1, S5 |
| FR-5 | Native app: return activation confirmation | S1 |
| FR-6 | Native activation: available to TRIAL/LAUNCH/GROW/SCALE; blocked for FREE | S2 |
| FR-7 | `additionalFee` unaffected by this change | *(covered by existing tests)* |
| FR-8 | Native app deactivation: no billing action | S5 |
| FR-9 | Lazada/Shopee paid flow unchanged | S3 |
| FR-10 | Promo codes only apply to Lazada/Shopee | S8 |
| FR-11 | Marketplace listing: "Free — Activate" for native apps | S1 |
| FR-12 | Marketplace listing: "Subscribe" CTA unchanged for Lazada/Shopee | S3 |
| FR-13 | Active native app shows "Active" + "Deactivate" | S1, S5 |
| FR-14 | `CancelAddonSubscriptionModal` hidden for native apps | S5 |
| FR-15 | Lazada/Shopee unsubscribe flow unchanged | *(covered by existing tests)* |
| FR-16 | Migration: identify active paid native subscriptions | S4 |
| FR-17 | Migration: cancel billing, preserve activation | S4 |
| FR-18 | Migration: preserve historical invoice records | S4 |
| FR-19 | Migration: send notification email | S4 |
| FR-20 | Agenda: `SCHEDULE_ADDON_EXPIRED_INTEGRATION` skips native apps | S9 |
| FR-21 | Agenda: `SCHEDULE_ADDON_EXPIRE_BELL_NOTIF` skips native apps | S9 |
| FR-22 | Agenda: `UPDATE_ADDON_SUBSCRIPTION_STATUS` plan name update | *(plan name update — covered by ST-01 integration tests)* |
| FR-23 | Announcements paywall set to unlimited | S10 |
| FR-24 | On suspension: deactivate all marketplace apps | S6 |
| FR-25 | On reactivation: auto-restore native apps | S7 |
| FR-26 | On reactivation: paid apps require manual resubscription | S7 |
| FR-27 | Reactivation notification listing restored/pending apps | S7 |
| FR-28 | Historical marketplace invoices remain in admin view | S4 |
| FR-29 | No new invoices generated for native app activations | S1 |
