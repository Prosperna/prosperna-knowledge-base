---
id: advanced-git-commands
slug: /tutorial-extras/git/advanced-git-commands
sidebar_position: 4
tags: [git, github, advanced commands, version control]
keywords: [Git, GitHub, advanced commands, version control, collaboration, software development]
title: Advanced Git Commands
sidebar_label: Advanced Git Commands
description: Learn advanced Git commands such as cloning, pulling, viewing logs, stashing changes, and handling conflicts.
---

# Advanced Git Commands

---

## 5.1 Overview
Once you have mastered the basic Git commands, you can take your workflow to the next level with advanced Git commands.  
These commands help you collaborate better, manage complex workflows, and recover from mistakes.

---

## 5.2 Advanced Commands Overview

In this chapter, you will learn:

1. Cloning repositories (`git clone`)  
2. Updating your local copy (`git pull`)  
3. Viewing project history (`git log`)  
4. Ignoring files (`.gitignore`)  
5. Stashing temporary changes (`git stash`)  
6. Undoing mistakes (`git reset`, `git revert`)  
7. Resolving merge conflicts  

---

## 5.3 Cloning Repositories

#### `git clone`
Creates a local copy of a repository from GitHub.
```bash
git clone git@github.com:username/repo.git
```
> Use this when you want to start working on an existing project.

---

## 5.4 Updating Your Local Repository

#### `git pull`
Fetches and integrates changes from the remote repository into your local branch.
```bash
git pull origin main
```
> Always run `git pull` before you start working to ensure you have the latest updates.

---

## 5.5 Viewing Project History

#### `git log`
Displays a history of commits in the repository.
```bash
git log
```
Use `--oneline` for a concise view:
```bash
git log --oneline
```

---

## 5.6 Ignoring Files

You can prevent certain files (like temporary logs or environment files) from being tracked by Git using a `.gitignore` file.

Example `.gitignore`:
```
node_modules/
.env
*.log
```
Add the `.gitignore` to your repository and commit it.

---

## 5.7 Stashing Temporary Changes

#### `git stash`
Saves uncommitted changes temporarily so you can switch branches or pull updates without committing.
```bash
git stash
```

#### `git stash pop`
Restores the stashed changes back into your working directory.
```bash
git stash pop
```

---

## 5.8 Undoing Mistakes

#### `git reset`
Removes commits or staged changes.  
Example: Unstage a file:
```bash
git reset HEAD filename
```

#### `git revert`
Creates a new commit that undoes a previous commit.
```bash
git revert <commit_id>
```

---

## 5.9 Resolving Merge Conflicts

Sometimes, when two people change the same part of a file, a **merge conflict** occurs.  
Git will mark the conflict in the file like this:
```
<<<<<<< HEAD
Your changes
=======
Their changes
>>>>>>> branch-name
```
You must edit the file manually, keep the correct changes, and then:
```bash
git add filename
git commit -m "Resolved merge conflict"
```

---

## 5.10 Hands-On Practice

Try these steps to get comfortable with advanced commands:

1. Clone a repository from GitHub:
   ```bash
   git clone git@github.com:username/my-project.git
   ```
2. Create and stash changes:
   ```bash
   echo "Draft change" >> draft.txt
   git stash
   git stash pop
   ```
3. Create a conflict:
   - Modify the same file in two branches.
   - Merge the branches to trigger a conflict.
   - Resolve it manually and commit.

---

## 5.11 Summary

These advanced Git commands allow you to:
- Work with remote repositories (`git clone`, `git pull`).
- Inspect your history (`git log`).
- Manage ignored files (`.gitignore`).
- Temporarily save work without committing (`git stash`).
- Recover from mistakes and handle conflicts (`git reset`, `git revert`, conflict resolution).

---

## 5.12 Next Steps

Next, you will learn **how to write BRDs and PRDs in Markdown** to make your project documentation clean and professional.

👉 Continue to: **Writing in Markdown for BRD/PRD**
