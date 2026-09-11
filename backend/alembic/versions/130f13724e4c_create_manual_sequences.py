"""create_manual_sequences

Revision ID: 130f13724e4c
Revises: 030d96603221
Create Date: 2026-09-11 01:30:27.116397

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '130f13724e4c'
down_revision: Union[str, Sequence[str], None] = '030d96603221'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE SEQUENCE pickup_request_seq START 1000")
    op.execute("CREATE SEQUENCE batch_seq START 70")
    op.execute("CREATE SEQUENCE item_seq START 1")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP SEQUENCE pickup_request_seq")
    op.execute("DROP SEQUENCE batch_seq")
    op.execute("DROP SEQUENCE item_seq")
