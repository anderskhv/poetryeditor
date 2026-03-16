import { PoemAnalysis } from './index';

// Source: Public domain (Donne died 1631)

export const sunRising: PoemAnalysis = {
  slug: 'the-sun-rising',
  title: 'The Sun Rising',
  poet: 'John Donne',
  poetBirth: 1572,
  poetDeath: 1631,
  year: 1633,
  form: 'Three stanzas of 10 lines each with varied meter and ABBACDCDEE rhyme scheme',
  text: `Busy old fool, unruly sun,
Why dost thou thus,
Through windows, and through curtains call on us?
Must to thy motions lovers' seasons run?
Saucy pedantic wretch, go chide
Late school boys and sour prentices,
Go tell court huntsmen that the king will ride,
Call country ants to harvest offices;
Love, all alike, no season knows nor clime,
Nor hours, days, months, which are the rags of time.

Thy beams, so reverend and strong
Why shouldst thou think?
I could eclipse and cloud them with a wink,
But that I would not lose her sight so long;
If her eyes have not blinded thine,
Look, and tomorrow late, tell me,
Whether both th' Indias of spice and mine
Be where thou leftst them, or lie here with me.
Ask for those kings whom thou saw'st yesterday,
And thou shalt hear, All here in one bed lay.

She's all states, and all princes, I,
Nothing else is.
Princes do but play us; compared to this,
All honor's mimic, all wealth alchemy.
Thou, sun, art half as happy as we,
In that the world's contracted thus;
Thine age asks ease, and since thy duties be
To warm the world, that's done in warming us.
Shine here to us, and thou art everywhere;
This bed thy center is, these walls, thy sphere.`,
  analysis: {
    overview: `"The Sun Rising" is Donne at his most audacious: a lover in bed scolds the sun for interrupting, then argues that the entire world — its wealth, its kingdoms, its geography — is concentrated in the beloved. The poem moves from irritation to cosmic hyperbole, ending with the bed as the center of the universe and the bedroom walls as the sun's orbit.`,
    lineByLine: [
      { lines: '1-10', commentary: `The speaker insults the sun as a "busy old fool" and "saucy pedantic wretch," telling it to bother schoolboys and apprentices instead. Love exists outside time — it "no season knows nor clime." Hours, days, and months are mere "rags of time," unworthy of love's attention.` },
      { lines: '11-20', commentary: `The speaker claims he could "eclipse and cloud" the sun's beams with a wink, but won't because he'd lose sight of his beloved. He challenges the sun: look at her eyes, then report whether the riches of "both th' Indias" and all the world's kings aren't right here in this bed.` },
      { lines: '21-30', commentary: `The hyperbole reaches its peak: "She's all states, and all princes, I, / Nothing else is." All worldly honor is "mimic," all wealth "alchemy" (fake). The sun, old and tired, need only warm this room to fulfill its duty to the whole world. The final couplet redraws the cosmos: "This bed thy center is, these walls, thy sphere."` }
    ],
    themes: ['Love as supreme reality', 'Defiance of authority and convention', 'The microcosm of the beloved', 'Time as irrelevant to love'],
    literaryDevices: [
      { device: 'Apostrophe', example: 'Busy old fool, unruly sun', explanation: 'Addressing the sun directly as a meddlesome intruder establishes the speaker\'s comic authority over cosmic forces.' },
      { device: 'Hyperbole', example: 'She\'s all states, and all princes, I', explanation: 'The beloved literally contains all the world\'s wealth and geography — exaggeration as an expression of love\'s totality.' },
      { device: 'Metaphysical conceit', example: 'This bed thy center is, these walls, thy sphere', explanation: 'Reimagines Ptolemaic cosmology with the lovers\' bed as the center of the universe and the bedroom as the sun\'s orbital sphere.' },
      { device: 'Metonymy', example: 'both th\' Indias of spice and mine', explanation: 'The East Indies (spices) and West Indies (gold mines) stand for all the world\'s wealth, which the speaker claims resides in his beloved.' }
    ],
    historicalContext: `Published posthumously in 1633 in Donne's Songs and Sonnets, though likely written in the 1590s or early 1600s during his years as a young wit and lover. The poem's cosmology is Ptolemaic — the sun orbits the earth — which Donne uses playfully even as Copernican astronomy was gaining acceptance. The "Indias" references reflect England's expanding awareness of global trade routes and colonial wealth.`
  },
  seoDescription: 'The Sun Rising by John Donne - analysis of the metaphysical love poem where a lover commands the sun and remakes the cosmos.'
};
