---
id: CICD Pipeline
title: CI/CD Pipeline Process
sidebar_position: 3
---

# CI/CD Pipeline Process

## What is CI/CD and Why We Need It

CI/CD stands for **Continuous Integration** and **Continuous Delivery or Deployment**.
It is a structured and automated process that ensures every change to the codebase is built, tested, validated, and released safely.

The goal of this pipeline is to:

- Detect defects early
- Enforce quality and security standards
- Control how and when changes reach production
- Reduce release risk while increasing delivery speed

CI/CD is not only about automation. It defines **how teams work together** and **how changes flow across environments**.

## ![CICD Flow](/img/cicd_flow.png)

## Frontend CI/CD Flow Overview

This pipeline follows a **branch-driven promotion model** with clear quality gates and controlled release timing.

High-level flow:

- Feature branches are merged into **Dev Branch**
- Only validated changes move forward
- Releases are promoted via **Staging** and **Release** branches
- Production deployments are time-bound and controlled
- Hotfixes are the only allowed bypass

---

## Branching Strategy and Responsibilities

### Feature Branches

**Branch pattern**  
`feature/feature-x`

**Purpose**  
Used by developers for individual feature development.

**Rules**

- No direct deployment
- Must be merged into Dev Branch
- All checks run on merge

**Owner**  
Developers

---

### Dev Branch

**Purpose**  
Integration branch for ongoing development.

**What happens here**

- Lint
- Unit Tests
- SAST
- Build
- Deploy to Dev
- E2E, Integration, Browser, API Aggregator tests

**Promotion rule**  
Only if all tests pass

**Owner**  
Developers and QA

---

### Staging Branch

**Purpose**  
Pre-release validation branch.

**What happens here**

- Deploy to Stage
- Performance Tests
- Smoke Tests

**Promotion rule**  
Only if all tests pass

**Owner**  
QA and Product

---

### Release Branch

**Purpose**  
Freeze branch for scheduled production releases.

**Key rule**  
All releases are staged and approved for a **fixed daily release window**.

**Release schedule**

- Daily release at **9 PM**
- Only validated changes from staging are allowed

**Owner**  
Product, QA, DevOps

---

### Prod Branch

**Purpose**  
Production-ready branch.

**Deployment rule**

- Only Release Branch or Hotfix Branch can merge
- Deployment happens only during approved release windows

**Owner**  
DevOps

---

## Pipeline Stages Explained

### 1. Lint

**Purpose**  
Ensure consistent code quality and enforce coding standards.

**Runs on**

- Merge to Dev Branch

**Failure behavior**

- Pipeline stops
- Merge is blocked

**Owner**  
Developer

---

### 2. Unit Tests

**Purpose**  
Validate components and business logic in isolation.

**Runs on**

- Merge to Dev Branch

**Failure behavior**

- Pipeline stops

**Owner**  
Developer

---

### 3. SAST. Static Application Security Testing

**Purpose**  
Detect security issues early in source code.

**Blocking rule**

- High severity findings block promotion

**Owner**  
Developer with DevSecOps validation

---

### 4. Build

**Purpose**  
Compile and package the frontend application.

**Failure behavior**

- No deployment occurs

**Owner**  
Developer

---

### 5. Deploy to Dev

**Purpose**  
Deploy validated builds to development environment.

**Environment goal**  
Early integration and functional validation.

---

### 6. E2E, Integration, Browser, API Aggregator Tests

**Purpose**  
Validate real user flows, integrations, and browser compatibility.

**Promotion rule**

- All tests must pass to promote to Staging Branch

**Owner**  
QA with developer support

---

### 7. Deploy to Stage

**Purpose**  
Deploy build to staging environment.

**Environment goal**  
Production-like validation.

---

### 8. Performance Tests

**Purpose**  
Validate frontend performance under expected load.

**Blocking rule**

- Performance regressions block release

---

### 9. Smoke Tests

**Purpose**  
Quick validation of critical paths after staging deployment.

---

### 10. Release to Production

**Standard release rule**

- Happens **once per day at 9 PM**
- Only changes from Release Branch are deployed

**Outcome**

- Predictable releases
- Reduced risk
- Clear rollback points

---

## Hotfix Policy. Strictly Controlled

Hotfixes are the **only allowed bypass** of the standard pipeline.

**Definition of a hotfix**

- Production outage
- Severe customer impact
- Security vulnerability

**Rules**

- Must be documented
- Must be reviewed
- Must be merged back to Dev and Staging branches
- Abuse of hotfix process is not allowed

---

## Key Principles

- Only tested code moves forward
- Branches represent quality levels
- Time-based releases reduce chaos
- Hotfixes are exceptions, not shortcuts

CI/CD exists to protect users, teams, and the business.
