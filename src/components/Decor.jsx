// Leaves, line icons and page decorations (the earthy theme pieces)

export function Leaf({ className = '', style, color = '#4f9a5b', vein = '#1f5a38' }) {
  return (
    <svg className={`leaf ${className}`} style={style} viewBox="0 0 100 160" aria-hidden="true">
      <path d="M50 4 C95 45 92 115 50 156 C8 115 5 45 50 4 Z" fill={color} />
      <path d="M50 10 L50 156" stroke={vein} strokeWidth="2" fill="none" opacity="0.7" />
      <g stroke={vein} strokeWidth="1.5" fill="none" opacity="0.5">
        <path d="M50 45 L76 28 M50 45 L24 28" />
        <path d="M50 70 L82 48 M50 70 L18 48" />
        <path d="M50 95 L82 74 M50 95 L18 74" />
        <path d="M50 120 L74 102 M50 120 L26 102" />
      </g>
    </svg>
  )
}

export function Icon({ kind }) {
  const common = {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'icon',
  }
  switch (kind) {
    case 'target':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="18" />
          <circle cx="24" cy="24" r="11" />
          <circle cx="24" cy="24" r="4" />
        </svg>
      )
    case 'curve':
      return (
        <svg {...common}>
          <path d="M6 36 Q24 2 42 30" />
          <path d="M42 30 L34 29 M42 30 L40 22" />
        </svg>
      )
    case 'wind':
      return (
        <svg {...common}>
          <path d="M6 18 H30 A5 5 0 1 0 25 13" />
          <path d="M6 28 H38 A5 5 0 1 1 33 33" />
          <path d="M6 38 H20" />
        </svg>
      )
    case 'trophy':
      return (
        <svg {...common}>
          <polygon points="24,6 29,18 42,19 32,28 35,41 24,34 13,41 16,28 6,19 19,18" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M10 38 C10 16 26 8 40 8 C40 26 32 40 10 38 Z" />
          <path d="M10 38 L30 18" />
        </svg>
      )
    case 'wave':
      return (
        <svg {...common}>
          <path d="M4 24 Q11 10 18 24 T32 24 T46 24" />
        </svg>
      )
    default:
      return null
  }
}

export function PageLeaves() {
  return (
    <>
      <Leaf className="deco" style={{ width: 110, top: -20, right: 40, transform: 'rotate(25deg)' }} color="#3f8a52" />
      <Leaf className="deco" style={{ width: 150, top: -40, right: -30, transform: 'rotate(-20deg)' }} color="#2f7347" />
      <Leaf className="deco" style={{ width: 90, bottom: 30, left: -20, transform: 'rotate(60deg)' }} color="#b98a5a" vein="#6b4430" />
      <Leaf className="deco" style={{ width: 120, bottom: -30, right: 10, transform: 'rotate(-35deg)' }} color="#6f9a54" />
    </>
  )
}