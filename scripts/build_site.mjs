// Bundle the SketchVerdict frontend for GitHub Pages (static files only).
// Usage: node scripts/build_site.mjs
// - esbuild bundles site/src/app.js (genlayer-js 1.1.8) -> dist/app.js
// - copies site/src/styles.css -> dist/styles.css
// - copies site/src/assets/*.b64 (demo drawings) -> dist/assets/
// - stamps ?v=<sha256 of dist/app.js, first 12 hex> onto the <script> tag in
//   index.html so a stale cached bundle can never produce a false cold-start
//   failure (the A1/A3 lesson).
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as esbuild from 'esbuild';

fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/assets', { recursive: true });
await esbuild.build({
  entryPoints: ['site/src/app.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/app.js',
  sourcemap: false,
  logLevel: 'info',
});
fs.copyFileSync('site/src/styles.css', 'dist/styles.css');
for (const f of fs.readdirSync('site/src/assets')) {
  fs.copyFileSync(`site/src/assets/${f}`, `dist/assets/${f}`);
}
const bundle = fs.readFileSync('dist/app.js');
const v = crypto.createHash('sha256').update(bundle).digest('hex').slice(0, 12);
const html = fs.readFileSync('index.html', 'utf8');
const stamped = html.replace(
  /src="dist\/app\.js(\?v=[0-9a-f]+)?"/,
  `src="dist/app.js?v=${v}"`);
if (stamped === html) throw new Error('script tag not found in index.html');
fs.writeFileSync('index.html', stamped);
console.log('site built: dist/app.js, dist/styles.css, dist/assets/, ?v=' + v);
