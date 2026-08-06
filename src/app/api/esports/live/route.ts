// import { NextResponse } from "next/server";
// import * as cheerio from "cheerio";
// import puppeteer from "puppeteer";

// export async function GET() {
//   let browser;
//   try {
//     browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     );

//     await page.goto("https://1xframemxz.com/en/live/esports", {
//       waitUntil: "networkidle2",
//       timeout: 30000,
//     });

//     const content = await page.content();
//     const $ = cheerio.load(content);
//     const matches: any[] = [];

//     // Loop through all game cards in the DOM
//     $(".dashboard-game").each((_, gameElem) => {
//       if (matches.length >= 20) return false; // Stop when 20 matches are scraped

//       const champElem = $(gameElem).closest(".dashboard-champ");
//       const champName =
//         $(champElem).find(".dashboard-champ-name__caption").text().trim() ||
//         "eSports Match";
//       const champIcon =
//         $(champElem).find(".dashboard-champ-name__ico img").attr("src") || "";

//       const teams: { name: string; icon: string }[] = [];
//       $(gameElem)
//         .find(".dashboard-game-team-info")
//         .each((_, teamElem) => {
//           const name = $(teamElem)
//             .find(".dashboard-game-team-info__name")
//             .text()
//             .trim();
//           const icon = $(teamElem).find("img").attr("src") || "";
//           if (name) teams.push({ name, icon });
//         });

//       // Total & current map scores
//       const scoreHome =
//         $(gameElem)
//           .find(".ui-game-scores__item--total .ui-game-scores__num")
//           .eq(0)
//           .text()
//           .trim() || "0";
//       const scoreAway =
//         $(gameElem)
//           .find(".ui-game-scores__item--total .ui-game-scores__num")
//           .eq(1)
//           .text()
//           .trim() || "0";

//       const status = $(gameElem)
//         .find(".dashboard-game-info__time")
//         .text()
//         .trim();
//       const period =
//         $(gameElem).find(".dashboard-game-info__period").text().trim() ||
//         "1 map";
//       const stage = $(gameElem)
//         .find(".dashboard-game-info__match-info-stage")
//         .text()
//         .trim();

//       // Extract all available market odds for this game
//       const markets: { name: string; value: string; isLocked: boolean }[] = [];
//       $(gameElem)
//         .find(".dashboard-markets__market")
//         .each((idx, marketElem) => {
//           const val = $(marketElem).find(".ui-market__value").text().trim();
//           const isLocked = $(marketElem).hasClass("ui-market--locked");

//           let title = $(marketElem).find("button").attr("title") || "";
//           if (!title) {
//             title = idx === 0 ? "W1" : idx === 2 ? "W2" : `Market ${idx + 1}`;
//           }

//           if (val || isLocked) {
//             markets.push({ name: title, value: val, isLocked });
//           }
//         });

//       if (teams.length >= 2) {
//         matches.push({
//           id: Math.random().toString(36).substring(2, 9),
//           tournament: { name: champName, icon: champIcon },
//           teams: {
//             home: teams[0],
//             away: teams[1],
//           },
//           score: { home: scoreHome, away: scoreAway },
//           matchInfo: stage || status || "Live Match",
//           period: period,
//           marketCategory: "1X2",
//           markets:
//             markets.length > 0
//               ? markets
//               : [
//                   { name: "W1", value: "-" },
//                   { name: "W2", value: "-" },
//                 ],
//         });
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       count: matches.length,
//       data: matches,
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 },
//     );
//   } finally {
//     if (browser) await browser.close();
//   }
// }
