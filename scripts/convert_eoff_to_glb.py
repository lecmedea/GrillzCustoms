#!/usr/bin/env python3
"""Convert the supplied binary EOFF dental library into a browser-ready GLB arch."""

from __future__ import annotations

import argparse
import json
import math
import struct
from pathlib import Path

import numpy as np


def read_eoff(path: Path) -> tuple[np.ndarray, np.ndarray]:
    data = path.read_bytes()
    header = b"OFF BINARY\n"
    if not data.startswith(header):
        raise ValueError(f"Unsupported EOFF header: {path}")
    cursor = len(header)
    vertex_count, face_count, _ = struct.unpack_from("<III", data, cursor)
    cursor += 12
    vertices = np.frombuffer(data, dtype="<f4", count=vertex_count * 3, offset=cursor).reshape(-1, 3).copy()
    cursor += vertex_count * 12
    faces = np.empty((face_count, 3), dtype=np.uint32)
    for face_index in range(face_count):
        points = struct.unpack_from("<H", data, cursor)[0]
        cursor += 2
        if points != 3:
            raise ValueError(f"Only triangulated EOFF is supported ({path}, face {face_index})")
        faces[face_index] = struct.unpack_from("<III", data, cursor)
        cursor += 12
    return vertices, faces


def normals_for(vertices: np.ndarray, faces: np.ndarray) -> np.ndarray:
    normals = np.zeros_like(vertices, dtype=np.float32)
    triangles = vertices[faces]
    face_normals = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
    for corner in range(3):
        np.add.at(normals, faces[:, corner], face_normals)
    length = np.linalg.norm(normals, axis=1, keepdims=True)
    normals /= np.where(length > 1e-8, length, 1)
    return normals


def pad4(data: bytes) -> bytes:
    return data + b"\0" * ((-len(data)) % 4)


def build_arch(source: Path, output: Path) -> None:
    jaw_sources = {
        jaw: {index: read_eoff(source / jaw / f"{index}.eoff") for index in range(1, 6)}
        for jaw in ("upperjaw", "lowerjaw")
    }
    # FDI front ten teeth: central incisor through second premolar on each side.
    rows = {
        "upperjaw": ([11, 12, 13, 14, 15], [21, 22, 23, 24, 25], 5.5),
        "lowerjaw": ([41, 42, 43, 44, 45], [31, 32, 33, 34, 35], -5.4),
    }
    document: dict = {
        "asset": {"version": "2.0", "generator": "Grillz Customs EOFF dental converter"},
        "scene": 0,
        "scenes": [{"nodes": []}],
        "nodes": [],
        "meshes": [],
        "materials": [{
            "name": "anatomical-enamel",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.96, 0.82, 0.36, 1.0],
                "metallicFactor": 0.9,
                "roughnessFactor": 0.22,
            },
        }],
        "buffers": [{"byteLength": 0}],
        "bufferViews": [],
        "accessors": [],
    }
    binary = bytearray()

    def add_view(payload: bytes, target: int) -> int:
        nonlocal binary
        payload = pad4(payload)
        offset = len(binary)
        binary.extend(payload)
        document["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(payload), "target": target})
        return len(document["bufferViews"]) - 1

    def add_accessor(view: int, component: int, count: int, kind: str, values: np.ndarray) -> int:
        accessor = {"bufferView": view, "componentType": component, "count": count, "type": kind}
        if kind == "VEC3":
            accessor["min"] = values.min(axis=0).astype(float).tolist()
            accessor["max"] = values.max(axis=0).astype(float).tolist()
        document["accessors"].append(accessor)
        return len(document["accessors"]) - 1

    for jaw, (right_ids, left_ids, row_y) in rows.items():
        for side, tooth_ids in ((-1, right_ids), (1, left_ids)):
            for position, tooth_id in enumerate(tooth_ids, start=1):
                source_vertices, faces = jaw_sources[jaw][position]
                vertices = source_vertices - source_vertices.mean(axis=0)
                # EOFF Z is the tooth's long axis. Map it vertically and place crowns in a U-shaped arch.
                vertices = vertices[:, [0, 2, 1]]
                vertices[:, 1] *= 0.72
                vertices[:, 2] *= 0.82
                if side > 0:
                    vertices[:, 0] *= -1
                    faces = faces[:, [0, 2, 1]]
                angle = math.radians(7 + position * 8)
                x = side * (2.7 + (position - 1) * 5.0)
                z = -((position - 1) ** 1.55) * 1.28
                c, s = math.cos(side * angle), math.sin(side * angle)
                rotation = np.array([[c, 0, -s], [0, 1, 0], [s, 0, c]], dtype=np.float32)
                vertices = vertices @ rotation.T
                vertices += np.array([x, row_y, z], dtype=np.float32)
                normals = normals_for(vertices, faces)

                position_view = add_view(vertices.astype("<f4").tobytes(), 34962)
                normal_view = add_view(normals.astype("<f4").tobytes(), 34962)
                index_view = add_view(faces.astype("<u4").reshape(-1).tobytes(), 34963)
                position_accessor = add_accessor(position_view, 5126, len(vertices), "VEC3", vertices)
                normal_accessor = add_accessor(normal_view, 5126, len(normals), "VEC3", normals)
                index_accessor = add_accessor(index_view, 5125, faces.size, "SCALAR", faces.reshape(-1))
                document["meshes"].append({
                    "name": f"tooth_{tooth_id}",
                    "primitives": [{
                        "attributes": {"POSITION": position_accessor, "NORMAL": normal_accessor},
                        "indices": index_accessor,
                        "material": 0,
                    }],
                })
                document["nodes"].append({"name": f"tooth_{tooth_id}", "mesh": len(document["meshes"]) - 1})
                document["scenes"][0]["nodes"].append(len(document["nodes"]) - 1)

    document["buffers"][0]["byteLength"] = len(binary)
    json_chunk = pad4(json.dumps(document, separators=(",", ":")).encode("utf-8")).replace(b"\0", b" ")
    binary_chunk = pad4(bytes(binary))
    total = 12 + 8 + len(json_chunk) + 8 + len(binary_chunk)
    glb = bytearray(struct.pack("<4sII", b"glTF", 2, total))
    glb.extend(struct.pack("<I4s", len(json_chunk), b"JSON"))
    glb.extend(json_chunk)
    glb.extend(struct.pack("<I4s", len(binary_chunk), b"BIN\0"))
    glb.extend(binary_chunk)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(glb)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing upperjaw/ and lowerjaw/")
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build_arch(args.source, args.output)
