---
id: st-13-storefront-updates
title: BRD. ST-13 Storefront Updates
sidebar_label: ST-13 Storefront Updates
sidebar_position: 13
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Background and Problem

Prosperna is undergoing a pricing restructuring that introduces new subscription tiers (TRIAL, LAUNCH, GROW, SCALE), removes the convenience fee model, and enforces account suspension for non-paying merchants. The customer-facing Online Store Website (`p1-customer`) is not yet aligned with these changes, resulting in three specific gaps:

1. **No storefront suspension state exists.** When a merchant's subscription lapses, expires, or is cancelled, the storefront currently has no mechanism to communicate this to visiting customers. The existing Temporary Close feature is voluntary and merchant-initiated — it is not a substitute for system-driven suspension.

2. **Convenience fees are still displayed at checkout.** The checkout order summary shows a "Convenience Fee" line item to customers. As part of the pricing restructuring, convenience fees are being eliminated entirely. The backend removal (ST-02) must be paired with a frontend display removal.

3. **The new TRIAL plan type is not handled in homepage logic.** The storefront homepage uses plan-based logic to decide whether to render a custom page builder homepage or the default product listing. The new `TRIAL` plan type is not present in this logic, which means trial merchant stores would fall through to an incorrect rendering path.

---

## Goals

1. Protect Prosperna's platform reputation by displaying a clear, professional suspension notice to customers visiting a suspended merchant's storefront, rather than showing a broken or misleading live store.
2. Eliminate the convenience fee line item from the customer-facing checkout summary, consistent with the pricing restructuring removing this fee model.
3. Ensure that merchants on the new 14-day TRIAL plan have a fully functional storefront experience identical to Scale-tier stores, including custom homepage rendering via Page Builder.
4. Preserve search engine equity for suspended stores using correct HTTP status codes and SEO directives, so merchants can recover their rankings upon reactivation.
5. Maintain a clean separation between voluntary Temporary Close (merchant-initiated) and system-driven Suspension — two distinct states with distinct components and triggers.

---

## Non-Goals

1. Merchant dashboard lock screen for suspended accounts — covered by ST-04 and ST-11.
2. Backend computation removal of convenience fees — covered by ST-02.
3. Backend suspension logic (`suspendMerchant()`, `reactivateMerchant()`) — covered by ST-04.
4. Trial expiry processing, cancellation processing, or payment failure handling — covered by ST-03, ST-05, ST-01 respectively.
5. Admin Control Platform changes — covered by ST-12.
6. Any changes to the Temporary Close feature (`isTemporaryCloseEnabled`, `StoreClosedModal`) — this feature remains unchanged.
7. Analytics instrumentation on the Suspension Page (deferred).
8. Per-merchant feature flags or phased rollout toggles — all changes deploy simultaneously with the rest of the pricing restructuring subtasks.

---

## Stakeholders

| Role | Party | Interest |
|---|---|---|
| Product Owner | Prosperna Product Team | Ensures the storefront correctly reflects the new pricing model and subscription states |
| Engineering | Frontend Team (`p1-customer`) | Implements all three storefront changes |
| Engineering | Backend Team (`orders-service-api`, `api-aggregator`) | Provides `isSuspended` flag via store data response; removes convenience fee from backend computation (ST-02) |
| QA | QA Team | Validates suspension page, checkout display, and homepage logic across plan types |
| Merchants | All Prosperna merchants | Indirectly affected — their customers see the suspension page when applicable; trial merchants benefit from full store functionality |
| Customers | End-users of merchant storefronts | Directly see the suspension page, no longer see the convenience fee, and experience no degradation on trial stores |

---

## Personas

### Persona 1: Visiting Customer (Primary)
A shopper visiting a Prosperna-powered merchant storefront. They may encounter a suspended store, proceed through checkout (where convenience fees should no longer appear), or shop on a trial merchant's store.

### Persona 2: Merchant (Indirect)
The store owner whose subscription state determines what customers see. A suspended merchant's customers see the Suspension Page. A trial merchant's customers see a fully functional Scale-tier storefront.

### Persona 3: Search Engine Crawler (System Actor)
Automated bots visiting suspended stores. Must receive HTTP 503 and `noindex` directives to preserve the merchant's SEO equity until reactivation.

---

## Business Value

| Value | Description |
|---|---|
| **Brand protection** | Suspended storefronts currently appear as normal but limited stores, creating confusion and reputational risk. A clear suspension page sets appropriate expectations and protects Prosperna's platform quality. |
| **Revenue recovery** | The suspension page directs merchants (as the store owner audience) to resolve their billing, accelerating reactivation and subscription revenue recovery. |
| **Customer trust** | Removing the convenience fee line from checkout removes a friction point and a source of customer confusion, consistent with the platform's new transparent pricing. |
| **Trial conversion** | Trial merchants with a fully functional storefront (including custom homepage) can demonstrate a polished store to their customers, increasing the likelihood of converting to a paid plan. |
| **SEO equity preservation** | Using HTTP 503 + `noindex` on suspension protects the merchant's search rankings, reducing churn risk for merchants who return after suspension. |

---

## Scope

### In Scope

