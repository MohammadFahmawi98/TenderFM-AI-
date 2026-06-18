import JSZip from "jszip";
import mammoth from "mammoth";
import type { Recommendation } from "@prisma/client";

const CHUNK_SIZE = 1800;
const CHUNK_OVERLAP = 180;

export type ExtractionResult = {
  status: "COMPLETED" | "FAILED" | "UNSUPPORTED";
  text: string;
  error?: string;
  metadata?: Record<string, unknown>;
};

export type DocumentChunkInput = {
  chunkIndex: number;
  content: string;
  tokenEstimate: number;
  pageRef?: string;
  metadata?: Record<string, unknown>;
};

export type DerivedTenderProfile = {
  name: string;
  clientName: string;
  country?: string;
  location?: string;
  category?: string;
  submissionDeadline?: Date;
  contractDuration?: string;
  estimatedValue?: number;
  confidence: number;
  signals: string[];
};

export async function extractDocumentText({
  fileName,
  mimeType,
  buffer,
}: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<ExtractionResult> {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  try {
    if (mimeType.includes("pdf") || extension === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });

      try {
        const parsed = await parser.getText();
        return completed(parsed.text, { pages: parsed.pages.length, parser: "pdf-parse" });
      } finally {
        await parser.destroy();
      }
    }

    if (
      mimeType.includes("wordprocessingml.document") ||
      mimeType.includes("msword") ||
      extension === "docx"
    ) {
      const parsed = await mammoth.extractRawText({ buffer });
      return completed(parsed.value, {
        parser: "mammoth",
        warnings: parsed.messages.map((message) => message.message),
      });
    }

    if (extension === "csv" || mimeType.includes("csv") || extension === "txt") {
      return completed(buffer.toString("utf8"), { parser: "plain-text" });
    }

    if (extension === "xlsx" || mimeType.includes("spreadsheetml.sheet")) {
      const text = await extractXlsxText(buffer);
      return completed(text, { parser: "xlsx-zip-xml" });
    }

    if (extension === "pptx" || mimeType.includes("presentationml.presentation")) {
      const text = await extractPptxText(buffer);
      return completed(text, { parser: "pptx-zip-xml" });
    }

    if (extension === "zip" || mimeType.includes("zip")) {
      const zip = await JSZip.loadAsync(buffer);
      const names = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
      return completed(`ZIP package contains:\n${names.join("\n")}`, {
        parser: "zip-manifest",
        fileCount: names.length,
      });
    }

    return {
      status: "UNSUPPORTED",
      text: "",
      error: "Text extraction is not available for this file type yet.",
      metadata: { parser: "unsupported" },
    };
  } catch (error) {
    return {
      status: "FAILED",
      text: "",
      error: error instanceof Error ? error.message : "Document extraction failed.",
    };
  }
}

export function chunkDocumentText(text: string): DocumentChunkInput[] {
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  const chunks: DocumentChunkInput[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    const content = normalized.slice(start, end).trim();

    if (content) {
      chunks.push({
        chunkIndex: chunks.length,
        content,
        tokenEstimate: estimateTokens(content),
        metadata: {
          charStart: start,
          charEnd: end,
        },
      });
    }

    if (end === normalized.length) {
      break;
    }

    start = Math.max(0, end - CHUNK_OVERLAP);
  }

  return chunks;
}

