// // lib/scraper-singleton.ts
// import puppeteer, { Browser } from "puppeteer";
// import { EventEmitter } from "events";

// const logger = {
//   info: (msg: string, data?: any) => {
//     console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data || "");
//   },
//   error: (msg: string, error?: any) => {
//     console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error || "");
//   },
//   warn: (msg: string, data?: any) => {
//     console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data || "");
//   },
// };

// // ---------------------------------------------------------------------------
// // NEW: Scraper for tournament data with event counts
// // ---------------------------------------------------------------------------
// async function scrapeTournaments(url: string, browser: Browser) {
//   let page;
//   try {
//     logger.info(`Starting tournament scrape for URL: ${url}`);
//     page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     );

//     await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

//     try {
//       await page.waitForSelector(".dashboard-champ-body", { timeout: 15000 });
//     } catch {
//       logger.warn(`Tournament selector not found for: ${url}`);
//     }

//     const data = await page.evaluate(() => {
//       const result: any[] = [];

//       // Iterate through all tournament/championship bodies
//       document.querySelectorAll(".dashboard-champ-body").forEach((champ) => {
//         // Extract tournament name and URL
//         const tournamentNameEl = champ.querySelector(
//           ".dashboard-champ-name__label",
//         );
//         const tournamentName = tournamentNameEl?.textContent?.trim() || "";
//         const tournamentUrl = tournamentNameEl?.getAttribute("href") || "";

//         // Extract sport type from icon data
//         const sportIcon =
//           champ
//             .querySelector(".dashboard-champ-name__sport-ico")
//             ?.getAttribute("data-v-ico") || "";

//         let sportType = "unknown";
//         if (sportIcon.includes("sports|1")) {
//           sportType = "Football";
//         } else if (sportIcon.includes("sports|4")) {
//           sportType = "Tennis";
//         } else if (sportIcon.includes("sports|3")) {
//           sportType = "Basketball";
//         } else if (sportIcon.includes("sports|2")) {
//           sportType = "Ice Hockey";
//         } else if (sportIcon.includes("sports|66")) {
//           sportType = "Cricket";
//         } else if (sportIcon.includes("sports|6")) {
//           sportType = "Volleyball";
//         } else if (sportIcon.includes("sports|10")) {
//           sportType = "Table Tennis";
//         } else if (sportIcon.includes("sports|13")) {
//           sportType = "American Football";
//         } else if (sportIcon.includes("sports|40")) {
//           sportType = "Esports";
//         }

//         // Extract flag/championship icon
//         const flagUrl =
//           champ
//             .querySelector(".dashboard-champ-name__ico img")
//             ?.getAttribute("src") || "";

//         // Count events (matches) under this tournament
//         const eventCount = champ.querySelectorAll(".dashboard-game").length;

//         // Only add if we have a tournament name
//         if (tournamentName) {
//           result.push({
//             name: tournamentName,
//             url: tournamentUrl,
//             flag: flagUrl,
//             sportType: sportType,
//             eventCount: eventCount,
//             sportIcon: sportIcon,
//           });
//         }
//       });

//       return result;
//     });

//     logger.info(`Successfully scraped ${data.length} tournaments from: ${url}`);
//     await page.close();
//     return data;
//   } catch (error) {
//     logger.error(`Error scraping tournaments from ${url}`, error);
//     if (page) {
//       try {
//         await page.close();
//       } catch (e) {
//         logger.error("Error closing page", e);
//       }
//     }
//     return [];
//   }
// }

// // ---------------------------------------------------------------------------
// // Existing generic scraper (live / line pages) — UNCHANGED
// // ---------------------------------------------------------------------------
// async function scrapeMatches(url: string, browser: Browser) {
//   let page;
//   try {
//     logger.info(`Starting scrape for URL: ${url}`);
//     page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     );

//     await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

//     try {
//       await page.waitForSelector(".dashboard-game", { timeout: 15000 });
//     } catch {
//       logger.warn(`Primary selector not found, trying fallback for: ${url}`);
//       await page.waitForSelector(".dashboard-champ-body", { timeout: 15000 });
//     }

