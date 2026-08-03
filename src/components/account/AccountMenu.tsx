"use client";
import React, { useEffect } from "react";
import {
  MdOutlineHistory,
  MdOutlineFileDownload,
  MdOutlineFileUpload,
  MdSwapHoriz,
  MdOutlineChatBubbleOutline,
  MdOutlinePerson,
  MdOutlineLock,
  MdOutlineShield,
  MdOutlineGroup,
  MdOutlineExitToApp,
} from "react-icons/md";
import AccountMenuItem from "./AccountMenuItem";
import { signOut } from "next-auth/react";
import { useNotificationStore } from "@/store/useStore";

const AccountMenu = () => {
  const { notifications, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  // Check if either deposit or withdrawal notifications are present
  const hasTransactionNotification =
    Boolean(notifications?.depositNofication) ||
    Boolean(notifications?.withdrawalNofication);

  return (
    <div className="space-y-3">
      {/* ACCOUNT */}
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-400 px-4 pt-2 pb-1 tracking-wider uppercase">
          Account
        </p>
        <ul className="divide-y divide-gray-50">
          <AccountMenuItem
            label="Bet history"
            href="/account/bet-history"
            icon={<MdOutlineHistory className="w-5 h-5" />}
          />
          <AccountMenuItem
            label="Make a deposit"
            href="/account/deposit"
            icon={<MdOutlineFileDownload className="w-5 h-5" />}
          />
          <AccountMenuItem
            label="Withdraw funds"
            href="/account/withdraw"
            icon={<MdOutlineFileUpload className="w-5 h-5" />}
          />
          <AccountMenuItem
            label="Transaction history"
            href="/account/transaction"
            icon={<MdSwapHoriz className="w-5 h-5" />}
            badge={hasTransactionNotification}
          />
          <AccountMenuItem
            label="Payment queries"
            href="/account/payment-queries"
            icon={<MdOutlineChatBubbleOutline className="w-5 h-5" />}
          />
        </ul>
      </div>

      {/* PROFILE */}
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-400 px-4 pt-2 pb-1 tracking-wider uppercase">
          Profile
        </p>
        <ul className="divide-y divide-gray-50">
          <AccountMenuItem
            label="Personal profile"
            href="/account/profile"
            icon={<MdOutlinePerson className="w-5 h-5" />}
            status={notifications?.profileStatus}
          />
          <AccountMenuItem
            label="Security"
            href="/account/security"
            icon={<MdOutlineLock className="w-5 h-5" />}
            status={notifications?.scurityStatus}
          />
          <AccountMenuItem
            label="Responsible Gambling"
            href="/account/responsible-gambling"
            icon={<MdOutlineShield className="w-5 h-5" />}
          />
        </ul>
      </div>

      {/* OTHER */}
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-400 px-4 pt-2 pb-1 tracking-wider uppercase">
          Other
        </p>
        <ul>
          <AccountMenuItem
            label="Invite friends"
            href="/invite-friend"
            icon={<MdOutlineGroup className="w-5 h-5" />}
          />
        </ul>
      </div>

      {/* LOG OUT */}
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <ul>
          <AccountMenuItem
            label="Log out"
            icon={<MdOutlineExitToApp className="w-5 h-5" />}
            onClick={() => handleLogout()}
          />
        </ul>
      </div>
    </div>
  );
};

export default AccountMenu;
