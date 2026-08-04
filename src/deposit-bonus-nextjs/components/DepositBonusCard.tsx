"use client";

import CoinsIllustration from "./CoinsIllustration";

export default function DepositBonusCard() {
  return (
    <div className="relative w-full rounded-2xl bg-white p-6 sm:p-7">
      <button
        aria-label="Close"
        className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </svg>
      </button>

      <div className="flex items-start gap-5">
        <div className="h-[92px] w-[92px] shrink-0">
          <CoinsIllustration />
        </div>
        <div className="pr-6">
          <h1 className="text-[24px] font-extrabold leading-tight text-[#1a1a1a] sm:text-[26px]">
            100% bonus on your 1st deposit
          </h1>
          <p className="mt-3 text-[16px] leading-snug text-[#333] sm:text-[17px]">
            Deposit up to 128.27 SGD (or equivalent in another currency) and
            receive the same amount as a gift.
          </p>
        </div>
      </div>

      <button className="mt-6 w-full rounded-xl bg-[#B3261E] py-5 text-[18px] font-bold tracking-wide text-white transition-colors hover:bg-[#9E211A] sm:text-[19px]">
        GET BONUS
      </button>
    </div>
  );
}
