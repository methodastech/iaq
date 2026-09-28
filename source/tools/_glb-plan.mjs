import fs from 'fs'; import zlib from 'zlib'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder)
const pts = []
const files = fs.readdirSync('public/3d/models').filter(f => /^(storey|structure|detail-shell|detail-frame|detail-equipment-lite|detail-pipes-lite|detail-tools-lite|detail-ducts-lite|detail-exterior)-.*\.glb$/.test(f) && !/phone/.test(f))
for (const f of files) {
  let buf = fs.readFileSync('public/3d/models/' + f); if (buf[0] === 0x1f) buf = zlib.gunzipSync(buf)
  const g = await new Promise((res, rej) => loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', res, rej)); g.scene.updateMatrixWorld(true)
  g.scene.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position, idx = o.geometry.index, n = idx ? idx.count : p.count, v = new THREE.Vector3(), c = new THREE.Vector3()
    const step = Math.max(3, Math.floor(n / 3 / 4000) * 3)
    for (let t = 0; t < n; t += step) { c.set(0, 0, 0); for (let k = 0; k < 3; k++) { v.fromBufferAttribute(p, idx ? idx.getX(t + k) : t + k).applyMatrix4(o.matrixWorld); c.add(v) } c.divideScalar(3); pts.push([+c.x.toFixed(1), +c.y.toFixed(1), +c.z.toFixed(1)]) } })
}
fs.writeFileSync(process.argv[2], JSON.stringify(pts)); console.log(files.length, 'files', pts.length, 'pts')
process.exit(0)
