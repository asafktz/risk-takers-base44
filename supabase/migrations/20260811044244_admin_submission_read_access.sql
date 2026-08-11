-- Let enrolled Risk Takers admins review website submissions in the admin UI.
-- The tables remain invisible to anonymous and ordinary authenticated users;
-- every SELECT is still gated by the existing server-side is_admin() allow-list.
do $$
declare
  submission_table text;
begin
  foreach submission_table in array array[
    'attendees',
    'sponsorship_leads',
    'ai_defense_stack_leads',
    'vendor_applications',
    'guest_applications',
    'contact_messages',
    'privacy_opt_outs'
  ]
  loop
    execute format('grant select on table public.%I to authenticated', submission_table);
    execute format('drop policy if exists "admin read website submissions" on public.%I', submission_table);
    execute format(
      'create policy "admin read website submissions" on public.%I for select to authenticated using ((select public.is_admin()))',
      submission_table
    );
  end loop;
end
$$;
