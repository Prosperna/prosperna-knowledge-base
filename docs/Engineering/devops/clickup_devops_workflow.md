---
id: clickup-workflow-devops
title: ClickUp Workflows for DevOps
sidebar_label: ClickUp Workflow for DevOps
---

# ClickUp Workflow for DevOps

This document outlines how our DevOps and Engineering teams use **ClickUp** to manage tasks, prioritize work, and streamline releases. It also explains how automated test coverage notifications are delivered to ClickUp from GitHub Actions.

---

## ClickUp Status Workflow

We use a standardized set of ClickUp statuses to track tickets from planning to deployment.

### Ready for Development

- **Definition:** Task has been fully analyzed and approved.
- **Includes:**
  - Feature requests
  - Bug reports
  - Internal support issues
- Tasks enter here after validation.

### Ready Priority

- **Definition:** Product Managers prioritize tasks here.
- **Developers pull** from this queue for development.

### Priority Development

- **Definition:** High-priority tasks and epics enter early work/planning.
- **Tracking:**
  - Epic-level tracking
  - Subtasks often break off into "In Development"

### In Development

- **Definition:** Developer is actively working on the task.
- **Tracked:**
  - Implementation progress
  - PRs or commits linked

### Ready for Testing

- Task is complete and handed off to QA.

### In Testing

- QA team verifies features, performs manual and automated testing.

### Pass Testing

- Task is approved by QA.
- Ready for deployment.

### Ready for Deployment

- QA-approved and waiting for:
  - Environment readiness
  - Final review by PMs
  - Deployment plan

### Deployed to Prod

- Task is now live in production.
- PM or DevOps team performs:
  - Post-deployment validation
  - Monitoring and closure

---

## Recurring Tasks

Recurring tasks such as:

- Monthly cost review
- Infra audits
- Backup validation
- Log rotation

...are created as **scheduled recurring ClickUp tasks**. These tasks are assigned to the appropriate engineer or DevOps every cycle, tracked and monitored via automation.

---

## Unit Testing Coverage Notification via ClickUp

Every month, we automatically send **unit test coverage reports** to a ClickUp task using GitHub Actions. This ensures engineering accountability and visibility into test coverage trends.

### How It Works:

- GitHub Actions workflow runs monthly via `cron`.
- The workflow runs the test suite and generates coverage summary.
- Using a ClickUp API token, the GitHub Action posts the coverage report to a specified ClickUp task or comment.

---

## Setup: ClickUp Notifications via GitHub Actions

> This setup pushes a comment to a ClickUp task with the latest test coverage metrics.

### 1. Get Your ClickUp API Token

- Log into [ClickUp](https://app.clickup.com/).
- Go to **Settings > Apps > API**.
- Copy your **personal API token**.

### 2. Add GitHub Secret

- In your GitHub repo, go to **Settings > Secrets and variables > Actions**.
- Add a new secret:
  - Name: `CLICKUP_API_TOKEN`
  - Value: (your token)

### 3. Sample GitHub Action Workflow

````yaml
name: Monthly Unit Test Coverage Notification

on:
  schedule:
    - cron: '0 3 1 * *' # Runs on the 1st of each month at 3AM UTC

jobs:
  coverage-report:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests and Generate Coverage
        run: |
          npm run test -- --coverage > coverage-summary.txt

      - name: Send ClickUp Notification
        run: |
          curl -X POST https://api.clickup.com/api/v2/task/{TASK_ID}/comment \
            -H "Authorization: ${{ secrets.CLICKUP_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "comment_text": "🧪 Monthly Unit Test Coverage:\n\n```\n$(cat coverage-summary.txt)\n```",
              "notify_all": true
            }'
````

> Replace `{TASK_ID}` with your actual ClickUp task ID where the comment will be posted.

### ✅ Output

- A monthly comment appears in ClickUp like this:

```
🧪 Monthly Unit Test Coverage:

Statements: 88%
Branches:   80%
Functions:  85%
Lines:      89%
```

---

## 🔗 Related Links

- [ClickUp API Docs](https://clickup.com/api)
- [GitHub Actions](https://docs.github.com/en/actions)

