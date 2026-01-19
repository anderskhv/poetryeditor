# Poetry Editor - Technical Architecture

This document provides an in-depth look at the technical architecture and implementation details of the Poetry Editor application.

## System Overview

The Poetry Editor is a single-page application (SPA) built with React and TypeScript, featuring real-time natural language processing for poetry analysis. The application operates entirely client-side with no backend dependencies.

## Core Components

### 1. PoetryEditor Component (`src/components/PoetryEditor.tsx`)

**Purpose**: Provides the Monaco-based text editing interface with real-time POS syntax highlighting.

**Key Features**:
- Monaco Editor integration
- Custom language definition for poetry
- Real-time decoration system
- Debounced analysis updates (300ms)

**Flow**:
```
User Types → onChange Handler → Update State → Debounced Analysis
                                                      ↓
                                    Analyze Text (NLP) → Generate Decorations
                                                      ↓
                                    Apply Monaco Decorations → Inject CSS
```

**Technical Details**:
- Uses Monaco's `IModelDeltaDecoration` API for syntax highlighting
- Decorations are tracked via `decorationsRef` to enable updates
- CSS classes are dynamically injected for POS colors
- Custom theme definition with our color palette

### 2. AnalysisPanel Component (`src/components/AnalysisPanel.tsx`)

**Purpose**: Displays comprehensive poetry analysis in a sidebar.

**Key Features**:
- Real-time statistics computation
- Visual data representations (bars, charts)
- Auto-save status indicator
- Responsive grid layouts

**Data Flow**:
```
Text + Words Props → useMemo Hook → Compute Analysis
                                           ↓
    Syllable Counts, POS Distribution, Meter Detection
                                           ↓
                                    Render UI Components
```

**Performance Optimization**:
- `useMemo` prevents unnecessary recalculations
- Only recomputes when `text` or `words` change
- Efficient CSS for smooth scrolling

### 3. App Component (`src/App.tsx`)

**Purpose**: Main application orchestrator.

**Responsibilities**:
- State management for poem text
- Coordination between editor and analysis panel
- Auto-save integration via localStorage hook
- Export and new poem functionality

**State Management**:
```typescript
[text, setText, lastSaved] = useDebouncedLocalStorage('poetryContent', SAMPLE_POEM, 800);
[analyzedWords, setAnalyzedWords] = useState<WordInfo[]>([]);
```

## Utility Modules

### 1. Syllable Counter (`src/utils/syllableCounter.ts`)

**Algorithm**: Hybrid dictionary + rule-based approach

**Process**:
1. Clean and normalize word
2. Check built-in dictionary (150+ words)
3. If not found, apply algorithmic counting:
   - Count vowel groups (consecutive vowels = 1 syllable)
   - Subtract for silent 'e'
   - Adjust for special endings (-le, -es, -ed)
   - Ensure minimum of 1 syllable

**Dictionary Strategy**:
- Prioritizes common poetry words
- Includes irregular pronunciations (fire=1, flower=2)
- Covers prepositions, conjunctions, articles

**Accuracy**: ~90% for English words, higher for common poetry vocabulary

### 2. NLP Processor (`src/utils/nlpProcessor.ts`)

**POS Tagging Strategy**: Multi-tiered approach

**Tiers**:
1. **Dictionary Lookup** (500+ words)
   - COMMON_NOUNS: time, day, love, heart, soul...
   - COMMON_VERBS: be, have, do, sing, dance...
   - COMMON_ADJECTIVES: beautiful, dark, bright...
   - COMMON_ADVERBS: quickly, slowly, deeply...

2. **Suffix Patterns**
   - Adverbs: -ly
   - Adjectives: -ful, -less, -ous, -ive, -able
   - Verbs: -ate, -ify, -ize, -en
   - Nouns: -tion, -ness, -ment, -ity

3. **Verb Conjugation Detection**
   - Checks for -ing, -ed, -s endings
   - Looks up base form in verb dictionary

4. **Heuristics**
   - Capitalized words → Nouns (proper nouns)
   - Unknown → default to Noun

