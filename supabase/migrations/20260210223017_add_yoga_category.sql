-- Add 'yoga' to the allowed categories for the logs table
-- First, drop the existing constraint
ALTER TABLE logs DROP CONSTRAINT IF EXISTS logs_category_check;

-- Then, add the new constraint with 'yoga' included
ALTER TABLE logs ADD CONSTRAINT logs_category_check 
  CHECK (category IN ('strength', 'run', 'surf', 'maint', 'breath', 'yoga'));
