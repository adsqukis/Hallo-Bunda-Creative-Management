import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Overview from './pages/Overview.jsx'
import InputLaporan from './pages/InputLaporan.jsx'
import Calendar from './pages/Calendar.jsx'
import Requests from './pages/Requests.jsx'
import KPI from './pages/KPI.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview' },
  { to: '/input-laporan', label: 'Input Laporan' },
  { to: '/kalender', label: 'Kalender Konten' },
  { to: '/permintaan', label: 'Permintaan Konten' },
]

function ProtectedShell() {
  const isAuthed = !!localStorage.getItem('hb_token')
  if (!isAuthed) return <Navigate to="/login" replace />

  const hbUser = JSON.parse(localStorage.getItem('hb_user') || '{}')
  const isAdmin = hbUser.role === 'admin'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Hallo Bunda</div>
        <div className="sidebar-sub">CONTENT OPS</div>
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
          {isAdmin && (
            <>
              <NavLink
                to="/kpi"
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}
              >
                <span className="sidebar-dot" style={{ opacity: 0.8 }} />
                KPI
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-dot" style={{ opacity: 0.8 }} />
                Settings
              </NavLink>
            </>
          )}
        </nav>
        <div style={{ marginTop: 'auto', fontSize: 11, color: '#8A887F', marginBottom: 8, fontFamily: 'IBM Plex Mono, monospace' }}>
          {hbUser.username || ''}
        </div>
        <button
          className="btn"
          style={{ background: 'transparent', color: '#C9C6BB', borderColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => { localStorage.removeItem('hb_token'); localStorage.removeItem('hb_user'); window.location.href = '/login' }}
        >
          Keluar
        </button>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/input-laporan" element={<InputLaporan />} />
          <Route path="/kalender" element={<Calendar />} />
          <Route path="/permintaan" element={<Requests />} />
          {isAdmin && <Route path="/kpi" element={<KPI />} />}
          {isAdmin && <Route path="/settings" element={<Settings />} />}
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
