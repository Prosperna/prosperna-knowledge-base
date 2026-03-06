---
id: blog-writer
title: Blog Writer PRD
sidebar_label: Blog Writer
sidebar_position: 3
---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements, acceptance criteria (using BDD/Gherkin), and technical specifications for the MaxAI Blog Writer feature in Prosperna's Merchant Dashboard.

It enables merchants to create SEO-optimized blog posts using a guided, multi-step AI workflow containing topic extraction, title generation, keyword mapping, outline formulation, and full content generation, followed by optional SEO meta tags support. The content is iteratively formulated and presented inside a dedicated side panel widget.

### 1.2 Feature Vision

To empower merchants to effortlessly drive organic traffic and establish authority by producing high-quality, perfectly structured blog content natively within their dashboard, eliminating the need for external content teams or copywriters. Merchants will experience an intelligently paced flow from ideation to publishing with AI managing the heavy lifting.

### 1.3 Success Criteria

**User Adoption & Usage:**
- 30% of eligible merchants opening the Blog Writer widget successfully complete a blog draft or published post.
- Merchants using the Blog Writer average 2+ generated blog posts per month.

**Technical Performance:**
- Streaming of blog content completes without disconnections for 99% of generated articles.
- Tool transition (Topic -> Title -> Keywords/Outline -> Content) averages under 5 seconds of latency per phase.

**Business Impact:**
- Increase feature uptake for paid Prosperna plans (Plus, Pro, Premium) driven by the utility of AI-powered blog creation.
- 20% increase in domain organic ranking pages among users of the feature within 3 months.

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**
Currently, merchants struggle to consistently create high-quality, SEO-optimized blog posts. Writing content from scratch requires time, specific copywriting skills, and an understanding of SEO, which many merchants lack.

1. Merchant decides to write a blog to drive traffic.
2. Merchant lacks ideas (topic) or technical knowledge to incorporate relevant SEO keywords.
3. Merchant writes suboptimal content or gives up entirely, resulting in low organic store traffic.

**Impact of Current Limitations:**
- **Lost Organic Traffic:** Inability to capture search intent through relevant blog articles.
- **Lost Time:** Merchants waste hours staring at a blank page.
- **Poor ROI on Store Plans:** Merchants feel they aren't getting maximum value from their e-commerce store setups if traffic isn't converting.

---

### 2.2 Current State

**Current Content Generation Behavior:**
Before this feature, merchants had to either manually type out blogs via a traditional WYSIWYG editor or rely on external conversational AI that disconnected from their store ecosystem. 
- There was no integrated mechanism for AI to inject a generated blog post directly into their store's CMS.
- Metadata (SEO specific fields) had to be manually concocted and filled.

### 2.3 Desired Future State

**Enhanced MaxAI Blog Writer with Multi-step AI Capabilities:**

1. **Integrated AI Workflow:**
   - Seamless topic and title generation based on simple merchant vague ideas.
   - Intelligent keyword and outline generation mapped to SEO best practices.

2. **Streamlined UI Integration:**
   - A dedicated side panel (Blog Writer Widget) rendering the ongoing generation progress.
   - Options to natively publish or draft the completed blog without leaving the MaxAI interface.

3. **SEO Automation:**
   - AI proactively prompts to generate SEO meta titles and descriptions after content is generated.

### 2.4 Target Users

| User Segment | Description | Use Case | Frequency |
| ------------ | ----------- | -------- | --------- |
| Prosperna Merchants (Paid Plans) | E-commerce store owners on Plus, Pro, or Premium | Writing articles to drive SEO traffic, announce products | Weekly to Monthly |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**
- The Blog Writer Widget must maintain state during navigation, up to 24 hours.
- Backend restricts access to users on the Free plan or those without the Blog app installed.
- Must leverage existing MaxAI SSE event streaming (`text-field-value-stream`, `option-picker`, `grouped-options-picker`).

**Key Assumptions:**
- Merchants will understand the stepped progression of the workflow.
- LLM response quality is sufficient to require minimal merchant editing.

---

## 3. Functional Requirements & BDD Scenarios

### Feature F-01: Plan & App Availability Restrictions

#### 3.1.1 Feature Context
The Blog Writer is a paid feature that requires the active installation of the Blog app from the marketplace.

#### 3.1.2 Business Rules
**BR-01: Plan Restriction**
- Merchants on the Free plan cannot access the tool; instead, the AI agent applies a restriction handling constraint.
**BR-02: App Installation**
- If the Blog App is not installed, the AI provides `HowToAvailBlog` instead of `BlogWriterWidget`.

#### 3.1.3 Scenarios

