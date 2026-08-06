import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Account Securiry",
  description:
    "Keep your WinpariBet Companl account safe! Manage security settings, enable two-factor authentication, update passwords, and protect your personal information. Stay secure while betting.",
};

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProfileLayout;
