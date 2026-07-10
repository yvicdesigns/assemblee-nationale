-- ══════════════════════════════════════════════════
--  Slider + Storage bucket media
--  À exécuter dans Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════

-- 1. Bucket de stockage public pour les médias
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- Politique : lecture publique
create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Politique : upload pour admins authentifiés
create policy "Auth upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

-- Politique : suppression pour admins authentifiés
create policy "Auth delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');

-- 2. Table slider
create table if not exists slider (
  id            uuid default gen_random_uuid() primary key,
  ordre         integer not null default 0,
  eyebrow       text,
  titre         text not null,
  titre_accent  text,
  description   text,
  meta_label    text,
  cta1_label    text default 'En savoir plus',
  cta1_url      text default '#',
  cta2_label    text,
  cta2_url      text,
  image_url     text,
  active        boolean default true,
  created_at    timestamptz default now()
);

alter table slider enable row level security;

create policy "Public read slider"
  on slider for select using (active = true);

create policy "Admin all slider"
  on slider for all using (auth.role() = 'authenticated');

-- 3. Données de démonstration (images à uploader ensuite)
insert into slider (ordre, eyebrow, titre, titre_accent, description, meta_label, cta1_label, cta1_url, cta2_label, cta2_url, image_url) values
(1, 'République du Congo',      'Assemblée',    'Nationale',       'La voix de 151 représentants du peuple congolais. Travaux législatifs, séances plénières et ressources de la 15e Législature.',  '15e Législature · Session en cours · 2022–2027',          'Découvrir l''institution', '/pages/institution.html', 'Voir les députés',              '/pages/deputes.html',   null),
(2, 'En direct',                'Séances',      'Plénières',       'Suivez les travaux en séance publique, accédez aux ordres du jour, comptes rendus et votes de la chambre.',                       'Prochaine séance · Mardi 14 juillet 2026 · 09h00',        'Voir les séances',         '/pages/seances.html',     'Télécharger l''ordre du jour',  '#',                     null),
(3, 'Intelligence artificielle','Votre guide',  'parlementaire',   'AssistAN répond à vos questions sur les lois, vos droits et le fonctionnement de l''Assemblée Nationale — 24h/24, gratuit.',     'Propulsé par IA · Gratuit · Disponible maintenant',       'Parler à AssistAN',        '/pages/assistant.html',   'En savoir plus',                '#',                     null),
(4, 'Documentation officielle', 'Archives',     'Parlementaires',  'Accédez à la Constitution, aux lois, traités, décrets et rapports officiels de la République du Congo en un seul endroit.',       'Constitution 2015 · Lois organiques · Décrets',           'Consulter les archives',   '/pages/archives.html',    'Constitution 2015',             '#',                     null);
