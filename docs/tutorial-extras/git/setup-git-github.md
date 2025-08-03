---
id: setup-git-github
slug: /tutorial-extras/git/setup-git-github
sidebar_position: 2
tags: [git, github, setup, version control]
keywords: [Git, GitHub, setup, version control, collaboration, software development]
title: Setting Up Git & GitHub
sidebar_label: Setup Git & GitHub
description: Step-by-step guide to setting up Git and GitHub, including account creation, installation, configuration, and SSH key setup.
---

# Setting Up Git & GitHub

---

## 2.1 Overview
Before you can start using Git and GitHub, you must complete a one-time setup. This includes creating a GitHub account, installing Git, configuring your identity, and connecting Git to GitHub securely.

---

## 2.2 Step 1: Create a GitHub Account

1. Go to [https://github.com/join](https://github.com/join).  
2. Enter a **Username**, **Email**, and **Password**.  
3. Verify your email address.  
4. Log in to [https://github.com](https://github.com).

---

## 2.3 Step 2: Install Git

### For Windows
- Download from [https://git-scm.com/downloads](https://git-scm.com/downloads).  
- Run the installer with default settings.  
- Use **Git Bash** to start using Git.

### For macOS
```bash
brew install git
```

### For Linux (Debian/Ubuntu)
```bash
sudo apt-get install git
```

Verify installation:
```bash
git --version
```

---

## 2.4 Step 3: Configure Git User Information

Set up your identity so Git knows who makes changes.

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Check your configuration:
```bash
git config --list
```

---

## 2.5 Step 4: Generate and Add an SSH Key to GitHub

Using an SSH key allows Git to connect to GitHub securely without asking for your password every time.

### 2.5.1 Generate an SSH Key
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```
- Press **Enter** to accept the default location.
- Enter a passphrase (optional).

### 2.5.2 Start the SSH Agent
```bash
eval "$(ssh-agent -s)"
```

### 2.5.3 Add Your SSH Key to the Agent
```bash
ssh-add ~/.ssh/id_ed25519
```

### 2.5.4 Copy the SSH Key
```bash
cat ~/.ssh/id_ed25519.pub
```
Copy the entire key output.

---

### 2.5.5 Add the Key to GitHub
1. Go to **GitHub → Settings → SSH and GPG Keys**.  
2. Click **New SSH Key**.  
3. Paste your key and click **Add SSH Key**.

Test the connection:
```bash
ssh -T git@github.com
```
You should see a success message.

---

## 2.6 Summary
After completing these steps, you have:
- A GitHub account  
- Git installed on your computer  
- Your identity configured  
- A secure SSH connection to GitHub  

Your environment is ready to use Git and GitHub.

---

## 2.7 Next Steps
With the setup complete, move on to learning the **basic Git commands**:
- Initialize a repository  
- Track and save changes  
- Work with branches  
- Merge changes  

👉 Continue to the next chapter: **Basic Git Commands**
