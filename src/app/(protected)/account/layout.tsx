import AccountNavigation from "@/components/account/AccountNavigation";
// import Footer from "@/components/landing/footer/Footer";
import { Metadata } from "next";
import React from "react";
import Header from "@/components/landing/headers/Header";
export const metadata: Metadata = {
  title: "Livvbet - Account",
  description:
    "Manage your Livvbet Companl account with ease! Check your balance, update details, track bets, and enjoy seamless withdrawals and deposits. Secure and fast access anytime. Log in now!",
};

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="  ">
      <Header />
      <div className="hidden md:block relative overflow-hidden ">
        <div className="grid grid-cols-[18%,_82%]">
          <AccountNavigation />
          <div className="bg-[#E8E8E8] md:px-4 md:py-5 max-h-[82vh] overflow-y-auto ">
            {children}
          </div>
        </div>
      </div>
      <div className="md:hidden ">{children}</div>

    </div>
  );
};

export default AccountLayout;
