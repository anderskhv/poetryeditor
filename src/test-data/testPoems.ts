/**
 * Comprehensive Poetry Test Dataset
 * 100+ poems with 2000+ lines for testing all analysis features
 *
 * Categories:
 * - Traditional forms (sonnets, villanelles, haiku, etc.)
 * - Metered verse (iambic pentameter, trochaic, anapestic, etc.)
 * - Free verse
 * - Rhymed verse (various schemes)
 * - Poems with specific sound patterns
 */

export interface TestPoem {
  id: string;
  title: string;
  content: string;
  expectedForm?: string;
  expectedMeter?: string;
  expectedRhymeScheme?: string;
  tags: string[];
  notes?: string;
}

export const TEST_POEMS: TestPoem[] = [
  // =====================
  // SONNETS (14 lines, various rhyme schemes)
  // =====================
  {
    id: 'sonnet-001',
    title: 'The Passing Storm',
    content: `The thunder rolls across the darkened sky,
While lightning splits the clouds with silver flame.
The wind howls through the trees with mournful cry,
And nature shows her wild, untamable name.

But in this chaos, beauty still remains—
The way the rain cascades like crystal tears,
How shadows dance upon the window panes,
And how the storm dispels our daily fears.

For when the tempest finally subsides,
The world emerges cleansed and fresh and new.
The sun breaks through where once the darkness hides,
And paints the sky in shades of gold and blue.

So let the storms of life rage on and pass,
For peace awaits beyond the looking glass.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'nature', 'metaphor'],
  },
  {
    id: 'sonnet-002',
    title: 'Memory of Summer',
    content: `I still recall those lazy summer days,
When golden light would linger until nine.
We wandered through the meadow's grassy maze,
And tasted sweetness from the ripened vine.

The fireflies would dance at eventide,
Like tiny stars that fell from heaven's dome.
We'd sit beside the river, side by side,
And watch the silver moonlight lead us home.

Those moments now seem distant as a dream,
Yet in my heart they burn with endless fire.
Like photographs that fade, or so they seem,
But never lose the warmth of our desire.

Though seasons change and years may drift away,
Those summer memories are here to stay.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'memory', 'summer'],
  },
  {
    id: 'sonnet-003',
    title: 'The Mathematician\'s Love',
    content: `Your beauty cannot be expressed in prose,
No equation captures your sweet grace.
Like pi, your mystery forever grows,
And infinite decimals can't define your face.

I've tried to calculate the curve you trace,
When walking down the cobblestone at dawn.
But variables fail to find their place,
When logic meets the heart and reason's gone.

Perhaps love was never meant for math,
No theorem proves what feeling makes so clear.
The shortest distance is no simple path,
When every road leads back to you, my dear.

So let me cease my calculations cold,
And simply say: you're worth more than gold.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'love', 'mathematics'],
  },
  {
    id: 'sonnet-004',
    title: 'Petrarchan Dreams',
    content: `Upon the hill where ancient olive grows,
I saw her standing in the morning light.
Her hair like rivers of obsidian flows,
Her eyes two stars that shame the darkest night.

I called to her across the dewy meadow,
But wind stole every word before it flew.
She turned away, became a fading shadow,
And left me there with nothing left to do.

But wait—she paused and looked back through the mist,
A smile upon her lips, so slight, so sweet.
As if by fate our destinies had kissed,
She walked back toward me on those gentle feet.

In dreams we meet, in dreams we never part,
She lives forever in my waking heart.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'love', 'dreams'],
  },
  {
    id: 'sonnet-005',
    title: 'Digital Age',
    content: `We scroll through feeds of manufactured life,
Where filters hide the truth of who we are.
Each notification brings its tiny strife,
And screens replace the light of every star.

The ancient art of conversation dies,
When emojis speak the words we cannot say.
We trade connection for a thousand lies,
And watch our human bonds just drift away.

Yet still within this digital expanse,
A human heart still beats beneath the code.
If we could give authenticity a chance,
Perhaps we'd find a more organic road.

Log off, look up, and see the world anew—
The greatest connection starts with being true.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'technology', 'modern'],
  },
  {
    id: 'sonnet-006',
    title: 'The Ocean\'s Call',
    content: `The ocean calls to me with ancient song,
Its waves like voices from the deep unknown.
I've heard this melody my whole life long,
A haunting tune that chills me to the bone.

Beneath the surface, secrets lie in wait,
Where sunlight fails and darkness holds its reign.
The pressure builds with every meter's weight,
Yet still I yearn to plunge into that plain.

What treasures hide in trenches miles below?
What creatures dwell where human eyes can't see?
The mysteries that only depths can know
Are calling out, are calling out to me.

One day I'll answer, dive into the blue,
And find what lies where ancient waters brew.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'ocean', 'mystery'],
  },
  {
    id: 'sonnet-007',
    title: 'The Artist\'s Lament',
    content: `My canvas waits, a void of purest white,
While colors on my palette slowly dry.
The muse has fled into the endless night,
And left me here with nothing but a sigh.

I've painted storms and sunsets, love and loss,
Each brushstroke carrying a piece of soul.
But now my art seems worth no more than dross,
A shattered vessel that was never whole.

Yet even in this darkness, something stirs—
A glimmer of the passion I once knew.
The memory of why my spirit purrs
When pigment flows in every vibrant hue.

Tomorrow brings another chance to try,
To paint my truth beneath an open sky.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'art', 'creativity'],
  },
  {
    id: 'sonnet-008',
    title: 'City at Midnight',
    content: `The city sleeps beneath a neon glow,
While taxi cabs crawl slowly down the street.
A saxophone plays softly, sweet and low,
And shadows dance to its seductive beat.

The buildings tower up like canyon walls,
Their windows dark except for scattered lights.
The echo of a lonely footstep falls,
And disappears into the urban nights.

In daylight this is chaos, noise, and speed,
A grinding mill of commerce and of strife.
But midnight grants a different kind of need—
A pause, a breath, a contemplative life.

When darkness falls, the city shows its heart,
A tender soul beneath its hardened art.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'urban', 'night'],
  },
  {
    id: 'sonnet-009',
    title: 'The Gardener',
    content: `With weathered hands she tends her garden beds,
Each morning rising with the early sun.
She knows the names of flowers, browns and reds,
And nurtures every seed until it's done.

The roses climb the trellis by the gate,
While lavender perfumes the summer air.
She planted them when she was young—now late
In life, they bloom with memories to share.

Her husband passed some twenty years ago,
But still she tends the patch he loved the best.
The tomatoes ripen, row by patient row,
A living tribute to his final rest.

In gardens, love transcends the grip of death,
And grows as long as we still draw our breath.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'gardening', 'memory', 'love'],
  },
  {
    id: 'sonnet-010',
    title: 'First Snow',
    content: `The first snow falls like whispers from above,
Each flake a tiny messenger of white.
The world transforms beneath this gentle love,
As darkness yields to morning's crystal light.

The children rush outside with gleeful cries,
Their mittened hands catch snowflakes on the fly.
The wonder sparkling bright within their eyes
Reminds us how the years go rushing by.

Remember when we too were young and free,
When snow meant magic, not a thing to dread?
When every drift was possibility,
And dreams of sledding filled our happy heads?

Let's catch a snowflake, let it melt and fade,
And hold the wonder that will never jade.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'winter', 'childhood'],
  },

  // =====================
  // HAIKU (5-7-5 syllable pattern)
  // =====================
  {
    id: 'haiku-001',
    title: 'Spring Awakening',
    content: `Cherry blossoms fall
Dancing on the morning breeze
Nature's pink confetti`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'spring', 'nature'],
  },
  {
    id: 'haiku-002',
    title: 'Summer Heat',
    content: `Cicadas singing
Their endless summer chorus
Heat shimmers on roads`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'summer', 'nature'],
  },
  {
    id: 'haiku-003',
    title: 'Autumn Leaves',
    content: `Red leaves spiral down
The old oak tree stands naked
Winter approaches`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'autumn', 'nature'],
  },
  {
    id: 'haiku-004',
    title: 'Winter Stillness',
    content: `Snow blankets the world
A crow calls from bare branches
Silence everywhere`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'winter', 'nature'],
  },
  {
    id: 'haiku-005',
    title: 'Mountain Dawn',
    content: `Mist clings to the peaks
The sun paints them gold and rose
Eagles circle high`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'mountains', 'nature'],
  },
  {
    id: 'haiku-006',
    title: 'Ocean Waves',
    content: `Waves crash on the shore
Foam recedes to meet the tide
Endless rhythm plays`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'ocean', 'nature'],
  },
  {
    id: 'haiku-007',
    title: 'Temple Bell',
    content: `The temple bell rings
Its echo fades into dusk
Monks bow in silence`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'spiritual', 'zen'],
  },
  {
    id: 'haiku-008',
    title: 'City Rain',
    content: `Umbrellas bloom forth
City streets become rivers
Neon lights reflect`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'urban', 'rain'],
  },
  {
    id: 'haiku-009',
    title: 'Garden Pond',
    content: `Koi swim lazily
Lotus flowers open wide
Dragonflies hover`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'garden', 'nature'],
  },
  {
    id: 'haiku-010',
    title: 'Full Moon',
    content: `The full moon rises
Casting silver on the lake
Frogs begin to sing`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'moon', 'nature'],
  },
  {
    id: 'haiku-011',
    title: 'Morning Coffee',
    content: `Steam curls from my cup
The bitter warmth wakes my soul
A new day begins`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'morning', 'daily-life'],
  },
  {
    id: 'haiku-012',
    title: 'Ancient Path',
    content: `Moss-covered stone steps
Lead through bamboo to the shrine
Pilgrims walked before`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'spiritual', 'nature'],
  },
  {
    id: 'haiku-013',
    title: 'Butterfly',
    content: `A butterfly lands
On my outstretched finger, then
Floats away on wind`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'insects', 'nature'],
  },
  {
    id: 'haiku-014',
    title: 'Train Station',
    content: `The last train departs
Empty platform, flickering lights
Loneliness descends`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'urban', 'loneliness'],
  },
  {
    id: 'haiku-015',
    title: 'Fireflies',
    content: `Fireflies dancing
In the humid summer night
Living stars below`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'summer', 'nature'],
  },

  // =====================
  // VILLANELLES (19 lines, ABA ABA ABA ABA ABA ABAA)
  // =====================
  {
    id: 'villanelle-001',
    title: 'Do Not Go Gentle (Style)',
    content: `Do not go gently through the fading light,
Let passion burn until your final breath.
Rage, rage against the dying of the night.

Though wise men know that darkness comes to right,
They fight with words against approaching death.
Do not go gently through the fading light.

Good men, whose deeds once shone so burning bright,
Cry out that more remains for them beneath.
Rage, rage against the dying of the night.

Wild men who caught and sang the sun in flight,
And learn too late they grieved it on its path,
Do not go gently through the fading light.

Grave men who see with blinding sight
That blind eyes blaze like meteors and are breath,
Rage, rage against the dying of the night.

And you, my father, there on that sad height,
Curse, bless me now with your fierce tears, I pray.
Do not go gently through the fading light.
Rage, rage against the dying of the night.`,
    expectedForm: 'Villanelle',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABA',
    tags: ['villanelle', 'iambic-pentameter', 'death', 'defiance'],
  },
  {
    id: 'villanelle-002',
    title: 'The Hours Return',
    content: `The hours return like waves upon the shore,
Each moment lived becomes a memory.
We cannot hold what came to us before.

The clock hands turn, indifferent to our war
Against the flow of time's eternity.
The hours return like waves upon the shore.

We grasp at seconds, always wanting more,
But they slip through like sand we cannot see.
We cannot hold what came to us before.

The photographs we keep inside our drawer
Show faces young with possibility.
The hours return like waves upon the shore.

Our children grow and walk out through the door,
And we are left with who we used to be.
We cannot hold what came to us before.

Yet in this loss, there's something to explore—
The present moment, waiting wild and free.
The hours return like waves upon the shore.
We cannot hold what came to us before.`,
    expectedForm: 'Villanelle',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABA',
    tags: ['villanelle', 'iambic-pentameter', 'time', 'memory'],
  },
  {
    id: 'villanelle-003',
    title: 'Learning to Forgive',
    content: `Forgiveness is a journey, not a place,
A winding road we travel day by day.
We learn to give ourselves a little grace.

The wounds we carry leave a bitter trace,
And anger seems the easier way.
Forgiveness is a journey, not a place.

We see our pain reflected in each face
Of those who caused the hurt that makes us gray.
We learn to give ourselves a little grace.

The past cannot be changed, we can't erase
The words that cut, the love that went astray.
Forgiveness is a journey, not a place.

But holding on just tightens the embrace
Of bitterness that steals our joy away.
We learn to give ourselves a little grace.

So step by step, we find a gentler pace,
And let the heavy burdens start to fray.
Forgiveness is a journey, not a place.
We learn to give ourselves a little grace.`,
    expectedForm: 'Villanelle',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABA',
    tags: ['villanelle', 'iambic-pentameter', 'forgiveness', 'healing'],
  },

  // =====================
  // BLANK VERSE (Unrhymed Iambic Pentameter)
  // =====================
  {
    id: 'blank-verse-001',
    title: 'The Forest Walk',
    content: `I wandered through the forest in the dawn,
When mist still clung to every leaf and branch.
The path was soft with seasons of decay,
And mushrooms pushed through carpets made of moss.
A woodpecker began his morning work,
His rhythmic tapping echoed through the trees.
I paused beside a stream that cut the path,
Its waters cold and clear as polished glass.
The sunlight filtered through the canopy,
Creating patterns on the forest floor.
I breathed the scent of pine and rotting wood,
And felt the ancient peace that dwells in woods.
No human voice disturbed this sacred place,
Only the songs of birds and rustling leaves.
I walked until the forest edge appeared,
Then turned again to wander deeper still.`,
    expectedForm: 'Blank Verse',
    expectedMeter: 'iambic pentameter',
    tags: ['blank-verse', 'iambic-pentameter', 'nature', 'meditation'],
  },
  {
    id: 'blank-verse-002',
    title: 'The Builder\'s Hands',
    content: `My father's hands were rough as ancient bark,
From years of shaping wood into a home.
I watched him measure twice and cut just once,
His movements sure with decades of the craft.
He taught me how to feel the grain of oak,
To know which way the chisel ought to go.
"Respect the wood," he'd say, "it was alive,
And carries still the memory of the sun."
Those hands could coax a cabinet from planks,
Or build a staircase spiraling toward light.
They fixed what broke and made what wasn't there,
Creating beauty from the raw and rough.
Now those hands rest, their labor finally done,
But everything they built still stands with care.
I look at my own hands and see his work,
The same calloused palms that know the feel of tools.`,
    expectedForm: 'Blank Verse',
    expectedMeter: 'iambic pentameter',
    tags: ['blank-verse', 'iambic-pentameter', 'family', 'craftsmanship'],
  },
  {
    id: 'blank-verse-003',
    title: 'Insomnia',
    content: `The ceiling stares at me with patient eyes,
While thoughts race circles through my weary mind.
The clock ticks on, indifferent to my plight,
Each second stretched into eternity.
I count the breaths of someone sleeping near,
Their peaceful rhythm mocking my unrest.
What worry keeps me tethered to the wake?
Perhaps the meeting that awaits at dawn,
Or words I said that I cannot unsay,
Or all the tasks that pile like drifting snow.
The night grows old, the darkness starts to fade,
And still I lie here, prisoner of my thoughts.
At last exhaustion claims its heavy toll,
And I drift off just as the birds begin.
Tomorrow I will shuffle through the day,
A ghost half-living in a world too bright.`,
    expectedForm: 'Blank Verse',
    expectedMeter: 'iambic pentameter',
    tags: ['blank-verse', 'iambic-pentameter', 'insomnia', 'anxiety'],
  },

  // =====================
  // BALLADS (ABAB or ABCB, often with refrain)
  // =====================
  {
    id: 'ballad-001',
    title: 'The Sailor\'s Return',
    content: `A sailor came home from the sea,
His ship had crossed the stormy main.
He searched the town for his Marie,
But searched and searched and searched in vain.

He asked the baker on the street,
"Have you seen Marie, my bride?"
The baker shook his head in grief,
"She waited, sir, but then she died."

He asked the preacher at the church,
"Where lies my love beneath the ground?"
The preacher led him on his search
To where a simple cross was found.

The sailor knelt upon the grass,
His tears fell down like morning dew.
"Oh Marie, my love, my bonnie lass,
I crossed the world to come to you."

He stayed beside her grave that night,
And when the morning came around,
They found him cold and still and white,
His heart had broken without sound.

So if you go to that small town,
You'll see two crosses side by side.
Where the sailor in his tattered gown
Lies forever by his bride.`,
    expectedForm: 'Ballad',
    expectedMeter: 'alternating tetrameter/trimeter',
    expectedRhymeScheme: 'ABCB',
    tags: ['ballad', 'narrative', 'love', 'tragedy'],
  },
  {
    id: 'ballad-002',
    title: 'The Highwayman\'s Daughter',
    content: `The highwayman rode through the night,
His pistols at his side.
He sought the gold of wealthy lords,
Their purses fat with pride.

But on the road to London town,
He met a coach of black.
Inside there sat a maiden fair,
Who would not give it back.

"Your money or your life!" he cried,
His voice rang sharp and clear.
She looked at him with steady eyes,
And showed no sign of fear.

"My father was a highwayman,
Before he met the rope.
He taught me how to shoot and ride,
And never give up hope."

She drew a pistol from her gown,
And aimed it at his heart.
"Now you will give your gold to me,
Before we two must part."

The highwayman began to laugh,
He'd met his match at last.
He tossed his purse into her lap,
And spurred his horse on fast.

They say they rode together then,
Two shadows in the night.
The highwayman and his new bride,
A most unlikely sight.`,
    expectedForm: 'Ballad',
    expectedMeter: 'alternating tetrameter/trimeter',
    expectedRhymeScheme: 'ABCB',
    tags: ['ballad', 'narrative', 'adventure', 'romance'],
  },

  // =====================
  // LIMERICK (AABBA, humorous)
  // =====================
  {
    id: 'limerick-001',
    title: 'The Programmer',
    content: `A programmer sat in his chair,
With coffee-stained clothes and wild hair.
He debugged all night,
Till the code worked just right,
Then realized no one would care.`,
    expectedForm: 'Limerick',
    expectedMeter: 'anapestic',
    expectedRhymeScheme: 'AABBA',
    tags: ['limerick', 'humor', 'technology'],
  },
  {
    id: 'limerick-002',
    title: 'The Chef',
    content: `A chef from the city of Rome,
Made pasta that foamed like the foam.
His noodles were long,
His meatballs were strong,
But customers never came home.`,
    expectedForm: 'Limerick',
    expectedMeter: 'anapestic',
    expectedRhymeScheme: 'AABBA',
    tags: ['limerick', 'humor', 'food'],
  },
  {
    id: 'limerick-003',
    title: 'The Astronomer',
    content: `An astronomer gazed at the sky,
And counted the stars way up high.
She got to a billion,
Then a few more million,
And then she let out a big sigh.`,
    expectedForm: 'Limerick',
    expectedMeter: 'anapestic',
    expectedRhymeScheme: 'AABBA',
    tags: ['limerick', 'humor', 'science'],
  },
  {
    id: 'limerick-004',
    title: 'The Baker',
    content: `There once was a baker named Drew,
Who put his whole foot in the stew.
Said his wife with a frown,
"You must calm yourself down,
Or I'll put my whole foot into you!"`,
    expectedForm: 'Limerick',
    expectedMeter: 'anapestic',
    expectedRhymeScheme: 'AABBA',
    tags: ['limerick', 'humor'],
  },
  {
    id: 'limerick-005',
    title: 'The Poet',
    content: `A poet who lived in a tree,
Wrote verses for all who could see.
His rhymes were absurd,
Just like a strange bird,
But he did it completely for free.`,
    expectedForm: 'Limerick',
    expectedMeter: 'anapestic',
    expectedRhymeScheme: 'AABBA',
    tags: ['limerick', 'humor', 'meta'],
  },

  // =====================
  // FREE VERSE
  // =====================
  {
    id: 'free-verse-001',
    title: 'The City Wakes',
    content: `The city wakes
in increments—
first the bakers,
flour-dusted ghosts
moving through pre-dawn kitchens,
then the joggers,
breath clouding in the cold,
then the garbage trucks
grinding their mechanical songs.

By seven, the streets have filled
with people who don't see each other,
each wrapped in private urgencies,
earbuds blocking out the symphony
of engines, footsteps, distant sirens.

I watch from my window,
coffee growing cold,
and wonder
at all the invisible stories
passing by.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'urban', 'observation'],
  },
  {
    id: 'free-verse-002',
    title: 'After the Diagnosis',
    content: `The doctor's words
hang in the air
like smoke from a fire
I can't see.

Everything looks the same—
the fluorescent lights,
the chart on the wall
about hand washing,
the small window
showing an ordinary sky.

But something has shifted,
some tectonic plate
in the landscape of my life.
I am the same
and completely different.

My wife squeezes my hand.
We walk out
into a world
that doesn't know
what just happened
in room 304.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'illness', 'life-change'],
  },
  {
    id: 'free-verse-003',
    title: 'Grocery List',
    content: `Milk
eggs
the way you laughed that summer
bread
the photograph we never took
apples, red ones
your voice on the phone
cheese, any kind will do
the argument we never finished
dish soap
forgiveness
I forgot what else
I always forget.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'memory', 'experimental'],
  },
  {
    id: 'free-verse-004',
    title: 'Teaching My Daughter to Ride',
    content: `I hold the back of the seat
and run alongside,
pretending I'm still holding on
long after I've let go.

She wobbles,
corrects,
wobbles again,
and suddenly—

she's flying,
actually flying,
down the driveway
and I'm standing still
watching her go

farther than my hands can reach,
farther than my voice can follow,
into the bright afternoon
where she doesn't need me
anymore.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'parenting', 'growth'],
  },
  {
    id: 'free-verse-005',
    title: 'The Museum of Unfinished Sentences',
    content: `There's a museum somewhere
for all the things we didn't say:

"I love—"
"I'm sorry about—"
"The truth is—"
"Before you go, I want you to know—"

Exhibit halls of pregnant pauses,
walls hung with ellipses,
a garden of trailing thoughts.

Visitors walk through slowly,
filling in the blanks
with their own unfinished sentences,

wondering if the words they swallowed
still exist somewhere,
waiting to be found.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'communication', 'regret', 'metaphor'],
  },
  {
    id: 'free-verse-006',
    title: 'Variations on Water',
    content: `Water remembers nothing
and everything.

It was once inside a dinosaur,
a Roman fountain,
your grandmother's tea.

It falls on the just and unjust,
doesn't care about borders,
speaks the same language
whether it's the Ganges
or your kitchen faucet.

We are mostly water,
you and I—
rivers in human form,
always changing,
always the same.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'nature', 'philosophy'],
  },
  {
    id: 'free-verse-007',
    title: '3 AM',
    content: `The refrigerator hums
its one-note song.

Somewhere, a car passes.
Somewhere else, someone
is being born or dying
or falling in love
or out of it.

I stand at the window,
glass of water in hand,
belonging to the strange
fraternity of the sleepless,
the worried,
the haunted,
the inexplicably awake.

The night asks nothing.
I answer anyway.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'insomnia', 'night'],
  },

  // =====================
  // COUPLETS (AA BB CC...)
  // =====================
  {
    id: 'couplets-001',
    title: 'The Seasons Turn',
    content: `The winter snow begins to melt away,
As spring arrives to paint a brighter day.
The robins return to sing their song,
And days grow warm and light grows long.

Then summer comes with heat and golden sun,
When children play until the day is done.
The gardens burst with colors bright and bold,
And fireflies light up evenings growing old.

But autumn follows with its amber hue,
The leaves change colors—orange, red, and blue.
The harvest moon hangs heavy in the sky,
And flocks of geese go honking flying by.

Then winter comes again with frost and snow,
The cycle turns, the seasons come and go.`,
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'AA BB CC DD EE FF GG',
    tags: ['couplets', 'nature', 'seasons'],
  },
  {
    id: 'couplets-002',
    title: 'Advice from an Old Man',
    content: `Be kind to strangers—you were one yourself.
Don't gather dust like books upon a shelf.
Learn how to listen more than how to speak.
The strong are often gentler than the weak.

Don't measure life by what you own or earn.
From every failure, there is much to learn.
Keep close the friends who tell you what is true.
And be the friend that you would want for you.

The years pass faster than you'll ever know.
Plant seeds today, and watch them slowly grow.
Love deeply even when it costs you pain.
For life without such love is lived in vain.`,
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'AA BB CC DD EE FF',
    tags: ['couplets', 'wisdom', 'advice'],
  },

  // =====================
  // TERZA RIMA (ABA BCB CDC...)
  // =====================
  {
    id: 'terza-rima-001',
    title: 'The Journey Down',
    content: `I found myself within a darkened wood,
Where every path seemed tangled, wrong, and strange.
I could not find the way that once I stood.

The trees around me seemed to shift and change,
Their branches reaching down like grasping hands.
I walked, but found myself still in that range.

A guide appeared upon those shadowed lands,
With eyes that held the weight of ancient lore.
He gestured forward with his spectral hands.

"Follow me now, through this eternal door,
To see what lies beneath the world of men.
The truths you seek are deeper than before."

I followed him into the dark again,
Through circles where the lost ones weep and cry.
I learned the weight of every mortal sin.`,
    expectedForm: 'Terza Rima',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABA BCB CDC DED',
    tags: ['terza-rima', 'journey', 'dante-style'],
  },

  // =====================
  // POEMS WITH STRONG SOUND PATTERNS
  // =====================
  {
    id: 'alliteration-001',
    title: 'Peter Piper\'s Predicament',
    content: `Peter Piper picked a peck of pickled peppers,
A peck of pickled peppers Peter Piper picked.
If Peter Piper picked a peck of pickled peppers,
Where's the peck of pickled peppers Peter Piper picked?

Sally sells seashells by the seashore,
The shells she sells are surely seashells.
So if Sally sells shells on the seashore,
I'm sure she sells seashore shells.`,
    tags: ['alliteration', 'tongue-twister', 'sound-patterns'],
    notes: 'Heavy alliteration for testing sound pattern detection',
  },
  {
    id: 'alliteration-002',
    title: 'Sounds of Summer',
    content: `Soft sunlight settles slowly on the sand,
While waves wash wearily against the shore.
The breeze blows gently, barely felt, so bland,
And seagulls soar, then settle, seeking more.

The children chase each other, calling clear,
Their laughter lifts and lingers in the air.
The summer sun shines strong throughout the year,
But brings its brightest blessing here, right here.`,
    tags: ['alliteration', 'summer', 'sound-patterns'],
    notes: 'Strong alliteration patterns (S, W, B, C, L sounds)',
  },
  {
    id: 'assonance-001',
    title: 'The Long Road Home',
    content: `On the long road home, I know I roam alone,
Through groves of golden oaks and stones of old.
The cold wind moans and groans through hollow bones,
As crows fly low over the frosted fold.

So slow I go, though snow begins to show,
My soul grows cold but still I onward flow.
No, I won't stop, I know where I must go—
To the home I've known since long, long ago.`,
    tags: ['assonance', 'journey', 'sound-patterns'],
    notes: 'Strong O sound assonance throughout',
  },
  {
    id: 'consonance-001',
    title: 'Night Flight',
    content: `The light of night takes flight from sight,
As right and might give way to fright.
The bright moon's height brings slight delight,
While tight-shut eyes await the light.

Each word I heard was quite absurd,
A blurred and slurred, unheard bird.
The stirred wind whirred, my nerves were spurred,
And nothing afterward occurred.`,
    tags: ['consonance', 'night', 'sound-patterns'],
    notes: 'Strong -ight and -urd consonance patterns',
  },
  {
    id: 'sound-patterns-001',
    title: 'The Bell\'s Toll',
    content: `Hear the bell toll, deep and slow,
Its mellow bellow rolling low.
Below the hollow, shadows grow,
Where yellow willows weep and flow.

The knell fell well upon the dell,
A spell of farewell none could quell.
The swell of sound, the shell of sound,
Resound profound across the ground.`,
    tags: ['assonance', 'consonance', 'sound-patterns'],
    notes: 'Multiple sound patterns: -ell, -ow, -ound',
  },

  // =====================
  // INTERNAL RHYMES
  // =====================
  {
    id: 'internal-rhyme-001',
    title: 'The Raven\'s Call',
    content: `Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
While I nodded, nearly napping, suddenly there came a tapping,
As of someone gently rapping, rapping at my chamber door.

Deep into that darkness peering, long I stood there wondering, fearing,
Doubting, dreaming dreams no mortal ever dared to dream before.
And the silken, sad, uncertain rustling of each purple curtain
Thrilled me—filled me with fantastic terrors never felt before.`,
    tags: ['internal-rhyme', 'poe-style', 'gothic'],
    notes: 'Heavy internal rhymes: dreary/weary, napping/tapping/rapping, peering/fearing, uncertain/curtain, thrilled/filled',
  },
  {
    id: 'internal-rhyme-002',
    title: 'The Mariner\'s Song',
    content: `The fair breeze blew, the white foam flew,
The furrow followed free.
We were the first that ever burst
Into that silent sea.

Down dropt the breeze, the sails dropt down,
'Twas sad as sad could be.
And we did speak only to break
The silence of the sea.`,
    tags: ['internal-rhyme', 'nautical', 'coleridge-style'],
    notes: 'Internal rhymes: blew/flew, first/burst, speak/break',
  },
  {
    id: 'internal-rhyme-003',
    title: 'Wanderer\'s Way',
    content: `I walk in rain, through pain and strain,
Along the lane where memories remain.
The train's refrain echoes again,
Through hill and plain, this my domain.

My heart beats fast, the die is cast,
The past at last has come to pass.
Through glass I see what used to be,
Now free, like me, eternally.`,
    tags: ['internal-rhyme', 'journey', 'sound-patterns'],
    notes: 'Heavy internal rhymes for testing',
  },

  // =====================
  // VARIOUS METERS
  // =====================
  {
    id: 'trochaic-001',
    title: 'Forest Darkness',
    content: `Once upon a midnight dreary,
Wandered I through forests weary,
Seeking something, never finding,
Through the trees so dark and winding.

Shadows dancing, leaves were falling,
Distant voices softly calling,
Onward, onward, ever pressing,
Darkness round me, always pressing.`,
    expectedMeter: 'trochaic tetrameter',
    tags: ['trochaic', 'gothic', 'nature'],
    notes: 'Trochaic tetrameter (stressed-unstressed pattern)',
  },
  {
    id: 'anapestic-001',
    title: 'The Night Before',
    content: `'Twas the night before Christmas and all through the house,
Not a creature was stirring, not even a mouse.
The stockings were hung by the chimney with care,
In hopes that Saint Nicholas soon would be there.

The children were nestled all snug in their beds,
While visions of sugarplums danced in their heads.
And mama in her kerchief, and I in my cap,
Had just settled down for a long winter's nap.`,
    expectedMeter: 'anapestic tetrameter',
    tags: ['anapestic', 'christmas', 'narrative'],
    notes: 'Anapestic tetrameter (unstressed-unstressed-stressed)',
  },
  {
    id: 'dactylic-001',
    title: 'The Charge',
    content: `Half a league, half a league,
Half a league onward,
All in the valley of Death
Rode the six hundred.
Forward, the Light Brigade!
Charge for the guns, he said.
Into the valley of Death
Rode the six hundred.`,
    expectedMeter: 'dactylic',
    tags: ['dactylic', 'war', 'tennyson-style'],
    notes: 'Dactylic meter (stressed-unstressed-unstressed)',
  },
  {
    id: 'spondaic-001',
    title: 'Break, Break',
    content: `Break, break, break,
On thy cold gray stones, O Sea!
And I would that my tongue could utter
The thoughts that arise in me.

O, well for the fisherman's boy,
That he shouts with his sister at play!
O, well for the sailor lad,
That he sings in his boat on the bay!`,
    expectedMeter: 'varied with spondees',
    tags: ['spondaic', 'sea', 'grief'],
    notes: 'Contains spondaic feet (stressed-stressed)',
  },

  // =====================
  // POEMS FOR TESTING EDGE CASES
  // =====================
  {
    id: 'edge-case-001',
    title: 'One Word Lines',
    content: `Stop.
Listen.
Breathe.
Wait.
Feel.
Think.
Choose.
Act.
Live.`,
    tags: ['edge-case', 'minimalist', 'imperative'],
    notes: 'Testing single-word lines',
  },
  {
    id: 'edge-case-002',
    title: 'Very Long Lines',
    content: `I wandered through the ancient forest where the towering trees reached up toward the endless sky and the filtered sunlight created patterns on the mossy floor below.
The river wound its serpentine path through valleys carved by millennia of patient water working against the stubborn stone, never stopping, never resting, always flowing toward the distant sea.
And in that moment of perfect stillness, standing at the edge of everything I knew and everything I feared, I understood that time was just another river, flowing whether we watch it or not.`,
    tags: ['edge-case', 'prose-poetry', 'long-lines'],
    notes: 'Testing very long lines',
  },
  {
    id: 'edge-case-003',
    title: 'Mixed Languages',
    content: `C'est la vie, such is life,
We muddle through the joy and strife.
Das Leben geht, life goes on,
From dusk to dawn, from dusk to dawn.

La vita è bella, life is sweet,
When heart and hope and courage meet.
人生如梦, life's a dream,
Or so it often seems to seem.`,
    tags: ['edge-case', 'multilingual', 'philosophy'],
    notes: 'Testing mixed language handling',
  },
  {
    id: 'edge-case-004',
    title: 'Heavy Punctuation',
    content: `What? Why? When? Where? Who? How?
Questions, questions—everywhere!
Commas, dashes—semicolons; colons:
All the marks... that writers... use... somehow...

"Hello!" she said. "Goodbye," he cried.
(Parenthetically, aside.)
The em-dash—beloved by many—
Costs not even half a penny.`,
    tags: ['edge-case', 'punctuation', 'meta'],
    notes: 'Testing punctuation handling',
  },
  {
    id: 'edge-case-005',
    title: 'Numbers and Symbols',
    content: `In 1984, we read about the year,
2001: A Space Odyssey drew near.
By 2050, who knows what we'll see?
Perhaps we'll live to 150, you and me.

The temperature was 72° that day,
With 50% humidity, they say.
I walked 3.5 miles to the store,
And spent $49.99, maybe more.`,
    tags: ['edge-case', 'numbers', 'modern'],
    notes: 'Testing number and symbol handling',
  },
  {
    id: 'edge-case-006',
    title: 'Contractions Galore',
    content: `I can't believe you wouldn't, couldn't, shouldn't try,
When I'd've helped you if you'd only asked me why.
She's been there, done that, won't be going back,
They're the ones who'll never lack.

We've seen it all, we'd seen it twice,
You'll find that won't suffice.
I'm here, you're there, we're everywhere,
It's life, that's fair, who'd care?`,
    tags: ['edge-case', 'contractions', 'grammar'],
    notes: 'Testing contraction handling',
  },
  {
    id: 'edge-case-007',
    title: 'Archaic Language',
    content: `Wherefore art thou, Romeo, mine heart doth ache,
Forsooth, I prithee, for thy sweet love's sake.
Hark! What light through yonder window breaks?
'Tis but the dawn, methinks, for heaven's sake.

Thou shouldst not tarry, haste thee hence away,
Lest thou be caught before the break of day.
Mine eyes grow weary, yet mine soul doth soar,
Perchance to dream of thee forevermore.`,
    tags: ['edge-case', 'archaic', 'shakespeare-style'],
    notes: 'Testing archaic language handling',
  },
  {
    id: 'edge-case-008',
    title: 'Near Rhymes',
    content: `The orange door was open wide,
While purple curtains hung beside.
The silver moon shone through the glass,
And shadows moved across the grass.

Love and move don't really rhyme,
But poets use them all the time.
Though cough and through sound nothing alike,
They're close enough, if you like.`,
    tags: ['edge-case', 'near-rhymes', 'slant-rhymes'],
    notes: 'Testing near/slant rhyme detection',
  },
  {
    id: 'edge-case-009',
    title: 'Repeated Words',
    content: `The fog comes on little cat feet,
Cat feet, little feet, softly beat,
Beat the ground, the ground so sweet,
Sweet and soft where fog and feet meet.

Again, again, again we try,
Try and try and try to fly,
Fly so high into the sky,
Sky so blue, we wonder why, why, why.`,
    tags: ['edge-case', 'repetition', 'anaphora'],
    notes: 'Testing repeated word handling',
  },
  {
    id: 'edge-case-010',
    title: 'Homophone Pairs',
    content: `I knew that you were new in town,
Your fame had spread from crown to crown.
The knight rode through the night so dark,
To see the sea, to hear the lark.

They're going there to get their things,
Where wear and tear gives grief that stings.
I heard the herd across the plain,
And missed the mist that brought the rain.`,
    tags: ['edge-case', 'homophones', 'word-play'],
    notes: 'Testing homophone handling',
  },

  // =====================
  // MORE SONNETS FOR DIVERSITY
  // =====================
  {
    id: 'sonnet-011',
    title: 'To Sleep',
    content: `O soft embalmer of the still midnight,
Shutting with careful fingers and benign
Our gloom-pleased eyes, embowered from the light,
Enshaded in forgetfulness divine:

O soothest Sleep! if so it please thee, close
In midst of this thine hymn my willing eyes,
Or wait the amen, ere thy poppy throws
Around my bed its lulling charities.

Then save me, or the passed day will shine
Upon my pillow, breeding many woes;
Save me from curious conscience, that still lords
Its strength for darkness, burrowing like a mole;

Turn the key deftly in the oiled wards,
And seal the hushed casket of my soul.`,
    expectedForm: 'Keatsian Sonnet',
    expectedMeter: 'iambic pentameter',
    tags: ['sonnet', 'iambic-pentameter', 'sleep', 'keats-style'],
  },
  {
    id: 'sonnet-012',
    title: 'The City\'s Heart',
    content: `Beneath the towers of glass and steel so tall,
Where millions surge through arteries of stone,
There beats a heart that answers to no call,
A pulse that drums its rhythm all alone.

The subway rumbles like a dragon's breath,
While taxicabs crawl slowly through the veins.
The city lives and hovers close to death,
Its beauty forged through struggle and through pains.

At night the lights illuminate the sky,
A constellation born of human hands.
The sleepless dreamers wonder, asking why
This maze of streets and avenues expands.

Yet in this chaos, something strange survives:
The spark of hope that feeds a million lives.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'urban', 'metaphor'],
  },

  // =====================
  // QUATRAINS
  // =====================
  {
    id: 'quatrain-001',
    title: 'Four Seasons',
    content: `Spring brings the flowers after winter's sleep,
The world awakens with a joyful cry.
The gardeners sow the seeds they hope to reap,
As birds return beneath the warming sky.

Summer blazes with its golden heat,
The days stretch long into the purple night.
We walk with sandy toes and sunburned feet,
And chase the fireflies' enchanting light.

Autumn paints the world in red and gold,
The harvest moon hangs heavy, round, and bright.
We gather close as evenings grow more cold,
And watch the geese take off in southward flight.

Winter wraps the world in white so deep,
The silence broken by the crackling fire.
We curl up warm and drift to peaceful sleep,
And wait for spring to lift the world up higher.`,
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GHGH',
    tags: ['quatrain', 'seasons', 'nature'],
  },

  // =====================
  // ODES
  // =====================
  {
    id: 'ode-001',
    title: 'Ode to Coffee',
    content: `O dark elixir of the morning hour,
You lift me from my drowsy, foggy state.
Your bitter kiss gives me the will and power
To face another day, however late.

Within your depths, a universe resides—
The mountain farms, the hands that picked each bean,
The roasters' art where chemistry presides,
The ritual that plays out like a scene.

The gurgle of the pot, the rising steam,
The first sip that ignites my weary soul—
You turn my half-awake world to a dream,
And make my fragmented pieces whole.

Without you, morning would be dark and long,
A tuneless day devoid of any song.`,
    tags: ['ode', 'coffee', 'daily-life', 'celebration'],
  },
  {
    id: 'ode-002',
    title: 'Ode to Autumn',
    content: `Season of mists and mellow fruitfulness,
Close bosom-friend of the maturing sun,
Conspiring with him how to load and bless
With fruit the vines that round the thatch-eaves run.

To bend with apples the moss'd cottage-trees,
And fill all fruit with ripeness to the core,
To swell the gourd, and plump the hazel shells
With a sweet kernel, to set budding more.

And still more, later flowers for the bees,
Until they think warm days will never cease,
For summer has o'er-brimmed their clammy cells,
Who hath not seen thee oft amid thy store?`,
    expectedMeter: 'iambic pentameter',
    tags: ['ode', 'autumn', 'keats-style', 'nature'],
  },

  // =====================
  // ELEGIES
  // =====================
  {
    id: 'elegy-001',
    title: 'For a Friend',
    content: `The chair where you once sat remains unfilled,
Your coffee cup still hangs upon its hook.
The garden that you planted, now untilled,
Still holds your touch in every hidden nook.

I walk the paths we used to walk together,
And hear your voice in every singing bird.
Through spring and fall, through every kind of weather,
Your laughter echoes, though no longer heard.

They say that time will heal this aching wound,
That grief will fade like evening into night.
But I'm still listening for your favorite tune,
Still reaching for the phone to call, to write.

You've gone somewhere I cannot follow yet,
But I will carry you until we meet.
And in the meanwhile, I will not forget
The way you made my broken life complete.`,
    tags: ['elegy', 'grief', 'friendship', 'loss'],
  },

  // =====================
  // EPISTOLARY POEMS
  // =====================
  {
    id: 'epistle-001',
    title: 'Letter to My Younger Self',
    content: `Dear child, I write from somewhere up ahead,
Where time has taught me things you cannot know.
Don't listen to the cruel words they've said—
You'll bloom in ways they'll never watch you grow.

That boy who broke your heart in junior year?
He doesn't matter, though it feels like death.
The friends who disappeared? Don't waste a tear—
Better ones are coming, save your breath.

I know the nights feel endless, dark, and cold,
And nothing anyone says helps the pain.
But I can tell you, from this vantage old,
The sun comes out, eventually, again.

Keep reading. Keep on writing in that book.
Keep taking all those photographs of trees.
One day you'll be surprised at what you took,
And treasure all these tiny memories.

You'll fail at things that feel important now,
And succeed at things you haven't imagined yet.
Life has a way of working out somehow—
Just keep on walking, kid. You're not done yet.`,
    tags: ['epistle', 'letter', 'advice', 'youth'],
  },

  // =====================
  // DRAMATIC MONOLOGUES
  // =====================
  {
    id: 'monologue-001',
    title: 'The Old Lighthouse Keeper',
    content: `Forty years I've climbed these winding stairs,
Through storms that shook the very bones of stone.
I've watched a thousand ships, and said my prayers
For sailors struggling, far from wife and home.

The light must burn. That's all I ever knew.
When darkness falls and waves crash on the rocks,
Some poor lost captain searches for the view
Of this bright beacon through the tempest's shocks.

My wife, God rest her, never understood
Why I chose this hermit's life of light and sea.
"Come down," she'd say. "The keeper's life's no good."
But still I climbed. The light depended on me.

Now I'm too old. They've sent a young man here.
He's got his gadgets, doesn't need my ways.
The lighthouse automated—no more fear
Of keepers missing nights or sleeping days.

But still I climb. Force of habit, I suppose.
And stand here in the lantern room at dusk.
The new man doesn't know the way it glows,
Doesn't feel the duty in the must.

Some say I'm foolish, wasting what remains.
But I'll keep climbing till my legs give out.
The light must burn through all the dark and rains.
That's what this lighthouse keeper is about.`,
    tags: ['monologue', 'character', 'duty', 'aging'],
  },

  // =====================
  // NATURE POEMS
  // =====================
  {
    id: 'nature-001',
    title: 'The Oak',
    content: `Three hundred years this oak has stood,
Through drought and flood and fire and frost.
Its roots reach deep beneath the wood,
To waters never touched or lost.

The squirrels have made it their abode,
The owls have nested in its height.
A thousand birds have found their road
To shelter here from rain and night.

How many lovers carved their names
Into its rough and ancient bark?
How many children played their games
Beneath its branches, dawn to dark?

The oak does not complain or boast,
Just stands and grows through sun and rain.
It does what matters to it most:
Endures, endures, endures again.`,
    tags: ['nature', 'tree', 'endurance', 'time'],
  },
  {
    id: 'nature-002',
    title: 'Mountain Stream',
    content: `Born from snow on peaks so high,
The stream begins its journey down.
Beneath the vast and endless sky,
It tumbles toward the distant town.

It carves through granite, soft as silk,
This patient water's ancient art.
The stones grow smooth as mother's milk,
Caressed by liquid's tender heart.

The trout flash silver in the pools,
Where sunlight dapples on the floor.
The stream obeys no human rules,
Just follows gravity's ancient lore.

It joins the river, joins the sea,
Evaporates into the air,
Then falls as rain, forever free,
In cycles without end or care.`,
    tags: ['nature', 'water', 'cycle', 'meditation'],
  },

  // =====================
  // LOVE POEMS
  // =====================
  {
    id: 'love-001',
    title: 'First Sight',
    content: `I saw you standing by the window there,
The afternoon light tangled in your hair.
You looked up, smiled—and I forgot to breathe,
My heart caught like a pinned and trembling leaf.

We hadn't even spoken, hadn't met,
But something in that moment, something yet
Unnamed, unnamed, sparked between your eyes and mine,
Like recognition from another time.

I've read the poets' words on love at sight,
And always thought it nothing more than flight
Of fancy, or a story people told.
But there you stood, and suddenly the old

Clichés all rang with truth I'd never known.
You looked at me. I couldn't look away.
In that one glance, a thousand seeds were sown—
And still they bloom in me to this very day.`,
    tags: ['love', 'first-sight', 'romance'],
  },
  {
    id: 'love-002',
    title: 'Twenty Years',
    content: `Twenty years of morning coffee made,
Twenty years of your socks on my floor.
Twenty years since that first serenade,
And still I love you more.

Twenty years of arguments and tears,
Of making up in whispered midnight vows.
Twenty years of laughter, doubts, and fears,
Of raising children in this little house.

Your face has changed from what it was back then,
And mine has too—the mirror doesn't lie.
But when I look at you, I see again
That nervous boy beneath the summer sky.

Twenty years, and still my heart beats fast
When you walk in the room at end of day.
May twenty more at least fly by so fast,
With you beside me every step of way.`,
    tags: ['love', 'marriage', 'anniversary', 'commitment'],
  },

  // =====================
  // MORE VARIED POEMS TO REACH 100+
  // =====================
  {
    id: 'misc-001',
    title: 'Subway Sonata',
    content: `The doors slide shut, the train begins to move,
Through tunnels that the city's fathers dug.
We strangers sit in our familiar groove,
Each one of us a bug within a jug.

The saxophonist plays at 42nd Street,
His music echoing off the tiled walls.
Commuters tap their tired, aching feet,
As beauty rises where the darkness falls.

A child looks up with wonder in her eyes,
At lights that flash and rumble overhead.
Her mother checks her phone, no surprise,
While magic flickers just above her head.

We travel through the dark to find the light,
These metal worms that thread the city's night.`,
    tags: ['urban', 'subway', 'sonnet', 'observation'],
  },
  {
    id: 'misc-002',
    title: 'Recipe for Grief',
    content: `Take one departed soul, beloved and dear.
Add time—a year, a month, a week, a day.
Fold in the photographs, the souvenirs,
The voicemail message you can't throw away.

Let sit in silence while the memories rise.
Stir in the empty chair, the missing laugh.
Knead gently through the nights of muffled cries,
The half-finished conversations, cut in half.

Season with regret for things unsaid,
The visits you meant to make but didn't take.
Let rest beneath the heaviness of dread
That time will heal but never fully break.

Serve to yourself in portions, small at first,
Then larger as the years go rolling by.
This recipe was born of joy and thirst—
The price we pay for love is learning how to cry.`,
    tags: ['grief', 'loss', 'experimental', 'metaphor'],
  },
  {
    id: 'misc-003',
    title: 'The Clockmaker',
    content: `His hands, though old, are steady as the tick
Of every clock that lines his workshop walls.
He works by lamplight, patient, never quick,
While time itself around him rises, falls.

A thousand timepieces, all out of sync,
Click and whir and chime throughout the day.
He doesn't notice, doesn't pause to think
How strange this symphony of time at play.

His father taught him, and his father's father,
This craft of gears and springs and tiny screws.
The modern world has passed him by, but rather
Than quit, he keeps repairing clocks and cues.

"Time never stops," he says, "so neither do I."
And so he works until the day he'll die.`,
    tags: ['character', 'craftsman', 'time', 'dedication'],
  },
  {
    id: 'misc-004',
    title: 'Field Guide to Clouds',
    content: `Cumulus: the cotton-candy clouds
That children point at, finding shapes and dreams.
They billow upward like celestial shrouds,
And look more solid than they are, it seems.

Stratus: the blanket covering the sky,
A gray expanse from here to the horizon.
Beneath it, rain falls gently, or stands by,
While puddles wait like mirrors, sun-surprised.

Cirrus: the mare's tails high and thin and white,
Ice crystals painting streaks across the blue.
They herald change, but not today or tonight—
Tomorrow's weather, signaled in the view.

Cumulonimbus: the towering thunder king,
Whose anvil head means lightning, storm, and rain.
Beneath his crown, the frightened sparrows sing,
And farmers watch and hope he'll pass again.`,
    tags: ['nature', 'clouds', 'educational', 'observation'],
  },
  {
    id: 'misc-005',
    title: 'Dictionary',
    content: `Between its covers lie ten thousand keys
To every door that language ever built.
From A to Z, from aardvarks to the seas,
From guilt to glory, innocence to guilt.

I love the weight of it upon my lap,
The rustling of its tissue-paper pages.
The way it holds the world within its map,
The wisdom gathered through uncounted ages.

"Mellifluous"—the word tastes like its meaning.
"Petrichor"—the smell of rain on earth.
These treasures that I find while merely gleaning
Remind me of the magic of words' worth.

The internet has made this book obsolete,
They say. And yet I turn its pages still.
No algorithm makes my heart so beat
As wandering its columns does, and will.`,
    tags: ['books', 'language', 'nostalgia', 'celebration'],
  },
  {
    id: 'misc-006',
    title: 'The Algorithm',
    content: `It knows what I will buy before I know,
Predicts the news I want to see each day.
It guides my wandering attention's flow,
And gently herds me every step of way.

It says it wants to help, to ease my life,
To surface what I need before I need it.
But sometimes late at night, amid the strife
Of sleeplessness, I wonder if I've ceded

Too much control to this invisible hand,
This pattern-matching god of ones and zeros.
It cannot love, it cannot understand,
And yet it shapes the age's modern heroes.

We built the algorithm, but now I fear
It's building something else: the people we'll become.
Optimized, predicted, year by year,
Until free will is just a number's sum.`,
    tags: ['technology', 'ai', 'modern', 'anxiety'],
  },
  {
    id: 'misc-007',
    title: 'Yoga',
    content: `Breathe in, and stretch toward the morning sun,
Let spine unfurl like fern leaves, one by one.
This ancient practice, older than our tongue,
Connects the weary body to the young.

Warrior one: we stand as soldiers stood,
Before the battle, gathering our strength.
Warrior two: we face what must be wooded,
Arms stretched to show our will and breadth and length.

The corpse pose last: we lie as if in death,
But breathing, present, feeling every cell.
The practice ends, we rise with gentler breath,
And carry peace into the noisy swell.

Namaste, the teacher says, and bows.
The light in me salutes the light in you.
We roll our mats and make our quiet vows
To carry this small peace in all we do.`,
    tags: ['yoga', 'wellness', 'meditation', 'body'],
  },
  {
    id: 'misc-008',
    title: 'Night Shift',
    content: `The hospital at 3 AM is strange,
A world of beeps and whispers, soft-soled shoes.
The nurses make their quiet, careful range,
Dispensing pills and comfort, good and bad news.

In room 412, a baby's being born,
While down the hall, an old man breathes his last.
The boundary between the night and morn
Is blurred, the line between the future and past.

I push my cart of cleaning supplies through,
The invisible worker of these sterile halls.
I've seen things here that most will never view,
The secrets hidden by these curtained walls.

But still I come, night after weary night,
Because someone must keep the darkness clean.
Someone must scrub away the daily plight,
So morning finds a world that's fresh and keen.`,
    tags: ['work', 'hospital', 'character', 'dedication'],
  },
  {
    id: 'misc-009',
    title: 'Fibonacci',
    content: `One.
One.
Two rabbits.
Three, then five, then eight.
The pattern spirals outward, shells and sunflowers.
Mathematics hidden in the petals, in the seeds, in the branches of the trees reaching.`,
    expectedForm: 'Fibonacci',
    tags: ['experimental', 'math', 'nature', 'form'],
    notes: 'Fibonacci poem: each line has syllables equal to Fibonacci numbers (1,1,2,3,5,8...)',
  },
  {
    id: 'misc-010',
    title: 'Palindrome',
    content: `Forward falls the light of early dawn,
The dew rests on the grass like scattered pearls.
The world wakes up, its tired yawning drawn,
As morning slowly, sweetly, gently unfurls.

As morning slowly, sweetly, gently unfurls,
The world wakes up, its tired yawning drawn.
The dew rests on the grass like scattered pearls,
Forward falls the light of early dawn.`,
    tags: ['experimental', 'palindrome', 'dawn', 'form'],
    notes: 'Palindrome poem: reads same forwards and backwards by line',
  },

  // Add more poems to ensure we have 100+
  {
    id: 'misc-011',
    title: 'Compost',
    content: `Banana peels and coffee grounds and rinds,
The eggshells and the wilted lettuce leaves—
We throw away what nature never minds,
The scraps that decomposition receives.

Beneath the pile, the worms are doing work,
Converting waste to rich and fertile soil.
In darkness where bacteria must lurk,
The cycles of decay and growth uncoil.

My grandmother called it "black gold," and smiled,
Spreading it around her tomato plants.
She'd say, "Nothing's trash, my dearest child.
It's just life waiting for another chance."

I think of her whenever I walk out
To dump the scraps into the compost bin.
It's not just about making flowers sprout—
It's trust that something new will grow again.`,
    tags: ['nature', 'gardening', 'cycles', 'memory'],
  },
  {
    id: 'misc-012',
    title: 'Migraine',
    content: `It starts with light—too bright, too sharp, too white,
A flickering that signals what's to come.
Then pressure builds, a vice around the sight,
And every sound becomes a pounding drum.

I close the blinds, lie down in darkness deep,
While waves of nausea crash upon the shore.
I cannot think, I cannot eat or sleep,
Just wait for hours, sometimes six or more.

The doctors say it's vascular, it's stress,
It's diet, hormones, weather, who knows what.
They offer pills that sometimes help, I guess,
But often leave me dazed and in a rut.

Today I wait it out as I have learned,
This uninvited guest who comes and goes.
I breathe and pray until the corner's turned,
And light, once more, becomes a friend, not foes.`,
    tags: ['health', 'pain', 'personal', 'endurance'],
  },
  {
    id: 'misc-013',
    title: 'Thrift Store',
    content: `Someone else once loved this lamp, this chair,
This coffee mug with sailboats on its side.
They touched these things with ordinary care,
Before the yard sale or before they died.

I wander through the aisles of discarded lives,
Finding treasures in another's trash.
This blender where a smoothie still survives
In faded labels, bought for just some cash.

There's history in objects, don't you think?
The stories locked inside a worn-out shoe,
The lipstick stains around a coffee's brink,
The dog-eared novel that someone read through.

I take the lamp, the mug, and bring them home,
Where they begin new chapters, freshly bound.
Nothing's ever really lost or alone
When second chances can still be found.`,
    tags: ['objects', 'memory', 'thrift', 'philosophy'],
  },
  {
    id: 'misc-014',
    title: 'Barista',
    content: `Six shots of espresso before seven AM,
I know your order without being told.
Large oat-milk latte? Coming up, ma'am.
The same routines, reliable as gold.

My hands have memorized the dance by now:
The tamp, the pull, the steam, the pour, the swirl.
I've made ten thousand lattes—maybe more—
Since first I donned this apron as a girl.

You think you know me by my cheerful face,
My "Have a great day!" and my customer smile.
But after you walk out to start your race,
I'm just a human, tired, for a while.

Still, there's something sacred in this craft,
This morning ritual that fuels the world.
Before the chaos, before the daft
Demands of life, one perfect fern uncurled.`,
    tags: ['work', 'coffee', 'character', 'service'],
  },
  {
    id: 'misc-015',
    title: 'Northern Lights',
    content: `They dance above the frozen tundra floor,
In ribbons of green and purple light.
No photograph can capture what they are—
This silent ballet of the Arctic night.

The old myths said they were the spirits' fire,
Or bridges to the realms beyond our own.
They lift the watching human spirit higher,
And make us feel less tragically alone.

I stood in Iceland once and watched them play,
While tears froze on my cheeks like tiny gems.
How small I felt beneath their grand display,
And yet connected to their glowing hems.

The science says it's particles and fields,
The sun's wind hitting Earth's magnetic shield.
But even knowing what the science yields,
The magic isn't lessened, isn't healed.`,
    tags: ['nature', 'wonder', 'travel', 'transcendence'],
  },
  {
    id: 'misc-016',
    title: 'Bookshelf',
    content: `The spines tell stories of who I've been:
The fantasy phase of my teenage years,
The self-help books through which I've worked within,
The poetry that helped me through my tears.

There's Tolstoy that I swear I'll read someday,
And mysteries my mother passed along.
There's cookbooks stained with dinners on display,
And dog-eared lyrics to my favorite song.

Some people judge a person by their shelves—
A library's an autobiography.
These books are little pieces of ourselves,
The teachers of our own geography.

I could have bought an e-reader by now,
And freed the space this wooden case consumes.
But there's something in the heft and the allow
Of paper presence in our living rooms.`,
    tags: ['books', 'reading', 'identity', 'home'],
  },
  {
    id: 'misc-017',
    title: 'Campfire',
    content: `The flames dance orange against the dark,
While sparks fly upward to the stars above.
We sit in circle round this ancient arc,
This primal light that generations love.

Someone pulls out a guitar, starts to strum,
And voices join in songs we all half-know.
The marshmallows turn golden, sticky, done,
And faces catch the embers' warming glow.

Our phones are off—the signal doesn't reach—
And for this moment, no one seems to mind.
The fire crackles on the rocky beach,
And conversation, slow, begins to find

Its rhythm, uninterrupted by the buzz
Of notifications pulling us away.
We talk of nothing and everything because
The fire lets us be here, just today.`,
    tags: ['nature', 'community', 'fire', 'connection'],
  },
  {
    id: 'misc-018',
    title: 'Hands',
    content: `My mother's hands were rough from years of work,
From scrubbing floors and wringing out the wash.
She never let the hardest labors shirk,
And never counted what the years would cost.

My father's hands were calloused from the tools,
The hammer and the wrench, the plow, the rake.
He taught me all the trades and all their rules,
And showed me what strong hands could build and make.

My own hands now show marks of my own life:
The writer's bump, the keyboard's subtle wear.
I've held my children, comforted through strife,
And traced the faces of the ones I care.

These hands will age, grow spotted, weak, and thin,
As all hands do when time begins to tell.
But everything they've touched lives deep within—
The love, the work, the stories hands can tell.`,
    tags: ['family', 'work', 'body', 'legacy'],
  },
  {
    id: 'misc-019',
    title: 'Eclipse',
    content: `The moon moves slowly across the sun's face,
A cosmic shadow falling on the earth.
We gather, strangers, in this public space,
To witness something of profound worth.

The light grows strange—not dim, but somehow wrong,
As if the world were filtered through a dream.
The birds go quiet, pausing in their song,
And temperature drops cooler than it seems.

Then totality: the diamond ring appears,
The corona blazes white around the dark.
I hear the gasps, I see the joyful tears,
Of strangers moved by this celestial spark.

For two minutes, we stand in sacred awe,
Connected by this astronomical event.
The universe reminds us what we saw
Was always there, just needing this moment.`,
    tags: ['nature', 'astronomy', 'wonder', 'community'],
  },
  {
    id: 'misc-020',
    title: 'Dandelion',
    content: `The gardeners call you weed and pull you out,
But children know your yellow heart is gold.
They gather you in bunches, run about,
And blow your wishes when you're gray and old.

You push through cracks in sidewalks, parking lots,
Wherever soil has gathered, thin and poor.
You colonize the most unlikely spots,
A stubborn, bright, unwelcome visitor.

But I admire your tenacity,
Your will to bloom where nothing else will grow.
There's something in your wild audacity
That says: I'm here, and this is what I know.

So bloom on, dandelion, weed or flower,
Depending on the eye that does the seeing.
You teach us all to find our golden hour
In any soil that fosters our becoming.`,
    tags: ['nature', 'flowers', 'resilience', 'perspective'],
  },

  // =====================
  // ADDITIONAL SONNETS (more lines)
  // =====================
  {
    id: 'sonnet-013',
    title: 'The Telescope',
    content: `Through glass and mirror, reaching toward the void,
I peer at galaxies ten billion old.
These photons, traveling since stars were coy'd,
Now tell their ancient stories, hot and cold.

The nebulae glow pink with nascent stars,
While others, dying, cast their shells in space.
I trace the dusty lanes and spiral bars,
And wonder at our small and fragile place.

What strange thing is it, to be here and see
The universe examining itself?
Atoms of carbon, nitrogen, and me—
All stardust reading stardust off the shelf.

Tonight I point my scope at Andromeda,
Our neighbor, rushing toward us, ever nearer.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'astronomy', 'wonder'],
  },
  {
    id: 'sonnet-014',
    title: 'The Library at Night',
    content: `The library at night holds different air,
When readers all have gone and lights are low.
The books lean in, as if they all could share
The secrets that the silent shelves all know.

I walk the aisles like hallways in a dream,
Where Dickens talks to Woolf across the stacks.
The poetry and physics softly gleam,
While history reviews its truths and lacks.

A million voices, pressed in ink and glue,
Wait patiently for someone's curious hand.
Each spine a door to something strange and new,
A passport to some undiscovered land.

I choose a book and settle in my chair,
And all the world is waiting for me there.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'books', 'library'],
  },
  {
    id: 'sonnet-015',
    title: 'Late Capitalism',
    content: `We click and scroll and buy and throw away,
An endless cycle of consumer dreams.
The algorithms know just what to say
To hook our longing with their digital schemes.

The warehouses hum through the lonely night,
While workers pack the boxes, row on row.
A drone lifts off beneath the amber light—
Delivering the things we think we know

We need, we want, we cannot live without,
Though yesterday we'd never heard their name.
This system runs on manufactured doubt
And sells us cures for problems that it frames.

Perhaps the counter-spell is simple: less.
To want not more, but peace and connectedness.`,
    expectedForm: 'Shakespearean Sonnet',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABAB CDCD EFEF GG',
    tags: ['sonnet', 'iambic-pentameter', 'modern', 'capitalism', 'critique'],
  },

  // =====================
  // MORE NARRATIVE POEMS (longer)
  // =====================
  {
    id: 'narrative-001',
    title: 'The Lighthouse',
    content: `The lighthouse stands upon the rocky shore,
A sentinel against the raging sea.
For two hundred years and maybe more,
It's warned the ships where danger used to be.

The keeper, Thomas, climbs the spiral stair
Each evening as the sun begins to set.
He lights the lamp with practiced, tender care,
The same routine he's followed since they met—

The lighthouse and the man, both old and strong,
Both weathered by the salt and wind and time.
He tends the light and sometimes sings a song
The sailors taught him in another clime.

His wife is buried on the mainland hill,
His children scattered to the cities far.
But Thomas keeps his vigil, steadfast still,
A faithful planet circling around his star.

One night a storm came up without a warn,
The kind that makes the bravest sailors pray.
A fishing boat, its mainsail badly torn,
Was fighting just to live another day.

Thomas saw the ship through sheets of rain,
Her running lights a blur against the black.
He prayed and hoped his beam would help explain
Which way was safe, which way led to the rack.

The boat came closer, closer to the rocks,
Where many ships had met their sorry end.
The waves threw up like hammers at the locks,
And all aboard prepared to meet their friend—

That final friend who comes for everyone,
Who waits at every harbor, every shore.
They thought their mortal sailing days were done,
That they would see their families no more.

But Thomas turned his mirror just in time,
And caught the ship within the sweeping light.
The captain saw the beam cut through the grime
And turned his vessel hard into the night.

They made it past the rocks by just a hair,
Into the calm of the protected bay.
The sailors fell to knees in grateful prayer,
And Thomas watched them till the break of day.

He never met the men whose lives he saved,
They never climbed to thank him at his post.
But that's the lighthouse keeper's life, encaved
In solitude, a dedicated ghost.

He tends the light, he climbs the spiral stair,
He watches for the ships that never know
His name or face or even that he's there—
Just that the light is burning, row on row.

And when at last old Thomas passed away,
They found him in his chair beside the lamp.
His eyes were closed, as if in gentle pray,
His hand still on the wick, though cold and damp.

They say on stormy nights you still can see
A figure climbing up the spiral stair.
The lighthouse, automated now, runs free,
But Thomas' ghost is faithful, always there.`,
    tags: ['narrative', 'lighthouse', 'dedication', 'ghost', 'sea'],
    notes: 'Long narrative poem for testing line counts and story poems',
  },
  {
    id: 'narrative-002',
    title: 'The Immigrant\'s Journey',
    content: `My grandfather left everything behind—
The village where his father's father lived,
The olive trees, the goats, the daily grind
Of poverty that constantly aggrieved.

He packed a single suitcase, worn and brown,
With photographs and one change of clothes.
He walked the dusty road to port town,
And left behind the only life he knows.

The ship was crowded, dark, and thick with smell
Of bodies pressed together in the hold.
For weeks they sailed through what felt like hell,
Through sickness, storms, and loneliness untold.

At last they saw the statue in the bay,
Her torch held high above the morning mist.
My grandfather fell to his knees to pray,
And crossed himself and clenched his trembling fist.

They processed him through islands made of tears,
Where doctors checked his eyes and throat and heart.
He waited in those lines for endless years—
Or so it seemed—before his new life's start.

He landed in a city strange and loud,
Where no one spoke the language of his home.
He wandered through the streets among the crowd,
A single man, anonymous, alone.

He found a room above a butcher's shop,
And took a job unloading boats at dawn.
He worked until he thought that he would drop,
Then woke and worked again until the sun was gone.

He learned the language word by painful word,
And saved his pennies in a coffee can.
He wrote home letters that were never heard—
The village had no post for such a man.

But slowly, slowly, roots began to grow.
He met a woman at the neighborhood church.
She taught him English, helped his garden grow,
And ended his long, lonely, loveless search.

They married in a ceremony small,
With borrowed rings and vows in broken tongue.
A photograph still hangs upon our wall:
Two immigrants, impossibly young.

They had my father, then two daughters more.
They bought a house with money saved for years.
They never flew back to the distant shore—
Too far, too much, too many frozen tears.

My grandfather lived ninety years and three,
And never saw his village once again.
But in his garden, there he planted free
An olive tree, to honor where he'd been.

I touch its bark sometimes and think of him,
Of all he sacrificed so we could be.
His journey reaches past the farthest rim
Of anything I'll ever do or see.`,
    tags: ['narrative', 'immigration', 'family', 'sacrifice', 'history'],
    notes: 'Long narrative poem about immigration',
  },

  // =====================
  // MORE HAIKU (quick additions for variety)
  // =====================
  {
    id: 'haiku-016',
    title: 'Midnight Snack',
    content: `Refrigerator
hums its cold electric song
I eat cold pizza`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'modern', 'humor'],
  },
  {
    id: 'haiku-017',
    title: 'Email',
    content: `Inbox overflows
each message marked important
none of them are`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'modern', 'work'],
  },
  {
    id: 'haiku-018',
    title: 'Traffic',
    content: `Red light to red light
we inch through the morning rush
dreaming of our beds`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'modern', 'commute'],
  },
  {
    id: 'haiku-019',
    title: 'Old Photo',
    content: `Faded photograph
my mother young and laughing
before I was born`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'family', 'memory'],
  },
  {
    id: 'haiku-020',
    title: 'Storm Warning',
    content: `Leaves flip silver sides
the sky turns green and yellow
find shelter right now`,
    expectedForm: 'Haiku',
    expectedMeter: 'syllabic (5-7-5)',
    tags: ['haiku', 'nature', 'storm'],
  },

  // =====================
  // EXTENDED FREE VERSE
  // =====================
  {
    id: 'free-verse-008',
    title: 'What We Talk About When We Talk About Love',
    content: `We were sitting around the kitchen table,
the wine making us philosophical,
when someone asked what love really means.

Mel said it's wanting someone else's happiness
more than your own, and we nodded,
but then he told us about his ex-wife
who once tried to kill him,
who said she loved him so much
she'd rather see him dead than with anyone else.

Is that love? he asked. She thought so.

Terri said love is putting up with someone
even when they leave their socks on the floor
and snore like a freight train
and forget your birthday.
Love is staying anyway.

Nick was quiet, then said
maybe love is just attention.
The way you notice someone's face change
in the slant of afternoon light.
The way you learn the geography of their moods,
their silences, their small delights.

I didn't say anything.
I was thinking about my grandmother,
how she'd sit by my grandfather's bed
for three years after his stroke,
reading him the newspaper,
though he couldn't respond,
though the doctors said he couldn't hear.

She said she could tell by his eyes.
She said love doesn't need answers.

We finished the wine.
The question hung there, unresolved.
Maybe that's the point.
Maybe love is the question
we spend our whole lives failing to answer,
and the trying is enough.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'love', 'philosophy', 'conversation'],
  },
  {
    id: 'free-verse-009',
    title: 'The Last Day of Childhood',
    content: `I remember exactly when it ended—
not the date, but the feeling.

We were playing in the creek,
my brother and I,
building a dam from rocks and sticks
the way we'd done a hundred summers.

The water was cold and clear,
and crawdads scuttled from our reaching hands.
We were gods of that small kingdom,
masters of mud and frog and leaf.

Then something shifted.
Maybe the light. Maybe the angle of the sun.
Maybe just a thought that crossed my mind
like a cloud across a field.

I looked at my hands, muddy and small,
and suddenly saw them from outside—
a child's hands, doing childish things.
And I knew, in that instant,
that I would never feel this way again.

My brother called to me from downstream,
holding up a treasure—a bottle cap, a feather,
something precious only to children.

I smiled and waded toward him,
trying to get back to where I was,
but a door had closed
somewhere inside me,
and I couldn't find the handle.

We played until the sun went down.
We dried off and went home to dinner.
Everything was exactly the same,
except me.

That night I lay in bed
and felt the strange new weight
of being someone who knows
that childhood ends,
that nothing lasts,
that we are always leaving
even when we stay.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'childhood', 'growing-up', 'memory'],
  },
  {
    id: 'free-verse-010',
    title: 'A Brief History of Forgetting',
    content: `First, you forget their phone number.
You used to know it by heart,
but now you have to look it up.

Then you forget the sound of their voice.
Was it higher? Lower? Did they laugh
at the ends of sentences?

Next goes the smell.
That particular mix of soap and skin
that was theirs alone.

You forget what they looked like
when they were angry,
and then when they were sad.

The photographs become the memory.
You can no longer see them in your mind
without the help of paper, pixels.

You forget the conversations.
What was the last thing they said?
Surely something important—but no. Gone.

You forget the feel of their hand
in yours. The weight. The temperature.
The specific way their fingers interlaced.

Eventually, you forget whole years.
Did that trip happen? That dinner?
Was I even there?

What remains is a shape,
an outline of a person
who once was solid, real, here.

And yet—
some nights, at the edge of sleep,
a fragment surfaces:
the way they cleared their throat,
or tapped their foot when nervous,
or said your name.

And for a moment,
just a moment,
they're back.

Then morning comes,
and you forget
that you remembered.`,
    expectedForm: 'Free Verse',
    tags: ['free-verse', 'memory', 'loss', 'grief'],
  },

  // =====================
  // MORE METERED POEMS
  // =====================
  {
    id: 'iambic-tetrameter-001',
    title: 'The Village Blacksmith',
    content: `The smith stands at his forge all day,
His hammer rings with every blow.
He shapes the iron, hot and gray,
And makes the horseshoes row on row.

The muscles ripple on his arm,
The sweat drips down his weathered face.
He turns the cold steel red with charm,
And bends it to his will and grace.

The children stop to watch him work,
And marvel at the sparks that fly.
No duty does this master shirk,
Beneath the smoke-stained, soot-black sky.

At evening, when his work is done,
He hangs his apron on the wall.
He's earned his rest now, setting sun,
And waits for morning's call to call.`,
    expectedMeter: 'iambic tetrameter',
    expectedRhymeScheme: 'ABAB CDCD',
    tags: ['iambic-tetrameter', 'work', 'character', 'traditional'],
  },
  {
    id: 'iambic-tetrameter-002',
    title: 'Walking Home',
    content: `The streetlights flicker into life,
As evening settles on the town.
I walk away from daily strife,
The sun long since has traveled down.

My footsteps echo on the street,
Past houses glowing warm inside.
A dog barks out a simple greet,
And somewhere children run and hide.

The smell of dinners fills the air—
Spaghetti, roast, and fresh-baked bread.
I climb the steps, I'm almost there,
I'll soon be warm and loved and fed.

The door swings open, light spills out,
And someone calls my name with joy.
What life is really all about:
Coming home to this, my heart's employ.`,
    expectedMeter: 'iambic tetrameter',
    expectedRhymeScheme: 'ABAB CDCD',
    tags: ['iambic-tetrameter', 'home', 'evening', 'comfort'],
  },

  // =====================
  // OTTAVA RIMA (ABABABCC)
  // =====================
  {
    id: 'ottava-rima-001',
    title: 'The Feast',
    content: `The table groaned beneath the weight of food,
With roasted meats and vegetables galore.
The guests arrived in festive, happy mood,
And took their seats as they had done before.
The wine flowed freely, loosening all that's crude,
While musicians played beside the oaken door.
And as the night went on, the laughter grew,
Till dawn's first light revealed this happy crew.

The host stood up and raised his crystal glass,
To toast the friends who'd gathered at his call.
"May years like this continue still to pass,
May fortune bless us all within this hall."
The guests stood up—each lad and every lass—
And drank as one, together, one and all.
Then sat back down to feast and drink some more,
As they had done so many times before.`,
    expectedForm: 'Ottava Rima',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABABABCC',
    tags: ['ottava-rima', 'celebration', 'feast', 'traditional'],
  },

  // =====================
  // SPENSERIAN STANZA (ABABBCBCC)
  // =====================
  {
    id: 'spenserian-001',
    title: 'The Knight\'s Quest',
    content: `A gentle knight was pricking on the plain,
His armor bright beneath the morning sun.
He sought to right all wrongs and ease all pain,
And vowed to rest not till his quest was done.
Through forest dark and over mountains' reign,
Past dangers that would make a coward run,
He traveled on with courage in his heart,
For he had sworn to play a noble part,
And never from his sacred vow depart.

The days grew long, the nights grew cold and drear,
But still the knight pressed on through wind and rain.
He faced the dragon's breath without a fear,
And saved the maiden from her tower's chain.
The people cheered as he came riding near,
A hero home from war and strife and pain.
He knelt before the king upon his throne,
Who touched his sword upon the fighter's bone,
And gave to him great lands to call his own.`,
    expectedForm: 'Spenserian Stanza',
    expectedMeter: 'iambic pentameter',
    expectedRhymeScheme: 'ABABBCBCC',
    tags: ['spenserian', 'knight', 'quest', 'medieval'],
  },

  // =====================
  // GHAZAL (couplets with repeated refrain)
  // =====================
  {
    id: 'ghazal-001',
    title: 'The Garden of Memory',
    content: `In the garden of memory, I walk alone at night,
Where the roses of my past still bloom alone at night.

The fountain where we kissed has long since run dry,
But I hear its gentle music alone at night.

The bench where you once sat is weathered now and worn,
Yet still I come and sit there alone at night.

The moon was our witness to promises we made,
Now only she remembers, alone at night.

I call your name, but only echoes answer back,
In this garden of our love, alone at night.

The poet known as Wanderer walks these paths in grief,
Tending flowers only ghosts can see, alone at night.`,
    expectedForm: 'Ghazal',
    tags: ['ghazal', 'love', 'memory', 'loss', 'persian-form'],
  },

  // =====================
  // PANTOUM (lines 2 and 4 become lines 1 and 3 of next stanza)
  // =====================
  {
    id: 'pantoum-001',
    title: 'The Haunting',
    content: `The house still stands upon the hill,
Its windows dark as hollow eyes.
The wind blows through with eerie chill,
And somewhere in the attic, something cries.

Its windows dark as hollow eyes
Have watched a hundred years go by.
And somewhere in the attic, something cries
Beneath the cold and starless sky.

Have watched a hundred years go by,
The seasons turning, turning still.
Beneath the cold and starless sky,
The house still stands upon the hill.`,
    expectedForm: 'Pantoum',
    tags: ['pantoum', 'gothic', 'haunting', 'form'],
    notes: 'Pantoum form with repeating lines',
  },

  // =====================
  // CINQUAIN (various types)
  // =====================
  {
    id: 'cinquain-001',
    title: 'Butterfly',
    content: `Silent
Flutter, dancing
Through gardens bright with blooms
Painted wings catch morning sunlight
Beauty`,
    expectedForm: 'Cinquain',
    tags: ['cinquain', 'nature', 'butterfly'],
  },
  {
    id: 'cinquain-002',
    title: 'Ocean',
    content: `Ocean
Blue and endless
Waves crash on rocky shores
Salt spray rises to the waiting sky
Freedom`,
    expectedForm: 'Cinquain',
    tags: ['cinquain', 'nature', 'ocean'],
  },

  // =====================
  // ACROSTIC
  // =====================
  {
    id: 'acrostic-001',
    title: 'SPRING',
    content: `Sunlight stretches through the morning mist,
Petals opening in gardens everywhere.
Robins return to branches, amethyst
In early dawn, to fill the warming air.
New life emerges from the earth below,
Green shoots that reach toward the light they know.`,
    expectedForm: 'Acrostic',
    tags: ['acrostic', 'spring', 'nature', 'form'],
    notes: 'First letters spell SPRING',
  },
  {
    id: 'acrostic-002',
    title: 'POETRY',
    content: `Put words together, watch them come alive,
Observe the rhythms dancing on the page,
Embrace the metaphors that help us thrive,
Transform the ordinary into sage.
Rhyme and meter are the poet's tools,
Yet feeling is what truly moves and rules.`,
    expectedForm: 'Acrostic',
    tags: ['acrostic', 'meta', 'poetry', 'form'],
    notes: 'First letters spell POETRY',
  },

  // =====================
  // MORE TESTING EDGE CASES
  // =====================
  {
    id: 'mixed-meter-001',
    title: 'The River\'s Song',
    content: `The river runs (iambic, short and sweet)
Through valleys deep and forests dark and old.
A trochaic turn—falling from the mountaintop—
Then anapestic rushing, fast and free and bold!

Some lines are long, with many syllables to count and parse and measure,
While others: brief.

The meter shifts and changes like the water's flow,
Now slow, now fast, now steady as it goes.
This is how the river sings its ancient song,
A melody that's never right or wrong.`,
    tags: ['edge-case', 'mixed-meter', 'experimental'],
    notes: 'Mixed meters for testing meter detection',
  },
  {
    id: 'slant-rhyme-001',
    title: 'Almost Perfect',
    content: `The moon shone down with silver light,
Upon the calm and peaceful lake.
I walked alone into the night,
My heart still tender from heartache.

The words you spoke were not quite kind,
They cut but not too sharp or deep.
I try to leave the past behind,
But memories disturb my sleep.

Love and move don't really rhyme,
But close enough for poetry.
We do the best with what we find,
And that will have to be.`,
    tags: ['edge-case', 'slant-rhyme', 'love', 'testing'],
    notes: 'Contains near/slant rhymes for testing',
  },

  // =====================
  // PROSE POEMS
  // =====================
  {
    id: 'prose-poem-001',
    title: 'The Door',
    content: `There is a door in the basement that leads nowhere. I've lived in this house for fifteen years and never opened it. Some mornings I stand at the top of the stairs and listen. I tell myself there's nothing. I tell myself doors need to lead somewhere, and this one doesn't, so it isn't really a door at all. Just wood. Just hinges. Just a handle made of brass that's gone green with age or envy. But at night, when the house settles and the pipes sing their industrial lullabies, I sometimes hear what sounds like knocking. Three knocks. Pause. Three more. As if someone—or something—is following a pattern, waiting to be let in. Or out. I should move. I should open the door. I should board it up with nails and never think of it again. Instead, I do nothing. I drink my coffee. I go to work. I come home and don't look at the basement stairs. The door is patient. The door can wait. Some doors were never meant to be opened. Some doors are better left as questions. And some questions are better left unasked.`,
    expectedForm: 'Prose Poem',
    tags: ['prose-poem', 'gothic', 'mystery', 'psychological'],
  },
  {
    id: 'prose-poem-002',
    title: 'Instructions for Surviving the Night',
    content: `When the darkness comes, and it will come, do not run. Running makes noise, and the night has ears. Instead, become very still. Become the kind of quiet that exists between heartbeats. Think of all the people you have ever loved. Hold their faces in your mind like photographs. This will not protect you, but it will give you something to hold onto when the cold seeps in. If you hear your name being called, do not answer. The night knows all our names, but we do not have to respond. If you see a light in the distance, do not follow it. Not all lights lead to morning. Some lead deeper into dark. Wait. Breathe. Count the hours if you can still count. Remember: the night is long, but it is not endless. Even the longest dark gives way to dawn. You have survived every night before this one. You will survive this one too. And when the first gray light appears at the edge of the world, you will understand something that can only be learned in darkness: you are stronger than you know.`,
    expectedForm: 'Prose Poem',
    tags: ['prose-poem', 'survival', 'encouragement', 'lyrical'],
  },

  // =====================
  // ADDITIONAL LONG POEMS FOR LINE COUNT
  // =====================
  {
    id: 'epic-001',
    title: 'The Wanderer\'s Tale',
    content: `I.
The wanderer sets out at dawn's first light,
His pack upon his back, his heart afire.
He leaves behind the village and the night,
And seeks what lies beyond his known desire.

The road stretches ahead like a ribbon gray,
Through forests deep and valleys wide and green.
He knows not where it leads, he cannot say,
But forward is the only way to glean.

II.
The first town that he reaches seems asleep,
Its shutters closed against the morning sun.
He buys some bread and cheese, both fresh and cheap,
And eats beside a well when day is done.

An old man sits beside him on the stone,
And asks him where he's going, where he's been.
"I travel," says the wanderer, alone,
"To find the things I have not yet seen."

III.
"Ah, youth," the old man says with knowing smile,
"I too once sought the far horizon's edge.
I walked a thousand thousand weary mile,
And climbed up every cliff and every ledge.

And do you know what I discovered there,
Beyond the mountains and the distant seas?
That what I sought was waiting everywhere,
Inside my heart, as gentle as a breeze."

IV.
The wanderer considers what he's heard,
But shakes his head and rises to depart.
"With all respect, I trust you, every word,
But I must see the world with my own heart."

The old man nods and waves him on his way,
And watches till the wanderer disappears.
"Go find what you must find," you hear him say,
"The journey takes exactly what it takes of years."

V.
Through summer heat and autumn's painted leaves,
Through winter snow and spring's returning green,
The wanderer walks on and still believes
That somewhere waits the thing he's never seen.

He meets a woman in a market square,
Her eyes like amber, laugh like morning bell.
He stays a while and they begin to share
The stories that they both have learned to tell.

VI.
She says, "Stay here with me, you've walked enough.
We'll build a life together, plant a seed."
He's tempted—oh, the road has been so rough,
And here is warmth and love and all he'd need.

But something in him still looks toward the hill,
The road that winds away toward the unknown.
He loves her, yes, but cannot keep quite still.
The wanderer was born to walk alone.

VII.
He leaves her with a kiss and promises,
Returns someday, he says, when he is through.
She watches him depart, knows what she misses,
And turns back to her life to start anew.

The wanderer walks on through rain and sun,
Through years that pile like leaves upon the ground.
He cannot say what drives him, knows of none
Who understand this need to keep unfound.

VIII.
At last, when age has silvered all his hair,
And knees grown weak from all those miles of road,
He comes upon a village, small and fair,
And recognizes it—his first abode.

He's walked the world and circled back to start,
To find the place he left so long ago.
And in his tired, wandering, weathered heart,
He finally finds the thing he now can know:

IX.
The journey was the destination true,
The walking was the finding, all along.
Each mile, each step, each sunset's changing hue
Was teaching him the words to this old song.

He sits down on the bench beside the well,
Where once an old man sat and spoke to him.
A young man comes and asks him where to dwell,
What lies beyond the village, on the rim.

X.
The wanderer just smiles and nods his head,
"Go find what you must find, young traveler.
The road will teach you more than can be said.
But know the home you seek waits everywhere."

The young man nods and rises to depart,
And walks the same gray road that wanderers walk.
The old man watches with a peaceful heart,
And hears the songbirds begin to talk.

The circle turns, the road goes on and on,
Each wanderer must walk it for themselves.
The seeking is the finding, dusk to dawn,
Like books arranged upon eternal shelves.`,
    tags: ['epic', 'narrative', 'journey', 'wisdom', 'long'],
    notes: 'Long epic poem in sections',
  },
  {
    id: 'epic-002',
    title: 'The Seasons of a Life',
    content: `SPRING

We come into this world like spring arrives—
Uncertain, tender, reaching toward the light.
Our first breath draws the air that feeds our lives,
And eyes adjust from darkness into bright.

The early years are shoots that seek the sun,
Each day a new discovery, a bloom.
We learn to crawl and walk and laugh and run,
And every corner holds a hidden room.

Our parents are the gardeners of these years,
Who water us with love and tend our growth.
They shelter us from frost and dry our tears,
And shape the people we become in both.

The spring of life is sweet and passes fast,
Before we know it, summer's warmth has come.
We look back sometimes at that verdant past,
And wonder where those early years have gone.

SUMMER

The summer of our lives is long and bright,
When we are young and think we'll never age.
We fall in love beneath the stars at night,
And write our stories, fill up page by page.

We find our callings, build our working lives,
We marry, or we don't, we choose our path.
We navigate the chaos that arrives,
And calculate our own peculiar math.

The summer brings its storms, its days of rain,
When nothing seems to go the way we planned.
We suffer loss and heartbreak, grief and pain,
And learn to rise and offer others hand.

But summer also brings the harvest time,
When all our planting finally bears its fruit.
We gather what we've sown in seasons' rhyme,
And share the bounty with our dearest root.

AUTUMN

The autumn of our lives arrives one day,
When we look in the mirror and see gray.
The face that stares back shows the price we pay
For all those summer nights and winter's sway.

But autumn has its beauty, rich and deep—
The colors of the leaves as they let go.
We've earned the wisdom that the seasons keep,
And know much more than younger folks can know.

We watch our children grow and start their spring,
And grandchildren who carry on our line.
We teach them all the songs we've learned to sing,
And share with them the family's old wine.

The autumn years can be the finest yet,
When we have time to savor and reflect.
We sort through all the memories we've met,
And choose the ones we wish to recollect.

WINTER

And then at last the winter comes to call,
With shorter days and longer, colder nights.
The body slows, and we may sometimes fall,
But we have seen such wonders, such delights.

The winter is for rest and for goodbye,
For saying what we never took the time.
We watch the snow fall gently from the sky,
And hear the distant echo of the chime.

We've lived a life, we've loved and lost and found,
We've made our mark upon this spinning earth.
Now we prepare to go back to the ground,
To feed the spring that follows every death.

And so the cycle turns as it has turned,
Since first the world began to spin and roll.
Each lesson that we've lived, each truth we've learned,
Becomes a part of some eternal whole.

CODA

So live your spring with wonder, live it true.
Embrace your summer's heat and work and play.
Let autumn's colors fill your grateful view,
And winter's peace prepare you for the way.

We're all just seasons in this endless year,
Each one of us a chapter in the book.
The story goes on long after we're here—
So write it well, with every breath you took.`,
    tags: ['epic', 'life', 'seasons', 'philosophy', 'long'],
    notes: 'Long poem about life stages',
  },
  {
    id: 'collection-001',
    title: 'Twenty Short Observations',
    content: `1.
The cat sleeps in the sunbeam,
Absolutely certain
That the world was made for this.

2.
Rain on the roof at midnight—
The sound of the universe
Thinking its long thoughts.

3.
The old man on the park bench
Feeds the pigeons every day.
They are his only congregation.

4.
The teenager looks in the mirror,
Searching for the person
She is becoming.

5.
A book falls open to a page
You read years ago.
The same words, a different you.

6.
The bread rises slowly
In its warm, dark place.
Patience is also an ingredient.

7.
Two strangers share an umbrella
In a sudden downpour.
Kindness needs no introduction.

8.
The child asks why the sky is blue.
The parent doesn't know,
But makes something up.

9.
The astronaut looks down at Earth—
That pale blue dot is home
To everyone who's ever lived.

10.
The divorce papers sit unsigned
On the kitchen table.
The pen is heavier than it looks.

11.
She's reading his old letters
On the anniversary of his death.
Love doesn't have an expiration date.

12.
The seeds she planted in April
Are tomatoes now in August.
Time is the strangest magic.

13.
The musician plays to an empty room,
Practicing the song
Nobody will ever hear.

14.
The mountain doesn't care
If you climb it or not.
It will be there either way.

15.
The new mother holds her baby,
Counting fingers and toes.
Everything is a miracle at first.

16.
The dog waits by the door
For the person who will never return.
Loyalty is its own kind of blindness.

17.
The last page of the novel—
You slow down, not wanting
The story to end.

18.
He apologizes twenty years too late.
She forgives him anyway.
Time has its own mathematics.

19.
The snowflake lands on the window,
Unique and intricate,
Gone in a moment.

20.
The poem ends here,
But the reader continues—
Each interpretation a new beginning.`,
    tags: ['collection', 'observations', 'vignettes', 'short-poems', 'variety'],
    notes: 'Collection of 20 short poems/observations',
  },
  {
    id: 'dramatic-001',
    title: 'Voices from the Storm',
    content: `THE CAPTAIN:
The wind howls like a beast tonight,
And waves as tall as mountains rise.
I've sailed these waters all my life,
But never seen such angry skies.

Keep steady, men, hold fast the line!
We'll make it through if luck be kind.
I've cheated death a hundred times,
And I'll not leave my crew behind.

THE FIRST MATE:
The captain's mad, I say it plain,
To sail into this demon storm.
The ship is taking too much strain,
No hull can keep us dry and warm.

But still I follow his command,
As I have done these twenty years.
Perhaps we'll sight the promised land,
Or perish with our hopes and fears.

THE YOUNG SAILOR:
I joined this ship in port last spring,
A boy who'd never seen the sea.
I thought adventure it would bring,
And fortune waiting there for me.

Now I am sick with fear and cold,
And pray to gods I barely know.
Mother, if I don't grow old,
Know that I loved you so.

THE COOK:
Down in the galley, pots fly free,
The stove has long since lost its flame.
I've cooked through storms on many a sea,
But this one puts them all to shame.

I think of all the meals I've made,
The bread I've baked, the stew I've stirred.
If this is where my debt is paid,
At least I fed them well, each word.

THE STOWAWAY:
They don't know that I'm hiding here,
Among the barrels and the rope.
I had to flee, I had to clear
My name, and this ship was my hope.

Now I may die without a friend,
Unknown, unmourned, a nameless soul.
But still I pray this not the end,
And somehow we'll reach port and goal.

THE STORM (as it speaks):
I am not cruel, I have no will,
I am but wind and wave and rain.
I do not choose who lives or kill,
I am the pattern, not the pain.

All things must face me when I come,
The great, the small, the brave, the meek.
Some make it through, and some succumb—
The storm decides not whom to seek.

THE MORNING AFTER:
The sun rose gentle on the sea,
The ship survived, though barely so.
The sailors knelt in thanks, now free,
And watched the calming waters flow.

They'll tell this story all their days,
Of how they fought the demon storm.
Each man will speak in different ways,
But all agree: they made it home.`,
    tags: ['dramatic', 'voices', 'storm', 'sea', 'multiple-speakers'],
    notes: 'Poem with multiple voices/speakers',
  },
  {
    id: 'sonnet-sequence-001',
    title: 'Seven Sonnets for Seven Days',
    content: `SUNDAY
The day of rest begins with church bell's song,
That echoes through the quiet morning air.
We gather, though the week has been so long,
To offer up our gratitude and prayer.

The afternoon unfolds like Sunday best,
With dinners, naps, and lazy, languid hours.
The world slows down and gives itself a rest,
And children play among the garden flowers.

As evening comes, we feel a gentle dread—
Tomorrow brings the workweek back again.
We say our prayers and tuck ourselves in bed,
And hope this peace will somehow still remain.

The Sunday sun sets slowly in the west,
Reminding us that we, too, need our rest.

MONDAY
Monday arrives with all its heavy weight,
The alarm clock shrieking us awake.
We drag ourselves from dreams to meet our fate,
And wonder how much more that we can take.

The coffee helps, the shower clears the head,
But still the week stretches out so long.
We wish that we were back at home in bed,
Instead of in this endless working throng.

But Monday is a chance to start anew,
To tackle all the tasks we've put aside.
To prove ourselves in everything we do,
And take the weekly challenge in our stride.

So greet the Monday morning with a smile,
And make the coming week feel more worthwhile.

TUESDAY
Tuesday is the day we find our pace,
The shock of Monday mostly worn away.
We settle into work, we find our place,
And navigate the routines of the day.

No longer new, not yet exhausted quite,
Tuesday is the workhorse of the week.
We power through from morning until night,
And rarely pause to rest or take a peek.

The meetings and the emails never end,
The to-do list grows longer than before.
But Tuesday is a reliable friend,
Who helps us push through every task and chore.

Keep steady, keep on moving, don't give in,
Tuesday is where working weeks begin.

WEDNESDAY
The middle of the week, the hump, the crest,
From here we see the weekend drawing near.
We've given work our very best,
And now the finish line seems almost here.

Wednesday is for catching up on things,
For checking in on projects left behind.
For sorting through what every email brings,
And organizing our distracted mind.

At lunch we start to make our weekend plans,
And think of all the things we'd like to do.
We text our friends and family their demands,
And dream of Saturday's restorative view.

Hump day, they call it—over the hill we go,
The downward slope is easier, we know.

THURSDAY
Thursday feels like Friday's younger sibling,
So close to rest, yet not quite there yet.
Our concentration starts its slow unribling,
And we begin to feel a small regret

For all the work we meant to do this week,
The goals we set but didn't quite achieve.
We scramble now to find what we still seek,
And finish up before we take our leave.

But Thursday evening brings a certain calm,
A pre-weekend ease that smooths our brow.
Tomorrow is our healing, soothing balm,
And we can almost taste the freedom now.

One more day, just one, we tell ourselves,
As we place Thursday on our mental shelves.

FRIDAY
At last! The sweetest day has come around,
That golden gate to two days off from toil.
We walk with lighter step upon the ground,
And shed the workweek's heavy, crushing coil.

The office hums with restless, giddy cheer,
As five o'clock approaches, ever near.
The finish line is almost, almost here,
And soon we'll raise our glasses, toast with beer.

Friday night awaits with all its promise,
Of laughter, friends, and time to call our own.
We've earned this rest, we've paid the week its homage,
Now we can reap the seeds that we have sown.

TGIF! the people cry with joy,
A weekly pleasure nothing can destroy.

SATURDAY
Saturday blooms like flowers after rain,
A day with no alarms, no pressing need.
We sleep until our bodies feel less pain,
And wander slowly, free to take the lead.

The errands and the chores can wait, or not,
We choose the rhythm of this precious day.
We give ourselves whatever we have got,
And let the lazy hours drift away.

Some find their joy in projects, plans, and play,
While others simply sit and watch the clouds.
Saturday is ours to spend whichever way,
Away from work's relentless, pressing crowds.

This is the day we live for all week long,
The day that makes our weary hearts grow strong.`,
    tags: ['sonnet-sequence', 'days', 'week', 'work-life', 'series'],
    notes: 'Sequence of seven connected sonnets',
  },
];

// Helper function to count total lines
export function getTotalLineCount(): number {
  return TEST_POEMS.reduce((sum, poem) => {
    const lines = poem.content.split('\n').filter(line => line.trim().length > 0);
    return sum + lines.length;
  }, 0);
}

// Helper function to get poems by tag
export function getPoemsByTag(tag: string): TestPoem[] {
  return TEST_POEMS.filter(poem => poem.tags.includes(tag));
}

// Helper function to get poems by expected form
export function getPoemsByForm(form: string): TestPoem[] {
  return TEST_POEMS.filter(poem => poem.expectedForm?.toLowerCase().includes(form.toLowerCase()));
}

export default TEST_POEMS;
