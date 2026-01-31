import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDailyRhyme, RhymePair } from '../data/dailyRhymes';
import './Widget.css';

export function Widget() {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme') || 'light';
  const [rhyme, setRhyme] = useState<RhymePair | null>(null);

  useEffect(() => {
    setRhyme(getDailyRhyme());
  }, []);

  if (!rhyme) {
    return (
      <div className={`widget-container widget-${theme}`}>
        <div className="widget-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`widget-container widget-${theme}`}>
      <div className="widget-header">
        <span className="widget-label">Rhyme of the Day</span>
      </div>
      <div className="widget-content">
        <div className="widget-rhyme-pair">
          <Link
            to={`https://poetryeditor.com/rhymes/${encodeURIComponent(rhyme.word1)}`}
            className="widget-word"
            target="_blank"
            rel="noopener"
          >
            {rhyme.word1}
          </Link>
          <span className="widget-ampersand">&amp;</span>
          <Link
            to={`https://poetryeditor.com/rhymes/${encodeURIComponent(rhyme.word2)}`}
            className="widget-word"
            target="_blank"
            rel="noopener"
          >
            {rhyme.word2}
          </Link>
        </div>
        {rhyme.category && (
          <span className="widget-category">{rhyme.category}</span>
        )}
      </div>
      <div className="widget-footer">
        <a
          href="https://poetryeditor.com?ref=widget"
          target="_blank"
          rel="noopener"
          className="widget-link"
        >
          Powered by Poetry Editor
        </a>
      </div>
    </div>
  );
}
