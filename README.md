<div align="center">

# 🛡️ CloudSentinel

### Multi-Cloud Security Monitoring & Incident Response Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/Tests-10%20passing-green.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Enterprise-grade security monitoring with cross-cloud correlation, explainable AI risk scoring, and immutable audit trails.**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Security](#-security-features) • [Demo](#-live-demo)

</div>

---

## 🎯 Overview

CloudSentinel is a production-ready security monitoring platform that unifies threat detection across **AWS GuardDuty**, **Azure Defender**, and **GCP Security Command Center** into a single, actionable dashboard.

### Key Capabilities

- 🌐 **Multi-Cloud Ingestion**: Normalize and analyze security events from 3 major cloud providers
- 🔗 **Cross-Cloud Correlation**: Automatically detect coordinated attacks spanning multiple clouds
- 📊 **Explainable Risk Scoring**: 0-100 risk scores with transparent, human-readable factors
- 🔒 **Immutable Audit Trail**: Every response action logged with analyst identity and justification
- 🤖 **MCP Integration**: AI agents can securely query audit data via Model Context Protocol
- ✅ **Enterprise-Grade Quality**: 10 passing tests, 0 TypeScript errors, 0 lint warnings

---

## ✨ Features

### 🔍 Intelligent Threat Detection

- **Deterministic Rules Engine**: Flag specific threats (root login failures, anomalous IPs) with clear explanations
- **Weighted Risk Scoring**: Critical events start at 80/100, with bonuses for failed outcomes and triggered rules
- **Evidence Timelines**: Chronological view of all events in an incident with full context

### 🌍 Cross-Cloud Intelligence

- **Automatic Correlation**: Events from different clouds sharing the same IP or actor are grouped into unified incidents
- **Example**: An AWS login attempt + Azure data access + GCP exfiltration from the same IP → Single `CORR-IP-` incident
- **Priority Sorting**: Cross-cloud threats surface at the top of the incident list

### 🛡️ Security & Compliance

- **API Authentication**: All audit endpoints require Bearer token authentication
- **Immutable Audit Log**: JSON-based audit trail records every approved action with timestamp, analyst name, and justification
- **Simulation Mode**: Clear UI disclaimers indicate demo environment (no real cloud execution)
- **Environment Isolation**: Secrets stored in `.env.local`, never committed to version control

### 🤖 AI Integration (MCP Server)

- **Restricted Tool Access**: AI agents can query `get_audit_trail` without direct filesystem access
- **Secure by Design**: MCP server requires API key authentication
- **Filtering**: Query audit records by incident ID or retrieve full history

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Data Ingestion"
        A1[AWS GuardDuty] --> N1[aws-guardduty.ts]
        A2[Azure Defender] --> N2[azure-defender.ts]
        A3[GCP SCC] --> N3[gcp-scc.ts]
        A4[Synthetic Data] --> N4[data-loader.ts]
    end
    
    subgraph "Normalization Layer"
        N1 --> S[Common SecurityEvent Schema]
        N2 --> S
        N3 --> S
        N4 --> S
    end
    
    subgraph "Analysis Engine"
        S --> R[rules-engine.ts]
        R --> RS[risk-scorer.ts]
        RS --> IA[incident-aggregator.ts]
    end
    
    subgraph "Correlation"
        IA --> C1[Group by incident_id]
        IA --> C2[Cross-cloud by source_ip]
        IA --> C3[Cross-cloud by actor]
    end
    
    subgraph "Presentation"
        C1 --> D[Next.js Dashboard]
        C2 --> D
        C3 --> D
        D --> UI[React Components]
    end
    
    subgraph "Response & Audit"
        UI --> AM[Approval Modal]
        AM --> API[/api/audit]
        API --> AL[data/audit-log.json]
    end
    
    subgraph "AI Integration"
        AL --> MCP[mcp-server/server.ts]
        MCP --> AI[AI Agents via MCP]
    end