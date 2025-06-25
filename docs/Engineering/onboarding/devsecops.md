---
id: devsecops
title: DevSecOps at Prosperna
sidebar_label: 🛡 DevSecOps Guide
---

# 🛡 DevSecOps at Prosperna

This guide explains how we build, secure, and deploy software at Prosperna. Every engineer is expected to understand and follow these practices to ensure reliable and secure delivery.

---

## 🚀 Overview of Our DevSecOps Flow

We follow a **DevSecOps** culture — integrating security into our development and delivery process. We use:

- **GitHub Actions** for CI/CD automation
- **AWS ECS (Elastic Container Service)** for container orchestration
- **AWS KMS** for secret encryption
- **TypeScript + npm** as our core language/tooling
- **ClickUp** to coordinate deployments and task handoffs

---

## 🔁 CI/CD Pipeline (GitHub Actions)

### Triggered on:

- Pushes to `develop`, `staging`, and `main`
- Pull Requests to enforce tests and quality gates

### CI Pipeline Steps:

1. **Lint Check**
2. **TypeScript Compile Check**
3. **Unit/Integration Tests**
4. **Secrets Scan (GitHub Advanced Security or truffleHog)**
5. **Build Docker Image**
6. **Push to Amazon ECR**
7. **Deploy to ECS (Staging or Prod)**

---

## 🐳 AWS ECS Deployment

We use **ECS Fargate** for containerized apps with zero server management.

- Each service is deployed as a container via ECS task definition
- Deployment is triggered from GitHub Actions via OIDC + IAM Role
- Logs are forwarded to **CloudWatch**
- App health is monitored using **Application Load Balancers**

> 🔒 All deploys are auditable and require passing tests & approval.

---

## 🔐 Secrets Management

- Sensitive values are encrypted via **AWS KMS**
- Secrets are **never hardcoded** — always pulled from:
  - `.env` (KMS decrypted)
  - AWS Systems Manager (SSM) Parameter Store (if used)
- GitHub repo is protected with secret scanning and branch rules

> ✅ Developers must never commit `.env`, credentials, or access tokens.

---

## ✅ Secure Coding Guidelines

| Area              | Best Practice |
|-------------------|---------------|
| **Authentication** | Use signed tokens; avoid exposing user info |
| **Authorization** | Enforce RBAC on both frontend and backend |
| **Input Validation** | Sanitize all user input (especially API routes) |
| **Logging**       | Never log sensitive data (tokens, passwords) |
| **Dependencies**  | Avoid deprecated or vulnerable packages |

---

## 🧪 Pre-merge Checks

All pull requests must pass:

- [ ] Linting (`npm run lint`)
- [ ] Unit tests (`npm run test`)
- [ ] Type safety (`tsc --noEmit`)
- [ ] Secrets scan
- [ ] Code review from at least 1 team member

---

## 🧠 Incident Handling & Rollbacks

- ECS services have versioned task definitions
- Rollback is as simple as redeploying the previous task version
- Infra logs are visible in **CloudWatch**
- Postmortems are documented in ClickUp under the DevOps board

---

## 📬 Questions?

For issues or escalations, contact:

- Platform Engineering Squad via ClickUp chat
- Email: [web.admin@prosperna.com](mailto:web.admin@prosperna.com)

---

Stay secure, stay automated.
