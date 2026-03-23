---
id: st-16-existing-merchant-migration
title: PRD. ST-16 Existing Merchant Migration
sidebar_label: ST-16 Existing Merchant Migration
sidebar_position: 16
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Summary

This document specifies the product requirements for ST-16: Existing Merchant Migration — the one-time coordinated event that transitions all existing Prosperna merchants from the legacy plan structure (Free / Plus / Pro / Premium) to the new plan structure (Launch / Grow / Scale / Suspended / Trial).

The migration has two distinct tracks:
- **Free Plan Track:** 60-day advance communication → T-0 bulk suspension → reactivation path via plan selection.
- **Paid Plan Track:** 45-day advance communication → T-0 plan name remapping → new USD pricing at next renewal.

Premium Trial merchants continue uninterrupted until trial expiry, then follow the standard trial-to-paid flow.

---

## User Journey

### Happy Path

#### Free Plan Merchant — Converts Before T-0

1. **T-60:** Merchant receives announcement email and sees an in-app banner: "Your free plan is being retired. Choose a paid plan to keep your store live — 50% off for 3 months."
2. **T-60 through T-0:** Merchant visits `/home/billing`, reviews plan options, selects Launch ($14.50/mo with promo), completes payment via Stripe or Xendit.
3. The "OG Merchant" promo code is auto-applied. Merchant's store remains live, uninterrupted.
4. **T-0:** Bulk migration job checks merchant — `payPlanType` is already `LAUNCH` — skips with status `skipped`. No email sent.

#### Free Plan Merchant — Suspended on T-0, Reactivates Later

1. **T-60 through T-1:** Merchant receives migration emails; does not subscribe.
2. **T-0:** Bulk migration job: `payPlanType → SUSPENDED`, `isSuspended → true`, add-ons deactivated. Confirmation email sent.
3. **Merchant logs in (post-T-0):** Route guard detects `SUSPENDED` → redirected to `/suspended` (full-screen plan selection lock screen).
4. Merchant selects a plan, completes payment → `payPlanType` updated → dashboard unlocks, store goes live.
5. If merchant returns within 90 days of T-0, "OG Merchant" promo (50% off for 3 months) is still available.

#### Paid Plan Merchant — Plus/Pro/Premium → Launch/Grow/Scale

1. **T-45:** Merchant receives: "Your Plus plan is becoming Launch. Here's what's changing."
2. **T-30:** Merchant receives detailed plan mapping email.
3. **T-0:** Bulk migration job: `payPlanType PLUS → LAUNCH`. Billing cycle unchanged. Plan expiry date unchanged.
4. Merchant logs in: sees their updated plan name and USD pricing at next renewal. Store is fully operational.
5. At next renewal: new USD pricing charged via Payment Abstraction Layer (Stripe or Xendit). Old PHP Xendit subscription cancelled; new USD subscription created.

#### Premium Trial Merchant

1. Trial continues uninterrupted to natural expiry (original trial end date or T-0, whichever is LATER).
2. At T-60: "OG Merchant" promo code auto-assigned.
3. After trial expires: standard trial-to-paid flow (ST-03). If no plan selected → Suspended.

### Alternate and Failure Paths

| Scenario | System Response |
|---|---|
| Free merchant converts between T-60 and T-0 | Paid plan created; migration job skips them on T-0 (already on LAUNCH/GROW/SCALE) |
| Paid merchant cancels before T-0 | Plan active until end of billing period; plan name mapped on T-0; no FREE fallback after billing ends (suspends instead) |
| Migration job encounters merchant failure | Log to `migration_audit_log`; skip to next merchant; halt if >10% error rate in a batch |
| Migration job re-run (idempotency) | Skip merchants already on SUSPENDED, LAUNCH, GROW, or SCALE |
| Trial merchant's trial ends after T-0 | Trial continues to natural expiry, then ST-03 trial-to-paid flow takes over |
| Suspended merchant returns after promo expires (>90 days post-T-0) | All data preserved; full-price plans available; admin can manually apply discount |
| Free merchant has unfulfilled orders on T-0 | Account suspended; orders preserved; merchant must reactivate to access and fulfill |
| System failure on T-0 | On-call engineering notified; idempotent job re-run after investigation; rollback script available |

---

## Functional Requirements

### Plan Structure & Schema

