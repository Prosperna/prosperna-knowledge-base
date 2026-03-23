---
id: st-13-storefront-updates
title: PRD. ST-13 Storefront Updates
sidebar_label: ST-13 Storefront Updates
sidebar_position: 13
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-23
- Status: Draft

---

## Summary

ST-13 delivers three targeted changes to the Prosperna customer-facing Online Store Website (`p1-customer`) as part of the pricing restructuring initiative:

1. **Suspension Page** — A new full-page component (`SuspensionPage`) that replaces the entire storefront for all routes when a merchant's account is suspended (`store.isSuspended === true`). Returns HTTP 503, applies `noindex` meta, and dynamically disallows crawling in `robots.txt`.
2. **Convenience Fee Removal** — The "Convenience Fee" line item is removed from the checkout order summary. The line is not shown even at ₱0.00. Historical orders continue to display the original convenience fee if it was greater than zero.
3. **Trial Merchant Homepage Logic** — The homepage plan-based rendering logic is updated to include the new `TRIAL` plan type, allowing trial merchants to render a custom Page Builder homepage identically to Scale-tier merchants.

All three changes deploy simultaneously with the rest of the pricing restructuring subtasks. No feature flags are used.

---

## User Journey

### Happy Path — Change 1: Suspension Page

**Scenario:** A customer visits any page on a merchant's suspended storefront.

1. Customer navigates to a merchant's store URL (any route — homepage, product, cart, checkout, etc.)
2. The storefront's early rendering pipeline reads the store's metadata from the API response
3. `store.isSuspended === true` is detected before any page content is rendered
4. The `SuspensionPage` component is rendered for the entire page — no navigation, no store content, no theme
5. The HTTP response status is set to `503 Service Unavailable`
6. The page `<head>` includes `<meta name="robots" content="noindex, nofollow">`
7. The `robots.txt` endpoint returns `User-agent: *\nDisallow: /`
8. The customer sees: warning icon, suspension heading, informational body text, merchant contact info (if available), and "Powered by Prosperna" footer

### Happy Path — Change 2: Convenience Fee Removal

**Scenario:** A customer completes a checkout on any active store.

1. Customer adds items to cart and proceeds to checkout
2. Customer fills in billing, shipping, and payment details
3. The checkout order summary panel renders:
   - Sub Total
   - Shipping Fee
   - Additional Fee (if applicable)
   - Tax (if applicable)
   - Total
4. No "Convenience Fee" line item appears — not even at ₱0.00

### Happy Path — Change 3: Trial Merchant Homepage

**Scenario:** A customer visits the homepage of a store owned by a merchant on the `TRIAL` plan who has configured a custom Page Builder homepage.

1. Customer navigates to the merchant's store homepage (`/`)
2. Storefront reads `store.payPlanType === 'TRIAL'`
3. Homepage logic evaluates: plan type is not `FREE`, store has a custom homepage configured
4. Custom Page Builder homepage is rendered
5. Customer sees the merchant's designed homepage — indistinguishable from a Scale-tier store

---

### Alternate and Failure Paths

#### Suspension Page — Alternate Paths

**Customer is mid-browse when store gets suspended:**
- On the customer's next navigation or page load (SSR re-render), `isSuspended` is detected
- Suspension Page renders for the newly requested route
- Already-loaded/cached pages may still show until the next server-side re-render

**Customer is mid-checkout when store gets suspended:**
- If the customer submits an order while the store is suspended, the backend (`orders-service-api`) rejects the request with an error
- The frontend detects this error as a store-suspended condition and redirects to the Suspension Page
- No partial order is created
- This is in-scope frontend behavior for ST-13 (handling the error response from the backend)

**Customer has items in cart when store suspends:**
- Cart data persists in the customer's browser (localStorage/cookies) and is not cleared
- The Suspension Page is shown on all routes — cart page is inaccessible during suspension
- If the store is reactivated and the customer returns, their cart data may still be available

