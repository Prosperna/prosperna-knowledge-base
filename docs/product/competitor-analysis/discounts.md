---
id: discounts
title: Competitor Research - Discounts
sidebar_label: Discounts
sidebar_position: 5
---

# Global ecommerce discount feature benchmarking for Prosperna

**The global ecommerce industry has converged on a common discount architecture — dual-method (automatic + code-based), proportional or highest-price-first allocation, and floor-at-zero capping — but significant divergence remains in item selection logic, stacking rules, and checkout UX.** This report benchmarks 12 major platforms against Prosperna's current implementation and surfaces clear standards, gaps, and recommendations. No platform has perfected every dimension; the opportunity for Prosperna lies in selectively adopting enterprise-grade patterns (like SFCC's highest-cost-first selection and Shopify's two-layer discount data model) while differentiating on merchant-facing intelligence such as cap-scenario warnings — a feature no major platform offers today.

---

## 1. Discount methods and code structure are standardized

Every major platform supports **two core discount methods**: code-based (customer enters a promo code) and automatic (discount applies without customer action when conditions are met). This dual-method architecture is the undisputed industry standard.

| Platform | Coupon/Code | Automatic | Name vs. Code |
|----------|:-----------:|:---------:|----------------|
| Shopify | ✅ | ✅ (up to 25 active) | Code = customer identifier; Title (auto) = display name |
| BigCommerce | ✅ (single or multi-code) | ✅ | Internal `name` + customer-facing `customer_display_name` |
| WooCommerce | ✅ | ❌ core (requires plugin) | Code = identifier; Description = internal |
| Magento | ✅ (specific or auto-gen) | ✅ (Catalog + Cart rules) | Rule Name = internal; Label = customer-facing (per store view) |
| SFCC | ✅ (3 coupon types) | ✅ (via campaigns) | Promotion ID/Name = internal; Callout Message = customer-facing |
| Wix | ✅ | ✅ | Code = customer-facing; Coupon Name = internal |
| Squarespace | ✅ | ✅ (higher plans) | Code displayed at checkout |
| Square Online | ✅ (via Marketing) | ✅ | Code = customer-facing |
| Ecwid | ✅ | ✅ (promotions) | Name = internal; Code = customer-facing |
| Zoho Commerce | ✅ | ✅ | Name + Code are separate fields |
| PrestaShop | ✅ | ✅ (codeless cart rules + catalog rules) | Name = public-facing; Code = entry field |
| OpenCart | ✅ | ❌ (product discounts/specials only) | Name = admin; Code = customer entry |

**Industry consensus**: The discount **name/label** and the **code** are separate concepts on nearly all platforms. The name is either internal-only or serves as a display label; the code is what customers enter. **Prosperna should maintain this separation.** Platforms like BigCommerce and Magento go further by supporting per-storefront or per-locale display names, which is a best practice for internationalized stores.

---

## 2. Discount types converge on five core categories

All platforms support **percentage off** and **fixed/flat amount off** as baseline types. Beyond that, the standard feature set includes free shipping, Buy X Get Y, and order-level vs. product-level scoping.

**Fixed amount "once per order" vs. "per eligible item"** is a critical architectural distinction that every major platform addresses, though the mechanisms differ:

- **Shopify**: Checkbox "Only apply discount once per order" on fixed-amount product discounts. When unchecked, discount applies to every eligible item.
- **BigCommerce**: `apply_once` boolean flag in the Promotions API. Combined with `as_total` for proportional distribution control.
- **WooCommerce**: Two entirely separate discount types — "Fixed Cart Discount" (once per order, proportional) and "Fixed Product Discount" (per eligible item).
- **Magento**: Two separate action types — "Fixed amount discount" (per item) and "Fixed amount discount for whole cart" (once).
- **SFCC**: Product-level "Amount off" (per line item) vs. Order-level "Amount off" (once, prorated).
- **PrestaShop**: "Apply a discount to" selector with options for Order, Specific product, Cheapest product, or Selected products.

**Industry standard**: Offering both "once per order" and "per eligible item" application modes for fixed-amount discounts is universal among Tier 1 platforms. Prosperna must support both.

---

## 3. Product targeting capabilities show a clear baseline

All 12 platforms support scoping discounts to **all products, specific products, and specific categories/collections**. Enterprise platforms extend this significantly.

