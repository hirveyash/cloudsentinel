# CloudSentinel — Architecture

## High-Level Architecture

The CloudSentinel architecture is structured into three clean layers for the MVP. The presentation layer features a web-based UI containing the incident list, summary metrics panel, and detail drawer for intuitive analyst interaction. The core engine handles the heavy lifting by normalizing raw inputs, executing deterministic detection rules, and computing risk scores. Finally, the data layer relies on local JSON files stored in a designated folder, which are read and parsed into memory by a local ingestion function during startup.

## Folder Structure

The presentation layer code will live in `src/app/` for main pages and `src/components/` for reusable UI elements like the incident table and detail drawer. The core engine logic will be organized in `src/lib/`, containing dedicated modules for normalizing raw events, running deterministic detection rules, and calculating risk scores. Finally, the data layer will utilize a `src/data/synthetic/` folder to store the local JSON files that feed our pipeline.

## Data Flow

The data flow begins when a raw synthetic JSON file residing in `src/data/synthetic/` is read and parsed into memory by a local loader function. Next, this raw event is passed through a normalizer module that maps its specific fields into CloudSentinel's standardized common schema. Once normalized, the event is evaluated against a set of deterministic detection rules to identify threat patterns, which feeds into a scoring function that calculates a final risk score. Finally, the fully processed incidents are loaded by Next.js server components and passed directly as props to the presentation layer, making them instantly visible on the analyst's dashboard.

## State Management & Interactivity

For the MVP, CloudSentinel will load the synthetic dataset on the server via a Server Component and pass it down as props to a child Client Component. This Client Component will manage all searching, filtering, and sorting interactions instantly within the browser for a smooth user experience. Because the mock data is pre-loaded upfront, this approach completely eliminates the need for complex backend API routes or database queries.

## The Common Security-Event Schema

The CloudSentinel common schema standardizes every security event into a unified format containing essential fields such as timestamp, cloud provider, raw severity, normalized threat category, affected resources, and raw evidence. By translating provider-specific alerts into a single schema, security analysts can review threats across multi-cloud environments without needing to learn disparate formats for AWS, Azure, and Google Cloud. This standardized structure enables key MVP features like cross-cloud filtering, consistent risk scoring, and clear rule explainability on the central dashboard.