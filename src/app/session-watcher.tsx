"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SessionWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (
      session?.error === "UserNotFound" ||
      session?.error === "SessionRevoked"
    ) {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return null;
}
