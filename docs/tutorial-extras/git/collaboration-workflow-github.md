---
id: collaboration-workflow-github
title: Collaboration Workflow with GitHub
sidebar_label: Collaboration Workflow
description: Learn how to collaborate effectively using GitHub, including branching, pull requests, reviews, and merging best practices.
---

# Collaboration Workflow with GitHub

---

## 7.1 Overview
GitHub is not only a storage place for your repositories; it is also a powerful collaboration platform.  
Using branches, pull requests, and reviews, teams can work together safely and efficiently without overwriting each other’s work.

This chapter explains how to collaborate effectively with your team using GitHub workflows.

---

## 7.2 Why Collaboration Workflows Matter

- **Safe teamwork** – everyone works on their own branch without breaking the main project.  
- **Review process** – changes are reviewed before merging, ensuring quality.  
- **Clear history** – all discussions, feedback, and approvals are recorded.  
- **Controlled merging** – changes are only added to the main branch when ready.

---

## 7.3 Working with Branches

Branches allow multiple team members to work on separate features or documents at the same time.

### Creating a Branch
```bash
git branch feature-update
```

### Switching to the Branch
```bash
git checkout feature-update
```

### Combining Steps
```bash
git checkout -b feature-update
```
> This creates and switches to the branch in one command.

---

## 7.4 Pull Requests (PRs)

A **Pull Request** (PR) is a request to merge changes from one branch into another (usually into `main`).

### Why Use PRs?
- Enables review before merging.
- Shows a clear history of what was changed.
- Allows discussions and approvals.

### Creating a PR in GitHub
1. Push your branch to GitHub:
   ```bash
   git push -u origin feature-update
   ```
2. Go to the repository on GitHub.
3. Click **Compare & Pull Request**.
4. Add a descriptive title and explanation of your changes.
5. Click **Create Pull Request**.

---

## 7.5 Reviewing a Pull Request

Team members can:
- Review code or documentation changes.
- Add comments or suggestions.
- Approve or request modifications.

After approval, the PR can be merged.

---

## 7.6 Merging Pull Requests

Once a PR is reviewed and approved:
- Click **Merge Pull Request** in GitHub.
- Choose the merge method:
  - **Merge Commit** – keeps full history.
  - **Squash and Merge** – combines changes into one commit.
  - **Rebase and Merge** – keeps history cleaner by applying commits one by one.

After merging, delete the feature branch to keep the repository clean.

---

## 7.7 Best Practices for Teams

- **Always work on a branch**, never commit directly to `main`.  
- **Use meaningful branch names**, e.g., `feature/login-page` or `update/brd-section3`.  
- **Write clear commit messages** to describe what you changed.  
- **Keep PRs small** so they are easier to review.  
- **Request reviews** and address feedback promptly.  

---

## 7.8 Hands-On Practice

1. Create a branch:
   ```bash
   git checkout -b update-brd
   ```
2. Edit `BRD.md` and commit your changes:
   ```bash
   git add BRD.md
   git commit -m "Updated Section 2 with new requirements"
   git push -u origin update-brd
   ```
3. Open a pull request on GitHub and request a review.
4. Merge the pull request after approval.
5. Delete the branch (optional) locally and remotely:
   ```bash
   git branch -d update-brd
   git push origin --delete update-brd
   ```

---

## 7.9 Summary

Collaboration in GitHub revolves around:
1. **Branches** – isolate your work.  
2. **Pull Requests** – request reviews and discuss changes.  
3. **Merging** – integrate changes into the main branch safely.  
4. **Best Practices** – keep the process organized and smooth.

---

## 7.10 Next Steps

You now know how to work with your team efficiently using GitHub’s collaboration features.  
The next chapter will focus on **Best Practices for Version Control and Team Collaboration** to help you maintain a clean, high-quality project.

👉 Continue to: **Best Practices for Version Control**
