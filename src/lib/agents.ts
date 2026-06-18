export type TenderAgent = {
  name: string;
  shortName: string;
  status: "ready" | "running" | "waiting" | "review";
  progress: number;
  currentTask: string;
  deliverables: string[];
};

export const tenderAgents: TenderAgent[] = [
  {
    name: "Qualification Agent",
    shortName: "Qualification",
    status: "ready",
    progress: 100,
    currentTask: "Evaluates go/no-go fit, tender fit, and bid probability.",
    deliverables: ["Qualification Summary", "Go/No-Go Recommendation"],
  },
  {
    name: "Compliance Agent",
    shortName: "Compliance",
    status: "running",
    progress: 68,
    currentTask: "Maps mandatory requirements, missing documents, and submission conditions.",
    deliverables: ["Compliance Matrix", "Missing Documents List"],
  },
  {
    name: "Technical Proposal Agent",
    shortName: "Technical",
    status: "running",
    progress: 54,
    currentTask: "Drafts methodology, scope response, mobilization, and service delivery narrative.",
    deliverables: ["Technical Proposal", "Method Statements"],
  },
  {
    name: "Commercial Agent",
    shortName: "Commercial",
    status: "waiting",
    progress: 22,
    currentTask: "Prepares pricing model, BOQ structure, assumptions, and commercial clarifications.",
    deliverables: ["Commercial Proposal", "Excel Cost Sheet"],
  },
  {
    name: "Manpower Agent",
    shortName: "Manpower",
    status: "ready",
    progress: 46,
    currentTask: "Builds role structure, staffing levels, shift coverage, and monthly cost inputs.",
    deliverables: ["Manpower Plan", "Org Chart Inputs"],
  },
  {
    name: "PPM Agent",
    shortName: "PPM",
    status: "waiting",
    progress: 35,
    currentTask: "Creates preventive maintenance schedule from asset and scope requirements.",
    deliverables: ["PPM Schedule", "Maintenance Calendar"],
  },
  {
    name: "HSE Agent",
    shortName: "HSE",
    status: "ready",
    progress: 42,
    currentTask: "Builds HSE plan, risk controls, and required safety evidence.",
    deliverables: ["HSE Plan", "Safety Compliance Notes"],
  },
  {
    name: "Risk Agent",
    shortName: "Risk",
    status: "running",
    progress: 61,
    currentTask: "Finds commercial, compliance, financial, technical, and operational bid risks.",
    deliverables: ["Risk Register", "Mitigation Plan"],
  },
  {
    name: "Presentation Agent",
    shortName: "Presentation",
    status: "waiting",
    progress: 18,
    currentTask: "Prepares executive presentation structure and visual bid story.",
    deliverables: ["Executive Presentation", "Bid Storyline"],
  },
  {
    name: "Executive Review Agent",
    shortName: "Executive",
    status: "review",
    progress: 30,
    currentTask: "Checks readiness, executive narrative, risk posture, and final package quality.",
    deliverables: ["Executive Summary", "Submission Readiness Check"],
  },
];

export const requiredSettings = [
  {
    title: "AI Provider Configuration",
    body: "OpenAI, Claude, Gemini, routing rules, model fallback, rewrite controls, and agent permissions.",
  },
  {
    title: "Agent Orchestration",
    body: "Qualification, compliance, technical, commercial, manpower, PPM, HSE, risk, presentation, and executive agents.",
  },
  {
    title: "Document Generation",
    body: "DOCX, XLSX, PPTX, PDF, version history, approval status, section regeneration, and final lock rules.",
  },
  {
    title: "Knowledge Base",
    body: "Company profile, certifications, staff, equipment, suppliers, projects, references, templates, and HSE library.",
  },
  {
    title: "Storage & Extraction",
    body: "Supabase storage, file categories, extraction status, OCR roadmap, chunking, and private file handling.",
  },
  {
    title: "Team Roles",
    body: "Admin, Bid Manager, Commercial Manager, Operations Manager, Reviewer, and Viewer permissions.",
  },
  {
    title: "Collaboration",
    body: "Comments, mentions, document review, approvals, activity logs, notifications, and version control.",
  },
  {
    title: "Integrations",
    body: "Google Drive, Microsoft 365, Gmail, Outlook, Slack, Microsoft Teams, Calendar, Supabase, and OpenAI.",
  },
  {
    title: "Security & Governance",
    body: "Tenant isolation, RLS, audit logs, rate limits, SSO/SAML readiness, data retention, and export controls.",
  },
  {
    title: "Final Export Package",
    body: "ZIP, PDF, DOCX, XLSX, PPTX, attachments, submission checklist, and readiness gate.",
  },
];
