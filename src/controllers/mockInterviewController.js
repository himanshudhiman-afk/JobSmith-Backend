import { MockInterview } from "../models/MockInterview.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createMockInterview = asyncHandler(async (req, res) => {
  const { jobAnalysisId, jobTitle, category, maxQuestions, firstQuestion, consentToStore } = req.body;

  const mockInterview = await MockInterview.create({
    owner: req.user._id,
    jobAnalysis: jobAnalysisId || undefined,
    jobTitle,
    category,
    maxQuestions,
    consentToStore,
    turns: [{ questionText: firstQuestion.questionText, category: firstQuestion.category }]
  });

  res.status(201).json({ success: true, data: { mockInterview } });
});

async function findOwnedMockInterview(id, ownerId) {
  const mockInterview = await MockInterview.findOne({ _id: id, owner: ownerId });
  if (!mockInterview) throw ApiError.notFound("Mock interview not found");
  return mockInterview;
}

export const getMockInterview = asyncHandler(async (req, res) => {
  const mockInterview = await findOwnedMockInterview(req.params.id, req.user._id);
  res.json({ success: true, data: { mockInterview } });
});

export const listMockInterviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const [mockInterviews, total] = await Promise.all([
    MockInterview.find({ owner: req.user._id })
      .select("-turns")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    MockInterview.countDocuments({ owner: req.user._id })
  ]);

  res.json({
    success: true,
    data: { mockInterviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const mockInterview = await findOwnedMockInterview(req.params.id, req.user._id);
  if (mockInterview.status !== "in-progress") {
    throw ApiError.badRequest("This mock interview has already finished");
  }

  const currentTurn = mockInterview.turns[mockInterview.turns.length - 1];
  if (!currentTurn || currentTurn.userAnswer) {
    throw ApiError.badRequest("There is no pending question to answer");
  }

  currentTurn.userAnswer = req.body.answer;
  currentTurn.feedback = req.body.feedback;
  currentTurn.answeredAt = new Date();

  await mockInterview.save();
  res.json({ success: true, data: { mockInterview } });
});

export const nextQuestion = asyncHandler(async (req, res) => {
  const mockInterview = await findOwnedMockInterview(req.params.id, req.user._id);
  if (mockInterview.status !== "in-progress") {
    throw ApiError.badRequest("This mock interview has already finished");
  }
  if (mockInterview.turns.length >= mockInterview.maxQuestions) {
    throw ApiError.badRequest("Maximum number of questions reached. Finish the interview instead.");
  }
  const lastTurn = mockInterview.turns[mockInterview.turns.length - 1];
  if (!lastTurn || !lastTurn.userAnswer) {
    throw ApiError.badRequest("Answer the current question before requesting the next one");
  }

  mockInterview.turns.push({
    questionText: req.body.questionText,
    category: req.body.category
  });

  await mockInterview.save();
  res.status(201).json({ success: true, data: { mockInterview } });
});

export const finishMockInterview = asyncHandler(async (req, res) => {
  const mockInterview = await findOwnedMockInterview(req.params.id, req.user._id);
  if (mockInterview.status === "completed") {
    throw ApiError.badRequest("This mock interview has already been finished");
  }

  mockInterview.status = "completed";
  mockInterview.finalReport = req.body.finalReport;

  if (!mockInterview.consentToStore) {
    const summary = {
      mockInterview: {
        id: mockInterview._id,
        jobTitle: mockInterview.jobTitle,
        category: mockInterview.category,
        finalReport: mockInterview.finalReport,
        questionCount: mockInterview.turns.length,
        stored: false
      }
    };
    await mockInterview.deleteOne();
    res.json({ success: true, data: summary });
    return;
  }

  await mockInterview.save();
  res.json({ success: true, data: { mockInterview: { ...mockInterview.toObject(), stored: true } } });
});

export const deleteMockInterview = asyncHandler(async (req, res) => {
  const mockInterview = await findOwnedMockInterview(req.params.id, req.user._id);
  await mockInterview.deleteOne();
  res.json({ success: true, data: null });
});
