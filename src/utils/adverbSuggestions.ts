/**
 * Adverb to Stronger Verb Suggestions
 *
 * Provides suggestions for replacing adverb + verb combinations with stronger single verbs
 */

import { WordInfo } from '../types';

export interface AdverbSuggestion {
  adverb: string;
  verb: string;
  lineIndex: number;
  suggestions: string[];
  source: 'local' | 'api';
  originalOrder: 'adverb-verb' | 'verb-adverb'; // Track original word order in text
}

export interface DoubleAdverbInstance {
  adverb1: string;
  adverb2: string;
  verb: string;
  lineIndex: number;
  fullPhrase: string;
}

/**
 * Curated local dictionary of common adverb + verb patterns
 * Format: "adverb verb" -> ["suggestion1", "suggestion2", ...]
 */
const CURATED_SUGGESTIONS: Record<string, string[]> = {
  // Movement verbs
  'quickly run': ['sprint', 'dash', 'race', 'bolt'],
  'quickly ran': ['sprinted', 'dashed', 'raced', 'bolted'],
  'slowly walk': ['stroll', 'amble', 'saunter', 'meander'],
  'slowly walked': ['strolled', 'ambled', 'sauntered', 'meandered'],
  'quietly walk': ['tiptoe', 'creep', 'sneak', 'pad'],
  'quietly walked': ['tiptoed', 'crept', 'sneaked', 'padded'],
  'quickly move': ['dart', 'rush', 'hurry', 'hasten'],
  'quickly moved': ['darted', 'rushed', 'hurried', 'hastened'],

  // Speech verbs
  'softly speak': ['whisper', 'murmur', 'mumble'],
  'softly spoke': ['whispered', 'murmured', 'mumbled'],
  'quietly speak': ['whisper', 'murmur'],
  'quietly spoke': ['whispered', 'murmured'],
  'loudly speak': ['shout', 'yell', 'bellow', 'holler'],
  'loudly spoke': ['shouted', 'yelled', 'bellowed', 'hollered'],
  'angrily say': ['snap', 'snarl', 'bark', 'growl'],
  'angrily said': ['snapped', 'snarled', 'barked', 'growled'],
  'happily say': ['chirp', 'gush', 'exclaim'],
  'happily said': ['chirped', 'gushed', 'exclaimed'],

  // Looking/seeing verbs
  'quickly look': ['glance', 'glimpse', 'peek'],
  'quickly looked': ['glanced', 'glimpsed', 'peeked'],
  'carefully look': ['examine', 'inspect', 'scrutinize', 'study'],
  'carefully looked': ['examined', 'inspected', 'scrutinized', 'studied'],
  'intensely stare': ['glare', 'gaze', 'peer'],
  'intensely stared': ['glared', 'gazed', 'peered'],

  // Eating/drinking verbs
  'quickly eat': ['devour', 'gobble', 'wolf down'],
  'quickly ate': ['devoured', 'gobbled', 'wolfed down'],
  'slowly eat': ['savor', 'nibble', 'pick at'],
  'slowly ate': ['savored', 'nibbled', 'picked at'],
  'quickly drink': ['gulp', 'guzzle', 'chug'],
  'quickly drank': ['gulped', 'guzzled', 'chugged'],
  'slowly drink': ['sip', 'nurse'],
  'slowly drank': ['sipped', 'nursed'],

  // Action verbs
  'gently touch': ['caress', 'stroke', 'brush'],
  'gently touched': ['caressed', 'stroked', 'brushed'],
  'firmly hold': ['grip', 'grasp', 'clutch'],
  'firmly held': ['gripped', 'grasped', 'clutched'],
  'tightly hold': ['clench', 'squeeze', 'clutch'],
  'tightly held': ['clenched', 'squeezed', 'clutched'],
  'suddenly stop': ['halt', 'freeze', 'brake'],
  'suddenly stopped': ['halted', 'froze', 'braked'],

  // Emotional/reaction verbs
  'quietly cry': ['weep', 'sob'],
  'quietly cried': ['wept', 'sobbed'],
  'loudly cry': ['wail', 'howl', 'bawl'],
  'loudly cried': ['wailed', 'howled', 'bawled'],
  'softly laugh': ['chuckle', 'giggle', 'snicker'],
  'softly laughed': ['chuckled', 'giggled', 'snickered'],
  'loudly laugh': ['guffaw', 'roar', 'cackle'],
  'loudly laughed': ['guffawed', 'roared', 'cackled'],

  // Additional movement verbs
  'slowly move': ['drift', 'glide', 'crawl', 'shuffle'],
  'slowly moved': ['drifted', 'glided', 'crawled', 'shuffled'],
  'carefully walk': ['tread', 'step', 'pace'],
  'carefully walked': ['trod', 'stepped', 'paced'],
  'heavily walk': ['trudge', 'plod', 'lumber', 'stomp'],
  'heavily walked': ['trudged', 'plodded', 'lumbered', 'stomped'],
  'gracefully move': ['glide', 'float', 'sail', 'flow'],
  'gracefully moved': ['glided', 'floated', 'sailed', 'flowed'],
  'awkwardly move': ['stumble', 'lurch', 'stagger', 'fumble'],
  'awkwardly moved': ['stumbled', 'lurched', 'staggered', 'fumbled'],
  'swiftly move': ['dart', 'flash', 'zip', 'whiz'],
  'swiftly moved': ['darted', 'flashed', 'zipped', 'whizzed'],
  'slowly climb': ['scale', 'ascend', 'clamber'],
  'slowly climbed': ['scaled', 'ascended', 'clambered'],
  'quickly jump': ['leap', 'bound', 'vault', 'spring'],
  'quickly jumped': ['leaped', 'bounded', 'vaulted', 'sprang'],
  'carefully enter': ['tiptoe', 'slip', 'steal'],
  'carefully entered': ['tiptoed', 'slipped', 'stole'],
  'quietly enter': ['slip', 'sneak', 'steal'],
  'quietly entered': ['slipped', 'sneaked', 'stole'],
  'suddenly appear': ['emerge', 'materialize', 'surface'],
  'suddenly appeared': ['emerged', 'materialized', 'surfaced'],
  'slowly disappear': ['fade', 'dissolve', 'vanish'],
  'slowly disappeared': ['faded', 'dissolved', 'vanished'],

  // Additional speech verbs
  'quietly say': ['whisper', 'murmur', 'mutter'],
  'quietly said': ['whispered', 'murmured', 'muttered'],
  'loudly say': ['shout', 'yell', 'bellow', 'roar'],
  'loudly said': ['shouted', 'yelled', 'bellowed', 'roared'],
  'angrily speak': ['snap', 'snarl', 'bark', 'hiss'],
  'angrily spoke': ['snapped', 'snarled', 'barked', 'hissed'],
  'happily speak': ['chirp', 'gush', 'beam'],
  'happily spoke': ['chirped', 'gushed', 'beamed'],
  'sadly say': ['lament', 'mourn', 'sigh'],
  'sadly said': ['lamented', 'mourned', 'sighed'],
  'nervously speak': ['stammer', 'stutter', 'falter'],
  'nervously spoke': ['stammered', 'stuttered', 'faltered'],
  'confidently speak': ['declare', 'proclaim', 'announce'],
  'confidently spoke': ['declared', 'proclaimed', 'announced'],
  'softly whisper': ['breathe', 'sigh'],
  'softly whispered': ['breathed', 'sighed'],
  'quietly whisper': ['murmur', 'breathe'],
  'quietly whispered': ['murmured', 'breathed'],
  'sharply say': ['snap', 'retort', 'bark'],
  'sharply said': ['snapped', 'retorted', 'barked'],
  'sweetly say': ['coo', 'purr', 'croon'],
  'sweetly said': ['cooed', 'purred', 'crooned'],
  'bitterly say': ['snarl', 'hiss', 'spit'],
  'bitterly said': ['snarled', 'hissed', 'spat'],
  'gently say': ['whisper', 'murmur', 'breathe'],
  'gently said': ['whispered', 'murmured', 'breathed'],

  // Additional looking/seeing verbs
  'briefly look': ['glance', 'peek', 'glimpse'],
  'briefly looked': ['glanced', 'peeked', 'glimpsed'],
  'intensely look': ['stare', 'gaze', 'peer'],
  'intensely looked': ['stared', 'gazed', 'peered'],
  'angrily stare': ['glare', 'glower', 'scowl'],
  'angrily stared': ['glared', 'glowered', 'scowled'],
  'lovingly gaze': ['admire', 'adore', 'behold'],
  'lovingly gazed': ['admired', 'adored', 'beheld'],
  'suspiciously watch': ['eye', 'monitor', 'observe'],
  'suspiciously watched': ['eyed', 'monitored', 'observed'],
  'closely watch': ['monitor', 'observe', 'scrutinize'],
  'closely watched': ['monitored', 'observed', 'scrutinized'],
  'carefully observe': ['study', 'examine', 'inspect'],
  'carefully observed': ['studied', 'examined', 'inspected'],
  'nervously glance': ['peek', 'peer'],
  'nervously glanced': ['peeked', 'peered'],

  // Additional action verbs
  'gently push': ['nudge', 'prod', 'ease'],
  'gently pushed': ['nudged', 'prodded', 'eased'],
  'roughly push': ['shove', 'thrust', 'ram'],
  'roughly pushed': ['shoved', 'thrust', 'rammed'],
  'tightly grip': ['clench', 'clutch', 'squeeze'],
  'tightly gripped': ['clenched', 'clutched', 'squeezed'],
  'lightly touch': ['brush', 'graze', 'skim'],
  'lightly touched': ['brushed', 'grazed', 'skimmed'],
  'softly kiss': ['peck', 'brush', 'graze'],
  'softly kissed': ['pecked', 'brushed', 'grazed'],
  'quickly grab': ['snatch', 'seize', 'clutch'],
  'quickly grabbed': ['snatched', 'seized', 'clutched'],
  'carefully place': ['position', 'set', 'arrange'],
  'carefully placed': ['positioned', 'set', 'arranged'],
  'gently close': ['shut', 'ease'],
  'gently closed': ['shut', 'eased'],
  'softly close': ['ease', 'shut'],
  'softly closed': ['eased', 'shut'],
  'loudly close': ['slam', 'bang'],
  'loudly closed': ['slammed', 'banged'],
  'quickly write': ['scrawl', 'scribble', 'jot'],
  'quickly wrote': ['scrawled', 'scribbled', 'jotted'],
  'carefully write': ['inscribe', 'pen', 'compose'],
  'carefully wrote': ['inscribed', 'penned', 'composed'],
  'slowly open': ['ease', 'pry'],
  'slowly opened': ['eased', 'pried'],
  'suddenly open': ['fling', 'throw', 'burst'],
  'suddenly opened': ['flung', 'threw', 'burst'],

  // Additional emotional verbs
  'deeply sigh': ['exhale', 'breathe'],
  'deeply sighed': ['exhaled', 'breathed'],
  'heavily sigh': ['groan', 'moan'],
  'heavily sighed': ['groaned', 'moaned'],
  'quietly weep': ['sob', 'sniffle'],
  'quietly wept': ['sobbed', 'sniffled'],
  'bitterly cry': ['sob', 'wail'],
  'bitterly cried': ['sobbed', 'wailed'],
  'nervously laugh': ['giggle', 'titter', 'chuckle'],
  'nervously laughed': ['giggled', 'tittered', 'chuckled'],
  'softly smile': ['grin', 'beam'],
  'softly smiled': ['grinned', 'beamed'],
  'broadly smile': ['grin', 'beam'],
  'broadly smiled': ['grinned', 'beamed'],
  'sadly smile': ['grimace', 'smirk'],
  'sadly smiled': ['grimaced', 'smirked'],

  // Breathing/physical state
  'heavily breathe': ['pant', 'gasp', 'wheeze'],
  'heavily breathed': ['panted', 'gasped', 'wheezed'],
  'deeply breathe': ['inhale', 'exhale'],
  'deeply breathed': ['inhaled', 'exhaled'],
  'quickly breathe': ['pant', 'gasp'],
  'quickly breathed': ['panted', 'gasped'],
  'quietly sleep': ['doze', 'slumber', 'nap'],
  'quietly slept': ['dozed', 'slumbered', 'napped'],
  'peacefully sleep': ['slumber', 'rest'],
  'peacefully slept': ['slumbered', 'rested'],

  // Thinking/mental verbs
  'carefully think': ['consider', 'contemplate', 'ponder'],
  'carefully thought': ['considered', 'contemplated', 'pondered'],
  'deeply think': ['ponder', 'contemplate', 'meditate'],
  'deeply thought': ['pondered', 'contemplated', 'meditated'],
  'quickly decide': ['resolve', 'determine'],
  'quickly decided': ['resolved', 'determined'],
  'slowly realize': ['comprehend', 'grasp', 'understand'],
  'slowly realized': ['comprehended', 'grasped', 'understood'],
  'suddenly understand': ['grasp', 'comprehend', 'realize'],
  'suddenly understood': ['grasped', 'comprehended', 'realized'],

  // Eating verbs
  'greedily eat': ['devour', 'gorge', 'consume'],
  'greedily ate': ['devoured', 'gorged', 'consumed'],
  'hungrily eat': ['devour', 'wolf', 'gobble'],
  'hungrily ate': ['devoured', 'wolfed', 'gobbled'],

  // Physical action verbs
  'violently shake': ['convulse', 'shudder', 'tremble'],
  'violently shook': ['convulsed', 'shuddered', 'trembled'],
  'forcefully push': ['shove', 'thrust', 'ram'],
  'forcefully pushed': ['shoved', 'thrust', 'rammed'],
  'gently shake': ['tremble', 'quiver', 'shiver'],
  'gently shook': ['trembled', 'quivered', 'shivered'],

  // Emotional/crying verbs
  'bitterly weep': ['sob', 'cry', 'mourn'],
  'bitterly wept': ['sobbed', 'cried', 'mourned'],

  // Work verbs
  'carefully work': ['labor', 'toil', 'craft'],
  'carefully worked': ['labored', 'toiled', 'crafted'],
  'diligently work': ['labor', 'toil', 'strive'],
  'diligently worked': ['labored', 'toiled', 'strived'],
  'hard work': ['labor', 'toil', 'slave'],
  'hard worked': ['labored', 'toiled', 'slaved'],
  'tirelessly work': ['labor', 'toil', 'persevere'],
  'tirelessly worked': ['labored', 'toiled', 'persevered'],

  // Completion verbs
  'quickly finish': ['complete', 'conclude', 'end'],
  'quickly finished': ['completed', 'concluded', 'ended'],
  'finally finish': ['complete', 'conclude'],
  'finally finished': ['completed', 'concluded'],

  // Building/creating verbs
  'slowly build': ['construct', 'assemble', 'erect'],
  'slowly built': ['constructed', 'assembled', 'erected'],
  'carefully build': ['construct', 'assemble', 'craft'],
  'carefully built': ['constructed', 'assembled', 'crafted'],
  'skillfully craft': ['fashion', 'create', 'forge'],
  'skillfully crafted': ['fashioned', 'created', 'forged'],

  // Choice verbs
  'wisely choose': ['select', 'pick', 'opt'],
  'wisely chose': ['selected', 'picked', 'opted'],
  'carefully choose': ['select', 'pick', 'consider'],
  'carefully chose': ['selected', 'picked', 'considered'],
  'quickly choose': ['select', 'pick', 'grab'],
  'quickly chose': ['selected', 'picked', 'grabbed'],

  // Fighting verbs
  'fiercely fight': ['battle', 'combat', 'clash'],
  'fiercely fought': ['battled', 'combated', 'clashed'],
  'bravely fight': ['battle', 'combat', 'resist'],
  'bravely fought': ['battled', 'combated', 'resisted'],

  // Waiting verbs
  'patiently wait': ['linger', 'endure', 'abide'],
  'patiently waited': ['lingered', 'endured', 'abided'],
  'anxiously wait': ['fret', 'worry', 'agonize'],
  'anxiously waited': ['fretted', 'worried', 'agonized'],

  // Searching verbs
  'frantically search': ['hunt', 'scour', 'rummage'],
  'frantically searched': ['hunted', 'scoured', 'rummaged'],
  'carefully search': ['examine', 'inspect', 'scrutinize'],
  'carefully searched': ['examined', 'inspected', 'scrutinized'],

  // Listening verbs
  'carefully listen': ['attend', 'heed', 'hearken'],
  'carefully listened': ['attended', 'heeded', 'hearkened'],
  'intently listen': ['heed', 'attend', 'concentrate'],
  'intently listened': ['heeded', 'attended', 'concentrated'],

  // Rising verbs
  'slowly rise': ['ascend', 'climb', 'mount'],
  'slowly rose': ['ascended', 'climbed', 'mounted'],
  'quickly rise': ['spring', 'leap', 'jump'],
  'quickly rose': ['sprang', 'leaped', 'jumped'],

  // Falling verbs
  'slowly fall': ['descend', 'sink', 'drop'],
  'slowly fell': ['descended', 'sank', 'dropped'],
  'suddenly fall': ['plunge', 'plummet', 'tumble'],
  'suddenly fell': ['plunged', 'plummeted', 'tumbled'],

  // Turning verbs
  'quickly turn': ['spin', 'whirl', 'pivot'],
  'quickly turned': ['spun', 'whirled', 'pivoted'],
  'slowly turn': ['rotate', 'revolve', 'swivel'],
  'slowly turned': ['rotated', 'revolved', 'swiveled'],
  'sharply turn': ['pivot', 'wheel', 'veer'],
  'sharply turned': ['pivoted', 'wheeled', 'veered'],

  // Feeling/emotional verbs
  'deeply feel': ['sense', 'experience', 'perceive'],
  'deeply felt': ['sensed', 'experienced', 'perceived'],
  'strongly feel': ['sense', 'believe', 'perceive'],
  'strongly felt': ['sensed', 'believed', 'perceived'],

  // Belief verbs
  'strongly believe': ['trust', 'maintain', 'insist'],
  'strongly believed': ['trusted', 'maintained', 'insisted'],
  'firmly believe': ['trust', 'maintain', 'hold'],
  'firmly believed': ['trusted', 'maintained', 'held'],

  // Love verbs
  'truly love': ['adore', 'cherish', 'treasure'],
  'truly loved': ['adored', 'cherished', 'treasured'],
  'deeply love': ['adore', 'cherish', 'treasure'],
  'deeply loved': ['adored', 'cherished', 'treasured'],
  'dearly love': ['cherish', 'treasure', 'adore'],
  'dearly loved': ['cherished', 'treasured', 'adored'],

  // Explanation verbs
  'clearly explain': ['clarify', 'elucidate', 'expound'],
  'clearly explained': ['clarified', 'elucidated', 'expounded'],
  'carefully explain': ['clarify', 'detail', 'describe'],
  'carefully explained': ['clarified', 'detailed', 'described'],
  'briefly explain': ['summarize', 'outline', 'sketch'],
  'briefly explained': ['summarized', 'outlined', 'sketched'],

  // Mention verbs
  'briefly mention': ['note', 'cite', 'reference'],
  'briefly mentioned': ['noted', 'cited', 'referenced'],
  'casually mention': ['note', 'remark', 'observe'],
  'casually mentioned': ['noted', 'remarked', 'observed'],

  // Announce verbs
  'loudly announce': ['proclaim', 'declare', 'herald'],
  'loudly announced': ['proclaimed', 'declared', 'heralded'],
  'proudly announce': ['proclaim', 'declare', 'trumpet'],
  'proudly announced': ['proclaimed', 'declared', 'trumpeted'],

  // Shout verbs
  'angrily shout': ['roar', 'bellow', 'thunder'],
  'angrily shouted': ['roared', 'bellowed', 'thundered'],
  'excitedly shout': ['exclaim', 'cry', 'yell'],
  'excitedly shouted': ['exclaimed', 'cried', 'yelled'],

  // Resting verbs
  'quietly rest': ['repose', 'recline', 'relax'],
  'quietly rested': ['reposed', 'reclined', 'relaxed'],
  'peacefully rest': ['repose', 'recline'],
  'peacefully rested': ['reposed', 'reclined'],

  // Sitting verbs
  'comfortably sit': ['recline', 'lounge', 'nestle'],
  'comfortably sat': ['reclined', 'lounged', 'nestled'],
  'quietly sit': ['perch', 'settle', 'rest'],
  'quietly sat': ['perched', 'settled', 'rested'],
  'patiently sit': ['wait', 'remain', 'stay'],
  'patiently sat': ['waited', 'remained', 'stayed'],
};

