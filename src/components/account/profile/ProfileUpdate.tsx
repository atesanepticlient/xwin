// components/account/profile/ProfileUpdate.tsx
"use client";
import { Input } from "@/components/ui/input";
import React from "react";
import ProfileMenuContextWapper from "./ProfileMenuContextWapper";
import { FaPencilAlt, FaLock } from "react-icons/fa";
import { useUpdatePageNavigation } from "@/store/useStore";
import { MdKeyboardArrowDown } from "react-icons/md";
import useCurrentUser from "@/hook/useCurrentUser";
import { countryNameFinder } from "@/lib/helpers";

interface UpdateFieldProps {
  label: string;
  placeholder?: string;
  editType?: "password" | "phone" | "name" | "email";
  dropdown?: boolean;
  locked?: boolean;
}

const UpdateField = ({
  label,
  placeholder,
  editType,
  dropdown,
  locked,
}: UpdateFieldProps) => {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#a0a0a0] mb-1 px-0.5">
        {label}
      </label>
      <div
        className={`border rounded-md flex items-center overflow-hidden transition-colors ${
          locked
            ? "border-[#E5E5E5] bg-[#FAFAFA]"
            : "border-[#E5E5E5] focus-within:border-[#1FC16B]"
        }`}
      >
        <Input
          readOnly
          disabled={locked}
          placeholder={placeholder}
          className="placeholder:text-[#a0a0a0] flex-1 border-none focus-visible:ring-0 text-sm disabled:opacity-100 disabled:text-[#5c5c5c] disabled:cursor-not-allowed"
        />

        {locked && (
          <span className="w-9 h-9 flex items-center justify-center text-[#a0a0a0] mr-1">
            <FaLock className="w-3.5 h-3.5" />
          </span>
        )}

        {!locked && editType && (
          <ProfileMenuContextWapper type={editType}>
            <button className="p-2.5 bg-[#212121] hover:bg-[#1FC16B] transition-colors">
              <FaPencilAlt className="text-white w-3.5 h-3.5" />
            </button>
          </ProfileMenuContextWapper>
        )}

        {!locked && dropdown && (
          <MdKeyboardArrowDown className="w-5 h-5 text-[#a0a0a0] mr-3" />
        )}
      </div>
    </div>
  );
};

const ProfileUpdate = () => {
  const { setPage } = useUpdatePageNavigation((state) => state);
  const user = useCurrentUser();

  return (
    <div className="bg-white py-4 px-3 rounded-md">
      <UpdateField
        label="Player ID"
        placeholder={user!.playerId}
        locked
      />

      <UpdateField
        label="Password"
        placeholder="••••••••"
        editType="password"
      />

      <UpdateField label="Username" placeholder="User name" editType="name" />

      <UpdateField
        label="Email address"
        placeholder={user!.email}
        editType="email"
      />

      <UpdateField
        label="Phone number"
        placeholder="Phone number"
        editType="phone"
      />

      <UpdateField
        label="Country"
        placeholder={countryNameFinder(user!.wallet!.currencyCode)}
        dropdown
      />
      <UpdateField
        label="Currency"
        placeholder={user!.wallet!.currencyCode}
        dropdown
      />

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPage("")}
          className="flex-1 py-3 rounded-md border border-[#E5E5E5] text-sm font-semibold text-[#5c5c5c] hover:bg-[#F5F5F5] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setPage("")}
          className="flex-1 py-3 rounded-md bg-[#1FC16B] text-sm font-semibold text-white hover:bg-[#19a75c] transition-colors"
        >
          Save changes
        </button>
      </div>
    </div>
  );
};

export default ProfileUpdate;