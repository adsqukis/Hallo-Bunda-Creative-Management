import jwt from 'jsonwebtoken';

// Middleware untuk verifikasi token JWT di setiap request ke data API.
// Tim internal pakai satu shared password (lihat routes/auth.js), bukan akun per-user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Belum login. Silakan login dulu.' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi habis atau token tidak valid. Login ulang.' });
  }
}
