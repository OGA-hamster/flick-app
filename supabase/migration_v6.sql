-- ============================================================
-- FLICK v6 migration — Continuous task stream + more tasks
-- Run this AFTER schema.sql, migration_v2.sql, v3.sql, v4.sql, v5.sql.
-- ============================================================

-- ---------- Get one fresh task to replace a completed one ----------
-- Picks a task not shown to this user in the last 21 days AND not
-- already assigned to them today (so the same task can't appear twice
-- in one day), inserts the assignment, and returns it.
create or replace function public.get_next_task(p_user_id uuid, p_exclude_difficulty text default null)
returns public.tasks as $$
declare
  v_new_task_id uuid;
  v_new_task public.tasks;
begin
  select id into v_new_task_id
  from public.tasks t
  where t.active
    and t.id not in (
      select task_id from public.daily_assignments
      where user_id = p_user_id and assigned_date > current_date - interval '21 days'
    )
  order by random()
  limit 1;

  -- fallback: if everything's on cooldown (unlikely with a big bank),
  -- just pick anything not assigned to the user today
  if v_new_task_id is null then
    select id into v_new_task_id
    from public.tasks t
    where t.active
      and t.id not in (
        select task_id from public.daily_assignments
        where user_id = p_user_id and assigned_date = current_date
      )
    order by random()
    limit 1;
  end if;

  if v_new_task_id is null then
    return null;
  end if;

  insert into public.daily_assignments (user_id, task_id, assigned_date)
  values (p_user_id, v_new_task_id, current_date)
  on conflict (user_id, task_id, assigned_date) do nothing;

  select * into v_new_task from public.tasks where id = v_new_task_id;
  return v_new_task;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Expand the task bank — 45 new tasks across all categories
-- ============================================================
insert into public.tasks (title, description, category, difficulty, emoji) values
('Text your mom or dad', 'Just a "thinking of you" — nothing more needed.', 'social', 'easy', '📱'),
('Stretch for 3 minutes', 'Full body, slow, no rush.', 'physical', 'easy', '🤸'),
('Write down tomorrow''s #1 priority', 'One thing. Not five.', 'mental', 'easy', '🎯'),
('Tidy your desktop', 'Delete or file 5 random files sitting there.', 'mental', 'easy', '🖥️'),
('Say thank you to someone specific', 'Tell them exactly what you''re thankful for.', 'social', 'easy', '🙏'),
('Take 3 deep breaths, eyes closed', 'Actually count them.', 'mental', 'easy', '🌬️'),
('Refill your water bottle', 'And take it with you today.', 'physical', 'easy', '💧'),
('Save one photo that makes you smile', 'Look through your camera roll.', 'creative', 'easy', '📸'),
('Reply to one email you''ve been avoiding', 'Even a short reply counts.', 'mental', 'easy', '📧'),
('Do 15 squats', 'Right where you''re standing.', 'physical', 'easy', '🏋️'),
('Write your name in your best handwriting', 'Slow down, make it count.', 'creative', 'easy', '✍️'),
('Open a window for fresh air', 'Let it in for at least 5 minutes.', 'physical', 'easy', '🪟'),
('List 3 songs you''re into right now', 'Just note them down.', 'creative', 'easy', '🎵'),
('Message someone "good luck" for something', 'Anyone with something coming up.', 'social', 'easy', '🍀'),
('Organize one drawer', 'Any drawer. Just one.', 'mental', 'medium', '🗄️'),
('No sugar for the rest of today', 'See how far you get.', 'physical', 'medium', '🍬'),
('Write a 2-line review of something you loved', 'A show, meal, book, anything.', 'creative', 'medium', '⭐'),
('Ask a coworker or classmate for feedback', 'On anything you''re working on.', 'social', 'medium', '💬'),
('10 minute walk outside', 'Rain or shine.', 'physical', 'medium', '🚶'),
('Draft a message you''ve been putting off', 'Doesn''t have to send it today.', 'mental', 'medium', '📝'),
('Try a 5 minute guided meditation', 'Any app or YouTube video.', 'mental', 'medium', '🧘'),
('Cook a meal with zero screens on', 'Just you and the food.', 'physical', 'medium', '🍲'),
('Write one thing you''re proud of this month', 'Big or small.', 'mental', 'medium', '🏅'),
('Compliment your own work today', 'Out loud, to yourself.', 'mental', 'medium', '🪞'),
('Set a 25 minute focus timer', 'One task, no phone, until it rings.', 'mental', 'medium', '⏲️'),
('Send a friend a throwback memory', 'A photo or "remember when..."', 'social', 'medium', '📷'),
('Skip one scroll session today', 'Notice the urge, don''t act on it.', 'mental', 'medium', '🚫'),
('Do 10 minutes of decluttering', 'One space, timer on.', 'physical', 'medium', '🧺'),
('Write down your biggest distraction today', 'And one way to reduce it tomorrow.', 'mental', 'medium', '🔍'),
('Learn one new keyboard shortcut', 'And actually use it today.', 'mental', 'medium', '⌨️'),
('Do something with your hands, no phone nearby', '15 minutes minimum.', 'creative', 'medium', '🖐️'),
('Ask "why" three times about a problem', 'Get to the actual root cause.', 'mental', 'hard', '🔬'),
('Have an uncomfortable conversation you''ve delayed', 'Keep it short and honest.', 'wildcard', 'hard', '😅'),
('Post something you made, unfiltered', 'No overthinking the caption.', 'wildcard', 'hard', '📤'),
('Track every dollar you spend today', 'Every single one, written down.', 'wildcard', 'hard', '💰'),
('Do your workout a level harder than usual', 'Push the one variable that matters.', 'physical', 'hard', '🔥'),
('Cold call or cold message someone', 'A lead, a stranger, whoever matters to your goal.', 'wildcard', 'hard', '📞'),
('Journal for 10 minutes, no stopping', 'Don''t lift the pen.', 'mental', 'hard', '📓'),
('Wake up 30 minutes earlier tomorrow', 'Set the alarm right now.', 'physical', 'hard', '⏰'),
('Say no to something you''d normally agree to', 'Protect your time today.', 'wildcard', 'hard', '🙅'),
('Review your goals from a month ago', 'Are you actually on track?', 'mental', 'hard', '📊'),
('Do the task you''ve been avoiding most', 'The one on your list the longest.', 'wildcard', 'hard', '🎢'),
('Give someone specific, honest feedback', 'Kindly, but don''t soften the truth.', 'social', 'hard', '🗣️'),
('Fast from social media until tomorrow', 'Full stop, starting now.', 'wildcard', 'hard', '📵'),
('Write your own eulogy in 3 sentences', 'What do you want it to say?', 'mental', 'hard', '🕯️'),
('Do a full audit of one subscription/expense', 'Cancel it if it''s not worth it.', 'wildcard', 'hard', '🔎')
on conflict do nothing;
