---
id: seo-settings
title: Basic vs Advanced SEO Settings
sidebar_label: Basic vs Advanced SEO Settings
sidebar_position: 1
---


# SEO | Basic and Advanced SEO Settings

## Executive **Summary**
This document outlines the business requirements for controlling access to Basic and Advanced SEO settings in Products, Blogs, and Page Builder modules based on the merchant's subscription plan. The goal is to ensure that SEO tools are segmented by plan and that default fallback values are applied when SEO customization is not available.
## Background
*   The following [SEO tags](https://docs.google.com/document/d/1NzBXEDQIx-YFICklJeidek4FvvOM_PBo5T_gFPxC3q0/edit?pli=1&tab=t.0) are required to gain more website traffic in merchant's online store
## Business Objective
*   Provide SEO customization to paid users, with tiered access.
*   Ensure consistent default SEO behavior for all paid users.
*   Improve organic visibility by enabling metadata configuration based on subscription level.
*   Encourage plan upgrades by gating advanced SEO tools.
## **Scope of Solution**
### Pricing

| Pricing Tier | Feature Available |
| ---| --- |
| Free | No access to SEO settings |
| Plus<br />Pro | Access to **Basic SEO settings** |
| Premium | Access to both **Basic** and **Advanced SEO settings** |

### What is Basic vs Advanced SEO Settings?
Basic contains the following SEO Settings:
*   Meta Title
    *   Meta Image
    *   Meta Description
    *   Meta Keywords
Advanced contains the following SEO Settings:
*   Robots
    *   Noindex
    *   Nofollow
    *   Advanced Robots
*   Advanced SEO
        *   Redirect
        *   Rating
        *   Schema (for Google Search Results)
### In Scope:
*   Introduce SEO tabs (Basic and Advanced) in Products, Blogs, and Page Builder.
*   Default tab shown: **Basic**.
*   Auto-generate default SEO values for all pages.
*   Store system-generated SEO data separately from user-edited values.
*   Add meta tags in `<head>` of page (see [Summary of Meta Tags](https://pkb.prosperna.ph/docs/product/frances/SEO/summary-of-meta-tags) for full list of meta tags)
## Business Requirements

| ID | Requirement |
| ---| --- |
| BR-001 | Display SEO Settings tabs (Basic, Advanced) in Blogs, Products, and Page Builder modules. |
| BR-002 | Default tab displayed must be **Basic**. |
| BR-003 | Hide or disable SEO Settings UI for merchants on Free plans. |
| BR-004 | Enable only Basic SEO Settings for merchants on Basic (paid) plans. |
| BR-005 | Enable both Basic and Advanced SEO Settings for merchants on Premium plans. |
| BR-006 | Advanced tab must contain sections for Robots, Advanced Robots, Advanced, and Schema. |
| BR-007 | Auto-generate default values for all SEO fields (Basic and Advanced) across modules. |
| BR-008 | Basic SEO: Allow configuration of title, meta description, keywords, and OG tags. |
| BR-009 | Robots: Allow merchants to specify index/follow directives. |
| BR-010 | Advanced Robots: Support additional robots meta directives (e.g., max-snippet, noarchive). |
| BR-011 | Advanced: Allow setting of permanent (301) or temporary (302) redirects. |
| BR-012 | Schema: Allow adding structured data types per page/module. |
| BR-013 | If user lacks access (due to plan), display fallback auto-generated values in read-only state. |
| BR-014 | When merchant upgrades their plan, access to additional settings becomes available instantly. |
| BR-015 | Downgrade should hide locked settings and retain stored values but prevent editing. |

## Stakeholder Analysis

| Stakeholder | Role | Interest |
| ---| ---| --- |
| Product Owner | Defines tier-based access | Ensure upsell opportunities via gated features |
| Developers | Build plan-gated logic | Feature toggling and UI logic accuracy |
| QA Team | Test SEO features across plans | Validate feature access, auto-generation, and fallback |
| SEO Specialists | Advise on metadata rules | Ensure SEO best practices and schema accuracy |
| Merchants | End-users | Use SEO tools to improve traffic |

## **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 01** | System | Display Tabs for SEO Settings<br /> | To allow merchants to access and configure SEO metadata settings via multiple tabbed interfaces (Basic, Robots, Advanced Robots, Advanced, Schema) depending on the content module (Page Builder, Blogs, Products). | **HIGH** |
| **UC 02** | System | Enable/Disable SEO Settings in Products Based on Subscription Plan | To manage the visibility and interactivity of SEO settings in the Products module based on the merchant’s subscription plan. | **HIGH** |
| **UC 03** | System | Enable/Disable SEO Settings in Blogs Based on Subscription Plan<br /> | To control access and visibility of SEO settings in the Blogs module depending on the merchant's subscription plan.<br /> | **HIGH** |
| **UC 04** | System | Enable/Disable SEO Settings in Page Builder Based on Subscription Plan | To enable or restrict SEO settings in the Page Builder module depending on the merchant’s subscription plan. | **HIGH** |
| **UC 05** | Merchant | Set Up Basic SEO Settings | Allow merchants to set basic SEO settings (meta title, description, keywords, image) within Page Builder, Blogs, or Products. | **HIGH** |
| **UC 06** | System | Display Keyword Results in Search Engine | To ensure that a merchant’s meta keywords, meta title, and meta description appear in search engine results when a consumer searches for relevant keywords. | **HIGH** |
| **UC 07** | Merchant | Set Up Robots SEO Settings | Allow merchants to configure Robots SEO settings (e.g., Noindex, Nofollow, Noarchive, etc.) for pages, blogs, and products. | **HIGH** |
| **UC 8** | System | Display/Hide Page/Blog/Products from Search Engine Results | Enable control over whether a page or blog post is visible in search engine results using noindex and nofollow settings. | **HIGH** |
| **UC 9** | System | Automatically Enable Noindex & Nofollow on Subdomain Pages when Custom Domain is Used | Ensure that subdomain pages are not indexed or searchable on search engines when a custom domain is used by the merchant. | **HIGH** |
| **UC 10** | System | Display/Hide Subdomain Pages from Search Engine Results | Ensure subdomain pages are hidden from search engine results when a custom domain is in use by the merchant. | **HIGH** |
| **UC 11** | Merchant | Set Up Advanced Robots SEO Settings | Allow merchants to configure advanced robot directives by setting meta tag values for snippet length, video preview, and image preview visibility. | **HIGH** |
| **UC 12** | Merchant | Set Up Advanced SEO Settings | Allow merchants to configure a redirect URL and rating for a page, blog, or product to help manage SEO and content routing. | **HIGH** |
| **UC 13** | Merchant | Set Up Schema SEO Settings | Automatically generate structured data for Organization and Breadcrumb schema markups, and allow merchant to configure Article Schema for each blog post to improve SEO visibility. | **HIGH** |
| **UC 14** | Merchant | Setup Meta Theme Color for Browser Toolbar in Mobile | Allow the merchant to customize the browser toolbar color through the Design Settings > Colors & Style Tab > Color Settings Accordion > Customize Colors Section | **HIGH** |
| **UC 15** | System | Automatically Generate Default SEO Tags<br /> | Automatically generate and inject key SEO meta tags to the `<head>` when a merchant creates or updates a page, blog, or product. | **HIGH** |
| **UC 16** | System | Automatically Set Default Content for Basic SEO | Automatically apply default SEO metadata when a merchant does not manually enter meta title, description, or image for pages, blogs, or products. | **HIGH** |
| **UC 17** | System | Automatically Set Default Content for Robots<br /> | Ensure that robots meta tags (`noindex`, `nofollow`, `noarchive`, `nosnippet`, `noimageindex`) are always present with default values when the merchant does not configure them manually. | **HIGH** |
| **UC 18** | System | Automatically Set Default Content for Advanced Robots<br /> | Ensure that Advanced Robots meta tags are present using safe and SEO-friendly defaults if merchant leaves them unconfigured. | **HIGH** |
| **UC 19** | System | Automatically Set Default Content for **Advanced**<br /> | Automatically ensure that all pages, blogs, and products have a valid Advanced setting even if the merchant does not configure one. Prevent broken redirect metadata. | **HIGH** |
| **UC 20** | System | Automatically Set Default Content for Schema | Automatically configure default Schema SEO markup for all pages and allow merchant to customize Article Schema per blog post. | **HIGH** |
| **UC 21** | System | Reset SEO Settings to Default<br /> | Allow merchants to revert any manually modified SEO settings back to the default fallback configuration through a reset button per SEO tab. | **HIGH** |
| **UC 22** | System | Automatically Set Last Modified Date<br /> | Automatically track and reflect the last modified timestamp in all supported SEO mechanisms: XML sitemap `<lastmod>`, Open Graph `og:updated_time`, and `Last-Modified` HTTP header. | **HIGH** |

### **Use Case Description Tables**
## Main Tabs for All Modules (Blogs, Products, Builder)
### UC 01 | Display Tabs for SEO Settings

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-01 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | To allow merchants to access and configure SEO metadata settings via multiple tabbed interfaces (Basic, Robots, Advanced Robots, Redirect, Schema) depending on the content module (Page Builder, Blogs, Products). |
| **Actor** | System |
| **Preconditions** | \- Merchant is logged into the admin panel<br />\- Merchant has an active paid plan for Page Builder or Blogs<br />\- Merchant is in SEO Settings section for a specific module (Page Builder, Blogs, Products) |
| **Conditions** | \- Condition 1: Merchant is editing or creating a page via Page Builder<br />\- Condition 2: Merchant is editing or creating a blog post<br />\- Condition 3: Merchant is editing or creating a product |
| **Steps** | **Condition 1:**<br />1\. Merchant logs in<br />2\. Merchant navigates to **Page Builder**<br />3\. Merchant either:<br /> a. Adds a new page<br />  - System confirms paid plan subscription<br />  - System displays **Add New Page** interface<br /> b. Quick edits an existing page<br />  - System displays **Quick Edit** interface<br /><br />**Condition 2:**<br />1\. Merchant navigates to **Marketing > Blogs**<br />2\. System confirms:<br /> - Merchant is subscribed to paid plan<br /> - Merchant is subscribed to Blogs<br />3\. System displays Blog interface<br />4\. Merchant either:<br /> a. Adds a new blog<br /> b. Edits an existing blog<br />5\. System displays blog SEO settings panel<br /><br />**Condition 3:**<br />1\. Merchant navigates to **Products > Inventory**<br />2\. Merchant either:<br /> a. Adds a new product<br /> b. Edits an existing product<br />3\. System displays product SEO settings panel<br /><br />**Steps for All Conditions:**<br />1\. Merchant navigates to the **SEO Settings** section of the interface<br />2\. System displays the following tabs:<br /> - **Basic**<br /> - **Robots**<br /> - **Advanced Robots**<br /> - **Redirect**<br /> - **Schema**<br />3\. Merchant clicks a tab to configure:<br /><br />**Basic Tab:**<br /> - Meta Title text box<br /> - Meta Description text area<br /> - Meta Keywords text box<br /> - Image upload box with preview<br /> - Reset button<br /><br />**Robots Tab:**<br /> - No Index toggle<br /> - No Follow toggle<br /> - No Archive toggle<br /> - No Image Index toggle<br /> - No Snippet toggle<br /> - Tooltips explaining toggle behavior<br /> - Reset button<br /><br />**Advanced Robots Tab:**<br /> - Max Snippet Length text box<br /> - Max Video Preview text box<br /> - Max Image Preview text box<br /> - Tooltips<br /> - Reset button<br /><br />**Redirect Tab:**<br /> - Redirect text box<br /> - Tooltip<br /> - Reset button;<br /><br />**Schema Tab:**<br /> - Schema Type dropdown<br /> - Author text box<br /> - Tooltips<br /> - Reset button |
| **Postconditions** | \- Merchant's SEO metadata preferences are saved and reflected in the meta tags of rendered frontend pages |
| **Business Trigger** | Merchant wants to improve or customize SEO settings for pages, blogs, or products |
| **Acceptance Criteria** | \- SEO tab panel is accessible across eligible modules<br />\- Each tab displays the correct fields and tooltips<br />\- Settings are stored and applied on Save<br />\- Reset clears current input values |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- “Unable to load SEO Settings. Please try again.”<br />\- “Save failed. Please check your input and try again.” |

|  Business Rules/Desired Behavior |
| --- |
| **Tool Tips**<br /><br />1. Basic Tab<br />Meta Title<br />**Tooltip:** "The meta title, also known as a title tag, is HTML code that specifies the title of a webpage. It's displayed on search engine results pages (SERPs) and in browser tabs, giving users and search engines a brief summary of the page's content. Optimizing meta titles is crucial for SEO, as they influence click-through rates and ranking signals."<br />Meta Description<br />**Tooltip:** "The meta description is a summary of a webpage's content that appears in search engine results pages (SERPs) below the meta title and URL. It’s crucial for attracting clicks from users by providing a convincing overview of the page's content that encourages them to visit."<br />Meta Keywords<br />**Tooltip:** "Add relevant keywords separated by commas to help describe your page content to search engines."<br />Image Upload (SEO Image/Open Graph)<br />**Tooltip:** "Upload an image that represents your page when shared on social media to increase engagement."<br /><br />2\. Robots Tab<br /><br />No Index Toggle<br />**Tooltip:** "Enable to prevent search engines from showing this page in search results. Disable to allow search engines to index and display your page."<br />No Follow Toggle<br />**Tooltip:** "Enable to prevent search engines from following links on this page for ranking purposes. Disable to allow search engines to follow your page links normally."<br />No Archive Toggle<br />**Tooltip:** "Enable to prevent search engines from storing a cached copy of your page. Disable to allow search engines to archive your page normally."<br />No Image Index Toggle<br />**Tooltip:** "Enable to prevent search engines from showing your page images in image search results. Disable to allow your images to appear in image search."<br />No Snippet Toggle<br />**Tooltip:** "Enable to prevent search engines from showing a description snippet in search results. Disable to allow search engines to display your page snippets normally."<br /><br />3\. Advanced Robots Tab<br /><br />Max Snippet Length<br />**Tooltip:** "Set the maximum number of characters for the text snippet that appears in search results."<br />Max Video Preview<br />**Tooltip:** "Set the maximum duration in seconds for video previews that appear in search results."<br />Max Image Preview<br />**Tooltip:** "Control the size of image previews that appear in search results."<br /><br />4\. Redirect Tab<br /><br />Redirect URL<br />**Tooltip:** "Enter a URL to redirect visitors from this page to another location on your site."<br /><br />5\. Schema Tab<br /><br />Schema Type<br />**Tooltip:** "Select the type of structured data markup to help search engines understand your content better."<br />Author<br />**Tooltip:** "Enter the name of the content author or company responsible for this page to establish credibility."<br /> |

## SEO in Products
### UC 02 | Enable/Disable SEO Settings in Products Based on Subscription Plan

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-02 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | To manage the visibility and interactivity of SEO settings in the Products module based on the merchant’s subscription plan. |
| **Actor** | System |
| **Preconditions** | \- Merchant is logged into the system<br />\- Merchant is on the Products page<br />\- Merchant is in the SEO Settings section |
| **Conditions** | \- Condition 1: Merchant is on a **Free** plan<br />\- Condition 2: Merchant is on a **Plus or Pro** plan<br />\- Condition 3: Merchant is on a **Premium** plan |
| **Steps** | **All Conditions:**<br />1\. Merchant logs in<br />2\. Merchant navigates to **Products > Inventory**<br />3\. Merchant either:<br /> a. Adds a new product<br /> b. Edits an existing product<br />4\. Merchant views product details page<br />5\. Merchant clicks the **SEO Settings** section<br />6\. System detects the subscription plan<br /> - If **Free**, system displays a crown icon on the **Search Engine Optimization** section title<br /> - If **Paid**, system hides crown icon<br />7\. System activates the **Basic** tab by default<br /><br />**Condition 1: Free Plan**<br />**Basic Tab**<br />1\. All text boxes are disabled<br />2\. Clicking any field shows **Upgrade Modal**<br /><br />**Robots Tab**<br />1\. All toggle switches are disabled<br />2\. Clicking any toggle shows **Upgrade Modal**<br /><br />**Advanced Robots Tab**<br />1\. All text boxes are disabled<br />2\. Clicking any box shows **Upgrade Modal**<br /><br />**Redirect Tab**<br />1\. Text box is disabled<br />2\. Clicking it shows **Upgrade Modal**<br /><br />**Schema Tab**<br />1\. All dropdowns and text boxes are disabled<br />2\. Clicking any field shows **Upgrade Modal**<br /><br />**Condition 2: Plus or Pro Plan**<br />**Basic Tab**<br />1\. All fields are enabled<br /><br />**Robots Tab**<br />1\. Crown icon appears in title: **"Robots.txt Settings"**<br />2\. All toggle switches are disabled<br />3\. Clicking a toggle shows **Upgrade Modal**<br /><br />**Advanced Robots Tab**<br />1\. Crown icon appears in title: **"Advanced Robots Settings"**<br />2\. All text boxes are disabled<br />3\. Clicking a text box shows **Upgrade Modal**<br /><br />**Redirect Tab**<br />1\. Crown icon appears in title: **"Redirect"**<br />2\. Text box is disabled<br />3\. Clicking the box shows **Upgrade Modal**<br /><br />**Schema Tab**<br />1\. Crown icon appears in title: **"Schema Settings"**<br />2\. All fields (dropdowns and text boxes) are disabled<br />3\. Clicking any field shows **Upgrade Modal**<br /><br />**Condition 3: Premium Plan**<br />**Basic Tab**<br />1\. All fields are enabled<br /><br />**Robots Tab**<br />1\. Crown is hidden from title<br />2\. All toggle switches are enabled<br /><br />**Advanced Robots Tab**<br />1\. Crown is hidden from title<br />2\. All text boxes are enabled<br /><br />**Redirect Tab**<br />1\. Crown is hidden from title<br />2\. Text box is enabled<br /><br />**Schema Tab**<br />1\. Crown is hidden from title<br />2\. All dropdowns and text boxes are enabled |
| **Postconditions** | \- SEO fields are either enabled or disabled based on the merchant’s subscription plan<br />\- Upgrade prompts appear when restricted fields are accessed by lower-tier users |
| **Business Trigger** | Merchant attempts to configure SEO settings for a product |
| **Acceptance Criteria** | \- Crown icon appears on restricted features for Free, Plus, and Pro plans<br />\- Only Premium merchants can access all tabs fully<br />\- Clicking on disabled elements always shows upgrade modal<br />\- System correctly distinguishes merchant's plan and adjusts UI elements accordingly |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- “This feature is available on a higher plan. Upgrade now to unlock it.” (in modal)<br />\- “Your current plan does not support this setting.” |

## SEO in Blogs
### UC 03 | Enable/Disable SEO Settings in Blogs Based on Subscription Plan

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-03 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | To control access and visibility of SEO settings in the Blogs module depending on the merchant's subscription plan. |
| **Actor** | System |
| **Preconditions** | \- Merchant is logged in<br />\- Merchant is subscribed to a paid plan<br />\- Merchant is subscribed to the Blogs add-on<br />\- Merchant is in the Blogs module<br />\- Merchant is in the SEO Settings section |
| **Conditions** | \- Condition 1: Merchant is on a **Plus or Pro** plan<br />\- Condition 2: Merchant is on a **Premium** plan |
| **Steps** | **All Conditions:**<br />1\. Merchant logs in<br />2\. Merchant navigates to **Marketing > Blogs**<br />3\. System detects:<br /> a. Merchant is on a paid plan<br /> b. Merchant is subscribed to Blogs<br />4\. System displays Blogs dashboard<br />5\. Merchant either:<br /> a. Adds a new blog<br /> b. Edits an existing blog<br />6\. Merchant views blog editing page<br />7\. Merchant clicks on the **SEO Settings** section<br />8\. System shows **Basic** tab as active by default<br />9\. System enables all fields in Basic tab for all paid plans<br /><br />**Condition 1: Plus or Pro Plan**<br />**Robots Tab**<br />1\. Crown icon appears in title: **"Robots.txt Settings"**<br />2\. All toggle switches are disabled<br />3\. Clicking a toggle shows **Upgrade Modal**<br /><br />**Advanced Robots Tab**<br />1\. Crown icon appears in title: **"Advanced Robots Settings"**<br />2\. All text boxes are disabled<br />3\. Clicking a box shows **Upgrade Modal**<br /><br />**Redirect Tab**<br />1\. Crown icon appears in title: **"Redirect"**<br />2\. Text box is disabled<br />3\. Clicking it shows **Upgrade Modal**<br /><br />**Schema Tab**<br />1\. Crown icon appears in title: **"Schema Settings"**<br />2\. All dropdowns and text boxes are disabled<br />3\. Clicking any field shows **Upgrade Modal**<br /><br />**Condition 2: Premium Plan**<br />**Robots Tab**<br />1\. Crown is hidden from title<br />2\. All toggle switches are enabled<br /><br />**Advanced Robots Tab**<br />1\. Crown is hidden from title<br />2\. All text boxes are enabled<br /><br />**Redirect Tab**<br />1\. Crown is hidden from title<br />2\. Text box is enabled<br /><br />**Schema Tab**<br />1\. Crown is hidden from title<br />2\. All dropdowns and text boxes are enabled |
| **Postconditions** | \- SEO settings are either enabled or restricted depending on the merchant’s subscription level<br />\- Upgrade modal is triggered when accessing restricted features |
| **Business Trigger** | Merchant attempts to configure blog SEO settings |
| **Acceptance Criteria** | \- Basic SEO settings are accessible to all paid merchants<br />\- Robots, Advanced Robots, Redirect, and Schema settings are accessible only to Premium merchants<br />\- System displays crowns for restricted tabs (Plus/Pro)<br />\- Upgrade modals are shown on interaction with restricted fields |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- “This feature is available on a higher plan. Upgrade now to unlock it.” (in modal)<br />\- “Your current plan does not support this setting.” |

## SEO in Page Builder
### UC 04 | Enable/Disable SEO Settings in Page Builder Based on Subscription Plan

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-04 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | To enable or restrict SEO settings in the Page Builder module depending on the merchant’s subscription plan. |
| **Actor** | System |
| **Preconditions** | \- Merchant is logged in<br />\- Merchant is subscribed to Page Builder<br />\- Merchant is in the Page Builder module<br />\- Merchant is viewing the SEO Settings section |
| **Conditions** | \- Condition 1: Merchant is on a **Plus or Pro** plan<br />\- Condition 2: Merchant is on a **Premium** plan |
| **Steps** | **All Conditions:**<br />1\. Merchant logs in<br />2\. Merchant navigates to **Page Builder**<br />3\. Merchant either:<br /> a. Clicks **Add New Page**<br />  - System confirms merchant is on a paid plan<br />  - System displays **Add New Page** screen<br /> b. Quick edits an existing page<br />  - System displays **Quick Edit** screen<br />4\. Merchant navigates to **SEO Settings** section<br />5\. **Basic tab** is active by default<br />6\. System enables all fields in Basic tab for all paid plans<br /><br />**Condition 1: Plus or Pro Plan**<br />**Robots Tab**<br />1\. Crown icon appears in title: **"Robots.txt Settings"**<br />2\. All toggle switches are disabled<br />3\. Clicking a toggle shows **Upgrade Modal**<br /><br />**Advanced Robots Tab**<br />1\. Crown icon appears in title: **"Advanced Robots Settings"**<br />2\. All text boxes are disabled<br />3\. Clicking a text box shows **Upgrade Modal**<br /><br />**Redirect Tab**<br />1\. Crown icon appears in title: **"Redirect"**<br />2\. Text box is disabled<br />3\. Clicking it shows **Upgrade Modal**<br /><br />**Schema Tab**<br />1\. Crown icon appears in title: **"Schema Settings"**<br />2\. All dropdowns and text boxes are disabled<br />3\. Clicking any field shows **Upgrade Modal**<br /><br />**Condition 2: Premium Plan**<br />**Robots Tab**<br />1\. Crown is hidden from title<br />2\. All toggle switches are enabled<br /><br />**Advanced Robots Tab**<br />1\. Crown is hidden from title<br />2\. All text boxes are enabled<br /><br />**Redirect Tab**<br />1\. Crown is hidden from title<br />2\. Text box is enabled<br /><br />**Schema Tab**<br />1\. Crown is hidden from title<br />2\. All dropdowns and text boxes are enabled |
| **Postconditions** | \- Merchant accesses or is restricted from SEO settings based on their plan<br />\- Upgrade modal is shown when merchant tries to access restricted settings |
| **Business Trigger** | Merchant adds or edits a page in Page Builder and accesses SEO Settings |
| **Acceptance Criteria** | \- Basic SEO fields are enabled for all paid plans<br />\- Premium-only SEO settings (robots, advanced robots, redirect, schema) are disabled for Plus/Pro with crown and modal<br />\- Premium merchants can access all SEO tabs without restrictions |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- “This feature is available on a higher plan. Upgrade now to unlock it.”<br />\- “Your current plan does not support this setting.” |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br /> |

## Basic SEO Settings
### UC 05 | Set Up Basic SEO Settings

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-05 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Allow merchants to set basic SEO settings (meta title, description, keywords, image) within Page Builder, Blogs, or Products. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is logged in<br />\- Merchant is in either Page Builder, Blogs, or Products module<br />\- Merchant is in the SEO Settings section under the Basic tab |
| **Conditions** | \- Condition 1: Merchant is editing a Page<br />\- Condition 2: Merchant is editing a Blog<br />\- Condition 3: Merchant is editing a Product |
| **Steps** | **Condition 1:**<br />1\. Merchant is in **Page Builder**<br />2\. Merchant adds a new page or edits an existing one<br />3\. Merchant navigates to **SEO Settings > Basic tab**<br />4\. Merchant inputs **Meta Title**<br /> - Character limit enforced (e.g., max 60)<br /> - System shows character counter (e.g., 25/60)<br />5\. Merchant inputs **Meta Description**<br /> - Character limit enforced (e.g., max 160)<br /> - System shows character counter (e.g., 90/160)<br />6\. Merchant enters **Keywords**<br /> - Pressing **Enter** or comma `,` turns input into tag<br /> - System allows multiple tags in one field<br />7\. Merchant uploads **Meta Image**<br /> - Drag or click upload<br /> - System validates:<br />  • Max size: 5MB<br />  • Min reso: 600x315px<br />  • Recommended: 1200x630px<br />  • Allowed types: .jpg or .png<br />  - If invalid:<br />   • Size error: “Image exceeds max file size of 5MB.”<br />   • Reso error: “Image must be at least 600×315px.”<br />   • Type error: “Only JPG and PNG formats are allowed.”<br />  - If valid:<br />   • Image preview shown<br />   • Success message: “Image uploaded successfully.”<br />8\. Merchant clicks **Save/Create/Update** CTA<br />9\. System saves SEO settings and injects into `<head>` of the page:<br /> - **Meta Title**:<br />  • `<title>`<br />  • `<meta property="og:title">`<br />  • `<meta name="twitter:title">`<br /> - **Meta Description**:<br />  • `<meta name="description">`<br />  • `<meta property="og:description">`<br />  • `<meta name="twitter:description">`<br /> - **Meta Keywords**:<br />  • `<meta name="keywords">`<br /> - **Meta Image**:<br />  • `<meta property="og:image">`<br />  • `<meta name="twitter:image">`<br /><br />**Condition 2 and 3:**<br />Same steps apply if merchant is in **Blogs** or **Products** module. |
| **Postconditions** | \- SEO data is saved successfully<br />\- Correct meta tags are rendered on the live page/blog/product |
| **Business Trigger** | Merchant adds or edits a product, blog, or page and configures SEO settings |
| **Acceptance Criteria** | \- Character limits are enforced for meta title/description<br />\- Keywords are added as tags<br />\- Image upload validates size, resolution, and type<br />\- Proper meta tags are injected into the page `<head>` |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- “Image exceeds max file size of 5MB.”<br />\- “Image must be at least 600×315px.”<br />\- “Only JPG and PNG formats are allowed.” |

### Meta Keywords
### UC 06 | Display Keyword Results in Search Engine 
![](https://t7537039.p.clickup-attachments.com/t7537039/18c961dc-d813-427b-a138-64affae3d222/shapes%20at%2025-08-26%2022.18.44.png)

| **Use Case ID** | **UC-06** |
| ---| --- |
| **Use Case Name** | Display Keyword Results in Search Engine |
| **Objective** | To ensure that a merchant’s **meta keywords, meta title, and meta description** appear in search engine results when a consumer searches for relevant keywords. |
| **Prepared By** | Frances Ramos |
| **Last Updated** | March 20, 2025 |
| **Actor** | Consumer, Google Search Engine, System |
| **Preconditions** | \- Merchant is in **Page Builder > Quick Edit modal**.<br />\- Merchant has **added meta keywords, meta title, and meta description** to the page.<br />\- The **page is published** and has been **indexed by Google**. |
| **Steps** | **Consumer Searches for Keywords:**<br />1\. Consumer **goes to a search engine** (e.g., Google Search).<br />2\. Consumer **enters a keyword** related to the merchant’s page and clicks **Search**.<br /><br />**Search Engine Recognizes the Merchant’s Page:**<br />3\. Google **processes the search query** and **matches it** with indexed pages.<br />4\. Google **detects that the entered keyword matches the meta keywords** of a merchant's page.<br /><br />**Search Engine Displays Merchant’s Page:**<br />5\. Google **displays the merchant’s page in the search results**, showing the following:<br />**Meta Image**<br />**Meta Title**<br />**Meta Description**<br />**Meta Keywords (if supported by the search engine)**<br />6\. Consumer clicks on the merchant’s page<br />7\. System displays the meta keywords on the page |
| **Postconditions** | \- The **merchant's page** appears in the **search results** based on relevant **meta keywords**.<br />\- The **consumer can click** on the search result to visit the merchant's page. |
| **Business Rules** | \- **Search engine indexing** must be completed before the page appears in results.<br />\- Google may **ignore meta keywords**, but **meta title and description** will still influence rankings.<br />\- The **merchant's page must be public** and **crawlable by search engines**. |
| **Acceptance Criteria** | \- The **merchant’s page** appears in search results **when relevant keywords are searched**.<br />\- The **meta title and description** are **displayed correctly** in search results.<br />\- If supported, **meta keywords are recognized** by the search engine. |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br />Page Builder<br />SEO<br /> |

## Advanced SEO Settings
### Robots Settings
### UC 07 | Set Up Robots SEO Settings

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-07 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Allow merchants to configure Robots SEO settings (e.g., Noindex, Nofollow, Noarchive, etc.) for pages, blogs, and products. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is logged in<br />\- Merchant is either in Page Builder, Blogs, or Products<br />\- Merchant has navigated to the **SEO Settings > Robots tab** |
| **Conditions** | \- Condition 1: Merchant is editing a Page<br />\- Condition 2: Merchant is editing a Blog<br />\- Condition 3: Merchant is editing a Product |
| **Steps** | **Condition 1:**<br />1\. Merchant is in **Page Builder**<br />2\. Merchant adds or edits a page<br />3\. Merchant navigates to **SEO Settings > Robots tab**<br />4\. Merchant toggles SEO robot settings:<br /><br />**If Noindex = ON**:<br /> - Merchant saves changes<br /> - System inserts:<br />  • `<meta name="robots" content="noindex">`<br />  • `<meta name="googlebot" content="noindex">`<br />  • `<meta name="bingbot" content="noindex">`<br /><br />**If Noindex = OFF**:<br /> - Merchant saves changes<br /> - System inserts:<br />  • `<meta name="robots" content="index">`<br />  • `<meta name="googlebot" content="index">`<br />  • `<meta name="bingbot" content="index">`<br /><br />**If Nofollow = ON**:<br /> - Merchant saves changes<br /> - System inserts:<br />  • `<meta name="robots" content="nofollow">`<br />  • `<meta name="googlebot" content="nofollow">`<br />  • `<meta name="bingbot" content="nofollow">`<br /><br />**If Nofollow = OFF**:<br /> - Merchant saves changes<br /> - System inserts:<br />  • `<meta name="robots" content="follow">`<br />  • `<meta name="googlebot" content="follow">`<br />  • `<meta name="bingbot" content="follow">`<br /><br />**If Noarchive = ON**:<br /> - Merchant saves changes<br /> - System inserts:<br />  • `<meta name="googlebot" content="noarchive">`<br />  • `<meta name="bingbot" content="noarchive">`<br /><br />**If Noarchive = OFF**:<br /> - Merchant saves changes<br /> - System **removes** `noarchive` meta tags (if any)<br /><br />**If No Image Index = ON**:<br /> - Merchant saves changes<br /> - System inserts:<br />  • `<meta name="googlebot" content="noimageindex">`<br />  • `<meta name="bingbot" content="noimageindex">`<br /><br />**If No Image Index = OFF**:<br /> - Merchant saves changes<br /> - System **removes** `noimageindex` meta tags (if any)<br /><br />**If No Snippet = ON**:<br /> - Merchant saves changes<br /> - System inserts:<br />  • `<meta name="googlebot" content="nosnippet">`<br />  • `<meta name="bingbot" content="nosnippet">`<br /><br />**If No Snippet = OFF**:<br /> - Merchant saves changes<br /> - System **removes** `nosnippet` meta tags (if any)<br /><br />**Condition 2 and 3:**<br />Same steps apply if merchant is editing **Blogs** or **Products**. |
| **Postconditions** | \- Robots meta tags are saved and correctly injected into the page’s `<head>` section |
| **Business Trigger** | Merchant wants to control how search engines crawl and index the page, blog, or product |
| **Acceptance Criteria** | \- Meta tags are updated based on toggle states<br />\- Correct tags appear in `<head>` for each bot (Google, Bing)<br />\- Disabled tags are removed from `<head>` |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | N/A – Toggle settings are assumed to be direct, no validation errors required |

### **UC 08 | Display/Hide Page/Blog/Products from Search Engine Results**

| Column | Description |
| ---| --- |
| Use Case ID | UC8 |
| Prepared By | Frances Ramos |
| Last Updated | January 3, 2025 |
| Objectives | Enable control over whether a page or blog post is visible in search engine results using noindex and nofollow settings. |
| Actor | Developer, Consumer |
| Preconditions | \- Consumer tries to view the page/blog via a search engine. |
|  | \- Developer inspects live/preview of the page/blog. |
|  | \- Page/Blog should be published |
| Conditions | 1\. View Noindex or Nofollow in the code. |
|  | 2\. View page/blog in search engine results. |
| Steps | Condition 1: View Noindex/Nofollow in Code |
|  | 1\. Developer views the live/preview version of a page or blog. |
|  | 2\. Developer right-clicks on the page and selects Inspect. |
|  | 3\. System checks the state of the Noindex and Nofollow switches. |
|  | \- If switches are off: |
|  | \- Developer can see "nofollow" and "noindex" meta tags in the page code. |
|  | \- If switches are on: |
|  | \- Developer should not see "nofollow" and "noindex" meta tags in the page code. |
|  | Condition 2: View Page/Blog in Search Engine Results |
|  | 1\. Consumer opens their browser and accesses a search engine (e.g., Google). |
|  | 2\. Consumer types a keyword related to the page/blog and clicks Search. |
|  | 3\. System checks the state of the Noindex and Nofollow switches. |
|  | \- If switches are off: |
|  | \- System does not display the page/blog and the pages related to the links in the search results. |
|  | \- Consumer should not be able to view the page/blog and the pages related to the links in search results. |
|  | \- If switches are on: |
|  | \- System displays the page/blog and the pages related to the links in the search results. |
|  | \- Consumer should be able to view the page/blog and the pages related to the links in search results. |
| Postconditions | \- Page/blog visibility in search results aligns with the Noindex and Nofollow settings. |
|  | \- Developer can confirm visibility settings by inspecting the code. |
| Business Trigger | Merchant wants to control search engine visibility of specific pages or blog posts for SEO purposes. |
| Acceptance Criteria | \- System accurately applies the Noindex and Nofollow settings to the page/blog code. |
|  | \- System correctly excludes or includes the page/blog in search engine results based on the settings. |
| Estimates | To be determined by the development team. |
| Error Messages |  |
|  |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br />Page Builder<br />Pages<br />Blogs<br />Products<br />SEO<br /> |

### UC 09 | Automatically Enable Noindex & Nofollow on Subdomain Pages when Custom Domain is Used

| Column | Description |
| ---| --- |
| Use Case ID | UC9 |
| Prepared By | Frances Ramos |
| Last Updated | January 5, 2025 |
| Objectives | Ensure that subdomain pages are not indexed or searchable on search engines when a custom domain is used by the merchant. |
| Actor | Merchant |
| Preconditions | \- Merchant is in Store Settings > Domain section. |
|  | \- Merchant is subscribed to a paid plan |
| Conditions | Condition 1: Merchant decides to use a custom domain |
|  | Condition 2: Merchant has been downgraded from paid to free |
| Steps | Condition 1: Merchant decides to use a custom domain |
|  | 1\. Merchant logs in. |
|  | 2\. Merchant is redirected to the Dashboard. |
|  | 3\. Merchant navigates to Settings > Store. |
|  | 4\. Merchant scrolls to the Domain section. |
|  | 5\. Merchant decides to use their own custom domain for their online store. |
|  | 6\. Merchant selects the Connect Your Domain radio button. |
|  | 7\. Merchant inputs their custom domain in the provided textbox. |
|  | 8\. Merchant clicks Save. |
|  | 9\. System detects that the merchant is now using a custom domain. |
|  | 10\. System identifies the merchant's custom subdomain or system-generated subdomain (if it's the first-time setup). |
|  | 11\. System retrieves all pages under the subdomain. |
|  | 12\. System automatically adds "noindex" and "nofollow" meta tags to the code of each subdomain page. |
|  | 13\. System should not allow search engines to crawl/index the subdomain pages and should not follow the links inside the pages |
|  | 14\. Consumer should not be able to view subdomain pages in search engine results |
|  | Condition 2: Merchant has been downgraded from paid to free |
|  | System detects that merchant's account has been downgraded from paid to free |
|  | System detects that merchant is using a custom domain |
|  | System reverts domain from custom domain to subdomain |
|  | Merchant is now using a subdomain |
|  | System removes "noindex" and "nofollow" meta tags from the code of each subdomain page. |
|  | System will now allow subdomain pages to be crawled/indexed by search engines and the links inside the pages to be followed by search engines |
|  | Consumer should be able to view subdomain pages in search engine results |
| Postconditions | \- Subdomain pages are excluded from search engine indexing and searchability. |
| Business Trigger | Merchant connects a custom domain for their store and wants to prevent duplicate content issues with subdomain pages. |
| Acceptance Criteria | \- System correctly identifies all subdomain pages. |
|  | \- System applies "noindex" and "nofollow" meta tags to each subdomain page. |
|  | \- Subdomain pages are no longer indexed or visible in search engine results. |
| Estimates | To be determined by the development team. |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />The system should not allow search engines to crawl/index subdomain pages when the merchant is using a custom domain for their online store.<br />Identify impacted modules (amend if there is something missing)<br />Store Settings > Domain<br />Page Builder<br />Pages<br />SEO<br /> |

### UC 10 | Display/Hide Subdomain Pages from Search Engine Results

| Column | Description |
| ---| --- |
| Use Case ID | UC10 |
| Prepared By | Frances Ramos |
| Last Updated | January 5, 2025 |
| Objectives | Ensure subdomain pages are hidden from search engine results when a custom domain is in use by the merchant. |
| Actor | Consumer |
| Preconditions | \- Consumer tries to view a page from the subdomain. |
|  | \- Merchant has connected a custom domain for their online store. |
| Steps | 1\. Consumer visits a search engine site (e.g., Google). |
|  | 2\. Consumer enters keywords related to the merchant's online store pages and clicks search. |
|  | 3\. System detects that the merchant is using a custom domain for their store. |
|  | 4\. System identifies all pages under the subdomain associated with the merchant. |
|  | 5\. System ensures subdomain pages have "noindex" and "nofollow" meta tags applied in the code. |
|  | 6\. System hides the subdomain pages from the search engine results. |
|  | 7\. Consumer should not be able to see any subdomain pages in the search engine results. |
| Postconditions | \- Subdomain pages are excluded from search engine indexing and are hidden from search results. |
| Business Trigger | Merchant connects a custom domain for their store and wants to avoid duplicate content between subdomain and domain. |
| Acceptance Criteria | \- System correctly identifies that the merchant is using a custom domain. |
|  | \- System applies "noindex" and "nofollow" meta tags to subdomain pages. |
|  | \- Subdomain pages are successfully hidden from search engine results. |
| Estimates | To be determined by the development team. |

| **Business Rules/Desired Behavior** |
| --- |
| **Sample Scenario**<br />
- You run an online learning platform where instructors create their course websites. Each instructor gets:<br />
- A **free subdomain** (e.g., `awesomecourses.`[`prosperna.com`](http://prosperna.com)).
The option to connect to a **custom domain** (e.g., `awesome`[`courses.com`](http://courses.com)).
- To avoid duplicate content issues and search engine penalties, you implement `noindex` and `nofollow` for the free subdomain pages when instructors use custom domains.<br /><br />  

**Before Adding** **`noindex`** **and** **`nofollow`**<br />
- **Instructor "Jane Doe"** launches her courses on the subdomain [`janedoe.yourplatform.com`](http://janedoe.yourplatform.com). Later, she connects her custom domain [`janedoecourses.com`](http://janedoecourses.com).<br />
- **Search Engine Behavior**:<br />Crawlers index pages on **both domains**:<br />[`janedoe.yourplatform.com/course1`](http://janedoe.yourplatform.com/course1)<br />[`janedoecourses.com/course1`](http://janedoecourses.com/course1)<br />Duplicate content appears in Google search results.<br />SEO ranking signals, like backlinks, are split between the subdomain and the custom domain.<br />Search engines might prioritize the subdomain (due to its earlier indexing), which weakens the branding and visibility of the custom domain.<br />  

**Impact on Search Results**<br />Users searching for "Jane Doe Online Courses" see results from both domains. This creates confusion and reduces the likelihood of her custom domain ranking higher in search results.<br />  

**After Adding** **`noindex`** **and** **`nofollow`**<br />The system detects that Jane Doe has connected her custom domain [`janedoecourses.com`](http://janedoecourses.com).<br />All pages on the subdomain [`janedoe.yourplatform.com`](http://janedoe.yourplatform.com) are updated with:<br />    `<meta name="robots" content="noindex, nofollow">`<br />
- **Search Engine Behavior**:<br />Crawlers encounter the `noindex` directive and stop indexing pages on the subdomain.<br />The `nofollow` directive ensures that crawlers do not follow internal links on the subdomain.<br />Only [`janedoecourses.com`](http://janedoecourses.com) pages remain in the search index.<br />  

**Impact on Search Results**<br /> - Search results now only show pages from [`janedoecourses.com`](http://janedoecourses.com).<br />All backlinks and SEO efforts contribute exclusively to the custom domain, improving its visibility and ranking.<br />![](https://t7537039.p.clickup-attachments.com/t7537039/bf2d86a1-a692-4a1d-986a-6ba818089922/image.png)<br />

| Identify impacted modules (amend if there is something missing) | 
| --- | 
| Store Settings > Domain<br />Page Builder<br />Pages<br />SEO<br /> |


### Advanced Robots
### UC 011 | Set Up Advanced Robots SEO Settings

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-011 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Allow merchants to configure advanced robot directives by setting meta tag values for snippet length, video preview, and image preview visibility. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is logged in<br />\- Merchant is in Page Builder, Blogs, or Products module<br />\- Merchant is in **SEO Settings > Advanced Robots** tab |
| **Conditions** | \- Condition 1: Merchant is editing a Page<br />\- Condition 2: Merchant is editing a Blog<br />\- Condition 3: Merchant is editing a Product |
| **Steps** | **Condition 1:**<br />1\. Merchant is in **Page Builder**<br />2\. Merchant adds or edits a page<br />3\. Merchant navigates to **SEO Settings > Advanced Robots tab**<br /><br />**Merchant configures any of the following fields:**<br /><br />**A. Max Snippet Length**<br /> - Merchant enters a numeric value (e.g., `160`) into the textbox<br /> - Merchant clicks CTA (Save, Update, Create, etc.)<br /> - System inserts the following in the `<head>`:<br />  • `<meta name="robots" content="max-snippet:160">`<br /><br />**B. Max Video Preview**<br /> - Merchant enters a numeric value in seconds (e.g., `30`)<br /> - Merchant clicks CTA<br /> - System inserts:<br />  • `<meta name="robots" content="max-video-preview:30">`<br /><br />**C. Max Image Preview**<br /> - Merchant selects a value from dropdown (e.g., `none`, `standard`, `large`)<br /> - Merchant clicks CTA<br /> - System inserts:<br />  • `<meta name="robots" content="max-image-preview:standard">`<br /><br />**Note:**<br />• If multiple values are set, system combines them into one meta tag:<br /> `<meta name="robots" content="max-snippet:160, max-video-preview:30, max-image-preview:standard">`<br />• System validates input is within acceptable ranges/formats before saving<br /><br />**Condition 2 and 3:**<br />Same flow applies for **Blogs** and **Products** modules |
| **Postconditions** | \- The selected advanced robots meta tags are saved and injected into the HTML `<head>`<br />\- Merchant's advanced robot preferences are respected by search engine crawlers |
| **Business Trigger** | Merchant wants fine-grained control over how content is previewed in search engine results |
| **Acceptance Criteria** | \- System allows valid inputs for each advanced setting<br />\- System combines and renders correct meta tags<br />\- Changes persist after saving |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If invalid value (e.g., letters in number field): `"Please enter a valid number"`<br />\- If value exceeds allowable limit: `"Value exceeds maximum allowed"`<br />\- If dropdown is left empty: `"Please select a preview size"` |

###  Advanced SEO
### UC 012 | Set Up Advanced SEO Settings

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-012 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Allow merchants to configure a redirect URL for a page, blog, or product to help manage SEO and content routing. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is logged in<br />\- Merchant is in Page Builder, Blogs, or Products module<br />\- Merchant is in **SEO Settings > Advanced** tab |
| **Conditions** | \- Condition 1: Merchant is editing a Page<br />\- Condition 2: Merchant is editing a Blog<br />\- Condition 3: Merchant is editing a Product |
| **Steps** | **Condition 1:**<br />1\. Merchant is in **Page Builder**<br />2\. Merchant adds or edits a page<br />3\. Merchant navigates to **SEO Settings > Advanced tab**<br />4\. Merchant enters a valid redirect URL into the textbox<br />  • System automatically displays `https://` (see [wireframe](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=14644-22543&t=Ig3HDQtOTRnTzVQs-4))<br />  • System validates that it is a properly formatted URL or path<br />5\. Merchant clicks CTA (Save, Update, Create, etc.)<br />6\. System saves the redirect URL<br />7\. On the storefront:<br />  • When the original page URL is accessed, system issues a **301 redirect** to the new URL<br /><br />**Condition 2 and 3:**<br />Same flow applies for **Blogs** and **Products** modules |
| **Postconditions** | \- The page, blog, or product will automatically redirect to the defined URL when accessed<br />\- The redirect is handled via a 301 HTTP status |
| **Business Trigger** | Merchant wants to redirect a page, blog, or product to a new location (e.g., after rebranding, restructuring, or content removal) |
| **Acceptance Criteria** | \- System accepts and stores valid redirect URLs<br />\- System issues correct 301 redirect for the original URL<br />\- System rejects invalid URLs and shows appropriate message |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If URL is blank: `"Redirect URL cannot be empty"`<br />\- If invalid format: `"Please enter a valid URL (e.g., /new-page or` [`https://example.com`](https://example.com/)`)"`<br />\- If the URL redirects to itself: `"Redirect URL cannot be the same as the current page URL"` |

### Schema
### UC 13 | Set Up Schema SEO Settings

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-13 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | July 15, 2025 |
| **Objectives** | Automatically generate structured data for Organization and Breadcrumb schema markups, and allow merchant to configure Article Schema for each blog post to improve SEO visibility. |
| **Actor** | System (Organization & Breadcrumb Schema)<br />Merchant (Article Schema in Blogs SEO Settings) |
| **Preconditions** | \- Merchant has an active store<br />\- Merchant is creating or editing a blog post<br />\- Merchant is on a plan with Schema SEO access<br />\- Store details (name, logo, contact info) are filled in |
| **Conditions** | \- Condition 1: Merchant edits blog SEO settings (Article Schema)<br />Condition 2: System auto-generates Organization Schema<br />Condition 3: System auto-generates Breadcrumb Schema |
| **Steps** | **Condition 1: Article Schema (editable by merchant)**<br />1\. Merchant logs in<br />2\. Merchant navigates to **Blogs > Edit Blog Post**<br />3\. Merchant goes to **SEO Settings > Schema Tab**<br />4\. System displays the following Article Schema fields:<br /> - **Author** (editable text input)<br /> - **Tag** (multi-keyword input; converted into tags)<br /> - **Publisher** (editable text input; defaulted to store name)<br /> - **Section** (editable text input)<br /> - **Published Time** (auto-filled from blog post creation date; not editable)<br /> - **Modified Time** (auto-filled from blog post last updated date; not editable)<br />5\. Merchant optionally updates editable fields<br />6\. Merchant clicks **Save** or **Update**<br />7\. System generates and injects the JSON-LD for `@type: Article` into the `<head>` of the blog post |
|  | **Condition 2: Organization Schema (automatically generated)**<br />1\. System pulls data from store settings:<br /> - Store name, logo URL, contact email, website URL, social links<br />2\. System generates JSON-LD for `@type: Organization` using these values<br />3\. System injects the schema into the `<head>` of all public-facing pages |
|  | **Condition 3: Breadcrumb Schema (automatically generated)**<br />1\. System determines the breadcrumb structure based on page hierarchy<br /> - Ex: Home > Blog > Blog Title<br /> - Ex: Home > Category > Product<br />2\. System generates JSON-LD for `@type: BreadcrumbList` using navigation structure<br />3\. System injects it into the `<head>` of every page |
| **Postconditions** | \- Article Schema is injected into each blog post using merchant-defined and system-generated values<br />\- Organization and Breadcrumb schemas are consistently injected into site pages |
| **Business Trigger** | \- Merchant creates or edits a blog post<br />\- Any public page is rendered |
| **Acceptance Criteria** | \- Article Schema includes correct editable and non-editable values<br />\- Organization Schema is injected site-wide<br />\- Breadcrumb Schema reflects correct navigation<br />\- All JSON-LD passes validation with Google Rich Results Test |
| **Estimates** | \[To be determined by development team\] |
| **Error Messages** | \- Article Schema: “Missing required author or section”<br />\- Tag Input: “Tag must be alphanumeric and under 50 characters” |

### Meta Theme Color
### UC 14 | Setup Meta Theme Color for Browser Toolbar in Mobile

| **Field** | **Description** |
| ---| --- |
| **Use Case ID** | UC-14 |
| **Title** | Set Browser Toolbar Color via Color Picker in Design Settings |
| **Objective** | Allow the merchant to customize the browser toolbar color through the Design Settings > Colors & Style Tab > Color Settings Accordion > Customize Colors Section |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is logged in<br />\- Merchant is on **Design Settings > Colors & Style tab** |
| **System Default** | \- If no color is selected, the browser uses the system or OS default theme color |
| **Postconditions** | \- Selected color is stored in settings<br />\- System injects `<meta name="theme-color">` into the `<head>` of all applicable pages |
| **Main Flow / Steps** | 1\. Merchant navigates to **Design Settings > Colors & Style Tab > Color Settings Accordion > Customize Colors Section**<br />2\. System displays the "Browser Toolbar Color" field with a color preview box<br />3\. Merchant clicks on the color box<br />4\. System opens a **color picker modal** with palette and HEX input options<br />5\. Merchant selects a color or inputs a HEX code (e.g., `#FF5733`)<br />6\. Merchant clicks **Save**<br />7\. System validates the color<br /> • If invalid: system shows error toast<br /> • If valid: proceed<br />8\. System saves the selected color in merchant's design configuration<br />9\. System injects the following into the `<head>` of applicable pages:<br />`html<br /><meta name="theme-color" content="#FF5733"><br />`<br />10\. If merchant resets or clears the value, system removes the custom tag and reverts to default theme color behavior |
| **Alternate Flow** | \- If merchant inputs an invalid HEX code, system blocks the save and shows a validation error message |
| **Exception Flow** | \- If network or system error occurs on save, system shows error toast and does not save |
| **Acceptance Criteria** | \- Color picker allows both palette selection and manual HEX entry<br />\- Toolbar color is applied across all pages with `<meta name="theme-color">`<br />\- Color persists until changed or reset by merchant |

## Auto-generated SEO
### UC 15 | Automatically Generate Default SEO Tags

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-15 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Automatically generate and inject key SEO meta tags to the `<head>` when a merchant creates or updates a page, blog, or product. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is subscribed to paid plan<br />\- Merchant is logged in<br />\- Merchant is in Page Builder, Blogs, or Products module<br />\- Merchant is adding or editing a page, blog, or product |
| **Conditions** | \- Condition 1: Merchant creates a new page, blog, or product<br />\- Condition 2: Merchant updates a page, blog, or product |
| **Steps** | **Condition 1: Create New Page/Blog/Product**<br />1\. Merchant logs in<br />2\. Merchant goes to Page Builder / Blogs / Products<br />3\. Merchant clicks `Create`<br />4\. Merchant fills in required fields (title, content, author, etc.)<br />5\. Merchant clicks `Create Page`, `Publish Blog`, or `Add Product`<br />6\. System automatically generates the following tags based on current data:<br />   • `<meta name="article:published_time" content="[current datetime]">`<br />   • `<meta name="article:modified_time" content="[current datetime]">`<br />   • `<meta name="article:author" content="[merchant's name]">`<br />   • `<meta name="publisher" content="[store or business name]">`<br />   • `<meta name="author" content="[merchant's name]">`<br />   • `<meta name="viewport" content="width=device-width, initial-scale=1.0">`<br />   • `<meta charset="UTF-8">`<br />   • `<meta property="og:updated_time" content=[dateandtime] />`<br />   • `<link rel="canonical" href="[custom domain or store.prosperna.com]/`[`preferred-url`](https://example.com/preferred-url)`" />`<br />7\. System injects the generated tags into the `<head>` of the page |
|  | **Condition 2: Update Existing Page/Blog/Product**<br />1\. Merchant selects a page/blog/product to edit<br />2\. Merchant modifies content<br />3\. Merchant clicks `Update` or `Save`<br />4\. System updates only the `article:modified_time` meta tag<br />   • `<meta name="article:modified_time" content="[updated datetime]">`<br />5\. System re-injects updated tags into the `<head>` |
| **Postconditions** | \- The specified SEO meta tags are correctly injected into the `<head>` element of the published HTML<br />\- `published_time` remains static once created; `modified_time` is updated on each save/update |
| **Business Trigger** | Merchant creates or updates a page, blog, or product |
| **Acceptance Criteria** | \- SEO meta tags are automatically generated upon creation<br />\- `modified_time` updates correctly with each edit<br />\- Tags are injected into `<head>` without duplicates<br />\- Tags follow correct HTML syntax |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If tag injection fails: `"SEO metadata could not be applied. Please try again."`<br />\- If merchant name is missing: `"Author information is required to generate SEO metadata."` |

## Default Fallback Values for SEO Settings
### UC 16 | Automatically Set Default Content for Basic SEO

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-16 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Automatically apply default SEO metadata when a merchant does not manually enter meta title, description, or image for pages, blogs, or products. |
| **Actor** | System |
| **Preconditions** | \- Merchant is subscribed to a paid plan<br />\- Merchant is in Page Builder, Blogs, or Products module<br />\- Merchant does **not** fill in SEO Basic tab fields (title, description, image) |
| **Conditions** | \- Condition 1: Merchant creates a page, blog, or product and leaves SEO fields blank<br />\- Condition 2: Merchant edits a page, blog, or product and clears SEO fields |
| **Steps** | **Condition 1: Creation Without SEO Input**<br />1\. Merchant logs in<br />2\. Merchant goes to Page Builder / Blogs / Products<br />3\. Merchant clicks `Create`<br />4\. Merchant enters page/blog/product content but **leaves SEO Basic tab fields blank**<br />5\. Merchant clicks `Create Page`, `Publish Blog`, or `Add Product`<br />6\. System detects empty SEO fields and automatically generates the following:<br />   • **Meta Title**: Uses page/blog/product title<br />   • **Meta Description**: Extracts first 160 characters from short description of product, body of blog or page<br />   • **Meta Keywords**: Empty by default (can be configured to extract from content)<br />   • **Meta Image**: Uses store logo configured in settings or Prosperna logo<br />7\. System injects the generated values into the `<head>`:<br />   • `<title>`<br />   • `<meta name="description">`<br />   • `<meta name="keywords">` (if applicable)<br />   • `<meta property="og:image">`<br />   • `<meta name="twitter:image">` |
|  | **Condition 2: Merchant Clears Existing SEO Fields**<br />1\. Merchant goes to edit an existing page/blog/product<br />2\. Merchant deletes meta title, description, or image from SEO Basic tab<br />3\. Merchant clicks `Save`, `Update`, etc.<br />4\. System detects cleared fields and re-applies fallback values using the same logic as in Condition 1 |
| **Postconditions** | \- Basic SEO metadata is never empty<br />\- Fallbacks ensure minimum SEO standards for all pages |
| **Business Trigger** | Merchant creates or edits a page, blog, or product without configuring SEO settings |
| **Acceptance Criteria** | \- Meta title defaults to page/blog/product title<br />\- Meta description extracts first 160 characters of content<br />\- Meta image falls back to a store-wide default image<br />\- Fallback values are correctly injected into `<head>` |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If no fallback image is available: `"No default image available for SEO. Please upload a store-wide default image."` |

### UC 17 | Automatically Set Default Content for Robots

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-017 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Ensure that robots meta tags (`noindex`, `nofollow`, `noarchive`, `nosnippet`, `noimageindex`) are always present with default values when the merchant does not configure them manually. |
| **Actor** | System |
| **Preconditions** | \- Merchant is subscribed to paid plan<br />\- Merchant is in Page Builder, Blogs, or Products<br />\- Merchant has not configured any Robots settings (all toggles off or untouched) |
| **Conditions** | \- Condition 1: Merchant creates new content without touching Robots tab<br />\- Condition 2: Merchant edits existing content and clears all Robots settings |
| **Steps** | **Condition 1: New Content with No Robots Configuration**<br />1\. Merchant logs in<br />2\. Merchant navigates to Page Builder / Blogs / Products<br />3\. Merchant adds a new page, blog, or product<br />4\. Merchant opens SEO Settings but does not configure the Robots tab<br />5\. Merchant clicks `Create` / `Save`<br />6\. System detects unset Robot settings and automatically applies safe defaults:<br />   • noindex: off<br />   • nofollow: off<br />   • noarchive: off<br />   • nosnippet: off<br />   • noimageindex: off<br />7\. System adds the following tags to the `<head>`:<br />`html<br /><meta name="robots" content="index, follow"><br /><meta name="googlebot" content="index, follow"><br /><meta name="bingbot" content="index, follow"><br />`<br /><br />**Condition 2: Editing Existing Content & Resetting Robots**<br />1\. Merchant edits an existing page/blog/product<br />2\. Merchant turns off all toggle switches in the Robots tab<br />3\. Merchant clicks `Update` / `Save`<br />4\. System re-applies default Robots configuration<br />5\. System updates the `<head>` tags to:<br />`html<br /><meta name="robots" content="index, follow"><br /><meta name="googlebot" content="index, follow"><br /><meta name="bingbot" content="index, follow"><br />` |
| **Postconditions** | \- Content always includes robots meta tags<br />\- SEO metadata is consistent and not omitted due to user inaction |
| **Business Trigger** | Merchant saves content without modifying Robots tab |
| **Acceptance Criteria** | \- System automatically adds default meta tags if Robots tab is untouched<br />\- Meta tag reflects `index, follow` configuration for all bots<br />\- No errors or user prompts are shown |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | _None — this logic is silent and automatic_ |

### UC 18 | Automatically Set Default Content for Advanced Robots

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-018 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Ensure that Advanced Robots meta tags are present using safe and SEO-friendly defaults if merchant leaves them unconfigured. |
| **Actor** | System |
| **Preconditions** | \- Merchant is subscribed to paid plan<br />\- Merchant is in Page Builder, Blogs, or Products module<br />\- Merchant accesses the SEO settings<br />\- Merchant does **not** fill in or configure values under the Advanced Robots tab |
| **Conditions** | \- Condition 1: Merchant creates a new page/blog/product and leaves Advanced SEO fields blank<br />\- Condition 2: Merchant edits an existing page/blog/product and clears Advanced SEO fields |
| **Steps** | **Condition 1: Creation Without Advanced SEO Configuration**<br />1\. Merchant logs in<br />2\. Merchant goes to Page Builder / Blogs / Products<br />3\. Merchant creates a new page, blog, or product<br />4\. Merchant navigates to the SEO Settings → Advanced Robots tab<br />5\. Merchant leaves the following fields empty:<br />   • Max Snippet Length<br />   • Max Video Preview<br />   • Max Image Preview<br />6\. Merchant clicks `Create` / `Publish` / `Save`<br />7\. System detects unconfigured Advanced SEO fields<br />8\. System automatically applies the following fallback values:<br />   • Max Snippet Length: `-1` (no limit)<br />   • Max Video Preview: `-1` (no limit)<br />   • Max Image Preview: `large`<br />9\. System inserts the following meta tags in the `<head>` of the page:<br />   • `<meta name="robots" content="max-snippet:-1">`<br />   • `<meta name="robots" content="max-video-preview:-1">`<br />   • `<meta name="robots" content="max-image-preview:large">` |
|  | **Condition 2: Edit and Clear Advanced SEO Fields**<br />1\. Merchant edits a page/blog/product<br />2\. Merchant deletes or clears values in Advanced Robots tab<br />3\. Merchant clicks `Update` / `Save`<br />4\. System detects cleared fields and re-applies the default fallbacks using the same logic as in Condition 1 |
| **Postconditions** | \- Pages, blogs, and products always include valid Advanced Robots tags<br />\- Default behavior favors maximum visibility to search engines |
| **Business Trigger** | Merchant publishes or saves an item without configuring advanced SEO fields |
| **Acceptance Criteria** | \- Max Snippet Length defaults to `-1`<br />\- Max Video Preview defaults to `-1`<br />\- Max Image Preview defaults to `large`<br />\- Corresponding `<meta>` tags are injected into `<head>` |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | _None — fallback is handled silently by system_ |

### UC 19 | Automatically Set Default Content for **Advanced**

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-19 |
| **Prepared By** |  Frances Ramos |
| **Last Updated** | July 14, 2025 |
| **Objectives** | Automatically ensure that all pages, blogs, and products have a valid Advanced setting even if the merchant does not configure one. Prevent broken redirect metadata. |
| **Actor** | System |
| **Preconditions** | \- Merchant is subscribed to paid plan<br />\- Merchant is in Page Builder, Blogs, or Products<br />\- Merchant has not set a redirect URL in the SEO Settings |
| **Conditions** | \- Condition 1: Merchant creates new content and does not open or configure the Advanced tab<br />\- Condition 2: Merchant edits content and clears the redirect value (sets blank) |
| **Steps** | **Condition 1: New Content Without Redirect Configuration**<br />1\. Merchant logs in<br />2\. Merchant goes to Page Builder, Blogs, or Products<br />3\. Merchant creates a new page, blog, or product<br />4\. Merchant does not visit or fill out the Advanced tab<br />5\. Merchant clicks `Create` / `Save`<br />6\. System detects no redirect value and sets default fallback:<br />   • `redirect URL = current page URL`<br />7\. No `<link rel="canonical">` or `<meta http-equiv="refresh">` is injected since no actual redirect is required<br /><br />**Condition 2: Existing Content with Cleared Redirect**<br />1\. Merchant edits an existing page/blog/product<br />2\. Merchant clears any previously set redirect URL in the Redirect tab<br />3\. Merchant clicks `Save` / `Update`<br />4\. System applies default behavior:<br />   • `redirect URL = current page URL` (no actual redirection)<br />5\. System removes previously injected `<meta http-equiv="refresh">` or `301/302` metadata if any<br /> |
| **Postconditions** | \- All pages, blogs, and products have a fallback redirect setting<br />\- No redirect metadata is added unless merchant explicitly sets a different URL |
| **Business Trigger** | Merchant creates or edits a page/blog/product and leaves redirect unset or clears existing redirect |
| **Acceptance Criteria** | \- No broken redirect logic occurs if merchant does not interact with Redirect tab<br />\- System never injects incorrect or blank redirect meta tags<br />\- Default fallback uses the page's own URL (no-op redirect) |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | _None – system silently handles defaulting behavior_ |

### UC 20 | Automatically Set Default Content for Schema

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-020 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | July 15, 2025 |
| **Objectives** | Automatically configure default Schema SEO markup for all pages and allow merchant to customize Article Schema per blog post. |
| **Actor** | System, Merchant |
| **Preconditions** | \- Merchant is subscribed to paid plan<br />\- Merchant has an active store<br />\- Merchant is on a plan with Schema access<br />\- Store details (name, logo, contact info) are completed |
| **Conditions** | \- Condition 1: System auto-generates Organization and Breadcrumb schema<br />Condition 2: Merchant edits Article schema in Blogs SEO settings |
| **Steps** | **Condition 1: System generates default schemas automatically**<br />1\. System checks store settings:<br /> - Store name, logo URL, contact info, social links<br />2\. System generates JSON-LD with the following schema types:<br /> - `@type: Organization`<br /> - `@type: BreadcrumbList`<br />3\. System injects Organization and Breadcrumb schemas into the `<head>` of all public-facing pages:<br /> - Home, Product, Blog, Collection, etc.<br /><br />**Organization Schema includes:**<br /> - Name<br /> - Logo<br /> - URL<br /> - Contact information<br /> - Social links (if available)<br /><br />**Breadcrumb Schema includes:**<br /> - Ordered list of page hierarchy (Home > Section > Page)<br /><br />**Condition 2: Merchant edits Article Schema per blog post**<br />1\. Merchant goes to **Blogs > Edit Blog Post > SEO Settings > Schema Tab**<br />2\. System auto-populates:<br /> - **Published Time** (from blog publish date)<br /> - **Modified Time** (from last edit date)<br />3\. Merchant inputs or updates:<br /> - **Author**<br /> - **Publisher** (defaults to store name)<br /> - **Section** (optional)<br /> - **Tags** (optional keywords converted to tags)<br />4\. Merchant saves blog<br />5\. System generates Article schema JSON-LD using merchant and system values<br />6\. System injects schema into `<head>` of that blog post page |
| **Postconditions** | \- Organization and Breadcrumb schemas are injected site-wide<br />\- Article schema is injected per blog post with required values |
| **Business Trigger** | \- Merchant saves blog post<br />\- Public page is loaded/rendered |
| **Acceptance Criteria** | \- Organization and Breadcrumb schemas are always present on site<br />\- Article schema includes merchant input and required metadata<br />\- All schema passes Google Rich Results test |
| **Estimates** | \[To be determined by development team\] |
| **Error Messages** | \- Article Schema: "Author is required"<br />\- Tag Input: "Tag must be under 50 characters" |

## Reset to Default Values
### UC 21 | Reset SEO Settings to Default

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-021 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | July 15, 2025 |
| **Objectives** | Allow merchants to revert any manually modified SEO settings back to the default fallback configuration through a reset button per SEO tab. |
| **Actor** | Merchant |
| **Preconditions** | \- Merchant is editing a page, blog, or product<br />\- Merchant is in the SEO Settings section<br />\- Merchant has manually edited fields in any SEO tab (Basic, Robots, Advanced Robots, Advanced, Schema) |
| **Conditions** | \- Condition 1: Merchant is in Basic tab<br />\- Condition 2: Merchant is in Robots tab<br />\- Condition 3: Merchant is in Advanced Robots tab<br />\- Condition 4: Merchant is in Redirect tab<br />\- Condition 5: Merchant is in Schema tab |
| **Steps** | **Condition 1: Basic Tab**<br />1\. Merchant navigates to the Basic tab in SEO settings<br />2\. Merchant clicks the `Reset to Default` button<br />3\. System displays confirmation modal: “Are you sure you want to reset Basic SEO settings to default?”<br />4\. Merchant confirms<br />5\. System clears manual input<br />6\. System populates fields using default fallback values:<br />   - Meta title = page/blog/product name<br />   - Meta description = extracts first 160 characters from short description of product, body of blog or page<br />   - Keywords = empty<br />   - Meta image = store logo or Prosperna logo<br /><br />**Condition 2: Robots Tab**<br />1\. Merchant navigates to Robots tab<br />2\. Merchant clicks `Reset to Default`<br />3\. System confirms action<br />4\. System sets default values:<br />   - Noindex = Off<br />   - Nofollow = Off<br />   - Noarchive = Off<br />   - No image index = Off<br />   - No snippet = Off<br /><br />**Condition 3: Advanced Robots Tab**<br />1\. Merchant navigates to Advanced Robots tab<br />2\. Merchant clicks `Reset to Default`<br />3\. System confirms action<br />4\. System sets fields to default:<br />   - Max Snippet Length = 160<br />   - Max Video Preview = 0<br />   - Max Image Preview = standard<br /><br />**Condition 4: Advanced Tab**<br />1\. Merchant navigates to Advanced tab<br />2\. Merchant clicks `Reset to Default`<br />3\. System clears redirect target<br />4\. Leaves redirect disabled or blank<br /><br />**Condition 5: Schema Tab**<br />1\. Merchant navigates to Schema tab<br />2\. Merchant clicks `Reset to Default`<br />3\. System confirms action<br />4\. System resets schema type selection and values:<br />   - Article = headline = title, author = merchant name, date = current<br />   - Organization = store name, logo<br />   - Breadcrumb = home > current item |
| **Postconditions** | \- Current SEO tab fields are reverted to default fallback state<br />\- Manually entered values are discarded<br />\- System displays a toast: “Settings reset to default” |
| **Business Trigger** | Merchant clicks `Reset to Default` in any SEO tab |
| **Acceptance Criteria** | \- Reset button is visible in each SEO tab<br />\- Confirmation is shown before reset<br />\- Fields are cleared and replaced with fallback values after reset<br />\- Success toast is displayed |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- None (confirmation modal handles user intent) |

## Last Modified Date
### UC 22 | Automatically Set Last Modified Date

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-022 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | 2025-07-15 |
| **Objectives** | Automatically track and reflect the last modified timestamp in all supported SEO mechanisms: XML sitemap `<lastmod>`, Open Graph `og:updated_time`, and `Last-Modified` HTTP header. |
| **Actor** | System |
| **Preconditions** | \- Sitemap.xml generation is enabled<br />\- Page, blog, or product content is tracked with created and updated timestamps<br />\- SEO meta tags and headers are supported by the server |
| **Conditions** | \- Condition 1: Content has never been updated<br />\- Condition 2: Content has been modified after creation |
| **Steps** | **Condition 1: Never Updated**<br />1\. System fetches the `created_at` timestamp<br />2\. System injects the following:<br /> - In sitemap.xml: `<lastmod>2025-07-15</lastmod>`<br /> - In `<head>`: `<meta property="og:updated_time" content="2025-07-15T00:00:00+00:00">`<br /> - In response header: `Last-Modified: Tue, 15 Jul 2025 00:00:00 GMT`<br /><br />**Condition 2: Has Been Modified**<br />1\. System fetches `updated_at` timestamp<br />2\. System injects the following:<br /> - In sitemap.xml: `<lastmod>2025-07-20</lastmod>`<br /> - In `<head>`: `<meta property="og:updated_time" content="2025-07-20T14:00:00+00:00">`<br /> - In response header: `Last-Modified: Sun, 20 Jul 2025 14:00:00 GMT`<br />3\. All values are updated automatically whenever content is updated |
| **Postconditions** | \- All relevant SEO mechanisms reflect accurate last modified times |
| **Business Trigger** | A page, product, or blog is created or updated |
| **Acceptance Criteria** | \- `<lastmod>` in sitemap uses updated timestamp<br />\- `<meta property="og:updated_time">` is present and current<br />\- `Last-Modified` HTTP header is returned with accurate timestamp |
| **Estimates** | \[To be determined by development team\] |
| **Error Messages** | \- If timestamps are unavailable: fallback to `created_at`<br />\- If headers/meta cannot be written due to technical error: log error silently |

## **Nonfunctional Requirements**

| **Name** | **Description** | **Priority** |
| ---| ---| --- |
| Responsiveness | This will ensure that the website display can be resized to any dimension of a screen and does not compromise the interface of the website | **HIGH** |
| System Performance | System should be able to generate an output within three (3) seconds | **HIGH** |

### **Performance**
*   SEO settings must load in <500ms on modal or page open.
*   Auto-generation of fallback values must occur instantly.
### **Security**
*   Prevent unauthorized access to restricted fields through browser inspection or API manipulation.
### **Usability**
*   Tabs and fields must clearly indicate which settings are editable vs. read-only.
*   Add tooltip or crown indicators on premium locked settings.
### **Reliability**
*   SEO data must persist accurately per page/module when plans change.
*   Store both system-generated and user-defined SEO content reliably.
### **Scalability**
*   The system should support hundreds of pages/modules per merchant.
### **Maintenance and Supportability**
*   Feature toggles for plan control must be centralized and reusable across modules.
*   Logs must show plan-based access to support troubleshooting.
### **Compatibility**
*   Must support mobile and desktop UIs.
*   Works across all Prosperna themes.
### **Regulatory and Compliance**
*   SEO fields must follow open web standards (e.g., HTML meta tags, JSON-LD schema format).
## Constraints
*   SEO fields are disabled (not hidden) for free plans so users see what they’re missing.
*   Schema templates must be limited initially to a default set (e.g., Article, Product, WebPage).
## Assumptions
*   All merchant plans can be checked dynamically via backend feature toggling logic.
*   Plan change events are real-time and UI can react accordingly without full page reload.
## Acceptance Criteria

| ID | Scenario | Acceptance Criteria |
| ---| ---| --- |
| AC-001 | Free Plan user opens SEO Settings | SEO tabs and fields are shown in read-only state; no editing allowed |
| AC-002 | Basic Plan user accesses SEO Settings | Basic SEO tab is editable; Advanced tab is visible but disabled with upgrade prompt |
| AC-003 | Premium Plan user accesses SEO Settings | Both Basic and Advanced tabs are visible and editable |
| AC-004 | Default Tab View | Basic SEO tab is selected by default when opening SEO Settings |
| AC-005 | Robots Settings | Premium plan user can select `index/noindex`, `follow/nofollow` per page |
| AC-006 | Advanced Robots Settings | Premium plan user can set values like `max-snippet`, `noarchive`, etc. |
| AC-007 | Advanced Settings | Premium plan user can configure 301 or 302 redirect for the page |
| AC-008 | Schema Settings | Premium plan user can assign structured data type per page |
| AC-009 | Fallback SEO | All users (regardless of plan) get auto-generated SEO defaults in the head tag if no manual settings |
| AC-010 | Plan Upgrade | After upgrade, merchant sees locked features become editable instantly without reloading page |
| AC-011 | Plan Downgrade | Advanced settings become disabled but previously entered values are preserved for future reactivation |

## **Wireframes**
[Wireframe](https://www.figma.com/design/YBhF7WvFuormZFkhpVfsuU/P1-Initial-Wireframe-Frances?node-id=14593-22332&t=Vy4ulUfVNTX1HmO8-4)
## **Figma Design File ℅ UX UI Designer**
[Figma Design File](https://www.figma.com/design/0TaSW2dreZ7r40EvGmbg5D/Advanced-SEO-Settings?node-id=0-1&p=f&t=CmEFZaYB05S4Q1Ki-0)
## **Clickup Task**
[Clickup Task](https://app.clickup.com/t/86etpa9w5)
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed | July 17, 2025 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br /> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |

