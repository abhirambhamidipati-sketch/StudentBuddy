/**
 * StudentBuddy SVG Logo — Minimal SaaS style.
 * Renders at whatever size you specify via `size` (default 32).
 * No external file needed — pure JSX.
 */
export default function Logo({ size = 32, className = "" }) {
  const id = "sb-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="48" height="48" rx="12" fill={`url(#${id})`} />

      {/* Stylised "S" + layered book pages */}
      {/* Bottom page */}
      <rect x="10" y="28" width="28" height="4" rx="2" fill="white" opacity="0.35" />
      {/* Middle page */}
      <rect x="10" y="22" width="28" height="4" rx="2" fill="white" opacity="0.55" />
      {/* Top page / open book spine */}
      <rect x="10" y="16" width="28" height="4" rx="2" fill="white" opacity="0.9" />

      {/* Bold "B" lettermark on the right half */}
      <text
        x="26"
        y="35"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="18"
        fill="white"
        opacity="0.95"
      >
        B
      </text>
    </svg>
  );
}
