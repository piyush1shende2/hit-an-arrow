import { useState } from 'react'
import './App.css'
import HomeScreen from './components/HomeScreen.jsx'
import Game from './components/Game.jsx'

export default function App() {
  const [modeKey, setModeKey] = useState(null)

  if (!modeKey) return <HomeScreen onStart={setModeKey} />
  return <Game key={modeKey} modeKey={modeKey} onChangeMode={() => setModeKey(null)} />
}

// import { useState, useEffect, useRef } from 'react'
// import './App.css'

// /* =====================================================================
//    GAME CONSTANTS  (all distances are SVG units, speeds are units/second)
//    ===================================================================== */
// const W = 1000
// const H = 560
// const GROUND_Y = 440
// const TARGET = { x: 800, y: 260 } // centre of the board
// const PIVOT = { x: 185, y: 285 } // where the bow is held

// // --- physics (screen coordinates: +Y points DOWN, so gravity is positive) ---
// const G = 800 // gravity
// const WIND_ACC = 25 // extra up/down acceleration per wind step (hard mode)
// const MIN_SPEED = 350 // launch speed at the smallest pull
// const MAX_SPEED = 1150 // launch speed at full pull
// const MAX_PULL = 140 // drag distance (px) that gives 100% power
// const MIN_PULL = 14 // drags shorter than this are ignored (no accidental shots)
// const MAX_ANGLE = (70 * Math.PI) / 180 // steepest allowed shot
// const PULL_VIS = 46 // how far the string/arrow is drawn pulled back
// const DT = 1 / 60 // time step used for the dotted preview
// const MAX_T = 4 // longest flight we simulate (seconds)

// // the area where hovering / pressing "grabs" the bow
// const PLAYER_BOX = { x: 55, y: 195, w: 185, h: 255 }

// // inner ring first (used for scoring), drawn in reverse order
// const RINGS = [
//   { score: 10, rx: 20, ry: 30, fill: '#e9b949' },
//   { score: 9, rx: 45, ry: 68, fill: '#c4593b' },
//   { score: 8, rx: 80, ry: 120, fill: '#4f9a8a' },
//   { score: 7, rx: 115, ry: 170, fill: '#f3e3c3' },
// ]

// const MODES = {
//   easy: {
//     label: 'Easy',
//     arrows: 12,
//     goal: 50,
//     angleJit: 0, // degrees of flicker
//     speedJit: 0, // fraction of flicker in power
//     wind: false,
//     icon: 'leaf',
//     desc: 'Steady aim. Plenty of arrows to reach the goal.',
//   },
//   intermediate: {
//     label: 'Intermediate',
//     arrows: 8,
//     goal: 50,
//     angleJit: 1.5,
//     speedJit: 0.03,
//     wind: false,
//     icon: 'wave',
//     desc: 'Fewer arrows and the trajectory flickers a little.',
//   },
//   hard: {
//     label: 'Hard',
//     arrows: 6,
//     goal: 50,
//     angleJit: 2,
//     speedJit: 0.04,
//     wind: true,
//     icon: 'wind',
//     desc: 'Flickering aim plus wind that pushes your arrow.',
//   },
// }

// const FEATURES = [
//   { icon: 'target', title: 'Aim', text: 'Hover over the archer to load an arrow, then hold the left mouse button on him.' },
//   { icon: 'curve', title: 'Pull & Release', text: 'Drag back to pull the bow. The dotted path shows the shot, release to fire.' },
//   { icon: 'wind', title: 'Wind', text: 'On hard mode the wind pushes the arrow while it flies.' },
//   { icon: 'trophy', title: 'Score 50', text: 'Hit 10, 9, 8 or 7 from the centre outward. Reach 50!' },
// ]

// /* =====================================================================
//    PHYSICS + AIM HELPERS  (no React, no rendering in here)
//    ===================================================================== */
// const clamp = (v, a, b) => Math.min(Math.max(v, a), b)

