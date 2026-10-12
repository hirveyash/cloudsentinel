# CloudSentinel — Architecture Decision Records (ADRs)

This document records the key technical decisions made during the CloudSentinel MVP development. Each decision includes the context (why we needed to choose), the decision itself (what we chose), and the consequences (the trade-offs and implications).

---

## Decision 1: Using Synthetic Data Instead of Live Cloud APIs for the MVP

**Decision:** We will use locally stored, programmatically generated synthetic AWS GuardDuty JSON files instead of connecting to live AWS, Azure, or Google Cloud APIs.

**Context:** Integrating live multi-cloud APIs requires setting up cloud accounts, managing credentials, configuring complex IAM permissions, and handling network/rate-limiting errors. We needed to rapidly validate our core normalization schema, risk scoring logic, and UI layout without being blocked by external cloud infrastructure setup or security overhead.

**Consequence:** This decision allows us to build and test the entire data pipeline locally with zero cloud vendor costs and zero risk of live credential leaks. The tradeoff is that we must maintain synthetic mock generators, and we will still need to build real ingestion connectors in a future release.

---

## Decision 2: Client-Side Filtering and Sorting in the Browser

**Decision:** We will fetch the entire synthetic dataset on the server in a Next.js Server Component and pass it down as props to a Client Component, which will handle all filtering, searching, and sorting directly in the browser.

**Context:** Building backend API routes or database queries to handle search filters, category dropdowns, and column sorting adds unnecessary complexity to an MVP with a small, fixed dataset. We needed an approach that provides an instant, responsive UI experience while keeping the architecture simple.

**Consequence:** Filtering and sorting happen instantly without page reloads or additional network round-trips, significantly simplifying our codebase. The main downside is that this approach will not scale to millions of real-time events in production, requiring a transition to server-side querying or direct database indexing later.