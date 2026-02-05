# 📊 Test Case Automation – Full Report

## 🔢 Overall Summary

- **Total Test Cases:** **858**

### Result Breakdown

| Result | Count |
|--------|-------|
| PASS | 819 |

---

## 📂 Test Cases per Page / Module

| Page | Total Test Cases |
|------|------------------|
|  | 25 |
| AI Credits | 2 |
| Add-ons | 1 |
| Announcements | 32 |
| Balance and Withdrawal | 1 |
| Billing | 43 |
| Blogs | 21 |
| Builder - AI Assistant | 3 |
| Builder - AI Chat | 9 |
| Builder - AI Errors | 5 |
| Builder - AI Modify | 1 |
| Builder - Button Styling | 4 |
| Builder - Design Settings | 5 |
| Builder - Product Page | 3 |
| Builder - Prompt Builder | 36 |
| Builder - Publish | 2 |
| Builder - Typography | 11 |
| Categories | 2 |
| Checkout | 14 |
| Contacts | 45 |
| Dashboard Analytics | 21 |
| Design Settings | 115 |
| Digital Product Payment | 13 |
| Discounts | 1 |
| Generate with AI | 12 |
| Get Help | 1 |
| Inventory - Edit Product | 1 |
| Inventory - Multilocation | 14 |
| Inventory - Products | 20 |
| Inventory - Variants | 24 |
| Inventory - Variants Table | 17 |
| Login | 9 |
| Marketplace | 40 |
| Media Library | 10 |
| Menu Builder | 1 |
| Messaging | 1 |
| My Account | 1 |
| Navbar Navigation | 32 |
| Not Yet Done | 1 |
| Onboarding | 9 |
| Orders | 7 |
| Orders (Modal) | 8 |
| Page Builder | 89 |
| Payments | 1 |
| Product Labels | 1 |
| Product Reviews | 1 |
| Refer and Earn | 1 |
| Register | 16 |
| Reports | 47 |
| Shipping | 33 |
| Store | 22 |
| Store Branding | 1 |
| Storefront | 1 |
| Template | 20 |
| Total Pages | 1 |
| Users | 1 |

---

## 📋 Detailed Test Case Listing


### 🔹 

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |

### 🔹 AI Credits

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| PAICred1 | https://prodev.prosperna.ph/dashboard/analytics | Verify AI Credits modal opens correctly | User is logged in and top navigation bar is visible |  | User redirected to AI Credits modal | Progress bar, AI Credits Remaining text, and Top Up button are visible |  | PASS |
| PAICred2 | https://prodev.prosperna.ph/dashboard/analytics | Verify AI Top Up page opens | User is logged in and AI Credits modal is open |  | Top Up page opens successfully | Top Up Your AI Credits page is displayed |  | PASS |

### 🔹 Add-ons

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Announcements

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Announcement1 | https://prodev.prosperna.ph/home/announcements | Verify Announcements page can be opened | User is logged in and has access to Announcements module |  | User redirected to Announcements page | Announcements page loads successfully |  | PASS |
| Announcement2 | https://prodev.prosperna.ph/home/announcements | Verify Announcements section is clickable within form | User is on Announcements page | Click "Announcements" inside the form | Announcements section becomes active / focused | Announcements section is selected or visible |  | PASS |
| Announcement3 | https://prodev.prosperna.ph/home/announcements | Verify "Floating Bar" tab is accessible | User is on Announcements page | Click "Floating Bar" tab | Floating Bar tab is selected | Floating Bar settings/content are displayed |  | PASS |
| Announcement4 | https://prodev.prosperna.ph/home/announcements | Verify "Pop-up" tab is accessible | User is on Announcements page | Click "Pop-up" tab | Pop-up tab is selected | Pop-up settings/content are displayed |  | PASS |
| Announcement5 | https://prodev.prosperna.ph/home/announcements | Verify "Settings" heading is visible and clickable | User is on Announcements page |  | Settings panel expands or becomes active | Settings section is accessible |  | PASS |
| Announcement6 | https://prodev.prosperna.ph/home/announcements | Verify "Position" section can be accessed | User is on Settings panel | Click "Position" section | Position section opens | Position options are visible |  | PASS |
| Announcement7 | https://prodev.prosperna.ph/home/announcements | Verify "Title" section can be accessed | User is on Settings panel | Click "Title" section | Title section opens | Title configuration fields are visible |  | PASS |
| Announcement8 | https://prodev.prosperna.ph/home/announcements | Verify "Content" section can be accessed | User is on Settings panel | Click "Content" section | Content section opens | Content configuration fields are visible |  | PASS |
| Announcement9 | https://prodev.prosperna.ph/home/announcements | Verify "Appearance" section can be accessed | User is on Settings panel | Click "Appearance" section | Appearance section opens | Appearance options are visible |  | PASS |
| Announcement10 | https://prodev.prosperna.ph/home/announcements | Verify "Display Rules" section can be accessed | User is on Settings panel | Click "Display Rules" section | Display Rules section opens | Display Rules options are visible |  | PASS |
| Announcement11 | https://prodev.prosperna.ph/home/announcements | Verify "Other" section can be accessed | User is on Settings panel | Click "Other" section | Other section opens | Other settings are visible |  | PASS |
| Announcement12 | https://prodev.prosperna.ph/home/announcements | Verify Preview opens in a new window | User is on Announcements page and Preview link is visible |  | New popup window opens | Preview window/tab opens successfully |  | PASS |
| Announcement13 | https://prodev.prosperna.ph/home/announcements | Verify "Position" section can be re-opened (secondary position tab/area) | User is on Announcements settings |  | Position section opens | Position options are visible |  | PASS |
| Announcement14 | https://prodev.prosperna.ph/home/announcements | Verify "Middle" position option can be selected | User is viewing Position options | Click "Middle" position image | Middle position selected | Selected position updates to Middle | Configuration saved in UI state (if autosave) | PASS |
| Announcement15 | https://prodev.prosperna.ph/home/announcements | Verify "Slide-in" position option can be selected | User is viewing Position options | Click "Slide-in" position image | Slide-in position selected | Selected position updates to Slide-in | Configuration saved in UI state (if autosave) | PASS |
| Announcement16 | https://prodev.prosperna.ph/home/announcements | Verify "Font Family" option can be accessed | User is in typography/text settings | Click "Font Family" | Font Family dropdown/choices visible | Font family options displayed |  | PASS |
| Announcement17 | https://prodev.prosperna.ph/home/announcements | Verify "Font Size" option can be accessed | User is in typography/text settings | Click "Font Size" | Font Size dropdown/choices visible | Font size options displayed |  | PASS |
| Announcement18 | https://prodev.prosperna.ph/home/announcements | Verify "Font Weight" option can be accessed | User is in typography/text settings | Click "Font Weight" | Font Weight dropdown/choices visible | Font weight options displayed |  | PASS |
| Announcement19 | https://prodev.prosperna.ph/home/announcements | Verify "Title Font Color" option can be accessed | User is in title styling settings | Click "Title Font Color" | Color picker/options appear | Title font color configuration is visible |  | PASS |
| Announcement20 | https://prodev.prosperna.ph/home/announcements | Verify Title Text field accepts input | User is in Title settings and Title Text field is visible | Fill Title Text with "Hello Test" | Title text value updated | Title displays "Hello Test" in configuration |  | PASS |
| Announcement21 | https://prodev.prosperna.ph/home/announcements | Verify Body Text field accepts input | User is in Content settings and Body Text field is visible | Fill Body Text with "Test World" | Body text value updated | Body displays "Test World" in configuration |  | PASS |
| Announcement22 | https://prodev.prosperna.ph/home/announcements | Verify Appearance section can be opened (secondary instance) | User is on Announcements settings |  | Appearance section opens | Appearance options are visible |  | PASS |
| Announcement23 | https://prodev.prosperna.ph/home/announcements | Verify Background Color option is visible | User is in Appearance section | Check visibility of "Background Color" | Background Color option visible | Background Color setting is displayed |  | PASS |
| Announcement24 | https://prodev.prosperna.ph/home/announcements | Verify Timer Background Color option is visible | User is in Appearance section | Check visibility of "Timer Background Color" | Timer Background Color option visible | Timer Background Color setting is displayed |  | PASS |
| Announcement25 | https://prodev.prosperna.ph/home/announcements | Verify Display Rules section can be opened (secondary instance) | User is on Announcements settings |  | Display Rules section opens | Display Rules options are visible |  | PASS |
| Announcement26 | https://prodev.prosperna.ph/home/announcements | Verify On Page Entrance rule can be selected | User is in Display Rules section | Click "On Page Entrance" | Rule selected | On Page Entrance display rule is enabled/selected | Rule configuration stored (if autosave) | PASS |
| Announcement27 | https://prodev.prosperna.ph/home/announcements | Verify On Page Exit rule can be selected | User is in Display Rules section | Click "On Page Exit" | Rule selected | On Page Exit display rule is enabled/selected | Rule configuration stored (if autosave) | PASS |
| Announcement28 | https://prodev.prosperna.ph/home/announcements | Verify Delay rule can be selected | User is in Display Rules section | Click "Delay" | Delay option selected | Delay configuration option is enabled/selected | Rule configuration stored (if autosave) | PASS |
| Announcement29 | https://prodev.prosperna.ph/home/announcements | Verify Appearance Limit rule can be selected | User is in Display Rules section | Click "Appearance Limit" | Appearance limit selected | Appearance Limit configuration option is enabled/selected | Rule configuration stored (if autosave) | PASS |
| Announcement30 | https://prodev.prosperna.ph/home/announcements | Verify Other section can be opened (secondary instance) | User is on Announcements settings |  | Other section opens | Other settings are visible |  | PASS |
| Announcement31 | https://prodev.prosperna.ph/home/announcements | Verify Show Close Button option can be toggled | User is in Other settings |  | Toggle changes state | Show Close Button setting is enabled/disabled accordingly | Configuration stored (if autosave) | PASS |
| Announcement32 | https://prodev.prosperna.ph/home/announcements | Verify unnamed checkbox can be checked (disabled in automation) | User is in Other settings and target checkbox exists |  | Checkbox becomes checked | Checkbox state is updated | Configuration stored (if autosave) | PASS |

### 🔹 Balance and Withdrawal

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Billing

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Billing1 | https://prodev.prosperna.ph/home/billing | Verify user can log in and open Billing page | User account credentials are valid | Logout (if logged in) → Login → Enter email/password → Click Log In → Navigate to Billing page | User redirected to Billing page | Billing page loads successfully | Auth session created; none beyond login | PASS |
| Billing2 | https://prodev.prosperna.ph/home/billing | Verify Current Plan is visible on Billing page | User is on Billing page | Check text "Current Plan: PREMIUM Plan" is visible | Current plan displayed | Current plan section is shown |  | PASS |
| Billing3 | https://prodev.prosperna.ph/home/billing | Verify Payment Terms section is visible | User is on Billing page | Check text "Payment Terms" is visible | Payment terms displayed | Payment Terms section is shown |  | PASS |
| Billing4 | https://prodev.prosperna.ph/home/billing | Verify Annual Plan Promo Offers section is visible | User is on Billing page | Check text "Annual Plan Promo Offers" is visible | Promo offers displayed | Annual Plan Promo Offers section is shown |  | PASS |
| Billing5 | https://prodev.prosperna.ph/home/billing | Verify Free plan section is visible | User is on Billing page | Verify heading "Free" is visible | Free plan displayed | Free plan card/section is visible |  | PASS |
| Billing6 | https://prodev.prosperna.ph/home/billing | Verify Free plan price is visible | User is on Billing page | Verify text "₱0.00" is visible | Price displayed | Free plan price is shown |  | PASS |
| Billing7 | https://prodev.prosperna.ph/home/billing | Verify Free plan description is visible | User is on Billing page | Verify "Basic features for home based" and "Includes:" are visible | Description displayed | Free plan description and label are shown |  | PASS |
| Billing8 | https://prodev.prosperna.ph/home/billing | Verify Free plan features are visible | User is on Billing page | Verify: Up to 10 Products, 1 Inventory Location, 1 Admin User, Sell on Facebook | Features displayed | Free plan features list is shown |  | PASS |
| Billing9 | https://prodev.prosperna.ph/home/billing | Verify Plus plan section is visible | User is on Billing page | Verify heading "Plus" is visible | Plus plan displayed | Plus plan card/section is visible |  | PASS |
| Billing10 | https://prodev.prosperna.ph/home/billing | Verify Plus plan price is visible | User is on Billing page | Verify text "₱495.00" is visible | Price displayed | Plus plan price is shown |  | PASS |
| Billing11 | https://prodev.prosperna.ph/home/billing | Verify Plus plan description is visible | User is on Billing page |  | Description displayed | Plus plan description is shown |  | PASS |
| Billing12 | https://prodev.prosperna.ph/home/billing | Verify Plus plan features are visible | User is on Billing page | Verify: Up to 50 Products, 2 Inventory Locations, 2 Admin Users, Sell on Facebook Instagram,… | Features displayed | Plus plan features list is shown |  | PASS |
| Billing13 | https://prodev.prosperna.ph/home/billing | Verify Pro plan section is visible | User is on Billing page | Verify heading "Pro" is visible | Pro plan displayed | Pro plan card/section is visible |  | PASS |
| Billing14 | https://prodev.prosperna.ph/home/billing | Verify Pro plan price is visible | User is on Billing page | Verify text "₱1,249.00" is visible | Price displayed | Pro plan price is shown |  | PASS |
| Billing15 | https://prodev.prosperna.ph/home/billing | Verify Pro plan description is visible | User is on Billing page |  | Description displayed | Pro plan description is shown |  | PASS |
| Billing16 | https://prodev.prosperna.ph/home/billing | Verify Pro plan features are visible | User is on Billing page | Verify: Up to 100 Products, 5 Inventory Locations, 5 Admin Users, Sell on more sales channels | Features displayed | Pro plan features list is shown |  | PASS |
| Billing17 | https://prodev.prosperna.ph/home/billing | Verify Premium plan section is visible (current plan) | User is on Billing page | Verify heading "Current Plan: PREMIUM Plan" is visible | Premium plan displayed | Premium plan section is visible and marked as current |  | PASS |
| Billing18 | https://prodev.prosperna.ph/home/billing | Verify Premium plan price is visible | User is on Billing page | Verify text "₱2,499.00" is visible | Price displayed | Premium plan price is shown |  | PASS |
| Billing19 | https://prodev.prosperna.ph/home/billing | Verify Premium plan description is visible | User is on Billing page |  | Description displayed | Premium plan description is shown |  | PASS |
| Billing20 | https://prodev.prosperna.ph/home/billing | Verify Premium plan features are visible | User is on Billing page | Verify: Unlimited Products, 50 Inventory Locations, Unlimited Admin Users, Sell on all sales channels | Features displayed | Premium plan features list is shown |  | PASS |
| Billing21 | https://prodev.prosperna.ph/home/billing | Verify Order Summary section is visible | User is on Billing page | Verify text "Order Summary" is visible | Order summary displayed | Order Summary section is shown |  | PASS |
| Billing22 | https://prodev.prosperna.ph/home/billing | Verify empty Order Summary state is displayed | User is on Billing page and no orders exist | Verify text "You haven't ordered anything" is visible | Empty state displayed | Empty Order Summary message is shown |  | PASS |
| Billing23 | https://prodev.prosperna.ph/home/billing | Verify Manage/End Subscription link can be clicked | User is on Billing page and subscription controls exist |  | Manage/End subscription action opens | Subscription management UI/action is triggered |  | PASS |
| Billing24 | https://prodev.prosperna.ph/home/billing | Verify Cancel Plan button can be clicked | User is in subscription management flow |  | Cancellation flow begins | Cancel confirmation/warning is shown (if applicable) |  | PASS |
| Billing25 | https://prodev.prosperna.ph/home/billing | Verify cancellation warning messages are shown | User has clicked Cancel Plan and warning modal/page appears | Verify: Warning, active subscription warning, loss statement, proceed question | Warning displayed | All warning texts are visible |  | PASS |
| Billing26 | https://prodev.prosperna.ph/home/billing | Verify cancellation can be confirmed | User is on cancellation confirmation modal/page |  | Cancellation proceeds | Flow advances to next cancellation step | Subscription status may change if confirmed | PASS |
| Billing27 | https://prodev.prosperna.ph/home/billing | Verify cancellation consequences are displayed | User has confirmed cancellation or is in consequences step |  | Consequences displayed | Cancellation consequences are visible |  | PASS |
| Billing28 | https://prodev.prosperna.ph/home/billing | Verify Continue and Cancel proceeds cancellation flow | User is on consequences step | Click "Continue and Cancel" | Cancellation continues | Flow proceeds to reason selection | Subscription status may change when completed | PASS |
| Billing29 | https://prodev.prosperna.ph/home/billing | Verify cancellation reason can be selected and submitted | User is on cancellation reason step | Verify heading "Why do you want to cancel?" → Select reason "I need more features" → Click Continue and Cancel | Reason submitted | Reason accepted and flow proceeds | Cancellation metadata stored (reason) | PASS |
| Billing30 | https://prodev.prosperna.ph/home/billing | Verify cancellation success page is displayed | User completed cancellation flow |  | Success displayed | Cancellation success confirmation is shown | Subscription downgraded/ended; billing record updated | PASS |
| Billing31 | https://prodev.prosperna.ph/home/billing | Verify Back to Dashboard works after cancellation | User is on cancellation success page | Click "Back to Dashboard" | User redirected to dashboard | Dashboard loads successfully |  | PASS |
| Billing32 | https://prodev.prosperna.ph/home/billing | Verify user on Free plan can select upgrade via Add to Order | User is on Billing page and current plan is FREE | Verify "Current Plan: FREE Plan" → Click "Add to Order" | Upgrade selection opened | Plan selection flow opens |  | PASS |
| Billing33 | https://prodev.prosperna.ph/home/billing | Verify Plus plan is selected | User is in plan selection flow for upgrade | Check Plus Plan is present → Verify "PLAN SELECTED" | Plus plan selected | Plus plan shows as selected in UI |  | PASS |
| Billing34 | https://prodev.prosperna.ph/home/billing | Verify applying an already-used promo code shows error | User is on checkout/payment screen and promo input is visible | Enter promo code "support100" → Click Apply → Verify error message shown | Error displayed | System shows promo code already used/invalid message |  | PASS |
| Billing35 | https://prodev.prosperna.ph/home/billing | Verify applying an invalid promo code shows warning | User is on checkout/payment screen and promo input is visible | Enter promo code "DISC_NEW" → Click Apply → Verify invalid promo warning | Warning displayed | System shows promo code invalid message |  | PASS |
| Billing36 | https://prodev.prosperna.ph/home/billing | Verify user can pay for Plus plan via E-Wallet | User has Plus plan selected and is on payment step |  | Payment initiated | Payment flow proceeds successfully | Payment transaction created (pending/processed) | PASS |
| Billing37 | https://prodev.prosperna.ph/home/billing | Verify Change Plan can be opened from Plus plan | User is on Billing page with PLUS plan active |  | Change plan dialog opens | Change plan modal/dialog is displayed |  | PASS |
| Billing38 | https://prodev.prosperna.ph/home/billing | Verify user can switch from Plus to Pro plan via Change Plan | User is on Change Plan dialog |  | Pro plan selected | Pro plan is selected and proceeds to upgrade/payment | Plan selection updated | PASS |
| Billing39 | https://prodev.prosperna.ph/home/billing | Verify user can pay for Pro plan upgrade via Credit Card | User selected Pro plan and upgrade payment is required | Verify Pro Plan + upgrade price → Select Payment Type = Credit Card Payment → Click Pay Now | Payment initiated | Payment flow proceeds for Pro plan upgrade | Payment transaction created (pending/processed) | PASS |
| Billing40 | https://prodev.prosperna.ph/home/billing | Verify Change Plan can be opened from Pro plan | User is on Billing page with PRO plan active |  | Change plan dialog opens | Change plan modal/dialog is displayed |  | PASS |
| Billing41 | https://prodev.prosperna.ph/home/billing | Verify user can switch from Pro to Premium plan via Change Plan | User is on Change Plan dialog |  | Premium plan selected | Premium plan selection proceeds to upgrade/payment | Plan selection updated | PASS |
| Billing42 | https://prodev.prosperna.ph/home/billing | Verify user can pay for Premium plan upgrade via Credit Card | User selected Premium plan and upgrade payment is required | Verify upgrade price → Select Payment Type = Credit Card Payment → Click Pay Now | Payment initiated | Payment flow proceeds for Premium plan upgrade | Payment transaction created (pending/processed) | PASS |
| Billing43 | https://prodev.prosperna.ph/home/billing | Verify Premium plan becomes active after payment | User completed Premium upgrade payment | Verify "Premium Plan" visible | Premium active | Premium plan is now active in Billing page | Subscription plan updated in billing records | PASS |

