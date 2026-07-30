// components/account/AccountHeader.tsx
"use client";
import React from "react";
import { IoCopyOutline, IoMailOutline, IoClose } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import useCurrentUser from "@/hook/useCurrentUser";

interface AccountHeaderProps {
  onClose?: () => void;
}

const AccountHeader = ({ onClose }: AccountHeaderProps) => {
  const user = useCurrentUser();

  const handleCopy = () => {
    if (user?.playerId) {
      navigator.clipboard.writeText(String(user.playerId));
    }
  };

  return (
    <div className="bg-white rounded-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <FaUserCircle className="w-10 h-10 text-[#4a4a4a]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#4a4a4a] font-medium">
                Account No.{user?.playerId}
              </span>
              <button onClick={handleCopy} aria-label="Copy account number">
                <IoCopyOutline className="w-4 h-4 text-[#4a4a4a]" />
              </button>
            </div>
            <span className="block text-lg font-bold text-black">
              {Number(user?.wallet?.balance ?? 0).toFixed(2)} {user?.wallet?.currencyCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="w-px h-6 bg-gray-200" />
          <Link href="/account/message" aria-label="Messages">
            <IoMailOutline className="w-5 h-5 text-[#4a4a4a]" />
          </Link>
          <div className="w-px h-6 bg-gray-200" />
          <button onClick={onClose} aria-label="Close">
            <IoClose className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 pb-4">
        <Link href="/account/my-bets" className="flex-1">
          <button className="w-full py-2 rounded-md bg-[#2b2b2b] text-white text-sm">
            My bets
          </button>
        </Link>
        <Link href="/account/deposit" className="flex-1">
          <button className="w-full py-2 rounded-md bg-[#1FC16B] text-white text-sm">
            Deposit
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AccountHeader;
