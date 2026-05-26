---
id: unified-max-builder
title: BRD. Unified Max Builder
sidebar_label: Unified Max Builder
sidebar_position: 4
---

## Scope Note

This document is **cross-platform and architecture-complete**: it covers the unification of the Menu Editor, Footer Builder, and Page Builder into a single conversational AI widget, spanning all four repositories — `aina-service` (AI backend), `page-service-api` (database API), `prosperna1` (merchant dashboard), and `p1-customer` (customer storefront). The focus is on observable merchant and customer behavior, data flow contracts, and testable system states. This is primarily a **merchant-facing feature** (via MaxAI chat interface) with **customer-visible rendering** on published storefronts. It does NOT cover product management, order flows, payment processing, or subscription billing beyond what is necessary for the unified builder experience.

---

## 1. Overview

### 1.1 Purpose

The Unified Max Builder consolidates three previously separate editing systems — the Menu Editor (50+ atomic tools, 1,300-line state machine), the Footer Builder (conversational HTML injection), and the Page Builder (HTML/Tailwind page body generation) — into a single conversational AI widget. Merchants interact with one chat interface; the system automatically classifies their edit intent and routes it to the correct section scope. Navigation headers, page bodies, and footers are composed into a single unified preview iframe, edited conversationally, and split apart at publish time for permanent storage.

The feature eliminates ~15,000 lines of legacy code across all repositories while delivering a superior editing experience: live cross-page synchronization, version history, design preference onboarding, and structural validation of AI-generated navigation HTML.

### 1.2 Problem or Opportunity

Previously, merchants editing their storefronts navigated three distinct systems with completely different data structures, prompt systems, rendering contexts, and styling paradigms. The Menu Editor alone comprised over 50 individual tools and a 1,300-line state machine. This fragmentation prevented merchants from seeing a holistic, live preview of their store and resulted in a disjointed experience where navigation, body, and footer edits occurred in isolation. Style inconsistencies between sections were common, and there was no way to preview the full page as customers would see it.

### 1.3 Success Measures

- Merchants edit navigation, body, and footer from a single conversational widget without switching tools.
- The unified preview iframe renders all three sections together, reflecting edits in real time.
- Navigation edits propagate instantly across all pages via shared Redis keys.
- Published storefronts render Max templates (Tier 1) with functional interactive components (cart, search, profile, location, currency).
- Legacy Menu Editor widget, state machine, and SCSS (~4,600 lines in `prosperna1`) are fully removed with no regressions.
- New merchants complete onboarding with a design preference form and receive a generated home page (nav + footer + body) in a single pipeline.

---

## 2. Scope

### 2.1 In Scope

- **Unified conversational widget**: Single Page Builder chat interface replaces the Menu Editor widget, footer editor, and body editor.
- **IntentClassifier service**: Classifies merchant messages into `menu` (nav), `footer`, or `page` (body) scope and loads section-specific prompts.
- **Single source of truth Redis model**: Shared versioned keys (`max_nav:{store_id}:v{N}`, `max_footer:{store_id}:v{N}`) with head pointers for global nav and footer.
- **Document Composer**: Assembles body, nav, and footer into a single valid HTML5 document with `data-aina-id` attributes for DOM targeting.
- **Document Splitter**: Splits the unified document into nav, body, and footer sections with head preservation for styling resources.
- **NavContractGuard**: Post-edit validation of AI-generated navigation HTML with auto-repair for `data-max-fn` function skeletons, modal synchronization, and structural integrity.
- **Nav Function Skeletons**: Predefined HTML templates for cart, search, profile, location, and currency components.
- **Design Preference Form**: Onboarding widget for merchants to express color, layout, and visual style preferences before AI generation.
- **Page Plan Architect**: Multi-stage LLM pipeline (plan, art direction, HTML generation, visual audit, designer review) for home page generation.
- **Unified publish flow**: Single-pass Tailwind CSS compilation, section splitting, and atomic storage to MongoDB (nav/footer templates) and S3 (page body).
- **Page Version History**: Version dropdown for navigating and reverting to prior page artifact versions with staged reversion.
- **Approval and rejection (rollback)**: Pre-edit version tracking with pointer reversion and orphaned key cleanup on rejection.
- **Atomic MongoDB operations**: `ensureMaxTemplate` using `findOneAndUpdate(upsert: true)` to prevent duplicate templates during concurrent publishes.
- **Three-tier storefront header fallback**: Max template (Tier 1) → JSON mega menu (Tier 2) → Default system header (Tier 3).
- **Storefront footer rendering**: Max footer template (Tier 1) → StoreFooter/CopyrightFooter (Tier 2), rendered on all pages including system pages.
- **Storefront hydration**: `html-react-parser` replaces `data-max-fn` placeholders with live React components (Cart, Search, ProfileDropdown, StoreLocationDropdown, CurrencyDropdown).
- **Tailwind `hidden` class handling**: Retained as-is during preview; renamed to `aina-hidden` during CSS compilation for publish to prevent collisions.
- **Legacy removal**: Complete deletion of MenuEditorWidget (702 lines), useMaxMenuEditorState (1,317 lines), menuEditorWidget.scss (1,336 lines), 50+ atomic menu tools, and associated tests.
- **Menu Modals**: CRUD management of menu modal configurations — overlay content that merchants can attach to navigation items (controller, service, repository, and model in `page-service-api`).
- **Static Page Generator**: Unified `static_page_generator_tool` replaces per-page generators with enhanced HTML revision process and resource tag restoration.
- **Artifact ID validation**: The `code_edit` tool validates and corrects artifact IDs before applying edits.

### 2.2 Out of Scope

- **JSON-to-HTML menu migration**: Automatic conversion of existing JSON mega-menu structures to Tailwind HTML templates for merchants with pre-existing menus. This is listed as an ideal future approach.
- **Auto-seeding from profile settings**: Generating default nav/footer templates from merchant Business Profile data for new accounts. Currently returns empty placeholders.
- **Product block insertion**: Covered by the separate MaxAI Featured Product BRD.
- **Multi-language storefront content**: Internationalization of nav/footer template content.
- **A/B testing of page designs**: No built-in testing framework for comparing template variants.
- **Custom CSS injection**: Merchants cannot inject arbitrary CSS beyond Tailwind utilities.
- **Real-time collaborative editing**: Only one merchant session can edit at a time; no multi-user concurrency in the preview.

### 2.3 Dependencies or Constraints

- **Redis availability**: All preview editing depends on Redis for shared key storage and versioning. Redis TTL management (`PAGE_ARTIFACT_TTL`) must be configured correctly to prevent premature expiry during active editing sessions.
- **Tailwind CDN**: The unified preview relies on the Tailwind CDN script for live rendering. CSS compilation at publish time uses the TailwindCssConverter CLI.
- **page-service-api internal endpoints**: `aina-service` depends on internal controller endpoints (`/internal/stores/:store_id/max-menu`, `/internal/stores/:store_id/max-footer`) for template persistence.
- **LLM model availability**: Nav/footer generation and the Page Plan Architect pipeline depend on LLM API availability (OpenAI, specifically GPT-5.2 for nav/footer generation).
- **Merchant survey and profile data**: The onboarding pipeline depends on `p1_survey.py` for reading merchant survey data and `p1_business_profile_service` for loading business profile context into the generation pipeline.
- **html-react-parser**: Storefront hydration in `p1-customer` depends on the `html-react-parser` library for `data-max-fn` replacement.
- **MongoDB atomic operations**: The `ensureMaxTemplate` pattern requires MongoDB 4.2+ for `findOneAndUpdate` with `upsert`.

