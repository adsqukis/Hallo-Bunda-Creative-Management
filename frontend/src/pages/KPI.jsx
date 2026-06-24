import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api, getISOWeek } from '../api/client.js'
import { useNavigate } from 'react-router-dom'

const PLATFORM_META = {
  instagram: {
    color: '#C13584',
    label: 'Instagram',
    focus: 'Estetika & Pertumbuhan Komunitas',
    metrics: [
      { key: 'total_reach', label: 'Reach', desc: 'Akun unik yang melihat konten', unit: '', available: true },
      { key: 'total_impressions', label: 'Impressions', desc: 'Total penayangan konten', unit: '', available: true },
      { key: 'engagement_rate', label: 'Engagement Rate', desc: 'Likes & Comments / Views', unit: '%', available: true },
      { key: 'total_likes', label: 'Likes', desc: 'Jumlah suka', unit: '', available: true },
      { key: 'total_comments', label: 'Comments', desc: 'Jumlah komentar', unit: '', available: true },
      { key: 'total_shares', label: 'Saves & Shares', desc: 'Kualitas & nilai manfaat konten', unit: '', available: true },
      { key: 'profile_visits', label: 'Profile Visits', desc: 'Kunjungan profil', unit: '', available: false },
      { key: 'follower_growth', label: 'Follower Growth Rate', desc: 'Laju pertumbuhan pengikut', unit: '%', available: false },
    ]
  },
  tiktok: {
    color: '#010101',
    label: 'TikTok',
    focus: 'Viralitas & Hiburan',
    metrics: [
      { key: 'total_views', label: 'Video Views', desc: 'Jumlah pemutaran video', unit: '', available: true },
      { key: 'completion_rate', label: 'Completion Rate', desc: 'Audiens menonton sampai selesai', unit: '%', available: false },
      { key: 'engagement_rate', label: 'Engagement Rate', desc: 'Like + Comment + Share / Views', unit: '%', available: true },
      { key: 'total_shares', label: 'Share Rate', desc: 'Tingkat pembagian konten', unit: '', available: true },
      { key: 'total_likes', label: 'Likes', desc: 'Jumlah suka', unit: '', available: true },
      { key: 'total_comments', label: 'Comments', desc: 'Jumlah komentar', unit: '', available: true },
    ]
  },
  youtube: {
    color: '#FF0000',
    label: 'YouTube',
    focus: 'Retensi & Edukasi',
    metrics: [
      { key: 'total_views', label: 'View Count', desc: 'Jumlah tayangan video', unit: '', available: true },
      { key: 'watch_time', label: 'Watch Time', desc: 'Total waktu penonton', unit: 'jam', available: false },
      { key: 'avg_duration', label: 'Avg View Duration', desc: 'Durasi rata-rata menonton', unit: 'detik', available: false },
      { key: 'follower_growth', label: 'Subscriber Growth', desc: 'Laju pertumbuhan pelanggan', unit: '%', available: false },
      { key: 'ctr', label: 'CTR', desc: 'Klik setelah melihat thumbnail', unit: '%', available: false },
      { key: 'total_likes', label: 'Likes', desc: 'Jumlah suka', unit: '', available: true },
      { key: 'total_comments', label: 'Comments', desc: 'Jumlah komentar', unit: '', available: true },
    ]
  },
  website: {
    color: '#2563EB',
    label: 'Website',
    focus: 'Konversi & Otoritas',
    metrics: [
      { key: 'total_views', label: 'Organic Traffic', desc: 'Pengunjung alami dari mesin pencari', unit: '', available: true },
      { key: 'bounce_rate', label: 'Bounce Rate', desc: 'Pengunjung langsung keluar', unit: '%', available: false },
      { key: 'conversion_rate', label: 'Conversion Rate', desc: 'Tindakan spesifik (form, download, beli)', unit: '%', available: false },
      { key: 'avg_views', label: 'Avg Time on Page', desc: 'Rata-rata waktu baca artikel/halaman', unit: 'detik', available: false },
      { key: 'total_likes', label: 'Likes', desc: 'Reaksi', unit: '', available: true },
      { key: 'total_comments', label: 'Comments', desc: 'Komentar', unit: '', available: true },
    ]
  },
  threads: {
    color: '#000000',
    label: 'Threads',
    focus: 'Percakapan & Hubungan',
    metrics: [
      { key: 'replies_rate', label: 'Replies Rate', desc: 'Balasan langsung pada thread', unit: '', available: false },
      { key: 'total_shares', label: 'Reposts / Quotes', desc: 'Audiens membagikan ulang thread', unit: '', available: true },
      { key: 'follower_growth', label: 'Followers Growth', desc: 'Laju pengikut baru', unit: '%', available: false },
      { key: 'engagement_rate', label: 'Engagement Rate', desc: 'Interaksi aktif per thread', unit: '%', available: true },
      { key: 'total_likes', label: 'Likes', desc: 'Jumlah suka', unit: '', available: true },
      { key: 'total_comments', label: 'Replies', desc: 'Jumlah balasan', unit: '', available: true },
    ]
  }
}

