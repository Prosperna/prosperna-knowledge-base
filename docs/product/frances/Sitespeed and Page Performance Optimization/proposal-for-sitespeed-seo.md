---
id: page-performance-optimization-seo-proposal
title: Page Performance & SEO Optimization Proposal
sidebar_label: Page Performance & SEO Optimization Proposal
sidebar_position: 2
---

# Proposal: P1 Website Performance and SEO

# 1. Website Performance
* * *
## Problem
Client is experiencing problems with their website's speed (see [**Clickup Task**](https://app.clickup.com/t/86eq1jpem)**)**
## Investigation
Website performance testing has been conducted and the following results occurred: middle ground fish x loaves.pdf
## Conclusions
As a result of dev's investigation, the following conclusions have been made (pasting @(Maiko) Mark Oliver Robles 's investigations from [clickup](https://app.clickup.com/t/86eq1jpem)):
*   **Images and Videos:** Site performance score is because of their media items. they have a video in their homepage and countless images
## ![](https://t7537039.p.clickup-attachments.com/t7537039/dfb38a38-1b9f-4e8d-a967-bb2260bce59a/image.png)
![](https://t7537039.p.clickup-attachments.com/t7537039/a7831e39-dfa5-46e8-a0c6-7a5ecb572eaf/image.png)
*   **Platform Mismatch**: P1 is an e-commerce platform, while the client site is not focused on e-commerce.
*   **Irrelevant Functions**: The following functions are part of our platform, but may not be relevant to the client's site:
    *   Checkout
    *   Payments
    *   Shipping
    *   Email
    *   Customer registration
    *   Products
    *   etc.
*   **Product Page**: The client’s site lacks a product page, yet these functions are still loading because our platform is designed for e-commerce.
## **Enhancement Proposal (Performance):**
From Maiko's comments on clickup:
*   Limit API usage on homepage if client site has a custom homepage (not products) eg. Xendit, add to cart, payments, etc when not needed
use next gen images
    *   **File Size:** Aim for images to be as small as possible while maintaining acceptable quality. For most images, keeping the file size under 100 KB is a good target. However, this can vary based on the type of image and its importance on the page.
    *   **Image Formats:** Use modern formats like WebP or AVIF, which offer better compression compared to traditional formats like JPEG and PNG. They help reduce file size without compromising quality.
*   Minify all our code
*   Reduce chunk sizes and loading
*   Enable caching
*   **Remove unused JavaScript** or defer non-essential scripts to improve loading times. (_notes: please take in consideration that lighthouse or GTmatrix scores do not necessarily show real world experience of customers,_ _but our client is fixated on the notion that a higher score means a better site.)_
## ACTION ITEMS
As suggested by Devs and QA, here are ways we can move forward:

### 1. Optimize Media (Images & Videos)

| Feature | Description |
| --- | --- |
| **Automatic Image Resize and Convert to Webp upon upload** | - Enable automatic compression and conversion of png and jpg images to webp Private (see [clickup task](https://app.clickup.com/t/865cqrt61))<br /> - Install imagemagik in server side to convert to webp<br /> - Target less than 1 MB of image file size <br /> - Autoresize of intrinsic image ratio<br /> - Allow Media Library and Page Builder asset manager to accept images with .webp file type |
| **Hero banner**<br /> | - Enhance the hero banner block and use bootstrap carousel to eliminate large SVG files from Slick |
| **UI tool tip** | - Display note for uploading images<br /> - Merchant is informed to upload the proper image size/file type for optimal website performance (lower file size or compressed) |
| Eliminate **figmeta**<br /> | - Eliminate figmeta from images from figma to code<br />- Have one file/folder for all webfont/sprite images
| Eliminate **base64** images | - Eliminate base64 images from page builder <br /> - Directly get image from asset (S3)
| **Image to Background Image** | - Change image type of images in page builder components (products block, hero, categories) to Background Image in div |
| **Webfont/Sprite** Image | - Convert all image icons (png/svg) into webfont/sprite image using [3rd-party app](https://fontawesome.com/) <br />- Save all icons in one page/folder and they would be loaded faster
| Apply **first contentfu**l display<br /> | - Only display the first contentful then display the succeeding content once the consumer scrolls down (similar to lazy loading) <br />- Preload images in the <head>

### 2. Optimize Code 

| Feature | Description |
| --- | --- |
| Remove unused API modules | - **API modules:** Investigate further what client websites load unnecessary API modules that are not needed (e.g. Does the site need the checkout module? Cart module? Product module? etc.) |
| Reduce **unused CSS** | - Reduce **unused CSS/CSS Purification** |
| Reduce **unused javascript** | - Reduce **unused javascript** (chunking of bootstrap) |
| **Fonts** | - Do not load unused fonts on a merchant's website. The code should only contain the fonts used on the merchant's website |
| **Inline CSS** | - Resolve **inline CSS** in builder <br />- Use internal CSS instead of inline CSS | 

### 3. **HTTP2** 

| Feature | Description |
| --- | --- |
| Support **HTTP/2** from AWS setup | - URL Path should be from Cloudfront in AWS <br />- Change all URL of static images/assets and connect AWS S3 to Cloudfront

### 4. **Resources**
- Investigate customer side for both frontend and backend to lower resources when loading a page<br />
- Increase the **score performance** based on "[light house suggestions](https://prosperna.larksuite.com/docx/CFcEdhxJ7odqxox2PsOunfSDshe#share-PJXhdyLsEouKuQxcf35uBuk1s7f)"
##   PHASES
  See breakdown of phases here: [Page Performance Optimization](https://prosperna.larksuite.com/docx/YSPddf3BloxFdtxk2QNukE7Csre)
##  Clickup Tasks
[Parent Task](https://app.clickup.com/t/86eqf4jy1)<br />
[Phase 1](https://app.clickup.com/t/86eqh4915)<br />
[Phase 2](https://app.clickup.com/t/86eqj7z6r)<br />
[Phase 3](https://app.clickup.com/t/86eqj82e9)<br />
[Phase 4](https://app.clickup.com/t/86eqmckc9)

# 2. SEO
* * *
## Problem
The client wants their old domains to not be searchable in Google. Their current website should be the only one searchable in Google. (see [clickup task](https://app.clickup.com/t/86eq1jpem))
## Client Request
![](https://t7537039.p.clickup-attachments.com/t7537039/0adda769-17de-416a-8f9a-7d86aa2b3cc8/image.png)
*   Merchant has 3 domains:
    *   [fishloaves.prosperna.com](http://fishloaves.prosperna.com/)
    *   [https://www.fish-loaves.com/](https://www.fish-loaves.com/)[](https://www.fish-loaves.com/)
    *   Currently used: [loavesxfish.com](http://loavesxfish.com/)
*   Merchant only wants [loavesxfish.com](http://loavesxfish.com/) to be searchable in google
## Short Term Solution
A short term [solution](https://app.clickup.com/t/86eq1jpem?comment=90180058329801) has been implemented:
*   Requested google to remove the URL for 6 months by setting up search console of [fishloaves.prosperna.com](http://fishloaves.prosperna.com/) and [https://www.fish-loaves.com/](https://www.fish-loaves.com/) [](https://www.fish-loaves.com/).
## Long Term Solution Comparison
What are the pros and cons of each solution? Pasting from Maiko's [proposal and conclusion](https://app.clickup.com/t/86eq1jpem?comment=90180058329801):
### 1\. Solution 1: **Conditional Canonical Tag**
**Pros**
*   Ensures that the correct version of the URL is recognized by search engines, which is crucial for consolidating SEO efforts and avoiding duplicate content issues.
*   Helps direct search engines to prioritize the preferred domain or URL, improving the chances of ranking higher.
*   Can be tailored based on user plans (free or paid) and whether they have a custom domain, offering flexibility.<br />

**Cons**
*   Requires careful implementation to ensure that the correct canonical tag is applied based on conditions.<br />

### 2\. Solution 2: Robots.txt
Include a robots.txt feature, allowing the merchant to either provide their own and upload it to their site, or we can create one that is dynamic—though the feasibility of the latter is uncertain.<br />

**Pros**
*   Provides control over what parts of the site search engines can crawl, which is important for SEO and privacy.
*   Merchants can customize their robots.txt file according to their needs.<br />

**Cons**
*    Dynamic creation of robots.txt files can be complex and might lead to errors if not handled correctly.
*   Doesn’t address duplicate content or SEO consolidation as effectively as canonical tags.
 

### 3\. Solution 3: **No-Index Based on Domain**
    `const domain =` [`req.headers.host`](http://req.headers.host/)`;`
    `if (domain === '`[`example2.prosperna.com`](http://example2.com/)`') {`
    `res.send('<meta name="robots" content="noindex">');`
    `}`
**Pros**
*   Simple and effective for preventing certain domains from being indexed by search engines.
*   Useful for development or staging environments where you don’t want the content to be indexed.<br />

**Cons**
*   If not carefully managed, this could prevent important pages from being indexed, potentially harming SEO.
*   Less flexible than canonical tags in terms of managing duplicate content across multiple domains
## Conclusion
The **Conditional Canonical Tag** is generally the best option because it directly influences how search engines handle duplicate content and URL preference. It offers a balanced approach that benefits SEO while providing flexibility based on the user’s plan and domain setup. However, each option has its specific use case, and in some scenarios, a combination of these strategies might be necessary.
## Action Items for BA
*   No action needed from BA. Short term solution can cover the issue.

# Sign Off

| **Stakeholder** | **Role** | **Status** | **Date** |
| ---| ---| ---| --- |
| Dennis | CEO |  |  |
| Ruel | HoE |  |  |
| Frances Ramos | BA | Completed |  |
|  | QA |  |  |
| Christian | PM |  |  |

#