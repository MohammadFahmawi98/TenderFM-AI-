import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export type DashboardStats = {
  databaseReady: boolean;
  activeTenders: number;
  qualifiedTenders: number;
  submittedTenders: number;
  wonTenders: number;
  pipelineValue: string;
  winRate: string;
  upcomingDeadlines: number;
  estimatedRevenue: string;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!hasDatabaseUrl()) {
    return emptyStats(false);
  }

  try {
    const prisma = getPrisma();
    const [
      activeTenders,
      qualifiedTenders,
      submittedTenders,
      wonTenders,
      upcomingDeadlines,
      totalTenders,
    ] = await Promise.all([
      prisma.tender.count({
        where: { status: { in: ["UPLOADED", "PROCESSING", "ANALYZED", "QUALIFIED", "IN_ESTIMATION", "IN_PROPOSAL"] } },
      }),
      prisma.tender.count({ where: { status: "QUALIFIED" } }),
      prisma.tender.count({ where: { status: "SUBMITTED" } }),
      prisma.tender.count({ where: { status: "WON" } }),
      prisma.tender.count({
        where: {
          submissionDeadline: {
            gte: new Date(),
            lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
          },
        },
      }),
      prisma.tender.count(),
    ]);

    const pipeline = await prisma.tender.aggregate({
      _sum: { estimatedValue: true },
    });

    const pipelineValue = Number(pipeline._sum.estimatedValue ?? 0);
    const winRate = totalTenders > 0 ? Math.round((wonTenders / totalTenders) * 100) : 0;

    return {
      databaseReady: true,
      activeTenders,
      qualifiedTenders,
      submittedTenders,
      wonTenders,
      pipelineValue: formatCurrency(pipelineValue),
      winRate: `${winRate}%`,
      upcomingDeadlines,
      estimatedRevenue: formatCurrency(pipelineValue),
    };
  } catch {
    return emptyStats(false);
  }
}

export async function getRecentTenders() {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    return await getPrisma().tender.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        clientName: true,
        status: true,
        submissionDeadline: true,
        estimatedValue: true,
        currency: true,
        files: {
          select: {
            id: true,
            extractionStatus: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function getLatestWorkspaceTender(organizationId?: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    return await getPrisma().tender.findFirst({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        files: {
          orderBy: { uploadedAt: "desc" },
          include: {
            chunks: {
              orderBy: { chunkIndex: "asc" },
              take: 2,
            },
          },
        },
        analysis: true,
        complianceItems: {
          orderBy: [{ priority: "desc" }],
          take: 6,
        },
        riskItems: {
          orderBy: [{ score: "desc" }],
          take: 6,
        },
        generatedFiles: {
          orderBy: { createdAt: "desc" },
          take: 8,
        },
      },
    });
  } catch {
    return null;
  }
}

function emptyStats(databaseReady: boolean): DashboardStats {
  return {
    databaseReady,
    activeTenders: 0,
    qualifiedTenders: 0,
    submittedTenders: 0,
    wonTenders: 0,
    pipelineValue: "AED 0",
    winRate: "0%",
    upcomingDeadlines: 0,
    estimatedRevenue: "AED 0",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}
