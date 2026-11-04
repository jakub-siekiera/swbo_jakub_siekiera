// Sesja użytkownika (zaszyfrowane ciasteczko) i kontrola uprawnień.
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from './db';

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'dev-only-secret-zmien-mnie-na-produkcji-123456',
  cookieName: 'studyplanner_session',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession() {
  return getIronSession(await cookies(), sessionOptions);
}

// Zwraca zalogowanego użytkownika albo null
export async function getUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const user = getDb()
    .prepare('SELECT id, login, role FROM users WHERE id = ?')
    .get(session.userId);
  return user || null;
}

// Odpowiednik middleware requireLogin
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}

// Odpowiednik middleware requireAdmin
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/?error=' + encodeURIComponent('Brak uprawnień administratora'));
  return user;
}
