---
id: st-14-billing-subscription-email-templates
title: BRD. ST-14 Billing Subscription Email Templates
sidebar_label: ST-14 Billing Subscription Email Templates
sidebar_position: 14
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft
- Feature Slug: billing-subscription-email-templates
- Subtask Reference: ST-14 (Pricing Restructuring Initiative)

---

## Background and Problem

Prosperna is undergoing a major pricing restructuring (v3) that eliminates the Free Plan tier and introduces three new paid tiers — **LAUNCH**, **GROW**, and **SCALE** — priced in USD. Billing is transitioning from PHP (Philippine Peso) to USD, targeting the US SMB market.

The existing billing email system was built for the old pricing model:
- Plan names reference FREE, PLUS, PRO, PREMIUM, and PREMIUM_TRIAL
- All amounts are shown in PHP (₱)
- Expiry and payment failure emails tell merchants they are "reverted to the Free Plan"
- The `SCHEDULE_BILLING_EMAILS_NOTIFICATION` Agenda job calls `changePlan(FREE)` on subscription expiry
- The `createUpcomingInvoices()` cron calls `changePlan(FREE)` on unpaid renewal

None of these behaviors are correct under the new pricing model. The Free Plan no longer exists. When a subscription expires or a payment fails, merchants are now **suspended** — their store goes offline until they reactivate. This is a fundamentally different outcome that requires fundamentally different email communication.

Additionally, new subscription lifecycle events introduced by the pricing restructuring — voluntary cancellation, usage limit thresholds, overages, reactivation — have no corresponding email templates today.

---

## Goals

1. Update all 12 existing billing email templates to use new plan names (LAUNCH, GROW, SCALE), USD pricing, and suspension language instead of "revert to Free Plan."
2. Create 11 new email templates covering: cancellation confirmation, post-cancellation suspension, payment failure suspension, usage limit warnings (80%/95%/100%/125%), overage invoice, upgrade confirmation, and reactivation confirmation.
3. Remove 4 deprecated grace period email templates (v2 artifacts that were never deployed and are no longer applicable).
4. Update the `SCHEDULE_BILLING_EMAILS_NOTIFICATION` Agenda job to call `suspendMerchant()` instead of `changePlan(FREE)` on subscription expiry (Day 0).
5. Update the `createUpcomingInvoices()` cron to call `suspendMerchant()` with reason `'payment_failed'` on unpaid renewal and send the payment failure suspension email.

---

## Non-Goals

- Merchant-editable email templates — billing emails are fully system-controlled with Prosperna branding; merchants cannot customize them.
- Multi-language or locale support — all billing emails are English only in this release.
- Analytics or engagement tracking on billing emails (open rates, click-throughs, bounces) — not in scope.
- Order notification emails — handled by `orders/` templates; separate system.
- Trial drip campaign emails — owned by ST-08.
- Migration campaign emails — owned by ST-16.
- A/B testing or email experimentation.
- Feature flags or phased rollout — all templates release simultaneously with the pricing restructuring.
- Merchant UI for previewing email templates.

---

## Stakeholders

| Role | Name / Group | Involvement |
|---|---|---|
| Product Owner | Prosperna Product Team | Defines business requirements and sign-off |
| Engineering — Email Service | email-service-api team | Implements template updates and new templates |
| Engineering — Payments | payment-integration-api team | Updates Agenda jobs and cron triggers |
| Engineering — Business Profile | business-profile-api team | Provides trial data; coordinates with ST-03/ST-08 |
| QA | QA Team | Validates all templates in staging environment |
| Merchants | Account Owners | Recipients of all billing emails |
| Prosperna Admins | Admin Control Platform team | May observe email delivery status; not directly involved in sending |

---

## Personas

### Account Owner (Merchant)
- **Role:** Owner of a Prosperna merchant account; the sole recipient of all billing and subscription emails.
- **Email address:** The email used to register the merchant account.
- **Characteristics:** SMB owner or operator; may not be technical. Expects clear, plain-language email communication about their subscription status.
- **Pain points today:** Receives confusing emails referencing old plan names and PHP prices; gets told they are "reverted to Free Plan" when in reality their store will go offline.
- **What they need from ST-14:** Accurate, transparent emails that tell them exactly what happened, what their current subscription status is, what will happen next, and what their options are — with a single clear call-to-action.

> No internal persona manages or previews these templates. Templates are fully system-controlled.

---

## Business Value

1. **Reduces merchant confusion and support tickets** during the pricing transition. Merchants receiving emails that reference old plan names, PHP prices, or "Free Plan" reversion will contact support — accurate templates eliminate this class of tickets.
2. **Reduces churn at critical lifecycle moments** by providing clear upgrade CTAs when merchants hit usage limits (80%, 95%) and clear reactivation paths when suspended.
3. **Supports the legal and contractual integrity of the new pricing model** — suspension emails accurately communicate the consequence of non-payment, which aligns with the updated Terms of Service.
4. **Enables automated lifecycle management** — trigger mechanism updates remove manual intervention for expiry and payment failure flows.