**FR-1** — The `payPlanType` field on the Store model must accept new enum values: `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED`. Legacy values (`FREE`, `PLUS`, `PRO`, `PREMIUM`, `PREMIUM_TRIAL`) must be retained for backward compatibility and must not be assignable to new accounts after T-0.

**FR-2** — The Store model must have new fields added:
- `suspendedAt` (Date, nullable): timestamp when suspension occurred
- `suspendedReason` (String, nullable): one of `trial_expired`, `cancelled`, `payment_failed`, `migration`
- `lastActivePlan` (String, nullable): the plan before suspension
- `isSuspended` (Boolean, default false): flag checked by storefront to render the suspension page
- `dataRetentionDeadline` (Date, nullable): `suspendedAt + 6 months`

**FR-3** — A new `migration_audit_log` collection must be created with fields: `store_id`, `merchant_name`, `old_plan`, `new_plan`, `migration_type`, `status`, `error_message`, `promo_code_applied`, `migrated_at`. Every migration operation must write a record to this collection.

**FR-4** — The `merchant_trial_info` collection must be created (per ST-03) and records for Free Plan merchants on active Premium Trials must be created during migration, with `migration_promo_code` populated.

### Bulk Migration Job

**FR-5** — A `migration-bulk-executor` job must be created that processes all stores in batches. The job must:
- Skip stores where `payPlanType` is already `SUSPENDED`, `LAUNCH`, `GROW`, or `SCALE` (idempotency guard).
- For `FREE` stores (no active trial): call `suspendMerchant(store_id, 'migration')`.
- For `FREE` stores on active `PREMIUM_TRIAL` (trial end date > now): skip with `migration_type: 'trial_skipped'`.
- For `PLUS` stores: set `payPlanType = 'LAUNCH'`.
- For `PRO` stores: set `payPlanType = 'GROW'`.
- For `PREMIUM` stores: set `payPlanType = 'SCALE'`.
- Each merchant migration is an independent DB transaction.
- If >10% of migrations fail in a single batch: halt job and alert on-call engineering.

**FR-6** — A `suspendMerchant(store_id, reason)` service function must be implemented that:
1. Sets `payPlanType = 'SUSPENDED'`
2. Sets `suspendedAt = now`
3. Sets `suspendedReason = reason`
4. Sets `lastActivePlan` = prior `payPlanType`
5. Sets `isSuspended = true`
6. Deactivates all marketplace add-ons
7. Preserves all data (products, orders, pages, settings)
8. Does NOT disable the Cognito account

**FR-7** — `revertToFreePlan()` must be removed or disabled post-T-0. All code paths that previously called `revertToFreePlan()` (billing cron, cancellation endpoint, trial expiry) must call `suspendMerchant()` instead.

**FR-8** — A rollback script must be created that reverts: `LAUNCH → PLUS`, `GROW → PRO`, `SCALE → PREMIUM`, `SUSPENDED (reason: migration) → FREE`. The rollback script must be tested in staging before T-0.

### Communication Campaign

**FR-9** — A `migration-communication-sender` scheduled job must send migration emails on the following schedule:
- T-60: `announcement-t60.hbs` to all Free Plan merchants
- T-45: `reminder-t45.hbs` to remaining Free Plan merchants + `paid-announcement-t45.hbs` to Paid Plan merchants
- T-30: Segmented emails (`reminder-t30-active.hbs`, `reminder-t30-semi-active.hbs`, `reminder-t30-inactive.hbs`) + `paid-detail-t30.hbs`
- T-14: `urgent-t14.hbs` to remaining Free Plan merchants
- T-7: `urgent-t7.hbs` to remaining Free Plan merchants
- T-1: `final-t1.hbs` to remaining Free Plan merchants
- T-0: `complete-t0.hbs` to suspended Free merchants + `paid-confirmation-t0.hbs` to migrated Paid merchants

**FR-10** — Free Plan merchant segments must be computed from the following data sources:
- Segment A (Active): orders placed in last 30 days (`orders-service-api`)
- Segment B (Semi-Active): last login within 30 days, no orders (`user-service-api`)
- Segment C (Inactive): no login in 60+ days (`user-service-api`)
- Segment D (On Premium Trial): `payPlanType === 'PREMIUM_TRIAL'`

