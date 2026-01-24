# Google Search Console CLI

A local CLI tool to fetch search performance data for Poetry Editor from Google Search Console.

## Setup (One-time)

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable the **Search Console API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Search Console API"
   - Click "Enable"

### 2. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: "Poetry Editor Analytics" (or anything)
   - Add your email as a test user
4. Create OAuth client ID:
   - Application type: **Desktop app**
   - Name: "Search Console CLI"
5. Download the JSON file
6. Save it as `credentials.json` in this folder

### 3. Verify Site Ownership

Make sure `poetryeditor.com` is verified in [Google Search Console](https://search.google.com/search-console).

### 4. Install Dependencies

```bash
cd tools/search-console
npm install
```

### 5. Authenticate

```bash
npm run auth
```

This opens your browser for Google sign-in. After authorizing, a `token.json` file is saved locally.

## Usage

```bash
# Overview stats + top queries (last 28 days)
npm run stats

# Top search queries
npm run queries

# Top pages by clicks
npm run pages

# Custom options
node index.js --days 7 --queries --limit 50
node index.js --pages --devices --countries
```

### Options

| Option | Description |
|--------|-------------|
| `--days <n>` | Number of days to analyze (default: 28) |
| `--limit <n>` | Number of results to show (default: 25) |
| `--queries` | Show top search queries |
| `--pages` | Show top pages |
| `--devices` | Show breakdown by device type |
| `--countries` | Show breakdown by country |

## Example Output

```
📊 Search Console Overview (2024-01-01 to 2024-01-28)

Site: https://poetryeditor.com
────────────────────────────────────────────────────────────

  Total Clicks:       1,234
  Total Impressions:  45.6K
  Average CTR:        2.7%
  Average Position:   15.3

🔍 Top Search Queries (2024-01-01 to 2024-01-28)

────────────────────────────────────────────────────────────────────────────────
Query                                      Clicks      Impr       CTR     Pos
────────────────────────────────────────────────────────────────────────────────
syllable counter                              234     5,432      4.3%    12.1
poetry analyzer                               156     3,210      4.9%     8.7
rhyme scheme detector                          89     2,100      4.2%    14.3
...
```

## Files

- `credentials.json` - OAuth client credentials (from Google Cloud Console)
- `token.json` - Your access token (auto-generated after auth)
- `auth.js` - Authentication script
- `index.js` - Main CLI script

## Security Notes

- **Never commit** `credentials.json` or `token.json` to git
- These files are already in `.gitignore`
- Tokens are stored locally on your machine only
