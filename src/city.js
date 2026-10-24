/* ================= My Dham — a city of scale-model holy places =================
   Buy sets in the shop with coins, place them anywhere on your map, drag to move,
   flip or store them. Each set you own adds to a daily dham reward (coins + one of
   its photocards). Customize the background, sign colour and name sign. */

/* ---------- drawing kit (all sizes in "units" scaled by s) ---------- */
const CK = {
  shadow(x, cx, by, w, s) { x.fillStyle = "rgba(0,0,0,.18)"; x.beginPath(); x.ellipse(cx, by + 2 * s, w * s, w * s * 0.32, 0, 0, 7); x.fill(); },
  box(x, cx, by, w, d, h, s, top, left, right) { // isometric box: half-width w, half-depth d, height h
    const W = w * s, D = d * s, H = h * s;
    x.fillStyle = left; x.beginPath(); x.moveTo(cx - W, by - D); x.lineTo(cx, by); x.lineTo(cx, by - H); x.lineTo(cx - W, by - D - H); x.closePath(); x.fill();
    x.fillStyle = right; x.beginPath(); x.moveTo(cx + W, by - D); x.lineTo(cx, by); x.lineTo(cx, by - H); x.lineTo(cx + W, by - D - H); x.closePath(); x.fill();
    x.fillStyle = top; x.beginPath(); x.moveTo(cx, by - H); x.lineTo(cx + W, by - D - H); x.lineTo(cx, by - 2 * D - H); x.lineTo(cx - W, by - D - H); x.closePath(); x.fill();
  },
  plinth(x, cx, by, w, s, top, side) { CK.box(x, cx, by, w, w / 2, 4, s, top, side, CK.shade(side, -12)); },
  shade(hex, amt) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, v + amt)); return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`; },
  pyramid(x, cx, by, w, d, h, s, left, right) { const W = w * s, D = d * s, H = h * s;
    x.fillStyle = left; x.beginPath(); x.moveTo(cx - W, by - D); x.lineTo(cx, by); x.lineTo(cx, by - D - H); x.closePath(); x.fill();
    x.fillStyle = right; x.beginPath(); x.moveTo(cx + W, by - D); x.lineTo(cx, by); x.lineTo(cx, by - D - H); x.closePath(); x.fill(); },
  dome(x, cx, by, w, h, s, fill, rim) { const W = w * s, H = h * s;
    x.fillStyle = fill; x.beginPath(); x.moveTo(cx - W, by); x.bezierCurveTo(cx - W, by - H * 0.7, cx - W * 0.3, by - H, cx, by - H); x.bezierCurveTo(cx + W * 0.3, by - H, cx + W, by - H * 0.7, cx + W, by); x.closePath(); x.fill();
    if (rim) { x.fillStyle = rim; x.beginPath(); x.arc(cx, by - H - 2 * s, 2.4 * s, 0, 7); x.fill(); x.fillRect(cx - 0.6 * s, by - H - 8 * s, 1.2 * s, 6 * s); } },
  shikhara(x, cx, by, w, h, s, fill, shadeC) { const W = w * s, H = h * s;
    x.fillStyle = fill; x.beginPath(); x.moveTo(cx - W, by); x.quadraticCurveTo(cx - W * 0.9, by - H * 0.8, cx, by - H); x.quadraticCurveTo(cx + W * 0.9, by - H * 0.8, cx + W, by); x.closePath(); x.fill();
    x.strokeStyle = shadeC; x.lineWidth = Math.max(1, 0.8 * s); for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(cx - W + k * W / 2, by); x.quadraticCurveTo(cx - W * 0.3 + k * W * 0.15, by - H * 0.6, cx, by - H); x.stroke(); } },
  flag(x, cx, top, s, t, color = "#f29a2e") { x.strokeStyle = "#7a6646"; x.lineWidth = Math.max(1, 0.8 * s); x.beginPath(); x.moveTo(cx, top); x.lineTo(cx, top - 12 * s); x.stroke();
    const wv = RM ? 0 : Math.sin(t / 260 + cx) * 2 * s; x.fillStyle = color; x.beginPath(); x.moveTo(cx, top - 12 * s); x.quadraticCurveTo(cx + 5 * s, top - 11 * s + wv, cx + 10 * s, top - 9 * s + wv); x.lineTo(cx, top - 6 * s); x.closePath(); x.fill(); },
  tree(x, cx, by, s, r = 10, leaf = "#3f8a46", t = 0) { x.fillStyle = "#6b4a2a"; x.fillRect(cx - 1.4 * s, by - r * 1.2 * s, 2.8 * s, r * 1.2 * s);
    const sw = RM ? 0 : Math.sin(t / 900 + cx) * 0.6 * s; x.fillStyle = leaf; [[0, -1.9, 1], [-0.7, -1.5, 0.75], [0.7, -1.5, 0.75]].forEach(([dx, dy, k]) => { x.beginPath(); x.arc(cx + dx * r * s + sw, by + dy * r * s, r * k * s, 0, 7); x.fill(); });
    x.fillStyle = "rgba(255,255,255,.12)"; x.beginPath(); x.arc(cx - r * 0.3 * s, by - 2.2 * r * s, r * 0.4 * s, 0, 7); x.fill(); },
  person(x, cx, by, s, robe = "#f29a2e", t = 0, bob = 0) { const b = RM ? 0 : Math.sin(t / 220 + bob) * 0.9 * s;
    x.fillStyle = robe; x.beginPath(); x.moveTo(cx - 3.2 * s, by); x.lineTo(cx + 3.2 * s, by); x.lineTo(cx, by - 9 * s + b); x.closePath(); x.fill();
    x.fillStyle = "#c68a5a"; x.beginPath(); x.arc(cx, by - 10.6 * s + b, 2.2 * s, 0, 7); x.fill(); },
  cow(x, cx, by, s, t = 0, flip = 1) { const b = RM ? 0 : Math.sin(t / 700 + cx) * 0.4 * s;
    x.fillStyle = "#f6f1e7"; x.beginPath(); x.ellipse(cx, by - 5 * s, 7 * s, 3.8 * s, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(cx + 7 * s * flip, by - 7 * s + b, 2.6 * s, 2.2 * s, 0, 0, 7); x.fill();
    x.fillStyle = "#b9763f"; x.beginPath(); x.ellipse(cx - 2 * s, by - 6 * s, 2.4 * s, 1.6 * s, 0, 0, 7); x.fill();
    x.fillStyle = "#8a6a4a"; [-4.5, -2, 2, 4.5].forEach((o) => x.fillRect(cx + o * s, by - 2 * s, 1 * s, 3 * s)); },
  water(x, cx, by, rw, rh, s, t, c1 = "#4b8fd6", c2 = "#7fb8ee") { const g = x.createLinearGradient(cx, by - rh * s, cx, by + rh * s); g.addColorStop(0, c2); g.addColorStop(1, c1);
    x.fillStyle = g; x.beginPath(); x.ellipse(cx, by, rw * s, rh * s, 0, 0, 7); x.fill();
    if (!RM) for (let k = 0; k < 2; k++) { const p = ((t / 1600) + k / 2) % 1; x.strokeStyle = `rgba(255,255,255,${0.45 * (1 - p)})`; x.lineWidth = Math.max(1, 0.8 * s); x.beginPath(); x.ellipse(cx, by, rw * s * (0.3 + p * 0.6), rh * s * (0.3 + p * 0.6), 0, 0, 7); x.stroke(); } },
  wheel(x, cx, cy, r, s, t, spin = true, color = "#5a3a1a") { x.strokeStyle = color; x.lineWidth = Math.max(1.2, 1.3 * s); x.beginPath(); x.arc(cx, cy, r * s, 0, 7); x.stroke();
    const a0 = RM || !spin ? 0 : t / 700; for (let k = 0; k < 8; k++) { const a = a0 + k * Math.PI / 4; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r * s, cy + Math.sin(a) * r * s); x.stroke(); } },
  flame(x, cx, cy, s, t) { const f = RM ? 0 : Math.sin(t / 140 + cx) * 0.6 * s; const g = x.createRadialGradient(cx, cy, 0, cx, cy, 9 * s); g.addColorStop(0, "rgba(255,220,140,.95)"); g.addColorStop(1, "rgba(242,154,46,0)");
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 9 * s, 0, 7); x.fill(); x.fillStyle = "#fff1c9"; x.beginPath(); x.ellipse(cx, cy - f, 1.6 * s, 3.2 * s, 0, 0, 7); x.fill(); },
};

/* ---------- the sets ---------- */
// [id, name, level (rank index), price, limit (0 = none), daily coins, size, possible cards, limitedUntil, draw(x, cx, by, s, t)]
const SETS = [
  ["diya", "Damodara lamp", 0, 0, 3, 3, 0.55, ["yashoda", "krishna"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 12, s); x.fillStyle = "#b5602e"; x.beginPath(); x.ellipse(cx, by - 4 * s, 10 * s, 5 * s, 0, 0, Math.PI); x.fill();
    x.fillStyle = "#d9824a"; x.beginPath(); x.ellipse(cx, by - 4 * s, 10 * s, 2.6 * s, 0, 0, 7); x.fill(); CK.flame(x, cx + 4 * s, by - 10 * s, s, t); }],
  ["tulsi", "Tulsi garden", 0, 60, 2, 5, 0.8, ["radha", "haridasa"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 22, s); CK.plinth(x, cx, by, 20, s, "#8fbf6a", "#6d9a4f");
    CK.box(x, cx, by - 6 * s, 6, 3, 10, s, "#f1e4c4", "#d8c49a", "#c7b086");
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; x.fillStyle = i % 2 ? "#4fa864" : "#5cc97f"; x.beginPath(); x.arc(cx + Math.cos(a) * 4 * s, by - 22 * s + Math.sin(a * 2) * 2.4 * s + (RM ? 0 : Math.sin(t / 900 + i) * 0.4 * s), 3.2 * s, 0, 7); x.fill(); }
    x.fillStyle = "#8b5fbf"; x.beginPath(); x.arc(cx, by - 28 * s, 1.8 * s, 0, 7); x.fill(); }],
  ["goshala", "Gokula cowshed", 0, 150, 0, 8, 1, ["yashoda", "balarama", "sudama"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 34, s); CK.plinth(x, cx, by, 32, s, "#a7c97a", "#7d9c55");
    CK.box(x, cx - 8 * s, by - 8 * s, 16, 8, 14, s, "#d9c49a", "#b28d5c", "#c39d68"); CK.pyramid(x, cx - 8 * s, by - 22 * s, 18, 9, 10, s, "#a6542f", "#c2683a");
    CK.cow(x, cx + 14 * s, by - 2 * s, s * 0.9, t, -1); CK.cow(x, cx + 2 * s, by + 6 * s, s * 0.75, t + 400, 1); }],
  ["annakuta", "Annakuta feast", 0, 200, 1, 12, 0.9, ["krishna", "balarama"], "2026-11-11", (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 26, s); x.fillStyle = "#f3e7cf"; x.beginPath(); x.ellipse(cx, by - 2 * s, 24 * s, 9 * s, 0, 0, 7); x.fill();
    const cols = ["#ffd27a", "#f29a2e", "#ff7fae", "#fff1c9", "#6fc49a", "#e0566a"], rnd = seeded(7);
    for (let row = 0; row < 7; row++) for (let i = 0; i < 9 - row; i++) { x.fillStyle = cols[(row * 3 + i) % 6]; x.beginPath(); x.arc(cx + (i - (8 - row) / 2) * 4.4 * s + (rnd() - 0.5) * s, by - 4 * s - row * 4.2 * s, 2.6 * s, 0, 7); x.fill(); }
    CK.flag(x, cx, by - 33 * s, s, t); }],
  ["keshi", "Keshi Ghat", 1, 250, 0, 10, 1.1, ["krishna", "radha"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 36, s); CK.water(x, cx + 10 * s, by + 2 * s, 26, 10, s, t, "#3d77bd", "#76aee6");
    for (let k = 0; k < 4; k++) CK.box(x, cx - 14 * s + k * 3 * s, by - 2 * s - k * 3 * s, 16 - k * 2, 6, 3, s, "#e6c79a", "#c79a64", "#b5895a");
    CK.box(x, cx - 6 * s, by - 16 * s, 9, 4.5, 14, s, "#efdcb6", "#cfae7c", "#bf9d6b"); CK.dome(x, cx - 6 * s, by - 34 * s, 8, 9, s, "#f2e3c0", "#ffd27a"); }],
  ["elm", "Tompkins Square elm", 1, 300, 0, 10, 1.1, ["prabhupada", "haridasa", "nityananda"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 34, s); CK.plinth(x, cx, by, 30, s, "#9fc48a", "#78995f"); CK.tree(x, cx - 6 * s, by - 6 * s, s, 13, "#4f8f4a", t);
    x.fillStyle = "#6b4a2a"; x.fillRect(cx + 6 * s, by - 6 * s, 14 * s, 2 * s);
    CK.person(x, cx + 10 * s, by + 2 * s, s * 0.9, "#f29a2e", t, 1); CK.person(x, cx + 17 * s, by + 4 * s, s * 0.9, "#ffffff", t, 2); CK.person(x, cx + 3 * s, by + 6 * s, s * 0.9, "#ffd27a", t, 3); }],
  ["jaladuta", "The Jaladuta", 1, 400, 0, 12, 1.2, ["prabhupada"], null, (x, cx, by, s, t) => {
    CK.water(x, cx, by, 36, 11, s, t, "#2f6aa8", "#6ea5df"); const b = RM ? 0 : Math.sin(t / 600) * 1.2 * s;
    x.fillStyle = "#2b2b3a"; x.beginPath(); x.moveTo(cx - 28 * s, by - 6 * s + b); x.lineTo(cx + 30 * s, by - 6 * s + b); x.lineTo(cx + 22 * s, by + 4 * s + b); x.lineTo(cx - 24 * s, by + 4 * s + b); x.closePath(); x.fill();
    x.fillStyle = "#c94a3a"; x.fillRect(cx - 24 * s, by + 1 * s + b, 46 * s, 2 * s); x.fillStyle = "#f2efe6"; x.fillRect(cx - 10 * s, by - 16 * s + b, 18 * s, 10 * s);
    x.fillStyle = "#c94a3a"; x.fillRect(cx + 1 * s, by - 26 * s + b, 5 * s, 10 * s);
    if (!RM) for (let k = 0; k < 3; k++) { const p = ((t / 1800) + k / 3) % 1; x.fillStyle = `rgba(230,230,230,${0.6 * (1 - p)})`; x.beginPath(); x.arc(cx + 4 * s + p * 10 * s, by - 28 * s - p * 14 * s + b, (2 + p * 4) * s, 0, 7); x.fill(); } }],
  ["govardhan", "Govardhan Hill", 2, 600, 0, 15, 1.3, ["krishna", "balarama", "yashoda"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 36, s); x.fillStyle = "#7b6146"; x.beginPath(); x.ellipse(cx, by - 2 * s, 34 * s, 22 * s, 0, Math.PI, 0); x.fill();
    x.fillStyle = "#8d7253"; x.beginPath(); x.ellipse(cx - 8 * s, by - 8 * s, 20 * s, 18 * s, 0, Math.PI, 0); x.fill();
    x.fillStyle = "#5c9a4f"; [[-20, -10], [6, -18], [18, -8], [-6, -22], [24, -4]].forEach(([a, b2]) => { x.beginPath(); x.arc(cx + a * s, by + b2 * s, 4 * s, 0, 7); x.fill(); });
    CK.cow(x, cx + 20 * s, by + 6 * s, s * 0.7, t, -1); CK.person(x, cx - 18 * s, by + 6 * s, s * 0.8, "#ffd27a", t, 4); }],
  ["radhakund", "Radha Kund", 2, 700, 0, 16, 1.2, ["radha", "rupa", "chaitanya"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 36, s); CK.box(x, cx, by, 32, 16, 3, s, "#e3cfa6", "#c5a674", "#b39565");
    for (let k = 1; k < 4; k++) { x.strokeStyle = "rgba(120,90,50,.45)"; x.lineWidth = s; x.beginPath(); x.moveTo(cx, by - 3 * s - 16 * s + k * 3 * s); x.lineTo(cx + (32 - k * 5) * s, by - 3 * s - k * 0); x.stroke(); }
    CK.water(x, cx, by - 10 * s, 20, 8, s, t, "#3f7fc7", "#86bdf0"); CK.tree(x, cx - 28 * s, by - 6 * s, s, 7, "#3f8a46", t); CK.tree(x, cx + 28 * s, by - 6 * s, s, 7, "#4f9a52", t); }],
  ["ganga", "Ganga ghat", 2, 500, 0, 14, 1.1, ["ganga", "shiva", "bhishma"], null, (x, cx, by, s, t) => {
    CK.water(x, cx + 6 * s, by + 4 * s, 34, 10, s, t, "#3a84b0", "#8fcde8"); for (let k = 0; k < 3; k++) CK.box(x, cx - 16 * s + k * 4 * s, by - k * 3 * s, 14, 5, 3, s, "#efe0bd", "#d2b886", "#c1a674");
    x.fillStyle = "#ff7fae"; for (let k = 0; k < 4; k++) { const p = ((t / 3000) + k / 4) % 1; x.beginPath(); x.arc(cx + (p * 40 - 10) * s, by + (4 + (k % 2) * 3) * s, 1.6 * s, 0, 7); x.fill(); CK.flame(x, cx + (p * 40 - 10) * s, by + (2 + (k % 2) * 3) * s, s * 0.4, t); } }],
  ["kurukshetra", "Arjuna's chariot", 2, 800, 0, 18, 1.2, ["arjuna", "bhishma", "kunti", "vidura", "draupadi"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 34, s); CK.box(x, cx + 4 * s, by - 6 * s, 14, 7, 8, s, "#c9a24a", "#9a7a2e", "#b08a36");
    CK.wheel(x, cx - 6 * s, by - 4 * s, 7, s, t, false, "#6b4a1e"); CK.wheel(x, cx + 14 * s, by - 2 * s, 7, s, t, false, "#6b4a1e");
    x.fillStyle = "#f6f1e7"; [[-22, 0], [-18, 4]].forEach(([a, b2]) => { x.beginPath(); x.ellipse(cx + a * s, by + b2 * s - 6 * s, 7 * s, 3.4 * s, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx + (a - 7) * s, by + b2 * s - 9 * s, 2.4 * s, 3 * s, -0.4, 0, 7); x.fill(); });
    CK.person(x, cx + 6 * s, by - 13 * s, s * 0.9, "#3a5fbf", t, 5); CK.flag(x, cx + 12 * s, by - 18 * s, s, t, "#f29a2e"); }],
  ["setu", "Rama's bridge", 3, 900, 0, 18, 1.4, ["rama", "sita", "hanuman", "lakshmana", "vibhishana", "jatayu", "shabari"], null, (x, cx, by, s, t) => {
    CK.water(x, cx, by, 40, 12, s, t, "#2b6fa8", "#73b3e3"); for (let k = -3; k <= 3; k++) { const fy = RM ? 0 : Math.sin(t / 500 + k) * 0.8 * s; CK.box(x, cx + k * 10 * s, by - 2 * s + Math.abs(k) * 1.4 * s + fy, 5, 3, 3, s, "#c9c2b4", "#9f988a", "#8d867a"); }
    x.fillStyle = "#c68a5a"; x.font = `${8 * s}px serif`; x.textAlign = "center"; x.fillText("॥ राम ॥", cx, by - 8 * s); CK.person(x, cx - 26 * s, by - 3 * s, s * 0.8, "#b07a3a", t, 6); }],
  ["ratha", "Ratha Yatra chariot", 3, 1000, 0, 20, 1.3, ["chaitanya", "nityananda", "haridasa"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 30, s); CK.box(x, cx, by - 8 * s, 18, 9, 8, s, "#c94a3a", "#8a2e24", "#a8382c");
    CK.wheel(x, cx - 14 * s, by - 3 * s, 7, s, t); CK.wheel(x, cx + 14 * s, by - 3 * s, 7, s, t);
    for (let k = 0; k < 5; k++) { x.fillStyle = k % 2 ? "#ffd27a" : "#e0566a"; x.beginPath(); x.moveTo(cx - (16 - k * 3) * s, by - (16 + k * 6) * s); x.lineTo(cx + (16 - k * 3) * s, by - (16 + k * 6) * s); x.lineTo(cx + (13 - k * 3) * s, by - (22 + k * 6) * s); x.lineTo(cx - (13 - k * 3) * s, by - (22 + k * 6) * s); x.closePath(); x.fill(); }
    CK.flag(x, cx, by - 46 * s, s, t, "#ffd27a"); CK.person(x, cx - 26 * s, by + 4 * s, s * 0.8, "#f29a2e", t, 7); CK.person(x, cx - 32 * s, by + 6 * s, s * 0.8, "#ffffff", t, 8); }],
  ["krishnabalarama", "Krishna-Balarama Mandir", 3, 1200, 0, 22, 1.3, ["krishna", "balarama", "prabhupada"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 38, s); CK.plinth(x, cx, by, 34, s, "#f3ead6", "#d6c7a6"); CK.box(x, cx, by - 4 * s, 26, 13, 16, s, "#f8f1e2", "#ddcfb2", "#cdbd9c");
    [[-16, 20], [0, 30], [16, 20]].forEach(([o, h]) => { CK.shikhara(x, cx + o * s, by - 33 * s + (o ? 6 * s : 0), 7, h, s, "#fbf6ea", "rgba(160,140,100,.5)"); x.fillStyle = "#ffd27a"; x.beginPath(); x.arc(cx + o * s, by - 33 * s + (o ? 6 * s : 0) - h * s - 1.5 * s, 2 * s, 0, 7); x.fill(); });
    CK.flag(x, cx, by - 66 * s, s, t); x.fillStyle = "#4a2f1e"; x.fillRect(cx - 2.5 * s, by - 13 * s, 5 * s, 9 * s); }],
  ["manor", "Bhaktivedanta Manor", 3, 1100, 0, 20, 1.3, ["prabhupada"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 38, s); CK.plinth(x, cx, by, 34, s, "#8fbf6a", "#6d9a4f"); CK.box(x, cx, by - 4 * s, 26, 13, 18, s, "#f1ece0", "#d9d2c0", "#cbc3b0");
    x.strokeStyle = "#2e2a26"; x.lineWidth = Math.max(1, s); for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(cx + k * 3.6 * s, by - 6 * s - Math.abs(k) * 1.8 * s); x.lineTo(cx + k * 3.6 * s, by - 20 * s - Math.abs(k) * 1.8 * s); x.stroke(); }
    CK.pyramid(x, cx, by - 22 * s, 28, 14, 14, s, "#5a4a3e", "#6e5c4e"); [-12, 12].forEach((o) => { x.fillStyle = "#8a4a3a"; x.fillRect(cx + o * s - 1.5 * s, by - 44 * s, 3 * s, 10 * s); });
    CK.tree(x, cx + 34 * s, by - 2 * s, s, 8, "#3f7d3a", t); }],
  ["churning", "Churning of the ocean", 4, 1500, 0, 25, 1.4, ["kurma", "lakshmi", "shiva", "vishnu", "matsya"], null, (x, cx, by, s, t) => {
    CK.water(x, cx, by, 40, 13, s, t, "#cfe6f5", "#ffffff"); x.fillStyle = "#4f7a5a"; x.beginPath(); x.ellipse(cx, by - 2 * s, 14 * s, 6 * s, 0, 0, 7); x.fill();
    x.fillStyle = "#7b6146"; x.beginPath(); x.moveTo(cx - 8 * s, by - 4 * s); x.lineTo(cx, by - 40 * s); x.lineTo(cx + 8 * s, by - 4 * s); x.closePath(); x.fill();
    const a = RM ? 0 : Math.sin(t / 500) * 4 * s; x.strokeStyle = "#3f8a6a"; x.lineWidth = 3 * s; x.beginPath(); x.moveTo(cx - 34 * s, by - 10 * s); x.bezierCurveTo(cx - 10 * s, by - 26 * s + a, cx + 10 * s, by - 14 * s - a, cx + 34 * s, by - 18 * s); x.stroke();
    CK.person(x, cx - 36 * s, by - 6 * s, s * 0.8, "#f29a2e", t, 9); CK.person(x, cx + 36 * s, by - 14 * s, s * 0.8, "#6b2a6a", t, 10); }],
  ["vaikuntha", "Vaikuntha gate", 4, 1600, 0, 26, 1.3, ["vishnu", "lakshmi", "garuda", "gajendra", "ambarisha", "prahlada", "narasimha", "dhruva", "varaha", "vamana", "narada"], null, (x, cx, by, s, t) => {
    const g = x.createRadialGradient(cx, by - 30 * s, 0, cx, by - 30 * s, 40 * s); g.addColorStop(0, "rgba(180,210,255,.6)"); g.addColorStop(1, "rgba(180,210,255,0)"); x.fillStyle = g; x.beginPath(); x.arc(cx, by - 30 * s, 40 * s, 0, 7); x.fill();
    x.fillStyle = "#f4f8ff"; x.beginPath(); x.ellipse(cx, by, 34 * s, 9 * s, 0, 0, 7); x.fill();
    [-14, 14].forEach((o) => CK.box(x, cx + o * s, by - 2 * s, 5, 2.5, 30, s, "#ffe7a6", "#d9b456", "#e8c46a"));
    x.strokeStyle = "#e8c46a"; x.lineWidth = 3 * s; x.beginPath(); x.arc(cx, by - 32 * s, 14 * s, Math.PI, 0); x.stroke();
    x.fillStyle = "#5b7bff"; x.beginPath(); x.arc(cx, by - 46 * s, 3 * s, 0, 7); x.fill(); }],
  ["dvaraka", "Dvaraka by the sea", 4, 1800, 0, 28, 1.4, ["krishna", "sudama", "balarama"], null, (x, cx, by, s, t) => {
    CK.water(x, cx, by + 4 * s, 42, 12, s, t, "#2a76b0", "#7cc0ea"); CK.plinth(x, cx, by - 2 * s, 30, s, "#f0d98a", "#c9ae5a");
    [[-14, 14, 18], [10, 18, 24], [-2, 10, 30]].forEach(([o, w, h]) => { CK.box(x, cx + o * s, by - 6 * s, w / 2, w / 4, h, s, "#ffe7a6", "#d9b456", "#e8c46a"); CK.dome(x, cx + o * s, by - 6 * s - h * s - w / 4 * s, w / 2 - 1, 7, s, "#ffd27a", "#fff1c9"); });
    CK.flag(x, cx - 2 * s, by - 54 * s, s, t); }],
  ["mayapur", "Mayapur temple", 5, 2500, 1, 40, 1.6, ["chaitanya", "nityananda", "prabhupada", "radha", "krishna", "rupa", "haridasa"], null, (x, cx, by, s, t) => {
    CK.shadow(x, cx, by, 44, s); CK.plinth(x, cx, by, 40, s, "#f6f1e6", "#d9cfba"); CK.box(x, cx, by - 4 * s, 32, 16, 16, s, "#fbf8f1", "#e2d9c5", "#d4c9b2");
    [[-22, 10, 14], [22, 10, 14], [0, 20, 30]].forEach(([o, w, h]) => { const y0 = by - 20 * s - (o ? 0 : 8 * s); CK.dome(x, cx + o * s, y0, w, h, s, "#3f6fd1", null); x.fillStyle = "#ffd27a"; x.fillRect(cx + o * s - w * s, y0 - 1 * s, w * 2 * s, 2 * s); x.beginPath(); x.arc(cx + o * s, y0 - h * s - 2 * s, 2.6 * s, 0, 7); x.fill(); });
    CK.flag(x, cx, by - 62 * s, s, t); [-30, 30].forEach((o) => CK.flame(x, cx + o * s, by - 8 * s, s * 0.6, t)); }],
].map(([id, name, lv, price, limit, yieldc, size, cards, until, draw]) => ({ id, name, lv, price, limit, yieldc, size, cards, until, draw }));
const SETBY = Object.fromEntries(SETS.map((x) => [x.id, x]));

/* ---------- state ---------- */
const BGS = [["Vraja meadow", "#9fd17c", "#5f9e4c"], ["Yamuna banks", "#bfe3f5", "#7cb87a"], ["Sandy Vraja", "#f3dfb0", "#d6b77a"], ["Mayapur dusk", "#ffc58a", "#c97b58"], ["Night sky", "#2a2f6b", "#151836"], ["Lotus pink", "#ffd3e3", "#e79bb8"]];
const SIGNS = ["#f29a2e", "#e0566a", "#3f6fd1", "#6fc49a", "#8a55e0", "#2b1d36"];
function city() {
  if (!progress.city) {
    progress.city = { name: (progress.profile?.name ? progress.profile.name.split(" ")[0] + "'s Dham" : "My Dham"), bg: 0, bgCustom: null, sign: SIGNS[0], signSize: 1, signX: 0.5, signY: 0.08, sets: [], claims: 0, claimed: null };
    // Move from the old tile builder: refund everything that was built, plus expansions.
    const old = progress.dham; if (old && old.tiles) {
      const P = { grass: 5, garden: 15, road: 8, marble: 30, water: 25, kund: 90, tulsi: 40, kadamba: 70, banyan: 120, kutir: 150, goshala: 250, lamp: 35, gate: 900, temple: 600, grand: 1500, govardhan: 1200, ratha: 1000, cow: 80, calf: 50, peacock: 120, parrot: 40, devotee: 60, cowherd: 70, kirtan: 200 };
      let r = 0; Object.values(old.tiles).forEach((tl) => { r += (P[tl.g] || 0) + (P[tl.o] || 0); }); r += ({ 8: 500, 10: 2000, 12: 6000 })[old.size] || 0;
      if (r) { progress.coins = coinBal() + r; setTimeout(() => toast(`🏗️ My Dham has a new look! Your old builds were refunded: +${fmt(r)} 🪙`), 2500); }
      progress.dham = { migrated: true };
    }
    save();
  }
  return progress.city;
}
const dham = () => city();
function dhamValue() { return city().sets.reduce((a, x) => a + (SETBY[x.id]?.price || 0), 0); }
const ownedCount = (id) => city().sets.filter((x) => x.id === id).length;
const cityLevel = () => lvl(progress.xp || 0);
const dailyCoins = () => 20 + city().sets.filter((x) => !x.stored).reduce((a, x) => a + (SETBY[x.id]?.yieldc || 0), 0);

/* ---------- map ---------- */
let selUid = null, drag = null, cityRAF = 0, moveSign = false;
function bgColors() { const C2 = city(); if (C2.bgCustom) return [C2.bgCustom, CK.shade(C2.bgCustom, -40)]; const b = BGS[C2.bg] || BGS[0]; return [b[1], b[2]]; }
function drawCity(t = performance.now()) {
  const cv = $("#cityMap"); if (!cv || cv.offsetParent === null) return;
  const [x, w, h] = fit(cv), C2 = city(), [c1, c2] = bgColors(), s0 = w / 360;
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, w, h);
  if (C2.bg === 4 && !C2.bgCustom) { const r = seeded(3); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(t / 900 + i))})`; x.fillRect(r() * w, r() * h * 0.6, 1.5, 1.5); } }
  const r = seeded(11); x.fillStyle = "rgba(255,255,255,.18)"; for (let i = 0; i < 70; i++) { const px = r() * w, py = h * 0.18 + r() * h * 0.82; x.fillRect(px, py, 2 * s0, 1 * s0); }
  // a winding path for charm
  x.strokeStyle = "rgba(255,240,210,.35)"; x.lineWidth = 14 * s0; x.lineCap = "round"; x.beginPath(); x.moveTo(-10, h * 0.95); x.bezierCurveTo(w * 0.3, h * 0.7, w * 0.7, h * 0.85, w + 10, h * 0.55); x.stroke();
  const list = C2.sets.filter((q) => !q.stored).slice().sort((a, b) => a.y - b.y);
  for (const q of list) { const S = SETBY[q.id]; if (!S) continue; const cx = q.x * w, by = q.y * h, sc = s0 * S.size;
    x.save(); if (q.flip) { x.translate(cx, 0); x.scale(-1, 1); x.translate(-cx, 0); }
    if (q.uid === selUid) { x.strokeStyle = "rgba(255,210,122,.95)"; x.lineWidth = 2.5; x.setLineDash([6, 5]); x.beginPath(); x.ellipse(cx, by + 2 * sc, 40 * sc, 13 * sc, 0, 0, 7); x.stroke(); x.setLineDash([]); }
    try { S.draw(x, cx, by, sc, t); } catch (e) {} x.restore(); }
  // name sign
  const ss = s0 * (C2.signSize || 1), sx = C2.signX * w, sy = C2.signY * h; x.font = `${16 * ss}px 'Yatra One', Georgia, serif`; const tw = x.measureText(C2.name).width + 28 * ss;
  x.fillStyle = "rgba(0,0,0,.2)"; x.beginPath(); x.roundRect(sx - tw / 2 + 2, sy - 16 * ss + 3, tw, 32 * ss, 10 * ss); x.fill();
  x.fillStyle = C2.sign; x.beginPath(); x.roundRect(sx - tw / 2, sy - 16 * ss, tw, 32 * ss, 10 * ss); x.fill();
  x.strokeStyle = "rgba(255,255,255,.6)"; x.lineWidth = 1.5; x.stroke(); x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(C2.name, sx, sy + 1);
  if (!list.length) { x.fillStyle = "rgba(0,0,0,.45)"; x.font = `${12 * s0}px 'DM Mono', monospace`; x.fillText("Buy a set in the shop below to start your dham", w / 2, h * 0.55); }
  if (!RM && curTab === "dham") { cancelAnimationFrame(cityRAF); cityRAF = requestAnimationFrame(drawCity); }
}
function hitSet(px, py) { const cv = $("#cityMap"), w = cv.clientWidth, h = cv.clientHeight, s0 = w / 360;
  const list = city().sets.filter((q) => !q.stored).slice().sort((a, b) => b.y - a.y);
  for (const q of list) { const S = SETBY[q.id], R = 34 * s0 * S.size, cx = q.x * w, cy = q.y * h - R * 0.55; if (Math.abs(px - cx) < R && Math.abs(py - cy) < R * 0.9) return q; } return null; }
