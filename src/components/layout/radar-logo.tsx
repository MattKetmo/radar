export function RadarLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
    >
      {/* Red squircle background */}
      <rect width="100" height="100" rx="20" ry="20" fill="#B91C1C" />

      {/* Bell dome + body */}
      <path
        d="M50 22
           C40 22, 32 30, 32 40
           C32 48, 30 56, 28 62
           L72 62
           C70 56, 68 48, 68 40
           C68 30, 60 22, 50 22Z"
        fill="white"
      />

      {/* Bell base */}
      <rect x="26" y="62" width="48" height="5" rx="2" fill="white" />

      {/* Clapper */}
      <ellipse cx="50" cy="72" rx="7" ry="5" fill="white" />

      {/* Left motion line */}
      <path
        d="M28 28 C22 34, 20 42, 22 50"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Right motion line */}
      <path
        d="M72 28 C78 34, 80 42, 78 50"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
