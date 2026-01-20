import React, { useState, useEffect } from 'react';
import './HelpTooltip.css';

interface HelpTooltipProps {
  title: string;
  content: string | React.ReactNode;
  learnMoreUrl?: string;
}

/**
 * HelpTooltip - An info icon that opens a modal dialog with explanatory content
 *
 * Used throughout the analysis panel to explain what each metric means
 * and how poets can use the information to improve their work.
 */
export function HelpTooltip({ title, content, learnMoreUrl }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        className="help-tooltip-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={`Learn about ${title}`}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </button>

      {isOpen && (
        <div className="help-modal-backdrop" onClick={handleBackdropClick}>
          <div className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
            <div className="help-modal-header">
              <h2 id="help-modal-title" className="help-modal-title">{title}</h2>
              <button
                className="help-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="help-modal-content">
              {content}
            </div>
            {learnMoreUrl && (
              <div className="help-modal-footer">
                <a
                  href={learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="help-modal-link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Learn more about {title.toLowerCase()}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Pre-defined help content for analysis features
export const HELP_CONTENT = {
  syllableCount: {
    title: 'Syllable Pattern',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Syllable',
    content: (
      <>
        <p>Shows the number of syllables per line. Consistent syllable counts create rhythm and flow.</p>
        <p><strong>Why it matters:</strong> Many poetic forms (haiku, sonnet, limerick) require specific syllable patterns. Even in free verse, varying line length creates emphasis and pacing.</p>
        <p><strong>Tips:</strong></p>
        <ul>
          <li>Longer lines feel expansive or rushed</li>
          <li>Shorter lines create pauses and emphasis</li>
          <li>Variation can be intentional for effect</li>
        </ul>
      </>
    )
  },

  rhymeScheme: {
    title: 'Rhyme Scheme',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Rhyme_scheme',
    content: (
      <>
        <p>Identifies end rhymes and maps them to letters (ABAB, AABB, etc.). Helps you see your poem's rhyme structure at a glance.</p>
        <p><strong>Common patterns:</strong></p>
        <ul>
          <li><strong>ABAB:</strong> Alternating rhymes (common in quatrains)</li>
          <li><strong>AABB:</strong> Couplets (pairs of rhyming lines)</li>
          <li><strong>ABBA:</strong> Enclosed rhyme (used in sonnets)</li>
          <li><strong>Free:</strong> No consistent pattern</li>
        </ul>
      </>
    )
  },

  meterAnalysis: {
    title: 'Meter & Rhythm',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Metre_(poetry)',
    content: (
      <>
        <p>Analyzes the stress patterns in your lines. Meter is the heartbeat of traditional poetry.</p>
        <p><strong>Common meters:</strong></p>
        <ul>
          <li><strong>Iambic:</strong> da-DUM (unstressed-stressed)</li>
          <li><strong>Trochaic:</strong> DUM-da (stressed-unstressed)</li>
          <li><strong>Anapestic:</strong> da-da-DUM</li>
          <li><strong>Dactylic:</strong> DUM-da-da</li>
        </ul>
        <p><strong>Why it matters:</strong> Consistent meter creates musicality. Breaking meter creates emphasis or surprise.</p>
      </>
    )
  },

  soundPatterns: {
    title: 'Sound Devices',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Sound_symbolism',
    content: (
      <>
        <p>Detects alliteration, assonance, and consonance—the musical elements beyond rhyme.</p>
        <p><strong>Types:</strong></p>
        <ul>
          <li><strong>Alliteration:</strong> Repeated consonant sounds at word beginnings ("Peter Piper picked...")</li>
          <li><strong>Assonance:</strong> Repeated vowel sounds ("The rain in Spain...")</li>
          <li><strong>Consonance:</strong> Repeated consonant sounds anywhere ("pitter patter")</li>
        </ul>
        <p><strong>Tips:</strong> Use sparingly for emphasis. Too much can feel forced.</p>
      </>
    )
  },

  poeticForm: {
    title: 'Poetic Form',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Poetry#Forms',
    content: (
      <>
        <p>Attempts to identify if your poem matches a traditional form based on structure, rhyme, and meter.</p>
        <p><strong>Detected forms include:</strong></p>
        <ul>
          <li>Sonnet (14 lines, specific rhyme schemes)</li>
          <li>Haiku (5-7-5 syllables)</li>
          <li>Limerick (AABBA rhyme)</li>
          <li>Villanelle (19 lines with refrains)</li>
          <li>Free Verse (no fixed form)</li>
        </ul>
        <p><strong>Note:</strong> You can override auto-detection if writing in a specific form.</p>
      </>
    )
  },

  adverbUsage: {
    title: 'Adverb + Verb Combinations',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Adverb',
    content: (
      <>
        <p>Identifies where adverbs modify verbs. While sometimes necessary, adverbs often signal that a stronger verb could be used.</p>
        <p><strong>The "show don't tell" principle:</strong></p>
        <ul>
          <li>"She walked slowly" → "She ambled" or "She crept"</li>
          <li>"He said angrily" → "He snapped" or "He growled"</li>
        </ul>
        <p><strong>When adverbs work:</strong></p>
        <ul>
          <li>When no single verb captures the meaning</li>
          <li>For rhythm or emphasis</li>
          <li>In dialogue for characterization</li>
        </ul>
      </>
    )
  },

  passiveVoice: {
    title: 'Active vs. Passive Language',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Passive_voice',
    content: (
      <>
        <p>Detects passive voice constructions ("was seen" vs "saw"). Active voice is generally more direct and vivid.</p>
        <p><strong>Active vs Passive:</strong></p>
        <ul>
          <li>Active: "The wind bent the trees"</li>
          <li>Passive: "The trees were bent by the wind"</li>
        </ul>
        <p><strong>When passive works:</strong></p>
        <ul>
          <li>When the action matters more than the actor</li>
          <li>For mystery or distance: "She was taken"</li>
          <li>To vary sentence rhythm</li>
        </ul>
        <p><strong>Tip:</strong> Passive isn't wrong—just be intentional about when you use it.</p>
      </>
    )
  },

  repetition: {
    title: 'Word Repetition',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Repetition_(rhetorical_device)',
    content: (
      <>
        <p>Shows which words appear multiple times in your poem. Repetition can be a powerful device or an unintentional distraction.</p>
        <p><strong>Intentional repetition:</strong></p>
        <ul>
          <li>Creates emphasis and rhythm</li>
          <li>Builds thematic connections</li>
          <li>Forms refrains or anaphora</li>
        </ul>
        <p><strong>Watch for:</strong></p>
        <ul>
          <li>Unintentional echoes that feel awkward</li>
          <li>Overused words that could have synonyms</li>
          <li>Articles and pronouns don't count as issues</li>
        </ul>
      </>
    )
  },

  tenseConsistency: {
    title: 'Tense Consistency',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Grammatical_tense',
    content: (
      <>
        <p>Analyzes verb tenses throughout your poem. Most poems maintain consistent tense, though shifts can be intentional.</p>
        <p><strong>Why it matters:</strong></p>
        <ul>
          <li>Present tense creates immediacy</li>
          <li>Past tense creates reflection or narrative distance</li>
          <li>Unintentional shifts can confuse readers</li>
        </ul>
        <p><strong>When shifts work:</strong></p>
        <ul>
          <li>Moving between memory and present moment</li>
          <li>Contrasting then and now</li>
          <li>Creating dramatic effect</li>
        </ul>
      </>
    )
  },

  clicheDetection: {
    title: 'Cliché Detection',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Clich%C3%A9',
    content: (
      <>
        <p>Identifies overused phrases that may weaken your poem's originality.</p>
        <p><strong>Why clichés matter:</strong></p>
        <ul>
          <li>They signal lazy or unoriginal thinking</li>
          <li>Readers' minds glaze over familiar phrases</li>
          <li>Fresh language creates vivid images</li>
        </ul>
        <p><strong>Options when you find one:</strong></p>
        <ul>
          <li>Replace with original imagery</li>
          <li>Subvert or twist the cliché</li>
          <li>Keep if intentionally ironic</li>
        </ul>
      </>
    )
  },

  rhymeOriginality: {
    title: 'Rhyme Originality',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Rhyme',
    content: (
      <>
        <p>Scores how original your rhyme pairs are. Some rhymes (love/above, heart/apart) are very common in poetry.</p>
        <p><strong>High originality:</strong> Unexpected, fresh rhyme pairs</p>
        <p><strong>Low originality:</strong> Very common, predictable pairings</p>
        <p><strong>Tips for fresher rhymes:</strong></p>
        <ul>
          <li>Use slant/near rhymes instead of perfect rhymes</li>
          <li>Rhyme on unexpected syllables</li>
          <li>Let meaning drive word choice, not just sound</li>
        </ul>
      </>
    )
  },

  figurativeLanguage: {
    title: 'Figurative Language',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Figure_of_speech',
    content: (
      <>
        <p>Detects similes, metaphors, personification, and other figures of speech in your poem.</p>
        <p><strong>Common figures:</strong></p>
        <ul>
          <li><strong>Simile:</strong> Comparison using "like" or "as"</li>
          <li><strong>Metaphor:</strong> Direct comparison (A is B)</li>
          <li><strong>Personification:</strong> Giving human traits to non-human things</li>
        </ul>
        <p><strong>Why it matters:</strong> Figurative language creates vivid imagery and emotional resonance. Too little can feel flat; too much can overwhelm.</p>
      </>
    )
  },

  lineLength: {
    title: 'Line Length (Words)',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Line_(poetry)',
    content: (
      <>
        <p>Shows the word count per line and overall distribution.</p>
        <p><strong>Why word count matters:</strong></p>
        <ul>
          <li>Short lines (1-3 words) create emphasis and staccato rhythm</li>
          <li>Medium lines (4-7 words) feel natural and conversational</li>
          <li>Long lines (8+ words) create flow and can feel breathless</li>
        </ul>
        <p><strong>Tip:</strong> Look for patterns—are your key lines shorter or longer than average? This often reveals where emphasis naturally falls.</p>
      </>
    )
  },

  stanzaStructure: {
    title: 'Stanza Structure',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Stanza',
    content: (
      <>
        <p>Analyzes the organization of your poem into stanzas (verse paragraphs).</p>
        <p><strong>Common stanza types:</strong></p>
        <ul>
          <li><strong>Couplet:</strong> 2 lines</li>
          <li><strong>Tercet:</strong> 3 lines</li>
          <li><strong>Quatrain:</strong> 4 lines (most common)</li>
          <li><strong>Sestet:</strong> 6 lines</li>
          <li><strong>Octave:</strong> 8 lines</li>
        </ul>
        <p><strong>Why it matters:</strong> Stanza breaks create visual and rhythmic pauses. Consistent stanza lengths create formal structure; varying lengths can signal shifts in thought or tone.</p>
      </>
    )
  },

  punctuation: {
    title: 'Flow & Punctuation',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Enjambment',
    content: (
      <>
        <p>Analyzes how punctuation affects the flow and pacing of your poem.</p>
        <p><strong>Key concepts:</strong></p>
        <ul>
          <li><strong>End-stopped:</strong> Lines ending with punctuation—create pause</li>
          <li><strong>Enjambed:</strong> Sentences flowing across line breaks—create momentum</li>
          <li><strong>Caesura:</strong> Mid-line punctuation—creates internal pause</li>
        </ul>
        <p><strong>Why it matters:</strong> Punctuation controls how readers breathe through your poem. Heavy punctuation slows reading; minimal punctuation speeds it up.</p>
      </>
    )
  },

  enjambment: {
    title: 'Enjambment & End-Stops',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Enjambment',
    content: (
      <>
        <p>Analyzes where sentences and phrases break across lines.</p>
        <p><strong>Enjambment:</strong> When a sentence continues past the line break without punctuation. Creates flow and momentum.</p>
        <p><strong>End-stop:</strong> When a line ends with punctuation. Creates pause and finality.</p>
        <p><strong>Tips:</strong></p>
        <ul>
          <li>Enjambment creates momentum and surprise</li>
          <li>End-stops create clarity and pause</li>
          <li>Mix both for rhythmic variety</li>
        </ul>
      </>
    )
  },

  wordTypes: {
    title: 'Word Types',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Part_of_speech',
    content: (
      <>
        <p>Shows the distribution of parts of speech (nouns, verbs, adjectives, etc.) in your poem.</p>
        <p><strong>What to watch for:</strong></p>
        <ul>
          <li><strong>Adverbs &gt;10%:</strong> May indicate weak verb choices</li>
          <li><strong>Adjectives &gt;25%:</strong> Could feel over-descriptive</li>
          <li><strong>Pronouns &gt;20%:</strong> May reduce concreteness</li>
        </ul>
        <p><strong>Tip:</strong> Hover over each type to highlight those words in your poem.</p>
      </>
    )
  },

  doubleAdverbs: {
    title: 'Double Adverbs',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Adverb#Adverbs_of_degree',
    content: (
      <>
        <p>Detects when two adverbs modify the same verb (e.g., "very quickly ran").</p>
        <p><strong>Why it matters:</strong></p>
        <ul>
          <li>Each adverb dilutes the impact of the other</li>
          <li>Usually one strong verb is better than a weak verb + two adverbs</li>
        </ul>
        <p><strong>Example:</strong> "She very slowly walked" → "She crept" or "She ambled"</p>
      </>
    )
  },

  scansion: {
    title: 'Scansion (Stress Patterns)',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Scansion',
    content: (
      <>
        <p>Shows the pattern of stressed (/) and unstressed (u) syllables in each line.</p>
        <p><strong>Reading the pattern:</strong></p>
        <ul>
          <li><strong>/</strong> = stressed syllable (emphasis)</li>
          <li><strong>u</strong> = unstressed syllable (lighter)</li>
        </ul>
        <p><strong>Common meters:</strong></p>
        <ul>
          <li><strong>Iambic pentameter:</strong> u/u/u/u/u/ (5 da-DUMs)</li>
          <li><strong>Trochaic:</strong> /u/u/u (DUM-da pattern)</li>
        </ul>
        <p><strong>Tip:</strong> Click "Show Stress" to see stressed syllables highlighted in the editor.</p>
      </>
    )
  },

  abstractConcrete: {
    title: 'Abstract vs Concrete',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Imagery_(literature)',
    content: (
      <>
        <p>Measures the balance between abstract concepts and concrete, sensory language.</p>
        <p><strong>Abstract words:</strong> love, truth, freedom, happiness—ideas you can't touch</p>
        <p><strong>Concrete words:</strong> stone, whisper, crimson, velvet—things you can sense</p>
        <p><strong>Why it matters:</strong></p>
        <ul>
          <li>Concrete language creates vivid imagery</li>
          <li>Too much abstraction feels vague or preachy</li>
          <li>Best poems ground abstractions in concrete details</li>
        </ul>
        <p><strong>Tip:</strong> If abstract-heavy, try showing emotions through physical details.</p>
      </>
    )
  },

  firstDraftPhrases: {
    title: 'First Draft Phrases',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Filler_(linguistics)',
    content: (
      <>
        <p>Identifies filler words and weak constructions that often appear in first drafts.</p>
        <p><strong>Types detected:</strong></p>
        <ul>
          <li><strong>Intensifiers:</strong> very, really, quite—often weaken rather than strengthen</li>
          <li><strong>Hedges:</strong> maybe, perhaps, somewhat—show uncertainty</li>
          <li><strong>Fillers:</strong> I think, there is, basically—add words without meaning</li>
          <li><strong>Weak verbs:</strong> started to, began to—delay the action</li>
        </ul>
        <p><strong>Tip:</strong> Try cutting these words entirely—often the sentence is stronger without them.</p>
      </>
    )
  },

  deadMetaphors: {
    title: 'Dead Metaphors',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Dead_metaphor',
    content: (
      <>
        <p>Finds metaphors so common that readers no longer "see" the comparison.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>"Heart of gold" (heart ≠ actually gold)</li>
          <li>"Time flies" (time doesn't have wings)</li>
          <li>"Foot of the mountain" (mountains don't have feet)</li>
        </ul>
        <p><strong>Why they matter:</strong> Dead metaphors are invisible—they don't create imagery. Live metaphors make readers see something new.</p>
        <p><strong>Options:</strong></p>
        <ul>
          <li>Resurrect it: extend or twist the metaphor</li>
          <li>Replace it: find a fresh comparison</li>
          <li>Keep it: if the cliché serves a purpose</li>
        </ul>
      </>
    )
  },

  rhythmVariation: {
    title: 'Rhythm Variation',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Rhythm',
    content: (
      <>
        <p>Measures how much your line lengths vary throughout the poem.</p>
        <p><strong>High variation:</strong> Lines differ significantly in syllable count</p>
        <p><strong>Low variation:</strong> Lines are consistent in length</p>
        <p><strong>Neither is wrong:</strong></p>
        <ul>
          <li>Formal poetry often has consistent line lengths</li>
          <li>Free verse uses variation for emphasis</li>
          <li>Even in formal poetry, variation can highlight key moments</li>
        </ul>
      </>
    )
  },

  internalRhymes: {
    title: 'Internal Rhymes',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Internal_rhyme',
    content: (
      <>
        <p>Detects rhymes that occur within lines or across lines, not just at line endings.</p>
        <p><strong>Why they matter:</strong></p>
        <ul>
          <li>Add musical quality beyond end rhymes</li>
          <li>Create subtle connections between words</li>
          <li>Can be intentional or happy accidents</li>
        </ul>
        <p><strong>Example:</strong> "The rain in Spain falls mainly on the plain" has multiple internal rhymes.</p>
      </>
    )
  },

  rhymeOverview: {
    title: 'Rhyme Overview',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Rhyme',
    content: (
      <>
        <p>Groups all rhyming words together so you can see your rhyme pairs at a glance.</p>
        <p><strong>Quality indicators:</strong></p>
        <ul>
          <li><strong>Perfect:</strong> Exact sound match (moon/June)</li>
          <li><strong>Slant:</strong> Near rhyme (moon/stone)</li>
          <li><strong>Mixed:</strong> Group contains both types</li>
        </ul>
        <p><strong>Tip:</strong> Hover over a group to highlight all those rhyming words in your poem.</p>
      </>
    )
  }
};

export default HelpTooltip;
