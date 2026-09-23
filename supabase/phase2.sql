-- Run this in the Supabase SQL editor if pending_submissions is missing listing fields
-- or if RLS is blocking public reads/submissions.

alter table pending_submissions
  add column if not exists description text,
  add column if not exists website text,
  add column if not exists accepts_esa boolean default false;

alter table pending_submissions enable row level security;
alter table programs enable row level security;

drop policy if exists "Public can read programs" on programs;
create policy "Public can read programs"
  on programs for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can submit programs" on pending_submissions;
create policy "Public can submit programs"
  on pending_submissions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can read pending submissions" on pending_submissions;
-- Keep pending submissions private. Admin routes should use the service role key.
