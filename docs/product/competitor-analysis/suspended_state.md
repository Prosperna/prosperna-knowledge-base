---
id: suspended-state
title: What happens when your ecommerce platform subscription lapses
sidebar_label: Suspended State
sidebar_position: 6
---

**Most major ecommerce platforms do not permanently delete store data the instant a subscription expires — but the grace periods, data retention windows, and storefront behaviors vary dramatically.** Of the 17 platforms researched, 8 offer some form of permanently free tier (though several come with significant caveats), while the remaining 9 rely exclusively on paid subscriptions with trial periods. The practical consequences of a lapse range from a gentle downgrade to a free tier (Square Online, Wix) to permanent data deletion within weeks (GoDaddy). Understanding these differences is critical for merchants evaluating platform risk and data portability.

---

## Platforms with a free forever tier

Before examining lapse behavior, it's important to identify which platforms offer a permanently free plan that supports actual ecommerce (not just a website). The following platforms have a free-forever option that allows merchants to run a store indefinitely, though each comes with limitations:

- **Square Online** — Full free plan with unlimited products, order management, shipping, and payment processing. Higher transaction fees (**3.3% + $0.30**) and Square branding apply. No custom domain on the free tier.
- **Big Cartel** — Free "Gold" plan supports **up to 5 products** with 1 image each. Accepts Stripe and PayPal. No inventory tracking or discount codes. Designed for artists and makers with small catalogs.
- **Weebly** — Free plan includes basic ecommerce (shopping cart, unlimited items, inventory management). However, **Weebly is effectively in maintenance mode** following Square's 2018 acquisition. The mobile app was discontinued December 2025, and Square has committed to maintaining support only "through at least July 2026." Not recommended for new stores.
- **WooCommerce** — The core WordPress plugin is **fully free and open-source** (GPL). Unlimited products, no transaction fees from WooCommerce itself. However, merchants must self-host, meaning they pay separately for web hosting ($3–$200+/month), domain, and SSL.
- **PrestaShop Classic** — **Free open-source software** with no license fees. Requires self-hosting. PrestaShop also offers a paid hosted version (PrestaShop Hosted) starting at €24/month. A previous free cloud service (PrestaShop Cloud) was shut down in 2016–2017.
- **OpenCart** — Free open-source ecommerce platform (GPLv3). Self-hosted; merchant handles all infrastructure. OpenCart Cloud is a separate paid offering ($59–$199/month).
- **Shopware Community Edition** — Free open-source edition (MIT license) for self-hosted stores generating **under €1 million GMV/year**. Stores exceeding that threshold must upgrade to paid plans starting at €600/month.
- **Shift4Shop** — Offers a $0/month "End-to-End eCommerce" plan, but with **strict conditions**: US-based merchants only, must use Shift4 Payments as processor, and must process a minimum of **$500/month in sales**. Failing to meet the threshold incurs a $29/month charge.

**Wix** and **GoDaddy** deserve special mention: both offer free website tiers, but **neither allows ecommerce transactions on their free plans**. Wix requires at least the Core plan ($29/month) to accept payments, and GoDaddy requires the Commerce plan (~$25–$30/month).

For the self-hosted open-source platforms (WooCommerce, PrestaShop, OpenCart, Magento Open Source, Shopware Community), the concept of a "subscription lapse" shifts to the hosting provider. When hosting expires, the typical pattern across providers is: **site goes offline immediately**, a **15–30 day grace period** during which files and databases remain on the server, and then **permanent deletion**. Merchants who maintain their own backups can restore to any compatible host at any time — a significant advantage of self-hosted platforms.

---

## Shopify freezes stores but preserves data for two years

Shopify does not offer a free plan. Its 3-day free trial (followed by a $1/month promotional period for 3 months) leads to paid plans starting at $5/month (Starter) or $39/month (Basic) for a full online store.

**When the free trial expires** without selecting a plan, the store enters a **frozen state**. No data is deleted. The admin dashboard becomes restricted — the merchant can log in but is prompted to choose a plan and cannot make changes. During the trial itself, checkout is already disabled, and the storefront displays a **password-protected page** that cannot be customized.

**When a paid subscription lapses** due to failed payments, the store also freezes. The storefront goes completely dark — **customers cannot view the store at all**. The merchant loses access to the Shopify admin. Custom domains are disconnected. However, Shopify continues to serve Thank You and Order Status pages for 30 days so existing customers can track recent orders.

