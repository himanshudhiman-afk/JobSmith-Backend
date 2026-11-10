import { InterviewPreparation } from "../models/InterviewPreparation.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createInterviewPrep = asyncHandler(async (req, res) => {
  const { jobAnalysisId, jobTitle, questions, studyPlan } = req.body;

  const prep = await InterviewPreparation.create({
    owner: req.user._id,
    jobAnalysis: jobAnalysisId || undefined,
    jobTitle,
    questions,
    studyPlan: studyPlan
      ? {
          availableDays: studyPlan.availableDays,
          targetInterviewDate: studyPlan.targetInterviewDate
            ? new Date(studyPlan.targetInterviewDate)
            : undefined,
          tasks: studyPlan.tasks
        }
      : undefined
  });

  res.status(201).json({ success: true, data: { preparation: prep } });
});

export const listInterviewPreps = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const [preparations, total] = await Promise.all([
    InterviewPreparation.find({ owner: req.user._id })
      .select("-questions.answerGuidance")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    InterviewPreparation.countDocuments({ owner: req.user._id })
  ]);

  res.json({
    success: true,
    data: { preparations, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  });
});

async function findOwnedPrep(id, ownerId) {
  const prep = await InterviewPreparation.findOne({ _id: id, owner: ownerId });
  if (!prep) throw ApiError.notFound("Interview preparation not found");
  return prep;
}

export const getInterviewPrep = asyncHandler(async (req, res) => {
  const prep = await findOwnedPrep(req.params.id, req.user._id);
  res.json({ success: true, data: { preparation: prep } });
});

export const deleteInterviewPrep = asyncHandler(async (req, res) => {
  const prep = await findOwnedPrep(req.params.id, req.user._id);
  await prep.deleteOne();
  res.json({ success: true, data: null });
});

export const toggleQuestionCompleted = asyncHandler(async (req, res) => {
  const prep = await findOwnedPrep(req.params.id, req.user._id);
  const question = prep.questions.id(req.params.questionId);
  if (!question) throw ApiError.notFound("Question not found");
  question.completed = req.body.completed;
  await prep.save();
  res.json({ success: true, data: { preparation: prep } });
});

export const toggleTaskCompleted = asyncHandler(async (req, res) => {
  const prep = await findOwnedPrep(req.params.id, req.user._id);
  const task = prep.studyPlan?.tasks.id(req.params.taskId);
  if (!task) throw ApiError.notFound("Study plan task not found");
  task.completed = req.body.completed;
  await prep.save();
  res.json({ success: true, data: { preparation: prep } });
});
