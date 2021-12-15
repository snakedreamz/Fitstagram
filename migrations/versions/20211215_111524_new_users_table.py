"""new users table

Revision ID: 77fe35ad8ae1
Revises: ffdc0a98111c
Create Date: 2021-12-15 11:15:24.819015

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '77fe35ad8ae1'
down_revision = 'ffdc0a98111c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('nick_name', sa.String(length=50), nullable=False))
    op.add_column('users', sa.Column('profile_image_url', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'profile_image_url')
    op.drop_column('users', 'nick_name')
    # ### end Alembic commands ###