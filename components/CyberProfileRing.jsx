export function CyberProfileRing() {
  return (
    <svg className="cyber-profile-ring" viewBox="0 0 500 500" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="profile-ring-gradient" x1="70" y1="80" x2="430" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d34cff" />
          <stop offset=".46" stopColor="#7d5dff" />
          <stop offset="1" stopColor="#38d9ff" />
        </linearGradient>

        <radialGradient id="profile-ring-halo">
          <stop offset=".62" stopColor="#000" stopOpacity="0" />
          <stop offset=".78" stopColor="#7d5dff" stopOpacity=".08" />
          <stop offset="1" stopColor="#38d9ff" stopOpacity=".18" />
        </radialGradient>

        <filter id="profile-ring-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="250" cy="250" r="225" fill="url(#profile-ring-halo)" opacity=".75" />

      <g className="profile-ring-spin-slow" opacity=".52">
        <circle
          cx="250"
          cy="250"
          r="214"
          fill="none"
          stroke="url(#profile-ring-gradient)"
          strokeWidth="2.4"
          strokeDasharray="2 15"
          strokeLinecap="round"
        />
      </g>

      <g className="profile-ring-spin-cw" filter="url(#profile-ring-glow)">
        <circle
          cx="250"
          cy="250"
          r="197"
          fill="none"
          stroke="url(#profile-ring-gradient)"
          strokeWidth="5"
          strokeDasharray="112 55 20 34 71 44 14 62"
          strokeLinecap="round"
        />
      </g>

      <g className="profile-ring-spin-ccw" opacity=".8">
        <circle
          cx="250"
          cy="250"
          r="180"
          fill="none"
          stroke="url(#profile-ring-gradient)"
          strokeWidth="2.2"
          strokeDasharray="5 11 2 22"
          strokeLinecap="round"
        />
      </g>

      <g className="profile-ring-spin-fast" opacity=".62">
        <circle
          cx="250"
          cy="250"
          r="162"
          fill="none"
          stroke="url(#profile-ring-gradient)"
          strokeWidth="3"
          strokeDasharray="26 62 9 43 52 27"
          strokeLinecap="round"
        />
      </g>

      <g className="profile-ring-spin-ccw profile-ring-flicker" opacity=".72">
        <path
          d="M109 188 A154 154 0 0 1 172 113"
          fill="none"
          stroke="#d34cff"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M389 318 A154 154 0 0 1 330 389"
          fill="none"
          stroke="#38d9ff"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      <g className="profile-ring-spin-cw" opacity=".45">
        <circle
          cx="250"
          cy="250"
          r="145"
          fill="none"
          stroke="url(#profile-ring-gradient)"
          strokeWidth="1.5"
          strokeDasharray="1 9"
        />
      </g>

      <g className="profile-ring-pulse">
        <circle
          cx="250"
          cy="250"
          r="132"
          fill="none"
          stroke="url(#profile-ring-gradient)"
          strokeWidth="2.2"
          opacity=".75"
        />
      </g>

      <g className="profile-ring-orbit-dot">
        <circle cx="250" cy="53" r="4.5" fill="#d34cff" filter="url(#profile-ring-glow)" />
        <rect x="244" y="45" width="12" height="3" rx="1.5" fill="#d34cff" opacity=".55" />
      </g>

      <g className="profile-ring-orbit-dot profile-ring-orbit-reverse">
        <circle cx="250" cy="88" r="3.8" fill="#38d9ff" filter="url(#profile-ring-glow)" />
      </g>

      <g className="profile-ring-pulse-delayed" opacity=".7">
        <circle
          cx="250"
          cy="250"
          r="118"
          fill="none"
          stroke="#6b85ff"
          strokeWidth="1.3"
          strokeDasharray="3 7"
        />
      </g>
    </svg>
  );
}
