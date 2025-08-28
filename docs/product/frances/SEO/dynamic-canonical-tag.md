---
id: dynamic-canonical-tag
title: Auto-generated Canonical Tags
sidebar_label: Auto-generated Canonical Tags
sidebar_position: 3
---
# SEO | Dynamic Canonical URL Link

## **Executive Summary**
This document defines the business requirements for implementing a **Canonical URL Management feature** within the **SEO Settings** of the Page Builder. The feature enables the system to automatically generate canonical URLs for the pages to improve SEO performance.
## Background
Search engines penalize websites with duplicate or ambiguous URLs pointing to the same content. To combat this, canonical tags identify the preferred version of a page.
## Business Objective
*   Prevent duplicate content issues for SEO.
*   Support both default subdomains and custom domains.
## **Scope of Solution**
*   Built-in feature in Page Builder SEO Settings
*   Available for all paid plans (Plus, Pro, Premium)
*   Auto-generate canonical URLs based on the current page slug and domain.
    *   Identify if the domain used is a custom domain or the default subdomain [`storename.prosperna.com`](http://storename.prosperna.com)
*   Canonical tag injection in `<head>` of published page.
*   Domain switch detection unless canonical is overridden manually.
## Business Requirements

| **ID** | **Requirement** |
| ---| --- |
| BR-001 | System auto-generates canonical URLs based on page slug and domain. |
| BR-002 | Use custom domain if configured in Store Settings; else fallback to subdomain [`storename.prosperna.com`](http://storename.prosperna.com) if custom domain is not used. |
| BR-003 | Apply the canonical URL in the `<head>` tag of the rendered page. |
| BR-004 | Reflect domain changes dynamically unless the merchant has overridden the canonical URL. |

## Stakeholder Analysis

| Stakeholder | Role | Interest |
| ---| ---| --- |
| Product Team | Owner | Ensure SEO compliance and improve page-level customization. |
| Engineering | Builder | Implement backend and frontend logic for canonical management. |
| QA Team | Validator | Ensure accurate rendering and dynamic behavior of canonical tags. |
| Merchants | End User | Ability to define preferred canonical URLs to improve their search rankings. |
| Support Team | Support | Assist merchants with canonical URL behaviors and troubleshoot issues. |

## System Architecture
### Data Flow Diagram
![](https://t7537039.p.clickup-attachments.com/t7537039/ccb32e0a-7b8e-472a-b28d-b7a5ae3d5804/image.png)
*   Merchant updates domain in Store Settings.
*   System detects domain change and triggers background job.
*   Background job updates canonical URLs for all pages using system defaults.
*   Updated canonical URLs are saved back to the database.
*   Frontend renders correct canonical tag on each page using latest data.
## **Functional Requirements**

| **Use Case ID** | **Actor** | **Use Case Name** | **Short Description** | **Priority** |
| ---| ---| ---| ---| --- |
| **UC 01** |  System | Automatically Generate Canonical URL Link for Page | Auto-generate a canonical URL when editing a page, with ability for the merchant to manually edit it | **HIGH** |
| **UC 02** | System | Display primary version of page and hide duplicate page from search engine | Automatically generate a canonical URL for each page with an option to manually override it | **HIGH** |
| **UC 03** | System | Detect Domain Change and Update Canonical URL Link for Page | Detect domain change and automatically update the canonical URL for every page in the merchant's store | **HIGH** |

### **Use Case Description Tables**
#### UC 01 | Automatically Generate Canonical URL Link for Page
![](https://t7537039.p.clickup-attachments.com/t7537039/94c4a149-7fad-4d29-b598-59a8ffde1abe/image.png)

| Column | Description |
| ---| --- |
| **Use Case ID** | UC-01 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | August 26, 2025 |
| **Objectives** | Dynamically check whether the merchant is using a subdomain or a custom domain and generate the correct canonical URL link based on the domain settings. |
| **Actor** | System |
| **Preconditions** | \- Merchant is logged in.<br />\- Merchant is in **Page Builder**.<br />\- Store has either a **subdomain** or **custom domain** configured. |
| **Steps** | 1\. Merchant navigates to **Page Builder → All Pages**.<br />2\. Merchant performs one of the following:<br />  • Adds a new page → selects a theme → proceeds to page details.<br />  • Quick edits an existing page.<br />3\. System displays the **Add New Page / Quick Edit modal**.<br />4\. Merchant inputs or updates the page name.<br />5\. System checks if the merchant is using:<br />  • **Default subdomain** (e.g., [`store.prosperna.com`](http://store.prosperna.com)).<br />  • **Custom domain** (e.g., [`store.com`](http://store.com)).<br />6\. System automatically generates the **canonical URL**:<br />  • If **subdomain** → [`https://store.prosperna.com/{slug}`](https://store.prosperna.com/{slug})<br />  • If **custom domain** → [`https://store.com/{slug}`](https://store.com/{slug})<br />7\. System auto-fills the **Slug URL textbox** using the domain + slug derived from the page name.<br />8\. Merchant saves the changes.<br />9\. If the **page name is edited again**, the canonical URL updates automatically.<br />10\. System inserts the canonical URL in the `<head>` of the page using the format:<br />  `<link rel="canonical" href="{canonicalUrl}" />` |
| **Postconditions** | \- The canonical URL is dynamically generated and correctly reflects the merchant’s domain (subdomain or custom domain).<br />\- The `<head>` tag of the page contains the canonical link element. |
| **Business Trigger** | Merchant adds or updates a page in **Page Builder**. |
| **Acceptance Criteria** | \- System correctly detects whether the store uses subdomain or custom domain.<br />\- Canonical URL is generated in the correct format.<br />\- Canonical URL updates automatically when page name or slug changes.<br />\- `<link rel="canonical">` is successfully injected into the page `<head>`. |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- If no domain is detected → “Unable to generate canonical URL. Please check your store domain settings.”<br />\- If slug field is empty → “Page slug is required to generate a canonical URL.” |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br />- SEO<br />- Page Builder<br />- Store Settings |

#### UC 02 | Display primary version of page and hide duplicate page from search engine
![](https://t7537039.p.clickup-attachments.com/t7537039/a28a822b-6f22-4cc8-b21c-20f495ba786e/image.png)

| **Use Case ID** | **UC-02** |
| ---| --- |
| **Use Case Name** | Application of Canonical URL Link in SEO on Consumer Side |
| **Objective** | Ensure that search engines recognize and prioritize the canonical URL in search results, preventing duplicate content issues and improving SEO rankings. |
| **Prepared By** | Frances Ramos |
| **Last Updated** | March 20, 2025 |
| **Actor** | Consumer, Google Search Engine, System |
| **Preconditions** | \- Merchant’s page has been published and indexed by search engines.<br />\- There are duplicate or similar pages, and the canonical URL is set to indicate the preferred version. |
| **Steps** | **Consumer Searches for a Relevant Keyword:**<br />1\. Consumer goes to a search engine (e.g., Google Search).<br />2\. Consumer enters a keyword related to the merchant’s page and clicks Search.<br /><br />**Search Engine Recognizes Canonical URL:**<br />3\. Google processes the search query and identifies pages with matching content.<br />4\. Google detects the canonical tag on duplicate or similar pages and prioritizes the canonical URL.<br /><br />**Search Engine Displays the Canonical URL in Results:**<br />5\. System lists only the canonical URL version of the page in search results.<br />6\. System hides duplicate pages from search results. |
| **Postconditions** | \- The canonical page appears in search results instead of duplicate pages.<br />\- The merchant’s SEO ranking is improved by preventing duplicate content issues. |
| **Business Rules** | \- The canonical URL tag must be properly implemented `<link rel="canonical" href="preferred URL">`.<br />\- The merchant's page must be indexed for the canonical URL to be recognized.<br />\- Search engines decide whether to honor the canonical tag, depending on content similarity. |
| **Acceptance Criteria** | \- The canonical URL appears in search results, while duplicate versions are hidden.<br />\- Clicking the search result directs the consumer to the canonical URL.<br />\- The duplicate pages do not appear as separate search results. |
| **Error Messages** |  |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br />- SEO<br />- Page Builder<br />- Store Settings |

#### UC 03 | Detect Domain Change and Update Canonical URL Link for Page
![](https://t7537039.p.clickup-attachments.com/t7537039/eefdc218-4345-4b95-9663-9307a131630c/image.png)

| **Column** | **Description** |
| ---| --- |
| **Use Case ID** | UC-003 |
| **Prepared By** | Frances Ramos |
| **Last Updated** | 07/02/2025 |
| **Objectives** | Detect domain change and automatically update the canonical URL for every page in the merchant's store |
| **Actor** | System (background process), Merchant (domain update initiator) |
| **Preconditions** | \- Merchant has existing pages with system-generated canonical URLs<br />\- Merchant has not manually overridden the canonical URLs |
| **Conditions** | \- Condition 1: Canonical URL is system-generated<br />\- Condition 2: Canonical URL was manually overridden |
| **Steps** | **Condition 1: Update system-generated canonical URLs**<br />1\. Merchant navigates to **Store Settings**<br />2\. Merchant updates the domain from olddomain.com to newdomain.com<br />3\. System detects that the domain has changed<br />4\. System loops through all published pages with system-generated canonical URLs<br />5\. System updates the canonical URL format to use the new domain: [`https://newdomain.com/{page-slug}`](https://newdomain.com/%7Bpage-slug%7D)<br />6\. System displays the updated canonical URL in Quick Edit for each page<br />7\. Canonical tag in each page’s `<head>` is updated accordingly with the format: `<link rel="canonical" href={canonicalUrl} />` |
|  | **Condition 2: Preserve manually overridden canonical URLs**<br />1\. Steps 1–3 as above<br />2\. System checks each page<br />3\. If canonical URL was manually overridden, system **does not update** it<br />4\. Page continues using the manually saved canonical URL |
| **Postconditions** | \- System-generated canonical URLs reflect the updated domain<br />\- Manually overridden URLs remain unchanged |
| **Business Trigger** | Merchant updates their domain in Store Settings |
| **Acceptance Criteria** | \- Domain change is detected in real time or after Save<br />\- All system-generated canonical URLs are updated<br />\- Manual overrides are preserved<br />\- Changes are visible in Quick Edit UI and page HTML |
| **Estimates** | \[To be determined by the development team\] |
| **Error Messages** | \- None (domain update is safe and triggers background canonical regeneration) |

| **Business Rules/Desired Behavior** |
| --- |
| Desired behavior for the feature<br />Identify impacted modules (amend if there is something missing)<br />- SEO<br />- Page Builder<br />- Store Settings |

####   

## **Nonfunctional Requirements**

| **Category** | **Requirement Description** | **Priority** |
| ---| ---| --- |
| **Performance Requirements** | Domain detection and URL rendering must work without performance impact when switching domains.<br />System should be able to generate an output within three (3) seconds<br /> | High |
| **Security Requirements** | Canonical URLs must be sanitized to prevent XSS or injection vulnerabilities. | High |
| **Reliability Requirements** | Canonical URL must render 100% reliably in the `<head>` of published pages. | High |
| **Scalability Requirements** | Must support hundreds to thousands of pages per merchant without performance degradation. | High |
| **Maintenance & Supportability Requirements** | Canonical URL values must be easy to query via internal tools or support interfaces. | Medium |
|  | Errors (e.g., invalid URLs) should be logged and trigger non-breaking warnings. | Medium |
| **Compatibility Requirements** | Must work across default subdomains, custom domains, mobile, and desktop views.<br />This will ensure that the website display can be resized to any dimension of a screen and does not compromise the interface of the website<br /> | High |
|  | Must be compatible with SEO tools (Google Search Console, Yoast checks, etc.) that scan canonical tags. | High |
| **Regulatory & Compliance Requirements** | Canonical tag use must comply with Google SEO best practices. | High |
|  | No personal data should be embedded in canonical URLs, ensuring compliance with GDPR/CCPA. | High |

## Constraints
*   Limited to Page Builder pages only for this phase.
## Assumptions
*   All pages must have a auto-generated canonical URL
*   The `<head>` injection happens at **render-time**, not hardcoded into templates.
## Acceptance Criteria

| ID | Scenario | Acceptance Criteria |
| ---| ---| --- |
| AC-001 | Auto-generation | When a page is created, a canonical URL is auto-filled based on the slug and current domain (custom or subdomain). |
| AC-002 | Custom domain support | If a merchant has configured a custom domain, it is used in the canonical tag instead of the default subdomain. |
| AC-005 | Dynamic domain switching | If the domain is changed in Store Settings, canonical tags for pages using the default value reflect the updated domain automatically. |
| AC-007 | Canonical tag injection | The final canonical URL (auto or overridden) is correctly rendered in the `<head>` of the live page HTML with the format `<link rel="canonical" href={canonicalUrl} />`. |
| AC-008 | Ensure search engines recognize and prioritize the canonical URL. | \- When a consumer searches for relevant keywords, only the canonical URL appears in search results.<br />\- Duplicate pages do not appear separately in search results.<br />\- Clicking the search result redirects users to the canonical URL.<br /> |

## **Wireframes**
NA
## **Figma Design File ℅ UX UI Designer**
NA
## **Clickup Task**
[Clickup Task](https://app.clickup.com/t/86eqv2udk)
## Signed off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
|  Frances Ramos | BA |  Completed |  July 3, 2025 |
|  | QA |  |  |
|  | PM |  |  |

## Change Logs

| **Change Request ID** | **Date Requested** | **Requested By** | **Description** | **Business Justification** | **Impact Analysis** | **Priority** | **Status**<br /> | **Clickup** |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
|  |  |  |  |  |  |  |  |  |