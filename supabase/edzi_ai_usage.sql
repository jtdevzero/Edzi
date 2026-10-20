-- Optional rate limiting for the hunter-coach edge function; run in Supabase SQL Editor.
create table if not exists public.edzi_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  used_on date not null,
  requests integer not null default 0 check (requests >= 0 and requests <= 5),
  primary key (user_id, used_on)
);
alter table public.edzi_ai_usage enable row level security;
revoke all on public.edzi_ai_usage from anon, authenticated;
-- Service role only; do not expose its key to the web client.
create or replace function public.edzi_ai_guard(p_user_id uuid)
returns boolean language plpgsql security definer set search_path=public
as $$
declare n integer;
begin
  if p_user_id is null then return false; end if;
  insert into public.edzi_ai_usage(user_id,used_on,requests)
  values (p_user_id,(now() at time zone 'UTC')::date,1)
  on conflict (user_id,used_on) do update
    set requests=edzi_ai_usage.requests+1
    where edzi_ai_usage.requests<5
  returning requests into n;
  return n is not null;
end;$$;
revoke all on function public.edzi_ai_guard(uuid) from public, anon, authenticated;
grant execute on function public.edzi_ai_guard(uuid) to service_role;
