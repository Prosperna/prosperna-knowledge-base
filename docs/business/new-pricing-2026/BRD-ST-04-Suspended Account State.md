---
id: st-04-suspended-account-state
title: BRD. ST-04 Suspended Account State
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

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform. Under the current model, when a merchant's trial expires or their paid subscription lapses, their account reverts to the Free Plan — a permanent tier that keeps their store live with limited features. The Free Plan is being retired as part of the Pricing Restructuring initiative.

Without the Free Plan safety net, there is no defined state for merchants who have no active subscription. This creates two problems:

1. **No enforcement gate.** Merchants who stop paying retain store access indefinitely, breaking the subscription model.
2. **No recovery path.** Without a clear "offline but recoverable" state, merchants who lapse have no structured way to come back.

The Suspended Account State solves both: it locks the merchant out of their dashboard and takes their storefront offline the moment their subscription lapses, while preserving all data so reactivation is instant and frictionless.

---

## Goals

1. Define and implement `SUSPENDED` as a first-class account status in the Prosperna platform.
2. Completely lock suspended merchants out of their Merchant Dashboard (zero access to any feature except the plan selection paywall).
3. Replace the customer-facing storefront with a dedicated suspension page that protects the merchant's SEO and communicates clearly to visitors.
4. Preserve all merchant data indefinitely during suspension so reactivation is seamless.
5. Enable instant reactivation: the moment a merchant selects a plan and pays, their dashboard unlocks and store goes live.
6. Track suspension reasons for analytics and to display context-appropriate messaging on the lock screen.

---

## Non-Goals

1. **Account deletion.** Suspension is not deletion. Data purge following an explicit merchant account deletion request is a separate process outside ST-04 scope.
2. **Grace periods or payment retries.** By stakeholder decision, failed payments result in immediate suspension — no retry logic, no grace period.
3. **Partial access during suspension.** Balance withdrawal, data export, and order viewing while suspended are explicitly out of scope. Complete lockout is the design intent.
4. **Admin override tools.** Admin-side visibility and manual reactivation of suspended merchants is covered in ST-12.
5. **Suspension notification emails.** Email templates for suspension events are defined in ST-14, not ST-04.
6. **Cancellation flow.** How merchants initiate cancellation is defined in ST-05. ST-04 handles what happens after the billing period ends.
7. **Trial expiry logic.** Trial duration and expiry triggering are defined in ST-03. ST-04 handles what happens when the trial expires.

---

## Stakeholders

| Role | Name / Team | Interest |
|---|---|---|
| Product Owner | Prosperna Product Team | Feature definition, business rules, stakeholder-mandated decisions (e.g., no grace period) |
| Backend Engineering | `business-profile-api` team | `suspendMerchant()`, `reactivateMerchant()`, middleware, schema changes |
| Frontend Engineering | `prosperna1` team | `/suspended` lock screen, route guards |
| Frontend Engineering | `p1-customer` team | `SuspensionPage`, storefront middleware, SEO protections |
| Platform Engineering | `media-service-api` team | Cold storage mover background job |
| QA | QA Team | Acceptance criteria, edge case validation |
| Billing | Finance / Billing Team | Revenue recovery via reactivation, suspension reason analytics |

---

## Personas

| Persona | Description | Interaction with Suspended State |
|---|---|---|
| **Suspended Merchant** | A merchant whose trial expired, subscription was cancelled (period ended), payment failed, or was migrated from Free Plan | Logs in → sees lock screen with plan cards → selects plan → pays → dashboard restored |
| **Store Customer** | End-user who visits a suspended merchant's online store URL | Sees the suspension page with non-payment message and merchant contact info instead of the store |
| **Prosperna Admin** | Prosperna internal staff | Visibility into suspended accounts; manual reactivation tools (ST-12 scope) |

---

## Business Value

