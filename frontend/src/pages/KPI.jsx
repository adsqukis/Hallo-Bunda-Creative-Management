import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api, getISOWeek } from '../api/client.js'
import { useNavigate } from 'react-router-dom'

const PLATFORM_COLORS = {
  instagram: '#C13584',
  tiktok: '#010101',
  youtube: '#FF0000',
  website: '#2563EB',
  threads: '#000000'
}

const PLATFORM_ORDER = ['instagram', 'tiktok', 'youtube', 'website', 'threads']

function MetricCard({ label, value, sub, goodUp = true }) {
  const isUp = value > 0
  const isDown = value < 0
  const color = value === 0 ? 'var(--muted)' : isUp ? (goodUp ? 'var(--good)' : '#B91C1C') : (goodUp ? '#B91C1C' : 'var(--good)')

  return (
    <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
      {sub !== undefined && sub !== null && (
        <div style={{ fontSize: 13, fontWeight: 600, color, marginTop: 2 }}>
          {isUp ? '↑' : isDown ? '↓' : ''} {Math.abs(sub)}%
        </div>
      )}
    </div>
  )
}

function PlatformCard({ data }) {
  const navigate = useNavigate()
  const color = PLATFORM_COLORS[data.platform] || '#666'

  if (!data.has_data) {
    return (
      <div className="card" style={{ borderLeft: `4px solid ${color}`, opacity: 0.5 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color }}>{data.label}</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Belum ada data minggu ini</div>
      </div>
    )
  }

  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color }}>{data.label}</div>
        <button
          className="btn"
          style={{ fontSize: 11, padding: '4px 10px' }}
          onClick={() => navigate('/evaluasi')}
        >
          Detail
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <MetricCard label="Views" value={data.total_views.toLocaleString('id-ID')} sub={data.views_growth} />
        <MetricCard label="Engagement" value={data.total_engagement.toLocaleString('id-ID')} />
        <MetricCard label="ER" value={`${data.engagement_rate}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
        <div>Posts: <strong>{data.posts}</strong></div>
        <div>Avg Views/Post: <strong>{data.avg_views.toLocaleString('id-ID')}</strong></div>
        <div>Avg Engagement/Post: <strong>{data.avg_engagement}</strong></div>
        {data.reach_rate > 0 && <div>Reach Rate: <strong>{data.reach_rate}%</strong></div>}
      </div>
    </div>
  )
}

export default function KPI() {
  const [week, setWeek] = useState(getISOWeek())
  const [kpiData, setKpiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  async function loadKPI() {
    setLoading(true)
    try {
      const res = await api.get('/analytics/kpi', { params: { week } })
      setKpiData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadKPI() }, [week])

  const platformsWithData = kpiData?.platforms?.filter(p => p.has_data) || []
  const platformsEmpty = kpiData?.platforms?.filter(p => !p.has_data) || []

  // Data untuk chart perbandingan
  const chartData = kpiData?.platforms
    ?.filter(p => p.has_data)
    .map(p => ({
      name: p.label,
      Views: p.total_views,
      Engagement: p.total_engagement
    })) || []

  const totalViews = platformsWithData.reduce((s, p) => s + p.total_views, 0)
  const totalEngagement = platformsWithData.reduce((s, p) => s + p.total_engagement, 0)
  const overallER = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : '0.00'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Key Performance Indicators</div>
          <h1 className="page-title">KPI</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="week" value={week} onChange={e => setWeek(e.target.value)} style={{ width: 160 }} />
          <button className="btn" onClick={() => navigate('/evaluasi')}>
            Ke Evaluasi →
          </button>
        </div>
      </div>

      {/* Overall KPI Summary */}
      {!loading && kpiData && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="page-eyebrow" style={{ marginBottom: 12 }}>Ringkasan · {week}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <MetricCard label="Total Views" value={totalViews.toLocaleString('id-ID')} />
            <MetricCard label="Total Engagement" value={totalEngagement.toLocaleString('id-ID')} />
            <MetricCard label="Overall ER" value={`${overallER}%`} />
            <MetricCard label="Platform Aktif" value={platformsWithData.length} />
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="empty-state">Memuat data KPI...</div>
      )}

      {/* Chart perbandingan */}
      {!loading && chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="page-eyebrow" style={{ marginBottom: 12 }}>Perbandingan Platform</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0DFD6" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="Views" name="Views">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={Object.values(PLATFORM_COLORS)[i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Platform KPI Cards */}
      {!loading && !kpiData && (
        <div className="empty-state">Belum ada data untuk minggu ini.</div>
      )}

      {!loading && kpiData && (
        <div className="page-eyebrow" style={{ marginBottom: 12 }}>Per Platform</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {/* Sort: platforms with data first, then platforms with no data */}
        {PLATFORM_ORDER.map(p => {
          const platformData = kpiData?.platforms?.find(d => d.platform === p)
          if (!platformData) return null
          return <PlatformCard key={p} data={platformData} />
        })}
      </div>

      {!loading && kpiData && platformsWithData.length === 0 && (
        <div className="empty-state">Tidak ada data KPI untuk {week}. Input data di Monitoring dulu.</div>
      )}

      {/* Footer note connecting to Evaluation */}
      {!loading && kpiData && platformsWithData.length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/evaluasi')}>
            Lihat Evaluasi Lengkap →
          </button>
        </div>
      )}
    </div>
  )
}
