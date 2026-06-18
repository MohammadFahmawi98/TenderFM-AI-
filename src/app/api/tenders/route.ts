import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import {
  buildTenderStoragePath,
  getSupabaseAdmin,
  getTenderFilesBucket,
  hasStorageConfig,
} from "@/lib/supabase-storage";

export const runtime = "nodejs";

const tenderSchema = z.object({
  tenderName: z.string().min(2),
  clientName: z.string().min(2),
  country: z.string().optional(),
  location: z.string().optional(),
  tenderCategory: z.string().optional(),
  submissionDeadline: z.string().optional(),
  contractDuration: z.string().optional(),
  estimatedValue: z.string().optional(),
});

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is required before tender uploads can be saved." },
      { status: 503 },
    );
  }

  if (!hasStorageConfig()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required before tender files can be stored." },
      { status: 503 },
    );
  }

  const organizationId = getCookieValue(request.headers.get("cookie"), "tenderflow_organization_id");
  const userId = getCookieValue(request.headers.get("cookie"), "tenderflow_user_id");

  if (!organizationId || !userId) {
    return NextResponse.json(
      { error: "Sign in before uploading tender files." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const payload = tenderSchema.safeParse({
    tenderName: formData.get("tenderName"),
    clientName: formData.get("clientName"),
    country: formData.get("country") || undefined,
    location: formData.get("location") || undefined,
    tenderCategory: formData.get("tenderCategory") || undefined,
    submissionDeadline: formData.get("submissionDeadline") || undefined,
    contractDuration: formData.get("contractDuration") || undefined,
    estimatedValue: formData.get("estimatedValue") || undefined,
  });

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid tender payload.", issues: payload.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "Upload at least one tender document." }, { status: 400 });
  }

  const prisma = getPrisma();
  const membership = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Invalid organization session." }, { status: 403 });
  }

  const tender = await prisma.tender.create({
    data: {
      organizationId,
      ownerId: userId,
      name: payload.data.tenderName,
      clientName: payload.data.clientName,
      country: payload.data.country,
      location: payload.data.location,
      category: payload.data.tenderCategory,
      contractDuration: payload.data.contractDuration,
      submissionDeadline: payload.data.submissionDeadline
        ? new Date(payload.data.submissionDeadline)
        : undefined,
      estimatedValue: payload.data.estimatedValue ? Number(payload.data.estimatedValue) : undefined,
      status: "PROCESSING",
      auditLogs: {
        create: {
          organizationId,
          userId,
          action: "tender.uploaded",
          entityType: "Tender",
          metadata: {
            fileCount: files.length,
            fileNames: files.map((file) => file.name),
          },
        },
      },
    },
  });

  const supabase = getSupabaseAdmin();
  const uploadedFiles: Array<{
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
  }> = [];

  try {
    for (const file of files) {
      const storageKey = buildTenderStoragePath({
        organizationId,
        tenderId: tender.id,
        fileName: file.name,
      });
      const bytes = await file.arrayBuffer();
      const { error } = await supabase.storage
        .from(getTenderFilesBucket())
        .upload(storageKey, bytes, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploadedFiles.push({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storageKey,
      });
    }

    await prisma.tenderFile.createMany({
      data: uploadedFiles.map((file) => ({
        organizationId,
        tenderId: tender.id,
        purpose: "TENDER_DOCUMENT",
        fileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        storageKey: file.storageKey,
      })),
    });

    const storedTender = await prisma.tender.findUnique({
      where: { id: tender.id },
      include: { files: true },
    });

    return NextResponse.json({ tender: storedTender }, { status: 201 });
  } catch (error) {
    await Promise.all(
      uploadedFiles.map((file) =>
        supabase.storage.from(getTenderFilesBucket()).remove([file.storageKey]),
      ),
    );
    await prisma.tender.delete({ where: { id: tender.id } });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File upload failed." },
      { status: 500 },
    );
  }
}

function getCookieValue(cookieHeader: string | null, key: string) {
  return cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${key}=`))
    ?.split("=")[1];
}
