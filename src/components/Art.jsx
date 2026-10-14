import { GROUND_Y } from '../game/constants.js'

// Arrow drawn with its tip at (0,0), pointing right
export function ArrowShape() {
  return (
    <g>
      <line x1="-72" y1="0" x2="-4" y2="0" stroke="#e2b57a" strokeWidth="3" strokeLinecap="round" />
      <polygon points="0,0 -12,-5 -12,5" fill="#f3e3c3" />
      <polygon points="-72,0 -88,-7 -80,0 -88,7" fill="#b7e07a" />
    </g>
  )
}

/* ---------------- creatures (all drawn facing right, centred on 0,0) ---------------- */

const BIRD = {
  pigeon: { body: '#9aa6b8', wing: '#7d8aa0', head: '#6c7a92', beak: '#e8a86a', eye: '#222' },
  crow: { body: '#22232b', wing: '#15161c', head: '#22232b', beak: '#666', eye: '#e5e5e5' },
  owl: { body: '#f2f4f8', wing: '#d3dae6', head: '#f2f4f8', beak: '#e0a43a', eye: '#d89a10' },
}

function Bird({ kind, clock, phase }) {
  const p = BIRD[kind]
  const flap = Math.sin(clock * 14 + phase * 10)
  return (
    <g>
      <path d="M-14 0 L-25 -4 L-25 4 Z" fill={p.wing} />
      <ellipse cx="0" cy="0" rx="15" ry="8" fill={p.body} />
      <circle cx="13" cy="-5" r="6" fill={p.head} />
      <polygon points="18,-6 25,-4 18,-2" fill={p.beak} />
      <circle cx="14.5" cy="-6.5" r="1.5" fill={p.eye} />
      <g transform={`rotate(${flap * 35} -2 -3)`}>
        <path d="M-2 -3 Q -6 -26 -18 -22 Q -10 -12 -8 -3 Z" fill={p.wing} />
      </g>
    </g>
  )
}

function Bat({ clock, phase }) {
  const f = Math.sin(clock * 18 + phase * 10)
  return (
    <g>
      <g transform={`scale(1 ${0.6 + 0.4 * Math.abs(f)})`}>
        <path
          d="M0 0 Q -10 -18 -30 -10 Q -24 -4 -20 0 Q -14 -4 -10 2 Q -4 -2 0 4 Q 4 -2 10 2 Q 14 -4 20 0 Q 24 -4 30 -10 Q 10 -18 0 0 Z"
          fill="#3b2a4f"
        />
      </g>
      <ellipse cx="0" cy="3" rx="6" ry="9" fill="#2a1d3a" />
      <polygon points="-5,-5 -4,-13 -1,-6" fill="#2a1d3a" />
      <polygon points="5,-5 4,-13 1,-6" fill="#2a1d3a" />
      <circle cx="-2.5" cy="0" r="1.4" fill="#ff5a5a" />
      <circle cx="2.5" cy="0" r="1.4" fill="#ff5a5a" />
    </g>
  )
}

function Penguin({ clock, speed }) {
  const tilt = Math.sin(clock * speed * 8) * 8
  return (
    <g transform={`rotate(${tilt} 0 22)`}>
      <ellipse cx="-14" cy="2" rx="4" ry="10" fill="#1d2330" transform="rotate(15 -14 2)" />
      <ellipse cx="0" cy="0" rx="15" ry="22" fill="#1d2330" />
      <ellipse cx="3" cy="4" rx="9" ry="16" fill="#f6f6f2" />
      <circle cx="7" cy="-12" r="2" fill="#fff" />
      <circle cx="7.6" cy="-12" r="1" fill="#111" />
      <polygon points="11,-9 21,-6 11,-4" fill="#f0a030" />
      <ellipse cx="-4" cy="22" rx="7" ry="3" fill="#f0a030" />
      <ellipse cx="8" cy="22" rx="7" ry="3" fill="#f0a030" />
    </g>
  )
}

// one creature at its current state (st comes from critterState)
export function CritterView({ c, st, clock }) {
  const shake = st.scared ? Math.sin(clock * 40) * 14 : 0
  return (
    <g transform={`translate(${st.x} ${st.y}) scale(${st.flip} 1) rotate(${shake})`} opacity={st.opacity}>
      {c.kind === 'bat' ? (
        <Bat clock={clock} phase={c.phase} />
      ) : c.kind === 'penguin' ? (
        <Penguin clock={clock} speed={c.speed} />
      ) : (
        <Bird kind={c.kind} clock={clock} phase={c.phase} />
      )}
    </g>
  )
}

