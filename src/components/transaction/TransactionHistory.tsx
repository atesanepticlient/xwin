"use client";
import React, { useState } from "react";
import { useFetchTransactionsQuery } from "@/lib/features/paymentApiSlice";
import { TransactionFilters } from "@/types/api";
import TransactionFiltersBar from "./TransactionFilters";
import TransactionStatsBar from "./TransactionStatsBar";
import TransactionList from "./TransactionList";
import { ScaleLoader } from "react-spinners";

const DEFAULT_FILTERS: TransactionFilters = {
  type: "all",
  status: "all",
  method: "all",
  page: 1,
};

const TransactionHistory = () => {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const { data, isLoading, isFetching } = useFetchTransactionsQuery(filters);

  return (
    <div className="flex flex-col gap-3">
      <TransactionFiltersBar filters={filters} setFilters={setFilters} />

      {data?.stats && <TransactionStatsBar stats={data.stats} />}

      {isLoading ? (
        <div className="w-full py-10 flex justify-center">
          <ScaleLoader color="#212121" />
        </div>
      ) : (
        <>
          <TransactionList items={data?.items ?? []} />

          {data?.hasMore && (
            <button
              disabled={isFetching}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              className="text-sm text-brand-foreground underline py-2 disabled:opacity-50"
            >
              {isFetching ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;
