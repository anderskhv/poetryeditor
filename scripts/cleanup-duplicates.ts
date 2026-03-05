/**
 * Cleanup duplicate poems from Supabase
 * Run with: npx tsx scripts/cleanup-duplicates.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  } catch {
    // .env file not found, rely on existing env vars
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
  console.log('Run with: VITE_SUPABASE_URL=xxx VITE_SUPABASE_ANON_KEY=xxx npx tsx scripts/cleanup-duplicates.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Poem {
  id: string;
  collection_id: string;
  title: string;
  created_at: string;
}

async function main() {
  console.log('Fetching all poems...');

  const { data: poems, error } = await supabase
    .from('poems')
    .select('id, collection_id, title, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching poems:', error);
    process.exit(1);
  }

  console.log(`Found ${poems.length} total poems`);

  // Group by collection_id + title
  const groups = new Map<string, Poem[]>();
  for (const poem of poems as Poem[]) {
    const key = `${poem.collection_id}:${poem.title}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(poem);
  }

  // Find duplicates
  const toDelete: string[] = [];
  let duplicateGroups = 0;

  for (const [key, poemList] of groups) {
    if (poemList.length > 1) {
      duplicateGroups++;
      // Keep the first (earliest), delete the rest
      const [keep, ...duplicates] = poemList;
      console.log(`\nDuplicate: "${keep.title}" (${poemList.length} copies)`);
      console.log(`  Keeping: ${keep.id} (created ${keep.created_at})`);
      for (const dup of duplicates) {
        console.log(`  Deleting: ${dup.id} (created ${dup.created_at})`);
        toDelete.push(dup.id);
      }
    }
  }

  if (toDelete.length === 0) {
    console.log('\nNo duplicates found!');
    return;
  }

  console.log(`\n${duplicateGroups} poems have duplicates`);
  console.log(`${toDelete.length} duplicate entries will be deleted`);
  console.log('\nDeleting duplicates...');

  const { error: deleteError } = await supabase
    .from('poems')
    .delete()
    .in('id', toDelete);

  if (deleteError) {
    console.error('Error deleting duplicates:', deleteError);
    process.exit(1);
  }

  console.log(`Successfully deleted ${toDelete.length} duplicate poems!`);
}

main();
