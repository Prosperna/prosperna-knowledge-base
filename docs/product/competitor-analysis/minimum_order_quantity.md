---
id: minimum-order-quantity
title: Competitor Research - Minimum Order Quantity
sidebar_label: Minimum Order Quantity
sidebar_position: 1
---

This documentation contains a curated list of what are the possible features we can implement besides the minimum order quantity so that this basic feature would scale into a complete "Quantity Rules" feature in our Inventory Management module:

### PHASE 1: CORE MINIMUM ORDER QUANTITY

#### 1.1 Basic Quantity Rules

- Set minimum order quantity per product
- Set minimum order quantity per variant
- Set minimum order quantity per collection
- Auto-validation at cart level
- Checkout validation rules integration

#### 1.2 User Interface

- Simple rule creation interface
- Custom error messaging
- Auto-translation support for error messages

### PHASE 2: EXPANDED QUANTITY CONTROLS

#### 2.1 Maximum Limits

- Maximum order quantity per product/variant/collection
- Maximum order quantity per customer (prevent bulk buying/fraud)
- Re-purchase limits (limit total orders from same customer over time)

#### 2.2 Quantity Multiples

- Force purchases in specific increments (e.g., buy in multiples of 6, 12)
- Step quantity controls

#### 2.3 Specific Quantity Rules

- Exact quantity requirements
- Quantity ranges (min-max combined)

### PHASE 3: ADVANCED TARGETING & CONDITIONS

#### 3.1 Customer Segmentation

- Customer tag-based limits (e.g., wholesale vs retail)
- Logged-in vs guest restrictions
- Company/B2B customer rules
- VIP/subscriber-only product access

#### 3.2 Cart-Level Rules

- Cart total value limits (minimum/maximum)
- Cart weight limits
- Total cart item count restrictions

#### 3.3 Geographic & Market Controls

- Country blocking/restrictions
- State/province restrictions
- ZIP code blocking
- Market-specific rules
- Currency-based restrictions

### PHASE 4: VOLUME DISCOUNTS & INCENTIVES

#### 4.1 Quantity Breaks/Tiered Pricing (we partially have this -- "Wholesale Pricing" add-on)

- Automatic volume discounts (buy more, save more)
- Percentage-based discounts by tier
- Fixed amount discounts by tier
- Fixed price per unit at tiers

#### 4.2 Bundle & Upsell Features (we partially have this in the roadmap -- "Product Bundles" add-on)

- Product bundle deals
- "Buy X, Get Y" offers
- Cart upsells based on quantity
- Cross-sell suggestions at quantity thresholds

#### 4.3 Discount Display

- Discount badges/labels on product pages
- Price range display
- Savings calculator
- Collection page discount indicators

### PHASE 5: ANTI-FRAUD & BUSINESS PROTECTION

#### 5.1 Fraud Prevention

- Block $0 orders
- Bot detection and blocking
- Discount code abuse prevention
- Rate limiting per customer

#### 5.2 Inventory Protection

- Limited edition/stock management
- Prevent overselling
- Reserve inventory for specific customer segments

---

## Sources

#### Shopify Help Center

![Shopify Help Center - MOQ](/product/competitor-analysis/help-shopify-moq.png)

#### [Avada Order Limits Quantity](https://apps.shopify.com/avada-order-limit)

![Avada Order Limits Quantity](/product/competitor-analysis/avada-order-limit.png)

#### [Madgic Order Limits Quantity](https://apps.shopify.com/madgic-order-limits)

![Madgic Order Limits Quantity](/product/competitor-analysis/madgic-order-limits.png)

#### [OC Quantity Breaks Order Limit](https://apps.shopify.com/quantity-break-limit-purchase)

![OC Quantity Breaks Order Limit](/product/competitor-analysis/quantity-break-limit-purchase.png)

#### [Cart Lock:Block Checkout Rules](https://apps.shopify.com/cart-lock)

![Cart Lock:Block Checkout Rules](/product/competitor-analysis/cart-lock.png)

#### [Kaching Bundles Quantity Break](https://apps.shopify.com/bundle-deals)

![Kaching Bundles Quantity Break](/product/competitor-analysis/bundle-deals.png)