export function buildInitialTenderAnalysis({
  tenderName,
  clientName,
  combinedText,
  fileCount,
  chunkCount,
}: {
  tenderName: string;
  clientName: string;
  combinedText: string;
  fileCount: number;
  chunkCount: number;
}) {
  const text = normalizeText(combinedText);
  const excerpt = text.slice(0, 900);
  const hasValue = text.length > 0;
  const lower = text.toLowerCase();
  const detectedTerms = [
    "scope",
    "deadline",
    "compliance",
    "manpower",
    "ppm",
    "sla",
    "kpi",
    "hse",
    "insurance",
    "penalty",
    "mobilization",
  ].filter((term) => text.toLowerCase().includes(term));
  const riskTerms = ["penalty", "liquidated damages", "bid bond", "bank guarantee", "short notice", "mandatory"].filter((term) =>
    lower.includes(term),
  );
  const complianceTerms = ["iso", "hse", "insurance", "sla", "kpi", "method statement", "cv", "license"].filter((term) =>
    lower.includes(term),
  );
  const fmTerms = ["facility", "facilities", "fm", "maintenance", "cleaning", "mep", "hvac", "landscaping", "security", "pest"].filter((term) =>
    lower.includes(term),
  );
  const extractedScore = Math.min(30, Math.round(text.length / 450));
  const capabilityScore = Math.min(25, fmTerms.length * 4);
  const complianceScore = Math.min(20, complianceTerms.length * 3);
  const riskPenalty = Math.min(20, riskTerms.length * 4);
  const qualificationScore = clampScore(35 + extractedScore + capabilityScore + complianceScore - riskPenalty);
  const winProbability = clampScore(30 + Math.round(qualificationScore * 0.45) + Math.min(15, fileCount * 3) - Math.min(12, riskTerms.length * 2));
  const recommendation: Recommendation =
    qualificationScore >= 72 ? "GO" : qualificationScore >= 48 ? "GO_WITH_CONDITIONS" : hasValue ? "NO_GO" : "REVIEW_REQUIRED";
  const complexity = text.length > 180000 || riskTerms.length >= 5 ? "Extreme" : text.length > 70000 || riskTerms.length >= 3 ? "High" : text.length > 18000 ? "Medium" : "Low";
  const effort = {
    proposalHours: Math.max(6, Math.ceil(chunkCount * 0.35 + complianceTerms.length * 1.5)),
    reviewHours: Math.max(3, Math.ceil(chunkCount * 0.12 + riskTerms.length)),
    commercialHours: Math.max(4, Math.ceil(chunkCount * 0.16 + (lower.includes("boq") ? 8 : 0))),
  };
  const totalEffort = effort.proposalHours + effort.reviewHours + effort.commercialHours;

  return {
    executiveSummary: hasValue
      ? `TenderFlow extracted ${text.length.toLocaleString()} characters from ${fileCount} uploaded file(s) for ${tenderName} by ${clientName}. Initial readable content starts: ${excerpt}`
      : `Tender files were uploaded for ${tenderName} by ${clientName}, but no readable text was extracted yet.`,
    technicalSummary: hasValue
      ? `Initial document intelligence detected these tender themes: ${detectedTerms.join(", ") || "general tender requirements"}.`
      : "Technical analysis is waiting for readable RFP text.",
    commercialSummary: hasValue
      ? "Commercial analysis can now inspect extracted source chunks for pricing instructions, bid bonds, payment terms, penalties, and submission conditions."
      : "Commercial analysis is waiting for extractable files.",
    qualificationScore,
    recommendation,
    winProbability,
    scopeBreakdown: {
      complexity,
      effort: {
        ...effort,
        totalHours: totalEffort,
      },
      goNoGoReasoning: [
        { factor: "Experience Match", score: Math.min(100, 45 + fmTerms.length * 8), evidence: fmTerms },
        { factor: "Capability Match", score: Math.min(100, 45 + detectedTerms.length * 5), evidence: detectedTerms },
        { factor: "Certification Match", score: Math.min(100, 40 + complianceTerms.length * 6), evidence: complianceTerms },
        { factor: "Commercial Risk", score: Math.max(10, 85 - riskTerms.length * 12), evidence: riskTerms },
        { factor: "Timeline Risk", score: lower.includes("urgent") || lower.includes("short notice") ? 45 : 75, evidence: [] },
      ],
    },
    sourceMap: {
      fileCount,
      chunkCount,
      extractedCharacters: text.length,
      detectedTerms,
      riskTerms,
      complianceTerms,
      fmTerms,
      intelligenceMode: "document-derived initial heuristic",
      extractionMode: "server-side text extraction",
    },
  };
}

