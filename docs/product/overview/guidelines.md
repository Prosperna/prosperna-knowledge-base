---
id: guidelines
title: Guidelines
sidebar_position: 1
---

In product documentation, structure around **platform hierarchy**, not document chronology. Core axis: _Platform → Domain → Module → Feature → Use Cases → Specs_. Maintain strict pathing and metadata tagging. The system must scale with vertical expansion (new domains) and horizontal growth (new features).

### Root Directory: `/docs/product`

All BRDs and PRDs stem from one canonical root, never separate repositories.

---

### 1\. **Top-Level Structure**

```css
/product
├── overview/
│   ├── guidelines.md
│   ├── prd-template.md
│   ├── frd-template.md
│   └── mrd-template.md
├── admin-control/
├── merchant/
├── consumer/
├── shared-services/
└── competitor-analysis/
```

- **overview/** — foundational context, always static, low-change.
- **admin-control**, **merchant**, **consumer** — mapped 1:1 with the three Prosperna platforms.
- **shared-services/** — cross-platform utilities: authentication, payments, notifications, analytics, add-on billing.
- **competitor-analysis/** — documentation on "how other competitors do it".

---

### 2\. **Within Each Platform Directory**

```erlang
/admin-control/
├── _index.md
├── brd/
│   ├── brd-01-merchant-management.md
│   ├── brd-02-billing-verification.md
│   └── ...
├── prd/
│   ├── prd-01-merchant-management.md
│   ├── prd-02-billing-verification.md
│   └── ...
└── modules/
    ├── merchant-management/
    │   ├── overview.md
    │   ├── use-cases/
    │   │   ├── uc-01-create-merchant.md
    │   │   ├── uc-02-edit-merchant.md
    │   │   └── ...
    │   ├── flows/
    │   │   ├── merchant-onboarding.mmd
    │   │   └── billing-audit.mmd
    │   └── specs/
    │       ├── api-endpoints.md
    │       ├── data-model.md
    │       ├── ux-specs.md
    │       └── error-handling.md
```

- **brd/** and **prd/** contain standalone business and product requirement summaries, linked downward to their modules.
- **modules/** encapsulates granular documentation for each logical area.
- Use Docusaurus `_category_.json` for sidebar grouping by module, not document.

---

### 3\. **File Naming and Metadata**

- Always use `lowercase-kebab-case`.
- Prepend numerical order for logical sequence.
- Metadata frontmatter for Docusaurus:

```haskell
---id: uc-03-withdrawal-attempttitle: UC 03 – Withdrawal Attempttags: [admin-control, balances, withdrawal, brd, prd, use-case]
related:- ../brd/brd-07-balances-module.md- ../prd/prd-07-balances-module.md---
```

This enables sidebar linking, auto-indexing, and tag search.

---

### 4\. **Sidebar Hierarchy Logic**

```gherkin
Prosperna
├── Overview
├── Admin Control
│   ├── Business Requirements
│   ├── Product Requirements
│   ├── Modules
│   │   ├── Merchant Management
│   │   ├── Billing Verification
│   │   ├── Invoices
│   │   └── Balances
├── Merchant
│   ├── Business Requirements
│   ├── Product Requirements
│   ├── Modules
│   │   ├── Page Builder
│   │   ├── Products
│   │   ├── Orders
│   │   ├── Analytics
│   │   └── Subscriptions
├── Consumer
│   ├── Business Requirements
│   ├── Product Requirements
│   ├── Modules
│   │   ├── Product Listings
│   │   ├── Checkout
│   │   ├── Payments
│   │   ├── Shipping
│   │   └── Success Page
├── Shared Services
│   ├── Authentication
│   ├── Payments
│   ├── Notifications
│   ├── Add-ons
│   └── API Public Layer
└── Competitor Analysis
```

---

### 5\. **Maintenance and Scaling Rules**

1. **One Source of Truth per Feature** — each feature exists once in `/modules/.../`.
2. **BRD references PRD; PRD references Modules.**
3. **Add new module → new folder only**, no reindexing.
4. **Versioning by branch** — Docusaurus supports versioned docs; use `v1`, `v2` when major schema shifts occur.
5. **Sidebar generated from directory tree** — no manual sidebar JSON maintenance.
6. **Link everything bidirectionally** — use relative markdown links, never absolute URLs.
7. **Use diagrams in** **`.mmd`** **format inside** **`flows/`** to centralize all user journey artifacts.

---

### 6\. **Rationale**

- **Ease of maintenance:** each document self-contained and linked by frontmatter; adding or modifying affects only its local context.
- **Scalability:** structural consistency enables automated indexing and search by platform, domain, or feature.
- **Traceability:** BRD ⇄ PRD ⇄ Use Case ⇄ Flow ⇄ Spec relationship chain enables backward navigation from implementation to intent.
- **Intuitiveness:** sidebar mirrors actual product topology, not team org or document type.

This model aligns with enterprise-scale documentation standards used in modular SaaS platforms such as Shopify or Salesforce.
