/* 25 Sep 2026: the third building removed at runtime, the model files kept as delivered. The site model carries
   three buildings: the main fab, the tall east annex and a lower utility building to the south on its own piles, with a
   short link to the fab. This script cuts the south building and its link out of the live scene as it streams in, so
   the model files in models/ stay exactly as delivered. It runs on this page by itself (/3d/, /3d/v3.html) and inside
   the home page's frame; the host (DevBuild3D.jsx) keeps its own copy only as a fallback and stands down when this has
   loaded (window.__iaqTrimLoaded).
   App coordinates: the south building is z > 20 west of the annex (x < 37.5); the link is x -15 to -2, z 2.5 to 20.
   A mesh wholly inside is emptied (draw range 0); a mesh that also carries fab geometry keeps only its triangles
   outside; an instanced part is dropped per instance. Each mesh and geometry is done once (userData.iaqTrim). */
(function () {
  window.__iaqTrimLoaded = true
  var CUT = function (x, z) { return (z > 20 && x < 37.5) || (z > 2.5 && z <= 20 && x > -15 && x < -2) }
  var R = [[-1e9, 37.5, 20, 1e9], [-15, -2, 2.5, 20]]
  var IdxAttr = null
  function findIdx (sc) {
    sc.traverse(function (o) {
      if (IdxAttr || !o.isMesh) return
      var ix = o.geometry && o.geometry.index
      if (ix && ix.array && !ix.isInterleavedBufferAttribute) { try { if (new ix.constructor(new Uint32Array([70000]), 1).array instanceof Uint32Array) IdxAttr = ix.constructor } catch (e) {} }
    })
  }
  function trim (sc) {
    if (!IdxAttr) findIdx(sc)
    if (!IdxAttr) return
    sc.traverse(function (o) {
      if (!o.isMesh || o.userData.iaqTrim) return
      var g = o.geometry; if (!g || !g.attributes || !g.attributes.position) return
      o.userData.iaqTrim = 1
      for (var a = o; a; a = a.parent) if (/third-person|move-marker/.test(a.name || '')) return
      o.updateWorldMatrix(true, false)
      var e = o.matrixWorld.elements, i, k
      if (o.isInstancedMesh) {
        var m = o.instanceMatrix.array, hit = 0
        for (i = 0; i < o.count; i++) {
          var tx = m[i * 16 + 12], ty = m[i * 16 + 13], tz = m[i * 16 + 14]
          if (CUT(e[0] * tx + e[4] * ty + e[8] * tz + e[12], e[2] * tx + e[6] * ty + e[10] * tz + e[14])) { for (k = 0; k < 16; k++) m[i * 16 + k] = 0; hit++ }
        }
        if (hit) o.instanceMatrix.needsUpdate = true
        return
      }
      if (g.userData.iaqTrim) return
      if (!g.boundingBox) g.computeBoundingBox()
      var bb = g.boundingBox, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9
      for (i = 0; i < 8; i++) {
        var lx = i & 1 ? bb.max.x : bb.min.x, ly = i & 2 ? bb.max.y : bb.min.y, lz = i & 4 ? bb.max.z : bb.min.z
        var x = e[0] * lx + e[4] * ly + e[8] * lz + e[12], z = e[2] * lx + e[6] * ly + e[10] * lz + e[14]
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z)
      }
      if (!R.some(function (r) { return x1 > r[0] && x0 < r[1] && z1 > r[2] && z0 < r[3] })) return
      g.userData.iaqTrim = 1
      if (R.some(function (r) { return x0 >= r[0] && x1 <= r[1] && z0 >= r[2] && z1 <= r[3] })) { g.setDrawRange(0, 0); return }
      var pos = g.attributes.position, ix = g.index, n = ix ? ix.count : pos.count
      var groups = g.groups && g.groups.length ? g.groups : [{ start: 0, count: n, materialIndex: 0 }]
      var keep = new Uint32Array(n), kk = 0, ng = []
      groups.forEach(function (gr) {
        var st = kk, end = Math.min(n, gr.start + gr.count)
        for (var t = gr.start; t + 2 < end; t += 3) {
          var cx = 0, cz = 0, v0, v1, v2
          for (var j = 0; j < 3; j++) {
            var id = ix ? ix.getX(t + j) : t + j
            if (j === 0) v0 = id; else if (j === 1) v1 = id; else v2 = id
            var px = pos.getX(id), py = pos.getY(id), pz = pos.getZ(id)
            cx += e[0] * px + e[4] * py + e[8] * pz + e[12]; cz += e[2] * px + e[6] * py + e[10] * pz + e[14]
          }
          if (CUT(cx / 3, cz / 3)) continue
          keep[kk++] = v0; keep[kk++] = v1; keep[kk++] = v2
        }
        ng.push({ start: st, count: kk - st, materialIndex: gr.materialIndex })
      })
      if (kk === n) return
      g.setIndex(new IdxAttr(keep.slice(0, kk), 1))
      if (g.groups && g.groups.length) { g.clearGroups(); ng.forEach(function (gr) { g.addGroup(gr.start, gr.count, gr.materialIndex) }) }
      g.setDrawRange(0, Infinity)
    })
  }
  function tick () { var sc = window.__iaqScene; if (sc) { try { trim(sc) } catch (e) {} } }
  setInterval(tick, 1000); tick()
})()
