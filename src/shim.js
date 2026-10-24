// Native + storage layer for the Parampara Vault app.
// The app code was written against a small `claude.use("db")` / `claude.use("user")`
// interface; this file provides that interface on the phone:
//   - progress is saved on the device (localStorage, mirrored to native Preferences)
//   - scrolls, quiz packs and the festival calendar come from the bundled content bank,
//     topped up by an optional remote content.json (no accounts, read-only)
//   - native extras: daily reminder notification, share, haptics, back button, backup/restore
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { App } from "@capacitor/app";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SCROLLS, PACKS, EVENTS } from "./content/bank.js";

const CFG = __APP_CONFIG__;
const isNative = Capacitor.isNativePlatform();
const K = { progress: "pv.progress", start: "pv.start", uid: "pv.uid", remote: "pv.remote" };

const pad = (n) => String(n).padStart(2, "0");
const localDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return localDate(d); };
const daysBetween = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5);
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

/* ---------- device identity (no account) ---------- */
let uid = ls.get(K.uid);
if (!uid) { uid = "dev_" + Math.random().toString(36).slice(2, 12); ls.set(K.uid, uid); }
let start = ls.get(K.start);
if (!start) { start = localDate(); ls.set(K.start, start); }

/* ---------- durable progress ---------- */
let restored = (async () => {
  // If the WebView storage was wiped but native Preferences still has a copy, bring it back.
  try {
    const { value } = await Preferences.get({ key: K.progress });
    const local = ls.get(K.progress);
    if (value && !local) ls.set(K.progress, value);
    if (value && local) {
      const a = JSON.parse(local), b = JSON.parse(value);
      if ((b.xp || 0) > (a.xp || 0)) ls.set(K.progress, value);
    }
    const s = await Preferences.get({ key: K.start });
    if (s.value && s.value < start) { start = s.value; ls.set(K.start, start); }
    else await Preferences.set({ key: K.start, value: start });
  } catch {}
})();
let mirrorT = null;
function saveProgress(data) {
  const json = JSON.stringify(data);
  ls.set(K.progress, json);
  clearTimeout(mirrorT);
  mirrorT = setTimeout(() => Preferences.set({ key: K.progress, value: json }).catch(() => {}), 300);
}

/* ---------- content: bundled bank + optional remote top-up ---------- */
let remote = { days: [], packs: [], events: [] };
try { remote = { ...remote, ...JSON.parse(ls.get(K.remote) || "{}") }; } catch {}
const listeners = { days: new Set(), packs: new Set(), events: new Set() };

