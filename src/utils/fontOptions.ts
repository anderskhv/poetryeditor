export interface FontOption {
  id: string;
  name: string;
  family: string;
  googleFont: string | null;
}

export const FONT_OPTIONS: FontOption[] = [
  // Serif - Classic
  { id: 'libre-baskerville', name: 'Libre Baskerville', family: "'Libre Baskerville', serif", googleFont: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400' },
  { id: 'eb-garamond', name: 'EB Garamond', family: "'EB Garamond', serif", googleFont: 'EB+Garamond:ital,wght@0,400;0,700;1,400' },
  { id: 'crimson-pro', name: 'Crimson Pro', family: "'Crimson Pro', serif", googleFont: 'Crimson+Pro:ital,wght@0,400;0,700;1,400' },
  { id: 'lora', name: 'Lora', family: "'Lora', serif", googleFont: 'Lora:ital,wght@0,400;0,700;1,400' },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", googleFont: 'Merriweather:ital,wght@0,400;0,700;1,400' },
  { id: 'playfair-display', name: 'Playfair Display', family: "'Playfair Display', serif", googleFont: 'Playfair+Display:ital,wght@0,400;0,700;1,400' },
  { id: 'source-serif-pro', name: 'Source Serif Pro', family: "'Source Serif 4', serif", googleFont: 'Source+Serif+4:ital,wght@0,400;0,700;1,400' },
  { id: 'cormorant-garamond', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", googleFont: 'Cormorant+Garamond:ital,wght@0,400;0,700;1,400' },
  { id: 'spectral', name: 'Spectral', family: "'Spectral', serif", googleFont: 'Spectral:ital,wght@0,400;0,700;1,400' },
  { id: 'georgia', name: 'Georgia', family: "Georgia, serif", googleFont: null },
  // Serif - Elegant
  { id: 'cormorant', name: 'Cormorant', family: "'Cormorant', serif", googleFont: 'Cormorant:ital,wght@0,400;0,700;1,400' },
  { id: 'cardo', name: 'Cardo', family: "'Cardo', serif", googleFont: 'Cardo:ital,wght@0,400;0,700;1,400' },
  { id: 'gentium-plus', name: 'Gentium Plus', family: "'Gentium Plus', serif", googleFont: 'Gentium+Plus:ital,wght@0,400;0,700;1,400' },
  { id: 'alegreya', name: 'Alegreya', family: "'Alegreya', serif", googleFont: 'Alegreya:ital,wght@0,400;0,700;1,400' },
  { id: 'noto-serif', name: 'Noto Serif', family: "'Noto Serif', serif", googleFont: 'Noto+Serif:ital,wght@0,400;0,700;1,400' },
  // Sans Serif - Modern
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", googleFont: 'Inter:wght@400;500;700' },
  { id: 'source-sans-pro', name: 'Source Sans Pro', family: "'Source Sans 3', sans-serif", googleFont: 'Source+Sans+3:ital,wght@0,400;0,700;1,400' },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', sans-serif", googleFont: 'Open+Sans:ital,wght@0,400;0,700;1,400' },
  { id: 'lato', name: 'Lato', family: "'Lato', sans-serif", googleFont: 'Lato:ital,wght@0,400;0,700;1,400' },
  // Typewriter / Monospace
  { id: 'courier-prime', name: 'Courier Prime', family: "'Courier Prime', monospace", googleFont: 'Courier+Prime:ital,wght@0,400;0,700;1,400' },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace", googleFont: 'IBM+Plex+Mono:ital,wght@0,400;0,700;1,400' },
  // System fonts
  { id: 'times', name: 'Times New Roman', family: "'Times New Roman', serif", googleFont: null },
  { id: 'palatino', name: 'Palatino', family: "Palatino, 'Palatino Linotype', serif", googleFont: null },
];

export function getFontFamily(fontId: string): string {
  const font = FONT_OPTIONS.find(f => f.id === fontId);
  return font ? font.family : "'Libre Baskerville', serif";
}

export function getFontOption(fontId: string): FontOption | undefined {
  return FONT_OPTIONS.find(f => f.id === fontId);
}