---

## 3. Functional Requirements

### FR-01: Unified Conversational Widget

**Description:**

The merchant interacts with a single Page Builder chat widget. The old Menu Editor widget, its state machine, and its SCSS are completely removed. All edit requests — whether targeting the navigation header, page body, or footer — are handled through this single conversational interface.

**Preconditions:**

- Merchant has access to the Page Builder or is going through onboarding.
- A page context exists (either an onboarding home page or a page-builder dashboard page).

**Main Flow:**

1. Merchant opens the Page Builder widget (from the dashboard or during onboarding).
2. The unified preview iframe renders the composed document (nav + body + footer).
3. Merchant types an edit request in the chat (e.g., "Change the footer background to dark blue," "Add a testimonials section").
4. The system classifies the intent, loads the appropriate section prompt, executes the edit, and streams the updated composed HTML back to the iframe.

**Expected UI Behavior or Rules:**

- The Menu Editor widget, its state machine, and SCSS must not be present in the codebase.
- The `selectMenuEditorTarget` function and related payload helpers must be removed.
- The widget context handler must not track menu editor state.
- Conversation restore service must not contain menu editor restoration logic.

---

### FR-02: Intent Classification

**Description:**

The IntentClassifier service analyzes each merchant message to determine whether the edit targets the navigation header (`menu` scope), footer (`footer` scope), or page body (`page` scope). The classified scope determines which instruction XML files and section prompts are loaded into the `code_edit` tool.

**Preconditions:**

- Merchant has sent a message in the Page Builder chat.
- The page context is active with a composed document.

**Main Flow:**

1. Merchant sends an edit request (e.g., "Center the logo in the header").
2. The PageBuilderAgent passes the message to the IntentClassifier.
3. IntentClassifier returns the scope: `'menu'`, `'footer'`, or `'page'`.
4. Based on the scope:
   - `'menu'`: Loads `page_builder_agent_menu_instructions.xml` and `nav_section_prompt.py`. Triggers NavContractGuard validation post-edit.
   - `'footer'`: Loads `page_builder_agent_footer_instructions.xml` and `footer_section_prompt.py`.
   - `'page'`: Loads `page_builder_agent_page_instructions.xml` and `page_section_prompt.py`.
5. All scopes also load `page_builder_agent_shared_instructions.xml` for cross-cutting rules.
6. If scope is ambiguous, `page_builder_agent_neutral_instructions.xml` is loaded as fallback.

**Expected UI Behavior or Rules:**

- Classification must be transparent to the merchant — they do not see the scope label.
- Misclassification should not cause data corruption because the Document Splitter only writes to the section that changed.
- Example trigger intents:
  - `'menu'`: "Make the navbar sticky," "Add a search bar to the header," "Change the logo size."
  - `'footer'`: "Add social media links to the footer," "Change footer background color."
  - `'page'`: "Add a testimonials section," "Change the hero image," "Make the text larger."

---

### FR-03: Document Composition and Assembly

**Description:**

The Document Composer merges the page body, shared navigation, and shared footer into a single valid HTML5 document for preview rendering. It assigns unique `data-aina-id` attributes to section wrappers and nav/footer children for precise DOM targeting during edits.

**Preconditions:**

- Redis contains the page body artifact and (optionally) shared nav/footer version keys.

**Main Flow:**

1. `compose_with_shared_sections()` fetches the current active versions of nav and footer from Redis using `get_section_html()`.
2. If shared Redis keys do not exist, `seed_nav_footer_from_p1()` retrieves templates from the persistent Template Library database and stores them in Redis.
3. The page body is extracted from the page artifact using `extract_body_from_unified()`.
4. `compose_unified_document()` merges body, nav, and footer:
   - Assigns `data-aina-id` attributes to `<nav>`, `<main>`, `<footer>` and their children.
   - Promotes stray `<link>` tags to the `<head>`.
   - Strips shell elements.
   - Creates `<nav>` element when missing.
   - Handles `<style>` siblings next to `<main>`.
5. The composed HTML is returned to the client for iframe rendering.

**Expected UI Behavior or Rules:**

- The preview iframe must render a complete page with nav at top, body in middle, and footer at bottom.
- If nav or footer templates are empty, blank wrapper tags (`<nav data-max-section="nav"></nav>`, `<footer data-max-section="footer"></footer>`) must appear.
- Head resources (Google Fonts, Tailwind CDN) must be preserved across round-trips via `build_body_artifact()`.

---

### FR-04: Document Splitting and Section Storage

**Description:**

After an edit, the Document Splitter separates the unified document back into its constituent sections. Only the changed section is written to Redis; unchanged sections are not overwritten.

**Preconditions:**

- An edit has been applied to the composed document.
- The IntentClassifier has determined which section was modified.

**Main Flow:**

1. The `code_edit` tool applies the LLM-generated HTML operations to the composed document.
2. The Document Splitter extracts `<nav>`, `<main>`, and `<footer>` sections.
3. The body is stored to the page-specific artifact key.
4. If the edit targeted `menu` scope: the nav HTML is stored to `max_nav:{store_id}:v{N+1}` and the head pointer `max_nav_head:{store_id}` is incremented.
5. If the edit targeted `footer` scope: the footer HTML is stored similarly.
6. Head resources are preserved in the body artifact using `build_body_artifact()` wrapping.

**Expected UI Behavior or Rules:**

- Editing the nav must not create a new body version.
- Editing the body must not create a new nav or footer version.
- The `data-max-section` attributes (`nav`, `body`, `footer`) must be preserved as partition anchors.

---

### FR-05: NavContractGuard Validation

**Description:**

For modifications scoped to the navigation menu, a strict validation schema runs post-edit to prevent the AI from generating broken interactive components that cannot be hydrated on the storefront.

**Preconditions:**

- An edit has been classified as `menu` scope.
- The code_edit tool has produced modified nav HTML.

**Main Flow:**

1. NavContractGuard validates the modified nav HTML:
   - **Functional Component Allowlist**: All `data-max-fn` attributes must be in `['cart', 'search', 'profile', 'location', 'currency']`.
   - **Skeleton Structural Integrity**: Function skeletons from NavFnSkeletons maintain their required internal structures.
   - **Wrapper Class Validation**: Outer wrapper classes may change for styling, but internal functional structures remain untouched.
   - **Modal Synchronization**: Every `data-max-modal-trigger="id"` has a corresponding `data-max-modal="id"` dialog container.
   - **Select-like Element Structure**: Dropdown elements maintain required internal structure.
   - **Mobile Navigation Structure**: Hamburger toggle elements maintain required structure.
