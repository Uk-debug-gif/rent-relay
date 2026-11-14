-- Run this in Supabase SQL Editor.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  category text not null,
  subcategory text not null,
  price_per_day integer not null check (price_per_day between 1 and 100000),
  condition text not null check (char_length(condition) between 1 and 60),
  description text not null default '',
  image_url text,
  address text not null default '',
  pickup_area text not null default '',
  created_at timestamptz not null default now()
);
-- Safe upgrades for projects where the listings table already exists.
alter table public.listings add column if not exists description text not null default '';
alter table public.listings add column if not exists image_url text;
alter table public.listings alter column owner_id drop not null;
alter table public.listings add column if not exists address text not null default '';
alter table public.listings add column if not exists pickup_area text not null default '';
create index if not exists listings_owner_id_idx on public.listings(owner_id);
alter table public.listings enable row level security;
drop policy if exists "Anyone can read listings" on public.listings;
create policy "Anyone can read listings" on public.listings for select to anon, authenticated using (true);
drop policy if exists "Users can create their own listings" on public.listings;
drop policy if exists "Anyone can create listings without an account" on public.listings;
create policy "Anyone can create listings without an account" on public.listings for insert to anon, authenticated with check (owner_id is null or owner_id = (select auth.uid()));
drop policy if exists "Owners can update their own listings" on public.listings;
create policy "Owners can update their own listings" on public.listings for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners can delete their own listings" on public.listings;
create policy "Owners can delete their own listings" on public.listings for delete to authenticated using ((select auth.uid()) = owner_id);

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
alter table public.profiles add column if not exists terms_accepted boolean not null default false;
alter table public.profiles add column if not exists terms_version text;
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles enable row level security;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
grant select, insert on public.listings to anon;
grant select, insert, update, delete on public.listings to authenticated;
grant select on public.profiles to authenticated;

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
  insert into public.profiles (id, username, full_name, mobile, email, terms_accepted, terms_version, terms_accepted_at)
  values (
    new.id,
    public.generate_username(),
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 60),
    left(coalesce(new.raw_user_meta_data->>'mobile', ''), 16),
    new.email,
    coalesce((new.raw_user_meta_data->>'terms_accepted')::boolean, false),
    left(coalesce(new.raw_user_meta_data->>'terms_version', ''), 20),
    nullif(new.raw_user_meta_data->>'terms_accepted_at', '')::timestamptz
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    mobile = excluded.mobile,
    email = excluded.email,
    terms_accepted = excluded.terms_accepted,
    terms_version = excluded.terms_version,
    terms_accepted_at = coalesce(excluded.terms_accepted_at, public.profiles.terms_accepted_at);
  return new;
end $$;

revoke execute on function public.generate_username() from public, anon, authenticated;
revoke execute on function public.handle_verified_user() from public, anon, authenticated;
-- This event-trigger helper is not a client-facing RPC; keep it inaccessible to API roles.
do $
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_verified_user();
drop trigger if exists on_auth_user_verified on auth.users;
create trigger on_auth_user_verified after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_verified_user();

-- After email OTP, the user submits their full name. Sync that metadata
-- into the profile row created at email verification.
drop trigger if exists on_auth_user_profile_metadata_updated on auth.users;
create trigger on_auth_user_profile_metadata_updated
  after update of raw_user_meta_data on auth.users
  for each row execute function public.handle_verified_user();


-- Public read access for item photos; anonymous listing submissions
-- upload into the public folder without requiring an account.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view listing photos" on storage.objects;
create policy "Public can view listing photos" on storage.objects
  for select using (bucket_id = 'listing-images');

drop policy if exists "Users upload their own listing photos" on storage.objects;
drop policy if exists "Anyone can upload listing photos" on storage.objects;
create policy "Anyone can upload listing photos" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = 'public'
  );

