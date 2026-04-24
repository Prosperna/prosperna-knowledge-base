---
id: max-ai-url-migration
title: MaxAI URL Migration BRD
sidebar_label: MaxAI URL Migration
sidebar_position: 6
---

It reflects the current live flow:

- MaxAI starts URL migration directly from chat
- the system captures source webpage slices, imports reusable media, and extracts a design system plus section outline
- the merchant receives one final approval before Tailwind generation
- the completed draft is handed off into Page Builder for refinement and publishing

This document does not describe dormant or internal alternate approval handlers that are not currently surfaced in the active merchant flow.

## 1. Overview

### 1.1 Purpose

MaxAI URL Migration must let a merchant send a public webpage URL in chat and receive a Page Builder draft that closely follows the source page's visual direction and section structure.

The flow must be observable and reviewable before generation. Merchants should see preparation milestones, understand what source media was reused, approve generation explicitly, and then continue working inside Page Builder.

### 1.2 Problem or Opportunity

Merchants often want to recreate an existing landing page or website section quickly, but rebuilding the page manually in Page Builder is slow and requires design translation work.

URL Migration reduces that setup effort by capturing the source page, extracting reusable design signals, and creating a draft that the merchant can refine instead of building from scratch.

### 1.3 Success Measures

- A merchant can start URL migration from MaxAI using a valid public HTTPS URL without leaving chat.
- The preparation phase shows clear milestones before generation begins.
- Generation only starts after explicit approval.
- The resulting draft opens in Page Builder edit mode and is ready for refinement.
- Failure states stop safely and tell the merchant what to do next.

## 2. Scope

### 2.1 In Scope

- Starting URL migration from MaxAI chat
- URL validation for public HTTPS pages
- Lock checks that can block the flow before preparation
- Source webpage slice capture and screenshot preview streaming
- Source image import and asset summary streaming
- Native video-source detection for structural reuse
- Design-system extraction and read-only section-outline preparation
- Single final approval before generation
- Tailwind draft generation and Page Builder handoff
- Post-migration next-step guidance and connected page suggestions
- Approval UI behavior relevant to QA

### 2.2 Out of Scope

- Exact LLM prompt design for HTML generation
- Internal Redis key format or storage implementation
- Detailed Media Library backend implementation
- Automatic publishing after generation
- Editing checkout, cart, login, or other restricted core commerce pages
- Legacy or future approval branches that are not part of the active merchant flow on `main`

### 2.3 Dependencies or Constraints

- Merchant must be inside MaxAI with Page Builder available
- The provided URL must be publicly reachable and use HTTPS
- Media Library upload capability must be available for screenshot and image handling
- Page Builder must be able to open a new migrated draft in edit mode
- Prepared migration context must remain valid until approval-driven generation completes

## 3. Functional Requirements

### FR-01: Start URL Migration from MaxAI Chat

**Description:**

The system must allow a merchant to start URL migration directly from MaxAI chat by sending a request that includes a public HTTPS webpage URL.

**Examples of trigger intents:**

- "Migrate this page into my site"
- "Clone this landing page"
- "Build a page from this URL"
- "Use this website as reference"

**Preconditions:**

- Merchant is inside MaxAI.
- Page Builder flow is available.
- Merchant provides a public HTTPS URL.

**Main Flow:**

1. Merchant sends a migration request in chat.
2. MaxAI recognizes the request as URL migration.
3. MaxAI validates the supplied URL.
4. If valid, MaxAI starts the preparation flow.

**Expected UI Behavior or Rules:**

- The request must stay inside the chat workflow.
- Invalid URLs must not start preparation or generation.

### FR-02: Block URL Migration When Page Builder Is Already Locked

**Description:**

The system must prevent URL migration from starting when the merchant already has an incompatible active Page Builder page flow.

**Preconditions:**

- Merchant attempts URL migration while another page-editing lock is active.

**Main Flow:**

1. Merchant sends a URL migration request.
2. MaxAI checks the current Page Builder lock state.
3. If a conflicting lock exists, MaxAI stops before preparation.
4. Merchant is told to finish the current page first.

**Expected UI Behavior or Rules:**

- No screenshot, asset-import, or design-extraction milestone should start while the conflict remains unresolved.
- The blocking message must clearly tell the merchant to save as draft, publish, or otherwise finish the active page flow first.

### FR-03: Capture and Show Source Webpage Slices

**Description:**

