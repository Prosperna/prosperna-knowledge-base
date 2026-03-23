---
id: st-12-admin-control-platform-updates
title: BRD. ST-12 Admin Control Platform Updates
sidebar_label: ST-12 Admin Control Platform Updates
sidebar_position: 12
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform currently transitioning its subscription pricing structure from **Free / Plus / Pro / Premium** to **Launch / Grow / Scale**, with new account states — **Trial** and **Suspended** — replacing the previous always-free Free tier. Alongside this, Prosperna is introducing **dual payment gateways** (Stripe for US merchants, Xendit for PH merchants) for subscription billing, and **removing convenience fees** from all new customer-to-merchant order transactions.

The **Admin Control Platform** (`/admin/` routes in `prosperna1`, the React SPA) is the primary tool used by Prosperna's internal support, operations, and finance teams to manage merchant accounts. As of today, the platform:

- Only recognizes the old plan names (`FREE`, `PLUS`, `PRO`, `PREMIUM`, `PREMIUM_TRIAL`)
- Has no concept of Trial or Suspended account states
- Shows no Payment Gateway column on invoice or transaction screens — all subscriptions were historically Xendit-only
- Has no manual override tools for support agents (trial extension, account reactivation, usage limit reset)
- Contains promo code tier dropdowns that reference old plan names only

Without updating the Admin Control Platform, support and finance teams will be unable to correctly identify, manage, or report on merchants once the pricing migration begins. This is a **blocking dependency for the pricing restructuring launch**.

---

## Goals

1. Update all affected admin screens to recognize and display new plan tier names (`TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED`) alongside legacy names for historical records.
2. Introduce explicit Payment Gateway visibility (Stripe vs Xendit) across invoice and transaction views, enabling unified reporting and gateway-specific reconciliation.
3. Equip support admins with four manual override tools — Extend Trial, Reactivate Suspended Account, Apply Promo Code, and Reset Usage Limits — each requiring a reason and producing an audit log entry.
4. Update the Rewards/Promo Codes page to support new tier names for new promo creation while preserving old tier labels on historical records.
5. Reflect zero convenience fees on new order transactions without removing the columns, so historical data remains visible alongside new data.

---

## Non-Goals

- **Migration Tracking Dashboard** (deferred to a future release)
- **Enforcement Dashboard** (deferred to a future release)
- **Cancellation Analytics Dashboard** (deferred to a future release)
- Merchant Dashboard UI changes (covered by ST-11)
- Storefront / Online Store changes (covered by ST-13)
- Email template content (covered by ST-14)
- Background job implementation internals (covered by ST-15)
- Usage limit enforcement logic (covered by ST-06; ST-12 only provides override tools)
- Stripe and Xendit payment integration code (covered by ST-01; ST-12 only consumes data)
- CSLA (Customer Support Login Access) changes — CSLA continues as-is regardless of plan type
- Billing Verification (KYB) page changes — KYB is plan-agnostic
- Withdrawal and Marketing Campaigns page changes — not affected by pricing restructuring
- Audit log UI / admin-facing log viewer (backend log only for v1)
- Marketing website pricing page updates

---

## Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| Product Team | Owner / Decision Maker | Ensures admin tooling supports pricing migration launch |
| Support Team | Primary end-user | Needs override tools to manage trial and suspended accounts |
| Finance Team | Primary end-user | Needs unified Stripe + Xendit invoice/transaction reports for reconciliation |
| Operations Team | Primary end-user | Needs correct plan filters and promo code management for new tiers |
| Engineering (Frontend) | Implementor | `prosperna1` React SPA — admin screens |
| Engineering (Backend) | Implementor | `admin-service-api`, `business-profile-api`, `payment-integration-api`, `orders-service-api` |

---

## Personas

### PA-1: Support Admin
Internal Prosperna support agent. Handles merchant escalations, trial extensions, account reactivations, and ad-hoc promo code assignments. Uses the Accounts List page and the `...` row action menu daily. Needs correct status labels and reliable override tools.

