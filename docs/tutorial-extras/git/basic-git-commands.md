---
id: basic-git-commands
slug: /tutorial-extras/git/basic-git-commands
sidebar_position: 3
tags: [git, github, commands, version control]
keywords: [Git, GitHub, commands, version control, collaboration, software development]
title: Basic Git Commands
sidebar_label: Basic Git Commands
description: Learn the essential Git commands to initialize repositories, track changes, work with branches, and merge updates.
---

# Basic Git Commands

---

## 3.1 Overview
Git commands allow you to control and track the changes in your project.  
By learning a few key commands, you can create repositories, save versions of your work, and collaborate with others effectively.

---

## 3.2 Essential Git Commands (Grouped by Usage)

---

### 3.2.1 Initializing and Checking Repository

#### `git init`
Initializes a new Git repository in your current folder.
```bash
git init
```
> Example:  
> Run this command inside your project folder to make it a Git repository.

#### `git status`
Displays the current state of your repository (which files are modified, staged, or committed).
```bash
git status
```
> Example:  
> Use this frequently to see what Git is tracking.

---

### 3.2.2 Staging, Committing, and Pushing Changes

#### `git add`
Stages changes to prepare them for committing.
```bash
git add filename
```
Or add all changes:
```bash
git add .
```

#### `git commit`
Saves staged changes with a descriptive message.
```bash
git commit -m "Added initial BRD file"
```

#### `git push`
Uploads your committed changes to GitHub (the remote repository).
```bash
git push origin main
```
> Use `main` or `master` depending on your default branch name.

---

### 3.2.3 Branching and Switching Context

#### `git branch`
Creates a new branch or lists existing branches.
```bash
git branch feature-update
```
To view branches:
```bash
git branch
```

#### `git checkout`
Switches to another branch.
```bash
git checkout feature-update
```

> Example:  
> Use branches to work on updates without affecting the main branch.

---

### 3.2.4 Merging Work

#### `git merge`
Combines changes from one branch into the current branch.
```bash
git checkout main
git merge feature-update
```
> Example:  
> After finishing work in `feature-update`, merge it back into `main`.

---

## 3.3 Hands-On Practice

Follow these steps to practice:

1. **Create a new folder** for your project and open it in Terminal.
2. Run:
   ```bash
   git init
   ```
3. **Create a file** (e.g., `BRD.md`) and write some text inside.
4. Stage and commit:
   ```bash
   git add BRD.md
   git commit -m "Added initial BRD"
   ```
5. **Connect to GitHub** (after creating a repository on GitHub):
   ```bash
   git remote add origin git@github.com:username/repo.git
   git push -u origin main
   ```
6. **Create a branch**, make changes, and merge:
   ```bash
   git branch feature-update
   git checkout feature-update
   echo "New Requirement" >> BRD.md
   git add BRD.md
   git commit -m "Added new requirement"
   git checkout main
   git merge feature-update
   git push
   ```

---

## 3.4 Summary

These commands form the basic Git workflow:
1. **`git init`** – start version control.  
2. **`git add`** – prepare changes.  
3. **`git commit`** – save a snapshot.  
4. **`git push`** – send updates to GitHub.  
5. **`git branch`** – create a branch for new work.  
6. **`git checkout`** – switch to a branch.  
7. **`git merge`** – bring work together.

By mastering these, you can confidently manage project versions and collaborate with your team.

---

## 3.5 Next Steps

Now that you know the basics, you can:
- Explore more advanced commands (`git pull`, `git log`, `git stash`)  
- Learn about resolving merge conflicts  
- Continue with **Markdown writing** to create structured BRDs and PRDs

👉 Proceed to the next lesson: **Writing in Markdown for BRD/PRD**
