---
id: st-06-usage-limits-enforcement-system
title: PRD. ST-06 Usage Limits & Enforcement System
sidebar_label: ST-06 Usage Limits & Enforcement System
sidebar_position: 6
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-18
- Status: Draft
- Feature Slug: usage-limits-enforcement
- Parent Initiative: Prosperna Pricing Restructuring (v3)
- Subtask ID: ST-06

---

## Summary

The Usage Limits & Enforcement System introduces real-time resource metering and a 4-stage progressive enforcement model across all Prosperna merchant plans. It tracks 7 resource types (orders/month, orders/year, sales volume/year, bandwidth/month, storage, max file size, product SKUs), alerts merchants as they approach limits, and enforces graduated consequences (warning → urgent → grace period → hard limit) to protect infrastructure costs while celebrating merchant growth and driving plan upgrades. Merchants always have actionable options at every stage: upgrade instantly, accept overage charges, or wait for the billing cycle reset.

---

## User Journey

### Happy Path — Merchant Approaching and Exceeding Order Limit

1. Merchant processes orders normally throughout the billing period.
2. At 80% of order limit, the system sends a celebratory email and shows a green dashboard badge.
3. Merchant continues operating normally. At 95%, a warning email and yellow dashboard banner appear.
4. Merchant clicks "Upgrade Now" from the banner, reviews the plan comparison page, confirms the prorated charge, and upgrades. New limits apply instantly. Enforcement state clears.
5. Merchant continues the billing period with ample headroom on the new plan.

### Alternate Path A — Merchant Ignores Warnings and Hits 100%

1. Merchant does not act on the 80% and 95% warnings.
2. At 100%, a 48-hour grace period starts. Orders continue processing normally. An email explains the three options: upgrade, accept overages, or wait for reset.
3. Daily grace reminder emails are sent ("Grace period ending in X hours").
4. Merchant accepts overage charges. Orders process normally past 100%, billed at end of period.
5. At period end, overage invoice is generated and charged via the Payment Abstraction Layer.

### Alternate Path B — Merchant Does Nothing (Grace Expires)

1. 48-hour grace expires without merchant action.
2. Orders are queued with a 15-minute processing delay. Customer sees: "Your order is being processed."
3. Merchant receives hard limit email with upgrade and overage CTAs.
4. Billing period resets. Counters go to 0, enforcement state clears, orders process normally.

### Alternate Path C — Merchant at 125% Without Overage Acceptance

1. Merchant reaches 125% of the plan limit without accepting overages and without upgrading.
2. New orders are rejected. Customer sees generic error: "We're unable to process your order at this time. Please try again later or contact the store owner."
3. Merchant upgrades or accepts overages → service restores immediately.

### Failure Paths

| Scenario | System Behavior |
|---|---|
| Upload exceeds max file size | Upload rejected immediately with plan-specific limit message and upgrade prompt. |
| Product SKU publish exceeds plan limit | Publish action rejected with limit message and upgrade prompt. |
| Upgrade payment fails | Payment Abstraction Layer returns failure; merchant shown error; plan not changed. |
| Overage invoice payment fails | Pending stakeholder confirmation — assumed to trigger ST-04 suspension. |
| Platform downtime during grace period | Grace period auto-extended by downtime duration; incident logged; merchant notified. |
| Fraud detection spike (10× daily average) | Temporary 30-min throttle applied; ops team alerted; merchant notified with protective framing. |

---

## Functional Requirements

### FR-1 — Resource Usage Tracking

The system must track resource consumption per merchant per billing period for all 7 resource types:

| Resource | Type | Reset Behavior | Plan Limits (Launch / Grow / Scale / Trial) |
|---|---|---|---|
| Orders/month | Counter | Per billing period | 200 / 750 / 2,500 / 2,500 |
| Orders/year | Counter | Per annual period | 2,400 / 9,000 / 30,000 / 30,000 |
| Sales volume/year (USD) | Decimal sum | Per annual period | $30,000 / $110,000 / $360,000 / $360,000 |
| Bandwidth GB/month | Decimal sum | Per billing period | 25 / 75 / 150 / 150 GB |
| Storage GB | Decimal sum | Never resets | 10 / 30 / 100 / 100 GB |
| Max file size MB | Single-upload gate | N/A (hard gate) | 5 / 10 / 15 / 15 MB |
| Product SKUs | Counter | Never resets | 500 / 2,000 / 10,000 / 10,000 |

- FR-1.1: Orders increment by 1 on every successfully completed order transaction (not per line item).
- FR-1.2: Bandwidth is tracked asynchronously and must not block the request being served.
- FR-1.3: Storage increments on file upload and decrements on file deletion.
- FR-1.4: SKU count reflects published product variants only. Unpublished products do not count.
- FR-1.5: Sales volume is summed from `order.total` in USD. Non-USD stores must have currency converted at order creation time.
- FR-1.6: Threshold checks are evaluated after every qualifying increment event.

### FR-2 — 4-Stage Enforcement Model

