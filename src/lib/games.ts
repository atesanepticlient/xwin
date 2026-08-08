import availableGames from "@/../data/games.json";
import popular from "@/../data/populart-games.json";
import fish from "@/../data/fish-games.json";
import poker from "@/../data/poker-games.json";
import live from "@/../data/live-games.json";
import { GameItem, GreGameItem } from "@/types/game";

import greGamesList from "@/../data/all-gre-games.json";
import { BettingCategory, Prisma } from "@prisma/client";

type GameTypes = "LIVE_CASINO" | "POPULAR" | "FISHING" | "POKER" | "ALL";
type Currency = "BDT" | "INR" | "PKR";

export const fetchGames = (type: GameTypes, currecny: Currency) => {
  const currencyFilter = (games: GameItem[]) => {
    return games.filter((game) => {
      const supportedCurrencies = game.support_currency?.split(",");
      return supportedCurrencies?.includes(currecny);
    });
  };

  let games: GameItem[] = [];
  if (type == "ALL") {
    games = currencyFilter(availableGames.list);
  } else if (type == "LIVE_CASINO") {
    games = currencyFilter(live.list);
  } else if (type == "POPULAR") {
    games = currencyFilter(popular.list);
  } else if (type == "FISHING") {
    games = currencyFilter(fish.list);
  } else if (type == "POKER") {
    games = currencyFilter(poker.list);
  }

  return games;
};

export const getGameNameByCode = (code: string) => {
  const games = availableGames.list;

  const game = games.find((game: any) => game.game_code == code);
  return game.game_name;
};
interface SearchOptions {
  query: string;
  limit?: number;
  popularOnly?: boolean;
}

class GameSearch {
  private games: GreGameItem[];

  constructor(games: GreGameItem[]) {
    this.games = games;
  }

  /**
   * Pre-check: Validate if game has valid id and imageUrl
   */
  private isValidGame(game: GreGameItem): boolean {
    return (
      game.isEnabled === true &&
      game.id !== undefined &&
      game.id !== null &&
      game.id.trim() !== "" &&
      game.imageUrl !== undefined &&
      game.imageUrl !== null &&
      game.imageUrl.trim() !== ""
    );
  }

  /**
   * Get only valid games (with id and imageUrl)
   */
  private getValidGames(): GreGameItem[] {
    return this.games.filter((game) => this.isValidGame(game));
  }

  /**
   * Fetch popular games with pagination
   * Only returns valid games where popular is true
   */
  getPopular(page: number = 1, limit: number = 20): GreGameItem[] {
    const popularGames = this.getValidGames().filter(
      (game) => game.popular === true,
    );
    const start = (page - 1) * limit;
    const end = start + limit;
    return popularGames.slice(start, end);
  }

  /**
   * Get total count of popular valid games
   */
  getTotalPopularGames(): number {
    return this.getValidGames().filter((game) => game.popular === true).length;
  }

  /**
   * Search games by name, provider, or category
   * Uses regex for flexible matching (case-insensitive, ignores spaces)
   * Optional parameter `popularOnly` filters results to popular games only
   */
  search({
    query,
    limit = 20,
    popularOnly = false,
  }: SearchOptions): GreGameItem[] {
    let validGames = this.getValidGames();

    if (popularOnly) {
      validGames = validGames.filter((game) => game.popular === true);
    }

    if (!query || query.trim() === "") {
      return validGames.slice(0, limit);
    }

    // Clean query: remove extra spaces, convert to lowercase
    const cleanQuery = query.toLowerCase().trim().replace(/\s+/g, "");

    // Create regex pattern that ignores spaces and case
    const regexPattern = cleanQuery.split("").join("\\s*");
    const regex = new RegExp(regexPattern, "i");

    const results = validGames.filter((game) => {
      // Clean searchable fields
      const searchableFields = [
        game.title.toLowerCase().replace(/\s+/g, ""),
        game.provider.toLowerCase().replace(/\s+/g, ""),
        game.category.toLowerCase().replace(/\s+/g, ""),
      ];

      // Check if any field matches the regex
      return searchableFields.some((field) => regex.test(field));
    });

    return results.slice(0, limit);
  }