| Value Driver | Detail |
|---|---|
| **Revenue recovery** | Suspension + paywall is the primary mechanism to convert lapsed merchants back to paid plans. Without this gate, ex-paying merchants have no incentive to resubscribe. |
| **Subscription model integrity** | The Free Plan retirement means every active store must be associated with a paid subscription. The Suspended state enforces this contract. |
| **Merchant data trust** | "Data is never deleted" is a key Prosperna differentiator. Indefinite data preservation during suspension makes reactivation low-risk for merchants and supports long-term retention. |
| **SEO protection for merchants** | Returning 503 (not 404) and injecting noindex while suspended prevents permanent de-indexing of merchant store URLs, protecting the merchant's Google ranking equity. |
| **Clear customer communication** | The suspension page with merchant contact info redirects customer inquiries appropriately, reducing Prosperna Support burden for non-Prosperna issues. |

---

## Scope

### In Scope

- `SUSPENDED` as a new value in the `payPlanType` enum and account status model
- New fields on the Store model: `isSuspended`, `suspendedAt`, `suspendedReason`, `lastActivePlan`, `dataRetentionDeadline`
- `suspendMerchant(store_id, reason)` service function in `business-profile-api`
- `reactivateMerchant(store_id, new_plan)` service function in `business-profile-api`
- `/suspended` full-screen lock page in `prosperna1` (Merchant Dashboard) — context-specific heading, plan cards, payment gateway selector
- Route guard in `prosperna1` — all authenticated routes redirect to `/suspended` when `payPlanType === 'SUSPENDED'`
- `mustBeOnPaidPlan` middleware update to reject `SUSPENDED` accounts
- `SuspensionPage` component in `p1-customer` (Online Store) — full-page suspension message with merchant contact info
- Storefront middleware in `p1-customer` — checks `isSuspended` first on every route
- SEO protections on suspended stores: HTTP 503, noindex meta tag, `Disallow: /` in robots.txt
- Deactivation of all marketplace add-ons on suspension
- Auto-reactivation of native add-ons on reactivation
- New endpoints: `GET /api/v1/suspension/status`, `POST /api/v1/subscription/reactivate`
- Modified endpoint: `GET /api/v1/merchant/status` (returns `'suspended'` as a possible value)
- `media-cold-storage-mover` background job (weekly) — transitions media files to cold storage after 6 months of suspension
- Four suspension reason values: `trial_expired`, `cancelled`, `payment_failed`, `migration`
- Data retention policy: indefinite for most data; 6 months for media before cold storage; 12 months for analytics before archival
- `subscription_cancellations` collection (schema defined in this subtask, populated by ST-05)

### Out of Scope

- Account deletion and data purge (separate process)
- Grace periods or payment retry logic on failure
- Admin override and manual reactivation UI (ST-12)
- Email notification templates (ST-14)
- Trial expiry scheduling (ST-03)
- Cancellation flow and initiation (ST-05)
- Bulk migration job execution (ST-16)
- 3rd-party paid add-on resubscription (merchant-initiated)
- Balance withdrawal recovery process

---

## Assumptions

| ID | Assumption |
|---|---|
| A-01 | The Payment Abstraction Layer (ST-01) is available before the lock screen's payment flow is integrated. |
| A-02 | The plan prices ($29/mo Launch, $59/mo Grow, $149/mo Scale) and feature limits are final. Any change requires a doc update. |
| A-03 | Cognito authentication remains fully functional for suspended merchants — they can always log in to reach the lock screen. |
| A-04 | The `RECOMMENDED` badge logic for plan cards during suspension defaults to `lastActivePlan` or next tier up; exact logic to be confirmed with stakeholders. |
| A-05 | Storefront URLs follow the pattern `{slug}.prosperna.com` (or equivalent), and the entire domain is controlled so all routes can be intercepted. |
| A-06 | Native (built-in) marketplace add-ons can be toggled active/inactive programmatically. 3rd-party (Lazada, Shopee) add-ons require separate resubscription. |
| A-07 | The suspension page merchant contact info (`store.email`, `store.phone`) is already stored on the Store document and accessible without authentication. |
| A-08 | Cold storage media restoration takes up to 24 hours and shows placeholder images during the restoration window. |

---

## Dependencies

