# CloudSentinel — Security Boundaries

This document defines the strict security boundaries for the CloudSentinel Minimum Viable Product (MVP). These boundaries are non-negotiable constraints designed to prevent scope creep and maintain a secure local development environment.

* **Network Boundary:** The application runs strictly as a local development server on `localhost` and is completely isolated from external networks, public internet traffic, and live cloud APIs.
* **Data Boundary:** Only programmatically generated, hardcoded synthetic data files are permitted to enter the ingestion pipeline, ensuring zero exposure to real production logs, customer data, or sensitive credentials.
* **Execution Boundary:** The application can only be executed, tested, and modified locally by authorized developers on their own individual machines, with no public access, external hosting, or user login portals exposed.