---
id: multi-currency
title: Comprehensive Currency Feature Analysis Across Major eCommerce Platforms
sidebar_label: Multi-Currency
sidebar_position: 4
---

**Every major eCommerce platform treats currency fundamentally differently, from Shopify's market-based multi-currency system requiring Shopify Payments, to Wix and Squarespace's single-transaction currency models.** Understanding these patterns reveals critical design decisions: whether to support true multi-currency checkout versus display-only conversion, how to handle the permanent nature of gift card currency, and the cascading effects of base currency changes on historical data. This analysis synthesizes official documentation from 9 platforms to provide a foundation for designing Prosperna's currency feature.
**Every major eCommerce platform treats currency fundamentally differently, from Shopify's market-based multi-currency system requiring Shopify Payments, to Wix and Squarespace's single-transaction currency models.** Understanding these patterns reveals critical design decisions: whether to support true multi-currency checkout versus display-only conversion, how to handle the permanent nature of gift card currency, and the cascading effects of base currency changes on historical data. This analysis synthesizes official documentation from 9 platforms to provide a foundation for designing Prosperna's currency feature.

---

## 1. Research overview

### Platforms researched and sources consulted

| Platform | Primary Sources | Documentation Quality |
|----------|----------------|----------------------|
| **Shopify** | help.shopify.com, shopify.dev | Excellent - comprehensive multi-currency docs |
| **BigCommerce** | developer.bigcommerce.com, support.bigcommerce.com | Excellent - detailed API and operational docs |
| **WooCommerce** | woocommerce.com/document, developer.woocommerce.com | Good - extensive plugin ecosystem documented |
| **Magento/Adobe Commerce** | experienceleague.adobe.com, developer.adobe.com | Good - enterprise-grade documentation |
| **Wix eCommerce** | support.wix.com, dev.wix.com | Good - clear limitations documented |
| **Squarespace Commerce** | support.squarespace.com, developers.squarespace.com | Moderate - single currency focus |
| **Ecwid** | support.ecwid.com, docs.ecwid.com | Good - API well documented |
| **Dukaan** | help.mydukaan.io, mydukaan.io | Limited - regional focus on India |
| **Zoho Commerce** | zoho.com/commerce/help, zoho.com/commerce/api | Good - ecosystem integration documented |

### Key limitations in available information

Several platforms lack explicit documentation on **what happens to existing orders when base currency changes**, **data migration procedures**, and **performance benchmarks for multi-currency operations**. This report explicitly notes where "No data found" applies rather than making assumptions.

---

## 2. Currency feature scope and impact analysis

### Table A: Features that AUTOMATICALLY update when currency changes

| Feature | Shopify | BigCommerce | WooCommerce | Magento | Wix | Squarespace | Ecwid | Dukaan | Zoho | What PROSPERNA should DO |
|---------|---------|-------------|-------------|---------|-----|-------------|-------|--------|------|--------------------------|
| **Product price display (symbol)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Product price value (conversion)** | ❌ (same number) | ❌ | ❌ | ✅ (display only) | ❌ | ❌ | ❌ | ❌ | ✅ (display only) | ❌ (same number) |
| **Currency formatting** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| **Flat shipping rates** | ❌ | ✅ | ❌ | ❌ | N/D | N/D | N/D | N/D | N/D | ❌ |
| **Fixed-amount discounts (symbol)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/D | ✅ | ✅ |
| **Market currencies (third-party)** | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

**Key insight**: Most platforms change the currency symbol but **do not convert numerical values**. Shopify explicitly states: "A product that was listed as 20 USD is now listed as 20 CAD" with no automatic conversion.

### Table B: Features that do NOT automatically update

| Feature | Shopify | BigCommerce | WooCommerce | Magento | Wix | Squarespace | Ecwid | Dukaan | Zoho | What PROSPERNA should DO |
|---------|---------|-------------|-------------|---------|-----|-------------|-------|--------|------|--------------------------|
| **Existing/historical orders** | ✅ Retained | ✅ Retained | ✅ Retained | ✅ Retained | N/D | ✅ Retained | ✅ Retained | N/D | ✅ Retained | ✅ Retained |
| **Gift card balances** | ❌ Invalidated | N/D | N/D | N/D | ❌ Invalidated | ❌ Blocks change | N/D | N/D | N/D | Not Applicable |
| **Shipping rates** | ❌ Must recreate | N/D | N/D | N/D | N/D | N/D | N/D | N/D | N/D | ❌ Must recreate |
| **Historical pricing records** | ❌ Not preserved | ❌ Unchanged | N/D | N/D | N/D | N/D | N/D | N/D | N/D | ❌ Not preserved |
| **Store credit** | N/A | ❌ Default only | N/D | N/D | N/D | N/D | N/D | N/D | N/D | Not Applicable |
| **Coupons** | N/A | ❌ Default only | N/D | N/D | N/D | N/D | N/D | N/D | N/D | Already in discounts |
| **Existing subscriptions** | ✅ Original rate | N/D | ✅ Original price | N/D | N/D | ✅ Original terms | N/D | N/D | N/D | ✅ Original rate, but not a priority | 

