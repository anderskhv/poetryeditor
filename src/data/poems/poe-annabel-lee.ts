import { PoemAnalysis } from './index';

// Source: New York Tribune (1849) - Public Domain

export const annabelLee: PoemAnalysis = {
  slug: 'annabel-lee',
  title: 'Annabel Lee',
  poet: 'Edgar Allan Poe',
  poetBirth: 1809,
  poetDeath: 1849,
  year: 1849,
  collection: 'Posthumous',
  form: 'Ballad',
  text: `It was many and many a year ago,
In a kingdom by the sea,
That a maiden there lived whom you may know
By the name of Annabel Lee;
And this maiden she lived with no other thought
Than to love and be loved by me.

I was a child and she was a child,
In this kingdom by the sea,
But we loved with a love that was more than love—
I and my Annabel Lee—
With a love that the winged seraphs of heaven
Coveted her and me.

And this was the reason that, long ago,
In this kingdom by the sea,
A wind blew out of a cloud, chilling
My beautiful Annabel Lee;
So that her highborn kinsmen came
And bore her away from me,
To shut her up in a sepulchre
In this kingdom by the sea.

The angels, not half so happy in heaven,
Went envying her and me—
Yes!—that was the reason (as all men know,
In this kingdom by the sea)
That the wind came out of the cloud by night,
Chilling and killing my Annabel Lee.

But our love it was stronger by far than the love
Of those who were older than we—
Of many far wiser than we—
And neither the angels in heaven above
Nor the demons down under the sea
Can ever dissever my soul from the soul
Of my beautiful Annabel Lee;

For the moon never beams, without bringing me dreams
Of the beautiful Annabel Lee;
And the stars never rise, but I feel the bright eyes
Of the beautiful Annabel Lee;
And so, all the night-tide, I lie down by the side
Of my darling—my darling—my life and my bride,
In her sepulchre there by the sea—
In her tomb by the sounding sea.`,
  analysis: {
    overview: `This was Poe's last complete poem, written months before his death. The obsessive repetition of "Annabel Lee" and "kingdom by the sea" creates a hypnotic, almost deranged effect—this is grief that has become madness. The speaker blames angels for killing Annabel Lee out of jealousy, which is either a bold theological claim or a sign of unhinged thinking. Most disturbing: the final stanza reveals he lies down nightly in her tomb. This isn't memory or mourning—it's necrophilic devotion. Poe probably wrote it about his wife Virginia, who died of tuberculosis at 24. The "kingdom by the sea" is a fairytale setting that makes the horror feel dreamlike, which somehow makes it worse.`,
    lineByLine: [
      {
        lines: '1-6',
        commentary: `"Many and many a year ago"—fairytale opening, like "once upon a time." The "kingdom by the sea" is vague, mythic. Annabel Lee "lived with no other thought / Than to love and be loved by me"—she exists only as an object of love. She has no other characteristics. This is worship, not relationship.`
      },
      {
        lines: '7-12',
        commentary: `"I was a child and she was a child"—emphasizing innocence and youth. "A love that was more than love"—what does that mean? It's either transcendent or excessive. The seraphs "coveted" their love—Poe makes angels jealous and greedy. This is theologically bizarre and sets up his accusation.`
      },
      {
        lines: '13-20',
        commentary: `Here's the accusation: angels killed her. "A wind blew out of a cloud, chilling"—she died of something like pneumonia or tuberculosis. But Poe frames natural death as supernatural murder. "Highborn kinsmen" took her body—class enters the poem. They had different social standing.`
      },
      {
        lines: '21-26',
        commentary: `Poe doubles down: "Yes!—that was the reason." The exclamation mark and dash show defensive insistence. "(As all men know)"—nobody knows this; he's alone in his delusion. "Chilling and killing"—the rhyme makes death sound like a nursery rhyme, which is deeply unsettling.`
      },
      {
        lines: '27-32',
        commentary: `The defiance. "Neither the angels in heaven above / Nor the demons down under the sea"—he challenges both divine and infernal powers. "Can ever dissever my soul from the soul"—the internal rhyme is almost aggressive. Their love defeats cosmic forces—or so he insists.`
      },
      {
        lines: '33-41',
        commentary: `The disturbing conclusion. Moon, stars, and night all bring Annabel Lee to him—he can't escape her. Then: "I lie down by the side / Of my darling." He sleeps in her tomb. "My life and my bride"—present tense. He's married to a corpse. The "sounding sea" echoes endlessly, as his grief will.`
      }
    ],
    themes: [
      'Love that survives death (or refuses to accept it)',
      'Grief as madness',
      'Jealousy attributed to heaven',
      'Childhood innocence corrupted',
      'The boundary between devotion and obsession'
    ],
    literaryDevices: [
      {
        device: 'Repetition/Refrain',
        example: '"kingdom by the sea," "Annabel Lee"',
        explanation: 'The obsessive repetition mimics obsessive grief. The phrases become incantatory, as if repeating them could bring her back or keep her present.'
      },
      {
        device: 'Internal Rhyme',
        example: '"chilling and killing," "can ever dissever"',
        explanation: 'Poe packs rhymes inside lines as well as at line endings. This creates a musical, hypnotic effect that draws readers into the speaker\'s mental state.'
      },
      {
        device: 'Fairytale Frame',
        example: '"kingdom by the sea," "many and many a year ago"',
        explanation: 'The fairytale setting distances the horror. We\'re in once-upon-a-time land, which makes the necrophilic ending feel dreamlike rather than realistic—and thus more acceptable to readers.'
      },
      {
        device: 'Unreliable Narrator',
        example: '"as all men know"',
        explanation: 'The speaker claims universal agreement for his delusion that angels murdered his love. This signals his unreliability—we\'re hearing a madman\'s version of events.'
      },
      {
        device: 'Personification',
        example: 'Jealous angels, envious seraphs',
        explanation: 'Angels become petty and murderous. This inverts traditional theology—heaven is cruel, and the speaker is the victim of divine spite.'
      }
    ],
    historicalContext: `Poe wrote this in 1849, the year he died under mysterious circumstances in Baltimore. His wife Virginia had died of tuberculosis in 1847, and many readers see her in Annabel Lee. Virginia was Poe's first cousin; they married when she was 13 and he was 27. Her long illness and death devastated him. The poem was published two days after Poe's death in the New York Tribune. The "kingdom by the sea" may echo the coastal areas where Poe lived, but it functions mainly as an unreal, mythic space where his grief drama unfolds.`
  },
  seoDescription: 'Analysis of Edgar Allan Poe\'s "Annabel Lee." Line-by-line examination of Poe\'s final poem exploring obsessive love, grief as madness, and devotion that crosses into disturbing territory.'
};