##### Scenario 1: Merchant on Free Plan attempts to open Blog Writer
```gherkin
Given a merchant is on the Free subscription plan
When the merchant asks MaxAI to write a blog post
Then the system should refuse the request
And advise the merchant that the feature is available on paid plans only
```

##### Scenario 2: Merchant on Paid plan without Blog App installed
```gherkin
Given a merchant is on a Paid subscription plan
And the Blog app is not installed
When the merchant asks MaxAI to write a blog post
Then the system should trigger the HowToAvailBlog tool
And present instructions to install the Blog app
```

---

### Feature F-02: Widget Initialization & State Handling

#### 3.2.1 Feature Context
Accessing the Blog Writer opens a dedicated side panel widget injected with initial context (BlogContext).

#### 3.2.2 Business Rules
**BR-03: Widget Open**
- The widget can be launched via the Welcome Card or natively via conversational intent (WIDGET event).
**BR-04: Confirmation on Close without Save**
- If the user attempts to close the widget directly, prompt a confirmation: "Leave Blog Writer? Your progress will be saved for 24 hours."
**BR-05: Concurrent Widget Restriction**
- If the Blog Writer is active, other widget requests (e.g., SEO Generator) must be refused until closed or completed.

#### 3.2.3 Scenarios

##### Scenario 1: Opening Widget through Welcome Card
```gherkin
Given the merchant is on the MaxAI dashboard
When the merchant clicks the "Blog Writer" card on the Welcome Card
Then the system sends the prompt "Help me write a blog post, please open blog writer widget."
And the side panel opens displaying the empty Blog Writer Widget
```

##### Scenario 2: Attempting to close unsaved widget
```gherkin
Given the Blog Writer Widget is open with unsaved field data
When the merchant clicks the close (X) button or Cancel
Then the system displays a dialog reading "Leave Blog Writer?"
And shows the subtitle "Your progress will be saved for 24 hours."
```

##### Scenario 3: Requesting another widget while Blog Writer is active
```gherkin
Given the Blog Writer Widget is actively open
When the merchant asks MaxAI to open the Product Description widget
Then the AI should refuse the request
And instruct the merchant to complete or close the current Blog Writer first
```

---

### Feature F-03: 4-Stage Content Generation Workflow

#### 3.3.1 Feature Context
The AI strictly follows a 4-part sequential workflow: Topic → Title → Keywords & Outline → Content (streaming).

#### 3.3.2 Business Rules
**BR-06: Topic Generation (Stage 1)**
- Input: `vague_idea`. Output: `option-picker` for `blog_topic`.
**BR-07: Title Generation (Stage 2)**
- Updates context with `blog_topic`, `blog_type`, `blog_style`, `target_audience`, `target_region`. Output: `option-picker` for `blog_title`.
**BR-08: Keywords & Outline Generation (Stage 3)**
- Updates context with `blog_title`, `blog_tone`, `desired_word_count`. Streams outline and yields `grouped-options-picker` for `blog_keywords`.
**BR-09: Content Streaming (Stage 4)**
- Emits `text-field-value-stream` into `blog_content`. Sets status to completed when done.

#### 3.3.3 Scenarios

##### Scenario 1: Topic generation from vague idea
```gherkin
Given the BlogWriterAgent is active
When the merchant types "I want to write about productivity tips"
Then the system applies the generate_blog_topics tool
And returns an option picker containing structured blog topics for the user
```

##### Scenario 2: Title options presented based on topic
```gherkin
Given the merchant has selected a topic via the option picker
When the system processes the selected topic
Then the generate_blog_titles tool is applied
And it returns an option picker with customized title options
```

##### Scenario 3: Keywords selection
```gherkin
Given the merchant has selected a title
When the system applies generate_blog_keywords_and_outline
Then the outline is generated behind the scenes
And a Grouped-Options picker is displayed for primary, secondary, long_tail, and LSI keywords
```

##### Scenario 4: Content streaming to widget body
```gherkin
Given the merchant has validated the keywords and outline
When the generate_blog_content tool executes
Then text chunks are sent via text-field-value-stream to the field "blog_content"
And the Blog Writer widget content area dynamically types out the blog post
```

---

### Feature F-04: SEO Meta Tags Formulation

#### 3.4.1 Feature Context
Upon blog content completion, the AI proactively seeks user approval to generate SEO meta titles and descriptions.

#### 3.4.2 Business Rules
**BR-10: SEO Approval Trigger**
- Only triggered after content generation. Uses the Approval events mechanism, independent of the 4 blog iteration tools.
**BR-11: SEO Metadata Population**
- If approved, Populates `blog_seo_meta_title` and `blog_seo_meta_description` in the widget.