// function getScore(x, y) {
//   for (const r of RINGS) {
//     const nx = (x - TARGET.x) / r.rx
//     const ny = (y - TARGET.y) / r.ry
//     if (nx * nx + ny * ny <= 1) return r.score
//   }
//   return 0 // missed the board
// }

// function randomWind() {
//   let w = 0
//   while (w === 0) w = Math.floor(Math.random() * 9) - 4 // -4..4 (not 0)
//   return w
// }

// // Turn the mouse drag into power + direction.
// // drag = { sx, sy (mouse-down point), cx, cy (current point) } in SVG units
// function computeAim(drag, jit) {
//   const dragX = drag.sx - drag.cx
//   const dragY = drag.sy - drag.cy
//   const pullDistance = Math.hypot(dragX, dragY)
//   const pullRatio = clamp(pullDistance / MAX_PULL, 0, 1)
//   // must be pulled far enough, and BACKWARDS (towards the archer)
//   const valid = pullDistance >= MIN_PULL && dragX > 0
//   // the arrow flies opposite to the drag: from the pulled point towards the start point
//   const baseAngle = valid ? clamp(Math.atan2(dragY, dragX), -MAX_ANGLE, MAX_ANGLE) : 0
//   const angle = valid ? clamp(baseAngle + jit.da, -MAX_ANGLE, MAX_ANGLE) : 0
//   const baseSpeed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * pullRatio
//   const speed = valid ? baseSpeed * jit.dv : baseSpeed
//   return { valid, pullRatio, angle, speed }
// }

// // Projectile motion. The SAME function is used for the dotted preview and for
// // the real flight, so the arrow follows exactly the path that was shown.
// //   x(t) = x0 + vx*t          y(t) = y0 + vy*t + 0.5*ay*t^2
// function simulate(angle, speed, windAy = 0) {
//   const S = { x: PIVOT.x + 50 * Math.cos(angle), y: PIVOT.y + 50 * Math.sin(angle) } // arrow tip
//   const vx = speed * Math.cos(angle)
//   const vy = speed * Math.sin(angle)
//   const ay = G + windAy
//   const at = (t) => ({ x: S.x + vx * t, y: S.y + vy * t + 0.5 * ay * t * t })

//   // when does the arrow reach the ground / leave the screen?
//   const tGround = (-vy + Math.sqrt(vy * vy - 2 * ay * (S.y - GROUND_Y))) / ay
//   const tOut = (W + 60 - S.x) / vx
//   let tEnd = tGround
//   let type = 'ground'
//   if (tOut < tEnd) {
//     tEnd = tOut
//     type = 'out'
//   }
//   if (MAX_T < tEnd) {
//     tEnd = MAX_T
//     type = 'out'
//   }

//   // does it cross the board plane (x = TARGET.x) on the board?
//   const tPlane = (TARGET.x - S.x) / vx
//   if (tPlane > 0 && tPlane < tEnd && getScore(TARGET.x, at(tPlane).y) > 0) {
//     tEnd = tPlane
//     type = 'target'
//   }

//   const points = []
//   for (let t = 0; t < tEnd; t += DT) points.push(at(t))
//   const e = at(tEnd)
//   points.push(e)
//   return { S, vx, vy, ay, points, end: { x: e.x, y: e.y, t: tEnd, type } }
// }

// /* =====================================================================
//    DECORATION PIECES
//    ===================================================================== */
// function Leaf({ className = '', style, color = '#4f9a5b', vein = '#1f5a38' }) {
//   return (
//     <svg className={`leaf ${className}`} style={style} viewBox="0 0 100 160" aria-hidden="true">
//       <path d="M50 4 C95 45 92 115 50 156 C8 115 5 45 50 4 Z" fill={color} />
//       <path d="M50 10 L50 156" stroke={vein} strokeWidth="2" fill="none" opacity="0.7" />
//       <g stroke={vein} strokeWidth="1.5" fill="none" opacity="0.5">
//         <path d="M50 45 L76 28 M50 45 L24 28" />
//         <path d="M50 70 L82 48 M50 70 L18 48" />
//         <path d="M50 95 L82 74 M50 95 L18 74" />
//         <path d="M50 120 L74 102 M50 120 L26 102" />
//       </g>
//     </svg>
//   )
// }

