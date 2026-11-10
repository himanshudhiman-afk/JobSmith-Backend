import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "../app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_FIXTURE = path.join(__dirname, "fixtures", "test-resume.pdf");
const TXT_FIXTURE = path.join(__dirname, "fixtures", "not-a-pdf.txt");

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

describe("resume upload and ownership", () => {
  it("uploads a valid PDF and extracts readable text", async () => {
    const token = await registerUser();

    const res = await request(app)
      .post("/api/v1/resumes")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", PDF_FIXTURE, { contentType: "application/pdf" });

    expect(res.status).toBe(201);
    expect(res.body.data.resume.extractedText).toContain("Ada Lovelace");
    expect(res.body.data.resume.structuredContent.email).toBe("ada.lovelace@example.com");
  });

  it("rejects a file whose content does not match a PDF/DOCX signature even if named .pdf", async () => {
    const token = await registerUser();

    const res = await request(app)
      .post("/api/v1/resumes")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", TXT_FIXTURE, { filename: "resume.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(400);
  });

  it("rejects an unsupported mime type at the multer layer", async () => {
    const token = await registerUser();

    const res = await request(app)
      .post("/api/v1/resumes")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", TXT_FIXTURE, { filename: "resume.txt", contentType: "text/plain" });

    expect(res.status).toBe(400);
  });

  it("requires authentication to upload", async () => {
    const res = await request(app).post("/api/v1/resumes");
    expect(res.status).toBe(401);
  });

  it("isolates resumes between users — one user cannot read or delete another's resume", async () => {
    const tokenA = await registerUser();
    const tokenB = await registerUser();

    const upload = await request(app)
      .post("/api/v1/resumes")
      .set("Authorization", `Bearer ${tokenA}`)
      .attach("resume", PDF_FIXTURE, { contentType: "application/pdf" });

    const resumeId = upload.body.data.resume._id;

    const getAsOwner = await request(app)
      .get(`/api/v1/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(getAsOwner.status).toBe(200);

    const getAsOther = await request(app)
      .get(`/api/v1/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(getAsOther.status).toBe(404);

    const deleteAsOther = await request(app)
      .delete(`/api/v1/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(deleteAsOther.status).toBe(404);

    const listAsOther = await request(app).get("/api/v1/resumes").set("Authorization", `Bearer ${tokenB}`);
    expect(listAsOther.body.data.resumes).toHaveLength(0);
  });

  it("deletes a resume permanently", async () => {
    const token = await registerUser();
    const upload = await request(app)
      .post("/api/v1/resumes")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", PDF_FIXTURE, { contentType: "application/pdf" });
    const resumeId = upload.body.data.resume._id;

    const del = await request(app)
      .delete(`/api/v1/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/v1/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(404);
  });
});
