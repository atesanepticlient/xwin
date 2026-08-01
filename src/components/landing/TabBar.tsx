"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaDollarSign, FaTrophy } from "react-icons/fa";
import {
  IoMenuSharp,
  IoTicket,
  IoClose,
  IoRadioOutline,
} from "react-icons/io5";
import { RiUserFill, RiMenu2Line } from "react-icons/ri";
import { PiPokerChipFill } from "react-icons/pi";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/hook/useCurrentUser";
import { MdSportsBasketball } from "react-icons/md";

interface SubMenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
}

const baseNavItems: NavItem[] = [
  {
    id: "sports",
    label: "Sports",
    href: "/sports",
    icon: FaTrophy,
    hasSubmenu: true,
    submenu: [
      {
        label: "Live",
        href: "/sports?type=live",
        icon: (
          <div className="relative flex items-center justify-center">
            <IoRadioOutline className="w-5 h-5 text-[#7EC151]" />
            <span className="absolute w-2 h-2 rounded-full bg-[#7EC151] animate-ping opacity-75" />
          </div>
        ),
      },
      {
        label: "Sports",
        href: "/sports?type=line",
        icon: <MdSportsBasketball className="w-5 h-5 text-gray-700" />,
      },
      {
        label: "Home",
        href: "/",
        icon: <RiMenu2Line className="w-5 h-5 text-gray-700" />,
      },
    ],
  },
  {
    id: "casino",
    label: "Casino",
    href: "/casino",
    icon: PiPokerChipFill,
    hasSubmenu: true,
    submenu: [
      {
        label: "Live Casino",
        href: "/live",
        icon: <IoRadioOutline className="w-5 h-5 text-[#7EC151]" />,
      },
      {
        label: "Slots",
        href: "/casino",
        icon: <PiPokerChipFill className="w-5 h-5 text-gray-700" />,
      },
      {
        label: "Home",
        href: "/",
        icon: <RiMenu2Line className="w-5 h-5 text-gray-700" />,
      },
    ],
  },
  {
    id: "betslip",
    label: "Bet Slip",
    href: "/sports?type=slip",
    icon: IoTicket,
  },
  {
    id: "menu",
    label: "Menu",
    href: "/account",
    icon: IoMenuSharp,
  },
];

const loginItem: NavItem = {
  id: "login",
  label: "Login",
  href: "/login",
  icon: RiUserFill,
};

const depositItem: NavItem = {
  id: "deposit",
  label: "Deposit",
  href: "/account/deposit",
  icon: FaDollarSign,
};

const TabBar = () => {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Track context intent when navigating on ambiguous routes like '/'
  const [selectedContext, setSelectedContext] = useState<"sports" | "casino">(
    "sports",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize state when pathname changes to explicit routes
  useEffect(() => {
    if (pathname?.startsWith("/casino") || pathname?.startsWith("/live")) {
      setSelectedContext("casino");
    } else if (pathname?.startsWith("/sports")) {
      setSelectedContext("sports");
    }
  }, [pathname]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    ...baseNavItems.slice(0, 3),
    user ? depositItem : loginItem,
    ...baseNavItems.slice(3),
  ];

  // Precise Active Tab Logic
  const isTabActive = (item: NavItem) => {
    if (item.id === "sports") {
      if (pathname === "/") return selectedContext === "sports";
      return pathname?.startsWith("/sports");
    }

    if (item.id === "casino") {
      if (pathname === "/") return selectedContext === "casino";
      return pathname?.startsWith("/casino") || pathname?.startsWith("/live");
    }

    if (item.href === "/") return pathname === "/";
    return pathname?.startsWith(item.href);
  };

  const isOdd = navItems.length % 2 !== 0;
  const middleIndex = isOdd ? Math.floor(navItems.length / 2) : -1;

  const handleTabClick = (e: React.MouseEvent, item: NavItem) => {
    // Explicitly update selection context
    if (item.id === "sports") setSelectedContext("sports");
    if (item.id === "casino") setSelectedContext("casino");

    if (item.hasSubmenu) {
      e.preventDefault();
      setActiveMenuId((prev) => (prev === item.id ? null : item.id));
    } else {
      setActiveMenuId(null);
    }
  };

  const handleSubmenuClick = (parentId: string) => {
    if (parentId === "sports") setSelectedContext("sports");
    if (parentId === "casino") setSelectedContext("casino");
    setActiveMenuId(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        boxShadow: "0px -10px 25px -5px rgba(0, 0, 0, 0.15)",
      }}
      className="bg-white md:hidden fixed z-[500000000] left-1/2 -translate-x-1/2 bottom-0 md:bottom-3 w-full md:w-[600px] h-[65px] md:h-[70px] md:rounded-full flex py-1 md:py-2"
    >
      {navItems.map((item, index) => {
        const isActive = isTabActive(item);
        const Icon = item.icon;
        const isMiddle = index === middleIndex;
        const isMenuOpen = activeMenuId === item.id;

        return (
          <div key={item.id} className="relative flex-1 flex justify-center">
            {/* Popover Menu with Bottom-to-Top Animation */}
            {isMenuOpen && item.submenu && (
              <div
                className={cn(
                  "absolute bottom-0 w-[95%] bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.25)] border border-gray-100 flex flex-col items-center py-4 z-50",
                  "transition-all duration-300 ease-out transform",
                  "animate-in fade-in slide-in-from-bottom-6 duration-300",
                )}
              >
                <div className="flex flex-col items-center w-full gap-5">
                  {item.submenu.map((sub, idx) => (
                    <Link
                      key={idx}
                      href={sub.href}
                      onClick={() => handleSubmenuClick(item.id)}
                      className="flex flex-col items-center justify-center text-center group px-2"
                    >
                      <div className="mb-1 flex items-center justify-center">
                        {sub.icon}
                      </div>
                      <span className="text-[12px] font-medium leading-tight text-gray-800 group-hover:text-black max-w-[80px]">
                        {sub.label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setActiveMenuId(null)}
                  className="mt-6 p-1 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Close menu"
                >
                  <IoClose className="w-7 h-7 text-gray-600" />
                </button>
              </div>
            )}

            {/* Middle Floating Button Style */}
            {isMiddle ? (
              <Link
                href={item.href}
                onClick={(e) => handleTabClick(e, item)}
                className="relative w-full flex justify-center items-center flex-col group"
              >
                <div
                  className={cn(
                    "w-10 h-10 !aspect-square rounded-full bg-[#333] text-white flex items-center justify-center transition-transform active:scale-95 group-hover:bg-[#222]",
                    (isActive || isMenuOpen) && "bg-black/20",
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={cn(
                    "text-xs text-black mt-1",
                    isActive || isMenuOpen ? "font-bold" : "font-medium",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ) : (
              /* Standard Tab Style */
              <Link
                href={item.href}
                onClick={(e) => handleTabClick(e, item)}
                className="w-full flex justify-center items-center flex-col tab-menu"
              >
                <Icon
                  className={cn(
                    "w-6 h-6 text-black transition-opacity duration-200",
                    isActive || isMenuOpen ? "opacity-100" : "opacity-60",
                  )}
                />

                <span
                  className={cn(
                    "text-xs text-black transition-opacity duration-200",
                    isActive || isMenuOpen
                      ? "font-bold opacity-100"
                      : "font-medium opacity-60",
                  )}
                >
                  {item.label}
                </span>

                {/* Bottom active indicator bar */}
                {isActive && !isMenuOpen && (
                  <span className="absolute bottom-0 w-12 h-1 bg-[#7EC151] rounded-t-full transition-all duration-300" />
                )}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;
