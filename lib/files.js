// Operacje na plikach użytkownika: uploads/<id użytkownika>/
import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOADS_DIR } from './db';

export const ALLOWED_EXT = ['.txt', '.md', '.pdf', '.png', '.jpg', '.jpeg'];
export const EDITABLE_EXT = ['.txt', '.md'];
export const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

export function userDir(userId) {
  return path.join(UPLOADS_DIR, String(userId));
}

// Bezpieczna nazwa pliku: bez ścieżek i znaków specjalnych
export function safeName(name) {
  const base = path.basename(String(name || '')).normalize('NFKD').replace(/[̀-ͯ]/g, '');
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '').slice(0, 80);
}

export function filePath(userId, name) {
  const clean = safeName(name);
  if (!clean) return null;
  return path.join(userDir(userId), clean);
}

export function isEditable(name) {
  return EDITABLE_EXT.includes(path.extname(name).toLowerCase());
}

// Lista plików (fs.readdir + fs.stat)
export async function listFiles(userId) {
  const dir = userDir(userId);
  await fs.mkdir(dir, { recursive: true });
  const names = await fs.readdir(dir);
  const files = await Promise.all(
    names.map(async (name) => {
      const stat = await fs.stat(path.join(dir, name));
      return { name, size: stat.size, modified: stat.mtime.toISOString(), editable: isEditable(name) };
    })
  );
  return files.sort((a, b) => b.modified.localeCompare(a.modified));
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