**FR-11** — 14 email templates must be created in `email-service-api/src/views/migration/`. All templates must support personalization variables: `{{merchantName}}`, `{{firstName}}`, `{{migrationDate}}`, `{{promoCode}}`, `{{promoExpiryDate}}`. Segment-specific templates also support `{{productCount}}` and `{{orderCount}}`.

### In-App Communication

**FR-12** — A persistent in-app migration banner must be deployed to the Merchant Dashboard and displayed to all Free Plan merchants from T-60 onwards. The banner must include: migration date, promo code, CTA to the billing/pricing page. The banner must remain visible until the merchant converts to a paid plan or is suspended.

**FR-13** — An in-app migration modal must appear on Merchant Dashboard login from T-30 onwards for Free Plan merchants. The modal must display plan comparison, pricing with OG Merchant promo, and a CTA to plan selection. The modal is dismissible but must reappear on next login.

### OG Merchant Promo Code

**FR-14** — The "OG Merchant" promo code must be configured in the rewards system with:
- Type: `percent`
- Value: 50%
- `cycle_duration`: 3 billing cycles
- `assignment_type`: `AUTO`
- `assignment_subscription_tier`: `ALL`
- `valid_from`: T-60
- `valid_until`: T-0 + 90 days
- `apply_to`: `Core Subscriptions`

**FR-15** — A `migration-promo-applicator` job must run at T-60 and call `associateStoreWithAutoRewards()` for all Free Plan merchant accounts, including those on active Premium Trial.

**FR-16** — A `migration-promo-expiry` daily job must check the promo's `valid_until` date and mark the promo code as invalid once the date has passed.

**FR-17** — `getPlanPricingBreakdown()` in `payment-integration-api` must be updated to: (a) accept new plan names (LAUNCH, GROW, SCALE), (b) use USD pricing, (c) match the "OG Merchant" promo code correctly against `ALL` tier.

### Suspended State (Merchant Dashboard)

**FR-18** — A route guard must be added to the Merchant Dashboard. On every authenticated route, if `payPlanType === 'SUSPENDED'`, redirect to `/suspended`.

**FR-19** — The `/suspended` page must be a full-screen plan selection lock screen showing:
- Suspension reason message (e.g., "Your free plan has been retired")
- Plan cards: Launch, Grow, Scale with USD pricing and OG Merchant promo if applicable
- Payment gateway selector (Stripe or Xendit)
- No secondary navigation, no export links, no withdrawal links

**FR-20** — The `pay/subscribe` flow must accept new plan names (LAUNCH, GROW, SCALE) and route through the Payment Abstraction Layer. Successful payment must call `reactivateMerchant()` which sets `payPlanType = selected_plan`, `isSuspended = false`, clears `suspendedAt` and `suspendedReason`.

### Suspended State (Storefront)

**FR-21** — The Online Store (`p1-customer`) must check `isSuspended` on every page load. If `true`, render the `SuspensionPage` component in place of the full storefront.

**FR-22** — The `SuspensionPage` component must display:
- Warning icon
- Heading: "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT"
- Merchant's registered contact email and phone number
- `noindex` meta tag (SEO)
- HTTP 503 status code response

### Admin Tools

**FR-23** — A migration tracking dashboard must be created at `/admin/migration-tracking` displaying:
- Total Free Plan merchants (pre-migration count)
- Migrated count, converted count (chose a plan), suspended count
- Promo redemption rate
- Breakdown by segment (A, B, C, D)
- Real-time job progress during T-0

**FR-24** — The Merchant Accounts list (`/admin/accounts`) must be updated with:
- "Suspended" and "Trial" status filters
- `suspendedReason` column
- Plan type filters updated to include LAUNCH, GROW, SCALE

**FR-25** — Admin manual override tools must provide actions:
- Manually reactivate a suspended merchant (with audit log entry)
- Manually apply promo code to a merchant account
- Extend a merchant's trial

### Background Jobs

**FR-26** — `createUpcomingInvoices()` cron must be updated: on unpaid renewal after due date, call `suspendMerchant()` instead of `revertToFreePlan()`. The cron must support both Stripe and Xendit renewal paths via the Payment Abstraction Layer.

