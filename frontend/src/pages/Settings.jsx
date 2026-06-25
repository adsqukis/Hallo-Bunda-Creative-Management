import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

function KpiTargets() {
  const [platforms, setPlatforms] = useState([])
  const [targets, setTargets] = useState([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [editing, setEditing] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/platforms').then(res => setPlatforms(res.data)).catch(() => {})
    loadTargets()
  }, [month, year])

  async function loadTargets() {
    try {
      const res = await api.get('/targets', { params: { month, year } })
      setTargets(res.data)
    } catch (err) { console.error(err) }
  }

  async function handleSave(platformId, metricKey, value) {
    setSaving(true)
    try {
      await api.post('/targets', { platform_id: platformId, metric_key: metricKey, month, year, target_value: value })
      setEditing(prev => ({ ...prev, [`${platformId}-${metricKey}`]: false }))
      loadTargets()
    } catch (err) { alert(err.response?.data?.error || 'Gagal') }
    finally { setSaving(false) }
  }

  function getTarget(platformId, metricKey) {
    const p = targets.find(t => t.platform_id === platformId)
    return p?.targets?.find(t => t.metric_key === metricKey)
  }

  return (
    <div>
      <div className="page-eyebrow" style={{ marginBottom: 12 }}>Target KPI · Bulanan</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{ width: 120 }}>
          {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((n, i) =>
            <option key={i} value={i + 1}>{n}</option>
          )}
        </select>
        <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ width: 80 }} />
      </div>

      {platforms.map(p => (
        <div key={p.id} className="card" style={{ marginBottom: 12, padding: '14px 18px' }}>
          <div style={{ fontWeight: 600, marginBottom: 10, color: '#333' }}>{p.icon} {p.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {p.metrics.map(m => {
              const existing = getTarget(p.id, m.metric_key)
              const isEditing = editing[`${p.id}-${m.metric_key}`]
              const val = existing?.target_value ?? ''

              return (
                <div key={m.metric_key} style={{ fontSize: 13 }}>
                  <label style={{ fontSize: 10, marginBottom: 2 }}>{m.metric_label}</label>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        type="number"
                        defaultValue={val}
                        style={{ width: 80, fontSize: 12, padding: '4px 6px' }}
                        id={`input-${p.id}-${m.metric_key}`}
                      />
                      <button className="btn" style={{ fontSize: 11, padding: '3px 8px' }} disabled={saving}
                        onClick={() => {
                          const el = document.getElementById(`input-${p.id}-${m.metric_key}`)
                          handleSave(p.id, m.metric_key, el.value)
                        }}>
                        OK
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{val !== '' ? Number(val).toLocaleString('id-ID') : '—'}</strong>
                      <button className="btn" style={{ fontSize: 10, padding: '2px 6px' }}
                        onClick={() => setEditing(prev => ({ ...prev, [`${p.id}-${m.metric_key}`]: true }))}>
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function PlatformManager() {
  const [platforms, setPlatforms] = useState([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('')

  useEffect(() => { api.get('/platforms').then(r => setPlatforms(r.data)).catch(() => {}) }, [])

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await api.post('/platforms', { name, slug, icon })
      setName(''); setSlug(''); setIcon('')
      const res = await api.get('/platforms')
      setPlatforms(res.data)
    } catch (err) { alert(err.response?.data?.error || 'Gagal') }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus platform?')) return
    try {
      await api.delete(`/platforms/${id}`)
      setPlatforms(prev => prev.filter(p => p.id !== id))
    } catch (err) { alert('Gagal') }
  }

  return (
    <div>
      <div className="page-eyebrow" style={{ marginBottom: 12 }}>Platform</div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Nama" value={name} onChange={e => setName(e.target.value)} required style={{ width: 140 }} />
        <input type="text" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} required style={{ width: 120 }} />
        <input type="text" placeholder="Icon" value={icon} onChange={e => setIcon(e.target.value)} style={{ width: 60 }} />
        <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>Tambah</button>
      </form>

      <div className="table-wrap"><table>
        <thead><tr><th>Icon</th><th>Nama</th><th>Slug</th><th>Metrik</th><th></th></tr></thead>
        <tbody>
          {platforms.map(p => (
            <tr key={p.id}>
              <td>{p.icon}</td>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td style={{ color: 'var(--muted)', fontSize: 12 }}>{p.slug}</td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{p.metrics?.length || 0} metrik</td>
              <td><button className="btn" style={{ fontSize: 11, padding: '3px 8px', color: '#DC2626' }} onClick={() => handleDelete(p.id)}>Hapus</button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  )
}

function UserManager() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member')
  const [editPw, setEditPw] = useState(null)
  const [newPw, setNewPw] = useState('')

  const currentUser = JSON.parse(localStorage.getItem('hb_user') || '{}')

  useEffect(() => { api.get('/users').then(r => setUsers(r.data)).catch(() => {}) }, [])

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await api.post('/users', { username, password, role })
      setUsername(''); setPassword(''); setRole('member'); setShowForm(false)
      const res = await api.get('/users'); setUsers(res.data)
    } catch (err) { alert(err.response?.data?.error || 'Gagal') }
  }

  async function handleChangePw(id) {
    if (!newPw || newPw.length < 6) { alert('Min 6 karakter'); return }
    try {
      await api.patch(`/users/${id}/password`, { password: newPw })
      setEditPw(null); setNewPw('')
    } catch (err) { alert(err.response?.data?.error || 'Gagal') }
  }

  async function handleDelete(id, uname) {
    if (!confirm(`Hapus ${uname}?`)) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) { alert(err.response?.data?.error || 'Gagal') }
  }

  return (
    <div>
      <div className="page-eyebrow" style={{ marginBottom: 12 }}>User Management</div>
      <button className="btn btn-primary" style={{ marginBottom: 16, fontSize: 12 }} onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Batal' : '+ Tambah User'}
      </button>

      {showForm && (
        <div className="card" style={{ marginBottom: 16, maxWidth: 360, padding: 16 }}>
          <form onSubmit={handleAdd}>
            <div className="field"><label>Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} required /></div>
            <div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <div className="field"><label>Role</label><select value={role} onChange={e => setRole(e.target.value)}><option value="member">Member</option><option value="admin">Admin</option></select></div>
            <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>Simpan</button>
          </form>
        </div>
      )}

      <div className="table-wrap"><table>
        <thead><tr><th>Username</th><th>Role</th><th>Dibuat</th><th></th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ fontWeight: 600 }}>{u.username}</td>
              <td><span className="badge" style={u.role === 'admin' ? { background: '#FDEAE5', color: '#F2604C' } : { background: '#E8F4FD', color: '#2563EB' }}>{u.role === 'admin' ? 'Admin' : 'Member'}</span></td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => { setEditPw(editPw === u.id ? null : u.id); setNewPw('') }}>Ganti Password</button>
                  {u.username !== currentUser.username && (
                    <button className="btn" style={{ fontSize: 11, padding: '3px 8px', color: '#DC2626' }} onClick={() => handleDelete(u.id, u.username)}>Hapus</button>
                  )}
                </div>
                {editPw === u.id && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Password baru" style={{ width: 130, fontSize: 12, padding: '4px 6px' }} />
                    <button className="btn btn-primary" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => handleChangePw(u.id)}>Simpan</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('targets')

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Administrasi</div>
          <h1 className="page-title">Settings</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'targets', label: 'Target KPI' },
            { key: 'platforms', label: 'Platform' },
            { key: 'users', label: 'Users' },
          ].map(t => (
            <button
              key={t.key}
              className={`btn ${tab === t.key ? 'btn-primary' : ''}`}
              style={{ fontSize: 12 }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'targets' && <KpiTargets />}
      {tab === 'platforms' && <PlatformManager />}
      {tab === 'users' && <UserManager />}
    </div>
  )
}
