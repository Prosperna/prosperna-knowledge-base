const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'docs', 'engineering');

const structure = {
  'onboarding': [
    'welcome.md',
    'devsecops.md',
    'backend.md',
    'frontend.md',
    'fullstack-qa.md',
    'tools-setup.md',
    'first-90-days.md',
  ],
  'sops/ci-cd': [
    'code-review-sop.md',
    'git-conventions.md',
    'pull-request-lifecycle.md',
  ],
  'sops/security': [
    'secrets-management.md',
    'vapt-response.md',
  ],
  'sops/infrastructure': [
    'terraform-guide.md',
    'helm-management.md',
    'promotion-process.md',
  ],
  'sops/testing': [
    'unit-integration-sop.md',
    'test-coverage-strategy.md',
  ],
  'architecture': [
    'system-overview.md',
    'microservices-map.md',
    'api-gateway.md',
    'infrastructure-stack.md',
    'monitoring-logging.md',
  ],
  'tools': [
    'github-actions.md',
    'sonarqube.md',
    'postman.md',
    'docker-k8s.md',
    'clickup-dev-workflow.md',
    'static-analysis.md',
  ],
  'standards': [
    'code-style-guides.md',
    'testing-best-practices.md',
    'peer-review.md',
    'doc-writing-guide.md',
  ],
  'operations': [
    'slos.md',
    'alerting.md',
    'dashboards.md',
  ],
  'platform': [
    'pipeline-patterns.md',
    'platform-playbook.md',
    'zero-downtime-deploy.md',
    'feature-flags.md',
  ],
  'leadership': [
    'career-ladder.md',
    'engineering-okrs.md',
    'performance-reviews.md',
    'retrospectives.md',
    'tech-debt.md',
  ]
};

// Create folders and markdown files
for (const [folder, files] of Object.entries(structure)) {
  const fullFolderPath = path.join(baseDir, folder);
  fs.mkdirSync(fullFolderPath, { recursive: true });

  files.forEach(file => {
    const filePath = path.join(fullFolderPath, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `---\ntitle: ${file.replace(/-/g, ' ').replace('.md', '')}\n---\n\n# ${file.replace(/-/g, ' ').replace('.md', '')}\n`);
      console.log(`✅ Created: ${filePath}`);
    } else {
      console.log(`⏭️ Skipped (already exists): ${filePath}`);
    }
  });
}