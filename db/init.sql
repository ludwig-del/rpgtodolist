-- ============================================================
-- Elden Ring Todo — PostgreSQL Schema (no-auth version)
-- ============================================================

DO $$ BEGIN
    CREATE TYPE todo_status AS ENUM ('pending', 'done');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id         SERIAL      PRIMARY KEY,
    device_id  VARCHAR(36) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bosses (
    id               SERIAL       PRIMARY KEY,
    name             VARCHAR(100) UNIQUE NOT NULL,
    required_todos   INTEGER      NOT NULL CHECK (required_todos > 0),
    image_path       VARCHAR(255) NOT NULL,
    audio_path       VARCHAR(255) NOT NULL,
    description      TEXT,
    difficulty_order INTEGER      NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_sessions (
    id                 SERIAL  PRIMARY KEY,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    boss_id            INTEGER NOT NULL REFERENCES bosses(id),
    session_date       DATE    NOT NULL DEFAULT CURRENT_DATE,
    required_todos     INTEGER NOT NULL,
    current_todos_done INTEGER NOT NULL DEFAULT 0 CHECK (current_todos_done >= 0),
    is_cleared         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cleared_at         TIMESTAMPTZ,
    CONSTRAINT uq_user_daily_session UNIQUE (user_id, session_date),
    CONSTRAINT chk_todos_not_exceed  CHECK  (current_todos_done <= required_todos)
);

CREATE TABLE IF NOT EXISTS todos (
    id           SERIAL       PRIMARY KEY,
    session_id   INTEGER      NOT NULL REFERENCES daily_sessions(id) ON DELETE CASCADE,
    task_name    VARCHAR(255) NOT NULL,
    status       todo_status  NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON daily_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_todos_session       ON todos(session_id);

INSERT INTO bosses (name, required_todos, image_path, audio_path, description, difficulty_order) VALUES
    ('Malenia, Blade of Miquella',    1, 'assets/images/malenia.webp',  'assets/audio/malenia_theme.mp3',  'The hardest boss in Elden Ring. Her lifesteal punishes every hit.',  1),
    ('Radagon of the Golden Order',   2, 'assets/images/radagon.webp',  'assets/audio/radagon_theme.mp3',  'The secret lord of the Erdtree. Aggressive and relentless.',         2),
    ('Mohg, Lord of Blood',           3, 'assets/images/mohg.webp',     'assets/audio/mohg_theme.mp3',     'Patron of the Formless Mother. His Nihil ritual demands sacrifice.', 3),
    ('Godfrey, the First Elden Lord', 4, 'assets/images/godfrey.webp',  'assets/audio/godfrey_theme.mp3',  'The mightiest warrior of the Golden Order.',                         4),
    ('Starscourge Radahn',            5, 'assets/images/radahn.webp',   'assets/audio/radahn_theme.mp3',   'Conqueror of the Stars. Only five tasks slow his charge.',           5),
    ('Morgott, the Omen King',        6, 'assets/images/morgott.webp',  'assets/audio/morgott_theme.mp3',  'The veiled protector of Leyndell.',                                  6),
    ('Messmer the Impaler',           7, 'assets/images/messmer.webp',  'assets/audio/messmer_theme.mp3',  'The shadow of the Erdtree, wielding serpent flame.',                 7)
ON CONFLICT (name) DO NOTHING;
