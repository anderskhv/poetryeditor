// Poem data structure for analysis pages
export interface PoemAnalysis {
  slug: string;
  title: string;
  poet: string;
  poetBirth: number;
  poetDeath: number;
  year: number;
  collection?: string;
  text: string;
  form: string;
  analysis: {
    overview: string;
    lineByLine: Array<{
      lines: string; // e.g., "1-4" or "5"
      commentary: string;
    }>;
    themes: string[];
    literaryDevices: Array<{
      device: string;
      example: string;
      explanation: string;
    }>;
    historicalContext?: string;
  };
  seoDescription: string;
  // Optional fields for internal linking (SEO)
  abstractWords?: string[]; // Abstract words that can link to /synonyms/:word
  rhymingPairs?: Array<{ word1: string; word2: string }>; // Rhyming pairs that can link to /rhymes/:word
}

// Gibran
import { onLove } from './gibran-on-love';
import { onChildren } from './gibran-on-children';
import { onJoyAndSorrow } from './gibran-on-joy-and-sorrow';

// Rilke
import { wideningCircles } from './rilke-widening-circles';
import { godSpeaks } from './rilke-god-speaks';

// Shakespeare Sonnets
import { sonnet1 } from './shakespeare-sonnet-1';
import { sonnet2 } from './shakespeare-sonnet-2';
import { sonnet12 } from './shakespeare-sonnet-12';
import { sonnet18 } from './shakespeare-sonnet-18';
import { sonnet19 } from './shakespeare-sonnet-19';
import { sonnet29 } from './shakespeare-sonnet-29';
import { sonnet30 } from './shakespeare-sonnet-30';
import { sonnet55 } from './shakespeare-sonnet-55';
import { sonnet60 } from './shakespeare-sonnet-60';
import { sonnet65 } from './shakespeare-sonnet-65';
import { sonnet73 } from './shakespeare-sonnet-73';
import { sonnet94 } from './shakespeare-sonnet-94';
import { sonnet97 } from './shakespeare-sonnet-97';
import { sonnet106 } from './shakespeare-sonnet-106';
import { sonnet116 } from './shakespeare-sonnet-116';
import { sonnet129 } from './shakespeare-sonnet-129';
import { sonnet130 } from './shakespeare-sonnet-130';
import { sonnet138 } from './shakespeare-sonnet-138';
import { sonnet144 } from './shakespeare-sonnet-144';
import { sonnet147 } from './shakespeare-sonnet-147';
import { sonnet154 } from './shakespeare-sonnet-154';

// Keats
import { brightStar } from './keats-bright-star';

// Blake
import { theTyger } from './blake-tyger';
import { theLamb } from './blake-lamb';

// Wordsworth
import { daffodils } from './wordsworth-daffodils';
import { westminsterBridge } from './wordsworth-westminster-bridge';
import { worldTooMuch } from './wordsworth-world-too-much';
import { solitaryReaper } from './wordsworth-solitary-reaper';

// Shelley
import { ozymandias } from './shelley-ozymandias';
import { mutability } from './shelley-mutability';

// Dickinson
import { dickinson254 } from './dickinson-254';
import { dickinson258 } from './dickinson-258';
import { dickinson280 } from './dickinson-280';
import { dickinson288 } from './dickinson-288';
import { dickinson303 } from './dickinson-303';
import { dickinson320 } from './dickinson-320';
import { dickinson341 } from './dickinson-341';
import { dickinson465 } from './dickinson-465';
import { dickinson712 } from './dickinson-712';
import { dickinson1129 } from './dickinson-1129';

// Whitman
import { oCaptain } from './whitman-o-captain';
import { noiselessSpider } from './whitman-noiseless-spider';

// Poe
import { annabelLee } from './poe-annabel-lee';
import { alone } from './poe-alone';

// Frost
import { roadNotTaken } from './frost-road-not-taken';
import { nothingGoldCanStay } from './frost-nothing-gold';
import { stoppingByWoods } from './frost-stopping-by-woods';

// Henley
import { invictus } from './henley-invictus';

// McCrae
import { inFlandersFields } from './mccrae-in-flanders-fields';

