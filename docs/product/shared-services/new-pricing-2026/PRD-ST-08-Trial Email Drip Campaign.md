---
id: st-08-trial-email-drip-campaign
title: PRD. ST-08 Trial Email Drip Campaign
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

## Summary

The Trial Email Drip Campaign is a fully automated, personalized 9-email sequence triggered by a new merchant's sign-up date. It guides merchants from onboarding through plan conversion during the 14-day Premium Trial, and re-engages suspended merchants at 7 and 30 days post-suspension.

The campaign is self-managing: it cancels remaining emails immediately on plan conversion, unsubscribe, or account deletion. It uses conditional content branching on Day 3 and Day 7 to tailor messaging to merchant engagement level. An idempotency guard prevents duplicate sends if background jobs run more than once. A `drip_emails_sent` log on `merchant_trial_info` is owned by ST-08.

---

## User Journey

### Happy Path — Trial Conversion

1. Merchant signs up. ST-03 creates `merchant_trial_info` with `trial_start_date` and `trial_end_date = trial_start_date + 14 days`.
2. `trial-expiry-checker` (hourly job, ST-03) detects the new trial account. ST-08 scheduling logic runs: checks `drip_emails_sent` (empty), then schedules 6 Agenda jobs: Day 1 (immediate), Day 3, Day 7, Day 10, Day 12, Day 13.
3. **Day 1 — Welcome**: Agenda fires `send-trial-email:welcome`. System assembles personalization context (`firstName`, `dashboardUrl`). Nodemailer sends `trial/welcome.hbs`. Job is logged in `drip_emails_sent`.
4. **Day 3 — Check-In**: Agenda fires `send-trial-email:check-in`. System fetches `onboarding_steps_completed`. Branches to Variant A (active) or Variant B (inactive). Generates `completedStepsSummary` if Variant A. Sends `trial/check-in.hbs`.
5. **Day 7 — Mid-Trial**: Agenda fires `send-trial-email:mid-trial`. System fetches `productsCount`, `ordersCount`, `storePublished`. Branches to Variant A (active) or Variant B (low usage). Sends `trial/mid-trial.hbs`. First email with plan CTA.
6. **Day 10 — Urgency**: Agenda fires `send-trial-email:urgency`. Sends `trial/urgency.hbs` with `trialEndDate`. Explicit consequence stated: store will go offline.
7. **Day 12 — Strong Nudge**: Sends `trial/strong-nudge.hbs`. Urgency escalated: 2 days left.
8. **Day 13 — Final Warning**: Sends `trial/final-warning.hbs`. Minimal copy, maximum urgency.
9. Merchant clicks "Choose My Plan" from Day 10 email. Selects Grow plan. Payment succeeds.
10. Plan activation handler queries Agenda for all pending `send-trial-email:*` jobs for this merchant. All remaining jobs cancelled (Day 13 has not fired yet — cancelled). `merchant_trial_info` updated: `converted_to_paid = true`, `conversion_date = now`.
11. No Day 14, T+7, or T+30 emails are sent. Campaign terminated.

### Happy Path — Trial Expiry + Win-Back

1–8. Same as above through Day 13.
9. Merchant does not convert. Trial expires on Day 14. `trial-expiry-processor` suspends account. Sets `suspendedAt = now`, `suspendedReason = 'trial_expired'`.
10. `trial-expiry-processor` sends `trial/expired.hbs` immediately at the moment of suspension.
11. **T+7**: `win-back-email-sender` daily job finds merchants where `suspendedReason === 'trial_expired'` AND `suspendedAt` is exactly 7 days ago AND `converted_to_paid === false` AND account exists AND not unsubscribed. Sends `trial/win-back-7.hbs`.
12. **T+30**: Same job logic, `suspendedAt` is exactly 30 days ago. Sends `trial/win-back-30.hbs`. Campaign complete — no further emails.

### Alternate Path — Conversion Before Day 7

- Welcome email (Day 1) may already be sent or in-flight — acceptable.
- All remaining Agenda jobs (Day 3, 7, 10, 12, 13) are cancelled on conversion.
- No win-back emails are sent.

### Alternate Path — Unsubscribe

- Merchant clicks the unsubscribe link in any email.
- System immediately cancels all remaining scheduled `send-trial-email:*` Agenda jobs for this merchant.
- `merchant_trial_info` is updated with `unsubscribed = true`, `unsubscribed_at = now`.
- Win-back jobs check `unsubscribed === false` before sending T+7 and T+30 emails.
- No further drip emails of any kind are sent, including Day 14 expired and win-back.

### Alternate Path — Account Deletion

- Merchant deletes their account.
- All scheduled `send-trial-email:*` Agenda jobs for this merchant are cancelled.
- `win-back-email-sender` job checks that the merchant account exists and `account_deleted !== true` before sending win-back emails.

### Alternate Path — Admin Trial Extension

- Admin extends merchant trial from Day 12 to Day 21 (new `trial_end_date`).
- ST-08 cancels all remaining scheduled drip jobs.
- Remaining emails are rescheduled relative to the new `trial_end_date`:
  - Strong Nudge → new `trial_end_date` − 2 days
  - Final Warning → new `trial_end_date` − 1 day
