/* Shared 2D / 3D surface design. No remote assets, no photo transmission. */
(() => {
  'use strict';
  const cache = new Map();
  const palettes = {
    'yellow-gold':['#fff1b7','#d4a637','#9b6b14'], 'white-gold':['#ffffff','#c5cbd8','#6e788d'],
    'rose-gold':['#ffe0d4','#cf8b78','#854c42'], silver:['#ffffff','#bdc7cf','#6d7881'],
    chrome:['#e9f2fa','#a0adb7','#535e68'], 'faux-gold':['#ffe49e','#d1a43c','#8d641b'],
    premium:['#ffffff','#dce7f0','#8297ad']
  };
  const tones = { clear:['#ffffff','#8dabbf','#eaf7ff'], black:['#666a70','#080a0e','#222833'], pink:['#ffe3f4','#a83879','#f69ace'], blue:['#d3f4ff','#1967aa','#63bde8'] };
  const size = 256;
  const canvas = () => Object.assign(document.createElement('canvas'),{width:size,height:size});
  const key = (s,photo) => [photo,s.material,s.style,s.density,s.finish,s.tone,s.border,s.engraving].join('|');
  function surface(spec, photo = true) {
    const k=key(spec,photo);
    if(cache.has(k)) return cache.get(k);
    const color=canvas(),normal=canvas(),ctx=color.getContext('2d'),nc=normal.getContext('2d');
    nc.fillStyle='#8080ff'; nc.fillRect(0,0,size,size);
    const p=photo ? (palettes[spec.material] || palettes['yellow-gold']) : ['#ffffff','#d8d8d8','#969696'];
    const g=ctx.createLinearGradient(0,0,size,size*.25);
    [[0,p[2]],[.15,p[1]],[.32,p[0]],[.45,p[1]],[.7,p[2]],[.85,p[0]],[1,p[1]]].forEach(([at,c])=>g.addColorStop(at,c));
    ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
    const density=Number(spec.density)||3;
    const step=56-density*7;
    if(spec.style==='pineapple') {
      for(let y=-step;y<size+step;y+=step) for(let x=-step;x<size+step;x+=step) {
        const cx=x+(Math.round(y/step)%2)*step/2;
        [[p[0],'#6398e8',0,-step/2,step/2,0],[p[2],'#a365e8',0,step/2,-step/2,0]].forEach(([c,n,ax,ay,bx,by])=>{
          for(const [context,fill] of [[ctx,c],[nc,n]]) {
            context.beginPath();context.moveTo(cx,y);context.lineTo(cx+ax,y+ay);context.lineTo(cx+bx,y+by);context.closePath();context.fillStyle=fill;context.fill();
          }
        });
        ctx.strokeStyle='rgba(28,22,10,.4)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(cx,y-step/2);ctx.lineTo(cx+step/2,y);ctx.lineTo(cx,y+step/2);ctx.lineTo(cx-step/2,y);ctx.closePath();ctx.stroke();
      }
    } else if(['moissanite','diamond','diamond-dust'].includes(spec.style)) {
      const t=tones[spec.tone]||tones.clear;
      const gap=spec.style==='diamond-dust'?step*.5:step;
      for(let y=-gap;y<size+gap;y+=gap) for(let x=-gap;x<size+gap;x+=gap) {
        const cx=x+(Math.round(y/gap)%2)*gap/2, r=gap*.46;
        ctx.fillStyle=p[2];ctx.beginPath();ctx.arc(cx,y,r+1,0,Math.PI*2);ctx.fill();
        const points=spec.style==='moissanite'?6:8;
        for(let i=0;i<points;i++) {
          const a=i*Math.PI*2/points,b=(i+1)*Math.PI*2/points;
          for(const [context,fill] of [[ctx,t[i%3]],[nc,['#6896ed','#9d6bee','#8080ff'][i%3]]]) {
            context.beginPath();context.moveTo(cx,y);context.lineTo(cx+Math.cos(a)*r,y+Math.sin(a)*r);context.lineTo(cx+Math.cos(b)*r,y+Math.sin(b)*r);context.closePath();context.fillStyle=fill;context.fill();
          }
        }
        ctx.fillStyle=t[0];ctx.fillRect(cx-r*.45,y-r*.65,Math.max(1,r*.2),Math.max(1,r*.2));
      }
    } else if(spec.style==='laser') {
      ctx.strokeStyle=photo?'rgba(30,21,12,.6)':'#5c5c5c';ctx.lineWidth=2;
      for(let x=-size;x<size*2;x+=step) {
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+size,size);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x,size);ctx.lineTo(x+size,0);ctx.stroke();
      }
      if(spec.engraving) {
        ctx.fillStyle=p[1];ctx.fillRect(25,92,206,70);
        ctx.font='bold 64px Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillStyle=photo?'#4c351c':'#333333';ctx.fillText(spec.engraving,128,130,200);
        ctx.fillStyle=p[0];ctx.fillText(spec.engraving,126,128,200);
      }
    } else if(spec.style==='open-face') {
      const inset=25+(Number(spec.border)||3)*5;
      ctx.save();ctx.globalCompositeOperation='destination-out';
      ctx.beginPath();ctx.roundRect(inset,42,size-inset*2,173,32);ctx.fill();ctx.restore();
    }
    if(spec.finish==='satin' || spec.finish==='matte') {
      ctx.save();ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=spec.finish==='matte'?.28:.12;ctx.fillStyle=p[1];ctx.fillRect(0,0,size,size);ctx.restore();
    }
    const result={color,normal,key:k};cache.set(k,result);
    // Bounded CPU cache. model textures are separately capped / reused by the controller.
    if(cache.size>120) cache.delete(cache.keys().next().value);
    return result;
  }
  window.GrillzDesign={surface,key};
})();
