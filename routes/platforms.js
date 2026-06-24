import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all platforms with their KPI metrics
router.get('/', async (req, res) => {
  try {
    const platforms = await pool.query(
      'SELECT * FROM platforms WHERE is_active = true ORDER BY sort_order'
    );
    const metrics = await pool.query(
      'SELECT km.*, p.slug as platform_slug FROM kpi_metrics km JOIN platforms p ON p.id = km.platform_id WHERE km.is_active = true ORDER BY km.sort_order'
    );

    const result = platforms.rows.map(p => ({
      ...p,
      metrics: metrics.rows.filter(m => m.platform_id === p.id).map(m => ({
        metric_key: m.metric_key,
        metric_label: m.metric_label,
        unit: m.unit
      }))
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data platform' });
  }
});

// POST new platform (admin only — auth handled by server.js)
router.post('/', async (req, res) => {
  const { name, slug, icon } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'Nama dan slug wajib diisi' });
  try {
    const result = await pool.query(
      'INSERT INTO platforms (name, slug, icon) VALUES ($1, $2, $3) RETURNING *',
      [name, slug.toLowerCase(), icon || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Platform sudah ada' });
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah platform' });
  }
});

// DELETE platform
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM platforms WHERE id = $1', [req.params.id]);
    res.json({ message: 'Platform berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus platform' });
  }
});

export default router;
