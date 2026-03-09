-- Editor Memory System: learnings, sessions, patterns
-- Supports the multi-agent architecture's memory layer

-- Active learnings extracted from conversations
CREATE TABLE IF NOT EXISTS editor_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'conversation', -- 'conversation' | 'onboarding' | 'manual'
  poem_id TEXT, -- optional: which poem this was learned from
  conversation_id UUID, -- optional: which conversation
  active BOOLEAN NOT NULL DEFAULT true, -- false = compacted into summary
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editor_learnings_user ON editor_learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_editor_learnings_active ON editor_learnings(user_id, active);

-- Session summaries for cross-session awareness
CREATE TABLE IF NOT EXISTS editor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID, -- links to editor_conversations
  poem_id TEXT,
  poem_title TEXT,
  mode TEXT NOT NULL DEFAULT 'per_poem', -- 'per_poem' | 'collection'
  summary TEXT NOT NULL,
  feedback_given TEXT[] DEFAULT '{}', -- key topics covered
  poet_engagement TEXT[] DEFAULT '{}', -- what poet responded to
  draft_stage TEXT, -- 'first_draft' | 'early_revision' etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editor_sessions_user ON editor_sessions(user_id);

-- Cross-poem patterns (recurring strengths, habits, themes)
CREATE TABLE IF NOT EXISTS editor_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'strength' | 'habit' | 'theme' | 'growth_area'
  description TEXT NOT NULL,
  examples TEXT[] DEFAULT '{}', -- poem titles / specific lines
  confidence REAL NOT NULL DEFAULT 0.5, -- 0-1, increases with repeated observation
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editor_patterns_user ON editor_patterns(user_id);

-- Editor settings (perspective, harshness)
CREATE TABLE IF NOT EXISTS editor_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  perspective TEXT NOT NULL DEFAULT 'none',
  harshness TEXT NOT NULL DEFAULT 'encouraging',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE editor_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own learnings" ON editor_learnings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON editor_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own patterns" ON editor_patterns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" ON editor_settings
  FOR ALL USING (auth.uid() = user_id);
