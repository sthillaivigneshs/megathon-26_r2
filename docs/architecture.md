# Architecture

## Product Architecture
ReLoop is a modular monolith platform designed for India's informal e-waste collection ecosystem. It connects informal collectors to formal aggregators, recyclers/refurbishers, and brand/PRO compliance workflows.

## Core Principles
- **Backend-Authoritative**: The backend is the authoritative business-data layer. All critical business logic, state transitions, and authorization must occur here.
- **Collector-First, Offline-First**: The Collector App MUST work without internet, utilizing local SQLite storage and a pending queue.
- **Modular Monolith**: A unified codebase with clear domain boundaries, avoiding microservices.
- **AI-Optional**: Deterministic rules must work without AI. AI is optional, primarily for Smart Route intelligence.

## System Architecture Flow
Citizen (via WhatsApp/Web) → Pickup Request → Collector → Collection → Collection Batch → Aggregator Verification → Sorting → Recycler/Refurbisher → Processing → EPR Eligibility → EPR Credit → Brand/PRO Dashboard.

## Component Architecture
- **Backend (Member 1)**: FastAPI, PostgreSQL, SQLAlchemy, Alembic. Owns business rules, data layer, API contracts.
- **Collector App (Member 2)**: Flutter, Dart, SQLite. Owns offline UX, pending queue management, GPS, photo capture.
- **Web App (Member 3)**: Next.js, React, TypeScript. Owns dashboards for Aggregator, Recycler, Brand/PRO, Admin.

## Cross-Cutting Concerns
- **Authentication**: JWT, RBAC.
- **QR**: Item/Batch identification (standard QR generation/scanning).
- **Location**: GPS/device services.
- **Maps**: Leaflet, OpenStreetMap.
- **Notifications**: Firebase Cloud Messaging.
- **Storage**: Supabase Storage or S3-compatible object storage (file validation/size limits enforced on server).
- **Deployment**: Vercel, Render/Railway, Supabase.

## Collaboration & Integration
- **Ownership**: Strictly divided as per Member 1, 2, and 3.
- **Contracts**: API request/response structures, entity IDs, lifecycle states, event types, roles, permissions are SHARED contracts.
- **Changes**: Breaking changes require checking implementation, identifying affected modules, explaining, updating all consumers, updating tests, and updating documentation.
