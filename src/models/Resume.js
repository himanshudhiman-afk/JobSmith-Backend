import mongoose from "mongoose";

const structuredContentSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    links: [{ label: String, url: String }],
    summary: { type: String, default: "" },
    skills: [{ type: String, trim: true }],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: { type: Boolean, default: false },
        bullets: [String]
      }
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: String,
        endDate: String
      }
    ],
    projects: [
      {
        name: String,
        description: String,
        bullets: [String],
        technologies: [String],
        url: String
      }
    ],
    certifications: [{ name: String, issuer: String, date: String }]
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, trim: true, maxlength: 150, default: "My Resume" },
    originalFilename: { type: String, required: true },
    storedFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    extractedText: { type: String, required: true, maxlength: 50000 },
    structuredContent: { type: structuredContentSchema, default: () => ({}) },
    source: { type: String, enum: ["upload", "manual", "builder"], default: "upload" }
  },
  { timestamps: true }
);

resumeSchema.index({ owner: 1, createdAt: -1 });

export const Resume = mongoose.model("Resume", resumeSchema);
