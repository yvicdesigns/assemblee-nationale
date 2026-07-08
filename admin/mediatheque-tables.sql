-- =============================================
-- Tables Médiathèque — Assemblée Nationale
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- Galerie photos
CREATE TABLE IF NOT EXISTS media_photos (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  description text,
  category    text NOT NULL DEFAULT 'Session',
  photo_url   text NOT NULL,
  taken_at    date,
  created_at  timestamptz DEFAULT now()
);

-- Galerie vidéos (YouTube)
CREATE TABLE IF NOT EXISTS media_videos (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  description  text,
  category     text NOT NULL DEFAULT 'Séances plénières',
  youtube_id   text NOT NULL,
  published_at date,
  created_at   timestamptz DEFAULT now()
);

-- Accès public en lecture
ALTER TABLE media_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_photos" ON media_photos FOR SELECT USING (true);
CREATE POLICY "admin_all_photos"   ON media_photos USING (auth.role() = 'authenticated');

ALTER TABLE media_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_videos" ON media_videos FOR SELECT USING (true);
CREATE POLICY "admin_all_videos"   ON media_videos USING (auth.role() = 'authenticated');

-- Données de démonstration (photos)
INSERT INTO media_photos (title, category, photo_url, taken_at, description) VALUES
  ('Séance plénière — Adoption de la loi de finances 2026', 'Session', 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800', '2026-01-15', 'Vue de l'hémicycle lors du vote du budget de l'État'),
  ('Visite du Chef de l'État à l'Assemblée Nationale', 'Visites officielles', 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800', '2025-12-10', 'Le Président de la République en visite officielle'),
  ('Cérémonie d'ouverture de la session ordinaire', 'Session', 'https://images.unsplash.com/photo-1529158062015-d8a4e00a4dae?w=800', '2025-10-05', 'Discours inaugural du Président de l'Assemblée'),
  ('Journée de la femme parlementaire', 'Événements', 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800', '2025-03-08', 'Célébration de la journée internationale des femmes'),
  ('Commission Économie & Finances — Audition budgétaire', 'Commissions', 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?w=800', '2025-09-20', 'Audition du Ministre des Finances'),
  ('Délégation parlementaire de la CEMAC', 'Visites officielles', 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800', '2025-11-14', 'Réunion interparlementaire régionale'),
  ('Vote de la motion de confiance au gouvernement', 'Session', 'https://images.unsplash.com/photo-1464582883107-8adf2dca8a9f?w=800', '2025-07-22', 'Séance historique de vote'),
  ('Forum de la jeunesse parlementaire', 'Événements', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800', '2025-08-30', 'Jeunes délégués des 12 départements'),
  ('Commission Santé — Rapport sur la couverture universelle', 'Commissions', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', '2025-06-18', 'Présentation du rapport annuel santé')
ON CONFLICT DO NOTHING;

-- Données de démonstration (vidéos)
INSERT INTO media_videos (title, category, youtube_id, published_at, description) VALUES
  ('Séance plénière — Débat général sur le budget 2026', 'Séances plénières', 'dQw4w9WgXcQ', '2026-01-20', 'Débat budgétaire en session ordinaire'),
  ('Discours du Président Isidore Mvouba — Ouverture de session', 'Séances plénières', 'dQw4w9WgXcQ', '2025-10-05', 'Allocution d'ouverture de la 15ème législature'),
  ('Congrès National — Révision constitutionnelle', 'Congrès', 'dQw4w9WgXcQ', '2025-09-01', 'Réunion en Congrès des deux chambres'),
  ('Conférence interparlementaire CEMAC — Brazzaville', 'Conférences', 'dQw4w9WgXcQ', '2025-11-15', 'Rencontre des parlements d'Afrique Centrale'),
  ('Commission Défense — Audition du Ministre', 'Commissions', 'dQw4w9WgXcQ', '2025-08-12', 'Présentation du budget défense 2026'),
  ('Questions orales au gouvernement — Novembre 2025', 'Séances plénières', 'dQw4w9WgXcQ', '2025-11-28', 'Session de questions-réponses avec le Premier Ministre')
ON CONFLICT DO NOTHING;
