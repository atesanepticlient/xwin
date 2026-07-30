"use client";
import { useFetchWalletQuery } from "@/lib/features/paymentApiSlice";
import React from "react";
import { FiRefreshCw, FiPlus } from "react-icons/fi";
import { PiWalletBold } from "react-icons/pi";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const Balance = () => {
  const { data, isLoading, refetch, isFetching } = useFetchWalletQuery();

  const wallet = data?.wallet;
  const isPending = isLoading || isFetching || !wallet;
  console.log({ wallet });
  return (
    <div className="flex items-stretch rounded-full border border-[#242424] bg-[#151515] overflow-hidden shadow-[0_0_0_1px_rgba(31,193,107,0.05)]">
      {/* Balance readout */}
      <div className="flex items-center gap-2 pl-3 pr-4 py-1.5 cursor-default">
        <div className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-[#1FC16B]/10 text-[#1FC16B] shrink-0">
          <PiWalletBold className="w-3.5 h-3.5" />
        </div>

        {isPending ? (
          <Skeleton className="w-[52px] md:w-[130px] h-[14px] rounded bg-[#262626]" />
        ) : (
          <div className="flex flex-col leading-tight">
            <span className="hidden md:block text-[10px] font-medium uppercase tracking-wider text-white/40">
              Main account
            </span>
            <p className="text-xs md:text-sm font-semibold text-white tracking-wide tabular-nums">
              {Number(wallet.balance).toFixed(2)}
              <span className="ml-1 text-[10px] md:text-[11px] font-medium text-white/40">
                {wallet.currencyCode}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Refresh — desktop */}
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        aria-label="Refresh balance"
        className="hidden md:flex items-center justify-center w-9 border-l border-[#242424] bg-[#1a1a1a] hover:bg-[#242424] text-white/60 hover:text-white transition-colors duration-200 disabled:opacity-50"
      >
        <FiRefreshCw
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isFetching && "animate-spin",
          )}
        />
      </button>

      {/* Deposit — primary CTA */}
      <Link
        href="/account/deposit"
        aria-label="Deposit"
        className="flex items-center justify-center w-9 md:w-10 border-l border-[#242424] bg-[#1FC16B] hover:bg-[#19A85D] text-black transition-colors duration-200"
      >
        <FiPlus className="w-4 h-4" strokeWidth={2.5} />
      </Link>
    </div>
  );
};

export default Balance;
