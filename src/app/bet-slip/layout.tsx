import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "WinpariBet - Bet Slip",
  description:
    "Manage your bet slip with WinpariBet. Review, edit and place your sports bets with the latest odds.",
};

const BetSlipLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default BetSlipLayout;
