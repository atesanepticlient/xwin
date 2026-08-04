"use client";

import coinFlip from "@/../public/assets/svg/coin-flip.svg";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*                                  ICONS                                     */
/* -------------------------------------------------------------------------- */

function BinancePayLogo() {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 rounded bg-[#F0B90B] px-1.5 py-1 sm:px-2 sm:py-1.5 text-black">
      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 32 32">
        <path
          fill="#000"
          d="M16 4l3.2 3.2L11 15.4l-3.2-3.2L16 4zm7.2 7.2L26.4 14.4 16 24.8l-3.2-3.2 10.4-10.4zM8.8 14.4L12 17.6 8.8 20.8 5.6 17.6l3.2-3.2zm14.4 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zM16 17.6l3.2 3.2L16 24 12.8 20.8 16 17.6z"
        />
      </svg>
      <span className="text-[8.5px] sm:text-[10px] font-extrabold tracking-tighter leading-none">
        BINANCE
      </span>
      <span className="text-[6.5px] sm:text-[7.5px] font-semibold tracking-tight leading-none">
        PAY
      </span>
    </div>
  );
}

function TetherIcon({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        fill="#fff"
        d="M17.9 17.4v-.01c-.11.01-.68.04-1.94.04-1.01 0-1.72-.03-1.97-.04v.01c-3.9-.17-6.81-.85-6.81-1.66s2.91-1.49 6.81-1.66v2.65c.26.02.98.06 1.99.06 1.2 0 1.8-.05 1.92-.06v-2.65c3.89.17 6.79.85 6.79 1.65s-2.9 1.48-6.79 1.65m0-3.59v-2.37h5.42V7.9H8.62v3.54h5.42v2.37c-4.4.2-7.71 1.07-7.71 2.12s3.31 1.91 7.71 2.11v7.56h1.94v-7.56c4.39-.2 7.7-1.06 7.7-2.11s-3.31-1.92-7.7-2.12"
      />
    </svg>
  );
}

function TronIcon({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="#fff"
        stroke="#f0f0f0"
        strokeWidth="1"
      />
      <path
        fill="#FF060A"
        d="M23.7 9.6 8.5 6.9l6.2 18.9 12.6-13.7-3.6-1.5zM16 24l-4.9-14.9 8.6 1.5L16 24z"
      />
    </svg>
  );
}

function BnbDiamondIcon({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="#fff"
        stroke="#f0f0f0"
        strokeWidth="1"
      />
      <path
        fill="#F3BA2F"
        d="M16 8l3.2 3.2L12.8 17.6 9.6 14.4 16 8zm7.2 7.2l3.2 3.2L16 28.8l-3.2-3.2 10.4-10.4zM8.8 14.4l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm14.4 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zM16 17.6l3.2 3.2L16 24l-3.2-3.2 3.2-3.2z"
      />
    </svg>
  );
}

function BitcoinIcon({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        fill="#fff"
        d="M21.5 14.2c.3-1.9-1.2-3-3.1-3.6l.6-2.5-1.5-.4-.6 2.4c-.4-.1-.8-.2-1.2-.3l.6-2.4-1.5-.4-.6 2.5c-.3-.1-.6-.1-1-.2l-2.1-.5-.4 1.6s1.1.3 1.1.3c.6.1.7.5.7.8l-.7 2.9c0 .1.1.1.1.1s-.1 0-.1-.1l-1 4c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.7 1.7 2 .5c.4.1.7.2 1.1.3l-.6 2.5 1.5.4.6-2.5c.4.1.8.2 1.2.3l-.6 2.5 1.5.4.6-2.5c2.6.5 4.6.3 5.4-2.1.7-1.9 0-3-1.4-3.7 1-.2 1.7-.9 1.9-2.2m-3.5 4.9c-.5 1.9-3.7.9-4.8.6l.9-3.4c1 .3 4.4.9 3.9 2.8m.5-4.9c-.4 1.7-3.1.9-4 .6l.8-3.1c.9.2 3.7.6 3.2 2.5"
      />
    </svg>
  );
}

