"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signOut({
        redirect: false,
      });

      window.location.replace("/login");
    }
  }, [status]);

  return children;
}
