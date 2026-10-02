/* =========================================================
   TVA · cena 3D (three.js r128)
   Hall brutalista + Time Door + Linha do Tempo Sagrada
   que reage ao scroll e ao mouse e, no fim, vira árvore.
   ========================================================= */
(function () {
  'use strict';
  var TVA = window.TVA, $ = TVA.$, $$ = TVA.$$;
  if (!window.THREE) { TVA.initScene = function () { document.documentElement.classList.add('no-webgl'); }; return; }

  var Z0 = -10, Z1 = -340, TZ = -372;
  var DOOR_W = 3.0, DOOR_H = 5.0, DOOR_Y = 0.9;

  /* ---------- GLSL compartilhado: o caminho da linha (idêntico ao JS) ---------- */
  var PATH = [
    'uniform float uTime; uniform float uMorph; uniform vec3 uMouse; uniform float uMouseOn; uniform float uChaos;',
    'uniform float uCamZ; uniform float uReveal; uniform float uDanger; uniform float uPR;',
    'const float Z0 = ' + Z0.toFixed(1) + '; const float Z1 = ' + Z1.toFixed(1) + '; const float TZ = ' + TZ.toFixed(1) + ';',
    'vec3 baseCurve(float z){ float q = z - Z0; return vec3(sin(q*0.025)*3.0 + sin(q*0.011)*2.0, ' + DOOR_Y.toFixed(1) + ' + sin(q*0.04)*1.4, z); }',
    'vec3 linePos(float s, float r, float ph, float t, float bt, float ba){',
    '  float z = mix(Z0, Z1, t);',
    '  vec3 c = baseCurve(z);',
    '  float ang = ph + z*0.08 + uTime*0.25;',
    '  float rr = r*(0.65 + 0.35*sin(z*0.07 + ph*3.0)) * (1.0 + uChaos*2.5) * smoothstep(0.0, 0.03, t);',
    '  vec3 p = c + vec3(cos(ang)*rr, sin(ang)*rr, 0.0);',
    '  if (bt > 0.0) { float dz = max(0.0, t - bt) * (Z0 - Z1); p.xy += vec2(cos(ba), sin(ba)) * dz*dz*0.022; }',
    '  return p;',
    '}',
    'vec3 treePos(float s, float t){',
    '  float th = s*6.2831853;',
    '  if (t < 0.3) { float u = t/0.3; float r = 0.25 + 0.9*u*u; return vec3(cos(th*3.0)*r, mix(-10.0, 1.5, u), TZ + sin(th*3.0)*r); }',
    '  float u = (t-0.3)/0.7;',
    '  float R = u*(9.0 + 8.0*fract(s*13.7));',
    '  float curl = th + sin(u*3.0 + s*20.0)*0.35;',
    '  float y = 1.5 + u*(6.0 + 6.0*fract(s*7.3)) - u*u*2.5;',
    '  return vec3(cos(curl)*R*1.3, y + sin(curl)*R*0.55, TZ + sin(curl*2.0)*R*0.3);',
    '}',
    'vec3 pathPos(float s, float r, float ph, float t, float bt, float ba){',
    '  vec3 lp = linePos(s, r, ph, t, bt, ba);',
    '  float m = clamp(uMorph*1.7 - (1.0 - t)*0.7, 0.0, 1.0); m = m*m*(3.0-2.0*m);',
    '  vec3 p = mix(lp, treePos(s, t), m);',
    '  vec3 d = p - uMouse; float dl = length(d);',
    '  p += (d / max(dl, 0.001)) * uMouseOn * 1.7 * exp(-dl*dl*0.16);',
    '  p += vec3(sin(t*90.0 + s*40.0 + uTime*5.0), cos(t*70.0 + uTime*4.0), 0.0) * uChaos * 0.5;',
    '  return p;',
    '}'
  ].join('\n');
  function baseCurve(z, out) {
    var q = z - Z0;
    out.set(Math.sin(q * 0.025) * 3 + Math.sin(q * 0.011) * 2, DOOR_Y + Math.sin(q * 0.04) * 1.4, z);
    return out;
  }

  var STRAND_ATTR = 'attribute float aT; attribute float aS; attribute float aR; attribute float aPh; attribute float aBt; attribute float aBa; attribute float aMain;';
  var STRAND_COMMON = [
    'varying float vA; varying vec3 vC;',
    'void shade(vec3 p, float t){',
    '  float a = (0.22 + aMain*0.75) * uReveal;',
    '  vec3 col = mix(vec3(0.95, 0.72, 0.29), vec3(1.0, 0.86, 0.55), aMain);',
    '  if (aBt > 0.0) {',
    '    a = 0.7 * uReveal * step(aBt, t) * (1.0 - smoothstep(aBt + 0.045, aBt + 0.07, t));',
    '    float bz = mix(Z0, Z1, aBt);',
    '    float pr = smoothstep(bz - 6.0, bz - 18.0, uCamZ) * (1.0 - uMorph);',
    '    a *= (1.0 - pr) + pr*(1.0-pr)*6.0;',
    '    col = mix(vec3(1.0, 0.3, 0.18), vec3(1.0, 0.85, 0.6), pr);',
    '    a *= 1.0 - uMorph;',
    '  }',
    '  col = mix(col, vec3(1.0, 0.25, 0.15), uDanger*0.55);',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  float fd = -mv.z;',
    '  a *= clamp(1.25 - fd/(150.0 + uMorph*60.0), 0.0, 1.0) * smoothstep(0.2, 2.5, fd);',
    '  vA = a; vC = col;',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var GLOW_FRAG = [
    'varying float vA; varying vec3 vC;',
    'void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float g = smoothstep(0.5, 0.0, d); g = g*g;',
    '  gl_FragColor = vec4(vC * (g + smoothstep(0.12, 0.0, d)), vA * g); }'
  ].join('\n');

  var S = {}; // estado da cena

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- Hall: piso, pilares, luz ---------- */
  function buildHall(scene) {
    var g = new THREE.Group();
    var floorMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uFade: { value: 1 } },
      transparent: true, depthWrite: false,
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: [
        'uniform float uTime; uniform float uFade; varying vec3 vW;',
        'void main(){',
        '  vec2 gp = vW.xz / 2.4; vec2 gr = abs(fract(gp - 0.5) - 0.5) / fwidth(gp);',
        '  float line = 1.0 - min(min(gr.x, gr.y), 1.0);',
        '  float dDoor = length(vW.xz - vec2(0.0, 0.0));',
        '  float glow = exp(-dDoor*dDoor*0.018);',
        '  float streak = exp(-abs(vW.x)*1.6) * exp(-max(vW.z, 0.0)*0.12) * step(0.0, vW.z + 0.5);',
        '  vec3 base = vec3(0.07, 0.045, 0.03);',
        '  vec3 col = base + vec3(1.0,0.45,0.1)*(glow*0.55 + streak*0.45) + vec3(0.45,0.3,0.18)*line*0.18*(0.3+glow);',
        '  float fade = exp(-length(vW.xz)*0.035);',
        '  gl_FragColor = vec4(col, (0.92*fade + 0.08) * uFade);',
        '}'
      ].join('\n'),
      extensions: { derivatives: true }
    });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2;
    g.add(floor);

    var pillarMat = new THREE.MeshStandardMaterial({ color: 0x2c2019, roughness: 0.92, metalness: 0.0 });
    var pos = [];
    [-15, -8.5, 8.5, 15].forEach(function (x) { [14, 5, -4, -13, -22].forEach(function (z) { pos.push([x + (Math.abs(x) > 10 ? 0 : 0), z]); }); });
    var im = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 30, 1.8), pillarMat, pos.length);
    var m = new THREE.Matrix4();
    pos.forEach(function (p, i) { m.makeTranslation(p[0], 12.8, p[1]); im.setMatrixAt(i, m); });
    g.add(im);
    // vigas monumentais
    var beamMat = new THREE.MeshStandardMaterial({ color: 0x231912, roughness: 0.95 });
    for (var i = 0; i < 4; i++) {
      var beam = new THREE.Mesh(new THREE.BoxGeometry(34, 1.4, 1.4), beamMat);
      beam.position.set(0, 9 + i * 0.2, 10 - i * 9);
      g.add(beam);
    }
    var key = new THREE.PointLight(0xff7a1a, 7, 42, 1.6); key.position.set(0, DOOR_Y, 1.2); g.add(key);
    var back = new THREE.PointLight(0xffb36b, 2, 30, 2); back.position.set(0, 6, -10); g.add(back);
    scene.add(new THREE.AmbientLight(0x3b2a1e, 0.9));
    S.hallLight = key; S.floorMat = floorMat;
    scene.add(g);
    return g;
  }

  /* ---------- Time Door ---------- */
  function buildDoor(scene) {
    var g = new THREE.Group(); g.position.set(0, DOOR_Y, 0);
    var surf = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpen: { value: 0 }, uFlash: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: [
        'uniform float uTime; uniform float uOpen; uniform float uFlash; varying vec2 vUv;',
        'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }',
        'float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);',
        '  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }',
        'float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a*n(p); p *= 2.03; a *= 0.5; } return v; }',
        'void main(){',
        '  vec2 uv = vUv;',
        '  float open = step(abs(uv.y - 0.5)*2.0, uOpen);',
        '  float ex = min(uv.x, 1.0-uv.x) * ' + (DOOR_W / DOOR_H).toFixed(3) + '; float ey = min(uv.y, 1.0-uv.y);',
        '  float edge = min(ex, ey);',
        '  float f = fbm(vec2(uv.x*3.0, uv.y*5.0 - uTime*0.35));',
        '  float rip = sin(uv.y*42.0 + f*7.0 - uTime*2.6)*0.5 + 0.5;',
        '  float shimmer = smoothstep(0.55, 1.0, fbm(vec2(uv.x*9.0 + uTime*0.2, uv.y*14.0)));',
        '  vec3 col = mix(vec3(1.0, 0.36, 0.06), vec3(1.0, 0.78, 0.42), f);',
        '  float a = 0.14 + 0.22*f + 0.12*rip + shimmer*0.35 + smoothstep(0.06, 0.0, edge)*1.4;',
        '  a += uFlash*1.5;',
        '  gl_FragColor = vec4(col * a, 1.0) * open;',
        '}'
      ].join('\n')
    });
    var surface = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W, DOOR_H), surf);
    g.add(surface);

    // moldura: partículas no perímetro
    var PER = [
      'uniform float uTime; uniform float uOpen; uniform float uPR; uniform float uSize;',
      'vec3 perim(float u){ float W = ' + DOOR_W.toFixed(2) + ', H = ' + DOOR_H.toFixed(2) + '; float P = 2.0*(W+H); float d = u*P;',
      '  if (d < W) return vec3(-W*0.5 + d, H*0.5, 0.0); d -= W;',
      '  if (d < H) return vec3(W*0.5, H*0.5 - d, 0.0); d -= H;',
      '  if (d < W) return vec3(W*0.5 - d, -H*0.5, 0.0); d -= W;',
      '  return vec3(-W*0.5, -H*0.5 + d, 0.0); }'
    ].join('\n');
    var nF = TVA.mobile ? 900 : 1600;
    var fg = new THREE.BufferGeometry(), fU = new Float32Array(nF * 3), fp = new Float32Array(nF * 3);
    for (var i = 0; i < nF; i++) { fU[i * 3] = Math.random(); fU[i * 3 + 1] = Math.random(); fU[i * 3 + 2] = Math.random(); }
    fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
    fg.setAttribute('aSeed', new THREE.BufferAttribute(fU, 3));
    var frameMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpen: { value: 0 }, uPR: { value: 1 }, uSize: { value: 26 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: PER + '\nattribute vec3 aSeed; varying float vA; varying vec3 vC;\nvoid main(){\n' +
        '  vec3 p = perim(aSeed.x); p.y *= uOpen;\n' +
        '  vec2 nrm = abs(p.x) > ' + (DOOR_W / 2 - 0.01).toFixed(3) + ' ? vec2(sign(p.x), 0.0) : vec2(0.0, sign(p.y));\n' +
        '  float j = sin(uTime*(2.0 + aSeed.y*5.0) + aSeed.z*40.0);\n' +
        '  p.xy += nrm * (aSeed.y*aSeed.y*0.22*(0.6 + 0.4*j)); p.z += (aSeed.z - 0.5)*0.12;\n' +
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);\n' +
        '  gl_PointSize = uSize * uPR * (0.35 + aSeed.z*0.8) / -mv.z;\n' +
        '  vA = (0.5 + 0.5*j) * (1.0 - aSeed.y*0.6) * step(0.01, uOpen); vC = mix(vec3(1.0, 0.5, 0.12), vec3(1.0, 0.9, 0.7), aSeed.z*aSeed.z);\n' +
        '  gl_Position = projectionMatrix * mv;\n}',
      fragmentShader: GLOW_FRAG
    });
    var framePts = new THREE.Points(fg, frameMat); framePts.frustumCulled = false;
    g.add(framePts);

    // faíscas
    var nS = TVA.mobile ? 260 : 520;
    var sg = new THREE.BufferGeometry(), sSeed = new Float32Array(nS * 4), sp = new Float32Array(nS * 3);
    for (i = 0; i < nS * 4; i++) sSeed[i] = Math.random();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 4));
    var sparkMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpen: { value: 0 }, uPR: { value: 1 }, uSize: { value: 18 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: PER + '\nattribute vec4 aSeed; varying float vA; varying vec3 vC;\nvoid main(){\n' +
        '  float life = fract(uTime*(0.12 + aSeed.w*0.25) + aSeed.x);\n' +
        '  vec3 o = perim(aSeed.y); o.y *= uOpen;\n' +
        '  vec3 dir = normalize(vec3(o.x*0.6 + (aSeed.z-0.5)*1.5, o.y*0.25 + 0.4, (aSeed.w-0.5)*2.4));\n' +
        '  vec3 p = o + dir*life*(0.8 + aSeed.z*2.2) + vec3(0.0, -life*life*0.9, 0.0);\n' +
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);\n' +
        '  gl_PointSize = uSize * uPR * (1.0 - life) / -mv.z;\n' +
        '  vA = (1.0 - life) * smoothstep(0.0, 0.08, life) * step(0.5, uOpen); vC = vec3(1.0, 0.62 + life*0.3, 0.25);\n' +
        '  gl_Position = projectionMatrix * mv;\n}',
      fragmentShader: GLOW_FRAG
    });
    var sparks = new THREE.Points(sg, sparkMat); sparks.frustumCulled = false;
    g.add(sparks);

    // halo + streak anamórfico
    var haloMat = new THREE.ShaderMaterial({
      uniforms: { uI: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform float uI; varying vec2 vUv; void main(){ vec2 c = (vUv - 0.5)*vec2(1.6, 1.0); float d = length(c); float g = exp(-d*d*9.0)*0.55 + exp(-abs(c.y)*60.0)*exp(-abs(c.x)*2.2)*0.5; gl_FragColor = vec4(vec3(1.0,0.45,0.12)*g*uI, 1.0); }'
    });
    var halo = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), haloMat); halo.position.z = -0.05;
    g.add(halo);

    scene.add(g);
    S.door = { group: g, surf: surf, frame: frameMat, sparks: sparkMat, halo: haloMat };
  }

  /* ---------- Linha do Tempo Sagrada (fios + partículas) ---------- */
  function buildTimeline(scene) {
    var N = TVA.mobile ? 36 : 56, M = TVA.mobile ? 150 : 220, NB = 14;
    var total = N + NB;
    var strands = [];
    for (var i = 0; i < total; i++) {
      var isB = i >= N;
      strands.push({
        s: Math.random(), r: i === 0 ? 0 : (i < 4 ? rand(0.02, 0.12) : rand(0.08, 0.75)), ph: rand(0, 6.283),
        bt: isB ? 0.06 + (i - N) / NB * 0.8 + rand(-0.02, 0.02) : 0, ba: rand(0, 6.283), main: i < 4 ? 1 : 0
      });
    }
    var uniforms = {
      uTime: { value: 0 }, uMorph: { value: 0 }, uMouse: { value: new THREE.Vector3(0, -999, 0) }, uMouseOn: { value: 0 },
      uChaos: { value: 0 }, uCamZ: { value: 20 }, uReveal: { value: 0 }, uDanger: { value: 0 }, uPR: { value: 1 }, uSize: { value: 30 }
    };
    S.tl = uniforms;

    // linhas
    var lv = total * M, lg = new THREE.BufferGeometry();
    var attrs = { aT: new Float32Array(lv), aS: new Float32Array(lv), aR: new Float32Array(lv), aPh: new Float32Array(lv), aBt: new Float32Array(lv), aBa: new Float32Array(lv), aMain: new Float32Array(lv) };
    var idx = [];
    for (i = 0; i < total; i++) {
      var st = strands[i];
      for (var j = 0; j < M; j++) {
        var k = i * M + j, t = j / (M - 1);
        attrs.aT[k] = t; attrs.aS[k] = st.s; attrs.aR[k] = st.r; attrs.aPh[k] = st.ph; attrs.aBt[k] = st.bt; attrs.aBa[k] = st.ba; attrs.aMain[k] = st.main;
        if (j < M - 1) idx.push(k, k + 1);
      }
    }
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lv * 3), 3));
    Object.keys(attrs).forEach(function (n) { lg.setAttribute(n, new THREE.BufferAttribute(attrs[n], 1)); });
    lg.setIndex(idx);
    var lineMat = new THREE.ShaderMaterial({
      uniforms: uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: PATH + '\n' + STRAND_ATTR + '\n' + STRAND_COMMON + '\nvoid main(){ vec3 p = pathPos(aS, aR, aPh, aT, aBt, aBa); shade(p, aT); }',
      fragmentShader: 'varying float vA; varying vec3 vC; void main(){ gl_FragColor = vec4(vC, vA); }'
    });
    var lines = new THREE.LineSegments(lg, lineMat); lines.frustumCulled = false;
    scene.add(lines);

    // partículas fluindo ao longo dos fios
    var P = TVA.mobile ? 3200 : 9000, pg = new THREE.BufferGeometry();
    var pa = { aT: new Float32Array(P), aS: new Float32Array(P), aR: new Float32Array(P), aPh: new Float32Array(P), aBt: new Float32Array(P), aBa: new Float32Array(P), aMain: new Float32Array(P), aSpd: new Float32Array(P) };
    for (i = 0; i < P; i++) {
      var sti = i < P * 0.12 ? Math.floor(Math.random() * 4) : (i < P * 0.93 ? Math.floor(Math.random() * N) : N + Math.floor(Math.random() * NB));
      var s2 = strands[sti];
      pa.aT[i] = Math.random(); pa.aS[i] = s2.s; pa.aR[i] = s2.r; pa.aPh[i] = s2.ph; pa.aBt[i] = s2.bt; pa.aBa[i] = s2.ba; pa.aMain[i] = s2.main;
      pa.aSpd[i] = rand(0.002, 0.008) * (Math.random() < 0.5 ? 1 : 1.6);
      if (s2.bt) pa.aT[i] = s2.bt + Math.random() * 0.07;
    }
    pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P * 3), 3));
    Object.keys(pa).forEach(function (n) { pg.setAttribute(n, new THREE.BufferAttribute(pa[n], 1)); });
    var ptMat = new THREE.ShaderMaterial({
      uniforms: uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: PATH + '\nuniform float uSize;\n' + STRAND_ATTR + '\nattribute float aSpd;\n' + STRAND_COMMON +
        '\nvoid main(){ float t = aBt > 0.0 ? aBt + fract((aT - aBt)/0.07 + uTime*aSpd*4.0)*0.07 : fract(aT + uTime*aSpd);\n' +
        '  vec3 p = pathPos(aS, aR, aPh, t, aBt, aBa); shade(p, t);\n' +
        '  vA = min(1.0, vA * 2.2);\n' +
        '  gl_PointSize = uSize * uPR * (0.5 + aMain*0.7) / max(0.5, gl_Position.w); }',
      fragmentShader: GLOW_FRAG
    });
    var pts = new THREE.Points(pg, ptMat); pts.frustumCulled = false;
    scene.add(pts);

    // névoa luminosa (falso bloom) ao longo dos fios principais
    var HZ = TVA.mobile ? 500 : 1100, hg = new THREE.BufferGeometry();
    var ha = { aT: new Float32Array(HZ), aS: new Float32Array(HZ), aR: new Float32Array(HZ), aPh: new Float32Array(HZ), aBt: new Float32Array(HZ), aBa: new Float32Array(HZ), aMain: new Float32Array(HZ), aSpd: new Float32Array(HZ) };
    for (i = 0; i < HZ; i++) {
      var s3 = strands[Math.floor(Math.random() * 6)];
      ha.aT[i] = i / HZ; ha.aS[i] = s3.s; ha.aR[i] = s3.r; ha.aPh[i] = s3.ph; ha.aBt[i] = 0; ha.aBa[i] = 0; ha.aMain[i] = 1; ha.aSpd[i] = 0.0015;
    }
    hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(HZ * 3), 3));
    Object.keys(ha).forEach(function (n) { hg.setAttribute(n, new THREE.BufferAttribute(ha[n], 1)); });
    var hazeUniforms = Object.assign({}, uniforms, { uSize: { value: 1 } });
    S.hazeSize = hazeUniforms.uSize;
    var hazeMat = new THREE.ShaderMaterial({
      uniforms: hazeUniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: ptMat.vertexShader.replace('vA = min(1.0, vA * 2.2);', 'vA = vA * 0.06;'),
      fragmentShader: GLOW_FRAG
    });
    var haze = new THREE.Points(hg, hazeMat); haze.frustumCulled = false;
    scene.add(haze);

    // portais de era (anéis) ao longo da linha
    S.rings = [];
    var ringMat = new THREE.MeshBasicMaterial({ color: 0xffb000, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    S.ringMat = ringMat;
    [0.22, 0.38, 0.54, 0.70].forEach(function (at) {
      var z = camZFor(at) - 13, c = baseCurve(z, new THREE.Vector3());
      var ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.018, 6, 160), ringMat);
      ring.position.copy(c);
      var tick = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.008, 4, 160, Math.PI * 0.6), ringMat);
      ring.add(tick);
      scene.add(ring); S.rings.push(ring);
    });
    // anos monumentais flutuando ao lado de cada portal
    S.yearMats = [];
    var YEARS = [['1893', 0.22], ['1985', 0.38], ['2050', 0.54], ['2077', 0.70]];
    function makeYears() {
      YEARS.forEach(function (y, i) {
        var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 360;
        var c = cv.getContext('2d');
        c.font = '900 300px Archivo, "Arial Narrow", sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 6; c.strokeStyle = 'rgba(255,176,0,1)';
        c.strokeText(y[0], 512, 190);
        c.globalAlpha = 0.18; c.fillStyle = '#FFB000'; c.fillText(y[0], 512, 190);
        var tex = new THREE.CanvasTexture(cv);
        var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.2), mat);
        var z = camZFor(y[1] + 0.07) - 16, c3 = baseCurve(z, new THREE.Vector3());
        mesh.position.set(c3.x + (i % 2 ? -5.5 : 5.5), c3.y + 3.2, z);
        mesh.rotation.y = i % 2 ? 0.35 : -0.35;
        scene.add(mesh); S.yearMats.push({ mat: mat, z: z });
      });
    }
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(makeYears);
  }

  /* ---------- poeira temporal ---------- */
  function buildDust(scene) {
    var n = TVA.mobile ? 900 : 2000, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (var i = 0; i < n; i++) { p[i * 3] = rand(-30, 30); p[i * 3 + 1] = rand(-6, 20); p[i * 3 + 2] = rand(-400, 30); sd[i] = Math.random(); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    var mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPR: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'uniform float uTime; uniform float uPR; attribute float aS; varying float vA; varying vec3 vC;\nvoid main(){ vec3 p = position; p.y += sin(uTime*0.2 + aS*30.0)*0.6; p.x += cos(uTime*0.15 + aS*20.0)*0.5;\n vec4 mv = modelViewMatrix * vec4(p,1.0); float fd = -mv.z; gl_PointSize = (6.0 + aS*10.0) * uPR / fd; vA = (0.25 + aS*0.4) * clamp(1.0 - fd/90.0, 0.0, 1.0); vC = vec3(1.0, 0.75, 0.45); gl_Position = projectionMatrix * mv; }',
      fragmentShader: GLOW_FRAG
    });
    var pts = new THREE.Points(g, mat); pts.frustumCulled = false;
    scene.add(pts);
    S.dust = mat;
  }

  /* ---------- trajetória da câmera ---------- */
  function camZFor(tp) { return TVA.lerp(-4, -300, TVA.clamp((tp - 0.1) / 0.72, 0, 1)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function cameraTarget(heroP, tp, after, now, outPos, outLook) {
    var mob = innerWidth < 760;
    var heroPos = mob ? new THREE.Vector3(0, 0.4, 13) : new THREE.Vector3(-4.6, 0.3, 9.2);
    var heroLook = mob ? new THREE.Vector3(0, -1.6, 0) : new THREE.Vector3(-4.5, 1.0, 0);
    var nearPos = new THREE.Vector3(-1.2, 0.8, 6.2), nearLook = new THREE.Vector3(0, 0.9, 0);
    if (tp <= 0 && !after) {
      var h = ease(TVA.clamp(heroP, 0, 1));
      outPos.copy(heroPos).lerp(nearPos, h); outLook.copy(heroLook).lerp(nearLook, h);
      return;
    }
    var treePos = new THREE.Vector3(0, 4.5, TZ + 44), treeLook = new THREE.Vector3(0, 3.5, TZ);
    if (after) {
      var a = now * 0.00004;
      outPos.set(Math.sin(a) * 44, 4.5 + Math.sin(a * 3) * 2, TZ + Math.cos(a) * 44); outLook.copy(treeLook);
      return;
    }
    if (tp < 0.1) {
      // atravessar a porta
      var d = ease(tp / 0.1);
      baseCurve(-4, tmpA).add(new THREE.Vector3(0.8, 1.2, 0));
      outPos.copy(nearPos).lerp(tmpA, d);
      outLook.copy(nearLook).lerp(baseCurve(-22, tmpB), d);
      return;
    }
    var z = camZFor(tp);
    baseCurve(z + 3, outPos).add(new THREE.Vector3(Math.sin(z * 0.05) * 0.5 + 0.2, 1.1 + Math.cos(z * 0.03) * 0.3, 0));
    baseCurve(z - 30, outLook).add(new THREE.Vector3(0.1, 0.9, 0));
    if (tp > 0.82) {
      var m = ease(TVA.clamp((tp - 0.8) / 0.14, 0, 1));
      outPos.lerp(treePos, m); outLook.lerp(treeLook, m);
    }
  }

  /* ---------- inicialização ---------- */
  TVA.initScene = function () {
    var canvas = $('#gl');
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: (window.devicePixelRatio || 1) < 2, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { document.documentElement.classList.add('no-webgl'); return; }
    var pr = Math.min(window.devicePixelRatio || 1, TVA.mobile ? 1.5 : 1.75);
    renderer.setPixelRatio(pr);
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.setClearColor(0x0b0705, 1);

    var scene = new THREE.Scene();
    var fog = new THREE.FogExp2(0x0b0705, 0.03); scene.fog = fog;
    var camera = new THREE.PerspectiveCamera(TVA.mobile ? 55 : 45, innerWidth / innerHeight, 0.1, 600);

    var hall = buildHall(scene);
    buildDoor(scene);
    buildTimeline(scene);
    buildDust(scene);

    var sizeUniforms = function () {
      var p = renderer.getPixelRatio();
      S.tl.uPR.value = p; S.door.frame.uniforms.uPR.value = p; S.door.sparks.uniforms.uPR.value = p; S.dust.uniforms.uPR.value = p;
      var sc = innerHeight / 900;
      S.tl.uSize.value = 64 * sc * (TVA.mobile ? 1.2 : 1);
      S.hazeSize.value = 900 * sc;
      S.door.frame.uniforms.uSize.value = 26 * sc * 10; S.door.sparks.uniforms.uSize.value = 18 * sc * 10;
    };
    sizeUniforms();
    addEventListener('resize', function () {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth < 760 ? 55 : 45; camera.updateProjectionMatrix();
      sizeUniforms(); measure();
    });

    /* estado de scroll → cena */
    var heroEl = $('#hero'), orientEl = $('#orientacao'), linhaEl = $('#linha'), nexusEl = $('#nexus');
    var cinemaEls = $$('.cinema');
    var st = { heroP: 0, tp: 0, after: false, visible: 1, danger: 0, passed: false };
    var eraCards = $$('.era-card'), tsBar = $('#ts-bar'), lastEra = -1;
    function measure() { st.linhaTop = linhaEl.offsetTop; st.linhaH = linhaEl.offsetHeight; st.orientTop = orientEl.offsetTop; }
    measure();
    addEventListener('load', measure);
    function onScroll() {
      var y = scrollY;
      st.heroP = y / Math.max(1, st.orientTop + orientEl.offsetHeight * 0.4);
      var raw = (y - st.linhaTop) / Math.max(1, st.linhaH - innerHeight);
      st.tp = TVA.clamp(raw, 0, 1);
      st.after = raw > 1.02;
      if (raw < 0) st.tp = 0;
      // visibilidade do canvas: seções cinema na tela
      var vis = 0;
      for (var i = 0; i < cinemaEls.length; i++) {
        var r = cinemaEls[i].getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) { vis = Math.max(vis, (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / innerHeight * 3); }
      }
      vis = TVA.clamp(vis, 0, 1);
      var dark = TVA.theme === 'dark';
      st.visible = Math.max(vis, dark ? 0.55 : 0);
      canvas.style.opacity = st.visible.toFixed(3);
      document.querySelector('.vignette').style.setProperty('--vig', st.visible);
      var nr = nexusEl.getBoundingClientRect();
      st.danger = (nr.top < innerHeight * 0.6 && nr.bottom > innerHeight * 0.4) ? 1 : 0;
      // cards de era
      if (raw >= -0.05 && raw <= 1.05) {
        tsBar.style.width = (st.tp * 100) + '%';
        var cur = -1;
        eraCards.forEach(function (c, i) { if (st.tp >= parseFloat(c.dataset.at)) cur = i; });
        if (cur !== lastEra) {
          eraCards.forEach(function (c, i) { c.classList.toggle('on', i === cur); c.classList.toggle('past', i < cur); });
          if (cur >= 0) { TVA.setEra(eraCards[cur].dataset.year, eraCards[cur].dataset.name); if (lastEra >= 0 || cur > 0) TVA.sfx('whoosh'); }
          else TVA.setEra('—', 'Linha Sagrada');
          lastEra = cur;
        }
      }
      // atravessou a porta?
      var passed = st.tp > 0.065 || st.after;
      if (passed !== st.passed) {
        st.passed = passed;
        if (passed && TVA.ready) { TVA.sfx('door'); S.flash = 1; TVA.emit('door:pass'); }
      }
    }
    addEventListener('scroll', onScroll, { passive: true });
    TVA.on('theme', onScroll);
    onScroll();

    /* eventos de página */
    var chaosT = 0;
    TVA.on('pagenexus:start', function () { chaosT = 2.6; });
    TVA.on('ready', function () { S.opening = 0.0001; TVA.sfx('door'); });
    S.flash = 0;

    /* mouse → mundo */
    var ray = new THREE.Raycaster(), mv = new THREE.Vector2(), plane = new THREE.Plane(), pHit = new THREE.Vector3(), camDir = new THREE.Vector3();
    var camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), tPos = new THREE.Vector3(), tLook = new THREE.Vector3();
    cameraTarget(0, 0, false, 0, camPos, camLook);
    var parallax = new THREE.Vector2();
    var time = 0, accum = 0;

    TVA.loop(function (dt, now) {
      if (st.visible <= 0.001) return; // nada visível: não renderiza
      // em fundo atenuado (modo escuro sob seções de papel) roda a ~30fps
      if (st.visible < 0.9) { accum += dt; if (accum < 1 / 30) return; dt = accum; accum = 0; }
      time += dt * (TVA.reduced ? 0.25 : 1);

      // abertura da porta
      if (S.opening > 0 && S.opening < 1) S.opening = TVA.clamp(S.opening + dt * 0.7, 0.0001, 1);
      var open = S.opening ? 1 - Math.pow(1 - S.opening, 3) : 0;
      if (TVA.reduced && S.opening) open = 1;
      S.door.surf.uniforms.uOpen.value = open; S.door.frame.uniforms.uOpen.value = open; S.door.sparks.uniforms.uOpen.value = open;
      S.door.halo.uniforms.uI.value = open * (1 + Math.sin(time * 2.1) * 0.08);

      // câmera
      cameraTarget(st.heroP, st.tp, st.after, now, tPos, tLook);
      var mx = TVA.mouse.nx || 0, my = TVA.mouse.ny || 0;
      parallax.x += (mx - parallax.x) * 0.05; parallax.y += (my - parallax.y) * 0.05;
      var k = TVA.reduced ? 1 : 1 - Math.pow(0.0015, dt);
      camPos.lerp(tPos, k); camLook.lerp(tLook, k);
      var px = TVA.reduced ? 0 : parallax.x * (st.tp > 0 ? 0.6 : 0.9), py = TVA.reduced ? 0 : parallax.y * (st.tp > 0 ? 0.4 : 0.5);
      camera.position.set(camPos.x + px, camPos.y - py, camPos.z);
      camera.lookAt(camLook);
      if (st.tp > 0.1 && st.tp < 0.82 && !TVA.reduced) camera.rotateZ(Math.sin(time * 0.3) * 0.03 + parallax.x * -0.04);

      // linha
      var u = S.tl;
      u.uTime.value = time;
      u.uCamZ.value = camera.position.z;
      var reveal = st.passed ? 1 : 0;
      u.uReveal.value += (reveal - u.uReveal.value) * Math.min(1, dt * 3);
      var morph = st.after ? 1 : TVA.clamp((st.tp - 0.8) / 0.12, 0, 1);
      u.uMorph.value += (morph - u.uMorph.value) * Math.min(1, dt * (TVA.reduced ? 20 : 2.5));
      u.uDanger.value += (st.danger - u.uDanger.value) * Math.min(1, dt * 2);
      if (chaosT > 0) chaosT -= dt;
      var chaos = chaosT > 0 ? Math.min(1, chaosT) : 0;
      u.uChaos.value += (chaos + st.danger * 0.08 - u.uChaos.value) * Math.min(1, dt * 4);

      // mouse no mundo: interseção com plano perpendicular à câmera
      if (TVA.mouse.active && !TVA.reduced) {
        mv.set(mx, -my); ray.setFromCamera(mv, camera);
        camera.getWorldDirection(camDir);
        var focus = st.tp > 0.82 || st.after ? 44 : 14;
        plane.setFromNormalAndCoplanarPoint(camDir, camera.position.clone().addScaledVector(camDir, focus));
        if (ray.ray.intersectPlane(plane, pHit)) u.uMouse.value.lerp(pHit, 0.25);
        u.uMouseOn.value += ((st.passed ? 1 : 0) - u.uMouseOn.value) * 0.1;
      }

      // hall some ao atravessar
      hall.visible = camera.position.z > -30;
      S.door.group.visible = camera.position.z > -40;
      S.floorMat.uniforms.uFade.value = TVA.clamp((camera.position.z + 6) / 8, 0, 1);
      S.hallLight.intensity = 7 * open;

      // flash ao atravessar
      if (S.flash > 0) S.flash = Math.max(0, S.flash - dt * 1.8);
      S.door.surf.uniforms.uFlash.value = S.flash;
      S.door.surf.uniforms.uTime.value = time; S.door.frame.uniforms.uTime.value = time; S.door.sparks.uniforms.uTime.value = time;
      S.dust.uniforms.uTime.value = time;

      // névoa: hall denso, linha profunda, árvore aberta
      var fogT = st.passed ? (0.006 + (1 - u.uMorph.value) * 0.006) : 0.028;
      fog.density += (fogT - fog.density) * Math.min(1, dt * 2);

      // anéis de era
      S.ringMat.opacity = u.uReveal.value * (1 - u.uMorph.value) * 0.55;
      S.rings.forEach(function (r, i) { r.rotation.z = time * (i % 2 ? 0.12 : -0.1); });
      if (S.yearMats) S.yearMats.forEach(function (m) {
        // só o ano da era atual aparece: surge à frente e some ao ser ultrapassado
        var d = camera.position.z - m.z;
        var vis = TVA.clamp((52 - d) / 14, 0, 1) * TVA.clamp((d - 4) / 8, 0, 1);
        m.mat.opacity = u.uReveal.value * (1 - u.uMorph.value) * 0.9 * vis;
      });

      renderer.render(scene, camera);
    });
    TVA.scene = { state: st, uniforms: S, camera: camera, renderer: renderer };
  };
})();
