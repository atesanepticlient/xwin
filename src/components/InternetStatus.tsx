// components/InternetStatus.tsx
"use client";

import { useInternet } from "@/app/internet-provider";
import OfflineScreen from "./OfflineScreen";

export default function InternetStatus() {
  const { isOnline } = useInternet();
  console.log({isOnline})
  if (isOnline) return null;

  return <OfflineScreen />;
}