function hitSign(px, py) { const cv = $("#cityMap"), w = cv.clientWidth, h = cv.clientHeight, C2 = city(), ss = (w / 360) * (C2.signSize || 1); return Math.abs(px - C2.signX * w) < 90 * ss && Math.abs(py - C2.signY * h) < 18 * ss; }
function mapPt(e) { const r = $("#cityMap").getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r.width, r.height]; }
$("#cityMap").addEventListener("pointerdown", (e) => { const [px, py, w, h] = mapPt(e); const q = hitSet(px, py);
  if (q) { drag = { kind: "set", q, dx: q.x * w - px, dy: q.y * h - py, sx: px, sy: py, moved: false }; selUid = q.uid; }
  else if (hitSign(px, py)) { const C2 = city(); drag = { kind: "sign", dx: C2.signX * w - px, dy: C2.signY * h - py, sx: px, sy: py, moved: false }; }
  else { selUid = null; }
  try { e.target.setPointerCapture(e.pointerId); } catch (er) {} renderSelBar(); requestAnimationFrame(drawCity); });
$("#cityMap").addEventListener("pointermove", (e) => { if (!drag) return; const [px, py, w, h] = mapPt(e); if (Math.hypot(px - drag.sx, py - drag.sy) > 6) drag.moved = true; if (!drag.moved) return;
  const nx = Math.min(0.95, Math.max(0.05, (px + drag.dx) / w)), ny = Math.min(0.98, Math.max(drag.kind === "sign" ? 0.04 : 0.2, (py + drag.dy) / h));
  if (drag.kind === "set") { drag.q.x = nx; drag.q.y = ny; } else { city().signX = nx; city().signY = ny; } if (RM) drawCity(); });
