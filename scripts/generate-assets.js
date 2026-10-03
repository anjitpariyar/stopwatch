#!/usr/bin/env node
// Generates every app icon, splash, widget preview and store graphic from code.
// Edit the shapes below, then run: npm run assets   (needs rsvg-convert on PATH)

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BRAND = path.join(ROOT, "assets/brand");
const IMAGES = path.join(ROOT, "assets/images");
const STORE = path.join(ROOT, "store");

const BLACK = "#000000";
const WHITE = "#F5F5F4";
const MUTED = "#78716C";
const FAINT = "#2A2724";
const GREEN = "#4CFF7E";
const FONT = "JetBrainsMono Nerd Font, JetBrains Mono, monospace";

// ── The mark: progress ring + glowing dot around an open padlock ───────────
// Drawn on a 1024 canvas centred at 512; `scale` shrinks it for adaptive-icon
// safe zones. `mono` draws a single-colour silhouette for Android themed icons.
function mark({ scale = 1, mono = false } = {}) {
  const ink = mono ? "#FFFFFF" : WHITE;
  const ring = mono ? "#FFFFFF" : FAINT;
  const arc = mono ? "#FFFFFF" : GREEN;
  const r = 290;
  // Arc sweeps 300° clockwise from 12 o'clock: "most of your daily average".
  const end = ((-90 + 300) * Math.PI) / 180;
  const ex = (512 + r * Math.cos(end)).toFixed(1);
  const ey = (512 + r * Math.sin(end)).toFixed(1);

  return `
  <defs>
    <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="18" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <mask id="keyhole">
      <rect width="1024" height="1024" fill="#fff"/>
      <circle cx="512" cy="572" r="24" fill="#000"/>
      <path d="M498 584 L526 584 L534 630 L490 630 Z" fill="#000"/>
    </mask>
  </defs>
  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
    <circle cx="512" cy="512" r="${r}" fill="none" stroke="${ring}" stroke-width="20" opacity="${mono ? 0.35 : 1}"/>
    ${mono ? "" : `<path d="M512 ${512 - r} A${r} ${r} 0 1 1 ${ex} ${ey}" fill="none" stroke="${arc}" stroke-width="20" stroke-linecap="round" opacity="0.35" filter="url(#soft)"/>`}
    <path d="M512 ${512 - r} A${r} ${r} 0 1 1 ${ex} ${ey}" fill="none" stroke="${arc}" stroke-width="20" stroke-linecap="round" opacity="${mono ? 0.7 : 0.6}"/>
    <circle cx="${ex}" cy="${ey}" r="30" fill="${arc}" ${mono ? "" : 'filter="url(#glow)"'}/>
    <!-- open shackle: right leg stays in the body, left leg lifted free -->
    <path d="M596 506 V412 A84 84 0 0 0 428 412 V446" fill="none" stroke="${ink}" stroke-width="42" stroke-linecap="round"/>
    <rect x="388" y="494" width="248" height="190" rx="40" fill="${ink}" mask="url(#keyhole)"/>
  </g>`;
}

