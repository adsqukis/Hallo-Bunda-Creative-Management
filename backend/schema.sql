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
