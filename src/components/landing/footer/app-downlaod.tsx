import React from "react";
import { FaAndroid } from "react-icons/fa";
import { MdOutlineMobileScreenShare } from "react-icons/md";

const AppDownload = () => {
  return (
    <div className="w-full md:w-[400px] mx-auto pt-6 pb-4">
      <h3 className="text-base text-white font-semibold uppercase text-center">
        Download mobile app
      </h3>

      <div className="flex gap-1.5 items-center justify-center mt-2">
        <button className="px-8 py-2 rounded-lg flex items-center justify-center gap-2 bg-[#499A13] hover:bg-[#4e9022] text-white text-sm font-medium">
          <FaAndroid className="w-4 h-4 text-white" />
          ANdRIOD
        </button>
        <button className="px-8 py-2 rounded-lg flex items-center justify-center gap-2 bg-[#499A13] hover:bg-[#4e9022] text-white text-sm font-medium">
          <MdOutlineMobileScreenShare className="w-4 h-4 text-white" />
          WEB APP
        </button>
      </div>
    </div>
  );
};

export default AppDownload;
