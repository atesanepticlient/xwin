"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaDollarSign, FaTrophy } from "react-icons/fa";
import {
  IoMenuSharp,
  IoTicket,
  IoClose,
  IoRadioOutline,
  IoPhonePortraitOutline,
} from "react-icons/io5";
import { RiUserFill, RiMenu2Line } from "react-icons/ri";
import { PiPokerChipFill } from "react-icons/pi";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/hook/useCurrentUser";
import { MdSportsBasketball } from "react-icons/md";
import AppBanner from "../app-banner";

// ---- App banner global timing config ----
const APP_BANNER_DURATION_MS = 30 * 1000; // 30s total, globally
const LS_DOWNLOADED_KEY = "app-downloaded";
const LS_DISMISSED_KEY = "app-banner-dismissed";
const LS_START_TIME_KEY = "app-banner-start-time";

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

interface TabBarProps {
  /** Master on/off switch for the app banner. Default: true */
  showAppBanner?: boolean;
}

const TabBar = ({ showAppBanner: showAppBannerProp = true }: TabBarProps) => {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Whether the banner is currently rendered on screen
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track context intent when navigating on ambiguous routes like '/'
  const [selectedContext, setSelectedContext] = useState<"sports" | "casino">(
    "sports",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // 🟢 Global, one-time, 30s app banner logic.
  // Uses a single start-timestamp in localStorage so the countdown is
  // continuous across page navigations/remounts and page refreshes.
  useEffect(() => {
    // Prop override always wins
    if (!showAppBannerProp) {
      setIsBannerVisible(false);
      return;
    }

    if (typeof window === "undefined") return;

    try {
      const alreadyDownloaded =
        window.localStorage.getItem(LS_DOWNLOADED_KEY) === "true";
      const alreadyDismissed =
        window.localStorage.getItem(LS_DISMISSED_KEY) === "true";

      if (alreadyDownloaded || alreadyDismissed) {
        setIsBannerVisible(false);
        return;
      }

      let startTime = Number(window.localStorage.getItem(LS_START_TIME_KEY));

      if (!startTime) {
        startTime = Date.now();
        window.localStorage.setItem(LS_START_TIME_KEY, String(startTime));
      }

      const elapsed = Date.now() - startTime;
      const remaining = APP_BANNER_DURATION_MS - elapsed;

      if (remaining <= 0) {
        // Global window already used up — never show again
        window.localStorage.setItem(LS_DISMISSED_KEY, "true");
        setIsBannerVisible(false);
        return;
      }

      setIsBannerVisible(true);

      hideTimerRef.current = setTimeout(() => {
        setIsBannerVisible(false);
        window.localStorage.setItem(LS_DISMISSED_KEY, "true");
      }, remaining);
    } catch {
      // localStorage unavailable (e.g. privacy mode) — just don't show
      setIsBannerVisible(false);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
    // Re-evaluate whenever the prop changes; pathname changes intentionally
    // do NOT reset the timer, that's the whole point.
  }, [showAppBannerProp]);

  const handleBannerClose = () => {
    setIsBannerVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    try {
      window.localStorage.setItem(LS_DISMISSED_KEY, "true");
    } catch {}
  };

  const handleBannerDownload = () => {
    setIsBannerVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    try {
      window.localStorage.setItem(LS_DOWNLOADED_KEY, "true");
      window.localStorage.setItem(LS_DISMISSED_KEY, "true");
    } catch {}
    // TODO: trigger actual app download / redirect here
  };

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
      className="md:hidden fixed z-[500000000] left-0 bottom-0 w-full flex flex-col items-center pointer-events-none"
    >
      {/* 🟢 TOP APP BANNER - global 30s, one-time */}
      {isBannerVisible && (
        <div className="pointer-events-auto w-full">
          <AppBanner
            onClose={handleBannerClose}
            onDownload={handleBannerDownload}
          />
        </div>
      )}

      {/* 🔵 MAIN TAB BAR */}
      <div
        style={{
          boxShadow: "0px -10px 25px -5px rgba(0, 0, 0, 0.15)",
        }}
        className="pointer-events-auto bg-white w-full h-[65px] flex py-1"
      >
        {navItems.map((item, index) => {
          const isActive = isTabActive(item);
          const Icon = item.icon;
          const isMiddle = index === middleIndex;
          const isMenuOpen = activeMenuId === item.id;

          return (
            <div key={item.id} className="relative flex-1 flex justify-center">
              {/* Popover Menu */}
              {isMenuOpen && item.submenu && (
                <div
                  className={cn(
                    "absolute bottom-[75px] w-[95%] bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.25)] border border-gray-100 flex flex-col items-center py-4 z-50",
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
    </div>
  );
};

export default TabBar;
