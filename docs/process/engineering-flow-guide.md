---
id: engineering-flow-guide
title: How to Use the Engineering Flow
sidebar_position: 1
---

# Engineering Flow Guide

> This SOP defines how Prosperna handles product requests from ideation to deployment, ensuring visibility, accountability, and quality across teams.

---

## 🖼️ Engineering Flow Diagram

![Engineering Flow](/clickup-guide.png)

---

## 📌 Overview

The engineering flow includes five key stages:

1. **Not Started / Open**
2. **In Progress**
3. **Done**
4. **Closed**
5. **Cycle & Lead Time Tracking**

Each ClickUp card transitions through this flow to ensure delivery quality and measurement of engineering metrics.

---

## 🔄 Flow Stages

### 🧠 1. Not Started / Open

**Sources of Work:**
- **Product Roadmap** — Business/feature request from stakeholders
- **Internal Support** — System logs, reports, errors
- **External Support** — Customer-reported bugs or complaints

**Process Steps:**
1. **Product Grooming** (BA + Stakeholder)
2. **Requirement Gathering**
3. **Ready for Review**
   - If **Fail in Review**, it loops back to **Requirement Gathering**
   - If **Pass Review**, it proceeds to HoE approval
4. **Ready for Development**

**🕒 BA Cycle Time** = From *Product Grooming* to *Ready for Review*

---

### 🚧 2. In Progress

After HoE approval:

1. **Priority Delivery** – Task is prioritized by PM
2. **In Development** – Developer starts coding
3. **Ready for Testing** – Marked complete by Dev
4. **In Testing** – QA runs validations

#### QA Feedback Loop
- If **Fail Testing**:
  - Tag as `QA Return`
  - Move back to **In Development**
  - Must tag responsible Dev and explain issue in the comment
- If **Pass Testing**:
  - Proceed to **Pass Testing**

---

### ✅ 3. Done

**Pass Testing** is confirmed by QA. Task is then:

- Reviewed by PM
- Moved to **Ready for Deployment**

---

### 🚀 4. Closed

**Deploy to Prod**:
- Deployment is executed via GitHub and CI/CD
- HoE verifies and signs off
- PM updates ClickUp task to “Deployed to Production”

---

### 📋 Before Deploy to Prod Checklist

All items **must be completed and verified** before a task is moved to **Deploy to Prod**:

| ✅ Checklist Item                                                                 | Owner        | Notes                                                                 |
|----------------------------------------------------------------------------------|--------------|-----------------------------------------------------------------------|
| ✅ Test cases uploaded to **Prosperna Knowledge Base**                           | QA           | Organized and linked from ClickUp                                    |
| ✅ BRD uploaded to **Prosperna Knowledge Base**                                  | BA           | Final version; no placeholders or drafts                             |
| ✅ Final **PM Sign-off** on feature acceptance                                   | PM           | Confirms business alignment                                           |
| ✅ QA Status is **Pass Testing**                                                 | QA           | No “QA Return” tag present                                           |
| ✅ Code review completed and approved                                            | Dev Lead     | At least one approval required                                       |
| ✅ Unit and integration tests are passing in CI                                  | Dev / QA     | Verified in GitHub Actions or CI tool                                |
| ✅ Unit test coverage is above **80% at the file level**                         | Dev / QA     | Use SimpleCov or equivalent to measure                               |
| ✅ API integration tests are completed and verified                              | QA           | Ensure edge cases and failure responses are tested                   |
| ✅ No critical bugs or blockers in testing environment                           | QA           | Regression tested if needed                                          |
| ✅ Release notes are prepared and linked                                         | PM           | Stored in ClickUp and/or GitHub PR                                   |
| ✅ Deployment plan/checklist (rollback steps, environment info) is documented    | Dev / HoE    | For high-risk or multi-step releases                                 |
| ✅ Final GitHub PR is merged to main/master                                      | Dev          | Confirm correct branch and commit ID                                 |
| ✅ HoE approval for production release                                           | HoE          | Final gate before live release                                       |

---

## 📊 Metrics Explained

| Metric            | Formula                                   | Purpose                                  |
|-------------------|--------------------------------------------|------------------------------------------|
| **Lead Time**     | End Date − Open Date                       | Total duration from task start to deploy |
| **Cycle Time**    | Done Date − In Development Start Date      | Actual time spent in dev/testing cycle   |
| **BA Cycle Time** | Ready for Review − Product Grooming Start  | Requirement preparation duration         |

---

## 👤 Roles & Responsibilities

| Role        | Responsibility                                              |
|-------------|-------------------------------------------------------------|
| Stakeholder | Raises product/feature needs                                |
| BA          | Grooms and defines requirements                             |
| HoE         | Approves for development and signs off before deployment    |
| PM          | Prioritizes, tracks, and ensures readiness                   |
| Dev         | Implements solution and prepares for QA                     |
| QA          | Validates functionality and ensures quality                 |

---

## 🏷 Tagging Rules

- Always **tag the Dev** on `QA Return` with clear comments
- Tasks must go through QA before deployment
- Missing tags/comments during return → **Team Quality Incident**
- No direct move to "Ready for Deployment" without passing QA

---

## 🛠 Tools

| Tool     | Usage                                |
|----------|--------------------------------------|
| ClickUp  | Task flow, tagging, and assignments  |
| GitHub   | PRs, version control, CI/CD triggers |
| CI/CD    | Automated deployment pipelines       |

---

Following this flow ensures delivery consistency, quality assurance, and measurable DevOps performance across the engineering team.
