---
id: minimum-order-amount
title: BRD. Minimum Order Amount
sidebar_label: Minimum Order Amount
sidebar_position: 3
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-31
- Status: Draft

---

## Background and Problem

Prosperna is a multi-tenancy SaaS ecommerce platform serving merchants who run online stores. Merchants currently have no mechanism to enforce a minimum cart value before a customer can proceed to checkout. This exposes merchants to small, unprofitable orders that may not justify the cost of fulfillment, packaging, or payment processing fees. There is no built-in way to communicate a minimum requirement to customers, creating confusion and support overhead when merchants try to enforce this manually through other channels.

---

## Goals

1. Allow merchants to set a configurable minimum order amount that must be met before a customer can check out.
2. Enforce the minimum at the cart page (primary) and checkout page (failsafe) of the Online Store.
3. Communicate the requirement clearly and in real time to customers so they know exactly how much more to add.
4. Keep the feature opt-in (off by default) so merchants who do not need it are unaffected.

---

## Non-Goals

- Per-location minimum order configuration. The minimum is global across all of a merchant's store locations.
- Admin Control Platform involvement. This feature is entirely merchant-controlled.
- Applying the minimum to the post-coupon/post-discount subtotal. The check is always against the pre-coupon product subtotal.
- Marketplace or add-on specific minimums.
- Minimum based on order quantity (item count) rather than order value (currency amount).

---

## Stakeholders

| Role | Involvement |
|---|---|
| Merchant | Configures the minimum order amount via the Merchant Dashboard |
| Customer (end-user) | Experiences enforcement at the cart and checkout pages |
| Prosperna Engineering | Implements backend API changes, Merchant Dashboard component, and Online Store enforcement logic |
| Prosperna Product | Owns feature definition, scope decisions, and success metrics |
| Prosperna QA | Validates enforcement, edge cases, and UX accuracy |

---

## Personas

**Merchant — Store Owner / Manager**
- Operates an online store on Prosperna with one or more locations.
- Wants to protect margins by ensuring orders are large enough to be worth fulfilling.
- Needs a simple toggle + amount field in Store Settings — no complex rules or per-location overhead.
- Expects immediate effect after saving without additional steps.

**Customer — Online Shopper**
- Browses and shops at a Prosperna-powered online store.
- Expects a clear, helpful message when blocked from checkout, not a vague error.
- Needs to know exactly how much more to add to proceed.
- May be a guest (not logged in) or a registered user — enforcement applies equally.

---

## Business Value

| Value Driver | Description |
|---|---|
| Margin protection | Prevents merchants from fulfilling orders that cost more to process than they generate |
| Fulfillment efficiency | Reduces low-value orders that create logistics overhead disproportionate to revenue |
| Customer transparency | Real-time messaging ensures customers are informed rather than confused or frustrated |
| Platform competitiveness | Aligns Prosperna with industry-standard ecommerce capabilities (Shopify, WooCommerce, BigCommerce, Magento all support this) |
| Merchant autonomy | Feature is entirely merchant-controlled; Prosperna admins are not involved |

---

## Scope

### In Scope

- Merchant Dashboard: new MinimumOrderAmount configuration section in Store Settings
  - Toggle switch to enable/disable the feature
  - Numeric (currency) amount input field
  - Soft warning for unusually high amounts (> ₱50,000)
  - Save via existing `PUT /business-profile/order/update/settings` endpoint (extended with two new fields)
  - Toast notification on successful save
- Backend API: two new fields on order settings — `is_minimum_order_enabled` (Boolean) and `minimum_order_amount` (Number)
  - Returned by `GET /business-profile/order/settings`
  - Accepted by `PUT /business-profile/order/update/settings`
  - Included in public store profile via `GET /v1/store-business-profile/details/public`
  - Optional server-side guard on `POST /v1/computations/`
- Online Store — Cart Page: real-time notice bar and disabled Checkout button when subtotal is below minimum
- Online Store — Checkout Page: inline error banner and disabled submit button as a failsafe
- Global enforcement: minimum applies to all store locations, all customer types (guest and registered)

### Out of Scope

- Per-location minimum order amounts
- Admin Control Platform changes
- Minimum based on item count
- Post-coupon/post-discount subtotal enforcement (minimum is always pre-coupon)
- Mobile app (native) — this covers the web Online Store only

---

## Assumptions

1. The backend stores the minimum order amount at the merchant level, not per-location.
2. The pre-coupon product subtotal (`item_sub_total` per cart item) is the correct and sole basis for the minimum check. Shipping, taxes, and coupon deductions are excluded.
3. The public store profile endpoint (`GET /v1/store-business-profile/details/public`) can be extended to include the two new fields without breaking existing consumers.
4. Merchant session configuration changes do not retroactively affect customers already in an active checkout session.
5. The exact parent navigation section (Checkout Settings vs. Order Rules) in the Merchant Dashboard will be confirmed during implementation. The `Store Settings` page is the correct container.
6. Currency is always Philippine Peso (₱) for the initial release.
7. Free items (₱0 products) contribute zero toward the minimum and do not help satisfy it.

---

## Dependencies

| Dependency | Type | Notes |
|---|---|---|
| Backend API — order settings endpoint | Internal | Must expose `is_minimum_order_enabled` and `minimum_order_amount` on GET and accept them on PUT |
| Backend API — public store profile endpoint | Internal | Must include the two new fields so the Online Store can read them |
| Merchant Dashboard `OrderSettings` component | Internal reference | New `MinimumOrderAmount` component is modeled on this existing component |
| Online Store `Main.tsx` (cart) | Internal | `showDisabledButton` state and `cartSubtotal` calculation already exist and will be extended |
| Online Store `SingleCheckoutMain.tsx` (checkout) | Internal | `checkoutButtonDisabled` state already exists and will be extended |
| `StoreOrderSettings` API hook | Internal | Will be extended to pass the two new fields through the existing mutation |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Merchants set an extremely high minimum, blocking most customers | Low | Medium | Soft warning shown in the UI when amount exceeds ₱50,000. Warning is non-blocking but prompts the merchant to reconsider. |
| Coupon interaction confusion — merchants expect coupon to not bypass minimum | Low | Medium | Business rule is documented and enforced: minimum is checked against pre-coupon subtotal. |
| Customer removes item after reaching checkout, dropping below minimum | Low | Medium | Checkout page failsafe independently enforces the minimum, disabling the place-order button with a clear error banner. |
| Public store profile endpoint change breaks existing consumers | Medium | High | Additive change only — two new fields added, no existing fields changed or removed. Consumers that do not read the new fields are unaffected. |
| Mid-session merchant config change disrupts a customer in checkout | Low | Low | Minimum is read at cart/checkout load time. Active checkout sessions are not retroactively affected. |

---

## Compliance and Privacy Notes

- No personally identifiable information (PII) is collected or processed by this feature.
- The minimum order amount is a merchant-level configuration value stored alongside existing order settings — no new privacy classification is required.
- The feature does not affect payment processing logic directly; it only gates access to the checkout flow.

---

## Success Metrics

| Metric | Description | Target |
|---|---|---|
| Feature adoption rate | Percentage of merchants who enable the minimum order amount feature within 90 days of release | TBD by Product |
| Below-minimum order rate | Reduction in orders submitted below the merchant's configured minimum | Near 0% after feature is enabled |
| Customer experience | Reduction in support tickets related to small-order confusion or failed checkouts | Measurable decrease |
| Configuration error rate | Number of merchants who set an amount and then immediately disable it (signal of misconfiguration) | Low |
| Average minimum order amount set | Distribution of values set by merchants to inform product decisions | Tracked via analytics |
