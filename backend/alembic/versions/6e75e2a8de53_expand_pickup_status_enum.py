"""expand_pickup_status_enum

Revision ID: 6e75e2a8de53
Revises: 130f13724e4c
Create Date: 2026-09-11 01:57:40.671080

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e75e2a8de53'
down_revision: Union[str, Sequence[str], None] = '130f13724e4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE pickupstatus ADD VALUE 'AGGREGATOR_RECEIVED'")
    op.execute("ALTER TYPE pickupstatus ADD VALUE 'WEIGHT_VERIFIED'")
    op.execute("ALTER TYPE pickupstatus ADD VALUE 'SORTED'")
    op.execute("ALTER TYPE pickupstatus ADD VALUE 'RECYCLER_RECEIVED'")
    op.execute("ALTER TYPE pickupstatus ADD VALUE 'PROCESSED'")
    op.execute("ALTER TYPE pickupstatus ADD VALUE 'EPR_ELIGIBLE'")
    op.execute("ALTER TYPE pickupstatus ADD VALUE 'EPR_CREDIT'")


def downgrade() -> None:
    """Downgrade schema."""
    # PostgreSQL does not support removing values from ENUM types directly.
    # This migration cannot be automatically reversed.
    pass
