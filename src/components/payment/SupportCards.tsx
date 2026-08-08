"use client";
import React, { MouseEvent } from "react";

export default function SupportCards() {
  // Helper function to handle external link clicks safely in WebViews
  const handleExternalClick = (
    e: MouseEvent<HTMLAnchorElement>,
    targetUrl: string,
  ) => {
    if (typeof window === "undefined") return;

    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;

    // Check for React Native WebView or embedded in-app browsers
    const isWebView =
      /wv|WebView|(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
        userAgent,
      ) || Boolean((window as any).ReactNativeWebView);

    if (isWebView) {
      e.preventDefault();

      const isAndroid = /Android/i.test(userAgent);

      if (isAndroid) {
        // Force Android OS to hand off the URL to Chrome/default browser
        const rawUrl = targetUrl.replace(/^https?:\/\//, "");
        window.location.href = `intent://${rawUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
      } else {
        // iOS fallback: Route through Next.js server header redirect
        window.location.href = `/api/open-external?url=${encodeURIComponent(
          targetUrl,
        )}`;
      }
    }
  };

  return (
    <div className=" px-3 flex flex-col gap-3 mt-3 mx-auto justify-center">
      {/* Top Card - Support Message */}
      <div className="bg-[#cdcdcd] rounded-sm p-1.5 text-gray-800 shadow-sm border border-gray-300/50">
        <p className="text-xs sm:text-sm font-[450]">
          If you have any problems with deposits, withdrawals and accounts
          please contact support
        </p>
        <a
          href="https://t.me/WinpariBet_Support"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) =>
            handleExternalClick(e, "https://t.me/WinpariBet_Support")
          }
          className="inline-block mt-1 text-xs sm:text-sm text-[#1B6BB0] hover:underline font-medium"
        >
          Contact Support
        </a>
      </div>

      {/* Bottom Card - Agent Recruitment Info */}
      <div className="bg-[#cdcdcd] font-[450] rounded-sm p-1.5 text-gray-800 shadow-sm border border-gray-300/50 text-xs sm:text-sm ">
        <p className="mb-0.5">
          Become an Agent and earn with WinpariBet, Here you can earn a lot of
          money.{" "}
          <a
            href="https://www.winparibetagent.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) =>
              handleExternalClick(e, "https://www.winparibetagent.com/")
            }
            className="text-[#1B6BB0] hover:underline"
          >
            Join now
          </a>{" "}
        </p>
      </div>
    </div>
  );
}
