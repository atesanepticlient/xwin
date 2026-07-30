"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/page-header";

interface Cashback {
  id: string;
  type: "INVITATION";
  amount: number | string | null;
  expiry: string | Date | null;
  hasClaimed: boolean;
  claimable: boolean;
  userId: string;
}

export default function CashbackListPage() {
  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchCashbacks = useCallback(async () => {
    try {
      const res = await fetch("/api/bonus/cashback", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      if (data.cashbacks) {
        setCashbacks(data.cashbacks);
      }
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCashbacks();
  }, [fetchCashbacks]);

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      const res = await fetch("/api/bonus/cashback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashbackId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim cashback");

      await fetchCashbacks();
    } catch (error: any) {
      alert(error.message || "Failed to claim cashback");
    } finally {
      setClaimingId(null);
    }
  };

  const getStatusInfo = (cashback: Cashback) => {
    const isExpired = cashback.expiry
      ? new Date(cashback.expiry) < new Date()
      : false;

    if (cashback.hasClaimed) {
      return {
        status: "CLAIMED",
        label: "Claimed",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        btnDisabled: true,
      };
    }

    if (isExpired) {
      return {
        status: "EXPIRED",
        label: "Expired",
        badgeBg: "bg-rose-50 text-rose-600 border-rose-200",
        btnDisabled: true,
      };
    }

    if (!cashback.claimable) {
      return {
        status: "LOCKED",
        label: "Pending",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        btnDisabled: true,
      };
    }

    return {
      status: "READY",
      label: "Claimable",
      badgeBg:
        "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
      btnDisabled: false,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-slate-500 font-medium text-sm animate-pulse">
          Loading cashbacks...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen  pb-12">
      <PageHeader title="Cashback" />

      <div className="p-4 space-y-3 text-slate-900">
        {cashbacks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400 stroke-[1.5]" />
            </div>
            <p className="text-sm text-slate-700 font-semibold">
              No cashback rewards found
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">
              Invite friends using your promo code to unlock exclusive
              invitation cashbacks.
            </p>
          </div>
        ) : (
          cashbacks.map((cashback) => {
            const { label, badgeBg, btnDisabled, status } =
              getStatusInfo(cashback);
            const isClaiming = claimingId === cashback.id;
            const amountDisplay = cashback.amount
              ? `${Number(cashback.amount).toLocaleString()} BDT`
              : "Pending set";

            return (
              <div
                key={cashback.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-amber-600 stroke-[1.75]" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Invitation Cashback
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cashback.expiry
                          ? `Expires: ${new Date(cashback.expiry).toLocaleDateString()}`
                          : "Expiry: Not set yet"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border ${badgeBg}`}
                  >
                    {label}
                  </span>
                </div>

                {/* Footer / Action Row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Reward Amount
                    </span>
                    <span className="text-lg font-extrabold text-amber-600">
                      {amountDisplay}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleClaim(cashback.id)}
                    disabled={btnDisabled || isClaiming}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      status === "READY"
                        ? "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95"
                        : status === "CLAIMED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default shadow-none"
                          : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isClaiming ? (
                      <span>Claiming...</span>
                    ) : status === "CLAIMED" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Claimed</span>
                      </>
                    ) : status === "LOCKED" ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </>
                    ) : status === "EXPIRED" ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expired</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>Claim Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
