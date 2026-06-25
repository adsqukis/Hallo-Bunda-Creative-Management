import { useEffect, useState } from 'react'
import { api, PLATFORMS, TONE_OPTIONS, STYLE_OPTIONS } from '../api/client.js'
import PlatformBadge from '../components/PlatformBadge.jsx'

const emptyForm = {
  platform: 'instagram',
  title: '',
  brief_objective: '',
  brief_key_message: '',
  brief_cta: '',
  tone: 'casual',
  style: 'educational',
  scheduled_date: new Date().toISOString().slice(0, 10),
  status: 'draft',
  assigned_to: ''
}

const STATUS_LABEL = { draft: 'Draft', scheduled: 'Scheduled', published: 'Published' }

export default function Calendar() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // AI brief generator state
  const [aiTopik, setAiTopik] = useState('')
  const [aiTone, setAiTone] = useState('casual')
  const [aiStyle, setAiStyle] = useState('educational')
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  async function loadItems() {
    setLoading(true)
    try {
      const res = await api.get('/calendar')
      setItems(res.data)
    } catch (err) {
      setError('Gagal memuat kalender konten.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  function openForm() {
    setForm(emptyForm)
    setAiTopik('')
    setAiError('')
    setShowForm(true)
  }

  async function handleGenerateBrief() {
    if (!aiTopik.trim()) {
      setAiError('Isi topik dulu sebelum generate brief.')
      return
    }
    setGenerating(true)
    setAiError('')
    try {
      const res = await api.post('/brief/generate', {
        platform: form.platform,
        topik: aiTopik,
        tone: aiTone,
        style: aiStyle
      })
      setForm({
        ...form,
        title: form.title || aiTopik,
        brief_objective: res.data.objective,
        brief_key_message: res.data.key_message,
        brief_cta: res.data.cta,
        tone: aiTone,
        style: aiStyle
      })
    } catch (err) {
      setAiError(err.response?.data?.error || 'Gagal generate brief. Coba lagi.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/calendar', form)
      setShowForm(false)
      loadItems()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan konten')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id, status) {
    await api.put(`/calendar/${id}`, { status })
    loadItems()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus konten ini dari kalender?')) return
    await api.delete(`/calendar/${id}`)
    loadItems()
  }

  const sorted = [...items].sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Planning & Brief</div>
          <h1 className="page-title">Kalender Konten</h1>
        </div>
        <button className="btn btn-primary" onClick={openForm}>+ Buat Konten</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat kalender...</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">Belum ada konten direncanakan. Buat konten pertama dan generate brief dengan AI.</div>
        ) : (
          <div className="table-wrap"><table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Platform</th>
                <th>Judul</th>
                <th>Tone / Style</th>
                <th>Assigned</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(item => (
                <tr key={item.id}>
                  <td className="metric">{item.scheduled_date?.slice(0, 10)}</td>
                  <td><PlatformBadge value={item.platform} /></td>
                  <td>{item.title}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{item.tone} / {item.style}</td>
                  <td>{item.assigned_to || '—'}</td>
                  <td>
                    <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)} style={{ width: 130 }}>
                      {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn" onClick={() => handleDelete(item.id)} style={{ fontSize: 12, padding: '5px 10px' }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-title">Buat Konten Baru</div>

            {error && <div style={{ color: '#B91C1C', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div className="grid-cols" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Platform</label>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Tanggal Tayang</label>
                <input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '18px 0' }} />

            <div className="page-eyebrow" style={{ marginBottom: 10 }}>Generate Brief dengan AI</div>

            <div className="field">
              <label>Topik Konten</label>
              <input value={aiTopik} onChange={e => setAiTopik(e.target.value)} placeholder="Misal: 5 manfaat retinol untuk kulit" />
            </div>

            <div className="grid-cols" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Tone</label>
                <select value={aiTone} onChange={e => setAiTone(e.target.value)}>
                  {TONE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Style</label>
                <select value={aiStyle} onChange={e => setAiStyle(e.target.value)}>
                  {STYLE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {aiError && <div style={{ color: '#B91C1C', fontSize: 13, marginBottom: 8 }}>{aiError}</div>}

            <button type="button" className="btn" onClick={handleGenerateBrief} disabled={generating} style={{ width: '100%' }}>
              {generating ? 'Generating...' : '✦ Generate Brief'}
            </button>

            {form.brief_objective && (
              <div className="brief-output">
                <strong>Objective</strong>
                <p style={{ margin: '0 0 10px' }}>{form.brief_objective}</p>
                <strong>Key Message</strong>
                <p style={{ margin: '0 0 10px' }}>{form.brief_key_message}</p>
                <strong>CTA</strong>
                <p style={{ margin: 0 }}>{form.brief_cta}</p>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '18px 0' }} />

            <div className="field">
              <label>Judul Konten (final)</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Judul yang akan dipakai" />
            </div>

            <div className="field">
              <label>Edit Objective</label>
              <textarea rows={2} value={form.brief_objective} onChange={e => setForm({ ...form, brief_objective: e.target.value })} />
            </div>
            <div className="field">
              <label>Edit Key Message</label>
              <textarea rows={2} value={form.brief_key_message} onChange={e => setForm({ ...form, brief_key_message: e.target.value })} />
            </div>
            <div className="field">
              <label>Edit CTA</label>
              <input value={form.brief_cta} onChange={e => setForm({ ...form, brief_cta: e.target.value })} />
            </div>

            <div className="field">
              <label>Assigned To</label>
              <input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="Nama PIC" />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan ke Kalender'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
