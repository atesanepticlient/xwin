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
  status: string;
  orderNo: string | null;
}

interface Summary {
  totalStaked: number;
  netProfitLoss: number;
  wins: number;
  losses: number;
  evens: number;
}

const OUTCOME_OPTIONS = ["ALL", "WON", "LOST", "EVEN"] as const;
type Outcome = (typeof OUTCOME_OPTIONS)[number];

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
  const [outcome, setOutcome] = useState<Outcome>("ALL");

  const [dateRange, setDateRange] = useState({
    from: "21/07/2026",
    to: "28/07/2026",
  });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "ALL",
    status: "ALL",
  });

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
          outcome,
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(filters.category !== "ALL" && { category: filters.category }),
          ...(filters.status !== "ALL" && { status: filters.status }),
        });

        const response = await fetch(
          `/api/bet-history?${queryParams.toString()}`,
        );
        const json = await response.json();
        console.log({ json });
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
  }, [activeTab, sortOrder, outcome, filters]);

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

          {/* Win/Loss Outcome Pills — hidden on unsettled tab, nothing is settled there */}
          {activeTab === "website" && (
            <div className="flex gap-2 overflow-x-auto">
              {OUTCOME_OPTIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOutcome(o)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border whitespace-nowrap transition-colors",
                    outcome === o
                      ? o === "WON"
                        ? "bg-green-600 text-white border-green-600"
                        : o === "LOST"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200",
                  )}
                >
                  {o === "ALL"
                    ? "All"
                    : o === "WON"
                      ? "Won"
                      : o === "LOST"
                        ? "Lost"
                        : "Even"}
                </button>
              ))}
            </div>
          )}

          {/* Summary strip */}
          {summary && !loading && bets.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
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
                <p className="text-[10px] text-gray-400">W / L</p>
                <p className="text-sm font-semibold text-gray-900">
                  {summary.wins} / {summary.losses}
                </p>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl min-h-[65vh] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            {loading ? (
              <div className="text-gray-400 text-sm">Loading bets...</div>
            ) : bets.length === 0 ? (
              <div className="max-w-xs space-y-2">
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
                    className="p-3 border border-gray-100 rounded-xl flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {bet.name || bet.category}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(bet.createdAt).toLocaleString()}
                      </p>
                      {bet.orderNo && (
                        <p className="text-[10px] text-gray-300 mt-0.5">
                          #{bet.orderNo}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">
                        Stake: {bet.betAmount.toFixed(2)}
                      </p>
                      {bet.profitNLoss != null && bet.status === "SETTLED" ? (
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            bet.profitNLoss > 0
                              ? "text-green-600"
                              : bet.profitNLoss < 0
                                ? "text-red-500"
                                : "text-gray-500",
                          )}
                        >
                          {bet.profitNLoss > 0 ? "+" : ""}
                          {bet.profitNLoss.toFixed(2)}
                        </p>
                      ) : null}
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-block mt-0.5",
                          bet.status === "RUNNING"
                            ? "bg-amber-100 text-amber-700"
                            : bet.status === "SETTLED"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-red-100 text-red-600",
                        )}
                      >
                        {bet.status}
                      </span>
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
            {(filters.category !== "ALL" ||
              filters.status !== "ALL" ||
              filters.startDate) && (
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
        onResetFilters={() =>
          setFilters({
            startDate: "",
            endDate: "",
            category: "ALL",
            status: "ALL",
          })
        }
      />
    </>
  );
}
