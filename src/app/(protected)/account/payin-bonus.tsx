"use client";

import { useEffect, useState, useCallback } from "react";
import { Dices, Trophy, X } from "lucide-react";

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

  // Fetch updated data from API
  const fetchBonuses = useCallback(async () => {
    try {
      const res = await fetch("/api/bonus/payin-bonus", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      if (data.bonuses) {
        setBonuses(data.bonuses);

        // Sync selected state from DB
        const active = data.bonuses.find((b: PayinBonus) => b.isActive);
        setSelectedId(active ? active.id : null);
      }
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBonuses();

    // Polling every 3 seconds for real-time background sync
    const interval = setInterval(() => {
      fetchBonuses();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchBonuses]);

  // Handle Save / Toggle
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/payin-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedBonusId: selectedId }),
      });

      if (!res.ok) throw new Error("Save failed");

      // Refetch immediately after updating
      await fetchBonuses();
    } catch (error) {
      console.error("Failed to update bonus selection", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getBonusContent = (bonus: PayinBonus) => {
    if (bonus.type === "FIRST_PAYIN") {
      return {
        title: "Bonus for sports",
        description: `First deposit bonus up to ${bonus.percentage}%`,
        icon: <Trophy className="w-8 h-8" />,
      };
    }
    return {
      title: "Casino + XPARI Games",
      description: `Welcome package with ${bonus.percentage}% bonus`,
      icon: <Dices className="w-8 h-8" />,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-neutral-500 font-medium">Syncing database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-sm border border-neutral-100 my-8">
      <div className="space-y-3">
        {/* Dynamic Database Bonus Options */}
        {bonuses.map((bonus) => {
          const isSelected = selectedId === bonus.id;
          const { title, description, icon } = getBonusContent(bonus);

          return (
            <div
              key={bonus.id}
              onClick={() => setSelectedId(bonus.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#2A2A2A] text-white border-[#2A2A2A]"
                  : "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-full border ${
                    isSelected
                      ? "border-neutral-600 bg-neutral-800"
                      : "border-neutral-200"
                  }`}
                >
                  {icon &&
                    Object.assign({}, icon, {
                      props: {
                        ...icon.props,
                        className: `w-7 h-7 ${isSelected ? "text-white" : "text-neutral-800"}`,
                      },
                    })}
                </div>
                <div className="border-l border-neutral-300 pl-3">
                  <h4 className="font-bold text-base leading-tight">{title}</h4>
                  <p
                    className={`text-xs mt-0.5 ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}
                  >
                    {description}
                  </p>
                </div>
              </div>

              {/* Custom Radio Button */}
              <div className="flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-white" : "border-neutral-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Reject / Opt-Out Option */}
        <div
          onClick={() => setSelectedId(null)}
          className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
            selectedId === null
              ? "bg-[#2A2A2A] text-white border-[#2A2A2A]"
              : "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-1.5 rounded-full border ${
                selectedId === null
                  ? "border-neutral-600 bg-neutral-800"
                  : "border-neutral-200"
              }`}
            >
              <X
                className={`w-7 h-7 ${selectedId === null ? "text-white" : "text-neutral-800"}`}
              />
            </div>
            <div className="border-l border-neutral-300 pl-3">
              <h4 className="font-bold text-base leading-tight">
                Reject bonuses
              </h4>
              <p
                className={`text-xs mt-0.5 ${selectedId === null ? "text-neutral-300" : "text-neutral-500"}`}
              >
                Make your selection later
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedId === null ? "border-white" : "border-neutral-400"
              }`}
            >
              {selectedId === null && (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Footer */}
      <ul className="mt-6 space-y-3 text-xs text-neutral-600 list-disc pl-4 leading-relaxed">
        <li>
          Bettors are entitled to participate in the company’s other bonus
          offers, regardless of the chosen bonus type (i.e. casino or sport).
          This does not include offers on a deposit which involve the wagering
          of bonus funds by placing bets of a certain type i.e. bets on sports
          events or slots.
        </li>
        <li>
          By rejecting bonuses, you automatically reject all other promotions.
        </li>
      </ul>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-8 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => fetchBonuses()}
          className="flex-1 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
