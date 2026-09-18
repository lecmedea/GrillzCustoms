"""Add per-tooth UVs to the existing anatomical GLB, retaining its fitted shells.

Reproducible, standard library only. Does not need the original dental scans.
Usage: python3 scripts/prepare_studio_model.py
"""
import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/studio/models/gc-anatomical-dental-arch.glb'
DEST = ROOT / 'assets/studio/models/gc-design-dental-arch.glb'

def build():
    raw = SOURCE.read_bytes()
    length = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + length])
    bin_start = 20 + length
    bin_length = struct.unpack_from('<I', raw, bin_start)[0]
    binary = bytearray(raw[bin_start + 8:bin_start + 8 + bin_length])
    for mesh in doc['meshes']:
        if not mesh.get('name', '').startswith('grillz_'):
            continue
        for prim in mesh['primitives']:
            acc = doc['accessors'][prim['attributes']['POSITION']]
            assert acc['componentType'] == 5122 and acc.get('normalized'), 'Expected normalized SHORT positions'
            view = doc['bufferViews'][acc['bufferView']]
            offset = view.get('byteOffset', 0) + acc.get('byteOffset', 0)
            stride = view.get('byteStride', 6)
            points = [struct.unpack_from('<hhh', binary, offset + i * stride) for i in range(acc['count'])]
            # Both sides use the same hole; no opaque back shell behind open-face windows.
            upper = mesh['name'].split('_')[-1][0] in '12'
            uv = [(max(0,min(1,(x/32767+1)/2)), max(0,min(1,(1-y/32767)/2 if upper else (1+y/32767)/2))) for x,y,z in points]
            while len(binary) % 4:
                binary.append(0)
            start = len(binary)
            binary.extend(b''.join(struct.pack('<ff',u,v) for u,v in uv))
            doc['bufferViews'].append({'buffer':0,'byteOffset':start,'byteLength':len(uv)*8,'target':34962})
            doc['accessors'].append({'bufferView':len(doc['bufferViews'])-1,'componentType':5126,'count':len(uv),'type':'VEC2','min':[0,0],'max':[1,1]})
            prim['attributes']['TEXCOORD_0'] = len(doc['accessors'])-1
            mat = doc['materials'][prim['material']]
            # Source mesh winding varies between mirrored arches. Keep the original two-sided surface.
            mat.update(alphaMode='MASK', alphaCutoff=0.45, doubleSided=True)
            mat['pbrMetallicRoughness']['baseColorFactor'] = [1,1,1,0]
    for node in doc['nodes']:
        if node.get('name','').startswith('gingiva_'):
            node['scale'][0] *= 1.10
            node['scale'][1] *= 0.58
            node['translation'][2] -= 1.5
    doc['asset']['generator'] = 'Grillz Customs fitted-shell UV preparation v1'
    doc['buffers'][0]['byteLength'] = len(binary)
    j = json.dumps(doc,separators=(',',':')).encode()
    j += b' ' * (-len(j) % 4)
    binary += b'\0' * (-len(binary) % 4)
    result = struct.pack('<4sII',b'glTF',2,28+len(j)+len(binary))
    result += struct.pack('<I4s',len(j),b'JSON')+j
    result += struct.pack('<I4s',len(binary),b'BIN\0')+binary
    DEST.write_bytes(result)
    print(f'{DEST.name}: {len(result):,} bytes; UVs added to fitted shells')

if __name__ == '__main__':
    build()
