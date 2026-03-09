/**
 * EditorSettings — perspective selector and harshness slider.
 *
 * Compact panel that sits above the chat input.
 * Perspective: choose an editorial lens (or none for balanced feedback).
 * Harshness: 3-position slider (Encouraging / Balanced / Direct).
 */

import { useState, useCallback } from 'react';
import type { EditorialPerspective, HarshnessLevel, EditorSettings as EditorSettingsType } from '../../types/editor';
import './EditorSettings.css';

interface EditorSettingsProps {
  settings: EditorSettingsType;
  onUpdate: (updates: Partial<EditorSettingsType>) => void;
}

const PERSPECTIVES: Array<{
  value: EditorialPerspective;
  label: string;
  shortDesc: string;
}> = [
  { value: 'none', label: 'Balanced', shortDesc: 'General editorial feedback' },
  { value: 'formalist', label: 'Formalist', shortDesc: 'Structure, meter, form' },
  { value: 'imagist', label: 'Imagist', shortDesc: 'Precision of image' },
  { value: 'lyricist', label: 'Lyricist', shortDesc: 'Musicality and sound' },
  { value: 'narrativist', label: 'Narrativist', shortDesc: 'Story and voice' },
  { value: 'experimentalist', label: 'Experimentalist', shortDesc: 'Boundary-pushing' },
  { value: 'intimate', label: 'Intimate', shortDesc: 'Emotional truth' },
];

const HARSHNESS_LEVELS: Array<{
  value: HarshnessLevel;
  label: string;
  desc: string;
}> = [
  { value: 'encouraging', label: 'Encouraging', desc: 'Leads with strengths, questions gently' },
  { value: 'balanced', label: 'Balanced', desc: 'Honest feedback with warmth' },
  { value: 'direct', label: 'Direct', desc: 'Assumes experienced poet' },
];

export function EditorSettings({ settings, onUpdate }: EditorSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

  const activePerspective = PERSPECTIVES.find(p => p.value === settings.perspective);
  const activeHarshness = HARSHNESS_LEVELS.find(h => h.value === settings.harshness);

  return (
    <div className="editor-settings">
      <button
        className="editor-settings-toggle"
        onClick={toggleOpen}
        type="button"
        title="Editor settings"
      >
        <span className="editor-settings-label">
          {activePerspective?.value !== 'none' ? activePerspective?.label : 'Balanced'}
          {' / '}
          {activeHarshness?.label || 'Encouraging'}
        </span>
        <svg
          className={`editor-settings-chevron ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="editor-settings-panel">
          <div className="editor-settings-section">
            <div className="editor-settings-section-label">Editorial Lens</div>
            <div className="editor-settings-perspectives">
              {PERSPECTIVES.map(p => (
                <button
                  key={p.value}
                  className={`editor-settings-perspective ${settings.perspective === p.value ? 'active' : ''}`}
                  onClick={() => onUpdate({ perspective: p.value })}
                  type="button"
                  title={p.shortDesc}
                >
                  <span className="perspective-label">{p.label}</span>
                  <span className="perspective-desc">{p.shortDesc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="editor-settings-section">
            <div className="editor-settings-section-label">Feedback Style</div>
            <div className="editor-settings-harshness">
              {HARSHNESS_LEVELS.map(h => (
                <button
                  key={h.value}
                  className={`editor-settings-harshness-btn ${settings.harshness === h.value ? 'active' : ''}`}
                  onClick={() => onUpdate({ harshness: h.value })}
                  type="button"
                >
                  <span className="harshness-label">{h.label}</span>
                  <span className="harshness-desc">{h.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
