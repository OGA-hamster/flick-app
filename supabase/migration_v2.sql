-- ============================================================
-- FLICK v2 migration — Mode selection + honesty check-ins
-- Run this AFTER schema.sql, in a fresh SQL Editor query.
-- Safe to run on your existing database — only adds new things.
-- ============================================================

-- ---------- Add mode to profiles ----------
alter table public.profiles
  add column if not exists mode text check (mode in ('trader', 'founder', 'daily_life'));

-- ---------- One-tap honesty check-ins ----------
-- One row per user per day. followed_plan is a simple yes/no —
-- the streak counts checking in honestly, NOT winning/succeeding.
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default current_date,
  followed_plan boolean not null,
  created_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

alter table public.checkins enable row level security;

create policy "users manage their own checkins"
  on public.checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- Record a check-in + update the honesty streak ----------
-- The streak increments for showing up and answering honestly,
-- regardless of whether followed_plan is true or false.
create or replace function public.record_checkin(p_user_id uuid, p_followed_plan boolean)
returns void as $$
declare
  v_yesterday date := current_date - interval '1 day';
  v_last_completed date;
begin
  insert into public.checkins (user_id, checkin_date, followed_plan)
  values (p_user_id, current_date, p_followed_plan)
  on conflict (user_id, checkin_date)
  do update set followed_plan = excluded.followed_plan;

  select last_completed_date into v_last_completed
  from public.profiles where id = p_user_id;

  if v_last_completed is distinct from current_date then
    if v_last_completed = v_yesterday then
      update public.profiles
      set current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          last_completed_date = current_date
      where id = p_user_id;
    else
      update public.profiles
      set current_streak = 1,
          longest_streak = greatest(longest_streak, 1),
          last_completed_date = current_date
      where id = p_user_id;
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- ---------- Anonymous social proof: % who skipped today ----------
create or replace function public.get_today_skip_rate()
returns numeric as $$
declare
  v_total int;
  v_skipped int;
begin
  select count(*) into v_total from public.checkins where checkin_date = current_date;
  if v_total = 0 then
    return 0;
  end if;
  select count(*) into v_skipped from public.checkins
    where checkin_date = current_date and followed_plan = false;
  return round((v_skipped::numeric / v_total) * 100);
end;
$$ language plpgsql security definer;
