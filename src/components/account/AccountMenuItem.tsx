"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface AccountMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  warning?: boolean;
  onClick?: () => void;
}

const AccountMenuItem = ({
  icon,
  label,
  href,
  warning,
  onClick,
}: AccountMenuItemProps) => {
  const pathname = usePathname();
  const isActive = href ? pathname === href : false;

  const sharedClasses = cn(
    "flex items-center justify-between w-full px-4 py-3.5 hover:bg-gray-50 transition-colors rounded-lg text-left cursor-pointer",
    isActive && "bg-gray-100 font-medium",
  );

  const content = (
    <div className="flex items-center gap-3.5">
      <div className="text-gray-500 text-lg flex items-center justify-center w-5 h-5">
        {icon}
      </div>
      <span className="text-[15px] text-gray-800 font-normal">{label}</span>
      {warning && (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
          !
        </span>
      )}
    </div>
  );

  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} className={sharedClasses}>
          {content}
        </button>
      ) : (
        <Link href={href || "#"} className={sharedClasses}>
          {content}
        </Link>
      )}
    </li>
  );
};

export default AccountMenuItem;
