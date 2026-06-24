import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { api, PLATFORMS, getISOWeek } from '../api/client.js'
import PlatformBadge from '../components/PlatformBadge.jsx'

function lastNWeeks(n) {
  const weeks = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    weeks.push(getISOWeek(d))
  }
  return weeks
}

export default function Evaluation() {
  const [week, setWeek] = useState(getISOWeek())
  const [weeklyData, setWeeklyData] = useState([])
  const [topPosts, setTopPosts] = useState([])
  const [trendData, setTrendData] = useState([])
  const [trendPlatform, setTrendPlatform] = useState('instagram')
  const [loading, setLoading] = useState(true)

  async function loadWeekly() {
    setLoading(true)
    try {
      const [weeklyRes, topRes] = await Promise.all([
        api.get('/analytics/weekly', { params: { week } }),
        api.get('/analytics/top-posts', { params: { week, limit: 5 } })
      ])
      setWeeklyData(weeklyRes.data)
      setTopPosts(topRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadTrend() {
    try {
      const weeks = lastNWeeks(4)
      const res = await api.get('/analytics/trend', {
        params: { platform: trendPlatform, weeks: weeks.join(',') }
      })
      // Pastikan semua minggu muncul walau data kosong, biar chart tidak bolong
      const map = Object.fromEntries(res.data.map(d => [d.input_week, d]))
      setTrendData(weeks.map(w => ({
        input_week: w,
        total_views: Number(map[w]?.total_views || 0),
        total_engagement: Number(map[w]?.total_engagement || 0)
      })))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { loadWeekly() }, [week])
  useEffect(() => { loadTrend() }, [trendPlatform])

  const totalViewsAll = weeklyData.reduce((sum, d) => sum + Number(d.total_views), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Weekly Comparison</div>
          <h1 className="page-title">Evaluasi</h1>
        </div>
        <input type="week" value={week} onChange={e => setWeek(e.target.value)} style={{ width: 160 }} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="page-eyebrow" style={{ marginBottom: 14 }}>Performa per Platform · {week}</div>
        {loading ? (
          <div className="empty-state">Memuat...</div>
        ) : weeklyData.length === 0 ? (
          <div className="empty-state">Tidak ada data untuk minggu ini. Input data di halaman Monitoring dulu.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Total Posts</th>
                <th>Total Views</th>
                <th>Avg Views/Post</th>
                <th>Avg Engagement</th>
                <th>% dari Total Views</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map(d => (
                <tr key={d.platform}>
                  <td><PlatformBadge value={d.platform} /></td>
                  <td className="metric">{d.total_posts}</td>
                  <td className="metric">{Number(d.total_views).toLocaleString('id-ID')}</td>
                  <td className="metric">{Number(d.avg_views).toLocaleString('id-ID')}</td>
                  <td className="metric">{d.avg_engagement}</td>
                  <td className="metric">{totalViewsAll ? ((d.total_views / totalViewsAll) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="page-header" style={{ marginBottom: 14 }}>
          <div className="page-eyebrow">Trend 4 Minggu Terakhir</div>
          <select value={trendPlatform} onChange={e => setTrendPlatform(e.target.value)} style={{ width: 160 }}>
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DD" />
            <XAxis dataKey="input_week" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="total_views" name="Views" stroke="#0A4774" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="total_engagement" name="Engagement" stroke="#F2604C" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="page-eyebrow" style={{ marginBottom: 14 }}>Top 5 Konten · {week}</div>
        {topPosts.length === 0 ? (
          <div className="empty-state">Belum ada data.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Platform</th>
                <th>Judul</th>
                <th>Engagement Score</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.map((p, i) => (
                <tr key={p.id}>
                  <td className="metric">#{i + 1}</td>
                  <td><PlatformBadge value={p.platform} /></td>
                  <td>{p.title}</td>
                  <td className="metric">{Number(p.engagement_score).toLocaleString('id-ID')}</td>
                  <td className="metric">{Number(p.views).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
