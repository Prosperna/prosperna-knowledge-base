---
id: max-ai-featured-product
title: MaxAI Featured Product
sidebar_label: MaxAI Featured Product
sidebar_position: 7
---

# MaxAI Featured Product BRD

## Scope Note

This document is **cross-platform and implementation-complete**: it covers the MaxAI Product Agent's ability to insert featured product blocks into Page Builder pages, including the full integration across the merchant dashboard (prosperna1), AI backend (aina-service), and customer storefront (p1-customer). The focus is on observable user behavior, API contracts, and runtime hydration guarantees. This is primarily a **merchant-facing feature** (via MaxAI chat interface) with **customer-visible rendering** on published pages. It does NOT cover general product management, variant logistics, or inventory sync beyond what is necessary for featured product display.

---

## 1. Overview

### 1.1 Purpose

The MaxAI Featured Product feature enables merchants to use the Product Agent in MaxAI to insert embeddable product blocks into Page Builder pages through natural language requests. The AI agent generates preview HTML with pre-seeded product data, merchants approve or reject the placement, and upon approval, the storefront hydrates the block at runtime from live product inventory. This feature bridges AI-powered page design, merchant control, and real-time product data on the customer storefront.

### 1.2 Problem or Opportunity

Merchants want to showcase individual products on custom pages (homepages, promotional pages, landing pages) without manually coding HTML or managing product data synchronization. Previously, they either had to build pages from generic templates or spend time editing HTML directly. The featured product feature automates the insertion, preview, and approval workflow while ensuring live product data always renders on the customer storefront.

### 1.3 Success Measures

- Merchants can request product insertion through natural language in MaxAI (e.g., "Add this product to my homepage").
- The Product Agent generates a preview with product data pre-seeded (title, price, image, description, variants, stock).
- Merchants can approve or reject changes in a single UI action.
- The published storefront displays live product data (price, stock, variants) that updates when inventory changes.
- One featured product block per page is enforced to prevent duplicate product contexts.

---

## 2. Scope

### 2.1 In Scope

- **InsertProductViewTool**: AI tool in aina-service that merchants invoke to request product insertion with placement intent (e.g., "after the hero section," "inside the featured area").
- **Product block HTML generation**: Pre-seeded product data (title, price, image, description, variants, stock) rendered in the preview; runtime hydration replaces with live data on storefront.
- **Placement resolution**: Automatic or merchant-specified (via "Attach Element" UI) placement within page sections using data-aina-id anchors.
- **Replace vs. insert logic**: If a merchant selects a page section and says "replace," the product block replaces the section. Otherwise, it inserts after a reference point.
- **Contract guard validation**: Prevents code edits from breaking product block runtime hooks (data-maxai-product-field, cart controls, variant renders, add-ons).
- **One block per page enforcement**: Prevents multiple featured product blocks on the same page; merchants must delete or replace the existing block first.
- **EmbeddedProductView component**: Storefront runtime component that hydrates product blocks using product_id and store_location_id.
- **Deterministic store location fallback**: Three-step resolution (explicit prop → location cookie match → first location) ensures consistent product data for multi-location stores.
- **Price and stock formatting spec**: Shared between aina-service preview and p1-customer storefront for consistency (currency codes, sale/regular prices, stock labels).
- **Multi-currency support**: Product blocks respect store multi-currency settings when fetching and displaying prices.

### 2.2 Out of Scope

- **Inventory management**: This feature does not manage stock, pricing, or product variants; it only displays existing product data.
- **Product creation or editing**: The feature assumes products already exist; it does not create or modify products.
- **Dynamic product recommendations**: No related products, cross-sells, or AI-generated product suggestions.
- **A/B testing or analytics**: No built-in testing framework or conversion tracking for product blocks.
- **Theme customization of product blocks**: Product block styling is pre-defined; merchants cannot fully customize colors, fonts, or layout in this release.
- **Product reviews or ratings**: Product blocks do not display customer reviews or ratings.
- **Live chat or customer support integration**: No support chat tied to featured products.

