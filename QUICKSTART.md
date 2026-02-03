# Quick Start Guide

Get up and running with Poetry Editor in less than 5 minutes!

## 🚀 Fast Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including React, TypeScript, Monaco Editor, and build tools.

**Time**: ~2-3 minutes

### Step 1.5: Configure Environment

Create a `.env` file (or update it) with your Supabase and public site URL settings:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PUBLIC_SITE_URL=https://poetryeditor.com
```

### Step 2: Start Development Server

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

**Time**: ~10 seconds

### Step 3: Start Writing!

The editor opens with a sample Shakespeare sonnet. You can:
- **Clear it** and start fresh
- **Modify it** to see real-time updates
- **Keep it** to explore the features

That's it! You're ready to write and analyze poetry.

## 🎨 What You'll See

### Left Side: Editor
- Professional text editor (same engine as VS Code)
- Words colored by parts of speech as you type
- Smooth, responsive typing experience

### Right Side: Analysis Panel
- **Overview**: Word count, line count, average syllables
- **Syllable Count**: Per-line syllable breakdown with visual bars
- **Meter Detection**: Automatic identification of poetic patterns
- **POS Distribution**: Breakdown of nouns, verbs, adjectives, adverbs
- **Color Legend**: Reference for the syntax highlighting

## 🎯 Try These Actions

### 1. See Real-Time Highlighting
Type any sentence and watch words get colored:
```
The beautiful sunset glows brightly tonight
```
- "beautiful" → dusty rose (adjective)
- "sunset" → sage green (noun)
- "glows" → mauve (verb)
- "brightly" → amber (adverb)

### 2. Test Meter Detection
Try a haiku (5-7-5 syllables):
```
An old silent pond
A frog jumps into the pond
Splash! Silence again
```
The analysis panel will show "Haiku Pattern Detected!" badge.

### 3. Explore Auto-Save
- Type anything
- Wait 1 second
- See "Auto-saved Xs ago" indicator
- Refresh browser → your poem is still there!

### 4. Export Your Work
Click the "Export" button in the header to download your poem as a .txt file.

### 5. Start Fresh
Click "New Poem" to clear the editor and begin a new piece.

## 📚 Sample Poems

See [EXAMPLES.md](EXAMPLES.md) for ready-to-paste sample poems demonstrating:
- Iambic pentameter (Shakespeare)
- Haiku patterns
- Free verse
- Different meter types
- POS-heavy examples (noun-rich, verb-rich, etc.)

## 🛠️ Build Commands

### Development
```bash
npm run dev        # Start dev server with HMR
```

### Production
```bash
npm run build      # Build for production (output to dist/)
npm run preview    # Preview production build locally
```

### Linting
```bash
npm run lint       # Check code quality with ESLint
```

## 🎓 Learning the Features

### 5-Minute Tutorial

**Minute 1**: Type a simple poem and watch the highlighting
```
Roses are red
Violets are blue
Sugar is sweet
And so are you
```

**Minute 2**: Look at the syllable counts (right panel)
- Line 1: 4 syllables
- Line 2: 4 syllables
- Line 3: 4 syllables
- Line 4: 4 syllables

**Minute 3**: Check the detected meter
- Should show "Regular meter (4 syllables per line)"

**Minute 4**: Examine POS distribution
- See the percentage breakdown
- Notice which colors appear most

**Minute 5**: Experiment!
- Change a word
- Add a line
- Watch everything update in real-time

## 💡 Pro Tips

1. **Consistent Syllables**: Try to keep similar syllable counts across lines for traditional meters
2. **Color Variety**: Mix different parts of speech for dynamic poetry
3. **Auto-Save**: Don't worry about losing work - it saves automatically
4. **Refresh Anytime**: Your poem persists across browser sessions
5. **Export Often**: Download important poems as backups

## 🐛 Troubleshooting

### Editor Not Loading?
- Check browser console (F12) for errors
- Ensure JavaScript is enabled
- Try a different browser (Chrome, Firefox, Safari)

### Highlighting Not Working?
- Wait a moment - it updates after you stop typing (300ms debounce)
- Very long words might not be classified perfectly
- Special characters are ignored in analysis

### Auto-Save Not Working?
- Check browser localStorage isn't disabled
- Check storage quota isn't exceeded
- Clear other site data if needed

### Slow Performance?
- Very long poems (1000+ lines) may slow down
- Consider breaking into smaller pieces
- Close other browser tabs if memory is low

## 📖 Next Steps

Once you're comfortable with the basics:

1. **Read the full [README.md](README.md)** for comprehensive feature documentation
2. **Explore [EXAMPLES.md](EXAMPLES.md)** for sample poems and patterns
3. **Check [ARCHITECTURE.md](ARCHITECTURE.md)** to understand how it works
4. **See [DEVELOPMENT.md](DEVELOPMENT.md)** if you want to extend the app

## 🎉 You're All Set!

Start writing poetry and let the editor help you analyze and refine your work. The real-time feedback makes it easy to experiment with different words, meters, and styles.

**Happy writing!** ✍️📝

---

### Need Help?

- **Features**: See [README.md](README.md)
- **Examples**: See [EXAMPLES.md](EXAMPLES.md)
- **Technical**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md)
- **Issues**: Open an issue on GitHub
