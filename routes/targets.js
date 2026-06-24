import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/targets?month=6&year=2026
router.get('/', async (req, res) => {
  const { month, year } = req.query;
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  try {
    const result = await pool.query(
      `SELECT kt.*, p.name as platform_name, p.slug as platform_slug,
        km.metric_label, km.unit
       FROM kpi_targets kt
       JOIN platforms p ON p.id = kt.platform_id
       JOIN kpi_metrics km ON km.platform_id = kt.platform_id AND km.metric_key = kt.metric_key
       WHERE kt.month = $1 AND kt.year = $2
       ORDER BY p.sort_order, km.sort_order`,
      [m, y]
    );
    // Group by platform
    const grouped = {};
    result.rows.forEach(r => {
      const key = r.platform_id;
      if (!grouped[key]) {
        grouped[key] = {
          platform_id: r.platform_id,
          platform_name: r.platform_name,
          platform_slug: r.platform_slug,
          targets: []
        };
      }
      grouped[key].targets.push({
        id: r.id,
        metric_key: r.metric_key,
        metric_label: r.metric_label,
        unit: r.unit,
        target_value: Number(r.target_value)
      });
    });
    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data target' });
  }
});

// POST /api/targets — set/update target
router.post('/', async (req, res) => {
  const { platform_id, metric_key, month, year, target_value } = req.body;
  if (!platform_id || !metric_key || target_value === undefined) {
    return res.status(400).json({ error: 'Data target tidak lengkap' });
  }
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  try {
    const result = await pool.query(
      `INSERT INTO kpi_targets (platform_id, metric_key, month, year, target_value)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (platform_id, metric_key, month, year)
       DO UPDATE SET target_value = $5, updated_at = NOW()
       RETURNING *`,
      [platform_id, metric_key, m, y, target_value]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan target' });
  }
});

// DELETE /api/targets/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM kpi_targets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Target berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus target' });
  }
});

export default router;
