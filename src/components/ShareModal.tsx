import { useState, useRef, useEffect, useCallback, useMemo, useTransition } from 'react';
import './ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  poemTitle: string;
  poemText: string;
  paragraphAlign?: 'left' | 'center' | 'right';
}

type ShareFormat = 'square' | 'vertical';

interface FormatConfig {
  name: string;
  width: number;
  height: number;
  description: string;
}

const FORMATS: Record<ShareFormat, FormatConfig> = {
  'square': {
    name: '1:1',
    width: 1080,
    height: 1080,
    description: 'Instagram Feed',
  },
  'vertical': {
    name: '9:16',
    width: 1080,
    height: 1920,
    description: 'Stories, Reels, TikTok, X',
  },
};

const BACKGROUND_COLORS = [
  { name: 'Cream', value: '#fdfcfa', textColor: '#2a2a2a' },
  { name: 'White', value: '#ffffff', textColor: '#1a1a1a' },
  { name: 'Yellow', value: '#f5e6b8', textColor: '#3a3020' },
  { name: 'Parchment', value: '#f4eed8', textColor: '#3a3a3a' },
  { name: 'Black', value: '#1a1a1a', textColor: '#f5f5f5' },
  { name: 'Navy', value: '#1a2744', textColor: '#e8e8e8' },
  { name: 'Forest', value: '#1e3a2f', textColor: '#e8e8e8' },
  { name: 'Burgundy', value: '#4a1c2b', textColor: '#e8e8e8' },
];

const FONT_FAMILY = "'Libre Baskerville', Georgia, serif";

interface PageContent {
  lines: string[];
  pageNumber: number;
  totalPages: number;
}

/** Ensure the canvas font is available before rendering */
const ensureFontLoaded = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  try {
    await document.fonts.load(`24px ${FONT_FAMILY}`);
    await document.fonts.load(`italic 32px ${FONT_FAMILY}`);
  } catch {
    // Font API not supported or font unavailable — canvas will use fallback
  }
};

