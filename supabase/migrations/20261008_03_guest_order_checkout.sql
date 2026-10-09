-- Pedidos de invitados: mantiene descuento, stock y cotización manual.
begin;
create or replace function public.create_guest_order_from_cart(
  p_guest_token uuid,
  p_customer_name text,
  p_customer_phone text,
  p_fulfillment public.order_fulfillment,
  p_payment_method public.order_payment,
  p_address text,
  p_neighborhood text,
  p_pickup_point text,
  p_shipping_cost numeric,
  p_shipping_distance_km numeric,
  p_expected_subtotal numeric,
  p_shipping_pending boolean
)
returns table (order_id uuid, order_subtotal numeric,
  order_discount numeric, order_total numeric)
language plpgsql security definer set search_path = ''
as $$
declare
  v_cart_id uuid;
  v_order_id uuid;
  v_subtotal numeric(10,2);
  v_discount numeric(10,2);
  v_shipping_cost numeric(10,2);
  v_total numeric(10,2);
  v_name text;
  v_phone text;
begin
  v_name := trim(coalesce(p_customer_name, ''));
  v_phone := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');
  if p_guest_token is null then raise exception 'invalid_guest'; end if;
  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'invalid_customer_name'; end if;
  if length(v_phone) < 10 or length(v_phone) > 15 then
    raise exception 'invalid_customer_phone'; end if;
  if p_fulfillment is null then raise exception 'invalid_fulfillment'; end if;
  if p_payment_method is null then raise exception 'invalid_payment'; end if;
  if p_shipping_pending is null
    or (p_shipping_pending and p_fulfillment <> 'envio') then
    raise exception 'invalid_shipping_pending'; end if;
  if p_fulfillment = 'envio' then
    if trim(coalesce(p_address, '')) = '' then
      raise exception 'invalid_address'; end if;
    if p_shipping_pending then
      v_shipping_cost := 0;
    else
      if p_shipping_cost is null
        or p_shipping_cost::text in ('NaN', 'Infinity', '-Infinity')
        or p_shipping_cost < 0 then
        raise exception 'invalid_shipping_cost'; end if;
      v_shipping_cost := p_shipping_cost;
    end if;
  else
    v_shipping_cost := 0;
  end if;

  -- Bloquea el carrito para evitar dos confirmaciones simultáneas.
  select id
  into v_cart_id
  from public.carts
  where guest_token = p_guest_token and user_id is null
  for update;

  if v_cart_id is null then
    raise exception 'empty_cart';
  end if;

  if not exists (
    select 1
    from public.cart_items
    where cart_id = v_cart_id
  ) then
    raise exception 'empty_cart';
  end if;

  perform ci.id from public.cart_items ci
  where ci.cart_id = v_cart_id order by ci.id for update;

  -- Bloquea los productos involucrados mientras se valida y descuenta stock.
  perform p.id
  from public.products p
  join public.cart_items ci
    on ci.product_id = p.id
  where ci.cart_id = v_cart_id
  order by p.id
  for update of p;

  if exists (
    select 1 from public.cart_items ci
    left join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart_id and (
      p.id is null or p.is_active is not true
      or ci.quantity is null or ci.quantity <= 0
    )
  ) then raise exception 'product_unavailable'; end if;

  -- Comprueba que cada variante pertenezca al producto indicado.
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

  -- Suma todas las unidades de un mismo producto y verifica su stock.
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
    where p.is_active is not true
       or p.stock is null
       or p.stock < requested.requested_quantity
  ) then
    raise exception 'insufficient_stock';
  end if;

  -- Calcula nuevamente el subtotal usando los precios de la base.
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

  -- Si cambió el precio o el carrito durante el proceso, no continúa.
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

  v_total := v_subtotal - v_discount + v_shipping_cost;

  insert into public.orders (
    user_id,
    customer_name,
    customer_phone,
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
    null,
    v_name,
    v_phone,
    p_fulfillment,
    p_payment_method,
    case when p_fulfillment = 'envio' then trim(p_address) else null end,
    case when p_fulfillment = 'envio' then nullif(trim(p_neighborhood), '') else null end,
    case when p_fulfillment = 'retiro' then p_pickup_point else null end,
    v_shipping_cost,
    case when p_fulfillment = 'envio' and not p_shipping_pending
      then p_shipping_distance_km else null end,
    p_shipping_pending,
    v_total,
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

  if not p_shipping_pending then
  update public.products p
  set stock = p.stock - requested.requested_quantity
  from (
    select
      ci.product_id,
      sum(ci.quantity)::integer as requested_quantity
    from public.cart_items ci
    where ci.cart_id = v_cart_id
    group by ci.product_id
  ) requested
  where p.id = requested.product_id;

  end if;

  delete from public.cart_items
  where cart_id = v_cart_id;

  return query
  select
    v_order_id,
    v_subtotal,
    v_discount,
    v_total;
end;
$$;

revoke all on function public.create_guest_order_from_cart(uuid, text, text, public.order_fulfillment, public.order_payment, text, text, text, numeric, numeric, numeric, boolean) from public, anon, authenticated;
grant execute on function public.create_guest_order_from_cart(uuid, text, text, public.order_fulfillment, public.order_payment, text, text, text, numeric, numeric, numeric, boolean) to service_role;
commit;