**FR-27** — The `migration-win-back-sender` daily job must identify suspended merchants with `suspendedReason = 'migration'` and send:
- `win-back-t7.hbs` at T+7
- `win-back-t30.hbs` at T+30
Each merchant receives each win-back email only once.

**FR-28** — The Rewards model in `admin-service-api` must be updated to accept new `assignment_subscription_tier` values: `LAUNCH`, `GROW`, `SCALE` (in addition to legacy values).

### Usage Limit Shadow Period

**FR-29** — For migrated paid merchants, ST-06 (Usage Limits & Enforcement) must be activated in shadow mode for 4 weeks after T-0. Usage is tracked against new plan limits but no enforcement actions occur. After 4 weeks, a usage summary email is sent, and full enforcement begins.

---

## Non-Functional Requirements

**NFR-1 — Idempotency:** The bulk migration job must be safe to re-run multiple times. Already-migrated merchants (with new plan names) must be skipped without modification.

**NFR-2 — Transaction isolation:** Each merchant's migration is an independent database operation. Failure for one merchant must not block or affect others.

**NFR-3 — Failure threshold:** If >10% of migrations fail within a single job execution batch, the job must halt immediately and send an alert to on-call engineering.

**NFR-4 — Rollback capability:** A rollback script capable of reverting all migration changes for any merchant must exist and be tested in staging before T-0.

**NFR-5 — Audit logging:** Every migration operation (success, failure, skip) must produce a `migration_audit_log` record. This log must be queryable via the admin API.

**NFR-6 — Data preservation:** No merchant data (products, orders, pages, settings, customer records) may be deleted or altered as part of the migration process.

**NFR-7 — Performance:** The bulk migration job must complete all merchant migrations within a maintenance window. Batch size and concurrency must be tuned to avoid database overload.

**NFR-8 — Email delivery:** All migration campaign emails must achieve >95% delivery rate. Bounces and failures must be logged.

**NFR-9 — Security:** Migration endpoints (`/admin/migration/execute`, `/admin/migration/rollback`) must be admin-only. No merchant or unauthenticated user can trigger migration operations.

**NFR-10 — Backward compatibility:** Legacy `payPlanType` values must remain valid in the database schema and must not cause errors in existing queries or analytics pipelines.

---

## UX Notes

- The migration tone must be celebratory, not punitive. Framing: merchants are *unlocking* more features and freedom, not being *penalized*.
- Suspension messaging ("Your free plan has been retired") must be clear but not alarming. The plan selection lock screen must make reactivation feel simple and fast.
- The OG Merchant promo must be visible and prominent throughout the migration flow (email, banner, modal, lock screen, checkout).
- The storefront suspension page must be professional and informative — it represents the merchant's brand to their customers.

---

## Data Model Notes

### Store Model Changes (`business-profile-api/src/models/Store.model.ts`)

```
payPlanType: 'FREE' | 'PLUS' | 'PRO' | 'PREMIUM' | 'PREMIUM_TRIAL'   // legacy, preserved
           | 'TRIAL' | 'LAUNCH' | 'GROW' | 'SCALE' | 'SUSPENDED'     // new values
suspendedAt: Date (nullable, new)
suspendedReason: 'trial_expired' | 'cancelled' | 'payment_failed' | 'migration' (nullable, new)
lastActivePlan: String (nullable, new)
isSuspended: Boolean (default: false, new)
dataRetentionDeadline: Date (nullable, new)
```

### New: `migration_audit_log` Collection

```
store_id: String
merchant_name: String
old_plan: String
new_plan: String
migration_type: 'free_to_suspended' | 'plus_to_launch' | 'pro_to_grow' | 'premium_to_scale' | 'trial_skipped'
status: 'success' | 'failed' | 'skipped'
error_message: String (nullable)
promo_code_applied: Boolean
migrated_at: Date
```

### New: `merchant_trial_info` Collection (for ST-16 migration)

Existing `PREMIUM_TRIAL` merchants get a record with `migration_promo_code` populated.

### Rewards Model Update (`admin-service-api`)

`assignment_subscription_tier` accepts new values: `'LAUNCH'`, `'GROW'`, `'SCALE'` (alongside legacy values).

---

## Integrations and APIs

