-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'UNSUPPORTED');

-- AlterTable
ALTER TABLE "TenderFile"
ADD COLUMN "extractionStatus" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "extractionError" TEXT,
ADD COLUMN "extractedText" TEXT,
ADD COLUMN "extractedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TenderDocumentChunk" (
    "id" TEXT NOT NULL,
    "tenderFileId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenEstimate" INTEGER NOT NULL,
    "pageRef" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenderDocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenderFile_extractionStatus_idx" ON "TenderFile"("extractionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "TenderDocumentChunk_tenderFileId_chunkIndex_key" ON "TenderDocumentChunk"("tenderFileId", "chunkIndex");

-- CreateIndex
CREATE INDEX "TenderDocumentChunk_tenderId_chunkIndex_idx" ON "TenderDocumentChunk"("tenderId", "chunkIndex");

-- CreateIndex
CREATE INDEX "TenderDocumentChunk_tenderFileId_idx" ON "TenderDocumentChunk"("tenderFileId");

-- AddForeignKey
ALTER TABLE "TenderDocumentChunk" ADD CONSTRAINT "TenderDocumentChunk_tenderFileId_fkey" FOREIGN KEY ("tenderFileId") REFERENCES "TenderFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderDocumentChunk" ADD CONSTRAINT "TenderDocumentChunk_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase security: the app reads chunks server-side through Prisma.
ALTER TABLE "TenderDocumentChunk" ENABLE ROW LEVEL SECURITY;
