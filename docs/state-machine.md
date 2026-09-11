# State Machine

## Canonical Lifecycle
REQUESTED → ASSIGNED → COLLECTED → AGGREGATOR_RECEIVED → SORTED → RECYCLER_RECEIVED → PROCESSED → EPR_ELIGIBLE → EPR_CREDIT

## Alternative Pathways
- SORTED → REFURBISHED → REUSED
- SORTED → COMPONENT_RECOVERY → RECYCLE

## Rules
- **Backend Authority**: The backend controls lifecycle transitions. Invalid transitions (e.g., attempting to process without recycler receipt) are rejected.
- **EPR Gating**: EPR credit requires full processing chain (Collector → Aggregator → Recycler → Processing → Eligibility → Credit).
- **COLLECTED ≠ RECYCLED**: Collection is just the beginning.
- **Auditable**: Transitions must create corresponding events.
- **Verification**: Required at handover points (Aggregator, Recycler).
