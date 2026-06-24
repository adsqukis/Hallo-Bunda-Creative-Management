import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Login dengan satu shared password untuk seluruh tim internal.
// Tidak ada konsep "username" — siapa pun yang tahu password tim bisa masuk.
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password wajib diisi' });
  }

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Password salah' });
  }

  const token = jwt.sign({ team: 'hallobunda-internal' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

export default router;
