---
id: kb-style-guide
title: Prosperna KB Style Guide
sidebar_label: Prosperna KB Style Guide
---

# Prosperna KB Style Guide

This guide outlines the standard format, structure, and naming policy for Prosperna's Knowledge Base (KB) documentation in Docusaurus. All contributors must follow these guidelines to ensure consistency, clarity, and professionalism.

---

## File Format

- All Knowledge Base files **must be written in Markdown (.md)**.
- Each file must include **frontmatter metadata** at the top to define how it will appear in the sidebar and URL path.

### Example Frontmatter

```md
---
id: mongodb-atlas
title: MongoDB Atlas Usage Guide
sidebar_label: MongoDB Atlas Usage Guide
---
```

### Frontmatter Guidelines

- `id`: Used as the path for the KB page (e.g., `/mongodb-atlas`). It should be lowercase, hyphen-separated, and descriptive.
- `title`: Displayed as the main heading on the page.
- `sidebar_label`: Used for the left sidebar. **Do not use emojis or icons** here.

---

## Naming Conventions

- Use **lowercase kebab-case** for filenames and `id`s (e.g., `mongo-db-guide.md`, `user-permissions.md`).
- Titles and headings should be **in Title Case**.
- Keep file and section names **clear and concise**.

---

## Content Formatting

- Use `#` for main titles, `##` for sections, and `###` for subsections.
- Use bullet lists for simple enumeration and numbered lists for step-by-step instructions.
- Add code blocks for configuration, CLI commands, or scripts using triple backticks (\`\`\`).
- Always prefer clarity over complexity—keep sentences short and straightforward.
- Ensure spelling and grammar are correct; use tools like Grammarly if needed.

---

## Writing Style

- Write in a **professional, yet friendly** tone.
- Avoid jargon unless necessary—if used, define it clearly.
- Use second person ("you") when instructing users.

### Good Example

> You can access the MongoDB Atlas dashboard by clicking the **Clusters** tab.

### Bad Example

> One must navigate to the Clusters section in order to continue.

---

## 💡 Additional Guidelines

- Group related KBs under the same category folder when needed (e.g., `networking/`, `monitoring/`).
- Use inline code for filenames, settings, or commands (e.g., `docker-compose.yml`, `npm install`).
- Avoid unnecessary emojis or formatting in the content unless used for clarity.
- Always include context at the beginning of the doc if it is environment- or app-specific (e.g., "This applies to the Production environment only").

---

## ✅ Checklist Before Submitting a KB

- Markdown format enforcement
- Proper frontmatter with id, title, and sidebar_label
- Lowercase-kebab-case for filenames and IDs
- Title Case usage for titles and headings
- No icons or emojis in sidebar_label
- Correct Markdown heading hierarchy
- Triple backticks for code blocks with language tags
- Grammar and clarity checks
- Context specification for environment-specific content
- Organization of related docs into folders