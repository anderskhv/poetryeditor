# Changelog

All notable changes to the Poetry Editor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-14

### Added
- **Initial release of Poetry Editor**

#### Core Features
- Monaco Editor integration for professional text editing experience
- Real-time parts-of-speech syntax highlighting with custom color palette
  - Nouns: Sage green (#8a9a7b)
  - Verbs: Mauve (#b4a0c1)
  - Adjectives: Dusty rose (#d4a5a5)
  - Adverbs: Amber (#e6b566)
- Custom poetry language definition for Monaco
- Debounced text analysis (300ms) for optimal performance

#### NLP & Analysis
- Custom POS tagging engine with 500+ word dictionary
- Hybrid syllable counter with dictionary + algorithmic fallback
- Automatic meter detection supporting:
  - Iambic Pentameter, Tetrameter, Trimeter
  - Trochaic Tetrameter and Trimeter
  - Anapestic patterns
  - Dactylic patterns
  - Haiku (5-7-5) special detection
  - Free verse identification
- Syllable count visualization per line
- POS distribution analysis with percentage breakdowns
- Meter consistency metrics (variance calculation)

#### User Interface
- Split-pane layout with editor and analysis panel
- Responsive design for desktop and tablet
- Clean, minimal aesthetic
- Visual statistics with colored bars and charts
- Auto-save indicator with time-since-saved display
- Color legend for POS highlighting
- Export to .txt functionality
- New poem functionality with confirmation

#### Data Persistence
- Auto-save to localStorage (debounced 800ms)
- Persistent across browser sessions
- Sample Shakespeare sonnet on first load
- No backend required - fully client-side

#### Documentation
- Comprehensive README with feature overview
- Detailed ARCHITECTURE.md explaining technical implementation
- DEVELOPMENT.md guide for contributors
- EXAMPLES.md with sample poems demonstrating all features
- In-code comments and JSDoc annotations

#### Developer Experience
- Full TypeScript support with strict mode
- ESLint configuration
- Vite for fast builds and HMR
- Organized project structure
- Custom React hooks for localStorage
- Modular utility functions

### Technical Stack
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.8
- Monaco Editor (via @monaco-editor/react 4.6.0)
- Custom NLP processing (no external NLP dependencies)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## Future Roadmap

### Planned for v1.1.0
- [ ] Rhyme scheme detection
- [ ] Alliteration highlighting
- [ ] Dark mode support
- [ ] Multiple poem management
- [ ] Improved syllable dictionary

### Planned for v2.0.0
- [ ] Cloud sync (optional)
- [ ] User accounts
- [ ] Poem library/collections
- [ ] Export to PDF with formatting
- [ ] Collaborative editing
- [ ] Advanced stress pattern detection
- [ ] Multi-language support

---

## Version History

### [1.0.0] - 2026-01-14
Initial release with core poetry editing and analysis features.

---

## How to Upgrade

Since this is the initial release, no upgrade steps are needed. For future versions, upgrade instructions will be provided here.

## Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for information on contributing to this project.

## License

MIT License - See LICENSE file for details
