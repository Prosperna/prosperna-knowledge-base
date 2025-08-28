---
id: page-performance-optimization
title: Page Performance Optimization
sidebar_label: Page Performance Optimization
sidebar_position: 1
---

# Page Performance Optimization

# Investigation
See Investigation doc [here]()
# PHASES
## PHASE 1 (DONE)

| **Task Name** | **Description** |
| ---| --- |
| Allow .webp upload<br /> | - System will allow merchant to upload images with .webp file type in media library and page builder asset manager<br />- BRD Links: [Media Library: UC 01 Upload Images](https://prosperna.larksuite.com/docx/Jz1Fd776BoFsMQxGGvMuLCRIsrq#share-XltodPhEPoHYP9xgmeGuuL06s3d), [Page Builder Asset Manager](https://prosperna.larksuite.com/docx/CvKudHfpPoG95sxAfnIuZMjFsUg)<br /> |
| Convert to HTTP/2<br />Connect images to CDN<br /> | - Currently, we are using HTTP/1 and based on lighthouse recommendation, we need to convert to HTTP/2<br />- Change all URL of static images/assets and connect AWS S3 to Cloudfront<br />- The system should call the image from CDN instead of AWS S3 (Check with devops)<br />- Please see initial documentation here: [Website Optimization Documentation](https://prosperna.larksuite.com/docx/UxBGdcFMfotpBIxIAiiu8M5tssh#share-APNAdtNkTojY1fxbWC6ubMbqsQf) |
| Reduce unused Javascript/HTML<br /> | - Based on lighthouse recommendation<br />- Chunking of bootstrap |
| Properly cache websites<br /> | - Fixed caching for P1 |
| Convert png/jpg to webp<br /> | - Converted home page images of Baker J to webp |
| Compressed images<br /> | - Reduced the image sizes of Baker J's homepage |

## PHASE 2
    Main Objective: Fix Images
    Mode: Both Desktop and Mobile

| **#** | **Requirement** | **Description** | **Priority** |
| ---| ---| ---| --- |
| 1 | Automatic resize image (intrinsic vs rendered size) | - Autoresize of intrinsic image ratio vs rendered size<br />- Check [3rd party tool](https://www.telerik.com/blogs/browser-image-conversion-using-ffmpeg.wasm) to resize image<br /> |  |
| 2 | Apply first contentful paint/images | - Only display the first contentful images then display the succeeding content/images once the consumer scrolls down (similar to lazy loading)<br />- Preload images in the `<head>`<br />- 1 API = 1 page, backend should be the one to load email/number and not frontend will call/query<br />- The query should be on the BE, not FE - this is what's currently implemented. The data is pulled from the Backend<br /> |  |
| 3 | Lazy Loading | - Apply lazy loading for mobile and desktop<br />- Mobile = maximum 2 images per scroll<br />- Web = max 9 images per scroll<br />- Check Claude for lazy loading best practices<br /> |  |
| 4 | Convert existing images to **.webp**<br /> | - We need to convert all of the images from client websites in P1 and Page Builder from .jpg/.png to .webp<br />- Focus on the following clients: Firehouse Pizza, Alibi Bar, Tintin Bazaar, Loavesxfish<br /> |  |

## PHASE 3
    Main Objective: Fix Code
    Mode: Both Desktop and Mobile

| **#** | **Requirement** | **Description** | **Priority** |
| ---| ---| ---| --- |
| 1 | Reduce unused **CSS**/**CSS Minification** | - Based on lighthouse recommendation<br />- Remove [sentry.io](http://sentry.io)<br />- Remove slick | |
| 2 | Unload unused **API modules**<br />(remove xendit API from home page)<br />(remove slick if not used by home page) | - Remove unnecessary API modules that are not needed from a page (e.g. Does the Home Page need the Checkout module? Cart module? Product module? etc.)<br />- Too many vendors, need to be optimized on developers end<br />- Rum of datadog running repeatedly, needs to be investigated<br />- Remove [sentry.io](http://sentry.io) (to confirm with devs) since there is datadog<br /> |  |
| 3 | **Unload unused Fonts**<br /> | - Do not load unused fonts on a merchant's website. The code should only contain the fonts used on the merchant's website<br />- Remove fonts from other merchants<br />- Please see initial documentation here: [Website Optimization Documentation](https://prosperna.larksuite.com/docx/UxBGdcFMfotpBIxIAiiu8M5tssh#share-C4dtduFPtobeTsxNdDEuxmVysAf) |  |
| 4 | Eliminate **figmeta** | - Eliminate **figmeta** from images from figma to code |  |
| 5 | Change type from Image to **Background Image** | - Change image type of images in hero/carousel to Background Image in div<br /> |  |

## PHASE 4

| **#** | **Requirement** | **Description** | **Priority** |
| ---| ---| ---| --- |
| 1 | Automatic Image Conversion to **Webp** upon upload<br /> | - Enable automatic compression and conversion of png and jpg images to webp<br />- Install imagemagik in server side to convert to webp (c/o [Automatic Image Compression Task](https://app.clickup.com/t/865cqrt61)) |  |
| 2 | Hero Banner from Slick to **Bootstrap Carousel** | - Enhance the hero banner block and use bootstrap carousel to eliminate large SVG files from Slick |  |
| 3 | Convert all image icons to **webfont/sprite** image<br /> | - Convert all image icons from (png/svg) into webfont/sprite image<br />- Save all icons in one page/folder and they would be loaded faster<br />- Please see initial documentation here: [Website Optimization Documentation](https://prosperna.larksuite.com/docx/UxBGdcFMfotpBIxIAiiu8M5tssh#share-Mf6tdqoS6oOI4PxnKTFu6q9rsQb)<br />- Currently we use a library for all the icons in P1. All icons are saved in the node modules<br />For further checking<br />- Check if we can get equivalent webfont icons similar to the ones we get from the [library](https://mui.com/material-ui/material-icons/)<br /> |  |
| 4 | UI tool tip | - Display note for uploading images - merchant is informed to upload the proper image size/file type for optimal website performance (lower file size or compressed)<br />- Media Library > “Upload Image” label (see [BRD Link](https://prosperna.larksuite.com/docx/Jz1Fd776BoFsMQxGGvMuLCRIsrq#share-OYC4d2xAvoDWSDxcd33u8QVksoh))<br />- Page Builder Asset Manager > “Select Image” label (see [BRD Link](https://prosperna.larksuite.com/docx/CvKudHfpPoG95sxAfnIuZMjFsUg#share-TK0Ed28WEo0F3IxECPDuHjuOsHf))<br /> |  |
| 5 | Page builder lazy loading settings | - Add Lazy Load Images toggle switch in page builder<br />- Check if possible - Nextjs preload image - automatically triggered by system<br /> |  |

# Non-functional requirements
    The following must be tested

| **Title** | **Target Value** |
| ---| --- |
| Target "Performance" Rating for Lighthouse testing | 90% |
| API Endpoint Call | 100 ms |

# Clickup Tasks
[Parent Task](https://app.clickup.com/t/86eqf4jy1)<br />
[Phase 1](https://app.clickup.com/t/86eqh4915)<br />
[Phase 2](https://app.clickup.com/t/86eqj7z6r)<br />
[Phase 3](https://app.clickup.com/t/86eqj82e9)<br />
[Phase 4](https://app.clickup.com/t/86eqmckc9)
# Signed Off

| Stakeholder | Role | Status | Date Signed |
| ---| ---| ---| --- |
| Dennis Velasco | CEO |  |  |
| Ruel Nopal | HoE |  |  |
| Neil Christian Culanculan | PM |  |  |
|  | QA |  |  |
|  | BE |  |  |
|  | FE |  |  |
| Frances Ramos | BA |  |  |