"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export function SessionWatcher() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/auth/session", {
        cache: "no-store",
      });

      if (res.status === 401) {
        await signOut({ redirect: false });
        window.location.replace("/login");
      }
    }, 15000); // every 15s

    return () => clearInterval(interval);
  }, []);

  return null;
}
