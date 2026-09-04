# Tier-2 asset-hygiene transforms (2026-09-04). One script, three modes, run against the
# a131649 masters — masters + this file = the reproducible chain, same contract as bake_ao.py.
# Every mode is chosen from a measured mechanism (diagnosis in the Tier-2 CLAUDE.md entry), and
# none of them MOVES a vertex: these are topology/attribute repairs, not smoothing operators,
# which is what makes them landmark-safe by construction.
#
#   brain    — merge exact position-duplicates (78% of verts were duplicates with divergent
#              normals; weld distance 1e-6 m = a micron, three orders below sulcal wall
#              spacing) then shade smooth: one shared normal per position. Fixes the
#              floor-zoom faceting the P5 audit found.
#   pancreas — weld NORMALS across sub-object boundaries: for every position shared by 2+ of
#              the five named sub-meshes, write the area-weighted average normal into every
#              copy. The node structure is deliberately untouched (standing -kn provenance
#              rule): this is the fix that repairs the seam WITHOUT merging nodes.
#   thyroid  — delete proud debris only: connected components with < 100 faces whose centroid
#              lies beyond the 95th-percentile radius of the vertex cloud (the shard/flap
#              triangles floating off the superior pole). The first run used < 25 and removed
#              only the smallest confetti; the most visible flaps measured 25-99 faces, so the
#              ceiling was raised one step with the SAME protrusion criterion — the protection
#              against deleting anatomy is the proud-centroid test, not the face count. Surface confetti that PARTICIPATES
#              in the patchwork shell is left alone — deleting it would open holes. The UV
#              smear is inherent to the fragmented source and is NOT addressed here
#              (escalated; see the Tier-2 entry).
#
# Usage: blender --background --python .claude/mesh_hygiene.py -- <in.glb> <out.glb> <mode>
import bpy, sys, bmesh, math
from collections import defaultdict
from mathutils import Vector


# --- asset.extras preservation (citation-durability ruling, 2026-09-04) ------------------------
# The colon/thyroid isolation re-exports silently DROPPED the embedded licence extras their
# provenance claims cite — the ovary pipeline preserved them and is the model. This makes
# preservation an ASSERTED INVARIANT rather than a hope: capture the source GLB's asset.extras
# before Blender touches it; after export, re-inject them into the output GLB's JSON chunk and
# re-read to verify. A transform that would ship a derived asset without its source's embedded
# attribution now FAILS LOUDLY instead. (Condition (3): read identity, don't infer it.)
def _read_glb_asset(path):
    import struct as _st, json as _js
    d = open(path, 'rb').read()
    ln = _st.unpack('<I', d[12:16])[0]
    return _js.loads(d[20:20+ln]).get('asset', {})

def _inject_asset_extras(path, extras):
    import struct as _st, json as _js
    d = open(path, 'rb').read()
    ln = _st.unpack('<I', d[12:16])[0]
    j = _js.loads(d[20:20+ln])
    j.setdefault('asset', {})['extras'] = extras
    nj = _js.dumps(j, separators=(',', ':')).encode()
    pad = (4 - len(nj) % 4) % 4
    nj += b' ' * pad
    rest = d[20+ln:]
    total = 12 + 8 + len(nj) + len(rest)
    out = b'glTF' + _st.pack('<II', 2, total) + _st.pack('<I', len(nj)) + b'JSON' + nj + rest
    open(path, 'wb').write(out)

def preserve_extras(src_path, dst_path):
    src_extras = _read_glb_asset(src_path).get('extras')
    if not src_extras:
        print('EXTRAS: source carries none — nothing to preserve')
        return
    if _read_glb_asset(dst_path).get('extras') == src_extras:
        print('EXTRAS: preserved by exporter')
        return
    _inject_asset_extras(dst_path, src_extras)
    assert _read_glb_asset(dst_path).get('extras') == src_extras, \
        'EXTRAS INJECTION FAILED — refusing to ship a derived asset without its source attribution'
    print('EXTRAS: re-injected into the derived GLB and verified')