/**
 * Detect adverb + verb patterns in the text
 */
export function detectAdverbVerbPairs(words: WordInfo[]): Array<{
  adverb: WordInfo;
  verb: WordInfo;
  lineIndex: number;
  originalOrder: 'adverb-verb' | 'verb-adverb';
}> {
  const pairs: Array<{ adverb: WordInfo; verb: WordInfo; lineIndex: number; originalOrder: 'adverb-verb' | 'verb-adverb' }> = [];

  // Adverbs that rarely form meaningful adverb+verb combinations
  const excludeAdverbs = new Set([
    'then', 'when', 'where', 'there', 'here', 'now',
    'also', 'too', 'very', 'just', 'only', 'even',
    'already', 'yet', 'still', 'always', 'never',
    'maybe', 'perhaps', 'possibly', 'probably',
  ]);

  // Words often tagged as verbs but rarely work as action verbs in adverb+verb patterns
  const excludeVerbs = new Set([
    'silence', 'quiet', 'peace', 'rest', 'calm',
    'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did',
  ]);

  for (let i = 0; i < words.length - 1; i++) {
    const current = words[i];
    const next = words[i + 1];

    // Check pattern 1: adverb + verb (e.g., "quickly ran")
    if (current.pos === 'Adverb' && next.pos === 'Verb') {
      const adverbLower = current.word.toLowerCase();
      const verbLower = next.word.toLowerCase();

      // Skip problematic combinations
      if (excludeAdverbs.has(adverbLower) || excludeVerbs.has(verbLower)) {
        continue;
      }

      pairs.push({
        adverb: current,
        verb: next,
        lineIndex: current.lineIndex,
        originalOrder: 'adverb-verb' as const,
      });
    }

    // Check pattern 2: verb + adverb (e.g., "ran quickly", "walked slowly")
    if (current.pos === 'Verb' && next.pos === 'Adverb') {
      const adverbLower = next.word.toLowerCase();
      const verbLower = current.word.toLowerCase();

      // Skip problematic combinations
      if (excludeAdverbs.has(adverbLower) || excludeVerbs.has(verbLower)) {
        continue;
      }

      pairs.push({
        adverb: next,
        verb: current,
        lineIndex: current.lineIndex,
        originalOrder: 'verb-adverb' as const,
      });
    }
  }

  return pairs;
}

