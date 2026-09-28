import { Application, Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import './style.css';

const introScreen = document.querySelector('#intro-screen');
const gameScreen = document.querySelector('#game-screen');
const gameViewport = document.querySelector('#game-viewport');
const gameMount = document.querySelector('#pixi-mount');
const playButton = document.querySelector('#play-button');
const playButtonLabel = document.querySelector('#play-button-label');
const controlNote = document.querySelector('.control-note');
const restartButton = document.querySelector('#restart-button');
const backButton = document.querySelector('#back-button');
const itemCount = document.querySelector('#item-count');
const gameStatus = document.querySelector('#game-status');
const dialoguePanel = document.querySelector('#dialogue-panel');
const dialogueKicker = document.querySelector('#dialogue-kicker');
const dialogueSpeaker = document.querySelector('#dialogue-speaker');
const dialogueText = document.querySelector('#dialogue-text');
const dialogueNext = document.querySelector('#dialogue-next');
const memoryMedia = document.querySelector('#memory-media');
const interactionHint = document.querySelector('#interaction-hint');
const interactButton = document.querySelector('#interact-button');
const musicToggle = document.querySelector('#music-toggle');
const gardenLockPanel = document.querySelector('#garden-lock-panel');
const gardenLockForm = document.querySelector('#garden-lock-form');
const gardenLockInputs = [...document.querySelectorAll('[data-date-part]')];
const gardenLockSubmit = document.querySelector('#garden-lock-submit');
const gardenEnterButton = document.querySelector('#garden-enter-button');
const gardenLockFeedback = document.querySelector('#garden-lock-feedback');
const touchButtons = [...document.querySelectorAll('[data-control]')];
const endingCard = document.querySelector('#ending-card');

const app = new Application();
const keysDown = new Set();
const worldWidth = 5060;
const worldHeight = 540;
const groundY = 426;
const playerSpeed = 178;
const itemCountTotal = 4;
const sharedMemoryX = 3660;
const meetingGateX = 4640;
const namrataX = 4830;
const meetingPointX = 4730;

const storyStops = [
  {
    id: 'coffee',
    x: 710,
    shopX: 600,
    shopName: "HALDIRAM'S",
    itemName: 'cold coffee',
    icon: '🥤',
    accent: '#b9434f',
    dialogues: [
      { speaker: 'Naman', text: 'I remember our first date…', kicker: 'A LITTLE CITY MEMORY' },
      {
        speaker: 'FLASHBACK',
        text: 'The bottle said “SHAKE WELL BEFORE USE.” She opened it first… and only then gave it a big shake.',
        kicker: 'FIRST DATE · THE COFFEE INCIDENT',
        art: 'coffee',
      },
      {
        speaker: 'Naman',
        text: 'A coffee shower later… My shona is such an innocent girl <3',
        kicker: 'BACK TO THE WALK',
      },
    ],
  },
  {
    id: 'flowers',
    x: 1510,
    shopX: 1400,
    shopName: 'BLOOM & CO.',
    itemName: 'bouquet',
    icon: '💐',
    accent: '#b85072',
    dialogues: [
      {
        speaker: 'Naman',
        text: 'I remember when Namrata first time gave me flowers.',
        kicker: 'THE FIRST FLOWERS',
        image: '/assets/firstflowers.jpg',
        imageAlt: 'The flowers Namrata gave Naman',
        caption: 'The first flowers she gave me',
      },
    ],
  },
  {
    id: 'chocolate',
    x: 2310,
    shopX: 2200,
    shopName: 'SWEET THINGS',
    itemName: 'KitKat',
    icon: '🍫',
    accent: '#8c4e4a',
    dialogues: [
      {
        speaker: 'Naman',
        text: 'My beba used to collect all chocolate wrappers in her hostel days, ab to poori ek almirah leni padti wrappers ke liye, agar abhi bhi hote sare.',
        kicker: 'A SWEET HOSTEL MEMORY',
      },
    ],
  },
  {
    id: 'card',
    x: 3110,
    shopX: 3000,
    shopName: 'LITTLE NOTES',
    itemName: 'greeting card',
    icon: '💌',
    accent: '#8b5b92',
    dialogues: [
      {
        speaker: 'Naman',
        text: 'Some little words stay with you forever.',
        kicker: 'A NOTE TO KEEP',
        image: '/assets/greetingcard.jpg',
        imageAlt: 'A greeting card from Namrata',
        caption: 'A little note, a lot of love',
      },
    ],
  },
];

const sharedMemoryDialogue = [
  {
    speaker: 'Naman',
    text: 'Every moment I spent with Namrata is the most fun part of my life..',
    kicker: 'ALL OUR LITTLE MOMENTS',
    image: '/assets/banner.JPG',
    imageAlt: 'A banner celebrating Naman and Namrata',
    caption: 'Our story, together',
  },
];

const endingDialogue = [
  { speaker: 'Naman', text: 'All these memories… and I’m still looking for you.', kicker: 'AT LAST, THE GARDEN' },
  { speaker: 'Naman', text: 'I missed you so much.' },
  { speaker: 'Naman', text: 'I still love you even more than I’ve ever loved you.' },
  { speaker: 'Naman', text: 'Never feel that you are alone. I am always with you in our life journey.' },
  { speaker: 'Naman', text: 'Happy Anniversary, my dear ❤️', kicker: 'FOR MY NAMRATA' },
];

let mainView;
let balconyScene;
let skyLayer;
let farLayer;
let world;
let gardenGate;
let player;
let namrata;
let playerScale = 1;
let playerYVelocity = 0;
let isJumping = false;
let cameraX = 0;
let visibleWorldWidth = 960;
let gameViewportObserver;
let gameIsActive = false;
let gameReady = false;
let startRequested = false;
let gameInitializationFailed = false;
let collectedCount = 0;
let sharedMemorySeen = false;
let endingStarted = false;
let gateReminderShown = false;
let gardenCodeAccepted = false;
let gardenUnlocked = false;
let dialogueState = null;
let coffeeMarker;
let memoryMarker;
let stopMarkers = new Map();
let lastStatus = '';
let audioContext = null;
let masterGain = null;
let musicBus = null;
let soundEnabled = true;
let musicMode = 'balcony';
let musicStep = 0;
let musicTimer = null;

const musicChords = {
  balcony: [
    [130.81, 164.81, 196.0],
    [110.0, 146.83, 174.61],
  ],
  city: [
    [146.83, 174.61, 220.0],
    [130.81, 164.81, 196.0],
    [110.0, 146.83, 174.61],
    [130.81, 164.81, 196.0],
  ],
  garden: [
    [174.61, 220.0, 261.63],
    [146.83, 196.0, 220.0],
    [130.81, 174.61, 220.0],
    [146.83, 196.0, 246.94],
  ],
};

function makeText(text, options = {}) {
  return new Text({
    text,
    style: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 16,
      fill: '#fff8ec',
      ...options,
    },
  });
}

