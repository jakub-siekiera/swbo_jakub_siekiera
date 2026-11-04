import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/session';
import { login } from '@/lib/actions';
import Flash from '@/components/Flash';

export const metadata = { title: 'Logowanie' };

export default async function LoginPage({ searchParams }) {
  if (await getUser()) redirect('/');
  const { msg, error } = await searchParams;

  return (
    <main className="content auth">
      <section className="panel">
        <h1>Logowanie</h1>
        <Flash msg={msg} error={error} />
        <form action={login} className="form">
          <label>
            Login
            <input name="login" autoComplete="username" required />
          </label>
          <label>
            Hasło
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button type="submit" className="btn">Zaloguj</button>
        </form>
        <p>
          Nie masz konta? <Link href="/register">Zarejestruj się</Link>.
        </p>
        <p className="hint">
          Zobacz też: <Link href="/about">O projekcie</Link>
        </p>
      </section>
    </main>
  );
}
