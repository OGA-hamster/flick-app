-- ============================================================
-- FLICK v3 migration — Refresh a dare (1x per dare per day)
-- Run this AFTER schema.sql and migration_v2.sql.
-- ============================================================

alter table public.daily_assignments
  add column if not exists refreshed boolean not null default false;

create or replace function public.refresh_task(p_user_id uuid, p_old_task_id uuid)
returns public.tasks as $$
declare
  v_difficulty text;
  v_already_refreshed boolean;
  v_new_task_id uuid;
  v_new_task public.tasks;
begin
  select refreshed into v_already_refreshed
  from public.daily_assignments
  where user_id = p_user_id and task_id = p_old_task_id and assigned_date = current_date;

  if v_already_refreshed is null then
    raise exception 'Dare not found for today';
  end if;

  if v_already_refreshed then
    raise exception 'This dare already used its refresh for today';
  end if;

  select difficulty into v_difficulty from public.tasks where id = p_old_task_id;

  select id into v_new_task_id
  from public.tasks t
  where t.active
    and t.difficulty = v_difficulty
    and t.id != p_old_task_id
    and t.id not in (
      select task_id from public.daily_assignments
      where user_id = p_user_id and assigned_date > current_date - interval '21 days'
    )
  order by random()
  limit 1;

  if v_new_task_id is null then
    raise exception 'No fresh dares available right now — try again tomorrow';
  end if;

  delete from public.daily_assignments
  where user_id = p_user_id and task_id = p_old_task_id and assigned_date = current_date;

  insert into public.daily_assignments (user_id, task_id, assigned_date, refreshed)
  values (p_user_id, v_new_task_id, current_date, true);

  select * into v_new_task from public.tasks where id = v_new_task_id;
  return v_new_task;
end;
$$ language plpgsql security definer;
