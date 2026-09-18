const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('modified HTML has no missing local scripts, styles, images or page links',()=>{
  for(const file of ['index.html','constructor.html','stars.html']) {
    const html=read(file);
    for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      const url=match[1].split(/[?#]/)[0];
      if(/^(https?:|mailto:|tel:|data:|javascript:|\/)/.test(url))continue;
      assert.ok(fs.existsSync(path.join(root,url)),file+' missing '+url);
    }
  }
});
test('new and changed browser scripts parse',()=>{
  for(const file of ['assets/grillz-constructor.js','assets/grillz-design.js','assets/grillz-mouth-detect.js','assets/i18n.js','assets/site-common.js','assets/studio-order-bridge.js']) new vm.Script(read(file),{filename:file});
});
test('gallery is static, has 18 real images and no comic runtime',()=>{
  const html=read('stars.html');assert.equal([...html.matchAll(/class="star-card"/g)].length,18);
  assert.ok(!html.includes('stars-comic.'));assert.ok(!html.includes('data-reveal'));assert.ok(html.includes('id="screenGallery"'));
});
test('mobile i18n rule does not hide stars or constructor',()=>{
  const css=read('assets/i18n.js');
  const hide=css.match(/@media \(max-width: 920px\)[\s\S]*?display: none !important;/)[0];
  assert.ok(!hide.includes('stars.html'));assert.ok(!hide.includes('constructor.html'));
});
test('all 42 photoreal base caps used by renderer exist',()=>{
  for(const mat of ['yellow-gold','white-gold','rose-gold','silver','chrome','faux-gold','premium']) for(let i=0;i<6;i++) {
    assert.ok(fs.existsSync(path.join(root,`assets/studio/photo/pieces/${mat}_polished_${i}.png`)));
  }
});
test('prepared GLB has 20 aligned shells, UVs, masked two-sided materials',()=>{
  const b=fs.readFileSync(path.join(root,'assets/studio/models/gc-design-dental-arch.glb'));
  assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(8),b.length);
  const doc=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
  const shells=doc.nodes.filter(n=>n.name?.startsWith('grillz_'));assert.equal(shells.length,20);
  for(const shell of shells) {
    const tooth=doc.nodes.find(n=>n.name===shell.name.replace('grillz_','tooth_'));
    assert.deepEqual(shell.translation,tooth.translation);
    shell.scale.forEach((s,i)=>assert.ok(Math.abs(s/tooth.scale[i]-1.012)<.0001));
    for(const p of doc.meshes[shell.mesh].primitives) {
      assert.equal(doc.accessors[p.attributes.TEXCOORD_0].count,doc.accessors[p.attributes.POSITION].count);
      assert.equal(doc.materials[p.material].alphaMode,'MASK');assert.equal(doc.materials[p.material].doubleSided,true);
    }
  }
});
