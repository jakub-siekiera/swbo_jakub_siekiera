'use client';
// Lista zadań z mechanizmami JS:
//  • WIDOCZNOŚĆ  – przycisk „Pokaż / ukryj ukończone”
//  • STRUKTURA   – sortowanie kart (zmiana kolejności elementów w DOM)
//  • NOWE INFO   – licznik „x/y zrobione” + pasek postępu
import { useMemo, useState } from 'react';
import TaskCard from './TaskCard';

const SORTERS = {
  deadline: (a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'),
  title: (a, b) => a.title.localeCompare(b.title, 'pl'),
  status: (a, b) => a.done - b.done,
};

export default function TaskBoard({ tasks, initialShowDone = true }) {
  const [showDone, setShowDone] = useState(initialShowDone);
  const [sortBy, setSortBy] = useState('deadline');

  const doneCount = tasks.filter((t) => t.done).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const visible = useMemo(
    () => tasks.filter((t) => showDone || !t.done).sort(SORTERS[sortBy]),
    [tasks, showDone, sortBy]
  );

  return (
    <div className="task-board">
      <div className="toolbar">
        <p className="counter" data-tip="Postęp liczony ze wszystkich Twoich zadań">
          <strong>{doneCount}/{tasks.length}</strong> zadań zrobionych
          <progress value={doneCount} max={tasks.length || 1}>{percent}%</progress>
          <span className="counter__pct">{percent}%</span>
        </p>

        <div className="toolbar__controls">
          <button
            type="button"
            className="btn btn-ghost"
            aria-pressed={!showDone}
            onClick={() => setShowDone((s) => !s)}
          >
            {showDone ? 'Ukryj ukończone' : 'Pokaż ukończone'}
          </button>

          <label className="inline-label">
            Sortuj:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="deadline">wg terminu</option>
              <option value="title">wg nazwy</option>
              <option value="status">wg statusu</option>
            </select>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty">
          {tasks.length === 0 ? 'Nie masz jeszcze zadań. Dodaj pierwsze poniżej.' : 'Wszystkie widoczne zadania są ukończone. 🎉'}
        </p>
      ) : (
        <div className="task-grid">
          {visible.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
