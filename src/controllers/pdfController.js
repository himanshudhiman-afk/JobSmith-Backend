import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { renderAtsResumeHtml } from "../templates/atsResumeTemplate.js";
import { renderHtmlToPdf } from "../services/pdfService.js";

export const exportResumePdf = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, owner: req.user._id });
  if (!resume) throw ApiError.notFound("Resume not found");

  const html = renderAtsResumeHtml(resume.structuredContent);
  const pdfBuffer = await renderHtmlToPdf(html);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${resume.title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "resume"}.pdf"`
  );
  res.send(pdfBuffer);
});
