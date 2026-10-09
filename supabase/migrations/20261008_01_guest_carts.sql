-- Carritos de invitados. Ejecutado previamente en Supabase.
begin;
alter table public.carts add column if not exists guest_token uuid;
create unique index if not exists carts_guest_token_unique
  on public.carts (guest_token) where guest_token is not null;
alter table public.carts drop constraint if exists carts_guest_identity_check;
alter table public.carts add constraint carts_guest_identity_check
  check (guest_token is null or user_id is null);
commit;