**When a merchant voluntarily cancels**, the store deactivates at the end of the billing cycle. All store data — products, orders, customer information, themes, and customizations — is **preserved for up to 2 years**. The merchant can reactivate at any time within that window by logging in, paying outstanding charges, and selecting a new plan, with all data intact. After 2 years, data is permanently deleted and the store becomes unrecoverable. Shopify also offers a **"Pause and Build" plan at $9/month** that keeps the storefront visible to customers but disables checkout, while maintaining full admin access.

---

## BigCommerce gives 90 days, then permanently deletes

BigCommerce has no free plan. It offers a **15-day free trial** (no credit card required), with paid plans starting at $29/month (Standard).

**When the trial expires**, the store becomes inaccessible to customers. The merchant can log in but only to choose a plan — all other admin functions are locked. BigCommerce's official pricing FAQ states plainly: **"We'll keep your data for 90 days — just choose a subscription plan to get your store up and running again."** During this 90-day window, selecting a paid plan restores the store with all data intact.

**After 90 days, the store is automatically deleted and BigCommerce states they can no longer restore it.** One third-party source suggests contacting BigCommerce's Account Services team may yield results even after the deadline, but this is not guaranteed. The same 90-day retention policy appears to apply to cancelled paid subscriptions, though BigCommerce's documentation primarily states this in the trial context. During the trial period, the store is never publicly visible — search engines cannot index it and visitors cannot browse it.

---

## Wix downgrades to a free site; Squarespace goes dark in 30 days

**Wix** takes a fundamentally different approach from most platforms. When a premium ecommerce plan expires, the site **does not go offline**. Instead, it **reverts to Wix's free tier**. The website remains live and published, but Wix ads appear, the custom domain is disconnected (reverting to a wixsite.com subdomain), and — critically for ecommerce — **payment processing is disabled**. Product pages may still be visible to visitors, but customers cannot check out or complete purchases. The merchant retains **full admin and editor access** and all site content is preserved indefinitely as a free Wix site. Reactivation simply requires purchasing a new premium plan. Wix also provides advance notice: reminder emails are sent 30 days before subscription expiration.

**Squarespace** is far less forgiving. It offers only a **14-day free trial** (extendable once to 21 days) with no free tier whatsoever. When a trial expires, the site goes offline and displays a **"Website expired" page** with an "Owner login" link. Content is marked for permanent deletion, though Squarespace's documentation is deliberately vague about exact timelines, stating recovery depends on "how much time passes." Their Troubleshooting Lost Content page provides the clearest guidance: **content may be permanently deleted after 30 days**. Their Data Processing Addendum offers a separate 90-day window for formal data retrieval requests.

When a paid Squarespace subscription is cancelled, the merchant can choose immediate cancellation or let it run until the end of the billing cycle. Either way, once expired, the site displays the same "Website expired" page. The owner **can still log in** to access billing, domains, import/export tools, past orders, customer data, contacts, and email campaigns — but cannot edit or publish the site. Cancellation is distinct from deletion: cancelling takes the site offline but does not trigger permanent data removal. Manual site deletion is a separate, irreversible action. Digital product subscriptions enter a **30-day pause state** — if the site is reactivated within 30 days, subscribers are reinstated. After 30 days, customers must re-subscribe from scratch.

---

## Ecwid's free plan is gone; Volusion requires calling to cancel

**Ecwid** (by Lightspeed) historically offered a well-known "Free Forever" plan, but **this was fully retired on November 20, 2025**. All existing free-plan merchants received emails stating their stores would be closed unless they upgraded. Reports from Trustpilot users in December 2025 confirm that Ecwid blocked dashboard access and data retrieval for non-upgrading free users. The cheapest plan is now Starter at **$5/month** (up to 10 products).

For payment failures on paid plans, Ecwid provides a **5-day grace period** (15 days for SEPA Direct Debit), during which the store and admin function normally. After the grace period, the storefront goes offline and admin access is restricted. However, data is preserved — merchants can upgrade back at any time to restore their store. Full account deletion (a separate action from cancellation) permanently erases all products, customer information, order history, and store settings after a brief grace period. An exception exists for Ecwid installed via the Wix App Market, where a free plan may still be available under different terms.

