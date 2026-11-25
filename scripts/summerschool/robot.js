// Builds the SO-101 robot from the model JSON (see simplify-so101.mjs) as a three.js scene graph.

import { BufferAttribute, BufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';

const decodeBase64 = (s) => {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
};

/** Returns { root, joints, base } where joints maps a joint name to { group, axis } and base lists the base meshes. */
export function buildRobot(data) {
  const materials = {
    '3d_printed': new MeshStandardMaterial({ color: 0xeef2ee, roughness: 0.75, metalness: 0, flatShading: true }),
    sts3215: new MeshStandardMaterial({ color: 0x262d29, roughness: 0.6, metalness: 0.1, flatShading: true }),
  };
  const links = {};
  const hasParent = {};
  const joints = {};

  Object.keys(data.links).forEach((name) => {
    const group = new Group();
    data.links[name].forEach((m) => {
      const q = new Uint16Array(decodeBase64(m.p));
      const pos = new Float32Array(q.length);
      for (let i = 0; i < q.length; i++) pos[i] = m.lo[i % 3] + (q[i] / 65535) * m.span[i % 3];
      const index = m.i32 ? new Uint32Array(decodeBase64(m.i)) : new Uint16Array(decodeBase64(m.i));
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(pos, 3));
      geometry.setIndex(new BufferAttribute(index, 1));
      group.add(new Mesh(geometry, materials[m.mat] || materials['3d_printed']));
    });
    links[name] = group;
  });

  data.joints.forEach((j) => {
    if (!links[j.parent] || !links[j.child]) return;
    const origin = new Group();
    const moving = new Group();
    origin.position.set(j.xyz[0], j.xyz[1], j.xyz[2]);
    origin.rotation.set(j.rpy[0], j.rpy[1], j.rpy[2], 'ZYX');
    origin.add(moving);
    moving.add(links[j.child]);
    links[j.parent].add(origin);
    hasParent[j.child] = true;
    joints[j.name] = { group: moving, axis: new Vector3(j.axis[0], j.axis[1], j.axis[2]).normalize() };
  });

  // The URDF is Z-up; the scene is Y-up.
  const root = new Group();
  root.rotation.x = -Math.PI / 2;
  Object.keys(links).forEach((name) => {
    if (!hasParent[name]) root.add(links[name]);
  });

  // Only the base's own meshes (not the arm hanging off it), for clicking on the base.
  const base = links.base_link ? links.base_link.children.filter((c) => c.isMesh) : [];
  return { root, joints, base };
}