function makeCharacter(texture, height, anchorX = 0.5) {
  const sprite = new Sprite(texture);
  sprite.anchor.set(anchorX, 1);
  sprite.scale.set(height / texture.height);
  return sprite;
}

function drawMainSky() {
  const sky = new Graphics();
  const bands = [
    [0, 0, 540, '#a9d0e3'],
    [0, 126, 414, '#c4e1e4'],
    [0, 250, 290, '#eed6c7'],
    [0, 365, 175, '#f2cfad'],
  ];
  for (const [x, y, width, color] of bands) sky.rect(x, y, worldWidth, width).fill(color);
  sky.circle(756, 112, 66).fill({ color: '#fff1ca', alpha: 0.25 });
  sky.circle(756, 112, 43).fill({ color: '#ffe7a9', alpha: 0.95 });
  sky.circle(756, 112, 33).fill('#fff0bd');
  for (let i = 0; i < 16; i += 1) {
    const x = 180 + i * 318;
    const y = 92 + ((i * 47) % 132);
    const scale = 0.68 + (i % 3) * 0.16;
    const cloudColor = { color: '#fffaf0', alpha: 0.48 };
    sky.circle(x, y, 17 * scale).fill(cloudColor);
    sky.circle(x + 21 * scale, y - 7 * scale, 23 * scale).fill(cloudColor);
    sky.circle(x + 47 * scale, y, 17 * scale).fill(cloudColor);
    sky.rect(x - 12 * scale, y - 1 * scale, 72 * scale, 18 * scale).fill(cloudColor);
  }
  return sky;
}

function drawFarCity() {
  const city = new Graphics();
  for (let i = 0; i < 42; i += 1) {
    const x = i * 128 - 16;
    const width = 72 + ((i * 41) % 54);
    const height = 108 + ((i * 53) % 112);
    const top = 396 - height;
    const shade = ['#a2b5b6', '#91aeb6', '#b5a0a3', '#8eabb5'][i % 4];
    city.rect(x, top, width, height).fill({ color: shade, alpha: 0.82 });
    if (i % 3 === 0) city.rect(x + width * 0.3, top - 18, width * 0.38, 18).fill({ color: shade, alpha: 0.82 });
    for (let row = top + 19; row < 381; row += 26) {
      for (let col = x + 12; col < x + width - 9; col += 24) {
        if (((Math.floor(row) + Math.floor(col)) % 4) !== 0) {
          city.rect(col, row, 7, 10).fill({ color: i % 2 ? '#f9e9c2' : '#d6e8dc', alpha: 0.74 });
        }
      }
    }
  }
  return city;
}

function drawGround() {
  const ground = new Graphics();
  ground.rect(0, groundY - 4, worldWidth, 36).fill('#f2d7bd');
  ground.rect(0, groundY + 31, worldWidth, worldHeight - groundY - 31).fill('#929e9e');
  ground.rect(0, groundY - 4, worldWidth, 5).fill('#fff2d9');
  for (let x = 12; x < worldWidth; x += 142) {
    ground.rect(x, groundY + 1, 2, 25).fill({ color: '#d7aeb0', alpha: 0.7 });
  }
  for (let x = 28; x < worldWidth; x += 185) {
    ground.roundRect(x, 493, 78, 4, 2).fill({ color: '#f5ead2', alpha: 0.74 });
  }
  return ground;
}