### PA-2: Finance Admin
Internal Prosperna finance team member. Performs monthly reconciliation between Prosperna's internal records and Stripe/Xendit dashboards. Uses Account Invoices and Admin Transactions pages. Needs explicit Payment Gateway columns and currency-accurate exports.

### PA-3: Operations Admin
Internal Prosperna operations team member. Manages promo code campaigns, monitors plan tier distribution, and handles merchant onboarding edge cases. Uses Rewards/Promo Codes and Accounts List pages.

---

## Business Value

| Value Driver | Description |
|---|---|
| **Migration Launch Enablement** | Without updated admin screens, Prosperna cannot safely execute the Free → Suspended migration; support agents would see incorrect plan labels and have no tools to handle edge cases. |
| **Finance Reconciliation Efficiency** | Unified Stripe + Xendit invoice/transaction views with Payment Gateway columns eliminate the need for manual cross-referencing between two gateway dashboards. |
| **Support Self-Sufficiency** | Manual override tools let support agents resolve trial extensions, reactivations, and usage limit resets without engineering intervention, reducing ticket resolution time. |
| **Promo Campaign Integrity** | Updated promo tier dropdowns ensure new campaigns target correct plan tiers and prevent misconfigured promos from applying to wrong merchants. |

---

## Scope

### In Scope

1. **Accounts List page** (`/admin/accounts`) — new status/plan filters, five new table columns, four new row actions
2. **Account Invoices page** (`/admin/accounts/:accountId/invoices`) — Payment Gateway column, updated plan name labels, currency toggle integration
3. **Admin Transactions page** (`/admin/transactions`) — Payment Gateway column and filter, unified Stripe + Xendit view, convenience fee zero-out behavior, CSV export update
4. **Transaction Report (Detail) page** (`/admin/transaction-report/:_id`) — convenience fee and Prosperna Earning behavioral update for new orders, Payment Gateway field in header
5. **Rewards / Promo Codes page** (`/admin/rewards`) — updated Assignment Subscription Tier dropdown for new promos, updated merchant plan filter in left panel, promo validation logic update
6. **Override Tools** (triggered from Accounts List `...` menu):
   - Extend Trial modal + `POST /admin/merchants/:id/extend-trial` endpoint
   - Reactivate Suspended Account modal + `POST /admin/merchants/:id/reactivate` endpoint
   - Apply Promo Code modal + `POST /v1/admin/rewards/:id/assign` endpoint (updated)
   - Reset Usage Limits modal + `POST /admin/merchants/:id/reset-usage` endpoint
7. **Existing API endpoint updates** for rewards and invoices to support new tier names and Payment Gateway field
8. **New API endpoints** for all four override tools and unified invoice/transaction views
9. **CASL permission additions** for new override actions and the Bypass Payment restriction to Super Admin

### Out of Scope

See Non-Goals section above.

---

## Assumptions

| ID | Assumption |
|---|---|
| A-1 | ST-01 (Payment Abstraction Layer) delivers the `payment_gateway` field on `plansubscriptioninvoices` and subscription records before ST-12 UI is deployed. |
| A-2 | ST-03 (Trial System) delivers `merchant_trial_info` collection, `payPlanType: 'TRIAL'` on store records, and background jobs for trial expiry before the Extend Trial override is deployed. |
| A-3 | ST-04 (Suspended State) delivers `payPlanType: 'SUSPENDED'`, `suspendedAt`, `suspendedReason`, `lastActivePlan` fields and the `reactivateMerchant()` service function before the Reactivate override is deployed. |
| A-4 | ST-10 (Promo Code System) updates the rewards model to accept `LAUNCH`, `GROW`, `SCALE` as valid tier values and updates USD pricing support before promo dropdown changes are deployed. |
| A-5 | Old plan names (`FREE`, `PLUS`, `PRO`, `PREMIUM`) are retained indefinitely in historical records and are never retroactively renamed. |
| A-6 | The existing currency toggle implementation will be applied to the invoice views; toggling to USD shows only USD records; toggling to PHP shows only PHP records — no conversion is performed. |
| A-7 | Audit log entries for override actions are written to a backend log (existing or new audit log collection); no admin-facing log viewer UI is required for v1. |
| A-8 | CASL permission enforcement is implemented server-side in addition to client-side UI gating. |
| A-9 | The `merchants.bypass_payment` permission is exclusively assignable to Super Admin role and is not configurable per individual admin user. |

