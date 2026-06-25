import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const PLATFORM_COLORS = {
  instagram: '#C13584',
  tiktok: '#010101',
  youtube: '#FF0000',
  website: '#2563EB',
  threads: '#000000'
}

const STATUS_CFG = {
  on_track: { label: 'On Track', color: '#16A34A', icon: '🟢' },
  warning: { label: 'Warning', color: '#CA8A04', icon: '🟡' },
  missed: { label: 'Missed', color: '#DC2626', icon: '🔴' },
  no_data: { label: 'Belum Ada Laporan', color: '#9CA3AF', icon: '⚪' },
  no_target: { label: 'Target Belum Diset', color: '#9CA3AF', icon: '⚪' },
}

export default function KPIPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const res = await api.get('/kpi-comparison', { params: { month, year } })
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [month, year])

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  // Hitung overall summary
  const allMetrics = data?.platforms?.flatMap(p => p.metrics) || []
  const metricsWithTarget = allMetrics.filter(m => m.target !== null && m.target > 0)
  const onTrack = metricsWithTarget.filter(m => m.status === 'on_track').length
  const warning = metricsWithTarget.filter(m => m.status === 'warning').length
  const missed = metricsWithTarget.filter(m => m.status === 'missed').length
  const noData = metricsWithTarget.filter(m => m.status === 'no_data').length
  const totalTarget = metricsWithTarget.length
  const achievementRate = totalTarget > 0 ? Math.round((onTrack / totalTarget) * 100) : 0

  const platformOrder = ['instagram', 'tiktok', 'youtube', 'website', 'threads']

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Key Performance Indicators</div>
          <h1 className="page-title">KPI — Target vs Capaian</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            style={{ width: 100, fontFamily: 'var(--font-mono)' }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" value={year} min={2024} max={2030}
            onChange={e => setYear(parseInt(e.target.value))}
            style={{ width: 80, fontFamily: 'var(--font-mono)' }} />
        </div>
      </div>

      {loading && <div className="empty-state">Memuat data KPI...</div>}

      {/* Ringkasan */}
      {!loading && data && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="page-eyebrow" style={{ marginBottom: 12 }}>
            Ringkasan · {MONTHS[month - 1]} {year}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="kpi-summary">
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px', background: '#F0FDF4' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>🟢 On Track</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#16A34A', fontFamily: 'var(--font-mono)' }}>
                {onTrack}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px', background: '#FEFCE8' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>🟡 Warning</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#CA8A04', fontFamily: 'var(--font-mono)' }}>
                {warning}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px', background: '#FEF2F2' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>🔴 Missed</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626', fontFamily: 'var(--font-mono)' }}>
                {missed}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Achievement Rate</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: achievementRate >= 70 ? '#16A34A' : achievementRate >= 50 ? '#CA8A04' : '#DC2626' }}>
                {achievementRate}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per Platform */}
      {!loading && data && (
        <>
          <div className="page-eyebrow" style={{ marginBottom: 16 }}>Detail per Platform</div>
          {platformOrder.map(slug => {
            const pl = data.platforms.find(p => p.platform_slug === slug)
            if (!pl) return null
            const color = PLATFORM_COLORS[slug] || '#666'
            const s = pl.summary

            return (
              <div className="card" key={slug}
                style={{ borderLeft: `4px solid ${color}`, marginBottom: 20 }}>
                {/* Header platform */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{pl.platform_icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color }}>{pl.platform_name}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      {pl.report_count} laporan · {pl.active_days} hari aktif
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    {s.on_track > 0 && <span style={{ color: '#16A34A' }}>🟢 {s.on_track}</span>}
                    {s.warning > 0 && <span style={{ color: '#CA8A04' }}>🟡 {s.warning}</span>}
                    {s.missed > 0 && <span style={{ color: '#DC2626' }}>🔴 {s.missed}</span>}
                    {s.no_data > 0 && <span style={{ color: '#9CA3AF' }}>⚪ {s.no_data}</span>}
                  </div>
                </div>

                {/* Tabel metrik */}
                <div className="table-wrap">
                  <table>
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Metrik</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Target</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Capaian</th>
                      <th style={{ width: '12%', textAlign: 'right' }}>%</th>
                      <th style={{ width: '33%' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pl.metrics.map(m => {
                      const sc = STATUS_CFG[m.status] || STATUS_CFG.no_target
                      const barWidth = m.percentage !== null ? Math.min(m.percentage, 100) : 0

                      return (
                        <tr key={m.metric_key}>
                          <td style={{ fontWeight: 600, fontSize: 13 }}>{m.metric_label}</td>
                          <td className="metric" style={{ fontSize: 13, textAlign: 'right' }}>
                            {m.target !== null ? m.target.toLocaleString('id-ID') : '—'}
                          </td>
                          <td className="metric" style={{ fontSize: 13, textAlign: 'right' }}>
                            {m.actual !== null ? m.actual.toLocaleString('id-ID') : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
                            color: m.percentage !== null ? (m.percentage >= 90 ? '#16A34A' : m.percentage >= 70 ? '#CA8A04' : '#DC2626') : 'var(--muted)' }}>
                            {m.percentage !== null ? m.percentage + '%' : '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                flex: 1, height: 6, borderRadius: 3,
                                background: totalTarget > 0 ? '#E5E7EB' : 'transparent',
                                overflow: 'hidden'
                              }}>
                                {m.percentage !== null && (
                                  <div style={{
                                    width: `${barWidth}%`, height: '100%',
                                    borderRadius: 3,
                                    background: m.percentage >= 90 ? '#16A34A' : m.percentage >= 70 ? '#CA8A04' : '#DC2626',
                                    transition: 'width 0.3s'
                                  }} />
                                )}
                              </div>
                              <span style={{ fontSize: 11, color: sc.color, whiteSpace: 'nowrap' }}>
                                {sc.icon} {sc.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table></div>

                {/* Overall progress bar platform */}
                {s.overall_percentage !== null && (
                  <div style={{ marginTop: 12, padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: 'var(--muted)' }}>Rata-rata pencapaian</span>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)',
                        color: s.overall_percentage >= 90 ? '#16A34A' : s.overall_percentage >= 70 ? '#CA8A04' : '#DC2626' }}>
                        {s.overall_percentage}%
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(s.overall_percentage, 100)}%`,
                        height: '100%', borderRadius: 4,
                        background: s.overall_percentage >= 90 ? '#16A34A' : s.overall_percentage >= 70 ? '#CA8A04' : '#DC2626'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {!loading && data && data.platforms.every(p => p.metrics.every(m => m.target === null)) && (
        <div className="empty-state" style={{ marginTop: 24 }}>
          Belum ada target KPI untuk {MONTHS[month - 1]} {year}. 
          Set target dulu di Settings → Target KPI.
        </div>
      )}
    </div>
  )
}