// function Icon({ kind }) {
//   const common = {
//     viewBox: '0 0 48 48',
//     fill: 'none',
//     stroke: 'currentColor',
//     strokeWidth: 2.5,
//     strokeLinecap: 'round',
//     strokeLinejoin: 'round',
//     className: 'icon',
//   }
//   switch (kind) {
//     case 'target':
//       return (
//         <svg {...common}>
//           <circle cx="24" cy="24" r="18" />
//           <circle cx="24" cy="24" r="11" />
//           <circle cx="24" cy="24" r="4" />
//         </svg>
//       )
//     case 'curve':
//       return (
//         <svg {...common}>
//           <path d="M6 36 Q24 2 42 30" />
//           <path d="M42 30 L34 29 M42 30 L40 22" />
//         </svg>
//       )
//     case 'wind':
//       return (
//         <svg {...common}>
//           <path d="M6 18 H30 A5 5 0 1 0 25 13" />
//           <path d="M6 28 H38 A5 5 0 1 1 33 33" />
//           <path d="M6 38 H20" />
//         </svg>
//       )
//     case 'trophy':
//       return (
//         <svg {...common}>
//           <polygon points="24,6 29,18 42,19 32,28 35,41 24,34 13,41 16,28 6,19 19,18" />
//         </svg>
//       )
//     case 'leaf':
//       return (
//         <svg {...common}>
//           <path d="M10 38 C10 16 26 8 40 8 C40 26 32 40 10 38 Z" />
//           <path d="M10 38 L30 18" />
//         </svg>
//       )
//     case 'wave':
//       return (
//         <svg {...common}>
//           <path d="M4 24 Q11 10 18 24 T32 24 T46 24" />
//         </svg>
//       )
//     default:
//       return null
//   }
// }

// // Arrow drawn with its tip at (0,0), pointing right
// function ArrowShape() {
//   return (
//     <g>
//       <line x1="-72" y1="0" x2="-4" y2="0" stroke="#e2b57a" strokeWidth="3" strokeLinecap="round" />
//       <polygon points="0,0 -12,-5 -12,5" fill="#f3e3c3" />
//       <polygon points="-72,0 -88,-7 -80,0 -88,7" fill="#b7e07a" />
//     </g>
//   )
// }

// function PageLeaves() {
//   return (
//     <>
//       <Leaf className="deco" style={{ width: 110, top: -20, right: 40, transform: 'rotate(25deg)' }} color="#3f8a52" />
//       <Leaf className="deco" style={{ width: 150, top: -40, right: -30, transform: 'rotate(-20deg)' }} color="#2f7347" />
//       <Leaf className="deco" style={{ width: 90, bottom: 30, left: -20, transform: 'rotate(60deg)' }} color="#b98a5a" vein="#6b4430" />
//       <Leaf className="deco" style={{ width: 120, bottom: -30, right: 10, transform: 'rotate(-35deg)' }} color="#6f9a54" />
//     </>
//   )
// }

// /* =====================================================================
//    MAIN COMPONENT
//    ===================================================================== */
// export default function App() {
//   const [modeKey, setModeKey] = useState(null)
//   const [arrowsLeft, setArrowsLeft] = useState(0)
//   const [shots, setShots] = useState([]) // {score, x, y, angle}
//   const [hover, setHover] = useState(false) // cursor is over the archer
//   const [drag, setDrag] = useState(null) // active aiming drag
//   const [jit, setJit] = useState({ da: 0, dv: 1 }) // flicker (intermediate / hard)
//   const [wind, setWind] = useState(0)
//   const [flight, setFlight] = useState(null)
//   const [arrowPos, setArrowPos] = useState(null)
//   const [status, setStatus] = useState('idle') // idle | flying | won | lost
//   const [popup, setPopup] = useState(null)
//   const svgRef = useRef(null)