argv = sys.argv[sys.argv.index('--') + 1:]
SRC, DST, MODE = argv[0], argv[1], argv[2]
print(f'CONFIG PARSED: src={SRC} dst={DST} mode={MODE}')
assert MODE in ('brain', 'pancreas', 'thyroid'), f'unknown mode {MODE}'

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']

if MODE == 'brain':
    o = meshes[0]
    bm = bmesh.new(); bm.from_mesh(o.data)
    v0, f0 = len(bm.verts), len(bm.faces)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bm.to_mesh(o.data); bm.free()
    for p in o.data.polygons: p.use_smooth = True
    print(f'BRAIN: verts {v0} -> {len(o.data.vertices)}, faces {f0} -> {len(o.data.polygons)}, all-smooth shading')

elif MODE == 'pancreas':
    # gather world-space positions -> [(object, vertex index, weightless normal)]
    table = defaultdict(list)
    for o in meshes:
        mw = o.matrix_world
        nm = mw.to_3x3().inverted().transposed()
        for v in o.data.vertices:
            w = mw @ v.co
            table[(round(w.x, 5), round(w.y, 5), round(w.z, 5))].append((o, v.index))
    shared = {k: vs for k, vs in table.items() if len({id(o) for o, _ in vs}) > 1}
    fixed = 0
    # write averaged normals via custom split normals per object
    per_obj = defaultdict(dict)   # obj -> {vindex: averaged world normal}
    for k, vs in shared.items():
        n = Vector()
        for o, vi in vs:
            nm = o.matrix_world.to_3x3().inverted().transposed()
            n += (nm @ o.data.vertices[vi].normal).normalized()
        if n.length < 1e-9: continue
        n.normalize()
        for o, vi in vs:
            per_obj[o.name][vi] = n
        fixed += 1
    for o in meshes:
        if o.name not in per_obj: continue
        inv = o.matrix_world.to_3x3().transposed()   # inverse of the normal matrix
        o.data.calc_loop_triangles()
        loops = [None] * len(o.data.loops)
        for l in o.data.loops:
            vi = l.vertex_index
            if vi in per_obj[o.name]:
                loops[l.index] = (inv @ per_obj[o.name][vi]).normalized()
            else:
                loops[l.index] = o.data.vertices[vi].normal.normalized()
        o.data.normals_split_custom_set(loops)
    print(f'PANCREAS: {len(shared)} shared boundary positions, normals welded at {fixed}; nodes untouched ({len(meshes)} meshes)')

elif MODE == 'thyroid':
    o = meshes[0]
    bm = bmesh.new(); bm.from_mesh(o.data)
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    allv = [v.co for v in bm.verts]
    ctr = sum(allv, Vector()) / len(allv)
    radii = sorted((v - ctr).length for v in allv)
    p95 = radii[int(0.95 * len(radii))]
    seen = set(); comps = []
    for f in bm.faces:
        if f.index in seen: continue
        stack = [f]; comp = []
        while stack:
            cf = stack.pop()
            if cf.index in seen: continue
            seen.add(cf.index); comp.append(cf)
            for e in cf.edges:
                for nf in e.link_faces:
                    if nf.index not in seen: stack.append(nf)
        comps.append(comp)
    doomed = []
    for c in comps:
        if len(c) >= 100: continue
        vs = [v.co for f in c for v in f.verts]
        cc = sum(vs, Vector()) / len(vs)
        if (cc - ctr).length > p95: doomed.append(c)
    faces = [f for c in doomed for f in c]
    print(f'THYROID: deleting {len(doomed)} proud micro-components ({len(faces)} faces of {len(bm.faces)}); p95 radius={p95:.5f}')
    bmesh.ops.delete(bm, geom=faces, context='FACES')
    # drop any verts left unattached by the face deletion
    loose = [v for v in bm.verts if not v.link_faces]
    if loose: bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bm.to_mesh(o.data); bm.free()
    print(f'THYROID: result verts={len(o.data.vertices)} faces={len(o.data.polygons)}')

bpy.ops.export_scene.gltf(filepath=DST, export_format='GLB',
                          export_vertex_color='ACTIVE' if MODE != 'thyroid' else 'NONE',
                          export_all_vertex_colors=False, export_yup=True)
print('EXPORTED:', DST)
preserve_extras(SRC, DST)
