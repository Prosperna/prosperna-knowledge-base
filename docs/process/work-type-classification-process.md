---
id: task-creation-work-type-classification-process
title: Task Creation & Work Type Classification Process
sidebar_position: 5
---

# 🛠️ Task Creation & Work Type Classification Process

This document defines the standard process for **creating, classifying, and managing work items** in our engineering lifecycle. It ensures consistent visibility across teams and helps align our work with business value, technical priorities, and operational needs.

---

## ✅ Step 1: Identify the Task

Before creating a task, ask the following questions:

1. **What is the project name?**
   - Is it part of **Prosperna** or **Enterprise**?

2. **Where did the request come from?**
   - `Internal`: Raised by engineering, ops, QA, infra, or security.
   - `External`: Comes from clients, partners, or users.
   - `Product Roadmap`: Strategic features or improvements.

3. **What is the Type of Work?**
   - **Business Projects** – Directly deliver business value or meet strategic/customer needs.
   - **Internal IT Projects** – Technical or infra initiatives that support platform scalability and maintainability.
   - **Changes** – Planned modifications to existing code, infrastructure, or configurations.
   - **Unplanned Work** – Reactive tasks, bugs, incidents, and escalations.

---

## 📦 Step 2: Assign a Work Type Category
Each task must be tagged with **one of the following categories**, which determine its workflow, priority, and review process.

### 🚀 Customer-Driven Initiatives *(Business Projects)*
- `New Feature` – Deliver new functionality to end users.
- `UX / UI Improvement` – Improve usability and customer experience.
- `Customer Request` – Requested by clients or end-users.
- `Legal Compliance Requirement` – Needed to comply with laws/regulations.
- `Product Launch` – Activities leading up to new feature releases.

### 🛠 Platform & Technical Work *(Internal IT Projects)*
- `Technical Debt Cleanup` – Refactor or improve legacy code.
- `System Upgrade` – Upgrade infrastructure or runtime environments.
- `Migration` – Moving data, infra, or workloads.
- `DevOps Automation` – CI/CD, pipelines, monitoring.
- `Research and Development` – Spikes, feasibility, experimentation.
- `Security Hardening` – Improve system security posture.

### 🔄 Planned System Changes *(Changes)*
- `Infra Change` – Changes to cloud, DNS, IAM, infra-level settings.
- `Rollback` – Controlled reversal of a previously deployed change.
- `Security Hardening` – Scheduled patches, cert rotations, policy enforcement.
- `Feature Toggle Update` – Enable/disable capabilities.

### 🚨 Unplanned / Reactive Work *(Unplanned Work)*
- `Bug` – Reported error or failure in functionality.
- `Incident Response` – Outages, alerts, downtime resolution.
- `Emergency Hotfix` – Unplanned but necessary immediate fix.
- `Hotfix` – Urgent fix deployed outside planned release cycles.
- `Regression` – Features that broke post-deployment.
- `Third Party Fix` – Issues from external vendors or APIs.

---

## 🧭 Example Task Flow

| Field                  | Example Value                              |
|------------------------|--------------------------------------------|
| Project                | Prosperna Core                             |
| Source                 | Internal                                    |
| Type of Work           | Internal IT Project                         |
| Work Type Category     | DevOps Automation                          |

---

## 🧩 Usage Guidelines

- Only assign **one primary Work Type Category** per task.
- Use **labels or custom fields** for tagging, filtering, and reporting.
- Link related tasks to **epics** or **initiatives** if they share business or technical goals.
- Review classification during grooming to ensure accuracy.

---

## 📊 Why This Matters

Classifying work correctly:
- Improves team focus and WIP management
- Enables better resource allocation
- Supports DORA metrics and flow efficiency
- Surfaces unplanned work patterns for retrospectives

---

For updates to this process, contact the DevOps Coach or PMO.
