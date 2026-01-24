#!/usr/bin/env node
/**
 * Google Search Console Data Fetcher
 *
 * Usage:
 *   npm run stats           # Overview stats for last 28 days
 *   npm run queries         # Top search queries
 *   npm run pages           # Top pages by clicks
 *
 * Or with custom options:
 *   node index.js --days 7 --queries --limit 20
 */

import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';

const TOKEN_PATH = './token.json';
const CREDENTIALS_PATH = './credentials.json';
const SITE_URL = 'https://poetryeditor.com'; // Change this to your verified site

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  queries: args.includes('--queries'),
  pages: args.includes('--pages'),
  devices: args.includes('--devices'),
  countries: args.includes('--countries'),
  days: parseInt(args.find((a, i) => args[i - 1] === '--days') || '28'),
  limit: parseInt(args.find((a, i) => args[i - 1] === '--limit') || '25'),
  help: args.includes('--help') || args.includes('-h'),
};

if (flags.help) {
  console.log(`
Google Search Console CLI for Poetry Editor

Usage:
  npm run stats              Overview stats for last 28 days
  npm run queries            Top search queries
  npm run pages              Top pages by clicks

Options:
  --days <n>                 Number of days to analyze (default: 28)
  --limit <n>                Number of results to show (default: 25)
  --queries                  Show top search queries
  --pages                    Show top pages
  --devices                  Show breakdown by device
  --countries                Show breakdown by country
  --help, -h                 Show this help

Examples:
  node index.js --days 7 --queries --limit 50
  node index.js --pages --devices
`);
  process.exit(0);
}

// Check authentication
if (!existsSync(TOKEN_PATH)) {
  console.error('\n❌ Not authenticated! Run "npm run auth" first.\n');
  process.exit(1);
}

if (!existsSync(CREDENTIALS_PATH)) {
  console.error('\n❌ Missing credentials.json! See README for setup instructions.\n');
  process.exit(1);
}

// Load credentials and token
const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
const { client_id, client_secret } = credentials.installed || credentials.web;

const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
oauth2Client.setCredentials(token);

const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

// Date helpers
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDateRange(days) {
  const end = new Date();
  end.setDate(end.getDate() - 3); // GSC data has ~3 day delay
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

// Formatting helpers
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatPercent(num) {
  return (num * 100).toFixed(1) + '%';
}

function formatPosition(num) {
  return num.toFixed(1);
}

function truncate(str, len) {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + '...';
}

// Fetch overview stats
async function fetchOverview() {
  const { startDate, endDate } = getDateRange(flags.days);

  console.log(`\n📊 Search Console Overview (${startDate} to ${endDate})\n`);
  console.log('Site:', SITE_URL);
  console.log('─'.repeat(60));

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: [],
      },
    });

    const data = response.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

    console.log(`
  Total Clicks:       ${formatNumber(data.clicks)}
  Total Impressions:  ${formatNumber(data.impressions)}
  Average CTR:        ${formatPercent(data.ctr)}
  Average Position:   ${formatPosition(data.position)}
`);
  } catch (error) {
    handleError(error);
  }
}

// Fetch top queries
async function fetchQueries() {
  const { startDate, endDate } = getDateRange(flags.days);

  console.log(`\n🔍 Top Search Queries (${startDate} to ${endDate})\n`);
  console.log('─'.repeat(80));

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: flags.limit,
      },
    });

    const rows = response.data.rows || [];

    if (rows.length === 0) {
      console.log('No query data available for this period.');
      return;
    }

    // Header
    console.log(
      'Query'.padEnd(40) +
        'Clicks'.padStart(10) +
        'Impr'.padStart(10) +
        'CTR'.padStart(10) +
        'Pos'.padStart(8)
    );
    console.log('─'.repeat(80));

    for (const row of rows) {
      const query = truncate(row.keys[0], 38);
      console.log(
        query.padEnd(40) +
          formatNumber(row.clicks).padStart(10) +
          formatNumber(row.impressions).padStart(10) +
          formatPercent(row.ctr).padStart(10) +
          formatPosition(row.position).padStart(8)
      );
    }

    console.log('─'.repeat(80));
    console.log(`Showing top ${rows.length} queries\n`);
  } catch (error) {
    handleError(error);
  }
}

