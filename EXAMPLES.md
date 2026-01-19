# Poetry Examples

This file contains example poems that demonstrate the various features of the Poetry Editor. Try copying these into the editor to see different meter patterns and analysis results!

## Iambic Pentameter - Shakespeare's Sonnet 18

```
Shall I compare thee to a summer's day?
Thou art more lovely and more temperate.
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimmed;
And every fair from fair sometime declines,
By chance or nature's changing course untrimmed.
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st,
Nor shall death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st.
So long as men can breathe or eyes can see,
So long lives this, and this gives life to thee.
```

**Analysis**: Each line has 10 syllables in iambic pentameter (da-DUM da-DUM da-DUM da-DUM da-DUM). The editor should detect this pattern with high consistency.

---

## Haiku - Traditional Japanese Form

```
An old silent pond
A frog jumps into the pond
Splash! Silence again
```

**Analysis**: Perfect 5-7-5 syllable pattern. The editor has special haiku detection and will show a badge when this pattern is found.

---

## Trochaic Tetrameter - From "The Raven" by Poe

```
Once upon a midnight dreary
While I pondered weak and weary
Over many a quaint and curious
Volume of forgotten lore
```

**Analysis**: Each line (except the last) has 8 syllables. This demonstrates trochaic tetrameter (DUM-da DUM-da DUM-da DUM-da).

---

## Free Verse - Modern Poetry

```
I carry your heart with me
I carry it in my heart
I am never without it
Anywhere I go you go
Whatever is done by only me
Is your doing
```

**Analysis**: Variable syllable counts (7, 6, 7, 6, 8, 3). The editor will identify this as "Mixed or Free Verse" with low consistency.

---

## Anapestic Tetrameter - From "The Destruction of Sennacherib" by Byron

```
The Assyrian came down like the wolf on the fold
And his cohorts were gleaming in purple and gold
And the sheen of their spears was like stars on the sea
When the blue wave rolls nightly on deep Galilee
```

**Analysis**: Approximately 12 syllables per line in anapestic meter (da-da-DUM da-da-DUM da-da-DUM da-da-DUM).

---

## Short-line Poetry - Imagism

```
The red wheelbarrow
Glazed with rain
Beside the white
Chickens
```

**Analysis**: Very short lines (5, 3, 4, 2 syllables) demonstrate the editor's ability to handle minimalist poetry.

---

## Rich in Adjectives - Descriptive Poetry

```
The brilliant golden sun descended slowly
Over vast purple mountains standing tall
While gentle silver streams flowed peacefully
Through ancient verdant forests standing still
```

**Analysis**: Heavy use of adjectives (brilliant, golden, vast, purple, gentle, silver, ancient, verdant). The POS distribution will show a high percentage of adjectives, highlighted in dusty rose.

---

## Verb-Heavy - Action Poetry

```
I run through fields and leap across streams
I dance beneath stars and sing to the moon
I climb up mountains and soar through clouds
I dive into oceans and swim with whales
```

**Analysis**: Action-packed with many verbs (run, leap, dance, sing, climb, soar, dive, swim). The editor will show these highlighted in mauve with high verb percentage in the distribution.

---

## Noun-Heavy - Imagery Poetry

```
Sunset sky fire light darkness night
Stars moon clouds wind trees leaves shadows
Mountains rivers valleys plains meadows forests
Silence peace beauty wonder awe reverence
```

**Analysis**: Lists of concrete nouns. The POS distribution will show a very high percentage of nouns (sage green highlighting).

---

## Adverb Focus - Manner Poetry

```
She spoke softly slowly carefully precisely
Moved gracefully smoothly effortlessly naturally
Thought deeply quietly thoroughly completely
Lived fully truly honestly authentically
```

**Analysis**: Rich in adverbs (-ly words). These will be highlighted in amber and show high adverb percentage.

---

## Balanced POS - Well-rounded Poetry

```
The gentle river flows quietly through ancient woods
Where birds sing sweetly in tall green trees
While soft winds whisper secrets to listening leaves
And time moves slowly through peaceful afternoons
```

**Analysis**: Good balance of all parts of speech - nouns, verbs, adjectives, and adverbs evenly distributed. Great for seeing all four colors in action.

---

## Tips for Using These Examples

1. **Copy and paste** any poem into the editor
2. **Watch the real-time highlighting** as each word gets colored by its part of speech
3. **Check the analysis panel** to see:
   - Syllable counts per line
   - Detected meter pattern
   - POS distribution percentages
4. **Try editing** the poems and watch the analysis update in real-time
5. **Compare patterns** by switching between different poem styles

## Creating Your Own

When writing your own poetry, try:
- Aim for consistent syllable counts for traditional meters
- Mix parts of speech for dynamic, engaging verse
- Use the color-coding to spot overuse of any one POS category
- Experiment with different line lengths and watch the meter detection
- Check if you accidentally created a haiku!

Enjoy exploring poetry through the lens of natural language processing!