### 🔹 Blogs

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Blogs1 | https://prodev.prosperna.ph/home/blogs | Verify user can open Blogs page | User is logged in and has access to Blogs module |  | User redirected to Blogs page | Blogs page loads successfully |  | PASS |
| Blogs2 | https://prodev.prosperna.ph/home/blogs | Verify user can access AI Medium Blog Post generator | User is on Blogs page |  | AI blog generator opened | Medium Blog Post generator page/flow is displayed |  | PASS |
| Blogs3 | https://prodev.prosperna.ph/home/blogs | Verify AI Topics can be generated and a suggested topic can be selected | User is on Medium Blog Post generator topic step | Enter topic seed "Test" → Click Generate AI Topics → Select generated-topic-0 | Topic selected | Suggested topic is selected successfully |  | PASS |
| Blogs4 | https://prodev.prosperna.ph/home/blogs | Verify custom topic can be entered and continued | User is on topic step and custom topic input is available | Enter custom topic "Test" → Click Continue | Continued to next step | Custom topic is accepted and flow proceeds |  | PASS |
| Blogs5 | https://prodev.prosperna.ph/home/blogs | Verify blog type can be set | User is on blog configuration step with Blog Type dropdown | Open Blog Type dropdown → Select "How-To / Tutorial" | Blog type selected | Selected Blog Type is applied |  | PASS |
| Blogs6 | https://prodev.prosperna.ph/home/blogs | Verify blog style can be set | User is on blog configuration step with Style dropdown | Open Style dropdown → Select "Expository" | Style selected | Selected Style is applied |  | PASS |
| Blogs7 | https://prodev.prosperna.ph/home/blogs | Verify blog tone can be set | User is on blog configuration step with Tone dropdown | Open Tone dropdown → Select "Professional" | Tone selected | Selected Tone is applied |  | PASS |
| Blogs8 | https://prodev.prosperna.ph/home/blogs | Verify target audience can be entered | User is on blog configuration step and Audience textbox is visible | Enter audience "General Audience" | Audience set | Audience field is populated successfully |  | PASS |
| Blogs9 | https://prodev.prosperna.ph/home/blogs | Verify geography can be entered and user can proceed to title generation | User is on blog configuration step and Geography textbox is visible | Enter geography "global" → Click Generate Titles / Next | Proceeded to titles | Titles generation step opens successfully |  | PASS |
| Blogs10 | https://prodev.prosperna.ph/home/blogs | Verify user can select an AI-generated title | User is on title selection step and titles are available | Click title-selectedTitle | Title selected | Selected title is applied to the blog draft |  | PASS |
| Blogs11 | https://prodev.prosperna.ph/home/blogs | Verify user can write a custom title and generate keywords & outline | User is on title step and Write Your Own option is available | Click Write Your Own → Enter title "test" → Click Generate Keywords & Outline | Keywords generated | Keyword and outline generation runs successfully |  | PASS |
| Blogs12 | https://prodev.prosperna.ph/home/blogs | Verify user can select keywords and continue | User is on keyword selection step and keyword options are visible | Select primary keyword → Select secondary keywords 0-2 → Select long-tail keywords 0-2 → Select LSI keywords 0-2 → Click Continue to Next Step | Keywords selected | Selected keywords are applied and flow proceeds | None (SEO metadata stored in draft) | PASS |
| Blogs13 | https://prodev.prosperna.ph/home/blogs | Verify user can select suggested images and generate meta tags | User is on image selection step and suggested images are available | Select suggested-image-0 to 3 → Click Generate Meta Tags / Next | Meta tags generated | Image selections saved and meta tag generation proceeds | Draft updated with image selections and meta tags | PASS |
| Blogs14 | https://prodev.prosperna.ph/home/blogs | Verify user can choose meta tag option and generate post | User is on meta tags step and options are available |  | Post generation started | AI post is generated successfully | Blog draft content generated and stored | PASS |
| Blogs15 | https://prodev.prosperna.ph/home/blogs | Verify user can publish the generated blog post | User is on generated post editor/preview step |  | Blog published | Blog is created successfully and success toast/message appears | New blog record created (published) | PASS |
| Blogs16 | https://prodev.prosperna.ph/home/blogs | Verify blog action dropdown can be opened | User is on Blogs listing page and at least one blog row exists |  | Dropdown opened | Row action dropdown opens successfully |  | PASS |
| Blogs17 | https://prodev.prosperna.ph/home/blogs | Verify View action is visible in dropdown | User opened blog action dropdown |  | View option visible | View action appears in dropdown |  | PASS |
| Blogs18 | https://prodev.prosperna.ph/home/blogs | Verify Unpublish action is visible in dropdown | User opened blog action dropdown |  | Unpublish option visible | Unpublish action appears in dropdown |  | PASS |
| Blogs19 | https://prodev.prosperna.ph/home/blogs | Verify Edit action is visible in dropdown | User opened blog action dropdown |  | Edit option visible | Edit action appears in dropdown |  | PASS |
| Blogs20 | https://prodev.prosperna.ph/home/blogs | Verify Duplicate action is visible in dropdown | User opened blog action dropdown |  | Duplicate option visible | Duplicate action appears in dropdown |  | PASS |
| Blogs21 | https://prodev.prosperna.ph/home/blogs | Verify Delete action is visible in dropdown | User opened blog action dropdown |  | Delete option visible | Delete action appears in dropdown |  | PASS |

### 🔹 Builder - AI Assistant

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product101 | https://prodev.prosperna.ph/builder/product-1uvr | Verify builder overlay can be closed via ✕ button | Any modal/overlay open | Click button '✕' | The action is completed successfully as expected | Overlay closes |  | PASS |
| Product102 | https://prodev.prosperna.ph/builder/product-1uvr | Verify AI Assistant panel can be opened | Builder open |  | The page or section opens successfully | AI Assistant panel opens |  | PASS |
| Product103 | https://prodev.prosperna.ph/builder/product-1uvr | Verify AI Assistant can generate hero section via argument collector | AI Assistant open and credits available | Send 'generate hero section'; select 'Image Right / Text Left'; complete; verify AI Modify visible in iframe | The action is completed successfully as expected | Hero section generation flow completes and AI Modify button is visible | May create/modify page content | PASS |

### 🔹 Builder - AI Chat

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product33 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /help command returns AI response | User is on builder AI chat panel | Send '/help' and verify AI response text | The action is completed successfully as expected | AI returns help response |  | PASS |
| Product34 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /sections command returns AI response | User is on builder AI chat panel | Send '/sections' and verify AI response | The action is completed successfully as expected | AI returns sections response |  | PASS |
| Product35 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /hero command returns AI response | User is on builder AI chat panel | Send '/hero' and verify AI response | The action is completed successfully as expected | AI returns hero response |  | PASS |
| Product36 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /gallery command returns AI response | User is on builder AI chat panel | Send '/gallery' and verify response contains /gallery | The action is completed successfully as expected | AI returns gallery response |  | PASS |
| Product37 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /reviews command returns AI response | User is on builder AI chat panel |  | The page or section opens successfully | AI returns reviews response |  | PASS |
| Product38 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /faqs command returns AI response | User is on builder AI chat panel | Send '/faqs' and verify 'Docking at /faqs' | The action is completed successfully as expected | AI returns faqs response |  | PASS |
| Product39 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /specs command returns AI response | User is on builder AI chat panel | Send '/specs' and verify 'Loading /specs' | The action is completed successfully as expected | AI returns specs response |  | PASS |
| Product40 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /related-products command returns AI response | User is on builder AI chat panel | Send '/related-products' and verify response contains command | The action is completed successfully as expected | AI returns related-products response |  | PASS |
| Product41 | https://prodev.prosperna.ph/builder/product-1uvr | Verify /samples command returns AI response | User is on builder AI chat panel | Send '/samples' and verify sample response text | The action is completed successfully as expected | AI returns samples response |  | PASS |

### 🔹 Builder - AI Errors

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product42 | https://prodev.prosperna.ph/builder/product-1uvr | Verify insufficient credits error handling in AI chat | AI chat is available | Send 'x-err-insufficient-credits' and verify error/topup link | The action is completed successfully as expected | Appropriate error message and Top Up link shown |  | PASS |
| Product43 | https://prodev.prosperna.ph/builder/product-1uvr | Verify rate limit error handling in AI chat | AI chat is available | Send 'x-err-rate-limit' and verify 'Too many requests' | The action is completed successfully as expected | Rate limit message displayed |  | PASS |
| Product44 | https://prodev.prosperna.ph/builder/product-1uvr | Verify zero balance error handling in AI chat | AI chat is available | Send 'x-err-zero-balance' and verify no credits/topup link | The action is completed successfully as expected | No credits message displayed and Top Up link available |  | PASS |
| Product44b | https://prodev.prosperna.ph/builder/product-1uvr | Verify unknown command response in AI chat | AI chat is available | Send '/try' and verify unknown command response | The action is completed successfully as expected | Unknown command response displayed |  | PASS |
| Product107 | https://prodev.prosperna.ph/builder/product-1uvr | Verify AI provider error handling | AI Assistant open | Send 'x-err-llm-provider'; verify 'Unable to generate response.' | The action is completed successfully as expected | Provider error message shown |  | PASS |

### 🔹 Builder - AI Modify

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product104 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Modify Element with AI flow works inside iframe | Hero section exists and AI Modify visible |  | The action is completed successfully as expected | Element modification succeeds and success message displayed | May update page content | PASS |

### 🔹 Builder - Button Styling

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product96 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Button Styling section can be opened | Builder open |  | The page or section opens successfully | Button styling options show |  | PASS |
| Product97 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Sharp button style selectable | Button styling options visible | Select 'Sharp' | The action is completed successfully as expected | Sharp style selected |  | PASS |
| Product98 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Rounded button style selectable | Button styling options visible | Select 'Rounded' | The action is completed successfully as expected | Rounded style selected |  | PASS |
| Product99 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Capsule button style selectable and send action works | Button styling options visible | Select 'Capsule'; click send | The action is completed successfully as expected | Capsule selected and send clicked |  | PASS |

### 🔹 Builder - Design Settings

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product80 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Colors section can be opened | Builder open |  | The page or section opens successfully | Colors section opens |  | PASS |
| Product81 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Primary color option selectable | Colors section open | Click 'Primary' | The action is completed successfully as expected | Primary color selected |  | PASS |
| Product82 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Accent color option selectable | Colors section open | Click 'Accent' | The action is completed successfully as expected | Accent color selected |  | PASS |
| Product83 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Secondary color option selectable | Colors section open | Click 'Secondary' | The action is completed successfully as expected | Secondary color selected |  | PASS |
| Product84 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Text color option selectable | Colors section open | Click 'Text' (index 0) | The action is completed successfully as expected | Text color selected |  | PASS |

### 🔹 Builder - Product Page

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product30 | https://prodev.prosperna.ph/builder/product-1uvr | Verify left panel can be toggled in builder | User can access builder URL |  | The action is completed successfully as expected | Left panel toggles |  | PASS |
| Product31 | https://prodev.prosperna.ph/builder/product-1uvr | Verify right panel can be toggled in builder | User is on builder page |  | The action is completed successfully as expected | Right panel toggles |  | PASS |
| Product32 | https://prodev.prosperna.ph/builder/product-1uvr | Verify builder intro text is visible and clickable | User is on builder page |  | The action is completed successfully as expected | Intro text is interactable |  | PASS |

### 🔹 Builder - Prompt Builder

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product45 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Prompt Builder can be opened | User is on builder page |  | The page or section opens successfully | Prompt Builder opens |  | PASS |
| Product46 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Prompt Builder heading is visible | Prompt Builder is open | Verify heading 'Prompt Builder' | The action is completed successfully as expected | Prompt Builder UI is displayed |  | PASS |
| Product47 | https://prodev.prosperna.ph/builder/product-1uvr | Verify section type selection screen is visible | Prompt Builder is open | Verify heading 'Select Section Type' | The action is completed successfully as expected | Section type selection is accessible |  | PASS |
| Product48 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Hero section type can be selected | Prompt Builder section types visible | Click 'Hero Hero' | The action is completed successfully as expected | Hero section type selected |  | PASS |
| Product49 | https://prodev.prosperna.ph/builder/product-1uvr | Verify hero options screen is visible | Hero section type selected | Verify heading 'Select Hero Section Options' | The action is completed successfully as expected | Hero options are displayed |  | PASS |
| Product50 | https://prodev.prosperna.ph/builder/product-1uvr | Verify hero layout Image Right/Text Left can be selected | Hero options displayed | Select 'Image Right / Text Left' | The action is completed successfully as expected | Layout selection registers |  | PASS |
| Product51 | https://prodev.prosperna.ph/builder/product-1uvr | Verify hero layout Image Left/Text Right can be selected | Hero options displayed | Select 'Image Left / Text Right' | The action is completed successfully as expected | Layout selection registers |  | PASS |
| Product52 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Specifications & Descriptions section can be selected | Prompt Builder section types visible | Select 'Specifications & Descriptions' | The action is completed successfully as expected | Specifications section type selected |  | PASS |
| Product53 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Specifications options screen is visible | Specifications selected | Verify heading 'Select Specifications &' | The action is completed successfully as expected | Specifications options displayed |  | PASS |
| Product54 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 2-tabs layout is available/selectable | Specifications options displayed | Select '2-tabs' layout | The action is completed successfully as expected | 2-tabs layout selected |  | PASS |
| Product55 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 2-column-side-by-side layout is available/selectable | Specifications options displayed | Select '2-column-side-by-side' layout | The action is completed successfully as expected | 2-column layout selected |  | PASS |
| Product56 | https://prodev.prosperna.ph/builder/product-1uvr | Verify accordion layout is available/selectable | Specifications options displayed | Select 'accordion' layout | The action is completed successfully as expected | Accordion layout selected |  | PASS |
| Product57 | https://prodev.prosperna.ph/builder/product-1uvr | Verify stacked-panels layout is available/selectable | Specifications options displayed | Select 'stacked-panels' layout | The action is completed successfully as expected | Stacked-panels layout selected |  | PASS |
| Product58 | https://prodev.prosperna.ph/builder/product-1uvr | Verify card-style layout is available/selectable | Specifications options displayed | Select 'card-style' layout | The action is completed successfully as expected | Card-style layout selected |  | PASS |
| Product59 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Gallery section can be selected | Prompt Builder section types visible | Click 'Gallery Gallery' | The action is completed successfully as expected | Gallery section selected |  | PASS |
| Product60 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Gallery options screen is visible | Gallery selected | Verify heading 'Select Gallery Options' | The action is completed successfully as expected | Gallery options displayed |  | PASS |
| Product61 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 4-image gallery layout is visible | Gallery options displayed | Verify button '4-image' is visible | The action is completed successfully as expected | 4-image option is present |  | PASS |
| Product62 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 5-image gallery layout is visible | Gallery options displayed | Verify button '5-image' is visible | The action is completed successfully as expected | 5-image option is present |  | PASS |
| Product63 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 6-image gallery layout is visible | Gallery options displayed | Verify button '6-image' is visible | The action is completed successfully as expected | 6-image option is present |  | PASS |
| Product64 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Product Reviews section can be selected | Prompt Builder section types visible |  | The page or section opens successfully | Product Reviews section selected |  | PASS |
| Product65 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Product Reviews options screen is visible | Product Reviews selected | Verify heading 'Select Product Reviews Options' | The page or section opens successfully | Product Reviews options displayed |  | PASS |
| Product66 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 1-column reviews layout selectable | Reviews options displayed | Select '1-column' | The page or section opens successfully | 1-column layout selected |  | PASS |
| Product67 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 2-column reviews layout selectable | Reviews options displayed | Select '2-column' | The page or section opens successfully | 2-column layout selected |  | PASS |
| Product68 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 3-column reviews layout selectable | Reviews options displayed | Select '3-column' | The page or section opens successfully | 3-column layout selected |  | PASS |
| Product69 | https://prodev.prosperna.ph/builder/product-1uvr | Verify user can proceed to next sections | Reviews step complete | Click 'Next sections' | The action is completed successfully as expected | Moves to next section selection |  | PASS |
| Product70 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Related Products section selectable | Next sections displayed | Click 'Related Products' | The action is completed successfully as expected | Related Products selected |  | PASS |
| Product71 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Related Products options screen visible | Related Products selected | Verify heading 'Select Related Products' | The action is completed successfully as expected | Related Products options displayed |  | PASS |
| Product72 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 2-column related products layout selectable | Related options displayed | Select '2-column' | The action is completed successfully as expected | 2-column related layout selected |  | PASS |
| Product73 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 3-column related products layout selectable | Related options displayed | Select '3-column' | The action is completed successfully as expected | 3-column related layout selected |  | PASS |
| Product74 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 3-column-carousel related products layout selectable | Related options displayed | Select '3-column-carousel' | The action is completed successfully as expected | Carousel layout selected |  | PASS |
| Product75 | https://prodev.prosperna.ph/builder/product-1uvr | Verify FAQs section selectable | Prompt Builder sections | Click 'FAQs' | The action is completed successfully as expected | FAQs section selected |  | PASS |
| Product76 | https://prodev.prosperna.ph/builder/product-1uvr | Verify FAQs options screen visible | FAQs selected | Verify heading 'Select FAQs Options' | The action is completed successfully as expected | FAQs options displayed |  | PASS |
| Product77 | https://prodev.prosperna.ph/builder/product-1uvr | Verify full-width-accordion FAQs layout selectable | FAQs options displayed | Select 'full-width-accordion' | The action is completed successfully as expected | Layout selected |  | PASS |
| Product78 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 2-column-card FAQs layout selectable | FAQs options displayed | Select '2-column-card' | The action is completed successfully as expected | Layout selected |  | PASS |
| Product79 | https://prodev.prosperna.ph/builder/product-1uvr | Verify 3-column-card FAQs layout selectable | FAQs options displayed | Select '3-column-card' | The action is completed successfully as expected | Layout selected |  | PASS |
| Product100 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Prompt Builder can be closed from inside modal | Prompt Builder open |  | The action is completed successfully as expected | Prompt Builder closes |  | PASS |

### 🔹 Builder - Publish

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product105 | https://prodev.prosperna.ph/builder/product-1uvr | Verify publish button is visible after closing AI modify modal | Builder open |  | The action is completed successfully as expected | Publish control is visible |  | PASS |
| Product106 | https://prodev.prosperna.ph/builder/product-1uvr | Verify AI Modify button can become hidden after manual edit and republish | Builder iframe content editable |  | The action is completed successfully as expected | AI Modify button not shown after manual edit state |  | PASS |

### 🔹 Builder - Typography

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product85 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Typography section can be opened | Builder open |  | The page or section opens successfully | Typography section opens |  | PASS |
| Product86 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Heading Font section can be opened | Typography open |  | The page or section opens successfully | Heading font options show |  | PASS |
| Product87 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Heading Sans Serif font selectable | Heading font options visible | Select 'Sans Serif' (index 0) | The action is completed successfully as expected | Heading font set to Sans Serif |  | PASS |
| Product88 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Heading Serif font selectable | Heading font options visible | Select 'Serif' (index 0) | The action is completed successfully as expected | Heading font set to Serif |  | PASS |
| Product89 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Heading Script font selectable | Heading font options visible | Select 'Script' (index 0) | The action is completed successfully as expected | Heading font set to Script |  | PASS |
| Product90 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Heading Display font selectable | Heading font options visible | Select 'Display' (index 0) | The action is completed successfully as expected | Heading font set to Display |  | PASS |
| Product91 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Body & UI Font section can be opened | Typography open |  | The page or section opens successfully | Body/UI font options show |  | PASS |
| Product92 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Body Sans Serif font selectable | Body/UI font options visible | Select 'Sans Serif' (index 1) | The action is completed successfully as expected | Body font set to Sans Serif |  | PASS |
| Product93 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Body Serif font selectable | Body/UI font options visible | Select 'Serif' (index 1) | The action is completed successfully as expected | Body font set to Serif |  | PASS |
| Product94 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Body Display font selectable | Body/UI font options visible | Select 'Display' (index 1) | The action is completed successfully as expected | Body font set to Display |  | PASS |
| Product95 | https://prodev.prosperna.ph/builder/product-1uvr | Verify Body Script font selectable | Body/UI font options visible | Select 'Script' (index 1) | The action is completed successfully as expected | Body font set to Script |  | PASS |

### 🔹 Categories

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Categories1 | https://prodev.prosperna.ph/home/category-listing | Verify user can open Categories page | User is logged in and has access to Categories module |  | User redirected to Categories page | Categories page loads successfully |  | PASS |
| Categories2 | https://prodev.prosperna.ph/home/category-listing | Verify user can create a main category | User is on Categories page and Create Category button is available | Click Create Category → Enter Category Name "TestCategory1" → Click Save → Verify success toast | Category created successfully | System shows "Successfully created main category." | New category record created | PASS |

### 🔹 Checkout

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Checkout1 | https://newstore.prodev.prosperna.ph | Verify user can open storefront homepage | User has access to the storefront URL |  | Homepage loads | Storefront homepage is displayed |  | PASS |
| Checkout2 | https://newstore.prodev.prosperna.ph | Verify user can select location, accept cookies, and add item to cart | User is on storefront homepage |  | Item added to cart | Cart contains the selected item | Cart item created in session/local storage | PASS |
| Checkout3 | https://newstore.prodev.prosperna.ph | Verify user can proceed from cart to checkout page | User has at least 1 item in cart |  | Checkout page opened | User is redirected to checkout details page |  | PASS |
| Checkout4 | https://newstore.prodev.prosperna.ph | Verify First Name field accepts input | User is on checkout details page | Fill First Name with "Ri" | First name saved | First Name field contains entered value |  | PASS |
| Checkout5 | https://newstore.prodev.prosperna.ph | Verify Last Name field accepts input | User is on checkout details page | Fill Last Name with "As" | Last name saved | Last Name field contains entered value |  | PASS |
| Checkout6 | https://newstore.prodev.prosperna.ph | Verify Email field accepts input | User is on checkout details page | Fill Email with "rian@prosperna.com" | Email saved | Email field contains entered value |  | PASS |
| Checkout7 | https://newstore.prodev.prosperna.ph | Verify Phone field accepts input after manual clearing | User is on checkout details page and phone input is visible | Click phone input → Ctrl+A → Backspace → Type "+63 9175 161141" with delay | Phone saved | Phone field contains entered value |  | PASS |
| Checkout8 | https://newstore.prodev.prosperna.ph | Verify Address, Region, City, Barangay, and Postal Code fields can be completed | User is on checkout details page and address fields are visible | Fill Address "test" → Select Metro Manila → Select Binondo → Select Barangay 287 → Fill Postal Code "1740" | Address saved | All address fields are populated successfully | Shipping address stored in checkout session/order draft | PASS |
| Checkout9 | https://newstore.prodev.prosperna.ph | Verify user can select shipping method and pin location | User is on shipping selection step | Select "Same Day Delivery" → Click "Pin location to map" | Shipping selected | Shipping method selected and location pin action triggered | Shipping selection stored in checkout session/order draft | PASS |
| Checkout10 | https://newstore.prodev.prosperna.ph | Verify GCash payment option can be selected and Pay Now proceeds | User is on payment step and e-wallet options are available |  | GCash payment initiated | GCash payment page/instructions are displayed | Payment intent created; pending payment state | PASS |
| Checkout11 | https://newstore.prodev.prosperna.ph | Verify GCash payment instructions are visible | User is on GCash payment screen |  | Instructions displayed | GCash payment instructions are shown |  | PASS |
| Checkout12 | https://newstore.prodev.prosperna.ph | Verify Credit/Debit Card payment can be selected and details can be submitted | User can reach checkout payment step | Re-run Checkout flow → Select Credit/Debit Card → Fill name/card number/MMYY/CVC → Click Submit | Card payment submitted | Card payment submission proceeds (success or gateway response) | Payment intent created; pending/processed depending on gateway response | PASS |
| Checkout13 | https://newstore.prodev.prosperna.ph | Verify Bank Transfer payment details are visible | User can reach checkout payment step |  | Bank transfer instructions visible | Bank transfer steps and bank details are displayed | Order/payment record may be created as awaiting bank transfer proof | PASS |
| Checkout14 | https://newstore.prodev.prosperna.ph | Verify Over the Counter payment option can be selected and provider details are visible | User can reach checkout payment step |  | OTC payment initiated | OTC payment provider details/options are displayed | Payment intent created; pending OTC payment | PASS |