export function deriveTenderProfile({
  fileNames,
  combinedText,
}: {
  fileNames: string[];
  combinedText: string;
}): DerivedTenderProfile {
  const text = normalizeText(combinedText);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 4 && line.length <= 140)
    .slice(0, 80);
  const signals: string[] = [];
  const fallbackName = cleanFileName(fileNames[0] ?? "Tender Workspace");
  const titleLine =
    lines.find((line) => /\b(request for proposal|rfp|tender|invitation to tender|scope of work)\b/i.test(line)) ??
    lines.find((line) => /\b(facility|facilities|maintenance|cleaning|mep|hvac|landscaping|security)\b/i.test(line));
  const clientMatch = text.match(/\b(?:client|employer|authority|issued by|company|customer)\s*[:\-]\s*([^\n\r]{3,90})/i);
  const deadlineMatch = text.match(/\b(?:submission deadline|closing date|due date|bid deadline|tender closing date)\b[^\n\r]{0,80}?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i);
  const valueMatch = text.match(/\b(?:aed|dirham|dhs)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  const durationMatch = text.match(/\b(?:contract duration|duration|term)\s*[:\-]?\s*([0-9]+\s*(?:months?|years?))/i);
  const locationMatch = text.match(/\b(?:location|site)\s*[:\-]\s*([^\n\r]{3,80})/i);
  const country = /\b(united arab emirates|uae|dubai|abu dhabi|sharjah)\b/i.test(text) ? "United Arab Emirates" : undefined;
  const location = locationMatch ? cleanInlineValue(locationMatch[1]) : detectLocation(text);
  const category = detectCategory(text);
  const name = cleanInlineValue(titleLine ?? fallbackName);
  const clientName = clientMatch ? cleanInlineValue(clientMatch[1]) : "Client pending extraction";
  const submissionDeadline = deadlineMatch ? parseLooseDate(deadlineMatch[1]) : undefined;
  const estimatedValue = valueMatch ? Number(valueMatch[1].replace(/,/g, "")) : undefined;

  if (titleLine) signals.push("workspace name");
  if (clientMatch) signals.push("client");
  if (deadlineMatch && submissionDeadline) signals.push("deadline");
  if (valueMatch && estimatedValue) signals.push("estimated value");
  if (category) signals.push("category");
  if (location || country) signals.push("location");

  return {
    name,
    clientName,
    country,
    location,
    category,
    submissionDeadline,
    contractDuration: durationMatch ? cleanInlineValue(durationMatch[1]) : undefined,
    estimatedValue,
    confidence: Math.min(95, 20 + signals.length * 12 + Math.min(20, Math.floor(text.length / 5000))),
    signals,
  };
}

export function detectComplianceItems(text: string) {
  const normalized = text.toLowerCase();
  const patterns = [
    ["ISO certification requirement", ["iso 9001", "iso 14001", "iso 45001", "iso certification"]],
    ["HSE submission requirement", ["hse", "health and safety", "safety plan"]],
    ["Insurance requirement", ["insurance", "public liability", "workmen compensation"]],
    ["Bid bond or guarantee requirement", ["bid bond", "bank guarantee", "tender bond"]],
    ["Site visit requirement", ["site visit", "site inspection"]],
    ["SLA or KPI requirement", ["sla", "service level", "kpi"]],
  ] as const;

  return patterns
    .filter(([, terms]) => terms.some((term) => normalized.includes(term)))
    .map(([requirement]) => ({
      requirement,
      status: "PARTIAL" as const,
      priority: "HIGH" as const,
      action: "Review extracted source text and attach company evidence.",
      confidence: 65,
      source: "Initial extraction heuristic",
    }));
}

