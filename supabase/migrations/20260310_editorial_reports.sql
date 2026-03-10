-- Editorial report system: pre-flight answers and full reports

-- Pre-flight answers (saved per collection, reusable across report generations)
create table if not exists editor_preflight_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id text not null,
  answers jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique(user_id, collection_id)
);

-- Full editorial reports (history)
create table if not exists editor_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id text not null,
  preflight_answers jsonb not null default '{}',
  spine_analysis jsonb,
  editor_readings jsonb not null default '[]',
  section_editorials jsonb not null default '[]',
  debate_log jsonb not null default '[]',
  per_poem_assessments jsonb not null default '[]',
  synthesized_report text not null default '',
  status text not null default 'generating',
  progress jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- RLS policies
alter table editor_preflight_answers enable row level security;
alter table editor_reports enable row level security;

create policy "Users can manage their own preflight answers"
  on editor_preflight_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own reports"
  on editor_reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists idx_editor_preflight_user_collection
  on editor_preflight_answers(user_id, collection_id);

create index if not exists idx_editor_reports_user_collection
  on editor_reports(user_id, collection_id);

create index if not exists idx_editor_reports_created
  on editor_reports(created_at desc);
