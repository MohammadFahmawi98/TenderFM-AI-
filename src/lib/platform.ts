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

export async function getTenderWorkspaces(organizationId?: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    return await getPrisma().tender.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        files: {
          select: {
            id: true,
            extractionStatus: true,
          },
        },
        generatedFiles: {
          select: {
            id: true,
            reviewStatus: true,
          },
        },
        workspaceTasks: {
          select: {
            id: true,
            status: true,
          },
        },
        analysis: {
          select: {
            winProbability: true,
            recommendation: true,
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
        organization: {
          include: {
            users: {
              orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
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
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            versions: {
              orderBy: { version: "desc" },
              take: 3,
            },
            comments: {
              orderBy: { createdAt: "desc" },
              take: 3,
              include: {
                author: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          take: 8,
        },
        workspaceTasks: {
          orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
          take: 10,
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            relatedFile: {
              select: {
                id: true,
                fileName: true,
                displayName: true,
              },
            },
            generatedFile: {
              select: {
                id: true,
                fileName: true,
                title: true,
              },
            },
          },
        },
        documentComments: {
          orderBy: { createdAt: "desc" },
          take: 8,
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            tenderFile: {
              select: {
                id: true,
                fileName: true,
                displayName: true,
              },
            },
            generatedFile: {
              select: {
                id: true,
                fileName: true,
                title: true,
              },
            },
          },
        },
        activityEvents: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getDocumentLibrary(organizationId?: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    const prisma = getPrisma();
    const tender = await prisma.tender.findFirst({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        generatedFiles: {
          orderBy: { updatedAt: "desc" },
          include: {
            reviewer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            versions: {
              orderBy: { version: "desc" },
              take: 5,
            },
            comments: {
              orderBy: { createdAt: "desc" },
              take: 5,
              include: {
                author: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        workspaceTasks: {
          where: {
            generatedFileId: { not: null },
          },
          orderBy: { updatedAt: "desc" },
          take: 10,
          include: {
            assignee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const integrations = organizationId
      ? await prisma.integrationConnection.findMany({
          where: { organizationId },
          orderBy: { provider: "asc" },
        })
      : [];

    return { tender, integrations };
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