**Word Extraction**:
```typescript
line.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g)
```
- Handles contractions (don't, I'll)
- Filters non-alphabetic characters
- Preserves apostrophes within words

**Output Format**:
```typescript
interface WordInfo {
  word: string;
  pos: POSCategory;
  syllables: number;
  lineIndex: number;
  startOffset: number;
  endOffset: number;
}
```

### 3. Meter Detector (`src/utils/meterDetector.ts`)

**Detection Strategy**: Syllable pattern analysis

**Process**:
1. Count syllables per line
2. Filter empty lines
3. Calculate frequency distribution
4. Find most common syllable count
5. Measure consistency (% of lines matching)
6. Map count to known meter patterns

**Supported Meters**:
- Iambic: Pentameter (10), Tetrameter (8), Trimeter (6)
- Trochaic: Tetrameter (8), Trimeter (6)
- Anapestic: Tetrameter (12), Trimeter (9)
- Dactylic: Hexameter (17-18), Tetrameter (12)
- Special: Haiku (5-7-5), Fourteener (14)

**Consistency Metrics**:
- **High consistency**: >80% of lines match pattern
- **Variable**: 50-80% match
- **Free verse**: <50% match
- Variance calculation for numeric consistency

**Limitations**:
- Doesn't analyze stress patterns (stressed vs unstressed)
- Based solely on syllable count
- Best for traditional, regular meters

## Custom Hooks

### useLocalStorage (`src/hooks/useLocalStorage.ts`)

**Purpose**: Synchronize state with browser localStorage

**Features**:
- Automatic JSON serialization/deserialization
- Error handling for quota exceeded
- useState-like API

**Usage**:
```typescript
const [value, setValue] = useLocalStorage('key', initialValue);
```

### useDebouncedLocalStorage

**Purpose**: Auto-save with debouncing

**Features**:
- Debounced writes to prevent excessive saves
- Timestamp tracking for "last saved" indicator
- Configurable delay (default 500ms)

**Implementation**:
```typescript
useEffect(() => {
  const handler = setTimeout(() => {
    localStorage.setItem(key, JSON.stringify(value));
    setLastSaved(new Date());
  }, delay);
  return () => clearTimeout(handler);
}, [value, key, delay]);
```

## Data Flow

### Complete Analysis Pipeline

```
┌─────────────────┐
│  User Types     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Monaco onChange Event  │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Update Text State       │
│  (App Component)         │
└────────┬─────────────────┘
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Debounced Save     │    │  Debounced Analysis  │
│  (800ms)            │    │  (300ms)             │
└────────┬────────────┘    └──────────┬───────────┘
         │                             │
         ▼                             ▼
┌─────────────────┐         ┌────────────────────┐
│  localStorage   │         │  analyzeText()     │
└─────────────────┘         │  - Extract words   │
                            │  - POS tagging     │
                            │  - Syllable count  │
                            └──────────┬─────────┘
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │  Update Decorations  │
                            │  + Analysis State    │
                            └──────────┬───────────┘
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │  Re-render UI        │
                            │  - Colored text      │
                            │  - Analysis panel    │
                            └──────────────────────┘
```

## Performance Optimizations

### 1. Debouncing
- **Analysis**: 300ms delay prevents lag during rapid typing
- **Auto-save**: 800ms delay reduces localStorage writes

### 2. Memoization
- Analysis results memoized with `useMemo`
- Only recomputes when dependencies change
- Prevents unnecessary calculations on unrelated re-renders

### 3. Decoration Updates
- Decorations tracked via ref to enable delta updates
- Only changed decorations are updated
- CSS injection happens once, not per update

### 4. Word Extraction
- Single regex pass for word extraction
- No recursive or nested loops
- O(n) complexity for n words

### 5. CSS Performance
- Hardware-accelerated transitions
- Efficient selectors (single class names)
- Minimal repaints/reflows

## State Management Strategy

**Philosophy**: Simple, local state with hooks

**No Redux/Context needed because**:
- Single component tree
- No deeply nested prop drilling
- State is localized and simple
- LocalStorage handles persistence

**State Location**:
- **App**: `text`, `analyzedWords` (shared state)
- **PoetryEditor**: Editor instance refs (local)
- **AnalysisPanel**: Computed values via props (stateless)