/**
 * Get suggestions from local curated dictionary
 */
function getLocalSuggestions(adverb: string, verb: string): string[] | null {
  const key = `${adverb.toLowerCase()} ${verb.toLowerCase()}`;
  return CURATED_SUGGESTIONS[key] || null;
}

/**
 * Filter out non-verbs and questionable suggestions
 */
function filterNonVerbs(suggestions: string[]): string[] {
  // Words to exclude (common nouns, adjectives, adverbs, and non-verbs)
  const excludeWords = new Set([
    // Nouns (often returned incorrectly by API)
    'silence', 'stillness', 'quiet', 'peace', 'eyes', 'enunciation',
    'utterance', 'trance', 'skewness', 'confines', 'capsule', 'pronouncement',
    'lovey', 'sleeper', 'rest', 'duration', 'sphinx', 'floor', 'breath',
    'mirage', 'future', 'balance', 'nato', 'bye', 'freyr', 'rust',
    'trumpeter', 'earthquake', 'tremor', 'pathogen', 'hurst', 'oration',
    'acrid', 'drone', 'grunt', 'bones', 'artifice', 'daedal', 'discretion',
    'wily', 'finesse', 'ache', 'awe', 'cold', 'crave', 'apologia', 'apology',
    'tenet', 'tough', 'precious', 'dear', 'clever', 'that', 'clarified',
    'contact', 'impress', 'carriage', 'trumpet', 'chide', 'clash', 'easily',
    'easy',
    // Adjectives/Adverbs (not action verbs)
    'slowly', 'quickly', 'quietly', 'loudly', 'softly',
    'alas', 'unfortunately', 'afraid', 'jealous', 'wary',
    'cynic', 'cool', 'devoted', 'lovely', 'afloat', 'askance',
    'pronounced', 'adverb', 'alack', 'wistful',
    'still', 'stilled', 'acquiescent', 'aground',
    'lower', 'silent', 'soundless', 'noiseless', 'silently',
    'intense', 'better', 'enough', 'even', 'ever',
    'beyond', 'concluded',
    // Generic/weak verbs and problematic words
    'past', 'take', 'tell', 'been', 'lie', 'rely', 'slow',
    'do', 'make', 'have', 'get', 'acquiesce', 'imagine',
    // Multi-word phrases
    'wrap up', 'finish with', 'skew',
  ]);

  return suggestions.filter(word => {
    const lower = word.toLowerCase();

    // Exclude words in our blacklist
    if (excludeWords.has(lower)) {
      return false;
    }

    // Exclude multi-word suggestions (phrases with spaces)
    if (word.includes(' ')) {
      return false;
    }

    // Exclude gerunds (words ending in -ing) - they're usually not what we want
    if (word.endsWith('ing')) {
      return false;
    }

    return true;
  });
}

