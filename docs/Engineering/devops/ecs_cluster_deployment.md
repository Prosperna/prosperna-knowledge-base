---
id: ecs-cluster
title: ECS Cluster & Service Deployment
sidebar_label: ECS Cluster & Service Deployment Guide
---

# ECS Cluster & Service Deployment Guide (Prosperna)

This guide outlines the setup, configuration, deployment, and logging of ECS Clusters and Services (both EC2 and Fargate) for Prosperna’s e-commerce platform.

---

## Overview

We use two types of ECS:
- **Fargate** for Frontend (React and NextJS)
- **EC2** for Backend Microservices (16 services per instance)

### ECS Clusters in Use

| Cluster | Type | Purpose |
|--------|------|---------|
| P1-Builder-Staging | Fargate | Frontend - GrapesJS - Merchant's Page Builder |
| P1-Dev | Fargate | Frontend - React - Merchant Side |
| P1-Production | Fargate | Frontend - React - Merchant Side |
| P1-Builder-Dev | Fargate | Frontend - GrapesJS - Merchant's Page Builder |
| P1-Customer-Staging | Fargate | Frontend - NextJS - Merchant’s Public Page |
| P1-Staging | Fargate | Frontend - React - Merchant Side |
| P1-Customer-Dev | Fargate | Frontend - NextJS - Merchant’s Public Page |
| P1-Customer-Production | Fargate | Frontend - NextJS - Merchant’s Public Page |
| CJL-Merger-Prod | EC2 | Mixed (2 Frontend, 1 Backend) |
| P1-Micro-Staging-Cluster | EC2 | Backend - 19 Services |
| P1-Micro-Prod-Cluster | EC2 | Backend - 19 Services |
| P1-Builder-Prod | EC2 | Frontend - GrapesJS |
| P1-Micro-Dev-Cluster | EC2 | Backend - 19 Services |

---

## Provisioning a New ECS Cluster

### Fargate (Frontend)

1. **Monitoring**: Off (CloudWatch metrics only)
2. **Capacity Providers**:
   - FARGATE
   - FARGATE_SPOT
3. **Tags**:
   - Name: `P1-Dev`
   - Project: `p1`
   - Environment: `Development`

### EC2 (Backend)

1. **Monitoring**: Off
2. **Capacity Provider**:
   - Name: `ASG-provider-p1-micro-dev`
   - Autoscaling Group: `EC2ContainerService-P1-Micro-Dev-Cluster-EcsInstanceAsg-XXXX`
3. **Instances**:
   - EC2 Type: `r5a.large`
   - VPC: `vpc-0719d230b57b01df7`
   - Subnet: `subnet-045b9960d3066a53c`
   - IAM Role: `ecsInstanceRole`
   - Security Group: `sg-0c3c670d4e8af0885`
   - Storage: 30 GB (`/dev/xvda`)
   - Platform: Linux/UNIX
4. **Tags**:
   - Name: `P1-Micro-Dev-Cluster`
   - Project: `p1`
   - Environment: `Development`

---

## Creating a New ECS Service

### Fargate Frontend Sample: `P1-Dev-Service`

- **Task Definition**: `prodev-task:2101`
- **Container Name:Port**: `nginx-fend:8080`
- **Load Balancer**: `prosperna1-dev-alb`
- **Listeners**: HTTPS:443
- **Target Group**: `P1-Dev-Group`
- **VPC**: `vpc-0719d230b57b01df7`
- **Subnets**:
  - `subnet-0dba2439c0d1629ae`
  - `subnet-045b9960d3066a53c`
- **Security Group**: `sg-014590d6705bd5c7a`
- **Service Role**: `AWSServiceRoleForECS`
- **Health Check Grace Period**: `0s`
- **DNS**: `prosperna1-dev-alb-65212325.ap-southeast-1.elb.amazonaws.com`
- **Platform**: Linux
- **Auto-assign Public IP**: Off

### EC2 Backend Sample: `orders-dev-srv`

- **Task Definition**: `p1-micro-orders-dev-td:693`
- **Container Name:Port**: `orders-api:3000`
- **Load Balancer**: `p1-micro-private-alb`
- **Listeners**: HTTPS:443
- **Target Group**: `P1-orders-dev-group`
- **Service Role**: `ecsServiceRole`
- **DNS**: `p1-micro-private-alb-1448260017.ap-southeast-1.elb.amazonaws.com`

---

## Docker Images & Tags

### Frontend
- Repository: `358132463944.dkr.ecr.ap-southeast-1.amazonaws.com/prodev-image`
- Tags: `latest`, `build-21ef2ca20be9648340105a36f23fcb2cbffbc770`

### Backend
- Repository: `358132463944.dkr.ecr.ap-southeast-1.amazonaws.com/orders-api`
- Tags: `dev-lts`, `dev-d0f9150930edf4b8b62cd17f9672e1584f5e6186`

---

## CloudWatch Logs

### awslogs Driver Configuration
- **Frontend Log Group**: `/ecs/prodev-task`
- **Backend Log Group**: `/ecs/p1-micro-orders-dev-td`
- **Region**: `ap-southeast-1`
- **Stream Prefix**: `ecs`

---

## CI/CD Workflow

- Triggered on merge to: `dev`, `staging`, or `main`
- **Steps**:
  1. Build Docker Image
  2. Tag and Push to ECR
  3. Update Task Definition
  4. Deploy New Service or Revision to ECS Cluster

---

## AWS Terms Glossary

- **ECS (Elastic Container Service)**: A container orchestration service
- **Fargate**: Serverless compute engine for containers
- **EC2**: AWS virtual servers
- **Task Definition**: Blueprint for running containers in ECS
- **Service**: ECS construct that maintains desired number of running tasks
- **Cluster**: Logical grouping of ECS services
- **ECR**: Elastic Container Registry for storing Docker images
- **CloudWatch Logs**: AWS logging service
- **Load Balancer**: Distributes incoming traffic
- **IAM Role**: Permissions identity for AWS services