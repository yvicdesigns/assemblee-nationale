-- =============================================
-- Table Newsletter — Assemblée Nationale
-- À exécuter dans Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email             text NOT NULL UNIQUE,
  prenom            text,
  topics            text DEFAULT 'pleniere,commissions',
  unsubscribe_token uuid DEFAULT gen_random_uuid(),
  subscribed_at     timestamptz DEFAULT now(),
  unsubscribed_at   timestamptz,
  active            boolean DEFAULT true
);

-- Index pour recherche rapide par token
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Politique RLS : insertion publique (s'abonner), lecture admin seulement
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut s'inscrire
CREATE POLICY "public_insert_newsletter"
  ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Tout le monde peut se désabonner via token
CREATE POLICY "public_unsubscribe_newsletter"
  ON newsletter_subscribers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Lecture réservée aux admins authentifiés
CREATE POLICY "admin_read_newsletter"
  ON newsletter_subscribers FOR SELECT
  USING (auth.role() = 'authenticated');
