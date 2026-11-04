import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "WinpariBet Registration | Sign Up & Get Welcome Bonus",
  description:
    "Join WinpariBet today! Register now to enjoy the best sports betting odds, cricket matches, live dealers, and casino games with exclusive bonuses and fast payouts.",
};

const LoginLayout = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default LoginLayout;