| Integration | Change |
|---|---|
| `business-profile-api` | New endpoints: `POST /admin/migration/execute`, `GET /admin/migration/stats`, `POST /admin/migration/rollback`, `GET /admin/migration/audit-log`. Modified: `POST /billing/plans/subscribe/:store_id`, `POST /billing/plans/cancel/:store_id`. New function: `suspendMerchant()`. Remove: `revertToFreePlan()`. |
| `payment-integration-api` | Modified: `GET /plansubscriptions/pricing/:plan` for new plan names and USD pricing. Modified: `createUpcomingInvoices()` cron to call `suspendMerchant()` instead of `revertToFreePlan()`. Modified: `getPlanPricingBreakdown()` for new plan names. |
| `admin-service-api` | Modified: `POST /rewards/` to accept new tier values. Modified: `associateStoreWithAutoRewards()` for new plan tiers. |
| `email-service-api` | New: 14 migration email templates in `src/views/migration/`. |
| `user-service-api` | Updated store admin limit lookups for new plan tier names. |
| `orders-service-api` | Usage tracking setup for shadow period (ST-06). |
| `prosperna1` (Merchant Dashboard) | Migration banner, migration modal, plan selection lock screen, route guards, admin migration dashboard. |
| `p1-customer` (Storefront) | `SuspensionPage` component, `isSuspended` flag check, SEO/503 response. |
| Xendit | Existing recurring subscriptions: continue until billing period ends; cancelled and replaced via Payment Abstraction Layer at renewal. |
| Stripe | New USD subscription created via Payment Abstraction Layer for merchants who choose Stripe at or after migration. |
| AWS Cognito | No changes. Merchant accounts remain active through suspension. |

---

## Error Handling

| Error Scenario | Expected Behavior |
|---|---|
| Single merchant migration fails | Log to `migration_audit_log` with `status: 'failed'` and `error_message`; continue to next merchant |
| >10% failure rate in a batch | Halt job; alert on-call engineering; do not continue until reviewed |
| Email send failure | Log failure; retry up to 3 times; log final status |
| Promo code already associated with merchant | `associateStoreWithAutoRewards()` is idempotent; skip duplicate |
| Merchant already on new plan name (idempotency) | Skip; log with `status: 'skipped'` |
| Rollback attempted without emergency authorization | Reject; require explicit admin confirmation |
| Storefront suspension page fails to load | Fail-safe: render a minimal static suspension message |

---

## Telemetry and Analytics

| Event | Trigger | Destination |
|---|---|---|
| `migration.merchant_suspended` | `suspendMerchant()` called with reason `migration` | Admin dashboard, audit log |
| `migration.plan_remapped` | Paid plan name updated on T-0 | Admin dashboard, audit log |
| `migration.trial_skipped` | Active trial merchant skipped | Admin dashboard, audit log |
| `migration.job_started` | `migration-bulk-executor` begins | Admin dashboard, alert channel |
| `migration.job_completed` | `migration-bulk-executor` finishes | Admin dashboard, alert channel |
| `migration.job_halted` | >10% failure rate detected | On-call alert |
| `migration.promo_applied` | OG Merchant promo used at checkout | Admin dashboard |
| `migration.merchant_reactivated` | Suspended merchant selects plan and pays | Admin dashboard |
| `email.migration_sent` | Any migration campaign email sent | Email delivery log |
| `email.migration_failed` | Email delivery failure | Email delivery log |

---

## Rollout Plan

### Phase 1 — Prerequisite Validation (Before T-60)
- Confirm ST-01, ST-03, ST-04, ST-05, ST-10, ST-14 deployed and verified in production.
- Create "OG Merchant" promo code in admin panel.
- Deploy 14 email templates; test render and delivery.
- Test bulk migration job in staging with production-like data (simulate all edge cases).
- Test rollback script in staging.
- Deploy admin migration tracking dashboard.
- Deploy in-app migration banner (hidden; ready to activate).
- Train support team; publish FAQ/help articles.

### Phase 2 — Communication Campaign (T-60 through T-1)
- T-60: Activate banner, run promo applicator job, send announcement email.
- T-45: Send reminder and paid announcement emails.
- T-30: Send segmented emails, activate modal.
- T-14, T-7, T-1: Send urgency emails.
- Monitor conversion rates; adjust support resources if needed.

