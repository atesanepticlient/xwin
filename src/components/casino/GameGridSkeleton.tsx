import React from "react";

interface GameGridSkeletonProps {
  theme?: "light" | "dark";
  count?: number;
}



const GameGridSkeleton: React.FC<GameGridSkeletonProps> = ({
  theme = "light",
  count = 12,
}) => {
  const isLight = theme === "light";

  return (
    <div className="grid grid-flow-col grid-rows-2 auto-cols-[150px] gap-[6px] overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`w-[150px] overflow-hidden rounded-md shadow-sm ${
            isLight ? "bg-white" : "bg-[#232527]"
          }`}
        >
          {/* 3:2 Card Ratio */}
          <div className="aspect-[3/2] w-full">
            {/* Image Area (Square) */}
            <div
              className={`aspect-square w-full animate-pulse ${
                isLight ? "bg-zinc-200" : "bg-zinc-700/60"
              }`}
            />

            {/* Bottom Bar */}
            <div
              className={`flex h-[calc(100%-100%)] items-center justify-between px-2.5 py-2 ${
                isLight ? "bg-zinc-100" : "bg-[#2d3034]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-4 w-4 animate-pulse rounded ${
                    isLight ? "bg-zinc-300" : "bg-zinc-600"
                  }`}
                />
                <div
                  className={`h-3 w-20 animate-pulse rounded ${
                    isLight ? "bg-zinc-300" : "bg-zinc-600"
                  }`}
                />
              </div>

              <div
                className={`h-3.5 w-3.5 animate-pulse rounded-full ${
                  isLight ? "bg-zinc-300" : "bg-zinc-600"
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameGridSkeleton;
