import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const emptyForm = {
  title: '', type: 'design', description: '',
  requested_by: '', assigned_to: '', deadline: '', priority: 'medium',
  reference_link: '', result_link: '', notes: ''
}

const COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' }
]

const TYPE_LABEL = { design: 'Design', video: 'Video', artikel: 'Artikel', lainnya: 'Lainnya' }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
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

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(r) {
    setEditId(r.id)
    setForm({
      title: r.title || '',
      type: r.type || 'design',
      description: r.description || '',
      requested_by: r.requested_by || '',
      assigned_to: r.assigned_to || '',
      deadline: r.deadline ? r.deadline.slice(0, 10) : '',
      priority: r.priority || 'medium',
      reference_link: r.reference_link || '',
      result_link: r.result_link || '',
      notes: r.notes || ''
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        deadline: form.deadline || null,
        reference_link: form.reference_link || null,
        result_link: form.result_link || null,
        notes: form.notes || null
      }
      if (editId) {
        await api.put(`/requests/${editId}`, payload)
      } else {
        await api.post('/requests', payload)
      }
      setShowForm(false)
      setShowDetail(null)
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
    setShowDetail(null)
    loadRequests()
  }

  function openDetail(r) {
    setShowDetail(r)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Design & Video Requests</div>
          <h1 className="page-title">Permintaan Konten</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Buat Permintaan</button>
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
                  <div key={r.id} className="kanban-card" onClick={() => openDetail(r)} style={{ cursor: 'pointer' }}>
                    <div className="kanban-card-title">{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                      {TYPE_LABEL[r.type]} · <span className={`priority-${r.priority}`}>{PRIORITY_LABEL[r.priority]}</span>
                    </div>
                    {r.deadline && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Deadline: {r.deadline.slice(0, 10)}</div>}
                    {r.assigned_to && <div style={{ fontSize: 12, marginBottom: 8 }}>PIC: {r.assigned_to}</div>}
                    {r.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</div>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                      {COLUMNS.filter(c => c.key !== r.status).map(c => (
                        <button key={c.key} className="btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => moveStatus(r.id, c.key)}>
                          → {c.label}
                        </button>
                      ))}
                      <button className="btn" style={{ fontSize: 11, padding: '4px 8px', color: '#B91C1C' }} onClick={() => handleDelete(r.id)}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-title">{showDetail.title}</div>

            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-label">Tipe</span>
                <span className="detail-value">{TYPE_LABEL[showDetail.type] || showDetail.type}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Priority</span>
                <span className={`priority-${showDetail.priority}`} style={{ fontWeight: 600 }}>{PRIORITY_LABEL[showDetail.priority]}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Status</span>
                <span style={{ fontWeight: 600 }}>{showDetail.status === 'done' ? '✅ Done' : showDetail.status === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Deadline</span>
                <span>{showDetail.deadline ? showDetail.deadline.slice(0, 10) : '-'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Diminta oleh</span>
                <span>{showDetail.requested_by || '-'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">PIC</span>
                <span>{showDetail.assigned_to || '-'}</span>
              </div>
            </div>

            {showDetail.description && (
              <div className="detail-section">
                <div className="detail-label">Brief / Deskripsi</div>
                <div className="detail-text">{showDetail.description}</div>
              </div>
            )}

            {showDetail.reference_link && (
              <div className="detail-section">
                <div className="detail-label">Link Referensi</div>
                <a href={showDetail.reference_link} target="_blank" rel="noopener noreferrer" className="detail-link">{showDetail.reference_link}</a>
              </div>
            )}

            {showDetail.result_link && (
              <div className="detail-section">
                <div className="detail-label">Link Hasil Konten</div>
                <a href={showDetail.result_link} target="_blank" rel="noopener noreferrer" className="detail-link">{showDetail.result_link}</a>
              </div>
            )}

            {showDetail.notes && (
              <div className="detail-section">
                <div className="detail-label">Catatan</div>
                <div className="detail-text">{showDetail.notes}</div>
              </div>
            )}

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <div>
                <button className="btn" onClick={() => handleDelete(showDetail.id)} style={{ color: '#B91C1C' }}>Hapus</button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" onClick={() => { setShowDetail(null); openEdit(showDetail) }}>Edit</button>
                <button className="btn btn-primary" onClick={() => setShowDetail(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT FORM MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-title">{editId ? 'Edit Permintaan' : 'Buat Permintaan Konten'}</div>

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

            <div className="field">
              <label>Link Referensi</label>
              <input type="url" value={form.reference_link} onChange={e => setForm({ ...form, reference_link: e.target.value })} placeholder="https://..." />
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

            <div className="grid-cols" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="field">
                <label>Link Hasil Konten</label>
                <input type="url" value={form.result_link} onChange={e => setForm({ ...form, result_link: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            <div className="field">
              <label>Catatan</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan..." />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Simpan'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
