import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Semua endpoint users requires auth + admin
router.use(requireAuth, requireAdmin);

// GET /api/users — daftar semua user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_by, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// POST /api/users — tambah user baru
router.post('/', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username minimal 3 karakter' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  const validRoles = ['admin', 'member'];
  const userRole = validRoles.includes(role) ? role : 'member';

  try {
    // Cek duplikat username
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, role, created_by) VALUES ($1, $2, $3, $4) RETURNING id, username, role, created_at',
      [username, hashedPassword, userRole, req.user.username]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Gagal menambahkan user' });
  }
});

// DELETE /api/users/:id — hapus user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Cek user target
    const target = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Cegah hapus diri sendiri
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
    }

    // Cegah hapus admin terakhir
    if (target.rows[0].role === 'admin') {
      const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'Tidak bisa menghapus admin terakhir' });
      }
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: `User ${target.rows[0].username} berhasil dihapus` });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
});

export default router;
