"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AuthButtons from "@/components/auth/AuthButtons";
import AccountNavigation from "@/components/account/AccountNavigation";

const Menusm = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="left-menu-bar">
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          side="left"
          className="!bg-[#151E28] !px-0 !border-r !border-[#2A394A] w-[85%] sm:w-[380px] text-white flex flex-col justify-between"
        >
          {/* Header */}
          <SheetHeader className="px-4 py-3 bg-[#1C2836] border-b border-[#2A3A4D] flex flex-row items-center justify-between">
            <SheetTitle className="text-white text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A859]" />
              My Account
            </SheetTitle>
          </SheetHeader>

          {/* Account Body Navigation */}
          <div className="flex-1 overflow-y-auto">
            <AccountNavigation />
          </div>

          {/* Guest Auth Footer (Shows if logged out) */}
          <div className="p-3 bg-[#18222D] border-t border-[#2A394A]">
            <AuthButtons />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Menusm;
