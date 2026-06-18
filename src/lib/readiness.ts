type ReadinessTender = {
  files?: Array<{ extractionStatus: string }>;
  generatedFiles?: Array<{ kind?: string; reviewStatus: string }>;
  workspaceTasks?: Array<{ status: string }>;
  complianceItems?: Array<{ status: string }>;
};

export type ReadinessBreakdown = {
  score: number;
  compliance: number;
  technicalProposal: number;
  commercialProposal: number;
  approvals: number;
  attachments: number;
};

export function calculateSubmissionReadiness(tender: ReadinessTender): ReadinessBreakdown {
  const files = tender.files ?? [];
  const generatedFiles = tender.generatedFiles ?? [];
  const tasks = tender.workspaceTasks ?? [];
  const complianceItems = tender.complianceItems ?? [];
  const extractedFiles = files.filter((file) => file.extractionStatus === "COMPLETED").length;
  const finalOrApproved = generatedFiles.filter((file) => ["APPROVED", "FINAL"].includes(file.reviewStatus)).length;
  const completedTasks = tasks.filter((task) => ["COMPLETED", "APPROVED"].includes(task.status)).length;
  const resolvedCompliance = complianceItems.filter((item) => ["COMPLIANT", "PARTIAL"].includes(item.status)).length;

  const attachments = files.length === 0 ? 0 : Math.round((extractedFiles / files.length) * 100);
  const compliance =
    complianceItems.length === 0 ? (extractedFiles > 0 ? 35 : 0) : Math.round((resolvedCompliance / complianceItems.length) * 100);
  const technicalProposal = scoreDocument(generatedFiles, ["TECHNICAL_PROPOSAL", "METHOD_STATEMENT"]);
  const commercialProposal = scoreDocument(generatedFiles, ["COMMERCIAL_PROPOSAL", "EXCEL_COST_SHEET"]);
  const approvals =
    generatedFiles.length === 0 && tasks.length === 0
      ? 0
      : Math.round(((finalOrApproved + completedTasks) / Math.max(1, generatedFiles.length + tasks.length)) * 100);
  const score = Math.round(
    compliance * 0.25 + technicalProposal * 0.2 + commercialProposal * 0.2 + approvals * 0.2 + attachments * 0.15,
  );

  return {
    score,
    compliance,
    technicalProposal,
    commercialProposal,
    approvals,
    attachments,
  };
}

function scoreDocument(generatedFiles: Array<{ kind?: string; reviewStatus: string }>, targetKinds: string[]) {
  const matches = generatedFiles.filter((file) => file.kind && targetKinds.includes(file.kind));

  if (matches.length === 0) {
    return 0;
  }

  return Math.round(
    (matches.reduce((total, file) => total + (file.reviewStatus === "FINAL" ? 100 : file.reviewStatus === "APPROVED" ? 85 : 45), 0) /
      matches.length),
  );
}
