create table if not exists public.recording_registrations (
 id uuid primary key default gen_random_uuid(),
 event_slug text not null,
 full_name text not null check (length(full_name) between 2 and 120),
 email text not null check (length(email) between 3 and 254),
 privacy_opted_out boolean not null default false,
 created_at timestamptz not null default now(),
 last_access_at timestamptz not null default now(),
 unique(event_slug,email)
);
alter table public.recording_registrations enable row level security;
revoke all on public.recording_registrations from anon,authenticated;
grant all on public.recording_registrations to service_role;
create trigger recording_registration_privacy before insert or update of email on public.recording_registrations for each row execute function public.apply_privacy_opt_out();
create table if not exists public.recording_access_attempts (ip_hash text not null, attempted_at timestamptz not null default now());
create index recording_access_attempts_lookup on public.recording_access_attempts(ip_hash,attempted_at);
alter table public.recording_access_attempts enable row level security;
revoke all on public.recording_access_attempts from anon,authenticated;
grant all on public.recording_access_attempts to service_role;
create or replace function public.register_recording_access(p_name text,p_email text,p_ip_hash text) returns uuid language plpgsql security definer set search_path=public as $$
declare result_id uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_ip_hash,0));
 if (select count(*) from recording_access_attempts where ip_hash=p_ip_hash and attempted_at>now()-interval '1 minute')>=10 or (select count(*) from recording_access_attempts where ip_hash=p_ip_hash and attempted_at>now()-interval '1 day')>=100 then raise exception 'REPLAY_RATE_LIMIT'; end if;
 insert into recording_access_attempts(ip_hash) values(p_ip_hash);
 delete from recording_access_attempts where attempted_at<now()-interval '2 days';
 insert into recording_registrations(event_slug,full_name,email) values('ai-defense-stack-showcase-day-n4qd',p_name,lower(trim(p_email))) on conflict(event_slug,email) do update set full_name=excluded.full_name,last_access_at=now() returning id into result_id;
 return result_id;
end $$;
revoke all on function public.register_recording_access(text,text,text) from public,anon,authenticated;
grant execute on function public.register_recording_access(text,text,text) to service_role;
create or replace function public.propagate_recording_privacy_opt_out() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.sale_share_opt_out or new.targeted_advertising_opt_out then update recording_registrations set privacy_opted_out=true where email=new.email_normalized; end if;
 return new;
end $$;
create trigger recording_privacy_opt_out after insert or update on public.privacy_opt_outs for each row execute function public.propagate_recording_privacy_opt_out();

grant select on public.recording_registrations to authenticated;
create policy recording_admin_read on public.recording_registrations for select to authenticated using ((select public.is_admin()));
