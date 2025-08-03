---
id: creating-first-repo
slug: /tutorial-extras/git/creating-first-repo
sidebar_position: 4
tags: [git, github, repository, version control]
keywords: [Git, GitHub, repository, version control, collaboration, software development]
title: Creating Your First Git Repository
sidebar_label: Creating First Repo
description: Step-by-step guide to creating your first Git repository, adding files, and pushing them to GitHub.
---

# Creating Your First Git Repository

---

## 4.1 Overview
Now that you have Git installed and know the basic commands, it's time to create your first repository.  
A repository (repo) is like a project folder where Git stores your files and tracks all changes.

In this lesson, you will:
- Create a new repository locally.
- Add a file and make your first commit.
- Connect the repository to GitHub.
- Push the repository online.

---

## 4.2 Step 1: Create a New Local Repository

1. **Open a terminal** on your computer.  
2. **Create a new folder** for your project:
   ```bash
   mkdir my-first-project
   cd my-first-project
   ```
3. **Initialize the repository**:
   ```bash
   git init
   ```
You have now created an empty Git repository locally.

---

## 4.3 Step 2: Create and Add a File

1. **Create a file** (e.g., `BRD.md`) and write some text:
   ```bash
   echo "# Business Requirements Document" > BRD.md
   ```
2. **Check repository status**:
   ```bash
   git status
   ```
3. **Stage the file** for commit:
   ```bash
   git add BRD.md
   ```

---

## 4.4 Step 3: Commit Your First Change

Save the staged file with a commit message:
```bash
git commit -m "Initial commit with BRD file"
```
> Commits are like snapshots. They record the current state of your files.

---

## 4.5 Step 4: Create a Remote Repository on GitHub

1. Go to [https://github.com](https://github.com).  
2. Click **New Repository**.  
3. Enter a name (e.g., `my-first-project`).  
4. Keep it **public** or **private** depending on your need.  
5. Click **Create Repository**.

---

## 4.6 Step 5: Connect Local Repo to GitHub

Copy the SSH URL from GitHub, then run:
```bash
git remote add origin git@github.com:username/my-first-project.git
```
Verify the connection:
```bash
git remote -v
```

---

## 4.7 Step 6: Push Your Local Repo to GitHub

Upload your commits to GitHub:
```bash
git push -u origin main
```
> If your default branch is `master`, use:
```bash
git push -u origin master
```

After this, your project will be visible on GitHub.

---

## 4.8 Step 7: Verify on GitHub

1. Go to your repository page on GitHub.  
2. You should see `BRD.md` and your commit message.

---

## 4.9 Hands-On Practice

Try the following:
1. Create another file (e.g., `PRD.md`) and add content.
2. Stage, commit, and push it using:
   ```bash
   git add PRD.md
   git commit -m "Added PRD document"
   git push
   ```
3. Confirm the file appears on GitHub.

---

## 4.10 Summary

You have successfully:
- Created a local repository with `git init`.
- Added and committed a file with `git add` and `git commit`.
- Linked your repository to GitHub with `git remote add origin`.
- Uploaded your work with `git push`.

You are now ready to collaborate with your team using GitHub.

---

## 4.11 Next Steps

In the next chapter, you will learn **how to write BRD and PRD documents using Markdown** to create clean, professional documentation in your repository.

👉 Continue to: **Writing in Markdown for BRD/PRD**