//   const mode = modeKey ? MODES[modeKey] : null
//   const total = shots.reduce((sum, s) => sum + s.score, 0)
//   const canAim = status === 'idle' && arrowsLeft > 0

//   // ----- start / restart -----
//   const startGame = (key) => {
//     setModeKey(key)
//     setArrowsLeft(MODES[key].arrows)
//     setShots([])
//     setHover(false)
//     setDrag(null)
//     setJit({ da: 0, dv: 1 })
//     setFlight(null)
//     setArrowPos(null)
//     setPopup(null)
//     setStatus('idle')
//     setWind(MODES[key].wind ? randomWind() : 0)
//   }

//   // ----- flicker while aiming (intermediate + hard) -----
//   const aiming = !!drag
//   useEffect(() => {
//     if (!mode || !aiming || (mode.angleJit === 0 && mode.speedJit === 0)) return
//     const id = setInterval(() => {
//       setJit({
//         da: ((Math.random() * 2 - 1) * mode.angleJit * Math.PI) / 180,
//         dv: 1 + (Math.random() * 2 - 1) * mode.speedJit,
//       })
//     }, 90)
//     return () => clearInterval(id)
//   }, [mode, aiming])

//   // ----- Esc cancels aiming -----
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === 'Escape') setDrag(null)
//     }
//     window.addEventListener('keydown', onKey)
//     return () => window.removeEventListener('keydown', onKey)
//   }, [])

//   // ----- real arrow flight (same formula as the preview) -----
//   useEffect(() => {
//     if (!flight) return
//     let raf
//     const step = (now) => {
//       const t = Math.min(Math.max((now - flight.start) / 1000, 0), flight.end.t)
//       const x = flight.S.x + flight.vx * t
//       const y = flight.S.y + flight.vy * t + 0.5 * flight.ay * t * t
//       const angle = (Math.atan2(flight.vy + flight.ay * t, flight.vx) * 180) / Math.PI
//       setArrowPos({ x, y, angle })

//       if (t < flight.end.t) {
//         raf = requestAnimationFrame(step)
//       } else {
//         // arrow has landed
//         const { x: ex, y: ey } = flight.end
//         setShots((s) => [...s, { score: flight.score, x: ex, y: ey, angle }])
//         setPopup({
//           x: ex,
//           y: ey - 20,
//           text: flight.score > 0 ? `+${flight.score}` : 'Miss',
//           key: Date.now(),
//         })
//         setFlight(null)
//         setArrowPos(null)
//         if (flight.newTotal >= mode.goal) {
//           setStatus('won')
//         } else if (flight.left === 0) {
//           setStatus('lost')
//         } else {
//           setStatus('idle')
//           if (mode.wind) setWind(randomWind())
//         }
//       }
//     }
//     raf = requestAnimationFrame(step)
//     return () => cancelAnimationFrame(raf)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [flight])

//   // ---------- pointer input ----------
//   // screen -> SVG (game) coordinates; works for any size, zoom and pixel ratio
//   const toSvg = (e) => {
//     const rect = svgRef.current.getBoundingClientRect()
//     return {
//       x: ((e.clientX - rect.left) * W) / rect.width,
//       y: ((e.clientY - rect.top) * H) / rect.height,
//     }
//   }
//   const inPlayer = (p) =>
//     p.x >= PLAYER_BOX.x &&
//     p.x <= PLAYER_BOX.x + PLAYER_BOX.w &&
//     p.y >= PLAYER_BOX.y &&
//     p.y <= PLAYER_BOX.y + PLAYER_BOX.h

