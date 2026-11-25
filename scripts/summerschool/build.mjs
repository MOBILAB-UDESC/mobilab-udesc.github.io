// Bundles hero.js (and the parts of three.js it uses) into static/summerschool/hero.js.
import { build } from 'esbuild';
import { statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const outfile = here('../../static/summerschool/hero.js');

await build({
  entryPoints: [here('./hero.js')],
  outfile,
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  legalComments: 'eof', // keeps three.js's MIT licence notice
  logLevel: 'info',
});

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`hero.js: ${kb(statSync(outfile).size)} (gzip ${kb(gzipSync(readFileSync(outfile)).length)})`);
