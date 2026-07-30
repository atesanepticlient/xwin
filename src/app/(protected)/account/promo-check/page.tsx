"use client";

import PageHeader from "@/components/page-header";
import { useState } from "react";

export default function PromoCheckCard() {
  const [promoCode, setPromoCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsChecking(true);
    try {
      // Add your check logic or API route here
      console.log("Checking promo code:", promoCode);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] ">
      <PageHeader title="Promo" />
      {/* Main White Card Container */}
      <div className="p-4"><div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-100/80 text-center space-y-5 ">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-extrabold text-[#222222] tracking-tight">
          Enter a promo code for checking
        </h2>

        <form onSubmit={handleCheck} className="space-y-4">
          {/* Promo Code Input */}
          <div>
            <input
              type="text"
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-[#222222] placeholder-neutral-500 font-medium text-sm sm:text-base focus:outline-none focus:border-neutral-700 transition-colors"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isChecking}
            className="w-full py-3.5 px-4 bg-[#c61f1f] hover:bg-[#ad1a1a] active:bg-[#961616] text-white font-medium text-base rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isChecking ? "Checking..." : "Check"}
          </button>
        </form>

        {/* History Link */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => console.log("Navigate to history")}
            className="text-sm font-semibold text-[#222222] hover:text-black underline underline-offset-2 transition-colors cursor-pointer"
          >
            History
          </button>
        </div>
      </div></div>
    </div>
  );
}