## Storage Strategy

### localStorage Schema

```typescript
{
  "poetryContent": "string" // The poem text
}
```

**Capacity**: Typically 5-10MB per domain
**Limitations**: String-only (hence JSON serialization)
**Persistence**: Survives browser restarts, not across devices

### Why localStorage?
1. **Simplicity**: No backend, authentication, or network
2. **Speed**: Instant load, no latency
3. **Privacy**: Data never leaves user's browser
4. **Offline**: Works without internet
5. **Cost**: Free, no server infrastructure

### Alternatives Considered
- **SessionStorage**: Cleared on tab close (too ephemeral)
- **IndexedDB**: Overkill for simple text storage
- **Cloud storage**: Adds complexity, requires auth
- **File System API**: Limited browser support

## Styling Approach

### Strategy: Component-scoped CSS

**Why not CSS-in-JS or Tailwind?**
- Simpler dependency tree
- Better Monaco integration (needs global styles)
- Easier for contributors to modify
- Excellent performance

**File Organization**:
- `App.css`: Layout, header, footer
- `AnalysisPanel.css`: Analysis UI components
- `index.css`: Global resets and base styles
- Dynamic CSS: Injected for Monaco decorations

## Build & Bundle

### Vite Configuration

**Why Vite?**
- Blazing fast HMR (Hot Module Replacement)
- Modern ES modules
- Excellent TypeScript support
- Optimized production builds

**Build Output**:
- Minified JavaScript
- Code splitting (Monaco is large, loaded separately)
- Tree-shaking unused code
- Optimized CSS

### Bundle Size (Estimated)
- **Monaco Editor**: ~3-4MB (largest dependency)
- **React + ReactDOM**: ~150KB
- **Application code**: ~50KB
- **Total**: ~4MB (mostly Monaco)

**Optimization Opportunities**:
- Use Monaco loader for on-demand loading
- Implement virtual scrolling for long poems
- Lazy load analysis panel

## Testing Strategy

### Manual Testing Checklist
- [ ] Type in editor, verify highlighting
- [ ] Check syllable counts for known words
- [ ] Test meter detection with sample poems
- [ ] Verify auto-save and reload
- [ ] Test export functionality
- [ ] Responsive design on different screens
- [ ] Cross-browser compatibility

### Future Automated Testing
- Unit tests for syllableCounter
- Unit tests for nlpProcessor POS tagging
- Unit tests for meterDetector
- Integration tests for component interactions
- E2E tests for complete workflows

## Browser Support

### Minimum Requirements
- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+

### Required APIs
- localStorage
- ES2020 features (optional chaining, nullish coalescing)
- CSS Grid & Flexbox
- Fetch API (for potential future features)

### Monaco Editor Requirements
- Modern JavaScript engine
- Web Workers support
- TextDecoder/TextEncoder APIs

## Security Considerations

### Current Security Posture
- **No XSS risk**: React escapes by default
- **No CSRF**: No server, no forms
- **No injection**: No user input to database
- **Privacy**: Data never transmitted

### Potential Risks
- **localStorage hijacking**: Shared across same origin
- **Malicious poems**: Could contain harmful text, but not executed

### Recommendations
- Don't store sensitive information
- Be cautious of browser extensions accessing localStorage
- Consider encryption for privacy-sensitive poems

## Future Architecture Enhancements

### Scalability
1. **Backend API** (optional)
   - User accounts
   - Cloud sync
   - Poem library

2. **State Management**
   - Consider Zustand/Jotai if state grows complex
   - Context for theme/settings

3. **Advanced NLP**
   - WebAssembly for performance
   - ML-based POS tagging
   - Actual stress pattern analysis

4. **Collaboration**
   - WebSocket for real-time co-editing
   - Operational Transform for conflict resolution

### Maintainability
- Add unit tests
- Document all algorithms
- Version the localStorage schema
- Add migration system for schema changes

## Conclusion

The Poetry Editor is designed as a self-contained, performant, and extensible application. The architecture prioritizes simplicity, user experience, and offline functionality while maintaining professional code quality and organization.