The system must enforce a progressive 4-stage model for orders/month, orders/year, sales volume/year, bandwidth/month, and storage.

- FR-2.1 — Stage 1 (Warning, 80%): Send one email per resource per billing period. Display a green dashboard badge. No service restriction.
- FR-2.2 — Stage 2 (Urgent, 95%): Send one email per resource per billing period. Display a yellow dashboard banner. No service restriction.
- FR-2.3 — Stage 3 (Grace, 100%): Start a 48-hour grace period. Send initial grace email. Send daily reminder emails during grace. Orders continue processing normally during grace. Display blue dashboard banner with countdown.
- FR-2.4 — Stage 4a (Soft Throttle, grace expired or 100% without action): Queue orders with a 15-minute processing delay. Send hard limit email. Display red dashboard banner.
- FR-2.5 — Stage 4b (Hard Block, 125% without overage acceptance): Reject new orders with a generic customer-facing error. Maintain soft throttle for bandwidth (degraded but functional). Block new uploads for storage.
- FR-2.6: Each resource tracks its enforcement stage independently. A merchant can be at Stage 2 for orders and Stage 1 for bandwidth simultaneously.
- FR-2.7: Enforcement notifications are idempotent. Each stage notification is sent once per resource per billing period. Re-crossing a threshold does not re-trigger the email.
- FR-2.8: The dashboard banner displays the highest-severity stage across all resources.

### FR-3 — Hard Gate Enforcement (File Size and SKUs)

- FR-3.1 — Max file size: Reject upload immediately if file size exceeds the plan's per-file limit. Response: "File exceeds your plan's X MB limit. Upgrade to [next plan] for up to Y MB uploads."
- FR-3.2 — Product SKUs: Reject publish action immediately when SKU count would exceed the plan limit. Response: "You've reached your plan's X SKU limit. Upgrade to [next plan] for up to Y SKUs."
- FR-3.3: No overage option for file size or SKU violations. Merchant must upgrade or reduce content.

### FR-4 — Merchant Dashboard — Usage Dashboard Page

- FR-4.1: A new page (`/home/usage` or equivalent) must show each tracked resource with:
  - Resource name
  - Progress bar (color: green < 80%, yellow 80–94%, orange 95–99%, red 100%+)
  - Count display (e.g., "612 / 750 orders")
  - Percentage used
  - Remaining amount
  - Status label (Normal / Warning / Urgent / Grace / Throttled / Blocked)
  - Estimated date to limit (based on 7-day average daily usage rate)
- FR-4.2: Billing period context at the top: current period dates, days remaining, plan name and price.
- FR-4.3: Enforcement state section (if any stage is active): current stage label, grace period countdown timer (if applicable), upgrade CTA, accept overages CTA (at 100%+).
- FR-4.4: Next-plan comparison panel: shows next plan's limits with current usage expressed as a percentage of the next plan.

### FR-5 — Enforcement Banners

- FR-5.1: Persistent banners (non-dismissible) appear at the top of all merchant dashboard pages based on highest-severity enforcement stage.
- FR-5.2: Banner styles per stage:

| Stage | Color | Icon | Message Template | Actions |
|---|---|---|---|---|
| Warning (80%) | Green | 🎉 | "You're at 80% of your [resource] limit! [X] remaining this month." | Upgrade Plan, View Details |
| Urgent (95%) | Yellow | ⚠️ | "Only [X] [resource] left this month! Upgrade now to avoid queuing." | Upgrade Now |
| Grace (100%) | Blue | 🕐 | "Grace period active. Orders processing normally for [X] more hours." | Upgrade, Accept Overages |
| Hard Limit (125%/expired) | Red | 🔄 | "Orders queuing with 15-min delay. Upgrade for instant processing." | Upgrade Now, View Queue |

- FR-5.3: Banners persist until the merchant upgrades, accepts overages, or the billing cycle resets.

### FR-6 — One-Click Upgrade Flow

- FR-6.1: Upgrade CTA is available at any enforcement stage and from the billing page.
- FR-6.2: Clicking upgrade shows a plan comparison page with the current plan highlighted and the next plan recommended.
- FR-6.3: The system calculates a prorated charge: `remaining_days × (new_plan_daily_rate − old_plan_daily_rate)`.
- FR-6.4: Merchant confirms and pays via the Payment Abstraction Layer (ST-01).
- FR-6.5: On successful payment:
  - New plan limits take effect immediately.
  - Enforcement state is cleared (all stage timestamps reset).
  - Dashboard banners are removed.
  - Current-period overages are forgiven.
  - Upgrade confirmation email is sent.
- FR-6.6: New plan activation must complete within 30 seconds of payment confirmation.

### FR-7 — Overage Acceptance Flow

- FR-7.1: Accept Overage Charges CTA is available at Stage 3 (100%) and above.
- FR-7.2: Clicking the CTA shows an estimated overage cost based on current excess usage and the plan's overage rates:

| Resource | Launch | Grow | Scale |
|---|---|---|---|
| Per order over limit | $0.20 | $0.15 | $0.12 |
| Per GB bandwidth over limit | $0.20 | $0.18 | $0.15 |
| Per GB storage over limit | $0.50 | $0.45 | $0.40 |

