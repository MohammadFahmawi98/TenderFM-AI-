import { createClient } from "@supabase/supabase-js";

const TENDER_FILES_BUCKET = "tender-files";

export function getTenderFilesBucket() {
  return TENDER_FILES_BUCKET;
}

export function hasStorageConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase Storage is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function buildTenderStoragePath({
  organizationId,
  tenderId,
  fileName,
}: {
  organizationId: string;
  tenderId: string;
  fileName: string;
}) {
  const safeFileName = fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);

  return `${organizationId}/tenders/${tenderId}/${crypto.randomUUID()}-${safeFileName || "upload"}`;
}

export function buildCompanyKnowledgeStoragePath({
  organizationId,
  fileName,
}: {
  organizationId: string;
  fileName: string;
}) {
  const safeFileName = fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);

  return `${organizationId}/knowledge/${crypto.randomUUID()}-${safeFileName || "company-document"}`;
}
