import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const db = new Database('hardened.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    success INTEGER NOT NULL,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_login_attempts_username
    ON login_attempts(username, attempted_at);
`);

// Seed admin with a properly hashed password
const existingAdmin = db
  .prepare('SELECT id FROM users WHERE username = ?')
  .get('admin');

if (!existingAdmin) {
  const hash = bcrypt.hashSync('supersecret123', 12);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('✅ Seeded admin user with bcrypt-hashed password (cost factor 12)');
}

export default db;