- Already-sent emails (Day 1, 3, 7, 10) are not re-sent.
- `trial-expiry-processor` will use the updated `trial_end_date` to determine suspension timing.

### Failure Paths

| Failure | System Behaviour |
|---|---|
| Email send fails (SMTP error, bounce) | Agenda retries N times per configured retry policy. If all retries exhaust, job is marked as failed in job log. Campaign continues — subsequent scheduled emails are not cancelled. |
| Duplicate job execution (idempotency) | Before sending, system checks `drip_emails_sent` on `merchant_trial_info`. If email type is already present, send is skipped. Job completes without re-sending. |
| Personalization data unavailable (e.g., analytics service down) | Email is sent with safe fallback values (e.g., `storeVisits` defaults to 0; Variant B content used if activity data is unavailable). |
| Win-back job runs for deleted account | Job checks account existence. If account is deleted, email is suppressed and job completes normally. |
| Win-back job runs for converted merchant | Job checks `converted_to_paid === false`. If true, email is suppressed. |
| Win-back job runs for unsubscribed merchant | Job checks `unsubscribed === false`. If true, email is suppressed. |

---

## Functional Requirements

### Email Templates

| ID | Requirement |
|---|---|
| FR-1 | The system shall create 9 Handlebars (`.hbs`) email templates in `email-service-api/src/views/trial/`: `welcome.hbs`, `check-in.hbs`, `mid-trial.hbs`, `urgency.hbs`, `strong-nudge.hbs`, `final-warning.hbs`, `expired.hbs`, `win-back-7.hbs`, `win-back-30.hbs`. |
| FR-2 | `check-in.hbs` shall support two content variants: Variant A (active: `onboarding_steps_completed.length > 0`) celebrates progress; Variant B (inactive) gently nudges the merchant to start setup. |
| FR-3 | `mid-trial.hbs` shall support two content variants: Variant A (active: `productsCount > 0 OR ordersCount > 0 OR storePublished === true`) shows personalized usage stats and plan pricing; Variant B (low usage) highlights features to explore and introduces plans softly. |
| FR-4 | All email templates from Day 7 onward (`mid-trial.hbs`, `urgency.hbs`, `strong-nudge.hbs`, `final-warning.hbs`, `expired.hbs`, `win-back-7.hbs`, `win-back-30.hbs`) shall include at least one plan CTA button linking to `{{planSelectionUrl}}`. |
| FR-5 | All email templates from Day 10 onward (`urgency.hbs`, `strong-nudge.hbs`, `final-warning.hbs`, `expired.hbs`, `win-back-7.hbs`, `win-back-30.hbs`) shall include a data preservation reassurance message confirming the merchant's products, pages, and store design are safely preserved. |
| FR-6 | All 9 email templates shall include a functional unsubscribe link. |
| FR-7 | All emails shall be sent using the `From` name "The Prosperna Team" and a confirmed sender address (to be configured before go-live). |
| FR-8 | All templates shall use the existing Prosperna Handlebars layout wrapper (header, footer, branding). |

### Scheduling

| ID | Requirement |
|---|---|
| FR-9 | When `trial-expiry-checker` detects a new trial merchant with no entries in `drip_emails_sent`, it shall schedule 6 Agenda jobs: `send-trial-email:welcome` (immediate), `send-trial-email:check-in` (`trial_start_date + 3 days`), `send-trial-email:mid-trial` (`trial_start_date + 7 days`), `send-trial-email:urgency` (`trial_start_date + 10 days`), `send-trial-email:strong-nudge` (`trial_start_date + 12 days`), `send-trial-email:final-warning` (`trial_start_date + 13 days`). |
| FR-10 | The Day 14 expired email shall not be pre-scheduled. It shall be sent by the `trial-expiry-processor` at the moment it suspends the merchant's account. |
| FR-11 | The T+7 win-back email shall be sent by the `win-back-email-sender` daily job when it finds merchants where `suspendedReason === 'trial_expired'` AND `suspendedAt` is exactly 7 days ago AND all suppression checks pass. |
| FR-12 | The T+30 win-back email shall be sent by the `win-back-email-sender` daily job when it finds merchants where `suspendedReason === 'trial_expired'` AND `suspendedAt` is exactly 30 days ago AND all suppression checks pass. |

### Cancellation

| ID | Requirement |
|---|---|
| FR-13 | When a merchant successfully converts to a paid plan, the plan activation handler shall cancel all pending `send-trial-email:*` Agenda jobs for that merchant. |
| FR-14 | When a merchant converts, `merchant_trial_info` shall be updated with `converted_to_paid = true`, `conversion_date = now`, and `converted_plan = selected plan`. |
| FR-15 | Converted merchants (`converted_to_paid === true`) shall never receive the Day 14 expired email or win-back emails. |
| FR-16 | When a merchant unsubscribes, all remaining scheduled `send-trial-email:*` Agenda jobs shall be cancelled immediately. |
| FR-17 | When a merchant unsubscribes, `merchant_trial_info` shall be updated with `unsubscribed = true`, `unsubscribed_at = now`. |
| FR-18 | Unsubscribed merchants (`unsubscribed === true`) shall not receive Day 14 expired or win-back emails. |
| FR-19 | When a merchant account is deleted, all scheduled `send-trial-email:*` Agenda jobs shall be cancelled. |
| FR-20 | The `win-back-email-sender` job shall verify that the merchant's account exists and is not deleted before sending T+7 or T+30 emails. If the account is deleted, the email shall be suppressed and the job shall complete normally. |

