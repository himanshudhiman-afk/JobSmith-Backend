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

const questions = [
  {
    questionText: "Explain how Node's event loop works.",
    category: "technical",
    difficulty: "medium",
    whyRelevant: "Core to backend role",
    conceptsToRevise: ["event loop", "async I/O"],
    answerGuidance: "Mention phases of the loop.",
    followUps: ["What about microtasks?"]
  }
];

describe("interview preparation", () => {
  it("creates a preparation set with questions", async () => {
    const token = await registerUser();
    const res = await request(app)
      .post("/api/v1/interviews/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ jobTitle: "Backend Engineer", questions });

    expect(res.status).toBe(201);
    expect(res.body.data.preparation.questions).toHaveLength(1);
  });

  it("rejects an invalid question category", async () => {
    const token = await registerUser();
    const res = await request(app)
      .post("/api/v1/interviews/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ jobTitle: "Backend Engineer", questions: [{ ...questions[0], category: "not-a-category" }] });

    expect(res.status).toBe(400);
  });

  it("toggles a question's completed state, scoped to the owner", async () => {
    const tokenA = await registerUser();
    const tokenB = await registerUser();
    const create = await request(app)
      .post("/api/v1/interviews/generate")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ jobTitle: "Backend Engineer", questions });

    const prepId = create.body.data.preparation._id;
    const questionId = create.body.data.preparation.questions[0]._id;

    const otherAttempt = await request(app)
      .patch(`/api/v1/interviews/${prepId}/questions/${questionId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ completed: true });
    expect(otherAttempt.status).toBe(404);

    const ownerAttempt = await request(app)
      .patch(`/api/v1/interviews/${prepId}/questions/${questionId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ completed: true });
    expect(ownerAttempt.status).toBe(200);
    expect(ownerAttempt.body.data.preparation.questions[0].completed).toBe(true);
  });
});
