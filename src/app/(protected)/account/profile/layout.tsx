import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "WinpariBet - Profile",
  description:
    "Manage your WinpariBet Companl profile with ease! Update personal details, change settings, and keep your account secure. Stay in control of your betting experience.",
};

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProfileLayout;
