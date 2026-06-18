import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { chunkDocumentText, extractDocumentText } from "@/lib/document-extraction";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import {
  buildCompanyKnowledgeStoragePath,
  getSupabaseAdmin,
  getTenderFilesBucket,
  hasStorageConfig,
} from "@/lib/supabase-storage";
import { requireWorkspaceSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required before company documents can be saved." }, { status: 503 });
  }

  if (!hasStorageConfig()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required before company documents can be stored." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before uploading company knowledge." }, { status: 401 });
  }

  const formData = await request.formData();
  const sourceType = String(formData.get("sourceType") || "Company Evidence");
  const description = String(formData.get("description") || "").slice(0, 500) || undefined;
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "Upload at least one company knowledge document." }, { status: 400 });
  }

  const prisma = getPrisma();
  const supabase = getSupabaseAdmin();
  const createdFiles = [];
  const uploadedStorageKeys: string[] = [];

  try {
    for (const file of files) {
      const storageKey = buildCompanyKnowledgeStoragePath({
        organizationId: session.organizationId,
        fileName: file.name,
      });
      const bytes = await file.arrayBuffer();
      const { error } = await supabase.storage.from(getTenderFilesBucket()).upload(storageKey, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      if (error) {
        throw error;
      }

      uploadedStorageKeys.push(storageKey);

      const extraction = await extractDocumentText({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        buffer: Buffer.from(bytes),
      });
      const chunks = chunkDocumentText(extraction.text);
      const companyFile = await prisma.tenderFile.create({
        data: {
          organizationId: session.organizationId,
          purpose: "COMPANY_DOCUMENT",
          displayName: sourceType,
          description,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          storageKey,
          extractionStatus: extraction.status,
          extractionError: extraction.error,
          extractedText: extraction.text || undefined,
          extractedAt: extraction.status === "COMPLETED" ? new Date() : undefined,
          knowledgeChunks: {
            create: chunks.map((chunk) => ({
              organizationId: session.organizationId,
              chunkIndex: chunk.chunkIndex,
              content: chunk.content,
              tokenEstimate: chunk.tokenEstimate,
              sourceType,
              metadata: toPrismaJson({
                ...(chunk.metadata ?? {}),
                fileName: file.name,
                extraction: extraction.metadata ?? {},
              }),
            })),
          },
        },
        include: {
          knowledgeChunks: {
            select: { id: true },
          },
        },
      });

      createdFiles.push(companyFile);
    }

    await prisma.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.id,
        action: "company_knowledge.uploaded",
        entityType: "TenderFile",
        metadata: {
          fileCount: createdFiles.length,
          sourceType,
          chunkCount: createdFiles.reduce((total, file) => total + file.knowledgeChunks.length, 0),
        },
      },
    });

    return NextResponse.json({ files: createdFiles }, { status: 201 });
  } catch (error) {
    await Promise.all(uploadedStorageKeys.map((storageKey) => supabase.storage.from(getTenderFilesBucket()).remove([storageKey])));

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Company knowledge upload failed." },
      { status: 500 },
    );
  }
}

function toPrismaJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
