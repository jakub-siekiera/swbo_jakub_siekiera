// Dashboard: zadania zalogowanego użytkownika (dane z bazy)
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Flash from '@/components/Flash';
import Clock from '@/components/Clock';
import TaskBoard from '@/components/TaskBoard';
import AddTaskForm from '@/components/AddTaskForm';

export const metadata = { title: 'Zadania' };

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Tabela „Plan tygodnia”: dni bieżącego tygodnia + zadania z terminem w danym dniu
function weekPlan(tasks) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return DAYS.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = iso(d);
    return { name, date, isToday: date === iso(now), tasks: tasks.filter((t) => t.deadline === date) };
  });
}

export default async function HomePage({ searchParams }) {
  const user = await requireUser();
  const { msg, error, filter } = await searchParams;

  const today = iso(new Date());
  const tasks = getDb()
    .prepare('SELECT id, title, description, deadline, done FROM tasks WHERE user_id = ? ORDER BY deadline')
    .all(user.id)
    .map((t) => ({ ...t, overdue: !t.done && !!t.deadline && t.deadline < today }));

  const week = weekPlan(tasks);
  const overdue = tasks.filter((t) => t.overdue).length;

  return (
    <>
      <main className="content">
        <section className="hero">
          <h1>Cześć, {user.login}!</h1>
          <Clock />
        </section>

        <Flash msg={msg} error={error} />

        <section id="tasks" className="panel">
          <h2>Twoje zadania</h2>
          <TaskBoard tasks={tasks} initialShowDone={filter !== 'todo'} />
        </section>

        <section id="add-task" className="panel">
          <h2>Dodaj zadanie</h2>
          <AddTaskForm />
        </section>
      </main>

      <aside className="sidebar">
        <section className="panel">
          <h2>Plan tygodnia</h2>
          <div className="table-wrap">
            <table className="table">
              <caption>Zadania z terminem w bieżącym tygodniu</caption>
              <thead>
                <tr>
                  <th scope="col">Dzień</th>
                  <th scope="col">Data</th>
                  <th scope="col">Zadania</th>
                </tr>
              </thead>
              <tbody>
                {week.map((day) => (
                  <tr key={day.date} className={day.isToday ? 'is-today' : undefined}>
                    <th scope="row">{day.name}</th>
                    <td><time dateTime={day.date}>{day.date.slice(5)}</time></td>
                    <td>
                      {day.tasks.length === 0
                        ? '—'
                        : day.tasks.map((t) => (
                            <span key={t.id} className={`chip${t.done ? ' chip--done' : ''}`}>{t.title}</span>
                          ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Podsumowanie</h2>
          <ul className="stats">
            <li><span>Wszystkie</span> <strong>{tasks.length}</strong></li>
            <li><span>Ukończone</span> <strong>{tasks.filter((t) => t.done).length}</strong></li>
            <li><span>Po terminie</span> <strong className={overdue ? 'text-danger' : undefined}>{overdue}</strong></li>
          </ul>
        </section>

        <section className="panel">
          <h2>Jak się uczyć?</h2>
          <ol className="tips">
            <li>Dziel duże tematy na <strong>małe</strong> zadania.</li>
            <li>Ustaw <em>realny</em> termin.</li>
            <li>Odhaczaj zrobione – licznik pokaże postęp.</li>
          </ol>
        </section>
      </aside>
    </>
  );
}