const endDrag = () => { if (drag) { if (drag.moved) { progress.city = { ...city() }; save(); } drag = null; renderSelBar(); requestAnimationFrame(drawCity); } };
$("#cityMap").addEventListener("pointerup", endDrag); $("#cityMap").addEventListener("pointercancel", endDrag);
function renderSelBar() { const bar = $("#selBar"); const q = city().sets.find((x) => x.uid === selUid && !x.stored); if (!q) { bar.hidden = true; return; }
  const S = SETBY[q.id]; bar.hidden = false; bar.innerHTML = `<span style="min-width:0"><b>${esc(S.name)}</b><br><span class="eyebrow">Drag it on the map to move · +${S.yieldc} 🪙 a day</span></span>
    <span class="jbtns" style="margin:0"><button class="btn ghost sm" id="selFlip">⇋ Flip</button><button class="btn ghost sm" id="selStore">📦 Store</button><button class="btn sm" id="selDone">Done</button></span>`;
  $("#selFlip").onclick = () => { q.flip = !q.flip; progress.city = { ...city() }; save(); requestAnimationFrame(drawCity); };
  $("#selStore").onclick = () => { q.stored = true; selUid = null; progress.city = { ...city() }; save(); renderCity(); toast("Stored. It still counts as owned; place it again from below the map."); };
  $("#selDone").onclick = () => { selUid = null; renderSelBar(); requestAnimationFrame(drawCity); }; }

