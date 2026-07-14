---
id: byo-shipping-lalamove
title: BRD. Bring-Your-Own Shipping — Lalamove
sidebar_label: BYO Shipping (Lalamove)
sidebar_position: 4
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-07-14
- Status: Implemented (pending deploy operator steps)

---

## Scope Note

This document is **cross-platform and QA-friendly**. It describes the delivered behavior of the Bring-Your-Own (BYO) Shipping Framework and its first courier vertical, **BYO Lalamove**, across the Merchant Dashboard (`prosperna1`), the Online Store checkout (`p1-customer`), and three backend services (`shipping-service-api`, `business-profile-api`, `orders-service-api`).

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
- A store that connects valid keys has its quotations and bookings signed with those keys and billed to its own Lalamove wallet (observable: a deliberately wrong secret makes Lalamove reject the call).
- A Lalamove webhook with a tampered or missing signature is rejected with HTTP 401 instead of being trusted.
- A BYO merchant can control the customer-facing Lalamove delivery rate per method (at cost, markup, or their own flat table) and the checkout Shipping line shows exactly that amount.
- A BYO merchant is shown the exact webhook URL to register and a "webhook verified" indicator flips once their first correctly-signed callback arrives.
- `jest` passes in every touched backend repo with new tests that fail before these changes and pass after.

---

## 2. Scope

### 2.1 In Scope

