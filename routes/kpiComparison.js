import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/analytics/kpi-comparison?month=6&year=2026
// Bandingkan target (kpi_targets) vs capaian (reports/report_metrics) per platform
router.get('/', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Ambil semua platform aktif
    const platforms = await pool.query(
      'SELECT id, name, slug, icon FROM platforms WHERE is_active = true ORDER BY sort_order'
    );

    // Ambil semua target untuk bulan & tahun ini
    const targets = await pool.query(
      `SELECT kt.platform_id, kt.metric_key, kt.target_value, km.metric_label, km.unit
       FROM kpi_targets kt
       JOIN kpi_metrics km ON km.platform_id = kt.platform_id AND km.metric_key = kt.metric_key
       WHERE kt.month = $1 AND kt.year = $2`,
      [month, year]
    );

    // Group target per platform_id
    const targetMap = {};
    for (const t of targets.rows) {
      if (!targetMap[t.platform_id]) targetMap[t.platform_id] = {};
      targetMap[t.platform_id][t.metric_key] = {
        target_value: parseFloat(t.target_value),
        metric_label: t.metric_label,
        unit: t.unit
      };
    }

    // Ambil semua metrik yang terdefinisi per platform
    const allMetrics = await pool.query(
      'SELECT platform_id, metric_key, metric_label, unit FROM kpi_metrics ORDER BY platform_id, sort_order'
    );
    const metricDefMap = {};
    for (const m of allMetrics.rows) {
      if (!metricDefMap[m.platform_id]) metricDefMap[m.platform_id] = [];
      metricDefMap[m.platform_id].push({
        metric_key: m.metric_key,
        metric_label: m.metric_label,
        unit: m.unit
      });
    }

    // Ambil capaian aktual dari report_metrics di bulan ini
    const actuals = await pool.query(
      `SELECT r.platform_id, rm.metric_key, SUM(rm.value) as actual_value
       FROM reports r
       JOIN report_metrics rm ON rm.report_id = r.id
       WHERE EXTRACT(MONTH FROM r.report_date) = $1
         AND EXTRACT(YEAR FROM r.report_date) = $2
       GROUP BY r.platform_id, rm.metric_key`,
      [month, year]
    );

    const actualMap = {};
    for (const a of actuals.rows) {
      if (!actualMap[a.platform_id]) actualMap[a.platform_id] = {};
      actualMap[a.platform_id][a.metric_key] = parseFloat(a.actual_value);
    }

    // Jumlah laporan per platform di bulan ini
    const reportCounts = await pool.query(
      `SELECT platform_id, COUNT(*) as report_count,
        COUNT(DISTINCT report_date) as active_days
       FROM reports
       WHERE EXTRACT(MONTH FROM report_date) = $1
         AND EXTRACT(YEAR FROM report_date) = $2
       GROUP BY platform_id`,
      [month, year]
    );
    const reportCountMap = {};
    for (const r of reportCounts.rows) {
      reportCountMap[r.platform_id] = {
        report_count: parseInt(r.report_count),
        active_days: parseInt(r.active_days)
      };
    }

    // Build response per platform
    const result = platforms.rows.map(p => {
      const platformTargets = targetMap[p.id] || {};
      const platformActuals = actualMap[p.id] || {};
      const platformMetrics = metricDefMap[p.id] || [];
      const rc = reportCountMap[p.id];

      const metrics = platformMetrics.map(m => {
        const target = platformTargets[m.metric_key];
        const actual = platformActuals[m.metric_key];
        const targetVal = target?.target_value || null;
        const actualVal = actual !== undefined ? actual : null;

        let percentage = null;
        let status = 'no_target';

        if (targetVal !== null && targetVal > 0) {
          if (actualVal !== null) {
            percentage = Math.round((actualVal / targetVal) * 100 * 100) / 100;
            if (percentage >= 90) status = 'on_track';
            else if (percentage >= 70) status = 'warning';
            else status = 'missed';
          } else {
            status = 'no_data';
          }
        } else if (targetVal === null) {
          status = 'no_target';
        }

        return {
          metric_key: m.metric_key,
          metric_label: m.metric_label,
          unit: m.unit || '',
          target: targetVal,
          actual: actualVal,
          percentage,
          status
        };
      });

      // Hitung overall platform
      const metricsWithTarget = metrics.filter(m => m.target !== null && m.target > 0);
      const achieved = metricsWithTarget.filter(m => m.status === 'on_track').length;
      const warned = metricsWithTarget.filter(m => m.status === 'warning').length;
      const missed = metricsWithTarget.filter(m => m.status === 'missed').length;
      const noData = metricsWithTarget.filter(m => m.status === 'no_data').length;

      const overallPercentage = metricsWithTarget.length > 0
        ? Math.round(metricsWithTarget.reduce((s, m) => s + (m.percentage || 0), 0) / metricsWithTarget.length * 100) / 100
        : null;

      return {
        platform_id: p.id,
        platform_name: p.name,
        platform_slug: p.slug,
        platform_icon: p.icon,
        report_count: rc?.report_count || 0,
        active_days: rc?.active_days || 0,
        metrics,
        summary: {
          total_metrics: metricsWithTarget.length,
          on_track: achieved,
          warning: warned,
          missed,
          no_data: noData,
          overall_percentage: overallPercentage
        }
      };
    });

    res.json({
      month,
      year,
      platforms: result
    });
  } catch (err) {
    console.error('KPI comparison error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data perbandingan KPI' });
  }
});

export default router;