**Both `isSuspended` and `isTemporaryCloseEnabled` are true:**
- Suspension takes priority
- `SuspensionPage` renders — `StoreClosedModal` is never shown
- On reactivation (`isSuspended = false`), if `isTemporaryCloseEnabled` is still true, the `StoreClosedModal` renders next
- The merchant must manually disable Temporary Close to fully reopen their store

**Store with no email and no phone:**
- `SuspensionPage` renders without the "If you have any inquiries, please contact:" section
- Only heading, body text, and footer are shown

**Direct product URL visited on suspended store:**
- Same as all other routes — Suspension Page is shown, HTTP 503 returned
- No per-route variation on suspended stores

#### Convenience Fee — Alternate Paths

**Customer views a historical order with a convenience fee:**
- The order detail page (`/account/my-orders/[orderId]`) displays the original convenience fee if the stored value is greater than zero
- The conditional display rule (`show if fee > 0`) naturally handles both cases:
  - New orders: backend returns 0, line is not shown
  - Historical orders: original non-zero fee is preserved and shown

#### Trial Homepage — Alternate Paths

**Trial merchant has NOT configured a custom homepage:**
- Homepage logic evaluates: plan is `TRIAL`, no custom homepage found
- Falls back to the default product listing page
- Behavior is identical to the fallback for LAUNCH/GROW/SCALE stores with no custom homepage

---

## Functional Requirements

### Change 1: Suspension Page

**FR-1** — The storefront must check `store.isSuspended` at the earliest possible point in the rendering pipeline — before any route-specific rendering, plan-based logic, or store content is loaded. This check must intercept all customer-facing routes.

**FR-2** — When `store.isSuspended === true`, all customer-facing routes must render the `SuspensionPage` component as the sole page content. No storefront layout, navigation, store theme, product pages, cart, checkout, blog, customer account pages, or custom pages are rendered.

**FR-3** — All routes on a suspended store must return HTTP status `503 Service Temporarily Unavailable`.

**FR-4** — The `SuspensionPage` component must include `<meta name="robots" content="noindex, nofollow">` in the page `<head>`.

**FR-5** — The `robots.txt` endpoint must dynamically return `User-agent: *\nDisallow: /` when `store.isSuspended === true`, and return the normal `robots.txt` content otherwise.

**FR-6** — The `SuspensionPage` component must display:
- A warning icon (red circle with white exclamation mark)
- Heading (uppercase, bold): "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT"
- Body text: "If you are the owner of this site and believe this is an error, or if you wish to restore service, please contact our billing department or log in to your account to resolve the outstanding balance."
- A divider line
- Merchant contact section (shown only if at least one of `merchantEmail` or `merchantPhone` is present):
  - Label: "If you have any inquiries or concerns, please contact:"
  - Email with mail icon (shown only if `merchantEmail` is present)
  - Phone with phone icon (shown only if `merchantPhone` is present)
- Footer: "Powered by Prosperna"

**FR-7** — The `SuspensionPage` component must accept `merchantEmail?: string | null` and `merchantPhone?: string | null` as props. If neither is provided, the contact section is hidden entirely.

**FR-8** — Suspension takes priority over Temporary Close. If both `store.isSuspended` and `store.isTemporaryCloseEnabled` are true, the `SuspensionPage` renders and the `StoreClosedModal` does not.

**FR-9** — The storefront rendering priority order must be:
1. `isSuspended === true` → `SuspensionPage` (HTTP 503, noindex, robots.txt disallow)
2. `isTemporaryCloseEnabled === true` → `StoreClosedModal` (existing behavior, unchanged)
3. Normal rendering (plan-based homepage, route-based pages)

**FR-10** — When the frontend receives a backend error during checkout indicating the store is suspended (e.g., order creation rejected), the frontend must redirect the customer to the Suspension Page rather than showing a generic error screen.

**FR-11** — The background of the Suspension Page must be dark/muted (e.g., `#1a1a2e` or equivalent) to signal that the store is inactive. Content is centered in a white/light card.

### Change 2: Convenience Fee Removal

**FR-12** — The "Convenience Fee" line item must be removed from the checkout order summary in `Summary.tsx`. The line must not render regardless of whether the backend returns 0 or a non-zero value for new orders.

