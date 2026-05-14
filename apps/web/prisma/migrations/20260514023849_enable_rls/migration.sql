-- Enable Row Level Security on all user data tables.
-- Prisma connects via the postgres superuser and bypasses RLS,
-- so server-side queries are unaffected. RLS prevents direct
-- API access via the anon key.

ALTER TABLE "Transaction"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Block"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Installment"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavingsGoal"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only CRUD their own rows.
-- auth.uid() returns the Supabase auth UUID; userId stores it as text.

CREATE POLICY "own_transactions" ON "Transaction"
  FOR ALL TO authenticated
  USING  (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "own_blocks" ON "Block"
  FOR ALL TO authenticated
  USING  (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "own_installments" ON "Installment"
  FOR ALL TO authenticated
  USING  (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "own_savings_goals" ON "SavingsGoal"
  FOR ALL TO authenticated
  USING  (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");
