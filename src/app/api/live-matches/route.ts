// // app/api/live-sports-data/route.ts
// import { NextResponse } from "next/server";
// import puppeteer from "puppeteer";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// // Function to scrape data from a specific URL
// async function scrapeMatches(url: string, browser: any) {
//   try {
//     const page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     );

//     console.log(`Fetching data from: ${url}`);

//     await page.goto(url, {
//       waitUntil: "networkidle2",
//       timeout: 45000,
//     });

//     // Wait for content to load
//     try {
//       await page.waitForSelector(".dashboard-game", { timeout: 15000 });
//     } catch (e) {
//       await page.waitForSelector(".dashboard-champ-body", { timeout: 15000 });
//     }

//     // Wait for odds to load
//     try {
//       await page.waitForFunction(
//         () => {
//           const values = document.querySelectorAll(".ui-market__value");
//           return Array.from(values).some((el) => {
//             const text = el.textContent?.trim() || "";
//             return text !== "" && text !== "-" && text !== "N/A";
//           });
//         },
//         { timeout: 15000 },
//       );
//     } catch (e) {
//       console.log("No odds found, continuing with available data...");
//     }

//     await delay(2000);

//     // Extract data
//     const data = await page.evaluate(() => {
//       const result: any[] = [];

//       document.querySelectorAll(".dashboard-champ-body").forEach((champ) => {
//         const champNameEl = champ.querySelector(".dashboard-champ-name__label");
//         const championship = champNameEl?.textContent?.trim() || "";
//         const championshipUrl = champNameEl?.getAttribute("href") || "";
//         const sportIcon =
//           champ
//             .querySelector(".dashboard-champ-name__sport-ico")
//             ?.getAttribute("data-v-ico") || "";

//         // Determine sport type from icon
//         let sportType = "unknown";
//         let sportName = "Other";
//         if (sportIcon.includes("sports|1")) {
//           sportType = "football";
//           sportName = "Football";
//         } else if (sportIcon.includes("sports|4")) {
//           sportType = "tennis";
//           sportName = "Tennis";
//         } else if (sportIcon.includes("sports|3")) {
//           sportType = "basketball";
//           sportName = "Basketball";
//         } else if (sportIcon.includes("sports|2")) {
//           sportType = "ice hockey";
//           sportName = "Ice Hockey";
//         } else if (sportIcon.includes("sports|66")) {
//           sportType = "cricket";
//           sportName = "Cricket";
//         } else if (sportIcon.includes("sports|6")) {
//           sportType = "volleyball";
//           sportName = "Volleyball";
//         } else if (sportIcon.includes("sports|10")) {
//           sportType = "table tennis";
//           sportName = "Table Tennis";
//         } else if (sportIcon.includes("sports|13")) {
//           sportType = "american football";
//           sportName = "American Football";
//         } else if (sportIcon.includes("sports|40")) {
//           sportType = "esports";
//           sportName = "Esports";
//         }

//         champ.querySelectorAll(".dashboard-game").forEach((game) => {
//           const teamInfo = game.querySelectorAll(".dashboard-game-team-info");

//           // Get home team info with logo
//           const homeTeamEl = teamInfo[0];
//           const homeTeamName =
//             homeTeamEl
//               ?.querySelector(".dashboard-game-team-info__name")
//               ?.textContent?.trim() || "";
//           const homeLogoEl = homeTeamEl?.querySelector(".ui-img__img");
//           const homeLogoUrl = homeLogoEl?.getAttribute("src") || "";

//           // Get away team info with logo
//           const awayTeamEl = teamInfo[1];
//           const awayTeamName =
//             awayTeamEl
//               ?.querySelector(".dashboard-game-team-info__name")
//               ?.textContent?.trim() || "";
//           const awayLogoEl = awayTeamEl?.querySelector(".ui-img__img");
//           const awayLogoUrl = awayLogoEl?.getAttribute("src") || "";

//           // Get scores
//           const scoreItems = game.querySelectorAll(".ui-game-scores__num");
//           const homeScore = scoreItems[0]?.textContent?.trim() || "0";
//           const awayScore = scoreItems[1]?.textContent?.trim() || "0";

//           // Get match status
//           const statusEl = game.querySelector(".dashboard-game-info__time");
//           const status = statusEl?.textContent?.trim() || "";
//           const periodEl = game.querySelector(".dashboard-game-info__period");
//           const period = periodEl?.textContent?.trim() || "";
//           const matchUrl =
//             game
//               .querySelector(".dashboard-game-block__link")
//               ?.getAttribute("href") || "";
//           const roundName =
//             game
//               .querySelector(".dashboard-game-info__match-info-stage")
//               ?.textContent?.trim() || "";