### Phase 3 — Migration Day (T-0)
- Assemble on-call engineering team.
- Open real-time monitoring dashboards.
- Execute `migration-bulk-executor` job.
- Monitor progress and error rates.
- Send `complete-t0.hbs` and `paid-confirmation-t0.hbs`.
- Remove Free Plan from system configuration.
- Verify: suspended merchants see lock screen; storefronts show suspension page.

### Phase 4 — Post-Migration (T+1 through T+30+)
- T+7: Win-back email.
- T+30: Win-back email.
- Begin usage limit shadow period for migrated paid merchants.
- After 4-week shadow period: send usage summary emails, enable full enforcement (ST-06).
- Week 8: Analyze results, compile retrospective.

---

## Open Questions

| ID | Question | Assumption |
|---|---|---|
| OQ-1 | What are the exact quarterly and annual USD prices for Launch, Grow, Scale? | Assumes same multiplier: 3× monthly for quarterly; 12× + 1 month free for annual. To be confirmed with stakeholders. |
| OQ-2 | Should the `dataRetentionDeadline` field trigger actual media cold storage migration automatically, or is it only a flag for a manual process? | Assumed to be a flag for a manually triggered process pending legal/compliance guidance. |
| OQ-3 | What is the target date for T-0 (Migration Day)? | TBD. Must allow at least 60 days post-launch of new plan system. |
| OQ-4 | Does the rollback script require a separate admin approval workflow, or can any admin trigger it? | Assumed to require explicit admin confirmation (double-confirm) to prevent accidental use. |
| OQ-5 | What gateway should be used for paid merchants' subscription renewals if the merchant has an existing PHP Xendit subscription and has not explicitly chosen a gateway? | Assumed: default to Xendit for existing Xendit subscribers unless merchant actively selects Stripe. |

---

# Gherkin User Stories

## Feature: Existing Merchant Migration

### Free Plan Merchant Migration

```gherkin
Scenario: Free Plan merchant with no active trial is suspended on Migration Day
  Given a merchant with payPlanType "FREE" and no active PREMIUM_TRIAL
  And the bulk migration job is executing
  When the migration job processes this merchant
  Then payPlanType is set to "SUSPENDED"
  And suspendedAt is set to the current timestamp
  And suspendedReason is set to "migration"
  And lastActivePlan is set to "FREE"
  And isSuspended is set to true
  And all marketplace add-ons are deactivated
  And a migration_audit_log record is created with status "success"
  And a "complete-t0.hbs" email is sent to the merchant

Scenario: Active Premium Trial merchant is skipped on Migration Day
  Given a merchant with payPlanType "PREMIUM_TRIAL"
  And premiumTrialSubscriptionDate + 14 days is after the current date
  When the migration job processes this merchant
  Then the merchant's plan is unchanged
  And a migration_audit_log record is created with migration_type "trial_skipped" and status "skipped"
  And no suspension email is sent to this merchant

Scenario: Migration job skips already-migrated merchants (idempotency)
  Given a merchant with payPlanType "SUSPENDED"
  When the migration job processes this merchant
  Then no changes are made to the merchant's record
  And a migration_audit_log record is created with status "skipped"
```

### Paid Plan Merchant Migration

```gherkin
Scenario: Plus Plan merchant is remapped to Launch on Migration Day
  Given a merchant with payPlanType "PLUS"
  When the migration job processes this merchant
  Then payPlanType is set to "LAUNCH"
  And billingType is unchanged
  And premiumPlanExpire is unchanged
  And a migration_audit_log record is created with migration_type "plus_to_launch" and status "success"
  And a "paid-confirmation-t0.hbs" email is sent

Scenario: Pro Plan merchant is remapped to Grow on Migration Day
  Given a merchant with payPlanType "PRO"
  When the migration job processes this merchant
  Then payPlanType is set to "GROW"
  And a migration_audit_log record is created with migration_type "pro_to_grow" and status "success"

Scenario: Premium Plan merchant is remapped to Scale on Migration Day
  Given a merchant with payPlanType "PREMIUM"
  When the migration job processes this merchant
  Then payPlanType is set to "SCALE"
  And a migration_audit_log record is created with migration_type "premium_to_scale" and status "success"
```

### Suspended Merchant — Lock Screen and Reactivation

