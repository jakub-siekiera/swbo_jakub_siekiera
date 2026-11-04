// GET /notes/download/<nazwa> – pobranie pliku z serwera (tylko właściciel)
import fs from 'node:fs/promises';
import path from 'node:path';
import { getUser } from '@/lib/session';
import { filePath } from '@/lib/files';

const TYPES = {
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

export async function GET(request, { params }) {
  const user = await getUser();
  if (!user) return new Response('Zaloguj się', { status: 401 });

  const { name } = await params;
  const target = filePath(user.id, decodeURIComponent(name));
  const data = target ? await fs.readFile(target).catch(() => null) : null;
  if (!data) return new Response('Nie znaleziono pliku', { status: 404 });

  const fileName = path.basename(target);
  return new Response(data, {
    headers: {
      'Content-Type': TYPES[path.extname(fileName).toLowerCase()] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
