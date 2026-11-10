import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "../app.js";
import { closePdfBrowser } from "../services/pdfService.js";

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

describe("resume PDF export", () => {
  afterAll(async () => {
    await closePdfBrowser();
  });

  it("exports a valid PDF for the resume owner only", async () => {
    const tokenA = await registerUser();
    const tokenB = await registerUser();

    const upload = await request(app)
      .post("/api/v1/resumes")
      .set("Authorization", `Bearer ${tokenA}`)
      .attach("resume", PDF_FIXTURE, { contentType: "application/pdf" });
    const resumeId = upload.body.data.resume._id;

    await request(app)
      .patch(`/api/v1/resumes/${resumeId}/structured-content`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ structuredContent: { fullName: "Ada Lovelace", summary: "Backend engineer." } });

    const exportRes = await request(app)
      .post(`/api/v1/resumes/${resumeId}/export-pdf`)
      .set("Authorization", `Bearer ${tokenA}`)
      .buffer(true)
      .parse((res, callback) => {
        res.setEncoding("binary");
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => callback(null, Buffer.from(data, "binary")));
      });

    expect(exportRes.status).toBe(200);
    expect(exportRes.headers["content-type"]).toBe("application/pdf");
    expect(exportRes.body.slice(0, 4).toString()).toBe("%PDF");

    const exportAsOther = await request(app)
      .post(`/api/v1/resumes/${resumeId}/export-pdf`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(exportAsOther.status).toBe(404);
  }, 30000);
});