2. If validation passes, the nav HTML is stored.
3. If validation fails, auto-repair is attempted:
   - Missing skeleton structures are reinserted.
   - If auto-repair succeeds, the repaired HTML is stored.
   - If auto-repair fails, the operation is aborted with an error.

**Expected UI Behavior or Rules:**

- The merchant does not see the validation process unless it fails.
- On failure after failed auto-repair, the edit is not applied and the merchant receives an error message.
- Invalid `data-max-fn` values are rejected.

---

### FR-06: Shared Redis Key Model (Single Source of Truth)

**Description:**

Global templates (nav and footer) are stored exactly once per store in shared versioned Redis keys. This eliminates duplication across pages and ensures that edits to global sections are instantly reflected across all pages.

**Preconditions:**

- The store has an active editing session or is loading a page.

**Main Flow:**

1. Navigation keys:
   - `max_nav:{store_id}:v{version}`: Holds the raw navigation HTML string.
   - `max_nav_head:{store_id}`: Points to the current version integer.
2. Footer keys:
   - `max_footer:{store_id}:v{version}`: Holds the raw footer HTML string.
   - `max_footer_head:{store_id}`: Points to the current version integer.
3. Page artifact keys:
   - `artifact:onboarding:{session_id}:{store_id}:html-tailwind:{page_name}:v{version}`: Contains the body artifact HTML with preserved head resources.
4. All keys support TTL management via `expire()` with `PAGE_ARTIFACT_TTL`.
5. TTL is synchronized on both the version key and the head pointer to prevent orphaned references.

**Expected UI Behavior or Rules:**

- Editing the nav on the Home page must reflect the change when the merchant switches to the About page preview.
- Tab synchronization: the frontend refetches the conversation when a global edit occurs.
- If Redis keys expire mid-session, the system must re-seed from the persistent database without data loss.

---

### FR-07: Design Preference Form

**Description:**

During onboarding, a structured form widget is displayed that allows merchants to express design preferences before AI-driven page generation begins. The form captures color scheme, layout style, and visual direction preferences.

**Preconditions:**

- Merchant is in the onboarding flow.
- The onboarding agent has triggered the `show_design_preference_form` tool.

**Main Flow:**

1. The Design Preference Form widget renders in the chat interface.
2. Merchant selects their design preferences (color scheme, layout style, visual style direction).
3. Merchant submits the form.
4. The context handler (`design_preference_form.py`) processes the submitted data.
5. The preferences are fed into the home page generation pipeline.

**Expected UI Behavior or Rules:**

- The form must render inline within the chat message stream (via `AssistantMessageExtras`).
- The form submission triggers the SSE event adapter in `useChatStreaming.js`.
- If the design form step can be skipped (bypass logic), the system proceeds with default preferences.
- The form is only shown during onboarding, not during normal page-builder editing.

---

### FR-08: Onboarding Home Page Generation

**Description:**

When a new merchant completes onboarding, the `onboarding_home_generator_tool` orchestrates the full page creation pipeline, including generating the store's initial navigation and footer via LLM, and running the Page Plan Architect for the body content.

**Preconditions:**

- Merchant has completed onboarding steps and optionally submitted design preferences.
- Redis is available for key storage.

**Main Flow:**

1. The tool loads the theme context (design system, Tailwind theme) from memory.
2. LLM generates `<nav>` and `<footer>` HTML styled to the merchant's theme.
3. NavContractGuard validates the generated nav HTML; falls back to defaults on failure.
4. Nav and footer are stored in shared Redis keys (`max_nav:{store_id}:v1`, `max_footer:{store_id}:v1`).
5. The Page Plan Architect pipeline generates the body:
   - Stage 1: Plan Architect generates section layout and content structure.
   - Stage 2: Art Direction defines visual treatment per section.
   - Stage 3: HTML Generator produces Tailwind HTML.
   - Stage 4: Vision-based visual audit verifies rendering quality.
   - Stage D/E: Designer review with creative enhancement.
6. The body artifact is stored in Redis.
7. TTLs are set on all keys.
8. Composed page HTML is streamed to the preview iframe via SSE.

**Expected UI Behavior or Rules:**

- The merchant sees a loading state while generation is in progress.
- The preview iframe renders the complete generated page (nav + body + footer) once generation completes.
- Only the Home page body is generated during onboarding; the About page can be created later via the normal page-builder flow.
- The version dropdown is hidden during onboarding context.

---

### FR-09: Unified Publish Flow

**Description:**

When a merchant publishes a page, the system compiles Tailwind CSS in a single pass, splits the unified document into sections, and stores each section in its permanent database location.

**Preconditions:**

- Merchant has a page with approved changes ready for publish.
- Nav and footer HTML exist in Redis (generated during onboarding or editing).

**Main Flow:**

1. `PagePublishService` fetches the body-only page HTML and shared nav/footer HTML from Redis.
2. The sections are assembled into a full unified document.
3. TailwindCssConverter CLI compiles all Tailwind classes in a single pass, producing a combined stylesheet. During compilation, `hidden` classes are renamed to `aina-hidden` to prevent collisions with the storefront's Tailwind environment.
4. The Document Splitter separates the compiled document:
   - `<nav>` content + compiled CSS → Published to `page-service-api` via `ensureMaxMenu` + `applyMaxMenu`.
   - `<footer>` content + compiled CSS → Published via `ensureMaxFooter` + `applyMaxFooter`.
   - `<main>` body-only HTML → Uploaded to AWS S3 and registered as page content.
5. `ensureMaxTemplate` uses `findOneAndUpdate(upsert: true)` to atomically create or retrieve the template record, preventing duplicates from concurrent publishes.
6. Temporary Redis keys are cleaned up via `cleanup_nav_footer_keys()` and TTLs are set.

**Expected UI Behavior or Rules:**

- The merchant sees a success confirmation when publish completes.
- The published storefront renders the new templates immediately after publish.
- Concurrent publishes of multiple pages must not create duplicate nav/footer template records in MongoDB.
- The compiled CSS must include styles for all three sections since they were compiled together.

---

### FR-10: Page Version History and Staged Reversion

**Description:**

Merchants can browse and revert to prior versions of their page edits. A version dropdown displays available page artifact versions with the current version marked as "Active."

**Preconditions:**

- Merchant has made at least one edit, creating multiple versions.
- The page-builder dashboard context is active (not onboarding).

**Main Flow:**

1. The Version Tab UI displays a dropdown of available page artifact versions.
2. The current version is marked with an "Active" label.
3. Merchant selects a prior version from the dropdown.
4. The `revert_tool.py` validates the target version exists.
5. The head pointer is updated to the selected version.
6. The reverted body is composed with the current shared nav/footer for preview.
7. The preview iframe renders the reverted page.

**Expected UI Behavior or Rules:**

- The version dropdown must be hidden during onboarding.
- The "Active" label replaces the previous "New" label on the current version.
- Reverting a page does not affect the shared nav/footer versions.
- The merchant can continue editing after reverting.

---

### FR-11: Approval and Rejection (Rollback)

**Description:**

Because edits to shared nav/footer keys are written immediately for instant preview, a rollback mechanism must revert these shared keys when a merchant rejects an edit.

**Preconditions:**