### Idempotency

| ID | Requirement |
|---|---|
| FR-21 | ST-08 shall maintain a `drip_emails_sent` field (array of email type strings) on `merchant_trial_info` to record which emails have been successfully sent. |
| FR-22 | Before sending any drip email, the system shall check `drip_emails_sent`. If the email type (e.g., `"welcome"`, `"check-in"`) is already present, the send shall be skipped and the Agenda job shall complete without re-sending. |
| FR-23 | Upon successful email delivery confirmation, the email type shall be appended to `drip_emails_sent`. |

### Trial Extension Rescheduling

| ID | Requirement |
|---|---|
| FR-24 | When an admin extends a merchant's trial (updates `trial_end_date`), the system shall cancel all remaining scheduled `send-trial-email:*` Agenda jobs for that merchant. |
| FR-25 | After cancellation, the system shall reschedule the remaining unsent emails relative to the new `trial_end_date` (e.g., Strong Nudge `=` new end − 2 days, Final Warning `=` new end − 1 day). |
| FR-26 | Already-sent emails (present in `drip_emails_sent`) shall not be re-sent during rescheduling. |

### Personalization

| ID | Requirement |
|---|---|
| FR-27 | Each email send shall assemble a personalization context object from the required data sources (user-service-api, business-profile-api, products-service-api, orders-service-api, analytics service) before rendering the template. |
| FR-28 | For Day 3 Variant A, the system shall generate `completedStepsSummary` as a human-readable string from `onboarding_steps_completed` using the defined step-key-to-text mapping: `store_setup` → "set up your store", `add_product` → "added your first product", `customize_storefront` → "customized your storefront", `configure_payment` → "configured your payment gateway", `kyb_verification` → "started your KYB verification", `publish_store` → "published your store". |
| FR-29 | If personalization data is unavailable from a downstream service, the system shall use safe fallback values (zero counts, Variant B content) rather than failing the send. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Email scheduling shall use Agenda.js (MongoDB-backed job queue) for durability and persistence across server restarts. |
| NFR-2 | Failed email sends shall be retried by Agenda's built-in retry mechanism up to the configured maximum (N retries). After all retries are exhausted, the job shall be marked as failed in the job log. |
| NFR-3 | A failed send for one email in the sequence shall not cancel or delay subsequent scheduled emails. |
| NFR-4 | The `win-back-email-sender` job shall run on a daily schedule (registered by ST-15). |
| NFR-5 | The idempotency check (`drip_emails_sent` lookup) shall be a single indexed MongoDB read and shall complete within 100ms. |
| NFR-6 | Email templates shall be mobile-responsive and render correctly in major email clients (Gmail, Outlook, Apple Mail). |
| NFR-7 | All plan pricing referenced in email content shall be displayed in USD. |
| NFR-8 | No payment gateway names (Stripe, Xendit) shall appear in any email template. |
| NFR-9 | Personalization context assembly shall complete within 500ms under normal service conditions (all downstream services available). |

---

## UX Notes

- **Day 1–6 (Onboarding Phase):** Zero pressure. No pricing, no urgency. Purely warm and helpful. Goal is activation, not conversion.
- **Day 7 (Strategic Inflection):** First mention of plan pricing. Framed as celebration of progress, not as a deadline warning. "You're building something great."
- **Day 10–13 (Urgency Phase):** Escalating urgency, but always paired with data-preservation reassurance. "Celebrate, don't punish" per Prosperna pricing restructuring principles.
- **Day 14 (Expiry):** Factual, not punitive. Clear status. Emphasis on data safety and frictionless reactivation path.
- **T+7, T+30 (Win-Back):** Warm, personal, zero pressure. Leverages the merchant's own data ("12 products ready to sell") to create emotional pull.
- **Tone rule:** Every email frames milestones around growth and opportunity. The word "penalty" or equivalent must not appear. Data loss must never be implied — data preservation is always stated explicitly from Day 10 onward.
- **Soft out:** Day 12 email includes a soft opt-out line ("If now isn't the right time, that's okay") to maintain brand trust even with non-converters.

---

## Data Model Notes

### Fields Added to `merchant_trial_info` (ST-03 collection, extended by ST-08)

| Field | Type | Description |
|---|---|---|
| `drip_emails_sent` | `Array<String>` | Log of email types successfully sent. E.g., `["welcome", "check-in", "mid-trial"]`. Used for idempotency guard. |
| `unsubscribed` | `Boolean` | Whether the merchant unsubscribed from drip emails. Default `false`. |
| `unsubscribed_at` | `Date \| null` | Timestamp of unsubscribe event. |
| `converted_to_paid` | `Boolean` | Whether the merchant converted to a paid plan. Default `false`. (May already exist in ST-03; ST-08 reads this field.) |
| `conversion_date` | `Date \| null` | Timestamp of conversion event. |
| `converted_plan` | `String \| null` | Plan slug selected at conversion (e.g., `"launch"`, `"grow"`, `"scale"`). |
| `reactivation_date` | `Date \| null` | Timestamp if merchant reactivates after suspension. |