| Dependency | Subtask | Direction | Detail |
|---|---|---|---|
| Payment Abstraction Layer | ST-01 | ST-04 depends on | Lock screen payment flow uses PAL. Required for reactivation. |
| Trial System | ST-03 | ST-03 calls ST-04 | `trial-expiry-processor` calls `suspendMerchant('trial_expired')` |
| Cancellation Flow | ST-05 | ST-05 calls ST-04 | `cancellation-processor` calls `suspendMerchant('cancelled')` |
| Payment Failure Webhook | ST-01 | ST-01 calls ST-04 | `UnifiedWebhookHandler` calls `suspendMerchant('payment_failed')` |
| Bulk Migration | ST-16 | ST-16 calls ST-04 | Migration job calls `suspendMerchant('migration')` for Free Plan merchants |
| Email Notifications | ST-14 | ST-04 triggers | `suspendMerchant()` and `reactivateMerchant()` fire emails; templates owned by ST-14 |
| Admin Override Tools | ST-12 | ST-12 depends on | Admin manual reactivation uses `reactivateMerchant()` |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Merchants with unfulfilled orders are suspended without warning | Medium | High | Suspension trigger subtasks (ST-03, ST-05, ST-08) must include pre-suspension warnings that reference unfulfilled orders. ST-04 defines the lockout behavior but cannot fix what happens before it is called. |
| Cold storage restoration delay (24h) causes poor post-reactivation experience | Low | Medium | Display a notification to reactivated merchants: "Your store is live! Some images are being restored and may take up to 24 hours to appear." Use placeholder images during restoration. |
| Media cold storage mover runs on wrong stores (false positive) | Low | High | Job must filter strictly: `isSuspended === true AND suspendedAt < (now - 6 months)`. Add dry-run mode and logging before first production run. |
| Seasonal merchants lapse for many months; data recovery anxiety | Low | Medium | Messaging on the lock screen and reactivation confirmation should reinforce "All your data, products, and settings are safe" to reduce anxiety. |
| `isSuspended` / `isTemporaryCloseEnabled` flag priority not implemented correctly | Medium | Medium | Storefront middleware must explicitly check `isSuspended` first. Add integration test for both flags being true simultaneously. |
| Frontend route guard bypassed via direct URL navigation | Low | High | Route guard must be applied universally — not just on navigation events. Backend `mustBeOnPaidPlan` middleware provides the authoritative second line of defense. |

---

## Compliance and Privacy Notes

| Topic | Note |
|---|---|
| **Data retention** | Merchant data is preserved indefinitely during suspension. This aligns with Prosperna's commitment to not delete merchant data without explicit consent. |
| **Customer data on suspended stores** | Customer records stored by the merchant (name, email, order history) are preserved and remain the merchant's responsibility. Prosperna does not independently communicate with merchant customers about suspension (beyond showing the suspension page). |
| **SEO 503 vs 404** | Using HTTP 503 is the correct technical choice for temporary unavailability. It is not a compliance requirement but aligns with best practices for preserving merchant SEO equity. |
| **Contact info display** | Showing the merchant's email and phone on the suspension page requires that this data is already consented to be part of the store record. Confirm with legal if any additional consent is required before surfacing this data publicly on the suspension page. |
| **Analytics data archival** | Analytics data archived after 12 months of suspension should be subject to the same data retention and deletion policies as active analytics data. |

---

## Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Reactivation rate within 7 days** | ≥ 30% of newly suspended merchants | Suspension event → reactivation event within 7 days |
| **Reactivation rate within 30 days** | ≥ 50% of newly suspended merchants | Suspension event → reactivation event within 30 days |
| **Time to reactivation (median)** | < 10 minutes from lock screen to store live | `suspendedAt` → `reactivatedAt` timestamp delta |
| **Lock screen to plan selection click rate** | ≥ 60% of lock screen sessions | Analytics event: `lock_screen_viewed` → `plan_selected` |
| **Post-reactivation churn (90-day)** | < 20% of reactivated merchants suspend again within 90 days | Reactivation → next suspension event within 90 days |
| **Suspension page 503 compliance** | 100% of suspended store routes return HTTP 503 | Automated monitoring / smoke tests |
| **Data integrity on reactivation** | 100% of reactivated merchants find their data intact | QA acceptance test: verify products, orders, store design post-reactivation |
