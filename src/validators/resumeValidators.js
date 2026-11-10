import { z } from "zod";

const linkSchema = z.object({ label: z.string().max(60).optional(), url: z.string().max(300).optional() });

const experienceSchema = z.object({
  title: z.string().max(150).optional().default(""),
  company: z.string().max(150).optional().default(""),
  location: z.string().max(150).optional().default(""),
  startDate: z.string().max(30).optional().default(""),
  endDate: z.string().max(30).optional().default(""),
  current: z.boolean().optional().default(false),
  bullets: z.array(z.string().max(500)).max(20).optional().default([])
});

const educationSchema = z.object({
  institution: z.string().max(150).optional().default(""),
  degree: z.string().max(150).optional().default(""),
  field: z.string().max(150).optional().default(""),
  startDate: z.string().max(30).optional().default(""),
  endDate: z.string().max(30).optional().default("")
});

const projectSchema = z.object({
  name: z.string().max(150).optional().default(""),
  description: z.string().max(1000).optional().default(""),
  bullets: z.array(z.string().max(500)).max(20).optional().default([]),
  technologies: z.array(z.string().max(60)).max(30).optional().default([]),
  url: z.string().max(300).optional().default("")
});

const certificationSchema = z.object({
  name: z.string().max(150).optional().default(""),
  issuer: z.string().max(150).optional().default(""),
  date: z.string().max(30).optional().default("")
});

export const structuredContentSchema = z.object({
  fullName: z.string().max(150).optional().default(""),
  email: z.string().max(150).optional().default(""),
  phone: z.string().max(50).optional().default(""),
  location: z.string().max(150).optional().default(""),
  links: z.array(linkSchema).max(10).optional().default([]),
  summary: z.string().max(2000).optional().default(""),
  skills: z.array(z.string().max(80)).max(100).optional().default([]),
  experience: z.array(experienceSchema).max(30).optional().default([]),
  education: z.array(educationSchema).max(20).optional().default([]),
  projects: z.array(projectSchema).max(30).optional().default([]),
  certifications: z.array(certificationSchema).max(30).optional().default([])
});

export const updateStructuredContentSchema = z.object({
  structuredContent: structuredContentSchema
});

export const updateResumeSchema = z.object({
  title: z.string().trim().min(1).max(150).optional()
});
