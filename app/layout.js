// Główny układ strony (wspólny dla wszystkich podstron):
// <header> (logo + <nav> z menu dwupoziomowym) → treść strony (<main> + <aside>) → <footer>
import './globals.css'; // powiązanie warstwy prezentacji (CSS) z HTML
import Link from 'next/link';
import { getUser } from '@/lib/session';
import { logout } from '@/lib/actions';
import ThemeToggle from '@/components/ThemeToggle';
import MenuToggle from '@/components/MenuToggle';
import BackToTop from '@/components/BackToTop';

export const metadata = {
  title: { default: 'StudyPlanner', template: '%s · StudyPlanner' },
  description: 'StudyPlanner – prosty planer zadań do nauki',
};

export default async function RootLayout({ children }) {
  const user = await getUser();

  return (
    <html lang="pl">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" title="Strona główna StudyPlanner">
            <img src="/img/logo.svg" alt="Logo StudyPlanner" width="40" height="40" />
            <span>StudyPlanner</span>
          </Link>

          <nav className="main-nav" aria-label="Menu główne">
            <MenuToggle />
            <ul id="main-menu" className="menu">
              <li className="menu__item has-sub">
                <Link href="/">Zadania</Link>
                <ul className="submenu">
                  <li><Link href="/">Wszystkie</Link></li>
                  <li><Link href="/?filter=todo">Do zrobienia</Link></li>
                  <li><Link href="/#add-task">Dodaj zadanie</Link></li>
                </ul>
              </li>
              <li className="menu__item has-sub">
                <Link href="/notes">Notatki</Link>
                <ul className="submenu">
                  <li><Link href="/notes">Moje pliki</Link></li>
                  <li><Link href="/notes#upload">Wgraj plik</Link></li>
                  <li><Link href="/notes#new-note">Nowa notatka</Link></li>
                </ul>
              </li>
              <li className="menu__item has-sub">
                <Link href={user ? '/' : '/login'}>{user ? `Konto (${user.login})` : 'Konto'}</Link>
                <ul className="submenu">
                  {user ? (
                    <>
                      {user.role === 'admin' && <li><Link href="/admin">Panel admina</Link></li>}
                      <li>
                        <form action={logout}>
                          <button type="submit" className="menu__link-btn">Wyloguj</button>
                        </form>
                      </li>
                    </>
                  ) : (
                    <>
                      <li><Link href="/login">Zaloguj</Link></li>
                      <li><Link href="/register">Załóż konto</Link></li>
                    </>
                  )}
                </ul>
              </li>
              <li className="menu__item has-sub">
                <Link href="/about">O projekcie</Link>
                <ul className="submenu">
                  <li><Link href="/about">Opis projektu</Link></li>
                  <li><a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">Dokumentacja Next.js ↗</a></li>
                  <li><a href="https://developer.mozilla.org/pl/" target="_blank" rel="noopener noreferrer">MDN Web Docs ↗</a></li>
                </ul>
              </li>
            </ul>
          </nav>

          <ThemeToggle />
        </header>

        <div className="container">{children}</div>

        <footer className="site-footer">
          <p>
            &copy; 2026 <strong>StudyPlanner</strong> · projekt na laboratorium <em>Systemy webowe</em>
          </p>
          <p>
            <Link href="/about">O projekcie</Link> · <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </footer>

        <BackToTop />
      </body>
    </html>
  );
}
