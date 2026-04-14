CREATE TABLE IF NOT EXISTS dataset_files (
  id             SERIAL PRIMARY KEY,
  dataset_id     INTEGER      NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  filename       VARCHAR(255) NOT NULL,
  rows_inserted  INTEGER      NOT NULL DEFAULT 0,
  uploaded_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dataset_files_dataset_id ON dataset_files(dataset_id);