### 🔹 Contacts

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Contact1 | https://prodev.prosperna.ph/home/lead-listings | Verify user can navigate to Lead Listings page | User is logged in and has access to Leads module |  | Lead listings opened | Lead Listings page loads successfully with leads table visible |  | PASS |
| Contact2 | https://prodev.prosperna.ph/home/lead-listings | Verify Contact ID column header is clickable (sorting) | User is on Lead Listings page | Click “Contact ID” column header | Sort triggered | Table sorting updates based on Contact ID |  | PASS |
| Contact3 | https://prodev.prosperna.ph/home/lead-listings | Verify First Name column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on First Name |  | PASS |
| Contact4 | https://prodev.prosperna.ph/home/lead-listings | Verify Last Name column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Last Name |  | PASS |
| Contact5 | https://prodev.prosperna.ph/home/lead-listings | Verify Customer Type column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Customer Type |  | PASS |
| Contact6 | https://prodev.prosperna.ph/home/lead-listings | Verify Email column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Email |  | PASS |
| Contact7 | https://prodev.prosperna.ph/home/lead-listings | Verify Mobile Number column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Mobile Number |  | PASS |
| Contact8 | https://prodev.prosperna.ph/home/lead-listings | Verify Source column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Source |  | PASS |
| Contact9 | https://prodev.prosperna.ph/home/lead-listings | Verify No. of Orders column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on No. of Orders |  | PASS |
| Contact10 | https://prodev.prosperna.ph/home/lead-listings | Verify Amount Spent column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Amount Spent |  | PASS |
| Contact11 | https://prodev.prosperna.ph/home/lead-listings | Verify Status column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Status |  | PASS |
| Contact12 | https://prodev.prosperna.ph/home/lead-listings | Verify Tags column header is clickable (sorting) | User is on Lead Listings page |  | Sort triggered | Table sorting updates based on Tags |  | PASS |
| Contact13 | https://prodev.prosperna.ph/home/lead-listings | Verify Actions column header is clickable (table interaction) | User is on Lead Listings page |  | Header interaction works | Actions column header responds to click (no UI errors) |  | PASS |
| Contact14 | https://prodev.prosperna.ph/home/lead-listings | Verify Lead Listings page can be reloaded/navigated again | User is logged in |  | Page reloaded | Lead Listings page loads successfully again |  | PASS |
| Contact15 | https://prodev.prosperna.ph/home/lead-listings | Verify user can open a Lead Profile page | User is logged in and has access to Leads module |  | Profile opened | Lead Profile page loads successfully |  | PASS |
| Contact16 | https://prodev.prosperna.ph/home/lead-listings | Verify Customer field/label is clickable/visible on profile | User is on Lead Profile page |  | Customer field accessible | Customer field/section is visible and interactable |  | PASS |
| Contact17 | https://prodev.prosperna.ph/home/lead-listings | Verify Source field/label is clickable/visible on profile | User is on Lead Profile page |  | Source field accessible | Source field/section is visible and interactable |  | PASS |
| Contact18 | https://prodev.prosperna.ph/home/lead-listings | Verify Last Order Date field/label is clickable/visible | User is on Lead Profile page |  | Last Order Date accessible | Last Order Date field/section is visible and interactable |  | PASS |
| Contact19 | https://prodev.prosperna.ph/home/lead-listings | Verify Status label is clickable/visible | User is on Lead Profile page |  | Status accessible | Status field/section is visible and interactable |  | PASS |
| Contact20 | https://prodev.prosperna.ph/home/lead-listings | Verify lead name is visible and selectable | User is on Lead Profile page |  | Name accessible | Lead name is visible and responds to click |  | PASS |
| Contact21 | https://prodev.prosperna.ph/home/lead-listings | Verify Store section can be accessed from profile | User is on Lead Profile page |  | Store section opened | Store section/details are displayed |  | PASS |
| Contact22 | https://prodev.prosperna.ph/home/lead-listings | Verify Last Order Date value is clickable (date value) | User is on Lead Profile page with last order value present |  | Date value accessible | Date value is visible and responds to click |  | PASS |
| Contact23 | https://prodev.prosperna.ph/home/lead-listings | Verify Status value “Verified” is clickable/visible | User is on Lead Profile page |  | Status value accessible | Status shows “Verified” and is interactable |  | PASS |
| Contact24 | https://prodev.prosperna.ph/home/lead-listings | Verify Email value is clickable/visible | User is on Lead Profile page | Click “rian@prosperna.com” | Email accessible | Email value is visible and responds to click |  | PASS |
| Contact25 | https://prodev.prosperna.ph/home/lead-listings | Verify Customer Type value “Individual” is clickable/visible | User is on Lead Profile page |  | Customer Type accessible | Customer Type value is visible and responds to click |  | PASS |
| Contact26 | https://prodev.prosperna.ph/home/lead-listings | Verify Assist Customers action is clickable | User is on Lead Profile page |  | Action initiated | Assist Customers action/menu responds without error |  | PASS |
| Contact27 | https://prodev.prosperna.ph/home/lead-listings | Verify Call-In Order action is clickable | User is on Lead Profile page |  | Action initiated | Call-In Order action/menu responds without error |  | PASS |
| Contact28 | https://prodev.prosperna.ph/home/lead-listings | Verify Reset Password action is clickable | User is on Lead Profile page |  | Action initiated | Reset Password flow/modal is triggered (if applicable) | Password reset event may be triggered depending on confirmation | PASS |
| Contact29 | https://prodev.prosperna.ph/home/lead-listings | Verify Order History tab is accessible | User is on Lead Profile page |  | Tab opened | Order History tab content is displayed |  | PASS |
| Contact30 | https://prodev.prosperna.ph/home/lead-listings | Verify Contact Details tab is accessible | User is on Lead Profile page | Click “Contact Details” tab | Tab opened | Contact Details content is displayed |  | PASS |
| Contact31 | https://prodev.prosperna.ph/home/lead-listings | Verify Contact Information section is accessible | User is on Contact Details tab | Click “Contact Information” heading | Section opened | Contact Information section expands/displays |  | PASS |
| Contact32 | https://prodev.prosperna.ph/home/lead-listings | Verify First Name field label/value is visible | User is on Contact Details tab | View “First Name” field | Field visible | First Name label/value is visible on page |  | PASS |
| Contact33 | https://prodev.prosperna.ph/home/lead-listings | Verify Last Name field label/value is visible | User is on Contact Details tab | View “Last Name” field | Field visible | Last Name label/value is visible on page |  | PASS |
| Contact34 | https://prodev.prosperna.ph/home/lead-listings | Verify Email field label/value is visible | User is on Contact Details tab | View “Email” field (secondary occurrence) | Field visible | Email label/value is visible on page |  | PASS |
| Contact35 | https://prodev.prosperna.ph/home/lead-listings | Verify Mobile Number field label/value is visible | User is on Contact Details tab |  | Field visible | Mobile Number label/value is visible on page |  | PASS |
| Contact36 | https://prodev.prosperna.ph/home/lead-listings | Verify Customer Type field is accessible | User is on Contact Details tab |  | Customer Type accessible | Customer Type field/section is visible and interactable |  | PASS |
| Contact37 | https://prodev.prosperna.ph/home/lead-listings | Verify Shipping Information section is accessible | User is on Contact Details tab |  | Section opened | Shipping Information section expands/displays |  | PASS |
| Contact38 | https://prodev.prosperna.ph/home/lead-listings | Verify Profile Summary section is accessible | User is on Contact Details tab |  | Section opened | Profile Summary section expands/displays |  | PASS |
| Contact39 | https://prodev.prosperna.ph/home/lead-listings | Verify Contact Highlights section is accessible | User is on Contact Details tab | Click “Contact Highlights” | Section opened | Contact Highlights content is visible |  | PASS |
| Contact40 | https://prodev.prosperna.ph/home/lead-listings | Verify Created Date field is accessible | User is on Contact Details tab |  | Field accessible | Created Date field/value is visible and interactable |  | PASS |
| Contact41 | https://prodev.prosperna.ph/home/lead-listings | Verify Last Seen field is accessible | User is on Contact Details tab |  | Field accessible | Last Seen field/value is visible and interactable |  | PASS |
| Contact42 | https://prodev.prosperna.ph/home/lead-listings | Verify Total No. of Orders field is accessible | User is on Contact Details tab |  | Field accessible | Total No. of Orders value is visible and interactable |  | PASS |
| Contact43 | https://prodev.prosperna.ph/home/lead-listings | Verify Total Amount Spent field is accessible | User is on Contact Details tab |  | Field accessible | Total Amount Spent value is visible and interactable |  | PASS |
| Contact44 | https://prodev.prosperna.ph/home/lead-listings | Verify Last Email field is accessible | User is on Contact Details tab | Click “Last Email” | Field accessible | Last Email field/value is visible and interactable |  | PASS |
| Contact45 | https://prodev.prosperna.ph/home/lead-listings | Verify Contact Tags section is accessible | User is on Contact Details tab | Click “Contact Tags” heading | Section opened | Contact Tags section expands/displays |  | PASS |

### 🔹 Dashboard Analytics

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| PDash3 | https://prodev.prosperna.ph/dashboard/analytics | Verify Sales widget is visible on Dashboard Analytics | User is logged in and has access to Dashboard Analytics | Navigate to Dashboard Analytics → Verify "SalesView" is visible | Sales widget displayed | Sales widget/section is visible |  | PASS |
| PDash4 | https://prodev.prosperna.ph/dashboard/analytics | Verify Orders widget is visible | User is on Dashboard Analytics | Verify "OrdersView" is visible | Orders widget displayed | Orders widget/section is visible |  | PASS |
| PDash5 | https://prodev.prosperna.ph/dashboard/analytics | Verify Unfulfilled Orders widget is visible | User is on Dashboard Analytics | Verify "Unfulfilled OrdersView" is visible | Unfulfilled orders widget displayed | Unfulfilled orders widget/section is visible |  | PASS |
| PDash6 | https://prodev.prosperna.ph/dashboard/analytics | Verify Daily Gross Sales widget is visible | User is on Dashboard Analytics | Verify "Daily Gross Sales" is visible | Daily gross sales displayed | Daily Gross Sales widget/section is visible |  | PASS |
| PDash7 | https://prodev.prosperna.ph/dashboard/analytics | Verify Total Sales widget is visible | User is on Dashboard Analytics | Verify "Total Sales" is visible | Total sales displayed | Total Sales widget/section is visible |  | PASS |
| PDash8 | https://prodev.prosperna.ph/dashboard/analytics | Verify Top Selling Products widget is visible | User is on Dashboard Analytics | Verify "Top Selling Products" is visible | Top selling products displayed | Top Selling Products widget/section is visible |  | PASS |
| PDash9 | https://prodev.prosperna.ph/dashboard/analytics | Verify WEBSITE VISITORS widget is visible | User is on Dashboard Analytics with Website Traffic report added/available | Verify "WEBSITE VISITORS" is visible | Website visitors displayed | WEBSITE VISITORS widget is visible |  | PASS |
| PDash10 | https://prodev.prosperna.ph/dashboard/analytics | Verify TOTAL USERS widget is visible | User is on Dashboard Analytics with Website Traffic report available | Verify "TOTAL USERS" is visible | Total users displayed | TOTAL USERS widget is visible |  | PASS |
| PDash11 | https://prodev.prosperna.ph/dashboard/analytics | Verify NEW USERS widget is visible | User is on Dashboard Analytics with Website Traffic report available | Verify "NEW USERS" is visible | New users displayed | NEW USERS widget is visible |  | PASS |
| PDash12 | https://prodev.prosperna.ph/dashboard/analytics | Verify MOST VISITED PRODUCT widget is visible | User is on Dashboard Analytics with Website Traffic report available | Verify "MOST VISITED PRODUCT" is visible | Most visited product displayed | MOST VISITED PRODUCT widget is visible |  | PASS |
| PDash13 | https://prodev.prosperna.ph/dashboard/analytics | Verify MOST VISITED BLOG widget is visible | User is on Dashboard Analytics with Website Traffic report available | Verify "MOST VISITED BLOG" is visible | Most visited blog displayed | MOST VISITED BLOG widget is visible |  | PASS |
| PDash14 | https://prodev.prosperna.ph/dashboard/analytics | Verify Website Traffic report can be removed via Add Reports toggle | User is on Dashboard Analytics and Website Traffic is currently enabled |  | Website Traffic toggled | WEBSITE VISITORS widget is removed/hidden after toggle | Report/widget preference updated | PASS |
| PDash15 | https://prodev.prosperna.ph/dashboard/analytics | Verify Sales by Product Type report shows Coming Soon modal | User is on Dashboard Analytics and Add Reports is available |  | Coming Soon displayed | Coming Soon modal is shown and can be dismissed |  | PASS |
| PDash16 | https://prodev.prosperna.ph/dashboard/analytics | Verify Sales by Product report shows Coming Soon modal | User is on Dashboard Analytics and Add Reports is available |  | Coming Soon displayed | Coming Soon modal is shown and can be dismissed |  | PASS |
| PDash17 | https://prodev.prosperna.ph/dashboard/analytics | Verify Sales by Coupon report shows Coming Soon modal | User is on Dashboard Analytics and Add Reports is available |  | Coming Soon displayed | Coming Soon modal is shown and can be dismissed |  | PASS |
| PDash18 | https://prodev.prosperna.ph/dashboard/analytics | Verify Max AI Assistant widget can be opened | User is on Dashboard Analytics |  | Max AI opened | Max AI Assistant panel/widget opens |  | PASS |
| PDash19 | https://prodev.prosperna.ph/dashboard/analytics | Verify Max AI welcome icon is visible | Max AI Assistant widget is opened |  | Icon displayed | Max AI welcome icon is visible |  | PASS |
| PDash20 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can send a message to Max AI | Max AI Assistant widget is opened | Enter message "What can you do?" → Click Send | Message sent | Max AI receives the message and conversation updates | Conversation/message stored (session/history depending on product) | PASS |
| PDash21 | https://prodev.prosperna.ph/dashboard/analytics | Verify Max AI options dropdown can be opened | Max AI Assistant widget is opened |  | Dropdown opened | Max AI options dropdown is displayed |  | PASS |
| PDash22 | https://prodev.prosperna.ph/dashboard/analytics | Verify Max AI dropdown options are visible | Max AI options dropdown is open |  | Options displayed | All expected options are visible |  | PASS |
| PDash23 | https://prodev.prosperna.ph/dashboard/analytics | Verify Product List view and product search are accessible inside Max AI | Max AI panel is open and Product List option is available | Verify "Product List" text visible → Verify max-ai-product-search-input visible → Verify product "Product 1UVR" visible | Product list displayed | Product list and search input are displayed inside Max AI |  | PASS |

