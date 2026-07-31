import availableGames from "@/../data/games.json";
import popular from "@/../data/populart-games.json";
import fish from "@/../data/fish-games.json";
import poker from "@/../data/poker-games.json";
import live from "@/../data/live-games.json";
import { GameItem } from "@/types/game";

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
