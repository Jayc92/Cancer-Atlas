"""Renders a 256px transparent-background thumbnail for one organ, Blender headless (Cycles).
Recreated for the Testis+Bladder pass — the prior session's copy lived only in /tmp and was
never committed. Two modes: `glb` imports a real asset (assets/bladder.glb); `sphere` recreates
a simple procedural organ's shape directly in Blender (there is no glTF file for a
Three.js-generated procedural mesh to import), matching the same non-uniform-scale ellipsoid
convention testis.js's own buildTestisMesh uses.

Usage:
  blender --background --python .claude/render_thumb.py -- glb assets/bladder.glb d9a8a0 out.png
  blender --background --python .claude/render_thumb.py -- sphere 0.6875,1.1,0.6875 d6b98f out.png
"""
import bpy, sys, math, mathutils

argv = sys.argv[sys.argv.index('--')+1:]
mode, spec, hexcolor, outpath = argv[0], argv[1], argv[2], argv[3]

for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16)/255.0 for i in (0, 2, 4)) + (1.0,)

if mode == 'glb':
    bpy.ops.import_scene.gltf(filepath=spec)
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
else:
    sx, sy, sz = (float(v) for v in spec.split(','))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=64, ring_count=32)
    obj = bpy.context.active_object
    obj.scale = (sx, sy, sz)
    bpy.ops.object.shade_smooth()
    meshes = [obj]

mat = bpy.data.materials.new(name='organ_mat')
mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = hex_to_rgb(hexcolor)
bsdf.inputs['Roughness'].default_value = 0.55
if 'Specular' in bsdf.inputs:
    bsdf.inputs['Specular'].default_value = 0.15
elif 'Specular IOR Level' in bsdf.inputs:
    bsdf.inputs['Specular IOR Level'].default_value = 0.15
for m in meshes:
    m.data.materials.clear()
    m.data.materials.append(mat)

# bounding box across every mesh, world space
import mathutils
min_v = mathutils.Vector((1e9, 1e9, 1e9))
max_v = mathutils.Vector((-1e9, -1e9, -1e9))
for m in meshes:
    for corner in m.bound_box:
        world = m.matrix_world @ mathutils.Vector(corner)
        min_v = mathutils.Vector(min(a, b) for a, b in zip(min_v, world))
        max_v = mathutils.Vector(max(a, b) for a, b in zip(max_v, world))
center = (min_v + max_v) / 2
radius = (max_v - min_v).length / 2

bpy.ops.object.light_add(type='SUN', location=(center.x+radius*2, center.y-radius*2, center.z+radius*3))
sun = bpy.context.active_object
sun.data.energy = 1.1
sun.rotation_euler = (math.radians(55), 0, math.radians(35))

world = bpy.data.worlds.new('World')
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (1, 1, 1, 1)
bg.inputs['Strength'].default_value = 0.35

cam_dist = radius / math.tan(math.radians(18)) * (1/0.74)
cam_pos = center + mathutils.Vector((0.55, -1.0, 0.55)).normalized() * cam_dist
bpy.ops.object.camera_add(location=cam_pos)
cam = bpy.context.active_object
direction = center - cam_pos
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
cam.data.lens_unit = 'FOV'
cam.data.angle = math.radians(36)
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.view_settings.view_transform = 'Standard'  # avoid AgX/Filmic desaturating the tissue hex colors
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.render.resolution_x = 256
scene.render.resolution_y = 256
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.filepath = outpath
bpy.ops.render.render(write_still=True)
print('WROTE', outpath)
