---
id: ai-powered-onboarding-enhancement
title: AI-Powered Onboarding Enhancement PRD
sidebar_label: AI-Powered Onboarding Enhancement
sidebar_position: 2
---

Agile-focused PRD documenting the enhancement of Prosperna's merchant onboarding experience from traditional form-based setup to AI-powered conversational onboarding using natural language chat interactions with real-time store preview.

## Document Control

| Item           | Details                           |
| -------------- | --------------------------------- |
| Document Title | AI-Powered Onboarding Enhancement |
| Version        | 1.1                               |
| Date           | November 30, 2025                 |
| Prepared by    | Business Analyst                  |
| Reviewed by    | To be assigned                    |
| Approved by    | To be assigned                    |
| Status         | For Review                        |
| Related BRD    | To be created                     |

---

## Revision History

| Version | Date              | Author           | Change Description                                              |
| ------- | ----------------- | ---------------- | --------------------------------------------------------------- |
| 1.0     | November 30, 2025 | Business Analyst | Initial draft - AI-powered onboarding enhancement specification |
| 1.1     | December 05, 2025 | Business Analyst | Added Feature F-12: Plus Button & Premium Feature Discovery     |

---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the detailed functional requirements, acceptance criteria (using BDD/Gherkin), and technical specifications for enhancing Prosperna's merchant onboarding experience from traditional form-based setup to an AI-powered conversational flow. The enhancement transforms the 5-step Setup Guide into a natural language chat interface with real-time store preview, enabling merchants to configure their stores through intuitive conversations rather than manual form completion.

The AI-powered onboarding maintains all existing setup requirements (store branding, location, first product, shipping, payments) while dramatically improving user experience through conversational AI, intelligent tool-calling for freestyle inputs, progressive disclosure of forms within chat flow, and immediate visual feedback via live store preview.

### 1.2 Feature Vision

Transform merchant onboarding from a tedious form-filling experience into an engaging, conversational journey where merchants naturally describe their business needs and watch their store come to life in real-time. The AI assistant guides merchants through setup with the ease of chatting with a knowledgeable colleague, interpreting freestyle requests, and updating store configurations seamlessly while providing instant visual confirmation of changes.

### 1.3 Success Criteria

**User Adoption & Usage:**

- 85% of new merchants complete all 5 setup steps (vs. current baseline of merchants not completing setup)
- 90% reduction in setup abandonment at each step checkpoint
- 70% of merchants use natural language editing at confirmation points
- Average time to complete setup reduces by 50% compared to traditional form-based flow
- 95% of merchants successfully configure store through AI chat without support intervention

**Technical Performance:**

- AI response time less than 2 seconds for standard queries (P95)
- Store preview updates in less than 1 second after configuration changes
- Tool-calling interpretation accuracy greater than 95% for common merchant requests
- Chat interface loads in less than 2 seconds on merchant dashboard
- Device view switching in store preview completes in less than 500ms

**Business Impact:**

- Significant increase in merchants who complete entire onboarding flow
- Significant reduction in time-to-first-product-listed
- Significant increase in merchant retention within first 30 days (due to completed setup)

### 1.4 Related Documents

