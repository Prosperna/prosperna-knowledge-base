---
title: P1 Mission Alignment Document
id: p1-mission-alignment
slug: /prosperna/p1-mission-alignment
sidebar_label: P1 Mission Alignment
sidebar_position: 1
description: Mission-aligned, BVSSH-focused objectives and evidence rules to align Prosperna squads on delivering Better Value, Sooner, Safer, Happier.
tags: [prosperna, bvssh, objectives, mechanics, rewards]
---

> **Purpose:** Align all squads around **BVSSH — Better Value, Sooner, Safer, Happier**. We measure transparently and reward as a **team** so collaboration—not heroics—wins.

## Executive Summary

**Quarter Top-10 Objectives**
1. **Lead Time** — Reduce median first-commit→prod by **30%** from baseline.  
2. **Deployment Frequency** — Sustain **≥2 prod deploys/week/service** with progressive delivery.  
3. **PR Cycle Time** — Cut median open→merge by **40%**; **≤24h** review SLA.  
4. **Change Failure Rate** — Keep CFR **≤10%** monthly.  
5. **MTTR & SLOs** — Reduce median MTTR **35%**; **≥95%** services within error budgets.  
6. **Vulnerability SLAs** — **100% Critical ≤7d**, **≥90% High ≤14d** closed.  
7. **Secure Pipeline Pass Rate** — **≥95%** (SAST/DAST/Deps/License).  
8. **Outcome-Linked Releases** — **≥75%** releases have hypothesis+metric+review; **≥60%** hit target.  
9. **Flow Efficiency** — Improve by **+15pp** (active ÷ total time).  
10. **Cadence** — Weekly Value Demo, Ops/SLO Review, Flow Huddle with **≥90%** attendance & notes.

:::tip Reward linkage
Monthly **Win Score** (Speed, Stability, Security, Value + Balance Bonus). Tiers: **Bronze ≥70**, **Silver ≥85**, **Gold ≥95** — rewards are **team-only**.
:::

## Measurement Sources
- **VCS/CI/CD:** Bitbucket/GitHub + pipelines  
- **Observability:** Datadog (APM, logs, SLO/error budgets)  
- **Incidents:** ClickUp (or Statuspage)  
- **Security:** Snyk/Dependabot/Checkmarx  
- **Product Analytics:** GA4/Amplitude/Mixpanel + NPS/CSAT

## Detailed Objectives (SMART + Evidence)
> Replace **TBD** with Week-1 baselines. All targets are **team-level** and tracked monthly. Owners: Squad Leads with DevOps, SRE, PMO, and Security.

### 1) Speed & Flow
**Lead Time:** −30% by end of quarter. *Evidence:* CI/CD timestamps; tile `LeadTime_median`.  
**Deploy Frequency:** ≥2/week/service. *Evidence:* deploy events; tile `Deploys_per_week`.  
**PR Cycle:** −40%; **≤24h** review SLA for 90% PRs. *Evidence:* VCS; tiles `PR_Median_Cycle`, `PR_SLA_24h`.  
**Flow Efficiency:** +15pp. *Evidence:* ClickUp/Jira; tile `Flow_Efficiency_pp`.

### 2) Stability & Quality
**CFR:** ≤10%. *Evidence:* deploy→incident link; tile `CFR_pct`.  
**MTTR:** −35% & ≥95% services in budget. *Evidence:* Datadog; tiles `MTTR_median`, `ErrorBudget`.  
**Escaped Defects & Availability:** downtrend; SLOs met.

### 3) Security & Safety
**Vuln SLAs:** 100% Critical ≤7d; ≥90% High ≤14d; 0 Critical overdue. *Evidence:* Snyk/Checkmarx; `Vuln_SLA`.  
**Secure Pipeline:** ≥95% pass. *Evidence:* CI; `Security_PassRate`.  
**PIR Safety:** 100% PIR ≤48h; 1–3 actions closed/mo. *Evidence:* PIR docs; `PIR_onTime`, `PIR_Actions_Closed`.

### 4) Customer Value
**Outcome Coverage:** ≥75% releases with hypothesis+metric+review; **Hit Rate ≥60%**. *Evidence:* analytics; `Outcome_Coverage`, `Outcome_HitRate`.  
**Idea→Signal:** median ≤14 days. *Evidence:* backlog + events; `Idea_to_Signal_days`.

### 5) Collaboration & Cadence
**Ritual Adherence:** ≥90% weekly attendance; notes ≤24h. *Evidence:* calendar/notes; `Ritual_Adherence`.  
**Working Agreements:** 100% squads maintain DoR/DoD & PR SLA monthly; `Agreements_Compliance`.

### 6) Governance & Transparency
**Scoreboard Integrity:** definitions locked monthly; sources/queries published; 2 deep dives/month; `Integrity_Checks`.  
**Appeals:** 5-biz-day window; responses within 5 more days.

### 7) Rewards & Recognition
| Tier | Win Score | Example Reward* |
| --- | ---: | --- |
| Bronze | ≥70 | Team lunch or ₱5–10k team fund |
| Silver | ≥85 | ₱3–5k learning stipend/member + conference pass lottery |
| Gold | ≥95 | ₱20–40k team offsite + **automation bounty** |
*Confirm amounts with Finance/People Ops.

## Baseline & Target Worksheet (Week 1)
| Metric | Baseline (TBD) | Target | Source | Tile ID |
|---|---:|---:|---|---|
| Lead Time (median, hrs) |  | −30% | CI/CD | `LeadTime_median` |
| Deploys/week/service |  | ≥2 | CI/CD | `Deploys_per_week` |
| PR Cycle (median, hrs) |  | −40% | VCS | `PR_Median_Cycle` |
| Flow Efficiency (pp) |  | +15 | ClickUp/Jira | `Flow_Efficiency_pp` |
| CFR (%) |  | ≤10% | CI + Incidents | `CFR_pct` |
| MTTR (median, hrs) |  | −35% | Datadog | `MTTR_median` |
| Error Budget compliance |  | ≥95% | Datadog | `ErrorBudget` |
| Vuln SLA (Crit≤7d/High≤14d) |  | 100%/≥90% | Snyk/Checkmarx | `Vuln_SLA` |
| Security Pass Rate (%) |  | ≥95% | CI | `Security_PassRate` |
| Outcome Coverage (%) |  | ≥75% | Analytics | `Outcome_Coverage` |
| Outcome Hit Rate (%) |  | ≥60% | Analytics | `Outcome_HitRate` |
| Ritual Adherence (%) |  | ≥90% | Attendance/Notes | `Ritual_Adherence` |


