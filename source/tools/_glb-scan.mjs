import fs from 'fs'
import zlib from 'zlib'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
const DIR = 'public/3d/models/'
const files = process.argv.slice(2)
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder)
for (const f of files) {
  let buf = fs.readFileSync(DIR + f); if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf); const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const g = await new Promise((res, rej) => loader.parse(ab, '', res, rej))
  g.scene.updateMatrixWorld(true)
  const rows = []
  g.scene.traverse(o => { if (!o.isMesh) return; const b = new THREE.Box3().setFromObject(o); const i = o.geometry.index; rows.push({ n: o.name, t: Math.round((i ? i.count : o.geometry.attributes.position.count) / 3), min: b.min.toArray().map(v => +v.toFixed(1)), max: b.max.toArray().map(v => +v.toFixed(1)) }) })
  const south = rows.filter(r => r.min[2] > 3), east = rows.filter(r => r.min[0] > 41.2), main = rows.filter(r => !(r.min[2] > 3) && !(r.min[0] > 41.2))
  const span = rs => rs.length ? [Math.min(...rs.map(r => r.min[0])), Math.max(...rs.map(r => r.max[0])), Math.min(...rs.map(r => r.min[2])), Math.max(...rs.map(r => r.max[2])), Math.min(...rs.map(r => r.min[1])), Math.max(...rs.map(r => r.max[1]))].map(v => +v.toFixed(1)) : []
  const straddle = rows.filter(r => r.min[2] <= 3 && r.max[2] > 6)
  console.log(f, 'meshes', rows.length, '| south', south.length, span(south), '| east', east.length, '| main', main.length, span(main), '| straddle', straddle.length, straddle.slice(0, 3).map(r => r.n + ' t' + r.t + ' z' + r.min[2] + '..' + r.max[2]).join('; '))
}
process.exit(0)
