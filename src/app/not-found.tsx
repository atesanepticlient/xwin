"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const navigationLinks = [
    { label: "Sports", href: "/sports?type=line" },
    { label: "Live", href: "/sports?type=live" },
    { label: "Slots", href: "/casino" },
    { label: "Live Casino", href: "/live" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        {/* Illustration */}
        <div className="mb-8 md:mb-12 w-full max-w-md">
          <svg
            viewBox="0 0 400 320"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background grass */}
            <ellipse
              cx="200"
              cy="280"
              rx="160"
              ry="30"
              fill="#7EC151"
              opacity="0.3"
            />
            <path
              d="M 80 200 Q 120 160, 200 150 Q 280 160, 320 200"
              fill="#7EC151"
              opacity="0.2"
            />

            {/* Decorative circles */}
            <circle cx="100" cy="80" r="60" fill="#a8d5ba" opacity="0.4" />
            <circle cx="300" cy="100" r="80" fill="#a8d5ba" opacity="0.3" />

            {/* Football */}
            <ellipse cx="60" cy="250" rx="12" ry="20" fill="#1f1f1f" />
            <circle cx="85" cy="260" r="8" fill="#1f1f1f" opacity="0.6" />

            {/* Player 1 */}
            <g>
              {/* Head */}
              <circle cx="90" cy="100" r="18" fill="#d4a574" />
              {/* Jersey */}
              <rect
                x="75"
                y="125"
                width="30"
                height="50"
                rx="3"
                fill="#15803d"
              />
              {/* Jersey number */}
              <text
                x="90"
                y="160"
                textAnchor="middle"
                fontSize="28"
                fontWeight="bold"
                fill="white"
              >
                4
              </text>
              {/* Shorts */}
              <rect x="75" y="175" width="30" height="25" fill="#1f1f1f" />
              {/* Legs */}
              <rect x="78" y="200" width="6" height="35" fill="#d4a574" />
              <rect x="86" y="200" width="6" height="35" fill="#d4a574" />
              {/* Shoes */}
              <rect x="78" y="235" width="6" height="8" fill="#1f1f1f" rx="2" />
              <rect x="86" y="235" width="6" height="8" fill="#1f1f1f" rx="2" />
            </g>

            {/* Player 2 (middle) */}
            <g>
              {/* Head */}
              <circle cx="200" cy="85" r="20" fill="#d4a574" />
              {/* Jersey */}
              <rect
                x="182"
                y="112"
                width="36"
                height="58"
                rx="3"
                fill="#15803d"
              />
              {/* Jersey number */}
              <text
                x="200"
                y="152"
                textAnchor="middle"
                fontSize="32"
                fontWeight="bold"
                fill="white"
              >
                0
              </text>
              {/* Shorts */}
              <rect x="182" y="170" width="36" height="28" fill="#1f1f1f" />
              {/* Legs */}
              <rect x="187" y="198" width="7" height="40" fill="#d4a574" />
              <rect x="206" y="198" width="7" height="40" fill="#d4a574" />
              {/* Shoes */}
              <rect
                x="187"
                y="238"
                width="7"
                height="10"
                fill="#1f1f1f"
                rx="2"
              />
              <rect
                x="206"
                y="238"
                width="7"
                height="10"
                fill="#1f1f1f"
                rx="2"
              />
            </g>

            {/* Player 3 */}
            <g>
              {/* Head */}
              <circle cx="310" cy="105" r="18" fill="#d4a574" />
              {/* Jersey */}
              <rect
                x="295"
                y="130"
                width="30"
                height="50"
                rx="3"
                fill="#15803d"
              />
              {/* Jersey number */}
              <text
                x="310"
                y="165"
                textAnchor="middle"
                fontSize="28"
                fontWeight="bold"
                fill="white"
              >
                4
              </text>
              {/* Shorts */}
              <rect x="295" y="180" width="30" height="25" fill="#1f1f1f" />
              {/* Legs */}
              <rect x="298" y="205" width="6" height="35" fill="#d4a574" />
              <rect x="306" y="205" width="6" height="35" fill="#d4a574" />
              {/* Shoes */}
              <rect
                x="298"
                y="240"
                width="6"
                height="8"
                fill="#1f1f1f"
                rx="2"
              />
              <rect
                x="306"
                y="240"
                width="6"
                height="8"
                fill="#1f1f1f"
                rx="2"
              />
            </g>
          </svg>
        </div>

        {/* Content */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            ERROR
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto">
            This page doesn't exist, but the home page does
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 mb-12 md:mb-16 shadow-lg"
        >
          GO TO HOME PAGE
          <ArrowRight size={18} />
        </Link>

        {/* Navigation Grid */}
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 md:py-4 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 font-semibold rounded-lg transition-all duration-300 text-center text-sm md:text-base"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          Copyright © 2026 <span className="font-semibold">×PariBet</span>.
        </p>
      </footer>
    </div>
  );
}