### 🔹 Design Settings

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| PAICred16 | https://prodev.prosperna.ph/home/design-settings | Verify Store Logo appears in Design Settings | Logo and favicon are applied |  | Logo visible | Store Logo is visible in Design Settings |  | PASS |
| Design1 | https://prodev.prosperna.ph/home/design-settings | Verify user can open Design Settings page | User is logged in and has access to Design Settings |  | Design Settings opened | Design Settings page loads successfully |  | PASS |
| Design2 | https://prodev.prosperna.ph/home/design-settings | Verify Home Page tab is accessible | User is on Design Settings page |  | Home Page tab opened | Home Page tab content is displayed |  | PASS |
| Design3 | https://prodev.prosperna.ph/home/design-settings | Verify Store Information tab is accessible | User is on Design Settings page |  | Store Information tab opened | Store Information tab content is displayed |  | PASS |
| Design4 | https://prodev.prosperna.ph/home/design-settings | Verify Social Media tab is accessible | User is on Design Settings page |  | Social Media tab opened | Social Media tab content is displayed |  | PASS |
| Design5 | https://prodev.prosperna.ph/home/design-settings | Verify Store Branding section is accessible | User is on Design Settings page |  | Store Branding opened | Store Branding section content is displayed |  | PASS |
| Design6 | https://prodev.prosperna.ph/home/design-settings | Verify Store Branding carousel can move to next slide | User is on Store Branding section |  | Carousel advanced | Next slide content is shown |  | PASS |
| Design7 | https://prodev.prosperna.ph/home/design-settings | Verify Colors & Style section is accessible | User is on Design Settings page |  | Colors & Style opened | Colors & Style section content is displayed |  | PASS |
| Design8 | https://prodev.prosperna.ph/home/design-settings | Verify Colors & Style carousel can move to next slide | User is on Colors & Style section |  | Carousel advanced | Next slide content is shown |  | PASS |
| Design9 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy section is accessible from left menu | User is on Design Settings page |  | Cookie Policy opened | Cookie Policy section content is displayed |  | PASS |
| Design10 | https://prodev.prosperna.ph/home/design-settings | Verify Home Page tab can be reopened from fresh navigation | User is logged in and has access to Design Settings |  | Home Page tab opened | Home Page tab content is displayed |  | PASS |
| Design11 | https://prodev.prosperna.ph/home/design-settings | Verify “Select Your Home Page” section is visible | User is on Home Page tab |  | Section visible | Select Your Home Page area is visible |  | PASS |
| Design12 | https://prodev.prosperna.ph/home/design-settings | Verify Home Page help tooltip is available | User is on Home Page tab |  | Tooltip visible | Tooltip text is displayed successfully |  | PASS |
| Design13 | https://prodev.prosperna.ph/home/design-settings | Verify Custom Homepage toggle can be toggled and shows success message | User is on Home Page tab |  | Home page setting updated | Success message “Successfully set Products as …” appears | Homepage preference saved | PASS |
| Design14 | https://prodev.prosperna.ph/home/design-settings | Verify Store Information tab can be opened | User is logged in and has access to Design Settings |  | Store Information opened | Store Information tab content is displayed |  | PASS |
| Design15 | https://prodev.prosperna.ph/home/design-settings | Verify Store Name can be updated | User is on Store Information tab |  | Name updated | Field value updated successfully | None until Save | PASS |
| Design16 | https://prodev.prosperna.ph/home/design-settings | Verify Business Category can be selected | User is on Store Information tab |  | Business category selected | Selected category is applied in UI | None until Save | PASS |
| Design17 | https://prodev.prosperna.ph/home/design-settings | Verify Store Slogan can be updated | User is on Store Information tab | Fill Store Slogan with “test” | Slogan updated | Field value updated successfully | None until Save | PASS |
| Design18 | https://prodev.prosperna.ph/home/design-settings | Verify Store Description can be updated | User is on Store Information tab | Fill Store Description with “Hey! Check out my online store!” | Description updated | Field value updated successfully | None until Save | PASS |
| Design19 | https://prodev.prosperna.ph/home/design-settings | Verify Store Information can be saved | User is on Store Information tab with changes made |  | Save initiated | Store Information save request is submitted | Store profile updated | PASS |
| Design20 | https://prodev.prosperna.ph/home/design-settings | Verify Store Information update success message appears | User saved Store Information |  | Update confirmed | Success message is displayed | Store profile updated | PASS |
| Design21 | https://prodev.prosperna.ph/home/design-settings | Verify Facebook social link can be updated | User is on Social Media tab | Open Facebook → Fill URL https://www.facebook.com/ → Save → Verify success toast | Facebook link saved | Social media link successfully updated message appears | Social link stored to store profile | PASS |
| Design22 | https://prodev.prosperna.ph/home/design-settings | Verify Instagram social link can be updated | User is on Social Media tab | Open Instagram → Fill URL https://www.instagram.com/ → Save → Verify success toast | Instagram link saved | Social media link successfully updated message appears | Social link stored to store profile | PASS |
| Design23 | https://prodev.prosperna.ph/home/design-settings | Verify X/Twitter social link can be updated | User is on Social Media tab | Open X → Fill URL https://www.x.com/ → Save → Verify success toast | X link saved | Social media link successfully updated message appears | Social link stored to store profile | PASS |
| Design24 | https://prodev.prosperna.ph/home/design-settings | Verify LinkedIn social link can be updated | User is on Social Media tab | Open LinkedIn → Fill URL https://www.linkedin.com/ → Save → Verify success toast | LinkedIn link saved | Social media link successfully updated message appears | Social link stored to store profile | PASS |
| Design25 | https://prodev.prosperna.ph/home/design-settings | Verify TikTok social link can be updated | User is on Social Media tab | Open Tiktok → Fill URL https://www.tiktok.com/ → Save → Verify success toast | TikTok link saved | Social media link successfully updated message appears | Social link stored to store profile | PASS |
| Design26 | https://prodev.prosperna.ph/home/design-settings | Verify Store Logo & Favicon section is accessible | User is on Design Settings page |  | Section opened | Store Logo & Favicon section is displayed |  | PASS |
| Design27 | https://prodev.prosperna.ph/home/design-settings | Verify Store Logo tab is accessible | User is on Store Logo & Favicon section |  | Store Logo tab opened | Store Logo content is displayed |  | PASS |
| Design28 | https://prodev.prosperna.ph/home/design-settings | Verify Favicon tab is accessible | User is on Store Logo & Favicon section |  | Favicon tab opened | Favicon content is displayed |  | PASS |
| Design29 | https://prodev.prosperna.ph/home/design-settings | Verify Social Media Share Image tab is accessible | User is on Store Logo & Favicon section |  | Tab opened | Social Media Share Image content is displayed |  | PASS |
| Design30 | https://prodev.prosperna.ph/home/design-settings | Verify Social Media Share Image Preview can be opened | User is on Social Media Share Image tab |  | Preview opened | Preview modal/view opens successfully |  | PASS |
| Design31 | https://prodev.prosperna.ph/home/design-settings | Verify Store Background tab is accessible | User is on Store Branding area |  | Tab opened | Store Background content is displayed |  | PASS |
| Design32 | https://prodev.prosperna.ph/home/design-settings | Verify Store Background Preview can be opened | User is on Store Background tab |  | Preview opened | Preview modal/view opens successfully |  | PASS |
| Design33 | https://prodev.prosperna.ph/home/design-settings | Verify Cover Photo section is accessible | User is on Store Branding area |  | Cover Photo opened | Cover Photo section is displayed |  | PASS |
| Design34 | https://prodev.prosperna.ph/home/design-settings | Verify “Display across all store” option can be selected | User is on Cover Photo section |  | Option selected | Display across all store selection is applied | None until Save | PASS |
| Design35 | https://prodev.prosperna.ph/home/design-settings | Verify store location selector can be opened | User is on Cover Photo section | Click “Select store location and …” | Selector opened | Store location selector UI is displayed |  | PASS |
| Design36 | https://prodev.prosperna.ph/home/design-settings | Verify Cover Photo Default (Desktop) can be selected per location | User is on store location selector and Laguna Branch exists |  | Variant selected | Cover photo variant is selected for location | None until Save | PASS |
| Design37 | https://prodev.prosperna.ph/home/design-settings | Verify Cover Photo (Desktop - Wide) can be selected per location | User is on store location selector and Laguna Branch exists |  | Variant selected | Cover photo variant is selected for location | None until Save | PASS |
| Design38 | https://prodev.prosperna.ph/home/design-settings | Verify Cover Photo (Mobile) can be selected per location | User is on store location selector and Laguna Branch exists | Select Laguna Branch → Choose Cover Photo (Mobile) | Variant selected | Cover photo variant is selected for location | None until Save | PASS |
| Design39 | https://prodev.prosperna.ph/home/design-settings | Verify Colors & Style tab is accessible | User is on Design Settings page |  | Tab opened | Colors & Style tab content is displayed |  | PASS |
| Design40 | https://prodev.prosperna.ph/home/design-settings | Verify Color Settings modal/section can be opened | User is on Colors & Style tab |  | Color Settings opened | Color Settings UI is displayed |  | PASS |
| Design41 | https://prodev.prosperna.ph/home/design-settings | Verify Color Palettes section is accessible | User is in Color Settings |  | Section opened | Color palette options are visible |  | PASS |
| Design42 | https://prodev.prosperna.ph/home/design-settings | Verify user can select Default color palette | User is in Color Palettes |  | Default palette selected | Palette selection updates to Default | None until Save | PASS |
| Design43 | https://prodev.prosperna.ph/home/design-settings | Verify Primary and Secondary color pickers are accessible | User is in Color Settings |  | Colors opened | Primary and Secondary color controls open |  | PASS |
| Design44 | https://prodev.prosperna.ph/home/design-settings | Verify Primary and Secondary Text Color controls are accessible | User is in Color Settings |  | Text colors opened | Text color controls are accessible |  | PASS |
| Design45 | https://prodev.prosperna.ph/home/design-settings | Verify Background Color control is accessible | User is in Color Settings |  | Background color opened | Background color control is accessible |  | PASS |
| Design46 | https://prodev.prosperna.ph/home/design-settings | Verify Headings/Subheadings/Body/Footer typography section can be opened | User is in Colors & Style |  | Typography opened | Headings typography settings are visible |  | PASS |
| Design47 | https://prodev.prosperna.ph/home/design-settings | Verify Headings Font Family and Text Decoration controls are accessible | User is in Headings settings |  | Controls opened | Font family and decoration controls are accessible |  | PASS |
| Design48 | https://prodev.prosperna.ph/home/design-settings | Verify Headings font family can be set to Roboto (Default) | User is in Headings settings |  | Font applied | Headings font family updates to Roboto (Default) | None until Save | PASS |
| Design49 | https://prodev.prosperna.ph/home/design-settings | Verify Headings Font Size and Font Weight controls are accessible | User is in Headings settings |  | Controls opened | Font size and weight controls are accessible |  | PASS |
| Design50 | https://prodev.prosperna.ph/home/design-settings | Verify Subheadings settings can be opened | User is in typography settings |  | Subheadings opened | Subheadings settings are visible |  | PASS |
| Design51 | https://prodev.prosperna.ph/home/design-settings | Verify Subheadings Text Decoration and Weight controls are accessible | User is in Subheadings settings |  | Controls opened | Decoration and weight controls are accessible |  | PASS |
| Design52 | https://prodev.prosperna.ph/home/design-settings | Verify Body settings can be opened and Family/Decoration controls accessed | User is in typography settings |  | Body opened | Body settings are visible and controls accessible |  | PASS |
| Design53 | https://prodev.prosperna.ph/home/design-settings | Verify Body Font Size and Weight controls are accessible | User is in Body settings |  | Controls opened | Font size and weight controls are accessible |  | PASS |
| Design54 | https://prodev.prosperna.ph/home/design-settings | Verify Footer settings can be opened and Family/Color controls accessed | User is in typography settings |  | Footer opened | Footer settings controls are accessible |  | PASS |
| Design55 | https://prodev.prosperna.ph/home/design-settings | Verify Footer Size/Decoration/Weight/Background controls are accessible | User is in Footer settings |  | Controls opened | Footer styling controls are accessible |  | PASS |
| Design56 | https://prodev.prosperna.ph/home/design-settings | Verify Button Settings can be opened | User is on Colors & Style tab |  | Button settings opened | Button Settings UI is displayed |  | PASS |
| Design57 | https://prodev.prosperna.ph/home/design-settings | Verify Button Font Family and Background Color controls are accessible | User is in Button settings (Button section) |  | Controls opened | Button font family and background controls accessible |  | PASS |
| Design58 | https://prodev.prosperna.ph/home/design-settings | Verify Button style controls (size/style/weight/border/color) are accessible | User is in Button settings (Button section) |  | Controls opened | Button style controls are accessible |  | PASS |
| Design59 | https://prodev.prosperna.ph/home/design-settings | Verify Button Hover controls can be opened | User is in Button settings |  | Hover controls opened | Hover font and background controls accessible |  | PASS |
| Design60 | https://prodev.prosperna.ph/home/design-settings | Verify Button Hover controls (size/style/weight/border/color) are accessible | User is in Button settings (Hover) |  | Controls opened | Hover styling controls are accessible |  | PASS |
| Design61 | https://prodev.prosperna.ph/home/design-settings | Verify Category Settings can be opened | User is on Colors & Style tab |  | Category settings opened | Category Settings UI is displayed |  | PASS |
| Design62 | https://prodev.prosperna.ph/home/design-settings | Verify Category Text Position and Background Color controls are accessible | User is in Category Settings |  | Controls opened | Category text and background controls accessible |  | PASS |
| Design63 | https://prodev.prosperna.ph/home/design-settings | Verify Link typography settings controls are accessible | User is in Category Settings |  | Controls opened | All Link controls are accessible |  | PASS |
| Design64 | https://prodev.prosperna.ph/home/design-settings | Verify Link Hover typography settings controls are accessible | User is in Category Settings |  | Controls opened | All Link Hover controls are accessible |  | PASS |
| Design65 | https://prodev.prosperna.ph/home/design-settings | Verify Active Link typography settings controls are accessible | User is in Category Settings |  | Controls opened | All Active Link controls are accessible |  | PASS |
| Design66 | https://prodev.prosperna.ph/home/design-settings | Verify Image Display Style settings are accessible | User is in Category Settings or relevant section |  | Image display style opened | Image Display Style controls are accessible |  | PASS |
| Design67 | https://prodev.prosperna.ph/home/design-settings | Verify store design settings can be saved | User has changed design settings |  | Save successful | Store design settings successfully updated message appears | Design settings stored/persisted | PASS |
| Design68 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy tab is accessible | User is on Design Settings page |  | Cookie Policy opened | Cookie Policy tab content is displayed |  | PASS |
| Design69 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy section is accessible inside tab | User is on Cookie Policy tab |  | Cookie policy section opened | Cookie policy configuration area is visible |  | PASS |
| Design70 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy Mode and Policy Link controls are accessible | User is on Cookie Policy section |  | Controls opened | Mode and policy link controls are accessible |  | PASS |
| Design71 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy toggle can be enabled | User is on Cookie Policy section |  | Cookie policy enabled | Toggle is enabled successfully | None until Save | PASS |
| Design72 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy theme can be switched between Light/Dark | User is on Cookie Policy section |  | Dark mode selected | Dark theme is selected successfully | None until Save | PASS |
| Design73 | https://prodev.prosperna.ph/home/design-settings | Verify Policy Link URL can be entered | User is on Cookie Policy section | Fill policy_link with https://google.com/ | URL entered | Policy link field contains the URL | None until Save | PASS |
| Design74 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy settings can be saved and re-edited | User is on Cookie Policy section with changes made | Click Save (optional) → Verify “Settings successfully updated.” (optional) → Re-open Cookie Policy tab → Toggle Light/Dark → Update policy_link to https://google.com/123 → Save | Settings updated | Cookie policy settings save successfully and accept subsequent edits | Cookie policy settings stored/persisted | PASS |
| Design75 | https://prodev.prosperna.ph/home/design-settings | Verify adding/removing YouTube social platform works | User is on Social Media tab | Click Add Social Media Platform → Select YouTube → Fill URL → Save → Remove entry → Save | Add/remove successful | YouTube platform can be added and removed successfully | Social links updated | PASS |
| Design76 | https://prodev.prosperna.ph/home/design-settings | Verify adding/removing Pinterest social platform works | User is on Social Media tab | Click Add Social Media Platform → Select Pinterest → Fill URL → Save → Remove entry → Save | Add/remove successful | Pinterest platform can be added and removed successfully | Social links updated | PASS |
| Design77 | https://prodev.prosperna.ph/home/design-settings | Verify adding/removing Discord social platform works | User is on Social Media tab | Click Add Social Media Platform → Select Discord → Fill URL → Save → Remove entry → Save | Add/remove successful | Discord platform can be added and removed successfully | Social links updated | PASS |
| Design78 | https://prodev.prosperna.ph/home/design-settings | Verify adding/removing Snapchat social platform works | User is on Social Media tab | Click Add Social Media Platform → Select Snapchat → Fill URL → Save → Remove entry → Save | Add/remove successful | Snapchat platform can be added and removed successfully | Social links updated | PASS |
| Design79 | https://prodev.prosperna.ph/home/design-settings | Verify Home Page toggle help text is visible | User is on Home Page tab |  | Help text visible | Home page toggle description text is displayed |  | PASS |
| Design80 | https://prodev.prosperna.ph/home/design-settings | Verify Home Page toggle switch changes state and shows success toast | User is on Home Page tab |  | Toggle works | Success message “Successfully set Products as …” appears | Homepage preference saved | PASS |
| Design81 | https://prodev.prosperna.ph/home/design-settings | Verify Custom Home Page dropdown can be opened | User is on Home Page tab |  | Dropdown opened | Homepage dropdown options are accessible |  | PASS |
| Design82 | https://prodev.prosperna.ph/home/design-settings | Verify user can select Mint palette and save color settings | User is on Colors & Style → Color Settings |  | Color settings saved | Save action succeeds for Mint palette | Design settings updated | PASS |
| Design83 | https://prodev.prosperna.ph/home/design-settings | Verify success toast appears after saving Mint palette | User saved color settings | Verify “Store design settings successfully updated” toast | Toast displayed | Success message displayed |  | PASS |
| Design84 | https://prodev.prosperna.ph/home/design-settings | Verify Headings/Subheadings/Body/Footer settings section can be opened | User is on Colors & Style tab |  | Section opened | Typography settings are displayed |  | PASS |
| Design85 | https://prodev.prosperna.ph/home/design-settings | Verify Headings font family can be set to Sources Sans Pro | User is in Headings typography settings |  | Font applied | Headings font family updates to Sources Sans Pro | None until Save | PASS |
| Design86 | https://prodev.prosperna.ph/home/design-settings | Verify Headings font size can be set to 8 | User is in Headings typography settings |  | Size applied | Headings font size updates to 8 | None until Save | PASS |
| Design87 | https://prodev.prosperna.ph/home/design-settings | Verify Headings font weight can be set to Light | User is in Headings typography settings |  | Weight applied | Headings font weight updates to Light | None until Save | PASS |
| Design88 | https://prodev.prosperna.ph/home/design-settings | [run:False] Verify Headings text decoration controls can be applied | User is in Headings typography settings |  | Decoration applied | Text decoration style changes accordingly | None until Save | PASS |
| Design89 | https://prodev.prosperna.ph/home/design-settings | Verify Subheadings font family can be set to Sources Sans Pro | User is in Subheadings settings |  | Font applied | Subheadings font family updates successfully | None until Save | PASS |
| Design90 | https://prodev.prosperna.ph/home/design-settings | Verify Subheadings font size can be set to 9 | User is in Subheadings settings |  | Size applied | Subheadings font size updates successfully | None until Save | PASS |
| Design91 | https://prodev.prosperna.ph/home/design-settings | [run:False] Verify Subheadings text decoration controls can be applied | User is in Subheadings settings |  | Decoration applied | Text decoration style changes accordingly | None until Save | PASS |
| Design92 | https://prodev.prosperna.ph/home/design-settings | Verify Body font family can be set to Sources Sans Pro | User is in Body settings |  | Font applied | Body font family updates successfully | None until Save | PASS |
| Design93 | https://prodev.prosperna.ph/home/design-settings | Verify Body font size can be set to 9 | User is in Body settings |  | Size applied | Body font size updates successfully | None until Save | PASS |
| Design94 | https://prodev.prosperna.ph/home/design-settings | [run:False] Verify Body text decoration controls can be applied | User is in Body settings |  | Decoration applied | Text decoration style changes accordingly | None until Save | PASS |
| Design95 | https://prodev.prosperna.ph/home/design-settings | Verify Font Color section font family can be set | User is in typography settings (Font Color area) |  | Font applied | Font family applied successfully for this section | None until Save | PASS |
| Design96 | https://prodev.prosperna.ph/home/design-settings | [run:False] Verify Font Color section decoration controls can be applied | User is in Font Color section |  | Decoration applied | Decoration toggles apply successfully | None until Save | PASS |
| Design97 | https://prodev.prosperna.ph/home/design-settings | Verify Cookie Policy preview displays expected content | User is on Cookie Policy tab |  | Content visible | Cookie policy preview is displayed correctly |  | PASS |
| Design98 | https://prodev.prosperna.ph/home/design-settings | Verify Button Settings modal can be opened | User is on Colors & Style tab |  | Button settings opened | Button Settings UI is displayed |  | PASS |
| Design99 | https://prodev.prosperna.ph/home/design-settings | Verify Button section is selectable inside Button Settings | User is in Button Settings |  | Button section opened | Button section content is displayed |  | PASS |
| Design100 | https://prodev.prosperna.ph/home/design-settings | Verify primary button font can be set to Sources Sans Pro | User is in Button section |  | Font applied | Button font updates to Sources Sans Pro | None until Save | PASS |
| Design101 | https://prodev.prosperna.ph/home/design-settings | Verify primary button font size can be set to 8 | User is in Button section |  | Size applied | Button font size updates to 8 | None until Save | PASS |
| Design102 | https://prodev.prosperna.ph/home/design-settings | Verify primary button border style can be set to Rounded | User is in Button section |  | Border style applied | Button border style updates to Rounded | None until Save | PASS |
| Design103 | https://prodev.prosperna.ph/home/design-settings | Verify primary button font weight can be set to Normal | User is in Button section |  | Weight applied | Button font weight updates to Normal | None until Save | PASS |
| Design104 | https://prodev.prosperna.ph/home/design-settings | Verify primary button border icon style 1 can be selected | User is in Button section |  | Border icon selected | First border icon style is applied | None until Save | PASS |
| Design105 | https://prodev.prosperna.ph/home/design-settings | Verify primary button border icon style 2 can be selected | User is in Button section |  | Border icon selected | Second border icon style is applied | None until Save | PASS |
| Design106 | https://prodev.prosperna.ph/home/design-settings | Verify primary button border icon style 3 can be selected | User is in Button section |  | Border icon selected | Third border icon style is applied | None until Save | PASS |
| Design107 | https://prodev.prosperna.ph/home/design-settings | Verify secondary button font can be set to Bayon | User is in secondary button settings area |  | Font applied | Secondary button font updates to Bayon | None until Save | PASS |
| Design108 | https://prodev.prosperna.ph/home/design-settings | Verify secondary button font size can be set to 10 | User is in secondary button settings area |  | Size applied | Secondary button font size updates to 10 | None until Save | PASS |
| Design109 | https://prodev.prosperna.ph/home/design-settings | Verify secondary button border style can be set to Capsule | User is in secondary button settings area |  | Border style applied | Secondary button border style updates to Capsule | None until Save | PASS |
| Design110 | https://prodev.prosperna.ph/home/design-settings | Verify secondary button font weight can be set to Light | User is in secondary button settings area |  | Weight applied | Secondary button weight updates to Light | None until Save | PASS |
| Design111 | https://prodev.prosperna.ph/home/design-settings | Verify secondary button text decoration border option 2 can be selected | User is in secondary button decoration settings |  | Decoration selected | Text decoration border option is applied | None until Save | PASS |
| Design112 | https://prodev.prosperna.ph/home/design-settings | Verify secondary button text decoration border option 3 can be selected | User is in secondary button decoration settings |  | Decoration selected | Text decoration border option is applied | None until Save | PASS |
| Design113 | https://prodev.prosperna.ph/home/design-settings | Verify secondary button border style can be set to Dashed Line | User is in secondary button border settings |  | Border selected | Dashed Line border style is applied | None until Save | PASS |
| Design114 | https://prodev.prosperna.ph/home/design-settings | Verify Button settings changes can be saved (placeholder) | User modified button settings |  | Settings saved | Button settings persist after save | Design settings updated | PASS |

### 🔹 Digital Product Payment

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Digital1 | https://prodev.prosperna.ph/home/settings/digital | Verify user can navigate to Digital Product Payment settings page | User is logged in and has access to Settings |  | Digital settings opened | Digital Product Payment settings page loads successfully |  | PASS |
| Digital2 | https://prodev.prosperna.ph/home/settings/digital | Verify Digital Product Payment link opens the Payment settings | User is on Digital settings page |  | Payment settings opened | Digital Product Payment settings section is displayed |  | PASS |
| Digital3 | https://prodev.prosperna.ph/home/settings/digital | Verify Payment Options heading is visible and clickable | User is on Digital Product Payment settings page |  | Heading accessible | Payment Options section/heading responds and remains visible |  | PASS |
| Digital4 | https://prodev.prosperna.ph/home/settings/digital | Verify instruction text “Choose at least one:” is visible | User is on Digital Product Payment settings page | Click/inspect "Choose at least one:" text | Instruction visible | Instruction text is displayed correctly |  | PASS |
| Digital5 | https://prodev.prosperna.ph/home/settings/digital | Verify Credit Card option can be enabled | User is on Digital Product Payment settings page |  | Credit Card enabled | Credit Card payment option is selected | None until Save | PASS |
| Digital6 | https://prodev.prosperna.ph/home/settings/digital | Verify Credit Card option can be disabled | Credit Card option is enabled |  | Credit Card disabled | Credit Card payment option is unselected | None until Save | PASS |
| Digital7 | https://prodev.prosperna.ph/home/settings/digital | Verify Credit Card option can be re-enabled | Credit Card option is disabled |  | Credit Card re-enabled | Credit Card payment option is selected again | None until Save | PASS |
| Digital8 | https://prodev.prosperna.ph/home/settings/digital | Verify E-wallets option can be disabled | E-wallets option is enabled by default or currently enabled |  | E-wallets disabled | E-wallets payment option is unselected | None until Save | PASS |
| Digital9 | https://prodev.prosperna.ph/home/settings/digital | Verify E-wallets option can be enabled | E-wallets option is disabled |  | E-wallets enabled | E-wallets payment option is selected | None until Save | PASS |
| Digital10 | https://prodev.prosperna.ph/home/settings/digital | Verify Over the Counter option can be disabled | Over the Counter option is enabled by default or currently enabled |  | OTC disabled | Over the Counter payment option is unselected | None until Save | PASS |
| Digital11 | https://prodev.prosperna.ph/home/settings/digital | Verify Over the Counter option can be enabled | Over the Counter option is disabled |  | OTC enabled | Over the Counter payment option is selected | None until Save | PASS |
| Digital12 | https://prodev.prosperna.ph/home/settings/digital | Verify payment option changes can be saved | User has modified one or more payment options | Click "Save" | Save successful | Settings save request is submitted successfully | Digital payment options persisted to store settings | PASS |
| Digital13 | https://prodev.prosperna.ph/home/settings/digital | Verify success message appears after saving settings | User clicked Save and backend processed update |  | Update confirmed | Success message is displayed confirming update | Settings update recorded | PASS |

