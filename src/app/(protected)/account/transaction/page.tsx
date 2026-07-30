import React from "react";
import PageHeader from "@/components/page-header";
import TransactionHistory from "@/components/transaction/TransactionHistory";

const TransactionPage = () => {
  return (
    <div className="bg-slate-50 rounded-sm shadow-sm">
      <main>
        <PageHeader title="Transaction History" />
        <div className="p-2">
          <TransactionHistory />
        </div>
      </main>
    </div>
  );
};

export default TransactionPage;
