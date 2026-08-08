// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { scraperService } = await import("@/lib/scraper-singleton");
    scraperService.start().catch((err) => {
      console.error("[scraper] failed to start on boot:", err);
    });
  }
}
