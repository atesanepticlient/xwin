export default function CoinsIllustration() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <ellipse cx="48" cy="82" rx="34" ry="6" fill="#f4f4f4" />

      {/* small round coin top */}
      <ellipse
        cx="46"
        cy="20"
        rx="9"
        ry="6"
        fill="#FFB300"
        transform="rotate(-18 46 20)"
      />
      <ellipse
        cx="46"
        cy="20"
        rx="9"
        ry="6"
        fill="none"
        stroke="#F59E00"
        strokeWidth="0.6"
        transform="rotate(-18 46 20)"
      />

      {/* big diagonal coin left */}
      <ellipse
        cx="28"
        cy="42"
        rx="7.5"
        ry="17"
        fill="#FFA000"
        transform="rotate(32 28 42)"
      />
      <ellipse
        cx="28"
        cy="42"
        rx="7.5"
        ry="17"
        fill="none"
        stroke="#E68900"
        strokeWidth="0.6"
        transform="rotate(32 28 42)"
      />

      {/* green bill top-left */}
      <rect
        x="14"
        y="44"
        width="20"
        height="7.5"
        rx="2.5"
        fill="#7CB342"
        transform="rotate(-28 14 44)"
      />

      {/* small coin bottom left */}
      <ellipse cx="20" cy="70" rx="9" ry="7" fill="#FFC107" />
      <ellipse cx="20" cy="70" rx="9" ry="7" fill="none" stroke="#F0AE00" strokeWidth="0.6" />

      {/* diagonal bill right-middle */}
      <rect
        x="52"
        y="52"
        width="22"
        height="7.5"
        rx="2.5"
        fill="#FDD835"
        transform="rotate(33 52 52)"
      />

      {/* long diagonal bill bottom right */}
      <rect
        x="42"
        y="68"
        width="30"
        height="8"
        rx="3"
        fill="#FFB300"
        transform="rotate(58 42 68)"
      />

      {/* tiny green dot bill */}
      <rect
        x="66"
        y="30"
        width="8"
        height="3.4"
        rx="1.2"
        fill="#8BC34A"
        transform="rotate(-30 66 30)"
      />
    </svg>
  );
}
