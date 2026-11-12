-- Run this in Supabase SQL Editor.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  category text not null,
  subcategory text not null,
  price_per_day integer not null check (price_per_day between 1 and 100000),
  condition text not null check (char_length(condition) between 1 and 60),
  created_at timestamptz not null default now()
);
alter table public.listings enable row level security;
drop policy if exists "Anyone can read listings" on public.listings;
create policy "Anyone can read listings" on public.listings for select using (true);
drop policy if exists "Users can create their own listings" on public.listings;
create policy "Users can create their own listings" on public.listings for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Owners can update their own listings" on public.listings;
create policy "Owners can update their own listings" on public.listings for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Owners can delete their own listings" on public.listings;
create policy "Owners can delete their own listings" on public.listings for delete to authenticated using (auth.uid() = owner_id);

-- ================= Profiles + automatic random username =================
-- A profile row is created the moment a user's EMAIL IS VERIFIED (email OTP),
-- and the database gives them a random unique username like student_48213.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text,
  mobile text,        -- collected at sign-up, NOT verified by SMS
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
-- No insert/update/delete policies on purpose: only the trigger below writes profiles,
-- so nobody can pick or change a username from the browser.

create or replace function public.generate_username() returns text
language plpgsql set search_path = '' as $$
declare candidate text; tries int := 0;
begin
  loop
    tries := tries + 1;
    if tries <= 10 then
      candidate := 'student_' || lpad(floor(random() * 100000)::int::text, 5, '0');
    else
      candidate := 'student_' || substr(md5(random()::text || clock_timestamp()::text), 1, 10);
    end if;
    exit when not exists (select 1 from public.profiles where username = candidate);
  end loop;
  return candidate;
end $$;

create or replace function public.handle_verified_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is null then return new; end if;
  insert into public.profiles (id, username, full_name, mobile, email)
  values (
    new.id,
    public.generate_username(),
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 60),
    left(coalesce(new.raw_user_meta_data->>'mobile', ''), 16),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;

revoke execute on function public.generate_username() from public, anon, authenticated;
revoke execute on function public.handle_verified_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_verified_user();
drop trigger if exists on_auth_user_verified on auth.users;
create trigger on_auth_user_verified after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_verified_user();
