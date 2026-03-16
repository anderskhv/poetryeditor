#!/usr/bin/env node

/**
 * Supabase Migration Runner
 *
 * Runs SQL migration files from supabase/migrations/ against a Supabase project.
 * Tracks applied migrations in a `_migrations` table to avoid re-running.
 *
 * Usage: node supabase/run-migrations.js
 *
 * Requires .env file with:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// .env parser (no dotenv dependency)
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = join(PROJECT_ROOT, '.env');
  if (!existsSync(envPath)) {
    throw new Error(`.env file not found at ${envPath}`);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

// ---------------------------------------------------------------------------
// SQL execution via Supabase REST + service role key
// ---------------------------------------------------------------------------
// Supabase exposes a pg-meta compatible endpoint for executing raw SQL.
// We try multiple known endpoints in order of preference.

let supabaseUrl;
let serviceRoleKey;

/**
 * Execute raw SQL against the Supabase database.
 * Uses the /rest/v1/rpc approach with a helper function,
 * bootstrapped via the pg-meta /query endpoint.
 */
async function execSql(sql) {
  // Try the pg-meta query endpoint (available on all Supabase projects)
  // This endpoint accepts raw SQL when authenticated with the service role key.
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL execution failed (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Execute SQL using the Supabase pg-meta query endpoint.
 * This is used for bootstrapping (creating the exec_sql function itself).
 */
async function execSqlDirect(sql) {
  // The pg-meta API is exposed under /pg/ on the project URL (Supabase-hosted)
  // but it may also be at a different path. Try the standard one first.
  const endpoints = [
    `${supabaseUrl}/pg/query`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'x-connection-encrypted': 'true',
        },
        body: JSON.stringify({ query: sql }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Try next endpoint
    }
  }

  // Fallback: try the Supabase Management API SQL endpoint
  // Extract project ref from URL
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const mgmtEndpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  try {
    const response = await fetch(mgmtEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fall through
  }

  throw new Error(
    'Could not find a working SQL execution endpoint. ' +
    'Please ensure the exec_sql function exists in your database.\n' +
    'You can create it by running this SQL in the Supabase dashboard:\n\n' +
    EXEC_SQL_FUNCTION
  );
}

// ---------------------------------------------------------------------------
// Bootstrap: ensure exec_sql function exists
// ---------------------------------------------------------------------------

const EXEC_SQL_FUNCTION = `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;
`.trim();

const EXEC_SQL_QUERY_FUNCTION = `
CREATE OR REPLACE FUNCTION exec_sql_query(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query INTO result;
  RETURN COALESCE(result, '[]'::json);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM, 'detail', SQLSTATE);
END;
$$;
`.trim();

async function bootstrap() {
  console.log('Bootstrapping: ensuring exec_sql functions exist...');

  // First check if exec_sql already exists by trying to call it
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: 'SELECT 1' }),
    });

    if (response.ok) {
      console.log('  exec_sql function already exists.');

      // Also ensure exec_sql_query exists
      await execSql(EXEC_SQL_QUERY_FUNCTION);
      console.log('  exec_sql_query function ready.');
      return;
    }
  } catch {
    // Function doesn't exist yet
  }

  // Need to create the functions via direct SQL
  console.log('  Creating exec_sql function via pg-meta endpoint...');
  try {
    await execSqlDirect(EXEC_SQL_FUNCTION);
    await execSqlDirect(EXEC_SQL_QUERY_FUNCTION);
    console.log('  Functions created successfully.');
    return;
  } catch (err) {
    console.error('\n' + '='.repeat(70));
    console.error('BOOTSTRAP REQUIRED');
    console.error('='.repeat(70));
    console.error('\nCould not automatically create the exec_sql helper function.');
    console.error('Please run the following SQL in your Supabase SQL Editor:\n');
    console.error(EXEC_SQL_FUNCTION);
    console.error('\n' + EXEC_SQL_QUERY_FUNCTION);
    console.error('\nThen re-run this script.');
    console.error('='.repeat(70) + '\n');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Migration tracking table
// ---------------------------------------------------------------------------

async function ensureMigrationsTable() {
  console.log('Ensuring _migrations tracking table exists...');
  const result = await execSql(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  if (result && result.error) {
    throw new Error(`Failed to create _migrations table: ${result.error}`);
  }
  console.log('  _migrations table ready.');
}

async function getAppliedMigrations() {
  const response = await fetch(`${supabaseUrl}/rest/v1/_migrations?select=name,applied_at&order=name.asc`, {
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    // Table might exist but RLS might block. Try via exec_sql_query.
    const result = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql_query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        query: `SELECT json_agg(row_to_json(m)) FROM _migrations m ORDER BY m.name`,
      }),
    });

    if (result.ok) {
      const data = await result.json();
      return data || [];
    }

    return [];
  }

  return response.json();
}

