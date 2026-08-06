import React from "react";

import logo from "@/../public/assets/svg/livvbet-white-logo.svg";
import Image from "next/image";

const GameOpeningLoader = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="circle">
        <div className="borderCircle"></div>
        <div className="borderCircle2"></div>
        <div className="borderCircle3"></div>
        <div className="innerCircle flex items-center justify-center">
          <p>
            <Image
              src={logo}
              alt="WinpariBet"
              className="w-[70px] -translate-y-[15px]"
            />
          </p>
        </div>
        <div className="outerCirlce"></div>
      </div>
    </div>
  );
};

export default GameOpeningLoader;
