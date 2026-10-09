-- Transferencia atómica del carrito al iniciar sesión.
begin;
create or replace function public.merge_guest_cart_into_user(
  p_guest_token uuid, p_user_id uuid
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_guest_cart_id uuid;
  v_user_cart_id uuid;
  v_existing_quantity bigint;
  v_combined_quantity bigint;
  v_item record;
begin
  if p_user_id is null then raise exception 'invalid_user'; end if;
  if p_guest_token is null then return null; end if;
  select c.id into v_guest_cart_id from public.carts c
  where c.guest_token = p_guest_token and c.user_id is null for update;
  if v_guest_cart_id is null then return null; end if;
  insert into public.carts (user_id) values (p_user_id)
  on conflict (user_id) do update set updated_at = now()
  returning id into v_user_cart_id;
  perform ci.id from public.cart_items ci
  where ci.cart_id in (v_guest_cart_id, v_user_cart_id)
  order by ci.id for update;
  for v_item in
    select ci.product_id, ci.variant_id, sum(ci.quantity)::bigint as quantity
    from public.cart_items ci where ci.cart_id = v_guest_cart_id
    group by ci.product_id, ci.variant_id
  loop
    select coalesce(sum(ci.quantity), 0)::bigint into v_existing_quantity
    from public.cart_items ci where ci.cart_id = v_user_cart_id
    and ci.product_id = v_item.product_id
    and ci.variant_id is not distinct from v_item.variant_id;
    v_combined_quantity := v_existing_quantity + v_item.quantity;
    if v_combined_quantity <= 0 or v_combined_quantity > 2147483647 then
      raise exception 'invalid_quantity'; end if;
    delete from public.cart_items ci where ci.cart_id = v_user_cart_id
    and ci.product_id = v_item.product_id
    and ci.variant_id is not distinct from v_item.variant_id;
    insert into public.cart_items (cart_id, product_id, variant_id, quantity)
    values (v_user_cart_id, v_item.product_id, v_item.variant_id,
      v_combined_quantity::integer);
  end loop;
  delete from public.cart_items where cart_id = v_guest_cart_id;
  delete from public.carts where id = v_guest_cart_id;
  return v_user_cart_id;
end;
$$;
revoke all on function public.merge_guest_cart_into_user(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.merge_guest_cart_into_user(uuid, uuid)
  to service_role;
commit;
