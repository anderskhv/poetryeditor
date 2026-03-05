import { createClient } from '@supabase/supabase-js';
import { stdin, stdout } from 'process';
import { createInterface } from 'readline';

// Prompt for Supabase service role key (bypasses RLS)
const rl = createInterface({ input: stdin, output: stdout });
const question = (q) => new Promise(resolve => rl.question(q, resolve));

console.log('This script needs the Supabase service_role key to bypass RLS.');
console.log('Find it at: https://supabase.com/dashboard/project/ddmixytouribcvqqgsjo/settings/api\n');
const serviceKey = await question('Paste service_role key: ');
rl.close();

if (!serviceKey.trim()) { console.error('No key provided.'); process.exit(1); }

const supabase = createClient(
  'https://ddmixytouribcvqqgsjo.supabase.co',
  serviceKey.trim()
);

// First check which poems have non-left alignment
const { data, error } = await supabase
  .from('poems')
  .select('id, title, formatting')
  .not('formatting', 'is', null);

if (error) { console.error('Error fetching:', error); process.exit(1); }

const centered = data.filter(p => p.formatting?.align && p.formatting.align !== 'left');
console.log(`\nFound ${centered.length} poems with non-left alignment:`);
centered.forEach(p => console.log(`  - "${p.title}" (align: ${p.formatting.align})`));

if (centered.length === 0) {
  console.log('Nothing to fix.');
  process.exit(0);
}

// Reset alignment to 'left' for each affected poem
let fixed = 0;
for (const poem of centered) {
  const newFormatting = { ...poem.formatting, align: 'left' };
  const { error: updateError } = await supabase
    .from('poems')
    .update({ formatting: newFormatting })
    .eq('id', poem.id);

  if (updateError) {
    console.error(`  Failed to update "${poem.title}":`, updateError.message);
  } else {
    fixed++;
  }
}

console.log(`\nReset ${fixed}/${centered.length} poems to left alignment.`);
