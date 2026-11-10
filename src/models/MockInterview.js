import mongoose from "mongoose";

const turnSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: { type: String, default: "technical" },
  userAnswer: { type: String, default: "" },
  feedback: {
    technicalCorrectness: { type: Number, min: 0, max: 100 },
    completeness: { type: Number, min: 0, max: 100 },
    clarity: { type: Number, min: 0, max: 100 },
    relevance: { type: Number, min: 0, max: 100 },
    communicationQuality: { type: Number, min: 0, max: 100 },
    suggestedImprovements: [{ type: String }],
    followUpQuestion: { type: String, default: "" },
    score: { type: Number, min: 0, max: 100 }
  },
  answeredAt: { type: Date }
});

const finalReportSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, min: 0, max: 100 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    summary: { type: String, default: "" }
  },
  { _id: false }
);

const mockInterviewSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: "JobAnalysis" },
    jobTitle: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["technical", "programming", "project", "system-design", "behavioral", "hr", "mixed"],
      default: "mixed"
    },
    maxQuestions: { type: Number, default: 5, min: 1, max: 15 },
    status: { type: String, enum: ["in-progress", "completed", "abandoned"], default: "in-progress" },
    turns: [turnSchema],
    finalReport: finalReportSchema,
    consentToStore: { type: Boolean, default: false }
  },
  { timestamps: true }
);

mockInterviewSchema.index({ owner: 1, createdAt: -1 });

export const MockInterview = mongoose.model("MockInterview", mockInterviewSchema);
