// Publiczna podstrona „O projekcie” (dostępna bez logowania)
import Link from 'next/link';

export const metadata = { title: 'O projekcie' };

export default function AboutPage() {
  return (
    <>
      <main className="content">
        <article className="panel prose">
          <header>
            <h1>O projekcie StudyPlanner</h1>
            <p className="lead">
              <strong>StudyPlanner</strong> to <em>prosty planer zadań</em> dla studentów. Pozwala zapisywać
              zadania z terminami, odhaczać postęp i trzymać notatki w jednym miejscu.
            </p>
          </header>

          <figure>
            <img
              src="/img/about.svg"
              alt="Podgląd aplikacji: lista kart zadań i panel postępu"
              title="Tak wygląda dashboard StudyPlanner"
              width="640"
              height="320"
            />
            <figcaption>Ilustracja: dashboard z kartami zadań i paskiem postępu.</figcaption>
          </figure>

          <section>
            <h2>Co potrafi aplikacja</h2>
            <ul>
              <li>Konta użytkowników z rolami <code>user</code> i <code>admin</code>.</li>
              <li>Zadania zapisane w bazie <abbr title="Structured Query Language">SQL</abbr> (SQLite).</li>
              <li>Notatki i załączniki przechowywane jako <mark>pliki na serwerze</mark>.</li>
              <li>Tryb ciemny, sortowanie, filtr ukończonych zadań i licznik postępu.</li>
            </ul>
          </section>

          <section>
            <h2>Jak zacząć</h2>
            <ol>
              <li><Link href="/register">Załóż konto</Link> albo <Link href="/login">zaloguj się</Link>.</li>
              <li>Dodaj zadanie z tytułem i terminem.</li>
              <li>Po wykonaniu kliknij <kbd>Zrobione</kbd>.</li>
              <li>Notatki do zajęć trzymaj w zakładce <Link href="/notes">Notatki</Link>.</li>
            </ol>
          </section>

          <section>
            <h2>Formatowanie tekstu</h2>
            <p>
              Tekst może być <strong>pogrubiony</strong>, <em>pochylony</em>, <mark>wyróżniony</mark>,{' '}
              <u>podkreślony</u>, <s>przekreślony</s> albo <small>pomniejszony</small>. Kod wygląda tak:{' '}
              <code>display: grid;</code>. Wzory: H<sub>2</sub>O, E = mc<sup>2</sup>. Skrót{' '}
              <abbr title="Responsive Web Design">RWD</abbr> pokazuje podpowiedź po najechaniu.
            </p>
            <blockquote cite="https://pl.wikipedia.org/wiki/Seneka_M%C5%82odszy">
              <p>Ucząc innych, sami się uczymy.</p>
              <footer>— Seneka</footer>
            </blockquote>
          </section>

          <section>
            <h2>Technologie</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Warstwa</th>
                    <th scope="col">Technologia</th>
                    <th scope="col">Rola</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Struktura</td><td>HTML5 (JSX)</td><td>semantyczny układ strony</td></tr>
                  <tr><td>Prezentacja</td><td>CSS (Grid, Flexbox, media queries)</td><td>wygląd i RWD</td></tr>
                  <tr><td>Interakcja</td><td>JavaScript / React</td><td>dynamika po stronie przeglądarki</td></tr>
                  <tr><td>Backend</td><td>Next.js (Server Actions)</td><td>logika na serwerze</td></tr>
                  <tr><td>Baza</td><td>SQLite + better-sqlite3</td><td>przechowywanie danych</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </main>

      <aside className="sidebar">
        <section className="panel">
          <h2>Przydatne linki</h2>
          <ul className="link-list">
            <li><a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" title="Otwiera się w nowej karcie">Dokumentacja Next.js</a></li>
            <li><a href="https://developer.mozilla.org/pl/docs/Web/HTML" target="_blank" rel="noopener noreferrer" title="Otwiera się w nowej karcie">MDN – HTML</a></li>
            <li><a href="https://developer.mozilla.org/pl/docs/Web/CSS" target="_blank" rel="noopener noreferrer" title="Otwiera się w nowej karcie">MDN – CSS</a></li>
            <li><a href="https://validator.w3.org/" target="_blank" rel="noopener noreferrer" title="Otwiera się w nowej karcie">Walidator W3C</a></li>
          </ul>
        </section>
        <section className="panel">
          <h2>Autor</h2>
          <address>
            Jakub Siekiera<br />
            Nr studenta: 86057<br />
            Systemy webowe, 2026
          </address>
        </section>
      </aside>
    </>
  );
}
