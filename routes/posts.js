import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET semua posts, filter by platform & week opsional
// /api/posts?platform=instagram&week=2026-W26
router.get('/', async (req, res) => {
  try {
    const { platform, week } = req.query;
    let query = 'SELECT * FROM posts WHERE 1=1';
    const params = [];

    if (platform) {
      params.push(platform);
      query += ` AND platform = $${params.length}`;
    }
    if (week) {
      params.push(week);
      query += ` AND input_week = $${params.length}`;
    }
    query += ' ORDER BY publish_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data posts' });
  }
});

const NUMERIC_FIELDS = ['views', 'likes', 'comments', 'shares', 'reach', 'impressions'];

function validateNumericFields(body) {
  for (const field of NUMERIC_FIELDS) {
    if (body[field] !== undefined && body[field] !== null) {
      const n = Number(body[field]);
      if (Number.isNaN(n) || n < 0) {
        return `Field ${field} harus angka 0 atau lebih`;
      }
    }
  }
  return null;
}

// POST input data manual mingguan
router.post('/', async (req, res) => {
  try {
    const {
      platform, title, url, publish_date,
      views, likes, comments, shares, reach, impressions,
      input_week, created_by
    } = req.body;

    if (!platform || !title || !publish_date) {
      return res.status(400).json({ error: 'Platform, title, dan publish_date wajib diisi' });
    }

    const validationError = validateNumericFields(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const result = await pool.query(
      `INSERT INTO posts
        (platform, title, url, publish_date, views, likes, comments, shares, reach, impressions, input_week, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [platform, title, url, publish_date, views || 0, likes || 0, comments || 0, shares || 0, reach || 0, impressions || 0, input_week, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan data post' });
  }
});

// PUT update post (misal koreksi data input minggu ini)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, url, views, likes, comments, shares, reach, impressions
    } = req.body;

    const validationError = validateNumericFields(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const result = await pool.query(
      `UPDATE posts SET
        title = COALESCE($1, title),
        url = COALESCE($2, url),
        views = COALESCE($3, views),
        likes = COALESCE($4, likes),
        comments = COALESCE($5, comments),
        shares = COALESCE($6, shares),
        reach = COALESCE($7, reach),
        impressions = COALESCE($8, impressions),
        updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, url, views, likes, comments, shares, reach, impressions, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal update post' });
  }
});

// DELETE post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post tidak ditemukan' });
    }
    res.json({ message: 'Post dihapus', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus post' });
  }
});

export default router;