- FR-7.3: Merchant confirms acceptance. System records `overage_accepted = true`.
- FR-7.4: After acceptance, orders process normally regardless of how far over the limit the merchant goes.
- FR-7.5: Overage acceptance applies for the current billing period only. It does not auto-renew.

### FR-8 — Overage Billing

- FR-8.1: At the end of each billing period, a batch job calculates excess usage per resource: `(actual − limit) × overage_rate`.
- FR-8.2: If total overage = $0, no invoice is generated.
- FR-8.3: If total overage > $0, generate an itemized overage invoice with a due date of 7 days from generation.
- FR-8.4: Send overage invoice email with resource breakdown, amounts, and due date.
- FR-8.5: Collect payment via the Payment Abstraction Layer.

### FR-9 — Billing Cycle Reset

- FR-9.1: At the start of each new billing period: reset `orders_count`, `bandwidth_gb` to 0; reset all enforcement state fields to defaults; send no notifications.
- FR-9.2: `storage_gb` does NOT reset. It is cumulative across the account lifetime.
- FR-9.3: `product_sku_count` does NOT reset. It reflects current published inventory.
- FR-9.4 — Grace period carryover: If grace is active when the billing period resets, the grace state is preserved (counter continues). Once grace expires, the system evaluates the new period's counters (which are at 0) and returns the merchant to normal.

### FR-10 — Order Queue (Soft Throttle)

- FR-10.1: During soft throttle (Stage 4a), new orders are placed in an `order_queue` table with a `process_at` timestamp of `NOW() + 15 minutes`.
- FR-10.2: The customer-facing order confirmation shows: "Your order has been received and is being processed. You'll receive a confirmation shortly."
- FR-10.3: The `queued-order-processor` background job runs frequently (every 1–5 minutes) and processes all orders whose `process_at` time has been reached.
- FR-10.4: After processing, the standard order confirmation email is sent to the customer.
- FR-10.5: Queued orders are never dropped. If processing fails, the job retries and records the error.

### FR-11 — Email Notification System

All emails are defined in ST-14. The enforcement system triggers them:

| Trigger | Email Type | Frequency |
|---|---|---|
| Resource hits 80% | Warning (80%) | Once per resource per billing period |
| Resource hits 95% | Urgent (95%) | Once per resource per billing period |
| Resource hits 100% | Grace Started (100%) | Once per resource per billing period |
| Every 24 hours during grace | Grace Reminder | Daily until grace expires or action taken |
| Grace expires or 125% reached | Hard Limit | Once per resource per billing period |
| Merchant accepts overages | Overage Acceptance Confirmation | Once per acceptance |
| End of billing period with overages > $0 | Overage Invoice | Once per billing period |
| Merchant completes upgrade | Upgrade Confirmation | Once per upgrade |

### FR-12 — Admin Enforcement Dashboard

- FR-12.1: Summary view shows count of merchants at each enforcement stage.
- FR-12.2: Merchant detail table columns: Merchant Name, Plan, Status, Resource, Usage (count vs limit), Percentage, Grace Expires In, Last Contacted, Actions.
- FR-12.3 — Reset limits: Admin can manually reset a merchant's usage counters and enforcement state (for billing errors or platform issues). Action is logged in `enforcement_event_log`.
- FR-12.4 — Extend grace: Admin can add hours to a merchant's active grace period. Action is logged.
- FR-12.5 — View enforcement history: Admin can view the full `enforcement_event_log` for any merchant.

### FR-13 — Fraud Detection

- FR-13.1: After each order, compare today's order count against the merchant's 30-day daily average. If today's count exceeds 10× the average, trigger fraud detection.
- FR-13.2: Apply a temporary 30-minute throttle to the merchant's order processing.
- FR-13.3: Alert the Prosperna ops team via internal notification.
- FR-13.4: Send merchant notification: "We noticed unusual activity on your store and have temporarily slowed order processing for your protection. If this is expected (e.g., a big sale), please contact support to clear the hold."
- FR-13.5: Admin can clear the fraud flag using the override tools in the admin platform.

### FR-14 — Shadow Mode Rollout (Phase A)

- FR-14.1: For 4 weeks after initial deployment, usage tracking is fully active but enforcement actions are disabled (no emails, no banners, no throttling).
- FR-14.2: Merchants can view their usage dashboard in read-only mode.
- FR-14.3: At the end of shadow mode, a monthly summary email is sent to each merchant: "If limits were active, here's where you'd stand."
- FR-14.4: Prosperna internal team reviews usage data and adjusts thresholds if needed before enforcement goes live.

### FR-15 — Gradual Enforcement Rollout (Phase B)

- FR-15.1: Enforcement goes live gradually: 10% of merchants → 50% → 100% over 3 weeks.
- FR-15.2: All features (notifications, banners, throttling, billing) activate simultaneously for each cohort.

---

## Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Usage tracking latency added to order processing | < 50 ms |
| NFR-2 | Usage dashboard page load time | < 2 seconds |
| NFR-3 | Threshold check execution time | < 100 ms |
| NFR-4 | Queued orders processed within the promised window | 100% within 15 min ± 1 min |
| NFR-5 | Upgrade activation time from payment confirmation | < 30 seconds |
| NFR-6 | Bandwidth tracking must be asynchronous | Must not block HTTP responses |
| NFR-7 | Enforcement event log is immutable | No UPDATE or DELETE on `enforcement_event_log` table |
| NFR-8 | Stage notifications are idempotent | Each stage email sent once per resource per billing period regardless of threshold re-crossings |
| NFR-9 | Customer-facing error messages must not reveal merchant plan details | Generic error messages only |
| NFR-10 | Fraud detection check must not block order processing | Async spike detection |
| NFR-11 | All overage calculations are auditable | Every event logged in `enforcement_event_log` with metadata |
| NFR-12 | All billing amounts in USD | Currency conversion at order creation time for non-USD stores |

---

## UX Notes

- Enforcement communications should always frame limit hits as growth milestones, not failures. Example: "You're crushing it!" at 80%, not "You are approaching your limit."
- Upgrade CTAs should show the benefit: "On Scale, your X orders would be at Y% — plenty of room to grow."
- Progress bars use a color gradient that communicates urgency without panic: green (< 80%), yellow (80–94%), orange (95–99%), red (100%+).
- The grace period countdown is displayed as a live countdown timer, not a static timestamp.
- Banners are persistent and non-dismissible — merchants must take action or wait for reset to remove them.
- Customer error messages at hard block are generic and professional, never mentioning plan limits or Prosperna billing.

---

## Data Model Notes

### merchant_usage
Tracks cumulative resource usage per merchant per billing period.
- Primary key: `id` (BIGSERIAL)
- Unique constraint: `(merchant_id, billing_period_start)`
- Key fields: `orders_count`, `orders_limit`, `bandwidth_gb`, `bandwidth_limit_gb`, `storage_gb`, `storage_limit_gb`, `product_sku_count`, `product_sku_limit`, `billing_period_start`, `billing_period_end`

### merchant_enforcement_state
One record per merchant. Tracks current enforcement stage and all stage timestamps.
- Primary key: `id` (BIGSERIAL); Unique: `merchant_id`
- Key fields: `status` (normal/warning/urgent/grace_period_active/throttled/blocked), `warning_sent_at`, `urgent_sent_at`, `grace_period_started_at`, `grace_period_hours` (default 48), `grace_reminder_sent_count`, `hard_limit_reached_at`, `overage_accepted` (boolean), `overage_acceptance_date`

### enforcement_event_log
Immutable audit trail. No UPDATE or DELETE.
- Key fields: `merchant_id`, `event_type` (warning/urgent/grace_started/grace_reminder/hard_limit/upgraded/reset/overage_accepted), `resource_type`, `usage_count`, `usage_limit`, `usage_percentage`, `metadata` (JSONB), `created_at`

### order_queue
Orders queued during soft throttle.
- Key fields: `merchant_id`, `order_data` (JSONB), `status` (queued/processing/processed/failed), `process_at`, `created_at`, `processed_at`

---

## Integrations and APIs

| Integration | Purpose |
|---|---|
| ST-01 Payment Abstraction Layer | Upgrade payment processing, prorated charge calculation, overage invoice collection |
| ST-03 Trial Plan | Provides plan context (Scale-tier limits) for trial merchants |
| ST-04 Suspended Account State | Invoked on overage invoice payment failure (pending stakeholder confirmation) |
| ST-11 Merchant Dashboard | Usage Dashboard page and enforcement banner rendering |
| ST-12 Admin Platform | Enforcement dashboard and admin override tools |
| ST-14 Email Templates | All enforcement and billing email delivery |
| ST-15 Background Jobs | Scheduling and execution of threshold checker, order queue processor, overage calculator |

### Background Jobs
| Job | Schedule | Purpose |
|---|---|---|
| `usage-threshold-checker` | Event-driven (after each order/upload) | Check if any threshold crossed; trigger appropriate enforcement stage |
| `queued-order-processor` | Every 1–5 minutes | Process orders in `order_queue` that have reached `process_at` |
| `end-of-month-overage-processor` | Daily (checks for period-end merchants) | Calculate overages, generate invoices, reset counters |

---

## Error Handling

| Error Scenario | System Response | User Message |
|---|---|---|
| Upload exceeds max file size | Reject upload (HTTP 422) | "File exceeds your plan's X MB limit. Upgrade to [next plan] for up to Y MB uploads." |
| SKU publish exceeds plan limit | Reject publish (HTTP 422) | "You've reached your plan's X SKU limit. Upgrade to [next plan] for up to Y SKUs." |
| Order rejected at hard block (125%+) | Reject order (HTTP 503) | Generic: "We're unable to process your order at this time. Please try again later or contact the store owner." |
| Upgrade payment failure | No plan change; surface payment error | "Payment failed. Your plan was not changed. Please try again." |
| Queued order processing failure | Retry; log error in `order_queue.error_message` | No customer-facing error; retry in next processor run |
| Bandwidth threshold check failure | Non-blocking; log error; do not block the request | Transparent to user |

