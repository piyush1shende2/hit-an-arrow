import { MODES } from '../game/constants.js'
import { SCENES } from '../game/scenes.js'
import { Leaf, Icon, PageLeaves } from './Decor.jsx'

const FEATURES = [
  { icon: 'target', title: 'Aim', text: 'Hover over the archer to load an arrow, then hold the left mouse button on him.' },
  { icon: 'curve', title: 'Pull & Release', text: 'Drag back to pull the bow. The dotted guide only shows the first part of the shot.' },
  { icon: 'wind', title: 'Beware', text: 'Birds, wind and a thieving squirrel (or a coffin hand) can ruin the shot.' },
  { icon: 'trophy', title: 'Score 50', text: 'Hit 10, 9, 8 or 7 from the centre outward. Reach 50!' },
]

export default function HomeScreen({ onStart }) {
  return (
    <div className="page">
      <PageLeaves />
      <div className="content">
        <section className="hero">
          <div className="hero-text">
            <h1>
              Archery
              <br />
              Game
            </h1>
            <p>
              Hover over the archer, pull the bow back with your mouse and predict where the arrow will land.
              Play in {SCENES.length} different scenes. Pick a mode and begin.
            </p>
            <button
              className="pill"
              onClick={() => document.getElementById('modes').scrollIntoView({ behavior: 'smooth' })}
            >
              Choose mode
            </button>
          </div>
          <div className="hero-art">
            <Leaf style={{ width: 120, top: 0, left: 10, transform: 'rotate(-30deg)' }} color="#4a9a5a" />
            <Leaf style={{ width: 150, top: 30, right: 0, transform: 'rotate(20deg)' }} color="#2f7347" />
            <Leaf style={{ width: 130, bottom: 0, left: 60, transform: 'rotate(45deg)' }} color="#c9a273" vein="#7a5236" />
            <svg className="mini-target" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="90" fill="#f3e3c3" stroke="#3b2418" strokeWidth="3" />
              <circle cx="100" cy="100" r="62" fill="#4f9a8a" stroke="#3b2418" strokeWidth="3" />
              <circle cx="100" cy="100" r="36" fill="#c4593b" stroke="#3b2418" strokeWidth="3" />
              <circle cx="100" cy="100" r="14" fill="#e9b949" stroke="#3b2418" strokeWidth="3" />
              <g transform="translate(112 96) rotate(-12)">
                <line x1="0" y1="0" x2="80" y2="-6" stroke="#e2b57a" strokeWidth="4" strokeLinecap="round" />
                <polygon points="80,-6 98,-14 92,-2 98,8" fill="#b7e07a" />
              </g>
            </svg>
          </div>
        </section>

        <section className="feature-panel">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <Icon kind={f.icon} />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </section>

        <section id="modes" className="mode-grid">
          {Object.entries(MODES).map(([key, m]) => (
            <button key={key} className={`mode-card ${key}`} onClick={() => onStart(key)}>
              <span className="badge">
                <Icon kind={m.icon} />
              </span>
              <h2>{m.label}</h2>
              <strong>
                {m.arrows} arrows · score {m.goal}
              </strong>
              <small>{m.desc}</small>
            </button>
          ))}
        </section>
      </div>
    </div>
  )
}