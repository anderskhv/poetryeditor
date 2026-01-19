#!/usr/bin/env npx tsx
/**
 * Comprehensive UI/UX Test Runner
 *
 * Runs all tests and generates detailed reports including:
 * - Automated Playwright tests
 * - Manual checklist items
 * - Improvement suggestions
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const REPORT_DIR = 'test-reports';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// ============================================================================
// MANUAL TESTING CHECKLIST
// ============================================================================

interface ChecklistItem {
  category: string;
  item: string;
  priority: 'high' | 'medium' | 'low';
  automated: boolean;
}

const MANUAL_CHECKLIST: ChecklistItem[] = [
  // Editor
  { category: 'Editor', item: 'Text can be typed and appears correctly', priority: 'high', automated: true },
  { category: 'Editor', item: 'Copy/paste works correctly', priority: 'high', automated: true },
  { category: 'Editor', item: 'Undo/redo works correctly', priority: 'high', automated: true },
  { category: 'Editor', item: 'Syntax highlighting applies to poetry', priority: 'medium', automated: false },
  { category: 'Editor', item: 'Line numbers are visible and accurate', priority: 'low', automated: false },
  { category: 'Editor', item: 'Cursor position is visible', priority: 'medium', automated: false },
  { category: 'Editor', item: 'Selection highlighting works', priority: 'medium', automated: false },
  { category: 'Editor', item: 'Scrolling is smooth for long poems', priority: 'medium', automated: false },
  { category: 'Editor', item: 'Word wrap behaves correctly', priority: 'medium', automated: false },
  { category: 'Editor', item: 'Find/replace works (Cmd+F)', priority: 'low', automated: false },

  // Auto-save
  { category: 'Auto-save', item: 'Content persists after page reload', priority: 'high', automated: true },
  { category: 'Auto-save', item: 'Save indicator shows status', priority: 'medium', automated: false },
  { category: 'Auto-save', item: 'Save happens within reasonable time', priority: 'medium', automated: false },
  { category: 'Auto-save', item: 'localStorage is used correctly', priority: 'low', automated: false },

  // Header controls
  { category: 'Header', item: 'New Poem button clears editor', priority: 'high', automated: true },
  { category: 'Header', item: 'New Poem shows confirmation if content exists', priority: 'medium', automated: false },
  { category: 'Header', item: 'Export button triggers download', priority: 'high', automated: true },
  { category: 'Header', item: 'Exported file has correct content', priority: 'medium', automated: false },
  { category: 'Header', item: 'Exported filename is descriptive', priority: 'low', automated: false },

  // Analysis Panel
  { category: 'Analysis Panel', item: 'Panel is visible by default', priority: 'high', automated: true },
  { category: 'Analysis Panel', item: 'All four tabs are present', priority: 'high', automated: true },
  { category: 'Analysis Panel', item: 'Tab switching works smoothly', priority: 'medium', automated: true },
  { category: 'Analysis Panel', item: 'Panel can be collapsed/expanded', priority: 'medium', automated: true },
  { category: 'Analysis Panel', item: 'Sections expand/collapse correctly', priority: 'medium', automated: false },
  { category: 'Analysis Panel', item: 'Only one section expanded at a time', priority: 'low', automated: false },
  { category: 'Analysis Panel', item: 'Scroll works within panel', priority: 'medium', automated: false },

  // Rhythm Tab
  { category: 'Rhythm', item: 'Syllable counts are displayed', priority: 'high', automated: true },
  { category: 'Rhythm', item: 'Syllable counts are accurate', priority: 'high', automated: false },
  { category: 'Rhythm', item: 'Scansion patterns shown', priority: 'medium', automated: true },
  { category: 'Rhythm', item: 'Meter type detected', priority: 'high', automated: true },
  { category: 'Rhythm', item: 'Line length consistency shown', priority: 'medium', automated: false },
  { category: 'Rhythm', item: 'Rhythm variation analysis present', priority: 'medium', automated: false },
  { category: 'Rhythm', item: 'Clicking section highlights editor', priority: 'medium', automated: false },

  // Rhymes Tab
  { category: 'Rhymes', item: 'Rhyme scheme detected', priority: 'high', automated: true },
  { category: 'Rhymes', item: 'Rhyme scheme uses standard notation', priority: 'medium', automated: false },
  { category: 'Rhymes', item: 'Rhyme quality assessment shown', priority: 'medium', automated: false },
  { category: 'Rhymes', item: 'Sound patterns detected', priority: 'medium', automated: false },
  { category: 'Rhymes', item: 'Alliteration highlighted', priority: 'low', automated: false },
  { category: 'Rhymes', item: 'Assonance detected', priority: 'low', automated: false },

  // Language Tab
  { category: 'Language', item: 'Word repetition shown', priority: 'medium', automated: false },
  { category: 'Language', item: 'Parts of speech distribution', priority: 'medium', automated: true },
  { category: 'Language', item: 'Adverb suggestions provided', priority: 'low', automated: true },
  { category: 'Language', item: 'Passive voice detected', priority: 'medium', automated: true },
  { category: 'Language', item: 'Tense consistency checked', priority: 'medium', automated: false },

  // Originality Tab
  { category: 'Originality', item: 'Rhyme originality score shown', priority: 'medium', automated: false },
  { category: 'Originality', item: 'Cliche detection works', priority: 'medium', automated: false },
  { category: 'Originality', item: 'Figurative language identified', priority: 'low', automated: false },
  { category: 'Originality', item: 'Form detection works', priority: 'high', automated: true },
  { category: 'Originality', item: 'Form selector dropdown present', priority: 'medium', automated: false },
  { category: 'Originality', item: 'Constraint evaluation shown', priority: 'low', automated: false },

  // Form Detection
  { category: 'Form Detection', item: 'Haiku detected correctly', priority: 'high', automated: true },
  { category: 'Form Detection', item: 'Sonnet detected correctly', priority: 'high', automated: true },
  { category: 'Form Detection', item: 'Limerick detected correctly', priority: 'medium', automated: false },
  { category: 'Form Detection', item: 'Free verse identified', priority: 'medium', automated: false },
  { category: 'Form Detection', item: 'Blank verse identified', priority: 'medium', automated: false },
  { category: 'Form Detection', item: 'Villanelle detected', priority: 'low', automated: false },

  // Word Popup
  { category: 'Word Popup', item: 'Popup appears on word click/select', priority: 'high', automated: false },
  { category: 'Word Popup', item: 'Rhymes tab shows rhymes', priority: 'medium', automated: false },
  { category: 'Word Popup', item: 'Synonyms tab shows synonyms', priority: 'medium', automated: false },
  { category: 'Word Popup', item: 'Syllables tab shows breakdown', priority: 'medium', automated: false },
  { category: 'Word Popup', item: 'Definition tab shows definition', priority: 'medium', automated: false },
  { category: 'Word Popup', item: 'Audio pronunciation plays', priority: 'low', automated: false },
  { category: 'Word Popup', item: 'Popup can be closed', priority: 'high', automated: false },
  { category: 'Word Popup', item: 'Popup position is correct', priority: 'medium', automated: false },

  // Accessibility
  { category: 'Accessibility', item: 'Keyboard navigation works', priority: 'high', automated: true },
  { category: 'Accessibility', item: 'Screen reader compatible', priority: 'medium', automated: false },
  { category: 'Accessibility', item: 'Sufficient color contrast', priority: 'medium', automated: true },
  { category: 'Accessibility', item: 'Focus indicators visible', priority: 'medium', automated: false },
  { category: 'Accessibility', item: 'ARIA labels present', priority: 'low', automated: false },

  // Responsive Design
  { category: 'Responsive', item: 'Works on mobile (375px)', priority: 'high', automated: true },
  { category: 'Responsive', item: 'Works on tablet (768px)', priority: 'high', automated: true },
  { category: 'Responsive', item: 'Works on desktop (1920px)', priority: 'high', automated: true },
  { category: 'Responsive', item: 'No horizontal scroll', priority: 'medium', automated: true },
  { category: 'Responsive', item: 'Touch interactions work', priority: 'medium', automated: false },

  // Performance
  { category: 'Performance', item: 'Page loads under 5 seconds', priority: 'high', automated: true },
  { category: 'Performance', item: 'Analysis completes quickly', priority: 'high', automated: true },
  { category: 'Performance', item: 'No UI freezes', priority: 'high', automated: true },
  { category: 'Performance', item: 'Smooth scrolling', priority: 'medium', automated: false },
  { category: 'Performance', item: 'No memory leaks', priority: 'medium', automated: true },

  // Edge Cases
  { category: 'Edge Cases', item: 'Empty input handled', priority: 'high', automated: true },
  { category: 'Edge Cases', item: 'Very long lines handled', priority: 'medium', automated: true },
  { category: 'Edge Cases', item: 'Special characters handled', priority: 'medium', automated: true },
  { category: 'Edge Cases', item: 'Unicode/accents handled', priority: 'medium', automated: true },
  { category: 'Edge Cases', item: 'Numbers handled', priority: 'low', automated: true },
  { category: 'Edge Cases', item: 'Mixed case handled', priority: 'low', automated: true },
  { category: 'Edge Cases', item: 'Heavy punctuation handled', priority: 'low', automated: true },
];

// ============================================================================
// UX IMPROVEMENT SUGGESTIONS
// ============================================================================

interface ImprovementSuggestion {
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

const IMPROVEMENT_SUGGESTIONS: ImprovementSuggestion[] = [
  {
    category: 'Onboarding',
    title: 'Add guided tour for new users',
    description: 'A step-by-step tour highlighting key features like tabs, form detection, and word popup would help new users discover functionality.',
    impact: 'high',
    effort: 'medium',
  },
  {
    category: 'Onboarding',
    title: 'Add example poems button',
    description: 'Quick-load example poems (haiku, sonnet, free verse) to demonstrate analysis features.',
    impact: 'medium',
    effort: 'low',
  },
  {
    category: 'Editor',
    title: 'Add line-by-line syllable count gutter',
    description: 'Show syllable counts in the editor margin like line numbers for quick reference.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Editor',
    title: 'Add stress pattern overlay toggle',
    description: 'Overlay / and u symbols directly on text to visualize scansion without leaving the editor.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Editor',
    title: 'Support markdown preview for section headers',
    description: 'Allow poets to use # headers for poem sections with preview mode.',
    impact: 'low',
    effort: 'medium',
  },
  {
    category: 'Analysis',
    title: 'Add comparative analysis',
    description: 'Compare current poem to famous poems of the same form to show similarities/differences.',
    impact: 'medium',
    effort: 'high',
  },
  {
    category: 'Analysis',
    title: 'Add reading time estimate',
    description: 'Show estimated reading time for the poem (useful for spoken word/performance poets).',
    impact: 'low',
    effort: 'low',
  },
  {
    category: 'Analysis',
    title: 'Add sentiment analysis',
    description: 'Show emotional tone analysis (positive/negative/neutral) per stanza.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Export',
    title: 'Add PDF export with analysis',
    description: 'Export poem with scansion marks and analysis as a formatted PDF.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Export',
    title: 'Add sharing functionality',
    description: 'Generate shareable link to poem (with privacy options).',
    impact: 'medium',
    effort: 'high',
  },
  {
    category: 'Form Detection',
    title: 'Show form requirements while writing',
    description: 'When a form is selected, show real-time constraint satisfaction (e.g., "Need 3 more syllables for haiku").',
    impact: 'high',
    effort: 'medium',
  },
  {
    category: 'Form Detection',
    title: 'Add form templates',
    description: 'Pre-fill editor with form structure (e.g., "___ (5 syllables)" for haiku).',
    impact: 'medium',
    effort: 'low',
  },
  {
    category: 'Rhymes',
    title: 'Add rhyme suggestions inline',
    description: 'When typing at end of line, suggest rhyming words for previous lines.',
    impact: 'high',
    effort: 'high',
  },
  {
    category: 'Rhymes',
    title: 'Visual rhyme scheme diagram',
    description: 'Draw connecting lines between rhyming line endings in a sidebar visualization.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Word Popup',
    title: 'Add "Replace with synonym" button',
    description: 'One-click replacement of selected word with chosen synonym.',
    impact: 'medium',
    effort: 'low',
  },
  {
    category: 'Word Popup',
    title: 'Show word frequency in English',
    description: 'Indicate if a word is common or rare to help with word choice.',
    impact: 'low',
    effort: 'low',
  },
  {
    category: 'Accessibility',
    title: 'Add dark mode',
    description: 'Dark theme option for reduced eye strain and preference.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Accessibility',
    title: 'Add font size controls',
    description: 'Allow users to increase/decrease editor font size.',
    impact: 'medium',
    effort: 'low',
  },
  {
    category: 'Accessibility',
    title: 'Add high contrast mode',
    description: 'Alternative color scheme for users with visual impairments.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Performance',
    title: 'Add analysis debounce indicator',
    description: 'Show when analysis is running vs. complete (loading spinner or status).',
    impact: 'medium',
    effort: 'low',
  },
  {
    category: 'Performance',
    title: 'Lazy load analysis tabs',
    description: 'Only run analysis for the active tab to improve performance.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'Collaboration',
    title: 'Add comments/annotations',
    description: 'Allow users to add comments to specific lines for workshop feedback.',
    impact: 'medium',
    effort: 'high',
  },
  {
    category: 'History',
    title: 'Add version history',
    description: 'Show previous versions of the poem with ability to restore.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    category: 'History',
    title: 'Add multiple poem support',
    description: 'Allow saving and switching between multiple poems.',
    impact: 'high',
    effort: 'medium',
  },
];

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function runTests() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE UI/UX TEST RUNNER');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  // Create report directory
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }
  mkdirSync(join(REPORT_DIR, 'screenshots'), { recursive: true });

  // Run Playwright tests
  console.log('\n[1/3] Running automated Playwright tests...\n');

  try {
    execSync('npx playwright test --config=e2e/playwright.config.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    console.log('Some tests failed (this is expected for issue discovery)');
  }

  // Load automated test results
  let automatedResults = { issues: [] };
  const issuesPath = join(REPORT_DIR, 'ui-ux-issues.json');
  if (existsSync(issuesPath)) {
    automatedResults = JSON.parse(readFileSync(issuesPath, 'utf-8'));
  }

  // Generate manual checklist
  console.log('\n[2/3] Generating manual testing checklist...\n');

  const checklistByCategory = MANUAL_CHECKLIST.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Generate improvement suggestions report
  console.log('[3/3] Compiling improvement suggestions...\n');

  const suggestionsByImpact = {
    high: IMPROVEMENT_SUGGESTIONS.filter(s => s.impact === 'high'),
    medium: IMPROVEMENT_SUGGESTIONS.filter(s => s.impact === 'medium'),
    low: IMPROVEMENT_SUGGESTIONS.filter(s => s.impact === 'low'),
  };

  // Generate comprehensive report
  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
    automatedTests: automatedResults,
    manualChecklist: {
      total: MANUAL_CHECKLIST.length,
      automated: MANUAL_CHECKLIST.filter(i => i.automated).length,
      manual: MANUAL_CHECKLIST.filter(i => !i.automated).length,
      byCategory: checklistByCategory,
    },
    improvementSuggestions: {
      total: IMPROVEMENT_SUGGESTIONS.length,
      byImpact: {
        high: suggestionsByImpact.high.length,
        medium: suggestionsByImpact.medium.length,
        low: suggestionsByImpact.low.length,
      },
      suggestions: IMPROVEMENT_SUGGESTIONS,
    },
  };

  // Write comprehensive report
  const reportPath = join(REPORT_DIR, `comprehensive-report-${TIMESTAMP}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate markdown summary
  const markdownReport = generateMarkdownReport(report);
  const mdPath = join(REPORT_DIR, `test-report-${TIMESTAMP}.md`);
  writeFileSync(mdPath, markdownReport);

  // Print summary
  console.log('='.repeat(80));
  console.log('TEST EXECUTION COMPLETE');
  console.log('='.repeat(80));
  console.log(`\nReports generated:`);
  console.log(`  - JSON: ${reportPath}`);
  console.log(`  - Markdown: ${mdPath}`);
  console.log(`  - HTML: ${join(REPORT_DIR, 'html/index.html')}`);
  console.log(`\nAutomated Issues Found: ${automatedResults.issues?.length || 0}`);
  console.log(`Manual Checklist Items: ${MANUAL_CHECKLIST.length}`);
  console.log(`Improvement Suggestions: ${IMPROVEMENT_SUGGESTIONS.length}`);
  console.log('\n' + '='.repeat(80));
}

function generateMarkdownReport(report: any): string {
  let md = `# Poetry Editor - Comprehensive UI/UX Test Report

Generated: ${report.metadata.generatedAt}

## Executive Summary

- **Automated Tests**: Ran comprehensive browser tests
- **Manual Checklist**: ${report.manualChecklist.total} items (${report.manualChecklist.automated} automated, ${report.manualChecklist.manual} manual)
- **Improvement Suggestions**: ${report.improvementSuggestions.total} ideas

---

## Automated Test Results

`;

  if (report.automatedTests.issues?.length > 0) {
    md += `### Issues Found (${report.automatedTests.issues.length})\n\n`;

    const issuesBySeverity = {
      critical: report.automatedTests.issues.filter((i: any) => i.severity === 'critical'),
      major: report.automatedTests.issues.filter((i: any) => i.severity === 'major'),
      minor: report.automatedTests.issues.filter((i: any) => i.severity === 'minor'),
    };

    if (issuesBySeverity.critical.length > 0) {
      md += `#### Critical Issues\n\n`;
      issuesBySeverity.critical.forEach((issue: any) => {
        md += `- **[${issue.category}] ${issue.title}**\n  ${issue.description}\n\n`;
      });
    }

    if (issuesBySeverity.major.length > 0) {
      md += `#### Major Issues\n\n`;
      issuesBySeverity.major.forEach((issue: any) => {
        md += `- **[${issue.category}] ${issue.title}**\n  ${issue.description}\n\n`;
      });
    }

    if (issuesBySeverity.minor.length > 0) {
      md += `#### Minor Issues\n\n`;
      issuesBySeverity.minor.forEach((issue: any) => {
        md += `- **[${issue.category}] ${issue.title}**\n  ${issue.description}\n\n`;
      });
    }
  } else {
    md += `No automated issues detected.\n\n`;
  }

  md += `---

## Manual Testing Checklist

Use this checklist for comprehensive manual testing.

`;

  for (const [category, items] of Object.entries(report.manualChecklist.byCategory)) {
    md += `### ${category}\n\n`;
    (items as ChecklistItem[]).forEach(item => {
      const status = item.automated ? '✓ Automated' : '☐ Manual';
      const priority = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
      md += `- [ ] ${priority} ${item.item} (${status})\n`;
    });
    md += '\n';
  }

  md += `---

## Improvement Suggestions

### High Impact (${report.improvementSuggestions.byImpact.high})

`;

  report.improvementSuggestions.suggestions
    .filter((s: ImprovementSuggestion) => s.impact === 'high')
    .forEach((s: ImprovementSuggestion) => {
      const effort = s.effort === 'high' ? '⬆️ High' : s.effort === 'medium' ? '➡️ Medium' : '⬇️ Low';
      md += `#### ${s.title}\n**Category:** ${s.category} | **Effort:** ${effort}\n\n${s.description}\n\n`;
    });

  md += `### Medium Impact (${report.improvementSuggestions.byImpact.medium})

`;

  report.improvementSuggestions.suggestions
    .filter((s: ImprovementSuggestion) => s.impact === 'medium')
    .forEach((s: ImprovementSuggestion) => {
      const effort = s.effort === 'high' ? '⬆️ High' : s.effort === 'medium' ? '➡️ Medium' : '⬇️ Low';
      md += `- **${s.title}** (${s.category}, Effort: ${effort})\n  ${s.description}\n\n`;
    });

  md += `### Low Impact (${report.improvementSuggestions.byImpact.low})

`;

  report.improvementSuggestions.suggestions
    .filter((s: ImprovementSuggestion) => s.impact === 'low')
    .forEach((s: ImprovementSuggestion) => {
      md += `- **${s.title}** (${s.category}): ${s.description}\n`;
    });

  md += `

---

## Test Poems Used

The automated tests use a comprehensive set of poems including:
- Haikus (5-7-5 syllable patterns)
- Shakespearean and Petrarchan sonnets
- Free verse poems
- Limericks
- Villanelles
- Blank verse
- Edge cases (empty, unicode, punctuation-heavy, etc.)
- Performance tests (up to 200 lines)

---

*Report generated by Poetry Editor UI/UX Test Suite*
`;

  return md;
}

// Run tests
runTests().catch(console.error);