//     try {
//       await page.waitForFunction(
//         () => {
//           const values = document.querySelectorAll(".ui-market__value");
//           return Array.from(values).some((el) => {
//             const text = el.textContent?.trim() || "";
//             return text !== "" && text !== "-" && text !== "N/A";
//           });
//         },
//         { timeout: 10000 },
//       );
//     } catch {
//       logger.warn(`Market data wait timeout, proceeding for: ${url}`);
//     }

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
//           const homeTeamEl = teamInfo[0];
//           const homeTeamName =
//             homeTeamEl
//               ?.querySelector(".dashboard-game-team-info__name")
//               ?.textContent?.trim() || "";
//           const homeLogoUrl =
//             homeTeamEl?.querySelector(".ui-img__img")?.getAttribute("src") ||
//             "";

//           const awayTeamEl = teamInfo[1];
//           const awayTeamName =
//             awayTeamEl
//               ?.querySelector(".dashboard-game-team-info__name")
//               ?.textContent?.trim() || "";
//           const awayLogoUrl =
//             awayTeamEl?.querySelector(".ui-img__img")?.getAttribute("src") ||
//             "";

//           const scoreItems = game.querySelectorAll(".ui-game-scores__num");
//           const homeScore = scoreItems[0]?.textContent?.trim() || "0";
//           const awayScore = scoreItems[1]?.textContent?.trim() || "0";

//           const status =
//             game
//               .querySelector(".dashboard-game-info__time")
//               ?.textContent?.trim() || "";
//           const period =
//             game
//               .querySelector(".dashboard-game-info__period")
//               ?.textContent?.trim() || "";
//           const matchUrl =
//             game
//               .querySelector(".dashboard-game-block__link")
//               ?.getAttribute("href") || "";
//           const roundName =
//             game
//               .querySelector(".dashboard-game-info__match-info-stage")
//               ?.textContent?.trim() || "";
//           const matchDate =
//             game
//               .querySelector(".dashboard-game-info__date")
//               ?.textContent?.trim() || "";

//           const markets: any = {};
//           game
//             .querySelectorAll(".dashboard-markets__market")
//             .forEach((market) => {
//               const value =
//                 market
//                   .querySelector(".ui-market__value")
//                   ?.textContent?.trim() || "";
//               const toggle = market.querySelector(".ui-market__toggle");
//               const label =
//                 toggle?.getAttribute("aria-label") ||
//                 toggle?.getAttribute("title") ||
//                 "";
//               if (
//                 label &&
//                 value &&
//                 value !== "-" &&
//                 value !== "N/A" &&
//                 !value.includes("N/A")
//               ) {
//                 markets[label] = value;
//               }
//             });

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

//     logger.info(`Successfully scraped ${data.length} matches from: ${url}`);
//     await page.close();
//     return data;
//   } catch (error) {
//     logger.error(`Error scraping ${url}`, error);
//     if (page) {
//       try {
//         await page.close();
//       } catch (e) {
//         logger.error("Error closing page", e);
//       }
//     }
//     return [];
//   }
// }

// // ---------------------------------------------------------------------------
// // Dedicated esports scraper (richer card: BO format, current map, tournament icon)
// // ---------------------------------------------------------------------------
// async function scrapeEsportsMatches(url: string, browser: Browser) {
//   let page;
//   try {
//     logger.info(`Starting esports scrape for URL: ${url}`);
//     page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     );

//     await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

//     try {
//       await page.waitForSelector(".dashboard-game", { timeout: 15000 });
//     } catch {
//       logger.warn(`Esports primary selector not found for: ${url}`);
//     }

//     const data = await page.evaluate(() => {
//       const result: any[] = [];

//       document.querySelectorAll(".dashboard-champ-body").forEach((champ) => {
//         const tournamentName =
//           champ
//             .querySelector(".dashboard-champ-name__caption")
//             ?.textContent?.trim() ||
//           champ
//             .querySelector(".dashboard-champ-name__label")
//             ?.textContent?.trim() ||
//           "eSports Match";
//         const tournamentIcon =
//           champ
//             .querySelector(".dashboard-champ-name__ico img")
//             ?.getAttribute("src") || "";

//         champ.querySelectorAll(".dashboard-game").forEach((game) => {
//           const teamInfo = game.querySelectorAll(".dashboard-game-team-info");
//           const homeTeamEl = teamInfo[0];
//           const awayTeamEl = teamInfo[1];