//   const handleDown = (e) => {
//     if (e.pointerType === 'mouse' && e.button !== 0) return
//     if (!canAim || drag) return
//     const p = toSvg(e)
//     if (!inPlayer(p)) return
//     setDrag({ sx: p.x, sy: p.y, cx: p.x, cy: p.y })
//     setJit({ da: 0, dv: 1 })
//     setHover(true)
//     try {
//       svgRef.current.setPointerCapture(e.pointerId)
//     } catch {
//       /* not critical */
//     }
//   }

//   const handleMove = (e) => {
//     const p = toSvg(e)
//     if (drag) {
//       setDrag((d) => (d ? { ...d, cx: p.x, cy: p.y } : d))
//     } else {
//       setHover(canAim && inPlayer(p))
//     }
//   }

//   const handleUp = (e) => {
//     if (!drag) return
//     try {
//       svgRef.current.releasePointerCapture(e.pointerId)
//     } catch {
//       /* not critical */
//     }
//     const a = computeAim(drag, jit) // exactly what the preview is showing
//     setDrag(null)
//     if (!a.valid || !canAim) return // too short / wrong way: cancel, no arrow used
//     const windAy = mode.wind ? wind * WIND_ACC : 0 // hidden from the preview on purpose
//     const sim = simulate(a.angle, a.speed, windAy)
//     const score = sim.end.type === 'target' ? getScore(sim.end.x, sim.end.y) : 0
//     setArrowsLeft(arrowsLeft - 1)
//     setStatus('flying')
//     setFlight({
//       S: sim.S,
//       vx: sim.vx,
//       vy: sim.vy,
//       ay: sim.ay,
//       end: sim.end,
//       score,
//       left: arrowsLeft - 1,
//       newTotal: total + score,
//       start: performance.now(),
//     })
//   }

//   const cancelAim = () => setDrag(null)

//   // ---------- Home screen (hero + features + modes) ----------
//   if (!modeKey) {
//     return (
//       <div className="page">
//         <PageLeaves />
//         <div className="content">
//           <section className="hero">
//             <div className="hero-text">
//               <h1>
//                 Archery
//                 <br />
//                 Game
//               </h1>
//               <p>
//                 Hover over the archer, pull the bow back with your mouse and watch the curve of the shot.
//                 The closer to the middle of the board, the higher your score. Pick a mode and begin.
//               </p>
//               <button
//                 className="pill"
//                 onClick={() => document.getElementById('modes').scrollIntoView({ behavior: 'smooth' })}
//               >
//                 Choose mode
//               </button>
//             </div>
//             <div className="hero-art">
//               <Leaf style={{ width: 120, top: 0, left: 10, transform: 'rotate(-30deg)' }} color="#4a9a5a" />
//               <Leaf style={{ width: 150, top: 30, right: 0, transform: 'rotate(20deg)' }} color="#2f7347" />
//               <Leaf style={{ width: 130, bottom: 0, left: 60, transform: 'rotate(45deg)' }} color="#c9a273" vein="#7a5236" />
//               <svg className="mini-target" viewBox="0 0 200 200" aria-hidden="true">
//                 <circle cx="100" cy="100" r="90" fill="#f3e3c3" stroke="#3b2418" strokeWidth="3" />
//                 <circle cx="100" cy="100" r="62" fill="#4f9a8a" stroke="#3b2418" strokeWidth="3" />
//                 <circle cx="100" cy="100" r="36" fill="#c4593b" stroke="#3b2418" strokeWidth="3" />
//                 <circle cx="100" cy="100" r="14" fill="#e9b949" stroke="#3b2418" strokeWidth="3" />
//                 <g transform="translate(112 96) rotate(-12)">
//                   <line x1="0" y1="0" x2="80" y2="-6" stroke="#e2b57a" strokeWidth="4" strokeLinecap="round" />
//                   <polygon points="80,-6 98,-14 92,-2 98,8" fill="#b7e07a" />
//                 </g>
//               </svg>
//             </div>
//           </section>

