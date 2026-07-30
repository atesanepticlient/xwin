import puppeteer, { Browser } from "puppeteer";

export const dynamic = "force-dynamic";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Logger utility
const logger = {
  info: (msg: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data || "");
  },
  error: (msg: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error || "");
  },
  warn: (msg: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data || "");
  },
};

async function scrapeMatches(url: string, browser: Browser) {
  let page;
  try {
    logger.info(`Starting scrape for URL: ${url}`);
    page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    logger.info(`Page loaded successfully for: ${url}`);

    try {
      await page.waitForSelector(".dashboard-game", { timeout: 15000 });
    } catch {
      logger.warn(
        `Primary selector not found, trying fallback selector for: ${url}`,
      );
      await page.waitForSelector(".dashboard-champ-body", { timeout: 15000 });
    }

    try {
      await page.waitForFunction(
        () => {
          const values = document.querySelectorAll(".ui-market__value");
          return Array.from(values).some((el) => {
            const text = el.textContent?.trim() || "";
            return text !== "" && text !== "-" && text !== "N/A";
          });
        },
        { timeout: 10000 },
      );
      logger.info(`Market data loaded for: ${url}`);
    } catch {
      logger.warn(
        `Market data wait timeout, proceeding with available data for: ${url}`,
      );
    }

    const data = await page.evaluate(() => {
      const result: any[] = [];

      document.querySelectorAll(".dashboard-champ-body").forEach((champ) => {
        const champNameEl = champ.querySelector(".dashboard-champ-name__label");
        const championship = champNameEl?.textContent?.trim() || "";
        const championshipUrl = champNameEl?.getAttribute("href") || "";
        const sportIcon =
          champ
            .querySelector(".dashboard-champ-name__sport-ico")
            ?.getAttribute("data-v-ico") || "";

        let sportType = "unknown";
        let sportName = "Other";
        if (sportIcon.includes("sports|1")) {
          sportType = "football";
          sportName = "Football";
        } else if (sportIcon.includes("sports|4")) {
          sportType = "tennis";
          sportName = "Tennis";
        } else if (sportIcon.includes("sports|3")) {
          sportType = "basketball";
          sportName = "Basketball";
        } else if (sportIcon.includes("sports|2")) {
          sportType = "ice hockey";
          sportName = "Ice Hockey";
        } else if (sportIcon.includes("sports|66")) {
          sportType = "cricket";
          sportName = "Cricket";
        } else if (sportIcon.includes("sports|6")) {
          sportType = "volleyball";
          sportName = "Volleyball";
        } else if (sportIcon.includes("sports|10")) {
          sportType = "table tennis";
          sportName = "Table Tennis";
        } else if (sportIcon.includes("sports|13")) {
          sportType = "american football";
          sportName = "American Football";
        } else if (sportIcon.includes("sports|40")) {
          sportType = "esports";
          sportName = "Esports";
        }

        champ.querySelectorAll(".dashboard-game").forEach((game) => {
          const teamInfo = game.querySelectorAll(".dashboard-game-team-info");

          const homeTeamEl = teamInfo[0];
          const homeTeamName =
            homeTeamEl
              ?.querySelector(".dashboard-game-team-info__name")
              ?.textContent?.trim() || "";
          const homeLogoEl = homeTeamEl?.querySelector(".ui-img__img");
          const homeLogoUrl = homeLogoEl?.getAttribute("src") || "";

          const awayTeamEl = teamInfo[1];
          const awayTeamName =
            awayTeamEl
              ?.querySelector(".dashboard-game-team-info__name")
              ?.textContent?.trim() || "";
          const awayLogoEl = awayTeamEl?.querySelector(".ui-img__img");
          const awayLogoUrl = awayLogoEl?.getAttribute("src") || "";

          const scoreItems = game.querySelectorAll(".ui-game-scores__num");
          const homeScore = scoreItems[0]?.textContent?.trim() || "0";
          const awayScore = scoreItems[1]?.textContent?.trim() || "0";

          const statusEl = game.querySelector(".dashboard-game-info__time");
          const status = statusEl?.textContent?.trim() || "";
          const periodEl = game.querySelector(".dashboard-game-info__period");
          const period = periodEl?.textContent?.trim() || "";
          const matchUrl =
            game
              .querySelector(".dashboard-game-block__link")
              ?.getAttribute("href") || "";
          const roundName =
            game
              .querySelector(".dashboard-game-info__match-info-stage")
              ?.textContent?.trim() || "";

          const dateEl = game.querySelector(".dashboard-game-info__date");
          const matchDate = dateEl?.textContent?.trim() || "";

          const markets: any = {};
          const marketElements = game.querySelectorAll(
            ".dashboard-markets__market",
          );

          marketElements.forEach((market) => {
            const valueEl = market.querySelector(".ui-market__value");
            const value = valueEl?.textContent?.trim() || "";
            const toggle = market.querySelector(".ui-market__toggle");
            const label =
              toggle?.getAttribute("aria-label") ||
              toggle?.getAttribute("title") ||
              "";

            if (
              label &&
              value &&
              value !== "-" &&
              value !== "N/A" &&
              !value.includes("N/A")
            ) {
              markets[label] = value;
            }
          });

          const isLive =
            status &&
            (status.includes(":") ||
              status.toLowerCase().includes("progress") ||
              status.toLowerCase().includes("half") ||
              status.toLowerCase().includes("inning"));

          result.push({
            sport_type: sportType,
            sport_name: sportName,
            sport_icon: sportIcon,
            championship: championship || "Unknown League",
            championship_url: championshipUrl || "",
            home_team: homeTeamName || "Team 1",
            home_logo: homeLogoUrl || "",
            away_team: awayTeamName || "Team 2",
            away_logo: awayLogoUrl || "",
            home_score: homeScore,
            away_score: awayScore,
            status: status || "Upcoming",
            period: period || "",
            round_name: roundName || "",
            match_url: matchUrl || "",
            match_date: matchDate || "",
            is_live: isLive || false,
            markets:
              Object.keys(markets).length > 0
                ? markets
                : { "1": "N/A", X: "N/A", "2": "N/A" },
          });
        });
      });

      return result;
    });

    logger.info(`Successfully scraped ${data.length} matches from: ${url}`);
    await page.close();
    return data;
  } catch (error) {
    logger.error(`Error scraping ${url}`, error);
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        logger.error(`Error closing page after scrape failure`, closeError);
      }
    }
    return [];
  }
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  // Create a continuous stream response
  const stream = new ReadableStream({
    async start(controller) {
      let browser: Browser | null = null;
      let isAborted = false;
      let scrapeCount = 0;

      logger.info("🚀 Stream started");

      // Handle client disconnect gracefully
      request.signal.addEventListener("abort", async () => {
        isAborted = true;
        logger.info("⚠️ Client disconnected, cleaning up resources");

        if (browser) {
          try {
            await browser.close();
            logger.info("✅ Browser closed successfully");
          } catch (error) {
            logger.error("❌ Error closing browser", error);
          }
        }
        controller.close();
      });

      try {
        // Launch browser with error handling
        try {
          browser = await puppeteer.launch({
            headless: true,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-blink-features=AutomationControlled",
              "--disable-dev-shm-usage",
              "--disable-web-security",
              "--disable-features=IsolateOrigins,site-per-process",
            ],
          });
          logger.info("✅ Puppeteer browser launched successfully");
        } catch (error) {
          logger.error("❌ Failed to launch Puppeteer browser", error);
          const errPayload = {
            success: false,
            error: "Failed to initialize browser",
            errorType: "BROWSER_LAUNCH_ERROR",
            details: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errPayload)}\n\n`),
          );
          controller.close();
          return;
        }

        // Loop to continuously push updates to the connected client
        while (!isAborted) {
          try {
            scrapeCount++;
            logger.info(`📡 Starting scrape cycle #${scrapeCount}`);

            const [liveData, sportsData] = await Promise.all([
              scrapeMatches("https://1xframemxz.com/en/live", browser!).catch(
                (error) => {
                  logger.error("Failed to scrape live matches", error);
                  return [];
                },
              ),
              scrapeMatches("https://1xframemxz.com/en/line", browser!).catch(
                (error) => {
                  logger.error("Failed to scrape sports matches", error);
                  return [];
                },
              ),
            ]);

            const payload = {
              success: true,
              data: {
                liveMatches: liveData.slice(0, 15),
                sportsMatches: sportsData.slice(0, 15),
              },
              total: {
                liveMatches: liveData.slice(0, 15).length,
                sportsMatches: sportsData.slice(0, 15).length,
              },
              scrapeCount,
              timestamp: new Date().toISOString(),
            };

            // Format as standard SSE stream data (`data: <payload>\n\n`)
            const message = `data: ${JSON.stringify(payload)}\n\n`;
            controller.enqueue(encoder.encode(message));
            logger.info(
              `✅ Sent data - Live: ${payload.total.liveMatches}, Sports: ${payload.total.sportsMatches}`,
            );

            // Wait 10 seconds between refresh scrapes
            await delay(10000);
          } catch (loopError) {
            logger.error(
              `❌ Error during scrape cycle #${scrapeCount}`,
              loopError,
            );

            const errPayload = {
              success: false,
              error: "Error during data fetch",
              errorType: "SCRAPE_CYCLE_ERROR",
              details:
                loopError instanceof Error
                  ? loopError.message
                  : "Unknown error",
              scrapeCount,
              timestamp: new Date().toISOString(),
            };

            try {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(errPayload)}\n\n`),
              );
            } catch (enqueueError) {
              logger.error("Failed to send error to stream", enqueueError);
            }

            // Continue looping unless critical
            if (isAborted) break;
            await delay(5000); // Wait before retry
          }
        }
      } catch (fatalError) {
        logger.error("❌ FATAL ERROR - Stream terminated", fatalError);

        if (!isAborted) {
          const fatalPayload = {
            success: false,
            error: "Streaming encountered a fatal error",
            errorType: "FATAL_ERROR",
            details:
              fatalError instanceof Error
                ? fatalError.message
                : "Unknown error",
            timestamp: new Date().toISOString(),
          };

          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(fatalPayload)}\n\n`),
            );
          } catch {
            // Stream might already be closed
          }
        }

        if (browser) {
          try {
            // await browser.close();
          } catch (error) {
            logger.error("Error closing browser after fatal error", error);
          }
        }
        controller.close();
      }
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
