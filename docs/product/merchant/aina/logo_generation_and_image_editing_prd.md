---
id: logo_generation_and_image_editing
title: Logo Generation and Image Editing PRD
sidebar_label: Logo Generation and Image Editing
sidebar_position: 4
---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements, acceptance criteria (using BDD/Gherkin), and technical specifications for the Logo Generation and Image Editing features in Prosperna's Merchant Dashboard via MaxAI chat and the shared Media Library.

This feature enables merchants to use AI to generate base logos, logo variations (favicons, wordmarks), and perform image editing tasks (background removal, quality enhancement, lighting adjustment, and background replacement) directly from the dashboard, leveraging a centralized AI infrastructure.

### 1.2 Feature Vision

Empower merchants to create professional-grade branding assets and high-quality product imagery without leaving the Prosperna platform or requiring specialized design software. By integrating conversational AI (MaxAI) with advanced image processing tools, merchants can rapidly iterate on their visual identity and product presentation.

### 1.3 Success Criteria

**User Adoption & Usage:**
- 20% of new merchants utilize the logo generation tool within their first week of onboarding.
- 15% of active merchants use at least one AI image-editing feature per month.

**Technical Performance:**
- AI image generation and editing tasks complete within an average of 15 seconds.
- 95% success rate for Fal.ai and AI processing API calls.

**Business Impact:**
- Increase in merchant subscription upgrades to tiers providing higher AI credit allowances.
- Reduction in time-to-launch for new store setups due to streamlined asset creation.

**User Satisfaction:**
- Positive feedback specifically mentioning ease of creating store branding via MaxAI.

### 1.4 Related Documents

- [MaxAI Architecture Overview](docs/max-ai/architecture)
- [Prosperna AI Credits System Guide](docs/max-ai/credits)
- [Media Library Components Reference](docs/components/media-library)

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

Merchants starting on the platform often lack professional logos or high-quality product images. Sourcing or creating these assets externally delays store launch and creates friction during onboarding.
Currently, if a merchant wants a logo or an edited product image, they must:
1. Leave Prosperna to use tools like Canva, Photoshop, or hire a designer.
2. Download the resulting assets locally.
3. Return to Prosperna, navigate to the Media Library or Business Profile, and manually upload the assets.
4. If adjustments are needed, they must repeat the entire external workflow.

**Impact of Current Limitations:**
- **Delayed Onboarding:** Time spent acquiring assets prolongs the "time to first sale".
- **Poor Visual Quality:** Merchants without design resources may upload suboptimal images, hurting their store's conversion rate.
- **Workflow Friction:** Context switching between the dashboard and external tools disrupts the user experience.

### 2.2 Current State

**Current Logo & Media Behavior:**

1. **Brand Identity Setup:**
   - Merchants manually upload existing logos and favicons in the Business Profile settings.
   - No built-in assistance for brand creation.

2. **Image Management:**
   - The Media Library serves merely as a storage repository for manual file uploads.
   - MaxAI chat can attach images, but cannot generate or manipulate them natively.

**Current Limitations:**
- Total reliance on external tools for asset creation and editing.
- MaxAI cannot actively assist with visual aspects of store building.

### 2.3 Desired Future State

**Enhanced Media Library and MaxAI with AI Capabilities:**

1. **Conversational Logo Generation:**
   - Merchants can chat with MaxAI to define their brand, resulting in prompt-engineered, AI-generated base logos (transparent and with background) and variations (favicons, wordmarks).

2. **Centralized AI Image Editing:**
   - Within the Media Library (accessible standalone or via MaxAI), merchants can remove backgrounds, enhance quality, adjust lighting, and replace backgrounds on any image.

3. **Seamless Asset Integration:**
   - Generated/edited images are immediately available in the Media Library, can be attached to chat for further AI iterations, and applied directly to the store profile with a single click.

**Benefits After Implementation:**
- **Frictionless Branding:** Create a core brand identity directly alongside store setup conversations.
- **Instant Image Optimization:** Fix product imagery instantly without external software.
- **Centralized Asset Flow:** "Generate -> Edit -> Apply" happens in one smooth, interconnected platform loop.

### 2.4 Target Users