**Volusion**, which emerged from Chapter 11 bankruptcy in January 2021 and now serves approximately **5,000 active stores** (down from 30,000+), offers only a 14-day free trial with no free tier. Its Terms of Service state bluntly that upon termination, **"Your Sites will be taken offline"** and **"You will no longer be able to access Your Account."** The ToS explicitly disclaims archive responsibility: "Our servers are not an archive and We shall have no liability to You or any other person for loss, damage or destruction of any of Your Sites or Your Content." No specific data retention timeline is documented. Cancellation requires **contacting Volusion directly** via live chat, phone call, or scheduled call — there is no self-service cancellation option. Multiple BBB complaints document Volusion continuing to bill merchants after they believed accounts were closed.

---

## Shift4Shop may delete your site within 14 days of signup

**Shift4Shop's** free plan (for qualifying US merchants) comes with an aggressive early-stage policy buried in the Terms of Service: if a new merchant **does not set up a payment processor within 14 days** of signup, Shift4Shop reserves the right to **terminate the agreement and delete/purge the site entirely**. This is corroborated by a Capterra user review describing an email threatening site deletion for not registering their payment processor.

For ongoing non-payment (on the $29/month charges that apply when the $500/month processing minimum isn't met), Shift4Shop follows a two-step process: a **10-day suspension period** during which account access is restricted but reinstatement is possible by paying the balance in full, followed by a **14-day termination right** where Shift4Shop may permanently suspend or terminate the agreement. Reinstatement fees may apply. The ToS does not guarantee preservation of store content after cancellation, and user reports suggest accounts may be fully deleted. Confidential information is retained for **3 years** per the ToS, but this applies to business information, not necessarily store content and product data.

---

## GoDaddy's 50-day countdown and Salesforce's enterprise contracts

**GoDaddy Online Store** follows a well-documented, tiered expiration timeline. For the first **10 days** after subscription expiration, the site remains fully live and accessible — the merchant can renew normally. From **days 10–20**, the account is suspended and visitors see a **suspension message** on the site. After **day 20**, the site goes completely offline. The merchant then has **30 additional days** (through day 50) to contact GoDaddy support and request a restore. After day 50, data may be permanently deleted. No self-service recovery exists after the site goes offline at day 20 — it requires contacting GoDaddy support.

**Salesforce Commerce Cloud** operates entirely on enterprise contracts with negotiated terms. Subscriptions **auto-renew** unless either party provides 30 days' written notice before the term ends. Since Commerce Cloud is fully cloud-hosted by Salesforce, the storefront goes offline when the contract expires. Fees are non-cancelable and non-refundable during the subscription term. Experts recommend negotiating a **60-day data retrieval clause** upon termination, as standard terms may not provide a generous window for exporting data.

**Adobe Commerce** (the paid enterprise version of Magento, starting at $22,000/year) follows a similar contract-based model. For the Cloud edition, stores go offline when the contract ends. For self-hosted Adobe Commerce, the merchant retains server access but loses the right to use proprietary code and features. **Magento Open Source** has no subscription — it's free, self-hosted software that runs indefinitely.

---

## Conclusion

The landscape divides cleanly into three categories of risk. **Lowest risk** belongs to self-hosted open-source platforms (WooCommerce, PrestaShop, OpenCart, Magento Open Source, Shopware Community) where merchants own their data outright and platform subscription lapses are irrelevant — only hosting matters. **Moderate risk** applies to platforms with free fallback tiers (Square Online, Wix, Big Cartel, Weebly) where a lapse means feature loss but not data loss. **Highest risk** sits with purely subscription-based SaaS platforms where a lapse means the store goes dark entirely.

Among the high-risk group, **Shopify's 2-year data retention** stands out as exceptionally generous compared to **BigCommerce's 90 days** and **GoDaddy's roughly 50 days**. Squarespace's **~30 day** practical window for content recovery is notably short, and **Volusion's** complete lack of documented retention timelines is concerning. The most aggressive policy belongs to **Shift4Shop**, which reserves the right to delete sites within 14 days of signup if payment processing isn't configured.

Two major shifts since 2024 deserve emphasis: **Ecwid's elimination of its free tier** in November 2025 removed a popular entry point for small merchants, and **Weebly's impending sunset** (likely after July 2026) means merchants on that platform face forced migration to Square Online with no automated transfer path. Merchants evaluating platforms should weigh not just current pricing but data portability, retention guarantees, and the platform's long-term viability.