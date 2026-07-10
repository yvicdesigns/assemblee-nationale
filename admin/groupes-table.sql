-- =============================================
-- Table Groupes parlementaires — Assemblée Nationale
-- À exécuter dans Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS groupes_parlementaires (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom          text NOT NULL,
  sigle        text,
  couleur      text DEFAULT '#009A44',
  president    text,
  secretaire   text,
  nb_membres   integer DEFAULT 0,
  description  text,
  logo_url     text,
  ordre        integer DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE groupes_parlementaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_groupes" ON groupes_parlementaires FOR SELECT USING (true);
CREATE POLICY "admin_all_groupes"   ON groupes_parlementaires USING (auth.role() = 'authenticated');

-- Données de démonstration
INSERT INTO groupes_parlementaires (nom, sigle, couleur, president, nb_membres, description, ordre) VALUES
  ('Rassemblement Congolais pour la Démocratie', 'RCD', '#DC241F', 'Jean-Marie EBINA', 62, 'Groupe majoritaire de la 15ème Législature, soutien au programme gouvernemental de développement national.', 1),
  ('Mouvement Congolais pour la Démocratie et le Développement Intégral', 'MCDDI', '#009A44', 'Paul MVOUMBI', 34, 'Deuxième groupe parlementaire, acteur majeur de la majorité présidentielle.', 2),
  ('Union Panafricaine pour la Démocratie Sociale', 'UPADS', '#1d4ed8', 'André NZALA', 18, 'Principal groupe de l''opposition démocratique et républicaine.', 3),
  ('Parti Congolais du Travail', 'PCT', '#7e22ce', 'Marie OKAMBA', 15, 'Groupe de la majorité présidentielle, héritier de la tradition progressiste congolaise.', 4),
  ('Groupes des Indépendants', 'GI', '#64748b', 'Charles BONGHO', 22, 'Regroupement de députés non affiliés à un parti politique constitué.', 5)
ON CONFLICT DO NOTHING;
