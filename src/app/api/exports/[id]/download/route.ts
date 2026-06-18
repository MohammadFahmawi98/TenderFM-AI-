import { NextResponse } from "next/server";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getSupabaseAdmin, getTenderFilesBucket, hasStorageConfig } from "@/lib/supabase-storage";
import { requireWorkspaceSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 503 });
  }

  if (!hasStorageConfig()) {
    return NextResponse.json({ error: "Supabase Storage is required before downloading packages." }, { status: 503 });
  }

  const session = await requireWorkspaceSession(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ error: "Sign in before downloading export packages." }, { status: 401 });
  }

  const { id } = await params;
  const generatedFile = await getPrisma().generatedFile.findFirst({
    where: {
      id,
      kind: "SUBMISSION_PACKAGE",
      tender: {
        organizationId: session.organizationId,
      },
    },
    select: {
      storageKey: true,
      fileName: true,
    },
  });

  if (!generatedFile) {
    return NextResponse.json({ error: "Export package not found." }, { status: 404 });
  }

  const { data, error } = await getSupabaseAdmin()
    .storage
    .from(getTenderFilesBucket())
    .createSignedUrl(generatedFile.storageKey, 60, {
      download: generatedFile.fileName,
    });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Could not create download link." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
