#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define folder structure and files
const structure = {
  "business": ["business-case", "brd", "mrp"],
  "product": ["prd", "frd", "mrd"],
  "technical": ["system-architecture", "technical-spec", "api-spec"],
  "testing": ["test-plan", "test-cases", "test-report"],
  "process": ["sop", "runbook", "how-to-guides"],
  "user-guides": ["user-manual", "install-guide", "release-notes"],
  "governance": ["security-policy", "sla", "raci-matrix"],
  "project-management": ["project-charter", "project-plan", "meeting-minutes"],
  "data-terms": ["data-dictionary", "glossary"],
  "legal": ["nda", "msa"]
};

// Root docs directory
const docsDir = path.join(__dirname, 'docs');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Iterate and create files
Object.entries(structure).forEach(([folder, files]) => {
  const folderPath = path.join(docsDir, folder);
  fs.mkdirSync(folderPath, { recursive: true });

  files.forEach((file, index) => {
    const filePath = path.join(folderPath, `${file}.md`);
    if (fs.existsSync(filePath)) {
      console.log(`Skipping existing: ${filePath}`);
      return;
    }

    // Generate title from filename
    const title = file
      .split('-')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    // Front-matter and placeholder
    const content = `---
id: ${file}
title: ${title}
sidebar_position: ${index + 1}
---

# ${title}

Write content here.
`;

    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
  });
});

console.log('Prosperna Knowledge Base scaffolding complete.');