//           <section className="feature-panel">
//             {FEATURES.map((f) => (
//               <div key={f.title} className="feature">
//                 <Icon kind={f.icon} />
//                 <h3>{f.title}</h3>
//                 <p>{f.text}</p>
//               </div>
//             ))}
//           </section>

//           <section id="modes" className="mode-grid">
//             {Object.entries(MODES).map(([key, m]) => (
//               <button key={key} className={`mode-card ${key}`} onClick={() => startGame(key)}>
//                 <span className="badge">
//                   <Icon kind={m.icon} />
//                 </span>
//                 <h2>{m.label}</h2>
//                 <strong>
//                   {m.arrows} arrows · score {m.goal}
//                 </strong>
//                 <small>{m.desc}</small>
//               </button>
//             ))}
//           </section>
//         </div>
//       </div>
//     )
//   }

//   // ---------- Game screen ----------
//   const nocked = canAim && (hover || aiming) // bow only holds an arrow while hovered / aimed
//   const aim = drag ? computeAim(drag, jit) : null
//   const preview = aim && aim.valid ? simulate(aim.angle, aim.speed, 0) : null
//   const bowDeg = aim ? (aim.angle * 180) / Math.PI : 0
//   const pullPx = aim ? aim.pullRatio * PULL_VIS : 0
//   const atMax = aim && aim.pullRatio >= 0.999
//   const willHit = preview && preview.end.type === 'target'
//   const lineColor = willHit ? '#b7e07a' : '#f6d9a0'
//   const stringX = PIVOT.x - 22 - pullPx
//   const stringPath = nocked
//     ? `M185 225 L${stringX} ${PIVOT.y} L185 345`
//     : 'M185 225 L185 345'
//   const cursor = aiming ? 'grabbing' : nocked ? 'grab' : 'default'

//   return (
//     <div className="page">
//       <PageLeaves />
//       <div className="content">
//         <h1 className="game-title">Archery Game</h1>

//         <div className="hud">
//           <div className="stat">
//             <span>Mode</span>
//             <b>{mode.label}</b>
//           </div>
//           <div className="stat">
//             <span>Arrows left</span>
//             <b>{arrowsLeft}</b>
//           </div>
//           <div className="stat">
//             <span>Target</span>
//             <b>{mode.goal}</b>
//           </div>
//           {mode.wind && (
//             <div className="stat">
//               <span>Wind</span>
//               <b>
//                 <span className="wind-arrow" style={{ transform: `rotate(${wind < 0 ? 0 : 180}deg)` }}>↑</span>{' '}
//                 {Math.abs(wind)}
//               </b>
//             </div>
//           )}
//           <div className="score-box">Your score - {total}</div>
//         </div>

//         <div className="stage">
//           <div className="field-card">
//             <svg
//               ref={svgRef}
//               viewBox={`0 0 ${W} ${H}`}
//               className="field"
//               style={{ cursor }}
//               onPointerDown={handleDown}
//               onPointerMove={handleMove}
//               onPointerUp={handleUp}
//               onPointerCancel={cancelAim}
//               onPointerLeave={() => {
//                 if (!drag) setHover(false)
//               }}
//             >
//               <defs>
//                 <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
//                   <stop offset="0" stopColor="#2f7a5f" />
//                   <stop offset="1" stopColor="#154a3a" />
//                 </linearGradient>
//                 <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0" stopColor="#8a5a42" />
//                   <stop offset="1" stopColor="#5a3526" />
//                 </linearGradient>
//               </defs>
//               <rect x="0" y="0" width={W} height={H} fill="url(#bg)" />
//               <polygon points="0,330 0,0 260,0" fill="#7a4a35" opacity="0.35" />
//               <g fill="#b7e07a" opacity="0.18">
//                 <ellipse cx="420" cy="90" rx="12" ry="30" transform="rotate(30 420 90)" />
//                 <ellipse cx="560" cy="170" rx="10" ry="26" transform="rotate(-40 560 170)" />
//                 <ellipse cx="330" cy="400" rx="12" ry="28" transform="rotate(60 330 400)" />
//                 <ellipse cx="960" cy="60" rx="10" ry="24" transform="rotate(-20 960 60)" />
//               </g>
//               <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#soil)" />
//               <rect x="0" y={GROUND_Y} width={W} height="12" fill="#6f9a54" />

