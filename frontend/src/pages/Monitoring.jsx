import { useEffect, useState } from 'react'
import { api, PLATFORMS, getISOWeek } from '../api/client.js'
import PlatformBadge from '../components/PlatformBadge.jsx'

const emptyForm = {
  platform: 'instagram',
  title: '',
  url: '',
  publish_date: new Date().toISOString().slice(0, 10),
  views: '', likes: '', comments: '', shares: '', reach: '', impressions: '',
  created_by: ''
}

export default function Monitoring() {
  const currentWeek = getISOWeek()
  const [week, setWeek] = useState(currentWeek)
  const [platformFilter, setPlatformFilter] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})

  async function loadPosts() {
    setLoading(true)
    try {
      const params = { week }
      if (platformFilter) params.platform = platformFilter
      const res = await api.get('/posts', { params })
      setPosts(res.data)
    } catch (err) {
      setError('Gagal memuat data. Cek koneksi server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPosts() }, [week, platformFilter])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/posts', {
        ...form,
        views: Number(form.views) || 0,
        likes: Number(form.likes) || 0,
        comments: Number(form.comments) || 0,
        shares: Number(form.shares) || 0,
        reach: Number(form.reach) || 0,
        impressions: Number(form.impressions) || 0,
        input_week: week
      })
      setForm(emptyForm)
      setShowForm(false)
      loadPosts()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus data ini?')) return
    await api.delete(`/posts/${id}`)
    loadPosts()
  }

  function startEdit(p) {
    setEditingId(p.id)
    setEditValues({ views: p.views, likes: p.likes, comments: p.comments, shares: p.shares })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValues({})
  }

  async function saveEdit(id) {
    const vals = {}
    for (const key of ['views', 'likes', 'comments', 'shares']) {
      const n = Number(editValues[key])
      if (Number.isNaN(n) || n < 0) {
        setError(`Nilai ${key} harus angka 0 atau lebih.`)
        return
      }
      vals[key] = n
    }
    try {
      await api.put(`/posts/${id}`, vals)
      setEditingId(null)
      setError('')
      loadPosts()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan perubahan')
    }
  }

  const totals = posts.reduce((acc, p) => ({
    views: acc.views + Number(p.views),
    likes: acc.likes + Number(p.likes),
    comments: acc.comments + Number(p.comments),
    shares: acc.shares + Number(p.shares),
  }), { views: 0, likes: 0, comments: 0, shares: 0 })

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Input manual · {week}</div>
          <h1 className="page-title">Monitoring</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="week"
            value={week.replace('-W', '-W')}
            onChange={e => setWeek(e.target.value)}
            style={{ width: 160 }}
          />
          <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">Semua Platform</option>
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Input Data</button>
        </div>
      </div>

      <div className="grid-cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <StatCard label="Total Views" value={totals.views} />
        <StatCard label="Total Likes" value={totals.likes} />
        <StatCard label="Total Comments" value={totals.comments} />
        <StatCard label="Total Shares" value={totals.shares} />
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            Belum ada data untuk minggu {week}.<br />
            Input data postingan minggu ini untuk mulai memantau performa.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Judul</th>
                <th>Tanggal</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => {
                const isEditing = editingId === p.id
                return (
                  <tr key={p.id}>
                    <td><PlatformBadge value={p.platform} /></td>
                    <td>{p.url ? <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{p.title}</a> : p.title}</td>
                    <td>{p.publish_date?.slice(0, 10)}</td>
                    {['views', 'likes', 'comments', 'shares'].map(key => (
                      <td key={key}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editValues[key]}
                            onChange={e => setEditValues({ ...editValues, [key]: e.target.value })}
                            style={{ width: 90, padding: '5px 8px' }}
                          />
                        ) : (
                          <span className="metric">{Number(p[key]).toLocaleString('id-ID')}</span>
                        )}
                      </td>
                    ))}
                    <td style={{ display: 'flex', gap: 6 }}>
                      {isEditing ? (
                        <>
                          <button type="button" className="btn btn-primary" onClick={() => saveEdit(p.id)} style={{ fontSize: 12, padding: '5px 10px' }}>Simpan</button>
                          <button type="button" className="btn" onClick={cancelEdit} style={{ fontSize: 12, padding: '5px 10px' }}>Batal</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="btn" onClick={() => startEdit(p)} style={{ fontSize: 12, padding: '5px 10px' }}>Edit</button>
                          <button type="button" className="btn" onClick={() => handleDelete(p.id)} style={{ fontSize: 12, padding: '5px 10px' }}>Hapus</button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-title">Input Data Postingan</div>

            {error && <div style={{ color: '#B91C1C', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div className="field">
              <label>Platform</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Judul Postingan</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Misal: Tips skincare untuk kulit kering" />
            </div>

            <div className="field">
              <label>URL (opsional)</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>

            <div className="field">
              <label>Tanggal Publish</label>
              <input required type="date" value={form.publish_date} onChange={e => setForm({ ...form, publish_date: e.target.value })} />
            </div>

            <div className="grid-cols" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Views</label>
                <input type="number" min="0" value={form.views} onChange={e => setForm({ ...form, views: e.target.value })} />
              </div>
              <div className="field">
                <label>Likes</label>
                <input type="number" min="0" value={form.likes} onChange={e => setForm({ ...form, likes: e.target.value })} />
              </div>
              <div className="field">
                <label>Comments</label>
                <input type="number" min="0" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} />
              </div>
              <div className="field">
                <label>Shares</label>
                <input type="number" min="0" value={form.shares} onChange={e => setForm({ ...form, shares: e.target.value })} />
              </div>
              <div className="field">
                <label>Reach</label>
                <input type="number" min="0" value={form.reach} onChange={e => setForm({ ...form, reach: e.target.value })} />
              </div>
              <div className="field">
                <label>Impressions</label>
                <input type="number" min="0" value={form.impressions} onChange={e => setForm({ ...form, impressions: e.target.value })} />
              </div>
            </div>

            <div className="field">
              <label>Diinput oleh</label>
              <input value={form.created_by} onChange={e => setForm({ ...form, created_by: e.target.value })} placeholder="Nama kamu" />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card">
      <div className="page-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600 }}>
        {value.toLocaleString('id-ID')}
      </div>
    </div>
  )
}

