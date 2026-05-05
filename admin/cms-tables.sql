-- =====================================================
-- ASSEMBLÉE NATIONALE — CMS Tables v2
-- Copiez et exécutez dans Supabase > SQL Editor
-- =====================================================

-- ── Articles / Publications / Blog ──────────────────
CREATE TABLE IF NOT EXISTS articles (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  excerpt        TEXT,
  content        TEXT,
  category       TEXT DEFAULT 'Publication',
  featured_image TEXT,
  author         TEXT DEFAULT 'Assemblée Nationale',
  status         TEXT DEFAULT 'draft',
  active         BOOLEAN DEFAULT true,
  published_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Auth manage articles" ON articles
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Pages personnalisées ─────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  content          TEXT,
  meta_description TEXT,
  status           TEXT DEFAULT 'draft',
  active           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pages" ON pages
  FOR SELECT USING (true);

CREATE POLICY "Auth manage pages" ON pages
  FOR ALL USING (auth.role() = 'authenticated');
