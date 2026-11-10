import { JobAnalysis } from "../models/JobAnalysis.js";
import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAnalysis = asyncHandler(async (req, res) => {
  const { resumeId, jobTitle, companyName, jobDescription, result } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, owner: req.user._id });
  if (!resume) throw ApiError.notFound("Resume not found");

  const analysis = await JobAnalysis.create({
    owner: req.user._id,
    resume: resume._id,
    jobTitle,
    companyName,
    jobDescription,
    result
  });

  res.status(201).json({ success: true, data: { analysis } });
});

export const listAnalyses = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const [analyses, total] = await Promise.all([
    JobAnalysis.find({ owner: req.user._id })
      .select("-jobDescription -optimizations")
      .populate("resume", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    JobAnalysis.countDocuments({ owner: req.user._id })
  ]);

  res.json({
    success: true,
    data: { analyses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  });
});

async function findOwnedAnalysis(id, ownerId) {
  const analysis = await JobAnalysis.findOne({ _id: id, owner: ownerId }).populate("resume", "title");
  if (!analysis) throw ApiError.notFound("Analysis not found");
  return analysis;
}

export const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await findOwnedAnalysis(req.params.id, req.user._id);
  res.json({ success: true, data: { analysis } });
});

export const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await findOwnedAnalysis(req.params.id, req.user._id);
  await analysis.deleteOne();
  res.json({ success: true, data: null });
});

export const addOptimization = asyncHandler(async (req, res) => {
  const analysis = await findOwnedAnalysis(req.params.id, req.user._id);
  analysis.optimizations.push(req.body);
  await analysis.save();
  res.status(201).json({ success: true, data: { analysis } });
});
