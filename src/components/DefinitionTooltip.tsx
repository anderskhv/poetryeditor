import { useState, useRef, useEffect, ReactNode } from 'react';
import { fetchWordInfo, WordDefinition } from '../utils/wordInfoApi';
import './DefinitionTooltip.css';

interface DefinitionTooltipProps {
  word: string;
  children: ReactNode;
}

// Cache to avoid refetching the same word
const definitionCache = new Map<string, WordDefinition[] | null>();

export function DefinitionTooltip({ word, children }: DefinitionTooltipProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [definitions, setDefinitions] = useState<WordDefinition[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<'above' | 'below'>('above');
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    // Delay showing tooltip to avoid accidental triggers
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);

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
    }, 300); // 300ms delay before showing
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(false);
  };

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
    >
      {children}
      {isHovering && (
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
