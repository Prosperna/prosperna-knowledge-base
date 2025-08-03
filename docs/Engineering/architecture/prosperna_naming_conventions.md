---
id: prosperna-naming-conventions
slug: /prosperna-naming-conventions
title: Prosperna Naming Conventions Guide
description: Official Prosperna naming conventions for frontend, backend, mobile, APIs, databases, and infrastructure, explained with textbook-level detail.
---

# Prosperna Naming Conventions Guide

This guide provides a **textbook-level explanation** of Prosperna's naming standards, detailing **why** each rule exists, **what** the rule states, and **how** to apply it effectively. It serves as the official reference for all Prosperna developers and engineers.

## Preface
Naming conventions are more than cosmetic preferences; they are a shared language. A well-defined naming system minimizes misunderstandings, speeds up onboarding, and reduces the chance of introducing defects. This document enforces a unified approach to maintain scalability and consistency across all Prosperna projects.

## 1. General Principles
### Why
Names are the first documentation developers read. Clear names reduce cognitive load, making it easier to understand unfamiliar code.

### What
- Names act as **contracts** between developers.
- Patterns must be consistent across every project.

### How
1. Prefer descriptive names over abbreviations.
2. Apply the same case convention within each context.
3. Ensure names reflect their purpose clearly.

---

## 2. Directory & Filename Conventions
### Why
Project structure defines readability. A consistent hierarchy prevents import errors and confusion in larger teams.

### What
- Directories: `kebab-case`
- Frontend components: `PascalCase`
- Backend files: `kebab-case`
- Config files: lowercase with dashes

### How
Organize by feature, not file type, for easier navigation:
```bash
src/
 ├── user-profile/
 │    ├── UserCard.tsx
 │    ├── user-service.ts
 │    └── user-controller.ts
 └── shared-utils/
```

---

## 3. Credentials & Environment Variables
### Why
Poorly named or stored credentials lead to leaks and misconfiguration.

### What
- Store secrets securely in AWS KMS or `.env`.
- Use `UPPERCASE_SNAKE_CASE` for environment variables.

### How
```env
PROSPERNA_API_KEY=xxxx
DB_PASSWORD=xxxx
AWS_SECRET_KEY=xxxx
```
> **Tip:** Never commit `.env` files to version control.

---

## 4. API Naming Standards
### Why
Clear and consistent endpoints simplify integrations and debugging.

### What
- Follow RESTful principles.
- Use `kebab-case` for resource names.
- Version endpoints with `/v1/`.

### How
```http
GET  /v1/users/{userId}
POST /v1/orders
PATCH /v1/products/{id}
```

### API Gateway Naming
Follow `{service}-{action}` pattern:
```
order-create
user-login
```

---

## 5. Domain Naming
### Why
Environment-based domains avoid accidental deployments to production.

### What
- Use lowercase and clear environment labels.

### How
```
Local:    localhost:3000
Dev:      prodev.prosperna.ph
Staging:  prostage.prosperna.ph
Prod:     p1.prosperna.com
```

---

## 6. Mobile Application Naming
### Why
Cross-platform projects benefit from standardized naming to prevent conflicts.

### What
- Screens: `PascalCase` with `Screen` suffix.
- Hooks: prefix with `use`.
- Variables: `camelCase`.

### How
```ts
LoginScreen.tsx
useUserProfile.ts
```

---

## 7. Code Naming
### Why
Readable and meaningful names reduce maintenance cost.

### What
- Functions: verbs in `camelCase`.
- Classes: nouns in `PascalCase`.
- Constants: `UPPERCASE_SNAKE_CASE`.

### How
```ts
class UserService {}
function getUserData() {}
const MAX_RETRY_LIMIT = 5;
```

---

## 8. Database Naming
### SQL (Relational)
- Tables: `snake_case`, plural.
- Columns: `snake_case`.
- Indexes: prefix with type.
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY,
  email VARCHAR(255),
  created_at TIMESTAMP
);
```
### MongoDB (NoSQL)
- Collections: `snake_case`, plural.
- Fields: `camelCase`.
```json
{
  "firstName": "John",
  "lastLogin": "2025-08-03"
}
```

---

## 9. Frontend Conventions
### Why
Frontend projects involve many components. Consistent naming ensures components are easy to locate.

### What
- Components: `PascalCase`.
- CSS Modules: match component name.
- Boolean variables: prefix with `is`, `has`, `should`.

### How
```tsx
const isLoading = true;
import styles from './ProductCard.module.css';
```

---

## 10. CSS Naming Conventions
### Why
Structured CSS prevents style conflicts in large applications.

### What
- Use **BEM (Block-Element-Modifier)** or `kebab-case`.
- Avoid visual-based names; use semantic names.

### How
```css
.card {}
.card__title {}
.card__title--highlighted {}
.main-header {}
.footer-links {}
```
> CSS Modules are recommended to scope styles locally.

---

## 11. Backend Conventions
### Why
Consistent backend naming reflects a clean architecture and makes the responsibilities of each component obvious.

### Controller Naming
- Use descriptive nouns with `Controller` suffix to represent HTTP layer handlers.
- Example: `UserController.ts`, `OrderController.ts`.
- Names should mirror the resource they handle.

### Model Naming
- Use singular `PascalCase` for model classes or entities.
- Example: `User.ts`, `Product.ts`.
- Table or collection names should remain plural, but models use singular.

### Views Naming
- Use `PascalCase` for view templates when framework allows file naming with capitalization.
- Prefix views by module or feature to avoid collisions.
- Example: `UserProfileView.html`, `OrderSummaryView.ejs`.

### Service and DTO Naming
- Services: `Service` suffix, representing business logic.
- DTOs: `Dto` suffix for data transfer objects.

### How
```
UserController.ts
OrderService.ts
CreateUserDto.ts
User.ts
UserProfileView.ejs
```

---

## 12. URL Paths & SEO
### Why
SEO-friendly URLs increase discoverability.

### What
- Use lowercase, `kebab-case`.
- Avoid query parameters for key pages.

### How
✅ `/products/wireless-headphones`  
❌ `/products?id=123`

---

## 13. Image Naming
### Why
Well-named images improve SEO and asset management.

### What & How
```
prosperna-logo.png
user-avatar-default.jpg
wireless-headphones-main.webp
```

---

## 14. Git Naming
### Why
Standardized branch and commit naming helps with tracking and automated changelogs.

### What
- Branches: `feature/`, `bugfix/`, `hotfix/`.
- Commits: follow Conventional Commits (`feat:`, `fix:`, `chore:`).

---

## 15. Advanced Recommendations
- Avoid magic strings; define constants.
- Use automated linters to enforce standards.
- Include naming rules in every repo's documentation.

---

## 16. Conclusion
Naming is a form of communication that conveys intent. Consistency in naming allows Prosperna teams to deliver features faster, minimize bugs, and keep the codebase maintainable.

## Visual Reference
- Diagram: API → Service → Database → UI → CSS naming flow.
- Cheatsheet: quick rules for daily use.

---

