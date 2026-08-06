import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "WinpariBet - Betting Company Online Betting",

  description:
    "Log in to your WinpariBet Companl account securely and access your bets, deposits, and winnings. Enjoy a smooth and fast betting experience. Sign in now!",
};

const LoginLayout = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export default LoginLayout;