- An edit has been applied that modified shared nav and/or footer keys.
- Pre-edit version numbers have been captured in pending changes metadata.

**Main Flow:**

1. During `code_edit`, the tool captures pre-edit head numbers:

   ```json
   {
     "pre_edit_nav_version": 1,
     "pre_edit_footer_version": 1
   }
   ```

2. If the merchant clicks **Reject** (or closes the session without saving):
   - `_handle_full_rejection()` retrieves pre-edit version numbers from pending metadata.
   - Head pointers (`max_nav_head`, `max_footer_head`) are reverted to pre-edit integers.
   - All orphaned version keys generated during the session are loop-deleted.
3. The next preview or composition read resolves to the reverted templates.

**Expected UI Behavior or Rules:**

- Rejection must restore the exact pre-edit state for both nav and footer.
- Orphaned Redis keys must be cleaned up to prevent storage leaks.
- Approval retains the current head pointers and clears the pending metadata.

---

### FR-12: Three-Tier Storefront Header Fallback

**Description:**

When a customer visits the storefront, the `PublicHeader` component determines which header to render based on a three-tier fallback strategy.

**Preconditions:**

- Customer is visiting a storefront page.
- `PublicHeader` has issued parallel API calls for Max template and JSON mega menu data.

**Main Flow:**

1. **Tier 1**: If a published Max menu template exists (`hasMaxMenuTemplate`), render `<MaxTemplateHeader />`.
   - `MaxTemplateHeader` parses the compiled HTML using `html-react-parser`.
   - Elements with `data-max-fn` attributes are replaced with live React components:
     - `data-max-fn="cart"` → `<Cart />`
     - `data-max-fn="search"` → `<SearchBar />`
     - `data-max-fn="profile"` → `<ProfileDropdown />`
     - `data-max-fn="location"` → `<StoreLocationDropdown />`
     - `data-max-fn="currency"` → `<CurrencyDropdown />`
   - Click handlers are set up on `data-max-modal-trigger` elements to toggle `hidden` on matching `data-max-modal` elements.
2. **Tier 2**: Else if a JSON mega menu configuration exists, render `<PublicMenuBuilderHeader />`.
3. **Tier 3**: Else, render `<DefaultPrimaryHeader />` (system default).

**Expected UI Behavior or Rules:**

- Tier 1 takes priority whenever a Max template has been published.
- The storefront only switches to Tier 1 once a Max template has been generated and published.
- Interactive components (cart badge, search, profile dropdown) must be fully functional after hydration.
- Compiled CSS from the template is injected via `<style dangerouslySetInnerHTML>` scoped to the header.

---

### FR-13: Storefront Footer Rendering

**Description:**

The `PublicFooter` component renders the footer with a fallback strategy, supporting Max footer templates on all pages including system pages (cart, checkout).

**Preconditions:**

- Customer is visiting any storefront page.

**Main Flow:**

1. **Tier 1**: If a published Max footer template exists (`getPublicFooterTemplate`), render the compiled HTML with scoped CSS.
2. **Tier 2**: Else, render `<StoreFooter />` (profile-based default) or `<CopyrightFooter />` depending on the page route.

**Expected UI Behavior or Rules:**

- The Max footer renders on all pages including system pages.
- CSS scoping prevents style collisions with the storefront theme.
- The footer falls back gracefully when no Max template exists.

---

### FR-14: Merchant State Handling

**Description:**

The system must handle three distinct merchant account profiles when determining the editor's composition structure and the storefront's fallback behavior.

**Preconditions:**

- Merchant accesses the Unified Max Builder or a customer loads their storefront.

**Main Flow:**

1. **New Account**: No templates exist, no JSON mega-menu, no custom footer.
   - Editor: Returns empty `<nav>` and `<footer>` placeholder wrappers. AI agent prompts merchant to begin building.
   - Storefront: Header renders Tier 3 (DefaultPrimaryHeader). Footer renders Tier 2 (StoreFooter).

2. **Existing Account without Menu/Footer**: Account exists but no menu or footer has been configured.
   - Editor: Same as new account — empty placeholders.
   - Storefront: Same as new account — Tier 3 header, Tier 2 footer.

3. **Existing Account with Menu/Footer**: Has a configured JSON mega-menu and/or custom footer.
   - Editor (current logic): Returns empty placeholders because no Max HTML templates exist yet. This carries a **data loss risk** if the merchant publishes with empty templates overwriting their active mega-menu.
   - Storefront: Header renders Tier 2 (PublicMenuBuilderHeader from JSON). Footer renders Tier 2 (StoreFooter).

**Expected UI Behavior or Rules:**

- For Scenarios 1 and 2, the editor must clearly indicate that nav and footer sections are empty and guide the merchant to start building.
- For Scenario 3, the system should ideally auto-migrate the existing JSON menu structure to Tailwind HTML (currently out of scope — flagged as an ideal future approach).
- The storefront fallback tiers must remain functional regardless of whether the merchant has used the Unified Max Builder.

---

### FR-15: Menu Modals Management

**Description:**

Merchants can create, read, and update menu modal configurations — overlay content attached to navigation items. These modals are triggered by navigation elements carrying `data-max-modal-trigger` attributes and rendered as dialog containers flagged with `data-max-modal`.

**Preconditions:**

- Merchant has a published or in-progress navigation template.
- The `page-service-api` menu-modals module is deployed.

**Main Flow:**

1. Merchant requests a modal (e.g., "Add a promotional overlay when someone clicks the Sale menu item").
2. The AI generates nav HTML with a `data-max-modal-trigger="promo"` on the menu item and a corresponding `data-max-modal="promo"` dialog container.
3. NavContractGuard validates the modal trigger/target pairing.
4. The modal configuration is stored via the Menu Modals service in `page-service-api`.

**Expected UI Behavior or Rules:**

- Every `data-max-modal-trigger="id"` must have a matching `data-max-modal="id"` container. NavContractGuard enforces this.
- Modal content is managed through the menu-modals controller, service, and repository in `page-service-api`.
- On the storefront, click handlers on `data-max-modal-trigger` elements toggle the `hidden` class on matching `data-max-modal` elements.

---

### FR-16: Artifact ID Validation and Correction

**Description:**

The `code_edit` tool validates artifact IDs before applying edits, preventing operations on stale or incorrect artifact references.

**Preconditions:**

- An edit is about to be applied via the `code_edit` tool.

**Main Flow:**

1. Before executing the edit, the tool validates that the artifact ID references a valid, current artifact in Redis.
2. If the artifact ID is stale or incorrect, the tool attempts automatic correction by resolving the correct artifact key.
3. If correction succeeds, the edit proceeds against the corrected artifact.
4. If correction fails, the operation returns an error.

**Expected UI Behavior or Rules:**

- Artifact ID mismatches must not silently corrupt data.
- The validation is transparent to the merchant.

---

### FR-17: Static Page Generator

**Description:**

The unified `static_page_generator_tool` replaces the previous per-page static generators. It handles HTML revision with resource tag restoration, ensuring that generated static pages maintain their styling resources.

**Preconditions:**

- A static page generation request has been triggered (via onboarding or page-builder).

**Main Flow:**