**FR-13** — The `convenienceFee` state variable in `SingleCheckoutMain.tsx` must be removed or ignored. The UI must not display this value anywhere in the checkout flow.

**FR-14** — Any other location in `p1-customer` where convenience fee is displayed for new orders must also be updated to remove the display.

**FR-15** — The convenience fee line in historical order detail pages (`/account/my-orders/[orderId]`) must continue to display if the stored convenience fee value is greater than zero. The UI should conditionally render the line only when the fee value is `> 0`.

### Change 3: Trial Merchant Homepage

**FR-16** — The homepage plan-based rendering logic in `p1-customer/app/(routes)/page.tsx` must be updated to include `TRIAL` as a plan type that allows custom homepage rendering via Page Builder.

**FR-17** — The updated plan type references for custom homepage rendering must use the new plan type strings: `TRIAL`, `LAUNCH`, `GROW`, `SCALE`. Legacy plan type references (`PLUS`, `PRO`, `PREMIUM`, `PREMIUM_TRIAL`) must be replaced.

**FR-18** — Trial merchant storefronts must be functionally identical to Scale-tier storefronts from the customer's perspective: custom homepage, product pages, cart, checkout, customer accounts, blog, custom pages, and payment processing all function normally.

**FR-19** — No trial-related badge, countdown, or indicator must appear on the customer-facing storefront. Trial state is visible only on the merchant dashboard.

---

## Non-Functional Requirements

**NFR-1: Performance** — The `isSuspended` check must not introduce meaningful latency to the storefront's critical rendering path. Since the check reads from the store metadata already fetched early in the rendering lifecycle, no additional API call should be required. Target: zero additional network round-trips.

**NFR-2: SEO Correctness** — Suspended stores must return HTTP 503 (not 404 or 200). Using 403 or 404 would signal permanent removal to search engines. 503 signals temporary unavailability and preserves SEO equity for the merchant.

**NFR-3: Accessibility** — The `SuspensionPage` component must meet WCAG 2.1 AA contrast requirements. The warning icon must have appropriate alt text. The page must be keyboard-navigable.

**NFR-4: Reliability** — The Suspension Page must render correctly even if the store's contact information is missing or null. No unhandled exceptions from missing `merchantEmail` or `merchantPhone`.

**NFR-5: Test Coverage** — All three changes must have test coverage:
  - Unit/component test for `SuspensionPage` with and without contact info
  - Integration test: suspended store intercepting multiple route types
  - Integration test: HTTP 503 and noindex on suspended store routes
  - Unit test: checkout summary does not render convenience fee
  - Unit test: order detail renders convenience fee conditionally (> 0)
  - Unit test: homepage renders custom homepage for `TRIAL` plan
  - Unit test: homepage falls back to product listing for `TRIAL` with no custom homepage

---

## UX Notes

- The `SuspensionPage` must be a standalone full-page component — it must NOT use the store's layout, navigation bar, footer, or any store-branded elements. The design is intentionally generic and Prosperna-branded.
- The dark background (`#1a1a2e` or similar) is intentional — it creates a visual signal that the store is inactive, distinct from a normal store page or the `StoreClosedModal`.
- The centered white card layout ensures the content is readable across all screen sizes.
- The warning icon should be large and visually prominent — this is the first thing a customer sees.
- Merchant contact info is separated by a horizontal divider to visually distinguish it from the Prosperna-addressed instruction above.
- The "Powered by Prosperna" footer maintains brand presence while clarifying the platform context.
- Do not show navigation, cart icon, or any interactive storefront elements on the Suspension Page.

---

## Data Model Notes

### New: `isSuspended` field on Store

| Field | Type | Set By | Read By | Description |
|---|---|---|---|---|
| `isSuspended` | `Boolean` | ST-04 (`suspendMerchant()`, `reactivateMerchant()`) | `p1-customer` storefront | True when the merchant's subscription is suspended. Included in the existing store metadata API response. |

### Existing fields read by Suspension Page

| Field | Source | Used For |
|---|---|---|
| `store.email` | Store model | Merchant contact email on Suspension Page |
| `store.phone` / `store.contactNumber` | Store model | Merchant contact phone on Suspension Page |

