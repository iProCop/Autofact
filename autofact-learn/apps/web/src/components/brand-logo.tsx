export function BrandLogo({ size = 88 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-float"
      aria-hidden
    >
      <defs>
        <linearGradient id="aGrad" x1="10" y1="110" x2="110" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a4d6e" />
          <stop offset="0.45" stopColor="#2f8f7a" />
          <stop offset="1" stopColor="#b4e64b" />
        </linearGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M28 98 L60 18 L92 98"
        stroke="url(#aGrad)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      <path
        d="M34 72 C42 66, 52 64, 60 64 C68 64, 78 66, 86 72 L92 72 C84 78, 72 82, 60 82 C48 82, 36 78, 28 72 Z"
        fill="#b4e64b"
        filter="url(#glow)"
      />
      <circle cx="48" cy="74" r="3.2" fill="#0a0e14" />
      <circle cx="72" cy="74" r="3.2" fill="#0a0e14" />
    </svg>
  );
}