/* ---------- daily reward ---------- */
function msToMidnight() { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); return m - n; }
function renderDaily() { const el = $("#cityDaily"), C2 = city(), done = C2.claimed === localDate();
  if (done) { const ms = msToMidnight(); el.className = "daily done"; el.innerHTML = `<span><b>Dham reward claimed ✓</b><span>Next reward in ${Math.floor(ms / 36e5)}h ${Math.floor(ms % 36e5 / 6e4)}m</span></span>`; return; }
  el.className = "daily"; el.innerHTML = `<span><b>Daily dham reward</b><span>${fmt(dailyCoins())} 🪙 + a photocard from your sets</span></span><button class="btn sm" id="claimBtn">Claim</button>`;
  $("#claimBtn").onclick = claimDaily; }
function grantCard(id, goldChance) { const own = progress.cards || {}, prev = own[id], gold = Math.random() < goldChance;
  progress.cards = { ...own, [id]: { n: (prev?.n || 0) + 1, gold: !!(prev?.gold || gold) } }; return { c: CARDS.find((c) => c[0] === id), gold, dupe: !!prev }; }
function claimDaily() { const C2 = city(); if (C2.claimed === localDate()) return;
  const fe = todayEvent(), coins = Math.round(dailyCoins() * comboMult() * (fe ? 2 : 1)); const pool = C2.sets.filter((q) => !q.stored).flatMap((q) => SETBY[q.id]?.cards || []).filter((id) => CARDS.some((c) => c[0] === id));
  const id = pool.length ? pool[Math.random() * pool.length | 0] : CARDS[Math.random() * CARDS.length | 0][0]; const card = grantCard(id, 0.1);
  C2.claimed = localDate(); C2.claims = (C2.claims || 0) + 1; progress.city = { ...C2 }; progress.coins = coinBal() + coins; progress.coinsAll = (progress.coinsAll || 0) + coins; save();
  rewardQ.push({ c: coins, why: "Daily dham reward" + (fe ? " · ×2 festival" : ""), card, item: `🛕 from ${C2.sets.filter((q) => !q.stored).length} set${C2.sets.length === 1 ? "" : "s"}` }); pumpRewards();
  renderAlbum(); renderDaily(); renderDhamHUD(); checkAwards(); }

