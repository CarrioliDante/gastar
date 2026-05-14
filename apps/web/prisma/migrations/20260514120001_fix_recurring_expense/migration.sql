-- Add dayOfMonth column if it was missing from the table created outside of Prisma
ALTER TABLE "RecurringExpense" ADD COLUMN IF NOT EXISTS "dayOfMonth" INTEGER;

-- Add index if it was missing
CREATE INDEX IF NOT EXISTS "RecurringExpense_userId_nextDueDate_idx"
  ON "RecurringExpense"("userId", "nextDueDate");

-- Enable Row Level Security (idempotent)
ALTER TABLE "RecurringExpense" ENABLE ROW LEVEL SECURITY;

-- RLS policy for authenticated users (drop-and-recreate to be safe)
DROP POLICY IF EXISTS "own_recurring_expenses" ON "RecurringExpense";
CREATE POLICY "own_recurring_expenses" ON "RecurringExpense"
  FOR ALL TO authenticated
  USING  (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");