### 🔹 Discounts

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Generate with AI

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| PAICred4 | https://prodev.prosperna.ph/home/design-settings | Verify navigation to Generate with AI section | User is on Store Logo page |  | Generate with AI page opens | Generate with AI options are displayed |  | PASS |
| PAICred5 | https://prodev.prosperna.ph/home/design-settings | Verify logo style selection | User is on Generate with AI page |  | Style selection accepted | Selected logo styles are applied | Possible branding preference update | PASS |
| PAICred6 | https://prodev.prosperna.ph/home/design-settings | Verify color scheme selection | User is on color selection step |  | Color selection accepted | Color scheme options are applied |  | PASS |
| PAICred7 | https://prodev.prosperna.ph/home/design-settings | Verify submission of design preferences | User completed style and color selection | Click Skip, select Timeless style | Preferences submitted | Preparing for launch screen is displayed | Design preferences saved | PASS |
| PAICred8 | https://prodev.prosperna.ph/home/design-settings | Verify AI-generated logo display | AI logo generation is complete |  | AI logo displayed successfully | AI-generated logo is visible | Logo asset stored | PASS |
| PAICred9 | https://prodev.prosperna.ph/home/design-settings | Verify logo asset generation | AI-generated logo is visible |  | Asset generation starts | Generating Logo Assets message appears | Logo assets created | PASS |
| PAICred10 | https://prodev.prosperna.ph/home/design-settings | Verify Wordmark and Favicon visibility | Logo assets generated |  | Assets displayed | Wordmark and Favicon sections are visible |  | PASS |
| PAICred11 | https://prodev.prosperna.ph/home/design-settings | Verify logo regeneration | User is on logo results page |  | Regeneration starts | Logo regeneration and asset generation initiated | Assets updated | PASS |
| PAICred12 | https://prodev.prosperna.ph/home/design-settings | Verify new logo and assets display | Regeneration completed |  | New logo displayed | New AI-generated logo and assets are visible | Assets replaced | PASS |
| PAICred13 | https://prodev.prosperna.ph/home/design-settings | Verify logo regeneration success | User can regenerate logo |  | Logo regenerated | Successfully regenerated logo is visible | Logo updated | PASS |
| PAICred14 | https://prodev.prosperna.ph/home/design-settings | Verify logo asset regeneration | User has regenerated logo |  | Assets regenerated | Successfully generated logo assets | Assets updated | PASS |
| PAICred15 | https://prodev.prosperna.ph/home/design-settings | Verify apply logo and favicon | Logo assets available |  | Branding applied | Logo and favicon applied successfully | Active branding updated | PASS |

### 🔹 Get Help

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Inventory - Edit Product

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product108 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify variants panel can be opened and x-icon clickable | User can access edit product URL |  | The page or section opens successfully | UI responds to x-icon click (e.g., closes tooltip/modal) |  | PASS |

### 🔹 Inventory - Multilocation

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product150 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Add Qty button opens multilocation inventory | Variant row selected |  | The page or section opens successfully | Multilocation inventory panel opens |  | PASS |
| Product151 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Multilocation Inventory heading visible | Multilocation panel open | Click heading 'Multilocation Inventory' | The action is completed successfully as expected | Panel/section displayed |  | PASS |
| Product152 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Store Name column header clickable | Multilocation table visible |  | The action is completed successfully as expected | Header responds/sorts |  | PASS |
| Product153 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Qty column header clickable | Multilocation table visible |  | The action is completed successfully as expected | Header responds/sorts |  | PASS |
| Product154 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify location row (Laguna Branch) clickable | Multilocation table visible |  | The action is completed successfully as expected | Row selected/expanded |  | PASS |
| Product155 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Update button clickable for location | Location row selected |  | The field accepts and saves the entered value correctly | Update form/modal opens |  | PASS |
| Product156 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Length can be filled for variant/location | Update form open | Length="1" | The field accepts and saves the entered value correctly | Length updated in form |  | PASS |
| Product157 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Width can be filled for variant/location | Update form open | Width="2" | The field accepts and saves the entered value correctly | Width updated in form |  | PASS |
| Product158 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Height can be filled for variant/location | Update form open | Height="3" | The field accepts and saves the entered value correctly | Height updated in form |  | PASS |
| Product159 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Weight can be filled for variant/location | Update form open | Weight="1" | The field accepts and saves the entered value correctly | Weight updated in form |  | PASS |
| Product160 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Price can be filled for variant/location | Update form open | Price="123.01" | The field accepts and saves the entered value correctly | Price updated in form |  | PASS |
| Product161 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Save persists multilocation updates | Update form open | Click button 'Save' | The field accepts and saves the entered value correctly | Updates are saved successfully | May update variant inventory/pricing records | PASS |
| Product162 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify success message after updating product (if shown) | Save action performed | Verify text "Successfully updated product." | The action is completed successfully as expected | Success confirmation is displayed |  | PASS |
| Product163 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify final Save click completes without error | User still in edit product context |  | Changes are saved successfully | Final save completes | May persist final state | PASS |

### 🔹 Inventory - Products

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product1 | https://prodev.prosperna.ph/home/inventory-listing | Verify user can navigate to Inventory Listing (Products) page | User is logged in and has access to Inventory module | `env={"dev"|"product"}`  | The page or section opens successfully | Inventory listing page loads successfully |  | PASS |
| Product2 | https://prodev.prosperna.ph/home/inventory-listing | Verify user can start Add Physical Product flow from Inventory listing | User is on Inventory listing page |  | The action is completed successfully as expected | Physical Product creation form/workflow opens |  | PASS |
| Product3 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify Product Title can be filled | User is in Add Physical Product form | Product Title="Test2" | The field accepts and saves the entered value correctly | Product Title is entered successfully |  | PASS |
| Product4 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify first product option checkbox can be checked | User is in Add Physical Product form |  | The option state is updated successfully | Checkbox becomes checked |  | PASS |
| Product5 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify Brand field can be filled | User is in Add Physical Product form | brand="Your Brand" | The field accepts and saves the entered value correctly | Brand value is entered successfully |  | PASS |
| Product6 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify Primary Category can be selected | User is in Add Physical Product form | Primary Category="Coffee" | The action is completed successfully as expected | Primary Category is selected successfully |  | PASS |
| Product7 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify Short Description can be filled | User is in Add Physical Product form | Short Description="Test2" | The field accepts and saves the entered value correctly | Short Description is entered successfully |  | PASS |
| Product8 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify long description editor accepts input | User is in Add Physical Product form | Description (Quill .ql-editor)="Test2" | The action is completed successfully as expected | Rich text description is populated |  | PASS |
| Product9 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify product image can be selected from media picker | User is in Add Physical Product form and media picker is available | Search media="coffee"; select "A_small_cup_of_coffe..."; click Select | The action is completed successfully as expected | Image is attached/selected for product |  | PASS |
| Product10 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify price and dimension fields can be filled | User is in Add Physical Product form | price=100; length=1; width=1; height=1; weight=1 | The field accepts and saves the entered value correctly | Pricing and dimensions are entered successfully |  | PASS |
| Product11 | https://prodev.prosperna.ph/home/inventory-listing/products/create | Verify user can save product successfully | User has filled required product fields | Click Save; verify "Successfully created product." | Changes are saved successfully | Product is created successfully | Creates product record | PASS |
| Product12 | https://prodev.prosperna.ph/home/inventory-listing | Verify product search input accepts query after creation | User is on Inventory listing page | Search="Test2" | Matching results are displayed based on the search input | Product list filters by search query |  | PASS |
| Product13 | https://prodev.prosperna.ph/home/inventory-listing | Verify filters can be applied (business + branch) | User is on Inventory listing page | Select business="GameBits"; branch="Laguna Branch"; Add Filter; Close | The action is completed successfully as expected | Filters are applied and listing updates accordingly |  | PASS |
| Product14 | https://prodev.prosperna.ph/home/inventory-listing | Verify product can be published from inventory list | User has an existing product visible in list (inventory-data-0) | Select row id="inventory-data-0"; click Publish | The action is completed successfully as expected | Product publish action completes without error | May update product publish status | PASS |
| Product16 | https://prodev.prosperna.ph/home/inventory-listing | Verify product can be unpublished from inventory list | User has a published product visible in list | Search="Test2"; apply filters; select inventory-data-0; click Unpublish | The action is completed successfully as expected | Product becomes unpublished | May update product publish status | PASS |
| Product17 | https://prodev.prosperna.ph/home/inventory-listing | Verify product can be deleted from inventory list | User has an existing product visible in list | Search="Test2"; apply filters; select inventory-data-0; Delete; Confirm | The action is completed successfully as expected | Product is removed from inventory listing | Deletes product record | PASS |
| Product18 | https://prodev.prosperna.ph/home/inventory-listing | Verify Create Order modal can be opened from product row | User has 'Product 1UVR' visible in list | Search="Product 1UVR"; select inventory-data-0; click Create Order | The page or section opens successfully | Create Order modal opens for selected product |  | PASS |
| Product27 | https://prodev.prosperna.ph/home/inventory-listing | Verify Generate With AI can be opened for a product from row actions | Product exists and row actions available |  | The page or section opens successfully | Generate With AI flow/modal opens |  | PASS |
| Product28 | https://prodev.prosperna.ph/home/inventory-listing | Verify Page Already Exists warning is displayed when applicable | Product already has a page | Verify heading 'Page Already Exists' and warning text | The action is completed successfully as expected | Warning is shown indicating page already exists |  | PASS |
| Product29 | https://prodev.prosperna.ph/home/inventory-listing | Verify Edit Page button is available from Page Already Exists state | Page Already Exists warning displayed | Verify button 'Edit Page' is visible | The action is completed successfully as expected | Edit Page option is available |  | PASS |

### 🔹 Inventory - Variants

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product109 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify 'No Variants Created' message is visible | Variants not yet configured | Verify text 'No Variants Created' | The action is completed successfully as expected | No variants message displayed |  | PASS |
| Product110 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify variant description/instructions are visible | On variants section |  | The action is completed successfully as expected | Variant instructions visible |  | PASS |
| Product111 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Enable Variants button works | On variants section |  | The option state is updated successfully | Variants feature toggles/enables |  | PASS |
| Product112 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Has Variants checkbox can be unchecked | Variants enabled |  | The option state is updated successfully | Has Variants unchecked |  | PASS |
| Product113 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Has Variants checkbox can be checked | Variants enabled |  | The option state is updated successfully | Has Variants checked |  | PASS |
| Product114 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Variant Type Name field is clickable | Variants enabled | Click 'Variant Type Name*' | The action is completed successfully as expected | Field focused/active |  | PASS |
| Product115 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Variant Configuration section expands | Variants enabled | Click heading 'Variant Configuration' | The action is completed successfully as expected | Variant configuration section opens |  | PASS |
| Product116 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify configuration instructions are visible | Variant configuration open | Verify instruction text 'Define variant types and' | The action is completed successfully as expected | Instruction text visible |  | PASS |
| Product117 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Display Type dropdown is clickable | Variant configuration open | Click 'Display Type' | The action is completed successfully as expected | Display type options visible |  | PASS |
| Product118 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Text display type selectable | Display type options open | Click 'Text' display button | The action is completed successfully as expected | Text display selected |  | PASS |
| Product119 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Image display type selectable | Display type options open | Click 'Image' display button | The action is completed successfully as expected | Image display selected |  | PASS |
| Product120 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Color Swatch display type selectable | Display type options open | Click 'Color Swatch' display button | The action is completed successfully as expected | Color Swatch display selected |  | PASS |
| Product121 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify variant type name can be filled | Variant configuration open | variant_type_name="Blue" | The field accepts and saves the entered value correctly | Variant type name saved in input |  | PASS |
| Product122 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify variant option name can be added | Variant type exists | Fill option 'Blue' and press Enter | The action is completed successfully as expected | Variant option added |  | PASS |
| Product123 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify color picker accepts value | Color swatch option available | Color="#0400ff" | The action is completed successfully as expected | Color value applied |  | PASS |
| Product124 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify delete variant type button opens confirmation | Variant type exists |  | The page or section opens successfully | Delete confirmation dialog appears |  | PASS |
| Product125 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify warning icon in delete dialog is clickable/visible | Delete dialog open |  | The action is completed successfully as expected | Warning icon responds / remains visible |  | PASS |
| Product126 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify 'Delete Option' text is visible/clickable in dialog | Delete dialog open |  | The action is completed successfully as expected | Dialog content is interactable |  | PASS |
| Product127 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify delete confirmation message part 1 displayed | Delete dialog open | Verify text 'You are about to delete the' | The action is completed successfully as expected | Confirmation text visible |  | PASS |
| Product128 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify delete confirmation message part 2 displayed | Delete dialog open | Verify text 'Would you like to proceed?' | The action is completed successfully as expected | Confirmation text visible |  | PASS |
| Product129 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Cancel button is visible in delete dialog | Delete dialog open | Check button 'Cancel' visible | The action is completed successfully as expected | Cancel button visible |  | PASS |
| Product130 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Confirm deletes variant type/option | Delete dialog open | Click button 'Confirm' | The action is completed successfully as expected | Variant option/type is deleted | May delete variant option/type records | PASS |
| Product131 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify option field can be refilled after deletion | Variant option input available | Fill option 'Blue' | The field accepts and saves the entered value correctly | Option field accepts input |  | PASS |
| Product132 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Add Variant Type workflow opens confirmation | Variants enabled | Click 'Add Variant Type'; click Confirm | The page or section opens successfully | New variant type row is added |  | PASS |

### 🔹 Inventory - Variants Table

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product133 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Image column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product134 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Name column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product135 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Variant column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product136 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify SKU column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product137 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Quantity column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product138 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Dimensions column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product139 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Weight column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product140 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Price column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product141 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Sale Price column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product142 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Unit Cost column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product143 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Margin column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product144 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Availability column header is clickable | Variants table visible |  | The action is completed successfully as expected | Table sorts or header responds |  | PASS |
| Product145 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify variant row actions can be opened via row click | Variant row exists |  | The page or section opens successfully | Row expands or actions become available |  | PASS |
| Product146 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify variant border button is clickable | Variant row actions visible |  | The action is completed successfully as expected | Button click is processed |  | PASS |
| Product147 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify Select button is clickable in variant actions | Variant actions visible | Click button 'Select' | The action is completed successfully as expected | Selection action occurs |  | PASS |
| Product148 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify variant cell 'Blue: Blue' is clickable | Variant table visible |  | The action is completed successfully as expected | Cell interaction occurs |  | PASS |
| Product149 | https://prodev.prosperna.ph/home/inventory-listing/products/68467054eccbf403ac0334b7/edit | Verify SKU placeholder field is clickable | Variant detail editable |  | The action is completed successfully as expected | SKU field focused |  | PASS |

### 🔹 Login

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Log-1 | https://prodev.prosperna.ph/account/login | Login is successful | Correct Email, correct password | Email, password | User redirected to dashboard | User is successfuly redirected |  | PASS |
| Log-2 | https://prodev.prosperna.ph/account/login | Login has incorrect password | Correct Email, wrong password | Email, password | Failed with error (Incorrect Username or password) | Incorrect Username or Password | none | PASS |
| Log-3 | https://prodev.prosperna.ph/account/login | Login has incorrect email | Incorrect Email, correct password | Email, password | Failed with error (Incorrect Username or password) | Incorrect Username or Password | none | PASS |
| Log-4 | https://prodev.prosperna.ph/account/login | Login with malformed email | Malformed Email, correct password | Email, password | Failed with error (Please enter a valid email or phone number) | Please enter a valid email or phone number | none | PASS |
| Log-5 | https://prodev.prosperna.ph/account/login | Login with no email | No Email, correct password | password | Failed with error (Required) | Required | none | PASS |
| Log-6 | https://prodev.prosperna.ph/account/login | Login with no password | Correct Email, no password | Email | Failed with error (Required) | Required | none | PASS |
| Log-7 | https://prodev.prosperna.ph/account/login | Password is Visible after clicking Eye icon | There is a password |  | Password is now visisble | Password is now visisble | none | PASS |
| Log-8 | https://prodev.prosperna.ph/account/login | Password is Masked after clicking Eye icon again | There is a password |  | Password is now masked | Password is now masked | none | PASS |
| Log-9 | https://prodev.prosperna.ph/account/login | Login Button is clickable | Correct Email, correct password | Email, Password | User redirected to dashboard | User is successfuly redirected | none | PASS |

### 🔹 Marketplace

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Marketplace1 | https://prodev.prosperna.ph/home/marketplace | Verify user can navigate to Marketplace page | User is logged in and has access to Marketplace module |  | Marketplace opened | Marketplace page loads successfully |  | PASS |
| Marketplace2 | https://prodev.prosperna.ph/home/marketplace | Verify Prosperna Shipping - J&T integration details are accessible | User is on Marketplace page |  | Details visible | J&T integration details/description are displayed |  | PASS |
| Marketplace3 | https://prodev.prosperna.ph/home/marketplace | Verify Prosperna Shipping - Lalamove integration details are accessible | User is on Marketplace page |  | Details visible | Lalamove integration details/description are displayed |  | PASS |
| Marketplace4 | https://prodev.prosperna.ph/home/marketplace | Verify myPay integration details are accessible | User is on Marketplace page |  | Details visible | myPay integration details/description are displayed |  | PASS |
| Marketplace5 | https://prodev.prosperna.ph/home/marketplace | Verify Additional Fee feature details are accessible | User is on Marketplace page |  | Details visible | Additional Fee feature description is displayed |  | PASS |
| Marketplace6 | https://prodev.prosperna.ph/home/marketplace | Verify Multi-currency feature details are accessible | User is on Marketplace page |  | Details visible | Multi-currency feature details (FREE / plan availability) are displayed |  | PASS |
| Marketplace7 | https://prodev.prosperna.ph/home/marketplace | Verify Lazada Integration details are accessible | User is on Marketplace page |  | Details visible | Lazada integration details/description are displayed |  | PASS |
| Marketplace8 | https://prodev.prosperna.ph/home/marketplace | Verify Shopee Integration details are accessible | User is on Marketplace page |  | Details visible | Shopee integration details/description are displayed |  | PASS |
| Marketplace9 | https://prodev.prosperna.ph/home/marketplace | Verify Blogs feature details are accessible (if available) | User is on Marketplace page |  | Details visible | Blogs feature description is displayed |  | PASS |
| Marketplace10 | https://prodev.prosperna.ph/home/marketplace | Verify Order Scheduling feature details are accessible (if available) | User is on Marketplace page |  | Details visible | Order Scheduling feature description is displayed |  | PASS |
| Marketplace11 | https://prodev.prosperna.ph/home/marketplace | Verify Announcements feature details are accessible (if available) | User is on Marketplace page |  | Details visible | Announcements feature description is displayed |  | PASS |
| Marketplace12 | https://prodev.prosperna.ph/home/marketplace | Verify Custom Delivery Dates feature details are accessible (if available) | User is on Marketplace page |  | Details visible | Custom Delivery Dates feature description is displayed |  | PASS |
| Marketplace13 | https://prodev.prosperna.ph/home/marketplace | Verify Custom Fonts feature details are accessible (if available) | User is on Marketplace page |  | Details visible | Custom Fonts feature description is displayed |  | PASS |
| Marketplace14 | https://prodev.prosperna.ph/home/marketplace | Verify Product Listing - Menu View feature details are accessible (if available) | User is on Marketplace page |  | Details visible | Product Listing - Menu View description is displayed |  | PASS |
| Marketplace15 | https://prodev.prosperna.ph/home/marketplace | Verify Wholesale Pricing feature details are accessible (if available) | User is on Marketplace page |  | Details visible | Wholesale Pricing feature description is displayed |  | PASS |
| Marketplace16 | https://prodev.prosperna.ph/home/marketplace | Verify QR Code Menu feature details are accessible (if available) | User is on Marketplace page |  | Details visible | QR Code Menu feature description is displayed |  | PASS |
| Marketplace17 | https://prodev.prosperna.ph/home/marketplace | Verify Store Locator: Geolocation feature details are accessible (if available) | User is on Marketplace page | Click “Store Locator: Geolocation” (optional); verify description text is visible | Details visible | Store Locator feature description is displayed |  | PASS |
| Marketplace18 | https://prodev.prosperna.ph/home/marketplace | Verify user can initiate subscription via Subscribe Now | User is on Marketplace page and subscription CTA is available |  | Subscription flow opened | Subscription/order flow is initiated successfully | May add selected app to order summary in session | PASS |
| Marketplace19 | https://prodev.prosperna.ph/home/marketplace | Verify Order Summary section is accessible | User is in subscription/order flow |  | Order summary opened | Order Summary section is displayed |  | PASS |
| Marketplace20 | https://prodev.prosperna.ph/home/marketplace | Verify App Selected section is accessible | User is in subscription/order flow |  | App selection opened | App Selected section is displayed |  | PASS |
| Marketplace21 | https://prodev.prosperna.ph/home/marketplace | Verify Order Scheduling app selection is clickable | User is in App Selected section |  | App selected | Order Scheduling app is selected (or details displayed) | May update selected app in session | PASS |
| Marketplace22 | https://prodev.prosperna.ph/home/marketplace | Verify Payment Terms section is accessible | User is in subscription/order flow |  | Payment terms opened | Payment Terms section is displayed |  | PASS |
| Marketplace23 | https://prodev.prosperna.ph/home/marketplace | Verify user can select QUARTERLY payment term | User is viewing Payment Terms dropdown | Select “QUARTERLY” from payment term dropdown | Payment term updated | Payment term changes to QUARTERLY and fees update accordingly | Session recalculates order totals | PASS |
| Marketplace24 | https://prodev.prosperna.ph/home/marketplace | Verify user can select ANNUALLY payment term | User is viewing Payment Terms dropdown | Select “ANNUALLY” from payment term dropdown | Payment term updated | Payment term changes to ANNUALLY and fees update accordingly | Session recalculates order totals | PASS |
| Marketplace25 | https://prodev.prosperna.ph/home/marketplace | Verify user can select MONTHLY payment term | User is viewing Payment Terms dropdown | Select “MONTHLY” from payment term dropdown | Payment term updated | Payment term changes to MONTHLY and fees update accordingly | Session recalculates order totals | PASS |
| Marketplace26 | https://prodev.prosperna.ph/home/marketplace | Verify Promo Code section is accessible | User is in subscription/order flow |  | Promo code section opened | Promo code input area is displayed |  | PASS |
| Marketplace27 | https://prodev.prosperna.ph/home/marketplace | Verify Subscription Fee label/details are accessible | User is in subscription/order flow |  | Fee detail accessible | Subscription fee info is visible |  | PASS |
| Marketplace28 | https://prodev.prosperna.ph/home/marketplace | Verify “What you’ll pay monthly” label/details are accessible | User is in subscription/order flow |  | Label accessible | Monthly payment breakdown/label is visible |  | PASS |
| Marketplace29 | https://prodev.prosperna.ph/home/marketplace | Verify Prorated Subscription Fee label/details are accessible | User is in subscription/order flow |  | Label accessible | Prorated fee info is visible |  | PASS |
| Marketplace30 | https://prodev.prosperna.ph/home/marketplace | Verify Discount label/details are accessible | User is in subscription/order flow |  | Label accessible | Discount info is visible (if applicable) |  | PASS |
| Marketplace31 | https://prodev.prosperna.ph/home/marketplace | Verify Total label/details are accessible | User is in subscription/order flow |  | Label accessible | Total amount info is visible |  | PASS |
| Marketplace32 | https://prodev.prosperna.ph/home/marketplace | Verify Payment Type dropdown/section is accessible | User is in subscription/order flow |  | Payment type opened | Payment method selection control is available |  | PASS |
| Marketplace33 | https://prodev.prosperna.ph/home/marketplace | Verify user can select eWallet as payment method | User is in payment method selection |  | eWallet selected | eWallet payment option is selected and related UI appears |  | PASS |
| Marketplace34 | https://prodev.prosperna.ph/home/marketplace | Verify eWallet acknowledgment text is clickable/visible | eWallet payment method is selected |  | Acknowledgment shown | Acknowledgment text is visible and interactable |  | PASS |
| Marketplace35 | https://prodev.prosperna.ph/home/marketplace | Verify user can check acknowledgment checkbox | eWallet acknowledgment is required |  | Acknowledged | Checkbox is checked successfully |  | PASS |
| Marketplace36 | https://prodev.prosperna.ph/home/marketplace | Verify user can select Credit Card as payment method | User is in payment method selection | Select “credit_card” from payment type dropdown | Credit card selected | Credit card option is selected and credit card UI appears |  | PASS |
| Marketplace37 | https://prodev.prosperna.ph/home/marketplace | Verify Select a Credit Card section is accessible | Credit card payment method is selected |  | Card selector opened | Credit card selection UI is visible |  | PASS |
| Marketplace38 | https://prodev.prosperna.ph/home/marketplace | Verify credit card acknowledgment text is clickable/visible | Credit card payment method is selected |  | Acknowledgment shown | Acknowledgment text is visible and interactable |  | PASS |
| Marketplace39 | https://prodev.prosperna.ph/home/marketplace | Verify applying an already-used promo code shows correct validation | User is on Promo Code section |  | Validation displayed | System shows “already used/has already …” validation message |  | PASS |
| Marketplace40 | https://prodev.prosperna.ph/home/marketplace | Verify applying a non-existent promo code shows correct validation | User is on Promo Code section |  | Validation displayed | System shows invalid/non-existent promo code warning |  | PASS |

