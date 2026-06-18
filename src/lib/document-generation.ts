import type { GeneratedDocumentKind, GeneratedFileType } from "@prisma/client";

type SourceTender = {
  id: string;
  name: string;
  clientName: string;
  country?: string | null;
  location?: string | null;
  category?: string | null;
  contractDuration?: string | null;
  submissionDeadline?: Date | null;
  estimatedValue?: unknown;
  currency: string;
  analysis?: {
    executiveSummary?: string | null;
    technicalSummary?: string | null;
    commercialSummary?: string | null;
    qualificationScore?: number | null;
    winProbability?: number | null;
    recommendation?: string | null;
    scopeBreakdown?: unknown;
  } | null;
  files?: Array<{
    fileName: string;
    displayName?: string | null;
    chunks?: Array<{ content: string; chunkIndex: number }>;
  }>;
  complianceItems?: Array<{
    requirement: string;
    status: string;
    priority: string;
    action?: string | null;
    source?: string | null;
  }>;
  riskItems?: Array<{
    category: string;
    title: string;
    description?: string | null;
    score: number;
    mitigation?: string | null;
  }>;
};

export type GeneratedDocumentDraft = {
  kind: GeneratedDocumentKind;
  type: GeneratedFileType;
  title: string;
  fileName: string;
  sections: Array<{
    heading: string;
    body: string;
    source?: string;
  }>;
};

export const documentBlueprints: Array<{
  kind: GeneratedDocumentKind;
  type: GeneratedFileType;
  label: string;
}> = [
  { kind: "TECHNICAL_PROPOSAL", type: "DOCX", label: "Technical Proposal" },
  { kind: "COMMERCIAL_PROPOSAL", type: "DOCX", label: "Commercial Proposal" },
  { kind: "COMPLIANCE_MATRIX", type: "XLSX", label: "Compliance Matrix" },
  { kind: "MANPOWER_PLAN", type: "XLSX", label: "Manpower Plan" },
  { kind: "PPM_SCHEDULE", type: "XLSX", label: "PPM Schedule" },
  { kind: "SLA_MATRIX", type: "XLSX", label: "SLA Matrix" },
  { kind: "KPI_MATRIX", type: "XLSX", label: "KPI Matrix" },
  { kind: "RISK_REGISTER", type: "XLSX", label: "Risk Register" },
  { kind: "HSE_PLAN", type: "DOCX", label: "HSE Plan" },
  { kind: "METHOD_STATEMENT", type: "DOCX", label: "Method Statement" },
  { kind: "EXECUTIVE_SUMMARY", type: "PDF", label: "Executive Summary" },
  { kind: "POWERPOINT_PRESENTATION", type: "PPTX", label: "Executive Presentation" },
  { kind: "EXCEL_COST_SHEET", type: "XLSX", label: "Excel Cost Sheet" },
];

