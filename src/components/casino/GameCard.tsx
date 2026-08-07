// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { Star } from "lucide-react";
// import useOpenGame from "@/hooks/useOpenGame";
// import GameBoard from "./game-board";
// import { GameItem, GreGameItem } from "@/types/game";

// interface GameCardProps {
//   game: GameItem;
//   theme?: "dark" | "light"; // Theme prop added, defaults to dark
//   onPlay?: (game: GameItem) => void;
//   onPlayFree?: (game: GameItem) => void;
//   onFavoriteToggle?: (game: GameItem) => void;
// }

// const GameCard: React.FC<GameCardProps> = ({
//   game,
//   theme = "dark",
//   onPlay,
//   onFavoriteToggle,
// }) => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const isLight = theme === "light";

//   const { product_code, game_code, game_type } = game;

//   const {
//     openGame,
//     gameContent,
//     gameUrl,
//     gameError,
//     gameOpen,
//     reset,
//     isLoading,
//   } = useOpenGame({ product_code, game_code, game_type });

//   return (
//     <>
//       {gameOpen && (
//         <GameBoard
//           isLoading={isLoading}
//           url={gameUrl}
//           content={gameContent}
//           onCloseGame={() => reset()}
//           error={gameError}
//         />
//       )}
//       <div
//         onClick={openGame}
//         className={`group relative overflow-hidden transition-all duration-300 rounded-md border ${
//           isLight
//             ? "bg-white border-zinc-200 shadow-sm hover:shadow-md"
//             : "bg-[#232527] border-transparent shadow-md"
//         }`}
//       >
//         {/* Aspect Ratio Container */}
//         <div
//           className={`relative aspect-square w-full overflow-hidden ${
//             isLight ? "bg-zinc-100" : "bg-zinc-800"
//           }`}
//         >
//           {/* Simple Preloader Skeleton */}
//           {!isLoaded && (
//             <div
//               className={`absolute inset-0 z-10 animate-pulse ${
//                 isLight ? "bg-zinc-200" : "bg-zinc-700/60"
//               }`}
//             />
//           )}

//           {/* Lazy Loaded Image */}
//           <Image
//             src={game.image_url}
//             alt={game.game_name}
//             fill
//             sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw"
//             loading="lazy"
//             onLoad={() => setIsLoaded(true)}
//             className={`object-cover transition-all duration-500 group-hover:scale-105 ${
//               isLoaded ? "opacity-100" : "opacity-0"
//             }`}
//             unoptimized
//           />

//           {/* Hover Overlay */}
//           <div className="absolute inset-0 z-20 bg-black/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-2">
//             <button
//               onClick={() => onPlay?.(game)}
//               className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:bg-emerald-700 active:scale-95"
//             >
//               Play
//               <span className="text-xs">▶</span>
//             </button>
//           </div>
//         </div>

//         {/* Bottom Info Bar */}
//         <div
//           className={`flex items-center justify-between px-2.5 py-2 transition-colors ${
//             isLight ? "bg-zinc-50 text-zinc-800" : "bg-[#2d3034] text-zinc-200"
//           }`}
//         >
//           <div className="flex items-center gap-2 overflow-hidden">
//             {game.provider_icon ? (
//               <img
//                 src={game.provider_icon}
//                 alt="provider"
//                 className="h-4 w-4 object-contain flex-shrink-0"
//               />
//             ) : (
//               <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-red-500/20 text-[9px] font-bold text-red-500">
//                 ▶
//               </span>
//             )}

//             <span className="truncate text-xs font-medium tracking-wide">
//               {game.game_name}
//             </span>
//           </div>

//           <button
//             onClick={() => onFavoriteToggle?.(game)}
//             className={`ml-1 transition-colors flex-shrink-0 ${
//               isLight
//                 ? "text-zinc-400 hover:text-green-600"
//                 : "text-zinc-400 hover:text-green-500"
//             }`}
//             aria-label="Favorite game"
//           >
//             <Star
//               size={14}
//               className={
//                 game.is_favorite
//                   ? "fill-green-500 text-green-500"
//                   : isLight
//                     ? "text-zinc-400 hover:text-zinc-600"
//                     : "text-zinc-400"
//               }
//             />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default GameCard;
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import GameBoard from "./game-board";
import { GameItem, GreGameItem } from "@/types/game";
import useOpenGame from "@/hooks/useOpenGame";

interface GameCardProps {
  game: GreGameItem;
  theme?: "dark" | "light"; // Theme prop added, defaults to dark
  onPlay?: (game: GameItem) => void;
  onPlayFree?: (game: GameItem) => void;
  onFavoriteToggle?: (game: GameItem) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  theme = "dark",
  onPlay,
  onFavoriteToggle,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isLight = theme === "light";

  const { title, imageUrl, provider } = game;

  const { openGame, gameUrl, gameError, gameOpen, reset, isLoading } =
    useOpenGame({ gameId: game.id });
  return (
    <>
      {gameOpen && (
        <GameBoard
          isLoading={isLoading}
          url={gameUrl!}
          onCloseGame={() => reset()}
          error={gameError}
        />
      )}
      <div
        onClick={openGame}
        className={`group max-w-[200px] relative overflow-hidden transition-all duration-300 rounded-2xl border ${
          isLight
            ? "bg-white border-zinc-200 shadow-sm hover:shadow-md"
            : "bg-[#232527] border-transparent shadow-md"
        }`}
      >
        {/* Aspect Ratio Container */}
        <div
          className={`relative aspect-[3/2] w-full overflow-hidden ${
            isLight ? "bg-zinc-100" : "bg-zinc-800"
          }`}
        >
          {/* Simple Preloader Skeleton */}
          {!isLoaded && (
            <div
              className={`absolute inset-0 z-10 animate-pulse ${
                isLight ? "bg-zinc-200" : "bg-zinc-700/60"
              }`}
            />
          )}

          {/* Lazy Loaded Image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw"
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              className={`object-cover transition-all duration-500 group-hover:scale-105 rounded-2xl ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Hover Overlay */}
        </div>

        {/* Bottom Info Bar */}
        <div
          className={`flex justify-center justify-between px-2.5 py-2 h-[55px] transition-colors ${
            isLight ? "bg-zinc-50 text-zinc-800" : "bg-[#2d3034] text-zinc-200"
          }`}
        >
          <div className="">
            <span className="truncate block text-xs max-w-[90px] line-clamp-2 font-medium tracking-wide">
              {title}
            </span>
            <span className="truncate capitalize block text-[10px] text-[rgb(135,135,135)] font-medium tracking-wide">
              {provider}
            </span>
          </div>

          <div className="flex justify-between  items-center gap-2 overflow-hidden">
            <button
              // onClick={() => onFavoriteToggle?.(game)}
              className={`ml-1 transition-colors flex-shrink-0 ${
                isLight
                  ? "text-zinc-400 hover:text-green-600"
                  : "text-zinc-400 hover:text-green-500"
              }`}
              aria-label="Favorite game"
            >
              <Star
                size={14}
                className={
                  false
                    ? "fill-green-500 text-green-500"
                    : isLight
                      ? "text-zinc-400 hover:text-zinc-600"
                      : "text-zinc-400"
                }
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameCard;
