import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WordInfo } from '../types';
import { getSyllableCounts } from '../utils/syllableCounter';
import { getPOSDistribution } from '../utils/nlpProcessor';
import { detectMeter, isHaiku, analyzeMeterConsistency } from '../utils/meterDetector';
import { analyzeRepetition } from '../utils/wordAnalysis';
import { analyzeRhythmVariation, analyzeLineLengthConsistency, analyzePunctuationPatterns } from '../utils/rhythmAnalysis';
import { detectRhymeScheme, evaluateRhymeCompliance, assessRhymeQuality, detectInternalRhymes } from '../utils/rhymeScheme';
import { detectPoetricForm, evaluateFormFit } from '../utils/formDetector';
import { isConstrained, getConstraintDescription, evaluateConstraint, getFormConstraints } from '../utils/formConstraints';
import { getRhymeOriginalityScore, getRhymeOriginalityLabel } from '../utils/rhymeCliches';
import { detectPassiveVoice, groupPassiveByLine, type PassiveVoiceInstance } from '../utils/passiveVoiceDetector';
import { preloadAllSuggestions, detectDoubleAdverbs, type AdverbSuggestion } from '../utils/adverbSuggestions';
import { analyzeSoundPatterns } from '../utils/soundPatterns';
import { analyzeTense, type TenseInstance } from '../utils/tenseChecker';
import { analyzeScansion, getScansionInstances, type StressedSyllableInstance } from '../utils/scansionAnalyzer';
import { analyzeMetaphors } from '../utils/metaphorDetector';
import { analyzeCliches } from '../utils/phraseClicheDetector';
import { analyzeAbstractConcrete } from '../utils/abstractConcreteAnalyzer';
import { detectFirstDraftPhrases } from '../utils/firstDraftPhrases';
import { detectDeadMetaphors, getCategoryDisplayName } from '../utils/deadMetaphors';
import { HelpTooltip, HELP_CONTENT } from './HelpTooltip';
import './AnalysisPanel.css';

interface AnalysisPanelProps {
  text: string;
  words: WordInfo[];
  lastSaved: Date;
  onClose?: () => void;
  onHighlightPOS?: (pos: string | null) => void;
  onMeterExpand?: (data: {
    syllableCounts: number[];
    medianSyllableCount: number;
    violatingLines: number[];
    isFreeOrMixed: boolean;
  }) => void;
  onSyllableExpand?: (data: {
    syllableCounts: number[];
    medianSyllableCount: number;
  }) => void;
  onRhythmVariationExpand?: (data: {
    syllableCounts: number[];
  }) => void;
  onLineLengthExpand?: (data: {
    text: string;
    medianWords: number;
  }) => void;
  onPunctuationExpand?: (data: {
    enjambedLines: number[];
  }) => void;
  onSectionCollapse?: () => void;
  onHighlightLines?: (lineNumbers: number[] | null) => void;
  onHighlightWords?: (words: { word: string; lineNumber: number }[] | null) => void;
  onPassiveVoiceExpand?: (data: {
    passiveInstances: PassiveVoiceInstance[];
  }) => void;
  onTenseExpand?: (data: {
    tenseInstances: TenseInstance[];
  } | null) => void;
  onScansionExpand?: (data: {
    syllableInstances: StressedSyllableInstance[];
  } | null) => void;
  editorHoveredLine?: number | null;
}

type CategoryTab = 'rhythm' | 'rhymes' | 'style' | 'originality';
type ExpandedSection = 'syllables' | 'repetition' | 'pos' | 'adverbs' | 'passiveVoice' | 'rhythmVariation' | 'stanzaStructure' | 'lineLength' | 'punctuation' | 'rhymeScheme' | 'rhymeAnalysis' | 'poeticForm' | 'soundPatterns' | 'tenseConsistency' | 'scansion' | 'figurativeLanguage' | 'cliches' | 'abstractConcrete' | 'firstDraftPhrases' | null;

