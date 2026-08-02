import { X, Star, StarHalf, Download } from "lucide-react";
import appLogo from "@/../public/web-app-manifest-192x192.png";
import Image from "next/image";

interface AppBannerProps {
  appName?: string;
  rating?: number;
  onClose?: () => void;
  onDownload?: () => void;
}

export default function AppBanner({
  appName = "WinpariBet",
  rating = 4.5,
  onClose = () => {},
  onDownload = () => {},
}: AppBannerProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="w-full border-y border-neutral-700 bg-[#2b2b2e] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black shrink-0">
            <Image src={appLogo} alt="App" className="rounded-md" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-white font-semibold text-base leading-tight">
              {appName}
            </span>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: fullStars }).map((_, i) => (
                <Star
                  key={`full-${i}`}
                  size={14}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
              {hasHalfStar && (
                <StarHalf
                  size={14}
                  className="fill-yellow-400 text-yellow-400"
                />
              )}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <Star
                  key={`empty-${i}`}
                  size={14}
                  className="text-yellow-400"
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onDownload}
          className="flex items-center gap-2 text-white font-bold text-sm tracking-wide hover:text-neutral-200 transition-colors shrink-0"
        >
          DOWNLOAD
          <Download size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
