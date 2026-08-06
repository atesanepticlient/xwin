export interface GamesList {
  evolution: NetEnt[];
  microgaming: NetEnt[];
  NetEnt: NetEnt[];
  pgsoft: NetEnt[];
  playngo: NetEnt[];
  red_tiger: NetEnt[];
  sport_betting: NetEnt[];
}

export interface NetEnt {
  id: string;
  name: string;
  img: string;
  device: string;
  title: Title;
  categories: Categories;
  bm: string;
  demo: string;
  rewriterule: string;
  exitButton: string;
}

export enum Categories {
  FastGames = "fast_games",
  LiveDealers = "live_dealers",
  Slots = "slots",
  Sport = "sport",
}

export enum Title {
  Evolution = "evolution",
  FastGames = "fast_games",
  Jili = "jili",
  Microgaming = "microgaming",
  NetEnt = "NetEnt",
  Pgsoft = "pgsoft",
  Playngo = "playngo",
  RedTiger = "red_tiger",
  SportBetting = "sport_betting",
}

export type GameContent = {
  content: {
    game: {
      url: string;
      iframe: "1" | "0";
      sessionId: string;
      width: string;
      vertical: "1" | "0";
      withoutFrame: "1" | "0";
      rewriterule: "1" | "0";
      localhost: "1" | "0";
      exitButton_mobile: "1" | "0";
      exitButton: "1" | "0";
      disableReload: "1" | "0";
      wager: "1" | "0";
      bonus: "1" | "0";
    };
    gameRes: {
      sessionId: string;
    };
  };
};

export interface GameItem {
  game_code: string;
  game_name: string;
  game_type: string;
  image_url: string;
  status: string;
  product_id: number;
  product_code: number;
  provider_icon?: string;
  is_favorite?: boolean;
  support_currency?: string;
}
export interface GreGameItem {
  id: string;
  isEnabled: boolean;
  title: string;
  imageUrl: string;
  category: string;
  provider: string;
}
