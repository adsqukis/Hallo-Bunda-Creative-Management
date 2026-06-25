import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET semua konten kalender, filter by bulan atau range tanggal
// /api/calendar?month=2026-06&from=2026-06-01&to=2026-06-30
router.get('/', async (req, res) => {
  try {
    const { month, from, to, platform, status } = req.query;
    let query = 'SELECT * FROM calendar_content WHERE 1=1';
    const params = [];

    if (month) {
      params.push(`${month}%`);
      query += ` AND TO_CHAR(scheduled_date, 'YYYY-MM') = $${params.length}`;
    }
    if (from) {
      params.push(from);
      query += ` AND scheduled_date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      query += ` AND scheduled_date <= $${params.length}`;
    }
    if (platform) {
      params.push(platform);
      query += ` AND platform = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    query += ' ORDER BY scheduled_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data kalender' });
  }
});

// POST buat konten baru di kalender (brief bisa kosong, diisi via AI generator nanti)
router.post('/', async (req, res) => {
  try {
    const {
      platform, title, brief_objective, brief_key_message, brief_cta,
      tone, style, scheduled_date, status, assigned_to
    } = req.body;

    if (!platform || !title || !scheduled_date) {
      return res.status(400).json({ error: 'Platform, title, dan scheduled_date wajib diisi' });
    }

    const result = await pool.query(
      `INSERT INTO calendar_content
        (platform, title, brief_objective, brief_key_message, brief_cta, tone, style, scheduled_date, status, assigned_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [platform, title, brief_objective, brief_key_message, brief_cta, tone, style, scheduled_date, status || 'draft', assigned_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan konten kalender' });
  }
});

// PUT update konten (termasuk save brief hasil edit dari AI generator)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, brief_objective, brief_key_message, brief_cta,
      tone, style, scheduled_date, status, assigned_to
    } = req.body;

    const result = await pool.query(
      `UPDATE calendar_content SET
        title = COALESCE($1, title),
        brief_objective = COALESCE($2, brief_objective),
        brief_key_message = COALESCE($3, brief_key_message),
        brief_cta = COALESCE($4, brief_cta),
        tone = COALESCE($5, tone),
        style = COALESCE($6, style),
        scheduled_date = COALESCE($7, scheduled_date),
        status = COALESCE($8, status),
        assigned_to = COALESCE($9, assigned_to),
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [title, brief_objective, brief_key_message, brief_cta, tone, style, scheduled_date, status, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Konten tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal update konten kalender' });
  }
});

// DELETE konten
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM calendar_content WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Konten tidak ditemukan' });
    }
    res.json({ message: 'Konten dihapus', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus konten' });
  }
});

export default router;