| User Segment | Description | Use Case | Frequency |
| ------------ | ----------- | -------- | --------- |
| New Merchants | First-time store creators on Prosperna | Generating initial logo, favicon, and standardizing starting product imagery | High during onboarding |
| Active Merchants | Existing subscribers managing active stores | Enhancing new product photos, removing backgrounds for consistency | Ongoing, periodic |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**
- Image editing operations are resource-intensive; must implement robust loading states and timeout handling.
- Must integrate closely with the existing AI credit billing system (`stream_state.usage_cost_details`).
- Relies on third-party APIs (Fal.ai, OpenAI) for core generation logic.

**Business Constraints:**
- Logo and Image editing tools deduct AI credits based on dynamic configurations (`CreditRequirements.FEATURE_REQUIREMENTS`). Tool usage must stop if credits are insufficient.
- Minimum credit threshold checks must happen before executing expensive Fal.ai streams.

**Key Assumptions:**
- Merchants find conversational prompt inputs intuitive for design tasks.
- The default output formats (.png, .jpg) and resolutions meet primary ecommerce requirements.

---

## 3. Functional Requirements & BDD Scenarios

---

### Feature F-01: Conversational Logo Generation

#### 3.1.1 Feature Context

Merchants can ask the MaxAI agent to create a logo. The agent uses tools (`generate_logo_v2`, `logo_variations_generator`) to generate images via Fal.ai, upload them to the Media Library, and return them as visual markdown tags in the chat.

#### 3.1.2 Business Rules

**BR-01: Tool Parameters**
- Standard generation requires inputs: `store_name`, `logo_style_type`, `logo_style_approach`, `logo_primary_color`, `logo_secondary_colors`, `logo_trend_preference`. Missing names fall back to session context.
- Validation must yield an error turn if base context like `store_name` is irretrievable.

**BR-02: Credit Verification**
- Generation must verify a minimum of 25 AI credits. Variations generation must verify a minimum of 30 AI credits.
- Costs must be deducted for the OpenAI prompt refinement and the Fal image generation independently, mapping to appropriate `data_type` metrics.

**BR-03: Render Format**
- The backend must yield `Event(type='turn')` outputs containing `<image type='[type]' href='[url]' />`.
- MaxAI frontend must intercept these tags, strip them from markdown text, and render them in a `max-ai-generated-logos-grid`.

#### 3.1.3 Scenarios

##### Scenario 1: Generate Base Logo Successfully

```gherkin
Given the merchant is in MaxAI chat and has sufficient AI credits
And the session contains a valid `store_name`
When the user asks "Can you design a logo for my store?"
Then the MaxAI backend executes the `generate_logo_v2` tool
And uploads the resulting transparent and background-inclusive logos to P1 Media
And returns a chat turn containing `<image type='primary logo' ... />` tags
And the UI renders the logos in a dedicated image grid with a transparent styling variant
And deducts the computed AI credits for the prompt and image generation
```

##### Scenario 2: Generate Logo Variations

```gherkin
Given the merchant has successfully generated a base logo in the current chat session
When the user asks "Generate a favicon from that logo"
Then the MaxAI agent executes the `logo_variations_generator` tool passing the `base_logo_url`
And uploads the new favicon and wordmark to P1 Media
And returns a chat turn containing the variation image tags
And suggests applying the branding to the store using `update_store_logo_and_favicon`
```

##### Scenario 3: Insufficient Credits for Logo

```gherkin
Given the merchant has less than 25 AI credits
When the user asks "Can you design a logo for my store?"
Then the system blocks the tool execution prior to calling Fal.ai APIs
And the MaxAI agent responds with a system turn indicating insufficient credits
And no images or media entities are created
```

---

### Feature F-02: Apply Logo to Store Profile via Chat

#### 3.2.1 Feature Context

After generating logos, the agent can actively apply the generated images directly to the merchant's Business Profile settings avoiding manual setup.

#### 3.2.2 Business Rules

**BR-01: Direct Application**
- The `update_store_logo_and_favicon` tool requires valid Media Library IDs for `logo_id` and `favicon_id`.
- This operation does not consume AI credits.
- The UI should block fallback text generation during this execution and only return success/error status turn.

