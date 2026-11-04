// Panel administratora: zarządzanie kontami i uprawnieniami
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { setRole, deleteUser } from '@/lib/actions';
import Flash from '@/components/Flash';
import ConfirmButton from '@/components/ConfirmButton';

export const metadata = { title: 'Panel admina' };

export default async function AdminPage({ searchParams }) {
  const admin = await requireAdmin();
  const { msg, error } = await searchParams;

  const users = getDb()
    .prepare(`
      SELECT u.id, u.login, u.role, u.created_at,
             COUNT(t.id) AS task_count
      FROM users u
      LEFT JOIN tasks t ON t.user_id = u.id
      GROUP BY u.id
      ORDER BY u.id
    `)
    .all();

  const admins = users.filter((u) => u.role === 'admin').length;

  return (
    <>
      <main className="content">
        <h1>Panel administratora</h1>
        <Flash msg={msg} error={error} />

        <section className="panel">
          <h2>Użytkownicy</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Login</th>
                  <th scope="col">Rola</th>
                  <th scope="col">Zadania</th>
                  <th scope="col">Utworzono</th>
                  <th scope="col">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.id === admin.id;
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        {u.login} {self && <mark className="badge">to Ty</mark>}
                      </td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td>{u.task_count}</td>
                      <td>{u.created_at.slice(0, 10)}</td>
                      <td>
                        {self ? (
                          <em>—</em>
                        ) : (
                          <div className="row-actions">
                            <form action={setRole} className="inline-form">
                              <input type="hidden" name="id" value={u.id} />
                              <select name="role" defaultValue={u.role} aria-label={`Rola użytkownika ${u.login}`}>
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                              <button type="submit" className="btn btn-small" data-tip="Zapisz nową rolę">Zmień</button>
                            </form>
                            <form action={deleteUser}>
                              <input type="hidden" name="id" value={u.id} />
                              <ConfirmButton
                                message={`Usunąć konto ${u.login} razem z zadaniami i plikami?`}
                                className="btn btn-small btn-danger"
                                tip="Usuń konto, zadania i pliki"
                              >
                                Usuń
                              </ConfirmButton>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <aside className="sidebar">
        <section className="panel">
          <h2>Statystyki</h2>
          <ul className="stats">
            <li><span>Kont</span> <strong>{users.length}</strong></li>
            <li><span>Administratorów</span> <strong>{admins}</strong></li>
            <li><span>Zadań łącznie</span> <strong>{users.reduce((s, u) => s + u.task_count, 0)}</strong></li>
          </ul>
        </section>
        <section className="panel">
          <h2>Role</h2>
          <dl className="roles">
            <dt><span className="badge badge-user">user</span></dt>
            <dd>własne zadania i pliki</dd>
            <dt><span className="badge badge-admin">admin</span></dt>
            <dd>dodatkowo zarządzanie kontami</dd>
          </dl>
        </section>
      </aside>
    </>
  );
}
