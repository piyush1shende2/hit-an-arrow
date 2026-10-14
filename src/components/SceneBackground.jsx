import { W, H, GROUND_Y } from '../game/constants.js'

/* ---------- small helpers ---------- */
const Cloud = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#ffffff" opacity="0.9">
    <ellipse cx="0" cy="0" rx="34" ry="16" />
    <ellipse cx="-22" cy="6" rx="22" ry="12" />
    <ellipse cx="24" cy="6" rx="24" ry="12" />
    <ellipse cx="6" cy="-10" rx="22" ry="14" />
  </g>
)

const Pine = ({ x, h = 120, w = 36, color, snow }) => (
  <g>
    <polygon points={`${x},${GROUND_Y - h} ${x - w},${GROUND_Y - h * 0.35} ${x + w},${GROUND_Y - h * 0.35}`} fill={color} />
    <polygon points={`${x},${GROUND_Y - h * 0.7} ${x - w * 1.3},${GROUND_Y} ${x + w * 1.3},${GROUND_Y}`} fill={color} />
    {snow && (
      <polygon
        points={`${x},${GROUND_Y - h} ${x - w * 0.45},${GROUND_Y - h * 0.72} ${x + w * 0.45},${GROUND_Y - h * 0.72}`}
        fill="#f4f9ff"
      />
    )}
  </g>
)

const Tombstone = ({ x }) => {
  const y = GROUND_Y + 4
  return (
    <path
      d={`M${x - 16} ${y} L${x - 16} ${y - 34} Q${x - 16} ${y - 54} ${x} ${y - 54} Q${x + 16} ${y - 54} ${x + 16} ${y - 34} L${x + 16} ${y} Z`}
      fill="#2a2236"
      stroke="#463a5c"
      strokeWidth="2"
    />
  )
}

// wave line; the pattern repeats every 80 units so it loops seamlessly
const wavePath = (y, off) => {
  let d = `M ${-80 + off} ${y} q 20 -9 40 0`
  for (let i = 0; i < 30; i++) d += ' t 40 0'
  return d
}

/* ---------- one background per scene ---------- */
function Back({ scene, clock }) {
  switch (scene.id) {
    case 'meadow':
      return (
        <g>
          <circle cx="140" cy="85" r="64" fill="#fff3b0" opacity="0.35" />
          <circle cx="140" cy="85" r="40" fill="#ffe27a" />
          {[0, 1, 2].map((i) => (
            <Cloud key={i} x={((clock * (6 + i * 3) + i * 380) % (W + 300)) - 150} y={70 + i * 55} s={0.9 + i * 0.2} />
          ))}
          <path d="M0 440 L0 380 Q150 320 320 380 T640 372 T1000 392 L1000 440 Z" fill="#78bb5a" opacity="0.8" />
        </g>
      )
    case 'night':
      return (
        <g>
          {Array.from({ length: 28 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 97 + 31) % W}
              cy={((i * 53) % 250) + 14}
              r={i % 3 === 0 ? 2 : 1.3}
              fill="#fff"
              opacity={0.5 + 0.5 * Math.sin(clock * 2 + i)}
            />
          ))}
          <circle cx="150" cy="90" r="34" fill="#f8f4d8" />
          <circle cx="164" cy="82" r="30" fill="#14234d" />
          {[40, 130, 240, 330, 430, 640, 730, 850, 950].map((x, i) => (
            <Pine key={x} x={x} h={110 + (i % 3) * 30} w={32} color="#0b2a28" />
          ))}
        </g>
      )
    case 'graveyard':
      return (
        <g>
          <circle cx="130" cy="95" r="58" fill="#e9e2f5" opacity="0.18" />
          <circle cx="130" cy="95" r="44" fill="#e9e2f5" />
          <g stroke="#150d1c" strokeLinecap="round" fill="none">
            <path d="M420 440 L420 300" strokeWidth="12" />
            <path d="M420 300 L380 250 L358 232" strokeWidth="7" />
            <path d="M420 315 L466 262 L492 252" strokeWidth="7" />
            <path d="M420 280 L432 225" strokeWidth="6" />
          </g>
          {[310, 380, 480, 640, 700, 940].map((x) => (
            <Tombstone key={x} x={x} />
          ))}
        </g>
      )
    case 'shore':
      return (
        <g>
          <circle cx="520" cy="322" r="60" fill="#fff0b8" opacity="0.4" />
          <circle cx="520" cy="322" r="38" fill="#ffcf70" />
          <rect x="0" y="322" width={W} height={GROUND_Y - 322} fill="#2f9bc2" />
          <rect x="0" y="322" width={W} height="30" fill="#6fcbe2" opacity="0.5" />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={wavePath(345 + i * 38, -((clock * (14 + i * 8)) % 80))}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              opacity="0.55"
            />
          ))}
          <g transform="translate(300 324)">
            <polygon points="-20,0 20,0 14,10 -14,10" fill="#7a4a35" />
            <line x1="0" y1="-34" x2="0" y2="0" stroke="#5a3526" strokeWidth="2" />
            <polygon points="2,-32 2,-4 20,-4" fill="#ffffff" />
          </g>
        </g>
      )
    case 'snow':
      return (
        <g>
          <polygon
            points="0,440 90,270 170,340 270,200 380,340 470,260 580,360 690,230 800,350 900,280 1000,350 1000,440"
            fill="#c3d5e8"
          />
          <polygon points="270,200 238,250 262,244 270,262 286,242 304,252" fill="#ffffff" />
          <polygon points="690,230 662,272 684,266 692,282 708,264 724,274" fill="#ffffff" />
          {[60, 150, 340, 440, 650, 760, 900].map((x, i) => (
            <Pine key={x} x={x} h={110 + (i % 3) * 25} w={30} color="#3b6b66" snow />
          ))}
        </g>
      )
    default:
      return null
  }
}

function Front({ scene, clock }) {
  switch (scene.id) {
    case 'meadow':
      return (
        <g>
          {Array.from({ length: 14 }).map((_, i) => (
            <circle
              key={i}
              cx={40 + i * 68}
              cy={GROUND_Y + 30 + ((i * 37) % 80)}
              r="4"
              fill={['#ffffff', '#ffd1e8', '#ffe27a'][i % 3]}
            />
          ))}
        </g>
      )
    case 'graveyard':
      return (
        <g pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={250 + i * 300 + Math.sin(clock * 0.3 + i) * 50}
              cy={GROUND_Y - 6 + i * 4}
              rx="190"
              ry="22"
              fill="#cfc6e6"
              opacity="0.12"
            />
          ))}
        </g>
      )
    case 'snow':
      return (
        <g pointerEvents="none" fill="#ffffff">
          {Array.from({ length: 34 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 83 + Math.sin(clock * 0.8 + i) * 22 + W) % W}
              cy={((clock * (28 + (i % 5) * 9) + i * 47) % (H + 20)) - 10}
              r={1.5 + (i % 3) * 0.7}
              opacity="0.85"
            />
          ))}
        </g>
      )
    default:
      return null
  }
}

export default function SceneBackground({ scene, clock }) {
  const id = scene.id
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={scene.sky[0]} />
          <stop offset="1" stopColor={scene.sky[1]} />
        </linearGradient>
        <linearGradient id={`ground-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={scene.ground[0]} />
          <stop offset="1" stopColor={scene.ground[1]} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill={`url(#sky-${id})`} />
      <Back scene={scene} clock={clock} />
      <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill={`url(#ground-${id})`} />
      <rect x="0" y={GROUND_Y} width={W} height="12" fill={scene.strip} />
      <Front scene={scene} clock={clock} />
    </g>
  )
}