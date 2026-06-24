import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/reports?platform=instagram&from=2026-06-01&to=2026-06-24
router.get('/', async (req, res) => {
  const { platform, from, to, limit } = req.query;
  try {
    let sql = `SELECT r.*, p.name as platform_name, p.slug as platform_slug,
               u.username as created_by_name
               FROM reports r
               JOIN platforms p ON p.id = r.platform_id
               LEFT JOIN users u ON u.id = r.created_by
               WHERE 1=1`;
    const params = [];
    if (platform) { params.push(platform); sql += ` AND p.slug = $${params.length}`; }
    if (from) { params.push(from); sql += ` AND r.report_date >= $${params.length}`; }
    if (to) { params.push(to); sql += ` AND r.report_date <= $${params.length}`; }
    sql += ' ORDER BY r.report_date DESC, r.created_at DESC';
    if (limit) { params.push(parseInt(limit)); sql += ` LIMIT $${params.length}`; }

    const reports = await pool.query(sql, params);

    // Get metrics for each report
    const reportIds = reports.rows.map(r => r.id);
    if (reportIds.length > 0) {
      const metrics = await pool.query(
        'SELECT * FROM report_metrics WHERE report_id = ANY($1)',
        [reportIds]
      );
      const metricsByReport = {};
      metrics.rows.forEach(m => {
        if (!metricsByReport[m.report_id]) metricsByReport[m.report_id] = {};
        metricsByReport[m.report_id][m.metric_key] = Number(m.value);
      });
      reports.rows.forEach(r => {
        r.metrics = metricsByReport[r.id] || {};
      });
    }

    res.json(reports.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil laporan' });
  }
});

// POST /api/reports — create report with metrics
router.post('/', async (req, res) => {
  const { platform_id, report_date, metrics, notes } = req.body;
  if (!platform_id || !report_date || !metrics) {
    return res.status(400).json({ error: 'Platform, tanggal, dan metrics wajib diisi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const report = await client.query(
      'INSERT INTO reports (platform_id, report_date, notes, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [platform_id, report_date, notes || '', req.user?.userId || null]
    );
    const reportId = report.rows[0].id;

    for (const [key, value] of Object.entries(metrics)) {
      if (value !== '' && value !== null && !isNaN(value)) {
        await client.query(
          'INSERT INTO report_metrics (report_id, metric_key, value) VALUES ($1, $2, $3)',
          [reportId, key, parseFloat(value)]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(report.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan laporan' });
  } finally {
    client.release();
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reports WHERE id = $1', [req.params.id]);
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus laporan' });
  }
});

export default router;
