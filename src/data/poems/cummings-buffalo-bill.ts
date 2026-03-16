import { PoemAnalysis } from './index';

// Source: Public domain (published 1920)

export const buffalosBill: PoemAnalysis = {
  slug: 'buffalo-bills',
  title: "Buffalo Bill's",
  poet: 'e.e. cummings',
  poetBirth: 1894,
  poetDeath: 1962,
  year: 1920,
  collection: 'Tulips and Chimneys',
  form: 'Free verse with experimental typography',
  text: `Buffalo Bill's
defunct
       who used to
       ride a watersmooth-silver
                                 stallion
and break onetwothreefourfive pigeonsjustlikethat
                                                  Jesus

he was a handsome man
                      and what i want to know is
how do you like your blueeyed boy
Mister Death`,
  analysis: {
    overview: 'Cummings eulogizes Buffalo Bill Cody with characteristic typographic invention, compressing the showman\'s legendary speed into fused words while confronting death with irreverent directness. The poem is simultaneously an elegy and a challenge.',
    lineByLine: [
      { lines: '1-2', commentary: 'The possessive "Buffalo Bill\'s" followed by "defunct" is deliberately deflating. Not "dead" or "departed" but "defunct" — a word usually reserved for closed businesses or obsolete machines. The legend is reduced to a thing that stopped working.' },
      { lines: '3-5', commentary: 'The indentation creates a visual gallop. "Watersmooth-silver" is a cummings compound that captures both the color and fluid motion of the horse. "Stallion" sits alone at the far right, arriving like the horse itself.' },
      { lines: '6-7', commentary: 'The compressed "onetwothreefourfive pigeonsjustlikethat" is the poem\'s most famous move — the speed of the shooting act rendered as a single breathless rush. "Jesus" functions as both an exclamation of awe and a theological invocation beside death.' },
      { lines: '8-11', commentary: 'The direct address to "Mister Death" personifies mortality as a collector. "How do you like your blueeyed boy" is at once tender (the diminutive "boy") and confrontational (demanding Death answer for taking him). The politeness of "Mister" is laced with sarcasm.' }
    ],
    themes: ['Mortality', 'American mythology', 'The spectacle of the frontier', 'Irreverence toward death', 'Speed and vitality'],
    literaryDevices: [
      { device: 'Portmanteau', example: 'onetwothreefourfive pigeonsjustlikethat', explanation: 'Fusing the words eliminates the pauses between shots, making the reader experience the rapid-fire marksmanship as a single continuous act.' },
      { device: 'Neologism', example: 'watersmooth-silver', explanation: 'A compound adjective that merges texture, color, and motion into a single sensory impression of the stallion.' },
      { device: 'Personification', example: 'Mister Death', explanation: 'Death is addressed as a gentleman caller or collector, given the formal honorific that makes the confrontation both polite and menacing.' },
      { device: 'Visual typography', example: 'The staggered indentation throughout', explanation: 'The layout on the page mimics the galloping rhythm and sudden stops of a Wild West show performance.' }
    ],
    historicalContext: 'William "Buffalo Bill" Cody died in 1917. His Wild West Show had been a massive American entertainment spectacle from the 1880s through the early 1900s. Cummings, writing just three years after Cody\'s death, captures the collision between frontier mythology and modern mortality.'
  },
  seoDescription: 'Buffalo Bill\'s by e.e. cummings — full text and analysis of this typographically inventive elegy for the Wild West showman, with its famous compressed shooting sequence and confrontation with Mister Death.'
};
