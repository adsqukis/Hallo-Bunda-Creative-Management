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

export default router;
