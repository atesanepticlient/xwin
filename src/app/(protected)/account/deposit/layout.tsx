import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "WinpariBet Deposit | Fast & Secure Account Funding",
  description:
    "Deposit funds securely into your WinpariBet account! Choose from multiple payment methods, enjoy instant transactions, and start betting right away.",
};

const DepsitLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default DepsitLayout;
