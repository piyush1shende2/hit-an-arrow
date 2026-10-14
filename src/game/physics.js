import { G, W, GROUND_Y, TARGET, PIVOT, MIN_SPEED, MAX_SPEED, MAX_PULL, MIN_PULL, MAX_ANGLE, DT, MAX_T, clamp, getScore } from './constants.js'
import { critterState } from './critters.js'

// Turn the mouse drag into power + direction.
// drag = { sx, sy (mouse-down point), cx, cy (current point) } in SVG units
export function computeAim(drag, jit) {
  const dragX = drag.sx - drag.cx
  const dragY = drag.sy - drag.cy
  const pullDistance = Math.hypot(dragX, dragY)
  const pullRatio = clamp(pullDistance / MAX_PULL, 0, 1)
  // must be pulled far enough, and BACKWARDS (towards the archer)
  const valid = pullDistance >= MIN_PULL && dragX > 0
  // the arrow flies opposite to the drag
  const baseAngle = valid ? clamp(Math.atan2(dragY, dragX), -MAX_ANGLE, MAX_ANGLE) : 0
  const angle = valid ? clamp(baseAngle + jit.da, -MAX_ANGLE, MAX_ANGLE) : 0
  const baseSpeed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * pullRatio
  const speed = valid ? baseSpeed * jit.dv : baseSpeed
  return { valid, pullRatio, angle, speed }
}

// Projectile motion. The SAME function builds the dotted preview and the real flight.
//   x(t) = x0 + vx*t          y(t) = y0 + vy*t + 0.5*ay*t^2
export function simulate(angle, speed, windAy = 0) {
  const S = { x: PIVOT.x + 50 * Math.cos(angle), y: PIVOT.y + 50 * Math.sin(angle) } // arrow tip
  const vx = speed * Math.cos(angle)
  const vy = speed * Math.sin(angle)
  const ay = G + windAy
  const at = (t) => ({ x: S.x + vx * t, y: S.y + vy * t + 0.5 * ay * t * t })

  // when does the arrow reach the ground / leave the screen?
  const tGround = (-vy + Math.sqrt(vy * vy - 2 * ay * (S.y - GROUND_Y))) / ay
  const tOut = (W + 60 - S.x) / vx
  let tEnd = tGround
  let type = 'ground'
  if (tOut < tEnd) {
    tEnd = tOut
    type = 'out'
  }
  if (MAX_T < tEnd) {
    tEnd = MAX_T
    type = 'out'
  }

  // does it cross the board plane (x = TARGET.x) on the board?
  const tPlane = (TARGET.x - S.x) / vx
  if (tPlane > 0 && tPlane < tEnd && getScore(TARGET.x, at(tPlane).y) > 0) {
    tEnd = tPlane
    type = 'target'
  }

  const points = []
  for (let t = 0; t < tEnd; t += DT) points.push(at(t))
  const e = at(tEnd)
  points.push(e)
  return { S, vx, vy, ay, points, end: { x: e.x, y: e.y, t: tEnd, type } }
}

// Decide what REALLY happens to a shot: a creature may get hit, or the
// squirrel / coffin hand may grab the arrow. None of this is shown in the preview.
export function resolveFlight(sim, { scene, hits, startTime, catchChance }) {
  const { S, vx, vy, ay } = sim
  const at = (t) => ({ x: S.x + vx * t, y: S.y + vy * t + 0.5 * ay * t * t })
  let end = sim.end

  // 1) does the arrow hit a flying / walking creature?
  let hit = null
  for (let t = 0.02; t < end.t && !hit; t += 1 / 120) {
    const p = at(t)
    for (const c of scene.critters) {
      const st = critterState(c, startTime + t, hits[c.id])
      if (!st.solid) continue
      if (Math.abs(p.x - st.x) <= c.w / 2 + 4 && Math.abs(p.y - st.y) <= c.h / 2 + 4) {
        hit = { c, t, p }
        break
      }
    }
  }
  if (hit) end = { x: hit.p.x, y: hit.p.y, t: hit.t, type: 'critter', critterId: hit.c.id }

  // 2) only SOME arrows are grabbed in mid-air
  let grab = null
  const g = scene.grabber
  if (g && Math.random() < catchChance) {
    const tc = (g.catchX - S.x) / vx
    if (tc > 0 && tc < end.t) {
      const yc = at(tc).y
      if (yc >= g.minY && yc <= g.maxY) {
        end = { x: g.catchX, y: yc, t: tc, type: 'caught' }
        grab = { tc, yc }
      }
    }
  }
  return { end, grab }
}