The baseline scope options every platform offers are all products, specific products, and specific categories. BigCommerce adds **brand-level targeting** and exclusion rules (`not.categories`, `not.products`). Magento supports targeting by any product attribute marked for promo rules, plus customer segments (Adobe Commerce). SFCC provides the most granular system with separate "qualifying products" (what triggers the discount) and "discounted products" (what receives the discount) — enabling cross-sell promotions like "Buy a shirt, get 50% off matching shorts."

**How scoping is communicated at checkout** varies significantly. BigCommerce leads with a **four-state notification system** (PROMOTION, UPSELL, ELIGIBLE, APPLIED) with configurable HTML banners at cart and checkout. SFCC uses **Callout Messages** that appear on product detail pages, cart, and checkout. Shopify shows the discount name and allocated amount at the line-item level. Most other platforms show a simple discount line in the order summary.

**Prosperna recommendation**: At minimum, support all-products, specific-products, and specific-categories scoping. For differentiation, consider BigCommerce's notification system or SFCC's qualifying-vs-discounted product separation.

---

## 4. The industry is split on item selection — but "highest price first" is the pro-customer standard

This is one of Prosperna's most critical validation questions. **When a fixed-amount "once per order" discount targets multiple eligible items, which item gets the discount?** The industry is divided into three camps:

**Camp 1 — Highest price first (maximize customer savings)**:
- **Salesforce Commerce Cloud**: Explicitly documented — *"products with the highest cost, after product discounts, are selected before products with lower costs. This provides the highest possible savings to the shopper."*
- This is the approach that maximizes perceived customer value.

**Camp 2 — Lowest price first (minimize merchant cost)**:
- **Wix**: Explicitly documented — *"only the lowest priced item is discounted"* when "Apply once per order" is selected.
- This conservative approach minimizes the merchant's actual discount outlay.

**Camp 3 — Proportional distribution (mathematically fair)**:
- **Shopify** (all-products discounts): Distributes proportionally based on price ratio. A $50 discount on a $50 + $100 cart yields $16.50 + $33.50.
- **WooCommerce**: Fixed Cart Discount distributed proportionally across eligible items for tax accuracy.
- **Magento**: "Fixed amount discount for whole cart" prorated across qualifying line items.

**Camp 4 — Merchant configurable**:
- **BigCommerce**: Explicit `strategy` field — merchant chooses `MOST_EXPENSIVE` or `LEAST_EXPENSIVE`.
- **PrestaShop**: Merchant selects "Apply to: Order / Specific product / Cheapest product / Selected products."

| Platform | Item Selection | Configurable? |
|----------|---------------|:-------------:|
| SFCC | Highest cost first | No |
| Wix | Lowest price first | No |
| Shopify | Proportional | No |
| WooCommerce | Proportional | No |
| Magento | Proportional | No |
| BigCommerce | MOST/LEAST_EXPENSIVE | ✅ Yes |
| PrestaShop | Cheapest/specific/order | ✅ Yes |

**Validation for Prosperna**: Applying to the **most expensive eligible item first** is the pro-customer approach used by SFCC (the most sophisticated enterprise platform). It maximizes perceived savings and aligns with consumer-friendly UX principles. However, it is **not the universal standard** — proportional distribution is the most common approach among mid-market platforms (Shopify, WooCommerce, Magento). The most flexible approach is BigCommerce's configurable strategy. **Prosperna should default to highest-price-first** for maximum customer satisfaction, but consider making this configurable for merchants who prefer proportional distribution.

---

## 5. Floor-at-zero is universal, but one major platform has a bug

**"Never go negative" is the universal standard.** Every platform researched either explicitly documents or implicitly enforces that discounts cannot reduce an item or order below $0.

- **Shopify**: Explicitly documented — *"The order value can't go below $0 USD."*
- **WooCommerce**: Code-level enforcement via `filter_products_with_price` method; items at $0 are excluded from further discounting.
- **BigCommerce**: Items cannot have negative prices; discount capped at item value.
- **Wix**: *"If you create a $10 price discount coupon and a customer applies it to an $8 store product, that item will be free."* Warns merchants proactively.
- **Squarespace**: Takes the strictest approach — **blocks the discount entirely** if it exceeds the order subtotal (rather than capping at zero).