### Existing fields updated in homepage logic

| Old Plan Type Strings | New Plan Type Strings |
|---|---|
| `PLUS`, `PRO`, `PREMIUM`, `PREMIUM_TRIAL` | `TRIAL`, `LAUNCH`, `GROW`, `SCALE` |

### Removed from checkout state

| State Variable | File | Action |
|---|---|---|
| `convenienceFee` | `SingleCheckoutMain.tsx` | Remove or ignore — value no longer drives any UI output |

---

## Integrations and APIs

### Store Metadata API (via `api-aggregator`)
- `p1-customer` already fetches store metadata early in its rendering lifecycle to resolve multi-tenancy (subdomain → store mapping)
- After ST-04 deploys, this response will include `isSuspended: boolean`
- `p1-customer` must read this field from the response — no new API call, no new endpoint
- The `merchantEmail` and `merchantPhone` fields needed by `SuspensionPage` are already present in the store metadata response

### `orders-service-api` (Checkout)
- ST-02 causes the backend to return `0` for all convenience fees going forward
- ST-13 removes the convenience fee display regardless of the backend value
- If the backend rejects an order creation because the store is suspended, the frontend must handle this error code and redirect to the Suspension Page (FR-10)

### Dynamic `robots.txt` (Internal)
- `p1-customer` must serve a dynamic `robots.txt` based on `store.isSuspended`
- Implementation: Next.js route handler at `app/robots.txt/route.ts` (or equivalent)
- No external service dependency

---

## Error Handling

| Error Scenario | Frontend Behavior |
|---|---|
| `isSuspended` field missing from store response (field not yet deployed) | Treat as `false` — store renders normally. Log a warning if possible. Do not break rendering. |
| Backend rejects order creation: store is suspended | Redirect customer to Suspension Page. Do not display a generic API error. |
| `merchantEmail` and `merchantPhone` both null on Suspension Page | Render Suspension Page without the contact section. Do not throw. |
| `robots.txt` handler fails to read store status | Serve default `Allow: /` as safe fallback. Do not 500. |
| Store reactivated while Suspension Page is cached (ISR) | On next revalidation/request, `isSuspended = false` is read and normal store renders. No special handling required — Next.js cache behavior handles this naturally. |

---

## Telemetry and Analytics

Analytics instrumentation on ST-13 changes is deferred. No events are tracked in this release.

---

## Rollout Plan

ST-13 deploys simultaneously with all other pricing restructuring subtasks (ST-01 through ST-16 as applicable). There are no feature flags, no phased rollout, and no per-merchant toggles. Prerequisites before deploying ST-13:

1. ST-04 backend changes (Store model `isSuspended` field) must be deployed or deployed simultaneously so the field is present in the API response
2. ST-02 backend changes (convenience fee computation returns 0) should deploy simultaneously or before ST-13

---

## Open Questions

| # | Question | Assumption Used |
|---|---|---|
| OQ-1 | What is the exact key used for merchant phone in the store data response — `phone` or `contactNumber`? | Assumed `store.phone` or `store.contactNumber` — implementation team to confirm field name and use whichever is populated |
| OQ-2 | Does the existing store metadata response shape from `api-aggregator` include email and phone? Or do they need to be explicitly added? | Assumed included — if not, ST-04 or the API team must add them to the store data response |
| OQ-3 | What is the exact error code/message returned by `orders-service-api` when an order is rejected because the store is suspended? | To be confirmed with ST-02/backend team so the frontend can correctly identify suspension-related rejections vs other order errors |
| OQ-4 | Does a dynamic robots.txt route handler already exist in `p1-customer`? | Assumed it either exists or is straightforward to create as a Next.js route handler |

---

# Gherkin User Stories

## Feature: ST-13 Storefront Updates

### Change 1: Suspension Page

