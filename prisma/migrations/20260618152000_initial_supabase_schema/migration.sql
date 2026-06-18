-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('FACILITY_MANAGEMENT', 'CLEANING', 'LANDSCAPING', 'MEP_CONTRACTOR', 'HVAC_CONTRACTOR', 'SECURITY', 'PEST_CONTROL', 'GOVERNMENT_ENTITY', 'PROPERTY_MANAGEMENT');

-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('DRAFT', 'UPLOADED', 'PROCESSING', 'ANALYZED', 'QUALIFIED', 'NO_GO', 'IN_ESTIMATION', 'IN_PROPOSAL', 'SUBMITTED', 'WON', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FilePurpose" AS ENUM ('TENDER_DOCUMENT', 'COMPANY_DOCUMENT', 'GENERATED_EXPORT', 'CERTIFICATE', 'DRAWING', 'BOQ', 'ASSET_REGISTER', 'ADDENDUM');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('AVAILABLE', 'MISSING', 'PARTIAL', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('COMMERCIAL', 'TECHNICAL', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'RESOURCE');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('GO', 'GO_WITH_CONDITIONS', 'NO_GO', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "GeneratedFileType" AS ENUM ('PDF', 'DOCX', 'XLSX', 'PPTX', 'ZIP');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT,
    "tenderNumber" TEXT,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "country" TEXT,
    "location" TEXT,
    "category" TEXT,
    "submissionDeadline" TIMESTAMP(3),
    "contractDuration" TEXT,
    "estimatedValue" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "status" "TenderStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderFile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tenderId" TEXT,
    "purpose" "FilePurpose" NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "checksum" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenderFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderAnalysis" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "executiveSummary" TEXT,
    "technicalSummary" TEXT,
    "commercialSummary" TEXT,
    "scopeBreakdown" JSONB,
    "qualificationScore" INTEGER,
    "recommendation" "Recommendation" NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "winProbability" INTEGER,
    "sourceMap" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceItem" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'MISSING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "owner" TEXT,
    "action" TEXT,
    "source" TEXT,
    "pageRef" TEXT,
    "confidence" INTEGER,

    CONSTRAINT "ComplianceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskItem" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "category" "RiskCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "score" INTEGER NOT NULL,
    "mitigation" TEXT,
    "source" TEXT,
    "pageRef" TEXT,

    CONSTRAINT "RiskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "lifecycleNotes" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManpowerPlan" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManpowerPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManpowerLine" (
    "id" TEXT NOT NULL,
    "manpowerPlanId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "monthlySalary" DECIMAL(12,2) NOT NULL,
    "accommodationCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transportCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "visaCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "insuranceCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "uniformCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "overtimeAllowance" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "ManpowerLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEstimate" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "overheadPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "profitPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vatPercent" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "finalBidPrice" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateLine" (
    "id" TEXT NOT NULL,
    "costEstimateId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "EstimateLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sections" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedFile" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "proposalId" TEXT,
    "type" "GeneratedFileType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcontractor" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "Subcontractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "confidence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "tenderId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "renewsAt" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Tender_organizationId_status_idx" ON "Tender"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Tender_submissionDeadline_idx" ON "Tender"("submissionDeadline");

-- CreateIndex
CREATE INDEX "TenderFile_organizationId_purpose_idx" ON "TenderFile"("organizationId", "purpose");

-- CreateIndex
CREATE INDEX "TenderFile_tenderId_idx" ON "TenderFile"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderAnalysis_tenderId_key" ON "TenderAnalysis"("tenderId");

-- CreateIndex
CREATE INDEX "ComplianceItem_tenderId_status_idx" ON "ComplianceItem"("tenderId", "status");

-- CreateIndex
CREATE INDEX "RiskItem_tenderId_category_idx" ON "RiskItem"("tenderId", "category");

-- CreateIndex
CREATE INDEX "Asset_tenderId_assetType_idx" ON "Asset"("tenderId", "assetType");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderFile" ADD CONSTRAINT "TenderFile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderFile" ADD CONSTRAINT "TenderFile_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAnalysis" ADD CONSTRAINT "TenderAnalysis_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceItem" ADD CONSTRAINT "ComplianceItem_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskItem" ADD CONSTRAINT "RiskItem_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManpowerPlan" ADD CONSTRAINT "ManpowerPlan_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManpowerLine" ADD CONSTRAINT "ManpowerLine_manpowerPlanId_fkey" FOREIGN KEY ("manpowerPlanId") REFERENCES "ManpowerPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostEstimate" ADD CONSTRAINT "CostEstimate_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateLine" ADD CONSTRAINT "EstimateLine_costEstimateId_fkey" FOREIGN KEY ("costEstimateId") REFERENCES "CostEstimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedFile" ADD CONSTRAINT "GeneratedFile_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedFile" ADD CONSTRAINT "GeneratedFile_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcontractor" ADD CONSTRAINT "Subcontractor_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase security: keep all application tables protected by default.
-- The server app uses Prisma over a direct Postgres connection. Public Data API
-- policies will be added later only for specific authenticated workflows.
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RolePermission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tender" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenderFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenderAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplianceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RiskItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Asset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManpowerPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManpowerLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CostEstimate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EstimateLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GeneratedFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subcontractor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- System roles and permissions are not demo data. They are required for RBAC.
INSERT INTO "Role" ("id", "name", "description") VALUES
  ('role_super_admin', 'Super Admin', 'Platform-wide administration'),
  ('role_org_admin', 'Organization Admin', 'Organization administration'),
  ('role_bd_manager', 'Business Development Manager', 'Tender pipeline ownership'),
  ('role_estimation_engineer', 'Estimation Engineer', 'Cost and manpower estimation'),
  ('role_proposal_manager', 'Proposal Manager', 'Proposal and submission package ownership'),
  ('role_executive', 'Executive', 'Executive review and approval'),
  ('role_viewer', 'Viewer', 'Read-only access')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('perm_org_manage', 'organization.manage', 'Manage organization settings'),
  ('perm_users_manage', 'users.manage', 'Invite and manage users'),
  ('perm_tenders_manage', 'tenders.manage', 'Create and manage tenders'),
  ('perm_tenders_read', 'tenders.read', 'Read tender records'),
  ('perm_ai_run', 'ai.run', 'Run AI analysis workflows'),
  ('perm_estimates_manage', 'estimates.manage', 'Manage cost estimates'),
  ('perm_proposals_manage', 'proposals.manage', 'Manage proposals'),
  ('perm_exports_generate', 'exports.generate', 'Generate export files'),
  ('perm_reports_read', 'reports.read', 'Read reports')
ON CONFLICT ("key") DO NOTHING;

