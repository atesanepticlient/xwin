"use client";
import React from "react";

interface FlipTextProps {
  /** The text to animate */
  text: string;
  /** Your own className(s) for color, font, gradient, stroke, etc. Applied to each character. */
  className?: string;
  /** Optional className for the outer wrapper span */
  wrapperClassName?: string;
  /** Duration of one character's animation cycle */
  duration?: string;
  /** Stagger delay between each character, in ms */
  staggerMs?: number;
  /** Starting stagger index — useful when chaining multiple FlipText blocks in a row */
  startIndex?: number;
}

export function FlipText({
  text,
  className = "",
  wrapperClassName = "",
  duration = "1.8s",
  staggerMs = 110,
  startIndex = 0,
}: FlipTextProps) {
  const chars = text.split("");

  return (
    <span className={`flip-text ${wrapperClassName}`}>
      {chars.map((char, index) => {
        const i = startIndex + index;
        return (
          <span
            key={index}
            className={`flip-text__char ${className}`}
            style={
              {
                "--i": i,
                animationDuration: duration,
                animationDelay: `calc(var(--i) * ${staggerMs}ms)`,
              } as React.CSSProperties
            }
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}

      <style jsx global>{`
        .flip-text {
          display: inline-flex;
        }
        .flip-text__char {
          display: inline-block;
          transform: translateY(-100%);
          opacity: 0;
          animation-name: flip-fall;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-iteration-count: infinite;
        }
        @keyframes flip-fall {
          40%,
          75% {
            transform: translateY(0);
            opacity: 1;
          }
          95%,
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}

export default FlipText;
