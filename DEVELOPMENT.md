# Development Guide

This guide will help you set up the development environment, understand the codebase, and extend the Poetry Editor with new features.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
  - Alternative: yarn or pnpm

Check versions:
```bash
node --version
npm --version
```

### Initial Setup

1. **Clone or download the project**
```bash
cd poetry-editor
```

2. **Install dependencies**
```bash
npm install
```

This will install:
- React & React DOM
- TypeScript
- Vite
- Monaco Editor
- ESLint and related plugins

3. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

4. **Build for production**
```bash
npm run build
```

Output will be in the `dist/` directory.

5. **Preview production build**
```bash
npm run preview
```

## Development Workflow

### Hot Module Replacement (HMR)

Vite provides instant HMR. When you save a file:
1. Changes reflect immediately in the browser
2. React state is preserved (Fast Refresh)
3. No full page reload needed

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Code Style

- **Formatting**: Use ESLint configuration provided
- **TypeScript**: Strict mode enabled
- **Component naming**: PascalCase for components
- **File naming**: PascalCase for components, camelCase for utilities

## Project Structure Deep Dive

```
poetry-editor/
├── src/
│   ├── components/          # React components
│   │   ├── PoetryEditor.tsx
│   │   ├── AnalysisPanel.tsx
│   │   └── AnalysisPanel.css
│   ├── hooks/               # Custom React hooks
│   │   └── useLocalStorage.ts
│   ├── utils/               # Pure utility functions
│   │   ├── syllableCounter.ts
│   │   ├── nlpProcessor.ts
│   │   └── meterDetector.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── App.css              # Main app styles
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
│   └── vite.svg
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── README.md                # Main documentation
```

## Adding New Features

### Example: Adding Rhyme Detection

Let's walk through adding a new feature to detect rhyming patterns.

#### Step 1: Create the Utility

Create `src/utils/rhymeDetector.ts`:

```typescript
/**
 * Get the last syllable of a word (simple phonetic ending)
 */
function getEnding(word: string): string {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  // Simple: last 2-3 characters as phonetic approximation
  return cleaned.slice(-3);
}

/**
 * Detect rhyme scheme (ABAB, AABB, etc.)
 */
export function detectRhymeScheme(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length < 2) return 'N/A';

  const lastWords = lines.map(line => {
    const words = line.trim().split(/\s+/);
    return words[words.length - 1] || '';
  });

  const endings = lastWords.map(getEnding);
  const scheme: string[] = [];
  const seenEndings: Map<string, string> = new Map();
  let currentLetter = 'A';

  endings.forEach(ending => {
    if (seenEndings.has(ending)) {
      scheme.push(seenEndings.get(ending)!);
    } else {
      seenEndings.set(ending, currentLetter);
      scheme.push(currentLetter);
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
  });

  return scheme.join('');
}
```

#### Step 2: Add Type Definition

Update `src/types/index.ts`:

```typescript
export interface PoetryAnalysis {
  syllableCount: number[];
  totalWords: number;
  posDistribution: Record<string, number>;
  detectedMeter: string;
  rhymeScheme: string; // Add this line
}
```

#### Step 3: Use in Analysis Panel

Update `src/components/AnalysisPanel.tsx`:

```typescript
import { detectRhymeScheme } from '../utils/rhymeDetector';

// In the analysis useMemo:
const analysis = useMemo(() => {
  // ... existing code ...
  const rhymeScheme = detectRhymeScheme(text);

  return {
    // ... existing fields ...
    rhymeScheme,
  };
}, [text, words]);

// Add UI in the render:
<div className="analysis-section">
  <h3>Rhyme Scheme</h3>
  <div className="rhyme-info">
    <div className="rhyme-pattern">{analysis.rhymeScheme}</div>
  </div>
</div>
```

#### Step 4: Add Styling

Update `src/components/AnalysisPanel.css`:

```css
.rhyme-info {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.rhyme-pattern {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  letter-spacing: 4px;
  font-family: monospace;
}
```

#### Step 5: Test

1. Save all files
2. HMR will refresh the browser
3. Type a poem with rhyming endings
4. Check the new rhyme scheme section

### Example: Adding Dark Mode

#### Step 1: Create Theme Context

Create `src/contexts/ThemeContext.tsx`:

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

#### Step 2: Update App

Update `src/App.tsx`:

```typescript
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  // ... rest of component

  return (
    <div className="app">
      <header className="app-header">
        {/* ... */}
        <button onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      {/* ... */}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

#### Step 3: Add Dark Mode Styles

Update `src/App.css`:

```css
.app-dark {
  --bg-primary: #1e1e1e;
  --bg-secondary: #2d2d2d;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
}

.app-dark .app-header {
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
}

.app-dark .analysis-panel {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}
```

## Debugging

### Browser DevTools

1. **React DevTools**: Install browser extension
   - Inspect component tree
   - View props and state
   - Profile performance

2. **Console Logging**:
```typescript
console.log('Analysis result:', analysis);
console.table(words); // Nice table format
```

3. **Breakpoints**: Use browser debugger
   - Set breakpoints in Sources tab
   - Step through code execution
   - Inspect variables

### Common Issues

**Issue**: Monaco not loading
- **Solution**: Check browser console for errors, ensure Monaco dependencies installed

**Issue**: Highlighting not updating
- **Solution**: Check debounce timing, verify analyzeText is being called

**Issue**: localStorage not persisting
- **Solution**: Check browser settings, verify localStorage quota not exceeded

## Testing

### Manual Testing Checklist

Before committing changes:

- [ ] Type in editor, verify no console errors
- [ ] Test with empty text
- [ ] Test with very long poems (100+ lines)
- [ ] Test with special characters and emojis
- [ ] Verify auto-save works
- [ ] Test export functionality
- [ ] Check responsive layout (resize browser)
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Unit Testing (Future)

To add unit tests, install Jest:

```bash
npm install --save-dev jest @types/jest ts-jest
```

Example test for syllableCounter:

```typescript
// syllableCounter.test.ts
import { countSyllables } from './syllableCounter';

describe('countSyllables', () => {
  test('counts single syllable words', () => {
    expect(countSyllables('cat')).toBe(1);
    expect(countSyllables('dog')).toBe(1);
  });

  test('counts multi-syllable words', () => {
    expect(countSyllables('poetry')).toBe(3);
    expect(countSyllables('beautiful')).toBe(3);
  });

  test('handles edge cases', () => {
    expect(countSyllables('')).toBe(0);
    expect(countSyllables('fire')).toBe(1);
  });
});
```

## Performance Optimization

### Profiling

1. **React DevTools Profiler**:
   - Record component renders
   - Identify unnecessary re-renders
   - Optimize with React.memo, useMemo, useCallback

2. **Chrome Performance Tab**:
   - Record user interactions
   - Look for long tasks
   - Identify bottlenecks

### Optimization Techniques

**1. Memoization**:
```typescript
const expensiveComputation = useMemo(() => {
  return analyzeText(text);
}, [text]);
```

**2. Debouncing**:
```typescript
const debouncedHandler = useMemo(
  () => debounce(handleChange, 300),
  []
);
```

**3. Code Splitting**:
```typescript
const AnalysisPanel = lazy(() => import('./components/AnalysisPanel'));
```

## Building for Production

### Optimized Build

```bash
npm run build
```

This will:
1. Compile TypeScript to JavaScript
2. Bundle and minify code
3. Optimize assets
4. Generate source maps
5. Output to `dist/` directory

### Deployment Options

**1. Static Hosting (Netlify, Vercel)**:
- Drag and drop `dist/` folder
- Or connect Git repository for automatic deploys

**2. GitHub Pages**:
```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/poetry-editor",
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Deploy:
```bash
npm run deploy
```

**3. Docker**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Contributing Guidelines

### Code Standards

1. **TypeScript**: Use strict typing, avoid `any`
2. **Comments**: Document complex logic
3. **Naming**: Be descriptive and consistent
4. **File organization**: Keep related code together

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/rhyme-detection`
3. Make changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a pull request with description

### Commit Message Format

```
type(scope): short description

Longer description if needed

Fixes #issue-number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Resources

### Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Can I Use](https://caniuse.com/) - Browser compatibility

### Learning Resources
- [NLP Fundamentals](https://web.stanford.edu/~jurafsky/slp3/)
- [Poetry Meter Patterns](https://www.poetryfoundation.org/learn/glossary-terms/meter)
- [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)

## Support

For questions or issues:
1. Check existing documentation
2. Search GitHub issues
3. Open a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if relevant

Happy coding! 🚀