**Critical finding**: **Gift cards represent the most problematic currency change scenario**. Shopify invalidates gift cards with remaining balances. Squarespace **completely blocks currency changes** after any gift card sale, including test orders. Wix gift cards purchased in old currency become non-redeemable.

### Table C: Features with CONDITIONAL behavior

| Feature | Condition | Platforms with Documentation | What PROSPERNA should DO |
|---------|-----------|------------------------------|--------------------------|
| **Refunds** | Exchange rate at time of refund (not original transaction) | Shopify, WooCommerce, BigCommerce | Not Applicable |
| **Pending payments** | Must be resolved before currency change | Shopify | Must DO this |
| **Cart currency** | Locks when first item added (requires cart deletion) | BigCommerce | Must DO this |
| **App compatibility** | Depends on app's currency support | Shopify, BigCommerce | Not Applicable |
| **Analytics/Reports** | Converted to store currency with historical rates | Shopify, WooCommerce | Must DO this |
| **Subscription renewals** | Use original currency/rate unless explicitly updated | Shopify, WooCommerce, Squarespace | Original rate, but not a priority | 
| **Payment provider markets** | All markets update to new currency with third-party providers | Shopify | Not Applicable |

---

## 3. Special conditions, considerations, and constraints

### 3.1 Legal and tax implications

**Shopify's explicit guidance**: "Before you change your store currency, you need to review any potential legal or tax implications involved with selling in a currency that is different from the one associated with the country where your store is located... Check with a legal expert to verify there are no legal implications."

**WooCommerce's disclaimer**: "We are not tax professionals; our advice only applies to how to use our software. For advice on what—or when—to charge tax/VAT/GST etc., we recommend consulting a tax professional or accountant."

**Magento's tax handling**: "Tax rates vary by market. At checkout, if a customer changes the shipping address to an address that's outside the market, then the correct tax rate for the customer's shipping address is charged."

### 3.2 Payment provider compatibility requirements

| Platform | Payment Provider Requirement |
|----------|------------------------------|
| **Shopify** | **Shopify Payments REQUIRED** for multi-currency selling; third-party providers force all markets to single currency |
| **BigCommerce** | Multi-currency payment gateway required (Stripe, PayPal, Adyen, Elavon supported) |
| **WooCommerce** | Gateway must be configured for each currency; Square requires exact currency match |
| **Wix** | Wix Payments currency locked by business location; PayPal/Stripe must match store currency |
| **Squarespace** | PayPal not available for 8 currencies (BRL, COP, INR, IDR, MXN, MYR, NZD, ZAR); dual processors must both support chosen currency |
| **Ecwid** | Currency must match between Ecwid account and payment provider |
| **Dukaan** | India stores: Dukaan Pay, Razorpay, PhonePe; International: Stripe, PayPal, Braintree |
| **Zoho** | Razorpay only processes INR; Authorize.net limited to USD, CAD, EUR, GBP |

### 3.3 Multi-currency capabilities by platform

| Platform | True Multi-Currency Checkout | Display-Only Conversion | Method |
|----------|------------------------------|-------------------------|--------|
| **Shopify** | ✅ Yes (with Shopify Payments) | ✅ Yes | Shopify Markets + local currencies |
| **BigCommerce** | ✅ Yes (transactional currencies) | ✅ Yes (active currencies) | Built-in multi-currency |
| **WooCommerce** | ✅ Yes (via WooPayments/extensions) | ✅ Yes | Extensions required |
| **Magento** | ❌ Base currency only (default) | ✅ Yes | Display currencies per store view |
| **Wix** | ❌ No | ✅ Yes | Currency Converter widget |
| **Squarespace** | ❌ No | ❌ No (manual workaround) | Single currency only |
| **Ecwid** | ❌ No | ✅ Yes (apps) | Currency converter apps |
| **Dukaan** | ❌ No | ❌ No | Separate store per country required |
| **Zoho** | ✅ Limited (2-5 currencies by plan) | ✅ Yes (160+ currencies) | Plan-based limits |

