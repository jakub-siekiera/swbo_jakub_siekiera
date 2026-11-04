// Element powtarzalny: karta zadania <article class="task-card">
// Styl .task-card jest zdefiniowany RAZ w globals.css i używany przez wszystkie karty.
import { toggleTask, updateTask, deleteTask } from '@/lib/actions';
import ConfirmButton from './ConfirmButton';

export default function TaskCard({ task }) {
  const classes = ['task-card'];
  if (task.done) classes.push('is-done');
  if (task.overdue) classes.push('is-overdue');

  return (
    <article className={classes.join(' ')}>
      <header className="task-card__head">
        <img
          src={task.done ? '/img/done.svg' : '/img/todo.svg'}
          alt={task.done ? 'Zadanie ukończone' : 'Zadanie do zrobienia'}
          title={task.done ? 'Ukończone' : 'Do zrobienia'}
          width="24"
          height="24"
        />
        <h3 className="task-card__title">{task.title}</h3>
      </header>

      {task.description && <p className="task-card__desc">{task.description}</p>}

      <p className="task-card__meta">
        {task.deadline ? (
          <>
            Termin: <time dateTime={task.deadline}>{task.deadline}</time>
          </>
        ) : (
          <em>bez terminu</em>
        )}
        {task.overdue && <mark className="badge badge-danger">po terminie</mark>}
      </p>

      <footer className="task-card__actions">
        <form action={toggleTask}>
          <input type="hidden" name="id" value={task.id} />
          <button type="submit" className="btn btn-small" data-tip="Zmień status zadania">
            {task.done ? 'Cofnij' : 'Zrobione'}
          </button>
        </form>

        <form action={deleteTask}>
          <input type="hidden" name="id" value={task.id} />
          <ConfirmButton message={`Usunąć zadanie „${task.title}”?`} className="btn btn-small btn-danger" tip="Usuń zadanie na stałe">
            Usuń
          </ConfirmButton>
        </form>

        <details className="task-card__edit">
          <summary className="btn btn-small btn-ghost" title="Edytuj treść zadania">Edytuj</summary>
          <form action={updateTask} className="form form-compact">
            <input type="hidden" name="id" value={task.id} />
            <label>
              Tytuł
              <input name="title" defaultValue={task.title} required minLength={3} maxLength={80} />
            </label>
            <label>
              Opis
              <textarea name="description" defaultValue={task.description} rows={2} maxLength={500} />
            </label>
            <label>
              Termin
              <input type="date" name="deadline" defaultValue={task.deadline || ''} />
            </label>
            <button type="submit" className="btn btn-small">Zapisz</button>
          </form>
        </details>
      </footer>
    </article>
  );
}