function PolygonWireframeIcon({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 4 27 10v12L16 28 5 22V10L16 4z"
        stroke="#8247E5"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function EthIcon({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <path fill="#343434" d="M16 4v8.9l7.5 3.3z" />
      <path fill="#8C8C8C" d="M16 4 8.5 16.2l7.5-3.3z" />
      <path fill="#3C3C3B" d="M16 21.9v6.1l7.5-10.4z" />
      <path fill="#8C8C8C" d="M16 28v-6.1l-7.5-4.3z" />
    </svg>
  );
}

function DashMinusBadge({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#000" />
      <rect x="7" y="14" width="18" height="4" rx="2" fill="#fff" />
    </svg>
  );
}

function UsdcIcon({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <circle
        cx="16"
        cy="16"
        r="10"
        fill="none"
        stroke="#fff"
        strokeWidth="1.2"
      />
      <text
        x="16"
        y="21"
        fontSize="13"
        fill="#fff"
        textAnchor="middle"
        fontFamily="Arial"
        fontWeight="bold"
      >
        $
      </text>
    </svg>
  );
}

function OptimismBadge({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#FF0420" />
      <text
        x="16"
        y="20.5"
        fontSize="11"
        fill="#fff"
        textAnchor="middle"
        fontFamily="Arial"
        fontWeight="bold"
      >
        OP
      </text>
    </svg>
  );
}

function ArbitrumBadge({
  className = "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="#fff"
        stroke="#f0f0f0"
        strokeWidth="1"
      />
      <path fill="#12AAFF" d="M16 5.5l9 15.5H7L16 5.5z" />
      <path fill="#28A0F0" d="M16 8.5l6.5 11.2H9.5L16 8.5z" />
      <path fill="#0D2C54" d="M13.5 15.5l2.5-4.3 2.5 4.3h-5z" />
    </svg>
  );
}

function AlgorandIcon({
  className = "w-3 h-3 sm:w-4 sm:h-4",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 44 40">
      <path
        fill="#000"
        d="M43.6 39.4h-6.9l-4.6-14.3-8.3 14.3h-7l12.5-21.6-3-9.3-16.9 30.9H0L21.5.6h7.1l3 9.1L36.9.6h6.9l-8.3 14.4z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                                BADGE PILLS                                 */
/* -------------------------------------------------------------------------- */

function CapsulePill({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#f2f2f2] px-1.5 py-0.5 sm:px-2 sm:py-1">
      {left}
      {right}
    </div>
  );
}

function SinglePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-5 w-5 sm:h-[26px] sm:w-[26px] items-center justify-center rounded-full bg-[#f2f2f2]">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                MAIN LAYOUT                                 */
/* -------------------------------------------------------------------------- */

type BonusOffer = {
  bonusPercentage: number;
  upto: number;
  currency: string;
};

const STORAGE_KEY = "newUserBonus";
const AUTO_DISMISS_MS = 20000;
const TRANSITION_MS = 300;

function DepositBonusCard({
  bonus,
  onClose,
  isClosing,
}: {
  bonus: BonusOffer;
  onClose: () => void;
  isClosing?: boolean;
}) {
  const handleCloseClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isClosing) {
        onClose();
      }
    },
    [onClose, isClosing],
  );

  return (
    <div className="relative w-full rounded-2xl bg-white p-5 sm:p-6 shadow-[0_-8px_12px_-8px_rgba(17,17,26,0.25)]">
      <button
        type="button"
        aria-label="Close"
        onClick={handleCloseClick}
        disabled={isClosing}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Image src={coinFlip} alt="Bonus" className="w-12" />
        </div>
        <div className="pt-0.5 pr-6">
          <h1 className="text-[13px] font-bold leading-tight text-[#222]">
            {bonus.bonusPercentage}% bonus on your 1st deposit
          </h1>
          <p className="mt-1 text-[12px] leading-snug text-[#444]">
            Deposit up to {bonus.upto} {bonus.currency} (or equivalent in
            another currency) and receive the same amount as a gift.
          </p>
        </div>
      </div>

      <Link
        href="/account/deposit"
        onClick={onClose}
        className="mt-3 w-full rounded-md bg-[#499A13] block text-center py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[rgb(127,205,43)]"
      >
        GET BONUS
      </Link>
    </div>
  );
}

function PaymentMethods() {
  return (
    <div className="w-full rounded-2xl bg-white px-5 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-2 sm:gap-x-3 sm:gap-y-3.5">
        <BinancePayLogo />
        <CapsulePill left={<TetherIcon />} right={<TronIcon />} />
        <CapsulePill left={<TetherIcon />} right={<BnbDiamondIcon />} />
        <SinglePill>
          <BitcoinIcon />
        </SinglePill>
        <SinglePill>
          <TronIcon />
        </SinglePill>
        <SinglePill>
          <PolygonWireframeIcon />
        </SinglePill>
        <CapsulePill left={<EthIcon />} right={<DashMinusBadge />} />
        <CapsulePill left={<UsdcIcon />} right={<DashMinusBadge />} />
        <CapsulePill left={<EthIcon />} right={<OptimismBadge />} />
        <CapsulePill left={<TetherIcon />} right={<OptimismBadge />} />
        <CapsulePill left={<UsdcIcon />} right={<OptimismBadge />} />
        <CapsulePill left={<EthIcon />} right={<ArbitrumBadge />} />
        <CapsulePill left={<TetherIcon />} right={<ArbitrumBadge />} />
        <CapsulePill left={<UsdcIcon />} right={<ArbitrumBadge />} />
        <div className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center">
          <AlgorandIcon />
        </div>
      </div>
    </div>
  );
}

export default function NewUserBonusNotification() {
  const [bonus, setBonus] = useState<BonusOffer | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Check storage on mount
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as BonusOffer;
      setBonus(parsed);
      // Trigger smooth entry frame
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } catch (e) {
      console.error("[BonusNotif] JSON parse failed:", e);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // 2. Handle close - simple and direct
  const handleClose = useCallback(() => {
    // Cancel any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Start closing animation
    setIsAnimating(true);
    sessionStorage.removeItem(STORAGE_KEY);

    // After animation completes, fully remove from DOM
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setBonus(null);
      setIsAnimating(false);
      timeoutRef.current = null;
    }, TRANSITION_MS);
  }, []);

  // 3. Auto-dismiss timer
  useEffect(() => {
    if (!isVisible || isAnimating) return;

    timeoutRef.current = setTimeout(() => {
      handleClose();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isVisible, isAnimating, handleClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Don't render if not visible
  if (!bonus || !isVisible) return null;

  return (
    <main
      className={`max-w-[95%] w-[95%] fixed left-1/2 -translate-x-1/2 bottom-32 z-50
        transition-all duration-300 ease-out pointer-events-none
        ${isAnimating ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}
      `}
      style={{
        pointerEvents: isAnimating ? "none" : "auto",
      }}
    >
      <div className="w-full">
        <DepositBonusCard bonus={bonus} onClose={handleClose} />
      </div>
      <div className="w-full mt-2">
        <PaymentMethods />
      </div>
    </main>
  );
}
