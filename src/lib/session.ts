import { getPrisma } from "@/lib/prisma";

export function getCookieValue(cookieHeader: string | null, key: string) {
  return cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${key}=`))
    ?.split("=")[1];
}

export async function requireWorkspaceSession(cookieHeader: string | null) {
  const organizationId = getCookieValue(cookieHeader, "tenderflow_organization_id");
  const userId = getCookieValue(cookieHeader, "tenderflow_user_id");

  if (!organizationId || !userId) {
    return null;
  }

  const user = await getPrisma().user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
    select: {
      id: true,
      organizationId: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  return user;
}
