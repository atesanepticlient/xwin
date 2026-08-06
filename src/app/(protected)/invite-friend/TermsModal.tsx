"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface TermsModalProps {
  children: React.ReactNode;
}

export default function TermsModal({ children }: TermsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure portal target is available on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const modalContent = isOpen ? (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col bg-[#f0f2f5] text-[#333333] transition-all duration-300 ease-in-out ${
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Top Fixed Header */}
      <header className="sticky top-0 z-10 flex items-center bg-[#333333] text-white px-4 py-3 shadow-md shrink-0">
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-9 h-9 rounded-md bg-[#444444] hover:bg-[#555555] active:scale-95 transition-all mr-3"
          aria-label="Close"
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h1 className="text-base font-bold tracking-wide uppercase">
          TERMS AND CONDITIONS
        </h1>
      </header>

      {/* Modal Content - Scrollable Area */}
      <main className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 pb-28 font-sans text-sm md:text-base leading-relaxed">
        {/* Card 1: Invite friends and earn money */}
        <section className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-[#111111] mb-2">
            Invite friends and earn money
          </h2>
          <p className="text-[#555555] text-sm leading-snug">
            Become a Winparbet partner, tell your friends about us, and make
            money! Build a multi-level network by inviting friends who in turn
            will bring their own friends. You can find your affiliate referral
            link in My Account. All you need to do is share the link with a
            friend and get your reward!
          </p>
        </section>

        {/* Card 2: How does it work? */}
        <section className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-[#111111] mb-3">
            How does it work?
          </h2>
          <ul className="space-y-2 text-[#444444] text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>You invite your friends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Your friends register, deposit funds, and place bets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>You receive your reward!</span>
            </li>
          </ul>
        </section>

        {/* Card 3: How do I invite friends? */}
        <section className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-[#111111] mb-3">
            How do I invite friends?
          </h2>
          <ul className="space-y-2 text-[#444444] text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Copy your personal referral link and send it to your friends
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Share your referral link on social media</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Place banners on your webpage, blog, forum, or website, etc.
              </span>
            </li>
          </ul>
        </section>

        {/* Card 4: How much can I earn? */}
        <section className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-[#111111] mb-2">
            How much can I earn?
          </h2>
          <p className="text-[#555555] text-sm leading-snug mb-3">
            As you refer friends, you build a multi-level network. At each level
            you'll earn a percentage of the WinpariBet net profit:
          </p>

          <div className="space-y-1.5 text-sm font-medium text-[#333333] mb-4">
            <div>
              1 level - <span className="font-bold text-black">15%</span>
            </div>
            <div>
              2 level - <span className="font-bold text-black">8%</span>
            </div>
            <div>
              3 level - <span className="font-bold text-black">5%</span>
            </div>
            <div>
              4 level - <span className="font-bold text-black">2%</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <svg
              className="w-full max-w-[340px]"
              viewBox="0 0 340 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M170 60 L170 320 M50 60 L290 60 M50 60 L50 320 M290 60 L290 320 M50 140 L290 140 M120 140 L120 220 M220 140 L220 220 M50 220 L290 220 M50 320 L290 320"
                stroke="#B0B0B0"
                strokeWidth="1.5"
              />
              <path d="M290 100 L290 90 L295 95 Z" fill="#666666" />
              <path d="M290 180 L290 170 L295 175 Z" fill="#666666" />
              <path d="M290 270 L290 260 L295 265 Z" fill="#666666" />

              <g transform="translate(20, 30)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  15%
                </text>
              </g>

              <g transform="translate(260, 30)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  15%
                </text>
              </g>

              <rect
                x="110"
                y="38"
                width="120"
                height="24"
                rx="12"
                fill="#222222"
              />
              <text
                x="170"
                y="54"
                fill="white"
                fontSize="12"
                textAnchor="middle"
                fontWeight="bold"
              >
                Your friends
              </text>

              <g transform="translate(20, 110)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  8%
                </text>
              </g>

              <g transform="translate(140, 110)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  8%
                </text>
              </g>

              <g transform="translate(260, 110)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  8%
                </text>
              </g>

              <g transform="translate(80, 190)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  5%
                </text>
              </g>

              <g transform="translate(200, 190)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  5%
                </text>
              </g>

              <g transform="translate(20, 270)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  2%
                </text>
              </g>

              <g transform="translate(140, 270)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  2%
                </text>
              </g>

              <g transform="translate(260, 270)">
                <circle cx="30" cy="30" r="22" fill="#2D3748" />
                <circle cx="30" cy="22" r="8" fill="#CBD5E0" />
                <path d="M18 42 C18 34, 42 34, 42 42" fill="#CBD5E0" />
                <rect x="18" y="40" width="24" height="14" rx="7" fill="#222" />
                <text
                  x="30"
                  y="50"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  2%
                </text>
              </g>

              <text x="290" y="52" fill="#A0AEC0" fontSize="11">
                Level 1
              </text>
              <text x="290" y="132" fill="#A0AEC0" fontSize="11">
                Level 2
              </text>
              <text x="290" y="212" fill="#A0AEC0" fontSize="11">
                Level 3
              </text>
              <text x="290" y="292" fill="#A0AEC0" fontSize="11">
                Level 4
              </text>
            </svg>
          </div>
        </section>

        {/* Card 5: Withdrawal & Table */}
        <section className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-[#111111] mb-2">
            Withdrawal
          </h2>
          <ul className="space-y-2 text-[#444444] text-sm mb-4">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Your income is calculated every day, once every 60 minutes.
                Today's income can be transferred to your betting account after
                14 days. To claim your income, click the "Withdraw" button in
                the top right-hand corner of the Affiliate Program page.
              </span>
            </li>
          </ul>

          <p className="text-xs text-[#888888] mb-3">
            Example: The table shows days and affiliate's earnings per day.
          </p>

          <div className="overflow-x-auto border border-[#eaeaea] rounded-md mb-4">
            <table className="w-full text-center text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-[#f9f9f9] border-b border-[#eaeaea] text-[#555555]">
                  <th className="py-2 px-2 border-r border-[#eaeaea] font-medium">
                    Day
                  </th>
                  <th className="py-2 px-2 border-r border-[#eaeaea] font-medium">
                    Your earnings per day, €
                  </th>
                  <th className="py-2 px-2 border-r border-[#eaeaea] font-medium">
                    Day
                  </th>
                  <th className="py-2 px-2 font-medium">
                    Your earnings per day, €
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea] text-[#333333]">
                {[
                  [1, "5", 9, "1"],
                  [2, "3", 10, "-3"],
                  [3, "2", 11, "-2"],
                  [4, "1", 12, "0"],
                  [5, "0", 13, "0"],
                  [6, "4", 14, "10"],
                  [7, "6", 15, "0"],
                  [8, "8", 16, "3"],
                ].map(([d1, e1, d2, e2], idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 border-r border-[#eaeaea] text-[#777777]">
                      {d1}
                    </td>
                    <td className="py-2 px-2 border-r border-[#eaeaea] font-bold">
                      {e1}
                    </td>
                    <td className="py-2 px-2 border-r border-[#eaeaea] text-[#777777]">
                      {d2}
                    </td>
                    <td className="py-2 px-2 font-bold">{e2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-[#777777] leading-relaxed mb-3">
            Your withdrawal for the 1st day will be €5 and it will become
            available on the 15th day. Your earnings will accrue in your account
            if you don't withdraw the funds every day. So, your total profit for
            the first 10 days will be available to withdraw on the 25th day and
            will be 5+3+2+1+0+4+6+8+1-3 = €27
          </p>

          <ul className="space-y-3 text-[#444444] text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                If your affiliate program balance is negative, you will not be
                able to make a withdrawal until the balance becomes positive.
                Your betting account is not charged when the affiliate program
                balance is negative.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Your earnings are not fixed: they depend on the WinpariBet profit
                generated from players who registered using your link. The
                commission fees, bonuses, and the total turnover of players you
                bring to the site do not affect your earnings.
              </span>
            </li>
          </ul>
        </section>

        {/* Card 6: What else do I need to know? */}
        <section className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-[#111111] mb-3">
            What else do I need to know?
          </h2>
          <ul className="space-y-3 text-[#444444] text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Participation in the Affiliate Program is possible only after
                the first deposit is made and your "Personal Profile" details
                are fully completed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                You can drop your Level 1 referral and their referral network if
                you find that it is not bringing you profit.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Only bets made with real money on sporting events and financials
                will be included in the Affiliate Program (bets using the bonus
                account are not eligible).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Advertising under the WinpariBet name is not permitted. This
                includes the use of unsolicited email (spam), contextual
                advertising containing the WinpariBet trademark, and Click-under
                and Pop-under Ads. If a player is found to have taken such
                actions, their account will be excluded from the Affiliate
                Program and all earnings received through the program will be
                canceled. Withdrawal of funds will not be available.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                The use of "cookie stuffing" techniques (such as the following)
                is prohibited:
              </span>
            </li>
            <li className="flex items-start gap-2 pl-4">
              <span className="font-bold">•</span>
              <span>
                Opening the WinpariBet website in iframe with zero-length sides or
                in an invisible zone.
              </span>
            </li>
            <li className="flex items-start gap-2 pl-4">
              <span className="font-bold">•</span>
              <span>
                Adding tags, cookie scripts, or other similar actions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                You cannot register your own player account through your
                affiliate link, register again as a sub-affiliate (at Level 2,
                3, or 4), or enter into collusion with other players. If these
                rules are not observed, the customer's account will be closed
                and blocked.
              </span>
            </li>
          </ul>
        </section>
      </main>

      {/* Fixed Bottom Red Button */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-lg z-20">
        <Link
          href={"/account/deposit"}
          className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] active:bg-[#9a0007] text-white font-bold py-3.5 rounded-lg text-base tracking-wide uppercase transition-colors"
        >
          Take part
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div onClick={handleOpen} className="inline-block cursor-pointer">
        {children}
      </div>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
