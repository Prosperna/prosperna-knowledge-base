---
id: qa-web-checklist
title: Web QA Testing Checklist
sidebar_position: 2
---

# ✅ Web QA Testing Checklist (Manual)

> Use this checklist to validate all key aspects of a web application before marking a task as "Pass Testing." This applies to all features, bug fixes, and improvements tested via browser.

---

## 🔍 1. Functional Testing

- [ ] All buttons, links, and actions work as expected
- [ ] Forms submit properly with valid data
- [ ] Form validations trigger correctly for required/invalid inputs
- [ ] CRUD operations (Create, Read, Update, Delete) function correctly
- [ ] User flows work end-to-end (e.g., login → perform task → logout)
- [ ] Pagination, filtering, and sorting behave correctly
- [ ] Dynamic elements (modals, dropdowns, tooltips) are functional

---

## 🧪 2. Integration/API Testing (via Frontend)

- [ ] API responses are handled gracefully (loading, success, error)
- [ ] No unhandled API errors or crashes in console
- [ ] Server-side validation errors show proper feedback
- [ ] API endpoints return expected status codes (200, 400, 401, 403, 500)

---

## 🧭 3. UI/UX Validation

- [ ] Text, labels, and tooltips are correct and readable
- [ ] Layout does not break across screen sizes
- [ ] No overlapping, cutoff, or misaligned elements
- [ ] Font sizes, colors, and spacing follow design system
- [ ] Placeholder content has been replaced with real data

---

## 🌐 4. Browser & Device Compatibility

> Test on latest two versions of major browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (macOS only)

Screen sizes to validate:

- [ ] Desktop (≥1024px)
- [ ] Tablet (768px–1023px)
- [ ] Mobile (≤767px)

---

## 🔐 5. Security & Access Control

- [ ] Unauthorized access to protected pages is blocked
- [ ] Role-based access is correctly implemented
- [ ] Inputs are sanitized (basic XSS prevention)
- [ ] No sensitive data exposed in HTML, URL, or browser dev tools

---

## 🧹 6. Bug Reporting & Regression

- [ ] Fixed bugs are no longer reproducible
- [ ] Retested previous `QA Return` issues
- [ ] Regression testing completed for affected flows
- [ ] Failing tasks tagged with `QA Return` and detailed comments
- [ ] Screenshots or videos attached if needed

---

## 📂 7. Documentation & Test Evidence

- [ ] Test case results updated in ClickUp (Pass/Fail)
- [ ] Summary comment added in ClickUp task
- [ ] Test cases uploaded or linked to Prosperna Knowledge Base
- [ ] Optional: Loom video/screenshots for complex flows

---

## 📈 8. SEO & Metadata

- [ ] `<title>` tag is unique and relevant
- [ ] Meta description summarizes content clearly
- [ ] Only one `<h1>` tag per page
- [ ] All `<img>` tags have `alt` attributes
- [ ] Page uses semantic HTML tags
- [ ] No broken links on the page
- [ ] Canonical tag is correct (if used)
- [ ] Clean and readable URLs

---

## ⚡ 9. Performance & Load Speed

> Check via Chrome DevTools → Lighthouse or Performance tab:

- [ ] Page loads in under 3 seconds (normal internet)
- [ ] No major console errors or warnings
- [ ] No images > 500KB; use compression if needed
- [ ] Lazy loading enabled for offscreen assets
- [ ] Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Fonts do not cause layout shifts (FOUT/FOIT avoided)
- [ ] JS and CSS are minified and bundled properly

---

## 🧠 Final Decision

- [ ] All relevant checks above are ✅
- [ ] Mark task as **Pass Testing**
- [ ] Otherwise → tag `QA Return`, move to “In Development,” and notify Dev

---

> For new features, hotfixes, or any production deployment, this checklist ensures Prosperna maintains a high-quality, user-friendly, and SEO-compliant web experience.