function svg(w, h, body, bg) {
  const fill = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${fill}${body}</svg>`;
}

const vignette = `
  <defs><radialGradient id="bg" cx="50%" cy="45%" r="70%">
    <stop offset="0" stop-color="#16130F"/><stop offset="1" stop-color="${BLACK}"/>
  </radialGradient></defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>`;

function render(name, svgText, outPath, width) {
  const src = path.join(BRAND, `${name}.svg`);
  fs.writeFileSync(src, svgText);
  const args = width ? ["-w", String(width)] : [];
  execFileSync("rsvg-convert", [...args, "-o", outPath, src]);
  console.log("✔", path.relative(ROOT, outPath));
}

// ── Widget previews (shown in the launcher's widget picker) ────────────────
function widgetSmall() {
  return svg(440, 440, `
    <rect width="440" height="440" rx="40" fill="${BLACK}"/>
    <circle cx="40" cy="44" r="6" fill="${GREEN}"/>
    <text x="56" y="50" font-family="${FONT}" font-size="18" fill="${MUTED}">UNLOCKS</text>
    <text x="220" y="262" text-anchor="middle" font-family="${FONT}" font-size="120" fill="${WHITE}">47</text>
    <text x="220" y="400" text-anchor="middle" font-family="${FONT}" font-size="17" fill="${MUTED}">AVG 62/DAY</text>`);
}

function widgetMedium() {
  const counts = [58, 71, 44, 66, 80, 52, 47];
  const letters = ["S", "M", "T", "W", "T", "F", "S"];
  const max = Math.max(...counts);
  const bars = counts.map((c, i) => {
    const h = Math.round((c / max) * 110);
    const x = 400 + i * 74;
    const today = i === counts.length - 1;
    return `<rect x="${x}" y="${300 - h}" width="22" height="${h}" rx="6" fill="${today ? GREEN : MUTED}"/>
      <text x="${x + 11}" y="336" text-anchor="middle" font-family="${FONT}" font-size="17" fill="${today ? GREEN : MUTED}">${letters[i]}</text>`;
  }).join("");
  return svg(960, 440, `
    <rect width="960" height="440" rx="40" fill="${BLACK}"/>
    <text x="40" y="150" font-family="${FONT}" font-size="18" fill="${MUTED}">UNLOCKS</text>
    <text x="34" y="262" font-family="${FONT}" font-size="104" fill="${WHITE}">47</text>
    <text x="40" y="306" font-family="${FONT}" font-size="17" fill="${MUTED}">AVG 62/DAY</text>
    ${bars}`);
}

function widgetBar() {
  return svg(960, 160, `
    <rect width="960" height="160" rx="32" fill="${BLACK}"/>
    <circle cx="48" cy="80" r="8" fill="${GREEN}"/>
    <text x="72" y="88" font-family="${FONT}" font-size="22" fill="${MUTED}">UNLOCKS TODAY</text>
    <text x="924" y="98" text-anchor="end" font-family="${FONT}" font-size="52" fill="${WHITE}">47</text>`);
}

// ── Play Store feature graphic (1024×500) ──────────────────────────────────
function featureGraphic() {
  return svg(1024, 500, `
    <defs><radialGradient id="fg" cx="22%" cy="50%" r="60%">
      <stop offset="0" stop-color="#16130F"/><stop offset="1" stop-color="${BLACK}"/>
    </radialGradient></defs>
    <rect width="1024" height="500" fill="url(#fg)"/>
    <g transform="translate(-30 -12) scale(0.5)">${mark({ scale: 1.25 })}</g>
    <text x="500" y="222" font-family="${FONT}" font-size="76" fill="${WHITE}">Unlocked</text>
    <text x="504" y="276" font-family="${FONT}" font-size="22" fill="${MUTED}" letter-spacing="3">COUNT EVERY TIME YOU</text>
    <text x="504" y="310" font-family="${FONT}" font-size="22" fill="${MUTED}" letter-spacing="3">REACH FOR YOUR PHONE</text>
    <circle cx="512" cy="356" r="6" fill="${GREEN}"/>
    <text x="528" y="363" font-family="${FONT}" font-size="18" fill="${GREEN}" letter-spacing="2">NO ACCOUNT · NO ADS · OFFLINE</text>`, BLACK);
}

fs.mkdirSync(BRAND, { recursive: true });
fs.mkdirSync(STORE, { recursive: true });

// Full-bleed icon (legacy Android, iOS, store listing).
render("icon", svg(1024, 1024, vignette + mark({ scale: 1.3 })), path.join(IMAGES, "icon.png"));
render("icon", svg(1024, 1024, vignette + mark({ scale: 1.3 })), path.join(STORE, "icon-512.png"), 512);
render("favicon", svg(1024, 1024, vignette + mark({ scale: 1.3 })), path.join(IMAGES, "favicon.png"), 48);

// Adaptive icon layers: content must sit inside the centre 66% safe zone.
render("android-icon-foreground", svg(1024, 1024, mark({ scale: 0.92 })), path.join(IMAGES, "android-icon-foreground.png"));
render("android-icon-background", svg(1024, 1024, vignette), path.join(IMAGES, "android-icon-background.png"));
render("android-icon-monochrome", svg(1024, 1024, mark({ scale: 0.92, mono: true })), path.join(IMAGES, "android-icon-monochrome.png"));

// Splash mark (on black, see app.json).
render("splash-icon", svg(1024, 1024, mark({ scale: 1.3 })), path.join(IMAGES, "splash-icon.png"), 512);

// Widget picker previews.
render("widget-small", widgetSmall(), path.join(IMAGES, "widget-small-preview.png"));
render("widget-medium", widgetMedium(), path.join(IMAGES, "widget-medium-preview.png"));
render("widget-bar", widgetBar(), path.join(IMAGES, "widget-bar-preview.png"));

render("feature-graphic", featureGraphic(), path.join(STORE, "feature-graphic.png"));

// ── Play Store screenshots ──────────────────────────────────────────────────
// Raw device captures (store/screenshots/raw) are 9:20, which Play rejects
// (long side > 2× short side), so frame them on a 1080×1920 canvas with a caption.
const SHOTS = [
  ["01-widget", "Your count,", "on your home screen", "EVERY UNLOCK, AT A GLANCE"],
  ["02-app", "See the", "pattern", "DAY · WEEK · MONTH · YEAR"],
];

function screenshot(file, line1, line2, sub) {
  const data = fs.readFileSync(path.join(STORE, "screenshots/raw", file)).toString("base64");
  const h = 1380;
  const w = Math.round((h * 1080) / 2400);
  const x = (1080 - w) / 2;
  const y = 470;
  return svg(1080, 1920, `
    <defs>
      <radialGradient id="sbg" cx="50%" cy="20%" r="80%">
        <stop offset="0" stop-color="#16130F"/><stop offset="1" stop-color="${BLACK}"/>
      </radialGradient>
      <clipPath id="clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="44"/></clipPath>
    </defs>
    <rect width="1080" height="1920" fill="url(#sbg)"/>
    <circle cx="540" cy="120" r="9" fill="${GREEN}"/>
    <text x="540" y="230" text-anchor="middle" font-family="${FONT}" font-size="70" fill="${WHITE}">${line1}</text>
    <text x="540" y="316" text-anchor="middle" font-family="${FONT}" font-size="70" fill="${WHITE}">${line2}</text>
    <text x="540" y="390" text-anchor="middle" font-family="${FONT}" font-size="26" letter-spacing="4" fill="${MUTED}">${sub}</text>
    <image href="data:image/jpeg;base64,${data}" x="${x}" y="${y}" width="${w}" height="${h}" clip-path="url(#clip)" preserveAspectRatio="xMidYMin slice"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="44" fill="none" stroke="${FAINT}" stroke-width="4"/>`);
}

fs.mkdirSync(path.join(STORE, "screenshots"), { recursive: true });
for (const [name, l1, l2, sub] of SHOTS) {
  const raw = fs.readdirSync(path.join(STORE, "screenshots/raw")).find((f) => f.startsWith(name));
  if (!raw) continue;
  render(`screenshot-${name}`, screenshot(raw, l1, l2, sub), path.join(STORE, "screenshots", `${name}.png`));
  // The SVG embeds the whole JPEG; don't keep that copy around.
  fs.unlinkSync(path.join(BRAND, `screenshot-${name}.svg`));
}
