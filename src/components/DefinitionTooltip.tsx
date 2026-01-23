import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { fetchWordInfo, WordDefinition } from '../utils/wordInfoApi';
import './DefinitionTooltip.css';

interface DefinitionTooltipProps {
  word: string;
  children: ReactNode;
}

// Cache to avoid refetching the same word
const definitionCache = new Map<string, WordDefinition[] | null>();

export function DefinitionTooltip({ word, children }: DefinitionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [definitions, setDefinitions] = useState<WordDefinition[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<'above' | 'below'>('above');
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const showTooltip = useCallback(() => {
    setIsVisible(true);

    // Check position relative to viewport
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      setPosition(spaceAbove < 150 ? 'below' : 'above');
    }

    // Fetch definitions if not cached
    if (!definitionCache.has(word)) {
      setLoading(true);
      fetchWordInfo(word).then((info) => {
        const defs = info?.definitions || null;
        definitionCache.set(word, defs);
        setDefinitions(defs);
        setLoading(false);
      });
    } else {
      setDefinitions(definitionCache.get(word) || null);
    }
  }, [word]);

  const hideTooltip = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  const handleMouseEnter = () => {
    // Delay showing tooltip to avoid accidental triggers
    hoverTimeoutRef.current = setTimeout(showTooltip, 300);
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default to avoid triggering mouse events
    e.stopPropagation();

    if (isVisible) {
      // If already visible, hide it
      hideTooltip();
    } else {
      // Show tooltip immediately on touch
      showTooltip();
    }
  };

  // Close tooltip when clicking outside on touch devices
  useEffect(() => {
    if (!isVisible) return;

    const handleTouchOutside = (e: TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        hideTooltip();
      }
    };

    // Add listener with a small delay to avoid immediate close
    const timeout = setTimeout(() => {
      document.addEventListener('touchstart', handleTouchOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [isVisible, hideTooltip]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={wrapperRef}
      className="definition-tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {children}
      {isVisible && (
        <div className={`definition-tooltip ${position}`}>
          <div className="tooltip-word">{word}</div>
          {loading ? (
            <div className="tooltip-loading">Loading...</div>
          ) : definitions && definitions.length > 0 ? (
            <div className="tooltip-definitions">
              {definitions.slice(0, 2).map((def, idx) => (
                <div key={idx} className="tooltip-definition">
                  <span className="tooltip-pos">{def.partOfSpeech}</span>
                  <span className="tooltip-def">{def.definitions[0]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="tooltip-no-definition">No definition available</div>
          )}
        </div>
      )}
    </span>
  );
}
