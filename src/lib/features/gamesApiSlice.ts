import { CasinoGamesOutput } from "@/types/api";
import { apiSlice } from "./apiSlice";
import { GameContent, GamesList } from "@/types/game";

const gamesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchGamesListb2b: builder.query<CasinoGamesOutput, void>({
      query: () => ({
        method: "GET",
        url: "/api/GetCasinoGamesList",
      }),
    }),

    fetchGamesList: builder.query<
      { success: boolean; gamesList: GamesList },
      void
    >({
      query: () => ({
        url: "api/asiaapi",
        method: "GET",
      }),
    }),

    openGame: builder.mutation<
      GameContent,
      { gameId: string; demo: string; gameType?: string }
    >({
      query: (body) => ({
        url: `api/open-game`,
        method: "POST",
        body: body,
      }),
    }),
    openGSCGame: builder.mutation<any, any>({
      query: (body) => ({
        url: `/api/gsc/open-game`,
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export const {
  useFetchGamesListQuery,
  useFetchGamesListb2bQuery,
  useOpenGameMutation,
  useOpenGSCGameMutation,
} = gamesApiSlice;
