import { z } from "zod";

export const analysisResultSchema = z.object({
  overallMatchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string().max(120)).max(100).default([]),
  missingOrUnclearSkills: z.array(z.string().max(120)).max(100).default([]),
  evidence: z
    .array(z.object({ skillOrClaim: z.string().max(200), resumeExcerpt: z.string().max(500) }))
    .max(50)
    .default([]),
  experienceAlignment: z.string().max(3000).default(""),
  educationAlignment: z.string().max(3000).default(""),
  keywordCoverage: z
    .array(z.object({ keyword: z.string().max(80), covered: z.boolean() }))
    .max(100)
    .default([]),
  strengths: z.array(z.string().max(300)).max(30).default([]),
  improvementAreas: z.array(z.string().max(300)).max(30).default([]),
  recommendations: z.array(z.string().max(500)).max(30).default([]),
  interviewTopics: z.array(z.string().max(150)).max(30).default([]),
  summary: z.string().max(3000).default("")
});

export const createAnalysisSchema = z.object({
  resumeId: z.string().min(1),
  jobTitle: z.string().trim().min(1).max(150),
  companyName: z.string().trim().max(150).optional().default(""),
  jobDescription: z.string().trim().min(20).max(20000),
  result: analysisResultSchema
});

export const createOptimizationSchema = z.object({
  improvedSummary: z.string().max(2000).default(""),
  improvedBullets: z
    .array(
      z.object({
        original: z.string().max(500).default(""),
        improved: z.string().max(500).default(""),
        explanation: z.string().max(500).default(""),
        accepted: z.boolean().default(false)
      })
    )
    .max(50)
    .default([]),
  suggestedKeywords: z.array(z.string().max(80)).max(50).default([]),
  suggestedSectionOrder: z.array(z.string().max(60)).max(20).default([]),
  missingInfoRequests: z.array(z.string().max(300)).max(20).default([])
});
