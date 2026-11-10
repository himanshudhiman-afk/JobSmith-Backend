import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import { ApiError } from "../utils/ApiError.js";

const MAX_EXTRACTED_CHARS = 50000;
const MIN_EXTRACTED_CHARS = 20;

export async function extractResumeText(buffer, kind) {
  let rawText = "";

  try {
    if (kind === "pdf") {
      const parsed = await pdfParse(buffer);
      rawText = parsed.text || "";
    } else if (kind === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || "";
    } else {
      throw ApiError.badRequest("Unsupported or unrecognized file format");
    }
  } catch (err) {
    if (err.isApiError) throw err;
    throw ApiError.badRequest(
      "Could not read this document. It may be encrypted, corrupted, or not a valid PDF/DOCX file."
    );
  }

  const cleaned = rawText.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();

  if (cleaned.length < MIN_EXTRACTED_CHARS) {
    throw ApiError.badRequest(
      "No readable text was found in this document. Scanned image-only PDFs are not supported yet."
    );
  }

  return cleaned.slice(0, MAX_EXTRACTED_CHARS);
}

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;

export function guessContactInfo(text) {
  const emailMatch = text.match(EMAIL_RE);
  const phoneMatch = text.match(PHONE_RE);
  const firstLine = text.split("\n").map((l) => l.trim()).filter(Boolean)[0] || "";

  return {
    fullName: firstLine.length <= 60 ? firstLine : "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0].trim() : ""
  };
}
