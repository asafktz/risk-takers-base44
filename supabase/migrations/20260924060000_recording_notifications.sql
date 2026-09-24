-- Existing registrations are intentionally excluded from the new-lead alerts.
alter table public.recording_registrations
 add column notification_status text not null default 'skipped'
 check (notification_status in ('skipped','pending','sending','sent','failed')),
 add column notification_sent_at timestamptz,
 add column notification_provider_id text;
alter table public.recording_registrations alter column notification_status set default 'pending';
