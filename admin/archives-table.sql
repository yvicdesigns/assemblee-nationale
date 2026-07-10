-- =============================================
-- Table Archives — Assemblée Nationale
-- À exécuter dans Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS archives_documents (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  description  text,
  category     text NOT NULL DEFAULT 'Loi',
  year         integer,
  legislature  text DEFAULT '15ème Législature',
  file_url     text,
  file_size    text,
  published_at date,
  created_at   timestamptz DEFAULT now()
);

-- Index recherche
CREATE INDEX IF NOT EXISTS idx_archives_category ON archives_documents(category);
CREATE INDEX IF NOT EXISTS idx_archives_year     ON archives_documents(year);

-- RLS
ALTER TABLE archives_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_archives" ON archives_documents FOR SELECT USING (true);
CREATE POLICY "admin_all_archives"   ON archives_documents USING (auth.role() = 'authenticated');

-- Données de démonstration
INSERT INTO archives_documents (title, category, year, legislature, file_url, file_size, published_at, description) VALUES
  ('Constitution de la République du Congo — 2015', 'Constitution', 2015, '13ème Législature', NULL, '1.2 MB', '2015-11-06', 'Loi fondamentale promulguée le 6 novembre 2015'),
  ('Loi de finances rectificative 2026', 'Loi', 2026, '15ème Législature', NULL, '3.4 MB', '2026-03-15', 'Budget rectificatif de l''Etat pour l''exercice 2026'),
  ('Loi de finances initiale 2026', 'Loi', 2026, '15ème Législature', NULL, '4.1 MB', '2025-12-28', 'Loi n°2025-18 portant budget de l''Etat pour 2026'),
  ('Loi organique relative au Conseil Constitutionnel', 'Loi organique', 2025, '15ème Législature', NULL, '890 KB', '2025-06-10', 'Organisation et fonctionnement du Conseil Constitutionnel'),
  ('Loi sur la protection des donnees personnelles', 'Loi', 2025, '15ème Législature', NULL, '1.8 MB', '2025-04-22', 'Loi n°2025-07 relative a la protection des donnees a caractere personnel'),
  ('Traite de cooperation Congo-France 2024', 'Traité', 2024, '15ème Législature', NULL, '560 KB', '2024-11-30', 'Accord de partenariat strategique ratifie par l''Assemblee Nationale'),
  ('Accord de cooperation Congo-Chine', 'Traité', 2024, '15ème Législature', NULL, '430 KB', '2024-09-15', 'Traite d''amitie et de cooperation economique'),
  ('Decret d''application de la loi sur l''environnement', 'Décret', 2025, '15ème Législature', NULL, '720 KB', '2025-08-01', 'Modalites d''application de la loi n°2024-12'),
  ('Compte rendu — Seance pleniere du 15 janvier 2026', 'Compte rendu', 2026, '15ème Législature', NULL, '2.1 MB', '2026-01-16', 'Adoption de la loi de finances 2026'),
  ('Compte rendu — Seance pleniere du 28 octobre 2025', 'Compte rendu', 2025, '15ème Législature', NULL, '1.9 MB', '2025-10-29', 'Discussion generale sur le projet de loi budgetaire'),
  ('Rapport de la Commission Economie — Budget 2026', 'Rapport', 2025, '15ème Législature', NULL, '3.2 MB', '2025-11-20', 'Analyse et recommandations de la Commission ECOFIN'),
  ('Rapport annuel d''activites de l''Assemblee 2025', 'Rapport', 2025, '15ème Législature', NULL, '5.6 MB', '2026-02-01', 'Bilan complet de la 15eme legislature — annee 2025'),
  ('Loi de finances 2025', 'Loi', 2025, '15ème Législature', NULL, '3.8 MB', '2024-12-30', 'Budget de l''Etat pour l''exercice 2025'),
  ('Loi portant statut general de la fonction publique', 'Loi', 2024, '15ème Législature', NULL, '2.4 MB', '2024-07-18', 'Reforme de la fonction publique congolaise'),
  ('Traite CEMAC — Revision du traite fondateur', 'Traité', 2023, '15ème Législature', NULL, '1.1 MB', '2023-12-05', 'Ratification du protocole de revision du traite CEMAC')
ON CONFLICT DO NOTHING;