### 2.3 Dependencies or Constraints

- **Page Builder must be open**: Merchants must have an active Page Builder page context before invoking InsertProductViewTool.
- **Product must be published**: Only published products can be inserted; trashed, deleted, or unpublished products are rejected with clear error messages.
- **Store location availability**: Products must be available for the merchant's active store location; the tool validates location flags (is_available_for_store_location, is_location_available, is_available_in_location).
- **Page must have editable section markers**: The target page must include data-aina-id attributes on sections for insertion points.
- **No pending changes**: If the Page Builder has pending changes waiting for approval, the InsertProductViewTool is blocked until approval or rejection.
- **Product data consistency**: Price and stock formatting must match the shared spec between aina-service and p1-customer to prevent display mismatches.
- **HTML parsing and DOM operations**: The tool uses BeautifulSoup and DOMParser for HTML manipulation; malformed HTML or edge cases may cause operation failures.

---

## 3. Functional Requirements

### FR-01: Invoke InsertProductViewTool from MaxAI Chat

**Description:**

Merchants request product insertion through natural language in the Product Agent chat. Example prompts include "Add this product to my homepage," "Feature this product in the hero section," or "Replace the banner with this product."

**Preconditions:**

- Merchant is in the Product Agent conversation.
- A Page Builder page is open (or the merchant has accessed a page context).
- The product to be inserted exists and is published.

**Main Flow:**

1. Merchant sends a message requesting product insertion (e.g., "Add product XYZ after the headline").
2. The AI recognizes the intent and invokes InsertProductViewTool with:
   - `product_id`: The product to insert (from context or attached product).
   - `placement_intent`: Natural language describing where to place the block (e.g., "inside the hero section after the headline").
   - `layout_intent` (optional): Layout preference (e.g., "compact promo card," "hero spotlight," "full-width feature").
   - `target_aina_id` (optional): Explicit page section ID if the merchant selected an element (e.g., via "Attach Element").
3. The tool validates the request, fetches product data, generates HTML, and returns a preview.
4. Merchant approves or rejects the change in the UI.

**Expected UI Behavior or Rules:**

- **Error states**:
  - "Please open or create a Page Builder page first" if no page context.
  - "I could not find that product. Please pick a valid product and try again." if the product ID is invalid.
  - "This product is in trash and cannot be inserted."
  - "This product is not published yet. Publish it first before inserting."
  - "This product is unavailable for the active storefront/location."
  - "This page already has a featured product block. Delete it first, or ask Max to replace the existing featured product with this one."
  - "Cannot edit this page while changes are pending approval. Please approve or reject current changes first."
  - "To replace an existing section with this product, select the target section first using 'Attach Element', or provide the section data-aina-id."
  - "I could not determine where to place the product block. Please be more specific."
- **Success flow**: Merchant sees a code-edit preview with the product block and can approve or reject.

---

### FR-02: Product Block HTML Generation with Pre-Seeded Data

**Description:**

The InsertProductViewTool generates product block HTML with pre-seeded product data: title, price, image, description, variants, add-ons, and stock label.

**Preconditions:**

- Product data has been fetched from P1ProductsService.
- Product is valid and usable (published, not trashed, location-available).

**Main Flow:**

1. The tool extracts product data:
   - **Image**: Primary image from product_specification.images[0]; fallback to Unsplash stock image if missing.
   - **Title**: From product_specification.name.
   - **Price**: Computed using shared spec (see BR-01).
   - **Short description**: From product_specification.short_description.
   - **Long description**: From product_specification.long_description or description.
   - **Stock label**: Computed using shared spec (see BR-02).
   - **Variants**: Rendered as color swatches (if with_color_variant) or disabled buttons; includes variant type name and options.
   - **Add-ons**: Rendered as disabled spans with pricing.
