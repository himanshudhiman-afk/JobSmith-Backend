import multer from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const storage = multer.memoryStorage();

export const resumeUpload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only PDF and DOCX resumes are supported"));
      return;
    }
    cb(null, true);
  }
}).single("resume");

const PDF_MAGIC = Buffer.from("%PDF");
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

export function detectFileKind(buffer) {
  if (buffer.subarray(0, 4).equals(PDF_MAGIC)) return "pdf";
  if (buffer.subarray(0, 4).equals(ZIP_MAGIC)) return "docx";
  return null;
}