export function SpeechBubble({ x, y, text }) {
  const w = text.length * 9 + 18
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect x={-w / 2} y="-24" width={w} height="24" rx="9" fill="#fffbe8" stroke="#3b2418" strokeWidth="2" />
      <polygon points="-5,-1 5,-1 0,8" fill="#fffbe8" stroke="#3b2418" strokeWidth="2" />
      <rect x="-6" y="-3" width="12" height="4" fill="#fffbe8" />
      <text x="0" y="-8" textAnchor="middle" fontSize="14" fontWeight="800" fill="#3b2418">
        {text}
      </text>
    </g>
  )
}

/* ---------------- squirrel + stump ---------------- */

export function Stump({ x }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y + 8})`}>
      <rect x="-24" y="-30" width="48" height="30" rx="6" fill="#7a4a35" />
      <ellipse cx="0" cy="-30" rx="24" ry="7" fill="#b07a52" />
      <ellipse cx="0" cy="-30" rx="14" ry="3.5" fill="none" stroke="#7a4a35" strokeWidth="1.5" />
    </g>
  )
}

export function Squirrel({ x, y, holding, clock }) {
  const wag = Math.sin(clock * 3) * 6
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${wag} 12 6)`}>
        <path d="M12 6 C42 8 44 -38 18 -44 C28 -28 20 -14 8 -6 Z" fill="#b8693d" />
      </g>
      <ellipse cx="0" cy="0" rx="16" ry="12" fill="#c97b4a" />
      <ellipse cx="-4" cy="3" rx="8" ry="6" fill="#f0d6b0" />
      <circle cx="-14" cy="-10" r="9" fill="#c97b4a" />
      <path d="M-19 -18 L-16 -28 L-11 -19 Z" fill="#a85f36" />
      <circle cx="-17" cy="-11" r="1.8" fill="#222" />
      <ellipse cx="-22" cy="-8" rx="2.2" ry="1.6" fill="#3b2418" />
      {holding && (
        <g transform="translate(-22 -3) rotate(-25) scale(0.55)">
          <ArrowShape />
        </g>
      )}
    </g>
  )
}

// arrows the squirrel / coffin has collected so far (stuck in the ground next to it)
export function StashArrows({ x, count }) {
  return (
    <g>
      {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
        <g key={i} transform={`translate(${x + 34 + i * 6} ${GROUND_Y + 8}) rotate(${-65 + i * 7})`}>
          <line x1="0" y1="0" x2="0" y2="-34" stroke="#e2b57a" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="0,-34 -3,-27 3,-27" fill="#b7e07a" />
        </g>
      ))}
    </g>
  )
}

/* ---------------- coffin + skeleton hand ---------------- */

export function Coffin({ x, lid }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y + 8})`}>
      <polygon points="-26,-92 26,-92 36,-52 22,0 -22,0 -36,-52" fill="#5a3a2a" stroke="#2b1a12" strokeWidth="3" />
      <line x1="0" y1="-78" x2="0" y2="-24" stroke="#c9a06a" strokeWidth="4" strokeLinecap="round" />
      <line x1="-12" y1="-62" x2="12" y2="-62" stroke="#c9a06a" strokeWidth="4" strokeLinecap="round" />
      {lid > 0.02 && <ellipse cx="0" cy="-92" rx="24" ry="5" fill="#120a08" />}
      <g transform={`rotate(${-lid * 55} -26 -92)`}>
        <rect x="-28" y="-100" width="56" height="8" rx="2" fill="#6b4630" stroke="#2b1a12" strokeWidth="2" />
      </g>
    </g>
  )
}

export function Hand({ base, tip, ext, grabbed }) {
  if (ext < 0.01) return null
  const x = base.x + (tip.x - base.x) * ext
  const y = base.y + (tip.y - base.y) * ext
  return (
    <g>
      <line x1={base.x} y1={base.y} x2={x} y2={y} stroke="#d8d2b6" strokeWidth="9" strokeLinecap="round" />
      <line x1={base.x} y1={base.y} x2={x} y2={y} stroke="#a9a283" strokeWidth="2" strokeDasharray="6 10" />
      <g transform={`translate(${x} ${y})`}>
        <circle r="9" fill="#d8d2b6" />
        {grabbed ? (
          <g>
            <g transform="scale(0.7)">
              <ArrowShape />
            </g>
            <circle cx="-2" cy="-1" r="8" fill="#d8d2b6" />
          </g>
        ) : (
          [-32, -11, 11, 32].map((a) => (
            <line key={a} x1="0" y1="-6" x2="0" y2="-22" stroke="#d8d2b6" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a})`} />
          ))
        )}
      </g>
    </g>
  )
}