1. The tool generates or revises the HTML for a static page.
2. During revision, resource tags (stylesheet links, script tags) are preserved and restored.
3. The generated page is stored as a body artifact with head resources preserved via `build_body_artifact()`.

**Expected UI Behavior or Rules:**

- Resource tags must survive HTML revision passes.
- The generated page must compose correctly with shared nav and footer sections.

---

## 4. Behavioral Output Matrix

The following matrix maps merchant actions to the system's behavioral response and the tools/services involved.

| Merchant Action | Agent Behavior | Tools Used |
|---|---|---|
| **Onboarding & Generation** | | |
| Merchant opens onboarding flow | Onboarding agent triggers design preference form widget in the chat interface | `show_design_preference_form_tool`, `AssistantMessageExtras`, `DesignPreferenceForm` |
| Merchant submits design preferences | Context handler processes preferences and feeds them into the generation pipeline | `design_preference_form.py` context handler, `useChatStreaming.js` SSE adapter |
| Merchant skips design preference form | Bypass logic proceeds with default preferences | `design_form_bypass.py` |
| Onboarding triggers home page generation | Generates nav + footer via LLM, validates with NavContractGuard, runs Page Plan Architect pipeline for body, stores all sections in Redis | `onboarding_home_generator_tool`, `PagePlanArchitect`, `NavContractGuard`, `NavFnSkeletons`, `store_section_version()`, `build_body_artifact()` |
| Generated nav fails NavContractGuard | Falls back to default nav template, stores default in Redis | `NavContractGuard.validate()`, `NavContractGuard.auto_repair()`, default template fallback |
| **Editing — Navigation** | | |
| Merchant types "Make the navbar sticky" | IntentClassifier returns `'menu'` scope; loads nav instructions + prompt; code_edit modifies nav HTML; NavContractGuard validates; stores new nav version in Redis | `IntentClassifier.classify()`, `code_edit_tool`, `page_builder_agent_menu_instructions.xml`, `nav_section_prompt.py`, `NavContractGuard`, `store_section_version()` |
| Merchant types "Add a search bar to the header" | Same as above; NavFnSkeletons provides the search skeleton HTML for insertion; guard validates `data-max-fn="search"` structure | `IntentClassifier`, `code_edit_tool`, `NavFnSkeletons`, `NavContractGuard` |
| Merchant types "Add a shopping cart icon" | IntentClassifier classifies as `'menu'`; skeleton for `data-max-fn="cart"` is injected; guard validates badge placeholder structure | `IntentClassifier`, `code_edit_tool`, `NavFnSkeletons`, `NavContractGuard` |
| AI generates nav with invalid `data-max-fn` value | NavContractGuard rejects the edit; auto-repair is attempted; if repair fails, operation is aborted with error | `NavContractGuard.validate()`, `NavContractGuard.auto_repair()` |
| AI generates nav with broken modal trigger | NavContractGuard detects `data-max-modal-trigger` without matching `data-max-modal`; auto-repair attempts to fix; if repair fails, error returned | `NavContractGuard.validate()`, `NavContractGuard.auto_repair()` |
| **Editing — Footer** | | |
| Merchant types "Add social links to the footer" | IntentClassifier returns `'footer'` scope; loads footer instructions + prompt; code_edit modifies footer HTML; stores new footer version in Redis | `IntentClassifier.classify()`, `code_edit_tool`, `page_builder_agent_footer_instructions.xml`, `footer_section_prompt.py`, `store_section_version()` |
| Merchant types "Change footer background to dark blue" | Same flow as above; code_edit modifies Tailwind classes on the footer section | `IntentClassifier`, `code_edit_tool`, `footer_section_prompt.py` |
| **Editing — Page Body** | | |
| Merchant types "Add a testimonials section" | IntentClassifier returns `'page'` scope; loads page instructions + prompt; code_edit modifies body HTML; stores new body version in page artifact key | `IntentClassifier.classify()`, `code_edit_tool`, `page_builder_agent_page_instructions.xml`, `page_section_prompt.py` |
| Merchant types "Change the hero image" | Same as above; code_edit replaces the image source in the body section | `IntentClassifier`, `code_edit_tool`, `page_section_prompt.py` |
| **Editing — Ambiguous Intent** | | |
| Merchant types "Make everything bigger" | IntentClassifier cannot determine scope; loads neutral instructions as fallback; code_edit applies changes to the full document | `IntentClassifier.classify()`, `code_edit_tool`, `page_builder_agent_neutral_instructions.xml` |
| **Preview & Composition** | | |
| Widget opens or page loads | Document Composer fetches nav and footer from Redis, extracts body from artifact, composes full HTML with `data-aina-id` attributes, delivers to iframe | `compose_with_shared_sections()`, `get_section_html()`, `extract_body_from_unified()`, `compose_unified_document()` |
| Shared Redis keys not found on page load | Composer triggers `seed_nav_footer_from_p1()` to fetch from persistent Template Library database and seed Redis | `seed_nav_footer_from_p1()`, `get_max_template()`, `store_section_version()` |
| Merchant switches from Home to About page tab | Frontend refetches conversation; composer reads same shared nav/footer keys with updated body for the About page | `compose_with_shared_sections()`, tab synchronization SSE |
| **Approval & Rejection** | | |
| Merchant approves an edit | Pending changes metadata is cleared; current head pointers are retained; artifact versions remain as-is | `code_artifact_service.py` approval handler |
| Merchant rejects an edit | Head pointers reverted to pre-edit versions; orphaned version keys loop-deleted from Redis | `_handle_full_rejection()`, Redis `DEL` operations on orphaned keys |
| Merchant closes session without saving | Same as rejection — rollback triggered | `_handle_full_rejection()` |
| **Version History** | | |
| Merchant opens version dropdown | Version Tab UI lists available page artifact versions; current version marked "Active" | `useChatInterface.js` version tab, Redis version enumeration |
| Merchant selects a prior version | revert_tool validates target version, updates head pointer, composes reverted body with current nav/footer | `revert_tool.py`, `compose_with_shared_sections()` |
| **Publishing** | | |
| Merchant clicks Publish | PagePublishService fetches body + nav + footer from Redis; assembles unified document; compiles Tailwind CSS in single pass; splits sections; stores nav/footer to MongoDB via atomic upsert; uploads body to S3; cleans up Redis keys | `PagePublishService`, `TailwindCssConverter`, `document_splitter.py`, `ensureMaxMenu`, `applyMaxMenu`, `ensureMaxFooter`, `applyMaxFooter`, S3 upload, `cleanup_nav_footer_keys()` |
| Concurrent publish of two pages | `ensureMaxTemplate` uses `findOneAndUpdate(upsert: true)` — both pages resolve to the same template record without duplicates | `template-builder.repository.ts` `ensureMaxTemplate()` |
| **Storefront Rendering** | | |
| Customer visits storefront (Max template published) | PublicHeader renders Tier 1: MaxTemplateHeader; `html-react-parser` replaces `data-max-fn` placeholders with live React components | `MaxTemplateHeader.tsx`, `html-react-parser`, `Cart`, `SearchBar`, `ProfileDropdown`, `StoreLocationDropdown`, `CurrencyDropdown` |
| Customer visits storefront (no Max template, JSON menu exists) | PublicHeader renders Tier 2: PublicMenuBuilderHeader from JSON mega menu data | `PublicHeader/index.tsx`, `getPublicMenuTemplateRequest()`, JSON menu API |
| Customer visits storefront (no Max template, no JSON menu) | PublicHeader renders Tier 3: DefaultPrimaryHeader (system default) | `PublicHeader/index.tsx`, `DefaultPrimaryHeader` |
| Customer visits storefront (Max footer published) | PublicFooter renders Tier 1: compiled HTML with scoped CSS on all pages including system pages | `PublicFooter/index.tsx`, `getPublicFooterTemplate()` |
| Customer visits storefront (no Max footer) | PublicFooter renders Tier 2: StoreFooter or CopyrightFooter depending on route | `PublicFooter/index.tsx`, `StoreFooter`, `CopyrightFooter` |
| Customer clicks nav hamburger on mobile | Modal trigger handler toggles `hidden` class on matching `data-max-modal` element | `MaxTemplateHeader.tsx` click handler, `data-max-modal-trigger` / `data-max-modal` pairing |
| **Menu Modals** | | |
| Merchant types "Add a promo overlay on the Sale link" | IntentClassifier returns `'menu'` scope; AI generates nav with `data-max-modal-trigger` and matching `data-max-modal` container; NavContractGuard validates pairing; modal config stored | `IntentClassifier`, `code_edit_tool`, `NavContractGuard`, Menu Modals service |
| **Artifact Validation** | | |
| code_edit receives stale artifact ID | Tool detects stale ID, resolves correct artifact key, proceeds with corrected reference | `code_edit_tool` artifact ID validation and correction logic |
| code_edit receives unresolvable artifact ID | Tool cannot correct the reference; returns error; edit is not applied | `code_edit_tool` validation |
| **Static Page Generation** | | |
| Merchant triggers static page generation | Static Page Generator produces HTML, preserves resource tags through revision, stores body artifact with head resources | `static_page_generator_tool`, `build_body_artifact()` |
| **Design Form Bypass** | | |
| Merchant's onboarding session meets bypass criteria | Design form bypass logic skips the preference form step; generation proceeds with default preferences | `design_form_bypass.py`, `onboarding_home_generator_tool` |

