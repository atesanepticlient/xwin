import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Livvbet Login | Official Account Sign In",
  description:
    "Log in to your Livvbet account securely to place sports bets, play online casino games, deposit funds, and withdraw winnings smoothly.",
};

const LoginLayout = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export default LoginLayout;
