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

// ---- App banner global (module-level, in-memory) timing state ----
// Lives for the lifetime of the JS module: shared across client-side
// route changes, but naturally resets on a full page reload since the
// module re-executes from scratch.
const APP_BANNER_DURATION_MS = 30 * 1000; // 30s, once per page load
const LS_DOWNLOADED_KEY = "app-downloaded"; // highest priority, set by you elsewhere

let bannerStartTime: number | null = null;
let bannerDismissed = false;

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

  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedContext, setSelectedContext] = useState<"sports" | "casino">(
    "sports",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // 🟢 App banner logic:
  // - app-downloaded in localStorage = highest priority kill switch, no 30s check at all
  // - showAppBanner prop = false disables it too
  // - otherwise, 30s shared window per page load (module-level state),
  //   so it won't restart on client-side nav, only on a real reload
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Highest priority: app-downloaded flag disables everything, no timer.
    try {
      if (window.localStorage.getItem(LS_DOWNLOADED_KEY) === "true") {
        setIsBannerVisible(false);
        return;
      }
    } catch {
      // localStorage unavailable — fall through, treat as not downloaded
    }

    // 2. Prop override
    if (!showAppBannerProp) {
      setIsBannerVisible(false);
      return;
    }

    // 3. Already used up this page-load session (timer expired or closed)
    if (bannerDismissed) {
      setIsBannerVisible(false);
      return;
    }

    // 4. Start (or resume) the shared 30s window for this page load
    if (bannerStartTime === null) {
      bannerStartTime = Date.now();
    }

    const elapsed = Date.now() - bannerStartTime;
    const remaining = APP_BANNER_DURATION_MS - elapsed;

    if (remaining <= 0) {
      bannerDismissed = true;
      setIsBannerVisible(false);
      return;
    }

    setIsBannerVisible(true);

    hideTimerRef.current = setTimeout(() => {
      bannerDismissed = true;
      setIsBannerVisible(false);
    }, remaining);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showAppBannerProp]);

  const handleBannerClose = () => {
    bannerDismissed = true;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsBannerVisible(false);
  };

  const handleBannerDownload = () => {
    bannerDismissed = true;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsBannerVisible(false);
    // Note: setting `app-downloaded` in localStorage is left to you,
    // wherever the actual download/redirect logic lives.
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
      {isBannerVisible && (
        <div className="pointer-events-auto w-full">
          <AppBanner
            onClose={handleBannerClose}
            onDownload={handleBannerDownload}
          />
        </div>
      )}

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
