// components/account/transactions/TransactionCard.tsx
import React from "react";
import { TransactionItem } from "@/types/api";
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from "react-icons/io5";
import { IoIosCopy } from "react-icons/io";

const STATUS_STYLE: Record<TransactionItem["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const TransactionCard = ({ tx }: { tx: TransactionItem }) => {
  const isDeposit = tx.kind === "DEPOSIT";

  return (
    <div className="bg-white rounded-md p-3 flex items-center gap-3">
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isDeposit ? "bg-green-100" : "bg-red-100"
        }`}
      >
        {isDeposit ? (
          <IoArrowDownCircleOutline className="w-5 h-5 text-green-600" />
        ) : (
          <IoArrowUpCircleOutline className="w-5 h-5 text-red-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#141B1F] truncate">
            {tx.walletName ?? (isDeposit ? "Deposit" : "Withdrawal")}
          </p>
          <p
            className={`text-sm font-semibold shrink-0 ${
              isDeposit ? "text-green-600" : "text-red-500"
            }`}
          >
            {isDeposit ? "+" : "-"}
            {tx.amount.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-500 truncate">
            {new Date(tx.createdAt).toLocaleString()}
          </p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[tx.status]}`}
          >
            {tx.status}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <p className="text-[10px] text-gray-400 truncate">
            ID: {tx.merchantId}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(tx.merchantId)}
            className="shrink-0"
          >
            <IoIosCopy className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
