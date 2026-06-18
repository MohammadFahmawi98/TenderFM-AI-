import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { buildGeneratedDocument, documentBlueprints } from "@/lib/document-generation";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { requireWorkspaceSession } from "@/lib/session";

export const runtime = "nodejs";

const generateSchema = z.object({
  tenderId: z.string().min(1),
  kind: z
    .enum([
      "TECHNICAL_PROPOSAL",
      "COMMERCIAL_PROPOSAL",
      "COMPLIANCE_MATRIX",
      "MANPOWER_PLAN",
      "PPM_SCHEDULE",
      "SLA_MATRIX",
      "KPI_MATRIX",
      "RISK_REGISTER",
      "HSE_PLAN",
      "METHOD_STATEMENT",
      "EXECUTIVE_SUMMARY",
      "POWERPOINT_PRESENTATION",
      "EXCEL_COST_SHEET",
      "SUBMISSION_PACKAGE",
    ])
    .optional(),
  generateAll: z.boolean().optional(),
});

const updateSchema = z.object({
  generatedFileId: z.string().min(1),
  title: z.string().trim().min(2).max(180).optional(),
  content: z.unknown().optional(),
  reviewStatus: z.enum(["DRAFT", "AI_GENERATED", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "FINAL", "REJECTED"]).optional(),
  changeSummary: z.string().trim().max(300).optional(),
});

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before generating tender documents." }, { status: 401 });
  }

  const payload = generateSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid document generation payload.", issues: payload.error.flatten().fieldErrors },
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
      analysis: true,
      complianceItems: {
        orderBy: [{ priority: "desc" }],
      },
      riskItems: {
        orderBy: [{ score: "desc" }],
      },
      files: {
        orderBy: { uploadedAt: "desc" },
        include: {
          chunks: {
            orderBy: { chunkIndex: "asc" },
            take: 8,
          },
        },
      },
    },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender workspace not found." }, { status: 404 });
  }

  const kinds = payload.data.generateAll
    ? documentBlueprints.map((item) => item.kind)
    : payload.data.kind
      ? [payload.data.kind]
      : [];

  if (kinds.length === 0) {
    return NextResponse.json({ error: "Select at least one document to generate." }, { status: 400 });
  }

  const generatedFiles = [];

  for (const kind of kinds) {
    const draft = buildGeneratedDocument(tender, kind);
    const existing = await prisma.generatedFile.findFirst({
      where: {
        tenderId: tender.id,
        kind,
      },
      orderBy: { version: "desc" },
      select: { id: true, version: true },
    });
    const nextVersion = existing ? existing.version + 1 : 1;
    const content = toPrismaJson({
      generator: "source-grounded tenderflow draft",
      generatedAt: new Date().toISOString(),
      sections: draft.sections,
    });

    const generatedFile = await prisma.generatedFile.create({
      data: {
        tenderId: tender.id,
        kind: draft.kind,
        type: draft.type,
        fileName: nextVersion === 1 ? draft.fileName : draft.fileName.replace(/\.(\w+)$/, `-v${nextVersion}.$1`),
        storageKey: `generated/${session.organizationId}/${tender.id}/${draft.kind.toLowerCase()}-v${nextVersion}.json`,
        title: draft.title,
        content,
        reviewStatus: "AI_GENERATED",
        version: nextVersion,
        versions: {
          create: {
            tenderId: tender.id,
            version: nextVersion,
            title: draft.title,
            content,
            changeSummary: "Generated from extracted tender source data.",
            createdById: session.id,
          },
        },
      },
    });

    generatedFiles.push(generatedFile);
  }

  await prisma.activityEvent.create({
    data: {
      organizationId: session.organizationId,
      tenderId: tender.id,
      actorId: session.id,
      message: `${session.firstName} generated ${generatedFiles.length} tender document${generatedFiles.length === 1 ? "" : "s"}.`,
      metadata: {
        documentIds: generatedFiles.map((file) => file.id),
        kinds,
      },
    },
  });

  return NextResponse.json({ generatedFiles }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before updating generated documents." }, { status: 401 });
  }

  const payload = updateSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid generated document payload.", issues: payload.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const generatedFile = await prisma.generatedFile.findFirst({
    where: {
      id: payload.data.generatedFileId,
      tender: { organizationId: session.organizationId },
    },
    select: {
      id: true,
      tenderId: true,
      title: true,
      content: true,
      version: true,
      lockedAt: true,
    },
  });

  if (!generatedFile) {
    return NextResponse.json({ error: "Generated document not found." }, { status: 404 });
  }

  if (generatedFile.lockedAt && payload.data.reviewStatus !== "FINAL") {
    return NextResponse.json({ error: "Final documents are locked. Create a new generated version instead." }, { status: 409 });
  }

  const isContentUpdate = payload.data.title || payload.data.content;
  const nextVersion = isContentUpdate ? generatedFile.version + 1 : generatedFile.version;
  const content = payload.data.content === undefined ? normalizeJson(generatedFile.content) : toPrismaJson(payload.data.content);
  const title = payload.data.title ?? generatedFile.title ?? "Generated Document";
  const reviewStatus = payload.data.reviewStatus;

  const updated = await prisma.generatedFile.update({
    where: { id: generatedFile.id },
    data: {
      title,
      content,
      reviewStatus,
      version: nextVersion,
      lockedAt: reviewStatus === "FINAL" ? new Date() : undefined,
      reviewerId: ["APPROVED", "FINAL", "REJECTED", "CHANGES_REQUESTED"].includes(reviewStatus ?? "") ? session.id : undefined,
      versions: isContentUpdate
        ? {
            create: {
              tenderId: generatedFile.tenderId,
              version: nextVersion,
              title,
              content,
              changeSummary: payload.data.changeSummary || "Edited in document workspace.",
              createdById: session.id,
            },
          }
        : undefined,
    },
  });

  await prisma.activityEvent.create({
    data: {
      organizationId: session.organizationId,
      tenderId: generatedFile.tenderId,
      actorId: session.id,
      message: `${session.firstName} updated ${title}.`,
      metadata: {
        generatedFileId: generatedFile.id,
        reviewStatus,
        version: updated.version,
      },
    },
  });

  return NextResponse.json({ generatedFile: updated });
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function normalizeJson(value: unknown) {
  return value === null ? Prisma.JsonNull : toPrismaJson(value);
}
