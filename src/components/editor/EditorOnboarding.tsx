/**
 * EditorOnboarding — conversational first-time questionnaire.
 *
 * Asks one question at a time in a chat-like format.
 * Responds to answers with brief commentary before moving on.
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
  // Function that generates a response to the user's answer before showing the next question
  respond?: (answer: string) => string;
}

const QUESTIONS: QueueItem[] = [
  {
    id: 'goals',
    question: "Welcome. I'll be reading your poems with you \u2014 not to tell you what to write, but to help you see what you're already doing. I draw on knowledge of poetic craft, but you are the best custodian of your own work. I sometimes get things wrong, especially around intent and cultural context, so treat my suggestions as a starting point for your own thinking. Before we start, I'd like to learn a bit about where you are. What are you working toward as a poet?",
    field: 'goals',
    type: 'text',
    respond: (answer) => {
      if (answer.length < 15) return "Good to know. That gives me a frame to work from.";
      return "That's a clear direction. I'll keep that in mind as we read together.";
    },
  },
  {
    id: 'influences',
    question: "Who are some poets you keep coming back to? Not who you think you should read \u2014 who actually pulls you in?",
    field: 'influences',
    type: 'text',
    respond: (answer) => {
      const lower = answer.toLowerCase();
      const parts: string[] = [];

      if (lower.includes('rilke')) parts.push("Rilke is extraordinary at turning inward attention into something universal \u2014 that patience with the unsayable.");
      if (lower.includes('gibran') || lower.includes('kahlil')) parts.push("Gibran has that rare ability to be direct about enormous things without flinching.");
      if (lower.includes('rumi')) parts.push("Rumi's ecstatic directness is hard to imitate but deeply worth studying.");
      if (lower.includes('dickinson') || lower.includes('emily')) parts.push("Dickinson's compression is masterful \u2014 she can do in a dash what others need a stanza for.");
      if (lower.includes('whitman') || lower.includes('walt')) parts.push("Whitman's generosity with language, that long breath \u2014 it asks a lot of the reader and rewards it.");
      if (lower.includes('plath') || lower.includes('sylvia')) parts.push("Plath's precision with violence and beauty in the same line is something most poets can only aspire to.");
      if (lower.includes('neruda')) parts.push("Neruda's gift is making passion feel inevitable rather than forced.");
      if (lower.includes('frost')) parts.push("Frost's deceptive simplicity \u2014 there's always something darker running underneath.");
      if (lower.includes('yeats')) parts.push("Yeats understood how to build a poem that sounds inevitable, like it couldn't have gone any other way.");
      if (lower.includes('bishop') || lower.includes('elizabeth')) parts.push("Bishop's eye for detail is unmatched \u2014 she sees the world at a scale most poets miss.");
      if (lower.includes('bukowski')) parts.push("Bukowski strips everything down to the nerve. That rawness is its own kind of craft.");
      if (lower.includes('cummings') || lower.includes('e.e.')) parts.push("Cummings proved that form itself can carry meaning \u2014 the way a poem sits on the page matters.");
      if (lower.includes('eliot') || lower.includes('t.s.')) parts.push("Eliot's ability to layer allusion without losing the emotional thread \u2014 that's rare.");
      if (lower.includes('keats')) parts.push("Keats had an almost physical relationship with language \u2014 you can feel the texture of his words.");
      if (lower.includes('shakespeare')) parts.push("Shakespeare's sonnets still teach us about compression and the turn.");
      if (lower.includes('angelou') || lower.includes('maya')) parts.push("Angelou's voice carries authority and warmth simultaneously \u2014 a hard balance.");
      if (lower.includes('hafiz') || lower.includes('hafez')) parts.push("Hafiz moves between the sacred and the playful so naturally \u2014 that tonal range is worth studying.");
      if (lower.includes('oliver') || lower.includes('mary')) parts.push("Oliver's attention to the natural world is a kind of devotion \u2014 she makes looking itself into an act.");
      if (lower.includes('cohen') || lower.includes('leonard')) parts.push("Cohen bridges the gap between song and poetry in a way that honors both traditions.");

      if (parts.length > 0) {
        return parts.slice(0, 2).join(' ') + " I'll have those voices in mind as we work.";
      }
      return "Good company. I'll keep those voices in mind as we read your work together.";
    },
  },
  {
    id: 'workingOn',
    question: "What are you working on right now? A specific poem, a collection, something you're stuck on?",
    field: 'workingOn',
    type: 'text',
    respond: (answer) => {
      if (answer.length < 15) return "Got it. We can dig into that whenever you're ready.";
      return "That's helpful context. I'll be looking at your current poem through that lens.";
    },
  },
  {
    id: 'experienceLevel',
    question: "How would you describe where you are as a poet?",
    field: 'experienceLevel',
    type: 'buttons',
    options: [
      { label: 'Just starting', value: 'brand_new' },
      { label: 'Beginner', value: 'beginner' },
      { label: 'Intermediate', value: 'intermediate' },
      { label: 'Experienced', value: 'experienced' },
      { label: 'Advanced', value: 'advanced' },
    ],
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
    question: "Anything else I should know about your writing \u2014 habits, constraints, what you're experimenting with?",
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
  const [isResponding, setIsResponding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [displayed]);

  useEffect(() => {
    if (QUESTIONS[step]?.type === 'text' && !isResponding) {
      inputRef.current?.focus();
    }
  }, [step, isResponding]);

  function handleAnswer(value: string) {
    const current = QUESTIONS[step];
    const newAnswers = { ...answers, [current.field]: value };
    setAnswers(newAnswers);

    // Show user's answer in chat
    const label = current.options?.find(o => o.value === value)?.label || value;
    const withUserMsg = [...displayed, { role: 'user' as const, text: label }];
    setDisplayed(withUserMsg);
    setInputValue('');

    const nextStep = step + 1;

    if (nextStep >= QUESTIONS.length) {
      const onboardingData: OnboardingData = {
        goals: newAnswers.goals,
        influences: newAnswers.influences,
        workingOn: newAnswers.workingOn,
        experienceLevel: newAnswers.experienceLevel as OnboardingData['experienceLevel'],
        additionalContext: newAnswers.additionalContext,
      };
      const feedbackStyle: FeedbackStyle = {
        directness: (newAnswers.directness as FeedbackStyle['directness']) || 'balanced',
        tone: (newAnswers.tone as FeedbackStyle['tone']) || 'encouraging',
      };

      setIsResponding(true);
      setTimeout(() => {
        setDisplayed(prev => [
          ...prev,
          { role: 'assistant', text: "Good. I can see your poem in the editor \u2014 whenever you're ready, just ask me about it." },
        ]);
        setTimeout(() => onComplete(onboardingData, feedbackStyle), 1500);
      }, 600);
      return;
    }

    // If the current question has a respond function, show the response before the next question
    if (current.respond) {
      const response = current.respond(value);
      setIsResponding(true);

      setTimeout(() => {
        setDisplayed(prev => [
          ...prev,
          { role: 'assistant', text: response },
        ]);

        setTimeout(() => {
          setDisplayed(prev => [
            ...prev,
            { role: 'assistant', text: QUESTIONS[nextStep].question },
          ]);
          setStep(nextStep);
          setIsResponding(false);
        }, 800);
      }, 500);
    } else {
      setIsResponding(true);
      setTimeout(() => {
        setDisplayed(prev => [
          ...prev,
          { role: 'assistant', text: QUESTIONS[nextStep].question },
        ]);
        setStep(nextStep);
        setIsResponding(false);
      }, 400);
    }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isResponding) return;
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
        {isResponding && !isComplete && (
          <div className="editor-msg editor-msg-assistant">
            <div className="editor-msg-content editor-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {!isComplete && !isResponding && (
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