drop policy if exists "Users delete their own listing photos" on storage.objects;
create policy "Users delete their own listing photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ================= Booking requests and private accepted-booking contacts =================
create table if not exists public.booking_requests (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid not null references public.listings(id) on delete cascade,
 renter_id uuid not null references auth.users(id) on delete cascade,
 start_date date not null,
 rental_days integer not null check (rental_days between 1 and 30),
 message text not null default '' check (char_length(message) <= 500),
 status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists booking_requests_listing_idx on public.booking_requests(listing_id,status,created_at desc);
create index if not exists booking_requests_renter_idx on public.booking_requests(renter_id,created_at desc);
alter table public.booking_requests enable row level security;
drop policy if exists "Participants can view booking requests" on public.booking_requests;
create policy "Participants can view booking requests" on public.booking_requests for select to authenticated using (
 renter_id = (select auth.uid()) or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid()))
);
drop policy if exists "Renters can request another member listing" on public.booking_requests;
create policy "Renters can request another member listing" on public.booking_requests for insert to authenticated with check (
 renter_id = (select auth.uid()) and exists (select 1 from public.listings l where l.id = listing_id and l.owner_id is not null and l.owner_id <> (select auth.uid())) and start_date >= current_date and rental_days between 1 and 30 and status = 'pending'
);
drop policy if exists "Owners can decide booking requests" on public.booking_requests;
create policy "Owners can decide booking requests" on public.booking_requests for update to authenticated using (
 exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid()))
) with check (status in ('accepted','declined') and exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
grant select, insert on public.booking_requests to authenticated;
grant update(status,updated_at) on public.booking_requests to authenticated;
create or replace function public.booking_contact(p_booking_id uuid)
returns table(owner_name text,owner_mobile text,renter_name text,renter_mobile text)
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid; v_renter uuid; v_status text;
begin
 select l.owner_id,br.renter_id,br.status into v_owner,v_renter,v_status from public.booking_requests br join public.listings l on l.id=br.listing_id where br.id=p_booking_id;
 if v_owner is null or v_status <> 'accepted' or auth.uid() not in (v_owner,v_renter) then raise exception 'Contact details are available only to booking participants after acceptance'; end if;
 return query select coalesce(op.full_name,'Lender'),op.mobile,coalesce(rp.full_name,'Renter'),rp.mobile from public.profiles op join public.profiles rp on rp.id=v_renter where op.id=v_owner;
end $$;
revoke all on function public.booking_contact(uuid) from public,anon;
grant execute on function public.booking_contact(uuid) to authenticated;


-- No listing_contact RPC: direct listing views must never expose a lender's phone.
drop function if exists public.listing_contact(uuid);

-- ================= Production hardening =================
-- Require a signed-in owner for every new listing; anonymous spam is blocked.
drop policy if exists "Anyone can create listings without an account" on public.listings;
drop policy if exists "Users can create their own listings" on public.listings;
create policy "Members can create their own listings" on public.listings
  for insert to authenticated
  with check (owner_id = (select auth.uid()));
revoke insert on public.listings from anon;
grant insert on public.listings to authenticated;

-- Enforce bounded fields and an allow-listed category/subcategory pair at the DB boundary.
create or replace function public.valid_listing_category(p_category text, p_subcategory text)
returns boolean language sql immutable set search_path = ''
as $$
  select case p_category
    when 'Study Materials' then p_subcategory in ('Calculators','Notes & stationery','Study accessories')
    when 'Books & Copies' then p_subcategory in ('Textbooks','Notebooks & copies','Novels')
    when 'Lab Essentials' then p_subcategory in ('Lab coats','Glassware','Safety items')
    when 'Indoor Games' then p_subcategory in ('Board games','Chess & carrom','Indoor sports')
    when 'Outdoor Sports' then p_subcategory in ('Rackets','Balls','Sports accessories')
    when 'Utensils & Kitchen' then p_subcategory in ('Cookware','Flasks & bottles','Dining')
    else false end;
$$;
revoke all on function public.valid_listing_category(text,text) from public, anon;
grant execute on function public.valid_listing_category(text,text) to authenticated;
alter table public.listings drop constraint if exists listings_category_valid;
alter table public.listings add constraint listings_category_valid
  check (public.valid_listing_category(category, subcategory));
alter table public.listings drop constraint if exists listings_description_length;
alter table public.listings add constraint listings_description_length check (char_length(description) <= 500);
alter table public.listings drop constraint if exists listings_address_length;
alter table public.listings add constraint listings_address_length check (char_length(address) <= 120);
alter table public.listings drop constraint if exists listings_image_url_bucket;
alter table public.listings add constraint listings_image_url_bucket check (
  image_url is null or (owner_id is not null and image_url like 'https://tvtmhisivwctprqmbzbj.supabase.co/storage/v1/object/public/listing-images/' || owner_id::text || '/%' and image_url ~ '^https://tvtmhisivwctprqmbzbj[.]supabase[.]co/storage/v1/object/public/listing-images/[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}[.](jpg|jpeg|png|webp)
);

-- Terms fields are mandatory and validated by the auth trigger before a profile can be created.
create or replace function public.handle_verified_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_terms_at timestamptz;
begin
  if new.email_confirmed_at is null then return new; end if;
  if coalesce(new.raw_user_meta_data->>'terms_accepted','false') <> 'true'
     or new.raw_user_meta_data->>'terms_version' <> '2026-11-14'
     or coalesce(new.raw_user_meta_data->>'terms_accepted_at','') !~ '^\\d{4}-\\d{2}-\\d{2}T'
  then raise exception 'Terms acceptance is required'; end if;
  v_terms_at := (new.raw_user_meta_data->>'terms_accepted_at')::timestamptz;
  insert into public.profiles (id, username, full_name, mobile, email, terms_accepted, terms_version, terms_accepted_at)
  values (new.id, public.generate_username(),
    left(coalesce(new.raw_user_meta_data->>'full_name',''),60),
    left(coalesce(new.raw_user_meta_data->>'mobile',''),16),
    new.email, true, '2026-11-14', v_terms_at)
  on conflict (id) do update set
    full_name=excluded.full_name, mobile=excluded.mobile, email=excluded.email,
    terms_accepted=true, terms_version=excluded.terms_version,
    terms_accepted_at=coalesce(excluded.terms_accepted_at,public.profiles.terms_accepted_at);
  return new;
end $$;

-- Storage: authenticated users upload into their own UUID folder and can delete only their own files.
drop policy if exists "Anyone can upload listing photos" on storage.objects;
drop policy if exists "Users upload their own listing photos" on storage.objects;
create policy "Members upload their own listing photos" on storage.objects
  for insert to authenticated with check (
    bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid())::text
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}[.](jpg|jpeg|png|webp)$'
  );
