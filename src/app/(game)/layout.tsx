"use client";

import React from "react";
import Header from "@/components/landing/headers/Header";
import Footer from "@/components/landing/footer/Footer";
import { GameMobile } from "@/components/mobile/games";
import { useAppStore } from "@/lib/store.zustond";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isMobileSubdomain } = useAppStore();
  if (isMobileSubdomain) return <GameMobile />;

  return (
    <div className="bg-[#1b1b1b] min-h-screen">
      <Header />
      <div className=" ">
        <div className=" container">
          {/* <Nav /> */}
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
