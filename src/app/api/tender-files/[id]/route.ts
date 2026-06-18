import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { requireWorkspaceSession } from "@/lib/session";

export const runtime = "nodejs";

const fileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().max(800).optional(),
  category: z.enum([
    "RFP_MAIN_DOCUMENT",
    "BOQ",
    "TECHNICAL_SPECIFICATION",
    "CONTRACT_CONDITIONS",
    "DRAWINGS",
    "APPENDICES",
    "COMPLIANCE_DOCUMENTS",
    "PRICING_DOCUMENTS",
    "CLIENT_FORMS",
    "OTHER",
  ]).optional(),
  isImportant: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before editing tender files." }, { status: 401 });
  }

  const payload = fileUpdateSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid file metadata.", issues: payload.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { id } = await params;
  const prisma = getPrisma();
  const file = await prisma.tenderFile.findFirst({
    where: {
      id,
      organizationId: session.organizationId,
    },
    select: {
      id: true,
      tenderId: true,
      fileName: true,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const updatedFile = await prisma.tenderFile.update({
    where: { id: file.id },
    data: {
      ...payload.data,
      tender: file.tenderId
        ? {
            update: {
              activityEvents: {
                create: {
                  organizationId: session.organizationId,
                  actorId: session.id,
                  message: `${session.firstName} updated file metadata for ${payload.data.displayName ?? file.fileName}.`,
                },
              },
            },
          }
        : undefined,
    },
  });

  return NextResponse.json({ file: updatedFile });
}
