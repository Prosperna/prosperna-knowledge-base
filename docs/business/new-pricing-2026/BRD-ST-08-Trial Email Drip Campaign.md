---
id: st-08-trial-email-drip-campaign
title: BRD. ST-08 Trial Email Drip Campaign
sidebar_label: ST-08 Trial Email Drip Campaign
sidebar_position: 8
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-18
- Status: Draft
- Feature Slug: trial-email-drip-campaign
- Parent Initiative: Prosperna Pricing Restructuring v3
- Subtask: ST-08

---

## Background and Problem

Prosperna is removing the Free Plan entirely as part of the Pricing Restructuring v3 initiative. Every new merchant sign-up now enters a **14-day Premium Trial** with full Scale-tier access. No credit card is required. After 14 days, if the merchant has not selected a paid plan, their account is immediately suspended — their store goes offline and their dashboard is locked behind a plan selection paywall.

The existing email system for trials is a simple activation confirmation plus an expiry warning — designed for the old optional Premium Trial feature. It is insufficient to nurture, guide, and convert new merchants in the new mandatory trial model.

Without a structured, automated email drip campaign, new merchants will:
- Not understand what to do during the trial
- Not discover the platform's full value before expiry
- Not feel urgency to convert before their store goes offline
- Not have a clear reactivation path if their trial expires

The Trial Email Drip Campaign solves this by providing a fully automated, personalized, time-based sequence of 9 emails that guide merchants from sign-up through conversion — or through reactivation after suspension.

---

## Goals

1. Maximize trial-to-paid conversion within the 14-day trial window (target: >15%).
2. Maximize 30-day post-trial conversion including win-back sequences (target: >25%).
3. Guide new merchants through onboarding steps in the first 3 days.
4. Introduce plan pricing and conversion intent at the strategic midpoint (Day 7).
5. Create progressively urgent, empathetic prompts to convert before trial expiry.
6. Re-engage suspended merchants at T+7 and T+30 post-suspension.
7. Ensure campaign self-terminates cleanly on conversion, unsubscribe, or account deletion.

---

## Non-Goals

- Admin-facing UI or reporting dashboard for campaign monitoring (deferred).
- Timezone-aware email scheduling (deferred to a future enhancement).
- A/B testing of email content variants.
- Billing-related transactional emails — payment failure, subscription renewal, cancellation (owned by ST-14).
- Migration emails for existing Free Plan merchants transitioning to paid plans (owned by ST-16).
- Non-production environment email interception or routing controls.
- Manual email sending by Prosperna staff.

---

## Stakeholders

| Role | Party | Involvement |
|---|---|---|
| Product Owner | Prosperna Product Team | Defines campaign strategy, approves email content and tone |
| Engineering Lead | email-service-api team | Implements Handlebars templates and Nodemailer sending |
| Engineering Lead | payment-integration-api / business-profile-api team | Implements Agenda jobs and scheduling logic |
| Marketing / Content | Prosperna Marketing | Reviews and approves email copy before go-live |
| Support | Prosperna Support | Monitors reply-to inbox; handles merchant replies to drip emails |
| Compliance | Legal / Privacy | Ensures CAN-SPAM and GDPR compliance (unsubscribe, data handling) |

---

## Personas

### New Trial Merchant

A small-to-medium business owner in the Philippines or regional markets who has just signed up for Prosperna. They may be:
- Setting up their first online store (low technical proficiency)
- Migrating from another platform (moderate proficiency)
- Evaluating Prosperna before committing (comparison shopper)

They are time-constrained, may not read every email, and need clear, friendly guidance on what to do next and why it matters. They respond to value demonstrations, social proof, and concrete urgency (store going offline). They do not respond well to aggressive pressure or opaque consequences.

---

## Business Value

| Value Driver | Detail |
|---|---|
| **Conversion revenue** | Each merchant who converts from trial to a paid plan generates recurring monthly revenue (Launch $29/mo, Grow $59/mo, Scale $149/mo). |
| **Reduced manual intervention** | Fully automated campaign requires zero staff effort per merchant. |
| **Onboarding acceleration** | Early emails (Day 1, Day 3) reduce time-to-first-value, increasing platform stickiness. |
| **Win-back revenue** | T+7 and T+30 emails recover merchants who lapsed without manual outreach. |
| **Brand reinforcement** | Consistent, empathetic email tone strengthens Prosperna's merchant relationship from day one. |

