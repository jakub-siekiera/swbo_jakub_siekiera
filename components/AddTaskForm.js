'use client';
// Formularz dodawania zadania.
// JS – NOWE INFORMACJE: walidacja z komunikatem + licznik znaków tytułu.
// Po poprawnej walidacji dane trafiają do akcji serwerowej addTask (INSERT do bazy).
import { useRef, useState } from 'react';
import { addTask } from '@/lib/actions';

const MAX_TITLE = 80;

export default function AddTaskForm() {
  const formRef = useRef(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  function validate(fd) {
    const t = String(fd.get('title')).trim();
    const deadline = String(fd.get('deadline'));
    if (t.length < 3) return 'Tytuł musi mieć co najmniej 3 znaki.';
    if (deadline) {
      const today = new Date().toISOString().slice(0, 10);
      if (deadline < today) return 'Termin nie może być w przeszłości.';
    }
    return null;
  }

  async function submit(fd) {
    const error = validate(fd);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }
    setPending(true);
    const result = await addTask(fd);
    setPending(false);
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
      return;
    }
    formRef.current.reset();
    setTitle('');
    setMessage({ type: 'ok', text: 'Dodano zadanie.' });
  }

  return (
    <form ref={formRef} action={submit} className="form" noValidate>
      <label>
        <span>
          Tytuł <span className="req" title="Pole wymagane">*</span>
        </span>
        <input
          name="title"
          value={title}
          maxLength={MAX_TITLE}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="np. Powtórzyć Flexbox"
        />
        <small className="hint">{title.length}/{MAX_TITLE} znaków</small>
      </label>

      <label>
        Opis
        <textarea name="description" rows={3} maxLength={500} placeholder="Szczegóły (opcjonalnie)" />
      </label>

      <label>
        Termin
        <input type="date" name="deadline" />
      </label>

      {message && (
        <p className={`form-msg form-msg--${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Zapisywanie…' : 'Dodaj zadanie'}
      </button>
    </form>
  );
}
