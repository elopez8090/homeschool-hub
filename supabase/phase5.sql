-- Owner claims: passwordless magic links, one owner per program.
-- Run this in the Supabase SQL editor before using claim or owner routes.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint users_email_lowercase check (email = lower(email)),
  constraint users_email_unique unique (email)
);

-- Single-use magic links. The email contains the raw token;
-- only the SHA-256 hash is stored here.
create table if not exists auth_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  action text not null check (action in ('signin', 'claim_program')),
  program_id integer references programs(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint auth_tokens_action_program_check check (
    (action = 'signin' and program_id is null)
    or (action = 'claim_program' and program_id is not null)
  )
);

-- Login session after the magic link is consumed. Separate from auth_tokens
-- so a 24-hour single-use link can create a longer-lived httpOnly cookie.
-- The cookie holds the raw token; only token_hash is stored here.
create table if not exists owner_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table programs
  add column if not exists claimed_by uuid references users(id) on delete set null,
  add column if not exists claimed_at timestamptz;

-- Stays in sync with claimed_by. The public badge reads this.
alter table programs
  add column if not exists owner_verified boolean
  generated always as (claimed_by is not null) stored;

create index if not exists programs_claimed_by_idx on programs (claimed_by);
create index if not exists auth_tokens_email_idx on auth_tokens (lower(email));
create index if not exists owner_sessions_user_id_idx on owner_sessions (user_id);

alter table users enable row level security;
alter table auth_tokens enable row level security;
alter table owner_sessions enable row level security;

notify pgrst, 'reload schema';
