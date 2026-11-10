import { escapeHtml } from "../utils/escapeHtml.js";

function dateRange(start, end, current) {
  const s = escapeHtml(start);
  const e = current ? "Present" : escapeHtml(end);
  if (!s && !e) return "";
  return `${s}${s && e ? " – " : ""}${e}`;
}

function section(title, innerHtml) {
  if (!innerHtml || !innerHtml.trim()) return "";
  return `<section class="section"><h2>${escapeHtml(title)}</h2>${innerHtml}</section>`;
}

export function renderAtsResumeHtml(structuredContent) {
  const c = structuredContent || {};

  const header = `
    <header>
      <h1>${escapeHtml(c.fullName) || "Full Name"}</h1>
      <p class="contact">
        ${[c.email, c.phone, c.location].filter(Boolean).map(escapeHtml).join(" · ")}
      </p>
      ${
        Array.isArray(c.links) && c.links.length
          ? `<p class="links">${c.links
              .map((l) => `${escapeHtml(l.label || l.url)}: ${escapeHtml(l.url)}`)
              .join(" · ")}</p>`
          : ""
      }
    </header>`;

  const summaryHtml = c.summary ? `<p>${escapeHtml(c.summary)}</p>` : "";

  const skillsHtml =
    Array.isArray(c.skills) && c.skills.length
      ? `<ul class="skills">${c.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
      : "";

  const experienceHtml = (Array.isArray(c.experience) ? c.experience : [])
    .map((exp) => {
      const bullets = (exp.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
      return `
        <div class="entry">
          <div class="entry-head">
            <strong>${escapeHtml(exp.title)}</strong>
            <span>${dateRange(exp.startDate, exp.endDate, exp.current)}</span>
          </div>
          <div class="entry-sub">${escapeHtml(exp.company)}${exp.location ? ` — ${escapeHtml(exp.location)}` : ""}</div>
          ${bullets ? `<ul>${bullets}</ul>` : ""}
        </div>`;
    })
    .join("");

  const educationHtml = (Array.isArray(c.education) ? c.education : [])
    .map(
      (ed) => `
        <div class="entry">
          <div class="entry-head">
            <strong>${escapeHtml(ed.institution)}</strong>
            <span>${dateRange(ed.startDate, ed.endDate, false)}</span>
          </div>
          <div class="entry-sub">${escapeHtml(ed.degree)}${ed.field ? `, ${escapeHtml(ed.field)}` : ""}</div>
        </div>`
    )
    .join("");

  const projectsHtml = (Array.isArray(c.projects) ? c.projects : [])
    .map((p) => {
      const bullets = (p.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
      return `
        <div class="entry">
          <div class="entry-head"><strong>${escapeHtml(p.name)}</strong></div>
          ${p.description ? `<div class="entry-sub">${escapeHtml(p.description)}</div>` : ""}
          ${bullets ? `<ul>${bullets}</ul>` : ""}
          ${
            Array.isArray(p.technologies) && p.technologies.length
              ? `<div class="tech">${p.technologies.map(escapeHtml).join(", ")}</div>`
              : ""
          }
        </div>`;
    })
    .join("");

  const certificationsHtml = (Array.isArray(c.certifications) ? c.certifications : [])
    .map(
      (cert) => `
        <div class="entry">
          <div class="entry-head">
            <strong>${escapeHtml(cert.name)}</strong>
            <span>${escapeHtml(cert.date)}</span>
          </div>
          <div class="entry-sub">${escapeHtml(cert.issuer)}</div>
        </div>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Resume</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1f2933;
    font-size: 11pt;
    line-height: 1.45;
    margin: 0;
    padding: 36px 42px;
  }
  header { text-align: center; margin-bottom: 18px; }
  header h1 { font-size: 22pt; margin: 0 0 4px; letter-spacing: 0.5px; }
  .contact, .links { font-size: 9.5pt; color: #3e4753; margin: 2px 0; }
  .section { margin-top: 14px; }
  .section h2 {
    font-size: 11.5pt;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1.5px solid #1f2933;
    padding-bottom: 3px;
    margin: 0 0 8px;
  }
  .entry { margin-bottom: 10px; }
  .entry-head { display: flex; justify-content: space-between; font-size: 10.5pt; }
  .entry-sub { font-size: 10pt; color: #3e4753; font-style: italic; }
  ul { margin: 4px 0 0 18px; padding: 0; }
  ul.skills { list-style: none; display: flex; flex-wrap: wrap; gap: 6px 14px; margin-left: 0; }
  ul.skills li::before { content: "• "; }
  li { font-size: 10pt; margin-bottom: 2px; }
  .tech { font-size: 9pt; color: #5b6572; margin-top: 2px; }
</style>
</head>
<body>
  ${header}
  ${section("Summary", summaryHtml)}
  ${section("Skills", skillsHtml)}
  ${section("Experience", experienceHtml)}
  ${section("Projects", projectsHtml)}
  ${section("Education", educationHtml)}
  ${section("Certifications", certificationsHtml)}
</body>
</html>`;
}
