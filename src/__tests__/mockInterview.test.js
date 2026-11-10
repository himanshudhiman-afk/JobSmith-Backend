import request from "supertest";
import { createApp } from "../app.js";

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

describe("mock interview progression", () => {
  it("creates, answers, advances, and finishes a mock interview (stored when consent given)", async () => {
    const token = await registerUser();

    const create = await request(app)
      .post("/api/v1/mock-interviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobTitle: "Backend Engineer",
        category: "technical",
        maxQuestions: 2,
        firstQuestion: { questionText: "Explain REST vs RPC.", category: "technical" },
        consentToStore: true
      });
    expect(create.status).toBe(201);
    const id = create.body.data.mockInterview._id;
    expect(create.body.data.mockInterview.turns).toHaveLength(1);

    const answer = await request(app)
      .post(`/api/v1/mock-interviews/${id}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        answer: "REST is resource-oriented over HTTP; RPC calls remote procedures directly.",
        feedback: { score: 75, suggestedImprovements: ["Mention idempotency"], followUpQuestion: "What about gRPC?" }
      });
    expect(answer.status).toBe(200);
    expect(answer.body.data.mockInterview.turns[0].userAnswer).toContain("REST");

    const doubleAnswer = await request(app)
      .post(`/api/v1/mock-interviews/${id}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answer: "Another answer", feedback: {} });
    expect(doubleAnswer.status).toBe(400);

    const next = await request(app)
      .post(`/api/v1/mock-interviews/${id}/next-question`)
      .set("Authorization", `Bearer ${token}`)
      .send({ questionText: "What about gRPC?", category: "technical" });
    expect(next.status).toBe(201);
    expect(next.body.data.mockInterview.turns).toHaveLength(2);

    const finish = await request(app)
      .post(`/api/v1/mock-interviews/${id}/finish`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        finalReport: {
          overallScore: 80,
          strengths: ["Clear communication"],
          weaknesses: ["Could go deeper on tradeoffs"],
          recommendations: ["Practice gRPC details"],
          summary: "Solid practice session. AI-generated practice feedback, not a hiring assessment."
        }
      });
    expect(finish.status).toBe(200);
    expect(finish.body.data.mockInterview.stored).toBe(true);

    const fetchAfter = await request(app)
      .get(`/api/v1/mock-interviews/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(fetchAfter.status).toBe(200);
    expect(fetchAfter.body.data.mockInterview.status).toBe("completed");
  });

  it("does not persist the transcript when consent is withheld", async () => {
    const token = await registerUser();
    const create = await request(app)
      .post("/api/v1/mock-interviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobTitle: "Backend Engineer",
        firstQuestion: { questionText: "Tell me about yourself.", category: "hr" },
        consentToStore: false
      });
    const id = create.body.data.mockInterview._id;

    await request(app)
      .post(`/api/v1/mock-interviews/${id}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answer: "I am a backend engineer.", feedback: { score: 70 } });

    const finish = await request(app)
      .post(`/api/v1/mock-interviews/${id}/finish`)
      .set("Authorization", `Bearer ${token}`)
      .send({ finalReport: { overallScore: 70, summary: "Practice feedback only." } });

    expect(finish.status).toBe(200);
    expect(finish.body.data.mockInterview.stored).toBe(false);

    const fetchAfter = await request(app)
      .get(`/api/v1/mock-interviews/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(fetchAfter.status).toBe(404);
  });
});
