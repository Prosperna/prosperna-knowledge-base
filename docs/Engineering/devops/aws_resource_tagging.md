---
id: aws-resource-tagging
title: AWS Resource Tagging Standards
sidebar_label: 🏷 AWS Resource Tagging
---

# AWS Resource Tagging Standards

This guide defines how we tag AWS resources to track project usage, environment grouping, and cost attribution at Prosperna.

---

## 🎯 Purpose of Tagging

Tagging AWS resources ensures:

- 🔍 **Visibility**: Understand what resources belong to which project or team
- 💰 **Cost Allocation**: Break down AWS billing by project and environment
- 🛠 **Manageability**: Quickly filter and manage resources using the Tag Editor
- ✅ **Automation & Compliance**: Tags can be used in IAM policies, backup scripts, CI/CD tools, and auditing tools

---

## 🏷 Required Tag Keys and Format

All tagged resources must follow this standard:

| Tag Key     | Example Value                       | Description                                   |
|-------------|--------------------------------------|-----------------------------------------------|
| `Name`      | `prosperna1-prod-alb`                   | A clear name of the resource                  |
| `Project`   | `p1`, `Cebuana`, `Datadog`, `Prosperna Wordpress` | The project or service name that owns the resource |
| `Environment` | `Development`, `Staging`, `Production` | The environment the resource belongs to |

### ✅ Examples

| Resource Type | Tags |
|---------------|------|
| EC2 Instance | Name: `ECS Instance - EC2ContainerService-P1-Micro-Prod-Cluster`  <br> Project: `p1` <br> Environment: `Production` |
| NAT Gateway | Name: `Prosperna NAT Gateway-az1` <br> Project: `Prosperna NAT Gateway-az1` <br> Environment: `Production` |
| S3 Bucket | Name: `clj-prod-mediabucket` <br> Project: `Cebuana` <br> Environment: `Staging` |
| Lambda Function | Name: `custom-domain-handler` <br> Project: `p1` <br> Environment: `Production` |
| RDS Instance | Name: `prosperna-rds` <br> Project: `Prosperna` <br> Environment: `Staging` |

> 🧠 Tip: Be specific with `Project` to easily filter costs in AWS Cost Explorer.

---

## 🛠 Using the AWS Tag Editor

AWS provides a tool to view and manage tags across all supported resources:

👉 [Open AWS Tag Editor](https://ap-southeast-1.console.aws.amazon.com/resource-groups/tag-editor/find-resources?region=ap-southeast-1)

### Step-by-Step:

1. Go to the [Tag Editor](https://ap-southeast-1.console.aws.amazon.com/resource-groups/tag-editor/find-resources?region=ap-southeast-1)
2. Choose your region (e.g., `Asia Pacific (Singapore)`)
3. Filter by resource types (EC2, S3, ALB, etc.)
4. Click **Search Resources**
5. Select the resources you want to tag
6. Click **Manage tags of selected resources**
7. Add tags:
   - `Project: Prosperna`
   - `Environment: Staging`
   - `Name: prosperna-wordpress-sg`
8. Save your changes

> 📝 Note: Tags apply across cost reports, automation scripts, and permissions boundaries.

---

## 🔁 Tagging Integration With Other Services

- **AWS Cost Explorer**: Group costs by tags to see what each project/environment consumes
- **Budgets & Alerts**: Set usage or cost thresholds by tag filters
- **IAM Policies**: Apply conditional access based on tag values
- **CI/CD Pipelines**: Auto-apply tags using Terraform or AWS SDK
- **Backup Policies**: Tag-based backup plans using AWS Backup

---

## 💡 Best Practices

- Use **Title Case** values for readability (e.g., `Production`, not `production`)
- Always apply tags when provisioning new resources (via console, Terraform, or CloudFormation)
- Review untagged resources monthly using the Tag Editor
- Avoid abbreviations that aren’t widely known (e.g., use `Prosperna Wordpress` instead of `PW`)
- Tag shared resources (e.g., VPC, NAT Gateways) with the correct owning project

---

## 📊 Why This Matters

By consistently tagging resources:

- 💸 We can group AWS costs by project (via Cost Explorer or CUR reports)
- 🧩 Teams know what they own and manage
- 🔐 Security and compliance audits become easier
- 🧹 Helps identify unused/untagged resources during cleanup

---

## 📌 Related Docs
- [Create Secure IAM Guide](https://pkb.prosperna.ph/docs/engineering/devops/aws-iam)
- [Cloudflare DNS & SSL](https://pkb.prosperna.ph/docs/engineering/devops/cloudflare)
- [AWS KMS Usage Guide](https://pkb.prosperna.ph/docs/engineering/devops/aws-kms)

