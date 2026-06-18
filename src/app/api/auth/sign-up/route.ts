import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, toOrganizationType } from "@/lib/auth";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";

const signUpSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    companyName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string().optional(),
    companyType: z.string().min(2),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = signUpSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid sign-up details.", issues: payload.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const email = payload.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: payload.data.companyName,
        type: toOrganizationType(payload.data.companyType),
        country: payload.data.country || undefined,
      },
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        email,
        firstName: payload.data.firstName,
        lastName: payload.data.lastName,
        phone: payload.data.phone || undefined,
        passwordHash: hashPassword(payload.data.password),
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: "role_org_admin",
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        action: "organization.created",
        entityType: "Organization",
        entityId: organization.id,
      },
    });

    return { organization, user };
  });

  const response = NextResponse.json({
    organization: {
      id: result.organization.id,
      name: result.organization.name,
    },
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
    },
  });

  response.cookies.set("tenderflow_user_id", result.user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  response.cookies.set("tenderflow_organization_id", result.organization.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
