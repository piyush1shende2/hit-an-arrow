import { W, GROUND_Y } from './constants.js'

const lerp = (a, b, u) => a + (b - a) * u
const ease = (u) => u * u * (3 - 2 * u)

// Position / look of a critter at a given time. Pure function of time, so the
// flight planner and the renderer always agree about where everybody is.
// hit = { time } when an arrow hit this critter (then it panics for a while).
export function critterState(c, time, hit) {
  let x, y, flip
  if (c.type === 'fly') {
    const span = W + 160
    const travel = (((time * c.speed + c.phase * span) % span) + span) % span
    x = c.dir > 0 ? travel - 80 : W + 80 - travel
    y = c.y + c.amp * Math.sin(time * c.freq + c.phase * 6.283)
    flip = c.dir
  } else {
    const a = time * c.speed + c.phase * 6.283
    x = c.x + c.range * Math.sin(a)
    y = c.y
    flip = Math.cos(a) >= 0 ? 1 : -1
  }

  let opacity = 1
  let solid = true
  let scared = false
  if (hit && time >= hit.time) {
    const d = time - hit.time
    if (c.type === 'fly') {
      if (d < 1.6) {
        // panics and flies away
        scared = true
        solid = false
        x += c.dir * d * 140
        y -= d * d * 50 + d * 30
        opacity = 1 - d / 1.6
      } else if (d < 3.2) {
        opacity = 0
        solid = false
      } else if (d < 3.8) {
        opacity = (d - 3.2) / 0.6 // comes back
        solid = false
      }
    } else if (d < 1.6) {
      // ground critter jumps up and down
      scared = true
      solid = false
      y -= Math.abs(Math.sin(d * 9)) * 26 * (1 - d / 1.6)
    }
  }
  return { x, y, flip, opacity, solid, scared }
}

// ---------- squirrel: leaps from its stump, grabs the arrow, carries it home ----------
const LEAP = 0.45
const HOLD = 0.15
const BACK = 0.6

export function squirrelPose(g, ev, time) {
  const home = { x: g.x, y: GROUND_Y - 36 }
  if (!ev) return { ...home, holding: false }
  const t = time - ev.start
  const tl = Math.max(0, ev.tc - LEAP)
  const target = { x: g.catchX, y: ev.yc }
  if (t < tl) return { ...home, holding: false }
  if (t < ev.tc) {
    const u = (t - tl) / Math.max(ev.tc - tl, 0.001)
    return {
      x: lerp(home.x, target.x, u),
      y: lerp(home.y, target.y, u) - 30 * Math.sin(Math.PI * u),
      holding: false,
    }
  }
  if (t < ev.tc + HOLD) return { ...target, holding: true }
  if (t < ev.tc + HOLD + BACK) {
    const u = ease((t - ev.tc - HOLD) / BACK)
    return { x: lerp(target.x, home.x, u), y: lerp(target.y, home.y, u * u), holding: true }
  }
  return { ...home, holding: false }
}

// ---------- coffin hand: rises out of the coffin, grabs the arrow, pulls it back ----------
const RISE = 0.5
const H_HOLD = 0.15
const H_BACK = 0.7

export function handPose(ev, time) {
  if (!ev) return { ext: 0, lid: 0, grabbed: false }
  const t = time - ev.start
  const ts = Math.max(0, ev.tc - RISE)
  let ext = 0
  let grabbed = false
  if (t >= ts && t < ev.tc) ext = ease((t - ts) / Math.max(ev.tc - ts, 0.001))
  else if (t >= ev.tc && t < ev.tc + H_HOLD) {
    ext = 1
    grabbed = true
  } else if (t >= ev.tc + H_HOLD && t < ev.tc + H_HOLD + H_BACK) {
    ext = 1 - ease((t - ev.tc - H_HOLD) / H_BACK)
    grabbed = true
  }
  return { ext, lid: Math.min(1, ext * 4), grabbed }
}