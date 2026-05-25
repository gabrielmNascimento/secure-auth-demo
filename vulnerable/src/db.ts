import Database from 'better-sqlite3';

const db = new Database('vulnerable.db');

// No password hashing column. Plaintext storage. Intentionally bad.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed an admin user so the SQLi demo has a target
const existingAdmin = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
if (!existingAdmin) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run('admin', 'supersecret123');
  console.log('⚠️  Seeded admin user with plaintext password');
}

export default db;
