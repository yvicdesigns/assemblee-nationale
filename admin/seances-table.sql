-- =============================================
-- Table Séances plénières — Assemblée Nationale
-- À exécuter dans Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS seances_plenieres (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre        text NOT NULL,
  date_seance  date NOT NULL,
  heure        time DEFAULT '09:00',
  type_seance  text NOT NULL DEFAULT 'Ordinaire',
  session      text DEFAULT '15ème Législature',
  description  text,
  ordre_du_jour text,
  statut       text NOT NULL DEFAULT 'A venir',
  compte_rendu_url text,
  created_at   timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_seances_date   ON seances_plenieres(date_seance DESC);
CREATE INDEX IF NOT EXISTS idx_seances_statut ON seances_plenieres(statut);

-- RLS
ALTER TABLE seances_plenieres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_seances" ON seances_plenieres FOR SELECT USING (true);
CREATE POLICY "admin_all_seances"   ON seances_plenieres USING (auth.role() = 'authenticated');

-- Données de démonstration
INSERT INTO seances_plenieres (titre, date_seance, heure, type_seance, session, description, ordre_du_jour, statut, compte_rendu_url) VALUES
  ('Seance pleniere — Adoption loi de finances rectificative 2026', '2026-03-15', '09:00', 'Ordinaire', 'Session de mars 2026', 'Adoption en deuxieme lecture de la loi de finances rectificative pour l''exercice 2026', '1. Ouverture de la seance
2. Appel nominal
3. Adoption du proces-verbal de la seance precedente
4. Discussion generale — Loi de finances rectificative 2026
5. Vote et adoption
6. Questions diverses
7. Levee de seance', 'Terminee', NULL),

  ('Seance pleniere — Questions orales au gouvernement', '2026-04-08', '10:00', 'Ordinaire', 'Session de mars 2026', 'Session de questions orales posees par les deputes aux membres du gouvernement', '1. Ouverture de la seance
2. Questions orales sans debat — Ministere de la Sante
3. Questions orales sans debat — Ministere des Finances
4. Questions orales avec debat — Politique de l''emploi des jeunes
5. Levee de seance', 'Terminee', NULL),

  ('Seance pleniere — Vote budget 2027 (premiere lecture)', '2026-10-20', '09:00', 'Ordinaire', 'Session d''octobre 2026', 'Premiere lecture et discussion generale du projet de loi de finances pour l''exercice 2027', '1. Presentation du projet de loi de finances 2027 par le ministre des Finances
2. Rapport de la Commission Economie et Finances
3. Discussion generale des deputes
4. Renvoi en commission
5. Levee de seance', 'A venir', NULL),

  ('Seance pleniere — Ratification traite CEMAC', '2026-11-05', '09:00', 'Extraordinaire', 'Session d''octobre 2026', 'Session extraordinaire pour ratification du protocole de revision du traite CEMAC', '1. Presentation du traite par le ministre des Affaires etrangeres
2. Rapport de la Commission des Affaires etrangeres
3. Discussion et vote
4. Levee de seance', 'A venir', NULL),

  ('Seance pleniere — Vote budget 2027 (deuxieme lecture)', '2026-11-25', '09:00', 'Ordinaire', 'Session d''octobre 2026', 'Deuxieme lecture et adoption definitive du projet de loi de finances 2027', '1. Rapport de la Commission Economie et Finances
2. Examen des amendements
3. Vote article par article
4. Vote solennel — adoption du budget 2027
5. Levee de seance', 'A venir', NULL),

  ('Seance pleniere — Interpellation gouvernement', '2026-06-18', '10:00', 'Ordinaire', 'Session de mars 2026', 'Interpellation du gouvernement sur la politique de sante publique', '1. Ouverture de la seance
2. Interpellation du ministre de la Sante publique
3. Reponse du gouvernement
4. Debat general
5. Vote de la motion de resolution
6. Levee de seance', 'Terminee', NULL),

  ('Seance pleniere — Adoption loi protection donnees', '2026-04-22', '09:00', 'Ordinaire', 'Session de mars 2026', 'Adoption de la loi relative a la protection des donnees a caractere personnel', '1. Rapport de la Commission des Lois et Libertes
2. Discussion generale
3. Examen des articles
4. Vote solennel
5. Levee de seance', 'Terminee', NULL),

  ('Seance pleniere — Ouverture session octobre 2026', '2026-10-01', '09:00', 'Ordinaire', 'Session d''octobre 2026', 'Seance d''ouverture de la session parlementaire d''octobre 2026', '1. Allocution du President de l''Assemblee Nationale
2. Discours du Premier ministre
3. Fixation de l''ordre du jour de la session
4. Constitution des commissions ad hoc
5. Levee de seance', 'A venir', NULL)

ON CONFLICT DO NOTHING;
