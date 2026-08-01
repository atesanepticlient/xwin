import React from "react";
import PaymentFilterButton from "@/components/account/deposit/PaymentFilterButton";
import Payment from "@/components/payment/Payment";
import PaymentWapper from "@/components/payment/PaymentWapper";
import { findCurrentUser } from "@/data/user";
import DpWdTab from "@/components/payment/dp-wd-tab";
import PageHeader from "@/components/page-header";
import AccountId from "@/components/account-id";
import Link from "next/link";
import { RiFileHistoryFill } from "react-icons/ri";
import SupportCards from "@/components/payment/SupportCards";
const WithdrawPage = async () => {
  const user = await findCurrentUser();
  return (
    <div className="bg-slate-50   md:px-4 md:py-5">
      <main>
        <PageHeader
          title="Withdraw found"
          rightAction={
            <>
              <Link
                href={"/account/transaction"}
                className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-white bg-[#4f4f4f]"
              >
                <RiFileHistoryFill />
              </Link>
            </>
          }
        />
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
        <SupportCards />
        <PaymentWapper type="withdraw">
          <Payment />
        </PaymentWapper>
      </main>
    </div>
  );
};

export default WithdrawPage;
