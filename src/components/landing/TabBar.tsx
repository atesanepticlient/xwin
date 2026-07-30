"use client";

import React from "react";
import { IoMdHome } from "react-icons/io";
import { FaDollarSign, FaTrophy } from "react-icons/fa";
import { IoMenuSharp} from "react-icons/io5";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { RiUserFill } from "react-icons/ri";
import useCurrentUser from "@/hook/useCurrentUser";
import { PiPokerChipFill } from "react-icons/pi";
// Import your auth hook here

const baseNavItems = [
  {
    label: "Home",
    href: "/",
    icon: IoMdHome,
  },
  {
    label: "Sports",
    href: "/sports",
    icon: FaTrophy,
  },
  {
    label: "Casino",
    href: "/casino",
    icon: PiPokerChipFill,
  },
  {
    label: "Menu",
    href: "/account",
    icon: IoMenuSharp,
  },
];

const loginItem = {
  label: "Login",
  href: "/login",
  icon: RiUserFill,
};

const depositItem = {
  label: "Deposit",
  href: "/account/deposit",
  icon: FaDollarSign,
};

const TabBar = () => {
  const pathname = usePathname();
  const user = useCurrentUser();

  // Conditionally insert Deposit or Login before the last item (Menu)
  const navItems = [
    ...baseNavItems.slice(0, 3),
    user ? depositItem : loginItem,
    ...baseNavItems.slice(3),
  ];

  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  // Determine if array length is odd, and calculate middle index
  const isOdd = navItems.length % 2 !== 0;
  const middleIndex = isOdd ? Math.floor(navItems.length / 2) : -1;

  return (
    <div
      style={{
        boxShadow: "0px -10px 25px -5px rgba(0, 0, 0, 0.15)",
      }}
      className="bg-white md:hidden fixed z-[500000000] left-1/2 -translate-x-1/2 bottom-0 md:bottom-3 w-full md:w-[600px] h-[65px] md:h-[70px] md:rounded-full flex py-1 md:py-2"
    >
      {navItems.map((item, index) => {
        const isActive = isTabActive(item.href);
        const Icon = item.icon;
        const isMiddle = index === middleIndex;

        // Specialized Middle Floating Button Styling
        if (isMiddle) {
          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="relative flex-1 flex justify-center items-center flex-col group"
            >
              <div
                className={cn(
                  "w-10 h-10 !aspect-square rounded-full bg-black/10 flex items-center justify-center transition-transform active:scale-95 group-hover:bg-gray-200",
                  isActive && "bg-black/20",
                )}
              >
                <Icon className="w-5 h-5 text-black" />
              </div>
              <span
                className={cn(
                  "text-xs text-black mt-1",
                  isActive ? "font-bold" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        }

        // Standard Navigation Tab
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex-1 flex justify-center items-center flex-col tab-menu"
          >
            <Icon
              className={cn(
                "w-6 h-6 text-black transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-60",
              )}
            />

            <span
              className={cn(
                "text-xs text-black transition-opacity duration-200",
                isActive ? "font-bold opacity-100" : "font-medium opacity-60",
              )}
            >
              {item.label}
            </span>

            {/* Bottom active indicator bar */}
            {isActive && (
              <span className="absolute bottom-0 w-12 h-1 bg-[#7EC151] rounded-t-full transition-all duration-300" />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default TabBar;
