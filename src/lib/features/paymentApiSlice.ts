/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MakeWithdrawInput,
  MakeDepositInput,
  TransactionFilters,
} from "@/types/api";
import { apiSlice } from "./apiSlice";
import { Prisma } from "@prisma/client";

const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchPaymentData: builder.query<any, { type: "withdraw" | "deposit" }>({
      query: ({ type }) => ({
        method: "GET",
        url: `/api/payment?type=${type}`,
      }),
    }),

    makeDeposit: builder.mutation<{ message: string }, MakeDepositInput>({
      query: (body) => ({
        method: "POST",
        url: "/api/payment/deposit",
        body,
      }),
      invalidatesTags: ["history"],
    }),
    makeApayDeposit: builder.mutation<any, any>({
      query: (body) => ({
        method: "POST",
        url: "/api/payment/deposit",
        body,
      }),
      invalidatesTags: ["history"],
    }),
    makeWithdraw: builder.mutation<{ message: string }, MakeWithdrawInput>({
      query: (body) => ({
        method: "POST",
        url: "/api/payment/withdraw",
        body,
      }),
      invalidatesTags: ["history"],
    }),
    makeApayWithdraw: builder.mutation<any, any>({
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
    makeCollection: builder.mutation<
      any,
      {
        transAmt: number;
        payType: number;
        walletId: string;
        orderRemark?: string;
      }
    >({
      query: (body) => ({
        url: "/api/collection",
        method: "POST",
        body,
      }),
    }),
    makePayment: builder.mutation<
      any,
      {
        account: string;
        transAmt: number;
        payType: number;
        bnkCode?: string;
        remark?: string;
      }
    >({
      query: (body) => ({
        url: "/api/withdrawal/payment",
        method: "POST",
        body,
      }),
    }),

    makeCryptoDeposit: builder.mutation<
      any,
      { walletId: string; amount: number; transactionId: string }
    >({
      query: (body) => ({
        url: "/api/crypto/deposit",
        method: "POST",
        body,
      }),
    }),

    makeCryptoWithdraw: builder.mutation<
      any,
      { walletId: string; amount: number; address: string }
    >({
      query: (body) => ({
        url: "/api/crypto/withdraw",
        method: "POST",
        body,
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
  useMakeApayDepositMutation,
  useMakeApayWithdrawMutation,
  useMakeCollectionMutation,
  useMakePaymentMutation,
  useMakeCryptoDepositMutation,
  useMakeCryptoWithdrawMutation,
} = paymentApiSlice;