  /**
   * Advanced search with custom regex pattern
   * Only returns games with valid id and imageUrl
   */
  searchAdvanced({
    query,
    limit = 20,
    exactMatch = false,
    popularOnly = false,
  }: SearchOptions & { exactMatch?: boolean }): GreGameItem[] {
    let validGames = this.getValidGames();

    if (popularOnly) {
      validGames = validGames.filter((game) => game.popular === true);
    }

    if (!query || query.trim() === "") {
      return validGames.slice(0, limit);
    }

    const cleanQuery = query.toLowerCase().trim().replace(/\s+/g, "");

    let results: GreGameItem[];

    if (exactMatch) {
      // Exact match ignoring case and spaces
      results = validGames.filter((game) => {
        return (
          game.title.toLowerCase().replace(/\s+/g, "") === cleanQuery ||
          game.provider.toLowerCase().replace(/\s+/g, "") === cleanQuery ||
          game.category.toLowerCase().replace(/\s+/g, "") === cleanQuery
        );
      });
    } else {
      // Fuzzy match with regex - checks if query is CONTAINED in the field
      const regexPattern = cleanQuery.split("").join("\\s*");
      const regex = new RegExp(regexPattern, "i");

      results = validGames.filter((game) => {
        const searchableFields = [
          game.title.toLowerCase().replace(/\s+/g, ""),
          game.provider.toLowerCase().replace(/\s+/g, ""),
          game.category.toLowerCase().replace(/\s+/g, ""),
        ];

        return searchableFields.some((field) => regex.test(field));
      });
    }

    return results.slice(0, limit);
  }

  /**
   * Search by specific field only
   * Only returns games with valid id and imageUrl
   */
  searchByField(
    field: "title" | "provider" | "category",
    query: string,
    limit: number = 20,
    popularOnly: boolean = false,
  ): GreGameItem[] {
    let validGames = this.getValidGames();

    if (popularOnly) {
      validGames = validGames.filter((game) => game.popular === true);
    }

    if (!query || query.trim() === "") {
      return validGames.slice(0, limit);
    }

    const cleanQuery = query.toLowerCase().trim().replace(/\s+/g, "");
    const regexPattern = cleanQuery.split("").join("\\s*");
    const regex = new RegExp(regexPattern, "i");

    const results = validGames.filter((game) => {
      const fieldValue = game[field].toLowerCase().replace(/\s+/g, "");
      return regex.test(fieldValue);
    });

    return results.slice(0, limit);
  }

  /**
   * Get all valid games with pagination
   */
  getAll(page: number = 1, limit: number = 20): GreGameItem[] {
    const validGames = this.getValidGames();
    const start = (page - 1) * limit;
    const end = start + limit;
    return validGames.slice(start, end);
  }

  /**
   * Get games by provider
   */
  getByProvider(
    provider: string,
    limit: number = 20,
    popularOnly: boolean = false,
  ): GreGameItem[] {
    return this.searchByField("provider", provider, limit, popularOnly);
  }

  /**
   * Get games by category - checks BOTH category AND title
   */
  getByCategory(
    category: string,
    limit: number = 20,
    popularOnly: boolean = false,
  ): GreGameItem[] {
    let validGames = this.getValidGames();

    if (popularOnly) {
      validGames = validGames.filter((game) => game.popular === true);
    }

    if (!category || category.trim() === "") {
      return validGames.slice(0, limit);
    }

    const cleanQuery = category.toLowerCase().trim().replace(/\s+/g, "");
    const regexPattern = cleanQuery.split("").join("\\s*");
    const regex = new RegExp(regexPattern, "i");

    const results = validGames.filter((game) => {
      const categoryValue = game.category.toLowerCase().replace(/\s+/g, "");
      const titleValue = game.title.toLowerCase().replace(/\s+/g, "");

      return regex.test(categoryValue) || regex.test(titleValue);
    });

    return results.slice(0, limit);
  }

  /**
   * Get total count of valid games
   */
  getTotalValidGames(): number {
    return this.getValidGames().length;
  }

  /**
   * Get games with missing id or imageUrl (for debugging)
   */
  getInvalidGames(): GreGameItem[] {
    return this.games.filter((game) => !this.isValidGame(game));
  }
}

export const gameSearchEngine = new GameSearch(greGamesList);

export const getGreCasinoNameAndCategoryById = (id: string) => {
  const game = greGamesList.find((game) => game.id == id);

  if (!game) {
    return { name: "", category: null };
  }

  let category = null;

  if (/slot[\s_-]*s?/i.test(game.category)) {
    category = BettingCategory.SLOT;
  } else if (/fishing[\s_-]*s?/i.test(game.category)) {
    category = BettingCategory.FISH;
  } else if (/poker[\s_-]*s?/i.test(game.category)) {
    category = BettingCategory.POKER;
  } else if (/live[\s_-]*dealer[\s_-]*s?/i.test(game.category)) {
    category = BettingCategory.LIVE_CASINO;
  } else {
    category = BettingCategory.SLOT;
  }
  return { name: game?.title, category };
};
