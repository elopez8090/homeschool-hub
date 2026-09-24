-- Adds listing fields used by the submit + admin approval workflow.
-- Run this in the Supabase SQL editor if description/website/accepts_esa
-- are missing from pending_submissions.

alter table pending_submissions
  add column if not exists description text,
  add column if not exists website text,
  add column if not exists accepts_esa boolean default false;

notify pgrst, 'reload schema';
