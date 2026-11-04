// Połączenie z bazą SQLite i tworzenie tabel.
// Baza to jeden plik: database.sqlite (w folderze projektu albo w DATA_DIR).
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR || process.cwd();
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function createDb() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const db = new Database(path.join(DATA_DIR, 'database.sqlite'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Schemat: users 1 — N tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      login         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      deadline    TEXT,
      done        INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Konto administratora tworzone przy pierwszym uruchomieniu
  const hasAdmin = db.prepare("SELECT 1 FROM users WHERE role = 'admin'").get();
  if (!hasAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const info = db
      .prepare("INSERT OR IGNORE INTO users (login, password_hash, role) VALUES (?, ?, 'admin')")
      .run('admin', hash);

    if (info.changes) {
      const addTask = db.prepare(
        'INSERT INTO tasks (user_id, title, description, deadline, done) VALUES (?, ?, ?, ?, ?)'
      );
      const today = new Date();
      const inDays = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() + n);
        return d.toISOString().slice(0, 10);
      };
      const id = info.lastInsertRowid;
      addTask.run(id, 'Przeczytać o semantycznym HTML', 'Sekcje: header, nav, main, aside, footer.', inDays(0), 1);
      addTask.run(id, 'Dodać 3 progi RWD', 'Media queries: 1024px, 768px, 480px.', inDays(2), 0);
      addTask.run(id, 'Wdrożyć projekt na Railway', 'Podpiąć wolumen pod /data.', inDays(5), 0);
    }
  }

  return db;
}

// Jedno połączenie na proces (globalThis chroni przed duplikatami przy hot reload)
export function getDb() {
  if (!globalThis.__studyplannerDb) {
    globalThis.__studyplannerDb = createDb();
  }
  return globalThis.__studyplannerDb;
}