export function buildGeneratedDocument(tender: SourceTender, kind: GeneratedDocumentKind): GeneratedDocumentDraft {
  const blueprint = documentBlueprints.find((item) => item.kind === kind) ?? documentBlueprints[0];
  const evidence = collectEvidence(tender);
  const summary = tender.analysis?.executiveSummary ?? "No extracted executive summary is available yet.";
  const technical = tender.analysis?.technicalSummary ?? "Technical analysis is pending readable source text.";
  const commercial = tender.analysis?.commercialSummary ?? "Commercial analysis is pending readable source text.";
  const sourceLabel = evidence.primarySource ? `Source: ${evidence.primarySource}` : "Source: extracted tender workspace";
  const common = [
    {
      heading: "Tender Context",
      body: [
        `Tender: ${tender.name}`,
        `Client: ${tender.clientName}`,
        tender.category ? `Category: ${tender.category}` : undefined,
        tender.location ? `Location: ${tender.location}` : undefined,
        tender.contractDuration ? `Contract duration: ${tender.contractDuration}` : undefined,
        tender.submissionDeadline ? `Submission deadline: ${tender.submissionDeadline.toLocaleDateString("en-AE")}` : undefined,
      ]
        .filter(Boolean)
        .join("\n"),
      source: sourceLabel,
    },
  ];

  const sectionsByKind: Record<GeneratedDocumentKind, GeneratedDocumentDraft["sections"]> = {
    TECHNICAL_PROPOSAL: [
      ...common,
      { heading: "Executive Technical Response", body: technical, source: sourceLabel },
      { heading: "Scope Understanding", body: evidence.scope || "Scope details require reviewer completion after source review.", source: sourceLabel },
      { heading: "Delivery Methodology", body: buildMethodology(evidence) },
      { heading: "Mobilization Approach", body: evidence.mobilization || "Mobilization requirements were not explicitly detected in extracted text." },
    ],
    COMMERCIAL_PROPOSAL: [
      ...common,
      { heading: "Commercial Summary", body: commercial, source: sourceLabel },
      { heading: "Pricing Assumptions", body: buildCommercialAssumptions(tender, evidence) },
      { heading: "Commercial Risks", body: tender.riskItems?.map((risk) => `${risk.title}: ${risk.mitigation ?? risk.description ?? "Review required."}`).join("\n") || "No commercial risk records detected yet." },
    ],
    COMPLIANCE_MATRIX: [
      ...common,
      {
        heading: "Compliance Requirements",
        body: tender.complianceItems?.length
          ? tender.complianceItems.map((item) => `${item.priority} | ${item.status} | ${item.requirement} | ${item.action ?? "Assign evidence owner."}`).join("\n")
          : "No compliance requirements have been detected yet.",
        source: sourceLabel,
      },
    ],
    MANPOWER_PLAN: [
      ...common,
      { heading: "Manpower Planning Basis", body: evidence.manpower || "No explicit manpower quantities detected. Build staffing from scope, SLA, location, and shift requirements." },
      { heading: "Review Inputs Needed", body: "Confirm operating hours, shift pattern, asset criticality, service frequency, supervision levels, and relief coverage." },
    ],
    PPM_SCHEDULE: [
      ...common,
      { heading: "PPM Planning Basis", body: evidence.ppm || "No detailed PPM schedule detected. Generate PPM frequencies after asset register classification." },
      { heading: "Maintenance Calendar Inputs", body: "Asset type, quantity, location, criticality, OEM recommendation, statutory frequency, and client access windows." },
    ],
    SLA_MATRIX: [
      ...common,
      { heading: "SLA Signals", body: evidence.sla || "No explicit SLA text detected. Reviewer should define response and resolution times from tender clauses." },
    ],
    KPI_MATRIX: [
      ...common,
      { heading: "KPI Signals", body: evidence.kpi || "No explicit KPI text detected. Reviewer should define measurement method, frequency, target, and penalty impact." },
    ],
    RISK_REGISTER: [
      ...common,
      {
        heading: "Risk Register",
        body: tender.riskItems?.length
          ? tender.riskItems.map((risk) => `${risk.category} | Score ${risk.score} | ${risk.title} | ${risk.mitigation ?? "Mitigation to be assigned."}`).join("\n")
          : "No risk records detected yet.",
        source: sourceLabel,
      },
    ],
    HSE_PLAN: [
      ...common,
      { heading: "HSE Requirements", body: evidence.hse || "No explicit HSE requirement text detected. Include organization HSE manual and site-specific risk controls." },
      { heading: "Controls", body: "Induction, toolbox talks, permits, PPE, incident reporting, emergency response, method statements, and audit schedule." },
    ],
    METHOD_STATEMENT: [
      ...common,
      { heading: "Method Statement Basis", body: buildMethodology(evidence), source: sourceLabel },
      { heading: "Quality Control", body: "Define inspection checkpoints, supervisor sign-off, client reporting, non-conformance handling, and corrective actions." },
    ],
    EXECUTIVE_SUMMARY: [
      ...common,
      { heading: "Opportunity Intelligence", body: summary, source: sourceLabel },
      {
        heading: "Decision View",
        body: `Recommendation: ${tender.analysis?.recommendation ?? "Pending"}\nQualification: ${tender.analysis?.qualificationScore ?? "-"}%\nWin probability: ${tender.analysis?.winProbability ?? "-"}%`,
      },
    ],
    POWERPOINT_PRESENTATION: [
      ...common,
      { heading: "Slide 1 - Opportunity", body: summary, source: sourceLabel },
      { heading: "Slide 2 - Delivery Model", body: technical },
      { heading: "Slide 3 - Risks and Readiness", body: tender.riskItems?.map((risk) => risk.title).join("\n") || "No risk records detected yet." },
    ],
    EXCEL_COST_SHEET: [
      ...common,
      { heading: "Cost Sheet Inputs", body: buildCommercialAssumptions(tender, evidence) },
      { heading: "Pricing Lines To Complete", body: "Manpower, supervision, consumables, equipment, subcontractors, overhead, profit, VAT, contingency, and exclusions." },
    ],
    SUBMISSION_PACKAGE: [
      ...common,
      { heading: "Package Checklist", body: "Technical proposal, commercial proposal, compliance matrix, risk register, HSE plan, attachments, approvals, and final lock." },
    ],
  };

  return {
    kind,
    type: blueprint.type,
    title: blueprint.label,
    fileName: `${slugify(tender.name)}-${blueprint.kind.toLowerCase()}.${blueprint.type.toLowerCase()}`,
    sections: sectionsByKind[kind],
  };
}

