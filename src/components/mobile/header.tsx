"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import logo from "@/../public/assets/images/logo.png";
import Image from "next/image";
import useCurrentUser from "@/hook/useCurrentUser";
import MobileHomePageTabps from "./tabs";
import { FaCoins, FaPlus, FaSearch } from "react-icons/fa";
import { BalanceProps } from "./types";
import { FaBangladeshiTakaSign, FaIndianRupeeSign } from "react-icons/fa6";
import { formatAmount } from "@/lib/helpers";

const Balance = ({ currency, amount }: BalanceProps) => {
  const formattedAmount = formatAmount(amount, currency);
  const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
      case "BDT":
        return (
          <FaBangladeshiTakaSign className="w-3 h-3 text-black shrink-0" />
        );
      case "INR":
        return <FaIndianRupeeSign className="w-3 h-3 text-black shrink-0" />;
      case "PKR":
        return (
          <span className="text-[10px] font-bold text-black leading-none shrink-0">
            Rs
          </span>
        );
      default:
        return <FaCoins className="w-3 h-3 text-black shrink-0" />;
    }
  };
  return (
    <div className="flex bg-[#EDF0F2] h-max gap-2 p-0.5 rounded-full justify-start items-center">
      <Link
        href="/account/deposit"
        className="w-5 h-5 rounded-full bg-[#499A13] text-white flex justify-center items-center shrink-0"
      >
        <FaPlus className="w-3 h-3" />
      </Link>
      <div className="flex items-center gap-1 pr-1.5">
        {getCurrencyIcon(currency)}
        <span className="text-[12px] text-black font-medium">
          {formattedAmount}
        </span>
      </div>
    </div>
  );
};

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-2 mt-2">
      <Link
        href={"/login"}
        className="text-sm font-semibold text-white bg-[#242424] hover:bg-[#2d2d2d] rounded-md block w-full text-center py-1.5"
      >
        Log in
      </Link>
      <Link
        href={"/register"}
        className="text-sm font-semibold text-white bg-[#499A13] hover:bg-[#549e23] rounded-md block w-full text-center py-1.5"
      >
        Registration
      </Link>
    </div>
  );
};

const HeaderTop = () => {
  const user = useCurrentUser();
  return (
    <div className="flex justify-between items-center relative py-2.5 ">
      {user && (
        <>
          <Balance
            amount={+user.wallet?.balance!}
            currency={user.wallet?.currencyCode!}
          />
        </>
      )}
      <div className="flex-1 flex justify-center">
        <Image src={logo} alt="WinpariBet" className="w-[100px]" />
      </div>
      <Link href={"/sports?redirect=search-events"} className=" text-[#808080]">
        <FaSearch className="w-5 h-5" />
      </Link>
    </div>
  );
};

// Custom hook to detect scroll direction and control header visibility
function useHeaderVisibility(threshold = 8) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    let ticking = false;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      // Always show header when near the top of the page
      if (currentScrollY <= 0) {
        setVisible(true);
      } else if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // scrolling down
          setVisible(false);
        } else {
          // scrolling up
          setVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}

const MobileHeader = () => {
  const user = useCurrentUser();
  const visible = useHeaderVisibility();

  return (
    <div
      className={`top-0 left-0 sticky w-full bg-white py-2 px-2.5 border-b z-50 transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <HeaderTop />
      {!user && (
        <>
          <AuthButtons />
        </>
      )}
      <MobileHomePageTabps />
    </div>
  );
};

export default MobileHeader;