async function recordMigration(name) {
  const response = await fetch(`${supabaseUrl}/rest/v1/_migrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    // Fallback: insert via exec_sql
    const escaped = name.replace(/'/g, "''");
    await execSql(`INSERT INTO _migrations (name) VALUES ('${escaped}') ON CONFLICT DO NOTHING;`);
  }
}

// ---------------------------------------------------------------------------
// Migration file discovery
// ---------------------------------------------------------------------------

function getMigrationFiles() {
  const migrationsDir = join(__dirname, 'migrations');
  if (!existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Alphabetical = chronological with date prefixes

  return files.map(f => ({
    name: f,
    path: join(migrationsDir, f),
    sql: readFileSync(join(migrationsDir, f), 'utf-8'),
  }));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n=== Supabase Migration Runner ===\n');

  // Load credentials
  const env = loadEnv();
  supabaseUrl = env.VITE_SUPABASE_URL;
  serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL not found in .env');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env');
  }

  // Remove trailing slash
  supabaseUrl = supabaseUrl.replace(/\/+$/, '');

  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service role key: ${serviceRoleKey.slice(0, 20)}...`);
  console.log('');

  // Step 1: Bootstrap exec_sql function
  await bootstrap();
  console.log('');

  // Step 2: Ensure _migrations table
  await ensureMigrationsTable();
  console.log('');

  // Step 3: Discover migration files
  const migrationFiles = getMigrationFiles();
  console.log(`Found ${migrationFiles.length} migration file(s):`);
  for (const m of migrationFiles) {
    console.log(`  - ${m.name}`);
  }
  console.log('');

  // Step 4: Check which are already applied
  const applied = await getAppliedMigrations();
  const appliedNames = new Set(
    Array.isArray(applied) ? applied.map(r => r.name) : []
  );

  const alreadyApplied = migrationFiles.filter(m => appliedNames.has(m.name));
  const pending = migrationFiles.filter(m => !appliedNames.has(m.name));

  if (alreadyApplied.length > 0) {
    console.log(`Already applied (${alreadyApplied.length}):`);
    for (const m of alreadyApplied) {
      const record = applied.find(r => r.name === m.name);
      const at = record?.applied_at ? ` (${new Date(record.applied_at).toISOString()})` : '';
      console.log(`  [skip] ${m.name}${at}`);
    }
    console.log('');
  }

  if (pending.length === 0) {
    console.log('All migrations are up to date. Nothing to do.\n');
    return;
  }

  // Step 5: Run pending migrations
  console.log(`Pending migrations (${pending.length}):`);
  for (const m of pending) {
    console.log(`  [pending] ${m.name}`);
  }
  console.log('');

  let applied_count = 0;
  for (const migration of pending) {
    console.log(`Running: ${migration.name}...`);
    try {
      const result = await execSql(migration.sql);

      // Check for error in the response
      if (result && result.success === false) {
        throw new Error(result.error || 'Unknown SQL error');
      }

      // Record it
      await recordMigration(migration.name);
      applied_count++;
      console.log(`  [done] ${migration.name}`);
    } catch (err) {
      console.error(`\n  [FAILED] ${migration.name}`);
      console.error(`  Error: ${err.message}`);
      console.error(`\nStopping. ${applied_count} migration(s) applied before failure.`);
      console.error('Fix the issue and re-run the script.\n');
      process.exit(1);
    }
  }

  console.log(`\nSuccess! Applied ${applied_count} migration(s).\n`);
}

main().catch(err => {
  console.error(`\nFatal error: ${err.message}\n`);
  process.exit(1);
});
