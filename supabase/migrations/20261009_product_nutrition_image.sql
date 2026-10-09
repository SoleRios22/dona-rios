begin;

alter table public.products
  add column if not exists nutrition_image_url text;

create or replace function public.save_product_with_nutrition_image(
  p_product_id uuid,
  p_name text,
  p_slug text,
  p_short_description text,
  p_description text,
  p_price numeric,
  p_old_price numeric,
  p_unit text,
  p_origin text,
  p_suitable_for text,
  p_colorway text,
  p_image_url text,
  p_is_box boolean,
  p_is_active boolean,
  p_stock integer,
  p_tags text[],
  p_subcategory_ids uuid[],
  p_variants jsonb,
  p_nutrition jsonb,
  p_box_items jsonb,
  p_nutrition_image_url text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
begin
  -- Conserva las validaciones y el guardado actual del producto,
  -- categorías, variantes, nutrición y contenido de combos.
  v_product_id := public.save_product_atomic(
    p_product_id,
    p_name,
    p_slug,
    p_short_description,
    p_description,
    p_price,
    p_old_price,
    p_unit,
    p_origin,
    p_suitable_for,
    p_colorway,
    p_image_url,
    p_is_box,
    p_is_active,
    p_stock,
    p_tags,
    p_subcategory_ids,
    p_variants,
    p_nutrition,
    p_box_items
  );

  update public.products
  set nutrition_image_url =
    nullif(trim(p_nutrition_image_url), '')
  where id = v_product_id;

  return v_product_id;
end;
$$;

revoke all
on function public.save_product_with_nutrition_image(
  uuid,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  integer,
  text[],
  uuid[],
  jsonb,
  jsonb,
  jsonb,
  text
)
from public, anon, authenticated;

grant execute
on function public.save_product_with_nutrition_image(
  uuid,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  integer,
  text[],
  uuid[],
  jsonb,
  jsonb,
  jsonb,
  text
)
to service_role;

commit;