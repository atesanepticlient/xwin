/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FaRegStar } from "react-icons/fa";
import { NetEnt, Title } from "@/types/game";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LiaHeartSolid } from "react-icons/lia";
// import { Loader } from "./loader/GameLoader";
import { providers } from "@/data/api-providers";
import { useOpenGameMutation } from "@/lib/features/gamesApiSlice";

import logo from "@/../public/assets/svg/livvbet-white-logo.svg";

import PlayButton from "./buttons/play-button";
import { redirect } from "next/navigation";
import useCurrentUser from "@/hook/useCurrentUser";
interface GameCardWithProviderProps {
  game: NetEnt;
  gameType?: "live" | "slot";
}
export const GameCard = ({ game, gameType }: GameCardWithProviderProps) => {
  const user = useCurrentUser();

  const [imageLoaded, setImageLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [iframe, setIframe] = useState("");
  const { img, name, title, id } = game;

  const [openGame, { isLoading }] = useOpenGameMutation();

  const handleImageLoad = () => {
    setImageLoad(true);
  };

  const findProviderImage = (providerName: Title) => {
    const provider = providers.find(
      (provider) => provider.name == providerName,
    );
    return provider?.imageWhite;
  };
  const providerImag = findProviderImage(title);

  const handleOpenGame = (gameId: string) => {
    // openGame({ gameId, demo: "0" })
    //   .unwrap()
    //   .then((res) => {
    //     if (res) {
    //       const url = res.content.game.url;
    //       const iframeMode = res.content.game.iframe;
    //       if (iframeMode == "0") {
    //         location.href = url;
    //       } else {
    //         setIframe(url);
    //         setShowModal(true);
    //       }
    //     }
    //   })
    //   .catch((error) => {
    //     console.log("ERRRO ", error);
    //   });

    if (!user) return redirect("/login");
    redirect(`/play?gameId=${gameId}`);
  };

  const closeGame = () => {
    setShowModal(false);
    setIframe("");
  };

  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<any>(null);

  useEffect(() => {
    const imgC = new window.Image();
    imgC.src = img;
    imgC.onload = () => {
      setImageSrc(img);
      setLoaded(true);
    };
  }, [img]);

  return (
    <>
      {loaded && imageSrc ? (
        <div className="relative mih-h-[120px] game-main overflow-hidden rounded-md">
          <div
            title={game.name}
            className={`relative overflow-y-hidden  `}
          >
            <div className="shiny-card w-full">
              <img
                alt={name}
                src={imageSrc}
                loading="lazy"
                className="w-full h-auto  align-middle select-none "
              />
            </div>

            <div className="absolute top-2 right-2 z-10 ">
              <div className="w-[18px] h-[18px] rounded-full bg-white/10 flex justify-center items-center ">
                <FaRegStar className="w-[15px] h-[15px] text-white" />
              </div>
            </div>
          </div>
          <div className="play absolute top-0 left-0  w-full h-full bg-transparent flex justify-center items-center">
            <PlayButton
              className="button"
              onClick={() => handleOpenGame(game.id)}
              disabled={isLoading}
            />
          </div>

          {gameType == "live" && (
            <div className="absolute px-2 left-0 bottom-0 right-0 w-full py-2 bg-black/75 ">
              <span className="text-xs lg:text-sm font-normal tracking-wide text-white max-w-[70%] line-clamp-1">
                {game.name}
              </span>
            </div>
          )}

          <div className="bg-gray-200/70">
            <p className="text-center text-xs py-1 font-medium text-black line-clamp-1 max-w-[80%] mx-auto">{name}</p>
          </div>
        </div>
      ) : (
        <GameLoader />
      )}

      {/* {showModal && iframe && (
        <div className="fixed z-[1000] inset-0 bg-black bg-opacity-60 flex items-center justify-center ">
          <div className="relative w-full h-screen bg-white rounded-lg shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded"
            >
              Close
            </button>
            <iframe
              src={iframe}
              className="w-full h-full border-0 rounded-b-lg"
              allowFullScreen
            />
          </div>
        </div>
      )} */}
    </>
  );
};

export const GameLoader = () => {
  return (
    <div className="w-full h-[120px] bg-[#262B31] flex items-center justify-center">
      <Image
        src={logo}
        alt="livvbet"
        className=" w-[80px] select-none opacity-50"
      />
    </div>
  );
};
