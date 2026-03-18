---
id: st-03-14-day-premium-trial-system
title: BRD. ST-03 14-Day Premium Trial System
sidebar_label: ST-03 14-Day Premium Trial System
sidebar_position: 3
---

**Version:** 1.0
**Date:** 2026-03-17
**Status:** Draft
**Prepared by:** Business Analyst Agent

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Scope](#3-scope)
4. [Stakeholders](#4-stakeholders)
5. [Current State Problem Statement](#5-current-state-problem-statement)
6. [Proposed Solution](#6-proposed-solution)
7. [Business Rules](#7-business-rules)
8. [Success Metrics](#8-success-metrics)
9. [Assumptions](#9-assumptions)
10. [Dependencies](#10-dependencies)
11. [Risks](#11-risks)
12. [Open Questions](#12-open-questions)

---

## 1. Executive Summary

The **14-Day Premium Trial System** replaces the existing Free Plan as the default starting point for all new merchant signups on the Prosperna platform. Rather than landing on a permanently limited free tier, every new merchant automatically receives full Scale-tier access for 14 calendar days at no cost, with no credit card required at sign-up.

This change is intended to improve trial-to-paid conversion rates, eliminate infrastructure costs from non-paying Free Plan users, and give prospective merchants a genuine evaluation experience that mirrors a fully paid subscription. If the merchant does not convert to a paid plan within 14 days, the account transitions to a **Suspended** state managed by ST-04.

This feature launches exclusively for **new signups**. Existing Free Plan merchants are unaffected until the separate ST-16 migration initiative.

---

## 2. Business Objectives

| # | Objective | Rationale |
|---|---|---|
| BO-1 | Replace the Free Plan as the default new-user acquisition tier | The Free Plan attracts non-serious users, consumes infrastructure with no revenue path, and creates a high perceived gap between free and paid capabilities. |
| BO-2 | Increase trial-to-paid conversion to >15% within 14 days | A full-feature trial creates a higher-quality evaluation experience, reducing drop-off caused by feature gaps. |
| BO-3 | Increase 30-day cumulative conversion to >25% | Including win-back reactivations from suspended accounts extends the effective conversion window. |
| BO-4 | Reduce average time to conversion to under 10 days | A time-limited trial with urgency signals (banner, prompts, emails) accelerates purchase decisions. |
| BO-5 | Create a predictable revenue funnel | Moving from an open-ended Free Plan to a 14-day time-boxed trial makes acquisition costs and conversion rates measurable and optimizable. |
| BO-6 | Align Prosperna's onboarding with SaaS industry best practices | Full-feature time-limited trials are standard in B2B SaaS. This positions Prosperna competitively and reduces onboarding friction. |

---

## 3. Scope

### 3.1 In Scope

| Area | What Is Included |
|---|---|
| **Signup provisioning** | Default plan type changed from `FREE` to `TRIAL` on new account creation. `merchant_trial_info` record created at signup. |
| **Trial access** | Full Scale-tier feature access and usage limits for 14 days (10,000 SKUs, 2,500 orders/month, 150 GB bandwidth, 100 GB storage, unlimited admin users, unlimited store locations). |
| **Trial banner** | Persistent, non-dismissable countdown banner on the Merchant Dashboard. Three states: standard (Days 14–8), urgency (Days 7–3), critical (Days 2–1). |
| **Onboarding checklist** | 6-step guided setup checklist visible only to trial merchants. Completion tracked per step. |
| **In-app conversion prompts** | Four scheduled prompts at Days 5 (conditional), 7, 12, and 13 to drive plan selection. |
| **Plan comparison & selection page** | Updated plan page showing Launch ($29/mo), Grow ($59/mo), Scale ($149/mo) in USD. Grow plan carries the "RECOMMENDED" badge at all times. |
| **Billing cycle selection** | Monthly, Quarterly (3× monthly, no discount), Annual (12 months + 1 free month). |
| **Payment gateway selection** | Stripe and Xendit both available. Auto-selected by `marketCountry`; merchant can override. |
| **Conversion flow** | Calls ST-01 Payment Abstraction Layer. On success: updates plan, stops trial, starts billing. |
| **Excess SKU warning** | When a trial merchant selects a lower-tier plan, shows excess-SKU warning before payment. Excess SKUs hidden (not deleted) post-conversion. |
| **Background jobs** | `trial-expiry-checker` (hourly) and `trial-expiry-processor` (hourly) Agenda jobs. |
| **Middleware updates** | `mustBeOnPaidPlan` middleware updated to include `TRIAL` as an allowed plan type. |
| **API changes** | New `GET /api/v1/trial/status` endpoint. Modified signup and merchant status endpoints. |
| **Legacy deprecations** | Remove `subscribeToTrialPlan()`. Deprecate `alreadyClaimedFreeTrial`. Keep `PREMIUM_TRIAL` as legacy read-only. Replace `changePlan('FREE')` on expiry with `suspendMerchant()`. |
| **Anti-abuse** | One trial per email address enforced at signup via Cognito. |
| **Frontend** | React components on `prosperna1` Merchant Dashboard for banner, checklist, prompts, and updated plan comparison page. |

### 3.2 Out of Scope

| Area | Owned By |
|---|---|
| Suspension lock screen and suspended account state | ST-04 |
| Admin manual trial extension tool | ST-12 |
| Trial drip email content, templates, and delivery | ST-08 (ST-03 owns trigger scheduling only) |
| Payment gateway setup and abstraction layer | ST-01 |
| Usage limits enforcement (80%/95%/100%/125% stages) | ST-06 |
| Existing Free Plan merchant migration | ST-16 |
| Downgrade/upgrade plan flow details | ST-05 |
| Promo code management and discount engine | ST-10 |

---

## 4. Stakeholders

| Role | Party | Interest |
|---|---|---|
| **Primary Users** | New Merchants | Experience the full platform value during trial; convert to a paid plan at a price that fits their business. |
| **Platform Owner** | Prosperna Product Team | Increase conversion rates, reduce infrastructure cost from non-paying users, and establish a predictable revenue funnel. |
| **Revenue** | Finance / Growth Team | Trial conversion directly drives subscription MRR growth. |
| **Operations** | Prosperna Admin Team | Gains trial status visibility in merchant management; manual trial extension is handled separately via ST-12. |
| **Engineering** | Backend (business-profile-api, user-service-api, payment-integration-api, products-service-api) and Frontend (prosperna1) teams | Implement the trial lifecycle, new data model, background jobs, and UI components. |
| **QA** | QA Team | Validate the trial lifecycle, conversion flows, expiry, anti-abuse measures, and legacy deprecations. |
| **ST-08 Team** | Email Campaign Team | Receives trigger signals from ST-03 jobs; owns email content and delivery. |
| **ST-04 Team** | Suspended Account Team | ST-03 calls `suspendMerchant()` from ST-04 on trial expiry. |
| **ST-01 Team** | Payment Abstraction Layer Team | ST-03 calls the unified subscription creation API from ST-01 during plan conversion. |

---

## 5. Current State Problem Statement

### What exists today

New merchants sign up and are placed on a **permanent Free Plan** (`payPlanType = 'FREE'`) with severely limited capabilities:
- 10 product SKU limit
- No access to premium features
- No time pressure to upgrade

A secondary "Premium Trial" (`PREMIUM_TRIAL`) exists as an optional, manually claimable 14-day upgrade available to Free Plan merchants. This trial is underused, easily forgotten, and when it expires, the account simply reverts to the Free Plan — there is no meaningful consequence that drives conversion.

### Problems this creates

| Problem | Impact |
|---|---|
| Free Plan attracts non-serious merchants | Infrastructure costs with zero revenue contribution |
| Large feature gap between Free and paid | Merchants cannot evaluate Prosperna's real value proposition |
| Optional Premium Trial is low-awareness | Most Free Plan merchants never claim it |
| Trial expiry reverts to Free Plan, not conversion | No urgency; merchants stay on Free Plan indefinitely |
| Old plan names (Free, Plus, Pro, Premium in PHP) are misaligned with new USD pricing strategy | Confusing to new international merchants |

---

## 6. Proposed Solution

Every new Prosperna merchant signup automatically starts a **14-day free trial** with full Scale-tier access. No credit card is required. At any point during or after the trial, the merchant can select a paid plan (Launch, Grow, or Scale) and begin their subscription.

If the merchant does not select a paid plan by the end of Day 14, their account is automatically **suspended** (ST-04), which locks the dashboard behind a plan selection paywall and replaces the storefront with a suspension page.

A guided onboarding checklist and escalating conversion prompts (in-app and via email) drive merchants toward plan selection throughout the trial.

### Solution Pillars

| Pillar | Description |
|---|---|
| **Full-feature evaluation** | Scale-tier limits during trial give merchants the real experience, removing the feature gap that caused Free Plan stagnation. |
| **Time-bounded urgency** | A fixed 14-day window with a persistent countdown creates natural urgency without an artificial paywall. |
| **Guided onboarding** | The 6-step checklist helps merchants achieve value milestones that correlate with higher conversion. |
| **Smart conversion funnel** | Escalating prompts and drip emails (ST-08) nudge merchants toward plan selection at high-leverage moments (Day 5, 7, 12, 13). |
| **Clear plan choices** | Three USD-priced plans (Launch/Grow/Scale) with a default "Grow" recommendation simplify the decision. |
| **Hard expiry with reactivation path** | Suspension (not reversion to Free) creates the urgency needed for post-trial conversion via win-back flows. |

---

## 7. Business Rules

### Trial Rules

| Rule ID | Rule |
|---|---|
| BR-1 | Every new merchant signup automatically starts on the `TRIAL` plan. This is not optional or claimable. |
| BR-2 | The trial duration is exactly 14 calendar days from the signup timestamp. It cannot be shortened. |
| BR-3 | The trial can only be extended by a Prosperna Admin via the manual override tool (ST-12, out of scope). |
| BR-4 | No credit card or payment information is required during signup or at any point during the trial. |
| BR-5 | Trial merchants receive full Scale-tier access (10,000 SKUs, 2,500 orders/month, 150 GB bandwidth, 100 GB storage, unlimited admin users, unlimited store locations). |
| BR-6 | Trial stores are fully live-capable. Customers can browse, add to cart, and complete orders during the trial. |
| BR-7 | The trial cannot be paused. The 14-day clock runs continuously from the moment of signup. |
| BR-8 | One trial per email address. A merchant cannot start a new trial with an email already registered in the system. |
| BR-9 | The trial banner is permanently visible during the trial and cannot be dismissed by the merchant. |

### Conversion Rules

| Rule ID | Rule |
|---|---|
| BR-10 | Selecting a paid plan during the trial immediately ends the trial. The billing cycle starts from the conversion date, not the signup date. |
| BR-11 | On conversion, all trial-related drip email scheduling is cancelled. |
| BR-12 | If a trial merchant (Scale-tier) converts to Launch or Grow (lower limits), any excess SKUs are **hidden from the storefront** but not deleted. |
| BR-13 | A warning is displayed to the merchant before payment if their current product count exceeds the selected plan's SKU limit. |
| BR-14 | The Grow plan displays a "RECOMMENDED" badge on the plan comparison page for all merchants at all times. |
| BR-15 | Payment gateway auto-selection defaults to Stripe for `marketCountry === 'US'`, Xendit for `marketCountry === 'PH'`, and Stripe for all other countries. The merchant can override to any available gateway. |
| BR-16 | Billing cycle options are Monthly (1× monthly price), Quarterly (3× monthly price, no discount), and Annual (12× monthly price — equivalent to 13 months for the price of 12). |

### Expiry Rules

| Rule ID | Rule |
|---|---|
| BR-17 | If the merchant has not selected a paid plan by the end of Day 14, the account is immediately suspended. There is no grace period. |
| BR-18 | Suspension is processed by the `trial-expiry-processor` background job, which runs hourly and calls `suspendMerchant()` from ST-04. |
| BR-19 | A suspended merchant's data (products, orders, settings) is preserved indefinitely. Nothing is deleted on suspension. |
| BR-20 | A suspended merchant can reactivate at any time by selecting a paid plan and completing payment. |

---

## 8. Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Trial-to-Paid Conversion Rate (14 days) | > 15% | `merchant_trial_info.converted_to_paid = true` within trial window / total new signups |
| Trial-to-Paid Conversion Rate (30 days) | > 25% | Conversions within 30 days of signup (including post-suspension reactivations) / total new signups |
| Average Time to Conversion | < 10 days | `merchant_trial_info.conversion_date - merchant_trial_info.trial_start_date` (average) |
| Onboarding Completion Rate | > 60% | % of trial users who complete 4 or more of the 6 onboarding checklist steps |
| Trial Engagement Rate | > 70% | % of trial users who log in 3 or more times during the 14-day trial |
| Store Publish Rate During Trial | > 40% | % of trial users who publish their store (set `isStoreEnabled = true` + published status) |

---

## 9. Assumptions

| # | Assumption |
|---|---|
| A-1 | The ST-01 Payment Abstraction Layer is fully operational before ST-03 launches. ST-03 depends on ST-01 for all plan subscription creation. |
| A-2 | The ST-04 Suspended Account State is fully operational before ST-03 launches. ST-03 calls `suspendMerchant()` from ST-04 on trial expiry. |
| A-3 | Existing Free Plan merchants (`payPlanType = 'FREE'`) are not affected by this feature launch. They continue on the Free Plan until the ST-16 migration. |
| A-4 | The `PREMIUM_TRIAL` plan type on existing documents remains readable in the system for legacy compatibility. New accounts will never be assigned `PREMIUM_TRIAL`. |
| A-5 | Quarterly billing means exactly 3× the monthly price with no discount. Annual billing means 12× monthly price structured as "13 months for the price of 12" (1 month free). |
| A-6 | The Grow plan is always shown as "RECOMMENDED" regardless of individual merchant usage. There is no dynamic recommendation engine in this version. |
| A-7 | "One trial per email" enforcement relies on existing Cognito duplicate-email prevention at signup. No additional device or IP-based enforcement is required in v1. |
| A-8 | The `trial-expiry-checker` and `trial-expiry-processor` background jobs are registered in the existing Agenda job scheduler in `payment-integration-api`. |
| A-9 | ST-08 (email drip campaign) is responsible for email content, templates, and delivery. ST-03 only triggers scheduling via job outputs. |
| A-10 | The plan comparison page route will be either `/home/billing` (updated) or a new `/choose-plan` route. The final routing decision is owned by the frontend team. |

---

## 10. Dependencies

| Dependency | Subtask | Type | Notes |
|---|---|---|---|
| Payment Abstraction Layer | ST-01 | Hard — must complete first | ST-03 calls the unified subscription creation API. No workaround if ST-01 is not live. |
| Suspended Account State | ST-04 | Hard — must complete first | ST-03 calls `suspendMerchant()` on trial expiry. The suspension lock screen is entirely owned by ST-04. |
| Trial Email Drip Campaign | ST-08 | Soft — parallel | ST-03 owns trigger scheduling. ST-08 owns content and delivery. Emails degrade gracefully if ST-08 is delayed. |
| Usage Limits Enforcement | ST-06 | Soft — parallel | Trial merchants are subject to Scale-tier usage limits. ST-06 handles enforcement stages. Trial behavior is unchanged if ST-06 enforcement is not yet live. |
| Existing Free Plan Migration | ST-16 | Downstream — not a blocker | ST-03 launches first (new signups only). ST-16 runs after ST-03 is stable. |
| Promo Code System | ST-10 | Downstream — not a blocker | Promo codes can be applied at conversion, but ST-10 is not required for ST-03 to launch. |

---

## 11. Risks

| Risk ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | `trial-expiry-processor` job fails silently, leaving expired trials un-suspended | Medium | High | Implement idempotency checks, job health monitoring, and alerting on stale trial records. |
| R-2 | ST-01 payment failures during plan conversion leave the merchant stuck at the payment step | Medium | High | Payment failure handling must return a clear error and preserve the trial state. Trial is not ended on payment failure. |
| R-3 | Trial merchants convert to a lower plan, triggering the excess-SKU hide logic (ST-05) unexpectedly | Low | Medium | Warning modal before payment is mandatory. ST-05 downgrade logic must be tested end-to-end with the plan selection flow. |
| R-4 | Email triggers (ST-08) fire before ST-08 is live, resulting in no emails being sent during early rollout | Medium | Low | Trial in-app conversion prompts and the persistent banner provide conversion coverage even without emails. |
| R-5 | Abuse via multiple email signups to repeatedly get fresh 14-day trials | Low | Medium | Cognito duplicate-email check at signup covers the common case. Business-name cross-referencing is flagged for manual review (not auto-blocked). |
| R-6 | Existing Free Plan merchants accidentally flagged as trial merchants during the deployment | Low | High | Deploy flag (`newSignupsOnly`) gates the TRIAL default. Existing `FREE` records are not touched. Verified by pre-deployment script. |

---

## 12. Open Questions

| # | Question | Owner | Resolution |
|---|---|---|---|
| OQ-1 | What is the final routing decision for the plan comparison page — updated `/home/billing` or new `/choose-plan` route? | Frontend Team | To be confirmed before implementation. |
| OQ-2 | Should quarterly billing have any discount in a future version, or permanently remain at 3× monthly? | Product / Finance | Currently no discount. Future pricing changes are out of scope for ST-03. |
| OQ-3 | Should business-name cross-referencing for abuse detection (flagging, not blocking) be implemented in v1 or deferred? | Product / Engineering | Currently deferred — manual review only. No auto-flagging in v1. |
| OQ-4 | Should the onboarding checklist be hidden (or marked complete) if a trial merchant who converted to paid returns to the dashboard? | Product / Frontend | Currently: checklist hidden for non-TRIAL merchants. No state change needed on conversion since the component will not render for paid plan types. |
