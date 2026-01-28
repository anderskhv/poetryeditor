import { PoemAnalysis } from './index';

// Source: Leaves of Grass (1865) - Public Domain

export const oCaptain: PoemAnalysis = {
  slug: 'o-captain',
  title: 'O Captain! My Captain!',
  poet: 'Walt Whitman',
  poetBirth: 1819,
  poetDeath: 1892,
  year: 1865,
  collection: 'Leaves of Grass',
  form: 'Elegy',
  text: `O Captain! my Captain! our fearful trip is done,
The ship has weather'd every rack, the prize we sought is won,
The port is near, the bells I hear, the people all exulting,
While follow eyes the steady keel, the vessel grim and daring;
But O heart! heart! heart!
O the bleeding drops of red,
Where on the deck my Captain lies,
Fallen cold and dead.

O Captain! my Captain! rise up and hear the bells;
Rise up—for you the flag is flung—for you the bugle trills,
For you bouquets and ribbon'd wreaths—for you the shores a-crowding,
For you they call, the swaying mass, their eager faces turning;
Here Captain! dear father!
This arm beneath your head!
It is some dream that on the deck,
You've fallen cold and dead.

My Captain does not answer, his lips are pale and still,
My father does not feel my arm, he has no pulse nor will,
The ship is anchor'd safe and sound, its voyage closed and done,
From fearful trip the victor ship comes in with object won;
Exult O shores, and ring O bells!
But I with mournful tread,
Walk the deck my Captain lies,
Fallen cold and dead.`,
  analysis: {
    overview: `This is Whitman's most conventional poem, and he knew it. He reportedly said he was "almost sorry" he wrote it because it overshadowed his more experimental work. The poem mourns Abraham Lincoln's assassination in April 1865, just as the Civil War ended. The extended metaphor is transparent: Lincoln is the Captain, America is the ship, the Civil War is the "fearful trip," and Union victory is the "prize." What makes the poem work isn't subtlety—it's the structural collapse. Each stanza starts with public celebration and ends with private grief. The crowds cheer while the speaker kneels over a corpse. That gap between national triumph and personal devastation is the poem's real subject.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `The opening establishes the extended metaphor immediately. "Fearful trip" = the Civil War. "The prize we sought" = preserved Union and abolition. The bells, crowds, and "exulting" create a scene of victory celebration. But notice "grim and daring"—even in triumph, there's foreboding.`
      },
      {
        lines: '5-8',
        commentary: `The pivot. "But O heart! heart! heart!" breaks the meter completely—Whitman shifts from long formal lines to short exclamations. This rhythmic collapse mirrors emotional collapse. The Captain "lies / Fallen cold and dead"—this refrain will repeat, becoming more unbearable each time.`
      },
      {
        lines: '9-12',
        commentary: `The speaker begs the Captain to rise and receive his honors. "For you the flag is flung"—the celebrations are specifically for him. The cruel irony: Lincoln won but cannot enjoy victory. The crowds don't yet know he's dead.`
      },
      {
        lines: '13-16',
        commentary: `"Dear father" shifts the relationship from military to familial. The speaker cradles the Captain's head, hoping it's "some dream." This denial stage is painfully human. The refrain "fallen cold and dead" now lands harder because we've seen the speaker's desperate hope.`
      },
      {
        lines: '17-20',
        commentary: `Reality sets in. "His lips are pale and still"—physical details confirm death. "He has no pulse nor will"—the leader who willed a nation through war now has no will at all. The voyage is "closed and done"—double meaning: the war ended, but so did Lincoln's life.`
      },
      {
        lines: '21-24',
        commentary: `The final stanza splits completely. "Exult O shores, and ring O bells!"—the speaker commands the celebration to continue. But "I with mournful tread" walks alone among the rejoicing. The nation celebrates; the speaker mourns. That split is the poem's final statement: victory and loss coexist.`
      }
    ],
    themes: [
      'The cost of victory',
      'Public triumph vs. private grief',
      'Lincoln as national father figure',
      'The loneliness of mourning amid celebration',
      'Leadership and sacrifice'
    ],
    literaryDevices: [
      {
        device: 'Extended Metaphor',
        example: 'Captain = Lincoln, Ship = America, Trip = Civil War',
        explanation: 'The entire poem operates through this allegory. It\'s unusually transparent for Whitman, which is why the poem became his most popular and his least favorite.'
      },
      {
        device: 'Refrain',
        example: '"Fallen cold and dead"',
        explanation: 'This phrase ends each stanza, gaining weight through repetition. By the third time, it\'s almost unbearable—we keep hoping for a different ending.'
      },
      {
        device: 'Rhythmic Collapse',
        example: '"But O heart! heart! heart!"',
        explanation: 'The long, measured lines break into short exclamations. The form enacts the content: composure shatters into grief.'
      },
      {
        device: 'Apostrophe',
        example: '"O Captain! my Captain!"',
        explanation: 'Addressing the dead directly makes the loss immediate. The speaker talks to someone who cannot answer.'
      },
      {
        device: 'Juxtaposition',
        example: 'Bells ringing / bleeding drops of red',
        explanation: 'Each stanza contrasts celebration with death. The gap between them is the poem\'s emotional core.'
      }
    ],
    historicalContext: `Lincoln was assassinated on April 14, 1865, just five days after Lee's surrender at Appomattox. Whitman, who had spent the war years nursing wounded soldiers in Washington, was devastated. This poem appeared in his 1865 sequel to Leaves of Grass. Unlike Whitman's usual free verse, it uses traditional meter and rhyme—perhaps because conventional grief demanded conventional form. The poem became so popular that Whitman was asked to recite it constantly, which annoyed him. He felt it misrepresented his work, calling it his "poetry of the surface."`
  },
  seoDescription: 'Analysis of Walt Whitman\'s "O Captain! My Captain!" A line-by-line examination of this elegy for Abraham Lincoln, exploring how the poem captures the collision of national victory and personal grief.'
};
