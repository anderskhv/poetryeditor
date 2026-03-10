/**
 * PreFlightForm — Editorial report questionnaire modal.
 *
 * Collects collection ambition, section purposes, readiness assessment,
 * report style preference, and tone setting before generating the report.
 */

import { useState, useEffect } from 'react';
import type { PreFlightAnswers } from '../../types/editor';
import type { CollectionSection } from '../../types/collection';
import './PreFlightForm.css';

export interface PreFlightFormProps {
  sections: CollectionSection[];
  collectionName: string;
  savedAnswers: PreFlightAnswers | null;
  isGenerating: boolean;
  onSubmit: (answers: PreFlightAnswers) => void;
  onCancel: () => void;
}

export function PreFlightForm({
  sections,
  collectionName,
  savedAnswers,
  isGenerating,
  onSubmit,
  onCancel,
}: PreFlightFormProps) {
  // Get top-level sections only (parentId === null)
  const topLevelSections = sections.filter(s => s.parentId === null).sort((a, b) => a.order - b.order);

  // Form state
  const [collectionAmbition, setCollectionAmbition] = useState(
    savedAnswers?.collectionAmbition || ''
  );
  const [sectionPurposes, setSectionPurposes] = useState<Record<string, string>>(
    savedAnswers?.sectionPurposes || {}
  );
  const [readinessSelfAssessment, setReadinessSelfAssessment] = useState(
    savedAnswers?.readinessSelfAssessment || ''
  );
  const [additionalContext, setAdditionalContext] = useState(
    savedAnswers?.additionalContext || ''
  );
  const [reportStyle, setReportStyle] = useState<'qualitative' | 'quantitative'>(
    savedAnswers?.reportStyle || 'qualitative'
  );
  const [harshness, setHarshness] = useState(savedAnswers?.harshness ?? 50);

  // Handle section purpose change
  const handleSectionPurposeChange = (sectionName: string, value: string) => {
    setSectionPurposes(prev => ({
      ...prev,
      [sectionName]: value,
    }));
  };

  // Submit validation
  const isValid = collectionAmbition.trim() !== '' && readinessSelfAssessment.trim() !== '';
  const isDisabled = !isValid || isGenerating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const answers: PreFlightAnswers = {
      collectionAmbition: collectionAmbition.trim(),
      sectionPurposes,
      readinessSelfAssessment: readinessSelfAssessment.trim(),
      additionalContext: additionalContext.trim() || undefined,
      reportStyle,
      harshness,
    };

    onSubmit(answers);
  };

  return (
    <div className="preflight-overlay">
      <div className="preflight-modal">
        <h2 className="preflight-title">Editorial Report Pre-Flight</h2>
        <p className="preflight-subtitle">
          Help your editors understand your collection before they dive in.
        </p>

        <form onSubmit={handleSubmit} className="preflight-form">
          {/* Collection Ambition */}
          <div className="preflight-field">
            <label className="preflight-label">COLLECTION AMBITION *</label>
            <p className="preflight-hint">
              What is this collection trying to do? What should a reader feel or understand? There's no wrong answer.
            </p>
            <textarea
              className="preflight-textarea"
              rows={4}
              value={collectionAmbition}
              onChange={e => setCollectionAmbition(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe the overall vision, intention, and emotional arc of your collection..."
            />
          </div>

          {/* Section Purposes */}
          <div className="preflight-field">
            <label className="preflight-label">SECTION PURPOSES</label>
            <p className="preflight-hint">
              What is each section doing? Leave blank for sections you're still figuring out.
            </p>
            {topLevelSections.length > 0 ? (
              <div className="preflight-sections">
                {topLevelSections.map(section => (
                  <div key={section.id} className="preflight-section-group">
                    <label className="preflight-section-name">{section.name}</label>
                    <textarea
                      className="preflight-textarea"
                      rows={2}
                      value={sectionPurposes[section.name] || ''}
                      onChange={e => handleSectionPurposeChange(section.name, e.target.value)}
                      disabled={isGenerating}
                      placeholder={`What is "${section.name}" doing in the collection?`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="preflight-no-sections">No sections yet. Add sections to provide context here.</p>
            )}
          </div>

          {/* Where This Stands */}
          <div className="preflight-field">
            <label className="preflight-label">WHERE THIS STANDS *</label>
            <p className="preflight-hint">
              Be honest. Are some poems farther along? Is the structure settled or in flux? Your editors will calibrate.
            </p>
            <textarea
              className="preflight-textarea"
              rows={3}
              value={readinessSelfAssessment}
              onChange={e => setReadinessSelfAssessment(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe the current state and development stage of your collection..."
            />
          </div>

          {/* Anything Else */}
          <div className="preflight-field">
            <label className="preflight-label">ANYTHING ELSE</label>
            <p className="preflight-hint">
              Specific questions, concerns, context about your process — anything that would help.
            </p>
            <textarea
              className="preflight-textarea"
              rows={2}
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
              disabled={isGenerating}
              placeholder="Optional: Additional context or questions for your editors..."
            />
          </div>

          {/* Report Style */}
          <div className="preflight-field">
            <label className="preflight-label">REPORT STYLE</label>
            <p className="preflight-hint">How do you want your editors to talk about the work?</p>
            <div className="preflight-radio-group">
              <label className={`preflight-radio-card ${reportStyle === 'qualitative' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="reportStyle"
                  value="qualitative"
                  checked={reportStyle === 'qualitative'}
                  onChange={e => setReportStyle(e.target.value as 'qualitative')}
                  disabled={isGenerating}
                />
                <span className="preflight-radio-dot" />
                <span className="preflight-radio-content">
                  <span className="preflight-radio-title">Qualitative</span>
                  <span className="preflight-radio-desc">Prose feedback only. Your editors describe what they see in words, no scores.</span>
                </span>
              </label>

              <label className={`preflight-radio-card ${reportStyle === 'quantitative' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="reportStyle"
                  value="quantitative"
                  checked={reportStyle === 'quantitative'}
                  onChange={e => setReportStyle(e.target.value as 'quantitative')}
                  disabled={isGenerating}
                />
                <span className="preflight-radio-dot" />
                <span className="preflight-radio-content">
                  <span className="preflight-radio-title">Quantitative + rankings</span>
                  <span className="preflight-radio-desc">Includes numerical scores, strongest/weakest rankings, and readiness levels alongside the prose.</span>
                </span>
              </label>
            </div>
          </div>

          {/* Tone Slider */}
          <div className="preflight-field">
            <label className="preflight-label">TONE</label>
            <p className="preflight-hint">How direct should your editors be?</p>
            <div className="preflight-slider-container">
              <input
                type="range"
                className="preflight-slider"
                min="0"
                max="100"
                value={harshness}
                onChange={e => setHarshness(parseInt(e.target.value, 10))}
                disabled={isGenerating}
              />
              <div className="preflight-slider-labels">
                <span>Supportive</span>
                <span className="preflight-slider-value">{harshness}</span>
                <span>Harsh</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="preflight-footer">
            <button
              type="button"
              className="preflight-btn preflight-btn-cancel"
              onClick={onCancel}
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="preflight-btn preflight-btn-primary"
              disabled={isDisabled}
            >
              {isGenerating ? 'Generating Report...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