---

## 5. Acceptance Criteria

- Merchant can edit navigation, footer, and page body from a single conversational widget without switching tools.
- The IntentClassifier correctly routes edit requests to the appropriate section scope (menu, footer, page).
- The unified preview iframe renders all three sections (nav + body + footer) as a single composed document.
- Navigation edits propagate instantly across all pages via shared versioned Redis keys.
- The NavContractGuard validates all AI-generated nav HTML against the function skeleton contract, rejecting invalid structures after failed auto-repair.
- All `data-max-fn` components (`cart`, `search`, `profile`, `location`, `currency`) maintain their required skeleton structures after editing.
- Modal trigger/target synchronization (`data-max-modal-trigger` / `data-max-modal`) is validated post-edit.
- The Design Preference Form renders during onboarding and feeds preferences into the generation pipeline.
- The Page Plan Architect generates a complete home page (nav + footer + body) during onboarding.
- The Unified Publish Flow compiles Tailwind CSS in a single pass, renames `hidden` to `aina-hidden`, splits sections, and stores them atomically.
- `ensureMaxTemplate` prevents duplicate template records during concurrent publishes.
- Rejection rolls back shared nav/footer pointers to pre-edit versions and cleans up orphaned keys.
- Page Version History displays a dropdown with prior versions and allows staged reversion.
- The storefront three-tier header fallback renders the correct tier based on available template data.
- The storefront footer renders Max templates on all pages including system pages with scoped CSS.
- Storefront hydration replaces all `data-max-fn` placeholders with fully functional React components.
- The legacy Menu Editor widget, state machine, SCSS, and 50+ atomic tools are fully removed.
- Head resources (`<link>`, `<script>` tags) are preserved across editing round-trips.
- Menu modal configurations can be created, read, and updated via the menu-modals module; every `data-max-modal-trigger` has a matching `data-max-modal` container.
- Artifact ID validation prevents edits from being applied against stale or incorrect artifact references.
- The static page generator preserves resource tags through HTML revision passes.
- The design form bypass correctly skips the preference form step when bypass criteria are met, and generation proceeds with default preferences.

---

## 6. QA Test Scenarios

### Happy Path

1. **Merchant edits navigation via chat**: Merchant types "Make the header background dark blue." IntentClassifier returns `'menu'` scope. Nav HTML is updated. Preview iframe shows updated nav with dark blue background. The same nav appears on all page tabs.

2. **Merchant edits footer via chat**: Merchant types "Add a copyright notice to the footer." IntentClassifier returns `'footer'` scope. Footer HTML is updated. Preview shows updated footer.

3. **Merchant edits page body via chat**: Merchant types "Add a contact form section." IntentClassifier returns `'page'` scope. Body HTML is updated. Preview shows new section in the body area.

4. **Onboarding generates full page**: New merchant completes design preference form. System generates nav + footer + body. Preview iframe renders the complete page. Version dropdown is hidden.

5. **Merchant publishes page**: Merchant clicks Publish. Tailwind CSS is compiled. Sections are split and stored (nav/footer to MongoDB, body to S3). Customer storefront renders published templates.

6. **Merchant reverts to prior version**: Merchant selects version 2 from the dropdown. Preview shows the reverted body with current nav/footer. Merchant can continue editing from the reverted state.

7. **Merchant rejects edit**: Merchant rejects a nav edit. Nav head pointer reverts to pre-edit version. Orphaned version keys are deleted. Preview shows the original nav.

8. **Storefront renders Tier 1 header**: Published Max template exists. Customer sees MaxTemplateHeader with functional cart, search, and profile components.

### Negative Path

1. **NavContractGuard rejects invalid nav**: AI generates nav with `data-max-fn="invalid"`. Guard rejects. Auto-repair fails (unknown function type). Edit is aborted. Merchant sees error message.

2. **Concurrent publish does not create duplicates**: Two pages publish simultaneously. Both call `ensureMaxMenu`. Only one template record exists in MongoDB after both complete.

3. **Redis keys expire mid-session**: Shared nav/footer keys expire during editing. System re-seeds from persistent database via `seed_nav_footer_from_p1()` without losing the merchant's work.

4. **Existing merchant with JSON menu opens editor**: Merchant with active JSON mega-menu opens the Page Builder. Editor shows empty nav/footer placeholders (data loss risk — known limitation). Storefront continues to render Tier 2 from JSON data.

### Edge Cases

1. **Page with missing `<main>` tag**: Document Composer handles missing `<main>` wrapper and creates one during composition.

2. **Page with `<style>` siblings next to `<main>`**: Composer handles style siblings without creating nested main elements.

3. **Stray `<link>` tags in body**: Composer promotes stray link tags to the `<head>` during composition.

4. **Nav with missing skeleton structures**: NavContractGuard detects missing cart skeleton. Auto-repair reinserts the skeleton from NavFnSkeletons. Validation passes after repair.

