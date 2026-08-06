"use client";

import { useAppStore } from "@/lib/store.zustond";
import { useEffect } from "react";

export default function AppInitializer() {
  const init = useAppStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return null;
}
