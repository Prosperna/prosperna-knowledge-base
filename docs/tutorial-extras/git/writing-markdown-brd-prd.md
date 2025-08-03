---
id: writing-markdown-brd-prd
title: Writing in Markdown for BRD/PRD
sidebar_label: Writing in Markdown
description: Learn how to write Business Requirement Documents (BRD) and Product Requirement Documents (PRD) using Markdown syntax for clean and structured documentation.
---

# Writing in Markdown for BRD/PRD

---

## 6.1 Overview
Markdown is a simple way to format text that is easy to write and read.  
It is widely used in GitHub for documentation, including BRDs (Business Requirement Documents) and PRDs (Product Requirement Documents).  
By using Markdown, you can create clean, structured, and professional documentation directly in your repository.

---

## 6.2 Why Use Markdown for BRD/PRD?

- **Easy to Write** – No special software needed; just use a text editor.  
- **Clean Formatting** – Uses simple symbols for formatting.  
- **GitHub Friendly** – GitHub automatically renders Markdown into formatted documents.  
- **Version Controlled** – Markdown files work perfectly with Git and GitHub.  

---

## 6.3 Basic Markdown Syntax

Here are the basic elements you will use:

### 6.3.1 Headings
Use `#` for headings:
```
# Main Title
## Section Title
### Subsection
```

### 6.3.2 Paragraphs
Just write text normally.  
Leave a blank line between paragraphs.

### 6.3.3 Bold and Italic
```
**bold text**
*italic text*
```

### 6.3.4 Lists
#### Unordered List:
```
- Requirement 1
- Requirement 2
```
#### Ordered List:
```
1. Step One
2. Step Two
```

### 6.3.5 Links
```
[Link Text](https://example.com)
```

### 6.3.6 Images
```
![Alt Text](https://example.com/image.png)
```

### 6.3.7 Tables
```
| ID  | Requirement            | Priority |
|-----|------------------------|----------|
| R1  | User login             | High     |
| R2  | Export data to CSV     | Medium   |
```

### 6.3.8 Blockquotes
```
> This is an important note.
```

### 6.3.9 Code Blocks
````markdown
```json
{
  "example": true
}
```
````

---

## 6.4 Example BRD Structure in Markdown

````markdown
# Business Requirement Document (BRD)

## 1. Introduction
This document describes the business requirements for the project.

## 2. Objectives
- Improve user experience
- Increase conversion rate

## 3. Requirements
| ID  | Requirement              | Priority |
|-----|--------------------------|----------|
| R1  | User login functionality | High     |
| R2  | Data export to CSV       | Medium   |

## 4. References
[Design Mockups](https://example.com/design)
````

---

## 6.5 Example PRD Structure in Markdown

````markdown
# Product Requirement Document (PRD)

## 1. Overview
The PRD defines the features and technical specifications.

## 2. Features
1. User authentication
2. Dashboard with analytics
3. Export feature

## 3. Technical Notes
> All APIs must use HTTPS.

## 4. Acceptance Criteria
- [ ] Login works with email and password
- [ ] Dashboard loads in under 3 seconds
- [ ] CSV export matches expected format
````

---

## 6.6 Hands-On Practice

1. Create a new file in your repository named `BRD.md`.  
2. Use headings, tables, and lists to write requirements.  
3. Commit and push it to GitHub.  
4. Create a new branch, add a `PRD.md`, and merge it into the main branch.  
5. Review the formatted files directly on GitHub.

---

## 6.7 Summary

With Markdown, you can:
- Write structured and professional BRDs and PRDs.  
- Use Git and GitHub to track changes and collaborate.  
- Keep your project documentation clean, readable, and version-controlled.

---

## 6.8 Next Steps

You have now mastered writing Markdown for project documentation.  
The next step is to learn **collaboration workflows** like pull requests, code/document reviews, and best practices for working in a team using GitHub.

👉 Continue to: **Collaboration Workflow with GitHub**
