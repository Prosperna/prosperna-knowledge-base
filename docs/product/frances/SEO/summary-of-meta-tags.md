---
id: seo-settings
title: Basic vs Advanced SEO Settings
sidebar_label: Basic vs Advanced SEO Settings
sidebar_position: 2
---

# Summary of Meta Tags

# Auto-generated vs Manual Input Meta Tags
## Auto-Generated Meta Tags
Meta tags that are automatically added to the <head> of a page.
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

# Sample HTML Head Code (with All Meta Tags needed for P1)

```xml
<head>
  <title>Your Page Title</title>
  <meta name="description" content="Your page description here.">
  <meta name="keywords" content="keyword1, keyword2, keyword3">
  <meta name="author" content="Author Name">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">

  <!-- Open Graph (Facebook, LinkedIn) --><meta property="og:title" content="Open Graph Title">
  <meta property="og:description" content="Open Graph description here.">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:updated_time" content="2025-07-15T10:00:00Z" />
  <meta property="og:url" content="https://example.com/page-url">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Your Site Name">

  <!-- Twitter Cards --><meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Twitter Card Title">
  <meta name="twitter:description" content="Twitter description.">
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg">
  <meta name="twitter:site" content="@YourSite">
  <meta name="twitter:creator" content="@AuthorHandle">

  <!-- JSON-LD Structured Data --><script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Title",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Company",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    },
    "datePublished": "2025-07-01T08:00:00Z",
    "dateModified": "2025-07-15T10:00:00Z"
  }
  </script>

  <!-- Breadcrumb Schema (optional) --><script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://example.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Page",
        "item": "https://example.com/page"
      }
    ]
  }
  </script>

  <!-- Meta Settings --><meta name="theme-color" content="#ffffff">
  <meta name="copyright" content="© 2025 Your Company">
  <meta name="rating" content="general">
  <meta name="referrer" content="no-referrer-when-downgrade">
  <meta name="format-detection" content="telephone=no, date=no, email=no">
  <meta name="generator" content="YourPlatformName CMS">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="refresh" content="3600">

  <!-- Article Metadata --><meta name="article:published_time" content="2025-07-01T08:00:00Z">
  <meta name="article:modified_time" content="2025-07-15T10:00:00Z">
  <meta name="article:author" content="Author Name">
  <meta name="article:tag" content="ecommerce, SEO, example">
  <meta name="publisher" content="Your Company">
  <meta name="section" content="Blog or News">

  <!-- Crawler Bots --><meta name="googlebot" content="noindex, nofollow">
  <meta name="bingbot" content="index, follow">
  <meta name="yandex" content="none">
  <meta name="google-site-verification" content="your-google-site-verification-code">
  <meta name="msvalidate.01" content="your-bing-site-verification-code">
  <meta name="yandex-verification" content="your-yandex-verification-code">

  <!-- Robots --><meta name="robots" content="noindex, nofollow, noarchive, nosnippet, max-snippet:150, max-image-preview:large, max-video-preview:10, notranslate, noimageindex, unavailable_after:2025-08-01T00:00:00Z, nositelinkssearchbox, nopagereadaloud">
</head>
```