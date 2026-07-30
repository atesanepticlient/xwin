// providers/internet-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type InternetContextType = {
  isOnline: boolean;
};

const InternetContext = createContext<InternetContextType>({
  isOnline: true,
});

export function InternetProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <InternetContext.Provider value={{ isOnline }}>
      {children}
    </InternetContext.Provider>
  );
}

export const useInternet = () => useContext(InternetContext);
