"use client";

import { useEffect, useState, useRef } from "react";

const PULL_THRESHOLD = 80; // Distance in pixels required to trigger refresh
const RESISTANCE = 0.4; // Resistance factor for pull distance damping

export default function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull when scrolled to the top
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || window.scrollY > 0) return;

      const currentY = e.touches[0].clientY;
      const dy = currentY - startYRef.current;

      if (dy > 0) {
        // Damped pull distance calculation
        const distance = Math.min(dy * RESISTANCE, PULL_THRESHOLD + 40);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      // Access latest pullDistance inside event callback
      setPullDistance((prevDistance) => {
        if (prevDistance >= PULL_THRESHOLD) {
          setIsRefreshing(true);

          // Full page reload
          window.location.reload();

          return PULL_THRESHOLD;
        }
        return 0;
      });
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center pointer-events-none transition-transform duration-100 ease-out"
      style={{
        transform: `translateY(${pullDistance}px)`,
        marginTop: "-50px",
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        {isRefreshing ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-150"
            style={{ transform: `rotate(${progress * 180}deg)` }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
