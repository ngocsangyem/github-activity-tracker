import Database from 'better-sqlite3';
import { config } from './config.js';

const db = new Database(config.DB_PATH);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS commits (
    id INTEGER PRIMARY KEY,
    sha TEXT UNIQUE,
    repo TEXT,
    author TEXT,
    date DATETIME,
    message TEXT
  );
  
  CREATE TABLE IF NOT EXISTS leaderboard (
    user_id TEXT PRIMARY KEY,
    username TEXT,
    commit_count INTEGER DEFAULT 0
  );
`);

export const insertCommit = db.prepare(`
  INSERT OR IGNORE INTO commits (sha, repo, author, date, message)
  VALUES (?, ?, ?, ?, ?)
`);

export const updateLeaderboard = db.prepare(`
  INSERT INTO leaderboard (user_id, username, commit_count)
  VALUES (?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    commit_count = commit_count + excluded.commit_count
`);

export default db;