// pages/api/tournaments.ts
import { scraperService } from "@/lib/scraper-singleton";
import { NextResponse } from "next/server";

/**
 * GET /api/tournaments
 * Fetches tournament data with event counts from sportshub-custom001.network
 *
 * Response format:
 * {
 *   success: boolean,
 *   data: [
 *     {
 *       name: "Tournament Name",
 *       url: "https://...",
 *       flag: "https://...",
 *       sportType: "Cricket|Football|Tennis|...",
 *       eventCount: number,
 *       sportIcon: "sports|66" (raw icon data)
 *     },
 *     ...
 *   ],
 *   count: number,
 *   timestamp: ISO string
 * }
 */
export async function GET() {
  try {
    // Ensure scraper service is running
    if (!scraperService) {
      return NextResponse.json(
        { success: false, error: "Scraper service not initialized" },
        { status: 500 },
      );
    }

    const tournaments = await scraperService.fetchTournaments();

    return NextResponse.json({
      success: true,
      data: tournaments,
      count: tournaments.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// pages/api/matches.ts
/**
 * GET /api/matches
 * Query parameters:
 *   - url?: string (default: "https://1xframemxz.com/en/live")
 *
 * Fetches match data from specified URL
 *
 * Response format:
 * {
 *   success: boolean,
 *   data: [
 *     {
 *       sport_type: "football|basketball|...",
 *       sport_name: "Football|Basketball|...",
 *       championship: "League Name",
 *       championship_url: "https://...",
 *       home_team: "Team Name",
 *       home_logo: "https://...",
 *       away_team: "Team Name",
 *       away_logo: "https://...",
 *       home_score: "0",
 *       away_score: "1",
 *       status: "Live|Upcoming|...",
 *       period: "45+2",
 *       match_url: "https://...",
 *       is_live: boolean,
 *       markets: { "1": "1.5", "X": "3.2", "2": "5.0" }
 *     },
 *     ...
 *   ],
 *   count: number,
 *   timestamp: ISO string
 * }
 */
export async function GET_MATCHES(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") || "https://1xframemxz.com/en/live";

    if (!scraperService) {
      return NextResponse.json(
        { success: false, error: "Scraper service not initialized" },
        { status: 500 },
      );
    }

    const matches = await scraperService.fetchMatches(url);

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// pages/api/esports.ts
/**
 * GET /api/esports
 * Query parameters:
 *   - url?: string (default: "https://1xframemxz.com/en/live/esports")
 *
 * Fetches esports match data with richer information (BO format, maps, etc.)
 *
 * Response format:
 * {
 *   success: boolean,
 *   data: [
 *     {
 *       sport_type: "esports",
 *       sport_name: "Esports",
 *       championship: "Tournament Name",
 *       tournament_icon: "https://...",
 *       home_team: "Team Name",
 *       home_logo: "https://...",
 *       away_team: "Team Name",
 *       away_logo: "https://...",
 *       home_score: "2",
 *       away_score: "1",
 *       format_text: "Best of 3 maps",
 *       current_map_tag: "2 map",
 *       market_category: "1X2",
 *       match_url: "https://...",
 *       is_live: true,
 *       has_live_stream: boolean,
 *       markets: [
 *         { name: "W1", value: "1.5", isLocked: false },
 *         { name: "W2", value: "2.3", isLocked: false }
 *       ]
 *     },
 *     ...
 *   ],
 *   count: number,
 *   timestamp: ISO string
 * }
 */
export async function GET_ESPORTS(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url =
      searchParams.get("url") || "https://1xframemxz.com/en/live/esports";

    if (!scraperService) {
      return NextResponse.json(
        { success: false, error: "Scraper service not initialized" },
        { status: 500 },
      );
    }

    const esportsMatches = await scraperService.fetchEsportsMatches(url);

    return NextResponse.json({
      success: true,
      data: esportsMatches,
      count: esportsMatches.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// pages/api/scraper/status.ts
/**
 * GET /api/scraper/status
 * Get the latest scraped data from the background scraper service
 *
 * Response format:
 * {
 *   success: boolean,
 *   data: {
 *     liveMatches: [...],
 *     sportsMatches: [...],
 *     esportsMatches: [...],
 *     tournaments: [...]
 *   },
 *   total: {
 *     liveMatches: number,
 *     sportsMatches: number,
 *     esportsMatches: number,
 *     tournaments: number
 *   },
 *   timestamp: ISO string
 * }
 */
export async function GET_STATUS() {
  try {
    const latest = scraperService.getLatest();

    if (!latest) {
      return NextResponse.json(
        {
          success: false,
          error: "No data available yet. Scraper may still be initializing.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(latest);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// pages/api/scraper/start.ts
/**
 * POST /api/scraper/start
 * Starts the background scraper service
 *
 * Response: { success: boolean, message: string }
 */
export async function POST_START() {
  try {
    await scraperService.start();

    return NextResponse.json(
      {
        success: true,
        message: "Scraper service started successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// pages/api/scraper/stop.ts
/**
 * POST /api/scraper/stop
 * Stops the background scraper service
 *
 * Response: { success: boolean, message: string }
 */
export async function POST_STOP() {
  try {
    await scraperService.stop();

    return NextResponse.json(
      {
        success: true,
        message: "Scraper service stopped successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
