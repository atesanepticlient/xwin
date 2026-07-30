// components/account/AccountMenuItem.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { IoIosArrowForward } from "react-icons/io";
import { IoAlertCircle } from "react-icons/io5";

interface AccountMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  warning?: boolean;
}

const AccountMenuItem = ({
  icon,
  label,
  href,
  warning,
}: AccountMenuItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "group relative flex items-center justify-between w-full px-2 py-3 rounded-lg transition-all duration-200",
          "hover:bg-[#F5F5F5]",
          isActive && "bg-[#1FC16B]/10",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 text-[#8a8a8a] transition-colors duration-200",
              "group-hover:text-black",
              isActive && "!text-[#1FC16B]",
            )}
          >
            {icon}
          </div>
          <span
            className={cn(
              "text-base text-[#2b2b2b] transition-colors duration-200",
              "group-hover:text-black",
              isActive && "!text-black font-semibold",
            )}
          >
            {label}
          </span>
          {warning && <IoAlertCircle className="w-4 h-4 text-[#1FC16B]" />}
        </div>

        <IoIosArrowForward className="w-4 h-4 text-[#c4c4c4] group-hover:text-black transition-colors" />
      </Link>
    </li>
  );
};

export default AccountMenuItem;
