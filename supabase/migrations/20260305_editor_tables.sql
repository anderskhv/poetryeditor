-- AI Editor: Supabase migration
-- Run this in the Supabase SQL editor

-- 1. Poet profiles — one per user, evolves over time
create table if not exists editor_poet_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  onboarding_completed boolean not null default false,
  onboarding_data jsonb not null default '{}',
  learnings jsonb not null default '[]',
  patterns jsonb not null default '{"stylePreferences":[],"tendencies":[],"themes":[]}',
  feedback_style jsonb not null default '{"directness":"balanced","tone":"encouraging"}',
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_interaction_at timestamptz not null default now()
);

-- 2. Conversations — chat threads
create table if not exists editor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  poem_id text,
  collection_id text,
  mode text not null default 'per_poem' check (mode in ('per_poem', 'collection')),
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Messages — individual chat messages
create table if not exists editor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references editor_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- 4. Editorial letters — versioned editorial output (Phase 2)
create table if not exists editor_editorial_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id text not null,
  version_number integer not null default 1,
  summary text not null default '',
  per_poem_notes jsonb not null default '[]',
  todo_list jsonb not null default '[]',
  debate_rounds integer not null default 0,
  generated_at timestamptz not null default now(),
  custom_notes text not null default ''
);

-- Indexes
create index if not exists idx_editor_profiles_user on editor_poet_profiles(user_id);
create index if not exists idx_editor_conversations_user on editor_conversations(user_id);
create index if not exists idx_editor_conversations_poem on editor_conversations(poem_id);
create index if not exists idx_editor_messages_conversation on editor_messages(conversation_id);
create index if not exists idx_editor_messages_created on editor_messages(created_at);
create index if not exists idx_editor_letters_user on editor_editorial_letters(user_id);
create index if not exists idx_editor_letters_collection on editor_editorial_letters(collection_id);

-- RLS policies
alter table editor_poet_profiles enable row level security;
alter table editor_conversations enable row level security;
alter table editor_messages enable row level security;
alter table editor_editorial_letters enable row level security;

-- Profiles: users can only access their own
create policy "Users can view own profile" on editor_poet_profiles
  for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on editor_poet_profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on editor_poet_profiles
  for update using (auth.uid() = user_id);

-- Conversations: users can only access their own
create policy "Users can view own conversations" on editor_conversations
  for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on editor_conversations
  for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations" on editor_conversations
  for update using (auth.uid() = user_id);
create policy "Users can delete own conversations" on editor_conversations
  for delete using (auth.uid() = user_id);

-- Messages: users can access messages in their conversations
create policy "Users can view own messages" on editor_messages
  for select using (
    conversation_id in (
      select id from editor_conversations where user_id = auth.uid()
    )
  );
create policy "Users can insert own messages" on editor_messages
  for insert with check (
    conversation_id in (
      select id from editor_conversations where user_id = auth.uid()
    )
  );

-- Editorial letters: users can only access their own
create policy "Users can view own letters" on editor_editorial_letters
  for select using (auth.uid() = user_id);
create policy "Users can insert own letters" on editor_editorial_letters
  for insert with check (auth.uid() = user_id);
create policy "Users can update own letters" on editor_editorial_letters
  for update using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger editor_profiles_updated_at
  before update on editor_poet_profiles
  for each row execute function update_updated_at();

create trigger editor_conversations_updated_at
  before update on editor_conversations
  for each row execute function update_updated_at();
