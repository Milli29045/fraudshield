-- CreateTable
CREATE TABLE "FraudReport" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "reportedValue" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "FraudReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FraudReport" ADD CONSTRAINT "FraudReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
