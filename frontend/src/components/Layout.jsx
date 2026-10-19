import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Care<span>Desk</span>
        </div>
        <nav className="nav">
          <NavLink to="/patients" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Patients
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Doctors
          </NavLink>
          <NavLink to="/mappings" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Mappings
          </NavLink>
        </nav>
        <div className="user-meta">
          <span>{user?.name || user?.email}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
