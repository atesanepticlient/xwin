export function PolygonHex({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 3 27 9.5v13L16 29 5 22.5v-13L16 3z"
        stroke="#8247E5"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export function DashBadge({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#111" />
      <rect x="9" y="14.5" width="14" height="3" rx="1.5" fill="#fff" />
    </svg>
  );
}

export function BinancePayLogo() {
  return (
    <div className="flex items-center gap-1 rounded-md bg-[#F0B90B] px-3 py-3 text-black">
      <svg width="16" height="16" viewBox="0 0 32 32">
        <path
          fill="#000"
          d="M16 4l3.2 3.2L11 15.4l-3.2-3.2L16 4zm7.2 7.2L26.4 14.4 16 24.8l-3.2-3.2 10.4-10.4zM8.8 14.4L12 17.6 8.8 20.8 5.6 17.6l3.2-3.2zm14.4 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zM16 17.6l3.2 3.2L16 24 12.8 20.8 16 17.6z"
        />
      </svg>
      <span className="text-[15px] font-extrabold tracking-tight">BINANCE</span>
      <span className="translate-y-[3px] text-[9px] font-normal">PAY</span>
    </div>
  );
}
