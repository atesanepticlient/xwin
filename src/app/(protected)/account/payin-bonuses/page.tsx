"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Dices, X } from "lucide-react";
import PageHeader from "@/components/page-header";

// Soccer ball SVG
const SoccerBallIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 7l2.5 2 2-.5 1 2.5-1.5 2-2-.5L12 15l-2-.5-1.5-2 1-2.5 2 .5z" />
    <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
  </svg>
);

interface PayinBonus {
  id: string;
  percentage: number | string;
  type: "FIRST_PAYIN" | "INVITATION";
  expiry: string | Date;
  claimedBonus: number | string | null;
  isActive: boolean;
  userId: string;
}

export default function PayinBonusSelectionPage() {
  const [bonuses, setBonuses] = useState<PayinBonus[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isDirtyRef = useRef(false);

  // Helper check for disabled state
  const isBonusDisabled = useCallback((bonus: PayinBonus) => {
    const isExpired = bonus.expiry
      ? new Date(bonus.expiry) < new Date()
      : false;
    const isClaimed =
      bonus.claimedBonus !== null && Number(bonus.claimedBonus) > 0;
    return isExpired || isClaimed;
  }, []);

  const fetchBonuses = useCallback(
    async (isInitial = false) => {
      try {
        const res = await fetch("/api/bonus/payin-bonus", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        if (data.bonuses) {
          setBonuses(data.bonuses);

          if (isInitial || !isDirtyRef.current) {
            // Find an active bonus that is NOT disabled
            const active = data.bonuses.find(
              (b: PayinBonus) => b.isActive && !isBonusDisabled(b),
            );
            setSelectedId(active ? active.id : null);
          }
        }
      } catch (err) {
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }
    },
    [isBonusDisabled],
  );

  useEffect(() => {
    fetchBonuses(true);
    const interval = setInterval(() => fetchBonuses(false), 3000);
    return () => clearInterval(interval);
  }, [fetchBonuses]);

  const handleSelect = (id: string | null, isDisabled = false) => {
    if (isDisabled) return;
    isDirtyRef.current = true;
    setSelectedId(id);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/bonus/payin-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedBonusId: selectedId }),
      });

      if (!res.ok) throw new Error("Save failed");

      isDirtyRef.current = false;
      await fetchBonuses(true);
    } catch (error) {
      console.error("Failed to update bonus selection", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    isDirtyRef.current = false;
    fetchBonuses(true);
  };

  const getBonusContent = (bonus: PayinBonus) => {
    if (bonus.type === "FIRST_PAYIN") {
      return {
        title: "First Deposit bonus",
        description: `First deposit bonus up to 100 USD`,
        Icon: SoccerBallIcon,
      };
    }
    return {
      title: "Casino + XPARI Games",
      description: `Welcome package up to 50 USD + 150 FS`,
      Icon: Dices,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-neutral-500 font-medium text-sm">
          Loading options...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-neutral-50/50 min-h-screen pb-20">
      <PageHeader title="Bonus" />

      <div className="bg-white rounded-xl p-3 shadow-sm border border-neutral-100">
        <div className="space-y-3">
          {/* Dynamic Database Bonus Options */}
          {bonuses.map((bonus) => {
            const isDisabled = isBonusDisabled(bonus);
            const isSelected = selectedId === bonus.id && !isDisabled;
            const { title, description, Icon } = getBonusContent(bonus);

            const isExpired = bonus.expiry
              ? new Date(bonus.expiry) < new Date()
              : false;
            const isClaimed =
              bonus.claimedBonus !== null && Number(bonus.claimedBonus) > 0;

            return (
              <div
                key={bonus.id}
                onClick={() => handleSelect(bonus.id, isDisabled)}
                className={`relative flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all ${
                  isDisabled
                    ? "opacity-50 bg-neutral-100 border-neutral-200 cursor-not-allowed select-none"
                    : isSelected
                      ? "bg-[#2d2d2d] text-white border-[#2d2d2d] cursor-pointer"
                      : "bg-white text-neutral-900 border-neutral-400 hover:border-neutral-500 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Circular Icon Wrapper */}
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${
                      isDisabled
                        ? "border-neutral-300 bg-neutral-200 text-neutral-400"
                        : isSelected
                          ? "border-neutral-400 text-white"
                          : "border-neutral-700 text-neutral-900"
                    }`}
                  >
                    <Icon className="w-7 h-7 stroke-[1.5]" />
                  </div>

                  {/* Vertical Divider Line & Text */}
                  <div
                    className={`border-l pl-3 my-0.5 ${
                      isDisabled
                        ? "border-neutral-300"
                        : isSelected
                          ? "border-neutral-600"
                          : "border-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-sm leading-snug ${
                          isDisabled ? "text-neutral-500" : ""
                        }`}
                      >
                        {title}
                      </h4>
                      {/* Disabled Badges */}
                      {isClaimed && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                          Claimed
                        </span>
                      )}
                      {!isClaimed && isExpired && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded">
                          Expired
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 font-normal ${
                        isDisabled
                          ? "text-neutral-400"
                          : isSelected
                            ? "text-neutral-300"
                            : "text-neutral-400"
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                </div>

                {/* Custom Radio Circle */}
                <div className="pr-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isDisabled
                        ? "border-neutral-300 bg-neutral-200"
                        : isSelected
                          ? "border-white bg-white"
                          : "border-neutral-400"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#2d2d2d]" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reject / Opt-Out Option */}
          <div
            onClick={() => handleSelect(null)}
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
              selectedId === null
                ? "bg-[#2d2d2d] text-white border-[#2d2d2d]"
                : "bg-white text-neutral-900 border-neutral-400 hover:border-neutral-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedId === null
                    ? "border-neutral-400"
                    : "border-neutral-700"
                }`}
              >
                <X
                  className={`w-7 h-7 stroke-[1.5] ${
                    selectedId === null ? "text-white" : "text-neutral-900"
                  }`}
                />
              </div>

              <div
                className={`border-l pl-3 my-0.5 ${
                  selectedId === null
                    ? "border-neutral-600"
                    : "border-neutral-200"
                }`}
              >
                <h4 className="font-bold text-sm leading-snug">
                  Reject bonuses
                </h4>
                <p
                  className={`text-xs mt-0.5 font-normal ${
                    selectedId === null
                      ? "text-neutral-300"
                      : "text-neutral-400"
                  }`}
                >
                  Make your selection later
                </p>
              </div>
            </div>

            {/* Custom Radio Circle */}
            <div className="pr-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedId === null
                    ? "border-white bg-white"
                    : "border-neutral-400"
                }`}
              >
                {selectedId === null && (
                  <div className="w-2 h-2 rounded-full bg-[#2d2d2d]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bullet Points */}
        <ul className="mt-6 space-y-2.5 text-[11px] text-neutral-700 leading-relaxed px-1">
          <li className="flex gap-2 items-start">
            <span className="text-neutral-800 text-xs font-bold">•</span>
            <span>
              Bettors are entitled to participate in the company’s other bonus
              offers, regardless of the chosen bonus type (i.e. casino or
              sport). This does not include offers on a deposit which involve
              the wagering of bonus funds by placing bets of a certain type i.e.
              bets on sports events or slots.
            </span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-neutral-800 text-xs font-bold">•</span>
            <span>
              By rejecting bonuses, you automatically reject all other
              promotions.
            </span>
          </li>
        </ul>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 w-full flex items-center gap-3 bg-white py-2 px-3 border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-10">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 py-3 bg-[#e6e6e6] hover:bg-[#d8d8d8] text-neutral-800 font-medium rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-[#c61f1f] hover:bg-[#ad1a1a] text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
