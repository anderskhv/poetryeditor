import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet60: PoemAnalysis = {
  slug: 'sonnet-60',
  title: 'Sonnet 60: Like as the waves make towards the pebbled shore',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `Like as the waves make towards the pebbled shore,
So do our minutes hasten to their end;
Each changing place with that which goes before,
In sequent toil all forwards do contend.
Nativity, once in the main of light,
Crawls to maturity, wherewith being crown'd,
Crooked eclipses 'gainst his glory fight,
And Time that gave doth now his gift confound.
Time doth transfix the flourish set on youth,
And delves the parallels in beauty's brow,
Feeds on the rarities of nature's truth,
And nothing stands but for his scythe to mow:
And yet to times in hope my verse shall stand,
Praising thy worth, despite his cruel hand.`,
  analysis: {
    overview: `Sonnet 60 uses waves as its central image—minutes rushing shoreward like breakers, each replacing the last. Time gives life then destroys it; birth "crawls to maturity" only to face "crooked eclipses." Yet the couplet asserts poetry's defiance: verse shall stand despite Time's scythe.`,
    lineByLine: [
      { lines: '1-4', commentary: `Waves and minutes—both rush forward, each replacing its predecessor in endless succession.` },
      { lines: '5-8', commentary: `Birth enters "main of light," grows, but Time turns against what it created.` },
      { lines: '9-12', commentary: `Time "transfixes" (pierces) youth, digs wrinkles ("parallels"), feeds on beauty. Nothing escapes the scythe.` },
      { lines: '13-14', commentary: `"Yet"—the turn. Despite all this, verse shall stand, praising worth against Time's cruelty.` }
    ],
    themes: ['Time as waves', 'Life cycle imagery', 'Poetry against mortality', 'Relentless passage'],
    literaryDevices: [
      { device: 'Simile', example: 'Minutes like waves', explanation: 'Time visualized as ocean—vast, relentless, rhythmic.' },
      { device: 'Personification', example: 'Time that gave doth now his gift confound', explanation: 'Time as giver and destroyer.' }
    ],
    historicalContext: `Number 60 for 60 minutes/seconds—the poem embodies its subject in its position.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 60 "Like as the waves" - meditation on time as ocean waves, with poetry as defense.'
};