function drawShopfront(centerX, name, accent, type) {
  const shop = new Container();
  shop.x = centerX;
  shop.y = groundY - 3;

  const building = new Graphics();
  building.roundRect(-126, -183, 252, 181, 8).fill('#f7dfcf').stroke({ color: '#f9e9d8', width: 3 });
  building.rect(-132, -184, 264, 48).fill(accent);
  building.rect(-116, -127, 232, 8).fill({ color: '#f8eadc', alpha: 0.96 });
  building.roundRect(-99, -108, 80, 101, 5).fill({ color: '#dd9e9a', alpha: 0.7 }).stroke({ color: '#fff0dc', width: 3 });
  building.roundRect(19, -108, 80, 101, 5).fill({ color: '#dd9e9a', alpha: 0.65 }).stroke({ color: '#fff0dc', width: 3 });
  building.rect(-4, -104, 8, 101).fill('#fff0dc');
  for (const x of [-99, 19]) {
    building.rect(x, -65, 80, 5).fill({ color: '#fff0dc', alpha: 0.9 });
    building.rect(x + 38, -108, 4, 101).fill({ color: '#fff0dc', alpha: 0.9 });
  }
  building.rect(-26, -117, 52, 113).fill('#a06d70').stroke({ color: '#fff0dc', width: 3 });
  building.circle(14, -61, 3).fill('#fbe3a9');
  if (type === 'flower') {
    for (let x = -120; x <= 120; x += 24) {
      building.rect(x, -128, 24, 17).fill({ color: x % 48 === 0 ? '#ecb3bb' : '#faf0dc', alpha: 0.95 });
    }
  } else if (type === 'coffee') {
    for (let x = -120; x <= 120; x += 30) {
      building.rect(x, -128, 30, 17).fill({ color: x % 60 === 0 ? '#f4c5ad' : '#f8e8cf', alpha: 0.95 });
    }
  }
  shop.addChild(building);

  const label = makeText(name, {
    fontFamily: 'Trebuchet MS, sans-serif',
    fontSize: name.length > 10 ? 15 : 17,
    fontWeight: 'bold',
    letterSpacing: 1.3,
    fill: '#fff4e7',
  });
  label.anchor.set(0.5);
  label.position.set(0, -160);
  shop.addChild(label);

  const glow = new Graphics().circle(0, 0, 20).fill({ color: '#ffe5b4', alpha: 0.4 });
  glow.position.set(88, -71);
  shop.addChild(glow);
  world.addChild(shop);
}

function drawStreetDetails() {
  const details = new Graphics();
  for (let x = 180; x < worldWidth - 100; x += 560) {
    details.rect(x, 251, 7, groundY - 251).fill('#6d596b');
    details.rect(x - 8, 249, 50, 6).fill('#6d596b');
    details.circle(x + 36, 264, 15).fill({ color: '#fff0c8', alpha: 0.34 });
    details.circle(x + 36, 264, 8).fill('#fff2d1');
    details.circle(x + 36, 264, 34).fill({ color: '#fff0c8', alpha: 0.05 });
    details.circle(x + 38, groundY - 3, 3).fill({ color: '#fff0d9', alpha: 0.5 });
  }
  for (let x = 82; x < worldWidth; x += 280) {
    details.ellipse(x, groundY - 8, 24, 9).fill({ color: '#9f586f', alpha: 0.4 });
    details.circle(x, groundY - 14, 8).fill({ color: '#55795d', alpha: 0.78 });
    details.circle(x - 9, groundY - 9, 7).fill({ color: '#71906b', alpha: 0.76 });
  }
  world.addChild(details);
}

function drawGarden() {
  const garden = new Graphics();
  const startX = 3860;
  garden.rect(startX, 171, worldWidth - startX, groundY - 171).fill({ color: '#a2b98d', alpha: 0.96 });
  garden.rect(startX, groundY - 5, worldWidth - startX, worldHeight - groundY + 5).fill('#839b6b');
  garden.rect(startX, groundY + 1, worldWidth - startX, 24).fill('#d5b898');
  garden.rect(startX, groundY + 1, worldWidth - startX, 4).fill('#f0d7bc');

  for (let i = 0; i < 11; i += 1) {
    const x = startX + 44 + i * 111;
    const top = 202 + ((i * 31) % 46);
    const trunkHeight = groundY - top - 30;
    garden.rect(x - 7, top + 30, 14, trunkHeight).fill({ color: '#71604f', alpha: 0.9 });
    garden.circle(x, top, 48 + (i % 3) * 8).fill({ color: ['#607c68', '#6e896c', '#789172'][i % 3], alpha: 0.9 });
    garden.circle(x - 30, top + 12, 32).fill({ color: '#829976', alpha: 0.92 });
    garden.circle(x + 27, top + 19, 30).fill({ color: '#5f7a65', alpha: 0.9 });
    if (i % 2 === 0) {
      garden.circle(x + 23, top + 39, 5).fill('#f1c0c3');
      garden.circle(x - 24, top + 31, 4).fill('#ffe3bd');
    }
  }

  for (let x = startX + 36; x < worldWidth; x += 67) {
    const y = 405 + ((x / 67) % 3) * 7;
    garden.rect(x, y, 2, 21).fill('#557352');
    garden.circle(x - 4, y + 2, 4).fill('#edb6bf');
    garden.circle(x + 5, y + 1, 4).fill('#fff0c9');
    garden.circle(x, y - 4, 4).fill('#d87a91');
  }

  // A little flower arch frames the final meeting spot.
  garden.rect(4680, 196, 13, 228).fill({ color: '#765666', alpha: 0.85 });
  garden.rect(4680, 196, 195, 13).fill({ color: '#765666', alpha: 0.85 });
  garden.rect(4862, 196, 13, 228).fill({ color: '#765666', alpha: 0.85 });
  for (let x = 4688; x < 4870; x += 26) {
    garden.circle(x, 200 + (x % 3) * 2, 11).fill({ color: x % 2 ? '#d77c96' : '#f1b7c0', alpha: 0.95 });
    garden.circle(x + 6, 210, 5).fill('#ffe6bd');
  }
  world.addChild(garden);

  gardenGate = new Container();
  const gateArt = new Graphics();
  gateArt.rect(4693, 225, 156, 199).fill({ color: '#637a68', alpha: 0.25 }).stroke({ color: '#637a68', alpha: 0.75, width: 4 });
  for (let x = 4707; x <= 4835; x += 26) gateArt.rect(x, 230, 5, 190).fill({ color: '#637a68', alpha: 0.86 });
  gateArt.rect(4694, 274, 155, 6).fill({ color: '#637a68', alpha: 0.8 });
  gateArt.rect(4694, 366, 155, 6).fill({ color: '#637a68', alpha: 0.8 });
  gateArt.roundRect(4750, 321, 43, 40, 8).fill('#cb985a').stroke({ color: '#fff0cc', width: 2 });
  gateArt.roundRect(4759, 297, 25, 31, 12).stroke({ color: '#cb985a', width: 7 });
  gateArt.circle(4771, 338, 4).fill('#674a51');
  gateArt.rect(4769, 338, 4, 10).fill('#674a51');
  gardenGate.addChild(gateArt);
  world.addChild(gardenGate);
}

