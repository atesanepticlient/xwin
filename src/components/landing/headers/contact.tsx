"use client";
import React, { MouseEvent } from "react";
import { FaFacebookF, FaYoutube, FaTelegramPlane } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { useFetchContactQuery } from "@/lib/features/contactApiSlice";
import { Skeleton } from "@/components/ui/skeleton";

const Contact = () => {
  const { data, isLoading } = useFetchContactQuery();

  const contact = data?.payload;

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
        window.location.href = `/api/open-external?url=${encodeURIComponent(targetUrl)}`;
      }
    }
    // In standard desktop/mobile web browsers, standard target="_blank" handles it
  };

  return (
    <div className="flex items-center gap-2">
      {data && !isLoading && (
        <>
          {contact?.facebook && (
            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalClick(e, contact.facebook)}
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <FaFacebookF className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}

          {contact?.youtube && (
            <a
              href={contact.youtube}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalClick(e, contact.youtube)}
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <FaYoutube className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}

          {contact?.telegram && (
            <a
              href={
                contact.telegram.startsWith("http")
                  ? contact.telegram
                  : `https://t.me/${contact.telegram}`
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) =>
                handleExternalClick(
                  e,
                  contact.telegram.startsWith("http")
                    ? contact.telegram
                    : `https://t.me/${contact.telegram}`,
                )
              }
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <FaTelegramPlane className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}

          {contact?.twitter && (
            <a
              href={contact.twitter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalClick(e, contact.twitter)}
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <BsTwitterX className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}
        </>
      )}

      {(!data || isLoading) && (
        <>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
        </>
      )}
    </div>
  );
};

export default Contact;
