"use client";

import PageHeader from "@/components/page-header";
import React, { useState, useEffect } from "react";
import { HiBars3 } from "react-icons/hi2";
import {
  IoFunnel,
  IoSwapVertical,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoRemoveCircle,
  IoArrowUndoCircle,
  IoTimeOutline,
} from "react-icons/io5";
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

const CATEGORY_LABEL: Record<string, string> = {
  SPORTS: "Sports",
  LIVE_CASINO: "Live Casino",
  SLOT: "Slot",
  POKER: "Poker",
  FISH: "Fish",
  OTHER: "Other",
};

/**
 * Visual language for the outcome row of each bet slip card, mirroring the
 * reference design (icon + label on the left, colored amount on the right).
 *
 * RUNNING bets (unsettled) get their own "Pending" treatment since they
 * don't have a resolved outcome yet.
 */
function getResultDisplay(bet: Bet) {
  if (bet.status === "RUNNING") {
    return {
      label: "Pending",
      icon: IoTimeOutline,
      colorClass: "text-blue-600",
      amountLabel: null as string | null,
    };
  }

  if (bet.status === "CANCELED" || bet.status === "VOID") {
    return {
      label: "Refund",
      icon: IoArrowUndoCircle,
      colorClass: "text-gray-700",
      amountLabel: `${bet.betAmount.toFixed(2)}`,
    };
  }

  if (bet.outcome === "WON") {
    return {
      label: "Win",
      icon: IoCheckmarkCircle,
      colorClass: "text-green-600",
      amountLabel: `${(bet.profitNLoss ?? 0).toFixed(2)}`,
    };
  }

  if (bet.outcome === "DRAW") {
    return {
      label: "Draw",
      icon: IoRemoveCircle,
      colorClass: "text-amber-600",
      amountLabel: `${(bet.profitNLoss ?? bet.betAmount).toFixed(2)}`,
    };
  }

  if (bet.outcome === "LOST") {
    return {
      label: "Lose",
      icon: IoCloseCircle,
      colorClass: "text-red-500",
      amountLabel: `${(bet.profitNLoss ?? 0).toFixed(2)}`,
    };
  }

  // Fallback for SETTLED bets with no resolvable outcome
  return {
    label: bet.status,
    icon: IoTimeOutline,
    colorClass: "text-gray-500",
    amountLabel: null,
  };
}

function formatSlipDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, time };
}

function BetSlipCard({ bet, currency }: { bet: Bet; currency: string }) {
  const { date, time } = formatSlipDate(bet.createdAt);
  const result = getResultDisplay(bet);
  const ResultIcon = result.icon;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
       
          <p className="text-xs text-gray-400 mt-0.5">
            {date} ({time})
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 my-3" />

      {/* Category / event summary pill */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {CATEGORY_LABEL[bet.category] || bet.category}
          {bet.name ? `: ${bet.name}` : ""}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium uppercase shrink-0">
          {bet.status.toLowerCase()}
        </span>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Bet type</span>
          <span className="text-gray-900 font-medium">Single bet</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Bet</span>
          <span className="text-gray-900 font-medium">
            {bet.betAmount.toFixed(2)} {currency}
          </span>
        </div>
      </div>

      {/* Outcome row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div
          className={cn(
            "flex items-center gap-1.5 font-semibold",
            result.colorClass,
          )}
        >
          <ResultIcon className="w-5 h-5" />
          <span>{result.label}</span>
        </div>
        {result.amountLabel && (
          <span className={cn("font-bold text-[15px]", result.colorClass)}>
            {result.amountLabel} {currency}
          </span>
        )}
      </div>
    </div>
  );
}

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
          <div className="bg-transparent min-h-[65vh] flex flex-col items-center text-center">
            {loading ? (
              <div className="text-gray-400 text-sm mt-10">Loading bets...</div>
            ) : bets.length === 0 ? (
              <div className="bg-white rounded-2xl w-full p-4 shadow-sm">
                <div className="max-w-xs mx-auto space-y-2 mt-10 mb-10">
                  <h3 className="font-bold text-[17px] text-gray-900">
                    {activeTab === "unsettled"
                      ? "No unsettled bets"
                      : "Bets not found"}
                  </h3>
                  <p className="text-gray-500 text-[14px] leading-snug">
                    {activeTab === "unsettled"
                      ? "You don't have any running bets right now."
                      : `No bets found between ${dateRange.from} and ${dateRange.to}. Try changing the time interval in the filter`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3 text-left">
                {bets.map((bet) => (
                  <BetSlipCard
                    key={String(bet.id)}
                    bet={bet}
                    currency={currency || "SGD"}
                  />
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
