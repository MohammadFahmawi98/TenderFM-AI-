import JSZip from "jszip";
import mammoth from "mammoth";

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
    sourceMap: {
      fileCount,
      chunkCount,
      extractedCharacters: text.length,
      detectedTerms,
      extractionMode: "server-side text extraction",
    },
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

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}
