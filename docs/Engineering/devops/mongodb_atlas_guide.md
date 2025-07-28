---
id: mongodb
title: MongoDB Atlas Usage Guide
sidebar_label: MongoDB Atlas Usage Guide
---

# MongoDB Atlas Usage Guide

This guide covers how to interact with our MongoDB Atlas environment, including connecting to clusters, managing backups, and optimizing queries using the Query Profiler.

---

## Clusters Overview

We currently use the following MongoDB Atlas clusters:

- `prospernaone-cluster-prod` → **Production**
- `prospernaone-cluster-dev` → **Development**
- `prospernaone-cluster-staging` → **Staging**

> **Note:** You need the appropriate connection string from the DevOps team to access any cluster.

---

## How to Connect to MongoDB Atlas

### Option 1: Using MongoDB Compass

1. Open **MongoDB Compass**.
2. Get the **connection string** from the DevOps team (format typically looks like: `mongodb+srv://<user>:<password>@prospernaone-cluster-prod.mongodb.net/?retryWrites=true&w=majority`).
3. Paste the connection string into the connection field.
4. Click **Connect**.

### Option 2: Using the MongoDB CLI

1. Install the [MongoDB Shell (mongosh)](https://www.mongodb.com/try/download/shell).
2. Use the connection string to connect:
   ```bash
   mongosh "mongodb+srv://<user>:<password>@prospernaone-cluster-prod.mongodb.net/myFirstDatabase"
   ```
3. You will be connected to your desired database.

---

## Backup Policy

| Snapshot Type | Frequency         | Retention | Time (UTC) |
| ------------- | ----------------- | --------- | ---------- |
| Hourly        | Every 6 hours     | 7 days    | 07:00      |
| Daily         | Daily             | 7 days    | 07:00      |
| Weekly        | Saturday          | 4 weeks   | 07:00      |
| Monthly       | Last day of month | 12 months | 07:00      |

### Point-In-Time Restore (PITR)

- **Restore Window:** 7 days
- Useful for recovering from accidental deletions or data corruption.

---

## Query Optimization Using Query Profiler

MongoDB Atlas provides a **Query Profiler** to monitor slow or inefficient queries.

### How to Use Query Profiler:

1. Navigate to your desired cluster in MongoDB Atlas.
2. Go to **Performance Advisor** > **Query Profiler**.
3. Filter by database or collection, e.g., `analyticsdb.productvisitors`.
4. View recent slow queries and examine their metrics.

### Sample Query Detail

- **Namespace:** `analyticsdb.productvisitors`
- **Timestamp:** Mon 07/21/25 at 00:06:01.815
- **Execution Time:** 298 ms
- **Docs Examined:** 322,948
- **Docs Returned:** 0
- **Keys Examined:** 0
- **Has Sort Stage:** Yes
- **Has Index Coverage:** No
- **Response Length:** 241 bytes

### ⚠️ Why It’s a Problem

- **No index coverage** + **has sort stage** = full collection scan.
- 322,948 documents examined and 0 returned → wasted compute.

### Optimization Steps

1. **Create an Index** on the queried fields (especially the filter and sort fields).
2. Avoid unnecessary sorting on large datasets.
3. Use projections to limit the fields returned.
4. Monitor changes with Query Profiler after optimization.

---

## ✅ Summary

- Connect to any cluster using Compass or CLI with a connection string.
- Backups are taken hourly, daily, weekly, and monthly with PITR support.
- Use the query profiler to find inefficient queries and optimize them.

---

Need access? Contact the DevOps team for credentials or support.