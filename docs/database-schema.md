# Database Schema

## Canonical Entities
- `users`: (TBD fields)
- `pickup_requests`: (TBD fields)
- `items`: Individual RL-000421 identity.
- `batches`: CB-00071 identity; parent-child (split) capability.
- `events`: Persistent, append-oriented ledger (TX-001).
- `verifications`: (TBD fields)
- `partners`: (TBD fields)
- `inventory`: (TBD fields)
- `hazards`: (TBD fields)
- `risk_flags`: (TBD fields)
- `rewards`: (TBD fields)
- `epr_records`: (TBD fields)
- `notifications`: (TBD fields)

## Weight Model
- `declared_weight` (Collector/Citizen)
- `verified_weight` (Aggregator)
- `received_weight` (Recycler)

## Key Requirements
- **Auditability**: Events are never casually deleted.
- **Client Idempotency**: `client_transaction_id` required for all synced entities.
- **Relationships**: Foreign keys to enforce lifecycle state and actor assignment.
- **Constraints/Indexes**: TBD.
- **Transactional Integrity**: Critical for weight updates and event creation.

*Note: Conceptual fields and specific database constraints are TBD.*
