-- ============================================================
-- FLICK v4 migration — Friends (add, accept, see streaks)
-- Run this AFTER schema.sql, migration_v2.sql, migration_v3.sql.
-- ============================================================

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester_id != addressee_id)
);

create unique index if not exists uniq_friendship_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

alter table public.friendships enable row level security;

create policy "users see their own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "users can send requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "users can respond to incoming requests"
  on public.friendships for update
  using (auth.uid() = addressee_id);

create policy "users can remove their own friendships"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ---------- Send a friend request by username ----------
create or replace function public.send_friend_request(p_user_id uuid, p_target_username text)
returns void as $$
declare
  v_target_id uuid;
begin
  select id into v_target_id from public.profiles where username = p_target_username limit 1;

  if v_target_id is null then
    raise exception 'No user found with that username';
  end if;

  if v_target_id = p_user_id then
    raise exception 'You can''t add yourself';
  end if;

  if exists (
    select 1 from public.friendships
    where (requester_id = p_user_id and addressee_id = v_target_id)
       or (requester_id = v_target_id and addressee_id = p_user_id)
  ) then
    raise exception 'A friend request already exists with this user';
  end if;

  insert into public.friendships (requester_id, addressee_id, status)
  values (p_user_id, v_target_id, 'pending');
end;
$$ language plpgsql security definer;

-- ---------- Accept or decline an incoming request ----------
create or replace function public.respond_friend_request(p_user_id uuid, p_friendship_id uuid, p_accept boolean)
returns void as $$
begin
  if p_accept then
    update public.friendships
    set status = 'accepted'
    where id = p_friendship_id and addressee_id = p_user_id;
  else
    delete from public.friendships
    where id = p_friendship_id and addressee_id = p_user_id;
  end if;
end;
$$ language plpgsql security definer;

-- ---------- Get everything: accepted friends + pending requests ----------
create or replace function public.get_friends(p_user_id uuid)
returns table (
  friendship_id uuid,
  friend_id uuid,
  username text,
  mode text,
  current_streak int,
  longest_streak int,
  status text,
  is_incoming boolean
) as $$
  select
    f.id,
    case when f.requester_id = p_user_id then f.addressee_id else f.requester_id end,
    p.username,
    p.mode,
    p.current_streak,
    p.longest_streak,
    f.status,
    (f.addressee_id = p_user_id and f.status = 'pending')
  from public.friendships f
  join public.profiles p
    on p.id = case when f.requester_id = p_user_id then f.addressee_id else f.requester_id end
  where f.requester_id = p_user_id or f.addressee_id = p_user_id
  order by f.status desc, p.current_streak desc;
$$ language sql security definer;
