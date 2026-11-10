import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "../app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_FIXTURE = path.join(__dirname, "fixtures", "test-resume.pdf");
const app = createApp();

function uniqueEmail() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
}

async function registerUser() {
  const email = uniqueEmail();
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Test User", email, password: "password123" });
  return res.body.data.token;
}

async function uploadResume(token) {
  const res = await request(app)
    .post("/api/v1/resumes")
    .set("Authorization", `Bearer ${token}`)
    .attach("resume", PDF_FIXTURE, { contentType: "application/pdf" });
  return res.body.data.resume._id;
}

const validResult = {
  overallMatchScore: 78,
  matchedSkills: ["JavaScript", "Node.js"],
  missingOrUnclearSkills: ["Kubernetes"],
  evidence: [{ skillOrClaim: "Node.js", resumeExcerpt: "Built scalable backend systems" }],
  experienceAlignment: "Strong backend alignment.",
  educationAlignment: "Not specified.",
  keywordCoverage: [{ keyword: "React", covered: true }],
  strengths: ["Backend systems experience"],
  improvementAreas: ["No cloud infra experience listed"],
  recommendations: ["Add a cloud/DevOps project"],
  interviewTopics: ["System design"],
  summary: "Good overall fit with some infra gaps."
};

describe("job analysis", () => {
  it("creates an analysis for the authenticated user's own resume", async () => {
    const token = await registerUser();
    const resumeId = await uploadResume(token);

    const res = await request(app)
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${token}`)
      .send({ resumeId, jobTitle: "Backend Engineer", jobDescription: "We need a Node.js backend engineer with strong system design skills.", result: validResult });

    expect(res.status).toBe(201);
    expect(res.body.data.analysis.result.overallMatchScore).toBe(78);
  });

  it("rejects a malformed AI result (score out of range)", async () => {
    const token = await registerUser();
    const resumeId = await uploadResume(token);

    const res = await request(app)
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resumeId,
        jobTitle: "Backend Engineer",
        jobDescription: "We need a Node.js backend engineer with strong system design skills.",
        result: { ...validResult, overallMatchScore: 999 }
      });

    expect(res.status).toBe(400);
  });

  it("rejects an analysis referencing a resume owned by another user", async () => {
    const tokenA = await registerUser();
    const tokenB = await registerUser();
    const resumeIdA = await uploadResume(tokenA);

    const res = await request(app)
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        resumeId: resumeIdA,
        jobTitle: "Backend Engineer",
        jobDescription: "We need a Node.js backend engineer with strong system design skills.",
        result: validResult
      });

    expect(res.status).toBe(404);
  });

  it("computes dashboard summary (average score + top skill gaps) from stored analyses", async () => {
    const token = await registerUser();
    const resumeId = await uploadResume(token);

    await request(app)
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resumeId,
        jobTitle: "Backend Engineer",
        jobDescription: "We need a Node.js backend engineer with strong system design skills.",
        result: { ...validResult, overallMatchScore: 80, missingOrUnclearSkills: ["Kubernetes", "AWS", "kubernetes"] }
      });
    await request(app)
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resumeId,
        jobTitle: "Platform Engineer",
        jobDescription: "We need a platform engineer with strong system design skills.",
        result: { ...validResult, overallMatchScore: 60, missingOrUnclearSkills: ["Kubernetes"] }
      });

    const res = await request(app).get("/api/v1/dashboard/summary").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totals.analyses).toBe(2);
    expect(res.body.data.averageMatchScore).toBe(70);
    expect(res.body.data.topSkillGaps[0]).toEqual({ skill: "kubernetes", count: 2 });
  });
});
