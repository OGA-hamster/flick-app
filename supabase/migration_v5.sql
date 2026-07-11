-- ============================================================
-- FLICK v5 migration — Profile fields (name, bio, avatar emoji)
-- Run this AFTER schema.sql, migration_v2.sql, v3.sql, v4.sql.
-- ============================================================

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists bio text,
  add column if not exists avatar_emoji text not null default '🙂';
