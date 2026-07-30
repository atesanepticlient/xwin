"use client";
import React from "react";
import { FaUser, FaGift, FaCog } from "react-icons/fa";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "profile", label: "Profile", icon: FaUser },
  { key: "promo", label: "Promo", icon: FaGift },
  { key: "settings", label: "Settings", icon: FaCog },
] as const;

interface AccountTabsProps {
  active: string;
  onChange: (key: string) => void;
}

const AccountTabs = ({ active, onChange }: AccountTabsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm flex items-center overflow-hidden mb-3 mt-2">
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <React.Fragment key={tab.key}>
            <button
              onClick={() => onChange(tab.key)}
              className="flex-1 flex flex-col items-center justify-center py-3.5 relative transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-gray-900" : "text-gray-600",
                  )}
                />
                <span
                  className={cn(
                    "text-[15px] font-medium transition-colors",
                    isActive ? "text-gray-900" : "text-gray-600",
                  )}
                >
                  {tab.label}
                </span>
              </div>
              {/* Red indicator bar at bottom */}
              {isActive && (
                <div className="h-[3px] w-12 bg-[#499A13] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
              )}
            </button>
            {i < tabs.length - 1 && <div className="w-px h-6 bg-gray-200" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default AccountTabs;
