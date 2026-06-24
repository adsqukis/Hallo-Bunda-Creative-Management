import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/overview?from=2026-06-01&to=2026-06-24
router.get('/', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'Parameter from dan to wajib diisi' });

  try {
    // 1. Akumulasi semua platform
    const accumulation = await pool.query(
      `SELECT COUNT(*) as total_reports,
        COUNT(DISTINCT platform_id) as active_platforms
       FROM reports
       WHERE report_date >= $1 AND report_date <= $2`,
      [from, to]
    );

    // 2. Per platform — aggregate metrics
    const perPlatform = await pool.query(
      `SELECT p.id, p.name, p.slug, p.icon,
        COUNT(r.id) as report_count,
        COALESCE(jsonb_object_agg(rm.metric_key, rm.total) FILTER (WHERE rm.metric_key IS NOT NULL), '{}'::jsonb) as metrics_agg
       FROM platforms p
       LEFT JOIN reports r ON r.platform_id = p.id AND r.report_date >= $1 AND r.report_date <= $2
       LEFT JOIN (
         SELECT report_id, metric_key, SUM(value) as total
         FROM report_metrics
         WHERE report_id IN (SELECT id FROM reports WHERE report_date >= $1 AND report_date <= $2)
         GROUP BY report_id, metric_key
       ) rm ON rm.report_id = r.id
       WHERE p.is_active = true
       GROUP BY p.id, p.name, p.slug, p.icon
       ORDER BY p.sort_order`,
      [from, to]
    );

    // 3. Top 5 content
    const topContents = await pool.query(
      `SELECT tc.*, p.name as platform_name, p.slug as platform_slug
       FROM top_contents tc
       JOIN platforms p ON p.id = tc.platform_id
       WHERE tc.report_date >= $1 AND tc.report_date <= $2
       ORDER BY tc.metric_value DESC
       LIMIT 5`,
      [from, to]
    );

    // Parse metrics
    const platforms = perPlatform.rows.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      icon: p.icon,
      report_count: parseInt(p.report_count),
      metrics: p.metrics_agg || {}
    }));

    // 4. Daily trend per platform (for line charts)
    const dailyTrend = await pool.query(
      `SELECT r.report_date, p.slug as platform_slug, p.name as platform_name,
        jsonb_object_agg(rm.metric_key, rm.value) as metrics
       FROM reports r
       JOIN platforms p ON p.id = r.platform_id
       LEFT JOIN report_metrics rm ON rm.report_id = r.id
       WHERE r.report_date >= $1 AND r.report_date <= $2
       GROUP BY r.report_date, p.slug, p.name
       ORDER BY r.report_date ASC`,
      [from, to]
    );

    res.json({
      from, to,
      accumulation: {
        total_reports: parseInt(accumulation.rows[0]?.total_reports || 0),
        active_platforms: parseInt(accumulation.rows[0]?.active_platforms || 0),
        platforms
      },
      platforms,
      top_contents: topContents.rows,
      daily_trend: dailyTrend.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data overview' });
  }
});

export default router;