2. The tool escapes all text values using html.escape() to prevent injection.
3. The tool sanitizes CSS colors using SAFE_CSS_COLOR_RE (hex, rgb, rgba, hsl, hsla only).
4. The tool wraps the product block in a `<section>` with `data-maxai-product-view="true"` and `data-product-id` attributes.
5. The tool derives theme classes from the page anchor and parent elements (e.g., bg-*, text-*, py-*, px-*, border, rounded).
6. If no theme classes are found, default classes are applied (py-10 px-4, mx-auto max-w-6xl).

**Expected UI Behavior or Rules:**

- Product block structure includes:
  - Media section (image with lazy loading).
  - Content section (title, price, short description, long description, stock).
  - Variant display (color swatches or buttons).
  - Add-on display (if add-ons exist).
  - Action buttons: quantity controls, "Add to Cart" (disabled in preview), "Buy Now" (disabled in preview), "View Product" link.
- All buttons in preview mode are disabled with `aria-disabled="true"` and opacity 0.5 to indicate they are non-functional in the preview.
- The long description is rendered as a div (not escaped as plain text) to allow structured HTML if provided.

---

### FR-03: Placement Resolution and Insert vs. Replace Logic

**Description:**

The tool resolves where to place the product block using natural language intent, page structure, and optional merchant selection.

**Preconditions:**

- Page HTML contains data-aina-id attributes on sections (at minimum, a root section).
- Merchant has optionally selected a page element via "Attach Element" UI.

**Main Flow:**

1. **Determine intent**:
   - If placement_intent contains "replace," "swap," or "substitute" (case-insensitive), the tool enters replace mode.
   - If the merchant explicitly provided a target_aina_id, use that as the target.
   - Else, extract a data-aina-id from placement_intent (e.g., "replace section_hero_xyz" → target_aina_id = section_hero_xyz).
   - Else, fall back to the most recent page element aina_id from conversation context (if merchant previously selected an element).
2. **Resolve target**:
   - If a target is resolved, verify it exists in the page HTML; if not and replace mode is active, error with "I could not find section X."
   - If replace mode is active and a target is found, plan a `replace_element` operation.
3. **Resolve insertion point** (if not replacing):
   - If placement_intent starts with "before " → position = "before".
   - If placement_intent starts with "after " → position = "after".
   - If placement_intent contains "inside", "within", "in the", or "in this" → position = "last_child".
   - Else → position = "after" (default: insert after the last page-level section).
   - Find the reference_aina_id (the anchor for insertion):
     - If merchant selected a target, use it.
     - Else, extract the last page-level section (section, article, header, footer, or div with data-aina-id).
     - Else, use the root section if found.
     - Else, error: "This page is missing editable section markers."

**Expected UI Behavior or Rules:**

- **Replace mode errors**: "To replace an existing section with this product, select the target section first using 'Attach Element', or provide the section data-aina-id."
- **No reference anchor**: "This page is missing editable section markers. Please add a section with data-aina-id and try again."
- **Successful resolution**: Operation object is created (type: add_element or replace_element) with target_aina_id, reference_aina_id, position, and content.

---

### FR-04: One Featured Product Block Per Page Enforcement

**Description:**

The page can have at most one featured product block (marked with `data-maxai-product-view="true"`). If a merchant requests insertion when a block already exists, they must delete or replace it first.

**Preconditions:**

- Page HTML may contain a pre-existing product block.

**Main Flow:**

1. The tool scans the page HTML for existing blocks with `data-maxai-product-view="true"`.
2. If a block exists:
   - If the merchant is replacing that exact block, allow the operation.
   - Else, error with: "This page already has a featured product block. Delete it first, or ask Max to replace the existing featured product with this one."
3. If no block exists, allow insertion.

**Expected UI Behavior or Rules:**

- Merchants cannot accidentally add multiple product blocks; the error message is clear and actionable.

---

### FR-05: Contract Guard Validation and Repair

**Description:**

After code-edit operations are applied to a page with a product block, the ProductViewContractGuard validates and optionally repairs the HTML to ensure runtime hydration hooks are preserved.

**Preconditions:**

