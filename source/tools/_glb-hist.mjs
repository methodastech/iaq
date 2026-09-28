import fs from 'fs'; import zlib from 'zlib'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder)
const H = {}; let tot = 0
for (const f of process.argv.slice(2)) {
  let buf = fs.readFileSync('public/3d/models/' + f); if (buf[0] === 0x1f) buf = zlib.gunzipSync(buf)
  const g = await new Promise((res, rej) => loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', res, rej)); g.scene.updateMatrixWorld(true)
  g.scene.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position, idx = o.geometry.index, n = idx ? idx.count : p.count, v = new THREE.Vector3(), c = new THREE.Vector3()
    for (let t = 0; t < n; t += 3) { c.set(0, 0, 0); for (let k = 0; k < 3; k++) { v.fromBufferAttribute(p, idx ? idx.getX(t + k) : t + k).applyMatrix4(o.matrixWorld); c.add(v) } c.divideScalar(3)
      const zb = Math.floor(c.z / 2) * 2; const xb = c.x > 41.2 ? 'E' : 'M'; const key = xb + zb; H[key] = H[key] || [0, 1e9, -1e9]; H[key][0]++; H[key][1] = Math.min(H[key][1], c.y); H[key][2] = Math.max(H[key][2], c.y); tot++ } })
}
const ks = Object.keys(H).sort((a, b) => a[0].localeCompare(b[0]) || parseInt(a.slice(1)) - parseInt(b.slice(1)))
console.log(ks.map(k => `${k}:${H[k][0]}(y${H[k][1].toFixed(0)}..${H[k][2].toFixed(0)})`).join('  '))
process.exit(0)