- [AI Onboarding Complete Context Documentation](https://app.clickup.com/t/86eva9t13)

---

## 2. Background & Context

### 2.1 Problem Statement

**Current Pain Point:**

Prosperna's current merchant onboarding experience requires new merchants to complete a 5-step Setup Guide through traditional form-based interactions. After completing a 6-question onboarding survey, merchants are redirected to the dashboard with a Setup Guide sidebar showing:

1. Update Store Branding (name, slogan, industry, subdomain, logo)
2. Update Store Location (address, phone, hours, email)
3. Upload a Product (first product with details, images, labels)
4. Set Up Shipping (shipping method configuration)
5. Set Up Payments (payment gateway setup)

This creates several critical user experience issues:

**Form Fatigue & Cognitive Overload:**

- Merchants face multiple pages of forms with numerous fields per step
- No contextual guidance on what to enter or why fields matter
- Unclear which fields are required vs optional until validation errors appear
- Long forms intimidate merchants, especially those new to ecommerce

**High Abandonment Rates:**

- Merchants abandon setup partway through due to complexity
- Some merchants skip setup entirely and start selling with incomplete configurations
- Dropout occurs most frequently at "Upload a Product" (perceived as complex)
- No clear value proposition shown during setup journey

**Limited Flexibility & Editing Difficulty:**

- Fixed form structure doesn't accommodate merchant's natural workflow
- Making changes requires navigating back to specific form sections
- No ability to edit via natural language (e.g., "change subdomain to mybakery")
- Confirmation points are absent, merchants only see changes after save

**No Visual Feedback During Setup:**

- Merchants cannot see how their store will look while configuring
- No real-time preview of branding changes, product displays, etc.
- Uncertainty about whether settings are correct until viewing live store
- Disconnect between setup forms and actual storefront appearance

### 2.2 Current State

**Current Traditional Form-Based Setup Guide:**

1. **After Onboarding Survey Completion:**

   - Merchant completes 6 questions (how heard about us, who creating for, current situation, industry, goals, business size)
   - Redirected to merchant dashboard
   - Setup Guide appears in left sidebar showing "Setup Guide X of 7" progress

2. **Step 1: Update Store Branding**

   - Form displays with fields: Store Name, Store Slogan, Industry (dropdown), Store Subdomain, Logo Upload
   - Merchant fills each field manually
   - Clicks Save button to proceed
   - No preview of how branding looks on storefront

3. **Step 2: Update Store Location**

   - Form displays with fields: Address (line, province, city, barangay, postal code), Primary Phone, Alternate Phone, Store Hours (time pickers), Store Email
   - Merchant fills all fields
   - Clicks Save button
   - No validation on optimal store hours or address format guidance

4. **Step 3: Upload a Product**

   - Form displays with fields: Product Name, Brand, Category, Long Description, Short Description, Regular Price, Unit Cost, Sale Price, Size/Weight, Featured Image, Product Labels
   - Merchant must understand all product fields upfront
   - No AI assistance for suggesting defaults
   - Product preview only visible after creation

5. **Step 4: Set Up Shipping**

   - Form displays shipping method options (Manual by Customer, Manual by Merchant, Store Pickup)
   - Merchant selects method and configures rate/description
   - No guidance on which method suits their business model
   - Can skip this step

6. **Step 5: Set Up Payments**
   - Phone verification required for payment setup
   - Payment gateway (myPay) setup process
   - Can skip this step

**Current Limitations:**

- **No Conversational Interface:** Pure form-based, no natural language interaction
- **No Real-Time Preview:** Merchants cannot see store changes as they configure
- **No AI Assistance:** No intelligent suggestions or auto-generation of content
- **No Freestyle Editing:** Changes require navigating back to forms, no "change X to Y" capability
- **No Confirmation Points:** No review step before finalizing each section
- **Limited Contextual Help:** No chat-based guidance on what to enter

### 2.3 Desired Future State

**Enhanced AI-Powered Conversational Onboarding:**

1. **Chat Interface with Real-Time Preview (60/40 Split):**

   - **Left Side (40%):** AI chat interface with message bubbles, input controls, buttons
   - **Right Side (60%):** Live store preview showing changes in real-time
   - Toggle button to hide/show preview (expands chat to 100% when hidden)
   - Device view selector (Mobile, Tablet, Desktop) in preview section

2. **Conversational Flow Through 5 Setup Steps:**

   **Step 1: Update Store Branding**

   - AI asks for store name via text input
   - AI asks for slogan via text input
   - AI asks for industry via dropdown selector
   - AI asks for logo via two-card selection (Upload Manually vs Generate with AI)
   - Generate with AI path: AI asks layout, design style, colors (primary, secondary, accent), fonts, aesthetic through progressive questions
   - AI asks for subdomain with auto-generated suggestions
   - AI displays summary with "No, I'd like to make changes" and "Next" buttons
   - Freestyle editing: Merchant types changes, AI interprets and updates via tool-calling

   **Step 2: Update Store Location**

   - AI asks for address via form (Address, Province, City, Barangay, Postal Code, Country)
   - AI asks for contact numbers via form (Primary + Optional Alternate)
   - AI asks for store hours via time pickers (Opening + Closing)
   - AI asks for store email via text input
   - AI displays summary with confirmation buttons
   - Freestyle editing capability at confirmation point

   **Step 3: Upload a Product**

   - AI asks product type (Physical or Digital) via two-card selection
   - AI asks product name (with option to provide all details at once via freestyle input)
   - AI progressively asks: Brand, Category, Long Description, Regular Price, Unit Cost, Sale Price
   - For physical products: AI asks measurements (freestyle input, parses "L: 12cm, W: 13cm, H: 14cm, weight: 1.5kg")
   - AI asks for featured image via Upload Manually
   - AI asks for product labels (New, Best Seller, Sale) via multi-select dropdown
   - AI displays summary with confirmation buttons
   - Freestyle editing for any product detail

   **Step 4: Set Up Shipping**

   - AI asks if merchant wants to set up shipping via buttons (Skip for now / Yes, set up shipping)
   - If yes: AI displays shipping method cards (Manual Shipping by Customer, Manual Shipping by Merchant, Store Pickup, Standard Delivery*, Same Day Delivery*)
   - Merchant clicks "Set Up" on chosen method
   - Configuration form appears in place of store preview (60% right side)
   - After save, page refreshes and AI moves to next step

   **Step 5: Set Up Payments**

   - AI asks if merchant wants to set up payments via buttons (Skip for now / Yes, set up online payments)
   - If yes: AI asks for phone number verification
   - OTP verification flow via input field
   - AI asks to continue to myPay setup via buttons (Skip for now / Continue to myPay Setup)
   - Redirects to existing myPay registration if Continue selected

3. **Progressive Disclosure & Dynamic Input Types:**

   - Text boxes for text input (store name, email, etc.)
   - Dropdown selectors for predefined options (industry, labels)
   - Forms for multi-field structured data (address, contact numbers)
   - Buttons for action choices (Next, No I'd like to make changes, Skip)
   - Cards/Tiles for option selection (Upload vs Generate, Product Type)
   - Time pickers for store hours
   - Color pickers for logo generation
   - Media preview for uploaded/generated images

4. **AI Tool-Calling & Freestyle Input Interpretation:**

   - Merchant can type natural language at confirmation points (e.g., "Change subdomain to mrsgoodiesbakery")
   - AI uses tool-calling to interpret intent and identify fields to update
   - AI executes updates and re-displays confirmation with updated data
   - Handles complex requests like "Change price to 1200 and sale price to 999"

5. **Real-Time Store Preview Updates:**

   - Store preview updates immediately as merchant provides information
   - Branding changes (logo, name, colors) visible in preview header
   - Product changes (image, name, price) visible in product card
   - Device view switching shows responsive behavior

6. **Clear Progress & State Management:**
   - Each completed step marked as COMPLETE
   - Page refreshes after major step completions (Product, Shipping, Payments)
   - Conversation resets after refresh, AI starts next step
   - Store preview switches between Store Preview and Product Preview based on step

**Benefits After Implementation:**

- **Reduced Cognitive Load:** Conversational flow presents one question at a time instead of overwhelming forms
- **Increased Completion Rates:** Engaging chat experience reduces abandonment
- **Faster Setup Time:** AI assistance and auto-generation speed up configuration
- **Immediate Visual Feedback:** Merchants see changes in real-time, building confidence
- **Flexible Editing:** Natural language changes eliminate need to navigate back to forms
- **Better Data Quality:** AI can suggest improvements and catch errors conversationally
- **Enhanced User Experience:** Setup feels like a guided conversation rather than bureaucratic forms
- **Reduced Support Burden:** Contextual AI guidance reduces "how do I" questions

### 2.4 Target Users

| User Segment                            | Description                                          | Use Case                                                                         | Frequency                |
| --------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| First-Time Ecommerce Merchants          | New to online selling, no prior ecommerce experience | Complete initial store setup with AI guidance, need hand-holding through process | One-time (initial setup) |
| Experienced Merchants (Platform Switch) | Migrating from another platform                      | Quickly configure store using natural language, leverage AI for efficiency       | One-time (initial setup) |
| Non-Technical Merchants                 | Limited technical skills, prefer conversational UX   | Describe business needs naturally, let AI handle technical configuration         | One-time (initial setup) |
| Time-Constrained Merchants              | Need fast setup to start selling quickly             | Use AI auto-generation for logos and descriptions, freestyle input for speed     | One-time (initial setup) |
| Visual Learners                         | Need to see results to understand configuration      | Rely heavily on real-time store preview to guide decisions                       | One-time (initial setup) |

### 2.5 Project Constraints & Assumptions

**Technical Constraints:**

- Must maintain all existing data collection requirements (no fields can be removed)
- AI model/service provider may change (must be implementation-agnostic in documentation)
- Tool-calling uses custom implementation (not specific to any LLM provider)
- Must work within existing Prosperna authentication and session management
- Page refreshes required after major step completions to reset state
- Mobile responsiveness required for chat interface and preview

**Business Constraints:**

- Cannot extend onboarding time beyond current average (must be faster or equal)
- Must maintain data quality standards for merchant information
- Cannot introduce new mandatory fields that weren't required before
- Must support existing myPay integration without changes
- Setup completion must still allow skipping Shipping and Payments steps
- Must comply with data privacy regulations (all data handling remains unchanged)

**Key Assumptions:**

- Merchants are comfortable with chat-based interfaces (increasingly common UX pattern)
- AI interpretation accuracy will be sufficient for common merchant requests
- Merchants will provide complete information when prompted (same as current forms)
- Real-time preview updates will help merchants make better configuration decisions
- Freestyle editing at confirmation points will be intuitive to merchants
- Device view switching in preview is non-essential (nice-to-have, no specific behavior required beyond width adjustment)
- AI can successfully parse freestyle measurement inputs (e.g., "12 x 13 x 14 cm, 1.5kg")
- Logo generation AI will produce acceptable quality images for most merchants

**AI Behavior Assumptions:**

- When AI cannot interpret freestyle input: AI re-asks the previous question
- AI tool-calling will correctly identify fields to update from natural language
- AI responses will maintain conversational tone and provide encouragement
- AI will auto-generate short descriptions from long descriptions accurately
- AI will generate subdomain suggestions based on store name intelligently

---

## 3. Functional Requirements & BDD Scenarios

---

### Feature F-01: AI Chat Interface Layout & Toggle Functionality

#### 3.1.1 Feature Context

Provide merchants with a split-screen layout featuring an AI chat interface (40% width) on the left and a real-time store preview (60% width) on the right, with toggle functionality to hide/show the preview and device view selectors for responsive preview.

#### 3.1.2 Business Rules

**BR-01: Default Layout**

- Screen divided into two sections: Chat (left, 40%) and Store Preview (right, 60%)
- Chat section contains AI message bubbles, merchant response bubbles, input elements, buttons
- Store Preview section shows live store rendering with device view selector
- Layout is responsive and adapts to different screen sizes

**BR-02: Preview Toggle Functionality**

- "Hide Store Preview" button visible when preview is shown
- Clicking "Hide Store Preview" button hides the Store Preview section and expands Chat to 100% width
- "Show Store Preview" button visible when preview is hidden
- Clicking "Show Store Preview" button restores original 40/60 layout
- Toggle state persists within current session (not across page refreshes)

**BR-03: Device View Selector**

- Three options: Mobile, Tablet, Desktop
- Selecting different device views adjusts preview width/layout accordingly
- Mobile: narrowest width (375px-425px approximate)
- Tablet: medium width (768px-1024px approximate)
- Desktop: full width within preview section
- Device view selection persists within current session

**BR-04: Store Preview vs Product Preview**

- Store Preview: Shows full storefront (homepage/product listing)
- Product Preview: Shows single product page (during "Upload a Product" step)
- Preview automatically switches based on current setup step
- Preview updates in real-time as merchant provides information

#### 3.1.3 Scenarios

##### Scenario 1: Merchant lands on AI onboarding page with default layout

```gherkin
Given a merchant has completed the 6-question onboarding survey
When the merchant is redirected to the dashboard
Then the AI onboarding interface displays
And the screen is divided into two sections:
  - Left section (Chat Interface): 40% width
  - Right section (Store Preview): 60% width
And the "Hide Store Preview" button is visible in the interface
And the Store Preview section displays with device view selector (Mobile, Tablet, Desktop)
And the Desktop device view is selected by default
And the AI displays the first message: "Welcome to Prosperna! 🚀 Let's start by giving your store a memorable name. What would you like to call it?"
```

##### Scenario 2: Merchant hides store preview to focus on chat

```gherkin
Given the AI onboarding interface is displayed
And the Store Preview section is visible (60% width)
And the Chat section occupies 40% width
When the merchant clicks the "Hide Store Preview" button
Then the Store Preview section is hidden (not displayed)
And the Chat section expands to 100% width
And the "Hide Store Preview" button is replaced by "Show Store Preview" button
And the merchant can see more chat history and input area
And the AI functionality remains unchanged (can still respond and accept input)
```

##### Scenario 3: Merchant shows store preview after hiding it

```gherkin
Given the Store Preview section is currently hidden
And the Chat section occupies 100% width
And the "Show Store Preview" button is visible
When the merchant clicks the "Show Store Preview" button
Then the Store Preview section reappears (60% width)
And the Chat section shrinks back to 40% width
And the "Show Store Preview" button is replaced by "Hide Store Preview" button
And the Store Preview displays the current state (all previous updates preserved)
And the device view selector shows the last selected device view
```

##### Scenario 4: Merchant switches device view in store preview

```gherkin
Given the Store Preview section is visible
And the device view selector shows three options: Mobile, Tablet, Desktop
And "Desktop" is currently selected
When the merchant clicks on "Mobile" in the device view selector
Then the "Mobile" option becomes highlighted/selected
And the Store Preview width adjusts to mobile dimensions (approximately 375px)
And the store content reflows to mobile layout
And the preview shows how the store will look on mobile devices
And the Chat section width remains unchanged (40%)
```

##### Scenario 5: Preview updates in real-time as merchant configures store

```gherkin
Given the merchant is on Step 1: Update Store Branding
And the Store Preview is visible showing a default store template
When the merchant enters store name "Mrs Goodies" and clicks Send
Then the AI responds with confirmation
And the Store Preview updates immediately
And the store header displays "Mrs Goodies" as the store name
When the merchant enters store slogan "Save the best for last!" and clicks Send
Then the Store Preview updates immediately
And the store header displays the slogan below the store name
And updates occur in less than 1 second after each input
```

##### Scenario 6: Preview switches from Store Preview to Product Preview

```gherkin
Given the merchant has completed Step 1 (Store Branding) and Step 2 (Store Location)
And the Store Preview is showing the full storefront
When the AI starts Step 3: Upload a Product
And displays "Awesome! Let's set up your first product. What is the type of product you would like to add to your store?"
Then the Store Preview automatically switches to Product Preview
And the preview displays a product page template with placeholder content
And the product page shows a gift icon placeholder (for physical products) or bookmark icon (for digital products)
And subsequent product configurations (name, price, images) update the Product Preview in real-time
```

---

### Feature F-02: Step 1 - Update Store Branding via AI Chat

#### 3.2.1 Feature Context

Guide merchants through configuring store branding (name, slogan, industry, logo, subdomain) using conversational AI with progressive questioning, dynamic input types, AI-powered logo generation option, and freestyle editing capability at confirmation.

#### 3.2.2 Business Rules

**BR-05: Progressive Questioning Flow**

- AI asks one question at a time via chat message bubbles
- Merchant responds via appropriate input type (text box, dropdown, cards, color pickers)
- Send button disabled until required input is provided
- Each successful input triggers AI's next question

**BR-06: Logo Upload vs AI Generation**

- Two options presented as cards: "Upload Manually" and "Generate with AI"
- Upload Manually: Opens Media Library modal for image selection
- Generate with AI: Initiates multi-step logo generation questionnaire (layout, design style, colors, fonts, aesthetic)
- Both paths converge to subdomain input after logo is set

**BR-07: AI Logo Generation Process**

- Asks for layout (Vertical/Horizontal buttons)
- Asks for design style (6 options: Minimalist, Vintage, Geometric, 3D, Line Art, Typography Play)
- Asks for primary color (color picker with RGB/Hex input)
- Asks for secondary colors (up to 2, color pickers with Add Color button)
- Asks for accent colors (multiple allowed, color pickers)
- Asks for font preferences (text input, optional with Skip button)
- Asks for aesthetic (Timeless/Trendy buttons)
- Generates logo, uploads to Media Library, sets as store logo

**BR-08: Subdomain Suggestions**

- AI generates 4 subdomain suggestions based on store name
- Merchant can accept suggestion or type custom subdomain
- Subdomain format: [subdomain].prosperna.com

**BR-09: Confirmation & Freestyle Editing**

- AI displays summary of all branding details with two buttons: "No, I'd like to make changes" and "Next"
- If "No, I'd like to make changes": text box appears, merchant types freestyle request
- AI uses tool-calling to interpret request and update appropriate fields
- AI re-displays updated summary after changes
- Loop continues until merchant clicks "Next"

**BR-10: Step Completion**

- Clicking "Next" marks "Update Store Branding" as COMPLETE
- AI proceeds to Step 2: Update Store Location

#### 3.2.3 Scenarios

##### Scenario 1: Merchant enters store name

```gherkin
Given the AI onboarding interface is displayed
And the AI shows the message: "Welcome to Prosperna! 🚀 Let's start by giving your store a memorable name. What would you like to call it?"
And a text box input is visible below the AI message
And the Send button is disabled (grayed out)
When the merchant types "Mrs Goodies" in the text box
Then the Send button becomes enabled (blue, clickable)
When the merchant clicks the Send button
Then a merchant response bubble appears on the right side showing "Mrs Goodies"
And the AI responds with: "Great! Your store name has been set to Mrs Goodies. What is your store slogan?"
And the Store Preview updates to show "Mrs Goodies" as the store name
And a new text box appears for the slogan input
```

##### Scenario 2: Merchant enters store slogan and selects industry

```gherkin
Given the AI has asked "What is your store slogan?"
And a text box is displayed
When the merchant types "Save the best for last!" and clicks Send
Then a merchant response bubble shows "Save the best for last!"
And the AI responds: "Great! Your store slogan has been set to Save the best for last!. Please select your industry."
And the text box disappears
And a dropdown selector appears
When the merchant opens the dropdown and selects "Bakery"
And clicks Send
Then a merchant response bubble shows "Bakery"
And the AI responds: "Great! Now that your industry is set, please upload your store logo to proceed."
And the Store Preview updates to show the slogan below the store name
```

##### Scenario 3: Merchant uploads logo manually

```gherkin
Given the AI has asked to upload store logo
And two cards are displayed: "Upload Manually" and "Generate with AI"
When the merchant clicks the "Upload Manually" card
Then the Media Library modal opens
And displays existing images (if any) and "Upload New" button
When the merchant selects an image "logo.png" from the library
And clicks the "Select" button in the modal
Then the modal closes
And a merchant response bubble appears showing "I have selected a logo" with image preview of "logo.png"
And the AI responds: "Successfully uploaded your new store logo. Now can I ask what subdomain do you want for your store website? Here are some subdomain suggestions for your store: Possible subdomains could be mrsgoodiesshop, mrsgoodiesbakery, mrsgoodiesstore, goodiesmrs."
And the Store Preview updates to show the uploaded logo in the store header
And a text box appears for subdomain input
```

##### Scenario 4: Merchant generates logo with AI - complete flow

```gherkin
Given the AI has asked to upload store logo
And two cards are displayed: "Upload Manually" and "Generate with AI"
When the merchant clicks the "Generate with AI" card
Then the merchant's selection is NOT displayed as a response bubble
And the AI immediately asks: "Select a logo layout style:"
And two buttons appear: "Vertical" and "Horizontal"
When the merchant clicks "Vertical"
Then a merchant response bubble shows "Vertical"
And the AI asks: "Great! What design style appeals to you most?"
And 6 buttons appear: "Minimalist/Flat", "Vintage/Retro", "Geometric/Techy", "3D/Gradient", "Line Art/Outline", "Typography Play"
When the merchant clicks "Minimalist/Flat"
Then the AI asks: "Great! What should be the primary color for your logo?"
And a color picker appears with gradient selector, RGB inputs, Hex input, and Save button
When the merchant selects a green color (#e9fad0) and clicks Save
Then a merchant response bubble shows "#e9fad0" (the color code)
And the AI asks: "Great! Choose up to 2 secondary colors for your logo"
And color pickers appear with "Add Color" button, allowing up to 2 colors
When the merchant selects 1 secondary color (#FFFFFF) and clicks Save
Then the AI asks: "Great! Would you like to add accent colors to complement your design?"
And accent color pickers appear
When the merchant selects accent colors and clicks Save
Then the AI asks: "Great! What fonts do you prefer? (separate multiple fonts with commas)"
And a text box appears with "Skip this question" button below
When the merchant clicks "Skip this question"
Then a merchant response bubble shows "[Skip this question]"
And the AI asks: "Great! Do you prefer a timeless or trendy design?"
And two buttons appear: "Timeless" and "Trendy"
When the merchant clicks "Timeless"
Then the AI shows two sequential messages:
  - "Perfect! I have all the information I need. Let me generate some logo options for you based on your preferences."
  - "Generating your logo... This may take a moment."
And a chatting ellipsis icon displays (animated three dots indicating loading)
And the AI generates the logo based on provided parameters
And uploads the generated logo to the merchant's Media Library
And sets the generated logo as the store logo
Then a success toast notification displays
And the Store Preview updates to show the generated logo
And a merchant response bubble appears showing "I have selected a logo" with image preview of the generated logo
And the AI responds: "Successfully uploaded your new store logo. Now can I ask what subdomain do you want for your store website? Here are some subdomain suggestions for your store: Possible subdomains could be mrsgoodiesshop, mrsgoodiesbakery, mrsgoodiesstore, goodiesmrs."
And a text box appears for subdomain input
```

##### Scenario 5: Merchant enters subdomain and proceeds to confirmation

```gherkin
Given the AI has asked for subdomain with suggestions
And a text box is displayed
When the merchant types "mrsgoodiesbakery" and clicks Send
Then a merchant response bubble shows "mrsgoodiesbakery"
And the AI displays a summary:
  """
  Do you wish to proceed to the next step or update your store information?

  Store Details
  • Store Name: Mrs Goodies
  • Store Slogan: Save the best for last!
  • Industry: Bakery
  • Store Subdomain: `mrsgoodiesbakery`
  • Logo: Uploaded ✅
  """
And the text box disappears
And two buttons appear: "No, I'd like to make changes" and "Next"
```

##### Scenario 6: Merchant makes freestyle edits at confirmation

```gherkin
Given the AI is displaying the branding summary
And two buttons are visible: "No, I'd like to make changes" and "Next"
When the merchant clicks "No, I'd like to make changes"
Then a merchant response bubble shows "No, I'd like to make changes"
And the AI responds: "Tell me what you want to change and I will help you update it."
And a text box appears
When the merchant types "Change subdomain to mrsgoodiesshop and slogan to Best treats in town"
And clicks Send
Then the AI uses tool-calling to interpret the request
And identifies two changes: subdomain → "mrsgoodiesshop", slogan → "Best treats in town"
And updates both fields
And the Store Preview updates to reflect the new subdomain and slogan
And the AI re-displays the updated summary:
  """
  Do you wish to proceed to the next step or update your store information?

  Store Details
  • Store Name: Mrs Goodies
  • Store Slogan: Best treats in town
  • Industry: Bakery
  • Store Subdomain: `mrsgoodiesshop`
  • Logo: Uploaded ✅
  """
And the two buttons reappear: "No, I'd like to make changes" and "Next"
```

##### Scenario 7: Merchant completes Step 1 and proceeds to Step 2

```gherkin
Given the AI is displaying the branding summary
And the merchant has reviewed all details
When the merchant clicks the "Next" button
Then a merchant response bubble shows "Next"
And the system marks "Update Store Branding" step as COMPLETE
And the AI begins Step 2: Update Store Location
And the AI displays: "Great! We've finished the branding stage. Now, let's set up your store's location. Please provide your store's address."
And the text box disappears
And an address form appears with fields: Address/Street, State/Province (dropdown), City (dropdown), Territory/Barangay (dropdown), Postal Code, Country (dropdown, default: Philippines)
```

##### Scenario 8: AI cannot interpret freestyle edit request

```gherkin
Given the AI is at a confirmation point
And the merchant clicks "No, I'd like to make changes"
And the text box appears for freestyle input
When the merchant types "asdfghjkl" (gibberish/uninterpretable input)
And clicks Send
Then the AI cannot interpret the request via tool-calling
And the AI re-asks the previous question before the uninterpretable input
And the merchant can provide clearer input
```

---

### Feature F-03: Step 2 - Update Store Location via AI Chat

#### 3.3.1 Feature Context

Guide merchants through configuring store location details (address, contact numbers, store hours, email) using conversational AI with form-based inputs for structured data like addresses and time pickers for store hours.

#### 3.3.2 Business Rules

**BR-11: Address Form Input**

- Complete address required with all fields: Address/Street, State/Province, City, Territory/Barangay, Postal Code, Country
- Dropdowns for Province, City, Barangay (cascading: City depends on Province, Barangay depends on City)
- Country defaults to "Philippines"
- Form appears in chat interface (not as separate modal)
- Send button disabled until all required fields completed

**BR-12: Contact Numbers Input**

- Form displays with two fields: Primary Store Number (required), Alternate Store Number (optional)
- Phone inputs with country code +63 (Philippines flag icon)
- Send button disabled until Primary Store Number is filled

**BR-13: Store Hours Input**

- Two time picker fields: Opening Hours and Closing Hours
- 12-hour format with AM/PM
- Clock icon displayed
- Both fields required
- Send button disabled until both times selected

**BR-14: Store Email Input**

- Text box for email input
- Email format validation (standard email regex)
- Send button disabled if text box is empty

**BR-15: Confirmation & Freestyle Editing**

- AI displays summary with all location information
- Two buttons: "No, I'd like to make changes" and "Next"
- Freestyle editing works same as Step 1 (AI interprets natural language changes)
- Clicking "Next" marks "Update Store Location" as COMPLETE and proceeds to Step 3

#### 3.3.3 Scenarios

##### Scenario 1: Merchant fills complete address form

```gherkin
Given the AI has asked for store address
And an address form is displayed with fields:
  | Field               | Type     | Required |
  | Address/Street      | Text     | Yes      |
  | State/Province      | Dropdown | Yes      |
  | City                | Dropdown | Yes      |
  | Territory/Barangay  | Dropdown | Yes      |
  | Postal Code         | Text     | Yes      |
  | Country             | Dropdown | Yes      |
And the Send button is disabled
When the merchant fills all fields:
  | Address/Street      | SM Store                        |
  | State/Province      | Cebu                            |
  | City                | Lapu-Lapu City (Opon)           |
  | Territory/Barangay  | Pajo                            |
  | Postal Code         | 6015                            |
  | Country             | Philippines                     |
Then the Send button becomes enabled
When the merchant clicks Send
Then a merchant response bubble displays the complete address: "6015 Philippines SM Store Pajo, Lapu-Lapu City (Opon), Cebu"
And the AI responds: "Address updated successfully. What is the contact number for your store?"
And the address form disappears
And a contact number form appears
```

##### Scenario 2: Merchant enters contact numbers (Primary only)

```gherkin
Given the AI has asked for contact number
And a form is displayed with:
  - Primary Store Number* (required, country code +63)
  - Alternate Store Number (Optional) (country code +63)
And the Send button is disabled
When the merchant types "9123456789" in the Primary Store Number field
Then the Send button becomes enabled
When the merchant clicks Send (without filling Alternate)
Then a merchant response bubble shows "Phone number: +639123456789"
And the AI responds: "Phone number updated successfully. What are your store hours?"
And the contact number form disappears
And time picker fields appear for store hours
```

##### Scenario 3: Merchant enters contact numbers (Primary + Alternate)

```gherkin
Given the contact number form is displayed
And the Send button is disabled
When the merchant types "9123456789" in the Primary Store Number field
And types "9171234567" in the Alternate Store Number field
Then the Send button becomes enabled
When the merchant clicks Send
Then a merchant response bubble shows:
  """
  Phone number: +639123456789
  Alternate: +639171234567
  """
And the AI responds: "Phone numbers updated successfully. What are your store hours?"
And time picker fields appear
```

##### Scenario 4: Merchant selects store hours

```gherkin
Given the AI has asked for store hours
And two time picker fields are displayed:
  - Opening Hours* (with clock icon)
  - Closing Hours* (with clock icon)
And the Send button is disabled
When the merchant selects "9:00 AM" in the Opening Hours picker
And selects "5:00 PM" in the Closing Hours picker
Then the Send button becomes enabled
When the merchant clicks Send
Then a merchant response bubble shows "We open at 9:00 AM and close at 5:00 PM"
And the AI responds: "Store hours updated successfully. Provide your store email?"
And the time pickers disappear
And a text box appears for email input
```

##### Scenario 5: Merchant enters store email

```gherkin
Given the AI has asked for store email
And a text box is displayed
And the Send button is disabled
When the merchant types "info@mrsgoodiesbakery.com" in the text box
Then the Send button becomes enabled
When the merchant clicks Send
Then a merchant response bubble shows "info@mrsgoodiesbakery.com"
And the AI responds: "Email updated to info@mrsgoodiesbakery.com. All location information is complete. Would you like to proceed to the next step or make changes?"
And the text box disappears
And two buttons appear: "No, I'd like to make changes" and "Next"
```

##### Scenario 6: Merchant makes freestyle edits to location information

```gherkin
Given the AI is displaying the location summary
And two buttons are visible: "No, I'd like to make changes" and "Next"
When the merchant clicks "No, I'd like to make changes"
Then the AI responds: "Tell me what you want to change and I will help you update it."
And a text box appears
When the merchant types "Change closing hours to 8PM"
And clicks Send
Then the AI interprets the request via tool-calling
And updates the closing hours to "8:00 PM"
And the AI responds: "All address details have been updated. Do you wish to proceed to the next step or make changes to your store location information?"
And the two buttons reappear
```

##### Scenario 7: Merchant completes Step 2 and proceeds to Step 3

```gherkin
Given the AI is displaying the location summary
When the merchant clicks the "Next" button
Then a merchant response bubble shows "Next"
And the system marks "Update Store Location" step as COMPLETE
And the AI begins Step 3: Upload a Product
And the Store Preview switches from Store Preview to Product Preview
And the Product Preview displays a product page template with placeholder gift icon (for physical) or bookmark icon (for digital)
And the AI displays: "Awesome! Let's set up your first product. What is the type of product you would like to add to your store?"
And two product type cards appear: "Physical Product" and "Digital Product"
```

---

### Feature F-04: Step 3 - Upload a Product (Physical Product Flow) via AI Chat

#### 3.4.1 Feature Context

Guide merchants through creating their first physical product using conversational AI with progressive questioning for product details, freestyle input option for providing all details at once, and AI-assisted features like auto-generating short descriptions and parsing freestyle measurement inputs.

#### 3.4.2 Business Rules

**BR-16: Product Type Selection**

- Two cards displayed: "Physical Product" and "Digital Product"
- Clicking a card determines the product creation flow
- Physical products require measurements (size, weight)
- Digital products skip measurement input

**BR-17: Progressive Product Detail Collection**

- AI asks for product name first
- AI offers option to provide all details at once via freestyle input
- If merchant provides only name: AI progressively asks Brand, Category, Long Description, Regular Price, Unit Cost, Sale Price (optional), Measurements
- If merchant provides all details at once: AI parses and extracts all fields via tool-calling

**BR-18: Auto-Generated Product Data**

- Slug auto-generated from product name (e.g., "Pianono" → "pianono")
- SKU auto-generated from product name (e.g., "Pianono" → "PI01")
- Short description auto-generated from long description by AI
- If merchant provides both short and long descriptions in freestyle input, AI uses merchant-provided short description

**BR-19: Freestyle Measurement Input Parsing**

- Merchant can input measurements in natural language (e.g., "L: 12cm, w: 13cm, H: 14cm, weight: 1.5kg")
- AI parses and extracts: Length, Width, Height, Weight, Units
- Standardizes units for storage
- Updates Product Preview with parsed specifications

**BR-20: Featured Image Upload**

- Two cards: "Featured Image" (required) and "Featured Video" (optional)
- Featured Image specs: Max Size 10MB, Min Resolution 250px x 250px, Type .jpg/.png/.webp
- Clicking "Add Image" opens Media Library modal
- Send button disabled until at least one image uploaded

**BR-21: Product Labels Selection**

- Multi-select dropdown with options: New, Best Seller, Sale
- Minimum 1 label, maximum 2 labels
- Counter displays "X/2 Labels"
- Labels display as badges on product image in Product Preview

**BR-22: Confirmation & Freestyle Editing**

- Summary displays all product information
- Merchant can edit via freestyle natural language input
- Clicking "Next" marks "Upload a Product" as COMPLETE, saves product to inventory, refreshes page, resets conversation, switches back to Store Preview, begins Step 4

#### 3.4.3 Scenarios

##### Scenario 1: Merchant selects Physical Product type

```gherkin
Given the AI has asked for product type
And two cards are displayed: "Physical Product" and "Digital Product"
And the Store Preview has switched to Product Preview showing a gift icon placeholder
When the merchant clicks the "Physical Product" card
Then a merchant response bubble shows "Physical Product"
And the AI responds: "Awesome! What's the product called? If you like, you can also give all the details: brand, main category, descriptions (long and short), measurements (size and weight), and price (regular and unit cost)."
And a text box appears for product name or full details input
```

##### Scenario 2: Merchant provides only product name (progressive flow)

```gherkin
Given the AI has asked for product name/details
And a text box is displayed
When the merchant types "Pianono" in the text box
And clicks Send
Then a merchant response bubble shows "Pianono"
And the Product Preview updates to display:
  - Product name: "Pianono"
  - Slug: "pianono" (auto-generated)
  - SKU: "PI01" (auto-generated)
And the AI responds: "Great! I've set the product name to Pianono and automatically generated the slug and SKU. Next, what's the brand of this product?"
And a text box appears for brand input
```

##### Scenario 3: Merchant provides brand, category, and long description progressively

```gherkin
Given the AI has asked for brand
When the merchant types "Decadent Cakes" and clicks Send
Then the Product Preview updates to show brand "Decadent Cakes"
And the AI asks: "Great! The product name is Pianono, and I've auto-generated the slug (pianono) and SKU (PI01). I've also set the brand to Decadent Cakes. Now, what is the main category of this product?"
When the merchant types "Sweet Cakes" and clicks Send
Then the Product Preview updates to show main category
And the AI asks: "Great! I've set up the basics for Pianono: name: Pianono, slug: pianono, SKU: PI01, brand: Decadent Cakes, main category: Sweet Cakes. What's the long description for this product?"
When the merchant types "A dense, moist chocolate fudge cake layered with premium cocoa ganache. Built for birthdays, gatherings, and special occasions. Includes decorative topping and can be stored refrigerated for up to 3 days."
And clicks Send
Then the AI auto-generates a short description: "Dense, moist chocolate fudge cake with cocoa ganache, ideal for birthdays and celebrations."
And the Product Preview updates to show both long and short descriptions
And the AI responds: "Great! I've updated Pianono with the long description and generated a concise short description. Next, please provide the regular price (in PHP)."
```

##### Scenario 4: Merchant provides pricing (regular, unit cost, optional sale price)

```gherkin
Given the AI has asked for regular price
When the merchant types "1500" and clicks Send
Then the Product Preview updates to show "₱1,500.00" as the regular price
And the AI asks: "Great! I've updated Pianono with the long description and generated a concise short description. Here are the current details: Name: Pianono, Brand: Decadent Cakes, Main category: Sweet Cakes, Regular price: ₱1,500. Next, please provide the unit cost price to calculate margins."
When the merchant types "680" and clicks Send
And the AI asks: "Great! I've set the unit cost price to ₱680. This will give a healthy margin with the regular price of ₱1,500. Would you like to set a sale price as well, or should we proceed to adding measurements? (Next missing field: sale price)"
When the merchant types "1200" and clicks Send
Then the Product Preview updates to show:
  - Sale price: "₱1,200.00"
  - Regular price: "~~₱1,500.00~~" (with strikethrough)
And the AI responds: "Great! The sale price is ₱1,200. The regular price remains ₱1,500 and the unit cost is ₱680. Next, please provide the product measurements (height, width, length, and the size unit) and weight with unit."
```

##### Scenario 5: Merchant provides measurements via freestyle input

```gherkin
Given the AI has asked for measurements
And a text box is displayed
When the merchant types "L: 12cm, w: 13cm, H: 14cm, weight: 1.5kg"
And clicks Send
Then the AI parses the freestyle input via tool-calling
And extracts:
  - Length: 12 cm
  - Width: 13 cm
  - Height: 14 cm
  - Weight: 1.5 kg
And the Product Preview updates to show in Specifications section:
  - Size (L x W x H): 12 x 13 x 14 cm
  - Weight: 1.5 kg
And the AI responds: "Product specification, price, measurements, and main category are all set. However, no product images have been uploaded yet. Please upload at least one product image to proceed. Videos are optional."
And the text box disappears
And two cards appear: "Featured Image" and "Featured Video"
```

##### Scenario 6: Merchant uploads featured image from Media Library

```gherkin
Given the AI has asked to upload product images
And two cards are displayed:
  - Featured Image (with "Add Image" button, specs shown: Max Size 10MB, Min Resolution 250px x 250px, Type .jpg/.png/.webp)
  - Featured Video (with "Add Video URL" button, subtext: YouTube or Vimeo URL)
And the Send button is disabled
When the merchant clicks the "Add Image" button on the Featured Image card
Then the Media Library modal opens
And displays existing images and "Upload New" button
When the merchant selects an existing image "ones.webp"
And clicks the "Select" button in the modal
Then the modal closes
And the selected image preview appears beside the Featured Image card
And the image filename "ones.webp" is displayed
And the Send button becomes enabled
When the merchant clicks Send
Then a merchant response bubble shows "1 Image uploaded" with the image preview
And the Product Preview updates to display the featured image (replaces placeholder gift icon)
And the AI responds: "Featured media updated successfully. Next, let's add some labels to your product images. You can choose from: "NEW" 🆕: Highlights recently added products, "BEST SELLER" 🏆: Indicates popular or top-selling items, "SALE" 💰: Shows products currently on discount. These labels help customers quickly identify special product categories. 👍"
And the text box disappears
And a multi-select dropdown appears for product labels
```

##### Scenario 7: Merchant selects product labels

```gherkin
Given the AI has asked to select product labels
And a multi-select dropdown is displayed with label "Select product labels..."
And options: New, Best Seller, Sale
And a counter shows "0/2 Labels"
And the Send button is disabled
When the merchant opens the dropdown and selects "New"
Then the counter updates to "1/2 Labels"
And the Send button becomes enabled
When the merchant clicks Send
Then a merchant response bubble shows "Added labels: New"
And the Product Preview updates to display a green "New" badge on the product image (top-right corner)
And the AI responds: "All product image labels have been updated. Added labels: New. Do you wish to create the product or make changes to your product information?"
And the dropdown disappears
And two buttons appear: "No, I'd like to make changes" and "Next"
```

##### Scenario 8: Merchant makes freestyle edits to product information

```gherkin
Given the AI is displaying the product summary
And two buttons are visible: "No, I'd like to make changes" and "Next"
When the merchant clicks "No, I'd like to make changes"
Then the AI responds: "Tell me what you want to change and I will help you update it."
And a text box appears
When the merchant types "I want the regular price to be 1200 and the sale price to be 999"
And clicks Send
Then the AI interprets the request via tool-calling
And updates:
  - Regular price: ₱1,200
  - Sale price: ₱999
And the Product Preview updates to show the new prices
And the AI responds: "All product information is complete. Do you wish to continue to the next step or make changes to the product details?"
And the two buttons reappear
```

##### Scenario 9: Merchant completes product creation and proceeds to Step 4

```gherkin
Given the AI is displaying the product summary
And the merchant has reviewed all product details
When the merchant clicks the "Next" button
Then a merchant response bubble shows "Next"
And the system marks "Upload a Product" step as COMPLETE
And the product "Pianono" is saved to the merchant's inventory
And the page refreshes
And the conversation resets
And the Product Preview switches back to Store Preview
And the AI begins Step 4: Set Up Shipping
And the AI displays two sequential messages:
  - "Great! Your store is taking shape. Now let's set up shipping for your products."
  - "Would you like to set up shipping for your store?"
And two buttons appear: "Skip for now" and "Yes, set up shipping"
```

---

### Feature F-05: Step 3 - Upload a Product (Digital Product Flow) via AI Chat

#### 3.5.1 Feature Context

Guide merchants through creating their first digital product using conversational AI. Digital products follow similar flow to physical products but skip measurement input and use bookmark icon placeholder in Product Preview.

#### 3.5.2 Business Rules

**BR-23: Digital Product Differences from Physical**

- Product Preview displays bookmark icon placeholder (instead of gift icon)
- No measurements required (size, weight fields skipped)
- All other fields identical to physical products
- Same featured image and label selection process

**BR-24: Digital Product Price Fields**

- Regular price (required)
- Unit cost (required)
- Sale price (optional)
- No shipping-related costs

**BR-25: Product Creation Flow**

- Identical to physical product flow except measurements step is skipped
- After unit cost input, AI proceeds directly to featured image upload
- Confirmation and freestyle editing work identically

#### 3.5.3 Scenarios

##### Scenario 1: Merchant selects Digital Product type

```gherkin
Given the AI has asked for product type
And two cards are displayed: "Physical Product" and "Digital Product"
When the merchant clicks the "Digital Product" card
Then a merchant response bubble shows "Digital Product"
And the Product Preview displays a bookmark icon placeholder (not gift icon)
And the AI responds: "Awesome! What's the product called? If you like, you can also give all the details: brand, main category, descriptions (long and short), and price (regular and unit cost)."
And a text box appears
```

##### Scenario 2: Digital product flow skips measurements after pricing

```gherkin
Given the merchant is creating a digital product "Frozen Throne"
And has provided: name, brand "Valve", category "MOBA", long description, regular price "1200", unit cost "900"
When the merchant clicks Send after entering unit cost
Then the AI does NOT ask for measurements
And the AI responds: "Product specification, price, measurements, and main category are all set. However, no product images have been uploaded yet. Please upload at least one product image to proceed. Videos are optional."
And the Featured Image and Featured Video cards appear
And the Product Preview does NOT display a Specifications section (no size/weight for digital products)
```

##### Scenario 3: Digital product completion follows same flow as physical

```gherkin
Given the merchant has uploaded featured image for digital product
And has selected product labels
And the AI displays the product summary with "No, I'd like to make changes" and "Next" buttons
When the merchant clicks "Next"
Then the digital product is saved to inventory
And the page refreshes
And the conversation resets
And the Store Preview replaces Product Preview
And the AI begins Step 4: Set Up Shipping
```

---

### Feature F-06: Step 4 - Set Up Shipping via AI Chat

#### 3.6.1 Feature Context

Guide merchants through configuring shipping methods using conversational AI with option to skip, five shipping method cards (3 enabled, 2 disabled for future), and configuration form that replaces Store Preview when merchant clicks "Set Up" on a method.

#### 3.6.2 Business Rules

**BR-26: Shipping Setup Optional**

- Merchant can skip shipping setup via "Skip for now" button
- Skipping proceeds directly to Step 5: Set Up Payments

**BR-27: Shipping Method Cards**

- Five cards displayed:
  1. Manual Shipping by Customer (enabled, "Set Up" button)
  2. Manual Shipping by Merchant (enabled, "Set Up" button)
  3. Store Pickup (enabled, "Set Up" button)
  4. Standard Delivery with J&T badge (disabled, "Activate" button greyed out)
  5. Same Day Delivery with Lalamove badge (disabled, "Activate" button greyed out)
- Merchant can only select ONE shipping method at this point
- Clicking "Set Up" opens configuration form

**BR-28: Configuration Form Replaces Store Preview**

- When merchant clicks "Set Up" on a shipping method card:
  - Selected card becomes highlighted (purple background)
  - Store Preview section (right 60%) is replaced by Shipping Method Configuration Form
  - Chat section (left 40%) remains unchanged
- Form includes: Payment Options (checkboxes), Shipping Description (text area with character limit and Reset link), Pickup/Delivery Instructions (text area with HTML editor, character limit, Reset link)
- Form buttons: Cancel (white, left) and Save Shipping Method (black, right)

**BR-29: Configuration Form Behavior**

- Cancel button: Closes form, restores Store Preview, deselects card
- Save Shipping Method: Saves configuration, activates shipping method, refreshes page, resets conversation, restores Store Preview, begins Step 5

**BR-30: Step Completion**

- Clicking "Save Shipping Method" marks "Set Up Shipping" as COMPLETE
- Page refresh triggers after save
- AI begins Step 5: Set Up Payments

#### 3.6.3 Scenarios

##### Scenario 1: Merchant skips shipping setup

```gherkin
Given the AI has displayed two messages about shipping setup
And two buttons are visible: "Skip for now" and "Yes, set up shipping"
When the merchant clicks the "Skip for now" button
Then a merchant response bubble shows "Skip for now"
And the system skips Step 4: Set Up Shipping
And the page refreshes
And the conversation resets
And the AI begins Step 5: Set Up Payments
And the AI displays two messages:
  - "Now let's configure online payments."
  - "Would you like to set up online payments for your store?"
And two buttons appear: "Skip for now" and "Yes, set up online payments"
```

##### Scenario 2: Merchant chooses to set up shipping

```gherkin
Given the AI has asked about shipping setup
And two buttons are visible: "Skip for now" and "Yes, set up shipping"
When the merchant clicks "Yes, set up shipping"
Then a merchant response bubble shows "Yes, set up shipping"
And the AI responds: "Great! Please choose your preferred shipping method:"
And five shipping method cards appear:
  | Card                         | Badge     | Button   | State    |
  | Manual Shipping by Customer  | None      | Set Up   | Enabled  |
  | Manual Shipping by Merchant  | None      | Set Up   | Enabled  |
  | Store Pickup                 | None      | Set Up   | Enabled  |
  | Standard Delivery            | J&T       | Activate | Disabled |
  | Same Day Delivery            | Lalamove  | Activate | Disabled |
And each enabled card shows subtext describing the shipping method
And the text box disappears
```

##### Scenario 3: Merchant selects "Manual Shipping by Customer" and configures

```gherkin
Given five shipping method cards are displayed
When the merchant clicks the "Set Up" button on "Manual Shipping by Customer" card
Then the "Manual Shipping by Customer" card becomes highlighted with purple background
And the Store Preview section (right 60%) is replaced by the Shipping Method Configuration Form
And the form displays:
  - Form Title: "Manual Shipping by Customer"
  - Form Subtext: "Customers will book and shoulder delivery fees outside Prosperna."
  - Payment Options: (multi-select checkboxes) Bank Transfer, Cash on Delivery, Cash on Pickup, Credit Card, E-Wallets, Over The Counter
  - Shipping Description: (text area, 185/180 characters, "Reset" link, default text provided)
  - Pickup Instructions: (text area with HTML editor, 504/500 characters, "Reset" link, default HTML text)
  - Cancel button (white, left-aligned)
  - Save Shipping Method button (black, right-aligned)
And the Chat section (left 40%) remains unchanged
```

##### Scenario 4: Merchant saves shipping method configuration

```gherkin
Given the Shipping Method Configuration Form is displayed for "Manual Shipping by Customer"
And the merchant has selected payment options and reviewed/edited descriptions
When the merchant clicks the "Save Shipping Method" button
Then the system saves the shipping method configuration
And activates "Manual Shipping by Customer" for the merchant's store
And the page refreshes
And the conversation resets
And the Shipping Method Configuration Form is replaced by Store Preview (60% right side)
And the system marks "Set Up Shipping" step as COMPLETE
And the AI begins Step 5: Set Up Payments
```

##### Scenario 5: Merchant cancels shipping method configuration

```gherkin
Given the Shipping Method Configuration Form is displayed
And the merchant has not saved any configuration yet
When the merchant clicks the "Cancel" button
Then the configuration form closes
And the Store Preview section (right 60%) reappears
And the selected shipping method card is deselected (no longer highlighted)
And the Chat section (left 40%) remains unchanged
And the merchant can select a different shipping method or skip
```

##### Scenario 6: Merchant configures different shipping methods

```gherkin
Given five shipping method cards are displayed
When the merchant clicks "Set Up" on "Store Pickup" card
Then the "Store Pickup" card becomes highlighted
And the Store Preview is replaced by configuration form showing:
  - Form Title: "Store Pickup"
  - Form Subtext: "Customers pick up the order directly from your store location."
  - Payment Options: (checkboxes)
  - Shipping Description: (text area, 107/180 characters, default text)
  - Pickup Instructions: (HTML editor, 488/500 characters, default text)
  - Cancel and Save Shipping Method buttons
When the merchant configures and clicks "Save Shipping Method"
Then the shipping method is saved and activated
And the page refreshes
And Step 4 is marked COMPLETE
And AI begins Step 5: Set Up Payments
```

---

### Feature F-07: Step 5 - Set Up Payments via AI Chat

#### 3.7.1 Feature Context

Guide merchants through setting up online payments with phone number verification and optional myPay payment gateway integration. Merchants can skip payment setup or proceed with phone verification followed by myPay onboarding.

#### 3.7.2 Business Rules

**BR-31: Payment Setup Optional**

- Merchant can skip payment setup via "Skip for now" button
- Skipping completes entire onboarding and redirects to dashboard

**BR-32: Phone Verification Required for Payment Setup**

- Phone number input required before payment gateway setup
- Phone format: +63 (Philippines) + 10 digits
- OTP sent to entered phone number via SMS
- OTP must be verified before proceeding to myPay

**BR-33: OTP Verification Flow**

- Phone number field becomes read-only after OTP sent
- Confirmation Code input field (6 digits)
- "Having trouble? Resend Code" link available
- OTP validation occurs on submission
- Success proceeds to myPay choice, failure shows error

**BR-34: myPay Integration**

- After successful OTP verification, merchant can skip or continue to myPay
- "Continue to myPay Setup" redirects to existing myPay registration page (outside AI onboarding)
- myPay setup is existing Prosperna feature, not part of AI onboarding flow

**BR-35: Step Completion**

- Clicking "Skip for now" (before phone verification) marks step COMPLETE and finishes onboarding
- Clicking "Skip for now" (after phone verification) marks step COMPLETE and finishes onboarding
- Clicking "Continue to myPay Setup" marks step COMPLETE, finishes onboarding, redirects to myPay

#### 3.7.3 Scenarios

##### Scenario 1: Merchant skips payment setup entirely

```gherkin
Given the AI has started Step 5: Set Up Payments
And displays two messages:
  - "Now let's configure online payments."
  - "Would you like to set up online payments for your store?"
And two buttons are visible: "Skip for now" and "Yes, set up online payments"
When the merchant clicks "Skip for now"
Then a merchant response bubble shows "Skip for now"
And the system marks "Set Up Payments" step as COMPLETE
And the system marks entire AI-powered onboarding + setup guide as COMPLETE
```

##### Scenario 2: Merchant chooses to set up online payments

```gherkin
Given the AI has asked about setting up online payments
And two buttons are visible: "Skip for now" and "Yes, set up online payments"
When the merchant clicks "Yes, set up online payments"
Then a merchant response bubble shows "Yes, set up online payments"
And the AI responds: "Great! To set up online payments, we need to verify your phone number first. Please enter your phone number below."
And the text box disappears
And a phone number input field appears with:
  - Label: "Phone Number *"
  - Country Code: +63 (Philippines flag icon)
  - Text input field for 10-digit mobile number
  - Send button (disabled until number entered)
```

##### Scenario 3: Merchant enters phone number and receives OTP

```gherkin
Given the phone number input field is displayed
And the Send button is disabled
When the merchant enters "9123456789" in the phone number field
Then the Send button becomes enabled
When the merchant clicks Send
Then the system sends OTP to +639123456789 via SMS
And a success toast notification displays: "✓ Please enter the confirmation code we sent to your mobile number."
And the phone number field becomes read-only showing "+63 9123 456789"
And a Confirmation Code input field appears below (6 digits)
And a "Having trouble? Resend Code" link appears below the confirmation code field
And the Send button remains visible but disabled until OTP entered
```

##### Scenario 4: Merchant enters correct OTP and proceeds to myPay choice

```gherkin
Given the Confirmation Code input field is displayed
And the merchant has received OTP "123456" via SMS
When the merchant enters "123456" in the Confirmation Code field
Then the Send button becomes enabled
When the merchant clicks Send
Then the system validates the OTP
And the OTP is correct
Then the AI responds: "Great! Your phone number has been verified. Let's set up myPay for payment processing."
And the phone verification fields disappear
And two buttons appear: "Skip for now" and "Continue to myPay Setup"
```

##### Scenario 5: Merchant continues to myPay setup and completes onboarding

```gherkin
Given the AI has asked about continuing to myPay setup
And two buttons are visible: "Skip for now" and "Continue to myPay Setup"
When the merchant clicks "Continue to myPay Setup"
Then a merchant response bubble shows "Continue to myPay Setup"
And the system marks "Set Up Payments" step as COMPLETE
And the system marks entire AI-powered onboarding + setup guide as COMPLETE
And the merchant is redirected OUT of the AI-powered onboarding interface
And the merchant is navigated to the existing myPay registration page
And myPay registration is handled by existing Prosperna feature (not AI onboarding)
```

##### Scenario 6: Merchant skips myPay setup after phone verification

```gherkin
Given the AI has asked about continuing to myPay setup
And two buttons are visible: "Skip for now" and "Continue to myPay Setup"
When the merchant clicks "Skip for now"
Then a merchant response bubble shows "Skip for now"
And the system marks "Set Up Payments" step as COMPLETE
And the system marks entire AI-powered onboarding + setup guide as COMPLETE
And the merchant can access all merchant dashboard features
```

##### Scenario 7: Merchant enters incorrect OTP

```gherkin
Given the Confirmation Code input field is displayed
And the correct OTP is "123456"
When the merchant enters "654321" (incorrect)
And clicks Send
Then the system validates the OTP
And the OTP does not match
Then an error message displays below the Confirmation Code field
And the error reads "Invalid code. Please try again."
And the Confirmation Code input field is cleared
And the merchant can retry entering OTP or click "Resend Code"
```

---

### Feature F-08: AI Tool-Calling & Freestyle Input Interpretation

#### 3.8.1 Feature Context

Enable merchants to make changes to their store configuration using natural language at confirmation points throughout the onboarding flow. The AI interprets freestyle requests using tool-calling to identify which fields need updating and executes the appropriate changes.

#### 3.8.2 Business Rules

**BR-36: Freestyle Input Availability**

- Freestyle editing available at all confirmation points (end of each major step)
- Merchant clicks "No, I'd like to make changes" button to access text box
- AI responds: "Tell me what you want to change and I will help you update it."
- Text box appears for natural language input

**BR-37: AI Interpretation via Tool-Calling**

- AI uses tool-calling/LLM to parse merchant's natural language request
- Identifies which field(s) need updating from the request
- Extracts new values from the request
- Handles single-field changes (e.g., "Change subdomain to mrsgoodiesbakery")
- Handles multi-field changes (e.g., "Change price to 1200 and sale price to 999")

**BR-38: Tool-Calling Execution**

- AI executes update operations on identified fields
- Store Preview updates in real-time to reflect changes
- AI re-displays confirmation summary with updated values
- Merchant can continue making changes or proceed with "Next"

**BR-39: Interpretation Failure Handling**

- If AI cannot interpret the request, AI re-asks the previous question
- No error message displayed to merchant
- Merchant can rephrase their request or use confirmation summary to identify correct field names

**BR-40: Supported Change Types**

- Text field updates (store name, slogan, subdomain, email, etc.)
- Numeric field updates (prices, quantities, measurements)
- Selection updates (industry, shipping method, payment method)
- Time updates (store hours)
- Complex updates (product measurements with multiple values)

#### 3.8.3 Scenarios

##### Scenario 1: Merchant changes single field via freestyle input (subdomain)

```gherkin
Given the merchant is at the Store Branding confirmation point
And the AI is displaying the branding summary showing subdomain: "mrsgoodiesbakery"
And two buttons are visible: "No, I'd like to make changes" and "Next"
When the merchant clicks "No, I'd like to make changes"
Then a merchant response bubble shows "No, I'd like to make changes"
And the AI responds: "Tell me what you want to change and I will help you update it."
And a text box appears
When the merchant types "Change subdomain to mrsgoodiesshop"
And clicks Send
Then the AI uses tool-calling to interpret the request
And identifies: field = subdomain, new_value = "mrsgoodiesshop"
And updates the subdomain field to "mrsgoodiesshop"
And the Store Preview updates to show the new subdomain
And the AI re-displays the updated summary showing subdomain: "mrsgoodiesshop"
And the two buttons reappear: "No, I'd like to make changes" and "Next"
```

##### Scenario 2: Merchant changes multiple fields via freestyle input (price and sale price)

```gherkin
Given the merchant is at the Product confirmation point
And the AI is displaying the product summary showing:
  - Regular price: ₱1,500
  - Sale price: ₱1,200
When the merchant clicks "No, I'd like to make changes"
And types "I want the regular price to be 1200 and the sale price to be 999"
And clicks Send
Then the AI uses tool-calling to interpret the request
And identifies two changes:
  - field = regular_price, new_value = 1200
  - field = sale_price, new_value = 999
And updates both fields
And the Product Preview updates to show:
  - Sale price: ₱999.00
  - Regular price: ~~₱1,200.00~~ (strikethrough)
And the AI re-displays the updated product summary
```

##### Scenario 3: Merchant changes store hours via freestyle input

```gherkin
Given the merchant is at the Store Location confirmation point
And the location summary shows closing hours: 5:00 PM
When the merchant clicks "No, I'd like to make changes"
And types "Change closing hours to 8PM"
And clicks Send
Then the AI interprets the request
And identifies: field = closing_hours, new_value = "8:00 PM"
And updates the closing hours to 8:00 PM
And the AI responds: "All address details have been updated. Do you wish to proceed to the next step or make changes to your store location information?"
And the summary now shows closing hours: 8:00 PM
```

##### Scenario 4: AI cannot interpret unclear freestyle input

```gherkin
Given the merchant is at a confirmation point
When the merchant clicks "No, I'd like to make changes"
And types an ambiguous request: "make it better"
And clicks Send
Then the AI attempts to interpret the request using tool-calling
And fails to identify which field to update or what the new value should be
And the AI re-asks the previous question
And the AI displays: "Tell me what you want to change and I will help you update it."
And the text box remains available for the merchant to rephrase
```

##### Scenario 5: Merchant makes complex measurement change via freestyle input

```gherkin
Given the merchant is at the Product confirmation point
And the product summary shows measurements: "12 x 13 x 14 cm, 1.5 kg"
When the merchant clicks "No, I'd like to make changes"
And types "Update size to 15 x 15 x 20 cm and weight to 2kg"
And clicks Send
Then the AI uses tool-calling to parse the complex request
And identifies:
  - length = 15 cm
  - width = 15 cm
  - height = 20 cm
  - weight = 2 kg
And updates all measurement fields
And the Product Preview specifications section updates to show:
  - Size (L x W x H): 15 x 15 x 20 cm
  - Weight: 2 kg
And the AI re-displays the updated product summary
```

---

### Feature F-09: Real-Time Store Preview Updates

#### 3.9.1 Feature Context

Provide merchants with immediate visual feedback by updating the Store Preview or Product Preview in real-time as they provide configuration information through the AI chat interface.

#### 3.9.2 Business Rules

**BR-41: Store Preview Display**

- Shows full storefront homepage during Steps 1 (Branding) and 2 (Location)
- Displays store name, slogan, logo in header
- Shows navigation, layout sections as configured
- Updates within 1 second of merchant input submission

**BR-42: Product Preview Display**

- Shows single product page during Step 3 (Upload a Product)
- Displays product name, price, images, descriptions, specifications
- Shows placeholder icon (gift for physical, bookmark for digital) until image uploaded
- Updates product details in real-time as merchant provides information

**BR-43: Preview Update Triggers**

- Store name input → Header updates with store name
- Store slogan input → Header updates with slogan
- Logo upload/generation → Header updates with logo image
- Subdomain input → Browser address bar in preview updates (visual only)
- Product name input → Product page title updates
- Product price input → Product page price display updates
- Product image upload → Product page image updates (replaces placeholder)
- Product labels selection → Badges appear on product image

**BR-44: Device View Responsiveness**

- Mobile view: 375px-425px approximate width
- Tablet view: 768px-1024px approximate width
- Desktop view: Full width within preview section
- Content reflows appropriately for selected device view
- Preview updates maintain selected device view

**BR-45: Preview Persistence**

- Preview state persists within current session (before page refresh)
- Page refresh after step completion resets preview to appropriate view (Store or Product)
- Toggle hide/show preserves all preview updates

#### 3.9.3 Scenarios

##### Scenario 1: Store name updates in real-time

```gherkin
Given the merchant is on Step 1: Update Store Branding
And the Store Preview is visible showing a default template
And the store header shows a placeholder store name
When the merchant enters "Mrs Goodies" as store name
And clicks Send
Then the AI responds with confirmation
And within 1 second, the Store Preview updates
And the store header displays "Mrs Goodies" as the store name
And the merchant can see the change immediately in the preview
```

##### Scenario 2: Store logo updates after upload

```gherkin
Given the merchant has entered store name and slogan
And the Store Preview shows the name and slogan in the header
And the header shows a default placeholder logo
When the merchant uploads a logo via Media Library
And selects "logo.png"
And the AI confirms: "Successfully uploaded your new store logo"
Then the Store Preview updates immediately
And the header displays the uploaded "logo.png" image
And the placeholder logo is replaced
And the logo appears in the correct position and size in the header
```

##### Scenario 3: Product Preview switches from Store Preview

```gherkin
Given the merchant has completed Step 2: Update Store Location
And the Store Preview is showing the full storefront
When the AI starts Step 3: Upload a Product
And asks: "Awesome! Let's set up your first product. What is the type of product you would like to add to your store?"
Then the Store Preview automatically switches to Product Preview
And the preview displays a single product page template
And shows a placeholder gift icon (for physical products) or bookmark icon (for digital)
And the product name area shows a placeholder
And the price area shows a placeholder
```

##### Scenario 4: Product name and price update in Product Preview

```gherkin
Given the Product Preview is displayed
And the merchant is entering product details
When the merchant enters product name "Pianono"
And clicks Send
Then the Product Preview updates immediately
And the product page title displays "Pianono"
And the slug displays as "pianono" in the URL preview
When the merchant enters regular price "1500"
And clicks Send
Then the Product Preview updates
And the price displays as "₱1,500.00"
```

##### Scenario 5: Product image replaces placeholder

```gherkin
Given the Product Preview shows a gift icon placeholder
And the merchant has entered product name, brand, category, prices
When the merchant uploads a featured image "pianono.jpg"
Then the Product Preview updates immediately
And the gift icon placeholder is replaced by "pianono.jpg"
And the product image displays in the product image area
And the image maintains proper aspect ratio and sizing
```

##### Scenario 6: Product labels appear as badges on image

```gherkin
Given the Product Preview shows the uploaded product image
And the merchant has selected product labels: "New" and "Best Seller"
And clicks Send
Then the Product Preview updates
And a green "New" badge appears on the top-right corner of the product image
And a "Best Seller" badge appears on the product image
And both badges are visible and properly positioned
```

##### Scenario 7: Device view switching adjusts preview layout

```gherkin
Given the Store Preview is displayed in Desktop view
And the preview shows the full-width layout
When the merchant clicks "Mobile" in the device view selector
Then the preview width adjusts to mobile dimensions (approximately 375px)
And the store content reflows to mobile layout:
  - Navigation collapses to hamburger menu
  - Product cards stack vertically
  - Text sizes adjust for mobile readability
And all previously configured elements (logo, name, slogan) remain visible in mobile layout
When the merchant switches back to "Desktop"
Then the preview expands to desktop width
And the layout returns to multi-column desktop format
```

---

### Feature F-10: Page Refresh & State Management

#### 3.10.1 Feature Context

Manage application state across major step completions by refreshing the page and resetting the conversation while preserving completed step data and transitioning preview displays appropriately.

#### 3.10.2 Business Rules

**BR-46: Page Refresh Triggers**

- Page refreshes after completing Step 3 (Upload a Product)
- Page refreshes after completing Step 4 (Set Up Shipping)
- Page refreshes after completing Step 5 (Set Up Payments)
- No page refresh after Step 1 or Step 2 completions

**BR-47: Conversation Reset on Refresh**

- After page refresh, chat history is cleared
- AI starts fresh with the next step's opening message
- Previous step data is preserved in database (not lost)
- Merchant cannot scroll back to previous step's conversation

**BR-48: Preview Display Transitions**

- After Step 3 completion: Product Preview switches back to Store Preview
- Product data saved to inventory, visible in store product listings
- After Step 4 and 5 completions: Store Preview remains active
- Preview shows the most current store configuration

**BR-49: Step Completion Persistence**

- Completed steps remain marked as COMPLETE in database
- Setup Guide progress indicator shows updated completion (X of 5 steps)
- Merchant cannot re-trigger completed steps from the AI chat
- Merchant can manually edit completed configurations later via dashboard settings

#### 3.10.3 Scenarios

##### Scenario 1: Page refreshes after Step 3 completion

```gherkin
Given the merchant has completed Step 3: Upload a Product
And has clicked "Next" after confirming product details
And a merchant response bubble shows "Next"
When the system marks "Upload a Product" step as COMPLETE
And saves the product to the merchant's inventory
Then the page refreshes automatically
And the chat history is cleared (previous conversation not visible)
And the Product Preview switches back to Store Preview
And the AI displays the opening message for Step 4:
  """
  Great! Your store is taking shape. Now let's set up shipping for your products.

  Would you like to set up shipping for your store?
  """
And two buttons appear: "Skip for now" and "Yes, set up shipping"
```

##### Scenario 2: Page refreshes after Step 4 completion

```gherkin
Given the merchant has completed Step 4: Set Up Shipping
And has saved a shipping method configuration
When the system marks "Set Up Shipping" step as COMPLETE
Then the page refreshes automatically
And the chat history is cleared
And the Store Preview remains visible (does not switch)
And the AI displays the opening message for Step 5:
  """
  Now let's configure online payments.

  Would you like to set up online payments for your store?
  """
And two buttons appear: "Skip for now" and "Yes, set up online payments"
```

##### Scenario 3: Completed step data persists after refresh

```gherkin
Given the merchant has completed Steps 1, 2, and 3
And the page has refreshed after Step 3
And the chat history is cleared
When the merchant views the Store Preview
Then the Store Preview displays:
  - Store name: "Mrs Goodies" (from Step 1)
  - Store slogan: "Save the best for last!" (from Step 1)
  - Store logo: uploaded logo image (from Step 1)
And all completed configuration data is preserved and visible
And the merchant can see the accumulated results of all completed steps
```

##### Scenario 4: Merchant cannot access previous step conversation after refresh

```gherkin
Given the page has refreshed after Step 3 completion
And the AI is now on Step 4: Set Up Shipping
When the merchant looks at the chat interface
Then the chat history only shows Step 4 messages
And the merchant cannot scroll up to see Step 1, 2, or 3 conversations
And the chat area shows only the current step's conversation
And previous steps' data is accessible only through dashboard settings (not chat)
```

---

### Feature F-11: Error Handling & Validation

#### 3.11.1 Feature Context

Provide clear error handling and validation throughout the AI onboarding flow to ensure data quality, guide merchants when inputs are invalid, and handle edge cases gracefully.

#### 3.11.2 Business Rules

**BR-50: Input Validation**

- All required fields validated before enabling Send button
- Email addresses validated for proper format
- Phone numbers validated for Philippine format (+63 + 10 digits)
- Numeric inputs validated for positive values
- Dropdown selections validated for non-empty values

**BR-51: Form-Level Validation**

- Address form: all fields required (Address, Province, City, Barangay, Postal Code, Country)
- Contact numbers form: Primary phone required, Alternate optional
- Store hours form: both Opening and Closing hours required
- Color pickers: Save button disabled until color selected

**BR-52: Error Display**

- Inline errors appear below invalid fields (red text)
- Input fields show red border when validation fails
- Error messages are specific and actionable
- Errors clear automatically when valid input provided

#### 3.11.3 Scenarios

##### Scenario 1: Send button disabled until required text input completed

```gherkin
Given the AI has asked for store name
And a text box is displayed
And the Send button is disabled (grayed out)
When the merchant clicks in the text box but does not type anything
Then the Send button remains disabled
When the merchant types "M"
Then the Send button becomes enabled immediately
When the merchant deletes all text (text box is empty)
Then the Send button becomes disabled again
```

##### Scenario 2: Form validation prevents submission with incomplete address

```gherkin
Given the AI has asked for store address
And an address form is displayed with all fields empty
And the Send button is disabled
When the merchant fills only Address and Province:
  | Address  | 123 Main Street |
  | Province | Cebu            |
And leaves City, Barangay, and Postal Code empty
Then the Send button remains disabled
When the merchant fills all remaining required fields
Then the Send button becomes enabled
```

##### Scenario 3: Invalid email format shows error

```gherkin
Given the AI has asked for store email
And a text box is displayed
When the merchant types "invalidemail" (no @ symbol)
And clicks outside the text box (blur event)
Then an inline error appears below the text box
And the error message reads "Please enter a valid email address."
And the text box shows a red border
And the Send button is disabled
When the merchant corrects the email to "info@store.com"
And clicks outside the text box
Then the error message disappears
And the red border is removed
And the Send button becomes enabled
```

---

### Feature F-12: Plus Button & Premium Feature Discovery

#### 3.12.1 Feature Context

Enable merchants to discover premium features (Add New Page, Connect Your Domain) during Steps 4 and 5 of onboarding through a Plus button that triggers an Upgrade Modal, promoting a 14-day Premium trial and allowing immediate trial activation with seamless redirect to Billing Page.

#### 3.12.2 Business Rules

**BR-53: Plus Button Visibility**

- Plus button (+) appears in bottom-left corner of chat section when merchant reaches Step 4 (Set Up Shipping)
- Plus button remains visible throughout Step 5 (Set Up Payments)
- Plus button does NOT appear in Steps 1, 2, or 3
- Button is positioned in the 40% chat section (left side), not in Store Preview section

**BR-54: Plus Button Menu Display**

- Clicking Plus button displays dropdown menu above the button
- Menu contains two options:
  - "Add New Page"
  - "Connect Your Domain"
- Both options are clearly labeled as premium/paid features
- Menu closes when merchant clicks outside menu area or selects an option

**BR-55: Upgrade Modal Trigger**

- Clicking "Add New Page" or "Connect Your Domain" triggers Upgrade Modal display
- Modal appears as overlay on top of current interface
- Both menu options trigger identical modal content
- Plus button menu closes automatically when modal opens

**BR-56: Modal Dismissal Behavior**

- Clicking "No thanks" closes the modal
- Merchant returns to chat interface at current step (Step 4 or Step 5)
- Current step status remains unchanged (INCOMPLETE if step not yet completed)
- Plus button remains visible for future access
- No data is saved or modified

**BR-57: Premium Trial Activation Flow**

- Clicking "ACTIVATE 14-DAY PREMIUM TRIAL NOW" triggers redirect to Billing Page
- System marks current step as INCOMPLETE:
  - If triggered during Step 4: "Set Up Shipping" marked INCOMPLETE
  - If triggered during Step 5: "Set Up Payments" marked INCOMPLETE
- Merchant exits AI onboarding interface
- Redirect navigates to existing Prosperna Billing Page (not part of AI onboarding)
- Merchant can complete trial activation on Billing Page
- Merchant can resume onboarding later from incomplete step

**BR-58: Step Incompletion on Billing Redirect**

- Only the current step is marked INCOMPLETE (not all steps)
- Previously completed steps (1, 2, 3) remain marked as COMPLETE
- Step completion data is preserved in database
- Merchant can return to complete incomplete step after trial activation
- Resume onboarding functionality allows continuation from incomplete step

#### 3.12.3 Scenarios

##### Scenario 1: Plus button appears when Step 4 begins

```gherkin
Given the merchant has completed Step 3 (Upload a Product)
And the page has refreshed after Step 3 completion
And the AI begins Step 4: Set Up Shipping
And the AI displays: "Great! Your store is taking shape. Now let's set up shipping for your products."
When the chat interface loads
Then a Plus button (+) appears in the bottom-left corner of the chat section
And the button is visible and clickable
And the button has a circular shape with a plus icon
```

##### Scenario 2: Plus button does NOT appear in Steps 1, 2, or 3

```gherkin
Given the merchant is on Step 1: Update Store Branding
When the chat interface displays the AI's store name question
Then the Plus button is NOT visible in the chat section
And no Plus button appears in the bottom-left corner

Given the merchant is on Step 2: Update Store Location
When the chat interface displays the AI's address question
Then the Plus button is NOT visible in the chat section

Given the merchant is on Step 3: Upload a Product
When the chat interface displays the AI's product type question
Then the Plus button is NOT visible in the chat section
```

##### Scenario 3: Clicking Plus button displays menu options

```gherkin
Given the Plus button is visible in the bottom-left corner during Step 4 or 5
When the merchant clicks the Plus button
Then a dropdown menu appears above the button
And the menu displays two options:
  | Option                  |
  | Add New Page            |
  | Connect Your Domain     |
And both options are clickable
And the menu remains open until an option is selected or merchant clicks outside
```

##### Scenario 4: Clicking "Add New Page" triggers Upgrade Modal

```gherkin
Given the Plus button menu is displayed
And shows "Add New Page" and "Connect Your Domain" options
When the merchant clicks "Add New Page"
Then the Plus button menu closes automatically
And the Upgrade Modal appears as an overlay covering the interface
And two action buttons are visible at the bottom:
  - Primary button: "ACTIVATE 14-DAY PREMIUM TRIAL NOW" (green, prominent)
  - Secondary button: "No thanks" (gray text link)
```

##### Scenario 5: Clicking "Connect Your Domain" triggers same Upgrade Modal

```gherkin
Given the Plus button menu is displayed
When the merchant clicks "Connect Your Domain"
Then the Plus button menu closes automatically
And the Upgrade Modal appears with identical content as "Add New Page" trigger
And displays the same Premium trial promotion
And shows the same feature list and action buttons
```

##### Scenario 6: Merchant dismisses Upgrade Modal with "No thanks"

```gherkin
Given the Upgrade Modal is displayed during Step 4 or 5
And the merchant is reviewing the Premium trial offer
When the merchant clicks "No thanks"
Then the Upgrade Modal closes immediately
And the merchant returns to the chat interface at Step 4 (or 5)
And the AI's last message is still visible (asking about shipping or payment setup)
And the current step status remains unchanged:
  - Step 4 (or 5) remains INCOMPLETE
And the Plus button remains visible in the bottom-left corner
And the merchant can continue with Step 4 (or 5) or click Plus button again later
```

##### Scenario 7: Merchant activates Premium trial

```gherkin
Given the Upgrade Modal is displayed during Step 4 (or 5)
When the merchant clicks "ACTIVATE 14-DAY PREMIUM TRIAL NOW"
Then the system performs the following actions:
  - Marks Step 4 (or 5) as INCOMPLETE in the database
  - Preserves Step 1, 2, and 3 as COMPLETE (no changes to previously completed steps)
And the merchant is redirected OUT of the AI onboarding interface
And navigates to the Billing Page (existing Prosperna feature)
And the Billing Page displays Premium trial activation options
And the merchant exits the AI-powered onboarding flow
```

##### Scenario 8: Plus button menu closes when clicking outside

```gherkin
Given the Plus button menu is displayed
And shows "Add New Page" and "Connect Your Domain" options
When the merchant clicks anywhere outside the menu area (e.g., on the chat messages or Store Preview)
Then the Plus button menu closes
And the menu disappears from view
And the Plus button returns to its default state (unpressed)
And the merchant can click the Plus button again to reopen the menu
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement                        | Metric                                                | Measurement Method            |
| ---------------------------------- | ----------------------------------------------------- | ----------------------------- |
| AI response time                   | Less than 2 seconds for standard queries (P95)        | API response monitoring       |
| Store Preview update speed         | Less than 1 second after merchant input submission    | Frontend rendering timing     |
| Chat interface initial load        | Less than 2 seconds on merchant dashboard             | Page load performance metrics |
| Device view switching              | Less than 500ms transition between device views       | UI state change timing        |
| Tool-calling interpretation        | Less than 3 seconds for complex freestyle edits (P95) | Backend AI processing timing  |
| Logo generation                    | Less than 30 seconds for AI logo generation           | AI service response time      |
| Media Library modal load           | Less than 1 second to open and display images         | Modal rendering performance   |
| Page refresh after step completion | Less than 3 seconds to reload and display next step   | Full page load timing         |
| Form input validation              | Less than 100ms for inline validation feedback        | Frontend validation timing    |

### 4.2 Scalability

| Requirement                    | Target                                              | Validation Method            |
| ------------------------------ | --------------------------------------------------- | ---------------------------- |
| Concurrent onboarding sessions | Support 1,000+ merchants onboarding simultaneously  | Load testing                 |
| Chat message history           | Handle 100+ message exchanges per session           | Memory usage testing         |
| Store Preview rendering        | Render complex stores with 50+ products efficiently | Frontend performance testing |
| AI tool-calling requests       | Process 500+ tool-calling requests per minute       | Backend scalability testing  |
| Media uploads                  | Handle 100+ concurrent logo/image uploads           | File upload load testing     |

### 4.3 Reliability

| Requirement                | Target                                          | Monitoring                      |
| -------------------------- | ----------------------------------------------- | ------------------------------- |
| AI interpretation accuracy | Greater than 95% for common merchant requests   | Tool-calling success logs       |
| Data persistence           | 100% completion data saved (zero data loss)     | Database transaction monitoring |
| Preview update accuracy    | 100% accurate reflection of configuration       | Automated UI testing            |
| Chat message delivery      | 99.9% successful message send/receive           | Message queue monitoring        |
| Step completion tracking   | 100% accurate step status (COMPLETE/INCOMPLETE) | State management testing        |

### 4.4 Security

| Requirement                    | Implementation                                  | Validation              |
| ------------------------------ | ----------------------------------------------- | ----------------------- |
| Merchant data privacy          | All configuration data encrypted at rest        | Encryption audit        |
| Session management             | Secure session tokens, timeout after inactivity | Security testing        |
| Media upload security          | File type validation, virus scanning on uploads | Upload security testing |
| AI prompt injection prevention | Input sanitization before LLM processing        | Security scanning       |
| Access control                 | Only authenticated merchants access onboarding  | Authorization testing   |

### 4.5 Usability

| Requirement               | Target                                               | Measurement            |
| ------------------------- | ---------------------------------------------------- | ---------------------- |
| Setup completion rate     | 85% of merchants complete all 5 steps                | Analytics tracking     |
| Time to complete setup    | 50% reduction vs traditional forms                   | User testing           |
| AI message comprehension  | 95% merchants understand AI questions immediately    | Usability testing      |
| Freestyle editing success | 80% merchants successfully edit via natural language | User testing           |
| Preview helpfulness       | 90% merchants report preview aids decision-making    | Post-onboarding survey |
| Overall satisfaction      | 4.5/5 average rating for onboarding experience       | Post-onboarding survey |

### 4.6 Compatibility

| Requirement           | Standard                                               | Validation            |
| --------------------- | ------------------------------------------------------ | --------------------- |
| Browser support       | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+          | Cross-browser testing |
| Mobile responsiveness | Fully functional on 375px+ width screens               | Responsive testing    |
| Screen reader support | Chat messages and buttons accessible via screen reader | Accessibility testing |
| Keyboard navigation   | All inputs navigable via Tab and Enter keys            | Accessibility testing |
| Internationalization  | Support for Philippine locales and formats             | Localization testing  |

---

## 5. User Experience & Design

### 5.1 User Flow Diagrams

**Primary Flow: AI-Powered Onboarding Complete Journey**

![Primary Flow: AI-Powered Onboarding Complete Journey](/product/user-flows/ai_onboarding_flow.png)

---

## 6. Technical Architecture & System Design

### 6.1 System Architecture Diagram

**Component Overview:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Prosperna Frontend                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           AI Onboarding Interface Component           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Chat Section (40% width, expandable to 100%)   │  │  │
│  │  │  • AI message bubbles (left-aligned)            │  │  │
│  │  │  • Merchant response bubbles (right-aligned)    │  │  │
│  │  │  • Dynamic input elements (text, dropdown,      │  │  │
│  │  │    forms, buttons, cards, time pickers,         │  │  │
│  │  │    color pickers)                               │  │  │
│  │  │  • Send button (enabled/disabled state)         │  │  │
│  │  │  • Hide/Show Preview toggle button              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Store Preview Section (60% width, toggleable)  │  │  │
│  │  │  • Device view selector (Mobile/Tablet/Desktop) │  │  │
│  │  │  • Switches between Store Preview and Product   │  │  │
│  │  │    Preview based on step                        │  │  │
│  │  │  • Real-time updates on configuration changes   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Media Library Modal Component               │  │
│  │  • Display existing merchant images                   │  │
│  │  • Upload new images from device                      │  │
│  │  • Image selection and confirmation                   │  │
│  │  • File validation (size, resolution, format)         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Shipping Configuration Form Component       │  │
│  │  • Replaces Store Preview during shipping setup       │  │
│  │  • Shipping method configuration forms                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway / Backend Services              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           AI Chat Service                             │  │
│  │  • Process merchant messages                          │  │
│  │  • Generate AI responses                              │  │
│  │  • Maintain conversation context                      │  │
│  │  • Handle step progression logic                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           LLM Integration Service                     │  │
│  │  • Call external LLM API (implementation-agnostic)    │  │
│  │  • Tool-calling/function-calling implementation       │  │
│  │  • Freestyle input interpretation                     │  │
│  │  • Natural language parsing                           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Store Configuration Service                 │  │
│  │  • Update store branding (name, slogan, logo, etc.)   │  │
│  │  • Update store location (address, hours, contact)    │  │
│  │  • Save configuration to database                     │  │
│  │  • Trigger Store Preview updates                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Product Service                             │  │
│  │  • Create product records                             │  │
│  │  • Upload product images                              │  │
│  │  • Set product labels                                 │  │
│  │  • Parse freestyle product details                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           AI Logo Generation Service                  │  │
│  │  • Call external logo generation API                  │  │
│  │  • Process logo parameters (layout, colors, fonts)    │  │
│  │  • Upload generated logo to Media Library             │  │
│  │  • Set as store logo                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Media Management Service                    │  │
│  │  • Store uploaded images                              │  │
│  │  • Validate file size/format                          │  │
│  │  • Serve images to Store Preview                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Merchant Stores Table                       │  │
│  │  • Store name, slogan, industry, subdomain            │  │
│  │  • Logo URL                                           │  │
│  │  • Address, contact numbers, store hours, email       │  │
│  │  • Branding and location data                         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Products Table                              │  │
│  │  • Product name, slug, SKU, brand, category           │  │
│  │  • Descriptions (long and short)                      │  │
│  │  • Pricing (regular, unit cost, sale)                 │  │
│  │  • Measurements (size, weight) for physical products  │  │
│  │  • Featured image URL, product labels                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Setup Progress Table                        │  │
│  │  • Merchant ID                                        │  │
│  │  • Step completion status (COMPLETE/INCOMPLETE)       │  │
│  │  • Timestamp of completion                            │  │
│  │  • Overall onboarding completion percentage           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Media Library Table                         │  │
│  │  • Merchant ID                                        │  │
│  │  • Image filename, URL, upload timestamp              │  │
│  │  • Image metadata (size, resolution, format)          │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Shipping Methods Table                      │  │
│  │  • Merchant ID, shipping method type                  │  │
│  │  • Configuration details (rates, descriptions)        │  │
│  │  • Active/inactive status                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Testing Strategy

### 7.1 Test Types & Coverage

| Test Type               | Coverage Target                                           | Responsibility | Tools                          |
| ----------------------- | --------------------------------------------------------- | -------------- | ------------------------------ |
| Unit Tests              | Greater than 85% code coverage for chat and preview logic | Dev Team       | Jest, React Testing Library    |
| Integration Tests       | AI service → Store configuration flow                     | Dev Team       | Jest, Supertest                |
| BDD Scenario Tests      | All 73 Gherkin scenarios automated                        | QA Team        | Cucumber, Playwright, Cypress  |
| API Tests               | AI chat endpoints, tool-calling, configuration APIs       | QA Team        | Postman, Newman                |
| E2E Tests               | Complete onboarding flow from survey to dashboard         | QA Team        | Playwright, Cypress            |
| Visual Regression Tests | Store Preview accuracy, chat UI consistency               | QA Team        | Percy, Chromatic               |
| Performance Tests       | AI response time, preview update speed                    | QA Team        | JMeter, k6, Lighthouse         |
| Usability Tests         | Merchant comprehension, completion rates                  | Product + QA   | User testing sessions          |
| Accessibility Tests     | Screen reader support, keyboard navigation                | QA Team        | axe, WAVE, NVDA                |
| Cross-browser Tests     | Chrome, Firefox, Safari, Edge compatibility               | QA Team        | BrowserStack, Sauce Labs       |
| Mobile Responsiveness   | Chat and preview on 375px+ screens                        | QA Team        | Device lab, responsive testing |

### 7.2 BDD Test Automation

**All 73 Gherkin scenarios in sections 3.1-3.12 must be automated as executable tests.**

**Test Structure:**

```
/tests
  /features
    /ai-onboarding
    /chat-interface-layout.feature
    /step-1-store-branding.feature
    /step-2-store-location.feature
    /step-3-upload-product.feature
    /step-4-shipping-setup.feature
    /step-5-payments-setup.feature
    /ai-tool-calling.feature
    /store-preview-updates.feature
    /page-refresh-state.feature
    /error-handling-validation.feature
  /step-definitions
    /chat-interface-steps.js
    /branding-steps.js
    /location-steps.js
    /product-steps.js
    /shipping-steps.js
    /payments-steps.js
    /tool-calling-steps.js
    /preview-steps.js
    /validation-steps.js
  /support
    /hooks.js
    /test-data.js
    /ai-helpers.js
    /preview-helpers.js
```

### 7.3 Critical Test Scenarios

**High Priority (P0 - Blocker):**

1. Merchant completes all 5 steps successfully
2. AI responses display correctly for each step
3. Send button enables/disables based on input validation
4. Store Preview updates in real-time after each input
5. Freestyle editing interprets and updates fields correctly
6. Logo upload via Media Library works correctly
7. Logo generation with AI completes successfully
8. Product creation with all fields saves correctly
9. Page refresh after Step 3 resets conversation
10. Shipping configuration form displays and saves correctly
11. OTP verification for payments works correctly
12. Step completion marks steps as COMPLETE
13. Toggle hide/show preview works correctly
14. Device view switching adjusts preview layout
15. All required form validations prevent submission

**Medium Priority (P1 - Critical):**

16. AI asks questions in correct progressive order
17. Merchant response bubbles display correctly
18. Dynamic input types appear based on question
19. Dropdown selectors work correctly
20. Time pickers allow hour selection
21. Color pickers allow color selection
22. Card selections trigger appropriate flows
23. Confirmation summaries display all details
24. Freestyle editing handles multi-field changes
25. Product Preview switches from Store Preview
26. Product labels appear as badges in preview
27. Shipping method cards display correctly
28. Skip buttons allow skipping optional steps
29. Page refresh preserves completed step data
30. Error messages display for invalid inputs

**Lower Priority (P2 - Important):**

31. AI response time under 2 seconds (P95)
32. Preview update time under 1 second
33. Chat interface loads under 2 seconds
34. Device view switch under 500ms
35. Logo generation under 30 seconds
36. Mobile responsiveness for all elements
37. Screen reader announces AI messages
38. Keyboard navigation through all inputs
39. Chat history scrollable within session
40. Conversation context maintained within step

---

## 8. Risks & Mitigations

| Risk                                                        | Impact | Likelihood | Mitigation                                                                                   |
| ----------------------------------------------------------- | ------ | ---------- | -------------------------------------------------------------------------------------------- |
| Logo generation AI produces poor quality images             | Medium | Medium     | Quality threshold validation, allow regeneration, fallback to manual upload always available |
| Tool-calling fails to identify fields from natural language | Medium | Medium     | Robust parsing logic, synonym mapping, re-ask question on failure, provide field name hints  |
| Mobile experience degraded due to split-screen layout       | Medium | Medium     | Mobile-specific layouts, allow full-screen chat on mobile, responsive design testing         |

---

## 9. Future Enhancements

1. **Multi-language Support** - Support for languages beyond English for AI conversations
2. **Voice Input** - Allow merchants to speak responses instead of typing
3. **AI Product Photo Generation** - Generate product photos from descriptions
4. **Bulk Product Upload** - AI-assisted bulk product import from CSV/spreadsheet
5. **Conversational Product Management** - Extend AI chat to post-onboarding product editing
6. **Smart Recommendations** - AI suggests optimal pricing, shipping methods based on industry
7. **Onboarding Analytics Dashboard** - Track where merchants drop off, optimize flow
8. **A/B Testing Framework** - Test different AI conversation flows for optimization
9. **Integration with CRM** - Sync onboarding data with merchant CRM systems
10. **Personalized Onboarding Paths** - Different flows for different merchant types (retail, wholesale, services)

---

## Approval and Sign-off

| Stakeholder       | Role | Status      | Date Signed       |
| ----------------- | ---- | ----------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---               |
| Ruel Nopal        | HoE  | ☐ Pending   | ---               |
| Rian Froille Alde | QA   | ☐ Pending   | ---               |
| [Backend Lead]    | BE   | ☐ Pending   | ---               |
| [Frontend Lead]   | FE   | ☐ Pending   | ---               |
| Adrianne Berida   | BA   | ☐ Completed | November 30, 2025 |

## **Approval Date:** YYYY-MM-DD

**Document End**

This PRD provides comprehensive specifications for enhancing Prosperna's merchant onboarding from traditional form-based setup to an AI-powered conversational experience with real-time store preview, intelligent tool-calling for natural language edits, and progressive disclosure of forms within chat flow.