Before generation, the system must capture the source webpage as one or more ordered screenshot slices, upload those captures, and show them back to the merchant as the first preparation milestone.

**Preconditions:**

- A valid public HTTPS URL was accepted.

**Main Flow:**

1. MaxAI captures the source webpage.
2. The system uploads the resulting screenshot slices.
3. MaxAI posts a milestone confirming how many source slices were captured.
4. Chat shows the slice previews in order.

**Expected UI Behavior or Rules:**

- The milestone must reference the source URL and viewport when available.
- The chat must show image previews for the uploaded source slices.
- The current flow should treat multi-slice capture as normal behavior, not as an exception.

### FR-04: Import Reusable Source Images and Stream Asset Status

**Description:**

The system must attempt to import reusable source images before generation and must stream a merchant-readable summary of the import result.

**Preconditions:**

- Source capture completed successfully.

**Main Flow:**

1. MaxAI scans the source DOM for image candidates.
2. The system imports supported image assets into Media Library.
3. MaxAI may stream imported image previews while batches are being processed.
4. MaxAI posts an image-assets milestone summarizing the final import state.

**Expected UI Behavior or Rules:**

- The asset summary must show status, completion state, timeout state, attempted count, imported count, deferred count, pending count, skipped count, inline SVG count, and downloaded bytes.
- The milestone may include sample imported media URLs for traceability.
- If import reaches configured limits and pending assets remain, the milestone must still show the partial or timed-out state clearly.
- In the current `main` flow, image-import timeout does not open a separate merchant decision step; the flow still proceeds to the same final generation approval after preparation completes.

### FR-05: Detect Native Video Sources for Structural Reuse

**Description:**

When the source page contains native video elements, the system must detect those sources and surface them as part of preparation so the generated draft can preserve that structure where possible.

**Preconditions:**

- Source capture completed successfully.
- The captured DOM contains native video candidates.

**Main Flow:**

1. MaxAI inspects the captured DOM for native video sources.
2. The system stores those video-source details in the prepared migration context.
3. MaxAI posts a video-assets milestone summarizing the detected videos.

**Expected UI Behavior or Rules:**

- Supported extracted video sources must resolve to `http` or `https` URLs.
- Relative video URLs are supported only when they resolve to a valid `http` or `https` URL against the source page.
- A video source is considered supported when either:
  - its MIME type starts with `video/`, or
  - its resolved URL path ends with `.mp4`, `.webm`, or `.ogg`
- `blob:` URLs must not be extracted or listed as supported video assets.
- Other non-migratable source schemes such as `data:` and `javascript:` must not be extracted.
- Generic player pages or watch pages that do not expose a supported video MIME type or one of the allowed file extensions must not be treated as supported native video assets.
- The milestone should show how many native videos were detected.
- The milestone should list example video source URLs when available.
- Absence of native videos should not block the rest of the migration flow.

### FR-06: Extract the Design System and Read-Only Section Outline

**Description:**

The system must extract a source-informed design system, Tailwind theme tokens, and a read-only section outline before it asks for generation approval.

**Preconditions:**

- Source capture completed successfully.

**Main Flow:**

1. MaxAI extracts the source page's design system.
2. MaxAI derives Tailwind-friendly theme tokens.
3. MaxAI drafts a read-only section outline.
4. MaxAI posts preparation milestones summarizing those artifacts.

**Expected UI Behavior or Rules:**

- The design-system milestone must summarize the primary color, secondary color, background color, heading font, and body font when available.
- The section-outline milestone must list the proposed sections in order.
- These milestones are preparation artifacts only; generation must not start yet.

### FR-07: Require One Final Approval Before Generation

**Description:**

After preparation completes, the system must request one explicit final approval before generating the migrated Tailwind draft.

**Preconditions:**

- Capture, media preparation, and design extraction completed successfully.
- Prepared migration context is in a valid ready state.

**Main Flow:**

1. MaxAI stores the prepared migration context.
2. MaxAI posts an approval request in chat.
3. The request explains that source slices, media assets, design system, and section outline are ready.
4. Merchant chooses either `Approve` or `Reject`.

**Expected UI Behavior or Rules:**

- The approval source must be visibly tied to `Page Builder`.
- The approval card must show `Approve` and `Reject`.
- Generation must not start until approval is explicitly granted.
- The current `main` behavior uses this single approval gate even when image import earlier finished in a partial or timed-out state.

### FR-08: Allow Merchant to Reject the Final Approval

**Description:**

