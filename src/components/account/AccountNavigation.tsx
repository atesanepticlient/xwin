"use client";

import React from "react";
import Wallet from "./Wallet";
import { GrTransaction } from "react-icons/gr";
import { PiHandDepositBold, PiHandWithdrawFill } from "react-icons/pi";
import { MdSecurity, MdChevronRight } from "react-icons/md";
import { FaUserCircle, FaGift, FaCrown } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { FaMessage } from "react-icons/fa6";
import Link from "next/link";

import LogoutModal from "../LogoutModal";

interface AccountMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

const AccountMenuItem = ({
  icon,
  label,
  href,
  badge,
}: AccountMenuItemProps) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-3 hover:bg-[#2c2c2c] transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
        <span className="text-xs font-semibold text-[#D3E1EF] group-hover:text-white">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#00A859] text-white text-[10px] font-extrabold">
            {badge}
          </span>
        )}
        <MdChevronRight className="w-5 h-5 text-[#ddd] group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
};

const AccountNavigation = () => {
  return (
    <div className="flex flex-col gap-3 bg-[#292929] p-3 text-white font-sans min-h-[83.8vh]">
      {/* 1xBet Style User ID & Balance Card */}
      <div className="rounded-lg border border-[#181818] bg-[#212121] p-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#303031] pb-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#434344] flex items-center justify-center text-white">
              <FaUserCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#ddd] font-medium">Account ID</p>
              <p className="text-sm font-bold text-white tracking-wide">
                ID: 84920184
              </p>
            </div>
          </div>
          <span className="bg-[#26A17B]/20 bg-blue-700 text-white border-s border-e-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
            VERIFIED
          </span>
        </div>

        {/* Balance Display */}
        <Wallet />

        {/* Quick Deposit / Withdraw Buttons (1xBet signature style) */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Link
            href="/account/deposit"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#00A859] hover:bg-[#00924D] text-white text-xs font-bold uppercase transition-colors"
          >
            <PiHandDepositBold className="w-4 h-4" />
            Deposit
          </Link>
          <Link
            href="/account/withdraw"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#181818] hover:bg-[#212121] border border-[#303030] text-white text-xs font-bold uppercase transition-colors"
          >
            <PiHandWithdrawFill className="w-4 h-4 text-white" />
            Withdraw
          </Link>
        </div>
      </div>

      {/* VIP Rank Progress */}
      {/* <div className="rounded-lg border border-[#181818] bg-[#212121] px-3 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <FaCrown className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Silver Level
            </span>
          </div>
          <span className="text-[11px] text-[#8BA1B7] font-semibold">
            65% to Gold
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#121921] overflow-hidden p-0.5 border border-[#2B3C4E]">
          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-[#F5A623] to-[#F7C168]" />
        </div>
      </div> */}

      {/* Account Section */}
      <div className="border-[#181818] bg-[#212121] rounded-lg border  overflow-hidden">
        <div className="px-3 py-2 bg-[#2E2E2E] border-b border-[#454545]">
          <span className="text-[10px] font-black text-white  uppercase tracking-widest">
            Personal Info
          </span>
        </div>
        <div className="divide-y divide-[#454545]/60">
          <AccountMenuItem
            label="Personal Profile"
            href="/account/profile"
            icon={<FaUserCircle className="w-4 h-4 text-white" />}
          />
          <AccountMenuItem
            label="Security & Password"
            href="/account/security"
            icon={<MdSecurity className="w-4 h-4 text-white" />}
          />
          <AccountMenuItem
            label="Messages"
            href="/account/message"
            icon={<FaMessage className="w-3.5 h-3.5 text-white" />}
            badge={3}
          />
        </div>
      </div>

      {/* Finance Section */}
      <div className="border-[#181818] bg-[#212121] rounded-lg border  overflow-hidden">
        <div className="px-3 py-2 bg-[#2E2E2E] border-b border-[#454545]">
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            Finances & History
          </span>
        </div>
        <div className="divide-y divide-[#454545]/60">
          <AccountMenuItem
            label="Transaction History"
            href="/account/transaction"
            icon={<GrTransaction className="w-4 h-4 text-white" />}
          />
          <AccountMenuItem
            label="Invite Friends"
            href="/invite-friend"
            icon={<FaGift className="w-4 h-4 text-white" />}
          />
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-1">
        <LogoutModal>
          <button className="w-full rounded-lg bg-[#181818] hover:bg-[#212121] border border-[#303030] py-2.5 text-center flex items-center justify-center gap-2 text-xs font-bold text-[#FF5B5C] uppercase tracking-wider transition-all">
            <IoLogOut className="w-4 h-4" /> Log Out
          </button>
        </LogoutModal>
      </div>
    </div>
  );
};

export default AccountNavigation;