---

## Scope

### In Scope

- 9 Handlebars (`.hbs`) email templates stored in `email-service-api/src/views/trial/`
- Agenda.js job scheduling for Day 1, 3, 7, 10, 12, 13 emails on new merchant sign-up
- Day 14 (Trial Expired) email triggered by `trial-expiry-processor` at the moment of suspension
- T+7 and T+30 win-back emails via `win-back-email-sender` daily background job
- Conditional content branching for Day 3 (active vs. inactive) and Day 7 (active vs. low usage) emails
- Personalization context object assembly from user-service-api, business-profile-api, products-service-api, orders-service-api, and analytics service
- `completedStepsSummary` string generation from `onboarding_steps_completed` array using defined step-key mapping
- Cancellation of all remaining scheduled drip emails on merchant conversion to paid plan
- Cancellation of all remaining scheduled drip emails on merchant unsubscribe (all emails including Day 14 and win-back)
- Cancellation of all remaining scheduled drip emails on merchant account deletion; win-back job must check account existence before sending
- Idempotency guard: `drip_emails_sent` log on `merchant_trial_info` to prevent duplicate sends
- Rescheduling of remaining emails when an admin extends a merchant's trial (via ST-12 admin tools)
- Unsubscribe link included in all 9 email templates (CAN-SPAM compliance)
- Retry of failed email sends via Agenda's built-in retry mechanism (N retries, then mark as failed)
- Campaign continues after individual send failures — subsequent scheduled emails are not cancelled

### Out of Scope

- Admin monitoring dashboard or per-merchant campaign status UI
- Timezone-aware email sending (all scheduling is UTC-based on sign-up timestamp)
- A/B testing infrastructure for email content
- Billing transactional emails (ST-14): payment failure, cancellation, usage limit warnings
- Migration drip emails for existing Free Plan merchants (ST-16)
- Non-production environment email routing or interception
- Manual campaign configuration or per-merchant email overrides
- Email template preview or testing tools

---

## Assumptions

| # | Assumption |
|---|---|
| A-1 | `email-service-api` Handlebars template system, Nodemailer, and layout wrapper are operational and available for new template additions. |
| A-2 | Agenda.js job queue (MongoDB-backed) is reliable; its built-in retry handles transient delivery failures. |
| A-3 | ST-03 provides `merchant_trial_info` with `trial_start_date`, `trial_end_date`, and `onboarding_steps_completed`. |
| A-4 | ST-04 provides `suspendedAt` and `suspendedReason` on the store record. |
| A-5 | ST-15 registers and schedules `trial-expiry-checker`, `trial-expiry-processor`, and `win-back-email-sender` background jobs. |
| A-6 | Unsubscribe action cancels **all** remaining drip emails including post-suspension win-back emails (not just pre-expiry emails). |
| A-7 | The `From` email address (`hello@prosperna.com` or `noreply@prosperna.com`) and `Reply-to` address will be confirmed and configured before go-live. |
| A-8 | Analytics data (store visits) is accessible via `business-profile-api` or an analytics service for Day 7 personalization. |
| A-9 | Plan pricing (Launch $29/mo, Grow $59/mo, Scale $149/mo) and plan selection URLs are stable and sourced from ST-01. |
| A-10 | Each merchant receives the trial drip campaign exactly once; the one-trial-per-merchant constraint is enforced by ST-03. |

---

## Dependencies

