# CloudSentinel - Project Context

## Overview
CloudSentinel is a multi-cloud security monitoring and incident response platform built with Next.js 16 (App Router), TypeScript, and Tailwind CSS.

## Architecture
- **Event Schema**: `src/lib/types/event.ts` (Unified SecurityEvent and Incident types)
- **Data Normalizers**: `src/lib/integrations/` (AWS GuardDuty, Azure Defender, GCP SCC)
- **Rules Engine**: `src/lib/rules-engine.ts` (Deterministic threat detection)
- **Risk Scorer**: `src/lib/risk-scorer.ts` (0-100 explainable risk scoring)
- **Incident Aggregator**: `src/lib/incident-aggregator.ts` (Cross-cloud correlation by IP/actor)
- **Dashboard**: `app/page.tsx`, `app/components/` (Next.js App Router UI)

## Security Features (Current State)
- **Audit Trail**: `data/audit-log.json` (Immutable log of approved response actions)
- **API Route**: `app/api/audit/route.ts` (Writes to audit log)
- **MCP Server**: `mcp-server/server.ts` (Exposes `get_audit_trail` tool for AI agents)

## Known Issues (MUST FIX)
1. `/api/audit` has NO authentication. Anyone can POST.
2. MCP server has NO authentication. Anyone can connect.
3. Audit log has no file locking. Concurrent writes can corrupt the JSON.
4. Response actions are simulated only (no real cloud execution).

## Tech Stack
- Next.js 16.4.0 (App Router, Turbopack)
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- Vitest (testing)
- ESLint (linting)
- @modelcontextprotocol/sdk (MCP server)

## Commands
- `npm run dev`: Start dev server
- `npm run build`: Production build
- `npm run test`: Run Vitest tests
- `npm run lint`: Run ESLint

## Rules for Cline
1. ALWAYS run `npm run lint` and `npm run build` after making code changes.
2. Fix any TypeScript or ESLint errors immediately.
3. Do NOT break existing functionality.
4. When adding tests, place them in `src/lib/__tests__/` or adjacent `__tests__` folders using Vitest.
5. For file writes, use atomic writes or a library like `proper-lockfile` to prevent corruption.