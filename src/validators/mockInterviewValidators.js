import { z } from "zod";

export const createMockInterviewSchema = z.object({
  jobAnalysisId: z.string().optional(),
  jobTitle: z.string().trim().min(1).max(150),
  category: z
    .enum(["technical", "programming", "project", "system-design", "behavioral", "hr", "mixed"])
    .default("mixed"),
  maxQuestions: z.number().int().min(1).max(15).default(5),
  firstQuestion: z.object({
    questionText: z.string().min(1).max(1000),
    category: z.string().max(50).default("technical")
  }),
  consentToStore: z.boolean().default(false)
});

const feedbackSchema = z.object({
  technicalCorrectness: z.number().min(0).max(100).optional(),
  completeness: z.number().min(0).max(100).optional(),
  clarity: z.number().min(0).max(100).optional(),
  relevance: z.number().min(0).max(100).optional(),
  communicationQuality: z.number().min(0).max(100).optional(),
  suggestedImprovements: z.array(z.string().max(500)).max(20).default([]),
  followUpQuestion: z.string().max(1000).default(""),
  score: z.number().min(0).max(100).optional()
});

export const submitAnswerSchema = z.object({
  answer: z.string().trim().min(1).max(5000),
  feedback: feedbackSchema
});

export const nextQuestionSchema = z.object({
  questionText: z.string().min(1).max(1000),
  category: z.string().max(50).default("technical")
});

export const finishMockInterviewSchema = z.object({
  finalReport: z.object({
    overallScore: z.number().min(0).max(100).optional(),
    strengths: z.array(z.string().max(300)).max(20).default([]),
    weaknesses: z.array(z.string().max(300)).max(20).default([]),
    recommendations: z.array(z.string().max(500)).max(20).default([]),
    summary: z.string().max(3000).default("")
  })
});
