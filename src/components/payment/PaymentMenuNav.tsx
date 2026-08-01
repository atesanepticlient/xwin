"use client";

import React from "react";
import PaymentMethodFilterMenu from "./PaymentMethodFilterMenu";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PaymentMethodNav = () => {
  return (
    <div className="w-full hidden md:block">
      <PaymentMethodFilterMenu />
    </div>
  );
};
export const PaymentMethodNavSm = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="payment-method-nav-dialog">
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          hideClose={true}
          side={"left"}
          className=" !border-none !w-full bg-primary/15 [&>button:last-child]:hidden"
        >
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetClose asChild>
              <button
                className="
        absolute 
        top-5 
        right-5
        bg-blue-400/40
        border-blue-400/50
        border-2
        px-3
        py-2
        text-xl
        text-white
      "
              >
                ✕
              </button>
            </SheetClose>
          </SheetHeader>
          <div className="mt-24 w-[70%]">
            <PaymentMethodFilterMenu />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PaymentMethodNav;