**Notable exception — Magento has a confirmed bug**: GitHub issue #35162 documents that Magento's "Fixed amount discount for whole cart" can produce **negative order totals** when the discount exceeds the cart value, causing checkout errors. This is a known, reproducible bug in Magento 2.4.x that merchants must patch with custom code or minimum-subtotal conditions.

**PrestaShop's unique approach**: Offers a "Partial Use" toggle — when enabled and the discount exceeds the order total, the excess generates a **new voucher for future use**. This is the only platform that preserves unused discount value.

**Prosperna recommendation**: Floor-at-zero is mandatory. Consider Squarespace's approach of blocking over-value discounts as an alternative, or PrestaShop's partial-use voucher generation as a premium feature. At minimum, ensure robust floor-at-zero enforcement and display the actual applied amount (not the configured value) to customers.

---

## 6. No platform warns merchants about cap scenarios — a clear differentiation opportunity

**Validation finding: No major platform (Shopify, WooCommerce, BigCommerce, Magento, SFCC, Wix, Squarespace, or any other) provides a proactive warning during discount creation when the configuration could lead to cap scenarios.** For example, if a merchant sets a $100 discount with a minimum purchase of $80, no platform alerts them that the discount will always be partially capped.

Shopify's documentation simply states the floor behavior as fact. WooCommerce performs no cross-field validation between minimum spend and discount amount. The closest any platform comes is **Mirasvit's extension for Magento 2**, which provides a "dynamic pop-up that previews your discount calculation in real time" — but this is a third-party add-on, not native.

**This is a significant opportunity for Prosperna.** A configuration-time alert like: *"⚠️ Your minimum purchase requirement (₱80) is less than your discount value (₱100). Customers meeting the minimum will receive up to ₱80 off (the discount will be capped at the order total)."* would be a genuine differentiator that reduces merchant confusion and support tickets.

---

## 7. Checkout discount display follows clear patterns, but tags need context

**Discount display at checkout** follows a consistent pattern across platforms:

- **Line-item level**: Original price shown with strikethrough, new price displayed. Applied discount name and allocated amount shown below (Shopify, BigCommerce, SFCC).
- **Order summary level**: Discount appears as a negative line between subtotal and total, showing the discount name and actual deducted amount (universal).
- **Coupon code field**: Usually hidden behind a "Have a coupon?" or "Promo code" link (Baymard Institute recommends this to prevent "coupon hunting" behavior).

**For "once per order" discounts tagging a single item**: No major platform adds contextual tooltips explaining why only one item shows the discount badge. The standard is simply to display the discount on the affected item without explanation. However, UX research from Nielsen Norman Group emphasizes being **"upfront about restrictions on promotions"** to prevent confusion. Adding brief inline copy like "Discount applied to 1 eligible item" near the discount line would be a UX improvement over current industry practice — but it is not yet standard.

**Cap/partial savings communication**: The universal approach is to show only the **actual applied amount**, never the configured value, on customer-facing receipts. No platform shows "Discount: ₱100 (capped at ₱82)" to customers. Positive framing is recommended: "You saved ₱82!" rather than "₱18 of your discount was unused."

---

## 8. Stacking rules are highly configurable on enterprise platforms

Discount combination/stacking is one of the most divergent areas across platforms:

| Platform | Default Behavior | Configurable? | Max Codes per Order |
|----------|-----------------|:-------------:|:-------------------:|
| Shopify | Not combinable | ✅ Per-discount class | 5 |
| BigCommerce | Stackable (auto + coupon) | ✅ `can_be_used_with_other_promotions` | 1 (5 with Enterprise) |
| WooCommerce | Stackable | ✅ "Individual use only" checkbox | Unlimited |
| Magento | Stackable | ✅ "Discard Subsequent Rules" + Priority | Multiple (2.4.7+) |
| SFCC | Stackable across classes | ✅ NO/CLASS/GLOBAL exclusivity + Rank | 1 (multi-use beta) |
| Wix | Auto + coupon stack | Partial | 1 coupon |
| Squarespace | Built-in rules (not configurable) | ❌ | 1 |
| Ecwid | Different types stack | ❌ | 1 |
| OpenCart | Product discounts + coupon stack | ❌ | 1 |