### Personalization Data Sources

| Variable | Source Collection | Source Field | Used In |
|---|---|---|---|
| `firstName` | `users` (user-service-api) | `firstName` | All emails |
| `storeName` | `stores` (business-profile-api) | `storeName` | Win-back emails |
| `trialEndDate` | `merchant_trial_info` | `trial_end_date` (formatted) | Day 7, 10, 12, 13 |
| `onboardingStepsCompleted` | `merchant_trial_info` | `onboarding_steps_completed` | Day 3 branching |
| `completedStepsSummary` | Derived | From `onboarding_steps_completed` array | Day 3 Variant A |
| `productsCount` | `products` (products-service-api) | Count by `store_id` | Day 7, T+7, T+30 |
| `pagesCount` | `pages` (business-profile-api) | Count by `store_id` | Day 7, T+7 |
| `storeVisits` | Analytics service | Visitor count for trial period | Day 7 Variant A |
| `ordersCount` | `orders` (orders-service-api) | Count by `store_id` for trial period | Day 7, T+7 |
| `storePublished` | `stores` (business-profile-api) | `isStoreEnabled` | Day 7 branching |
| `suspendedAt` | `stores` (business-profile-api) | `suspendedAt` | Win-back targeting |
| `suspendedReason` | `stores` (business-profile-api) | `suspendedReason` | Win-back filter |
| `planSelectionUrl` | Constructed | Based on account state | Day 7–T+30 |
| `dashboardUrl` | Constructed | Standard dashboard URL | Day 1, Day 3 |
| `isActive` | Derived | Computed from activity fields | Template branching flag |

---

## Integrations and APIs

| Integration | Direction | Purpose |
|---|---|---|
| `email-service-api` (Nodemailer) | Outbound | Renders Handlebars templates and sends emails via SMTP |
| `user-service-api` | Inbound read | Fetches `firstName` for all emails |
| `business-profile-api` | Inbound read | Fetches `storeName`, `onboarding_steps_completed`, `pagesCount`, `storePublished`, `suspendedAt`, `suspendedReason` |
| `products-service-api` | Inbound read | Fetches `productsCount` for Day 7 and win-back emails |
| `orders-service-api` | Inbound read | Fetches `ordersCount` for Day 7 and win-back emails |
| Analytics service | Inbound read | Fetches `storeVisits` for Day 7 Variant A |
| Agenda.js (payment-integration-api) | Internal | Job scheduling, cancellation, and retry for all drip email sends |
| ST-03 (`trial-expiry-checker`) | Event consumer | Triggers scheduling of 6 drip email Agenda jobs on new trial detection |
| ST-03 (`trial-expiry-processor`) | Event consumer | Triggers immediate send of Day 14 expired email on account suspension |
| ST-12 (Admin Tools) | Event consumer | Triggers rescheduling of remaining emails when trial is extended |
| ST-01 (plan activation handler) | Event consumer | Triggers cancellation of all remaining drip jobs on plan conversion |

---

## Error Handling

| Scenario | Handling |
|---|---|
| SMTP / Nodemailer delivery failure | Agenda retries per configured retry policy. Job marked failed after exhausting retries. Campaign continues for subsequent emails. |
| Downstream service unavailable (personalization data fetch) | Use safe fallback values. Log the data fetch failure. Send the email with fallback values rather than failing the send entirely. |
| Duplicate job execution detected | Check `drip_emails_sent`. If email type already present, skip send and complete job normally. Log the duplicate detection event. |
| Unsubscribe link clicked | Immediately cancel all pending Agenda jobs. Set `unsubscribed = true`. Return a confirmation page to the merchant. |
| Account deleted before win-back fires | Job finds no account or `account_deleted = true`. Suppresses send. Completes normally. |
| Win-back job runs for converted merchant | Job finds `converted_to_paid = true`. Suppresses send. Completes normally. |
| Invalid email address (hard bounce) | Agenda marks job as failed after retries. Persistent hard bounces should be surfaced via email deliverability monitoring (separate from ST-08). |

---

## Telemetry and Analytics