//               {/* target stand */}
//               <line x1="790" y1="300" x2="730" y2="455" stroke="#d9b48a" strokeWidth="8" strokeLinecap="round" />
//               <line x1="810" y1="300" x2="870" y2="455" stroke="#d9b48a" strokeWidth="8" strokeLinecap="round" />

//               {/* target board */}
//               {[...RINGS].reverse().map((r) => (
//                 <ellipse
//                   key={r.score}
//                   cx={TARGET.x}
//                   cy={TARGET.y}
//                   rx={r.rx}
//                   ry={r.ry}
//                   fill={r.fill}
//                   stroke="#3b2418"
//                   strokeWidth="3"
//                 />
//               ))}
//               {RINGS.map((r, i) => {
//                 const inner = RINGS[i - 1]
//                 const y = inner ? TARGET.y - (r.ry + inner.ry) / 2 + 5 : TARGET.y + 5
//                 return (
//                   <text key={r.score} x={TARGET.x} y={y} textAnchor="middle" className="ring-label">
//                     {r.score}
//                   </text>
//                 )
//               })}

//               {/* hover highlight around the archer */}
//               {nocked && (
//                 <rect
//                   x={PLAYER_BOX.x}
//                   y={PLAYER_BOX.y}
//                   width={PLAYER_BOX.w}
//                   height={PLAYER_BOX.h}
//                   rx="26"
//                   fill="rgba(246,217,160,0.06)"
//                   stroke="#f6d9a0"
//                   strokeWidth="2"
//                   strokeDasharray="6 8"
//                   opacity="0.6"
//                 />
//               )}

//               {/* archer */}
//               <g stroke="#f3e3c3" strokeWidth="6" strokeLinecap="round" fill="none">
//                 <circle cx="105" cy="230" r="20" fill="#f3e3c3" />
//                 <line x1="105" y1="250" x2="105" y2="350" />
//                 <line x1="105" y1="350" x2="80" y2="440" />
//                 <line x1="105" y1="350" x2="135" y2="440" />
//                 <line x1="105" y1="268" x2="180" y2="285" />
//               </g>

//               {/* bow, string and arrow (the arrow is only there while hovered / aiming) */}
//               <g transform={`rotate(${bowDeg} ${PIVOT.x} ${PIVOT.y})`}>
//                 <path d="M185 225 Q 235 285 185 345" stroke="#d9a574" strokeWidth="6" fill="none" strokeLinecap="round" />
//                 <path
//                   d={stringPath}
//                   stroke={atMax ? '#ffe08a' : '#f3e3c3'}
//                   strokeWidth={atMax ? 3 : 2}
//                   fill="none"
//                 />
//                 {nocked && (
//                   <g transform={`translate(${PIVOT.x + 50 - pullPx} ${PIVOT.y})`}>
//                     <ArrowShape />
//                   </g>
//                 )}
//               </g>

//               {/* power + angle read-out while aiming */}
//               {aim && (
//                 <g>
//                   <text x="30" y="472" className="power-text">
//                     Power {Math.round(aim.pullRatio * 100)}%{atMax ? ' MAX' : ''}
//                     {aim.valid ? ` · Angle ${Math.round((-aim.angle * 180) / Math.PI)}°` : ''}
//                   </text>
//                   <rect x="30" y="482" width="190" height="12" rx="6" fill="rgba(0,0,0,0.35)" />
//                   <rect
//                     x="30"
//                     y="482"
//                     width={190 * aim.pullRatio}
//                     height="12"
//                     rx="6"
//                     fill={atMax ? '#ffd36b' : '#b7e07a'}
//                   />
//                 </g>
//               )}

