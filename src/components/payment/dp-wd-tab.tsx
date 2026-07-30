"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DpWdTab = () => {
  const pathname = usePathname();

  const isDeposit = pathname === "/account/deposit";
  const isWithdraw = pathname === "/account/withdraw";

  return (
    <div className="md:hidden p-2">
      <div className="grid grid-cols-2 overflow-hidden rounded-md bg-white relative ">
        <Link
          href="/account/deposit"
          className={`relative flex h-12 items-center justify-center text-sm font-medium transition-colors ${
            isDeposit ? "text-[#7EC151]" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Deposit
          {isDeposit && (
            <div className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-sm bg-[#7EC151]" />
          )}
        </Link>

        <Link
          href="/account/withdraw"
          className={`relative flex h-12 items-center justify-center text-sm font-medium transition-colors ${
            isWithdraw ? "text-[#7EC151]" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Withdraw
          {isWithdraw && (
            <div className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-sm bg-[#7EC151]" />
          )}
        </Link>

        <div className="left-1/2 top-1/2 absolute w-[1px] h-[70%] bg-gray-400/25 -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default DpWdTab;
