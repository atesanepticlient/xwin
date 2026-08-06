// "use client";
// import { useOpenGSCGameMutation } from "@/lib/features/gamesApiSlice";
// import { useState } from "react";

// const useOpenGame = ({
//   game_code,
//   product_code,
//   game_type,
// }: {
//   product_code: number;
//   game_code: string;
//   game_type: string;
//   currency?: string;
// }) => {
//   const [gameOpen, setGameOpen] = useState(false);

//   const [openGameApi, { isLoading }] = useOpenGSCGameMutation();
//   const [gameUrl, setGameUrl] = useState(null);
//   const [gameContent, setGameContent] = useState(null);
//   const [gameError, setGameError] = useState(false);

//   const handleOpenGame = async () => {
//     setGameOpen(true);

//     const ip = "127.0.0.1";
//     try {
//       const res = await openGameApi({
//         game_type,
//         game_code,
//         product_code,
//         platform: "WEB",
//         ip,
//         operator_lobby_url: window.location.href,
//       }).unwrap();

//       if (res.code == 200) {
//         if (res.url) {
//           setGameUrl(res.url);
//         } else if (res.content) {
//           setGameContent(res.content);
//         }
//       } else {
//         setGameError(true);
//       }
//     } catch (error) {
//       console.log("OPEN GAME API ERROR : ", error);
//       setGameError(true);
//     }
//   };

//   const reset = () => {
//     setGameUrl(null);
//     setGameContent(null);
//     setGameOpen(false);
//     setGameError(false);
//   };

//   return {
//     openGame: handleOpenGame,
//     gameUrl,
//     gameContent,
//     gameError,
//     gameOpen,
//     reset,
//     isLoading,
//   };
// };

// export default useOpenGame;

"use client";
import { useState } from "react";

const useOpenGame = ({ gameId }: { gameId: string }) => {
  const [isLoading, setLoading] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

  const [gameUrl, setGameUrl] = useState(null);
  const [gameError, setGameError] = useState(false);

  const handleOpenGame = async () => {
    setGameOpen(true);

    try {
      setLoading(true);
      const res = await fetch("/api/open-1x", {
        method: "POST",
        body: JSON.stringify({ gameId: gameId }),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to open game");
      }

      if (result.data.content.game.url) {
        setGameUrl(result.data.content.game.url);
      } else {
        setGameError(true);
      }
    } catch (error) {
      console.log("OPEN GAME API ERROR : ", error);
      setGameError(true);
    }
    setLoading(false);
  };

  const reset = () => {
    setGameUrl(null);
    setGameOpen(false);
    setGameError(false);
  };

  return {
    openGame: handleOpenGame,
    gameUrl,
    gameError,
    gameOpen,
    reset,
    isLoading,
  };
};

export default useOpenGame;