drop policy if exists "Users delete their own listing photos" on storage.objects;
create policy "Members delete their own listing photos" on storage.objects
  for delete to authenticated using (
    bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid())::text
  );
drop policy if exists "Members can view listing photos" on storage.objects;
-- Public bucket read remains intentional; only the object upload/delete boundary is private.

-- Prevent duplicate pending requests by one renter for the same item.
create unique index if not exists booking_one_pending_per_renter_item
  on public.booking_requests(listing_id,renter_id) where status='pending';
-- Prevent overlapping accepted date ranges for the same item, including concurrent accept attempts.
create extension if not exists btree_gist;
create index if not exists booking_no_overlapping_accepted_dates
  on public.booking_requests using gist (
    listing_id with =,
    daterange(start_date, start_date + rental_days, '[)') with &&
  ) where status='accepted';

-- Strict state machine: owner may decide pending requests; renter may cancel their own pending request.
create or replace function public.guard_booking_status_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_owner uuid;
begin
  if new.listing_id <> old.listing_id or new.renter_id <> old.renter_id
     or new.start_date <> old.start_date or new.rental_days <> old.rental_days
     or new.message <> old.message then
    raise exception 'Booking request details cannot be changed';
  end if;
  if old.status <> 'pending' then raise exception 'Only pending requests can change status'; end if;
  select owner_id into v_owner from public.listings where id=old.listing_id;
  if auth.uid() = old.renter_id and new.status='cancelled' then return new; end if;
  if auth.uid() = v_owner and new.status in ('accepted','declined') then return new; end if;
  raise exception 'Not allowed to change this request status';
