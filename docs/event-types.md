# Event Ledger

The Event Ledger provides an auditable history of all lifecycle transitions. Events MUST NOT be casually deleted or overwritten.

## Event Structure
- `event_id` (UUID)
- `item_or_batch_id` (UUID)
- `event_type` (Enum)
- `actor_id` (UUID)
- `actor_role` (Enum)
- `latitude` (Float)
- `longitude` (Float)
- `timestamp` (DateTime)
- `metadata` (JSON)
- `client_transaction_id` (UUID - for offline-originated events)
- `created_at` (DateTime)

## Event Types
- `COLLECTION_CREATED`
- `AGGREGATOR_RECEIVED`
- `WEIGHT_VERIFIED`
- `SORTED`
- `RECYCLER_RECEIVED`
- `PROCESSING_CONFIRMED`
- `EPR_ELIGIBILITY_CREATED`
- `EPR_CREDIT_CREATED`
- `REWARD_CREATED`
- `RISK_FLAGGED`
- `HAZARD_REPORTED`

## Requirements
- **Authorization**: Actor must have appropriate permissions for the event type.
- **Idempotency**: Use `client_transaction_id` to prevent duplicate events during sync.
- **Lifecycle Impact**: Defines state transitions as controlled by the backend.
