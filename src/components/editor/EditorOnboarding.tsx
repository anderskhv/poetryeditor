/**
 * EditorOnboarding — conversational first-time questionnaire.
 *
 * Asks one question at a time in a chat-like format.
 * Saves answers progressively to the poet profile.
 */

import { useState, useRef, useEffect } from 'react';
import type { OnboardingData, FeedbackStyle } from '../../types/editor';

interface OnboardingProps {
  onComplete: (data: OnboardingData, feedbackStyle: FeedbackStyle) => void;
}

interface QueueItem {
  id: string;
  question: string;
  field: keyof OnboardingData | 'directness' | 'tone';
  type: 'text' | 'buttons';
  options?: Array<{ label: string; value: string }>;
}

const QUESTIONS: QueueItem[] = [
  {
    id: 'goals',
    question: "Welcome! I'm your poetry editor. To give you the best feedback, I'd like to learn about you. What are your goals as a poet?",
    field: 'goals',
    type: 'text',
  },
  {
    id: 'influences',
    question: "Who are some poets whose work inspires you?",
    field: 'influences',
    type: 'text',
  },
  {
    id: 'workingOn',
    question: "What are you working on right now?",
    field: 'workingOn',
    type: 'text',
  },
  {
    id: 'directness',
    question: "How direct should I be with feedback?",
    field: 'directness',
    type: 'buttons',
    options: [
      { label: 'Gentle', value: 'gentle' },
      { label: 'Balanced', value: 'balanced' },
      { label: 'Direct', value: 'direct' },
    ],
  },
  {
    id: 'tone',
    question: "And what tone works best for you?",
    field: 'tone',
    type: 'buttons',
    options: [
      { label: 'Encouraging', value: 'encouraging' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Challenging', value: 'challenging' },
    ],
  },
  {
    id: 'additional',
    question: "Anything else I should know about your writing?",
    field: 'additionalContext',
    type: 'text',
  },
];

export function EditorOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [displayed, setDisplayed] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    { role: 'assistant', text: QUESTIONS[0].question },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [displayed]);

  useEffect(() => {
    if (QUESTIONS[step]?.type === 'text') {
      inputRef.current?.focus();
    }
  }, [step]);

  function handleAnswer(value: string) {
    const current = QUESTIONS[step];
    const newAnswers = { ...answers, [current.field]: value };
    setAnswers(newAnswers);

    // Show user's answer in chat
    const label = current.options?.find(o => o.value === value)?.label || value;
    const newDisplayed = [...displayed, { role: 'user' as const, text: label }];

    const nextStep = step + 1;

    if (nextStep >= QUESTIONS.length) {
      // Done — compile and complete
      const onboardingData: OnboardingData = {
        goals: newAnswers.goals,
        influences: newAnswers.influences,
        workingOn: newAnswers.workingOn,
        additionalContext: newAnswers.additionalContext,
      };
      const feedbackStyle: FeedbackStyle = {
        directness: (newAnswers.directness as FeedbackStyle['directness']) || 'balanced',
        tone: (newAnswers.tone as FeedbackStyle['tone']) || 'encouraging',
      };

      // Show completion message
      setDisplayed([
        ...newDisplayed,
        { role: 'assistant', text: "Great, I'm ready to work with you. I can see your poem — shall we talk about it?" },
      ]);

      // Small delay so they can read the final message
      setTimeout(() => onComplete(onboardingData, feedbackStyle), 1500);
      return;
    }

    // Show next question
    setDisplayed([
      ...newDisplayed,
      { role: 'assistant', text: QUESTIONS[nextStep].question },
    ]);
    setStep(nextStep);
    setInputValue('');
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    handleAnswer(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const current = QUESTIONS[step];
  const isComplete = step >= QUESTIONS.length;

  return (
    <div className="editor-onboarding">
      <div className="editor-messages" ref={scrollRef}>
        {displayed.map((msg, i) => (
          <div key={i} className={`editor-msg editor-msg-${msg.role}`}>
            <div className="editor-msg-content">{msg.text}</div>
          </div>
        ))}
      </div>

      {!isComplete && (
        <div className="editor-input-area">
          {current.type === 'buttons' && current.options ? (
            <div className="editor-button-group">
              {current.options.map(opt => (
                <button
                  key={opt.value}
                  className="editor-option-btn"
                  onClick={() => handleAnswer(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="editor-input-form">
              <textarea
                ref={inputRef}
                className="editor-input"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                rows={2}
              />
              <button
                type="submit"
                className="editor-send-btn"
                disabled={!inputValue.trim()}
                title="Send (Enter)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