**Critical distinction**: "Display-only" means customers **see** prices in local currency but **pay** in the store's base currency. Wix explicitly states: "The currency converter changes the display currency on your site. It doesn't change the currency of sale transactions."

### 3.4 Currency conversion and exchange rates

| Platform | Automatic Rate Updates | Manual Rate Entry | Rate Source |
|----------|------------------------|-------------------|-------------|
| **Shopify** | ✅ Every 15 minutes (checked) | ✅ For single-country markets | Shopify's rates + conversion fee (~1.5%) |
| **BigCommerce** | ✅ Via API | ✅ Yes | Merchant-configurable |
| **WooCommerce** | ✅ Via WooPayments | ✅ Yes | WooPayments server, OpenExchangeRates, CurrencyLayer |
| **Magento** | ✅ Daily/weekly/monthly scheduled | ✅ Yes | Fixer API (APILayer), Currency Converter API |
| **Wix** | ✅ Daily | ❌ No | XE exchange rates |
| **Ecwid** | ❌ No (manual USD rate only) | ✅ Yes | Manual entry for USD conversion |
| **Zoho** | ✅ Exchange rate feeds | ✅ Yes | Automatic or manual |

**Shopify's conversion formula**: `(Product price × currency conversion rate) × (1 + currency conversion fee)`. Example: `($10.00 USD × 0.867519) × (1 + .015) = €8.81`

### 3.5 Key limitations and restrictions by platform

**Shopify limitations**:
- POS does **not** support local currencies (store currency only)
- Gift card values always in store currency; rounding rules don't apply
- Discount codes cannot be currency-specific
- Manual exchange rates cannot apply to primary market

**BigCommerce critical warning**: "Do not change the default currency—this may lead to unintended currency conversion issues. Changing the default currency will NOT trigger price recalculation for the catalog."

**Wix limitations**:
- Cannot display different currencies per language in multilingual sites
- Cannot change currency format from symbols to codes (USD vs $)
- USPS live rates only available for US stores in USD
- Business/Business Elite plan required for currency converter

**Squarespace's gift card lock**: "It's not possible to change your store's currency after selling a gift card, including when it's sold as part of a test order."

**Ecwid's single-currency model**: "You can set only one currency for your store... one Ecwid account can support only one currency, although you can use an app to show prices in alternative currencies."

### 3.6 Data migration and historical records

**Shopify's recommended pre-change actions**:
1. Export products to CSV to create pricing backup
2. Export discount codes to CSV for history
3. Resolve all pending payments

**Post-change required actions**:
1. Review and update all product pricing
2. Adjust discounts for new currency
3. Delete and recreate shipping rates manually
4. Issue new gift cards to customers with remaining balances

**BigCommerce's historical order handling**: Orders store both `default_currency_code` (transactional) and `currency_code` (display), along with `base_to_order_rate` for conversion reference.

---

## 4. Currency feature operations

### 4.1 Setting default/primary currency

| Platform | Path | Prerequisites | Notes |
|----------|------|---------------|-------|
| **Shopify** | Settings > General > Store defaults | Store owner only | Initial setup or change via same path |
| **BigCommerce** | Settings > Setup > Currencies | Multi-currency payment gateway | **Warning: Do not change after transactions begin** |
| **WooCommerce** | WooCommerce > Settings > General > Currency options | None | Single currency native; extensions for multi |
| **Magento** | Stores > Configuration > General > Currency Setup | Set Catalog Price Scope first | Can be Global or Website level |
| **Wix** | Dashboard > Settings > Language & Region > Currency | Payment processor connected | Automatic based on payment processor |
| **Squarespace** | Payments Settings > Store Currency | Payment processor connected | Auto-updates from payment processor |
| **Ecwid** | Settings > General > Regional Settings | None | Single currency per store |
| **Dukaan** | Store setup > Country selection | None | Currency determined by country |
| **Zoho** | Organization settings during creation | None | Via API: `currency_code` parameter |

### 4.2 Adding additional currencies

**Shopify (Markets)**:
1. Settings > Markets > Click market > Products and pricing
2. Select "Show prices to customers in their local currency"
3. Requires Shopify Payments active

**BigCommerce**:
1. Settings > Setup > Currencies
2. Select "Add a Currency..."
3. Configure as display-only (active) or transactional
4. Note: "Transactional currencies can't be created via API"

**Magento**:
1. Stores > Configuration > Currency Setup > Allowed Currencies
2. Configure exchange rates at Stores > Currency > Currency Rates
3. Refresh cache

