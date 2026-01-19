# Poetry Editor - Quick Reference Card

## 🚀 Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Key Files

```
src/
├── App.tsx                    # Main app component
├── components/
│   ├── PoetryEditor.tsx       # Monaco editor with highlighting
│   └── AnalysisPanel.tsx      # Analysis sidebar
├── utils/
│   ├── syllableCounter.ts     # Syllable counting
│   ├── nlpProcessor.ts        # POS tagging
│   └── meterDetector.ts       # Meter detection
└── hooks/
    └── useLocalStorage.ts     # Auto-save functionality
```

## 🎨 Color Scheme

| POS | Color | Hex |
|-----|-------|-----|
| Nouns | Sage | #8a9a7b |
| Verbs | Mauve | #b4a0c1 |
| Adjectives | Dusty Rose | #d4a5a5 |
| Adverbs | Amber | #e6b566 |

## 📊 Features at a Glance

### Editor
- Real-time POS highlighting
- Monaco Editor (VS Code engine)
- Line numbers, word wrap
- Auto-save every 800ms

### Analysis
- Syllable count per line
- Word count & line count
- POS distribution
- Meter detection (10+ patterns)
- Haiku detection

### Persistence
- localStorage auto-save
- Export to .txt
- New poem button
- Load on startup

## 📚 Documentation Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [START_HERE.md](START_HERE.md) | Welcome & overview | 5 min |
| [QUICKSTART.md](QUICKSTART.md) | Get started fast | 5 min |
| [README.md](README.md) | Full documentation | 15 min |
| [EXAMPLES.md](EXAMPLES.md) | Sample poems | 10 min |
| [FEATURES.md](FEATURES.md) | Complete feature list | 10 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical details | 20 min |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Extend the app | 15 min |

## 🎯 Quick Test

1. Start app: `npm run dev`
2. Type: "The beautiful sunset glows brightly"
3. Verify colors appear on words
4. Check analysis panel updates
5. Click Export → download works
6. Refresh → poem persists

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Won't start | Check Node.js 18+, run `npm install` |
| No highlighting | Wait 1s (debounce), check console |
| Not saving | Check localStorage enabled |
| Build fails | Run `npx tsc --noEmit` |

## 🔑 Keyboard Shortcuts

Monaco Editor (VS Code defaults):
- `Cmd/Ctrl + F` - Find
- `Cmd/Ctrl + H` - Replace
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + /` - Toggle comment
- `Alt + Click` - Multi-cursor

## 📦 Dependencies

**Production**:
- react: ^18.2.0
- react-dom: ^18.2.0
- @monaco-editor/react: ^4.6.0

**Development**:
- typescript: ^5.2.2
- vite: ^5.0.8
- eslint: ^8.55.0

## 🌐 Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+

## 📊 Meter Patterns Detected

- Iambic Pentameter (10 syllables)
- Iambic Tetrameter (8 syllables)
- Trochaic Tetrameter (8 syllables)
- Anapestic Tetrameter (12 syllables)
- Haiku (5-7-5)
- Free Verse (mixed)
- + more patterns

## 🎓 Project Stats

- **Files**: 33
- **Code**: ~1,500 lines
- **Docs**: ~2,600 lines
- **Features**: 80+
- **Status**: Production Ready ✅

## 📞 Get Help

1. Check [START_HERE.md](START_HERE.md)
2. Try [QUICKSTART.md](QUICKSTART.md)
3. Review [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)
4. Read error in console
5. Open GitHub issue

## ✅ Success Criteria

- [x] npm install works
- [x] npm run dev starts server
- [x] App loads in browser
- [x] Typing shows colors
- [x] Analysis updates
- [x] Auto-save works
- [x] Export works
- [x] Refresh persists

---

**Version**: 1.0.0
**Status**: Complete ✅
**License**: MIT

Quick Reference - Print or keep open while developing!
