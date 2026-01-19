/**
 * Traditional Poetry Validation Set
 *
 * Only includes poems from traditional, metrically-regular poets.
 * Excludes modernist poets who deliberately break meter (Hughes, Lowell,
 * Stevens, Whitman, Hopkins, Heaney, Larkin, Auden, Bishop, Hardy).
 */

import { classifyPoem, scanLineWithMeter, PoemClassification } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AnnotatedLine {
  text: string;
  expectedPattern: string;
  poet: string;
  poem: string;
}

// TRADITIONAL VALIDATION SET - Regular metrical poetry only
export const traditionalLines: AnnotatedLine[] = [
  // ============================================
  // ALFRED LORD TENNYSON - "Ulysses" (blank verse)
  // ============================================
  { text: "It little profits that an idle king", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "By this still hearth, among these barren crags", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Matched with an aged wife, I mete and dole", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Unequal laws unto a savage race", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "That hoard, and sleep, and feed, and know not me", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "I cannot rest from travel; I will drink", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Life to the lees. All times I have enjoyed", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Greatly, have suffered greatly, both with those", expectedPattern: "/uu/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "That loved me, and alone; on shore, and when", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Through scudding drifts the rainy Hyades", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Vexed the dim sea. I am become a name", expectedPattern: "/u/uu/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "For always roaming with a hungry heart", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Much have I seen and known—cities of men", expectedPattern: "/uu/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "And manners, climates, councils, governments", expectedPattern: "u/u/u/u/uu", poet: "Tennyson", poem: "Ulysses" },  // 10 syllables: governments=3
  { text: "Myself not least, but honored of them all", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "And drunk delight of battle with my peers", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Far on the ringing plains of windy Troy", expectedPattern: "/uu/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "I am a part of all that I have met", expectedPattern: "u/u/u/u/u/", poet: "Tennyson", poem: "Ulysses" },
  { text: "Yet all experience is an arch wherethrough", expectedPattern: "u/u/uuu/u/u", poet: "Tennyson", poem: "Ulysses" },  // 11 syllables (experience=4, wherethrough=2)
  { text: "Gleams that untraveled world whose margin fades", expectedPattern: "/uu/u/u/u/", poet: "Tennyson", poem: "Ulysses" },

  // ============================================
  // TENNYSON - "The Lady of Shalott" (varied meter)
  // ============================================
  { text: "On either side the river lie", expectedPattern: "u/u/u/u/", poet: "Tennyson", poem: "Lady of Shalott" },
  { text: "Long fields of barley and of rye", expectedPattern: "/uu/u/u/", poet: "Tennyson", poem: "Lady of Shalott" },
  { text: "That clothe the wold and meet the sky", expectedPattern: "u/u/u/u/", poet: "Tennyson", poem: "Lady of Shalott" },
  { text: "And through the field the road runs by", expectedPattern: "u/u/u/u/", poet: "Tennyson", poem: "Lady of Shalott" },
  { text: "To many-towered Camelot", expectedPattern: "u/u/u/uu", poet: "Tennyson", poem: "Lady of Shalott" },  // 8 syllables: Cam-e-lot = 3
  { text: "And up and down the people go", expectedPattern: "u/u/u/u/", poet: "Tennyson", poem: "Lady of Shalott" },
  { text: "Gazing where the lilies blow", expectedPattern: "/u/u/u/", poet: "Tennyson", poem: "Lady of Shalott" },
  { text: "Round an island there below", expectedPattern: "/u/u/u/", poet: "Tennyson", poem: "Lady of Shalott" },
  { text: "The island of Shalott", expectedPattern: "u/uu/u", poet: "Tennyson", poem: "Lady of Shalott" },  // 6 syllables: The(1) is-land(2) of(1) Sha-lott(2)
  { text: "Willows whiten, aspens quiver", expectedPattern: "/u/u/u/u", poet: "Tennyson", poem: "Lady of Shalott" },

  // ============================================
  // ROBERT BROWNING - "My Last Duchess" (blank verse)
  // ============================================
  { text: "That's my last Duchess painted on the wall", expectedPattern: "u/u/u/u/u/", poet: "Browning", poem: "My Last Duchess" },  // 10 syllables
  { text: "Looking as if she were alive. I call", expectedPattern: "/uu/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "That piece a wonder, now; Fra Pandolf's hands", expectedPattern: "u/u/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "Worked busily a day, and there she stands", expectedPattern: "//uu/u/u/", poet: "Browning", poem: "My Last Duchess" },  // 9 syllables (busily=2 in poetry)
  { text: "Will't please you sit and look at her? I said", expectedPattern: "/uu/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "Fra Pandolf by design, for never read", expectedPattern: "u/u/u/u/u/", poet: "Browning", poem: "My Last Duchess" },  // 10 syllables
  { text: "Strangers like you that pictured countenance", expectedPattern: "/uu/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "The depth and passion of its earnest glance", expectedPattern: "u/u/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "But to myself they turned (since none puts by", expectedPattern: "uuu/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "The curtain I have drawn for you, but I)", expectedPattern: "u/u/u/u/u/", poet: "Browning", poem: "My Last Duchess" },  // 10 syllables
  { text: "And seemed as they would ask me, if they durst", expectedPattern: "u/uuu/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "How such a glance came there; so, not the first", expectedPattern: "/uu/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "Are you to turn and ask thus. Sir, 'twas not", expectedPattern: "/uu/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "Her husband's presence only, called that spot", expectedPattern: "u/u/u/u/u/", poet: "Browning", poem: "My Last Duchess" },
  { text: "Of joy into the Duchess' cheek; perhaps", expectedPattern: "u/uuu/u/u/", poet: "Browning", poem: "My Last Duchess" },

  // ============================================
  // EMILY DICKINSON - Various poems (common meter variants)
  // ============================================
  { text: "Because I could not stop for Death", expectedPattern: "u/u/u/u/", poet: "Dickinson", poem: "Because I could not stop" },
  { text: "He kindly stopped for me", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Because I could not stop" },
  { text: "The Carriage held but just Ourselves", expectedPattern: "u/u/u/u/", poet: "Dickinson", poem: "Because I could not stop" },
  { text: "And Immortality", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Because I could not stop" },
  { text: "We slowly drove, He knew no haste", expectedPattern: "u/u/u/u/", poet: "Dickinson", poem: "Because I could not stop" },
  { text: "And I had put away", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Because I could not stop" },
  { text: "My labor, and my leisure too", expectedPattern: "u/uu/u/", poet: "Dickinson", poem: "Because I could not stop" },
  { text: "For His Civility", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Because I could not stop" },

  { text: "I felt a Funeral, in my Brain", expectedPattern: "u/u/uu/u/", poet: "Dickinson", poem: "I felt a Funeral" },
  { text: "And Mourners to and fro", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "I felt a Funeral" },
  { text: "Kept treading, treading, till it seemed", expectedPattern: "/u/u/u/", poet: "Dickinson", poem: "I felt a Funeral" },
  { text: "That Sense was breaking through", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "I felt a Funeral" },

  { text: "Hope is the thing with feathers", expectedPattern: "/uu/u/u", poet: "Dickinson", poem: "Hope is the thing" },
  { text: "That perches in the soul", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Hope is the thing" },
  { text: "And sings the tune without the words", expectedPattern: "u/u/u/u/", poet: "Dickinson", poem: "Hope is the thing" },
  { text: "And never stops at all", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Hope is the thing" },

  { text: "A Bird came down the Walk", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "A Bird came down" },
  { text: "He did not know I saw", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "A Bird came down" },
  { text: "He bit an Angleworm in halves", expectedPattern: "u/u/u/u/", poet: "Dickinson", poem: "A Bird came down" },
  { text: "And ate the fellow, raw", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "A Bird came down" },

  { text: "Tell all the truth but tell it slant", expectedPattern: "/uu/u/u/", poet: "Dickinson", poem: "Tell all the truth" },
  { text: "Success in Circuit lies", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Tell all the truth" },
  { text: "Too bright for our infirm Delight", expectedPattern: "u/u/u/u/", poet: "Dickinson", poem: "Tell all the truth" },
  { text: "The Truth's superb surprise", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Tell all the truth" },
  { text: "As Lightning to the Children eased", expectedPattern: "u/uuu/u/", poet: "Dickinson", poem: "Tell all the truth" },
  { text: "With explanation kind", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Tell all the truth" },
  { text: "The Truth must dazzle gradually", expectedPattern: "u/u/u/u/", poet: "Dickinson", poem: "Tell all the truth" },
  { text: "Or every man be blind", expectedPattern: "u/u/u/", poet: "Dickinson", poem: "Tell all the truth" },

  // ============================================
  // WILLIAM BLAKE - "The Tyger" (trochaic tetrameter)
  // ============================================
  { text: "Tyger Tyger, burning bright", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "In the forests of the night", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "What immortal hand or eye", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "Could frame thy fearful symmetry", expectedPattern: "u/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "In what distant deeps or skies", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "Burnt the fire of thine eyes", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "On what wings dare he aspire", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "What the hand dare seize the fire", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "And what shoulder and what art", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "Could twist the sinews of thy heart", expectedPattern: "u/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "And when thy heart began to beat", expectedPattern: "u/u/u/u/", poet: "Blake", poem: "The Tyger" },
  { text: "What dread hand and what dread feet", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Tyger" },

  // ============================================
  // BLAKE - "The Lamb" (trochaic)
  // ============================================
  { text: "Little Lamb who made thee", expectedPattern: "/u/u/u", poet: "Blake", poem: "The Lamb" },
  { text: "Dost thou know who made thee", expectedPattern: "/u/u/u", poet: "Blake", poem: "The Lamb" },
  { text: "Gave thee life and bid thee feed", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Lamb" },
  { text: "By the stream and o'er the mead", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Lamb" },
  { text: "Gave thee clothing of delight", expectedPattern: "/u/uu/u/", poet: "Blake", poem: "The Lamb" },
  { text: "Softest clothing woolly bright", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Lamb" },
  { text: "Gave thee such a tender voice", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Lamb" },
  { text: "Making all the vales rejoice", expectedPattern: "/u/u/u/", poet: "Blake", poem: "The Lamb" },

  // ============================================
  // JOHN KEATS - "Ode to a Nightingale" (iambic pentameter)
  // ============================================
  { text: "My heart aches, and a drowsy numbness pains", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "My sense, as though of hemlock I had drunk", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "Or emptied some dull opiate to the drains", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "One minute past, and Lethe-wards had sunk", expectedPattern: "/uu/u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "'Tis not through envy of thy happy lot", expectedPattern: "/uu/uu/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "But being too happy in thine happiness", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "That thou, light-winged Dryad of the trees", expectedPattern: "u/u/u/uu/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "In some melodious plot", expectedPattern: "u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "Of beechen green, and shadows numberless", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },
  { text: "Singest of summer in full-throated ease", expectedPattern: "/uu/u/u/u/", poet: "Keats", poem: "Ode to a Nightingale" },

  // ============================================
  // KEATS - "Ode on a Grecian Urn"
  // ============================================
  { text: "Thou still unravished bride of quietness", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "Thou foster-child of silence and slow time", expectedPattern: "u/u/u/uu/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "Sylvan historian, who canst thus express", expectedPattern: "/uu/uu/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "A flowery tale more sweetly than our rhyme", expectedPattern: "u/u/u/uu/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "What leaf-fringed legend haunts about thy shape", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "Of deities or mortals, or of both", expectedPattern: "u/uuu/uu/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "In Tempe or the dales of Arcady", expectedPattern: "u/uuu/uu/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "What men or gods are these? What maidens loath", expectedPattern: "/uu/u/u/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "What mad pursuit? What struggle to escape", expectedPattern: "/uu/u/uu/", poet: "Keats", poem: "Ode on a Grecian Urn" },
  { text: "What pipes and timbrels? What wild ecstasy", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "Ode on a Grecian Urn" },

  // ============================================
  // KEATS - "To Autumn"
  // ============================================
  { text: "Season of mists and mellow fruitfulness", expectedPattern: "/uu/u/u/u/", poet: "Keats", poem: "To Autumn" },
  { text: "Close bosom-friend of the maturing sun", expectedPattern: "/uu/uuu/u/", poet: "Keats", poem: "To Autumn" },
  { text: "Conspiring with him how to load and bless", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "To Autumn" },
  { text: "With fruit the vines that round the thatch-eaves run", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "To Autumn" },
  { text: "To bend with apples the mossed cottage-trees", expectedPattern: "u/u/uu/u/u/", poet: "Keats", poem: "To Autumn" },
  { text: "And fill all fruit with ripeness to the core", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "To Autumn" },
  { text: "To swell the gourd, and plump the hazel shells", expectedPattern: "u/u/u/u/u/", poet: "Keats", poem: "To Autumn" },
  { text: "With a sweet kernel; to set budding more", expectedPattern: "uu/u/u/u/", poet: "Keats", poem: "To Autumn" },

  // ============================================
  // KEATS - "La Belle Dame Sans Merci"
  // ============================================
  { text: "O what can ail thee, knight-at-arms", expectedPattern: "u/u/u/u/", poet: "Keats", poem: "La Belle Dame" },
  { text: "Alone and palely loitering", expectedPattern: "u/u/u/u/", poet: "Keats", poem: "La Belle Dame" },
  { text: "The sedge has withered from the lake", expectedPattern: "u/u/u/u/", poet: "Keats", poem: "La Belle Dame" },
  { text: "And no birds sing", expectedPattern: "u/u/", poet: "Keats", poem: "La Belle Dame" },
  { text: "So haggard and so woe-begone", expectedPattern: "u/u/u/u/", poet: "Keats", poem: "La Belle Dame" },
  { text: "The squirrel's granary is full", expectedPattern: "u/u/uu/", poet: "Keats", poem: "La Belle Dame" },
  { text: "And the harvest's done", expectedPattern: "uu/u/", poet: "Keats", poem: "La Belle Dame" },

  // ============================================
  // PERCY BYSSHE SHELLEY - "Ozymandias" (sonnet, iambic pentameter)
  // ============================================
  { text: "I met a traveller from an antique land", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Who said: Two vast and trunkless legs of stone", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Stand in the desert. Near them, on the sand", expectedPattern: "/uu/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Half sunk, a shattered visage lies, whose frown", expectedPattern: "/uu/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "And wrinkled lip, and sneer of cold command", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Tell that its sculptor well those passions read", expectedPattern: "/uu/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Which yet survive, stamped on these lifeless things", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "The hand that mocked them and the heart that fed", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "And on the pedestal these words appear", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "My name is Ozymandias, King of Kings", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Look on my Works, ye Mighty, and despair", expectedPattern: "/uu/u/uu/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Nothing beside remains. Round the decay", expectedPattern: "/uu/u/uu/", poet: "Shelley", poem: "Ozymandias" },
  { text: "Of that colossal Wreck, boundless and bare", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },
  { text: "The lone and level sands stretch far away", expectedPattern: "u/u/u/u/u/", poet: "Shelley", poem: "Ozymandias" },

  // ============================================
  // SHELLEY - "Ode to the West Wind"
  // ============================================
  { text: "O wild West Wind, thou breath of Autumn's being", expectedPattern: "u/u/u/u/u/u", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "Thou, from whose unseen presence the leaves dead", expectedPattern: "u/u/u/uu/u/", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "Are driven, like ghosts from an enchanter fleeing", expectedPattern: "u/u/u/uu/u/u", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "Yellow, and black, and pale, and hectic red", expectedPattern: "/uu/u/u/u/", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "Pestilence-stricken multitudes: O thou", expectedPattern: "/u/u/u/u/", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "Who chariotest to their dark wintry bed", expectedPattern: "u/u/uu/u/", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "The winged seeds, where they lie cold and low", expectedPattern: "u/u/uu/u/u/", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "Each like a corpse within its grave, until", expectedPattern: "/uu/u/u/u/", poet: "Shelley", poem: "Ode to the West Wind" },
  { text: "Thine azure sister of the Spring shall blow", expectedPattern: "u/u/uu/u/", poet: "Shelley", poem: "Ode to the West Wind" },

  // ============================================
  // SAMUEL TAYLOR COLERIDGE - "Kubla Khan"
  // ============================================
  { text: "In Xanadu did Kubla Khan", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "A stately pleasure-dome decree", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "Where Alph, the sacred river, ran", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "Through caverns measureless to man", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "Down to a sunless sea", expectedPattern: "/uu/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "So twice five miles of fertile ground", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "With walls and towers were girdled round", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "And there were gardens bright with sinuous rills", expectedPattern: "u/u/u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "Where blossomed many an incense-bearing tree", expectedPattern: "u/u/uu/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "And here were forests ancient as the hills", expectedPattern: "u/u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },
  { text: "Enfolding sunny spots of greenery", expectedPattern: "u/u/u/u/u/", poet: "Coleridge", poem: "Kubla Khan" },

  // ============================================
  // COLERIDGE - "The Rime of the Ancient Mariner"
  // ============================================
  { text: "It is an ancient Mariner", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "And he stoppeth one of three", expectedPattern: "u/u/uu/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "By thy long grey beard and glittering eye", expectedPattern: "u/u/u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "Now wherefore stopp'st thou me", expectedPattern: "/u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "The bridegroom's doors are opened wide", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "And I am next of kin", expectedPattern: "u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "The guests are met, the feast is set", expectedPattern: "u/u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "May'st hear the merry din", expectedPattern: "/uu/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "Water, water, every where", expectedPattern: "/u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "And all the boards did shrink", expectedPattern: "u/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },
  { text: "Nor any drop to drink", expectedPattern: "/u/u/", poet: "Coleridge", poem: "Ancient Mariner" },

  // ============================================
  // WILLIAM WORDSWORTH - "I Wandered Lonely as a Cloud"
  // ============================================
  { text: "I wandered lonely as a cloud", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "That floats on high o'er vales and hills", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "When all at once I saw a crowd", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "A host, of golden daffodils", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "Beside the lake, beneath the trees", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "Fluttering and dancing in the breeze", expectedPattern: "/uu/uu/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "Continuous as the stars that shine", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "And twinkle on the milky way", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "They stretched in never-ending line", expectedPattern: "u/u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "Along the margin of a bay", expectedPattern: "u/u/uuu/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "Ten thousand saw I at a glance", expectedPattern: "/u u/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },
  { text: "Tossing their heads in sprightly dance", expectedPattern: "/uu/u/u/", poet: "Wordsworth", poem: "I Wandered Lonely" },

  // ============================================
  // WORDSWORTH - "Lines Composed a Few Miles Above Tintern Abbey"
  // ============================================
  { text: "Five years have past; five summers, with the length", expectedPattern: "/uu/u/u/u/", poet: "Wordsworth", poem: "Tintern Abbey" },
  { text: "Of five long winters! and again I hear", expectedPattern: "u/u/u/u/u/", poet: "Wordsworth", poem: "Tintern Abbey" },
  { text: "These waters, rolling from their mountain-springs", expectedPattern: "u/u/u/u/u/", poet: "Wordsworth", poem: "Tintern Abbey" },
  { text: "With a soft inland murmur. Once again", expectedPattern: "uu/u/u/u/", poet: "Wordsworth", poem: "Tintern Abbey" },
  { text: "Do I behold these steep and lofty cliffs", expectedPattern: "u/u/u/u/u/", poet: "Wordsworth", poem: "Tintern Abbey" },
  { text: "That on a wild secluded scene impress", expectedPattern: "u/u/u/u/u/", poet: "Wordsworth", poem: "Tintern Abbey" },
  { text: "Thoughts of more deep seclusion; and connect", expectedPattern: "/uu/u/u u/", poet: "Wordsworth", poem: "Tintern Abbey" },
  { text: "The landscape with the quiet of the sky", expectedPattern: "u/u/u/uuu/", poet: "Wordsworth", poem: "Tintern Abbey" },

  // ============================================
  // ALEXANDER POPE - "The Rape of the Lock" (heroic couplets)
  // ============================================
  { text: "What dire offence from amorous causes springs", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "What mighty contests rise from trivial things", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "I sing—this verse to Caryll, Muse! is due", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "This, even Belinda may vouchsafe to view", expectedPattern: "/uu/uu/u/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "Slight is the subject, but not so the praise", expectedPattern: "/uu/uuu/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "If she inspire, and he approve my lays", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "Say what strange motive, Goddess! could compel", expectedPattern: "/uu/u/uu/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "A well-bred Lord t'assault a gentle Belle", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "O say what stranger cause, yet unexplored", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Rape of the Lock" },
  { text: "Could make a gentle Belle reject a Lord", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Rape of the Lock" },

  // ============================================
  // POPE - "Essay on Man"
  // ============================================
  { text: "Know then thyself, presume not God to scan", expectedPattern: "/uu/u/u/u/", poet: "Pope", poem: "Essay on Man" },
  { text: "The proper study of Mankind is Man", expectedPattern: "u/u/uu/u/", poet: "Pope", poem: "Essay on Man" },
  { text: "Placed on this isthmus of a middle state", expectedPattern: "/uu/uu/u/", poet: "Pope", poem: "Essay on Man" },
  { text: "A being darkly wise, and rudely great", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Essay on Man" },
  { text: "With too much knowledge for the Sceptic side", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Essay on Man" },
  { text: "With too much weakness for the Stoic's pride", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Essay on Man" },
  { text: "He hangs between; in doubt to act, or rest", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Essay on Man" },
  { text: "In doubt to deem himself a God, or Beast", expectedPattern: "u/u/u/u/u/", poet: "Pope", poem: "Essay on Man" },

  // ============================================
  // JOHN DONNE - "The Sun Rising"
  // ============================================
  { text: "Busy old fool, unruly Sun", expectedPattern: "/u/uu/u/", poet: "Donne", poem: "The Sun Rising" },
  { text: "Why dost thou thus", expectedPattern: "/uu/", poet: "Donne", poem: "The Sun Rising" },
  { text: "Through windows and through curtains call on us", expectedPattern: "u/uu/u/u/", poet: "Donne", poem: "The Sun Rising" },
  { text: "Must to thy motions lovers' seasons run", expectedPattern: "/uu/u/u/u/", poet: "Donne", poem: "The Sun Rising" },
  { text: "Saucy pedantic wretch, go chide", expectedPattern: "/uu/u/u/", poet: "Donne", poem: "The Sun Rising" },
  { text: "Late school-boys and sour prentices", expectedPattern: "/u/u/u/u", poet: "Donne", poem: "The Sun Rising" },
  { text: "Go tell court-huntsmen that the King will ride", expectedPattern: "u/u/uu/u/", poet: "Donne", poem: "The Sun Rising" },
  { text: "Call country ants to harvest offices", expectedPattern: "/uu/u/u/u/", poet: "Donne", poem: "The Sun Rising" },

  // ============================================
  // DONNE - "Death Be Not Proud" (Holy Sonnet X)
  // ============================================
  { text: "Death, be not proud, though some have called thee", expectedPattern: "/uu/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },
  { text: "Mighty and dreadful, for thou art not so", expectedPattern: "/uu/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },
  { text: "For those whom thou think'st thou dost overthrow", expectedPattern: "u/u/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },
  { text: "Die not, poor Death, nor yet canst thou kill me", expectedPattern: "/uu/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },
  { text: "From rest and sleep, which but thy pictures be", expectedPattern: "u/u/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },
  { text: "Much pleasure; then from thee much more must flow", expectedPattern: "/uu/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },
  { text: "And soonest our best men with thee do go", expectedPattern: "u/uu/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },
  { text: "Rest of their bones, and soul's delivery", expectedPattern: "/uu/u/u/u/", poet: "Donne", poem: "Death Be Not Proud" },

  // ============================================
  // ANDREW MARVELL - "To His Coy Mistress"
  // ============================================
  { text: "Had we but world enough, and time", expectedPattern: "/uu/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "This coyness, Lady, were no crime", expectedPattern: "u/u/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "We would sit down and think which way", expectedPattern: "u/u/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "To walk and pass our long love's day", expectedPattern: "u/u/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "Thou by the Indian Ganges' side", expectedPattern: "/uu/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "Shouldst rubies find; I by the tide", expectedPattern: "/u/u/uu/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "Of Humber would complain. I would", expectedPattern: "u/uu/u u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "Love you ten years before the Flood", expectedPattern: "/uu/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "And you should, if you please, refuse", expectedPattern: "u/u/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "Till the conversion of the Jews", expectedPattern: "/uu/uu/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "My vegetable love should grow", expectedPattern: "u/u/u/u/", poet: "Marvell", poem: "To His Coy Mistress" },
  { text: "Vaster than empires, and more slow", expectedPattern: "/uu/uu/u/", poet: "Marvell", poem: "To His Coy Mistress" },

  // ============================================
  // GEORGE HERBERT - "The Collar"
  // ============================================
  { text: "I struck the board, and cried, No more", expectedPattern: "u/u/u/u/", poet: "Herbert", poem: "The Collar" },
  { text: "I will abroad", expectedPattern: "u/u/", poet: "Herbert", poem: "The Collar" },
  { text: "What? shall I ever sigh and pine", expectedPattern: "/uu/u/u/", poet: "Herbert", poem: "The Collar" },
  { text: "My lines and life are free; free as the road", expectedPattern: "u/u/u/u/uu/", poet: "Herbert", poem: "The Collar" },
  { text: "Loose as the wind, as large as store", expectedPattern: "/uu/u/u/", poet: "Herbert", poem: "The Collar" },
  { text: "Shall I be still in suit", expectedPattern: "/uu/u/", poet: "Herbert", poem: "The Collar" },
  { text: "Have I no harvest but a thorn", expectedPattern: "/uu/u/u/", poet: "Herbert", poem: "The Collar" },
  { text: "To let me blood, and not restore", expectedPattern: "u/u/u u/", poet: "Herbert", poem: "The Collar" },

  // ============================================
  // A.E. HOUSMAN - "To an Athlete Dying Young"
  // ============================================
  { text: "The time you won your town the race", expectedPattern: "u/u/u/u/", poet: "Housman", poem: "Athlete Dying Young" },
  { text: "We chaired you through the market-place", expectedPattern: "u/uu/u/u/", poet: "Housman", poem: "Athlete Dying Young" },
  { text: "Man and boy stood cheering by", expectedPattern: "/u/u/u/", poet: "Housman", poem: "Athlete Dying Young" },
  { text: "And home we brought you shoulder-high", expectedPattern: "u/u/u/u/", poet: "Housman", poem: "Athlete Dying Young" },
  { text: "Today, the road all runners come", expectedPattern: "u/u/u/u/", poet: "Housman", poem: "Athlete Dying Young" },
  { text: "Shoulder-high we bring you home", expectedPattern: "/u/u/u/", poet: "Housman", poem: "Athlete Dying Young" },
  { text: "And set you at your threshold down", expectedPattern: "u/uu/u/u/", poet: "Housman", poem: "Athlete Dying Young" },
  { text: "Townsman of a stiller town", expectedPattern: "/uuu/u/", poet: "Housman", poem: "Athlete Dying Young" },

  // ============================================
  // HOUSMAN - "Loveliest of Trees"
  // ============================================
  { text: "Loveliest of trees, the cherry now", expectedPattern: "/u/u/u/u/", poet: "Housman", poem: "Loveliest of Trees" },
  { text: "Is hung with bloom along the bough", expectedPattern: "u/u/u/u/", poet: "Housman", poem: "Loveliest of Trees" },
  { text: "And stands about the woodland ride", expectedPattern: "u/u/u/u/", poet: "Housman", poem: "Loveliest of Trees" },
  { text: "Wearing white for Eastertide", expectedPattern: "/u/u/u/", poet: "Housman", poem: "Loveliest of Trees" },
  { text: "Now, of my threescore years and ten", expectedPattern: "/uu/u/u/", poet: "Housman", poem: "Loveliest of Trees" },
  { text: "Twenty will not come again", expectedPattern: "/u/u/u/", poet: "Housman", poem: "Loveliest of Trees" },
  { text: "And take from seventy springs a score", expectedPattern: "u/u/u/u/", poet: "Housman", poem: "Loveliest of Trees" },
  { text: "It only leaves me fifty more", expectedPattern: "u/u/u/u/", poet: "Housman", poem: "Loveliest of Trees" },

  // ============================================
  // THOMAS GRAY - "Elegy Written in a Country Churchyard"
  // ============================================
  { text: "The curfew tolls the knell of parting day", expectedPattern: "u/u/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "The lowing herd wind slowly o'er the lea", expectedPattern: "u/u/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "The plowman homeward plods his weary way", expectedPattern: "u/u/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "And leaves the world to darkness and to me", expectedPattern: "u/uu/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "Now fades the glimmering landscape on the sight", expectedPattern: "/uu/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "And all the air a solemn stillness holds", expectedPattern: "u/u/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "Save where the beetle wheels his droning flight", expectedPattern: "/uu/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "And drowsy tinklings lull the distant folds", expectedPattern: "u/u/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "Beneath those rugged elms, that yew-tree's shade", expectedPattern: "u/u/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "Where heaves the turf in many a mouldering heap", expectedPattern: "u/u/u/uu/u/", poet: "Gray", poem: "Elegy" },
  { text: "Each in his narrow cell for ever laid", expectedPattern: "/uu/u/u/u/", poet: "Gray", poem: "Elegy" },
  { text: "The rude forefathers of the hamlet sleep", expectedPattern: "u/u/uuu/u/", poet: "Gray", poem: "Elegy" },

  // ============================================
  // CHRISTOPHER MARLOWE - "The Passionate Shepherd"
  // ============================================
  { text: "Come live with me and be my love", expectedPattern: "u/u/u/u/", poet: "Marlowe", poem: "Passionate Shepherd" },
  { text: "And we will all the pleasures prove", expectedPattern: "u/u/u/u/", poet: "Marlowe", poem: "Passionate Shepherd" },
  { text: "That valleys, groves, hills, and fields", expectedPattern: "u/u/u/u/", poet: "Marlowe", poem: "Passionate Shepherd" },
  { text: "Woods, or steepy mountain yields", expectedPattern: "/u/u/u/", poet: "Marlowe", poem: "Passionate Shepherd" },
  { text: "And we will sit upon the rocks", expectedPattern: "u/u/u/u/", poet: "Marlowe", poem: "Passionate Shepherd" },
  { text: "Seeing the shepherds feed their flocks", expectedPattern: "/uu/u/u/", poet: "Marlowe", poem: "Passionate Shepherd" },
  { text: "By shallow rivers to whose falls", expectedPattern: "u/u/uu/u/", poet: "Marlowe", poem: "Passionate Shepherd" },
  { text: "Melodious birds sing madrigals", expectedPattern: "u/u/u/u/", poet: "Marlowe", poem: "Passionate Shepherd" },

  // ============================================
  // BEN JONSON - "Song: To Celia"
  // ============================================
  { text: "Drink to me only with thine eyes", expectedPattern: "/uu/u/u/", poet: "Jonson", poem: "To Celia" },
  { text: "And I will pledge with mine", expectedPattern: "u/u/u/", poet: "Jonson", poem: "To Celia" },
  { text: "Or leave a kiss but in the cup", expectedPattern: "u/u/u/u/", poet: "Jonson", poem: "To Celia" },
  { text: "And I'll not look for wine", expectedPattern: "u/u/u/", poet: "Jonson", poem: "To Celia" },
  { text: "The thirst that from the soul doth rise", expectedPattern: "u/u/u/u/", poet: "Jonson", poem: "To Celia" },
  { text: "Doth ask a drink divine", expectedPattern: "u/u/u/", poet: "Jonson", poem: "To Celia" },
  { text: "But might I of Jove's nectar sup", expectedPattern: "u/uu/u/u/", poet: "Jonson", poem: "To Celia" },
  { text: "I would not change for thine", expectedPattern: "u/u/u/", poet: "Jonson", poem: "To Celia" },

  // ============================================
  // EDMUND SPENSER - "Sonnet 75" (Amoretti)
  // ============================================
  { text: "One day I wrote her name upon the strand", expectedPattern: "u/u/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },
  { text: "But came the waves and washed it away", expectedPattern: "u/u/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },
  { text: "Again I wrote it with a second hand", expectedPattern: "u/u/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },
  { text: "But came the tide, and made my pains his prey", expectedPattern: "u/u/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },
  { text: "Vain man, said she, that dost in vain assay", expectedPattern: "/uu/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },
  { text: "A mortal thing so to immortalize", expectedPattern: "u/u/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },
  { text: "For I myself shall like to this decay", expectedPattern: "u/u/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },
  { text: "And eke my name be wiped out likewise", expectedPattern: "u/u/u/u/u/", poet: "Spenser", poem: "Sonnet 75" },

  // ============================================
  // CHRISTINA ROSSETTI - "Remember"
  // ============================================
  { text: "Remember me when I am gone away", expectedPattern: "u/u/u/u/u/", poet: "Rossetti", poem: "Remember" },
  { text: "Gone far away into the silent land", expectedPattern: "/uu/u/u/u/", poet: "Rossetti", poem: "Remember" },
  { text: "When you can no more hold me by the hand", expectedPattern: "u/u/u/u/u/", poet: "Rossetti", poem: "Remember" },
  { text: "Nor I half turn to go yet turning stay", expectedPattern: "u/u/u/u/u/", poet: "Rossetti", poem: "Remember" },
  { text: "Remember me when no more day by day", expectedPattern: "u/u/u/u/u/", poet: "Rossetti", poem: "Remember" },
  { text: "You tell me of our future that you planned", expectedPattern: "u/uu/u/u/", poet: "Rossetti", poem: "Remember" },
  { text: "Only remember me; you understand", expectedPattern: "/uu/u/u/u/", poet: "Rossetti", poem: "Remember" },
  { text: "It will be late to counsel then or pray", expectedPattern: "u/u/u/u/u/", poet: "Rossetti", poem: "Remember" },

  // ============================================
  // ROSSETTI - "Goblin Market" (varied)
  // ============================================
  { text: "Morning and evening", expectedPattern: "/u/u/u", poet: "Rossetti", poem: "Goblin Market" },
  { text: "Maids heard the goblins cry", expectedPattern: "/uu/u/", poet: "Rossetti", poem: "Goblin Market" },
  { text: "Come buy our orchard fruits", expectedPattern: "u/u/u/", poet: "Rossetti", poem: "Goblin Market" },
  { text: "Come buy, come buy", expectedPattern: "u/u/", poet: "Rossetti", poem: "Goblin Market" },
  { text: "Apples and quinces", expectedPattern: "/uu/u", poet: "Rossetti", poem: "Goblin Market" },
  { text: "Lemons and oranges", expectedPattern: "/uu/u/", poet: "Rossetti", poem: "Goblin Market" },
  { text: "Plump unpecked cherries", expectedPattern: "/u/u/u", poet: "Rossetti", poem: "Goblin Market" },
  { text: "Melons and raspberries", expectedPattern: "/uu/u/", poet: "Rossetti", poem: "Goblin Market" },

  // ============================================
  // ELIZABETH BARRETT BROWNING - Sonnets from the Portuguese
  // ============================================
  { text: "How do I love thee? Let me count the ways", expectedPattern: "u/u/u/u/u/", poet: "E.B. Browning", poem: "Sonnet 43" },
  { text: "I love thee to the depth and breadth and height", expectedPattern: "u/uu/u/u/u/", poet: "E.B. Browning", poem: "Sonnet 43" },
  { text: "My soul can reach, when feeling out of sight", expectedPattern: "u/u/u/u/u/", poet: "E.B. Browning", poem: "Sonnet 43" },
  { text: "For the ends of Being and ideal Grace", expectedPattern: "u/uu/uu/u/", poet: "E.B. Browning", poem: "Sonnet 43" },
  { text: "I love thee to the level of everyday's", expectedPattern: "u/uuu/uu/u/", poet: "E.B. Browning", poem: "Sonnet 43" },
  { text: "Most quiet need, by sun and candlelight", expectedPattern: "/uu/u/u/u/", poet: "E.B. Browning", poem: "Sonnet 43" },
  { text: "I love thee freely, as men strive for Right", expectedPattern: "u/u/uu/u/u/", poet: "E.B. Browning", poem: "Sonnet 43" },
  { text: "I love thee purely, as they turn from Praise", expectedPattern: "u/u/uu/u/u/", poet: "E.B. Browning", poem: "Sonnet 43" },

  // ============================================
  // RUDYARD KIPLING - "If—"
  // ============================================
  { text: "If you can keep your head when all about you", expectedPattern: "u/u/u/u/u/u", poet: "Kipling", poem: "If" },
  { text: "Are losing theirs and blaming it on you", expectedPattern: "u/u/u/u/u/", poet: "Kipling", poem: "If" },
  { text: "If you can trust yourself when all men doubt you", expectedPattern: "u/u/u/u/u/u", poet: "Kipling", poem: "If" },
  { text: "But make allowance for their doubting too", expectedPattern: "u/u/u/u/u/", poet: "Kipling", poem: "If" },
  { text: "If you can wait and not be tired by waiting", expectedPattern: "u/u/u/u/u/u", poet: "Kipling", poem: "If" },
  { text: "Or being lied about, don't deal in lies", expectedPattern: "u/u/u/u/u/", poet: "Kipling", poem: "If" },
  { text: "Or being hated, don't give way to hating", expectedPattern: "u/u/u/u/u/u", poet: "Kipling", poem: "If" },
  { text: "And yet don't look too good, nor talk too wise", expectedPattern: "u/u/u/u/u/", poet: "Kipling", poem: "If" },

  // ============================================
  // EDNA ST. VINCENT MILLAY - Sonnets
  // ============================================
  { text: "What lips my lips have kissed, and where, and why", expectedPattern: "/uu/u/u/u/", poet: "Millay", poem: "What lips" },
  { text: "I have forgotten, and what arms have lain", expectedPattern: "u/u/uu/u/", poet: "Millay", poem: "What lips" },
  { text: "Under my head till morning; but the rain", expectedPattern: "/uu/u/u/u/", poet: "Millay", poem: "What lips" },
  { text: "Is full of ghosts tonight, that tap and sigh", expectedPattern: "u/u/u/u/u/", poet: "Millay", poem: "What lips" },
  { text: "Upon the glass and listen for reply", expectedPattern: "u/u/u/u/u/", poet: "Millay", poem: "What lips" },
  { text: "And in my heart there stirs a quiet pain", expectedPattern: "u/u/u/u/u/", poet: "Millay", poem: "What lips" },
  { text: "For unremembered lads that not again", expectedPattern: "u/u/u/u/u/", poet: "Millay", poem: "What lips" },
  { text: "Will turn to me at midnight with a cry", expectedPattern: "u/u/u/u/u/", poet: "Millay", poem: "What lips" },

  // ============================================
  // MATTHEW ARNOLD - "Dover Beach" (traditional portions)
  // ============================================
  { text: "The sea is calm tonight", expectedPattern: "u/u/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "The tide is full, the moon lies fair", expectedPattern: "u/u/u/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Upon the straits; on the French coast the light", expectedPattern: "u/u/u/u/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Gleams and is gone; the cliffs of England stand", expectedPattern: "/uu/u/u/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Glimmering and vast, out in the tranquil bay", expectedPattern: "/uu/u/u/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Come to the window, sweet is the night-air", expectedPattern: "/uu/u/uu/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Only, from the long line of spray", expectedPattern: "/uuu/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Where the sea meets the moon-blanched land", expectedPattern: "/uu/u/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Listen! you hear the grating roar", expectedPattern: "/uu/u/u/", poet: "Arnold", poem: "Dover Beach" },
  { text: "Of pebbles which the waves draw back, and fling", expectedPattern: "u/u/u/u/u/", poet: "Arnold", poem: "Dover Beach" },
];

async function loadDictionary(): Promise<void> {
  const possiblePaths = [
    './public/cmudict.dict',
    join(__dirname, '../../../../public/cmudict.dict'),
  ];

  let dictText: string | null = null;
  for (const path of possiblePaths) {
    try {
      if (existsSync(path)) {
        dictText = readFileSync(path, 'utf-8');
        console.log(`Loaded dictionary from: ${path}`);
        break;
      }
    } catch { continue; }
  }

  if (!dictText) {
    console.error('Could not find CMU dictionary!');
    return;
  }

  const dictionary = new Map<string, Pronunciation[]>();
  for (const line of dictText.split('\n')) {
    if (line.startsWith(';;;') || !line.trim()) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const word = parts[0];
    const phones = parts.slice(1);
    const baseWord = word.replace(/\(\d+\)$/, '').toLowerCase();
    const stresses: number[] = [];
    for (const phone of phones) {
      const match = phone.match(/[012]$/);
      if (match) stresses.push(parseInt(match[0]));
    }
    if (!dictionary.has(baseWord)) dictionary.set(baseWord, []);
    dictionary.get(baseWord)!.push({ word: baseWord, phones, stresses });
  }
  injectDictionary(dictionary);
}

function normalizePattern(pattern: string): string {
  return pattern.replace(/[^u\/]/g, '');
}

function countMatches(expected: string, actual: string): number {
  const e = normalizePattern(expected);
  const a = normalizePattern(actual);
  let matches = 0;
  const minLen = Math.min(e.length, a.length);
  for (let i = 0; i < minLen; i++) {
    if (e[i] === a[i]) matches++;
  }
  return matches;
}

interface TestResult {
  line: AnnotatedLine;
  actualPattern: string;
  actualSyllables: number;
  expectedSyllables: number;
  exactMatch: boolean;
  syllableMatch: boolean;
  partialScore: number;
}

async function runTraditionalValidationTests(): Promise<void> {
  await loadDictionary();

  console.log('='.repeat(70));
  console.log('TRADITIONAL VALIDATION SET - Regular metrical poetry only');
  console.log('='.repeat(70));
  console.log(`Total lines: ${traditionalLines.length}`);
  console.log();

  const results: TestResult[] = [];
  const poetStats = new Map<string, { exact: number; syllable: number; total: number }>();

  // Group by poem for classification
  const poemGroups = new Map<string, AnnotatedLine[]>();
  for (const line of traditionalLines) {
    const key = `${line.poet}:${line.poem}`;
    if (!poemGroups.has(key)) poemGroups.set(key, []);
    poemGroups.get(key)!.push(line);
  }

  // Test each poem group
  for (const [poemKey, lines] of poemGroups) {
    const poemText = lines.map(l => l.text).join('\n');
    const classification = classifyPoem(poemText);

    for (const line of lines) {
      const result = scanLineWithMeter(line.text, classification);
      const actualPattern = normalizePattern(result.pattern);
      const expectedPattern = normalizePattern(line.expectedPattern);
      const expectedSyllables = expectedPattern.length;

      const exactMatch = actualPattern === expectedPattern;
      const syllableMatch = result.syllableCount === expectedSyllables;
      const matches = countMatches(expectedPattern, actualPattern);
      const partialScore = expectedSyllables > 0 ? matches / expectedSyllables : 0;

      results.push({
        line,
        actualPattern,
        actualSyllables: result.syllableCount,
        expectedSyllables,
        exactMatch,
        syllableMatch,
        partialScore
      });

      // Update poet stats
      if (!poetStats.has(line.poet)) {
        poetStats.set(line.poet, { exact: 0, syllable: 0, total: 0 });
      }
      const ps = poetStats.get(line.poet)!;
      ps.total++;
      if (exactMatch) ps.exact++;
      if (syllableMatch) ps.syllable++;
    }
  }

  // Calculate overall stats
  const exactMatches = results.filter(r => r.exactMatch).length;
  const syllableMatches = results.filter(r => r.syllableMatch).length;
  const avgPartial = results.reduce((sum, r) => sum + r.partialScore, 0) / results.length;

  console.log('OVERALL RESULTS:');
  console.log('-'.repeat(50));
  console.log(`Exact pattern match:  ${exactMatches}/${results.length} (${(exactMatches/results.length*100).toFixed(1)}%)`);
  console.log(`Syllable count match: ${syllableMatches}/${results.length} (${(syllableMatches/results.length*100).toFixed(1)}%)`);
  console.log(`Partial match avg:    ${(avgPartial*100).toFixed(1)}%`);
  console.log();

  // Stats by poet
  console.log('BY POET:');
  console.log('-'.repeat(50));
  const sortedPoets = [...poetStats.entries()].sort((a, b) => b[1].total - a[1].total);
  for (const [poet, stats] of sortedPoets) {
    const exactPct = (stats.exact / stats.total * 100).toFixed(0);
    const syllPct = (stats.syllable / stats.total * 100).toFixed(0);
    console.log(`${poet.padEnd(20)} ${stats.exact}/${stats.total} exact (${exactPct}%), ${stats.syllable}/${stats.total} syll (${syllPct}%)`);
  }
  console.log();

  // Show some failures for analysis
  const failures = results.filter(r => !r.exactMatch);
  console.log(`SAMPLE FAILURES (${failures.length} total):`);
  console.log('-'.repeat(70));

  // Show first 15 failures
  for (const r of failures.slice(0, 15)) {
    const syllDiff = r.actualSyllables !== r.expectedSyllables ? ` [syll: ${r.actualSyllables} vs ${r.expectedSyllables}]` : '';
    console.log(`${r.line.poet} - "${r.line.text}"`);
    console.log(`  Expected: ${normalizePattern(r.line.expectedPattern)}`);
    console.log(`  Actual:   ${r.actualPattern}${syllDiff}`);
    console.log();
  }

  // Categorize failures
  const syllableCountErrors = failures.filter(f => f.actualSyllables !== f.expectedSyllables);
  const stressOnlyErrors = failures.filter(f => f.actualSyllables === f.expectedSyllables);

  console.log('FAILURE BREAKDOWN:');
  console.log('-'.repeat(50));
  console.log(`Syllable count wrong: ${syllableCountErrors.length} (${(syllableCountErrors.length/failures.length*100).toFixed(1)}%)`);
  console.log(`Stress pattern wrong: ${stressOnlyErrors.length} (${(stressOnlyErrors.length/failures.length*100).toFixed(1)}%)`);
}

runTraditionalValidationTests().catch(console.error);