- **Suspension Page component** (`SuspensionPage`) — new full-page component rendered for all storefront routes when `store.isSuspended === true`
- **Storefront rendering priority update** — inserting the `isSuspended` check at the earliest point in the storefront's data-fetching/rendering pipeline, before any route-specific or plan-specific logic
- **HTTP 503 response** for all routes on suspended stores
- **SEO directives** on the Suspension Page: `noindex, nofollow` meta tag and dynamic `robots.txt` that disables crawling (`Disallow: /`) when suspended
- **Convenience fee display removal** from `Summary.tsx` (checkout order summary) and `SingleCheckoutMain.tsx` (state tracking)
- **Homepage plan logic update** — adding `TRIAL` to the set of plan types that allow custom homepage rendering; replacing legacy plan references (`PLUS`, `PRO`, `PREMIUM`, `PREMIUM_TRIAL`) with new plan types (`TRIAL`, `LAUNCH`, `GROW`, `SCALE`)
- **Frontend-level suspension guard at checkout** — if the storefront receives an error from the backend indicating the store is suspended during an active checkout session, the frontend redirects to the Suspension Page rather than displaying a generic error

### Out of Scope

- Backend changes to the store data API (ST-04 owns `isSuspended` field addition)
- Backend convenience fee removal (ST-02 owns this)
- Merchant dashboard changes (ST-04, ST-11)
- Admin platform changes (ST-12)
- New plan tier definitions and business rules (ST-01, ST-03)

---

## Assumptions

1. The store data response already returned by the existing store metadata API (via `api-aggregator`) will include the `isSuspended` field after ST-04 is deployed. No new API endpoint is required in `p1-customer`.
2. All pricing restructuring subtasks (ST-01 through ST-16 as applicable) are deployed simultaneously. There is no phased or feature-flagged rollout for ST-13.
3. The backend (`orders-service-api`) will return zero for convenience fees after ST-02 deploys. ST-13's removal of the frontend line item is still required regardless, as the UI must not show the line even at ₱0.00.
4. The `TRIAL` plan type string value used in the backend is `'TRIAL'` (exact casing matches what `p1-customer` receives in the store data response).
5. New plan type strings are: `TRIAL`, `LAUNCH`, `GROW`, `SCALE`. Legacy plan strings (`PLUS`, `PRO`, `PREMIUM`, `PREMIUM_TRIAL`) are deprecated and will not appear on active accounts post-migration.
6. Merchant contact information (`email`, `phone`) is available on the store data object returned to `p1-customer`. No additional API call is needed to fetch it for the Suspension Page.
7. The existing dynamic robots.txt handler in `p1-customer` can be updated to conditionally serve `Disallow: /` based on `store.isSuspended`. If no such handler exists, one will be created.

---

## Dependencies

| Dependency | Subtask | What ST-13 Requires |
|---|---|---|
| Suspended Account State | ST-04 | `isSuspended: Boolean` field on the Store model; `suspendMerchant()` and `reactivateMerchant()` functions that set and clear this flag |
| Convenience Fee Removal (Backend) | ST-02 | Backend computation returns 0 for convenience fees; ST-13 removes the frontend display regardless, but both should deploy together or ST-02 first |
| 14-Day Trial System | ST-03 | Defines the `TRIAL` plan type; ST-13 must render trial stores identically to Scale-tier stores |
| Subscription Billing Restructuring | ST-01 | Defines the new plan types (`LAUNCH`, `GROW`, `SCALE`) that replace legacy plan references in homepage logic |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `isSuspended` field not yet available in store data response when ST-13 deploys | Medium | High — Suspension Page never renders | Coordinate deployment order: ST-04 backend deploys before or simultaneously with ST-13; verify field presence in staging before release |
| Suspension check inserted at wrong level — some routes bypass it | Medium | High — Suspended stores partially accessible | Implement check in the earliest universal point (middleware or root layout server component); write integration tests covering multiple route types |
| SEO damage if 503 is implemented incorrectly (e.g., 404 used instead) | Low | High — Permanent de-indexing of merchant store | Strict implementation review; test with HTTP response header inspection tool before release |
| Historical convenience fee amounts in order detail pages incorrectly hidden | Low | Medium — Customer dispute risk | Implement conditional display: show line only if fee > 0; this naturally preserves historical records and hides new zero-fee orders |
| Trial plan string mismatch between backend and frontend | Low | Medium — Trial stores render like FREE stores | Confirm exact plan type string values with ST-01/ST-03 implementing teams before ST-13 code is merged |

---

## Compliance and Privacy Notes

- The Suspension Page displays the merchant's registered email and phone number. This is appropriate — these are business contact details the merchant has provided for customer-facing use.
- No personally identifiable information (PII) of customers is collected, stored, or exposed by any of the three changes.
- HTTP 503 and `noindex` directives are standard web practices; no regulatory concerns.
- Convenience fee removal reduces checkout data complexity; no new data collection or processing is introduced.

---

## Success Metrics

| Metric | Target | How Measured |
|---|---|---|
| Suspended stores correctly show Suspension Page | 100% of suspended store routes | Manual QA + automated route tests |
| All suspended store routes return HTTP 503 | 100% | HTTP response inspection tests |
| Convenience fee line not shown in checkout for new orders | 0 occurrences | UI regression tests on checkout summary |
| Trial merchant storefronts render custom homepage (if configured) | 100% | QA test with TRIAL plan merchant account |
| Historical orders with convenience fee still display original amount | Preserved | QA test on pre-migration order detail pages |
| Reactivated stores restore full storefront on next request | Immediate | QA test: suspend → reactivate → verify store loads normally |
