-- The shared trigger previously referenced NEW.email in a CASE expression.
-- PostgreSQL resolves record fields before CASE short-circuiting, so inserts into
-- vendor_applications failed because that table uses work_email instead.
create or replace function public.apply_privacy_opt_out()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_email text;
begin
  candidate_email := case
    when tg_table_name = 'vendor_applications'
      then to_jsonb(new) ->> 'work_email'
    else to_jsonb(new) ->> 'email'
  end;

  new.privacy_opted_out := exists (
    select 1
    from public.privacy_opt_outs p
    where p.email_normalized = lower(trim(candidate_email))
      and (p.sale_share_opt_out or p.targeted_advertising_opt_out)
  );

  return new;
end;
$$;

revoke execute on function public.apply_privacy_opt_out() from public, anon, authenticated;
