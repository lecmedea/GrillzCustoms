"""Package this bounded change without altering the real Git index or publishing it."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    'CHANGES-2026-09-18.md',
    'assets/grillz-constructor.js', 'assets/grillz-mouth-detect.js',
    'assets/grillz-design.js', 'assets/grillz-studio-v3.css',
    'assets/i18n.js', 'assets/site-common.js', 'assets/site-pages.css',
    'assets/stars.css', 'assets/studio-order-bridge.js',
    'assets/studio/models/gc-design-dental-arch.glb',
    'constructor.html', 'index.html', 'stars.html',
    'scripts/prepare_studio_model.py', 'scripts/package_studio_release.py',
    'tests/studio.test.cjs', 'tests/site.test.cjs',
]


def git(*args, env=None):
    return subprocess.check_output(['git', *args], cwd=ROOT, env=env)


def package(destination):
    destination.mkdir(parents=True, exist_ok=True)
    base = git('rev-parse', 'HEAD').decode().strip()
    manifest = {
        'base_commit': base,
        'status': 'local change only; not published',
        'files': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in FILES},
    }
    # Disposable index keeps the developer's staging area untouched.
    with tempfile.TemporaryDirectory(prefix='grillz-release-index-') as temp:
        env = {**os.environ, 'GIT_INDEX_FILE': str(Path(temp) / 'index')}
        git('read-tree', 'HEAD', env=env)
        git('add', '--', *FILES, env=env)
        patch = git('diff', '--cached', '--binary', 'HEAD', '--', *FILES, env=env)
    (destination / 'grillz-studio-stars.patch').write_bytes(patch)
    archive = destination / 'GrillzCustoms-update-2026-09-18.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
        for name in FILES:
            bundle.write(ROOT / name, 'GrillzCustoms-update/' + name)
        bundle.writestr('GrillzCustoms-update/RELEASE-MANIFEST.json', json.dumps(manifest, indent=2) + '\n')
    with zipfile.ZipFile(archive) as bundle:
        assert bundle.testzip() is None
        for name, digest in manifest['files'].items():
            assert hashlib.sha256(bundle.read('GrillzCustoms-update/' + name)).hexdigest() == digest
    print(f'{archive}: {archive.stat().st_size:,} bytes; {len(FILES)} source files verified')
    print(f'Binary patch: {len(patch):,} bytes; base {base}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    package(parser.parse_args().output.resolve())