```gherkin
Scenario: Suspended merchant is redirected to lock screen on login
  Given a merchant with payPlanType "SUSPENDED"
  When the merchant logs into the Merchant Dashboard
  Then they are redirected to /suspended
  And the full-screen plan selection lock screen is displayed
  And no other dashboard routes are accessible

Scenario: Suspended merchant reactivates by selecting a plan
  Given a merchant with payPlanType "SUSPENDED"
  And the merchant is on the /suspended plan selection lock screen
  When the merchant selects the "LAUNCH" plan and completes payment
  Then payPlanType is set to "LAUNCH"
  And isSuspended is set to false
  And suspendedAt and suspendedReason are cleared
  And the merchant is redirected to the dashboard
  And the online store goes live

Scenario: OG Merchant promo is automatically applied if within validity window
  Given a merchant with payPlanType "SUSPENDED" and suspendedReason "migration"
  And today's date is within 90 days of T-0
  When the merchant visits the plan selection page
  Then the "OG Merchant" promo code is visible and pre-applied
  And the displayed price reflects 50% off for the first 3 billing cycles

Scenario: Suspended merchant's storefront shows suspension page
  Given a merchant with isSuspended set to true
  When a customer visits the merchant's online store URL
  Then the SuspensionPage component is rendered
  And the page displays "TEMPORARILY SUSPENDED DUE TO NON-PAYMENT"
  And the merchant's contact email and phone are shown
  And the HTTP response status is 503
  And the page has a noindex meta tag
```

### Communication Campaign

```gherkin
Scenario: Announcement email is sent to all Free Plan merchants at T-60
  Given it is T-60 (60 days before Migration Day)
  When the migration-communication-sender job runs
  Then an announcement-t60.hbs email is sent to every merchant with payPlanType "FREE"
  And each email contains the merchant's first name and the migration date
  And each email contains the "OG Merchant" promo code and its expiry date

Scenario: Segmented T-30 email sent to active Free merchant
  Given a Free Plan merchant who placed orders in the last 30 days (Segment A)
  When the T-30 email job runs
  Then reminder-t30-active.hbs is sent to this merchant
  And the email contains the merchant's order count from the last 30 days

Scenario: Paid merchant receives plan mapping email at T-45
  Given a merchant with payPlanType "PLUS"
  When the T-45 email job runs
  Then paid-announcement-t45.hbs is sent to this merchant
  And the email maps "Plus" to "Launch"
```

### OG Merchant Promo Code

```gherkin
Scenario: Promo code is auto-assigned to Free Plan merchants at T-60
  Given the migration-promo-applicator job runs at T-60
  When it processes each Free Plan merchant
  Then the "OG Merchant" promo code is associated with the merchant account via associateStoreWithAutoRewards()
  And the operation is idempotent (running twice does not create duplicate associations)

Scenario: Promo code is marked invalid after valid_until date passes
  Given the migration promo code has a valid_until date
  When the migration-promo-expiry daily job runs after that date
  Then the promo code status is set to invalid
  And merchants who attempt to apply it at checkout receive an error

Scenario: OG Merchant promo expired — merchant still reactivates at full price
  Given a suspended merchant
  And today's date is more than 90 days after T-0
  When the merchant selects a plan on the /suspended lock screen
  Then no promo code is applied
  And full plan pricing is displayed
  And the merchant can still complete payment and reactivate
```

### Admin Tools

```gherkin
Scenario: Admin can view migration progress in real time
  Given the migration-bulk-executor job is running
  When an admin visits /admin/migration-tracking
  Then the dashboard shows total merchants, migrated count, failed count, skipped count
  And the data refreshes in near real-time

Scenario: Admin can query the migration audit log
  Given migration has completed
  When an admin calls GET /admin/migration/audit-log with filters (e.g., status: "failed")
  Then a paginated list of migration_audit_log records matching the filters is returned

Scenario: Admin manually reactivates a suspended merchant
  Given a merchant with payPlanType "SUSPENDED"
  When an admin uses the manual reactivation tool with a selected plan
  Then the merchant's payPlanType is updated to the selected plan
  And isSuspended is set to false
  And the action is logged in the audit trail

Scenario: Migration job halts when failure rate exceeds threshold
  Given the migration-bulk-executor is processing merchants
  When more than 10% of merchants in a batch fail
  Then the job halts immediately
  And on-call engineering receives an alert
  And the admin migration tracking dashboard shows the halt status
```

### Edge Cases

