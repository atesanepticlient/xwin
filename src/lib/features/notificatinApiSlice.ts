import { apiSlice } from "./apiSlice";
export interface NotificationPayload {
  profileStatus: "HIGH_RISK" | "WARNING" | null;
  scurityStatus: "WARNING" | null;
  unSeenMessage: boolean;
  claimableCashback: boolean;
  depositNofication: boolean;
  withdrawalNofication: boolean;
}

export type ProcessType = "DEPOSIT" | "WITHDRAW" | "MESSAGE";
const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    markNotificationsAsSeen: builder.mutation<
      { success: boolean },
      { proccessQueue: ProcessType[] }
    >({
      query: (body) => ({
        url: "api//notification/mark-seen", // Adjust path to your POST route
        method: "POST",
        body,
      }),
      // Automatically refetch notifications to update UI instantly across all components
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {useMarkNotificationsAsSeenMutation} = notificationApiSlice;
