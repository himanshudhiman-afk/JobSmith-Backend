import { z } from "zod";

export const questionSchema = z.object({
  questionText: z.string().min(1).max(1000),
  category: z.enum(["technical", "programming", "project", "system-design", "behavioral", "hr"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  whyRelevant: z.string().max(500).default(""),
  conceptsToRevise: z.array(z.string().max(100)).max(20).default([]),
  answerGuidance: z.string().max(1000).default(""),
  followUps: z.array(z.string().max(300)).max(10).default([])
});

export const studyPlanTaskSchema = z.object({
  day: z.number().int().min(1).max(365),
  title: z.string().min(1).max(150),
  description: z.string().max(500).default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  estimatedMinutes: z.number().int().min(5).max(600).default(30)
});

export const createInterviewPrepSchema = z.object({
  jobAnalysisId: z.string().optional(),
  jobTitle: z.string().trim().min(1).max(150),
  questions: z.array(questionSchema).min(1).max(50),
  studyPlan: z
    .object({
      availableDays: z.number().int().min(1).max(365).default(7),
      targetInterviewDate: z.string().optional(),
      tasks: z.array(studyPlanTaskSchema).max(200).default([])
    })
    .optional()
});

export const toggleQuestionSchema = z.object({
  completed: z.boolean()
});

export const toggleTaskSchema = z.object({
  completed: z.boolean()
});
