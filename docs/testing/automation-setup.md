# Automation Framework

A modular test automation framework built with **Python** and **Playwright**.  
Supports two main environments: `dev` and `pay`.

---

## 🚀 Key Features

- **Playwright-powered automation**: Fast, reliable browser testing.
- **Two run modes**: Run tests in either `dev` or `pay` environment.
- **Modular design**: Each feature (Login, Checkout, Orders, etc.) has its own script.
- **Reusable helpers**: Centralized actions in `Utility.py` (click, fill, navigation, logging).
- **Logging & Reporting**: Outputs saved as JSON for traceability.
- **CI/CD ready**: GitHub Actions workflows for automated runs and report uploads.

---

## 📂 Project Structure

```plaintext
.github/workflows/   # CI/CD workflows (report uploads, automation triggers)
Outputjson/          # Stores logs and test results in JSON format
TestcasesJson/       # Holds input test cases in JSON

Utility.py           # Core helper functions (click, fill, navigation, checks)
Logging.py           # Logging utilities (records actions, errors, outputs)
Main.py              # Entry point for running grouped tests

# Feature-specific test scripts:
Login.py             # Login flow
Checkout.py          # Checkout process
Orders.py            # Order management
Product.py           # Product-related tests
Shipping.py          # Shipping flow
Dashboard.py         # Dashboard checks
Reporting.py         # Reporting automation
Blogs.py             # Blogs automation
Media.py             # Media library automation
NavBar.py            # Navigation bar interactions
Register.py          # Registration flow
Leads.py             # Leads automation
AI.py                # AI-related tests

requirements.txt     # Python dependencies
```

---

## 🧑‍💻 Playwright Basics (for new users)

- **Page**: Represents a single browser tab. Interact using methods like `.goto()`, `.click()`, `.fill()`.
- **Locators**: Find elements in different ways:
    - `page.get_by_role("button", name="Login")` — best for accessible role-based selectors.
    - `page.get_by_text("Submit")` — finds by visible text.
    - `page.locator("#id")` — standard CSS/XPath selector.
- **Headless vs Headed**: By default, Playwright runs headless (no visible browser). For debugging:
    ```python
    browser = p.chromium.launch(headless=False)
    ```
- **Waits**: Playwright auto-waits for elements before interacting, reducing flaky tests.

---

## ✅ Best Practices

- Keep test logic inside feature files (`Login.py`, `Checkout.py`, etc.).
- Keep reusable actions inside `Utility.py`.
- Use environment flags (`--env dev` / `--env pay`) to switch environments cleanly.

---

## 📌 Notes

### 🔹 Modular Design

- Each feature (e.g., `Login.py`, `Checkout.py`) contains only test flow steps.
- Shared actions live in `Utility.py`, so they don’t need to be rewritten everywhere.
- **Maintainability**: If a locator or logic changes, update it once in `Utility.py`.

> Example: A button locator used across multiple tests only needs to be fixed in one place.

---

### 🔹 Utility Function Example

**Utility.py**
```python
def click(page, locator_type, locator_value):
        if locator_type == "role":
                page.get_by_role(locator_value[0], name=locator_value[1]).click()
        elif locator_type == "text":
                page.get_by_text(locator_value).click()
```

---

### 🔹 Example Test Script

**Login.py**
```python
from Utility import click, fill

def run_login(page, env):
        url = "https://dev.example.com" if env == "dev" else "https://pay.example.com"
        page.goto(url + "/login")

        fill(page, "role", ("textbox", "Email"), "test@example.com")
        fill(page, "role", ("textbox", "Password"), "mypassword")
        click(page, "role", ("button", "Login"))
```

---

## ▶️ Running Tests

```bash
python Main.py --env dev
```
or
```bash
python Main.py --env pay
```