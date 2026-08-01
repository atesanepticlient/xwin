// components/InternetGate.tsx
"use client";

import { useInternet } from "@/app/internet-provider";
import OfflineScreen from "./OfflineScreen";

export default function InternetGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOnline } = useInternet();

  // Offline: don't mount the app at all. No layout, no auth check, no
  // data fetching — just the offline screen. When "online" fires again,
  // {children} mounts fresh, so every provider/query starts clean instead
  // of resuming with whatever half-failed state it was in when the
  // connection dropped.
  if (!isOnline) {
    return <OfflineScreen />;
  }

  return <>{children}</>;
}
