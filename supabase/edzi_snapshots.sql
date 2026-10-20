-- Run manually in a private Supabase project BEFORE enabling Cloud Backup.
-- There is NO service-role key in the client. Publishable key + user JWT only.
create table if not exists public.edzi_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision integer not null default 1 check (revision >= 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.edzi_snapshots enable row level security;
revoke all on public.edzi_snapshots from anon, public;
grant select, insert, update, delete on public.edzi_snapshots to authenticated;
drop policy if exists "edzi_read_own" on public.edzi_snapshots;
drop policy if exists "edzi_insert_own" on public.edzi_snapshots;
drop policy if exists "edzi_update_own" on public.edzi_snapshots;
drop policy if exists "edzi_delete_own" on public.edzi_snapshots;
create policy "edzi_read_own" on public.edzi_snapshots
for select to authenticated using ((select auth.uid()) = user_id);
create policy "edzi_insert_own" on public.edzi_snapshots
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "edzi_update_own" on public.edzi_snapshots
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "edzi_delete_own" on public.edzi_snapshots
for delete to authenticated using ((select auth.uid()) = user_id);
-- Recommended: explicitly configure Auth email OTP, project rate limits,
-- secure SMTP sender, organization data retention and backup policies.
