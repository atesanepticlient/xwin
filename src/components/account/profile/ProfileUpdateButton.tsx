// components/account/profile/ProfileUpdateButton.tsx
"use client";
import { useUpdatePageNavigation } from "@/store/useStore";
import React from "react";
import { FaPencilAlt } from "react-icons/fa";

const ProfileUpdateButton = () => {
  const setPage = useUpdatePageNavigation((state) => state.setPage);
  return (
    <div className="px-2 md:hidden">
      <button
        onClick={() => setPage("update")}
        className="flex items-center gap-2 justify-center my-2 w-full py-3 rounded-md bg-[#1FC16B] text-white text-sm font-semibold hover:bg-[#19a75c] transition-colors"
      >
        <FaPencilAlt className="w-3.5 h-3.5" />
        Edit personal info
      </button>
    </div>
  );
};

export default ProfileUpdateButton;
