# Test Case Log

**Generated:** 2025-08-12T08:57:24Z  
**Title:** Dev Env E2E – build 2025.08.12.01  
**Environment:** https://dev.example.com  
**Browsers:** Chromium (desktop), WebKit (mobile)  

## Summary
- **Total:** 5  
- **Passed:** 3  
- **Failed:** 1  
- **Flaky:** 1  
- **Skipped:** 0  
- **Duration:** 7.2s  

## Details

| ID | Scenario | Preconditions / Test Data | Steps | Expected | Actual | Status | Message | Priority | Browser/OS/Viewport | Duration | Retries | Evidence | Defect |
|---|---|---|---|---|---|---|---|---|---|---:|---:|---|---|
| **TC-LOGIN-001** | Login with valid credentials | User `qa_user@x.com` exists; logged out | 1) /login → 2) Fill email/pass → 3) Sign In | Redirect to `/dashboard`; username visible; no console errors | Redirected; username shown; no errors | **Pass** | ✅ Flow works; session cookie set; widgets render | High | Chrome 126 / macOS / 1440×900 | 1.8s | 0 | Video | — |
| **TC-LOGIN-002** | Invalid password shows inline error | Same user; logged out | 1) /login → 2) Wrong pass → 3) Sign In | Stay on `/login`; inline error “Invalid email or password.” | Toast appears; no inline error | **Fail** | ❌ UX mismatch; add inline error near password field per spec | High | Chrome 126 / macOS / 1440×900 | 1.2s | 1 | Screenshot | BUG-4321 |
| **TC-CART-005** | Add product to cart | Product `Laptop A` exists in catalog | 1) Visit product → 2) Click Add to Cart | Mini-cart shows 1 item with product name and price | Mini-cart shows 1 correct item | **Pass** | ✅ Cart updates and product correct | Medium | Chrome 126 / macOS / 1440×900 | 2.0s | 0 | Video | — |
| **TC-CHECKOUT-010** | Checkout with saved address | User has a saved address in profile | 1) Go to checkout → 2) Select saved address → 3) Place order | Order confirmation page with order number | Order confirmation displayed, order # generated | **Pass** | ✅ Checkout successful | High | Chrome 126 / macOS / 1440×900 | 1.5s | 0 | Video | — |
| **TC-SEARCH-020** | Search returns relevant results | Search index contains keyword `Playwright` | 1) Enter keyword → 2) Press Enter | Search results include items with keyword | First attempt timeout; retry returned correct results | **Flaky** | ⚠️ Network delay caused timeout; passed on retry | Medium | Chrome 126 / macOS / 1440×900 | 0.7s | 1 | Screenshot | — |
