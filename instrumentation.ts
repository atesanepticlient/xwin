export async function register() {
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.ENABLE_LIVE_SCRAPER !== "true"
  ) {
    return;
  }

  const { scraperService } = await import("@/lib/scraper-singleton");

  scraperService.start().catch((err) => {
    console.error("[scraper] failed to start on boot:", err);
  });
}