The system must allow the merchant to reject the final approval without creating a migrated Page Builder draft.

**Preconditions:**

- Final approval is pending.

**Main Flow:**

1. Merchant clicks `Reject`.
2. MaxAI confirms that it will not generate the migrated page yet.
3. The pending approval state is cleared.

**Expected UI Behavior or Rules:**

- No new migrated draft must be created from a rejected approval.
- Merchant may later retry the URL migration flow with the same or a different URL.

### FR-09: Generate the Tailwind Draft and Open Page Builder

**Description:**

After approval, the system must generate a Tailwind-based page draft from the prepared migration context and hand that draft off into Page Builder edit mode.

**Preconditions:**

- Final approval was granted.
- Prepared migration context is still valid and complete.

**Main Flow:**

1. MaxAI validates the prepared context again.
2. MaxAI starts Tailwind generation from the approved preparation artifacts.
3. The system opens the `Page Builder` widget in edit mode with the migrated page context.
4. The generated draft is synced into the Page Builder experience.

**Expected UI Behavior or Rules:**

- The system should surface a generation-in-progress state.
- Merchant should land in a Page Builder draft without manually searching for the page.
- The draft should reflect the prepared design system, section outline, and available migrated media assets.

### FR-10: Provide Post-Migration Guidance and Connected Page Suggestions

**Description:**

After successful generation, the system must confirm completion and guide the merchant on what to do next, including connected page suggestions when available.

**Preconditions:**

- Migrated draft was generated successfully.

**Main Flow:**

1. MaxAI posts a completion message in chat.
2. MaxAI tells the merchant the draft is ready in Page Builder.
3. MaxAI instructs the merchant to save as draft or publish before migrating another page.
4. If connected internal page suggestions were detected, MaxAI lists up to five suggested next URLs.

**Expected UI Behavior or Rules:**

- When suggestions exist, they must be shown as concrete URLs.
- When no suggestions exist, the merchant must still receive generic next-step guidance for migrating another page.
- The success message should feel like a clear handoff into Page Builder, not a silent backend completion.

## 4. Acceptance Criteria

**Scenario: Merchant starts URL migration with a valid public HTTPS URL**

```gherkin
Given I am inside MaxAI
When I ask MaxAI to migrate a public HTTPS page URL
Then MaxAI should begin the preparation flow
And I should see preparation milestones in chat
```

**Scenario: Invalid URL is rejected before preparation starts**

```gherkin
Given I am inside MaxAI
When I submit a URL that is not public HTTPS
Then MaxAI should not start URL migration
And I should receive a clear validation message
```

**Scenario: Page Builder lock blocks migration**

```gherkin
Given another Page Builder page flow is currently locked
When I ask MaxAI to migrate a new URL
Then MaxAI should not start preparation
And I should be told to finish the active page first
```

**Scenario: Source capture milestone shows uploaded page slices**

```gherkin
Given URL migration has started
When the source webpage is captured
Then I should see a milestone describing the captured page slices
And I should see one or more source slice previews in chat
```

**Scenario: Image import summary shows partial state when limits are reached**

```gherkin
Given URL migration has started
When source image import reaches configured limits with pending assets remaining
Then I should see an image-assets milestone with pending counts
And the milestone should show the partial or timed-out state clearly
And the flow should still continue toward the standard final approval
```

**Scenario: Native videos are surfaced when detected**

```gherkin
Given the source page contains native video elements
When preparation completes media analysis
Then I should see a milestone describing the detected video sources
And URL migration should continue normally
```

**Scenario: Unsupported video sources are ignored**

```gherkin
Given the source page contains only blob URLs, unsupported schemes, or non-video player page URLs
When preparation completes media analysis
Then those sources should not be listed as supported video assets
And URL migration should continue without them
```

**Scenario: Design system and section outline appear before approval**

```gherkin
Given URL migration preparation is in progress
When design extraction completes
Then I should see a design-system summary
And I should see a read-only section outline
And no final page should be generated yet
```

**Scenario: Final generation requires explicit approval**

```gherkin
Given the migration context is fully prepared
When MaxAI asks for approval
Then I should see Approve and Reject actions
And generation should not begin until I approve
```

**Scenario: Rejecting final approval stops generation**

```gherkin
Given the final generation approval is pending
When I click Reject
Then MaxAI should confirm that it will not generate the page yet
And no migrated Page Builder draft should be created
```

**Scenario: Approved migration opens Page Builder draft**