function contentDays() {
  const today = localDate(), n = Math.max(0, daysBetween(start, today)), out = new Map();
  for (let k = 0; k <= n; k++) {
    const date = addDays(start, k);
    out.set(date, { ...SCROLLS[k % SCROLLS.length], date });
  }
  for (const d of remote.days || []) if (d && d.date && d.date <= today && d.question) out.set(d.date, d);
  return [...out.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}
function contentPacks() {
  const today = localDate(), n = Math.max(0, daysBetween(start, today)), out = new Map();
  for (let k = 0; k <= n; k++) {
    const date = addDays(start, k);
    out.set(date, { date, questions: PACKS[k % PACKS.length], remix: k >= PACKS.length });
  }
  for (const p of remote.packs || []) if (p && p.date && p.date <= today && Array.isArray(p.questions)) out.set(p.date, p);
  return [...out.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}
function contentEvents() {
  const m = new Map();
  for (const e of [...EVENTS, ...(remote.events || [])]) if (e && e.date) m.set(e.date + e.name, e);
  return [...m.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}
const snapOf = (arr) => ({ docs: arr.map((d, i) => ({ id: d.date || String(i), data: () => d })), size: arr.length, empty: !arr.length });
function emit(kind) {
  for (const fn of listeners[kind]) {
    try {
      if (kind === "days") fn(snapOf(contentDays()));
      else if (kind === "packs") fn(snapOf(contentPacks()));
      else fn({ exists: true, data: () => ({ items: contentEvents() }) });
    } catch (e) { console.error(e); }
  }
}
async function fetchRemote() {
  if (!CFG.remoteContentUrl) return;
  try {
    const r = await fetch(CFG.remoteContentUrl + "?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) return;
    const j = await r.json();
    remote = { days: j.days || [], packs: j.packs || [], events: j.events || [] };
    ls.set(K.remote, JSON.stringify(remote));
    emit("days"); emit("packs"); emit("events");
  } catch {}
}
// Refresh when the day rolls over while the app stays open, and when it comes back to the front.
let lastDay = localDate();
setInterval(() => { if (localDate() !== lastDay) { lastDay = localDate(); emit("days"); emit("packs"); emit("events"); } }, 30000);

/* ---------- the db / user interface the app expects ---------- */
const db = {
  doc(path) {
    if (path.includes("/progress")) return {
      async get() { await restored; const v = ls.get(K.progress); return { exists: !!v, data: () => (v ? JSON.parse(v) : undefined) }; },
      async set(d) { saveProgress(d); },
      onSnapshot() { return () => {}; },
    };
    if (path === "events/calendar") return {
      async get() { return { exists: true, data: () => ({ items: contentEvents() }) }; },
      async set() {},
      onSnapshot(next) { listeners.events.add(next); next({ exists: true, data: () => ({ items: contentEvents() }) }); return () => listeners.events.delete(next); },
    };
    return { async get() { return { exists: false, data: () => undefined }; }, async set() {}, onSnapshot(n) { n({ exists: false, data: () => undefined }); return () => {}; } };
  },
  collection(path) {
    const q = {
      orderBy() { return q; }, where() { return q; }, limit() { return q; },
      async get() { return snapOf(path === "days" ? contentDays() : path === "packs" ? contentPacks() : []); },
      onSnapshot(next) {
        if (path === "days" || path === "packs") { listeners[path].add(next); emit(path); return () => listeners[path].delete(next); }
        next(snapOf([])); return () => {};
      },
    };
    return q;
  },
};
const user = { async id() { return uid; }, async profiles() { return {}; }, async me() { return { id: uid, name: "" }; } };
window.claude = { use: async (name) => (name === "db" ? db : name === "user" ? user : null) };

/* ---------- native extras for the page ---------- */
const REMINDER_ID = 108;
window.Native = {
  isNative,
  version: CFG.version,
  releasesUrl: CFG.releasesUrl,
  async reminderStatus() {
    if (!isNative) return { supported: false };
    try {
      const p = await LocalNotifications.checkPermissions();
      const { notifications } = await LocalNotifications.getPending();
      const n = notifications.find((x) => x.id === REMINDER_ID);
      return { supported: true, granted: p.display === "granted", on: !!n, hour: n?.schedule?.on?.hour, minute: n?.schedule?.on?.minute };
    } catch { return { supported: true, granted: false, on: false }; }
  },
  async setReminder(hour, minute) {
    if (!isNative) return { ok: false, why: "web" };
    let p = await LocalNotifications.checkPermissions();
    if (p.display !== "granted") p = await LocalNotifications.requestPermissions();
    if (p.display !== "granted") return { ok: false, why: "denied" };
    try { await LocalNotifications.createChannel({ id: "scroll", name: "Daily scroll", description: "Your sealed scroll and japa reminder", importance: 5, sound: undefined, vibration: true, lights: true, lightColor: "#F29A2E" }); } catch {}
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] }).catch(() => {});
    await LocalNotifications.schedule({ notifications: [{
      id: REMINDER_ID, channelId: "scroll",
      title: "🔒 Tonight's scroll is sealed",
      body: "Answer yesterday's question to break the seal. Your japa and coins are waiting.",
      schedule: { on: { hour, minute }, allowWhileIdle: true },
      smallIcon: "ic_stat_lotus", iconColor: "#F29A2E",
    }] });
    return { ok: true };
  },
  async cancelReminder() { if (isNative) await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] }).catch(() => {}); },
  async share(title, text) {
    const url = CFG.releasesUrl;
    try { await Share.share({ title, text, url, dialogTitle: title }); return true; }
    catch {
      try { await navigator.clipboard.writeText(`${text} ${url}`); return "copied"; } catch { return false; }
    }
  },
  tap() { if (isNative) Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); },
  thump() { if (isNative) Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}); },
  async backup() {
    const data = JSON.stringify({ app: "parampara-vault", v: 1, saved: new Date().toISOString(), start, progress: JSON.parse(ls.get(K.progress) || "{}") });
    const name = `parampara-vault-backup-${localDate()}.json`;
    if (isNative) {
      const w = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ title: "Parampara Vault backup", text: "My Parampara Vault progress backup", files: [w.uri], dialogTitle: "Save or send your backup" });
      return true;
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = name; a.click(); return true;
  },
  async restore(text) {
    const j = JSON.parse(text);
    if (j.app !== "parampara-vault" || !j.progress) throw new Error("not a vault backup");
    if (j.start) { start = j.start; ls.set(K.start, start); await Preferences.set({ key: K.start, value: start }).catch(() => {}); }
    const json = JSON.stringify(j.progress);
    ls.set(K.progress, json);
    await Preferences.set({ key: K.progress, value: json }).catch(() => {});
    return true;
  },
  async flush() { clearTimeout(mirrorT); const v = ls.get(K.progress); if (v) await Preferences.set({ key: K.progress, value: v }).catch(() => {}); },
  setStatusBar(dark) { if (isNative) { StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {}); StatusBar.setBackgroundColor({ color: dark ? "#0d0b17" : "#fdf6ee" }).catch(() => {}); } },
};

if (isNative) {
  App.addListener("backButton", () => {
    const handled = typeof window.__onBack === "function" && window.__onBack();
    if (!handled) App.minimizeApp();
  });
  App.addListener("appStateChange", ({ isActive }) => {
    if (!isActive) window.Native.flush();
    else { fetchRemote(); if (localDate() !== lastDay) { lastDay = localDate(); emit("days"); emit("packs"); emit("events"); } }
  });
  LocalNotifications.addListener("localNotificationActionPerformed", () => { try { window.__onOpenScroll && window.__onOpenScroll(); } catch {} });
}
fetchRemote();
