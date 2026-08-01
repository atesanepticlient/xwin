// components/OfflineScreen.tsx
"use client";

import { useState } from "react";
import { WifiOff, RotateCw, ShieldAlert } from "lucide-react";

export default function OfflineScreen() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    // Forces a real connectivity re-check instead of trusting a possibly
    // stale navigator.onLine value.
    window.location.reload();
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#f6faf8] flex items-center justify-center px-4 py-10 sm:px-6"
      role="alert"
      aria-live="assertive"
    >
      {/* SVG texture — fine dot grid, ledger-paper feel */}
      <svg
        className="absolute inset-0 h-full w-full text-emerald-900/[0.05]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="offline-dot-grid"
            x="0"
            y="0"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#offline-dot-grid)" />
      </svg>

      {/* Soft directional wash + hairline top rule for a formal, ledger feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-900/10 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Status eyebrow */}
        <div className="mb-4 flex items-center justify-center gap-2 sm:mb-5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Connection lost
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_1px_2px_rgba(15,23,20,0.04),0_16px_40px_-16px_rgba(16,89,58,0.18)] backdrop-blur-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 sm:h-16 sm:w-16">
            <WifiOff
              className="h-6 w-6 text-emerald-700 sm:h-7 sm:w-7"
              strokeWidth={1.75}
            />
          </div>

          <h2 className="mt-5 text-center text-lg font-bold tracking-tight text-slate-900 sm:mt-6 sm:text-xl">
            No internet connection
          </h2>
          <p className="mx-auto mt-2 max-w-[30ch] text-center text-sm leading-relaxed text-slate-500">
            Your session is paused for security. Reconnect to Wi-Fi or mobile
            data to resume where you left off.
          </p>

          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:opacity-70 sm:mt-7"
          >
            <RotateCw
              className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
              strokeWidth={2}
            />
            {retrying ? "Checking connection..." : "Try again"}
          </button>

          <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 sm:mt-6">
            <ShieldAlert
              className="h-3.5 w-3.5 text-slate-400"
              strokeWidth={2}
            />
            <p className="text-[11px] font-medium text-slate-400">
              Your balance and open bets are safe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