**Industry consensus**: Stacking should be **configurable per discount** (Shopify, BigCommerce, Magento, SFCC all support this). The default should be **non-stackable** (Shopify's approach) to prevent unintended over-discounting, with merchants opting in to allow combinations. SFCC's three-tier exclusivity system (NO / CLASS / GLOBAL) is the gold standard for enterprise use.

**Prosperna recommendation**: At minimum, offer a per-discount toggle for "Can be combined with other discounts." Default to non-combinable. For a more advanced implementation, adopt Shopify's class-based system (product discounts, order discounts, shipping discounts can combine across classes but not within).

---

## 9. Scheduling, statuses, and management UI have clear standards

**Scheduling** is universally supported with start date/time and optional end date/time. Every platform except WooCommerce core (which only has an expiry date; start date requires WordPress scheduling) supports both start and end dates natively. **Wix and Square Online** go further by supporting **recurring schedules** (e.g., every Sunday, happy hour windows).

**Standard discount statuses** across platforms:

- **Active**: Currently live and usable
- **Scheduled**: Future start date not yet reached
- **Expired**: Past end date
- **Disabled/Deactivated/Paused**: Manually turned off by merchant

All platforms except Squarespace and Ecwid support a four-status model. **Ecwid adds a fifth status — USEDUP** — for coupons that have reached their usage limit, which is a useful distinction.

**Discount listing UI** consistently shows: name/code, discount type/value, status, dates, and usage count. **Usage counters are standard** — Shopify tracks "Times used" as a filterable field, BigCommerce shows `current_uses` vs `max_uses`, Squarespace displays a usage count next to each discount, and OpenCart has a dedicated "Coupon History" tab per coupon.

---

## 10. Location scoping varies dramatically by platform tier

Multi-location discount scoping is **not universally supported** and correlates strongly with platform tier:

- **Full support**: BigCommerce (channels array for Multi-Storefront), Magento (Website-level scoping), SFCC (site-level management), **Square Online** (per-location selection including POS vs. Online).
- **Partial support**: Shopify (POS Pro locations only for automatic discounts; no per-location online scoping), Zoho Commerce (shipping zone-based restrictions).
- **No support**: Wix, Squarespace, WooCommerce core, Ecwid, OpenCart (all single-store or require plugins).

**For Prosperna's multi-location merchants**: Store location scoping is a differentiating feature. Square Online's implementation is the most accessible — merchants select applicable locations during discount creation from a simple checklist. BigCommerce's channel-based system is more powerful but complex.

---

## 11. Configured vs. actual discount value — Shopify sets the API standard

When a $100 discount is configured but only $82 is actually applied (due to cap behavior), platforms handle the discrepancy differently:

**Customer-facing**: Every platform shows only the **actual applied amount**. No platform displays "Discount: ₱100 (capped at ₱82)" to customers. This is the universal standard.

**Merchant-facing admin UI**: All platforms show the **actual applied amount** in order details. The configured discount value is accessible only by navigating to the discount rule itself — no platform displays both values side-by-side in the order view.

**API/export level**: Shopify provides the most transparent model with **two distinct data layers** within the same order object:
- `DiscountApplication.value` = the configured intent (e.g., "100.0")
- `DiscountAllocation.allocatedAmountSet` = the actual amount applied per line item (e.g., "82.00")

Shopify's documentation explicitly states: *"Discount applications capture the intentions of a discount source at the time of application. Discount applications don't represent the actual final amount discounted on a line."* Other platforms store configured and actual values in **separate, unlinked entities** (WooCommerce in coupon metadata vs. order items; Magento in cart price rules vs. sales order items).

**Prosperna recommendation**: In the admin order details view, show the **actual applied amount** prominently, with a subtle reference to the original configured value (e.g., "Discount: ₱82.00 applied (configured: ₱100.00)"). In APIs and exports, follow Shopify's two-layer model — include both the configured rule value and the actual allocated amount per line item.

---

## 12. Export and reporting capabilities range from basic to comprehensive

| Platform | Dedicated Discount Report | Usage Tracking | Configured vs. Actual in Export |
|----------|:------------------------:|:--------------:|:-------------------------------:|
| Shopify | ✅ Sales by Discount | ✅ Times used | API only (two-layer model) |
| BigCommerce | Via order filters | ✅ current_uses | Separate APIs |
| WooCommerce | ✅ Analytics > Coupons | ✅ Usage/Limit | Separate entities |
| Magento | ✅ Reports > Coupons | Via report | Separate tables |
| SFCC | ✅ Promotion analytics | ✅ Redemption tracking | Via API |
| Square Online | ✅ Reports > Discounts | ✅ In reports | In reports |
| Wix | ✅ Sales by Coupon | ✅ Available uses | In order exports |
| OpenCart | ✅ Reports > Coupon | ✅ Coupon History tab | In reports |

**Industry standard**: A dedicated discount/coupon performance report is expected, showing at minimum: discount code, number of orders, total discount amount, and date range filtering. Shopify's "Sales by Discount" report is the benchmark, including gross sales, discounts, net sales, taxes, and refunds per discount.

---

## 13. Approaching-threshold messaging is an emerging best practice

Only **two platforms** natively support "You're $X away from qualifying" messaging:

- **BigCommerce**: UPSELL notification type — *"You've spent $40, add $10 more for free shipping!"*
- **SFCC**: Native "Approaching Discounts" API with configurable thresholds and `Enable Upsells` flag.

All other platforms require third-party apps or custom development. Baymard Institute and Nielsen Norman Group both advocate for progress indicators on threshold-based promotions, making this an important UX investment.

**Zoho Commerce** takes a different approach — displaying **active coupons on the checkout page** with countdown timers and usage percentages, which creates urgency rather than progress messaging.

---

## 14. Industry consensus and Prosperna-specific recommendations

Based on this analysis of 12 major platforms, here is what Prosperna should treat as **validated industry standards** versus **differentiation opportunities**:

**Validated standards Prosperna must align with:**
- Dual discount methods (automatic + code-based) with separate name/label and code fields
- Both "once per order" and "per eligible item" modes for fixed-amount discounts
- Product scoping to all products, specific products, and specific categories
- Minimum purchase amount and minimum quantity thresholds
- Floor-at-zero cap behavior (discount never makes an item or order negative)
- Customer-facing display shows only the actual applied amount, never the configured value
- Start/end date scheduling with Active/Scheduled/Expired/Disabled statuses
- Usage counter per discount visible in admin
- Per-discount stacking configuration (default: non-combinable)
- Dedicated discount performance report

**Recommended item selection algorithm**: Default to **highest-price-first** (SFCC's approach) to maximize customer-perceived savings. This is the most consumer-friendly approach and aligns with SFCC, the most sophisticated platform. Consider making it configurable (like BigCommerce) for merchants who prefer proportional distribution. **Avoid Wix's lowest-price-first approach**, which minimizes savings and could frustrate customers.

**Differentiation opportunities (no major platform does these well):**

- **Cap-scenario merchant warnings** during discount creation — proactively alert when minimum purchase < discount value. No platform offers this today.
- **Contextual copy on "once per order" discount tags** — add "Applied to 1 eligible item" text when a single item receives the discount in a multi-item cart. No platform does this, but UX research supports it.
- **Side-by-side configured vs. actual values** in admin order details — show "₱82.00 applied (of ₱100.00 configured)" rather than requiring merchants to cross-reference the discount settings page.
- **Approaching-threshold messaging** — implement "Spend ₱X more to unlock this discount" natively, borrowing from BigCommerce's notification system.
- **PrestaShop's "Partial Use" concept** — when a discount exceeds the order total, optionally generate a new voucher for the remainder. This is a premium feature that only PrestaShop offers.

These five features would collectively position Prosperna ahead of most mid-market platforms and at parity with enterprise solutions on merchant-facing discount intelligence.

---

## Conclusion: where Prosperna stands and what to prioritize

Prosperna's discount feature sits at a critical intersection: the foundational standards are clear and well-established across the industry, but the advanced patterns — item selection logic, cap behavior communication, and merchant-facing intelligence — represent genuine competitive territory. The most impactful investments are (1) implementing highest-price-first item selection as the default algorithm, (2) building cap-scenario warnings into the discount creation flow, and (3) adding the configured-vs-actual value distinction in order details. These three changes alone would address the specific support ticket scenarios Prosperna has encountered while surpassing what Shopify, WooCommerce, and most competitors offer today. The broader pattern across the industry is a shift toward transparency and proactive communication — platforms that explain their discount logic clearly to both merchants and customers generate fewer support tickets and higher satisfaction.