| Event | Trigger | Data to Capture |
|---|---|---|
| `trial_drip_email_scheduled` | When 6 drip jobs are queued for a merchant | `merchantId`, `trial_start_date`, `scheduled_emails: [...]` |
| `trial_drip_email_sent` | On successful email delivery | `merchantId`, `email_type`, `sent_at`, `variant` (A/B if applicable) |
| `trial_drip_email_failed` | When all Agenda retries exhausted | `merchantId`, `email_type`, `error_code`, `retry_count` |
| `trial_drip_email_opened` | Email open pixel fired | `merchantId`, `email_type`, `opened_at` |
| `trial_drip_cta_clicked` | CTA link in email clicked | `merchantId`, `email_type`, `cta_label`, `clicked_at` |
| `trial_drip_unsubscribed` | Merchant clicks unsubscribe | `merchantId`, `email_type` (which email contained the link), `unsubscribed_at` |
| `trial_drip_cancelled` | All remaining jobs cancelled | `merchantId`, `reason` (`converted` / `unsubscribed` / `account_deleted`), `cancelled_at`, `emails_remaining_count` |
| `trial_drip_winback_suppressed` | Win-back email suppressed | `merchantId`, `reason` (`converted` / `unsubscribed` / `deleted`), `email_type` |
| `trial_conversion_attributed` | Merchant converts within drip campaign | `merchantId`, `last_email_opened`, `last_email_clicked`, `converted_plan`, `days_to_conversion` |

---

## Rollout Plan

1. **Phase 1 — Template creation**: All 9 Handlebars templates created and reviewed by marketing. Email copy approved.
2. **Phase 2 — Scheduling logic**: Agenda job definitions created. `drip_emails_sent` field added to `merchant_trial_info`. Idempotency guard implemented.
3. **Phase 3 — Win-back job**: `win-back-email-sender` daily job implemented and registered by ST-15.
4. **Phase 4 — Cancellation hooks**: Plan activation handler (ST-01), unsubscribe handler, and account deletion handler all wire up Agenda job cancellation.
5. **Phase 5 — Trial extension wiring**: ST-12 admin trial extension event triggers rescheduling logic.
6. **Phase 6 — Integration testing**: End-to-end testing of full 9-email sequence against a test merchant in a controlled environment.
7. **Phase 7 — Go-live with new sign-ups**: Campaign activates for all new merchant sign-ups after Free Plan removal date.

---

## Open Questions

| # | Question | Owner | Assumption Used |
|---|---|---|---|
| OQ-1 | What is the confirmed `From` email address and `Reply-to` address for trial drip emails? | Prosperna Marketing / IT | Assumed `hello@prosperna.com` for `From`, same or `support@prosperna.com` for `Reply-to`. |
| OQ-2 | What is Agenda's configured retry count (N) for failed email sends? | Engineering | Assumed Agenda default retry with exponential backoff; exact N TBD. |
| OQ-3 | What confirmation page or experience does the merchant see after clicking the unsubscribe link? | Product | Assumed a simple confirmation page stating "You have been unsubscribed from Prosperna trial emails." |
| OQ-4 | If a merchant resubscribes (opts back in) after unsubscribing, should win-back emails resume? | Product | Assumed no re-opt-in flow in scope for v3. If merchant resubscribes, this is a separate marketing flow. |
| OQ-5 | Should the Day 14 expired email still be sent if the merchant unsubscribed before Day 14? | Product | Per answer from user: unsubscribe stops ALL remaining drip emails immediately, including Day 14. Implemented as such. |
| OQ-6 | What is the timezone handling policy for email send times within the 14-day window? | Product / Engineering | Assumed UTC-based scheduling on sign-up timestamp. Timezone-aware sending is deferred. |
| OQ-7 | Are analytics service (store visit count) data available within the `business-profile-api` or is it a separate service call? | Engineering | Assumed available; exact service endpoint TBD. Fallback to 0 if unavailable. |

---

# Gherkin User Stories

## Feature: Trial Email Drip Campaign

---

