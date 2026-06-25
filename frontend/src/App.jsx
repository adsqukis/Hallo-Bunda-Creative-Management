import { useState } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Overview from './pages/Overview.jsx'
import InputLaporan from './pages/InputLaporan.jsx'
import Calendar from './pages/Calendar.jsx'
import Requests from './pages/Requests.jsx'
import KPI from './pages/KPI.jsx'
import Settings from './pages/Settings.jsx'
import Guide from './pages/Guide.jsx'
import Login from './pages/Login.jsx'

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: 'overview' },
  { to: '/input-laporan', label: 'Input Laporan', icon: 'input' },
  { to: '/kalender', label: 'Kalender Konten', icon: 'calendar' },
  { to: '/permintaan', label: 'Permintaan Konten', icon: 'requests' },
]

/* SVG Icons */
function SvgIcon({ name }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flexShrink: 0 } }
  switch (name) {
    case 'overview':
      return <svg {...props}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
    case 'input':
      return <svg {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    case 'calendar':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'requests':
      return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
    case 'kpi':
      return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    case 'settings':
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    default:
      return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>
  }
}

function ProtectedShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuthed = !!localStorage.getItem('hb_token')
  if (!isAuthed) return <Navigate to="/login" replace />

  const hbUser = JSON.parse(localStorage.getItem('hb_user') || '{}')
  const isAdmin = hbUser.role === 'admin'

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div>
            <div className="sidebar-brand">Hallo Bunda</div>
            <div className="sidebar-sub">CONTENT OPS</div>
          </div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={closeSidebar}
            >
              <SvgIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <NavLink
                to="/kpi"
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}
                onClick={closeSidebar}
              >
                <SvgIcon name="kpi" />
                KPI
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                onClick={closeSidebar}
              >
                <SvgIcon name="settings" />
                Settings
              </NavLink>
            </>
          )}
        </nav>
        <nav className="sidebar-nav sidebar-nav-footer">
          <NavLink
            to="/panduan"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Penggunaan
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">{hbUser.username || ''}</span>
          <button
            className="btn"
            style={{ background: 'transparent', color: '#C9C6BB', borderColor: 'rgba(255,255,255,0.15)', width: '100%', marginTop: 8 }}
            onClick={() => { localStorage.removeItem('hb_token'); localStorage.removeItem('hb_user'); window.location.href = '/login' }}
          >
            Keluar
          </button>
        </div>
      </aside>
      <main className="main">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
            <span /><span /><span />
          </button>
          <span className="mobile-brand">Hallo Bunda</span>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/input-laporan" element={<InputLaporan />} />
          <Route path="/kalender" element={<Calendar />} />
          <Route path="/permintaan" element={<Requests />} />
          {isAdmin && <Route path="/kpi" element={<KPI />} />}
          {isAdmin && <Route path="/settings" element={<Settings />} />}
          <Route path="/panduan" element={<Guide />} />
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
