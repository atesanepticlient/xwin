import availableGames from "@/../data/games.json";
import popular from "@/../data/populart-games.json";
import fish from "@/../data/fish-games.json";
import poker from "@/../data/poker-games.json";
import live from "@/../data/live-games.json";
import { GameItem, GreGameItem } from "@/types/game";

import greGamesList from "@/../data/all-gre-games.json";

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
   * Search games by name, provider, or category
   * Uses regex for flexible matching (case-insensitive, ignores spaces)
   * Only returns games with valid id and imageUrl
   */
  search({ query, limit = 20 }: SearchOptions): GreGameItem[] {
    const validGames = this.getValidGames();

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
  }: SearchOptions & { exactMatch?: boolean }): GreGameItem[] {
    const validGames = this.getValidGames();

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
  ): GreGameItem[] {
    const validGames = this.getValidGames();

    if (!query || query.trim() === "") {
      return validGames.slice(0, limit);
    }

    const cleanQuery = query.toLowerCase().trim().replace(/\s+/g, "");
    // Check if query is contained anywhere in the field
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
   * Only returns games with valid id and imageUrl
   */
  getByProvider(provider: string, limit: number = 20): GreGameItem[] {
    return this.searchByField("provider", provider, limit);
  }

  /**
   * Get games by category - checks BOTH category AND title
   * This will find "fish" in category like "fishing" and also in titles
   */
  getByCategory(category: string, limit: number = 20): GreGameItem[] {
    const validGames = this.getValidGames();

    if (!category || category.trim() === "") {
      return validGames.slice(0, limit);
    }

    const cleanQuery = category.toLowerCase().trim().replace(/\s+/g, "");
    // Create pattern that matches if the word is contained anywhere
    const regexPattern = cleanQuery.split("").join("\\s*");
    const regex = new RegExp(regexPattern, "i");

    const results = validGames.filter((game) => {
      const categoryValue = game.category.toLowerCase().replace(/\s+/g, "");
      const titleValue = game.title.toLowerCase().replace(/\s+/g, "");

      // Check if query is CONTAINED in category OR title
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