/* ---------- shop ---------- */
function setStatus(S) { const lvOk = cityLevel() >= S.lv, own = ownedCount(S.id), limHit = S.limit && own >= S.limit, expired = S.until && localDate() > S.until;
  return { lvOk, own, limHit, expired, afford: coinBal() >= S.price }; }
function renderShop() { const L = cityLevel();
  const list = SETS.filter((S) => !(S.until && localDate() > S.until)).slice().sort((a, b) => ((L >= a.lv) === (L >= b.lv) ? 0 : L >= a.lv ? -1 : 1) || a.lv - b.lv || a.price - b.price || b.cards.length - a.cards.length);
  $("#setShop").innerHTML = list.map((S) => { const st = setStatus(S), emo = S.cards.map((id) => CARDS.find((c) => c[0] === id)?.[3]).filter(Boolean).slice(0, 7).join("");
    const btn = !st.lvOk ? `<button class="btn ghost" disabled>🔒 Reach ${RANKS[S.lv][1]}</button>` : st.limHit ? `<button class="btn ghost" disabled>Limit reached</button>`
      : `<button class="btn ${st.afford ? "" : "ghost"}" data-buy-set="${S.id}" id="buy-${S.id}">${S.price ? `Buy · ${fmt(S.price)} 🪙` : "Get free"}</button>`;
    return `<div class="setcard ${st.lvOk ? "" : "locked"}"><canvas data-prev="${S.id}" aria-hidden="true"></canvas><div class="sb"><div class="nm">${esc(S.name)}</div>
      <div class="meta"><span class="lv">Lv ${S.lv + 1}</span><span>+${S.yieldc} 🪙/day</span>${S.limit ? `<span class="lim">${S.limit} per player</span>` : ""}${S.until ? `<span class="lim">⏰ until ${pretty(S.until)}</span>` : ""}${st.own ? `<span>Owned ${st.own}</span>` : ""}</div>
      <div class="pc" title="Possible photocards">${emo}</div><span class="eyebrow">${S.cards.length} possible card${S.cards.length === 1 ? "" : "s"}</span><div class="buy">${btn}</div></div></div>`; }).join("");
  document.querySelectorAll("#setShop canvas[data-prev]").forEach((cv) => { const [x, w, h] = fit(cv), S = SETBY[cv.dataset.prev]; try { S.draw(x, w / 2, h * 0.86, (w / 360) * 2.4 * Math.min(1, 1.2 / S.size), 0); } catch (e) {} }); }
