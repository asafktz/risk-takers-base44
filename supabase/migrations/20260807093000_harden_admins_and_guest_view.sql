-- Preserve the enrolled admin check while removing public access to the allow-list.
alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- Keep public guest cards working through an invoker-security view. Anonymous
-- users receive only the exact non-sensitive columns used by the public site.
drop policy if exists "public read safe guest rows" on public.guests;
create policy "public read safe guest rows"
on public.guests
for select
to anon
using (true);

revoke all on table public.guests from anon;
grant select (id, name, preferred_name, title, bio, linkedin_link, image_url, photo_preference, created_date)
on table public.guests
to anon;

create or replace view public.guests_public
with (security_invoker = true)
as
select id, name, preferred_name, title, bio, linkedin_link, image_url, photo_preference, created_date
from public.guests;

grant select on table public.guests_public to anon, authenticated;