---

## Telemetry and Analytics

| Event | Trigger | Properties |
|---|---|---|
| `usage.threshold_crossed` | Resource crosses 80%, 95%, 100%, or 125% | `merchant_id`, `resource_type`, `threshold_pct`, `usage`, `limit` |
| `enforcement.warning_sent` | 80% email dispatched | `merchant_id`, `resource_type`, `usage_pct` |
| `enforcement.urgent_sent` | 95% email dispatched | `merchant_id`, `resource_type`, `usage_pct` |
| `enforcement.grace_started` | Grace period activated | `merchant_id`, `resource_type`, `grace_expires_at` |
| `enforcement.hard_limit_reached` | Stage 4 activated | `merchant_id`, `resource_type`, `trigger` (grace_expired / 125_pct) |
| `upgrade.initiated` | Merchant clicks upgrade CTA | `merchant_id`, `from_plan`, `to_plan`, `from_stage` |
| `upgrade.completed` | Plan change confirmed and activated | `merchant_id`, `from_plan`, `to_plan`, `prorated_charge_usd`, `overages_forgiven` |
| `overage.accepted` | Merchant confirms overage acceptance | `merchant_id`, `resource_type`, `estimated_overage_usd` |
| `overage.invoiced` | Overage invoice generated | `merchant_id`, `total_usd`, `line_items` |
| `order.queued` | Order enters 15-min queue | `merchant_id`, `order_id`, `process_at` |
| `order.queue_processed` | Queued order successfully processed | `merchant_id`, `order_id`, `queue_duration_seconds` |
| `fraud.spike_detected` | 10× daily average exceeded | `merchant_id`, `today_count`, `daily_average` |
| `enforcement.reset` | Admin manually resets limits | `merchant_id`, `admin_id`, `reason` |
| `enforcement.grace_extended` | Admin extends grace period | `merchant_id`, `admin_id`, `hours_added` |

---

## Rollout Plan

### Phase A — Shadow Mode (4 weeks)
- Deploy usage tracking infrastructure (metering, `merchant_usage`, `merchant_enforcement_state`).
- Enforcement actions disabled (no emails, no banners, no throttling, no blocking).
- Usage dashboard available in read-only mode.
- Collect 4 weeks of real usage data.
- Send month-end summary emails to merchants.
- Internal review: adjust limit thresholds if data indicates poor fit.

### Phase B — Enforcement Live (3-week gradual rollout)
- Week 1: Enable enforcement for 10% of merchants.
- Week 2: Expand to 50%.
- Week 3: Expand to 100%.
- Monitor churn, upgrade conversion rates, and negative feedback daily during rollout.
- Rollback criteria: If churn rate exceeds 5% in any cohort within the first week, pause rollout and investigate.

---

## Open Questions

| # | Question | Owner | Assumption Used |
|---|---|---|---|
| OQ-1 | Should overage invoice payment failure trigger immediate account suspension (same as subscription non-payment), or should it be handled differently? | Product / Finance | A-4: Assumes immediate suspension (same as ST-04). |
| OQ-2 | At what point in Phase B rollout is the "Upgrade during grace forgives overages" rule no longer acceptable from a finance perspective? | Finance | Current assumption: always applies. |
| OQ-3 | Should merchants on Scale who exceed their limits see a custom/enterprise pricing CTA instead of a standard upgrade button? | Product | Current assumption: out of scope. Generic "contact us" CTA for Scale overages. |
| OQ-4 | Should the fraud detection threshold (10× daily average) be configurable per merchant or plan tier? | Engineering / Product | Current assumption: fixed at 10× across all plans. |

---

# Gherkin User Stories

## Feature: Usage Limits & Enforcement System

---

### FR-1: Resource Usage Tracking

```gherkin
Feature: Resource Usage Tracking

  Scenario: Orders counter increments on successful order
    Given a merchant on the Launch plan with 0 orders this period
    When a customer successfully places an order on the merchant's store
    Then the merchant's orders_count increments by 1
    And the threshold checker is triggered

  Scenario: Multi-item order counts as one order
    Given a merchant with 50 orders this period
    When a customer places a single order containing 5 items
    Then the merchant's orders_count becomes 51
    And does not increment by 5

  Scenario: Storage increments on upload and decrements on deletion
    Given a merchant with 5.0 GB of storage used
    When the merchant uploads a 0.5 GB file
    Then storage_gb becomes 5.5 GB
    When the merchant deletes a 0.2 GB file
    Then storage_gb becomes 5.3 GB

  Scenario: Bandwidth tracking is asynchronous
    Given a merchant's storefront is receiving customer traffic
    When a customer loads a product page
    Then the page loads without waiting for bandwidth tracking to complete
    And the bandwidth counter is updated asynchronously

  Scenario: Sales volume in non-USD currency
    Given a merchant whose store currency is PHP
    When a customer places an order totaling PHP 5,000
    Then the system converts PHP 5,000 to USD at the current exchange rate at order creation time
    And increments the merchant's sales_volume_year_usd by the converted amount
```

