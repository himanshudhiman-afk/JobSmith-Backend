import { Resume } from "../models/Resume.js";
import { JobAnalysis } from "../models/JobAnalysis.js";
import { InterviewPreparation } from "../models/InterviewPreparation.js";
import { MockInterview } from "../models/MockInterview.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const [resumeCount, analyses, interviewPrepCount, mockInterviews] = await Promise.all([
    Resume.countDocuments({ owner: ownerId }),
    JobAnalysis.find({ owner: ownerId }).select("result.overallMatchScore result.missingOrUnclearSkills createdAt"),
    InterviewPreparation.countDocuments({ owner: ownerId }),
    MockInterview.find({ owner: ownerId, status: "completed" }).select("finalReport.overallScore createdAt")
  ]);

  const averageMatchScore = analyses.length
    ? Math.round(
        analyses.reduce((sum, a) => sum + (a.result?.overallMatchScore || 0), 0) / analyses.length
      )
    : null;

  const gapCounts = new Map();
  for (const a of analyses) {
    const analysisGaps = new Set(
      (a.result?.missingOrUnclearSkills || []).map((skill) => skill.trim().toLowerCase()).filter(Boolean)
    );
    for (const key of analysisGaps) {
      gapCounts.set(key, (gapCounts.get(key) || 0) + 1);
    }
  }
  const topSkillGaps = [...gapCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  const averageMockScore = mockInterviews.length
    ? Math.round(
        mockInterviews.reduce((sum, m) => sum + (m.finalReport?.overallScore || 0), 0) /
          mockInterviews.length
      )
    : null;

  res.json({
    success: true,
    data: {
      totals: {
        resumes: resumeCount,
        analyses: analyses.length,
        interviewPreparations: interviewPrepCount,
        completedMockInterviews: mockInterviews.length
      },
      averageMatchScore,
      averageMockScore,
      topSkillGaps
    }
  });
});

export const getDashboardActivity = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

  const [recentAnalyses, recentMockInterviews] = await Promise.all([
    JobAnalysis.find({ owner: ownerId })
      .select("jobTitle companyName result.overallMatchScore createdAt")
      .sort({ createdAt: -1 })
      .limit(limit),
    MockInterview.find({ owner: ownerId, status: "completed" })
      .select("jobTitle category finalReport.overallScore createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
  ]);

  const activity = [
    ...recentAnalyses.map((a) => ({
      type: "analysis",
      id: a._id,
      title: `${a.jobTitle}${a.companyName ? ` at ${a.companyName}` : ""}`,
      score: a.result?.overallMatchScore ?? null,
      createdAt: a.createdAt
    })),
    ...recentMockInterviews.map((m) => ({
      type: "mock-interview",
      id: m._id,
      title: `${m.jobTitle} (${m.category})`,
      score: m.finalReport?.overallScore ?? null,
      createdAt: m.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);

  res.json({ success: true, data: { activity } });
});
