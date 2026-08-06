/* eslint-disable @typescript-eslint/no-explicit-any */
import { Categories, GamesList, NetEnt } from "@/types/game";
import { create } from "zustand";

interface GameType {
  games: GamesList | null;
  isLoading: boolean;
  error: string;

  getGames: (
    category: string,
    name?: string,
    limit?: number,
    provider?: any,
  ) => NetEnt[] | null | undefined;

  setGames: (gamge: GamesList) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
}
export const useGames = create<GameType>((set, get) => ({
  games: null,
  isLoading: true,
  error: "",

  getGames: (category, name, limit, provider) => {
    const games = get().games!;
    if (!games) return null;
    const allGamesArrays = Object.values(games).flat();
    let flitedGames = allGamesArrays;
    if (category) {
      flitedGames = allGamesArrays.filter((game) => {
        if (category === Categories.Slots) {
          return game.categories === category;
        } else if (category == "popular") {
          return game.categories == Categories.FastGames;
        } else {
          return game.categories === category;
        }
      });
    }

    if (category == "popular") {
      flitedGames = [
        ...flitedGames,
        ...allGamesArrays.filter((game) =>
          [
            "15808",
            "15814",
            "15815",
            "15813",
            "15810",
            "15809",
            "15065",
            "15056",
            "15812",
            "7053",
            "10269",
            "9896",
          ].includes(game.id),
        ),
      ];
    }

    if (provider && provider !== "all") {
      flitedGames = allGamesArrays!.filter((game) => game.title === provider);
    }
    console.log("filder after search ", flitedGames);
    if (name) {
      const searchLower = name.toLowerCase();
      flitedGames = flitedGames?.filter((game) =>
        game.name.toLowerCase().includes(searchLower),
      );
    }

    if (limit !== undefined && limit > 0) {
      return flitedGames?.slice(0, limit);
    }

    return flitedGames!;
  },

  setGames: (games) => set((state) => ({ ...state, games })),
  setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
  setError: (error) => set((state) => ({ ...state, error })),
}));

interface GameFilterType {
  search: string;
  provider: string;
  category: string;

  setSearch: (search: string) => void;
  setProvider: (provider: string) => void;
  setCategory: (category: string) => void;

  clearFilter: () => void;
}
export const useGamesFilter = create<GameFilterType>((set) => ({
  search: "",
  provider: "",
  category: "",

  setSearch: (search) => set((state) => ({ ...state, search })),
  setProvider: (provider) => set((state) => ({ ...state, provider })),
  setCategory: (category) => set((state) => ({ ...state, category })),
  clearFilter: () =>
    set((state) => ({ ...state, category: "", provider: "", search: "" })),
}));

type TabType = "TOP" | "SPORTS" | "CASINO" | "ESPORTS" | "GAMES";

interface MobileHomeTabsStore {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
}

export const useMobileHomeTabsStore = create<MobileHomeTabsStore>((set) => ({
  selectedTab: "TOP",
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));

type AppStore = {
  isMobileSubdomain: boolean;
  subdomain: string | null;
  init: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  isMobileSubdomain: false,
  subdomain: null,

  init: () => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    // mobile.site.com -> "mobile"
    // www.site.com -> "www"
    // site.com -> null
    const subdomain = parts.length > 2 ? parts[0] : null;

    set({
      subdomain,
      isMobileSubdomain: true,
    });
  },
}));