function collectEvidence(tender: SourceTender) {
  const chunks =
    tender.files
      ?.flatMap((file) =>
        (file.chunks ?? []).map((chunk) => ({
          source: file.displayName ?? file.fileName,
          content: chunk.content,
        })),
      )
      .slice(0, 30) ?? [];

  return {
    primarySource: chunks[0]?.source,
    scope: findEvidence(chunks, ["scope", "services", "requirement"]),
    mobilization: findEvidence(chunks, ["mobilization", "commencement", "handover"]),
    manpower: findEvidence(chunks, ["manpower", "staff", "supervisor", "technician", "shift"]),
    ppm: findEvidence(chunks, ["ppm", "preventive", "maintenance schedule", "asset"]),
    sla: findEvidence(chunks, ["sla", "response time", "resolution time", "service level"]),
    kpi: findEvidence(chunks, ["kpi", "performance", "target", "measurement"]),
    hse: findEvidence(chunks, ["hse", "safety", "risk assessment", "permit", "ppe"]),
  };
}

function findEvidence(chunks: Array<{ source: string; content: string }>, terms: string[]) {
  const match = chunks.find((chunk) => terms.some((term) => chunk.content.toLowerCase().includes(term)));
  return match ? `${match.content.slice(0, 900)}\n\nSource file: ${match.source}` : "";
}

function buildMethodology(evidence: ReturnType<typeof collectEvidence>) {
  return [
    evidence.scope || "Confirm the complete service scope from extracted tender clauses.",
    "Structure delivery around mobilization, transition, steady-state operations, reporting, quality assurance, and continuous improvement.",
    evidence.sla ? `SLA basis:\n${evidence.sla}` : "Define response and resolution commitments after SLA clause review.",
  ].join("\n\n");
}

function buildCommercialAssumptions(tender: SourceTender, evidence: ReturnType<typeof collectEvidence>) {
  return [
    tender.estimatedValue ? `Detected tender value: ${tender.currency} ${Number(tender.estimatedValue).toLocaleString("en-AE")}` : "Tender value was not detected from source files.",
    evidence.manpower ? `Manpower basis:\n${evidence.manpower}` : "Manpower quantities are pending reviewer confirmation.",
    evidence.ppm ? `PPM basis:\n${evidence.ppm}` : "PPM costs require asset register and frequency confirmation.",
    "Commercial manager must confirm exclusions, assumptions, bonds, penalties, payment terms, VAT, overhead, and profit.",
  ].join("\n\n");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
