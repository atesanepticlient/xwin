"use client";

import PageHeader from "@/components/page-header";
import React, { useState, useEffect } from "react";
import { HiBars3 } from "react-icons/hi2";
import { IoFunnel, IoSwapVertical } from "react-icons/io5";
import BetHistoryFilterModal from "@/components/account/BetHistoryFilterModal";
import { cn } from "@/lib/utils";

interface Bet {
  id: string;
  createdAt: string;
  name: string | null;
  category: string;
  betAmount: number;
  profitNLoss: number | null;
  net: number | null;
  outcome: "WON" | "LOST" | "DRAW" | null;
  status: string;
  orderNo: string | null;
  wagerCode: string | null;
  roundId: string | null;
}

interface Summary {
  totalStaked: number;
  netProfitLoss: number;
  wins: number;
  losses: number;
  draws: number;
}

const DEFAULT_FILTERS = {
  startDate: "",
  endDate: "",
  category: "ALL",
  status: "ALL",
  outcome: "ALL",
};

const OUTCOME_BADGE: Record<string, string> = {
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-600",
  DRAW: "bg-amber-100 text-amber-700",
};

const STATUS_BADGE: Record<string, string> = {
  RUNNING: "bg-blue-100 text-blue-700",
  SETTLED: "bg-gray-100 text-gray-600",
  CANCELED: "bg-gray-200 text-gray-500",
  VOID: "bg-gray-200 text-gray-500",
};

const CATEGORY_LABEL: Record<string, string> = {
  SPORTS: "Sports",
  LIVE_CASINO: "Live Casino",
  SLOT: "Slot",
  POKER: "Poker",
  FISH: "Fish",
  OTHER: "Other",
};

