// app/api/live-matches/route.ts
import { scraperService } from "@/lib/scraper-singleton";

export async function GET(request: Request) {
  await scraperService.start(); // no-op if already running

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      };

      // 🔑 send cached data immediately, don't make the client wait for a fresh scrape
      const cached = scraperService.getLatest();
      if (cached) send(cached);

      const onUpdate = (payload: any) => send(payload);
      scraperService.on("update", onUpdate);

      request.signal.addEventListener("abort", () => {
        scraperService.off("update", onUpdate);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
