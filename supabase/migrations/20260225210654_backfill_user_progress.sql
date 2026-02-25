-- Backfill user_progress for existing users

-- First, create rows for any existing users who don't have user_progress
INSERT INTO user_progress (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_progress);

-- Function to calculate streak from logs
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS TABLE (
  streak INTEGER,
  last_week DATE,
  total_completed INTEGER
) AS $$
DECLARE
  v_current_week DATE;
  v_week DATE;
  v_streak INTEGER := 0;
  v_last_completed_week DATE := NULL;
  v_total INTEGER := 0;
  v_strength_count INTEGER;
  v_run_count INTEGER;
  v_checking BOOLEAN := TRUE;
BEGIN
  -- Get current week's Monday
  v_current_week := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Check weeks going backwards
  v_week := v_current_week;
  
  WHILE v_checking AND v_week >= '2020-01-01' LOOP
    -- Count strength and run logs for this week
    SELECT 
      COUNT(*) FILTER (WHERE category = 'strength'),
      COUNT(*) FILTER (WHERE category = 'run')
    INTO v_strength_count, v_run_count
    FROM logs
    WHERE user_id = p_user_id
      AND date >= v_week
      AND date < v_week + INTERVAL '7 days';
    
    -- Check if protocol met (4 strength + 2 run)
    IF v_strength_count >= 4 AND v_run_count >= 2 THEN
      v_total := v_total + 1;
      
      -- Only count towards streak if consecutive
      IF v_last_completed_week IS NULL THEN
        -- First completed week found
        v_last_completed_week := v_week;
        v_streak := 1;
      ELSIF v_last_completed_week - v_week = 7 THEN
        -- Consecutive week
        v_streak := v_streak + 1;
        v_last_completed_week := v_week;
      ELSE
        -- Gap found, stop counting streak (but continue for total)
        v_checking := FALSE;
      END IF;
    ELSIF v_last_completed_week IS NOT NULL THEN
      -- Incomplete week after finding completed weeks - streak broken
      v_checking := FALSE;
    END IF;
    
    v_week := v_week - INTERVAL '7 days';
  END LOOP;
  
  RETURN QUERY SELECT v_streak, v_last_completed_week, v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill all existing users
DO $$
DECLARE
  v_user RECORD;
  v_result RECORD;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  FOR v_user IN SELECT user_id FROM user_progress LOOP
    SELECT * INTO v_result FROM calculate_user_streak(v_user.user_id);
    
    UPDATE user_progress
    SET 
      streak_count = COALESCE(v_result.streak, 0),
      streak_week = v_result.last_week,
      total_mastery = COALESCE(v_result.total_completed, 0),
      gbc_unlocked_at = CASE WHEN COALESCE(v_result.streak, 0) >= 1 THEN v_now ELSE NULL END,
      gold_unlocked_at = CASE WHEN COALESCE(v_result.streak, 0) >= 2 THEN v_now ELSE NULL END,
      lightning_unlocked_at = CASE WHEN COALESCE(v_result.streak, 0) >= 5 THEN v_now ELSE NULL END,
      updated_at = v_now
    WHERE user_id = v_user.user_id;
    
    -- Create milestone records for unlocks
    IF COALESCE(v_result.streak, 0) >= 1 AND v_result.last_week IS NOT NULL THEN
      INSERT INTO milestones (user_id, achievement, week_id)
      VALUES (v_user.user_id, 'GBC_UNLOCK', v_result.last_week)
      ON CONFLICT (user_id, achievement, week_id) DO NOTHING;
    END IF;
    
    IF COALESCE(v_result.streak, 0) >= 2 AND v_result.last_week IS NOT NULL THEN
      INSERT INTO milestones (user_id, achievement, week_id)
      VALUES (v_user.user_id, 'GOLD_UNLOCK', v_result.last_week)
      ON CONFLICT (user_id, achievement, week_id) DO NOTHING;
    END IF;
    
    IF COALESCE(v_result.streak, 0) >= 5 AND v_result.last_week IS NOT NULL THEN
      INSERT INTO milestones (user_id, achievement, week_id)
      VALUES (v_user.user_id, 'LIGHTNING_UNLOCK', v_result.last_week)
      ON CONFLICT (user_id, achievement, week_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;
