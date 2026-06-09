---
id: max-insights-scheduled-alerts
title: Max Insights — Scheduled Alerts
sidebar_label: Max Insights Scheduled Alerts
sidebar_position: 8
---

# Max Insights — Scheduled Alerts BRD

## Scope Note

This document is **cross-platform and implementation-complete**. It covers the full **Max Insights — Scheduled Alerts** capability across two delivered work streams:

- **Stream A — Create & deliver (v1):** a merchant tells **Max AI** in plain language to schedule a recurring or one-time report ("digest"); the platform stores the schedule, then at the scheduled time — with no human logged in — pulls the store's real orders/leads data, has an LLM write a short summary, and delivers it to the merchant's **in-app notification bell** and **email**. Management (list / cancel) is available **in chat**.
- **Stream B — View & delete in the dashboard (v2):** a new **Settings → Scheduled Alerts** page inside the Max AI section of the merchant dashboard where a merchant can **see** every scheduled alert (recurring and one-time) with its schedule, scope, and status, and **delete** any of them behind a confirmation dialog.

The focus is observable, user-visible behavior, business rules, and QA-testable outcomes across the merchant dashboard (`prosperna1`), the AI service (`aina-service`), and the notification/email/data services. It is **primarily merchant-facing**, with a secondary **email channel** for delivery.

Out of band for this document: the AI's general reporting/Q&A behavior, LLM summarization quality/ranking, and any data-domain beyond orders and leads.

---

## 1. Overview

### 1.1 Purpose

Max Insights lets a merchant turn an in-the-moment AI conversation into a standing, automated report. Instead of repeatedly asking Max AI "how are my sales this month?", the merchant asks once for the report to be **scheduled** — "every morning at 9, tell me how my orders and new leads are doing" or "in 30 minutes, send me a summary of today's orders." The platform then watches and delivers on that schedule even while the merchant is offline.

Stream A delivered the create / deliver / chat-management path. Stream B added a dedicated dashboard surface so the merchant is no longer required to talk to Max AI just to **see** what is scheduled or to **delete** a schedule.

### 1.2 Problem or Opportunity

- A merchant who closes the chat loses any standing visibility into their business; nothing keeps watching for them.
- Before Stream A, there was no way to receive proactive, periodic business summaries without manually opening the dashboard and asking each time.
- After Stream A but before Stream B, the **only** way to review or cancel a schedule was to talk to Max AI in chat. There was no screen anywhere in the dashboard that showed what was scheduled, which is hard to discover and easy to forget.

Max Insights closes both gaps: proactive scheduled delivery, plus a visible, manageable list.

### 1.3 Success Measures

- A merchant can ask Max AI, in natural language, to schedule a recurring or one-time orders/leads report, and Max AI confirms the schedule.
- At the scheduled time, with no human logged in, the merchant receives both (a) a new notification-bell row and (b) an email, each containing a coherent summary built from the store's **real** order/lead numbers.
- A merchant can open **Settings → Scheduled Alerts** and see every scheduled alert for their store with a correct human-readable schedule, scope, and status.
- A merchant can delete any scheduled alert from that page (behind a confirmation), which both removes the schedule and stops it from ever firing again.
- A merchant from one store can never see or delete another store's alerts.

---

## 2. Scope

### 2.1 In Scope

**Stream A — Create & deliver (delivered in v1):**

- **Chat-based creation:** Max AI's SMB sub-agent extracts a structured "digest spec" from the merchant's sentence (domains, time window/period, schedule, title, delivery channels) and creates the schedule.
- **Schedule types:** recurring (DAILY / WEEKLY / MONTHLY at a local time) and one-time (a single future instant).
- **Data domains:** orders/sales and leads/contacts only.
- **Deterministic firing:** at fire time the platform replays the stored spec, pulls real data via internal service-to-service calls, has an LLM compose a summary, and delivers it.
- **Two delivery channels:** an in-app notification-bell headline and a full email digest.
- **Chat-based management:** the merchant can ask Max AI "what reports do I have scheduled?" and "cancel my daily orders digest."
- **Per-store cap:** a maximum of active schedules per store (10), enforced at create time with a friendly at-cap message.

**Stream B — View & delete in the dashboard (delivered in v2):**

- A new **Settings** area inside the Max AI section of the dashboard, reachable from the left sidebar, with a single **Scheduled Alerts** sub-navigation item.
- A list of **all** of the store's scheduled alerts (both ENABLED and DISABLED, recurring and one-time), each showing a human-readable title, schedule, scope (domains + period), and a status badge.
- A **Delete** action per alert, guarded by a confirmation dialog, that performs a hard delete (removes the stored row **and** cancels the background job).
- Store-scoped access enforced server-side from the merchant's identity token, so a merchant only ever sees and deletes their own store's alerts.

