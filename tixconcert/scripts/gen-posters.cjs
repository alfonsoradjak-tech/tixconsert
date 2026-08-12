const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "public", "posters");
fs.mkdirSync(outDir, { recursive: true });

const posters = [
  { file: "soundwave.jpg", title: "SOUNDWAVE", sub: "FESTIVAL 2026", date: "12 SEP 2026", city: "JAKARTA", c1: "#7c3aed", c2: "#c026d3", c3: "#fb923c" },
  { file: "java-music.jpg", title: "JAVA MUSIC", sub: "FEST", date: "30 AUG 2026", city: "JAKARTA", c1: "#f97316", c2: "#e11d48", c3: "#7c3aed" },
  { file: "rock-revolution.jpg", title: "ROCK", sub: "REVOLUTION", date: "25 JUL 2026", city: "JAKARTA", c1: "#1f2937", c2: "#b91c1c", c3: "#7c3aed" },
  { file: "summer-beats.jpg", title: "SUMMER", sub: "BEATS", date: "11 JUL 2026", city: "BALI", c1: "#0ea5e9", c2: "#22d3ee", c3: "#f472b6" },
  { file: "indie-night.jpg", title: "INDIE", sub: "NIGHT", date: "03 OCT 2026", city: "YOGYAKARTA", c1: "#10b981", c2: "#0ea5e9", c3: "#8b5cf6" },
  { file: "edm-universe.jpg", title: "EDM", sub: "UNIVERSE", date: "15 AUG 2026", city: "TANGERANG", c1: "#06b6d4", c2: "#d946ef", c3: "#8b5cf6" },
  { file: "coldplay-live.jpg", title: "COLDPLAY", sub: "LIVE IN JAKARTA", date: "21 NOV 2026", city: "JAKARTA", c1: "#3b82f6", c2: "#d946ef", c3: "#facc15" },
  { file: "tulus-harmoni.jpg", title: "TULUS", sub: "HARMONI", date: "05 SEP 2026", city: "JAKARTA", c1: "#0f766e", c2: "#10b981", c3: "#a7f3d0" },
  { file: "dewa19.jpg", title: "DEWA 19", sub: "30 YEARS ROCKESTRA", date: "05 DEC 2026", city: "JAKARTA", c1: "#111827", c2: "#b91c1c", c3: "#f59e0b" },
  { file: "niki-moonchild.jpg", title: "NIKI", sub: "MOONCHILD TOUR", date: "17 OCT 2026", city: "JAKARTA", c1: "#db2777", c2: "#9333ea", c3: "#fbbf24" },
  { file: "star-kids.jpg", title: "STAR KIDS", sub: "WORLD TOUR", date: "16 JAN 2027", city: "JAKARTA", c1: "#e11d48", c2: "#f472b6", c3: "#8b5cf6" },
  { file: "dangdut-melodi.jpg", title: "MELODI CINTA", sub: "KONSER DANGDUT", date: "08 AUG 2026", city: "MEDAN", c1: "#be123c", c2: "#f97316", c3: "#facc15" },
  { file: "jazz-city.jpg", title: "JAZZ", sub: "IN THE CITY", date: "19 SEP 2026", city: "YOGYAKARTA", c1: "#4338ca", c2: "#0ea5e9", c3: "#22d3ee" },
  { file: "hiphop-takeover.jpg", title: "HIP HOP", sub: "TAKEOVER", date: "22 AUG 2026", city: "SURABAYA", c1: "#0f172a", c2: "#475569", c3: "#f59e0b" },
  { file: "neon-odeon.jpg", title: "NEON ODEON", sub: "NIGHTS", date: "24 OCT 2026", city: "BANDUNG", c1: "#22d3ee", c2: "#8b5cf6", c3: "#e879f9" },
  { file: "rnb-romance.jpg", title: "R&B", sub: "ROMANCE NIGHT", date: "14 NOV 2026", city: "SURABAYA", c1: "#831843", c2: "#db2777", c3: "#f59e0b" },
];

function svg(p) {
  const gradient = (id) =>
    `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
       <stop offset="0%" stop-color="${p.c1}"/>
       <stop offset="55%" stop-color="${p.c2}"/>
       <stop offset="100%" stop-color="${p.c3}"/>
     </linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <defs>
    ${gradient("bg")}
    <filter id="blur"><feGaussianBlur stdDeviation="90"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="60"/></filter>
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="1200" fill="#08060f"/>
  <rect width="900" height="1200" fill="url(#bg)" opacity="0.9"/>
  <circle cx="180" cy="220" r="260" fill="#ffffff" opacity="0.14" filter="url(#blur)"/>
  <circle cx="760" cy="900" r="300" fill="#000000" opacity="0.35" filter="url(#blur)"/>
  <circle cx="450" cy="520" r="420" fill="url(#glow)"/>
  <g opacity="0.16">
    ${Array.from({length: 6}, (_, i) => `<circle cx="${120 + i*120}" cy="${900 + (i%2)*40}" r="${40 + i*18}" fill="#000"/>`).join("")}
    ${Array.from({length: 5}, (_, i) => `<circle cx="${200 + i*140}" cy="${360 - i*10}" r="${16 + i*8}" fill="#fff"/>`).join("")}
  </g>
  <rect x="64" y="64" width="772" height="1072" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>
  <text x="90" y="140" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" letter-spacing="8" fill="#ffffff" opacity="0.92">TIXCONCERT</text>
  <text x="810" y="142" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#ffffff" opacity="0.6">🎟</text>
  <g transform="translate(450 610)">
    <text text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="900" letter-spacing="4" fill="#ffffff">${p.title}</text>
    <text y="120" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" letter-spacing="14" fill="#ffffff" opacity="0.92">${p.sub}</text>
    <rect x="-40" y="170" width="80" height="8" rx="4" fill="#ffffff" opacity="0.85"/>
  </g>
  <g transform="translate(90 1000)" font-family="Arial, Helvetica, sans-serif" fill="#ffffff">
    <text font-size="40" font-weight="800" opacity="0.95">${p.date}</text>
    <text y="52" font-size="32" font-weight="600" opacity="0.72">${p.city} · INDONESIA</text>
  </g>
  <rect x="690" y="940" width="146" height="120" rx="20" fill="#000" opacity="0.4"/>
  <g transform="translate(763 1000)" font-family="Arial, Helvetica, sans-serif" fill="#ffffff" text-anchor="middle">
    <text font-size="30" font-weight="900" opacity="0.95">BUY</text>
    <text y="38" font-size="26" font-weight="700" opacity="0.75">TICKET</text>
  </g>
</svg>`;
}

for (const p of posters) {
  fs.writeFileSync(path.join(outDir, p.file), svg(p));
  console.log("generated", p.file);
}
console.log("done");