const PLATFORM_ORDER = ['instagram', 'tiktok', 'youtube', 'website', 'threads']

function KpiRow({ data, platformMeta }) {
  const color = platformMeta.color
  const plData = data

  function getValue(key) {
    switch (key) {
      case 'total_views': return plData?.total_views?.toLocaleString('id-ID') || 0
      case 'total_likes': return plData?.total_likes?.toLocaleString('id-ID') || 0
      case 'total_comments': return plData?.total_comments?.toLocaleString('id-ID') || 0
      case 'total_shares': return plData?.total_shares?.toLocaleString('id-ID') || 0
      case 'total_reach': return plData?.total_reach?.toLocaleString('id-ID') || 0
      case 'total_impressions': return plData?.total_impressions?.toLocaleString('id-ID') || 0
      case 'engagement_rate': return plData?.engagement_rate ? `${plData.engagement_rate}%` : '—'
      case 'avg_views': return plData?.avg_views?.toLocaleString('id-ID') || 0
      case 'follower_growth': return '—'
      case 'profile_visits': return '—'
      case 'completion_rate': return '—'
      case 'watch_time': return '—'
      case 'avg_duration': return '—'
      case 'ctr': return '—'
      case 'bounce_rate': return '—'
      case 'conversion_rate': return '—'
      case 'replies_rate': return '—'
      default: return '—'
    }
  }

  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}`, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color }}>{platformMeta.label}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
            {platformMeta.focus}
          </span>
        </div>
        {plData?.views_growth !== 0 && plData?.has_data && (
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: plData.views_growth > 0 ? 'var(--good)' : '#B91C1C'
          }}>
            {plData.views_growth > 0 ? '↑' : '↓'} {Math.abs(plData.views_growth)}% vs prev week
          </span>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Metrik</th>
            <th style={{ width: '20%' }}>Nilai</th>
            <th style={{ width: '50%' }}>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {platformMeta.metrics.map(m => {
            const val = getValue(m.key)
            const isAvailable = m.available && plData?.has_data
            const hasValue = val !== '—' && val !== 0 && val !== '0'
            return (
              <tr key={m.key} style={{ opacity: isAvailable && hasValue ? 1 : 0.45 }}>
                <td style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</td>
                <td className="metric" style={{ fontSize: 14 }}>
                  {isAvailable && hasValue ? val : '—'}
                </td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {m.desc}
                  {!isAvailable && <span style={{ color: '#C4781F', marginLeft: 6 }}>· perlu integrasi data</span>}
                  {isAvailable && !hasValue && <span style={{ color: 'var(--muted)', marginLeft: 6 }}>· belum ada data minggu ini</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
  const totalViews = platformsWithData.reduce((s, p) => s + p.total_views, 0)
  const totalEngagement = platformsWithData.reduce((s, p) => s + p.total_engagement, 0)
  const overallER = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : '0.00'

  // Chart data per platform
  const chartData = kpiData?.platforms
    ?.filter(p => p.has_data)
    .map(p => ({
      name: p.label,
      Views: p.total_views,
      Engagement: p.total_engagement
    })) || []

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

      {/* Ringkasan */}
      {!loading && kpiData && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="page-eyebrow" style={{ marginBottom: 12 }}>Ringkasan · {week}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>Total Views</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{totalViews.toLocaleString('id-ID')}</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>Total Engagement</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{totalEngagement.toLocaleString('id-ID')}</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>Overall ER</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{overallER}%</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>Platform Aktif</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{platformsWithData.length}/5</div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="empty-state">Memuat data KPI...</div>}

      {/* Chart */}
      {!loading && chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="page-eyebrow" style={{ marginBottom: 12 }}>Perbandingan Platform</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0DFD6" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="Views" name="Views">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={Object.values(PLATFORM_META).map(m => m.color)[i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* KPI per Platform */}
      {!loading && kpiData && (
        <>
          <div className="page-eyebrow" style={{ marginBottom: 16 }}>KPI per Platform</div>
          {PLATFORM_ORDER.map(p => {
            const pData = kpiData.platforms.find(d => d.platform === p)
            const meta = PLATFORM_META[p]
            return <KpiRow key={p} data={pData} platformMeta={meta} />
          })}
        </>
      )}

      {!loading && kpiData && platformsWithData.length === 0 && (
        <div className="empty-state">Belum ada data untuk {week}. Input data di Monitoring dulu.</div>
      )}

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