```gherkin
Feature: Suspension Page — Suspended Storefront Replacement

  Scenario: Customer visits homepage of a suspended store
    Given a merchant's store has isSuspended set to true
    When a customer navigates to the store homepage
    Then the SuspensionPage component is rendered
    And the HTTP response status is 503
    And the page contains the heading "THIS WEBSITE HAS BEEN TEMPORARILY SUSPENDED DUE TO NON-PAYMENT"
    And the page contains "Powered by Prosperna"
    And the page head contains noindex and nofollow meta robots tag
    And no store navigation, products, or store content is shown

  Scenario: Customer visits a product page of a suspended store
    Given a merchant's store has isSuspended set to true
    When a customer navigates to a product page URL
    Then the SuspensionPage component is rendered
    And the HTTP response status is 503

  Scenario: Customer visits the cart page of a suspended store
    Given a merchant's store has isSuspended set to true
    When a customer navigates to the cart page
    Then the SuspensionPage component is rendered
    And the HTTP response status is 503

  Scenario: Customer visits a checkout page of a suspended store
    Given a merchant's store has isSuspended set to true
    When a customer navigates to the checkout page
    Then the SuspensionPage component is rendered
    And the HTTP response status is 503

  Scenario: Suspension Page shows merchant contact info when both email and phone are available
    Given a merchant's store has isSuspended set to true
    And the store has a registered email "merchant@example.com"
    And the store has a registered phone "+63 912 345 6789"
    When a customer visits any route on the store
    Then the Suspension Page shows "merchant@example.com"
    And the Suspension Page shows "+63 912 345 6789"
    And the contact section heading "If you have any inquiries or concerns, please contact:" is shown

  Scenario: Suspension Page shows only email when phone is missing
    Given a merchant's store has isSuspended set to true
    And the store has email "merchant@example.com"
    And the store has no phone number
    When a customer visits any route on the store
    Then the Suspension Page shows "merchant@example.com"
    And no phone number is displayed

  Scenario: Suspension Page hides contact section when neither email nor phone is available
    Given a merchant's store has isSuspended set to true
    And the store has no email and no phone number
    When a customer visits any route on the store
    Then the contact section is not rendered
    And the heading and body text and footer are still shown

  Scenario: Suspension takes priority over Temporary Close
    Given a merchant's store has isSuspended set to true
    And the merchant has also enabled isTemporaryCloseEnabled
    When a customer visits any route on the store
    Then the SuspensionPage is rendered
    And the StoreClosedModal is not shown

  Scenario: Store reactivation restores normal storefront
    Given a merchant's store had isSuspended set to true
    And the merchant has reactivated their subscription
    And isSuspended is now set to false
    When a customer visits the store
    Then the normal storefront renders
    And the HTTP response status is 200

  Scenario: robots.txt returns Disallow all when store is suspended
    Given a merchant's store has isSuspended set to true
    When a crawler or browser fetches the store's robots.txt
    Then the response body is "User-agent: *\nDisallow: /"

  Scenario: robots.txt returns normal content when store is active
    Given a merchant's store has isSuspended set to false
    When a crawler or browser fetches the store's robots.txt
    Then the response body is the normal robots.txt content

  Scenario: Customer submits an order while store is suspended
    Given a customer is on the checkout page
    And the store becomes suspended before the customer submits
    When the customer submits the order
    And the backend rejects the request because the store is suspended
    Then the frontend redirects the customer to the Suspension Page
    And no partial order is created
```

### Change 2: Convenience Fee Removal

```gherkin
Feature: Convenience Fee Removal from Checkout

  Scenario: Customer proceeds to checkout and sees no convenience fee
    Given a customer has items in their cart on any active store
    When the customer proceeds to the checkout page
    Then the order summary shows Sub Total
    And the order summary shows Shipping Fee (if applicable)
    And the order summary shows Additional Fee (if applicable)
    And the order summary shows Tax (if applicable)
    And the order summary shows Total
    And no "Convenience Fee" line item is shown

  Scenario: Convenience fee line is not shown even when backend returns zero
    Given the backend order computation returns convenienceFee as 0
    When the checkout order summary renders
    Then the convenience fee line is not displayed at all

  Scenario: Historical order with non-zero convenience fee is preserved
    Given a customer has a historical order placed before the pricing restructuring
    And the stored convenience fee for that order is 4.56
    When the customer views that order in their order history
    Then the order detail shows "Convenience Fee ₱4.56"

  Scenario: New order detail page shows no convenience fee line
    Given a customer places a new order after the pricing restructuring
    And the stored convenience fee is 0
    When the customer views the order detail
    Then no convenience fee line is shown
```

