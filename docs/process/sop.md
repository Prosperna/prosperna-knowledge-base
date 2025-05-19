---
id: sop
title: Sop
sidebar_position: 1
---


# Engineering Flow – ClickUp Standard Operating Procedure (SOP)

---

## 1. Objective
To standardize and streamline the task flow across Business Analysis, Development, QA, DevOps, and Product Management using a shared ClickUp board. This SOP ensures visibility, accountability, speed, and quality in every phase of the engineering lifecycle.

---

## 2. Purpose
This document serves as the definitive operating guide for all engineering team members at Prosperna. It aligns all teams on expectations, role responsibilities, status usage, and workflow rules to ensure efficient and traceable delivery from idea to deployment.

---

## 3. Workflow Structure

### A. Pre-Development (Group: Not Started / Open)
**Responsible Roles:** Product Manager (PM), Business Analyst (BA)

- **Product Roadmap**  
  Strategic product initiatives requested by stakeholders, leadership, or customers. All ideas must be logged and categorized with the proper source (e.g., Roadmap, Internal, External Support).

- **Product Grooming**  
  PM and BA prioritize the feature and align it with roadmap goals. Technical feasibility is reviewed with Dev/HoE.

- **Requirement Gathering**  
  BA works with stakeholders to gather user stories, define acceptance criteria, business rules, personas, and success metrics. All dependencies must be identified.

- **Ready for Review**  
  BA presents the completed spec to the PM, HoE, and Dev team for feedback. Any missing detail or clarification must be resolved before progressing.

- **Ready for Development**  
  Approved stories that meet the Definition of Ready. Devs can now pull them into the sprint or `Priority Delivery` lane.

---

### B. Development (Group: Active / In Progress)
**Responsible Roles:** Developer, QA, DevOps

- **Priority Delivery**  
  Tasks are staged here based on urgency or business priority. Tasks in this lane are eligible for immediate pull once the current task is done.

- **In Development**  
  Dev is actively coding. Only one task should be in this status per dev at a time. The task must:
  - Be small enough to complete in one day
  - Have clear acceptance criteria
  - Be testable and deployable independently
  - Be reviewed and approved by at least one other developer before merging

- **Ready for Testing**  
  Code is complete and reviewed (manually or via AI). PR is merged, and CI is triggered. QA is notified.

- **In Testing**  
  QA validates functionality manually and/or through automated tests. Bugs found here are returned to `In Development` with the `QA Return` tag.

- **Pass Testing**  
  QA confirms everything passes and documents final sign-off in the task comments.

---

### C. Post-Development (Group: Done)
**Responsible Roles:** QA, DevOps

- **Ready for Deployment**  
  Task is fully tested and cleared by QA. Awaiting DevOps scheduling or automation trigger to deploy to production.

---

### D. Close (Group: Completed)
**Responsible Roles:** DevOps, PM, Product Owner

- **Deploy to Prod**  
  Feature is live. PM validates the outcome and ensures customer communication if needed. Dev must close this task before starting a new one—even if a `Priority Delivery` task exists. Urgency does not override this rule.

- *(Optional)* **Validated in Prod**  
  Used for post-release monitoring, metrics, or customer verification if required.

---

## 4. Additional Guidelines

### A. ClickUp Tags to Use
- `Blocked`: Dependency or issue stopping progress
- `Bug`: Something broken
- `Infra`: Infra or DevOps-related task
- `Client Request`: Feedback or ticket sourced from customers

### B. WIP Limits
- Max 1 task per dev in `In Development`
- Max 2 tasks per QA in `In Testing`
- Limit total items in `Ready for Deployment` to prevent release pile-ups

### C. Automation Rules (Optional)
- PR merged → move task to `Ready for Testing`
- CI passed → notify QA via ClickUp comment
- Production deployed → auto-close if validated via webhook

### D. Color Coding by Stage
- **Blue**: Pre-Dev (Planning, BA work)
- **Yellow**: Active (Development & Testing)
- **Green**: Ready (Post-QA, Done)
- **Gray**: Completed (Deployed, Closed)

---

## 5. RACI Matrix – Task Ownership

| Task Status             | CEO | PM | BA | Dev | QA | HoE |
|-------------------------|-----|----|----|-----|----|-----|
| Product Grooming        | A   | A  | R  | C   |    |     |
| Requirement Gathering   |     |    | R  | C   |    |     |
| Ready for Review        |     |    | R  | C   |    | A   |
| Ready for Development   |     | R  | C  |     |    | A   |
| Priority Delivery       |     | R  |    |     |    |     |
| In Development          |     |    |    | R   |    |     |
| Ready for Testing       |     |    |    | R   | C  |     |
| In Testing              |     |    |    | C   | R  |     |
| Pass Testing            |     |    |    |     | R  |     |
| Ready for Deployment    |     | A  |    | C   | R  |     |
| Deploy to Prod          |     | C  |    |     |    | R   |

**Legend:**
- **R** – Responsible (Executes)
- **A** – Accountable (Signs off or approves)
- **C** – Consulted (Informed for collaboration)
- **I** – Informed (Aware but not directly involved)

---

## 6. SOP Compliance Rules

- All tasks must have a defined Source and Type of Work
- Developers may only have one task in development at any time
- No new task may begin until the current `Deploy to Prod` item is marked as done
- Tasks must be broken into small, testable units deliverable within a day
- Blockers must be flagged immediately using the `Blocked` tag and escalated during standup
- No task may bypass QA unless approved by both PM and HoE for emergency hotfixes
- All tasks must have clear acceptance criteria and be testable independently
- All tasks must be documented in ClickUp with relevant comments and tags
- All tasks must be reviewed and approved by at least one other developer before merging    
- All tasks must be closed in ClickUp after deployment to production
- All tasks must be validated in production before being marked as complete
- All tasks must be communicated to stakeholders and team members to ensure transparency
- All tasks must be archived in ClickUp for historical reference and compliance audits
- All tasks must be version-controlled to track changes and updates over time
- All tasks must be communicated to stakeholders and team members to ensure transparency
- All tasks must be archived in ClickUp for historical reference and compliance audits
- All tasks must be version-controlled to track changes and updates over time
- All tasks must be communicated to stakeholders and team members to ensure transparency

---

## 7. Review and Maintenance
- SOP is reviewed monthly during sprint retrospectives
- Updates are approved by the Engineering Manager or Scrum Lead
- Latest version is stored in the Engineering Handbook and pinned in ClickUp workspace
- All team members are responsible for adhering to this SOP and providing feedback for improvements
- Training sessions will be held quarterly to ensure all team members are familiar with the SOP
- New hires will receive SOP training as part of their onboarding process
- Feedback and suggestions for improvement can be submitted via the ClickUp task or directly to the Engineering Manager
- Any deviations from this SOP must be documented and justified in the task comments
- Non-compliance may result in a review of the team member's adherence to the SOP and potential corrective actions
- Continuous improvement is encouraged, and team members are empowered to suggest changes to the SOP based on their experiences
- The SOP will be reviewed and updated annually or as needed based on significant changes in processes or tools
- All team members are encouraged to participate in the review process and provide input on potential improvements
- The SOP will be communicated to all stakeholders and made accessible to ensure transparency and accountability
- The SOP will be archived in the Engineering Handbook for historical reference and compliance audits
- The SOP will be version-controlled to track changes and updates over time
- The SOP will be communicated to all stakeholders and made accessible to ensure transparency and accountability
- The SOP will be archived in the Engineering Handbook for historical reference and compliance audits
- The SOP will be version-controlled to track changes and updates over time