#### 3.2.3 Scenarios

##### Scenario 1: Apply Logo and Favicon

```gherkin
Given the merchant has generated base logos and variations in chat
And the chat context has updated `logo_context` with valid media IDs
When the user says "Yes, apply these to my store"
Then the agent executes `update_store_logo_and_favicon`
And the merchant's Business Profile updates with the new branding assets immediately
And the agent responds with a confirmation message in the chat
```

---

### Feature F-03: Centralized AI Image Editing in Media Library

#### 3.3.1 Feature Context

The Media Library offers a suite of AI tools (`useAIImageEditing`) to modify existing images. These include Background Removal, Quality Enhancement, Lighting Adjustment, and Background Replacement.

#### 3.3.2 Business Rules

**BR-01: File Handling**
- AI tools must validate the target image as a valid data URL or HTTP(S) URL.
- Processed images from external AI endpoints must be converted to `File` objects and uploaded via `MediaAPI.useUploadImageMediaItem` as new media entities.

**BR-02: Specific Operation Hooks**
- Background Removal routes to `useRemoveBackground` -> Fal.ai `BRIA_2` -> Upload.
- Enhancement routes to `useEnhanceImage` -> Fal.ai `TOPAZ_ENHANCEMENT` -> Upload.
- Background Replacement (text/image) routes to `useBackgroundReplacement` -> Fal.ai `NANO_BANANA_EDIT` -> Upload.
- Filtering operations run locally via Canvas manipulations before saving.

#### 3.3.3 Scenarios

##### Scenario 1: Remove Image Background via Media Library UI

```gherkin
Given the merchant opens a product image in the Media Library AI editing view
When the user selects "Remove Background"
Then the system calls the frontend background removal service
And processes the image via the AI endpoint
And converts the result to a new file and uploads it to the Media Library
And displays a success notification notifying the user the new asset is ready
```

##### Scenario 2: Save Edited Canvas Filters

```gherkin
Given the merchant has an image open in the Media Library AI editing view
When the user applies standard visual filters using canvas sliders
And clicks the specific "Save Edited Image" button
Then the localized edits are converted to a file
And uploaded to the Media Library as a distinct new item
```

---

### Feature F-04: Reusing AI Assets in MaxAI Chat

#### 3.4.1 Feature Context

Images generated natively by the MaxAI backend (Logos) or edited manually via the Media Library UI must be effortlessly attachable back into MaxAI conversations as input for subsequent queries.

#### 3.4.2 Business Rules

**BR-01: Cache Invalidation**
- Opening the Media Library from MaxAI via the `useChatMediaLibrary` hook MUST invalidate the React Query cache `['media-items']` to guarantee freshly generated/edited assets are visible.

**BR-02: Attachment Payload**
- Selected items must map explicitly to `media_image_id`, `media_image_url`, and `media_type: 'image'` in the `createChatPayload` attachment structure.

#### 3.4.3 Scenarios

##### Scenario 1: Attach Recently Generated/Edited Logo to New Prompt

```gherkin
Given the merchant has recently generated or edited a logo
And is viewing the main MaxAI input area
When the user clicks the "Media Library" attachment icon
Then the `['media-items']` cache invalidates
And the Media Library modal opens displaying the latest items
When the user selects the edited logo and clicks "Select"
And types "Make this look more modern" and clicks send
Then the payload sent to the backend includes the correct `media_image_id` and `media_image_url`
And the assistant message block displays a thumbnail of the attached image
```

---

### Feature F-05: Image Editing Conversational Tools (Agent Chat)

#### 3.5.1 Feature Context

Users can trigger image editing tools using natural language within MaxAI, targeting either attached images or previously generated images in the context.

#### 3.5.2 Business Rules

**BR-01: Tool Triggers & Verification**
- Tools (`background_eraser`, `image_quality_enhancer`, `lighting_adjustment`, `background_replacer`) require a valid `media_image_url` string.
- Credit Minimums check before Fal.ai streaming triggers: Background Remover (7), Enhancement (52), Lighting (14), Replacement (14).
- Output creates a new Media asset and yields a system turn with an injected image tag.

#### 3.5.3 Scenarios

##### Scenario 1: Natural Language Background Removal

