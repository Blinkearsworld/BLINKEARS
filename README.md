# BLINKEARS — Official Website

Static website for **blinkears.com**, hosted on GitHub Pages (branch `main`, root folder).
Changes are made directly in this repository (by Claude, via GitHub). No manual uploading is needed.

## Structure
All files sit in ONE folder (no subfolders).
- Pages: `index.html`, `watch.html`, `play.html`, `merch.html`, `privacy.html`, `terms.html`, `404.html`
- Games (each a single self-contained file): `rush.html`, `boing.html`, `jar.html`, `flap.html`, `bridge.html`, `bounce.html`, `band.html`, `splash.html`, `run.html`, `adventure.html`, plus the `birthday.html` card
- Shared styles/script: `style.css`, `app.js` · Images: `*.jpg` / `*.webp` / `*.png`
- `CNAME` (blinkears.com) and `.nojekyll` must stay.

## Automatic parts
- `videos.json` is refreshed every 4 hours by the GitHub Action in `.github/workflows/` from the YouTube channel @BLINKEARS.
  The Watch page and the home page ("New on the channel", "What's new") read it automatically.
- The "NEW GAME" badge on the home page shows whichever tile in `play.html` has the `new` class.

## Adding a game
1. Add the game file and a 960×540 banner `game-NAME.webp`.
2. Add a tile in `play.html` (move the `new` class to it) and a line in `sitemap.xml`.

## Editing tips
- After editing `style.css` or `app.js`, bump `?v=20` → `?v=21` in the HTML files to clear browser caches.
- Merch buttons open an email to blinkears@gmail.com. When a real shop exists, replace the `mailto:` links with shop links.

## განახლება
ცვლილებები Claude-ს პირდაპირ შეაქვს ამ რეპოზიტორიაში; საიტი 1–2 წუთში ახლდება.
თუ ძველი ვერსია ჩანს — Cmd+Shift+R (ან incognito).
