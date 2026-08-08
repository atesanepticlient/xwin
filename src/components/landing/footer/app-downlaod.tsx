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
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      console.log("✅ beforeinstallprompt fired!"); // Debug log
      event.preventDefault();
      setDeferredPrompt(event);
      setIsSupported(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if appinstalled event exists (already installed)
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        console.log("App is already installed");
        setIsSupported(false);
      }
    };

    checkInstalled();

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log("❌ deferredPrompt is null - Event never fired");
      console.log("Possible reasons:");
      console.log("- Using HTTP instead of HTTPS");
      console.log("- Not on a supported browser");
      console.log("- PWA manifest.json missing or invalid");
      return;
    }

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        console.log("✅ User accepted installation");
        setDeferredPrompt(null);
        setIsSupported(false);
      }
    } catch (error) {
      console.error("Installation error:", error);
    }
  };

  // Only show if install prompt is available
  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={installApp}
      className="px-8 py-2 rounded-lg flex items-center justify-center gap-2 bg-[#499A13] hover:bg-[#4e9022] text-white text-sm font-medium transition-all"
    >
      <MdOutlineMobileScreenShare className="w-4 h-4 text-white" />
      WEB APP
    </button>
  );
}