function makeMarker(stop) {
  const marker = new Container();
  marker.x = stop.x;
  marker.y = groundY - 58;

  const halo = new Graphics().circle(0, 0, 34).fill({ color: '#ffe9c1', alpha: 0.3 });
  const bubble = new Graphics().circle(0, 0, 26).fill('#fff5e7').stroke({ color: stop.accent, width: 2 });
  const icon = makeText(stop.icon, { fontFamily: 'Segoe UI Emoji, sans-serif', fontSize: 25, fill: stop.accent });
  icon.anchor.set(0.5);
  const label = makeText(stop.itemName, {
    fontFamily: 'Trebuchet MS, sans-serif',
    fontSize: 12,
    fontWeight: 'bold',
    fill: '#fff8ed',
    stroke: { color: '#704e68', width: 3 },
  });
  label.anchor.set(0.5, 0);
  label.position.set(0, 34);
  marker.addChild(halo, bubble, icon, label);
  marker.baseY = marker.y;
  marker.phase = stop.x / 180;
  marker.icon = icon;
  marker.halo = halo;
  world.addChild(marker);
  return marker;
}

function drawBalcony(texture) {
  const view = new Container();
  const sky = new Graphics();
  sky.rect(0, 0, 960, 540).fill('#302d4a');
  sky.rect(0, 210, 960, 200).fill('#57405f');
  sky.rect(0, 327, 960, 114).fill('#78516c');
  sky.circle(730, 108, 42).fill({ color: '#fff0cb', alpha: 0.9 });
  sky.circle(714, 96, 43).fill('#302d4a');
  for (let i = 0; i < 44; i += 1) {
    const x = (i * 149 + 38) % 960;
    const y = 25 + ((i * 61) % 210);
    sky.circle(x, y, i % 6 === 0 ? 2 : 1).fill({ color: '#fff0d4', alpha: 0.58 });
  }
  for (let i = 0; i < 16; i += 1) {
    const x = i * 64 - 7;
    const height = 70 + ((i * 43) % 138);
    sky.rect(x, 405 - height, 58, height).fill({ color: i % 2 ? '#473d59' : '#51415d', alpha: 0.95 });
    for (let row = 405 - height + 19; row < 397; row += 28) {
      if ((i + Math.round(row)) % 3 !== 0) sky.rect(x + 13, row, 6, 9).fill({ color: '#f4c783', alpha: 0.6 });
      if ((i + Math.round(row)) % 4 !== 0) sky.rect(x + 36, row + 2, 6, 9).fill({ color: '#f4c783', alpha: 0.54 });
    }
  }
  sky.rect(0, 425, 960, 115).fill('#685267');
  sky.rect(56, 172, 145, 253).fill('#483c57');
  sky.rect(83, 204, 93, 220).fill('#5b465e');
  sky.roundRect(101, 254, 55, 171, 27).fill('#302d49');
  sky.circle(146, 343, 3).fill('#ffe3ae');
  sky.rect(0, 430, 960, 110).fill('#675164');
  sky.rect(0, 431, 960, 10).fill('#bc91a0');
  sky.rect(0, 450, 960, 7).fill('#d5a6a9');
  for (let x = 25; x < 960; x += 76) sky.rect(x, 432, 6, 24).fill('#b58897');
  sky.rect(0, 456, 960, 5).fill('#e2b8b0');
  sky.roundRect(812, 396, 77, 29, 7).fill('#5f4b62');
  sky.rect(826, 415, 5, 22).fill('#4b4157');
  sky.rect(871, 415, 5, 22).fill('#4b4157');
  sky.roundRect(250, 402, 58, 28, 8).fill('#ad7380');
  sky.rect(257, 394, 44, 13).fill('#71906c');
  sky.circle(266, 393, 9).fill('#819b74');
  sky.circle(282, 389, 12).fill('#698963');
  view.addChild(sky);

  const naman = makeCharacter(texture, 178);
  naman.position.set(638, 430);
  view.addChild(naman);
  return view;
}

function setStatus(message) {
  if (lastStatus !== message) {
    gameStatus.textContent = message;
    lastStatus = message;
  }
}

function updateCount() {
  itemCount.textContent = String(collectedCount);
}

function scheduleSoftChord() {
  if (!soundEnabled || !audioContext || audioContext.state !== 'running' || !musicBus) return;
  const sequence = musicChords[musicMode];
  const chord = sequence[musicStep % sequence.length];
  musicStep += 1;
  const now = audioContext.currentTime;

  chord.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.linearRampToValueAtTime(index === 0 ? 0.031 : 0.021, now + 0.8);
    envelope.gain.setTargetAtTime(0.0001, now + 3.4, 0.72);
    oscillator.connect(envelope);
    envelope.connect(musicBus);
    oscillator.start(now);
    oscillator.stop(now + 5.4);
  });
}

function startSoundtrack() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    musicToggle.hidden = true;
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    musicBus = audioContext.createGain();
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 850;
    musicBus.gain.value = 0.45;
    musicBus.connect(lowpass);
    lowpass.connect(masterGain);
    masterGain.gain.value = 0.0001;
    masterGain.connect(audioContext.destination);
  }

  audioContext.resume().then(() => {
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(soundEnabled ? 0.58 : 0.0001, now, 0.22);
    if (!musicTimer) {
      scheduleSoftChord();
      musicTimer = window.setInterval(scheduleSoftChord, 4800);
    } else if (soundEnabled) {
      scheduleSoftChord();
    }
  }).catch(() => {
    musicToggle.hidden = true;
  });
}