//               {/* trajectory preview: dots + landing marker */}
//               {preview && (
//                 <g>
//                   {preview.points.map((p, i) =>
//                     i % 2 === 0 && i < preview.points.length - 1 ? (
//                       <circle
//                         key={i}
//                         cx={p.x}
//                         cy={p.y}
//                         r="3.5"
//                         fill={lineColor}
//                         opacity={0.3 + 0.65 * aim.pullRatio}
//                       />
//                     ) : null
//                   )}
//                   <circle cx={preview.end.x} cy={preview.end.y} r="9" fill="none" stroke={lineColor} strokeWidth="2.5" />
//                   <line x1={preview.end.x - 15} y1={preview.end.y} x2={preview.end.x + 15} y2={preview.end.y} stroke={lineColor} strokeWidth="2" />
//                   <line x1={preview.end.x} y1={preview.end.y - 15} x2={preview.end.x} y2={preview.end.y + 15} stroke={lineColor} strokeWidth="2" />
//                 </g>
//               )}

//               {/* arrows already shot */}
//               {shots.map((s, i) => (
//                 <g
//                   key={i}
//                   className={s.score === 0 ? 'miss-arrow' : ''}
//                   transform={`translate(${s.x} ${s.y}) rotate(${s.angle})`}
//                 >
//                   <ArrowShape />
//                 </g>
//               ))}

//               {/* arrow in the air */}
//               {arrowPos && (
//                 <g transform={`translate(${arrowPos.x} ${arrowPos.y}) rotate(${arrowPos.angle})`}>
//                   <ArrowShape />
//                 </g>
//               )}

//               {/* +score popup */}
//               {popup && (
//                 <text key={popup.key} x={popup.x} y={popup.y} textAnchor="middle" className="popup">
//                   {popup.text}
//                 </text>
//               )}
//             </svg>
//           </div>

//           {(status === 'won' || status === 'lost') && (
//             <div className="overlay">
//               <div className="result">
//                 <h2>{status === 'won' ? 'You Win!' : 'Out of arrows'}</h2>
//                 <p className="final">Final score: {total}</p>
//                 <p className="sub">
//                   {status === 'won'
//                     ? `You reached ${mode.goal} points!`
//                     : `You needed ${mode.goal} points.`}
//                 </p>
//                 <div className="scores">
//                   {shots.map((s, i) => (
//                     <span key={i} className="score-chip done">
//                       Arrow {i + 1}: <b>{s.score}</b>
//                     </span>
//                   ))}
//                 </div>
//                 <div className="buttons">
//                   <button className="pill" onClick={() => startGame(modeKey)}>Play again</button>
//                   <button className="ghost" onClick={() => setModeKey(null)}>Change mode</button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="buttons">
//           <button className="ghost" onClick={() => startGame(modeKey)}>Restart</button>
//           <button className="ghost" onClick={() => setModeKey(null)}>Change mode</button>
//         </div>
//         <p className="hint">
//           Hover over the archer to load an arrow, then hold the left mouse button and drag back (down to lift the
//           arrow, up to lower it). The farther you pull, the more power. Release to shoot, Esc to cancel.
//           {mode.wind && ' The wind pushes the arrow up or down in flight, and the dotted path does not show it!'}
//         </p>

//         <div className="scores">
//           {Array.from({ length: mode.arrows }).map((_, i) => (
//             <span key={i} className={`score-chip ${shots[i] ? 'done' : ''}`}>
//               Arrow {i + 1}: <b>{shots[i] ? shots[i].score : '–'}</b>
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }



// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
