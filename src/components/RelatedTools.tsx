import { Link } from 'react-router-dom';
import './RelatedTools.css';

interface RelatedToolsProps {
  abstractWords?: string[];
  rhymingPairs?: Array<{ word1: string; word2: string }>;
}

export function RelatedTools({ abstractWords, rhymingPairs }: RelatedToolsProps) {
  // Don't render if no data
  if ((!abstractWords || abstractWords.length === 0) && (!rhymingPairs || rhymingPairs.length === 0)) {
    return null;
  }

  return (
    <div className="related-tools">
      <h3>Explore More</h3>

      {abstractWords && abstractWords.length > 0 && (
        <div className="related-tools-section">
          <h4>Find Synonyms</h4>
          <p className="related-tools-hint">Discover alternative words for abstract concepts in this poem</p>
          <div className="related-tools-links">
            {abstractWords.map((word) => (
              <Link
                key={word}
                to={`/synonyms/${encodeURIComponent(word.toLowerCase())}`}
                className="related-tool-link synonym-link"
              >
                {word}
              </Link>
            ))}
          </div>
        </div>
      )}

      {rhymingPairs && rhymingPairs.length > 0 && (
        <div className="related-tools-section">
          <h4>Rhyming Words</h4>
          <p className="related-tools-hint">Explore rhymes used in this poem</p>
          <div className="related-tools-links">
            {rhymingPairs.map((pair, idx) => (
              <span key={idx} className="rhyme-pair">
                <Link
                  to={`/rhymes/${encodeURIComponent(pair.word1.toLowerCase())}`}
                  className="related-tool-link rhyme-link"
                >
                  {pair.word1}
                </Link>
                <span className="rhyme-connector">/</span>
                <Link
                  to={`/rhymes/${encodeURIComponent(pair.word2.toLowerCase())}`}
                  className="related-tool-link rhyme-link"
                >
                  {pair.word2}
                </Link>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="related-tools-section related-tools-cta">
        <h4>Write Your Own</h4>
        <div className="cta-buttons">
          <Link to="/" className="cta-button primary">
            Open Poetry Editor
          </Link>
          <Link to="/rhymes" className="cta-button secondary">
            Rhyme Dictionary
          </Link>
          <Link to="/syllables" className="cta-button secondary">
            Syllable Counter
          </Link>
        </div>
      </div>
    </div>
  );
}