**Zoho Commerce**:
1. Settings (Gear icon) > Currencies > + New Currency
2. Select currency code; symbol/format auto-populate
3. Enable Currency Conversion for storefront display

### 4.3 Changing/updating store currency

**Shopify step-by-step**:
1. From admin, go to Settings > General
2. In Store defaults section, click "..." and select "Change store currency"
3. Select new currency from list
4. Click Save

**Pre-change impact assessment** (Shopify requirements):
- Review legal/tax implications
- Verify third-party payment provider supports new currency
- Export product and discount data
- Resolve pending payments
- Plan for gift card reissuance

**BigCommerce warning**: "Changing the default currency will NOT trigger price recalculation for the catalog. Additionally, changing the default currency will enable the newly assigned currency as transactional."

### 4.4 Removing currencies

| Platform | Process | Restrictions |
|----------|---------|--------------|
| **Shopify** | Markets > Preferences > Deactivate local currencies | Cannot remove store currency |
| **BigCommerce** | DELETE API endpoint or Control Panel | Cannot delete default currency |
| **Magento** | Remove from Allowed Currencies list | Cannot remove base currency |
| **Zoho** | Settings > Currencies > Trash icon | Cannot delete base currency |

### 4.5 Currency display and formatting options

**Shopify formatting**:
- Path: Settings > General > Change currency formatting
- Options: `{{amount}}`, `amount_no_decimals`
- Note: "Currency formatting settings only apply to your store's base currency"

**Ecwid configurable options**:
- Currency prefix/suffix (symbol position)
- Decimal precision (e.g., 2 for USD, 0 for JPY)
- Thousands separator (space, dot, comma, none)
- Decimal separator (dot or comma)
- Hide trailing zeros option

**Squarespace limitation**: "Some form fields currently only support United States number and currency formatting, even on sites set to other languages."

### 4.6 Currency switching for customers

**Automatic detection methods**:
- **Shopify**: Domain redirection based on browser location; Geolocation apps for recommendations
- **Wix**: Currency converter auto-detects customer location (note: "Geolocation is not always 100% accurate and can be incorrect due to customer use of VPNs")
- **WooCommerce**: Geolocation option in Multi-Currency settings
- **BigCommerce**: IP-based display with manual override

**Manual selection methods**:
- Currency selector in header/footer (all platforms with multi-currency)
- Menu item integration (WooCommerce, Wix)
- Block/widget placement (WooCommerce, Wix)

**Persistence behavior**:
- **Shopify**: 14-day recommendation cooldown; session ends after 30 minutes of inactivity
- **WooCommerce**: Customer preference stored in My Account > Account Details
- **BigCommerce**: Cart currency locks when first item added; requires emptying cart to change

### 4.7 Bulk operations and data management

**API capabilities for bulk updates**:

| Platform | Bulk Price Update | Currency Export/Import | Rate Automation |
|----------|-------------------|------------------------|-----------------|
| **Shopify** | CSV export/import | Via product export | GraphQL `priceList` mutations |
| **BigCommerce** | Price Lists API (Enterprise) | CSV via Control Panel | API for rate updates |
| **WooCommerce** | CSV export/import | Plugin-dependent | API providers supported |
| **Magento** | Admin import/export | Scheduled rate imports | Fixer API integration |

---

## 5. Integration and technical considerations

### 5.1 API and developer capabilities

**Shopify API endpoints**:
- REST: `GET /admin/api/2026-01/currencies.json` (legacy as of Oct 2024)
- GraphQL: `Market`, `MarketCurrencySettings`, `marketCreate`, `marketCurrencySettingsUpdate`
- Storefront API: `@inContext(country: countryCode)` directive for international pricing
- Liquid: `currency` object with ISO code, name, symbol

**BigCommerce API endpoints**:
- `GET/POST/PUT/DELETE /v2/currencies/{id}` - Full CRUD operations
- `GET/PUT /v3/channels/{channel_id}/currency-assignments` - Channel-specific currencies
- `POST /v3/pricelists/{price_list_id}/records/{variant_id}/{currency_code}` - Price by currency
- Webhook: `store/information/updated` triggers on currency change

**WooCommerce hooks and filters**:
```php
add_filter('woocommerce_currency_symbol', 'change_currency_symbol', 10, 2);
```
- Store API includes full currency object in responses
- Order query: `wc_get_orders(array('currency' => 'USD'))`

**Magento GraphQL**:
```graphql
{
  currency {
    base_currency_code
    default_display_currency_code
    available_currency_codes
    exchange_rates { currency_to rate }
  }
}
```

