import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/session';
import { register } from '@/lib/actions';
import Flash from '@/components/Flash';

export const metadata = { title: 'Rejestracja' };

export default async function RegisterPage({ searchParams }) {
  if (await getUser()) redirect('/');
  const { error } = await searchParams;

  return (
    <main className="content auth">
      <section className="panel">
        <h1>Załóż konto</h1>
        <Flash error={error} />
        <form action={register} className="form">
          <label>
            Login
            <input name="login" autoComplete="username" required pattern="[a-zA-Z0-9_]{3,20}" title="3–20 znaków: litery, cyfry, _" />
          </label>
          <label>
            Hasło
            <input type="password" name="password" autoComplete="new-password" required minLength={6} title="Minimum 6 znaków" />
          </label>
          <label>
            Powtórz hasło
            <input type="password" name="password2" autoComplete="new-password" required minLength={6} />
          </label>
          <button type="submit" className="btn">Zarejestruj</button>
        </form>
        <p>
          Masz już konto? <Link href="/login">Zaloguj się</Link>.
        </p>
      </section>
    </main>
  );
}
