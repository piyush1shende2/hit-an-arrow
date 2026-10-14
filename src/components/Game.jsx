import { useState, useEffect, useRef } from 'react'
import {
  W,
  H,
  GROUND_Y,
  TARGET,
  PIVOT,
  WIND_ACC,
  PULL_VIS,
  PLAYER_BOX,
  RINGS,
  MODES,
  clamp,
  getScore,
  randomWind,
} from '../game/constants.js'
import { computeAim, simulate, resolveFlight } from '../game/physics.js'
import { critterState, squirrelPose, handPose } from '../game/critters.js'
import { SCENES } from '../game/scenes.js'
import { PageLeaves } from './Decor.jsx'
import SceneBackground from './SceneBackground.jsx'
import { ArrowShape, CritterView, SpeechBubble, Stump, Squirrel, Coffin, Hand, StashArrows } from './Art.jsx'

const TAG_TEXT = { caught: 'stolen', blocked: 'blocked', miss: 'miss' }

export default function Game({ modeKey, onChangeMode }) {
  const mode = MODES[modeKey]

  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const [arrowsLeft, setArrowsLeft] = useState(mode.arrows)
  const [shots, setShots] = useState([]) // {score, x, y, angle, kind, tag}
  const [hover, setHover] = useState(false) // cursor is over the archer
  const [drag, setDrag] = useState(null) // active aiming drag
  const [jit, setJit] = useState({ da: 0, dv: 1 }) // flicker (intermediate / hard)
  const [wind, setWind] = useState(() => (mode.wind ? randomWind() : 0))
  const [flight, setFlight] = useState(null)
  const [status, setStatus] = useState('idle') // idle | flying | won | lost
  const [popup, setPopup] = useState(null)
  const [hits, setHits] = useState({}) // creatures that were hit  { id: { time } }
  const [grab, setGrab] = useState(null) // squirrel / hand catch event
  const [stash, setStash] = useState(0) // arrows stolen so far
  const [clock, setClock] = useState(0) // seconds, ticks every frame

  const svgRef = useRef(null)
  const smooth = useRef({ nock: 0, pull: 0, angle: 0 }) // smoothed visuals
  const targets = useRef({ nock: 0, pull: 0, angle: 0 }) // what they move towards

  const scene = SCENES.find((s) => s.id === sceneId)
  const total = shots.reduce((sum, s) => sum + s.score, 0)
  const canAim = status === 'idle' && arrowsLeft > 0
  const aiming = !!drag

  // ----- restart / scene change -----
  const startGame = () => {
    setArrowsLeft(mode.arrows)
    setShots([])
    setHover(false)
    setDrag(null)
    setJit({ da: 0, dv: 1 })
    setFlight(null)
    setPopup(null)
    setStatus('idle')
    setHits({})
    setGrab(null)
    setStash(0)
    setWind(mode.wind ? randomWind() : 0)
  }

  const changeScene = (id) => {
    if (status === 'flying') return
    setSceneId(id)
    setHits({})
    setGrab(null)
    setStash(0)
  }

  // ----- one animation loop: clock + smooth hover / pull / bow angle -----
  useEffect(() => {
    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.05))
      last = now
      const s = smooth.current
      const t = targets.current
      const k = (rate) => 1 - Math.exp(-rate * dt)
      s.nock += (t.nock - s.nock) * k(8) // arrow appears / disappears softly
      s.pull += (t.pull - s.pull) * k(22)
      s.angle += (t.angle - s.angle) * k(22)
      setClock(now / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ----- flicker while aiming (intermediate + hard) -----
  useEffect(() => {
    if (!aiming || (mode.angleJit === 0 && mode.speedJit === 0)) return
    const id = setInterval(() => {
      setJit({
        da: ((Math.random() * 2 - 1) * mode.angleJit * Math.PI) / 180,
        dv: 1 + (Math.random() * 2 - 1) * mode.speedJit,
      })
    }, 90)
    return () => clearInterval(id)
  }, [mode, aiming])

  // ----- Esc cancels aiming -----
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setDrag(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ----- the arrow has finished its flight -----
  useEffect(() => {
    if (!flight || clock - flight.start < flight.end.t) return
    const { end, vx, vy, ay } = flight
    const angle = (Math.atan2(vy + ay * end.t, vx) * 180) / Math.PI
    const tag =
      end.type === 'caught' ? 'caught' : end.type === 'critter' ? 'blocked' : flight.score > 0 ? null : 'miss'

    let text = flight.score > 0 ? `+${flight.score}` : 'Miss'
    if (end.type === 'caught') text = scene.grabber.type === 'squirrel' ? 'Stolen!' : 'Grabbed!'
    if (end.type === 'critter') text = 'Blocked!'

    setShots((s) => [...s, { score: flight.score, x: end.x, y: end.y, angle, kind: end.type, tag }])
    setPopup({ x: end.x, y: end.y - 20, text, key: Date.now() })
    if (end.type === 'caught') setStash((n) => n + 1)
    setFlight(null)

    if (flight.newTotal >= mode.goal) setStatus('won')
    else if (flight.left === 0) setStatus('lost')
    else {
      setStatus('idle')
      if (mode.wind) setWind(randomWind())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock, flight])

  // ---------- pointer input ----------
  // screen -> SVG (game) coordinates; works for any size, zoom and pixel ratio
  const toSvg = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) * W) / rect.width,
      y: ((e.clientY - rect.top) * H) / rect.height,
    }
  }
  const inPlayer = (p) =>
    p.x >= PLAYER_BOX.x &&
    p.x <= PLAYER_BOX.x + PLAYER_BOX.w &&
    p.y >= PLAYER_BOX.y &&
    p.y <= PLAYER_BOX.y + PLAYER_BOX.h

  const handleDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!canAim || drag) return
    const p = toSvg(e)
    if (!inPlayer(p)) return
    setDrag({ sx: p.x, sy: p.y, cx: p.x, cy: p.y })
    setJit({ da: 0, dv: 1 })
    setHover(true)
    try {
      svgRef.current.setPointerCapture(e.pointerId)
    } catch {
      /* not critical */
    }
  }

  const handleMove = (e) => {
    const p = toSvg(e)
    if (drag) setDrag((d) => (d ? { ...d, cx: p.x, cy: p.y } : d))
    else setHover(canAim && inPlayer(p))
  }

  const handleUp = (e) => {
    if (!drag) return
    try {
      svgRef.current.releasePointerCapture(e.pointerId)
    } catch {
      /* not critical */
    }
    const a = computeAim(drag, jit) // exactly what the preview is showing
    setDrag(null)
    if (!a.valid || !canAim) return // too short / wrong way: cancel, no arrow used

    const windAy = mode.wind ? wind * WIND_ACC : 0 // hidden from the preview on purpose
    const sim = simulate(a.angle, a.speed, windAy)
    const start = performance.now() / 1000
    const { end, grab: g } = resolveFlight(sim, { scene, hits, startTime: start, catchChance: mode.catchChance })
    const score = end.type === 'target' ? getScore(end.x, end.y) : 0

    smooth.current.nock = 0 // the arrow leaves the bow
    setArrowsLeft(arrowsLeft - 1)
    setStatus('flying')
    if (end.type === 'critter') setHits((h) => ({ ...h, [end.critterId]: { time: start + end.t } }))
    if (g) setGrab({ start, tc: g.tc, yc: g.yc })
    setFlight({
      vx: sim.vx,
      vy: sim.vy,
      ay: sim.ay,
      S: sim.S,
      end,
      score,
      left: arrowsLeft - 1,
      newTotal: total + score,
      start,
    })
  }

  const cancelAim = () => setDrag(null)

  // ---------- what to draw ----------
  const nocked = canAim && (hover || aiming) // bow only holds an arrow while hovered / aimed
  const aim = drag ? computeAim(drag, jit) : null
  const preview = aim && aim.valid ? simulate(aim.angle, aim.speed, 0) : null
  const atMax = !!aim && aim.pullRatio >= 0.999

  targets.current = {
    nock: nocked ? 1 : 0,
    pull: aim ? aim.pullRatio * PULL_VIS : 0,
    angle: aim ? (aim.angle * 180) / Math.PI : 0,
  }
  const sm = smooth.current

  // dotted guide: only the first part of the shot is shown
  let shown = []
  let showMarker = false
  if (preview) {
    const xCut = preview.S.x + mode.previewFrac * (TARGET.x - preview.S.x)
    shown = preview.points.filter((p) => p.x <= xCut)
    showMarker = preview.end.x <= xCut // it lands before the cut (short shot)
  }
  const cutPoint = shown.length ? shown[shown.length - 1] : null

  // real arrow in the air
  let arrowPos = null
  if (flight) {
    const t = clamp(clock - flight.start, 0, flight.end.t)
    arrowPos = {
      x: flight.S.x + flight.vx * t,
      y: flight.S.y + flight.vy * t + 0.5 * flight.ay * t * t,
      angle: (Math.atan2(flight.vy + flight.ay * t, flight.vx) * 180) / Math.PI,
    }
  }

  const g = scene.grabber
  const sq = g.type === 'squirrel' ? squirrelPose(g, grab, clock) : null
  const hp = g.type === 'hand' ? handPose(grab, clock) : null

  // colours that stay readable on light and dark scenes
  const archerCol = scene.dark ? '#f3e3c3' : '#2d3b57'
  const bowCol = scene.dark ? '#d9a574' : '#7a4a22'
  const stringCol = atMax ? '#ffd36b' : scene.dark ? '#f3e3c3' : '#3a2a1a'
  const guideCol = scene.dark ? '#f6d9a0' : '#8a2f12'

  const stringX = 185 + (PIVOT.x - 22 - 185) * sm.nock - sm.pull
  const cursor = aiming ? 'grabbing' : nocked ? 'grab' : 'default'

  return (
    <div className="page">
      <PageLeaves />
      <div className="content">
        <h1 className="game-title">Archery Game</h1>

        <div className="hud">
          <div className="stat">
            <span>Mode</span>
            <b>{mode.label}</b>
          </div>
          <div className="stat">
            <span>Arrows left</span>
            <b>{arrowsLeft}</b>
          </div>
          <div className="stat">
            <span>Target</span>
            <b>{mode.goal}</b>
          </div>
          {mode.wind && (
            <div className="stat">
              <span>Wind</span>
              <b>
                <span className="wind-arrow" style={{ transform: `rotate(${wind < 0 ? 0 : 180}deg)` }}>↑</span>{' '}
                {Math.abs(wind)}
              </b>
            </div>
          )}
          <div className="score-box">Your score - {total}</div>
        </div>

        <div className="stage">
          <div className="field-card">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="field"
              style={{ cursor }}
              onPointerDown={handleDown}
              onPointerMove={handleMove}
              onPointerUp={handleUp}
              onPointerCancel={cancelAim}
              onPointerLeave={() => {
                if (!drag) setHover(false)
              }}
            >
              <SceneBackground scene={scene} clock={clock} />

              {/* squirrel stump / coffin and the arrows it has collected */}
              {g.type === 'squirrel' ? (
                <Stump x={g.x} />
              ) : (
                <Coffin x={g.x} lid={hp ? hp.lid : 0} />
              )}
              <StashArrows x={g.x} count={stash} />

              {/* target stand + board */}
              <line x1="790" y1="300" x2="730" y2="455" stroke="#d9b48a" strokeWidth="8" strokeLinecap="round" />
              <line x1="810" y1="300" x2="870" y2="455" stroke="#d9b48a" strokeWidth="8" strokeLinecap="round" />
              {[...RINGS].reverse().map((r) => (
                <ellipse
                  key={r.score}
                  cx={TARGET.x}
                  cy={TARGET.y}
                  rx={r.rx}
                  ry={r.ry}
                  fill={r.fill}
                  stroke="#3b2418"
                  strokeWidth="3"
                />
              ))}
              {RINGS.map((r, i) => {
                const inner = RINGS[i - 1]
                const y = inner ? TARGET.y - (r.ry + inner.ry) / 2 + 5 : TARGET.y + 5
                return (
                  <text key={r.score} x={TARGET.x} y={y} textAnchor="middle" className="ring-label">
                    {r.score}
                  </text>
                )
              })}

              {/* flying / walking creatures */}
              {scene.critters.map((c) => {
                const st = critterState(c, clock, hits[c.id])
                return st.opacity > 0.02 ? <CritterView key={c.id} c={c} st={st} clock={clock} /> : null
              })}

              {/* soft hover highlight around the archer */}
              {sm.nock > 0.02 && (
                <rect
                  x={PLAYER_BOX.x}
                  y={PLAYER_BOX.y}
                  width={PLAYER_BOX.w}
                  height={PLAYER_BOX.h}
                  rx="26"
                  fill={scene.dark ? 'rgba(246,217,160,0.06)' : 'rgba(255,255,255,0.18)'}
                  stroke={guideCol}
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeDashoffset={-clock * 20}
                  opacity={0.65 * sm.nock}
                />
              )}

              {/* archer */}
              <g stroke={archerCol} strokeWidth="6" strokeLinecap="round" fill="none">
                <circle cx="105" cy="230" r="20" fill={archerCol} />
                <line x1="105" y1="250" x2="105" y2="350" />
                <line x1="105" y1="350" x2="80" y2="440" />
                <line x1="105" y1="350" x2="135" y2="440" />
                <line x1="105" y1="268" x2="180" y2="285" />
              </g>

              {/* bow, string and (smoothly appearing) arrow */}
              <g transform={`rotate(${sm.angle} ${PIVOT.x} ${PIVOT.y})`}>
                <path d="M185 225 Q 235 285 185 345" stroke={bowCol} strokeWidth="6" fill="none" strokeLinecap="round" />
                <path
                  d={`M185 225 L${stringX} ${PIVOT.y} L185 345`}
                  stroke={stringCol}
                  strokeWidth={atMax ? 3 : 2}
                  fill="none"
                />
                {sm.nock > 0.02 && (
                  <g
                    transform={`translate(${PIVOT.x + 50 - sm.pull - (1 - sm.nock) * 24} ${PIVOT.y})`}
                    opacity={sm.nock}
                  >
                    <ArrowShape />
                  </g>
                )}
              </g>

              {/* power + angle read-out while aiming */}
              {aim && (
                <g>
                  <text x="30" y="472" className="power-text" style={{ fill: scene.dark ? '#f3e3c3' : '#2b1a12' }}>
                    Power {Math.round(aim.pullRatio * 100)}%{atMax ? ' MAX' : ''}
                    {aim.valid ? ` · Angle ${Math.round((-aim.angle * 180) / Math.PI)}°` : ''}
                  </text>
                  <rect x="30" y="482" width="190" height="12" rx="6" fill="rgba(0,0,0,0.35)" />
                  <rect
                    x="30"
                    y="482"
                    width={190 * aim.pullRatio}
                    height="12"
                    rx="6"
                    fill={atMax ? '#ffd36b' : '#b7e07a'}
                  />
                </g>
              )}

              {/* dotted guide: only the first part of the path */}
              {preview && (
                <g>
                  {shown.map((p, i) =>
                    i % 2 === 0 && i < shown.length - 1 ? (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill={guideCol}
                        opacity={(0.3 + 0.65 * aim.pullRatio) * (1 - 0.7 * (i / shown.length))}
                      />
                    ) : null
                  )}
                  {showMarker ? (
                    <g>
                      <circle cx={preview.end.x} cy={preview.end.y} r="9" fill="none" stroke={guideCol} strokeWidth="2.5" />
                      <line x1={preview.end.x - 15} y1={preview.end.y} x2={preview.end.x + 15} y2={preview.end.y} stroke={guideCol} strokeWidth="2" />
                      <line x1={preview.end.x} y1={preview.end.y - 15} x2={preview.end.x} y2={preview.end.y + 15} stroke={guideCol} strokeWidth="2" />
                    </g>
                  ) : (
                    cutPoint && (
                      <text
                        x={cutPoint.x + 8}
                        y={cutPoint.y - 8}
                        fontSize="26"
                        fontWeight="800"
                        fill={guideCol}
                        opacity="0.8"
                        pointerEvents="none"
                      >
                        ?
                      </text>
                    )
                  )}
                </g>
              )}

              {/* arrows already shot */}
              {shots.map((s, i) =>
                s.kind === 'caught' ? null : (
                  <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.angle})`}>
                    <g className={s.kind === 'critter' ? 'arrow-drop' : s.score === 0 ? 'arrow-fade' : ''}>
                      <ArrowShape />
                    </g>
                  </g>
                )
              )}

              {/* arrow in the air */}
              {arrowPos && (
                <g transform={`translate(${arrowPos.x} ${arrowPos.y}) rotate(${arrowPos.angle})`}>
                  <ArrowShape />
                </g>
              )}

              {/* squirrel / skeleton hand (drawn over the arrow so it can grab it) */}
              {sq && <Squirrel x={sq.x} y={sq.y} holding={sq.holding} clock={clock} />}
              {hp && (
                <Hand
                  base={{ x: g.x, y: GROUND_Y - 84 }}
                  tip={{ x: g.catchX, y: grab ? grab.yc : GROUND_Y - 84 }}
                  ext={hp.ext}
                  grabbed={hp.grabbed}
                />
              )}

              {/* creature yells */}
              {scene.critters.map((c) => {
                const h = hits[c.id]
                if (!h || clock < h.time || clock - h.time > 1.4) return null
                const st = critterState(c, clock, h)
                return <SpeechBubble key={c.id} x={st.x} y={st.y - c.h / 2 - 8} text={c.yell} />
              })}

              {/* +score popup */}
              {popup && (
                <text key={popup.key} x={popup.x} y={popup.y} textAnchor="middle" className="popup">
                  {popup.text}
                </text>
              )}
            </svg>
          </div>

          {(status === 'won' || status === 'lost') && (
            <div className="overlay">
              <div className="result">
                <h2>{status === 'won' ? 'You Win!' : 'Out of arrows'}</h2>
                <p className="final">Final score: {total}</p>
                <p className="sub">
                  {status === 'won' ? `You reached ${mode.goal} points!` : `You needed ${mode.goal} points.`}
                </p>
                <div className="scores">
                  {shots.map((s, i) => (
                    <span key={i} className="score-chip done">
                      Arrow {i + 1}: <b>{s.score}</b>
                      {s.tag && <i> {TAG_TEXT[s.tag]}</i>}
                    </span>
                  ))}
                </div>
                <div className="buttons">
                  <button className="pill" onClick={startGame}>Play again</button>
                  <button className="ghost" onClick={onChangeMode}>Change mode</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="scene-bar">
          {SCENES.map((s) => (
            <button
              key={s.id}
              className={`scene-chip ${s.id === sceneId ? 'active' : ''}`}
              onClick={() => changeScene(s.id)}
              disabled={status === 'flying'}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        <div className="buttons">
          <button className="ghost" onClick={startGame}>Restart</button>
          <button className="ghost" onClick={onChangeMode}>Change mode</button>
        </div>
        <p className="hint">
          Hover over the archer to load an arrow, then hold the left mouse button and drag back (down to lift the
          arrow, up to lower it). The dotted guide only shows the first part of the shot, so predict the rest!
          Release to shoot, Esc to cancel.
          {mode.wind && ' The wind pushes the arrow up or down in flight.'}
        </p>

        <div className="scores">
          {Array.from({ length: mode.arrows }).map((_, i) => (
            <span key={i} className={`score-chip ${shots[i] ? 'done' : ''}`}>
              Arrow {i + 1}: <b>{shots[i] ? shots[i].score : '–'}</b>
              {shots[i] && shots[i].tag && <i> {TAG_TEXT[shots[i].tag]}</i>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}