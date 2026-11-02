-- CreateTable
CREATE TABLE "DetectionHistory" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "inputValue" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "DetectionHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DetectionHistory" ADD CONSTRAINT "DetectionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
