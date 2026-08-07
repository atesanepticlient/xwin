"use client";

import React, { useEffect, useState } from "react";
import { FaAndroid } from "react-icons/fa";
import { MdOutlineMobileScreenShare } from "react-icons/md";

const AppDownload = () => {
  const downloadApp = () => {
    const link = document.createElement("a");
    link.href = "/winparibet.apk";
    link.download = "WinpariBet.apk";
    document.body.appendChild(link);
    link.click();
    link.remove();

    localStorage.setItem("app-downloaded", "true");
  };
  return (
    <div className="w-full md:w-[400px] mx-auto pt-6 pb-4">
      <h3 className="text-base text-white font-semibold uppercase text-center">
        Download mobile app
      </h3>

      <div className="flex gap-1.5 items-center justify-center mt-2">
        <button
          onClick={() => downloadApp()}
          className="px-8 py-2 rounded-lg flex items-center justify-center gap-2 bg-[#499A13] hover:bg-[#4e9022] text-white text-sm font-medium"
        >
          <FaAndroid className="w-4 h-4 text-white" />
          ANdRIOD
        </button>
        <InstallAppButton />
      </div>
    </div>
  );
};

export default AppDownload;

function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={() => installApp()}
      className="px-8 py-2 rounded-lg flex items-center justify-center gap-2 bg-[#499A13] hover:bg-[#4e9022] text-white text-sm font-medium"
    >
      <MdOutlineMobileScreenShare className="w-4 h-4 text-white" />
      WEB APP
    </button>
  );
}
