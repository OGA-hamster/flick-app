-- ============================================================
-- FLICK — database schema
-- Run this once in your Supabase project's SQL editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tasks bank ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('physical', 'social', 'mental', 'creative', 'wildcard')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  emoji text not null default '✨',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Profiles (1 row per user, mirrors auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_completed_date date,
  created_at timestamptz not null default now()
);

-- ---------- Daily assignments (which tasks a user got on which day) ----------
create table if not exists public.daily_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  assigned_date date not null default current_date,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, task_id, assigned_date)
);

create index if not exists idx_daily_assignments_user_date
  on public.daily_assignments (user_id, assigned_date);

-- ---------- Row Level Security ----------
alter table public.tasks enable row level security;
alter table public.profiles enable row level security;
alter table public.daily_assignments enable row level security;

create policy "tasks are readable by anyone logged in"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users manage their own assignments"
  on public.daily_assignments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- Auto-create a profile row when a user signs up ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Core logic: get (or generate) today's 3 tasks for a user.
-- Cooldown: a task can't repeat for the same user within 21 days.
-- Mix: 1 easy + 1 medium + 1 wildcard/hard, chosen at random.
-- ============================================================
create or replace function public.get_daily_tasks(p_user_id uuid)
returns setof public.tasks as $$
declare
  v_existing_count int;
begin
  select count(*) into v_existing_count
  from public.daily_assignments
  where user_id = p_user_id and assigned_date = current_date;

  if v_existing_count = 0 then
    -- easy task, avoiding anything shown in the last 21 days
    insert into public.daily_assignments (user_id, task_id, assigned_date)
    select p_user_id, t.id, current_date
    from public.tasks t
    where t.active
      and t.difficulty = 'easy'
      and t.id not in (
        select task_id from public.daily_assignments
        where user_id = p_user_id and assigned_date > current_date - interval '21 days'
      )
    order by random()
    limit 1;

    -- medium task
    insert into public.daily_assignments (user_id, task_id, assigned_date)
    select p_user_id, t.id, current_date
    from public.tasks t
    where t.active
      and t.difficulty = 'medium'
      and t.id not in (
        select task_id from public.daily_assignments
        where user_id = p_user_id and assigned_date > current_date - interval '21 days'
      )
    order by random()
    limit 1;

    -- wildcard / hard task
    insert into public.daily_assignments (user_id, task_id, assigned_date)
    select p_user_id, t.id, current_date
    from public.tasks t
    where t.active
      and t.category = 'wildcard'
      and t.id not in (
        select task_id from public.daily_assignments
        where user_id = p_user_id and assigned_date > current_date - interval '21 days'
      )
    order by random()
    limit 1;
  end if;

  return query
    select t.* from public.tasks t
    join public.daily_assignments da on da.task_id = t.id
    where da.user_id = p_user_id and da.assigned_date = current_date;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Mark a task complete + update streak
-- ============================================================
create or replace function public.complete_task(p_user_id uuid, p_task_id uuid)
returns void as $$
declare
  v_yesterday date := current_date - interval '1 day';
  v_last_completed date;
begin
  update public.daily_assignments
  set completed = true, completed_at = now()
  where user_id = p_user_id and task_id = p_task_id and assigned_date = current_date;

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

-- ============================================================
-- Seed task bank (~30 tasks across categories)
-- ============================================================
insert into public.tasks (title, description, category, difficulty, emoji) values
('Text someone you miss', 'Send one message to someone you haven''t spoken to in a while. No essay, just say hi.', 'social', 'easy', '💬'),
('20 pushups, right now', 'Drop and do 20. Knees down counts.', 'physical', 'easy', '💪'),
('Write one sentence', 'Open notes and write exactly one honest sentence about your day.', 'mental', 'easy', '📝'),
('Drink a full glass of water', 'Right now, not later.', 'physical', 'easy', '💧'),
('Compliment a stranger', 'Online or in person. Make it specific.', 'social', 'easy', '✨'),
('2 minute tidy-up', 'Clear one surface near you. Set a timer.', 'mental', 'easy', '🧹'),
('Name 3 things going well', 'Say them out loud or type them.', 'mental', 'easy', '🌤️'),
('Take the stairs today', 'Whenever you get the choice today, take them.', 'physical', 'easy', '🪜'),
('Screenshot your favorite song lyric moment', 'The one that hits different. Save it.', 'creative', 'easy', '🎧'),
('5 min walk, no phone', 'Leave it behind. Just walk.', 'physical', 'medium', '🚶'),
('Cold shower for 30 seconds', 'End your next shower with 30 seconds cold.', 'physical', 'medium', '🥶'),
('Call, don''t text', 'Pick one person and actually call them today.', 'social', 'medium', '📞'),
('Write down a fear, then a plan', 'One thing you''re avoiding + one small step.', 'mental', 'medium', '🧭'),
('Doodle for 5 minutes', 'No talent required. Just move the pen.', 'creative', 'medium', '🎨'),
('Unfollow 3 accounts that drain you', 'Curate your feed on purpose.', 'mental', 'medium', '🧹'),
('Cook something instead of ordering', 'Even eggs count.', 'physical', 'medium', '🍳'),
('Apologize for something small', 'If you owe someone a small one, give it today.', 'social', 'medium', '🙏'),
('Learn 3 words in a new language', 'Any language. Actually say them out loud.', 'mental', 'medium', '🗣️'),
('Plank for 1 minute', 'Set a timer. Don''t check your phone mid-plank.', 'physical', 'medium', '🧘'),
('Write a note to future you', 'One year from now. Seal it (metaphorically).', 'creative', 'medium', '✉️'),
('Ask someone how they REALLY are', 'And actually wait for the real answer.', 'social', 'hard', '👂'),
('Do your task in a public place', 'Take today''s dare somewhere with other people around.', 'wildcard', 'hard', '🎪'),
('Film a 10 second reaction video', 'React to today''s task. Don''t post it unless you want to.', 'wildcard', 'hard', '🎬'),
('Give away something you own', 'One item, someone who''d actually want it.', 'wildcard', 'hard', '🎁'),
('Talk to a stranger for 60 seconds', 'Coffee shop, elevator, wherever. Just 60 seconds.', 'wildcard', 'hard', '🗨️'),
('Post your streak', 'Screenshot your streak and share it somewhere.', 'wildcard', 'hard', '🔥'),
('Do today''s task left-handed', 'If today''s task involves your hands, switch it up.', 'wildcard', 'hard', '🤚'),
('Eat something you''ve never tried', 'New cuisine, new snack, new anything.', 'wildcard', 'hard', '🍜'),
('Send a voice note instead of texting', 'Pick one conversation today and use your voice.', 'wildcard', 'hard', '🎙️'),
('No phone for the first hour today', 'Starting from your next wake-up.', 'wildcard', 'hard', '📵')
on conflict do nothing;
