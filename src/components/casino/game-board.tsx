"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RiArrowDownWideLine } from "react-icons/ri";
import { GridLoader } from "react-spinners";

const GameBoard = ({
  isLoading,
  url,
  content,
  onCloseGame,
}: {
  isLoading: boolean;
  url?: string;
  content?: string;
  onCloseGame: () => void;
  error?: boolean;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen bg-black z-[999999]">
      <button
        onClick={() => onCloseGame()}
        className="left-1/2 -translate-x-1/2 top-1 absolute px-2 py-0.5 rounded cursor-pointer bg-white/30 z-[1000000]"
      >
        <RiArrowDownWideLine className="text-white" />
      </button>

      {isLoading && (
        <GridLoader
          size={12}
          className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute"
          color="#fff"
        />
      )}

      {!isLoading && (
        <>
          {url ? (
            <iframe
              src={url}
              className="top-0 left-0 right-0 absolute w-full h-screen border-none"
            />
          ) : content ? (
            <iframe
              srcDoc={content}
              className="top-0 left-0 right-0 absolute w-full h-screen border-none"
            />
          ) : null}
        </>
      )}
    </div>,
    document.body,
  );
};

export default GameBoard;
