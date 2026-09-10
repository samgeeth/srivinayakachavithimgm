-- Cloudflare D1 Database Schema for Sri Vinayaka Chavithi 2026 Portal
-- Run with: npx wrangler d1 execute vinayaka_db --file=schema.sql

-- 1. Site Settings & SEO
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Committee Members
CREATE TABLE IF NOT EXISTS committee_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'lead',
  phone TEXT NOT NULL,
  village TEXT NOT NULL DEFAULT 'Maraigudem',
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

-- 3. Youth Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  responsibility TEXT NOT NULL,
  phone TEXT NOT NULL,
  image_url TEXT NOT NULL,
  wing TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

-- 4. Sacred Photo Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Festival',
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT '2026',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

-- 5. Festival Sponsors & Patrons
CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Gold',
  contribution TEXT NOT NULL,
  logo TEXT NOT NULL,
  logo_image_url TEXT,
  message TEXT,
  is_featured INTEGER NOT NULL DEFAULT 1,
  is_published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- 6. Schedule Events & Poojas
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  venue TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Pooja',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

-- 7. Work Updates 7-Day Timeline
CREATE TABLE IF NOT EXISTS work_updates (
  id TEXT PRIMARY KEY,
  day INTEGER NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  progress INTEGER NOT NULL DEFAULT 100,
  photos TEXT NOT NULL DEFAULT '[]',
  lead TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

-- 8. Live Announcements & Bulletin Posts
CREATE TABLE IF NOT EXISTS live_updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  time_ago TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  content TEXT NOT NULL,
  tag TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  reactions TEXT NOT NULL DEFAULT '{}',
  is_published INTEGER NOT NULL DEFAULT 1
);

-- 9. Devotee Donations Ledger
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  donor_name TEXT NOT NULL,
  village TEXT,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI / PhonePe',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  receipt_no TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Verified',
  message TEXT,
  timestamp INTEGER NOT NULL
);

-- 10. Admin Users & Active Sessions
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'superadmin',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_committee_published ON committee_members(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_volunteers_published ON volunteers(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_published ON gallery(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_sponsors_published ON sponsors(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_live_updates_ts ON live_updates(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_donations_ts ON donations(timestamp DESC);