end $$;
drop trigger if exists booking_status_guard on public.booking_requests;
create trigger booking_status_guard before update on public.booking_requests
for each row execute function public.guard_booking_status_change();

drop policy if exists "Owners can decide booking requests" on public.booking_requests;
drop policy if exists "Renters can cancel their own pending requests" on public.booking_requests;
create policy "Owners can decide pending requests" on public.booking_requests
  for update to authenticated using (
    status='pending' and exists(select 1 from public.listings l where l.id=listing_id and l.owner_id=(select auth.uid()))
  ) with check (status in ('accepted','declined'));
create policy "Renters can cancel their own pending requests" on public.booking_requests
  for update to authenticated using (renter_id=(select auth.uid()) and status='pending')
  with check (renter_id=(select auth.uid()) and status='cancelled');

revoke all on function public.booking_contact(uuid) from public, anon;
grant execute on function public.booking_contact(uuid) to authenticated;

-- Keep exact/private pickup addresses out of the public Data API.
-- New clients read/write only the general pickup_area field.
revoke select on public.listings from anon, authenticated;
grant select (id,owner_id,title,category,subcategory,price_per_day,condition,description,image_url,pickup_area,created_at)
  on public.listings to anon, authenticated;
revoke insert on public.listings from anon, authenticated;
grant insert (owner_id,title,category,subcategory,price_per_day,condition,description,image_url,pickup_area)
  on public.listings to authenticated;
revoke update, delete on public.listings from anon;
revoke update on public.listings from authenticated;
grant update (title,category,subcategory,price_per_day,condition,description,image_url,pickup_area)
  on public.listings to authenticated;
grant delete on public.listings to authenticated;
revoke all on public.listings from anon;
grant select (id,owner_id,title,category,subcategory,price_per_day,condition,description,image_url,pickup_area,created_at)
  on public.listings to anon;
)
);

-- Terms fields are mandatory and validated by the auth trigger before a profile can be created.
create or replace function public.handle_verified_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_terms_at timestamptz;
begin
  if new.email_confirmed_at is null then return new; end if;
  if coalesce(new.raw_user_meta_data->>'terms_accepted','false') <> 'true'
     or new.raw_user_meta_data->>'terms_version' <> '2026-11-14'
     or coalesce(new.raw_user_meta_data->>'terms_accepted_at','') !~ '^\\d{4}-\\d{2}-\\d{2}T'
  then raise exception 'Terms acceptance is required'; end if;
  v_terms_at := (new.raw_user_meta_data->>'terms_accepted_at')::timestamptz;
  insert into public.profiles (id, username, full_name, mobile, email, terms_accepted, terms_version, terms_accepted_at)
  values (new.id, public.generate_username(),
    left(coalesce(new.raw_user_meta_data->>'full_name',''),60),
    left(coalesce(new.raw_user_meta_data->>'mobile',''),16),
    new.email, true, '2026-11-14', v_terms_at)
  on conflict (id) do update set
    full_name=excluded.full_name, mobile=excluded.mobile, email=excluded.email,
    terms_accepted=true, terms_version=excluded.terms_version,
    terms_accepted_at=coalesce(excluded.terms_accepted_at,public.profiles.terms_accepted_at);
  return new;
end $$;

-- Storage: authenticated users upload into their own UUID folder and can delete only their own files.
drop policy if exists "Anyone can upload listing photos" on storage.objects;
drop policy if exists "Users upload their own listing photos" on storage.objects;
create policy "Members upload their own listing photos" on storage.objects
  for insert to authenticated with check (
    bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid())::text
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}[.](jpg|jpeg|png|webp)$'
  );
drop policy if exists "Users delete their own listing photos" on storage.objects;
create policy "Members delete their own listing photos" on storage.objects
  for delete to authenticated using (
    bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid())::text
  );
drop policy if exists "Members can view listing photos" on storage.objects;
-- Public bucket read remains intentional; only the object upload/delete boundary is private.

