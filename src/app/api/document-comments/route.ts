import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { requireWorkspaceSession } from "@/lib/session";

export const runtime = "nodejs";

const commentSchema = z.object({
  tenderId: z.string().min(1),
  tenderFileId: z.string().optional(),
  generatedFileId: z.string().optional(),
  content: z.string().trim().min(2).max(1500),
});

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before commenting." }, { status: 401 });
  }

  const payload = commentSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid comment payload.", issues: payload.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const tender = await prisma.tender.findFirst({
    where: {
      id: payload.data.tenderId,
      organizationId: session.organizationId,
    },
    select: { id: true },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender workspace not found." }, { status: 404 });
  }

  const comment = await prisma.documentComment.create({
    data: {
      tenderId: tender.id,
      tenderFileId: payload.data.tenderFileId || undefined,
      generatedFileId: payload.data.generatedFileId || undefined,
      authorId: session.id,
      content: payload.data.content,
    },
  });

  await prisma.activityEvent.create({
    data: {
      organizationId: session.organizationId,
      tenderId: tender.id,
      actorId: session.id,
      message: `${session.firstName} added a review comment.`,
      metadata: {
        commentId: comment.id,
        tenderFileId: comment.tenderFileId,
        generatedFileId: comment.generatedFileId,
      },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
