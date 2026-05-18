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

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public read articles"         ON articles;
DROP POLICY IF EXISTS "Auth manage articles"         ON articles;
DROP POLICY IF EXISTS "Anon read published articles" ON articles;
DROP POLICY IF EXISTS "Auth read all articles"       ON articles;

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

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public read pages"         ON pages;
DROP POLICY IF EXISTS "Auth manage pages"         ON pages;
DROP POLICY IF EXISTS "Anon read published pages" ON pages;
DROP POLICY IF EXISTS "Auth read all pages"       ON pages;

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

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Colonnes supplémentaires bureau ─────────────────
ALTER TABLE bureau ADD COLUMN IF NOT EXISTS biography    TEXT;
ALTER TABLE bureau ADD COLUMN IF NOT EXISTS constituency TEXT;

-- ── Messages de contact ──────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        TEXT NOT NULL,
  prenom     TEXT,
  email      TEXT NOT NULL,
  sujet      TEXT NOT NULL,
  message    TEXT NOT NULL,
  lu         BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Auth read messages"   ON contact_messages;
DROP POLICY IF EXISTS "Auth manage messages" ON contact_messages;

-- N'importe qui peut envoyer un message
CREATE POLICY "Anon insert messages" ON contact_messages
  FOR INSERT TO anon WITH CHECK (true);

-- Admin lit et gère tous les messages
CREATE POLICY "Auth read messages" ON contact_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth manage messages" ON contact_messages
  FOR ALL TO authenticated USING (true);

-- ── Députés ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deputes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  num          INT,
  name         TEXT NOT NULL,
  department   TEXT,
  constituency TEXT,
  groupe       TEXT DEFAULT 'PCT',
  photo_url    TEXT,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deputes_name_idx  ON deputes (name);
CREATE INDEX IF NOT EXISTS deputes_dept_idx  ON deputes (department);

ALTER TABLE deputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon read deputes"  ON deputes;
DROP POLICY IF EXISTS "Auth manage deputes" ON deputes;

CREATE POLICY "Anon read deputes" ON deputes
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "Auth manage deputes" ON deputes
  FOR ALL TO authenticated USING (true);

DROP TRIGGER IF EXISTS deputes_updated_at ON deputes;
CREATE TRIGGER deputes_updated_at
  BEFORE UPDATE ON deputes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
