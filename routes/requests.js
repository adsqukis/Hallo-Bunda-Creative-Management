import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET semua content requests, filter by status opsional
router.get('/', async (req, res) => {
  try {
    const { status, assigned_to } = req.query;
    let query = 'SELECT * FROM content_requests WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (assigned_to) {
      params.push(assigned_to);
      query += ` AND assigned_to = $${params.length}`;
    }
    query += ' ORDER BY deadline ASC NULLS LAST';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data requests' });
  }
});

// POST buat request baru
router.post('/', async (req, res) => {
  try {
    const {
      title, type, description, requested_by, assigned_to,
      deadline, priority
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title dan type wajib diisi' });
    }

    const result = await pool.query(
      `INSERT INTO content_requests
        (title, type, description, requested_by, assigned_to, deadline, priority)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [title, type, description, requested_by, assigned_to, deadline, priority || 'medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan request' });
  }
});

// PUT update status request (pending -> in_progress -> done)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, deadline, priority, status } = req.body;

    const result = await pool.query(
      `UPDATE content_requests SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        assigned_to = COALESCE($3, assigned_to),
        deadline = COALESCE($4, deadline),
        priority = COALESCE($5, priority),
        status = COALESCE($6, status),
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, assigned_to, deadline, priority, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal update request' });
  }
});

// DELETE request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM content_requests WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request tidak ditemukan' });
    }
    res.json({ message: 'Request dihapus', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus request' });
  }
});

export default router;
