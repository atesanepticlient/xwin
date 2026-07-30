// components/InternetStatus.tsx
"use client";

import OfflineScreen from "./OfflineScreen";
import { useInternet } from "@/providers/internet-provider";

export default function InternetStatus() {
  const { isOnline } = useInternet();

  if (isOnline) return null;

  return <OfflineScreen />;
}
