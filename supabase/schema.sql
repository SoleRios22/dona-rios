-- ============================================================
-- DOÑA RÍOS — Esquema de base de datos (Supabase / Postgres)
-- Correr esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. PERFILES (extiende auth.users con rol)
-- ------------------------------------------------------------
create type user_role as enum ('customer', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- Crea el perfil automáticamente cuando alguien se registra
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. PRODUCTOS
-- ------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  description text,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  unit text, -- "Frasco de 400g"
  origin text,
  suitable_for text,
  colorway text default 'clay', -- para el color de fondo del ilustración en el mock
  is_box boolean default false,
  is_active boolean default true,
  stock integer default 0,
  created_at timestamptz not null default now()
);

create table product_tags (
  product_id uuid references products(id) on delete cascade,
  tag text not null check (tag in ('keto','low-carb','sin-gluten','sin-azucar','seleccion')),
  primary key (product_id, tag)
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  label text not null, -- "200g", "400g"
  price_delta numeric(10,2) not null default 0,
  is_default boolean default false
);

create table product_nutrition (
  product_id uuid references products(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer default 0,
  primary key (product_id, label)
);

-- 3. RESEÑAS
-- ------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  unique (product_id, user_id) -- una reseña por producto por usuario
);

-- 4. CARRITOS (persistentes por usuario)
-- ------------------------------------------------------------
create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references profiles(id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  variant_id uuid references product_variants(id),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

-- 5. PEDIDOS (historial, generado al confirmar por WhatsApp)
-- ------------------------------------------------------------
create type order_fulfillment as enum ('envio', 'retiro');
create type order_payment as enum ('efectivo', 'transferencia', 'mercadopago', 'tarjeta');
create type order_status as enum ('pendiente', 'confirmado', 'entregado', 'cancelado');

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  fulfillment order_fulfillment not null,
  payment_method order_payment not null,
  address text,
  neighborhood text,
  pickup_point text,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status order_status not null default 'pendiente',
  whatsapp_message text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id),
  product_name_snapshot text not null, -- por si el producto cambia/se borra despues
  unit_price numeric(10,2) not null,
  quantity integer not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table product_tags enable row level security;
alter table product_variants enable row level security;
alter table product_nutrition enable row level security;
alter table reviews enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Función helper: ¿el usuario actual es admin?
create function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Perfiles: cada uno ve/edita el suyo; admin ve todos
create policy "profiles_select_own" on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Productos: lectura pública, escritura solo admin
create policy "products_public_read" on products for select using (is_active = true or is_admin());
create policy "products_admin_write" on products for insert with check (is_admin());
create policy "products_admin_update" on products for update using (is_admin());
create policy "products_admin_delete" on products for delete using (is_admin());

create policy "tags_public_read" on product_tags for select using (true);
create policy "tags_admin_write" on product_tags for all using (is_admin());

create policy "variants_public_read" on product_variants for select using (true);
create policy "variants_admin_write" on product_variants for all using (is_admin());

create policy "nutrition_public_read" on product_nutrition for select using (true);
create policy "nutrition_admin_write" on product_nutrition for all using (is_admin());

-- Reseñas: lectura pública, solo el dueño (logueado) escribe/edita la suya
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_owner_insert" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_owner_update" on reviews for update using (auth.uid() = user_id);
create policy "reviews_owner_delete" on reviews for delete using (auth.uid() = user_id or is_admin());

-- Carritos: solo el dueño
create policy "carts_owner_all" on carts for all using (auth.uid() = user_id);
create policy "cart_items_owner_all" on cart_items for all using (
  exists (select 1 from carts where carts.id = cart_id and carts.user_id = auth.uid())
);

-- Pedidos: el dueño ve los suyos, admin ve todos
create policy "orders_owner_select" on orders for select using (auth.uid() = user_id or is_admin());
create policy "orders_owner_insert" on orders for insert with check (auth.uid() = user_id);
create policy "orders_admin_update" on orders for update using (is_admin());
create policy "order_items_owner_select" on order_items for select using (
  exists (select 1 from orders where orders.id = order_id and (orders.user_id = auth.uid() or is_admin()))
);
create policy "order_items_owner_insert" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_id and orders.user_id = auth.uid())
);

-- ============================================================
-- FUNCIÓN: descontar stock al confirmar un pedido
-- Se ejecuta con privilegios elevados (security definer) porque el cliente
-- que compra no tiene permiso para editar productos directamente (ver policy
-- products_admin_update), pero sí necesita poder descontar SU compra puntual.
-- ============================================================
create or replace function decrement_product_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;
end;
$$;

grant execute on function decrement_product_stock(uuid, integer) to authenticated;

-- ============================================================
-- FAVORITOS
-- ============================================================
create table favorites (
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table favorites enable row level security;

create policy "favorites_owner_all" on favorites for all using (auth.uid() = user_id);

-- ============================================================
-- SUBCATEGORÍAS (viven "dentro" de una categoría principal)
-- ============================================================
create table subcategories (
  id uuid primary key default gen_random_uuid(),
  parent_tag text not null check (parent_tag in ('keto','low-carb','sin-gluten','sin-azucar','seleccion')),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (parent_tag, slug)
);

create table product_subcategories (
  product_id uuid references products(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  primary key (product_id, subcategory_id)
);

alter table subcategories enable row level security;
alter table product_subcategories enable row level security;

create policy "subcategories_public_read" on subcategories for select using (true);
create policy "subcategories_admin_write" on subcategories for all using (is_admin());

create policy "product_subcategories_public_read" on product_subcategories for select using (true);
create policy "product_subcategories_admin_write" on product_subcategories for all using (is_admin());

-- Simétrica a la anterior: repone stock cuando se cancela un pedido.
create or replace function increment_product_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update products
  set stock = stock + p_quantity
  where id = p_product_id;
end;
$$;

grant execute on function increment_product_stock(uuid, integer) to authenticated;
