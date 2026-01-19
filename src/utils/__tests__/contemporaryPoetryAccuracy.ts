/**
 * Contemporary Poetry Scansion Accuracy Test
 *
 * Tests scansion against 500+ lines of contemporary poetry (20th-21st century)
 * Uses poems with more natural, varied meters than classical verse
 */

import { analyzeScansion } from '../scansionAnalyzer';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface AnnotatedLine {
  line: string;
  expectedPattern: string;
  source: string;
}

// Contemporary poetry test data - 500+ annotated lines
// Patterns use: u = unstressed, / = stressed
const CONTEMPORARY_POEMS: AnnotatedLine[] = [
  // ========== ROBERT FROST - The Road Not Taken (1916) ==========
  // Iambic tetrameter with variations
  { line: "Two roads diverged in a yellow wood,", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "And sorry I could not travel both", expectedPattern: "u/uu/u/u/", source: "Frost - Road Not Taken" },
  { line: "And be one traveler, long I stood", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "And looked down one as far as I could", expectedPattern: "u/u/u/uu/", source: "Frost - Road Not Taken" },
  { line: "To where it bent in the undergrowth;", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "Then took the other, as just as fair,", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "And having perhaps the better claim,", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "Because it was grassy and wanted wear;", expectedPattern: "u/u/u/u/u/", source: "Frost - Road Not Taken" },
  { line: "Though as for that the passing there", expectedPattern: "u/u/u/uu/", source: "Frost - Road Not Taken" },
  { line: "Had worn them really about the same,", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "And both that morning equally lay", expectedPattern: "u/u/u/uu/", source: "Frost - Road Not Taken" },
  { line: "In leaves no step had trodden black.", expectedPattern: "u/u/u/u/", source: "Frost - Road Not Taken" },
  { line: "Oh, I kept the first for another day!", expectedPattern: "u/u/u/uu/", source: "Frost - Road Not Taken" },
  { line: "Yet knowing how way leads on to way,", expectedPattern: "u/u/u/u/u/", source: "Frost - Road Not Taken" },
  { line: "I doubted if I should ever come back.", expectedPattern: "u/uu/u/u/", source: "Frost - Road Not Taken" },
  { line: "I shall be telling this with a sigh", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "Somewhere ages and ages hence:", expectedPattern: "u//uu/u/", source: "Frost - Road Not Taken" },
  { line: "Two roads diverged in a wood, and I—", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  { line: "I took the one less traveled by,", expectedPattern: "u/u/u/uu/", source: "Frost - Road Not Taken" },
  { line: "And that has made all the difference.", expectedPattern: "u/u/u/u/u", source: "Frost - Road Not Taken" },

  // ========== ROBERT FROST - Stopping by Woods on a Snowy Evening (1923) ==========
  // Iambic tetrameter
  { line: "Whose woods these are I think I know.", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "His house is in the village though;", expectedPattern: "u/u/uu/u/", source: "Frost - Stopping by Woods" },
  { line: "He will not see me stopping here", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "To watch his woods fill up with snow.", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "My little horse must think it queer", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "To stop without a farmhouse near", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "Between the woods and frozen lake", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "The darkest evening of the year.", expectedPattern: "u/u/uuu/", source: "Frost - Stopping by Woods" },
  { line: "He gives his harness bells a shake", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "To ask if there is some mistake.", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "The only other sound's the sweep", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "Of easy wind and downy flake.", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "The woods are lovely, dark and deep,", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "But I have promises to keep,", expectedPattern: "u/u/uuu/", source: "Frost - Stopping by Woods" },
  { line: "And miles to go before I sleep,", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
  { line: "And miles to go before I sleep.", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },

  // ========== ROBERT FROST - Fire and Ice (1920) ==========
  { line: "Some say the world will end in fire,", expectedPattern: "u/u/u/u/", source: "Frost - Fire and Ice" },
  { line: "Some say in ice.", expectedPattern: "u/u/", source: "Frost - Fire and Ice" },
  { line: "From what I've tasted of desire", expectedPattern: "u/u/uu/", source: "Frost - Fire and Ice" },
  { line: "I hold with those who favor fire.", expectedPattern: "u/u/u/u/", source: "Frost - Fire and Ice" },
  { line: "But if it had to perish twice,", expectedPattern: "u/u/u/u/", source: "Frost - Fire and Ice" },
  { line: "I think I know enough of hate", expectedPattern: "u/u/u/u/", source: "Frost - Fire and Ice" },
  { line: "To say that for destruction ice", expectedPattern: "u/u/u/u/", source: "Frost - Fire and Ice" },
  { line: "Is also great", expectedPattern: "u/u/", source: "Frost - Fire and Ice" },
  { line: "And would suffice.", expectedPattern: "u/u/", source: "Frost - Fire and Ice" },

  // ========== ROBERT FROST - Nothing Gold Can Stay (1923) ==========
  { line: "Nature's first green is gold,", expectedPattern: "u/u/u/", source: "Frost - Nothing Gold" },
  { line: "Her hardest hue to hold.", expectedPattern: "u/u/u/", source: "Frost - Nothing Gold" },
  { line: "Her early leaf's a flower;", expectedPattern: "u/u/u/u", source: "Frost - Nothing Gold" },
  { line: "But only so an hour.", expectedPattern: "u/u/u/", source: "Frost - Nothing Gold" },
  { line: "Then leaf subsides to leaf.", expectedPattern: "u/u/u/", source: "Frost - Nothing Gold" },
  { line: "So Eden sank to grief,", expectedPattern: "u/u/u/", source: "Frost - Nothing Gold" },
  { line: "So dawn goes down to day.", expectedPattern: "u/u/u/", source: "Frost - Nothing Gold" },
  { line: "Nothing gold can stay.", expectedPattern: "uu/u/", source: "Frost - Nothing Gold" },

  // ========== W.B. YEATS - The Second Coming (1919) ==========
  // Loose iambic pentameter
  { line: "Turning and turning in the widening gyre", expectedPattern: "u/u/uu/u/", source: "Yeats - Second Coming" },
  { line: "The falcon cannot hear the falconer;", expectedPattern: "u/u/u/u/u", source: "Yeats - Second Coming" },
  { line: "Things fall apart; the centre cannot hold;", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
  { line: "Mere anarchy is loosed upon the world,", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
  { line: "The blood-dimmed tide is loosed, and everywhere", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
  { line: "The ceremony of innocence is drowned;", expectedPattern: "u/u/uu/uu/", source: "Yeats - Second Coming" },
  { line: "The best lack all conviction, while the worst", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
  { line: "Are full of passionate intensity.", expectedPattern: "u/u/uu/u/", source: "Yeats - Second Coming" },
  { line: "Surely some revelation is at hand;", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
  { line: "Surely the Second Coming is at hand.", expectedPattern: "u/u/u/uuu/", source: "Yeats - Second Coming" },
  { line: "The Second Coming! Hardly are those words out", expectedPattern: "u/u/u/u/u/u", source: "Yeats - Second Coming" },
  { line: "When a vast image out of Spiritus Mundi", expectedPattern: "uu/u/u/u/u", source: "Yeats - Second Coming" },
  { line: "Troubles my sight: somewhere in sands of the desert", expectedPattern: "u/u/u/u/uu/u", source: "Yeats - Second Coming" },
  { line: "A shape with lion body and the head of a man,", expectedPattern: "u/u/u/uu/uu/", source: "Yeats - Second Coming" },
  { line: "A gaze blank and pitiless as the sun,", expectedPattern: "u/u/u/uu/", source: "Yeats - Second Coming" },
  { line: "Is moving its slow thighs, while all about it", expectedPattern: "u/u/u/u/u/u", source: "Yeats - Second Coming" },
  { line: "Reel shadows of the indignant desert birds.", expectedPattern: "u/uu/u/u/", source: "Yeats - Second Coming" },
  { line: "The darkness drops again; but now I know", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
  { line: "That twenty centuries of stony sleep", expectedPattern: "u/u/uuu/u/", source: "Yeats - Second Coming" },
  { line: "Were vexed to nightmare by a rocking cradle,", expectedPattern: "u/u/uu/u/u", source: "Yeats - Second Coming" },
  { line: "And what rough beast, its hour come round at last,", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
  { line: "Slouches towards Bethlehem to be born?", expectedPattern: "u/u/u/u/", source: "Yeats - Second Coming" },

  // ========== W.B. YEATS - The Lake Isle of Innisfree (1890) ==========
  { line: "I will arise and go now, and go to Innisfree,", expectedPattern: "u/u/u/u/u/uu/", source: "Yeats - Innisfree" },
  { line: "And a small cabin build there, of clay and wattles made:", expectedPattern: "uu/u/u/u/u/u/", source: "Yeats - Innisfree" },
  { line: "Nine bean-rows will I have there, a hive for the honey-bee,", expectedPattern: "u/u/u/u/u/uu/", source: "Yeats - Innisfree" },
  { line: "And live alone in the bee-loud glade.", expectedPattern: "u/u/uu/u/", source: "Yeats - Innisfree" },
  { line: "And I shall have some peace there, for peace comes dropping slow,", expectedPattern: "u/u/u/u/u/u/u/", source: "Yeats - Innisfree" },
  { line: "Dropping from the veils of the morning to where the cricket sings;", expectedPattern: "u/uu/uu/uu/u/", source: "Yeats - Innisfree" },
  { line: "There midnight's all a glimmer, and noon a purple glow,", expectedPattern: "u/u/u/uu/u/u/", source: "Yeats - Innisfree" },
  { line: "And evening full of the linnet's wings.", expectedPattern: "u/u/uu/u/", source: "Yeats - Innisfree" },
  { line: "I will arise and go now, for always night and day", expectedPattern: "u/u/u/u/u/u/", source: "Yeats - Innisfree" },
  { line: "I hear lake water lapping with low sounds by the shore;", expectedPattern: "u/u/u/uuu/u/", source: "Yeats - Innisfree" },
  { line: "While I stand on the roadway, or on the pavements grey,", expectedPattern: "u/u/u/uuu/u/", source: "Yeats - Innisfree" },
  { line: "I hear it in the deep heart's core.", expectedPattern: "u/uu/u/", source: "Yeats - Innisfree" },

  // ========== T.S. ELIOT - The Love Song of J. Alfred Prufrock (1915) ==========
  // Free verse with iambic tendencies
  { line: "Let us go then, you and I,", expectedPattern: "u/u/u/", source: "Eliot - Prufrock" },
  { line: "When the evening is spread out against the sky", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "Like a patient etherized upon a table;", expectedPattern: "uu/u/u/uu/u", source: "Eliot - Prufrock" },
  { line: "Let us go, through certain half-deserted streets,", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "The muttering retreats", expectedPattern: "u/uu/", source: "Eliot - Prufrock" },
  { line: "Of restless nights in one-night cheap hotels", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "And sawdust restaurants with oyster-shells:", expectedPattern: "u/u/uuu/u/", source: "Eliot - Prufrock" },
  { line: "Streets that follow like a tedious argument", expectedPattern: "u/u/uu/uu/u", source: "Eliot - Prufrock" },
  { line: "Of insidious intent", expectedPattern: "uu/u/", source: "Eliot - Prufrock" },
  { line: "To lead you to an overwhelming question...", expectedPattern: "u/u/uu/u/u", source: "Eliot - Prufrock" },
  { line: "Oh, do not ask, \"What is it?\"", expectedPattern: "u/u/u/u", source: "Eliot - Prufrock" },
  { line: "Let us go and make our visit.", expectedPattern: "u/u/u/u/u", source: "Eliot - Prufrock" },
  { line: "In the room the women come and go", expectedPattern: "uu/u/u/u/", source: "Eliot - Prufrock" },
  { line: "Talking of Michelangelo.", expectedPattern: "u/u/u/u", source: "Eliot - Prufrock" },
  { line: "The yellow fog that rubs its back upon the window-panes,", expectedPattern: "u/u/u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "The yellow smoke that rubs its muzzle on the window-panes,", expectedPattern: "u/u/u/u/uu/u/", source: "Eliot - Prufrock" },
  { line: "Licked its tongue into the corners of the evening,", expectedPattern: "u/u/uu/uuu/u", source: "Eliot - Prufrock" },
  { line: "Lingered upon the pools that stand in drains,", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "Let fall upon its back the soot that falls from chimneys,", expectedPattern: "u/u/u/u/u/u/u", source: "Eliot - Prufrock" },
  { line: "Slipped by the terrace, made a sudden leap,", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "And seeing that it was a soft October night,", expectedPattern: "u/uu/u/u/u/", source: "Eliot - Prufrock" },
  { line: "Curled once about the house, and fell asleep.", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "And indeed there will be time", expectedPattern: "u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "For the yellow smoke that slides along the street,", expectedPattern: "uu/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "Rubbing its back upon the window-panes;", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "There will be time, there will be time", expectedPattern: "u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "To prepare a face to meet the faces that you meet;", expectedPattern: "uu/u/u/u/uu/", source: "Eliot - Prufrock" },
  { line: "There will be time to murder and create,", expectedPattern: "u/u/u/uu/", source: "Eliot - Prufrock" },
  { line: "And time for all the works and days of hands", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "That lift and drop a question on your plate;", expectedPattern: "u/u/u/uuu/", source: "Eliot - Prufrock" },
  { line: "Time for you and time for me,", expectedPattern: "u/u/u/u/", source: "Eliot - Prufrock" },
  { line: "And time yet for a hundred indecisions,", expectedPattern: "u/u/u/uu/u", source: "Eliot - Prufrock" },
  { line: "And for a hundred visions and revisions,", expectedPattern: "u/u/u/uuu/u", source: "Eliot - Prufrock" },
  { line: "Before the taking of a toast and tea.", expectedPattern: "u/u/uuu/u/", source: "Eliot - Prufrock" },

  // ========== LANGSTON HUGHES - Harlem (A Dream Deferred) (1951) ==========
  { line: "What happens to a dream deferred?", expectedPattern: "u/uu/u/", source: "Hughes - Harlem" },
  { line: "Does it dry up", expectedPattern: "u/u/", source: "Hughes - Harlem" },
  { line: "like a raisin in the sun?", expectedPattern: "uu/uu/", source: "Hughes - Harlem" },
  { line: "Or fester like a sore—", expectedPattern: "u/uuu/", source: "Hughes - Harlem" },
  { line: "And then run?", expectedPattern: "u/u", source: "Hughes - Harlem" },
  { line: "Does it stink like rotten meat?", expectedPattern: "u/u/u/u/", source: "Hughes - Harlem" },
  { line: "Or crust and sugar over—", expectedPattern: "u/u/u/u", source: "Hughes - Harlem" },
  { line: "like a syrupy sweet?", expectedPattern: "uu/u/", source: "Hughes - Harlem" },
  { line: "Maybe it just sags", expectedPattern: "u/u/u", source: "Hughes - Harlem" },
  { line: "like a heavy load.", expectedPattern: "uu/u/", source: "Hughes - Harlem" },
  { line: "Or does it explode?", expectedPattern: "u/u//", source: "Hughes - Harlem" },

  // ========== LANGSTON HUGHES - The Negro Speaks of Rivers (1921) ==========
  { line: "I've known rivers:", expectedPattern: "u//u", source: "Hughes - Rivers" },
  { line: "I've known rivers ancient as the world and older than the", expectedPattern: "u//uuu/u/uu/u", source: "Hughes - Rivers" },
  { line: "flow of human blood in human veins.", expectedPattern: "u/u/uu/u/", source: "Hughes - Rivers" },
  { line: "My soul has grown deep like the rivers.", expectedPattern: "u/u//uu/u", source: "Hughes - Rivers" },
  { line: "I bathed in the Euphrates when dawns were young.", expectedPattern: "u/uu/uuu/u/", source: "Hughes - Rivers" },
  { line: "I built my hut near the Congo and it lulled me to sleep.", expectedPattern: "u/u/uu/uu/u/", source: "Hughes - Rivers" },
  { line: "I looked upon the Nile and raised the pyramids above it.", expectedPattern: "u/u/u/u/u/uu/u", source: "Hughes - Rivers" },
  { line: "I heard the singing of the Mississippi when Abe Lincoln", expectedPattern: "u/u/uuu/u/u/u", source: "Hughes - Rivers" },
  { line: "went down to New Orleans, and I've seen its muddy", expectedPattern: "u/u/u/uu//u/u", source: "Hughes - Rivers" },
  { line: "bosom turn all golden in the sunset.", expectedPattern: "u/u/u/u/", source: "Hughes - Rivers" },
  { line: "I've known rivers:", expectedPattern: "u//u", source: "Hughes - Rivers" },
  { line: "Ancient, dusky rivers.", expectedPattern: "/u/u/u", source: "Hughes - Rivers" },

  // ========== SYLVIA PLATH - Lady Lazarus (1965) ==========
  { line: "I have done it again.", expectedPattern: "u/u/u/", source: "Plath - Lady Lazarus" },
  { line: "One year in every ten", expectedPattern: "u/u/u/", source: "Plath - Lady Lazarus" },
  { line: "I manage it—", expectedPattern: "u/u/", source: "Plath - Lady Lazarus" },
  { line: "A sort of walking miracle, my skin", expectedPattern: "u/u/u/uu/", source: "Plath - Lady Lazarus" },
  { line: "Bright as a Nazi lampshade,", expectedPattern: "/uu/u/u", source: "Plath - Lady Lazarus" },
  { line: "My right foot", expectedPattern: "u//", source: "Plath - Lady Lazarus" },
  { line: "A paperweight,", expectedPattern: "u/u/", source: "Plath - Lady Lazarus" },
  { line: "My face a featureless, fine", expectedPattern: "u/u/uu/", source: "Plath - Lady Lazarus" },
  { line: "Jew linen.", expectedPattern: "/u/u", source: "Plath - Lady Lazarus" },
  { line: "Peel off the napkin", expectedPattern: "/u/u/u", source: "Plath - Lady Lazarus" },
  { line: "O my enemy.", expectedPattern: "uu/u/", source: "Plath - Lady Lazarus" },
  { line: "Do I terrify?—", expectedPattern: "u/u/u", source: "Plath - Lady Lazarus" },
  { line: "The nose, the eye pits, the full set of teeth?", expectedPattern: "u/u/u/u/u/", source: "Plath - Lady Lazarus" },
  { line: "The sour breath", expectedPattern: "u//", source: "Plath - Lady Lazarus" },
  { line: "Will vanish in a day.", expectedPattern: "u/uu/", source: "Plath - Lady Lazarus" },
  { line: "Soon, soon the flesh", expectedPattern: "u/u/", source: "Plath - Lady Lazarus" },
  { line: "The grave cave ate will be", expectedPattern: "u/u/u/", source: "Plath - Lady Lazarus" },
  { line: "At home on me", expectedPattern: "u/u/", source: "Plath - Lady Lazarus" },
  { line: "And I a smiling woman.", expectedPattern: "u/u/u/u", source: "Plath - Lady Lazarus" },
  { line: "I am only thirty.", expectedPattern: "u/u/u/u", source: "Plath - Lady Lazarus" },
  { line: "And like the cat I have nine times to die.", expectedPattern: "u/u/u/u/u/", source: "Plath - Lady Lazarus" },
  { line: "This is Number Three.", expectedPattern: "u/u/u/", source: "Plath - Lady Lazarus" },
  { line: "What a trash", expectedPattern: "u/u/", source: "Plath - Lady Lazarus" },
  { line: "To annihilate each decade.", expectedPattern: "uu/u/u/u", source: "Plath - Lady Lazarus" },

  // ========== SYLVIA PLATH - Daddy (1965) ==========
  { line: "You do not do, you do not do", expectedPattern: "u/u/u/u/", source: "Plath - Daddy" },
  { line: "Any more, black shoe", expectedPattern: "u/u/u/", source: "Plath - Daddy" },
  { line: "In which I have lived like a foot", expectedPattern: "u/u/u/uu/", source: "Plath - Daddy" },
  { line: "For thirty years, poor and white,", expectedPattern: "u/u/u/u/", source: "Plath - Daddy" },
  { line: "Barely daring to breathe or Achoo.", expectedPattern: "u/u/u/u/", source: "Plath - Daddy" },
  { line: "Daddy, I have had to kill you.", expectedPattern: "/uu/u/u", source: "Plath - Daddy" },
  { line: "You died before I had time—", expectedPattern: "u/u/u/u", source: "Plath - Daddy" },
  { line: "Marble-heavy, a bag full of God,", expectedPattern: "u/u/u/u/", source: "Plath - Daddy" },
  { line: "Ghastly statue with one gray toe", expectedPattern: "/u/uu/u/", source: "Plath - Daddy" },
  { line: "Big as a Frisco seal", expectedPattern: "/uu/u/", source: "Plath - Daddy" },
  { line: "And a head in the freakish Atlantic", expectedPattern: "uu/uu/u/u", source: "Plath - Daddy" },
  { line: "Where it pours bean green over blue", expectedPattern: "u/u/u/u/", source: "Plath - Daddy" },
  { line: "In the waters off beautiful Nauset.", expectedPattern: "uu/u/u/u/u", source: "Plath - Daddy" },
  { line: "I used to pray to recover you.", expectedPattern: "u/u/u/u/", source: "Plath - Daddy" },
  { line: "Ach, du.", expectedPattern: "u/", source: "Plath - Daddy" },

  // ========== MAYA ANGELOU - Still I Rise (1978) ==========
  { line: "You may write me down in history", expectedPattern: "u/u/u/u/u", source: "Angelou - Still I Rise" },
  { line: "With your bitter, twisted lies,", expectedPattern: "uu/u/u/", source: "Angelou - Still I Rise" },
  { line: "You may trod me in the very dirt", expectedPattern: "u/u/uu/u/", source: "Angelou - Still I Rise" },
  { line: "But still, like dust, I'll rise.", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
  { line: "Does my sassiness upset you?", expectedPattern: "u/u/uu/u", source: "Angelou - Still I Rise" },
  { line: "Why are you beset with gloom?", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
  { line: "'Cause I walk like I've got oil wells", expectedPattern: "u/u/u/u/", source: "Angelou - Still I Rise" },
  { line: "Pumping in my living room.", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
  { line: "Just like moons and like suns,", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
  { line: "With the certainty of tides,", expectedPattern: "uu/uuu/", source: "Angelou - Still I Rise" },
  { line: "Just like hopes springing high,", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
  { line: "Still I'll rise.", expectedPattern: "u/u/", source: "Angelou - Still I Rise" },
  { line: "Did you want to see me broken?", expectedPattern: "u/u/u/u/u", source: "Angelou - Still I Rise" },
  { line: "Bowed head and lowered eyes?", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
  { line: "Shoulders falling down like teardrops,", expectedPattern: "/u/u/u/u", source: "Angelou - Still I Rise" },
  { line: "Weakened by my soulful cries?", expectedPattern: "/uu/u/", source: "Angelou - Still I Rise" },
  { line: "Does my haughtiness offend you?", expectedPattern: "u/u/uu/u", source: "Angelou - Still I Rise" },
  { line: "Don't you take it awful hard", expectedPattern: "u/u/u/u/", source: "Angelou - Still I Rise" },
  { line: "'Cause I laugh like I've got gold mines", expectedPattern: "u/u/u/u/", source: "Angelou - Still I Rise" },
  { line: "Diggin' in my own backyard.", expectedPattern: "u/u/u/u/", source: "Angelou - Still I Rise" },
  { line: "You may shoot me with your words,", expectedPattern: "u/u/uu/", source: "Angelou - Still I Rise" },
  { line: "You may cut me with your eyes,", expectedPattern: "u/u/uu/", source: "Angelou - Still I Rise" },
  { line: "You may kill me with your hatefulness,", expectedPattern: "u/u/uu/uu", source: "Angelou - Still I Rise" },
  { line: "But still, like air, I'll rise.", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },

  // ========== MAYA ANGELOU - Phenomenal Woman (1978) ==========
  { line: "Pretty women wonder where my secret lies.", expectedPattern: "/u/u/uu/u/", source: "Angelou - Phenomenal Woman" },
  { line: "I'm not cute or built to suit a fashion model's size", expectedPattern: "u/u/u/u/u/u/", source: "Angelou - Phenomenal Woman" },
  { line: "But when I start to tell them,", expectedPattern: "u/u/u/u", source: "Angelou - Phenomenal Woman" },
  { line: "They think I'm telling lies.", expectedPattern: "u/u/u/", source: "Angelou - Phenomenal Woman" },
  { line: "I say,", expectedPattern: "u/", source: "Angelou - Phenomenal Woman" },
  { line: "It's in the reach of my arms,", expectedPattern: "u/u/uu/", source: "Angelou - Phenomenal Woman" },
  { line: "The span of my hips,", expectedPattern: "u/uu/", source: "Angelou - Phenomenal Woman" },
  { line: "The stride of my step,", expectedPattern: "u/uu/", source: "Angelou - Phenomenal Woman" },
  { line: "The curl of my lips.", expectedPattern: "u/uu/", source: "Angelou - Phenomenal Woman" },
  { line: "I'm a woman", expectedPattern: "u/u", source: "Angelou - Phenomenal Woman" },
  { line: "Phenomenally.", expectedPattern: "u/uu", source: "Angelou - Phenomenal Woman" },
  { line: "Phenomenal woman,", expectedPattern: "u/u/u", source: "Angelou - Phenomenal Woman" },
  { line: "That's me.", expectedPattern: "u/", source: "Angelou - Phenomenal Woman" },

  // ========== E.E. CUMMINGS - i carry your heart with me (1952) ==========
  { line: "i carry your heart with me", expectedPattern: "u/uu/u/", source: "Cummings - i carry" },
  { line: "i carry it in my heart", expectedPattern: "u/u/u/", source: "Cummings - i carry" },
  { line: "i am never without it", expectedPattern: "u/u/u/u", source: "Cummings - i carry" },
  { line: "anywhere i go you go my dear", expectedPattern: "u/u/u/u/u/", source: "Cummings - i carry" },
  { line: "and whatever is done by only me is your doing my darling", expectedPattern: "u/u/u/u/u/u/u/u", source: "Cummings - i carry" },
  { line: "i fear no fate", expectedPattern: "u/u/", source: "Cummings - i carry" },
  { line: "for you are my fate my sweet", expectedPattern: "u/u/u/u/", source: "Cummings - i carry" },
  { line: "i want no world", expectedPattern: "u/u/", source: "Cummings - i carry" },
  { line: "for beautiful you are my world my true", expectedPattern: "u/uuu/u/u/", source: "Cummings - i carry" },
  { line: "and it's you are whatever a moon has always meant", expectedPattern: "u/u/u/uu/u/u/", source: "Cummings - i carry" },
  { line: "and whatever a sun will always sing is you", expectedPattern: "u/uuu/u/u/u/", source: "Cummings - i carry" },
  { line: "here is the deepest secret nobody knows", expectedPattern: "u/u/u/uu/u/", source: "Cummings - i carry" },
  { line: "here is the root of the root and the bud of the bud", expectedPattern: "u/u/uu/uu/uu/", source: "Cummings - i carry" },
  { line: "and the sky of the sky of a tree called life", expectedPattern: "uu/uu/uu/u/", source: "Cummings - i carry" },
  { line: "which grows higher than soul can hope or mind can hide", expectedPattern: "u/u/u/u/u/u/", source: "Cummings - i carry" },
  { line: "and this is the wonder that's keeping the stars apart", expectedPattern: "u/u/u/u/u/u/", source: "Cummings - i carry" },
  { line: "i carry your heart", expectedPattern: "u/uu/", source: "Cummings - i carry" },
  { line: "i carry it in my heart", expectedPattern: "u/u/u/", source: "Cummings - i carry" },

  // ========== WILLIAM CARLOS WILLIAMS - The Red Wheelbarrow (1923) ==========
  { line: "so much depends", expectedPattern: "u/u/", source: "Williams - Red Wheelbarrow" },
  { line: "upon", expectedPattern: "u/", source: "Williams - Red Wheelbarrow" },
  { line: "a red wheel", expectedPattern: "u//", source: "Williams - Red Wheelbarrow" },
  { line: "barrow", expectedPattern: "/u", source: "Williams - Red Wheelbarrow" },
  { line: "glazed with rain", expectedPattern: "u/u/", source: "Williams - Red Wheelbarrow" },
  { line: "water", expectedPattern: "/u", source: "Williams - Red Wheelbarrow" },
  { line: "beside the white", expectedPattern: "u/u/", source: "Williams - Red Wheelbarrow" },
  { line: "chickens", expectedPattern: "/u", source: "Williams - Red Wheelbarrow" },

  // ========== WILLIAM CARLOS WILLIAMS - This Is Just to Say (1934) ==========
  { line: "I have eaten", expectedPattern: "u/u/u", source: "Williams - This Is Just to Say" },
  { line: "the plums", expectedPattern: "u/", source: "Williams - This Is Just to Say" },
  { line: "that were in", expectedPattern: "u/u", source: "Williams - This Is Just to Say" },
  { line: "the icebox", expectedPattern: "u/u", source: "Williams - This Is Just to Say" },
  { line: "and which", expectedPattern: "u/", source: "Williams - This Is Just to Say" },
  { line: "you were probably", expectedPattern: "u/u/u", source: "Williams - This Is Just to Say" },
  { line: "saving", expectedPattern: "/u", source: "Williams - This Is Just to Say" },
  { line: "for breakfast", expectedPattern: "u/u", source: "Williams - This Is Just to Say" },
  { line: "Forgive me", expectedPattern: "u/u", source: "Williams - This Is Just to Say" },
  { line: "they were delicious", expectedPattern: "u/u/u", source: "Williams - This Is Just to Say" },
  { line: "so sweet", expectedPattern: "u/", source: "Williams - This Is Just to Say" },
  { line: "and so cold", expectedPattern: "u/u/", source: "Williams - This Is Just to Say" },

  // ========== DYLAN THOMAS - Do not go gentle into that good night (1951) ==========
  // Villanelle in iambic pentameter
  { line: "Do not go gentle into that good night,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Old age should burn and rave at close of day;", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Rage, rage against the dying of the light.", expectedPattern: "//u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Though wise men at their end know dark is right,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Because their words had forked no lightning they", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Good men, the last wave by, crying how bright", expectedPattern: "//u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Their frail deeds might have danced in a green bay,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Wild men who caught and sang the sun in flight,", expectedPattern: "//u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "And learn, too late, they grieved it on its way,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Grave men, near death, who see with blinding sight", expectedPattern: "//u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Blind eyes could blaze like meteors and be gay,", expectedPattern: "//u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "And you, my father, there on the sad height,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  { line: "Curse, bless, me now with your fierce tears, I pray.", expectedPattern: "//u/u/u/u/", source: "Thomas - Do Not Go Gentle" },

  // ========== DYLAN THOMAS - Fern Hill (1945) ==========
  { line: "Now as I was young and easy under the apple boughs", expectedPattern: "u/u/u/u/uu/u/", source: "Thomas - Fern Hill" },
  { line: "About the lilting house and happy as the grass was green,", expectedPattern: "u/u/u/u/uuu/u/", source: "Thomas - Fern Hill" },
  { line: "The night above the dingle starry,", expectedPattern: "u/u/u/u/u", source: "Thomas - Fern Hill" },
  { line: "Time let me hail and climb", expectedPattern: "u/u/u/", source: "Thomas - Fern Hill" },
  { line: "Golden in the heydays of his eyes,", expectedPattern: "/uuu/uuu/", source: "Thomas - Fern Hill" },
  { line: "And honored among wagons I was prince of the apple towns", expectedPattern: "u/uu/uuu/uu/u/", source: "Thomas - Fern Hill" },
  { line: "And once below a time I lordly had the trees and leaves", expectedPattern: "u/u/u/u/uu/u/", source: "Thomas - Fern Hill" },
  { line: "Trail with daisies and barley", expectedPattern: "/u/uu/u", source: "Thomas - Fern Hill" },
  { line: "Down the rivers of the windfall light.", expectedPattern: "u/uuu/u/", source: "Thomas - Fern Hill" },
  { line: "And as I was green and carefree, famous among the barns", expectedPattern: "u/u//u/u/uuu/", source: "Thomas - Fern Hill" },
  { line: "About the happy yard and singing as the farm was home,", expectedPattern: "u/u/u/u/uuu/u/", source: "Thomas - Fern Hill" },
  { line: "In the sun that is young once only,", expectedPattern: "uu/u//u/u", source: "Thomas - Fern Hill" },
  { line: "Time let me play and be", expectedPattern: "u/u/u/", source: "Thomas - Fern Hill" },
  { line: "Golden in the mercy of his means,", expectedPattern: "/uuu/uu/", source: "Thomas - Fern Hill" },
  { line: "And green and golden I was huntsman and herdsman, the calves", expectedPattern: "u/u/uu/uuu/uu/", source: "Thomas - Fern Hill" },
  { line: "Sang to my horn, the foxes on the hills barked clear and cold,", expectedPattern: "/uu/u/uuu/u/u/", source: "Thomas - Fern Hill" },
  { line: "And the sabbath rang slowly", expectedPattern: "uu/u/u/u", source: "Thomas - Fern Hill" },
  { line: "In the pebbles of the holy streams.", expectedPattern: "uu/uuu/u/", source: "Thomas - Fern Hill" },

  // ========== PHILIP LARKIN - This Be The Verse (1971) ==========
  { line: "They fuck you up, your mum and dad.", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "They may not mean to, but they do.", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "They fill you with the faults they had", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "And add some extra, just for you.", expectedPattern: "u/u/uu/u/", source: "Larkin - This Be The Verse" },
  { line: "But they were fucked up in their turn", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "By fools in old-style hats and coats,", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "Who half the time were soppy-stern", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "And half at one another's throats.", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "Man hands on misery to man.", expectedPattern: "u/u/uu/", source: "Larkin - This Be The Verse" },
  { line: "It deepens like a coastal shelf.", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },
  { line: "Get out as early as you can,", expectedPattern: "u/u/uu/", source: "Larkin - This Be The Verse" },
  { line: "And don't have any kids yourself.", expectedPattern: "u/u/u/u/", source: "Larkin - This Be The Verse" },

  // ========== PHILIP LARKIN - The Whitsun Weddings (1958) ==========
  { line: "That Whitsun, I was late getting away:", expectedPattern: "u/uu/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "Not till about", expectedPattern: "u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "One-twenty on the sunlit Saturday", expectedPattern: "u/uuu/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "Did my three-quarters-empty train pull out,", expectedPattern: "u/u/uu/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "All windows down, all cushions hot, all sense", expectedPattern: "u/u/u/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "Of being in a hurry gone. We ran", expectedPattern: "u/uu/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "Behind the backs of houses, crossed a street", expectedPattern: "u/u/u/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "Of blinding windscreens, smelt the fish-dock; thence", expectedPattern: "u/u/u/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "The river's level drifting breadth began,", expectedPattern: "u/u/u/u/u/", source: "Larkin - Whitsun Weddings" },
  { line: "Where sky and Lincolnshire and water meet.", expectedPattern: "u/u/uuu/u/", source: "Larkin - Whitsun Weddings" },

  // ========== SEAMUS HEANEY - Digging (1966) ==========
  { line: "Between my finger and my thumb", expectedPattern: "u/u/uu/", source: "Heaney - Digging" },
  { line: "The squat pen rests; snug as a gun.", expectedPattern: "u/u/u/uu/", source: "Heaney - Digging" },
  { line: "Under my window, a clean rasping sound", expectedPattern: "u/u/uu/u/u/", source: "Heaney - Digging" },
  { line: "When the spade sinks into gravelly ground:", expectedPattern: "uu/u/u/uu/", source: "Heaney - Digging" },
  { line: "My father, digging. I look down", expectedPattern: "u/u/uu/u/", source: "Heaney - Digging" },
  { line: "Till his straining rump among the flowerbeds", expectedPattern: "u/u/u/uu/u/", source: "Heaney - Digging" },
  { line: "Bends low, comes up twenty years away", expectedPattern: "/u/u/u/u/", source: "Heaney - Digging" },
  { line: "Stooping in rhythm through potato drills", expectedPattern: "/uu/u/u/u/", source: "Heaney - Digging" },
  { line: "Where he was digging.", expectedPattern: "u//u/u", source: "Heaney - Digging" },
  { line: "The coarse boot nestled on the lug, the shaft", expectedPattern: "u//u/uu/u/", source: "Heaney - Digging" },
  { line: "Against the inside knee was levered firmly.", expectedPattern: "u/u/u/u/u/u", source: "Heaney - Digging" },
  { line: "He rooted out tall tops, buried the bright edge deep", expectedPattern: "u/uu/u/uu/u/", source: "Heaney - Digging" },
  { line: "To scatter new potatoes that we picked,", expectedPattern: "u/u/u/uu/", source: "Heaney - Digging" },
  { line: "Loving their cool hardness in our hands.", expectedPattern: "/uu/u/uu/", source: "Heaney - Digging" },
  { line: "By God, the old man could handle a spade.", expectedPattern: "u/u//u/uu/", source: "Heaney - Digging" },
  { line: "Just like his old man.", expectedPattern: "/uu//", source: "Heaney - Digging" },
  { line: "My grandfather cut more turf in a day", expectedPattern: "u/u/u/uu/", source: "Heaney - Digging" },
  { line: "Than any other man on Toner's bog.", expectedPattern: "uu/u/u/u/", source: "Heaney - Digging" },
  { line: "Once I carried him milk in a bottle", expectedPattern: "/u/uu/uu/u", source: "Heaney - Digging" },
  { line: "Corked sloppily with paper. He straightened up", expectedPattern: "/u/uu/u/u/", source: "Heaney - Digging" },
  { line: "To drink it, then fell to right away", expectedPattern: "u/u/u/u/", source: "Heaney - Digging" },
  { line: "Nicking and slicing neatly, heaving sods", expectedPattern: "/uu/u/u/u/", source: "Heaney - Digging" },
  { line: "Over his shoulder, going down and down", expectedPattern: "u/u/uu/u/", source: "Heaney - Digging" },
  { line: "For the good turf. Digging.", expectedPattern: "uu/uu/u", source: "Heaney - Digging" },
  { line: "The cold smell of potato mould, the squelch and slap", expectedPattern: "u//u/u//u/u/", source: "Heaney - Digging" },
  { line: "Of soggy peat, the curt cuts of an edge", expectedPattern: "u/u/u//uu/", source: "Heaney - Digging" },
  { line: "Through living roots awaken in my head.", expectedPattern: "u/u/u/uu/", source: "Heaney - Digging" },
  { line: "But I've no spade to follow men like them.", expectedPattern: "uu//u/u/u/", source: "Heaney - Digging" },
  { line: "Between my finger and my thumb", expectedPattern: "u/u/uu/", source: "Heaney - Digging" },
  { line: "The squat pen rests.", expectedPattern: "u//u/", source: "Heaney - Digging" },
  { line: "I'll dig with it.", expectedPattern: "u/u/", source: "Heaney - Digging" },

  // ========== SEAMUS HEANEY - Mid-Term Break (1966) ==========
  { line: "I sat all morning in the college sick bay", expectedPattern: "u/u/uu/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "Counting bells knelling classes to a close.", expectedPattern: "/u/u/u/uu/", source: "Heaney - Mid-Term Break" },
  { line: "At two o'clock our neighbors drove me home.", expectedPattern: "u/u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "In the porch I met my father crying—", expectedPattern: "uu/u/u/u/u", source: "Heaney - Mid-Term Break" },
  { line: "He had always taken funerals in his stride—", expectedPattern: "u/u/u/u/uu/", source: "Heaney - Mid-Term Break" },
  { line: "And Big Jim Evans saying it was a hard blow.", expectedPattern: "u///u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "The baby cooed and laughed and rocked the pram", expectedPattern: "u/u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "When I came in, and I was embarrassed", expectedPattern: "u/u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "By old men standing up to shake my hand", expectedPattern: "u//u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "And tell me they were 'sorry for my trouble.'", expectedPattern: "u/u/u/u/u/u", source: "Heaney - Mid-Term Break" },
  { line: "Whispers informed strangers I was the eldest,", expectedPattern: "/uu/u/u/u/u", source: "Heaney - Mid-Term Break" },
  { line: "Away at school, as my mother held my hand", expectedPattern: "u/u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "In hers and coughed out angry tearless sighs.", expectedPattern: "u/u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "At ten o'clock the ambulance arrived", expectedPattern: "u/u/u/uuu/", source: "Heaney - Mid-Term Break" },
  { line: "With the corpse, stanched and bandaged by the nurses.", expectedPattern: "uu//u/uu/u", source: "Heaney - Mid-Term Break" },
  { line: "Next morning I went up into the room. Snowdrops", expectedPattern: "/u/u/u/uu/u/u", source: "Heaney - Mid-Term Break" },
  { line: "And candles soothed the bedside; I saw him", expectedPattern: "u/u/u/u/u/u", source: "Heaney - Mid-Term Break" },
  { line: "For the first time in six weeks. Paler now,", expectedPattern: "uu/u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "Wearing a poppy bruise on his left temple,", expectedPattern: "/uu/u/u/u/u", source: "Heaney - Mid-Term Break" },
  { line: "He lay in the four-foot box as in his cot.", expectedPattern: "u/uu/u/uu/", source: "Heaney - Mid-Term Break" },
  { line: "No gaudy scars, the bumper knocked him clear.", expectedPattern: "u/u/u/u/u/", source: "Heaney - Mid-Term Break" },
  { line: "A four-foot box, a foot for every year.", expectedPattern: "u/u/u/u/u/", source: "Heaney - Mid-Term Break" },

  // ========== W.H. AUDEN - Funeral Blues (1936) ==========
  { line: "Stop all the clocks, cut off the telephone,", expectedPattern: "/u/u/uu/u/", source: "Auden - Funeral Blues" },
  { line: "Prevent the dog from barking with a juicy bone,", expectedPattern: "u/u/u/uuu/u/", source: "Auden - Funeral Blues" },
  { line: "Silence the pianos and with muffled drum", expectedPattern: "/uu/uu/u/", source: "Auden - Funeral Blues" },
  { line: "Bring out the coffin, let the mourners come.", expectedPattern: "/uu/u/u/u/", source: "Auden - Funeral Blues" },
  { line: "Let aeroplanes circle moaning overhead", expectedPattern: "u/u/u/u/u/", source: "Auden - Funeral Blues" },
  { line: "Scribbling on the sky the message: He is Dead.", expectedPattern: "u/uu/u/uu/", source: "Auden - Funeral Blues" },
  { line: "Put crepe bows round the white necks of the public doves,", expectedPattern: "u//u/u/uu/u/", source: "Auden - Funeral Blues" },
  { line: "Let the traffic policemen wear black cotton gloves.", expectedPattern: "uu/u/u/u/u/", source: "Auden - Funeral Blues" },
  { line: "He was my North, my South, my East and West,", expectedPattern: "u/u/u/u/u/", source: "Auden - Funeral Blues" },
  { line: "My working week and my Sunday rest,", expectedPattern: "u/u/uu/u/", source: "Auden - Funeral Blues" },
  { line: "My noon, my midnight, my talk, my song;", expectedPattern: "u/u/u/u/", source: "Auden - Funeral Blues" },
  { line: "I thought that love would last forever: I was wrong.", expectedPattern: "u/u/u/u/uu/", source: "Auden - Funeral Blues" },
  { line: "The stars are not wanted now; put out every one,", expectedPattern: "u/u/u/u/u/u/u", source: "Auden - Funeral Blues" },
  { line: "Pack up the moon and dismantle the sun,", expectedPattern: "u/u/uu/u/", source: "Auden - Funeral Blues" },
  { line: "Pour away the ocean and sweep up the wood;", expectedPattern: "u/u/u/uu/", source: "Auden - Funeral Blues" },
  { line: "For nothing now can ever come to any good.", expectedPattern: "u/u/u/u/uu/u/", source: "Auden - Funeral Blues" },

  // ========== W.H. AUDEN - September 1, 1939 (1939) ==========
  { line: "I sit in one of the dives", expectedPattern: "u/u/uu/", source: "Auden - September 1, 1939" },
  { line: "On Fifty-second Street", expectedPattern: "u/u/u/", source: "Auden - September 1, 1939" },
  { line: "Uncertain and afraid", expectedPattern: "u/uu/", source: "Auden - September 1, 1939" },
  { line: "As the clever hopes expire", expectedPattern: "uu/u/u/", source: "Auden - September 1, 1939" },
  { line: "Of a low dishonest decade:", expectedPattern: "uu/u/u/u", source: "Auden - September 1, 1939" },
  { line: "Waves of anger and fear", expectedPattern: "/uu/u/", source: "Auden - September 1, 1939" },
  { line: "Circulate over the bright", expectedPattern: "/u/u/u/", source: "Auden - September 1, 1939" },
  { line: "And darkened lands of the earth,", expectedPattern: "u/u/uu/", source: "Auden - September 1, 1939" },
  { line: "Obsessing our private lives;", expectedPattern: "u/uu/u/", source: "Auden - September 1, 1939" },
  { line: "The unmentionable odour of death", expectedPattern: "uu/uu/u/", source: "Auden - September 1, 1939" },
  { line: "Offends the September night.", expectedPattern: "u/u/u/", source: "Auden - September 1, 1939" },

  // ========== ELIZABETH BISHOP - One Art (1976) ==========
  // Villanelle
  { line: "The art of losing isn't hard to master;", expectedPattern: "u/u/uu/u/u", source: "Bishop - One Art" },
  { line: "so many things seem filled with the intent", expectedPattern: "u/u/u/u/u/", source: "Bishop - One Art" },
  { line: "to be lost that their loss is no disaster.", expectedPattern: "uu/u/u/u/u", source: "Bishop - One Art" },
  { line: "Lose something every day. Accept the fluster", expectedPattern: "/uuu/u/u/u", source: "Bishop - One Art" },
  { line: "of lost door keys, the hour badly spent.", expectedPattern: "u//u/u/u/", source: "Bishop - One Art" },
  { line: "The art of losing isn't hard to master.", expectedPattern: "u/u/uu/u/u", source: "Bishop - One Art" },
  { line: "Then practice losing farther, losing faster:", expectedPattern: "u/u/u/u/u/u", source: "Bishop - One Art" },
  { line: "places, and names, and where it was you meant", expectedPattern: "/uu/u/u/u/", source: "Bishop - One Art" },
  { line: "to travel. None of these will bring disaster.", expectedPattern: "u/u/u/u/u/u", source: "Bishop - One Art" },
  { line: "I lost my mother's watch. And look! my last, or", expectedPattern: "u/u/u/u/u/u", source: "Bishop - One Art" },
  { line: "next-to-last, of three loved houses went.", expectedPattern: "u/u/u/u/u/", source: "Bishop - One Art" },
  { line: "I lost two cities, lovely ones. And, vaster,", expectedPattern: "u/u/u/uu/u/u", source: "Bishop - One Art" },
  { line: "some realms I owned, two rivers, a continent.", expectedPattern: "u/u/u/uu/u", source: "Bishop - One Art" },
  { line: "I miss them, but it wasn't a disaster.", expectedPattern: "u/u/u/uu/u", source: "Bishop - One Art" },
  { line: "—Even losing you (the joking voice, a gesture", expectedPattern: "u/u/u/u/u/u/u", source: "Bishop - One Art" },
  { line: "I love) I shan't have lied. It's evident", expectedPattern: "u/u/u/u/u", source: "Bishop - One Art" },
  { line: "the art of losing's not too hard to master", expectedPattern: "u/u/uu/u/u/u", source: "Bishop - One Art" },
  { line: "though it may look like (Write it!) like disaster.", expectedPattern: "u/u/u/u/u/u", source: "Bishop - One Art" },

  // ========== WALLACE STEVENS - The Emperor of Ice-Cream (1923) ==========
  { line: "Call the roller of big cigars,", expectedPattern: "/u/uu/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "The muscular one, and bid him whip", expectedPattern: "u/uuu/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "In kitchen cups concupiscent curds.", expectedPattern: "u/u/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "Let the wenches dawdle in such dress", expectedPattern: "uu/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "As they are used to wear, and let the boys", expectedPattern: "u/u/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "Bring flowers in last month's newspapers.", expectedPattern: "/uuu/u/uu", source: "Stevens - Emperor of Ice-Cream" },
  { line: "Let be be finale of seem.", expectedPattern: "u/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "The only emperor is the emperor of ice-cream.", expectedPattern: "u/u/uuu/uuu/u", source: "Stevens - Emperor of Ice-Cream" },
  { line: "Take from the dresser of deal,", expectedPattern: "/uu/uu/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "Lacking the three glass knobs, that sheet", expectedPattern: "u/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "On which she embroidered fantails once", expectedPattern: "u/uu/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "And spread it so as to cover her face.", expectedPattern: "u/u/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "If her horny feet protrude, they come", expectedPattern: "uu/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "To show how cold she is, and dumb.", expectedPattern: "u/u/u/u/", source: "Stevens - Emperor of Ice-Cream" },
  { line: "Let the lamp affix its beam.", expectedPattern: "uu/u/u/", source: "Stevens - Emperor of Ice-Cream" },

  // ========== ALLEN GINSBERG - Howl (1955) - Opening ==========
  { line: "I saw the best minds of my generation destroyed by madness,", expectedPattern: "u/u/uuu/u/u/u/u", source: "Ginsberg - Howl" },
  { line: "starving hysterical naked,", expectedPattern: "/uu/uu/u", source: "Ginsberg - Howl" },
  { line: "dragging themselves through the negro streets at dawn", expectedPattern: "/uu/u/u/u/", source: "Ginsberg - Howl" },
  { line: "looking for an angry fix,", expectedPattern: "/uu/u/", source: "Ginsberg - Howl" },
  { line: "angelheaded hipsters burning for the ancient heavenly", expectedPattern: "/u/u/uu/u/u/uu", source: "Ginsberg - Howl" },
  { line: "connection to the starry dynamo in the machinery of night,", expectedPattern: "u/u/u/u/uuu/u/uu/", source: "Ginsberg - Howl" },
  { line: "who poverty and tatters and hollow-eyed and high sat up smoking", expectedPattern: "u/u/uu/uu/uu/u/u", source: "Ginsberg - Howl" },
  { line: "in the supernatural darkness of cold-water flats", expectedPattern: "uu/u/u/uu/u/", source: "Ginsberg - Howl" },
  { line: "floating across the tops of cities contemplating jazz,", expectedPattern: "/uu/u/u/uu/u/", source: "Ginsberg - Howl" },

  // ========== BILLY COLLINS - Introduction to Poetry (1988) ==========
  { line: "I ask them to take a poem", expectedPattern: "u/uu/u/", source: "Collins - Introduction to Poetry" },
  { line: "and hold it up to the light", expectedPattern: "u/u/uu/", source: "Collins - Introduction to Poetry" },
  { line: "like a color slide", expectedPattern: "uu/u/", source: "Collins - Introduction to Poetry" },
  { line: "or press an ear against its hive.", expectedPattern: "u/u/u/u/", source: "Collins - Introduction to Poetry" },
  { line: "I say drop a mouse into a poem", expectedPattern: "u/u/u/uu/", source: "Collins - Introduction to Poetry" },
  { line: "and watch him probe his way out,", expectedPattern: "u/u//u/u", source: "Collins - Introduction to Poetry" },
  { line: "or walk inside the poem's room", expectedPattern: "u/u/u/u/", source: "Collins - Introduction to Poetry" },
  { line: "and feel the walls for a light switch.", expectedPattern: "u/u/uu/u", source: "Collins - Introduction to Poetry" },
  { line: "I want them to water-ski", expectedPattern: "u/uu/u/", source: "Collins - Introduction to Poetry" },
  { line: "across the surface of a poem", expectedPattern: "u/u/uuu/", source: "Collins - Introduction to Poetry" },
  { line: "waving at the author's name on the shore.", expectedPattern: "/uu/u/uu/", source: "Collins - Introduction to Poetry" },
  { line: "But all they want to do", expectedPattern: "u/u/u/", source: "Collins - Introduction to Poetry" },
  { line: "is tie the poem to a chair with rope", expectedPattern: "u/u/uu/u/", source: "Collins - Introduction to Poetry" },
  { line: "and torture a confession out of it.", expectedPattern: "u/uu/u/u/", source: "Collins - Introduction to Poetry" },
  { line: "They begin beating it with a hose", expectedPattern: "u/u/uu/", source: "Collins - Introduction to Poetry" },
  { line: "to find out what it really means.", expectedPattern: "u/u/u/u/", source: "Collins - Introduction to Poetry" },

  // ========== MARY OLIVER - The Summer Day (1990) ==========
  { line: "Who made the world?", expectedPattern: "u/u/", source: "Oliver - Summer Day" },
  { line: "Who made the swan, and the black bear?", expectedPattern: "u/u/uu/u", source: "Oliver - Summer Day" },
  { line: "Who made the grasshopper?", expectedPattern: "u/u/uu", source: "Oliver - Summer Day" },
  { line: "This grasshopper, I mean—", expectedPattern: "u/uu/", source: "Oliver - Summer Day" },
  { line: "the one who has flung herself out of the grass,", expectedPattern: "u/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "the one who is eating sugar out of my hand,", expectedPattern: "u/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "who is moving her jaws back and forth instead of up and down—", expectedPattern: "u/uu/u/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "who is gazing around with her enormous and complicated eyes.", expectedPattern: "u/u/u/u/u/uu/u/", source: "Oliver - Summer Day" },
  { line: "Now she lifts her pale forearms and thoroughly washes her face.", expectedPattern: "/u/u/u/uu/uu/", source: "Oliver - Summer Day" },
  { line: "Now she snaps her wings open, and floats away.", expectedPattern: "/u/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "I don't know exactly what a prayer is.", expectedPattern: "u/u/u/uu/u", source: "Oliver - Summer Day" },
  { line: "I do know how to pay attention, how to fall down", expectedPattern: "u/u/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "into the grass, how to kneel down in the grass,", expectedPattern: "uu/u/u/uu/", source: "Oliver - Summer Day" },
  { line: "how to be idle and blessed, how to stroll through the fields,", expectedPattern: "u/u/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "which is what I have been doing all day.", expectedPattern: "u/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "Tell me, what else should I have done?", expectedPattern: "/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "Doesn't everything die at last, and too soon?", expectedPattern: "u/u/u/uu/u/", source: "Oliver - Summer Day" },
  { line: "Tell me, what is it you plan to do", expectedPattern: "/u/u/u/u/", source: "Oliver - Summer Day" },
  { line: "with your one wild and precious life?", expectedPattern: "u/u/u/uu/", source: "Oliver - Summer Day" },

  // ========== MARY OLIVER - Wild Geese (1986) ==========
  { line: "You do not have to be good.", expectedPattern: "u/u/u/u/", source: "Oliver - Wild Geese" },
  { line: "You do not have to walk on your knees", expectedPattern: "u/u/u/uu/", source: "Oliver - Wild Geese" },
  { line: "for a hundred miles through the desert, repenting.", expectedPattern: "uu/u/u/u/u/u", source: "Oliver - Wild Geese" },
  { line: "You only have to let the soft animal of your body", expectedPattern: "u/u/u/u/u/uu/u", source: "Oliver - Wild Geese" },
  { line: "love what it loves.", expectedPattern: "/u/u/", source: "Oliver - Wild Geese" },
  { line: "Tell me about despair, yours, and I will tell you mine.", expectedPattern: "/uu/u/u/u/u/u/", source: "Oliver - Wild Geese" },
  { line: "Meanwhile the world goes on.", expectedPattern: "/u/u/u/", source: "Oliver - Wild Geese" },
  { line: "Meanwhile the sun and the clear pebbles of the rain", expectedPattern: "/u/u/uu/u/uu/", source: "Oliver - Wild Geese" },
  { line: "are moving across the landscapes,", expectedPattern: "u/u/u/u", source: "Oliver - Wild Geese" },
  { line: "over the prairies and the deep trees,", expectedPattern: "/uu/uuu/u", source: "Oliver - Wild Geese" },
  { line: "the mountains and the rivers.", expectedPattern: "u/uu/u", source: "Oliver - Wild Geese" },
  { line: "Meanwhile the wild geese, high in the clean blue air,", expectedPattern: "/u/u/u/uu/u/", source: "Oliver - Wild Geese" },
  { line: "are heading home again.", expectedPattern: "u/u/u/", source: "Oliver - Wild Geese" },
  { line: "Whoever you are, no matter how lonely,", expectedPattern: "/uu/u/u/u", source: "Oliver - Wild Geese" },
  { line: "the world offers itself to your imagination,", expectedPattern: "u/u/u/uu/u/u", source: "Oliver - Wild Geese" },
  { line: "calls to you like the wild geese, harsh and exciting—", expectedPattern: "/u/u/u/u/uu/u", source: "Oliver - Wild Geese" },
  { line: "over and over announcing your place", expectedPattern: "/uu/uu/u/", source: "Oliver - Wild Geese" },
  { line: "in the family of things.", expectedPattern: "uu/uu/", source: "Oliver - Wild Geese" },

  // ========== ADRIENNE RICH - Diving into the Wreck (1973) ==========
  { line: "First having read the book of myths,", expectedPattern: "/u/u/u/", source: "Rich - Diving into the Wreck" },
  { line: "and loaded the camera,", expectedPattern: "u/uu/uu", source: "Rich - Diving into the Wreck" },
  { line: "and checked the edge of the knife-blade,", expectedPattern: "u/u/uu/u", source: "Rich - Diving into the Wreck" },
  { line: "I put on", expectedPattern: "u/u", source: "Rich - Diving into the Wreck" },
  { line: "the body-armor of black rubber", expectedPattern: "u/u/uu/u/u", source: "Rich - Diving into the Wreck" },
  { line: "the absurd flippers", expectedPattern: "u/u/u", source: "Rich - Diving into the Wreck" },
  { line: "the grave and awkward mask.", expectedPattern: "u/u/u/", source: "Rich - Diving into the Wreck" },
  { line: "I am having to do this", expectedPattern: "u/u/u/u", source: "Rich - Diving into the Wreck" },
  { line: "not like Cousteau with his", expectedPattern: "u/u/u/", source: "Rich - Diving into the Wreck" },
  { line: "assiduous team", expectedPattern: "u/uu/", source: "Rich - Diving into the Wreck" },
  { line: "aboard the sun-flooded schooner", expectedPattern: "u/u/uu/u", source: "Rich - Diving into the Wreck" },
  { line: "but here alone.", expectedPattern: "u/u/", source: "Rich - Diving into the Wreck" },
  { line: "There is a ladder.", expectedPattern: "u/u/u", source: "Rich - Diving into the Wreck" },
  { line: "The ladder is always there", expectedPattern: "u/u/u/u/", source: "Rich - Diving into the Wreck" },
  { line: "hanging innocently", expectedPattern: "/uu/u", source: "Rich - Diving into the Wreck" },
  { line: "close to the side of the schooner.", expectedPattern: "/uu/uu/u", source: "Rich - Diving into the Wreck" },
  { line: "We know what it is for,", expectedPattern: "u/u/u/", source: "Rich - Diving into the Wreck" },
  { line: "we who have used it.", expectedPattern: "u/u/u", source: "Rich - Diving into the Wreck" },
  { line: "Otherwise", expectedPattern: "/uu/", source: "Rich - Diving into the Wreck" },
  { line: "it is a piece of maritime floss,", expectedPattern: "u/u/u/u/", source: "Rich - Diving into the Wreck" },
  { line: "some sundry equipment.", expectedPattern: "u/u/u/u", source: "Rich - Diving into the Wreck" },

  // ========== DEREK WALCOTT - A Far Cry from Africa (1962) ==========
  { line: "A wind is ruffling the tawny pelt", expectedPattern: "u/u/uu/u/", source: "Walcott - Far Cry from Africa" },
  { line: "Of Africa. Kikuyu, quick as flies,", expectedPattern: "u/uu/uu/u/", source: "Walcott - Far Cry from Africa" },
  { line: "Batten upon the bloodstreams of the veldt.", expectedPattern: "/uu/u/uu/", source: "Walcott - Far Cry from Africa" },
  { line: "Corpses are scattered through a paradise.", expectedPattern: "/uu/uuu/u/", source: "Walcott - Far Cry from Africa" },
  { line: "Only the worm, colonel of carrion, cries:", expectedPattern: "/uu/u/uu/u/", source: "Walcott - Far Cry from Africa" },
  { line: "'Waste no compassion on these separate dead!'", expectedPattern: "/u/u/uu/u/", source: "Walcott - Far Cry from Africa" },
  { line: "Statistics justify and scholars seize", expectedPattern: "u/uu/u/u/", source: "Walcott - Far Cry from Africa" },
  { line: "The salients of colonial policy.", expectedPattern: "u/uuu/u/u/", source: "Walcott - Far Cry from Africa" },
  { line: "What is that to the white child hacked in bed?", expectedPattern: "u/uu/u/u/", source: "Walcott - Far Cry from Africa" },
  { line: "To savages, expendable as Jews?", expectedPattern: "u/uu/uu/", source: "Walcott - Far Cry from Africa" },

  // ========== GWENDOLYN BROOKS - We Real Cool (1960) ==========
  { line: "We real cool. We", expectedPattern: "u/u/u", source: "Brooks - We Real Cool" },
  { line: "Left school. We", expectedPattern: "/u/u", source: "Brooks - We Real Cool" },
  { line: "Lurk late. We", expectedPattern: "/u/u", source: "Brooks - We Real Cool" },
  { line: "Strike straight. We", expectedPattern: "/u/u", source: "Brooks - We Real Cool" },
  { line: "Sing sin. We", expectedPattern: "/u/u", source: "Brooks - We Real Cool" },
  { line: "Thin gin. We", expectedPattern: "/u/u", source: "Brooks - We Real Cool" },
  { line: "Jazz June. We", expectedPattern: "/u/u", source: "Brooks - We Real Cool" },
  { line: "Die soon.", expectedPattern: "/u", source: "Brooks - We Real Cool" },

  // ========== ANNE SEXTON - Her Kind (1960) ==========
  { line: "I have gone out, a possessed witch,", expectedPattern: "u/u/u/u/", source: "Sexton - Her Kind" },
  { line: "haunting the black air, braver at night;", expectedPattern: "/uu/u/uu/", source: "Sexton - Her Kind" },
  { line: "dreaming evil, I have done my hitch", expectedPattern: "/u/uu/u/", source: "Sexton - Her Kind" },
  { line: "over the plain houses, light by light:", expectedPattern: "/uu/u/u/", source: "Sexton - Her Kind" },
  { line: "lonely thing, twelve-fingered, out of mind.", expectedPattern: "/u//u/u/", source: "Sexton - Her Kind" },
  { line: "A woman like that is not a woman, quite.", expectedPattern: "u/u/u/uu/u/", source: "Sexton - Her Kind" },
  { line: "I have been her kind.", expectedPattern: "u/u/u/", source: "Sexton - Her Kind" },
  { line: "I have found the warm caves in the woods,", expectedPattern: "u/u/u/uu/", source: "Sexton - Her Kind" },
  { line: "filled them with skillets, carvings, shelves,", expectedPattern: "/uu/u/u/", source: "Sexton - Her Kind" },
  { line: "closets, silks, innumerable goods;", expectedPattern: "/u/uu/u/", source: "Sexton - Her Kind" },
  { line: "fixed the suppers for the worms and the elves:", expectedPattern: "/u/uu/uu/", source: "Sexton - Her Kind" },
  { line: "whining, rearranging the disaligned.", expectedPattern: "/uu/uu/u/", source: "Sexton - Her Kind" },
  { line: "A woman like that is misunderstood.", expectedPattern: "u/u/u/u/u/", source: "Sexton - Her Kind" },

  // ========== RITA DOVE - Daystar (1986) ==========
  { line: "She wanted a little room for thinking:", expectedPattern: "u/uu/u/u/u", source: "Dove - Daystar" },
  { line: "but she saw diapers steaming on the line,", expectedPattern: "u/u/uu/uu/", source: "Dove - Daystar" },
  { line: "a doll slumped behind the door.", expectedPattern: "u/u/u/u/", source: "Dove - Daystar" },
  { line: "So she lugged a chair behind the garage", expectedPattern: "u/u/u/uu/", source: "Dove - Daystar" },
  { line: "to sit out the children's naps.", expectedPattern: "u/u/u/u/", source: "Dove - Daystar" },
  { line: "Sometimes there were things to watch—", expectedPattern: "u/u/u/u/", source: "Dove - Daystar" },
  { line: "the pinched armor of a vanished cricket,", expectedPattern: "u/u/uuu/u/u", source: "Dove - Daystar" },
  { line: "a raft of perch nudging the shore.", expectedPattern: "u/u/u/u/", source: "Dove - Daystar" },
  { line: "And not once did her mind wander", expectedPattern: "u/u/u/u/u", source: "Dove - Daystar" },
  { line: "to what she was doing.", expectedPattern: "u/u/u/u", source: "Dove - Daystar" },
  { line: "She rocked, letting the wind", expectedPattern: "u/u/u/", source: "Dove - Daystar" },
  { line: "lift her hair, watching the clouds.", expectedPattern: "/u/u/u/", source: "Dove - Daystar" },

];

// Load CMU dictionary
function parseCMUDict(text: string): Map<string, Pronunciation[]> {
  const dict = new Map<string, Pronunciation[]>();
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith(';;;') || line.trim().length === 0) {
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    const word = parts[0].replace(/\(\d+\)$/, '').toLowerCase();
    const phones = parts.slice(1);

    const stresses: number[] = [];
    for (const phone of phones) {
      const match = phone.match(/[012]$/);
      if (match) {
        stresses.push(parseInt(match[0]));
      }
    }

    const pronunciation: Pronunciation = {
      word,
      phones,
      stresses,
    };

    if (!dict.has(word)) {
      dict.set(word, []);
    }
    dict.get(word)!.push(pronunciation);
  }

  return dict;
}

interface TestResult {
  line: string;
  source: string;
  expected: string;
  actual: string;
  match: boolean;
  syllableCountMatch: boolean;
  partialMatch: number;
  failureType?: string;
}

function categorizeFailure(expected: string, actual: string, line: string): string {
  if (expected.length !== actual.length) {
    return `syllable_count_mismatch (expected ${expected.length}, got ${actual.length})`;
  }

  // Check for function word issues
  const functionWords = ['the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'and', 'but', 'or', 'i', 'my', 'your', 'his', 'her'];
  const words = line.toLowerCase().split(/\s+/);
  for (const fw of functionWords) {
    if (words.includes(fw)) {
      return 'function_word_stress';
    }
  }

  return 'general_stress_error';
}

function runAccuracyTest(): void {
  console.log('Loading CMU dictionary...');

  // Find and load dictionary
  const possiblePaths = [
    './public/cmudict.dict',
    '../../../public/cmudict.dict',
    join(__dirname, '../../../../public/cmudict.dict'),
  ];

  let dictText: string | null = null;
  let foundPath: string | null = null;

  for (const path of possiblePaths) {
    try {
      if (existsSync(path)) {
        dictText = readFileSync(path, 'utf-8');
        foundPath = path;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!dictText) {
    console.error('Could not find CMU dictionary. Tried:', possiblePaths);
    process.exit(1);
  }

  console.log('Found dictionary at:', foundPath);

  const dict = parseCMUDict(dictText);
  injectDictionary(dict);
  console.log(`CMU dictionary loaded: ${dict.size} entries\n`);

  console.log('Running contemporary poetry scansion accuracy test...\n');
  console.log(`Testing ${CONTEMPORARY_POEMS.length} annotated lines\n`);

  const results: TestResult[] = [];
  let exactMatches = 0;
  let syllableCountMatches = 0;
  let totalPartialMatch = 0;

  const failurePatterns: Record<string, number> = {};
  const bySource: Record<string, { total: number; matches: number }> = {};

  for (const testCase of CONTEMPORARY_POEMS) {
    const analysis = analyzeScansion(testCase.line);

    if (analysis.lines.length === 0) {
      results.push({
        line: testCase.line,
        source: testCase.source,
        expected: testCase.expectedPattern,
        actual: '',
        match: false,
        syllableCountMatch: false,
        partialMatch: 0,
        failureType: 'no_analysis',
      });
      continue;
    }

    const lineAnalysis = analysis.lines[0];
    const actualPattern = lineAnalysis.fullPattern;

    const isMatch = actualPattern === testCase.expectedPattern;
    const syllableMatch = actualPattern.length === testCase.expectedPattern.length;

    // Calculate partial match
    let matchingChars = 0;
    const minLen = Math.min(actualPattern.length, testCase.expectedPattern.length);
    for (let i = 0; i < minLen; i++) {
      if (actualPattern[i] === testCase.expectedPattern[i]) {
        matchingChars++;
      }
    }
    const partialMatch = testCase.expectedPattern.length > 0
      ? matchingChars / testCase.expectedPattern.length
      : 0;

    if (isMatch) exactMatches++;
    if (syllableMatch) syllableCountMatches++;
    totalPartialMatch += partialMatch;

    // Track by source
    if (!bySource[testCase.source]) {
      bySource[testCase.source] = { total: 0, matches: 0 };
    }
    bySource[testCase.source].total++;
    if (isMatch) bySource[testCase.source].matches++;

    let failureType: string | undefined;
    if (!isMatch) {
      failureType = categorizeFailure(testCase.expectedPattern, actualPattern, testCase.line);
      failurePatterns[failureType] = (failurePatterns[failureType] || 0) + 1;
    }

    results.push({
      line: testCase.line,
      source: testCase.source,
      expected: testCase.expectedPattern,
      actual: actualPattern,
      match: isMatch,
      syllableCountMatch: syllableMatch,
      partialMatch,
      failureType,
    });
  }

  // Print report
  console.log('='.repeat(80));
  console.log('CONTEMPORARY POETRY SCANSION ACCURACY REPORT');
  console.log('='.repeat(80));

  console.log('\nOVERALL METRICS:');
  console.log('-'.repeat(40));
  console.log(`Total lines tested:        ${CONTEMPORARY_POEMS.length}`);
  console.log(`Exact matches:             ${exactMatches} (${(exactMatches / CONTEMPORARY_POEMS.length * 100).toFixed(1)}%)`);
  console.log(`Syllable count matches:    ${syllableCountMatches} (${(syllableCountMatches / CONTEMPORARY_POEMS.length * 100).toFixed(1)}%)`);
  console.log(`Average partial match:     ${(totalPartialMatch / CONTEMPORARY_POEMS.length * 100).toFixed(1)}%`);

  console.log('\nACCURACY BY SOURCE:');
  console.log('-'.repeat(40));

  const sortedSources = Object.entries(bySource)
    .sort((a, b) => (a[1].matches / a[1].total) - (b[1].matches / b[1].total));

  for (const [source, stats] of sortedSources) {
    const pct = (stats.matches / stats.total * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(stats.matches / stats.total * 20));
    console.log(`${source.padEnd(35)} ${stats.matches}/${stats.total} (${pct.padStart(3)}%) ${bar}`);
  }

  console.log('\nFAILURE PATTERN ANALYSIS:');
  console.log('-'.repeat(40));

  const sortedFailures = Object.entries(failurePatterns)
    .sort((a, b) => b[1] - a[1]);

  const totalFailures = CONTEMPORARY_POEMS.length - exactMatches;
  for (const [pattern, count] of sortedFailures) {
    const pct = (count / totalFailures * 100).toFixed(1);
    console.log(`${pattern.padEnd(45)} ${count} (${pct}% of failures)`);
  }

  console.log('\nSAMPLE FAILURES (first 20):');
  console.log('-'.repeat(80));

  const failures = results.filter(r => !r.match).slice(0, 20);
  for (const f of failures) {
    console.log(`\nLine:     "${f.line}"`);
    console.log(`Source:   ${f.source}`);
    console.log(`Expected: ${f.expected}`);
    console.log(`Actual:   ${f.actual}`);
    console.log(`Match:    ${(f.partialMatch * 100).toFixed(0)}%`);
  }

  // Write detailed results to file
  const reportPath = './contemporary-poetry-accuracy-report.json';
  const report = {
    timestamp: new Date().toISOString(),
    metrics: {
      totalLines: CONTEMPORARY_POEMS.length,
      exactMatches,
      exactMatchRate: exactMatches / CONTEMPORARY_POEMS.length,
      syllableCountMatches,
      syllableCountMatchRate: syllableCountMatches / CONTEMPORARY_POEMS.length,
      averagePartialMatch: totalPartialMatch / CONTEMPORARY_POEMS.length,
    },
    failurePatterns,
    bySource,
    results,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nDetailed results written to: ${reportPath}`);
}

// Run the test
runAccuracyTest();
