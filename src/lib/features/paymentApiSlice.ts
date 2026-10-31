/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionFilters } from "@/types/api";
import { apiSlice } from "./apiSlice";
import { Prisma } from "@prisma/client";

/**
 * Payments now have exactly two entry points per flow:
 *   GET/POST /api/payment/deposit
 *   GET/POST /api/payment/withdraw
 * The server picks the country (BD / PK / none) and the method (e-wallet or
 * crypto) from the account and from body.walletId. The client never chooses a
 * provider or a provider-specific code.
 */
const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchPaymentData: builder.query<any, { type: "withdraw" | "deposit" }>({
      query: ({ type }) => ({
        method: "GET",
        url: `/api/payment/${type}`,
      }),
    }),

    // body: { walletId, amount, account?, transactionId? }
    // (old names transAmt / account_number / accountNumber are still accepted)
    makeDeposit: builder.mutation<any, any>({
      query: (body) => ({
        method: "POST",
        url: "/api/payment/deposit",
        body,
      }),
      invalidatesTags: ["history"],
    }),

    // body: { walletId, amount, account?, address? }
    makeWithdraw: builder.mutation<any, any>({
      query: (body) => ({
        method: "POST",
        url: "/api/payment/withdraw",
        body,
      }),
      invalidatesTags: ["history"],
    }),

    fetchTransactions: builder.query<any, TransactionFilters>({
      query: ({
        type = "all",
        status = "all",
        method = "all",
        from,
        to,
        search,
        page = 1,
      }) => {
        const params = new URLSearchParams();

        params.set("type", type);
        params.set("status", status);
        params.set("method", method);
        params.set("page", page.toString());

        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (search?.trim()) params.set("search", search.trim());

        return {
          url: `/api/transactions?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["history"],
    }),

    fetchWallet: builder.query<
      { wallet: Prisma.walletGetPayload<object> },
      void
    >({
      query: () => ({
        url: "/api/payment/wallet",
        method: "GET",
      }),
    }),

    fetchWithdrawAddress: builder.query({
      query: () => ({
        url: "/api/withdraw-address",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useFetchPaymentDataQuery,
  useMakeDepositMutation,
  useMakeWithdrawMutation,
  useFetchTransactionsQuery,
  useFetchWalletQuery,
  useFetchWithdrawAddressQuery,
} = paymentApiSlice;

/**
 * Deprecated aliases so components/payment/PaymentMain.tsx keeps compiling
 * unchanged. They all hit the same two root routes. Delete them once
 * PaymentMain uses useMakeDepositMutation / useMakeWithdrawMutation directly.
 */
export const useMakeApayDepositMutation = useMakeDepositMutation;
export const useMakeCollectionMutation = useMakeDepositMutation;
export const useMakeCryptoDepositMutation = useMakeDepositMutation;
export const useMakeApayWithdrawMutation = useMakeWithdrawMutation;
export const useMakePaymentMutation = useMakeWithdrawMutation;
export const useMakeCryptoWithdrawMutation = useMakeWithdrawMutation;
