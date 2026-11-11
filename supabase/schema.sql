-- Run this in Supabase SQL Editor.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  category text not null,
  subcategory text not null,
  price_per_day integer not null check (price_per_day between 1 and 100000),
  condition text not null,
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