document.addEventListener("click", (e) => { const b = e.target.closest("[data-buy-set]"); if (!b) return; const S = SETBY[b.dataset.buySet], st = setStatus(S);
  if (!st.lvOk || st.limHit) return; if (!st.afford) { toast(`You need ${fmt(S.price - coinBal())} more 🪙. Chant, quiz and play to earn coins.`); return; }
  const C2 = city(); progress.coins = coinBal() - S.price; const taken = C2.sets.filter((q) => !q.stored);
  let best = [0.5, 0.6], bd = -1; for (let i = 0; i < 30; i++) { const p = [0.15 + Math.random() * 0.7, 0.3 + Math.random() * 0.62]; const d = Math.min(1, ...taken.map((q) => Math.hypot(q.x - p[0], q.y - p[1]))); if (d > bd) { bd = d; best = p; } }
  const q = { uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), id: S.id, x: best[0], y: best[1], flip: false }; C2.sets.push(q); selUid = q.uid; progress.city = { ...C2 }; save();
  toast(`🛕 ${S.name} placed! Drag it anywhere on your map.`); renderCity(); scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); setTimeout(() => burstAt($("#cityMap")), 300); checkAwards(); });

/* ---------- stored sets, rename, customize ---------- */
function renderStored() { const st = city().sets.filter((q) => q.stored); $("#cityStored").innerHTML = st.map((q) => `<button data-place="${q.uid}">＋ Place ${esc(SETBY[q.id]?.name || q.id)}</button>`).join(""); }
$("#cityStored").addEventListener("click", (e) => { const b = e.target.closest("[data-place]"); if (!b) return; const q = city().sets.find((x) => x.uid === b.dataset.place); if (!q) return; q.stored = false; q.x = 0.5; q.y = 0.6; selUid = q.uid; progress.city = { ...city() }; save(); renderCity(); });
$("#cityRename").onclick = () => { const h = $("#cityName"); const inp = document.createElement("input"); inp.value = city().name; inp.maxLength = 28; inp.className = "renamer"; inp.setAttribute("aria-label", "Dham name");
  inp.style.cssText = "font:inherit;font-family:var(--f-display);font-size:1.5rem;width:100%;padding:6px 10px;border-radius:10px;border:1px solid var(--gold);background:var(--stone);color:var(--leaf)";
  h.replaceWith(inp); inp.focus(); inp.select(); const done = () => { const v = inp.value.trim(); if (v) { city().name = v; progress.city = { ...city() }; save(); } const nh = document.createElement("h2"); nh.id = "cityName"; nh.style.margin = "2px 0 0"; inp.replaceWith(nh); renderCity(); };
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") inp.blur(); }); inp.addEventListener("blur", done, { once: true }); };
function renderCustom() { const C2 = city();
  $("#ccBg").innerHTML = BGS.map((b, i) => `<button aria-label="${esc(b[0])}" aria-pressed="${!C2.bgCustom && C2.bg === i}" data-bg="${i}" style="background:linear-gradient(${b[1]},${b[2]})"></button>`).join("");
  $("#ccSign").innerHTML = SIGNS.map((c) => `<button aria-label="Sign colour ${c}" aria-pressed="${C2.sign === c}" data-sign="${c}" style="background:${c}"></button>`).join("");
  $("#ccBgPick").value = C2.bgCustom || BGS[C2.bg][1]; $("#ccSignPick").value = C2.sign; $("#ccSize").value = C2.signSize || 1; }
$("#cityCustom").onclick = () => { renderCustom(); $("#cityCustomSheet").hidden = false; };
$("#ccDone").onclick = () => { $("#cityCustomSheet").hidden = true; progress.city = { ...city() }; save(); renderCity(); };
$("#ccBg").onclick = (e) => { const b = e.target.closest("[data-bg]"); if (!b) return; city().bg = +b.dataset.bg; city().bgCustom = null; renderCustom(); drawCity(); };
$("#ccSign").onclick = (e) => { const b = e.target.closest("[data-sign]"); if (!b) return; city().sign = b.dataset.sign; renderCustom(); drawCity(); };
$("#ccBgPick").oninput = (e) => { city().bgCustom = e.target.value; renderCustom(); drawCity(); };
$("#ccSignPick").oninput = (e) => { city().sign = e.target.value; drawCity(); };
$("#ccSize").oninput = (e) => { city().signSize = +e.target.value; drawCity(); };

/* ---------- hooks used by the rest of the app ---------- */
function renderDhamHUD() { try { renderHeader(); } catch (e) {} if ($("#cityCoins")) $("#cityCoins").textContent = fmt(coinBal()); }
function renderCity() { const C2 = city(); $("#cityName").textContent = C2.name; const L = cityLevel();
  $("#cityLevel").textContent = `Level ${L + 1} dham · ${RANKS[L][1]} · ${C2.sets.length} set${C2.sets.length === 1 ? "" : "s"}`;
  renderDhamHUD(); renderDaily(); renderShop(); renderStored(); renderSelBar(); drawCity(); }
function renderDham() { renderCity(); try { renderSpin(); drawWheel(); } catch (e) {} }
const drawDham = drawCity;
setInterval(() => { if (curTab === "dham") try { renderDaily(); } catch (e) {} }, 60000);
try { if (curTab === "dham") renderDham(); } catch (e) {}
