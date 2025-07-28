---
id: aws-kms
title: AWS KMS Usage Guide
sidebar_label: AWS KMS Usage Guide
---

# AWS KMS Usage Guide

This guide outlines how to set up and rotate encryption keys using AWS Key Management Service (KMS), including how to apply KMS to services such as S3, RDS, and Lambda.

## Overview

AWS KMS helps you manage cryptographic keys and control their use across a wide range of AWS services.

There are two types of keys:

- **AWS Managed Keys**: Automatically created, managed, and used by AWS services.
- **Customer Managed Keys**: Created and managed by the user for more granular control.

---

## Setup KMS

### 1. Create a Customer Managed Key (CMK)

1. Go to **AWS KMS Console**.
2. Click **Create Key**.
3. Choose **Symmetric**.
4. Add an alias (e.g., `alias/my-app-key`).
5. Set administrative and usage permissions.

### 2. Enable Key Rotation

- Enable rotation to allow AWS to rotate your keys every year.
- Go to the key’s details → Enable key rotation.

---

## Rotate Keys

- For **Customer Managed Keys**, AWS supports automatic yearly rotation.
- For **manual rotation**, you need to:
  1. Create a new key.
  2. Update resources to use the new key.
  3. Decommission the old key after confirming everything works.

---

## Sample KMS Key Policies

### S3 Bucket Encryption Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "s3.amazonaws.com" },
      "Action": "kms:GenerateDataKey",
      "Resource": "*"
    }
  ]
}
```

### RDS Encryption Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "rds.amazonaws.com" },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
```

### Lambda Encryption Policy (for environment variables)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Current AWS Managed Keys

We currently have **13 AWS Managed Keys** in the account:

| Alias                 | Key ID                               | Status  |
| --------------------- | ------------------------------------ | ------- |
| aws/secretsmanager    | 0744f2c6-9aa5-4b32-892d-c8787c29d660 | Enabled |
| aws/workspaces        | 2c08db5d-cae1-4f9d-91ad-1fe77c7c140a | Enabled |
| aws/sns               | 2e6ce094-76df-4e8f-897c-0a809f2f6891 | Enabled |
| aws/lambda            | 3ea2bd65-6f7e-43b5-8c80-f87f04719051 | Enabled |
| aws/fsx               | 439857d4-55a1-4b00-a876-ca53284af074 | Enabled |
| aws/rds               | 4b615de6-eb40-45be-9e0c-9e5ef3ace843 | Enabled |
| aws/acm               | 4fbdb71a-7ff4-428e-baee-f7dcf9df542b | Enabled |
| aws/cloud9            | 66f8cfca-215c-49e0-9c8d-5a12ac97c45c | Enabled |
| aws/elasticfilesystem | 7c73ff0b-12dc-4a1b-9c2e-f29c0fbd2b6b | Enabled |
| aws/ebs               | 825668aa-b7df-4f11-a99f-b6db27e8fbe8 | Enabled |
| aws/s3                | b89c2161-eb64-45ca-81b2-14eef7f11928 | Enabled |
| aws/lightsail         | c05dc2e2-e8a4-45fc-bc50-0dffc6745edb | Enabled |
| aws/backup            | c4b69cc4-6b33-4aa8-9c1f-fa6d271aa61f | Enabled |

### Customer Managed Key

| Alias           | Key ID                               | Status  | Type               | Usage               |
| --------------- | ------------------------------------ | ------- | ------------------ | ------------------- |
| KMSforRDSbackup | 3f124095-e77a-423c-8eca-7aea3b12f7e8 | Enabled | SYMMETRIC\_DEFAULT | Encrypt and decrypt |

---

## Best Practices

- Use **Customer Managed Keys** for more control.
- Enable **automatic key rotation**.
- Manually rotate keys periodically and re-encrypt sensitive data.
- Apply least privilege principle on IAM policies.
- Audit key usage with AWS CloudTrail.
- Disable and retire unused keys.
- Use aliases for better key management.

---

For more secure key practices, refer to the [AWS KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html).