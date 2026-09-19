drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

revoke update on table public.profiles from anon, authenticated;

grant update (full_name, phone)
on table public.profiles
to authenticated;

revoke insert, delete
on table public.profiles
from anon, authenticated;