---

## Scope

### In Scope

**Template Updates (12 existing files):**
| # | File | Change Type |
|---|---|---|
| 1 | `billing/activate-trial.hbs` | Update: plan names, pricing, trial language, suspension consequence |
| 2 | `billing/plan-upgrade.hbs` | Update: plan names, pricing, add limits and proration |
| 3 | `billing/plan-downgrade.hbs` | Update: plan names, effective date, excess handling |
| 4 | `billing/plan-notice.hbs` | Update: plan names, pricing, remove Free Plan refs |
| 5 | `billing/updated-plan-change.hbs` | Update: plan names, pricing |
| 6 | `billing/updated-plan-renewal.hbs` | Update: plan names, pricing, add gateway and usage reset |
| 7 | `billing/updated-plan-upgrade.hbs` | Update: plan names, pricing, add limits and proration |
| 8 | `billing/updated-plan-expired.hbs` | **Major update:** suspension language; trigger → `suspendMerchant()` |
| 9 | `billing/updated-plan-expiring.hbs` | Update: suspension consequence language |
| 10 | `billing/updated-plan-expiring1.hbs` | Update: suspension language, plan names, USD |
| 11 | `billing/updated-plan-expiring3.hbs` | Update: suspension language, plan names, USD |
| 12 | `billing/updated-plan-expiring7.hbs` | Update: suspension language, plan names, USD |

**New Templates (11 new files):**
| # | File | Category |
|---|---|---|
| 13 | `billing/cancellation-confirmed.hbs` | Cancellation |
| 14 | `billing/post-cancellation-suspended.hbs` | Cancellation |
| 15 | `billing/payment-failed-suspended.hbs` | Payment Failure |
| 16 | `billing/usage-warning-80.hbs` | Usage Limits |
| 17 | `billing/usage-urgent-95.hbs` | Usage Limits |
| 18 | `billing/usage-grace-100.hbs` | Usage Limits |
| 19 | `billing/usage-grace-reminder.hbs` | Usage Limits |
| 20 | `billing/usage-hard-limit-125.hbs` | Usage Limits |
| 21 | `billing/overage-invoice.hbs` | Overage |
| 22 | `billing/upgrade-confirmation.hbs` | Plan Change |
| 23 | `billing/reactivation-confirmation.hbs` | Reactivation |

**Removed Templates (4 v2 artifacts — never deployed):**
| File | Reason |
|---|---|
| `billing/payment-failure-day0.hbs` | ST-07 (grace period) removed — immediate suspension |
| `billing/payment-failure-day3.hbs` | ST-07 removed |
| `billing/payment-failure-day5.hbs` | ST-07 removed |
| `billing/payment-failure-day7-suspended.hbs` | ST-07 removed; replaced by `payment-failed-suspended.hbs` |

**Trigger Mechanism Updates:**
- `payment-integration-api/src/jobs/index.ts` — `SCHEDULE_BILLING_EMAILS_NOTIFICATION` job Day 0 behavior
- `payment-integration-api/src/utils/cron.ts` — `createUpcomingInvoices()` cron unpaid renewal behavior

**Email API — New Endpoints:**
- `POST /v1/billing/cancellation` — cancellation confirmation and post-cancellation suspension emails
- `POST /v1/billing/payment-failure` — payment failure suspension email
- `POST /v1/billing/usage-notification` — all usage threshold emails (80%, 95%, 100%, 125% and grace reminder)
- `POST /v1/billing/overage-invoice` — overage invoice email
- `POST /v1/billing/reactivation` — reactivation confirmation email

### Out of Scope
- Order notification templates (`orders/` directory)
- Trial drip campaign templates (ST-08)
- Migration campaign templates (ST-16)
- Any email template editable by the merchant
- Merchant email branding settings (already limited to order emails; no change needed)
- Email delivery metrics dashboard (Admin Control Platform)
- Email unsubscribe preference management
- Third-party email tooling or ESP migration

---

## Assumptions

