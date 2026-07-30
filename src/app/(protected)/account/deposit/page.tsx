import React from "react";
import PaymentFilterButton from "@/components/account/deposit/PaymentFilterButton";
import Payment from "@/components/payment/Payment";
import PaymentWapper from "@/components/payment/PaymentWapper";
import { findCurrentUser } from "@/data/user";
import PageHeader from "@/components/page-header";
import AccountId from "@/components/account-id";
import DpWdTab from "@/components/payment/dp-wd-tab";
const DepositPage = async () => {
  const user = await findCurrentUser();
  return (
    <div className="bg-slate-50 rounded-sm shadow-sm  ">
      <main>
        <PageHeader title="Deposit" />
        <DpWdTab/>
        <div className="p-2 px-3 rounded-md bg-white">
          <div className="py-2 ">
            <AccountId accountId={user?.playerId || ""} />
            <p className="hidden md:text-sm text-accent">
              Select payment method to top up your account:
            </p>
          </div>
          <PaymentFilterButton />
        </div>
        <PaymentWapper type="deposit" >
          <Payment />
        </PaymentWapper>
      </main>
    </div>
  );
};

export default DepositPage;
