import crypto from "crypto";
import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectFileKind } from "../middleware/upload.js";
import { extractResumeText, guessContactInfo } from "../services/resumeParserService.js";

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("No file was uploaded");
  }

  const kind = detectFileKind(req.file.buffer);
  if (!kind) {
    throw ApiError.badRequest("The uploaded file is not a valid PDF or DOCX document");
  }

  const extractedText = await extractResumeText(req.file.buffer, kind);
  const contact = guessContactInfo(extractedText);

  const storedFilename = `${crypto.randomUUID()}.${kind}`;

  const resume = await Resume.create({
    owner: req.user._id,
    title: req.file.originalname.replace(/\.[^.]+$/, "") || "My Resume",
    originalFilename: req.file.originalname.slice(0, 200),
    storedFilename,
    mimeType: req.file.mimetype,
    fileSizeBytes: req.file.size,
    extractedText,
    structuredContent: {
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone
    },
    source: "upload"
  });

  res.status(201).json({ success: true, data: { resume } });
});

export const listResumes = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const [resumes, total] = await Promise.all([
    Resume.find({ owner: req.user._id })
      .select("-extractedText")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Resume.countDocuments({ owner: req.user._id })
  ]);

  res.json({
    success: true,
    data: { resumes, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  });
});

async function findOwnedResume(id, ownerId) {
  const resume = await Resume.findOne({ _id: id, owner: ownerId });
  if (!resume) throw ApiError.notFound("Resume not found");
  return resume;
}

export const getResume = asyncHandler(async (req, res) => {
  const resume = await findOwnedResume(req.params.id, req.user._id);
  res.json({ success: true, data: { resume } });
});

export const updateResume = asyncHandler(async (req, res) => {
  const resume = await findOwnedResume(req.params.id, req.user._id);
  if (req.body.title !== undefined) resume.title = req.body.title;
  await resume.save();
  res.json({ success: true, data: { resume } });
});

export const updateStructuredContent = asyncHandler(async (req, res) => {
  const resume = await findOwnedResume(req.params.id, req.user._id);
  resume.structuredContent = req.body.structuredContent;
  await resume.save();
  res.json({ success: true, data: { resume } });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await findOwnedResume(req.params.id, req.user._id);
  await resume.deleteOne();
  res.json({ success: true, data: null });
});
