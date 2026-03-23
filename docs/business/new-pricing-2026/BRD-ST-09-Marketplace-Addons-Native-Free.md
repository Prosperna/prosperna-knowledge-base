---
id: st-09-marketplace-addons-native-free
title: BRD. ST-09 Marketplace Add-Ons — Native Apps Become Free
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
- Priority: MEDIUM

---

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform. Its **Marketplace** is a section in the Merchant Dashboard where merchants can browse and activate add-on feature modules for their stores (Blogs, Wholesale, Order Scheduling, Custom Fonts, etc.). Today, some of these modules are free and some require a separate paid subscription with their own independent billing cycle, distinct from the merchant's core plan.

This separate per-feature billing model creates friction:

1. Merchants who want multiple native features (e.g., Blogs + Custom Fonts + Wholesale) must evaluate, subscribe to, and manage three separate billing cycles.
2. The model works against Prosperna's evolving **"Almost Everything Is Included"** value proposition for the US SMB market — it makes Prosperna look like Shopify's over-bloated, pay-per-feature model rather than a simpler, more inclusive alternative.
3. Revenue is fragmented across small add-on subscriptions instead of being consolidated in higher-value core plan tiers (Launch/Grow/Scale).

The only Marketplace apps with justified external billing are **Lazada** and **Shopee** integrations, which involve 3rd-party API costs and partner agreements.

---

## Goals

1. Eliminate paid subscriptions for all **natively built** Marketplace apps. Merchants activate them with a single click at no additional cost.
2. Retain paid subscription billing for **3rd-party integrations** (Lazada and Shopee) only.
3. Seamlessly migrate existing merchants who have active paid subscriptions for native apps — cancel their billing while keeping the feature active.
4. Notify affected merchants about the change.
5. Preserve all historical billing records for accounting and admin visibility.
6. Simplify the Marketplace UI to reflect the free/paid distinction clearly.

---

## Non-Goals

1. Proactive refunds for recent charges on now-free native apps (handled case-by-case by support).
2. Adding new Marketplace apps or redesigning the overall Marketplace page layout.
3. Changing Lazada or Shopee pricing tiers.
4. Changing order paywall quota logic for Lazada/Shopee.
5. Changing the core plan subscription model (covered by ST-01).
6. Feature gating native apps by plan tier — all native apps are available equally across TRIAL, LAUNCH, GROW, and SCALE plans.

---

## Stakeholders

| Role | Name/Team | Interest |
|---|---|---|
| Product Owner | Prosperna Product Team | Strategic direction — "Almost Everything Is Included" |
| Engineering Lead | Backend & Frontend Teams | Implementation and migration |
| Business Analyst | BA Team | Requirements and documentation |
| Finance/Accounting | Prosperna Finance | Historical billing preservation, revenue impact |
| Customer Support | Support Team | Merchant notification and handling edge-case refund requests |
| Prosperna Admins | Admin Control Platform Users | Visibility into marketplace invoices (historical) |

---

## Personas

### Persona 1 — PH Merchant (Existing, with Paid Native App Subscriptions)
- Currently paying a separate subscription for one or more native apps (e.g., ₱495/mo for Blogs, ₱299/mo for Wholesale).
- Benefit: Subscription billing cancelled automatically; features remain active at no cost.
- Risk if done poorly: Feature interruption during migration; unexpected charges; no communication.

### Persona 2 — US Merchant (New or Existing)
- Uses LAUNCH/GROW/SCALE core plan priced in USD.
- Has never subscribed to native app add-ons (these were PH-priced) or is onboarding post-change.
- Benefit: Can freely activate any native Marketplace app with one click.

### Persona 3 — PH Merchant (New, Post-Change)
- Onboards after the change. Sees native apps as "Free — Activate" on first visit to Marketplace.
- Benefit: Cleaner onboarding — no separate billing decisions for built-in features.

### Persona 4 — Merchant Subscribing to Lazada/Shopee
- PH merchant who wants to sell on Lazada or Shopee.
- No change to their experience — paid subscription flow via Xendit remains intact.

### Persona 5 — Prosperna Admin
- Views marketplace invoices for merchants in the Admin Control Platform.
- Historical invoices for now-free native apps remain visible; new native app activations will not generate invoices going forward.

---

## Business Value

| Value Driver | Detail |
|---|---|
| **"Almost Everything Is Included" positioning** | Differentiates Prosperna from Shopify's over-fragmented feature billing. Native capabilities are bundled into the core plan. |
| **Merchant experience simplification** | Merchants no longer evaluate, subscribe, and manage separate billing cycles for built-in features. Activation is a single click. |
| **Revenue consolidation** | Add-on subscription revenue migrates to higher-value core plan tiers (Launch/Grow/Scale). The plan tiers carry the monetization weight. |
| **Reduced churn risk** | Merchants who churned because individual add-ons felt expensive can now stay on a core plan and use all native features freely. |
| **US market readiness** | Native apps were effectively only sold to PH merchants. Making them free removes a pricing asymmetry and smooths the US expansion experience. |

---

## Scope

### In Scope