```gherkin
Feature: Trial Email Drip Campaign
  As Prosperna,
  I want to send an automated, personalized sequence of emails to new trial merchants,
  So that I maximize trial-to-paid conversion and recover suspended merchants via win-back.

  Background:
    Given the Prosperna platform has removed the Free Plan
    And all new merchant sign-ups enter a 14-day Premium Trial
    And the email-service-api Handlebars template system is operational
    And Agenda.js job queue is available and running

  # FR-1, FR-8
  Scenario: Day 1 Welcome email is sent immediately on sign-up
    Given a new merchant "Maria Santos" signs up with email "maria@example.com"
    And ST-03 creates a "merchant_trial_info" record with trial_start_date = today
    When the "trial-expiry-checker" detects the new trial account
    Then it schedules an Agenda job "send-trial-email:welcome" to fire immediately
    And when the job fires, the system renders "trial/welcome.hbs" with context:
      | firstName    | Maria          |
      | dashboardUrl | /home          |
    And sends the email with subject "Welcome to Prosperna! Your 14-day free trial starts now 🚀"
    And logs "welcome" in the merchant's "drip_emails_sent" array
    And the email includes an unsubscribe link

  # FR-9
  Scenario: Six drip email jobs are scheduled on new trial detection
    Given a new merchant signs up and ST-03 creates "merchant_trial_info" with trial_start_date = T
    When "trial-expiry-checker" detects the new trial and "drip_emails_sent" is empty
    Then 6 Agenda jobs are scheduled:
      | Job name                       | Fire time      |
      | send-trial-email:welcome       | Immediate      |
      | send-trial-email:check-in      | T + 3 days     |
      | send-trial-email:mid-trial     | T + 7 days     |
      | send-trial-email:urgency       | T + 10 days    |
      | send-trial-email:strong-nudge  | T + 12 days    |
      | send-trial-email:final-warning | T + 13 days    |

  # FR-2
  Scenario: Day 3 Check-In email uses Variant A for active merchants
    Given merchant "Maria" has "onboarding_steps_completed" = ["store_setup", "add_product"]
    When the "send-trial-email:check-in" Agenda job fires on Day 3
    Then the system branches to Variant A (active)
    And generates completedStepsSummary = "set up your store and added your first product"
    And renders "trial/check-in.hbs" with Variant A content acknowledging their progress
    And the email subject is "How's your store coming along?"

  # FR-2
  Scenario: Day 3 Check-In email uses Variant B for inactive merchants
    Given merchant "Jose" has "onboarding_steps_completed" = []
    When the "send-trial-email:check-in" Agenda job fires on Day 3
    Then the system branches to Variant B (inactive)
    And renders "trial/check-in.hbs" with Variant B content gently nudging them to start
    And the email does not mention any completed steps

  # FR-28
  Scenario: completedStepsSummary is generated correctly from step keys
    Given "onboarding_steps_completed" = ["store_setup", "configure_payment", "publish_store"]
    When the system generates "completedStepsSummary"
    Then the result is "set up your store, configured your payment gateway, and published your store"

  # FR-3
  Scenario: Day 7 Mid-Trial email uses Variant A for active merchants
    Given merchant "Maria" has productsCount = 12 AND storePublished = true
    When the "send-trial-email:mid-trial" Agenda job fires on Day 7
    Then the system branches to Variant A (active)
    And renders "trial/mid-trial.hbs" with personalized stats block
    And includes a "Choose My Plan →" CTA linking to "{{planSelectionUrl}}"
    And displays plan pricing: Launch $29/mo, Grow $59/mo, Scale $149/mo

  # FR-3
  Scenario: Day 7 Mid-Trial email uses Variant B for low usage merchants
    Given merchant "Jose" has productsCount = 0 AND ordersCount = 0 AND storePublished = false
    When the "send-trial-email:mid-trial" Agenda job fires on Day 7
    Then the system branches to Variant B (low usage)
    And renders "trial/mid-trial.hbs" highlighting features to explore
    And includes an "Explore Prosperna →" CTA linking to "{{dashboardUrl}}"

  # FR-4
  Scenario: All emails from Day 7 onward include a plan CTA
    Given a trial merchant has not converted
    When each of the following emails is rendered:
      | Email type    |
      | mid-trial     |
      | urgency       |
      | strong-nudge  |
      | final-warning |
      | expired       |
      | win-back-7    |
      | win-back-30   |
    Then each template contains at least one CTA button linking to "{{planSelectionUrl}}"

  # FR-5
  Scenario: All emails from Day 10 onward include data preservation reassurance
    Given a trial merchant has not converted
    When each of the following emails is rendered:
      | Email type    |
      | urgency       |
      | strong-nudge  |
      | final-warning |
      | expired       |
      | win-back-7    |
      | win-back-30   |
    Then each template contains a message reassuring the merchant that their data is safely preserved

  # FR-10, FR-7 (Day 14)
  Scenario: Day 14 expired email is sent by trial-expiry-processor at moment of suspension
    Given merchant "Jose" has not converted by the end of Day 14
    When "trial-expiry-processor" suspends the account and sets suspendedReason = "trial_expired"
    Then "trial-expiry-processor" immediately sends "trial/expired.hbs"
    And the email subject is "Your Prosperna trial has ended"
    And the CTA is "Reactivate My Store →" linking to "/suspended"
    And "expired" is logged in "drip_emails_sent"

  # FR-11
  Scenario: T+7 win-back email is sent to qualifying suspended merchants
    Given merchant "Jose" has suspendedReason = "trial_expired"
    And suspendedAt = exactly 7 days ago
    And converted_to_paid = false
    And unsubscribed = false
    And account exists and is not deleted
    When the "win-back-email-sender" daily job runs
    Then the system sends "trial/win-back-7.hbs" to "Jose"
    And the subject is "Your Prosperna store misses you"
    And the email includes productsCount, pagesCount, and ordersCount

  # FR-12
  Scenario: T+30 win-back email is sent to qualifying suspended merchants
    Given merchant "Jose" has suspendedReason = "trial_expired"
    And suspendedAt = exactly 30 days ago
    And converted_to_paid = false
    And unsubscribed = false
    And account exists and is not deleted
    When the "win-back-email-sender" daily job runs
    Then the system sends "trial/win-back-30.hbs" to "Jose"
    And the subject is "Your Prosperna data is still safe"
    And this is the final email in the campaign — no further emails are sent

  # FR-13, FR-14, FR-15
  Scenario: Conversion cancels all remaining drip emails
    Given merchant "Maria" converts to the Grow plan on Day 10
    And payment succeeds
    When the plan activation handler runs
    Then all pending "send-trial-email:*" Agenda jobs are cancelled for "Maria"
    And "merchant_trial_info" is updated with converted_to_paid = true, conversion_date = now, converted_plan = "grow"
    And no Day 12, Day 13, Day 14, T+7, or T+30 emails are sent

  # FR-15
  Scenario: Converted merchants are excluded from win-back
    Given merchant "Maria" converted to a paid plan on Day 8
    And suspendedAt would have been set if she had not converted (hypothetical)
    When the "win-back-email-sender" daily job runs
    Then "Maria" is excluded because converted_to_paid = true
    And no win-back email is sent

  # FR-13 — Early conversion edge case
  Scenario: Merchant converts on Day 1 before most emails fire
    Given merchant "Ana" signs up and the welcome email is sent
    And she selects a plan within 2 hours of sign-up
    When the plan activation handler cancels remaining jobs
    Then Agenda jobs for Day 3, 7, 10, 12, 13 are all cancelled
    And converted_to_paid = true is set
    And no further trial drip emails are sent

  # FR-16, FR-17, FR-18
  Scenario: Unsubscribe stops all remaining drip emails immediately
    Given merchant "Pedro" receives the Day 7 email and clicks the unsubscribe link
    When the unsubscribe handler processes the request
    Then all remaining pending "send-trial-email:*" Agenda jobs are cancelled
    And "merchant_trial_info" is updated with unsubscribed = true, unsubscribed_at = now
    And no Day 10, Day 12, Day 13, Day 14, T+7, or T+30 emails are sent to "Pedro"

  # FR-18 — Win-back suppression on unsubscribe
  Scenario: Win-back emails are suppressed for unsubscribed merchants
    Given merchant "Pedro" unsubscribed on Day 7
    And his trial expired without conversion
    When the "win-back-email-sender" daily job runs at T+7
    Then it finds unsubscribed = true for "Pedro"
    And suppresses the T+7 win-back email
    And logs a "trial_drip_winback_suppressed" event with reason "unsubscribed"

  # FR-19, FR-20
  Scenario: Account deletion cancels all remaining drip emails
    Given merchant "Luis" deletes his account on Day 5
    When the account deletion handler runs
    Then all pending "send-trial-email:*" Agenda jobs for "Luis" are cancelled
    And no further drip emails are sent

  # FR-20 — Win-back suppression on deletion
  Scenario: Win-back emails are not sent to deleted accounts
    Given merchant "Luis" deleted his account after trial expiry
    And his account record has account_deleted = true
    When the "win-back-email-sender" daily job runs at T+7
    Then it finds account_deleted = true for "Luis"
    And suppresses the T+7 win-back email
    And the job completes normally without error

  # FR-21, FR-22, FR-23
  Scenario: Idempotency guard prevents duplicate email sends
    Given merchant "Maria" has "drip_emails_sent" = ["welcome"]
    And the "trial-expiry-checker" runs a second time due to a crash and reschedules jobs
    When the "send-trial-email:welcome" Agenda job fires again
    Then the system checks "drip_emails_sent" and finds "welcome" already present
    And skips the send
    And the Agenda job completes normally without re-sending the email

  # FR-23
  Scenario: Successful send is logged in drip_emails_sent
    Given the "send-trial-email:check-in" job fires
    And Nodemailer successfully delivers the email
    Then "check-in" is appended to the merchant's "drip_emails_sent" array
    And the next idempotency check for "check-in" will detect it and skip re-sending

  # FR-24, FR-25, FR-26
  Scenario: Admin trial extension reschedules remaining emails
    Given merchant "Rosa" is on Day 12 of her trial (Day 12 email not yet sent)
    And her current trial_end_date = March 25
    And an admin extends her trial to April 1 (trial_end_date updated to April 1)
    When the rescheduling logic runs
    Then all remaining scheduled Agenda jobs (Day 12, Day 13) are cancelled
    And new jobs are rescheduled:
      | Job                              | New fire time               |
      | send-trial-email:strong-nudge    | April 1 - 2 days = March 30 |
      | send-trial-email:final-warning   | April 1 - 1 day = March 31  |
    And already-sent emails (welcome, check-in, mid-trial, urgency) in "drip_emails_sent" are not re-sent

  # NFR-2, NFR-3 — Delivery failure
  Scenario: Email send failure does not cancel subsequent emails
    Given the "send-trial-email:mid-trial" job fires on Day 7
    And Nodemailer fails to deliver (SMTP timeout)
    When Agenda retries the job N times and all retries fail
    Then the job is marked as failed in the Agenda job log
    And "mid-trial" is NOT added to "drip_emails_sent"
    And the Day 10, Day 12, and Day 13 Agenda jobs remain scheduled and will still fire

  # NFR-2, NFR-3 — Retry success
  Scenario: Email send succeeds on retry
    Given the "send-trial-email:urgency" job fires but fails on attempt 1
    When Agenda retries the job on attempt 2
    And the email is delivered successfully
    Then "urgency" is appended to "drip_emails_sent"
    And no duplicate send occurs

  # FR-29 — Personalization fallback
  Scenario: Personalization data unavailable at send time
    Given the orders-service-api is temporarily unavailable when the Day 7 email fires
    When the system assembles the personalization context
    Then "ordersCount" defaults to 0
    And if productsCount = 0 AND ordersCount = 0 AND storePublished = false (due to fallback)
    Then Variant B (low usage) content is used
    And the email is sent successfully with fallback values

  # FR-6 — CAN-SPAM compliance
  Scenario: All email templates include a functional unsubscribe link
    When each of the 9 email templates is rendered
    Then each template contains an unsubscribe link
    And clicking the link triggers the unsubscribe handler

  # Edge case — Win-back after reactivation between T+7 and T+30
  Scenario: Merchant reactivates after T+7 email but before T+30
    Given merchant "Jose" received the T+7 win-back email
    And reactivates by selecting the Launch plan on Day 20 post-sign-up (6 days post-suspension)
    When the plan activation handler runs
    Then converted_to_paid = true is set
    When the "win-back-email-sender" runs at T+30
    Then it finds converted_to_paid = true for "Jose"
    And suppresses the T+30 win-back email

  # Edge case — win-back filter specificity
  Scenario: Win-back emails are only sent for trial_expired suspensions
    Given merchant "Ana" was suspended with suspendedReason = "payment_failure"
    And suspendedAt = exactly 7 days ago
    When the "win-back-email-sender" daily job runs
    Then it excludes "Ana" because suspendedReason != "trial_expired"
    And no T+7 win-back email is sent to "Ana"
```

