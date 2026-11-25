// Decimates the full-resolution SO-101 model for the summer school hero demo.
//
//   so101.full.json  (input, full resolution)  ->  ../../static/summerschool/so101.json
//
// The model format is the one the hero reads in hero.js: per link a list of
// meshes with 16-bit quantised positions ("lo" + "span" bounds, "p") and
// base64 indices ("i"), plus the joint tree. Only the meshes are touched here;
// joints are copied through unchanged.
//
// Usage: npm run model [-- --ratio 0.15 --error 0.01]

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { MeshoptSimplifier } from 'meshoptimizer';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? Number(process.argv[i + 1]) : fallback;
};
const RATIO = arg('ratio', 0.15); // fraction of triangles to keep
const ERROR = arg('error', 0.01); // max error, relative to each mesh's extent

const IN = here('./so101.full.json');
const OUT = here('../../static/summerschool/so101.json');

const decode = (s) => {
  const b = Buffer.from(s, 'base64');
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};
const encode = (typed) => Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength).toString('base64');

function simplifyMesh(m) {
  const q = new Uint16Array(decode(m.p));
  const pos = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) pos[i] = m.lo[i % 3] + (q[i] / 65535) * m.span[i % 3];
  const idx = new Uint32Array(m.i32 ? new Uint32Array(decode(m.i)) : new Uint16Array(decode(m.i)));

  const target = Math.floor((idx.length * RATIO) / 3) * 3;
  const [simplified] = MeshoptSimplifier.simplify(idx, pos, 3, target, ERROR);

  // Drop the vertices the simplified index buffer no longer uses and renumber
  // the rest in order of first use.
  const seen = new Int32Array(pos.length / 3).fill(-1);
  const remapped = new Uint32Array(simplified.length);
  const kept = [];
  for (let i = 0; i < simplified.length; i++) {
    const old = simplified[i];
    if (seen[old] === -1) {
      seen[old] = kept.length;
      kept.push(old);
    }
    remapped[i] = seen[old];
  }
  const unique = kept.length;
  const used = new Float32Array(unique * 3);
  kept.forEach((old, n) => used.set(pos.subarray(old * 3, old * 3 + 3), n * 3));

  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < used.length; i++) {
    lo[i % 3] = Math.min(lo[i % 3], used[i]);
    hi[i % 3] = Math.max(hi[i % 3], used[i]);
  }
  const span = hi.map((h, k) => Math.max(h - lo[k], 1e-9));
  const quant = new Uint16Array(used.length);
  for (let i = 0; i < used.length; i++) quant[i] = Math.round(((used[i] - lo[i % 3]) / span[i % 3]) * 65535);

  const i32 = unique > 65535;
  return {
    mat: m.mat,
    lo,
    span,
    nv: unique,
    i32,
    p: encode(quant),
    i: encode(i32 ? remapped : new Uint16Array(remapped)),
  };
}

await MeshoptSimplifier.ready;
const full = JSON.parse(readFileSync(IN, 'utf8'));
let trisBefore = 0;
let trisAfter = 0;
const links = {};
for (const [name, meshes] of Object.entries(full.links)) {
  links[name] = meshes.map((m) => {
    const out = simplifyMesh(m);
    trisBefore += (m.i32 ? new Uint32Array(decode(m.i)) : new Uint16Array(decode(m.i))).length / 3;
    trisAfter += (out.i32 ? new Uint32Array(decode(out.i)) : new Uint16Array(decode(out.i))).length / 3;
    return out;
  });
}

const json = JSON.stringify({ links, joints: full.joints });
writeFileSync(OUT, json);
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`triangles: ${trisBefore} -> ${trisAfter} (ratio ${RATIO}, error ${ERROR})`);
console.log(`so101.json: ${kb(statSync(IN).size)} -> ${kb(json.length)} (gzip ${kb(gzipSync(json).length)})`);