export function ShareModal({ isOpen, onClose, poemTitle, poemText, paragraphAlign = 'left' }: ShareModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('square');
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [, startTransition] = useTransition();
  const [fontReady, setFontReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const selectedBg = BACKGROUND_COLORS[selectedBgIndex];
  const format = FORMATS[selectedFormat];

  // Load font on open
  useEffect(() => {
    if (!isOpen) return;
    setFontReady(false);
    ensureFontLoaded().then(() => setFontReady(true));
  }, [isOpen]);

  // Handle format change — reset page to 0
  const handleFormatChange = useCallback((formatKey: ShareFormat) => {
    startTransition(() => {
      setSelectedFormat(formatKey);
      setCurrentPage(0);
    });
  }, []);

  // Calculate how content splits across pages
  const calculatedPages = useMemo((): PageContent[] => {
    const padding = 80;
    const titleFontSize = 32;
    const poemFontSize = 24;
    const lineHeight = 1.9;
    const maxWidth = format.width - (padding * 2);
    const availableHeight = format.height - (padding * 2) - 40; // Room for watermark

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return [{ lines: [], pageNumber: 1, totalPages: 1 }];

    ctx.font = `${poemFontSize}px ${FONT_FAMILY}`;

    // Process all lines including wrapping
    const allLines: string[] = [];
    const rawLines = poemText.split('\n');

    rawLines.forEach((line) => {
      if (line.trim() === '') {
        allLines.push('');
        return;
      }

      if (ctx.measureText(line).width > maxWidth) {
        const words = line.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            allLines.push(currentLine);
            // Only indent wrapped lines for left-aligned text
            currentLine = paragraphAlign === 'left' ? '    ' + word : word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          allLines.push(currentLine);
        }
      } else {
        allLines.push(line);
      }
    });

    // Calculate lines per page
    const poemLineHeight = poemFontSize * lineHeight;
    const titleHeight = poemTitle && poemTitle.trim() && poemTitle.trim() !== 'Untitled' ? titleFontSize + 30 : 0;
    const firstPageLines = Math.floor((availableHeight - titleHeight) / poemLineHeight);
    const subsequentPageLines = Math.floor(availableHeight / poemLineHeight);

    const pagesList: PageContent[] = [];
    let currentLineIndex = 0;

    while (currentLineIndex < allLines.length) {
      const isFirstPage = pagesList.length === 0;
      const linesForThisPage = isFirstPage ? firstPageLines : subsequentPageLines;
      const pageLines = allLines.slice(currentLineIndex, currentLineIndex + linesForThisPage);

      pagesList.push({
        lines: pageLines,
        pageNumber: pagesList.length + 1,
        totalPages: 0,
      });

      currentLineIndex += linesForThisPage;
    }

    pagesList.forEach(p => p.totalPages = pagesList.length);

    return pagesList.length > 0 ? pagesList : [{ lines: [], pageNumber: 1, totalPages: 1 }];
  }, [format, poemTitle, poemText, paragraphAlign]);

  // Generate the poem image on canvas
  const generateImage = useCallback((canvas: HTMLCanvasElement, scale: number = 1, pageIndex: number = 0) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    try {
      const width = format.width * scale;
      const height = format.height * scale;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = selectedBg.value;
      ctx.fillRect(0, 0, width, height);

      // Text settings
      const padding = 80 * scale;
      const titleFontSize = 32 * scale;
      const poemFontSize = 24 * scale;
      const lineHeight = 1.9;

      ctx.fillStyle = selectedBg.textColor;

      // Set text alignment based on poem formatting
      let textX = padding;
      if (paragraphAlign === 'center') {
        ctx.textAlign = 'center';
        textX = width / 2;
      } else if (paragraphAlign === 'right') {
        ctx.textAlign = 'right';
        textX = width - padding;
      } else {
        ctx.textAlign = 'left';
        textX = padding;
      }

      const pageData = pages[pageIndex];
      if (!pageData) return false;

      let y = padding;

      // Draw title only on first page
      if (pageIndex === 0 && poemTitle && poemTitle.trim() && poemTitle.trim() !== 'Untitled') {
        ctx.font = `italic ${titleFontSize}px ${FONT_FAMILY}`;
        ctx.fillText(poemTitle, textX, y + titleFontSize);
        y += titleFontSize + 30 * scale;
      }

      // Draw poem lines
      ctx.font = `${poemFontSize}px ${FONT_FAMILY}`;
      const poemLineHeight = poemFontSize * lineHeight;

      pageData.lines.forEach((line) => {
        y += poemLineHeight;
        ctx.fillText(line, textX, y);
      });

      // Watermark — save and restore to avoid alpha leaking
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = `${14 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.globalAlpha = 0.4;

      let watermarkText = 'poetryeditor.com';
      if (pages.length > 1) {
        watermarkText = `${pageData.pageNumber}/${pageData.totalPages} · poetryeditor.com`;
      }
      ctx.fillText(watermarkText, width / 2, height - padding / 2);
      ctx.restore();

      return true;
    } catch (err) {
      console.warn('ShareModal: canvas render failed', err);
      return false;
    }
  }, [format, selectedBg, poemTitle, pages, paragraphAlign]);

  // Update pages when calculation changes
  useEffect(() => {
    if (!isOpen) return;
    setPages(calculatedPages);
    setCurrentPage(0);
  }, [isOpen, calculatedPages]);

  // Update preview whenever settings change
  useEffect(() => {
    if (!isOpen || !previewRef.current || pages.length === 0 || !fontReady) return;

    const previewScale = 0.25;
    generateImage(previewRef.current, previewScale, currentPage);
  }, [isOpen, generateImage, currentPage, pages, fontReady]);

  // Download all images
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    if (pages.length === 0 || (pages.length === 1 && pages[0].lines.length === 0)) return;

    setIsGenerating(true);
    setDownloadProgress('');

    await ensureFontLoaded();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      for (let i = 0; i < pages.length; i++) {
        if (pages.length > 1) {
          setDownloadProgress(`Downloading ${i + 1} of ${pages.length}...`);
        }

        const success = generateImage(canvasRef.current, 1, i);
        if (!success) {
          console.warn(`ShareModal: failed to generate page ${i + 1}`);
          continue;
        }

        const link = document.createElement('a');
        const baseName = poemTitle && poemTitle.trim() && poemTitle.trim() !== 'Untitled'
          ? poemTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
          : 'poem';

        const pageIndicator = pages.length > 1 ? `-${i + 1}of${pages.length}` : '';
        link.download = `${baseName}-${selectedFormat}${pageIndicator}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();

        if (i < pages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (err) {
      console.warn('ShareModal: download failed', err);
    } finally {
      setIsGenerating(false);
      setDownloadProgress('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share</h2>
          <button className="share-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="share-modal-content">
          <div className="share-preview-section">
            <div
              className="share-preview-container"
              style={{
                aspectRatio: `${format.width} / ${format.height}`,
                maxHeight: selectedFormat === 'square' ? '300px' : '400px'
              }}
            >
              <canvas
                ref={previewRef}
                className="share-preview-canvas"
              />
            </div>

            {pages.length > 1 && (
              <div className="share-page-nav">
                <button
                  className="share-page-btn"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ‹
                </button>
                <span className="share-page-indicator">
                  Page {currentPage + 1} of {pages.length}
                </span>
                <button
                  className="share-page-btn"
                  onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                  disabled={currentPage === pages.length - 1}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          <div className="share-options-section">
            <div className="share-option-group">
              <label className="share-option-label">Format</label>
              <div className="share-format-buttons">
                {(Object.keys(FORMATS) as ShareFormat[]).map((formatKey) => (
                  <button
                    key={formatKey}
                    className={`share-format-btn ${selectedFormat === formatKey ? 'active' : ''}`}
                    onClick={() => handleFormatChange(formatKey)}
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
            {pages.length > 1
              ? `Your poem spans ${pages.length} images. All will be downloaded.`
              : 'Download the image, then share it on your favorite platform'}
          </p>
          <button
            className="share-download-btn"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating
              ? (downloadProgress || 'Generating...')
              : pages.length > 1
                ? `Download ${pages.length} Images`
                : 'Download Image'}
          </button>
        </div>

        {/* Hidden canvas for full-resolution export */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