- Page HTML contains product block(s) with `data-maxai-product-view="true"`.
- Code-edit operations have been applied (e.g., editing text, changing colors, modifying elements).

**Main Flow:**

1. **Check for block removal**: If an operation intentionally removes a product block (type: remove_element or replace_element on the product block aina_id), allow it.
2. **Validate wrapper**: The product block must retain `data-maxai-product-view="true"`, `data-product-id`, and `data-aina-id`.
3. **Repair field attributes**: If elements inside the block are missing `data-maxai-product-field` attributes but have a matching class hint (e.g., maxai-product-title, maxai-product-price), restore the attribute.
4. **Validate required fields**: The block must include fields: image, title, price, short_description, link.
5. **Validate required control classes**: The block must include classes: add-to-cart-btn, cta-button, hero-variants, hero-addons, order-quanity, increment-order-qty-btn, decrement-order-qty-btn.
6. **Output**: If validation passes, return the (optionally repaired) HTML. If validation fails, raise ProductViewContractError with a specific message.

**Expected UI Behavior or Rules:**

- **Error states**:
  - "This edit would remove a dynamic product block. Keep the product block contract so storefront content can hydrate from inventory."
  - "This edit would remove data-maxai-product-view='true' from a dynamic product block."
  - "This edit would remove data-product-id from a dynamic product block."
  - "This edit would change the product ID of a dynamic product block. Insert a new product block instead."
  - "This edit would remove dynamic product field hooks: [list]. Preserve data-maxai-product-field attributes."
  - "This edit would remove product behavior hooks: [list]. Preserve cart, quantity, variant, and add-on hooks."
- **Repair behavior**: Missing data-maxai-product-field attributes are automatically restored if a class hint matches; merchants see a note that fields were repaired.
- **Success**: Validation passes, no errors, and the page is safe for storefront hydration.

---

### FR-06: Storefront Product Block Hydration with EmbeddedProductView

**Description:**

When a customer visits a page with a product block, the storefront runtime (p1-customer) hydrates the block with live product data using the EmbeddedProductView component.

**Preconditions:**

- Page HTML is rendered on the storefront (published).
- Product block is present with `data-maxai-product-view="true"` and `data-product-id` attributes.
- Product is still published and available for the store location.

**Main Flow:**

1. The page parser encounters the product block in HTML and invokes the EmbeddedProductView component.
2. EmbeddedProductView receives:
   - `productId` and `productSlug` (from data attributes).
   - `store_location_id` (resolved using three-step fallback; see FR-07).
   - Multi-currency flags and currency code (from store settings).
3. EmbeddedProductView calls `ProductAPI.useSingleStoreProduct` to fetch live product data.
4. **Rendering logic**:
   - **While loading**: Display the original HTML with spinner or placeholder.
   - **On success**: Replace placeholders with live data (title, price, stock, variants, add-ons).
   - **On error (product not found)**: Display "Product unavailable."
5. **Data hydration**:
   - Title, price, stock, variants, add-ons are updated in real time.
   - Product link (href) points to the product page (`/products/{slug}`).
   - Add to Cart and Buy Now buttons become functional (not disabled as in preview).
   - Customer can select variants, add to cart, and purchase.

**Expected UI Behavior or Rules:**

- **Loading state**: Original preview HTML is shown until product data arrives.
- **Error state**: "Product unavailable" if product cannot be fetched.
- **Success state**: Live product data is displayed; buttons are functional.
- **Live updates**: If a merchant updates product price or stock, the next page load reflects the change.

---

### FR-07: Deterministic Store Location Fallback for Multi-Location Stores

**Description:**

For merchants with multiple store locations, the storefront must resolve which location's product data to display. EmbeddedProductView uses a three-step deterministic fallback.

**Preconditions:**

- Merchant has multiple store locations configured.
- Customer is visiting the storefront (may have a location cookie set).

**Main Flow:**