// Fetch top pages
async function fetchPages() {
  const { startDate, endDate } = getDateRange(flags.days);

  console.log(`\n📄 Top Pages (${startDate} to ${endDate})\n`);
  console.log('─'.repeat(90));

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: flags.limit,
      },
    });

    const rows = response.data.rows || [];

    if (rows.length === 0) {
      console.log('No page data available for this period.');
      return;
    }

    // Header
    console.log(
      'Page'.padEnd(50) +
        'Clicks'.padStart(10) +
        'Impr'.padStart(10) +
        'CTR'.padStart(10) +
        'Pos'.padStart(8)
    );
    console.log('─'.repeat(90));

    for (const row of rows) {
      // Remove site URL prefix for cleaner display
      let page = row.keys[0].replace(SITE_URL, '') || '/';
      page = truncate(page, 48);
      console.log(
        page.padEnd(50) +
          formatNumber(row.clicks).padStart(10) +
          formatNumber(row.impressions).padStart(10) +
          formatPercent(row.ctr).padStart(10) +
          formatPosition(row.position).padStart(8)
      );
    }

    console.log('─'.repeat(90));
    console.log(`Showing top ${rows.length} pages\n`);
  } catch (error) {
    handleError(error);
  }
}

// Fetch device breakdown
async function fetchDevices() {
  const { startDate, endDate } = getDateRange(flags.days);

  console.log(`\n📱 Device Breakdown (${startDate} to ${endDate})\n`);
  console.log('─'.repeat(60));

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['device'],
      },
    });

    const rows = response.data.rows || [];

    if (rows.length === 0) {
      console.log('No device data available for this period.');
      return;
    }

    console.log(
      'Device'.padEnd(15) +
        'Clicks'.padStart(12) +
        'Impr'.padStart(12) +
        'CTR'.padStart(10) +
        'Pos'.padStart(8)
    );
    console.log('─'.repeat(60));

    for (const row of rows) {
      const device = row.keys[0].charAt(0).toUpperCase() + row.keys[0].slice(1);
      console.log(
        device.padEnd(15) +
          formatNumber(row.clicks).padStart(12) +
          formatNumber(row.impressions).padStart(12) +
          formatPercent(row.ctr).padStart(10) +
          formatPosition(row.position).padStart(8)
      );
    }
    console.log();
  } catch (error) {
    handleError(error);
  }
}

// Fetch country breakdown
async function fetchCountries() {
  const { startDate, endDate } = getDateRange(flags.days);

  console.log(`\n🌍 Top Countries (${startDate} to ${endDate})\n`);
  console.log('─'.repeat(60));

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['country'],
        rowLimit: 15,
      },
    });

    const rows = response.data.rows || [];

    if (rows.length === 0) {
      console.log('No country data available for this period.');
      return;
    }

    console.log(
      'Country'.padEnd(20) +
        'Clicks'.padStart(10) +
        'Impr'.padStart(12) +
        'CTR'.padStart(10) +
        'Pos'.padStart(8)
    );
    console.log('─'.repeat(60));

    for (const row of rows) {
      console.log(
        row.keys[0].padEnd(20) +
          formatNumber(row.clicks).padStart(10) +
          formatNumber(row.impressions).padStart(12) +
          formatPercent(row.ctr).padStart(10) +
          formatPosition(row.position).padStart(8)
      );
    }
    console.log();
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  if (error.code === 403) {
    console.error('\n❌ Access denied. Make sure you have verified ownership of', SITE_URL);
    console.error('   in Google Search Console: https://search.google.com/search-console\n');
  } else if (error.code === 401) {
    console.error('\n❌ Authentication expired. Run "npm run auth" to re-authenticate.\n');
  } else {
    console.error('\n❌ Error:', error.message);
    if (error.errors) {
      error.errors.forEach((e) => console.error('  -', e.message));
    }
    console.log();
  }
}

// Main
async function main() {
  // Always show overview
  await fetchOverview();

  // Show requested breakdowns
  if (flags.queries) await fetchQueries();
  if (flags.pages) await fetchPages();
  if (flags.devices) await fetchDevices();
  if (flags.countries) await fetchCountries();

  // If no specific flags, show queries by default
  if (!flags.queries && !flags.pages && !flags.devices && !flags.countries) {
    await fetchQueries();
  }
}

main().catch(console.error);
