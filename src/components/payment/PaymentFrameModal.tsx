"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";

// Where the gateway sends the user after paying (see back_url / callbackurl).
const RETURN_PATH = "/account/transaction";

/**
 * Full-page modal that shows the payment page in an iframe (mobile site).
 * It is rendered straight into document.body (portal). A "fixed" element
 * inside a parent that has a transform / filter / animation is sized to that
 * parent instead of the screen, which is what made it not full page.
 * Back closes it and returns to the deposit form. When the gateway sends the
 * user back to our own site inside the frame, the modal closes and the real
 * page opens.
 */
const PaymentFrameModal = ({
  url,
  onBack,
  title = "Payment",
}: {
  url: string;
  onBack: () => void;
  title?: string;
}) => {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // keep the page behind the modal from scrolling
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Runs on every navigation inside the frame. While it shows the gateway
  // (another origin) reading the location throws, which we ignore.
  const handleLoad = () => {
    try {
      const loc = frameRef.current?.contentWindow?.location;
      if (
        loc &&
        loc.origin === window.location.origin &&
        loc.pathname.startsWith(RETURN_PATH)
      ) {
        router.push(loc.pathname + loc.search);
      }
    } catch {
      // still on the gateway page
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[99999] flex w-full flex-col bg-white"
      // dvh = the visible height on mobile browsers (address bar shown or hidden)
      style={{ height: "100dvh" }}
    >
      <div
        className="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-brand-foreground px-2 text-white shrink-0"
        style={{ paddingTop: "env(safe-area-inset-top)", minHeight: 48 }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-1 py-2 text-sm font-medium"
        >
          <IoIosArrowBack className="h-5 w-5" />
          Back
        </button>
        <span className="text-center text-sm font-semibold">{title}</span>
        {/* some gateways refuse to load inside a frame: let the user open it directly */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-1 py-2 text-[11px] underline"
        >
          Open in browser
        </a>
      </div>

      <iframe
        ref={frameRef}
        src={url}
        title={title}
        onLoad={handleLoad}
        allow="payment *; clipboard-write"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    </div>,
    document.body,
  );
};

export default PaymentFrameModal;
