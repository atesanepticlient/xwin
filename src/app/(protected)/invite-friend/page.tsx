"use client";

import { useState } from "react";
import Link from "next/link";
import useCurrentUser from "@/hook/useCurrentUser";
import Header from "@/components/landing/headers/Header";
import PageHeader from "@/components/page-header";
import TermsModal from "./TermsModal";
import { FaArrowLeftLong } from "react-icons/fa6";
import { TiInfoLarge } from "react-icons/ti";
import { useAppStore } from "@/lib/store.zustond";

export default function AffiliatePage() {
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Get current user and referral ID directly
  const user = useCurrentUser();
  const referCode = user?.referId || "";

  // Dynamic referral link for social share
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referLink = referCode ? `${baseUrl}/register?ref=${referCode}` : "";

  const handleCopyCode = () => {
    if (!referCode) return;
    navigator.clipboard.writeText(referCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };
  const { isMobileSubdomain } = useAppStore();

  return (
    <div className="bg-[#f4f5f7] h-screen">
      {!isMobileSubdomain && <Header />}
      <PageHeader
        title="Invite Friend"
        rightAction={
          <>
            <TermsModal>
              <div className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-white bg-[#4f4f4f]">
                <TiInfoLarge />
              </div>
            </TermsModal>
          </>
        }
      ></PageHeader>

      <div className="  text-[#222222] flex  justify-center p-2 font-sans">
        <div className="w-full max-w-[500px] bg-white border border-[#e0e0e0] rounded-2xl p-6 md:p-8 ">
          {/* Main Title */}
          <h1 className="text-2xl md:text-[26px] font-bold text-[#111111] leading-tight tracking-tight mb-3">
            Become an affiliate and start earning!
          </h1>

          {/* Subtitle */}
          <p className="text-[#555555] text-sm md:text-base leading-relaxed mb-6">
            Build a multi-level network by inviting your friends who in turn
            will refer their friends
          </p>

          {/* Section Heading */}
          <h2 className="text-base md:text-lg font-bold text-[#111111] mb-3">
            How does it work?
          </h2>

          {/* Bullet List - Exact Text */}
          <ul className="space-y-2 mb-6 text-[#333333] text-sm md:text-base">
            <li className="flex items-start gap-2.5">
              <span className="text-[#333333] font-bold text-lg leading-none mt-0.5">
                •
              </span>
              <span>You invite your friends</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#333333] font-bold text-lg leading-none mt-0.5">
                •
              </span>
              <span>Your friends register, deposit funds, and place bets</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#333333] font-bold text-lg leading-none mt-0.5">
                •
              </span>
              <span>You receive your reward!</span>
            </li>
          </ul>

          {/* Bottom Paragraph - Exact Text */}
          <p className="text-[#555555] text-sm md:text-base leading-relaxed mb-6">
            As you refer friends, you build a multi-level network. At each level
            you'll earn a percentage of the WinpariBet net profit:
          </p>

          {/* ================= REFERRAL CODE INPUT WITH INLINE COPY ICON ================= */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777777] mb-1.5">
              Your Referral Code
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={referCode || "N/A"}
                className="w-full bg-[#f8f9fa] border border-[#d1d5db] text-[#111111] font-mono font-bold text-base px-4 py-3 pr-12 rounded-xl outline-none focus:border-[#e52e42] transition-colors tracking-wider"
              />

              {/* Copy Icon Button Inside Field */}
              <button
                onClick={handleCopyCode}
                disabled={!referCode}
                title={copiedCode ? "Copied!" : "Copy Code"}
                className="absolute right-2.5 p-2 rounded-lg text-[#555555] hover:text-[#e52e42] hover:bg-[#eee] transition-all disabled:opacity-40"
              >
                {copiedCode ? (
                  /* Checkmark SVG on success */
                  <svg className="w-5 h-5 fill-emerald-600" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  /* Clean Copy Icon SVG */
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Social Share Icons Row */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f0f0]">
              <span className="text-xs text-[#777777] font-medium">
                Quick Share:
              </span>
              <div className="flex items-center gap-3">
                {/* WhatsApp Icon */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Join me on XpariBet! Use referral code: ${referCode} or link: ${referLink}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:scale-110 transition-transform"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>

                {/* Telegram Icon */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    referLink,
                  )}&text=${encodeURIComponent(
                    `Join me on XpariBet! Use code ${referCode}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#229ED9] hover:scale-110 transition-transform"
                  title="Share on Telegram"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.128.832.941z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          {/* ================= END REFERRAL CODE INPUT ================= */}

          {/* Terms Checkbox - Exact Styling from Reference Image */}
          <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-6 h-6 border-2 border-[#b0b0b0] rounded-md accent-[#e52e42] cursor-pointer appearance-auto"
              />
            </div>
            <span className="text-sm md:text-base text-[#777777]">
              I accept the{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-[#333333] underline font-medium hover:text-[#e52e42] transition-colors"
              >
                Terms and Conditions
              </a>
            </span>
          </label>

          {/* Take Part Button - Exact Red Styling from Image */}
          <Link
            href={acceptedTerms ? "/account/deposit" : "#"}
            onClick={(e) => {
              if (!acceptedTerms) e.preventDefault();
            }}
            className={`w-full font-bold py-4 rounded-xl text-base tracking-wide uppercase transition-all duration-200 text-center block ${
              acceptedTerms
                ? "bg-[#e52e42] hover:bg-[#c92234] text-white cursor-pointer active:scale-[0.99]"
                : "bg-[#e52e42]/50 text-white/80 cursor-not-allowed"
            }`}
          >
            TAKE PART
          </Link>
        </div>
      </div>
    </div>
  );
}
