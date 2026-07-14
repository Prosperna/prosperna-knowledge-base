---
id: byo-shipping-lalamove
title: BRD. Bring-Your-Own Shipping — Lalamove
sidebar_label: BYO Shipping (Lalamove)
sidebar_position: 4
---

## Document Control
- Version: 1.1
- Owner: Business Analyst Agent
- Date: 2026-07-14
- Status: Implemented (pending deploy operator steps)
- Revision note (v1.1): rewritten to be QA-friendly — every requirement is verified by clicking through the Merchant Dashboard (`prosperna1`) and the storefront checkout (`p1-customer`), with the exact on-screen labels, URLs, and expected values a tester sees. Frontend test steps are folded in from the dev UI walkthrough performed on `dev` against `feat/byo-shipping-lalamove`.

---

## Scope Note

This document is **cross-platform and QA-friendly, written for frontend verification**. Every functional requirement below is testable by a QA engineer clicking through two real user interfaces — the **Merchant Dashboard** (`prosperna1`) and the **Online Store checkout** (`p1-customer`) — and every confirmation is something visible on screen (a badge, a toast, a shipping-fee amount, an order field). Section 6 (QA Test Scenarios) is a screen-by-screen walkthrough with the exact labels, URLs, and expected values.

One item — the raw webhook-signature rejection (HTTP 401) — cannot be forged from the UI. It is verified by the dev team with a REST client and is clearly flagged as such; QA confirms its **effect** in the frontend (order statuses auto-update and the "Webhook active" indicator turns green only from legitimate callbacks).

It intentionally does **not** cover: other couriers (J&T BYO, DoorDash, USPS, UPS), the label/manifest courier shape, non-Philippines markets, the Scheduled Delivery (`CUSTOM_DELIVERY_DATE`) Lalamove path (still runs on the platform account under BYO), and the J&T/Laravel webhook security holes tracked separately. Backend implementation details are described only where they change observable behavior.

---

## 1. Overview

### 1.1 Purpose

Every merchant on the Prosperna platform ships Lalamove deliveries through a single, platform-owned Lalamove account. The platform's own Lalamove wallet is billed for every delivery, the API keys are three global environment variables shared by all stores, and no merchant can use their own Lalamove account, negotiated rates, or wallet.

Bring-Your-Own (BYO) shipping lets a merchant connect *their own* courier account so that their deliveries are quoted, booked, tracked, and billed on *their* credentials instead of the platform's. A merchant opens Shipping settings, pastes their own Lalamove API key and secret, clicks **Connect**, and the platform confirms the keys work with a live Lalamove test call. From that moment every Lalamove quotation and booking for that store is signed with their keys and billed to their Lalamove wallet. A merchant who does not connect keeps working exactly as before on the shared platform account — the two modes coexist and BYO is purely opt-in.

