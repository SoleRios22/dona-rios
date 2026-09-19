select
  grantee,
  column_name,
  privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee in ('anon', 'authenticated')
  and privilege_type = 'UPDATE'
order by grantee, column_name;