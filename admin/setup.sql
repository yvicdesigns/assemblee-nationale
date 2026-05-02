-- ================================================
-- ASSEMBLÉE NATIONALE CMS — Setup Supabase
-- Coller ce script dans : Supabase > SQL Editor > New Query
-- ================================================

-- 1. TABLES

CREATE TABLE IF NOT EXISTS slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_text TEXT,
  category TEXT DEFAULT 'Actualité',
  image_url TEXT,
  bg_gradient TEXT DEFAULT 'linear-gradient(135deg, #0a3d1f, #1a6b36)',
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actualites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Actualité',
  image_url TEXT,
  content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bureau (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_title TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS agenda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_text TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parametres (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY

ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bureau ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;

-- Lecture publique (le site)
CREATE POLICY "Public read slides" ON slides FOR SELECT USING (true);
CREATE POLICY "Public read actualites" ON actualites FOR SELECT USING (true);
CREATE POLICY "Public read bureau" ON bureau FOR SELECT USING (true);
CREATE POLICY "Public read agenda" ON agenda FOR SELECT USING (true);
CREATE POLICY "Public read parametres" ON parametres FOR SELECT USING (true);

-- Écriture admin uniquement (utilisateur connecté)
CREATE POLICY "Auth manage slides" ON slides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage actualites" ON actualites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage bureau" ON bureau FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage agenda" ON agenda FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage parametres" ON parametres FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. DONNÉES PAR DÉFAUT

INSERT INTO parametres (key, value) VALUES
  ('president_name', 'L''Honorable Isidore MVOUBA'),
  ('president_role', 'Président de l''Assemblée Nationale'),
  ('president_photo', ''),
  ('president_bio', 'L''Honorable Isidore MVOUBA est le Président de l''Assemblée nationale, réélu le 16 août 2022, lors de la session inaugurale de la 15ᵉ législature, avec 142 voix sur 148 inscrits.'),
  ('president_facts', 'Né le 15 avril 1949 à Brazzaville|Ingénieur en chef des chemins de fer (ex-URSS)|Président de l''Assemblée nationale depuis 2017|Ancien Premier Ministre (2005–2009)|Membre du Bureau Politique du PCT'),
  ('site_address', 'Rond-point de la place de la République (Ex CCF), entre le boulevard Denis SASSOU-NGUESSO et l''Avenue Charles de Gaulle, Brazzaville, République du Congo'),
  ('live_url', 'https://www.youtube.com/channel/UCuV1K2uIysyBwig6dm7kzIw')
ON CONFLICT (key) DO NOTHING;

INSERT INTO bureau (role_title, name, display_order) VALUES
  ('Président', 'Isidore MVOUBA', 1),
  ('1ᵉʳ Vice-président', 'Léon Alfred OPIMBAT', 2),
  ('2ᵉ Vice-président', 'Roland BOUITY VIAUDO', 3),
  ('1ᵉʳ Secrétaire', 'Fernand SABAYE', 4),
  ('2ᵉ Secrétaire', 'KIGNOUMBI KIA MBOUNGOU', 5),
  ('1ᵉʳ Questeur', 'Abel Joël OWASSA', 6),
  ('2ᵉ Questeur', 'Destinée DOUKAGA', 7)
ON CONFLICT DO NOTHING;

INSERT INTO slides (title, date_text, category, bg_gradient, display_order) VALUES
  ('Clôture de la 10ᵉ Session Ordinaire Budgétaire : Un Bilan Positif', '30 décembre 2025', 'Plénière', 'linear-gradient(135deg, #0a3d1f, #1a6b36)', 1),
  ('Réorganisation stratégique de deux commissions à l''Assemblée nationale', '27 décembre 2025', 'Actualité', 'linear-gradient(135deg, #0a1a3d, #1a3d6b)', 2),
  ('Bilan du quinquennat (2021-2026) : l''Assemblée nationale fait le point', '22 décembre 2025', 'Actualité', 'linear-gradient(135deg, #3d2a00, #6b5000)', 3)
ON CONFLICT DO NOTHING;

INSERT INTO actualites (title, date_text, category) VALUES
  ('Clôture de la 10ᵉ Session Ordinaire Budgétaire : Un Bilan Positif', '30 déc. 2025', 'Plénière'),
  ('Réorganisation stratégique de deux commissions à l''Assemblée nationale', '27 déc. 2025', 'Actualité'),
  ('Bilan du quinquennat (2021-2026) : l''Assemblée nationale fait le point', '22 déc. 2025', 'Actualité'),
  ('La santé au cœur des préoccupations législatives', '14 déc. 2025', 'Audience'),
  ('67ᵉ anniversaire de la Proclamation de la République du Congo', '29 nov. 2025', 'Actualité')
ON CONFLICT DO NOTHING;

INSERT INTO agenda (title, date_text, description) VALUES
  ('Conférence des Présidents', 'Mardi 08 Octobre 2024', 'Examen et adoption du dossier de la (7ème) session ordinaire (Budgétaire) du 15 octobre au 23 décembre.'),
  ('Ouverture de la 7ᵉ Session Ordinaire (Budgétaire)', 'Mardi 15 Octobre 2024', 'Ouverture solennelle de la (7ème) session ordinaire (budgétaire) du 15 octobre au 23 décembre 2024.')
ON CONFLICT DO NOTHING;

-- 4. STORAGE — Exécuter séparément dans Storage > New Bucket
-- Créer un bucket public appelé "images"
-- Puis ajouter ces policies dans Storage > Policies :

-- INSERT policy : Allow authenticated uploads
-- (bucket_id = 'images') AND (auth.role() = 'authenticated')

-- SELECT policy : Allow public reads
-- (bucket_id = 'images')
