-- THE EDGE Phase 2 Supabase schema
-- Run this in the Supabase SQL editor after creating a new project.

create extension if not exists pgcrypto;

create type public.order_status as enum (
  'new',
  'preparing',
  'ready',
  'completed',
  'expired',
  'customer_late'
);

create type public.dining_option as enum ('dine-in', 'takeaway');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'vendor', 'admin')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  emoji text not null default '🍽️',
  banner_url text,
  logo_url text,
  is_open boolean not null default true,
  closed_note text,
  prep_time_minutes integer not null default 10 check (prep_time_minutes >= 0),
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  tags text[] not null default '{}',
  categories text[] not null default '{}',
  payment_link text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  title text not null,
  description text not null default '',
  image_url text,
  price_lkr integer not null check (price_lkr >= 0),
  discount_lkr integer check (discount_lkr is null or discount_lkr >= 0),
  category text not null,
  dietary_tags text[] not null default '{}',
  estimated_prep_time_minutes integer not null default 10 check (estimated_prep_time_minutes >= 0),
  available_slots text[] not null default '{}',
  max_per_order integer check (max_per_order is null or max_per_order > 0),
  is_available boolean not null default true,
  badge text,
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'new',
  total_amount_lkr integer not null check (total_amount_lkr >= 0),
  pickup_time timestamptz not null,
  pickup_code text not null unique default upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8)),
  note text,
  payment_status public.payment_status not null default 'pending',
  payment_provider text,
  payment_reference text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete restrict,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_title text not null,
  quantity integer not null check (quantity > 0),
  unit_price_lkr integer not null check (unit_price_lkr >= 0),
  notes text,
  dining public.dining_option not null default 'takeaway',
  shop_pin text not null default lpad(floor(random() * 10000)::text, 4, '0'),
  created_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (shop_id is not null and menu_item_id is null)
    or (shop_id is null and menu_item_id is not null)
  )
);

create index shops_slug_idx on public.shops(slug);
create index shops_owner_id_idx on public.shops(owner_id);
create index menu_items_shop_id_idx on public.menu_items(shop_id);
create index menu_items_category_idx on public.menu_items(category);
create index orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index orders_status_idx on public.orders(status);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_shop_id_idx on public.order_items(shop_id);
create index favorites_user_id_idx on public.favorites(user_id);
create unique index favorites_user_shop_unique_idx
on public.favorites(user_id, shop_id)
where shop_id is not null;
create unique index favorites_user_menu_item_unique_idx
on public.favorites(user_id, menu_item_id)
where menu_item_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger shops_set_updated_at
before update on public.shops
for each row execute function public.set_updated_at();

create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Anyone can read approved shops"
on public.shops for select
using (is_approved = true);

create policy "Shop owners can read their shops"
on public.shops for select
using (auth.uid() = owner_id);

create policy "Shop owners can update their shops"
on public.shops for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Authenticated users can apply with a shop"
on public.shops for insert
with check (auth.uid() = owner_id);

create policy "Anyone can read available menu items from approved shops"
on public.menu_items for select
using (
  is_available = true
  and exists (
    select 1 from public.shops
    where shops.id = menu_items.shop_id
      and shops.is_approved = true
  )
);

create policy "Shop owners can manage their menu items"
on public.menu_items for all
using (
  exists (
    select 1 from public.shops
    where shops.id = menu_items.shop_id
      and shops.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.shops
    where shops.id = menu_items.shop_id
      and shops.owner_id = auth.uid()
  )
);

create policy "Customers can read their orders"
on public.orders for select
using (auth.uid() = user_id);

create policy "Customers can create their orders"
on public.orders for insert
with check (auth.uid() = user_id);

create policy "Vendors can read orders containing their shops"
on public.orders for select
using (
  exists (
    select 1
    from public.order_items
    join public.shops on shops.id = order_items.shop_id
    where order_items.order_id = orders.id
      and shops.owner_id = auth.uid()
  )
);

create policy "Vendors can update orders containing their shops"
on public.orders for update
using (
  exists (
    select 1
    from public.order_items
    join public.shops on shops.id = order_items.shop_id
    where order_items.order_id = orders.id
      and shops.owner_id = auth.uid()
  )
);

create policy "Customers can read their order items"
on public.order_items for select
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Customers can create items for their orders"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Vendors can read their order items"
on public.order_items for select
using (
  exists (
    select 1 from public.shops
    where shops.id = order_items.shop_id
      and shops.owner_id = auth.uid()
  )
);

create policy "Users can manage their favorites"
on public.favorites for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('shop-assets', 'shop-assets', true),
  ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "Anyone can read public shop assets"
on storage.objects for select
using (bucket_id in ('shop-assets', 'menu-images'));

create policy "Authenticated users can upload shop assets"
on storage.objects for insert
with check (
  bucket_id in ('shop-assets', 'menu-images')
  and auth.role() = 'authenticated'
);

create policy "Asset owners can update their uploads"
on storage.objects for update
using (owner = auth.uid())
with check (owner = auth.uid());

create policy "Asset owners can delete their uploads"
on storage.objects for delete
using (owner = auth.uid());

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
