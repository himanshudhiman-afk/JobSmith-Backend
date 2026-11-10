import puppeteer from "puppeteer";

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
  }
  return browserPromise;
}

export async function renderHtmlToPdf(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // The template already escapes all dynamic content; navigation/requests are
    // blocked below so nothing in the HTML can load external resources or scripts.
    await page.setRequestInterception(true);
    page.on("request", (request) => request.abort());

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" }
    });
    return pdfBuffer;
  } finally {
    await page.close();
  }
}

export async function closePdfBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}