-- Prevent duplicate pending requests by one renter for the same item.
create unique index if not exists booking_one_pending_per_renter_item
  on public.booking_requests(listing_id,renter_id) where status='pending';
-- Prevent overlapping accepted date ranges for the same item, including concurrent accept attempts.
create extension if not exists btree_gist;
create index if not exists booking_no_overlapping_accepted_dates
  on public.booking_requests using gist (
    listing_id with =,
    daterange(start_date, start_date + rental_days, '[)') with &&
  ) where status='accepted';

-- Strict state machine: owner may decide pending requests; renter may cancel their own pending request.
create or replace function public.guard_booking_status_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_owner uuid;
begin
  if new.listing_id <> old.listing_id or new.renter_id <> old.renter_id
     or new.start_date <> old.start_date or new.rental_days <> old.rental_days
     or new.message <> old.message then
    raise exception 'Booking request details cannot be changed';
  end if;
  if old.status <> 'pending' then raise exception 'Only pending requests can change status'; end if;
  select owner_id into v_owner from public.listings where id=old.listing_id;
  if auth.uid() = old.renter_id and new.status='cancelled' then return new; end if;
  if auth.uid() = v_owner and new.status in ('accepted','declined') then return new; end if;
  raise exception 'Not allowed to change this request status';
end $$;
drop trigger if exists booking_status_guard on public.booking_requests;
create trigger booking_status_guard before update on public.booking_requests
for each row execute function public.guard_booking_status_change();

drop policy if exists "Owners can decide booking requests" on public.booking_requests;
drop policy if exists "Renters can cancel their own pending requests" on public.booking_requests;
create policy "Owners can decide pending requests" on public.booking_requests
  for update to authenticated using (
    status='pending' and exists(select 1 from public.listings l where l.id=listing_id and l.owner_id=(select auth.uid()))
  ) with check (status in ('accepted','declined'));
create policy "Renters can cancel their own pending requests" on public.booking_requests
  for update to authenticated using (renter_id=(select auth.uid()) and status='pending')
  with check (renter_id=(select auth.uid()) and status='cancelled');

revoke all on function public.booking_contact(uuid) from public, anon;
grant execute on function public.booking_contact(uuid) to authenticated;

-- Keep exact/private pickup addresses out of the public Data API.
-- New clients read/write only the general pickup_area field.
revoke select on public.listings from anon, authenticated;
grant select (id,owner_id,title,category,subcategory,price_per_day,condition,description,image_url,pickup_area,created_at)
  on public.listings to anon, authenticated;
revoke insert on public.listings from anon, authenticated;
grant insert (owner_id,title,category,subcategory,price_per_day,condition,description,image_url,pickup_area)
  on public.listings to authenticated;
revoke update, delete on public.listings from anon;
revoke update on public.listings from authenticated;
grant update (title,category,subcategory,price_per_day,condition,description,image_url,pickup_area)
  on public.listings to authenticated;
grant delete on public.listings to authenticated;
revoke all on public.listings from anon;
grant select (id,owner_id,title,category,subcategory,price_per_day,condition,description,image_url,pickup_area,created_at)
  on public.listings to anon;

-- Bound the number of active listings and uploaded photos per member.
drop policy if exists "Members can create their own listings" on public.listings;
create policy "Members can create their own listings" on public.listings
  for insert to authenticated
  with check (owner_id=(select auth.uid()) and
    (select count(*) from public.listings l where l.owner_id=(select auth.uid())) < 20);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create or replace function private.can_upload_listing_photo()
returns boolean language sql security definer set search_path = ''
as $$
  select auth.uid() is not null and
    (select count(*) from storage.objects o
      where o.bucket_id='listing-images'
        and (storage.foldername(o.name))[1]=(select auth.uid())::text) < 20;
$$;
revoke all on function private.can_upload_listing_photo() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.can_upload_listing_photo() to authenticated;
drop policy if exists "Members upload their own listing photos" on storage.objects;
create policy "Members upload their own listing photos" on storage.objects
  for insert to authenticated with check (
    bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid())::text
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}[.](jpg|jpeg|png|webp)$'
    and private.can_upload_listing_photo()
  );
