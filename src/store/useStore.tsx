import { create } from "zustand";
import { SearchGamesProps } from "@/app/(game)/search-game";
import { PaymentMethodsState } from "./types";

export const useUpdatePageNavigation = create<{
  page: string;
  setPage: (page: string) => void;
}>((set) => ({
  page: "",
  setPage: (page) => set((state) => ({ ...state, page })),
}));

export const usePaymentMethods = create<PaymentMethodsState>((set) => ({
  type: undefined,
  allMethods: [],
  methods: [],
  currentMethod: "all methods",
  setType: (type) => set({ type }),
  setAllMethods: (methods) =>
    set({
      allMethods: methods,
      methods: [],
      currentMethod: "all methods",
    }),
  setMethod: (methodName) =>
    set((state) => {
      if (methodName === "all methods") {
        return { currentMethod: methodName, methods: [] };
      }
      const selected = state.allMethods.find(
        (m) => m.methodName === methodName,
      );
      return {
        currentMethod: methodName,
        methods: selected ? [selected] : [],
      };
    }),
}));

interface CasinoSearchProps {
  search: string;
  gameType: string;
  isSearchShow: boolean;

  setSearch: (search: string) => void;
  setGameType: (gameType: string) => void;
  setSearchShow: (isSearchShow: boolean) => void;
}

export const useCasinoSearch = create<CasinoSearchProps>((set) => ({
  search: "",
  gameType: "casino",
  isSearchShow: false,

  setSearch: (search) => set((state) => ({ ...state, search })),
  setGameType: (gameType) => set((state) => ({ ...state, gameType })),
  setSearchShow: (isSearchShow) => set((state) => ({ ...state, isSearchShow })),
}));

export const useSearchGames = create<{
  showSearchUi: boolean;
  filterParams: SearchGamesProps;
  toggleSearchUi: () => void;
  setFilterProps: (props: SearchGamesProps) => void;
}>((set) => ({
  showSearchUi: false,
  filterParams: {
    name: "",
    category: "",
    provider: "",
    filteringOff: false,
  },
  toggleSearchUi: () =>
    set((state) => ({ ...state, showSearchUi: !state.showSearchUi })),
  setFilterProps: (props) =>
    set((state) => ({ ...state, filterParams: props })),
}));

// interface OpenGameData {
//   content: {
//     game: {
//       url: string;
//     };
//   };
//   // Add other fields if needed
// }

interface OpenGameStore {
  gameUrl: string;
  loading: boolean;
  error: string | null;

  fetchGame: () => Promise<void>;

  pageType: "" | "live" | "line";
  setPageType: (type: "" | "live" | "line") => void;
}
export const useOpenGame = create<OpenGameStore>((set, get) => ({
  gameUrl: "",
  loading: false,
  error: null,

  pageType: "",

  setPageType: (type) => set({ pageType: type }),

  fetchGame: async () => {
    if (get().gameUrl || get().loading) return;

    try {
      set({ loading: true, error: null });

      const res = await fetch("/api/open-1x", {
        method: "POST",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to open game");
      }

      set({
        gameUrl: result.data.content.game.url,
        loading: false,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e.message,
      });
    }
  },
}));

export interface NotificationPayload {
  profileStatus: "HIGH_RISK" | "WARNING" | null;
  scurityStatus: "WARNING" | null;
  unSeenMessage: boolean;
  claimableCashback: boolean;
  depositNofication: boolean;
  withdrawalNofication: boolean;
}

interface NotificationState {
  notifications: NotificationPayload | null;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: null,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/notification"); // Adjust route to your endpoint path

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const data = await response.json();
      set({ notifications: data.payload, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "An unexpected error occurred",
        isLoading: false,
      });
    }
  },

  resetNotifications: () => {
    set({ notifications: null, isLoading: false, error: null });
  },
}));
