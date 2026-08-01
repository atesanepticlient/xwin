"use client";

import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaRegCalendarAlt, FaCheck } from "react-icons/fa";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";

interface Filters {
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  outcome: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApplyFilters: (newFilters: Filters) => void;
  onResetFilters: () => void;
}

const CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "SPORTS", label: "Sports" },
  { id: "LIVE_CASINO", label: "Live Casino" },
  { id: "SLOT", label: "Slot" },
  { id: "POKER", label: "Poker" },
  { id: "FISH", label: "Fish" },
  { id: "OTHER", label: "Other" },
];

const STATUSES = [
  { id: "ALL", label: "All Statuses" },
  { id: "RUNNING", label: "Running" },
  { id: "SETTLED", label: "Settled" },
  { id: "CANCELED", label: "Canceled" },
  { id: "VOID", label: "Void" },
];

const OUTCOMES = [
  { id: "ALL", label: "All Outcomes", dot: "bg-gray-400" },
  { id: "WON", label: "Won", dot: "bg-green-500" },
  { id: "LOST", label: "Lost", dot: "bg-red-500" },
  { id: "DRAW", label: "Draw", dot: "bg-amber-500" },
];

export default function BetHistoryFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: FilterModalProps) {
  // Compute standard 30-day default dates dynamically
  const defaultEndDate = new Date().toISOString().split("T")[0];
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(
    filters.startDate || defaultStartDate,
  );
  const [endDate, setEndDate] = useState(filters.endDate || defaultEndDate);
  const [category, setCategory] = useState(filters.category || "ALL");
  const [status, setStatus] = useState(filters.status || "ALL");
  const [outcome, setOutcome] = useState(filters.outcome || "ALL");

  useEffect(() => {
    setStartDate(filters.startDate || defaultStartDate);
    setEndDate(filters.endDate || defaultEndDate);
    setCategory(filters.category || "ALL");
    setStatus(filters.status || "ALL");
    setOutcome(filters.outcome || "ALL");
  }, [filters]);

  const [openSections, setOpenSections] = useState({
    period: true,
    outcome: true,
    betStatus: false,
    gameType: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleApply = () => {
    onApplyFilters({ startDate, endDate, category, status, outcome });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100000] flex flex-col justify-end transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
      />

      <div
        className={`relative w-full h-full max-w-lg mx-auto bg-[#F2F2F4] flex flex-col justify-between font-sans transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <header className="top-0 left-0 sticky flex px-3 items-center justify-between bg-[#333333] text-white h-14 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#444444] hover:bg-[#555555] text-white transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold uppercase tracking-wider">
              FILTERS
            </h2>
          </div>
          <button
            onClick={onResetFilters}
            className="text-xs text-gray-300 hover:text-white underline font-medium"
          >
            Reset
          </button>
        </header>

        <div className="p-3 flex-1 space-y-3 overflow-y-auto">
          {/* Period Filter */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("period")}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-800 text-[15px]"
            >
              <span>Period bets placed</span>
              {openSections.period ? (
                <IoChevronUp className="w-5 h-5 text-gray-700" />
              ) : (
                <IoChevronDown className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {openSections.period && (
              <div className="px-4 pb-4 space-y-3 pt-1 border-t border-gray-100">
                <div className="relative border border-gray-300 rounded-xl px-3 py-2">
                  <label className="block text-[10px] text-gray-400 font-medium">
                    Start date
                  </label>
                  <div className="flex items-center justify-between">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-sm font-medium text-gray-800 outline-none bg-transparent"
                    />
                    <FaRegCalendarAlt className="text-gray-700 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                <div className="relative border border-gray-300 rounded-xl px-3 py-2">
                  <label className="block text-[10px] text-gray-400 font-medium">
                    End date
                  </label>
                  <div className="flex items-center justify-between">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-sm font-medium text-gray-800 outline-none bg-transparent"
                    />
                    <FaRegCalendarAlt className="text-gray-700 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Outcome Filter */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("outcome")}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-800 text-[15px]"
            >
              <span>Outcome</span>
              {openSections.outcome ? (
                <IoChevronUp className="w-5 h-5 text-gray-700" />
              ) : (
                <IoChevronDown className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {openSections.outcome && (
              <div className="px-4 pb-4 space-y-3 pt-2 border-t border-gray-100">
                {OUTCOMES.map((o) => (
                  <label
                    key={o.id}
                    onClick={() => setOutcome(o.id)}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        outcome === o.id
                          ? "bg-black border-black text-white"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {outcome === o.id && <FaCheck className="w-3 h-3" />}
                    </div>
                    <span className={`w-2 h-2 rounded-full ${o.dot}`} />
                    <span className="text-sm font-medium text-gray-800">
                      {o.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Game Type Filter */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("gameType")}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-800 text-[15px]"
            >
              <span>Game type</span>
              {openSections.gameType ? (
                <IoChevronUp className="w-5 h-5 text-gray-700" />
              ) : (
                <IoChevronDown className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {openSections.gameType && (
              <div className="px-4 pb-4 space-y-3 pt-2 border-t border-gray-100">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        category === cat.id
                          ? "bg-[#333333] border-[#333333] text-white"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {category === cat.id && <FaCheck className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold uppercase rounded-xl bg-[#EBEBEB] hover:bg-gray-200 text-gray-800 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 text-sm font-bold uppercase rounded-xl bg-[#E56A6B] hover:bg-red-600 text-white transition-colors"
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  );
}
