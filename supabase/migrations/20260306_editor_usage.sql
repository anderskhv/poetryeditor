-- Editor usage tracking for freemium model
-- Tracks API token usage per user per month for cap enforcement

create table if not exists public.editor_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,          -- "2026-03" format
  model text not null default '',   -- model identifier
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_cents numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast monthly lookups
create index if not exists idx_editor_usage_user_month
  on public.editor_usage(user_id, month_key);

-- Enable RLS
alter table public.editor_usage enable row level security;

-- Users can read their own usage
create policy editor_usage_select_own
  on public.editor_usage for select
  using (auth.uid() = user_id);

-- Users can insert their own usage
create policy editor_usage_insert_own
  on public.editor_usage for insert
  with check (auth.uid() = user_id);

-- Users can update their own usage
create policy editor_usage_update_own
  on public.editor_usage for update
  using (auth.uid() = user_id);
