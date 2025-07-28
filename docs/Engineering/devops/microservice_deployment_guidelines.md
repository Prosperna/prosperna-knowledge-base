---
id: microservices
title: Microservice Deployment Guidelines
sidebar_label: Microservice Deployment Guidelines
---

## Overview

This document outlines Prosperna's conventions for deploying microservices, including naming conventions, communication patterns, config guidelines, and how to manually upload images to Amazon ECR.

---

## Naming Conventions

| Component         | Format                                | Example                         |
|------------------|---------------------------------------|---------------------------------|
| Service Name      | `feature-env-srv`                     | `orders-dev-srv`                |
| Task Definition   | `project-micro-feature-env-td`        | `p1-micro-orders-dev-td:693`    |
| Load Balancer     | `project-micro-private-alb`           | `p1-micro-private-alb`          |
| Target Group      | `Project-Feature-Env-group`           | `P1-orders-dev-group`           |
| Container Name    | `feature-api`                         | `orders-api:3000`               |

---

## Microservice Patterns

- **Stateless Design**: All services must be stateless to support container scalability.
- **API Gateway**: Entry point for client-facing APIs (API Aggregator).
- **Database Per Service**: Each microservice should have its own database schema.
- **Retry Mechanisms**: Use retry policies for service-to-service communication failures.
- **Timeouts**: HTTP requests should have timeouts to avoid hanging.

---

## Communication Patterns

- **Internal Services** use service discovery via ECS DNS.
- All backend services communicate over **HTTPS** via the Application Load Balancer.
- Microservices expose **REST APIs** on their configured port (e.g., `3000`).
- Secrets and internal URLs are accessed using **environment variables** configured in the ECS task definition.

---

## Configuration Conventions

- Use `.env.production`, `.env.staging`, etc., for each environment.
- All container ports are explicitly declared in the task definition.
- Load balancer listens on port **443** for secure communication.
- Use AWS Secrets Manager for sensitive credentials.
- Logging enabled via `awslogs` in the task definition.
- Health check path configured in the target group, e.g., `/api/health`.

---

## Sample Backend Deployment: `orders-dev-srv`

| Component        | Value                             |
|------------------|-----------------------------------|
| **Service Name** | `orders-dev-srv`                  |
| **Task Def**     | `p1-micro-orders-dev-td:693`      |
| **ALB**          | `p1-micro-private-alb` (Application Load Balancer) |
| **Container**    | `orders-api:3000`                 |
| **Listeners**    | HTTPS:443                         |
| **Target Group** | `P1-orders-dev-group`             |

---

## Environment Variables (Required)

| Variable      | Description                         |
|---------------|-------------------------------------|
| `NODE_ENV`    | `dev`, `uat`, or `production`       |
| `DD_ENV`      | Datadog environment tag             |
| `DD_SERVICE`  | Datadog service identifier          |
| `DATABASE_URL`| MongoDB/PostgreSQL connection string|

---

## Secrets & Rotation

- Store secrets in **AWS Secrets Manager**

---

## Deployment Checklist

| Task | Description | Done |
|------|-------------|------|
| ✅ | App passes tests in `dev` branch | ⬜ |
| ✅ | Docker image built and pushed to ECR | ⬜ |
| ✅ | Task definition updated | ⬜ |
| ✅ | ECS service updated | ⬜ |
| ✅ | Logs verified in CloudWatch | ⬜ |
| ✅ | APM enabled with Datadog | ⬜ |
| ✅ | Version tagged and documented | ⬜ |

---

## Manually Uploading Docker Image to ECR

Use `orders-service-api` as an example (using `dev` branch).

### 1. Clone the Repository
```bash
git clone git@github.com:Prosperna/orders-service-api.git
cd orders-service-api
```

### 2. Download the .env File from AWS Secrets Manager
Replace `${{ secrets.SECRET_ENV }}` with the actual secret name (e.g., `mysecret`):
```bash
aws secretsmanager get-secret-value --secret-id mysecret --query SecretString --output text > .env.development
```

### 3. Go to Amazon ECR Console
- Search for `orders-api`
- Click **View Push Commands**

### 4. Execute Push Commands

#### For **macOS/Linux**
```bash
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 358132463944.dkr.ecr.ap-southeast-1.amazonaws.com

docker build -t orders-api .

docker tag orders-api:latest 358132463944.dkr.ecr.ap-southeast-1.amazonaws.com/orders-api:latest

docker push 358132463944.dkr.ecr.ap-southeast-1.amazonaws.com/orders-api:latest
```

#### For **Windows PowerShell**
```powershell
(Get-ECRLoginCommand).Password | docker login --username AWS --password-stdin 358132463944.dkr.ecr.ap-southeast-1.amazonaws.com

docker build -t orders-api .

docker tag orders-api:latest 358132463944.dkr.ecr.ap-southeast-1.amazonaws.com/orders-api:latest

docker push 358132463944.dkr.ecr.ap-southeast-1.amazonaws.com/orders-api:latest
```

> Make sure your IAM user has permissions to access Secrets Manager and ECR. Attach relevant AWS managed policies.

### 5. Final Step
Use the resulting image URI (e.g. `358132463944.dkr.ecr.ap-southeast-1.amazonaws.com/orders-api:dev-lts`) in your ECS task definition.

---

## 🔗 Related Docs

- [📘 ECS Cluster & Service Deployment](https://pkb.prosperna.ph/docs/Engineering/devops/ecs-cluster)