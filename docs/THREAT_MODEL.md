# CloudSentinel — Threat Model

This document outlines the primary security threats and mitigations for the CloudSentinel Minimum Viable Product (MVP). The current scope is strictly limited to local development using synthetic data, with no live cloud API connections or user authentication.

## 1. Cross-Site Scripting (XSS) via Unsanitized Raw Evidence

**The Vulnerability:** Because the MVP parses and displays event descriptions and raw evidence payloads directly from local JSON files, an attacker (or a compromised data source) could manipulate a mock record to contain a malicious script payload (e.g., `<script>alert('hacked')</script>`). 

**The Impact:** If the dashboard UI renders this data directly using unsafe methods, the script will execute in the browser of any SOC analyst viewing the incident, potentially hijacking their session or exposing internal data.

**Mitigation:** Developers must rely exclusively on standard React JSX text interpolation to render dynamic data, which automatically escapes tags into harmless visible text. We will strictly prohibit the use of `dangerouslySetInnerHTML` or any direct DOM injection when displaying event evidence.

## 2. Accidental Sensitive Data Exposure in Git

**The Vulnerability:** Since synthetic JSON files must be committed to Git for the MVP to function locally, developers prototyping the application might accidentally copy-paste real internal IP addresses, account IDs, or secrets from a live cloud environment into the mock dataset.

**The Impact:** If these synthetic data files are committed to a public or loosely controlled Git repository, hardcoded secrets or infrastructure topologies are leaked, creating an immediate reconnaissance vector for external attackers.

**Mitigation:** Synthetic JSON data must be generated programmatically using a custom script with hardcoded fake values, strictly forbidding any manual copy-pasting from real production logs or live consoles.