import { GROUND_Y } from './constants.js'

// helpers to build critters
// flier  = flies across the screen (pigeon, crow, bat, owl)
// walker = waddles on the ground (penguin)
const flier = (id, kind, y, amp, speed, dir, phase, extra = {}) => ({
  id,
  kind,
  type: 'fly',
  y,
  amp,
  freq: 1.2,
  speed,
  dir,
  phase,
  w: 40,
  h: 24,
  yell: 'Squawk!',
  ...extra,
})

const walker = (id, x, range, speed, phase) => ({
  id,
  kind: 'penguin',
  type: 'walk',
  x,
  range,
  speed,
  phase,
  y: GROUND_Y - 10,
  w: 32,
  h: 46,
  yell: 'HONK!',
})

// grabber = the thing that sometimes steals an arrow in mid-air
//   x / catchX = where it lives / where it grabs, minY..maxY = the heights it can reach
export const SCENES = [
  {
    id: 'meadow',
    name: 'Sunny Meadow',
    icon: '☀️',
    dark: false,
    sky: ['#5db6ea', '#d6f0ff'],
    ground: ['#6fae4f', '#3f7a3a'],
    strip: '#8fd06a',
    critters: [
      flier('p1', 'pigeon', 120, 18, 55, 1, 0.1, { yell: 'Coo-OO!' }),
      flier('p2', 'pigeon', 205, 22, 70, -1, 0.55, { yell: 'Coo-OO!' }),
      flier('p3', 'pigeon', 315, 20, 48, 1, 0.8, { yell: 'Coo-OO!' }),
    ],
    grabber: { type: 'squirrel', x: 585, catchX: 560, minY: 120, maxY: 385 },
  },
  {
    id: 'night',
    name: 'Moonlit Forest',
    icon: '🌙',
    dark: true,
    sky: ['#0b1535', '#26427a'],
    ground: ['#1f4d38', '#0f2a20'],
    strip: '#2f6d4c',
    critters: [
      flier('c1', 'crow', 115, 20, 65, -1, 0.2, { yell: 'CAW!' }),
      flier('c2', 'crow', 210, 25, 80, 1, 0.6, { yell: 'CAW!' }),
      flier('c3', 'crow', 320, 18, 58, -1, 0.9, { yell: 'CAW!' }),
    ],
    grabber: { type: 'squirrel', x: 585, catchX: 560, minY: 120, maxY: 385 },
  },
  {
    id: 'graveyard',
    name: 'Haunted Graveyard',
    icon: '🪦',
    dark: true,
    sky: ['#1a1030', '#4a3566'],
    ground: ['#3b3347', '#1e1828'],
    strip: '#51456b',
    critters: [
      flier('b1', 'bat', 130, 40, 95, 1, 0.1, { freq: 3, w: 36, h: 24, yell: 'SCREE!' }),
      flier('b2', 'bat', 215, 45, 115, -1, 0.4, { freq: 3.4, w: 36, h: 24, yell: 'SCREE!' }),
      flier('b3', 'bat', 290, 40, 100, 1, 0.7, { freq: 2.8, w: 36, h: 24, yell: 'SCREE!' }),
      flier('b4', 'bat', 355, 30, 125, -1, 0.95, { freq: 3.2, w: 36, h: 24, yell: 'SCREE!' }),
    ],
    grabber: { type: 'hand', x: 585, catchX: 585, minY: 120, maxY: 330 },
  },
  {
    id: 'shore',
    name: 'Sea Shore',
    icon: '🏖️',
    dark: false,
    sky: ['#ffb36b', '#ffe7b0'],
    ground: ['#e8cf9b', '#bf9d62'],
    strip: '#f3dfae',
    critters: [
      walker('g1', 330, 55, 0.8, 0.0),
      walker('g2', 450, 50, 0.6, 0.35),
      walker('g3', 690, 45, 0.9, 0.7),
    ],
    grabber: { type: 'squirrel', x: 585, catchX: 560, minY: 120, maxY: 385 },
  },
  {
    id: 'snow',
    name: 'Snowy Peaks',
    icon: '❄️',
    dark: false,
    sky: ['#9bbbd8', '#e8f2fb'],
    ground: ['#f4f8fc', '#c9d9e8'],
    strip: '#ffffff',
    critters: [
      flier('o1', 'owl', 125, 20, 50, 1, 0.15, { w: 42, h: 26, yell: 'HOOT!' }),
      flier('o2', 'owl', 215, 24, 62, -1, 0.5, { w: 42, h: 26, yell: 'HOOT!' }),
      flier('o3', 'owl', 320, 20, 45, 1, 0.85, { w: 42, h: 26, yell: 'HOOT!' }),
    ],
    grabber: { type: 'squirrel', x: 585, catchX: 560, minY: 120, maxY: 385 },
  },
]