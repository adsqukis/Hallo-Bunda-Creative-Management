import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { api } from '../api/client.js'

function toDateStr(d) {
  return d.toISOString().slice(0, 10)
}

function last7days() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 6)
  return { from: toDateStr(from), to: toDateStr(to) }
}

const PLATFORM_COLORS = {
  instagram: '#C13584', tiktok: '#010101', youtube: '#FF0000',
  website: '#2563EB', threads: '#000000'
}

const METRIC_LABELS = {
  instagram: [
    { key: 'reach', label: 'Reach' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
    { key: 'shares', label: 'Saves & Shares' },
    { key: 'profile_visits', label: 'Profile Visits' },
    { key: 'follower_growth', label: 'Follower Growth' },
  ],
  tiktok: [
    { key: 'views', label: 'Views' },
    { key: 'completion_rate', label: 'Completion Rate' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
    { key: 'shares', label: 'Shares' },
    { key: 'engagement_rate', label: 'Engagement Rate' },
  ],
  youtube: [
    { key: 'views', label: 'Views' },
    { key: 'watch_time', label: 'Watch Time (jam)' },
    { key: 'avg_duration', label: 'Avg Duration (detik)' },
    { key: 'subscriber_growth', label: 'Subscriber Growth' },
    { key: 'ctr', label: 'CTR (%)' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
  ],
  website: [
    { key: 'organic_traffic', label: 'Organic Traffic' },
    { key: 'bounce_rate', label: 'Bounce Rate (%)' },
    { key: 'conversion_rate', label: 'Conversion Rate (%)' },
    { key: 'avg_time_on_page', label: 'Avg Time (detik)' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
  ],
  threads: [
    { key: 'replies_rate', label: 'Replies Rate' },
    { key: 'reposts', label: 'Reposts' },
    { key: 'follower_growth', label: 'Follower Growth' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
    { key: 'engagement_rate', label: 'Engagement Rate (%)' },
  ],
}

export default function Overview() {
  const [from, setFrom] = useState(last7days().from)
  const [to, setTo] = useState(last7days().to)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const res = await api.get('/overview', { params: { from, to } })
      setData(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [from, to])

  const totalViews = data?.platforms?.reduce((s, p) => {
    return s + Number(p.metrics?.views || p.metrics?.organic_traffic || 0)
  }, 0) || 0

  const totalEngagement = data?.platforms?.reduce((s, p) => {
    return s + Number(p.metrics?.likes || 0) + Number(p.metrics?.comments || 0) + Number(p.metrics?.shares || 0)
  }, 0) || 0

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Dashboard</div>
          <h1 className="page-title">Overview</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 140, fontSize: 13 }} />
          <span style={{ color: 'var(--muted)' }}>—</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ width: 140, fontSize: 13 }} />
        </div>
      </div>

      {/* AKUMULASI — card besar di atas */}
      <div className="card" style={{ marginBottom: 24, padding: '24px 28px', borderLeft: '4px solid var(--accent)' }}>
        <div className="page-eyebrow" style={{ marginBottom: 12 }}>Akumulasi Semua Platform · {from} s.d {to}</div>
        <div className="acc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Total Views/Traffic</div>
            <div className="acc-value" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{totalViews.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Total Engagement</div>
            <div className="acc-value" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{totalEngagement.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Laporan Masuk</div>
            <div className="acc-value" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{data?.accumulation?.total_reports || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Platform Aktif</div>
            <div className="acc-value" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{data?.accumulation?.active_platforms || 0}/5</div>
          </div>
        </div>
      </div>

      {loading && <div className="empty-state">Memuat data...</div>}

      {/* Per-platform cards */}
      {!loading && data && (
        <div className="platform-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
          {data.platforms.filter(p => p.report_count > 0).map(p => {
            const m = p.metrics || {}
            const mKeys = Object.keys(m)
            const color = PLATFORM_COLORS[p.slug] || '#666'

            // Daily data for line chart
            const platTrend = data.daily_trend.filter(d => d.platform_slug === p.slug)

            return (
              <div
                className="card"
                key={p.id}
                style={{ borderLeft: `4px solid ${color}`, cursor: 'pointer' }}
                onClick={() => setSelectedPlatform(selectedPlatform === p.slug ? null : p.slug)}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color }}>{p.icon} {p.name}</div>

                {/* KPI values — SEMUA metrik dengan label proper */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                  {METRIC_LABELS[p.slug] && METRIC_LABELS[p.slug].filter(lbl => m[lbl.key] !== undefined).map(lbl => (
                    <div key={lbl.key} style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>{lbl.label}: </span>
                      <strong>{Number(m[lbl.key]).toLocaleString('id-ID')}</strong>
                    </div>
                  ))}
                  {/* Fallback untuk key yang gak terdaftar di METRIC_LABELS */}
                  {(!METRIC_LABELS[p.slug]) && mKeys.map(k => (
                    <div key={k} style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>{k.replace(/_/g, ' ')}: </span>
                      <strong>{Number(m[k]).toLocaleString('id-ID')}</strong>
                    </div>
                  ))}
                </div>

                {/* Mini line chart */}
                {platTrend.length > 1 && (
                  <div style={{ height: 60 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={platTrend}>
                        <Line type="monotone" dataKey="metrics.views" stroke={color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Trend chart — all platforms comparison */}
      {!loading && data?.daily_trend?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="page-eyebrow" style={{ marginBottom: 12 }}>Daily Trend</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.daily_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0DFD6" />
              <XAxis dataKey="report_date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend />
              {['instagram', 'tiktok', 'youtube', 'website', 'threads'].filter(slug =>
                data.daily_trend.some(d => d.platform_slug === slug)
              ).map(slug => (
                <Line key={slug} type="monotone" dataKey={`metrics.views`} stroke={PLATFORM_COLORS[slug] || '#666'} name={slug} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 Content */}
      {!loading && data?.top_contents?.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="page-eyebrow">Top 5 Content</div>
          </div>
          <div className="table-wrap">
            <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Platform</th>
                <th>Judul</th>
                <th>Metrik</th>
                <th>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {data.top_contents.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>{i + 1}</td>
                  <td><span style={{ color: PLATFORM_COLORS[c.platform_slug] || '#666', fontWeight: 600 }}>{c.platform_name}</span></td>
                  <td>{c.url ? <a href={c.url} target="_blank" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>{c.title}</a> : c.title}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.metric_key}</td>
                  <td className="metric">{Number(c.metric_value).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data?.platforms?.every(p => p.report_count === 0) && (
        <div className="empty-state">Belum ada laporan untuk periode ini. Member bisa input laporan di menu Input Laporan.</div>
      )}
    </div>
  )
}