### 2.2 Out of Scope

- **Creating, editing, or pausing/resuming** schedules from the dashboard. Creation stays in Max AI chat; the dashboard page is **view + delete only**. Enable/disable toggling and an in-page create form are explicitly deferred.
- **Real-time / event-based triggers.** Only time-based schedules are supported (no "alert me when a big order comes in").
- **Data domains beyond orders and leads** (e.g., products, payouts, traffic).
- **A "next run" countdown / cron-next computation** in the UI. The schedule is shown as deterministic descriptive text, not a computed next-fire timestamp.
- **LLM summary quality, ranking, or tuning**, and the storefront/customer surfaces.
- **New data model fields, background-job changes, new environment variables, or gateway changes** for Stream B (it is purely additive: a new read/delete endpoint pair + dashboard UI).

### 2.3 Dependencies or Constraints

- **Max AI (aina-service) SMB sub-agent** owns chat creation/list/cancel via its scheduled-digest tools.
- **notification-service-api** owns the scheduled-digest collection, the background-job scheduler, the notification-bell records, the v1 **internal-key** controller (for the AI service), and the v2 **merchant-authed** controller (for the dashboard).
- **orders-service-api** and **marketing-service-api** supply the orders and leads data at fire time via internal-key calls.
- **email-service** renders and sends the digest email.
- **api-aggregator** (gateway) validates the merchant token and proxies `/v1/notifications/*`; it strips/overwrites any client-supplied store identity header. **No gateway change** was required for Stream B.
- **prosperna1** dashboard hosts the Max AI chat and the new Settings → Scheduled Alerts page.
- **Identity & isolation:** at fire time there is no logged-in user, so all server-to-server work uses the **internal API key**. For the dashboard, the browser does **not** hold that key; the merchant-authed endpoints derive `store_id` **only** from the validated token (never from client input), which is what makes cross-store access structurally impossible.
- **Timezone:** recurring times are stored as a local `HH:MM` plus an IANA timezone; one-time alerts store an absolute instant. The dashboard formats one-time alerts in the alert's IANA timezone using the built-in `Intl.DateTimeFormat` (no extra dependency).

---

## 3. Functional Requirements

> Terminology: a **scheduled digest** (code/DB term) and a **scheduled alert** (merchant-facing label in the UI) are the same thing.

### FR-01: Create a scheduled alert from Max AI chat

**Description:**

A merchant can create a recurring or one-time orders/leads report by describing it to Max AI in natural language. Max AI extracts a structured spec and confirms the schedule.

**Preconditions:**

- The merchant is logged in and on the Max AI chat.
- The store is below the per-store active-alert cap (10).

**Main Flow:**

1. The merchant types a scheduling intent (e.g., "Every morning at 9, summarize my orders and new leads," or "In 30 minutes send me today's orders").
2. Max AI's SMB sub-agent extracts a digest spec: domains (orders and/or leads), period/time window, schedule type and timing, a title, and delivery channels.
3. The schedule is stored and a background job is registered.
4. Max AI confirms back to the merchant in chat what was scheduled (what, when, where it will be delivered).

**Expected UI Behavior or Rules:**

- The merchant must receive an explicit in-chat confirmation of the created schedule.
- If the store is already at the cap, creation must not occur and Max AI must surface a friendly at-cap message instead.
- Domains are limited to orders and leads; intents outside these domains must not silently create an unsupported schedule.

### FR-02: Manage scheduled alerts from Max AI chat

**Description:**

A merchant can ask Max AI to list their scheduled alerts and to cancel a specific one, entirely in chat.

**Main Flow:**

1. The merchant asks "what reports do I have scheduled?" → Max AI lists the store's current scheduled alerts.
2. The merchant asks "cancel my daily orders digest" → Max AI cancels the matching schedule (removes the row and its background job) and confirms.

**Expected UI Behavior or Rules:**

- List and cancel operate only on the asking merchant's store.
- Cancel is a hard removal that also stops future firing.

### FR-03: Deterministic delivery at fire time

**Description:**

At each scheduled time, the platform replays the stored spec, fetches the store's real data, composes a summary, and delivers it — without any logged-in user.

**Preconditions:**

- An ENABLED scheduled alert exists whose fire time has arrived.

**Main Flow:**