#### 3.4.3 Scenarios

##### Scenario 1: User approves SEO Meta generation
```gherkin
Given the blog content generation has successfully completed
Then the AI sends an approval message "Do you want me to generate the SEO meta tags for this blog?"
When the merchant clicks "Yes" or approves
Then the system executes BlogSeoMetaTagsGenerator
And populates the meta_tags fields within the widget
```

---

### Feature F-05: Saving and Completion Delivery

#### 3.5.1 Feature Context
After reviewing the blog form, the merchant can publish or save the draft directly from the integrated embedded form (`BlogUpdate`).

#### 3.5.2 Business Rules
**BR-12: Form Submission**
- Saving fires `createBlogCompletionPayload` injecting `blog_title`, `blog_id`, `blog_slug`, `is_draft`.
**BR-13: Panel Closure**
- The widget side panel subsequently auto-closes on successful save completion, resetting widget context.

#### 3.5.3 Scenarios

##### Scenario 1: Saving Blog as Draft
```gherkin
Given the Blog Writer Widget is populated with generated content
When the merchant clicks "Save as Draft" in the UI
Then the system sends the completion payload to the backend
And the system closes the Blog Writer side panel
And the conversation resets its active_widget status
```

---

## 4. Non-Functional Requirements

### 4.1 Performance
| Requirement | Metric | Measurement Method |
| ----------- | ------ | ------------------ |
| Streaming Latency | Start content generation < 3 seconds after confirmation | Server Logs |
| Widget Render Time | < 1s to open the widget | Browser Performance API |

### 4.2 Usability
| Requirement | Target | Measurement |
| ----------- | ------ | ----------- |
| Completion Rate | > 80% task success rate for creating a blog after opening | Product Analytics |

### 4.3 Compatibility
| Requirement | Standard | Validation |
| ----------- | -------- | ---------- |
| Browser support | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Cross-browser testing |

---

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: Full Blog Generation**
1. User requests Blog Writer -> Widget Opens
2. AI prompts for topic -> User replies
3. AI streams topics (Option picker) -> User selects
4. AI streams titles (Option picker) -> User selects
5. AI streams grouped keywords -> User selects
6. AI streams content directly into the Widget's rich text editor
7. AI prompts for SEO meta tags -> User approves -> Meta fields populate
8. User reviews content -> Hits Publish/Draft
9. Widget clears and closes.

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**
- **Frontend (MaxAI Dashboard)**
  - `BlogWriterWidget` + `BlogUpdate` embedded form.
  - Updates via React state managed inside `MaxAIContext`.
- **Backend (aina-service)**
  - `AgentRoutingHandler` delegates requests to `BlogWriterAgent`.
  - Tools explicitly scoped: `generate_blog_topics`, `generate_blog_titles`, `generate_blog_keywords_and_outline`, `generate_blog_content`.
  - Sub-agent lifecycle relies closely on streaming SSE (`turn-stream`, `text-field-value-stream`, `option-picker`, `approval`).

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type | Coverage Target | Responsibility | Tools |
| --------- | -------------- | -------------- | ----- |
| Unit Tests | > 85% coverage on Payload helpers & Context formatting | Dev Team | Jest, Pytest |
| End-to-End Tests | Cover complete 4-stage widget lifecycle simulation | QA Team | Playwright / Cypress |

### 7.2 Critical Test Scenarios

**High Priority:**
1. State restoration. Verify that refreshing the page mid-generation properly reconstructs the `BlogContext` and the widget remains visible with populated form fields.
2. Ensure the main agent restricts opening other widget requests while `BlogWriterWidget` is open.
3. Verify formatting of grouped keywords (from primary, secondary arrays into a single string for the form).

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| LLM Timeout during content streaming | High | Implement retry mechanism and chunked streaming with continuous Keep-Alive events. |
| User closes widget accidentally resulting in lost progress | Medium | Implemented the "Leave Blog Writer?" intercept dialog. Backend persists conversation `widgetContext` for up to 24h. |
| Widget Context Bloat | High | `blog_content` is purposefully excluded from the `BlogWriterAgent` system message to avoid breaking token limits. |

---

## Approval and Sign-off

| Stakeholder       | Role | Status      | Date Signed       |
| ----------------- | ---- | ----------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---               |
| Ruel Nopal        | HoE  | ☐ Pending   | ---               |
| Aira Pilor        | QA   | ☐ Pending   | ---               |
| Michael Santos    | BE   | ☐ Completed | March 3, 2026     |
| Brian Millonte    | FE   | ☐ Completed | March 3, 2026     |