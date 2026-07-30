"use client";

import { useEffect, useState } from "react";

const RedirectCountdown = ({
  url,
  seconds = 3,
}: {
  url: string;
  seconds?: number;
}) => {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      location.href = url;
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, url]);

  return (
    <div className="w-full h-[300px] bg-[#EEEEEE] flex flex-col items-center justify-center gap-3">
      <p className="text-center text-sm lg:text-base text-[#9A9A9A]">
        Redirecting to payment page in
      </p>
      <div className="w-12 h-12 rounded-full bg-brand-foreground text-white flex items-center justify-center text-xl font-semibold">
        {count}
      </div>
      <button
        onClick={() => (location.href = url)}
        className="text-xs text-[#7BA234] underline"
      >
        Click here if not redirected automatically
      </button>
    </div>
  );
};

export default RedirectCountdown;
