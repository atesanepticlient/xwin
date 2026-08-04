export function TetherIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        fill="#fff"
        d="M17.9 17.4v-.01c-.11.01-.68.04-1.94.04-1.01 0-1.72-.03-1.97-.04v.01c-3.9-.17-6.81-.85-6.81-1.66s2.91-1.49 6.81-1.66v2.65c.26.02.98.06 1.99.06 1.2 0 1.8-.05 1.92-.06v-2.65c3.89.17 6.79.85 6.79 1.65s-2.9 1.48-6.79 1.65m0-3.59v-2.37h5.42V7.9H8.62v3.54h5.42v2.37c-4.4.2-7.71 1.07-7.71 2.12s3.31 1.91 7.71 2.11v7.56h1.94v-7.56c4.39-.2 7.7-1.06 7.7-2.11s-3.31-1.92-7.7-2.12"
      />
    </svg>
  );
}

export function TronIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#fff" />
      <path
        fill="#FF060A"
        d="M23.7 9.6 8.5 6.9l6.2 18.9 12.6-13.7-3.6-1.5zM16 24l-4.9-14.9 8.6 1.5L16 24z"
      />
    </svg>
  );
}

export function PolygonIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#fff" />
      <path
        fill="#8247E5"
        d="M21 12.4c-.4-.2-.9-.2-1.3 0l-3 1.7-2 1.1-3 1.7c-.4.2-.9.2-1.3 0l-2.4-1.4c-.4-.2-.6-.6-.6-1.1v-2.7c0-.4.2-.8.6-1.1L10.4 8c.4-.2.9-.2 1.3 0l2.4 1.4c.4.2.6.6.6 1.1v1.7l2-1.1V9.4c0-.4-.2-.8-.6-1.1L11.7 6c-.4-.2-.9-.2-1.3 0L6 8.3c-.4.3-.6.7-.6 1.1v4.6c0 .4.2.8.6 1.1l4.4 2.3c.4.2.9.2 1.3 0l3-1.7 2-1.1 3-1.7c.4-.2.9-.2 1.3 0l2.4 1.4c.4.2.6.6.6 1.1v2.7c0 .4-.2.8-.6 1.1l-2.4 1.5c-.4.2-.9.2-1.3 0l-2.4-1.4c-.4-.2-.6-.6-.6-1.1v-1.7l-2 1.1v1.7c0 .4.2.8.6 1.1l4.4 2.3c.4.2.9.2 1.3 0l4.4-2.3c.4-.2.6-.6.6-1.1v-4.6c0-.4-.2-.8-.6-1.1L21 12.4z"
      />
    </svg>
  );
}

export function BitcoinIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        fill="#fff"
        d="M21.5 14.2c.3-1.9-1.2-3-3.1-3.6l.6-2.5-1.5-.4-.6 2.4c-.4-.1-.8-.2-1.2-.3l.6-2.4-1.5-.4-.6 2.5c-.3-.1-.6-.1-1-.2l-2.1-.5-.4 1.6s1.1.3 1.1.3c.6.1.7.5.7.8l-.7 2.9c0 .1.1.1.1.1s-.1 0-.1-.1l-1 4c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.7 1.7 2 .5c.4.1.7.2 1.1.3l-.6 2.5 1.5.4.6-2.5c.4.1.8.2 1.2.3l-.6 2.5 1.5.4.6-2.5c2.6.5 4.6.3 5.4-2.1.7-1.9 0-3-1.4-3.7 1-.2 1.7-.9 1.9-2.2m-3.5 4.9c-.5 1.9-3.7.9-4.8.6l.9-3.4c1 .3 4.4.9 3.9 2.8m.5-4.9c-.4 1.7-3.1.9-4 .6l.8-3.1c.9.2 3.7.6 3.2 2.5"
      />
    </svg>
  );
}

export function EthIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#eee" />
      <path fill="#343434" d="M16 4v8.9l7.5 3.3z" />
      <path fill="#8C8C8C" d="M16 4 8.5 16.2l7.5-3.3z" />
      <path fill="#3C3C3B" d="M16 21.9v6.1l7.5-10.4z" />
      <path fill="#8C8C8C" d="M16 28v-6.1l-7.5-4.3z" />
    </svg>
  );
}

export function UsdcIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="#fff" strokeWidth="1.3" />
      <text
        x="16"
        y="20.5"
        fontSize="13"
        fill="#fff"
        textAnchor="middle"
        fontFamily="Arial"
        fontWeight="bold"
      >
        $
      </text>
    </svg>
  );
}

export function BaseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <path fill="#fff" d="M16 6a10 10 0 100 20 10 10 0 000-20zm0 2.5v15A7.5 7.5 0 1116 8.5z" />
    </svg>
  );
}

export function OptimismIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#FF0420" />
      <text
        x="16"
        y="20"
        fontSize="11.5"
        fill="#fff"
        textAnchor="middle"
        fontFamily="Arial"
        fontWeight="bold"
      >
        OP
      </text>
    </svg>
  );
}

export function ArbitrumIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#28A0F0" />
      <path fill="#fff" d="M16 6.5l8.2 14.2H7.8L16 6.5z" />
      <path fill="#1A6EAE" d="M16 6.5l-3.4 6-4.8 8.2 8.2-6z" />
    </svg>
  );
}

export function AlgorandIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 40">
      <path
        fill="#000"
        d="M43.6 39.4h-6.9l-4.6-14.3-8.3 14.3h-7l12.5-21.6-3-9.3-16.9 30.9H0L21.5.6h7.1l3 9.1L36.9.6h6.9l-8.3 14.4z"
      />
    </svg>
  );
}