export function AnalysisPanel({ text, words, lastSaved, onClose, onHighlightPOS, onSyllableExpand, onRhythmVariationExpand, onLineLengthExpand, onPunctuationExpand, onSectionCollapse, onHighlightLines, onHighlightWords, onPassiveVoiceExpand, onTenseExpand, onScansionExpand, editorHoveredLine }: AnalysisPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('rhythm');
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [selectedForm, setSelectedForm] = useState<string | null>(null); // User-selected form (null = Auto-detect)
  const [adverbSuggestions, setAdverbSuggestions] = useState<Map<string, AdverbSuggestion>>(new Map());
  const [showAllSoundPatterns, setShowAllSoundPatterns] = useState<{alliteration: boolean, assonance: boolean, consonance: boolean}>({
    alliteration: false, assonance: false, consonance: false
  });

  // Preload adverb suggestions whenever words change
  useEffect(() => {
    async function loadSuggestions() {
      if (words.length > 0) {
        const suggestions = await preloadAllSuggestions(words);
        setAdverbSuggestions(suggestions);
      }
    }
    loadSuggestions();
  }, [words]);

  // Clear highlighting and coloring data when section or category changes
  useEffect(() => {
    // Clear any existing highlighting when the expanded section changes
    onHighlightLines?.(null);
    onHighlightWords?.(null);
    // Also clear any coloring modes (meter, syllable, etc.)
    onSectionCollapse?.();
  }, [expandedSection, activeCategory]);

  // Clear highlighting on unmount
  useEffect(() => {
    return () => {
      onHighlightLines?.(null);
      onHighlightWords?.(null);
    };
  }, [onHighlightLines, onHighlightWords]);

  // Wikipedia URLs for poetic forms
  const WIKIPEDIA_URLS: Record<string, string> = {
    'Free Verse': 'https://en.wikipedia.org/wiki/Free_verse',
    'Blank Verse': 'https://en.wikipedia.org/wiki/Blank_verse',
    'Shakespearean Sonnet': 'https://en.wikipedia.org/wiki/Sonnet#Shakespearean_sonnet',
    'Petrarchan Sonnet': 'https://en.wikipedia.org/wiki/Sonnet#Petrarchan_sonnet',
    'Spenserian Sonnet': 'https://en.wikipedia.org/wiki/Spenserian_stanza',
    'Haiku': 'https://en.wikipedia.org/wiki/Haiku',
    'Tanka': 'https://en.wikipedia.org/wiki/Tanka',
    'Cinquain': 'https://en.wikipedia.org/wiki/Cinquain',
    'Limerick': 'https://en.wikipedia.org/wiki/Limerick_(poetry)',
    'Villanelle': 'https://en.wikipedia.org/wiki/Villanelle',
    'Pantoum': 'https://en.wikipedia.org/wiki/Pantoum',
    'Ballad Stanza': 'https://en.wikipedia.org/wiki/Ballad#Ballad_stanza',
    'Terza Rima': 'https://en.wikipedia.org/wiki/Terza_rima',
    'Ottava Rima': 'https://en.wikipedia.org/wiki/Ottava_rima'
  };

  // Helper function to get constraint status icon
  const getConstraintIcon = (aspect: 'meter' | 'syllablePattern' | 'rhymeScheme', fitData: { fitScore?: number; fit?: 'high' | 'medium' | 'low' | 'none' }) => {
    const formToCheck = analysis.activeForm;
    if (!formToCheck || formToCheck === 'Free Verse') return null;
    if (!isConstrained(formToCheck, aspect)) return null;

    const poemData = {
      lineCount: 0, // Not used for these aspects
      fitScore: fitData.fitScore,
      fit: fitData.fit
    };

    const status = evaluateConstraint(formToCheck, aspect, poemData);
    if (status === 'none') return null;

    // Editorial indicators - dots show consistency, not pass/fail
    const icon = status === 'perfect' ? '●' : status === 'good' ? '◐' : '○';
    const color = 'var(--color-ink-base)';
    const description = getConstraintDescription(formToCheck, aspect);

    return (
      <span
        style={{
          marginLeft: '8px',
          fontSize: '15px',
          fontWeight: 'bold',
          color: color,
          cursor: 'help'
        }}
        title={description || ''}
      >
        {icon}
      </span>
    );
  };


  const analysis = useMemo(() => {
    const syllableCounts = getSyllableCounts(text);
    const posDistribution = getPOSDistribution(words);
    const detectedMeter = detectMeter(text);
    const meterConsistency = analyzeMeterConsistency(text);
    const isHaikuPoem = isHaiku(text);
    const repetitionResults = analyzeRepetition(words);
    const rhythmVariation = analyzeRhythmVariation(syllableCounts);
    const lineLengthConsistency = analyzeLineLengthConsistency(text);
    const punctuationPatterns = analyzePunctuationPatterns(text);
    const rhymeScheme = detectRhymeScheme(text);
    const internalRhymes = detectInternalRhymes(text);
    const poeticForm = detectPoetricForm(text);
    const passiveVoiceInstances = detectPassiveVoice(text);
    const passiveVoiceGrouped = groupPassiveByLine(passiveVoiceInstances);
    const doubleAdverbs = detectDoubleAdverbs(words);
    const soundPatterns = analyzeSoundPatterns(text);
    const tenseAnalysis = analyzeTense(text);
    const scansionAnalysis = analyzeScansion(text);
    const metaphorAnalysis = analyzeMetaphors(text);
    const clicheAnalysis = analyzeCliches(text);
    const abstractConcreteAnalysis = analyzeAbstractConcrete(text);
    const firstDraftAnalysis = detectFirstDraftPhrases(text);
    const deadMetaphorAnalysis = detectDeadMetaphors(text);

    // If user selected a form, evaluate fit for that specific form
    let manualFormFit: { fit: 'high' | 'medium' | 'low' | 'none'; fitScore?: number; issues?: string[] } | null = null;
    if (selectedForm) {
      // Evaluate how well the poem fits the manually selected form
      const evaluation = evaluateFormFit(text, selectedForm);
      manualFormFit = {
        fit: evaluation.fit,
        fitScore: evaluation.fitScore,
        issues: evaluation.issues
      };
    }

    // Use selected form or auto-detected form
    const activeForm = selectedForm || poeticForm.form;
    const expectedPattern = selectedForm ?
      // Get expected pattern for selected form
      (selectedForm === 'Shakespearean Sonnet' ? 'ABABCDCDEFEFGG' :
       selectedForm === 'Petrarchan Sonnet' ? 'ABBAABBACDECDE' :
       selectedForm === 'Spenserian Sonnet' ? 'ABABBCBCCDCDEE' :
       selectedForm === 'Limerick' ? 'AABBA' :
       selectedForm === 'Ballad Stanza' ? 'ABCB' :
       selectedForm === 'Terza Rima' ? 'ABABCBCDCDED' :
       '') :
      poeticForm.actualPattern || '';

    // Evaluate rhyme compliance if we have an expected pattern
    const rhymeCompliance = expectedPattern && activeForm !== 'Free Verse'
      ? evaluateRhymeCompliance(rhymeScheme.schemePattern, expectedPattern, rhymeScheme.rhymeQualities)
      : rhymeScheme.rhymeQualities;

    // Calculate median syllable count (not mode) for non-empty lines
    const nonEmptyLines = syllableCounts.filter(c => c > 0);
    const sortedCounts = [...nonEmptyLines].sort((a, b) => a - b);
    const medianCount = sortedCounts.length > 0
      ? sortedCounts.length % 2 === 0
        ? (sortedCounts[sortedCounts.length / 2 - 1] + sortedCounts[sortedCounts.length / 2]) / 2
        : sortedCounts[Math.floor(sortedCounts.length / 2)]
      : 0;

    // Only show violating lines if meter is NOT free verse or mixed
    const isFreeOrMixed = detectedMeter.toLowerCase().includes('free') ||
                          detectedMeter.toLowerCase().includes('mixed');

    const violatingLines: number[] = [];
    if (!isFreeOrMixed) {
      syllableCounts.forEach((count, index) => {
        if (count > 0 && count !== Math.round(medianCount)) {
          violatingLines.push(index + 1); // 1-indexed for display
        }
      });
    }

    // Calculate stanza count and detailed stanza analysis
    const lines = text.split('\n');
    let stanzaCount = 0;
    let inStanza = false;
    const stanzaDetails: { lineCount: number; wordCount: number; syllableCount: number; startLine: number }[] = [];
    let currentStanza = { lineCount: 0, wordCount: 0, syllableCount: 0, startLine: 0 };
    let lineIndex = 0;

    lines.forEach((line, idx) => {
      const isEmpty = line.trim().length === 0;
      if (!isEmpty && !inStanza) {
        stanzaCount++;
        inStanza = true;
        currentStanza = { lineCount: 0, wordCount: 0, syllableCount: 0, startLine: idx + 1 };
      }
      if (!isEmpty && inStanza) {
        currentStanza.lineCount++;
        currentStanza.wordCount += line.trim().split(/\s+/).filter(w => w.length > 0).length;
        if (syllableCounts[lineIndex] !== undefined) {
          currentStanza.syllableCount += syllableCounts[lineIndex];
        }
        lineIndex++;
      } else if (isEmpty) {
        if (inStanza && currentStanza.lineCount > 0) {
          stanzaDetails.push({ ...currentStanza });
        }
        inStanza = false;
      }
    });
    // Push last stanza if we ended mid-stanza
    if (inStanza && currentStanza.lineCount > 0) {
      stanzaDetails.push({ ...currentStanza });
    }

    return {
      syllableCounts,
      posDistribution,
      detectedMeter,
      meterConsistency,
      isHaikuPoem,
      totalWords: words.length,
      totalLines: text.split('\n').length,
      nonEmptyLines: syllableCounts.filter(c => c > 0).length,
      stanzaCount,
      stanzaDetails,
      medianSyllableCount: Math.round(medianCount),
      violatingLines,
      repetitionResults,
      isFreeOrMixed,
      rhythmVariation,
      lineLengthConsistency,
      punctuationPatterns,
      rhymeScheme,
      internalRhymes,
      poeticForm,
      activeForm,
      expectedPattern,
      rhymeCompliance,
      manualFormFit,
      passiveVoiceInstances,
      passiveVoiceGrouped,
      doubleAdverbs,
      soundPatterns,
      tenseAnalysis,
      scansionAnalysis,
      metaphorAnalysis,
      clicheAnalysis,
      abstractConcreteAnalysis,
      firstDraftAnalysis,
      deadMetaphorAnalysis,
    };
  }, [text, words, selectedForm]);

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return 'Last saved just now';
    if (seconds < 60) return `Last saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Last saved ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `Last saved ${hours}h ago`;
  };

  // Handle section expansion with exclusive expansion logic
  const toggleSection = (section: ExpandedSection) => {
    if (expandedSection === section) {
      // Collapse current section
      setExpandedSection(null);
      onSectionCollapse?.();
    } else {
      // Expand new section (automatically closes previous)
      setExpandedSection(section);

      // Trigger specific callbacks for sections with editor coloring
      if (section === 'syllables') {
        onSyllableExpand?.({
          syllableCounts: analysis.syllableCounts,
          medianSyllableCount: analysis.medianSyllableCount,
        });
      } else if (section === 'rhythmVariation') {
        onRhythmVariationExpand?.({
          syllableCounts: analysis.syllableCounts,
        });
      } else if (section === 'lineLength') {
        onLineLengthExpand?.({
          text: text,
          medianWords: analysis.lineLengthConsistency.medianWords,
        });
      } else if (section === 'punctuation') {
        onPunctuationExpand?.({
          enjambedLines: analysis.punctuationPatterns.enjambedLines,
        });
      } else if (section === 'passiveVoice') {
        onPassiveVoiceExpand?.({
          passiveInstances: analysis.passiveVoiceInstances,
        });
      } else {
        // Other sections (pos, repetition) collapse the coloring
        onSectionCollapse?.();
      }
    }
  };

  // Define section components

  const syllablesSection = (
    <div key="syllables" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('syllables')} className={`collapsible-header ${analysis.activeForm && isConstrained(analysis.activeForm, 'syllablePattern') ? 'constrained' : ''}`}>
        <span className={`collapse-icon ${expandedSection === 'syllables' ? 'expanded' : ''}`}>▶</span>
        Syllable Pattern
        <HelpTooltip {...HELP_CONTENT.syllableCount} />
        {getConstraintIcon('syllablePattern', { fitScore: analysis.manualFormFit?.fitScore || analysis.poeticForm.fitScore, fit: analysis.manualFormFit?.fit || analysis.poeticForm.fit })}
      </h3>
      {expandedSection === 'syllables' && (
        <div className="syllable-list">
          {analysis.syllableCounts.map((count, index) => {
            if (count === 0) {
              return (
                <div key={index} className="syllable-item">
                  <span className="line-number">Line {index + 1}:</span>
                  <span className="syllable-count stanza-break">Stanza break</span>
                </div>
              );
            }

            // Calculate color based on selected poetic form constraints
            let colorClass = '';

            // Check if this form has specific syllable pattern constraints
            const formToCheck = analysis.activeForm;
            if (formToCheck && isConstrained(formToCheck, 'syllablePattern')) {
              // Get expected syllable count for this line based on the form
              let expectedCount: number | null = null;

              if (formToCheck === 'Haiku') {
                const expectedPattern = [5, 7, 5];
                expectedCount = index < expectedPattern.length ? expectedPattern[index] : null;
              } else if (formToCheck.includes('Sonnet')) {
                // Sonnets typically use iambic pentameter (10 syllables)
                expectedCount = 10;
              } else if (formToCheck === 'Limerick') {
                // Limericks: lines 1,2,5 are longer (7-10), lines 3,4 are shorter (5-7)
                if (index === 0 || index === 1 || index === 4) {
                  expectedCount = count >= 7 && count <= 10 ? count : 8.5; // Use midpoint for comparison
                } else if (index === 2 || index === 3) {
                  expectedCount = count >= 5 && count <= 7 ? count : 6; // Use midpoint for comparison
                }
              }

              if (expectedCount !== null) {
                if (count === expectedCount) {
                  colorClass = 'syllable-perfect'; // Green - exact match
                } else if (Math.abs(count - expectedCount) === 1) {
                  colorClass = 'syllable-close'; // Yellow - off by 1
                } else {
                  colorClass = 'syllable-violation'; // Red - off by more than 1
                }
              } else {
                // No specific expectation, use perfect
                colorClass = 'syllable-perfect';
              }
            } else {
              // For free verse or forms without syllable constraints, don't apply any violation coloring
              // Free verse intentionally has no constraints, so no line should be marked as "wrong"
              colorClass = '';
            }

            return (
              <div
                key={index}
                className={`syllable-item ${colorClass}`}
                onMouseEnter={() => onHighlightLines?.([index + 1])}
                onMouseLeave={() => onHighlightLines?.(null)}
              >
                <span className="line-number">Line {index + 1}:</span>
                <span className="syllable-count">{count} syllable{count !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
          {analysis.syllableCounts.length === 0 && (
            <div className="empty-state">Start writing to see syllable analysis</div>
          )}
        </div>
      )}
    </div>
  );

  const posSection = (
    <div key="pos" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('pos')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'pos' ? 'expanded' : ''}`}>▶</span>
        Word Types
        <HelpTooltip {...HELP_CONTENT.wordTypes} />
        {(() => {
          // Check for problematic word type ratios
          const warnings: string[] = [];
          const totalWords = analysis.totalWords;

          if (totalWords > 0) {
            const adverbPct = (analysis.posDistribution['Adverb'] || 0) / totalWords * 100;
            const adjectivePct = (analysis.posDistribution['Adjective'] || 0) / totalWords * 100;
            const pronounPct = (analysis.posDistribution['Pronoun'] || 0) / totalWords * 100;

            // Adverbs: warning if > 10%, critical if > 15%
            if (adverbPct > 15) warnings.push('adverb-critical');
            else if (adverbPct > 10) warnings.push('adverb-warning');

            // Adjectives: warning if > 25%, critical if > 35%
            if (adjectivePct > 35) warnings.push('adjective-critical');
            else if (adjectivePct > 25) warnings.push('adjective-warning');

            // Pronouns: warning if > 20%, critical if > 30%
            if (pronounPct > 30) warnings.push('pronoun-critical');
            else if (pronounPct > 20) warnings.push('pronoun-warning');
          }

          if (warnings.length === 0) return null;

          return (
            <span className="word-type-warning" title="Check word type usage - rule of thumb warnings">
              ⚠
            </span>
          );
        })()}
      </h3>
      {expandedSection === 'pos' && (
        <div className="pos-distribution">
          {Object.entries(analysis.posDistribution).map(([pos, count]) => {
            const percentage = analysis.totalWords > 0
              ? Math.round((count / analysis.totalWords) * 100)
              : 0;

            // Determine warning level for this POS type
            let warningIcon = '';
            let warningTitle = '';

            if (pos === 'Adverb' && analysis.totalWords > 0) {
              const pct = (count / analysis.totalWords) * 100;
              if (pct > 15) {
                warningIcon = '⚠';
                warningTitle = 'Very high adverb usage (>15%)\n\nWhy: Adverbs often weaken writing by telling rather than showing. "Quickly ran" is weaker than "sprinted."\n\nWhat to do: Replace adverb + verb combinations with stronger, more specific verbs. Instead of "spoke softly," try "whispered" or "murmured."';
              } else if (pct > 10) {
                warningIcon = '⚠';
                warningTitle = 'High adverb usage (>10%)\n\nWhy: Excessive adverbs can dilute impact and make writing less vivid. Strong verbs and nouns carry more weight.\n\nWhat to do: Review each adverb and ask if a stronger verb could replace the adverb + verb combination. Keep adverbs that add essential meaning.';
              }
            } else if (pos === 'Adjective' && analysis.totalWords > 0) {
              const pct = (count / analysis.totalWords) * 100;
              if (pct > 35) {
                warningIcon = '⚠';
                warningTitle = 'Very high adjective usage (>35%)\n\nWhy: Over-relying on adjectives can make writing feel "tell-y" rather than "show-y." Multiple adjectives can overwhelm the reader.\n\nWhat to do: Show qualities through action, metaphor, or precise nouns instead of piling on adjectives. Instead of "the beautiful, bright, warm sun," try "sunlight that warmed her face."';
              } else if (pct > 25) {
                warningIcon = '⚠';
                warningTitle = 'High adjective usage (>25%)\n\nWhy: While descriptive language enriches poetry, too many adjectives can slow the pace and reduce impact.\n\nWhat to do: Keep only the most essential and surprising adjectives. Consider if you can convey the quality through imagery or action instead of direct description.';
              }
            } else if (pos === 'Pronoun' && analysis.totalWords > 0) {
              const pct = (count / analysis.totalWords) * 100;
              if (pct > 30) {
                warningIcon = '⚠';
                warningTitle = 'Very high pronoun usage (>30%)\n\nWhy: Overusing pronouns (he, she, it, they) can make writing vague and reduce concreteness. Readers may lose track of what pronouns refer to.\n\nWhat to do: Replace some pronouns with specific nouns or names. Instead of "She walked down the street. She saw it," try "Maria walked down the street. She saw the old bookstore."';
              } else if (pct > 20) {
                warningIcon = '⚠';
                warningTitle = 'High pronoun usage (>20%)\n\nWhy: Frequent pronouns can create distance from the subject and reduce specificity, making imagery less vivid.\n\nWhat to do: Balance pronouns with concrete nouns. Occasionally repeat the subject for clarity and emphasis, or use more specific descriptors.';
              }
            }

            return (
              <div
                key={pos}
                className="pos-item"
                onMouseEnter={() => onHighlightPOS?.(pos)}
                onMouseLeave={() => onHighlightPOS?.(null)}
              >
                <div className="pos-header">
                  <span className={`pos-label pos-${pos.toLowerCase()}`}>{pos}s</span>
                  <span className="pos-count">
                    {count} ({percentage}%)
                    {warningIcon && (
                      <span className="pos-warning-icon" title={warningTitle}>
                        {warningIcon}
                      </span>
                    )}
                  </span>
                </div>
                <div className="pos-bar-container">
                  <div
                    className={`pos-bar pos-bar-${pos.toLowerCase()}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Filter to only show suggestions with actual alternatives
  const suggestionsWithAlternatives = Array.from(adverbSuggestions.values()).filter(
    suggestion => suggestion.suggestions.length > 0
  );

  // Combined count for adverbs section badge
  const totalAdverbIssues = suggestionsWithAlternatives.length + analysis.doubleAdverbs.length;

  const adverbsSection = (
    <div key="adverbs" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('adverbs')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'adverbs' ? 'expanded' : ''}`}>▶</span>
        Adverbs
        <HelpTooltip {...HELP_CONTENT.adverbUsage} />
        {totalAdverbIssues > 0 && (
          <span className="issue-count-badge" title={`${totalAdverbIssues} adverb issue(s) found`}>
            {totalAdverbIssues}
          </span>
        )}
      </h3>
      {expandedSection === 'adverbs' && (
        <div className="adverb-suggestions-info">
          {totalAdverbIssues === 0 ? (
            <div className="empty-state">No adverb issues detected</div>
          ) : (
            <>
              <div className="adverb-suggestions-intro">
                Adverbs often weaken verbs by telling instead of showing. "Walked slowly" is less vivid than "ambled" or "shuffled." Strong, specific verbs carry more emotional weight.
              </div>

              {/* Double adverbs subsection */}
              {analysis.doubleAdverbs.length > 0 && (
                <div className="adverb-subsection">
                  <h4 className="adverb-subsection-title">Stacked adverbs ({analysis.doubleAdverbs.length})</h4>
                  <div className="double-adverbs-list">
                    {analysis.doubleAdverbs.map((instance, index) => {
                      const isHighlightedFromEditor = editorHoveredLine === instance.lineIndex + 1;
                      return (
                        <div
                          key={index}
                          className={`double-adverb-item ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                          onMouseEnter={() => onHighlightWords?.([
                            { word: instance.adverb1, lineNumber: instance.lineIndex + 1 },
                            { word: instance.adverb2, lineNumber: instance.lineIndex + 1 },
                            { word: instance.verb, lineNumber: instance.lineIndex + 1 }
                          ])}
                          onMouseLeave={() => onHighlightWords?.(null)}
                        >
                          <div className="double-adverb-header">
                            <span className="double-adverb-phrase">
                              <span className="adverb-highlight">{instance.adverb1}</span>
                              {' '}
                              <span className="adverb-highlight">{instance.adverb2}</span>
                              {' '}
                              <span className="verb-highlight">{instance.verb}</span>
                            </span>
                            <span className="adverb-suggestion-line">Line {instance.lineIndex + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Adverb+verb suggestions subsection */}
              {suggestionsWithAlternatives.length > 0 && (
                <div className="adverb-subsection">
                  <h4 className="adverb-subsection-title">Adverb+verb combinations ({suggestionsWithAlternatives.length})</h4>
                  <div className="adverb-suggestions-list">
                    {suggestionsWithAlternatives.map((suggestion, index) => {
                      const key = `${suggestion.adverb}_${suggestion.verb}_${suggestion.lineIndex}_${index}`;
                      const isHighlightedFromEditor = editorHoveredLine === suggestion.lineIndex + 1;
                      return (
                        <div
                          key={key}
                          className={`adverb-suggestion-item ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                          onMouseEnter={() => onHighlightWords?.([
                            { word: suggestion.adverb, lineNumber: suggestion.lineIndex + 1 },
                            { word: suggestion.verb, lineNumber: suggestion.lineIndex + 1 }
                          ])}
                          onMouseLeave={() => onHighlightWords?.(null)}
                        >
                          <div className="adverb-suggestion-header">
                            <span className="adverb-suggestion-original">
                              {suggestion.originalOrder === 'verb-adverb' ? (
                                <>
                                  <span className="verb-highlight">{suggestion.verb}</span>
                                  {' '}
                                  <span className="adverb-highlight">{suggestion.adverb}</span>
                                </>
                              ) : (
                                <>
                                  <span className="adverb-highlight">{suggestion.adverb}</span>
                                  {' '}
                                  <span className="verb-highlight">{suggestion.verb}</span>
                                </>
                              )}
                            </span>
                            <span className="adverb-suggestion-line">Line {suggestion.lineIndex + 1}</span>
                          </div>
                          <div className="adverb-suggestion-alternatives">
                            <span className="alternatives-label">Try instead:</span>
                            <div className="alternatives-list">
                              {suggestion.suggestions.map((alt, altIndex) => (
                                <span key={altIndex} className="alternative-word">
                                  {alt}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  const passiveVoiceSection = (
    <div key="passiveVoice" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('passiveVoice')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'passiveVoice' ? 'expanded' : ''}`}>▶</span>
        Active vs. Passive Language
        <HelpTooltip {...HELP_CONTENT.passiveVoice} />
        {analysis.passiveVoiceInstances.length > 0 && (
          <span className="issue-count-badge" title={`${analysis.passiveVoiceInstances.length} passive voice instance(s)`}>
            {analysis.passiveVoiceInstances.length}
          </span>
        )}
      </h3>
      {expandedSection === 'passiveVoice' && (
        <div className="passive-voice-info">
          {analysis.passiveVoiceInstances.length === 0 ? (
            <div className="perfect-meter">All active voice throughout</div>
          ) : (
            <>
              <div className="passive-voice-summary">
                Found {analysis.passiveVoiceInstances.length} instance{analysis.passiveVoiceInstances.length !== 1 ? 's' : ''} of passive voice
              </div>
              <div className="passive-voice-list">
                {Array.from(analysis.passiveVoiceGrouped.entries()).map(([lineIndex, instances]) => (
                  <div
                    key={lineIndex}
                    className="passive-voice-item"
                    onMouseEnter={() => {
                      // Highlight all passive voice words from all instances on this line
                      const wordsToHighlight = instances.flatMap(instance =>
                        instance.text.split(/\s+/).map(word => ({
                          word: word.replace(/[^a-zA-Z']/g, ''),
                          lineNumber: lineIndex + 1
                        }))
                      ).filter(w => w.word.length > 0);
                      onHighlightWords?.(wordsToHighlight);
                    }}
                    onMouseLeave={() => onHighlightWords?.(null)}
                  >
                    <span className="line-number">Line {lineIndex + 1}:</span>
                    <div className="passive-instances">
                      {instances.map((instance, idx) => (
                        <span key={idx} className="passive-text" title={`${instance.type === 'be-passive' ? '"to be" + past participle' : '"get" + past participle'}`}>
                          "{instance.text}"
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const soundPatternsSection = (
    <div key="soundPatterns" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('soundPatterns')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'soundPatterns' ? 'expanded' : ''}`}>▶</span>
        Sound Patterns
        <HelpTooltip {...HELP_CONTENT.soundPatterns} />
        {(analysis.soundPatterns.alliterations.length > 0 || analysis.soundPatterns.assonances.length > 0 || analysis.soundPatterns.consonances.length > 0) && (
          <span className="positive-count-badge" title={`${analysis.soundPatterns.alliterations.length + analysis.soundPatterns.assonances.length + analysis.soundPatterns.consonances.length} sound pattern(s) detected`}>
            {analysis.soundPatterns.alliterations.length + analysis.soundPatterns.assonances.length + analysis.soundPatterns.consonances.length}
          </span>
        )}
      </h3>
      {expandedSection === 'soundPatterns' && (
        <div className="sound-patterns-info">
          {analysis.soundPatterns.alliterations.length === 0 &&
           analysis.soundPatterns.assonances.length === 0 &&
           analysis.soundPatterns.consonances.length === 0 ? (
            <div className="empty-state">No significant sound patterns detected</div>
          ) : (
            <>
              {analysis.soundPatterns.alliterations.length > 0 && (
                <div className="sound-pattern-group">
                  <h4 className="sound-pattern-type">Alliteration ({analysis.soundPatterns.alliterations.length})</h4>
                  {(showAllSoundPatterns.alliteration
                    ? analysis.soundPatterns.alliterations
                    : analysis.soundPatterns.alliterations.slice(0, 3)
                  ).map((instance, idx) => {
                    const isHighlightedFromEditor = editorHoveredLine === instance.lineIndex + 1;
                    return (
                      <div
                        key={idx}
                        className={`sound-pattern-item ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                        onMouseEnter={() => {
                          // Highlight all the words in this alliteration pattern
                          const wordsToHighlight = instance.words.map(word => ({
                            word,
                            lineNumber: instance.lineIndex + 1
                          }));
                          onHighlightWords?.(wordsToHighlight);
                        }}
                        onMouseLeave={() => onHighlightWords?.(null)}
                      >
                        <span className="pattern-description">{instance.description}</span>
                        <span className="pattern-line">Line {instance.lineIndex + 1}</span>
                      </div>
                    );
                  })}
                  {analysis.soundPatterns.alliterations.length > 3 && (
                    <button
                      className="show-more-btn"
                      onClick={() => setShowAllSoundPatterns(prev => ({...prev, alliteration: !prev.alliteration}))}
                    >
                      {showAllSoundPatterns.alliteration
                        ? 'Show Less'
                        : `Show ${analysis.soundPatterns.alliterations.length - 3} More`}
                    </button>
                  )}
                </div>
              )}
              {analysis.soundPatterns.assonances.length > 0 && (
                <div className="sound-pattern-group">
                  <h4 className="sound-pattern-type">Assonance ({analysis.soundPatterns.assonances.length})</h4>
                  {(showAllSoundPatterns.assonance
                    ? analysis.soundPatterns.assonances
                    : analysis.soundPatterns.assonances.slice(0, 3)
                  ).map((instance, idx) => {
                    const isHighlightedFromEditor = editorHoveredLine === instance.lineIndex + 1;
                    return (
                      <div
                        key={idx}
                        className={`sound-pattern-item ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                        onMouseEnter={() => {
                          // Highlight all the words in this assonance pattern
                          const wordsToHighlight = instance.words.map(word => ({
                            word,
                            lineNumber: instance.lineIndex + 1
                          }));
                          onHighlightWords?.(wordsToHighlight);
                        }}
                        onMouseLeave={() => onHighlightWords?.(null)}
                      >
                        <span className="pattern-description">{instance.description}</span>
                        <span className="pattern-line">Line {instance.lineIndex + 1}</span>
                      </div>
                    );
                  })}
                  {analysis.soundPatterns.assonances.length > 3 && (
                    <button
                      className="show-more-btn"
                      onClick={() => setShowAllSoundPatterns(prev => ({...prev, assonance: !prev.assonance}))}
                    >
                      {showAllSoundPatterns.assonance
                        ? 'Show Less'
                        : `Show ${analysis.soundPatterns.assonances.length - 3} More`}
                    </button>
                  )}
                </div>
              )}
              {analysis.soundPatterns.consonances.length > 0 && (
                <div className="sound-pattern-group">
                  <h4 className="sound-pattern-type">Consonance ({analysis.soundPatterns.consonances.length})</h4>
                  {(showAllSoundPatterns.consonance
                    ? analysis.soundPatterns.consonances
                    : analysis.soundPatterns.consonances.slice(0, 3)
                  ).map((instance, idx) => {
                    const isHighlightedFromEditor = editorHoveredLine === instance.lineIndex + 1;
                    return (
                      <div
                        key={idx}
                        className={`sound-pattern-item ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                        onMouseEnter={() => {
                          // Highlight all the words in this consonance pattern
                          const wordsToHighlight = instance.words.map(word => ({
                            word,
                            lineNumber: instance.lineIndex + 1
                          }));
                          onHighlightWords?.(wordsToHighlight);
                        }}
                        onMouseLeave={() => onHighlightWords?.(null)}
                      >
                        <span className="pattern-description">{instance.description}</span>
                        <span className="pattern-line">Line {instance.lineIndex + 1}</span>
                      </div>
                    );
                  })}
                  {analysis.soundPatterns.consonances.length > 3 && (
                    <button
                      className="show-more-btn"
                      onClick={() => setShowAllSoundPatterns(prev => ({...prev, consonance: !prev.consonance}))}
                    >
                      {showAllSoundPatterns.consonance
                        ? 'Show Less'
                        : `Show ${analysis.soundPatterns.consonances.length - 3} More`}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  const tenseConsistencySection = (
    <div key="tenseConsistency" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('tenseConsistency')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'tenseConsistency' ? 'expanded' : ''}`}>▶</span>
        Tense Consistency
        <HelpTooltip {...HELP_CONTENT.tenseConsistency} />
        {!analysis.tenseAnalysis.isConsistent && analysis.tenseAnalysis.instances.length > 0 && (
          <span className="word-type-warning" title="Tense inconsistency detected">
            ⚠
          </span>
        )}
      </h3>
      {expandedSection === 'tenseConsistency' && (
        <div className="tense-consistency-info">
          {analysis.tenseAnalysis.instances.length === 0 ? (
            <div className="empty-state">No verbs detected for tense analysis</div>
          ) : (
            <>
              <div className="tense-summary">
                <div className="tense-dominant">
                  <strong>Dominant tense:</strong> {analysis.tenseAnalysis.dominantTense}
                </div>
                <div className="tense-counts">
                  <span
                    className="tense-count past clickable"
                    onMouseEnter={() => {
                      // Highlight all past tense verbs in the text
                      const pastInstances = analysis.tenseAnalysis.instances
                        .filter(i => i.tense === 'past');
                      onTenseExpand?.({ tenseInstances: pastInstances });
                    }}
                    onMouseLeave={() => onTenseExpand?.(null)}
                    title="Hover to highlight past tense verbs"
                  >
                    Past: {analysis.tenseAnalysis.pastCount}
                  </span>
                  <span
                    className="tense-count present clickable"
                    onMouseEnter={() => {
                      // Highlight all present tense verbs in the text
                      const presentInstances = analysis.tenseAnalysis.instances
                        .filter(i => i.tense === 'present');
                      onTenseExpand?.({ tenseInstances: presentInstances });
                    }}
                    onMouseLeave={() => onTenseExpand?.(null)}
                    title="Hover to highlight present tense verbs"
                  >
                    Present: {analysis.tenseAnalysis.presentCount}
                  </span>
                  <span
                    className="tense-count future clickable"
                    onMouseEnter={() => {
                      // Highlight all future tense verbs in the text
                      const futureInstances = analysis.tenseAnalysis.instances
                        .filter(i => i.tense === 'future');
                      onTenseExpand?.({ tenseInstances: futureInstances });
                    }}
                    onMouseLeave={() => onTenseExpand?.(null)}
                    title="Hover to highlight future tense verbs"
                  >
                    Future: {analysis.tenseAnalysis.futureCount}
                  </span>
                </div>
                <div className={`tense-status ${analysis.tenseAnalysis.consistency}`}>
                  {analysis.tenseAnalysis.consistency === 'consistent' ? 'Consistent tense' :
                   analysis.tenseAnalysis.consistency === 'mostly consistent' ? 'Mostly consistent' : 'Mixed tenses'}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const scansionSection = (
    <div key="scansion" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('scansion')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'scansion' ? 'expanded' : ''}`}>▶</span>
        Scansion (Stress Patterns)
        <HelpTooltip {...HELP_CONTENT.scansion} />
      </h3>
      {expandedSection === 'scansion' && (
        <div className="scansion-info">
          {analysis.scansionAnalysis.lines.length === 0 ? (
            <div className="empty-state">Start writing to see scansion analysis</div>
          ) : (
            <>
              <div className="scansion-summary">
                <div className="meter-type">
                  <strong>Dominant meter:</strong> {analysis.scansionAnalysis.dominantMeter}
                </div>
                <div className="regularity-score">
                  <strong>Regularity:</strong> {analysis.scansionAnalysis.regularityScore}%
                </div>
                <button
                  className="scansion-highlight-btn"
                  onMouseEnter={() => {
                    const instances = getScansionInstances(text);
                    onScansionExpand?.({ syllableInstances: instances });
                  }}
                  onMouseLeave={() => onScansionExpand?.(null)}
                  title="Hover to highlight stressed syllables (bold) in the editor"
                >
                  Show Stress
                </button>
              </div>
              <div className="scansion-lines">
                {analysis.scansionAnalysis.lines.slice(0, 10).map((line) => (
                  <div
                    key={line.lineIndex}
                    className="scansion-line-item"
                    onMouseEnter={() => {
                      // Highlight stressed syllables for this specific line
                      const instances = getScansionInstances(text, line.lineIndex);
                      onScansionExpand?.({ syllableInstances: instances });
                      onHighlightLines?.([line.lineIndex + 1]);
                    }}
                    onMouseLeave={() => {
                      onScansionExpand?.(null);
                      onHighlightLines?.(null);
                    }}
                  >
                    <span className="scansion-line-label">Line {line.lineIndex + 1}:</span>
                    <span className="scansion-pattern-inline">{line.fullPattern}</span>
                    {line.meterType && <span className="scansion-meter-tag">{line.meterType}</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const figurativeLanguageSection = (
    <div key="figurativeLanguage" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('figurativeLanguage')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'figurativeLanguage' ? 'expanded' : ''}`}>▶</span>
        Figurative Language
        <HelpTooltip {...HELP_CONTENT.figurativeLanguage} />
        {analysis.metaphorAnalysis.instances.length > 0 && (
          <span className="positive-count-badge" title={`${analysis.metaphorAnalysis.instances.length} figurative language instance(s)`}>
            {analysis.metaphorAnalysis.instances.length}
          </span>
        )}
      </h3>
      {expandedSection === 'figurativeLanguage' && (
        <div className="figurative-language-info">
          {analysis.metaphorAnalysis.instances.length === 0 ? (
            <div className="empty-state">No figurative language detected</div>
          ) : (
            <>
              <div className="figurative-summary">
                {analysis.metaphorAnalysis.simileCount > 0 && (
                  <span className="figurative-count">Similes: {analysis.metaphorAnalysis.simileCount}</span>
                )}
                {analysis.metaphorAnalysis.metaphorCount > 0 && (
                  <span className="figurative-count">Metaphors: {analysis.metaphorAnalysis.metaphorCount}</span>
                )}
                {analysis.metaphorAnalysis.personificationCount > 0 && (
                  <span className="figurative-count">Personification: {analysis.metaphorAnalysis.personificationCount}</span>
                )}
                {analysis.metaphorAnalysis.hyperboleCount > 0 && (
                  <span className="figurative-count">Hyperbole: {analysis.metaphorAnalysis.hyperboleCount}</span>
                )}
              </div>
              <div className="figurative-list">
                {analysis.metaphorAnalysis.instances.map((instance, idx) => (
                  <div
                    key={idx}
                    className="figurative-item"
                    onMouseEnter={() => onHighlightWords?.(instance.text.split(/\s+/).map(word => ({ word: word.replace(/[^a-zA-Z]/g, ''), lineNumber: instance.lineIndex + 1 })))}
                    onMouseLeave={() => onHighlightWords?.(null)}
                  >
                    <div className="figurative-header">
                      <span className={`figurative-type ${instance.type}`}>{instance.type}</span>
                      <span className="figurative-line">Line {instance.lineIndex + 1}</span>
                    </div>
                    <div className="figurative-text">"{instance.text}"</div>
                    <div className="figurative-explanation">{instance.explanation}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  // Helper function to extract words from a phrase for highlighting
  const getWordsFromPhrase = (phrase: string, lineNumber: number) => {
    return phrase.split(/\s+/).map(word => ({
      word: word.replace(/[^a-zA-Z']/g, ''),
      lineNumber
    })).filter(w => w.word.length > 0);
  };

  // Combined count for cliches and dead metaphors
  const totalClicheCount = analysis.clicheAnalysis.totalClichesFound + analysis.deadMetaphorAnalysis.count;

  // Cliche Detection Section - Now includes Dead Metaphors
  const clicheSection = (
    <div key="cliches" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('cliches')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'cliches' ? 'expanded' : ''}`}>▶</span>
        Potential Cliches
        <HelpTooltip {...HELP_CONTENT.clicheDetection} />
        {totalClicheCount > 0 && (
          <span className="cliche-count-badge" title={`${totalClicheCount} potential cliche(s) detected`}>
            {totalClicheCount}
          </span>
        )}
      </h3>
      {expandedSection === 'cliches' && (
        <div className="cliche-detection-info">
          {totalClicheCount === 0 ? (
            <div className="cliche-clear">
              No commonly recognized phrases found
            </div>
          ) : (
            <>
              <div className="cliche-summary">
                <div className="cliche-note">
                  Phrases readers may recognize. Consider whether familiarity serves your intent.
                </div>
              </div>
              <div className="cliche-list">
                {/* Show strong cliches first */}
                {analysis.clicheAnalysis.strongCliches.map((cliche, idx) => (
                  <div
                    key={`strong-${idx}`}
                    className="cliche-item cliche-strong"
                    onMouseEnter={() => onHighlightWords?.(getWordsFromPhrase(cliche.phrase, cliche.lineNumber))}
                    onMouseLeave={() => onHighlightWords?.(null)}
                  >
                    <div className="cliche-phrase">"{cliche.phrase}"</div>
                    <div className="cliche-meta">
                      <span className="cliche-category">{cliche.category}</span>
                      <span className="cliche-line">Line {cliche.lineNumber}</span>
                    </div>
                  </div>
                ))}
                {/* Then moderate cliches */}
                {analysis.clicheAnalysis.moderateCliches.map((cliche, idx) => (
                  <div
                    key={`moderate-${idx}`}
                    className="cliche-item cliche-moderate"
                    onMouseEnter={() => onHighlightWords?.(getWordsFromPhrase(cliche.phrase, cliche.lineNumber))}
                    onMouseLeave={() => onHighlightWords?.(null)}
                  >
                    <div className="cliche-phrase">"{cliche.phrase}"</div>
                    <div className="cliche-meta">
                      <span className="cliche-category">{cliche.category}</span>
                      <span className="cliche-line">Line {cliche.lineNumber}</span>
                    </div>
                  </div>
                ))}
                {/* Finally mild cliches */}
                {analysis.clicheAnalysis.mildCliches.map((cliche, idx) => (
                  <div
                    key={`mild-${idx}`}
                    className="cliche-item cliche-mild"
                    onMouseEnter={() => onHighlightWords?.(getWordsFromPhrase(cliche.phrase, cliche.lineNumber))}
                    onMouseLeave={() => onHighlightWords?.(null)}
                  >
                    <div className="cliche-phrase">"{cliche.phrase}"</div>
                    <div className="cliche-meta">
                      <span className="cliche-category">{cliche.category}</span>
                      <span className="cliche-line">Line {cliche.lineNumber}</span>
                    </div>
                  </div>
                ))}
                {/* Dead metaphors section */}
                {analysis.deadMetaphorAnalysis.count > 0 && (
                  <>
                    <div className="dead-metaphor-header-in-cliches">
                      Dead Metaphors
                    </div>
                    <div className="dead-metaphor-note-in-cliches">
                      Once vivid comparisons, now so common readers no longer "see" the image.
                    </div>
                    {analysis.deadMetaphorAnalysis.metaphors.map((metaphor, idx) => (
                      <div
                        key={`dead-${idx}`}
                        className="cliche-item dead-metaphor-item-in-cliches"
                        onMouseEnter={() => onHighlightWords?.(getWordsFromPhrase(metaphor.phrase, metaphor.lineNumber))}
                        onMouseLeave={() => onHighlightWords?.(null)}
                      >
                        <div className="cliche-phrase">"{metaphor.phrase}"</div>
                        <div className="dead-metaphor-details">
                          <div className="dead-metaphor-origin">
                            <strong>Original image:</strong> {metaphor.originalMeaning}
                          </div>
                          <div className="dead-metaphor-suggestion">{metaphor.suggestion}</div>
                        </div>
                        <div className="cliche-meta">
                          <span className="cliche-category">{getCategoryDisplayName(metaphor.category)}</span>
                          <span className="cliche-line">Line {metaphor.lineNumber}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  // Abstract vs Concrete Language Section
  const abstractConcreteSection = (
    <div key="abstractConcrete" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('abstractConcrete')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'abstractConcrete' ? 'expanded' : ''}`}>▶</span>
        Abstract vs Concrete
        <HelpTooltip {...HELP_CONTENT.abstractConcrete} />
        {analysis.abstractConcreteAnalysis.assessment === 'abstract-heavy' && (
          <span className="word-type-warning" title="Consider adding more concrete, sensory language">
            ⚠
          </span>
        )}
      </h3>
      {expandedSection === 'abstractConcrete' && (
        <div className="abstract-concrete-info">
          <div className="abstract-concrete-summary">
            <div className="ac-score-display">
              <span className="ac-score-label">Concreteness Score</span>
              <span className={`ac-score-value ${
                analysis.abstractConcreteAnalysis.score >= 70 ? 'excellent' :
                analysis.abstractConcreteAnalysis.score >= 50 ? 'good' :
                analysis.abstractConcreteAnalysis.score >= 30 ? 'moderate' : 'low'
              }`}>
                {analysis.abstractConcreteAnalysis.score}%
              </span>
            </div>
            <div className="ac-ratio">
              <span className="ac-abstract">Abstract: {analysis.abstractConcreteAnalysis.abstractCount}</span>
              <span className="ac-divider">|</span>
              <span className="ac-concrete">Concrete: {analysis.abstractConcreteAnalysis.concreteCount}</span>
            </div>
            <div className={`ac-assessment ${analysis.abstractConcreteAnalysis.assessment}`}>
              {analysis.abstractConcreteAnalysis.assessment === 'excellent' ? 'Rich in concrete imagery' :
               analysis.abstractConcreteAnalysis.assessment === 'good' ? 'Good mix of abstract and concrete' :
               analysis.abstractConcreteAnalysis.assessment === 'moderate' ? 'Could use more sensory detail' :
               'Leans abstract — consider adding physical imagery'}
            </div>
          </div>
          {analysis.abstractConcreteAnalysis.suggestions.length > 0 && (
            <div className="ac-suggestions">
              <div className="ac-suggestions-header">Suggestions:</div>
              <ul className="ac-suggestions-list">
                {analysis.abstractConcreteAnalysis.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.abstractConcreteAnalysis.abstractWords.length > 0 && (
            <div className="ac-word-list">
              <div className="ac-word-header">Abstract words found:</div>
              <div className="ac-words">
                {analysis.abstractConcreteAnalysis.abstractWords.slice(0, 10).map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/synonyms/${encodeURIComponent(item.word)}`}
                    className="ac-word abstract"
                    title={`${item.category} — click to find concrete alternatives (hyponyms)`}
                    onMouseEnter={() => onHighlightWords?.([{ word: item.word, lineNumber: item.lineNumber }])}
                    onMouseLeave={() => onHighlightWords?.(null)}
                  >
                    {item.word}
                  </Link>
                ))}
                {analysis.abstractConcreteAnalysis.abstractWords.length > 10 && (
                  <span className="ac-more">+{analysis.abstractConcreteAnalysis.abstractWords.length - 10} more</span>
                )}
              </div>
              <div className="ac-tool-link">
                <Link to="/synonyms" className="tool-link">
                  Thesaurus — find concrete alternatives
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // First Draft Phrases Section
  const firstDraftPhrasesSection = (
    <div key="firstDraftPhrases" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('firstDraftPhrases')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'firstDraftPhrases' ? 'expanded' : ''}`}>▶</span>
        First Draft Phrases
        <HelpTooltip {...HELP_CONTENT.firstDraftPhrases} />
        {analysis.firstDraftAnalysis.count > 0 && (
          <span className="issue-count-badge" title={`${analysis.firstDraftAnalysis.count} potential filler phrase(s)`}>
            {analysis.firstDraftAnalysis.count}
          </span>
        )}
      </h3>
      {expandedSection === 'firstDraftPhrases' && (
        <div className="first-draft-info">
          {analysis.firstDraftAnalysis.count === 0 ? (
            <div className="first-draft-clear">
              No common filler words found
            </div>
          ) : (
            <>
              <div className="first-draft-note">
                Words that sometimes dilute impact. Worth a second look.
              </div>
              <div className="first-draft-list">
                {analysis.firstDraftAnalysis.phrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className={`first-draft-item first-draft-${phrase.category}`}
                    onMouseEnter={() => onHighlightWords?.(getWordsFromPhrase(phrase.phrase, phrase.lineNumber))}
                    onMouseLeave={() => onHighlightWords?.(null)}
                  >
                    <div className="first-draft-phrase-header">
                      <span className="first-draft-phrase">"{phrase.phrase}"</span>
                      <span className="first-draft-category">{phrase.category}</span>
                    </div>
                    <div className="first-draft-suggestion">{phrase.suggestion}</div>
                    <div className="first-draft-line">Line {phrase.lineNumber}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const rhythmVariationSection = (
    <div key="rhythm-variation" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('rhythmVariation')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'rhythmVariation' ? 'expanded' : ''}`}>▶</span>
        Rhythm Variation
        <HelpTooltip {...HELP_CONTENT.rhythmVariation} />
      </h3>
      {expandedSection === 'rhythmVariation' && (
        <div className="rhythm-variation-info">
          <div className="category-name">{analysis.rhythmVariation.category}</div>
          <div className="category-description">{analysis.rhythmVariation.explanation}</div>

          {/* Only show outlier warnings for non-free verse forms */}
          {analysis.activeForm !== 'Free Verse' && analysis.rhythmVariation.outlierLines.length > 0 && (
            <div className="violating-lines">
              <div className="violation-header">Lines with significant variation:</div>
              <div className="violation-list">
                {analysis.rhythmVariation.outlierLines.map((outlier) => (
                  <span
                    key={outlier.lineNumber}
                    className="violation-badge"
                    onMouseEnter={() => onHighlightLines?.([outlier.lineNumber])}
                    onMouseLeave={() => onHighlightLines?.(null)}
                  >
                    Line {outlier.lineNumber} ({outlier.syllableCount} syl.)
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.activeForm !== 'Free Verse' && analysis.rhythmVariation.outlierLines.length === 0 && analysis.syllableCounts.filter(c => c > 0).length > 0 && (
            <div className="perfect-meter">Lines show consistent rhythm</div>
          )}
          {analysis.activeForm === 'Free Verse' && (
            <div className="free-verse-note">Variation is expected and intentional in free verse.</div>
          )}
        </div>
      )}
    </div>
  );

  const stanzaStructureSection = (
    <div key="stanza-structure" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('stanzaStructure')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'stanzaStructure' ? 'expanded' : ''}`}>▶</span>
        Stanza Structure
        <HelpTooltip {...HELP_CONTENT.stanzaStructure} />
      </h3>
      {expandedSection === 'stanzaStructure' && (
        <div className="stanza-structure-info">
          {analysis.stanzaDetails.length === 0 ? (
            <div className="empty-state">No stanzas detected (add blank lines between stanzas)</div>
          ) : analysis.stanzaDetails.length === 1 ? (
            <div className="single-stanza-note">
              Single stanza poem with {analysis.stanzaDetails[0].lineCount} lines, {analysis.stanzaDetails[0].wordCount} words
            </div>
          ) : (
            <>
              <div className="stanza-summary">
                <div className="meter-stat">
                  <span className="meter-label">Total Stanzas:</span>
                  <span className="meter-value">{analysis.stanzaDetails.length}</span>
                </div>
                <div className="meter-stat">
                  <span className="meter-label">Line Balance:</span>
                  <span className="meter-value">
                    {(() => {
                      const lineCounts = analysis.stanzaDetails.map(s => s.lineCount);
                      const allSame = lineCounts.every(c => c === lineCounts[0]);
                      return allSame ? 'Uniform' : 'Varied';
                    })()}
                  </span>
                </div>
                <div className="meter-stat">
                  <span className="meter-label">Word Balance:</span>
                  <span className="meter-value">
                    {(() => {
                      const wordCounts = analysis.stanzaDetails.map(s => s.wordCount);
                      const avg = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
                      const maxDev = Math.max(...wordCounts.map(c => Math.abs(c - avg)));
                      return maxDev <= avg * 0.2 ? 'Balanced' : 'Varied';
                    })()}
                  </span>
                </div>
              </div>
              <div className="stanza-list">
                {analysis.stanzaDetails.map((stanza, index) => (
                  <div
                    key={index}
                    className="stanza-item"
                    onMouseEnter={() => {
                      const lineNumbers = Array.from(
                        { length: stanza.lineCount },
                        (_, i) => stanza.startLine + i
                      );
                      onHighlightLines?.(lineNumbers);
                    }}
                    onMouseLeave={() => onHighlightLines?.(null)}
                  >
                    <span className="stanza-number">Stanza {index + 1}</span>
                    <span className="stanza-stats">
                      {stanza.lineCount} lines, {stanza.wordCount} words
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const lineLengthSection = (
    <div key="line-length" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('lineLength')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'lineLength' ? 'expanded' : ''}`}>▶</span>
        Line Length (Words)
        <HelpTooltip {...HELP_CONTENT.lineLength} />
      </h3>
      {expandedSection === 'lineLength' && (
        <div className="line-length-info">
          <div className="meter-details">
            <div className="meter-stat">
              <span className="meter-label">Pattern:</span>
              <span className="meter-value">{analysis.lineLengthConsistency.consistency}</span>
            </div>
            <div className="meter-stat">
              <span className="meter-label">Median:</span>
              <span className="meter-value">{analysis.lineLengthConsistency.medianWords} words</span>
            </div>
          </div>

          {/* Show all lines with color coding */}
          <div className="line-length-list">
            {analysis.lineLengthConsistency.allLines.map((line) => {
              const median = analysis.lineLengthConsistency.medianWords;
              const deviation = Math.abs(line.wordCount - median);

              let colorClass = '';
              if (deviation === 0) {
                colorClass = 'line-length-perfect'; // Green - exact match
              } else if (deviation <= 2) {
                colorClass = 'line-length-close'; // Yellow - within ±2 words
              } else {
                colorClass = 'line-length-violation'; // Red - >2 words difference
              }

              return (
                <div
                  key={line.lineNumber}
                  className={`line-length-item ${colorClass}`}
                  onMouseEnter={() => onHighlightLines?.([line.lineNumber])}
                  onMouseLeave={() => onHighlightLines?.(null)}
                >
                  <span className="line-number">Line {line.lineNumber}:</span>
                  <span className="line-length-count">{line.wordCount} word{line.wordCount !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
            {analysis.lineLengthConsistency.allLines.length === 0 && (
              <div className="empty-state">Start writing to see line length analysis</div>
            )}
          </div>

          {/* Show inconsistencies summary */}
          {analysis.lineLengthConsistency.outlierLines.length > 0 && (
            <div className="violating-lines">
              <div className="violation-header">
                {analysis.lineLengthConsistency.outlierLines.length} line{analysis.lineLengthConsistency.outlierLines.length !== 1 ? 's' : ''} deviating &gt;2 words from median
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const punctuationSection = (
    <div key="punctuation" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('punctuation')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'punctuation' ? 'expanded' : ''}`}>▶</span>
        Flow & Punctuation
        <HelpTooltip {...HELP_CONTENT.punctuation} />
      </h3>
      {expandedSection === 'punctuation' && (
        <div className="punctuation-info">
          <div className="punctuation-pattern">
            <div className="pattern-name">{analysis.punctuationPatterns.pattern}</div>
            <div className="pattern-effect">{analysis.punctuationPatterns.effect}</div>
          </div>
          <div className="punctuation-stats">
            <div className="meter-details">
              <div className="meter-stat">
                <span className="meter-label">End-stopped:</span>
                <span className="meter-value">{analysis.punctuationPatterns.endStopCount} lines</span>
              </div>
              <div className="meter-stat">
                <span className="meter-label">Enjambed:</span>
                <span className="meter-value">
                  {analysis.punctuationPatterns.enjambmentCount} lines ({analysis.punctuationPatterns.enjambmentPercentage}%)
                </span>
              </div>
            </div>
          </div>
          {(analysis.punctuationPatterns.commaCount > 0 ||
            analysis.punctuationPatterns.questionCount > 0 ||
            analysis.punctuationPatterns.exclamationCount > 0 ||
            analysis.punctuationPatterns.dashCount > 0 ||
            analysis.punctuationPatterns.semicolonCount > 0 ||
            analysis.punctuationPatterns.colonCount > 0) && (
            <div className="punctuation-details">
              <div className="punctuation-label">Punctuation marks used:</div>
              <div className="punctuation-grid">
                {analysis.punctuationPatterns.commaCount > 0 && (
                  <div className="punctuation-item">
                    <span className="punct-symbol">,</span>
                    <span className="punct-count">{analysis.punctuationPatterns.commaCount}</span>
                  </div>
                )}
                {analysis.punctuationPatterns.questionCount > 0 && (
                  <div className="punctuation-item">
                    <span className="punct-symbol">?</span>
                    <span className="punct-count">{analysis.punctuationPatterns.questionCount}</span>
                  </div>
                )}
                {analysis.punctuationPatterns.exclamationCount > 0 && (
                  <div className="punctuation-item">
                    <span className="punct-symbol">!</span>
                    <span className="punct-count">{analysis.punctuationPatterns.exclamationCount}</span>
                  </div>
                )}
                {analysis.punctuationPatterns.dashCount > 0 && (
                  <div className="punctuation-item">
                    <span className="punct-symbol">—</span>
                    <span className="punct-count">{analysis.punctuationPatterns.dashCount}</span>
                  </div>
                )}
                {analysis.punctuationPatterns.semicolonCount > 0 && (
                  <div className="punctuation-item">
                    <span className="punct-symbol">;</span>
                    <span className="punct-count">{analysis.punctuationPatterns.semicolonCount}</span>
                  </div>
                )}
                {analysis.punctuationPatterns.colonCount > 0 && (
                  <div className="punctuation-item">
                    <span className="punct-symbol">:</span>
                    <span className="punct-count">{analysis.punctuationPatterns.colonCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const repetitionSection = (
    <div key="repetition" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('repetition')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'repetition' ? 'expanded' : ''}`}>▶</span>
        Word Repetition
        <HelpTooltip {...HELP_CONTENT.repetition} />
      </h3>
      {expandedSection === 'repetition' && (
        <div className="repetition-info">
          {analysis.repetitionResults.length > 0 ? (
            <div className="repetition-list">
              {analysis.repetitionResults.map((result) => (
                <div
                  key={result.word}
                  className="repetition-item"
                  onMouseEnter={() => {
                    // Highlight all lines where this word appears
                    onHighlightLines?.(result.positions);
                  }}
                  onMouseLeave={() => onHighlightLines?.(null)}
                >
                  <div className="repetition-word">{result.word}</div>
                  <div className="repetition-details">
                    <span className="repetition-count">{result.count}×</span>
                    <span className="repetition-lines">
                      Lines: {result.positions.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No significant word repetition detected</div>
          )}
        </div>
      )}
    </div>
  );

  const rhymeSchemeSection = (
    <div key="rhyme-scheme" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('rhymeScheme')} className={`collapsible-header ${analysis.activeForm && isConstrained(analysis.activeForm, 'rhymeScheme') ? 'constrained' : ''}`}>
        <span className={`collapse-icon ${expandedSection === 'rhymeScheme' ? 'expanded' : ''}`}>▶</span>
        Rhyme Scheme
        <HelpTooltip {...HELP_CONTENT.rhymeScheme} />
        {getConstraintIcon('rhymeScheme', { fitScore: analysis.manualFormFit?.fitScore || analysis.poeticForm.fitScore, fit: analysis.manualFormFit?.fit || analysis.poeticForm.fit })}
      </h3>
      {expandedSection === 'rhymeScheme' && (
        <div className="rhyme-scheme-info">
          {/* For free verse, show "Not available" message */}
          {analysis.activeForm === 'Free Verse' ? (
            <div className="free-verse-note">
              Rhyme scheme analysis is not available for free verse. Free verse does not follow a predetermined rhyme pattern.
            </div>
          ) : (
            <>
              {/* Show fit to scheme for structured forms */}
              {analysis.expectedPattern && (
                <div className="fit-to-scheme">
                  <div className="fit-header">
                    <span className="fit-label">Fit to {analysis.activeForm}:</span>
                    <span className={`fit-badge fit-${analysis.rhymeCompliance.filter(c => c === 'perfect').length / analysis.rhymeCompliance.length >= 0.8 ? 'high' : analysis.rhymeCompliance.filter(c => c === 'perfect' || c === 'slant').length / analysis.rhymeCompliance.length >= 0.6 ? 'medium' : 'low'}`}>
                      {analysis.rhymeCompliance.filter(c => c === 'perfect').length / analysis.rhymeCompliance.length >= 0.8 ? 'High' :
                       analysis.rhymeCompliance.filter(c => c === 'perfect' || c === 'slant').length / analysis.rhymeCompliance.length >= 0.6 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="fit-stats">
                    <div className="fit-stat-item">
                      <span className="fit-stat-label">Perfect rhymes:</span>
                      <span className="fit-stat-value">{analysis.rhymeCompliance.filter(c => c === 'perfect').length} / {analysis.rhymeCompliance.length}</span>
                    </div>
                    <div className="fit-stat-item">
                      <span className="fit-stat-label">Slant rhymes:</span>
                      <span className="fit-stat-value">{analysis.rhymeCompliance.filter(c => c === 'slant').length} / {analysis.rhymeCompliance.length}</span>
                    </div>
                    <div className="fit-stat-item">
                      <span className="fit-stat-label">Deviations:</span>
                      <span className="fit-stat-value">{analysis.rhymeCompliance.filter(c => c === 'none').length} / {analysis.rhymeCompliance.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual rhyme scheme comparison */}
              {analysis.rhymeScheme.lineEndWords.length > 0 && (
                <div className="rhyme-scheme-comparison">
                  {/* Header row */}
                  <div className="rhyme-comparison-header">
                    <span className="rhyme-col-line">Line</span>
                    <span className="rhyme-col-word">End Word</span>
                    <span className="rhyme-col-detected">Detected</span>
                    {analysis.expectedPattern && (
                      <>
                        <span className="rhyme-col-expected">Expected</span>
                        <span className="rhyme-col-status">Match</span>
                      </>
                    )}
                  </div>

                  {/* Line rows */}
                  {analysis.rhymeScheme.lineEndWords.map((word, index) => {
                    const detectedLetter = analysis.rhymeScheme.schemePattern[index];
                    const expectedLetter = analysis.expectedPattern ? analysis.expectedPattern[index] : null;
                    const compliance = analysis.rhymeCompliance[index];
                    const actualLineNumber = analysis.rhymeScheme.lineNumbers[index];
                    const isHighlightedFromEditor = editorHoveredLine === actualLineNumber;

                    // Determine match status
                    let matchStatus: 'match' | 'slant' | 'mismatch' | 'none' = 'none';
                    if (expectedLetter) {
                      if (compliance === 'perfect') matchStatus = 'match';
                      else if (compliance === 'slant') matchStatus = 'slant';
                      else matchStatus = 'mismatch';
                    }

                    return (
                      <div
                        key={index}
                        className={`rhyme-comparison-row ${matchStatus !== 'none' ? `rhyme-${matchStatus}` : ''} ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                        onMouseEnter={() => onHighlightWords?.([{ word, lineNumber: actualLineNumber }])}
                        onMouseLeave={() => onHighlightWords?.(null)}
                      >
                        <span className="rhyme-col-line">{actualLineNumber}</span>
                        <span className="rhyme-col-word">{word}</span>
                        <span className="rhyme-col-detected rhyme-letter">{detectedLetter}</span>
                        {analysis.expectedPattern && (
                          <>
                            <span className="rhyme-col-expected rhyme-letter">{expectedLetter || '—'}</span>
                            <span className={`rhyme-col-status rhyme-status-${matchStatus}`}>
                              {matchStatus === 'match' && '●'}
                              {matchStatus === 'slant' && '◐'}
                              {matchStatus === 'mismatch' && '○'}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  // Build a set of end-line words with their line numbers for filtering
  const endLineWordSet = new Set<string>();
  analysis.rhymeScheme.lineNumbers.forEach((lineNum, idx) => {
    const word = analysis.rhymeScheme.lineEndWords[idx];
    if (word) {
      endLineWordSet.add(`${word.toLowerCase()}:${lineNum}`);
    }
  });

  // Filter internal rhymes to exclude those where BOTH words are end-line words
  const filteredInternalRhymes = analysis.internalRhymes.filter(rhyme => {
    const word1IsEndLine = endLineWordSet.has(`${rhyme.word1.toLowerCase()}:${rhyme.line1}`);
    const word2IsEndLine = endLineWordSet.has(`${rhyme.word2.toLowerCase()}:${rhyme.line2}`);
    // Keep the rhyme only if at least one word is NOT an end-line word
    return !(word1IsEndLine && word2IsEndLine);
  });

  // Count total rhymes for the badge
  const endRhymeCount = Array.from(analysis.rhymeScheme.rhymeGroups.entries())
    .filter(([, lineNumbers]) => lineNumbers.length >= 2).length;
  const totalRhymeCount = endRhymeCount + filteredInternalRhymes.length;

  const rhymeAnalysisSection = (
    <div key="rhymeAnalysis" className="analysis-section collapsible">
      <h3 onClick={() => toggleSection('rhymeAnalysis')} className="collapsible-header">
        <span className={`collapse-icon ${expandedSection === 'rhymeAnalysis' ? 'expanded' : ''}`}>▶</span>
        Rhyme Analysis
        <HelpTooltip {...HELP_CONTENT.rhymeOverview} />
        {totalRhymeCount > 0 && (
          <span className="positive-count-badge" title={`${totalRhymeCount} rhyme group(s) detected`}>
            {totalRhymeCount}
          </span>
        )}
      </h3>
      {expandedSection === 'rhymeAnalysis' && (
        <div className="rhyme-analysis-content">
          {/* End Rhymes Section */}
          {analysis.rhymeScheme.rhymeGroups.size > 0 && (
            <>
              <div className="rhyme-subsection-header">End Rhymes</div>
              <div className="rhyme-groups-list">
                {Array.from(analysis.rhymeScheme.rhymeGroups.entries()).map(([label, lineNumbers]) => {
                  if (lineNumbers.length < 2) return null; // Skip single-line groups

                  // Get the words in this rhyme group, paired with their line numbers
                  const wordLinePairs = lineNumbers
                    .map(lineNum => {
                      const idx = analysis.rhymeScheme.lineNumbers.indexOf(lineNum);
                      return {
                        word: idx >= 0 ? analysis.rhymeScheme.lineEndWords[idx] : '',
                        lineNumber: lineNum
                      };
                    })
                    .filter(pair => pair.word && pair.word.length > 0);

                  const words = wordLinePairs.map(p => p.word);
                  const validLineNumbers = wordLinePairs.map(p => p.lineNumber);

                  // Determine quality
                  let allPerfect = true;
                  let hasSlant = false;

                  for (let i = 0; i < words.length; i++) {
                    for (let j = i + 1; j < words.length; j++) {
                      const quality = assessRhymeQuality(words[i], words[j]);
                      if (quality === 'slant') {
                        hasSlant = true;
                        allPerfect = false;
                      } else if (quality === 'none') {
                        allPerfect = false;
                        hasSlant = false;
                      }
                    }
                  }

                  const qualityLabel = allPerfect ? 'Perfect' : hasSlant ? 'Slant' : 'Mixed';
                  const qualityClass = allPerfect ? 'rhyme-quality-perfect' : hasSlant ? 'rhyme-quality-slant' : 'rhyme-quality-mixed';

                  // Calculate originality score
                  let totalOriginality = 0;
                  let pairCount = 0;
                  for (let i = 0; i < words.length; i++) {
                    for (let j = i + 1; j < words.length; j++) {
                      totalOriginality += getRhymeOriginalityScore(words[i], words[j]);
                      pairCount++;
                    }
                  }
                  const avgOriginality = pairCount > 0 ? totalOriginality / pairCount : 100;
                  const originalityLabel = getRhymeOriginalityLabel(avgOriginality);
                  const originalityClass =
                    avgOriginality >= 35 ? '' :
                    avgOriginality >= 20 ? 'cliche-mild' : 'cliche-strong';

                  const isHighlightedFromEditor = editorHoveredLine != null && validLineNumbers.includes(editorHoveredLine);

                  return (
                    <div
                      key={label}
                      className={`rhyme-group-item ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                      onMouseEnter={() => onHighlightWords?.(wordLinePairs)}
                      onMouseLeave={() => onHighlightWords?.(null)}
                    >
                      <div className="rhyme-group-header">
                        <span className="rhyme-group-label">{label}</span>
                        <span className={`rhyme-quality-badge ${qualityClass}`}>{qualityLabel}</span>
                        {originalityLabel && (
                          <span className={`originality-badge ${originalityClass}`} title={`Originality: ${Math.round(avgOriginality)}%`}>
                            {originalityLabel}
                          </span>
                        )}
                      </div>
                      <div className="rhyme-group-words">
                        {wordLinePairs.map((pair, idx) => {
                          const isWordHighlighted = editorHoveredLine === pair.lineNumber;
                          return (
                            <span
                              key={idx}
                              className={`rhyme-group-word ${isWordHighlighted ? 'editor-highlighted' : ''}`}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                onHighlightWords?.([pair]);
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                onHighlightWords?.(null);
                              }}
                            >
                              {pair.word}
                              <span className="rhyme-group-line-ref"> (line {pair.lineNumber})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Internal Rhymes Section */}
          {filteredInternalRhymes.length > 0 && (
            <>
              <div className="rhyme-subsection-header">Internal Rhymes</div>
              <div className="internal-rhymes-list">
                {filteredInternalRhymes.map((rhyme, index) => {
                  const isHighlightedFromEditor = editorHoveredLine === rhyme.line1 || editorHoveredLine === rhyme.line2;
                  return (
                    <div
                      key={index}
                      className={`rhyme-group-item ${isHighlightedFromEditor ? 'editor-highlighted' : ''}`}
                      onMouseEnter={() => {
                        onHighlightWords?.([
                          { word: rhyme.word1, lineNumber: rhyme.line1 },
                          { word: rhyme.word2, lineNumber: rhyme.line2 }
                        ]);
                      }}
                      onMouseLeave={() => onHighlightWords?.(null)}
                    >
                      <div className="rhyme-group-header">
                        <span className={`rhyme-quality-badge ${rhyme.quality === 'perfect' ? 'rhyme-quality-perfect' : 'rhyme-quality-slant'}`}>
                          {rhyme.quality}
                        </span>
                      </div>
                      <div className="rhyme-group-words">
                        <span className="rhyme-group-word">
                          {rhyme.word1}
                          <span className="rhyme-group-line-ref"> (line {rhyme.line1})</span>
                        </span>
                        <span className="rhyme-group-word">
                          {rhyme.word2}
                          <span className="rhyme-group-line-ref"> (line {rhyme.line2})</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Empty state */}
          {analysis.rhymeScheme.rhymeGroups.size === 0 && filteredInternalRhymes.length === 0 && (
            <div className="empty-state">No rhymes detected</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <div className="analysis-header-left">
          <h2>Analysis</h2>
          <div className="save-indicator">
            <span className="save-dot"></span>
            {formatTimeSince(lastSaved)}
          </div>
        </div>
        {onClose && (
          <button className="panel-close-btn" onClick={onClose} aria-label="Close analysis panel">
            ×
          </button>
        )}
      </div>

      {/* Top-level metrics */}
      <div className="analysis-section overview-metrics">
        <div className="stats-grid-3">
          <div className="stat-item">
            <div className="stat-label">Words</div>
            <div className="stat-value">{analysis.totalWords}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Lines</div>
            <div className="stat-value">{analysis.nonEmptyLines}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Stanzas</div>
            <div className="stat-value">{analysis.stanzaCount}</div>
          </div>
        </div>

        {/* Poetic Form Selector */}
        <div className="form-selector">
          <div className="form-selector-row">
            <select
              id="poetic-form-select"
              className="form-selector-dropdown"
              value={selectedForm || 'Auto-detect'}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedForm(value === 'Auto-detect' ? null : value);
              }}
            >
              <option value="Auto-detect">Form: Auto-detect</option>
              <option value="Free Verse">Free Verse</option>
              <option value="Blank Verse">Blank Verse</option>
              <option value="Shakespearean Sonnet">Shakespearean Sonnet</option>
              <option value="Petrarchan Sonnet">Petrarchan Sonnet</option>
              <option value="Spenserian Sonnet">Spenserian Sonnet</option>
              <option value="Haiku">Haiku</option>
              <option value="Tanka">Tanka</option>
              <option value="Cinquain">Cinquain</option>
              <option value="Limerick">Limerick</option>
              <option value="Villanelle">Villanelle</option>
              <option value="Pantoum">Pantoum</option>
              <option value="Ballad Stanza">Ballad Stanza</option>
              <option value="Terza Rima">Terza Rima</option>
              <option value="Ottava Rima">Ottava Rima</option>
            </select>
            {analysis.activeForm && WIKIPEDIA_URLS[analysis.activeForm] && (
              <a
                href={WIKIPEDIA_URLS[analysis.activeForm]}
                target="_blank"
                rel="noopener noreferrer"
                className="wikipedia-link"
                title={`Learn about ${analysis.activeForm}`}
              >
                <span className="wikipedia-icon">i</span>
              </a>
            )}
          </div>
          {!selectedForm && analysis.poeticForm && (
            <div className="auto-detect-result">
              Resembles:
              <span className={`fit-badge-inline fit-${analysis.poeticForm.fit || 'medium'}`}>
                {analysis.poeticForm.form}
              </span>
            </div>
          )}
          {selectedForm && analysis.manualFormFit && (
            <div className="auto-detect-result">
              {analysis.manualFormFit.fit !== 'none' ? (
                <>
                  <span className={`fit-badge-inline fit-${analysis.manualFormFit.fit}`}>
                    {analysis.manualFormFit.fit === 'high' ? 'Close match' :
                     analysis.manualFormFit.fit === 'medium' ? 'Partial match' : 'Loose fit'}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Structure differs from this form
                </span>
              )}
            </div>
          )}

          {/* Form Requirements Checklist */}
          {analysis.activeForm && analysis.activeForm !== 'Free Verse' && (() => {
            const formToCheck = analysis.activeForm;
            const constraints = getFormConstraints(formToCheck);
            const poemData = {
              lineCount: analysis.nonEmptyLines,
              fitScore: analysis.manualFormFit?.fitScore || analysis.poeticForm.fitScore,
              fit: analysis.manualFormFit?.fit || analysis.poeticForm.fit
            };

            const checklistItems: Array<{aspect: keyof typeof constraints, label: string}> = [];

            if (constraints.lineCount) checklistItems.push({ aspect: 'lineCount', label: 'Line count' });
            if (constraints.meter) checklistItems.push({ aspect: 'meter', label: 'Meter' });
            if (constraints.syllablePattern) checklistItems.push({ aspect: 'syllablePattern', label: 'Syllable pattern' });
            if (constraints.rhymeScheme) checklistItems.push({ aspect: 'rhymeScheme', label: 'Rhyme scheme' });
            if (constraints.stanzaStructure) checklistItems.push({ aspect: 'stanzaStructure', label: 'Stanza structure' });

            if (checklistItems.length === 0) return null;

            return (
              <div className="form-requirements-checklist">
                {checklistItems.map(item => {
                  const status = evaluateConstraint(formToCheck, item.aspect, poemData);
                  const icon = status === 'perfect' ? '✓' : status === 'good' ? '~' : '✗';
                  const description = getConstraintDescription(formToCheck, item.aspect);

                  return (
                    <div key={item.aspect} className="checklist-item" title={description || ''}>
                      <span className={`checklist-icon ${status}`}>{icon}</span>
                      <span className="checklist-label">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === 'rhythm' ? 'active' : ''}`}
          onClick={() => setActiveCategory('rhythm')}
        >
          Rhythm
        </button>
        <button
          className={`category-tab ${activeCategory === 'rhymes' ? 'active' : ''}`}
          onClick={() => setActiveCategory('rhymes')}
        >
          Rhymes
        </button>
        <button
          className={`category-tab ${activeCategory === 'style' ? 'active' : ''}`}
          onClick={() => setActiveCategory('style')}
        >
          Style
        </button>
        <button
          className={`category-tab ${activeCategory === 'originality' ? 'active' : ''}`}
          onClick={() => setActiveCategory('originality')}
        >
          Originality
        </button>
      </div>

      {/* Category content */}
      <div className="category-content">
        {activeCategory === 'rhythm' && (
          <>
            {syllablesSection}
            {scansionSection}
            {rhythmVariationSection}
            {stanzaStructureSection}
            {lineLengthSection}
            {punctuationSection}
          </>
        )}

        {activeCategory === 'rhymes' && (
          <>
            {rhymeSchemeSection}
            {rhymeAnalysisSection}
            {soundPatternsSection}
          </>
        )}

        {activeCategory === 'style' && (
          <>
            {repetitionSection}
            {posSection}
            {abstractConcreteSection}
            {adverbsSection}
            {passiveVoiceSection}
            {tenseConsistencySection}
          </>
        )}

        {activeCategory === 'originality' && (
          <>
            {firstDraftPhrasesSection}
            {clicheSection}
            {figurativeLanguageSection}
          </>
        )}
      </div>
    </div>
  );
}