function setMusicMode(mode) {
  musicMode = mode;
  musicStep = 0;
  if (audioContext?.state === 'running' && soundEnabled) scheduleSoftChord();
}

function playMemoryChime() {
  if (!soundEnabled || !audioContext || audioContext.state !== 'running') return;
  const now = audioContext.currentTime;
  [587.33, 783.99].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.12);
    envelope.gain.setValueAtTime(0.0001, now + index * 0.12);
    envelope.gain.linearRampToValueAtTime(0.075, now + index * 0.12 + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.42);
    oscillator.connect(envelope);
    envelope.connect(masterGain);
    oscillator.start(now + index * 0.12);
    oscillator.stop(now + index * 0.12 + 0.44);
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  musicToggle.textContent = soundEnabled ? '♫ Sound on' : '♪ Sound off';
  musicToggle.setAttribute('aria-pressed', String(soundEnabled));
  musicToggle.setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on');
  if (audioContext && masterGain) {
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(soundEnabled ? 0.58 : 0.0001, now, 0.16);
  }
  if (soundEnabled) startSoundtrack();
}

function showMemory(step) {
  memoryMedia.replaceChildren();
  memoryMedia.hidden = true;

  if (step.image) {
    const figure = document.createElement('figure');
    figure.className = 'memory-photo';
    const image = document.createElement('img');
    image.src = step.image;
    image.alt = step.imageAlt || 'A memory from Naman and Namrata’s story';
    const caption = document.createElement('figcaption');
    caption.textContent = step.caption || 'A little memory';
    figure.append(image, caption);
    memoryMedia.append(figure);
    memoryMedia.hidden = false;
    return;
  }

  if (step.art === 'coffee') {
    memoryMedia.innerHTML = `
      <div class="coffee-flashback" role="img" aria-label="A two-panel comic: Namrata opens a shake-well bottle, then shakes it and coffee splashes out.">
        <div class="coffee-panel">
          <span class="coffee-panel-label">1 · LID OFF</span>
          <div class="coffee-scene">
            <img src="/assets/namrata.png" alt="" />
            <span class="coffee-bottle"><b>SHAKE<br />WELL</b><i></i></span>
          </div>
        </div>
        <span class="coffee-arrow" aria-hidden="true">→</span>
        <div class="coffee-panel coffee-panel--spill">
          <span class="coffee-panel-label">2 · SHAKE!</span>
          <div class="coffee-scene">
            <img src="/assets/namrata.png" alt="" />
            <span class="coffee-bottle coffee-bottle--open"><b>SHAKE<br />WELL</b><i></i></span>
            <span class="coffee-splash" aria-hidden="true">☕ ✦</span>
          </div>
        </div>
      </div>`;
    memoryMedia.hidden = false;
  }
}

function renderDialogueStep() {
  const step = dialogueState.steps[dialogueState.index];
  dialogueKicker.textContent = step.kicker || 'A MEMORY WITH NAMRATA';
  dialogueSpeaker.textContent = step.speaker;
  dialogueText.textContent = step.text;
  dialoguePanel.classList.toggle('dialogue-panel--objective', step.speaker === 'OBJECTIVE');
  showMemory(step);
  dialogueNext.textContent = dialogueState.index === dialogueState.steps.length - 1 ? 'Continue →' : 'Next →';
}

function showDialogue(steps, onComplete) {
  gameIsActive = false;
  dialogueState = { steps, index: 0, onComplete };
  dialoguePanel.hidden = false;
  interactionHint.hidden = true;
  renderDialogueStep();
  updateTouchControls();
}

function advanceDialogue() {
  if (!dialogueState) return;
  if (dialogueState.index < dialogueState.steps.length - 1) {
    dialogueState.index += 1;
    renderDialogueStep();
    return;
  }

  const onComplete = dialogueState.onComplete;
  dialogueState = null;
  dialoguePanel.hidden = true;
  memoryMedia.replaceChildren();
  memoryMedia.hidden = true;
  onComplete?.();
  updateTouchControls();
}

function transitionToCity() {
  balconyScene.visible = false;
  mainView.visible = true;
  setMusicMode('city');
  gameMount.classList.remove('game-mount--balcony');
  gameMount.classList.add('game-mount--city');
  setStatus('Morning has arrived. Walk right through town and stop for each little gift.');
  showDialogue(
    [
      { speaker: 'OBJECTIVE', text: 'Collect Chiji for Babu and meet her.', kicker: 'THE NEXT MORNING · YOUR LITTLE LOVE QUEST' },
      { speaker: 'Naman', text: 'I am going to meet my cutie pie Shona, I need to get her chiji.', kicker: 'ON MY WAY TO NAMRATA' },
    ],
    () => {
      gameIsActive = true;
      setStatus('It’s morning. Walk right through town, and tap Talk when you reach a gift.');
      updateTouchControls();
    },
  );
}

function finishStop(stop) {
  stop.collected = true;
  collectedCount += 1;
  updateCount();
  const marker = stopMarkers.get(stop.id);
  if (marker) {
    marker.visible = false;
    const found = makeText('♥', { fontSize: 28, fill: '#fff3df' });
    found.anchor.set(0.5);
    found.position.set(stop.x, groundY - 60);
    world.addChild(found);
  }
  gameIsActive = true;
  setStatus(`${stop.itemName[0].toUpperCase()}${stop.itemName.slice(1)} added to the gifts for Namrata · ${collectedCount}/${itemCountTotal} chiji`);
  updateTouchControls();
}

