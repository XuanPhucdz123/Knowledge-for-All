-- Sách Gần Nhau — Supabase Schema

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  latitude double precision,
  longitude double precision,
  location_accuracy double precision,
  location_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  author text,
  category text not null,
  condition text not null check (condition in ('new', 'good', 'used', 'old')),
  exchange_type text not null check (exchange_type in ('share', 'exchange', 'borrow')),
  description text not null,
  image_urls text[] default '{}',
  latitude double precision,
  longitude double precision,
  status text default 'available' check (status in ('available', 'reserved', 'shared')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists exchange_requests (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade not null,
  requester_id uuid references profiles(id) on delete cascade not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table books enable row level security;
alter table exchange_requests enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Books are viewable by everyone"
  on books for select using (true);

create policy "Users can insert own books"
  on books for insert with check (auth.uid() = owner_id);

create policy "Users can update own books"
  on books for update using (auth.uid() = owner_id);

create policy "Users can delete own books"
  on books for delete using (auth.uid() = owner_id);

create policy "Exchange requests viewable by participants"
  on exchange_requests for select
  using (auth.uid() = requester_id or auth.uid() = owner_id);

create policy "Users can create exchange requests"
  on exchange_requests for insert
  with check (auth.uid() = requester_id);

create policy "Participants can update exchange requests"
  on exchange_requests for update
  using (auth.uid() = requester_id or auth.uid() = owner_id);
