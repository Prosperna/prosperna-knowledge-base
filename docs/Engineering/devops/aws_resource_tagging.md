---
id: aws-tagging
title: AWS Resource Tagging Standards
sidebar_label: AWS Tagging
---

# AWS Resource Tagging Standards

This guide explains how Prosperna applies consistent tagging across all AWS resources to improve cost monitoring, resource ownership, and environment segmentation.

---

## Tagging Format

Each AWS resource should be tagged using the following keys:

| Tag Key | Example Values | Description |
|--------|----------------|-------------|
| `Name` | `p1-ecs-service`, `cebuana-rds-db` | Human-readable resource name |
| `Project` | `p1`, `Cebuana`, `Datadog`, `Prosperna NAT Gateway-az1`, `Prosperna Wordpress` | Associated project or initiative |
| `Environment` | `Development`, `Staging`, `Production` | Identifies the lifecycle stage |

> 🧠 These tags help categorize usage in AWS Cost Explorer and facilitate chargebacks per project/environment.

---

## Tag Editor (Bulk Tagging)

To bulk tag resources:

1. Go to [AWS Tag Editor](https://ap-southeast-1.console.aws.amazon.com/resource-groups/tag-editor/find-resources?region=ap-southeast-1)
2. Select the region: `ap-southeast-1`
3. Filter by resource type (e.g. EC2, S3, RDS, Lambda)
4. Click **Search Resources**
5. Select resources and click **Manage Tags of selected resources**
6. Add or edit the tag key-value pairs:
   - `Project: Prosperna`
   - `Environment: Staging`
   - `Name: prosperna-wordpress-sg`
7. Click **Review and Apply**

> 📌 Ideal for applying consistent tags across multiple resources quickly.

---

## 📊 Cost Allocation Tag Support

To activate tags for cost tracking:

1. Go to **Billing Console** > **Cost Allocation Tags**
2. Search for the tag key (e.g., `Project`, `Environment`)
3. Select and click **Activate**

This enables these tags to appear in **Cost Explorer**, **Budgets**, and **Cost & Usage Reports**.

---

## 🔍 Tagging Use Cases

### ECS & EC2
- Tag by service (`Project=p1`, `Name=p1-api-service`)
- Track instance environments (`Environment=Staging`)

### S3 Buckets
- `Project=MediaServer`, `Environment=Production`

### Lambda Functions
- `Project=AutoCertProvisioner`, `Environment=Production`

### RDS & DynamoDB
- Database-specific tags: `Name=p1-prod-db`, `Project=p1`

---

## Best Practices

- Use consistent casing (e.g., `Production` not `production`)
- Avoid spaces in tag keys
- Always tag shared infrastructure (e.g., NAT Gateways, VPCs)
- Automate tagging during deployment (e.g., via Terraform, CDK, or GitHub Actions)
- Use tag policies (via AWS Organizations) to enforce tag compliance
- Review untagged resources regularly via Tag Editor
- Be specific with `Project` tag to improve cost filter granularity

---

## Integrations

| Tool | Benefit |
|------|---------|
| AWS Cost Explorer | Group by project/environment for cost analysis |
| IAM | Restrict access via tag-based conditions |
| Budgets | Track project-specific limits |
| GitHub Actions | Inject tags at provision time |
| AWS Backup | Create backup plans by tag filters |

---

## Sample Tags Table

| Resource | Name | Project | Environment |
|----------|------|---------|-------------|
| EC2 Instance | p1-builder-instance | p1 | Production |
| ECS Service | p1-api-service | p1 | Staging |
| RDS DB | prosperna-cebuana-db | Cebuana | Production |
| NAT Gateway | nat-gateway-az1 | Prosperna NAT Gateway-az1 | Production |
| S3 Bucket | clj-prod-mediabucket | Cebuana | Staging |
| Lambda Function | custom-domain-handler | p1 | Production |

---

## ✅ Summary

- All AWS resources should follow tagging standards: `Name`, `Project`, `Environment`
- Tag Editor is the fastest way to bulk manage tags
- Cost Explorer relies on activated tags for reporting
- Tags are essential for automation, cost control, and access control

> 🏷 Tag consistently, manage efficiently.

---

## 📌 Related Docs
- [AWS KMS Usage Guide](https://pkb.prosperna.ph/docs/engineering/devops/aws-kms)
- [Microservice Deployment Guidelines](https://pkb.prosperna.ph/docs/engineering/devops/microservices)
- [Cloudflare DNS & SSL](https://pkb.prosperna.ph/docs/engineering/devops/cloudflare)