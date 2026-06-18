import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { requireWorkspaceSession } from "@/lib/session";

export const runtime = "nodejs";

const taskSchema = z.object({
  tenderId: z.string().min(1),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "APPROVED", "BLOCKED", "COMPLETED"]).default("TODO"),
  relatedFileId: z.string().optional(),
  generatedFileId: z.string().optional(),
  relatedAgent: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before assigning tender tasks." }, { status: 401 });
  }

  const payload = taskSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid task payload.", issues: payload.error.flatten().fieldErrors },
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

  const task = await prisma.workspaceTask.create({
    data: {
      tenderId: tender.id,
      title: payload.data.title,
      description: payload.data.description,
      assigneeId: payload.data.assigneeId || undefined,
      createdById: session.id,
      dueDate: payload.data.dueDate ? new Date(payload.data.dueDate) : undefined,
      priority: payload.data.priority,
      status: payload.data.status,
      relatedFileId: payload.data.relatedFileId || undefined,
      generatedFileId: payload.data.generatedFileId || undefined,
      relatedAgent: payload.data.relatedAgent || undefined,
    },
  });

  await prisma.activityEvent.create({
    data: {
      organizationId: session.organizationId,
      tenderId: tender.id,
      actorId: session.id,
      message: `${session.firstName} created task: ${task.title}.`,
      metadata: {
        taskId: task.id,
        priority: task.priority,
        status: task.status,
      },
    },
  });

  if (task.assigneeId) {
    await prisma.notification.create({
      data: {
        userId: task.assigneeId,
        title: "Tender task assigned",
        body: task.title,
      },
    });
  }

  return NextResponse.json({ task }, { status: 201 });
}