- **Provider abstraction + registry** (`shipping-service-api`): one `ICourierProvider` interface, a `CourierRegistry` single source of truth, Lalamove refactored behind it with no behavior change.
- **Lalamove webhook security fix**: re-enabled and generalized HMAC-SHA256 verification (platform *and* per-store secrets), non-throwing 401 on bad/missing signature, empty-body verify-ping preserved.
- **BYO Lalamove end-to-end**: merchant connect/disconnect UI and endpoints, encrypted per-store secret at rest, live key validation, internal key resolver, per-store key resolution threaded through quote/book/webhook.
- **Per-store wallet-balance flag**: the global insufficient-balance flag becomes per-store state driven by each merchant's own wallet webhook.
- **BYO webhook onboarding**: the Connect UI shows the exact webhook URL, Partner-Portal instructions, and a per-store "webhook verified" indicator.
- **Two live order-write fixes** (affect platform merchants today): tracking link now persists where the UI/SMS read it; courier label read from payload instead of hardcoded.
- **Merchant-controlled delivery rates for BYO stores** (Lalamove Same-Day / `SAMEDAY_SCHED`): `AUTO` (at cost, no 3%), `AUTO_WITH_ADDITIONAL` (quote + flat add-on and/or percentage markup), `FLAT` (merchant's own rate table replaces the quote).
- **Connection uniqueness**: a Lalamove public key can be connected to at most one store platform-wide (app-level conflict check + partial unique index backstop).

### 2.2 Out of Scope

- Other couriers (J&T BYO, DoorDash, USPS, UPS). The interface supports them; only Lalamove is implemented and tested.
- The label/manifest courier shape (declared on the interface, unimplemented — no label courier in scope to test).
- The J&T `shipping-service-api` webhook and the Laravel `jt-shipping-api` unauthenticated endpoints — real and exploitable, but tracked for a separate BYO J&T effort.
- Non-Philippines markets (`Market: 'PH'` stays hardcoded).
- Unifying the three overlapping shipping-**method** enums (registry unifies *couriers*, not *methods*).
- **Scheduled Delivery** (`CUSTOM_DELIVERY_DATE`): still quoted/booked/billed on the *platform* Lalamove account even for a BYO merchant, and gets none of the rate modes. Known gap, deferred to a follow-on milestone.
- `DRIVER_ASSIGNED` webhook handling (rider name/phone/plate) — deferred.

### 2.3 Dependencies or Constraints

- **Lalamove Partner Portal is manual**: Lalamove has no webhook-registration API. Each BYO merchant must paste the webhook URL into their own Partner Portal by hand; the platform cannot automate it.
- **Encryption**: the merchant secret is encrypted at rest with the existing AES-256-GCM `encrypt`/`decrypt` helpers (`business-profile-api`, env `ENCRYPTION_KEY`). A missing key fails connect loudly rather than storing plaintext.
- **Internal service auth**: cross-service calls reuse the `p1_internal_api_key` header and the existing `API_URL_COM` api-aggregator host — no new URL secrets. Plaintext keys travel only over the internal network.
- **Webhook enforcement flag**: `LALAMOVE_WEBHOOK_VERIFY_MODE` ships defaulting to `observe` (recompute + log match, still accept). An operator must capture one real webhook, confirm the `matched:true` log and that `LALAMOVE_WEBHOOK_PATH` matches the Partner-Portal-registered path, then set `enforce` to activate the 401.
- **Env vars required before deploy**: `API_URL_COM`, `ENCRYPTION_KEY` (bpa), `P1_INTERNAL_API_KEY` (both services, matching), `LALAMOVE_WEBHOOK_PATH`, `LALAMOVE_PUB_KEY`/`LALAMOVE_SECRET_KEY`/`LALAMOVE_BASE_API_URL`.
- **Deploy call cycle**: `business-profile-api → shipping-service-api` (validate at connect) and `shipping-service-api → business-profile-api` (resolve at quote/book/webhook); mind ordering.
- **Milestone 7 index build is a hard deploy gate**: `autoIndex` build failures are only logged. Before deploy, dedupe any existing live `lalamoveConnection.pubKey` collisions and verify `db.stores.getIndexes()` shows the partial unique index.

---

## 3. Functional Requirements

### FR-01: Connect a Lalamove Account (Merchant Dashboard)

**Description:**

A merchant must be able to connect their own Lalamove account from Shipping settings by entering their API (public) key and secret key. The platform must validate the keys with a live Lalamove call before persisting anything, and must never store or display the plaintext secret.

**Preconditions:**

- The user is an authenticated merchant with a store (JWT claim `custom:storeId`).
- The store is in the Philippines (BYO Lalamove is PH-only).

**Main Flow:**

1. Merchant opens the "Connect your own Lalamove" section in Shipping settings.
2. Merchant enters `pubKey` and `secretKey` and clicks **Connect**.
3. The system runs a global uniqueness check for the `pubKey` (see FR-09) before any external call.
4. The system asks `shipping-service-api` to make a live Lalamove test call with the entered keys.
5. On success, the system encrypts the secret (AES-256-GCM) and persists a `lalamoveConnection` on the store with `status: CONNECTED`, `enabled: true`, `connectedAt`, `pubKey`, and `secretKeyEnc`.
6. The UI shows the "Connected" state and reveals the webhook onboarding section (FR-06).

**Expected UI Behavior or Rules:**

- The target store is always derived from the JWT claim, never from a request body value (IDOR protection).
- On validation failure the connection must **not** be persisted; a clear error is shown.
- The stored secret is never returned to the client or logged; the secret ciphertext is stripped from `toJSON`.
- Error, loading (validating), connected, and disconnected states must all be visible.

### FR-02: Disconnect a Lalamove Account

**Description:**

A merchant must be able to disconnect their Lalamove account, reverting the store to the platform-managed path.

**Main Flow:**

1. Merchant clicks **Disconnect** in the connected state.
2. The system clears the connection (`pubKey: ''`, `secretKeyEnc: ''`, `status: DISCONNECTED`, `enabled: false`).
3. The dashboard cache for the Lalamove config is invalidated so stale `webhook_verified` state cannot persist.

**Expected UI Behavior or Rules:**

- After disconnect, the store immediately resolves to platform keys for quote/book/webhook.
- Disconnect is reversible by reconnecting; re-connecting the same key to the same store succeeds (secret rotation / idempotent reconnect).

### FR-03: Resolve Keys per Store (Quote / Book)

**Description:**

Every Lalamove quotation and booking must be signed with the connected store's keys when the store has an enabled connection, and must fall back to platform keys otherwise.

**Preconditions:**

- A `storeId` is threaded from the caller (checkout quote, booking, and shipping-fee computation).

**Main Flow:**

1. A quote/book request arrives carrying an optional `storeId`.
2. The resolver looks up the store's connection; if enabled, it fetches the decrypted keys over the internal network.
3. The Lalamove call is signed with the resolved keys (`source: STORE`) or platform keys (`source: PLATFORM`).

**Expected UI Behavior or Rules:**

- All three quote/book call sites (checkout quote, booking, shipping-fee computation) must resolve the **same** store, or a BYO merchant would be quoted on platform rates and booked on their own account (silent mismatch).
- Absent `storeId` ⇒ platform path (backward compatible).
- The internal resolver call has a short timeout (3s); a hung `business-profile-api` falls back to platform keys rather than stalling checkout.

### FR-04: Verify Lalamove Webhook Signatures (Security Fix)

**Description:**

The Lalamove webhook must verify the HMAC-SHA256 signature using the correct secret (platform or per-store, routed by the `apiKey` in the body) and reject tampered or missing-signature callbacks.

**Main Flow:**

1. A webhook arrives with `apiKey`, `signature`, `timestamp`, and `data`.
2. The middleware routes by `apiKey`: platform public key ⇒ platform secret; otherwise look up the store whose connection `pubKey` matches and use its secret.
3. The signature is recomputed over the **raw request bytes** (to survive the `JSON.stringify` round-trip trap) and compared.

**Expected UI Behavior or Rules:**

- A bad or missing signature returns a first-class, **non-throwing** HTTP 401 (not a swallowed 200).
- A missing required field or an unknown `apiKey` returns 401 in **both** `observe` and `enforce` modes (only a genuine signature *mismatch* is downgraded to log-and-pass under `observe`).
- An empty body (Lalamove's dashboard verify-ping) returns HTTP 200.
- A genuinely unexpected internal error returns 200 (so Lalamove does not disable the URL after repeated non-200s) but must `logger.error` first.
- The signed `path` is env-configurable (`LALAMOVE_WEBHOOK_PATH`) to match the Partner-Portal-registered path as it arrives via api-aggregator.

### FR-05: Per-Store Wallet-Balance Flag

**Description:**

Each store's insufficient-balance flag must reflect its own Lalamove wallet, replacing the single global flag.

**Main Flow:**

1. A `WALLET_BALANCE_CHANGED` webhook arrives keyed by the account's public key.
2. The flag is upserted in a per-account `lalamove_wallet` record keyed by public key.
3. `GET /v1/shipping/lalamove/config?storeId=` resolves the store's effective public key (platform fallback) and returns its flag.

**Expected UI Behavior or Rules:**

- A wallet event for store A must not affect store B.
- Low/empty-balance emails fire for the **platform** account only; BYO merchants top up on Lalamove's side.
- Unconnected stores continue to read the platform flag.

### FR-06: BYO Webhook Onboarding and Verification Indicator

**Description:**

Because Lalamove has no webhook-registration API, the Connect UI must show the merchant the exact webhook URL to register in their Partner Portal and prove to them that callbacks are flowing.

**Preconditions:**

- The store has a `CONNECTED` Lalamove connection.

**Main Flow:**

1. The connected state renders the `webhook_url` (built server-side as `API_URL_COM` + `LALAMOVE_WEBHOOK_PATH`) in a read-only input with a **Copy** button.
2. Numbered Partner-Portal instructions are shown (Log in → Developers → Webhook → paste URL → Save).
3. A status line shows "Webhook verified ✓" with the last-received time when verified, else "Waiting for first callback from your Lalamove account…" with a **Check again** action.

**Expected UI Behavior or Rules:**

- `webhook_verified` is true only when a genuinely signature-**matched** callback for the store's effective public key has been received (never on an observe-mode pass-through of a mismatch).
- Connecting is never blocked on webhook setup (booking works without callbacks); the indicator is informational but prominent.
- The verification flag write is awaited but wrapped so a flag-write failure never 401s or delays the webhook.

### FR-07: Order-Write Fixes (Tracking Link + Courier Label)

**Description:**

The webhook order-update path must persist the delivery tracking link where the order-view UI and customer SMS actually read it, and must label the courier from the payload rather than hardcoding Lalamove.

**Main Flow:**

1. An `ORDER_STATUS_CHANGED` webhook carries a tracking link and `courier`.
2. The tracking link is written to `delivery_information.meta_data.shareLink` (only when a non-empty link is present).
3. `shipping_information.shipped_by` is read from `payload.courier`, defaulting to `LALAMOVE`.

**Expected UI Behavior or Rules:**

- A status-only webhook (no link) must not blank an existing tracking link.
- The default preserves today's behavior for every existing caller.
- This fixes a live defect affecting platform merchants today (the old write to the undeclared `share_link` was silently dropped by Mongoose strict mode).

### FR-08: Merchant-Controlled Delivery Rates (BYO, Same-Day)

**Description:**

A BYO-connected store must be able to control the customer-facing Lalamove Same-Day (`SAMEDAY_SCHED`) delivery rate per method: pass the quote through at cost, add a markup, or replace it with their own flat/tiered rate table. Platform-account stores keep today's behavior (quote + 3%, no FLAT).

**Preconditions:**

- The store has an enabled `CONNECTED` `lalamoveConnection`.
- The method is `SAMEDAY_SCHED` (the only type the Lalamove computation branch reads).

**Main Flow:**

1. The computation reads `keySource` from the quotation response.
2. If `keySource !== STORE`: fee = quote + 3% (FLAT/markup ignored even if set).
3. If `keySource === STORE`:
   - `AUTO` ⇒ quote verbatim, no 3%.
   - `AUTO_WITH_ADDITIONAL` ⇒ quote × (1 + `markup_percent`/100) + the province-matched flat add-on, no 3%.
   - `FLAT` ⇒ the merchant's rate-table fee replaces the quote total, no 3%.
4. The customer's checkout Shipping line shows exactly that amount.

**Expected UI Behavior or Rules:**

- **Invariant**: the Lalamove quotation is always still fetched (even in FLAT), because booking needs its `quotationId`, stop ids, and vehicle type; only the customer-facing fee changes.
- The `AUTO_WITH_ADDITIONAL` add-on must be the `base_rate` of the rate-table entry matching the **customer's province**; on no match, fall back to the first entry (mirroring FLAT). It must not use "first entry regardless of province" (the prior bug).
- The merchant-configured amount lands on the **Shipping** line (`shipping_computations.shipping_fee`), not the Additional Fee bucket. This closes a half-built path and is a deliberate change affecting every store using merchant-configured amounts (see Business Rules for tax and free-shipping consequences).
- The rates UI shows FLAT and a "Markup %" input (0–100) only when the method is `SAMEDAY_SCHED` **and** the store is connected; the backend save-gate enforces the same (400 otherwise). `AUTO_WITH_ADDITIONAL` is relabeled "Courier Quote + Your Add-ons" for the connected case.
- Server-side must ignore FLAT/markup for platform-signed quotes even if somehow set (defense in depth matching the UI gate).

### FR-09: Enforce One Store per Lalamove Account (Connection Uniqueness)

**Description:**

A Lalamove public key must be connectable to at most one store across the whole platform. This prevents ambiguous webhook/wallet routing, since a Lalamove webhook carries only the `pubKey` with no store/owner context.

**Main Flow:**

1. At connect, immediately after loading the caller's store and before the live validate-keys call, the system looks up any *other* store already holding this `pubKey`.
2. If found, the connect is rejected with HTTP 400 and neither validates nor persists.
3. A partial unique index on `lalamoveConnection.pubKey` (filtered to non-empty strings) backstops the race at the database layer.

**Expected UI Behavior or Rules:**

- Same-owner conflict: the error names the conflicting store — `This Lalamove account is already connected to your store "<name>". Disconnect it there first.`
- Different-owner (or ownership uncertain) conflict: the error stays generic — `This Lalamove account is already connected to another store.` (never leak who owns it).
- Re-connecting the same key to the same store still succeeds (exclude-self lookup) so secret rotation works.
- Ownership comparison uses a presence-checked `.equals()` (never `===` on ObjectIds, never `.equals()` on a possibly-absent `storeOwner`).
- The concurrent-connect loser (E11000) sees the friendly generic 400, not an opaque failure.
- No frontend change required — the connect toast already surfaces `data.errors`.

---

## 4. Acceptance Criteria

- A store with no `lalamoveConnection` quotes and books exactly as before, signed with platform keys (resolver returns platform keys when `storeId` is omitted).
- A store that connects valid keys shows "Connected"; a subsequent quotation is signed with its keys (`resolveLalamoveForStore` returns store keys, `source: STORE`); a deliberately wrong secret makes Lalamove reject the live call.
- A correctly-signed webhook passes and updates order status; a wrong/missing signature returns 401; an empty body returns 200; a verification failure is logged.
- A webhook whose `apiKey` equals a connected store's `pubKey` with a valid signature passes and updates *that store's* order; a mismatch 401s.
- A `WALLET_BALANCE_CHANGED` webhook for store A sets only store A's flag; `config?storeId=B` is unaffected; unconnected stores read the platform flag.
- `config?storeId=<BYO store>` returns the full `webhook_url` and `webhook_verified: false` before any callback; after one correctly-signed webhook it returns `webhook_verified: true` with a timestamp; an observe-mode mismatch does not flip it.
- An `ORDER_STATUS_CHANGED` update persists the tracking link at `delivery_information.meta_data.shareLink` on a strict-mode Mongoose document; a status-only payload does not blank it; `shipped_by` comes from the payload `courier` (default `LALAMOVE`).
- With the quotation stubbed at ₱300: platform-signed ⇒ quote + 3%; BYO `AUTO` ⇒ ₱300; BYO `AUTO_WITH_ADDITIONAL` (`markup_percent: 20`, customer-province `base_rate: 50`) ⇒ ₱410 on the Shipping line with nothing in `additional_fee` (rate table ordered so a different province is first, plus a no-match first-entry fallback case); BYO `FLAT` (₱75 matching tier) ⇒ ₱75 while `quotationId`/stop ids still flow from the quote.
- Saving `FLAT` under `SAMEDAY_SCHED` succeeds only for a connected store (400 otherwise); `OWN_BOOKING_MERCHANT` validation unchanged. The quote response exposes `keySource`.
- Connecting a `pubKey` already on a *different* store ⇒ 400 and no persistence, with the validate-keys call **not** made; same-owner conflict names the store; self-reconnect succeeds; the partial unique index rejects a second live duplicate (E11000) while multiple disconnected stores (`pubKey: ''`) coexist.
- `jest` green and `tsc -p . --noEmit` clean in `shipping-service-api`, `business-profile-api`, and `orders-service-api`; touched `prosperna1` files eslint-clean.

---

## 5. QA Test Scenarios

### Happy Path

- Merchant connects valid keys → "Connected" → registers webhook URL in Partner Portal → first callback flips the indicator to "Webhook verified ✓".
- Unconnected merchant checks out → quote + 3% on the Shipping line, booked and billed on the platform wallet (unchanged).
- BYO merchant sets `AUTO` → customer sees the exact Lalamove quote at cost, no 3%; order is booked and billed on the merchant's own wallet.
- BYO merchant sets `FLAT ₱75` → customer sees ₱75; booking still uses the live quote's `quotationId` and stops.

### Negative Path

- Connect with an invalid secret → live validation fails → no connection persisted → clear error shown.
- Webhook with a tampered signature (enforce mode) → HTTP 401, order status not updated.
- Webhook with an unknown `apiKey` or a missing field (either mode) → HTTP 401, no wallet-flag pollution.
- Connect a `pubKey` already used by a different store → HTTP 400, validate-keys not called, nothing persisted.

### Edge Cases

- Internal resolver hung → 3s timeout trips → checkout quote falls back to platform keys instead of stalling.
- Status-only webhook (no link) → existing tracking link preserved, not blanked.
- `AUTO_WITH_ADDITIONAL` with the customer's province absent from the rate table → first-entry `base_rate` applied (matches FLAT fallback).
- Free-shipping coupon on a merchant-configured amount → amount now waived along with the courier fee (accepted behavior change).
- Two stores of the same owner both try to connect the same key → second is rejected and named; if concurrent, the DB-layer E11000 loser gets the generic 400.
- Self-reconnect / secret rotation → succeeds (exclude-self lookup).
- Owner-less store in a conflict → generic message, never names a store, never throws.

---

## 6. BDD (Gherkin)

```gherkin
Feature: BYO Lalamove connection and key usage

Scenario: Connect a valid Lalamove account
  Given I am an authenticated merchant with a Philippine store and no Lalamove connection
  When I enter valid API and secret keys and click Connect
  Then the platform makes a live Lalamove test call that succeeds
  And my secret is stored encrypted and never returned to the client
  And my store shows "Connected" with the webhook onboarding section

Scenario: Quotation uses the connected store's keys
  Given my store has an enabled Lalamove connection
  When a checkout quotation is requested with my storeId
  Then the Lalamove call is signed with my keys and keySource is STORE
  And the delivery is billed to my Lalamove wallet

Scenario: Unconnected store is unchanged
  Given a store with no Lalamove connection
  When a quotation is requested without a resolvable connection
  Then the call is signed with the platform keys and keySource is PLATFORM
  And the customer fee is the quote plus 3%
```

```gherkin
Feature: Lalamove webhook verification

Scenario: Reject a tampered webhook
  Given webhook enforcement is set to enforce
  When a webhook arrives with a signature that does not match the routed secret
  Then the request is rejected with HTTP 401
  And the order status is not updated

Scenario: Accept the dashboard verify ping
  Given Lalamove sends an empty-body verification ping
  When the middleware processes it
  Then it returns HTTP 200

Scenario: Unknown apiKey is rejected in observe mode
  Given webhook enforcement is set to observe
  When a webhook arrives with an apiKey that matches neither the platform key nor any connected store
  Then the request is rejected with HTTP 401
  And no wallet record is created for that apiKey
```

```gherkin
Feature: Merchant-controlled BYO delivery rates

Scenario: BYO markup on the Shipping line
  Given my store is connected and the method is SAMEDAY_SCHED
  And I set AUTO_WITH_ADDITIONAL with markup_percent 20 and a customer-province base_rate of 50
  And the live Lalamove quote is 300
  When the customer fee is computed
  Then the Shipping line shows 410
  And the Additional Fee bucket does not contain the 50
  And the booking still uses the live quote's quotationId and stops
```

```gherkin
Feature: Connection uniqueness

Scenario: Reject a key already used by another store
  Given store A already holds Lalamove public key K
  And I own a different store B
  When I attempt to connect key K to store B
  Then I receive HTTP 400 before any live key validation runs
  And no connection is persisted
  And the message names store A only if we share the same owner
```

---

## 7. Business Rules

- **Coexistence / opt-in**: BYO is purely additive. A store with no connection uses the platform account exactly as before. No migration is forced.
- **Billing reality drives the fee**: the 3% platform fee exists to protect the platform wallet float; it is waived for BYO-signed quotes (the merchant is billed directly by Lalamove) and kept for platform-signed quotes. The gate is `keySource`, which reports which keys *actually signed* the quote, so the fee can never drift from billing reality.
- **Rate freedom is BYO-only**: FLAT/markup are gated to BYO-connected stores. A platform-account merchant undercharging would make the platform wallet eat the difference; a BYO merchant undercharging spends their own wallet — their business decision.
- **Fee placement — accepted consequences** (Step 6.4, affects BYO and non-BYO stores using merchant-configured amounts): the amount moves from the Additional Fee line to the Shipping line. Pre-tax total is identical. **With-tax total** can change for a store whose shipping-method and additional-fee tax overrides differ (the amount is now taxed at the shipping-method rate). A **free-shipping discount** now waives these amounts along with the courier fee (previously they survived in `additional_fee`). Both are the semantically correct behavior, are explicitly tested, and must be called out at deploy.
- **Quotation always fetched**: even in FLAT mode the live Lalamove quote is fetched because booking needs its `quotationId`/stops; only the customer-facing fee changes.
- **Secret handling**: the secret is stored only as AES-256-GCM ciphertext, decrypted only over the internal network at resolve time, and never logged or returned.
- **Uniqueness is global, not per-owner**: a Lalamove webhook carries only the `pubKey`, so any duplicate — even between two stores of the same owner — makes account-level routing ambiguous. A merchant reusing one Lalamove account across stores must disconnect it on the other store first (it is genuinely one wallet).
- **Webhook health "verified" is trustworthy**: it flips only on a genuine signature match, never on an observe-mode pass-through.
- **Scope key**: everything keys on `SAMEDAY_SCHED`. Scheduled Delivery (`CUSTOM_DELIVERY_DATE`) stays on the platform account under BYO — a known, deferred gap.

---

## 8. Open Questions

- **Webhook enforcement flip**: `LALAMOVE_WEBHOOK_VERIFY_MODE` ships as `observe`. Operator must capture one real webhook, confirm `matched:true` and the `LALAMOVE_WEBHOOK_PATH`, then set `enforce`. Until flipped, the hole is *observable* (mismatches logged) but not yet *blocked*.
- **Wallet-flag migration window**: the new `lalamove_wallet` collection starts empty, so `config` reports `insufficient_balance: false` until each account's next `WALLET_BALANCE_CHANGED` webhook. Seed the platform row at deploy or accept the window.
- **Book-a-Rider tracking/cancel for BYO**: the `share-link` and `cancel-job` endpoints now accept an optional `storeId`, but no caller passes it yet. Wiring it from a Book-a-Rider caller is a follow-up before BYO merchants rely on in-dashboard tracking/cancel.
- **Scheduled Delivery BYO**: open a follow-on milestone once the Same-Day BYO path is confirmed working in dev.
- **Method-enum unification**: the three overlapping shipping-method enums remain unified only at the *courier* level (registry), not the *method* level — follow-on tech debt.

---

## 9. Summary

This BRD documents the delivered Bring-Your-Own Shipping Framework and its first vertical, BYO Lalamove. A merchant can now connect their own Lalamove account and have every quotation and booking signed with their keys and billed to their own wallet, control the customer-facing delivery rate (at cost, markup, or their own flat table), and be guided through registering the webhook URL with a real "verified" indicator — while a merchant who does nothing keeps working exactly as before on the platform account. Along the way it closes a live webhook security hole (real HMAC verification, per-store and platform secrets, 401 on tamper), fixes two live order-write defects affecting every merchant, and establishes a courier provider abstraction and per-store credential path so the next courier is "implement the interface" rather than a five-repo change.

The main scope boundaries: Lalamove only, Same-Day (`SAMEDAY_SCHED`) only, Philippines only, on-demand courier shape only, with Scheduled Delivery, other couriers, the J&T/Laravel webhook holes, and method-enum unification explicitly deferred. Implementation spans five repositories on `feat/byo-shipping-lalamove`; remaining work is operator/deploy steps (enforcement flip, env vars, index-uniqueness deploy gate), not code.
