#!/usr/bin/env node
/**
 * Google Search Console OAuth Authentication
 *
 * Run this once to authenticate and save credentials:
 *   npm run auth
 *
 * Prerequisites:
 * 1. Create a Google Cloud project at https://console.cloud.google.com
 * 2. Enable the "Search Console API"
 * 3. Create OAuth 2.0 credentials (Desktop app)
 * 4. Download the credentials JSON and save as 'credentials.json' in this folder
 */

import { google } from 'googleapis';
import { createServer } from 'http';
import { URL } from 'url';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import open from 'open';

const CREDENTIALS_PATH = './credentials.json';
const TOKEN_PATH = './token.json';
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const REDIRECT_PORT = 3333;

async function authenticate() {
  // Check for credentials file
  if (!existsSync(CREDENTIALS_PATH)) {
    console.error('\n❌ Missing credentials.json file!\n');
    console.log('To set up authentication:');
    console.log('1. Go to https://console.cloud.google.com');
    console.log('2. Create a new project (or select existing)');
    console.log('3. Enable the "Search Console API"');
    console.log('4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"');
    console.log('5. Choose "Desktop app" as application type');
    console.log('6. Download the JSON and save it as "credentials.json" in this folder');
    console.log(`   Path: ${process.cwd()}/credentials.json\n`);
    process.exit(1);
  }

  // Load credentials
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    `http://localhost:${REDIRECT_PORT}/callback`
  );

  // Check if we already have a token
  if (existsSync(TOKEN_PATH)) {
    const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
    oauth2Client.setCredentials(token);

    // Check if token is expired
    if (token.expiry_date && token.expiry_date > Date.now()) {
      console.log('✅ Already authenticated! Token is still valid.');
      console.log('\nRun "npm run stats" to fetch search data.');
      return;
    }

    // Try to refresh the token
    try {
      const { credentials: newToken } = await oauth2Client.refreshAccessToken();
      writeFileSync(TOKEN_PATH, JSON.stringify(newToken, null, 2));
      console.log('✅ Token refreshed successfully!');
      console.log('\nRun "npm run stats" to fetch search data.');
      return;
    } catch (error) {
      console.log('Token expired, starting new authentication...\n');
    }
  }

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\n🔐 Opening browser for Google authentication...\n');

  // Create local server to receive callback
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');

      if (code) {
        try {
          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>✅ Authentication Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);

          console.log('✅ Authentication successful! Token saved to token.json');
          console.log('\nRun "npm run stats" to fetch search data.');

          server.close();
          process.exit(0);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Authentication failed: ' + error.message);
          console.error('❌ Authentication failed:', error.message);
          server.close();
          process.exit(1);
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No authorization code received');
      }
    }
  });

  server.listen(REDIRECT_PORT, () => {
    console.log(`Waiting for authentication callback on port ${REDIRECT_PORT}...`);
    open(authUrl);
  });
}

authenticate().catch(console.error);
