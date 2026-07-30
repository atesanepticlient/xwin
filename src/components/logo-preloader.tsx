"use client";
import React from "react";
interface TextPreloaderProps {
  theme?: "dark" | "light";
  /** Size scale from 1 (smallest) to 10 (largest). Default: 5 */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}
export default function TextPreloader({
  theme = "dark",
  size = 5,
  className = "",
  style = {},
}: TextPreloaderProps) {
  const textWinrx = "Winrx".split("");
  const textBet = "Bet".split("");

  // Clamp size to the 1-10 range just in case
  const clampedSize = Math.min(10, Math.max(1, size));

  // Map 1-10 to a font size range (in rem) and scale related props off it
  const fontSize = 0.9 + (clampedSize - 1) * 0.55; // 1 -> 0.9rem, 10 -> 5.85rem
  const winrxStroke = (1 + (clampedSize - 1) * 0.15).toFixed(2); // px
  const betStroke = (1.8 + (clampedSize - 1) * 0.25).toFixed(2); // px
  const letterSpacing = (0.2 + (clampedSize - 1) * 0.05).toFixed(2); // px

  return (
    <div
      className={`preloader-wrapper ${className}`}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "120px",
        display: "grid",
        placeItems: "center",
        background: "transparent",
        ...style,
      }}
    >
      <h1
        className="txt font-russo"
        aria-label="WinrxBet"
        style={
          {
            "--font-size": `${fontSize}rem`,
            "--winrx-stroke": `${winrxStroke}px`,
            "--bet-stroke": `${betStroke}px`,
            "--letter-spacing": `${letterSpacing}px`,
          } as React.CSSProperties
        }
      >
        {textWinrx.map((char, index) => (
          <span
            key={`winrx-${index}`}
            className="txt__character txt__character--winrx"
            style={{ "--i": index } as React.CSSProperties}
          >
            {char}
          </span>
        ))}
        {textBet.map((char, index) => {
          const globalIdx = textWinrx.length + index;
          return (
            <span
              key={`bet-${index}`}
              className="txt__character txt__character--bet"
              style={{ "--i": globalIdx } as React.CSSProperties}
            >
              {char}
            </span>
          );
        })}
      </h1>
      <style jsx>{`
        .txt {
          color: transparent;
          display: flex;
          font-weight: 900;
          font-style: italic;
          font-size: var(--font-size);
          margin: auto;
          user-select: none;
          letter-spacing: var(--letter-spacing);
        }
        .txt__character {
          display: inline-block;
          transform: translateY(-100%);
          opacity: 0;
          animation-duration: 1.8s;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-iteration-count: infinite;
          animation-delay: calc(var(--i) * 110ms);
        }

        /* ---- Winrx: bright green gradient like the logo ---- */
        .txt__character--winrx {
          animation-name: fall-winrx;
          -webkit-text-stroke: var(--winrx-stroke) #0c3d08;
          paint-order: stroke fill;
        }
        @keyframes fall-winrx {
          40%,
          75% {
            background-image: linear-gradient(
              160deg,
              #b6f26a 0%,
              #6ec22b 35%,
              #3f9614 60%,
              #1f5c0a 100%
            );
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            filter: drop-shadow(0 2px 2px rgba(6, 33, 3, 0.5));
            transform: translateY(0);
            opacity: 1;
          }
          95%,
          100% {
            opacity: 0;
            transform: translateY(100%);
          }
        }

        /* ---- Bet: white fill, thick dark-green outline, same both themes ---- */
        .txt__character--bet {
          animation-name: fall-bet;
          -webkit-text-stroke: var(--bet-stroke) #0c3d08;
          paint-order: stroke fill;
        }
        @keyframes fall-bet {
          40%,
          75% {
            color: #ffffff;
            transform: translateY(0);
            opacity: 1;
            filter: drop-shadow(0 2px 2px rgba(6, 33, 3, 0.55));
          }
          95%,
          100% {
            opacity: 0;
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}
