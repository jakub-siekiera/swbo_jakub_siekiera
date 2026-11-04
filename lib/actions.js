'use server';
// Akcje wykonywane NA SERWERZE (Server Actions).
// Każdy formularz <form action={...}> wywołuje jedną z tych funkcji:
// formularz → akcja → zapytanie SQL / operacja na pliku → przekierowanie.
import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from './db';
import { getSession, requireUser, requireAdmin } from './session';
import { ALLOWED_EXT, MAX_SIZE, filePath, isEditable, safeName, userDir } from './files';

const go = (url, params = {}) => {
  const query = new URLSearchParams(params).toString();
  redirect(query ? `${url}?${query}` : url);
};

const text = (formData, key) => String(formData.get(key) ?? '').trim();

/* ───────────── Konta ───────────── */

export async function register(formData) {
  const login = text(formData, 'login');
  const password = String(formData.get('password') ?? '');
  const password2 = String(formData.get('password2') ?? '');

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(login)) {
    go('/register', { error: 'Login: 3–20 znaków (litery, cyfry, _).' });
  }
  if (password.length < 6) go('/register', { error: 'Hasło musi mieć min. 6 znaków.' });
  if (password !== password2) go('/register', { error: 'Hasła nie są takie same.' });

  const db = getDb();
  if (db.prepare('SELECT 1 FROM users WHERE login = ?').get(login)) {
    go('/register', { error: 'Taki login już istnieje.' });
  }

  const hash = await bcrypt.hash(password, 10);
  const info = db.prepare('INSERT INTO users (login, password_hash) VALUES (?, ?)').run(login, hash);

  const session = await getSession();
  session.userId = Number(info.lastInsertRowid);
  await session.save();
  go('/', { msg: 'Konto utworzone. Witaj!' });
}

export async function login(formData) {
  const loginName = text(formData, 'login');
  const password = String(formData.get('password') ?? '');

  const user = getDb().prepare('SELECT * FROM users WHERE login = ?').get(loginName);
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) go('/login', { error: 'Nieprawidłowy login lub hasło.' });

  const session = await getSession();
  session.userId = user.id;
  await session.save();
  go('/');
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  go('/login', { msg: 'Wylogowano.' });
}

/* ───────────── Zadania (CRUD w bazie) ───────────── */

function readTask(formData) {
  const title = text(formData, 'title').slice(0, 80);
  const description = text(formData, 'description').slice(0, 500);
  const deadline = text(formData, 'deadline');
  return {
    title,
    description,
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null,
  };
}

export async function addTask(formData) {
  const user = await requireUser();
  const t = readTask(formData);
  if (t.title.length < 3) return { error: 'Tytuł musi mieć min. 3 znaki.' };

  getDb()
    .prepare('INSERT INTO tasks (user_id, title, description, deadline) VALUES (?, ?, ?, ?)')
    .run(user.id, t.title, t.description, t.deadline);
  revalidatePath('/');
  return { ok: true };
}

export async function updateTask(formData) {
  const user = await requireUser();
  const id = Number(formData.get('id'));
  const t = readTask(formData);
  if (t.title.length < 3) go('/', { error: 'Tytuł musi mieć min. 3 znaki.' });

  getDb()
    .prepare('UPDATE tasks SET title = ?, description = ?, deadline = ? WHERE id = ? AND user_id = ?')
    .run(t.title, t.description, t.deadline, id, user.id);
  revalidatePath('/');
}

export async function toggleTask(formData) {
  const user = await requireUser();
  getDb()
    .prepare('UPDATE tasks SET done = 1 - done WHERE id = ? AND user_id = ?')
    .run(Number(formData.get('id')), user.id);
  revalidatePath('/');
}

export async function deleteTask(formData) {
  const user = await requireUser();
  getDb()
    .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
    .run(Number(formData.get('id')), user.id);
  revalidatePath('/');
}

/* ───────────── Administracja użytkownikami ───────────── */

export async function setRole(formData) {
  const admin = await requireAdmin();
  const id = Number(formData.get('id'));
  const role = formData.get('role') === 'admin' ? 'admin' : 'user';
  if (id === admin.id) go('/admin', { error: 'Nie możesz zmienić własnej roli.' });

  getDb().prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  go('/admin', { msg: 'Rola zmieniona.' });
}

export async function deleteUser(formData) {
  const admin = await requireAdmin();
  const id = Number(formData.get('id'));
  if (id === admin.id) go('/admin', { error: 'Nie możesz usunąć własnego konta.' });

  getDb().prepare('DELETE FROM users WHERE id = ?').run(id); // zadania usuwa ON DELETE CASCADE
  await fs.rm(userDir(id), { recursive: true, force: true }); // pliki użytkownika
  go('/admin', { msg: 'Użytkownik usunięty.' });
}

/* ───────────── Pliki na serwerze ───────────── */

export async function uploadFile(formData) {
  const user = await requireUser();
  const file = formData.get('file');

  if (!file || typeof file === 'string' || file.size === 0) go('/notes', { error: 'Wybierz plik.' });
  if (file.size > MAX_SIZE) go('/notes', { error: 'Plik jest za duży (max 4 MB).' });

  const name = safeName(file.name);
  if (!ALLOWED_EXT.includes(path.extname(name).toLowerCase())) {
    go('/notes', { error: `Dozwolone typy: ${ALLOWED_EXT.join(', ')}` });
  }

  await fs.mkdir(userDir(user.id), { recursive: true });
  await fs.writeFile(filePath(user.id, name), Buffer.from(await file.arrayBuffer()));
  go('/notes', { msg: `Wgrano plik ${name}.` });
}

export async function createNote(formData) {
  const user = await requireUser();
  let name = safeName(text(formData, 'name'));
  if (!name) go('/notes', { error: 'Podaj nazwę notatki.' });
  if (!isEditable(name)) name += '.txt';

  const target = filePath(user.id, name);
  await fs.mkdir(userDir(user.id), { recursive: true });
  try {
    await fs.writeFile(target, String(formData.get('content') ?? ''), { flag: 'wx' }); // wx = nie nadpisuj
  } catch {
    go('/notes', { error: 'Plik o tej nazwie już istnieje.' });
  }
  go('/notes', { msg: `Utworzono notatkę ${name}.` });
}

export async function saveNote(formData) {
  const user = await requireUser();
  const name = safeName(formData.get('name'));
  if (!isEditable(name)) go('/notes', { error: 'Ten plik nie jest edytowalny.' });

  await fs.writeFile(filePath(user.id, name), String(formData.get('content') ?? ''));
  go('/notes', { msg: `Zapisano ${name}.` });
}

export async function deleteFile(formData) {
  const user = await requireUser();
  const target = filePath(user.id, formData.get('name'));
  if (target) await fs.unlink(target).catch(() => {});
  go('/notes', { msg: 'Plik usunięty.' });
}
