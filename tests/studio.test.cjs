const {test}=require('node:test');
const assert=require('node:assert/strict');
global.location={origin:'https://grillzcustoms.ru',pathname:'/constructor.html',search:''};
const engine=require('../assets/grillz-constructor.js');
const reset=()=>engine.applyStateData(engine.createInitialState());

test('initial two caps are actually enabled',()=>{reset();assert.deepEqual(engine.activeTeeth(),['11','21']);});
test('photo anchors use separate image-space width and height',()=>{const f=engine.defaultFit('11');assert.ok(f.scaleY>f.scaleX);assert.equal(f.nx,.435);});
test('fit preserves zero coordinates and rejects non-finite input',()=>{
  const f=engine.normalizeFit({nx:0,ny:0,scaleX:Infinity,scaleY:NaN,rot:Infinity},'11');
  assert.equal(f.nx,0);assert.equal(f.ny,0);assert.ok(Object.values(f).every(Number.isFinite));
});
test('fit is bounded at every edge',()=>{
  const f=engine.normalizeFit({nx:-1,ny:3,scaleX:5,scaleY:-5,rot:200},'11');
  assert.deepEqual(f,{nx:0,ny:1,scaleX:.4,scaleY:.012,rot:Math.PI/2});
});
test('existing price table and set discounts are retained',()=>{
  reset();engine.applyLook('classic');
  assert.equal(engine.toothPrice({material:'yellow-gold',style:'polished',purity:'14k'}),32000);
  assert.equal(engine.buildQuote().total,182400);
  assert.equal(engine.setDiscount(5),0);assert.equal(engine.setDiscount(10),8);assert.equal(engine.setDiscount(16),12);
});
test('all 10 curated looks have legal unique teeth and complete specs',()=>{
  assert.equal(engine.LOOKS.length,10);
  engine.LOOKS.forEach(l=>{reset();engine.applyLook(l.id);assert.equal(engine.activeTeeth().length,l.teeth.length);assert.ok(engine.buildQuote().total>0);});
});
test('individual scope leaves other teeth unchanged',()=>{
  reset();engine.getState().scope='focus';engine.applySpec({material:'silver',style:'open-face'});
  assert.equal(engine.getState().teeth['11'].material,'silver');assert.equal(engine.getState().teeth['21'].material,'yellow-gold');
});
test('extended design and Cyrillic engraving survive share roundtrip',()=>{
  reset();engine.applyLook('initials');engine.applySpec({engraving:'ЛЁС',finish:'satin',density:5});
  const before=engine.getState().teeth['11'],hash=engine.encodeHash();reset();
  assert.ok(engine.decodeHash(hash));assert.deepEqual(engine.getState().teeth['11'],before);assert.ok(hash.length<700);
});
test('share does not contain photo data or private fit coordinates',()=>{
  reset();engine.getState().customPhoto=true;engine.getState().teeth['11'].fit.nx=.777;
  const hash=engine.encodeHash();assert.ok(!hash.includes('photo'));engine.decodeHash(hash);
  assert.equal(engine.getState().customPhoto,false);assert.equal(engine.getState().teeth['11'].fit.nx,.435);
});
test('empty design roundtrip stays empty and costs only mould',()=>{
  engine.applyStateData({version:3,teeth:{},mould:'studio'});const hash=engine.encodeHash();
  reset();assert.ok(engine.decodeHash(hash));assert.equal(engine.activeTeeth().length,0);assert.equal(engine.buildQuote().total,0);
});
test('old gc2 links still work',()=>{
  assert.ok(engine.decodeHash('gc2.studio.a.11.0.0.11ygpol4n_21ygpol4n'));
  assert.deepEqual(engine.activeTeeth(),['11','21']);
});
test('malformed share state is rejected without corrupting the build',()=>{
  reset();const hash=engine.encodeHash();
  ['#gc3.!!!','#gc3.'+'x'.repeat(19000),'#studio'].forEach(v=>{assert.equal(engine.decodeHash(v),false);assert.equal(engine.encodeHash(),hash);});
});
test('legacy fits are recalibrated; v3 stock fits persist',()=>{
  reset();let data=engine.getState();data.version=2;data.teeth['11'].fit.nx=.01;engine.applyStateData(data);
  assert.equal(engine.getState().teeth['11'].fit.nx,.435);
  data=engine.getState();data.teeth['11'].fit.nx=.44;engine.applyStateData(data);assert.equal(engine.getState().teeth['11'].fit.nx,.44);
});
test('engraving is bounded and cannot inject HTML',()=>{
  const s=engine.normalizeSpec({engraving:'<img onerror=alert(1)>',density:Infinity,border:-50});
  assert.match(s.engraving,/^[A-ZА-ЯЁ0-9]{0,3}$/);assert.equal(s.density,3);assert.equal(s.border,1);
});
