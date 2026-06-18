import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

const tenderSchema = z.object({
  organizationId: z.string().min(1),
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

  const formData = await request.formData();
  const payload = tenderSchema.safeParse({
    organizationId: formData.get("organizationId"),
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
  const tender = await prisma.tender.create({
    data: {
      organizationId: payload.data.organizationId,
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
      status: "UPLOADED",
      files: {
        create: files.map((file) => ({
          organizationId: payload.data.organizationId,
          purpose: "TENDER_DOCUMENT",
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          storageKey: `pending-storage/${crypto.randomUUID()}-${file.name}`,
        })),
      },
      auditLogs: {
        create: {
          organizationId: payload.data.organizationId,
          action: "tender.uploaded",
          entityType: "Tender",
          metadata: {
            fileCount: files.length,
            fileNames: files.map((file) => file.name),
          },
        },
      },
    },
    include: { files: true },
  });

  return NextResponse.json({ tender }, { status: 201 });
}
