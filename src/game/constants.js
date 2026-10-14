// ---------- Canvas / world (SVG units) ----------
export const W = 1000
export const H = 560
export const GROUND_Y = 440
export const TARGET = { x: 800, y: 260 } // centre of the board
export const PIVOT = { x: 185, y: 285 } // where the bow is held

// ---------- Physics (screen coordinates: +Y points DOWN, gravity is positive) ----------
export const G = 800 // gravity
export const WIND_ACC = 25 // extra up/down acceleration per wind step (hard mode)
export const MIN_SPEED = 350 // launch speed at the smallest pull
export const MAX_SPEED = 1150 // launch speed at full pull
export const MAX_PULL = 140 // drag distance (px) that gives 100% power
export const MIN_PULL = 14 // shorter drags are ignored (no accidental shots)
export const MAX_ANGLE = (70 * Math.PI) / 180 // steepest allowed shot
export const PULL_VIS = 46 // how far the string / arrow is drawn pulled back
export const DT = 1 / 60 // time step for the dotted preview
export const MAX_T = 4 // longest flight we simulate (seconds)

// the area where hovering / pressing "grabs" the bow
export const PLAYER_BOX = { x: 55, y: 195, w: 185, h: 255 }

// inner ring first (used for scoring), drawn in reverse order
export const RINGS = [
  { score: 10, rx: 20, ry: 30, fill: '#e9b949' },
  { score: 9, rx: 45, ry: 68, fill: '#c4593b' },
  { score: 8, rx: 80, ry: 120, fill: '#4f9a8a' },
  { score: 7, rx: 115, ry: 170, fill: '#f3e3c3' },
]

// previewFrac  = how much of the way to the board the dotted guide is shown (0.5 = half way)
// catchChance  = chance that the squirrel / coffin hand tries to steal an arrow that flies past
export const MODES = {
  easy: {
    label: 'Easy',
    arrows: 12,
    goal: 50,
    angleJit: 0, // degrees of flicker
    speedJit: 0, // fraction of flicker in power
    wind: false,
    previewFrac: 0.6,
    catchChance: 0.12,
    icon: 'leaf',
    desc: 'Longer guide, steady aim, plenty of arrows.',
  },
  intermediate: {
    label: 'Intermediate',
    arrows: 8,
    goal: 50,
    angleJit: 1.5,
    speedJit: 0.03,
    wind: false,
    previewFrac: 0.5,
    catchChance: 0.2,
    icon: 'wave',
    desc: 'Guide stops half way and flickers a little.',
  },
  hard: {
    label: 'Hard',
    arrows: 6,
    goal: 50,
    angleJit: 2,
    speedJit: 0.04,
    wind: true,
    previewFrac: 0.4,
    catchChance: 0.28,
    icon: 'wind',
    desc: 'Short flickering guide, wind and more thieves.',
  },
}

export const clamp = (v, a, b) => Math.min(Math.max(v, a), b)

export function getScore(x, y) {
  for (const r of RINGS) {
    const nx = (x - TARGET.x) / r.rx
    const ny = (y - TARGET.y) / r.ry
    if (nx * nx + ny * ny <= 1) return r.score
  }
  return 0 // missed the board
}

export function randomWind() {
  let w = 0
  while (w === 0) w = Math.floor(Math.random() * 9) - 4 // -4..4 (not 0)
  return w
}