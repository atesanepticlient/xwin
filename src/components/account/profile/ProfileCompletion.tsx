// components/account/profile/ProfileCompletion.tsx
"use client";
import React from "react";
import useCurrentUser from "@/hook/useCurrentUser";

const ProfileCompletion = () => {
  const user = useCurrentUser();

  const fields = [
    !!user?.phone,
    !!user?.email,
    !!user?.firstName,
    !!user?.lastName,
  ];
  const completed = fields.filter(Boolean).length;
  const percent = Math.round((completed / fields.length) * 100);

  if (percent === 100) return null;

  return (
    <div className="bg-white rounded-md p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#212121]">
          Profile completion
        </span>
        <span className="text-sm font-bold text-[#1FC16B]">{percent}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#EDEDED] overflow-hidden">
        <div
          className="h-full bg-[#1FC16B] rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-[#8a8a8a] mt-2">
        Complete your profile to unlock faster withdrawals and higher deposit
        limits.
      </p>
    </div>
  );
};

export default ProfileCompletion;