//           const homeTeamName =
//             homeTeamEl
//               ?.querySelector(".dashboard-game-team-info__name")
//               ?.textContent?.trim() || "";
//           const homeLogoUrl =
//             homeTeamEl?.querySelector("img")?.getAttribute("src") || "";
//           const awayTeamName =
//             awayTeamEl
//               ?.querySelector(".dashboard-game-team-info__name")
//               ?.textContent?.trim() || "";
//           const awayLogoUrl =
//             awayTeamEl?.querySelector("img")?.getAttribute("src") || "";

//           if (!homeTeamName || !awayTeamName) return;

//           const scoreEls = game.querySelectorAll(
//             ".ui-game-scores__item--total .ui-game-scores__num",
//           );
//           const homeScore = scoreEls[0]?.textContent?.trim() || "0";
//           const awayScore = scoreEls[1]?.textContent?.trim() || "0";

//           const formatText =
//             game
//               .querySelector(".dashboard-game-info__match-info-stage")
//               ?.textContent?.trim() ||
//             game
//               .querySelector(".dashboard-game-info__period")
//               ?.textContent?.trim() ||
//             "";

//           const currentMapTag =
//             game
//               .querySelector(".dashboard-game-info__map-indicator")
//               ?.textContent?.trim() ||
//             game
//               .querySelector(".dashboard-game-info__period")
//               ?.textContent?.trim() ||
//             "";

//           const markets: { name: string; value: string; isLocked: boolean }[] =
//             [];
//           const marketCategory =
//             game
//               .querySelector(".dashboard-markets__category-label")
//               ?.textContent?.trim() || "1X2";

//           game
//             .querySelectorAll(".dashboard-markets__market")
//             .forEach((marketElem, idx) => {
//               const val =
//                 marketElem
//                   .querySelector(".ui-market__value")
//                   ?.textContent?.trim() || "";
//               const isLocked =
//                 marketElem.classList.contains("ui-market--locked");
//               const toggle = marketElem.querySelector(
//                 "button, .ui-market__toggle",
//               );
//               let label =
//                 toggle?.getAttribute("title") ||
//                 toggle?.getAttribute("aria-label") ||
//                 "";
//               if (!label)
//                 label =
//                   idx === 0 ? "W1" : idx === 1 ? "W2" : `Market ${idx + 1}`;
//               if (val || isLocked)
//                 markets.push({ name: label, value: val, isLocked });
//             });

//           const matchUrl =
//             game
//               .querySelector(".dashboard-game-block__link")
//               ?.getAttribute("href") || "";
//           const hasLiveStream = !!game.querySelector(
//             '[aria-label="Watch Live"], .ui-icon-broadcast',
//           );

//           result.push({
//             sport_type: "esports",
//             sport_name: "Esports",
//             championship: tournamentName,
//             tournament_icon: tournamentIcon,
//             home_team: homeTeamName,
//             home_logo: homeLogoUrl,
//             away_team: awayTeamName,
//             away_logo: awayLogoUrl,
//             home_score: homeScore,
//             away_score: awayScore,
//             format_text: formatText,
//             current_map_tag: currentMapTag,
//             market_category: marketCategory,
//             match_url: matchUrl,
//             is_live: true,
//             has_live_stream: hasLiveStream,
//             markets:
//               markets.length > 0
//                 ? markets
//                 : [
//                     { name: "W1", value: "-", isLocked: false },
//                     { name: "W2", value: "-", isLocked: false },
//                   ],
//           });
//         });
//       });

//       return result;
//     });

//     logger.info(
//       `Successfully scraped ${data.length} esports matches from: ${url}`,
//     );
//     await page.close();
//     return data;
//   } catch (error) {
//     logger.error(`Error scraping esports ${url}`, error);
//     if (page) {
//       try {
//         await page.close();
//       } catch (e) {
//         logger.error("Error closing page", e);
//       }
//     }
//     return [];
//   }
// }

// // ---------------------------------------------------------------------------
// // Singleton ScraperService with all scraping methods
// // ---------------------------------------------------------------------------
// class ScraperService extends EventEmitter {
//   private browser: Browser | null = null;
//   private running = false;
//   private latestPayload: any = null;

//   async start() {
//     if (this.running) return;
//     this.running = true;

//     this.browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//       ],
//     });

//     this.loop();
//   }