Beneath the Lalamove vertical this delivers the first two pieces of a reusable BYO shipping framework: a **courier provider abstraction** (one interface every courier implements, plus a registry that is the single source of truth for which couriers exist) so future couriers are "implement the interface" rather than "scatter logic across five repos", and a **per-store credential path** (an encrypted place to keep a merchant's courier secret, plus a resolver that hands the right keys to the right call). It also closes a live security hole: the Lalamove webhook previously accepted a plaintext key with the real cryptographic signature check commented out, letting anyone who learned a public key move any order to "Completed".

### 1.2 Problem or Opportunity

- Merchants cannot use their own Lalamove account, rates, or wallet; the platform absorbs all Lalamove billing.
- Merchants cannot control the customer-facing delivery rate on courier methods — the fee is always the live quote plus a hardcoded 3%, and the "Flat Shipping Fee" option is blocked for courier methods.
- The Lalamove webhook trusts a plaintext public key (real HMAC verification was commented out), an exploitable security hole affecting every store.
- Adding a new courier previously meant touching five repositories with no shared contract.

### 1.3 Success Measures

- A store with no connection quotes and books exactly as before (platform keys), with zero regression.
- A store that connects valid keys has its quotations and bookings signed with those keys and billed to its own Lalamove wallet (observable: the delivery appears in the merchant's own Lalamove dashboard, billed to their wallet).
- A Lalamove webhook with a tampered or missing signature is rejected with HTTP 401 instead of being trusted.
- A BYO merchant can control the customer-facing Lalamove delivery rate per method (at cost, markup, or their own flat table) and the checkout Shipping line shows exactly that amount.
- A BYO merchant is shown the exact webhook URL to register and a "Webhook active" indicator flips once their first correctly-signed callback arrives.
- The dev UI walkthrough (Section 6) passes end to end on `dev`.

---

## 2. Scope

### 2.1 In Scope

- **Provider abstraction + registry** — one courier interface, a single-source-of-truth registry, Lalamove refactored behind it with no behavior change.
- **Lalamove webhook security fix** — re-enabled and generalized HMAC-SHA256 verification (platform *and* per-store secrets), non-throwing 401 on bad/missing signature, empty-body verify-ping preserved.
- **BYO Lalamove end-to-end** — merchant connect/disconnect UI and endpoints, encrypted per-store secret at rest, live key validation, per-store key resolution threaded through quote/book/webhook.
- **Per-store wallet-balance flag** — the global insufficient-balance flag becomes per-store state driven by each merchant's own wallet webhook.
- **BYO webhook onboarding** — the Connect UI shows the exact webhook URL, Partner-Portal instructions, and a per-store "Webhook active" indicator.
- **Two live order-write fixes** (affect platform merchants today) — the tracking link now persists where the order view and customer SMS read it; the courier label is read from the payload instead of hardcoded.
- **Merchant-controlled delivery rates for BYO stores** (Lalamove Same-Day) — AUTO (at cost, no 3%), Courier Quote + Your Add-ons (quote + flat add-on and/or percentage markup), Flat Shipping Fee (merchant's own rate table replaces the quote).
- **Connection uniqueness** — a Lalamove public key can be connected to at most one store platform-wide.

### 2.2 Out of Scope

- Other couriers (J&T BYO, DoorDash, USPS, UPS). The interface supports them; only Lalamove is implemented and tested.
- The label/manifest courier shape (declared on the interface, unimplemented — no label courier in scope to test).
- The J&T `shipping-service-api` webhook and the Laravel `jt-shipping-api` unauthenticated endpoints — tracked for a separate BYO J&T effort.
- Non-Philippines markets (PH stays hardcoded).
- Unifying the three overlapping shipping-**method** enums (registry unifies *couriers*, not *methods*).
- **Scheduled Delivery** (`CUSTOM_DELIVERY_DATE`): still quoted/booked/billed on the *platform* Lalamove account even for a BYO merchant, and gets none of the rate modes. Known gap, deferred.
- `DRIVER_ASSIGNED` webhook handling (rider name/phone/plate) — deferred.

### 2.3 Dependencies or Constraints

- **Lalamove Partner Portal is manual**: Lalamove has no webhook-registration API. Each BYO merchant must paste the webhook URL into their own Partner Portal by hand; the platform cannot automate it.
- **Encryption**: the merchant secret is encrypted at rest (AES-256-GCM, env `ENCRYPTION_KEY`). A missing key fails connect loudly rather than storing plaintext.
- **Internal service auth**: cross-service calls reuse the `p1_internal_api_key` header and the existing `API_URL_COM` api-aggregator host — no new URL secrets. Plaintext keys travel only over the internal network.
- **Webhook enforcement flag**: `LALAMOVE_WEBHOOK_VERIFY_MODE` ships defaulting to `observe` (recompute + log match, still accept). An operator must capture one real webhook, confirm the `matched:true` log and that `LALAMOVE_WEBHOOK_PATH` matches the Partner-Portal-registered path, then set `enforce` to activate the 401.
- **Env vars required before deploy**: `API_URL_COM`, `ENCRYPTION_KEY` (bpa), `P1_INTERNAL_API_KEY` (both services, matching), `LALAMOVE_WEBHOOK_PATH`, `LALAMOVE_PUB_KEY`/`LALAMOVE_SECRET_KEY`/`LALAMOVE_BASE_API_URL`.
- **Milestone 7 index build is a hard deploy gate**: `autoIndex` build failures are only logged. Before deploy, dedupe any existing live `lalamoveConnection.pubKey` collisions and verify the partial unique index exists.

---

## 3. Test Environment and Navigation Map

QA runs everything below on `dev` against the feature branch, through the real UIs. No code, database, or command-line access is needed except for the two clearly-flagged backend/security checks (FR-04 raw-signature rejection and the wallet-flag webhook), which the dev team drives with a REST client while QA watches the on-screen effect.

### 3.1 Test accounts and data (set up once)

- **Store A — the BYO store.** A Philippine test store you can log into on `prosperna1`, plus a **Lalamove sandbox API key + secret** you can connect to it.
- **Store B — the control store.** A second Philippine test store with **no** BYO connection, used to prove nothing changed for platform-managed merchants.
- Two browser sessions/profiles so you can be the merchant (`prosperna1`) and the shopper (storefront) at the same time.
- A free-shipping discount configured on Store A (for the free-shipping rate test).

> **Philippines only.** The "Connect your own Lalamove account" card and the Lalamove couriers are hidden for US stores. Use PH stores.

> **Sandbox is safe to book.** On `dev`, Lalamove runs in **sandbox** — tracking links look like `share.sandbox.lalamove.com`. Clicking **Book a Rider** makes a real sandbox API call (returns a Reference #, vehicle type, status, tracking link) but dispatches **no real driver and moves no real money**. Book as often as you like. Checkout payment uses a mock/test gateway.

### 3.2 Where each thing is tested (navigation map)

- **Connect / disconnect / webhook onboarding** — Merchant Dashboard → left nav **Settings → Shipping** → URL `/home/shipping-settings` → scroll to the **"Connect your own Lalamove account"** card at the bottom.
- **Rate modes (AUTO / markup / FLAT)** — from `/home/shipping-settings`, click **"Manage"** on the **"Same Day Delivery"** card → URL `/home/shipping-settings/sameday-sched`.
- **Customer-facing shipping fee** — Online Store → **Checkout** (`/checkout`) → right-hand **"Order Summary"** sidebar → **"Shipping Fee:"** line.
- **Order fields, booking, tracking link** — Merchant Dashboard → **Orders** → open an order → URL `/home/customer-orders/view/<id>` → **"Shipping"** and **"Delivery"** blocks. (See Section 11, "How to read an order.")

> **Checkout gotcha (important for QA):** the Lalamove quote fires when the shopper **selects an E-Wallet payment method** with **Same Day Delivery** chosen — **not** when clicking the shipping card. The quote also requires the shopper to **pin the delivery location on the map** (otherwise the toast *"Please pin your location to the map."* appears). The final fee then resolves on the **"Shipping Fee:"** line with a 5-minute validity timer.

---

## 4. Functional Requirements

### FR-01: Connect a Lalamove Account (Merchant Dashboard)

**Description:**

A merchant must be able to connect their own Lalamove account from Shipping settings by entering their API (public) key and secret key. The platform validates the keys with a live Lalamove call before persisting anything, and never stores or displays the plaintext secret.

**Preconditions:**

- Authenticated merchant with a Philippine store.

**Main Flow:**

1. Merchant opens the **"Connect your own Lalamove account"** card (bottom of `/home/shipping-settings`).
2. Merchant enters **"API Key (Public Key)"** (placeholder `pk_...`) and **"Secret Key"**, then clicks **Connect**.
3. The system runs a global uniqueness check for the key (FR-09), then a live Lalamove test call with the entered keys.
4. On success, the secret is encrypted and a connection is persisted (`status: CONNECTED`, `enabled: true`).

**Expected UI Behavior or Rules:**

- The target store is always derived from the logged-in session (JWT claim), never a request-body value (IDOR protection).
- On validation failure nothing is persisted; a clear error toast is shown and the card stays disconnected.
- The stored secret is never returned to the client or shown back in the form.

**How QA verifies (frontend):**

- Blank field + **Connect** → toast *"Please enter both your Lalamove API key and secret key."* (no save).
- Valid sandbox keys + **Connect** → button spinner (live test call) → toast **"Lalamove account connected."** → card flips to a green **"Connected"** badge, text **"Your API keys are verified and in use."**, a **"Public key:"** line, and a **"Disconnect"** button.
- Invalid secret + **Connect** → toast **"Failed to connect your Lalamove account."** → card stays disconnected.

### FR-02: Disconnect a Lalamove Account

**Description:**

A merchant must be able to disconnect, reverting the store to the platform-managed path.

**Main Flow:**

1. Merchant clicks **Disconnect** in the connected state.
2. The connection is cleared (`pubKey: ''`, `status: DISCONNECTED`, `enabled: false`) and the dashboard config cache is invalidated.

**Expected UI Behavior or Rules:**

- After disconnect the store immediately resolves to platform keys for quote/book/webhook.
- Disconnect is reversible; re-connecting the same key to the same store succeeds (secret rotation / idempotent reconnect).

**How QA verifies (frontend):**

- **Disconnect** → confirmation dialog **"Disconnect Lalamove account"** with body *"Your store will go back to using the Prosperna-managed Lalamove account…"* → Confirm → toast **"Lalamove account disconnected."** → card returns to the empty key-entry form.
- Reconnect with valid keys → works again (idempotent).

### FR-03: Resolve Keys per Store (Quote / Book)

**Description:**

Every Lalamove quotation and booking must be signed with the connected store's keys when the store has an enabled connection, and must fall back to platform keys otherwise.

**Main Flow:**

1. A checkout quote or a booking carries the store identity.
2. The resolver looks up the store's connection; if enabled, it fetches the decrypted keys over the internal network and signs with them; otherwise it signs with platform keys.

**Expected UI Behavior or Rules:**

- All three quote/book paths (checkout quote, Book-a-Rider booking, shipping-fee computation) resolve the **same** store, so a BYO merchant is never quoted on platform rates but booked on their own account (silent mismatch).
- No connection ⇒ platform path (backward compatible).
- A hung internal resolver falls back to platform keys within ~3s rather than stalling checkout.

**How QA verifies (frontend):**

- Store B (no connection): at checkout the **"Shipping Fee:"** resolves; **Book a Rider** on the order succeeds and the booking is on the **platform** account (unchanged).
- Store A (connected): at checkout the **"Shipping Fee:"** resolves; after placing and booking, the delivery appears in **Store A's own Lalamove sandbox dashboard**, billed to their wallet.
- Backend confirmation (dev, optional): `shipping-service-api` logs show `keySource: PLATFORM` for Store B and `keySource: STORE` for Store A on both the quote and the booking.

### FR-04: Verify Lalamove Webhook Signatures (Security Fix)

**Description:**

The Lalamove webhook must verify the HMAC-SHA256 signature using the correct secret (platform or per-store, routed by the `apiKey` in the body) and reject tampered or missing-signature callbacks.

**Main Flow:**

1. A webhook arrives with `apiKey`, `signature`, `timestamp`, and `data`.
2. The middleware routes by `apiKey` (platform key ⇒ platform secret; otherwise the matching store's secret) and recomputes the signature over the raw request bytes.

**Expected UI Behavior or Rules:**

- Bad or missing signature ⇒ first-class, non-throwing HTTP 401 (not a swallowed 200).
- Missing field or unknown `apiKey` ⇒ 401 in **both** `observe` and `enforce` modes; only a genuine signature *mismatch* is downgraded to log-and-pass under `observe`.
- Empty body (Lalamove's dashboard verify-ping) ⇒ HTTP 200.
- The signed `path` is env-configurable (`LALAMOVE_WEBHOOK_PATH`) to match the Partner-Portal-registered path as it arrives via api-aggregator.

**How QA verifies:**

- **Frontend effect (what QA watches):** order statuses auto-update and the "Webhook active" indicator (FR-06) turns green only from legitimate, correctly-signed callbacks. A tampered callback produces no status change.
- **Backend/security check (dev team with a REST client — not forgeable from the UI):** empty body `{}` ⇒ 200; missing field ⇒ 401 (both modes); unknown `apiKey` ⇒ 401 (both modes); correctly-signed ⇒ passes and updates status; signature mismatch ⇒ passes-with-log in `observe`, **401** in `enforce`.

### FR-05: Per-Store Wallet-Balance Flag

**Description:**

Each store's insufficient-balance state must reflect its own Lalamove wallet, replacing the single global flag.

**Main Flow:**

1. A `WALLET_BALANCE_CHANGED` webhook (keyed by the account's public key) upserts a per-account flag.
2. The store's Shipping/booking UI reads its own effective flag (platform fallback for unconnected stores).

**Expected UI Behavior or Rules:**

- A wallet event for Store A must not affect Store B.
- Low/empty-balance emails fire for the **platform** account only; BYO merchants top up on Lalamove's side.

**How QA verifies (frontend, dev triggers the webhook):**

- After a low-balance webhook for Store A, Store A's Same Day cards / **Book a Rider** header show *"Lalamove is temporarily unavailable…"* and the button is disabled; **Store B is unaffected**.

### FR-06: BYO Webhook Onboarding and Verification Indicator

**Description:**

Because Lalamove has no webhook-registration API, the connected-state UI must show the merchant the exact webhook URL to register in their Partner Portal and prove that callbacks are flowing.

**Preconditions:**

- The store has a `CONNECTED` Lalamove connection.

**Main Flow:**

1. The connected state renders a **"Finish setup: register your webhook"** block: the **"Webhook URL"** in a read-only field with a **Copy** button, numbered Partner-Portal steps, and a status badge.
2. When the first correctly-signed callback for the store's public key arrives, the badge flips to verified.

**Expected UI Behavior or Rules:**

- The badge shows verified only on a genuine signature **match** (never on an observe-mode pass-through of a mismatch).
- Connecting is never blocked on webhook setup (booking works without callbacks); the indicator is informational but prominent.

**How QA verifies (frontend):**

- Connected state shows badge **"Waiting for first callback"** (yellow), the instruction paragraph, the read-only **"Webhook URL"** ending in `LALAMOVE_WEBHOOK_PATH` (e.g. `https://api.dev.prosperna.com/v1/shipping/lalamove/webhook`), **Copy** → toast **"Webhook URL copied to clipboard."**, numbered steps (**1.** Log in to the Lalamove Partner Portal → **2.** Developers → Webhook → **3.** Paste + Save), and a **"Check again"** button.
- After registering the URL and driving one real callback, the badge flips to green **"Webhook active"** with *"We've received a signed callback from your Lalamove account (last received …). Delivery status updates are flowing."* (click **"Check again"** if it does not refresh).

### FR-07: Order-Write Fixes (Tracking Link + Courier Label)

**Description:**

The webhook order-update path must persist the delivery tracking link where the order-view UI and customer SMS actually read it, and label the courier from the payload rather than hardcoding Lalamove.

**Expected UI Behavior or Rules:**

- A status-only webhook (no link) must not blank an existing tracking link.
- Fixes a live defect affecting platform merchants today (the old write went to a field the UI never read and was silently dropped).

**How QA verifies (frontend):**

- On an order's **"Delivery"** block, after a rider is booked and Lalamove returns a share link, a **"Tracking Link :"** row appears: *"See real-time location of rider "* + a bold **"here"** link (opens Lalamove tracking).
- A subsequent status-only update does not blank the link.
- **"Shipping → Shipped By"** shows the courier from the payload, defaulting to **`LALAMOVE`**.
- The customer's status-update **SMS** includes the tracking link.

### FR-08: Merchant-Controlled Delivery Rates (BYO, Same-Day)

**Description:**

A BYO-connected store can control the customer-facing Lalamove Same-Day rate per method: pass the quote through at cost, add a markup, or replace it with their own flat/tiered rate table. Platform-account stores keep today's behavior (quote + 3%, no FLAT).

**Preconditions:**

- Store has an enabled `CONNECTED` connection; the method is **Same Day Delivery** (`SAMEDAY_SCHED`).

**Main Flow:**

1. The computation reads which keys signed the quote.
2. Platform-signed ⇒ quote + 3% (FLAT/markup ignored). Store-signed ⇒ **AUTO** = quote at cost (no 3%); **Courier Quote + Your Add-ons** = quote × (1 + markup% / 100) + province-matched flat add-on (no 3%); **Flat Shipping Fee** = the merchant's rate-table fee replaces the quote (no 3%).
3. The checkout **"Shipping Fee:"** line shows exactly that amount.

**Expected UI Behavior or Rules:**

- **Invariant**: the live Lalamove quote is always still fetched (even in FLAT) because booking needs its Reference #, stops, and vehicle type; only the customer-facing fee changes.
- The add-on for "Courier Quote + Your Add-ons" uses the rate-table entry matching the **customer's province**; on no match it falls back to the first entry (mirroring FLAT). It must not blindly use the first entry.
- The merchant-configured amount lands on the **Shipping** line, not the Additional Fee line (see Business Rules for the tax and free-shipping consequences).
- The rate UI exposes FLAT and the **"Markup %"** input (0–100) only when the method is Same Day **and** the store is connected; the backend save-gate enforces the same (400 otherwise).

**How QA verifies (frontend):**

- Merchant side (Store A connected, `/home/shipping-settings/sameday-sched`, **"Who Pays for Shipping?" = Customer**): the **"Shipping Fee Calculation"** section lists all three modes — **"Auto-Calculated by Courier"**, **"Courier Quote + Your Add-ons"**, **"Flat Shipping Fee"**. Selecting "Courier Quote + Your Add-ons" reveals a **"Markup %"** input; saving shows the **"Warning"** confirm dialog then persists. Selecting "Flat Shipping Fee" and saving a tier succeeds.
- Merchant side (Store B not connected): **"Flat Shipping Fee"** is absent and no **"Markup %"** input appears.
- Customer side (Store A checkout, per config): AUTO → fee = quote at cost (lower than Store B for a comparable distance); "Courier Quote + Your Add-ons" with `markup_percent: 20` + a customer-province ₱50 add-on on a ~₱300 quote → **"Shipping Fee: ₱410.00"**; "Flat Shipping Fee" ₱75 tier → **"Shipping Fee: ₱75.00"** (order still books via the live quote); a free-shipping discount → line reads **"Free Shipping"** and the add-on is waived too.

### FR-09: Enforce One Store per Lalamove Account (Connection Uniqueness)

**Description:**

A Lalamove public key must be connectable to at most one store platform-wide, because a webhook carries only the `pubKey` with no store/owner context.

**Main Flow:**

1. At connect, before the live validate-keys call, the system looks up any *other* store already holding this key.
2. If found, connect is rejected with HTTP 400; a partial unique index backstops the race at the database.

**Expected UI Behavior or Rules:**

- Same-owner conflict: the error names the conflicting store — `This Lalamove account is already connected to your store "<name>". Disconnect it there first.`
- Different-owner (or ownership uncertain): the error stays generic — `This Lalamove account is already connected to another store.`
- Re-connecting the same key to the same store still succeeds (exclude-self lookup).

**How QA verifies (frontend):**

- Connect a key already held by a *different* store you own → connect error toast naming that store and telling you to disconnect it there first.
- Connect a key held by a store owned by someone else → generic "already connected to another store" toast.
- The rejection appears before any live validation spinner completes (fails fast).

---

## 5. Acceptance Criteria

All criteria are observable in the UI unless marked *(dev/REST)*.

- Store B (no connection) quotes and books exactly as before: checkout shows a **"Shipping Fee:"** = quote + 3%; **Book a Rider** succeeds on the platform account; order fields unchanged.
- Store A connects valid keys and shows the green **"Connected"** state; its checkout quotes resolve; its booking appears in its own Lalamove dashboard billed to its wallet.
- Invalid keys at connect → **"Failed to connect your Lalamove account."** and nothing persisted.
- The connected state shows the webhook URL, **Copy**, numbered instructions, and a **"Waiting for first callback"** badge that flips to **"Webhook active"** after the first correctly-signed callback; an observe-mode mismatch does not flip it; Store B is unaffected.
- An order's **"Delivery"** block shows the **"Tracking Link"** row after booking; a status-only update does not blank it; **"Shipped By"** reflects the payload courier (default `LALAMOVE`).
- Rate modes: Store A (connected) shows AUTO / "Courier Quote + Your Add-ons" / "Flat Shipping Fee" with a **"Markup %"** input; Store B shows only AUTO (no FLAT, no markup). Saving FLAT under Same Day succeeds only for a connected store *(dev/REST returns 400 for an unconnected store)*.
- Customer-facing fee: AUTO = quote at cost; markup 20% + ₱50 add-on on ₱300 = **₱410.00** on the Shipping line (province-matched, with a first-entry fallback for out-of-table provinces, and nothing added to Additional Fee); FLAT ₱75 = **₱75.00** while booking still uses the live quote; free-shipping discount waives the add-on.
- Connection uniqueness: connecting a key already on a different store → connect error (named store for same owner, generic across owners), no connection persisted; self-reconnect succeeds.
- Webhook signature security *(dev/REST)*: correctly-signed passes; tampered/missing/unknown-key rejected with 401 in `enforce`; empty-body ping returns 200.
- Regression: non-Lalamove methods (Standard/JNT, Pickup, Manual) unaffected; existing platform Lalamove orders still view/track/book.

---

## 6. QA Test Scenarios

A screen-by-screen walkthrough. On-screen labels are quoted exactly. Two browser sessions: merchant (`prosperna1`) and shopper (storefront).

### 6.1 Merchant side (`prosperna1`)

**Scenario M1 — Find the BYO connect card**
1. Left nav **Settings → Shipping** (URL `/home/shipping-settings`).
2. Expected: heading **"Shipping Settings"**; a **"Prosperna Shipping"** sub-section with courier cards (**"Standard Delivery"**, **"Same Day Delivery"**, …). At the bottom, the card **"Connect your own Lalamove account"** with sub-copy starting *"Use your own Lalamove API keys so deliveries are quoted, booked, and billed on your account…"*.

**Scenario M2 — Connect Store A (happy path)**
1. On the card (disconnected), see fields **"API Key (Public Key)"** (placeholder `pk_...`) and **"Secret Key"** (password), and helper *"We'll make a live test call to Lalamove to verify these keys before saving."*
2. Click **Connect** with a blank field → toast *"Please enter both your Lalamove API key and secret key."*
3. Enter valid sandbox keys → **Connect** → spinner → toast **"Lalamove account connected."**
4. Expected: green **"Connected"** badge, **"Your API keys are verified and in use."**, a **"Public key:"** line, and a **"Disconnect"** button.

**Scenario M3 — Invalid secret is rejected (negative)**
1. Disconnect (M6), then enter the valid pub key with a **wrong secret** → **Connect**.
2. Expected: toast **"Failed to connect your Lalamove account."**; card stays disconnected; nothing persisted.

**Scenario M4 — Webhook onboarding block (connected only)**
1. On the connected card, see sub-heading **"Finish setup: register your webhook"**, a yellow **"Waiting for first callback"** badge, the instruction paragraph, and the read-only **"Webhook URL"** ending in the configured path (e.g. `https://api.dev.prosperna.com/v1/shipping/lalamove/webhook`).
2. Click **Copy** → toast **"Webhook URL copied to clipboard."**
3. Expected: numbered steps **1. Log in to the Lalamove Partner Portal. 2. Developers → Webhook. 3. Paste the URL and Save.**, muted *"No callback received yet…"*, and a **"Check again"** button.
4. Register the URL in Store A's own Partner Portal (return in W1 to confirm it flips).

**Scenario M5 — IDOR guard (security)**
1. In Store A's session, tamper the connect/disconnect request body `storeId` to Store B's id (browser network tab / REST client).
2. Expected: Store B is **not** modified (server uses the JWT store claim, ignores the body id). No store claim → **401**.

**Scenario M6 — Disconnect / reconnect**
1. Click **Disconnect** → dialog **"Disconnect Lalamove account"** (*"Your store will go back to using the Prosperna-managed Lalamove account…"*) → Confirm.
2. Expected: toast **"Lalamove account disconnected."**; card returns to the form (keys cleared).
3. Reconnect valid keys → works. Leave Store A **connected** for the rate tests.

**Scenario M7 — Connection uniqueness (negative)**
1. Attempt to connect Store A's key to another store you own → error toast naming Store A and telling you to disconnect it there first.
2. Attempt to connect a key owned by another merchant's store → generic **"already connected to another store"** toast. Rejection is immediate (before validation completes).

**Scenario M8 — Rate settings, BYO modes**
1. From `/home/shipping-settings`, click **"Manage"** on **"Same Day Delivery"** (URL `/home/shipping-settings/sameday-sched`, heading **"Same Day Delivery"**).
2. **Store A (connected):** set **"Who Pays for Shipping?" = Customer** → **"Shipping Fee Calculation"** lists **"Auto-Calculated by Courier"**, **"Courier Quote + Your Add-ons"**, **"Flat Shipping Fee"**. Select "Courier Quote + Your Add-ons" → a **"Markup %"** input (0–100) appears; enter `20`, blur → persists; a mode change shows the **"Warning"** dialog (*"You are about to update the shipping fee calculation…"*) → Confirm. Select "Flat Shipping Fee", set a ₱75 tier for the customer's province → saves.
3. **Store B (not connected):** same page shows **no "Flat Shipping Fee"** and **no "Markup %"** input.

### 6.2 Customer side (`p1-customer` — storefront checkout)

**Scenario C1 — Back-compat: Store B (platform) quotes + books**
1. Store B storefront → add item → **Checkout** (`/checkout`, heading **"Checkout"**).
2. Fill **Contact & Delivery** and **pin the location on the map** (else toast *"Please pin your location to the map."*).
3. Under **"Shipping Method"**, select **"Same Day Delivery"** (*"Lalamove Same Day Shipping…"*).
4. Select an **E-Wallet** payment method → the quote fires (5-min timer) → **"Order Summary" → "Shipping Fee:"** resolves to a peso amount = **quote + 3%**.
5. Complete the order (**"Pay Now"**, mock payment).
6. Confirm in `prosperna1` → **Orders** → open it (`/home/customer-orders/view/<id>`): **Shipping Type** = `Same Day`, **Shipped By** = `LALAMOVE`, **Shipping Fee** = quote + 3% (`Shipping Fee ÷ 1.03` is a clean number), **Additional Fee** = `₱0.00`, **Delivery** block `N/A` until you click **Book a Rider** → Reference #, Vehicle Type, Delivery Status populate (booked on the **platform** account).

**Scenario C2 — BYO in effect: Store A quotes + books on its own keys**
1. Store A storefront → Checkout, same flow (address + pin → **"Same Day Delivery"** → E-Wallet) → **"Shipping Fee:"** resolves.
2. Place + **Book a Rider** → the booking appears in **Store A's own Lalamove sandbox dashboard** (billed to their wallet). *(Dev log confirmation: `keySource: STORE` on both quote and booking.)*

**Scenario C3 — Customer sees the merchant's configured rate**
Re-run Store A checkout to the point where **"Shipping Fee:"** resolves, once per config set in M8 (watch only that line — there is no on-screen mode breakdown):
1. **AUTO** → fee = quote at cost, **no 3%** (lower than Store B for a comparable distance).
2. **"Courier Quote + Your Add-ons"** with `markup_percent: 20` + a customer-province ₱50 add-on on a ~₱300 quote → **"Shipping Fee: ₱410.00"** (300 × 1.20 + 50), on the Shipping line, not as a separate Additional Fee.
   - Province matching: with the rate table's *first* entry a *different* province, the add-on still uses the **customer's** province rate; a customer province absent from the table falls back to the **first entry's** rate.
3. **"Flat Shipping Fee"** ₱75 tier matching the customer → **"Shipping Fee: ₱75.00"**, while the order still books via the live Lalamove quote.
4. **Free Shipping:** apply a free-shipping discount → the line reads **"Free Shipping"** and the merchant add-on is **waived too** (accepted behavior change).

### 6.3 Webhook and order status (both sides)

**Scenario W1 — "Webhook active" indicator flips**
1. After registering the URL (M4), drive one real, correctly-signed callback from Store A's Lalamove account (move a sandbox order's status).
2. On the connect card the badge flips to green **"Webhook active"** with *"We've received a signed callback… Delivery status updates are flowing."* (click **"Check again"** if needed).
3. Negative: an observe-mode signature *mismatch* does not flip it; Store B's indicator is unaffected by Store A's callbacks.

**Scenario W2 — Tracking link and status render (all merchants)**
1. `prosperna1` → **Orders** → open an order → **"Delivery"** section.
2. After a rider is booked and Lalamove returns a share link, a **"Tracking Link :"** row appears (*"See real-time location of rider "* + bold **"here"**).
3. A status-only update does not blank an existing link.
4. **"Book a Rider"** opens the **"Confirm Shipping Address"** modal; if the account is flagged low-balance the header shows *"Lalamove is temporarily unavailable…"* and the button is disabled.
5. The customer status-update **SMS** includes the tracking link.

**Scenario W3 — Per-store wallet flag** *(dev triggers the webhook; QA watches the UI)*
1. Send a low-balance `WALLET_BALANCE_CHANGED` for **Store A** → Store A's Same Day cards / Book-a-Rider show *"Lalamove is temporarily unavailable…"*; **Store B is unaffected**.
2. Low/empty-balance emails fire for the **platform** account only.

**Scenario W4 — Signature security (observe → enforce)** *(dev/REST — not forgeable from the UI)*
1. In `observe`: empty body `{}` → 200; missing field → 401; unknown `apiKey` → 401; correctly-signed → passes and updates status; signature mismatch → passes with log `lalamove.webhook.verify { matched: false }`.
2. Flip to `enforce` after confirming a real callback logs `{ matched: true }` and `LALAMOVE_WEBHOOK_PATH` matches the registered path → re-test: mismatch → **401**; empty-body still 200; correctly-signed still passes.

### 6.4 Regression sweep (before sign-off)

- Non-Lalamove methods (Standard/JNT, Pickup, Manual by Customer/Merchant) unaffected.
- JNT flow unaffected except the deliberate fee-line placement (merchant amounts now on the Shipping line).
- Existing platform Lalamove orders still view/track/book correctly.

---

## 7. BDD (Gherkin)

```gherkin
Feature: Connect a BYO Lalamove account (Merchant Dashboard)

Scenario: Connect with valid sandbox keys
  Given I am on "/home/shipping-settings" with a Philippine store and no connection
  And I scroll to the "Connect your own Lalamove account" card
  When I enter a valid API key and secret key and click "Connect"
  Then a live Lalamove test call runs and succeeds
  And I see the toast "Lalamove account connected."
  And the card shows a green "Connected" badge and a "Disconnect" button

Scenario: Reject an invalid secret
  Given the "Connect your own Lalamove account" card is disconnected
  When I enter a valid API key with a wrong secret and click "Connect"
  Then I see the toast "Failed to connect your Lalamove account."
  And the card stays disconnected with nothing saved
```

```gherkin
Feature: Webhook onboarding indicator (Merchant Dashboard)

Scenario: Indicator flips after the first signed callback
  Given my store is connected and shows the yellow "Waiting for first callback" badge
  And I have copied the "Webhook URL" and saved it in my Lalamove Partner Portal
  When my Lalamove account sends its first correctly-signed callback
  Then the badge turns green and reads "Webhook active"
  And a signature mismatch in observe mode does not flip it
```

```gherkin
Feature: Customer-facing BYO delivery rate (storefront checkout)

Scenario: Markup shows on the Shipping line
  Given Store A is connected and Same Day rate mode is "Courier Quote + Your Add-ons"
  And markup_percent is 20 and the customer-province add-on is 50
  And the live Lalamove quote is 300
  When I reach checkout, pin the map, choose "Same Day Delivery", and select an E-Wallet
  Then the "Order Summary" "Shipping Fee:" line reads "Shipping Fee: PHP 410.00"
  And no separate "Additional Fee" line carries the add-on

Scenario: Platform store keeps quote plus 3 percent
  Given Store B has no BYO connection
  When I reach checkout and the quote resolves
  Then the "Shipping Fee:" equals the live quote plus 3 percent
```

```gherkin
Feature: Connection uniqueness (Merchant Dashboard)

Scenario: Reject a key already used by another store I own
  Given Store A already holds Lalamove public key K
  When I try to connect key K to a different store I own
  Then I see a connect error that names Store A and says to disconnect it there first
  And no connection is saved
  And the rejection happens before the live validation completes
```

---

## 8. Business Rules

- **Coexistence / opt-in**: BYO is purely additive. A store with no connection uses the platform account exactly as before. No migration is forced.
- **Billing reality drives the fee**: the 3% platform fee protects the platform wallet float; it is waived for BYO-signed quotes (the merchant is billed directly by Lalamove) and kept for platform-signed quotes. The gate reflects which keys *actually signed* the quote, so the fee can never drift from billing reality.
- **Rate freedom is BYO-only**: FLAT/markup are gated to connected stores. A platform-account merchant undercharging would make the platform wallet eat the difference; a BYO merchant undercharging spends their own wallet — their business decision.
- **Fee placement — accepted consequences** (affects BYO and non-BYO stores using merchant-configured amounts): the amount moves from the Additional Fee line to the Shipping line. Pre-tax total is identical. **With-tax total** can change for a store whose shipping-method and additional-fee tax overrides differ (the amount is now taxed at the shipping-method rate). A **free-shipping discount** now waives these amounts along with the courier fee (previously they survived in Additional Fee). Both are the semantically correct behavior, are explicitly tested (Scenario C3), and must be called out at deploy.
- **Quotation always fetched**: even in FLAT mode the live Lalamove quote is fetched because booking needs its Reference #/stops; only the customer-facing fee changes.
- **Secret handling**: the secret is stored only as ciphertext, decrypted only over the internal network at resolve time, and never logged or shown back.
- **Uniqueness is global, not per-owner**: a Lalamove webhook carries only the `pubKey`, so any duplicate — even between two stores of the same owner — makes account-level routing ambiguous. A merchant reusing one Lalamove account across stores must disconnect it on the other store first.
- **"Webhook active" is trustworthy**: it flips only on a genuine signature match, never on an observe-mode pass-through.
- **Scope key**: everything keys on Same Day (`SAMEDAY_SCHED`). Scheduled Delivery stays on the platform account under BYO — a known, deferred gap.

---

## 9. Open Questions

- **Webhook enforcement flip**: `LALAMOVE_WEBHOOK_VERIFY_MODE` ships as `observe`. Operator must capture one real webhook, confirm `matched:true` and the `LALAMOVE_WEBHOOK_PATH`, then set `enforce`. Until flipped, the hole is *observable* (mismatches logged) but not yet *blocked*.
- **Wallet-flag migration window**: the per-account flag store starts empty, so the config reports "healthy" until each account's next `WALLET_BALANCE_CHANGED` webhook. Seed the platform row at deploy or accept the window.
- **Book-a-Rider tracking/cancel for BYO**: the share-link and cancel-job endpoints accept an optional `storeId`, but no caller passes it yet. Wiring it from a Book-a-Rider caller is a follow-up before BYO merchants rely on in-dashboard tracking/cancel.
- **Scheduled Delivery BYO**: open a follow-on milestone once the Same-Day BYO path is confirmed working in dev.
- **Method-enum unification**: the three overlapping shipping-method enums remain unified only at the *courier* level (registry), not the *method* level — follow-on tech debt.

---

## 10. Known Gaps (out of scope — do not test)

- `DRIVER_ASSIGNED` (rider name/phone/plate) is not captured.
- Share-link / cancel-job accept an optional `storeId` but no live caller passes it yet (Book-a-Rider tracking/cancel on own keys = follow-up).
- J&T / Laravel unauthenticated webhook holes = separate effort.
- US / non-PH market is hardcoded PH-only. Label couriers (USPS/UPS) are declared, not implemented.

---

## 11. Reference — How to read an order (`/home/customer-orders/view/<id>`)

Open `prosperna1` → **Orders** → click the order.

**Top blocks:**
- **Shipping → Shipping Type** — the method the customer chose (`Same Day` = Lalamove).
- **Shipping → Shipped By** — the courier label (`LALAMOVE`), from the webhook `courier` field, defaulting to `LALAMOVE`.
- **Delivery → Reference #** — Lalamove's order id. `N/A` until you **Book a Rider**; once set, it proves the booking landed on the account whose keys signed it (platform for Store B, own account for Store A).
- **Delivery → Vehicle Type / Delivery Status** — populate after booking; status advances as webhooks arrive.
- **Delivery → Tracking Link** — the *"See real-time location of rider here"* row. Appears only after Lalamove returns a share link (post-booking, via webhook). This is the FR-07 fix.

**Order Summary / Deductions block (bottom):**
- **Shipping Fee** — the customer-facing shipping amount: platform = quote + 3%; BYO AUTO = quote; BYO markup = quote × (1 + markup%) + add-on; BYO FLAT = the flat rate.
- **Additional Fee** — should be `₱0.00` for Lalamove; merchant shipping amounts moved OFF this line ONTO the Shipping line. A Lalamove add-on appearing here is a bug.
- **Customer Shipping Fee** — what the customer paid for shipping (mirrors Shipping Fee).
- **Merchant Shipping Fee** — the portion the merchant absorbs (`₱0.00` for a customer-pays platform store).
- **Actual Shipping Fee Paid** — the real Lalamove cost after booking (`₱0.00` until a rider is booked).
- **Shipping Fee Difference (+/-)** — Customer Shipping Fee minus Actual Shipping Fee Paid; meaningful only after booking.

**Quick verdicts:**
- Platform store (back-compat): `Shipping Fee ÷ 1.03` = a clean quote, `Additional Fee = 0`, `Merchant Shipping Fee = 0`.
- BYO AUTO: `Shipping Fee` = raw quote (no 3%).
- BYO markup / FLAT: `Shipping Fee` = the configured number; `Additional Fee` still `0`.

---

## 12. Sign-off

- [ ] Goal 1 — statuses/tracking reach order management for a BYO merchant (W1, W2).
- [ ] Goal 2 — BYO merchant controls the rate the customer sees (M8, C3).
- [ ] Goal 3 — BYO merchant billed directly by Lalamove (C2).
- [ ] No regression for platform merchants (C1, 6.4).
- [ ] Webhook flipped to `enforce` after real-callback confirmation (W4).

Tester: ____________________   Date: ____________________   Env: dev

---

## Summary

This BRD documents the delivered Bring-Your-Own Shipping Framework and its first vertical, BYO Lalamove, written so QA can verify it entirely from the Merchant Dashboard and the storefront checkout. A merchant connects their own Lalamove account in Shipping settings (green **"Connected"** state), registers a webhook URL and watches the **"Webhook active"** indicator flip, controls the customer-facing delivery rate per method (AUTO at cost, markup, or their own flat table — visible on the checkout **"Shipping Fee:"** line), and sees status updates and the tracking link flow back onto the order — while a merchant who does nothing keeps working exactly as before on the platform account. Along the way it closes a live webhook security hole, fixes two live order-write defects affecting every merchant, and establishes a courier provider abstraction so the next courier is "implement the interface" rather than a five-repo change.

Scope boundaries: Lalamove only, Same Day (`SAMEDAY_SCHED`) only, Philippines only, on-demand courier shape only, with Scheduled Delivery, other couriers, the J&T/Laravel webhook holes, and method-enum unification explicitly deferred. Remaining work is operator/deploy steps (enforcement flip, env vars, index-uniqueness deploy gate), not code.
