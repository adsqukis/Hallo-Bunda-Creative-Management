-- Schema untuk Social Media Internal Tool
-- Jalankan ini sekali di database Railway PostgreSQL

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'website', 'threads')),
  title VARCHAR(255) NOT NULL,
  url TEXT,
  publish_date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  input_week VARCHAR(10),
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_content (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'website', 'threads')),
  title VARCHAR(255) NOT NULL,
  brief_objective TEXT,
  brief_key_message TEXT,
  brief_cta TEXT,
  tone VARCHAR(50),
  style VARCHAR(50),
  scheduled_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  assigned_to VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_requests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('design', 'video', 'artikel', 'lainnya')),
  description TEXT,
  requested_by VARCHAR(100),
  assigned_to VARCHAR(100),
  deadline DATE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_input_week ON posts(input_week);
CREATE INDEX IF NOT EXISTS idx_calendar_scheduled_date ON calendar_content(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_requests_status ON content_requests(status);

-- ============================================================
-- Platform Management (ditambahkan 24 Jun 2026)
-- ============================================================
CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  icon VARCHAR(10) DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default platforms
INSERT INTO platforms (name, slug, icon, sort_order) VALUES
  ('Instagram', 'instagram', '📸', 1),
  ('TikTok', 'tiktok', '🎵', 2),
  ('YouTube', 'youtube', '▶️', 3),
  ('Website', 'website', '🌐', 4),
  ('Threads', 'threads', '🧵', 5)
ON CONFLICT (slug) DO NOTHING;

-- KPI Metrics per platform
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
  metric_key VARCHAR(50) NOT NULL,
  metric_label VARCHAR(100) NOT NULL,
  unit VARCHAR(30) DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(platform_id, metric_key)
);

-- Seed KPI metrics per platform
INSERT INTO kpi_metrics (platform_id, metric_key, metric_label, unit, sort_order)
SELECT p.id, m.metric_key, m.metric_label, m.unit, m.sort_order FROM platforms p, (VALUES
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
ON CONFLICT (platform_id, metric_key) DO NOTHING;

-- KPI Targets (monthly per platform per metric)
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
);

-- Reports (daily input by members)
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Report metrics (flexible key-value per report)
CREATE TABLE IF NOT EXISTS report_metrics (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
  metric_key VARCHAR(50) NOT NULL,
  value NUMERIC(15,2) DEFAULT 0,
  UNIQUE(report_id, metric_key)
);

-- Top content for overview
CREATE TABLE IF NOT EXISTS top_contents (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT DEFAULT '',
  metric_key VARCHAR(50) NOT NULL,
  metric_value NUMERIC(15,2) DEFAULT 0,
  report_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- User Management (ditambahkan 24 Jun 2026)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
