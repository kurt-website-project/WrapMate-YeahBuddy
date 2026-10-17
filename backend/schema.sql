-- WrapMate database schema (PostgreSQL / Supabase)
-- Paste and run this in the Supabase dashboard: SQL Editor -> New query -> Run.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'operator',
  first_name text default '',
  middle_initial text default '',
  last_name text default '',
  avatar_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null,
  name text not null,
  width numeric not null,
  height numeric not null,
  cost numeric not null default 0,
  price numeric not null default 0,
  image_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null,
  customer text not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  sku text not null,
  width numeric not null,
  height numeric not null,
  protection numeric not null,
  length numeric not null,
  quantity integer not null,
  unit_cost numeric not null default 0,
  unit_price numeric not null default 0,
  revenue numeric not null default 0,
  profit numeric not null default 0,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

-- Simple counters so order codes / SKUs auto-increment (WM-001, WM-PROD-001).
create table if not exists counters (
  name text primary key,
  value integer not null default 0
);

insert into counters (name, value) values ('product_seq', 0)
  on conflict (name) do nothing;
insert into counters (name, value) values ('order_seq', 0)
  on conflict (name) do nothing;

-- Enforce uniqueness on generated identifiers so a race can never persist two
-- orders with the same order_code or two products with the same sku. Wrapped in
-- DO blocks because Postgres has no "add constraint if not exists"; this makes
-- the script safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_order_code_key'
  ) then
    alter table orders add constraint orders_order_code_key unique (order_code);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_sku_key'
  ) then
    alter table products add constraint products_sku_key unique (sku);
  end if;
end $$;

-- Atomic, idempotent counter increment. A single UPDATE ... RETURNING is
-- executed as one statement, so concurrent callers each receive a distinct
-- value and can never collide on WM-001 / WM-PROD-001.
create or replace function next_counter(p_name text) returns int
  language sql
as $$
  update counters set value = value + 1 where name = p_name returning value;
$$;
