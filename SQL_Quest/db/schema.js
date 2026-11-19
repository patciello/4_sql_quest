/* GERADO a partir de db/schema.sql — não edite à mão (ver docs/BANCO_E_LOGIN.md). */
const SCHEMA_SQL = `-- SQL Quest — esquema do banco de métricas, histórico e progresso (ESQUELETO)
--
-- Fonte única do esquema. \`db/schema.js\` é gerado a partir deste arquivo
-- (ver docs/BANCO_E_LOGIN.md) para que o app abra com duplo clique, sem servidor.
--
-- Dialeto: SQLite (é o que o app usa hoje, via sql.js no navegador).
-- Para PostgreSQL: troque TEXT de datas por TIMESTAMPTZ, INTEGER PRIMARY KEY
-- AUTOINCREMENT por BIGINT GENERATED ALWAYS AS IDENTITY, e INTEGER 0/1 por BOOLEAN.
-- Datas são gravadas em ISO 8601 UTC (ex.: 2026-11-18T21:30:00.000Z).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_version (
  version    INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Quem estuda. 'guest' = sem conta (progresso só neste navegador).
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                       -- 'guest', 'e_<hash>' (e-mail) ou 'g_<sub>' (Google)
  provider      TEXT NOT NULL CHECK (provider IN ('guest', 'email', 'google')),
  email         TEXT UNIQUE,
  display_name  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_login_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Um item concluído por usuário (lição, quiz ou etapa do projeto).
CREATE TABLE IF NOT EXISTS progress (
  user_id      TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id      TEXT NOT NULL,                           -- id do item em content*.js
  completed_at TEXT NOT NULL,
  attempts     INTEGER NOT NULL DEFAULT 1 CHECK (attempts >= 1),
  first_try    INTEGER NOT NULL DEFAULT 0 CHECK (first_try IN (0, 1)),
  project_sql  TEXT,                                    -- SQL aprovado (só etapas do projeto BiblioTech)
  PRIMARY KEY (user_id, item_id)
);

-- Histórico: toda execução/resposta, certa ou errada.
CREATE TABLE IF NOT EXISTS attempts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id      TEXT NOT NULL,
  attempted_at TEXT NOT NULL,
  passed       INTEGER NOT NULL CHECK (passed IN (0, 1)),
  sql_text     TEXT                                     -- NULL em quizzes
);

-- Simulados da certificação.
CREATE TABLE IF NOT EXISTS exams (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  taken_at   TEXT NOT NULL,
  correct    INTEGER NOT NULL CHECK (correct >= 0),
  total      INTEGER NOT NULL CHECK (total > 0),
  duration_s INTEGER CHECK (duration_s >= 0),
  CHECK (correct <= total)
);

-- Reservada para a revisão por questão (ainda não preenchida pelo app).
CREATE TABLE IF NOT EXISTS exam_answers (
  exam_id       INTEGER NOT NULL REFERENCES exams (id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  item_id       TEXT NOT NULL,
  chosen_option INTEGER,                                -- NULL = em branco
  is_correct    INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  PRIMARY KEY (exam_id, position)
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_time ON attempts (user_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_attempts_user_item ON attempts (user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_exams_user_time    ON exams (user_id, taken_at);

-- Itens concluídos por dia (alimenta o gráfico de 14 dias e a sequência de estudo).
CREATE VIEW IF NOT EXISTS v_daily_activity AS
SELECT user_id,
       date(completed_at, 'localtime') AS day,
       COUNT(*)                         AS items_completed
FROM progress
GROUP BY user_id, date(completed_at, 'localtime');

-- Métricas do dashboard por usuário.
CREATE VIEW IF NOT EXISTS v_user_metrics AS
SELECT u.id AS user_id,
       (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id)                          AS items_done,
       (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.first_try = 1)       AS first_try_ok,
       (SELECT COUNT(*) FROM attempts a WHERE a.user_id = u.id)                           AS total_attempts,
       (SELECT COUNT(*) FROM exams e WHERE e.user_id = u.id)                              AS exams_taken,
       (SELECT MAX(ROUND(100.0 * e.correct / e.total)) FROM exams e WHERE e.user_id = u.id) AS best_exam_pct
FROM users u;

INSERT OR IGNORE INTO schema_version (version) VALUES (1);
`;
