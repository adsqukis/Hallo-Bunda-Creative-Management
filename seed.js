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
      console.log(`✅ Seed: admin user created`);
    } else {
      console.log(`✅ Seed: admin user already exists`);
    }

    // Seed platforms
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platforms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(10) DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      INSERT INTO platforms (name, slug, icon, sort_order) VALUES
        ('Instagram', 'instagram', '📸', 1),
        ('TikTok', 'tiktok', '🎵', 2),
        ('YouTube', 'youtube', '▶️', 3),
        ('Website', 'website', '🌐', 4),
        ('Threads', 'threads', '🧵', 5)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Seed kpi_metrics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kpi_metrics (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
        metric_key VARCHAR(50) NOT NULL,
        metric_label VARCHAR(100) NOT NULL,
        unit VARCHAR(30) DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(platform_id, metric_key)
      )
    `);

    // Seed KPI metrics per platform
    await pool.query(`
      INSERT INTO kpi_metrics (platform_id, metric_key, metric_label, unit, sort_order)
      SELECT p.id, m.* FROM platforms p, (VALUES
        ('instagram','reach','Reach','',1),
        ('instagram','impressions','Impressions','',2),
        ('instagram','likes','Likes','',3),
        ('instagram','comments','Comments','',4),
        ('instagram','shares','Saves & Shares','',5),
        ('instagram','profile_visits','Profile Visits','',6),
        ('instagram','follower_growth','Follower Growth','orang',7),
        ('tiktok','views','Video Views','',1),
        ('tiktok','completion_rate','Completion Rate','%',2),
        ('tiktok','likes','Likes','',3),
        ('tiktok','comments','Comments','',4),
        ('tiktok','shares','Shares','',5),
        ('tiktok','engagement_rate','Engagement Rate','%',6),
        ('youtube','views','View Count','',1),
        ('youtube','watch_time','Watch Time','jam',2),
        ('youtube','avg_duration','Avg View Duration','detik',3),
        ('youtube','subscriber_growth','Subscriber Growth','orang',4),
        ('youtube','ctr','CTR','%',5),
        ('youtube','likes','Likes','',6),
        ('youtube','comments','Comments','',7),
        ('website','organic_traffic','Organic Traffic','',1),
        ('website','bounce_rate','Bounce Rate','%',2),
        ('website','conversion_rate','Conversion Rate','%',3),
        ('website','avg_time_on_page','Avg Time on Page','detik',4),
        ('website','likes','Likes','',5),
        ('website','comments','Comments','',6),
        ('threads','replies_rate','Replies Rate','',1),
        ('threads','reposts','Reposts / Quotes','',2),
        ('threads','follower_growth','Followers Growth','orang',3),
        ('threads','likes','Likes','',4),
        ('threads','comments','Replies','',5),
        ('threads','engagement_rate','Engagement Rate','%',6)
      ) AS m(platform_slug, metric_key, metric_label, unit, sort_order)
      WHERE p.slug = m.platform_slug
      ON CONFLICT (platform_id, metric_key) DO NOTHING
    `);

    // Seed kpi_targets, reports, report_metrics, top_contents tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kpi_targets (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
        metric_key VARCHAR(50) NOT NULL,
        month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
        year INTEGER NOT NULL,
        target_value NUMERIC(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(platform_id, metric_key, month, year)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
        report_date DATE NOT NULL,
        notes TEXT DEFAULT '',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS report_metrics (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
        metric_key VARCHAR(50) NOT NULL,
        value NUMERIC(15,2) DEFAULT 0,
        UNIQUE(report_id, metric_key)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS top_contents (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        url TEXT DEFAULT '',
        metric_key VARCHAR(50) NOT NULL,
        metric_value NUMERIC(15,2) DEFAULT 0,
        report_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Seed: semua tabel tersedia');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
}