---

## Dependencies

| Dependency | Subtask | What ST-12 Needs |
|---|---|---|
| Payment Abstraction Layer | ST-01 | `payment_gateway` field on invoice/subscription records; Stripe subscription data in unified collections; USD pricing |
| Trial System | ST-03 | `merchant_trial_info` collection with `trial_end_date`; `payPlanType: 'TRIAL'`; background job reschedule API |
| Suspended State | ST-04 | `payPlanType: 'SUSPENDED'`, `suspendedAt`, `suspendedReason`, `lastActivePlan` on stores; `reactivateMerchant()` and `suspendMerchant()` service functions |
| Cancellation Flow | ST-05 | `subscription_cancellations` collection (future Cancellation Analytics — deferred) |
| Usage Limits | ST-06 | `merchant_usage`, `merchant_enforcement_state`, `enforcement_event_log` collections; Reset Usage endpoint targets these |
| Promo Code System | ST-10 | Updated rewards model with new tier values; promo validation supporting USD pricing |
| Migration Job | ST-16 | Promo code bulk assignment job for OG Merchant promo (ST-12 provides the promo creation tools; ST-16 runs the job) |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **ST-01 delays block Payment Gateway column** | Medium | High | UI displays "N/A" when `payment_gateway` field is absent; no hard dependency on ST-01 for other screen updates |
| **ST-03 / ST-04 delays block override tools** | Medium | High | Override tools can be hidden behind feature flags until dependent subtasks deliver; deploy screen updates first |
| **Old/new plan names coexisting confuses admin users** | Low | Medium | Clearly label legacy plan names in filter dropdowns (e.g., "FREE (Legacy)"); document in admin release notes |
| **Unified transaction view performance degradation** | Low | Medium | Use indexed queries, server-side pagination; adhere to global API performance standards |
| **Bypass Payment misuse or unauthorized access** | Low | High | Restrict `merchants.bypass_payment` to Super Admin only; always audit-log; require explicit reason text |
| **Promo tier mismatch for existing promos** | Low | Low | Existing promos retain their original tier labels in the listing; only new promo creation uses new tier values |

---

## Compliance and Privacy Notes

- All manual override actions (Extend Trial, Reactivate, Apply Promo Code, Reset Usage Limits) must produce an **audit log entry** containing: admin user ID, timestamp, action type, target merchant ID, and the reason string provided by the admin.
- Audit logs must not be editable or deletable by any admin role.
- The **Bypass Payment** toggle exposes financial override capability. Access must be restricted to the `merchants.bypass_payment` CASL permission, assigned only to Super Admin. This restriction must be enforced **server-side**.
- Invoice and transaction data includes merchant financial records. Admin access is already gated by admin authentication and CASL; no additional PII handling changes are required for v1.

---

## Success Metrics

| Metric | Target |
|---|---|
| All admin screens correctly display `TRIAL`, `LAUNCH`, `GROW`, `SCALE`, `SUSPENDED` plan labels post-migration | 100% of new merchant records show new labels |
| Finance team exports unified Stripe + Xendit reports without manual gateway cross-referencing | Zero manual reconciliation steps needed for gateway filtering |
| Support team resolves trial extensions and reactivations without engineering tickets | Override tools functional for all four action types at launch |
| All override actions produce audit log entries | 100% of override actions logged with admin ID, timestamp, action, merchant ID, and reason |
| Promo code creation for new plans uses new tier names exclusively | Zero promos created post-migration with old tier values |
