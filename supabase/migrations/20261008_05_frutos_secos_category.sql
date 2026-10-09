-- Sexta categoría, conserva las cinco anteriores.
begin;
alter table public.product_tags drop constraint if exists product_tags_tag_check;
alter table public.product_tags add constraint product_tags_tag_check
  check (tag in ('keto', 'low-carb', 'sin-gluten', 'sin-azucar', 'seleccion', 'frutos-secos'));
alter table public.subcategories drop constraint if exists subcategories_parent_tag_check;
alter table public.subcategories add constraint subcategories_parent_tag_check
  check (parent_tag in ('keto', 'low-carb', 'sin-gluten', 'sin-azucar', 'seleccion', 'frutos-secos'));
commit;
