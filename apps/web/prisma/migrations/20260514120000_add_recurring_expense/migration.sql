-- CreateTable
CREATE TABLE "RecurringExpense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "blockId" TEXT,
    "note" TEXT,
    "pausedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringExpense_userId_nextDueDate_idx" ON "RecurringExpense"("userId", "nextDueDate");

-- Enable Row Level Security
ALTER TABLE "RecurringExpense" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_recurring_expenses" ON "RecurringExpense"
  FOR ALL TO authenticated
  USING  (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");
