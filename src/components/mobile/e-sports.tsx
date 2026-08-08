"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOpenGame } from "@/store/useStore";
import { getSportsUrl } from "@/lib/helpers";
import useCurrentUser from "@/hook/useCurrentUser";

const Esports = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const { gameUrl, loading, error, fetchGame } = useOpenGame();

  // 1. Redirect if unauthenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // 2. Only fetch game if user is authenticated
  useEffect(() => {
    if (user) {
      fetchGame();
    }
  }, [user, fetchGame]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-screen bg-[#EDF0F2] w-full items-center justify-center fixed inset-0 z-50  overflow-hidden text-black">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#EDF0F2] text-white">
        {error}
      </div>
    );
  }

  const iframeUrl = getSportsUrl(gameUrl, "/esports/real");
  if (!iframeUrl) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen bg-[#EDF0F2] overflow-hidden pb-[90px] pt-[100px]">
      <iframe
          src={iframeUrl}
          className="h-full w-full border-0 block"
          allowFullScreen
          title="Esports"
          allow="fullscreen; autoplay; clipboard-write; encrypted-media; storage-access"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-storage-access-by-user-activation"
          referrerPolicy="no-referrer-when-downgrade"
        />
    </div>
  );
};

export default Esports;