5. **Tailwind `hidden` class in nav toggle**: During preview, `hidden` class toggles mobile menu visibility. During publish, `hidden` is renamed to `aina-hidden` to prevent collision with storefront Tailwind. Mobile toggle still works on the published storefront via `aina-hidden`.

6. **Version dropdown during onboarding**: Version dropdown is hidden during onboarding context. Merchant cannot access version history until they are in the page-builder dashboard.

7. **Empty nav and footer for new account**: Composer generates blank wrapper tags. Preview iframe shows empty header and footer areas. AI agent detects empty sections and prompts the merchant to start building.

8. **Menu modal trigger/target pairing**: Merchant requests a promotional overlay. AI generates nav with `data-max-modal-trigger="promo"` and matching `data-max-modal="promo"` container. NavContractGuard validates the pairing. Storefront click handler toggles modal visibility.

9. **Stale artifact ID correction**: code_edit receives an outdated artifact reference. The tool detects the mismatch, resolves the correct artifact key, and applies the edit against the corrected reference.

10. **Design form bypass during onboarding**: Merchant's session meets bypass criteria. The design preference form is skipped. Home page generation proceeds with default preferences. The generated page is functionally identical to one generated with explicit preferences (same pipeline, default inputs).

11. **Static page resource tag preservation**: Static Page Generator revises page HTML. Resource tags (Google Fonts link, Tailwind CDN script) survive the revision pass. The resulting page renders correctly with full styling.

---

## 7. BDD (Gherkin)

### Scenario: Intent Classification Routes Edit to Correct Section

```gherkin
Feature: Unified Max Builder Intent Classification

Scenario: Merchant edits the navigation header via chat
  Given the merchant has opened the Page Builder with a composed document
  And the preview iframe shows nav, body, and footer sections
  When the merchant types "Make the navbar sticky and change the logo size"
  Then the IntentClassifier classifies the message as 'menu' scope
  And the system loads page_builder_agent_menu_instructions.xml
  And the system loads nav_section_prompt.py
  And the code_edit tool modifies only the nav section HTML
  And the NavContractGuard validates the modified nav
  And the updated nav is stored to max_nav:{store_id}:v{N+1}
  And the preview iframe refreshes with the updated nav
  And the footer and body sections remain unchanged
```

### Scenario: NavContractGuard Rejects and Auto-Repairs Broken Nav

```gherkin
Feature: Navigation Contract Validation

Scenario: AI generates nav with missing cart skeleton structure
  Given the merchant requested "Add a shopping cart to the header"
  And the code_edit tool generated nav HTML with an incomplete cart placeholder
  When the NavContractGuard validates the modified nav HTML
  Then the guard detects the cart skeleton is missing required internal structure
  And the guard attempts auto-repair by reinserting the cart skeleton from NavFnSkeletons
  And the auto-repair succeeds
  Then the repaired nav HTML is stored to Redis
  And the merchant sees the updated preview with a properly structured cart icon
```

### Scenario: Shared Nav Edit Propagates Across Pages

```gherkin
Feature: Cross-Page Navigation Synchronization

Scenario: Editing nav on Home page reflects on About page
  Given the merchant has Home and About pages in the Page Builder
  And both pages share the same nav via max_nav:{store_id} Redis key
  When the merchant edits the nav on the Home page tab
  And types "Change the nav background to black"
  Then the nav version is incremented in Redis
  And the Home page preview shows the updated black nav
  When the merchant switches to the About page tab
  Then the About page preview also shows the updated black nav
  And both pages reference the same nav version
```

### Scenario: Rejection Rolls Back Shared Section Versions

```gherkin
Feature: Edit Rejection with Rollback

Scenario: Merchant rejects a nav edit and shared keys are reverted
  Given the merchant has nav at version 1 and footer at version 1
  And the code_edit tool captured pre_edit_nav_version: 1
  When the merchant's edit creates nav version 2
  And the merchant clicks Reject
  Then max_nav_head:{store_id} is reverted to "1"
  And max_nav:{store_id}:v2 is deleted from Redis
  And the preview iframe shows the original nav from version 1
```

### Scenario: Unified Publish Splits and Stores Sections Atomically

```gherkin
Feature: Unified Publish Flow

Scenario: Merchant publishes and sections are stored in permanent databases
  Given the merchant has approved changes with nav, body, and footer in Redis
  When the merchant clicks Publish
  Then the PagePublishService assembles the full unified document
  And the TailwindCssConverter compiles CSS in a single pass
  And the 'hidden' class is renamed to 'aina-hidden' in compiled CSS
  And the Document Splitter extracts nav, body, and footer sections
  And the nav content + CSS is stored via ensureMaxMenu and applyMaxMenu
  And the footer content + CSS is stored via ensureMaxFooter and applyMaxFooter
  And the body HTML is uploaded to S3
  And temporary Redis keys are cleaned up
```

### Scenario: Storefront Three-Tier Header Fallback

```gherkin
Feature: Storefront Header Rendering

Scenario: Customer sees Max template header when published
  Given a merchant has published a Max menu template
  When a customer visits the storefront
  Then the PublicHeader component detects hasMaxMenuTemplate is true
  And renders MaxTemplateHeader with the compiled HTML
  And html-react-parser replaces data-max-fn="cart" with the Cart component
  And replaces data-max-fn="search" with the SearchBar component
  And replaces data-max-fn="profile" with the ProfileDropdown component
  And all interactive components are fully functional

Scenario: Customer sees JSON mega menu when no Max template exists
  Given a merchant has a JSON mega menu but no published Max template
  When a customer visits the storefront
  Then the PublicHeader renders PublicMenuBuilderHeader from JSON data

Scenario: Customer sees default header when no templates exist
  Given a new merchant with no menu configurations
  When a customer visits the storefront
  Then the PublicHeader renders DefaultPrimaryHeader
```

### Scenario: Design Preference Form Submission and Bypass

```gherkin
Feature: Onboarding Design Preference Form

Scenario: Merchant submits design preferences before page generation
  Given the merchant is in the onboarding flow
  And the onboarding agent has triggered the show_design_preference_form tool
  When the Design Preference Form widget renders in the chat interface
  And the merchant selects color scheme, layout style, and visual direction
  And the merchant submits the form
  Then the context handler processes the submitted preferences
  And the preferences are fed into the home page generation pipeline
  And the generated page reflects the merchant's design choices

Scenario: Design form is bypassed when criteria are met
  Given the merchant is in the onboarding flow
  And the session meets the design form bypass criteria
  When the onboarding agent evaluates the design form step
  Then the design preference form is not shown
  And the home page generation proceeds with default preferences
```

### Scenario: Menu Modal Trigger/Target Pairing

