// components/account/profile/ProfileAvatarCard.tsx
"use client";
import React from "react";
import useCurrentUser from "@/hook/useCurrentUser";
import { IoShieldCheckmark, IoAlertCircle } from "react-icons/io5";

const ProfileAvatarCard = () => {
  const user = useCurrentUser();
  const isVerified = !!user?.isVerified;

  const initials = `${user?.firstName?.[0] ?? ""}${
    user?.lastName?.[0] ?? ""
  }`.toUpperCase();

  return (
    <div className="bg-white rounded-md p-4 flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-[#212121] flex items-center justify-center shrink-0">
        <span className="text-white font-semibold text-lg">
          {initials || "U"}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#212121] truncate">
            {user?.firstName} {user?.lastName}
          </h2>
        </div>
        <span className="block text-xs text-[#8a8a8a]">
          Player ID {user?.playerId}
        </span>

        <div className="mt-1.5">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1FC16B] bg-[#1FC16B]/10 px-2 py-0.5 rounded-full">
              <IoShieldCheckmark className="w-3.5 h-3.5" />
              Verified account
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#B8860B] bg-[#B8860B]/10 px-2 py-0.5 rounded-full">
              <IoAlertCircle className="w-3.5 h-3.5" />
              Verification pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatarCard;
