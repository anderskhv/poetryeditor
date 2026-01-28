import { PoemAnalysis } from './index';

export const sonnet29: PoemAnalysis = {
  slug: 'sonnet-29',
  title: 'Sonnet 29: When, in disgrace with fortune and men\'s eyes',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `When, in disgrace with fortune and men's eyes,
I all alone beweep my outcast state,
And trouble deaf heaven with my bootless cries,
And look upon myself and curse my fate,
Wishing me like to one more rich in hope,
Featured like him, like him with friends possessed,
Desiring this man's art and that man's scope,
With what I most enjoy contented least;
Yet in these thoughts myself almost despising,
Haply I think on thee, and then my state,
Like to the lark at break of day arising
From sullen earth, sings hymns at heaven's gate;
For thy sweet love remembered such wealth brings
That then I scorn to change my state with kings.`,
  analysis: {
    overview: `Sonnet 29 performs a psychological rescue. The first eight lines spiral into self-pity so complete it borders on self-indulgence—Shakespeare catalogues his failures, his envy, his despair. Then "haply" (by chance) he thinks of the beloved, and the poem literally lifts off the ground. The genius is in the structure: we sink low enough that the rise feels earned. But there's an uncomfortable question the poem doesn't answer: what happens when you stop thinking of the beloved? The rescue is temporary, dependent on memory. Shakespeare gives us depression accurately—the brief reprieve, not the cure.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `The opening is a controlled descent. "Disgrace with fortune and men's eyes"—both luck and reputation have failed him. "Beweep" is excessive, almost comic. "Trouble deaf heaven"—God isn't listening. "Bootless cries"—useless, like kicking with no boots. Every line pushes deeper into self-pity.`
      },
      {
        lines: '5-8',
        commentary: `Now envy: wanting another man's hope, looks, friends, talent, scope. "With what I most enjoy contented least"—even his own gifts bring no satisfaction. This is the depression signature: nothing works, even things that should. The accumulation feels exhausting, which is the point.`
      },
      {
        lines: '9-12',
        commentary: `"Yet"—the pivot word. "Haply" means by chance, not happily—this rescue isn't planned. The lark simile does all the work: rising from "sullen earth" (mud, darkness) to sing at heaven's gate. The very heaven that was deaf now receives hymns. Same speaker, same sky, different relationship.`
      },
      {
        lines: '13-14',
        commentary: `"Wealth" returns us to the "fortune" of line 1, but transformed. He now has riches kings don't have. "Scorn to change"—he wouldn't trade places. But notice: this is "sweet love remembered." Memory, not presence. The beloved may not even know they're performing this rescue.`
      }
    ],
    themes: [
      'Depression and its temporary relief',
      'Love as psychological rescue',
      'Envy and social comparison',
      'The power of memory',
      'Interior versus exterior wealth'
    ],
    literaryDevices: [
      {
        device: 'Volta (Turn)',
        example: '"Yet in these thoughts myself almost despising"',
        explanation: 'The turn comes late (line 9) and works by accumulation—we\'ve sunk so low that any rise feels dramatic.'
      },
      {
        device: 'Simile',
        example: '"Like to the lark at break of day arising"',
        explanation: 'The lark simile does emotional heavy lifting: ground to sky, darkness to light, silence to song, all in two lines.'
      },
      {
        device: 'Repetition',
        example: '"like him, like him"',
        explanation: 'The repetitive envying ("this man\'s art and that man\'s scope") mimics the obsessive quality of depression.'
      }
    ],
    historicalContext: `Written during a period when Shakespeare may have faced professional difficulties—the theaters closed for plague in 1592-94, and his patron Southampton was imprisoned in 1601. The sonnet's intimacy has led some to read it as autobiography, though Shakespeare often wrote in personas. The "outcast state" may refer to the social stigma actors faced.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 29 "When, in disgrace with fortune and men\'s eyes" - a poem about depression, envy, and the redemptive power of remembered love.'
};
