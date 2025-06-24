---
id: tools-setup
title: Engineering Tools Setup
sidebar_label: 🛠 Tools Setup
---

# 🛠 Prosperna Engineering Tools Setup

This guide will help you configure your local environment, access essential tools, and be ready to collaborate on your first task.

---

## ✅ 1. Core Tools Access

| Tool                        | Purpose                                                   | How to Get Access                                                |
|-----------------------------|------------------------------------------------------------|------------------------------------------------------------------|
| **ClickUp**                 | Task tracking, Kanban board, documentation, internal chat | Request access via `web.admin@prosperna.com`                     |
| **GitHub**                  | Source code, PRs, code reviews                            | Send GitHub username to DevOps or your lead                      |
| **AWS Console**             | Infra access (if required)                                | Email `web.admin@prosperna.com` for role-based permissions       |
| **1Password**               | Secure credentials (e.g., backup access, shared secrets)  | Invite sent during onboarding                                    |
| **Facebook Internal Group** | Team-wide announcements and discussions                   | Ask HR to invite you to the official Prosperna Engineering group |

---

## 💻 2. Local Development Setup

### Required Software

Install the following tools depending on your OS:

- [ ] **Git**
- [ ] **Node.js (LTS)** and **npm**
- [ ] **Docker Desktop**
- [ ] **VS Code** or preferred IDE

#### For macOS:
```bash
brew install git node docker --cask
```

#### For Windows:
Install from official websites:
- Git: https://git-scm.com/
- Node.js: https://nodejs.org/
- Docker: https://www.docker.com/products/docker-desktop
- VS Code: https://code.visualstudio.com/

### Common CLI Tools

You’ll use these globally across projects:

```bash
npm install -g eslint prettier typescript
```
:::warning[Take care]
> ⚠️ Use `sudo` if you encounter permission errors when installing globally.
:::

### 🔑 SSH Key Setup (Required for GitHub Access)

If this is your first time using Git:

```bash
ssh-keygen -t ed25519 -C "your.email@prosperna.com"
cat ~/.ssh/id_ed25519.pub
```

Copy the key and add it to your GitHub account:  
https://github.com/settings/keys

:::warning[Take care]

> ⚠️ If you skip this step, you may get permission errors when cloning or pushing.
:::

---

## ⚙️ 3. Project Setup Steps

### Clone Your First Repository

```bash
git clone git@github.com:Prosperna/<your-team-repo>.git
cd <your-team-repo>
```

### Setup Environment Variables (Managed via AWS KMS)

- Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

- Encrypted credentials are managed securely using **AWS KMS (Key Management Service)**.
- Request permission for KMS decryption from `web.admin@prosperna.com`.

#### 🔐 Example: Decrypt an Environment File

```bash
aws kms decrypt \
  --ciphertext-blob fileb://.env.encrypted \
  --output text \
  --query Plaintext \
  --region ap-southeast-1 | base64 --decode > .env
```
:::warning[Take care]
> ⚠️ **Never commit `.env` or decrypted secrets to GitHub.** Only `.env.example` should be versioned.
:::

### 🧪 Run the App and Test Locally

```bash
npm install         # Install dependencies
npm run dev         # Start app
npm run test        # Run test suite
npm run lint        # Check code formatting
```

:::warning[Take care]
> ✅ Ensure Docker is running if the app relies on containerized services.
:::

---

## 🔐 4. Git & Branching Conventions

- Always branch from `develop`
- Use this format: `feature/short-desc`, `fix/bug-id`, `chore/tooling-update`
- Follow Conventional Commits in your messages:
  - `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`

**Example:**

```bash
git checkout -b feature/onboarding-guide
git commit -m "docs: add engineering tools setup guide"
```

---

## 📈 5. VS Code Recommended Extensions

- ESLint
- Prettier
- GitLens
- Docker
- YAML
- EditorConfig
- TypeScript Hero

:::warning[Take care]

> Use the project’s `.vscode/extensions.json` if available for auto-suggestions.
::: 
---

## 📁 Folder Structure Overview

```
/src          → Application logic (TypeScript)
/config       → Environment-specific configuration
/tests        → Unit and integration tests
/public       → Static assets
.vscode/      → Recommended editor configs
```

---

## 🔍 6. Troubleshooting

| Issue                      | Common Fix                                                     |
|----------------------------|----------------------------------------------------------------|
| Docker not starting        | Restart Docker Desktop                                          |
| Ports already in use       | Kill port: `lsof -ti:3000 | xargs kill -9`                     |
| `npm install` fails        | Clear cache: `rm -rf node_modules && npm cache clean --force`  |
| Permission denied on clone | Ensure you're using SSH and added to GitHub Org                |

---

## ⚠️ Common Pitfalls

| Problem                    | Fix                                                           |
|----------------------------|---------------------------------------------------------------|
| Git push fails             | SSH key not added to GitHub                                   |
| `npm run dev` crashes      | Check if `.env` is missing or Node version mismatch           |
| Docker not responding      | Restart Docker Desktop, check for port conflicts              |
| Tests not running          | Ensure test config supports TypeScript and dependencies are installed |

---

## 📬 Need Help?

If you're blocked or unsure:

- Ask in your **ClickUp chat** with your onboarding buddy
- Post in the **Engineering Facebook Group**
- Email: [web.admin@prosperna.com](mailto:web.admin@prosperna.com)

---

Once your tools are set up, you’re ready to dive into your first real sprint.  
Welcome aboard! 🚀
