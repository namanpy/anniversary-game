# Naman’s Journey to Namrata

A short, romantic anniversary story built with Node.js, Vite, and PixiJS 8. Naman starts on a quiet balcony the night before their anniversary. After the opening dialogue, the story moves to the next morning: he walks through a warmly lit city, collects four little gifts, unlocks the garden gate with a date code, and meets Namrata.

The story includes a first-date cold-coffee flashback, a bouquet memory, a KitKat memory, a greeting-card reveal, and a shared-photo moment before the ending.
It starts a quiet, synthesized love theme after **Play** is pressed, adds a small chime at memory moments, and shifts to a warmer chord sequence in the garden. The in-game sound button can mute or restore it.

## Requirements

- Node.js 20 or newer
- npm

## Start developing

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The intro screen and game are responsive and include touch controls for phones.

## Controls

- Walk: **Left / Right arrows** or **A / D**. Hold the on-screen arrows on mobile.
- Jump: **Up arrow** or **Space**, or tap **Jump**.
- Interact at a shop: **E** or tap **Talk** when the prompt appears.
- Advance story dialogue: tap **Continue**, or press **Enter**.

## Build for production

```bash
npm run build
npm run preview
```

## Deploy on Render

`render.yaml` configures this as a static site. Connect the project’s Git repository to Render and use the Blueprint to build with `npm ci && npm run build` and publish `dist`.

## Project structure

- `index.html` — intro screen, photo collage, and game HUD
- `src/main.js` — PixiJS scenes, side-scrolling movement, story dialogue, and interactions
- `src/style.css` — romantic pink theme and responsive layout
- `public/assets/` — intro photos, character sprites, and memory images