1. **Step 1 (Explicit prop)**: If the component received an explicit store_location_id prop, use it.
2. **Step 2 (Location cookie match)**: If a location cookie is present, search StoreLocations for a match by storeSlug or id and use its id.
3. **Step 3 (First location fallback)**: If no match, use the first StoreLocations entry id and log a warning.
4. **Fallback if no locations**: Return empty string (no location context).

**Expected UI Behavior or Rules:**

- **Warning logged**: If Step 3 is used, console.warn logs: `[EmbeddedProductView] store_location_id not provided; falling back to first StoreLocation: {id}`.
- **Consistency**: The same location is used for all product fetches on the page.
- **Multi-currency**: Location-specific pricing is fetched if multi-currency is enabled for the store.

---

### FR-08: Price and Stock Formatting Consistency Spec

**Description:**

Price and stock labels must be formatted identically on the aina-service preview and the p1-customer storefront to prevent display surprises. This spec governs all computations.

**Preconditions:**

- Product data includes product_price, product_state, variant_combinations_price_range, and display_price fields.

**Main Flow:**

**Price Formatting:**

1. **Variant products** (product_state.is_product_has_variants === true):
   - Prefer `variant_combinations_price_range.min` and `variant_combinations_price_range.max`.
   - If min === max, display single price: `PHP 150.00`.
   - If min < max, display range: `PHP 150.00 – PHP 300.00`.
   - If only one bound is available, display that bound.
   - Else, fall back to `display_price` (if object, use sale_price || regular_price || regular_price_range; if numeric, format with currency).
   - Else, fall back to product_price (sale_price or regular_price, ignoring 0 as "no sale").
   - Else, return empty string.

2. **Non-variant products**:
   - Prefer `product_price.sale_price` (if > 0).
   - Else, prefer `product_price.regular_price`.
   - Else, fall back to `display_price` (using same logic as variants).
   - Else, return empty string.

3. **Currency code**:
   - Prefer `product_price.currency_code`.
   - Else, use `product_price.currency`.
   - Else, default to `'PHP'`.

4. **Number formatting**:
   - Use `Intl.NumberFormat` with `maximumFractionDigits: 2`.
   - Format as `{CURRENCY_CODE} {amount}` (e.g., `PHP 150.00`).

**Stock Formatting:**

1. If `product_state.is_always_in_stock` is true:
   - Preview (aina-service): Display "In stock".
   - Storefront (p1-customer): Display empty string (legacy behavior for backwards compatibility).

2. Else if `product_price.stock_quantity <= 0`:
   - Display "Out of stock".

3. Else if `stock_quantity === 1`:
   - Preview (aina-service): Display "1 in stock".
   - Storefront (p1-customer): Display "1 item left" (legacy behavior).

4. Else:
   - Preview (aina-service): Display `{N} in stock`.
   - Storefront (p1-customer): Display `{N} items left` (legacy behavior).

**Expected UI Behavior or Rules:**

- Preview and storefront price formats always match (both use "in stock" for consistency in preview).
- Stock labels may differ between preview ("N in stock") and storefront ("N items left") for backward compatibility but are logically equivalent.
- Currency is always visible in price; amount is always localized to 2 decimal places.

---

## 4. Acceptance Criteria

- Merchant can request product insertion via natural language (e.g., "Add product XYZ to my homepage").
- The InsertProductViewTool validates the product (published, not trashed, location-available).
- The tool generates product block HTML with pre-seeded data (title, price, image, description, variants, stock).
- The tool resolves placement using page structure and merchant intent (before/after/inside logic).
- One featured product block per page is enforced; merchant gets a clear error if trying to add a second.
- The ProductViewContractGuard validates and repairs the HTML after edits, preventing broken runtime contracts.
- Merchant approves the preview in the code-edit UI.
- On approval, the change is persisted to the Page Builder artifact.
- Customer storefront hydrates the block with live product data (EmbeddedProductView component).
- Price and stock labels match the shared formatting spec on both preview and storefront.
- Store location is resolved deterministically (explicit prop → location cookie → first location).
- All error states provide actionable error messages (product not found, not published, page locked, etc.).
- All text values in product blocks are HTML-escaped to prevent injection attacks.
- CSS color values are sanitized to prevent CSS injection or gradient attacks.
- Variants are rendered as color swatches (for color variants) or disabled buttons; add-ons are shown with pricing.

