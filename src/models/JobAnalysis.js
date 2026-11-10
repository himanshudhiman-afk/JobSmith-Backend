import mongoose from "mongoose";

const analysisResultSchema = new mongoose.Schema(
  {
    overallMatchScore: { type: Number, min: 0, max: 100, required: true },
    matchedSkills: [{ type: String }],
    missingOrUnclearSkills: [{ type: String }],
    evidence: [
      {
        skillOrClaim: String,
        resumeExcerpt: String
      }
    ],
    experienceAlignment: { type: String, default: "" },
    educationAlignment: { type: String, default: "" },
    keywordCoverage: [
      {
        keyword: String,
        covered: Boolean
      }
    ],
    strengths: [{ type: String }],
    improvementAreas: [{ type: String }],
    recommendations: [{ type: String }],
    interviewTopics: [{ type: String }],
    summary: { type: String, default: "" }
  },
  { _id: false }
);

const optimizationSchema = new mongoose.Schema(
  {
    improvedSummary: { type: String, default: "" },
    improvedBullets: [
      {
        original: String,
        improved: String,
        explanation: String,
        accepted: { type: Boolean, default: false }
      }
    ],
    suggestedKeywords: [{ type: String }],
    suggestedSectionOrder: [{ type: String }],
    missingInfoRequests: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const jobAnalysisSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    jobTitle: { type: String, required: true, trim: true, maxlength: 150 },
    companyName: { type: String, trim: true, maxlength: 150, default: "" },
    jobDescription: { type: String, required: true, maxlength: 20000 },
    result: { type: analysisResultSchema, required: true },
    optimizations: [optimizationSchema]
  },
  { timestamps: true }
);

jobAnalysisSchema.index({ owner: 1, createdAt: -1 });

export const JobAnalysis = mongoose.model("JobAnalysis", jobAnalysisSchema);