function nearestAvailableStop() {
  return storyStops
    .filter((stop) => !stop.collected)
    .map((stop) => ({ stop, distance: Math.abs(player.x - stop.x) }))
    .filter(({ distance }) => distance < 142)
    .sort((a, b) => a.distance - b.distance)[0]?.stop || null;
}

function updateTouchControls() {
  const nearStop = player && gameIsActive ? nearestAvailableStop() : null;
  interactionHint.hidden = !nearStop;
  if (nearStop) interactionHint.textContent = `Press E or tap TALK to pick up ${nearStop.itemName}`;
  interactButton.disabled = !gameIsActive || !nearStop;
  for (const button of touchButtons) {
    if (button === interactButton) continue;
    button.disabled = !gameIsActive;
  }
}

function interact() {
  if (!gameIsActive) return;
  const stop = nearestAvailableStop();
  if (!stop) {
    setStatus('Walk close to a shop item, then tap TALK.');
    return;
  }
  const marker = stopMarkers.get(stop.id);
  if (marker) marker.visible = false;
  playMemoryChime();
  setStatus(`Remembering ${stop.itemName}…`);
  showDialogue(stop.dialogues, () => finishStop(stop));
}

function showSharedMemory() {
  sharedMemorySeen = true;
  playMemoryChime();
  if (memoryMarker) memoryMarker.visible = false;
  showDialogue(sharedMemoryDialogue, () => {
    gameIsActive = true;
    setStatus('Just a little farther, through the garden gate.');
    updateTouchControls();
  });
}

function showGateReminder() {
  gateReminderShown = true;
  showDialogue(
    [{
      speaker: 'Naman',
      text: 'I should gather all the little chiji I picked out for Babu before I meet her.',
      kicker: 'ONE LAST LOOK AROUND',
    }],
    () => {
      player.x = meetingGateX - 155;
      gameIsActive = true;
      setStatus('Head back through town for the gifts you missed. The shops are to your left.');
      updateTouchControls();
    },
  );
}

function showGardenLock() {
  gameIsActive = false;
  keysDown.clear();
  gardenLockPanel.hidden = false;
  gardenLockFeedback.textContent = 'Enter the special date as day / month / year.';
  gardenLockFeedback.classList.remove('garden-lock-feedback--error', 'garden-lock-feedback--success');
  gardenLockSubmit.hidden = false;
  gardenEnterButton.hidden = true;
  gardenLockInputs.forEach((input) => {
    input.disabled = false;
    input.value = '';
  });
  gardenLockInputs[0].focus();
  setStatus('A date lock guards the garden gate.');
  updateTouchControls();
}

function validateGardenCode(event) {
  event.preventDefault();
  const [day, month, year] = gardenLockInputs.map((input) => input.value);
  if (day !== '29' || month !== '09' || year !== '2021') {
    gardenLockFeedback.textContent = 'That date did not open the lock. Try again.';
    gardenLockFeedback.classList.add('garden-lock-feedback--error');
    gardenLockInputs.forEach((input) => { input.value = ''; });
    gardenLockInputs[0].focus();
    return;
  }

  gardenCodeAccepted = true;
  gardenGate.visible = false;
  gardenLockInputs.forEach((input) => { input.disabled = true; });
  gardenLockSubmit.hidden = true;
  gardenLockFeedback.textContent = 'Click. The little lock opens.';
  gardenLockFeedback.classList.remove('garden-lock-feedback--error');
  gardenLockFeedback.classList.add('garden-lock-feedback--success');
  gardenEnterButton.hidden = false;
  gardenEnterButton.focus();
  playMemoryChime();
}

function enterGarden() {
  if (!gardenCodeAccepted) return;
  gardenLockPanel.hidden = true;
  gardenUnlocked = true;
  gardenGate.visible = false;
  player.x = meetingGateX + 20;
  gameIsActive = true;
  setMusicMode('garden');
  setStatus('The garden gate is open. Keep walking to Namrata.');
  updateTouchControls();
}

function meetNamrata() {
  endingStarted = true;
  gameIsActive = false;
  gardenGate.visible = false;
  setMusicMode('garden');
  playMemoryChime();
  player.x = namrataX - 190;
  player.y = groundY;
  playerYVelocity = 0;
  isJumping = false;
  cameraX = Math.max(0, Math.min(worldWidth - visibleWorldWidth, player.x - visibleWorldWidth * 0.37));
  world.x = -cameraX;
  skyLayer.x = -cameraX * 0.08;
  farLayer.x = -cameraX * 0.34;
  setStatus('Naman and Namrata found each other in the garden.');
  showDialogue(endingDialogue, () => {
    endingCard.hidden = false;
    updateTouchControls();
  });
}

function startObjective() {
  transitionToCity();
}

function resetSearch() {
  keysDown.clear();
  collectedCount = 0;
  sharedMemorySeen = false;
  endingStarted = false;
  gateReminderShown = false;
  gardenCodeAccepted = false;
  gardenUnlocked = false;
  playerYVelocity = 0;
  isJumping = false;
  cameraX = 0;
  setMusicMode('balcony');
  player.position.set(120, groundY);
  player.scale.x = playerScale;
  player.scale.y = playerScale;
  storyStops.forEach((stop) => { stop.collected = false; });
  stopMarkers.forEach((marker) => { marker.visible = true; });
  if (memoryMarker) memoryMarker.visible = true;
  if (gardenGate) gardenGate.visible = true;
  gardenLockPanel.hidden = true;
  gardenLockInputs.forEach((input) => {
    input.disabled = false;
    input.value = '';
  });
  gardenLockSubmit.hidden = false;
  gardenEnterButton.hidden = true;
  itemCount.textContent = '0';
  endingCard.hidden = true;
  dialoguePanel.hidden = true;
  dialogueState = null;
  world.x = 0;
  if (skyLayer) skyLayer.x = 0;
  farLayer.x = 0;
  balconyScene.visible = true;
  mainView.visible = false;
  gameMount.classList.remove('game-mount--city');
  gameMount.classList.add('game-mount--balcony');
  setStatus('A quiet night, and one person on Naman’s mind.');
}

