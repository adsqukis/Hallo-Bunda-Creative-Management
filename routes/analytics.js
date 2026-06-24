import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET evaluasi mingguan: total + rata-rata per platform untuk minggu tertentu
// /api/analytics/weekly?week=2026-W26
router.get('/weekly', async (req, res) => {
  try {
    const { week } = req.query;
    if (!week) {
      return res.status(400).json({ error: 'Parameter week wajib diisi, format: 2026-W26' });
    }

    const result = await pool.query(
      `SELECT
        platform,
        COUNT(*) as total_posts,
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(shares) as total_shares,
        SUM(reach) as total_reach,
        ROUND(AVG(views)) as avg_views,
        ROUND(AVG(likes + comments + shares)::numeric, 2) as avg_engagement
       FROM posts
       WHERE input_week = $1
       GROUP BY platform
       ORDER BY total_views DESC`,
      [week]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data evaluasi mingguan' });
  }
});

// GET trend antar minggu untuk satu platform
// /api/analytics/trend?platform=instagram&weeks=2026-W24,2026-W25,2026-W26
router.get('/trend', async (req, res) => {
  try {
    const { platform, weeks } = req.query;
    if (!platform || !weeks) {
      return res.status(400).json({ error: 'Parameter platform dan weeks wajib diisi' });
    }
    const weekList = weeks.split(',');

    const result = await pool.query(
      `SELECT
        input_week,
        SUM(views) as total_views,
        SUM(likes + comments + shares) as total_engagement
       FROM posts
       WHERE platform = $1 AND input_week = ANY($2)
       GROUP BY input_week
       ORDER BY input_week ASC`,
      [platform, weekList]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data trend' });
  }
});

// GET top performing posts untuk minggu tertentu
// /api/analytics/top-posts?week=2026-W26&limit=5
router.get('/top-posts', async (req, res) => {
  try {
    const { week, limit } = req.query;
    if (!week) {
      return res.status(400).json({ error: 'Parameter week wajib diisi' });
    }

    const result = await pool.query(
      `SELECT *, (likes + comments + shares) as engagement_score
       FROM posts
       WHERE input_week = $1
       ORDER BY engagement_score DESC
       LIMIT $2`,
      [week, limit || 5]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil top posts' });
  }
});

// GET KPI per platform: current week + previous week comparison
// /api/analytics/kpi?week=2026-W26
router.get('/kpi', async (req, res) => {
  try {
    const { week } = req.query;
    if (!week) {
      return res.status(400).json({ error: 'Parameter week wajib diisi, format: 2026-W26' });
    }

    // Hitung minggu sebelumnya
    const [year, w] = week.split('-W');
    const weekNum = parseInt(w);
    const prevWeekNum = weekNum > 1 ? weekNum - 1 : 52;
    const prevYear = weekNum > 1 ? year : parseInt(year) - 1;
    const prevWeek = `${prevYear}-W${String(prevWeekNum).padStart(2, '0')}`;

    // Current week data
    const current = await pool.query(
      `SELECT
        platform,
        COUNT(*) as total_posts,
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(shares) as total_shares,
        SUM(reach) as total_reach,
        SUM(impressions) as total_impressions,
        ROUND(AVG(views)) as avg_views,
        ROUND(AVG(likes + comments + shares)::numeric, 2) as avg_engagement
      FROM posts
      WHERE input_week = $1
      GROUP BY platform`,
      [week]
    );

    // Previous week data
    const previous = await pool.query(
      `SELECT
        platform,
        SUM(views) as total_views,
        SUM(likes + comments + shares) as total_engagement
      FROM posts
      WHERE input_week = $1
      GROUP BY platform`,
      [prevWeek]
    );

    const prevMap = Object.fromEntries(
      previous.rows.map(r => [r.platform, { views: Number(r.total_views), engagement: Number(r.total_engagement) }])
    );

    const platforms = ['instagram', 'tiktok', 'youtube', 'website', 'threads'];
    const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', website: 'Website', threads: 'Threads' };

    const result = platforms.map(p => {
      const cur = current.rows.find(r => r.platform === p);
      const prev = prevMap[p];
      const views = Number(cur?.total_views || 0);
      const prevViews = Number(prev?.views || 0);
      const likes = Number(cur?.total_likes || 0);
      const comments = Number(cur?.total_comments || 0);
      const shares = Number(cur?.total_shares || 0);
      const reach = Number(cur?.total_reach || 0);
      const impressions = Number(cur?.total_impressions || 0);
      const posts = Number(cur?.total_posts || 0);

      const engagement = likes + comments + shares;
      const engagementRate = views > 0 ? (engagement / views) * 100 : 0;
      const viewsGrowth = prevViews > 0 ? ((views - prevViews) / prevViews) * 100 : 0;
      const avgViews = posts > 0 ? Math.round(views / posts) : 0;
      const avgEng = posts > 0 ? Math.round((engagement / posts) * 100) / 100 : 0;
      const reachRate = impressions > 0 ? (reach / impressions) * 100 : 0;

      return {
        platform: p,
        label: PLATFORM_LABELS[p],
        posts,
        total_views: views,
        total_likes: likes,
        total_comments: comments,
        total_shares: shares,
        total_engagement: engagement,
        engagement_rate: Math.round(engagementRate * 100) / 100,
        views_growth: Math.round(viewsGrowth * 100) / 100,
        avg_views: avgViews,
        avg_engagement: avgEng,
        reach_rate: Math.round(reachRate * 100) / 100,
        prev_week: prevWeek,
        has_data: views > 0
      };
    });

    res.json({ week, prev_week: prevWeek, platforms: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data KPI' });
  }
});

export default router;