```gherkin
Scenario: Free merchant converts to paid before Migration Day
  Given a Free Plan merchant with the "OG Merchant" promo code applied
  And the merchant subscribes to "LAUNCH" 10 days before T-0
  When the migration-bulk-executor runs on T-0
  Then the merchant's payPlanType is "LAUNCH" (already migrated)
  And the migration job skips this merchant with status "skipped"

Scenario: Paid merchant has unfulfilled orders at migration
  Given a Plus Plan merchant with 3 unfulfilled orders
  When the migration job runs on T-0
  Then the merchant's plan is remapped to "LAUNCH"
  And all orders are preserved and remain accessible after migration
  And the merchant can access and fulfill orders after logging in

Scenario: Free merchant with active trial — trial end date protection
  Given a merchant with payPlanType "PREMIUM_TRIAL" and trial end date 5 days after T-0
  When the migration job runs on T-0
  Then the merchant's trial continues uninterrupted
  And the trial end date is not shortened
  And after the trial expires, the standard trial-to-paid flow applies

Scenario: Pro merchant cancels plan 3 days before T-0
  Given a merchant with payPlanType "PRO" who cancelled their plan 3 days before T-0
  And their billing period ends 15 days after T-0
  When the migration job runs on T-0
  Then the merchant's payPlanType is mapped to "GROW"
  And billing continues until end of billing period
  When the billing period ends
  Then suspendMerchant() is called (no free fallback)
```

---

# Traceability Map

| FR | Gherkin Scenario(s) |
|---|---|
| FR-1 (new plan enum values) | Free Plan merchant suspended; Paid plan remapped (PLUS→LAUNCH, PRO→GROW, PREMIUM→SCALE) |
| FR-2 (new Store fields) | Free Plan merchant suspended — verifies suspendedAt, suspendedReason, lastActivePlan, isSuspended |
| FR-3 (migration_audit_log) | All migration scenarios verify audit log record creation |
| FR-4 (merchant_trial_info) | Active Premium Trial merchant skipped |
| FR-5 (migration-bulk-executor job) | All job execution scenarios |
| FR-6 (suspendMerchant function) | Free Plan merchant suspended; Suspended merchant reactivates |
| FR-7 (revertToFreePlan removed) | Pro merchant cancels before T-0 — falls to suspended, not free |
| FR-8 (rollback script) | — (covered by NFR-4; non-happy-path scenario) |
| FR-9 (communication sender job) | Announcement email at T-60; T-30 segmented email; Paid T-45 email |
| FR-10 (merchant segmentation) | T-30 segmented email to active Free merchant |
| FR-11 (email templates) | All email communication scenarios |
| FR-12 (in-app migration banner) | — (UX requirement; covered by FR-12 directly) |
| FR-13 (in-app migration modal) | — (UX requirement; covered by FR-13 directly) |
| FR-14 (OG Merchant promo config) | OG Merchant promo applied; Promo expired — full price |
| FR-15 (promo applicator job) | Promo code auto-assigned at T-60 |
| FR-16 (promo expiry job) | Promo code marked invalid after valid_until |
| FR-17 (getPlanPricingBreakdown updated) | OG Merchant promo automatically applied if within validity window |
| FR-18 (route guard) | Suspended merchant redirected to lock screen |
| FR-19 (/suspended lock screen) | Suspended merchant on lock screen; OG Merchant promo displayed |
| FR-20 (subscribe flow — new plans) | Suspended merchant reactivates by selecting a plan |
| FR-21 (storefront isSuspended check) | Suspended merchant's storefront shows suspension page |
| FR-22 (SuspensionPage component) | Storefront suspension page — 503, noindex, contact info |
| FR-23 (admin migration dashboard) | Admin views migration progress; migration job halts on high failure rate |
| FR-24 (admin accounts filters) | — (admin UX requirement) |
| FR-25 (admin manual override) | Admin manually reactivates suspended merchant |
| FR-26 (createUpcomingInvoices cron) | Pro merchant cancels before T-0 — billing ends → suspended |
| FR-27 (win-back sender job) | — (post-migration job; covered by rollout plan) |
| FR-28 (Rewards model update) | Promo auto-assigned; tier values accepted |
| FR-29 (shadow period) | — (covered by NFR-7; described in rollout Phase 4) |
