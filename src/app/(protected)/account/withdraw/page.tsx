import React from "react";
import PaymentFilterButton from "@/components/account/deposit/PaymentFilterButton";
import Payment from "@/components/payment/Payment";
import PaymentWapper from "@/components/payment/PaymentWapper";
import { findCurrentUser } from "@/data/user";
import DpWdTab from "@/components/payment/dp-wd-tab";
import PageHeader from "@/components/page-header";
import AccountId from "@/components/account-id";
const WithdrawPage = async () => {
  const user = await findCurrentUser();
  return (
    <div className="bg-slate-50   md:px-4 md:py-5">
      <main>
        <PageHeader title="Withdraw found" />
        <DpWdTab />
        <div className="p-2 px-3 rounded-md bg-white">
          <div>
            <AccountId accountId={user?.playerId || ""} />
            <p className="hidden md:text-sm text-accent">
              Select payment method to withdraw money::
            </p>
          </div>
          <PaymentFilterButton />
        </div>

        <PaymentWapper type="withdraw">
          <Payment />
        </PaymentWapper>
      </main>
    </div>
  );
};

export default WithdrawPage;
