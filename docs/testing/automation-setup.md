# QA_PLAYWRIGHT

A **Python + Playwright** UI automation framework featuring:
- modular test scripts per feature
- JSON-driven test cases
- JSON + Markdown reporting
- video artifacts per run
- **selective execution** of modules
- **Playwright Codegen** for fast, reliable locator creation

> ⚠️ Note: This framework uses **`dev` as the primary execution environment**.  

---

## Project Structure

```
QA_PLAYWRIGHT/
├─ .github/                 # CI/CD workflows
├─ Artifacts/               # Videos + temporary run artifacts
├─ Module/                  # Feature modules (each file = a feature test flow)
├─ OutputJson/              # Run outputs (summary, failures, temp results)
├─ TestcasesJson/           # Source test cases (JSON)
├─ Utility/                 # Core automation utilities
├─ .env                     # Environment configuration (not committed)
├─ Makefile
├─ requirements.txt
└─ Main.py                  # Main entry point
```

---

## Installation Guide

### 1️⃣ Install Python

**Windows**
1. Download Python from: https://www.python.org/downloads/
2. During installation:
   - ✅ Check **“Add Python to PATH”**
3. Verify installation:
```bash
python --version
```

**macOS / Linux**
```bash
python3 --version
```

Recommended version: **Python 3.10+**

---

### 2️⃣ Create a Virtual Environment (Recommended)

```bash
python -m venv venv
```

Activate it:

**Windows**
```bash
venv\Scripts\activate
```

**macOS / Linux**
```bash
source venv/bin/activate
```

---

### 3️⃣ Install Project Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Install Playwright Browsers

```bash
playwright install
```

This installs Chromium, Firefox, and WebKit required for test execution.

---

## Environment Configuration (.env)

Create a `.env` file at the project root:

```env
DEV_BASE_URL=https://dev.example.com
EMAIL=test@example.com
PASSWORD=your_password
```

> Never commit `.env` to version control.

---

## How to Run Tests

### Full Regression Run (dev)

```bash
python Main.py --env dev
```

This executes the full test flow defined in `Main.py`.

---

## Selective Module Execution

Run only specific feature modules:

```bash
python Main.py --env dev --modules nav,dashboard,product,orders
```

Execution behavior:
- Login runs once
- Each module is resolved via `MODULE_MAP`
- Unknown modules are skipped safely

### Supported Module Keys

```
nav, dashboard, product, ai, shipping, orders, blogs,
media, design, leads, store, onboard, billing,
customer, categories, marketplace, digital,
page, template, reports, announcement
```

---

## Outputs & Artifacts

After execution, the framework generates:

### 📁 OutputJson/
- `summary.json`
- `failed_statuses.json`
- `temp_results.json`

### 🎥 Artifacts/
- Temporary and final test run videos
- Automatically cleaned and saved via `Utility/Artifacts.py`

### 📊 Markdown Reports
- Generated via `json_to_md_tables(...)`

---

## Playwright Codegen (Locator & Flow Recording)

Playwright **Codegen** records browser actions and generates stable selectors.

### Install Codegen
Codegen is included with Playwright. No extra install needed.

### Run Codegen (Python Output)
```bash
playwright codegen --target python https://dev.example.com
```

Start from a specific page:
```bash
playwright codegen --target python https://dev.example.com/login
```

---

### How to Use Codegen with This Framework

Codegen output is **reference-only**.

#### From Codegen:
```python
page.get_by_role("textbox", name="Email").fill("test@example.com")
page.get_by_role("button", name="Login").click()
```

#### Translate into Framework Style:
```python
from Utility.Helpers import fill, click

fill(page, "role", ("textbox", "Email"), "test@example.com")
click(page, "role", ("button", "Login"))
```

---

## Best Practices

- Keep business logic in `Module/*.py`
- Keep reusable UI actions in `Utility/Helpers.py`
- Prefer locators in this order:
  1. Role / Label
  2. data-testid
  3. CSS / XPath (last resort)
- Re-run codegen after UI changes to refresh selectors

---

## Troubleshooting

- **Playwright opens but does nothing**
  - Check `.env` values
  - Ensure login credentials are valid

- **Module not executed**
  - Confirm module key exists in `MODULE_MAP`
  - Verify module import in `Main.py`

## Video

https://drive.google.com/file/d/1dxoYnMEuj-Yvm39uk9ttyKFMhkqrcFSl/view?usp=sharing