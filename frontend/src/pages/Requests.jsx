import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const emptyForm = {
  title: '', type: 'design', description: '',
  requested_by: '', assigned_to: '', deadline: '', priority: 'medium'
}

const COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' }
]

const TYPE_LABEL = { design: 'Design', video: 'Video', artikel: 'Artikel', lainnya: 'Lainnya' }

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadRequests() {
    setLoading(true)
    try {
      const res = await api.get('/requests')
      setRequests(res.data)
    } catch (err) {
      setError('Gagal memuat data permintaan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/requests', { ...form, deadline: form.deadline || null })
      setForm(emptyForm)
      setShowForm(false)
      loadRequests()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan permintaan')
    } finally {
      setSaving(false)
    }
  }

  async function moveStatus(id, status) {
    await api.put(`/requests/${id}`, { status })
    loadRequests()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus permintaan ini?')) return
    await api.delete(`/requests/${id}`)
    loadRequests()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Design & Video Requests</div>
          <h1 className="page-title">Permintaan Konten</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Buat Permintaan</button>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state">Memuat...</div></div>
      ) : (
        <div className="kanban">
          {COLUMNS.map(col => {
            const colItems = requests.filter(r => r.status === col.key)
            return (
              <div key={col.key}>
                <div className="kanban-col-title">{col.label} · {colItems.length}</div>
                {colItems.length === 0 ? (
                  <div className="card" style={{ padding: 16 }}>
                    <div className="empty-state" style={{ padding: 8, fontSize: 12 }}>Kosong</div>
                  </div>
                ) : colItems.map(r => (
                  <div key={r.id} className="kanban-card">
                    <div className="kanban-card-title">{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                      {TYPE_LABEL[r.type]} · <span className={`priority-${r.priority}`}>{r.priority}</span>
                    </div>
                    {r.deadline && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Deadline: {r.deadline.slice(0, 10)}</div>}
                    {r.assigned_to && <div style={{ fontSize: 12, marginBottom: 8 }}>PIC: {r.assigned_to}</div>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {COLUMNS.filter(c => c.key !== r.status).map(c => (
                        <button key={c.key} className="btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => moveStatus(r.id, c.key)}>
                          → {c.label}
                        </button>
                      ))}
                      <button className="btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleDelete(r.id)}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-title">Buat Permintaan Konten</div>

            {error && <div style={{ color: '#B91C1C', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div className="field">
              <label>Judul Permintaan</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Misal: Desain feed IG promo akhir bulan" />
            </div>

            <div className="grid-cols" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Tipe</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Deskripsi / Brief</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detail apa yang dibutuhkan" />
            </div>

            <div className="grid-cols" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Diminta oleh</label>
                <input value={form.requested_by} onChange={e => setForm({ ...form, requested_by: e.target.value })} />
              </div>
              <div className="field">
                <label>Ditugaskan ke</label>
                <input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} />
              </div>
            </div>

            <div className="field">
              <label>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
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
