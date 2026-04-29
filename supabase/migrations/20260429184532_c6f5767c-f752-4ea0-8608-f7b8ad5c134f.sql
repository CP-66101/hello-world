-- Storage bucket for admin uploads
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- Public read; admin write
create policy "public read site-assets"
on storage.objects for select
using (bucket_id = 'site-assets');

create policy "admins upload site-assets"
on storage.objects for insert
with check (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

create policy "admins update site-assets"
on storage.objects for update
using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

create policy "admins delete site-assets"
on storage.objects for delete
using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

-- Bootstrap function: claim admin role if no admin exists yet
create or replace function public.claim_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  has_admin boolean;
begin
  if auth.uid() is null then
    return false;
  end if;
  select exists(select 1 from public.user_roles where role = 'admin') into has_admin;
  if has_admin then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict do nothing;
  return true;
end;
$$;

-- Allow update on submissions for admins (mark as read etc, future)
create policy "admins update contact" on public.contact_submissions for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update franchise" on public.franchise_submissions for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));