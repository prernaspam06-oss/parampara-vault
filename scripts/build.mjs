// Builds the web bundle into www/ for Capacitor.
import { build, transform } from "esbuild";
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "www");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// App config: app.config.json, overridable by env vars in CI.
const cfg = JSON.parse(readFileSync(join(root, "app.config.json"), "utf8"));
cfg.version = process.env.APP_VERSION || JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;

await build({
  entryPoints: [join(root, "src/shim.js")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["chrome69"],
  outfile: join(out, "shim.js"),
  define: { __APP_CONFIG__: JSON.stringify(cfg) },
  logLevel: "warning",
});

// Fonts: copy the fontsource faces we use and write one stylesheet.
const faces = [
  ["yatra-one", ["400.css"]],
  ["kalam", ["400.css", "700.css"]],
  ["spectral", ["400.css", "600.css", "400-italic.css"]],
  ["dm-mono", ["400.css", "500.css"]],
];
let css = "";
for (const [pkg, files] of faces) {
  const src = join(root, "node_modules/@fontsource", pkg);
  cpSync(join(src, "files"), join(out, "fonts", pkg, "files"), { recursive: true });
  for (const f of files) css += readFileSync(join(src, f), "utf8").replaceAll("./files/", `./${pkg}/files/`) + "\n";
}
writeFileSync(join(out, "fonts", "fonts.css"), css);

// Transpile the page's inline scripts so older Android WebViews (Chrome 69+) can run them.
let html = readFileSync(join(root, "src/index.html"), "utf8").replace("/*CITY_JS*/", () => readFileSync(join(root, "src/city.js"), "utf8"));
const parts = html.split(/(<script>)([\s\S]*?)(<\/script>)/);
for (let i = 0; i < parts.length; i++) {
  if (parts[i] === "<script>") {
    const r = await transform(parts[i + 1], { loader: "js", target: "chrome69", minify: false });
    parts[i + 1] = r.code;
    i += 2;
  }
}
writeFileSync(join(out, "index.html"), parts.join(""));
if (existsSync(join(root, "src/assets"))) cpSync(join(root, "src/assets"), join(out, "assets"), { recursive: true });
console.log("Built www/ (version " + cfg.version + ")");
