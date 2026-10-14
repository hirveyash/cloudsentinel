# 🎬 CloudSentinel Portfolio Demo Script

Use this step-by-step guide to record a 3-5 minute demo video or present the project live.

## 🛠️ Pre-Demo Setup (Do this before recording)
1. Open terminal and run: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open `data/audit-log.json` in VS Code and keep it visible on a second monitor (or side-by-side).
4. Open Browser DevTools (F12) → Network tab (to prove no secrets are leaked).

---

## 🎬 Demo Walkthrough

### 1. The Dashboard Overview (30 seconds)
- **Action:** Land on the main dashboard.
- **Say:** "This is CloudSentinel, a multi-cloud security monitoring platform. Here we see summary metrics, including total events, severity breakdown, and provider distribution across AWS, Azure, and GCP."

### 2. Cross-Cloud Correlation in Action (1 minute)
- **Action:** Click the **Incidents** tab. Point out the incident at the top starting with `CORR-IP-` or `CORR-ACTOR-`.
- **Action:** Click to open the incident drawer.
- **Say:** "One of the most powerful features is automatic cross-cloud correlation. Notice this incident ID starts with 'CORR-IP'. The system detected that an AWS login failure, an Azure suspicious activity, and a GCP exfiltration attempt all originated from the exact same IP address within a short time window, and automatically merged them into a single, high-priority incident."

### 3. Explainable Risk Scoring (45 seconds)
- **Action:** Scroll down in the drawer to the Evidence Timeline. Point to the Risk Score badge.
- **Say:** "Every event is scored from 0 to 100. This isn't a black box. The risk scorer transparently lists the contributing factors: for example, 'Critical severity adds 80 points', 'Failed outcome adds 10 points', and 'Triggered detection rules add 10 points', capped at 100."

### 4. Human-Approved Response Workflow (1 minute)
- **Action:** Scroll to the **Response Actions** section. Point out the yellow "Simulation Mode" disclaimer.
- **Action:** Click **Quarantine Resource**.
- **Action:** Fill in Analyst Name: "Demo User" and Justification: "Confirmed malicious IP, isolating asset." Click **Authorize & Execute**.
- **Say:** "To prevent accidental automated damage, response actions require human approval. The analyst must provide their name and a justification. This action is simulated for the demo, but in production, it would trigger a cloud API."

### 5. Immutable Audit Trail & Security (45 seconds)
- **Action:** Show the new auto-generated note in the "Investigation Notes" section.
- **Action:** Switch to VS Code and show `data/audit-log.json`. Point to the newly appended JSON record.
- **Say:** "The approval is instantly written to an immutable, local audit trail. Notice it includes the timestamp, incident ID, action, analyst name, and justification. Furthermore, the API key used to secure this endpoint is strictly server-side. If we check the browser's Network tab, no secrets are ever transmitted to the client."

### 6. AI Integration via MCP (Optional, 30 seconds)
- **Action:** Open a new terminal and run: `npx tsx --env-file=.env.local mcp-server/server.ts`
- **Say:** "Finally, for AI integration, CloudSentinel exposes a restricted Model Context Protocol (MCP) server. AI agents can securely query this audit trail using the `get_audit_trail` tool without ever needing direct database or filesystem access."

---

## ✅ Demo Complete!
You have successfully demonstrated: Multi-cloud ingestion, cross-cloud correlation, explainable AI scoring, secure human-in-the-loop workflows, and immutable audit logging.