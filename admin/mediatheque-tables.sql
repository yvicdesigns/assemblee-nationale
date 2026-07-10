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
  ('Seance pleniere - Adoption de la loi de finances 2026', 'Session', 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800', '2026-01-15', 'Vue de l''hemicycle lors du vote du budget de l''Etat'),
  ('Visite du Chef de l''Etat a l''Assemblee Nationale', 'Visites officielles', 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800', '2025-12-10', 'Le President de la Republique en visite officielle'),
  ('Ceremonie d''ouverture de la session ordinaire', 'Session', 'https://images.unsplash.com/photo-1529158062015-d8a4e00a4dae?w=800', '2025-10-05', 'Discours inaugural du President de l''Assemblee'),
  ('Journee de la femme parlementaire', 'Événements', 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800', '2025-03-08', 'Celebration de la journee internationale des femmes'),
  ('Commission Economie et Finances - Audition budgetaire', 'Commissions', 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?w=800', '2025-09-20', 'Audition du Ministre des Finances'),
  ('Delegation parlementaire de la CEMAC', 'Visites officielles', 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800', '2025-11-14', 'Reunion interparlementaire regionale'),
  ('Vote de la motion de confiance au gouvernement', 'Session', 'https://images.unsplash.com/photo-1464582883107-8adf2dca8a9f?w=800', '2025-07-22', 'Seance historique de vote'),
  ('Forum de la jeunesse parlementaire', 'Événements', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800', '2025-08-30', 'Jeunes delegues des 12 departements'),
  ('Commission Sante - Rapport sur la couverture universelle', 'Commissions', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', '2025-06-18', 'Presentation du rapport annuel sante')
ON CONFLICT DO NOTHING;

-- Données de démonstration (vidéos)
INSERT INTO media_videos (title, category, youtube_id, published_at, description) VALUES
  ('Seance pleniere - Debat general sur le budget 2026', 'Séances plénières', 'dQw4w9WgXcQ', '2026-01-20', 'Debat budgetaire en session ordinaire'),
  ('Discours du President Isidore Mvouba - Ouverture de session', 'Séances plénières', 'dQw4w9WgXcQ', '2025-10-05', 'Allocution d''ouverture de la 15eme legislature'),
  ('Congres National - Revision constitutionnelle', 'Congrès', 'dQw4w9WgXcQ', '2025-09-01', 'Reunion en Congres des deux chambres'),
  ('Conference interparlementaire CEMAC - Brazzaville', 'Conférences', 'dQw4w9WgXcQ', '2025-11-15', 'Rencontre des parlements d''Afrique Centrale'),
  ('Commission Defense - Audition du Ministre', 'Commissions', 'dQw4w9WgXcQ', '2025-08-12', 'Presentation du budget defense 2026'),
  ('Questions orales au gouvernement - Novembre 2025', 'Séances plénières', 'dQw4w9WgXcQ', '2025-11-28', 'Session de questions-reponses avec le Premier Ministre')
ON CONFLICT DO NOTHING;
