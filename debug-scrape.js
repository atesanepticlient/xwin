const puppeteer = require("puppeteer");
const UA = process.env.UA
  ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
  : null;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  if (UA) await page.setUserAgent(UA);
  console.log("UA:", await browser.userAgent());

  page.on("requestfailed", (r) =>
    console.log("[reqfailed]", r.url().slice(0, 100), r.failure()?.errorText),
  );
  page.on("response", (r) => {
    if (r.status() >= 400)
      console.log("[http]", r.status(), r.url().slice(0, 100));
  });

  const t = Date.now();
  const res = await page.goto("https://1xframemxz.com/en/live", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  console.log("status:", res.status(), "| final url:", page.url());

  try {
    await page.waitForSelector(".dashboard-champ-body", { timeout: 60000 });
    console.log("FOUND after", Date.now() - t, "ms");
  } catch {
    console.log("NOT FOUND after", Date.now() - t, "ms");
  }
  console.log("title:", await page.title());
  console.log(
    "text:",
    (await page.evaluate(() => document.body.innerText)).slice(0, 600),
  );
  await page.screenshot({ path: "/tmp/vps.png" });
  await browser.close();
})();
