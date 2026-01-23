import { useState, useRef, useEffect, useCallback } from 'react';
import './ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  poemTitle: string;
  poemText: string;
}

type ShareFormat = 'instagram-square' | 'instagram-story' | 'tiktok';

interface FormatConfig {
  name: string;
  width: number;
  height: number;
  description: string;
}

const FORMATS: Record<ShareFormat, FormatConfig> = {
  'instagram-square': {
    name: 'Instagram Feed',
    width: 1080,
    height: 1080,
    description: 'Square post (1:1)',
  },
  'instagram-story': {
    name: 'Instagram Story/Reel',
    width: 1080,
    height: 1920,
    description: 'Vertical (9:16)',
  },
  'tiktok': {
    name: 'TikTok',
    width: 1080,
    height: 1920,
    description: 'Vertical (9:16)',
  },
};

const BACKGROUND_COLORS = [
  { name: 'Cream', value: '#fdfcfa', textColor: '#2a2a2a' },
  { name: 'White', value: '#ffffff', textColor: '#1a1a1a' },
  { name: 'Black', value: '#1a1a1a', textColor: '#f5f5f5' },
  { name: 'Navy', value: '#1a2744', textColor: '#e8e8e8' },
  { name: 'Forest', value: '#1e3a2f', textColor: '#e8e8e8' },
  { name: 'Burgundy', value: '#4a1c2b', textColor: '#e8e8e8' },
  { name: 'Slate', value: '#3a3f4b', textColor: '#e8e8e8' },
  { name: 'Parchment', value: '#f4eed8', textColor: '#3a3a3a' },
];

export function ShareModal({ isOpen, onClose, poemTitle, poemText }: ShareModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('instagram-square');
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const selectedBg = BACKGROUND_COLORS[selectedBgIndex];
  const format = FORMATS[selectedFormat];

  // Generate the poem image on canvas
  const generateImage = useCallback((canvas: HTMLCanvasElement, scale: number = 1) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = format.width * scale;
    const height = format.height * scale;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = selectedBg.value;
    ctx.fillRect(0, 0, width, height);

    // Text settings
    const padding = 80 * scale;
    const titleFontSize = 36 * scale;
    const poemFontSize = 28 * scale;
    const lineHeight = 1.8;
    const maxWidth = width - (padding * 2);

    ctx.fillStyle = selectedBg.textColor;
    ctx.textAlign = 'center';

    // Calculate poem lines
    const lines = poemText.split('\n').filter(line => line.trim() !== '' || poemText.split('\n').indexOf(line) > 0);

    // Calculate total content height
    const titleHeight = poemTitle ? titleFontSize + 40 * scale : 0;
    const poemLineHeight = poemFontSize * lineHeight;
    const totalPoemHeight = lines.length * poemLineHeight;
    const watermarkHeight = 30 * scale;
    const totalContentHeight = titleHeight + totalPoemHeight + watermarkHeight;

    // Start Y position to center content vertically
    let y = (height - totalContentHeight) / 2;

    // Draw title
    if (poemTitle && poemTitle.trim() !== 'Untitled') {
      ctx.font = `italic ${titleFontSize}px 'Libre Baskerville', Georgia, serif`;
      ctx.fillText(poemTitle, width / 2, y + titleFontSize);
      y += titleHeight;
    }

    // Draw poem lines
    ctx.font = `${poemFontSize}px 'Libre Baskerville', Georgia, serif`;

    lines.forEach((line) => {
      y += poemLineHeight;

      // Handle long lines by wrapping
      if (ctx.measureText(line).width > maxWidth) {
        const words = line.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            ctx.fillText(currentLine, width / 2, y);
            y += poemLineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          ctx.fillText(currentLine, width / 2, y);
        }
      } else {
        ctx.fillText(line, width / 2, y);
      }
    });

    // Watermark
    ctx.font = `${14 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.globalAlpha = 0.4;
    ctx.fillText('poetryeditor.com', width / 2, height - padding / 2);
    ctx.globalAlpha = 1;
  }, [format, selectedBg, poemTitle, poemText]);

  // Update preview whenever settings change
  useEffect(() => {
    if (!isOpen || !previewRef.current) return;

    // Use a smaller scale for preview
    const previewScale = 0.25;
    generateImage(previewRef.current, previewScale);
  }, [isOpen, generateImage]);

  // Download the image
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      generateImage(canvasRef.current, 1);

      const link = document.createElement('a');
      const filename = poemTitle && poemTitle !== 'Untitled'
        ? `${poemTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${selectedFormat}.png`
        : `poem-${selectedFormat}.png`;

      link.download = filename;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share Your Poem</h2>
          <button className="share-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="share-modal-content">
          <div className="share-preview-section">
            <div
              className="share-preview-container"
              style={{
                aspectRatio: `${format.width} / ${format.height}`,
                maxHeight: selectedFormat === 'instagram-square' ? '300px' : '400px'
              }}
            >
              <canvas
                ref={previewRef}
                className="share-preview-canvas"
              />
            </div>
          </div>

          <div className="share-options-section">
            <div className="share-option-group">
              <label className="share-option-label">Format</label>
              <div className="share-format-buttons">
                {(Object.keys(FORMATS) as ShareFormat[]).map((formatKey) => (
                  <button
                    key={formatKey}
                    className={`share-format-btn ${selectedFormat === formatKey ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(formatKey)}
                  >
                    <span className="format-name">{FORMATS[formatKey].name}</span>
                    <span className="format-desc">{FORMATS[formatKey].description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="share-option-group">
              <label className="share-option-label">Background</label>
              <div className="share-bg-swatches">
                {BACKGROUND_COLORS.map((bg, index) => (
                  <button
                    key={bg.name}
                    className={`share-bg-swatch ${selectedBgIndex === index ? 'active' : ''}`}
                    style={{ backgroundColor: bg.value }}
                    onClick={() => setSelectedBgIndex(index)}
                    title={bg.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="share-modal-footer">
          <p className="share-instructions">
            Download the image, then share it on your favorite platform
          </p>
          <button
            className="share-download-btn"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Download Image'}
          </button>
        </div>

        {/* Hidden canvas for full-resolution export */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
