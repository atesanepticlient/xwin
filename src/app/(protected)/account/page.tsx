"use client";
import React, { useState } from "react";
import TabBar from "@/components/landing/TabBar";
import AccountHeader from "@/components/account/AccountHeader";
import AccountTabs from "@/components/account/AccountTabs";
import AccountMenu from "@/components/account/AccountMenu";
import PromoMenu from "@/components/account/PromoMenu";
import SettingsMenu from "@/components/account/SettingsMenu";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-[#F0F0F0] pb-24 md:pb-32">
      <main className="p-3 max-w-lg mx-auto">
        <div className="md:hidden">
          <AccountHeader />
          <AccountTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === "profile" && <AccountMenu />}
          {activeTab === "promo" && <PromoMenu />}
          {activeTab === "settings" && <SettingsMenu />}
        </div>
        <div className="hidden md:block">{/* Desktop view if needed */}</div>
      </main>
      <TabBar />
    </div>
  );
};

export default AccountPage;
