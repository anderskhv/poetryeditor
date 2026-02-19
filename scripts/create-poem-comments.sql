-- Create poem comments table for inline annotations
create table if not exists public.poem_comments (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  quote text,
  range jsonb not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.poem_comments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'poem_comments' and policyname = 'poem_comments_select_own'
  ) then
    create policy poem_comments_select_own
      on public.poem_comments
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'poem_comments' and policyname = 'poem_comments_insert_own'
  ) then
    create policy poem_comments_insert_own
      on public.poem_comments
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'poem_comments' and policyname = 'poem_comments_update_own'
  ) then
    create policy poem_comments_update_own
      on public.poem_comments
      for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'poem_comments' and policyname = 'poem_comments_delete_own'
  ) then
    create policy poem_comments_delete_own
      on public.poem_comments
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;
