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

-- Index pour recherche rapide par slug et filtrage
CREATE INDEX IF NOT EXISTS articles_slug_idx   ON articles (slug);
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status, active);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Visiteurs anonymes : uniquement les articles publiés et actifs
CREATE POLICY "Anon read published articles" ON articles
  FOR SELECT TO anon
  USING (status = 'published' AND active = true);

-- Admin connecté : tout lire (y compris brouillons)
CREATE POLICY "Auth read all articles" ON articles
  FOR SELECT TO authenticated
  USING (true);

-- Admin connecté : créer, modifier, supprimer
CREATE POLICY "Auth manage articles" ON articles
  FOR ALL TO authenticated
  USING (true);

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

-- Index pour recherche rapide par slug
CREATE INDEX IF NOT EXISTS pages_slug_idx   ON pages (slug);
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages (status, active);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Visiteurs anonymes : uniquement les pages publiées et actives
CREATE POLICY "Anon read published pages" ON pages
  FOR SELECT TO anon
  USING (status = 'published' AND active = true);

-- Admin connecté : tout lire
CREATE POLICY "Auth read all pages" ON pages
  FOR SELECT TO authenticated
  USING (true);

-- Admin connecté : créer, modifier, supprimer
CREATE POLICY "Auth manage pages" ON pages
  FOR ALL TO authenticated
  USING (true);

-- ── Trigger updated_at automatique ──────────────────
-- Met à jour updated_at à chaque modification de ligne

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
