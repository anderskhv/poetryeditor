create table if not exists poem_versions (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references poems(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists poem_versions_poem_id_idx on poem_versions(poem_id);
create index if not exists poem_versions_user_id_idx on poem_versions(user_id);
create index if not exists poem_versions_poem_user_created_idx on poem_versions(poem_id, user_id, created_at desc);

alter table poem_versions enable row level security;

create policy "poem_versions_select_own" on poem_versions
  for select using (auth.uid() = user_id);

create policy "poem_versions_insert_own" on poem_versions
  for insert with check (auth.uid() = user_id);

create policy "poem_versions_delete_own" on poem_versions
  for delete using (auth.uid() = user_id);

create policy "poem_versions_update_own" on poem_versions
  for update using (auth.uid() = user_id);