---

### FR-2 & FR-5: 4-Stage Enforcement — Warning (80%)

```gherkin
Feature: Warning Stage at 80%

  Scenario: Warning email and badge at 80% for orders
    Given a merchant on the Launch plan with a 200-order monthly limit
    When the merchant processes their 160th order (80% of 200)
    Then a warning email is sent to the merchant with a celebratory tone
    And the merchant dashboard shows a green warning badge for orders
    And service continues normally — no restriction

  Scenario: Warning email is sent only once per resource per period
    Given a merchant on the Launch plan who already received a warning email for orders this period
    When the merchant processes additional orders (e.g., order 161, 162...)
    Then no additional warning email is sent for orders this period

  Scenario: Warning is independent per resource
    Given a merchant at 82% for orders and 61% for bandwidth
    Then a warning email and badge is shown for orders
    And no warning is shown for bandwidth (under 80%)
    And the two resources are tracked independently
```

---

### FR-2 & FR-5: 4-Stage Enforcement — Urgent (95%)

```gherkin
Feature: Urgent Stage at 95%

  Scenario: Urgent email and banner at 95% for orders
    Given a merchant on the Launch plan with a 200-order limit
    When the merchant processes their 190th order (95% of 200)
    Then an urgent warning email is sent
    And a yellow dashboard banner appears with the count of remaining orders
    And service continues normally

  Scenario Outline: Urgent threshold across all plans
    Given a merchant on the <plan> plan with an orders limit of <limit>
    When the merchant processes order number <threshold_order>
    Then an urgent email is triggered
    Examples:
      | plan   | limit | threshold_order |
      | Launch | 200   | 190             |
      | Grow   | 750   | 713             |
      | Scale  | 2500  | 2375            |
```

---

### FR-2, FR-3, FR-5: 4-Stage Enforcement — Grace Period (100%)

```gherkin
Feature: Grace Period at 100%

  Scenario: Grace period starts at 100% for orders
    Given a merchant on the Launch plan with a 200-order limit
    When the merchant processes their 200th order
    Then a 48-hour grace period starts
    And a grace period email is sent explaining all three options
    And a blue dashboard banner appears showing hours remaining
    And orders continue processing normally during grace

  Scenario: Daily grace reminder emails during grace period
    Given a merchant's grace period has been active for 24 hours
    Then a grace reminder email is sent: "Grace period ending in 24 hours — What's your plan?"

  Scenario: Orders process normally during grace
    Given a merchant is in the 48-hour grace period with 200 orders
    When a new customer places an order
    Then the order is processed immediately without delay
    And the customer receives a standard order confirmation
```

---

### FR-2, FR-4b, FR-5: 4-Stage Enforcement — Hard Limit (Stage 4)

```gherkin
Feature: Hard Limit Stage

  Scenario: Orders queued when grace period expires
    Given a merchant whose 48-hour grace period has expired
    And the merchant has not upgraded or accepted overages
    When a new customer places an order
    Then the order is placed in the order_queue with process_at = NOW() + 15 minutes
    And the customer sees: "Your order has been received and is being processed. You'll receive a confirmation shortly."
    And the merchant's dashboard shows a red banner

  Scenario: Orders blocked at 125% without overage acceptance
    Given a merchant on the Launch plan at 250 orders (125% of 200)
    And the merchant has not accepted overage charges
    When a new customer attempts to place an order
    Then the order is rejected
    And the customer sees: "We're unable to process your order at this time. Please try again later or contact the store owner."
    And the error message does not mention plan limits or Prosperna billing

  Scenario: Orders continue normally at 125% with overage acceptance
    Given a merchant on the Launch plan at 250 orders
    And the merchant has previously accepted overage charges for this period
    When a new customer places an order
    Then the order is processed immediately without delay
    And the merchant's overage accumulates for end-of-period billing
```

---

### FR-3: Hard Gate — Max File Size

```gherkin
Feature: Max File Size Hard Gate

  Scenario: Upload rejected when file exceeds plan limit
    Given a merchant on the Launch plan (5 MB file size limit)
    When the merchant attempts to upload an 8 MB file
    Then the upload is rejected immediately
    And the merchant sees: "File exceeds your plan's 5 MB limit. Upgrade to Grow for up to 10 MB uploads."

  Scenario Outline: File size gate across all plans
    Given a merchant on the <plan> plan with a <limit> MB file size limit
    When the merchant uploads a file of <file_size> MB
    Then the upload is <outcome>
    Examples:
      | plan   | limit | file_size | outcome  |
      | Launch | 5     | 4.9       | accepted |
      | Launch | 5     | 5.1       | rejected |
      | Grow   | 10    | 9.9       | accepted |
      | Grow   | 10    | 10.1      | rejected |
      | Scale  | 15    | 14.9      | accepted |
      | Scale  | 15    | 15.1      | rejected |
```