function drawMemoryMarker() {
  const marker = new Container();
  marker.x = sharedMemoryX;
  marker.y = groundY - 64;
  const glow = new Graphics().circle(0, 0, 54).fill({ color: '#ffeac6', alpha: 0.35 });
  const bubble = new Graphics().roundRect(-42, -31, 84, 62, 15).fill('#fff4e0').stroke({ color: '#db899c', width: 2 });
  const icon = makeText('♥', { fontSize: 36, fill: '#c84262' });
  icon.anchor.set(0.5);
  const label = makeText('OUR STORY', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: 12, fontWeight: 'bold', fill: '#fff7e9' });
  label.anchor.set(0.5, 0);
  label.position.set(0, 42);
  marker.addChild(glow, bubble, icon, label);
  world.addChild(marker);
  return marker;
}

function resizeGameViewport() {
  if (!app.renderer || !mainView || !balconyScene) return;

  const bounds = gameMount.parentElement.getBoundingClientRect();
  if (bounds.width < 1 || bounds.height < 1) return;

  const width = Math.round(bounds.width);
  const height = Math.round(bounds.height);
  const scale = Math.max(width / 960, height / worldHeight);
  visibleWorldWidth = width / scale;
  app.renderer.resize(width, height);
  mainView.scale.set(scale);
  balconyScene.scale.set(scale);

  const verticalOffset = height < worldHeight * scale
    ? height * 0.79 - groundY * scale
    : (height - worldHeight * scale) / 2;
  mainView.y = verticalOffset;

  const balconyCameraX = Math.max(0, Math.min(960 - visibleWorldWidth, 638 - visibleWorldWidth / 2));
  balconyScene.position.set(-balconyCameraX * scale, verticalOffset);

  if (world && player) {
    cameraX = Math.max(0, Math.min(worldWidth - visibleWorldWidth, player.x - visibleWorldWidth * 0.37));
    world.x = -cameraX;
    skyLayer.x = -cameraX * 0.08;
    farLayer.x = -cameraX * 0.34;
  }
}

