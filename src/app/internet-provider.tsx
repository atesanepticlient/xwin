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
  // Lazy initializer runs synchronously on the client during the first
  // render — before any child component function is ever invoked. This
  // matters: it lets InternetGate (below) decide not to render {children}
  // at all on an offline first load, instead of mounting the app for one
  // tick and firing off auth/data fetches before we get a chance to react.
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
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