```gherkin
Given the migration context is ready
When I approve the final generation request
Then MaxAI should generate a Tailwind page draft
And the Page Builder widget should open in edit mode
And the migrated draft should be available for refinement
```

**Scenario: Success message includes connected page suggestions when available**

```gherkin
Given URL migration completed successfully
And connected internal page suggestions were found
When the completion message is shown
Then I should see up to five suggested next-page URLs
And I should be told to save or publish the current page before migrating another page
```

## 5. QA Test Scenarios

### Happy Path

- [ ] Merchant can trigger URL migration from MaxAI with a valid public HTTPS URL.
- [ ] Source webpage slice milestone appears with one or more preview images.
- [ ] Image-assets summary milestone appears after media preparation.
- [ ] Design-system summary milestone appears with extracted token summary.
- [ ] Section-outline milestone appears before approval.
- [ ] Final approval card appears after preparation completes.
- [ ] Clicking `Approve` generates a migrated draft.
- [ ] Page Builder opens in edit mode after approved generation.
- [ ] Success message tells the merchant the draft is ready in Page Builder.
- [ ] Success message tells the merchant to save or publish before migrating another page.

### Media and Preparation Coverage

- [ ] Imported image preview batches can appear while media import is running.
- [ ] Image-assets milestone shows imported, pending, deferred, skipped, inline SVG, and downloaded-bytes information.
- [ ] If media import is partial or timed out, the milestone still shows the incomplete state clearly.
- [ ] If native video sources are detected, a video-assets milestone appears.
- [ ] Relative native video URLs are accepted only when they resolve to valid `http` or `https` source URLs.
- [ ] Video sources with MIME types starting with `video/` are accepted when the resolved source URL is `http` or `https`.
- [ ] Video sources without a MIME type are accepted only when the resolved URL path ends with `.mp4`, `.webm`, or `.ogg`.
- [ ] `blob:` URLs are not listed as supported video assets.
- [ ] `data:` and `javascript:` video URLs are not listed as supported video assets.
- [ ] Generic player or watch-page URLs without a supported video MIME type or allowed file extension are not listed as supported video assets.
- [ ] Connected page suggestions appear when discoverable.
- [ ] No more than five connected page suggestions are shown.

### Approval Behavior

- [ ] Approval card title shows `Approval needed`.
- [ ] Approval source is visibly tied to `Page Builder`.
- [ ] `Approve` and `Reject` buttons are present.
- [ ] Chat composer is blocked while approval is pending.
- [ ] Blocked input placeholder tells the merchant to respond to the approval request above.
- [ ] Approval buttons cannot be triggered repeatedly after response.
- [ ] Current URL migration flow uses a single final approval, including cases where image import earlier ended partial or timed out.

### Negative and Recovery Paths

- [ ] Non-public or non-HTTPS URLs are rejected before migration starts.
- [ ] Existing page lock prevents migration from starting.
- [ ] Rejected final approval does not create a migrated draft.

## 6. Business Rules

- Only public HTTPS URLs are eligible for URL migration.
- A conflicting active Page Builder page lock must block URL migration until the merchant finishes the current page flow.
- Source webpage capture is slice-based in the current flow and must be surfaced back to the merchant.
- Image import must happen before generation so reusable source media can be used where available.
- Image import may end in a ready or partial state; in the current `main` flow the merchant still receives one final approval after preparation rather than a separate partial-assets decision.
- Native video sources should be preserved structurally when detected, but only for sources that resolve to supported `http` or `https` video URLs.
- Final generation is approval-gated.
- A valid ready-state prepared migration context is required before generation can begin.
- URL migration completion hands the merchant into Page Builder for refinement and publishing; MaxAI does not publish automatically.
- Connected page suggestions must be capped at five items.

## 7. Open Questions

- Should the product intentionally surface a dedicated partial-assets approval state in the future, or is the current single-approval flow the desired long-term UX?
- Should the merchant be allowed to rename the target page slug before final generation, or should renaming stay inside Page Builder after handoff?
- Should imported image previews be treated as a required milestone for QA sign-off or remain best-effort streaming feedback during long imports?

## 8. Summary

This BRD defines MaxAI URL Migration as a staged, approval-gated workflow that:

- accepts a public webpage URL in MaxAI chat
- captures the source page as uploaded slices
- imports reusable media and detects native video sources
- extracts a design system and read-only section outline before generation
- requires one explicit final approval before creating a Tailwind draft
- opens the migrated result in Page Builder for refinement, saving, and publishing