//   private async loop() {
//     while (this.running) {
//       try {
//         const [liveData, sportsData, esportsData, tournamentsData] =
//           await Promise.all([
//             scrapeMatches("https://1xframemxz.com/en/live", this.browser!),
//             scrapeMatches("https://1xframemxz.com/en/line", this.browser!),
//             scrapeEsportsMatches(
//               "https://1xframemxz.com/en/live/esports",
//               this.browser!,
//             ),
//             scrapeTournaments(
//               "https://sportshub-custom001.network/en/live",
//               this.browser!,
//             ),
//           ]);

//         this.latestPayload = {
//           success: true,
//           data: {
//             liveMatches: liveData.slice(0, 15),
//             sportsMatches: sportsData.slice(0, 15),
//             esportsMatches: esportsData.slice(0, 15),
//             tournaments: tournamentsData,
//           },
//           total: {
//             liveMatches: liveData.slice(0, 15).length,
//             sportsMatches: sportsData.slice(0, 15).length,
//             esportsMatches: esportsData.slice(0, 15).length,
//             tournaments: tournamentsData.length,
//           },
//           timestamp: new Date().toISOString(),
//         };

//         this.emit("update", this.latestPayload);
//       } catch (err) {
//         this.emit("error", err);
//       }

//       await new Promise((r) => setTimeout(r, 10000));
//     }
//   }

//   getLatest() {
//     return this.latestPayload;
//   }

//   /**
//    * Fetch tournaments only - useful for standalone tournament data needs
//    */
//   async fetchTournaments() {
//     if (!this.browser) {
//       logger.warn("Browser not initialized. Starting scraper service first.");
//       return [];
//     }
//     return scrapeTournaments(
//       "https://sportshub-custom001.network/en/live",
//       this.browser,
//     );
//   }

//   /**
//    * Fetch matches only - useful for standalone match data needs
//    */
//   async fetchMatches(url: string = "https://1xframemxz.com/en/live") {
//     if (!this.browser) {
//       logger.warn("Browser not initialized. Starting scraper service first.");
//       return [];
//     }
//     return scrapeMatches(url, this.browser);
//   }

//   /**
//    * Fetch esports matches only - useful for standalone esports data needs
//    */
//   async fetchEsportsMatches(
//     url: string = "https://1xframemxz.com/en/live/esports",
//   ) {
//     if (!this.browser) {
//       logger.warn("Browser not initialized. Starting scraper service first.");
//       return [];
//     }
//     return scrapeEsportsMatches(url, this.browser);
//   }

//   async stop() {
//     this.running = false;
//     if (this.browser) {
//       await this.browser.close();
//       this.browser = null;
//     }
//   }
// }

// export const scraperService = new ScraperService();
// lib/scraper-singleton.ts
import puppeteer, { Browser } from "puppeteer";
import { EventEmitter } from "events";

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

