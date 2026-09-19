create or replace function public.save_product_atomic(
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
  p_box_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
begin
  if trim(coalesce(p_name, '')) = ''
     or trim(coalesce(p_slug, '')) = '' then
    raise exception 'invalid_product';
  end if;

  if p_price is null
     or p_price < 0
     or p_stock is null
     or p_stock < 0
     or (p_old_price is not null and p_old_price < 0) then
    raise exception 'invalid_product_values';
  end if;

  if p_product_id is null then
    insert into public.products (
      name,
      slug,
      short_description,
      description,
      price,
      old_price,
      unit,
      origin,
      suitable_for,
      colorway,
      image_url,
      is_box,
      is_active,
      stock
    )
    values (
      trim(p_name),
      trim(p_slug),
      nullif(trim(p_short_description), ''),
      nullif(trim(p_description), ''),
      p_price,
      p_old_price,
      nullif(trim(p_unit), ''),
      nullif(trim(p_origin), ''),
      nullif(trim(p_suitable_for), ''),
      p_colorway,
      nullif(trim(p_image_url), ''),
      coalesce(p_is_box, false),
      coalesce(p_is_active, true),
      p_stock
    )
    returning id into v_product_id;
  else
    update public.products
    set
      name = trim(p_name),
      slug = trim(p_slug),
      short_description =
        nullif(trim(p_short_description), ''),
      description =
        nullif(trim(p_description), ''),
      price = p_price,
      old_price = p_old_price,
      unit = nullif(trim(p_unit), ''),
      origin = nullif(trim(p_origin), ''),
      suitable_for =
        nullif(trim(p_suitable_for), ''),
      colorway = p_colorway,
      image_url = nullif(trim(p_image_url), ''),
      is_box = coalesce(p_is_box, false),
      is_active = coalesce(p_is_active, true),
      stock = p_stock
    where id = p_product_id
    returning id into v_product_id;

    if v_product_id is null then
      raise exception 'product_not_found';
    end if;
  end if;

  delete from public.product_tags
  where product_id = v_product_id;

  insert into public.product_tags (
    product_id,
    tag
  )
  select
    v_product_id,
    selected.tag
  from unnest(
    coalesce(p_tags, array[]::text[])
  ) as selected(tag);

  delete from public.product_subcategories
  where product_id = v_product_id;

  insert into public.product_subcategories (
    product_id,
    subcategory_id
  )
  select
    v_product_id,
    selected.subcategory_id
  from unnest(
    coalesce(
      p_subcategory_ids,
      array[]::uuid[]
    )
  ) as selected(subcategory_id);

  -- Comprueba que las variantes existentes pertenezcan al producto.
  if exists (
    select 1
    from jsonb_array_elements(
      coalesce(p_variants, '[]'::jsonb)
    ) item
    where nullif(item->>'id', '') is not null
      and not exists (
        select 1
        from public.product_variants pv
        where pv.id = (item->>'id')::uuid
          and pv.product_id = v_product_id
      )
  ) then
    raise exception 'invalid_variant';
  end if;

  -- Actualiza las variantes existentes sin cambiar sus IDs.
  update public.product_variants pv
  set
    label = variant.label,
    price_delta = variant.price_delta,
    is_default = variant.is_default
  from (
    select
      (item->>'id')::uuid as id,
      trim(item->>'label') as label,
      coalesce(
        (item->>'price_delta')::numeric,
        0
      ) as price_delta,
      coalesce(
        (item->>'is_default')::boolean,
        false
      ) as is_default
    from jsonb_array_elements(
      coalesce(p_variants, '[]'::jsonb)
    ) item
    where nullif(item->>'id', '') is not null
  ) variant
  where pv.id = variant.id
    and pv.product_id = v_product_id;

  -- Elimina solamente las variantes quitadas desde el formulario.
  delete from public.product_variants pv
  where pv.product_id = v_product_id
    and not exists (
      select 1
      from jsonb_array_elements(
        coalesce(p_variants, '[]'::jsonb)
      ) item
      where nullif(item->>'id', '') is not null
        and (item->>'id')::uuid = pv.id
    );

  -- Agrega únicamente las variantes nuevas.
  insert into public.product_variants (
    product_id,
    label,
    price_delta,
    is_default
  )
  select
    v_product_id,
    trim(item->>'label'),
    coalesce(
      (item->>'price_delta')::numeric,
      0
    ),
    coalesce(
      (item->>'is_default')::boolean,
      false
    )
  from jsonb_array_elements(
    coalesce(p_variants, '[]'::jsonb)
  ) item
  where nullif(item->>'id', '') is null
    and trim(coalesce(item->>'label', '')) <> '';

  delete from public.product_nutrition
  where product_id = v_product_id;

  insert into public.product_nutrition (
    product_id,
    label,
    value,
    sort_order
  )
  select
    v_product_id,
    trim(nutrition.label),
    trim(nutrition.value),
    nutrition.sort_order
  from jsonb_to_recordset(
    coalesce(p_nutrition, '[]'::jsonb)
  ) as nutrition(
    label text,
    value text,
    sort_order integer
  )
  where trim(
    coalesce(nutrition.label, '')
  ) <> '';

  delete from public.box_items
  where box_product_id = v_product_id;

  if coalesce(p_is_box, false) then
    if exists (
      select 1
      from jsonb_to_recordset(
        coalesce(p_box_items, '[]'::jsonb)
      ) as box_item(
        product_id uuid,
        quantity integer
      )
      where box_item.product_id = v_product_id
         or box_item.quantity <= 0
    ) then
      raise exception 'invalid_box_item';
    end if;

    insert into public.box_items (
      box_product_id,
      included_product_id,
      quantity
    )
    select
      v_product_id,
      box_item.product_id,
      box_item.quantity
    from jsonb_to_recordset(
      coalesce(p_box_items, '[]'::jsonb)
    ) as box_item(
      product_id uuid,
      quantity integer
    );
  end if;

  return v_product_id;
end;
$$;

revoke all
on function public.save_product_atomic(
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
  jsonb
)
from public, anon, authenticated;

grant execute
on function public.save_product_atomic(
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
  jsonb
)
to service_role;