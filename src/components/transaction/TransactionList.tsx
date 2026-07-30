// components/account/transactions/TransactionList.tsx
import React from "react";
import { TransactionItem } from "@/types/api";
import TransactionCard from "./TransactionCard";

const TransactionList = ({ items }: { items: TransactionItem[] }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-md p-8 text-center">
        <p className="text-sm text-gray-400">No transactions match these filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((tx) => (
        <TransactionCard key={`${tx.kind}-${tx.id}`} tx={tx} />
      ))}
    </div>
  );
};

export default TransactionList;