import jwt from 'jsonwebtoken';

// Middleware untuk verifikasi token JWT
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Belum login. Silakan login dulu.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi habis atau token tidak valid. Login ulang.' });
  }
}

// Middleware untuk memastikan role admin
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang bisa mengakses.' });
  }
  next();
}
