create or replace function public.update_order_status_with_stock(
  p_order_id uuid,
  p_new_status public.order_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_status public.order_status;
  v_shipping_pending boolean;
begin
  if p_order_id is null or p_new_status is null then
    raise exception 'invalid_input';
  end if;

  -- Bloquea el pedido para evitar dos cambios simultáneos.
  select
    o.status,
    o.shipping_pending
  into
    v_current_status,
    v_shipping_pending
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'order_not_found';
  end if;

  /*
   * Una cotización pendiente todavía no descontó stock.
   * Solo puede continuar pendiente o cancelarse.
   */
  if v_shipping_pending then
    if p_new_status not in ('pendiente', 'cancelado') then
      raise exception 'shipping_cost_required';
    end if;

    update public.orders
    set status = p_new_status
    where id = p_order_id;

    return;
  end if;

  /*
   * Reactivar un pedido cancelado:
   * comprueba y descuenta nuevamente el stock.
   */
  if v_current_status = 'cancelado'
     and p_new_status <> 'cancelado' then

    if exists (
      select 1
      from public.order_items oi
      where oi.order_id = p_order_id
        and oi.product_id is null
    ) then
      raise exception 'product_unavailable';
    end if;

    -- Bloquea los productos siempre en el mismo orden.
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
      left join public.products p
        on p.id = requested.product_id
      where p.id is null
         or p.is_active = false
         or p.stock < requested.requested_quantity
    ) then
      raise exception 'insufficient_stock';
    end if;

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

  /*
   * Cancelar un pedido activo:
   * devuelve al inventario las unidades descontadas.
   */
  elsif v_current_status <> 'cancelado'
        and p_new_status = 'cancelado' then

    perform p.id
    from public.products p
    join public.order_items oi
      on oi.product_id = p.id
    where oi.order_id = p_order_id
    order by p.id
    for update of p;

    update public.products p
    set stock = p.stock + returned.returned_quantity
    from (
      select
        oi.product_id,
        sum(oi.quantity)::integer as returned_quantity
      from public.order_items oi
      where oi.order_id = p_order_id
        and oi.product_id is not null
      group by oi.product_id
    ) returned
    where p.id = returned.product_id;
  end if;

  update public.orders
  set status = p_new_status
  where id = p_order_id;
end;
$$;

-- Solo las acciones seguras del servidor pueden ejecutarla.

revoke all
on function public.update_order_status_with_stock(
  uuid,
  public.order_status
)
from public, anon, authenticated;

grant execute
on function public.update_order_status_with_stock(
  uuid,
  public.order_status
)
to service_role;