---
id: datadog-metrics
title: Read & Interpret Datadog Metrics
sidebar_label: Read & Interpret Datadog Metrics
---

# Read & Interpret Datadog Metrics

This guide will walk you through how to read and interpret metrics in Datadog for APM, RUM, Infrastructure, and Logs. It also includes steps to create dashboards, set alerts, and best practices for monitoring React/Next.js frontends and TypeScript-based backends.

---

## 📘 Background on Datadog

[Datadog](https://www.datadoghq.com/) is a powerful monitoring and analytics platform for developers, IT operations teams, and business users. It provides end-to-end observability across application performance (APM), real user monitoring (RUM), infrastructure, logs, and security.

### 💡 Benefits for the Organization:
- **Centralized visibility** into frontend, backend, and infrastructure.
- **Quick root-cause analysis** with traces, metrics, and logs in one place.
- **Improved system reliability** through automated alerting and dashboards.
- **Helps teams optimize performance** and proactively monitor issues.

---

## Access Requirements
- Request access from the DevOps team.
- Datadog dashboards, logs, APM, and RUM are already configured for development, staging, and production environments.

---

## Reading Metrics in APM

1. **Navigate to APM > Services**
2. Select your service (e.g., `email-service`, `analytics-api`, etc.)
3. Key metrics to observe:
   - **Latency**: Average response time (in ms). High latency may indicate DB bottlenecks, long loops, or external API delays.
   - **Throughput**: Number of requests per second. Spikes can indicate high user activity or DoS attempts.
   - **Error Rate**: Percentage of failed requests. This should be close to 0%.

### 📐 APM Metric Definitions:
- **Latency**: Time between receiving a request and sending a response.
- **Throughput**: Number of operations processed per second/minute.
- **Error Rate**: Ratio of failed requests to total requests.

### Best Practices for TypeScript Backends
- Implement structured logging (e.g., using Winston).
- Wrap external API calls and DB queries in spans.
- Avoid long synchronous operations; use async/await.
- Monitor custom business metrics (e.g., signups/hour).
- Use meaningful service and operation names for easier trace analysis.

---

## Reading Metrics in RUM

1. **Navigate to RUM > Applications**
2. Select the application (e.g., `merchant-frontend`, `customer-app`)
3. Metrics to monitor:
   - **Page Load Time**: Total time from request to fully rendered DOM.
   - **First Contentful Paint (FCP)**: Time before something shows on screen.
   - **Largest Contentful Paint (LCP)**: Time for the largest content element to load.
   - **Cumulative Layout Shift (CLS)**: Measures layout shifts while the page loads.
   - **User Actions**: Clicks, route changes, custom events.

### RUM Metric Definitions:
- **FCP**: Measures perceived load speed.
- **LCP**: Represents user-perceived loading performance.
- **CLS**: Indicates visual stability.
- **TTFB**: Time to First Byte, related to backend performance.

### Best Practices for React/Next.js Frontends
- Use lazy loading for components and images.
- Minimize third-party scripts and defer non-critical JS.
- Server-side render with caching (especially for Next.js).
- Use `next/script` for script loading and leverage dynamic imports.
- Profile your app using Web Vitals reports in Datadog.

---

## Reading Infrastructure Metrics

1. **Navigate to Infrastructure > Containers or Hosts**
2. Select a container or host to drill down.
3. Metrics to check:
   - **Container CPU Usage**: Percentage of CPU utilized. Sustained >80% may indicate performance problems.
   - **Container Memory Usage**: Memory consumption. Watch for OOM kills.
   - **Disk I/O & Network I/O**: High values may indicate bottlenecks in storage or connectivity.

### Infrastructure Metric Definitions:
- **CPU Usage**: Load on the CPU in real time.
- **Memory Usage**: Total memory consumed.
- **Disk I/O**: Amount of data read/written to disk.
- **Network I/O**: Traffic transmitted and received by the container or host.

### Best Practices
- Right-size ECS tasks based on baseline usage.
- Use autoscaling policies in ECS for optimal load management.
- Define alerts for high CPU/memory/disk thresholds.
- Use tags to categorize hosts by environment, service, or role.

---

## Creating Dashboards

1. Go to **Dashboards** > **New Dashboard**
2. Add widgets for time series, toplists, query values, etc.
3. Use template variables to switch environments (dev/staging/prod)
4. Save and share the dashboard link with your team

---

## Setting Alerts (Monitors)

1. Go to **Monitors > New Monitor**
2. Choose monitor type (e.g., APM latency, error rate, infra metrics)
3. Set conditions:
   - e.g., `avg(last_5m):trace.<service>.errors > 1` for error spikes
   - e.g., `max(last_10m):container.cpu.usage > 80` for CPU alerts
4. Set notification: Email, Slack, Webhooks, etc.

---

## Related Links
- [Datadog APM Overview](https://docs.datadoghq.com/tracing/)
- [RUM Metrics](https://docs.datadoghq.com/real_user_monitoring/)
- [Container Monitoring](https://docs.datadoghq.com/containers/)
- [Create Dashboards](https://docs.datadoghq.com/dashboards/)
- [Set Alerts](https://docs.datadoghq.com/monitors/create/)
- [Web Vitals in RUM](https://docs.datadoghq.com/real_user_monitoring/faq/web-vitals/)
- [Infrastructure Metrics Reference](https://docs.datadoghq.com/infrastructure/process/)

---

Let me know if you'd like visual examples or if we should create sample dashboards next.