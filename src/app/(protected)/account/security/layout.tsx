import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "WinpariBet Security | Account Protection",
  description:
    "Keep your WinpariBet Company account safe! Manage security settings, enable two-factor authentication, update passwords, and protect your personal information. Stay secure while betting.",
};

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProfileLayout;