---

# Traceability Map

| Functional Requirement | Gherkin Scenario(s) | Notes |
|---|---|---|
| FR-1: 9 Handlebars templates created | Day 1 Welcome email is sent; All emails from Day 7 onward include a plan CTA | Template existence verified via send scenarios |
| FR-2: Day 3 Check-In branching | Day 3 Check-In email uses Variant A; Day 3 Check-In email uses Variant B | Both active and inactive variants covered |
| FR-3: Day 7 Mid-Trial branching | Day 7 Mid-Trial email uses Variant A; Day 7 Mid-Trial email uses Variant B | Both active and low-usage variants covered |
| FR-4: Plan CTA in all Day 7+ emails | All emails from Day 7 onward include a plan CTA | All 7 post-Day-7 templates checked |
| FR-5: Data preservation in Day 10+ emails | All emails from Day 10 onward include data preservation reassurance | All 6 post-Day-10 templates checked |
| FR-6: Unsubscribe link in all templates | All email templates include a functional unsubscribe link | All 9 templates verified |
| FR-7: Sender details | Day 1 Welcome email is sent | Verified at send time |
| FR-8: Layout wrapper | Day 1 Welcome email is sent | Layout used at render |
| FR-9: 6 Agenda jobs scheduled on sign-up | Six drip email jobs are scheduled on new trial detection | All 6 jobs and fire times verified |
| FR-10: Day 14 not pre-scheduled | Day 14 expired email is sent by trial-expiry-processor at moment of suspension | Sent on suspension event, not Agenda pre-schedule |
| FR-11: T+7 win-back job | T+7 win-back email is sent to qualifying suspended merchants | All filter conditions verified |
| FR-12: T+30 win-back job | T+30 win-back email is sent to qualifying suspended merchants | Campaign end state verified |
| FR-13: Conversion cancels remaining jobs | Conversion cancels all remaining drip emails; Merchant converts on Day 1 | Both mid-trial and early conversion paths |
| FR-14: merchant_trial_info updated on conversion | Conversion cancels all remaining drip emails | Fields verified in scenario |
| FR-15: Converted merchants excluded from win-back | Converted merchants are excluded from win-back; Merchant reactivates after T+7 email but before T+30 | Both pre-expiry and post-expiry conversion |
| FR-16: Unsubscribe cancels Agenda jobs | Unsubscribe stops all remaining drip emails immediately | All jobs cancelled |
| FR-17: merchant_trial_info updated on unsubscribe | Unsubscribe stops all remaining drip emails immediately | Fields verified in scenario |
| FR-18: Unsubscribed excluded from win-back | Win-back emails are suppressed for unsubscribed merchants | T+7 verified; T+30 implied by same guard |
| FR-19: Account deletion cancels jobs | Account deletion cancels all remaining drip emails | All jobs cancelled |
| FR-20: Win-back suppressed for deleted accounts | Win-back emails are not sent to deleted accounts | Account check verified |
| FR-21: drip_emails_sent log | Idempotency guard prevents duplicate email sends | Log presence verified |
| FR-22: Idempotency check before send | Idempotency guard prevents duplicate email sends | Skip logic verified |
| FR-23: Log successful send | Successful send is logged in drip_emails_sent | Append verified; next check will detect |
| FR-24: Extension cancels remaining jobs | Admin trial extension reschedules remaining emails | Cancellation step verified |
| FR-25: Extension reschedules relative to new end date | Admin trial extension reschedules remaining emails | New fire times calculated |
| FR-26: Already-sent emails not re-sent on extension | Admin trial extension reschedules remaining emails | drip_emails_sent prevents re-send |
| FR-27: Personalization context assembled per email | Day 1 Welcome email is sent; T+7 win-back email sent | Context object verified at key emails |
| FR-28: completedStepsSummary generation | completedStepsSummary is generated correctly from step keys | Explicit step-key mapping verified |
| FR-29: Personalization fallback on service failure | Personalization data unavailable at send time | Fallback to 0 and Variant B verified |
