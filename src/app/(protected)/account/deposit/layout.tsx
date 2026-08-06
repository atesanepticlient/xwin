import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "WinpariBet - Profile",
  description:
    "Deposit funds securely at WinpariBet Companl! Choose from multiple payment methods, enjoy instant transactions, and start betting right away. Fast, safe, and hassle-free deposits!",
};

const DepsitLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default DepsitLayout;