async function initializeGame() {
  await app.init({
    width: 960,
    height: worldHeight,
    background: '#514462',
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  const [namanTexture, namrataTexture] = await Promise.all([
    Assets.load('/assets/naman.png'),
    Assets.load('/assets/namrata.png'),
  ]);

  gameMount.appendChild(app.canvas);
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  app.canvas.setAttribute('aria-label', 'Side-scrolling anniversary game. Walk right, collect gifts, and meet Namrata.');

  mainView = new Container();
  skyLayer = drawMainSky();
  farLayer = drawFarCity();
  world = new Container();
  mainView.addChild(skyLayer, farLayer, world);
  app.stage.addChild(mainView);

  world.addChild(drawGround());
  drawShopfront(600, "HALDIRAM'S", '#a43d4e', 'coffee');
  drawShopfront(1400, 'BLOOM & CO.', '#ad5876', 'flower');
  drawShopfront(2200, 'SWEET THINGS', '#75494d', 'chocolate');
  drawShopfront(3000, 'LITTLE NOTES', '#79557e', 'card');
  drawStreetDetails();
  drawGarden();

  storyStops.forEach((stop) => {
    const marker = makeMarker(stop);
    stopMarkers.set(stop.id, marker);
  });
  memoryMarker = drawMemoryMarker();

  player = makeCharacter(namanTexture, 171);
  player.position.set(120, groundY);
  playerScale = player.scale.x;
  world.addChild(player);

  namrata = makeCharacter(namrataTexture, 174);
  namrata.position.set(namrataX, groundY);
  world.addChild(namrata);

  balconyScene = drawBalcony(namanTexture);
  app.stage.addChild(balconyScene);
  mainView.visible = false;
  balconyScene.visible = true;

  if (typeof ResizeObserver !== 'undefined') {
    gameViewportObserver = new ResizeObserver(resizeGameViewport);
    gameViewportObserver.observe(gameViewport);
  } else {
    window.addEventListener('resize', resizeGameViewport);
  }
  resizeGameViewport();

  app.ticker.add((ticker) => {
    const elapsed = Math.min(ticker.deltaMS / 1000, 0.05);
    const time = performance.now() / 1000;

    for (const marker of stopMarkers.values()) {
      if (marker.visible) {
        marker.y = marker.baseY + Math.sin(time * 2 + marker.phase) * 4;
        marker.halo.alpha = 0.78 + Math.sin(time * 3 + marker.phase) * 0.16;
      }
    }
    if (memoryMarker?.visible) memoryMarker.y = groundY - 64 + Math.sin(time * 1.6) * 4;

    if (!gameIsActive || endingStarted) return;

    let direction = 0;
    if (keysDown.has('ArrowLeft') || keysDown.has('a')) direction -= 1;
    if (keysDown.has('ArrowRight') || keysDown.has('d')) direction += 1;
    if (direction !== 0) {
      player.x += direction * playerSpeed * elapsed;
      player.scale.x = direction < 0 ? -playerScale : playerScale;
    }

    if ((keysDown.has('ArrowUp') || keysDown.has('w') || keysDown.has(' ')) && !isJumping) {
      playerYVelocity = -445;
      isJumping = true;
    }
    if (isJumping) {
      playerYVelocity += 1250 * elapsed;
      player.y += playerYVelocity * elapsed;
      if (player.y >= groundY) {
        player.y = groundY;
        playerYVelocity = 0;
        isJumping = false;
      }
    }

    const playerLimit = gardenUnlocked ? meetingPointX : meetingGateX;
    player.x = Math.max(96, Math.min(playerLimit, player.x));

    if (!sharedMemorySeen && player.x >= sharedMemoryX) {
      player.x = sharedMemoryX;
      showSharedMemory();
      return;
    }

    if (!gardenUnlocked && player.x >= meetingGateX) {
      player.x = meetingGateX;
      if (collectedCount < itemCountTotal && !gateReminderShown) {
        showGateReminder();
        return;
      }
      if (collectedCount < itemCountTotal) {
        setStatus(`The garden is just ahead. Find the remaining gifts to meet Namrata · ${collectedCount}/${itemCountTotal} chiji.`);
      } else if (!gardenCodeAccepted) {
        showGardenLock();
        return;
      }
    }

    if (gardenUnlocked && player.x >= meetingPointX) {
      meetNamrata();
      return;
    }

    const desiredCameraX = Math.max(0, Math.min(worldWidth - visibleWorldWidth, player.x - visibleWorldWidth * 0.37));
    cameraX += (desiredCameraX - cameraX) * Math.min(1, elapsed * 5);
    world.x = -cameraX;
    skyLayer.x = -cameraX * 0.08;
    farLayer.x = -cameraX * 0.34;
    updateTouchControls();
  });

  resetSearch();
}

function startSearch() {
  if (gameInitializationFailed) {
    window.location.reload();
    return;
  }

  if (!gameReady) {
    startRequested = true;
    playButton.disabled = true;
    playButtonLabel.textContent = 'Getting the game ready…';
    playButton.setAttribute('aria-busy', 'true');
    return;
  }

  resetSearch();
  startSoundtrack();
  document.body.classList.add('game-active');
  introScreen.hidden = true;
  gameScreen.hidden = false;
  showDialogue(
    [{
      speaker: 'Naman',
      text: 'It’s our anniversary tomorrow, I will visit Namrata. I am missing her so much.',
      kicker: 'THE NIGHT BEFORE',
    }],
    startObjective,
  );
}

playButton.addEventListener('click', startSearch);
restartButton.addEventListener('click', startSearch);
musicToggle.addEventListener('click', toggleSound);
dialogueNext.addEventListener('click', advanceDialogue);
gardenLockForm.addEventListener('submit', validateGardenCode);
gardenEnterButton.addEventListener('click', enterGarden);
gardenLockInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, input.maxLength);
    gardenLockFeedback.classList.remove('garden-lock-feedback--error');
    if (!gardenCodeAccepted) gardenLockFeedback.textContent = 'Enter day / month / year.';
    if (input.value.length === input.maxLength && gardenLockInputs[index + 1]) gardenLockInputs[index + 1].focus();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && gardenLockInputs[index - 1]) {
      gardenLockInputs[index - 1].focus();
    }
  });
});
backButton.addEventListener('click', () => {
  gameIsActive = false;
  keysDown.clear();
  document.body.classList.remove('game-active');
  gameScreen.hidden = true;
  endingCard.hidden = true;
  introScreen.hidden = false;
  resetSearch();
});

for (const button of touchButtons) {
  const control = button.dataset.control;
  if (control === 'talk') {
    button.addEventListener('click', interact);
    continue;
  }
  const key = control === 'left' ? 'ArrowLeft' : control === 'right' ? 'ArrowRight' : 'ArrowUp';
  const release = (event) => {
    if (event) event.preventDefault();
    keysDown.delete(key);
  };
  button.addEventListener('pointerdown', (event) => {
    if (button.disabled) return;
    event.preventDefault();
    keysDown.add(key);
    button.setPointerCapture?.(event.pointerId);
  });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
}

const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'a', 'd', 'ArrowUp', 'w', ' ']);
const interactionKeys = new Set(['e', 'E']);

window.addEventListener('keydown', (event) => {
  if (dialogueState && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    if (!event.repeat) advanceDialogue();
    return;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (gameIsActive && movementKeys.has(key)) {
    event.preventDefault();
    keysDown.add(key);
  } else if (gameIsActive && interactionKeys.has(event.key)) {
    event.preventDefault();
    if (!event.repeat) interact();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keysDown.delete(key);
});

window.addEventListener('blur', () => keysDown.clear());

function showGameInitializationError(error) {
  if (gameInitializationFailed) return;
  gameInitializationFailed = true;
  startRequested = false;
  console.error('Could not start the PixiJS game:', error);
  gameStatus.textContent = 'The game could not load. Tap Try again to reload it.';
  controlNote.textContent = 'The game did not finish loading. Tap Try again to reload it.';
  playButton.disabled = false;
  playButton.removeAttribute('aria-busy');
  playButtonLabel.textContent = 'Try again';
  playButton.setAttribute('aria-label', 'Try loading the game again');
}

const gameInitializationTimeout = window.setTimeout(() => {
  if (!gameReady) showGameInitializationError(new Error('Game initialization timed out.'));
}, 20000);

initializeGame().then(() => {
  if (gameInitializationFailed) return;
  gameReady = true;
  window.clearTimeout(gameInitializationTimeout);
  playButton.disabled = false;
  playButton.removeAttribute('aria-busy');
  if (startRequested) {
    startRequested = false;
    startSearch();
  }
}).catch((error) => {
  window.clearTimeout(gameInitializationTimeout);
  showGameInitializationError(error);
});
