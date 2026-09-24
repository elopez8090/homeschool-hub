-- Stripe subscriptions for featured listings and ESA badges.
-- Run this in the Supabase SQL editor.

alter table programs
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists featured_since timestamptz,
  add column if not exists esa_verified_since timestamptz,
  add column if not exists featured_expiry timestamptz,
  add column if not exists esa_expiry timestamptz;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  program_id integer not null references programs(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  type text not null check (type in ('featured', 'esa')),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists subscriptions_program_id_idx on subscriptions (program_id);
create index if not exists subscriptions_session_id_idx on subscriptions (stripe_checkout_session_id);

create table if not exists processed_stripe_events (
  event_id text primary key,
  event_type text,
  processed_at timestamptz not null default now()
);

alter table subscriptions enable row level security;
alter table processed_stripe_events enable row level security;

notify pgrst, 'reload schema';
