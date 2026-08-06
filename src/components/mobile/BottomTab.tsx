"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";

import {
  FaFire,
  FaStar,
  FaHistory,
  FaThLarge,
  FaDollarSign,
} from "react-icons/fa";
import { IoTicket } from "react-icons/io5";

type Tab = {
  label: string;
  href: string;
  icon: IconType;
  center?: boolean;
};

const tabs: Tab[] = [
  {
    label: "Popular",
    href: "/",
    icon: FaFire,
  },
  {
    label: "Deposit",
    href: "/account/deposit",
    icon: FaDollarSign,
  },
  {
    label: "Bet slip",
    href: "/sports?redirect=user/coupon",
    icon: IoTicket,
    center: true,
  },
  {
    label: "History",
    href: "account/bet-history",
    icon: FaHistory,
  },
  {
    label: "Menu",
    href: "/account",
    icon: FaThLarge,
  },
];

export default function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full">
      <div className="relative h-[55px] bg-white shadow-[0_-2px_15px_rgba(0,0,0,.15)]">
        <div className="flex h-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;

            if (tab.center) {
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="relative flex-1"
                >
                  <div className="absolute inset-x-0 -top-4 flex flex-col items-center">
                    <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#232323] shadow-lg">
                      <Icon size={22} className="-rotate-12 text-white" />
                    </div>

                    <span className="mt-1 text-[11px] font-medium text-gray-600 whitespace-nowrap">
                      {tab.label}
                    </span>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className="flex flex-1 flex-col items-center justify-center gap-[2px]"
              >
                <Icon
                  className={`text-[20px] transition-colors ${
                    active ? "text-black" : "text-gray-400"
                  }`}
                />

                <span
                  className={`text-[11px] transition-colors ${
                    active ? "font-medium text-black" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
