---
id: engineering-flow-guide
title: How to Use the Engineering Flow
sidebar_position: 1
---

# How to Use the Engineering Flow

This document explains the step-by-step engineering workflow used at Prosperna to manage tasks, features, bugs, and releases from initial request to production deployment. It provides clarity on roles, responsibilities, and status transitions to ensure smooth collaboration across teams from CEO to PMs to developers. This guide is also part of the onboarding process for new team members.

---

## Diagram and Overview

![Engineering Flow](/whiteboard_exported_image.png)

---

The workflow is divided into stages that track tasks from idea through development, testing, and deployment. It integrates inputs from product roadmaps, internal system monitoring, and customer support to deliver quality software efficiently.

---

## Step-by-Step Guide to Using the Workflow

### 1. Inputs to the Workflow

- **Product Roadmap**  
  Strategic features and initiatives defined by stakeholders guide the product direction.

- **Internal Support**  
  Bugs and issues are reported by internal employees or detected by system monitoring tools such as Datadog and log monitors.

- **External Support**  
  Customer feedback and enhancement requests collected from users and support teams.

---

### 2. Business Analysis (BA) Cycle

- **Product Grooming**  
  Business Analysts review and prioritize incoming requests and roadmap items for further analysis.

- **Requirement Gathering**  
  Detailed requirements are collected, documented, and refined with input from stakeholders.

- **Ready for Review**  
  Requirements are submitted for approval by Heads of Engineering or Product Managers. Items failing review return to gathering for refinement.

---

### 3. Ready for Development

- Approved requirements and tasks move here, fully analyzed and ready for implementation.

- Internal support issues and customer requests can also be added once analyzed and approved.

---

### 4. Priority Ready

- Product Managers prioritize tasks from "Ready for Development" and stage them here for imminent development.

- Developers pick tasks from this prioritized queue.

---

### 5. Priority Development

- High priority tasks and epics enter active planning and early work phases here.

- Epic-level tracking occurs in this stage while subtasks move into active development.

---

### 6. In Development

- Tasks under active implementation by developers move here.

- Progress and updates are tracked during coding and building.

---

### 7. Testing Phase

- **Ready for Testing**: Tasks completed by development are handed over to QA.

- **In Testing**: QA performs verification and validation.

- **Pass Testing**: Successfully tested tasks move here, ready for deployment.

- Tasks failing tests return to **"In Development"** for fixes.

---

### 8. Ready for Deployment

- QA-approved tasks enter this stage for final preparation and coordination before release.

- PMs ensure environment readiness and final documentation.

---

### 9. Deployment to Production

- Tasks are deployed to production.

- Post-deployment monitoring and validation are conducted.

- Completion marks task closure.

---

## Roles and Responsibilities

- **CEO / Stakeholders**: Define vision and approve high-level plans.  
- **Business Analysts**: Lead grooming, requirements, and review cycles.  
- **Product Managers**: Prioritize, track progress, and coordinate releases.  
- **Developers**: Build features, fix bugs, and update statuses.  
- **QA Team**: Test and verify quality.  
- **Support Teams**: Report issues and gather customer feedback.

---

## Metrics to Track

- **Lead Time**: Total time from task creation to completion.  
- **Cycle Time**: Time from start of development to task completion.

Tracking these helps identify bottlenecks and improve process efficiency.

---
