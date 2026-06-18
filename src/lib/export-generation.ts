import JSZip from "jszip";

type ExportDocument = {
  id: string;
  kind: string;
  type: string;
  title: string | null;
  fileName: string;
  version: number;
  reviewStatus: string;
  content: unknown;
};

type ExportTender = {
  id: string;
  name: string;
  clientName: string;
  currency: string;
  estimatedValue?: unknown;
  submissionDeadline?: Date | null;
};

const requiredKinds = [
  "TECHNICAL_PROPOSAL",
  "COMMERCIAL_PROPOSAL",
  "COMPLIANCE_MATRIX",
  "RISK_REGISTER",
  "HSE_PLAN",
] as const;

export function getRequiredExportKinds() {
  return requiredKinds;
}

export function getExportGate(documents: Array<{ kind: string; reviewStatus: string }>) {
  const approvedKinds = new Set(
    documents
      .filter((document) => ["APPROVED", "FINAL"].includes(document.reviewStatus))
      .map((document) => document.kind),
  );
  const missingRequiredKinds = requiredKinds.filter((kind) => !approvedKinds.has(kind));

  return {
    canExport: missingRequiredKinds.length === 0,
    missingRequiredKinds,
    approvedCount: approvedKinds.size,
  };
}

export async function buildSubmissionPackage({
  tender,
  documents,
  readinessScore,
}: {
  tender: ExportTender;
  documents: ExportDocument[];
  readinessScore: number;
}) {
  const zip = new JSZip();
  const approvedDocuments = documents.filter((document) => ["APPROVED", "FINAL"].includes(document.reviewStatus));
  const manifest = buildManifest({ tender, documents: approvedDocuments, readinessScore });

  zip.file("00-submission-manifest.txt", manifest);
  zip.file("01-readiness-checklist.txt", buildChecklist(documents));

  for (const document of approvedDocuments) {
    const folder = zip.folder(kindFolder(document.kind));
    const text = renderDocumentText(document);
    const baseName = safeFileName(`${document.title ?? document.kind}-v${document.version}`);

    if (document.type === "XLSX") {
      folder?.file(`${baseName}.csv`, textToCsv(text));
    } else if (document.type === "PPTX") {
      folder?.file(`${baseName}-slides.txt`, text);
    } else {
      folder?.file(`${baseName}.doc.txt`, text);
    }
  }

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export function packageFileName(tenderName: string) {
  return `${safeFileName(tenderName || "tender")}-submission-package.zip`;
}

function buildManifest({
  tender,
  documents,
  readinessScore,
}: {
  tender: ExportTender;
  documents: ExportDocument[];
  readinessScore: number;
}) {
  return [
    "TenderFlow FM AI - Submission Package",
    "",
    `Tender: ${tender.name}`,
    `Client: ${tender.clientName}`,
    tender.submissionDeadline ? `Submission Deadline: ${tender.submissionDeadline.toLocaleDateString("en-AE")}` : "Submission Deadline: Not detected",
    tender.estimatedValue ? `Estimated Value: ${tender.currency} ${Number(tender.estimatedValue).toLocaleString("en-AE")}` : "Estimated Value: Not detected",
    `Readiness Score: ${readinessScore}%`,
    `Package Generated: ${new Date().toISOString()}`,
    "",
    "Included Documents",
    ...documents.map((document) => `- ${document.kind} | ${document.reviewStatus} | v${document.version} | ${document.title ?? document.fileName}`),
  ].join("\n");
}

function buildChecklist(documents: ExportDocument[]) {
  const latestByKind = new Map<string, ExportDocument>();

  for (const document of documents) {
    const current = latestByKind.get(document.kind);

    if (!current || document.version > current.version) {
      latestByKind.set(document.kind, document);
    }
  }

  return requiredKinds
    .map((kind) => {
      const document = latestByKind.get(kind);
      const ready = document && ["APPROVED", "FINAL"].includes(document.reviewStatus);
      return `${ready ? "[x]" : "[ ]"} ${kind.replaceAll("_", " ")}${document ? ` - ${document.reviewStatus} v${document.version}` : " - missing"}`;
    })
    .join("\n");
}

function renderDocumentText(document: ExportDocument) {
  const content = parseContent(document.content);
  const sections = content.sections ?? [];

  return [
    document.title ?? document.fileName,
    `Document Kind: ${document.kind}`,
    `Review Status: ${document.reviewStatus}`,
    `Version: ${document.version}`,
    "",
    ...sections.flatMap((section) => [
      section.heading,
      "-".repeat(Math.min(80, section.heading.length)),
      section.body,
      section.source ? `\n${section.source}` : "",
      "",
    ]),
  ].join("\n");
}

function parseContent(content: unknown): {
  sections?: Array<{ heading: string; body: string; source?: string }>;
} {
  if (content && typeof content === "object" && "sections" in content) {
    return content as { sections?: Array<{ heading: string; body: string; source?: string }> };
  }

  return {};
}

function textToCsv(text: string) {
  return text
    .split("\n")
    .map((line) => `"${line.replace(/"/g, '""')}"`)
    .join("\n");
}

function kindFolder(kind: string) {
  return safeFileName(kind.toLowerCase().replaceAll("_", "-"));
}

function safeFileName(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._ -]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
