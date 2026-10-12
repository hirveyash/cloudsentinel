# CloudSentinel — Product Scope

## Core Problem

CloudSentinel unifies security monitoring across AWS, Azure, and Google Cloud, giving analysts a single interface to investigate and filter threats across fragmented environments.

## Intended Users

The primary user of the CloudSentinel MVP is a Tier 1 or Tier 2 Security Operations Center (SOC) Analyst responsible for monitoring and triaging cloud threats. When logging into the dashboard, their main goal is to quickly investigate grouped security incidents, understand risk scores, and filter out noise across multi-cloud environments. They possess moderate to advanced technical expertise in cloud security and threat analysis, enabling them to navigate normalized alert schemas while relying on summarized evidence to prioritize critical threats.

## Minimum Viable Product (MVP)

The CloudSentinel MVP will start by ingesting synthetic AWS GuardDuty findings to prove end-to-end normalization and event processing. The core dashboard UI will focus exclusively on a filterable incident list with risk scores, a summary metrics panel, and an incident detail view showing normalized evidence and rule explanations. To maintain a tight scope, this initial build explicitly excludes automated response actions, user authentication, and live multi-cloud API connections.

## Out of Scope for MVP

- Automated response actions (e.g., auto-remediating alerts, isolating instances, or revoking IAM keys)
- User authentication and access management (e.g., login screens, multi-factor authentication, or role-based access control)
- Live cloud API connections (e.g., direct API integration with AWS, Azure, or GCP live environments)

## Demonstrating Success (Definition of Done)

- **Prove Data Ingestion & Normalization:** Run a local initialization script that loads raw synthetic AWS GuardDuty JSON files, verifying via console logs that they successfully parse and map into CloudSentinel's common schema.
- **Prove Dashboard UI & Interactivity:** Launch the local web server, open the app in a browser, and confirm that the incident queue displays the loaded events with working filters, search bars, and a functional slide-out detail drawer.
- **Prove Risk Scoring & Explainability:** Click on a high-severity incident to verify that it displays the correct calculated risk score (e.g., 85+) and explicitly shows the underlying detection rule logic that triggered the alert.
- **Prove End-to-End Workflow:** Complete a simulated triage cycle by reviewing summary metric cards, sorting through the incident queue, inspecting evidence in the detail drawer, and closing the app with full visibility into the synthetic threat pipeline.