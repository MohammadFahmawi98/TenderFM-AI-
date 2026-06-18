import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSubmissionPackage, getExportGate, packageFileName } from "@/lib/export-generation";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { calculateSubmissionReadiness } from "@/lib/readiness";
import { getSupabaseAdmin, getTenderFilesBucket, hasStorageConfig } from "@/lib/supabase-storage";
import { requireWorkspaceSession } from "@/lib/session";

export const runtime = "nodejs";

const exportSchema = z.object({
  tenderId: z.string().min(1),
});

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 503 });
  }

  if (!hasStorageConfig()) {
    return NextResponse.json({ error: "Supabase Storage is required before exporting packages." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before exporting submission packages." }, { status: 401 });
  }

  const payload = exportSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid export payload.", issues: payload.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const tender = await prisma.tender.findFirst({
    where: {
      id: payload.data.tenderId,
      organizationId: session.organizationId,
    },
    include: {
      files: {
        select: { extractionStatus: true },
      },
      generatedFiles: {
        orderBy: [{ kind: "asc" }, { version: "desc" }],
      },
      workspaceTasks: {
        select: { status: true },
      },
      complianceItems: {
        select: { status: true },
      },
    },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender workspace not found." }, { status: 404 });
  }

  const packageDocuments = tender.generatedFiles.filter((document) => document.kind !== "SUBMISSION_PACKAGE");
  const gate = getExportGate(packageDocuments);

  if (!gate.canExport) {
    return NextResponse.json(
      {
        error: "Submission package is not ready for export.",
        missingRequiredKinds: gate.missingRequiredKinds,
      },
      { status: 409 },
    );
  }

  const readiness = calculateSubmissionReadiness(tender);
  const fileName = packageFileName(tender.name);
  const buffer = await buildSubmissionPackage({
    tender,
    documents: packageDocuments,
    readinessScore: readiness.score,
  });
  const storageKey = `${session.organizationId}/tenders/${tender.id}/exports/${crypto.randomUUID()}-${fileName}`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(getTenderFilesBucket()).upload(storageKey, buffer, {
    contentType: "application/zip",
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const generatedFile = await prisma.generatedFile.create({
    data: {
      tenderId: tender.id,
      kind: "SUBMISSION_PACKAGE",
      type: "ZIP",
      fileName,
      storageKey,
      title: "Final Submission Package",
      reviewStatus: "FINAL",
      lockedAt: new Date(),
      reviewerId: session.id,
      content: {
        readiness,
        includedDocuments: tender.generatedFiles
          .filter((document) => document.kind !== "SUBMISSION_PACKAGE")
          .filter((document) => ["APPROVED", "FINAL"].includes(document.reviewStatus))
          .map((document) => ({
            id: document.id,
            kind: document.kind,
            version: document.version,
            title: document.title,
          })),
      },
      versions: {
        create: {
          tenderId: tender.id,
          version: 1,
          title: "Final Submission Package",
          content: {
            readiness,
            storageKey,
          },
          changeSummary: "Submission package exported and locked.",
          createdById: session.id,
        },
      },
    },
  });

  await prisma.activityEvent.create({
    data: {
      organizationId: session.organizationId,
      tenderId: tender.id,
      actorId: session.id,
      message: `${session.firstName} exported the final submission package.`,
      metadata: {
        generatedFileId: generatedFile.id,
        readinessScore: readiness.score,
        storageKey,
      },
    },
  });

  return NextResponse.json({ generatedFile, readiness }, { status: 201 });
}
