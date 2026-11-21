-- Corner Pass accounts (D1). functions/api/[[route]].js creates these itself
-- on the first request; this file is for running them by hand if preferred.
CREATE TABLE IF NOT EXISTS corners (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE,
  pw TEXT NOT NULL,
  profile TEXT,
  rev INTEGER NOT NULL DEFAULT 0,
  dev TEXT,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  corner_id INTEGER NOT NULL,
  expires INTEGER NOT NULL,
  created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_corner ON sessions (corner_id);
CREATE TABLE IF NOT EXISTS tries (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  first INTEGER NOT NULL,
  until INTEGER NOT NULL DEFAULT 0,
  locks INTEGER NOT NULL DEFAULT 0);
