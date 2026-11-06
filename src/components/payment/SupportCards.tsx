"use client";

import React, { MouseEvent } from "react";

export default function SupportCards() {
  const handleExternalClick = (
    e: MouseEvent<HTMLAnchorElement>,
    targetUrl: string,
  ) => {
    const ua = navigator.userAgent || "";

    // Detect Android WebView
    const isAndroid = /Android/i.test(ua);

    const isAndroidWebView =
      isAndroid &&
      (/;\s*wv\)/i.test(ua) || Boolean((window as any).ReactNativeWebView));

    console.log("[External Link] User Agent:", ua);
    console.log("[External Link] Android:", isAndroid);
    console.log("[External Link] Android WebView:", isAndroidWebView);
    console.log("[External Link] Target:", targetUrl);

    // Preserve normal browser behaviour
    if (!isAndroidWebView) return;

    e.preventDefault();

    try {
      const url = new URL(targetUrl);

      // Build Android Intent URL
      const intentUrl =
        `intent://${url.host}${url.pathname}${url.search}${url.hash}` +
        `#Intent;scheme=${url.protocol.replace(":", "")};` +
        `action=android.intent.action.VIEW;` +
        `category=android.intent.category.BROWSABLE;end`;

      console.log("[External Link] Intent:", intentUrl);

      // Attempt to open the external browser
      window.location.href = intentUrl;
    } catch (error) {
      console.error("[External Link] Failed:", error);
    }
  };

  return (
    <div className="px-3 flex flex-col gap-3 mt-3 mx-auto justify-center">
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
      <div className="bg-[#cdcdcd] font-[450] rounded-sm p-1.5 text-gray-800 shadow-sm border border-gray-300/50 text-xs sm:text-sm">
        <p className="mb-0.5">
          Become an Agent and earn with WinpariBet, Here you can earn a lot of
          money.{" "}
          <a
            href="https://winparibetagent.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) =>
              handleExternalClick(e, "https://winparibetagent.com")
            }
            className="text-[#1B6BB0] hover:underline"
          >
            Join now
          </a>
        </p>
      </div>
    </div>
  );
}