| Dependency | Subtask | Type | Detail |
|---|---|---|---|
| Trial tracking infrastructure | ST-03 | Hard | `merchant_trial_info` collection, `trial-expiry-checker` job, `trial-expiry-processor` job. ST-08 cannot function without ST-03. |
| Suspended account state | ST-04 | Hard | `suspendedAt`, `suspendedReason` fields on store record; required for win-back targeting. |
| Plan selection page | ST-11 | Hard | Plan selection and suspension lock screen pages that all CTA links point to. |
| Payment Abstraction Layer | ST-01 | Hard | Plan pricing data and payment collection after merchant clicks "Choose a Plan". |
| Background job registration | ST-15 | Hard | `trial-expiry-checker`, `trial-expiry-processor`, and `win-back-email-sender` are registered and scheduled by ST-15. |
| Email infrastructure | ST-14 | Shared | `email-service-api` Handlebars system, Nodemailer sender, and Agenda job queue shared with ST-14 billing emails. |
| Admin trial extension | ST-12 | Conditional | Admin tools (ST-12) that extend a merchant's trial must trigger rescheduling of remaining drip emails. |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Email domain reputation damage (high bounce/spam rate) | Medium | High | Monitor bounce and spam complaint rates against defined thresholds (<2% bounce, <0.1% spam). Use clean email sending practices. Implement bounce handling to suppress future sends to hard-bouncing addresses. |
| Duplicate email sends (idempotency failure) | Medium | Medium | ST-08 owns a `drip_emails_sent` log on `merchant_trial_info`. Every send attempt checks this log before sending. |
| Win-back emails sent to deleted accounts | Low | Medium | `win-back-email-sender` job checks merchant account existence and `account_deleted` flag before sending. |
| Win-back emails sent to re-subscribed merchants | Low | Medium | `win-back-email-sender` checks `converted_to_paid === false` before sending. Reactivated merchants are excluded. |
| Trial extension rescheduling errors | Low | Medium | On extension, all pending drip jobs are cancelled and rescheduled from scratch relative to the new `trial_end_date`. Already-sent emails are not re-sent. |
| Email content out of date (pricing change) | Low | Low | Plan pricing is passed as a dynamic variable where possible; hard-coded amounts in templates must be updated if pricing changes. |
| Agenda job loss on server restart | Low | Medium | Agenda is MongoDB-backed and persists jobs across restarts. This is a known Agenda design feature. |

---

## Compliance and Privacy Notes

| Area | Requirement |
|---|---|
| **CAN-SPAM** | All 9 email templates must include a functional unsubscribe link. Unsubscribes must be honoured within 10 business days; the system honours them immediately by cancelling all remaining scheduled drip jobs. |
| **GDPR** | Merchant PII (first name, store name, product counts, order counts) is used solely for personalization within the drip campaign. No PII is shared with third parties. |
| **Unsubscribe scope** | Unsubscribing from the trial drip campaign cancels all remaining emails in the sequence, including Day 14 expired notice and T+7/T+30 win-back emails. |
| **Account deletion** | When a merchant deletes their account, all scheduled drip jobs are cancelled immediately. The `win-back-email-sender` job must check account existence before sending and suppress emails to deleted accounts. |
| **Reply-to inbox** | The Reply-to address must route to a monitored support inbox. Reply SLA is to be confirmed with the Prosperna Support team. |
| **Sender details** | `From` name: "The Prosperna Team". `From` email and `Reply-to` address: to be confirmed before go-live (likely `hello@prosperna.com`). |
| **Data minimization** | The email renderer accesses only the fields listed in the personalization data model. No additional merchant data is fetched or stored for campaign purposes. |

---

## Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Email open rate (average across sequence) | > 40% | Email service provider open pixel tracking |
| Email click-through rate (CTA clicks) | > 10% | Link click tracking on CTA buttons |
| Trial-to-paid conversion within 14 days | > 15% | Merchants who select a plan during trial / total new sign-ups |
| Trial-to-paid conversion within 30 days (including win-back) | > 25% | Merchants who convert within 30 days of trial end / total new sign-ups |
| Average time from sign-up to conversion | < 10 days | Days between `trial_start_date` and `conversion_date` |
| Win-back conversion rate at T+7 | > 5% | Suspended merchants who reactivate within 7–14 days post-suspension |
| Win-back conversion rate at T+30 | > 3% | Suspended merchants who reactivate within 14–30 days post-suspension |
| Unsubscribe rate | < 1% | Unsubscribes / total emails sent |
| Bounce rate | < 2% | Hard + soft bounces / total emails sent |
| Spam complaint rate | < 0.1% | Complaints / total emails sent |

### Attribution Notes

- **Last-touch attribution:** Track which email was the last one opened or clicked before the merchant selected a plan to identify highest-converting emails in the sequence.
- **Multi-touch awareness:** In-app prompts (ST-11) and emails (ST-08) run in parallel. Both touchpoints should be captured in conversion events without double-counting the conversion itself.
