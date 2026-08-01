"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  Ticket,
  ChevronRight,
  Flame,
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

type FilterKey = "all" | "claimable" | "claimed";

export default function CashbackListPage() {
  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  const [currencyCode, setCurrencyCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [toast, setToast] = useState<string | null>(null);

  const fetchCashbacks = useCallback(async () => {
    try {
      const res = await fetch("/api/bonus/cashback", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      if (data.cashbacks) {
        setCashbacks(data.cashbacks);
      }
      if (data.currencyCode) {
        setCurrencyCode(data.currencyCode);
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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleClaim = async (id: string, amount: Cashback["amount"]) => {
    setClaimingId(id);
    try {
      const res = await fetch("/api/bonus/cashback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashbackId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim cashback");

      if (data.currencyCode) {
        setCurrencyCode(data.currencyCode);
      }

      await fetchCashbacks();
      const amt = amount
        ? `${Number(amount).toLocaleString()} ${data.currencyCode || currencyCode}`.trim()
        : "";
      setToast(`Cashback claimed${amt ? ` · ${amt}` : ""}`);
    } catch (error: any) {
      setToast(error?.message || "Failed to claim cashback");
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
        status: "CLAIMED" as const,
        label: "Claimed",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accent: "from-emerald-100/70 via-emerald-50/40 to-transparent",
        bar: "bg-emerald-400",
      };
    }

    if (isExpired) {
      return {
        status: "EXPIRED" as const,
        label: "Expired",
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-600 border-rose-200",
        accent: "from-rose-100/60 via-rose-50/30 to-transparent",
        bar: "bg-rose-300",
      };
    }

    if (!cashback.claimable) {
      return {
        status: "LOCKED" as const,
        label: "In progress",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        accent: "from-amber-100/60 via-amber-50/30 to-transparent",
        bar: "bg-amber-300",
      };
    }

    return {
      status: "READY" as const,
      label: "Ready to claim",
      dot: "bg-emerald-500",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
      accent: "from-emerald-100/80 via-emerald-50/40 to-transparent",
      bar: "bg-emerald-500",
    };
  };

  const filtered = useMemo(() => {
    if (filter === "claimable")
      return cashbacks.filter((c) => c.claimable && !c.hasClaimed);
    if (filter === "claimed") return cashbacks.filter((c) => c.hasClaimed);
    return cashbacks;
  }, [cashbacks, filter]);

  const totals = useMemo(() => {
    const claimableSum = cashbacks
      .filter((c) => c.claimable && !c.hasClaimed && c.amount)
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const claimedCount = cashbacks.filter((c) => c.hasClaimed).length;
    return { claimableSum, claimedCount, total: cashbacks.length };
  }, [cashbacks]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#f4faf7]">
        <PageHeader title="Cashback" />
        <div className="p-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-gradient-to-r from-white via-emerald-50/60 to-white bg-[length:200%_100%] animate-[shimmer_1.6s_infinite] border border-slate-200"
            />
          ))}
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f4faf7] pb-16 relative">
      <PageHeader title="Cashback" />

      {/* Hero summary */}
      <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden border border-emerald-100">
        <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_15%_0%,#e3f9ec_0%,#f6fcf9_55%,#ffffff_100%)]" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            <Flame className="w-3.5 h-3.5" />
            Invitation rewards
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">
                Available to claim
              </p>
              <p className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                {totals.claimableSum.toLocaleString()}
                {currencyCode && (
                  <span className="text-sm font-bold text-emerald-600 ml-1">
                    {currencyCode}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500 font-medium">Claimed</p>
              <p className="text-lg font-bold text-slate-700 tabular-nums">
                {totals.claimedCount}/{totals.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-4 mt-4">
        {(
          [
            { key: "all", label: "All" },
            { key: "claimable", label: "Claimable" },
            { key: "claimed", label: "Claimed" },
          ] as { key: FilterKey; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === tab.key
                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400 stroke-[1.5]" />
            </div>
            <p className="text-sm text-slate-700 font-semibold">
              No cashback rewards here
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Invite friends with your promo code to unlock invitation cashback
              tickets.
            </p>
          </div>
        ) : (
          filtered.map((cashback) => {
            const { label, badge, dot, accent, bar, status } =
              getStatusInfo(cashback);
            const isClaiming = claimingId === cashback.id;
            const amountDisplay = cashback.amount
              ? Number(cashback.amount).toLocaleString()
              : "—";

            return (
              <div
                key={cashback.id}
                className={`relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                  status === "READY" ? "ring-1 ring-emerald-200" : ""
                }`}
              >
                {/* soft glow accent */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${accent} pointer-events-none`}
                />

                <div className="relative flex">
                  {/* left status bar */}
                  <div className={`w-1 shrink-0 ${bar}`} />

                  <div className="flex-1 p-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Ticket className="w-4.5 h-4.5 text-emerald-600 stroke-[1.75]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            Invitation Cashback
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {cashback.expiry
                              ? `Expires ${new Date(
                                  cashback.expiry,
                                ).toLocaleDateString()}`
                              : "Expiry not set yet"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </span>
                    </div>

                    {/* perforated divider — ticket stub feel */}
                    <div className="relative my-4 h-0 border-t border-dashed border-slate-200">
                      <span className="absolute -left-6 -top-2 w-4 h-4 rounded-full bg-[#f4faf7]" />
                      <span className="absolute -right-6 -top-2 w-4 h-4 rounded-full bg-[#f4faf7]" />
                    </div>

                    {/* Footer / action row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide block">
                          Reward
                        </span>
                        <span className="text-xl font-black text-slate-900 tabular-nums">
                          {amountDisplay}
                          {cashback.amount && currencyCode && (
                            <span className="text-xs font-bold text-emerald-600 ml-1">
                              {currencyCode}
                            </span>
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleClaim(cashback.id, cashback.amount)
                        }
                        disabled={status !== "READY" || isClaiming}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                          status === "READY"
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 active:scale-95 cursor-pointer"
                            : status === "CLAIMED"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        {isClaiming ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            Claiming
                          </span>
                        ) : status === "CLAIMED" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Claimed
                          </>
                        ) : status === "LOCKED" ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Pending
                          </>
                        ) : status === "EXPIRED" ? (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            Expired
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            Claim
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-white border border-emerald-200 text-slate-900 text-xs font-semibold shadow-lg shadow-slate-300/40 max-w-[90%] text-center">
          {toast}
        </div>
      )}
    </div>
  );
}
