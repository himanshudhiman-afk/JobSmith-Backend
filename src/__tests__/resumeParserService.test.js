import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { extractResumeText, guessContactInfo } from "../services/resumeParserService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_FIXTURE = path.join(__dirname, "fixtures", "test-resume.pdf");

describe("resumeParserService", () => {
  it("extracts text from a valid PDF", async () => {
    const buffer = fs.readFileSync(PDF_FIXTURE);
    const text = await extractResumeText(buffer, "pdf");
    expect(text).toContain("Ada Lovelace");
  });

  it("rejects a corrupted/empty PDF buffer", async () => {
    const buffer = Buffer.from("%PDF-1.4\nnot a real pdf body");
    await expect(extractResumeText(buffer, "pdf")).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects an unrecognized kind", async () => {
    const buffer = Buffer.from("hello");
    await expect(extractResumeText(buffer, null)).rejects.toMatchObject({ statusCode: 400 });
  });

  it("guesses contact info from extracted text", () => {
    const text = "Ada Lovelace\nada.lovelace@example.com | +1 555 123 4567\nSummary here.";
    const contact = guessContactInfo(text);
    expect(contact.fullName).toBe("Ada Lovelace");
    expect(contact.email).toBe("ada.lovelace@example.com");
    expect(contact.phone).toContain("555");
  });
});
