-- CreateEnum
CREATE TYPE "TenderFileCategory" AS ENUM ('RFP_MAIN_DOCUMENT', 'BOQ', 'TECHNICAL_SPECIFICATION', 'CONTRACT_CONDITIONS', 'DRAWINGS', 'APPENDICES', 'COMPLIANCE_DOCUMENTS', 'PRICING_DOCUMENTS', 'CLIENT_FORMS', 'OTHER');

-- CreateEnum
CREATE TYPE "GeneratedDocumentKind" AS ENUM ('TECHNICAL_PROPOSAL', 'COMMERCIAL_PROPOSAL', 'COMPLIANCE_MATRIX', 'MANPOWER_PLAN', 'PPM_SCHEDULE', 'SLA_MATRIX', 'KPI_MATRIX', 'RISK_REGISTER', 'HSE_PLAN', 'METHOD_STATEMENT', 'EXECUTIVE_SUMMARY', 'POWERPOINT_PRESENTATION', 'EXCEL_COST_SHEET', 'SUBMISSION_PACKAGE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'AI_GENERATED', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'FINAL', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorkspaceTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'BLOCKED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GOOGLE_DRIVE', 'MICROSOFT_365', 'GMAIL', 'OUTLOOK', 'SLACK', 'MICROSOFT_TEAMS', 'CALENDAR', 'SUPABASE', 'OPENAI');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('NOT_CONNECTED', 'CONNECTED', 'NEEDS_ATTENTION');

-- AlterTable
ALTER TABLE "TenderFile"
ADD COLUMN "displayName" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "category" "TenderFileCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN "isImportant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "GeneratedFile"
ADD COLUMN "kind" "GeneratedDocumentKind" NOT NULL DEFAULT 'SUBMISSION_PACKAGE',
ADD COLUMN "title" TEXT,
ADD COLUMN "content" JSONB,
ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "reviewerId" TEXT,
ADD COLUMN "lockedAt" TIMESTAMP(3),
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "generatedFileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "changeSummary" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentComment" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "tenderFileId" TEXT,
    "generatedFileId" TEXT,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "anchor" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceTask" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigneeId" TEXT,
    "createdById" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WorkspaceTaskStatus" NOT NULL DEFAULT 'TODO',
    "relatedFileId" TEXT,
    "generatedFileId" TEXT,
    "relatedAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tenderId" TEXT,
    "actorId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "externalAccount" TEXT,
    "settings" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenderFile_category_idx" ON "TenderFile"("category");

-- CreateIndex
CREATE INDEX "GeneratedFile_reviewStatus_idx" ON "GeneratedFile"("reviewStatus");

-- CreateIndex
CREATE INDEX "GeneratedFile_reviewerId_idx" ON "GeneratedFile"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_generatedFileId_version_key" ON "DocumentVersion"("generatedFileId", "version");

-- CreateIndex
CREATE INDEX "DocumentVersion_tenderId_idx" ON "DocumentVersion"("tenderId");

-- CreateIndex
CREATE INDEX "DocumentVersion_createdById_idx" ON "DocumentVersion"("createdById");

-- CreateIndex
CREATE INDEX "DocumentComment_tenderId_createdAt_idx" ON "DocumentComment"("tenderId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentComment_tenderFileId_idx" ON "DocumentComment"("tenderFileId");

-- CreateIndex
CREATE INDEX "DocumentComment_generatedFileId_idx" ON "DocumentComment"("generatedFileId");

-- CreateIndex
CREATE INDEX "DocumentComment_authorId_idx" ON "DocumentComment"("authorId");

-- CreateIndex
CREATE INDEX "WorkspaceTask_tenderId_status_idx" ON "WorkspaceTask"("tenderId", "status");

-- CreateIndex
CREATE INDEX "WorkspaceTask_assigneeId_idx" ON "WorkspaceTask"("assigneeId");

-- CreateIndex
CREATE INDEX "WorkspaceTask_createdById_idx" ON "WorkspaceTask"("createdById");

-- CreateIndex
CREATE INDEX "WorkspaceTask_relatedFileId_idx" ON "WorkspaceTask"("relatedFileId");

-- CreateIndex
CREATE INDEX "WorkspaceTask_generatedFileId_idx" ON "WorkspaceTask"("generatedFileId");

-- CreateIndex
CREATE INDEX "WorkspaceTask_dueDate_idx" ON "WorkspaceTask"("dueDate");

-- CreateIndex
CREATE INDEX "ActivityEvent_organizationId_createdAt_idx" ON "ActivityEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_tenderId_createdAt_idx" ON "ActivityEvent"("tenderId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_actorId_idx" ON "ActivityEvent"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_organizationId_provider_key" ON "IntegrationConnection"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "IntegrationConnection_organizationId_status_idx" ON "IntegrationConnection"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "GeneratedFile" ADD CONSTRAINT "GeneratedFile_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_generatedFileId_fkey" FOREIGN KEY ("generatedFileId") REFERENCES "GeneratedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_tenderFileId_fkey" FOREIGN KEY ("tenderFileId") REFERENCES "TenderFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_generatedFileId_fkey" FOREIGN KEY ("generatedFileId") REFERENCES "GeneratedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceTask" ADD CONSTRAINT "WorkspaceTask_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceTask" ADD CONSTRAINT "WorkspaceTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceTask" ADD CONSTRAINT "WorkspaceTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceTask" ADD CONSTRAINT "WorkspaceTask_relatedFileId_fkey" FOREIGN KEY ("relatedFileId") REFERENCES "TenderFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceTask" ADD CONSTRAINT "WorkspaceTask_generatedFileId_fkey" FOREIGN KEY ("generatedFileId") REFERENCES "GeneratedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationConnection" ENABLE ROW LEVEL SECURITY;
