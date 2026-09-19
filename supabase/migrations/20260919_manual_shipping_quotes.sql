-- Indica que el pedido todavía no tiene un costo de envío definitivo.
alter table public.orders
add column if not exists shipping_pending boolean
not null default false;

-- ============================================================
-- CREAR PEDIDO PARA COTIZAR ENVÍO
-- Guarda el pedido y vacía el carrito, pero no descuenta stock.
-- ============================================================

create or replace function public.create_shipping_quote_from_cart(
  p_user_id uuid,
  p_payment_method public.order_payment,
  p_address text,
  p_neighborhood text,
  p_expected_subtotal numeric
)
returns table (
  order_id uuid,
  order_subtotal numeric,
  order_discount numeric,
  order_partial_total numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cart_id uuid;
  v_subtotal numeric(10,2);
  v_discount numeric(10,2);
  v_partial_total numeric(10,2);
  v_order_id uuid;
begin
  if p_user_id is null then
    raise exception 'invalid_user';
  end if;

  if trim(coalesce(p_address, '')) = '' then
    raise exception 'invalid_address';
  end if;

  select c.id
  into v_cart_id
  from public.carts c
  where c.user_id = p_user_id
  for update;

  if v_cart_id is null then
    raise exception 'empty_cart';
  end if;

  if not exists (
    select 1
    from public.cart_items ci
    where ci.cart_id = v_cart_id
  ) then
    raise exception 'empty_cart';
  end if;

  -- Bloquea momentáneamente los productos mientras guarda la cotización.
  perform p.id
  from public.products p
  join public.cart_items ci
    on ci.product_id = p.id
  where ci.cart_id = v_cart_id
  order by p.id
  for update of p;

  -- Comprueba que cada variante pertenezca al producto.
  if exists (
    select 1
    from public.cart_items ci
    left join public.product_variants pv
      on pv.id = ci.variant_id
     and pv.product_id = ci.product_id
    where ci.cart_id = v_cart_id
      and ci.variant_id is not null
      and pv.id is null
  ) then
    raise exception 'invalid_variant';
  end if;

  -- Verifica disponibilidad actual, aunque todavía no reserva stock.
  if exists (
    select 1
    from (
      select
        ci.product_id,
        sum(ci.quantity)::integer as requested_quantity
      from public.cart_items ci
      where ci.cart_id = v_cart_id
      group by ci.product_id
    ) requested
    join public.products p
      on p.id = requested.product_id
    where p.is_active = false
       or p.stock < requested.requested_quantity
  ) then
    raise exception 'insufficient_stock';
  end if;

  select coalesce(
    sum(
      (p.price + coalesce(pv.price_delta, 0))
      * ci.quantity
    ),
    0
  )
  into v_subtotal
  from public.cart_items ci
  join public.products p
    on p.id = ci.product_id
  left join public.product_variants pv
    on pv.id = ci.variant_id
   and pv.product_id = ci.product_id
  where ci.cart_id = v_cart_id;

  if p_expected_subtotal is null
     or v_subtotal <> p_expected_subtotal then
    raise exception 'cart_changed';
  end if;

  v_discount :=
    case
      when p_payment_method = 'efectivo'
        then round(v_subtotal * 0.10)
      else 0
    end;

  v_partial_total := v_subtotal - v_discount;

  insert into public.orders (
    user_id,
    fulfillment,
    payment_method,
    address,
    neighborhood,
    pickup_point,
    shipping_cost,
    shipping_distance_km,
    shipping_pending,
    total,
    status
  )
  values (
    p_user_id,
    'envio',
    p_payment_method,
    trim(p_address),
    nullif(trim(p_neighborhood), ''),
    null,
    0,
    null,
    true,
    v_partial_total,
    'pendiente'
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    variant_id,
    product_name_snapshot,
    unit_price,
    quantity
  )
  select
    v_order_id,
    p.id,
    ci.variant_id,
    p.name,
    p.price + coalesce(pv.price_delta, 0),
    ci.quantity
  from public.cart_items ci
  join public.products p
    on p.id = ci.product_id
  left join public.product_variants pv
    on pv.id = ci.variant_id
   and pv.product_id = ci.product_id
  where ci.cart_id = v_cart_id;

  delete from public.cart_items
  where cart_id = v_cart_id;

  return query
  select
    v_order_id,
    v_subtotal,
    v_discount,
    v_partial_total;
end;
$$;

-- ============================================================
-- CONFIRMAR PEDIDO DESPUÉS DE COTIZAR EL ENVÍO
-- Valida stock, descuenta unidades y calcula el total final.
-- ============================================================

create or replace function public.confirm_shipping_quote_order(
  p_order_id uuid,
  p_shipping_cost numeric
)
returns table (
  confirmed_total numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment_method public.order_payment;
  v_status public.order_status;
  v_shipping_pending boolean;
  v_subtotal numeric(10,2);
  v_discount numeric(10,2);
  v_total numeric(10,2);
begin
  if p_shipping_cost is null or p_shipping_cost < 0 then
    raise exception 'invalid_shipping_cost';
  end if;

  select
    o.payment_method,
    o.status,
    o.shipping_pending
  into
    v_payment_method,
    v_status,
    v_shipping_pending
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'order_not_found';
  end if;

  if v_shipping_pending = false then
    raise exception 'shipping_already_confirmed';
  end if;

  if v_status <> 'pendiente' then
    raise exception 'invalid_order_status';
  end if;

  if exists (
    select 1
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.product_id is null
  ) then
    raise exception 'product_unavailable';
  end if;

  -- Bloquea los productos antes de controlar y descontar stock.
  perform p.id
  from public.products p
  join public.order_items oi
    on oi.product_id = p.id
  where oi.order_id = p_order_id
  order by p.id
  for update of p;

  if exists (
    select 1
    from (
      select
        oi.product_id,
        sum(oi.quantity)::integer as requested_quantity
      from public.order_items oi
      where oi.order_id = p_order_id
      group by oi.product_id
    ) requested
    join public.products p
      on p.id = requested.product_id
    where p.is_active = false
       or p.stock < requested.requested_quantity
  ) then
    raise exception 'insufficient_stock';
  end if;

  select coalesce(
    sum(oi.unit_price * oi.quantity),
    0
  )
  into v_subtotal
  from public.order_items oi
  where oi.order_id = p_order_id;

  v_discount :=
    case
      when v_payment_method = 'efectivo'
        then round(v_subtotal * 0.10)
      else 0
    end;

  v_total := v_subtotal - v_discount + p_shipping_cost;

  update public.products p
  set stock = p.stock - requested.requested_quantity
  from (
    select
      oi.product_id,
      sum(oi.quantity)::integer as requested_quantity
    from public.order_items oi
    where oi.order_id = p_order_id
    group by oi.product_id
  ) requested
  where p.id = requested.product_id;

  update public.orders
  set
    shipping_cost = p_shipping_cost,
    shipping_pending = false,
    total = v_total,
    status = 'confirmado'
  where id = p_order_id;

  return query
  select v_total;
end;
$$;

-- Solo el servidor puede crear y confirmar estas cotizaciones.

revoke all
on function public.create_shipping_quote_from_cart(
  uuid,
  public.order_payment,
  text,
  text,
  numeric
)
from public, anon, authenticated;

grant execute
on function public.create_shipping_quote_from_cart(
  uuid,
  public.order_payment,
  text,
  text,
  numeric
)
to service_role;

revoke all
on function public.confirm_shipping_quote_order(
  uuid,
  numeric
)
from public, anon, authenticated;

grant execute
on function public.confirm_shipping_quote_order(
  uuid,
  numeric
)
to service_role;