"use client";

import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaRegCalendarAlt, FaCheck } from "react-icons/fa";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    startDate: string;
    endDate: string;
    category: string;
    status: string;
  };
  onApplyFilters: (newFilters: {
    startDate: string;
    endDate: string;
    category: string;
    status: string;
  }) => void;
  onResetFilters: () => void;
}

const CATEGORIES = [
  { id: "SPORTS", label: "Sports" },
  { id: "LIVE", label: "Live" },
  { id: "SLOT", label: "Slot" },
  { id: "POKER", label: "Poker" },
  { id: "FISH", label: "Fish" },
];

const STATUSES = [
  { id: "ALL", label: "All Statuses" },
  { id: "RUNNING", label: "Running" },
  { id: "SETTLED", label: "Settled" },
  { id: "CANCELED", label: "Canceled" },
  { id: "VOID", label: "Void" },
];

export default function BetHistoryFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterModalProps) {
  const [startDate, setStartDate] = useState(filters.startDate || "2026-07-21");
  const [endDate, setEndDate] = useState(filters.endDate || "2026-07-27");
  const [category, setCategory] = useState(filters.category || "ALL");
  const [status, setStatus] = useState(filters.status || "ALL");

  // Sync state if props change
  useEffect(() => {
    if (filters.startDate) setStartDate(filters.startDate);
    if (filters.endDate) setEndDate(filters.endDate);
    if (filters.category) setCategory(filters.category);
    if (filters.status) setStatus(filters.status);
  }, [filters]);

  // Accordion sections toggle states
  const [openSections, setOpenSections] = useState({
    period: true,
    betType: false,
    betStatus: false,
    gameType: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleApply = () => {
    onApplyFilters({ startDate, endDate, category, status });
    onClose();
  };

  const handleCancel = () => {
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
      {/* Dimmed Background Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
      />

      {/* Sliding Filter Modal Container */}
      <div
        className={`relative w-full h-full max-w-lg mx-auto bg-[#F2F2F4] flex flex-col justify-between font-sans transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Dark Header */}
        <header className="top-0 left-0 sticky flex px-3 items-center gap-3 bg-[#333333] text-white h-14 z-10 shadow-md">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#444444] hover:bg-[#555555] text-white transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold uppercase tracking-wider">
            FILTERS
          </h2>
        </header>

        {/* Accordion Body */}
        <div className="p-3 flex-1 space-y-3 overflow-y-auto">
          {/* 1. Period bets placed */}
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
                {/* Info banner */}
                <div className="bg-[#F8F8F8] text-gray-700 text-xs py-2.5 px-3 rounded-lg">
                  Maximum period: 31 days.
                </div>

                {/* Start Date */}
                <div className="relative border border-gray-300 rounded-xl px-3 py-2 focus-within:border-gray-800 transition-colors">
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

                {/* Expiration Date */}
                <div className="relative border border-gray-300 rounded-xl px-3 py-2 focus-within:border-gray-800 transition-colors">
                  <label className="block text-[10px] text-gray-400 font-medium">
                    Expiration date
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

          {/* 2. Bet type */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("betType")}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-800 text-[15px]"
            >
              <span>Bet type</span>
              {openSections.betType ? (
                <IoChevronUp className="w-5 h-5 text-gray-700" />
              ) : (
                <IoChevronDown className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* 3. Bet status */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("betStatus")}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-800 text-[15px]"
            >
              <span>Bet status</span>
              {openSections.betStatus ? (
                <IoChevronUp className="w-5 h-5 text-gray-700" />
              ) : (
                <IoChevronDown className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {openSections.betStatus && (
              <div className="px-4 pb-4 space-y-3 pt-2 border-t border-gray-100">
                {STATUSES.map((st) => (
                  <label
                    key={st.id}
                    onClick={() => setStatus(st.id)}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        status === st.id
                          ? "bg-black border-black text-white"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {status === st.id && <FaCheck className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {st.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 4. Game type / Category */}
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
                {CATEGORIES.map((cat) => {
                  const isChecked = category === cat.id;
                  return (
                    <label
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className="flex items-center gap-3 cursor-pointer py-1"
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-[#333333] border-[#333333] text-white"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {isChecked && <FaCheck className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {cat.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={handleCancel}
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
