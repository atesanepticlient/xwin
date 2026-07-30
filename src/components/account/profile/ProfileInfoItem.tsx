// components/account/profile/ProfileInfoItem.tsx
import React from "react";
import { IoIosArrowForward } from "react-icons/io";

interface ProfileInfoItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  editable?: boolean;
  verified?: boolean;
  onClick?: () => void;
}

const ProfileInfoItem = ({
  label,
  value,
  icon,
  editable,
  verified,
  onClick,
}: ProfileInfoItemProps) => {
  const Wrapper = editable ? "button" : "div";

  return (
    <Wrapper
      onClick={editable ? onClick : undefined}
      className="w-full flex items-center justify-between py-3 px-1 text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-md bg-[#F5F5F5] flex items-center justify-center text-[#8a8a8a] shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <span className="block text-[11px] uppercase tracking-wide text-[#a0a0a0]">
            {label}
          </span>
          <span className="block text-sm font-semibold text-[#1A1A1A] truncate">
            {value || "—"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pl-2">
        {verified !== undefined &&
          (verified ? (
            <span className="text-[10px] font-semibold text-[#1FC16B] bg-[#1FC16B]/10 px-1.5 py-0.5 rounded">
              Verified
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#B8860B] bg-[#B8860B]/10 px-1.5 py-0.5 rounded">
              Unverified
            </span>
          ))}
        {editable && <IoIosArrowForward className="w-4 h-4 text-[#c4c4c4]" />}
      </div>
    </Wrapper>
  );
};

export default ProfileInfoItem;
