"use client";
import Link from "next/link";
import React, { MouseEvent } from "react";

import { BsTelegram, BsTwitterX } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { AiOutlineLogin } from "react-icons/ai";
import { useFetchContactQuery } from "@/lib/features/contactApiSlice";
import { FaInstagramSquare, FaYoutube } from "react-icons/fa";

const Contact = () => {
  const { data, isLoading } = useFetchContactQuery();

  // Helper function to handle external link clicks safely in WebViews
  const handleExternalClick = (
    e: MouseEvent<HTMLAnchorElement>,
    targetUrl: string,
  ) => {
    if (typeof window === "undefined") return;

    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;

    // Common checks for React Native WebViews or embedded in-app browsers
    const isWebView =
      /wv|WebView|(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
        userAgent,
      ) || Boolean((window as any).ReactNativeWebView);

    // If inside a WebView, bypass WebView blocks
    if (isWebView) {
      e.preventDefault();

      const isAndroid = /Android/i.test(userAgent);

      if (isAndroid) {
        // Force Android OS to hand off the URL to external Chrome/default browser
        const rawUrl = targetUrl.replace(/^https?:\/\//, "");
        window.location.href = `intent://${rawUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
      } else {
        // iOS / General fallback: Route through Next.js server header redirect trick
        window.location.href = `/api/open-external?url=${encodeURIComponent(targetUrl)}`;
      }
    }
    // If regular web browser, default browser behavior (target="_blank") takes place naturally
  };

  return (
    <div>
      <span className="text-xs md:text-sm block text-center py-4 text-[#c1d5e3] px-3">
        About us Terms and Conditions Full Version Contacts Bitcoin Become an
        agent
      </span>
      <div className="px-3 py-3">
        <Link
          href="/register"
          className="w-full bg-[#7EC151] py-2 flex items-center justify-center gap-3 text-black text-sm rounded-lg"
        >
          <AiOutlineLogin className="w-4 h-4 " />
          Registation
        </Link>
      </div>

      {data && !isLoading && (
        <div className="px-2">
          <div className="flex justify-center items-center my-3 gap-2">
            {data.payload.telegram && (
              <a
                href={`https://t.me/${data.payload.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) =>
                  handleExternalClick(
                    e,
                    `https://t.me/${data.payload.telegram}`,
                  )
                }
                className="flex-1 bg-[rgb(51,51,51)] text-white py-3 rounded-lg"
              >
                <BsTelegram className="w-4 h-4 text-white mx-auto" />
              </a>
            )}

            {data.payload.facebook && (
              <a
                href={data.payload.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleExternalClick(e, data.payload.facebook)}
                className="flex-1 bg-[rgb(51,51,51)] text-white py-3 rounded-lg"
              >
                <FaFacebookF className="w-4 h-4 text-white mx-auto" />
              </a>
            )}

            {data.payload.youtube && (
              <a
                href={data.payload.youtube}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleExternalClick(e, data.payload.youtube)}
                className="flex-1 bg-[rgb(51,51,51)] text-white py-3 rounded-lg"
              >
                <FaYoutube className="w-4 h-4 text-white mx-auto" />
              </a>
            )}

            {data.payload.instagram && (
              <a
                href={data.payload.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleExternalClick(e, data.payload.instagram)}
                className="flex-1 bg-[rgb(51,51,51)] text-white py-3 rounded-lg"
              >
                <FaInstagramSquare className="w-4 h-4 text-white mx-auto" />
              </a>
            )}

            {data.payload.twitter && (
              <a
                href={data.payload.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleExternalClick(e, data.payload.twitter)}
                className="flex-1 bg-[rgb(51,51,51)] text-white py-3 rounded-lg"
              >
                <BsTwitterX className="w-4 h-4 text-white mx-auto" />
              </a>
            )}

            {data.payload.email && (
              <a
                href={`mailto:${data.payload.email}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) =>
                  handleExternalClick(e, `mailto:${data.payload.email}`)
                }
                className="flex-1 bg-[#24507d] text-white py-3 rounded-lg"
              >
                <MdOutlineEmail className="w-4 h-4 text-white mx-auto" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