**Ecwid JS API**: `Ecwid.formatCurrency(12.99)` returns formatted price string

### 5.2 Third-party app/plugin ecosystem

**Shopify app compatibility**:
- Apps built by Shopify continue working with currency changes
- Incompatible apps highlighted under Settings > Apps and sales channels
- "Apps that display monetary values need testing" after enabling multi-currency

**BigCommerce Checkout SDK**: "Works with multi-currency. There is no additional setup needed."

**WooCommerce extension compatibility** (officially documented):
- WooCommerce Subscriptions, Product Bundles, Dynamic Pricing
- Smart Coupons (with Aelia Currency Switcher)
- Conditional Shipping and Payments (for gateway restrictions by currency)

**Magento known issues requiring patches**:
- MDVA-33970: Currency sign in credit memo (website scope)
- ACSD-42807: Custom currency sign not displayed (fixed in 2.4.6)

### 5.3 Performance and scalability considerations

**Rate update frequency**:
- Shopify: Checked every 15 minutes, typically updated a few times daily
- WooCommerce: Free API plans support 12-hour update intervals
- Magento: Configurable connection timeout (default 100 seconds)

**Caching compatibility**:
- **WooCommerce**: YayCurrency has "Compatible with cache plugins" option
- **WooCommerce (Aelia)**: "We don't use sessions because they often cause the database to grow quickly and the site to slow down"

**MultilingualPress (WooCommerce) performance note**: "Avoid performance loss. Adding several language versions of the same product to the same website can result in performance loss."

---

## Design patterns and recommendations for a new platform

### Proven patterns across platforms

1. **Separation of base currency and display currency**: Magento's model distinguishes base currency (transactions), display currency (storefront), and allowed currencies (customer choice). This provides maximum flexibility.

2. **Currency scope hierarchy**: Magento's Global > Website > Store View scope allows different configurations at different levels without duplication.

3. **Cart currency locking** (BigCommerce): Prevents mid-shopping currency switches that could cause confusion or exploitation.

4. **Explicit fixed pricing over conversion** (BigCommerce Enterprise, Shopify): Allow merchants to set exact prices per currency rather than relying solely on exchange rates.

### Common pitfalls to avoid

1. **Gift card currency handling**: Squarespace's complete block after any gift card sale is extreme but prevents customer service issues. At minimum, require explicit merchant acknowledgment before currency changes.

2. **Assuming automatic price conversion**: Every platform studied keeps numerical values unchanged when switching currency symbols—merchants must manually update prices.

3. **Third-party payment provider complexity**: Shopify's requirement for Shopify Payments for full multi-currency functionality creates vendor lock-in but ensures consistent behavior.

4. **Store credit and coupons in single currency**: BigCommerce's limitation where store credit and coupons only work in default currency creates customer experience issues.

### User expectations based on established platforms

- **Customers expect** to see prices in local currency (display-only is acceptable)
- **Merchants expect** clear warnings about irreversible changes
- **Both expect** existing subscriptions to honor original terms
- **All platforms require** payment provider currency matching—this cannot be avoided

### Technical architecture considerations

1. **Store currency codes per order**: All platforms store `currency_code` with each order to maintain historical accuracy
2. **Dual totals storage**: BigCommerce stores both base currency total and order currency total for reporting flexibility
3. **Rate history**: Magento and Zoho support exchange rate history for organizations not using automatic feeds
4. **Webhook notifications**: BigCommerce's `store/information/updated` webhook pattern enables real-time integration updates

---

## Conclusion

The most sophisticated currency implementations come from **Shopify** (via Markets with Shopify Payments requirement), **BigCommerce** (transactional vs. active currency distinction), and **Magento** (flexible scope-based configuration). Simpler platforms like **Wix**, **Squarespace**, and **Ecwid** deliberately chose single-transaction currency models to reduce complexity, relying on display-only converters for international appeal.

**Three non-negotiable design requirements** emerge from this analysis: (1) store currency information with every order for historical accuracy, (2) implement explicit handling for gift cards before any currency change, and (3) require payment provider currency verification before enabling any currency. The **biggest gap** across all platforms is comprehensive documentation on what happens to existing data during currency transitions—a new platform should prioritize clear, explicit behavior documentation for all affected modules.

The choice between true multi-currency checkout versus display-only conversion represents the fundamental architectural decision. True multi-currency requires significantly more complexity in payment provider integration, reporting, and refund handling, but meets customer expectations for international commerce. Display-only conversion is simpler to implement and maintain but may create checkout abandonment when customers discover they'll be charged in a different currency than displayed.