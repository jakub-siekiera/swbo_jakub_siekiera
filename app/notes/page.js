// Notatki i załączniki: pliki zapisane na serwerze w uploads/<id użytkownika>/
import fs from 'node:fs/promises';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { ALLOWED_EXT, filePath, formatSize, isEditable, listFiles, safeName } from '@/lib/files';
import { uploadFile, createNote, saveNote, deleteFile } from '@/lib/actions';
import Flash from '@/components/Flash';
import ConfirmButton from '@/components/ConfirmButton';

export const metadata = { title: 'Notatki' };

export default async function NotesPage({ searchParams }) {
  const user = await requireUser();
  const { msg, error, edit } = await searchParams;

  const files = await listFiles(user.id); // fs.readdir
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  // Tryb edycji notatki tekstowej (fs.readFile)
  let editing = null;
  if (edit && isEditable(safeName(edit))) {
    const content = await fs.readFile(filePath(user.id, edit), 'utf8').catch(() => null);
    if (content !== null) editing = { name: safeName(edit), content };
  }

  return (
    <>
      <main className="content">
        <h1>Notatki i załączniki</h1>
        <Flash msg={msg} error={error} />

        {editing && (
          <section className="panel panel--accent">
            <h2>Edycja: <code>{editing.name}</code></h2>
            <form action={saveNote} className="form">
              <input type="hidden" name="name" value={editing.name} />
              <label>
                Treść
                <textarea name="content" rows={12} defaultValue={editing.content} />
              </label>
              <div className="form-row">
                <button type="submit" className="btn">Zapisz zmiany</button>
                <Link href="/notes" className="btn btn-ghost">Anuluj</Link>
              </div>
            </form>
          </section>
        )}

        <section className="panel">
          <h2>Moje pliki</h2>
          {files.length === 0 ? (
            <p className="empty">Brak plików. Wgraj pierwszy albo utwórz notatkę.</p>
          ) : (
            <ul className="file-list">
              {files.map((f) => (
                <li key={f.name} className="file-item">
                  <img src="/img/file.svg" alt="Ikona pliku" width="32" height="32" title={`Plik ${f.name}`} />
                  <div className="file-item__info">
                    <a href={`/notes/download/${encodeURIComponent(f.name)}`} className="file-item__name" title="Pobierz plik">
                      {f.name}
                    </a>
                    <small>
                      {formatSize(f.size)} · zmieniony {new Date(f.modified).toLocaleString('pl-PL')}
                    </small>
                  </div>
                  <div className="file-item__actions">
                    {f.editable && (
                      <Link href={`/notes?edit=${encodeURIComponent(f.name)}`} className="btn btn-small btn-ghost" data-tip="Edytuj treść notatki">
                        Edytuj
                      </Link>
                    )}
                    <form action={deleteFile}>
                      <input type="hidden" name="name" value={f.name} />
                      <ConfirmButton message={`Usunąć plik ${f.name}?`} className="btn btn-small btn-danger" tip="Usuń plik z serwera">
                        Usuń
                      </ConfirmButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="two-cols">
          <section id="upload" className="panel">
            <h2>Wgraj plik</h2>
            <form action={uploadFile} className="form">
              <label>
                Plik
                <input type="file" name="file" accept={ALLOWED_EXT.join(',')} required />
              </label>
              <button type="submit" className="btn">Wgraj</button>
            </form>
          </section>

          <section id="new-note" className="panel">
            <h2>Nowa notatka</h2>
            <form action={createNote} className="form">
              <label>
                Nazwa pliku
                <input name="name" placeholder="np. css-notatki.txt" required maxLength={60} />
              </label>
              <label>
                Treść
                <textarea name="content" rows={4} />
              </label>
              <button type="submit" className="btn">Utwórz</button>
            </form>
          </section>
        </div>
      </main>

      <aside className="sidebar">
        <section className="panel">
          <h2>Informacje</h2>
          <ul className="stats">
            <li><span>Liczba plików</span> <strong>{files.length}</strong></li>
            <li><span>Zajęte miejsce</span> <strong>{formatSize(totalSize)}</strong></li>
          </ul>
          <p>
            Dozwolone typy: <code>{ALLOWED_EXT.join(' ')}</code>. Maksymalny rozmiar: <strong>4&nbsp;MB</strong>.
          </p>
          <p>
            Pliki <code>.txt</code> i <code>.md</code> można edytować w przeglądarce.
          </p>
        </section>
      </aside>
    </>
  );
}
