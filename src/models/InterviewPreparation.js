import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: {
    type: String,
    enum: ["technical", "programming", "project", "system-design", "behavioral", "hr"],
    required: true
  },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  whyRelevant: { type: String, default: "" },
  conceptsToRevise: [{ type: String }],
  answerGuidance: { type: String, default: "" },
  followUps: [{ type: String }],
  completed: { type: Boolean, default: false }
});

const studyPlanTaskSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  estimatedMinutes: { type: Number, default: 30 },
  completed: { type: Boolean, default: false }
});

const interviewPreparationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: "JobAnalysis" },
    jobTitle: { type: String, required: true, trim: true },
    questions: [questionSchema],
    studyPlan: {
      availableDays: { type: Number, default: 7 },
      targetInterviewDate: { type: Date },
      tasks: [studyPlanTaskSchema]
    }
  },
  { timestamps: true }
);

interviewPreparationSchema.index({ owner: 1, createdAt: -1 });

export const InterviewPreparation = mongoose.model("InterviewPreparation", interviewPreparationSchema);