### 🔹 Media Library

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Media1 | https://prodev.prosperna.ph/home/media-library | Verify user can navigate to Media Library page | User is logged in and has access to Media Library module |  | Media Library opened | Media Library page loads successfully |  | PASS |
| Media2 | https://prodev.prosperna.ph/home/media-library | Verify user can upload an image file successfully | User is on Media Library page | File: Module/image.png; Upload via input[type='file']; Click Add | Upload success | Image is uploaded and success toast/message is displayed | Media item created (image) | PASS |
| Media3 | https://prodev.prosperna.ph/home/media-library | Verify user can add a video via YouTube/Vimeo link and delete it | User is on Media Library page | Media type=Video; Link=https://www.youtube.com/watch?v=Ver1OZdK2bA&list=RDVer1OZdK2bA&start_radio=1; Delete item “Harry Potter vs Luke...” | Add & delete success | Video link is added successfully; video entry is deletable and removed successfully | Media item created then deleted (video) | PASS |
| Media4 | https://prodev.prosperna.ph/home/media-library | Verify user can edit an image (rotate and flip) | User is on Media Library page |  | Edit applied | Image editor applies rotation/flip operations without error | Media item updated (image transform) | PASS |
| Media5 | https://prodev.prosperna.ph/home/media-library | Verify user can resize an image successfully | User is in image editor / image selected |  | Resize applied | Image is scaled to 1500x1200 without error | Media item updated (resize) | PASS |
| Media6 | https://prodev.prosperna.ph/home/media-library | Verify AI Lighting adjustments can be applied to an image | User is in AI Edit flow for an image |  | AI settings applied | Lighting selections apply successfully (no errors; UI updates) | Media item updated (AI metadata/render) | PASS |
| Media7 | https://prodev.prosperna.ph/home/media-library | Verify user can apply filters to an image | User is in image editor / filters UI available | Filters: Original, Vintage, Black & White, Sepia, Dramatic, Warm, Cool, Fade, Vibrant, Soft | Filters applied | Filter changes apply successfully and preview updates | Media item updated (filter) | PASS |
| Media8 | https://prodev.prosperna.ph/home/media-library | Verify AI Background Replacement flow can be initiated | User is in AI Edit flow for an image |  | AI flow started | Background Replacement generation starts and user can proceed to AI editing | Media item may be updated (AI generated asset) | PASS |
| Media9 | https://prodev.prosperna.ph/home/media-library | Verify AI Image Enhancement can be completed | User is in AI Edit flow for an image |  | Enhancement complete | Image enhancement finishes successfully and user can continue | Media item updated (enhanced image) | PASS |
| Media10 | https://prodev.prosperna.ph/home/media-library | Verify AI Magic Eraser (background removal) can be completed | User is in AI Edit flow for an image |  | Removal complete | Background removal completes successfully and user can continue | Media item updated (background removed) | PASS |

### 🔹 Menu Builder

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Messaging

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 My Account

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Navbar Navigation

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| PNav3 | https://prodev.prosperna.ph/dashboard/analytics | Verify hamburger menu button can be opened | User is logged in and dashboard is accessible |  | Menu opened | Sidebar / navigation menu expands and is usable |  | PASS |
| PNav4 | https://prodev.prosperna.ph/dashboard/analytics | Verify Dashboard link is accessible from navigation | User is logged in and navigation is available |  | Navigated | Dashboard page opens successfully |  | PASS |
| PNav5 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Contacts module from navbar | User is logged in and navigation is available |  | Navigated | Contacts page opens successfully |  | PASS |
| PNav6 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Orders module from navbar | User is logged in and navigation is available |  | Navigated | Orders page opens successfully |  | PASS |
| PNav7 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can open Products module from navbar | User is logged in and navigation is available |  | Navigated | Products menu/module opens successfully |  | PASS |
| PNav8 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Inventory module from navbar | User is logged in and navigation is available |  | Navigated | Inventory page opens successfully |  | PASS |
| PNav9 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Categories module from navbar | User is logged in and navigation is available |  | Navigated | Categories page opens successfully |  | PASS |
| PNav10 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Add-ons from Products submenu | User is logged in and navigation is available |  | Navigated | Add-ons page opens successfully |  | PASS |
| PNav11 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Product Labels from Products submenu | User is logged in and navigation is available |  | Navigated | Product Labels page opens successfully |  | PASS |
| PNav12 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Product Reviews from Products submenu | User is logged in and navigation is available |  | Navigated | Product Reviews page opens successfully |  | PASS |
| PNav13 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can open Marketing module from navbar | User is logged in and navigation is available |  | Navigated | Marketing menu/module opens successfully |  | PASS |
| PNav14 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Announcements from navbar | User is logged in and navigation is available |  | Navigated | Announcements page opens successfully |  | PASS |
| PNav15 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Discounts from Marketing submenu | User is logged in and navigation is available |  | Navigated | Discounts page opens successfully |  | PASS |
| PNav16 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Blogs from Marketing submenu | User is logged in and navigation is available |  | Navigated | Blogs page opens successfully |  | PASS |
| PNav17 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can open Finances module from navbar | User is logged in and navigation is available |  | Navigated | Finances menu/module opens successfully |  | PASS |
| PNav18 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Balances from navbar | User is logged in and navigation is available |  | Navigated | Balances page opens successfully |  | PASS |
| PNav19 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Withdrawal Settings from navbar | User is logged in and navigation is available |  | Navigated | Withdrawal Settings page opens successfully |  | PASS |
| PNav20 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can open Page Builder module from navbar | User is logged in and navigation is available |  | Navigated | Page Builder menu/module opens successfully |  | PASS |
| PNav21 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to All Pages from Page Builder submenu | User is logged in and navigation is available |  | Navigated | All Pages list opens successfully |  | PASS |
| PNav22 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Add New Page from Page Builder submenu | User is logged in and navigation is available |  | Navigated | Add New Page screen opens successfully |  | PASS |
| PNav23 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Menu Builder from Page Builder submenu | User is logged in and navigation is available |  | Navigated | Menu Builder page opens successfully |  | PASS |
| PNav24 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can open Template Library and return via Page Builder menu | User is logged in and navigation is available |  | Navigated | Template Library opens successfully; user can return to Page Builder menu |  | PASS |
| PNav25 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Design Settings from Page Builder submenu | User is logged in and navigation is available |  | Navigated | Design Settings page opens successfully |  | PASS |
| PNav26 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Media Library from navbar | User is logged in and navigation is available |  | Navigated | Media Library page opens successfully |  | PASS |
| PNav27 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Marketplace from navbar | User is logged in and navigation is available |  | Navigated | Marketplace page opens successfully |  | PASS |
| PNav28 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can open Settings module from navbar | User is logged in and navigation is available |  | Navigated | Settings menu/module opens successfully |  | PASS |
| PNav29 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Store from Settings submenu | User is logged in and navigation is available |  | Navigated | Store page opens successfully |  | PASS |
| PNav30 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Payments from Settings submenu | User is logged in and navigation is available |  | Navigated | Payments page opens successfully |  | PASS |
| PNav31 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Shipping from Settings submenu | User is logged in and navigation is available |  | Navigated | Shipping page opens successfully |  | PASS |
| PNav32 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Digital Products from Settings submenu | User is logged in and navigation is available |  | Navigated | Digital Products settings page opens successfully |  | PASS |
| PNav33 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Users from Settings submenu | User is logged in and navigation is available |  | Navigated | Users page opens successfully |  | PASS |
| PNav34 | https://prodev.prosperna.ph/dashboard/analytics | Verify user can navigate to Messaging from Settings submenu | User is logged in and navigation is available |  | Navigated | Messaging page opens successfully |  | PASS |

### 🔹 Not Yet Done

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Onboarding

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Onboard1 | https://prodev.prosperna.ph/onboarding | Verify onboarding welcome text can be clicked if displayed | User is logged in; onboarding may appear |  | Clickable | If onboarding modal exists, clicking the welcome text does not error and keeps user in onboarding flow |  | PASS |
| Onboard2 | https://prodev.prosperna.ph/onboarding | Verify onboarding heading can be clicked if displayed | User is logged in; onboarding may appear |  | Clickable | If onboarding modal exists, heading is clickable / interactable without error |  | PASS |
| Onboard3 | https://prodev.prosperna.ph/onboarding | Verify onboarding subtext can be clicked if displayed | User is logged in; onboarding may appear |  | Clickable | If onboarding modal exists, subtext is clickable / interactable without error |  | PASS |
| Onboard4 | https://prodev.prosperna.ph/onboarding | Verify onboarding survey box can be clicked if displayed | User is logged in; onboarding may appear |  | Clickable | If onboarding survey box exists, user can click it without error |  | PASS |
| Onboard5 | https://prodev.prosperna.ph/onboarding | Verify user can start onboarding by clicking Get Started | User is logged in; onboarding may appear |  | Progressed | Onboarding flow advances to Step 1 (or next screen) when present |  | PASS |
| Onboard6 | https://prodev.prosperna.ph/onboarding | Verify Step 1 purpose selections can be chosen and Next advances | User is on onboarding Step 1 (if shown) | Click one or more: "For my business" / "For a client, as an agency or" / "For my own research or as a" → Click "Next" (all optional) | Progressed | Selected option(s) are accepted and Next moves user to Step 2 when onboarding is present |  | PASS |
| Onboard7 | https://prodev.prosperna.ph/onboarding | Verify business type dropdown selection works and Next advances | User is on business type step (if shown) | Open .react-select__input-container → Select option "Agency" → Click "Next" (optional) | Progressed | Business type is set to Agency and flow advances to next step when present |  | PASS |
| Onboard8 | https://prodev.prosperna.ph/onboarding | Verify business goals selections can be chosen and Next advances | User is on goals step (if shown) | Click: "Increase sales" / "Increase Brand Awareness" / "Improve Customer Experience" → Click "Next" (all optional) | Progressed | Selected goal(s) are accepted and Next moves user to next step when present |  | PASS |
| Onboard9 | https://prodev.prosperna.ph/onboarding | Verify business size selection works and Next advances | User is on business size step (if shown) | Click: "Small (less than ₱ 250,000" / "Medium (₱ 250K to ₱1M per" / "Large (more than ₱ 1M+ per" → Click "Next" (all optional) | Progressed | Selected size option is accepted and Next moves user forward / completes step when present |  | PASS |

### 🔹 Orders

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Orders1 | https://prodev.prosperna.ph/home/customer-orders/list | Verify user can navigate to Orders listing page | User is logged in and has access to Orders module |  | The page or section opens successfully | Orders listing page loads successfully |  | PASS |
| Orders2 | https://prodev.prosperna.ph/home/customer-orders/list | Verify Orders table column headers are clickable for sorting | User is on Orders listing page | Click column headers: Order ID, Name, Date, Due Date, Location, Amount, Order Status, Channel, Payment Status, Payment Type, Delivery Status, Shipping Type, Actions | The table is sorted correctly based on the selected column | Each column header is clickable; sorting UI/state updates without error |  | PASS |
| Orders3 | https://prodev.prosperna.ph/home/customer-orders/list | Verify Add Filter workflow works for filtering by Amount | User is on Orders listing page and filter UI is available | Open filters (button nth(3)) → Add Filter → Select field=Amount → Apply → Close | The action is completed successfully as expected | Filter is applied successfully and filter UI closes without error |  | PASS |
| Orders4 | https://prodev.prosperna.ph/home/customer-orders/list | Verify user can create a new order using an existing customer (STANDARD + EWALLET) | User is on Orders listing page; at least one customer exists; checkout flow is enabled | Click "Create Order" → Select customer (ArrowDown+Enter) → Shipping=STANDARD → Payment=EWALLET → Select GCash → Proceed to Checkout → Place Order | The action is completed successfully as expected | Order is created successfully and user sees order placement confirmation / order appears in list | New order record created; potential payment intent created | PASS |
| Orders5 | https://prodev.prosperna.ph/home/customer-orders/list | Verify user can create a new customer from Create Order, then delete the created lead in Leads module | User is logged in; has access to Orders + Leads; Create New Customer modal works; lead deletion permitted | Create Order → Create New Customer → Fill: First/Last/Email/Mobile → Open Tags modal and close → Check "Send Email Request..." → Create Customer → Navigate Leads → Search "john" → Row action → Delete → Confirm | The action is completed successfully as expected | New customer/lead is created (or duplicate email validation appears). Lead can be found and deleted successfully | Lead created then deleted (net no lead remains). Email request may be triggered if created | PASS |
| Orders6 | https://prodev.prosperna.ph/home/customer-orders/list | Verify customer combobox search/select/clear works in Create Order | User is on Create Order page and customer combobox is visible | Open combobox → Search "tester" → Select suggestion → Click clear (×) | Matching results are displayed based on the search input | Customer is selected then cleared successfully without errors |  | PASS |
| Orders7 | https://prodev.prosperna.ph/home/customer-orders/list | Verify customer combobox accepts phone search and selection works | User is on Create Order page and customer exists matching phone search term | Fill combobox with "9175161031+" → Select "RIAN FROILLE ALDE" → Click clear (×) | Matching results are displayed based on the search input | Customer can be found via phone search, selected, then cleared successfully |  | PASS |

### 🔹 Orders (Modal)

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product19 | https://prodev.prosperna.ph/home/inventory-listing | Verify customer search can be initiated in Create Order modal | Create Order modal is open | Click Select Customer; Search Customer="test" | Matching results are displayed based on the search input | Customer search is performed and results populate (if any) |  | PASS |
| Product20 | https://prodev.prosperna.ph/home/inventory-listing | Verify selecting customer and adding product to order works in modal | Create Order modal open and customer exists | Select "Test Tester"; Confirm; Add to Order | The action is completed successfully as expected | Customer selected and item added to order | May create draft order state | PASS |
| Product21 | https://prodev.prosperna.ph/home/inventory-listing | Verify merchant type can be set to Own Booking in modal | Item is added in modal | Set merchant type="OWN_BOOKING_MERCHANT" | The action is completed successfully as expected | Merchant type changes to Own Booking |  | PASS |
| Product22 | https://prodev.prosperna.ph/home/inventory-listing | Verify payment method can be set to E-wallet (GCash) in modal | Checkout/payment method section is available |  | The action is completed successfully as expected | GCash is selected as e-wallet payment method |  | PASS |
| Product23 | https://prodev.prosperna.ph/home/inventory-listing | Verify payment expiration can be set and user can proceed to checkout | Payment expiration section is visible |  | The option state is updated successfully | Expiration set and checkout step is reached |  | PASS |
| Product24 | https://prodev.prosperna.ph/home/inventory-listing | Verify order can be placed from modal | User is on final checkout step in modal |  | The action is completed successfully as expected | Order is created successfully | Creates order record | PASS |
| Product25 | https://prodev.prosperna.ph/home/inventory-listing | Verify user can navigate to View Order from success screen | Order created success screen is displayed |  | The page or section opens successfully | User is redirected to View Order page/section |  | PASS |
| Product26 | https://prodev.prosperna.ph/home/inventory-listing | Verify user can copy payment link or download QR code | Order payment options are visible |  | The action is completed successfully as expected | Payment link copied or QR code downloaded |  | PASS |