---

## 5. QA Test Scenarios

### Happy Path

1. **Insert product block with default placement**
   - Merchant opens a Page Builder page with sections marked with data-aina-id.
   - Merchant opens the Product Agent and says "Add product ABC123 to my homepage."
   - InsertProductViewTool generates a preview with product data.
   - Merchant approves the change.
   - Storefront displays the product block with live data.

2. **Replace existing section with product block**
   - Merchant selects a hero banner section via visual editor.
   - Merchant says "Replace this with product XYZ."
   - Tool finds the selected section and plans a replace_element operation.
   - Merchant approves; the banner is replaced with the product block.

3. **Insert product block with multi-location store**
   - Merchant has two store locations.
   - Customer visits storefront with location cookie set.
   - EmbeddedProductView resolves location from cookie.
   - Correct location's product data is fetched and displayed.

4. **Product block hydrates with live price update**
   - Product block is rendered on storefront with price PHP 150.00.
   - Merchant updates product price to PHP 200.00 in dashboard.
   - Customer refreshes page; new price is displayed.

5. **Variant product with price range**
   - Product has variants (Small, Medium, Large) with different prices.
   - Preview shows price range: PHP 150.00 – PHP 300.00.
   - Storefront displays same range until customer selects variant.

### Negative Path

1. **Product not published**
   - Merchant requests insertion of an unpublished product.
   - Tool errors: "This product is not published yet. Publish it first before inserting."

2. **Product unavailable for location**
   - Merchant's store location does not have the product in stock.
   - Tool errors: "This product is unavailable for the active storefront/location."

3. **Page already has product block**
   - Merchant tries to insert a second product block.
   - Tool errors: "This page already has a featured product block. Delete it first, or ask Max to replace the existing featured product with this one."

4. **No Page Builder context**
   - Merchant tries to insert product without opening Page Builder.
   - Tool errors: "Please open or create a Page Builder page first, then ask me to insert this product."

5. **Page has pending changes**
   - Merchant has unapproved code-edit operations pending.
   - Tool errors: "Cannot edit this page while changes are pending approval. Please approve or reject current changes first."

6. **Merchant breaks product block contract**
   - Merchant edits page and deletes the "Add to Cart" button from product block.
   - ProductViewContractGuard errors: "This edit would remove product behavior hooks: add-to-cart-btn... Preserve cart, quantity, variant, and add-on hooks."

7. **Replace intent without selection**
   - Merchant says "Replace the product" without selecting a target section.
   - Tool errors: "To replace an existing section with this product, select the target section first using 'Attach Element', or provide the section data-aina-id."

### Edge Cases

1. **Product with no image**
   - Product has no images in product_specification.
   - Tool uses Unsplash stock photo as fallback.
   - Storefront displays fallback image.

2. **Product with very long description**
   - Product has long_description with multiple paragraphs.
   - Tool escapes HTML and includes it in the block.
   - Storefront renders full description.