1. The background job fires at the scheduled local time (recurring) or absolute instant (one-time).
2. The service pulls the store's real orders and/or leads data for the spec's period via internal-key service-to-service calls.
3. An LLM composes a short natural-language summary from those real numbers.
4. The summary is delivered as (a) a notification-bell headline row in the dashboard and (b) a full email digest with a dashboard call-to-action.

**Expected UI Behavior or Rules:**

- Delivery must reflect the **store's actual** numbers for the requested period, not placeholder data.
- A **one-time** alert flips to DISABLED after it fires (it does not recur).
- Recurring alerts fire on each occurrence and remain ENABLED.
- Firing must respect the alert's timezone.

### FR-04: Open the Scheduled Alerts settings page

**Description:**

From the Max AI section of the dashboard, the merchant can open a Settings area whose only navigation item is **Scheduled Alerts**.

**Preconditions:**

- The merchant can access Max AI (same access; no separate permission gate).

**Main Flow:**

1. In the left sidebar, while in the Max AI section, the merchant sees a persistent **Settings** item just below the "Max AI" back row.
2. Clicking **Settings** navigates to the Scheduled Alerts page (a real, bookmarkable route under the Max AI section).
3. The chat interface is replaced by a two-pane settings layout: an inner sub-navigation (only **Scheduled Alerts**) and a content area showing the Scheduled Alerts panel by default.

**Expected UI Behavior or Rules:**

- The **Settings** item is visible in both the chat view and the settings view.
- There is exactly **one** back affordance at a time: the sidebar back chevron is context-aware — on the settings page it returns to the Max AI chat; on the chat it returns to the dashboard. There is no separate, redundant "back to chat" link.
- The page is reachable by URL (browser back/forward and bookmarking work); it is not an in-page toggle.
- Anyone who can open Max AI can open this page; there is no extra plan/permission gate. Access is still store-scoped server-side.

### FR-05: View the list of scheduled alerts

**Description:**

The Scheduled Alerts page lists every scheduled alert for the merchant's store with human-readable details.

**Preconditions:**

- The merchant is on the Scheduled Alerts page.

**Main Flow:**

1. On mount, the page requests the store's scheduled alerts from the merchant-authed endpoint.
2. Each alert renders as a card showing: **Title**, **Schedule** (human-readable), **Scope** (domains + period), **Status** badge, and a **Delete** action.

**Expected UI Behavior or Rules:**

