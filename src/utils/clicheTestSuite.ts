/**
 * Large-scale Cliche Detection Test Suite
 *
 * 50+ AI-generated poems with varying cliche levels to test detection accuracy
 */

import { analyzeCliches, detectCliches } from './phraseClicheDetector';

// Test poems categorized by expected cliche density
interface TestPoem {
  name: string;
  text: string;
  expectedLevel: 'high' | 'medium' | 'low' | 'none';
  expectedMinCliches: number;
  expectedMaxCliches: number;
}

const TEST_POEMS: TestPoem[] = [
  // ==========================================
  // HIGH CLICHE POEMS (10+)
  // ==========================================
  {
    name: "Greeting Card Love",
    text: `Love at first sight hit me like a bolt from the blue,
My heart skipped a beat when I first laid eyes on you.
You're my soulmate, written in the stars above,
Together forever, you're my one true love.

Head over heels, I'm walking on air,
With butterflies in my stomach beyond compare.
Against all odds, we found our way,
Seize the day, that's what they say.`,
    expectedLevel: 'high',
    expectedMinCliches: 8,
    expectedMaxCliches: 15
  },
  {
    name: "Motivational Poster",
    text: `Reach for the stars and follow your dreams,
Nothing is ever quite as it seems.
Take the plunge and hit the ground running,
The sky's the limit, keep on becoming.

Rise from the ashes like a phoenix bright,
At the end of the tunnel there's always light.
Blood, sweat and tears will pave your way,
Tomorrow is another day.`,
    expectedLevel: 'high',
    expectedMinCliches: 8,
    expectedMaxCliches: 15
  },
  {
    name: "Sad Love Song",
    text: `My broken heart still aches for you,
Tears of joy turned to tears of blue.
Time heals all wounds, or so they say,
But you took my breath away.

In the dead of night I cry alone,
My heart of gold has turned to stone.
Once upon a time we had it all,
Before the final curtain call.`,
    expectedLevel: 'high',
    expectedMinCliches: 7,
    expectedMaxCliches: 14
  },
  {
    name: "Nature's Cliches",
    text: `The calm before the storm approaches near,
Silver lining breaks through clouds of fear.
Gentle breeze whispers through the trees,
Babbling brook flows with such ease.

The starry night above so bright,
Moonlit paths guide us through the night.
Rolling hills stretch to the sea,
Nature's beauty sets us free.`,
    expectedLevel: 'high',
    expectedMinCliches: 6,
    expectedMaxCliches: 12
  },
  {
    name: "Battle Hymn",
    text: `Fight fire with fire, blood sweat and tears,
We've battled our inner demons for years.
Against all odds we stand our ground,
Our warrior spirit cannot be bound.

Through the darkest hour we'll survive,
Keep hope alive, keep the flame alive.
The battle scars tell our tale,
Through thick and thin we shall prevail.`,
    expectedLevel: 'high',
    expectedMinCliches: 7,
    expectedMaxCliches: 14
  },
  {
    name: "Teen Romance",
    text: `My heart beats fast when you walk by,
Love at first sight, I can't deny.
Head over heels, I'm falling fast,
A love like ours is meant to last.

Written in the stars, our destiny,
You complete me, can't you see?
Butterflies in my stomach flutter,
My heart skips a beat, I start to stutter.`,
    expectedLevel: 'high',
    expectedMinCliches: 7,
    expectedMaxCliches: 12
  },
  {
    name: "Self-Help Poem",
    text: `Live life to the fullest every day,
Chase your dreams, don't let them slip away.
The journey of a thousand miles begins,
With one small step that always wins.

Seize the day, carpe diem my friend,
A new chapter waits around the bend.
Turn the page on yesterday's sorrow,
There's always hope in tomorrow.`,
    expectedLevel: 'high',
    expectedMinCliches: 6,
    expectedMaxCliches: 12
  },
  {
    name: "Gothic Romance",
    text: `In the dead of night my soul cries out,
Dark night of the soul, consumed by doubt.
The grim reaper waits in shadows deep,
Where eternal darkness makes its keep.

My burning passion, eternal flame,
Will never be extinguished, never tame.
Through the valley of the shadow I walk,
Where silence speaks louder than talk.`,
    expectedLevel: 'high',
    expectedMinCliches: 6,
    expectedMaxCliches: 12
  },
  {
    name: "Country Song",
    text: `I hit rock bottom when you left town,
Back to square one, feeling down.
But time heals all wounds they say,
And I'll live to fight another day.

My heart of gold still beats for you,
Through thick and thin I've been true.
At a crossroads in my life,
Cut through the pain like a knife.`,
    expectedLevel: 'high',
    expectedMinCliches: 6,
    expectedMaxCliches: 12
  },
  {
    name: "Wedding Toast",
    text: `Two hearts beat as one today,
Love conquers all in every way.
Through thick and thin you'll stand together,
Your love will last forever and ever.

A match made in heaven above,
Blessed with unconditional love.
May you live happily ever after,
Filling your home with joy and laughter.`,
    expectedLevel: 'high',
    expectedMinCliches: 6,
    expectedMaxCliches: 12
  },

  // ==========================================
  // MEDIUM CLICHE POEMS (3-7)
  // ==========================================
  {
    name: "Autumn Reflection",
    text: `The falling leaves paint streets in gold,
A story that has long been told.
I walk beneath the changing sky,
And watch the autumn days go by.

Time moves on, as seasons fade,
Through light and through the cooling shade.
Yet in my heart you still remain,
Through joy and through the gentle rain.`,
    expectedLevel: 'medium',
    expectedMinCliches: 2,
    expectedMaxCliches: 6
  },
  {
    name: "Morning Coffee",
    text: `Steam rises from my morning cup,
The sun peeks through as I wake up.
A fresh start waits outside my door,
Today holds something new in store.

The quiet moment before the day,
Time stands still in its own way.
I gather strength to face what's new,
The world awaits beyond the blue.`,
    expectedLevel: 'medium',
    expectedMinCliches: 2,
    expectedMaxCliches: 5
  },
  {
    name: "Ocean Dreams",
    text: `The crashing waves call out my name,
Each day the same, yet never the same.
I spread my wings along the shore,
And dream of distant lands once more.

The salty air fills up my lungs,
Songs of sailors left unsung.
Beneath the stars I find my way,
Between the night and break of day.`,
    expectedLevel: 'medium',
    expectedMinCliches: 2,
    expectedMaxCliches: 6
  },
  {
    name: "Winter Evening",
    text: `The fire crackles in the hearth,
A blanket of snow covers the earth.
Outside the world is cold and still,
While warmth inside fights off the chill.

I think of you across the miles,
Remembering your gentle smiles.
Through the winter's longest night,
Your memory keeps the darkness light.`,
    expectedLevel: 'medium',
    expectedMinCliches: 2,
    expectedMaxCliches: 5
  },
  {
    name: "City Nights",
    text: `The city lights flicker and glow,
People hurry to and fro.
I stand alone among the crowd,
Voices rising, getting loud.

My lonely heart seeks something more,
Beyond the traffic's endless roar.
I search for meaning in the haze,
Lost in the urban maze.`,
    expectedLevel: 'medium',
    expectedMinCliches: 1,
    expectedMaxCliches: 4
  },
  {
    name: "Garden Meditation",
    text: `Among the flowers I find peace,
A moment's calm, a sweet release.
The gentle breeze moves petals soft,
As butterflies drift high aloft.

Nature teaches patience here,
In cycles of the turning year.
I breathe and let my worries go,
And watch the garden's colors grow.`,
    expectedLevel: 'medium',
    expectedMinCliches: 1,
    expectedMaxCliches: 4
  },
  {
    name: "Father's Hands",
    text: `His weathered hands tell stories deep,
Of promises he's sworn to keep.
Through blood and sweat he built our home,
Through fields and factories he'd roam.

Now silver threads his thinning hair,
Lines of wisdom, lines of care.
I hold his hand in mine today,
The strongest man, now old and gray.`,
    expectedLevel: 'medium',
    expectedMinCliches: 1,
    expectedMaxCliches: 4
  },
  {
    name: "Rainy Sunday",
    text: `Rain taps gently on the glass,
Watching Sunday slowly pass.
Gray clouds drift across the sky,
I sit and wonder, question why.

A cup of tea, a worn-out book,
A lazy, lingering second look.
The world outside can wait for me,
Today I'll just sit here and be.`,
    expectedLevel: 'medium',
    expectedMinCliches: 0,
    expectedMaxCliches: 3
  },
  {
    name: "Childhood Street",
    text: `The houses smaller than I remember,
That tree we climbed last September.
The corner store now shuttered tight,
No more porch lights in the night.

But memory holds what time erased,
The laughter here I've not replaced.
I touch the gate, its paint now chipped,
And feel the years in my fingertips.`,
    expectedLevel: 'medium',
    expectedMinCliches: 0,
    expectedMaxCliches: 3
  },
  {
    name: "Mountain Hike",
    text: `One foot before the other now,
The path grows steep, I wipe my brow.
The summit waits beyond the trees,
Where eagles soar on mountain breeze.

Each step a small accomplishment,
Each breath a moment heaven-sent.
I climb not to conquer peaks,
But find the silence that my soul seeks.`,
    expectedLevel: 'medium',
    expectedMinCliches: 1,
    expectedMaxCliches: 4
  },
  {
    name: "Old Photograph",
    text: `This faded image, corners bent,
A summer day, well-spent, well-meant.
Your smile frozen in the frame,
Before the world became a game.

I trace the edges, worn and soft,
And wonder where the time has gone,
How we were young and unafraid,
Before the light began to fade.`,
    expectedLevel: 'medium',
    expectedMinCliches: 1,
    expectedMaxCliches: 4
  },
  {
    name: "Kitchen Window",
    text: `She stands there every morning still,
Coffee cup upon the sill.
Watching cardinals in the pine,
The same ritual, so divine.

Fifty years of morning light,
Fifty years of holding tight.
The view has changed, the trees have grown,
But this quiet love has always shown.`,
    expectedLevel: 'medium',
    expectedMinCliches: 0,
    expectedMaxCliches: 3
  },
  {
    name: "Bus Stop",
    text: `We wait together, strangers still,
Against the morning's winter chill.
Each lost in private worlds of thought,
With dreams we've chased and lessons taught.

The 7:15 pulls to the curb,
Our silence breaks without a word.
We board as one, then sit apart,
Each carrying a different heart.`,
    expectedLevel: 'medium',
    expectedMinCliches: 0,
    expectedMaxCliches: 3
  },
  {
    name: "Grandmother's Recipe",
    text: `Written in her shaking hand,
Instructions I don't understand.
A pinch of this, a dash of that,
Stir clockwise where the spoon once sat.

I follow every word she wrote,
Each ingredient she chose to note.
The smell that fills my kitchen now,
Brings her back somehow, somehow.`,
    expectedLevel: 'medium',
    expectedMinCliches: 0,
    expectedMaxCliches: 2
  },
  {
    name: "Late Night Drive",
    text: `The highway stretches, dark and wide,
No destination, just the ride.
Radio static, midnight air,
Going somewhere, going nowhere.

Headlights cut through fog and mist,
These quiet hours won't be missed.
Sometimes the road is all you need,
To plant a contemplative seed.`,
    expectedLevel: 'medium',
    expectedMinCliches: 0,
    expectedMaxCliches: 3
  },

  // ==========================================
  // LOW CLICHE POEMS (1-2)
  // ==========================================
  {
    name: "Laundromat",
    text: `The dryers tumble, hypnotic round,
A meditation in their sound.
Mismatched socks and faded jeans,
The quiet pause between machines.

A woman reads a paperback,
A student drowns in flashcard stack.
We share this space of soap and time,
United in the mundane sublime.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 2
  },
  {
    name: "Airport Terminal",
    text: `Gate B7, delay unknown,
Two hundred strangers, all alone.
The announcement garbles overhead,
Something about another flight instead.

I watch a child chase pigeons loose,
Her mother sighs, ties a loose shoe.
We're all suspended here in wait,
Passengers of time, of fate, of gate.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 2
  },
  {
    name: "Typewriter",
    text: `The keys resist my pressing touch,
Each letter costs a little much.
No backspace here, no easy fix,
Just ink and ribbon, paper, clicks.

This mechanical insistence on
Each word I choose before it's gone,
Teaches patience I forgot,
When screens could always find a spot.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Emergency Room, 3 AM",
    text: `Fluorescent flicker, plastic chairs,
A toddler coughs, a grandmother stares.
The television murmurs low,
A rerun no one wants to know.

I hold my arm, swollen, sore,
And watch the automatic door.
Each face that enters tells a tale,
Of midnight accidents that rail.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Parking Garage",
    text: `Concrete spirals, level three,
The echo of my jangling key.
Somewhere a car alarm complains,
Oil stains like Rorschach brains.

I find my dusty Civic here,
Between a truck and something dear,
A motorcyle, chrome and sleek,
Everything my wallet can't seek.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Tooth Extraction",
    text: `The dentist's mask hides what she thinks,
The nitrous hisses, seeps and sinks.
I grip the armrest, count the tiles,
While somewhere distant, someone smiles.

The cracking sound I can't unhear,
The root released after all these years.
She holds it up, triumphant, red,
A piece of me I thought long dead.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Hardware Store",
    text: `Aisle 7, nuts and bolts,
The smell of lumber, copper, colts.
I search for something, hex or square,
That fits the hole that's waiting there.

An older man knows what I need,
Points to a bin with practiced speed.
These threads and washers, screws and nails,
The poetry of small details.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Elevator",
    text: `The numbers climb, we don't speak,
Floor three, floor four, floor five, floor six.
You smell like coffee, I like rain,
The doors open and close again.

Fourteen strangers breathing shared air,
Pretending that no one is there.
The dinging bell, the quiet sigh,
Anonymous until goodbye.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Dog Park",
    text: `They run in circles, sniff and play,
The border collie leads the way.
A pug attempts to keep up pace,
Tongue lolling, joy upon his face.

We owners cluster by the bench,
Talk weather, work, the awful stench.
Our small talk fills the afternoon,
While dogs commune in their commune.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Thrift Store",
    text: `Someone's grandmother's china set,
A treadmill someone used once, I bet.
The musty smell of other lives,
Donated after husbands, wives.

I find a jacket, corduroy brown,
That someone wore around some town.
Five dollars seems a fair price paid,
For all the memories it's made.`,
    expectedLevel: 'low',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },

  // ==========================================
  // NO/MINIMAL CLICHE POEMS (0)
  // ==========================================
  {
    name: "Cartography of Scars",
    text: `The surgeon's blade traced longitude
across terrain of pale geography—
each suture a meridian marking
where the body's continents shifted.

I learned to read these raised white lines
like Braille beneath my fingertips,
a tactile memoir written
in the dermis's private alphabet.

Healing is not erasure
but accumulation: the skin remembers
every incision, every violation,
catalogs each wound in tissue.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Inventory",
    text: `Three forks, mismatched. A chipped bowl.
The corkscrew that always sticks.
My grandmother's measuring spoons,
tarnished but precise.

In the drawer: rubber bands dried brittle,
a menu from a restaurant now closed,
batteries that might be dead,
a key to nothing I remember.

This is what remains
when you subtract the person—
the leftover arithmetic
of a life divided.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "MRI",
    text: `They slide me into the machine's
white throat, a Jonah moment
in the whale of magnets.
Don't move, they say. Don't swallow.

The banging starts, industrial,
like construction in my skull,
building something from the scan
of my suspicious tissue.

I try to think of beaches
but can only see the ceiling
of this tube, this temporary
casket practice run.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Parallel Parking",
    text: `The gap seems smaller from inside,
an optical deception
that my mirrors can't correct.
I try again. Again.

Behind me, someone honks impatient,
as if sound could shrink dimensions,
fold the physics of my sedan
into this impossible slot.

I give up, circle the block,
find a space that fits my shame,
walk the extra hundred feet
rehearsing my excuse.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Grocery List",
    text: `Milk (2%), bread (the good kind),
something for dinner that isn't pasta.
The avocados might be ripe by Thursday
if I buy them now, today, this hopeful Monday.

Toilet paper—the eternal need.
Toothpaste, though we have enough.
Bananas that will brown before we eat them,
as bananas do, as always.

I am planning for a future
made of small consumptions,
betting on another week
of ordinary hunger.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Waiting Room Aquarium",
    text: `The tang swims figure eights
around the plastic castle,
performing for no audience
but the algae-eater below.

I wonder who chose these fish,
if there was a catalog,
a meeting about which species
best reduces patient anxiety.

The bubbler hums its meditation
while somewhere down the hall
a door opens on results
that will change everything or nothing.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Leftovers",
    text: `The Tupperware archaeology
of last week's good intentions:
pad thai, oxidizing,
the risotto that seemed worth saving.

I open each container like
a time capsule of appetite,
sniff the questionable curry,
decide against the chance.

Into the garbage they go,
my optimism about meals,
the belief that I would want this
on some future, hungry day.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Insomnia",
    text: `The ceiling has four hundred tiles.
I know because I've counted twice.
The radiator clicks its code,
a message I cannot decipher.

My phone glows its blue temptation:
doomscroll until the sun arrives?
Instead I catalog my errors,
a more familiar entertainment.

Tomorrow I will be a ruin
of caffeine and apology,
wearing this sleeplessness
like a coat I can't take off.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Commute",
    text: `The same faces, different ties,
we perform this ritual of transit
from the places where we sleep
to the places where we're paid.

I've named them: Crossword Man,
the Woman with the Complicated Braid,
the Guy Who Always Sneezes
somewhere around 42nd Street.

We never speak, and yet I'd notice
if they disappeared, these strangers
I've come to count among
my daily certainties.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Assembly Required",
    text: `The Swedish names mock my attempts:
KALLAX, MALM, BJÖRKUDDEN.
The Allen key bends in my grip,
the dowels don't align.

Step 7 assumes a competence
the previous steps did not provide.
I sit among the particleboard,
a failure in flat-pack.

My bookshelf lists to starboard now,
missing screws I've given up finding.
It holds books, imperfectly,
like everything I build.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Voicemail",
    text: `Your voice, preserved in digital amber,
says you'll call me back. You won't.
But I keep the message anyway,
this fossil of intention.

The beep at the end, abrupt,
cuts you off mid-thought,
a sentence you never finished
about dinner, or the weather.

I listen sometimes, late at night,
to hear you almost say my name,
to remember how casual
the last things often are.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Renovation",
    text: `We tore the wallpaper down to find
another layer underneath: roses,
someone's 1970s dream
of permanent botanical.

Beneath that, newsprint: headlines
from a war we've since forgotten,
classifieds for jobs that don't exist,
a wedding announcement, faded.

Each layer a generation's taste,
their certainty that this was right,
that mauve or teal or harvest gold
would last forever. Nothing does.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 1
  },
  {
    name: "Night Shift",
    text: `The fluorescents don't distinguish
3 AM from noon,
this eternal artificial day
we make inside the warehouse.

Forklifts beep their backing warnings,
conveyor belts deliver boxes
to the place where other boxes wait,
a democracy of cardboard.

My body clock has given up
its circadian protest,
accepted this inverted life
of sleeping through the sun.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "Checkout Line",
    text: `The woman counts her coupons out,
a ritual of saving cents
while we behind her calculate
the cost of our impatience.

She apologizes, doesn't stop,
has one more coupon, then another.
The total shrinks in increments
too small for me to respect.

But she is buying cat food, soup,
the off-brand of everything,
and I am buying fancy cheese,
so who am I to judge her math?`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  },
  {
    name: "After the Diagnosis",
    text: `The doctor's mouth kept moving but
the words had stopped making sound.
Somewhere a phone rang. I noticed
the plant on her desk needed water.

Statistics: a foreign language
of percentages and median times,
numbers that apply to people
until they apply to you.

I nodded, took the pamphlet,
walked through a door into a world
identical in every way
except now utterly different.`,
    expectedLevel: 'none',
    expectedMinCliches: 0,
    expectedMaxCliches: 0
  }
];

interface TestResult {
  name: string;
  expectedLevel: string;
  actualCliches: number;
  expectedMin: number;
  expectedMax: number;
  passed: boolean;
  clichesFound: string[];
  originalityScore: number;
}

export function runLargeClicheTest(): { results: TestResult[]; summary: { total: number; passed: number; failed: number; accuracy: number; falsePositives: number; falseNegatives: number } } {
  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  let falsePositives = 0; // Found cliches where there shouldn't be many
  let falseNegatives = 0; // Missed cliches where there should be many

  console.log('='.repeat(70));
  console.log('LARGE-SCALE CLICHE DETECTION TEST (50+ Poems)');
  console.log('='.repeat(70));
  console.log('');

  for (const poem of TEST_POEMS) {
    const analysis = analyzeCliches(poem.text);
    const detected = detectCliches(poem.text);
    const clichesFound = detected.map(c => c.phrase);

    const inRange = analysis.totalClichesFound >= poem.expectedMinCliches &&
                    analysis.totalClichesFound <= poem.expectedMaxCliches;

    if (inRange) {
      passed++;
    } else {
      failed++;
      if (analysis.totalClichesFound > poem.expectedMaxCliches) {
        falsePositives++;
      } else {
        falseNegatives++;
      }
    }

    results.push({
      name: poem.name,
      expectedLevel: poem.expectedLevel,
      actualCliches: analysis.totalClichesFound,
      expectedMin: poem.expectedMinCliches,
      expectedMax: poem.expectedMaxCliches,
      passed: inRange,
      clichesFound,
      originalityScore: analysis.overallScore
    });
  }

  // Print detailed results
  console.log('\n' + '─'.repeat(70));
  console.log('DETAILED RESULTS BY CATEGORY');
  console.log('─'.repeat(70));

  const categories = ['high', 'medium', 'low', 'none'];
  for (const cat of categories) {
    const catResults = results.filter(r => r.expectedLevel === cat);
    const catPassed = catResults.filter(r => r.passed).length;

    console.log(`\n[${cat.toUpperCase()} CLICHE POEMS] (${catPassed}/${catResults.length} passed)`);
    console.log('─'.repeat(50));

    for (const r of catResults) {
      const status = r.passed ? '✅' : '❌';
      console.log(`${status} ${r.name}`);
      console.log(`   Found: ${r.actualCliches} (expected ${r.expectedMin}-${r.expectedMax})`);
      console.log(`   Originality: ${r.originalityScore}%`);
      if (r.clichesFound.length > 0) {
        const preview = r.clichesFound.slice(0, 5).map(c => `"${c}"`).join(', ');
        const more = r.clichesFound.length > 5 ? ` +${r.clichesFound.length - 5} more` : '';
        console.log(`   Cliches: ${preview}${more}`);
      }
    }
  }

  // Summary
  const accuracy = (passed / TEST_POEMS.length) * 100;

  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Poems Tested: ${TEST_POEMS.length}`);
  console.log(`Passed: ${passed} (${accuracy.toFixed(1)}%)`);
  console.log(`Failed: ${failed}`);
  console.log(`  - False Positives (over-detected): ${falsePositives}`);
  console.log(`  - False Negatives (under-detected): ${falseNegatives}`);
  console.log('='.repeat(70));

  // Breakdown by category
  console.log('\nACCURACY BY CATEGORY:');
  for (const cat of categories) {
    const catResults = results.filter(r => r.expectedLevel === cat);
    const catPassed = catResults.filter(r => r.passed).length;
    const catAccuracy = (catPassed / catResults.length * 100).toFixed(1);
    console.log(`  ${cat.toUpperCase()}: ${catPassed}/${catResults.length} (${catAccuracy}%)`);
  }

  return {
    results,
    summary: {
      total: TEST_POEMS.length,
      passed,
      failed,
      accuracy,
      falsePositives,
      falseNegatives
    }
  };
}

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).runLargeClicheTest = runLargeClicheTest;
}

// Auto-run
runLargeClicheTest();
