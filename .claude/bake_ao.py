# 4B: bake per-vertex ambient occlusion into an organ GLB, offline.
#
# Blender 5.2 headless, Cycles CPU, FIXED seed and sample count so the bake is reproducible
# from the a131649 master + this script (the master stays the provenance root; this file is the
# recorded transform). AO rays are capped at a fraction of the organ's bounding diagonal --
# unlimited rays on a closed cm-scale organ let far internal geometry darken the whole shell.
#
# Bakes into a POINT-domain color attribute; all meshes stay in the scene during each bake so
# sub-meshes occlude each other (bladder's trigone under its dome is exactly the case).
import bpy, sys, json
argv = sys.argv[sys.argv.index('--') + 1:]
SRC, DST = argv[0], argv[1]
SAMPLES = int(argv[2]) if len(argv) > 2 else 128
DIST_FRAC = float(argv[3]) if len(argv) > 3 else 0.5
print(f'CONFIG PARSED: src={SRC} dst={DST} samples={SAMPLES} distFrac={DIST_FRAC}')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.seed = 0
sc.cycles.use_denoising = False

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
# organ-scale ray cap from the union bbox diagonal
import mathutils
pts = [o.matrix_world @ mathutils.Vector(c) for o in meshes for c in o.bound_box]
mn = mathutils.Vector((min(p[i] for p in pts) for i in range(3)))
mx = mathutils.Vector((max(p[i] for p in pts) for i in range(3)))
diag = (mx - mn).length
sc.render.bake.max_ray_distance = diag * DIST_FRAC
sc.render.bake.use_selected_to_active = False
print(f'BAKE SETUP: meshes={len(meshes)} bboxDiag={diag:.5f} rayMax={sc.render.bake.max_ray_distance:.5f}')

for o in meshes:
    # Cycles bakes require a material slot; the app replaces materials at runtime, so an
    # empty stub here changes nothing downstream.
    if not o.data.materials:
        o.data.materials.append(bpy.data.materials.new(name='bakestub'))
    ca = o.data.color_attributes.get('AO') or o.data.color_attributes.new('AO', 'FLOAT_COLOR', 'POINT')
    o.data.color_attributes.active_color = ca
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')
    vals = [d.color[0] for d in ca.data]
    print(f'BAKED: {o.name} verts={len(vals)} aoMin={min(vals):.3f} aoMax={max(vals):.3f} aoMean={sum(vals)/len(vals):.3f}')

bpy.ops.export_scene.gltf(filepath=DST, export_format='GLB', export_vertex_color='ACTIVE',
                          export_all_vertex_colors=False, export_yup=True)
print('EXPORTED:', DST)
