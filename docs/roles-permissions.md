# Roles and Permissions

Authorization is enforced strictly on the server-side.

## Roles
- CITIZEN
- COLLECTOR
- AGGREGATOR
- RECYCLER
- BRAND
- PRO
- ADMIN

## Permission Matrix

| Role | Operations | Data Visibility |
| :--- | :--- | :--- |
| CITIZEN | Request Pickup | Own requests |
| COLLECTOR | Collection, Batching, Offline Sync | Assigned pickups, own collections |
| AGGREGATOR | Verification, Handover | All accessible batches |
| RECYCLER | Processing Confirmation, Recycling | All assigned batches |
| BRAND/PRO | Compliance Reporting, Dashboard | Aggregated system data |
| ADMIN | System Management | Full system access |

*Note: Specific granular permissions are TBD.*