### Change 3: Trial Merchant Homepage

```gherkin
Feature: Trial Merchant Store Behavior — Homepage Logic

  Scenario: Trial merchant with custom homepage serves Page Builder homepage
    Given a merchant's store has payPlanType set to TRIAL
    And the merchant has published a custom homepage via Page Builder
    When a customer navigates to the store homepage
    Then the custom Page Builder homepage is rendered

  Scenario: Trial merchant without custom homepage falls back to product listing
    Given a merchant's store has payPlanType set to TRIAL
    And the merchant has not configured a custom homepage
    When a customer navigates to the store homepage
    Then the default product listing page is rendered

  Scenario: Trial store checkout is fully functional
    Given a merchant's store has payPlanType set to TRIAL
    When a customer adds products to cart and proceeds to checkout
    Then the checkout flow completes successfully
    And no trial-related restriction or message is shown to the customer

  Scenario: No trial indicator is visible on the customer-facing storefront
    Given a merchant's store has payPlanType set to TRIAL
    When a customer browses the store
    Then no trial badge, countdown, or trial-related indicator is visible anywhere on the storefront

  Scenario: LAUNCH plan store renders custom homepage if configured
    Given a merchant's store has payPlanType set to LAUNCH
    And the merchant has published a custom homepage
    When a customer navigates to the store homepage
    Then the custom Page Builder homepage is rendered

  Scenario: GROW plan store renders custom homepage if configured
    Given a merchant's store has payPlanType set to GROW
    And the merchant has published a custom homepage
    When a customer navigates to the store homepage
    Then the custom Page Builder homepage is rendered

  Scenario: SCALE plan store renders custom homepage if configured
    Given a merchant's store has payPlanType set to SCALE
    And the merchant has published a custom homepage
    When a customer navigates to the store homepage
    Then the custom Page Builder homepage is rendered
```

---

# Traceability Map

| FR | Gherkin Scenario(s) | Description |
|---|---|---|
| FR-1 | Suspension Page: all suspension scenarios | isSuspended check at earliest rendering point |
| FR-2 | Customer visits homepage/product/cart/checkout of suspended store | SuspensionPage replaces entire storefront |
| FR-3 | Customer visits homepage of suspended store; Customer visits product/cart/checkout page | HTTP 503 on all routes |
| FR-4 | Customer visits homepage of suspended store | noindex, nofollow meta tag |
| FR-5 | robots.txt returns Disallow all when suspended; robots.txt returns normal when active | Dynamic robots.txt |
| FR-6 | Suspension Page shows merchant contact info (both/email only/hidden) | SuspensionPage content spec |
| FR-7 | Suspension Page hides contact section when neither email nor phone available | Null-safe props |
| FR-8 | Suspension takes priority over Temporary Close | Priority check order |
| FR-9 | Suspension takes priority over Temporary Close; Store reactivation restores storefront | Rendering priority order |
| FR-10 | Customer submits order while store is suspended | Frontend suspension guard at checkout |
| FR-11 | Customer visits homepage of suspended store | Dark background / white card design |
| FR-12 | Customer sees no convenience fee at checkout | Convenience fee line removed from Summary.tsx |
| FR-13 | Convenience fee line not shown even when backend returns zero | convenienceFee state removed |
| FR-14 | Customer sees no convenience fee at checkout | All checkout display locations updated |
| FR-15 | Historical order with non-zero fee preserved; New order shows no fee | Conditional display on order history |
| FR-16 | Trial merchant with/without custom homepage | TRIAL added to homepage logic |
| FR-17 | LAUNCH/GROW/SCALE scenarios | New plan type strings replace legacy |
| FR-18 | Trial store checkout is fully functional | Full store functionality during trial |
| FR-19 | No trial indicator visible on storefront | No customer-visible trial state |