### 🔹 Page Builder

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Page1 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can open Page Builder Create page and Page Details section is visible | User is logged in and has access to Page Builder |  | The page or section opens successfully | Page Builder Create page loads and "Page Details" section can be opened |  | PASS |
| Page2 | https://prodev.prosperna.ph/home/page-builder/create | Verify Page Name field label/area is clickable | User is on Page Builder Create page |  | The action is completed successfully as expected | Page Name field area is interactable (focus/active state possible) |  | PASS |
| Page3 | https://prodev.prosperna.ph/home/page-builder/create | Verify required indicator under Page Details is clickable/visible | User is on Page Builder Create page |  | The action is completed successfully as expected | Required indicator is visible and interactable without error |  | PASS |
| Page4 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Required*" validation message can be displayed/recognized | User is on Page Builder Create page and required validation is present/triggered | Click "Required*" text | The action is completed successfully as expected | Required* message is visible (validation UI present) |  | PASS |
| Page5 | https://prodev.prosperna.ph/home/page-builder/create | Verify Page Name textbox can receive focus | User is on Page Builder Create page |  | The action is completed successfully as expected | Page Name textbox is focused and ready for input |  | PASS |
| Page6 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can input a Page Name | User is on Page Builder Create page | Fill Page Name="testpage" | The action is completed successfully as expected | Page Name value is entered successfully |  | PASS |
| Page7 | https://prodev.prosperna.ph/home/page-builder/create | Verify Layout section can be opened | User is on Page Builder Create page |  | The page or section opens successfully | Layout section expands and becomes visible |  | PASS |
| Page8 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Choose a Theme" section is accessible | User is in Layout section | Click "Choose a Theme" | The action is completed successfully as expected | Theme selection area is shown/active |  | PASS |
| Page9 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can select "Custom" theme | User is in theme selection area | Select theme="Custom" | The action is completed successfully as expected | Custom theme is selected |  | PASS |
| Page10 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can select "Blank" theme | User is in theme selection area | Select theme="Blank" | The action is completed successfully as expected | Blank theme is selected |  | PASS |
| Page11 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can return to Themes list | User is inside a theme detail/selection view | Click "Back to Themes" | The action is completed successfully as expected | User is returned to Themes list view |  | PASS |
| Page12 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can open "Bearing's Bikes" theme | User is on Themes list | Open theme="Bearing's Bikes" | The page or section opens successfully | Bearing's Bikes theme details open |  | PASS |
| Page13 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Home" page option is selectable under Bearing's Bikes theme | User is viewing Bearing's Bikes theme options | Click "Home" | The action is completed successfully as expected | Home option is selected/displayed without error |  | PASS |
| Page14 | https://prodev.prosperna.ph/home/page-builder/create | Verify "About Us" page option is selectable under Bearing's Bikes theme | User is viewing Bearing's Bikes theme options | Click "About Us" | The action is completed successfully as expected | About Us option is selected/displayed without error |  | PASS |
| Page15 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Return Policy" page option is selectable under Bearing's Bikes theme | User is viewing Bearing's Bikes theme options | Click "Return Policy" | The action is completed successfully as expected | Return Policy option is selected/displayed without error |  | PASS |
| Page16 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Terms of Service" page option is selectable under Bearing's Bikes theme | User is viewing Bearing's Bikes theme options | Click "Terms of Service" | The action is completed successfully as expected | Terms of Service option is selected/displayed without error |  | PASS |
| Page17 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Privacy Policy" page option is selectable under Bearing's Bikes theme | User is viewing Bearing's Bikes theme options | Click "Privacy Policy" | The action is completed successfully as expected | Privacy Policy option is selected/displayed without error |  | PASS |
| Page18 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can return to Themes list from Bearing's Bikes theme | User is inside Bearing's Bikes theme view | Click "Back to Themes" | The action is completed successfully as expected | User returns to Themes list view |  | PASS |
| Page19 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can open "Burger Pro" theme | User is on Themes list | Open theme="Burger Pro" | The page or section opens successfully | Burger Pro theme details open |  | PASS |
| Page20 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Home" page option is selectable under Burger Pro theme | User is viewing Burger Pro theme options | Click "Home" | The action is completed successfully as expected | Home option is selected/displayed without error |  | PASS |
| Page21 | https://prodev.prosperna.ph/home/page-builder/create | Verify "About Us" page option is selectable under Burger Pro theme | User is viewing Burger Pro theme options | Click "About Us" | The action is completed successfully as expected | About Us option is selected/displayed without error |  | PASS |
| Page22 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Return Policy" page option is selectable under Burger Pro theme | User is viewing Burger Pro theme options | Click "Return Policy" | The action is completed successfully as expected | Return Policy option is selected/displayed without error |  | PASS |
| Page23 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Terms of Service" page option is selectable under Burger Pro theme | User is viewing Burger Pro theme options | Click "Terms of Service" | The action is completed successfully as expected | Terms of Service option is selected/displayed without error |  | PASS |
| Page24 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Privacy Policy" page option is selectable under Burger Pro theme | User is viewing Burger Pro theme options | Click "Privacy Policy" | The action is completed successfully as expected | Privacy Policy option is selected/displayed without error |  | PASS |
| Page25 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can return to Themes list from Burger Pro theme | User is inside Burger Pro theme view | Click "Back to Themes" | The action is completed successfully as expected | User returns to Themes list view |  | PASS |
| Page26 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can open "Elite Beauty" theme | User is on Themes list | Open theme="Elite Beauty" | The page or section opens successfully | Elite Beauty theme details open |  | PASS |
| Page27 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Home" page option is selectable under Elite Beauty theme | User is viewing Elite Beauty theme options | Click "Home" | The action is completed successfully as expected | Home option is selected/displayed without error |  | PASS |
| Page28 | https://prodev.prosperna.ph/home/page-builder/create | Verify "About Us" page option is selectable under Elite Beauty theme | User is viewing Elite Beauty theme options | Click "About Us" | The action is completed successfully as expected | About Us option is selected/displayed without error |  | PASS |
| Page29 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Return Policy" page option is selectable under Elite Beauty theme | User is viewing Elite Beauty theme options | Click "Return Policy" | The action is completed successfully as expected | Return Policy option is selected/displayed without error |  | PASS |
| Page30 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Terms of Service" page option is selectable under Elite Beauty theme | User is viewing Elite Beauty theme options | Click "Terms of Service" | The action is completed successfully as expected | Terms of Service option is selected/displayed without error |  | PASS |
| Page31 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Privacy Policy" page option is selectable under Elite Beauty theme | User is viewing Elite Beauty theme options | Click "Privacy Policy" | The action is completed successfully as expected | Privacy Policy option is selected/displayed without error |  | PASS |
| Page32 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can return to Themes list from Elite Beauty theme | User is inside Elite Beauty theme view | Click "Back to Themes" | The action is completed successfully as expected | User returns to Themes list view |  | PASS |
| Page33 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can open "Fashion by You" theme | User is on Themes list | Open theme="Fashion by You" | The page or section opens successfully | Fashion by You theme details open |  | PASS |
| Page34 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Home" page option is selectable under Fashion by You theme | User is viewing Fashion by You theme options | Click "Home" | The action is completed successfully as expected | Home option is selected/displayed without error |  | PASS |
| Page35 | https://prodev.prosperna.ph/home/page-builder/create | Verify "About Us" page option is selectable under Fashion by You theme | User is viewing Fashion by You theme options | Click "About Us" | The action is completed successfully as expected | About Us option is selected/displayed without error |  | PASS |
| Page36 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Return Policy" page option is selectable under Fashion by You theme | User is viewing Fashion by You theme options | Click "Return Policy" | The action is completed successfully as expected | Return Policy option is selected/displayed without error |  | PASS |
| Page37 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Terms of Service" page option is selectable under Fashion by You theme | User is viewing Fashion by You theme options | Click "Terms of Service" | The action is completed successfully as expected | Terms of Service option is selected/displayed without error |  | PASS |
| Page38 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Privacy Policy" page option is selectable under Fashion by You theme | User is viewing Fashion by You theme options | Click "Privacy Policy" | The action is completed successfully as expected | Privacy Policy option is selected/displayed without error |  | PASS |
| Page39 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can return to Themes list from Fashion by You theme | User is inside Fashion by You theme view | Click "Back to Themes" | The action is completed successfully as expected | User returns to Themes list view |  | PASS |
| Page40 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can open "Modern Home" theme | User is on Themes list | Open theme="Modern Home" | The page or section opens successfully | Modern Home theme details open |  | PASS |
| Page41 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Home" page option is selectable under Modern Home theme | User is viewing Modern Home theme options | Click "Home" (exact) | The action is completed successfully as expected | Home option is selected/displayed without error |  | PASS |
| Page42 | https://prodev.prosperna.ph/home/page-builder/create | Verify "About Us" page option is selectable under Modern Home theme | User is viewing Modern Home theme options | Click "About Us" | The action is completed successfully as expected | About Us option is selected/displayed without error |  | PASS |
| Page43 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Return Policy" page option is selectable under Modern Home theme | User is viewing Modern Home theme options | Click "Return Policy" | The action is completed successfully as expected | Return Policy option is selected/displayed without error |  | PASS |
| Page44 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Terms of Service" page option is selectable under Modern Home theme | User is viewing Modern Home theme options | Click "Terms of Service" | The action is completed successfully as expected | Terms of Service option is selected/displayed without error |  | PASS |
| Page45 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Privacy Policy" page option is selectable under Modern Home theme | User is viewing Modern Home theme options | Click "Privacy Policy" | The action is completed successfully as expected | Privacy Policy option is selected/displayed without error |  | PASS |
| Page46 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can return to Themes list from Modern Home theme | User is inside Modern Home theme view | Click "Back to Themes" | The action is completed successfully as expected | User returns to Themes list view |  | PASS |
| Page47 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can open "Tech Market" theme | User is on Themes list | Open theme="Tech Market" | The page or section opens successfully | Tech Market theme details open |  | PASS |
| Page48 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Home" page option is selectable under Tech Market theme | User is viewing Tech Market theme options | Click "Home" | The action is completed successfully as expected | Home option is selected/displayed without error |  | PASS |
| Page49 | https://prodev.prosperna.ph/home/page-builder/create | Verify "About Us" page option is selectable under Tech Market theme | User is viewing Tech Market theme options | Click "About Us" | The action is completed successfully as expected | About Us option is selected/displayed without error |  | PASS |
| Page50 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Return Policy" page option is selectable under Tech Market theme | User is viewing Tech Market theme options | Click "Return Policy" | The action is completed successfully as expected | Return Policy option is selected/displayed without error |  | PASS |
| Page51 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Terms of Service" page option is selectable under Tech Market theme | User is viewing Tech Market theme options | Click "Terms of Service" | The action is completed successfully as expected | Terms of Service option is selected/displayed without error |  | PASS |
| Page52 | https://prodev.prosperna.ph/home/page-builder/create | Verify "Privacy Policy" page option is selectable under Tech Market theme | User is viewing Tech Market theme options | Click "Privacy Policy" | The action is completed successfully as expected | Privacy Policy option is selected/displayed without error |  | PASS |
| Page53 | https://prodev.prosperna.ph/home/page-builder/create | Verify SEO section can be opened on Page Builder Create page | User is on Page Builder Create page and SEO section exists | Open "Search Engine Optimization" section | The page or section opens successfully | SEO section expands and is visible |  | PASS |
| Page54 | https://prodev.prosperna.ph/home/page-builder/create | Verify SEO Basics tab is accessible | User is in SEO section | Open tab="Basics" | The action is completed successfully as expected | Basics tab content is displayed |  | PASS |
| Page55 | https://prodev.prosperna.ph/home/page-builder/create | Verify SEO Robots tab is accessible | User is in SEO section | Open tab="Robots" | The action is completed successfully as expected | Robots tab content is displayed |  | PASS |
| Page56 | https://prodev.prosperna.ph/home/page-builder/create | Verify SEO Advanced tab is accessible | User is in SEO section | Open tab="Advanced" | The action is completed successfully as expected | Advanced tab content is displayed |  | PASS |
| Page57 | https://prodev.prosperna.ph/home/page-builder/create | Verify SEO Schema tab is accessible | User is in SEO section | Open tab="Schema" | The action is completed successfully as expected | Schema tab content is displayed |  | PASS |
| Page58 | https://prodev.prosperna.ph/home/page-builder/create | Verify switching back to SEO Basics tab works | User is in SEO section | Re-open tab="Basics" | The action is completed successfully as expected | Basics tab content is displayed again |  | PASS |
| Page59 | https://prodev.prosperna.ph/home/page-builder/create | Verify Slug field is accessible in SEO Basics | User is on SEO Basics tab | Click "Slug" (if present) | The action is completed successfully as expected | Slug field/label is interactable |  | PASS |
| Page60 | https://prodev.prosperna.ph/home/page-builder/create | Verify Meta Title field is accessible | User is on SEO Basics tab | Click "Meta Title" | The action is completed successfully as expected | Meta Title field/label is interactable |  | PASS |
| Page61 | https://prodev.prosperna.ph/home/page-builder/create | Verify Meta Description field is accessible | User is on SEO Basics tab | Click "Meta Description" | The action is completed successfully as expected | Meta Description field/label is interactable |  | PASS |
| Page62 | https://prodev.prosperna.ph/home/page-builder/create | Verify Meta Title character counter is visible | User is on SEO Basics tab | Click counter "0/50" | The action is completed successfully as expected | Meta Title counter is visible |  | PASS |
| Page63 | https://prodev.prosperna.ph/home/page-builder/create | Verify Meta Description character counter is visible | User is on SEO Basics tab | Click counter "/150" | The action is completed successfully as expected | Meta Description counter is visible |  | PASS |
| Page64 | https://prodev.prosperna.ph/home/page-builder/create | Verify Keywords field is accessible | User is on SEO Basics tab | Click "Keywords" | The action is completed successfully as expected | Keywords input/label is interactable |  | PASS |
| Page65 | https://prodev.prosperna.ph/home/page-builder/create | Verify Meta Image field is accessible | User is on SEO Basics tab | Click "Meta Image" (if present) | The action is completed successfully as expected | Meta Image field/section is interactable |  | PASS |
| Page66 | https://prodev.prosperna.ph/home/page-builder/create | Verify SEO preview control is accessible | User is on SEO Basics tab |  | The page or section opens successfully | SEO preview opens or preview UI is triggered |  | PASS |
| Page67 | https://prodev.prosperna.ph/home/page-builder/create | Verify keyword hint text is visible | User is on SEO Basics tab | Click "Press Enter to add keywords." (if present) | The action is completed successfully as expected | Keyword hint is visible and interacts without error |  | PASS |
| Page68 | https://prodev.prosperna.ph/home/page-builder/create | Verify Robots tab can be reopened | User is in SEO section | Re-open tab="Robots" | The page or section opens successfully | Robots tab content displays again |  | PASS |
| Page69 | https://prodev.prosperna.ph/home/page-builder/create | Verify Robots Settings section is accessible | User is on Robots tab | Click "Robots Settings" | The action is completed successfully as expected | Robots Settings content is visible |  | PASS |
| Page70 | https://prodev.prosperna.ph/home/page-builder/create | Verify No Index toggle/option is selectable | User is on Robots tab / Robots settings |  | The action is completed successfully as expected | No Index option toggles/changes state |  | PASS |
| Page71 | https://prodev.prosperna.ph/home/page-builder/create | Verify No Follow toggle/option is selectable | User is on Robots tab / Robots settings |  | The action is completed successfully as expected | No Follow option toggles/changes state |  | PASS |
| Page72 | https://prodev.prosperna.ph/home/page-builder/create | Verify Advanced Robots section can be opened | User is on Robots tab |  | The page or section opens successfully | Advanced Robots settings area opens |  | PASS |
| Page73 | https://prodev.prosperna.ph/home/page-builder/create | Verify Advanced Robots Settings content is visible | User is on Advanced Robots area | Click "Advanced Robots Settings" | The action is completed successfully as expected | Advanced Robots Settings content displays |  | PASS |
| Page74 | https://prodev.prosperna.ph/home/page-builder/create | Verify No Archive option is selectable | User is on Advanced Robots settings | Click "No Archive" | The action is completed successfully as expected | No Archive toggles/changes state |  | PASS |
| Page75 | https://prodev.prosperna.ph/home/page-builder/create | Verify No Image Index option is selectable | User is on Advanced Robots settings | Click "No Image Index" | The action is completed successfully as expected | No Image Index toggles/changes state |  | PASS |
| Page76 | https://prodev.prosperna.ph/home/page-builder/create | Verify No Snippet option is selectable | User is on Advanced Robots settings | Click "No Snippet" | The action is completed successfully as expected | No Snippet toggles/changes state |  | PASS |
| Page77 | https://prodev.prosperna.ph/home/page-builder/create | Verify Advanced tab can be opened | User is in SEO section | Open tab="Advanced" | The page or section opens successfully | Advanced tab content displays |  | PASS |
| Page78 | https://prodev.prosperna.ph/home/page-builder/create | Verify Redirect setting is accessible in Advanced tab | User is on SEO Advanced tab | Click "Redirect" | The action is completed successfully as expected | Redirect setting/section is interactable |  | PASS |
| Page79 | https://prodev.prosperna.ph/home/page-builder/create | Verify Rating setting is accessible in Advanced tab | User is on SEO Advanced tab | Click "Rating" | The action is completed successfully as expected | Rating setting/section is interactable |  | PASS |
| Page80 | https://prodev.prosperna.ph/home/page-builder/create | Verify SEO slug textbox is focusable | User is on SEO Advanced tab | Click textbox "store.com/page-slug" | The action is completed successfully as expected | Slug textbox is focused |  | PASS |
| Page81 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can input SEO slug value | User is on SEO Advanced tab | Fill slug textbox value="google.com" | The action is completed successfully as expected | Slug value is entered successfully |  | PASS |
| Page82 | https://prodev.prosperna.ph/home/page-builder/create | Verify General SEO textbox is focusable | User is on SEO Advanced tab | Click textbox "General" | The action is completed successfully as expected | General textbox is focused |  | PASS |
| Page83 | https://prodev.prosperna.ph/home/page-builder/create | Verify user can input General SEO value | User is on SEO Advanced tab | Fill General="general" | The action is completed successfully as expected | General value is entered successfully |  | PASS |
| Page84 | https://prodev.prosperna.ph/home/page-builder/create | Verify Schema tab can be reopened | User is in SEO section | Open tab="Schema" | The page or section opens successfully | Schema tab content displays |  | PASS |
| Page85 | https://prodev.prosperna.ph/home/page-builder/create | Verify Schema Type field is accessible | User is on SEO Schema tab | Click "Schema Type" | The action is completed successfully as expected | Schema Type section/field is interactable |  | PASS |
| Page86 | https://prodev.prosperna.ph/home/page-builder/create | Verify Schema Author field is accessible | User is on SEO Schema tab | Click "Author" | The action is completed successfully as expected | Author field/section is interactable |  | PASS |
| Page87 | https://prodev.prosperna.ph/home/page-builder/create | Verify Schema Publisher field is accessible | User is on SEO Schema tab | Click "Publisher" | The action is completed successfully as expected | Publisher field/section is interactable |  | PASS |
| Page88 | https://prodev.prosperna.ph/home/page-builder/create | Verify Schema Published Time field is accessible | User is on SEO Schema tab | Click "Published Time:" | The action is completed successfully as expected | Published Time field/section is interactable |  | PASS |
| Page89 | https://prodev.prosperna.ph/home/page-builder/create | Verify Schema Modified Time field is accessible | User is on SEO Schema tab | Click "Modified Time:" | The action is completed successfully as expected | Modified Time field/section is interactable |  | PASS |

### 🔹 Payments

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Product Labels

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Product Reviews

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Refer and Earn

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
|  |  |  |  |  |  |  |  |  |

### 🔹 Register

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Reg-1 | https://prodev.prosperna.ph/account/register | Navigate to Register page | User is on login page | First Name, Last Name, Email, Password | The page or section opens successfully | Register page is displayed |  | PASS |
| Reg-2 | https://prodev.prosperna.ph/account/register | Validate required fields on empty submission | User is on Register page |  | The action is completed successfully as expected | All required fields show validation messages |  | PASS |
| Reg-3 | https://prodev.prosperna.ph/account/register | Validate email format | User is on Register page | {"email":"invalid"} | The action is completed successfully as expected | Invalid email validation message is shown |  | PASS |
| Reg-4 | https://prodev.prosperna.ph/account/register | Validate password mismatch | User is on Register page | {"password":"abcd","confirm":"1234"} | The action is completed successfully as expected | Password mismatch validation is displayed |  | PASS |
| Reg-5 | https://prodev.prosperna.ph/account/register | Toggle password visibility | User is on Register page |  | The action is completed successfully as expected | Password visibility toggles correctly |  | PASS |
| Reg-6 | https://prodev.prosperna.ph/account/register | Verify alternative login options | User is on Register page | {} | The action is completed successfully as expected | Alternative login options are visible |  | PASS |
| Reg-7 | https://prodev.prosperna.ph/account/register | Verify Continue with Google button | User is on Register page |  | The action is completed successfully as expected | Continue with Google button is visible |  | PASS |
| Reg-8 | https://prodev.prosperna.ph/account/register | Verify Back to Log In link | User is on Register page |  | The action is completed successfully as expected | Back to Log In link is visible |  | PASS |
| Reg-9 | https://prodev.prosperna.ph/account/register | Fill First Name | User is on Register page | {"first_name":"John"} | The field accepts and saves the entered value correctly | First Name field accepts input |  | PASS |
| Reg-10 | https://prodev.prosperna.ph/account/register | Fill Last Name | User is on Register page | {"last_name":"Doe"} | The field accepts and saves the entered value correctly | Last Name field accepts input |  | PASS |
| Reg-11 | https://prodev.prosperna.ph/account/register | Fill Email | User is on Register page | {"email":"unique_generated_email"} | The field accepts and saves the entered value correctly | Email field accepts valid email |  | PASS |
| Reg-12 | https://prodev.prosperna.ph/account/register | Fill Password | User is on Register page | {"password":"abcdE123!"} | The field accepts and saves the entered value correctly | Password field accepts valid password |  | PASS |
| Reg-13 | https://prodev.prosperna.ph/account/register | Fill Confirm Password | User is on Register page | {"confirm_password":"abcdE123!"} | The field accepts and saves the entered value correctly | Confirm Password matches Password |  | PASS |
| Reg-14 | https://prodev.prosperna.ph/account/register | Submit registration form | User has filled all required fields | {} | The action is completed successfully as expected | Registration form is submitted | Temporary user record created (pending verification) | PASS |
| Reg-15 | https://prodev.prosperna.ph/account/register | Verify registration success | User submitted registration form | {} | The action is completed successfully as expected | Email verification prompt is displayed | User record saved with unverified status | PASS |
| Reg-16 | https://prodev.prosperna.ph/account/login | Navigate back to Login page | User is on email verification page | Email, Password | The page or section opens successfully | User is redirected to Login page |  | PASS |

