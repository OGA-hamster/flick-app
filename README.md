# Flick — one dare a day, zero decisions

A working Next.js + Supabase app: users sign up, get 3 rotating daily
"dares" (micro-accountability tasks), swipe/tap through them, and build a
streak. Tasks never repeat for the same user within 21 days.

## What's inside
- `app/` — Next.js 14 (App Router) pages: landing, signup, login, dashboard
- `components/` — TaskCard, StreakBadge
- `supabase/schema.sql` — full database schema, RLS policies, the daily
  task-rotation function, streak logic, and ~30 seed tasks
- `lib/supabaseClient.js` — Supabase client setup

## 1. Create your Supabase project (free)
1. Go to https://supabase.com → New project
2. Once it's created, open **SQL Editor** → paste the entire contents of
   `supabase/schema.sql` → Run. This creates all tables, security rules,
   the task bank, and the rotation logic.
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

## 2. Run it locally
```bash
npm install
cp .env.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```
Visit http://localhost:3000

## 3. Publish it live (free, ~10 minutes)
1. Push this folder to a new GitHub repo
2. Go to https://vercel.com → **New Project** → import that repo
3. In Vercel's "Environment Variables" step, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (same values as your `.env.local`)
4. Click **Deploy**

You'll get a live URL like `flick-yourname.vercel.app` — that's a real,
published website anyone can visit and sign up on.

### Optional: custom domain
In Vercel → your project → **Settings → Domains** → add your domain
(e.g. from GoDaddy/Namecheap) and follow the DNS instructions shown.

## How the daily rotation works
`supabase/schema.sql` defines a Postgres function `get_daily_tasks(user_id)`
that:
- Checks if the user already has tasks for today — if so, returns them
  (so refreshing the page doesn't reshuffle anything)
- Otherwise picks 1 easy + 1 medium + 1 wildcard task at random, excluding
  anything shown to that user in the last 21 days, and saves the
  assignment
- `complete_task(user_id, task_id)` marks a task done and updates the
  user's streak (increments if done yesterday too, resets to 1 otherwise)

## Next steps you might want
- Add more tasks to the `tasks` table (SQL editor → `insert into tasks ...`)
  to keep the pool fresh longer
- Add a "share your streak" image export
- Add push/email reminders (Supabase Edge Functions + a cron trigger)
- Add social leaderboards (compare `current_streak` across friends)