export function detectRiskItems(text: string) {
  const normalized = text.toLowerCase();
  const risks = [
    ["COMMERCIAL", "Penalty exposure", ["penalty", "liquidated damages"]],
    ["FINANCIAL", "Guarantee or bond exposure", ["bank guarantee", "bid bond", "performance bond"]],
    ["OPERATIONAL", "Mobilization pressure", ["mobilization", "commencement date"]],
    ["COMPLIANCE", "Mandatory compliance evidence", ["mandatory", "shall submit", "non-compliance"]],
  ] as const;

  return risks
    .filter(([, , terms]) => terms.some((term) => normalized.includes(term)))
    .map(([category, title]) => ({
      category,
      title,
      description: "Detected in uploaded tender text during initial extraction.",
      score: 3,
      mitigation: "Assign agent review and confirm source clause before bid approval.",
      source: "Initial extraction heuristic",
    }));
}

async function extractXlsxText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const sharedStrings = await readSharedStrings(zip);
  const sheetNames = Object.keys(zip.files)
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort();
  const sheets = await Promise.all(
    sheetNames.map(async (name, index) => {
      const xml = await zip.file(name)?.async("text");
      return xml ? `Sheet ${index + 1}\n${readWorksheet(xml, sharedStrings)}` : "";
    }),
  );

  return sheets.filter(Boolean).join("\n\n");
}

async function extractPptxText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const slides = await Promise.all(
    slideNames.map(async (name, index) => {
      const xml = await zip.file(name)?.async("text");
      const text = xml ? readXmlTextNodes(xml) : "";
      return text ? `Slide ${index + 1}\n${text}` : "";
    }),
  );

  return slides.filter(Boolean).join("\n\n");
}

async function readSharedStrings(zip: JSZip) {
  const xml = await zip.file("xl/sharedStrings.xml")?.async("text");

  if (!xml) {
    return [];
  }

  return [...xml.matchAll(/<si[\s\S]*?<\/si>/g)].map((match) => readXmlTextNodes(match[0]));
}

function readWorksheet(xml: string, sharedStrings: string[]) {
  return [...xml.matchAll(/<row[\s\S]*?<\/row>/g)]
    .map((rowMatch) => {
      return [...rowMatch[0].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)]
        .map((cellMatch) => {
          const attrs = cellMatch[1];
          const body = cellMatch[2];
          const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];

          if (attrs.includes('t="s"') && value) {
            return sharedStrings[Number(value)] ?? "";
          }

          if (attrs.includes('t="inlineStr"')) {
            return readXmlTextNodes(body);
          }

          return decodeXml(value ?? "");
        })
        .filter(Boolean)
        .join(" | ");
    })
    .filter(Boolean)
    .join("\n");
}

function readXmlTextNodes(xml: string) {
  return [...xml.matchAll(/<[^:>]*:?t[^>]*>([\s\S]*?)<\/[^:>]*:?t>/g)]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean)
    .join(" ");
}

function completed(text: string, metadata: Record<string, unknown>): ExtractionResult {
  const normalized = normalizeText(text);

  return {
    status: normalized ? "COMPLETED" : "UNSUPPORTED",
    text: normalized,
    error: normalized ? undefined : "No readable text was found in this file.",
    metadata,
  };
}

function normalizeText(text: string) {
  return text.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cleanFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanInlineValue(value: string) {
  return value.replace(/\s+/g, " ").replace(/[|•]+$/g, "").trim().slice(0, 120);
}

function detectCategory(text: string) {
  const lower = text.toLowerCase();
  const categories = [
    ["Total Facilities Management", ["total facilities management", "tfm"]],
    ["HVAC Maintenance", ["hvac", "chiller", "air conditioning"]],
    ["MEP Maintenance", ["mep", "mechanical electrical plumbing"]],
    ["Cleaning Services", ["cleaning", "janitorial"]],
    ["Landscaping", ["landscaping", "irrigation"]],
    ["Security Services", ["security guard", "security services"]],
    ["Pest Control", ["pest control"]],
    ["Waste Management", ["waste management"]],
    ["Hard FM", ["hard fm"]],
    ["Soft FM", ["soft fm"]],
  ] as const;

  return categories.find(([, terms]) => terms.some((term) => lower.includes(term)))?.[0];
}

function detectLocation(text: string) {
  const locations = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
  return locations.find((location) => new RegExp(`\\b${location}\\b`, "i").test(text));
}

function parseLooseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}
