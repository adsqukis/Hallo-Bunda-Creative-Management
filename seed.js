import bcrypt from 'bcryptjs';
import pool from './db.js';

const ADMIN_USERNAME = 'admin';

export async function seedUsers() {
  try {
    // Buat tabel users kalau belum ada
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        created_by VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Cek apakah admin user sudah ada
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [ADMIN_USERNAME]);
    if (existing.rows.length === 0) {
      const defaultPassword = process.env.APP_PASSWORD || 'hallo-bunda-admin';
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await pool.query(
        'INSERT INTO users (username, password, role, created_by) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
        [ADMIN_USERNAME, hashed, 'admin', 'system']
      );
      console.log(`✅ Seed: admin user created (default password from APP_PASSWORD)`);
    } else {
      console.log(`✅ Seed: admin user already exists`);
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
}