// ---------------------------------------------------------------------------
// NEW: Scraper for tournament data with event counts
// ---------------------------------------------------------------------------
async function scrapeTournaments(url: string, browser: Browser) {
  let page;
  try {
    logger.info(`Starting tournament scrape for URL: ${url}`);
    page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    try {
      await page.waitForSelector(".dashboard-champ-body", { timeout: 15000 });
    } catch {
      logger.warn(`Tournament selector not found for: ${url}`);
    }

    const data = await page.evaluate(() => {
      const result: any[] = [];

      // Iterate through all tournament/championship bodies
      document.querySelectorAll(".dashboard-champ-body").forEach((champ) => {
        // Extract tournament name and URL
        const tournamentNameEl = champ.querySelector(
          ".dashboard-champ-name__label",
        );
        const tournamentName = tournamentNameEl?.textContent?.trim() || "";
        const tournamentUrl = tournamentNameEl?.getAttribute("href") || "";

        // Extract sport type from icon data
        const sportIcon =
          champ
            .querySelector(".dashboard-champ-name__sport-ico")
            ?.getAttribute("data-v-ico") || "";

        let sportType = "unknown";
        if (sportIcon.includes("sports|1")) {
          sportType = "Football";
        } else if (sportIcon.includes("sports|4")) {
          sportType = "Tennis";
        } else if (sportIcon.includes("sports|3")) {
          sportType = "Basketball";
        } else if (sportIcon.includes("sports|2")) {
          sportType = "Ice Hockey";
        } else if (sportIcon.includes("sports|66")) {
          sportType = "Cricket";
        } else if (sportIcon.includes("sports|6")) {
          sportType = "Volleyball";
        } else if (sportIcon.includes("sports|10")) {
          sportType = "Table Tennis";
        } else if (sportIcon.includes("sports|13")) {
          sportType = "American Football";
        } else if (sportIcon.includes("sports|40")) {
          sportType = "Esports";
        }

        // -------------------------------------------------------------
        // Extract tournament / flag icon.
        // The site renders this two different ways:
        //   1) A real uploaded logo:
        //      <span class="... dashboard-champ-name__ico"><img src="..."></span>
        //   2) A generated fallback "country flag" icon, rendered as an
        //      inline <svg class="... dashboard-champ-name__ico" data-v-ico="country|208">
        //      with no fetchable URL at all - the icon element itself IS the svg.
        // We handle both so `flag` is always populated with something
        // directly usable as an <img src="..."> on the frontend.
        // -------------------------------------------------------------
        const iconEl = champ.querySelector(".dashboard-champ-name__ico");
        let flagUrl = "";
        let flagType: "image" | "svg" | "none" = "none";

        if (iconEl) {
          const img = iconEl.querySelector("img");
          if (img) {
            flagUrl = img.getAttribute("src") || "";
            flagType = "image";
          } else {
            // iconEl itself is the <svg> in the fallback-flag case
            const svgEl =
              iconEl.tagName.toLowerCase() === "svg"
                ? (iconEl as unknown as SVGSVGElement)
                : iconEl.querySelector("svg");
            if (svgEl) {
              let svgMarkup = svgEl.outerHTML;
              // Inline SVGs don't serialize xmlns (it's implicit in an HTML
              // document), but a standalone data URI image needs it declared
              // explicitly or browsers silently fail to render it.
              if (!svgMarkup.includes("xmlns=")) {
                svgMarkup = svgMarkup.replace(
                  "<svg",
                  '<svg xmlns="http://www.w3.org/2000/svg"',
                );
              }
              flagUrl =
                "data:image/svg+xml;base64," +
                btoa(unescape(encodeURIComponent(svgMarkup)));
              flagType = "svg";
            }
          }
        }

        // Count events (matches) under this tournament
        const eventCount = champ.querySelectorAll(".dashboard-game").length;

        // Only add if we have a tournament name
        if (tournamentName) {
          result.push({
            name: tournamentName,
            url: tournamentUrl,
            flag: flagUrl,
            flagType: flagType,
            sportType: sportType,
            eventCount: eventCount,
            sportIcon: sportIcon,
          });
        }
      });

      return result;
    });

    logger.info(`Successfully scraped ${data.length} tournaments from: ${url}`);
    await page.close();
    return data;
  } catch (error) {
    logger.error(`Error scraping tournaments from ${url}`, error);
    if (page) {
      try {
        await page.close();
      } catch (e) {
        logger.error("Error closing page", e);
      }
    }
    return [];
  }
}

