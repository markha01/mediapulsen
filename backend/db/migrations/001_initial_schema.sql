CREATE TABLE IF NOT EXISTS datasets (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  source      VARCHAR(50)  NOT NULL DEFAULT 'csv',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id              SERIAL PRIMARY KEY,
  dataset_id      INTEGER      NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title           VARCHAR(500) NOT NULL,
  published_at    DATE         NOT NULL,
  views           INTEGER      NOT NULL CHECK (views >= 0),
  time_on_page    INTEGER      NOT NULL CHECK (time_on_page >= 0),
  conversions     INTEGER      NOT NULL CHECK (conversions >= 0),
  conversion_rate NUMERIC(8,4) GENERATED ALWAYS AS (
                    CASE WHEN views = 0 THEN 0
                         ELSE ROUND((conversions::numeric / views) * 100, 4)
                    END) STORED,
  publish_day     SMALLINT     GENERATED ALWAYS AS (
                    EXTRACT(DOW FROM published_at)::SMALLINT) STORED,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insights (
  id                 SERIAL PRIMARY KEY,
  dataset_id         INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
  compare_dataset_id INTEGER REFERENCES datasets(id) ON DELETE SET NULL,
  mode               VARCHAR(20) NOT NULL DEFAULT 'single',
  insights_json      JSONB NOT NULL,
  raw_response       TEXT,
  generated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_dataset_id   ON articles(dataset_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_insights_dataset_id   ON insights(dataset_id);
