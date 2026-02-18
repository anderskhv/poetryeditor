-- Create share table for read-only collection sharing
create table if not exists public.collection_shares (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  created_at timestamptz default now()
);

alter table public.collection_shares enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'collection_shares' and policyname = 'collection_shares_select_own'
  ) then
    create policy collection_shares_select_own
      on public.collection_shares
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'collection_shares' and policyname = 'collection_shares_insert_own'
  ) then
    create policy collection_shares_insert_own
      on public.collection_shares
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Return shared collection as a JSON payload
create or replace function public.get_shared_collection(share_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  share_row record;
  collection_row jsonb;
  sections_row jsonb;
  poems_row jsonb;
  comments_row jsonb;
begin
  select * into share_row from public.collection_shares where token = share_token limit 1;
  if share_row is null then
    return null;
  end if;

  select to_jsonb(c) into collection_row
  from public.collections c
  where c.id = share_row.collection_id;

  select coalesce(jsonb_agg(s order by s.sort_order), '[]'::jsonb) into sections_row
  from public.sections s
  where s.collection_id = share_row.collection_id;

  select coalesce(jsonb_agg(p order by p.sort_order), '[]'::jsonb) into poems_row
  from public.poems p
  where p.collection_id = share_row.collection_id;

  select coalesce(jsonb_agg(pc order by pc.created_at), '[]'::jsonb) into comments_row
  from public.poem_comments pc
  where pc.poem_id in (
    select id from public.poems where collection_id = share_row.collection_id
  );

  return jsonb_build_object(
    'collection', collection_row,
    'sections', sections_row,
    'poems', poems_row,
    'comments', comments_row
  );
end;
$$;

grant execute on function public.get_shared_collection(text) to anon, authenticated;
