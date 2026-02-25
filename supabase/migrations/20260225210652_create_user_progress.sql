-- User progress table for streak tracking and theme unlocks
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count INTEGER NOT NULL DEFAULT 0,
  streak_week DATE,                      -- Monday of last completed week
  gbc_unlocked_at TIMESTAMPTZ,           -- streak >= 1 (color mode)
  gold_unlocked_at TIMESTAMPTZ,          -- streak >= 2 (gold mode)
  lightning_unlocked_at TIMESTAMPTZ,     -- streak >= 5 (storm mode)
  total_mastery INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);


-- Milestones table for achievement history
CREATE TABLE milestones (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement TEXT NOT NULL,             -- 'GBC_UNLOCK', 'GOLD_UNLOCK', 'LIGHTNING_UNLOCK', 'GOLD_STATUS'
  week_id DATE NOT NULL,                 -- Monday of the week this was achieved
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement, week_id)
);

-- Enable RLS on milestones
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX milestones_user_idx ON milestones(user_id);
CREATE INDEX milestones_achievement_idx ON milestones(user_id, achievement);
