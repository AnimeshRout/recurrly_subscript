-- Recurly / Recurrly — paste this entire file into the Supabase SQL Editor and click Run.
-- Dashboard: https://supabase.com/dashboard/project/_/sql

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  plan text,
  category text,
  payment_method text,
  status text default 'active',
  start_date timestamptz,
  price numeric not null,
  currency text default 'USD',
  billing text default 'Monthly',
  frequency text,
  renewal_date timestamptz,
  color text,
  icon_key text default 'wallet',
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);

-- ---------------------------------------------------------------------------
-- Domain restriction: only @hbplus.fit
-- ---------------------------------------------------------------------------

create or replace function public.is_allowed_email(input_email text)
returns boolean
language sql
immutable
as $$
  select lower(split_part(coalesce(input_email, ''), '@', 2)) = 'hbplus.fit';
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- First allowed Google user becomes admin. Non-hbplus.fit emails are rejected.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count integer;
begin
  if not public.is_allowed_email(new.email) then
    raise exception 'Access restricted. Please login using your official domain email.';
  end if;

  select count(*) into user_count from public.profiles;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    case when user_count = 0 then 'admin' else 'user' end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid() and public.is_allowed_email(email));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "Admins delete profiles" on public.profiles;
create policy "Admins delete profiles"
  on public.profiles for delete to authenticated
  using (public.is_admin());

drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions"
  on public.subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users insert own subscriptions" on public.subscriptions;
create policy "Users insert own subscriptions"
  on public.subscriptions for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users update own subscriptions" on public.subscriptions;
create policy "Users update own subscriptions"
  on public.subscriptions for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users delete own subscriptions" on public.subscriptions;
create policy "Users delete own subscriptions"
  on public.subscriptions for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users insert own analytics events" on public.analytics_events;
create policy "Users insert own analytics events"
  on public.analytics_events for insert to authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Users read own analytics events" on public.analytics_events;
create policy "Users read own analytics events"
  on public.analytics_events for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage analytics events" on public.analytics_events;
create policy "Admins manage analytics events"
  on public.analytics_events for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update, delete on public.analytics_events to authenticated;