- The list shows **all** statuses — both ENABLED and DISABLED (including one-time alerts that already fired) — each with a clear status badge.
- **Schedule** is rendered as deterministic descriptive text:
  - One-time → "One-time on Jun 9, 2026, 8:00 PM" (formatted in the alert's IANA timezone).
  - Daily → "Daily at 8:00 AM (Asia/Manila)".
  - Weekly → "Weekly on Mon, Wed at 8:00 AM (Asia/Manila)".
  - Monthly → "Monthly on day 15 at 8:00 AM (Asia/Manila)".
- **Scope** is rendered as domains + period, e.g., "Orders, Leads · Last 7 days".
- **Status** badge reuses the platform's shared status palette: ENABLED renders green, DISABLED renders neutral gray, consistent with order/payment status pills elsewhere in the dashboard.
- The title falls back to a domain-derived label only if a stored title is missing.
- A malformed or legacy row must degrade to sensible fallback text and must never crash the page.
- **Loading state:** a spinner shows while the list is being fetched (the page must not flash the empty state before data arrives).
- **Empty state:** when the store has no alerts, show "No scheduled alerts yet — ask Max AI to create one." (not an error).
- **Error state:** when the fetch fails, show a friendly error with a retry affordance; the dashboard must not crash.

### FR-06: Delete a scheduled alert (with confirmation)

**Description:**

The merchant can permanently delete any scheduled alert from the list, guarded by a confirmation dialog. Delete is a hard delete that also stops future firing.

**Preconditions:**

- At least one scheduled alert is listed.

**Main Flow:**

1. The merchant clicks the **Delete** (trash) action on an alert card.
2. A confirmation dialog appears: title "Delete scheduled alert?", naming the alert, with "This can't be undone." and a **Delete** confirm button.
3. On confirm, the dashboard calls the merchant-authed delete endpoint with the alert's id.
4. The server removes the stored row and cancels the background job (store-scoped), then the list refetches and the row disappears.

**Expected UI Behavior or Rules:**

- Delete must never fire on a single stray click — the confirmation dialog is mandatory.
- While the delete is in flight, the dialog shows a loading/disabled state.
- On success, the row is removed from the list (conveyed by the list refetch); a deleted alert no longer fires.
- On failure, the error is surfaced **inside** the confirm dialog (the dialog stays open and the confirm action can be retried), not hidden behind the modal backdrop.
- Deleting an alert that is already gone (e.g., id not found, or belongs to another store) resolves benignly as "no matching alert" and refreshes the list — it is never a hard error.
- Canceling the dialog closes it and deletes nothing.

### FR-07: Cross-store isolation (server-enforced)

**Description:**

A merchant can only ever list and delete their own store's scheduled alerts.

**Expected Behavior or Rules:**

- The merchant-authed list and delete endpoints derive `store_id` **only** from the validated identity token, never from a value in the URL or request body.
- A request with no/empty resolved store identity is rejected with an auth-style response and does not touch data.
- A crafted delete of another store's alert id resolves as "no matching alert" (removes nothing); the other store's alert is unaffected.
- The dashboard's network traffic for one merchant only ever returns that merchant's store's alerts.

---

## 4. Acceptance Criteria

- A merchant can create a recurring and a one-time orders/leads alert via Max AI chat and receives an in-chat confirmation. (FR-01)
- At the per-store cap, creation is blocked with a friendly message. (FR-01)
- A merchant can list and cancel alerts in chat, scoped to their store. (FR-02)
- A scheduled alert fires at the correct time with no user logged in, delivering a bell row and an email built from the store's real data; a one-time alert flips to DISABLED after firing. (FR-03)
- The **Settings** item is visible just below "Max AI" in the sidebar, in both chat and settings views, with exactly one context-aware back affordance. (FR-04)
- The Scheduled Alerts page lists all of the store's alerts with correct human-readable schedule, scope, and ENABLED/DISABLED badge, and handles loading, empty, and error states. (FR-05)
- Deleting an alert requires confirmation, removes the row and stops future firing, and surfaces failures inside the dialog. (FR-06)
- A second merchant account cannot see or delete the first merchant's alerts; a crafted cross-store delete removes nothing. (FR-07)

---

## 5. QA Test Scenarios

### Happy Path

- Create a daily orders+leads alert at 9:00 AM in chat → confirmation appears → it later shows on the Scheduled Alerts page reading "Daily at 9:00 AM (`<tz>`)" with scope "Orders, Leads · `<period>`" and an ENABLED badge.
- Create a one-time alert 5 minutes out → at fire time a bell row and an email arrive with a real-data summary → the alert later shows as DISABLED on the page.
- Open Settings → Scheduled Alerts, click Delete on an alert, confirm → the row disappears and the alert no longer fires.

### Negative Path

- Attempt to create an 11th active alert when 10 already exist → blocked with the at-cap message; no new alert is created.
- Backend list endpoint unreachable → page shows the friendly error state with retry, not a crash.
- Delete request fails → error is shown inside the confirm dialog; the dialog stays open and the confirm can be retried.
- Cancel the delete dialog → nothing is deleted; the list is unchanged.

### Edge Cases

- A merchant with no alerts → empty state ("ask Max AI to create one"), not an error.
- A one-time alert whose time has passed → shown as DISABLED, still visible and deletable.
- A legacy/malformed alert row (missing title or fields) → renders fallback text without crashing.
- 12-hour formatting edge cases: midnight ("12:00 AM") and noon ("12:00 PM") render correctly; an invalid time degrades to a safe fallback.
- A store with alerts → on first load the loading spinner shows; the empty state must not flash before data arrives.
- Second merchant logs in → sees only their own alerts; a crafted delete of the first merchant's alert id removes nothing.

---

## 6. BDD (Gherkin)

```gherkin
Feature: Scheduled Alerts settings page

  Scenario: Open Scheduled Alerts from the Max AI sidebar
    Given I am a logged-in merchant on the Max AI chat
    When I click the "Settings" item below the "Max AI" row in the sidebar
    Then I am taken to the Scheduled Alerts page on a real, bookmarkable URL
    And the chat is replaced by a two-pane settings layout with "Scheduled Alerts" selected
    And exactly one back affordance is shown, returning me to the Max AI chat

  Scenario: View my store's scheduled alerts
    Given I have at least one scheduled alert
    When the Scheduled Alerts page loads
    Then I see a loading spinner while the list is fetched
    And each alert shows a title, a human-readable schedule, a scope, and an ENABLED or DISABLED badge

  Scenario: Empty state for a store with no alerts
    Given my store has no scheduled alerts
    When the Scheduled Alerts page loads
    Then I see "No scheduled alerts yet — ask Max AI to create one."
    And I do not see an error

  Scenario: Delete a scheduled alert with confirmation
    Given I am viewing my scheduled alerts
    When I click Delete on an alert and confirm in the dialog
    Then the alert's row is removed from the list
    And the alert no longer fires at its scheduled time

  Scenario: Delete failure is shown in the dialog
    Given I confirm deletion of an alert
    When the delete request fails
    Then the error is shown inside the confirmation dialog
    And the dialog stays open so I can retry

  Scenario: Cross-store isolation
    Given I am logged in as a merchant for Store A
    When I attempt to delete an alert id that belongs to Store B
    Then nothing is deleted
    And Store B's alert is unaffected

  Scenario: Scheduled delivery with no user logged in
    Given I created a one-time alert scheduled five minutes out
    When the scheduled time arrives and no one is logged in
    Then a notification-bell row appears with a summary of my store's real data
    And a digest email is delivered with the same summary
    And the alert's status becomes DISABLED
```

---

## 7. Business Rules

- **BR-01:** "Scheduled digest" (code/DB) and "scheduled alert" (UI) are the same entity.
- **BR-02:** Creation happens only in Max AI chat. The dashboard page is **view + delete only**.
- **BR-03:** Only time-based schedules are supported (recurring DAILY/WEEKLY/MONTHLY or one-time). No real-time/event triggers.
- **BR-04:** Only the orders and leads domains are supported.
- **BR-05:** A maximum of 10 active alerts per store; creation at the cap is blocked with a friendly message.
- **BR-06:** Delivery happens on both channels — notification bell and email — and reflects the store's real data for the spec's period.
- **BR-07:** A one-time alert flips to DISABLED after it fires; recurring alerts remain ENABLED.
- **BR-08:** The Scheduled Alerts page shows all statuses (ENABLED and DISABLED) with a status badge.
- **BR-09:** Delete is a hard delete: it removes the stored row **and** cancels the background job, and is irreversible — so it is guarded by a confirmation dialog.
- **BR-10:** A delete that matches nothing for the store resolves benignly ("no matching alert"), never as a hard error.
- **BR-11:** Access to the page requires the same access as Max AI; there is no extra permission gate. Data access is store-scoped server-side regardless.
- **BR-12:** `store_id` for the merchant-authed endpoints is derived only from the validated identity token, never from client-supplied input; cross-store access is structurally impossible.
- **BR-13:** Schedules are shown as deterministic descriptive text (no client-side next-run computation); one-time times are formatted in the alert's IANA timezone, recurring times show their `HH:MM` plus timezone label.
- **BR-14:** At fire time there is no logged-in user, so all server-to-server work (data fetch, email send, bell write) uses the internal API key.

---

## 8. Open Questions

- **Pause/resume and edit:** explicitly deferred. Is enabling/disabling (without delete) or editing a schedule a planned next milestone? The service already supports status toggling if added later.
- **In-dashboard create:** creation remains chat-only. Is a future create/edit form on this page desired?
- **At-cap copy & limit:** is 10 the final per-store cap, and is the at-cap message wording finalized for QA to assert against?
- **Additional domains:** are domains beyond orders/leads (e.g., products, payouts) on the roadmap, and would they surface on this same page?
- **Forged store-identity header (dev verification):** confirm in the dev environment that the gateway strips/overwrites any client-supplied store-identity header so a forged header cannot reach the service.
- **Upstream coupling (operational note):** the identity resolver makes an upstream business-profile call and throws on failure; if business-profile is degraded, list/delete can fail with an auth-style error even when notification-service-api itself is healthy. Confirm acceptable behavior/messaging.

---

## 9. Summary

Max Insights — Scheduled Alerts turns a one-off Max AI conversation into a standing, automated report. A merchant asks Max AI in plain language for a recurring or one-time orders/leads summary; the platform stores the schedule and, at the scheduled time and with no one logged in, delivers a real-data summary to the merchant's notification bell and email. A new **Settings → Scheduled Alerts** page in the dashboard gives the merchant a clear, store-scoped view of every alert — with a guarded delete that both removes the schedule and stops it from firing. Creation and edit stay in chat (view + delete only on the page); only time-based orders/leads schedules are supported; and cross-store access is structurally prevented by deriving the store identity solely from the validated token.

---

## Approval and Sign-off

| Stakeholder    | Role | Status    | Date Signed |
| -------------- | ---- | --------- | ----------- |
| Dennis Velasco | CEO  | ☐ Pending | ---         |
| Ruel Nopal     | HoE  | ☐ Pending | ---         |
| Aira Pilor     | QA   | ☐ Pending | ---         |
| Michael Santos | BE   | ☐ Pending | ---         |
| Brian Millonte | FE   | ☐ Pending | ---         |