// ---------------------------------------------------------------------------
// Existing generic scraper (live / line pages) — UNCHANGED
// ---------------------------------------------------------------------------
async function scrapeMatches(url: string, browser: Browser) {
  let page;
  try {
    logger.info(`Starting scrape for URL: ${url}`);
    page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    try {
      await page.waitForSelector(".dashboard-game", { timeout: 15000 });
    } catch {
      logger.warn(`Primary selector not found, trying fallback for: ${url}`);
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
      logger.warn(`Market data wait timeout, proceeding for: ${url}`);
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
          const homeLogoUrl =
            homeTeamEl?.querySelector(".ui-img__img")?.getAttribute("src") ||
            "";

          const awayTeamEl = teamInfo[1];
          const awayTeamName =
            awayTeamEl
              ?.querySelector(".dashboard-game-team-info__name")
              ?.textContent?.trim() || "";
          const awayLogoUrl =
            awayTeamEl?.querySelector(".ui-img__img")?.getAttribute("src") ||
            "";

          const scoreItems = game.querySelectorAll(".ui-game-scores__num");
          const homeScore = scoreItems[0]?.textContent?.trim() || "0";
          const awayScore = scoreItems[1]?.textContent?.trim() || "0";

          const status =
            game
              .querySelector(".dashboard-game-info__time")
              ?.textContent?.trim() || "";
          const period =
            game
              .querySelector(".dashboard-game-info__period")
              ?.textContent?.trim() || "";
          const matchUrl =
            game
              .querySelector(".dashboard-game-block__link")
              ?.getAttribute("href") || "";
          const roundName =
            game
              .querySelector(".dashboard-game-info__match-info-stage")
              ?.textContent?.trim() || "";
          const matchDate =
            game
              .querySelector(".dashboard-game-info__date")
              ?.textContent?.trim() || "";

          const markets: any = {};
          game
            .querySelectorAll(".dashboard-markets__market")
            .forEach((market) => {
              const value =
                market
                  .querySelector(".ui-market__value")
                  ?.textContent?.trim() || "";
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
      } catch (e) {
        logger.error("Error closing page", e);
      }
    }
    return [];
  }
}

// ---------------------------------------------------------------------------
// Dedicated esports scraper (richer card: BO format, current map, tournament icon)
// ---------------------------------------------------------------------------
async function scrapeEsportsMatches(url: string, browser: Browser) {
  let page;
  try {
    logger.info(`Starting esports scrape for URL: ${url}`);
    page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    try {
      await page.waitForSelector(".dashboard-game", { timeout: 15000 });
    } catch {
      logger.warn(`Esports primary selector not found for: ${url}`);
    }

    const data = await page.evaluate(() => {
      const result: any[] = [];

      document.querySelectorAll(".dashboard-champ-body").forEach((champ) => {
        const tournamentName =
          champ
            .querySelector(".dashboard-champ-name__caption")
            ?.textContent?.trim() ||
          champ
            .querySelector(".dashboard-champ-name__label")
            ?.textContent?.trim() ||
          "eSports Match";
        const tournamentIcon =
          champ
            .querySelector(".dashboard-champ-name__ico img")
            ?.getAttribute("src") || "";

        champ.querySelectorAll(".dashboard-game").forEach((game) => {
          const teamInfo = game.querySelectorAll(".dashboard-game-team-info");
          const homeTeamEl = teamInfo[0];
          const awayTeamEl = teamInfo[1];

          const homeTeamName =
            homeTeamEl
              ?.querySelector(".dashboard-game-team-info__name")
              ?.textContent?.trim() || "";
          const homeLogoUrl =
            homeTeamEl?.querySelector("img")?.getAttribute("src") || "";
          const awayTeamName =
            awayTeamEl
              ?.querySelector(".dashboard-game-team-info__name")
              ?.textContent?.trim() || "";
          const awayLogoUrl =
            awayTeamEl?.querySelector("img")?.getAttribute("src") || "";

          if (!homeTeamName || !awayTeamName) return;

          const scoreEls = game.querySelectorAll(
            ".ui-game-scores__item--total .ui-game-scores__num",
          );
          const homeScore = scoreEls[0]?.textContent?.trim() || "0";
          const awayScore = scoreEls[1]?.textContent?.trim() || "0";

          const formatText =
            game
              .querySelector(".dashboard-game-info__match-info-stage")
              ?.textContent?.trim() ||
            game
              .querySelector(".dashboard-game-info__period")
              ?.textContent?.trim() ||
            "";

          const currentMapTag =
            game
              .querySelector(".dashboard-game-info__map-indicator")
              ?.textContent?.trim() ||
            game
              .querySelector(".dashboard-game-info__period")
              ?.textContent?.trim() ||
            "";

          const markets: { name: string; value: string; isLocked: boolean }[] =
            [];
          const marketCategory =
            game
              .querySelector(".dashboard-markets__category-label")
              ?.textContent?.trim() || "1X2";

          game
            .querySelectorAll(".dashboard-markets__market")
            .forEach((marketElem, idx) => {
              const val =
                marketElem
                  .querySelector(".ui-market__value")
                  ?.textContent?.trim() || "";
              const isLocked =
                marketElem.classList.contains("ui-market--locked");
              const toggle = marketElem.querySelector(
                "button, .ui-market__toggle",
              );
              let label =
                toggle?.getAttribute("title") ||
                toggle?.getAttribute("aria-label") ||
                "";
              if (!label)
                label =
                  idx === 0 ? "W1" : idx === 1 ? "W2" : `Market ${idx + 1}`;
              if (val || isLocked)
                markets.push({ name: label, value: val, isLocked });
            });

          const matchUrl =
            game
              .querySelector(".dashboard-game-block__link")
              ?.getAttribute("href") || "";
          const hasLiveStream = !!game.querySelector(
            '[aria-label="Watch Live"], .ui-icon-broadcast',
          );

          result.push({
            sport_type: "esports",
            sport_name: "Esports",
            championship: tournamentName,
            tournament_icon: tournamentIcon,
            home_team: homeTeamName,
            home_logo: homeLogoUrl,
            away_team: awayTeamName,
            away_logo: awayLogoUrl,
            home_score: homeScore,
            away_score: awayScore,
            format_text: formatText,
            current_map_tag: currentMapTag,
            market_category: marketCategory,
            match_url: matchUrl,
            is_live: true,
            has_live_stream: hasLiveStream,
            markets:
              markets.length > 0
                ? markets
                : [
                    { name: "W1", value: "-", isLocked: false },
                    { name: "W2", value: "-", isLocked: false },
                  ],
          });
        });
      });

      return result;
    });

    logger.info(
      `Successfully scraped ${data.length} esports matches from: ${url}`,
    );
    await page.close();
    return data;
  } catch (error) {
    logger.error(`Error scraping esports ${url}`, error);
    if (page) {
      try {
        await page.close();
      } catch (e) {
        logger.error("Error closing page", e);
      }
    }
    return [];
  }
}

// ---------------------------------------------------------------------------
// Singleton ScraperService with all scraping methods
// ---------------------------------------------------------------------------
class ScraperService extends EventEmitter {
  private browser: Browser | null = null;
  private running = false;
  private latestPayload: any = null;

  async start() {
    if (this.running) return;
    this.running = true;

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    this.loop();
  }

  private async loop() {
    while (this.running) {
      try {
        const [liveData, sportsData, esportsData, tournamentsData] =
          await Promise.all([
            scrapeMatches("https://1xframemxz.com/en/live", this.browser!),
            scrapeMatches("https://1xframemxz.com/en/line", this.browser!),
            scrapeEsportsMatches(
              "https://1xframemxz.com/en/live/esports",
              this.browser!,
            ),
            scrapeTournaments("https://1xframemxz.com/en/live", this.browser!),
          ]);

        this.latestPayload = {
          success: true,
          data: {
            liveMatches: liveData.slice(0, 15),
            sportsMatches: sportsData.slice(0, 15),
            esportsMatches: esportsData.slice(0, 15),
            tournaments: tournamentsData,
          },
          total: {
            liveMatches: liveData.slice(0, 15).length,
            sportsMatches: sportsData.slice(0, 15).length,
            esportsMatches: esportsData.slice(0, 15).length,
            tournaments: tournamentsData.length,
          },
          timestamp: new Date().toISOString(),
        };

        this.emit("update", this.latestPayload);
      } catch (err) {
        this.emit("error", err);
      }

      await new Promise((r) => setTimeout(r, 10000));
    }
  }

  getLatest() {
    return this.latestPayload;
  }

  /**
   * Fetch tournaments only - useful for standalone tournament data needs
   */
  async fetchTournaments() {
    if (!this.browser) {
      logger.warn("Browser not initialized. Starting scraper service first.");
      return [];
    }
    return scrapeTournaments(
      "https://sportshub-custom001.network/en/live",
      this.browser,
    );
  }

  /**
   * Fetch matches only - useful for standalone match data needs
   */
  async fetchMatches(url: string = "https://1xframemxz.com/en/live") {
    if (!this.browser) {
      logger.warn("Browser not initialized. Starting scraper service first.");
      return [];
    }
    return scrapeMatches(url, this.browser);
  }

  /**
   * Fetch esports matches only - useful for standalone esports data needs
   */
  async fetchEsportsMatches(
    url: string = "https://1xframemxz.com/en/live/esports",
  ) {
    if (!this.browser) {
      logger.warn("Browser not initialized. Starting scraper service first.");
      return [];
    }
    return scrapeEsportsMatches(url, this.browser);
  }

  async stop() {
    this.running = false;
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const scraperService = new ScraperService();