export default function BetHistoryPage() {
  const [activeTab, setActiveTab] = useState<"website" | "unsettled">(
    "website",
  );
  const [bets, setBets] = useState<Bet[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [dateRange, setDateRange] = useState({
    from: "21/07/2026",
    to: "28/07/2026",
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  useEffect(() => {
    const fetchBetHistory = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          tab: activeTab,
          sortOrder,
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(filters.category !== "ALL" && { category: filters.category }),
          ...(filters.status !== "ALL" && { status: filters.status }),
          ...(filters.outcome !== "ALL" && { outcome: filters.outcome }),
        });

        const response = await fetch(
          `/api/bet-history?${queryParams.toString()}`,
        );
        const json = await response.json();

        if (json.success) {
          setBets(json.data);
          setSummary(json.summary ?? null);
          if (json.dateRange) {
            setDateRange(json.dateRange);
          }
          if (json.currency) {
            setCurrency(json.currency);
          }
        }
      } catch (err) {
        console.error("Failed to fetch bet records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBetHistory();
  }, [activeTab, sortOrder, filters]);

  const activeFilterCount =
    Number(filters.category !== "ALL") +
    Number(filters.status !== "ALL") +
    Number(filters.outcome !== "ALL") +
    Number(Boolean(filters.startDate));

  return (
    <>
      <PageHeader title="Bet History" />
      <div className="min-h-screen bg-[#F2F2F4] p-3 pb-24 flex flex-col justify-between max-w-lg mx-auto font-sans text-gray-800">
        <div className="space-y-3">
          {/* Top Bar Navigation */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl shadow-sm flex items-center h-12 overflow-hidden">
              <button
                onClick={() => setActiveTab("website")}
                className="flex-1 text-center text-[15px] font-medium h-full relative flex items-center justify-center"
              >
                <span
                  className={
                    activeTab === "website" ? "text-black" : "text-gray-500"
                  }
                >
                  On the website
                </span>
                {activeTab === "website" && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-[#10B981] rounded-t-full" />
                )}
              </button>

              <div className="w-px h-6 bg-gray-200" />

              <button
                onClick={() => setActiveTab("unsettled")}
                className="flex-1 text-center text-[15px] font-medium h-full relative flex items-center justify-center"
              >
                <span
                  className={
                    activeTab === "unsettled" ? "text-black" : "text-gray-500"
                  }
                >
                  Unsettled bets
                </span>
                {activeTab === "unsettled" && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-[#10B981] rounded-t-full" />
                )}
              </button>
            </div>

            <button className="bg-white rounded-xl h-12 w-12 flex items-center justify-center shadow-sm text-gray-700">
              <HiBars3 className="w-6 h-6" />
            </button>
          </div>

          {/* Summary strip */}
          {summary && !loading && bets.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white rounded-xl p-2.5 shadow-sm">
                <p className="text-[10px] text-gray-400">Staked</p>
                <p className="text-sm font-semibold text-gray-900">
                  {summary.totalStaked.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-sm">
                <p className="text-[10px] text-gray-400">Net P/L</p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    summary.netProfitLoss > 0
                      ? "text-green-600"
                      : summary.netProfitLoss < 0
                        ? "text-red-500"
                        : "text-gray-900",
                  )}
                >
                  {summary.netProfitLoss > 0 ? "+" : ""}
                  {summary.netProfitLoss.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-sm">
                <p className="text-[10px] text-gray-400">Won</p>
                <p className="text-sm font-semibold text-green-600">
                  {summary.wins}
                </p>
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-sm">
                <p className="text-[10px] text-gray-400">Lost</p>
                <p className="text-sm font-semibold text-red-500">
                  {summary.losses}
                </p>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl min-h-[65vh] p-4 flex flex-col items-center  text-center shadow-sm">
            {loading ? (
              <div className="text-gray-400 text-sm mt-10">Loading bets...</div>
            ) : bets.length === 0 ? (
              <div className="max-w-xs space-y-2 mt-10">
                <h3 className="font-bold text-[17px] text-gray-900">
                  Bets not found
                </h3>
                <p className="text-gray-500 text-[14px] leading-snug">
                  No bets found between {dateRange.from} and {dateRange.to}. Try
                  changing the time interval in the filter
                </p>
              </div>
            ) : (
              <div className="w-full space-y-2.5 text-left">
                {bets.map((bet) => (
                  <div
                    key={String(bet.id)}
                    className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {bet.name ||
                              CATEGORY_LABEL[bet.category] ||
                              bet.category}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase shrink-0">
                            {CATEGORY_LABEL[bet.category] || bet.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(bet.createdAt).toLocaleString()}
                        </p>
                        {(bet.orderNo || bet.wagerCode) && (
                          <p className="text-[10px] text-gray-300 mt-0.5 truncate">
                            {bet.orderNo && <>Order: {bet.orderNo}</>}
                            {bet.orderNo && bet.wagerCode && " • "}
                            {bet.wagerCode && <>Wager: {bet.wagerCode}</>}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-block",
                            STATUS_BADGE[bet.status] ??
                              "bg-gray-100 text-gray-600",
                          )}
                        >
                          {bet.status}
                        </span>
                        {bet.outcome && (
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-block mt-1 ml-1",
                              OUTCOME_BADGE[bet.outcome],
                            )}
                          >
                            {bet.outcome}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stake / Return / Net breakdown */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400">Stake</p>
                        <p className="text-xs font-medium text-gray-900">
                          {bet.betAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Return</p>
                        <p className="text-xs font-medium text-gray-900">
                          {bet.profitNLoss != null
                            ? bet.profitNLoss.toFixed(2)
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Net</p>
                        <p
                          className={cn(
                            "text-xs font-semibold",
                            bet.net == null
                              ? "text-gray-400"
                              : bet.net > 0
                                ? "text-green-600"
                                : bet.net < 0
                                  ? "text-red-500"
                                  : "text-gray-500",
                          )}
                        >
                          {bet.net == null
                            ? "—"
                            : `${bet.net > 0 ? "+" : ""}${bet.net.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Filter & Account Selector Controls */}
        <div className="flex items-center gap-2 p-3 fixed left-0 right-0 bottom-0 bg-white border-t border-gray-100 max-w-lg mx-auto z-40">
          <div className="flex-1 bg-[#f4f4f4] rounded-xl p-2.5 shadow-sm">
            <p className="text-[11px] text-gray-400">Account</p>
            <p className="text-sm font-semibold text-gray-900 underline decoration-gray-400 underline-offset-2">
              Main account{" "}
              {currency ? (
                <>({currency})</>
              ) : (
                <span className="inline-block rounded-sm w-7 h-2 bg-gray-300 animate-pulse"></span>
              )}
            </p>
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="bg-[#EAEAEA] hover:bg-gray-200 rounded-xl h-12 w-12 flex items-center justify-center text-gray-800 transition-colors relative"
          >
            <IoFunnel className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E31B23]" />
            )}
          </button>

          <button
            onClick={toggleSortOrder}
            className={`rounded-xl h-12 w-12 flex items-center justify-center transition-colors ${
              sortOrder === "asc"
                ? "bg-black text-white"
                : "bg-[#EAEAEA] text-gray-800 hover:bg-gray-200"
            }`}
            title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            <IoSwapVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BetHistoryFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
      />
    </>
  );
}