| # | Change | Area |
|---|---|---|
| 1 | Update `PAID_MARKETPLACE_APP_KEYS` constant to `['lazada', 'shopee']` only | Backend — `payment-integration-api` |
| 2 | Marketplace subscribe endpoint: skip payment flow for native apps, directly activate | Backend — `payment-integration-api` |
| 3 | Marketplace listing UI: show "Free — Activate" for native apps | Frontend — `prosperna1` |
| 4 | Marketplace app detail UI: skip payment form for native apps | Frontend — `prosperna1` |
| 5 | One-time migration: cancel active billing for existing native paid subscriptions | Backend — `payment-integration-api` |
| 6 | One-time migration: send notification email to affected merchants | Backend — `email-service-api` |
| 7 | Agenda jobs: skip expiry/renewal logic for native apps | Backend — `payment-integration-api` |
| 8 | Announcements order paywall: set quota to unlimited | Backend — `orders-service-api` |
| 9 | On account suspension: deactivate all marketplace apps (native + paid) | Backend — `business-profile-api` |
| 10 | On reactivation from suspension: auto-restore native apps; require manual resubscription for Lazada/Shopee | Backend — `business-profile-api` |

### Out of Scope

| Item | Reason |
|---|---|
| Proactive refunds for existing paid native app subscriptions | Handled case-by-case by support |
| Adding new Marketplace apps | Separate initiative |
| Feature gating native apps by plan tier | All native apps are available on all paid plans equally |
| Marketplace UI redesign | Only button labels and pricing display change |
| Lazada/Shopee pricing adjustments | No change to 3rd-party app pricing |
| Order paywall quota changes for Lazada/Shopee | Paywall logic for paid 3rd-party apps unchanged |

---

## Assumptions

| # | Assumption |
|---|---|
| A-1 | Lazada and Shopee remain **Xendit-only** — PH merchants only. They do NOT go through the new Payment Abstraction Layer (ST-01). |
| A-2 | No database schema changes are required. The change is behavioral (skip billing flow) rather than structural. |
| A-3 | `additionalFee` app continues to require a paid plan (TRIAL/LAUNCH/GROW/SCALE) — its `mustBeOnPaidPlan` middleware guard is unchanged. |
| A-4 | The geolocation app key in the codebase may differ from `geolocation` — dev team verifies and removes it from `PAID_MARKETPLACE_APP_KEYS`. |
| A-5 | Merchants on FREE plan (if any exist) cannot activate native marketplace apps — they must first subscribe to a paid core plan. |
| A-6 | Storefront (`p1-customer`) requires no changes — it consumes feature flags based on whether an app is active on the store, not on how it was activated. |
| A-7 | Historical marketplace invoices and subscription records are never deleted. |

---

## Dependencies

| Dependency | Type | Detail |
|---|---|---|
| ST-04 — Suspended Account State | Cross-task | Suspension logic in `store-plan.service.ts` is the enforcement point for deactivating all marketplace apps on suspension. Reactivation logic auto-restores native apps. |
| ST-01 — Core Plan Restructuring | Cross-task | Plan name references (PLUS/PRO/PREMIUM → LAUNCH/GROW/SCALE) may need updating in Agenda jobs. |
| Xendit | External | Existing active Xendit recurring plans for native apps must be cancelled via Xendit API during migration. |
| `email-service-api` | Internal | Required for merchant notification emails about migrated subscriptions. |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Migration script cancels billing but fails to keep app active | Medium | High — merchant loses feature access | Transaction/rollback logic: cancel billing only after confirming activation status preserved; keep an audit log per merchant per app |
| Xendit API failures during bulk migration | Medium | Medium — some merchants not migrated | Run migration in batches; retry failed Xendit cancellations; skip and log for manual follow-up |
| Merchant not notified | Low | Medium — confusion, support tickets | Verify email delivery report post-migration; allow support to re-send |
| Geolocation app key mismatch | Medium | Low — one app not transitioned | Dev team verifies key in codebase before migration run |
| Agenda job still attempts renewal for native app that was marked inactive | Low | Low — payment would fail gracefully, no charge | Review and update `SCHEDULE_ADDON_EXPIRED_INTEGRATION` and `SCHEDULE_ADDON_EXPIRE_BELL_NOTIF` before migration |
| Admin views show no new marketplace invoices and flags as reporting gap | Low | Low | Document: new invoices only for Lazada/Shopee going forward; historical invoices preserved |

---

## Compliance and Privacy Notes

| Item | Detail |
|---|---|
| **Historical billing records** | All past marketplace invoices for native apps (Blogs, Wholesale, etc.) are preserved indefinitely. These represent real financial transactions and must remain available for accounting audits. |
| **Subscription record preservation** | Historical marketplace subscription records are preserved with status updated to `INACTIVE` and reason `migrated_to_free`. No records are deleted. |
| **Xendit recurring plan records** | Records are preserved in the database. The plan is deactivated in Xendit (no further charges), but the DB record is kept. |
| **Merchant data** | No PII changes. Notification emails use existing merchant contact data already on file. |

---

## Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Native app adoption rate post-launch | ≥ 2× increase in native app activations within 30 days | Dashboard analytics — marketplace activation events |
| Migration success rate | 100% of active paid native subscriptions cancelled with app kept active | Migration audit log |
| Merchant notification delivery | ≥ 95% delivery rate | Email service delivery report |
| Support tickets about marketplace billing | ≥ 30% reduction within 60 days of launch | Support ticket categorization |
| App activation errors post-launch | 0 regressions on Lazada/Shopee paid flow | QA smoke tests + production error monitoring |
