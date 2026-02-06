import { useState, useEffect, useRef } from 'react';
import { fetchSynonymSenses, SynonymWord } from '../utils/rhymeApi';
import './SynonymMiniPopup.css';

interface SynonymMiniPopupProps {
  word: string;
  position: { top: number; left: number };
  onClose: () => void;
}

export function SynonymMiniPopup({ word, position, onClose }: SynonymMiniPopupProps) {
  const [synonyms, setSynonyms] = useState<SynonymWord[]>([]);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchSynonymSenses(word).then((result) => {
      const firstSense = result[0];
      setSynonyms((firstSense?.synonyms || []).slice(0, 5));
      setLoading(false);
    });
  }, [word]);

  // Adjust position if popup would go off-screen
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth - 20) {
        popupRef.current.style.left = `${position.left - rect.width}px`;
      }
      if (rect.bottom > viewportHeight - 20) {
        popupRef.current.style.top = `${position.top - rect.height - 10}px`;
      }
    }
  }, [position, loading]);

  const handleSeeMore = () => {
    window.open(`/synonyms/${encodeURIComponent(word)}`, '_blank');
    onClose();
  };

  return (
    <>
      <div className="synonym-mini-overlay" onClick={onClose} />
      <div
        ref={popupRef}
        className="synonym-mini-popup"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="synonym-mini-header">
          <span className="synonym-mini-word">{word}</span>
          <button className="synonym-mini-close" onClick={onClose}>×</button>
        </div>
        <div className="synonym-mini-content">
          {loading ? (
            <div className="synonym-mini-loading">Loading...</div>
          ) : synonyms.length > 0 ? (
            <>
              <div className="synonym-mini-label">Concrete alternatives:</div>
              <div className="synonym-mini-list">
                {synonyms.map((syn, idx) => (
                  <span key={idx} className="synonym-mini-item">
                    {syn.word}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="synonym-mini-empty">No suggestions found</div>
          )}
        </div>
        <button className="synonym-mini-see-more" onClick={handleSeeMore}>
          See more in Thesaurus
          <span className="see-more-arrow">→</span>
        </button>
      </div>
    </>
  );
}