//           // Check if match has date (for upcoming matches)
//           const dateEl = game.querySelector(".dashboard-game-info__date");
//           const matchDate = dateEl?.textContent?.trim() || "";

//           // Extract markets/odds
//           const markets: any = {};
//           const marketElements = game.querySelectorAll(
//             ".dashboard-markets__market",
//           );

//           marketElements.forEach((market) => {
//             const valueEl = market.querySelector(".ui-market__value");
//             const value = valueEl?.textContent?.trim() || "";
//             const toggle = market.querySelector(".ui-market__toggle");
//             const label =
//               toggle?.getAttribute("aria-label") ||
//               toggle?.getAttribute("title") ||
//               "";

//             if (
//               label &&
//               value &&
//               value !== "-" &&
//               value !== "N/A" &&
//               !value.includes("N/A")
//             ) {
//               markets[label] = value;
//             }
//           });

//           // Determine if match is live
//           const isLive =
//             status &&
//             (status.includes(":") ||
//               status.toLowerCase().includes("progress") ||
//               status.toLowerCase().includes("half") ||
//               status.toLowerCase().includes("inning"));

//           result.push({
//             sport_type: sportType,
//             sport_name: sportName,
//             sport_icon: sportIcon,
//             championship: championship || "Unknown League",
//             championship_url: championshipUrl || "",
//             home_team: homeTeamName || "Team 1",
//             home_logo: homeLogoUrl || "",
//             away_team: awayTeamName || "Team 2",
//             away_logo: awayLogoUrl || "",
//             home_score: homeScore,
//             away_score: awayScore,
//             status: status || "Upcoming",
//             period: period || "",
//             round_name: roundName || "",
//             match_url: matchUrl || "",
//             match_date: matchDate || "",
//             is_live: isLive || false,
//             markets:
//               Object.keys(markets).length > 0
//                 ? markets
//                 : { "1": "N/A", X: "N/A", "2": "N/A" },
//           });
//         });
//       });

//       return result;
//     });

//     await page.close();
//     return data;
//   } catch (error) {
//     console.error(`Error scraping ${url}:`, error);
//     return [];
//   }
// }

// export async function GET() {
//   let browser;
//   try {
//     browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-blink-features=AutomationControlled",
//         "--disable-dev-shm-usage",
//         "--disable-web-security",
//         "--disable-features=IsolateOrigins,site-per-process",
//       ],
//     });

//     // Fetch from both URLs in parallel
//     const [liveData, sportsData] = await Promise.all([
//       scrapeMatches("https://1xframemxz.com/en/live", browser),
//       scrapeMatches("https://1xframemxz.com/en/line", browser),
//     ]);

//     await browser.close();

//     // Get first 15 from each
//     const liveMatches = liveData.slice(0, 15);
//     const sportsMatches = sportsData.slice(0, 15);

//     return NextResponse.json({
//       success: true,
//       data: {
//         liveMatches: liveMatches,
//         sportsMatches: sportsMatches,
//       },
//       total: {
//         liveMatches: liveMatches.length,
//         sportsMatches: sportsMatches.length,
//       },
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Scraping error:", error);
//     if (browser) await browser.close();

//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to scrape data",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 },
//     );
//   }
// }

// app/api/live-sports-data/route.ts
import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";

export const dynamic = "force-dynamic";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeMatches(url: string, browser: Browser) {
  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    try {
      await page.waitForSelector(".dashboard-game", { timeout: 15000 });
    } catch {
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
    } catch {
      // Fall through to parse whatever is available
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

    await page.close();
    return data;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
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

      // Handle client disconnect gracefully
      request.signal.addEventListener("abort", async () => {
        isAborted = true;
        if (browser) {
          try {
            await browser.close();
          } catch {}
        }
        controller.close();
      });

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

        // Loop to continuously push updates to the connected client
        while (!isAborted) {
          const [liveData, sportsData] = await Promise.all([
            scrapeMatches("https://1xframemxz.com/en/live", browser),
            scrapeMatches("https://1xframemxz.com/en/line", browser),
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
            timestamp: new Date().toISOString(),
          };

          // Format as standard SSE stream data (`data: <payload>\n\n`)
          const message = `data: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(message));

          // Wait 10 seconds between refresh scrapes
          await delay(10000);
        }
      } catch (error) {
        if (!isAborted) {
          const errPayload = `data: ${JSON.stringify({
            success: false,
            error: "Streaming interrupted",
          })}\n\n`;
          controller.enqueue(encoder.encode(errPayload));
          if (browser) await browser.close();
          controller.close();
        }
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