```gherkin
Given the user has attached an image URL to their MaxAI prompt
And has at least 7 AI credits
When the user asks "Can you remove the background from this image?"
Then the agent executes the `background_eraser` tool reading the attached URL
And the agent processes the stream, deducting credits upon `feature-response` completion
And uploads the new transparent image to the Media Library
And outputs a chat turn containing the new `<image>` tag showcasing the result
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement | Metric | Measurement Method |
| ----------- | ------ | ------------------ |
| Logo Generation API Speed | < 25 seconds for initial prompt + Fal stream | APM tracing on Fal/OpenAI tool wrapper |
| Media Library Initialization | < 2 seconds opening from chat | Client-side performance monitoring |

### 4.2 Usability

| Requirement | Target | Measurement |
| ----------- | ------ | ----------- |
| Image Render Flexibility | Handle 10+ logos in a single chat turn | CSS Grid viewport overflow testing |
| Transparent Logos | Clear grid checkboard backings for accurate representation | Visual Regression testing |

---

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: Logo Generation to Store Application**

```
[MaxAI Chat] User asks for logo → [Agent] `generate_logo_v2` tool executes
→ [Backend] Deducts credits, generates base images, saves to Media Library
→ [Frontend] Renders `<image>` tags in `max-ai-generated-logos-grid`
→ [MaxAI Chat] User asks for variations
→ [Agent] `logo_variations_generator` executes
→ [Backend] Generates favicon/wordmark, saves to Media Library
→ [Frontend] Renders new image grid
→ [MaxAI Chat] User confirms "Apply these"
→ [Agent] `update_store_logo_and_favicon` tool executes
→ Store configuration updated successfully
```

---

## 6. Technical Architecture & System Design

### 6.1 Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Prosperna Frontend                       │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ MaxAI Chat Components │   │ Media Library Components  │  │
│  │ ├ AssistantMsgContent │──>│ ├ MediaLibraryModal       │  │
│  │ ├ ImageTag (Parser)   │<──│ ├ useChatMediaLibrary     │  │
│  │ ├ maxAI.scss (Grid)   │   │ ├ useAIImageEditing       │  │
│  └───────────────────────┘   └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway / Backend Services              │
│  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │ Prosperna Agent Stream │  │ Media Upload / Management │  │
│  │ ├ Tool Registry (Logo) │  └───────────────────────────┘  │
│  │ ├ Tool Registry (Image)│                                 │
│  │ ├ AI Credit Handlers   │──> Fal.ai / OpenAI              │
│  └────────────────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Testing Strategy

### 7.1 Cross-Cutting Test Concerns

| Test Type | Scenario Focus | Tool Focus |
| --------- | -------------- | ---------- |
| Frontend Unit | `parseImagesFromContent` correctly strips `<image type='x' href='y'/>` tags preventing markdown breakage. | Jest |
| Integration | `useChatMediaLibrary` invalidate cache reliably triggers fresh media list containing generated logos after agent turn. | RTL |
| Agent Integration | End-to-end mocked `POST /v1/aina/agent/prosperna/chat/...` yielding appropriate cost logs and P1 media stubs for Tools. | PyTest |
| Fallback / Error | Invalid URLs provided to image tools yield graceful system turns instead of crashing the SSE stream. | PyTest |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| Exceeding Fal.ai Timeouts | High | Agent tools chunk processing and stream `cost_details` safely. Implement strict timeout polling on FE for media loading. |
| Inaccurate Credit Deduction | Medium | `stream_state` correctly captures cost during stream breaks; Agent decorator finalizing handler ensures strict arithmetic. |
| Chat UI Re-Render Lag | Low | `ReactMarkdown` components heavily memoized; image extraction algorithm operates linearly based on raw content string length. |

---

## Approval and Sign-off

| Stakeholder       | Role | Status      | Date Signed       |
| ----------------- | ---- | ----------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---               |
| Ruel Nopal        | HoE  | ☐ Pending   | ---               |
| Aira Pilor        | QA   | ☐ Pending   | ---               |
| Michael Santos    | BE   | ☐ Completed | March 6, 2026     |
| Brian Millonte    | FE   | ☐ Completed | March 6, 2026     |
