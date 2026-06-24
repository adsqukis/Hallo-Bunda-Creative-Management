import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Monitoring from './pages/Monitoring.jsx'
import Calendar from './pages/Calendar.jsx'
import Evaluation from './pages/Evaluation.jsx'
import Requests from './pages/Requests.jsx'
import Login from './pages/Login.jsx'

const NAV_ITEMS = [
  { to: '/monitoring', label: 'Monitoring' },
  { to: '/kalender', label: 'Kalender Konten' },
  { to: '/evaluasi', label: 'Evaluasi' },
  { to: '/permintaan', label: 'Permintaan Konten' },
]

function ProtectedShell() {
  const isAuthed = !!localStorage.getItem('hb_token')
  if (!isAuthed) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Hallo Bunda</div>
        <div className="sidebar-sub">CONTENT OPS · WEEKLY INPUT</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-dot" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="btn"
          style={{ marginTop: 'auto', background: 'transparent', color: '#C9C6BB', borderColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => { localStorage.removeItem('hb_token'); window.location.href = '/login' }}
        >
          Keluar
        </button>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/monitoring" replace />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/kalender" element={<Calendar />} />
          <Route path="/evaluasi" element={<Evaluation />} />
          <Route path="/permintaan" element={<Requests />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  )
}