---

### FR-3: Hard Gate — Product SKUs

```gherkin
Feature: Product SKU Hard Gate

  Scenario: SKU publish rejected at plan limit
    Given a merchant on the Launch plan with 500 published SKUs (at the limit)
    When the merchant tries to publish a new product variant (which would be SKU 501)
    Then the publish action is rejected
    And the merchant sees: "You've reached your plan's 500 SKU limit. Upgrade to Grow for up to 2,000 SKUs."

  Scenario: Multi-variant product partially exceeds limit
    Given a merchant on the Launch plan with 498 published SKUs
    When the merchant tries to publish a product with 3 variants
    Then 2 variants are published (reaching the 500 limit)
    And the 3rd variant is rejected with the plan limit message
```

---

### FR-6: One-Click Upgrade Flow

```gherkin
Feature: One-Click Upgrade Flow

  Scenario: Merchant upgrades from Launch to Grow mid-period
    Given a merchant on the Launch plan ($29/mo) with 15 days remaining in the billing period
    And the merchant is at Stage 2 (urgent, 95%)
    When the merchant clicks "Upgrade Now"
    And selects the Grow plan ($59/mo)
    And confirms the prorated charge of $15.00 (15 days × $1.00/day difference)
    And payment succeeds
    Then the Grow plan limits take effect immediately (750 orders)
    And the enforcement state is cleared (all stage timestamps reset)
    And the dashboard banner is removed
    And current-period overages are forgiven
    And an upgrade confirmation email is sent
    And all of this completes within 30 seconds

  Scenario: Upgrade payment fails
    Given a merchant who has initiated an upgrade
    When the payment fails via the Payment Abstraction Layer
    Then the merchant's plan is not changed
    And the merchant sees: "Payment failed. Your plan was not changed. Please try again."
    And the enforcement state is unchanged

  Scenario: Merchant upgrades during grace period — overages forgiven
    Given a merchant on the Launch plan at 205 orders (grace period active)
    When the merchant upgrades to Grow
    And payment succeeds
    Then the new Grow plan limit of 750 takes effect
    And 205 orders = 27.3% of 750 — no enforcement state
    And any accrued current-period overages are forgiven (not billed)
```

---

### FR-7: Overage Acceptance Flow

```gherkin
Feature: Overage Acceptance Flow

  Scenario: Merchant accepts overages at 100%
    Given a merchant on the Grow plan at 751 orders (grace period active)
    When the merchant clicks "Accept Overage Charges"
    And sees the estimated cost: "1 order over limit. Estimated overage: $0.15 ($0.15/order)."
    And confirms acceptance
    Then overage_accepted is set to true for this billing period
    And all subsequent orders process immediately without throttle
    And the blue grace banner remains until the period ends

  Scenario: Overage acceptance is per-billing-period only
    Given a merchant who accepted overages in the previous billing period
    When a new billing period starts
    Then overage_accepted resets to false
    And the merchant must explicitly accept overages again if they exceed limits this period
```

---

### FR-8: Overage Billing

```gherkin
Feature: Overage Billing at Period End

  Scenario: Overage invoice generated for orders and bandwidth overages
    Given a Grow plan merchant at the end of their billing period
    And they processed 850 orders (limit: 750, excess: 100 @ $0.15 = $15.00)
    And they used 85 GB bandwidth (limit: 75, excess: 10 GB @ $0.18 = $1.80)
    And they used 28 GB storage (limit: 30, no overage)
    When the end-of-month-overage-processor runs
    Then an itemized overage invoice is generated totaling $16.80
    And an overage invoice email is sent with the breakdown
    And the invoice is due 7 days from generation

  Scenario: No invoice when no overages
    Given a merchant who stayed within all plan limits for the billing period
    When the end-of-month-overage-processor runs
    Then no overage invoice is generated
```

---

### FR-9: Billing Cycle Reset

```gherkin
Feature: Billing Cycle Reset

  Scenario: Orders and bandwidth counters reset at period start
    Given a merchant on the last day of their billing period with 195 orders and 24 GB bandwidth used
    When the new billing period starts
    Then orders_count resets to 0
    And bandwidth_gb resets to 0
    And all enforcement state timestamps are cleared
    And the merchant's status returns to 'normal'

  Scenario: Storage does not reset
    Given a merchant with 9.5 GB of storage used at period end
    When a new billing period starts
    Then storage_gb remains at 9.5 GB (not reset)

  Scenario: Grace period carries over billing reset
    Given a merchant whose grace period started on the last day of the billing period
    When the new billing period starts
    Then orders_count resets to 0
    But the grace period state is preserved with the countdown continuing
    When the grace period expires
    Then the system evaluates the new period's counters (which are 0)
    And the merchant returns to 'normal' enforcement status
```

---

### FR-13: Fraud Detection

