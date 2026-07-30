"use client";

import TextPreloader from "@/components/logo-preloader";
import React, { useEffect, useState } from "react";

const Intro = () => {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2000);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2500); // 2s visible + 500ms fade

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`w-full h-screen left-0 top-0 fixed flex justify-center items-center z-[1000000000] bg-white transition-opacity duration-500 ease-out ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <TextPreloader size={3} />
    </div>
  );
};

export default Intro;
