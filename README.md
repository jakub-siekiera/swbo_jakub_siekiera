# StudyPlanner – prosty planer zadań

Projekt na laboratorium **Systemy webowe**. Dashboard, w którym zalogowany użytkownik widzi swoje zadania (baza danych) i notatki/załączniki (pliki na serwerze). Administrator zarządza kontami. Podstrona „O projekcie” jest publiczna.

> Przed oddaniem zmień nazwę folderu na `swbo_lab_<grupa>_<imie>_<nazwisko>` i uzupełnij dane autora w `app/about/page.js`.

## Uruchomienie lokalne

Wymagany Node.js 20.9+.

```bash
npm install
npm run dev          # http://localhost:3000 (hot reload)
```

Przy pierwszym starcie tworzy się `database.sqlite` oraz konto **admin / admin123** (hasło zmienisz zmienną `ADMIN_PASSWORD`).

Wersja produkcyjna: `npm run build && npm start`.

## Wdrożenie (Railway)

1. Wypchnij projekt na GitHub.
2. Railway → *New Project* → *Deploy from GitHub repo*.
3. W usłudze dodaj **Volume** zamontowany w `/data`.
4. Zmienne (*Variables*):
   - `DATA_DIR=/data` – tam trafi baza i folder `uploads/`
   - `SESSION_SECRET=` długi losowy ciąg (min. 32 znaki)
   - `ADMIN_PASSWORD=` hasło admina
   - `TZ=Europe/Warsaw` – poprawne „dziś” w planie tygodnia
5. *Settings → Networking → Generate Domain*. Każdy push na GitHub = automatyczny deploy.

## Struktura

```
app/
  layout.js               układ: header + nav (menu 2-poziomowe) + treść + footer
  globals.css             CAŁY CSS (Grid, Flex, 3 progi RWD)
  page.js                 dashboard: zadania + aside (plan tygodnia, statystyki)
  notes/page.js           pliki użytkownika
  notes/download/[name]/  pobieranie pliku (Route Handler GET)
  admin/page.js           zarządzanie użytkownikami
  about/page.js           publiczna podstrona
  login/, register/       formularze kont
components/               TaskCard, TaskBoard, AddTaskForm, ThemeToggle, MenuToggle, Clock, BackToTop…
lib/
  db.js                   połączenie SQLite + CREATE TABLE + konto admina
  session.js              sesja (iron-session), requireUser(), requireAdmin()
  actions.js              Server Actions – wszystkie akcje „na serwerze”
  files.js                operacje na plikach (fs)
public/img/               grafiki SVG
```

## Mapa wymagań

### HTML
| Wymaganie | Gdzie |
|---|---|
| Przeznaczenie | dashboard – planer zadań |
| Semantyka / sekcje | `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, `address`, `time` |
| Menu dwupoziomowe | `app/layout.js` – zagnieżdżone `ul.menu > li > ul.submenu` |
| Tekst, grafika, tabela, listy, linki | dashboard + `/about` (tabele, `ul`, `ol`, `dl`, linki wewnętrzne i zewnętrzne) |
| Formatowanie (min. 5) | `/about`: `strong`, `em`, `mark`, `u`, `s`, `small`, `code`, `kbd`, `sub`, `sup`, `abbr`, `blockquote` |
| Atrybuty grafik | `alt`, `width`, `height`, `title` na każdym `<img>` |
| Elementy powtarzalne | `article.task-card` (TaskCard.js), `li.file-item`, wiersze tabel |
| Układ | Grid: header / main + aside / footer |

### CSS (`app/globals.css`)
| Wymaganie | Gdzie |
|---|---|
| Osobny plik | `import './globals.css'` w `layout.js`, brak stylów inline |
| RWD – 3 progi | `@media (max-width: 1024px / 768px / 480px)` |
| Responsywne obrazy i tekst | `img { max-width:100% }`, `font-size: clamp(...)` |
| Responsywne tabele | `.table-wrap { overflow-x: auto }` |
| Style definiowane raz | `.task-card`, `.file-item`, `.panel`, `.btn` |
| Sygnalizacja dynamiki | `cursor: pointer`, `:hover`, `transition`, `:active` |
| Podpowiedzi | atrybuty `title` + własny tooltip `[data-tip]::after { content: attr(data-tip) }` |
| block / inline | `.submenu` `none → block` na `:hover`; linki menu `inline → inline-block / block` |
| position | `sticky` (header, aside), `absolute` (podmenu, tooltip), `fixed` (przycisk „do góry”), `relative` |

### JavaScript
| Mechanizm | Plik | Wymaganie |
|---|---|---|
| Pokaż/ukryj ukończone | TaskBoard.js | widoczność |
| Hamburger menu | MenuToggle.js | widoczność |
| Przycisk „do góry” po przewinięciu | BackToTop.js | widoczność |
| Tryb ciemny (`classList.toggle('dark')`) | ThemeToggle.js | wygląd |
| Oznaczanie zadania jako zrobione / po terminie | TaskCard.js | wygląd |
| Sortowanie kart, dodawanie / usuwanie kart | TaskBoard.js, AddTaskForm.js | struktura |
| Licznik „x/y zrobione” + pasek postępu | TaskBoard.js | nowe informacje |
| Zegar z datą | Clock.js | nowe informacje |
| Walidacja formularza + licznik znaków | AddTaskForm.js | nowe informacje |
| Potwierdzenie usunięcia (`confirm`) | ConfirmButton.js | nowe informacje |

### Backend
| Wymaganie | Realizacja |
|---|---|
| Online | Railway |
| Konta i uprawnienia | `register`, `login`, `logout` (bcrypt + iron-session), role `user`/`admin`, `requireUser()` / `requireAdmin()` |
| Prezentacja danych z bazy | lista zadań, plan tygodnia, lista użytkowników |
| Manipulacja danymi w bazie | `addTask`, `updateTask`, `toggleTask`, `deleteTask`, `setRole`, `deleteUser` |
| Prezentacja plików | `fs.readdir` + `fs.stat` (lista), `fs.readFile` (podgląd/edycja, pobieranie) |
| Manipulacja plikami | upload (`fs.writeFile`), nowa notatka, edycja `.txt/.md`, usuwanie (`fs.unlink`) |
| Biblioteki / frameworki | Next.js, React, better-sqlite3, bcryptjs, iron-session |

Przepływ: `<form action={addTask}>` → Server Action w `lib/actions.js` → zapytanie SQL z parametrami `?` → `revalidatePath` / `redirect`.

### Baza danych
```sql
users (id PK, login UNIQUE, password_hash, role CHECK IN ('user','admin'), created_at)
tasks (id PK, user_id FK → users.id ON DELETE CASCADE, title, description, deadline, done, created_at)
```
Relacja **users 1 — N tasks**. Podgląd i edycja: DB Browser for SQLite (plik `database.sqlite`).