// Byron
import { sheWalksInBeauty } from './byron-she-walks-in-beauty';

// Arnold
import { doverBeach } from './arnold-dover-beach';

// Crapsey
import { novemberNight } from './crapsey-november-night';
import { triad } from './crapsey-triad';
import { amaze } from './crapsey-amaze';

// Teasdale
import { thereWillComeSoftRains } from './teasdale-there-will-come-soft-rains';
import { iAmNotYours } from './teasdale-i-am-not-yours';
import { barter } from './teasdale-barter';

// Millay
import { firstFig } from './millay-first-fig';
import { whatLipsMyLips } from './millay-what-lips-my-lips';

export const poems: Record<string, PoemAnalysis> = {
  // Gibran
  'on-love': onLove,
  'on-children': onChildren,
  'on-joy-and-sorrow': onJoyAndSorrow,
  // Rilke
  'widening-circles': wideningCircles,
  'god-speaks': godSpeaks,
  // Shakespeare
  'sonnet-1': sonnet1,
  'sonnet-2': sonnet2,
  'sonnet-12': sonnet12,
  'sonnet-18': sonnet18,
  'sonnet-19': sonnet19,
  'sonnet-29': sonnet29,
  'sonnet-30': sonnet30,
  'sonnet-55': sonnet55,
  'sonnet-60': sonnet60,
  'sonnet-65': sonnet65,
  'sonnet-73': sonnet73,
  'sonnet-94': sonnet94,
  'sonnet-97': sonnet97,
  'sonnet-106': sonnet106,
  'sonnet-116': sonnet116,
  'sonnet-129': sonnet129,
  'sonnet-130': sonnet130,
  'sonnet-138': sonnet138,
  'sonnet-144': sonnet144,
  'sonnet-147': sonnet147,
  'sonnet-154': sonnet154,
  // Keats
  'bright-star': brightStar,
  // Blake
  'the-tyger': theTyger,
  'the-lamb': theLamb,
  // Wordsworth
  'daffodils': daffodils,
  'westminster-bridge': westminsterBridge,
  'world-too-much': worldTooMuch,
  'solitary-reaper': solitaryReaper,
  // Shelley
  'ozymandias': ozymandias,
  'mutability': mutability,
  // Dickinson
  'hope-is-the-thing-with-feathers': dickinson254,
  'theres-a-certain-slant-of-light': dickinson258,
  'i-felt-a-funeral': dickinson280,
  'im-nobody-who-are-you': dickinson288,
  'the-soul-selects-her-own-society': dickinson303,
  'theres-a-solitude-of-space': dickinson320,
  'after-great-pain': dickinson341,
  'i-heard-a-fly-buzz': dickinson465,
  'because-i-could-not-stop-for-death': dickinson712,
  'tell-all-the-truth': dickinson1129,
  // Whitman
  'o-captain': oCaptain,
  'noiseless-spider': noiselessSpider,
  // Poe
  'annabel-lee': annabelLee,
  'alone': alone,
  // Frost
  'the-road-not-taken': roadNotTaken,
  'nothing-gold-can-stay': nothingGoldCanStay,
  'stopping-by-woods': stoppingByWoods,
  // Henley
  'invictus': invictus,
  // McCrae
  'in-flanders-fields': inFlandersFields,
  // Byron
  'she-walks-in-beauty': sheWalksInBeauty,
  // Arnold
  'dover-beach': doverBeach,
  // Crapsey
  'november-night': novemberNight,
  'triad': triad,
  'amaze': amaze,
  // Teasdale
  'there-will-come-soft-rains': thereWillComeSoftRains,
  'i-am-not-yours': iAmNotYours,
  'barter': barter,
  // Millay
  'first-fig': firstFig,
  'what-lips-my-lips-have-kissed': whatLipsMyLips,
};

export function getPoemBySlug(slug: string): PoemAnalysis | undefined {
  return poems[slug];
}

export function getAllPoems(): PoemAnalysis[] {
  return Object.values(poems);
}

export function getAllPoemSlugs(): string[] {
  return Object.keys(poems);
}
