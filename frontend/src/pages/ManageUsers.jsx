import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Ganti password state
  const [editPasswordId, setEditPasswordId] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('hb_user') || '{}')

  async function loadUsers() {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      setError('Gagal memuat data user')
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/users', { username, password, role })
      setUsername('')
      setPassword('')
      setRole('member')
      setShowForm(false)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menambahkan user')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(id) {
    if (!newPassword || newPassword.length < 6) {
      alert('Password minimal 6 karakter')
      return
    }
    setPwLoading(true)
    try {
      await api.patch(`/users/${id}/password`, { password: newPassword })
      setEditPasswordId(null)
      setNewPassword('')
      alert('Password berhasil diubah')
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengubah password')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDelete(id, uname) {
    if (!confirm(`Hapus user "${uname}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus user')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Administrasi</div>
          <div className="page-title">Manajemen User</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '+ Tambah User'}
        </button>
      </div>

      {error && <div style={{ color: '#B91C1C', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 400 }}>
          <div className="modal-title">Tambah User Baru</div>
          <form onSubmit={handleAdd}>
            <div className="field">
              <label>Username</label>
              <input
                type="text" required autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Minimal 3 karakter"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password" required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Dibuat Oleh</th>
              <th>Tanggal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">Belum ada user</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td>
                  <span className="badge" style={u.role === 'admin' ? { background: '#FDEAE5', color: '#F2604C' } : { background: '#E8F4FD', color: '#2563EB' }}>
                    {u.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </td>
                <td style={{ color: 'var(--muted)' }}>{u.created_by || '-'}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={() => {
                        setEditPasswordId(editPasswordId === u.id ? null : u.id)
                        setNewPassword('')
                      }}
                    >
                      Ganti Password
                    </button>
                    {u.username !== currentUser.username && (
                      <button
                        className="btn"
                        style={{ borderColor: '#FCA5A5', color: '#DC2626', fontSize: 12, padding: '4px 10px' }}
                        onClick={() => handleDelete(u.id, u.username)}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {editPasswordId === u.id && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Password baru (min 6)"
                        style={{ width: 160, fontSize: 13, padding: '6px 10px' }}
                        autoFocus
                      />
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: '6px 12px' }}
                        disabled={pwLoading}
                        onClick={() => handleChangePassword(u.id)}
                      >
                        {pwLoading ? '...' : 'Simpan'}
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => { setEditPasswordId(null); setNewPassword('') }}
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