```gherkin
Feature: Menu Modal Configuration

Scenario: Merchant adds a modal overlay to a navigation item
  Given the merchant has a navigation template in the editor
  When the merchant types "Add a promotional popup when someone clicks the Sale link"
  Then the IntentClassifier classifies the message as 'menu' scope
  And the code_edit tool generates nav HTML with data-max-modal-trigger="sale-promo" on the Sale item
  And a corresponding data-max-modal="sale-promo" dialog container is created
  And the NavContractGuard validates the trigger/target pairing
  And the modal configuration is stored

Scenario: NavContractGuard rejects orphaned modal trigger
  Given the code_edit tool generated nav HTML with data-max-modal-trigger="promo"
  And there is no matching data-max-modal="promo" container
  When the NavContractGuard validates the modified nav HTML
  Then the guard detects the orphaned modal trigger
  And auto-repair attempts to add the missing modal container
  And if auto-repair fails the edit is aborted with an error
```

---

## 8. Business Rules

- **BR-01: Single Source of Truth**: Global nav and footer HTML must be stored exactly once per store in shared versioned Redis keys. Editing the nav on any page must reflect across all pages.

- **BR-02: Section Isolation**: Editing one section (nav, body, or footer) must not create new versions for unchanged sections. The Document Splitter only writes to the section that was modified.

- **BR-03: NavContractGuard Enforcement**: All AI-generated navigation HTML must pass NavContractGuard validation before being stored. The allowlist is strictly limited to `['cart', 'search', 'profile', 'location', 'currency']` for `data-max-fn` values.

- **BR-04: Atomic Template Storage**: Template records in MongoDB must be created atomically using `findOneAndUpdate(upsert: true)` via `ensureMaxTemplate`. Check-then-create patterns are prohibited to prevent duplicate records during concurrent operations.

- **BR-05: Tailwind Hidden Class Renaming**: The `hidden` class must be retained as-is during live preview editing (for toggle scripts) and renamed to `aina-hidden` during CSS compilation for publish (to prevent collisions with the storefront's Tailwind environment).

- **BR-06: Head Resource Preservation**: Body artifacts must preserve `<head>` resources (stylesheet links, script tags) using the `build_body_artifact()` wrapping pattern. Stripping the head completely would cause styling loss across editing round-trips.

- **BR-07: Rollback Completeness**: Rejection must revert all shared section pointers to their pre-edit values and delete all orphaned version keys created during the editing session. Partial rollbacks (reverting nav but not footer) are not permitted.

- **BR-08: Storefront Tier Priority**: The storefront must always attempt Tier 1 (Max template) first, fall back to Tier 2 (JSON menu or profile footer), and finally Tier 3 (system default). No tier may be skipped.

- **BR-09: Version Dropdown Context**: The page version history dropdown must be hidden during onboarding and only shown in the page-builder dashboard context.

- **BR-10: Design Preference Form Timing**: The design preference form must only appear during onboarding, before AI-driven page generation begins. It must not appear during normal page-builder editing sessions.

- **BR-11: Modal Trigger/Target Pairing**: Every `data-max-modal-trigger="id"` in the navigation HTML must have a matching `data-max-modal="id"` dialog container. NavContractGuard enforces this pairing. Orphaned triggers or containers are treated as structural violations.

- **BR-12: Artifact ID Integrity**: The `code_edit` tool must validate artifact IDs before applying edits. Stale or incorrect references must be corrected or rejected — silent application against wrong artifacts is prohibited.

---

## 9. Open Questions

- **JSON-to-HTML Menu Migration**: Should the system automatically migrate existing JSON mega-menu structures to Tailwind HTML when a merchant with a pre-existing menu opens the Unified Max Builder for the first time? Without this, merchants with existing menus see empty nav placeholders and risk overwriting their active storefront menu on publish.

- **Auto-Seeding Default Templates**: Should the system auto-generate default nav/footer templates from the merchant's Business Profile settings (logo, store name, standard pages) for new accounts and accounts without menus, instead of presenting empty placeholders?

- **Publish Guard for Empty Sections**: Should the system prevent publishing when nav or footer sections are empty to avoid overwriting an active storefront menu with blank templates? This is especially critical for Scenario 3 (existing account with JSON menu).

- **Multi-Page Nav/Footer Versioning**: When a merchant edits the nav while editing the Home page and then switches to About — should the About page always use the latest nav version, or should per-page nav snapshots be supported?

- **Concurrent Editing Across Tabs**: What happens if a merchant opens two browser tabs on the same store and edits the nav in both? The current shared key model would cause the second edit to overwrite the first. Should session locking be implemented?

- **Mobile Preview**: Should the unified preview iframe support mobile-responsive preview mode, allowing merchants to see how the composed page looks on smaller screens before publishing?

- **Publish Guard for Empty Sections**: Should the publish flow block or warn when nav or footer sections are empty (blank wrapper tags only), to prevent accidentally overwriting an active storefront menu with blank templates? This is especially critical for Scenario 3 merchants who have an existing JSON mega-menu.

- **Design Form Bypass Criteria**: Under what conditions exactly should the design preference form step be bypassed during onboarding? The bypass module exists (`design_form_bypass.py`, 89 lines) but the specific trigger criteria are not documented in the architecture guide.

---

## 10. Summary

The **Unified Max Builder** consolidates three previously fragmented editing systems — Menu Editor, Footer Builder, and Page Builder — into a single conversational AI widget. Merchants interact with one chat interface; the IntentClassifier automatically routes edits to the correct section scope. All three sections are composed into a unified preview, edited via AI-driven code operations, and split apart at publish time for permanent storage.

**Key User Value:**
- Merchants see a holistic, live preview of their entire storefront page (nav + body + footer) during editing.
- Navigation and footer edits propagate instantly across all pages via shared versioned Redis keys.
- The NavContractGuard ensures AI-generated navigation HTML maintains structural integrity for storefront hydration.
- ~15,000 lines of legacy code removed with superior functionality delivered through conversational editing.

**Main Scope Boundaries:**
- JSON-to-HTML menu migration for existing merchants is out of scope (planned as a future enhancement).
- Auto-seeding default templates from Business Profile is out of scope.
- One editing session per store at a time (no concurrent multi-tab editing support).

**Cross-Platform Handoff:**
- **prosperna1 (Dashboard)**: Unified chat widget, design preference form, version dropdown, preview iframe, approval/rejection UI.
- **aina-service (AI Backend)**: IntentClassifier, code_edit tool with section prompts, NavContractGuard, Document Composer/Splitter, PagePublishService, onboarding home generator, Page Plan Architect.
- **page-service-api (Database API)**: Internal controller endpoints for menu/footer template CRUD, `ensureMaxTemplate` atomic operations, public template endpoints.
- **p1-customer (Storefront)**: Three-tier header fallback, MaxTemplateHeader with `html-react-parser` hydration, footer template rendering with CSS scoping, `data-max-fn` component replacement.

---

**Document Version:** 1.1
**Created:** May 2026
**Last Updated:** May 25, 2026
**Status:** Draft — Ready for QA and implementation review
**Changelog v1.1:** Added FR-15 (Menu Modals), FR-16 (Artifact ID Validation), FR-17 (Static Page Generator). Added BDD scenarios for Design Preference Form and Menu Modals. Added BR-11 (Modal Pairing), BR-12 (Artifact ID Integrity). Added QA scenarios for menu modals, design form bypass, artifact ID correction, and static page resource preservation. Added open questions for publish guard on empty sections and design form bypass criteria. Added GPT-5.2 model dependency and merchant survey/profile service dependencies.
