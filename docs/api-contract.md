# API Contract

## Principles
- REST API.
- JWT Authentication, RBAC Authorization.
- All requests MUST include necessary headers (e.g., Authorization).
- Never trust client-controlled: `role`, `user_id`, `reward amount`, `EPR eligibility`, or `lifecycle state`.
- Idempotency: All local-created transactions must include `client_transaction_id` (UUID). Retries must be handled idempotently by the backend.

## Endpoints

### Authentication
- `POST /auth/login` (TBD)
- `POST /auth/refresh` (TBD)

### Pickup
- `POST /pickups` (Citizen request)
- `GET /pickups/{id}`
- `POST /pickups/{id}/assign` (To Collector)

### Collector
- `GET /collector/pickups`
- `POST /collections` (Create collection record)
- `POST /collections/sync` (Sync offline data)

### Batch / QR
- `POST /batches`
- `GET /batches/{id}`
- `GET /batches/{id}/qr`

### Aggregator
- `POST /batches/{id}/receive`
- `POST /batches/{id}/verify-weight`
- `GET /aggregator/dashboard`
- `GET /aggregator/heatmap`
- `GET /aggregator/inventory`

### Recycler
- `POST /batches/{id}/recycler-receive`
- `POST /batches/{id}/process`

### Compliance
- `GET /compliance/summary`
- `GET /compliance/epr`
- `GET /compliance/attribution`
- `GET /compliance/report` (CPCB-ready)

### Risk / Hazard
- `POST /hazards`
- `GET /risk-flags`
- `POST /risk-flags/{id}/review`

## Conventions
- **Entity IDs**: UUIDs.
- **Errors**: Standard HTTP status codes (TBD).
- **Validation**: Server-side validation for all inputs, file sizes, and state transitions.
