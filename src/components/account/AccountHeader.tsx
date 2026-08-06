// components/account/AccountHeader.tsx
"use client";
import React, { useEffect, useState } from "react";
import { IoCopyOutline, IoMailOutline, IoClose } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import useCurrentUser from "@/hook/useCurrentUser";
import { useNotificationStore } from "@/store/useStore";

interface AccountHeaderProps {
  onClose?: () => void;
}

const AccountHeader = ({ onClose }: AccountHeaderProps) => {
  const user = useCurrentUser();

  const handleCopy = () => {
    if (user?.playerId) {
      navigator.clipboard.writeText(String(user.playerId));
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  };
  const [copied, setCopied] = useState(false);

  const { notifications, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const hasUnseenMessage = Boolean(notifications?.unSeenMessage);

  return (
    <div className="bg-white rounded-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <FaUserCircle className="w-10 h-10 text-[#4a4a4a]" />
          <div>
            <span
              className="text-xs text-[#4a4a4a] font-medium cursor-pointer"
              onClick={handleCopy}
            >
              Account No. 
              {copied ? (
                <span className="ml-2 text-xs text-green-600 font-semibold">
                  Copied!
                </span>
              ) : (
                user?.playerId
              )}
            </span>
            <p className="font-bold text-sm text-[#242424]">
              {Number(user?.wallet?.balance).toFixed(2)}{" "}
              {user?.wallet?.currencyCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-px h-6 bg-gray-200" />
          <Link
            href="/account/message"
            aria-label="Messages"
            className="relative flex items-center justify-center"
          >
            <IoMailOutline className="w-5 h-5 text-[#4a4a4a]" />

            {/* Static Notification Badge */}
            {hasUnseenMessage && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
            )}
          </Link>
          <div className="w-px h-6 bg-gray-200" />
          <button onClick={onClose} aria-label="Close">
            <IoClose className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 pb-4">
        <Link href="/account/bet-history" className="flex-1">
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
