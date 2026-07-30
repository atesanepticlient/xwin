"use client";
import React from "react";
import { TransactionFilters as Filters } from "@/types/api";
import { cn } from "@/lib/utils";
import { IoSearchOutline, IoCloseCircle } from "react-icons/io5";

const PILL_BASE =
  "px-3 py-1.5 text-xs md:text-sm rounded-full border transition-colors whitespace-nowrap";

const TypePills = ({
  value,
  onChange,
}: {
  value: Filters["type"];
  onChange: (v: Filters["type"]) => void;
}) => (
  <div className="flex gap-2">
    {(["all", "deposit", "withdraw"] as const).map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={cn(
          PILL_BASE,
          value === t
            ? "bg-brand-foreground text-white border-brand-foreground"
            : "bg-white text-accent border-border hover:border-brand-foreground",
        )}
      >
        {t === "all" ? "All" : t === "deposit" ? "Deposits" : "Withdrawals"}
      </button>
    ))}
  </div>
);

const StatusPills = ({
  value,
  onChange,
}: {
  value: Filters["status"];
  onChange: (v: Filters["status"]) => void;
}) => (
  <div className="flex gap-2 flex-wrap">
    {(["all", "PENDING", "ACCEPTED", "REJECTED"] as const).map((s) => (
      <button
        key={s}
        onClick={() => onChange(s)}
        className={cn(
          PILL_BASE,
          value === s
            ? s === "REJECTED"
              ? "bg-red-500 text-white border-red-500"
              : s === "ACCEPTED"
                ? "bg-green-600 text-white border-green-600"
                : s === "PENDING"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-[#141B1F] text-white border-[#141B1F]"
            : "bg-white text-accent border-border hover:border-[#141B1F]",
        )}
      >
        {s === "all" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
      </button>
    ))}
  </div>
);

const MethodPills = ({
  value,
  onChange,
}: {
  value: Filters["method"];
  onChange: (v: Filters["method"]) => void;
}) => (
  <div className="flex gap-2">
    {(["all", "MOBILE_BANKING", "CRYPTO"] as const).map((m) => (
      <button
        key={m}
        onClick={() => onChange(m)}
        className={cn(
          PILL_BASE,
          value === m
            ? "bg-[#336633] text-white border-[#336633]"
            : "bg-white text-accent border-border hover:border-[#336633]",
        )}
      >
        {m === "all"
          ? "All Methods"
          : m === "MOBILE_BANKING"
            ? "E-Wallet"
            : "Crypto"}
      </button>
    ))}
  </div>
);

const TransactionFiltersBar = ({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) => {
  const [searchInput, setSearchInput] = React.useState(filters.search ?? "");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const resetAll = () => {
    setSearchInput("");
    setFilters({ type: "all", status: "all", method: "all", page: 1 });
  };

  const isFiltered =
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.method !== "all" ||
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    Boolean(filters.search);

  return (
    <div className="bg-white p-3 md:p-4 rounded-md flex flex-col gap-3">
      <div className="relative">
        <IoSearchOutline className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by transaction ID or account..."
          className="w-full text-xs md:text-sm pl-8 pr-8 py-2 border border-[#8f9da8] outline-none text-[#1f72ad]"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput("")}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <IoCloseCircle className="text-gray-400 w-4 h-4" />
          </button>
        )}
      </div>

      <TypePills
        value={filters.type}
        onChange={(v) => setFilters((f) => ({ ...f, type: v, page: 1 }))}
      />
      <StatusPills
        value={filters.status}
        onChange={(v) => setFilters((f) => ({ ...f, status: v, page: 1 }))}
      />
      <MethodPills
        value={filters.method}
        onChange={(v) => setFilters((f) => ({ ...f, method: v, page: 1 }))}
      />

      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500">From</label>
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                from: e.target.value || undefined,
                page: 1,
              }))
            }
            className="text-xs p-1 border border-[#8f9da8] outline-none text-[#1f72ad]"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500">To</label>
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                to: e.target.value || undefined,
                page: 1,
              }))
            }
            className="text-xs p-1 border border-[#8f9da8] outline-none text-[#1f72ad]"
          />
        </div>
        {isFiltered && (
          <button
            onClick={resetAll}
            className="text-xs text-red-500 underline ml-auto self-end mb-1"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionFiltersBar;
