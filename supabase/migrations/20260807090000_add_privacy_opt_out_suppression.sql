-- Applied to project umznkxyzovuzhavkmqjt on 2026-08-07.
-- Central suppression registry and automatic flags for commercial-use exports.
create table if not exists public.privacy_opt_outs (
  email_normalized text primary key,
  email text not null,
  sale_share_opt_out boolean not null default true,
  targeted_advertising_opt_out boolean not null default true,
  source text not null default 'privacy_choices',
  global_privacy_control boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.privacy_opt_outs enable row level security;

alter table public.attendees add column if not exists privacy_opted_out boolean not null default false;
alter table public.sponsorship_leads add column if not exists privacy_opted_out boolean not null default false;
alter table public.ai_defense_stack_leads add column if not exists privacy_opted_out boolean not null default false;
alter table public.vendor_applications add column if not exists privacy_opted_out boolean not null default false;
alter table public.guest_applications add column if not exists privacy_opted_out boolean not null default false;
alter table public.contact_messages add column if not exists privacy_opted_out boolean not null default false;

create or replace function public.apply_privacy_opt_out() returns trigger language plpgsql security definer set search_path = public as $$
declare candidate_email text;
begin
  candidate_email := case when tg_table_name = 'vendor_applications' then new.work_email else new.email end;
  new.privacy_opted_out := exists (select 1 from public.privacy_opt_outs p where p.email_normalized = lower(trim(candidate_email)) and (p.sale_share_opt_out or p.targeted_advertising_opt_out));
  return new;
end;
$$;

do $$ declare table_name text; email_column text; begin
  for table_name, email_column in select * from (values
    ('attendees','email'), ('sponsorship_leads','email'), ('ai_defense_stack_leads','email'),
    ('vendor_applications','work_email'), ('guest_applications','email'), ('contact_messages','email')
  ) as v(table_name,email_column) loop
    execute format('drop trigger if exists %I_privacy_opt_out on public.%I', table_name, table_name);
    execute format('create trigger %I_privacy_opt_out before insert or update of %I on public.%I for each row execute function public.apply_privacy_opt_out()', table_name, email_column, table_name);
  end loop;
end $$;

create or replace function public.propagate_privacy_opt_out() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.attendees set privacy_opted_out = true where lower(trim(email)) = new.email_normalized;
  update public.sponsorship_leads set privacy_opted_out = true where lower(trim(email)) = new.email_normalized;
  update public.ai_defense_stack_leads set privacy_opted_out = true where lower(trim(email)) = new.email_normalized;
  update public.vendor_applications set privacy_opted_out = true where lower(trim(work_email)) = new.email_normalized;
  update public.guest_applications set privacy_opted_out = true where lower(trim(email)) = new.email_normalized;
  update public.contact_messages set privacy_opted_out = true where lower(trim(email)) = new.email_normalized;
  return new;
end;
$$;
drop trigger if exists propagate_privacy_opt_out on public.privacy_opt_outs;
create trigger propagate_privacy_opt_out after insert or update on public.privacy_opt_outs for each row when (new.sale_share_opt_out or new.targeted_advertising_opt_out) execute function public.propagate_privacy_opt_out();

create or replace view public.sponsor_eligible_attendees with (security_invoker = true) as select * from public.attendees where privacy_opted_out = false;

revoke execute on function public.apply_privacy_opt_out() from public, anon, authenticated;
revoke execute on function public.propagate_privacy_opt_out() from public, anon, authenticated;