```gherkin
Feature: Fraud Detection — Anomalous Order Spike

  Scenario: Anomalous spike triggers fraud detection
    Given a merchant who averages 50 orders per day over the last 30 days
    When today's order count reaches 500 (10× the daily average)
    Then a temporary 30-minute throttle is applied to the merchant's order processing
    And the Prosperna ops team receives an internal alert
    And the merchant receives a notification: "We noticed unusual activity on your store and have temporarily slowed order processing for your protection."

  Scenario: Admin clears fraud flag for legitimate sale
    Given a merchant who triggered fraud detection due to a flash sale
    When a Prosperna admin reviews the alert and confirms it is legitimate
    And uses the "Clear Fraud Flag" override tool
    Then the throttle is removed immediately
    And orders process normally
```

---

### FR-12: Admin Override Tools

```gherkin
Feature: Admin Override — Reset Limits

  Scenario: Admin manually resets a merchant's usage counters
    Given a merchant whose usage data was corrupted by a platform bug
    When an admin uses "Reset Limits" on the enforcement dashboard
    Then the merchant's orders_count, bandwidth_gb are reset to 0
    And the enforcement state is cleared to 'normal'
    And the reset event is recorded in enforcement_event_log with admin_id and reason

Feature: Admin Override — Extend Grace Period

  Scenario: Admin extends grace period for goodwill
    Given a merchant with 18 hours remaining in their grace period
    And the merchant called support requesting more time due to a banking issue
    When an admin adds 24 hours to the grace period via "Extend Grace"
    Then the merchant's grace now expires in 42 hours
    And the extension event is recorded in enforcement_event_log
```

---

### Edge Cases

```gherkin
Feature: Edge Cases

  Scenario: Multiple resources at different enforcement stages simultaneously
    Given a merchant at 82% for orders (Warning stage)
    And at 103% for bandwidth (Grace stage)
    When the merchant views their dashboard
    Then the dashboard shows the Grace stage banner (highest severity)
    And both warning and grace emails were sent for their respective resources
    And each resource shows its own stage in the usage progress bars

  Scenario: Platform downtime during grace period
    Given a merchant with 30 hours remaining in their grace period
    When the Prosperna platform experiences 6 hours of downtime
    Then the grace period is extended by 6 hours (now 36 hours remaining)
    And an incident is logged
    And the merchant is notified of the extension

  Scenario: Merchant hits limit on last day of billing cycle
    Given a merchant on the Launch plan who processes order 200 on day 30 of their period
    When the 48-hour grace period starts
    And the billing period resets the next day (counters go to 0)
    Then the grace period continues but evaluates against the new period's 0 orders
    And the system clears the grace state since the merchant is now under all limits
```

---

# Traceability Map

| Requirement | Scenario(s) |
|---|---|
| FR-1 (Resource tracking) | "Orders counter increments on successful order", "Multi-item order counts as one order", "Storage increments on upload and decrements on deletion", "Bandwidth tracking is asynchronous", "Sales volume in non-USD currency" |
| FR-2.1 (Warning 80%) | "Warning email and badge at 80% for orders", "Warning email is sent only once per resource per period", "Warning is independent per resource" |
| FR-2.2 (Urgent 95%) | "Urgent email and banner at 95% for orders", "Urgent threshold across all plans" (Outline) |
| FR-2.3 (Grace 100%) | "Grace period starts at 100% for orders", "Daily grace reminder emails during grace period", "Orders process normally during grace" |
| FR-2.4/2.5 (Hard Limit) | "Orders queued when grace period expires", "Orders blocked at 125% without overage acceptance", "Orders continue normally at 125% with overage acceptance" |
| FR-3 (File size hard gate) | "Upload rejected when file exceeds plan limit", "File size gate across all plans" (Outline) |
| FR-3 (SKU hard gate) | "SKU publish rejected at plan limit", "Multi-variant product partially exceeds limit" |
| FR-5 (Banners) | Covered by all enforcement stage scenarios (banner state validated per scenario) |
| FR-6 (Upgrade flow) | "Merchant upgrades from Launch to Grow mid-period", "Upgrade payment fails", "Merchant upgrades during grace period — overages forgiven" |
| FR-7 (Overage acceptance) | "Merchant accepts overages at 100%", "Overage acceptance is per-billing-period only" |
| FR-8 (Overage billing) | "Overage invoice generated for orders and bandwidth overages", "No invoice when no overages" |
| FR-9 (Billing reset) | "Orders and bandwidth counters reset at period start", "Storage does not reset", "Grace period carries over billing reset" |
| FR-10 (Order queue) | "Orders queued when grace period expires", "Orders blocked at 125% without overage acceptance" |
| FR-13 (Fraud detection) | "Anomalous spike triggers fraud detection", "Admin clears fraud flag for legitimate sale" |
| FR-12 (Admin overrides) | "Admin manually resets a merchant's usage counters", "Admin extends grace period for goodwill" |
| NFR-9 (No plan details to customers) | "Orders blocked at 125% without overage acceptance" (generic error message assertion) |
| Edge Cases | "Multiple resources at different enforcement stages simultaneously", "Platform downtime during grace period", "Merchant hits limit on last day of billing cycle" |