/**
 * Fetch suggestions from Datamuse API
 * Query for words that mean the same as "adverb verb"
 */
async function fetchDatamuseSuggestions(adverb: string, verb: string): Promise<string[]> {
  try {
    // Datamuse API endpoint for "means like" queries
    const query = `${adverb} ${verb}`;
    const response = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(query)}&max=10`
    );

    if (!response.ok) {
      console.warn('Datamuse API request failed:', response.status);
      return [];
    }

    const data = await response.json();

    // Extract word suggestions and filter
    const raw = data.slice(0, 10).map((item: { word: string }) => item.word);
    const filtered = filterNonVerbs(raw);

    // Return up to 5 filtered suggestions
    return filtered.slice(0, 5);
  } catch (error) {
    console.warn('Error fetching Datamuse suggestions:', error);
    return [];
  }
}

/**
 * Get suggestions for an adverb + verb pair
 * Only returns high-quality curated suggestions from local dictionary
 * API fallback disabled to ensure quality
 */
export async function getSuggestionsForPair(
  adverb: string,
  verb: string
): Promise<AdverbSuggestion> {
  // Try local dictionary first
  const localSuggestions = getLocalSuggestions(adverb, verb);

  if (localSuggestions && localSuggestions.length > 0) {
    return {
      adverb,
      verb,
      lineIndex: -1, // Will be set by caller
      suggestions: localSuggestions,
      source: 'local',
      originalOrder: 'adverb-verb', // Will be overwritten by caller
    };
  }

  // Return empty suggestions if not in curated dictionary
  // This ensures we only show high-quality, vetted alternatives
  return {
    adverb,
    verb,
    lineIndex: -1,
    suggestions: [],
    source: 'local',
    originalOrder: 'adverb-verb', // Will be overwritten by caller
  };
}

/**
 * Detect when TWO adverbs modify one verb (e.g., "very quickly ran")
 */
export function detectDoubleAdverbs(words: WordInfo[]): DoubleAdverbInstance[] {
  const instances: DoubleAdverbInstance[] = [];

  // Temporal/conjunctive adverbs that don't count as "modifying" adverbs
  // These are typically used for timing or sequencing, not modifying the verb's manner
  const excludeAdverbs = new Set([
    'then', 'when', 'where', 'there', 'here', 'now',
    'also', 'too', 'just', 'only', 'even',
    'already', 'yet', 'still', 'always', 'never',
    'maybe', 'perhaps', 'possibly', 'probably',
    'however', 'therefore', 'thus', 'hence', 'moreover',
    'furthermore', 'nevertheless', 'nonetheless', 'meanwhile',
    'first', 'second', 'finally', 'next', 'soon',
    'before', 'after', 'later', 'earlier', 'recently',
  ]);

  // Verbs that shouldn't be flagged (state-of-being, modal helpers, etc.)
  const excludeVerbs = new Set([
    'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'might', 'may', 'must',
  ]);

  // Helper function to check if a word ends a sentence (has punctuation)
  const hasSentenceEndingPunctuation = (word: string): boolean => {
    return /[.!?;]$/.test(word);
  };

  for (let i = 0; i < words.length - 2; i++) {
    const first = words[i];
    const second = words[i + 1];
    const third = words[i + 2];

    // Skip if there's sentence-ending punctuation between words
    // (we only care about adjacent words within the same sentence)
    if (hasSentenceEndingPunctuation(first.word) || hasSentenceEndingPunctuation(second.word)) {
      continue;
    }

    // Check if we have adverb + adverb + verb pattern
    // Note: This works across line breaks since we're iterating through the flat words array
    if (first.pos === 'Adverb' && second.pos === 'Adverb' && third.pos === 'Verb') {
      const adverb1Lower = first.word.toLowerCase();
      const adverb2Lower = second.word.toLowerCase();
      const verbLower = third.word.toLowerCase();

      // Skip if either adverb is a temporal/conjunctive adverb
      if (excludeAdverbs.has(adverb1Lower) || excludeAdverbs.has(adverb2Lower)) {
        continue;
      }

      // Skip if verb is a helper/modal/state-of-being verb
      if (excludeVerbs.has(verbLower)) {
        continue;
      }

      // Only flag if both adverbs are manner adverbs (ending in -ly is a good heuristic)
      const firstIsMannerAdverb = adverb1Lower.endsWith('ly');
      const secondIsMannerAdverb = adverb2Lower.endsWith('ly');

      // Only flag if at least one is a manner adverb (ending in -ly)
      // This catches patterns like "very quickly", "really slowly", "extremely carefully"
      if (firstIsMannerAdverb || secondIsMannerAdverb) {
        instances.push({
          adverb1: first.word,
          adverb2: second.word,
          verb: third.word,
          lineIndex: first.lineIndex,
          fullPhrase: `${first.word} ${second.word} ${third.word}`,
        });
      }
    }
  }

  return instances;
}

/**
 * Preload all suggestions for detected adverb + verb pairs
 */
export async function preloadAllSuggestions(
  words: WordInfo[]
): Promise<Map<string, AdverbSuggestion>> {
  const pairs = detectAdverbVerbPairs(words);
  const suggestionsMap = new Map<string, AdverbSuggestion>();

  // Fetch all suggestions in parallel
  const promises = pairs.map(async ({ adverb, verb, lineIndex, originalOrder }) => {
    const key = `${adverb.word.toLowerCase()}_${verb.word.toLowerCase()}_${lineIndex}`;
    const suggestion = await getSuggestionsForPair(adverb.word, verb.word);
    suggestion.lineIndex = lineIndex;
    suggestion.originalOrder = originalOrder;
    suggestionsMap.set(key, suggestion);
  });

  await Promise.all(promises);

  return suggestionsMap;
}
