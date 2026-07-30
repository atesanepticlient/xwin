import { PaymentMethodNavSm } from "@/components/payment/PaymentMenuNav";
import React from "react";

const PaymentFilterButton = () => {
  return (
    <div className="md:hidden">
      <PaymentMethodNavSm>
        <button className="flex items-center gap-2 mt-2 text-[10px] md:text-xs p-1 bg-[#212121] text-white">
          {/* <div className="w-4 h-4 border border-border relative">
        <div className="w-3 h-3 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-brand-foreground/90"></div>
      </div>
      <span className="text-xs md:text-sm text-accent">
        Payment systems in your region
      </span> */}
          Types of payment systems
        </button>
      </PaymentMethodNavSm>
    </div>
  );
};

export default PaymentFilterButton;