3. **Product with color variants but missing color data**
   - Variant has with_color_variant=true but no color value.
   - Tool uses fallback color (#cccccc).
   - Storefront displays muted swatch.

4. **Multi-currency enabled; currency code not in API response**
   - Multi-currency is enabled but product_price.currency_code is missing.
   - Tool defaults to 'PHP'.
   - Price is formatted as PHP {amount}.

5. **Product with 0 sale_price (treated as "no sale")**
   - Product has sale_price: 0 and regular_price: 100.
   - Tool ignores sale_price and uses regular_price.
   - Price displays as PHP 100.00 (not zero).

6. **Malformed page HTML (unclosed tags)**
   - Page HTML has unclosed tags or malformed sections.
   - BeautifulSoup parses with 'html.parser'; best-effort parsing is applied.
   - Tool attempts insertion; if it fails, error: "I could not place the product block in the current page layout."

7. **Customer visits storefront; product is later deleted from inventory**
   - Product block is cached in page HTML.
   - Merchant deletes the product.
   - Customer refreshes page; EmbeddedProductView errors: "Product unavailable."

---

## 6. BDD (Gherkin)

### Scenario: Insert Product Block and Approve in Page Builder

```gherkin
Feature: MaxAI Featured Product Insertion

Scenario: Insert a featured product block with merchant approval
  Given the merchant has opened a Page Builder page with sections marked with data-aina-id
  And the Product Agent is active in MaxAI
  And the product "ABC123" is published and available for the active store location
  When the merchant says "Add product ABC123 to my homepage"
  Then the InsertProductViewTool generates a product block with pre-seeded data
  And the product title, price, image, and stock label are displayed in the preview
  And the code-edit UI shows the new block and existing page HTML
  And the merchant clicks "Approve changes"
  Then the product block is added to the Page Builder page artifact
  And the pending change is cleared
  And when a customer visits the storefront
  Then the EmbeddedProductView component hydrates the block with live product data
  And the storefront displays the current product title, price, stock, and variants
```

### Scenario: Contract Guard Prevents Breaking Product Block

```gherkin
Feature: Product Block Contract Validation

Scenario: Merchant edits product block and contract guard rejects invalid change
  Given a page has a featured product block with required field and control hooks
  When the merchant uses code edit to delete the "Add to Cart" button class
  Then the CodeEditTool applies the operation and returns the modified HTML
  And the ProductViewContractGuard validates the modified HTML
  And the guard detects missing control class "add-to-cart-btn"
  Then the operation is rejected with error:
    | "This edit would remove product behavior hooks: add-to-cart-btn. Preserve cart, quantity, variant, and add-on hooks." |
  And the page remains unchanged
  And the merchant can retry with a non-breaking edit
```

### Scenario: Replace Page Section with Product Block

```gherkin
Feature: Replace Intent with Element Selection

Scenario: Merchant selects element and asks Max to replace with product
  Given the merchant has selected a hero banner section (data-aina-id="hero_banner")
  And the section is highlighted in the visual editor
  And the merchant says "Replace this with product XYZ"
  Then the InsertProductViewTool recognizes the replace intent
  And the tool uses the selected element's data-aina-id as the replacement target
  And the operation plan is type: "replace_element" with target_aina_id="hero_banner"
  When the merchant approves the change
  Then the hero_banner section is replaced with the product block
  And the page retains surrounding content
```

### Scenario: Multi-Location Store Hydration

```gherkin
Feature: Store Location Fallback in Multi-Location Stores

Scenario: Product block hydrates with location-aware product data
  Given the merchant has store locations "New York" and "Los Angeles"
  And the product is available in both locations with different prices
  And the customer has a location cookie set to "New York"
  When the EmbeddedProductView component mounts
  Then it resolves store_location_id from the location cookie
  And it calls ProductAPI.useSingleStoreProduct with store_location_id="ny"
  And the returned product data includes New York's price and stock
  Then the storefront displays New York pricing
```

### Scenario: Prevent Duplicate Product Blocks

```gherkin
Feature: One Featured Product Per Page

Scenario: Merchant attempts to add a second product block to a page
  Given the page already has a featured product block (product_id="A")
  And the merchant is not replacing it (no target selected)
  When the merchant says "Add product B to this page"
  Then the InsertProductViewTool detects the existing product block
  And checks if the merchant is replacing product A (they are not)
  Then the tool errors:
    | "This page already has a featured product block. Delete it first, or ask Max to replace the existing featured product with this one." |
  And no preview is shown
  And the merchant must delete or replace the existing block first
```

---

## 7. Business Rules

- **BR-01: Price Formatting**: Price must be computed identically on aina-service preview and p1-customer storefront. Variant products use variant_combinations_price_range; non-variants use product_price.sale_price or regular_price. Currency code defaults to 'PHP' if not provided. Sale price of 0 is treated as "no sale."

- **BR-02: Stock Label Formatting**: Stock labels must be identical on preview and storefront for the same product data. "In stock" for is_always_in_stock=true; "N in stock" or "Out of stock" based on stock_quantity. Storefront may use legacy "items left" phrasing for backward compatibility, but the semantics are the same.

- **BR-03: One Block Per Page**: A page can have at most one featured product block. Merchants must explicitly delete or replace a block before adding a new one. This prevents product context confusion and keeps page designs clean.

- **BR-04: Product Block Contract**: The product block must retain specific data attributes (data-maxai-product-view, data-product-id) and field hooks (data-maxai-product-field) for storefront runtime hydration. Code edits that remove these hooks are rejected by ProductViewContractGuard.

- **BR-05: Product Eligibility**: Only published products available for the merchant's active store location can be inserted. Trashed, deleted, or unpublished products are rejected with clear error messages.

- **BR-06: Location Fallback**: Multi-location stores resolve store_location_id deterministically (explicit prop → location cookie match → first location). This ensures consistent product data display and prevents mismatches between preview and storefront.

- **BR-07: No Pending Changes**: InsertProductViewTool is blocked if the Page Builder page has unapproved code-edit operations. Merchants must resolve pending changes before inserting a new product block.

- **BR-08: HTML Escaping and Sanitization**: All product data inserted into HTML (title, description, add-on names) are HTML-escaped to prevent injection. CSS color values are validated against a safe whitelist (hex, rgb, rgba, hsl, hsla) to prevent CSS injection.

- **BR-09: Runtime Hydration**: Storefront product blocks are hydrated by EmbeddedProductView with live product data. Preview data is seeded for merchant approval; live data replaces it at render time. If the product is no longer available, "Product unavailable" is displayed.

---

## 8. Open Questions

- **Custom styling of product blocks**: Should merchants be able to customize the product block's color scheme, font, or layout beyond the automatic theme derivation? (Currently out of scope; only automatic theme matching is implemented.)

- **Product recommendations or related products**: Should the product block display related products or recommendations? (Currently out of scope; only single-product insertion is supported.)

- **A/B testing**: Should merchants be able to A/B test different product placements or designs? (Currently out of scope; no built-in testing framework.)

- **Review ratings on product blocks**: Should customer reviews or ratings be displayed in the product block? (Currently out of scope; reviews are not included.)

- **Inventory warnings**: Should merchants receive warnings if a featured product goes out of stock? (Currently out of scope; no proactive alerting is implemented.)

- **Bulk product insertion**: Can merchants insert multiple products on a single page? (No; one block per page is enforced.)

---

## 9. Summary

The **MaxAI Featured Product** feature enables merchants to showcase individual products on custom Page Builder pages through a natural language request in the Product Agent. The AI backend (aina-service) generates embeddable product blocks with pre-seeded data for merchant preview and approval. Upon approval, the storefront (p1-customer) hydrates these blocks with live product data at render time, ensuring prices, stock, and inventory information are always current.

**Key User Value:**
- Merchants can insert products without writing HTML or manually managing product data.
- Customers see live, up-to-date product information on the storefront.
- The feature prevents broken product displays by validating and guarding the product block contract during page edits.

**Main Scope Boundaries:**
- One featured product block per page (no duplicates).
- Only published, location-available products can be inserted.
- Product block styling is automatically derived from the page theme; full customization is out of scope.
- No product recommendations, reviews, or A/B testing in this release.

**Cross-Platform Handoff:**
- **prosperna1 (Dashboard)**: Code-edit preview UI, merchant approval/rejection of product block changes.
- **aina-service (AI Backend)**: InsertProductViewTool, ProductViewContractGuard, product block HTML generation.
- **p1-customer (Storefront)**: EmbeddedProductView component, location resolution, runtime hydration, price/stock formatting.

---

**Document Version:** 1.0
**Created:** May 2026
**Status:** Draft – Ready for QA and implementation review
