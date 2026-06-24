import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import postsRouter from './routes/posts.js';
import calendarRouter from './routes/calendar.js';
import requestsRouter from './routes/requests.js';
import briefRouter from './routes/brief.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET || !process.env.APP_PASSWORD) {
  console.error('JWT_SECRET dan APP_PASSWORD wajib diisi di .env sebelum server dijalankan.');
  process.exit(1);
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);

app.use('/api/posts', requireAuth, postsRouter);
app.use('/api/calendar', requireAuth, calendarRouter);
app.use('/api/requests', requireAuth, requestsRouter);
app.use('/api/brief', requireAuth, briefRouter);
app.use('/api/analytics', requireAuth, analyticsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
