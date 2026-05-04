"""init

Revision ID: 198bf65f2ca7
Revises: 
Create Date: 2026-05-03 14:32:39.613193

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '198bf65f2ca7'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    todo_status = postgresql.ENUM('pending', 'done', name='todo_status', create_type=True)
    todo_status.create(op.get_bind(), checkfirst=True)
    todo_status_column = postgresql.ENUM('pending', 'done', name='todo_status', create_type=False)

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=80), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('device_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('device_id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
    )

    op.create_table(
        'bosses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('required_todos', sa.Integer(), nullable=False),
        sa.Column('image_path', sa.String(length=255), nullable=False),
        sa.Column('audio_path', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('difficulty_order', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )

    op.create_table(
        'daily_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('boss_id', sa.Integer(), nullable=False),
        sa.Column('session_date', sa.Date(), nullable=False, server_default=sa.text('CURRENT_DATE')),
        sa.Column('required_todos', sa.Integer(), nullable=False),
        sa.Column('current_todos_done', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_cleared', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('cleared_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint('current_todos_done >= 0', name='chk_todos_non_negative'),
        sa.CheckConstraint('current_todos_done <= required_todos', name='chk_todos_not_exceed'),
        sa.ForeignKeyConstraint(['boss_id'], ['bosses.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'session_date', name='uq_user_daily_session'),
    )
    op.create_index('idx_sessions_user_date', 'daily_sessions', ['user_id', 'session_date'], unique=False)

    op.create_table(
        'todos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('task_name', sa.String(length=255), nullable=False),
        sa.Column('status', todo_status_column, nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['daily_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_todos_session', 'todos', ['session_id'], unique=False)
    op.create_index('idx_todos_status', 'todos', ['status'], unique=False)

    boss_table = sa.table(
        'bosses',
        sa.column('name', sa.String(length=100)),
        sa.column('required_todos', sa.Integer()),
        sa.column('image_path', sa.String(length=255)),
        sa.column('audio_path', sa.String(length=255)),
        sa.column('description', sa.Text()),
        sa.column('difficulty_order', sa.Integer()),
    )
    op.bulk_insert(
        boss_table,
        [
            {
                'name': 'Malenia, Blade of Miquella',
                'required_todos': 1,
                'image_path': 'assets/images/malenia.webp',
                'audio_path': 'assets/audio/malenia_theme.mp3',
                'description': 'The hardest boss in Elden Ring. Her lifesteal punishes every hit.',
                'difficulty_order': 1,
            },
            {
                'name': 'Radagon of the Golden Order',
                'required_todos': 2,
                'image_path': 'assets/images/radagon.webp',
                'audio_path': 'assets/audio/radagon_theme.mp3',
                'description': 'The secret lord of the Erdtree. Aggressive and relentless.',
                'difficulty_order': 2,
            },
            {
                'name': 'Mohg, Lord of Blood',
                'required_todos': 3,
                'image_path': 'assets/images/mohg.webp',
                'audio_path': 'assets/audio/mohg_theme.mp3',
                'description': 'Patron of the Formless Mother. His Nihil ritual demands sacrifice.',
                'difficulty_order': 3,
            },
            {
                'name': 'Godfrey, the First Elden Lord',
                'required_todos': 4,
                'image_path': 'assets/images/godfrey.webp',
                'audio_path': 'assets/audio/godfrey_theme.mp3',
                'description': 'The mightiest warrior of the Golden Order.',
                'difficulty_order': 4,
            },
            {
                'name': 'Starscourge Radahn',
                'required_todos': 5,
                'image_path': 'assets/images/radahn.webp',
                'audio_path': 'assets/audio/radahn_theme.mp3',
                'description': 'Conqueror of the Stars. Only five tasks slow his charge.',
                'difficulty_order': 5,
            },
            {
                'name': 'Morgott, the Omen King',
                'required_todos': 6,
                'image_path': 'assets/images/morgott.webp',
                'audio_path': 'assets/audio/morgott_theme.mp3',
                'description': 'The veiled protector of Leyndell.',
                'difficulty_order': 6,
            },
            {
                'name': 'Messmer the Impaler',
                'required_todos': 7,
                'image_path': 'assets/images/messmer.webp',
                'audio_path': 'assets/audio/messmer_theme.mp3',
                'description': 'The shadow of the Erdtree, wielding serpent flame.',
                'difficulty_order': 7,
            },
        ],
    )


def downgrade():
    op.drop_index('idx_todos_status', table_name='todos')
    op.drop_index('idx_todos_session', table_name='todos')
    op.drop_table('todos')

    op.drop_index('idx_sessions_user_date', table_name='daily_sessions')
    op.drop_table('daily_sessions')
    op.drop_table('bosses')
    op.drop_table('users')

    sa.Enum('pending', 'done', name='todo_status').drop(op.get_bind(), checkfirst=True)
