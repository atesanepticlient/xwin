"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface AccountMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  status?: "HIGH_RISK" | "WARNING" | null;
  badge?: boolean;
  onClick?: () => void;
}

const AccountMenuItem = ({
  icon,
  label,
  href,
  status,
  badge,
  onClick,
}: AccountMenuItemProps) => {
  const pathname = usePathname();
  const isActive = href ? pathname === href : false;

  const sharedClasses = cn(
    "flex items-center justify-between w-full px-4 py-3.5 hover:bg-gray-50 transition-colors rounded-lg text-left cursor-pointer",
    isActive && "bg-gray-100 font-medium",
  );

  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} className={sharedClasses}>
          <MenuItemContent
            icon={icon}
            label={label}
            status={status}
            badge={badge}
          />
        </button>
      ) : (
        <Link href={href || "#"} className={sharedClasses}>
          <MenuItemContent
            icon={icon}
            label={label}
            status={status}
            badge={badge}
          />
        </Link>
      )}
    </li>
  );
};

const MenuItemContent = ({
  icon,
  label,
  status,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  status?: "HIGH_RISK" | "WARNING" | null;
  badge?: boolean;
}) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-3.5">
      <div className="text-gray-500 text-lg flex items-center justify-center w-5 h-5">
        {icon}
      </div>
      <span className="text-[15px] text-gray-800 font-normal">{label}</span>
    </div>

    {/* Badges / Status Indicators */}
    <div className="flex items-center gap-2">
      {/* Dynamic Status Warning Indicator */}
      {status === "HIGH_RISK" && (
        <span
          title="High Risk"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold"
        >
          !
        </span>
      )}

      {status === "WARNING" && (
        <span
          title="Warning"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold"
        >
          !
        </span>
      )}

      {/* Notification Dot */}
      {badge && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
      )}
    </div>
  </div>
);

export default AccountMenuItem;
