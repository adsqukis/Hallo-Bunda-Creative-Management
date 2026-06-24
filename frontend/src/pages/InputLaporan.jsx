import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

export default function InputLaporan() {
  const [platforms, setPlatforms] = useState([])
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [metrics, setMetrics] = useState([])
  const [formValues, setFormValues] = useState({})
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [topContents, setTopContents] = useState([{ title: '', metric_key: '', metric_value: '' }])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [recentReports, setRecentReports] = useState([])

  useEffect(() => {
    api.get('/platforms').then(res => {
      setPlatforms(res.data)
      if (res.data.length > 0) {
        setSelectedPlatform(res.data[0].slug)
        setMetrics(res.data[0].metrics || [])
      }
    }).catch(() => setError('Gagal memuat platform'))
  }, [])

  useEffect(() => {
    if (!selectedPlatform) return
    const p = platforms.find(pl => pl.slug === selectedPlatform)
    setMetrics(p?.metrics || [])
    setFormValues({})
    setTopContents([{ title: '', metric_key: '', metric_value: '' }])

    // Load recent reports for this platform
    api.get('/reports', { params: { platform: selectedPlatform, limit: 5 } })
      .then(res => setRecentReports(res.data))
      .catch(() => {})
  }, [selectedPlatform, platforms])

  function handleChange(key, value) {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  function handleTopChange(index, field, value) {
    const updated = [...topContents]
    updated[index] = { ...updated[index], [field]: value }
    setTopContents(updated)
  }

  function addTopRow() {
    setTopContents(prev => [...prev, { title: '', metric_key: '', metric_value: '' }])
  }

  function removeTopRow(index) {
    if (topContents.length <= 1) return
    setTopContents(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const p = platforms.find(pl => pl.slug === selectedPlatform)
    if (!p) { setError('Pilih platform dulu'); setLoading(false); return }

    try {
      await api.post('/reports', {
        platform_id: p.id,
        report_date: reportDate,
        metrics: formValues,
        notes,
        top_contents: topContents.filter(tc => tc.title && tc.metric_key && tc.metric_value)
      })
      setSuccess('Laporan berhasil disimpan!')
      setFormValues({})
      setNotes('')
      setTopContents([{ title: '', metric_key: '', metric_value: '' }])

      // Refresh recent reports
      const res = await api.get('/reports', { params: { platform: selectedPlatform, limit: 5 } })
      setRecentReports(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan laporan')
    } finally {
      setLoading(false)
    }
  }

  const currentUser = JSON.parse(localStorage.getItem('hb_user') || '{}')

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Laporan Harian</div>
          <h1 className="page-title">Input Laporan</h1>
        </div>
      </div>

      {success && <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--good)', background: '#F0FDF4' }}>{success}</div>}
      {error && <div style={{ color: '#B91C1C', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ marginBottom: 24, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Platform</label>
              <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}>
                {platforms.map(p => (
                  <option key={p.id} value={p.slug}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Tanggal</label>
              <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ marginBottom: 10 }}>Metrik KPI</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {metrics.map(m => (
                <div key={m.metric_key} className="field" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 11 }}>{m.metric_label} {m.unit && <span style={{ color: 'var(--muted)' }}>({m.unit})</span>}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formValues[m.metric_key] ?? ''}
                    onChange={e => handleChange(m.metric_key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Top Content */}
          <div className="card" style={{ marginBottom: 16, padding: 14, background: '#FAFAF8', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>🏆 Top Content (opsional)</label>
              <button type="button" className="btn" onClick={addTopRow} style={{ fontSize: 11, padding: '4px 10px' }}>
                + Tambah
              </button>
            </div>
            {topContents.map((tc, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  placeholder="Judul konten"
                  value={tc.title}
                  onChange={e => handleTopChange(i, 'title', e.target.value)}
                  style={{ flex: 2, fontSize: 12, padding: '6px 10px' }}
                />
                <select
                  value={tc.metric_key}
                  onChange={e => handleTopChange(i, 'metric_key', e.target.value)}
                  style={{ flex: 1, fontSize: 12, padding: '6px 10px' }}
                >
                  <option value="">Pilih metrik</option>
                  {metrics.map(m => (
                    <option key={m.metric_key} value={m.metric_key}>{m.metric_label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Nilai"
                  value={tc.metric_value}
                  onChange={e => handleTopChange(i, 'metric_value', e.target.value)}
                  style={{ flex: 0.6, fontSize: 12, padding: '6px 10px' }}
                />
                {topContents.length > 1 && (
                  <button type="button" onClick={() => removeTopRow(i)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#B91C1C', padding: '4px 6px'
                  }}>×</button>
                )}
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Konten dengan performa terbaik di platform ini. Akan muncul di Overview.
            </div>
          </div>

          <div className="field">
            <label>Catatan (opsional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Keterangan tambahan..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Menyimpan...' : 'Simpan Laporan'}
          </button>
        </form>
      </div>

      {/* Recent reports */}
      {recentReports.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="page-eyebrow">Laporan Terakhir</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Platform</th>
                <th>Metrik</th>
                <th>Input Oleh</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map(r => {
                const mEntries = Object.entries(r.metrics || {}).slice(0, 4)
                return (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12 }}>{new Date(r.report_date).toLocaleDateString('id-ID')}</td>
                    <td>{r.platform_name}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {mEntries.map(([k, v]) => `${k}: ${v}`).join(', ')}
                      {Object.keys(r.metrics || {}).length > 4 && '...'}
                    </td>
                    <td style={{ fontSize: 12 }}>{r.created_by_name || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