### 🔹 Reports

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Reports1 | https://prodev.prosperna.ph/home/reports | Navigate to Reports page | User is logged in and has access to Reports module |  | The page or section opens successfully | Reports page loads successfully |  | PASS |
| Reports2 | https://prodev.prosperna.ph/home/reports | Open Standard Reports | User is on Reports page |  | The page or section opens successfully | Standard Reports section is displayed |  | PASS |
| Reports3 | https://prodev.prosperna.ph/home/reports | Interact with Order Status filter | User is on Standard Reports page |  | The action is completed successfully as expected | Order Status filter dropdown opens |  | PASS |
| Reports4 | https://prodev.prosperna.ph/home/reports | Interact with Date filter | User is on Standard Reports page |  | The action is completed successfully as expected | Date filter control is accessible |  | PASS |
| Reports5 | https://prodev.prosperna.ph/home/reports | Interact with Payment Method filter | User is on Standard Reports page |  | The action is completed successfully as expected | Payment Method filter opens |  | PASS |
| Reports6 | https://prodev.prosperna.ph/home/reports | Interact with Store Location filter | User is on Standard Reports page |  | The action is completed successfully as expected | Store Location filter opens |  | PASS |
| Reports7 | https://prodev.prosperna.ph/home/reports | Interact with Shipping Method filter | User is on Standard Reports page |  | The action is completed successfully as expected | Shipping Method filter opens |  | PASS |
| Reports8 | https://prodev.prosperna.ph/home/reports | Interact with Due Date filter | User is on Standard Reports page |  | The action is completed successfully as expected | Due Date filter opens |  | PASS |
| Reports9 | https://prodev.prosperna.ph/home/reports | Interact with Search filter | User is on Standard Reports page | Click Search field | Matching results are displayed based on the search input | Search input is focused |  | PASS |
| Reports10 | https://prodev.prosperna.ph/home/reports | Clear applied filters | User is on Standard Reports page |  | The action is completed successfully as expected | All filters are cleared |  | PASS |
| Reports11 | https://prodev.prosperna.ph/home/reports | Apply selected filters | User is on Standard Reports page |  | The action is completed successfully as expected | Filters are applied to report results |  | PASS |
| Reports12 | https://prodev.prosperna.ph/home/reports | Verify Export button visibility | User is on Standard Reports page |  | The action is completed successfully as expected | Export button is visible |  | PASS |
| Reports13 | https://prodev.prosperna.ph/home/reports | Sort by Store Location | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Store Location |  | PASS |
| Reports14 | https://prodev.prosperna.ph/home/reports | Sort by Order ID | User is viewing report table | Click Order ID column | The table is sorted correctly based on the selected column | Table is sorted by Order ID |  | PASS |
| Reports15 | https://prodev.prosperna.ph/home/reports | Sort by Order Date | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Order Date |  | PASS |
| Reports16 | https://prodev.prosperna.ph/home/reports | Sort by Due Date | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Due Date |  | PASS |
| Reports17 | https://prodev.prosperna.ph/home/reports | Sort by Customer Name | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Customer Name |  | PASS |
| Reports18 | https://prodev.prosperna.ph/home/reports | Sort by Delivery Address | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Delivery Address |  | PASS |
| Reports19 | https://prodev.prosperna.ph/home/reports | Sort by Email Address | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Email Address |  | PASS |
| Reports20 | https://prodev.prosperna.ph/home/reports | Sort by Phone Number | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Phone Number |  | PASS |
| Reports21 | https://prodev.prosperna.ph/home/reports | Sort by Notes | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Notes |  | PASS |
| Reports22 | https://prodev.prosperna.ph/home/reports | Sort by Order Time | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Order Time |  | PASS |
| Reports23 | https://prodev.prosperna.ph/home/reports | Sort by Order Status | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Order Status |  | PASS |
| Reports24 | https://prodev.prosperna.ph/home/reports | Sort by Payment Type | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Payment Type |  | PASS |
| Reports25 | https://prodev.prosperna.ph/home/reports | Sort by Payment Status | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Payment Status |  | PASS |
| Reports26 | https://prodev.prosperna.ph/home/reports | Sort by Shipping Type | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Shipping Type |  | PASS |
| Reports27 | https://prodev.prosperna.ph/home/reports | Sort by Shipped By | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Shipped By |  | PASS |
| Reports28 | https://prodev.prosperna.ph/home/reports | Sort by Item | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Item |  | PASS |
| Reports29 | https://prodev.prosperna.ph/home/reports | Sort by Quantity | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Quantity |  | PASS |
| Reports30 | https://prodev.prosperna.ph/home/reports | Sort by Amount | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Amount |  | PASS |
| Reports31 | https://prodev.prosperna.ph/home/reports | Sort by Grand Total | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Grand Total |  | PASS |
| Reports32 | https://prodev.prosperna.ph/home/reports | Sort by Shipping Fee | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Shipping Fee |  | PASS |
| Reports33 | https://prodev.prosperna.ph/home/reports | Sort by Additional Fee | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Additional Fee |  | PASS |
| Reports34 | https://prodev.prosperna.ph/home/reports | Sort by Sub Total | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Sub Total |  | PASS |
| Reports35 | https://prodev.prosperna.ph/home/reports | Sort by Payment Gateway Fee | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Payment Gateway Fee |  | PASS |
| Reports36 | https://prodev.prosperna.ph/home/reports | Sort by Taxes | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Taxes |  | PASS |
| Reports37 | https://prodev.prosperna.ph/home/reports | Sort by Convenience Fee Total | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Convenience Fee Total |  | PASS |
| Reports38 | https://prodev.prosperna.ph/home/reports | Sort by Merchant Convenience Fee | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Merchant Convenience Fee |  | PASS |
| Reports39 | https://prodev.prosperna.ph/home/reports | Sort by Customer Convenience Fee | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Customer Convenience Fee |  | PASS |
| Reports40 | https://prodev.prosperna.ph/home/reports | Sort by Discount | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Discount |  | PASS |
| Reports41 | https://prodev.prosperna.ph/home/reports | Sort by Total Income | User is viewing report table |  | The table is sorted correctly based on the selected column | Table is sorted by Total Income |  | PASS |
| Reports42 | https://prodev.prosperna.ph/home/reports | View Total Discounts metric | User is on Standard Reports page |  | The metric value is displayed correctly | Total Discounts metric is displayed |  | PASS |
| Reports43 | https://prodev.prosperna.ph/home/reports | View Total Net Sales metric | User is on Standard Reports page |  | The metric value is displayed correctly | Total Net Sales metric is displayed |  | PASS |
| Reports44 | https://prodev.prosperna.ph/home/reports | View Total Quantity Sold metric | User is on Standard Reports page |  | The metric value is displayed correctly | Total Quantity Sold metric is displayed |  | PASS |
| Reports45 | https://prodev.prosperna.ph/home/reports | View Total Gross Sales metric | User is on Standard Reports page |  | The metric value is displayed correctly | Total Gross Sales metric is displayed |  | PASS |
| Reports46 | https://prodev.prosperna.ph/home/reports | Search report by Order ID | User is on Standard Reports page | Search Order ID value | Matching results are displayed based on the search input | Matching report row is displayed |  | PASS |
| Reports47 | https://prodev.prosperna.ph/home/reports | Open report row from search result | User has search results | Click matching Order ID cell | Matching results are displayed based on the search input | Report row details are opened |  | PASS |

### 🔹 Shipping

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Shipping1 | https://prodev.prosperna.phhome/shipping-settings | Update shipping description and verify store checkout shows updated label | User is logged in; store and shipping settings are accessible |  | The option state is updated successfully | Shipping description is updated, visible on storefront checkout, then reverted successfully | Shipping settings content updated | PASS |
| Shipping2 | https://prodev.prosperna.phhome/shipping-settings | Navigate to Shipping Settings page | User is logged in; has access to Shipping Settings |  | The page or section opens successfully | Shipping Settings page loads successfully |  | PASS |
| Shipping3 | https://prodev.prosperna.phhome/shipping-settings | Verify Standard Delivery section is visible | User is on Shipping Settings page |  | The action is completed successfully as expected | “Standard Delivery” is visible |  | PASS |
| Shipping4 | https://prodev.prosperna.phhome/shipping-settings | Open Manage modal for Standard Delivery | User is on Shipping Settings page |  | The page or section opens successfully | Manage modal opens for Standard Delivery |  | PASS |
| Shipping5 | https://prodev.prosperna.phhome/shipping-settings | Disable Bank Transfer payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Bank Transfer becomes unchecked/disabled |  | PASS |
| Shipping6 | https://prodev.prosperna.phhome/shipping-settings | Enable Bank Transfer payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Bank Transfer becomes checked/enabled |  | PASS |
| Shipping7 | https://prodev.prosperna.phhome/shipping-settings | Disable Cash on Delivery payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Cash on Delivery becomes unchecked/disabled |  | PASS |
| Shipping8 | https://prodev.prosperna.phhome/shipping-settings | Enable Cash on Delivery payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Cash on Delivery becomes checked/enabled |  | PASS |
| Shipping9 | https://prodev.prosperna.phhome/shipping-settings | Disable Credit Card payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Credit Card becomes unchecked/disabled |  | PASS |
| Shipping10 | https://prodev.prosperna.phhome/shipping-settings | Enable Credit Card payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Credit Card becomes checked/enabled |  | PASS |
| Shipping11 | https://prodev.prosperna.phhome/shipping-settings | Disable E-Wallets payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | E-Wallets becomes unchecked/disabled |  | PASS |
| Shipping12 | https://prodev.prosperna.phhome/shipping-settings | Enable E-Wallets payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | E-Wallets becomes checked/enabled |  | PASS |
| Shipping13 | https://prodev.prosperna.phhome/shipping-settings | Disable Over The Counter payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Over The Counter becomes unchecked/disabled |  | PASS |
| Shipping14 | https://prodev.prosperna.phhome/shipping-settings | Enable Over The Counter payment option in Manage modal | Manage modal is open |  | The option state is updated successfully | Over The Counter becomes checked/enabled |  | PASS |
| Shipping15 | https://prodev.prosperna.phhome/shipping-settings | Open Business Pickup Address section | User is on Shipping Settings page |  | The page or section opens successfully | Business Pickup Address section expands/displays |  | PASS |
| Shipping16 | https://prodev.prosperna.phhome/shipping-settings | Open edit pickup address row action for Laguna Branch | User is in Business Pickup Address section |  | The page or section opens successfully | Edit pickup address dialog opens |  | PASS |
| Shipping17 | https://prodev.prosperna.phhome/shipping-settings | Fill Save Address as field in pickup address dialog | Pickup address dialog is open | Save Address as = “Test” | The field accepts and saves the entered value correctly | Field accepts value “Test” |  | PASS |
| Shipping18 | https://prodev.prosperna.phhome/shipping-settings | Fill Business Address field in pickup address dialog | Pickup address dialog is open | Business Address = “Test” | The field accepts and saves the entered value correctly | Field accepts value “Test” |  | PASS |
| Shipping19 | https://prodev.prosperna.phhome/shipping-settings | Open Region dropdown in pickup address dialog | Pickup address dialog is open | Click Region react-select | The page or section opens successfully | Region options list is displayed |  | PASS |
| Shipping20 | https://prodev.prosperna.phhome/shipping-settings | Select Region = Metro Manila | Pickup address dialog dropdown is open |  | The action is completed successfully as expected | Region is set to Metro Manila |  | PASS |
| Shipping21 | https://prodev.prosperna.phhome/shipping-settings | Open City dropdown in pickup address dialog | Pickup address dialog is open | Click City react-select | The page or section opens successfully | City options list is displayed |  | PASS |
| Shipping22 | https://prodev.prosperna.phhome/shipping-settings | Select City = Muntinlupa | Pickup address dialog dropdown is open |  | The action is completed successfully as expected | City is set to Muntinlupa |  | PASS |
| Shipping23 | https://prodev.prosperna.phhome/shipping-settings | Open Barangay dropdown in pickup address dialog | Pickup address dialog is open | Click Barangay react-select | The page or section opens successfully | Barangay options list is displayed |  | PASS |
| Shipping24 | https://prodev.prosperna.phhome/shipping-settings | Select Barangay = Alabang | Pickup address dialog dropdown is open |  | The action is completed successfully as expected | Barangay is set to Alabang |  | PASS |
| Shipping25 | https://prodev.prosperna.phhome/shipping-settings | Fill Contact Person in pickup address dialog | Pickup address dialog is open | Contact Person = “Test” | The field accepts and saves the entered value correctly | Field accepts value “Test” |  | PASS |
| Shipping26 | https://prodev.prosperna.phhome/shipping-settings | Fill Contact Number in pickup address dialog | Pickup address dialog is open | Contact Number = “+63 0917 11111111” | The field accepts and saves the entered value correctly | Field accepts the phone number value |  | PASS |
| Shipping27 | https://prodev.prosperna.phhome/shipping-settings | Open Store Location dropdown in pickup address dialog | Pickup address dialog is open | Click Store Location react-select | The page or section opens successfully | Store Location options list is displayed |  | PASS |
| Shipping28 | https://prodev.prosperna.phhome/shipping-settings | Select Store Location = Laguna Branch | Pickup address dialog dropdown is open |  | The action is completed successfully as expected | Store Location is set to Laguna Branch |  | PASS |
| Shipping29 | https://prodev.prosperna.phhome/shipping-settings | Save pickup address dialog | Pickup address dialog is open |  | Changes are saved successfully | Pickup address is saved successfully | Pickup address saved/updated | PASS |
| Shipping30 | https://prodev.prosperna.phhome/shipping-settings | Open edit pickup address row action for “Laguna Branch Test Alabang,” | User is in Business Pickup Address section |  | The page or section opens successfully | Edit pickup address dialog opens |  | PASS |
| Shipping31 | https://prodev.prosperna.phhome/shipping-settings | Update Save Address as field in pickup address dialog | Pickup address dialog is open | Save Address as = “Store” | The field accepts and saves the entered value correctly | Field accepts value “Store” |  | PASS |
| Shipping32 | https://prodev.prosperna.phhome/shipping-settings | Update Business Address field in pickup address dialog | Pickup address dialog is open | Business Address = “Store” | The field accepts and saves the entered value correctly | Field accepts value “Store” |  | PASS |
| Shipping33 | https://prodev.prosperna.phhome/shipping-settings | Save pickup address dialog after updates | Pickup address dialog is open |  | The field accepts and saves the entered value correctly | Updated pickup address is saved successfully | Pickup address updated | PASS |

### 🔹 Store

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Store1 | https://prodev.prosperna.ph/home/settings/store | Open Store Settings and navigate to Taxes | User is logged in and can access Store Settings |  | The page or section opens successfully | User lands on Store Settings and successfully clicks the Taxes menu |  | PASS |
| Store2 | https://prodev.prosperna.ph/home/settings/store | Open Tax page from Taxes section | User is on Taxes section in Store Settings |  | The page or section opens successfully | Tax page opens successfully |  | PASS |
| Store3 | https://prodev.prosperna.ph/home/settings/store | Click Enable Tax Collection label | User is on Tax page |  | The option state is updated successfully | Enable Tax Collection label/section is interacted successfully |  | PASS |
| Store4 | https://prodev.prosperna.ph/home/settings/store | Verify “Taxes will be added on top of…” note is visible | User is on Tax page where tax note is displayed | {} | The action is completed successfully as expected | Tax note text is visible |  | PASS |
| Store5 | https://prodev.prosperna.ph/home/settings/store | Enable tax collection toggle | User is on Tax page and tax toggle is available |  | The option state is updated successfully | Tax collection is enabled (toggle checked) | Tax collection setting updated | PASS |
| Store6 | https://prodev.prosperna.ph/home/settings/store | Verify tax settings success message (optional) | User has enabled tax collection and system may show toast/alert |  | The action is completed successfully as expected | Success message appears if applicable |  | PASS |
| Store7 | https://prodev.prosperna.ph/home/settings/store | Open “Taxes per State/Province” section | User is on Tax page |  | The page or section opens successfully | Taxes per State/Province section expands/opens |  | PASS |
| Store8 | https://prodev.prosperna.ph/home/settings/store | Click Select Location dropdown label | User is in Taxes per State/Province section |  | The action is completed successfully as expected | Select Location control is focused/opened for interaction |  | PASS |
| Store9 | https://prodev.prosperna.ph/home/settings/store | Verify location input is visible | User is in Taxes per State/Province section |  | The action is completed successfully as expected | Location dropdown input container is visible |  | PASS |
| Store10 | https://prodev.prosperna.ph/home/settings/store | Verify Create Tax button is visible | User is in Taxes per State/Province section | {} | The action is completed successfully as expected | Create Tax button is visible |  | PASS |
| Store11 | https://prodev.prosperna.ph/home/settings/store | Open location dropdown | User is in Taxes per State/Province section |  | The page or section opens successfully | Location dropdown opens and shows options |  | PASS |
| Store12 | https://prodev.prosperna.ph/home/settings/store | Select “All Locations” from location dropdown | Location dropdown is open |  | The action is completed successfully as expected | “All Locations” is selected |  | PASS |
| Store13 | https://prodev.prosperna.ph/home/settings/store | Click Create Tax button | User selected a location (or default is set) |  | The action is completed successfully as expected | Create Tax action is triggered / tax form is available |  | PASS |
| Store14 | https://prodev.prosperna.ph/home/settings/store | Focus first tax percentage input | User is on tax creation/edit form |  | The action is completed successfully as expected | First tax percentage input is focused |  | PASS |
| Store15 | https://prodev.prosperna.ph/home/settings/store | Enter first tax percentage = 12 | User is on tax creation/edit form | {"tax_1":"12"} | The field accepts and saves the entered value correctly | First tax percentage is set to 12 |  | PASS |
| Store16 | https://prodev.prosperna.ph/home/settings/store | Open region dropdown | User is on tax creation/edit form |  | The page or section opens successfully | Region dropdown opens |  | PASS |
| Store17 | https://prodev.prosperna.ph/home/settings/store | Select “National Capital Region -” in region dropdown | Region dropdown is open | {"region":"National Capital Region -"} | The action is completed successfully as expected | Region is selected successfully |  | PASS |
| Store18 | https://prodev.prosperna.ph/home/settings/store | Focus second tax percentage input | User is on tax creation/edit form |  | The action is completed successfully as expected | Second tax percentage input is focused |  | PASS |
| Store19 | https://prodev.prosperna.ph/home/settings/store | Enter second tax percentage = 15 | User is on tax creation/edit form | {"tax_2":"15"} | The field accepts and saves the entered value correctly | Second tax percentage is set to 15 |  | PASS |
| Store20 | https://prodev.prosperna.ph/home/settings/store | Save tax settings | User has provided tax values and required selections |  | Changes are saved successfully | Save action completes successfully | Tax settings updated | PASS |
| Store21 | https://prodev.prosperna.ph/home/settings/store | Verify business operations settings update success message | User clicked Save | {} | The field accepts and saves the entered value correctly | Success message “Successfully updated business operations settings.” is visible |  | PASS |
| Store22 | https://prodev.prosperna.ph/home/settings/store | Click garage icon (󰆴) then Save | User is on Store Settings page where icon is available |  | Changes are saved successfully | Garage/icon action is triggered and settings can be saved (if changes exist) | Possible settings update (depends on app behavior) | PASS |

### 🔹 Store Branding

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| PAICred3 | https://prodev.prosperna.ph/home/design-settings | Verify access to Store Branding and Store Logo | User is logged in and has access to Design Settings |  | Store Branding page loads | Store Branding and Store Logo sections are visible |  | PASS |

### 🔹 Storefront

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Product15 | (newstore) | Verify published product appears on storefront for selected location | User has published product and enabled locations; storefront accessible | Select location="My Cafe..."; Search="Test2"; open product image; verify heading "Test2" | The action is completed successfully as expected | Product is visible on storefront for chosen location |  | PASS |

### 🔹 Template

| ID | URL Path | Test Scenario | Preconditions | Parameters | Expected Status | Expected Response | Expected DB / Side Effects | Result |
|----|----------|---------------|---------------|------------|-----------------|------------------|----------------------------|--------|
| Template1 | https://prodev.prosperna.ph/home/template-library | Open Template Library page | User is logged in and has access to Template Library |  | The page or section opens successfully | Template Library page loads successfully |  | PASS |
| Template2 | https://prodev.prosperna.ph/home/template-library | Access Template Library via navigation link | User is logged in |  | The action is completed successfully as expected | User is redirected to Template Library page |  | PASS |
| Template3 | https://prodev.prosperna.ph/home/template-library | Sort templates by Template Name | User is on Template Library page |  | The table is sorted correctly based on the selected column | Templates are sorted by Template Name column |  | PASS |
| Template4 | https://prodev.prosperna.ph/home/template-library | Sort templates by Template Type | User is on Template Library page |  | The table is sorted correctly based on the selected column | Templates are sorted by Template Type column |  | PASS |
| Template5 | https://prodev.prosperna.ph/home/template-library | Sort templates by Status | User is on Template Library page |  | The table is sorted correctly based on the selected column | Templates are sorted by Status column |  | PASS |
| Template6 | https://prodev.prosperna.ph/home/template-library | Sort templates by Applied To | User is on Template Library page |  | The table is sorted correctly based on the selected column | Templates are sorted by Applied To column |  | PASS |
| Template7 | https://prodev.prosperna.ph/home/template-library | Sort templates by Author | User is on Template Library page |  | The table is sorted correctly based on the selected column | Templates are sorted by Author column |  | PASS |
| Template8 | https://prodev.prosperna.ph/home/template-library | Sort templates by Last Modified | User is on Template Library page |  | The table is sorted correctly based on the selected column | Templates are sorted by Last Modified column |  | PASS |
| Template9 | https://prodev.prosperna.ph/home/template-library | Interact with Actions column | User is on Template Library page |  | The action is completed successfully as expected | Actions column responds to user interaction |  | PASS |
| Template10 | https://prodev.prosperna.ph/home/template-library | Open template row action menu | User is on Template Library page with existing templates |  | The page or section opens successfully | Template row action menu opens |  | PASS |
| Template11 | https://prodev.prosperna.ph/home/template-library | Open Quick Edit modal for a template | User opened template actions |  | The page or section opens successfully | Quick Edit option opens successfully |  | PASS |
| Template12 | https://prodev.prosperna.ph/home/template-library | Navigate to Edit Template modal | User selected Edit Template |  | The page or section opens successfully | Edit Template modal is displayed |  | PASS |
| Template13 | https://prodev.prosperna.ph/home/template-library | Focus Template Name field | User is in Edit Template modal |  | The action is completed successfully as expected | Template Name field is focused and editable |  | PASS |
| Template14 | https://prodev.prosperna.ph/home/template-library | View Template Type field | User is in Edit Template modal |  | The page or section opens successfully | Template Type field is visible |  | PASS |
| Template15 | https://prodev.prosperna.ph/home/template-library | Open Apply To section | User is in Edit Template modal |  | The page or section opens successfully | Apply To section becomes active |  | PASS |
| Template16 | https://prodev.prosperna.ph/home/template-library | Select All Pages option | User is editing template Apply To settings | {"apply_to":"All Pages"} | The action is completed successfully as expected | Template is set to apply to all pages |  | PASS |
| Template17 | https://prodev.prosperna.ph/home/template-library | Switch to Specific Pages option | User is editing template Apply To settings | {"apply_to":"Specific Pages"} | The action is completed successfully as expected | Specific Pages option is selectable |  | PASS |
| Template18 | https://prodev.prosperna.ph/home/template-library | Select None option for Apply To | User is editing template Apply To settings | {"apply_to":"None"} | The action is completed successfully as expected | Template is set to apply to no pages |  | PASS |
| Template19 | https://prodev.prosperna.ph/home/template-library | Verify Cancel button visibility | User is in Edit Template modal |  | The action is completed successfully as expected | Cancel button is visible |  | PASS |
| Template20 | https://prodev.prosperna.ph/home/template-library | Verify Save button visibility | User is in Edit Template modal |  | Changes are saved successfully | Save button is visible |  | PASS |
