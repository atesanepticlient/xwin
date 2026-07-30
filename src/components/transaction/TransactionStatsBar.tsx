import React from "react";
import { TransactionsResponse } from "@/types/api";

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) => (
  <div className="bg-white rounded-md p-2 md:p-3 flex-1 min-w-[110px]">
    <p className="text-[10px] md:text-xs text-gray-500 uppercase truncate">
      {label}
    </p>
    <p className={`text-sm md:text-lg font-semibold ${accent}`}>{value}</p>
  </div>
);

const TransactionStatsBar = ({
  stats,
}: {
  stats: TransactionsResponse["stats"];
}) => {
  const totalIn = stats.deposit.totalAmount;
  const totalOut = stats.withdraw.totalAmount;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
      <StatCard
        label="Total Deposited"
        value={totalIn.toFixed(2)}
        accent="text-green-600"
      />
      <StatCard
        label="Total Withdrawn"
        value={totalOut.toFixed(2)}
        accent="text-red-500"
      />
      <StatCard
        label="Pending"
        value={String(stats.pendingCount)}
        accent="text-amber-500"
      />
      <StatCard
        label="Deposits"
        value={String(stats.deposit.total)}
        accent="text-[#141B1F]"
      />
      <StatCard
        label="Withdrawals"
        value={String(stats.withdraw.total)}
        accent="text-[#141B1F]"
      />
    </div>
  );
};

export default TransactionStatsBar;
