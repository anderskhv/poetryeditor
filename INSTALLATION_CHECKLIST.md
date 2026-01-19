# Installation Checklist

Use this checklist to verify your Poetry Editor installation is complete and working correctly.

## Pre-Installation Requirements

### System Requirements
- [ ] Node.js version 18 or higher installed
  ```bash
  node --version
  # Should show v18.0.0 or higher
  ```

- [ ] npm version 9 or higher installed
  ```bash
  npm --version
  # Should show 9.0.0 or higher
  ```

- [ ] Modern web browser installed
  - [ ] Chrome/Edge 90+, OR
  - [ ] Firefox 88+, OR
  - [ ] Safari 14+

### Disk Space
- [ ] At least 500MB free disk space for node_modules
- [ ] At least 100MB for source code and builds

## Installation Steps

### Step 1: Navigate to Project
```bash
cd /Users/andershvelplund/poetry-editor
```
- [ ] Confirmed in correct directory

### Step 2: Install Dependencies
```bash
npm install
```

Expected output should include:
- [ ] "added XXX packages" message
- [ ] No critical errors (warnings are OK)
- [ ] `node_modules/` folder created

### Step 3: Verify Installation
```bash
ls node_modules/
```
Should see directories including:
- [ ] `react/`
- [ ] `react-dom/`
- [ ] `@monaco-editor/`
- [ ] `vite/`
- [ ] `typescript/`

### Step 4: Start Development Server
```bash
npm run dev
```

Expected output:
- [ ] "VITE" banner appears
- [ ] "Local: http://localhost:3000" (or similar) shown
- [ ] "ready in XXXms" message
- [ ] No error messages

### Step 5: Open in Browser
- [ ] Navigate to `http://localhost:3000`
- [ ] Page loads successfully
- [ ] No console errors in browser DevTools (F12)

## Feature Verification

### Visual Checks
- [ ] Header displays "Poetry Editor" title
- [ ] Sample Shakespeare sonnet is pre-loaded in editor
- [ ] Analysis panel visible on right side
- [ ] "Auto-saved" indicator visible in analysis panel

### Editor Features
- [ ] Can click in editor and position cursor
- [ ] Can type text
- [ ] Line numbers appear on left
- [ ] Text wraps properly

### Syntax Highlighting
Type the following line and verify colors:
```
The beautiful sunset glows brightly tonight
```

- [ ] "beautiful" appears in dusty rose (adjective)
- [ ] "sunset" appears in sage green (noun)
- [ ] "glows" appears in mauve (verb)
- [ ] "brightly" appears in amber (adverb)

**Note**: Colors may take 1-2 seconds to appear due to debouncing.

### Analysis Panel
With the sample poem loaded, verify:
- [ ] "Total Words" count shown
- [ ] "Total Lines" count shown
- [ ] "Avg Syllables/Line" shown
- [ ] "Syllable Count by Line" section with bars
- [ ] "Detected Meter" section (should show "Iambic Pentameter")
- [ ] "Parts of Speech Distribution" with colored bars
- [ ] "Color Legend" at bottom

### Auto-Save
- [ ] Type something new in editor
- [ ] Wait 2 seconds
- [ ] "Auto-saved Xs ago" text updates
- [ ] Refresh browser (Cmd/Ctrl + R)
- [ ] Your text is still there

### Export Feature
- [ ] Click "Export" button in header
- [ ] File download dialog appears
- [ ] .txt file downloads with poem content
- [ ] File opens and contains correct text

### New Poem Feature
- [ ] Click "New Poem" button
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Editor clears

## Performance Checks

### Typing Performance
- [ ] Typing feels responsive (no lag)
- [ ] Cursor moves smoothly
- [ ] No stuttering when typing quickly

### Analysis Updates
- [ ] Analysis panel updates within 1 second of stopping typing
- [ ] No visible freezing or lag during analysis
- [ ] Browser doesn't show "unresponsive script" warnings

### Browser Console
Open DevTools (F12) and check Console tab:
- [ ] No red error messages
- [ ] Only expected messages (if any)
- [ ] No warnings about deprecated features

## Build Verification

### Production Build
```bash
npm run build
```

Expected:
- [ ] "vite v5.x.x building for production..." message
- [ ] Build completes successfully
- [ ] "✓ built in XXXXms" message
- [ ] `dist/` folder created

### Preview Production Build
```bash
npm run preview
```

Expected:
- [ ] Server starts on port 4173 (or similar)
- [ ] Navigate to URL shown
- [ ] App works same as development mode

### Build Output
Check `dist/` folder:
- [ ] `index.html` exists
- [ ] `assets/` folder exists with .js and .css files
- [ ] Files are minified (open one to verify)

## Linting Check

```bash
npm run lint
```

Expected:
- [ ] Completes without errors
- [ ] May show warnings (acceptable)
- [ ] No "error" level issues

## Troubleshooting

### If Dependencies Won't Install
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm cache clean --force`
3. Run `npm install` again

### If Monaco Editor Doesn't Load
1. Check browser console for errors
2. Verify `@monaco-editor/react` in `node_modules/`
3. Try hard refresh: Cmd/Ctrl + Shift + R

### If Highlighting Doesn't Work
1. Wait 2-3 seconds after typing (debounce delay)
2. Check browser console for errors
3. Verify `src/utils/nlpProcessor.ts` exists

### If Auto-Save Fails
1. Check browser localStorage isn't disabled
2. In DevTools, go to Application → Local Storage
3. Verify `poetryContent` key appears and updates

### If Build Fails
1. Ensure TypeScript compiles: `npx tsc --noEmit`
2. Check for missing types
3. Verify `tsconfig.json` exists

## File Structure Verification

Run this command to verify all files exist:
```bash
ls -la
```

Should see:
- [ ] `src/` directory
- [ ] `public/` directory
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `vite.config.ts`
- [ ] `index.html`
- [ ] `README.md`

Check src directory:
```bash
ls -la src/
```

Should see:
- [ ] `components/` directory
- [ ] `hooks/` directory
- [ ] `utils/` directory
- [ ] `types/` directory
- [ ] `App.tsx`
- [ ] `main.tsx`

## Final Verification

### The "5-Minute Test"
1. [ ] Start fresh terminal
2. [ ] Run `npm run dev`
3. [ ] Open browser to localhost
4. [ ] Type a haiku:
   ```
   An old silent pond
   A frog jumps into the pond
   Splash! Silence again
   ```
5. [ ] Verify "Haiku Pattern Detected!" badge appears
6. [ ] All syllable counts show 5-7-5
7. [ ] Words are colored correctly
8. [ ] Export works
9. [ ] Refresh preserves poem

If all above steps pass: ✅ **Installation Complete and Verified!**

## Next Steps

- [ ] Read QUICKSTART.md for a guided tour
- [ ] Try sample poems from EXAMPLES.md
- [ ] Explore analysis features
- [ ] Read full README.md for all features
- [ ] Start writing your own poetry!

## Getting Help

If any checks fail:
1. Review error messages carefully
2. Check DEVELOPMENT.md troubleshooting section
3. Verify Node.js and npm versions
4. Try on a different browser
5. Check browser console for specific errors
6. Open GitHub issue with details

## Checklist Summary

Total checks: ~80
Minimum required: ~60 (75%)

If you've completed at least 75% of checks successfully, you're ready to use Poetry Editor!

---

**Installation Date**: _____________
**Node Version**: _____________
**npm Version**: _____________
**Browser**: _____________
**Status**: [ ] Pass  [ ] Fail  [ ] Needs Review

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
