---
id: seo-settings
title: Basic vs Advanced SEO Settings
sidebar_label: Basic vs Advanced SEO Settings
sidebar_position: 2
---

# Summary of Meta Tags

# Auto-generated vs Manual Input Meta Tags
## Auto-Generated Meta Tags
Meta tags that are automatically added to the `<head>` of a page.
###   

| **Category** | **Meta Tag / Description** | **Blogs** | **Page Builder** | **Products** | **Default Value** |
| ---| ---| ---| ---| ---| --- |
| **Basic** | `<meta name="author">` | ✔ | ✔ | ✔ | Store/Author Name (e.g., "My Store") |
|  | `<meta name="viewport">` | ✔ | ✔ | ✔ | `width=device-width, initial-scale=1.0` |
|  | `<meta charset="UTF-8">` | ✔ | ✔ | ✔ | `UTF-8` |
| **Open Graph** | `<meta property="og:updated_time">` | ✔ | ✔ | ✔ | Auto-generated from last modified datetime |
|  | `<meta property="og:url">` | ✔ | ✔ | ✔ | Canonical or page URL |
|  | `<meta property="og:type">` | ✔ | ✔ | ✔ | `article` (blog), `website` (pages), `product` |
|  | `<meta property="og:site_name">` | ✔ | ✔ | ✔ | Website/store name |
| **Twitter** | `<meta name="twitter:site">` | ✔ | ✔ | ✔ | `@storehandle` or business Twitter handle |
|  | `<meta name="twitter:creator">` | ✔ | ✔ | ✔ | Same as site or blog author's Twitter handle |
| **Schema Markup** | `<script type="application/ld+json">` (Org, Breadcrumb) | ✔ | ✔ | ✔ | Generated JSON-LD using store and page metadata |
| **Additional** | `<meta name="copyright">` | ✔ | ✔ | ✔ | `© [Year] [Store Name]` |
|  | `<meta name="referrer">` | ✔ | ✔ | ✔ | `no-referrer-when-downgrade` |
|  | `<meta name="format-detection">` | ✔ | ✔ | ✔ | `telephone=no, address=no` |
|  | `<meta name="generator">` | ✔ | ✔ | ✔ | Platform name (e.g., `MyPlatform CMS`) |
|  | `<meta http-equiv="X-UA-Compatible">` | ✔ | ✔ | ✔ | `IE=edge` |
|  | `<meta http-equiv="refresh">` | ✔ | ✔ | ✔ | Optional – typically empty unless redirect required |
| **Article Meta** | `<meta name="article:published_time">` | ✔ | ✘ | ✘ | Auto-set from blog post publish date |
|  | `<meta name="article:modified_time">` | ✔ | ✘ | ✘ | Auto-set from last content update |
| **Search Engine** | `<meta name="googlebot">` | ✔ | ✔ | ✔ | `index, follow` |
| **Bot-Specific** | `<meta name="bingbot">` | ✔ | ✔ | ✔ | `index, follow` |

* * *
## Manual Input Meta Tags
Meta tags that must be manually configured by the merchant or admin through via the Blogs, Page Builder and Products module to ensure accurate, optimized metadata per page.
###   

| **Category** | **Meta Tag / Description** | **Blogs** | **Page Builder** | **Products** | **Default Value (Suggested)** |
| ---| ---| ---| ---| ---| --- |
| **Basic** | `<title>` | ✔ | ✔ | ✔ | Page/post title, or product name |
|  | `<meta name="description">` | ✔ | ✔ | ✔ | Manually written or excerpt summary |
|  | `<meta name="keywords">` | ✔ | ✔ | ✔ | List of relevant search terms (comma-separated) |
| **Open Graph** | `<meta property="og:title">` | ✔ | ✔ | ✔ | Same as `<title>` or SEO title |
|  | `<meta property="og:description">` | ✔ | ✔ | ✔ | Same as meta description |
|  | `<meta property="og:image">` | ✔ | ✔ | ✔ | Featured image URL |
| **Twitter** | `<meta name="twitter:card">` | ✔ | ✔ | ✔ | `summary_large_image` (or `summary`) |
|  | `<meta name="twitter:title">` | ✔ | ✔ | ✔ | Same as OG title or SEO title |
|  | `<meta name="twitter:description">` | ✔ | ✔ | ✔ | Same as OG description |
|  | `<meta name="twitter:image">` | ✔ | ✔ | ✔ | Same as OG image |
| **Schema Markup** | `Article Schema (Blog-specific only)` | ✔ | ✘ | ✘ | Structured data for blog post (headline, date, author, etc.) |
| **Additional** | `<meta name="theme-color">` | ✔ | ✔ | ✔ | Hex color (e.g., `#ffffff`) for mobile browser tab styling |
|  | `<meta name="rating">` | ✔ | ✔ | ✔ | `general`, `mature`, `safe for kids` |
| **Article Meta** | `<meta name="article:author">` | ✔ | ✘ | ✘ | Author name or brand |
|  | `<meta name="article:tag">` | ✔ | ✘ | ✘ | List of blog tags |
|  | `<meta name="publisher">` | ✔ | ✘ | ✘ | Store or organization name |
|  | `<meta name="section">` | ✔ | ✘ | ✘ | Topic/category of article (e.g., News, Reviews) |
| **Search Engine** | `<meta name="google-site-verification">` | ✔ | ✔ | ✔ | Unique Google verification token |
|  | `<meta name="msvalidate.01">` | ✔ | ✔ | ✔ | Bing verification token |
|  | `<meta name="yandex-verification">` | ✔ | ✔ | ✔ | Yandex verification token |
| **Robots Directives** | `<meta name="robots">` (index, noindex, etc.) | ✔ | ✔ | ✔ | `index, follow` or `noindex, nofollow` |
|  | `index, noindex, follow, nofollow, etc.` | ✔ | ✔ | ✔ | Varies per page type (default: `index, follow`) |
| **Bot-Specific** | `<meta name="googlebot" content="noindex, nofollow">` | ✔ | ✔ | ✔ | Optional override for Googlebot; default: `index, follow` |

