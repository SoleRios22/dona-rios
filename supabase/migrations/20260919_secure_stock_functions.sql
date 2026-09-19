-- Descontar stock: solo acepta cantidades positivas
create or replace function public.decrement_product_stock(
  p_product_id uuid,
  p_quantity integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor que cero';
  end if;

  update public.products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;

  if not found then
    raise exception 'Producto inexistente';
  end if;
end;
$$;

-- Reponer stock: solo acepta cantidades positivas
create or replace function public.increment_product_stock(
  p_product_id uuid,
  p_quantity integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor que cero';
  end if;

  update public.products
  set stock = stock + p_quantity
  where id = p_product_id;

  if not found then
    raise exception 'Producto inexistente';
  end if;
end;
$$;

-- Ningún visitante ni cliente puede ejecutar estas funciones directamente
revoke all
on function public.decrement_product_stock(uuid, integer)
from public, anon, authenticated;

revoke all
on function public.increment_product_stock(uuid, integer)
from public, anon, authenticated;

-- Solo el código seguro del servidor puede ejecutarlas
grant execute
on function public.decrement_product_stock(uuid, integer)
to service_role;

grant execute
on function public.increment_product_stock(uuid, integer)
to service_role;