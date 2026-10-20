-- Optional online guilds. NEVER treat submitted scores as verified physical activity.
-- Execute in a private Supabase project; test RLS across two real accounts.
create extension if not exists pgcrypto;
create table if not exists public.edzi_guilds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 35),
  invite_code text unique not null default encode(gen_random_bytes(10),'hex'),
  created_at timestamptz not null default now()
);
create table if not exists public.edzi_guild_members (
  guild_id uuid not null references public.edzi_guilds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  nickname text not null check (char_length(nickname) between 1 and 24),
  joined_at timestamptz not null default now(),
  primary key (guild_id,user_id)
);
create table if not exists public.edzi_guild_contributions (
  guild_id uuid not null,
  user_id uuid not null,
  week text not null check (week ~ '^2[0-9]{3}-[0-9]{2}-[0-9]{2}$'),
  days smallint not null check (days between 0 and 7),
  minutes integer not null check (minutes between 0 and 10080),
  focus integer not null check (focus between 0 and 10080),
  updated_at timestamptz not null default now(),
  primary key(guild_id,user_id,week),
  foreign key(guild_id,user_id) references public.edzi_guild_members(guild_id,user_id) on delete cascade
);
alter table public.edzi_guilds enable row level security;
alter table public.edzi_guild_members enable row level security;
alter table public.edzi_guild_contributions enable row level security;
revoke all on public.edzi_guilds from anon,authenticated,public;
revoke all on public.edzi_guild_members from anon,authenticated,public;
revoke all on public.edzi_guild_contributions from anon,authenticated,public;

create or replace function public.edzi_is_guild_member(p_guild uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.edzi_guild_members m
    where m.guild_id=p_guild and m.user_id=(select auth.uid()));
$$;
revoke all on function public.edzi_is_guild_member(uuid) from public,anon;
grant execute on function public.edzi_is_guild_member(uuid) to authenticated;
grant select on public.edzi_guilds,public.edzi_guild_members,public.edzi_guild_contributions to authenticated;
grant insert,update on public.edzi_guild_contributions to authenticated;
grant delete on public.edzi_guild_members to authenticated;

drop policy if exists guild_read on public.edzi_guilds;
create policy guild_read on public.edzi_guilds for select to authenticated
  using (public.edzi_is_guild_member(id));
drop policy if exists members_read on public.edzi_guild_members;
create policy members_read on public.edzi_guild_members for select to authenticated
  using (public.edzi_is_guild_member(guild_id));
drop policy if exists members_leave on public.edzi_guild_members;
create policy members_leave on public.edzi_guild_members for delete to authenticated
  using (user_id=(select auth.uid()));
drop policy if exists contributions_read on public.edzi_guild_contributions;
create policy contributions_read on public.edzi_guild_contributions for select to authenticated
  using (public.edzi_is_guild_member(guild_id));
drop policy if exists contributions_insert on public.edzi_guild_contributions;
create policy contributions_insert on public.edzi_guild_contributions for insert to authenticated
  with check (user_id=(select auth.uid()) and public.edzi_is_guild_member(guild_id));
drop policy if exists contributions_update on public.edzi_guild_contributions;
create policy contributions_update on public.edzi_guild_contributions for update to authenticated
  using (user_id=(select auth.uid()) and public.edzi_is_guild_member(guild_id))
  with check (user_id=(select auth.uid()) and public.edzi_is_guild_member(guild_id));

create or replace function public.edzi_create_guild(p_name text,p_nickname text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_user uuid := (select auth.uid()); v_id uuid; v_code text;
begin
  if v_user is null then raise exception 'Jelentkezz be.'; end if;
  if length(trim(p_name)) not between 1 and 35 or length(trim(p_nickname)) not between 1 and 24
     then raise exception 'Érvénytelen név.'; end if;
  if exists(select 1 from public.edzi_guild_members where user_id=v_user)
     then raise exception 'Már egy céh tagja vagy.'; end if;
  insert into public.edzi_guilds(owner_id,name)
    values(v_user,trim(p_name)) returning id,invite_code into v_id,v_code;
  insert into public.edzi_guild_members(guild_id,user_id,nickname)
    values(v_id,v_user,trim(p_nickname));
  return jsonb_build_object('guild_id',v_id,'invite_code',v_code);
end;$$;
create or replace function public.edzi_join_guild(p_code text,p_nickname text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_user uuid := (select auth.uid()); v_id uuid;
begin
  if v_user is null then raise exception 'Jelentkezz be.'; end if;
  if length(trim(p_nickname)) not between 1 and 24 then raise exception 'Érvénytelen név.'; end if;
  if exists(select 1 from public.edzi_guild_members where user_id=v_user)
     then raise exception 'Már egy céh tagja vagy.'; end if;
  select id into v_id from public.edzi_guilds where invite_code=lower(trim(p_code));
  if v_id is not null and
    (select count(*) from public.edzi_guild_members where guild_id=v_id)>=6
    then raise exception 'A céh megtelt (maximum 6 tag).'; end if;
  if v_id is null then raise exception 'Hibás meghívókód.'; end if;
  insert into public.edzi_guild_members(guild_id,user_id,nickname)
    values(v_id,v_user,trim(p_nickname));
  return jsonb_build_object('guild_id',v_id);
end;$$;
revoke all on function public.edzi_create_guild(text,text) from public,anon;
revoke all on function public.edzi_join_guild(text,text) from public,anon;
grant execute on function public.edzi_create_guild(text,text) to authenticated;
grant execute on function public.edzi_join_guild(text,text) to authenticated;
-- Service administrators should consider guild retention, deletion and abuse policies.