1. AWS SES is the email transport and remains so; no ESP migration is planned.
2. `suspendMerchant(store_id, reason)` function exists and is production-ready as delivered by ST-04 before ST-14 deploys.
3. `reactivateMerchant()` function is delivered by ST-04.
4. Usage threshold detection service (ST-06) will call the email API with complete variable payloads at each threshold crossing.
5. The Payment Abstraction Layer (ST-01) will pass `paymentGateway` (Stripe or Xendit) in all payment event callbacks.
6. Cancellation flow (ST-05) and `cancellation-processor` job will call the email API at the correct lifecycle moments.
7. Trial start/end dates are accessible from the data model as delivered by ST-03.
8. ST-08 owns the trial drip campaign; `activate-trial.hbs` may be deprecated in favor of ST-08's `trial/welcome.hbs` — this coordination happens outside ST-14 scope.
9. All billing email templates release simultaneously with the rest of the pricing restructuring subtasks — no phased or feature-flagged rollout.
10. All amounts displayed in templates are pre-formatted as USD strings (e.g., `"$59.00"`) by the calling service before passing to the template.
11. The staging environment has verified AWS SES sender domain credentials for real send testing.
12. `SCHEDULE_BILLING_EMAILS_NOTIFICATION` and `createUpcomingInvoices()` job/cron updates are coordinated with ST-15 (Background Jobs).

---

## Dependencies

| Dependency | Subtask | What ST-14 Needs |
|---|---|---|
| Suspension model | ST-04 | `suspendMerchant(store_id, reason)` and `reactivateMerchant()` available; suspension reasons defined: `'trial_expired'`, `'cancelled'`, `'payment_failed'` |
| Trial system | ST-03 | Trial start date, end date, plan tier available in data model |
| Payment Abstraction Layer | ST-01 | Payment gateway name (Stripe/Xendit) passed in webhook payloads; webhook handlers call email API on payment success/failure/upgrade events |
| Cancellation flow | ST-05 | Cancellation reason and billing period end date available; `cancellation-processor` triggers `post-cancellation-suspended.hbs` |
| Usage limits system | ST-06 | Usage counts, limits, percentages, resource types, grace period timestamps, overage calculations available; threshold detection calls email API |
| Background jobs | ST-15 | New email trigger jobs registered in Agenda; existing job updates coordinated |
| Trial drip campaign | ST-08 | Coordination required to prevent duplicate welcome email on trial activation |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Duplicate welcome email: both `activate-trial.hbs` (ST-14) and `trial/welcome.hbs` (ST-08) send on trial activation | Medium | High — merchant receives two welcome emails | Coordinate with ST-08 before launch; recommend deprecating ST-14's `activate-trial.hbs` in favor of ST-08's template. Document as Open Question until resolved. |
| Calling services send incomplete variable payloads, causing Handlebars rendering to fail or show blank fields | Medium | High — broken email content delivered to merchants | Define and document all required variables per template in the ENDPOINT document; validate at the email API layer and return 400 on missing required vars |
| `suspendMerchant()` not available from ST-04 at launch time | Low | Critical — Day 0 job fails silently or incorrectly | Block ST-14 trigger updates on ST-04 delivery; fail fast and alert Ops if function is unavailable |
| Usage threshold emails fired multiple times for the same threshold (idempotency failure) | Medium | Medium — merchant spammed | Usage threshold service (ST-06) must track sent state per threshold per billing period per merchant; email API not responsible for deduplication |
| SES delivery failure not surfaced to engineering | Low | Medium | Log all send failures to CloudWatch; SNS alert to Ops on repeated failures |

---

## Compliance and Privacy Notes

- All billing emails sent by ST-14 are **transactional emails** — they communicate factual information about the merchant's subscription status. They are **not marketing emails**.
- As transactional emails, they are **exempt from CAN-SPAM and GDPR unsubscribe requirements**. No unsubscribe link is required or appropriate.
- AWS SES enforces bounce and complaint handling at the infrastructure level — no application-layer management required for ST-14.
- All emails are sent from Prosperna's verified SES sender domain (e.g., `billing@prosperna.com`). No merchant personal data is stored in email templates — variables are injected at send time and not persisted by the email service.
- Merchant email addresses are sourced from the merchant account record at send time. The email service does not maintain its own address list.
- **English only** — no locale or language variants.

---

## Success Metrics

Since analytics tracking is out of scope, success is defined operationally:

| Metric | Definition of Success |
|---|---|
| Zero old plan name references | No email delivered post-launch contains "FREE", "PLUS", "PRO", "PREMIUM", or "PREMIUM_TRIAL" |
| Zero PHP pricing references | No email delivered post-launch contains "₱" or PHP currency formatting |
| Zero "Free Plan revert" language | No email says "reverted to Free Plan" or "downgraded to Free" |
| Trigger correctness | `SCHEDULE_BILLING_EMAILS_NOTIFICATION` calls `suspendMerchant()` (not `changePlan(FREE)`) verified in staging |
| Template rendering — no blank variables | All required template variables are populated for every send in staging QA |
| No duplicate suspension emails | A single suspension event produces exactly one suspension email per merchant |
| Staging sign-off | QA team approves all 23 templates via real SES sends in staging before production deployment |
| Zero support tickets citing email content confusion | No merchant support tickets in first 30 days referencing incorrect plan names, pricing, or incorrect consequence language |
