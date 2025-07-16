---
id: cloudflare-dns-ssl
title: Cloudflare DNS & SSL
sidebar_label: 🌐 Cloudflare DNS & SSL
---

# Cloudflare DNS & SSL

This guide explains how we manage subdomains, DNS routing, cache purging, and SSL certificates using Cloudflare in combination with AWS services (particularly ALB and Lambda).

---

## 🌐 Overview

At Prosperna, we use Cloudflare for DNS and SSL management across our environments. Most of our domains (e.g., `p1.prosperna.com`, `admin.prosperna.com`, `prodstore.prosperna.com`) are routed via Cloudflare to our Application Load Balancer (ALB) in AWS.

We use:
- **Listener Rules** on the ALB to route traffic to proper target groups
- **Cloudflare** for DNS, SSL termination, caching, and firewall features
- **AWS Lambda** for automating SSL certificate issuance and renewal for merchant custom domains

---

## 📜 Subdomain Setup

### Step-by-Step: Adding a New Subdomain

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Choose domain: `prosperna.com`
3. Click **DNS** > **Add record**
4. Type: `CNAME`
5. Name: `example` → for `example.prosperna.com`
6. Target: `prosperna1-prod-alb-83103502.ap-southeast-1.elb.amazonaws.com`
7. TTL: Auto
8. Proxy status: **DNS Only** (gray cloud)

This setup ensures that the AWS-managed SSL certificate for the subdomain is served properly, as Cloudflare's Universal SSL is bypassed in favor of ACM.

> ℹ️ For Prosperna-owned subdomains, we use AWS Certificate Manager (ACM) and set them to **DNS Only** in Cloudflare to let the ALB serve the SSL directly.

---

## ⚙️ ALB Listener Rules

Our Application Load Balancer (`prosperna1-prod-alb`) listens on port **443 (HTTPS)** and uses **Host Header rules** to match domains or paths, and forward them to the right target group.

### 🔁 Example Routing Rules

| Rule Name | Host Header / Path | Target Group | Purpose |
|----------|---------------------|---------------|---------|
| Merchant Builder | `/builder*` | `p1-builder-production-TG` | Web app builder |
| Admin Panel | `admin.prosperna.com` | `P1-Production-Group` | Internal UI |
| Customer Site | `prodstore.prosperna.com` | `p1-prod-customer-tg` | Public storefront |
| Custom Domains | `www.*.com`, `*.*.store`, etc. | `p1-prod-customer-tg` | Merchant domains |
| JS App | `p1.prosperna.com` | `P1-Production-Group` | JavaScript hosting |
| Redirect | `/themes` on `p1.prosperna.com` | Redirect to `themes.prosperna.com` | SEO/backward compat |

> 🧐 The ALB acts as a single point to route multiple subdomains and customer domains to their respective microservices.

### 💡 Target Group Meaning
- `P1-Production-Group` → Merchant-facing front-end (builder, admin, main app)
- `p1-prod-customer-tg` → Customer-facing store front-end (custom and default domains)

---

## 🔒 SSL Certificate Management

SSL is handled in two ways depending on domain ownership:

### 1. For Prosperna Subdomains (e.g., `admin.prosperna.com`, `p1.prosperna.com`)
- Managed in **AWS Certificate Manager (ACM)**
- Cloudflare DNS set to **DNS Only**
- Certificate is attached to the ALB Listener

### 2. For Custom Domains (e.g., `www.juanstore.com`)
- Merchant sets up a **CNAME** from their domain registrar:
  - `www.juanstore.com` → `myprospernastore.prosperna.com`
  - A second **CNAME** is added for SSL validation (provided by ACM)
- Our web app auto-triggers a Lambda function:
  - Requests cert from ACM
  - Adds validation record to Cloudflare
  - Attaches cert to ALB Listener
  - Stores metadata in AWS Secrets Manager

> 🔄 Certificate renewals are handled automatically by AWS Certificate Manager.

---

## 🚀 Purging Cache

To manually purge cache:

1. Go to Cloudflare Dashboard > `prosperna.com`
2. Navigate to **Caching** > **Configuration**
3. Click **Purge Everything** *(for emergency changes)*
4. Or use **Custom Purge** for specific paths/domains

> ⚠️ Use this only after verifying updates don’t auto-propagate. Most changes (like HTML/CSS updates) should be cache-busted with query strings or versioned assets.

---

## 🧪 Troubleshooting

| Issue | Solution |
|-------|----------|
| DNS doesn’t propagate | Verify CNAME/Proxy status in Cloudflare |
| SSL not secure | Check ACM cert + Listener + Cloudflare DNS mode |
| Custom domain 404 | Ensure cert + listener + DNS match |

---

## ✅ Summary

- Cloudflare manages DNS; most records set to **DNS Only**
- Subdomain SSLs handled in AWS ACM; custom domains handled via automation
- ALB listener rules map host/path to correct ECS target group
- Caching can be purged via Cloudflare

> 🔐 Cloudflare + ALB + ACM + Lambda = fully automated domain and SSL orchestration for Prosperna’s multi-tenant SaaS.

---

## 📌 Related Docs
- [GitHub Actions CI/CD Pipeline](https://pkb.prosperna.ph/docs/engineering/devops/github-actions)
- [Microservice Deployment Guidelines](https://pkb.prosperna.ph/docs/engineering/devops/microservices)
- [AWS KMS Usage Guide](https://pkb.prosperna.ph/docs/engineering/devops/aws-kms)

