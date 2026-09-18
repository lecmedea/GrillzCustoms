/**
 * Grillz Customs — client-side mouth / tooth-slot detection
 * Uses MediaPipe Face Landmarker (browser) to estimate FDI tooth anchors
 * on a frontal smile/mouth photo. Not a clinical dental segmenter —
 * good enough for configurator placement, then user fine-tunes per tooth.
 *
 * Research notes (tools considered):
 * - SegmentAnyTooth (GitHub): strong on intraoral photos, needs Python/GPU server
 * - Dental X-ray U-Net / Detectron2: panoramic X-ray only, not smile selfies
 * - DilatedToothSegNet: 3D meshes, not 2D photos
 * - MediaPipe Face Landmarker (this module): runs fully in-browser, maps lip mesh → tooth slots
 * - HF dental models: usually X-ray/CBCT; deploy cost high for static Pages
 */
(() => {
  'use strict';

  const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
  const MP_MODEL =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

  // Classic Face Mesh lip / mouth indices (subset used for tooth-row estimate)
  const L_CORNER = 61;
  const R_CORNER = 291;
  const UPPER_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
  const LOWER_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];
  // outer upper lip for gum line bias
  const UPPER_OUTER = [37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267];

  let landmarker = null;
  let loading = null;

  async function ensureLandmarker() {
    if (landmarker) return landmarker;
    if (loading) return loading;
    loading = (async () => {
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
      const { FaceLandmarker, FilesetResolver } = vision;
      const fileset = await FilesetResolver.forVisionTasks(MP_WASM);
      landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MP_MODEL, delegate: 'GPU' },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });
      return landmarker;
    })().catch(async (err) => {
      // CPU fallback
      console.warn('FaceLandmarker GPU failed, retry CPU', err);
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
      const { FaceLandmarker, FilesetResolver } = vision;
      const fileset = await FilesetResolver.forVisionTasks(MP_WASM);
      landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MP_MODEL, delegate: 'CPU' },
        runningMode: 'IMAGE',
        numFaces: 1
      });
      return landmarker;
    });
    return loading;
  }

  function avgPoints(lms, idxs) {
    let x = 0;
    let y = 0;
    let n = 0;
    idxs.forEach((i) => {
      const p = lms[i];
      if (!p) return;
      x += p.x;
      y += p.y;
      n += 1;
    });
    if (!n) return { x: 0.5, y: 0.5 };
    return { x: x / n, y: y / n };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function pointOnPolyline(points, t) {
    if (!points.length) return { x: 0.5, y: 0.5 };
    if (points.length === 1) return points[0];
    const clamped = Math.max(0, Math.min(1, t));
    // accumulate length
    const seg = [];
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const len = Math.hypot(dx, dy) || 1e-6;
      seg.push(len);
      total += len;
    }
    let dist = clamped * total;
    for (let i = 0; i < seg.length; i++) {
      if (dist <= seg[i]) {
        const u = dist / seg[i];
        return {
          x: lerp(points[i].x, points[i + 1].x, u),
          y: lerp(points[i].y, points[i + 1].y, u)
        };
      }
      dist -= seg[i];
    }
    return points[points.length - 1];
  }

  function polyFromIdx(lms, idxs) {
    return idxs.map((i) => ({ x: lms[i].x, y: lms[i].y })).filter((p) => Number.isFinite(p.x));
  }

  /**
   * Build FDI tooth anchors from face landmarks.
   * Returns { anchors: { [fdi]: { nx, ny, scale, rot } }, mouthBox, confidence }
   */
  function anchorsFromLandmarks(lms, imageWidth=1, imageHeight=1) {
    if(!lms[L_CORNER]||!lms[R_CORNER]) return null;
    const upper=polyFromIdx(lms,UPPER_INNER).sort((a,b)=>a.x-b.x);
    const lower=polyFromIdx(lms,LOWER_INNER).sort((a,b)=>a.x-b.x);
    const left=lms[L_CORNER].x<lms[R_CORNER].x?lms[L_CORNER]:lms[R_CORNER];
    const right=left===lms[L_CORNER]?lms[R_CORNER]:lms[L_CORNER];
    const width=right.x-left.x;
    if(width<.03) return null;
    const positions=[.07,.14,.23,.33,.43,.57,.67,.77,.86,.93];
    const widths=[.045,.068,.1,.125,.17,.17,.125,.1,.068,.045];
    const anchors={};
    const rot=Math.atan2((right.y-left.y)*imageHeight,width*imageWidth);
    const rows=[['15','14','13','12','11','21','22','23','24','25'],['45','44','43','42','41','31','32','33','34','35']];
    rows.forEach((ids,row)=>ids.forEach((id,i)=>{
      const t=positions[i],a=pointOnPolyline(upper,t),b=pointOnPolyline(lower,t);
      const gap=Math.abs(b.y-a.y);
      const h=Math.max(gap*(row?.36:.58),width*imageWidth/imageHeight*.055);
      anchors[id]={nx:left.x+t*width,ny:row?b.y-h*.5:a.y+h*.5,
        scaleX:width*widths[i]*(row?.82:1),scaleY:h,rot:Math.max(-.65,Math.min(.65,rot))};
    }));
    return {anchors,mouthBox:{left:left.x,right:right.x,top:Math.min(...upper.map(p=>p.y)),bottom:Math.max(...lower.map(p=>p.y))},
      confidence:width>.12?.8:.5};
  }

  function clamp01(v) {
    return Math.max(0.02, Math.min(0.98, v));
  }

  /**
   * Fallback when face mesh fails: uniform arc in center of image
   * (assumes tight crop of mouth/smile).
   */
  function fallbackAnchors() {
    const UPPER = ['15', '14', '13', '12', '11', '21', '22', '23', '24', '25'];
    const LOWER = ['45', '44', '43', '42', '41', '31', '32', '33', '34', '35'];
    const anchors = {};
    const place = (ids, cy, scale) => {
      ids.forEach((id, i) => {
        const t = i / (ids.length - 1);
        const ang = Math.PI * (0.2 + t * 0.6);
        anchors[id] = {
          nx: 0.5 - Math.cos(ang) * 0.28,
          ny: cy + Math.sin(ang) * 0.04,
          scaleX: scale * .8,
          scaleY: scale * 1.5,
          rot: (t - 0.5) * 0.15
        };
      });
    };
    place(UPPER, 0.42, 0.085);
    place(LOWER, 0.62, 0.08);
    return { anchors, mouthBox: null, confidence: 0.35, fallback: true };
  }

  /**
   * @param {HTMLImageElement|ImageBitmap} image
   */
  async function detectToothAnchors(image) {
    try {
      const lm = await ensureLandmarker();
      const result = lm.detect(image);
      const faces = result.faceLandmarks || [];
      if (!faces.length) {
        return fallbackAnchors();
      }
      const built = anchorsFromLandmarks(faces[0], image.naturalWidth || image.width, image.naturalHeight || image.height);
      if (!built) return fallbackAnchors();
      return built;
    } catch (err) {
      console.warn('mouth detect failed', err);
      return fallbackAnchors();
    }
  }

  window.GrillzMouthDetect = {
    detectToothAnchors,
    ensureLandmarker,
    fallbackAnchors,
    notes: {
      browser: 'MediaPipe Face Landmarker (lip mesh → FDI slots)',
      research: [
        'https://github.com/thangngoc89/SegmentAnyTooth — intraoral segmentation (server)',
        'https://github.com/SerdarHelli/Segmentation-of-Teeth-in-Panoramic-X-ray-Image-Using-U-Net — X-ray only',
        'https://huggingface.co — search dental segmentation; mostly X-ray/CBCT weights'
      ]
    }
  };
})();
