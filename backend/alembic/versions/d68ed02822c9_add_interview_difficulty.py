"""add interview difficulty

Revision ID: d68ed02822c9
Revises: 041666746800
Create Date: 2026-08-29 14:56:31.784635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd68ed02822c9'
down_revision: Union[str, Sequence[str], None] = '041666746800'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    interview_difficulty = sa.Enum(
        'EASY',
        'MEDIUM',
        'HARD',
        name='interviewdifficulty',
    )

    interview_difficulty.create(op.get_bind(), checkfirst=True)

    op.add_column(
        'interview_sessions',
        sa.Column(
            'difficulty',
            interview_difficulty,
            nullable=True,
        ),
    )

    op.execute(
        "UPDATE interview_sessions "
        "SET difficulty = 'MEDIUM' "
        "WHERE difficulty IS NULL"
    )

    op.alter_column(
        'interview_sessions',
        'difficulty',
        nullable=False,
    )
    

def downgrade() -> None:
    op.drop_column('interview_sessions', 'difficulty')

    interview_difficulty = sa.Enum(
        'EASY',
        'MEDIUM',
        'HARD',
        name='interviewdifficulty',
    )

    interview_difficulty.drop(op.get_bind(), checkfirst=True)
